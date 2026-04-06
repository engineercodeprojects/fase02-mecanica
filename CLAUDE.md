# Sistema Integrado de Oficina Mecanica - Tech Challenge FIAP

## Sobre o projeto

MVP do back-end de um sistema para oficina mecanica de medio porte, com foco em gestao de ordens de servico, clientes, veiculos e pecas. Desenvolvido em NestJS com Domain-Driven Design (DDD), PostgreSQL via Prisma ORM.

**Stack:** NestJS + TypeScript + Prisma + PostgreSQL + Docker
**Arquitetura:** Monolito em camadas seguindo DDD tatico

## Documentacao DDD (Miro)

O Event Storming completo esta no board do Miro (ID: `uXjVGwyI88w=`).
A versao mais recente e o **Event Storming v3 (30/03)**.

### Bounded Contexts

- **Atendimento** — Cliente, Veiculo, OrdemDeServico (aggregate root)
- **Catalogo** — Servico
- **Estoque** — Produto (pecas e insumos), movimentacoes
- **Autenticacao** — Usuario, JWT
- **Notificacao** — envio de alertas ao cliente

### Atores

- **Cliente** — aprova/recusa orcamento, acompanha OS
- **Atendente** — cadastra cliente, abre OS, entrega veiculo
- **Mecanico** — diagnostica, adiciona servicos/produtos, executa
- **Gestor** — gerencia catalogos, monitora KPIs
- **Sistema** — calcula orcamento, transiciona status, notifica

### Fluxo da Ordem de Servico (maquina de estados)

```
RECEBIDA -> EM_DIAGNOSTICO -> AGUARDANDO_APROVACAO -> EM_EXECUCAO -> FINALIZADA -> ENTREGUE
                                      |
                                      v
                                  CANCELADA
```

**Transicoes automaticas (Policies):**
- Mecanico se atribui a OS -> status muda para EM_DIAGNOSTICO
- Mecanico conclui orcamento -> AGUARDANDO_APROVACAO + notifica cliente
- Cliente aprova -> EM_EXECUCAO
- Cliente recusa -> CANCELADA + estorna reservas de estoque
- Todos servicos concluidos -> FINALIZADA
- Ao iniciar execucao -> baixa dos produtos no estoque

## User Stories

As user stories estao em `docs/user-stories/` e tambem no board do Notion (Tech Challenge Board).

### Sprint 1 — Fundacao + CRUDs independentes (19 SP)

| # | Story | SP | Modulo |
|---|---|---|---|
| US-00 | Setup Prisma + PostgreSQL | 5 | Infraestrutura |
| US-21 | Docker e Infraestrutura | 3 | Infraestrutura |
| US-01 | Cadastro de Cliente | 3 | Atendimento |
| US-04 | Catalogo de Servicos | 3 | Catalogo |
| US-05 | Catalogo de Produtos | 5 | Estoque |

### Sprint 2 — CRUD complementar + Abertura da OS

| # | Story | SP | Modulo |
|---|---|---|---|
| US-02 | CRUD Completo de Cliente | 3 | Atendimento |
| US-03 | Cadastro de Veiculo | 3 | Atendimento |
| US-06 | Abertura de Ordem de Servico | 5 | Atendimento |
| US-19 | Autenticacao JWT | 5 | Autenticacao |

### Sprint 3 — Fluxo da OS (diagnostico ate aprovacao)

| # | Story | SP | Modulo |
|---|---|---|---|
| US-07 | Atribuir Mecanico a OS | 2 | Atendimento |
| US-08 | Diagnostico | 3 | Atendimento |
| US-09 | Adicionar Servicos a OS | 3 | Atendimento |
| US-10 | Adicionar Produtos a OS | 5 | Atendimento + Estoque |
| US-11 | Calculo Automatico do Orcamento | 3 | Atendimento |
| US-12 | Concluir e Enviar Orcamento | 3 | Atendimento |

### Sprint 4 — Execucao, entrega e complementos

| # | Story | SP | Modulo |
|---|---|---|---|
| US-13 | Aprovacao/Rejeicao do Orcamento | 5 | Atendimento |
| US-14 | Execucao dos Servicos | 5 | Atendimento |
| US-15 | Finalizacao e Entrega | 2 | Atendimento |
| US-16 | Acompanhamento da OS pelo Cliente | 3 | Atendimento |
| US-18 | Controle de Estoque | 5 | Estoque |

### Sprint 5 — Monitoramento, testes e finalizacao

| # | Story | SP | Modulo |
|---|---|---|---|
| US-17 | Listagem de OS + Monitoramento de tempo medio | 5 | Atendimento |
| US-20 | Notificacao ao Cliente | 3 | Notificacao |
| US-22 | Testes Automatizados (cobertura 80%) | 8 | Todos |
| US-23 | Documentacao Swagger | 2 | Todos |

## Como trabalhar com as user stories

Ao iniciar uma tarefa, leia o arquivo correspondente em `docs/user-stories/` para contexto completo.

Exemplo:
- "Implemente a US-06" -> leia `docs/user-stories/06-abertura-os.md` e siga os criterios de aceite
- "Qual a proxima tarefa?" -> consulte a sprint atual na tabela acima

Cada user story contem:
- **User story** no formato "Como [ator], quero [acao], para que [beneficio]"
- **Criterios de aceite** como checklist
- **DDD Domain** e **DDD Layer** indicando onde implementar
- **Story Points** e **Prioridade**

## Estrutura esperada do projeto (apos Sprint 1)

```
src/
├── main.ts
├── app.module.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── cliente/
│   ├── cliente.module.ts
│   ├── domain/
│   │   ├── cliente.entity.ts
│   │   └── cliente.repository.ts      # interface
│   ├── application/
│   │   └── cliente.service.ts
│   └── infrastructure/
│       ├── cliente.controller.ts
│       ├── dto/
│       └── prisma-cliente.repository.ts
├── servico/
│   └── ...  (mesma estrutura)
└── produto/
    └── ...  (mesma estrutura)
```

## Convencoes

- **Linguagem Ubiqua** — usar termos do dominio: OrdemDeServico (nao "ticket"), Produto (nao "peca"), Cliente, Veiculo
- **Validacoes** — CPF/CNPJ e placa devem ser validados no dominio (Value Objects)
- **Status da OS** — usar enum: RECEBIDA, EM_DIAGNOSTICO, AGUARDANDO_APROVACAO, EM_EXECUCAO, FINALIZADA, ENTREGUE, CANCELADA
- **APIs** — RESTful, documentadas com Swagger decorators
- **Banco** — PostgreSQL, justificativa: suporte robusto a transacoes ACID, tipos de dados ricos, maturidade
- **Testes** — cobertura minima de 80% nos dominios criticos

## MCP Servers disponiveis

- **Notion** — criar/ler/atualizar tarefas no board "Tech Challenge Board"
- **Miro** — ler o Event Storming do board `uXjVGwyI88w=`

Database Notion ID: `33a48f0b-bca5-805d-ac88-ed5a914239b0`
Data Source ID: `33a48f0b-bca5-8071-a6bd-000bcbd098d7`
