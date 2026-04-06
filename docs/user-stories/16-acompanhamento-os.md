# US-16: Acompanhamento da OS pelo Cliente

**User Story:** Como Cliente, quero consultar o status e detalhes da minha OS via API, para acompanhar o andamento do servico em tempo real.

**Prioridade:** Alta
**Story Points:** 3
**Status:** To Do
**DDD Domain:** OrdemDeServico (Bounded Context: Atendimento)
**DDD Layer:** Interface + Application

## Criterios de Aceite

- [ ] GET /ordens-servico/:id/status - consultar status
- [ ] Retornar status atual, servicos, produtos, valor total
- [ ] Permitir consulta por CPF/CNPJ do cliente
- [ ] GET /clientes/:cpfCnpj/ordens-servico - historico de OS do cliente
- [ ] Nao expor dados senssiveis (apenas dados da OS)
- [ ] Documentacao Swagger
