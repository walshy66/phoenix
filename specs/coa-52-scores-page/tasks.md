# Tasks: COA-52 Scores Page

**Input**: Specs from `/specs/coa-52-scores-page/`  
**Strategy**: Option C Execution Windows (fresh-context, max 3 tasks/window)  
**Windows**: 5 total, estimate 7–9 hours total

---

## Format Guide

- **[P]**: Can run in parallel (different files, same window)
- **Window N**: Execution context boundary
- **WINDOW_CHECKPOINT**: Hard gate before next window
- **Traceability**: FR/AC/User Story references
- **Test**: Validation required before marking complete

---

## Execution Window 1: Foundation Utilities & Contract Guardrails (BLOCKING)

**Purpose**: Define week-window + fixture normalization behavior with tests first  
**Token Budget**: 60–75k  
**Checkpoint**: Utility tests green; deterministic Mon–Fri behavior; hidden-field suppression verified

### T001 Create failing tests for week window + fixture transforms
- **Window**: 1
- **Traceability**: FR-001, FR-002, FR-003, FR-013, AC-002, AC-004, AC-010, AC-015
- **Dependencies**: None
- **Description**:
  - Add tests for:
    - upcoming Mon–Fri window derivation (weekday/weekend boundary)
    - day bucketing (Mon/Tue/Wed/Fri only; Thu/Sat/Sun excluded)
    - kickoff sort ascending + TBA last
    - hidden squad field suppression
- **Files**:
  - `src/lib/scores/week-window.test.ts`
  - `src/lib/scores/fixtures.test.ts`
- **Test**: `npm test` shows new tests failing initially for missing implementation

### T002 Implement week-window + fixture utility modules to satisfy tests
- **Window**: 1
- **Traceability**: FR-001, FR-002, FR-003, FR-008, FR-013, AC-001..AC-004, AC-006, AC-010
- **Dependencies**: T001
- **Description**:
  - Implement pure utilities for:
    - week window derivation (`Australia/Melbourne`)
    - fixture normalization and day mapping
    - ordering and TBA handling
    - hidden data stripping for details model
- **Files**:
  - `src/lib/scores/week-window.ts`
  - `src/lib/scores/fixtures.ts`
- **Test**: `npm test` passes for newly added suites

### T003 Add lightweight fixture contract validator for generated weekly artifact
- **Window**: 1
- **Traceability**: FR-011, FR-012, AC-008, AC-009
- **Dependencies**: T002
- **Description**:
  - Add validation helper to ensure generated JSON has required keys (`window`, `status`, `days.*`)
  - Return structured error codes for parse/shape failures
- **Files**:
  - `src/lib/scores/contracts.ts`
  - `src/lib/scores/contracts.test.ts`
- **Test**: malformed fixture samples return expected error code/message

[WINDOW_CHECKPOINT_1]
- [ ] Utility and contract tests pass
- [ ] Weekend rollover and TBA ordering proven in tests
- [ ] Hidden fields are explicitly filtered

---

## Execution Window 2: Weekly Data Pipeline

**Purpose**: Produce `weekly-games-data.json` with robust error semantics  
**Token Budget**: 70–90k  
**Checkpoint**: scraper generates valid artifact and predictable error artifact

### T004 Create/extend weekly scraper output pipeline
- **Window**: 2
- **Traceability**: FR-001, FR-002, FR-009, FR-010, FR-011, FR-012, AC-008..AC-010, AC-015
- **Dependencies**: T003
- **Description**:
  - Implement weekly artifact generation using existing PlayHQ fetch pattern
  - Emit required shape:
    - `generatedAt`, `window` (`Australia/Melbourne`), `status`, `days` buckets
- **Files**:
  - `scripts/scrape-playhq.js` (extend) **or** `scripts/scrape-weekly-games.js` (new)
  - `scripts/weekly-games-data.json` (generated)
- **Test**: running scraper produces valid JSON with 4 day buckets

