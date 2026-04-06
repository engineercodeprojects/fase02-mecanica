# US-15: Finalizacao e Entrega do Veiculo

**User Story:** Como Atendente, quero registrar a entrega do veiculo ao cliente, para concluir o ciclo da ordem de servico.

**Prioridade:** Media
**Story Points:** 2
**Status:** To Do
**DDD Domain:** OrdemDeServico (Bounded Context: Atendimento)
**DDD Layer:** Application

## Criterios de Aceite

- [ ] PATCH /ordens-servico/:id/entregar
- [ ] OS deve estar com status FINALIZADA
- [ ] Status muda para ENTREGUE
- [ ] Registrar data/hora da entrega
- [ ] Notificar cliente sobre a entrega
