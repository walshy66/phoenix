# Tasks: COA-71 — Scores Not Staying Updated

**Branch**: `cameronwalsh/coa-71-scores-not-staying-updated`
**Input**: `specs/coa-71-scores-not-staying-updated/spec.md` + `plan.md`
**Strategy**: Option C — Execution Windows (max 3 tasks per window)
**Total Windows**: 10
**Total Tasks**: 25

---

## Format Guide

- **[P]**: Can run in parallel within the same window (different files, no conflicts)
- **[R]**: Research task — must produce a written finding before implementation proceeds
- **Window N**: Fresh 200k context boundary; implement agent reads STATE.md, not chat history
- **WINDOW_CHECKPOINT**: Validation gate; do NOT proceed to the next window if it fails
- **Traceability**: Each task maps to at least one spec requirement (FR-XXX, AC-XX)

---

## Execution Dependency Graph

```
Window 1 (Phase 1 fix)        ← no dependencies, start immediately
  ↓
Window 2 (Research)           ← depends on Window 1 merged/complete
  ↓
Window 3 (normaliseGame + types) ← depends on Window 2 findings
  ↓
Window 4 (write-round-files.js)  ← depends on Window 3
  ↓
Window 5 (check + workflow)      ← depends on Window 4
  ↓
Window 6 (scores.astro Phase 2)  ← depends on Window 5 (round files exist)
  ↓
Window 7 (Phase 2 tests)         ← depends on Window 6
  ↓
Window 8 (poll-live-scores + workflow) ← depends on Window 3 (normaliseGame)
  ↓
Window 9 (live overlay frontend) ← depends on Window 6 + Window 8
  ↓
Window 10 (Phase 4 player stats) ← depends on Window 4 + Window 2 Research Task 3
```

Windows 8 and 6 can begin in parallel once Window 5 is complete if two agents are available.
Phase 4 (Window 10) can be deferred if Research Task 3 finds the stats endpoint inaccessible.

---

## Execution Window 1: Phase 1 — Root Cause Fix

**Purpose**: Fix the broken deploy path and rename `scores.json` → `fixtures.json`. No
architecture changes. Immediate unblock — the Scores page and Home page are currently
broken due to this deploy path mismatch.

**Token Budget**: 40–60k (small, targeted changes to 4 existing files)

**Context for implement agent**:
- The broken step is in `.github/workflows/playhq-refresh-deploy.yml`, in the "Copy
  refreshed artifacts into public live-data" step. It currently copies
  `scripts/weekly-games-data.json` to `public/live-data/scores.json` but never copies
  `scripts/scores-data.json` anywhere, so completed scores are never deployed.
- `scores.json` is the home-page widget file (weekly fixtures, not scores). It must be
  renamed to `fixtures.json` everywhere so consumers know what it actually contains.
- All four files that reference `/live-data/scores.json` must be updated in the same PR
  so the rename is atomic.

**Checkpoint Validation**:
- [ ] `playhq-refresh-deploy.yml` "Copy refreshed artifacts" step includes both copy lines
- [ ] No remaining references to `/live-data/scores.json` or `public/live-data/scores.json`
      in any source file (run: `grep -r "live-data/scores.json" src/ .github/`)
- [ ] `scores.astro` `data-live-data-url` points to `/live-data/fixtures.json`
- [ ] `scores/[gameId].astro` both `publicPath` reads and the `data-live-data-url` attribute
      point to `/live-data/fixtures.json`
- [ ] `live-data.test.ts` test fixture path updated to `fixtures.json`

---

### T001 — Fix "Copy refreshed artifacts" step in `playhq-refresh-deploy.yml`

**Window**: 1
**Phase**: Phase 1 (Root Cause Fix)
**Traceability**: FR-001 (deploy `completed-scores.json`), FR-002 (rename to `fixtures.json`)
**Dependencies**: None
**Parallel**: Yes [P] — touches only the workflow file

**File to change**: `.github/workflows/playhq-refresh-deploy.yml`

Find the step named "Copy refreshed artifacts into public live-data". Replace:
```yaml
      - name: Copy refreshed artifacts into public live-data
        run: |
          mkdir -p public/live-data
          cp scripts/weekly-games-data.json public/live-data/scores.json
          cp scripts/home-games-data.json public/live-data/home-games.json
```
With:
```yaml
      - name: Copy refreshed artifacts into public live-data
        run: |
          mkdir -p public/live-data
          cp scripts/weekly-games-data.json public/live-data/fixtures.json
          cp scripts/scores-data.json public/live-data/completed-scores.json
          cp scripts/home-games-data.json public/live-data/home-games.json
```

**Test**: Dry-run the workflow via `workflow_dispatch`. Confirm both `fixtures.json` and
`completed-scores.json` appear in the deployed `live-data/` directory on the server.

---

### T002 [P] — Update all frontend references from `scores.json` to `fixtures.json`

**Window**: 1
**Phase**: Phase 1 (Root Cause Fix)
**Traceability**: FR-002, FR-024 (home page fetches `fixtures.json`)
**Dependencies**: None (can run in parallel with T001 — different files)
**Parallel**: Yes [P]

**Files to change** (all references confirmed by `grep -r "live-data/scores.json" src/`):

1. `src/pages/scores.astro` — line 16:
   `'public', 'live-data', 'scores.json'` → `'public', 'live-data', 'fixtures.json'`
   Line 95:
   `data-live-data-url="/live-data/scores.json"` → `data-live-data-url="/live-data/fixtures.json"`

2. `src/pages/scores/[gameId].astro` — line 11 and line 26:
   Both `publicPath` joins referencing `scores.json` → `fixtures.json`
   Line 42:
   `data-live-data-url="/live-data/scores.json"` → `data-live-data-url="/live-data/fixtures.json"`

3. `src/lib/playhq/live-data.test.ts` — line 18:
   `join(dir, 'scores.json')` → `join(dir, 'fixtures.json')`

After editing, run:
```bash
grep -r "live-data/scores.json" src/ .github/
```
Output must be empty.

**Test**: `npx vitest run` — existing tests must still pass. Scores page must load with no
console errors referencing `scores.json`.

---

[WINDOW_CHECKPOINT_1]

**Before proceeding to Window 2**:
- [ ] T001: Workflow "Copy" step has both new copy lines
- [ ] T002: Zero remaining references to `live-data/scores.json` in `src/` or `.github/`
- [ ] `npx vitest run` passes
- [ ] PR can be raised for Phase 1 as a standalone unblock (no dependency on later windows)

---

## Execution Window 2: Research — Confirm PlayHQ API Field Names

**Purpose**: Confirm the exact raw PlayHQ API field names before writing any implementation
that depends on them. Writing code against assumed field names is the #1 risk in this
feature — research must come first.

**Token Budget**: 30–50k (read scripts, run one API call, write findings to a file)

**Context for implement agent**:
- `scripts/scrape-playhq.js` already has the API key pattern, season IDs, and grade
  fetch logic. It calls `GET /v1/grades/{gradeId}/games` and passes raw game objects
  to `normaliseGame()`. Add temporary `console.log(JSON.stringify(game, null, 2))` before
  `normaliseGame()` to see the raw shape.
- Run the script with `PLAYHQ_API_KEY` set (available as a GitHub Actions secret; for
  local use, ask the repo owner or use `workflow_dispatch` on a modified test branch).
- The four unknowns are: (1) round field name, (2) raw status strings, (3) player stats
  endpoint path + shape, (4) whether the standard games endpoint returns live scores.
- Write findings to `specs/coa-71-scores-not-staying-updated/research-findings.md`.
  This file is the hand-off artifact — Window 3 reads it before implementing.

**Checkpoint Validation**:
- [ ] `research-findings.md` exists and answers all four research questions
- [ ] Round field name is confirmed (e.g., `game.round?.number`, `game.roundNumber`)
- [ ] All raw status strings that appear in the API are listed
- [ ] Player stats endpoint path is confirmed or marked INACCESSIBLE (with rationale)
- [ ] In-progress fetch strategy is confirmed (standard endpoint vs dedicated endpoint)

---

### T003 [R] — Confirm PlayHQ round field name and status strings (Research Tasks 1 & 2)

**Window**: 2
**Phase**: Research (blocks Phase 2 implementation)
**Traceability**: FR-003 (roundNumber in normaliseGame), FR-004 (round files keyed by round)
**Dependencies**: Window 1 complete (branch exists)
**Parallel**: Yes [P] — no file conflicts with T004

**Steps**:
1. Open `scripts/scrape-playhq.js`. Find the `normaliseGame(game, gradeName)` function.
2. Immediately before the `return` statement (or before `normaliseGame` is called),
   add a temporary log: `console.log('RAW_GAME:', JSON.stringify(game, null, 2));`
3. Run: `PLAYHQ_API_KEY=<key> node scripts/scrape-playhq.js 2>&1 | head -200`
4. From the raw output, identify:
   - Which field carries the round number (integer or string)
   - Whether it needs parsing (e.g., `"Round 5"` → `5`)
   - All distinct values of `game.status` visible in the output
5. Remove the temporary log line before committing.
6. Write findings to `specs/coa-71-scores-not-staying-updated/research-findings.md`:

```markdown
## Research Task 1 — Round Field Name
- Field path: `game.round?.number` (or the confirmed path)
- Type: integer | string label
- Parsing required: yes/no — if yes, describe

## Research Task 2 — Status Strings
- Raw values observed: ['scheduled', 'completed', ...]
- Mapping to normalised values:
  - 'scheduled' → 'UPCOMING'
  - 'completed' → 'COMPLETED'
  - (list all observed)
- Any unrecognised strings: list them; they should map to 'UPCOMING' as a safe default
```

