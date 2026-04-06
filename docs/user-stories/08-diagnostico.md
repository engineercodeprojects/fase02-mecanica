# US-08: Adicionar Diagnostico a OS

**User Story:** Como Mecanico, quero registrar o diagnostico do veiculo na OS, para documentar os problemas identificados.

**Prioridade:** Alta
**Story Points:** 3
**Status:** To Do
**DDD Domain:** OrdemDeServico (Bounded Context: Atendimento)
**DDD Layer:** Domain + Application

## Criterios de Aceite

- [ ] PATCH /ordens-servico/:id/diagnostico - adicionar diagnostico
- [ ] OS deve estar com status EM_DIAGNOSTICO
- [ ] Diagnostico e um texto descritivo
- [ ] Registrar data/hora do diagnostico
- [ ] Permitir atualizar diagnostico enquanto OS estiver em diagnostico
