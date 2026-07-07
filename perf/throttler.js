// Teste anti-DoS do PROPRIO throttler — cenario dedicado e SEPARADO dos SLOs de
// performance. Rodar com o throttler ATIVO (SEM THROTTLER_DISABLED): abusa de
// `/auth/login` (limite 5/60s) e exige que o rate limit dispare (429).
//
// Este e o UNICO cenario que espera/tolera 429. Usa credenciais INVALIDAS mas
// bem-formadas (email valido, senha >= 6 chars) para as requests que passam o
// rate limit retornarem 401 (nao 400 de validacao) e depois 429.
//
//   k6 run perf/throttler.js -e BASE_URL=http://localhost:3000
import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from './lib/config.js';
import { throttled429, summarize } from './lib/helpers.js';

export const options = {
  scenarios: {
    abuse: {
      executor: 'shared-iterations',
      vus: 5,
      iterations: Number(__ENV.ITERATIONS || 60),
      maxDuration: '30s',
    },
  },
  thresholds: {
    // Prova anti-DoS: o rate limit DEVE disparar ao menos uma vez.
    throttled_429: ['count>0'],
    // A app so pode responder 401 (credencial invalida) ou 429 — nunca 5xx.
    checks: ['rate>0.99'],
  },
};

export default function () {
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: 'abuse@perf.local', senha: 'wrong-password' }),
    { headers: { 'Content-Type': 'application/json' }, tags: { name: 'abuse:login' } },
  );
  if (res.status === 429) throttled429.add(1);
  check(res, {
    'status 401 ou 429 (nunca 5xx)': (r) => r.status === 401 || r.status === 429,
  });
}

export function handleSummary(data) {
  return summarize(data, 'throttler');
}
