// Fault (c): a stream of slow reports, each holding a database connection for seconds.
//   k6 run -e BASE_URL=http://... -e FAULT_TOKEN=... chaos/reports.js
// It is the injection, not the measurement: chaos/load.js measures the reads meanwhile.
import http from 'k6/http';

const SLO = JSON.parse(open('./slo.json'));
const STREAM = SLO.faultStream;

export const options = {
  scenarios: {
    reports: {
      executor: 'constant-arrival-rate',
      rate: STREAM.slowReportsPerSecond,
      timeUnit: '1s',
      duration: `${STREAM.seconds}s`,
      preAllocatedVUs: 50,
      maxVUs: 400,
    },
  },
  discardResponseBodies: true,
};

export default function () {
  http.post(`${__ENV.BASE_URL}/v2/exports/items`, null, {
    headers: { 'x-fault': 'slow-db', 'x-fault-token': __ENV.FAULT_TOKEN },
    tags: { name: 'report' },
  });
}

export function handleSummary(data) {
  const codes = data.metrics.http_reqs.values.count;
  return { stdout: `slow reports sent: ${codes}\n` };
}
