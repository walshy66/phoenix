# Spec: COA-71 — Scores Not Staying Updated

**Status**: READY_FOR_DEV
**Feature Branch**: `cameronwalsh/coa-71-scores-not-staying-updated`
**Created**: 2026-04-21
**Related**: COA-62 (playhq pages refactor)
**Priority**: P1

## Summary

The Scores page displays stale data (12+ hours old) and the Home page shows
"Live refresh is temporarily unavailable" instead of live results. Root cause is
a broken data pipeline where `scores-data.json` is generated but not correctly
served, combined with no round-based architecture or live polling.

This feature fixes the root cause, redesigns the data pipeline to a per-round
file model, adds a live score overlay polled every 2 minutes during game windows,
and adds player stats for completed games.

---

## User Scenarios & Testing

### User Story 1 — Completed Game Results Display (Priority: P1)

A user visits the Scores page after a game night and expects to see final scores
for their team, browseable by round.

**Why this priority**: Core functionality. Stale data breaks trust and defeats
the purpose of a live scores feature.

**Independent Test**:
1. A round completes
2. Monday 1am AEDT cron runs
3. User navigates to Scores page
4. Verifies final scores for that round appear under the correct round label

**Acceptance Scenarios**:

1. Given a round has completed and the Monday cron has run, When user visits the
   Scores page, Then final scores for that round are visible under the correct
   round label
2. Given user is viewing a completed round, When they tap a game, Then the game
   detail view shows final score and player stats
3. Given multiple completed rounds exist, When user uses round navigation, Then
   they can browse any prior round's results

---

### User Story 2 — Live Scores During Game Windows (Priority: P1)

A user checks the Scores page on a game night (Monday, Tuesday, Wednesday, or
Friday between 4:30pm and 11:30pm AEDT) and wants to see scores as games
progress.

**Why this priority**: Real-time feedback during game windows is a primary reason
users visit the Scores page on game nights.

**Independent Test**:
1. A game is IN_PROGRESS during a valid game window
2. The live polling cron has run and updated `live-scores.json`
3. User loads the Scores page
4. The in-progress game card shows the current score
5. Without any user action, the score updates within 2 minutes as the cron runs

**Acceptance Scenarios**:

1. Given a game is IN_PROGRESS and a polling cron has run, When user views the
   Scores page, Then that game's card shows the live score overlaid on the fixture
2. Given user is viewing an IN_PROGRESS game, When the polling cron fires, Then
   the score updates without requiring a page reload (2-minute refresh cycle)
3. Given a game is IN_PROGRESS, When user taps through to the game detail view,
   Then they see the live score but no player stats (stats only available post-game)
4. Given it is outside a game window (e.g., Thursday, or before 4:30pm), When
   user views the Scores page, Then no polling occurs and no live overlay appears

---

### User Story 3 — Round History Navigation (Priority: P1)

A user wants to look back at results from earlier in the season without leaving
the Scores page.

**Why this priority**: Historical round data is a key feature. Users will refer
back to results throughout the season.

**Independent Test**:
1. Multiple round files exist (e.g., rounds 1–5)
2. User loads Scores page (defaults to current round)
3. Taps "Round 3" button
4. Round 3 results render without page reload

**Acceptance Scenarios**:

1. Given rounds 1–5 have data, When Scores page loads, Then navigation buttons
   for rounds 1–5 are visible
2. Given user taps a historical round button, When the request completes, Then
   that round's data is displayed without a full page navigation
3. Given user taps a round with only fixtures (not yet completed), When data
   renders, Then fixtures show without scores — this is not an error state

---

### User Story 4 — Player Stats for Completed Games (Priority: P2)

A user who wants more detail on a completed game taps through to the game detail
view and sees individual player statistics.

**Why this priority**: Useful but not blocking. Live scores and round navigation
are higher value. Player stats are post-game only and add depth without being
critical to the core flow.

**Independent Test**:
1. A game has COMPLETED status
2. Monday cron has fetched and stored player stats for that game
3. User taps the game card on the Scores page
4. Game detail view shows player stats (points, fouls, etc.)

