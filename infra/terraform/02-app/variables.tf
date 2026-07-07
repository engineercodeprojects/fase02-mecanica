# Stage 02 — App: variaveis de entrada.

variable "project_name" {
  description = "Prefixo de nomes (service do Postgres, etc.)."
  type        = string
  default     = "oficina-mecanica"
}

variable "kubeconfig_path" {
  description = "Caminho do kubeconfig gerado pelo stage 01."
  type        = string
  default     = "~/.kube/oficina-mecanica.config"
}

variable "cluster_state_path" {
  description = "Caminho do tfstate do stage 01 (lido via terraform_remote_state)."
  type        = string
  default     = "../01-cluster/terraform.tfstate"
}

variable "app_namespace" {
  description = "Namespace onde a app e o Secret do banco vivem. Casa com k8s/namespace.yaml (US-F2-05)."
  type        = string
  default     = "oficina"
}

# --- Banco ---------------------------------------------------------------

variable "db_name" {
  description = "Nome do database Postgres."
  type        = string
  default     = "oficina_mecanica"
}

variable "db_username" {
  description = "Usuario da aplicacao no Postgres."
  type        = string
  default     = "oficina"
}

variable "db_password" {
  description = "Override opcional da senha. Vazio (default) => gerada via random_password."
  type        = string
  default     = ""
  sensitive   = true
}

variable "db_port" {
  description = "Porta do Postgres."
  type        = number
  default     = 5432
}

variable "postgres_image" {
  description = "Imagem do Postgres (Docker Official Image, sem gate de assinatura)."
  type        = string
  default     = "postgres:16-alpine"
}

variable "pg_storage_class" {
  description = "StorageClass do PVC. 'standard' e o default do kind (local-path)."
  type        = string
  default     = "standard"
}

variable "pg_storage_size" {
  description = "Tamanho do volume de dados do Postgres."
  type        = string
  default     = "1Gi"
}
