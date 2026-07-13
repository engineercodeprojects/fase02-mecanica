// Configuracao compartilhada da suite de performance (US-F2-11).
// Parametrizada por variaveis de ambiente (k6 -e KEY=value).
//
// Nos cenarios de performance a app-alvo sobe com THROTTLER_DISABLED=true
// (ver src/config/throttler.config.ts) para o k6 medir a app, nao o throttler.

export const BASE_URL = (__ENV.BASE_URL || 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

// Usuario de seed usado UMA vez (no setup) para obter o JWT.
// Ver prisma/seeds/03_test_users.sql (atendente pode listar/criar OS).
export const AUTH_EMAIL = __ENV.AUTH_EMAIL || 'atendente@oficina.com';
export const AUTH_SENHA = __ENV.AUTH_SENHA || 'atendente123';

// IDs de seed para o cenario de escrita (POST /ordens-servico).
// Ver prisma/seeds/01_test_data.sql.
export const SEED_CLIENTE_ID =
  __ENV.CLIENTE_ID || '11111111-1111-4111-8111-111111111111';
export const SEED_VEICULO_ID =
  __ENV.VEICULO_ID || 'aaaa1111-1111-4111-8111-111111111111';

// Habilita trafego de escrita (cria OS de verdade — o banco cresce durante o teste).
export const WRITE_ENABLED =
  __ENV.PERF_WRITE === '1' || __ENV.PERF_WRITE === 'true';

// Diretorio de saida dos relatorios (handleSummary).
export const OUT_DIR = (__ENV.PERF_OUT_DIR || 'perf-results').replace(/\/+$/, '');

/**
 * SLOs versionados como codigo (US-F2-11). Sempre p95/p99, nunca media.
 *
 * Nos cenarios de performance o throttler esta OFF => nenhum 429 esperado;
 * `http_req_failed` conta qualquer nao-2xx/3xx (incl. 429) como falha, e o
 * contador `throttled_429` deve ser 0 (senao o throttler ficou ligado).
 *
 * `abortOnFail` so e ligado em load/smoke (com `delayAbortEval` para ignorar
 * o ramp-up inicial); stress/soak definem thresholds proprios.
 */
export function sloThresholds({ abortOnFail = false, delayAbortEval = '30s' } = {}) {
  const abort = abortOnFail ? { abortOnFail: true, delayAbortEval } : {};
  return {
    // Taxa de erro por TIPO de request (tag `kind`). Tagear exclui as requests
    // de setup — login e a rajada de sanidade anti-429 (que retorna 401 de
    // proposito) — que senao inflariam a taxa de erro e reprovariam o SLO.
    'http_req_failed{kind:read}': [{ threshold: 'rate<0.01', ...abort }],
    'http_req_failed{kind:write}': [{ threshold: 'rate<0.01', ...abort }],
    'http_req_duration{kind:read}': [
      { threshold: 'p(95)<500', ...abort },
      'p(99)<1000',
    ],
    'http_req_duration{kind:write}': [
      { threshold: 'p(95)<800', ...abort },
      'p(99)<1500',
    ],
    // Qualquer 429 nos cenarios de perf e regressao de setup (throttler ligado).
    throttled_429: ['count==0'],
  };
}
