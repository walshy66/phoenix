# Implementation Plan: COA-52 Scores Page

**Branch**: `coa-52-scores-page`  
**Date**: 2026-04-13  
**Spec**: `specs/coa-52-scores-page/spec.md`  
**Status**: READY_FOR_TASKS

---

## Summary

COA-52 replaces the current `/scores` experience with a weekly fixtures view titled **"This Week's Games"**.

The implementation will:
1. Build a stable weekly-fixtures data pipeline from PlayHQ.
2. Render a 4-column day layout (Mon/Tue/Wed/Fri) with deterministic sorting.
3. Support fixture click-through to game details.
4. Add Sunday refresh automation + observable failure handling.

This plan intentionally keeps the architecture simple: static Astro page + generated JSON files from a Node scraper, following the existing site pattern already used by `scripts/scrape-playhq.js` and `src/pages/scores.astro`.

---

## Technical Context

- **Runtime**: Node.js `>=22.12.0` (project engines)
- **Frontend**: Astro `6.1.1`
- **Styling**: Tailwind CSS `4.2.2`
- **Data Source**: PlayHQ REST API (read-only)
- **Storage**: Generated JSON files under `scripts/`
- **Testing**: Vitest `4.1.2` + manual AC walkthrough
- **Target**: Web route `/scores`
- **Performance Targets**:
  - Render weekly grid in < 2s on standard connection
  - Interaction latency for tile activation < 100ms perceived
- **Scale**:
  - Dozens of weekly fixtures max
  - 4 fixed day buckets

---

## Constitution Check

- **Principle I (User Outcomes First)**: ✅ PASS — user stories map directly to visible outcomes (weekly discovery, detail access, freshness).
- **Principle II (Test-First Discipline)**: ✅ PASS — utility-first tests (window derivation, grouping/sorting, hidden-field filtering) written before behavior wiring.
- **Principle III (Backend Authority & Invariants)**: ✅ PASS — PlayHQ/source data is authoritative; UI does not invent missing fields.
- **Principle IV (Error Semantics & Observability)**: ✅ PASS — explicit user error states + structured scraper logs.
- **Principle V (AppShell Integrity)**: ✅ PASS — page remains in existing `BaseLayout` and nav shell.
- **Principle VI (Accessibility First)**: ✅ PASS — keyboard access, semantic headings/regions, visible focus, WCAG AA contrast.
- **Principle VII (Immutable Data Flow)**: ✅ PASS — one-way flow: PlayHQ -> generated JSON -> Astro render.
- **Principle VIII (Dependency Hygiene)**: ✅ PASS — no new runtime dependency required.
- **Principle IX (Cross-Feature Consistency)**: ✅ PASS — reuses existing Astro/Tailwind patterns and `/scores` route.

**Detail behavior is resolved**: details are deep-linkable and URL-addressable via dedicated route behavior, with predictable back-navigation to the weekly schedule.

---

## Project Structure

```text
specs/coa-52-scores-page/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts.md
├── quickstart.md
└── tasks.md              (next phase)

scripts/
├── scrape-playhq.js      (existing, may be extended or wrapped)
├── scores-data.json      (existing)
└── weekly-games-data.json (new generated artifact)

src/
├── pages/
│   ├── scores.astro
│   └── scores/
│       └── [gameId].astro   (deep-linkable detail surface)
├── components/
│   ├── WeeklyGameTile.astro (new)
│   └── DayColumn.astro      (new)
└── lib/
    └── scores/
        ├── week-window.ts   (new; pure functions)
        ├── fixtures.ts      (new; grouping/sorting/filtering)
        └── *.test.ts        (new Vitest tests)
```

---

## Delivery Phases

### Phase 1 — Domain Utilities + Tests (Foundation)

**Goal**: lock behavior for week window and fixture transformation before UI changes.

- Add pure utilities:
  - derive target Mon–Fri week window
  - bucket fixtures by required days (Mon/Tue/Wed/Fri)
  - sort fixtures by kickoff ascending, TBA last
  - sanitize hidden squad/player fields