**Acceptance Scenarios**:

1. Given a game has COMPLETED status and stats have been fetched, When user taps
   the game card, Then the detail view shows player statistics
2. Given a game is IN_PROGRESS or UPCOMING, When user taps the game card, Then
   the detail view does NOT show a player stats section (it is absent, not broken)
3. Given stats fetch failed for a completed game, When user views that game
   detail, Then final score is shown and player stats section is absent (not an
   error message)

---

### User Story 5 — Home Page Live Results (Priority: P1)

Home page displays a "Latest Results" carousel. Currently shows a fallback
message ("Live refresh is temporarily unavailable") instead of live data.

**Why this priority**: Home page is the entry point. Seeing a failure message on
first visit undermines trust.

**Independent Test**:
1. Verify home page fetches `fixtures.json` at runtime
2. Confirm fallback message only triggers on a genuine fetch failure
3. Confirm latest results are current when the fetch succeeds

**Acceptance Scenarios**:

1. Given the live data endpoint is reachable, When home page loads, Then the
   "Live refresh is temporarily unavailable" message does NOT appear
2. Given a completed game exists in PlayHQ, When home page renders, Then that
   result appears in the Latest Results carousel
3. Given the live data endpoint is unreachable, When home page loads, Then the
   fallback message is shown and no blank/broken UI appears

---

### Edge Cases

- PlayHQ API is unreachable during Monday 1am cron — previous round files must
  not be overwritten; deploy must not proceed with partial data
- Round number field is missing or null on a game object — game must be logged
  and excluded, not silently dropped into a wrong round file
- Game is rescheduled to a different round after `round-{N}.json` was written —
  Monday cron re-derives file contents from API (not append to prior file)
- FTPS upload fails mid-run — partial state must not leave `rounds-index.json`
  pointing to a round file that did not fully deploy
- Upcoming round has no fixtures yet (bye week or data entry lag) —
  `round-{N+1}.json` may be empty or absent; frontend must handle gracefully
- User navigates to `/scores` with no `rounds-index.json` present — page must
  show a clear unavailable state, not a crash
- Live polling cron fires but no games are IN_PROGRESS — `live-scores.json` is
  written as an empty object `{}`; frontend treats this as "no live games" and
  shows no overlay
- DST transition (AEDT to AEST, clocks fall back) — weekly reset cron at
  `0 14 * * 0` (UTC) becomes slightly early in AEST (1am AEDT = 2pm UTC; 1am
  AEST = 3pm UTC); the cron fires at 2pm UTC year-round, which is acceptable
  (slightly early in AEST but never misses the window)
- Player stats endpoint unavailable for a completed game — stats section is
  omitted from the round file; frontend omits stats panel without error
- A game transitions from IN_PROGRESS to COMPLETED during a game window — the
  live polling cron will include it with `status: 'COMPLETED'` in
  `live-scores.json` for the remainder of the game window. The frontend MUST
  retain COMPLETED scores from the live overlay on the current round view until
  the next round file fetch (i.e., do not clear COMPLETED scores when
  `live-scores.json` transitions to an empty games object).

---

## Requirements

### Functional Requirements

#### Root Cause Fix

- **FR-001**: The GitHub Actions workflow MUST copy `scripts/scores-data.json`
  to `public/live-data/completed-scores.json` (fixing the current broken deploy
  path). In Phase 1, `completed-scores.json` temporarily serves as the scores
  data source for the existing `scores.astro` page. In Phase 2, when the
  round-file architecture is deployed, `completed-scores.json` becomes unused.
  It MUST NOT be removed in this PR — removal will be tracked as a separate
  cleanup task.
- **FR-002**: The file previously deployed as `scores.json` (home page widget
  data) MUST be renamed to `fixtures.json` in both the workflow output and all
  frontend fetch references

#### Data Pipeline — Round Files

- **FR-003**: System MUST add `roundNumber` to the `normaliseGame()` output in
  `scrape-playhq.js`, sourced from the raw PlayHQ game object's round field
  (field name to be confirmed against live API response before implementing)
