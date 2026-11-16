// The fixed, declared load for every chaos round: same profile, same mix, same instrument.
//   k6 run -e BASE_URL=http://... -e EXPERIMENT=a-partner-latency -e ROUND=0 chaos/load.js
// Half the requests are the flow (our item + a record from the partner cloud), half plain reads.
import { check } from 'k6';
import exec from 'k6/execution';
import http from 'k6/http';
import { Rate } from 'k6/metrics';

const SLO = JSON.parse(open('./slo.json'));
const PROFILE = SLO.loadProfile;
const EXPERIMENT = __ENV.EXPERIMENT || 'steady';
const ROUND = __ENV.ROUND || 'x';
const BASE = __ENV.BASE_URL;

const partnerOk = new Rate('partner_ok');

// One falsifiable hypothesis per experiment, each on its own metric.
const HYPOTHESES = {
  'a-partner-latency': {
    'http_req_duration{name:flow}': [`p(95)<${SLO.experiments['a-partner-latency'].threshold}`],
  },
  'b-partner-db': {
    partner_ok: [`rate>=${SLO.experiments['b-partner-db'].threshold}`],
  },
  'c-db-pool': {
    'http_req_duration{name:read}': [`p(95)<${SLO.experiments['c-db-pool'].threshold}`],
  },
};

export const options = {
  scenarios: {
    flow: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 40,
      maxVUs: 300,
      stages: [
        { target: PROFILE.rps, duration: `${PROFILE.rampUpSeconds}s` },
        { target: PROFILE.rps, duration: `${PROFILE.plateauSeconds}s` },
        { target: 0, duration: `${PROFILE.rampDownSeconds}s` },
      ],
    },
  },
  thresholds: {
    // Always-true entries, so every run reports all three metrics; the hypothesis overrides its own.
    'http_req_duration{name:flow}': ['max>=0'],
    'http_req_duration{name:read}': ['max>=0'],
    partner_ok: ['rate>=0'],
    ...(EXPERIMENT === 'steady'
      ? Object.assign({}, ...Object.values(HYPOTHESES))
      : HYPOTHESES[EXPERIMENT]),
    // Abort condition: half the requests failing means the experiment has gone too far.
    http_req_failed: [
      { threshold: `rate<${SLO.abort.loadErrorRate}`, abortOnFail: true, delayAbortEval: '30s' },
    ],
  },
  summaryTrendStats: ['avg', 'p(50)', 'p(95)', 'p(99)', 'max'],
};

function partnerStatus(response) {
  try {
    return response.json('partner.status');
  } catch {
    return undefined;
  }
}

export default function () {
  const i = exec.scenario.iterationInTest;
  const id = (i % 6) + 1;
  // Every request can be found in the logs and traces of both clouds by this id.
  const headers = { 'x-correlation-id': `k6-${EXPERIMENT}-r${ROUND}-${i}` };

  if (i % 2 === 0) {
    const res = http.get(`${BASE}/v2/items/${id}`, { headers, tags: { name: 'flow' } });
    partnerOk.add(res.status === 200 && partnerStatus(res) === 'ok');
    check(res, { 'flow answered': (r) => r.status === 200 });
  } else {
    const res = http.get(`${BASE}/items/${id}`, { headers, tags: { name: 'read' } });
    check(res, { 'read answered': (r) => r.status === 200 });
  }
}

const ms = (metric, stat) => (metric ? metric.values[stat].toFixed(0) : '-');

// Each run leaves its own JSON as evidence, and one readable line.
export function handleSummary(data) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const m = data.metrics;
  const line =
    `${EXPERIMENT} round ${ROUND}: ${m.http_reqs.values.count} requests, ` +
    `flow p95 ${ms(m['http_req_duration{name:flow}'], 'p(95)')} ms, ` +
    `read p95 ${ms(m['http_req_duration{name:read}'], 'p(95)')} ms, ` +
    `partner ok ${(100 * m.partner_ok.values.rate).toFixed(1)} %, ` +
    `failed ${(100 * m.http_req_failed.values.rate).toFixed(1)} %\n`;

  return {
    [`chaos/out/${EXPERIMENT}-r${ROUND}-${stamp}.json`]: JSON.stringify(data, null, 2),
    stdout: line,
  };
}
