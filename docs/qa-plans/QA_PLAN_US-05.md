# QA Plan — US-05: Catalogo de Produtos (Pecas e Insumos)

## Resumo
Valida o CRUD completo de produtos com controle de estoque (disponivel vs reservada), alerta de estoque baixo, paginacao, filtro por nome e validacoes de dominio.

## Pre-requisitos
- Docker instalado (para testes de integracao via testcontainers)
- Node.js 20+ instalado
- Dependencias instaladas (`npm install`)
- Porta 3000 disponivel para testes manuais

## Cenarios de Teste

### CT-01: Criar um Produto valido
- **Tipo:** Automatizado
- **Criterio de aceite:** CRUD completo de produtos
- **Pre-condicao:** Aplicacao rodando ou testes executaveis
- **Passos:**
  1. `POST /produtos` com body: `{ "nome": "Filtro de oleo", "descricao": "Filtro para motor", "precoUnitario": 29.9, "quantidadeEstoque": 50, "estoqueMinimo": 10 }`
  2. Verificar status 201
  3. Verificar que a resposta contem `id`, `nome`, `precoUnitario`, `quantidadeEstoque`, `quantidadeReservada: 0`, `quantidadeDisponivel: 50`, `estoqueMinimo`, `ativo: true`, `alertaEstoqueBaixo: false`
- **Resultado esperado:** Produto criado com controle de estoque inicializado
- **Resultado alternativo (erro):** 400 se campos obrigatorios ausentes

### CT-02: Rejeitar nome duplicado
- **Tipo:** Automatizado
- **Criterio de aceite:** CRUD completo de produtos
- **Pre-condicao:** Um produto com nome "Filtro de oleo" ja existe
- **Passos:**
  1. `POST /produtos` com `"nome": "Filtro de oleo"`
  2. Verificar status 409 (Conflict)
- **Resultado esperado:** ConflictException com mensagem sobre nome duplicado
- **Resultado alternativo (erro):** Produto criado com nome duplicado

### CT-03: Validacao de campos obrigatorios
- **Tipo:** Automatizado
- **Criterio de aceite:** Campos: nome, descricao, preco unitario, quantidade em estoque, estoque minimo
- **Passos:**
  1. `POST /produtos` com body vazio — verificar 400
  2. Verificar mensagens de erro para campos obrigatorios
- **Resultado esperado:** Erros de validacao para cada campo ausente

### CT-04: Preco deve ser positivo
- **Tipo:** Automatizado
- **Criterio de aceite:** Preco e quantidades devem ser valores positivos
- **Passos:**
  1. `POST /produtos` com `"precoUnitario": 0` — verificar 400
  2. `POST /produtos` com `"precoUnitario": -10` — verificar 400
  3. `POST /produtos` com `"precoUnitario": 29.9` — verificar 201
- **Resultado esperado:** Apenas valores positivos aceitos

### CT-05: Quantidades nao podem ser negativas
- **Tipo:** Automatizado
- **Criterio de aceite:** Preco e quantidades devem ser valores positivos
- **Passos:**
  1. `POST /produtos` com `"quantidadeEstoque": -1` — verificar 400
  2. `POST /produtos` com `"estoqueMinimo": -1` — verificar 400
  3. `POST /produtos` com `"quantidadeEstoque": 0, "estoqueMinimo": 0` — verificar 201
- **Resultado esperado:** Zero permitido, negativo rejeitado

### CT-06: Quantidade disponivel vs reservada
- **Tipo:** Automatizado
- **Criterio de aceite:** Controlar quantidade disponivel vs reservada
- **Passos:**
  1. Criar produto com quantidadeEstoque: 50
  2. Reservar 10 unidades (via dominio)
  3. Verificar quantidadeDisponivel = 40, quantidadeReservada = 10
  4. Liberar 5 unidades
  5. Verificar quantidadeDisponivel = 45, quantidadeReservada = 5
- **Resultado esperado:** Calculo correto de disponivel = estoque - reservada

