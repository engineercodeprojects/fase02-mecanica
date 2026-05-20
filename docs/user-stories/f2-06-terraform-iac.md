# US-F2-06: Infraestrutura como Codigo com Terraform (Cluster + Banco)

**User Story:** Como DevOps, quero scripts Terraform que provisionem o cluster Kubernetes **e o banco de dados**, para que toda a infraestrutura seja versionada, reproduzivel e auditavel, conforme exige a Fase 2.

**Prioridade:** Alta
**Story Points:** 8
**Status:** To Do
**DDD Domain:** Infraestrutura
**DDD Layer:** Infrastructure

## Contexto

O PDF da Fase 2 exige explicitamente Terraform para **cluster Kubernetes (local ou cloud) e banco de dados**. Por isso o Postgres NAO esta nos manifestos K8s (ver [US-F2-05](f2-05-manifestos-kubernetes.md)) — fica sob responsabilidade do Terraform, mantendo separacao entre provisioning (IaC) e application deploy (manifestos).

## Estrategia: dois modos

| Modo | Cluster | Banco |
|---|---|---|
| **Local (default)** | `kind` cluster via provider `tehcyx/kind` | Postgres via Helm chart (`bitnami/postgresql`) ou recursos `kubernetes_*` dentro do cluster |
| **Cloud (AWS)** | EKS via modulo `terraform-aws-modules/eks` | RDS Postgres via `aws_db_instance` |

Selecao via variavel `cloud_provider = "local" \| "aws"`.

## Criterios de Aceite

### Estrutura

- [ ] Diretorio `infra/terraform/` (nao conflitar com `infra/sonar/` atual)
- [ ] `main.tf`, `variables.tf`, `outputs.tf`, `versions.tf` separados
- [ ] `terraform.tfvars.example` documenta as variaveis necessarias

### Provisioning do cluster

- [ ] Modo **local**: provisiona cluster `kind` (1 control-plane + 1+ workers)
- [ ] Modo **cloud**: provisiona EKS minimo (1 node group `t3.small`)
- [ ] Gera kubeconfig automaticamente e expoe como output

### Provisioning do banco de dados

- [ ] Modo **local**: instala PostgreSQL no cluster (via Helm provider apontando para chart `bitnami/postgresql`, ou via `kubernetes_*` resources)
- [ ] Modo **cloud**: cria RDS PostgreSQL (`aws_db_instance` com `db.t3.micro`, single-AZ, sem backup automatizado — apenas demo)
- [ ] Banco com: usuario, senha (random_password), database name configuraveis
- [ ] Senha gerada pelo Terraform (`random_password`) e gravada em `kubernetes_secret` no namespace da app — a app consome de la
- [ ] `DATABASE_URL` montada e exposta como output (mascarada) e como Secret K8s

### Outputs

- [ ] `kubeconfig_path` — caminho para configurar kubectl
- [ ] `database_endpoint` — endpoint do DB (Service DNS local ou RDS endpoint)
- [ ] `app_namespace` — namespace onde a app deve ser deployada
- [ ] Comando pronto para o usuario: `aws eks update-kubeconfig ...` (modo cloud) ou `kubectl cluster-info --context kind-...` (local)

### Qualidade e documentacao

- [ ] `terraform fmt -check` e `terraform validate` rodam sem erro
- [ ] `infra/terraform/README.md` descreve:
  - O que cada recurso cria (cluster, DB, secret, namespace)
  - Pre-requisitos por modo (Docker para local; AWS CLI/credenciais para cloud)
  - Como aplicar: `terraform init && terraform plan && terraform apply -var="cloud_provider=local"`
  - Como destruir: `terraform destroy`
  - Diagrama simples do que e criado
- [ ] `.gitignore` cobre `*.tfstate*`, `.terraform/`, `*.tfvars` (mantendo `*.tfvars.example`)
- [ ] Ordem de aplicacao documentada: **(1) Terraform apply → (2) kubectl apply -k k8s/ → (3) Job de migrations roda**
