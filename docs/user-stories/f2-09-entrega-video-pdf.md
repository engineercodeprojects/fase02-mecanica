# US-F2-09: Entrega Final — Video Demonstrativo e PDF

**User Story:** Como Estudante, quero entregar o video e o PDF no portal do aluno conforme exige a Fase 2, para concluir a avaliacao.

**Prioridade:** Alta
**Story Points:** 2
**Status:** To Do
**DDD Domain:** Entrega
**DDD Layer:** —

## Criterios de Aceite

### Video (YouTube/Vimeo, publico ou nao listado, ate 15 minutos)

- [ ] Roteiro escrito antes da gravacao em `docs/arquitetura/roteiro-video.md`
- [ ] Demonstra **execucao do CI/CD** (workflow no GitHub Actions com job `verify-deploy` rodando kind + terraform + kubectl + smoke test)
- [ ] Demonstra **deploy local ao vivo** reproduzindo a mesma sequencia: `kind create cluster` → `terraform apply` → `kubectl apply -k k8s/` → pods subindo
- [ ] Demonstra **consumo das APIs** (Swagger ou Postman: abertura de OS, consulta status, webhook aprovacao, listagem)
- [ ] Demonstra **escalabilidade automatica** (gerar carga com `hey`/`ab` e mostrar `kubectl get hpa` + novos pods sendo criados)
- [ ] Audio claro, sem cortes longos de silencio
- [ ] Link adicionado ao README

### PDF de entrega

- [ ] PDF gerado em `docs/entrega-fase-2.pdf` (ou similar) contendo:
  - Link do repositorio GitHub
  - Confirmacao de que usuario `soat-architecture` foi convidado como collaborator
  - Imagem do desenho de arquitetura (alinhado com US-F2-08)
  - Link do video
  - Nomes dos integrantes do grupo

### Etapas finais

- [ ] Convidar `soat-architecture` como collaborator no GitHub
- [ ] Garantir que README e Swagger estejam acessiveis (links funcionando)
- [ ] Submissao feita no portal do aluno antes do prazo
