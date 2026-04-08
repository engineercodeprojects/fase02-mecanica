# Oficina Mecânica — API

Back-end MVP para sistema integrado de oficina mecânica, focado em gestão de ordens de serviço, clientes, veículos e peças.

**Stack:** NestJS · TypeScript · Prisma · PostgreSQL · Docker

---

## Pré-requisitos

- [Node.js 20+](https://nodejs.org/)
- [Docker](https://www.docker.com/) e Docker Compose

---

## Rodando com Docker Compose (recomendado)

Sobe a aplicação e o banco de dados juntos. As migrations são aplicadas automaticamente na inicialização.

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd software-architecture-tech-challenge-01

# 2. Suba os containers
docker compose up -d

# 3. Acompanhe os logs (opcional)
docker compose logs -f app
```

A API estará disponível em `http://localhost:3000`.  
A documentação Swagger estará em `http://localhost:3000/api`.

### Parar os containers

```bash
docker compose down
```

Para remover também o volume do banco de dados:

```bash
docker compose down -v
```

---

## Rodando localmente (sem Docker)

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` se necessário. O valor padrão espera um PostgreSQL local na porta `5432`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/oficina_mecanica?schema=public"
```

### 3. Suba apenas o banco de dados

```bash
docker compose up -d postgres
```

### 4. Execute as migrations

```bash
npm run prisma:migrate
```

### 5. Inicie a aplicação

```bash
# Desenvolvimento (com hot reload)
npm run start:dev

# Produção
npm run build
npm start
```

A API estará disponível em `http://localhost:3000`.  
A documentação Swagger estará em `http://localhost:3000/api`.

---

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run start:dev` | Inicia em modo desenvolvimento |
| `npm run build` | Compila o TypeScript |
| `npm start` | Inicia a versão compilada |
| `npm test` | Executa os testes |
| `npm run test:cov` | Executa os testes com cobertura |
| `npm run prisma:generate` | Gera o cliente Prisma |
| `npm run prisma:migrate` | Cria e aplica migrations |
| `npm run prisma:deploy` | Aplica migrations (produção) |
| `npm run docker:up` | Sobe os containers |
| `npm run docker:down` | Para os containers |