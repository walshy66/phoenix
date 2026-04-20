# Feature Specification: Scores Persistence & Live Updates

**Feature Branch**: `cameronwalsh/coa-71-scores-not-staying-updated`  
**Created**: 2026-04-21  
**Status**: Draft  
**Related**: COA-62 (playhq pages refactor)  
**Input**: Home page shows "Live refresh is temporarily unavailable"; Scores page displays 12+ hour old data; game detail pages missing completed results.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Completed Game Results Display (Priority: P1)

A user completes a match and expects to see the final score and player statistics immediately reflected across all results pages (home, scores listing, game detail).

**Why this priority**: Core functionality — users rely on accurate, up-to-date results as their primary interaction with the site. Stale data breaks trust and defeats the purpose of a live scores feature.

**Independent Test**: Can be fully tested by:
1. Playing a game to completion
2. Navigating to home page → Scores page → Game detail page
3. Verifying final score and player stats appear within acceptable latency (see SC-001)

**Acceptance Scenarios**:

1. **Given** a game has completed and PlayHQ API contains final score/stats, **When** user navigates to Scores page, **Then** results are current (not 12+ hours stale)
2. **Given** user is on Scores page, **When** they click a completed game, **Then** the game detail view populates with final score and player statistics
3. **Given** user refreshes browser on any results page, **When** page reloads, **Then** latest available data is fetched (no client-side cache staling)

---

### User Story 2 – Home Page Live Results (Priority: P1)

Home page displays a "Latest Results" carousel that should show recent completed games. Currently displays a fallback message ("Live refresh is temporarily unavailable") instead of live data.

**Why this priority**: Home page is the entry point; seeing stale/unavailable data on first visit undermines the "live" brand promise.

**Independent Test**: Can be fully tested by:
1. Verifying home page fetches the live data source (public/live-data/home-games.json)
2. Checking that fallback message only appears if the live fetch actually fails
3. Confirming latest results are current when successful

**Acceptance Scenarios**:

1. **Given** the live data endpoint is available, **When** home page loads, **Then** "Live refresh is temporarily unavailable" message does NOT appear
2. **Given** a completed game exists in PlayHQ, **When** home page renders, **Then** that result appears in the Latest Results carousel
3. **Given** multiple completed games exist, **When** carousel renders, **Then** games are sorted by most recent first and limited to appropriate count

---

### User Story 3 – Teams Page Results & Ladder Updates (Priority: P1)

Teams page should reflect latest match results and current ladder standings without requiring a full site rebuild. Currently shows outdated results and ladder position.

**Why this priority**: Teams page is a primary navigation point for coaches/players to check performance and scheduling. Stale ladder data is frustrating.

**Independent Test**: Can be fully tested by:
1. Verifying Teams page reads from live data source
2. Confirming that new results and ladder updates appear after games complete
3. Checking ladder standings match current season state

**Acceptance Scenarios**:

1. **Given** a match completes, **When** user navigates to Teams page, **Then** new result appears in team's match history
2. **Given** match results change, **When** ladder is displayed, **Then** ladder positions reflect current standings (not pre-game state)
3. **Given** browser is refreshed on Teams page, **When** page reloads, **Then** latest results and standings are fetched

---

### Edge Cases

- What happens when PlayHQ API is unreachable during a scheduled refresh window?
- How should the system handle partial data (e.g., final score available but player stats still pending)?
- What if a game is rescheduled or cancelled after results were published?
- How should the system behave if VentraIP FTPS deployment fails mid-upload?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST audit the current data flow for each page (home, scores, teams) to identify where data is sourced (static build artifact vs. live endpoint)
- **FR-002**: Scores page MUST read from the live data endpoint (`public/live-data/scores.json` on VentraIP) rather than static-built data
- **FR-003**: Home page MUST read from the live data endpoint (`public/live-data/home-games.json`) and only display the fallback message if the fetch fails
- **FR-004**: Teams page MUST read from the live data endpoint and update match history and ladder standings without requiring a rebuild
- **FR-005**: Client MUST invalidate stale data on page load (via cache-busting headers or query parameters) to prevent browser cache staling
- **FR-006**: System MUST validate that GitHub Actions refresh workflows complete successfully and log any failures
- **FR-007**: System MUST define and document acceptable data latency (e.g., "results appear within 5 minutes of game completion")

