# US-14: Execucao dos Servicos

**User Story:** Como Mecanico, quero registrar o inicio e conclusao da execucao de cada servico na OS, para controlar o andamento do trabalho.

**Prioridade:** Alta
**Story Points:** 5
**Status:** To Do
**DDD Domain:** OrdemDeServico (Bounded Context: Atendimento)
**DDD Layer:** Application + Domain

## Criterios de Aceite

- [ ] PATCH /ordens-servico/:id/servicos/:servicoId/iniciar - iniciar execucao
- [ ] PATCH /ordens-servico/:id/servicos/:servicoId/concluir - concluir servico
- [ ] OS deve estar em EM_EXECUCAO
- [ ] Registrar horas trabalhadas por servico
- [ ] Dar baixa nos produtos utilizados no estoque ao iniciar execucao (Policy v3)
- [ ] Quando todos servicos concluidos, status muda para FINALIZADA automaticamente
- [ ] Monitorar tempo medio de execucao