- Write failing Vitest tests first, then implement.
- Add timezone handling strategy (AEST/AEDT safe week calculations).

**Exit criteria**:
- Utility tests pass
- Deterministic results for weekend boundary and missing-time cases

---

### Phase 2 — Data Pipeline for Weekly Fixtures

**Goal**: generate `scripts/weekly-games-data.json` consumable by `/scores`.

- Introduce/extend scraper logic to output weekly fixture schema.
- Ensure output includes:
  - `window` metadata (start/end, timezone = `Australia/Melbourne`)
  - four day buckets (Monday/Tuesday/Wednesday/Friday)
  - normalized fixture records for tile + details
  - refresh timestamp and status metadata
- Add graceful failure output path:
  - if prior successful dataset exists, preserve it and mark response as stale with banner metadata
  - if no prior successful dataset exists, emit error state
- Enforce observability minimum fields in refresh/fetch logs: `timestamp`, `operation`, `status/errorCode`, `message`, `windowStart`, `windowEnd`.
- Ensure credentials are read from env (never rendered client-side).

**Exit criteria**:
- Running scraper produces valid contract-compliant JSON
- Failures provide actionable logs and non-zero exit

---

### Phase 3 — `/scores` Page Rebuild (This Week's Games)

**Goal**: replace current scores/ladder UI with weekly 4-column experience.

- Update page title/hero to **"This Week's Games"**.
- Render four fixed columns: Monday, Tuesday, Wednesday, Friday.
- Render fixture tiles from generated weekly dataset.
- Handle states:
  - day empty state
  - full-page empty state (no fixtures this week)
  - stale-data banner when rendering cached prior successful data after fetch failure
  - API/data error state when no prior successful data exists
- Exclude Thursday/Saturday/Sunday fixtures from the weekly grid (no extra day columns).
- Ensure responsive behavior at 320/768/1024+ and keyboard navigation.

**Exit criteria**:
- AC-001..AC-004, AC-008, AC-011..AC-015 pass manually
- No AppShell regressions

---

### Phase 4 — Game Details + Sunday Refresh Automation

**Goal**: complete drill-down and freshness requirements.

- Implement tile click-through details surface.
  - Preferred: `/scores/[gameId]` static route reading same dataset.
- Ensure hidden data remains suppressed in details view.
- Add weekly automation:
  - scheduled job every Sunday (`Australia/Melbourne`) to run scraper + rebuild/deploy pipeline.
  - include manual trigger path for ops.
- Document refresh and operational recovery steps.

**Exit criteria**:
- AC-005..AC-007, AC-009..AC-010 pass (including deep-linkability + back-navigation behavior)
- Sunday automation configured and verifiable

---

## Testing Strategy

### Automated (Vitest)

- `week-window.test.ts`
  - weekday, Saturday, Sunday rollover correctness
  - DST-safe date boundaries
- `fixtures.test.ts`
  - day bucketing constraints
  - kickoff ordering
  - TBA positioning
  - hidden field suppression

### Manual Acceptance Validation

- Validate all AC items from `spec.md`
- Device checks: 320px, 768px, 1024px+
- Keyboard-only interaction checks
- Error-state checks via missing/invalid data file simulation

---

## Risks & Mitigations

1. **Timezone boundary errors** around Sunday refresh
   - Mitigation: central utility + test coverage for weekend transitions.
2. **PlayHQ payload drift**
   - Mitigation: normalization layer with defaults; log unknown shapes.
3. **Automation unavailable in hosting pipeline**
   - Mitigation: document fallback manual refresh runbook + explicit stale-data messaging.
4. **Scope confusion with existing ladder/results content**
   - Mitigation: treat COA-52 as authoritative replacement for `/scores` weekly view.

---

## Complexity Tracking

- No constitution violations currently.
- Added complexity accepted:
  - dedicated week-window utility for correctness
  - separate weekly JSON artifact for clear contract boundary
- Complexity rejected:
  - adding backend service/database (not needed for static site scope)
  - introducing new UI framework dependencies

---

## Next Step

Run `/skill:tasks` to break this plan into atomic execution windows (max 3 tasks/window) with test-first ordering.
