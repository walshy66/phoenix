# Complete Route Example

## File: `api/src/modules/session-logs/session-logs.routes.ts`

This is the **gold standard** pattern for CoachCW routes. Use it as your template.

Key patterns demonstrated:
- `userId` as the only external identity boundary (Principle VI)
- Scoped repository constructor-injected with `userId`
- `CONTRACT: DATA_OWNERSHIP` and `CONTRACT: AUTH_IDENTITY` markers
- `onRequest: [app.authenticate]` on all protected routes
- Zod validation (body, params, query, response)
- Structured error handling — no raw DB errors returned
- Zero-state handling (empty array and 404 are valid states)

```typescript
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { SessionLogsRepository } from "./session-logs.repository";

/**
 * Session Log Routes
 *
 * CONTRACT: AUTH_IDENTITY
 * All routes accept userId from authenticated session only.
 * athleteId is resolved server-side — never accepted from the client.
 */
export async function sessionLogsRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  /**
   * GET /api/v1/session-logs
   * Returns all session logs owned by the authenticated user.
   */
  typedApp.get(
    "/api/v1/session-logs",
    {
      onRequest: [app.authenticate], // CONTRACT: AUTH_IDENTITY
      schema: {
        description: "List session logs for the authenticated user",
        tags: ["session-logs"],
        querystring: z.object({
          skip: z.coerce.number().int().nonnegative().default(0),
          take: z.coerce.number().int().positive().max(50).default(20),
        }),
        response: {
          200: z.object({
            sessions: z.array(
              z.object({
                id: z.string(),
                startedAt: z.string().datetime(),
                completedAt: z.string().datetime().nullable(),
                status: z.enum(["ACTIVE", "COMPLETED", "ABANDONED"]),
              })
            ),
            total: z.number(),
          }),
          401: z.object({
            error: z.literal("UNAUTHORIZED"),
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      // CONTRACT: AUTH_IDENTITY — userId from session only, never from request body/params
      const userId = request.user.id;
      const { skip, take } = request.query;

      // CONTRACT: DATA_OWNERSHIP — repository scoped to this userId at construction
      const repo = new SessionLogsRepository(userId);

      try {
        const { sessions, total } = await repo.findAll({ skip, take });
        return reply.send({ sessions, total });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: "INTERNAL_ERROR",
          message: "An unexpected error occurred.",
        });
      }
    }
  );

  /**
   * GET /api/v1/session-logs/:sessionId
   * Returns a single session log owned by the authenticated user.
   */
  typedApp.get(
    "/api/v1/session-logs/:sessionId",
    {
      onRequest: [app.authenticate], // CONTRACT: AUTH_IDENTITY
      schema: {
        description: "Get a session log by ID",
        tags: ["session-logs"],
        params: z.object({
          sessionId: z.string().uuid("Invalid session ID"),
        }),
        response: {
          200: z.object({
            id: z.string(),
            startedAt: z.string().datetime(),
            completedAt: z.string().datetime().nullable(),
            status: z.enum(["ACTIVE", "COMPLETED", "ABANDONED"]),
            exercises: z.array(z.object({
              id: z.string(),
              exerciseId: z.string(),
              sets: z.array(z.object({
                weight: z.number().nullable(),
                reps: z.number().nullable(),
              })),
            })),
          }),
          401: z.object({
            error: z.literal("UNAUTHORIZED"),
            message: z.string(),
          }),
          404: z.object({
            error: z.literal("NOT_FOUND"),
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.id; // CONTRACT: AUTH_IDENTITY
      const { sessionId } = request.params;

      // CONTRACT: DATA_OWNERSHIP — ownership verified inside repository
      const repo = new SessionLogsRepository(userId);

      try {
        const session = await repo.findById(sessionId);

        // Repository returns null for not-found AND unauthorised — treat identically
        if (!session) {
          return reply.status(404).send({
            error: "NOT_FOUND",
            message: "Session not found.",
          });
        }

        return reply.send(session);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: "INTERNAL_ERROR",
          message: "An unexpected error occurred.",
        });
      }
    }
  );

  /**
   * POST /api/v1/session-logs
   * Creates a new session log for the authenticated user.
   */
  typedApp.post(
    "/api/v1/session-logs",
    {
      onRequest: [app.authenticate], // CONTRACT: AUTH_IDENTITY
      schema: {
        description: "Start a new session log",
        tags: ["session-logs"],
        body: z.object({
          notes: z.string().max(1000).optional(),
        }),
        response: {
          201: z.object({
            id: z.string(),
            startedAt: z.string().datetime(),
            status: z.enum(["ACTIVE"]),
          }),
          401: z.object({
            error: z.literal("UNAUTHORIZED"),
            message: z.string(),
          }),
          409: z.object({
            error: z.literal("ACTIVE_SESSION_EXISTS"),
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.id; // CONTRACT: AUTH_IDENTITY
      const { notes } = request.body;

      // CONTRACT: DATA_OWNERSHIP
      const repo = new SessionLogsRepository(userId);

      try {
        const session = await repo.create({ notes });
        return reply.status(201).send(session);
      } catch (error) {
        // Invariant violation — exactly one active session enforced server-side (Principle VI)
        if (error instanceof ActiveSessionExistsError) {
          return reply.status(409).send({
            error: "ACTIVE_SESSION_EXISTS",
            message: "A session is already active. Complete it before starting a new one.",
          });
        }

        request.log.error(error);
        return reply.status(500).send({
          error: "INTERNAL_ERROR",
          message: "An unexpected error occurred.",
        });
      }
    }
  );
}
```

---

## File: `api/src/modules/session-logs/session-logs.repository.ts`

