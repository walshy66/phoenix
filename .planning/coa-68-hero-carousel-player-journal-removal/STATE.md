# STATE — coa-68-hero-carousel-player-journal-removal

## Feature Metadata
- Branch: `cameronwalsh/coa-68-hero-carousel-player-journal-removal`
- Spec: `specs/coa-68-hero-carousel-player-journal-removal/spec.md`
- Status: implementation in progress

## Execution Windows

### Window 1 — Hero Carousel Content Update
- Status: in progress
- Tasks:
  - T001 Add regression test for hero carousel slide list
  - T002 Remove `player_journal` from `src/pages/index.astro`
- Verification: `src/components/__tests__/coa-67-fixes.test.ts`

## Notes
- Small frontend-only change.
- Goal is to remove the `player_journal` slide while preserving the other hero slides.
