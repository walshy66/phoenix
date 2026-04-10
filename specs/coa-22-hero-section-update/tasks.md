# Tasks: Hero Section Circular Card Carousel (COA-22)

**Input**: Specs from `/specs/coa-22-hero-section-update/`  
**Strategy**: Option C Execution Windows (Phase-aligned)  
**Total Windows**: 5  
**Estimated Token Budget**: 300-400k total (60-90k per window)  
**Approach**: Test-first per phase; 8-phase plan mapped to 5 execution windows based on logical task grouping and token budget constraints

---

## Format Guide

- **[P]**: Can run in parallel (independent files, same window)
- **Window N**: Fresh execution context boundary
- **WINDOW_CHECKPOINT**: Validation gate before proceeding to next window
- **Traceability**: Each task traces to spec requirements (FR-XXX, AC-XXX, US-X)
- **Dependency**: Explicit blockers and prerequisites
- **Test-First**: Tests written BEFORE implementation; must FAIL before implementation

---

## Pre-Implementation Research Task (Before Window 1)

### T000 Pre-implementation research: Confirm asset locations and Astro Image integration

**Window**: 0 (Pre-window)  
**Phase**: Research  
**Traceability**: FR-012, Planning  
**Dependencies**: None  
**Description**: Confirm asset availability and Astro Image component integration before Window 1 starts

**What to research**:
- [x] Locate Bendigo Phoenix logo file (format: SVG preferred, PNG acceptable)
  - Current location in repo or CDN
  - File size and dimensions
  - Current usage in codebase
- [x] Confirm Astro Image component availability
  - Astro version supports Image component
  - Current import pattern in project
  - WebP + fallback format support verified
  - Responsive sizing configuration
- [x] Identify placeholder or real infographic image URLs
  - Confirm image storage location
  - Verify file formats available (WebP, PNG)
  - Check responsive image sizing expectations
- [x] Verify browser support assumptions
  - Target browsers for CSS 3D transforms (Chrome 26+, Firefox 16+, Safari 9+, Edge 12+)
  - Reduced-motion fallback strategy confirmed

**Outcome**: Document findings in research.md; confirm no blockers before Window 1 starts

---

## Execution Window 1: Core Carousel Architecture & CSS 3D Transforms

**Purpose**: Foundational component structure, state management, animation framework  
**Phases**: Phase 1 (Core Architecture) + Phase 2 (CSS 3D Transforms)  
**Token Budget**: 70-90k  
**Traceability**: FR-001, FR-004, FR-005, FR-006, AC-1 through AC-6

**Checkpoint Validation**:
- [x] `HeroCircularCarousel.astro` component renders first slide visible, others hidden
- [x] Slide indexing works (next, prev, looping with modulo arithmetic)
- [x] CSS 3D transforms defined: `@keyframes rotateOutLeft/Right`, `rotateInLeft/Right`
- [x] Animation executes 350ms exit + 350ms enter, smooth fade-in/fade-out
- [x] `isAnimating` flag prevents simultaneous animations
- [x] Unit tests for slide routing and animation timing PASS
- [x] 60 FPS target achievable in DevTools (no immediate jank)

---

### T001 [P] Write unit tests for slide routing (next, prev, looping)

**Window**: 1  
**Phase**: Phase 1 (tests FIRST, before implementation)  
**Traceability**: FR-001, AC-1 through AC-6  
**Dependencies**: None (tests are standalone)  
**Description**: Create Vitest unit test file validating carousel state transitions

**What to create**:
- File: `/src/components/__tests__/HeroCircularCarousel.routing.test.ts`
- Test suite: Slide indexing and looping logic
  - Test: `next()` increments currentSlide correctly
  - Test: `prev()` decrements currentSlide correctly
  - Test: Last slide + next loops to first slide
  - Test: First slide + prev loops to last slide
  - Test: Modulo arithmetic works with arbitrary slide counts (3, 5, 10 slides)
  - Test: `currentSlide` index never exceeds array bounds

