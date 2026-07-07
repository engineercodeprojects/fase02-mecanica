#!/usr/bin/env bash
# Teste de ESCALABILIDADE do HPA (US-F2-11): gera carga sustentada, observa o
# scale-up (assert com limiar + janela temporal) e o scale-down.
#
# Pre-requisitos:
#   - cluster (kind) com a app deployada (Deployment + HPA por CPU/memoria);
#   - metrics-server pronto (rode antes: perf/scripts/install-metrics-server.sh);
#   - `k6` e `kubectl` no PATH;
#   - BASE_URL acessivel (tipicamente via `kubectl port-forward`).
#
# Defaults alinhados a US-F2-05 (namespace `oficina`, deployment/HPA `app`).
# Sobrescreva por env quando os nomes divergirem (ex.: mecanica/mecanica-app).
#
# Uso:
#   BASE_URL=http://localhost:8080 K8S_NAMESPACE=oficina K8S_DEPLOYMENT=app \
#     K8S_HPA=app perf/scripts/hpa-scale-test.sh
set -euo pipefail

NAMESPACE="${K8S_NAMESPACE:-oficina}"
DEPLOYMENT="${K8S_DEPLOYMENT:-app}"
HPA="${K8S_HPA:-app}"
BASE_URL="${BASE_URL:-http://localhost:8080}"
OUT_DIR="${PERF_OUT_DIR:-perf-results}"

HPA_MIN_SCALE="${HPA_MIN_SCALE:-2}"                 # replicas que provam o scale-up
HPA_SCALEUP_TIMEOUT="${HPA_SCALEUP_TIMEOUT:-300}"
HPA_SCALEDOWN_TIMEOUT="${HPA_SCALEDOWN_TIMEOUT:-360}"
HPA_SCALEDOWN_STRICT="${HPA_SCALEDOWN_STRICT:-0}"   # 1 => falha se nao voltar ao min
LOAD_RATE="${RATE:-300}"                            # req/s agregado
LOAD_DURATION="${DURATION:-8m}"                     # > scaleup timeout p/ manter carga

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$OUT_DIR"

replicas() { kubectl get deployment "$DEPLOYMENT" -n "$NAMESPACE" -o jsonpath='{.status.replicas}' 2>/dev/null || echo 0; }
min_replicas() { kubectl get hpa "$HPA" -n "$NAMESPACE" -o jsonpath='{.spec.minReplicas}' 2>/dev/null || echo 1; }

echo "==> Estado inicial do HPA (ns ${NAMESPACE}):"
kubectl get hpa "$HPA" -n "$NAMESPACE" || true
START_REPLICAS="$(replicas)"
MIN="$(min_replicas)"
echo "    replicas iniciais=${START_REPLICAS}, HPA min=${MIN}, alvo scale-up>=${HPA_MIN_SCALE}"

# 1) Carga em background.
echo "==> Iniciando carga (k6 hpa.js) rate=${LOAD_RATE}/s dur=${LOAD_DURATION} -> ${BASE_URL}"
BASE_URL="$BASE_URL" RATE="$LOAD_RATE" DURATION="$LOAD_DURATION" PERF_OUT_DIR="$OUT_DIR" \
  k6 run "${SCRIPT_DIR}/../hpa.js" >"${OUT_DIR}/hpa-k6.log" 2>&1 &
K6_PID=$!
trap 'kill "$K6_PID" 2>/dev/null || true' EXIT

# 2) Verificacao intermediaria: a carga cruzou o gatilho de CPU? (senao um
#    scale-up ausente e ambiguo: falta de carga vs HPA quebrado).
echo "==> Observando o gatilho de CPU do HPA (kubectl get hpa / top pods)..."
for _ in $(seq 1 12); do
  echo "    hpa: $(kubectl get hpa "$HPA" -n "$NAMESPACE" --no-headers 2>/dev/null || echo '<sem hpa>')"
  kubectl top pods -n "$NAMESPACE" 2>/dev/null | sed 's/^/    top: /' || true
  (( $(replicas) > START_REPLICAS )) && break
  sleep 10
done

# 3) Assert de scale-up.
echo "==> Aguardando scale-up para >= ${HPA_MIN_SCALE} replicas (timeout ${HPA_SCALEUP_TIMEOUT}s)..."
up_deadline=$(( $(date +%s) + HPA_SCALEUP_TIMEOUT ))
max_seen="$START_REPLICAS"
while (( $(date +%s) < up_deadline )); do
  r="$(replicas)"; (( r > max_seen )) && max_seen="$r"
  echo "    $(date +%T) replicas=${r} (max=${max_seen})"
  (( r >= HPA_MIN_SCALE )) && break
  sleep 10
done
echo "    replicas maximas observadas: ${max_seen}"
if (( max_seen < HPA_MIN_SCALE )); then
  echo "FALHA: HPA nao escalou para >= ${HPA_MIN_SCALE} replicas em ${HPA_SCALEUP_TIMEOUT}s." >&2
  { echo "=== describe hpa ==="; kubectl describe hpa "$HPA" -n "$NAMESPACE";
    echo "=== top pods ==="; kubectl top pods -n "$NAMESPACE"; } \
    >"${OUT_DIR}/hpa-scaleup-fail.log" 2>&1 || true
  exit 1
fi
echo "OK: scale-up confirmado (${max_seen} replicas)."

# 4) Remove a carga e observa o scale-down.
echo "==> Encerrando a carga para observar o scale-down..."
kill "$K6_PID" 2>/dev/null || true
wait "$K6_PID" 2>/dev/null || true
trap - EXIT

echo "==> Aguardando scale-down ao min (${MIN}) (timeout ${HPA_SCALEDOWN_TIMEOUT}s)..."
down_deadline=$(( $(date +%s) + HPA_SCALEDOWN_TIMEOUT ))
while (( $(date +%s) < down_deadline )); do
  r="$(replicas)"
  echo "    $(date +%T) replicas=${r} (alvo=${MIN})"
  (( r <= MIN )) && { echo "OK: scale-down concluido (${r} replicas)."; break; }
  sleep 15
done
r_final="$(replicas)"
if (( r_final > MIN )); then
  msg="scale-down nao concluiu em ${HPA_SCALEDOWN_TIMEOUT}s (replicas=${r_final}, min=${MIN}). A janela de estabilizacao do HPA (default ~300s) pode ser maior que o timeout."
  if [[ "$HPA_SCALEDOWN_STRICT" == "1" ]]; then
    echo "FALHA: $msg" >&2
    exit 1
  fi
  echo "AVISO: $msg (HPA_SCALEDOWN_STRICT=0, nao falha)."
fi

# 5) Evidencia (alimenta o video da entrega).
{ echo "=== hpa describe ==="; kubectl describe hpa "$HPA" -n "$NAMESPACE";
  echo; echo "=== eventos recentes ==="; kubectl get events -n "$NAMESPACE" --sort-by=.lastTimestamp | tail -30; } \
  >"${OUT_DIR}/hpa-evidence.log" 2>&1 || true

echo "==> Evidencia salva em ${OUT_DIR}/. Teste de escalabilidade concluido."