- **FR-004**: System MUST write per-round JSON files (`round-{N}.json`) to
  `public/live-data/rounds/` rather than a single rolling artifact
- **FR-005**: System MUST maintain `rounds-index.json` declaring `currentRound`,
  `availableRounds[]`, and `lastUpdated`. `currentRound` MUST be the lowest round
  number where at least one game has status UPCOMING or IN_PROGRESS; if all known
  rounds are COMPLETED, `currentRound` MUST be the highest completed round number + 1.
- **FR-006**: The Monday 1am AEDT cron MUST finalise the just-completed round
  file (final scores + player stats) before writing the next round's fixtures
- **FR-007**: FTPS deploy MUST upload round files first, then `rounds-index.json`
  last — `rounds-index.json` MUST NOT reference a round that was not successfully
  deployed
- **FR-008**: System MUST NOT overwrite a completed (finalised) round file with
  partial or in-progress data
- **FR-009**: Games with a null or missing round number MUST be logged and
  excluded — they must not corrupt another round file

#### Data Pipeline — Live Scores

- **FR-010**: A live polling cron (`*/2 6-13 * * 1,2,3,5` UTC) MUST fetch
  in-progress game scores from PlayHQ and write `public/live-data/live-scores.json`
- **FR-011**: `live-scores.json` MUST contain only in-progress and recently
  completed game scores keyed by `gameId` — it is a lightweight overlay, not a
  full round file. COMPLETED games that finished during the current game window
  SHOULD be included in `live-scores.json` until the window ends.
- **FR-012**: If no games are IN_PROGRESS when the polling cron fires,
  `live-scores.json` MUST be written as an empty object `{}`
- **FR-013**: The live polling cron MUST FTPS-deploy only `live-scores.json` —
  it must not rewrite round files

#### Data Pipeline — Player Stats

- **FR-014**: The Monday 1am cron MUST fetch player statistics for each COMPLETED
  game via the PlayHQ statistics endpoint and include them in the finalised round
  file
- **FR-015**: If a player stats fetch fails for a given game, the game record
  MUST still be written to the round file without stats — the failure must be
  logged and must not abort the round finalisation
- **FR-025**: Round files MUST include ladder data for each Phoenix grade, fetched
  via `GET /v1/grades/{gradeId}/ladder`

#### Frontend — Scores Page

- **FR-016**: Scores page MUST read `rounds-index.json` on load to determine the
  default round and which navigation buttons to render
- **FR-017**: Default view on load MUST show `currentRound` from
  `rounds-index.json` (the active or most recently completed round)
- **FR-018**: Round navigation MUST render buttons only for rounds listed in
  `availableRounds`
- **FR-019**: Tapping a round navigation button MUST fetch `round-{N}.json` and
  render it without a full page reload
- **FR-020**: Game cards MUST display status-appropriate UI:
  - UPCOMING: fixture view (teams, time, venue, court) — no scores
  - IN_PROGRESS: live score overlay sourced from `live-scores.json`
  - COMPLETED: final score
- **FR-021**: Frontend MUST poll `live-scores.json` every 2 minutes when any
  game on the current page is IN_PROGRESS (client-side interval, no full reload).
  The client-side game window gate MUST use Melbourne local time (AEDT/AEST). If
  the client cannot determine Melbourne time reliably, the gate SHOULD default to
  allowing polling (fail open — unnecessary fetches are preferable to missed live
  scores).
- **FR-022**: Game detail view MUST display status-appropriate content:
  - UPCOMING: fixture info only
  - IN_PROGRESS: live score, no stats
  - COMPLETED: final score + player stats (if available)
- **FR-023**: Frontend MUST display a clear unavailable state (not a crash or
  blank screen) if `rounds-index.json` or a round file cannot be fetched

#### Frontend — Home Page

- **FR-024**: Home page MUST fetch `fixtures.json` (renamed from `scores.json`)
  at runtime and display the fallback message only if that fetch fails

