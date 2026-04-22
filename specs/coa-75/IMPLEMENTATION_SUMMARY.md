# COA-75 Implementation Summary

## What changed
- Removed the stale data banner from the home page latest-results carousel.
- Kept the carousel rendering the cached/home scores content so the section still displays results without the temporary availability message.
- Added regression coverage in `src/lib/playhq/renderers.test.ts` to ensure the stale message no longer appears in the home page output.

## Files updated
- `src/lib/playhq/renderers.ts`
- `src/lib/playhq/renderers.test.ts`

## Validation
- `npm test` ✅

## Notes
- The home page now shows the latest results carousel without the “Showing last known results. Live refresh is temporarily unavailable.” banner.