**Test**: `research-findings.md` must contain concrete answers, not "likely" or "probably".
If the API key is unavailable locally, trigger via `workflow_dispatch` on a test branch
that logs the raw output to the Actions run log, then copy findings from there.

---

### T004 [R] [P] — Confirm player stats endpoint and in-progress fetch strategy (Research Tasks 3 & 4)

**Window**: 2
**Phase**: Research (Research Tasks 3 & 4)
**Traceability**: FR-010 (in-progress fetch), FR-014 (player stats)
**Dependencies**: None beyond API key access
**Parallel**: Yes [P] — appends to same `research-findings.md` but different sections

**Steps**:

Research Task 4 (in-progress endpoint):
1. Take a known gameId from `scripts/scores-data.json` that has a non-completed status
   (or any gameId — the question is whether the standard endpoint refreshes live).
2. Call `GET /v1/grades/{gradeId}/games` during a game window (or inspect the existing
   scraper output for any `status` field that is not `completed`).
3. Determine: does the standard games endpoint return current live scores on each call,
   or is there a separate live/scoreboard endpoint in the PlayHQ API docs?
4. If the standard endpoint is sufficient, `poll-live-scores.js` can reuse the scraper
   pattern with a filter on status. Note this.

Research Task 3 (player stats endpoint):
1. Pick a known COMPLETED gameId from `scripts/scores-data.json`.
2. Call: `curl -H "x-api-key: <key>" -H "x-phq-tenant: bv" https://api.playhq.com/v1/games/{gameId}/statistics`
3. Record: HTTP status code, response shape (player name fields, stat fields), or error.
4. If 404 or 403: mark Phase 4 as DEFERRED pending access confirmation. Note in
   findings — do NOT let this block Phases 1–3.

Append to `specs/coa-71-scores-not-staying-updated/research-findings.md`:
```markdown
## Research Task 3 — Player Stats Endpoint
- Endpoint path: GET /v1/games/{gameId}/statistics (confirmed/denied)
- HTTP status: 200 | 404 | 403
- Response shape (if 200): { players: [{ name, team, points, fouls, assists, rebounds }] }
- Phase 4 status: PROCEED | DEFERRED

## Research Task 4 — In-Progress Fetch Strategy
- Standard grades/games endpoint returns live scores: yes/no
- Dedicated live endpoint exists: yes (path: ...) | no
- poll-live-scores.js approach: reuse standard endpoint with status filter | use dedicated endpoint
```

**Test**: Findings are present in `research-findings.md`. If player stats returns a non-200,
Phase 4 tasks are flagged DEFERRED — do not block or slow Phases 1–3 on it.

---

[WINDOW_CHECKPOINT_2]

**Before proceeding to Window 3**:
- [ ] `research-findings.md` answers Research Tasks 1, 2, 3, and 4
- [ ] Round field name is concrete (no ambiguity)
- [ ] Status string mapping is complete for all observed raw values
- [ ] Phase 4 is either PROCEED or DEFERRED with a clear rationale

---

## Execution Window 3: normaliseGame() + TypeScript Types

**Purpose**: Extend `scrape-playhq.js` with `roundNumber` and `normaliseStatus()` using the
confirmed field names from Window 2. Add TypeScript type definitions for the new data model.

**Token Budget**: 50–70k

**Context for implement agent**:
- Read `research-findings.md` before touching any code. The field name and status strings
  MUST come from there, not from assumptions.
- `scrape-playhq.js` is an ESM script under `scripts/`. It already has `normaliseGame()`.
  The changes are additive — add `roundNumber` to the return value and add `normaliseStatus()`.
- `src/lib/scores/round-file.ts` is a new file. It defines the TypeScript interfaces used
  by the frontend (Scores page) and the Vitest unit tests. No runtime logic — types only,
  plus the `normaliseStatus()` function re-exported for frontend use.
- `src/lib/scores/round-file.test.ts` is new. It unit-tests `normaliseStatus()` for every
  raw status string found in research findings.

**Checkpoint Validation**:
- [ ] `normaliseGame()` returns `roundNumber: number | null` (null for missing/unparseable)
- [ ] `normaliseStatus()` maps every observed raw status string correctly
- [ ] `src/lib/scores/round-file.ts` exports `NormalisedGame`, `RoundFile`, `RoundsIndex`,
      `LiveScores`, `GameStatus`, `RoundStatus`
- [ ] `npx vitest run src/lib/scores/round-file.test.ts` passes (all status mappings covered)
- [ ] Games with null round number are excluded and logged — confirmed by unit test

---

### T005 — Add `roundNumber` and `normaliseStatus()` to `scripts/scrape-playhq.js`

**Window**: 3
**Phase**: Phase 2 (Round Architecture) — script foundation
**Traceability**: FR-003 (roundNumber in normaliseGame), FR-009 (null round → excluded)
**Dependencies**: Window 2 `research-findings.md` (field name and status strings confirmed)
**Parallel**: No — T006 reads the types defined here

**File to change**: `scripts/scrape-playhq.js`

1. Add `normaliseStatus(raw)` function (below the existing `normaliseGame` function or
   in a shared lib — see Open Question 5 in plan.md about extracting to
   `scripts/lib/playhq-api.js`; for now, add inline in `scrape-playhq.js`):

```javascript
function normaliseStatus(raw) {
  if (!raw) return 'UPCOMING';
  const s = raw.toLowerCase();
  // Use exact values confirmed by Research Task 2
  if (s === 'completed' || s === 'graded') return 'COMPLETED';
  if (s === 'in-progress' || s === 'live') return 'IN_PROGRESS';
  return 'UPCOMING';
}
```
Replace the status string constants with values from `research-findings.md`.

2. In `normaliseGame(game, gradeName)`, add `roundNumber` derivation using the confirmed
   field path from Research Task 1 findings:

```javascript
// Use the confirmed field path from research-findings.md
const rawRound = game.round?.number ?? game.roundNumber ?? null;
const roundNumber = typeof rawRound === 'number'
  ? rawRound
  : (typeof rawRound === 'string' ? parseInt(rawRound, 10) || null : null);
```

3. Add `roundNumber` and the normalised `status` to the return value of `normaliseGame()`.

4. In the calling loop (where `normaliseGame()` results are collected), add exclusion logic:
```javascript
const game = normaliseGame(rawGame, gradeName);
if (game.roundNumber === null) {
  structuredLog('warn', { event: 'game_excluded', gameId: rawGame.id, reason: 'missing_round_number' });
  continue;
}
results.push(game);
```
(If `scrape-playhq.js` does not already have a `structuredLog` function, add one matching
the pattern in `scrape-weekly-games.js`.)

**Test**: Run `node scripts/scrape-playhq.js` locally (or via workflow_dispatch). Confirm
output `scores-data.json` now includes `roundNumber` and normalised `status` on each game.
Confirm any games with missing round numbers appear in the log output.

---

### T006 [P] — Create `src/lib/scores/round-file.ts` (TypeScript types)

**Window**: 3
**Phase**: Phase 2 (Round Architecture) — type definitions
**Traceability**: FR-004 (RoundFile shape), FR-005 (RoundsIndex shape), FR-011 (LiveScores shape)
**Dependencies**: Research Task 1 (to type `roundNumber` correctly) — from `research-findings.md`
**Parallel**: Yes [P] — new file, no conflict with T005

**File to create**: `src/lib/scores/round-file.ts`

```typescript
export type GameStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
export type RoundStatus = 'upcoming' | 'in-progress' | 'completed';

export interface PlayerStats {
  players: Array<{
    name: string;
    team: string;
    points: number;
    fouls: number;
    assists: number;
    rebounds: number;
  }>;
}

export interface NormalisedGame {
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

export interface RoundFile {
  roundNumber: number;
  season: string;
  lastUpdated: string;
  status: RoundStatus;
  games: NormalisedGame[];
  ladders: Record<string, LadderRow[]>;
}

export interface LadderRow {
  team: string;
  played: number;
  won: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  percentage: number;
  points: number;
}

export interface RoundsIndex {
  currentRound: number;
  availableRounds: number[];
  lastUpdated: string;
}

export type LiveScores = Record<string, {
  homeScore: number;
  awayScore: number;
  status: GameStatus;
}>;

/** Re-exported for use in frontend scripts and unit tests */
export function normaliseStatus(raw: string | null | undefined): GameStatus {
  if (!raw) return 'UPCOMING';
  const s = raw.toLowerCase();
  // Status strings confirmed by Research Task 2 in research-findings.md
  if (s === 'completed' || s === 'graded') return 'COMPLETED';
  if (s === 'in-progress' || s === 'live') return 'IN_PROGRESS';
  return 'UPCOMING';
}
```

Update the condition constants to match `research-findings.md` exactly.

**Test**: `npx tsc --noEmit` must pass. No TypeScript errors.

---

### T007 — Create `src/lib/scores/round-file.test.ts`

**Window**: 3
**Phase**: Phase 2 — unit tests for types and normaliseStatus
**Traceability**: FR-003, FR-009 (null round number handling)
**Dependencies**: T006 (types defined)
**Parallel**: No — depends on T006

**File to create**: `src/lib/scores/round-file.test.ts`

Write Vitest unit tests covering:

