# US-03: Cadastro de Veiculo

**User Story:** Como Atendente, quero cadastrar veiculos vinculados a um cliente (placa, marca, modelo, ano), para que possam ser associados a ordens de servico.

**Prioridade:** Alta
**Story Points:** 3
**Status:** To Do
**DDD Domain:** Veiculo (Bounded Context: Atendimento)
**DDD Layer:** Domain + Interface

## Criterios de Aceite

- [ ] Veiculo deve estar vinculado a um cliente existente
- [ ] Campos obrigatorios: placa, marca, modelo, ano
- [ ] Placa deve ser validada (formato brasileiro antigo e Mercosul)
- [ ] Nao permitir duplicidade de placa
- [ ] CRUD completo (POST, GET, PUT, DELETE)
- [ ] GET /clientes/:id/veiculos - listar veiculos de um cliente
- [ ] Testes unitarios para validacao de placa
