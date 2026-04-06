# US-02: CRUD Completo de Cliente

**User Story:** Como Atendente, quero consultar, atualizar e remover clientes cadastrados, para manter os dados sempre atualizados.

**Prioridade:** Alta
**Story Points:** 3
**Status:** To Do
**DDD Domain:** Cliente (Bounded Context: Atendimento)
**DDD Layer:** Application + Interface

## Criterios de Aceite

- [ ] GET /clientes - listar clientes com paginacao
- [ ] GET /clientes/:id - buscar cliente por ID
- [ ] GET /clientes/documento/:cpfCnpj - buscar por CPF/CNPJ
- [ ] PUT /clientes/:id - atualizar dados do cliente
- [ ] DELETE /clientes/:id - remover cliente (soft delete)
- [ ] Nao permitir remover cliente com OS em andamento
- [ ] Documentacao Swagger para todos os endpoints
