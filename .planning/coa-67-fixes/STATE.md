# STATE — coa-67-fixes

## Feature Metadata
- Branch: `cameronwalsh/coa-67-fixes`
- Spec: `specs/coa-67-fixes/spec.md`
- Status: implementation in progress / awaiting final review

## Execution Windows

### Window 1 — Home Page Card Fixes
- Status: complete
- Evidence: `src/pages/index.astro` updated with `/teams/` and `/resources/` links plus revised team card text
- Verification: `src/components/__tests__/coa-67-fixes.test.ts` passes

### Window 2 — Modal Image Display Fixes
- Status: complete
- Evidence: `src/components/SeasonInfoModal.astro` updated to use `object-contain` and responsive sizing for uniform/registration images
- Verification: `src/components/__tests__/coa-67-fixes.test.ts` passes

### Window 3 — Filter Layout Fixes
- Status: complete
- Evidence: `src/components/FilterBar.astro` now collapses on mobile; `src/pages/teams.astro` filter row now wraps
- Verification: `src/components/__tests__/coa-67-fixes.test.ts` passes

### Window 4 — Contact Page Email Alignment
- Status: complete
- Evidence: `src/pages/contact.astro` email rows now stack on mobile and remain within the card boundary
- Verification: `src/components/__tests__/coa-67-fixes.test.ts` passes

## Notes
- Targeted tests for COA-67 pass.
- Full repository test suite currently has unrelated pre-existing failures outside this feature scope.
