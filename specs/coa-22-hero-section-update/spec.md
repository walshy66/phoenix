# Feature Specification: Hero Section Circular Card Carousel

**Feature Branch**: `cameronwalsh/coa-22-hero-section-update`  
**Created**: 2026-04-07  
**Status**: READY_FOR_DEV  
**Input**: User description: "Hero cards should be large portrait-format infographics that rotate in a circular pattern. When you click to see the next card, it rotates in from the side, the current card moves out and around to the side/back, and fades away."  
**Scope**: **Complete replacement** of existing HeroCarousel landscape flip interaction with new portrait-format circular carousel. Old carousel will be deprecated.  
**Priority**: P1 (Core hero redesign)

## User Scenarios & Testing

### User Story 1 - Circular Card Carousel with Large Portrait Infographics (Priority: P1)

Replace the current flip-card interaction with a prominent circular carousel featuring large, portrait-format infographic cards (e.g., 400-500px wide, taller aspect ratio). When a user clicks "next," the current infographic rotates out to the side/back while fading, and the next card rotates in from the opposite side. The primary card is the focal point of the hero section.

**Why this priority**: Core interaction redesign with new visual hierarchy. Directly replaces existing flip-card behavior. Infographics become the primary content anchor, creating a much more visually engaging hero experience.

**Independent Test**: Can be fully tested by:

* Confirming infographic cards display at large, prominent size (40-50% of viewport width minimum)
* Clicking through cards and observing rotation + fade effect
* Verifying all cards cycle correctly in order
* Confirming responsive sizing on mobile/tablet/desktop

**Acceptance Scenarios**:

1. **Given** the hero section loads with Infographic Card 1 visible, **When** a user views it, **Then** the infographic dominates the hero section as the primary focal point
2. **Given** a user clicks the next/forward button, **When** the animation triggers, **Then** Card 1 rotates out to the side/back along the Y-axis while fading, and Card 2 rotates in from the opposite side with simultaneous fade-in
3. **Given** cards are rotating, **When** the animation completes (within 600-800ms), **Then** the next infographic is fully visible, centered, and at the same prominent size as the previous one
4. **Given** a user at the last card, **When** they click next, **Then** the carousel loops back to Card 1 with the same rotation effect
5. **Given** different screen sizes (mobile 320px+, tablet 768px+, desktop 1024px+), **When** the carousel rotates, **Then** infographics scale responsively while maintaining portrait aspect ratio and prominence
6. **Given** a user clicks next/prev button during an active animation, **When** the click occurs, **Then** the request is queued and executes after the current animation completes (no dropped clicks, no simultaneous rotations)
7. **Given** a user on mobile with touch support, **When** they swipe left/right on the infographic, **Then** swiping left rotates to the next card, swiping right rotates to the previous card (minimum 45px swipe distance to prevent accidental triggers)
8. **Given** a user accesses the carousel via keyboard (Tab/arrow keys), **When** they navigate, **Then** focus remains visible and next/previous buttons respond to click and keyboard interaction
9. **Given** a user has `prefers-reduced-motion` enabled in OS settings, **When** the carousel rotates, **Then** animations transition to fade-only without 3D rotation, preserving carousel functionality

---

### User Story 2 - Logo as Background Decal (Priority: P1)

Incorporate the Bendigo Phoenix logo as a subtle background decal to break up the solid purple background and reinforce brand identity without overwhelming the prominent infographic carousel.

**Why this priority**: Complements the P1 carousel. Adds visual depth and branding behind the large infographics.

**Independent Test**: Can be tested by viewing the hero section and confirming the logo appears subtly behind infographics without interfering with visibility or readability.

**Acceptance Scenarios**:

1. **Given** the hero section renders with a large infographic, **When** a user views it, **Then** the Bendigo Phoenix logo appears as a faded background decal
2. **Given** infographics are rotating, **When** they move through animation, **Then** the logo remains static behind them without obscuring infographic content
3. **Given** different text and infographic states, **When** the user views content, **Then** infographic content remains fully readable and prominent

---

### User Story 3 - Polish: Rotation Direction, Speed & Easing (Priority: P2)

Fine-tune the rotation animation with appropriate speed, easing curves, and directional logic tailored to the large infographic format. Ensure rotation feels natural and responsive with large visuals.

**Why this priority**: Refines the feel of P1. Can iterate post-MVP. Depends on basic carousel working first.

**Independent Test**: Can be tested by adjusting animation timing and easing, then visually confirming the carousel feels smooth with large portrait cards.

**Acceptance Scenarios**:

