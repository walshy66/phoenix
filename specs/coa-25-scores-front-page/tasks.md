# Tasks: COA-25 Scores Front Page Carousel

**Input**: Specs from `/specs/coa-25-scores-front-page/`  
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

## Execution Window 1: Data Foundation & Contracts (BLOCKING)

**Purpose**: Define 7-day artifact behavior and contract guardrails before UI changes  
**Token Budget**: 60–80k  
**Checkpoint**: artifact contract/tests pass; failure semantics validated

### T001 Create failing tests for 7-day transforms and carousel dataset normalization
- **Window**: 1
- **Traceability**: FR-001, FR-002, FR-003, AC-001, AC-009
- **Dependencies**: None
- **Description**:
  - Add tests for:
    - rolling 7-day filtering
    - de-dup by `gameId`
    - missing time -> `TBA`
    - stable sort order for display
- **Files**:
  - `src/lib/home-scores/transforms.test.ts`
- **Test**: new tests fail initially for missing implementation

### T002 Implement home-scores transform utilities
- **Window**: 1
- **Traceability**: FR-001, FR-002, FR-003, FR-009, FR-010
- **Dependencies**: T001
- **Description**:
  - Implement pure utilities for 7-day selection and normalization
  - Preserve source-authoritative values (no fabrication)
- **Files**:
  - `src/lib/home-scores/transforms.ts`
- **Test**: transform test suite passes

### T003 Add artifact contract validator + shape tests
- **Window**: 1
- **Traceability**: FR-009, FR-010, FR-011, AC-010, AC-011, AC-015
- **Dependencies**: T002
- **Description**:
  - Add validator for home artifact statuses (`success|stale|error`)
  - Validate required metadata and structured error shape
- **Files**:
  - `src/lib/home-scores/contracts.ts`
  - `src/lib/home-scores/contracts.test.ts`
- **Test**: malformed payloads return deterministic error codes

[WINDOW_CHECKPOINT_1]
- [ ] Transform and contract suites pass
- [ ] 7-day window behavior proven in tests
- [ ] stale/error semantics represented in contract

---

## Execution Window 2: Refresh Pipeline + Observability

**Purpose**: Produce authoritative home carousel artifact with robust failure paths  
**Token Budget**: 60–85k  
**Checkpoint**: refresh command generates valid artifact and logs required fields

### T004 Implement/extend scraper to emit 7-day home artifact
- **Window**: 2
- **Traceability**: FR-001, FR-002, FR-003, FR-011, AC-001, AC-015
- **Dependencies**: T003
- **Description**:
  - Add/extend script to generate dedicated home carousel artifact
  - Include `generatedAt`, `window`, `status`, `games[]`
- **Files**:
  - `scripts/scrape-home-games.js` (new) **or** extend existing scores scraper
  - `scripts/home-games-data.json` (generated)
- **Test**: command produces contract-valid JSON

### T005 Implement stale/error fallback behavior with structured logging
- **Window**: 2
- **Traceability**: FR-009, FR-010, FR-011, AC-010, AC-011, AC-015
- **Dependencies**: T004
- **Description**:
  - On refresh failure:
    - prior valid artifact -> output `status: stale` + banner metadata
    - no prior valid artifact -> output `status: error`
  - Ensure logs include: `timestamp`, `operation`, `status/errorCode`, `message`, `windowStart`, `windowEnd`
- **Files**:
  - scraper file from T004
- **Test**: simulated failure path produces expected stale/error artifact and log fields

### T006 Add artifact verification script and npm command
- **Window**: 2
- **Traceability**: FR-011, AC-015
- **Dependencies**: T005
- **Description**:
  - Add smoke checker for home artifact contract
  - Add package script(s) for refresh/check flow
- **Files**:
  - `scripts/check-home-games-data.js`
  - `package.json`
- **Test**: check fails clearly when artifact missing/invalid; passes when valid

[WINDOW_CHECKPOINT_2]
- [ ] refresh command produces valid artifact
- [ ] failure fallback path verified
- [ ] observability fields confirmed in logs

---

## Execution Window 3: Home Carousel UI (P1 Core)

**Purpose**: Replace static latest results with interactive, accessible carousel  
**Token Budget**: 70–95k  
**Checkpoint**: AC-001..AC-007, AC-009, AC-012..AC-014 pass

### T007 Create failing carousel behavior tests (looping, pause/resume, control stepping)
- **Window**: 3
- **Traceability**: FR-004, FR-005, FR-006, FR-007, AC-002..AC-007
- **Dependencies**: T006
- **Description**:
  - Add tests for index loop logic and pause/resume timing state helpers
- **Files**:
  - `src/lib/home-scores/carousel.test.ts`
- **Test**: tests fail prior to helper implementation

### T008 Implement carousel state helpers + new home carousel component
- **Window**: 3
- **Traceability**: FR-004..FR-007, NFR-001..NFR-003, AC-002..AC-007, AC-012..AC-014
- **Dependencies**: T007
- **Description**:
  - Implement helper logic for next/prev looping and idle resume
  - Build carousel UI component using existing score-card style language
  - Ensure keyboard-focusable controls/cards and semantic labels
