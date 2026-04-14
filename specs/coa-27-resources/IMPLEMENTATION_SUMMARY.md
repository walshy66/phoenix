# COA-27 Implementation Summary

## Completed

All implementation windows were executed end-to-end.

### Window 1 — Foundation
- Updated `src/lib/resources/types.ts`
  - Added `sourceDomain?: string` to `Resource`
  - Added `CandidateResource` interface
- Updated `.gitignore`
  - Added `specs/coa-27-resources/candidates/`

### Window 2 — Modal Component
- Added `src/components/ResourceModal.astro`
  - Accessible dialog semantics (`role="dialog"`, `aria-modal`, `aria-labelledby`)
  - Focus trap, Escape close, backdrop close, focus return
  - Video embedding support (YouTube/Vimeo conversion)
  - PDF/document embedding + download action
  - Fallback UI for video timeout and PDF load failure
- Added `src/components/__tests__/ResourceModal.test.ts` (21 tests)

### Window 3 — Page Wiring
- Updated `src/pages/resources/index.astro`
  - Imported/rendered `<ResourceModal />`
  - Added `data-resource-*` attributes on cards
  - Added delegated modal-open click handling for non-link resources
  - Preserved link resources as external-tab behavior
  - Added placeholder non-interactive `Coming soon` state for `url: "#"`
  - Added `sourceDomain` label rendering on cards when present

### Window 4 — Merge Pipeline
- Added `scripts/merge-resources.js`
  - Pure exported functions + CLI entrypoint
  - Validates approved entries
  - Rejects uncategorised approved entries
  - Rejects invalid audience values
  - Idempotent duplicate skip by URL
  - Appends into coaching/player JSON data files
- Added `src/components/__tests__/resource-merge.test.ts` (12 tests)
- Added npm scripts in `package.json`
  - `resources:merge`
  - `resources:scrape`

### Window 5 — Scrape + Review + Merge
- Added `scripts/scrape-resources.js`
- Ran scrape output:
  - `specs/coa-27-resources/candidates/candidates-2026-04-13.json`
- Performed review/approval updates in candidate file
- Ran merge twice:
  - First run: added 8 coaching entries
  - Second run: added 0, all approved candidates skipped as duplicates (idempotent)

## Validation

- ✅ `npm run build` passes
- ✅ New targeted tests pass:
  - `npx vitest run src/components/__tests__/ResourceModal.test.ts src/components/__tests__/resource-merge.test.ts`
- ⚠️ `npm test` has 2 unrelated pre-existing failures in:
  - `src/lib/seasons/constants.test.ts`
  - `src/lib/events/parser.test.ts`

## Key Output Files

- `src/components/ResourceModal.astro`
- `src/components/__tests__/ResourceModal.test.ts`
- `scripts/merge-resources.js`
- `scripts/scrape-resources.js`
- `src/components/__tests__/resource-merge.test.ts`
- `specs/coa-27-resources/candidates/candidates-2026-04-13.json`
