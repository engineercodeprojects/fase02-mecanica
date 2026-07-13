# Arquitetura da Solução — Execução 100% Local

Desenho da arquitetura da **Oficina Mecânica** conforme foi desenvolvida e
executada **100% localmente** (sem provisionamento em nuvem). O foco é mostrar os
**recursos escolhidos** e como os componentes se comunicam na máquina do
desenvolvedor via **Docker Compose** (runtime principal) e, opcionalmente, em um
**cluster Kubernetes local (`kind`)** provisionado por Terraform.

> Para o PDF de entrega, use as imagens renderizadas (uma por diagrama):
> [runtime local](./arquitetura-local-1.png) ·
> [componentes (Clean Arch/DDD)](./arquitetura-local-2.png) ·
> [Kubernetes local (kind)](./arquitetura-local-3.png).
>
> Para regenerá-las:
> `npx -p @mermaid-js/mermaid-cli mmdc -i docs/arquitetura/arquitetura-local.md -o docs/arquitetura/arquitetura-local.png -b white -s 3`

---

## 1. Visão geral — runtime local (Docker Compose)

Todos os componentes rodam como containers na máquina local, orquestrados pelo
`docker-compose.yml`. O único ator externo é um **webhook de terceiros**
(ex.: `webhook.site`) usado para demonstrar notificações e a aprovação de
orçamento — não há dependência de nuvem.

```mermaid
flowchart TB
    subgraph Dev["Máquina local do desenvolvedor"]
        direction TB
        subgraph Browser["Navegador"]
            U1["Atendente / Gestor / Mecânico"]
            U2["Cliente"]
        end

        subgraph Compose["Docker Compose (rede local)"]
            direction TB
            WA["web-admin<br/>React + Vite + Tailwind<br/>nginx :8080"]
            WC["web-cliente<br/>React + Vite + Tailwind<br/>nginx :8081"]
            API["oficina-app · API REST<br/>NestJS + TypeScript (DDD / Clean Arch)<br/>JWT · Swagger /api · :3000"]
            DB[("PostgreSQL 16<br/>volume pgdata<br/>:5432")]
        end
    end

    EXT["Webhook externo<br/>(webhook.site / RequestBin)<br/>notificação + aprovação"]

    U1 --> WA
    U2 --> WC
    WA -- "HTTP / JSON<br/>Bearer JWT" --> API
    WC -- "HTTP / JSON<br/>Bearer JWT" --> API
    API -- "Prisma ORM<br/>DATABASE_URL" --> DB
    API -- "POST outbound<br/>X-Signature (HMAC-SHA256)" --> EXT
    EXT -- "POST /webhook aprovação<br/>(token)" --> API

    classDef front fill:#dbeafe,stroke:#3b82f6,color:#1e3a8a;
    classDef back fill:#dcfce7,stroke:#22c55e,color:#14532d;
    classDef data fill:#fef9c3,stroke:#eab308,color:#713f12;
    classDef ext fill:#f3e8ff,stroke:#a855f7,color:#581c87;
    class WA,WC front;
    class API back;
    class DB data;
    class EXT ext;
```

**Recursos escolhidos (runtime local):**

| Componente | Tecnologia | Porta local | Papel |
|---|---|---|---|
| Front Admin | React 18 + Vite + Tailwind (nginx) | `8080` | Painel para atendente/gestor/mecânico |
| Front Cliente | React 18 + Vite + Tailwind (nginx) | `8081` | Acompanhamento e aprovação pelo cliente |
| API | NestJS + TypeScript, DDD/Clean Architecture | `3000` | Regras de negócio, REST, JWT, Swagger |
| Banco | PostgreSQL 16 (volume `pgdata`) | `5432` | Persistência (ACID) via Prisma ORM |
| Orquestração | Docker Compose | — | Sobe todos os serviços e aplica migrations |
| Integração externa | Webhook HTTP (HMAC-SHA256) | — | Notificação de status + aprovação de orçamento |

