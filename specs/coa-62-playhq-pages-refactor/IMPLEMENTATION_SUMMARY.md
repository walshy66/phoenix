# Implementation Summary — COA-62 PlayHQ Pages Refactor

## Feature
- Linear: COA-62
- Branch: `cameronwalsh/coa-62-playhq-pages-refactor`
- Target: PlayHQ-driven pages refactor for live updates without full rebuilds

## Delivered
- Live PlayHQ JSON contract helpers and server-safe snapshot loaders.
- Homepage scores carousel now fetches/polls `/live-data/home-games.json`.
- `/scores` now fetches/polls `/live-data/scores.json`.
- `/scores/[gameId]` resolves from the same live scores source and continues to build statically from the current snapshot.
- `public/live-data/.htaccess` disables caching so refreshed JSON is visible on the next poll.
- Data-only GitHub Actions workflow publishes only `public/live-data/`.
- Handover docs updated with the separation between full deploy and data refresh.

## Key Files
- `src/lib/playhq/contracts.ts`
- `src/lib/playhq/live-data.ts`
- `src/lib/playhq/server-live-data.ts`
- `src/lib/playhq/renderers.ts`
- `src/components/HomeScoresCarousel.astro`
- `src/pages/index.astro`
- `src/pages/scores.astro`
- `src/pages/scores/[gameId].astro`
- `public/live-data/.htaccess`
- `public/live-data/home-games.json`
- `public/live-data/scores.json`
- `.github/workflows/playhq-refresh-deploy.yml`

## Validation Evidence
- Targeted PlayHQ tests passing:
  - `npx vitest run src/lib/playhq/contracts.test.ts src/lib/playhq/live-data.test.ts src/lib/scores/contracts.test.ts src/lib/scores/rendering.test.ts src/lib/home-scores/contracts.test.ts src/lib/home-scores/details.test.ts`
- UI touch-up regression check passing:
  - `npx vitest run src/components/__tests__/ui-touch-up.test.ts`
- Build passing:
  - `npm run build`

## Acceptance Notes
- Data refresh is now decoupled from the full site build.
- Browser polling plus server cache headers ensure fresh live data is visible without a rebuild.
- A full static build still succeeds for normal content/layout deploys.

## Known Existing Repo Baseline Issues (Out of Scope)
- `npm test` still reports one pre-existing unrelated failure in `src/lib/events/parser.test.ts`.
- That failure predates COA-62 and is not caused by this feature.