### T005 Add pipeline-level failure handling + structured logging
- **Window**: 2
- **Traceability**: FR-010, FR-011, FR-012, AC-008, AC-009
- **Dependencies**: T004
- **Description**:
  - Handle auth/network/parse failures with explicit error codes
  - On failure, preserve and serve the most recent successful weekly dataset (if available) and set stale banner metadata
  - If no prior successful dataset exists, emit `status:error` artifact
  - Ensure logs include: `timestamp`, `operation`, `status/errorCode`, `message`, `windowStart`, `windowEnd`
- **Files**:
  - scraper file from T004
- **Test**: simulated failure path logs required fields and produces stale-with-banner behavior (or contract-valid error artifact when no prior data exists)

### T006 Add manual smoke script/check command for artifact verification
- **Window**: 2
- **Traceability**: AC-008..AC-010
- **Dependencies**: T005
- **Description**:
  - Add simple command/check helper to verify artifact presence + minimum shape pre-build
- **Files**:
  - `scripts/check-weekly-games-data.js` (new)
  - `package.json` scripts update (if needed)
- **Test**: check passes with valid artifact and fails with clear message when invalid/missing

[WINDOW_CHECKPOINT_2]
- [ ] Weekly artifact generated successfully
- [ ] Error artifact path verified
- [ ] Logging and check command operational

---

## Execution Window 3: `/scores` Page Rebuild (This Week’s Games)

**Purpose**: Deliver the P1 weekly 4-column UX with accessibility + states  
**Token Budget**: 70–90k  
**Checkpoint**: AC-001..AC-004, AC-008, AC-011..AC-015 pass

### T007 Create failing UI tests for grouping/order/states (where practical)
- **Window**: 3
- **Traceability**: FR-002, FR-003, FR-004, FR-009, FR-011, AC-001..AC-004, AC-008, AC-014, AC-015
- **Dependencies**: T006
- **Description**:
  - Add component/unit tests for renderer helpers + empty/error state selectors
  - If page-level tests are limited, codify assertions in helper-level tests + manual checklist stubs
- **Files**:
  - `src/lib/scores/rendering.test.ts` (or equivalent)
- **Test**: new tests fail before UI implementation

### T008 Rebuild `/scores` to consume weekly artifact and render 4 fixed day columns
- **Window**: 3
- **Traceability**: FR-002..FR-005, FR-009, FR-011, AC-001..AC-004, AC-008, AC-014, AC-015
- **Dependencies**: T007
- **Description**:
  - Update `src/pages/scores.astro`:
    - Title: "This Week's Games"
    - Mon/Tue/Wed/Fri columns only
    - per-day empty states
    - full-page empty state
    - stale-data banner when prior successful data is rendered after fetch failure
    - clear error state when artifact is error and no prior successful data exists
- **Files**:
  - `src/pages/scores.astro`
  - `src/components/WeeklyGameTile.astro` (new)
  - `src/components/DayColumn.astro` (new)
- **Test**: automated helper tests pass; manual AC checks succeed on local run

### T009 Accessibility/responsive hardening for scores grid interactions
- **Window**: 3
- **Traceability**: NFR-002, NFR-003, NFR-004, AC-011..AC-013
- **Dependencies**: T008
- **Description**:
  - Ensure semantic grouping/heading structure, keyboard focus states, mobile/tablet/desktop usability
- **Files**:
  - `src/pages/scores.astro`
  - new components from T008
- **Test**: keyboard-only walkthrough + breakpoint checks (320/768/1024+) pass

[WINDOW_CHECKPOINT_3]
- [ ] P1 schedule experience is complete
- [ ] Error/empty/day-empty/stale-banner states verified
- [ ] Accessibility/responsive checklist passes

---

## Execution Window 4: Game Details Surface

**Purpose**: Complete click-through details behavior safely  
**Token Budget**: 55–75k  
**Checkpoint**: AC-005..AC-007 pass

### T010 Add details route/data resolver with fixture lookup by gameId
- **Window**: 4
- **Traceability**: FR-006, FR-007, FR-008, AC-005, AC-006
- **Dependencies**: T009
- **Description**:
  - Implement `/scores/[gameId].astro` (preferred pattern from plan)
  - Resolve fixture from same weekly artifact; show teams/time/venue/grade where available
