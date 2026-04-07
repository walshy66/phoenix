---
name: feature-development
description: Orchestrate TDD-first feature implementation for CoachCW following the spec → plan → tasks → implement pipeline. Use when executing feature work from a tasks.md file, implementing atomic tasks in order, tracking progress against a task ledger, or enforcing the Red-Green-Refactor cycle. Always use this skill when the implement agent begins work on a feature branch.
compatibility: Requires Fastify 5, Prisma, Vitest, TypeScript, React 19
---

# Feature Development

Execute CoachCW feature work using strict TDD, atomic task sequencing, and ledger-tracked progress.

## When to Use This Skill

- Starting implementation on a feature branch
- Executing tasks from `specs/{slug}/tasks.md`
- Writing failing tests before implementation code
- Tracking task completion against a ledger
- Enforcing scope boundaries during implementation
- Resuming interrupted feature work

## Core Principles

1. **Test first, always**: Write the failing test before any implementation code. No exceptions.
2. **One task at a time**: Complete and verify each task before starting the next. Never work ahead.
3. **Ledger tracks truth**: The task ledger in `specs/{slug}/tasks.md` is the authoritative record of what's done.
4. **Scope is a hard boundary**: If implementation requires touching something outside the task spec, stop and flag it. Do not self-expand scope.
5. **Constitution before code**: Every implementation decision defers to the constitution. When in doubt, check Principle VI (Backend Authority) and Principle VII (Test Architecture).

---

## Pre-Flight Checklist

Before writing any code, verify:

- [ ] On correct feature branch (`git branch` shows `{slug}`)
- [ ] `specs/{slug}/spec.md` exists and has been reviewed
- [ ] `specs/{slug}/plan.md` exists
- [ ] `specs/{slug}/tasks.md` exists with atomic tasks
- [ ] Constitution loaded (`.claude/CLAUDE.md` in context)
- [ ] No uncommitted changes from previous work

If any of these are missing, stop and resolve before proceeding.

---

## Task Execution Workflow

### Phase 1: Load Context

1. Read `specs/{slug}/spec.md` — understand the feature intent and acceptance criteria
2. Read `specs/{slug}/tasks.md` — identify the next incomplete task
3. Read relevant existing code — only files directly related to the task
4. Identify which constitution principles apply to this task

### Phase 2: Red (Write Failing Test)

1. Identify what the task requires the system to do
2. Write the test that proves it works when done
3. Run the test — confirm it FAILS
4. Do not proceed until test is red

```bash
# Confirm test is failing before writing implementation
cd api && npm test -- --run src/path/to/feature.test.ts
```

Test must be red. If it passes without implementation, the test is wrong — fix it.

### Phase 3: Green (Minimal Implementation)

1. Write the minimum code to make the test pass
2. Do not add functionality beyond what the test requires
3. Run the test — confirm it PASSES
4. Run the full test suite — confirm no regressions

```bash
# Confirm all tests still pass
cd api && npm test
cd app && npm test
```

If any previously passing test now fails, fix the regression before continuing.

### Phase 4: Refactor (Optional)

1. If implementation is messy, refactor for clarity
2. Run tests again after refactoring — must still pass
3. Do not change behaviour during refactor

### Phase 5: Ledger Update

1. Mark the task complete in `specs/{slug}/tasks.md`
2. Commit with a descriptive message referencing the task

```bash
git add .
git commit -m "feat({slug}): {task description} [task-N]"
```

### Phase 6: Next Task

Repeat Phase 2–5 for the next incomplete task in the ledger.

---

## Task Ledger Format

The `tasks.md` file tracks status with these markers:

```markdown
## Tasks

- [ ] TASK-001: Write failing test for X endpoint
- [ ] TASK-002: Implement X repository method
- [x] TASK-003: Add Zod schema for X request body  ← completed
- [ ] TASK-004: Write integration test for X route
```

Update markers as you complete tasks. Never mark a task complete before its tests pass.

---

## Scope Lock Rules

These actions require stopping and flagging to the user — do NOT self-decide:

- Task requires modifying a file outside the feature's declared scope
- Task requires a schema migration not in `plan.md`
- Task reveals an ambiguity in the spec that could go multiple ways
- Task would require changing a contract marker (`CONTRACT: DATA_OWNERSHIP`, `CONTRACT: AUTH_IDENTITY`)
- Task touches another feature's module

