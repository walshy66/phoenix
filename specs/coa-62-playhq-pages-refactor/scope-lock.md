# Scope Lock — COA-62 PlayHQ Pages Refactor

## Locked In Scope
- Refactor PlayHQ-driven pages so live updates can be published without rebuilding the entire Astro site.
- Move the homepage PlayHQ scores carousel to a live JSON-backed data source.
- Move `/scores` to a live JSON-backed data source.
- Keep `/scores/[gameId]` resolvable from the same live data source.
- Ensure the live data path uses safe initial snapshots/fallbacks and client polling.
- Ensure live JSON caching semantics allow fresh data to be observed on the next client poll.
- Preserve the existing site shell, styling, accessibility patterns, and navigation behavior.
- Preserve the separate full-deploy workflow for code/layout/content changes.
- Preserve stale/error fallback behavior when refreshes fail.

## Out of Scope
- Rebuilding the entire site on every PlayHQ refresh.
- Introducing a backend service, database, or new runtime framework.
- Changing unrelated pages or routes outside the PlayHQ-driven surfaces.
- Redesigning the site shell or navigation.
- Adding unnecessary third-party dependencies.

## Acceptance Gate
- Only the COA-62 spec acceptance criteria and task-ledger items are used for sign-off.
- The live data path must work without a full Astro rebuild.
- The full deploy workflow must remain available and separate from the data-only refresh path.
