# US-F2-02: Webhook de Aprovacao de Orcamento (Notificacao Externa)

**User Story:** Como Sistema externo (portal do cliente, gateway de aprovacao por email/SMS), quero notificar via webhook que o cliente aprovou ou recusou o orcamento, para que a OS avance de status sem depender de login do cliente na API.

**Prioridade:** Alta
**Story Points:** 3
**Status:** To Do
**DDD Domain:** OrdemDeServico (Bounded Context: Atendimento)
**DDD Layer:** Interface + Application

## Contexto

Hoje `POST /ordens-servico/:id/aprovar-orcamento` exige JWT de cliente. A Fase 2 pede um endpoint que receba notificacoes externas (sem fluxo de login), tipico de gateway de pagamento/aprovacao.

## Criterios de Aceite

- [ ] Novo endpoint `POST /webhooks/ordens-servico/:id/aprovacao` em controller dedicado
- [ ] Marcado com `@Public()` (sem JWT) mas protegido por guard proprio
- [ ] Guard valida header `X-Webhook-Token` contra `WEBHOOK_APPROVAL_TOKEN` (env/Secret)
- [ ] Body: `{ aprovado: boolean, motivo?: string }`
- [ ] Quando `aprovado=true`: reaproveita `service.aprovarOrcamento(id)`
- [ ] Quando `aprovado=false`: reaproveita `service.reprovarOrcamento(id, motivo)`
- [ ] Resposta 200 com status atualizado da OS
- [ ] Resposta 401 quando token invalido/ausente
- [ ] Resposta 409 quando OS nao esta em AGUARDANDO_APROVACAO
- [ ] Testes e2e cobrindo: aprovacao OK, recusa OK, token invalido, OS em status invalido
- [ ] Swagger documenta o endpoint como tag separada (`Webhooks`)
