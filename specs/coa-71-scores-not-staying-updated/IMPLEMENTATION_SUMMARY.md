# COA-71 Implementation Summary

## What changed
- Restored the Scores page layout with the Monday / Tuesday / Wednesday / Friday day columns and round ordering.
- Added round-file infrastructure for published score data:
  - `src/lib/scores/round-file.ts`
  - `src/lib/scores/round-navigation.ts`
  - `src/lib/scores/game-window.ts`
  - `scripts/write-round-files.js`
  - `scripts/check-round-files.js`
- Updated the deployment pipeline to publish the correct live-data artifacts:
  - weekly fixtures as `public/live-data/fixtures.json`
  - completed scores as `public/live-data/completed-scores.json`
  - home carousel data as `public/live-data/home-games.json`
- Added scheduled workflows for:
  - weekly round finalisation
  - live score polling
- Added live score overlay support on the home carousel via `public/live-data/live-scores.json`.
- Made completed game cards clickable from the Scores page and the Teams page, both landing on the shared `/scores/{gameId}` detail route.
- Reworked the game detail rendering so completed games show player stats when available, with team-grouped sections.
- Updated team page game rows to link through to the same scores detail page and show W/L/D badges correctly.
- Fixed team ladder loading so it uses flattened real ladder data rather than placeholder rows.
- Added mobile-friendly spacing and sizing improvements to the Scores detail view so the shared detail page works cleanly on small screens.
- Reduced player statistics to the league-recorded fields only: `PTS` and `PF`.

## Notes
- Home-page live refresh now merges the live overlay data into the carousel, but the stale banner still depends on the freshness of the base `home-games.json` snapshot.
- If the snapshot is older than the configured threshold, the page will continue to show the "Showing last known results" banner even when the live overlay is present.

## Verification
- `npm test` passes.
- The feature has been validated in dev across:
  - Scores page
  - Scores detail page
  - Teams page schedule links
  - Home carousel live overlay
