# US-F2-03: Adapter de Webhook para Notificacao de Mudanca de Status

**User Story:** Como Sistema, quero publicar via webhook (HTTP POST outbound) as mudancas de status da OS para um servico externo, para que o cliente receba a atualizacao (e-mail, SMS, push, etc.) sem que a aplicacao precise gerenciar infra de envio.

**Prioridade:** Alta
**Story Points:** 2
**Status:** To Do
**DDD Domain:** Notificacao (Bounded Context: Notificacao)
**DDD Layer:** Infrastructure (adapter)

## Contexto

Hoje existe apenas `MockEmailNotificador` que apenas loga a mensagem. A Fase 2 pede atualizacao de status da OS via ferramenta externa — o professor confirmou que **webhook outbound** atende o requisito (a aplicacao publica o evento, um servico externo entrega o e-mail). Isso evita acoplar a app a SMTP/Mailhog e mantem o adapter substituivel.

Importante diferenciar:
- **Webhook outbound (esta US):** a app envia HTTP POST quando o status muda
- **Webhook inbound (US-F2-02):** a app recebe HTTP POST de aprovacao externa

## Criterios de Aceite

- [ ] Novo `WebhookNotificador implements Notificador` ao lado de `mock-notificador.adapter.ts`
- [ ] Usa `HttpService` do `@nestjs/axios` (ou `fetch` nativo)
- [ ] Configuravel via env:
  - `NOTIFICATION_WEBHOOK_URL` — URL de destino (pode apontar para webhook.site/requestbin no demo)
  - `NOTIFICATION_WEBHOOK_SECRET` — chave usada para gerar header `X-Signature` (HMAC-SHA256 do body)
  - `NOTIFICATION_WEBHOOK_TIMEOUT_MS` — timeout (default 5000)
- [ ] Selecao do adapter via env `NOTIFICATION_PROVIDER=mock|webhook` (default: mock em dev, webhook em prod)
- [ ] Body do POST inclui: `ordemId`, `clienteId`, `statusAnterior`, `statusAtual`, `timestamp`, `tipoNotificacao`
- [ ] Header `Content-Type: application/json` + `X-Signature: sha256=<hmac>`
- [ ] Erros de entrega (timeout, 4xx, 5xx) nao quebram o fluxo principal — apenas logam o erro mantendo o contrato atual
- [ ] Retry simples: 1 tentativa adicional com backoff (opcional, se sobrar tempo)
- [ ] `.env.example` atualizado com as novas variaveis e um link para webhook.site como exemplo de destino para demo
- [ ] Teste unitario do `WebhookNotificador` com mock do HTTP client (sucesso, timeout, status 5xx)
- [ ] README documenta como apontar para webhook.site/requestbin durante o video de demonstracao