---

## 2. Componentes da aplicação (Clean Architecture + DDD)

A API é um **monólito NestJS** organizado por **bounded contexts**, cada um em três
camadas com dependências apontando **para dentro** (Infra → Application → Domain).
O domínio não conhece framework nem ORM; a regra é garantida por teste
(`src/shared/architecture.spec.ts`).

```mermaid
flowchart TB
    subgraph Consumers["Consumidores"]
        FRONTS["Fronts web (admin/cliente)<br/>Swagger / Insomnia"]
        EXT["Sistema externo<br/>(webhook aprovação)"]
    end

    subgraph Infra["Infrastructure — adapters"]
        CTRL["Controllers REST<br/>(Guards JWT / Webhook token)"]
        REPO["Repositórios Prisma"]
        NOTIF["Notificador<br/>(mock | webhook outbound)"]
        FILTER["DomainExceptionFilter<br/>(DomainError → HTTP)"]
    end

    subgraph App["Application — casos de uso"]
        UC["Use Cases (execute)"]
        PORTS["Ports / Gateways (interfaces)"]
        LIST["Listeners de eventos (@OnEvent)"]
    end

    subgraph Domain["Domain — regra de negócio pura"]
        ENT["Entidades / Aggregates<br/>(OrdemDeServico)"]
        VO["Value Objects<br/>(CPF, Placa, StatusOS)"]
        EVT["Domain Events"]
    end

    FRONTS --> CTRL
    EXT --> CTRL
    CTRL --> UC
    UC --> PORTS
    UC --> ENT
    ENT --> VO
    ENT --> EVT
    PORTS -. implementado por .-> REPO
    PORTS -. implementado por .-> NOTIF
    EVT --> LIST
    LIST --> NOTIF
    REPO --> DB[("PostgreSQL")]
    NOTIF --> WH["Webhook externo"]
```

**Bounded contexts:** `Atendimento` (Cliente, Veículo, OrdemDeServico — aggregate
root), `Catálogo` (Serviço), `Estoque` (Produto), `Autenticação` (Usuário/JWT) e
`Notificação`. A comunicação entre contextos usa *ports* read-only de
anti-corrupção.

---

## 3. Kubernetes local (opcional) — `kind` + Terraform

Além do Docker Compose, a solução pode ser implantada em um **cluster Kubernetes
local `kind`** (Kubernetes-in-Docker), provisionado por Terraform em dois estágios.
**Continua 100% local** — não há EKS/RDS nem qualquer recurso em nuvem.

```mermaid
flowchart TB
    subgraph TF["Terraform (infra/terraform) — local"]
        TF1["01-cluster · provider tehcyx/kind"]
        TF2["02-app · Postgres (PVC+Deploy+Svc)<br/>+ Secret oficina-db (random_password)"]
    end

    TF1 ==> KIND
    subgraph KIND["Cluster kind (Docker local)"]
        subgraph NS["namespace: oficina"]
            CM["ConfigMap oficina-config"]
            SEC["Secrets<br/>oficina-db · oficina-app"]
            JOB["Job oficina-migrations<br/>prisma migrate deploy"]
            DEP["Deployment oficina-app<br/>2 réplicas · probes"]
            SVC["Service ClusterIP :3000"]
            HPA["HPA v2 · CPU 70% / Mem 80%<br/>min 2 · máx 10"]
            PG[("Postgres :5432")]
        end
    end

    TF2 ==> PG
    TF2 ==> SEC
    CM --> DEP
    SEC --> DEP
    SEC --> JOB
    JOB --> PG
    DEP --> PG
    SVC --> DEP
    HPA -- escala --> DEP
```

> **CI/CD:** o pipeline `.github/workflows/ci-cd.yml` sobe um cluster `kind`
> **efêmero** no runner (testes → build → imagem → `terraform apply` →
> `kubectl apply -k k8s/` → smoke test em `/health`), provando o deploy
> ponta-a-ponta sem nuvem.
