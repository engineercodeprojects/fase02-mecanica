# US-00: Setup Prisma + PostgreSQL

**User Story:** Como Desenvolvedor, quero configurar o Prisma ORM com PostgreSQL como banco de dados da aplicacao, para que as migrations sejam criadas e executadas automaticamente ao subir o ambiente com Docker.

**Prioridade:** Alta
**Story Points:** 5
**Status:** To Do
**DDD Domain:** Infraestrutura
**DDD Layer:** Infrastructure

## Criterios de Aceite

- [ ] Instalar e configurar Prisma no projeto NestJS
- [ ] PostgreSQL como banco de dados (justificativa: suporte robusto a transacoes ACID, tipos de dados ricos, maturidade e ecossistema)
- [ ] Criar schema.prisma inicial com configuracao do datasource PostgreSQL
- [ ] Configurar PrismaService como provider global no NestJS
- [ ] Configurar PrismaModule exportavel para uso em todos os modulos
- [ ] docker-compose.yml com servico PostgreSQL (imagem postgres:16-alpine)
- [ ] Variavel DATABASE_URL configuravel via .env
- [ ] Script de migration automatica no entrypoint do container (npx prisma migrate deploy)
- [ ] Seed inicial opcional para dados de teste
- [ ] .env.example com DATABASE_URL de exemplo
- [ ] README documentando como rodar migrations manualmente (npx prisma migrate dev)
