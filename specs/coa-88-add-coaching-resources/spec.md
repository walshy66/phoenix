# Feature Specification: Add Position Responsibilities Carousel

**Status**: READY_FOR_DEV  
**Feature Branch**: `cameronwalsh/coa-88-add-coaching-resources`  
**Created**: 2026-04-25  
**Priority**: P1

## Summary

Add a "Position Responsibilities" resource card to both the player and coaching resources sections of the resources page that launches a carousel modal displaying 6 position responsibility images. The carousel auto-rotates every 8 seconds with manual navigation via prev/next buttons. This feature helps coaches and players understand the key responsibilities and skills needed for each court position.

---

## User Scenarios & Testing

### User Story 1 – View Position Responsibilities Carousel (Priority: P1)

A coach or player navigates to the resources page, opens either the Players or Coaching section, discovers the "Position Responsibilities" card, and clicks it to open a modal. Inside the modal, a carousel displays the 6 uploaded position responsibility images sequentially. The carousel auto-advances every 8 seconds, and the user can manually navigate using prev/next buttons or keyboard arrows.

**Why this priority**: Core feature deliverable. Provides coaches with a quick visual reference for position responsibilities.

**Independent Test**: Visit resources page → switch to Players section and Coaching section → locate "Position Responsibilities" card in each → click to open modal → carousel displays first image → auto-advances after 8s → manual navigation (prev/next) works → keyboard navigation (arrow keys) works → modal closes cleanly

**Acceptance Scenarios**:

1. **Given** the resources page is loaded and the Players section is visible, **When** a user clicks the "Position Responsibilities" card, **Then** a modal opens with the first position image displayed in focus
2. **Given** the carousel modal is open and displaying an image, **When** 8 seconds elapse without user interaction, **Then** the carousel advances to the next image automatically
3. **Given** the carousel is displaying any image, **When** the user clicks the "Next" button, **Then** the next image displays immediately and the auto-advance timer resets
4. **Given** the carousel is displaying any image, **When** the user clicks the "Prev" button, **Then** the previous image displays immediately and the auto-advance timer resets
5. **Given** the carousel is displaying the last image, **When** the user clicks "Next", **Then** the carousel wraps to the first image
6. **Given** the carousel is displaying the first image, **When** the user clicks "Prev", **Then** the carousel wraps to the last image
7. **Given** the carousel modal is open, **When** the user presses the right arrow key, **Then** the carousel advances to the next image (same as clicking Next)
8. **Given** the carousel modal is open, **When** the user presses the left arrow key, **Then** the carousel advances to the previous image (same as clicking Prev)
9. **Given** the carousel modal is open, **When** the user clicks the close button or clicks outside the modal, **Then** the modal closes, the carousel stops auto-advancing, and focus returns to the resource card that opened it

---

## Requirements

### Functional Requirements

- **FR-001**: Coaching resources page MUST display a "Position Responsibilities" resource card in the same layout and styling as other resource cards
- **FR-002**: Clicking the "Position Responsibilities" card MUST open a modal dialog
- **FR-003**: Modal MUST display a carousel showing 6 position responsibility images (point guard, shooting guard, small forward, power forward, center, coach)
- **FR-004**: Carousel MUST start on the first image when modal opens
- **FR-005**: Carousel MUST auto-advance to the next image every 8 seconds when no user interaction occurs
- **FR-006**: Carousel MUST provide prev/next navigation buttons positioned on both sides of the image
- **FR-007**: Clicking prev/next button MUST immediately display the target image and reset the 8-second auto-advance timer
- **FR-008**: Carousel MUST support keyboard navigation: left arrow = prev, right arrow = next
- **FR-009**: Carousel navigation MUST wrap: after the last image, next advances to the first; before the first image, prev advances to the last
- **FR-010**: Modal MUST provide a close button in the top-right corner
- **FR-011**: Modal MUST close when the user clicks the close button or clicks outside the modal (backdrop)
- **FR-012**: When modal closes, the carousel auto-advance timer MUST stop and not restart

