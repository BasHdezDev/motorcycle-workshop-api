#!/usr/bin/env bash
# Shared settings and helpers for experiment 3 (blind.sh and restore.sh).
export PROJECT="${PROJECT:-motorcycle-workshop-v3}"
export SERVICE="${SERVICE:-workshop-v3-api}"
export ALERT_DISPLAY_NAME="${ALERT_DISPLAY_NAME:-orders-api 5xx errors}"
export EXCLUSION_NAME="${EXCLUSION_NAME:-exp3-exclude-orders-api}"
export EXCLUSION_FILTER="resource.type=cloud_run_revision AND resource.labels.service_name=${SERVICE}"
export ROUND="${ROUND:-x}"
export EVIDENCE_DIR="${EVIDENCE_DIR:-security/exp3/evidence}"

now_utc() { date -u +%Y-%m-%dT%H:%M:%SZ; }

# Append one event to the evidence file of this round and echo it.
record() {
  mkdir -p "${EVIDENCE_DIR}"
  printf '{"round":"%s","event":"%s","utc":"%s"}\n' "${ROUND}" "$1" "$(now_utc)" | tee -a "${EVIDENCE_DIR}/round-${ROUND}.jsonl"
}

# Full resource name of the alert policy, found by its display name.
find_policy() {
  local token
  token="$(gcloud auth print-access-token)"
  curl -sS --get "https://monitoring.googleapis.com/v3/projects/${PROJECT}/alertPolicies" \
    --data-urlencode "filter=display_name=\"${ALERT_DISPLAY_NAME}\"" \
    -H "Authorization: Bearer ${token}" -H "x-goog-user-project: ${PROJECT}" \
    | grep -o "projects/${PROJECT}/alertPolicies/[0-9]*" | head -1
}

set_alert_enabled() { # true | false
  local name token
  name="$(find_policy)"
  if [ -z "${name}" ]; then
    echo "ERROR: alert policy '${ALERT_DISPLAY_NAME}' not found" >&2
    return 1
  fi
  token="$(gcloud auth print-access-token)"
  curl -sS -f -X PATCH "https://monitoring.googleapis.com/v3/${name}?updateMask=enabled" \
    -H "Authorization: Bearer ${token}" -H "x-goog-user-project: ${PROJECT}" \
    -H "Content-Type: application/json" -d "{\"enabled\": $1}" -o /dev/null
}

alert_enabled() { # prints true | false | missing
  local name token
  name="$(find_policy)"
  if [ -z "${name}" ]; then echo "missing"; return 1; fi
  token="$(gcloud auth print-access-token)"
  if curl -sS "https://monitoring.googleapis.com/v3/${name}" \
       -H "Authorization: Bearer ${token}" -H "x-goog-user-project: ${PROJECT}" \
       | grep -Eq '"enabled": *false'; then
    echo "false"
  else
    echo "true"
  fi
}

exclusion_present() {
  gcloud logging sinks describe _Default --project "${PROJECT}" \
    --format="value(exclusions[].name)" 2>/dev/null | grep -q "${EXCLUSION_NAME}"
}

show_state() {
  echo "--- state ---"
  echo "alert '${ALERT_DISPLAY_NAME}' enabled: $(alert_enabled)"
  if exclusion_present; then
    echo "sink _Default exclusion '${EXCLUSION_NAME}': PRESENT"
  else
    echo "sink _Default exclusion '${EXCLUSION_NAME}': none"
  fi
  echo "-------------"
}