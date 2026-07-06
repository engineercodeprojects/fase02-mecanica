# US-F2-07: Pipeline CI/CD com Verificacao de Deploy

**User Story:** Como Desenvolvedor/DevOps, quero que cada push execute testes, construa a imagem Docker e **verifique que o deploy funciona ponta a ponta em um cluster real**, para garantir que o pipeline esta correto sem precisar de um cluster cloud permanente.

**Prioridade:** Alta
**Story Points:** 5
**Status:** To Do
**DDD Domain:** Infraestrutura
**DDD Layer:** Infrastructure (CI/CD)

## Contexto

A Fase 2 nao requer deploy em provider cloud permanente. A pipeline deve **provar que o deploy funcionaria** rodando o fluxo completo (Terraform → manifestos K8s → smoke test) dentro de um cluster `kind` efemero criado no runner. Isso:

- Atende ao PDF literalmente ("Deploy no cluster Kubernetes" — kind e um cluster K8s real)
- Evita custo e gestao de credenciais cloud
- Da feedback rapido a cada PR/push (~3-5min extra)

Cluster cloud real fica como passo futuro nao definido.

Hoje `.github/workflows/security.yml` cobre testes + coverage + SAST + Sonar. Falta build de imagem, push para registry e verificacao do deploy.

## Criterios de Aceite

### Jobs

- [ ] Workflow novo `.github/workflows/ci-cd.yml` (manter `security.yml` como esta)
- [ ] Job `test` — reaproveita logica atual (gate 80%, lint, etc.)
- [ ] Job `build-image`:
  - Build da imagem Docker (multi-stage da US-F2-04)
  - Tag com `sha` + `latest` (so `latest` em `main`)
  - Push para GHCR (`ghcr.io/<org>/<repo>`)
  - Usa `GITHUB_TOKEN` (sem secret extra)
- [ ] Job `verify-deploy` (depende de `test` + `build-image`):
  - Cria cluster `kind` no runner via `helm/kind-action` ou `engineerd/setup-kind`
  - Roda `terraform init && terraform apply -auto-approve -var="cloud_provider=local"` (provisiona DB Postgres via Helm dentro do kind, cria Secret/ConfigMap/namespace)
  - Carrega a imagem recem-construida no kind (`kind load docker-image`)
  - `kubectl apply -k k8s/` aplicando manifestos da app
  - `kubectl wait --for=condition=available deployment/app -n oficina --timeout=180s`
  - `kubectl wait --for=condition=complete job/migrations -n oficina --timeout=120s`
  - **Smoke test:** port-forward + `curl /health` (ou endpoint Swagger) — exit non-zero se falhar
  - Logs do app sao publicados como artifact em caso de falha

### Qualidade da pipeline

- [ ] Pipeline roda end-to-end em PR e em push para `main`
- [ ] Tempo total alvo: <10 minutos
- [ ] Badge de status no README
- [ ] Falha do `verify-deploy` bloqueia merge

### Documentacao

- [ ] README documenta:
  - Que o pipeline valida deploy via kind, nao em cloud
  - Como reproduzir localmente os mesmos comandos (`kind create cluster && terraform apply && kubectl apply`)
  - Onde encontrar o log do `verify-deploy` para inspecao
- [ ] Mesma sequencia de comandos servira para o video da US-F2-09
