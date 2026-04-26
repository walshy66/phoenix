# Tasks: Position Responsibilities Carousel (COA-88)

**Input**: Specs from `/specs/coa-88-add-coaching-resources/`  
**Strategy**: Option C - Execution Windows (GSD-aligned, fresh context boundaries)  
**Total Windows**: 4  
**Estimated Tokens**: 240–320k total (60–80k per window)  

---

## Format Guide

- **[P]**: Can run in parallel (different files, same window)
- **Window N**: Fresh execution context boundary (max 3 tasks per window)
- **WINDOW_CHECKPOINT**: Validation gate before proceeding to next window
- **Traceability**: Each task maps to spec (FR-XXX, NFR-XXX, AC-X)
- **Dependency**: What prior work must complete

---

## Execution Window 1: Foundation – Data & Component Scaffolding

**Purpose**: Static position data and empty component stubs (blocking all feature work)

**Token Budget**: 60–80k

**Checkpoint Validation**:
- [ ] Position data file compiles without errors
- [ ] Component files created with proper Astro structure
- [ ] Test files stub with failing assertions (test-first discipline)
- [ ] No runtime errors in components
- [ ] Can proceed to Window 2

---

### T001 [P] Create position-data.ts with static position images array

**Window**: 1 (Foundation)  
**Phase**: Data Model  
**Traceability**: FR-003 (carousel MUST display 6 position images)  
**Dependencies**: None  

**Description**:  
Create `/src/lib/position-data.ts` with TypeScript-typed position images constant matching the spec. This is the single source of truth for all carousel slides and provides data to components.

**What to create**:
- File: `/src/lib/position-data.ts`
- Export `PositionImage` interface with fields:
  - `id: string` (e.g., "point-guard")
  - `label: string` (user-facing, e.g., "Point Guard")
  - `alt: string` (descriptive for screen readers and fallback)
  - `src: string` (image URL path, e.g., "/images/positions/roles-point-guard.png")
- Export `POSITION_IMAGES: PositionImage[]` constant with 6 entries:
  - Point Guard, Shooting Guard, Small Forward, Power Forward, Center, Coach
- Each entry includes detailed alt text per spec (NFR-004)
- Ensure TypeScript strict mode compiles without errors

**Test**: Run TypeScript compiler
```bash
npx tsc --noEmit
# Verify: No compilation errors
```

---

### T002 [P] Create PositionResponsibilitiesCarousel.astro component scaffold

**Window**: 1 (Foundation)  
**Phase**: Components  
**Traceability**: FR-005, FR-006, FR-007, FR-008 (carousel logic scaffolding)  
**Dependencies**: T001 (position data available to import)  

**Description**:  
Create `/src/components/PositionResponsibilitiesCarousel.astro` with empty component structure, proper Astro syntax, and client-side script block for carousel state management. Component will be filled in later windows; this window establishes the interface and test harness.

**What to create**:
- File: `/src/components/PositionResponsibilitiesCarousel.astro`
- Props interface:
  - `autoAdvanceMs?: number` (default: 8000, FR-005)
  - `autoAdvanceEnabled?: boolean` (default: true)
- Client-side state properties (stub):
  - `currentIndex: number` → 0
  - `autoAdvanceTimer: NodeJS.Timeout | null` → null
  - `isAnimating: boolean` → false
- HTML scaffold:
  - `<div class="carousel-container">`
  - Slides loop (render all POSITION_IMAGES, currently empty)
  - Prev/Next buttons (stub handlers)
  - Carousel indicators div (optional)
- CSS structure (Tailwind mobile-first):
  - Responsive image sizing (w-full md:max-w-lg)
  - Button positioning (absolute on sides)
  - `prefers-reduced-motion: reduce` support
  - Opacity + translate transitions (no 3D)

**Test**: Component renders without errors
```bash
npm run build
# Verify: No build errors, component compiles
```

---

### T003 [P] Create PositionResponsibilitiesModal.astro component scaffold

**Window**: 1 (Foundation)  
**Phase**: Components  
**Traceability**: FR-002, FR-010, FR-011, FR-012 (modal lifecycle scaffolding)  
**Dependencies**: None (modal is wrapper, carousel integrated in Window 2)  

**Description**:  
Create `/src/components/PositionResponsibilitiesModal.astro` as a modal wrapper reusing the existing ResourceModal pattern (Principle IX). Establishes dialog markup, close button, backdrop, and focus management skeleton.

