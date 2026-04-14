# Feature Specification: Seasons Page

**Feature Branch**: `cameronwalsh/coa-45-seasons-page`  
**Created**: 2026-04-13  
**Status**: Draft

## User Scenarios & Testing

### User Story 1 - Browse Current Season (Winter 2026) (Priority: P1)

Visitor lands on Seasons page and clicks the current season (Winter 2026) card to view the current team roster, competition ladder, and match results for the active season.

**Why this priority**: Current season is the most important data visitors need; drives engagement and retention.

**Acceptance Scenarios**:

1. **Given** Winter 2026 card is displayed, **When** page loads, **Then** status shows "Grading"
2. **Given** Winter 2026 card is displayed, **When** card is clicked, **Then** visitor navigates to Teams page showing Winter 2026 season data from PlayHQ
3. **Given** Winter 2026 card is displayed, **When** status is "Grading", **Then** card uses appropriate text colour from design system

---

### User Story 2 - Browse Past Season Data (Summer 2025/26) (Priority: P1)

Visitor clicks the past season (Summer 2025/26) card to view historical team roster, ladder, and results from the completed season pulled from PlayHQ.

**Why this priority**: Archive/historical data equally important for retrospective viewing; same framework as current season ensures consistency.

**Acceptance Scenarios**:

1. **Given** visitor is on Seasons page, **When** Summer 2025/26 card is clicked, **Then** visitor navigates to Teams page showing Summer 2025/26 season data from PlayHQ
2. **Given** Summer 2025/26 card is displayed, **When** page loads, **Then** status shows "Complete" with appropriate visual styling
3. **Given** Teams page is loaded for past season, **When** visitor views the page, **Then** same Teams page framework is used as Winter 2026

---

### User Story 3 - Identify Upcoming Season (Summer 2026/27) (Priority: P1)

Visitor sees the upcoming season card (Summer 2026/27) as visually disabled/faded, understanding registration is not yet open; card is not clickable.

**Why this priority**: Clear visual distinction prevents user confusion and improves information architecture.

**Acceptance Scenarios**:

1. **Given** Summer 2026/27 card is displayed, **When** page loads, **Then** card is visually faded (reduced opacity/greyed out)
2. **Given** Summer 2026/27 card is faded, **When** visitor attempts to click it, **Then** click is ignored / card does not navigate
3. **Given** Summer 2026/27 card is displayed, **When** page loads, **Then** status shows "Registration Coming Soon" with faded styling

---

### User Story 4 - View Training Information by Venue (Priority: P2)

Visitor views Training Information section (displayed above season cards) with venue cards (BSE, VCC) showing location-specific training details and facility information.

**Why this priority**: Post-registration launch, training information essential for participants; P2 allows current season data to launch first.

**Acceptance Scenarios**:

1. **Given** Seasons page loads, **When** visitor views page, **Then** Training Information section displays above the 4 season cards
2. **Given** Training Information section is displayed, **When** page loads, **Then** section displays 2 venue cards: Bendigo South East (BSE) and Victory Catholic College (VCC)
3. **Given** venue cards are displayed, **When** visitor views them, **Then** each card shows location/facility information (address, parking, contact, etc.)
4. **Given** visitor is viewing venue cards, **When** future venues are added, **Then** additional venue cards can be inserted up to 4 total without restructuring layout

---

### User Story 5 - Archive Placeholder (Priority: P3)

Visitor sees Archive card as visually disabled/faded placeholder; shows "Coming Soon" to indicate future functionality.

**Why this priority**: P3 because Archive is future feature; MVP can launch without it.

**Acceptance Scenarios**:

1. **Given** Archive card is displayed, **When** page loads, **Then** card is visually faded (reduced opacity/greyed out)
2. **Given** Archive card is faded, **When** visitor attempts to click it, **Then** click is ignored / card does not navigate
3. **Given** Archive card is displayed, **When** page loads, **Then** status shows "Coming Soon"

