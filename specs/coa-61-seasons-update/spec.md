# Feature Specification: Seasons Information Modals

**Feature Branch**: `cameronwalsh/coa-61-seasons-update`  
**Created**: 2026-04-16  
**Status**: Spec Creation  
**Input**: Card-based modal design with consistent sub-card layout

## User Scenarios & Testing

### User Story 1 – View Training Information (Priority: P1)

A site visitor wants to learn about training schedules, times, and venues for the season. They click the Training card on the Seasons page and expect a modal to open showing training information.

**Why this priority**: Training information is critical for new and existing members; it's one of the first things people look for.

**Independent Test**: Can be fully tested by clicking the Training card and verifying the modal opens with training content displayed clearly.

**Design Notes**: 
- **Option A**: Reuse the 2 existing training cards from the Seasons page (their content + layout)
- **Option B**: Use a single cohesive image that covers both training options
- **Recommendation**: Build prototypes of both and test which layout feels more polished and readable in a modal context.

**Acceptance Scenarios**:

1. **Given** the Seasons page is displayed, **When** the user clicks the Training card, **Then** a modal opens displaying training content (either 2 sub-cards or a unified image/layout).
2. **Given** the Training modal is open, **When** the user examines the content, **Then** the information is clear, readable, and appropriately styled for the modal.
3. **Given** the Training modal is open, **When** the user clicks outside the modal or on a close button, **Then** the modal closes and the page returns to normal state.

---

### User Story 2 – View Uniform Information (Priority: P1)

A site visitor needs details about team uniforms (how to obtain, number requirements, loaning options, and second-hand availability). They click the Uniforms card and expect a modal with 4 uniform-related sub-cards.

**Why this priority**: Uniform information is essential for team preparation and onboarding; it's part of the core seasonal information required.

**Independent Test**: Can be fully tested by clicking the Uniforms card and verifying the modal opens with 4 sub-cards in a 2×2 grid layout.

**Acceptance Scenarios**:

1. **Given** the Seasons page is displayed, **When** the user clicks the Uniforms card, **Then** a modal opens displaying 4 uniform sub-cards in a 2×2 grid layout.
2. **Given** the Uniforms modal is open, **When** the user examines the 4 sub-cards, **Then** each card displays one of: How To, Numbers, Loan, 2nd Hand with consistent sizing and styling.
3. **Given** the Uniforms modal is open, **When** the user scrolls (if content exceeds modal height), **Then** the content scrolls smoothly without breaking layout.

---

### User Story 3 – View Clearance Information (Priority: P2)

A site visitor needs to complete clearances before playing. They click the Clearances card, see a single clearance sub-card with an image, and can click the image to navigate to an external clearance portal/link.

**Why this priority**: Clearances are mandatory but typically only need to be done once per season; less urgent than training/uniforms but still critical.

**Independent Test**: Can be fully tested by clicking the Clearances card, verifying the modal opens with 1 centered sub-card, and clicking the image navigates to the clearance link.

**Acceptance Scenarios**:

1. **Given** the Seasons page is displayed, **When** the user clicks the Clearances card, **Then** a modal opens displaying 1 clearance sub-card centered with generous padding.
2. **Given** the Clearances modal is open, **When** the user views the sub-card, **Then** it displays an image that is visually identifiable as clickable (cursor change, hover state).
3. **Given** the Clearances modal is open, **When** the user clicks the image, **Then** the external clearance link opens in a new tab/window.

---

### User Story 4 – View Registration Information (Priority: P1)

A site visitor wants to register for the season. They click the Registration card and expect a modal with 2 registration-related sub-cards (e.g., registration link, key dates, or related information).

**Why this priority**: Registration is essential for team participation and is often time-sensitive; core seasonal information.

**Independent Test**: Can be fully tested by clicking the Registration card and verifying the modal opens with 2 sub-cards.

**Acceptance Scenarios**:

1. **Given** the Seasons page is displayed, **When** the user clicks the Registration card, **Then** a modal opens displaying 2 registration sub-cards in a consistent layout (vertical stack or side-by-side).
2. **Given** the Registration modal is open, **When** the user examines the sub-cards, **Then** each sub-card displays its content (image, title, description) with consistent styling matching other modals.
3. **Given** the user has opened multiple modals, **When** they open the Registration modal, **Then** the layout and spacing are consistent with Training and Uniforms modals.