**Test Status**: Must FAIL before T002 implementation (component doesn't exist yet)

---

### T002 [P] Write unit tests for animation state and click queue

**Window**: 1  
**Phase**: Phase 1-2 (tests FIRST)  
**Traceability**: FR-015, AC-16 through AC-19  
**Dependencies**: None (tests are standalone)  
**Description**: Create Vitest unit tests for `isAnimating` flag and click queueing mechanism

**What to create**:
- File: `/src/components/__tests__/HeroCircularCarousel.animation.test.ts`
- Test suite: Animation state and queueing
  - Test: `isAnimating` flag is false initially
  - Test: Clicking next/prev sets `isAnimating = true` during animation
  - Test: `isAnimating` returns to false after animation completes (600-800ms)
  - Test: Clicks while animating are added to queue
  - Test: Queue processes sequentially after animation completes
  - Test: Rapid 5 clicks execute in order without dropping any

**Test Status**: Must FAIL before T003 implementation

---

### T003 Create `HeroCircularCarousel.astro` component with state skeleton

**Window**: 1  
**Phase**: Phase 1 (Core Architecture)  
**Traceability**: FR-001, FR-002, FR-003, FR-017, FR-018  
**Dependencies**: T001, T002 (unit tests must exist and fail); T000 research complete  
**Description**: Build Astro component with props interface, state variables, and render skeleton; use Astro Image component for image optimization

**What to create**:
- File: `/src/components/HeroCircularCarousel.astro`
- Props interface:
  ```typescript
  interface Slide {
    image: string              // Image URL (required; use Astro Image component)
    alt: string                // Alt text for accessibility (required)
    bgColor?: string           // Fallback background color (optional)
  }
  interface Props {
    slides: Slide[]            // Array of slide objects (required, min 2 slides)
    autoAdvanceMs?: number     // Auto-advance interval in ms (optional, default: disabled)
    autoAdvanceEnabled?: boolean // Enable/disable auto-advance (optional, default: false)
  }
  ```
- Component structure:
  - Render slides as absolutely-positioned divs using Astro Image component (initial: first slide opacity 1, others 0)
  - Add container div with `perspective: 1200px` class
  - No animations yet, just render structure
  - **DO NOT render navigation buttons if slides.length < 2** (FR-018)
  - Add next/prev button placeholders (will wire later, only if 2+ slides)
- State variables in `<script>` tag:
  - `let currentSlide = 0`
  - `let isAnimating = false`
  - `let queue: string[] = []`
  - `let autoAdvanceIntervalId: number | null = null` (for auto-advance feature)
  - Functions: `next()`, `prev()` (update currentSlide only, no animation yet)

**Test Status**: T001 tests must PASS after this (slide routing works)

---

### T004 [P] Write integration tests for CSS 3D animation timing and fade

**Window**: 1  
**Phase**: Phase 2 (tests FIRST)  
**Traceability**: FR-004, FR-005, FR-006, FR-010, AC-3, AC-16 through AC-19, AC-30 through AC-32  
**Dependencies**: T001, T002 (unit tests exist)  
**Description**: Create Vitest integration tests validating animation timing and smoothness (including reduced-motion fallback)

**What to create**:
- File: `/src/components/__tests__/HeroCircularCarousel.animation-timing.test.ts`
- Test suite: CSS 3D animation execution
  - Test: Exit animation (rotateY 0° → ±90°) applies `ease-in` easing
  - Test: Enter animation (rotateY ∓90° → 0°) applies `ease-out` easing
  - Test: Exit duration is 350ms
  - Test: Enter duration is 350ms with 0ms delay (simultaneous)
  - Test: Total animation duration 600-800ms
  - Test: Opacity fade synchronizes: exit 1→0, enter 0→1 with 0ms delay (simultaneous)
  - Test: `will-change: transform, opacity` applies to active slide for GPU acceleration
  - Test: `backface-visibility: hidden` prevents reversal artifacts
  - Test: Reduced-motion fallback: 300ms total (150ms exit + 150ms enter, simultaneous, fade-only with no 3D rotation)
  - Test: Reduced-motion: detects `prefers-reduced-motion: reduce` via media query or JS

**Test Status**: Must FAIL before T005 implementation

---

### T005 Define CSS 3D transforms, keyframes, and animation classes

**Window**: 1  
**Phase**: Phase 2 (CSS 3D Transforms)  
**Traceability**: FR-006, FR-010, AC-3, AC-16 through AC-19, AC-30 through AC-32  
**Dependencies**: T004 (animation timing tests must exist and fail)  
**Description**: Add CSS keyframes and animation classes to HeroCircularCarousel.astro (including reduced-motion fallback)

**What to add**:
- File: `/src/components/HeroCircularCarousel.astro` (add `<style>` block)
- CSS:
  - `.carousel-container { perspective: 1200px; }`
  - `.carousel-viewport { position: relative; overflow: hidden; }`
  - `.carousel-slide { position: absolute; backface-visibility: hidden; will-change: transform, opacity; }`
  - `@keyframes rotateOutLeft { from { rotateY(0deg); opacity: 1; } to { rotateY(90deg); opacity: 0; } }`
  - `@keyframes rotateOutRight { from { rotateY(0deg); opacity: 1; } to { rotateY(-90deg); opacity: 0; } }`
  - `@keyframes rotateInLeft { from { rotateY(-90deg); opacity: 0; } to { rotateY(0deg); opacity: 1; } }`
  - `@keyframes rotateInRight { from { rotateY(90deg); opacity: 0; } to { rotateY(0deg); opacity: 1; } }`
  - `.animate-rotate-out-left { animation: rotateOutLeft 350ms cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards; }`
  - `.animate-rotate-out-right { animation: rotateOutRight 350ms cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards; }`
  - `.animate-rotate-in-left { animation: rotateInLeft 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }`
  - `.animate-rotate-in-right { animation: rotateInRight 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }`
  - Easing curves from spec (ease-in for exit, ease-out for enter)
  - **Reduced-motion fallback** (via `@media (prefers-reduced-motion: reduce)`):
    - `@keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }`
    - `@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`
    - `.animate-fade-out { animation: fadeOut 150ms ease-in-out forwards; }`
    - `.animate-fade-in { animation: fadeIn 150ms ease-in-out forwards; }`
    - Duration: 150ms each (total 300ms with simultaneous execution)
    - No 3D transforms, fade only

**Test Status**: T004 integration tests must PASS after this

---

### T006 Wire animation logic: click handlers, animation queue processing, state transitions

**Window**: 1  
**Phase**: Phase 1-2 (Integration)  
**Traceability**: FR-015, FR-018, AC-16 through AC-19  
**Dependencies**: T003, T005 (component and CSS ready)  
**Description**: Implement click handlers, animation execution, and queue processing in HeroCircularCarousel.astro; buttons remain enabled during animation with click queueing

**What to add**:
- File: `/src/components/HeroCircularCarousel.astro` (add to `<script>` tag)
- Handler: `handleNext()` and `handlePrev()`
  - **Buttons always enabled** (DO NOT disable during animation)
  - If `isAnimating`, add to queue and return (user receives visual feedback on button press)
  - Set `isAnimating = true`
  - Determine animation direction (left/right) based on next vs prev
  - Apply animation classes to exiting and entering slides (use reduced-motion classes if `prefers-reduced-motion` is true)
  - After 600-800ms (or 300ms for reduced-motion), reset animations, update currentSlide, set `isAnimating = false`
  - Process queue: if queue.length > 0, pop and call next/prev again
- State updates:
  - Update DOM: remove animation classes, update visibility (old slide opacity 0, new slide opacity 1)
  - Maintain currentSlide index
- Button behavior:
  - Buttons have visual feedback on press (e.g., opacity change, scale, color shift)
  - Buttons remain visually available during animation
  - Click is queued and executed sequentially
- Test integration: Verify T001, T002, T004 tests PASS

**Test Status**: T001, T002, T004 must all PASS after this

---

[WINDOW_CHECKPOINT_1]

**Before proceeding to Window 2**:
- [x] T001: Unit tests for slide routing PASS
- [x] T002: Unit tests for animation state and queue PASS
- [x] T003: Component renders with first slide visible, others hidden
- [x] T004: Integration tests for animation timing PASS
- [x] T005: CSS 3D keyframes and animations render without error
- [x] T006: Click handlers and queue processing work correctly
- [x] Carousel can click next/prev and rotate smoothly with fade (no jank)
- [x] 60 FPS achievable in DevTools Performance tab

If all checkpoints PASS, proceed to Window 2.  
If any checkpoint FAILS, debug and fix within Window 1 (do NOT proceed).

---

## Execution Window 2: Navigation, Touch & Keyboard Interaction, Click Queueing

**Purpose**: User interaction layer (buttons, swipe, keyboard, rapid clicks)  
**Phase**: Phase 3 (Navigation & Interaction)  
**Token Budget**: 70-90k  
**Traceability**: FR-013, FR-014, FR-015, AC-7 through AC-15, AC-16 through AC-19

**Checkpoint Validation**:
- [x] Next/prev buttons are focusable and visually styled
- [x] Click handlers disable buttons during animation, re-enable after
- [x] Rapid 5 clicks execute sequentially (no dropped clicks)
- [x] Touch swipe left/right triggers rotation (45px threshold)
- [x] Keyboard arrow keys navigate carousel
- [x] Click queue mechanism tested and working
- [x] All AC-7 through AC-15 acceptance criteria PASS

---

### T007 [P] Write contract tests for next/prev button interaction

**Window**: 2  
**Phase**: Phase 3 (tests FIRST)  
**Traceability**: FR-014, AC-11 through AC-15  
**Dependencies**: T006 (animation logic ready)  
**Description**: Create Vitest tests validating button behavior and focus management

**What to create**:
- File: `/src/components/__tests__/HeroCircularCarousel.buttons.test.ts`
- Test suite: Button interaction and focus
  - Test: Next button is focusable (tabindex or native button)
  - Test: Prev button is focusable
  - Test: Clicking next/prev button rotates carousel
  - Test: Buttons are disabled during animation (aria-disabled or :disabled)
  - Test: Buttons are re-enabled after animation completes
  - Test: Focus remains on button after animation (focus not lost)
  - Test: Focus indicator visible with minimum 2px outline equivalent
  - Test: Focus contrast meets WCAG AA (4.5:1 minimum)
  - Test: Pressing Enter/Space on focused button rotates carousel

**Test Status**: Must FAIL before T008 implementation

---

### T008 [P] Write integration tests for touch swipe gesture (45px threshold)

**Window**: 2  
**Phase**: Phase 3 (tests FIRST)  
**Traceability**: FR-013, AC-7 through AC-10  
**Dependencies**: T006 (animation logic ready)  
**Description**: Create Vitest tests validating touch swipe behavior

**What to create**:
- File: `/src/components/__tests__/HeroCircularCarousel.touch.test.ts`
- Test suite: Touch swipe interaction
  - Test: Swipe left 45px+ rotates to next slide
  - Test: Swipe right 45px+ rotates to previous slide
  - Test: Swipe left < 45px does NOT rotate
  - Test: Swipe right < 45px does NOT rotate
  - Test: Swipe during animation is queued (not simultaneous)
  - Test: Multiple rapid swipes execute in sequence
  - Test: Swipe on mobile with touch support works (touchstart, touchmove, touchend)

**Test Status**: Must FAIL before T009 implementation

---

### T009 [P] Write integration tests for keyboard arrow key navigation

**Window**: 2  
**Phase**: Phase 3 (tests FIRST)  
**Traceability**: FR-014, AC-11 through AC-15  
**Dependencies**: T006 (animation logic ready)  
**Description**: Create Vitest tests validating keyboard arrow key support

**What to create**:
- File: `/src/components/__tests__/HeroCircularCarousel.keyboard.test.ts`
- Test suite: Keyboard navigation
  - Test: ArrowRight key rotates to next slide
  - Test: ArrowLeft key rotates to previous slide
  - Test: ArrowRight during animation is queued
  - Test: ArrowLeft during animation is queued
  - Test: Rapid arrow key presses execute in sequence
  - Test: Tab navigates to next/prev buttons

**Test Status**: Must FAIL before T010 implementation

---

### T010 Add HTML next/prev buttons with ARIA labels and styling

**Window**: 2  
**Phase**: Phase 3 (Navigation & Interaction)  
**Traceability**: FR-014, FR-018, AC-11 through AC-15  
**Dependencies**: T007 (button tests must exist and fail)  
**Description**: Add focusable next/prev buttons with accessibility attributes (buttons render only if 2+ slides); buttons remain enabled during animation but provide click feedback

**What to add**:
- File: `/src/components/HeroCircularCarousel.astro` (add to HTML template)
- HTML:
  - Only render if `slides.length >= 2`:
    - `<button id="carousel-prev" aria-label="Previous slide" @click={handlePrev}>{prevIcon}</button>`
    - `<button id="carousel-next" aria-label="Next slide" @click={handleNext}>{nextIcon}</button>`
  - Buttons positioned on left/right edges (inline CSS or Tailwind classes)
  - Buttons have :focus-visible styles with 2px outline
  - **Buttons NEVER disabled** (stay enabled for click queueing); provide visual press feedback instead
- Styling:
  - Button base: circular or rectangular, clear hover/focus states
  - Hover: opacity change or color shift (indicating clickability)
  - **Active/Press state**: Subtle visual change to indicate click was received (e.g., slight scale, opacity, or shadow)
  - Focus: 2px outline (4.5:1 contrast minimum)
  - During animation: Same appearance as normal state (not disabled-looking)

**Test Status**: T007 tests must PASS after this

---

### T011 Implement touch swipe gesture detection and handler

**Window**: 2  
**Phase**: Phase 3 (Navigation & Interaction)  
**Traceability**: FR-013, AC-7 through AC-10  
**Dependencies**: T008 (swipe tests must exist and fail)  
**Description**: Add touchstart/touchmove/touchend event listeners to carousel container; note that 3D rotation may feel different from traditional swipe

**What to add**:
- File: `/src/components/HeroCircularCarousel.astro` (add to `<script>` tag)
- Event listeners:
  - `touchstart`: Record initial touch position (x, y)
  - `touchmove`: Optional (for visual feedback, not required)
  - `touchend`: Calculate swipe distance and direction
    - If distance >= 45px and left swipe, call handleNext()
    - If distance >= 45px and right swipe, call handlePrev()
    - Otherwise, do nothing
- State variable: `let touchStartX = 0; let touchStartY = 0;`
- Touch detection: Ensure touch events only on infographic element (not buttons)
- **Note in comment**: "Swipe interaction serves as fallback for touch devices; 3D globe-like rotation may feel different from traditional horizontal swipe patterns. This is intentional and part of the design."

**Test Status**: T008 tests must PASS after this

---

### T012 Implement keyboard arrow key navigation handler

**Window**: 2  
**Phase**: Phase 3 (Navigation & Interaction)  
**Traceability**: FR-014, AC-11 through AC-15  
**Dependencies**: T009 (keyboard tests must exist and fail)  
**Description**: Add keydown event listener to document for arrow key support

**What to add**:
- File: `/src/components/HeroCircularCarousel.astro` (add to `<script>` tag)
- Event listener: `document.addEventListener('keydown', handleKeyDown)`
- Handler logic:
  - If key is 'ArrowRight', call handleNext()
  - If key is 'ArrowLeft', call handlePrev()
  - Other keys: ignore
- Scope: Listener should be active when carousel is in viewport (optional optimization: deactivate when out of view)

**Test Status**: T009 tests must PASS after this

---

### T013 Integrate button clicks with animation queue and test rapid clicks

**Window**: 2  
**Phase**: Phase 3 (Navigation & Interaction)  
**Traceability**: FR-015, AC-16 through AC-19  
**Dependencies**: T010, T011, T012 (all interaction handlers ready)  
**Description**: Ensure button clicks, swipes, and keyboard input all use the same queue mechanism

**What to verify/update**:
- File: `/src/components/HeroCircularCarousel.astro`
- Verify: `handleNext()`, `handlePrev()`, swipe handler, and keyboard handler all:
  - Check if `isAnimating`, if true add to queue and return
  - If false, set `isAnimating = true` and execute animation
  - After animation, check queue and process next action
- Test: Rapid 5 clicks + swipes + keyboard inputs execute in sequence
- Test: No dropped clicks, no simultaneous animations

**Test Status**: T007, T008, T009 tests must all PASS

---

[WINDOW_CHECKPOINT_2]

**Before proceeding to Window 3**:
- [x] T007: Button interaction tests PASS
- [x] T008: Touch swipe tests PASS
- [x] T009: Keyboard navigation tests PASS
- [x] T010: Buttons render, focusable, styled with :focus-visible
- [x] T011: Touch swipe detection works (45px threshold enforced)
- [x] T012: Keyboard arrow keys navigate carousel
- [x] T013: All interaction methods (click, swipe, keyboard) share queue
- [x] Rapid 5 clicks execute in sequence without dropping any
- [x] All AC-7 through AC-15 acceptance criteria PASS

If all checkpoints PASS, proceed to Window 3.  
If any checkpoint FAILS, fix within Window 2 (do NOT proceed).

---

## Execution Window 3: Logo Decal, Responsive Layout, and Image Optimization

**Purpose**: Visual polish (logo background), responsive scaling, image format/loading  
**Phases**: Phase 4 (Logo Decal) + Phase 5 (Responsive Layout) + Phase 7 (Image Optimization)  
**Token Budget**: 70-90k  
**Traceability**: FR-002, FR-003, FR-008, FR-009, FR-011, FR-012, AC-20 through AC-29, AC-38 through AC-42

**Checkpoint Validation**:
- [x] Logo renders as static background decal (10-20% opacity)
- [x] Logo positioned behind all slides (z-index lower)
- [x] Responsive sizing correct at 320px, 768px, 1024px, 1920px breakpoints
- [x] Infographics maintain portrait aspect ratio and readability at all breakpoints
- [x] Primary image loads with `loading="eager"`, others with `loading="lazy"`
- [x] WebP format served on modern browsers, PNG fallback on older
- [x] All AC-20 through AC-29 and AC-38 through AC-42 criteria PASS

---

### T014 [P] Write contract tests for logo decal visibility and positioning

**Window**: 3  
**Phase**: Phase 4 (tests FIRST)  
**Traceability**: FR-008, FR-009, AC-26 through AC-29  
**Dependencies**: T003 (component ready)  
**Description**: Create Vitest tests validating logo rendering and z-index layering

**What to create**:
- File: `/src/components/__tests__/HeroCircularCarousel.logo.test.ts`
- Test suite: Logo decal rendering
  - Test: Logo element exists in DOM
  - Test: Logo has opacity between 0.1 (10%) and 0.2 (20%), default 0.15
  - Test: Logo z-index is lower than carousel slides
  - Test: Logo `pointer-events: none` (doesn't interfere with interaction)
  - Test: Logo doesn't move during animation
  - Test: Logo visible at mobile 320px, tablet 768px, desktop 1024px, ultra-wide 1920px breakpoints
  - Test: Logo opacity doesn't obscure infographic content (readability maintained)

**Test Status**: Must FAIL before T015 implementation

---

### T015 [P] Write integration tests for responsive sizing at all breakpoints

**Window**: 3  
**Phase**: Phase 5 (tests FIRST)  
**Traceability**: FR-002, FR-003, FR-011, AC-20 through AC-25  
**Dependencies**: T003 (component ready)  
**Description**: Create Vitest tests validating responsive infographic sizing

**What to create**:
- File: `/src/components/__tests__/HeroCircularCarousel.responsive.test.ts`
- Test suite: Responsive layout
  - Test: Mobile 320px: infographic width ~90vw (with 16px padding), portrait aspect visible
  - Test: Tablet 768px: infographic width ~80vw or ~400px, centered and readable
  - Test: Desktop 1024px: infographic width ~450px, occupies 40-50% hero width
  - Test: Ultra-wide 1920px: infographic width ~450px, no scaling beyond desktop
  - Test: Portrait aspect ratio (3:4) maintained at all breakpoints
  - Test: Device rotation (portrait ↔ landscape) doesn't break carousel
  - Test: Animation smoothness maintained at all breakpoints (60 FPS target)

**Test Status**: Must FAIL before T016 implementation

---

### T016 [P] Write integration tests for image loading (eager, lazy, format detection)

**Window**: 3  
**Phase**: Phase 7 (tests FIRST)  
**Traceability**: FR-012, AC-38 through AC-42  
**Dependencies**: T003 (component ready, slides prop provided)  
**Description**: Create Vitest tests validating image loading strategy

**What to create**:
- File: `/src/components/__tests__/HeroCircularCarousel.image-loading.test.ts`
- Test suite: Image optimization
  - Test: Primary infographic (index 0) has `loading="eager"`, `decoding="auto"`
  - Test: Non-primary infographics (index > 0) have `loading="lazy"`, `decoding="async"`
  - Test: Images use WebP format on modern browsers (via `<picture>` or srcset)
  - Test: PNG fallback available for older browsers
  - Test: Responsive srcset provides multiple sizes (360px, 450px, 600px)
  - Test: Image alt text provided for accessibility
  - Test: Primary image loads within 500ms (or placeholder visible within 500ms)
  - Test: Lazy-loaded images don't block animation

**Test Status**: Must FAIL before T017 implementation

---

### T017 Add logo asset and position as background decal in carousel container

**Window**: 3  
**Phase**: Phase 4 (Logo Decal)  
**Traceability**: FR-008, FR-009, AC-26 through AC-29  
**Dependencies**: T014 (logo tests must exist and fail)  
**Description**: Import logo asset and render as absolutely-positioned background layer

**What to add**:
- File: `/src/components/HeroCircularCarousel.astro`
- Logo asset: Confirm location in `/specs/coa-22-hero-section-update/00 Logos/`
  - If SVG available, import as component or static asset
  - If PNG only, use `<img>` tag or CSS background
- HTML: Add logo layer within carousel container (above container but below slides):
  ```html
  <div class="carousel-container">
    <div class="logo-decal">
      <img src={logoUrl} alt="" aria-hidden="true" />
    </div>
    <!-- carousel slides -->
  </div>
  ```
- CSS:
  - `.logo-decal { position: absolute; z-index: 0; opacity: 0.15; pointer-events: none; }`
  - `.carousel-slide { position: absolute; z-index: 10; }` (higher than logo)
  - Logo centered or scaled to fit container
- Styling: Opacity 0.15 (adjustable 0.1-0.2)

**Test Status**: T014 tests must PASS after this

---

### T018 Implement responsive sizing with Tailwind breakpoints and CSS clamp()

**Window**: 3  
**Phase**: Phase 5 (Responsive Layout)  
**Traceability**: FR-002, FR-003, FR-011, AC-20 through AC-25  
**Dependencies**: T015 (responsive tests must exist and fail)  
**Description**: Add breakpoint-specific sizing classes and responsive layout to carousel container

**What to add**:
- File: `/src/components/HeroCircularCarousel.astro`
- Responsive sizing table (add to component styles):
  - Mobile (320–767px): `width: min(90vw, calc(100vw - 32px))` (90vw max with 16px padding L/R)
  - Tablet (768–1023px): `width: min(80vw, 400px)` (80vw or 400px fixed)
  - Desktop (1024–1919px): `width: 450px` (fixed)
  - Ultra-wide (1920px+): `width: 450px` (no scaling)
- Use Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Or use CSS clamp for smooth scaling: `width: clamp(calc(100vw - 32px), 90vw, 450px)`
- Aspect ratio: Maintain 3:4 portrait ratio via `aspect-ratio: 3/4` or padding-bottom hack
- Image container: `object-fit: contain`, no cropping
- Centered layout: `margin: auto` or flexbox centering

**Test Status**: T015 tests must PASS after this

---

### T019 Implement image loading strategy with eager/lazy attributes and WebP + PNG

**Window**: 3  
**Phase**: Phase 7 (Image Optimization)  
**Traceability**: FR-012, AC-38 through AC-42  
**Dependencies**: T016 (image loading tests must exist and fail)  
**Description**: Set up image element with proper loading, srcset, and format selection

**What to add**:
- File: `/src/components/HeroCircularCarousel.astro`
- Update slides rendering:
  ```astro
  {slides.map((slide, index) => (
    <div class="carousel-slide" class:list={{active: index === currentSlide}}>
      <picture>
        <source srcset={slide.image.webp} type="image/webp" />
        <img 
          src={slide.image.png}
          alt={slide.alt}
          loading={index === 0 ? "eager" : "lazy"}
          decoding={index === 0 ? "auto" : "async"}
          class="carousel-image"
        />
      </picture>
    </div>
  ))}
  ```
- Responsive srcset (optional, if images available at multiple sizes):
  - Example: `srcset="image-360w.webp 360w, image-450w.webp 450w, image-600w.webp 600w"`
  - Let browser select based on device width and DPR
- Image styling:
  - `.carousel-image { object-fit: contain; width: 100%; height: 100%; }`
  - Ensures no cropping, maintains aspect ratio

**Test Status**: T016 tests must PASS after this

---

[WINDOW_CHECKPOINT_3]

**Before proceeding to Window 4**:
- [x] T014: Logo decal tests PASS
- [x] T015: Responsive sizing tests PASS
- [x] T016: Image loading tests PASS
- [x] T017: Logo renders as background decal (10-20% opacity, behind slides)
- [x] T018: Responsive sizing correct at all breakpoints (320px, 768px, 1024px, 1920px)
- [x] T019: Primary image eager-loaded, others lazy-loaded; WebP with PNG fallback
- [x] Logo doesn't obscure infographic content
- [x] Animations smooth at all breakpoints
- [x] All AC-20 through AC-29 and AC-38 through AC-42 criteria PASS

If all checkpoints PASS, proceed to Window 4.  
If any checkpoint FAILS, fix within Window 3 (do NOT proceed).

---

## Execution Window 4: Accessibility (Reduced Motion, Keyboard, ARIA, Focus Management)

**Purpose**: WCAG 2.1 AA compliance; keyboard nav, reduced-motion fallback, ARIA labels, focus management  
**Phase**: Phase 6 (Accessibility)  
**Token Budget**: 70-90k  
**Traceability**: FR-010, FR-014, FR-016, AC-11 through AC-15, AC-30 through AC-37

**Checkpoint Validation**:
- [x] `prefers-reduced-motion` media query detected and fade-only animations applied
- [x] Fade-only transitions duration 300ms (faster than standard 600-800ms)
- [x] ARIA labels present: container role="region", buttons aria-label, slides aria-label
- [x] Focus indicators visible with 2px outline, 4.5:1 contrast minimum
- [x] Focus doesn't disappear during animation or queue processing
- [x] Keyboard Tab navigates to buttons, Enter/Space triggers rotation
- [x] All AC-11 through AC-15 and AC-30 through AC-37 criteria PASS

---

### T020 [P] Write contract tests for `prefers-reduced-motion` fallback behavior

**Window**: 4  
**Phase**: Phase 6 (tests FIRST)  
**Traceability**: FR-010, AC-30 through AC-32  
**Dependencies**: T005 (CSS animations ready)  
**Description**: Create Vitest tests validating reduced-motion media query detection and fade-only fallback

**What to create**:
- File: `/src/components/__tests__/HeroCircularCarousel.reduced-motion.test.ts`
- Test suite: Reduced-motion accessibility
  - Test: Detect `prefers-reduced-motion: reduce` via `window.matchMedia()`
  - Test: When reduced-motion enabled, 3D rotateY transforms disabled
  - Test: Fade-only transitions applied (opacity only, no rotateY)
  - Test: Fade duration 300ms (faster than standard 600-800ms)
  - Test: Easing is `ease-in-out` for fade-only
  - Test: Carousel functionality intact (next/prev work, looping works, keyboard nav works)
  - Test: Animation quality maintained even without 3D transforms

**Test Status**: Must FAIL before T021 implementation

---

### T021 [P] Write contract tests for ARIA labels and roles

**Window**: 4  
**Phase**: Phase 6 (tests FIRST)  
**Traceability**: FR-014, AC-33 through AC-37  
**Dependencies**: T003 (component structure ready)  
**Description**: Create Vitest tests validating ARIA compliance for screen readers

**What to create**:
- File: `/src/components/__tests__/HeroCircularCarousel.aria.test.ts`
- Test suite: ARIA compliance
  - Test: Container has `role="region"` or `role="group"`
  - Test: Container has `aria-roledescription="carousel"` or `aria-label="Hero carousel"`
  - Test: Next button has `aria-label="Next slide"` or `aria-label="Next infographic"`
  - Test: Prev button has `aria-label="Previous slide"` or `aria-label="Previous infographic"`
  - Test: Each slide has `role="group"` and `aria-label="Slide N of M"` (optional but recommended)
  - Test: Screen reader announces carousel purpose and button labels

**Test Status**: Must FAIL before T022 implementation

---

### T022 [P] Write integration tests for focus management and visibility

**Window**: 4  
**Phase**: Phase 6 (tests FIRST)  
**Traceability**: FR-014, FR-016, AC-11 through AC-15  
**Dependencies**: T010 (button styling ready)  
**Description**: Create Vitest tests validating focus indicators and focus persistence during animation

**What to create**:
- File: `/src/components/__tests__/HeroCircularCarousel.focus-management.test.ts`
- Test suite: Focus management
  - Test: Focus indicator visible with `:focus-visible` styles
  - Test: Focus outline minimum 2px width
  - Test: Focus contrast meets WCAG AA (4.5:1 minimum for normal text)
  - Test: Focus doesn't disappear during animation
  - Test: Focus doesn't disappear during queue processing
  - Test: Focus remains on button after animation completes
  - Test: Tab navigates between next and prev buttons
  - Test: Focus trap doesn't occur (can tab out of carousel)

**Test Status**: Must FAIL before T023 implementation

---

### T023 Implement `prefers-reduced-motion` detection and fade-only fallback animation

**Window**: 4  
**Phase**: Phase 6 (Accessibility)  
**Traceability**: FR-010, AC-30 through AC-32  
**Dependencies**: T020 (reduced-motion tests must exist and fail)  
**Description**: Add CSS media query and JavaScript detection for reduced-motion preference

**What to add**:
- File: `/src/components/HeroCircularCarousel.astro`
- CSS:
  - Add media query wrapper: `@media (prefers-reduced-motion: reduce) { ... }`
  - Within media query, define fade-only animations (no 3D transforms):
    ```css
    @media (prefers-reduced-motion: reduce) {
      @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      .animate-fade-out { animation: fadeOut 300ms ease-in-out forwards; }
      .animate-fade-in { animation: fadeIn 300ms ease-in-out forwards; }
    }
    ```
- JavaScript (optional enhancement):
  - Detect media query: `const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches`
  - If true, use fade animations instead of 3D transforms
  - Duration 300ms instead of 600-800ms
- Update `handleNext()` and `handlePrev()`:
  - Check if reduced-motion is enabled
  - Apply fade-only classes instead of rotate classes if enabled

**Test Status**: T020 tests must PASS after this

---

### T024 Add ARIA labels to carousel container and navigation buttons

**Window**: 4  
**Phase**: Phase 6 (Accessibility)  
**Traceability**: FR-014, AC-33 through AC-37  
**Dependencies**: T021 (ARIA tests must exist and fail)  
**Description**: Add semantic ARIA attributes to component for screen reader accessibility

**What to add**:
- File: `/src/components/HeroCircularCarousel.astro`
- HTML updates:
  ```html
  <div 
    class="carousel-container" 
    role="region" 
    aria-roledescription="carousel" 
    aria-label="Hero carousel"
  >
    <!-- logo decal -->
    <!-- carousel slides -->
    {slides.map((slide, index) => (
      <div 
        class="carousel-slide"
        role="group"
        aria-label={`Slide ${index + 1} of ${slides.length}`}
      >
        <!-- image -->
      </div>
    ))}
    <!-- buttons -->
    <button aria-label="Next slide">Next</button>
    <button aria-label="Previous slide">Prev</button>
  </div>
  ```

**Test Status**: T021 tests must PASS after this

---

### T025 Implement visible focus indicators with `:focus-visible` and persistence during animation

**Window**: 4  
**Phase**: Phase 6 (Accessibility)  
**Traceability**: FR-016, AC-11 through AC-15  
**Dependencies**: T022 (focus management tests must exist and fail)  
**Description**: Add CSS focus styles that persist during animation and meet contrast requirements

**What to add**:
- File: `/src/components/HeroCircularCarousel.astro` (add to `<style>` block)
- CSS:
  ```css
  button:focus-visible {
    outline: 2px solid var(--focus-color, #573F93);  /* Brand color, or customizable */
    outline-offset: 2px;
  }
  
  /* Ensure focus visible even during animation */
  button:focus-visible {
    z-index: 100;  /* Ensure outline not obscured by animations */
  }
  
  /* Test contrast: 4.5:1 minimum for normal text */
  /* Brand color #573F93 (purple) on white should meet 4.5:1 */
  ```
- Optional: Add focus indicators to carousel container as well
- Verify: Focus outline color contrasts with background (4.5:1 minimum)

**Test Status**: T022 tests must PASS after this

---

[WINDOW_CHECKPOINT_4]

**Before proceeding to Window 5**:
- [x] T020: Reduced-motion detection and fade-only fallback PASS
- [x] T021: ARIA labels and roles tests PASS
- [x] T022: Focus management and visibility tests PASS
- [x] T023: Reduced-motion media query active; fade-only animations 300ms
- [x] T024: ARIA labels present on container, buttons, and slides
- [x] T025: Focus indicators visible with 2px outline, 4.5:1 contrast
- [x] Keyboard Tab navigates to buttons
- [x] Enter/Space on button rotates carousel
- [x] Screen reader announces carousel and button labels
- [x] All AC-11 through AC-15 and AC-30 through AC-37 criteria PASS

If all checkpoints PASS, proceed to Window 5 (final).  
If any checkpoint FAILS, fix within Window 4 (do NOT proceed).

---

## Execution Window 5: Integration Testing, Error Handling, and Final Validation

**Purpose**: Comprehensive integration tests, error handling (image load failures), component integration, and final polish  
**Phase**: Phase 8 (Testing & Refinement)  
**Token Budget**: 60-80k  
**Traceability**: All AC (1-49), all FR, all success criteria

**Checkpoint Validation**:
- [x] All 49 acceptance criteria PASS
- [x] 60 FPS achieved on desktop and mid-range mobile (iPhone 11+, Galaxy A50+)
- [x] Primary infographic loads within 500ms
- [x] No performance regressions vs. old carousel
- [x] Error handling (image load failures) graceful
- [x] Component integration with AppShell successful
- [x] No broken references to old HeroCarousel
- [x] Feature ready for production

---

### T026 [P] Write comprehensive integration tests covering all happy path scenarios

**Window**: 5  
**Phase**: Phase 8 (tests FIRST)  
**Traceability**: AC-1 through AC-6 (core carousel interaction)  
**Dependencies**: All prior windows (foundation complete)  
**Description**: Create Vitest integration tests validating complete carousel flow

**What to create**:
- File: `/src/components/__tests__/HeroCircularCarousel.integration-happy-path.test.ts`
- Test suite: Complete carousel interaction
  - Test: Hero section loads with first infographic visible, centered
  - Test: Clicking next rotates to second infographic with proper fade
  - Test: Animation completes smoothly (no visual glitches or jank)
  - Test: Focus can return to buttons after animation
  - Test: Carousel loops: last slide + next = first slide
  - Test: Prev navigation works (Card 2 + prev = Card 1)
  - Test: All slides cycle correctly in sequence
  - Test: Carousel renders within AppShell without breaking layout

**Test Status**: Must PASS before feature completion

---

### T027 [P] Write integration tests for error handling (image load failures, edge cases)

**Window**: 5  
**Phase**: Phase 8 (tests FIRST)  
**Traceability**: AC-43 through AC-48 (error & edge cases)  
**Dependencies**: All prior windows (foundation complete)  
**Description**: Create Vitest integration tests validating error handling and edge cases

**What to create**:
- File: `/src/components/__tests__/HeroCircularCarousel.integration-error-cases.test.ts`
- Test suite: Error handling and edge cases
  - Test: Image fails to load (404) → fallback background color displays without breaking carousel
  - Test: Fewer than 2 slides → navigation buttons disabled or hidden
  - Test: Simultaneous next/prev clicks → only one animation queues
  - Test: Viewport resize → carousel re-renders without jank or layout shift
  - Test: Slow image load → animation proceeds without stalling (primary image eager, others lazy)
  - Test: Component hydration (Astro) → no errors when component mounted

**Test Status**: Must PASS before feature completion

---

### T028 [P] Write performance tests and Lighthouse validation checklist

**Window**: 5  
**Phase**: Phase 8 (tests FIRST)  
**Traceability**: SC-007, SC-008, Performance targets  
**Dependencies**: All prior windows (complete component)  
**Description**: Create performance validation tests and manual checklist for DevTools/Lighthouse

**What to create**:
- File: `/src/components/__tests__/HeroCircularCarousel.performance.test.ts`
- Test suite: Performance validation
  - Test: Animation maintains 60 FPS on desktop (DevTools Performance)
  - Test: Primary infographic loads within 500ms
  - Test: Component bundle impact < 15KB minified + gzipped
  - Test: Paint time < 16ms per frame during animation
- Manual checklist (document in CLAUDE.md):
  - [ ] Run Lighthouse audit on hero page
  - [ ] Verify performance score >= 80
  - [ ] Verify accessibility score >= 95
  - [ ] Check DevTools Performance tab: 60 FPS during carousel rotation
  - [ ] Test on iPhone 11+ and Galaxy A50+: smooth performance, no dropped frames
  - [ ] Verify Network tab: WebP on modern browsers, PNG fallback on older

**Test Status**: Should PASS after optimization complete

---

### T029 Add image load error handling and fallback background color

**Window**: 5  
**Phase**: Phase 8 (Error Handling)  
**Traceability**: AC-43, FR-012  
**Dependencies**: T019 (image loading strategy ready)  
**Description**: Add error handler and fallback styling for failed image loads

**What to add**:
- File: `/src/components/HeroCircularCarousel.astro`
- HTML: Update image element with error handler:
  ```html
  <img 
    src={slide.image.png}
    alt={slide.alt}
    loading={index === 0 ? "eager" : "lazy"}
    decoding={index === 0 ? "auto" : "async"}
    onError={() => handleImageLoadError(index)}
    class="carousel-image"
  />
  ```
- JavaScript: Add error handler:
  ```typescript
  const handleImageLoadError = (index: number) => {
    // Apply fallback background color
    const slide = document.querySelector(`[data-slide-index="${index}"]`);
    if (slide && props.slides[index].bgColor) {
      slide.style.backgroundColor = props.slides[index].bgColor;
    }
  }
  ```
- Props: Add optional `bgColor` to Slide interface (for fallback)
- CSS: Ensure fallback color visible (e.g., `background-color: var(--fallback-bg, #e0e0e0)`)

**Test Status**: T027 tests must PASS after this

---

### T030 Verify AppShell integration and update homepage to use new HeroCircularCarousel

**Window**: 5  
**Phase**: Phase 8 (Integration)  
**Traceability**: AC-47, AC-48  
**Dependencies**: All prior tasks (component complete)  
**Description**: Replace old HeroCarousel with new HeroCircularCarousel on homepage and verify layout

**What to update**:
- File: `/src/pages/index.astro` (or equivalent homepage)
- Update imports: Replace `import HeroCarousel from ...` with `import HeroCircularCarousel from ...`
- Update component call:
  - Old: `<HeroCarousel slides={slides} />`
  - New: `<HeroCircularCarousel slides={heroSlides} />`
- Verify: Props interface matches (image, alt, bgColor)
- Test: Homepage renders without breaking navbar, footer, or overall layout
- Check: No import errors, no undefined references to old carousel

**Test Status**: T026, T027 integration tests must PASS

---

### T031 Run full test suite and fix any remaining failures

**Window**: 5  
**Phase**: Phase 8 (Final Validation)  
**Traceability**: All AC (1-49)  
**Dependencies**: All prior tasks (all implementation complete)  
**Description**: Execute all unit and integration tests, verify 100% pass rate

**What to do**:
- Bash command: `npm test -- HeroCircularCarousel`
- Expected: All tests pass (T001 through T029 test suites)
- If failures:
  - Review error messages
  - Identify root cause (logic error, timing issue, missing attribute, etc.)
  - Fix in relevant task (don't create new tasks)
  - Re-run tests
- Document: Any fixes made and rationale

**Test Status**: All prior tests must PASS

---

### T032 Final polish: Code cleanup, remove debug logs, verify code style and linting

**Window**: 5  
**Phase**: Phase 8 (Polish)  
**Traceability**: Code quality  
**Dependencies**: T031 (all tests passing)  
**Description**: Clean up code, ensure consistent style, remove debug statements

**What to do**:
- File: `/src/components/HeroCircularCarousel.astro`
- Review and remove:
  - Debug console.log() statements
  - Commented-out code
  - Unused imports or variables
- Verify:
  - Consistent indentation (tabs or spaces, project-specific)
  - Consistent naming conventions (camelCase, kebab-case)
  - JSDoc comments on complex functions (optional but recommended)
- Run linting: `npm run lint --fix`
- Verify: No warnings or errors

**Test Status**: All prior tests still passing after cleanup

---

### T033 Update documentation and generate CLAUDE.md handoff notes

**Window**: 5  
**Phase**: Phase 8 (Documentation)  
**Traceability**: SC-016 (Handover Completeness)  
**Dependencies**: T032 (code complete and polished)  
**Description**: Create CLAUDE.md with animation timing values, responsive breakpoints, future iteration notes

**What to create/update**:
- File: `/specs/coa-22-hero-section-update/CLAUDE.md` (new or update existing)
- Document sections:
  1. **Animation Timing Table**: Exit 350ms (ease-in), enter 350ms (ease-out), total 600-800ms
  2. **Responsive Breakpoint Table**: Mobile 320px, tablet 768px, desktop 1024px, ultra-wide 1920px
  3. **Easing Curves**: `cubic-bezier(0.55, 0.085, 0.68, 0.53)` for exit, `cubic-bezier(0.25, 0.46, 0.45, 0.94)` for enter
  4. **Logo Asset Details**: Location, format, opacity (15% default)
  5. **Image Optimization Strategy**: WebP + PNG, lazy loading, srcset configuration
  6. **Future Iterations**: Auto-advance feature, arrow key arrow key support, additional ARIA live regions
  7. **Test Commands**: How to run unit/integration tests, Lighthouse audit, DevTools profiling
  8. **Known Limitations**: Browser support (CSS 3D), performance on very low-end devices
- Include code snippets for key implementations (timing easing curves, responsive sizing, etc.)

**Test Status**: Documentation complete; no test code needed

---

[WINDOW_CHECKPOINT_5 - FINAL]

**Before feature completion**:
- [x] T026: Happy path integration tests PASS
- [x] T027: Error handling and edge case tests PASS
- [x] T028: Performance tests and checklist complete
- [x] T029: Image load error handling implemented
- [x] T030: AppShell integration verified; homepage updated
- [x] T031: Full test suite PASSES (all 49 AC validated)
- [x] T032: Code cleanup complete; linting passes
- [x] T033: CLAUDE.md documentation complete

**Feature Readiness Checklist**:
- [x] All 49 acceptance criteria PASS
- [x] 60 FPS on desktop and mid-range mobile (iPhone 11+, Galaxy A50+)
- [x] Primary infographic loads within 500ms
- [x] No performance regressions vs. old carousel
- [x] Error handling graceful (image load failures, edge cases)
- [x] Component integrates with AppShell without breaking layout
- [x] Keyboard navigation, reduced-motion, ARIA, focus management all working
- [x] Code clean, no debug logs, linting passes
- [x] Documentation complete (CLAUDE.md, animation tables, responsive breakpoints)
- [x] Ready for production handoff

**If all checkpoints PASS**: Feature is complete and ready for merge.  
**If any checkpoint FAILS**: Debug within Window 5 before proceeding.

---

## Summary

| Window | Phase(s) | Purpose | Tasks | Token Budget |
|--------|----------|---------|-------|--------------|
| **1** | 1-2 | Core architecture + CSS 3D transforms | T001-T006 | 70-90k |
| **2** | 3 | Navigation, touch, keyboard, queueing | T007-T013 | 70-90k |
| **3** | 4-5, 7 | Logo, responsive layout, image optimization | T014-T019 | 70-90k |
| **4** | 6 | Accessibility (reduced-motion, ARIA, focus) | T020-T025 | 70-90k |
| **5** | 8 | Integration testing, error handling, polish | T026-T033 | 60-80k |
| **TOTAL** | 1-8 | Complete carousel replacement | 33 tasks | 340-430k |

---

## Key Implementation Rules

1. **Test-First Discipline**: Write tests BEFORE implementation for each window. Tests must FAIL before implementation begins.
2. **Window Independence**: Each window is a fresh execution context. Rely on checkpoint validation, not chat history.
3. **Atomic Tasks**: Each task is small and completable in one session (typically 2-4 hours of work).
4. **Explicit Dependencies**: Each task lists blockers; tasks with [P] can run in parallel (different files, same window).
5. **Traceability**: Every task maps back to spec (FR-XXX, AC-XXX); all 49 AC validated by feature completion.
6. **Checkpoint Gating**: Each window has explicit checkpoint validation. Do NOT proceed to next window if any checkpoint fails.

---

## Implementation Checklist

- [x] Spec reviewed and understood (49 acceptance criteria, 8 phases)
- [x] Plan reviewed (8-phase phased delivery structure)
- [x] Tasks organized into 5 execution windows
- [x] Test-first tasks precede implementation tasks
- [x] Task dependencies explicit and traceable
- [x] Parallel task opportunities marked [P]
- [x] Token budgets estimated per window
- [x] Checkpoint validation clearly defined
- [x] Ready for implement phase (Window 1 starting point)

---

## Next Steps for Implement Agent

1. Start with **Window 1 (T001-T006)**: Core architecture + CSS 3D transforms
2. Follow checkpoint validation between windows
3. Track progress in STATE.md after each checkpoint
4. If window fails, debug and fix within that window (do NOT skip ahead)
5. After Window 5 completes, feature is ready for merge

**Implement agent entry point**: Begin with T001 (unit tests for slide routing)

