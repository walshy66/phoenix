# Implementation Summary — COA-65 Correct Guides

## What was implemented

### Guides data update
- Replaced the existing `src/data/guides.json` contents with the full set of 15 guide resources.
- Added the 5 new uploaded guide documents:
  - Bridging Fund Coordinator
  - Child Safety Officer
  - Coach Coordinator
  - Event Coordinator
  - Treasurer
- Kept the full guides list alphabetically ordered by title.

### Asset handling
- Copied the uploaded guide files into `public/resources/guides/` so they are available to the Resources page at runtime.

### Regression coverage
- Added `src/data/__tests__/guides.test.ts` to verify:
  - the guides list contains exactly 15 items
  - the titles remain in alphabetical order

## Validation
- ✅ `npx vitest run src/data/__tests__/guides.test.ts`
- ✅ `npm run validate-resources`
- ✅ `npm run build`
- ⚠️ `npm test` still reports unrelated pre-existing failures in:
  - `src/components/__tests__/resource-merge.test.ts`
  - `src/lib/events/parser.test.ts`

## Result
The `/resources` Guides tab now includes the 5 additional `GUIDE_` documents and the guides are ordered alphabetically.
