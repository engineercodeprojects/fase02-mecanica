// Gerador de carga para o teste de ESCALABILIDADE do HPA. Usa taxa de chegada
// constante (constant-arrival-rate) contra /health para saturar a CPU dos pods
// e disparar o HPA. Rode com `perf/scripts/hpa-scale-test.sh`, que observa o
// scale-up/scale-down em paralelo.
//
// Durante o evento de escala a app deve continuar SAUDAVEL ("sem falhar"):
// mesmos thresholds de erro/latencia valem enquanto pods novos entram no ar.
//
//   k6 run perf/hpa.js -e BASE_URL=http://localhost:8080 -e RATE=300 -e DURATION=5m
import { getHealth, summarize } from './lib/helpers.js';

export const options = {
  scenarios: {
    load: {
      executor: 'constant-arrival-rate',
      rate: Number(__ENV.RATE || 300), // req/s agregado
      timeUnit: '1s',
      duration: __ENV.DURATION || '5m',
      preAllocatedVUs: Number(__ENV.VUS || 50),
      maxVUs: Number(__ENV.MAX_VUS || 200),
    },
  },
  thresholds: {
    // "Sem falhar" durante o rollout dos pods novos.
    'http_req_failed{kind:read}': ['rate<0.01'],
    'http_req_duration{kind:read}': ['p(95)<1000'],
  },
};

export default function () {
  getHealth();
}

export function handleSummary(data) {
  return summarize(data, 'hpa');
}
