---
name: ddd-review
description: Reviews the project code checking adherence to DDD, bounded contexts, ubiquitous language, and layer separation. Use to validate the architecture or before a PR.
---

# DDD Review

Analyze the project source code and verify adherence to Domain-Driven Design principles.

## What to verify

Read `CLAUDE.md` to understand the bounded contexts, ubiquitous language, and conventions.

### 1. Layer Separation

For each module in `src/`, verify:
- **Domain** — entities, value objects, and repository interfaces MUST NOT import from infrastructure
- **Application** — services/use cases depend only on the domain (interfaces), never on concrete implementations
- **Infrastructure** — controllers, DTOs, and Prisma repositories implement domain interfaces

Report dependency violations between layers.

### 2. Ubiquitous Language

Verify the code uses the correct terms:
- `OrdemDeServico` (not "ServiceOrder", "ticket", "order")
- `Produto` (not "peca", "part", "item")
- `Cliente`, `Veiculo`, `Servico`
- OS status as enum with correct values

### 3. Bounded Contexts

Verify modules don't leak responsibilities:
- Atendimento must not manipulate inventory directly
- Estoque must not know OS details
- Communication between contexts should be via events or interfaces

### 4. Value Objects

Verify domain validations are encapsulated:
- CPF/CNPJ — validation in the value object, not in the controller
- Placa — Brazilian old and Mercosul formats
- Prices — positive values
- Status — valid transitions (state machine)

### 5. Aggregates

Verify OrdemDeServico is the aggregate root and controls the consistency of its children (service items, product items).

## Report format

```
## DDD Summary

### Adherence by module
- [module]: OK | Issues found

### Violations found
1. [file:line] — description and fix suggestion

### Improvement suggestions
- ...
```
