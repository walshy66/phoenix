# Backend Data Ownership Audit Report

**Feature**: [FEATURE_ID]  
**File(s) Reviewed**: [routes/services/repositories being audited]  
**Date**: [DATE]  
**Status**: [READY] / [BLOCKED]

---

## Principle VI Compliance Summary

Principle VI (Backend Authority & Invariants) requires:
- Backend is sole source of truth
- All invariants enforced server-side
- Frontend cannot infer or bypass invariants
- User identity is the only valid API boundary

---

## Check 1: userId Scoping ✅ / ❌

**Requirement**: All data queries scoped by `userId`, not frontend-provided `athleteId`

**Finding**:
```
Repository/Service scoped by userId: [YES / NO]
Frontend-provided IDs accepted: [YES / NO]
Status: [✅ COMPLIANT / ❌ VIOLATION]
```

**Evidence**:
- Constructor receives `userId`: [YES / NO, line X]
- Queries include `where: { userId }`: [YES / NO, line X]
- `athleteId` accepted from frontend: [YES / NO, line X]

**Violation** (if applicable):
```typescript
// ❌ WRONG: Frontend provides athleteId
app.get('/athlete/:athleteId', async (request, reply) => {
  const athlete = await prisma.athlete.findUnique({
    where: { id: request.params.athleteId }
  });
  return reply.send(athlete);  // Any user can request any athlete
});

// ✅ CORRECT: Use userId from session
app.get('/athlete', async (request, reply) => {
  const athlete = await prisma.athlete.findFirst({
    where: { userId: request.user.id }
  });
  return reply.send(athlete);  // User only sees their own data
});
```

---

## Check 2: Ownership Verification ✅ / ❌

**Requirement**: Before mutating data, verify user owns it

**Finding**:
```
Mutations without ownership check: [0 / N]
Locations: [file, line numbers if found]
Status: [✅ COMPLIANT / ❌ VIOLATION]
```

**Evidence**:
- Update operations: [CHECKED / UNCHECKED]
- Delete operations: [CHECKED / UNCHECKED]
- Create operations: [CHECKED / UNCHECKED]

**Pattern Check**:
```typescript
// For each mutation:
// ✅ CORRECT
const data = await prisma.table.findUnique({ where: { id } });
if (data.userId !== request.user.id) {
  return { statusCode: 403, error: 'FORBIDDEN' };
}
await prisma.table.update({ where: { id }, data: updates });

// ❌ WRONG
await prisma.table.update({ where: { id }, data: updates });
// No ownership check!
```

---

## Check 3: Repository Scoping ✅ / ❌

**Requirement**: Repository constructor accepts `userId` and enforces implicit scoping

**Finding**:
```
Repository pattern: [SCOPED / UNSCOPED / MIXED]
Constructor requires userId: [YES / NO]
All methods implicitly scoped: [YES / NO]
Status: [✅ COMPLIANT / ❌ VIOLATION]
```

**Example (✅ CORRECT)**:
```typescript
class SessionRepository {
  constructor(private userId: string) {
    if (!userId) throw new Error('userId required');
  }
  
  async getActive() {
    // userId always scoped
    return prisma.actualSessionLog.findMany({
      where: { athlete: { userId: this.userId } }
    });
  }
}
```

**Example (❌ WRONG)**:
```typescript
class SessionRepository {
  // No constructor scoping
  async getActive(userId: string) {
    // Must remember to pass userId every time
    // Easy to forget or pass wrong userId
    return prisma.actualSessionLog.findMany({
      where: { athlete: { userId } }
    });
  }
}
```

---

## Check 4: Invariant Enforcement ✅ / ❌

**Requirement**: Invariants checked and enforced at database level

**Finding**:
```
Invariants identified: [list them]
Enforcement location: [CLIENT / SERVER / BOTH]
Status: [✅ SERVER-ENFORCED / ⚠️ CLIENT-ENFORCED / ❌ NOT ENFORCED]
```

**Invariant Analysis**:

| Invariant | Check Location | Enforcement | Risk | Fix |
|-----------|-----------------|-------------|------|-----|
| [e.g., exactly one active session] | [client/server] | [atomic/race-condition] | [severity] | [action] |

