# Feature Specification: Hero Section Circular Card Carousel

**Feature Branch**: `cameronwalsh/coa-22-hero-section-update`  
**Created**: 2026-04-07  
**Status**: In Specification  
**Input**: User description: "Hero cards should be large portrait-format infographics that rotate in a circular pattern. When you click to see the next card, it rotates in from the side, the current card moves out and around to the side/back, and fades away."

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
2. **Given** a user clicks the next/forward button, **When** the animation triggers, **Then** Card 1 rotates out to the side/back while fading, and Card 2 rotates in from the opposite side
3. **Given** cards are rotating, **When** the animation completes, **Then** the next infographic is fully visible, centered, and at the same prominent size as the previous one
4. **Given** a user at the last card, **When** they click next, **Then** the carousel loops back to Card 1 with the same rotation effect
5. **Given** different screen sizes (mobile, tablet, desktop), **When** the carousel rotates, **Then** infographics scale responsively while maintaining portrait aspect ratio and prominence

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

* What happens when a user clicks next while an animation is in progress? (queue next, cancel, or ignore?)
* How does the rotation handle accessibility? (keyboard navigation, focus management, reduced-motion preference)
* What is the performance impact on low-end devices with large infographic assets? (image optimization, GPU acceleration, lazy loading)
* Mobile: On small screens (< 375px), how are large infographics displayed? (scale constraints, full-width vs. contained?)
* Mobile: Can infographics be swiped to rotate, or is it button-only?
* What are typical infographic dimensions? (suggested: ~450px portrait, ~600px tall)

## Requirements

### Functional Requirements

* **FR-001**: Hero section MUST display a circular card carousel with large, prominent portrait-format infographic cards as the primary focal point
* **FR-002**: Primary infographic MUST occupy a substantial portion of the hero section (minimum 40-50% of viewport width on desktop, full-width on mobile within constraints)
* **FR-003**: Infographic cards MUST maintain portrait aspect ratio (e.g., ~3:4, portrait orientation)
* **FR-004**: When a user clicks the "next" button, the current infographic MUST rotate out to the side/back while fading away
* **FR-005**: The next infographic in sequence MUST rotate into view from the opposite side with a smooth entrance
* **FR-006**: Cards MUST use 3D perspective/transform to create the illusion of circular motion (CSS 3D transforms)
* **FR-007**: The carousel MUST loop: after the last card, clicking next shows Card 1 with the same rotation effect
* **FR-008**: The Bendigo Phoenix logo MUST appear as a static background decal (10-20% opacity) behind rotating infographics
* **FR-009**: Logo decal MUST NOT obscure infographic content or reduce visibility of key visual elements
* **FR-010**: System MUST respect `prefers-reduced-motion` to disable 3D rotations and use fade-only transitions for accessibility
* **FR-011**: Infographic cards MUST maintain responsive layout and readability across mobile, tablet, and desktop breakpoints
* **FR-012**: Infographic images MUST be optimized for web (file size, format, responsive sizing)

### Key Entities

* **Infographic Card Element**: Large portrait-format image or SVG (title, description optional, CTA button possible)
* **Carousel Container**: The wrapper with 3D perspective applied for rotation effect; sized to accommodate large infographics
* **Rotation Animation**: CSS 3D transform keyframes or JS animation controlling rotation axis, angle, and fade
* **Logo Asset**: Bendigo Phoenix logo (SVG or PNG) with opacity overlay, positioned behind infographics
* **Navigation Controls**: Next/Previous buttons (prominent placement for ease of interaction)
* **Image Assets**: Infographic files in portrait format, optimized for web delivery

## Technical Notes

* **Animation Approach**: CSS 3D transforms with `perspective`, `rotateY`, and `translateZ` for GPU-accelerated rotation
* **Infographic Sizing**:
  * Desktop: ~450px width, portrait aspect ratio, centered in hero
  * Tablet: ~80% viewport width, maintain portrait ratio
  * Mobile: Full width with padding or max-width constraint (~90vw), maintain readability
* **Fade Sync**: Current infographic `opacity` transitions from 1 to 0 as it rotates; next card `opacity` transitions from 0 to 1 as it enters
* **Loop Logic**: Use modulo arithmetic to cycle through card indices
* **Accessibility**: Media query for `prefers-reduced-motion` to replace 3D rotations with simple fade-in/fade-out
* **Image Optimization**: Use WebP with PNG fallback; consider lazy loading for non-primary cards
* **Touch Support**: Consider swipe gestures on mobile (optional enhancement, but recommended given large target)

## Success Criteria

### Measurable Outcomes

* **SC-001**: Hero section loads with first infographic displayed prominently and carousel fully interactive within 2 seconds
* **SC-002**: Primary infographic occupies 40-50% of viewport width on desktop and scales responsively on mobile
* **SC-003**: Card rotation animation completes smoothly in 600-800ms (adjustable post-MVP)
* **SC-004**: 100% of infographic content remains visible and readable throughout rotation animation
* **SC-005**: Carousel loops correctly through all infographics without visual glitches or layout shifts
* **SC-006**: Logo decal renders correctly and remains visible at all breakpoints (mobile 320px+, tablet 768px+, desktop 1024px+) without obscuring infographics
* **SC-007**: Animations maintain 60fps on desktop; smooth performance on mid-range mobile devices despite large image assets
* **SC-008**: Infographic images load within 500ms after initial page load (image optimization)
* **SC-009**: Accessibility: Users with `prefers-reduced-motion` enabled see fade-only transitions; keyboard navigation works (arrow keys or button focus)
* **SC-010**: Responsive: Infographics display correctly at all breakpoints (mobile 320px+, tablet 768px+, desktop 1024px+, ultra-wide 1920px+)
* **SC-011**: Handover-ready: Animation values (duration, easing, rotation angle, sizing breakpoints) documented in [CLAUDE.md](http://CLAUDE.md) for future iteration
