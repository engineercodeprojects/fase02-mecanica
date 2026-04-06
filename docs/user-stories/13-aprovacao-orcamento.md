# US-13: Aprovacao/Rejeicao do Orcamento pelo Cliente

**User Story:** Como Cliente, quero aprovar ou recusar o orcamento da OS via API, para autorizar ou cancelar os servicos propostos.

**Prioridade:** Alta
**Story Points:** 5
**Status:** To Do
**DDD Domain:** OrdemDeServico (Bounded Context: Atendimento)
**DDD Layer:** Application + Domain

## Criterios de Aceite

- [ ] PATCH /ordens-servico/:id/aprovar - aprovar orcamento
- [ ] PATCH /ordens-servico/:id/recusar - recusar orcamento
- [ ] OS deve estar em AGUARDANDO_APROVACAO
- [ ] Ao aprovar: status muda para EM_EXECUCAO (Policy)
- [ ] Ao recusar: status muda para CANCELADA (Policy)
- [ ] Ao recusar: estornar reservas de estoque (Policy)
- [ ] Registrar data/hora da decisao
- [ ] Testes de integracao para ambos os fluxos
