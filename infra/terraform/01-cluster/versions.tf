# Stage 01 — Cluster: restricoes de versao do Terraform e do provider.
# Mantido sem blocos `provider {}` (esses ficam em providers.tf) para que
# `terraform validate` cheque apenas as constraints.
terraform {
  required_version = ">= 1.6"

  required_providers {
    # kind via lib Go (nao exige o binario `kind` instalado no host).
    kind = {
      source  = "tehcyx/kind"
      version = "~> 0.11"
    }
  }
}
