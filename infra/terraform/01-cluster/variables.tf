# Stage 01 — Cluster: variaveis de entrada.

variable "project_name" {
  description = "Prefixo de nomes para o cluster e recursos."
  type        = string
  default     = "oficina-mecanica"
}

variable "kubeconfig_path" {
  description = "Caminho do kubeconfig gerado. Compartilhado com o stage 02-app (mesmo default). Fora do repo por padrao."
  type        = string
  default     = "~/.kube/oficina-mecanica.config"
}

variable "kind_cluster_name" {
  description = "Nome do cluster kind. Gera o contexto kubectl 'kind-<nome>'."
  type        = string
  default     = "oficina-local"
}

variable "kind_worker_count" {
  description = "Quantidade de nodes worker (>=1). O control-plane e sempre 1."
  type        = number
  default     = 2

  validation {
    condition     = var.kind_worker_count >= 1
    error_message = "kind_worker_count deve ser >= 1."
  }
}

variable "kind_node_image" {
  description = "Imagem do node kind (ex.: 'kindest/node:v1.31.2'). Vazio = usa o default do provider."
  type        = string
  default     = ""
}