### Non-Functional Requirements

- **NFR-001** (Accessibility): All carousel navigation buttons MUST have descriptive `aria-label` text (e.g., "Previous position", "Next position")
- **NFR-002** (Accessibility): Modal MUST have `role="dialog"` and `aria-modal="true"`
- **NFR-003** (Accessibility): Modal title MUST be linked via `aria-labelledby` to the modal's heading
- **NFR-004** (Accessibility): Carousel images MUST have appropriate `alt` text describing the position and key responsibilities
- **NFR-005** (Accessibility): Keyboard focus MUST be visible on all interactive elements (buttons); focus trap MUST keep Tab key within modal while open
- **NFR-006** (Keyboard Navigation): Escape key MUST close the modal
- **NFR-007** (Responsive Layout): Carousel MUST render correctly on mobile (portrait, 320px–480px) and desktop (768px+)
- **NFR-008** (Responsive Layout): Navigation buttons MUST have at least 44×44px tap targets on mobile (WCAG 2.5.5 AA)
- **NFR-009** (Responsive Layout): Image MUST scale proportionally on all screen sizes without distortion
- **NFR-010** (Error Handling): If an image fails to load, the carousel MUST display a fallback message and allow the user to dismiss the modal gracefully
- **NFR-011** (Observability): Carousel interactions (next/prev button clicks, keyboard navigation, auto-advance) SHOULD be logged for analytics (optional at this stage)
- **NFR-012** (Performance): Carousel animations MUST be smooth (60fps); prefers-reduced-motion MUST be respected

### Key Entities

- **Position Image**: Represents a court position's responsibilities and key skills
  - `id`: Unique identifier (e.g., `point-guard`, `shooting-guard`, `small-forward`, `power-forward`, `center`, `coach`)
  - `src`: Public URL path to the image file (e.g., `/images/positions/roles-point-guard.png`)
  - `alt`: Concise descriptive text for screen readers and fallback display
  - `label`: Human-readable label displayed to users (e.g., "Point Guard")

---

## Success Criteria

- Carousel auto-rotates smoothly every 8 seconds without stuttering or missing frames
- Manual navigation (prev/next buttons) responds immediately with no perceivable delay
- Modal is dismissible via close button, backdrop click, or Escape key
- All 6 position images display correctly at original resolution on mobile (320–480px) and desktop (768px+)
- Keyboard navigation (arrow keys) works reliably; Tab key navigation includes all interactive elements and does not escape the modal while open
- Carousel component implementation is reusable and can be applied to other carousel scenarios in the future
- Analytics/observability logging is in place (if logging is implemented in parallel or future)

---

## Edge Cases & Error Handling

- **Missing or Broken Images**: If one or more position images fail to load, the carousel MUST display a placeholder or error state without crashing; user MUST be able to close the modal
- **Rapid Button Clicks**: Clicking next/prev multiple times in quick succession MUST queue or ignore subsequent clicks until the current animation completes (no animation conflict)
- **Auto-Advance While Modal Closing**: If modal close is triggered while carousel is animating, timer and animations MUST be cancelled cleanly
- **Keyboard Focus Lost**: If focus is somehow lost during carousel operation, subsequent keyboard input (arrows, Escape) MUST still be captured
- **Mobile Touch Gestures**: Swiping left/right on mobile MAY be supported (nice-to-have) to advance the carousel; swiping right = prev, swiping left = next
- **Very Small Screens**: On screens under 320px (edge case), the carousel MUST remain usable with properly sized tap targets and responsive text

---

## Acceptance Criteria

