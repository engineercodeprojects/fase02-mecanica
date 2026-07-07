// Soak/endurance test — carga moderada por um periodo longo (20-30min) para
// detectar degradacao ao longo do tempo (memory leak, pool esgotando, GC).
//
// Duas asserts SEPARADAS (a segunda fora do k6):
//   1. Latencia estavel: p95 de reads sob controle durante toda a duracao (gate
//      aqui, sem abort — degradacao transitoria nao deve abortar cedo).
//   2. Memoria do pod: o k6 NAO ve memoria de pod. Colete em paralelo com
//      `perf/scripts/hpa-scale-test.sh` amostrando `kubectl top pod`, ou
//      manualmente, e verifique "sem tendencia de crescimento sustentado".
//
//   k6 run perf/soak.js -e BASE_URL=... -e VUS=15 -e DURATION=20m
import { sleep } from 'k6';
import {
  login,
  assertThrottlerDisabled,
  getHealth,
  listOrdens,
  summarize,
} from './lib/helpers.js';

export const options = {
  scenarios: {
    soak: {
      executor: 'constant-vus',
      vus: Number(__ENV.VUS || 15),
      duration: __ENV.DURATION || '20m',
    },
  },
  thresholds: {
    'http_req_failed{kind:read}': ['rate<0.01'],
    // Estabilidade ao longo do tempo (nao aborta): margem um pouco maior que o load.
    'http_req_duration{kind:read}': ['p(95)<600'],
  },
};

export function setup() {
  assertThrottlerDisabled();
  return { token: login() };
}

export default function (data) {
  getHealth();
  listOrdens(data.token);
  sleep(Number(__ENV.SLEEP || 1));
}

export function handleSummary(data) {
  return summarize(data, 'soak');
}
