# Feature Specification: Sponsors Carousel

**Feature Branch**: `cameronwalsh/coa-58-sponsors`  
**Created**: 2026-04-15  
**Status**: Spec Creation  
**Input**: Single sponsor with CTA approach; carousel pattern matching existing COA-22 carousel

## User Scenarios & Testing

### User Story 1 - View Current Sponsor (Priority: P1)

Visitor lands on home page and can see the club's current sponsor displayed in a horizontal carousel context, even with only one sponsor present.

**Why this priority**: Foundation for the feature. Displaying the single sponsor card must work seamlessly with the carousel pattern.

**Independent Test**: Carousel renders with 1 sponsor card; scrollbar is visible/functional but single card fills logical card width (not full container width).

**Acceptance Scenarios**:

1. **Given** the sponsors section is loaded, **When** page renders, **Then** the sponsor card is visible at fixed width within the carousel container
2. **Given** the single sponsor card is displayed, **When** user views on desktop, **Then** scrollbar indicates more content is possible (affordance for future sponsors)

---

### User Story 2 - Click "Become a Sponsor" CTA (Priority: P1)

Visitor clicks the "Become a Sponsor" card/button embedded in the carousel and is taken to the sponsorship action page.

**Why this priority**: Core conversion path. Encourages new sponsors without requiring a separate static button.

**Independent Test**: Can navigate to sponsorship action page directly from the carousel CTA. No existing "Become a Sponsor" button should be visible.

**Acceptance Scenarios**:

1. **Given** the carousel is rendered, **When** user clicks the "Become a Sponsor" card, **Then** user is navigated to the sponsorship action page
2. **Given** the carousel contains 1 sponsor + CTA card, **When** user scrolls through the carousel, **Then** both cards are accessible via horizontal scroll

---

### User Story 3 - Hide Static Button Until 6 Sponsors (Priority: P2)

Once a 6th sponsor is added to the carousel, the "Become a Sponsor" card in the carousel is replaced by the actual sponsor card, and a static "Become a Sponsor" button appears elsewhere on the page.

**Why this priority**: Future state. Ensures clean UX transition from CTA-driven to button-driven when sponsors fill the carousel.

**Independent Test**: Toggle a feature flag or manually add 6 sponsors; verify carousel shows 6 sponsor cards + 1 CTA card, and static button appears (or vice versa at 5 sponsors, depending on UX decision).

**Acceptance Scenarios**:

1. **Given** fewer than 6 sponsors exist, **When** page renders, **Then** "Become a Sponsor" card is in the carousel and static button is hidden
2. **Given** 6 or more sponsors exist, **When** page renders, **Then** sponsor carousel shows actual sponsors + CTA card, and static "Become a Sponsor" button is visible elsewhere

---

### Edge Cases

- What happens if sponsor data is missing or fails to load? (Fallback to CTA card only)
- Does the carousel scroll past the CTA card on mobile, or does it stick at the end?
- How is the CTA card styled differently from sponsor cards to signal it's an action?

## Requirements

### Functional Requirements

- **FR-001**: Sponsors carousel MUST use the same fixed-width card layout and horizontal scroll behaviour as the existing COA-22 hero carousel
- **FR-002**: Carousel MUST include a "Become a Sponsor" CTA card that routes to the sponsorship action page
- **FR-003**: Sponsor cards MUST display sponsor logo, name, and link (if applicable)
- **FR-004**: System MUST respect sponsor count: show CTA card when < 6 sponsors; show static button when >= 6 sponsors
- **FR-005**: CTA card MUST be visually distinct from sponsor cards (e.g., different styling, icon, or label) to signal it's an action, not a sponsor
- **FR-006**: Carousel MUST be responsive; cards maintain fixed width with horizontal scroll on all screen sizes
- **FR-007**: Static "Become a Sponsor" button (if triggered) MUST be hidden by CSS or conditional rendering when < 6 sponsors exist

### Key Entities

- **Sponsor**: `id`, `name`, `logo` (URL or asset path), `link` (optional), `joinedDate` (for sorting/future use)
- **CarouselCard**: Type union of `SponsorCard` or `CTACard`
  - `SponsorCard`: `type: 'sponsor'`, sponsor data
  - `CTACard`: `type: 'cta'`, static CTA config (title, link to action page)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Sponsors carousel renders without horizontal scroll on page load (1 sponsor visible at fixed width)
- **SC-002**: User can click "Become a Sponsor" CTA card and reach the sponsorship action page in one click
- **SC-003**: Carousel scrolls smoothly to reveal additional sponsors as they are added (tested with >= 2 sponsors)
- **SC-004**: Static "Become a Sponsor" button does not appear until 6 sponsors are onboard
- **SC-005**: Carousel layout mirrors COA-22 carousel (same card width, scroll behaviour, visual consistency)

---

## TechNical Notes

- Reuse carousel component from COA-22 (hero carousel) if possible
- Data source: Sponsor data stored in site config or CMS (TBD with content source)
- CTA card destination: `/get-involved` or similar (clarify the exact route)
- Sponsor count threshold (6) may be configurable via site config for future adjustments