**Pattern Check**:
```typescript
// ✅ CORRECT: Server enforces atomically
async function startSession(userId: string) {
  const active = await prisma.session.count({
    where: { userId, status: 'IN_PROGRESS' }
  });
  
  if (active > 0) {
    return { statusCode: 409, error: 'SESSION_ALREADY_ACTIVE' };
  }
  
  return prisma.session.create({ ... });
}

// ❌ WRONG: Client checks, server doesn't enforce
// Client: "I'll check if active session exists"
// But another client might create one between check and create
```

---

## Check 5: Authentication Boundary ✅ / ❌

**Requirement**: Auth check on all protected routes

**Finding**:
```
Protected routes: [total count]
Routes with auth check: [count]
Routes missing auth check: [count]
Status: [✅ COMPLIANT / ❌ VIOLATION]
```

**Evidence**:
- Route definition: [app.get / app.post]
- Auth check present: [onRequest: [app.authenticate]]
- userId extracted from session: [YES / NO]

**Pattern**:
```typescript
// ✅ CORRECT
app.get(
  '/sessions',
  { onRequest: [app.authenticate] },
  async (request, reply) => {
    const userId = request.user.id;  // Extract after auth
    return reply.send({ ... });
  }
);

// ❌ WRONG
app.get('/sessions', async (request, reply) => {
  // No auth check!
  return reply.send({ ... });
});
```

---

## Check 6: Error Response Semantics ✅ / ❌

**Requirement**: 401/403/404/500 semantics correct

**Finding**:
```
Status Code Usage:
- 401 (No valid identity): [correct / incorrect / missing]
- 403 (Valid user, no access): [correct / incorrect / missing]
- 404 (Not found): [correct / incorrect / missing]
- 500 (Invariant violation): [correct / incorrect / missing]

Status: [✅ COMPLIANT / ❌ VIOLATION]
```

**Validation**:
```typescript
// ✅ CORRECT
if (!request.user) return 401;  // No identity
if (user.id !== ownerId) return 403;  // Valid user, no access
if (!resource) return 404;  // Not found
if (invariantBroken) return 500;  // System error

// ❌ WRONG
if (!authorized) return 400;  // Too vague
if (notFound) return 403;  // Wrong code
if (invariantBroken) return 400;  // Should be 500
```

---

## Check 7: Contract Documentation ✅ / ❌

**Requirement**: Code marked with CONTRACT: DATA_OWNERSHIP and AUTH_IDENTITY

**Finding**:
```
CONTRACT markers present: [YES / NO]
Locations: [file, line numbers]
Status: [✅ DOCUMENTED / ⚠️ UNMARKED]
```

**Pattern**:
```typescript
// ✅ MARKED
// CONTRACT: DATA_OWNERSHIP
// All queries scoped by userId from constructor
class SessionRepository {
  constructor(private userId: string) { }
  
  async getSession(id: string) {
    const session = await prisma.session.findUnique({ where: { id } });
    if (session.userId !== this.userId) return null;
    return session;
  }
}

// CONTRACT: AUTH_IDENTITY
// Only userId accepted at boundary; athleteId derived server-side
app.get('/sessions', { onRequest: [app.authenticate] }, async (request) => {
  const athlete = await findAthleteByUserId(request.user.id);
  return getSessionsByAthleteId(athlete.id);
});
```

---

## Violation Summary

### Critical Violations 🔴
[List all CRITICAL violations found]

### High-Priority Violations 🟠
[List all HIGH violations found]

### Non-Blocking Issues 🟡
[List all informational findings]

---

## Remediation Plan

For each violation:

1. **Violation**: [Description]
2. **Location**: [file, line X]
3. **Risk**: [What data/invariant is at risk]
4. **Fix**: [Code change needed]
5. **Effort**: [EASY / MEDIUM / HARD]

---

## Audit Checklist

- [ ] All data queries scoped by userId
- [ ] Repository scoped by userId in constructor
- [ ] All mutations verify ownership first
- [ ] Invariants checked atomically server-side
- [ ] Auth check on all protected routes
- [ ] 401/403/404/500 semantics correct
- [ ] CONTRACT markers present
- [ ] No frontend-provided athleteId accepted
- [ ] No client-only invariant checks
- [ ] All violations remediated
- [ ] Status: [READY]

---

## Related Documentation

- Constitution Principle VI: [reference]
- Feature spec: [link if applicable]
- Data ownership contracts: [reference]
- Error handling standards: [reference]

---

## Notes

[Any additional context or special considerations]