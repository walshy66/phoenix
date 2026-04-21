# COA-73 Implementation Summary

## What changed
- Consolidated the separate PlayHQ GitHub Actions workflows into a single orchestrator workflow: `.github/workflows/playhq-sync.yml`.
- Split the new workflow into two jobs:
  - `refresh-static-data` for teams, scores, weekly fixtures, home data, and round files
  - `poll-live-scores` for the live score overlay only
- Kept live polling lightweight so it can run on the 2-minute cadence without doing the expensive full refresh steps.
- Updated the deploy workflow to avoid overwriting `public/live-data/live-scores.json` during the normal site deploy.
- Added a `workflow_run` dependency so the deploy workflow runs after `PlayHQ Sync` completes successfully, ensuring refreshed JSON data actually gets rebuilt into the site.
- Preserved the existing output contract for the site:
  - `public/live-data/fixtures.json`
  - `public/live-data/completed-scores.json`
  - `public/live-data/home-games.json`
  - `public/live-data/rounds/*`
  - `public/live-data/live-scores.json`

## Schedule
- Static job runs on:
  - `5 14 * * 6`
  - `0 14 * * 0`
  - `0 15 * * 0`
- Live poll job runs on:
  - `*/2 6-13 * * 1,2,3,5`

## Notes
- The static job is the source of truth for refreshed site data and round files.
- The live poll job only updates the live overlay and deploys that overlay file.
- Teams data is now included in the same unified PlayHQ sync flow, which should prevent stale team pages.
