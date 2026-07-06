# US-F2-04: Revisao da Containerizacao (Dockerfile + docker-compose)

**User Story:** Como Desenvolvedor/DevOps, quero o Dockerfile e o docker-compose alinhados com boas praticas (imagem enxuta, multi-stage, healthcheck, usuario nao-root), para reduzir superficie de ataque e tempo de pull.

**Prioridade:** Media
**Story Points:** 2
**Status:** To Do
**DDD Domain:** Infraestrutura
**DDD Layer:** Infrastructure

## Criterios de Aceite

- [ ] Dockerfile multi-stage: builder (com devDependencies + build) e runtime (alpine, prod-only)
- [ ] Imagem runtime contem apenas `dist/`, `node_modules` de prod, `prisma/`, `package*.json`
- [ ] Usuario nao-root (`USER node`) no estagio final
- [ ] `HEALTHCHECK` apontando para endpoint de saude (`/health` ou Swagger root)
- [ ] `.dockerignore` cobre `node_modules`, `.env`, `.git`, `coverage`, `web/` (frontend nao entra na imagem do backend)
- [ ] docker-compose com healthcheck no servico de banco e `depends_on: condition: service_healthy` no app
- [ ] Volume nomeado para dados do Postgres
- [ ] `docker compose up -d` sobe tudo e a API responde em `http://localhost:3000` sem erro
- [ ] Tamanho da imagem final reduzido vs versao atual (registrar antes/depois na PR)
