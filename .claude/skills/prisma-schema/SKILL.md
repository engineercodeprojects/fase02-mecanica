---
name: prisma-schema
description: Cria ou atualiza o schema Prisma para uma entidade do dominio. Gera o model, relacoes e migration. Use quando precisar adicionar tabelas ao banco.
argument-hint: "[entidade]"
allowed-tools: "Read Write Edit Bash Grep Glob"
---

# Prisma Schema

Adicione ou atualize o model Prisma para a entidade **$ARGUMENTS**.

## Passo 1 — Contexto

Leia o `CLAUDE.md` para entender o dominio e as relacoes entre entidades.
Leia `prisma/schema.prisma` para ver o estado atual do schema.

## Passo 2 — Definir o Model

Crie o model seguindo as convencoes:

```prisma
model NomeDaEntidade {
  id        String   @id @default(uuid())
  // campos do dominio
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("nome_da_tabela")  // snake_case para tabela
}
```

Convencoes:
- **ID** — UUID como string
- **Timestamps** — createdAt e updatedAt em toda tabela
- **Relacoes** — use `@relation` explicito com onDelete definido
- **Enums** — use Prisma enum para Status da OS
- **Map** — campos camelCase no Prisma, snake_case na tabela (`@map`)

## Passo 3 — Relacoes esperadas

```
Cliente 1---N Veiculo
Cliente 1---N OrdemDeServico
Veiculo 1---N OrdemDeServico
OrdemDeServico 1---N ItemServico
OrdemDeServico 1---N ItemProduto
Servico 1---N ItemServico
Produto 1---N ItemProduto
Produto 1---N MovimentacaoEstoque
```

## Passo 4 — Migration

```bash
npx prisma migrate dev --name add-$ARGUMENTS
npx prisma generate
```

## Passo 5 — Verificar

- `npx prisma validate` deve passar
- Conferir que relacoes estao corretas
- Listar models criados/alterados