**What to create**:
- File: `/src/components/PositionResponsibilitiesModal.astro`
- Props:
  - `isOpen?: boolean` (default: false)
  - `onClose?: () => void` (callback)
- HTML structure:
  - `<div role="dialog" aria-modal="true" aria-labelledby="modal-title">`
  - Dark backdrop overlay (z-50, bg-black/60)
  - Modal content container (white bg, rounded, p-6)
  - Header: h2 id="modal-title", close button (aria-label="Close modal")
  - Slot for carousel content
- CSS:
  - Fixed positioning (top-0 left-0 w-full h-full)
  - Responsive padding/sizing
  - Focus trap skeleton (Tab cycling)
- Client-side stubs:
  - `closeModal()` function
  - Escape key listener (stub)
  - Backdrop click handler (stub)

**Test**: Component renders without errors
```bash
npm run build
# Verify: Modal HTML structure valid, no build errors
```

---

### T004 [P] Create test file stubs with failing assertions (test-first)

**Window**: 1 (Foundation)  
**Phase**: Tests  
**Traceability**: All acceptance criteria (test-first discipline)  
**Dependencies**: T001, T002, T003 (components created)  

**Description**:  
Create 5 test files with failing test cases that will drive implementation in Windows 2–3. Tests are organized by concern (carousel logic, keyboard, modal, accessibility, responsive). Each test file imports components and position data but implementations are not yet written (tests will fail until Windows 2–3 implementation).

**What to create**:
- File: `/src/components/__tests__/PositionResponsibilitiesCarousel.test.ts`
  - Test: "renders all 6 position images" (FAIL)
  - Test: "starts on first image (index 0)" (FAIL)
  - Test: "next button advances to next slide" (FAIL)
  - Test: "prev button goes to previous slide" (FAIL)
  - Test: "next from last wraps to first" (FAIL)
  - Test: "prev from first wraps to last" (FAIL)
  - Test: "image alt text present" (FAIL)

- File: `/src/components/__tests__/PositionResponsibilitiesCarousel.animation-timing.test.ts`
  - Test: "auto-advances after 8 seconds" (FAIL, using fake timers)
  - Test: "manual next resets timer" (FAIL)
  - Test: "manual prev resets timer" (FAIL)
  - Test: "timer stops when carousel unmounts" (FAIL)

- File: `/src/components/__tests__/PositionResponsibilitiesCarousel.keyboard.test.ts`
  - Test: "right arrow key advances to next slide" (FAIL)
  - Test: "left arrow key advances to prev slide" (FAIL)
  - Test: "Escape key closes modal" (FAIL, via parent modal)

- File: `/src/components/__tests__/PositionResponsibilitiesCarousel.accessibility.test.ts`
  - Test: "prev button has aria-label='Previous position'" (FAIL)
  - Test: "next button has aria-label='Next position'" (FAIL)
  - Test: "buttons have visible focus indicator" (FAIL)
  - Test: "images have descriptive alt text" (FAIL)

- File: `/src/components/__tests__/PositionResponsibilitiesModal.test.ts`
  - Test: "modal opens on isOpen=true" (FAIL)
  - Test: "modal closes on isOpen=false" (FAIL)
  - Test: "close button closes modal" (FAIL)
  - Test: "backdrop click closes modal" (FAIL)
  - Test: "Escape key closes modal" (FAIL)
  - Test: "focus trap keeps Tab within modal" (FAIL)
  - Test: "focus returns to trigger on close" (FAIL)

**Test**: Verify test files have proper Vitest setup and all tests fail
```bash
npm test -- PositionResponsibilitiesCarousel.test.ts 2>&1 | grep -E "fail|error"
# Expect: All tests fail (no implementations yet)
```

---

[WINDOW_CHECKPOINT_1]

**Before proceeding to Window 2**:
- [ ] T001: `position-data.ts` compiles, POSITION_IMAGES array present with 6 items
- [ ] T002: `PositionResponsibilitiesCarousel.astro` renders without build errors
- [ ] T003: `PositionResponsibilitiesModal.astro` renders without build errors
- [ ] T004: All test files exist and all tests FAIL (test-first expectation)
- [ ] No runtime errors in components
- [ ] Ready to implement carousel and modal logic in Window 2

**If checkpoint fails**: Stay in Window 1, debug component structure or test harness issues.

---

## Execution Window 2: Modal & Lifecycle Management

**Purpose**: Modal wrapper with open/close behavior, focus management, backdrop, and Escape key support