1. `normaliseStatus()` — one test per raw status string confirmed in `research-findings.md`:
```typescript
import { describe, it, expect } from 'vitest';
import { normaliseStatus } from './round-file';

describe('normaliseStatus', () => {
  it('maps "scheduled" to UPCOMING', () => {
    expect(normaliseStatus('scheduled')).toBe('UPCOMING');
  });
  it('maps "completed" to COMPLETED', () => {
    expect(normaliseStatus('completed')).toBe('COMPLETED');
  });
  // ... one test per raw string from research-findings.md
  it('maps null to UPCOMING', () => {
    expect(normaliseStatus(null)).toBe('UPCOMING');
  });
  it('maps unknown string to UPCOMING (safe default)', () => {
    expect(normaliseStatus('unknown-future-status')).toBe('UPCOMING');
  });
});
```

2. `RoundFile` shape validation — create a valid object literal and confirm TypeScript
   accepts it (compile-time test via type assertion).

3. `RoundsIndex` shape — same approach.

**Test**: `npx vitest run src/lib/scores/round-file.test.ts` — all tests green.

---

[WINDOW_CHECKPOINT_3]

**Before proceeding to Window 4**:
- [ ] T005: `scripts/scores-data.json` includes `roundNumber` and normalised `status`
- [ ] T006: `src/lib/scores/round-file.ts` exports all required types without TS errors
- [ ] T007: All `normaliseStatus()` unit tests pass (every raw string from research findings covered)
- [ ] `npx tsc --noEmit` passes
- [ ] `npx vitest run` passes

---

## Execution Window 4: `write-round-files.js` + `fetch-player-stats.js`

**Purpose**: The core Monday 1am cron scripts that build `round-{N}.json` files and
`rounds-index.json`. This is the heaviest implementation window.

**Token Budget**: 80–100k (two new scripts with meaningful logic and error handling)

**Context for implement agent**:
- Read `scripts/scrape-playhq.js` in full before starting. The new scripts reuse its API
  fetch pattern (same `PLAYHQ_API_KEY` env var, same `x-phq-tenant: bv` header, same grade
  and games endpoint pattern). Prefer extracting shared helpers rather than duplicating fetch
  logic — the plan suggests `scripts/lib/playhq-api.js` as a shared module.
- `write-round-files.js` must NOT overwrite a completed round file (FR-008). Before any
  write, it must check if the target file exists with `status: 'completed'` — if so, skip
  and log `round_skipped`.
- `fetch-player-stats.js` is called by `write-round-files.js` and must be callable standalone
  for testing. If the player stats endpoint was marked DEFERRED in `research-findings.md`,
  create a stub that logs and returns `null` for all games — this lets the round files writer
  complete correctly without stats.
- FTPS deploy ordering is a hard invariant: round files uploaded first (individually),
  `rounds-index.json` uploaded last, only referencing rounds whose upload succeeded.
- All scripts must use the `structuredLog()` pattern matching `scrape-weekly-games.js`.

**Checkpoint Validation**:
- [ ] Running `write-round-files.js` locally produces `round-{N}.json` in `public/live-data/rounds/`
- [ ] `rounds-index.json` is created in `public/live-data/rounds/`
- [ ] A game with `roundNumber: null` is excluded from all round files and logged
- [ ] A pre-existing `status: 'completed'` round file is not overwritten (log shows `round_skipped`)
- [ ] `fetch-player-stats.js` returns `null` gracefully on a 404 (does not abort the run)

---

### T008 — Create `scripts/lib/playhq-api.js` (shared API helpers)

**Window**: 4
**Phase**: Phase 2 — shared module
**Traceability**: FR-003, FR-010 (both round files and live polling reuse API calls)
**Dependencies**: T005 (confirms the field names; extract the pattern from scrape-playhq.js)
**Parallel**: No — T009 and T010 import this

**File to create**: `scripts/lib/playhq-api.js`

Extract from `scrape-playhq.js` into this shared module:
- `buildHeaders()` — returns `{ 'x-api-key': process.env.PLAYHQ_API_KEY, 'x-phq-tenant': 'bv' }`
- `fetchGrades(seasonId)` — calls `GET /v1/seasons/{seasonId}/grades`, returns grades array
- `fetchGames(gradeId)` — calls `GET /v1/grades/{gradeId}/games`, returns raw games array
- `fetchLadder(gradeId)` — calls `GET /v1/grades/{gradeId}/ladder`, returns ladder rows
- `normaliseGame(rawGame, gradeName)` — move the updated version from T005 here
- `normaliseStatus(raw)` — move from T005 here
- `structuredLog(level, details)` — move logging util here

After extracting, update `scrape-playhq.js` to import from `./lib/playhq-api.js` so it
does not duplicate logic.

**Test**: Run `scrape-playhq.js` — output must be identical to pre-extraction. Existing
`npx vitest run` must still pass (no imports broken).

---

### T009 — Create `scripts/fetch-player-stats.js`

**Window**: 4
**Phase**: Phase 4 — player stats fetch (but needed by write-round-files.js in Phase 2)
**Traceability**: FR-014 (fetch stats for COMPLETED games), FR-015 (failure → null, no abort)
**Dependencies**: T008 (shared API helpers), Research Task 3 findings
**Parallel**: Yes [P] — can be written concurrently with T010 if branching; otherwise write first

**File to create**: `scripts/fetch-player-stats.js`

If Research Task 3 confirms the endpoint is ACCESSIBLE:
```javascript
#!/usr/bin/env node
import { buildHeaders, structuredLog } from './lib/playhq-api.js';

/**
 * Fetches player statistics for a list of completed games.
 * Returns a Map of gameId → PlayerStats | null.
 * Never throws — failures are logged and return null.
 */
export async function fetchPlayerStats(games) {
  const results = new Map();
  for (const { id: gameId, status } of games) {
    if (status !== 'COMPLETED') continue;
    try {
      const res = await fetch(
        `https://api.playhq.com/v1/games/${gameId}/statistics`,
        { headers: buildHeaders() }
      );
      if (!res.ok) {
        structuredLog('warn', { event: 'stats_fetch_failed', gameId, errorCode: res.status });
        results.set(gameId, null);
        continue;
      }
      const raw = await res.json();
      results.set(gameId, normaliseStats(raw));
      structuredLog('info', { event: 'stats_fetched', gameId, playerCount: raw.players?.length ?? 0 });
    } catch (err) {
      structuredLog('error', { event: 'stats_fetch_failed', gameId, message: err.message });
      results.set(gameId, null);
    }
  }
  return results;
}

function normaliseStats(raw) {
  // Normalise to the shape confirmed by Research Task 3
  return {
    players: (raw.players ?? []).map(p => ({
      name: p.name ?? p.displayName ?? 'Unknown',
      team: p.team ?? p.teamName ?? 'Unknown',
      points: p.points ?? p.pts ?? 0,
      fouls: p.fouls ?? p.pf ?? 0,
      assists: p.assists ?? p.ast ?? 0,
      rebounds: p.rebounds ?? p.reb ?? 0,
    }))
  };
}
```

If Research Task 3 marks the endpoint as DEFERRED:
```javascript
export async function fetchPlayerStats(games) {
  structuredLog('warn', { event: 'stats_skipped', reason: 'endpoint_not_confirmed' });
  const results = new Map();
  for (const { id: gameId } of games) results.set(gameId, null);
  return results;
}
```

**Test**: Unit test (inline or in `scripts/__tests__/`):
- Mock `fetch` to return 404 → `results.get(gameId)` is `null`
- Mock `fetch` to return valid stats JSON → `results.get(gameId)` has correct shape
- Verify function does not throw when one game fails

---

### T010 — Create `scripts/write-round-files.js`

**Window**: 4
**Phase**: Phase 2 — Monday cron orchestrator
**Traceability**: FR-004 (write round files), FR-005 (rounds-index.json), FR-006 (finalise
completed round before writing next), FR-007 (FTPS ordering), FR-008 (no overwrite completed),
FR-009 (null round excluded)
**Dependencies**: T008 (shared API helpers), T009 (fetch-player-stats)
**Parallel**: No — this is the capstone of Window 4

**File to create**: `scripts/write-round-files.js`

High-level structure:
```javascript
#!/usr/bin/env node
import { fetchGrades, fetchGames, fetchLadder, normaliseGame, structuredLog } from './lib/playhq-api.js';
import { fetchPlayerStats } from './fetch-player-stats.js';
import fs from 'fs';
import path from 'path';

const ROUNDS_DIR = 'public/live-data/rounds';
const SEASON_IDS = process.env.PLAYHQ_SEASON_IDS?.split(',') ?? [];

async function main() {
  structuredLog('info', { event: 'started', seasonIds: SEASON_IDS });

  // 1. Fetch all Phoenix games across all seasons
  const allGames = await fetchAllPhoenixGames(SEASON_IDS);

  // 2. Group by roundNumber; exclude null-round games (FR-009)
  const byRound = groupByRound(allGames);

  // 3. Determine completedRoundN and currentRound
  const completedRoundN = findCompletedRound(byRound);
  const currentRound = completedRoundN + 1;

  // 4. Fetch player stats for completed round games
  const completedGames = byRound.get(completedRoundN) ?? [];
  const statsMap = await fetchPlayerStats(completedGames);

  // 5. Write completed round file (finalise — do not overwrite if already completed)
  await writeRoundFile(completedRoundN, completedGames, statsMap, 'completed');

  // 6. Write upcoming round file
  const upcomingGames = byRound.get(currentRound) ?? [];
  await writeRoundFile(currentRound, upcomingGames, new Map(), 'upcoming');

  // 7. FTPS deploy + write rounds-index.json (see FTPS ordering invariant)
  const successfulRounds = await ftpsDeploy(ROUNDS_DIR);
  await writeRoundsIndex(currentRound, successfulRounds);

  structuredLog('info', { event: 'completed', currentRound, successfulRounds });
}

