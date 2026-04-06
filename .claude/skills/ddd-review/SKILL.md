---
name: ddd-review
description: Revisa o codigo do projeto verificando aderencia ao DDD, bounded contexts, linguagem ubiqua e separacao de camadas. Use quando quiser validar a arquitetura ou antes de um PR.
allowed-tools: "Read Grep Glob"
context: fork
agent: Explore
---

# Revisao DDD

Analise o codigo-fonte do projeto e verifique a aderencia aos principios de Domain-Driven Design.

## O que verificar

Leia o `CLAUDE.md` para entender os bounded contexts, linguagem ubiqua e convencoes.

### 1. Separacao de Camadas

Para cada modulo em `src/`, verifique:
- **Domain** — entidades, value objects e interfaces de repositorio NAO devem importar de infrastructure
- **Application** — services/use cases dependem apenas do dominio (interfaces), nunca de implementacoes concretas
- **Infrastructure** — controllers, DTOs e repositorios Prisma implementam interfaces do dominio

Reporte violacoes de dependencia entre camadas.

### 2. Linguagem Ubiqua

Verifique se o codigo usa os termos corretos:
- `OrdemDeServico` (nao "ServiceOrder", "ticket", "order")
- `Produto` (nao "peca", "part", "item")
- `Cliente`, `Veiculo`, `Servico`
- Status da OS como enum com valores corretos

### 3. Bounded Contexts

Verifique se modulos nao vazam responsabilidades:
- Atendimento nao deve manipular estoque diretamente
- Estoque nao deve conhecer detalhes da OS
- Comunicacao entre contexts deve ser via eventos ou interfaces

### 4. Value Objects

Verifique se validacoes de dominio estao encapsuladas:
- CPF/CNPJ — validacao no value object, nao no controller
- Placa — formato brasileiro antigo e Mercosul
- Precos — valores positivos
- Status — transicoes validas (maquina de estados)

### 5. Aggregates

Verifique se OrdemDeServico e o aggregate root e controla a consistencia dos seus filhos (itens de servico, itens de produto).

## Formato do report

```
## Resumo DDD

### Aderencia por modulo
- [modulo]: OK | Problemas encontrados

### Violacoes encontradas
1. [arquivo:linha] — descricao e sugestao de correcao

### Sugestoes de melhoria
- ...
```