**Token Budget**: 70–90k

**Checkpoint Validation**:
- [ ] Modal opens and closes without layout shift
- [ ] Escape key closes modal (AC-10)
- [ ] Close button closes modal (AC-11)
- [ ] Backdrop click closes modal (AC-12)
- [ ] Focus trap works via Tab key (AC-13)
- [ ] Focus returns to trigger card on close
- [ ] All modal-related tests passing
- [ ] Can proceed to Window 3 (carousel logic)

---

### T005 Implement PositionResponsibilitiesModal.astro lifecycle and focus management

**Window**: 2 (Modal)  
**Phase**: Implementation (Modal Lifecycle)  
**Traceability**: FR-002, FR-010, FR-011, FR-012, AC-10, AC-11, AC-12, AC-13 (full modal behavior)  
**Dependencies**: T003 (modal scaffold created), T004 (tests exist and fail)  

**Description**:  
Fully implement modal open/close logic, close button handler, backdrop click handler, Escape key listener, and focus trap (Tab cycling). Modal will integrate carousel in Window 3; this window focuses only on modal wrapper behavior.

**What to implement**:
- Client-side modal state:
  - `isOpen: boolean` (driven by prop)
  - `triggerElement: HTMLElement | null` (capture focus source for return)
  - `focusableElements: HTMLElement[]` (close button, carousel buttons to be added in Window 3)
- Close button click handler:
  - Call `onClose()` callback
  - Verify modal closes visually and fires cleanup
- Backdrop click handler:
  - Only close if click target is backdrop itself (not modal content)
  - Fire `onClose()`
- Escape key listener:
  - Add event listener on modal container
  - Press Escape → call `onClose()`
  - Does not interfere with carousel keyboard (Window 3)
- Focus management:
  - `openModal(triggerEl)`: Capture triggerEl, move focus to close button
  - `closeModal()`: Return focus to triggerEl
- Focus trap (Tab cycling):
  - When modal open, Tab navigates only within focusableElements
  - Shift+Tab cycles backward
  - When reaching last focusable, Shift+Tab goes to first
  - When reaching first focusable, Tab goes to last
- CSS:
  - Modal hidden by default (`display: none` or opacity 0)
  - Smooth transition on open/close (<200ms, per plan)
  - Backdrop fade in/out with modal

**Test Results**: All modal lifecycle tests from T004 must PASS
```bash
npm test -- PositionResponsibilitiesModal.test.ts
# Expect: 7 tests passing (open, close, button, backdrop, Escape, focus trap, focus return)
```

---

### T006 Add PositionResponsibilitiesModal trigger to coaching-resources.astro

**Window**: 2 (Modal)  
**Phase**: Integration  
**Traceability**: FR-001, AC-1 (card displays on coaching resources page)  
**Dependencies**: T005 (modal implemented)  

**Description**:  
Modify `/src/pages/coaching-resources.astro` to add the "Position Responsibilities" resource card to the resources grid and wire it to open/close the modal. The card itself reuses existing ResourceCard component; only the trigger logic is new.

**What to modify**:
- File: `/src/pages/coaching-resources.astro`
- Add resource object to resources array:
  ```typescript
  {
    title: 'Position Responsibilities',
    description: 'Visual guide to the key responsibilities and skills needed for each court position and coaching role.',
    category: 'Fundamentals',
    ageGroup: 'All Ages',
    type: 'image' as const,
    url: '#',
    thumbnail: '/images/positions/roles-point-guard.png',
    isModal: true,
  }
  ```
- Add client-side event listener:
  - Query selector for "Position Responsibilities" card (or use data-modal-trigger attribute)
  - Click handler opens modal component (e.g., calls `modal.openModal(cardEl)`)
  - Modal component is rendered on same page (not separate route)
- Ensure card styled consistently with other ResourceCard items (existing CSS)

**Test Results**: 
- Card visible on page (AC-1)
- Click card opens modal
- Modal closes gracefully
```bash
# Manual test in browser or E2E:
# Navigate to /coaching-resources
# Verify: "Position Responsibilities" card visible
# Click card → Modal opens
# Click close button → Modal closes
```

---

### T007 [P] Write and verify modal integration tests

**Window**: 2 (Modal)  
**Phase**: Tests (Modal Integration)  
**Traceability**: AC-2 (click card opens modal, no layout shift)  
**Dependencies**: T005, T006 (modal implemented and integrated)  