function writeRoundFile(roundNumber, games, statsMap, status) {
  const filePath = path.join(ROUNDS_DIR, `round-${roundNumber}.json`);

  // FR-008: Do not overwrite a completed round file
  if (fs.existsSync(filePath)) {
    const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (existing.status === 'completed') {
      structuredLog('warn', { event: 'round_skipped', roundNumber, reason: 'already_completed' });
      return;
    }
  }

  const gamesWithStats = games.map(g => ({
    ...g,
    playerStats: statsMap.get(g.id) ?? null,
  }));

  const roundFile = {
    roundNumber,
    season: 'Winter 2026',
    lastUpdated: new Date().toISOString(),
    status,
    games: gamesWithStats,
    ladders: {}, // ladders fetched separately; merge in here
  };

  fs.mkdirSync(ROUNDS_DIR, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(roundFile, null, 2));
  structuredLog('info', { event: 'round_written', roundNumber, gameCount: games.length, status });
}
```

Implement `ftpsDeploy()` using the same `lftp` shell-exec pattern as the existing workflows.
Use individual `put` commands (not `mirror --delete`). Record success/failure per file.

Implement `writeRoundsIndex()` to only include rounds whose `lftp put` succeeded.

**Test**: Run locally with a real API key (or a fixture JSON standing in for the API).
Confirm:
- `round-N.json` created with correct shape
- Game with injected `roundNumber: null` excluded and logged
- Re-running with an existing `status: 'completed'` file → file unchanged, `round_skipped` logged

---

[WINDOW_CHECKPOINT_4]

**Before proceeding to Window 5**:
- [ ] T008: `scripts/lib/playhq-api.js` exists; `scrape-playhq.js` imports from it cleanly
- [ ] T009: `fetch-player-stats.js` returns null on failure without throwing
- [ ] T010: `write-round-files.js` produces valid round files and `rounds-index.json`
- [ ] FR-008 invariant confirmed: completed round files are never overwritten
- [ ] FR-007 invariant confirmed: `rounds-index.json` written last, only with successful uploads
- [ ] `npx vitest run` still passes (no regressions)

---

## Execution Window 5: `check-round-files.js` + `monday-round-finalise.yml`

**Purpose**: Add the validation guard that runs before FTPS deploy (mirrors
`check-weekly-games-data.js`) and wire everything into the Monday cron GitHub Actions
workflow.

**Token Budget**: 40–60k (one new script, one new workflow, one existing workflow tweak)

**Context for implement agent**:
- Read `scripts/check-weekly-games-data.js` before writing `check-round-files.js` — match
  its exit-code pattern exactly (exit 1 on failure, structured log output).
- Read `.github/workflows/playhq-refresh-deploy.yml` for the FTPS `lftp` step pattern —
  `monday-round-finalise.yml` must use the same secret names and lftp invocation style.
- The `monday-round-finalise.yml` workflow MUST NOT use `mirror --delete` on the rounds
  directory — this would delete previously deployed completed round files.
- `write-round-files.js` handles its own FTPS deploy internally (per T010). The workflow
  just runs the script and then runs the check. The FTPS within the script is the deploy.

**Checkpoint Validation**:
- [ ] `check-round-files.js` exits 1 if any `rounds-index.json` entry has no corresponding
      round file
- [ ] `check-round-files.js` exits 0 on valid structure
- [ ] `monday-round-finalise.yml` has correct cron (`0 14 * * 0`), correct secrets wired,
      and runs `write-round-files.js` then `check-round-files.js`
- [ ] Workflow does NOT use `mirror --delete` anywhere in the rounds directory step

---

### T011 — Create `scripts/check-round-files.js`

**Window**: 5
**Phase**: Phase 2 — pre-deploy validation
**Traceability**: FR-005 (rounds-index.json is valid), FR-007 (no dangling references), NFR-004
**Dependencies**: T010 (defines the file shapes to validate)
**Parallel**: Yes [P] — no conflict with T012

**File to create**: `scripts/check-round-files.js`

Mirror the pattern of `scripts/check-weekly-games-data.js`. Key checks:

```javascript
#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROUNDS_DIR = 'public/live-data/rounds';

function check() {
  const indexPath = path.join(ROUNDS_DIR, 'rounds-index.json');
  if (!fs.existsSync(indexPath)) {
    console.error('FAIL: rounds-index.json not found');
    process.exit(1);
  }

  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

  // Required fields
  if (typeof index.currentRound !== 'number') bail('currentRound missing or not a number');
  if (!Array.isArray(index.availableRounds)) bail('availableRounds missing or not an array');
  if (typeof index.lastUpdated !== 'string') bail('lastUpdated missing');

  // Every listed round must have a corresponding file
  for (const n of index.availableRounds) {
    const roundPath = path.join(ROUNDS_DIR, `round-${n}.json`);
    if (!fs.existsSync(roundPath)) bail(`round-${n}.json listed in availableRounds but file not found`);
    const round = JSON.parse(fs.readFileSync(roundPath, 'utf8'));
    if (typeof round.roundNumber !== 'number') bail(`round-${n}.json missing roundNumber`);
    if (!['upcoming', 'in-progress', 'completed'].includes(round.status)) bail(`round-${n}.json has invalid status`);
    if (!Array.isArray(round.games)) bail(`round-${n}.json missing games array`);
  }

  console.log('OK: round files validated', { currentRound: index.currentRound, count: index.availableRounds.length });
}

function bail(msg) {
  console.error('FAIL:', msg);
  process.exit(1);
}

check();
```

Add to `package.json` scripts: `"rounds:check": "node scripts/check-round-files.js"`

**Test**: Run against valid output from T010 → exits 0.
Remove a round file that `rounds-index.json` references → exits 1 with clear message.

---

### T012 [P] — Create `.github/workflows/monday-round-finalise.yml`

**Window**: 5
**Phase**: Phase 2 — Monday cron workflow
**Traceability**: FR-006 (finalise completed round before writing next), FR-007 (FTPS ordering)
**Dependencies**: T010 (script exists), T011 (check script exists)
**Parallel**: Yes [P] — new file, no conflict with T011

**File to create**: `.github/workflows/monday-round-finalise.yml`

```yaml
name: Monday Round Finalise

on:
  schedule:
    - cron: '0 14 * * 0'   # Sunday 2pm UTC = Monday 1am AEDT
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: monday-round-finalise
  cancel-in-progress: false   # Do NOT cancel — this is a write operation

jobs:
  finalise-round:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout
        uses: actions/checkout@v5

      - name: Setup Node
        uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Install lftp
        run: sudo apt-get update && sudo apt-get install -y lftp

      - name: Write round files and deploy
        env:
          PLAYHQ_API_KEY: ${{ secrets.PLAYHQ_API_KEY }}
          PLAYHQ_TENANT: bv
          PLAYHQ_SEASON_IDS: ${{ secrets.PLAYHQ_SEASON_IDS }}
          PLAYHQ_CLUB_NAME: ${{ secrets.PLAYHQ_CLUB_NAME }}
          FTP_HOST: ${{ secrets.FTP_HOST }}
          FTP_USER: ${{ secrets.FTP_USER }}
          FTP_PASS: ${{ secrets.FTP_PASS }}
          FTP_REMOTE_DIR: ${{ secrets.FTP_REMOTE_DIR }}
        run: node scripts/write-round-files.js

      - name: Validate round files
        run: node scripts/check-round-files.js
```

Note: `cancel-in-progress: false` is intentional. If the Monday cron is already running,
a second trigger should queue rather than cancel — cancelling mid-write would leave partial
state.

**Test**: Trigger via `workflow_dispatch`. Verify the Actions run completes without error.
Verify round files appear on the server. Verify `check-round-files.js` step passes.

---

[WINDOW_CHECKPOINT_5]

**Before proceeding to Window 6**:
- [ ] T011: `check-round-files.js` exits 1 on invalid state, exits 0 on valid state
- [ ] T012: `monday-round-finalise.yml` is syntactically valid YAML (lint with `actionlint` if available)
- [ ] Workflow has correct secret names matching existing `.github/workflows/` patterns
- [ ] Workflow does NOT use `mirror --delete` on the rounds directory

---

## Execution Window 6: Scores Page — Round Navigation UI (Phase 2 Frontend)

**Purpose**: Replace `scores.astro` with round-navigation-aware version. Game cards render
status-aware UI. Live overlay is NOT wired yet (that is Window 9). This window produces
a working Scores page backed by `rounds-index.json` and `round-{N}.json`.

**Token Budget**: 80–100k (Astro page rewrite is substantial; includes accessibility requirements)

**Context for implement agent**:
- Read the current `src/pages/scores.astro` in full before starting. The current page uses
  a client-side `<script>` island pattern — preserve this approach.
- Read `src/lib/scores/round-file.ts` (from T006) for the type definitions.
- Read `src/lib/playhq/live-data.ts` and `src/lib/playhq/renderers.ts` to understand the
  existing render pattern before adding to it.
- The round navigation strip is `<nav role="navigation" aria-label="Round navigation">` with
  `<button>` elements (not `<a>` links). Each button has `aria-pressed` attribute.
- All fetches of round files must include `?t={Date.now()}` cache-busting (NFR-006).
- Error state: if `rounds-index.json` fails → show "Scores unavailable" (not a crash).
  If a round file fails → show "Results for this round are not yet available" in the content area.
- No live overlay polling in this window — that is added in Window 9 on top of this base.

**Checkpoint Validation**:
- [ ] Scores page loads, fetches `rounds-index.json`, renders round navigation buttons
- [ ] Default round shown is `currentRound` from the index
- [ ] Clicking a round button fetches `round-{N}.json` and replaces game list (no full reload)
- [ ] UPCOMING games show fixture info only (no scores)
- [ ] COMPLETED games show final scores
- [ ] `rounds-index.json` fetch failure shows "Scores unavailable" — no crash or blank screen
- [ ] Keyboard tab navigation reaches all round buttons with visible focus ring
- [ ] All interactive elements have appropriate ARIA labels
- [ ] Page renders correctly within AppShell on both mobile and desktop

---

### T013 — Create `src/lib/scores/round-navigation.ts` + `round-navigation.test.ts`

**Window**: 6
**Phase**: Phase 2 Frontend — navigation state logic
**Traceability**: FR-016 (read rounds-index on load), FR-017 (default to currentRound),
FR-018 (render buttons for availableRounds), FR-019 (fetch round on button click)
**Dependencies**: T006 (types), T007 (test pattern established)
**Parallel**: Yes [P] — new files, no conflict with T014

**File to create**: `src/lib/scores/round-navigation.ts`

```typescript
import type { RoundsIndex, RoundFile } from './round-file';