### Non-Functional Requirements

- **NFR-001 Accessibility**: Round navigation controls MUST be keyboard navigable
  and meet WCAG 2.1 AA contrast requirements; game cards MUST have appropriate
  ARIA labels
- **NFR-002 Layout**: Scores page MUST render correctly on both handheld and
  desktop viewports within AppShell — no custom navigation shell
- **NFR-003 Error Handling**: All fetch failures MUST surface a visible, human-
  readable message — no silent failures or blank states
- **NFR-004 Observability**: All crons MUST log: round numbers processed, files
  written, FTPS upload results, games excluded due to missing round number, and
  stats fetch failures per game
- **NFR-005 Performance**: `rounds-index.json` and `live-scores.json` MUST each
  remain under 1KB to load without perceptible delay
- **NFR-006 Cache Busting**: Frontend fetches of round files and `live-scores.json`
  MUST include a cache-busting mechanism (query parameter with timestamp or
  equivalent) to prevent browser cache serving stale data
- **NFR-007 Tap Targets**: All interactive elements on the Scores page MUST meet
  minimum tap target size on mobile viewports

### Key Entities

- **Round File** (`round-{N}.json`): All Phoenix-relevant games for one round.
  Written by the Monday cron. Completed round files are never overwritten.
  Note: The `season` field MUST be sourced from `PLAYHQ_SEASON_NAME` environment
  variable (or equivalent config), not hardcoded in the script.
  ```json
  {
    "roundNumber": 5,
    "season": "Winter 2026",
    "lastUpdated": "2026-04-21T01:00:00.000Z",
    "status": "completed" | "in-progress" | "upcoming",
    "games": [
      {
        "id": "string",
        "roundNumber": 5,
        "date": "string",
        "time": "string",
        "competition": "string",
        "venue": "string",
        "court": "string",
        "homeTeam": "string",
        "awayTeam": "string",
        "homeScore": null | number,
        "awayScore": null | number,
        "status": "UPCOMING" | "IN_PROGRESS" | "COMPLETED",
        "playerStats": null | { /* per-player stats, COMPLETED only */ }
      }
    ],
    "ladders": {
      "gradeNameA": [
        {
          "position": 1,
          "teamName": "string",
          "played": 5,
          "wins": 4,
          "losses": 1,
          "pointsFor": 320,
          "pointsAgainst": 280,
          "percentage": 114.3,
          "points": 8
        }
      ]
    }
  }
  ```

- **Rounds Index** (`public/live-data/rounds/rounds-index.json`): Lightweight manifest read on page load.
  ```json
  {
    "currentRound": 5,
    "availableRounds": [1, 2, 3, 4, 5],
    "lastUpdated": "2026-04-21T01:00:00.000Z"
  }
  ```

- **Live Scores** (`live-scores.json`): Lightweight overlay updated every 2
  minutes during game windows. Keyed by gameId.
  ```json
  {
    "abc123": { "homeScore": 42, "awayScore": 38, "status": "IN_PROGRESS" },
    "def456": { "homeScore": 61, "awayScore": 55, "status": "IN_PROGRESS" }
  }
  ```

- **Fixtures** (`fixtures.json`): Home page weekly widget data. Renamed from
  `scores.json`. Written by `scrape-weekly-games.js` — unchanged from current
  behaviour.

- **Completed Scores** (`completed-scores.json`): Replaces the broken
  `scores.json` deploy. Written from `scripts/scores-data.json`.

- **LadderRow**: One team's row in a grade ladder. Fields: `position` (number),
  `teamName` (string), `played` (number), `wins` (number), `losses` (number),
  `pointsFor` (number), `pointsAgainst` (number), `percentage` (number, two
  decimal places), `points` (number). The `ladders` field in a Round File is a
  map of grade name → `LadderRow[]`.

- **Normalised Game**: Output of `normaliseGame()` — must include `roundNumber`
  in addition to existing fields. Status values normalised to `UPCOMING`,
  `IN_PROGRESS`, `COMPLETED` (confirm raw PlayHQ strings before implementing).

