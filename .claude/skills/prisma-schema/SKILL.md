---
name: prisma-schema
description: Creates or updates the Prisma schema for a domain entity. Generates the model, relations, and migration. Use when you need to add tables to the database.
argument-hint: "[entity]"
---

# Prisma Schema

Add or update the Prisma model for the **$ARGUMENTS** entity.

## Step 1 — Context

Read `CLAUDE.md` to understand the domain and relationships between entities.
Read `prisma/schema.prisma` to see the current schema state.

## Step 2 — Define the Model

Create the model following these conventions:

```prisma
model EntityName {
  id        String   @id @default(uuid())
  // domain fields
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("table_name")  // snake_case for table
}
```

Conventions:
- **ID** — UUID as string
- **Timestamps** — createdAt and updatedAt on every table
- **Relations** — use explicit `@relation` with onDelete defined
- **Enums** — use Prisma enum for OS Status
- **Map** — camelCase fields in Prisma, snake_case in the table (`@map`)

## Step 3 — Expected Relations

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

## Step 4 — Migration

```bash
npx prisma migrate dev --name add-$ARGUMENTS
npx prisma generate
```

## Step 5 — Verify

- `npx prisma validate` must pass
- Confirm relations are correct
- List created/modified models