export interface RoundNavigationState {
  index: RoundsIndex | null;
  currentRound: number | null;
  roundData: RoundFile | null;
  loadingRound: number | null;
  error: 'index_unavailable' | 'round_unavailable' | null;
}

export async function loadRoundsIndex(): Promise<RoundsIndex | null> {
  try {
    const res = await fetch(`/live-data/rounds/rounds-index.json?t=${Date.now()}`);
    if (!res.ok) return null;
    return await res.json() as RoundsIndex;
  } catch {
    return null;
  }
}

export async function loadRoundFile(roundNumber: number): Promise<RoundFile | null> {
  try {
    const res = await fetch(`/live-data/rounds/round-${roundNumber}.json?t=${Date.now()}`);
    if (!res.ok) return null;
    return await res.json() as RoundFile;
  } catch {
    return null;
  }
}
```

**File to create**: `src/lib/scores/round-navigation.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { loadRoundsIndex, loadRoundFile } from './round-navigation';

describe('loadRoundsIndex', () => {
  it('returns null when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const result = await loadRoundsIndex();
    expect(result).toBeNull();
  });
  it('returns null when response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    const result = await loadRoundsIndex();
    expect(result).toBeNull();
  });
  it('returns parsed index on success', async () => {
    const mockIndex = { currentRound: 3, availableRounds: [1, 2, 3], lastUpdated: '2026-04-21T01:00:00.000Z' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => mockIndex }));
    const result = await loadRoundsIndex();
    expect(result?.currentRound).toBe(3);
  });
});
// Similar tests for loadRoundFile
```

**Test**: `npx vitest run src/lib/scores/round-navigation.test.ts` — all tests green.

---

### T014 [P] — Create `src/lib/playhq/round-renderer.ts` (status-aware game cards)

**Window**: 6
**Phase**: Phase 2 Frontend — game card rendering
**Traceability**: FR-020 (status-appropriate UI for UPCOMING/IN_PROGRESS/COMPLETED)
**Dependencies**: T006 (NormalisedGame type)
**Parallel**: Yes [P] — new file, no conflict with T013

**File to create**: `src/lib/playhq/round-renderer.ts`

```typescript
import type { NormalisedGame, LiveScores } from '../scores/round-file';

export function renderGameCard(game: NormalisedGame, liveScores: LiveScores = {}): string {
  const live = liveScores[game.id];
  const effectiveStatus = live?.status ?? game.status;
  const homeScore = live?.homeScore ?? game.homeScore;
  const awayScore = live?.awayScore ?? game.awayScore;

  const scoreHtml = effectiveStatus === 'UPCOMING'
    ? ''
    : `<div class="score" aria-label="Score">
         <span>${homeScore ?? '–'}</span>
         <span class="separator">–</span>
         <span>${awayScore ?? '–'}</span>
       </div>`;

  const statusBadge = effectiveStatus === 'IN_PROGRESS'
    ? `<span class="badge badge-live" aria-label="Game in progress">LIVE</span>`
    : effectiveStatus === 'COMPLETED'
    ? `<span class="badge badge-final" aria-label="Final score">FINAL</span>`
    : '';

  return `
    <article
      class="game-card"
      data-game-id="${game.id}"
      data-status="${effectiveStatus}"
      aria-label="${game.homeTeam} vs ${game.awayTeam}"
    >
      <div class="teams">
        <span class="team home">${game.homeTeam}</span>
        <span class="vs">vs</span>
        <span class="team away">${game.awayTeam}</span>
      </div>
      ${scoreHtml}
      ${statusBadge}
      <div class="meta">
        <span>${game.date ?? ''}</span>
        <span>${game.time ?? ''}</span>
        <span>${game.venue ?? ''}</span>
        <span>${game.court ?? ''}</span>
      </div>
    </article>
  `;
}
```

Also create `src/lib/playhq/round-renderer.test.ts` with tests:
- UPCOMING game: no score elements in output
- COMPLETED game: score elements present with final values
- IN_PROGRESS game: LIVE badge present
- Live overlay overrides base game score when provided

**Test**: `npx vitest run src/lib/playhq/round-renderer.test.ts` — all tests green.

---

### T015 — Rewrite `src/pages/scores.astro` with round navigation

**Window**: 6
**Phase**: Phase 2 Frontend — main page rewrite
**Traceability**: FR-016 through FR-023, NFR-001 (accessibility), NFR-002 (AppShell),
NFR-003 (error states), NFR-006 (cache busting), NFR-007 (tap targets), AC-1 through AC-2,
AC-7, AC-11 through AC-13
**Dependencies**: T013 (navigation state), T014 (renderer)
**Parallel**: No — depends on T013 and T014

**File to change**: `src/pages/scores.astro`

Frontmatter:
- Remove the old `publicPath` file read for `scores.json` (now served at runtime from
  `rounds-index.json`, not at build time)
- Import types from `round-file.ts` for type safety in client script

Page structure:
```html
<BaseLayout title="Scores">
  <section id="scores-shell">
    <!-- Error state (hidden by default) -->
    <div id="scores-unavailable" hidden>
      <p>Scores are temporarily unavailable. Please try again later.</p>
    </div>

    <!-- Round navigation (populated by JS) -->
    <nav role="navigation" aria-label="Round navigation" id="round-nav">
      <!-- Buttons injected by JS after index loads -->
    </nav>

    <!-- Round content area -->
    <div id="round-content" aria-live="polite">
      <p>Loading scores...</p>
    </div>
  </section>
</BaseLayout>
```

Client `<script>` island:
1. On `DOMContentLoaded`, fetch `rounds-index.json?t={Date.now()}`
2. On failure: show `#scores-unavailable`, hide loading message
3. On success: render round nav buttons (one `<button>` per `availableRounds` entry)
   - Each button: `aria-pressed="false"` (true for active round)
   - Minimum 44px tap target (Tailwind `min-h-[44px]` or equivalent)
   - Visible focus ring (Tailwind `focus:ring-2`)
4. Fetch and render `currentRound` by default
5. On round button click: update `aria-pressed`, fetch `round-{N}.json?t={Date.now()}`,
   replace `#round-content` innerHTML with rendered game cards
6. On round file fetch failure: set `#round-content` to "Results for this round are not
   yet available" — do not show `#scores-unavailable`
7. Render game cards using `renderGameCard()` from `round-renderer.ts`

Live overlay polling is NOT added here — it is a Phase 3 addition in Window 9.

**Test**:
- Load Scores page in browser with valid `rounds-index.json` → round nav appears,
  default round renders
- Click a different round button → content switches without page reload
- Open browser DevTools Network tab → all round file fetches include `?t=` param
- Disconnect network → shows unavailable state, no crash
- Tab through round buttons → focus ring visible on each

---

[WINDOW_CHECKPOINT_6]

**Before proceeding to Window 7**:
- [ ] T013: Navigation state unit tests pass
- [ ] T014: Round renderer unit tests pass (all 3 status variants covered)
- [ ] T015: Scores page loads, renders round nav, switches rounds without reload
- [ ] T015: Error state renders when `rounds-index.json` is unreachable
- [ ] T015: UPCOMING games show no scores
- [ ] T015: Keyboard navigation reaches all round buttons with visible focus ring
- [ ] `npx vitest run` passes

---

## Execution Window 7: Phase 2 Integration Tests + `scores/[gameId].astro` Base

**Purpose**: Validate Phase 2 acceptance criteria with end-to-end-style tests and update
the game detail page to the new data model.

**Token Budget**: 60–80k

**Context for implement agent**:
- Read `src/pages/scores/[gameId].astro` in full. It currently reads `scores.json` —
  update it to derive game data from the round file instead.
- The game detail page does NOT show player stats yet (that is Window 10). It shows:
  - UPCOMING: fixture info only
  - IN_PROGRESS: live score (if available via `live-scores.json`), no stats
  - COMPLETED: final score, player stats section is ABSENT (not an error) until Phase 4