1. **Given** an infographic rotation is triggered, **When** the animation plays, **Then** it uses an appropriate easing curve (e.g., cubic-bezier) for smooth, natural motion
2. **Given** multiple quick clicks, **When** a user rapidly cycles infographics, **Then** animations queue or skip smoothly without breaking the interaction
3. **Given** different devices, **When** animations run, **Then** they maintain consistent timing and smoothness despite infographic size

---

### Edge Cases

* **Rapid Clicks During Animation**: User clicks next/prev while animation is in progress → **RESOLVED**: Clicks are queued and executed sequentially after animation completes (see acceptance scenario 6)
* **Keyboard Navigation**: User accesses carousel with keyboard only → **RESOLVED**: Next/prev buttons are focusable; arrow keys (or alternative accessible input) trigger rotation (see acceptance scenario 8)
* **Focus Management During Animation**: User presses Tab during card rotation → **RESOLVED**: Focus trap must be implemented; if focus is on button, button remains focusable but interaction is ignored until animation completes
* **Reduced Motion Preference**: User has `prefers-reduced-motion` enabled → **RESOLVED**: 3D rotations disable and fade-only transitions activate (see acceptance scenario 9)
* **Performance on Low-End Devices**: Large infographic assets loaded on older mobile hardware → **MITIGATED**: WebP + fallback format, lazy loading for non-primary cards, GPU acceleration via CSS transforms (see FR-012)
* **Mobile Portrait Display**: Infographics on small screens (< 375px width) → **RESOLVED**: Max-width constraint (~90vw) with padding ensures readability; portrait aspect ratio maintained
* **Touch Swipe Support**: Users on touch devices expect swipe interaction → **RESOLVED**: Swipe gesture support implemented as P1 requirement and fallback for touch devices; note that 3D globe-like rotation may feel different from traditional horizontal swipe patterns (left swipe = next, right swipe = prev, 45px minimum distance)
* **Logo Decal Visibility**: Logo obscures infographic content or reduces readability → **MITIGATED**: Logo opacity capped at 20% maximum; positioned behind cards; does not overlay text/critical elements
* **Accessibility Compliance**: Carousel must meet WCAG 2.1 AA standards → **RESOLVED**: Keyboard navigation, ARIA labels, focus indicators, reduced-motion support all required (see FR-010, NFR-001 to NFR-005)
* **Responsive Breakpoint Scaling**: Infographics render at inconsistent sizes across breakpoints → **RESOLVED**: Specific sizing defined per breakpoint in Technical Notes

## Requirements

### Functional Requirements

* **FR-001**: Hero section MUST display a circular card carousel with large, prominent portrait-format infographic cards as the primary focal point, completely replacing the existing landscape flip carousel
* **FR-002**: Primary infographic MUST occupy a substantial portion of the hero section (40-50% of viewport width minimum on desktop; responsive scaling down to ~90vw max-width on mobile within padding constraints)
* **FR-003**: Infographic cards MUST maintain portrait aspect ratio (~3:4 or ~600px tall for ~450px width)
* **FR-004**: When a user clicks the "next" button OR swipes left on mobile, the current infographic MUST rotate out to the side/back along the Y-axis while simultaneously fading away (opacity 1→0)
* **FR-005**: The next infographic in sequence MUST rotate into view from the opposite side along the Y-axis with simultaneous fade-in (opacity 0→1); entrance easing MUST feel smooth and natural
* **FR-006**: Cards MUST use 3D CSS transforms (`perspective`, `rotateY`, `translateZ`) to create the illusion of circular motion with proper depth perception
* **FR-007**: The carousel MUST loop: after the last card, clicking next shows Card 1 with the same rotation effect; reverse is true for previous
* **FR-008**: The Bendigo Phoenix logo MUST appear as a static background decal (10-20% opacity, recommended ~15%) behind rotating infographics without moving during animation
* **FR-009**: Logo decal MUST NOT obscure infographic content or reduce visibility of key visual elements; logo must be positioned behind all infographic cards
* **FR-010**: System MUST respect `prefers-reduced-motion` media query to disable 3D rotations and use CSS fade transitions (opacity only, no transform) for accessibility
* **FR-011**: Infographic cards MUST maintain responsive layout and readability across mobile (320px+), tablet (768px+), and desktop (1024px+, ultra-wide 1920px+) breakpoints
* **FR-012**: Infographic images MUST be optimized for web using WebP format with PNG fallback; non-primary cards MUST use lazy loading; all images MUST respect viewport-appropriate sizing
* **FR-013**: Carousel MUST support swipe gestures on touch devices (swipe left = next, swipe right = prev; minimum 45px distance to trigger to prevent accidental swipes)
* **FR-014**: Next/Previous navigation buttons MUST be focusable and keyboard-accessible; they MUST respond to click and keyboard interaction
* **FR-015**: Carousel MUST queue rapid clicks and prevent simultaneous animations; if user clicks during animation, the request MUST execute after current animation completes
* **FR-016**: Focus indicators on buttons MUST be visible and meet WCAG 2.1 AA contrast requirements; focus MUST NOT disappear during or after animation
* **FR-017**: System MUST provide optional auto-advance capability; when `autoAdvanceEnabled` is true, carousel MUST automatically rotate to next slide at `autoAdvanceMs` interval; auto-advance MUST respect `prefers-reduced-motion` preference and MUST pause during user interaction
* **FR-018**: If carousel has fewer than 2 slides, navigation buttons MUST NOT render (no DOM nodes, no disabled state, completely hidden)

