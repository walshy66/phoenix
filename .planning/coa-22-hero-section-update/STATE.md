# State: Feature coa-22-hero-section-update

## Metadata
- Feature Slug: coa-22-hero-section-update
- Status: IN_PROGRESS
- Current Window: 4
- Start Time: 2026-04-10
- Branch: coa-22-hero-section-update

## Completed Windows

### Window 1: Core Carousel Architecture & CSS 3D Transforms
- Tasks completed: T001, T002, T003, T004, T005, T006 (T005/T006 embedded in T003)
- Checkpoint: PASS
- Test Results: 45 tests passing (T001: 31, T002: 14)
- Files Created:
  - src/components/__tests__/HeroCircularCarousel.routing.test.ts
  - src/components/__tests__/HeroCircularCarousel.animation.test.ts
  - src/components/HeroCircularCarousel.astro
  - src/pages/index.astro (modified)
  - public/images/phoenix-united-logo.png
  - public/images/hero/ (directory)

### Window 2: Navigation, Touch & Keyboard Interaction
- Tasks completed: T007, T008, T009, T010, T011, T012, T013
- Checkpoint: PASS
- Test Results: 62 tests passing (T004: 22, T007: 20, T008: 20)
- Files Created:
  - src/components/__tests__/HeroCircularCarousel.animation-timing.test.ts
  - src/components/__tests__/HeroCircularCarousel.buttons.test.ts
  - src/components/__tests__/HeroCircularCarousel.touch.test.ts
- Notes:
  - TOTAL_DURATION fixed to 600ms (was incorrectly calculated)
  - Touch swipe, keyboard nav, button click handlers all use shared queue

### Window 3: Keyboard Navigation Polish, aria-disabled, Responsive Layout
- Tasks completed: T009 (keyboard tests), T010 (aria-disabled + focus), T011 (responsive tests + CSS)
- Checkpoint: PASS
- Test Results: 148 tests passing across 7 test files (all green)
- Files Created:
  - src/components/__tests__/HeroCircularCarousel.keyboard.test.ts (24 tests)
  - src/components/__tests__/HeroCircularCarousel.responsive.test.ts (31 tests)
- Files Modified:
  - src/components/HeroCircularCarousel.astro:
    - aria-disabled="false" initial attr on prev/next buttons
    - setButtonsAriaDisabled() wired to goTo() start/end
    - lastFocusedButton tracking + focus restoration after animation
    - trackButtonFocus() called on button click events
    - CSS: aria-disabled="true" → opacity 0.5 (buttons remain clickable for queue)
    - CSS: breakpoint-specific responsive widths (mobile/tablet/desktop/ultra-wide)

## Current Window: 4 (Logo Decal, Image Optimization)

### Pending Tasks (from tasks.md Window 3 scope)
- [ ] T014: Write contract tests for logo decal visibility and positioning
- [ ] T015/T016: Image loading tests (eager, lazy, format) — HeroCircularCarousel.image-loading.test.ts
- [ ] T017: Logo asset verification + decal CSS (already partially done)
- [ ] T018: Confirm responsive sizing is complete (done in Window 3 above)

### Remaining Windows (4 & 5 from original plan)
- Window 4: Logo decal tests, image loading tests, auto-advance, dot navigation
- Window 5: Final integration, accessibility audit, performance validation

## Checkpoint Results

### Window 3 — PASS
- T009: 24 keyboard navigation tests — all PASS
- T010: aria-disabled toggling wired in component — verified via T007 logic tests
- T011: 31 responsive layout tests — all PASS; CSS updated to match spec breakpoints
- Total tests: 148 across 7 files — all green
- No pre-existing failures introduced

## Files Created/Modified (all windows)
- src/components/__tests__/HeroCircularCarousel.routing.test.ts (NEW)
- src/components/__tests__/HeroCircularCarousel.animation.test.ts (NEW)
- src/components/__tests__/HeroCircularCarousel.animation-timing.test.ts (NEW)
- src/components/__tests__/HeroCircularCarousel.buttons.test.ts (NEW)
- src/components/__tests__/HeroCircularCarousel.touch.test.ts (NEW)
- src/components/__tests__/HeroCircularCarousel.keyboard.test.ts (NEW)
- src/components/__tests__/HeroCircularCarousel.responsive.test.ts (NEW)
- src/components/HeroCircularCarousel.astro (NEW then modified)
- src/pages/index.astro (MODIFIED — switch to new component)
- public/images/phoenix-united-logo.png (COPIED from spec logos)
- public/images/hero/ (directory created for future infographic images)

## Notes
- Test runner: vitest at project root (`npm test`)
- Test files go in: src/components/__tests__/
- Logo: /public/images/phoenix-united-logo.png (PNG, ~190KB)
- Existing heroSlides in index.astro use bgColor placeholders (no real images yet)
- Window 3 tasks complete; moving to Window 4 (logo/image/auto-advance)
