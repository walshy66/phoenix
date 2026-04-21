# Implementation Plan: COA-71 — Scores Not Staying Updated

**Branch**: `cameronwalsh/coa-71-scores-not-staying-updated`
**Date**: 2026-04-21
**Spec**: `specs/coa-71-scores-not-staying-updated/spec.md`

---

## Summary

The Scores page is broken in two distinct ways. First, a deploy path mismatch means
`scripts/scores-data.json` (from `scrape-playhq.js`) is never copied to
`public/live-data/`, so the served scores are perpetually stale. Second, the existing
architecture is a single rolling file (`scores.json`) that cannot express round
history, in-progress overlay data, or player stats.

This plan fixes the immediate deploy break first (one workflow step change + a rename),
then introduces a round-file architecture written by a reworked Monday cron, then adds
live score polling during game windows via a new lightweight cron, then adds player
stats to the game detail view. The frontend Scores page is redesigned around
round navigation and status-aware game cards.

The existing `scrape-weekly-games.js` is not changed functionally — only its deploy
output is renamed from `scores.json` to `fixtures.json`.

---

## Technical Context

- **Language / Runtime**: Node 22 (ESM), matching existing scripts
- **Frontend Framework**: Astro (SSG) + client-side `<script>` islands — matching
  existing `scores.astro` pattern
- **UI Component Style**: Tailwind CSS, matching existing page patterns
- **Scripting pattern**: Self-contained Node scripts under `scripts/`, each with
  structured JSON logging — matching `scrape-weekly-games.js` pattern
- **CI/CD**: GitHub Actions with FTPS deploy via `lftp` to VentraIP
- **Data Transport**: Static JSON files served from `/live-data/` path on the host
- **Storage**: No database — static file outputs only
- **Testing**: Vitest — matching existing test files in `src/lib/`
- **PlayHQ API**: REST, `https://api.playhq.com`, authenticated via `x-api-key` header
  and `x-phq-tenant: bv`

---

## Constitution Check

- **Principle I (User Outcomes)**: Each phase delivers a concrete user-visible outcome.
  Phase 1 unbreaks basic score display. Phase 2 enables round history. Phase 3 adds
  live overlay. Phase 4 adds player stats. PASS.
- **Principle II (Test-First)**: All new library code (round file builder, index writer,
  live overlay merger, round navigation state) gets Vitest unit tests before or alongside
  implementation. PASS.
- **Principle III (Backend Authority)**: Round number is derived from PlayHQ API response
  field — never inferred from dates or computed on the client. Live scores overlay is
  written server-side and served as static JSON. Client only reads and renders. PASS.
- **Principle IV (Error Semantics & Observability)**: All cron scripts must log structured
  JSON per the `scrape-weekly-games.js` pattern. FR-023 and FR-024 require visible, human-
  readable unavailable states — no silent failures. PASS.
- **Principle V (AppShell Integrity)**: Scores page remains within `BaseLayout`. No new
  navigation shell introduced. Round navigation is a tab-strip within the page body. PASS.
- **Principle VI (Accessibility First)**: Round navigation buttons must be keyboard
  navigable with visible focus rings. Game cards need ARIA labels. Tap targets minimum
  44x44px on mobile. PASS.
- **Principle VII (Immutable Data Flow)**: Completed round files are never overwritten with
  partial data (FR-008). `rounds-index.json` is written last, after all round files
  successfully deploy (FR-007). PASS.

---

## Project Structure

### New scripts

```
scripts/
  scrape-playhq.js                    (existing — add roundNumber to normaliseGame)
  scrape-weekly-games.js              (existing — no logic change, deploy path rename only)
  scrape-home-games.js                (existing — unchanged)
  write-round-files.js                (NEW — builds round-{N}.json files + rounds-index.json)
  poll-live-scores.js                 (NEW — fetches in-progress scores, writes live-scores.json)
  fetch-player-stats.js               (NEW — fetches stats for completed games by gameId)
  check-round-files.js                (NEW — validates round files before deploy, like check-weekly-games-data.js)
```

### New public live-data structure

