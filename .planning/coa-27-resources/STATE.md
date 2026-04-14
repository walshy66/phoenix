# COA-27 Implementation State

- Feature: `coa-27-resources`
- Branch: `cameronwalsh/coa-27-resources`
- Status: In Progress
- Started: 2026-04-13

## Window Status

- [x] Window 1 — Foundation
- [x] Window 2 — ResourceModal component + tests
- [x] Window 3 — Resources page wiring + QA
- [x] Window 4 — Merge script + tests + smoke
- [x] Window 5 — Scrape script + live run

## Evidence Log

### Window 1
- Added `sourceDomain?: string` and `CandidateResource` in `src/lib/resources/types.ts`
- Added candidates path to `.gitignore`

### Window 2
- Added `src/components/__tests__/ResourceModal.test.ts` (21 modal behavior tests)
- Added `src/components/ResourceModal.astro` with:
  - focus trap + Escape close + backdrop close
  - video iframe embedding (YouTube/Vimeo conversion)
  - PDF/object embed + download button
  - video/PDF fallback messaging

### Window 3
- Updated `src/pages/resources/index.astro` to:
  - render one shared `<ResourceModal />`
  - route non-link resources into modal via delegated click events
  - keep links as new-tab behavior
  - disable placeholder `url: '#` cards with `Coming soon`
  - show `sourceDomain` labels when present

### Window 4
- Added `src/components/__tests__/resource-merge.test.ts` (12 merge tests)
- Added `scripts/merge-resources.js` (pure functions + CLI)
- Added npm scripts: `resources:merge`, `resources:scrape`
- Smoke-tested merge idempotency against candidate fixtures

### Window 5
- Added `scripts/scrape-resources.js` (manual one-time scraper)
- Ran scrape and produced candidate file at:
  - `specs/coa-27-resources/candidates/candidates-2026-04-13.json`
- Completed review + approval statuses in candidate file
- Ran merge twice:
  - first run added 8 coaching resources
  - second run added 0 (idempotent), all approved URLs skipped as duplicates

## Validation Notes

- `npm run build` passes
- Targeted new tests pass:
  - `ResourceModal.test.ts`
  - `resource-merge.test.ts`
- `npm test` has 2 pre-existing unrelated failures in seasons/events suites
