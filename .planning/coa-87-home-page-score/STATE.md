# STATE — coa-87-home-page-score

## Feature Metadata
- Branch: `cameronwalsh/coa-87-home-page-score`
- Spec: `specs/coa-87-home-page-score/spec.md`
- Status: in progress

## Execution Windows

### Window 1 — Tests First / Regression Guards
- Status: complete
- Evidence:
  - Added `src/components/__tests__/coa-87-home-page-score.test.ts`
  - Added `src/components/__tests__/coa-87-home-page-score.regression.test.ts`
  - Verified tests fail against the pre-implementation homepage

### Window 2 — Homepage Toggle & Render Gating
- Status: complete
- Evidence:
  - Added `src/lib/home-scores/feature-flags.ts`
  - Updated `src/pages/index.astro` to gate the homepage score carousel behind the central toggle
  - Verified the homepage build output does not include the Latest Results section when the toggle is off

### Window 3 — Validation & Hand-off Notes
- Status: complete
- Evidence:
  - Added `specs/coa-87-home-page-score/quickstart.md`
  - `npm test` passes
  - `npm run build` passes

## Notes
- The homepage score carousel is intended to remain available for re-enablement via the central toggle.
