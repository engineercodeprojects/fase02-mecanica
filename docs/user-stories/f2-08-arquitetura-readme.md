# US-F2-08: Desenho de Arquitetura e Atualizacao do README

**User Story:** Como Avaliador/Novo desenvolvedor, quero um diagrama claro da arquitetura e instrucoes completas no README, para entender a solucao e conseguir rodar/deployar sem precisar reverse-engineer do codigo.

**Prioridade:** Alta
**Story Points:** 3
**Status:** To Do
**DDD Domain:** Documentacao
**DDD Layer:** —

## Criterios de Aceite

- [ ] Diretorio `docs/arquitetura/` criado
- [ ] Diagrama exportado em `.png` (ou `.svg`) + arquivo-fonte (`.excalidraw` / `.drawio`) commitado
- [ ] Diagrama mostra:
  - **Componentes da aplicacao**: modulos por bounded context (Atendimento, Catalogo, Estoque, Auth, Notificacao), camadas (Domain/Application/Infrastructure/Interface)
  - **Infraestrutura provisionada**: cluster K8s, pods, service, ingress, DB (StatefulSet ou RDS), ConfigMaps/Secrets, fluxo de webhook outbound para servico externo de notificacao
  - **Fluxo de deploy**: push → CI (test, build image, push GHCR) → CD (terraform apply, kubectl apply, migrations job) → HPA escalando
- [ ] README.md com nova seccao **"Fase 2 — Arquitetura e Deploy"**:
  - Objetivos da Fase 2 (refactor, K8s, IaC, CI/CD)
  - Imagem do diagrama inline
  - Como rodar localmente com Docker Compose
  - Como deployar em Kubernetes (`kubectl apply -k k8s/`)
  - Como provisionar com Terraform (`terraform init/plan/apply`)
  - Link para Swagger (publico via Cloudflare Tunnel/ngrok durante o video, ou apontar para `localhost:3000/api`)
  - Link para Postman Collection (se gerada) ou apontar para Swagger
  - Link para o video demonstrativo
- [ ] README revisado para remover instrucoes obsoletas/redundantes
- [ ] Badges de CI, coverage, etc. no topo
