---
name: implement-story
description: Implementa uma User Story do backlog. Use quando o usuario pedir para implementar uma US (ex. "implemente a US-06"). Le a story, segue os criterios de aceite e estrutura DDD do projeto.
argument-hint: "[numero-da-story]"
allowed-tools: "Read Write Edit Bash Grep Glob"
---

# Implementar User Story

Voce vai implementar a User Story **US-$ARGUMENTS**.

## Passo 1 — Contexto

Leia os seguintes arquivos para entender o contexto:
- `docs/user-stories/$ARGUMENTS*.md` (use glob para encontrar o arquivo exato)
- `CLAUDE.md` para convencoes e estrutura do projeto

## Passo 2 — Planejamento

Antes de codar, apresente ao usuario:
1. Quais arquivos serao criados/modificados
2. Quais entidades/value objects do dominio estao envolvidos
3. Quais dependencias precisam ser instaladas (se houver)
4. Estimativa de arquivos a criar

Aguarde confirmacao do usuario antes de prosseguir.

## Passo 3 — Implementacao

Siga a estrutura DDD do projeto (veja CLAUDE.md):

```
src/<modulo>/
├── domain/           # Entidades, Value Objects, interfaces de repositorio
├── application/      # Services, Use Cases
└── infrastructure/   # Controllers, DTOs, implementacao do repositorio Prisma
```

Regras:
- Use a linguagem ubiqua definida no CLAUDE.md (OrdemDeServico, Produto, etc.)
- Validacoes de dominio nos Value Objects (CPF/CNPJ, Placa, etc.)
- Status da OS como enum: RECEBIDA, EM_DIAGNOSTICO, AGUARDANDO_APROVACAO, EM_EXECUCAO, FINALIZADA, ENTREGUE, CANCELADA
- Controllers com decorators Swagger
- DTOs com class-validator
- Registre o modulo no app.module.ts

## Passo 4 — Prisma Schema

Se a story exigir novas tabelas:
1. Adicione os models ao `prisma/schema.prisma`
2. Gere a migration: `npx prisma migrate dev --name <descricao>`

## Passo 5 — Verificacao

- Rode `npx tsc --noEmit` para verificar compilacao
- Se testes forem exigidos nos criterios de aceite, implemente-os
- Liste os criterios de aceite atendidos vs pendentes

## Passo 6 — Resumo

No final, apresente:
- Arquivos criados/modificados
- Criterios de aceite atendidos (checklist)
- Proximos passos ou dependencias com outras stories
