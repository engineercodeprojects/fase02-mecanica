# US-19: Autenticacao JWT

**User Story:** Como Gestor, quero que as APIs administrativas sejam protegidas por autenticacao JWT, para garantir a seguranca do sistema.

**Prioridade:** Alta
**Story Points:** 5
**Status:** To Do
**DDD Domain:** Usuario (Bounded Context: Autenticacao)
**DDD Layer:** Infrastructure + Interface

## Criterios de Aceite

- [ ] POST /auth/login - autenticar usuario e retornar JWT
- [ ] Token JWT com expiracao configuravel
- [ ] Guard para proteger rotas administrativas
- [ ] Roles: ADMIN, ATENDENTE, MECANICO, CLIENTE
- [ ] Endpoints publicos: consulta de status da OS pelo cliente
- [ ] Validacao de dados sensiveis (CPF/CNPJ, placa)
- [ ] Testes unitarios para o guard e estrategia JWT
