# Plano de Execução — Fase 2 Tech Challenge

Organizado em ondas com dependências claras. Estimativas em dias-ideais de uma pessoa.

Referência do enunciado: [tech-challenges/fase-2-tech-challenge.pdf](tech-challenges/fase-2-tech-challenge.pdf)

---

## Decisões prévias

Tomar antes de começar — afetam o escopo das ondas seguintes.

| # | Decisão | Recomendação | Por quê |
|---|---|---|---|
| 1 | Onde rodará o cluster K8s | `kind` ou `minikube` (local) + Terraform AWS opcional como bônus | Demonstra HPA sem custo. Terraform pode provisionar EKS sem precisar "rodar" |
| 2 | Container registry | GHCR (`ghcr.io`) | Já vem com GitHub Actions, sem credenciais extras |
| 3 | Adapter de e-mail | Nodemailer + Mailhog no `docker-compose`; SMTP genérico em prod | Demonstrável local, sem credencial paga |
| 4 | Arquitetura escolhida no refactor | Manter DDD em camadas (já está) + documentar como Clean Architecture | O código já respeita as dependências, só precisa formalizar na documentação |

---

## Onda 1 — Ajustes de API (2 dias)

Sem dependência. Começa imediatamente.

**Objetivo:** fechar os 3 gaps funcionais que o PDF cobra explicitamente.

### US-F2-01 — Listagem ordenada de OS (0.5d)

- Editar `prisma-ordem-de-servico.repository.ts` (`findAll`)
- `WHERE status NOT IN (FINALIZADA, ENTREGUE)` por padrão (pode ter override via query param)
- Ordenação custom com `CASE WHEN` no `ORDER BY` (raw SQL ou enum-ordering): `EM_EXECUCAO > AGUARDANDO_APROVACAO > EM_DIAGNOSTICO > RECEBIDA`, mais antigas primeiro
- Atualizar testes de integração e e2e + Swagger

### US-F2-02 — Webhook de aprovação de orçamento (1d)

- Novo endpoint `POST /webhooks/ordens-servico/:id/aprovacao` (controller separado `webhooks.controller.ts`)
- Auth via header `X-Webhook-Token` (Secret) — `@Public()` + guard próprio, não JWT
- Body: `{ aprovado: boolean, motivo?: string }`
- Reaproveita `service.aprovarOrcamento` / `service.reprovarOrcamento`

### US-F2-03 — Adapter SMTP real (0.5d)

- Novo `SmtpNotificador implements Notificador` ao lado de `mock-notificador.adapter.ts`
- `nodemailer` + envvars `SMTP_HOST/PORT/USER/PASS/FROM`
- Provider escolhido por `NODE_ENV` ou flag no `.env`
- Mailhog no `docker-compose` para teste local

---

## Onda 2 — Revisão do container (0.5 dia)

Dependência: nenhuma. Pode rodar em paralelo com Onda 1.

- Revisar `Dockerfile`: multi-stage (builder + runtime slim), usuário não-root, `HEALTHCHECK`
- Revisar `docker-compose.yml`: adicionar mailhog, named volumes, `depends_on` com healthcheck
- Adicionar `.dockerignore` se faltar
- Imagem final: alpine + apenas `dist/`, `node_modules`, `prisma/`

---

## Onda 3 — Manifestos Kubernetes (3 dias)

Dependência: Onda 2 (imagem Docker pronta).

Criar `k8s/` com:

```
k8s/
├── namespace.yaml
├── configmap.yaml          # vars não-sensíveis
├── secret.yaml.example     # JWT_SECRET, SMTP_PASS, DB_PASS, WEBHOOK_TOKEN
├── postgres/
│   ├── statefulset.yaml
│   ├── service.yaml
│   └── pvc.yaml
├── app/
│   ├── deployment.yaml     # 2 réplicas, probes, resources
│   ├── service.yaml        # ClusterIP
│   ├── ingress.yaml        # opcional
│   └── hpa.yaml            # CPU 70%, min=2 max=10
└── migrations-job.yaml     # Job que roda `prisma migrate deploy`
```

Validar com `kind create cluster` localmente + `kubectl apply -k k8s/`.

---

## Onda 4 — Terraform (2 dias)

Dependência: nenhuma direta. Pode rodar em paralelo com Onda 3.

**Opção mínima (recomendada):** Terraform que provisiona um `kind` cluster local e namespace + secret + configmap usando o provider `kubernetes`.

