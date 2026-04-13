# Task Ledger — COA-52 Scores Page

## Window 1
- T001: Add failing tests for week-window + fixture transforms ✅
  - Evidence: new test files added under `src/lib/scores/`
  - Initial run failed due to missing modules (expected red state)
- T002: Implement week-window + fixture utilities ✅
  - Evidence: `week-window.ts`, `fixtures.ts` created
  - Verified weekend rollover + Mon/Tue/Wed/Fri bucketing + TBA ordering
- T003: Add artifact contract validator + tests ✅
  - Evidence: `contracts.ts` + `contracts.test.ts` created
  - Verified structured `INVALID_JSON` + `INVALID_SHAPE` responses

### Window 1 Checkpoint
- Targeted tests: PASS (`3 passed, 9 passed tests`)
- Full suite (`npm test`): 2 unrelated pre-existing failures remain outside COA-52 scope

## Window 2
- T004: Weekly scraper artifact pipeline ✅
  - Added `scripts/scrape-weekly-games.js`
  - Emits `scripts/weekly-games-data.json` with fixed day buckets + window metadata
- T005: Failure handling + stale fallback + structured logging ✅
  - Structured logs include `timestamp`, `operation`, `status/errorCode`, `message`, `windowStart`, `windowEnd`
  - Failure mode writes `status: stale` when prior success exists, otherwise `status: error`
- T006: Artifact smoke check command ✅
  - Added `scripts/check-weekly-games-data.js`
  - Added package scripts: `scores:refresh`, `scores:check`, `scores:refresh:weekly`

### Window 2 Checkpoint
- Refresh command exercised
- Failure/stale path verified (missing API key generated structured failure + stale artifact)
- Shape check command pass

## Window 3
- T007: Failing UI/rendering tests ✅
  - Added `src/lib/scores/rendering.test.ts`
- T008: Rebuild `/scores` with required states ✅
  - Replaced legacy scores+ladder page with "This Week's Games" weekly layout
  - Added stale banner, error state, full-page empty state, day-level empty state
- T009: Accessibility/responsive hardening ✅
  - Added semantic day sections, focus-visible styles, keyboard-activatable anchors
  - Responsive grid: 1 col mobile → 2 col tablet → 4 col desktop

### Window 3 Checkpoint
- Score rendering helper tests pass
- Build passes with new `/scores` page

## Window 4
- T010: Game details route + lookup ✅
  - Added `src/pages/scores/[gameId].astro`
  - Added `src/lib/scores/artifact.ts` and `src/lib/scores/fixture-lookup.ts`
- T011: Tile click-through + return path behavior ✅
  - Added `src/components/WeeklyGameTile.astro` linking to details route
  - Back link on detail route returns to `/scores`
- T012: Hidden field suppression regression ✅
  - Hidden squad/player suppression enforced via `buildGameDetailViewModel`
  - Regression coverage in `src/lib/scores/fixtures.test.ts`

### Window 4 Checkpoint
- Detail pages generated from weekly artifact fixture IDs
- Back-path behavior in place

## Window 5
- T013: Sunday refresh automation path ✅
  - Added `.github/workflows/weekly-scores-refresh.yml`
- T014: Maintainer docs updates ✅
  - Updated `HOWTO.md` and `specs/coa-52-scores-page/quickstart.md`
- T015: Final acceptance + implementation summary ✅
  - Added `specs/coa-52-scores-page/IMPLEMENTATION_SUMMARY.md`

### Window 5 Checkpoint
- Automation workflow present
- Operational docs updated
- Acceptance evidence captured
