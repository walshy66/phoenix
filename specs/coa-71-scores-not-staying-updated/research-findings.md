# Research Findings — COA-71 Scores Not Staying Updated

## Research Task 1 — Round Field Name

- Field path observed in PlayHQ game payloads: `game.round`
- Shape observed:
  - `game.round.id`
  - `game.round.name` (e.g. `"Round 1"`)
  - `game.round.abbreviatedName` (e.g. `"R1"`)
  - `game.round.isFinalRound`
- Type: string label object, not a numeric round field
- Parsing required: yes
  - Parse the numeric suffix from `game.round.name`
  - Fallback to `game.round.abbreviatedName` if needed
- Important note: across the 471 games sampled from the current season, no `roundNumber` property and no `round.number` property was present.

## Research Task 2 — Status Strings

- Raw status values observed in the current season sample: `UPCOMING`, `FINAL`
- Mapping to normalised values:
  - `UPCOMING` → `UPCOMING`
  - `FINAL` → `COMPLETED`
- No `IN_PROGRESS` values were observed in the current season sample run.
- Safe default for unrecognised values: `UPCOMING`

## Research Task 3 — Player Stats Endpoint

- Endpoint path tested: `GET /v1/games/{gameId}/statistics`
- HTTP status: `404 Not Found`
- Response body: `404 page not found`
- Phase 4 status: `DEFERRED`
- Rationale: the statistics endpoint is not available at the tested path, so player stats work should remain gated until a confirmed endpoint is found.

## Research Task 4 — In-Progress Fetch Strategy

- Standard grades/games endpoint returns game records with status and score fields: yes
- Dedicated live endpoint exists: no dedicated live endpoint was found during this research pass
- Observed score fields on game payloads:
  - `competitors[].scoreTotal`
  - `competitors[].outcome`
- In-progress fetch strategy: reuse the standard `GET /v1/grades/{gradeId}/games` endpoint, filter by status, and poll on the existing schedule
- Note: this research run did not surface any `IN_PROGRESS` games, so live-update behaviour could not be observed directly; the standard endpoint remains the only confirmed source of game state.