- The Vitest unit test coverage targets from the plan that have not yet been written
  (round-navigation, live-data merge function) should be completed in this window.

**Checkpoint Validation**:
- [ ] `scores/[gameId].astro` reads from round files, not `scores.json`
- [ ] COMPLETED game detail shows final score (no stats section yet)
- [ ] UPCOMING game detail shows fixture info, no score, no stats
- [ ] `npx vitest run` passes — all Phase 2 unit tests green

---

### T016 — Update `src/pages/scores/[gameId].astro` to use round files

**Window**: 7
**Phase**: Phase 2 Frontend
**Traceability**: FR-022 (status-appropriate game detail), AC-5, AC-6, AC-7
**Dependencies**: T006 (types), T014 (renderer pattern), T015 (round nav context)
**Parallel**: Yes [P] — no conflict with T017

**File to change**: `src/pages/scores/[gameId].astro`

Current: reads `scores.json` from `public/live-data/scores.json` in frontmatter.
New approach: the page fetches round data client-side (same pattern as `scores.astro`).

1. Remove the `publicPath` file reads for `scores.json` (lines 11 and 26).
2. The `gameId` is available from `Astro.params.gameId`.
3. In the client `<script>` island:
   a. Fetch `rounds-index.json` → get `availableRounds`
   b. Fetch each `round-{N}.json` until the game with matching `id` is found
      (or fetch all rounds and search — optimise later if needed)
   c. Render status-appropriate content:
      - UPCOMING: teams, date, time, venue, court. No score. No stats section.
      - IN_PROGRESS: teams + current score from `live-scores.json` overlay. No stats.
      - COMPLETED: teams + final score. Stats section placeholder (will be populated
        in Phase 4/Window 10). If `playerStats` is null, omit stats section entirely.
4. Update `data-live-data-url` attribute to reference `fixtures.json` if still present.
5. Handle not-found state (gameId not in any round) with a clear message.

**Test**: Navigate to a COMPLETED game's detail URL → final score shown, no stats section.
Navigate to an UPCOMING game → fixture info only, no score.

---

### T017 [P] — Write remaining Phase 2 unit tests

**Window**: 7
**Phase**: Phase 2 — test coverage completion
**Traceability**: NFR-004 (observability), all Phase 2 AC
**Dependencies**: T013, T014 (modules to test exist)
**Parallel**: Yes [P] — test files only, no conflict with T016

Write any remaining tests not yet covered:

1. Extend `src/lib/playhq/live-data.test.ts`:
   - Test that `isLiveDataStale()` (existing function) still works after renaming
     `scores.json` to `fixtures.json`
   - Add test for the live overlay merge function (preview of Phase 3 — write the
     test now so Window 9 can implement to green):
     ```typescript
     it('merges live scores into game cards by gameId', () => {
       const games = [{ id: 'abc', status: 'IN_PROGRESS', homeScore: null, awayScore: null, ... }];
       const liveScores = { 'abc': { homeScore: 42, awayScore: 38, status: 'IN_PROGRESS' } };
       const merged = mergeLiveScores(games, liveScores);
       expect(merged[0].homeScore).toBe(42);
     });
     ```
     Import `mergeLiveScores` — this will fail (RED) until Window 9 implements it.
     That is intentional — write the test now, let it fail, implement in Window 9.

2. Verify `npx vitest run` suite: all existing tests green; the new `mergeLiveScores`
   test fails (expected RED until Window 9).

**Test**: `npx vitest run` — passes except the `mergeLiveScores` test which is expected RED.

---

[WINDOW_CHECKPOINT_7]

**Before proceeding to Window 8**:
- [ ] T016: Game detail page reads from round files, not `scores.json`
- [ ] T016: UPCOMING and COMPLETED game detail views render correctly
- [ ] T017: All Phase 2 unit tests green
- [ ] T017: `mergeLiveScores` test written (RED is expected at this point)
- [ ] `npx vitest run` passes except the intentionally-RED `mergeLiveScores` test

---

## Execution Window 8: `poll-live-scores.js` + `live-scores-poll.yml`

**Purpose**: The live score polling infrastructure. Script fetches in-progress game scores
every 2 minutes during game windows and deploys `live-scores.json`.

**Token Budget**: 50–70k (new script + new workflow; logic is simpler than write-round-files)

**Context for implement agent**:
- Read `scripts/lib/playhq-api.js` (from T008) — `poll-live-scores.js` reuses its fetch
  helpers.
- Read Research Task 4 findings in `research-findings.md` — the in-progress fetch strategy
  (standard endpoint vs dedicated endpoint) determines the implementation approach.
- The script must complete within 2 minutes total. Add a 60-second fetch timeout to
  abort gracefully if the API is slow.
- If no games are IN_PROGRESS, write `{}` (empty object) — not null, not an error (FR-012).
- The FTPS deploy in this script deploys `live-scores.json` ONLY — it must not touch
  round files (FR-013).

**Checkpoint Validation**:
- [ ] `poll-live-scores.js` writes `public/live-data/live-scores.json` with correct shape
- [ ] When no games are IN_PROGRESS, file contains `{}`
- [ ] FTPS step deploys `live-scores.json` only (no round files in the lftp command)
- [ ] `live-scores-poll.yml` has correct cron (`*/2 6-13 * * 1,2,3,5`)
- [ ] `live-scores-poll.yml` has `concurrency.cancel-in-progress: true`
- [ ] `live-scores-poll.yml` has `timeout-minutes: 3`

---

### T018 — Create `scripts/poll-live-scores.js`

**Window**: 8
**Phase**: Phase 3 (Live Score Polling)
**Traceability**: FR-010 (live polling cron), FR-011 (keyed by gameId), FR-012 (empty object),
FR-013 (deploy live-scores.json only), NFR-004 (structured logging)
**Dependencies**: T008 (shared API helpers), Research Task 4 findings
**Parallel**: Yes [P] — no conflict with T019

**File to create**: `scripts/poll-live-scores.js`

```javascript
#!/usr/bin/env node
import { fetchGrades, fetchGames, structuredLog } from './lib/playhq-api.js';
import fs from 'fs';

const SEASON_IDS = process.env.PLAYHQ_SEASON_IDS?.split(',') ?? [];
const OUTPUT_PATH = 'public/live-data/live-scores.json';
const FETCH_TIMEOUT_MS = 60_000;

async function main() {
  structuredLog('info', { event: 'started' });

  const liveScores = {};

  for (const seasonId of SEASON_IDS) {
    const grades = await withTimeout(fetchGrades(seasonId), FETCH_TIMEOUT_MS);
    for (const grade of grades) {
      const games = await withTimeout(fetchGames(grade.id), FETCH_TIMEOUT_MS);
      for (const game of games) {
        // Use the confirmed status mapping from research-findings.md
        if (normaliseStatus(game.status) === 'IN_PROGRESS') {
          liveScores[game.id] = {
            homeScore: game.homeScore ?? 0,
            awayScore: game.awayScore ?? 0,
            status: 'IN_PROGRESS',
          };
        }
      }
    }
  }

  fs.mkdirSync('public/live-data', { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(liveScores, null, 2));

  const count = Object.keys(liveScores).length;
  structuredLog('info', {
    event: 'in_progress_found',
    count,
    gameIds: Object.keys(liveScores),
  });

  // FTPS deploy live-scores.json only
  await ftpsDeployLiveScores();

  structuredLog('info', { event: 'completed', inProgressCount: count });
}

async function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Fetch timeout')), ms)
  );
  try {
    return await Promise.race([promise, timeout]);
  } catch (err) {
    structuredLog('warn', { event: 'fetch_timeout', message: err.message });
    return [];
  }
}
```

The `ftpsDeployLiveScores()` function must use the same `lftp` shell-exec pattern as the
existing workflows — deploying `public/live-data/live-scores.json` to the remote `live-data/`
directory only. No `mirror --delete`. No other files.

**Test**: Run locally. With no games in progress → `live-scores.json` contains `{}`.
Run again with a mocked in-progress game → file contains correct entry. Script exits 0.

---

### T019 [P] — Create `.github/workflows/live-scores-poll.yml`

**Window**: 8
**Phase**: Phase 3 (Live Score Polling)
**Traceability**: FR-010 (cron schedule), FR-013 (deploy live-scores.json only)
**Dependencies**: T018 (script exists)
**Parallel**: Yes [P] — new file, no conflict with T018

**File to create**: `.github/workflows/live-scores-poll.yml`

```yaml
name: Live Score Polling

on:
  schedule:
    - cron: '*/2 6-13 * * 1,2,3,5'   # Every 2 min, Mon/Tue/Wed/Fri, 6am–1pm UTC
                                        # = 4:30pm–11:30pm AEDT with buffer
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: live-scores-poll
  cancel-in-progress: true   # A slow run is cancelled by the next 2-minute fire

jobs:
  poll-live-scores:
    runs-on: ubuntu-latest
    timeout-minutes: 3

    steps:
      - name: Checkout
        uses: actions/checkout@v5

      - name: Setup Node
        uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Install lftp
        run: sudo apt-get update && sudo apt-get install -y lftp

      - name: Poll live scores and deploy
        env:
          PLAYHQ_API_KEY: ${{ secrets.PLAYHQ_API_KEY }}
          PLAYHQ_SEASON_IDS: ${{ secrets.PLAYHQ_SEASON_IDS }}
          PLAYHQ_CLUB_NAME: ${{ secrets.PLAYHQ_CLUB_NAME }}
          FTP_HOST: ${{ secrets.FTP_HOST }}
          FTP_USER: ${{ secrets.FTP_USER }}
          FTP_PASS: ${{ secrets.FTP_PASS }}
          FTP_REMOTE_DIR: ${{ secrets.FTP_REMOTE_DIR }}
        run: node scripts/poll-live-scores.js
```

