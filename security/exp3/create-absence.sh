#!/usr/bin/env bash
# Creates, once, the three pieces of improvement 2: the log-based metric, the uptime
# check (every minute) and the absence alert. Not idempotent: run it a single time.
set -eu
cd "$(dirname "$0")/../.." || exit 1
source security/exp3/common.sh
AUTH="Authorization: Bearer ${GCP_TOKEN}"
PROJ="x-goog-user-project: ${PROJECT}"
JSON="Content-Type: application/json"

echo "== 1/3 log-based metric orders_api_requests"
curl -sS -f -X POST "https://logging.googleapis.com/v2/projects/${PROJECT}/metrics" \
  -H "${AUTH}" -H "${PROJ}" -H "${JSON}" -d @security/exp3/requests-metric.json | grep '"name"'

echo "== 2/3 uptime check every minute"
curl -sS -f -X POST "https://monitoring.googleapis.com/v3/projects/${PROJECT}/uptimeCheckConfigs" \
  -H "${AUTH}" -H "${PROJ}" -H "${JSON}" -d @security/exp3/uptime-check.json | grep -E '"(name|displayName|period)"'

echo "== waiting 60 s so the metric descriptor is visible"
sleep 60

echo "== 3/3 absence alert"
curl -sS -f -X POST "https://monitoring.googleapis.com/v3/projects/${PROJECT}/alertPolicies" \
  -H "${AUTH}" -H "${PROJ}" -H "${JSON}" -d @security/exp3/absence-alert.json | grep -E '"(name|displayName|enabled)"'