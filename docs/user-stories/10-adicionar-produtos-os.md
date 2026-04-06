# US-10: Adicionar Produtos/Pecas a OS

**User Story:** Como Mecanico, quero adicionar produtos e pecas a uma OS, para compor o orcamento e reservar os itens no estoque.

**Prioridade:** Alta
**Story Points:** 5
**Status:** To Do
**DDD Domain:** OrdemDeServico + Produto (Bounded Context: Atendimento + Estoque)
**DDD Layer:** Application + Domain

## Criterios de Aceite

- [ ] POST /ordens-servico/:id/produtos - adicionar produto
- [ ] OS deve estar com status EM_DIAGNOSTICO
- [ ] Produto deve existir no catalogo e ter estoque disponivel
- [ ] Reservar quantidade no estoque ao adicionar (Policy: reserva)
- [ ] Se produto sem estoque, informar ao mecanico para refazer orcamento (Policy v3)
- [ ] Orcamento e recalculado automaticamente
- [ ] Permitir remover produto (estorna reserva no estoque)
- [ ] Testes para fluxo de reserva e estorno de estoque
