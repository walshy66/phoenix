# Tasks: Hero Carousel - Player Journal Removal

**Input**: Specs from `/specs/coa-68-hero-carousel-player-journal-removal/`
**Strategy**: Single execution window (small frontend-only change)
**Windows**: 1

---

## Execution Window 1: Hero Carousel Content Update

**Purpose**: Remove the `player_journal` slide from the home page hero carousel and verify the change with a regression test.

**Token Budget**: 20-30k

**Checkpoint Validation**:
- [ ] `src/pages/index.astro` no longer includes `player_journal.png`
- [ ] Regression test passes for the hero slide list
- [ ] Hero carousel still renders the remaining slides normally

### T001 [P] Add regression test for hero carousel slide list

**Window**: 1 (Hero Carousel Content Update)
**Phase**: Tests
**Traceability**: AC-1, AC-2, AC-3
**Dependencies**: None
**Description**: Add or extend a Vitest regression test in `src/components/__tests__/coa-67-fixes.test.ts` to assert the home page hero slide list does not contain `player_journal.png` and still includes the other expected hero slides.

**What to create/modify**:
- File: `src/components/__tests__/coa-67-fixes.test.ts`
- Add expectations for:
  - `player_journal.png` is absent from `src/pages/index.astro`
  - `players_needed.png`, `training.png`, and `volunteers_heros.png` remain present

**Test**: Run the specific Vitest file and confirm the new assertion fails before implementation and passes after.

### T002 Update home page hero slide list

**Window**: 1 (Hero Carousel Content Update)
**Phase**: Implementation
**Traceability**: AC-1, AC-2, AC-3
**Dependencies**: T001
**Description**: Remove the `player_journal` entry from the `heroSlides` array in `src/pages/index.astro` so the carousel no longer renders that image.

**What to modify**:
- File: `src/pages/index.astro`
- Remove the slide entry:
  - `image: '/images/hero/player_journal.png'`
  - `alt: 'Player journal feature graphic'`

**Test**: Re-run the regression test and confirm the hero carousel still renders with the remaining slides.

---

## Checkpoint

**Window 1 complete when**:
- Regression test passes
- `player_journal.png` is removed from the home page hero slides
- No layout or rendering regressions are introduced in the hero section