---

### Edge Cases

- What happens when PlayHQ data for Summer 2025/26 fails to load? (Fall back to cached/last-known data or show error placeholder)
- How does system handle seasons with no team data? (Show empty state with explanation)
- What happens when a new season is added? (Admin adds to seasons array; page auto-renders new card)
- How does system handle venue card overflow if more than 4 venues exist? (Scrollable container or grid wrapping)

## Requirements

### Functional Requirements

- **FR-001**: System MUST display Training Information section above the 4 season cards
- **FR-002**: System MUST display exactly 4 season cards in order below Training Information: Winter 2026 (current), Summer 2025/26 (past), Summer 2026/27 (upcoming), Archive
- **FR-003**: System MUST display Winter 2026 card with status "Grading"
- **FR-004**: System MUST pull Summer 2025/26 season data from PlayHQ API and display teams/ladder/results via Teams page framework
- **FR-005**: System MUST render Winter 2026 Teams page with current season data pulled from PlayHQ API
- **FR-006**: System MUST display status badge on each season card with dynamic text content ("Grading", "Complete", "Coming Soon")
- **FR-007**: System MUST apply colour-coded styling to status badges based on season state (text colour only; design system TBD)
- **FR-008**: System MUST disable click interaction on Summer 2026/27 (upcoming) and Archive cards; apply visual fading to indicate disabled state
- **FR-009**: System MUST enable click interaction on Winter 2026 and Summer 2025/26 cards to navigate to Teams page with appropriate season context
- **FR-010**: System MUST render Training Information section with venue cards: Bendigo South East (BSE) and Victory Catholic College (VCC), each with location/facility details
- **FR-011**: System MUST support dynamic addition of up to 4 venue cards without layout breakage (currently 2 known)
- **FR-012**: System MUST display Training Information section and current season (Winter 2026) card at top on mobile/responsive layouts; maintain 4-card stack order below

### Key Entities

- **Training Information Section**: Container displaying venue information, positioned above season cards

- **Season**: Represents a competitive season with id, name, status, clickable boolean
  - Winter 2026: id="winter-2026", name="Winter 2026", status="Grading", clickable=true
  - Summer 2025/26: id="summer-2025-26", name="Summer 2025/26", status="Complete", clickable=true, playHqId=<TBD>
  - Summer 2026/27: id="summer-2026-27", name="Summer 2026/27", status="Coming Soon", clickable=false, faded=true
  - Archive: id="archive", name="Archive", status="Coming Soon", clickable=false, faded=true

- **Venue**: Represents a training location with id, name, address, contact details
  - Bendigo South East (BSE): id="bse", name="Bendigo South East", address=<TBD>, details=<TBD>
  - Victory Catholic College (VCC): id="vcc", name="Victory Catholic College", address=<TBD>, details=<TBD>
  - Future venues: placeholder for up to 2 additional venues

- **Teams Page Context**: Reusable Teams page framework that accepts season parameter to display correct roster/ladder/results

## Success Criteria

### Measurable Outcomes

- **SC-001**: Training Information section is visible and readable on all screen sizes (desktop, tablet, mobile)
- **SC-002**: Visitor can click current season (Winter 2026) and view Teams page with live PlayHQ data in under 1 second navigation time
- **SC-003**: Visitor can click past season (Summer 2025/26) and view historical Teams data from PlayHQ in under 1 second navigation time
- **SC-004**: Winter 2026 card displays "Grading" status with correct colour coding
- **SC-005**: Visitor recognizes upcoming season (Summer 2026/27) and Archive cards as non-interactive due to visual fading and disabled state
- **SC-006**: Season card status badges are accurate and match current season state
- **SC-007**: Page maintains responsive layout with Training Information section and current season at top on mobile without card reordering on desktop
- **SC-008**: 90% of visitors successfully navigate to current or past season Teams page on first attempt without clicking disabled cards