**Description**:  
Write integration tests that mount the full page (or modal in context), click the card, and verify modal lifecycle. Tests verify no layout shift, modal renders carousel content (placeholder for Window 3), and focus is managed correctly.

**What to create**:
- File: `/src/components/__tests__/PositionResponsibilitiesModal.integration.test.ts`
- Test: "clicking Position Responsibilities card opens modal"
- Test: "modal does not cause layout shift when opening"
- Test: "focus moves to close button when modal opens"
- Test: "modal closes and focus returns to card on close button click"
- Test: "modal closes on backdrop click"
- Test: "Escape key closes modal"
- Test: "Tab focus cycles through focusable elements (placeholder for carousel buttons in Window 3)"

**Test Results**: All integration tests PASS
```bash
npm test -- PositionResponsibilitiesModal.integration.test.ts
# Expect: 7 tests passing
```

---

[WINDOW_CHECKPOINT_2]

**Before proceeding to Window 3**:
- [ ] T005: Modal opens/closes, Escape/backdrop/button handlers working
- [ ] T005: Focus trap via Tab working correctly
- [ ] T005: Focus returns to trigger card on close
- [ ] T006: "Position Responsibilities" card added to coaching-resources page
- [ ] T006: Card visible, styled consistently with other cards
- [ ] T007: All modal integration tests passing (7 passing)
- [ ] No console errors, layout shift, or focus issues
- [ ] Ready to implement carousel logic in Window 3

**If checkpoint fails**: Stay in Window 2, debug modal handlers, focus management, or page integration issues.

---

## Execution Window 3: Carousel Logic – Navigation & Auto-Advance

**Purpose**: Carousel slide navigation, auto-advance timer, keyboard arrow navigation, and wrapping behavior

**Token Budget**: 70–90k

**Checkpoint Validation**:
- [ ] Carousel renders all 6 slides
- [ ] Manual next/prev navigation works (AC-4, AC-5)
- [ ] Wrapping behavior works (AC-6, AC-7)
- [ ] Auto-advance timer fires every 8 seconds (AC-3)
- [ ] Manual navigation resets auto-advance timer
- [ ] Keyboard arrow navigation works (AC-8, AC-9)
- [ ] All carousel logic tests passing
- [ ] Can proceed to Window 4 (accessibility, responsive, polish)

---

### T008 Implement PositionResponsibilitiesCarousel slide rendering and navigation logic

**Window**: 3 (Carousel Logic)  
**Phase**: Implementation (Carousel Navigation)  
**Traceability**: FR-004, FR-006, FR-007, FR-009, AC-4, AC-5, AC-6, AC-7 (slide display and manual navigation)  
**Dependencies**: T002 (carousel scaffold created), T004 (tests exist), T001 (position data available)  

**Description**:  
Implement carousel slide rendering from POSITION_IMAGES array, next/prev button handlers with wrapping logic, and state management for current slide index. This window does NOT yet include auto-advance or keyboard navigation (those are separate in T009).

**What to implement**:
- Component state (client-side):
  - `currentIndex: number` (0–5, which position is displayed)
  - `isAnimating: boolean` (debounce rapid clicks, optional but recommended)
- HTML slide rendering:
  - Map POSITION_IMAGES to carousel slides
  - Active slide: opacity 1, translate 0
  - Inactive slides: opacity 0, translate off-screen (or `display: none`)
  - Each slide renders `<img src={...} alt={...} loading="lazy">`
- Next button handler:
  - Increment `currentIndex`, wrapping from 5 → 0
  - Trigger slide transition (CSS opacity + transform)
  - Reset debounce timer (if implemented)
- Prev button handler:
  - Decrement `currentIndex`, wrapping from 0 → 5
  - Trigger slide transition
  - Reset debounce timer
- CSS transitions:
  - `transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out`
  - Mobile-first: smaller image (w-64 on mobile, w-96 on desktop)
  - Buttons positioned absolutely (left/right sides) with min 44×44px tap targets

**Test Results**: Carousel navigation tests from T004 must PASS
```bash
npm test -- PositionResponsibilitiesCarousel.test.ts
# Expect: 7 tests passing (renders 6, starts on first, next/prev/wrapping)
```

---

### T009 Implement auto-advance timer with reset logic

**Window**: 3 (Carousel Logic)  
**Phase**: Implementation (Auto-Advance)  
**Traceability**: FR-005, FR-007, AC-3 (auto-advance every 8 seconds)  
**Dependencies**: T008 (navigation logic implemented)  

