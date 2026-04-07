---
name: spec-writer
description: Provide quality standards and writing guidance for CoachCW feature specifications. Use when writing or reviewing spec.md files, defining acceptance criteria, writing user stories, or evaluating whether a spec is complete enough to hand to the implement agent. Backs the design agent with domain-specific spec quality rules. Use alongside the design agent — not instead of it.
---

# Spec Writer

Quality standards and writing guidance for CoachCW feature specifications.

## When to Use This Skill

- Writing `specs/{slug}/spec.md` during the design phase
- Evaluating whether a spec is complete enough to proceed to planning
- Writing acceptance criteria that will survive hand-off to the implement agent
- Reviewing a spec for gaps before running the analyze agent
- Writing user stories with testable acceptance scenarios

## Relationship to the Design Agent

The design agent handles the pipeline: what to read, what steps to follow, what to output.  
This skill handles quality: what makes each section good, what "done" looks like, and what gaps will cause problems downstream.

Use both together. The design agent tells you what to do. This skill tells you how to do it well.

---

## The Core Problem This Skill Solves

A spec that looks complete can still fail at implementation. The failure modes are:

1. **Acceptance criteria that can't be tested** — too vague, too broad, or dependent on subjective judgement
2. **Missing invariant rules** — the spec describes happy path only, implement agent doesn't know what to protect
3. **Non-goals not enforced** — "this is NOT in scope" stated in intent but not reflected as constraints in requirements
4. **Constitutional violations baked in** — spec describes client-side state inference, athleteId at boundary, or custom nav shells
5. **Scope ambiguity** — two reasonable interpretations of a requirement, implement agent picks one silently

Every section below is written to prevent one of these failure modes.

---

## Section Quality Standards

### Summary

**Purpose**: One paragraph that orients any reader — what this feature is, who it's for, and what it replaces or extends.

**What good looks like:**
- Answers: what problem does this solve for which user?
- Names any existing API or module being reused or extended
- Does not describe implementation approach
- Does not repeat acceptance criteria

**What bad looks like:**
```
// ❌ Too vague
"This feature adds exercise history to the app."

// ❌ Implementation detail in summary
"This feature adds a GET /api/v1/exercise-history endpoint backed by a new ExerciseHistoryRepository."

// ✅ Good
"Exercise History gives athletes a chronological view of their logged sets and weights
for any exercise in their history. It surfaces personal bests and trend data derived
from existing session log data — no new data collection required. Extends the existing
session log read model introduced in Feature 046b."
```

---

### User Stories

**Purpose**: Define who wants what and why, in independently testable slices.

**Priority rules:**
- **P1**: Must ship for the feature to have value. Independently releasable as MVP.
- **P2**: Significant value add, but P1 ships without it.
- **P3**: Nice to have. Deprioritised if time is constrained.

