# US-17: Listagem e Detalhamento de OS (Gestao)

**User Story:** Como Gestor, quero listar e filtrar todas as ordens de servico, para ter visibilidade sobre o andamento da oficina.

**Prioridade:** Media
**Story Points:** 3
**Status:** To Do
**DDD Domain:** OrdemDeServico (Bounded Context: Atendimento)
**DDD Layer:** Interface + Application

## Criterios de Aceite

- [ ] GET /ordens-servico - listar com paginacao
- [ ] Filtrar por status, cliente, veiculo, data
- [ ] GET /ordens-servico/:id - detalhamento completo
- [ ] Incluir servicos, produtos, diagnostico, historico de status
- [ ] Monitoramento do tempo medio de execucao dos servicos
- [ ] Endpoint protegido por JWT (apenas admin/gestor)
