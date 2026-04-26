# STATE — coa-88-add-coaching-resources

## Feature Metadata
- Branch: `cameronwalsh/coa-88-add-coaching-resources`
- Spec: `specs/coa-88-add-coaching-resources/spec.md`
- Status: complete

## Execution Windows

### Window 1 — Carousel modal + player/coaching resource integration
- Status: complete
- Evidence:
  - Added `src/components/PositionResponsibilitiesCarousel.astro` as the modal carousel controller
  - Added the position responsibilities resource as a normal resource card in both the player and coaching sections of `src/pages/resources/index.astro`
  - Added a new player resources Facebook reel card for rebounding with all age groups in `src/data/player-resources.json`
  - Added six static JPEG assets under `public/images/positions/` copied from `upload/roles_*.jpeg`
  - Added `src/components/__tests__/PositionResponsibilitiesCarousel.test.ts`
  - `npm test` passes
  - `npm run build` passes

## Notes
- Implementation reuses the existing `/resources` player and coaching tabs and modal patterns.
- The new rebounding reel card is included via the player resources data source and inherits the existing filter chips.
