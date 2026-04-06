---
name: api-docs
description: Generates or updates Swagger documentation for a module's endpoints. Use after implementing controllers or when you need to document APIs.
argument-hint: "[module]"
---

# API Documentation (Swagger)

Document the endpoints for the **$ARGUMENTS** module.

## Step 1 — Identify endpoints

Find all controllers in `src/$ARGUMENTS/` (or search if the path differs):
```!
find src -name "*.controller.ts" -path "*$ARGUMENTS*" 2>/dev/null || echo "Search manually"
```

## Step 2 — Add Swagger decorators

For each endpoint, ensure it has:

```typescript
@ApiTags('module')              // grouping
@ApiOperation({ summary })      // operation description
@ApiResponse({ status, description, type })  // possible responses
@ApiParam / @ApiQuery           // documented parameters
```

For each DTO:
```typescript
@ApiProperty({
  description: '...',
  example: '...',
  required: true/false
})
```

## Step 3 — Examples

Add realistic examples to DTOs:
- CPF: `'123.456.789-09'`
- CNPJ: `'12.345.678/0001-90'`
- License plate: `'ABC1D23'`
- Prices: `149.90`
- OS Status: `'RECEBIDA'`

## Step 4 — Verify

- Swagger must be configured in `main.ts` (if not, configure it)
- Each endpoint group should have a descriptive tag
- Protected routes must have `@ApiBearerAuth()`

List all documented endpoints in the format:
```
[METHOD] /route — description
```