The scoped repository that backs these routes:

```typescript
import { prisma } from "../../lib/prisma";

/**
 * CONTRACT: DATA_OWNERSHIP
 * This repository is scoped to a single userId injected at construction.
 * All queries include userId in the where clause via athlete join.
 * Unauthorised access is treated as not-found — never returns data for other users.
 */
export class SessionLogsRepository {
  constructor(private readonly userId: string) {
    if (!userId) throw new Error("SessionLogsRepository requires userId");
  }

  async findAll({ skip = 0, take = 20 }: { skip?: number; take?: number }) {
    const [sessions, total] = await Promise.all([
      prisma.sessionLog.findMany({
        where: {
          athlete: { userId: this.userId }, // CONTRACT: DATA_OWNERSHIP
          deletedAt: null,
        },
        orderBy: { startedAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          startedAt: true,
          completedAt: true,
          status: true,
        },
      }),
      prisma.sessionLog.count({
        where: {
          athlete: { userId: this.userId },
          deletedAt: null,
        },
      }),
    ]);

    return { sessions, total };
  }

  async findById(sessionId: string) {
    const session = await prisma.sessionLog.findUnique({
      where: { id: sessionId },
      include: {
        athlete: { select: { userId: true } },
        exercises: {
          include: { sets: true },
        },
      },
    });

    // Treat unauthorised access as not-found — never leak existence
    if (!session || session.athlete.userId !== this.userId) {
      return null;
    }

    return session;
  }

  async create({ notes }: { notes?: string }) {
    // Invariant: exactly one active session per athlete (Principle VI)
    const athlete = await prisma.athlete.findUnique({
      where: { userId: this.userId },
      include: {
        sessionLogs: {
          where: { status: "ACTIVE" },
          take: 1,
        },
      },
    });

    if (!athlete) throw new Error("Athlete not found for userId");

    if (athlete.sessionLogs.length > 0) {
      throw new ActiveSessionExistsError();
    }

    return prisma.sessionLog.create({
      data: {
        athleteId: athlete.id, // athleteId resolved server-side — never from client
        notes,
        status: "ACTIVE",
        startedAt: new Date(),
      },
      select: {
        id: true,
        startedAt: true,
        status: true,
      },
    });
  }
}

export class ActiveSessionExistsError extends Error {
  constructor() {
    super("ACTIVE_SESSION_EXISTS");
    this.name = "ActiveSessionExistsError";
  }
}
```

---

## File: `api/src/modules/session-logs/session-logs.test.ts`

Integration tests — Principle VII compliant:

```typescript
import { describe, test, expect, beforeAll, afterAll, afterEach } from "vitest";
import { buildApp } from "../../server";
import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";

describe("Session Log Routes", () => {
  let server: FastifyInstance;

  // SERVER CREATED ONCE — Principle VII
  beforeAll(async () => {
    server = await buildApp();
    await server.ready();
  });

  // CLOSED ONCE — Principle VII
  afterAll(async () => {
    await server.close();
  });

  // Isolation via data cleanup — not connection teardown
  afterEach(async () => {
    await prisma.sessionLog.deleteMany();
  });

  const AUTH_HEADER = { "x-actor-id": "user-test-001" };

  describe("GET /api/v1/session-logs", () => {
    test("returns 401 when unauthenticated", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/api/v1/session-logs",
      });
      expect(response.statusCode).toBe(401);
    });

    test("returns empty array when user has no sessions", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/api/v1/session-logs",
        headers: AUTH_HEADER,
      });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.sessions).toEqual([]);
      expect(body.total).toBe(0);
    });

    test("returns only sessions owned by authenticated user", async () => {
      // Create session for user-test-001
      await server.inject({
        method: "POST",
        url: "/api/v1/session-logs",
        headers: AUTH_HEADER,
        payload: {},
      });

      // Request as user-test-001
      const response = await server.inject({
        method: "GET",
        url: "/api/v1/session-logs",
        headers: AUTH_HEADER,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.sessions.length).toBe(1);
      expect(body.total).toBe(1);
    });
  });

  describe("GET /api/v1/session-logs/:sessionId", () => {
    test("returns 404 for session owned by a different user", async () => {
      // Create session as user-test-001
      const createResponse = await server.inject({
        method: "POST",
        url: "/api/v1/session-logs",
        headers: AUTH_HEADER,
        payload: {},
      });
      const { id } = JSON.parse(createResponse.body);

      // Attempt to access as user-test-002
      const response = await server.inject({
        method: "GET",
        url: `/api/v1/session-logs/${id}`,
        headers: { "x-actor-id": "user-test-002" },
      });

      // Ownership violation treated as not-found — no leaking of existence
      expect(response.statusCode).toBe(404);
    });
  });

  describe("POST /api/v1/session-logs", () => {
    test("creates a session for authenticated user", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/api/v1/session-logs",
        headers: AUTH_HEADER,
        payload: {},
      });
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.status).toBe("ACTIVE");
    });

    test("returns 409 when active session already exists", async () => {
      // Create first session
      await server.inject({
        method: "POST",
        url: "/api/v1/session-logs",
        headers: AUTH_HEADER,
        payload: {},
      });

      // Attempt second — invariant violation
      const response = await server.inject({
        method: "POST",
        url: "/api/v1/session-logs",
        headers: AUTH_HEADER,
        payload: {},
      });

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("ACTIVE_SESSION_EXISTS");
    });
  });
});
```

## Registration

Register the route plugin in `api/src/server.ts`:

```typescript
import { sessionLogsRoutes } from "./modules/session-logs/session-logs.routes";

app.register(sessionLogsRoutes);
```