When flagging, state:
1. What the task requires
2. Why it's out of scope
3. What the two or three options are
4. Which option you recommend

Do not proceed until the user responds.

---

## CoachCW Implementation Patterns

### Backend Task: New Repository Method

```typescript
// CONTRACT: DATA_OWNERSHIP
// All queries scoped by userId injected at construction
export class FeatureRepository {
  constructor(private userId: string) {
    if (!userId) throw new Error('userId required');
  }

  async findById(id: string) {
    const record = await prisma.resource.findUnique({
      where: { id },
      include: { athlete: { select: { userId: true } } }
    });

    if (!record || record.athlete.userId !== this.userId) {
      return null; // Treat unauthorised as not found
    }

    return record;
  }
}
```

### Backend Task: New Route Handler

```typescript
// CONTRACT: AUTH_IDENTITY
// userId boundary — athleteId resolved server-side
app.get(
  '/api/v1/resource',
  { onRequest: [app.authenticate] },
  async (request, reply) => {
    const userId = request.user.id;
    const repo = new FeatureRepository(userId);
    const data = await repo.findAll();
    return reply.send(data);
  }
);
```

### Frontend Task: New Feature Component

```typescript
// Must render inside AppShell — no custom nav shell
// Tailwind utilities only — no arbitrary values
// 44×44px minimum tap targets on interactive elements
export function FeaturePanel() {
  const { data, isLoading, error } = useFeatureData();

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return <EmptyState />;

  return (
    <div className="space-y-4">
      {/* feature content */}
    </div>
  );
}
```

---

## Test Patterns by Task Type

### Repository Unit Test

```typescript
describe('FeatureRepository', () => {
  let repo: FeatureRepository;

  beforeAll(async () => {
    // server created once — see test-integrity-checker
  });

  beforeEach(async () => {
    await prisma.resource.deleteMany();
    repo = new FeatureRepository('user-test-001');
  });

  test('returns null for record owned by different user', async () => {
    const record = await prisma.resource.create({
      data: { athleteId: 'athlete-other', /* ... */ }
    });

    const result = await repo.findById(record.id);
    expect(result).toBeNull(); // Ownership enforced
  });
});
```

### Route Integration Test

```typescript
describe('GET /api/v1/resource', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await buildApp();
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  afterEach(async () => {
    await prisma.resource.deleteMany();
  });

  test('returns 401 when unauthenticated', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/resource'
    });
    expect(response.statusCode).toBe(401);
  });

  test('returns only records owned by authenticated user', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/resource',
      headers: { 'x-actor-id': 'user-test-001' }
    });
    expect(response.statusCode).toBe(200);
  });
});
```

---

## Common Mistakes to Avoid

| Mistake | Why It's Wrong | Correct Approach |
|---|---|---|
| Writing implementation before test | Violates Principle II | Write failing test first |
| Marking task done without running tests | Breaks test-first guarantee | Always run tests before marking done |
| Modifying shared infrastructure mid-feature | Breaks other features | Flag as out of scope |
| Accepting athleteId from route params | Violates identity boundary | Use userId from session only |
| Creating server in `beforeEach` | Violates Principle VII | Use `beforeAll` |
| Adding `app.close()` in `afterEach` | Violates Principle VII | Use `afterAll` only |
| Soft-failing on invariant violation | Violates Principle VI | Return explicit error, halt flow |

---

## End of Feature Checklist

Before marking a feature complete:

- [ ] All tasks in `tasks.md` marked `[x]`
- [ ] All tests pass (`cd api && npm test` and `cd app && npm test`)
- [ ] No regressions introduced
- [ ] Contract markers present on all ownership-enforcing code
- [ ] No scope expansion occurred without explicit approval
- [ ] Commits are clean and reference task numbers
- [ ] `specs/{slug}/tasks.md` ledger is accurate

---

## Related Skills

- `test-integrity-checker` — validates test lifecycle before commit
- `backend-data-ownership` — enforces Principle VI during repository work
- `api-route-generator` — generates compliant Fastify routes
- `migration-safety` — audits schema changes before applying

## Related Principles

- **Constitution II** (Test-First Reliability) — failing test before implementation
- **Constitution VI** (Backend Authority) — server enforces invariants
- **Constitution VII** (Test Architecture) — server lifecycle rules
- **Constitution IX** (Cross-Feature Consistency) — no drift from established patterns