### Key Entities

* **Infographic Card Element**: Large portrait-format image (~450px width, ~600px height target on desktop; responsive on mobile)
  - Format: Image file only (SVG or raster PNG/WebP)
  - No overlaid text, title, or CTA on card itself (any metadata handled separately)
  - Maintains crisp visibility at all breakpoints with object-fit: contain
* **Carousel Container**: The viewport wrapper with CSS `perspective: 1200px` applied for 3D rotation effect
  - Sized responsively: ~450px fixed on desktop, ~90vw max-width on mobile
  - Handles absolute positioning of all child slides
  - Overflow hidden to contain rotation transforms
* **Rotation Animation**: CSS 3D transform + fade keyframes
  - Y-axis rotation using `rotateY()`; fade via `opacity` transitions
  - Duration: 600-800ms (animation timing table below)
  - Easing: Exit uses ease-in; enter uses ease-out (see Technical Notes for cubic-bezier values)
* **Logo Asset**: Bendigo Phoenix logo (SVG recommended for scalability)
  - Opacity: 10-20% (recommended 15%)
  - Positioned absolutely behind all infographic cards
  - Centered or scaled to fit hero container without obscuring infographics
  - Source: Confirm current logo asset location and format
* **Navigation Controls**: Next/Previous buttons
  - Placement: Fixed on left/right edges of carousel container (or inline if mobile requires adjustment)
  - Styling: Circular or rectangular buttons with clear hover/focus states
  - ARIA labels required (aria-label="Next slide", aria-label="Previous slide")
  - Must be keyboard-focusable with visible focus indicators
* **Image Assets**: Infographic files in portrait format
  - Format: WebP with PNG fallback
  - Sizes: Primary card loaded eagerly; non-active cards lazy-loaded
  - Responsive sizes: Define breakpoint-specific widths (see Technical Notes)

## Technical Notes

### Animation Approach
- **Primary Method**: CSS 3D transforms with `perspective: 1200px`, `rotateY()`, and `opacity` transitions
- **GPU Acceleration**: Use `will-change: transform, opacity` on active slides to ensure GPU rendering
- **Browser Support**: Modern browsers (Chrome 26+, Firefox 16+, Safari 9+, Edge 12+) support all required CSS 3D transforms

### Infographic Sizing & Responsive Breakpoints

| Breakpoint | Width | Aspect Ratio | Notes |
|-----------|-------|--------------|-------|
| **Mobile (320px–767px)** | ~90vw max | 3:4 (portrait) | Add 16px padding left/right; ensure readability at 320px minimum |
| **Tablet (768px–1023px)** | ~80vw or fixed 400px | 3:4 (portrait) | Centered with adequate white space |
| **Desktop (1024px–1919px)** | ~450px fixed | 3:4 (portrait) | Centered; occupies ~40-50% of hero container |
| **Ultra-wide (1920px+)** | ~450px fixed | 3:4 (portrait) | Maintain consistency; do not scale beyond 450px |

### Animation Timing Table

| Event | Duration | Easing | Details |
|-------|----------|--------|---------|
| **Exit (rotateY 0° → ±90°)** | 350ms | `cubic-bezier(0.55, 0.085, 0.68, 0.53)` (ease-in) | Current card tips away; opacity fade 1→0 |
| **Enter (rotateY ∓90° → 0°)** | 350ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (ease-out) | New card arrives from opposite side; opacity fade 0→1 |
| **Delay Between Exit & Enter** | 0ms (simultaneous) | N/A | Exit and enter run simultaneously for continuous feel |
| **Total Animation Duration** | 600-800ms (350ms total with simultaneous fade) | — | User experiences smooth, seamless card rotation |
| **Reduced Motion (prefers-reduced-motion)** | 300ms total (150ms exit + 150ms enter, simultaneous) | ease-in-out | Fade-only transition with no 3D rotation; both fade in parallel |

