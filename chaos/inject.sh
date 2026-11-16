#!/bin/bash
# The injections and rollbacks the experiments call, one subcommand each. Run from the repo root.
set -euo pipefail
PROJECT=inventory-api
OUT=chaos/out
LATENCY_DOC=AWSFIS-Run-Network-Latency-Sources
mkdir -p "$OUT"

# The fault window on the dashboard: ChaosFaultActive = 1 every 30 s, until stopped or timed out.
mark_start() {
  nohup bash -c "for _ in \$(seq $(($2 / 30))); do aws cloudwatch put-metric-data --namespace $PROJECT \
    --metric-name ChaosFaultActive --dimensions Experiment=$1 --value 1; sleep 30; done" > /dev/null 2>&1 &
  echo $! > "$OUT/mark-$1.pid"
}

stop_pid() {
  kill "$(cat "$1" 2> /dev/null)" 2> /dev/null || true
  rm -f "$1"
}

case "${1:-}" in
  # (a) 2 s of latency on the node's traffic to the partner's host only. The AWS document FIS runs,
  # sent through Systems Manager: it removes the delay itself after 300 s, or once it is cancelled.
  latency-start)
    # Outside chaos/out, which is uploaded as evidence: the partner's host stays out of it.
    PARAMS=$(mktemp)
    cat > "$PARAMS" << EOF
{"DelayMilliseconds": ["2000"], "Sources": ["$PARTNER_HOST"], "TrafficType": ["egress"],
 "Interface": ["DEFAULT"], "DurationSeconds": ["300"], "InstallDependencies": ["True"]}
EOF
    aws ssm send-command --instance-ids "$NODE_ID" --document-name "$LATENCY_DOC" \
      --parameters "file://$PARAMS" --comment "chaos a, round ${ROUND:-x}" \
      --query Command.CommandId --output text
    rm -f "$PARAMS"
    mark_start a 300
    ;;
  latency-stop)
    for id in $(aws ssm list-commands --output text --query 'Commands[].CommandId' \
      --filters "key=DocumentName,value=$LATENCY_DOC" key=Status,value=InProgress); do
      aws ssm cancel-command --command-id "$id"
      # Until the document has stopped: while it runs, it keeps its delay in place.
      for _ in $(seq 30); do
        case "$(aws ssm list-commands --command-id "$id" --query 'Commands[0].Status' --output text)" in
          Pending | InProgress | Cancelling) sleep 2 ;;
          *) break ;;
        esac
      done
      echo "cancelled $id"
    done
    # Without waiting for the document's own rollback: drop the delay on the default interface now.
    CLEAR=$(mktemp)
    cat > "$CLEAR" << 'EOF'
{"commands": ["IF=$(ip route show default | awk '{print $5; exit}')",
  "tc qdisc del dev \"$IF\" root 2> /dev/null || true", "tc qdisc del dev \"$IF\" ingress 2> /dev/null || true",
  "for d in $(ls /sys/class/net | grep '^ifb' || true); do tc qdisc del dev \"$d\" root 2> /dev/null || true; done",
  "tc qdisc show"]}
EOF
    id=$(aws ssm send-command --instance-ids "$NODE_ID" --document-name AWS-RunShellScript \
      --parameters "file://$CLEAR" --query Command.CommandId --output text)
    rm -f "$CLEAR"
    aws ssm wait command-executed --command-id "$id" --instance-id "$NODE_ID" && echo "latency removed"
    stop_pid "$OUT/mark-a.pid"
    ;;
  # (c) The switch in our own code: a stream of slow reports that hold database connections.
  reports-start)
    nohup k6 run -e BASE_URL="$BASE_URL" -e FAULT_TOKEN="$FAULT_TOKEN" chaos/reports.js \
      > "$OUT/reports.log" 2>&1 &
    echo $! > "$OUT/reports.pid"
    mark_start c 240
    ;;
  reports-stop)
    stop_pid "$OUT/reports.pid"
    stop_pid "$OUT/mark-c.pid"
    ;;
  # Safeguard probe: how many of the named alarms are firing. 0 means keep going.
  alarm)
    aws cloudwatch describe-alarms --alarm-names "$2" --state-value ALARM \
      --query 'length(MetricAlarms)' --output text
    ;;
  *)
    echo "usage: inject.sh latency-start|latency-stop | reports-start|reports-stop | alarm <name>" >&2
    exit 2
    ;;
esac
