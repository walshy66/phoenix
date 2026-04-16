# Spec: COA-62 — PlayHQ Pages Refactor

**Status**: READY_FOR_DEV
**Source**: https://linear.app/coachcw/issue/COA-62/playhq-pages-refactor
**Priority**: P1
**Primary Goal**: Make PlayHQ-driven pages update independently of full site rebuilds.

---

## Summary

Refactor the PlayHQ-driven parts of the Phoenix site so live game data can refresh quickly without rebuilding and redeploying the entire Astro site.

The current implementation loads PlayHQ-derived JSON at build time. That means any score or fixture change requires a full site build and deploy, which is too slow for in-game updates. This feature will move the PlayHQ data layer to publicly served JSON assets that can be refreshed on a short schedule, while keeping the normal site build/deploy workflow for content and layout changes.

The goal is to preserve the existing look and feel of the homepage scores carousel, the `/scores` page, and game detail pages, while making the data refresh path fast enough to feel "live". The pages must render safely on first load from the latest available snapshot or fallback state, then fetch and re-poll the live PlayHQ JSON assets in the browser so updates appear without a full site rebuild.

---

## User Scenarios & Testing

### User Story 1 — See Updated Game Data Without Waiting for a Full Rebuild (Priority: P1)

As a site visitor, I want score and fixture updates to appear quickly so live games and recent results stay current.

**Why this priority**: The existing 20+ minute rebuild cycle is too slow for game-day updates. The site must reflect score changes while games are in progress.

**Independent Test**: Refresh the live PlayHQ data files only, wait for the next poll interval, and verify the homepage carousel and `/scores` page update without running a full Astro build.

**Acceptance Scenarios**:

1. **Given** updated PlayHQ data has been published to the live data endpoint, **When** I open the homepage, **Then** the live scores carousel reflects the new data after the next client poll.
2. **Given** updated PlayHQ data has been published to the live data endpoint, **When** I open `/scores`, **Then** the page shows the current data after the next client poll without requiring a full site rebuild.
3. **Given** a game detail page is opened, **When** the underlying live data changes, **Then** the detail surface can reflect the updated data after refresh without a new full-site deploy.

---

### User Story 2 — Keep a Fast Refresh Path for PlayHQ Data (Priority: P1)

As a site owner, I need a small refresh job that updates only the PlayHQ data assets, so live scores can move independently from the rest of the site.

**Why this priority**: The data refresh path must be fast and lightweight. Full rebuilds should be reserved for code/layout changes.

**Independent Test**: Run the data-only refresh job and confirm only the PlayHQ live JSON assets are updated on the server; the site build is not run as part of the refresh job.

**Acceptance Scenarios**:

1. **Given** the scheduled refresh runs, **When** it completes successfully, **Then** only the PlayHQ live JSON assets are updated and the full site build is skipped.
2. **Given** the refresh job fails, **When** the site is viewed, **Then** visitors still see the last successful live dataset or a clear stale/error state.
3. **Given** a refresh is triggered manually, **When** the job runs, **Then** it behaves the same as the scheduled refresh.

---

### User Story 3 — Preserve Existing UI and Navigation Behaviour (Priority: P1)

As a visitor, I want the site to keep its current design and page structure while the data layer changes underneath.

**Why this priority**: The refactor must not introduce a new layout or disrupt existing navigation patterns.

**Independent Test**: Compare the page structure before and after the refactor and verify that the homepage, scores page, and game detail routes still render inside the existing site shell, using the same public live-data endpoints.

**Acceptance Scenarios**:

1. **Given** the homepage renders, **When** the live PlayHQ data is unavailable, **Then** the page still renders a safe fallback layout instead of crashing.
2. **Given** `/scores` renders, **When** the live data loader is unavailable, **Then** the page shows a clear fallback state rather than a blank area.
3. **Given** a user navigates through the PlayHQ-driven pages, **When** the data layer updates, **Then** the existing navigation and page styling remain consistent.

---

### User Story 4 — Handle Refresh Failures Gracefully (Priority: P2)

As a site owner, I need failures to be visible and recoverable so broken refreshes do not silently break the site.

**Why this priority**: Live data refreshes will fail sometimes. Users should still get a clear, safe experience.

**Independent Test**: Simulate a failed refresh and verify the UI shows a stale banner or error state while preserving the last successful live dataset.

**Acceptance Scenarios**:

1. **Given** the live refresh cannot fetch new PlayHQ data, **When** a user opens the homepage or `/scores`, **Then** the page shows the most recent successful data if available and marks it stale when the latest successful refresh is older than the freshness threshold.
2. **Given** no previous successful data exists, **When** the live refresh fails, **Then** the page shows a clear error or empty state.
3. **Given** a refresh fails, **When** logs are inspected, **Then** the failure is easy to diagnose from structured output.

---

## Edge Cases

- PlayHQ API times out or returns non-2xx responses.
- The live JSON file is missing, partially written, or malformed.
- The homepage or `/scores` is opened while the live data fetch is in progress.
- The client loses network connectivity after page load.
- A refresh publishes newer data while the user is already viewing the page.
- Rapid successive refreshes occur while the previous one is still running.
- The server path for live JSON changes or the upload path is misconfigured.
- Live data is available, but one or more records are missing optional fields.
- A full site deploy happens while a data-only refresh is in progress.

