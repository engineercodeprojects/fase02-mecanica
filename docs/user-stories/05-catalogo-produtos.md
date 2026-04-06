# US-05: Catalogo de Produtos (Pecas e Insumos)

**User Story:** Como Gestor, quero cadastrar e gerenciar produtos (pecas e insumos) com controle de estoque, para que possam ser utilizados nas ordens de servico.

**Prioridade:** Alta
**Story Points:** 5
**Status:** To Do
**DDD Domain:** Produto (Bounded Context: Estoque)
**DDD Layer:** Domain + Interface

## Criterios de Aceite

- [ ] CRUD completo de produtos
- [ ] Campos: nome, descricao, preco unitario, quantidade em estoque, estoque minimo
- [ ] Controlar quantidade disponivel vs reservada
- [ ] GET /produtos - listar com paginacao e filtros
- [ ] Alertar quando estoque atingir quantidade minima
- [ ] Preco e quantidades devem ser valores positivos
- [ ] Documentacao Swagger
