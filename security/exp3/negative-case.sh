#!/usr/bin/env bash
# Negative case: edit only the text of the baseline alert. The detection must NOT fire.
set -u
cd "$(dirname "$0")/../.." || exit 1
source security/exp3/common.sh
ROUND=neg
name="$(find_policy)"
if [ -z "${name}" ]; then echo "ERROR: baseline alert not found" >&2; exit 1; fi
record "text_edit_started"
curl -sS -f -X PATCH "https://monitoring.googleapis.com/v3/${name}?updateMask=documentation" \
  -H "Authorization: Bearer ${GCP_TOKEN}" -H "x-goog-user-project: ${PROJECT}" \
  -H "Content-Type: application/json" \
  -d "{\"documentation\":{\"content\":\"Edited by the negative test at $(now_utc). Text only.\",\"mimeType\":\"text/markdown\"}}" \
  -o /dev/null
record "text_edit_done"
echo "Now check that NO incident opens in Monitoring > Alerting for 'exp3 - observability tampering'."