```
public/live-data/
  rounds/
    round-1.json                      (per-round data, written by Monday cron)
    round-2.json
    ...
    rounds-index.json                 (manifest: currentRound, availableRounds, lastUpdated)
  live-scores.json                    (in-progress overlay, every 2 min on game days)
  fixtures.json                       (renamed from scores.json — home page widget)
  completed-scores.json               (root cause fix — was never being deployed)
  home-games.json                     (existing, unchanged)
```

### New/changed source library files

```
src/lib/scores/
  artifact.ts                         (existing — keep as-is for weekly widget)
  round-file.ts                       (NEW — types: RoundFile, RoundsIndex, LiveScores, NormalisedGame)
  round-navigation.ts                 (NEW — client state for round switching)

src/lib/playhq/
  contracts.ts                        (existing — keep weekly artifact contract)
  live-data.ts                        (existing — keep staleness util)
  renderers.ts                        (existing — keep weekly renderer; add round-aware renderer)
  round-renderer.ts                   (NEW — renders round file: game cards with status-aware UI)
```

### New/changed GitHub Actions workflows

```
.github/workflows/
  deploy.yml                          (existing — no change)
  playhq-refresh-deploy.yml           (CHANGE — fix deploy copy step + rename scores.json to fixtures.json)
  weekly-scores-refresh.yml           (existing — no change)
  monday-round-finalise.yml           (NEW — Monday 1am AEDT: finalise round + write next round file)
  live-scores-poll.yml                (NEW — every 2 min Mon/Tue/Wed/Fri 6am–1pm UTC)
```

### Changed Astro pages

```
src/pages/
  scores.astro                        (REPLACE — round navigation, game cards, live overlay)
  scores/[gameId].astro               (CHANGE — add stats panel for COMPLETED games)
```

---

## Research Required (Before Implementing)

### Research Task 1 — PlayHQ round field name

Run `scrape-playhq.js` manually against the live API (with `PLAYHQ_API_KEY` set) and
`console.log` the raw game object from `GET /v1/grades/{gradeId}/games` before
`normaliseGame()` transforms it. Confirm which field carries the round number. Likely
candidates:

- `game.round?.number`
- `game.roundNumber`
- `game.round?.id` (may be a string label, not integer)

The plan assumes `game.round?.number` (integer). If the field is a label string like
`"Round 5"`, the script must parse the integer from it. This must be confirmed before
implementing FR-003.

### Research Task 2 — PlayHQ status strings

Confirm the raw `game.status` values from the API. Current `scrape-playhq.js` writes
them as-is (e.g., `game.status ?? 'scheduled'`). The new normalisation must map raw
strings to `UPCOMING`, `IN_PROGRESS`, `COMPLETED`. Likely mappings (to verify):

- `'scheduled'` → `UPCOMING`
- `'in-progress'` or `'live'` → `IN_PROGRESS`
- `'completed'` or `'graded'` → `COMPLETED`

Confirm by logging raw status from a game that has a known completed state.

### Research Task 3 — PlayHQ player stats endpoint

The spec references `GET /v1/games/{gameId}/statistics` as a likely path. Confirm:
1. The exact endpoint path
2. Response shape (player name, points, fouls, assists, etc.)
3. Whether the endpoint requires authentication or is public

If the endpoint returns a 404 or 403, the stats phase (Phase 4) must be deferred until
access is confirmed. The plan must not block Phases 1–3 on this confirmation.

### Research Task 4 — In-progress game fetch strategy

Confirm whether `GET /v1/grades/{gradeId}/games` returns in-progress games in its
normal response, or whether there is a separate live/live-scoreboard endpoint. If the
standard games endpoint returns in-progress games with updated scores on each call, then
`poll-live-scores.js` can reuse the same endpoint pattern as `scrape-playhq.js` (filter
by `status === IN_PROGRESS`). If PlayHQ has a dedicated in-progress endpoint, use that.

---

## Phased Delivery

---

### Phase 1 — Root Cause Fix (deploy path + rename)

**Scope**: Unbreak the deploy. No architecture changes. No new files.

**Goal**: After this phase, the Scores page shows data that is at most one week stale.
The home page no longer shows "Live refresh is temporarily unavailable" during normal
operation.

