# US-12: Concluir Orcamento e Enviar para Aprovacao

**User Story:** Como Mecanico, quero concluir o orcamento e enviar para aprovacao do cliente, para que ele possa autorizar ou recusar os servicos.

**Prioridade:** Alta
**Story Points:** 3
**Status:** To Do
**DDD Domain:** OrdemDeServico (Bounded Context: Atendimento)
**DDD Layer:** Application

## Criterios de Aceite

- [ ] PATCH /ordens-servico/:id/concluir-orcamento
- [ ] OS deve estar em EM_DIAGNOSTICO
- [ ] OS deve ter pelo menos um servico adicionado
- [ ] Status muda para AGUARDANDO_APROVACAO
- [ ] Notificar cliente que orcamento esta pronto (Policy)
- [ ] Registrar data/hora do envio