---

### Edge Cases

- What happens when a sub-card image fails to load? (Fallback image or placeholder should display; layout should not break)
- How does the modal behave on very small mobile screens? (Should stack sub-cards vertically; modal may resize responsively)
- What if a clearance link is invalid or returns 404? (Link still clickable; external error handled by browser/target site)
- What if text content in a sub-card is very long? (Text should truncate gracefully or the sub-card should scroll internally; main modal layout preserved)

## Requirements

### Functional Requirements

- **FR-001**: System MUST display 4 clickable cards on the Seasons page (Training, Uniforms, Clearances, Registration).
- **FR-002**: System MUST open a modal when any of the 4 cards is clicked.
- **FR-003**: System MUST display consistent sub-cards within each modal, using the same card component dimensions, styling, padding, borders, and shadows.
- **FR-004**: Training modal MUST display 2 sub-cards (layout: vertical or side-by-side).
- **FR-005**: Uniforms modal MUST display 4 sub-cards in a 2×2 grid layout.
- **FR-006**: Clearances modal MUST display 1 sub-card, centered with generous padding.
- **FR-007**: Registration modal MUST display 2 sub-cards (layout: vertical or side-by-side).
- **FR-008**: Each sub-card MUST display an image and associated content (title, description, or CTA).
- **FR-009**: Clearance sub-card image MUST be clickable and navigate to an external link (opens in new tab).
- **FR-010**: System MUST close the modal when the user clicks outside the modal or on a dedicated close button.
- **FR-011**: Modal MUST be responsive and adapt to mobile screen sizes without breaking layout.
- **FR-012**: All modals MUST be dismissible via keyboard (e.g., Escape key).

### Key Entities

- **Season Information Card**: Top-level clickable card on the page (Training, Uniforms, Clearances, or Registration). Contains card title, icon/image, and brief description.
- **Sub-Card (Modal Content)**: Uniform component displayed within modals. Contains image, title, description, optional CTA link. All sub-cards are the same fixed size (e.g., 150–180px).
- **Modal**: Container that opens on card click, displaying a collection of sub-cards arranged in a responsive grid.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 4 page-level cards are visually distinct, clearly clickable, and appropriately labeled.
- **SC-002**: Modal opens within 200ms of card click (smooth perceived response).
- **SC-003**: Sub-cards display with consistent sizing and spacing across all 4 modals.
- **SC-004**: Modal layout is responsive: on mobile (<768px), sub-cards stack vertically without overflow.
- **SC-005**: All external links (e.g., clearance image) open in new tabs and do not interrupt the modal state.
- **SC-006**: Image fallback (placeholder or error state) maintains layout integrity if image fails to load.
- **SC-007**: Modal is keyboard-accessible (Tab navigation, Escape to close).
- **SC-008**: 90% of users can locate and open a modal modal within 5 seconds on first attempt.

## Design Notes

- **Sub-Card Dimensions**: Recommend a fixed size such as 150px × 150px or 160px × 180px to ensure uniformity across all modals. Adjust as needed for content fit.
- **Grid Layout**: Use CSS Grid or Flexbox with consistent gap spacing (e.g., 1rem) between sub-cards.
- **Mobile Responsiveness**: On screens <768px, switch from grid to single-column layout; sub-cards may increase in width to fill available space.
- **Modal Styling**: Modal should appear as a floating window on top of the page (not a full-page overlay). Use a semi-transparent or minimal backdrop (e.g., subtle shadow, no harsh darkening). Modal has consistent shadow (drop shadow to elevate it), border-radius, and background color matching the site's design system (Purple #573F93, Gold accents as appropriate). The page behind the modal should remain visible and slightly dimmed (optional light overlay) rather than completely blacked out.
- **Backdrop**: Use a subtle, minimal backdrop (e.g., 10-20% opacity overlay) rather than a heavy black mask. This keeps the modal feel "floating" and elegant.
- **Close Interaction**: Provide both a close button (X icon, top-right corner) and click-outside-to-close behavior.

---

**Next Steps**:
1. Confirm sub-card fixed dimensions.
2. Define image sources and content for each sub-card.
3. Finalize grid layout preferences (e.g., vertical stack vs. side-by-side for 2-card modals).
4. Begin implementation as a reusable sub-card component and modal container.
