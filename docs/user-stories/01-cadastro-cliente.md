# US-01: Cadastro de Cliente

**User Story:** Como Atendente, quero cadastrar um cliente informando CPF/CNPJ, nome, telefone e email, para que ele possa ser identificado nas ordens de servico.

**Prioridade:** Alta
**Story Points:** 3
**Status:** To Do
**DDD Domain:** Cliente (Bounded Context: Atendimento)
**DDD Layer:** Domain + Interface

## Criterios de Aceite

- [ ] Cliente pode ser cadastrado com CPF ou CNPJ
- [ ] CPF/CNPJ deve ser validado (formato e digitos verificadores)
- [ ] Nao permitir cadastro duplicado de CPF/CNPJ
- [ ] Campos obrigatorios: nome, CPF/CNPJ, telefone
- [ ] Email e opcional
- [ ] API REST POST /clientes documentada no Swagger
- [ ] Retornar 201 Created com dados do cliente criado
- [ ] Retornar 409 Conflict se CPF/CNPJ ja existir
- [ ] Testes unitarios para validacao de CPF/CNPJ