**Description**:  
Implement 8-second auto-advance timer that continuously rotates carousel slides while modal is open. Timer must reset when user manually navigates (next/prev button or keyboard arrow). Timer must stop and clean up when carousel unmounts (modal closes).

**What to implement**:
- Client-side state:
  - `autoAdvanceTimer: NodeJS.Timeout | null` (reference for cleanup)
  - `autoAdvanceMs: number = 8000` (from props, configurable)
- Methods:
  - `startAutoAdvance()`: Begin setInterval calling `next()` every 8000ms
  - `resetAutoAdvance()`: Clear current timer, start fresh interval
  - `stopAutoAdvance()`: Clear timer on unmount or modal close
- Auto-advance lifecycle:
  - Start on component mount IF `autoAdvanceEnabled === true`
  - Call `resetAutoAdvance()` from next/prev button handlers
  - Call `resetAutoAdvance()` from keyboard arrow handlers (Window 3 T009)
  - Call `stopAutoAdvance()` on component unmount (via Astro lifecycle hook)
  - Call `stopAutoAdvance()` when modal closes (parent calls method or prop)
- Edge cases:
  - Rapid clicks: next/prev might be called while auto-advance is pending
    - Solution: debounce with `isAnimating` flag or just reset timer
  - Modal closes: ensure timer cleaned up (no lingering setInterval)
  - Browser tab hidden: `visibilitychange` event could pause (nice-to-have, not MVP)

**Test Results**: Auto-advance timing tests from T004 must PASS
```bash
npm test -- PositionResponsibilitiesCarousel.animation-timing.test.ts
# Expect: 4 tests passing (auto-advance 8s, manual reset timer, timer cleanup)
```

---

### T010 Implement keyboard arrow navigation and integrate with modal

**Window**: 3 (Carousel Logic)  
**Phase**: Implementation (Keyboard Navigation)  
**Traceability**: FR-008, AC-8, AC-9 (arrow keys navigate carousel)  
**Dependencies**: T008, T009 (carousel navigation and auto-advance complete)  

**Description**:  
Add keyboard event listeners for left/right arrow keys. When modal is open and carousel is focused, arrow keys navigate slides and reset auto-advance timer. Escape key is handled by parent modal (T005). Ensure no conflicts with modal focus trap (Tab).

**What to implement**:
- Keyboard listener (scope to carousel or modal):
  - Right arrow (ArrowRight): call `next()`, reset auto-advance
  - Left arrow (ArrowLeft): call `prev()`, reset auto-advance
  - Escape: delegated to parent modal (listener exists in T005)
- Event handling:
  - `e.preventDefault()` on arrow keys (prevent page scroll)
  - Only respond if modal is open (check visibility or prop)
- Focus requirements:
  - Keyboard navigation works when focus is on carousel buttons or carousel container
  - Does not require focus on a specific button (global keyboard handler in modal is acceptable)
- Integration with modal:
  - Carousel arrow handlers do NOT close modal
  - Escape closes modal (handled by parent)
  - Tab cycles through carousel buttons and close button (handled by focus trap in T005/T006)

**Test Results**: Keyboard navigation tests from T004 must PASS
```bash
npm test -- PositionResponsibilitiesCarousel.keyboard.test.ts
# Expect: 3 tests passing (right arrow next, left arrow prev, Escape closes modal via parent)
```

---

[WINDOW_CHECKPOINT_3]

**Before proceeding to Window 4**:
- [ ] T008: Carousel renders 6 slides, manual next/prev work
- [ ] T008: Wrapping behavior works (last → first, first → last)
- [ ] T008: Navigation tests passing (7 passing)
- [ ] T009: Auto-advance timer fires every 8 seconds
- [ ] T009: Manual navigation resets timer
- [ ] T009: Timer cleaned up on unmount
- [ ] T009: Animation timing tests passing (4 passing)
- [ ] T010: Arrow keys navigate carousel
- [ ] T010: Keyboard navigation tests passing (3 passing)
- [ ] Carousel integrated with modal from Window 2
- [ ] All 15 manual acceptance criteria can be tested (AC-1 through AC-15)
- [ ] Ready to finalize accessibility, responsive design, and polish in Window 4

**If checkpoint fails**: Stay in Window 3, debug carousel logic, timer lifecycle, or keyboard handlers.

---

## Execution Window 4: Accessibility, Responsive Design & Polish

**Purpose**: ARIA labels, keyboard focus management, mobile/desktop responsive layouts, error handling, and final testing

