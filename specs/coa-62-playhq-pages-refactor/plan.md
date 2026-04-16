# Implementation Plan: COA-62 — PlayHQ Pages Refactor

**Branch**: `cameronwalsh/coa-62-playhq-pages-refactor` | **Date**: 2026-04-16 | **Spec**: `specs/coa-62-playhq-pages-refactor/spec.md`

---

## Summary

Refactor the PlayHQ-driven pages so live score/fixture updates can be published independently of the full Astro site build.

The implementation will separate the PlayHQ data refresh path from the normal site deploy path:

- **Full site deploy** remains available for code/layout/content changes.
- **Data-only refresh** publishes PlayHQ JSON assets on a short schedule.
- The homepage, `/scores`, and game detail surfaces read from the live data assets instead of relying on build-time only JSON.

The simplest durable architecture is a static public JSON endpoint served from the existing cPanel host, with client-side fetch/poll updates for the PlayHQ sections.

---

## Technical Context

- **Runtime**: Node.js `>=22.12.0`
- **Frontend**: Astro `6.1.1`
- **Styling**: Tailwind CSS `4.2.2`
- **Deployment**: GitHub Actions + FTPS to VentraIP cPanel
- **Data Source**: PlayHQ REST API (read-only)
- **Storage**: Public JSON assets on the existing host
- **Testing**: Manual browser validation plus workflow smoke tests
- **Target routes**: `/`, `/scores`, `/scores/[gameId]`
- **Performance goal**: data refresh should not require a full site build

---

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I — User Outcomes First | PASS | Solves the slow-update pain point directly |
| II — Test-First Discipline | PASS | Acceptance criteria are explicit and independently testable |
| III — Backend Authority | PASS | PlayHQ remains the source of truth |
| IV — Error Semantics | PASS | Stale/error states are required |
| V — AppShell Integrity | PASS | Existing site shell stays intact |
| VI — Accessibility First | PASS | Interactive surfaces must remain keyboard accessible |
| VII — Immutable Data Flow | PASS | Data refresh produces assets; UI consumes them read-only |
| VIII — Dependency Hygiene | PASS | No new dependencies required |
| IX — Cross-Feature Consistency | PASS | Follows existing Astro + GitHub Actions patterns |

---

## Project Structure

```text
specs/coa-62-playhq-pages-refactor/
├── spec.md
├── plan.md
└── tasks.md

public/
└── live-data/
    ├── scores.json          (new live PlayHQ payload)
    ├── home-games.json       (new live homepage payload)
    └── game-details.json     (optional shared detail payload)

src/
├── pages/
│   ├── index.astro          (modified to fetch live home data)
│   ├── scores.astro         (modified to fetch live score data)
│   └── scores/[gameId].astro (modified to resolve from live data)
├── components/
│   ├── HomeScoresCarousel.astro / .ts helpers (may need refactor)
│   └── ScoreCard.astro      (likely reused)
├── lib/
│   └── playhq/
│       ├── live-data.ts      (NEW — fetch/normalize/poll helpers)
│       ├── contracts.ts      (NEW or expanded — schema validation)
│       └── *.test.ts        (NEW — pure utilities)
└── scripts/
    ├── scrape-playhq.js      (existing, may be reused for generation)
    ├── scrape-home-games.js   (existing, may be reused for data shaping)
    └── publish-playhq.js     (NEW or workflow shell script helper)

.github/workflows/
├── deploy.yml                (existing full deploy)
└── playhq-refresh-deploy.yml (existing scheduled job; will be changed to data-only publish)
```

---

## Delivery Phases

### Phase 1 — Live Data Contract + Client Loader

**Goal**: define a stable JSON contract and the client-side loading path for the PlayHQ-driven surfaces.

- Define the public live-data schema for homepage and scores surfaces.
- Add fetch/normalize helpers so pages can load data from `/live-data/*.json`.
- Add safe fallback/stale handling for missing or malformed JSON.
- Add unit tests for the contract and transformer functions.

**Exit criteria**:
- Pure data helpers pass tests
- Live data asset shape is clearly defined
- Pages can render safely without build-time PlayHQ JSON

---

### Phase 2 — Page Refactor

**Goal**: update the PlayHQ-driven pages to use the live data loader.

- Refactor the homepage scores carousel to consume the live home data asset.
- Refactor `/scores` to consume the live score/fixture asset.
- Refactor `/scores/[gameId]` to resolve details from the live data source.
- Preserve existing layout, branding, and accessibility patterns.

**Exit criteria**:
- The three PlayHQ-driven surfaces still look and behave as expected
- They can render initial fallback content and then hydrate/live-update from JSON

---

### Phase 3 — Data-Only Refresh Pipeline

**Goal**: make the refresh workflow publish only the JSON assets.

- Update the scheduled workflow so it fetches PlayHQ data and uploads only the live JSON files.
- Ensure refresh failure preserves the last successful dataset when possible.
- Keep the full build/deploy workflow separate for code changes.
- Define a 5-minute refresh cadence during active game windows.

**Exit criteria**:
- Live data refresh completes without running `npm run build`
- Server-side public JSON files are updated directly
- Manual and scheduled refresh paths both work

---

### Phase 4 — Validation, Timing, and Handover

**Goal**: verify the refresh latency and document the operational model.

- Confirm the homepage and `/scores` update on the next client refresh cycle.
- Validate stale/error behaviour by simulating refresh failures.
- Document the separation between code deploy and data refresh.
- Update handover notes so maintainers know which job does what.

**Exit criteria**:
- Data changes are visible quickly enough for game-day usage
- The repo documents the architecture and operating model clearly

---

## Testing Strategy

### Automated

- Unit tests for:
  - live data schema validation
  - JSON parsing and fallback behavior
  - game lookup helpers for `/scores/[gameId]`
  - transformation of live data into homepage carousel cards

### Manual

- Trigger the data-only refresh workflow and confirm no full build runs.
- Verify homepage updates from the live data asset after refresh.
- Verify `/scores` updates from the live data asset after refresh.
- Verify game detail pages still resolve correctly.
- Simulate a missing/invalid JSON file and confirm safe fallback rendering.

---

## Risks & Mitigations

1. **Client-side data fetch complexity**
   - Mitigation: keep the data contract small and provide SSR-safe fallback markup.
2. **Refresh race conditions**
   - Mitigation: publish data atomically where possible, or upload to a temp path before swap.
3. **Stale data confusion**
   - Mitigation: surface a clear stale banner when the last successful dataset is older than expected.
4. **Game detail routing mismatch**
   - Mitigation: use a shared live data source for both the list and detail surfaces.
5. **Performance regressions**
   - Mitigation: keep the live loader lightweight and avoid additional dependencies.

---

## Complexity Tracking

- Accepted:
  - separate live data assets from site build artifacts
  - client-side refresh path for PlayHQ-driven sections
- Rejected:
  - introducing a backend service or database
  - full SSR rebuilds for every score update
  - adding a new UI framework

---

## Next Step

Run the tasks phase to break the plan into execution windows with test-first ordering.