**Opção bônus:** módulo separado provisionando EKS + RDS no AWS (não precisa estar "ligado", só demonstrar o IaC).

Estrutura:

```
infra/
├── README.md               # o que cria, como aplicar
├── main.tf
├── variables.tf
├── outputs.tf
├── kubernetes.tf           # namespace, secret, configmap
└── modules/
    └── eks/                # bônus
```

Mover `infra/sonar/` para `infra/sonar-legacy/` ou similar para não conflitar.

---

## Onda 5 — CI/CD completo (1.5 dia)

Dependência: Onda 3 (manifestos prontos).

Expandir `.github/workflows/security.yml` ou criar novo `deploy.yml`:

```yaml
jobs:
  test:           # já existe
  build-image:    # NOVO — docker build + push ghcr.io
  deploy:         # NOVO — só em push/main
    needs: [test, build-image]
    steps:
      - terraform apply (auto-approve em ambiente de PR)
      - kubectl apply -k k8s/
      - kubectl rollout status
```

Para o vídeo, usar `kind` em GitHub Action (`engineerd/setup-kind`) para demonstrar deploy real.

---

## Onda 6 — Documentação + diagrama (1 dia)

Dependência: tudo acima decidido.

- **Desenho de arquitetura** — usar Excalidraw ou draw.io, exportar `.png` + fonte para `docs/arquitetura/`. Mostrar:
  1. Componentes da app (camadas Nest, módulos por bounded context)
  2. Infra provisionada (cluster, pods, service, ingress, DB, secrets)
  3. Fluxo de deploy (push → CI → build image → terraform apply → kubectl apply → HPA escalando)
- **README.md** — adicionar seções:
  - Objetivos da Fase 2
  - Diagrama (imagem inline)
  - Execução local (já existe — só revisar)
  - Deploy K8s (`kubectl apply -k k8s/`)
  - Provisionamento Terraform (`terraform init/plan/apply`)
  - Link Swagger público (Cloudflare Tunnel ou ngrok temp para o vídeo)
  - Link do vídeo

---

## Onda 7 — Entrega final (0.5 dia)

Dependência: tudo pronto.

- **Vídeo (≤15min)** — roteiro:
  1. Deploy via CI/CD
  2. Ver pods subindo (`kubectl get pods -w`)
  3. Consumir 4-5 APIs via Postman / Swagger
  4. Gerar carga com `hey` ou `ab`
  5. Ver HPA criando pods
- **PDF de entrega** com: link do repo (+ convidar `soat-architecture`), imagem do diagrama, link do vídeo
- Compartilhar repo com usuário `soat-architecture`

---

## Cronograma sugerido (1 pessoa, 10 dias úteis)

```
Dia  1-2  │ Onda 1 (APIs)          ▓▓▓▓
Dia  1    │ Onda 2 (Docker)        ▓        (paralelo)
Dia  3-5  │ Onda 3 (K8s)           ▓▓▓▓▓▓
Dia  3-4  │ Onda 4 (Terraform)     ▓▓▓▓     (paralelo)
Dia  6-7  │ Onda 5 (CI/CD)         ▓▓▓
Dia  8    │ Onda 6 (Docs + diag)   ▓▓
Dia  9    │ Onda 7 (Vídeo + PDF)   ▓
Dia  10   │ Buffer / correções     ░░
```

---

## Estado do repositório no início da Fase 2

### Pronto

- Refactor com camadas separadas (DDD) em `src/`
- Testes unitários + integração + gate 80% no CI (`.github/workflows/security.yml`)
- API: Abertura de OS (`ordem-de-servico.controller.ts`)
- API: Consulta de status (`GET /ordens-servico/:id`)
- Dockerfile + docker-compose básicos
- Swagger em `http://localhost:3000/api`

### Parcialmente pronto

- **Listagem de OS** — só ordena por `createdAt:desc`, sem filtro de status nem ordem custom
- **Aprovação de orçamento** — existe `POST /:id/aprovar-orcamento` autenticado por JWT de cliente; falta endpoint webhook externo
- **Notificação por e-mail** — só existe `MockEmailNotificador` (loga no console)
- **CI/CD** — só build + testes + coverage; falta build/push de imagem, deploy K8s, deploy DB
- **README** — falta arquitetura, instruções K8s, instruções Terraform, link Postman, link do vídeo

### Não iniciado

- Manifestos Kubernetes (`k8s/`)
- Terraform (`infra/` no formato pedido)
- Desenho de arquitetura
- Vídeo demonstrativo
- PDF final de entrega
