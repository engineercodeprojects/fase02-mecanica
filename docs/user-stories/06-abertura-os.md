# US-06: Abertura de Ordem de Servico

**User Story:** Como Atendente, quero abrir uma ordem de servico identificando o cliente por CPF/CNPJ e vinculando um veiculo, para iniciar o fluxo de atendimento.

**Prioridade:** Alta
**Story Points:** 5
**Status:** To Do
**DDD Domain:** OrdemDeServico (Bounded Context: Atendimento)
**DDD Layer:** Domain + Application

## Criterios de Aceite

- [ ] Identificar cliente por CPF/CNPJ
- [ ] Listar veiculos do cliente para selecao (Read Model)
- [ ] OS criada com status inicial RECEBIDA
- [ ] Gerar numero unico para a OS
- [ ] Registrar data/hora de abertura
- [ ] POST /ordens-servico - criar nova OS
- [ ] Retornar 404 se cliente ou veiculo nao encontrado
- [ ] Testes unitarios para criacao da entidade OrdemDeServico
- [ ] Testes de integracao para o fluxo completo
