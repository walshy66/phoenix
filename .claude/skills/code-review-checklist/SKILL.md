---
name: code-review-checklist
description: Enforce Principle IX (Cross-Feature Consistency & Review Enforcement) by auditing completed feature implementation for spec traceability, architectural compliance, test coverage, and pattern consistency before merge. Use when a feature branch is complete, before raising a PR, or when reviewing another agent's implementation output. Blocks merge on constitutional violations.
---

# Code Review Checklist

Audit completed feature work against the CoachCW constitution and established patterns before merge.

## When to Use This Skill

- Feature branch implementation is complete (all tasks done)
- Before raising a pull request
- Reviewing implementation output from the implement agent
- Auditing a branch for constitutional compliance
- Checking spec → implementation → test traceability

## Core Principles

1. **Traceability is mandatory**: Every acceptance criterion in the spec must map to a test. No AC without a test, no test without an AC.
2. **Patterns are non-negotiable**: Established folder structure, naming, and code patterns apply to every feature. Drift is a defect.
3. **Constitution violations block merge**: A failing constitutional check is not a "nice to have" — it must be resolved.
4. **No cross-layer leakage**: Domain logic stays in the backend. UI derives from server responses. Frontend never infers server state.
5. **Legacy artifacts must be removed**: Dead code, commented-out blocks, TODO stubs from implementation — all removed before merge.

---

## Review Workflow

### Step 1: Load Context

Read in this order:
1. `specs/{slug}/spec.md` — acceptance criteria, FR/NFR, non-goals
2. `specs/{slug}/plan.md` — declared scope, modules, schema changes
3. `specs/{slug}/tasks.md` — task ledger (all tasks should be `[x]`)
4. Changed files (`git diff main...{slug}`)

### Step 2: Run Automated Checks

```bash
# Full test suite must pass before review proceeds
cd api && npm test
cd app && npm test

# TypeScript must compile clean
cd api && npx tsc --noEmit
cd app && npx tsc --noEmit
```

If tests fail or TypeScript errors exist — **review stops here**. Fix first.

### Step 3: Work Through Checklist

Run every section below. Mark each item PASS / FAIL / N/A.

### Step 4: Produce Report

Use the audit report format in `examples/review-report.md`.

Status must be one of:
- **APPROVED** — all checks pass, ready to merge
- **CHANGES REQUIRED** — violations found, list each with fix required
- **BLOCKED** — constitutional violation, cannot merge until resolved

---

## Checklist

### Section 1: Spec Traceability

| Check | Status |
|---|---|
| Every AC in spec.md has a corresponding test | |
| Every test maps back to a spec AC or NFR | |
| Non-goals from spec are NOT implemented | |
| Feature scope matches plan.md declarations | |
| No undeclared schema changes | |

**How to check ACs:**
Open `specs/{slug}/spec.md`, find the Acceptance Criteria section, and for each AC locate the test that covers it. If you cannot find a test — FAIL.

**How to check non-goals:**
Open the "What This Is NOT" section of the spec. Confirm none of those behaviours exist in the implementation.

---

### Section 2: Constitutional Compliance

#### Principle II — Test-First Reliability

| Check | Status |
|---|---|
| New domain rules have explicit test coverage | |
| Critical failure paths are tested | |
| Edge cases tested where invariants are involved | |
| No new behaviour exists without a test | |

#### Principle VI — Backend Authority

| Check | Status |
|---|---|
| All invariants enforced server-side | |
| No client-side repair of invariant failures | |
| `userId` is the only external identity boundary | |
| `athleteId` does not appear in public API contracts | |
| 401 used when no valid user identity present | |
| 403 used only after identity resolution | |
| Validation errors do not return 403 | |

#### Principle VII — Test Architecture

| Check | Status |
|---|---|
| Integration test servers created in `beforeAll` only | |
| No `app.close()` in `afterEach` | |
| No `connectionManager.connect/disconnect` in tests | |
| Each test creates its own required data | |
| No hardcoded expectations relying on seeded data | |

