#!/usr/bin/env bash
# Experiment 3: undo blind.sh. Also the stop switch.
# Safe to run at any time and any number of times.
set -u
cd "$(dirname "$0")/../.." || exit 1
source security/exp3/common.sh

failures=0
record "restore_started"

if set_alert_enabled true; then
  echo "alert policy enabled"
else
  echo "FAILED to enable the alert policy" >&2
  failures=$((failures + 1))
fi

if exclusion_present; then
  if gcloud logging sinks update _Default --project "${PROJECT}" \
       --remove-exclusions="${EXCLUSION_NAME}" --quiet; then
    echo "exclusion removed"
  else
    echo "FAILED to remove the exclusion" >&2
    failures=$((failures + 1))
  fi
else
  echo "no exclusion present"
fi

# Verify the final state before declaring success.
if [ "$(alert_enabled)" = "true" ] && ! exclusion_present; then
  record "restored"
  echo "RESTORED: alert enabled and no exclusion."
else
  echo "NOT RESTORED: check the state below and run this script again." >&2
  failures=$((failures + 1))
fi

show_state
exit "${failures}"