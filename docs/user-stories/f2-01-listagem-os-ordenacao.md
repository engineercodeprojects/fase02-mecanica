# US-F2-01: Listagem de OS com Ordenacao Customizada

**User Story:** Como Atendente, quero que a listagem de OS exiba primeiro as ordens em andamento (em execucao, aguardando aprovacao, diagnostico, recebida) e oculte as ja finalizadas e entregues, para focar minha atencao no que precisa de acao.

**Prioridade:** Alta
**Story Points:** 2
**Status:** To Do
**DDD Domain:** OrdemDeServico (Bounded Context: Atendimento)
**DDD Layer:** Infrastructure (repository) + Interface (controller/DTO)

## Contexto

A `findAll` atual em `prisma-ordem-de-servico.repository.ts` ordena apenas por `createdAt: desc` e nao filtra status terminais. A Fase 2 exige ordem custom por status e exclusao logica das OS finalizadas/entregues da listagem padrao.

## Criterios de Aceite

- [ ] GET /ordens-servico ordena por status na seguinte prioridade: EM_EXECUCAO > AGUARDANDO_APROVACAO > EM_DIAGNOSTICO > RECEBIDA
- [ ] Dentro do mesmo status, mais antigas primeiro (createdAt asc)
- [ ] OS com status FINALIZADA ou ENTREGUE sao excluidas da listagem por padrao
- [ ] Existe query param (ex: `incluirEncerradas=true`) para incluir FINALIZADA/ENTREGUE quando necessario
- [ ] Paginacao continua funcionando
- [ ] Filtros existentes (clienteId, status, numero) continuam funcionando
- [ ] Testes de integracao cobrem a nova ordem e o filtro padrao
- [ ] Swagger atualizado com a nova query e descricao da ordem
