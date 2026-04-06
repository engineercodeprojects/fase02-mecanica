# US-20: Notificacao ao Cliente

**User Story:** Como Sistema, quero notificar o cliente sobre mudancas de status da OS, para que ele acompanhe o progresso sem precisar consultar ativamente.

**Prioridade:** Media
**Story Points:** 3
**Status:** To Do
**DDD Domain:** Notificacao (Bounded Context: Notificacao)
**DDD Layer:** Infrastructure + Application

## Criterios de Aceite

- [ ] Enviar notificacao quando orcamento estiver pronto (Policy)
- [ ] Enviar notificacao quando OS for finalizada
- [ ] Enviar notificacao quando veiculo estiver pronto para retirada
- [ ] Mecanismo de notificacao extensivel (email como MVP)
- [ ] Registrar historico de notificacoes enviadas
- [ ] Nao bloquear fluxo principal se notificacao falhar