**Token Budget**: 60–80k

**Checkpoint Validation**:
- [ ] All 15 acceptance criteria passing (manual + automated)
- [ ] WCAG 2.1 AA accessibility verified (ARIA, focus, color contrast)
- [ ] Mobile (320–480px) and desktop (768px+) layouts responsive
- [ ] 44×44px tap targets on mobile (NFR-008)
- [ ] Image fallback for load failures (NFR-010)
- [ ] 60fps carousel animations verified in browser
- [ ] All edge cases handled (rapid clicks, modal close timing, etc.)
- [ ] Ready for merge and deployment

---

### T011 Add comprehensive ARIA labels and accessibility attributes

**Window**: 4 (Polish)  
**Phase**: Accessibility  
**Traceability**: NFR-001, NFR-002, NFR-003, NFR-004, NFR-005, AC-13 (full a11y compliance)  
**Dependencies**: T005, T008, T010 (modal and carousel complete)  

**Description**:  
Add ARIA labels, semantic HTML, and focus indicators to ensure WCAG 2.1 AA compliance. Update all interactive elements (buttons, images, modal, carousel) with descriptive labels, roles, and relationships.

**What to implement**:
- Modal accessibility:
  - `role="dialog"` (already on modal element)
  - `aria-modal="true"` (already on modal element)
  - `aria-labelledby="modal-title"` (link to h2 title)
  - h2 with `id="modal-title"` containing "Position Responsibilities"
  - Close button: `aria-label="Close modal"`
- Carousel accessibility:
  - Prev button: `aria-label="Previous position"` (NFR-001)
  - Next button: `aria-label="Next position"` (NFR-001)
  - Carousel container: `role="region" aria-label="Position carousel"`
  - Each slide: semantic `<img>` with descriptive `alt` (already in T001 position data)
- Focus indicators:
  - All buttons: `:focus-visible` outline with high contrast (Tailwind `focus:outline-2 focus:outline-offset-2`)
  - Ensure 3:1 contrast ratio on focus ring
- Keyboard navigation:
  - Focus trap (T005) ensures Tab cycles only within modal
  - Arrow keys navigate carousel (T010)
  - Escape closes modal (T005)

**Test Results**: Accessibility tests from T004 must PASS
```bash
npm test -- PositionResponsibilitiesCarousel.accessibility.test.ts
# Expect: 4 tests passing (aria-labels, focus indicators, alt text)
# Manual: Run axe-core browser extension
# Verify: No WCAG AA violations
```

---

### T012 Implement responsive layout for mobile (320–480px) and desktop (768px+)

**Window**: 4 (Polish)  
**Phase**: Responsive Design  
**Traceability**: NFR-007, NFR-008, NFR-009, AC-14, AC-15 (responsive compliance)  
**Dependencies**: T008 (carousel CSS structure)  

**Description**:  
Refine Tailwind CSS to ensure carousel displays correctly across all breakpoints. Carousel images scale proportionally, buttons have 44×44px tap targets on mobile, text is readable, and spacing is proportional.

**What to implement**:
- Mobile-first CSS (320px base):
  - Image size: `w-64 h-80` (256px × 320px, fits within 320px viewport)
  - Button size: `w-12 h-12` (48px × 48px, exceeds 44px minimum)
  - Button padding: generous tap targets with touch-friendly spacing
  - Modal padding: `px-4 py-6` (small margins on narrow screens)
  - Title text: `text-xl` (readable on small screens)
  - Image alt text fallback: readable on mobile
- Tablet breakpoints (768px):
  - Image size: `md:w-96 md:h-full` (384px, fills more space)
  - Modal max-width: `md:max-w-2xl` (capped at 672px)
  - Button size remains `w-12 h-12` (still 48px)
- Desktop breakpoints (1024px+):
  - Image size: `lg:w-full lg:max-w-3xl` (up to 768px)
  - Modal centered with side padding
  - Button size: optional increase to `lg:w-14 lg:h-14` (56px for extra comfort)
- Responsive image loading:
  - Use `loading="lazy"` to defer off-screen slides
  - Ensure critical image (first slide) loads immediately
- CSS validation:
  - `prefers-reduced-motion: reduce` still honored (animations disabled if user prefers)
  - Font sizes scale proportionally (`text-base`, `text-lg`, `text-xl` matched to breakpoints)

