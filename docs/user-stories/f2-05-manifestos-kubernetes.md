# US-F2-05: Manifestos Kubernetes para Deploy da Aplicacao

**User Story:** Como DevOps, quero manifestos Kubernetes versionados no repositorio, para fazer deploy reproduzivel da aplicacao em qualquer cluster (local kind, EKS, GKE) com `kubectl apply -k`.

**Prioridade:** Alta
**Story Points:** 5
**Status:** To Do
**DDD Domain:** Infraestrutura
**DDD Layer:** Infrastructure

## Contexto

Os manifestos cobrem **apenas a aplicacao** (deployment, service, HPA, secrets, configmaps). O cluster e o banco de dados sao provisionados via Terraform (ver [US-F2-06](f2-06-terraform-iac.md)) — o PDF da Fase 2 exige IaC para cluster + DB. A app consome o DB via Service DNS (kind) ou endpoint RDS (cloud), injetado via Secret.

## Criterios de Aceite

- [ ] Diretorio `k8s/` criado na raiz
- [ ] `namespace.yaml` — namespace dedicado (ex: `oficina`)
- [ ] `configmap.yaml` — variaveis nao-sensiveis (`PORT`, `NODE_ENV`, `NOTIFICATION_PROVIDER`)
- [ ] `secret.yaml.example` — template para `JWT_SECRET`, `DATABASE_URL`, `WEBHOOK_APPROVAL_TOKEN`, `NOTIFICATION_WEBHOOK_SECRET` (com nota de NAO commitar `secret.yaml` real; em prod sera gerado pelo Terraform)
- [ ] `app/deployment.yaml` com 2 replicas iniciais, `livenessProbe`, `readinessProbe`, `resources.requests/limits`
- [ ] `app/service.yaml` (ClusterIP)
- [ ] `app/hpa.yaml` — HPA por CPU 70% (min=2, max=10) e por memoria
- [ ] `migrations-job.yaml` — Job que executa `prisma migrate deploy` antes do app subir (depende do DB ja existir, provisionado pelo Terraform)
- [ ] `kustomization.yaml` na raiz de `k8s/` agregando os recursos
- [ ] App lê `DATABASE_URL` do Secret (sem hardcode) — funciona com Postgres dentro do cluster (kind) ou RDS externo
- [ ] Validado em `kind` local: apos Terraform provisionar cluster + DB, `kubectl apply -k k8s/` sobe a app
- [ ] Validado HPA: gerar carga e ver `kubectl get hpa` escalando
- [ ] README seccao "Deploy em Kubernetes" com comandos passo a passo (na ordem: terraform apply → kubectl apply)
