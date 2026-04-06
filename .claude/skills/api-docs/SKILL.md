---
name: api-docs
description: Gera ou atualiza a documentacao Swagger dos endpoints de um modulo. Use apos implementar controllers ou quando precisar documentar APIs.
argument-hint: "[modulo]"
allowed-tools: "Read Write Edit Grep Glob"
---

# Documentacao de API (Swagger)

Documente os endpoints do modulo **$ARGUMENTS**.

## Passo 1 — Identificar endpoints

Encontre todos os controllers em `src/$ARGUMENTS/` (ou busque se o caminho for diferente):
```!
find src -name "*.controller.ts" -path "*$ARGUMENTS*" 2>/dev/null || echo "Busque manualmente"
```

## Passo 2 — Adicionar decorators Swagger

Para cada endpoint, garanta que tenha:

```typescript
@ApiTags('modulo')           // agrupamento
@ApiOperation({ summary })   // descricao da operacao
@ApiResponse({ status, description, type })  // respostas possiveis
@ApiParam / @ApiQuery        // parametros documentados
```

Para cada DTO:
```typescript
@ApiProperty({
  description: '...',
  example: '...',
  required: true/false
})
```

## Passo 3 — Exemplos

Adicione exemplos realistas nos DTOs:
- CPF: `'123.456.789-09'`
- CNPJ: `'12.345.678/0001-90'`
- Placa: `'ABC1D23'`
- Precos: `149.90`
- Status OS: `'RECEBIDA'`

## Passo 4 — Verificar

- O Swagger deve estar configurado no `main.ts` (se nao estiver, configure)
- Cada grupo de endpoints deve ter um tag descritivo
- Rotas protegidas devem ter `@ApiBearerAuth()`

Liste todos os endpoints documentados no formato:
```
[METODO] /rota — descricao
```