**Test Results**: Responsive design tests from T004 must PASS
```bash
npm test -- PositionResponsibilitiesCarousel.responsive.test.ts
# Expect: Tests verify image scaling, button tap targets, text readability
# Manual: Test on DevTools emulation (iPhone 390px, iPad 768px, Desktop 1440px)
# Verify: No text overflow, buttons easily tappable, images scale proportionally
```

---

### T013 Implement image error handling and edge case management

**Window**: 4 (Polish)  
**Phase**: Error Handling & Edge Cases  
**Traceability**: NFR-010 (graceful degradation on image load failure), Edge Case list in plan.md  
**Dependencies**: T008 (carousel rendering)  

**Description**:  
Add image error handler to display fallback message if any position image fails to load. Ensure carousel remains functional and modal can be closed even if images fail. Handle rapid button clicks with debouncing or queue logic.

**What to implement**:
- Image load error handler:
  - Add `onerror` listener on each carousel `<img>` tag
  - Display fallback text (e.g., "Image unavailable") if load fails
  - Prevent carousel crash; other slides still navigable
  - User can still close modal via button/Escape/backdrop
  - Optional: Log error for observability (NFR-011)
- Rapid click debouncing:
  - Use `isAnimating` flag to ignore clicks during 300ms transition
  - Or: queue rapid navigation (e.g., click next 5 times rapidly → advances 5 times)
  - Recommended: ignore extra clicks (simpler, prevents confusion)
- Modal close during animation:
  - Ensure `stopAutoAdvance()` called even if carousel is mid-animation
  - Clear any pending animation frames or CSS transitions
  - Focus properly returned to trigger card

**Test Results**: Edge case tests (implied in T004, explicit manual tests)
```bash
# Manual tests:
# 1. Simulate image load failure: DevTools → Network → disable image load
# 2. Navigate carousel, verify fallback message displays
# 3. Close modal with failed images, verify focus returns
# 4. Rapid button clicks (hold next button), verify carousel smoothly advances (not jumpy)
# 5. Close modal while carousel animating, verify no visual artifacts or stuck timers
```

---

### T014 [P] Final acceptance criteria verification and polish

**Window**: 4 (Polish)  
**Phase**: Final Testing & Documentation  
**Traceability**: All 15 acceptance criteria (AC-1 through AC-15)  
**Dependencies**: T011, T012, T013 (all features complete)  

**Description**:  
Run all manual acceptance criteria tests from spec, verify edge cases, audit code for quality, and ensure documentation is complete. This is the final validation before merge.

**What to do**:
- **Manual acceptance testing**:
  - [ ] AC-1: Card displays on coaching resources page ✓
  - [ ] AC-2: Click card opens modal (no layout shift) ✓
  - [ ] AC-3: Auto-advance after 8 seconds ✓
  - [ ] AC-4: Click Next advances + resets timer ✓
  - [ ] AC-5: Click Prev advances + resets timer ✓
  - [ ] AC-6: Next from last wraps to first ✓
  - [ ] AC-7: Prev from first wraps to last ✓
  - [ ] AC-8: Right arrow key navigates next ✓
  - [ ] AC-9: Left arrow key navigates prev ✓
  - [ ] AC-10: Escape key closes modal ✓
  - [ ] AC-11: Close button closes modal ✓
  - [ ] AC-12: Backdrop click closes modal ✓
  - [ ] AC-13: Tab focus trap (desktop & mobile) ✓
  - [ ] AC-14: Mobile responsive (320–480px) ✓
  - [ ] AC-15: Desktop responsive (768px+) ✓

- **Automated test suite**:
  ```bash
  npm test -- PositionResponsibilitiesCarousel
  npm test -- PositionResponsibilitiesModal
  # Verify: All tests passing (25+ tests total)
  ```

- **Code quality**:
  - Run linter: `npm run lint` (no warnings)
  - TypeScript check: `npx tsc --noEmit` (no errors)
  - Build: `npm run build` (clean build)
  - Code review checklist:
    - [ ] Components follow Astro best practices
    - [ ] Tailwind classes use established conventions
    - [ ] No dead code or console.logs left behind
    - [ ] Comments explain non-obvious logic
    - [ ] Files organized in proper directories

- **Accessibility audit**:
  - Browser: Install axe DevTools or use Lighthouse
  - Manual test: Tab through all interactive elements
  - Verify: No WCAG 2.1 AA violations
  - Verify: 44×44px tap targets on mobile
  - Verify: Color contrast 4.5:1 on text