**Each story must include:**
- A clear user (athlete, coach — not "user" generically when you can be specific)
- What they want to do
- Why they want to do it
- An independent test description (how you'd verify this story alone)
- At least two acceptance scenarios in Given/When/Then format

**What good looks like:**
```
### User Story 1 — View Exercise History (Priority: P1)

As an athlete, I want to see my logged sets and weights for a specific exercise
across all completed sessions, so I can understand my progress over time.

**Why P1**: Without this, the feature has no value. It's the core read surface.

**Independent Test**: With 3 completed sessions containing the same exercise,
the history panel shows all 3 entries in reverse chronological order.

**Acceptance Scenarios**:
1. Given I have completed sessions containing "Barbell Back Squat",
   When I view exercise history for that exercise,
   Then I see each logged set with weight, reps, and session date,
   ordered most recent first.

2. Given I have no completed sessions,
   When I view exercise history for any exercise,
   Then I see an empty state with guidance to complete a session.
```

**What bad looks like:**
```
// ❌ No test description, no scenarios
"As an athlete I want to see my exercise history."

// ❌ Scenario not testable — "should work correctly" is meaningless
"Given I log a session, When I view history, Then it should work correctly."

// ❌ Mixed priorities — P1 story contains P2 behaviour
"As an athlete I want to see my history and share it with my coach."
```

---

### Functional Requirements

**Purpose**: The explicit rules the system must follow. Each requirement becomes a test target.

**Formatting rules:**
- `FR-001`, `FR-002` — sequential, never renumbered
- `System MUST` — hard requirement
- `System MUST NOT` — explicit prohibition (use for non-goals)
- `System MAY` — optional behaviour
- Each FR is one testable assertion — not a paragraph

**Non-goals become MUST NOT requirements:**
Every item in "What This Is NOT" from FEATURE.md must appear as an explicit `MUST NOT` in the requirements. Do not leave non-goals as prose in the summary — they get ignored.

```
// ✅ Non-goal converted to requirement
FR-008: System MUST NOT expose write endpoints for exercise history data.
FR-009: System MUST NOT accept athleteId as a request parameter.

// ❌ Non-goal left in summary only — will be missed
"This feature does not include write capability."
```

**What good looks like:**
```
FR-001: System MUST return exercise history entries ordered by session date, most recent first.
FR-002: System MUST scope all history queries to the authenticated user's data only.
FR-003: System MUST return an empty collection (not an error) when no history exists.
FR-004: System MUST return personal best (highest weight × reps combination) when history exists.
FR-005: System MUST return 401 when the request is unauthenticated.
FR-006: System MUST NOT return revision metadata fields in history responses.
FR-007: System MUST NOT accept athleteId as a URL parameter or request body field.
```

**What bad looks like:**
```
// ❌ Not testable — "appropriate" is undefined
"FR-001: System MUST return appropriate history data."

// ❌ Implementation detail — WHAT not HOW
"FR-001: System MUST use ExerciseHistoryRepository with userId constructor injection."

// ❌ Multiple assertions in one FR
"FR-001: System MUST return history ordered by date and include personal best and scope by user."
```

---

### Non-Functional Requirements

**Purpose**: Constraints on how the system behaves — accessibility, layout, error handling, observability.

Always include these four for any feature with a UI:

```
NFR-001: All interactive elements MUST be keyboard accessible (Constitution — Accessibility).
NFR-002: Touch targets MUST be a minimum of 44×44px on handheld layouts.
NFR-003: Feature MUST render a handheld layout (single column) and a desktop layout.
NFR-004: All error responses MUST be structured JSON { error, message } — no raw errors.
NFR-005: All domain flow entry and exit points MUST produce structured log entries.
```

Add feature-specific NFRs for performance expectations, data volume constraints, or caching behaviour if relevant.

---

### Acceptance Criteria

**Purpose**: The definitive test list. If all ACs pass, the feature is done.

**Rules:**
- Given/When/Then format — always
- Each AC is independently testable
- Cover: happy path, auth failure, empty state, error state, ownership boundary, handheld layout, desktop layout
- Every P1 user story must have at least one AC
- ACs must not reference implementation — they describe observable behaviour only

**Minimum AC set for a read-only backend + UI feature:**

```
AC-001: Given an authenticated user with exercise history,
        When they request history for a valid exercise,
        Then the system returns entries scoped to their data only, ordered most recent first.

AC-002: Given an unauthenticated request,
        When exercise history is requested,
        Then the system returns 401 Unauthorized.

AC-003: Given an authenticated user with no history for an exercise,
        When they request history for that exercise,
        Then the system returns an empty collection with status 200.

AC-004: Given an authenticated user requesting history owned by another user,
        When the request is made,
        Then the system returns 404 (not 403 — existence not leaked).

AC-005: Given a user on a handheld device,
        When they view exercise history,
        Then the panel renders in a single-column layout with adequate touch targets.

AC-006: Given a user on desktop,
        When they view exercise history,
        Then the panel renders within the AppShell with sidebar navigation visible.

AC-007: Given the backend is unreachable,
        When the user attempts to load exercise history,
        Then a structured error state is shown with a retry affordance.
```

---

### Edge Cases

**Purpose**: Conditions that break happy-path assumptions. Each edge case should trace to a test.

**Always consider:**
- Empty state (zero records)
- Single record (personal best = only record)
- Very large data set (pagination boundary)
- Concurrent requests (duplicate prevention)
- Deleted or soft-deleted records
- Clock/timezone edge cases if dates are involved
- User with no athlete record (zero-state validity — Constitution Principle VII)

**Format:**
```
- No history exists for selected exercise → empty state, not error
- Exercise exists in history but all sessions are abandoned → treat as empty
- User has athlete record but no completed sessions → empty state
- Request for exerciseId that exists but belongs to another user → 404
- Request for exerciseId that does not exist in exercise catalog → 404
```

---

### Constitutional Compliance

**Purpose**: Explicit sign-off that the spec doesn't violate constitutional rules.

**How to write it:**
- List only the principles that apply to this feature
- ✅ PASS, ⚠️ WARN, ❌ FAIL
- WARN means it's a risk to watch, not a violation
- FAIL means the spec must be revised before proceeding

**Minimum set for any feature touching backend + UI:**

```
✅ Principle I (User Outcomes): Each user story has a measurable acceptance scenario.
✅ Principle II (Test-First): All ACs are observable and testable independently.
✅ Principle VI (Backend Authority): History data derived server-side. No client computation.
✅ Identity Boundary: userId is the only external identity. athleteId not in API contract.
✅ AppShell: No custom navigation shell. Feature renders inside existing AppShell.
✅ Accessibility: NFR-001 and NFR-002 address keyboard nav and touch targets.
✅ Responsive: NFR-003 addresses handheld and desktop layouts.
⚠️ Principle VII: No new server bootstrap changes — but implement agent must follow lifecycle rules.
```

---

## Spec Completeness Gate

Before handing a spec to the analyze agent, verify:

- [ ] Summary is one paragraph, no implementation detail
- [ ] Every user story has at least one Given/When/Then scenario
- [ ] P1 stories are independently releasable without P2/P3
- [ ] Every non-goal from FEATURE.md appears as a MUST NOT requirement
- [ ] Every FR is a single testable assertion
- [ ] Minimum AC set covered (auth, empty state, ownership, layout)
- [ ] Edge cases include zero-state and ownership boundary
- [ ] Constitutional compliance section present with no ❌ FAIL items
- [ ] No implementation details anywhere (no file paths, no framework names, no library calls)

If any item is unchecked — the spec is not ready to proceed.

---

## Related Skills

- `feature-development` — the implementation workflow this spec feeds into
- `code-review-checklist` — verifies spec→implementation→test traceability at merge
- `backend-data-ownership` — enforces Principle VI patterns the spec describes
- `frontend-component-patterns` — enforces AppShell and layout rules the spec requires

## Related Principles

- **Constitution I** (User Outcomes First) — user stories must have measurable criteria
- **Constitution II** (Test-First) — ACs must be testable before implementation begins
- **Constitution VI** (Backend Authority) — spec must not describe client-side inference
- **Constitution IX** (Cross-Feature Consistency) — spec patterns must match established features