**Changes**:

1. `playhq-refresh-deploy.yml` — fix the "Copy refreshed artifacts" step:
   - Add: `cp scripts/scores-data.json public/live-data/completed-scores.json`
   - Change: `cp scripts/weekly-games-data.json public/live-data/scores.json`
     to: `cp scripts/weekly-games-data.json public/live-data/fixtures.json`

2. `scores.astro` — update the two references to `/live-data/scores.json`:
   - `data-live-data-url="/live-data/scores.json"` → `data-live-data-url="/live-data/fixtures.json"`
   - The `publicPath` file read in the frontmatter from `public/live-data/scores.json`
     → `public/live-data/fixtures.json`

3. Find and update all other references to `/live-data/scores.json` in the frontend
   (home page carousel fetch, any other Astro pages or client scripts).

**Testing this phase**:
- Manually trigger `playhq-refresh-deploy.yml` via `workflow_dispatch`
- Verify `public/live-data/fixtures.json` and `public/live-data/completed-scores.json`
  appear in the FTPS-deployed directory
- Load the Scores page and confirm it reads from `fixtures.json`
- Confirm "Live refresh is temporarily unavailable" no longer appears when
  `fixtures.json` is reachable

**Acceptance**: AC-1 (basic), AC-14 (home page fallback only on genuine failure).

---

### Phase 2 — Round File Architecture

**Scope**: Round-based data pipeline. New scripts + reworked Monday cron.

**Goal**: After this phase, completed rounds persist as `round-{N}.json` files and are
navigable via `rounds-index.json`. The Scores page shows round navigation.

**New scripts**:

#### `scripts/write-round-files.js`

Orchestrates the Monday 1am AEDT run. Responsibilities:

1. Call `scrape-playhq.js` logic (or import its fetch helpers) to get all Phoenix games
   for all seasons, with `roundNumber` now included in each game object
2. Group games by `roundNumber`. Games with null/missing round number are logged and
   excluded (FR-009)
3. Determine `completedRoundN`: the highest round where all games have `COMPLETED` status
4. Determine `currentRound`: `completedRoundN` if it's game week; `completedRoundN + 1`
   for the upcoming round
5. For `completedRoundN`: write `round-{N}.json` with `status: 'completed'`, final
   scores, and player stats (delegated to `fetch-player-stats.js`)
6. For `currentRound` (upcoming round): write `round-{N+1}.json` with `status:
   'upcoming'` and fixture data only
7. Write `rounds-index.json` as a candidate object — not deployed yet
8. FTPS deploy: upload all round files first via individual `lftp put` commands; record
   which uploads succeeded; write `rounds-index.json` with `availableRounds` containing
   only rounds that successfully deployed (FR-007)
9. Log: rounds processed, games excluded, files written, FTPS outcomes

The script must not overwrite a `round-{N}.json` that already has `status: 'completed'`
with partial or in-progress data (FR-008). Before writing, check if the existing file
(if any) has `status: 'completed'` — if so, skip the write and log a warning.

#### `scripts/check-round-files.js`

Validates the output before deploy (mirrors `check-weekly-games-data.js` pattern):
- Each `round-{N}.json` must have valid `roundNumber`, `status`, `games` array
- `rounds-index.json` must have `currentRound`, `availableRounds`, `lastUpdated`
- `availableRounds` entries must each have a corresponding `round-{N}.json` file

#### `src/lib/scores/round-file.ts`

TypeScript types and validation for the new data model:
```typescript
type GameStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
type RoundStatus = 'upcoming' | 'in-progress' | 'completed';

interface NormalisedGame {
  id: string;
  roundNumber: number;
  date: string | null;
  time: string | null;
  competition: string;
  venue: string | null;
  court: string | null;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: GameStatus;
  playerStats: PlayerStats | null;
}

interface RoundFile {
  roundNumber: number;
  season: string;
  lastUpdated: string;
  status: RoundStatus;
  games: NormalisedGame[];
  ladders: Record<string, LadderRow[]>;
}

interface RoundsIndex {
  currentRound: number;
  availableRounds: number[];
  lastUpdated: string;
}
```