### 3D Rotation Details
- **Axis**: Y-axis rotation (left-right 3D effect)
- **Perspective Origin**: Center of carousel container (`50% 50%`)
- **Backface Visibility**: Hidden (prevent card reversal during rotation)
- **Transform Origin**: Center center of each slide
- **Depth**: Use small `translateZ()` values (0-30px) if additional depth emphasis needed, but primary effect is `rotateY`

### Fade Synchronization
- **Current Card**: `opacity: 1` → `opacity: 0` during exit animation (350ms)
- **Next Card**: `opacity: 0` → `opacity: 1` during enter animation (350ms), starting 0ms after exit begins
- **Timing**: Creates smooth transition where old card disappears as new card appears

### Loop Logic & Index Management
- **Modulo Arithmetic**: Use `(currentIndex + 1) % totalCards` for next; `(currentIndex - 1 + totalCards) % totalCards` for prev
- **Animation State**: Maintain `isAnimating` flag to prevent simultaneous animations
- **Queue Mechanism**: Store pending clicks in a queue; process sequentially after animations complete

### Accessibility Implementation
- **prefers-reduced-motion**: Detect media query `(prefers-reduced-motion: reduce)` via CSS or JS
  - **Fallback**: Replace `rotateY` transforms with fade-only transitions
  - **Duration**: Reduce to 300ms for accessibility-aware users (faster, simpler transition)
  - **No Transform**: Use `opacity` only; no `rotateY`, `translateZ`, or `perspective`
- **Keyboard Navigation**:
  - Next button: Focusable via Tab; responds to Enter/Space/Click
  - Prev button: Focusable via Tab; responds to Enter/Space/Click
  - Arrow Keys: Optional enhancement — if implemented, ArrowRight = next, ArrowLeft = prev
- **Focus Management**:
  - Focus must remain visible with minimum 2px outline or equivalent indicator
  - Focus must meet WCAG AA contrast requirements (4.5:1 minimum for normal text; 3:1 for large text)
  - Focus must NOT disappear during animation; apply `:focus-visible` styles
  - If animation queue is active, disable interaction but maintain visible focus indicator
- **ARIA Labels & Roles**:
  - Container: `role="region"`, `aria-roledescription="carousel"`, `aria-label="Hero carousel"` or similar
  - Next Button: `aria-label="Next slide"` or `aria-label="Next infographic"`
  - Prev Button: `aria-label="Previous slide"` or `aria-label="Previous infographic"`
  - Slides: `role="group"`, `aria-label="Slide N of M"` (optional but recommended)
  - Live Region: Consider `aria-live="polite"` for announcements (optional post-MVP)

### Image Optimization Strategy
- **Format**: Serve WebP to modern browsers; PNG fallback for older browsers
  - Use `<picture>` element or Astro Image component for auto-format selection
- **Lazy Loading**: 
  - Primary card (index 0): `loading="eager"`, `decoding="auto"`
  - All other cards: `loading="lazy"`, `decoding="async"`
- **Responsive Sizing**:
  - Define srcset for multiple viewport widths (e.g., 360px, 450px, 600px)
  - Let browser select optimal size based on device width and DPR (device pixel ratio)
- **Compression**: Target max file size of ~150KB per infographic (WebP), ~250KB per PNG fallback
- **CDN/Caching**: Ensure images are cached with long TTL (e.g., 1 year for versioned assets)

### Logo Asset Management
- **Asset Location**: Confirm current Bendigo Phoenix logo file location in repo or asset CDN
- **Format**: SVG preferred (scales without quality loss); PNG acceptable if SVG unavailable
- **Opacity**: CSS `opacity: 0.15` (15% default, adjustable between 10-20%)
- **Positioning**: Absolute position, centered or fitted to hero container
- **Size**: Match or slightly exceed hero container dimensions so logo fills background without tiling
- **Z-Index**: Position behind infographic cards (z-index lower than slides)
- **Rendering**: Static (no animation, no transforms during carousel rotation)

### Performance Targets
- **Load Time**: Primary infographic loads within 500ms after initial page load (including image download + render)
- **Frame Rate**: Maintain 60 FPS during animation on desktop and mid-range mobile devices (iPhone 11+, Samsung Galaxy A50+)
- **Reduced Motion**: Fade-only transition (no GPU acceleration required) must run at 60+ FPS on all devices
- **Paint Time**: Keep paint time under 16ms to avoid animation jank
- **Bundle Impact**: Carousel JS + CSS must not exceed 15KB minified + gzipped

### Component Structure (Astro Component)
- **Component Name**: `HeroCircularCarousel.astro` (new, replaces existing HeroCarousel.astro)
- **Props Interface**:
  ```
  interface Slide {
    image: string              // Image URL only (required; use Astro Image component for optimization)
    alt: string                // Alt text for accessibility (required)
    bgColor?: string           // Fallback background color (optional)
  }
  
  interface Props {
    slides: Slide[]            // Array of slide objects (required, min 2 slides)
    autoAdvanceMs?: number     // Auto-advance interval in ms (optional, default: disabled)
    autoAdvanceEnabled?: boolean // Enable/disable auto-advance (optional, default: false)
  }
  ```