- **Files**:
  - `src/pages/scores/[gameId].astro` (new)
  - `src/lib/scores/fixture-lookup.ts` (new, optional)
- **Test**: valid ID renders details, unknown ID renders graceful not-found state

### T011 Wire tile click-through + return-path behavior
- **Window**: 4
- **Traceability**: FR-006, AC-005, AC-007
- **Dependencies**: T010
- **Description**:
  - Link each fixture tile to details route
  - Ensure back navigation returns user to weekly list context
- **Files**:
  - `src/components/WeeklyGameTile.astro`
  - `src/pages/scores.astro`
- **Test**: click -> details -> back flow works without losing weekly context

### T012 Enforce hidden-field suppression in details rendering
- **Window**: 4
- **Traceability**: FR-008, AC-006
- **Dependencies**: T010
- **Description**:
  - Ensure detail renderer never surfaces hidden squad/player fields
  - Add regression test fixture with hidden data
- **Files**:
  - `src/pages/scores/[gameId].astro`
  - `src/lib/scores/fixtures.test.ts` (or dedicated details test)
- **Test**: hidden fields absent from rendered detail output

[WINDOW_CHECKPOINT_4]
- [ ] Details path functional and stable
- [ ] Back path verified
- [ ] Hidden data protections verified

---

## Execution Window 5: Sunday Refresh Automation + Documentation Polish

**Purpose**: Operationalize weekly freshness and finalize verification docs  
**Token Budget**: 40–60k  
**Checkpoint**: AC-009..AC-010 + operational docs complete

### T013 Configure scheduled Sunday refresh runbook/pipeline
- **Window**: 5
- **Traceability**: FR-010, FR-012, AC-009, AC-010
- **Dependencies**: T012
- **Description**:
  - Implement or document concrete Sunday automation entrypoint (pipeline/cron equivalent)
  - Include manual rerun path
- **Files**:
  - automation config file(s) if available in repo
  - `specs/coa-52-scores-page/quickstart.md` (update)
- **Test**: manual trigger path executes scraper and updates generated timestamp

### T014 Update maintainer docs for weekly games operations
- **Window**: 5
- **Traceability**: FR-009, FR-010, FR-011, FR-012
- **Dependencies**: T013
- **Description**:
  - Document commands, env requirements, failure troubleshooting, rollback behavior
- **Files**:
  - `HOWTO.md`
  - `specs/coa-52-scores-page/quickstart.md`
- **Test**: fresh collaborator can run documented steps end-to-end

### T015 Final acceptance sweep + implementation summary
- **Window**: 5
- **Traceability**: AC-001..AC-015, SC-001..SC-008
- **Dependencies**: T014
- **Description**:
  - Execute full checklist, capture evidence, and produce implementation summary
- **Files**:
  - `IMPLEMENTATION_SUMMARY.md` (or feature-local summary)
- **Test**: all AC/SC marked pass or explicitly documented with rationale

[WINDOW_CHECKPOINT_5]
- [ ] Sunday refresh path validated
- [ ] Docs updated for maintainers
- [ ] Full acceptance evidence captured

---

## Dependency Graph

```text
Window 1 (Foundation)
  ↓
Window 2 (Data Pipeline)
  ↓
Window 3 (Scores UI)
  ↓
Window 4 (Details)
  ↓
Window 5 (Automation + Polish)
```

---

## Parallelization Notes

- Most tasks are intentionally sequential due to shared files (`scores.astro`, scraper file).
- Safe [P] opportunities (optional extra staffing):
  - Within Window 1: contract tests can be drafted in parallel with fixture tests if split by file owner.
  - Within Window 5: docs update and acceptance evidence collection can overlap after T013 completes.

---

## Ready-for-Implement Checklist

- [ ] tasks.md approved
- [ ] Window boundaries accepted (fresh-context after each checkpoint)
- [ ] Test-first expectations clear per window
- [ ] Begin `/skill:implement` from Window 1
