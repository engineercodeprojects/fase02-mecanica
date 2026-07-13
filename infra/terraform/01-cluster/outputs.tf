# Stage 01 — Cluster: outputs.

output "kubeconfig_path" {
  description = "Caminho do kubeconfig gerado. Use no stage 02 e no kubectl."
  value       = local.kubeconfig_path
}

output "cluster_context" {
  description = "Contexto kubectl do cluster kind."
  value       = "kind-${var.kind_cluster_name}"
}

output "connect_command" {
  description = "Comando pronto para apontar o kubectl ao cluster. Use com `eval \"$(terraform output -raw connect_command)\"` — exporta KUBECONFIG na shell atual."
  value       = "export KUBECONFIG=${local.kubeconfig_path} && kubectl cluster-info --context kind-${var.kind_cluster_name}"
}
