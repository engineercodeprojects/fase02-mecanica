# Stage 02 — App: estado do stage 01 (cluster + rede AWS). Em modo local,
# os campos de rede sao null e nao sao referenciados. A leitura deste estado
# tambem garante a ordem: o stage 01 precisa ter sido aplicado antes.
data "terraform_remote_state" "cluster" {
  backend = "local"
  config = {
    path = var.cluster_state_path
  }
}
