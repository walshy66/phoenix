# Tasks: COA-87 Home Page Score

**Input**: Specs from `/specs/coa-87-home-page-score/`  
**Strategy**: Option C Execution Windows (fresh-context, max 3 tasks/window)  
**Windows**: 3 total, estimate 3–5 hours total

---

## Format Guide

- **[P]**: Can run in parallel (different files, same window)
- **Window N**: Execution context boundary
- **WINDOW_CHECKPOINT**: Hard gate before next window
- **Traceability**: FR/AC/User Story references
- **Test**: Validation required before marking complete

---

## Execution Window 1: Test Coverage & Regression Guards (BLOCKING)

**Purpose**: Add failing guards that define the disabled-by-default homepage behavior before code changes begin  
**Token Budget**: 40–60k  
**Checkpoint**: tests fail for the current homepage behavior; default-off expectations are explicit

### T001 [P] Add failing homepage-default-off source-level tests

**Window**: 1 (Blocking)
**Phase**: Tests First
**Traceability**: FR-001, FR-002, FR-005, FR-006, AC-001, AC-002, AC-003, AC-005
**Dependencies**: None
**Description**:
- Create a focused Vitest source-level test that reads `src/pages/index.astro`
- Assert the homepage currently needs a central toggle before it can omit the score surface
- Assert the disabled path must not include the carousel section, `Latest Results` heading, or carousel controls/markers
- Assert the disabled path must not leave a placeholder wrapper or reserved spacing block

**Files**:
- `src/components/__tests__/coa-87-home-page-score.test.ts`

**Test**: This suite must fail before implementation because the current homepage always loads and renders the score carousel

---

### T002 [P] Add failing preservation/regression tests for re-enable and scores pages

**Window**: 1 (Blocking)
**Phase**: Tests First
**Traceability**: FR-003, FR-004, FR-007, AC-004, AC-006, AC-007, AC-008
**Dependencies**: None
**Description**:
- Create a second source-level regression test suite
- Assert the feature toggle is centralized and easy to reverse
- Assert the existing carousel implementation remains present for future re-enablement
- Assert the `/scores` and `/scores/[gameId]` pages remain present and are not part of the homepage toggle change

**Files**:
- `src/components/__tests__/coa-87-home-page-score.regression.test.ts`

**Test**: This suite must fail before implementation if the toggle is missing or the homepage still hard-wires the carousel path

[WINDOW_CHECKPOINT_1]
- [ ] Homepage default-off tests fail as expected
- [ ] Re-enable/regression tests fail as expected
- [ ] The intended off-by-default behavior is locked in before code changes

---

## Execution Window 2: Homepage Toggle & Render Gating

**Purpose**: Introduce the central toggle and stop the homepage from loading/running the carousel path when disabled  
**Token Budget**: 50–70k  
**Checkpoint**: homepage renders without the score surface by default; no placeholder remains

### T003 Create the central homepage score toggle and wire it into the homepage

**Window**: 2
**Phase**: Implementation
**Traceability**: FR-003, FR-004, AC-004, AC-005
**Dependencies**: T001, T002
**Description**:
- Add a single central toggle source for the homepage score surface with a default-off value
- Update `src/pages/index.astro` to read that toggle instead of always enabling the carousel
- Keep the toggle easy to reverse later without rebuilding the feature

**Files**:
- `src/lib/home-scores/feature-flags.ts` (or equivalent central toggle module)
- `src/pages/index.astro`

**Test**: Source-level checks confirm the homepage now references the toggle instead of hard-coding the carousel on

---

### T004 Gate artifact loading and carousel rendering behind the toggle

**Window**: 2
**Phase**: Implementation
**Traceability**: FR-001, FR-002, FR-005, FR-006, AC-001, AC-002, AC-003
**Dependencies**: T003
**Description**:
- Move `loadInitialHomeArtifact()` behind the disabled/enabled branch so the homepage does not load carousel data when the feature is off
- Render `HomeScoresCarousel` only when the toggle is on
- Ensure the disabled path returns no placeholder wrapper, no controls, and no bootstrap script for the score surface
- Preserve the existing carousel implementation for future re-enablement

**Files**:
- `src/pages/index.astro`

**Test**: The homepage source/output no longer includes the `Latest Results` block or carousel markers when the feature is disabled

[WINDOW_CHECKPOINT_2]
- [ ] Homepage no longer renders the score carousel by default
- [ ] No placeholder or reserved spacing remains
- [ ] The carousel code path is still available behind the toggle

---

## Execution Window 3: Validation & Hand-off Notes

**Purpose**: Finish with validation evidence and a simple manual verification path  
**Token Budget**: 20–40k  
**Checkpoint**: tests/build pass and the disabled/enabled states are understandable to the next developer

### T005 [P] Add a short manual verification checklist for the toggle behavior

**Window**: 3
**Phase**: Documentation
**Traceability**: AC-001 through AC-008, SC-001 through SC-006
**Dependencies**: T004
**Description**:
- Add a concise quickstart/verification note for checking the disabled homepage state
- Include manual checks for the re-enabled path and for `/scores` route regression safety
- Keep instructions focused on the off-by-default behavior and responsive checks

**Files**:
- `specs/coa-87-home-page-score/quickstart.md`

**Test**: A maintainer can follow the checklist to verify the homepage without the carousel and then confirm re-enable behavior

---

### T006 Run focused validation and build checks

**Window**: 3
**Phase**: Validation
**Traceability**: FR-001 through FR-007, AC-001 through AC-008
**Dependencies**: T004, T005
**Description**:
- Run the targeted Vitest suites for COA-87
- Run the project build to ensure the homepage still compiles cleanly
- Manually confirm the homepage at mobile, tablet, and desktop widths with the carousel disabled
- Confirm `/scores` and `/scores/[gameId]` still behave normally

**Files**:
- test output only

**Test**: Targeted tests and build pass; manual validation confirms the carousel is absent by default and the rest of the site remains intact

[WINDOW_CHECKPOINT_3]
- [ ] Targeted tests pass
- [ ] Build passes
- [ ] Disabled homepage state verified at key breakpoints
- [ ] `/scores` routes unaffected

---

## Dependency Graph

```text
Window 1 (Tests)  ← no dependencies
   ↓
Window 2 (Implementation) ← depends on Window 1
   ↓
Window 3 (Validation) ← depends on Window 2
```

---

## Implementation Notes

- Keep the homepage score surface disabled by default.
- Do not leave behind a blank section shell or spacing gap.
- Preserve the existing `HomeScoresCarousel` implementation so it can be re-enabled later.
- Keep `/scores` and `/scores/[gameId]` outside the scope of this homepage toggle.