#### `scripts/scrape-playhq.js` — add `roundNumber` to `normaliseGame()`

After Research Task 1 confirms the field name:

```javascript
function normaliseGame(game, gradeName) {
  const rawRound = game.round?.number ?? game.roundNumber ?? null;
  const roundNumber = typeof rawRound === 'number' ? rawRound : null;
  // ... existing fields ...
  return {
    id: game.id,
    roundNumber,  // NEW
    // ... rest of existing fields ...
    status: normaliseStatus(game.status),  // NEW normalisation
  };
}

function normaliseStatus(raw) {
  // Mapping confirmed by Research Task 2
  if (!raw) return 'UPCOMING';
  const s = raw.toLowerCase();
  if (s === 'completed' || s === 'graded') return 'COMPLETED';
  if (s === 'in-progress' || s === 'live') return 'IN_PROGRESS';
  return 'UPCOMING';
}
```

**New GitHub Actions workflow: `monday-round-finalise.yml`**

```yaml
on:
  schedule:
    - cron: '0 14 * * 0'   # Sunday 2pm UTC = Monday 1am AEDT
  workflow_dispatch:

jobs:
  finalise-round:
    steps:
      - Checkout
      - Setup Node 22
      - npm ci
      - Run write-round-files.js (with PLAYHQ_API_KEY, FTP secrets)
      - Run check-round-files.js (validate before FTPS deploy)
      - FTPS deploy: round files first (individual puts), then rounds-index.json last
```

The FTPS deploy in this workflow must NOT use `mirror --delete` on the rounds directory
— it must only add/update files, never delete existing completed round files.

**Frontend changes**:

`scores.astro` — redesigned:
- On load, fetch `rounds-index.json` to get `currentRound` and `availableRounds`
- Render round navigation buttons (one per entry in `availableRounds`)
- Default to `currentRound` — fetch `round-{N}.json` and render games
- On round button click: fetch `round-{N}.json` (with `?t={timestamp}` cache-buster),
  replace game list in DOM without full page reload
- Error state: if `rounds-index.json` fetch fails, show a human-readable "Scores
  unavailable" message (not a crash or blank screen)
- If a round file is absent or returns non-200, show "Results for this round are not
  yet available" within the round content area

The round navigation strip is a `<nav role="navigation" aria-label="Round navigation">`
containing `<button>` elements (not links), each with `aria-pressed` set to indicate
the active round. Keyboard focus must be visible (Tailwind `focus:ring` utility).

Game cards render status-aware UI (no scores for UPCOMING, final scores for COMPLETED).
Live overlay scores are not wired yet — that is Phase 3.

**Testing this phase**:

New Vitest tests:
- `src/lib/scores/round-file.test.ts`: validates `RoundFile` and `RoundsIndex` shapes,
  tests `normaliseStatus()` mapping for all known raw status strings
- `src/lib/scores/round-navigation.test.ts`: tests that clicking a round button updates
  state, that `rounds-index.json` fetch failure produces the unavailable state

Manual verification:
- Run `write-round-files.js` locally against the API (or with a fixture JSON file)
- Confirm `public/live-data/rounds/round-N.json` and `rounds-index.json` are created
- Load Scores page, verify round navigation buttons appear, verify clicking switches
  round content

**Acceptance**: AC-1, AC-2 (round navigation), AC-7 (UPCOMING fixture view),
AC-8 (API unreachable — no overwrite), AC-9 (null round number excluded),
AC-10 (FTPS failure → index not updated), AC-11 (index unavailable → graceful state),
AC-12, AC-13 (responsive layout), AC-15 (no client-side polling yet — verified by
absence of interval when no IN_PROGRESS games).

---

### Phase 3 — Live Score Polling

**Scope**: New poll cron + client-side live overlay.

**Goal**: During game windows, in-progress scores appear on the Scores page and update
without a page reload.

**New script: `scripts/poll-live-scores.js`**

