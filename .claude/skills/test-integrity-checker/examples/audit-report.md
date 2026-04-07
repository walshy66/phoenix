# Test Integrity Audit Report

**File**: [test file path]  
**Feature**: [FEATURE_ID]  
**Date**: [DATE]  
**Status**: [READY] / [BLOCKED]

---

## Summary

[Brief description of what tests are being audited]

---

## Principle VII Compliance

### Check 1: Server Lifecycle ✅ / ❌

**Requirement**: Server created exactly once per test file in `beforeAll`

**Finding**:
```
Server creation location: [beforeAll / beforeEach / other]
Number of server creations: [1 / N]
Status: [✅ COMPLIANT / ❌ VIOLATION]
```

**Evidence**:
- Server created in: [file.test.ts, line X]
- `beforeAll` block exists: [YES / NO]
- `beforeEach` server creation: [YES / NO]

**Violation** (if applicable):
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

---

### Check 2: Connection Management ✅ / ❌

**Requirement**: No manual `connectionManager.connect()` or `disconnect()` calls in tests

**Finding**:
```
connectionManager calls detected: [YES / NO]
Locations: [file, line numbers]
Status: [✅ COMPLIANT / ❌ VIOLATION]
```

**Evidence**:
- Search for `connectionManager.connect`: [FOUND at line X / NOT FOUND]
- Search for `connectionManager.disconnect`: [FOUND at line X / NOT FOUND]
- Calls in `beforeEach`: [YES / NO]
- Calls in `afterEach`: [YES / NO]

**Violation** (if applicable):
```typescript
// ❌ WRONG
beforeEach(async () => {
  await connectionManager.connect();
});

afterEach(async () => {
  await connectionManager.disconnect();
});

// ✅ CORRECT: Remove these blocks entirely
// Connections are global during test run
```

---

### Check 3: Server Teardown ✅ / ❌

**Requirement**: `app.close()` only in final `afterAll`, not in `afterEach`

**Finding**:
```
app.close() calls detected: [YES / NO]
Locations: [file, line numbers]
Status: [✅ COMPLIANT / ❌ VIOLATION]
```

**Evidence**:
- `app.close()` in `afterAll`: [YES / NO, line X]
- `app.close()` in `afterEach`: [YES / NO, line X]
- Data cleanup strategy: [deletion / isolation / reset / MISSING]

**Violation** (if applicable):
```typescript
// ❌ WRONG
afterEach(async () => {
  await server.close();
});

// ✅ CORRECT
afterAll(async () => {
  await server.close();
});

afterEach(async () => {
  await prisma.user.deleteMany();
});
```

---

### Check 4: Zero-State Validity ✅ / ❌

**Requirement**: Tests must not rely on implicit seeded state

**Finding**:
```
Implicit assumptions detected: [YES / NO]
Locations: [file, line numbers]
Status: [✅ COMPLIANT / ❌ VIOLATION / ⚠️ RISK]
```

**Evidence**:
- Tests create explicit data: [YES / NO]
- Hardcoded expectations: [FOUND / NOT FOUND]
- References to global seed: [FOUND / NOT FOUND]
- Tests can run independently: [YES / NO]

**Violations** (if applicable):

**Pattern 1: Assuming global seed**
```typescript
// ❌ WRONG
test("should list users", async () => {
  const response = await server.inject({ ... });
  expect(JSON.parse(response.body).length).toBe(5);  // Where do they come from?
});

// ✅ CORRECT
test("should list users", async () => {
  const users = [
    await prisma.user.create({ data: { name: "User 1" } }),
    await prisma.user.create({ data: { name: "User 2" } }),
    // ... create 5 users
  ];
  const response = await server.inject({ ... });
  expect(JSON.parse(response.body).length).toBe(5);
});
```

**Pattern 2: Assuming previous test data**
```typescript
// ❌ WRONG
test("second test", async () => {
  // Assumes test 1 created a user
  const response = await server.inject({ url: "/users" });
  expect(response.statusCode).toBe(200);
});

// ✅ CORRECT: Each test is independent
test("second test", async () => {
  const user = await prisma.user.create({ data: { name: "Test User" } });
  const response = await server.inject({ url: "/users" });
  expect(response.statusCode).toBe(200);
});
```

---

## Test Isolation Status

### Data Cleanup Strategy

- [ ] Option A: Per-test deletion (afterEach with deleteMany)
- [ ] Option B: Test isolation (each test creates/cleans own data)
- [ ] Option C: Database reset (full reset between tests)
- [ ] MISSING: No data cleanup strategy found

**Implementation**:
```typescript
afterEach(async () => {
  // [Chosen strategy here]
});
```

---

## Violation Summary

### Critical Violations 🔴
[List all CRITICAL violations found]

### High-Priority Violations 🟠
[List all HIGH violations found]

### Non-Blocking Risks 🟡
[List all informational findings]

---

## Remediation Plan

For each violation, provide:

1. **Violation**: [Description]
2. **Location**: [file.test.ts, line X]
3. **Fix**: [Code change needed]
4. **Effort**: [EASY / MEDIUM / HARD]

---

## Checklist Before Commit

- [ ] Server created exactly once in `beforeAll`
- [ ] No `connectionManager.connect/disconnect` in tests
- [ ] `app.close()` only in final `afterAll`
- [ ] Each test creates its own required data
- [ ] No hardcoded values assuming previous tests
- [ ] Data cleanup strategy implemented
- [ ] Tests can run in any order
- [ ] No implicit seeded state assumptions
- [ ] All violations resolved
- [ ] Status: [READY]

---

## Related Documentation

- Constitution Principle VII: [reference]
- Feature spec: [link if applicable]
- Implementation plan: [link if applicable]

---

## Notes

[Any additional context or special considerations]