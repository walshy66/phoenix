---
name: backend-data-ownership
description: Enforce Principle VI (Backend Authority & Invariants) by validating that all data operations are server-side enforced, invariants are protected, and user identity/ownership rules are properly scoped. Use when building repositories, services, or route handlers to ensure the backend is the sole authority for domain truth and no frontend logic can infer or bypass invariants.
---

# Backend Data Ownership Enforcer

Ensure your backend is the sole authority for domain truth and invariants can never be bypassed by frontend logic.

## When to Use This Skill

- Building repository layers
- Creating service methods
- Implementing API route handlers
- Adding database queries
- Validating authorization logic
- Checking data ownership enforcement
- Reviewing existing code for Principle VI violations

## Principle VI Core Rules (Non-Negotiable)

### Rule 1: Backend Authority
```typescript
// ✅ CORRECT: Server is source of truth
const user = await prisma.user.findUnique({
  where: { id: userId }
});
// Client gets whatever server sends

// ❌ WRONG: Client infers server state
if (localUserData.isActive) {
  // Assume server has this user
  // This breaks if server says different
}
```

### Rule 2: Invariants Must Be Enforced Server-Side
```typescript
// ✅ CORRECT: Database enforces "exactly one active session"
const activeSession = await prisma.actualSessionLog.findFirst({
  where: { athleteId, status: 'IN_PROGRESS' }
});
if (activeSession) {
  throw new Error('SESSION_ALREADY_ACTIVE');
}
const newSession = await prisma.actualSessionLog.create({ ... });

// ❌ WRONG: Client checks invariant, server doesn't
// Client says "I don't have an active session"
// Server doesn't verify, allows multiple active sessions
```

### Rule 3: Frontend CANNOT Repair Invariant Failures
```typescript
// ✅ CORRECT: Invariant violation = explicit error
if (invariantViolation) {
  return {
    statusCode: 500,
    error: 'INVARIANT_VIOLATION',
    message: 'Exactly one active session required'
  };
}

// ❌ WRONG: Frontend tries to "fix" invariant
// Client: "Multiple active sessions? I'll just ignore the extra ones"
// This hides a real server problem
```

### Rule 4: User Identity as Boundary
```typescript
// ✅ CORRECT: Only userId accepted at API boundary
async function getAthleteData(request: FastifyRequest) {
  const userId = request.user.id;  // Extracted from session
  const athlete = await athleteRepository.findByUserId(userId);
  return athlete;
}

// ❌ WRONG: Frontend passes athleteId directly
async function getAthleteData(athleteId: string) {
  const athlete = await prisma.athlete.findUnique({ 
    where: { id: athleteId }  // Wrong boundary!
  });
  return athlete;
}
```

### Rule 5: Error Semantics Matter
```typescript
// ✅ CORRECT: Clear distinction
if (!user) {
  return { statusCode: 404, error: 'NOT_FOUND' };  // After auth check
}
if (user.id !== requestingUserId) {
  return { statusCode: 403, error: 'FORBIDDEN' };  // After auth
}
if (invariantBroken) {
  return { statusCode: 500, error: 'INVARIANT_VIOLATION' };
}

// ❌ WRONG: Blurry semantics
if (!authorized) {
  return { statusCode: 400, error: 'INVALID_REQUEST' };  // Too vague
}
```

---

## Ownership & Authorization Scoping

### Identity Boundary

```typescript
// ✅ CORRECT: userId is external boundary
export class SessionRepository {
  constructor(private userId: string) {}
  
  async getActiveSessions() {
    // Always scoped by this.userId
    return prisma.actualSessionLog.findMany({
      where: { 
        athlete: { userId: this.userId },  // Mandatory
        status: 'IN_PROGRESS'
      }
    });
  }
}

// Usage:
const repo = new SessionRepository(request.user.id);
const sessions = await repo.getActiveSessions();
// Sessions are implicitly scoped to this user
```

### DATA_OWNERSHIP Contract

```typescript
// ✅ CORRECT: Mark ownership enforcement
// CONTRACT: DATA_OWNERSHIP
// Query scoped by userId in constructor
async function updateSession(sessionId: string, updates: object) {
  const session = await prisma.actualSessionLog.findUnique({
    where: { id: sessionId }
  });
  
  // Verify ownership
  if (session.athlete.userId !== this.userId) {
    throw new Error('FORBIDDEN');  // User doesn't own this session
  }
  
  return prisma.actualSessionLog.update({
    where: { id: sessionId },
    data: updates
  });
}

// ❌ WRONG: Ownership not checked
async function updateSession(sessionId: string, updates: object) {
  return prisma.actualSessionLog.update({
    where: { id: sessionId },
    data: updates
  });
  // Anyone can update any session
}
```

