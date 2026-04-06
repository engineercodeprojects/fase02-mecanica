# US-11: Calculo Automatico do Orcamento

**User Story:** Como Sistema, quero calcular automaticamente o orcamento da OS com base nos servicos e produtos adicionados, para apresentar o valor total ao cliente.

**Prioridade:** Alta
**Story Points:** 3
**Status:** To Do
**DDD Domain:** OrdemDeServico (Bounded Context: Atendimento)
**DDD Layer:** Domain

## Criterios de Aceite

- [ ] Orcamento = soma dos precos dos servicos + soma dos precos dos produtos
- [ ] Recalcular sempre que servico ou produto for adicionado/removido (Policy)
- [ ] Manter historico do valor do orcamento
- [ ] GET /ordens-servico/:id deve incluir o valor total do orcamento
- [ ] Testes unitarios para o calculo
