# Task Ledger — COA-71 Scores Not Staying Updated

## Completed
- Fixed the PlayHQ refresh deploy workflow to publish `completed-scores.json`
- Renamed deployed weekly fixture output from `scores.json` to `fixtures.json`
- Updated the Scores page to read the renamed fixture file
- Updated the game detail page to read the renamed fixture file
- Updated the live-data test fixture path to `fixtures.json`
- Added round-file types and status normalisation helpers
- Added round file generation, validation, and workflow automation
- Rewrote the Scores page around round navigation and round-file loading
- Rewrote the game detail page around round-file loading
- Added live score polling infrastructure and live overlay merging
- Added tests for round navigation, round rendering, and game window gating

## Verification
- `grep -r "live-data/scores.json" src .github` returns no matches
- `npm test` passes (58 files / 578 tests)
- `npx tsc --noEmit` still reports unrelated pre-existing repo issues outside this feature