1. Fetch all Phoenix games across all seasons (same API pattern as `scrape-playhq.js`)
2. Filter to games with `status === 'IN_PROGRESS'`
3. Build `live-scores.json` object keyed by `gameId`:
   ```json
   {
     "abc123": { "homeScore": 42, "awayScore": 38, "status": "IN_PROGRESS" }
   }
   ```
4. If no games are IN_PROGRESS, write `{}` (empty object) — not null, not an error
5. FTPS deploy `live-scores.json` only — no other files touched
6. Log: number of in-progress games found, gameIds, deploy outcome

The script must be fast — it should complete within the 2-minute polling interval.
If the API call exceeds 60 seconds, abort and exit with code 0 (non-fatal — previous
file remains on the server).

**New GitHub Actions workflow: `live-scores-poll.yml`**

```yaml
name: Live Score Polling

on:
  schedule:
    - cron: '*/2 6-13 * * 1,2,3,5'  # Every 2 min, Mon/Tue/Wed/Fri, 6am–1pm UTC
                                      # = 4:30pm–11pm AEDT (with buffer to ~11:30pm)
  workflow_dispatch:

concurrency:
  group: live-scores-poll
  cancel-in-progress: true

jobs:
  poll-live-scores:
    runs-on: ubuntu-latest
    timeout-minutes: 3
    steps:
      - Checkout
      - Setup Node 22
      - npm ci
      - node scripts/poll-live-scores.js
      - FTPS deploy live-scores.json only
```

The `cancel-in-progress: true` concurrency setting ensures a slow run does not queue
up behind itself.

**Frontend changes in `scores.astro`**:

After Phase 2, the Scores page knows which games are UPCOMING/COMPLETED. Phase 3 adds:

1. After loading a round file, check whether any game in the current round has
   `status === 'IN_PROGRESS'` (from the round file itself — this is set by the Monday
   cron if a game started after the cron ran, or by a future re-run)
2. If any game is IN_PROGRESS, start a `setInterval` that fires every 120,000ms
   (2 minutes) and fetches `/live-data/live-scores.json?t={Date.now()}`
3. On each live-scores fetch: merge the overlay scores into the displayed game cards
   by matching `gameId`. Update only the score elements in the DOM — do not re-render
   the full round content
4. If a game transitions from IN_PROGRESS to COMPLETED in the live-scores response
   (status field changes), update the card's visual state accordingly
5. If live-scores fetch returns `{}`, clear any live overlay and show the base round
   data as-is
6. Stop the interval when navigating away from the page or when all games are no
   longer IN_PROGRESS
7. Client-side polling must NOT start outside game window hours. Gate on the
   current local time — if outside Mon/Tue/Wed/Fri 4:30pm–11:30pm AEDT, do not
   start the interval even if a round file shows IN_PROGRESS games

NFR-006 (cache busting): all fetches of round files and `live-scores.json` must
include `?t={Date.now()}` or equivalent.

**Testing this phase**:

- `src/lib/playhq/live-data.test.ts` (existing) — extend to test the live overlay merge
  function (given a round file + a live-scores object, produces correctly merged game
  cards)
- Manual: trigger `poll-live-scores.js` via `workflow_dispatch` on a game night;
  verify `live-scores.json` on server contains in-progress games; verify page updates

**Acceptance**: AC-3 (IN_PROGRESS card shows live score), AC-4 (score updates without
reload), AC-5 (IN_PROGRESS detail — live score, no stats), AC-15 (no polling outside
game windows).

---

### Phase 4 — Player Stats

**Scope**: Fetch and include player stats in completed round files.

**Goal**: Game detail view shows player statistics for COMPLETED games where stats are
available.

**New script: `scripts/fetch-player-stats.js`**

Used by `write-round-files.js` during the Monday cron run.

1. Accept a list of `{ gameId, status }` objects
2. For each COMPLETED game, call `GET /v1/games/{gameId}/statistics` (endpoint path
   confirmed by Research Task 3)
3. Normalise the player stats response to a consistent shape:
   ```json
   {
     "players": [
       {
         "name": "string",
         "team": "string",
         "points": 0,
         "fouls": 0,
         "assists": 0,
         "rebounds": 0
       }
     ]
   }
   ```