### AUTH_IDENTITY Contract

```typescript
// ✅ CORRECT: User identity verified at boundary
app.get(
  '/sessions',
  { onRequest: [app.authenticate] },  // Auth check
  async (request, reply) => {
    const userId = request.user.id;  // Extract after auth
    const sessions = await getSessionsByUserId(userId);
    return reply.send(sessions);
  }
);

// ❌ WRONG: No auth check
app.get('/sessions', async (request, reply) => {
  const userId = request.query.userId;  // Client provides!
  const sessions = await getSessionsByUserId(userId);  // Wrong!
  return reply.send(sessions);
});
```

---

## Data Query Patterns

### Pattern 1: Scoped Repository Constructor

```typescript
// ✅ CORRECT: Scope enforced at construction
class AthleteRepository {
  constructor(private userId: string) {
    // Validation
    if (!userId) throw new Error('userId required');
  }
  
  async getSessions() {
    return prisma.actualSessionLog.findMany({
      where: { 
        athlete: { userId: this.userId }
      }
    });
  }
  
  async getSession(sessionId: string) {
    const session = await prisma.actualSessionLog.findUnique({
      where: { id: sessionId }
    });
    
    // Ownership check
    if (session?.athlete.userId !== this.userId) {
      return null;  // Treat as not found
    }
    
    return session;
  }
}

// Usage: Repository always scoped by user
const repo = new AthleteRepository(request.user.id);
const sessions = await repo.getSessions();  // Safe
```

### Pattern 2: Explicit Ownership Validation

```typescript
// ✅ CORRECT: Ownership verified before mutation
async function updateSession(
  userId: string,
  sessionId: string,
  updates: object
) {
  // Step 1: Fetch and verify ownership
  const session = await prisma.actualSessionLog.findUnique({
    where: { id: sessionId },
    include: { athlete: { select: { userId: true } } }
  });
  
  if (!session) {
    throw new Error('NOT_FOUND');
  }
  
  if (session.athlete.userId !== userId) {
    throw new Error('FORBIDDEN');  // User doesn't own it
  }
  
  // Step 2: Safe to update
  return prisma.actualSessionLog.update({
    where: { id: sessionId },
    data: updates
  });
}
```

### Pattern 3: Query-Level Scoping

```typescript
// ✅ CORRECT: Ownership in WHERE clause
async function getAthleteOverview(userId: string) {
  return prisma.athlete.findFirst({
    where: { userId },  // Scoped by userId
    include: {
      actualSessionLogs: {
        where: { status: 'IN_PROGRESS' },
        take: 1
      },
      profile: true
    }
  });
}

// ❌ WRONG: Not scoped by userId
async function getAthleteOverview(athleteId: string) {
  return prisma.athlete.findUnique({
    where: { id: athleteId }  // Missing userId scope!
  });
}
```

---

## Invariant Protection Patterns

### Invariant: "Exactly One Active Session per Athlete"

```typescript
// ✅ CORRECT: Database enforces invariant
async function startSession(userId: string) {
  // Step 1: Check invariant
  const activeCount = await prisma.actualSessionLog.count({
    where: {
      athlete: { userId },
      status: 'IN_PROGRESS'
    }
  });
  
  if (activeCount > 0) {
    return {
      statusCode: 409,
      error: 'SESSION_ALREADY_ACTIVE',
      message: 'Cannot start; active session exists'
    };
  }
  
  // Step 2: Create new session
  const session = await prisma.actualSessionLog.create({
    data: {
      athlete: { connect: { userId } },
      status: 'IN_PROGRESS',
      startedAt: new Date()
    }
  });
  
  return { statusCode: 201, data: session };
}

// ❌ WRONG: Frontend tries to handle invariant
// Client: "I don't see active sessions, so I'll create one"
// What if another client created one between check and create?
// This race condition breaks invariant
```

### Invariant: "Session Snapshots Are Immutable"