### Key Entities *(include if feature involves data)*

- **Game Result**: Match outcome (final score, teams, date, venue)
  - Source: PlayHQ API → GitHub Actions refresh → `public/live-data/scores.json`
  - Consumed by: Scores page, Teams page, Home page carousel

- **Player Statistics**: Individual performance metrics for a completed game
  - Source: PlayHQ API → GitHub Actions refresh or on-demand fetch
  - Consumed by: Game detail page

- **Ladder Standings**: Current team rankings and season statistics
  - Source: PlayHQ API → GitHub Actions refresh → `public/live-data/scores.json` or separate artifact
  - Consumed by: Teams page

- **Data Artifact**: JSON files (scores.json, home-games.json) deployed to VentraIP
  - Refresh cycle: Every 5 minutes during active game windows (Mon/Tue/Wed/Fri 05:30–13:59 UTC)
  - Plus: Weekly Saturday refresh (14:05 UTC)

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Completed game results appear on all pages (home, scores, teams, detail) within 5 minutes of game completion in PlayHQ API
- **SC-002**: Scores page displays results dated from today or yesterday (no 12+ hour old data unless no recent games exist)
- **SC-003**: Home page "Latest Results" carousel displays current data; fallback message only appears if live data fetch genuinely fails
- **SC-004**: Teams page ladder standings match the current season state in PlayHQ (verified against coach portal or API directly)
- **SC-005**: Game detail page populates with final score and player stats for all completed games; no missing results
- **SC-006**: Client-side cache is busted on page load (verify via browser DevTools Network tab that fresh data is fetched)
- **SC-007**: No browser console errors or failed fetch attempts for live data endpoints during normal operation

---

## Open Questions for Walshy

1. **Frontend Data Architecture**:
   - Does the Scores page currently fetch `public/live-data/scores.json` on load, or is data baked into the Astro build?
   - Is Teams page data similarly static-built or fetched live?
   - How is Home page carousel data currently sourced?

2. **Cache Busting Strategy**:
   - What cache headers (if any) are currently set on `public/live-data/` endpoints?
   - Should we add `?v=timestamp` query params to bust browser cache, or use HTTP cache headers?

3. **Stale Data Diagnosis**:
   - When you look at the Scores page showing 12-hour-old data, is that:
     - The last weekly refresh snapshot (Saturday's data)?
     - Or data from the last successful 5-min polling window?
   - Does manually refreshing the browser fetch newer data, or is it still stale?

4. **Player Stats & Game Detail**:
   - Should game detail pages fetch player stats from PlayHQ API on demand, or from a pre-built JSON artifact?
   - Is the "missing results" issue on detail pages the same data freshness problem, or a separate rendering/fetch bug?

5. **Acceptable Latency & Refresh Windows**:
   - Is 5-minute latency acceptable for completed results, or do you need faster (e.g., real-time polling)?
   - Should the system refresh more frequently during active game times, or is current scheduling sufficient?

6. **Error Handling & Visibility**:
   - Currently, how does the system communicate refresh failures? (The "Live refresh is temporarily unavailable" message—is that hardcoded or error-triggered?)
   - Should we add logging/monitoring to track CI/CD refresh success/failure?

7. **Data Source Validation**:
   - Have you confirmed that `scripts/weekly-games-data.json` and `scripts/home-games-data.json` are being populated correctly by the CI/CD workflows?
   - Are the FTPS uploads to VentraIP completing successfully (check GitHub Actions logs)?

---

## Technical Context

**Current Workflow**:
- GitHub Actions runs scheduled refreshes (5-min intervals during game days, weekly Saturday)
- Refreshes invoke: `npm run scores:refresh` → outputs to `scripts/weekly-games-data.json`
- Artifacts are copied to `public/live-data/` in the same job
- Final step: FTPS mirror deploy to VentraIP document root
- Frontend is expected to fetch from deployed `/live-data/scores.json` endpoint

**Known Issues**:
- Home page shows fallback message despite data being available
- Scores page displays 12+ hour old results
- Teams page doesn't update match history/ladder without full rebuild
- Game detail pages missing results for completed games

**Related Issues**:
- COA-62: PlayHQ pages refactor (predecessor to current data flow)
