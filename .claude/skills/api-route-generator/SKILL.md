---
name: api-route-generator
description: Generate Fastify 5 routes with Zod validation, Prisma integration, and strict error handling. Use this skill whenever you need to build new API endpoints, add validation, structure error responses, or create integration tests. Always use this for any route implementation.
compatibility: Requires Fastify 5, Prisma, Zod, Vitest
---

# API Route Generator

Generate production-ready Fastify 5 routes following strict patterns for validation, error handling, and testing.

## When to Use This Skill

- Creating new API endpoints (POST, GET, PUT, DELETE, PATCH)
- Adding request/response validation to routes
- Structuring error responses consistently
- Writing integration tests for routes
- Ensuring Prisma queries match the domain model
- Following Principle VI (Backend Authority & Invariants)

## Core Principles

Every route MUST adhere to these non-negotiable rules:

1. **Zod Validation**: All inputs (params, query, body) validated with Zod schemas
2. **Structured Errors**: Never expose raw database errors; use standardized error codes
3. **Type Safety**: Use `ZodTypeProvider` for full request/response typing
4. **Error Semantics**: 
   - Return 400 for validation failures
   - Return 401 when no valid user identity is present
   - Return 403 only after identity resolution (user authenticated but lacks access)
   - Return 500 for structural/invariant violations (logged and test-covered)
5. **Zero-State Handling**: Endpoints return empty arrays or 404 gracefully when no data exists
6. **Test Coverage**: Every route MUST have a Vitest integration test
7. **Fastify Lifecycle**: Respect lifecycle rules (server created in `beforeAll`, no `beforeEach` teardown)

## Standard Route Pattern

Every route follows this structure:

```typescript
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function yourRouteHandler(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.post(
    "/your-path",
    {
      schema: {
        description: "Clear description of what this does",
        tags: ["resource-type"],
        body: z.object({
          // Validation schema
        }),
        response: {
          201: z.object({
            // Response schema
          }),
        },
      },
    },
    async (request, reply) => {
      const { /* extracted fields */ } = request.body;

      try {
        // Prisma query
        const result = await prisma.resource.create({ data: { /* ... */ } });
        return reply.status(201).send(result);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: "DATABASE_ERROR",
          message: "A database error occurred while processing the request.",
        });
      }
    }
  );
}
```

## Standard Error Codes

Always use these standardized error codes (never raw database errors):

| Code | Status | When to Use |
|------|--------|------------|
| `VALIDATION_ERROR` | 400 | Request body/params failed Zod validation |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `UNAUTHORIZED` | 401 | No valid user identity present |
| `FORBIDDEN` | 403 | User authenticated but lacks resource access |
| `DATABASE_ERROR` | 500 | Unexpected database error |
| `INTERNAL_SERVER_ERROR` | 500 | Other unexpected errors |

## Integration Test Pattern

Every route gets a Vitest test mirroring this structure:

```typescript
import { expect, test, describe, beforeAll, afterAll } from "vitest";
import { buildApp } from "../app";
import { FastifyInstance } from "fastify";

describe("API Route", () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await buildApp();
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  test("POST /api/route - happy path", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/route",
      payload: { /* valid data */ },
    });

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toHaveProperty("id");
  });

  test("POST /api/route - validation error", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/route",
      payload: { /* invalid data */ },
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).error).toBe("VALIDATION_ERROR");
  });
});
```

## Workflow

1. **Understand the requirement**: What resource? What HTTP method? What validation?
2. **Design the schema**: 
   - Refer to `prisma/schema.prisma` for domain model
   - Define Zod validation for inputs (body, params, query)
   - Define response schema matching Prisma query result
3. **Generate the route file**: Use the standard pattern above
4. **Generate the test file**: Mirror the integration test pattern
5. **Register the route**:
   - **Automated** (if you have shell access): Run `./scripts/auto-register.sh <routeName> src/routes/<your-file>`
   - **Manual**: Edit `src/app.ts` to add:
     ```typescript
     import { yourRouteHandler } from './routes/your-route';
     app.register(yourRouteHandler);
     ```
6. **Verify**: Run `npm test` to confirm tests pass

## Key Rules

- **Backend Authority**: All domain invariants enforced server-side; frontend cannot infer or bypass
- **No Raw Errors**: Never return stack traces or raw Prisma errors to the client
- **No Zero-State Assumptions**: Don't assume data exists; handle empty results gracefully
- **Test-First**: Tests MUST exist before merge
- **Zod Always**: Every input field validated; no exceptions

## File Placement

- Routes: `src/routes/<kebab-case-name>.ts`
- Tests: `src/routes/<kebab-case-name>.test.ts`

## Common Patterns

### Query Params
```typescript
query: z.object({
  skip: z.coerce.number().int().nonnegative().default(0),
  take: z.coerce.number().int().positive().max(100).default(10),
}),
```

### Path Params
```typescript
params: z.object({
  id: z.string().cuid("Invalid ID format"),
}),
```

### Scoped Queries (Backend Authority)
Always scope queries by `userId` from the authenticated request:
```typescript
const resource = await prisma.resource.findUnique({
  where: { id, userId: request.user.id }, // REQUIRED
});
```

## Troubleshooting

- **Type errors on `request.body`**: Ensure `withTypeProvider<ZodTypeProvider>()` wraps the route
- **Validation not firing**: Verify the schema is inside the `schema` object in route options
- **Tests fail on server lifecycle**: Check `beforeAll`/`afterAll` are set correctly
- **Raw errors leaking**: Catch all errors, log internally, return standardized codes