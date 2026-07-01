# Stage 01 — Cluster: locals derivados.
locals {
  kubeconfig_path = pathexpand(var.kubeconfig_path)
}
