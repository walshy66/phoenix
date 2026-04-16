# Tasks: COA-62 — PlayHQ Pages Refactor

**Branch**: `cameronwalsh/coa-62-playhq-pages-refactor` | **Plan**: `specs/coa-62-playhq-pages-refactor/plan.md`

---

## Execution Window 1: Live Data Contract

### Task 1.1: Define live PlayHQ JSON contracts

**Description**: Create or update the live-data contract helpers under `src/lib/playhq/` so the homepage and scores surfaces have a stable JSON shape for `home-games.json`, `scores.json`, and optional detail payloads.

**Acceptance**:
- Contract shape is documented in code
- Parsing/validation rejects malformed payloads safely
- Helpers expose a clear `success|stale|error` state
- Unit tests cover valid and invalid payloads

**Dependency**: None

---

### Task 1.2: Add live data fetch/normalize helpers

**Description**: Implement helpers that read `/live-data/*.json` at runtime, normalize missing fields, and provide fallback/stale states for the homepage and `/scores`.

**Acceptance**:
- Homepage and scores helpers can fetch live data from public JSON URLs
- Missing or malformed JSON yields a safe fallback state
- Helpers do not depend on build-time-only data files

**Dependency**: Task 1.1

---

## Execution Window 2: Page Refactor

### Task 2.1: Refactor homepage PlayHQ surface

**Description**: Update `src/pages/index.astro` and related components so the home scores carousel loads from the live home data source and can refresh on the client without a full rebuild.

**Acceptance**:
- Homepage still renders the existing layout
- Scores carousel reads from live JSON
- Refreshing the live JSON updates the homepage without a full site build

**Dependency**: Tasks 1.1 and 1.2

---

### Task 2.2: Refactor `/scores` to use live data

**Description**: Update `src/pages/scores.astro` to consume the live score data asset instead of build-time JSON.

**Acceptance**:
- `/scores` still renders the current layout and accessibility affordances
- Data updates appear from the live JSON source
- Empty/stale/error states are clear and safe

**Dependency**: Tasks 1.1 and 1.2

---

### Task 2.3: Refactor `/scores/[gameId]` to use live data

**Description**: Update the game detail route so it resolves the current game from the live data source rather than from build-time-only JSON.

**Acceptance**:
- Existing detail URL pattern continues to work
- The detail view can resolve against live data
- Missing game IDs show a safe not-found state

**Dependency**: Tasks 1.1 and 1.2

---

## Execution Window 3: Data-Only Refresh Pipeline

### Task 3.1: Convert the PlayHQ workflow to data-only publishing

**Description**: Update `.github/workflows/playhq-refresh-deploy.yml` so it refreshes PlayHQ data and uploads only the live JSON assets, without running the full site build.

**Acceptance**:
- Scheduled job no longer runs `npm run build`
- Only the live-data files are uploaded to the host
- Manual trigger path continues to work

**Dependency**: Task 1.1

---

### Task 3.2: Add refresh safety and stale fallback handling

**Description**: Ensure the data-only refresh path preserves the last successful dataset when refresh fails and emits structured logs for maintainers.

**Acceptance**:
- Failed refresh does not erase the last good dataset
- Stale/error states are visible and safe
- Logs include operation and status information

**Dependency**: Tasks 1.1 and 3.1

---

## Execution Window 4: Verification & Handover

### Task 4.1: Validate live refresh timing

**Description**: Run the workflow and confirm the data-only refresh path is fast enough for game-day updates and does not require a full build.

**Acceptance**:
- Workflow completes significantly faster than the current 20+ minute full rebuild path
- Updated live data is visible after refresh
- No unrelated pages need rebuilding for data changes

**Dependency**: Tasks 2.1–3.2

---

### Task 4.2: Final QA and documentation updates

**Description**: Verify the homepage, `/scores`, and game detail surfaces after the refactor, then update handover notes so maintainers understand the separation between code deploy and live data refresh.

**Acceptance**:
- Existing site shell and styles remain intact
- Live data behavior is documented for future maintainers
- No console errors or broken layout regressions are introduced

**Dependency**: Tasks 2.1–3.2
