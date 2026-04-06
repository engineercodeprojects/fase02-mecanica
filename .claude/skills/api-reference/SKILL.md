---
name: api-reference
description: Generates API reference documentation in Markdown for a module. Includes endpoints, request/response bodies, status codes, cURL examples, and usage flows. Use to create readable docs outside of Swagger.
argument-hint: "[module]"
---

# Generate API Reference Documentation

You will generate the API reference documentation for the **$ARGUMENTS** module.

## Step 1 — Discover endpoints

Read the following files:
- Controllers: `src/$ARGUMENTS/**/**.controller.ts` (use glob)
- DTOs: `src/$ARGUMENTS/**/dto/**` (use glob)
- `CLAUDE.md` for domain context

Identify all endpoints, their HTTP methods, routes, and input/output DTOs.

## Step 2 — Generate the reference document

Create the file `docs/api-reference/API_$ARGUMENTS.md` with the following structure:

```markdown
# API Reference — [Module]

## Overview
Brief description of the module and its resources.

**Base URL:** `/api/v1/[resource]`
**Authentication:** Bearer Token (if applicable)

---

## Endpoints

### [METHOD] /route

**Description:** What this endpoint does.

**Authentication:** Yes/No (allowed roles)

**Request:**

| Parameter | Type | Location | Required | Description |
|---|---|---|---|---|
| id | string (UUID) | path | Yes | Resource ID |
| field | string | body | Yes | Field description |

**Request Body (example):**
\`\`\`json
{
  "field": "value"
}
\`\`\`

**Response 201:**
\`\`\`json
{
  "id": "uuid",
  "field": "value",
  "createdAt": "2026-01-01T00:00:00Z"
}
\`\`\`

**Response 400:**
\`\`\`json
{
  "statusCode": 400,
  "message": ["error description"],
  "error": "Bad Request"
}
\`\`\`

**cURL:**
\`\`\`bash
curl -X POST http://localhost:3000/api/v1/resource \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"field": "value"}'
\`\`\`

---

(repeat for each endpoint)

## Status Codes

| Code | Description |
|---|---|
| 200 | Success |
| 201 | Created successfully |
| 400 | Invalid data |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |

## Usage Flows

Describe typical call sequences for common scenarios.
Example: "To create a complete OS: 1. Register the client, 2. Register the vehicle, 3. Open the OS..."

## Data Models

Describe the models returned by the API with types and descriptions.
```

## Step 3 — Realistic examples

Use data from the auto repair shop domain:
- Names: "Joao Silva", "Maria Santos"
- CPF: `"123.456.789-09"`
- CNPJ: `"12.345.678/0001-90"`
- License plate: `"ABC1D23"`
- Prices: `149.90`, `350.00`
- OS Status: `"RECEBIDA"`, `"EM_DIAGNOSTICO"`, etc.
- Services: "Troca de oleo", "Alinhamento e balanceamento"
- Products: "Filtro de oleo", "Pastilha de freio"

## Step 4 — Verification

- Confirm all controller endpoints are documented
- Verify request/response bodies match the actual DTOs
- Validate that cURL examples are executable
- Ensure error status codes are documented

## Step 5 — Summary

Present:
- Number of endpoints documented
- Endpoints that require authentication
- Suggestions for API improvements (if inconsistencies found)
