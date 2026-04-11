# Feature Specification: Seasons Page

**Feature Branch**: `cameronwalsh/coa-24-seasons-page`  
**Created**: 2026-04-11  
**Status**: Draft  
**Input**: Clarified requirements from Walshy

## User Scenarios & Testing

### User Story 1 - View current season details (Priority: P1)

A coach or parent visits the Seasons page and immediately sees what's happening this winter. They can click into the Current Season tile to view key dates and registration costs for the ongoing season.

**Why this priority**: This is the primary use case—coaches and parents need to know what's active *right now* and how to sign up.

**Independent Test**: Can be fully tested by visiting the Seasons page, confirming Current Season displays Winter 2026, clicking it, and verifying registration costs appear at the top of the detail view.

**Acceptance Scenarios**:

1. **Given** the Seasons page loads, **When** the page renders, **Then** Current Season tile is visible above all other sections
2. **Given** Current Season tile is visible, **When** user clicks it, **Then** a detail view opens showing registration costs at the top
3. **Given** Current Season detail view is open, **When** page displays, **Then** key dates for Winter 2026 are visible

---

### User Story 2 - View next season placeholder (Priority: P2)

A user looking ahead sees a Next Season tile with a "Coming Soon" placeholder. Once PlayHQ teams exist for the next season, this tile will populate with real data. The layout reserves space for it, so the transition is clean.

**Why this priority**: Enables forward planning and sets expectations for when the next season opens, reduces support inquiries about upcoming seasons.

**Independent Test**: Can be fully tested by loading the Seasons page and confirming a Next Season placeholder tile displays with "Coming Soon" messaging; clicking it shows the same registration costs structure ready to be filled.

**Acceptance Scenarios**:

1. **Given** the Seasons page loads and no next season data exists, **When** page renders, **Then** Next Season tile appears with "Coming Soon" placeholder
2. **Given** Next Season tile is visible, **When** user clicks it, **Then** a detail view opens with empty/placeholder registration costs ready for data
3. **Given** Next Season data becomes available (teams created in PlayHQ), **When** page refreshes, **Then** placeholder is replaced with real season data

---

### User Story 3 - View previous season history (Priority: P2)

A user wants to see what happened last season. They click the Previous Season tile (Summer 2025/26) to review past dates and registration info for reference.

**Why this priority**: Provides continuity and historical context; coaches may need to reference previous season details.

**Independent Test**: Can be fully tested by clicking the Previous Season tile and confirming Summer 2025/26 data displays with registration costs.

**Acceptance Scenarios**:

1. **Given** the Seasons page loads, **When** page renders, **Then** Previous Season tile is visible below Current and Next
2. **Given** Previous Season tile is visible, **When** user clicks it, **Then** detail view opens showing Summer 2025/26 data and registration costs
3. **Given** previous season detail view is open, **When** page displays, **Then** past key dates are visible for reference

---

### User Story 4 - Access archived seasons (Priority: P3)

Once PlayHQ API is connected and we have multiple years of historical data, a user can view an Archive tile that lists or links to seasons from previous years (e.g., 2024, 2023).

**Why this priority**: Nice-to-have for future-proofing; not critical until we have multi-year data in PlayHQ. Keeps the page from becoming cluttered with old seasons.

**Independent Test**: Can be fully tested by confirming Archive tile appears once we integrate PlayHQ API and have 2+ years of data; clicking it reveals older seasons.

**Acceptance Scenarios**:

1. **Given** PlayHQ API is connected and we have 2+ years of season data, **When** page renders, **Then** Archive tile appears at the bottom
2. **Given** Archive tile is visible, **When** user clicks it, **Then** a list or sub-view of older seasons is displayed

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST display exactly four season tiles in this order: Current, Next, Previous, and Archive (Archive only shows when 2+ years of historical data exist)
- **FR-002**: System MUST place Key Dates card(s) **above** all season tiles
- **FR-003**: System MUST populate season tiles with data from PlayHQ API; placeholders allowed during development before API key is available
- **FR-004**: System MUST show Next Season as a "Coming Soon" placeholder when no next season data exists
- **FR-005**: When a season tile is clicked, system MUST open a detail view with registration costs card displayed at the top
- **FR-006**: System MUST fetch and display:
  - Current Season: Winter 2026 (with key dates and registration costs)
  - Previous Season: Summer 2025/26 (with key dates and registration costs)
  - Next Season: Placeholder until PlayHQ teams are created
  - Archive: Hidden until 2+ years of data exist