**Test**: Trigger via `workflow_dispatch`. Confirm the Actions run completes within 3 minutes.
Confirm `live-scores.json` is updated on the server. Confirm no round files are modified.

---

[WINDOW_CHECKPOINT_8]

**Before proceeding to Window 9**:
- [ ] T018: `poll-live-scores.js` writes valid `live-scores.json` (empty `{}` or populated)
- [ ] T018: FTPS step deploys `live-scores.json` ONLY — no other files
- [ ] T019: Workflow YAML is valid; cron schedule matches spec (`*/2 6-13 * * 1,2,3,5`)
- [ ] T019: `cancel-in-progress: true` is set
- [ ] T019: `timeout-minutes: 3` is set

---

## Execution Window 9: Live Overlay Frontend (Phase 3)

**Purpose**: Wire live score polling into the Scores page. In-progress games show live
scores that auto-update every 2 minutes. Polling is gated to game window hours.

**Token Budget**: 60–80k

**Context for implement agent**:
- Read `src/pages/scores.astro` (as written in Window 6/T015). The live overlay additions
  are additive to that base — do not rewrite the whole file.
- The `mergeLiveScores` function is needed by the frontend script. Implement it in
  `src/lib/playhq/live-data.ts` or a new file. The test written in T017 will turn GREEN
  when this is implemented.
- Polling must NOT start outside game window hours. Gate on client-local time:
  Mon/Tue/Wed/Fri (days 1,2,3,5 in JS `getDay()`) between 16:30 and 23:30 local time
  (Melbourne AEDT). Note: `getDay()` returns 0=Sun, 1=Mon ... 5=Fri, 6=Sat.
- `setInterval` must be cleared when the page is hidden (`visibilitychange` event) and
  restarted when it becomes visible again, to avoid redundant fetches when the user has
  the tab in the background.

**Checkpoint Validation**:
- [ ] `mergeLiveScores` test from T017 turns GREEN
- [ ] Scores page starts a `setInterval` when any game in the current round is IN_PROGRESS
      AND current time is within the game window
- [ ] Interval fetches `live-scores.json?t={Date.now()}` every 120,000ms
- [ ] Live scores overlay in-progress game cards without re-rendering the full round
- [ ] When `live-scores.json` returns `{}`, live overlay is cleared, base data shown
- [ ] Polling does NOT start on Thursday, Saturday, Sunday, or before 4:30pm / after 11:30pm
- [ ] `npx vitest run` passes — `mergeLiveScores` test now GREEN

---

### T020 — Implement `mergeLiveScores()` in `src/lib/playhq/live-data.ts`

**Window**: 9
**Phase**: Phase 3 (Live Overlay)
**Traceability**: FR-021 (poll live-scores.json), FR-020 (IN_PROGRESS card shows live score)
**Dependencies**: T017 (test written and RED — implement to make it GREEN)
**Parallel**: Yes [P] — no conflict with T021

**File to change**: `src/lib/playhq/live-data.ts` (add to existing file)

```typescript
import type { NormalisedGame, LiveScores } from '../scores/round-file';

/**
 * Merges live score overlay into a game list by gameId.
 * Returns a new array — does not mutate input.
 */
export function mergeLiveScores(
  games: NormalisedGame[],
  liveScores: LiveScores
): NormalisedGame[] {
  return games.map(game => {
    const live = liveScores[game.id];
    if (!live) return game;
    return {
      ...game,
      homeScore: live.homeScore,
      awayScore: live.awayScore,
      status: live.status,
    };
  });
}
```

**Test**: `npx vitest run src/lib/playhq/live-data.test.ts` — the `mergeOverlay` test
from T017 turns GREEN.

---

### T021 [P] — Create `src/lib/scores/game-window.ts` + test

**Window**: 9
**Phase**: Phase 3 (Live Overlay)
**Traceability**: FR-021 (no polling outside game windows), AC-15
**Dependencies**: None (pure utility)
**Parallel**: Yes [P] — new file, no conflict with T020

**File to create**: `src/lib/scores/game-window.ts`

```typescript
/**
 * Returns true if the current local datetime is within a valid game window.
 * Game windows: Mon/Tue/Wed/Fri, 4:30pm–11:30pm Melbourne local time.
 * Note: uses the client's local time — this is intentional. The server
 * cron handles UTC scheduling; the client gate prevents unnecessary polling
 * when the user is clearly outside game hours.
 */
export function isWithinGameWindow(now: Date = new Date()): boolean {
  const day = now.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const gameDays = new Set([1, 2, 3, 5]); // Mon, Tue, Wed, Fri
  if (!gameDays.has(day)) return false;

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const windowStart = 16 * 60 + 30; // 4:30pm = 990 minutes
  const windowEnd = 23 * 60 + 30;   // 11:30pm = 1410 minutes

  return totalMinutes >= windowStart && totalMinutes <= windowEnd;
}
```

**File to create**: `src/lib/scores/game-window.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { isWithinGameWindow } from './game-window';

describe('isWithinGameWindow', () => {
  it('returns true on Monday at 8pm', () => {
    const d = new Date(); d.setHours(20, 0, 0, 0);
    // Manually set day to Monday (requires mocking Date or constructing a known date)
    // Use a known Monday timestamp:
    expect(isWithinGameWindow(new Date('2026-04-20T20:00:00'))).toBe(true); // Monday 8pm
  });
  it('returns false on Thursday', () => {
    expect(isWithinGameWindow(new Date('2026-04-23T20:00:00'))).toBe(false); // Thursday
  });
  it('returns false on Monday at 3pm', () => {
    expect(isWithinGameWindow(new Date('2026-04-20T15:00:00'))).toBe(false);
  });
  it('returns false on Saturday', () => {
    expect(isWithinGameWindow(new Date('2026-04-18T20:00:00'))).toBe(false);
  });
});
```

**Test**: `npx vitest run src/lib/scores/game-window.test.ts` — all tests green.

---

### T022 — Wire live polling interval into `src/pages/scores.astro`

**Window**: 9
**Phase**: Phase 3 (Live Overlay)
**Traceability**: FR-021 (2-minute client poll), FR-020 (IN_PROGRESS overlay),
AC-3, AC-4, AC-15
**Dependencies**: T020 (mergeLiveScores), T021 (isWithinGameWindow), T015 (base scores page)
**Parallel**: No — augments T015's client script

**File to change**: `src/pages/scores.astro`

In the client `<script>` island, add after the round content is rendered:

```javascript
import { mergeLiveScores } from '../lib/playhq/live-data';
import { isWithinGameWindow } from '../lib/scores/game-window';

let pollInterval = null;

function startPollingIfNeeded(roundData) {
  const hasInProgress = roundData.games.some(g => g.status === 'IN_PROGRESS');
  if (!hasInProgress || !isWithinGameWindow()) return;

  if (pollInterval) return; // already running

  pollInterval = setInterval(async () => {
    try {
      const res = await fetch(`/live-data/live-scores.json?t=${Date.now()}`);
      if (!res.ok) return;
      const liveScores = await res.json();
      const mergedGames = mergeLiveScores(roundData.games, liveScores);
      updateGameCards(mergedGames); // update only score elements in DOM
    } catch {
      // Non-fatal — previous scores remain
    }
  }, 120_000);
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

// Stop when tab hidden, restart when visible
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopPolling();
  else startPollingIfNeeded(currentRoundData); // currentRoundData is the last-loaded round
});

// Stop when navigating away
window.addEventListener('beforeunload', stopPolling);

function updateGameCards(games) {
  for (const game of games) {
    const card = document.querySelector(`[data-game-id="${game.id}"]`);
    if (!card) continue;
    // Update only the score elements — do not re-render the full card
    const scoreEl = card.querySelector('.score');
    if (scoreEl && game.status !== 'UPCOMING') {
      scoreEl.querySelector('.home-score').textContent = game.homeScore ?? '–';
      scoreEl.querySelector('.away-score').textContent = game.awayScore ?? '–';
    }
    card.dataset.status = game.status;
  }
}
```

Call `startPollingIfNeeded(roundData)` after each round fetch (initial load and on round
button click).
Call `stopPolling()` before loading a new round.

**Test**:
- Open Scores page during a game window with an IN_PROGRESS game → Network tab shows
  `live-scores.json` fetch every 2 minutes
- Open on a Thursday → no `live-scores.json` fetch occurs (check Network tab)
- Open with all games COMPLETED → no polling interval starts

---

[WINDOW_CHECKPOINT_9]

**Before proceeding to Window 10**:
- [ ] T020: `mergeOverlay` test from T017 is GREEN
- [ ] T021: Game window tests pass for all day/time combinations
- [ ] T022: Live polling starts only when IN_PROGRESS game exists AND within game window
- [ ] T022: Polling stops when tab is hidden or user navigates away
- [ ] T022: `live-scores.json` fetches include `?t=` cache-busting param
- [ ] `npx vitest run` passes — all tests green including the previously-RED mergeScores test

---

## Execution Window 10: Phase 4 — Player Stats in Game Detail View

**Purpose**: Show player statistics in the game detail view for COMPLETED games. This
window can be SKIPPED if Research Task 3 found the stats endpoint inaccessible.

