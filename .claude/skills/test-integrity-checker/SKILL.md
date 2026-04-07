---
name: test-integrity-checker
description: Audit Vitest test files for lifecycle invariants, server-once rules, and connection safety. Use when adding or reviewing integration tests to ensure they follow Principle VII and don't destabilize shared infrastructure. Detects server lifecycle violations, improper connection management, and implicit state assumptions that break test isolation.
---

# Test Integrity Checker

Enforce Principle VII lifecycle invariants and ensure tests don't destabilize shared infrastructure.

## When to Use This Skill

- Writing new integration tests
- Reviewing existing test suites
- Debugging flaky or order-dependent tests
- Ensuring test isolation is maintained
- Validating test setup/teardown patterns
- Checking for connection leaks or server lifecycle issues

## Principle VII Requirements (Non-Negotiable)

All tests MUST follow these rules:

### Rule 1: Server Creation (MUST happen once per suite)
```typescript
// ✅ CORRECT
beforeAll(async () => {
  server = await buildApp();
  await server.ready();
});

// ❌ WRONG
beforeEach(async () => {
  server = await buildApp();  // Creates server N times
});
```

### Rule 2: Connection Management (No manual connection calls)
```typescript
// ✅ CORRECT: Connections are global during test run
const result = await prisma.user.findUnique({ ... });

// ❌ WRONG: Direct connection calls break isolation
beforeEach(async () => {
  await connectionManager.connect();
});

afterEach(async () => {
  await connectionManager.disconnect();  // Breaks other tests
});
```

### Rule 3: Server Cleanup (No app.close() in shared suites)
```typescript
// ✅ CORRECT: Clean data, not the server
afterEach(async () => {
  await prisma.user.deleteMany();  // Data cleanup only
});

afterAll(async () => {
  await server.close();  // Close once at end
});

// ❌ WRONG: Closing server in shared suite breaks other tests
afterEach(async () => {
  await server.close();  // Other tests lose server
});
```

### Rule 4: Zero-State Validity (No implicit seeded state)
```typescript
// ✅ CORRECT: Tests create their own data
test("should retrieve user", async () => {
  const user = await createTestUser();
  const result = await server.inject({ ... });
  expect(result).toBeDefined();
});

// ❌ WRONG: Assumes global seed or previous tests
test("should retrieve user", async () => {
  const result = await server.inject({ ... });
  expect(result.body.users.length).toBe(5);  // Where do 5 users come from?
});
```

---

## Safety Checks

### Check 1: Server Lifecycle (CRITICAL)
Ensures server is created exactly once per test file.

**Signals**: `beforeAll`, `beforeEach`, `createServer`, `buildApp`

**Violations**:
- ❌ Server created in `beforeEach` (N × test count)
- ❌ Server creation conditional or lazy
- ❌ Multiple `beforeAll` blocks creating servers
- ✅ Single `beforeAll` with server creation

**How to Fix**:
```typescript
// Move from beforeEach to beforeAll
beforeAll(async () => {
  server = await buildApp();
  await server.ready();
});
```

---

### Check 2: Connection Management (CRITICAL)
Ensures no manual connection lifecycle in tests.

**Signals**: `connectionManager.connect()`, `connectionManager.disconnect()`, `database.connect()`

**Violations**:
- ❌ `beforeEach` calls `connectionManager.connect()`
- ❌ `afterEach` calls `connectionManager.disconnect()`
- ❌ Tests explicitly managing database connections
- ✅ Connections are global and process-level

**How to Fix**:
```typescript
// REMOVE this:
beforeEach(async () => {
  await connectionManager.connect();
});

afterEach(async () => {
  await connectionManager.disconnect();
});

// INSTEAD: Just use Prisma directly
test("should work", async () => {
  await prisma.user.create({ ... });
});
```

---

### Check 3: Server Teardown (CRITICAL)
Ensures `app.close()` only called once at end of suite.

**Signals**: `app.close()`, `server.close()`, `afterEach`

**Violations**:
- ❌ `app.close()` in `afterEach` (closes for all subsequent tests)
- ❌ `app.close()` in middle of suite
- ✅ `app.close()` only in final `afterAll`

**How to Fix**:
```typescript
// WRONG:
afterEach(async () => {
  await server.close();
});

// CORRECT:
afterAll(async () => {
  await server.close();
});

// For per-test cleanup, use data deletion:
afterEach(async () => {
  await prisma.user.deleteMany();
});
```

---

### Check 4: Implicit Seeded State (HIGH)
Ensures tests don't rely on global seed or previous test state.

**Signals**: `seed`, `global`, `beforeEach` (missing explicit setup), `expect(...).toBe(hardcodedValue)`

**Violations**:
- ❌ Test assumes data from `npm run seed`
- ❌ Test assumes previous test created data
- ❌ `expect(results.length).toBe(5)` without creating 5 items first
- ✅ Each test explicitly creates required data

