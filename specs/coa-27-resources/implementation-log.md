# Implementation Log — COA-27

## 2026-04-13
- Initialized implementation artifacts
- Completed foundation edits (types + gitignore)
- Implemented `ResourceModal.astro` and added modal harness tests
- Wired modal behavior into `/resources` cards (coaching/player/manager)
- Added sourceDomain card labels + placeholder "Coming soon" card state
- Implemented `scripts/merge-resources.js` + full merge logic tests
- Added npm scripts: `resources:merge` and `resources:scrape`
- Implemented `scripts/scrape-resources.js` and generated reviewed candidate file
- Merged approved reviewed entries into `src/data/coaching-resources.json` (8 entries)
- Verified merge idempotency (second run adds 0)
- Build passes; full test suite still has 2 pre-existing unrelated failures
