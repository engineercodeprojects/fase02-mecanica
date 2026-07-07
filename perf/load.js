// Load test — carga sustentada nominal (VUs de producao tipica). Gate dos SLOs
// de p95/p99 e taxa de erro; aborta cedo (delayAbortEval ignora o ramp-up) se
// houver regressao clara.
//
//   k6 run perf/load.js -e BASE_URL=http://localhost:3000 -e VUS=20 -e DURATION=5m
//   # com trafego de escrita (cria OS de verdade):
//   k6 run perf/load.js -e PERF_WRITE=1
import { sleep } from 'k6';
import { sloThresholds, WRITE_ENABLED } from './lib/config.js';
import {
  login,
  assertThrottlerDisabled,
  getHealth,
  listOrdens,
  createOrdem,
  summarize,
} from './lib/helpers.js';

const VUS = Number(__ENV.VUS || 20);

export const options = {
  scenarios: {
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: __ENV.RAMP || '30s', target: VUS },
        { duration: __ENV.DURATION || '5m', target: VUS },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: sloThresholds({ abortOnFail: true, delayAbortEval: '30s' }),
};

export function setup() {
  assertThrottlerDisabled();
  return { token: login() };
}

export default function (data) {
  getHealth();
  listOrdens(data.token);
  if (WRITE_ENABLED) createOrdem(data.token);
  sleep(Number(__ENV.SLEEP || 1));
}

export function handleSummary(data) {
  return summarize(data, 'load');
}