---

## Data Architecture

```
public/live-data/
  rounds/
    round-1.json          ← per-round data (1–16), written by Monday 1am cron
    round-2.json
    ...
    round-16.json
    rounds-index.json     ← currentRound, availableRounds[], lastUpdated
  live-scores.json        ← in-progress overlay, updated every 2 min during windows
  fixtures.json           ← home page widget (renamed from scores.json)
  completed-scores.json   ← replaces broken scores.json deploy
```

---

## Cron Jobs (GitHub Actions)

### 1. Weekly Reset — `0 14 * * 0` (UTC)

Fires: Sunday 2pm UTC = Monday 1am AEDT (slightly early in AEST, acceptable).

Steps:
1. Scrape PlayHQ for just-completed round's final scores
2. Fetch player stats for each COMPLETED game in that round
3. Write/overwrite `round-{N}.json` (finalise it with final scores + stats)
4. Scrape PlayHQ for upcoming round's fixtures → write `round-{N+1}.json`
5. Update `rounds-index.json` (increment `currentRound`, add new round to
   `availableRounds`)
6. FTPS deploy: round files first, then `rounds-index.json` last
7. Log all outcomes

### 2. Live Score Polling — `*/2 6-13 * * 1,2,3,5` (UTC)

Fires: every 2 minutes, Mon/Tue/Wed/Fri, 6am–1pm UTC
= 4:30pm–11:30pm AEDT (UTC+11) covering game windows through last finish
at ~11:15pm AEDT with buffer.

Steps:
1. Fetch in-progress game scores from PlayHQ
2. Write `live-scores.json` (empty object `{}` if no games in progress)
3. FTPS deploy `live-scores.json` only
4. Log outcome

### 3. Existing Fixture Refresh — unchanged

Continues serving home page weekly widget via `scrape-weekly-games.js`.
Output now deployed as `fixtures.json` instead of `scores.json`.

---

## Success Criteria

- **SC-001**: Completed round results appear on the Scores page after the Monday
  1am cron runs — data is never more than one week stale for completed games
- **SC-002**: Live scores update on the Scores page within 2 minutes of a score
  change during valid game windows
- **SC-003**: Home page "Latest Results" carousel displays current data; fallback
  message only appears if `fixtures.json` fetch genuinely fails
- **SC-004**: Users can navigate to any completed round in the current season
  without a page reload
- **SC-005**: `rounds-index.json` is always consistent with actually-deployed
  round files — no dangling references
- **SC-006**: Player stats appear in game detail view for all COMPLETED games
  where stats were successfully fetched
- **SC-007**: No browser console errors or failed fetch attempts during normal
  operation of the Scores page or Home page carousel

---

## Acceptance Criteria

1. Given a round has completed and the Monday cron has run, When user loads the
   Scores page, Then the default view shows that round's final results

2. Given rounds 1–N are available, When user taps any round navigation button,
   Then the corresponding `round-{N}.json` is fetched and rendered without full
   page reload

3. Given a game is IN_PROGRESS during a valid game window (Mon/Tue/Wed/Fri
   4:30–11:30pm AEDT), When user views the Scores page, Then the game card shows
   a live score sourced from `live-scores.json`

4. Given a game is IN_PROGRESS and the user is on the Scores page, When the
   2-minute polling interval fires, Then the page fetches the latest
   `live-scores.json` without a page reload or any user action. Score values
   displayed reflect the most recently deployed `live-scores.json` — updates may
   lag by up to 4 minutes in total (2-minute cron interval + GitHub Actions queue
   time).

5. Given user taps an IN_PROGRESS game, When game detail view opens, Then it
   shows the live score and NO player stats section

6. Given user taps a COMPLETED game, When game detail view opens, Then it shows
   final score and player stats (if available)

7. Given a game is UPCOMING, When user views the game card or detail view, Then
   fixture info is shown and no score or stats section appears

8. Given the PlayHQ API is unreachable during Monday cron, When the cron
   completes, Then no completed round file is overwritten with partial data and
   `rounds-index.json` is unchanged

