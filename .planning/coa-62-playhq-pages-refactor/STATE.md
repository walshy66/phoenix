# STATE — COA-62 PlayHQ Pages Refactor

## Feature Metadata
- Issue: COA-62
- Title: playhq pages refactor
- Branch: `cameronwalsh/coa-62-playhq-pages-refactor`
- Spec: `specs/coa-62-playhq-pages-refactor/spec.md`
- Plan: `specs/coa-62-playhq-pages-refactor/plan.md`
- Tasks: `specs/coa-62-playhq-pages-refactor/tasks.md`
- Status: Building
- Initialized: 2026-04-16

## Constitution Check
- Constitution file present: yes
- Test-first discipline: required
- AppShell integrity: required
- Accessibility: required
- Immutable data flow: required
- Dependency hygiene: required

## Window Progress

### Window 1 — Live Data Contract
- Status: complete
- Tasks: 1.1, 1.2
- Evidence: `src/lib/playhq/contracts.ts`, `src/lib/playhq/server-live-data.ts`, `src/lib/playhq/live-data.ts`, targeted vitest pass

### Window 2 — Page Refactor
- Status: complete
- Tasks: 2.1, 2.2, 2.3
- Evidence: `src/pages/index.astro`, `src/components/HomeScoresCarousel.astro`, `src/pages/scores.astro`, `src/pages/scores/[gameId].astro` now fetch and poll live JSON with safe fallback rendering

### Window 3 — Data-Only Refresh Pipeline
- Status: complete
- Tasks: 3.1, 3.2, 3.3
- Evidence: `public/live-data/.htaccess`, `public/live-data/*.json`, `.github/workflows/playhq-refresh-deploy.yml` now publish live JSON only and preserve cache freshness semantics

### Window 4 — Validation & Handover
- Status: complete
- Tasks: 4.1, 4.2
- Evidence: `npm run build` pass, targeted tests pass, handover docs updated

## Notes
- Full deploy and data-only refresh workflows remain separate.
- Live JSON caching behavior uses no-store fetch + server cache headers.
- `npm test` still has pre-existing unrelated failures outside COA-62 scope.