- **Performance**:
  - DevTools: Record carousel navigation animation
  - Verify: 60fps animation (no dropped frames)
  - Verify: Modal open/close < 200ms
  - Check: No memory leaks (timers cleaned up)

- **Documentation**:
  - Verify spec.md is current
  - Verify plan.md notes any deviations
  - Add comment headers to components if needed
  - Example: ` Carousel rotates images on 8-second interval with manual prev/next navigation.`

**Test Results**: All manual tests PASS, test suite green, build clean
```bash
npm test 2>&1 | tail -20
# Expect: "XX passed" (no failures)

npm run build 2>&1 | tail -10
# Expect: Clean build, no errors/warnings
```

---

[WINDOW_CHECKPOINT_4 — FEATURE COMPLETE]

**Feature is complete when**:
- [ ] T011: ARIA labels and accessibility attributes implemented
- [ ] T012: Responsive layout tested on mobile (320px) and desktop (1440px)
- [ ] T013: Image error handling and edge cases working
- [ ] T014: All 15 manual acceptance criteria PASS
- [ ] T014: All automated tests PASS (25+ tests green)
- [ ] T014: Code quality checks PASS (linter, TypeScript, build)
- [ ] T014: Performance verified (60fps animations, <200ms transitions)
- [ ] T014: Accessibility audit PASS (no WCAG AA violations)
- [ ] No layout shifts, focus traps, or visual artifacts
- [ ] Ready for code review and merge to `main`

**If checkpoint fails**: Review failing criterion, fix in Window 4, re-run tests. Do NOT merge until all passing.

---

## Summary

**Total Execution Windows**: 4  
**Estimated Tokens**:
- Window 1 (Foundation): 60–80k tokens
- Window 2 (Modal): 70–90k tokens
- Window 3 (Carousel): 70–90k tokens
- Window 4 (Polish): 60–80k tokens
- **Total**: 260–340k tokens (vs. 400k+ in single session)

**Savings**: ~100k tokens by isolating execution into clean windows with explicit checkpoints.

**Task Distribution**:
- Window 1: 4 tasks (data, 2 scaffolds, tests)
- Window 2: 3 tasks (modal implementation, card integration, tests)
- Window 3: 3 tasks (navigation, auto-advance, keyboard)
- Window 4: 3 tasks (accessibility, responsive, polish + final validation)

**Key Principles**:
1. **Test-First Discipline**: All tests written in T004, failing before implementation
2. **Fresh Context Boundaries**: Each window executed as isolated 200k context
3. **Checkpoint Gates**: Explicit validation before proceeding to next window
4. **Traceability**: Every task maps to spec requirement (FR-XXX, AC-X, NFR-XXX)
5. **Parallel Opportunities**: T001, T002, T003, T004 all marked [P] (independent file creation)
6. **Clear Dependencies**: Later windows depend on prior window checkpoints, not conversation history

---

## Implementation Sequence

1. **Before Window 1**: Ensure position images (`/public/images/positions/*.png`) are available
2. **Window 1 Start**: Clear context, load spec + plan, implement T001–T004
3. **Window 1 End**: Checkpoint validation, update STATE.md with results
4. **Window 2 Start**: Fresh context, read STATE.md checkpoint, implement T005–T007
5. **Window 2 End**: Checkpoint validation, update STATE.md
6. **Window 3 Start**: Fresh context, implement T008–T010
7. **Window 3 End**: Checkpoint validation, update STATE.md
8. **Window 4 Start**: Fresh context, implement T011–T014
9. **Feature Complete**: All checkpoints pass, merge to `main`

---

## Notes for Implement Agent

- **Astro Component Structure**: Components use `.astro` files with embedded `<script>` for client-side state. No separate `.js` files needed (Astro compiles to static HTML + inline scripts).
- **Tailwind CSS**: Mobile-first responsive design. No CSS-in-JS or external stylesheets (all Tailwind utility classes).
- **Test Framework**: Vitest with `@testing-library/astro` or similar. Tests are unit + integration (no E2E at this stage).
- **TypeScript**: Strict mode enabled. Type all props and state.
- **No New Dependencies**: Feature uses only existing Astro, Tailwind, TypeScript, Vitest (zero new npm packages).
- **State.md**: Implement agent will track checkpoint progress across windows in STATE.md, not in chat history.

---

**Prepared by**: Claude Code Tasks Agent  
**Date**: 2026-04-25  
**Feature**: COA-88 Position Responsibilities Carousel  
**Branch**: `cameronwalsh/coa-88-add-coaching-resources`