### CT-07: Rejeitar reserva acima do disponivel
- **Tipo:** Automatizado
- **Criterio de aceite:** Controlar quantidade disponivel vs reservada
- **Passos:**
  1. Criar produto com quantidadeEstoque: 10
  2. Tentar reservar 11 unidades
- **Resultado esperado:** InsufficientStockError lancado

### CT-08: Alerta de estoque baixo
- **Tipo:** Automatizado
- **Criterio de aceite:** Alertar quando estoque atingir quantidade minima
- **Passos:**
  1. Criar produto com quantidadeEstoque: 10, estoqueMinimo: 10
  2. Verificar `alertaEstoqueBaixo: true` na resposta
  3. Criar produto com quantidadeEstoque: 50, estoqueMinimo: 10
  4. Verificar `alertaEstoqueBaixo: false`
- **Resultado esperado:** Alerta quando estoque <= estoqueMinimo

### CT-09: Listar com paginacao e filtro
- **Tipo:** Automatizado
- **Criterio de aceite:** GET /produtos - listar com paginacao e filtros
- **Passos:**
  1. Criar 5 produtos
  2. `GET /produtos?page=1&limit=2` — verificar 2 itens, total=5
  3. `GET /produtos?nome=filtro` — verificar filtro case-insensitive
- **Resultado esperado:** Paginacao e filtro funcionando corretamente

### CT-10: Adicionar estoque
- **Tipo:** Automatizado
- **Criterio de aceite:** CRUD completo de produtos
- **Passos:**
  1. Criar produto com quantidadeEstoque: 50
  2. `POST /produtos/:id/estoque` com `{ "quantidade": 20 }`
  3. Verificar quantidadeEstoque = 70
- **Resultado esperado:** Estoque incrementado corretamente

### CT-11: Atualizar produto
- **Tipo:** Automatizado
- **Criterio de aceite:** CRUD completo de produtos
- **Passos:**
  1. `PATCH /produtos/:id` com `{ "nome": "Novo nome", "precoUnitario": 50 }`
  2. Verificar dados atualizados, campos nao alterados permanecem iguais
- **Resultado esperado:** Atualizacao parcial funciona

### CT-12: Remover produto
- **Tipo:** Automatizado
- **Criterio de aceite:** CRUD completo de produtos
- **Passos:**
  1. `DELETE /produtos/:id` — verificar 204
  2. `GET /produtos/:id` — verificar 404
- **Resultado esperado:** Produto removido

## Testes de Borda
- Reservar exatamente a quantidade disponivel (limite)
- Adicionar estoque a produto com estoque zerado
- Produto com estoqueMinimo = 0 (nunca alerta)
- Descricao opcional (criar sem descricao)
- Verificacao de nome duplicado e case-insensitive

## Rastreabilidade

| Criterio de Aceite | Cenarios de Teste |
|---|---|
| CRUD completo de produtos | CT-01, CT-02, CT-10, CT-11, CT-12 |
| Campos: nome, descricao, preco unitario, quantidade, estoque minimo | CT-03 |
| Controlar quantidade disponivel vs reservada | CT-06, CT-07 |
| GET /produtos - listar com paginacao e filtros | CT-09 |
| Alertar quando estoque atingir quantidade minima | CT-08 |
| Preco e quantidades devem ser valores positivos | CT-04, CT-05 |
| Documentacao Swagger | Decorators Swagger presentes em todos os metodos do controller |

## Checklist de Validacao
- [ ] Todos os criterios de aceite cobertos
- [ ] Testes de borda documentados
- [ ] Fluxos de erro documentados
- [ ] Instrucoes de setup claras

## Comandos Uteis
```bash
# Rodar todos os testes
npm test

# Rodar apenas testes do produto
npx jest produto --verbose

# Rodar testes de integracao
npx jest integration --verbose

# Rodar com cobertura
npm run test:cov

# Subir a aplicacao para testes manuais
docker compose up -d
```