---

## Requirements

### Functional Requirements

- **FR-001**: The homepage PlayHQ scores carousel MUST load from a public live data asset rather than from build-time-only JSON.
- **FR-002**: The `/scores` page MUST load its PlayHQ data from a public live data asset rather than from build-time-only JSON.
- **FR-003**: Game detail pages under `/scores/[gameId]` MUST be able to resolve their content from the same live data source.
- **FR-004**: The live data refresh path MUST update only the PlayHQ data assets and MUST NOT require a full Astro site build.
- **FR-005**: The normal site build/deploy workflow MUST remain available for code and layout changes.
- **FR-006**: Live data updates MUST be visible to visitors after the next client fetch/poll cycle without waiting for a full rebuild.
- **FR-007**: Live data JSON assets MUST be served with cache semantics that allow the next client poll to observe fresh data without relying on stale browser or intermediary caches (for example, `Cache-Control: no-store` or an equivalent cache-busting strategy).
- **FR-008**: If live data refresh fails, the site MUST continue to render using the last successful dataset when one exists.
- **FR-009**: If no prior successful dataset exists, the site MUST show a safe empty/error state instead of throwing a runtime error.
- **FR-010**: Live data refresh jobs MUST run on a short schedule suitable for game-day updates (target: every 5 minutes while active).
- **FR-011**: Live data refresh jobs MUST also support manual triggering for ad-hoc updates.
- **FR-012**: Refresh logs MUST clearly identify the operation, status, and failure reason.
- **FR-013**: Secrets required for PlayHQ access MUST remain server-side only and MUST NOT be exposed to the browser.


### Non-Functional Requirements

- **NFR-001**: The homepage and `/scores` MUST remain usable on mobile, tablet, and desktop without layout regressions.
- **NFR-002**: The live data UI MUST remain keyboard accessible and preserve visible focus states.
- **NFR-003**: The live data fetch path MUST not block first paint for the entire page shell.
- **NFR-004**: The refactor MUST avoid adding unnecessary runtime dependencies.
- **NFR-005**: The solution MUST preserve existing brand styling and page structure.
- **NFR-006**: Refresh errors MUST be understandable to maintainers and not silently fail.

### Key Entities

**Live Data Asset**

A publicly served JSON file that contains the latest PlayHQ-derived data and can be refreshed independently of the site build.

Canonical live assets:
- `/live-data/home-games.json` — homepage carousel data
- `/live-data/scores.json` — `/scores` page data
- `/live-data/game-details.json` — optional shared detail payload if needed

| Field | Type | Description |
|---|---|---|
| `generatedAt` | `string` | ISO timestamp of the refresh |
| `status` | `success\|stale\|error` | Current freshness state |
| `data` | `object` | The PlayHQ payload used by the page |
| `error` | `object\|null` | Structured error details when refresh fails |

**Live Refresh Job**

A scheduled or manual job that fetches PlayHQ data and publishes the live JSON assets to the production host.

| Field | Type | Description |
|---|---|---|
| `operation` | `string` | Refresh action name |
| `triggeredAt` | `string` | ISO timestamp |
| `status` | `string` | `success`, `stale`, or `error` |
| `message` | `string` | Human-readable summary |
| `windowStart` | `string\|null` | Optional date window start |
| `windowEnd` | `string\|null` | Optional date window end |
| `freshnessThresholdMinutes` | `number` | Maximum age before the UI should mark data as stale |

**Rendered PlayHQ Surface**

The homepage carousel, `/scores`, and game detail views that consume the live data asset.

---

## Success Criteria

- **SC-001**: PlayHQ score and fixture updates can be published without running a full site rebuild.
- **SC-002**: The homepage and `/scores` reflect refreshed PlayHQ data within the expected polling/refresh window.
- **SC-003**: The site remains functional when live data refresh fails.
- **SC-004**: The data-only refresh path is clearly separable from the full deploy path.
- **SC-005**: Existing UI styling, navigation, and accessibility patterns remain intact.
- **SC-006**: Maintainers can identify refresh failures from logs without reverse engineering the pipeline.

---

## Acceptance Criteria

1. **Given** PlayHQ data changes, **When** the live refresh job runs successfully, **Then** the updated data is published without a full Astro rebuild.
2. **Given** the homepage is open, **When** the live JSON changes on the server, **Then** the carousel can show the new data on the next client refresh cycle.
3. **Given** the `/scores` page is open, **When** the live JSON changes on the server, **Then** the page can show the new data on the next client refresh cycle.
4. **Given** the live refresh fails, **When** the site renders, **Then** the last successful dataset is still shown when available.
5. **Given** no successful dataset exists, **When** a refresh fails, **Then** the user sees a safe error or empty state.
6. **Given** a user navigates the site with keyboard only, **When** they reach the PlayHQ-driven pages, **Then** the pages remain focusable and accessible.
7. **Given** maintainers inspect the refresh logs, **When** a refresh succeeds or fails, **Then** the output clearly shows the job status and reason.