**Token Budget**: 50–70k

**Context for implement agent**:
- Check `research-findings.md` first. If Phase 4 is marked DEFERRED, stop here and log
  the skip. Do not implement against an unconfirmed endpoint.
- `fetch-player-stats.js` was created in Window 4 (T009). If the endpoint was ACCESSIBLE,
  it already fetches and normalises stats. If it was a stub, update it now with the real
  implementation.
- `write-round-files.js` already calls `fetchPlayerStats()` and merges results into round
  files — the data pipeline is already wired. This window only adds the frontend display.
- The stats section must be absent (not an error message) when `playerStats` is null (AC-16).

**Checkpoint Validation**:
- [ ] Research Task 3 in `research-findings.md` confirms endpoint is ACCESSIBLE
- [ ] `round-{N}.json` for a COMPLETED round contains `playerStats` on completed games
- [ ] Game detail view shows player stats table for COMPLETED games with non-null stats
- [ ] Game detail view shows NO stats section when `playerStats` is null
- [ ] Game detail view for IN_PROGRESS shows no stats section
- [ ] AC-6, AC-16 pass

---

### T023 — Update `fetch-player-stats.js` with confirmed endpoint (if DEFERRED in Window 4)

**Window**: 10
**Phase**: Phase 4 (Player Stats)
**Traceability**: FR-014, FR-015
**Dependencies**: Research Task 3 (endpoint confirmed), T009 (stub or real implementation)
**Parallel**: Yes [P] — no frontend conflict with T024

**Condition**: Only needed if T009 was implemented as a stub due to DEFERRED status.

If the endpoint is now confirmed as ACCESSIBLE:
- Replace the stub in `scripts/fetch-player-stats.js` with the real implementation
  from T009's full form (the non-DEFERRED version).
- Update `normaliseStats()` to match the actual response shape from Research Task 3.
- Re-run `write-round-files.js` manually to produce a round file with `playerStats` populated.
- Confirm the round file shape matches `PlayerStats` type in `round-file.ts`.

**Test**: Inspect output `round-{N}.json` — completed games have `playerStats` with
at least one player entry. Failed-stats games have `playerStats: null`.

---

### T024 [P] — Add player stats panel to `src/pages/scores/[gameId].astro`

**Window**: 10
**Phase**: Phase 4 (Player Stats)
**Traceability**: FR-022 (COMPLETED: final score + player stats), AC-6, AC-16
**Dependencies**: T016 (base game detail page), T023 (stats in round files)
**Parallel**: Yes [P] — no conflict with T023 if reading existing round file shape

**File to change**: `src/pages/scores/[gameId].astro`

In the COMPLETED game rendering path, after the final score display:

```html
<!-- Player stats — only rendered when playerStats is non-null -->
{game.playerStats && (
  <section aria-label="Player Statistics">
    <h2>Player Statistics</h2>
    <table>
      <thead>
        <tr>
          <th scope="col">Player</th>
          <th scope="col">Team</th>
          <th scope="col">PTS</th>
          <th scope="col">AST</th>
          <th scope="col">REB</th>
          <th scope="col">PF</th>
        </tr>
      </thead>
      <tbody>
        {game.playerStats.players.map(p => (
          <tr>
            <td>{p.name}</td>
            <td>{p.team}</td>
            <td>{p.points}</td>
            <td>{p.assists}</td>
            <td>{p.rebounds}</td>
            <td>{p.fouls}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
)}
```

For IN_PROGRESS and UPCOMING games: the stats section is entirely absent from the DOM.
For COMPLETED with `playerStats: null`: stats section is entirely absent (no "stats unavailable" message).

Ensure table meets WCAG AA contrast. Apply Tailwind classes matching existing table patterns
in the codebase.

**Test**: Navigate to a COMPLETED game with stats → stats table renders.
Navigate to a COMPLETED game with `playerStats: null` → no stats section in page source.
Navigate to an IN_PROGRESS game → no stats section.

---

### T025 — Extend `round-file.test.ts` with PlayerStats validation

**Window**: 10
**Phase**: Phase 4 — test coverage
**Traceability**: FR-014, FR-015, AC-6, AC-16
**Dependencies**: T006 (types), T023 (stats shape confirmed)
**Parallel**: No — must run after T023 confirms the shape

**File to change**: `src/lib/scores/round-file.test.ts`

Add tests:
```typescript
describe('PlayerStats', () => {
  it('accepts a valid stats object', () => {
    const stats: PlayerStats = {
      players: [{ name: 'A', team: 'Home', points: 10, fouls: 2, assists: 3, rebounds: 5 }]
    };
    expect(stats.players).toHaveLength(1);
  });
  it('accepts null playerStats on a NormalisedGame', () => {
    const game: NormalisedGame = { ..., playerStats: null };
    expect(game.playerStats).toBeNull();
  });
});
```

Also write a unit test for `fetchPlayerStats` (if not already in Window 4):
- Mock fetch returning 404 → returns `null` for that gameId
- Mock fetch returning valid JSON → returns normalised `PlayerStats`
- Verify the function does not throw when one game fails

**Test**: `npx vitest run` — all tests green.

---

[WINDOW_CHECKPOINT_10]

**Feature Complete**:
- [ ] All 10 windows passed their checkpoints
- [ ] `npx vitest run` passes (zero failures)
- [ ] AC-1 through AC-16 validated (see acceptance test run order below)
- [ ] No `live-data/scores.json` references remain anywhere in `src/` or `.github/`
- [ ] FTPS ordering invariant maintained across all scripts
- [ ] `rounds-index.json` on server is always consistent with deployed round files
- [ ] Code is clean, no debug logs, no `console.log` left in production paths

---

## Summary

| Window | Phase | Purpose | Est. Tokens |
|--------|-------|---------|-------------|
| 1 | Phase 1 | Workflow fix + `scores.json` rename | 40–60k |
| 2 | Research | Confirm PlayHQ API field names (4 tasks) | 30–50k |
| 3 | Phase 2 | `normaliseGame()` + TypeScript types + unit tests | 50–70k |
| 4 | Phase 2 | `write-round-files.js` + `fetch-player-stats.js` + shared API lib | 80–100k |
| 5 | Phase 2 | `check-round-files.js` + `monday-round-finalise.yml` | 40–60k |
| 6 | Phase 2 | `scores.astro` rewrite — round navigation UI | 80–100k |
| 7 | Phase 2 | Game detail page update + remaining unit tests | 60–80k |
| 8 | Phase 3 | `poll-live-scores.js` + `live-scores-poll.yml` | 50–70k |
| 9 | Phase 3 | Live overlay frontend (merge + polling + game window gate) | 60–80k |
| 10 | Phase 4 | Player stats frontend (conditional on Research Task 3) | 50–70k |
| **Total** | | | **540–740k** |

---

## Acceptance Test Run Order

Run in phase order. Each phase's tests depend on the prior phase being deployed.

**Phase 1 (Window 1)**:
- AC-14: Home page `fixtures.json` fallback only on genuine fetch failure

**Phase 2 (Windows 3–7)**:
- AC-1: Completed round results visible after Monday cron
- AC-2: Round navigation buttons appear; switching rounds works without full reload
- AC-7: UPCOMING game shows fixture info, no score or stats
- AC-8: API unreachable during Monday cron — no completed round file overwritten
- AC-9: Game with null round number excluded and logged
- AC-10: FTPS failure → `rounds-index.json` not updated for that round
- AC-11: `rounds-index.json` unavailable → human-readable unavailable state, no crash
- AC-12: Mobile — all controls reachable, minimum tap target met
- AC-13: Desktop — layout correct within AppShell, no custom nav shell

**Phase 3 (Windows 8–9)**:
- AC-3: IN_PROGRESS game card shows live score during game window
- AC-4: Score updates without page reload within 2-minute cycle
- AC-5: IN_PROGRESS game detail shows live score, NO stats section
- AC-15: No client-side polling outside game windows

**Phase 4 (Window 10 — if not DEFERRED)**:
- AC-6: COMPLETED game detail shows final score + player stats (when available)
- AC-16: Stats fetch failed → final score shown, stats section absent (no error message)

---

## Key Invariants (Never Violate)

1. **FTPS ordering**: Round files uploaded individually first; `rounds-index.json` uploaded
   last and only references rounds whose upload succeeded (FR-007)
2. **No overwrite of completed rounds**: Before any write to `round-{N}.json`, check if
   existing file has `status: 'completed'` — if so, skip and log (FR-008)
3. **`live-scores-poll.yml` deploys `live-scores.json` only**: It must not touch round files
   or `rounds-index.json` (FR-013)
4. **No `mirror --delete`** on the rounds directory in any workflow — this would delete
   completed round files from prior weeks
5. **Research findings gate implementation**: Windows 3+ must not start until
   `research-findings.md` is complete with concrete answers

---

## Checklist Before Implement Phase

- [x] All windows created and sequenced
- [x] Tasks logically grouped (max 3 per window)
- [x] Dependencies documented per task
- [x] Research tasks explicitly marked [R] and gate downstream windows
- [x] Parallel opportunities marked [P]
- [x] Traceability to spec established (every task → FR-XXX or AC-XX)
- [x] Test-first approach: tests written before or alongside implementation
- [x] Checkpoints clearly defined with pass/fail criteria
- [x] Token budgets estimated per window
- [x] FTPS ordering invariant documented
- [x] Phase 4 DEFERRED path documented (Window 10 skip condition)
