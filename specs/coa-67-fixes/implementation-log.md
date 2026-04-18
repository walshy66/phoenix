# Implementation Log — COA-67 Fixes

## Summary of Changes
- `src/pages/index.astro`
  - Team quick link now points to `/teams/`
  - Team card text changed to `Teams` and `Your team results and ladder`
  - Coaching Resources card now points to `/resources/`
- `src/components/SeasonInfoModal.astro`
  - Uniform and registration cards now use `object-contain` and responsive sizing to prevent cropping on mobile
- `src/components/FilterBar.astro`
  - Added mobile toggle button and hidden-by-default filter panel on mobile
  - Kept desktop filter layout visible via responsive classes
- `src/pages/teams.astro`
  - Filter row now wraps on mobile
- `src/pages/contact.astro`
  - Email rows now stack on mobile, align left, and avoid overflow
- `src/components/__tests__/coa-67-fixes.test.ts`
  - Added regression checks for all COA-67 fixes

## Verification Notes
- Targeted vitest suite passes.
- Full `npm test` run currently reports unrelated existing failures in `src/lib/events/parser.test.ts` and `src/components/__tests__/resource-merge.test.ts`.
