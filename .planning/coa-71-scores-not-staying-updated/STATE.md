# STATE — coa-71-scores-not-staying-updated

## Feature Metadata
- Branch: `cameronwalsh/coa-71-scores-not-staying-updated`
- Spec: `specs/coa-71-scores-not-staying-updated/spec.md`
- Status: implementation complete except deferred player-stats phase

## Execution Windows

### Window 1 — Root Cause Fix
- Status: complete
- Evidence:
  - `.github/workflows/playhq-refresh-deploy.yml` now deploys `fixtures.json`, `completed-scores.json`, and `home-games.json`
  - `src/pages/scores.astro` reads `/live-data/fixtures.json`
  - `src/pages/scores/[gameId].astro` reads `/live-data/fixtures.json`
  - `src/lib/playhq/live-data.test.ts` now uses `fixtures.json`
- Verification:
  - `grep -r "live-data/scores.json" src .github` returns no matches
  - `npm test` passes

### Window 2 — PlayHQ API Research
- Status: complete
- Evidence:
  - Added `specs/coa-71-scores-not-staying-updated/research-findings.md`
  - Confirmed `game.round.name` / `game.round.abbreviatedName` shape from live API samples
  - Confirmed raw statuses `UPCOMING` and `FINAL`
  - Confirmed `GET /v1/games/{gameId}/statistics` returns 404 at the tested path
  - Confirmed standard `GET /v1/grades/{gradeId}/games` payload is the only observed source of game state in this pass

### Window 3 — Normalise Game + Types
- Status: complete
- Evidence:
  - Added `src/lib/scores/round-file.ts`
  - Added `src/lib/scores/round-file.test.ts`
  - `scripts/scrape-playhq.js` now normalises `roundNumber` and `status`

### Window 4 — Round File Writer + Shared API Helpers
- Status: complete
- Evidence:
  - Added `scripts/lib/playhq-api.js`
  - Added `scripts/fetch-player-stats.js`
  - Added `scripts/write-round-files.js`

### Window 5 — Validation Script + Workflow
- Status: complete
- Evidence:
  - Added `scripts/check-round-files.js`
  - Added `.github/workflows/monday-round-finalise.yml`
  - Added `rounds:check` package script

### Window 6 — Scores Page Round Navigation
- Status: complete
- Evidence:
  - Rewrote `src/pages/scores.astro` to load `rounds-index.json` and round files client-side
  - Added accessible round navigation buttons with cache-busted round fetches

### Window 7 — Game Detail Base + Tests
- Status: complete
- Evidence:
  - Rewrote `src/pages/scores/[gameId].astro` to load round files client-side
  - Added `src/lib/scores/round-navigation.ts` and tests
  - Added `src/lib/playhq/round-renderer.ts` and tests
  - Added `src/lib/scores/game-window.ts` and tests

### Window 8 — Live Polling Infrastructure
- Status: complete
- Evidence:
  - Added `scripts/poll-live-scores.js`
  - Added `.github/workflows/live-scores-poll.yml`
  - `src/lib/playhq/live-data.ts` now merges live scores

### Window 9 — Live Overlay Frontend
- Status: complete
- Evidence:
  - `src/lib/playhq/live-data.test.ts` includes merge coverage
  - `npm test` passes with the new round/live overlay suite

### Window 10 — Player Stats
- Status: deferred
- Evidence:
  - Research found `GET /v1/games/{gameId}/statistics` returns 404 at the tested path
  - Player stats frontend work remains gated until the endpoint is confirmed

## Notes
- `npm test` passes.
- The repository still has unrelated `npx tsc --noEmit` failures outside this feature scope.