- **Default Behavior**: No auto-advance unless explicitly enabled (differs from old carousel which auto-advanced)
- **Image Handling**: Images are URLs passed as strings; component uses Astro Image component for automatic optimization (WebP conversion, responsive sizing, lazy loading)

## Success Criteria

### Measurable Outcomes

* **SC-001**: Hero section loads with first infographic displayed prominently and carousel fully interactive within 2 seconds (excluding image download time on slow connections)
* **SC-002**: Primary infographic occupies 40-50% of viewport width on desktop and scales responsively on mobile without exceeding ~90vw max-width
* **SC-003**: Card rotation animation completes smoothly in 600-800ms total (350ms exit + 0ms–50ms overlap + 350ms enter)
* **SC-004**: 100% of infographic content remains visible, unobstructed, and readable throughout rotation animation; no layout shifts occur
* **SC-005**: Carousel loops correctly through all infographics without visual glitches, flicker, or jank; rapid clicks are queued correctly
* **SC-006**: Logo decal renders correctly and remains visible at all breakpoints (mobile 320px+, tablet 768px+, desktop 1024px+, ultra-wide 1920px+) without obscuring infographics
* **SC-007**: Animations maintain 60 FPS on desktop (measured via DevTools Performance tab); smooth performance on mid-range mobile (iPhone 11+, Galaxy A50+) with no dropped frames
* **SC-008**: Primary infographic loads within 500ms after initial page load (web-optimized WebP + PNG); non-active cards lazy-load without blocking main animation
* **SC-009**: **Accessibility—Keyboard**: User with keyboard-only access can navigate carousel using Tab to focus buttons and Enter/Space to trigger rotation; focus indicator visible at all times
* **SC-010**: **Accessibility—Reduced Motion**: Users with `prefers-reduced-motion: reduce` enabled in OS settings see fade-only transitions (no 3D rotation); duration reduced to 300ms
* **SC-011**: **Accessibility—Focus Management**: Focus does not disappear during animation; users can interact with buttons while animation queue is processing
* **SC-012**: **Accessibility—ARIA**: Carousel has proper ARIA labels, roles, and descriptions; screen reader users understand the carousel purpose and can navigate it
* **SC-013**: **Touch Interaction**: Mobile users can swipe left/right on infographic to rotate carousel; 45px minimum swipe distance prevents accidental triggers
* **SC-014**: **Responsive Layout**: Infographics display correctly and maintain readability at all breakpoints:
  - Mobile 320px: Full width with padding, ~90vw max
  - Tablet 768px: ~80vw or ~400px fixed
  - Desktop 1024px–1919px: ~450px fixed, 40-50% hero width
  - Ultra-wide 1920px+: ~450px fixed, no scaling beyond desktop
* **SC-015**: **Visual Consistency**: Logo decal renders at 10-20% opacity; does not flicker, shift, or disappear during animation
* **SC-016**: **Handover Completeness**: All animation timing values, easing curves, responsive breakpoints, and accessibility requirements documented in Technical Notes (above) and CLAUDE.md for future iteration

---

## Acceptance Criteria (Comprehensive Test Scenarios)

### **Category: Happy Path — Core Carousel Interaction**

1. **Given** the hero section renders on page load, **When** the page is fully loaded, **Then** the first infographic (Card 1) is displayed prominently and centered
2. **Given** Card 1 is displayed, **When** a user clicks the next button, **Then** Card 1 rotates out along the Y-axis (left edge recedes, right edge moves forward) while fading to opacity 0; Card 2 simultaneously rotates in from the opposite direction (right edge recedes, left edge moves forward) with opacity transitioning from 0 to 1
3. **Given** the animation completes, **When** Card 2 is now the active card, **Then** the focus can return to the next/prev buttons and the carousel is ready for the next interaction
4. **Given** the user is on the last card, **When** they click next, **Then** the carousel loops back to Card 1 with the same rotation effect (no jump or flash)
5. **Given** the user is on Card 2 (or any non-first card), **When** they click prev, **Then** the previous card rotates in from the opposite direction with proper fade; the current card rotates out
6. **Given** multiple cards exist, **When** the user cycles through all cards, **Then** all cards display correctly and in the expected sequence without skips or duplicates

### **Category: Touch & Mobile Interaction**

