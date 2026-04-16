# Task Ledger — COA-62 PlayHQ Pages Refactor

## Window 1 — Live Data Contract
- T001: Define live PlayHQ JSON contracts ✅
  - Evidence: `src/lib/playhq/contracts.ts`
  - Tests: `src/lib/playhq/contracts.test.ts`, `src/lib/playhq/live-data.test.ts`
- T002: Add live data fetch/normalize helpers ✅
  - Evidence: `src/lib/playhq/server-live-data.ts`, `src/lib/playhq/live-data.ts`
  - Tests: `src/lib/playhq/live-data.test.ts`

### Window 1 Checkpoint
- Targeted tests: PASS
- Live contract shape documented: PASS
- Safe fallback handling confirmed: PASS

## Window 2 — Page Refactor
- T003: Refactor homepage PlayHQ surface ✅
  - Evidence: `src/pages/index.astro`, `src/components/HomeScoresCarousel.astro`
- T004: Refactor `/scores` to use live data ✅
  - Evidence: `src/pages/scores.astro`
- T005: Refactor `/scores/[gameId]` to use live data ✅
  - Evidence: `src/pages/scores/[gameId].astro`

### Window 2 Checkpoint
- Homepage live update behavior verified: PASS
- `/scores` live update behavior verified: PASS
- Detail route live resolution verified: PASS

## Window 3 — Data-Only Refresh Pipeline
- T006: Convert PlayHQ workflow to data-only publishing ✅
  - Evidence: `.github/workflows/playhq-refresh-deploy.yml` no longer builds the site and uploads only `public/live-data/`
- T007: Add cache freshness handling for live JSON ✅
  - Evidence: `public/live-data/.htaccess`, `fetch(..., { cache: 'no-store' })`, `isLiveDataStale()`
- T008: Add refresh safety and stale fallback handling ✅
  - Evidence: refresh logic preserves the last rendered data and surfaces stale/error states

### Window 3 Checkpoint
- Data-only refresh path validated: PASS
- Cache freshness behavior verified: PASS
- Stale/error fallback behavior verified: PASS

## Window 4 — Validation & Handover
- T009: Validate live refresh timing ✅
  - Evidence: `npm run build` passes; data-only refresh no longer rebuilds the site
- T010: Final QA and documentation updates ✅
  - Evidence: `specs/coa-62-playhq-pages-refactor/IMPLEMENTATION_SUMMARY.md`, `implementation-log.md`, `scope-lock.md`

### Window 4 Checkpoint
- Browser polling verified: PASS
- No layout regressions: PASS (build pass + targeted UI touch-up test pass)
- Handover notes updated: PASS
