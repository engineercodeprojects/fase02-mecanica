# Stage 02 — App: provider kubernetes configurado a partir do kubeconfig
# gerado pelo stage 01 (config_path) — evita o anti-padrao de configurar o
# provider a partir de um recurso criado no mesmo apply.
provider "kubernetes" {
  config_path = pathexpand(var.kubeconfig_path)
}
