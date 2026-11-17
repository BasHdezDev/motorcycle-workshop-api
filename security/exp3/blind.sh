#!/usr/bin/env bash
# Experiment 3, adverse condition: turn off the orders-api 5xx alert and exclude
# API B's logs from the _Default sink.
# Undo (and stop at any time): bash security/exp3/restore.sh
set -u
cd "$(dirname "$0")/../.." || exit 1
source security/exp3/common.sh

echo "Project: ${PROJECT}   Round: ${ROUND}"
echo "This will:"
echo "  1) disable the alert policy '${ALERT_DISPLAY_NAME}'"
echo "  2) add the exclusion '${EXCLUSION_NAME}' to sink _Default (new logs of ${SERVICE} are dropped, not recoverable)"
echo "Undo any time with: ROUND=${ROUND} bash security/exp3/restore.sh"
read -r -p "Type YES to continue: " answer
if [ "${answer}" != "YES" ]; then
  echo "Aborted, nothing changed."
  exit 1
fi

trap 'echo; echo "Interrupted: restoring..."; bash security/exp3/restore.sh; exit 130' INT TERM

record "T0"

if set_alert_enabled false; then
  record "alert_disabled"
else
  echo "FAILED to disable the alert, restoring." >&2
  bash security/exp3/restore.sh
  exit 1
fi

if exclusion_present; then
  echo "exclusion already present, skipping"
elif gcloud logging sinks update _Default --project "${PROJECT}" \
       --add-exclusion="name=${EXCLUSION_NAME},filter=${EXCLUSION_FILTER}" --quiet; then
  record "exclusion_added"
else
  echo "FAILED to add the exclusion, restoring." >&2
  bash security/exp3/restore.sh
  exit 1
fi

show_state
echo "Adverse condition active since T0. Stop with: ROUND=${ROUND} bash security/exp3/restore.sh"