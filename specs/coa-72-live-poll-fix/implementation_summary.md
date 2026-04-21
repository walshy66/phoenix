# COA-72 Implementation Summary

## What changed
- Fixed the GitHub Actions live poll workflow so the production runner installs `lftp` before attempting to deploy the live scores overlay.
- Kept the live polling script unchanged; it still writes `public/live-data/live-scores.json` and deploys it when FTPS credentials are present.
- Created the feature scaffold for COA-72:
  - `specs/coa-72-live-poll-fix/spec.md`

## Root cause
The prod workflow was failing with:
- `spawnSync lftp ENOENT`

That meant the runner did not have `lftp` installed, so the deploy step inside `scripts/poll-live-scores.js` could not upload the generated live scores file.

## Verification
- Workflow diff reviewed to confirm `lftp` is installed before the poll step.
- The branch was pushed to `origin/coa-72-live-poll-fix`.

## Notes
- This fix only addresses the workflow deploy failure.
- If the workflow still reports `count: 0`, that is a separate data-selection issue and depends on the configured PlayHQ season IDs and whether games are currently in progress.