7. **Given** a user is on a mobile device with touch support, **When** they place their finger on the infographic and swipe left (at least 45px), **Then** the carousel rotates to the next card using the same animation
8. **Given** a user swipes right (at least 45px) on the infographic, **When** the swipe gesture completes, **Then** the carousel rotates to the previous card
9. **Given** a user makes a small horizontal movement (less than 45px), **When** the touch ends, **Then** the carousel does NOT rotate (swipe threshold prevents accidental triggers)
10. **Given** a user is on a mobile device, **When** they view the carousel, **Then** navigation buttons are clearly visible, have adequate tap targets (minimum 44px × 44px), and remain accessible during animation

### **Category: Keyboard Navigation & Focus**

11. **Given** a user navigates the page using Tab key, **When** they reach the next button, **Then** the button has a visible focus indicator (minimum 2px outline or equivalent) that meets WCAG AA contrast (4.5:1)
12. **Given** the next button is focused, **When** the user presses Enter or Space, **Then** the carousel rotates to the next card
13. **Given** the prev button is focused, **When** the user presses Enter or Space, **Then** the carousel rotates to the previous card
14. **Given** the user focuses a button while an animation is in progress, **When** the user presses Enter or Space, **Then** the click is queued and executed after the animation completes (no simultaneous rotations)
15. **Given** the user navigates away from the carousel and back to it using Tab, **When** focus re-enters, **Then** the focus indicator is still visible and the button is ready for interaction

### **Category: Animation Timing & Queueing**

16. **Given** a card rotation animation is running, **When** the user clicks the next button, **Then** the button remains enabled and clickable; the click is queued, user receives visual feedback on press (button state change), and animation executes after current animation completes
17. **Given** a user rapidly clicks the next button 5 times, **When** the first animation completes, **Then** the second queued click executes; all clicks are processed in order
18. **Given** an animation is in progress, **When** the user clicks both next and prev buttons in quick succession, **Then** clicks are queued and executed in the order they were received; button presses provide immediate visual feedback
19. **Given** the rotation animation is running for 350ms (exit) + 350ms (enter), **When** the animation completes, **Then** all timing is accurate and no visual stutter occurs

### **Category: Responsive Design & Scaling**

20. **Given** a user views the carousel on a mobile device (320px width), **When** the infographic renders, **Then** it occupies approximately 90vw (with ~16px padding left/right) and maintains portrait aspect ratio
21. **Given** a user views the carousel on a tablet (800px width), **When** the infographic renders, **Then** it occupies approximately 80vw or ~400px fixed width and remains readable
22. **Given** a user views the carousel on a desktop (1200px width), **When** the infographic renders, **Then** it occupies ~450px fixed width, is centered, and accounts for 40-50% of hero width
23. **Given** a user views the carousel on an ultra-wide screen (1920px+), **When** the infographic renders, **Then** it remains ~450px fixed and does not scale beyond desktop sizing
24. **Given** the user rotates their device from portrait to landscape on mobile, **When** the carousel re-renders, **Then** infographic sizing adjusts responsively without animation glitches
25. **Given** the carousel is displayed at any breakpoint, **When** the user rotates cards, **Then** all animations maintain 60 FPS and smoothness despite image size

### **Category: Logo Decal & Visual Elements**

26. **Given** the hero section renders, **When** the page is fully loaded, **Then** the Bendigo Phoenix logo appears as a faded background decal behind the infographics
27. **Given** the logo decal is rendered, **When** the user views the carousel, **Then** the logo opacity is between 10-20% (recommended 15%) and does NOT obscure infographic content
28. **Given** cards rotate during animation, **When** the animation plays, **Then** the logo remains static and does NOT move, fade, or transform
29. **Given** the carousel displays at any breakpoint, **When** the user views the hero, **Then** the logo is visible and properly positioned without creating layout shifts

### **Category: Accessibility — Reduced Motion**

30. **Given** a user has `prefers-reduced-motion: reduce` enabled in OS settings, **When** the page loads and carousel renders, **Then** 3D CSS transforms are disabled
31. **Given** a user with reduced-motion preference clicks next, **When** the card transitions, **Then** only opacity fade is applied (no `rotateY` or `translateZ`); transition duration is 300ms (faster than standard 600-800ms)
32. **Given** a user with reduced-motion preference, **When** they interact with the carousel, **Then** all functionality remains intact (next/prev work, looping works, keyboard nav works)

### **Category: Accessibility — ARIA & Screen Readers**

33. **Given** a screen reader user accesses the page, **When** they focus the carousel, **Then** they hear a description like "Hero carousel" or similar (via aria-label)
34. **Given** a screen reader user tabs to the next button, **When** they reach it, **Then** they hear "Next slide" or similar ARIA label
35. **Given** a screen reader user tabs to the prev button, **When** they reach it, **Then** they hear "Previous slide" or similar ARIA label
36. **Given** a screen reader user, **When** they interact with individual slides, **Then** each slide has an aria-label such as "Slide 1 of 5" or equivalent
37. **Given** the carousel rotates, **When** the animation completes, **Then** any dynamic content updates (e.g., slide count) are announced via aria-live if implemented (optional post-MVP)