4. If the stats fetch fails for a game (404, 403, network error): log the failure with
   `gameId` and error code; return `null` for that game — do not abort the round
   finalisation (FR-015)
5. Return map of `gameId → PlayerStats | null`

`write-round-files.js` calls `fetch-player-stats.js` and merges results into
the round file's game objects before writing.

**Frontend changes in `scores/[gameId].astro`**:

The game detail page currently exists but its scope is not shown in the spec. Changes:

1. Fetch the round file for the game's round (via `rounds-index.json` → `round-{N}.json`)
   or accept `gameId` as a query param and find the game across rounds
2. Render status-appropriate content:
   - UPCOMING: teams, time, venue, court — no score or stats
   - IN_PROGRESS: current score (from `live-scores.json` overlay) — no stats section
   - COMPLETED: final score + player stats table (if `playerStats !== null`); if
     `playerStats` is null, omit the stats section entirely (no error message)
3. Player stats table: `<table>` with `<th>` headers (Player, Team, PTS, AST, REB, PF),
   accessible with `scope="col"` attributes, meets WCAG AA contrast

**Testing this phase**:

- `src/lib/scores/round-file.test.ts` — extend to cover `PlayerStats` type validation
- Unit test for `fetch-player-stats.js`: mock the API call, verify null returned on
  failure, verify correct normalisation on success
- Manual: complete a game in PlayHQ test data; run Monday cron; verify `playerStats`
  appears in the round file; open the game detail view and verify stats render

**Acceptance**: AC-6 (COMPLETED game detail shows stats), AC-5 (IN_PROGRESS — no stats),
AC-7 (UPCOMING — no stats), AC-16 (stats fetch failed → score shown, stats absent).

---

## Workflow Architecture (Final State)

After all phases, three crons cover the full lifecycle:

| Workflow | Schedule | Fires | Responsibility |
|---|---|---|---|
| `monday-round-finalise.yml` | `0 14 * * 0` | Mon 1am AEDT | Finalise completed round + write next round + update rounds-index |
| `live-scores-poll.yml` | `*/2 6-13 * * 1,2,3,5` | Every 2 min game windows | Fetch in-progress scores → live-scores.json |
| `playhq-refresh-deploy.yml` | `*/5 6-13 * * 1,2,3,5` + `0 15 * * 0` | Every 5 min game windows | Weekly fixtures → fixtures.json (unchanged logic) |
| `weekly-scores-refresh.yml` | `5 14 * * 6` | Sat 2pm UTC | Commit weekly-games-data.json to repo (unchanged) |
| `deploy.yml` | push to main | On PR merge | Full static build deploy (unchanged) |

The `playhq-refresh-deploy.yml` existing workflow gets one change in Phase 1: the copy
step is fixed and the output file is renamed. Its cron schedule is unchanged.

---

## FTPS Deploy Ordering Invariant

This is a hard invariant, not a preference. Both the Monday cron and any future round
file writers must follow this order:

1. Upload all `round-{N}.json` files to `live-data/rounds/` individually (not via
   `mirror --delete`)
2. Record which uploads succeeded
3. Build `rounds-index.json` with `availableRounds` containing only successfully
   uploaded round numbers
4. Upload `rounds-index.json` last

If step 4 fails, `rounds-index.json` on the server is stale (points to previously
available rounds) — which is acceptable and safe. The frontend will serve the prior
valid state.

If a round file upload fails (step 1), that round is excluded from `availableRounds`
in `rounds-index.json`. The frontend will never reference a round file that did not
deploy.

---

## Error Handling Standards (NFR-003, NFR-004)

All new scripts must log structured JSON matching `scrape-weekly-games.js` pattern:
```javascript
function structuredLog(level, details) {
  const payload = { timestamp: new Date().toISOString(), ...details };
  const line = JSON.stringify(payload);
  level === 'error' ? console.error(line) : console.log(line);
}
```

Required log events per script:

**`write-round-files.js`**:
- `started` — round numbers being processed, season IDs
- `game_excluded` — gameId, reason (`missing_round_number`)
- `round_skipped` — roundNumber, reason (`already_completed`)
- `round_written` — roundNumber, gameCount, status
- `stats_fetch_failed` — gameId, errorCode
- `ftps_upload_result` — file, success (bool)
- `index_written` — currentRound, availableRounds
- `completed` — summary

**`poll-live-scores.js`**:
- `started`
- `in_progress_found` — count, gameIds array
- `ftps_upload_result` — success (bool)
- `completed`

**`fetch-player-stats.js`**:
- `stats_fetched` — gameId, playerCount
- `stats_fetch_failed` — gameId, errorCode, message

---

## Cache Busting (NFR-006)

All client-side fetches of live-data files must include a timestamp query parameter:

```javascript
const url = `/live-data/rounds/round-${n}.json?t=${Date.now()}`;
const liveUrl = `/live-data/live-scores.json?t=${Date.now()}`;
const indexUrl = `/live-data/rounds/rounds-index.json?t=${Date.now()}`;
```

This ensures browsers do not serve cached stale data between cron updates.

---

## Testing Strategy

### Unit tests (Vitest)

| File | What it tests |
|---|---|
| `src/lib/scores/round-file.test.ts` | Type shapes, `normaliseStatus()` mapping, `PlayerStats` validation |
| `src/lib/scores/round-navigation.test.ts` | Round switching state, index fetch failure → unavailable state |
| `src/lib/playhq/live-data.test.ts` (extend) | Live overlay merge by gameId, empty `{}` clears overlay |
| `src/lib/playhq/round-renderer.test.ts` | Status-aware game card HTML output for UPCOMING/IN_PROGRESS/COMPLETED |

### Integration / manual tests

| Test | How |
|---|---|
| Phase 1 root cause | `workflow_dispatch` on `playhq-refresh-deploy.yml`, inspect deployed files |
| Round files write correctly | Run `write-round-files.js` locally with API key, inspect output |
| Null round number excluded | Inject a game object with `roundNumber: null` in unit test |
| FTPS ordering invariant | Mock FTPS in a script test, verify `rounds-index.json` written last |
| Live overlay merge | Mock `live-scores.json`, verify DOM update without full round re-render |
| Player stats absent on failure | Return 404 from stats endpoint mock, verify `playerStats: null` in output |

### Acceptance test run order

Run acceptance tests in phase order:
1. Phase 1: AC-14 (home page), root cause
2. Phase 2: AC-1, AC-2, AC-7, AC-8, AC-9, AC-10, AC-11, AC-12, AC-13
3. Phase 3: AC-3, AC-4, AC-5, AC-15
4. Phase 4: AC-6, AC-16

---

## Open Questions (for implementation agent)

1. What is the exact PlayHQ round field name? (Research Task 1 — must resolve before
   implementing FR-003)
2. What are the exact PlayHQ raw status strings? (Research Task 2 — must resolve before
   implementing `normaliseStatus()`)
3. What is the player stats endpoint path and response shape? (Research Task 3 — must
   resolve before implementing Phase 4; Phase 4 can be deferred if endpoint is
   inaccessible)
4. Does `GET /v1/grades/{gradeId}/games` return live in-progress scores on each call,
   or is there a dedicated live endpoint? (Research Task 4)
5. Is `scrape-playhq.js` the correct script to extend for the round file writer, or
   should `write-round-files.js` import its fetch helpers as a module? Preference is
   to extract shared API helpers to `scripts/lib/playhq-api.js` rather than importing
   the script directly.

---

## Checklist Before Tasks Phase

- [x] plan.md written and complete
- [x] Technical context clearly defined
- [x] Constitution compliance verified
- [x] Project structure documented (new scripts, new workflows, changed pages)
- [x] Phased delivery sequenced correctly (root cause first)
- [x] FTPS ordering invariant documented
- [x] Error handling and logging standards specified
- [x] Cache busting strategy specified
- [x] Testing strategy (unit + manual) for each phase
- [x] Research tasks identified before implementation begins
- [ ] data-model.md: N/A — no database
- [ ] contracts/: not needed — data shapes are in `round-file.ts` types
- [ ] quickstart.md: consider adding for manual verification steps (optional)