9. Given a game object from PlayHQ has no round number, When the cron processes
   it, Then it is excluded from all round files and a log entry is written

10. Given FTPS upload of a round file fails, When the cron completes, Then
    `rounds-index.json` does NOT reference that round as available

11. Given `rounds-index.json` cannot be fetched, When user visits the Scores
    page, Then a human-readable unavailable message is shown — no crash or blank
    screen

12. Given user is on Scores page on a mobile viewport, When round navigation is
    used, Then all controls are reachable by touch and meet minimum tap target
    size

13. Given user is on Scores page on desktop, When round navigation is used, Then
    the layout is correct within AppShell and no custom navigation shell appears

14. Given the home page `fixtures.json` fetch fails, When home page renders, Then
    the fallback message is shown and the carousel does not crash or go blank

15. Given it is outside a game window (e.g., Thursday, or before 4:30pm AEDT),
    When user views the Scores page, Then no live polling occurs client-side

16. Given a stats fetch failed for a completed game, When user views that game
    detail, Then final score is shown and the player stats section is absent (not
    an error message)

---

## Constitutional Compliance

- **Principle I (User Outcomes)**: Each user story has an explicit, measurable
  outcome tied to round data, live scores, or player stats appearing correctly.
  PASS.
- **Principle II (Test-First)**: Each story includes an independent test and
  Given/When/Then acceptance scenarios. All 16 AC are independently testable.
  PASS.
- **Principle III (Backend Authority)**: Round number is determined by PlayHQ API
  — not inferred from dates on the client. FR-003 locks this. Live score overlay
  is server-written and client-read, never client-calculated. PASS.
- **Principle IV (Error Semantics & Observability)**: NFR-003 and NFR-004 require
  structured logging and visible error states. FR-023, FR-024, AC-11, and AC-14
  explicitly prohibit silent failures or blank states. PASS.
- **Principle V (AppShell Integrity)**: NFR-002 and AC-13 require the Scores page
  to render within AppShell with no custom nav shell. PASS.
- **Principle VI (Accessibility First)**: NFR-001, NFR-007, AC-12 cover keyboard
  navigation, tap targets, and ARIA labels. PASS.
- **Principle VII (Immutable Data Flow)**: FR-008 states completed round files
  MUST NOT be overwritten with partial or in-progress data. Live scores overlay
  is additive, not destructive to round files. PASS.
- **AppShell**: Scores page renders within AppShell — no custom navigation shell.
  PASS.
- **Identity Boundary**: No athlete identity or userId concerns in this feature.
  N/A.
- **Responsive**: NFR-002, AC-12, and AC-13 address both handheld and desktop
  layouts. PASS.

---

## Implementation Notes (for the plan agent)

- Before implementing `normaliseGame()` changes, confirm the PlayHQ round field
  name by logging a raw game object on a manual scraper run (likely
  `game.round?.number` or `game.roundNumber`)
- Confirm raw PlayHQ status strings before implementing the normalisation to
  UPCOMING / IN_PROGRESS / COMPLETED
- `scrape-weekly-games.js` is NOT part of this change — it serves the home page
  weekly widget only; update only its output deploy path from `scores.json` to
  `fixtures.json`
- FTPS deploy ordering is mandatory: upload round files first, then
  `rounds-index.json` last — this is an atomicity constraint, not a preference
- The existing `scores-data.json` output path can be deprecated once round files
  are live and all consumers have been migrated; do not remove it in the same PR
- Client-side live polling (FR-021) should be implemented as a simple interval
  that fetches `live-scores.json` and merges scores into the displayed round data
  by `gameId` — no full round file re-fetch required
- Player stats endpoint: use PlayHQ `GET /v1/games/{gameId}/statistics` or
  equivalent; confirm endpoint path against API docs before implementing
- The game detail page MUST NOT fetch all round files serially to find a game.
  Preferred solution: include `roundNumber` as a query param in game card links
  (`?round=N`) so the detail page fetches only `round-{N}.json`.