```typescript
// ✅ CORRECT: Prevent mutation of snapshot
async function updateSessionSnapshot(sessionId: string, snapshot: object) {
  const session = await prisma.actualSessionLog.findUnique({
    where: { id: sessionId }
  });
  
  // Invariant: No update if snapshot locked
  if (session.snapshotLocked) {
    return {
      statusCode: 409,
      error: 'INVARIANT_VIOLATION',
      message: 'Snapshot is locked and cannot be modified'
    };
  }
  
  return prisma.actualSessionLog.update({
    where: { id: sessionId },
    data: { snapshot }
  });
}

// ❌ WRONG: Trust client to not mutate
// Client might try to mutate locked snapshot
// Server allows it anyway
```

---

## Error Handling per Principle VI

### HTTP Status Codes (Semantics Matter)

```typescript
// ✅ CORRECT: Clear semantics

// 401 Unauthorized: No valid user identity
if (!request.user) {
  return { statusCode: 401, error: 'UNAUTHORIZED' };
}

// 403 Forbidden: Valid user but no access to resource
if (session.athlete.userId !== request.user.id) {
  return { statusCode: 403, error: 'FORBIDDEN' };
}

// 404 Not Found: Treat forbidden as not found (optional, per spec)
if (session.athlete.userId !== request.user.id) {
  return { statusCode: 404, error: 'NOT_FOUND' };
}

// 400 Bad Request: Validation failure
if (notes.length > 1000) {
  return { statusCode: 400, error: 'VALIDATION_ERROR' };
}

// 500 Internal Server Error: Invariant violation
if (invariantBroken) {
  return { statusCode: 500, error: 'INVARIANT_VIOLATION' };
}
```

---

## Audit Checklist

When reviewing code, check:

- [ ] All data queries scoped by `userId` (not frontend-provided IDs)
- [ ] Repository constructor receives `userId` and validates it
- [ ] All mutations verify ownership before proceeding
- [ ] Invariants checked at database level (not client assumptions)
- [ ] No foreign key queries without ownership verification
- [ ] Auth check (`app.authenticate`) present on all protected routes
- [ ] 401/403/404/500 semantics used correctly
- [ ] Error messages don't leak sensitive data
- [ ] Logging excludes user data (per NFR-003)
- [ ] No "graceful degradation" for invariant failures
- [ ] Contract markers present (CONTRACT: DATA_OWNERSHIP, AUTH_IDENTITY)

---

## Common Violations & Fixes

### Violation 1: Frontend Provides athleteId

```typescript
// ❌ WRONG
app.get('/athlete/:athleteId', async (request, reply) => {
  const athlete = await prisma.athlete.findUnique({
    where: { id: request.params.athleteId }
  });
  return reply.send(athlete);
});
// Any user can request any athlete

// ✅ CORRECT
app.get('/athlete', async (request, reply) => {
  const athlete = await prisma.athlete.findFirst({
    where: { userId: request.user.id }
  });
  return reply.send(athlete);
});
// User can only see their own athlete
```

### Violation 2: Ownership Not Checked

```typescript
// ❌ WRONG
async function updateSession(sessionId: string, updates: object) {
  return prisma.actualSessionLog.update({
    where: { id: sessionId },
    data: updates
  });
}

// ✅ CORRECT
async function updateSession(userId: string, sessionId: string, updates: object) {
  const session = await prisma.actualSessionLog.findUnique({
    where: { id: sessionId }
  });
  
  if (session.athlete.userId !== userId) {
    throw new Error('FORBIDDEN');
  }
  
  return prisma.actualSessionLog.update({
    where: { id: sessionId },
    data: updates
  });
}
```

### Violation 3: Client Bypasses Invariant Check

```typescript
// ❌ WRONG: Client checks invariant
// Frontend: "Let me verify no active session exists"
const active = await fetch('/sessions?status=IN_PROGRESS');
if (active.length === 0) {
  // Create session (but another client might have just created one!)
  await fetch('/sessions', { method: 'POST' });
}

// ✅ CORRECT: Server enforces atomically
// Backend:
async function startSession(userId: string) {
  const active = await prisma.actualSessionLog.count({
    where: { athlete: { userId }, status: 'IN_PROGRESS' }
  });
  
  if (active > 0) {
    return { statusCode: 409, error: 'SESSION_ALREADY_ACTIVE' };
  }
  
  return prisma.actualSessionLog.create({ ... });
}
```

---

## Related Requirements

- **Constitution VI (Backend Authority)**: All domain invariants server-enforced
- **Constitution II (Test-First)**: Invariant enforcement tested
- **Constitution V (Observability)**: Invariant violations logged and observable