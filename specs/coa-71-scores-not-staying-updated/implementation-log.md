# Implementation Log — COA-71 Scores Not Staying Updated

## Window 1 — Root Cause Fix
- Updated the deploy workflow to publish completed scores and renamed the weekly fixture artifact to `fixtures.json`.

## Window 2 — PlayHQ API Research
- Confirmed the live game payload shape uses `game.round.name` / `game.round.abbreviatedName`.
- Confirmed raw statuses `UPCOMING` and `FINAL`.
- Confirmed the tested player stats endpoint returns 404 and deferred Phase 4.

## Window 3 — Normalised Game Model
- Added `src/lib/scores/round-file.ts` and tests.
- Added `roundNumber` parsing and status normalisation to `scripts/scrape-playhq.js`.

## Window 4 — Round File Writer
- Added shared PlayHQ API helpers.
- Added a player-stats fetch stub.
- Added round file generation logic and round grouping.

## Window 5 — Validation + Workflow
- Added the round file validation script and the Monday round finalisation workflow.

## Window 6 — Scores Page
- Rewrote `src/pages/scores.astro` to use `rounds-index.json` and client-side round loading.
- Added accessible round navigation controls.

## Window 7 — Game Detail Base + Tests
- Rewrote `src/pages/scores/[gameId].astro` to fetch from round files.
- Added round-navigation, round-renderer, and game-window utilities with tests.

## Window 8 — Live Polling
- Added live score polling script and workflow.
- Added live score overlay merge support to `src/lib/playhq/live-data.ts`.

## Window 9 — Live Overlay Frontend
- Added merge overlay unit coverage and verified the full Vitest suite passes.

## Window 10 — Player Stats
- Deferred due to the research-confirmed 404 at the tested stats endpoint path.

## Verification Notes
- `npm test` passes.
- `npx tsc --noEmit` still fails on unrelated existing issues in other feature areas.
