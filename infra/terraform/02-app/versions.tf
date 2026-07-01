# Stage 02 — App: restricoes de versao. Apenas constraints (provider config
# fica em providers.tf). terraform_remote_state e built-in, sem entrada aqui.
terraform {
  required_version = ">= 1.6"

  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}
