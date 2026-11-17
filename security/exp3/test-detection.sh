#!/usr/bin/env bash
# Replays the detection filter (the one in detection-alert.json) over past audit logs.
# For the round-0 audit logs, exactly 3 events must match: the two "disable alert"
# updates and the "add exclusion" update. The re-enables and the exclusion removal must not.
set -u
cd "$(dirname "$0")/../.." || exit 1
source security/exp3/common.sh
START="${START:-2026-11-17T19:00:00Z}"
END="${END:-2026-11-17T20:30:00Z}"

FILTER="$(grep -m1 '"filter"' security/exp3/detection-alert.json \
  | sed -e 's/^[^:]*: *"//' -e 's/",\{0,1\}$//' -e 's/\\"/"/g')"

echo "Filter under test:"
echo "${FILTER}"
echo "Window: ${START} .. ${END}"
echo "--- matches ---"
gcloud logging read "${FILTER} AND timestamp>=\"${START}\" AND timestamp<=\"${END}\"" \
  --project "${PROJECT}" --order=asc \
  --format="value(timestamp,protoPayload.methodName)" | tee /tmp/exp3-matches.txt
echo "---------------"
echo "matched: $(grep -c . /tmp/exp3-matches.txt)"