### **Category: Image Optimization & Performance**

38. **Given** the page loads, **When** the first infographic is in view, **Then** it loads with `loading="eager"` and `decoding="auto"`
39. **Given** the page loads, **When** non-active infographics are below the fold, **Then** they load with `loading="lazy"` and `decoding="async"` to defer loading
40. **Given** the page loads on a connection with 3G speed, **When** the first infographic loads, **Then** it completes within 500ms (WebP format, optimized ~150KB or less)
41. **Given** the carousel rotates to a non-loaded card, **When** the card is now visible, **Then** the image loads quickly without stalling animation (if already lazy-loaded, it should be cached)
42. **Given** the page loads, **When** DevTools is opened and Network tab is checked, **Then** infographic images use WebP format on modern browsers and PNG fallback on older browsers

### **Category: Error & Edge Cases**

43. **Given** an infographic image fails to load (404 or network error), **When** the carousel attempts to display it, **Then** a fallback background color or placeholder displays without breaking the carousel (error is handled gracefully)
44. **Given** the page loads with fewer than 2 slides, **When** the carousel renders, **Then** navigation buttons are disabled or hidden (carousel requires minimum 2 slides to function)
45. **Given** the carousel is in a state where next and prev buttons are both active, **When** the user simultaneously clicks both (edge case), **Then** only one animation queues and the other is ignored or merged
46. **Given** the carousel is resized or the viewport changes, **When** the carousel re-renders, **Then** active infographic sizing adjusts smoothly without animation jank or layout shifts

### **Category: Component Integration**

47. **Given** the new HeroCircularCarousel component is used on the home page, **When** the page loads, **Then** the component renders within the AppShell layout (not breaking the navbar, footer, or overall layout)
48. **Given** the carousel is replaced from the old HeroCarousel, **When** other pages or features that might reference the old component are checked, **Then** no broken references or import errors occur
49. **Given** the carousel uses the Astro component system, **When** the component receives a `slides` prop with infographic URLs, **Then** all slides render correctly without hydration errors
50. **Given** the carousel has `autoAdvanceEnabled: true` and `autoAdvanceMs: 5000` set, **When** the page loads and no user interaction occurs, **Then** the carousel automatically rotates to the next slide every 5 seconds without user action

---

## Constitutional Compliance

This specification is reviewed against CoachCW constitutional principles to ensure alignment with core values and technical requirements.

### **Principle I: User Outcomes First**
**Status**: ✅ **PASS**

