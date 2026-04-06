# US-09: Adicionar Servicos a OS

**User Story:** Como Mecanico, quero adicionar servicos do catalogo a uma OS, para compor o orcamento do reparo.

**Prioridade:** Alta
**Story Points:** 3
**Status:** To Do
**DDD Domain:** OrdemDeServico (Bounded Context: Atendimento)
**DDD Layer:** Application

## Criterios de Aceite

- [ ] POST /ordens-servico/:id/servicos - adicionar servico
- [ ] OS deve estar com status EM_DIAGNOSTICO
- [ ] Servico deve existir no catalogo
- [ ] Registrar quantidade e preco unitario no momento da inclusao
- [ ] Orcamento da OS e recalculado automaticamente (Policy)
- [ ] Permitir remover servico da OS
- [ ] DELETE /ordens-servico/:id/servicos/:servicoId