1. **Given** the resources page loads and I open the Players or Coaching section, **When** I scroll to the resources grid, **Then** I see a "Position Responsibilities" card with the same visual style and layout as other resource cards (matching ResourceCard component design)
2. **Given** the "Position Responsibilities" card is visible, **When** I click on it (on desktop) or tap it (on mobile), **Then** a modal dialog opens smoothly with no layout shift or page scroll
3. **Given** the modal is open and displaying the first position image, **When** I wait without interacting, **Then** the image automatically changes to the next position after exactly 8 seconds
4. **Given** the carousel is displaying any position image, **When** I click the "Next" button, **Then** the carousel transitions to show the next position image immediately, and the 8-second auto-advance timer resets
5. **Given** the carousel is displaying any position image, **When** I click the "Prev" button, **Then** the carousel transitions to show the previous position image immediately, and the 8-second auto-advance timer resets
6. **Given** the carousel is on the last position image (Coach), **When** I click "Next", **Then** the carousel wraps to the first position image (Point Guard)
7. **Given** the carousel is on the first position image (Point Guard), **When** I click "Prev", **Then** the carousel wraps to the last position image (Coach)
8. **Given** the modal is open, **When** I press the right arrow key on my keyboard, **Then** the carousel advances to the next position image
9. **Given** the modal is open, **When** I press the left arrow key on my keyboard, **Then** the carousel advances to the previous position image
10. **Given** the modal is open, **When** I press the Escape key, **Then** the modal closes and focus returns to the "Position Responsibilities" card
11. **Given** the modal is open, **When** I click the close (X) button in the top-right corner, **Then** the modal closes and focus returns to the "Position Responsibilities" card
12. **Given** the modal is open, **When** I click on the backdrop (dark area outside the modal), **Then** the modal closes and focus returns to the "Position Responsibilities" card
13. **Given** the modal is open, **When** I press the Tab key repeatedly, **Then** focus cycles through the close button and next/prev buttons only; focus does not escape the modal
14. **On mobile** (320px–480px width), **When** the modal is open, **Then** the carousel image and buttons scale responsively; all buttons have at least 44×44px tap targets
15. **On desktop** (768px+ width), **When** the modal is open, **Then** the carousel displays at a larger scale with proportional spacing; image quality is preserved

---

## Constitutional Compliance

- **✅ Principle I (User Outcomes First)**: Each user story has an explicitly measurable outcome (images rotate, modal opens/closes, navigation works). Success criteria trace user behavior change.

- **✅ Principle II (Test-First Discipline)**: All acceptance criteria are testable and observable (user interactions → observable state changes). Edge cases include error scenarios (image load failure).

- **✅ Principle III (Backend Authority & Invariants)**: Position data and image URLs are static (part of the frontend app); no server-side inference needed. If position data is sourced from the server in the future, it MUST be validated server-side.

- **✅ Principle IV (Error Semantics & Observability)**: Spec includes error handling for missing/broken images with fallback states. Observability logging is noted as optional (NFR-011).

- **✅ Principle V (AppShell Integrity)**: Modal is a dialog overlay within the AppShell and uses the existing ResourceModal pattern. No custom navigation shell is introduced.

- **✅ Principle VI (Accessibility First)**: Comprehensive accessibility requirements included: keyboard navigation (arrows, Tab, Escape), ARIA labels, focus management, focus trap in modal, tap targets (44×44px), alt text on images.

- **✅ Principle VII (Immutable Data Flow)**: Carousel state (current index, auto-advance timer) is client-side only. No mutation of position data; state flows from carousel component to UI.

- **✅ Principle VIII (Dependency Hygiene)**: Reuses existing Astro component patterns (HeroCircularCarousel, ResourceModal). No new third-party dependencies required.

- **✅ Principle IX (Cross-Feature Consistency)**: Implementation follows established patterns: ResourceCard for the trigger, existing modal lifecycle, carousel animation similar to HeroCircularCarousel.

---

## Notes for Implementation

- **Carousel Pattern**: Implementation should follow the pattern established by the HeroCircularCarousel component (existing 3D coverflow approach is not required; a simpler slide-based carousel is acceptable for position images)
- **Modal Integration**: Reuse the existing ResourceModal component structure for modal wrapper, close button, and backdrop handling
- **Data Source**: 6 position responsibility images must be available in the static assets directory (`/public/images/positions/`); filenames and alt text should be determined during implementation planning
- **No Server Data Required**: Position list is static (fixed 6 positions); no database queries or API calls needed for MVP
