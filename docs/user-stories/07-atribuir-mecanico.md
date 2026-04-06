# US-07: Atribuir Mecanico Responsavel a OS

**User Story:** Como Mecanico, quero me atribuir como responsavel por uma OS, para que o diagnostico possa ser iniciado.

**Prioridade:** Alta
**Story Points:** 2
**Status:** To Do
**DDD Domain:** OrdemDeServico (Bounded Context: Atendimento)
**DDD Layer:** Application

## Criterios de Aceite

- [ ] PATCH /ordens-servico/:id/responsavel - atribuir mecanico
- [ ] OS deve estar com status RECEBIDA
- [ ] Ao atribuir mecanico, status muda automaticamente para EM_DIAGNOSTICO (Policy)
- [ ] Registrar data/hora do inicio do diagnostico
- [ ] Retornar erro se OS nao estiver no status correto
