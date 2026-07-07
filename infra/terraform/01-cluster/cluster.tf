# Stage 01 — Cluster: provisiona o cluster kind (1 control-plane + N workers)
# e grava o kubeconfig em var.kubeconfig_path, consumido pelo stage 02 via
# config_path.
resource "kind_cluster" "this" {
  name            = var.kind_cluster_name
  kubeconfig_path = local.kubeconfig_path
  wait_for_ready  = true # garante o control-plane pronto antes do stage 02 conectar
  node_image      = var.kind_node_image != "" ? var.kind_node_image : null

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    node {
      role = "control-plane"
    }

    dynamic "node" {
      for_each = range(var.kind_worker_count)
      content {
        role = "worker"
      }
    }
  }
}
