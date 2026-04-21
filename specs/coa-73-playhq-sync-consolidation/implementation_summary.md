# COA-73 Implementation Summary

## What changed
- Consolidated the separate PlayHQ GitHub Actions workflows into a single orchestrator for the static refresh path: `.github/workflows/playhq-sync.yml`.
- Restored live score polling to its own lightweight workflow: `.github/workflows/live-scores-poll.yml`.
- Kept the static workflow focused on the data that must drive rebuilds:
  - teams
  - scores
  - weekly fixtures
  - home data
  - round files
- Kept live polling lightweight so it can run on the 2-minute cadence without doing the expensive full refresh steps.
- Updated the deploy workflow to avoid overwriting `public/live-data/live-scores.json` during the normal site deploy.
- Added a `workflow_run` dependency so the deploy workflow runs after `PlayHQ Sync` completes successfully, ensuring refreshed JSON data actually gets rebuilt into the site.
- Hardened the deploy checkout so workflow runs always build from the latest branch ref, not the older sync SHA.
- Preserved the existing output contract for the site:
  - `public/live-data/fixtures.json`
  - `public/live-data/completed-scores.json`
  - `public/live-data/home-games.json`
  - `public/live-data/rounds/*`
  - `public/live-data/live-scores.json`

## Schedule
- Static workflow runs on:
  - `30-59/10 5 * * 1,2,3,5`
  - `*/10 6-13 * * 1,2,3,5`
  - `5 14 * * 6`
  - `0 14 * * 0`
  - `0 15 * * 0`
- Live poll workflow runs on:
  - `*/2 6-13 * * 1,2,3,5`

## Notes
- The static workflow is the source of truth for refreshed site data and round files, and it triggers the site deploy once the data commit lands on `main`.
- The live poll workflow only updates the live overlay and deploys that overlay file.
- Teams data is included in the static sync flow, which should prevent stale team pages.
