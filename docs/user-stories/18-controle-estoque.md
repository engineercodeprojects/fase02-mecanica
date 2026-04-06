# US-18: Controle de Estoque (Entrada, Reserva e Baixa)

**User Story:** Como Gestor, quero controlar o estoque de pecas e insumos com entradas, reservas e baixas automaticas, para evitar falhas no fornecimento.

**Prioridade:** Alta
**Story Points:** 5
**Status:** To Do
**DDD Domain:** Produto (Bounded Context: Estoque)
**DDD Layer:** Domain + Application

## Criterios de Aceite

- [ ] POST /produtos/:id/entrada - registrar entrada de estoque
- [ ] Reservar produtos ao adicionar na OS (automatico)
- [ ] Dar baixa ao iniciar execucao do servico (Policy v3)
- [ ] Estornar reserva se OS cancelada/rejeitada
- [ ] Alerta quando quantidade atingir estoque minimo (Domain Event)
- [ ] Historico de movimentacoes de estoque
- [ ] Testes unitarios para regras de estoque
