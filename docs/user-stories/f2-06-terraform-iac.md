# US-F2-06: Infraestrutura como Codigo com Terraform (Cluster + Banco)

**User Story:** Como DevOps, quero scripts Terraform que provisionem o cluster Kubernetes **e o banco de dados**, para que toda a infraestrutura seja versionada, reproduzivel e auditavel, conforme exige a Fase 2.

**Prioridade:** Alta
**Story Points:** 8
**Status:** In Review
**DDD Domain:** Infraestrutura
**DDD Layer:** Infrastructure

## Contexto

O PDF da Fase 2 exige explicitamente Terraform para **cluster Kubernetes e banco de dados**. Por isso o Postgres NAO esta nos manifestos K8s (ver [US-F2-05](f2-05-manifestos-kubernetes.md)) — fica sob responsabilidade do Terraform, mantendo separacao entre provisioning (IaC) e application deploy (manifestos).

## Estrategia: cluster kind (sem cloud)

O escopo e **apenas `kind`** (Kubernetes in Docker). Nao ha provisionamento em cloud (EKS/RDS): o fluxo de entrega/CD sobe um cluster `kind` efemero, faz o deploy da app e valida que o servidor sobe (smoke test). `kind` e um cluster Kubernetes real, entao atende literalmente o requisito "deploy no cluster Kubernetes".

| Componente | Como |
|---|---|
| Cluster | `kind` via provider `tehcyx/kind` (nao precisa do binario `kind`) |
| Banco | PostgreSQL no cluster via recursos `kubernetes_*` com a imagem oficial `postgres:16-alpine` |

> Helm `bitnami/postgresql` foi descartado: desde set/2025 a Bitnami moveu as imagens versionadas para `bitnamilegacy`/assinatura paga e o chart nao funciona out-of-the-box.

**Arquitetura de dois estados** (recomendacao HashiCorp para nao configurar o provider `kubernetes` a partir de um recurso criado no mesmo apply):

- `infra/terraform/01-cluster/` — cria o cluster `kind` e grava o kubeconfig
- `infra/terraform/02-app/` — namespace + Postgres + Secret `oficina-db` (consome o kubeconfig via `config_path`)

## Criterios de Aceite

### Estrutura

- [x] Diretorio `infra/terraform/` (nao conflita com `infra/sonar/`)
- [x] Arquivos separados por responsabilidade (`versions.tf`, `providers.tf`, `variables.tf`, `locals.tf`, `cluster.tf`/`database.tf`/`main.tf`, `outputs.tf`) em cada stage
- [x] `terraform.tfvars.example` em cada stage documenta as variaveis

### Provisioning do cluster

- [x] Provisiona cluster `kind` (1 control-plane + N workers, default 2)
- [x] Gera kubeconfig automaticamente e expoe como output (`kubeconfig_path`)

### Provisioning do banco de dados

- [x] Instala PostgreSQL no cluster via `kubernetes_*` resources (`postgres:16-alpine`) + PVC
- [x] Banco com usuario, senha e database name configuraveis
- [x] Senha gerada pelo Terraform (`random_password`, com override opcional) e gravada em `kubernetes_secret` (`oficina-db`) no namespace da app — a app consome de la
- [x] `DATABASE_URL` montada e exposta como output mascarado (sensitive) e como Secret K8s

### Outputs

- [x] `kubeconfig_path` — caminho para configurar kubectl
- [x] `database_endpoint` — Service DNS interno do banco
- [x] `app_namespace` — namespace onde a app deve ser deployada
- [x] `connect_command` — comando pronto (`export KUBECONFIG=... && kubectl cluster-info --context kind-...`)

### Qualidade e documentacao

- [x] `terraform fmt -check` e `terraform validate` rodam sem erro (ambos os stages)
- [x] `infra/terraform/README.md` descreve recursos, pre-requisitos, apply/destroy, diagrama e o contrato do Secret
- [x] `.gitignore` cobre `*.tfstate*`, `.terraform/`, `*.tfvars` (mantendo `*.tfvars.example`)
- [x] Ordem de aplicacao documentada: **(1) Terraform apply 01 → 02 → (2) kubectl apply -k k8s/ → (3) Job de migrations roda**
- [x] Validado ao vivo em `kind`: apply provisiona cluster + Postgres + Secret; `DATABASE_URL` conecta de fato; destroy limpo
