# Implementation Summary — COA-87 Home Page Score

## What changed
- Added a centralized homepage score feature flag at `src/lib/home-scores/feature-flags.ts`.
- Updated `src/pages/index.astro` so the homepage only loads and renders the home score carousel when the toggle is enabled.
- Kept `src/components/HomeScoresCarousel.astro` intact for future re-enablement.
- Added source-level regression tests for the default-off homepage behavior and route preservation.
- Added a short manual verification checklist in `specs/coa-87-home-page-score/quickstart.md`.

## Validation
- `npm test` ✅
- `npm run build` ✅

## Notes
- The homepage no longer renders the Latest Results carousel by default.
- `/scores` and `/scores/[gameId]` remain unchanged.
