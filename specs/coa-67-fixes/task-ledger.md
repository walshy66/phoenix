# Task Ledger — COA-67 Fixes

## Completed
- Updated home page quick links for Teams and Coaching Resources
- Added responsive image containment to uniform/registration season modals
- Added mobile filter collapse behavior to resources filter bar
- Enabled wrapping behavior for teams filter row on mobile
- Reworked contact email rows so they stay inside the card on mobile
- Added focused regression tests for the above changes

## Verification
- `npx vitest run src/components/__tests__/coa-67-fixes.test.ts src/components/__tests__/ui-touch-up.test.ts src/components/__tests__/seasons.responsive.test.ts src/components/__tests__/seasons.training-info.test.ts`
  - Passed
- `npm test`
  - Fails in unrelated pre-existing suites outside COA-67 scope
