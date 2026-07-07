// Stress test — encontra o joelho/ponto de ruptura. NAO usa abortOnFail (o
// objetivo e empurrar ate degradar e mapear onde). Duas fases sequenciais:
//   1. baseline (STRESS_MIN_VUS): gate de regressao — reads DEVEM cumprir o SLO
//      de p95; se nao cumprirem, a app regrediu abaixo do minimo -> exit != 0.
//   2. ramp (ate STRESS_MAX_VUS): observado (sem threshold) — o resumo reporta
//      onde a latencia/erro comecam a degradar.
//
//   k6 run perf/stress.js -e BASE_URL=... -e STRESS_MIN_VUS=15 -e STRESS_MAX_VUS=200
import {
  login,
  assertThrottlerDisabled,
  getHealth,
  listOrdens,
  summarize,
} from './lib/helpers.js';

const MIN_VUS = Number(__ENV.STRESS_MIN_VUS || 15);
const MAX_VUS = Number(__ENV.STRESS_MAX_VUS || 200);

export const options = {
  scenarios: {
    // Fase 1: baseline no minimo garantido.
    baseline: {
      executor: 'constant-vus',
      exec: 'reads',
      vus: MIN_VUS,
      duration: __ENV.BASELINE_DURATION || '1m',
      startTime: '0s',
      tags: { phase: 'baseline' },
    },
    // Fase 2: rampa crescente ate saturar (comeca depois do baseline).
    ramp: {
      executor: 'ramping-vus',
      exec: 'reads',
      startTime: __ENV.RAMP_START || '1m10s',
      startVUs: MIN_VUS,
      stages: [
        { duration: __ENV.RAMP || '3m', target: MAX_VUS },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '10s',
      tags: { phase: 'ramp' },
    },
  },
  thresholds: {
    // Gate de regressao: no baseline (STRESS_MIN_VUS) os reads DEVEM cumprir o SLO.
    'http_req_duration{phase:baseline}': ['p(95)<500'],
    // Nenhum threshold de abort na fase de rampa: o joelho e observado no resumo.
  },
};

export function setup() {
  assertThrottlerDisabled();
  return { token: login() };
}

export function reads(data) {
  getHealth();
  listOrdens(data.token);
}

export function handleSummary(data) {
  return summarize(data, 'stress');
}
