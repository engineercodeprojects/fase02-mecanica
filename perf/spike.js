// Spike test — pico subito de trafego contra /health (publico). Valida
// sobrevivencia durante o pico e RECUPERACAO depois. Durante o pico toleramos
// degradacao; o gate exige recuperacao (erro baixo e p99 sob controle no total).
//
//   k6 run perf/spike.js -e BASE_URL=... -e SPIKE_VUS=200
import { sleep } from 'k6';
import { getHealth, summarize } from './lib/helpers.js';

const BASE_VUS = Number(__ENV.BASE_VUS || 5);
const SPIKE_VUS = Number(__ENV.SPIKE_VUS || 200);

export const options = {
  scenarios: {
    spike: {
      executor: 'ramping-vus',
      startVUs: BASE_VUS,
      stages: [
        { duration: '10s', target: BASE_VUS }, // aquecimento
        { duration: __ENV.SPIKE_RAMP || '10s', target: SPIKE_VUS }, // pico subito
        { duration: __ENV.SPIKE_HOLD || '1m', target: SPIKE_VUS }, // sustenta o pico
        { duration: '20s', target: BASE_VUS }, // recuperacao
        { duration: '30s', target: BASE_VUS }, // estabiliza pos-pico
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    // Sobrevivencia: poucos erros; sem 5xx sistematico. (spike so bate /health.)
    'http_req_failed{kind:read}': ['rate<0.10'],
    // Pico tolera latencia alta, mas o p99 nao pode explodir.
    'http_req_duration{kind:read}': ['p(99)<3000'],
  },
};

export default function () {
  getHealth();
  sleep(0.5);
}

export function handleSummary(data) {
  return summarize(data, 'spike');
}