- **FR-007**: Registration costs card MUST be populated with correct current/next/previous season pricing from PlayHQ
- **FR-008**: System MUST clearly indicate which season is Current, which is Next, and which is Previous (via visual hierarchy or labels)

### Key Entities

- **Season**: Represents a competitive period (e.g., Winter 2026, Summer 2025/26)
  - Attributes: name, start date, end date, season type (current/next/previous/archive)
  - Relations: hasMany KeyDates, hasMany RegistrationCosts
  
- **Key Dates**: Dates relevant to a season (e.g., registration opens, first game, finals)
  - Attributes: date label, date value, description
  - Relation: belongsTo Season
  
- **Registration Costs**: Pricing structure for a season
  - Attributes: tier/category name, cost, description (e.g., "Full Season", "Late Registration")
  - Relation: belongsTo Season

---

## Edge Cases

- What happens when PlayHQ API returns incomplete or null data for a season? → Display placeholder text "Data unavailable, please check back soon"
- How does the system handle a season with no key dates? → Key dates card appears but shows "No scheduled dates" or similar
- What if registration costs are missing for a season? → Show "Registration pricing TBA" in the detail view
- What if next season data arrives mid-cycle? → Page automatically populates Next Season tile; placeholder is replaced seamlessly on next load
- Archive tile population: At what point do we decide to move a season to Archive? → When a new season becomes Current, the old Current moves to Previous, and Previous moves to Archive (rolling window)

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Coaches can view and click into Current Season and see registration information in under 3 clicks
- **SC-002**: Page loads with Key Dates visible above season tiles on first render (no scrolling required for typical viewport)
- **SC-003**: All four season tiles (or three + Archive when applicable) render without layout shifts or broken styling
- **SC-004**: Registration costs cards display accurately for Current and Previous seasons (verified against PlayHQ data once API is live)
- **SC-005**: Next Season placeholder gracefully transitions to populated data once teams are created in PlayHQ (no manual page refresh required)
- **SC-006**: Page remains responsive on mobile (stacked tiles, readable text, clickable season cards)

---

## Implementation Notes

### Data Flow

1. **On page load**: Fetch season data from PlayHQ API (or placeholders if API key not yet available)
2. **Identify season role**: Map seasons to Current/Next/Previous/Archive based on date logic
3. **Render layout**: Key Dates card(s) → Current tile → Next tile (placeholder or populated) → Previous tile → Archive tile (if applicable)
4. **On season tile click**: Open detail view, fetch and display registration costs at top

### Placeholder Structure (until PlayHQ API key is available)

```
Current Season: Winter 2026
- Start: [PLACEHOLDER]
- End: [PLACEHOLDER]
- Key Dates: [PLACEHOLDER]
- Registration Costs: [PLACEHOLDER]

Next Season: [COMING SOON]
- All content: [PLACEHOLDER]

Previous Season: Summer 2025/26
- Start: [PLACEHOLDER]
- End: [PLACEHOLDER]
- Key Dates: [PLACEHOLDER]
- Registration Costs: [PLACEHOLDER]

Archive: [HIDDEN UNTIL 2+ YEARS DATA]
```

### Future Integration

Once PlayHQ API key is available:
- Replace `[PLACEHOLDER]` with live API calls
- Implement automatic refresh logic for Next Season population
- Build Archive tile logic to show seasons older than 2 years

---

## Design Notes

- **Reuse existing Seasons page tile components** (as mentioned in COA-24)
- **Key Dates positioning**: Place above tiles; consider whether they're global (applying to all seasons) or season-specific (only show when a season is selected)
- **Registration costs cards**: Appear inside season detail view, always at the top for quick visibility
- **Visual cues**: Use color, icons, or labels to clearly indicate which season is Current (e.g., "Current Season" badge, highlighted border)
