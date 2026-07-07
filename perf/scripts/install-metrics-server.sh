#!/usr/bin/env bash
# Instala o metrics-server no cluster atual (kind) e espera ele ficar pronto.
# O HPA por CPU/memoria depende do metrics-server; sem ele o HPA fica com
# TARGETS <unknown>/70% e NUNCA escala. O kind usa certificado self-signed no
# kubelet, por isso e obrigatorio --kubelet-insecure-tls.
#
# Uso:
#   K8S_NAMESPACE=oficina K8S_HPA=app perf/scripts/install-metrics-server.sh
set -euo pipefail

NAMESPACE="${K8S_NAMESPACE:-oficina}"
HPA="${K8S_HPA:-app}"
METRICS_URL="${METRICS_SERVER_URL:-https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml}"
TIMEOUT="${METRICS_TIMEOUT:-180}"

echo "==> Instalando metrics-server..."
kubectl apply -f "$METRICS_URL"

echo "==> Habilitando --kubelet-insecure-tls (necessario no kind)..."
kubectl -n kube-system patch deployment metrics-server --type='json' \
  -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]' \
  || echo "    (flag ja presente ou patch ignorado)"

echo "==> Aguardando metrics-server ficar Available (timeout ${TIMEOUT}s)..."
kubectl -n kube-system rollout status deployment/metrics-server --timeout="${TIMEOUT}s"

echo "==> Aguardando o HPA '${HPA}' (ns ${NAMESPACE}) reportar TARGETS numericos (sair de <unknown>)..."
deadline=$(( $(date +%s) + TIMEOUT ))
while true; do
  line="$(kubectl get hpa "$HPA" -n "$NAMESPACE" --no-headers 2>/dev/null || true)"
  if [[ -n "$line" && "$line" != *unknown* ]]; then
    echo "    HPA pronto: $line"
    break
  fi
  if (( $(date +%s) > deadline )); then
    echo "ERRO: metrics-server nao populou o HPA em ${TIMEOUT}s (TARGETS ainda <unknown>)." >&2
    kubectl get hpa "$HPA" -n "$NAMESPACE" || true
    kubectl top pods -n "$NAMESPACE" || true
    exit 1
  fi
  echo "    ainda <unknown>, aguardando... (${line:-sem hpa})"
  sleep 5
done

echo "==> metrics-server pronto e HPA populado."