#### Principle IX — Cross-Feature Consistency

| Check | Status |
|---|---|
| Folder structure follows kebab-case convention | |
| New modules placed in correct location (`api/src/modules/`) | |
| Frontend features placed in `app/src/features/` | |
| Shared primitives used, not re-implemented | |
| No duplication of existing domain logic | |
| Naming consistent with adjacent features | |

---

### Section 3: Data Ownership & Authorization

| Check | Status |
|---|---|
| `CONTRACT: DATA_OWNERSHIP` marker on all scoped repository code | |
| `CONTRACT: AUTH_IDENTITY` marker on all auth boundary code | |
| Repository constructor accepts `userId` and validates it | |
| All queries include `where: { athlete: { userId } }` or equivalent | |
| Mutations verify ownership before executing | |
| Protected routes have `onRequest: [app.authenticate]` | |
| No route accepts `athleteId` as a URL parameter | |

---

### Section 4: Error Semantics

| Check | Status |
|---|---|
| All error responses are structured JSON `{ error, message }` | |
| No raw database errors or stack traces returned to client | |
| Invariant violations halt the flow (no silent fallback) | |
| Standard error codes used (see `error-semantics-enforcer`) | |
| All errors logged internally with `request.log.error()` | |

---

### Section 5: Schema & Migration Safety

*Skip if no schema changes.*

| Check | Status |
|---|---|
| No destructive operations (DROP, RENAME) without approval | |
| New required fields have `@default` or backfill plan | |
| Enum changes do not break existing data | |
| Migration file exists for schema changes | |
| Migration applied cleanly (`npm run migrate:dev` passes) | |

---

### Section 6: Code Quality

| Check | Status |
|---|---|
| No TODO or FIXME comments in merged code | |
| No commented-out code blocks | |
| No dead imports | |
| No `console.log` statements (use `request.log`) | |
| No `any` types without justification | |
| File and function names follow kebab-case / camelCase conventions | |
| No files exceed reasonable length (>300 lines is a smell) | |

---

### Section 7: Frontend (if applicable)

*Skip if backend-only feature.*

| Check | Status |
|---|---|
| All new pages render inside AppShell (no custom nav shell) | |
| Navigation entries added to `navigation.config.ts` only | |
| Tailwind utilities used — no arbitrary values or inline styles | |
| Handheld layout implemented (single column, bottom nav compatible) | |
| Desktop layout implemented (sidebar, multi-column where appropriate) | |
| Touch targets are minimum 44×44px | |
| All interactive elements keyboard accessible | |
| Focus states visible | |
| Loading, error, and empty states all handled | |
| Frontend derives state from server response (no client inference) | |

---

### Section 8: Observability

| Check | Status |
|---|---|
| New domain flows include meaningful log entries | |
| Invariant violations are logged and observable | |
| No sensitive data (PII, tokens) in log output | |
| Error paths produce structured log entries | |

---

## Blocker Definitions

These findings **block merge** regardless of other checks passing:

| Blocker | Constitution Reference |
|---|---|
| Tests fail | Principle II |
| TypeScript compilation errors | Principle II |
| Invariant enforced client-side only | Principle VI |
| `athleteId` accepted at API boundary | Principle VI (Identity Boundary) |
| Server created in `beforeEach` | Principle VII |
| New behaviour with no test coverage | Principle II |
| AC in spec with no corresponding test | Principle IX |
| Non-goal from spec is implemented | Principle IX |
| Ownership check missing on mutation | Principle VI |

---

## Related Skills

- `feature-development` — the implementation workflow this review follows
- `test-integrity-checker` — deep dive on Principle VII compliance
- `backend-data-ownership` — deep dive on Principle VI compliance
- `error-semantics-enforcer` — error response standards
- `migration-safety` — schema change audit

## Related Principles

- **Constitution II** (Test-First Reliability)
- **Constitution VI** (Backend Authority & Invariants)
- **Constitution VII** (Test Architecture & Lifecycle Invariants)
- **Constitution IX** (Cross-Feature Consistency & Review Enforcement)