**How to Fix**:
```typescript
// WRONG:
test("should list users", async () => {
  const response = await server.inject({ ... });
  expect(JSON.parse(response.body).length).toBe(5);  // Where do they come from?
});

// CORRECT:
test("should list users", async () => {
  await createTestUser();
  await createTestUser();
  await createTestUser();
  
  const response = await server.inject({ ... });
  expect(JSON.parse(response.body).length).toBe(3);  // We created 3
});

// OR with beforeEach data cleanup:
test("should list users", async () => {
  const users = await Promise.all([
    prisma.user.create({ ... }),
    prisma.user.create({ ... }),
    prisma.user.create({ ... }),
  ]);
  
  const response = await server.inject({ ... });
  expect(JSON.parse(response.body).length).toBe(3);
});
```

---

## Workflow

1. **Scan Test File**
   - List all `beforeAll`, `beforeEach`, `afterAll`, `afterEach` blocks
   - Search for connection manager calls
   - Search for `app.close()` calls
   - Identify any hardcoded expectations

2. **Run Safety Checks**
   - Check 1: Server lifecycle (once per suite)
   - Check 2: Connection management (none in tests)
   - Check 3: Server teardown (once at end)
   - Check 4: Implicit state assumptions (explicit setup)

3. **Report Findings**
   - Status: `[READY]` or `[BLOCKED]`
   - Violations: Each mapped to Principle VII rule
   - Fixes: Concrete code changes needed

4. **Output Report**
   - List any constitutional violations
   - Provide corrected code for each violation
   - Confirm readiness to commit

---

## Output Format

```markdown
# Test Integrity Audit

**File**: api/src/routes/users.test.ts  
**Status**: [READY] / [BLOCKED]

## Violations

### CONSTITUTIONAL_VIOLATION: Principle VII - Server Lifecycle Violation
**Line 12**: Server created in `beforeEach`
```typescript
// ❌ WRONG (line 12-15)
beforeEach(async () => {
  server = await buildApp();
});

// ✅ CORRECT
beforeAll(async () => {
  server = await buildApp();
  await server.ready();
});
```

**Why This Matters**: Creating server N times (once per test) causes:
- Tests to interfere with each other
- Slow test execution
- Port conflicts
- Connection leaks

---

### RISK: Implicit Seeded State Assumption
**Line 45**: Test assumes 5 users exist without creating them
```typescript
// ⚠️ RISKY (line 45)
expect(JSON.parse(response.body).length).toBe(5);

// ✅ BETTER
const users = await Promise.all([
  prisma.user.create({ data: { name: "User 1" } }),
  // ... create 5 users
]);
const response = await server.inject({ ... });
expect(JSON.parse(response.body).length).toBe(5);
```

## Cleanup Strategy

For data cleanup between tests, use one of:

### Option A: Data Deletion (Preferred)
```typescript
afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.session.deleteMany();
});
```

### Option B: Test Isolation (If needed)
```typescript
// Each test gets fresh data
test("test 1", async () => {
  const user = await prisma.user.create({ ... });
  // Use this user
  await prisma.user.deleteMany();  // Cleanup at end
});
```

### Option C: Database Reset (If many tables)
```typescript
afterEach(async () => {
  // Reset all tables to clean state
  await resetDatabase();
});
```

---

## Checklist Before Committing Tests

- [ ] Server created exactly once (`beforeAll`)
- [ ] No `connectionManager.connect/disconnect` in tests
- [ ] `app.close()` only in final `afterAll`
- [ ] Each test creates its own required data
- [ ] No hardcoded values that assume previous tests ran
- [ ] Data cleanup strategy chosen (deletion/isolation/reset)
- [ ] Tests can run in any order
- [ ] Tests can run in parallel (if using isolated data)
- [ ] No flaky or order-dependent tests
- [ ] Status is `[READY]` before commit

---

## Common Violations & Fixes

### Violation 1: Server in beforeEach
```typescript
// ❌ WRONG
beforeEach(async () => {
  server = await buildApp();
});

// ✅ CORRECT
beforeAll(async () => {
  server = await buildApp();
  await server.ready();
});
```

### Violation 2: Connection management in tests
```typescript
// ❌ WRONG
beforeEach(async () => {
  await connectionManager.connect();
});

afterEach(async () => {
  await connectionManager.disconnect();
});

// ✅ CORRECT: Remove these blocks entirely
// Connections are global
```

### Violation 3: Closing server in afterEach
```typescript
// ❌ WRONG
afterEach(async () => {
  await server.close();
});

// ✅ CORRECT
afterAll(async () => {
  await server.close();
});

// For per-test cleanup:
afterEach(async () => {
  await prisma.user.deleteMany();  // Data cleanup only
});
```

### Violation 4: Implicit seed assumptions
```typescript
// ❌ WRONG: Assumes global seed ran
test("should list users", async () => {
  const response = await server.inject({ ... });
  expect(JSON.parse(response.body).length).toBeGreaterThan(0);
});

// ✅ CORRECT: Create explicit data
test("should list users", async () => {
  await prisma.user.create({ data: { name: "Test User" } });
  const response = await server.inject({ ... });
  expect(JSON.parse(response.body).length).toBeGreaterThan(0);
});
```

---

## Related Requirements

- **Constitution II (Test-First)**: Tests must exist before implementation
- **Constitution VII (Lifecycle)**: Server created once, connection management global
- **Constitution VI (Backend Authority)**: Tests validate server-side invariants