// Smoke test — sanidade rapida: poucos VUs, curta duracao. Valida que a suite,
// os SLOs e a app-alvo estao saudaveis antes dos testes maiores; estabelece o
// throughput de baseline.
//
//   k6 run perf/smoke.js -e BASE_URL=http://localhost:3000
import { sleep } from 'k6';
import { sloThresholds } from './lib/config.js';
import {
  login,
  assertThrottlerDisabled,
  getHealth,
  listOrdens,
  summarize,
} from './lib/helpers.js';

export const options = {
  vus: Number(__ENV.VUS || 3),
  duration: __ENV.DURATION || '30s',
  thresholds: sloThresholds(),
};

export function setup() {
  assertThrottlerDisabled();
  return { token: login() };
}

export default function (data) {
  getHealth();
  listOrdens(data.token);
  sleep(1);
}

export function handleSummary(data) {
  return summarize(data, 'smoke');
}