Every user story defines clear, measurable outcomes tied to user behavior:
- **P1 Story 1**: Users can view and interact with large portrait infographics as the primary hero content (outcome: infographics are visually prominent and rotatable)
- **P1 Story 2**: Users see branding reinforcement via logo decal (outcome: logo is visible and doesn't interfere)
- **P1 Story 3**: Animation feels natural and responsive (outcome: smooth 600-800ms transitions with appropriate easing)

Success criteria are measurable and observable (SC-001 through SC-016).

### **Principle II: Test-First Discipline**
**Status**: ✅ **PASS**

Acceptance Criteria section includes 49 detailed test scenarios covering:
- Happy path carousel interaction (6 scenarios)
- Touch & mobile interaction (4 scenarios)
- Keyboard navigation & focus (5 scenarios)
- Animation timing & queueing (4 scenarios)
- Responsive design (6 scenarios)
- Logo decal & visual elements (4 scenarios)
- Accessibility—reduced motion (3 scenarios)
- Accessibility—ARIA & screen readers (5 scenarios)
- Image optimization & performance (5 scenarios)
- Error & edge cases (4 scenarios)
- Component integration (3 scenarios)

Each test is independently executable and validates user outcomes, not just code coverage.

### **Principle III: Backend Authority & Invariants**
**Status**: ✅ **PASS**

This feature is frontend-only with no backend involvement:
- No data mutations or state changes communicated to backend
- Carousel state is local and ephemeral (current slide index)
- Infographic URLs are static and passed as props from parent component
- No client-side inference of server state
- No authentication or authorization concerns

### **Principle IV: Error Semantics & Observability**
**Status**: ✅ **PASS**

The specification addresses error handling:
- **SC-008**: Lazy-loaded images must load without blocking animation
- **AC-43**: Failed image loads display fallback background color gracefully
- **FR-015**: Click queueing prevents simultaneous animations (error state mitigation)
- **FR-010**: Reduced-motion fallback ensures graceful degradation

All errors are handled at the component level with no user-facing exceptions or silent failures expected.

### **Principle V: AppShell Integrity**
**Status**: ✅ **PASS**

The specification explicitly maintains AppShell consistency:
- **Scope**: Complete replacement of old carousel (no custom navigation shell introduced)
- **AC-47**: Component renders within AppShell layout without breaking navbar, footer, or overall structure
- **FR-011**: Responsive layout works at all breakpoints using established Astro + Tailwind patterns
- No new navigation paradigm introduced; carousel is a localized interaction

### **Principle VI: Accessibility First**
**Status**: ✅ **PASS** (Comprehensive)

Accessibility is deeply integrated throughout:

**Keyboard Navigation**:
- **FR-014**: Next/prev buttons are focusable and keyboard-accessible
- **FR-016**: Focus indicators meet WCAG 2.1 AA contrast requirements
- **AC-11 through AC-15**: Detailed keyboard navigation test scenarios
- Optional: Arrow key support for enhanced keyboard experience

**Reduced Motion**:
- **FR-010**: Respects `prefers-reduced-motion` media query
- **AC-30 through AC-32**: Comprehensive test scenarios for reduced-motion fallback
- Fade-only transitions preserve functionality without 3D transforms

**ARIA Labels & Roles**:
- **AC-33 through AC-37**: Screen reader compatibility with proper ARIA labels and roles
- Carousel container: `role="region"`, `aria-roledescription="carousel"`, `aria-label="Hero carousel"`
- Buttons: `aria-label="Next slide"` and `aria-label="Previous slide"`
- Slides (optional): `aria-label="Slide N of M"`

**Focus Management**:
- Focus does not disappear during animation (AC-15, AC-11)
- Focus visible with minimum 2px outline or equivalent (AC-11)
- Contrast meets WCAG AA standards (4.5:1 for normal text)

**WCAG 2.1 AA Compliance**:
- **Level A**: ✅ All requirements met (color contrast, focus visible, keyboard navigation, reduced motion)
- **Level AA**: ✅ All requirements met (enhanced contrast, multiple input methods, error prevention)

### **Principle VII: Immutable Data Flow**
**Status**: ✅ **PASS**

Data flows are unidirectional and state is explicit:
- **Carousel State**: `currentSlide` index only (ephemeral, local to component)
- **Animation State**: `isAnimating` flag (internal, prevents conflicting interactions)
- **Click Queue**: Sequential processing (no race conditions)
- **No Client-Side Inference**: All infographic URLs and metadata passed as props; no client-side calculation of content

State mutations (slide index change, animation flag toggle) are explicit and synchronous.

### **Principle VIII: Dependency Hygiene**
**Status**: ✅ **PASS**

The specification introduces no new external dependencies:
- Uses native CSS 3D transforms (no animation libraries required)
- Uses native JS for gesture detection (no touch library required)
- Astro component (already in stack)
- Tailwind CSS for styling (already in stack)
- WebP image format detection (native browser support)

No new npm packages; no version pinning concerns.

### **Principle IX: Cross-Feature Consistency**
**Status**: ✅ **PASS**

The specification follows established CoachCW patterns:
- Component structure matches existing Astro components (HeroCarousel.astro as reference)
- Styling uses Astro + Tailwind with brand colors (#573F93, #8B7536)
- Responsive design follows mobile-first breakpoint conventions (320px, 768px, 1024px, 1920px)
- Accessibility patterns match established WCAG standards in the codebase
- Animation timing and easing follow modern browser conventions

No framework fragmentation or pattern deviation.

### **Summary: Constitutional Alignment**

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. User Outcomes First** | ✅ PASS | Clear, measurable outcomes; success criteria defined |
| **II. Test-First Discipline** | ✅ PASS | 49 acceptance criteria covering all interaction modes |
| **III. Backend Authority** | ✅ PASS | Frontend-only; no server mutations or inference |
| **IV. Error Semantics** | ✅ PASS | Graceful error handling; no silent failures |
| **V. AppShell Integrity** | ✅ PASS | Component fits within AppShell; no custom nav shells |
| **VI. Accessibility First** | ✅ PASS | WCAG 2.1 AA compliant; keyboard nav, reduced motion, ARIA |
| **VII. Immutable Data Flow** | ✅ PASS | Unidirectional state; no client-side inference |
| **VIII. Dependency Hygiene** | ✅ PASS | No new external dependencies |
| **IX. Cross-Feature Consistency** | ✅ PASS | Follows established Astro + Tailwind patterns |

**Overall Status**: ✅ **CONSTITUTIONAL COMPLIANCE: PASS**

All constitutional principles are satisfied. No conflicts or violations identified. Spec is ready for implementation.
