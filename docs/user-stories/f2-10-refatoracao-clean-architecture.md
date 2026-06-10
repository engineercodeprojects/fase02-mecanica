# US-F2-10: Refatoracao para Clean Architecture (Use Cases + Gateways + Presenters)

**User Story:** Como Avaliador/Arquiteto, quero que o codigo siga a Clean Architecture a risca (entidades, use cases isolados, gateways e presenters), para que a solucao atenda ao criterio de arquitetura limpa exigido na Fase 2 e fique testavel e desacoplada do framework.

**Prioridade:** Alta
**Story Points:** 8
**Status:** To Do
**DDD Domain:** Transversal (todos os bounded contexts)
**DDD Layer:** Application + Interface (Infrastructure como detalhe)

## Contexto

Avaliacao do estado atual (~65-70% de aderencia a Clean Architecture):

**Ja existe e esta correto:**
- Camadas `domain` / `application` / `infrastructure` separadas em todos os modulos
- Ports de repositorio no dominio implementados por adapters Prisma (ex: `cliente.repository.ts` -> `prisma-cliente.repository.ts`)
- Entidades de dominio puras (sem decorators de framework/Prisma)
- Inversao de dependencia via tokens NestJS (`@Inject(CLIENTE_REPOSITORY)`)
- Port de gateway externo `Notificador` (`notificacao/application/ports/notificador.port.ts`)

**Gaps para a Clean Architecture estrita (foco desta US):**
1. Nao ha Use Cases explicitos — logica concentrada em fat services (ex: `ordem-de-servico.service.ts`, ~445 linhas, 21 metodos)
2. Nao ha camada Gateway nomeada (Controller -> Use Case -> Gateway -> Repository/Prisma); hoje os ports de repositorio fazem esse papel mas sem o naming/estrutura que a banca espera
3. Sem Presenters — formatacao de resposta esta como `toResponse()` inline nos controllers
4. Sem objetos de Input/Output por use case — DTOs HTTP vazam para a camada de aplicacao
5. Domain events acoplados ao `EventEmitter2` do NestJS
6. Traducao de excecao dominio->HTTP espalhada nos controllers (sem exception filter global)

## Objetivo

Refatorar o codigo para o fluxo Clean Architecture estrito, sem alterar o comportamento externo das APIs (mesmos contratos REST). Comecar por 1 modulo de referencia (OrdemDeServico) e replicar o padrao.

Fluxo alvo:

```
Controller (interface)
  -> Use Case (application, 1 responsabilidade)
    -> Gateway (interface/port)
      -> Repository Adapter (infra/Prisma) | Notificador | servico externo
  -> Presenter (formata saida) -> DTO de resposta
```

## Criterios de Aceite

### Estrutura e padrao
- [ ] Definir e documentar o padrao alvo em `docs/arquitetura/clean-architecture.md` (camadas, papel de cada artefato, regra de dependencia, exemplo de fluxo de uma request)
- [ ] Introduzir camada **Gateway** explicita: interfaces de gateway na aplicacao + adapters na infraestrutura (os repositorios Prisma passam a implementar gateways)
- [ ] Extrair **Use Cases** isolados (uma classe por caso de uso) a partir dos fat services, comecando por OrdemDeServico (ex: `CriarOrdemDeServicoUseCase`, `AtribuirMecanicoUseCase`, `AprovarOrcamentoUseCase`, `AdicionarServicoUseCase`, etc.)
- [ ] Introduzir **Presenters** para a formatacao de saida (remover `toResponse()` inline dos controllers)
- [ ] Definir objetos de **Input/Output** por use case (desacoplar DTO HTTP da aplicacao)

### Modulo de referencia + replicacao
- [ ] OrdemDeServico totalmente migrado para o padrao (modulo de referencia)
- [ ] Replicar o padrao para Cliente, Veiculo, Servico, Produto, Autenticacao e Notificacao
- [ ] Fat services antigos removidos ou reduzidos a orquestracao fina (sem regra de negocio)

### Desacoplamento
- [ ] Abstrair publicacao de domain events atras de uma interface (DomainEventPublisher) com adapter sobre o EventEmitter2 — application deixa de depender do framework de eventos
- [ ] Exception filter/interceptor global traduz erros de dominio -> HTTP (remover try/catch repetido nos controllers)

### Qualidade
- [ ] Regra de dependencia validada: domain nao importa application/infra; application nao importa Prisma/Nest HTTP; nenhuma violacao para dentro->fora
- [ ] (Opcional, se sobrar tempo) Lint de fronteiras com `eslint-plugin-boundaries` ou regra de import para impedir regressoes
- [ ] Testes existentes continuam passando; cobertura mantida (>=80% nos dominios criticos)
- [ ] Novos testes unitarios por use case (mockando gateways) demonstrando isolamento
- [ ] Contratos REST inalterados (mesmos endpoints, payloads e status) — validar com a colecao/Swagger atual
- [ ] Diagrama da US-F2-08 atualizado para refletir Use Cases / Gateways / Presenters

## Notas

- Refatoracao incremental por modulo para manter o app sempre verde; nao precisa ser um big-bang.
- Esta US conversa com a US-F2-08 (diagrama de arquitetura) — manter ambos alinhados.
