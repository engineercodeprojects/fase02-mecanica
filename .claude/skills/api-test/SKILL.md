---
name: api-test
description: Cria testes unitarios e de integracao para um modulo. Use apos implementar uma feature ou quando precisar aumentar cobertura. Foca nos dominios criticos com meta de 80%.
argument-hint: "[modulo]"
allowed-tools: "Read Write Edit Bash Grep Glob"
---

# Testes de API

Crie testes para o modulo **$ARGUMENTS**.

## Passo 1 — Analisar o que testar

Leia os arquivos do modulo em `src/$ARGUMENTS/` e identifique:

1. **Domain** — entidades, value objects, regras de negocio
2. **Application** — services, use cases, fluxos
3. **Infrastructure** — controllers (e2e), DTOs (validacao)

## Passo 2 — Testes Unitarios (Domain + Application)

Crie em `src/$ARGUMENTS/**/*.spec.ts`:

### Value Objects
```typescript
describe('CpfCnpj', () => {
  it('deve aceitar CPF valido', () => { ... });
  it('deve rejeitar CPF invalido', () => { ... });
  it('deve aceitar CNPJ valido', () => { ... });
});
```

### Entidades
- Criacao com dados validos
- Criacao com dados invalidos (deve lancar erro)
- Transicoes de estado validas e invalidas

### Services
- Mock dos repositorios (interface do dominio)
- Testar fluxos de sucesso
- Testar casos de erro (not found, estado invalido, duplicata)

## Passo 3 — Testes de Integracao (se aplicavel)

Para fluxos criticos (OS, estoque), crie testes e2e:
- Use `@nestjs/testing` com `Test.createTestingModule`
- Teste o fluxo completo via HTTP (supertest)
- Valide respostas, status codes e side effects

## Passo 4 — Executar

```bash
# Rodar testes do modulo
npx jest --testPathPattern=$ARGUMENTS --verbose

# Verificar cobertura
npx jest --testPathPattern=$ARGUMENTS --coverage
```

## Passo 5 — Relatorio

Apresente:
- Quantos testes criados (unitarios vs integracao)
- Cobertura atingida (meta: 80% nos dominios criticos)
- Gaps de cobertura restantes
