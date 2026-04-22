# Feature Specification: Resource Filters Mobile UX

**Feature Branch**: `cameronwalsh/coa-74-resource-filters`  
**Created**: 2026-04-22  
**Status**: Draft  
**Input**: COA-74 bug report + screenshot analysis

---

## User Scenarios & Testing

### User Story 1 - Coaching Resources Filter Opens (Priority: P1)

Mobile users need to access and use the filter panel on Coaching Resources without the interaction breaking.

**Why this priority**: Filter functionality is broken on mobile. Users cannot access filters at all, making the resource discovery unusable.

**Independent Test**: Can be fully tested by opening Coaching Resources on mobile, clicking "Show filters", verifying the filter panel appears and is interactive. Delivers immediate functional fix.

**Acceptance Scenarios**:

1. **Given** I am on the Coaching Resources page on mobile, **When** I click the "Show filters" button, **Then** the filter panel opens without error
2. **Given** the filter panel is open, **When** I interact with filter controls (checkboxes, dropdowns, etc.), **Then** selections are registered and applied correctly
3. **Given** filters are applied, **When** I click "Show filters" again, **Then** the panel collapses cleanly without visual glitches

---

### User Story 2 - Resource Tabs Mobile Carousel (Priority: P2)

On mobile, resource category tabs (Coaching Resources, Player Resources, Manager Resources, Guides, Forms) should be a left/right scrollable carousel instead of stacked vertically.

**Why this priority**: Current tab layout "looks terrible" on mobile and doesn't follow mobile UX patterns. Carousel is mobile-native and improves visual hierarchy and discoverability.

**Independent Test**: Can be fully tested by viewing the resource page on mobile and confirming tabs are presented as a horizontal carousel, with left/right scroll capability and visual indicators of which tab is active.

**Acceptance Scenarios**:

1. **Given** I am on the resources page on mobile, **When** I view the resource tabs, **Then** they are displayed as a horizontal carousel (not stacked)
2. **Given** the carousel is visible, **When** I swipe left or right, **Then** the tabs scroll smoothly and reveal adjacent categories
3. **Given** multiple tabs exist, **When** I scroll to either end of the carousel, **Then** scroll stops at the boundary (no infinite loop or overflow)
4. **Given** a tab is selected, **When** I view the carousel, **Then** the active tab is visually highlighted and centered (or near-centered) in the viewport

---

### User Story 3 - Filter Panel Size & Auto-Collapse (Priority: P3)

When the filter panel is open on mobile, it should be appropriately sized and auto-collapse on user scroll to maximize content visibility.

**Why this priority**: Nice-to-have polish. Improves UX by reducing screen real estate consumed by filters while they're not being actively adjusted. Increases usable space for resource content.

**Independent Test**: Can be fully tested by opening the filter panel, confirming it doesn't exceed a reasonable height (e.g., ~40-50% of viewport), then scrolling the resource list and verifying the filter panel collapses automatically.

**Acceptance Scenarios**:

1. **Given** the filter panel is open on mobile, **When** I view the screen, **Then** the panel occupies no more than 50% of the viewport height
2. **Given** the filter panel is open, **When** I begin scrolling the resource list below, **Then** the filter panel smoothly collapses/hides
3. **Given** the filter panel is collapsed, **When** I scroll back to the top, **Then** the filter panel re-expands (or remains collapsed until user taps "Show filters")
4. **Given** I close the filter panel, **When** I navigate away and return to the same resource category, **Then** the filter panel state is preserved (open/closed as it was)

---

### Edge Cases

- What happens when there are 0 filter options (empty category)?
- How does the carousel behave when there are only 1–2 tabs vs. 5+ tabs?
- What happens if a user has filter selections applied, then rotates device (portrait ↔ landscape)?
- Does the filter panel state (open/closed) persist across navigation?

---

## Requirements

### Functional Requirements

- **FR-001**: Filter panel MUST open and close reliably on mobile without console errors or visual glitches
- **FR-002**: Filter selections MUST be applied and persisted within the session (or per design spec for persistence scope)
- **FR-003**: Resource tabs MUST render as a horizontal carousel on mobile breakpoint (likely `<= 768px` or per current breakpoint definition)
- **FR-004**: Carousel MUST support touch swipe/scroll gestures for left/right navigation
- **FR-005**: Filter panel height on mobile MUST not exceed 50% of viewport
- **FR-006**: Filter panel MUST auto-collapse on scroll down and either auto-expand on scroll up or remain collapsed (TBD by Walshy)
- **FR-007**: All filter interactions MUST be keyboard accessible (tab, enter, space) in addition to touch/click

### Key Entities

- **Filter Panel**: Container holding filter controls (checkboxes, dropdowns, etc.) for resource discovery
- **Resource Tabs**: Navigation tabs for Coaching Resources, Player Resources, Manager Resources, Guides, Forms
- **Mobile Breakpoint**: Screen size threshold (design assumption: `<= 768px`) where mobile layout applies

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Filter panel opens on 100% of test attempts on mobile (no broken state)
- **SC-002**: Resource tabs carousel renders without horizontal overflow on all tested mobile devices (iPhone SE, iPhone 13, Samsung Galaxy A50, etc.)
- **SC-003**: Carousel touch swipe response time is < 200ms and feels native/smooth
- **SC-004**: Filter panel auto-collapse triggers within 100ms of scroll start
- **SC-005**: Users can complete resource discovery (open filter, select criteria, view results) in one seamless interaction without frustration or needing to re-tap buttons