- **Files**:
  - `src/lib/home-scores/carousel.ts`
  - `src/components/HomeScoresCarousel.astro`
  - optional `src/components/HomeGameCardLink.astro`
- **Test**: helper suite passes; manual keyboard and interaction checks pass

### T009 Integrate carousel into home page with empty/stale/error states
- **Window**: 3
- **Traceability**: FR-001, FR-003, FR-009, FR-010, NFR-005..NFR-007, AC-001, AC-009..AC-014
- **Dependencies**: T008
- **Description**:
  - Replace `recentScores` static array section on home page
  - Load artifact and render one of: populated / empty / stale / error
- **Files**:
  - `src/pages/index.astro`
- **Test**: local manual verification of all states and breakpoints

[WINDOW_CHECKPOINT_3]
- [ ] carousel interactions behave as specified
- [ ] home page renders valid state in all data conditions
- [ ] keyboard/responsive checks pass

---

## Execution Window 4: Detail Route Compatibility + Navigation

**Purpose**: Guarantee card deep-link behavior to game details from home carousel  
**Token Budget**: 55–80k  
**Checkpoint**: AC-008 fully satisfied

### T010 Add/verify game detail route compatibility for `/scores/{gameId}`
- **Window**: 4
- **Traceability**: FR-008, AC-008
- **Dependencies**: T009
- **Description**:
  - If dynamic details route is absent, create minimal route behavior
  - Ensure graceful not-found handling for unknown IDs
- **Files**:
  - `src/pages/scores/[gameId].astro` (new if missing)
  - optional lookup helpers in `src/lib/home-scores/` or shared scores utilities
- **Test**: valid ID loads detail content; invalid ID shows graceful fallback

### T011 Wire home cards to details route and verify return path UX
- **Window**: 4
- **Traceability**: FR-008, AC-008
- **Dependencies**: T010
- **Description**:
  - Ensure every home card links to `/scores/{gameId}`
  - Validate return/back behavior keeps user in coherent home context
- **Files**:
  - `src/components/HomeScoresCarousel.astro`
  - optionally `src/pages/scores/[gameId].astro`
- **Test**: click and keyboard activation flows verified end-to-end

### T012 Regression check: hidden detail fields remain suppressed
- **Window**: 4
- **Traceability**: User Story 3, AC-008 (detail safety)
- **Dependencies**: T010
- **Description**:
  - Add/confirm regression test for hidden squad/player suppression in detail data path
- **Files**:
  - relevant existing scores tests (e.g. `src/lib/.../fixtures.test.ts`) or new focused test
- **Test**: hidden fields not displayed in details output

[WINDOW_CHECKPOINT_4]
- [ ] deep-link detail navigation fully operational
- [ ] unknown IDs handled safely
- [ ] hidden field safeguards preserved

---

## Execution Window 5: Final Validation & Docs

**Purpose**: Operational readiness and acceptance evidence  
**Token Budget**: 40–60k  
**Checkpoint**: final acceptance captured and docs runnable by maintainer

### T013 Update runbook docs for home carousel data refresh and troubleshooting
- **Window**: 5
- **Traceability**: FR-011, NFR-005, SC-006
- **Dependencies**: T012
- **Description**:
  - Document commands, environment requirements, stale/error behavior, and manual override steps
- **Files**:
  - `HOWTO.md`
  - `specs/coa-25-scores-front-page/quickstart.md`
- **Test**: fresh collaborator can run documented steps successfully

### T014 Execute full validation sweep (targeted tests + build + manual checklist)
- **Window**: 5
- **Traceability**: AC-001..AC-015, SC-001..SC-006
- **Dependencies**: T013
- **Description**:
  - Run focused suites, artifact checks, and production build
  - Execute manual acceptance checklist at key breakpoints
- **Files**:
  - test files/results + artifact outputs
- **Test**: evidence collected for all acceptance criteria

### T015 Create implementation summary for COA-25
- **Window**: 5
- **Traceability**: all FR/AC/SC
- **Dependencies**: T014
- **Description**:
  - Capture delivered scope, evidence, known limitations, and operational notes
- **Files**:
  - `specs/coa-25-scores-front-page/IMPLEMENTATION_SUMMARY.md`
- **Test**: summary traces every AC to evidence or explicit rationale

[WINDOW_CHECKPOINT_5]
- [ ] docs updated and accurate
- [ ] validation evidence complete
- [ ] implementation summary created

---

## Dependency Graph

```text
Window 1 (Data foundation)
  ↓
Window 2 (Refresh pipeline)
  ↓
Window 3 (Home carousel UI)
  ↓
Window 4 (Detail navigation compatibility)
  ↓
Window 5 (Validation + docs)
```

---

## Parallelization Notes

- Most tasks are sequential due to shared UI and script surfaces.
- Safe [P] opportunities are limited to independent test drafting in Window 1/3 when files do not overlap.

---

## Ready-for-Implement Checklist

- [ ] tasks.md approved
- [ ] execution windows accepted
- [ ] test-first expectations clear
- [ ] begin `/skill:implement` starting Window 1