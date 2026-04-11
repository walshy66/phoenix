# Feature Specification: Seasons Page

**Feature Branch**: `cameronwalsh/coa-24-seasons-page`  
**Created**: 2026-04-11  
**Status**: READY_FOR_DEV  
**Input**: Clarified requirements from Walshy  
**Primary Route**: `/seasons` (Astro page at `src/pages/seasons.astro`)

## User Scenarios & Testing

### User Story 1 - View current season details (Priority: P1)

A coach or parent visits the Seasons page and immediately sees what's happening this winter. They can click into the Current Season tile to view key dates and registration costs for the ongoing season.

**Why this priority**: This is the primary use case—coaches and parents need to know what's active *right now* and how to sign up.

**Independent Test**: Can be fully tested by visiting the Seasons page, confirming Current Season displays Winter 2026, clicking it, and verifying registration costs appear at the top of the detail view.

**Acceptance Criteria**:

1. **Given** the Seasons page loads, **When** the page renders, **Then** Current Season tile is visible above all other sections
2. **Given** Current Season tile is visible, **When** user clicks it with mouse or keyboard (Enter/Space), **Then** a detail view opens showing registration costs at the top
3. **Given** Current Season detail view is open, **When** the view displays, **Then** key dates for Winter 2026 are visible below registration costs
4. **Given** detail view is open, **When** user presses Escape or clicks the close button, **Then** detail view closes and focus returns to the season tile
5. **Given** a user is on mobile (< 768px width), **When** the page renders, **Then** the Current Season tile is full-width and stacked above other sections
6. **Given** the detail view opens, **When** viewing on desktop, **Then** registration costs and key dates cards have sufficient whitespace and readable text hierarchy (min 14px font, 1.5 line height)

---

### User Story 2 - View next season placeholder (Priority: P2)

A user looking ahead sees a Next Season tile with a "Coming Soon" placeholder. Once PlayHQ teams exist for the next season, this tile will populate with real data. The layout reserves space for it, so the transition is clean.

**Why this priority**: Enables forward planning and sets expectations for when the next season opens, reduces support inquiries about upcoming seasons.

**Independent Test**: Can be fully tested by loading the Seasons page and confirming a Next Season placeholder tile displays with "Coming Soon" messaging; clicking it shows the same registration costs structure ready to be filled.

**Acceptance Criteria**:

1. **Given** the Seasons page loads and no next season data exists, **When** page renders, **Then** Next Season tile appears with "Coming Soon" placeholder and disabled visual state (reduced opacity or disabled cursor)
2. **Given** Next Season tile is visible in placeholder state, **When** user attempts to click it with mouse or keyboard, **Then** a detail view still opens but shows "Season details coming soon — check back when registration opens" messaging
3. **Given** Next Season data becomes available (teams created in PlayHQ), **When** page is refreshed or data polling triggers, **Then** placeholder state is replaced with real season data and tile becomes clickable
4. **Given** a user is on mobile, **When** Next Season tile renders, **Then** it is full-width and stacked, with clear visual indication that it is "Coming Soon"

---

### User Story 3 - View previous season history (Priority: P2)

A user wants to see what happened last season. They click the Previous Season tile (Summer 2025/26) to review past dates and registration info for reference.

**Why this priority**: Provides continuity and historical context; coaches may need to reference previous season details.

**Independent Test**: Can be fully tested by clicking the Previous Season tile and confirming Summer 2025/26 data displays with registration costs.

**Acceptance Criteria**:

1. **Given** the Seasons page loads, **When** page renders, **Then** Previous Season tile is visible below Current and Next sections
2. **Given** Previous Season tile is visible, **When** user clicks it with mouse or keyboard (Enter/Space), **Then** detail view opens showing Summer 2025/26 data and registration costs at the top
3. **Given** previous season detail view is open, **When** page displays, **Then** past key dates are visible below registration costs for historical reference
4. **Given** a user is on mobile, **When** Previous Season tile renders, **Then** it is full-width and stacked, with visual distinction from Current/Next tiles (e.g., muted color or "Past Season" label)

---

### User Story 4 - Access archived seasons (Priority: P3)

Once PlayHQ API is connected and we have multiple years of historical data, a user can view an Archive tile that lists or links to seasons from previous years (e.g., 2024, 2023).

**Why this priority**: Nice-to-have for future-proofing; not critical until we have multi-year data in PlayHQ. Keeps the page from becoming cluttered with old seasons.

**Independent Test**: Can be fully tested by confirming Archive tile appears once we integrate PlayHQ API and have 2+ years of data; clicking it reveals older seasons.

**Acceptance Criteria**:

1. **Given** PlayHQ API is connected and the system has 2+ distinct years of season records, **When** page renders, **Then** Archive tile appears below Previous Season at the bottom of the tile grid
2. **Given** Archive tile is visible, **When** user clicks it with mouse or keyboard (Enter/Space), **Then** a detail view opens showing a chronological list of older seasons (earliest at bottom)
3. **Given** Archive detail view is open, **When** user clicks a season within the archive list, **Then** that season's registration costs and key dates display above the list
4. **Given** fewer than 2 distinct years of season data exist, **When** page renders, **Then** Archive tile is completely hidden and not rendered in the DOM

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
- **FR-009**: System MUST support responsive layout at all viewport sizes with no layout shifts during detail view open/close transitions
- **FR-010**: System MUST provide error handling and graceful degradation when PlayHQ API data is unavailable or incomplete
- **FR-011**: System MUST preserve and maintain access to financial assistance information and grading data. These features are in-scope for the Seasons page and must remain accessible to users when viewing season information

### Non-Functional Requirements

**Accessibility (WCAG 2.1 AA)**
- NFR-001: All season tiles MUST be keyboard accessible — Tab to focus, Enter/Space to activate detail view, Escape to close detail view
- NFR-002: Season tiles and detail view buttons MUST have visible focus indicators (min 3px outline, 3:1 contrast ratio from background)
- NFR-003: All season tiles and buttons MUST have semantic HTML role attributes and descriptive aria-label text (e.g., "Current Season: Winter 2026, click to view details")
- NFR-004: Text in tiles and detail views MUST meet WCAG AA contrast minimum of 4.5:1 for normal text, 3:1 for large text (18pt+)
- NFR-005: All interactive elements MUST have a minimum touch target size of 44x44px on mobile devices (per WCAG 2.1 Success Criterion 2.5.5)
- NFR-006: Detail view MUST be dismissible via keyboard (Escape key) and have a visible close button with clear labeling

**Responsive Design**
- NFR-007: Page MUST render correctly at all breakpoints: mobile (< 640px), tablet (640px–1024px), desktop (> 1024px) with mobile-first approach
- NFR-008: Season tiles on mobile (< 768px) MUST stack vertically (1 column), on tablet MUST display as 2 columns, on desktop MUST display as 4 columns OR flow responsively without layout shifts
- NFR-009: Tiles MUST NOT shift position or size when detail view opens/closes (no cumulative layout shift)
- NFR-010: Key Dates cards MUST remain readable on all breakpoints with legible font sizes (min 12px on mobile, 14px on desktop) and appropriate padding

**Error Handling & Data Unavailability**
- NFR-011: If PlayHQ API returns null/incomplete data for any season, system MUST display "Data unavailable" placeholder text in place of actual data, not blank spaces
- NFR-012: If a season has no key dates, system MUST display "No scheduled dates announced" in the Key Dates area, not hide the card or show blank fields
- NFR-013: If registration costs are missing for a season, detail view MUST display "Registration pricing to be confirmed" in the Registration Costs card
- NFR-014: If PlayHQ API fails completely (e.g., 5xx error or timeout), the page MUST still render with all placeholder states and a prominent message: "Season details are temporarily unavailable; check back soon"
- NFR-015: All error states MUST log to observability system (console or analytics) with timestamp, error code, and affected data field for debugging

**Performance**
- NFR-016: Season tile data fetch MUST complete within 2 seconds on 4G network; if slower, show skeleton loaders while fetching
- NFR-017: Detail view open/close transitions MUST complete within 300ms (smooth visual feedback without perceived lag)
- NFR-018: Page initial render MUST not include PlayHQ API calls that block First Contentful Paint; defer to background fetch if needed

**Layout Integrity**
- NFR-019: Tiles MUST NOT reflow or shift when detail view opens — detail view MUST render as a modal/overlay OR expand below the tile without pushing other tiles down
- NFR-020: Images and icons in tiles MUST NOT distort; use object-fit: cover for consistent aspect ratios
- NFR-021: Detail view MUST have max-width constraint (recommend max-w-2xl in Tailwind) and center on desktop to avoid excessive line lengths

### Key Entities

- **Season**: Represents a competitive period (e.g., Winter 2026, Summer 2025/26)
  - Attributes:
    - `id`: Unique identifier (from PlayHQ or internal DB)
    - `name`: Human-readable name (e.g., "Winter 2026", "Summer 2025/26")
    - `startDate`: ISO 8601 datetime when season begins
    - `endDate`: ISO 8601 datetime when season concludes
    - `role`: Server-determined role — one of: `current` | `next` | `previous` | `archive` (determined by comparing startDate/endDate to current date)
    - `status`: Enum — `active` | `coming_soon` | `completed` (for display state)
  - Relations: hasMany `KeyDates`, hasMany `RegistrationCosts`
  - **Server Responsibility**: Backend MUST calculate `role` based on date logic; client MUST NOT infer season role from data
  
- **Key Dates**: Dates relevant to a season (e.g., registration opens, first game, finals)
  - Attributes:
    - `label`: Short label for the date (e.g., "Registration Opens", "Season Starts")
    - `date`: ISO 8601 datetime or date value
    - `description` (optional): Additional context (e.g., "Grading sessions at City Court")
  - Relation: belongsTo `Season`
  - **Empty State**: If no key dates exist for a season, field MUST display "No scheduled dates announced yet"
  
- **Registration Costs**: Pricing structure for a season
  - Attributes:
    - `id`: Unique identifier
    - `category`: Tier name (e.g., "U8–U10", "Senior Men", "Late Registration")
    - `cost`: AUD amount as decimal (e.g., 150.00)
    - `description` (optional): Additional notes (e.g., "Includes 4 games")
  - Relation: belongsTo `Season`
  - **Server Responsibility**: Backend MUST fetch all costs from PlayHQ and send to client; client MUST NOT calculate or modify pricing
  - **Empty State**: If no registration costs exist, display "Registration pricing to be confirmed"

---

## Edge Cases

1. **PlayHQ API Returns Incomplete or Null Data**
   - **Scenario**: API call for season data succeeds but some fields are missing (e.g., end date is null)
   - **Expected Behavior**: Display the available data; fill missing fields with appropriate placeholder text ("Date TBA", "Details coming soon")
   - **Client Responsibility**: MUST NOT attempt to infer or calculate missing data; leave blank or show explicit placeholder

2. **Season Has No Key Dates**
   - **Scenario**: PlayHQ API returns a season with empty `keyDates` array
   - **Expected Behavior**: Key Dates card still renders in detail view, but shows "No scheduled dates announced yet" instead of blank space
   - **Test**: Load a season with no key dates and verify the card is visible with the placeholder text

3. **Registration Costs Missing or Incomplete**
   - **Scenario**: `registrationCosts` array is empty or some categories are missing pricing
   - **Expected Behavior**: Registration Costs card displays "Registration pricing to be confirmed" rather than blank table rows
   - **Test**: Load a season with no registration costs and verify the placeholder text appears

4. **PlayHQ API Call Fails (Network Error, Timeout, or 5xx)**
   - **Scenario**: Initial page load or tile expansion fails due to network issues or API downtime
   - **Expected Behavior**: Page still renders with all season tiles in placeholder state; prominent banner message: "Season details are temporarily unavailable; check back soon"
   - **Logging**: Log error with timestamp, HTTP status code, and affected data field to observability system

5. **Next Season Data Arrives Mid-Cycle**
   - **Scenario**: User is viewing the page with "Coming Soon" placeholder; teams are created in PlayHQ while user is viewing
   - **Expected Behavior**: On next page refresh or if client implements polling, Next Season placeholder is replaced with real data without manual user action
   - **Test**: Verify page can gracefully replace placeholder tile with populated tile without layout shift

6. **Season Role Determination Boundary Condition**
   - **Scenario**: Current date is exactly equal to a season's start or end date
   - **Expected Behavior**: Backend date logic MUST define which role applies (e.g., if today == startDate, is season `current` or is previous season still `current`?). Recommendation: season is `current` if `today >= startDate AND today <= endDate`
   - **Server-Side Only**: This logic MUST be in backend; client MUST NOT attempt to determine season role

7. **Archive Population Logic**
   - **Scenario**: System has exactly 2 years of season records (e.g., 2026 and 2025 seasons)
   - **Expected Behavior**: Archive tile appears and includes seasons from 2025 and earlier; once a third year of seasons is added, rolling window continues to include all non-current/next/previous seasons
   - **Definition**: Archive shows when backend data includes 2+ distinct calendar years in the season list

8. **Season Data Partially Loads (Some Fields Slow)**
   - **Scenario**: Season name and dates load quickly, but registration costs take an additional 1–2 seconds to fetch
   - **Expected Behavior**: Detail view opens immediately with name/dates visible and a loading spinner/skeleton in the Registration Costs area; costs populate when ready
   - **Test**: Simulate slow API for registration costs and verify detail view remains interactive

9. **Mobile Touch Interaction on Detail View Close**
   - **Scenario**: User opens detail view on mobile and wants to close it via tap outside the modal (common UX pattern)
   - **Expected Behavior**: If detail view is a modal overlay, tapping outside MUST close it; if inline expand, Escape key or close button MUST work
   - **Accessibility**: Always provide an explicit close button in addition to click-outside behavior

10. **Archive List Contains Many Seasons (Scrolling)**
    - **Scenario**: Archive contains 10+ past seasons
    - **Expected Behavior**: Archive detail view displays seasons in a scrollable list, oldest at bottom, newest at top (chronological order, most recent first)
    - **Test**: Verify list scrolls smoothly and doesn't cause page layout shift

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Coaches can view Current Season and click into it to see registration information in under 3 clicks (test: measure click count from page load to registration details display)
- **SC-002**: Page loads with Key Dates visible above season tiles on first render without scrolling on desktop viewport (1920x1080); on mobile (375x667) Key Dates may require one scroll
- **SC-003**: All season tiles render without Cumulative Layout Shift (CLS) when detail view opens/closes; CLS score MUST be < 0.1 (Web Vitals standard)
- **SC-004**: Registration costs cards display accurately for Current and Previous seasons when verified against PlayHQ API response data once integration is complete
- **SC-005**: Next Season placeholder can be replaced with populated data via page refresh or client-side polling without visual artifacts or layout shift
- **SC-006**: Page is fully responsive: tiles stack 1-col on mobile (< 640px), 2-col on tablet (640–1024px), 4-col or responsive grid on desktop (> 1024px), with readable text (min 12px) and clickable elements (min 44x44px)
- **SC-007**: All accessibility requirements (NFR-001 through NFR-006) are verified by manual keyboard navigation test and automated WCAG AA scanner (e.g., Axe)
- **SC-008**: Error states (network failure, missing data) display appropriate placeholder text and do not show blank/broken UI elements

---

## Implementation Notes

### Data Flow

1. **Page Load Phase**
   - Fetch season data from PlayHQ API (if available) OR use hardcoded placeholder data
   - Backend returns array of Season objects with `role` already assigned (current/next/previous/archive)
   - Backend MUST handle date comparison and role assignment; client receives pre-computed role

2. **Season Role Assignment (Backend Only)**
   - Backend compares current date to season start/end dates
   - Applies logic: if `today >= startDate AND today <= endDate` → role = `current`
   - Else if `startDate > today` → role = `next` (pick season with earliest startDate for "next")
   - Else if `endDate < today` → role = `previous` or `archive` (per rolling window logic)
   - Client MUST NOT replicate this logic; server sends role in response

3. **Render Layout**
   - Hero section (existing)
   - Key Dates card section (global, above tiles)
   - Season tiles grid in order: Current → Next → Previous → Archive (if applicable)
   - On tile click, open detail view (modal or inline expand — finalize during dev planning)

4. **Detail View Trigger**
   - On season tile click (mouse or keyboard Enter/Space)
   - Fetch or display cached registration costs for that season
   - Display in modal or inline below tile
   - Close on Escape key or close button click; focus management required

5. **Next Season Placeholder Behavior**
   - If season has role = `next` but registration costs are empty, display "Coming Soon" visual state
   - Tile is still clickable and opens detail view, but shows "Season details coming soon" messaging
   - On page refresh, if real data arrives, placeholder automatically replaced

6. **Archive Population Logic**
   - Backend counts distinct calendar years in season data
   - If `distinctYears >= 2`, include Archive season(s) in response
   - Client renders Archive tile only if received in data (conditional rendering)
   - Archive detail view shows chronological list (newest first)

### Placeholder Structure (until PlayHQ API key is available)

```
Current Season: Winter 2026
- Start: 2026-06-01
- End: 2026-09-30
- Role: current
- Key Dates: [PLACEHOLDER - no dates announced yet]
- Registration Costs: [PLACEHOLDER - pricing TBA]

Next Season: [Role = next, status = coming_soon]
- Start: 2026-10-01
- End: 2026-12-31
- Key Dates: [PLACEHOLDER]
- Registration Costs: [PLACEHOLDER - show "Coming Soon" state]

Previous Season: Summer 2025/26
- Start: 2025-12-01
- End: 2026-02-28
- Role: previous
- Key Dates: [PLACEHOLDER]
- Registration Costs: [PLACEHOLDER]

Archive: [HIDDEN UNTIL 2+ years of season records exist]
```

### Constraints & Implementation Guardrails

- **No Client-Side Season Role Logic**: Client MUST receive `role` field from backend; do NOT calculate role based on dates in JavaScript/React
- **No Pricing Calculation**: Registration costs array comes from PlayHQ; client MUST display as-is without modification
- **No Inference of Server State**: If archive is hidden, do NOT show empty Archive tile; only render if backend includes Archive seasons
- **Error Handling Must Be Explicit**: If PlayHQ API fails, show "Season details are temporarily unavailable" banner; do NOT render broken/blank tiles
- **Accessibility Is Non-Negotiable**: All tiles and buttons MUST have keyboard nav, focus indicators, and ARIA labels before merge
- **No Layout Shifts on Detail View Open**: Use CSS transforms or fixed modal positioning; do NOT let detail view push tiles down

### Future Integration (Post-MVP)

Once PlayHQ API key is available:
- Replace placeholder data with live API calls to PlayHQ endpoints
- Implement data refresh logic (e.g., poll every 30 seconds for Next Season population)
- Build Archive display logic with year grouping (e.g., "2024 Season", "2023 Season")
- Implement registration cost detail breakdowns if PlayHQ provides tier-specific costs
- Consider sync with PlayHQ grading session dates and finals dates

---

## Design Notes

- **Reuse existing Seasons page tile components** (as mentioned in COA-24 from `src/pages/seasons.astro`)
- **Key Dates positioning**: Display above season tiles as a global section (applies to current/primary season context); season-specific dates appear in detail view
- **Registration costs cards**: Appear inside season detail view, always at the top for quick visibility; do NOT appear on tile itself (avoid clutter)
- **Visual cues**: Use color, icons, or labels to clearly indicate which season is Current (e.g., "Current Season" badge, highlighted border); use muted styling for Previous and Coming Soon states
- **Detail View Implementation**: Recommend modal overlay (not inline expansion) to avoid pushing other tiles down and maintain consistent layout
- **Season Tile Consistency**: All tiles should have consistent dimensions, padding, and typography regardless of status (current/next/previous/archive)
- **Financial Assistance & Grading Information**: These features MUST be preserved and integrated within the Seasons page context. When viewing season information, ensure financial assistance details and grading data remain accessible and are not removed or lost during implementation. These may be displayed as additional sections within the season detail view or as supplementary cards.

---

## Constitutional Compliance Audit

### Principle I: User Outcomes First
- ✅ **PASS**: All user stories have explicit, measurable outcomes (e.g., "Coaches can view and click into Current Season in under 3 clicks")
- ✅ **PASS**: Each story is independently shippable as a P-level feature (P1 stories enable MVP, P2/P3 add value incrementally)
- ✅ **PASS**: Success criteria trace directly back to user behavior (viewing, clicking, receiving information)

### Principle II: Test-First Discipline
- ✅ **PASS**: All acceptance criteria are written in Given/When/Then format and are independently testable
- ✅ **PASS**: Each scenario covers happy path, error cases, and edge states (mobile layout, empty states, closed detail view)
- ✅ **PASS**: Non-functional requirements specify measurable thresholds (< 2 seconds fetch, 300ms transitions, 44x44px touch targets)

### Principle III: Backend Authority & Invariants
- ✅ **PASS**: Season role determination (current/next/previous/archive) is explicitly server-side responsibility (FR-006, Key Entities section)
- ✅ **PASS**: Registration costs data flows from PlayHQ API to client; client MUST NOT calculate or modify pricing (FR-007, Key Entities)
- ✅ **PASS**: Archive visibility (2+ years check) is server-determined and not rendered by client if constraint is not met (FR-001, AC for User Story 4)

### Principle IV: Error Semantics & Observability
- ✅ **PASS**: All error scenarios defined with explicit messaging (NFR-011 through NFR-015, Edge Cases)
- ✅ **PASS**: Recoverable errors distinguished: missing data vs. API failure; each has specific placeholder or message
- ✅ **PASS**: Observability required: errors MUST log to system with timestamp, code, and affected field (NFR-015)

### Principle V: AppShell Integrity
- ✅ **PASS**: Feature uses BaseLayout (as seen in existing `src/pages/seasons.astro`)
- ✅ **PASS**: No custom navigation shell; maintains existing Phoenix design system (colors, typography, spacing)
- ✅ **PASS**: Responsive design enforced via NFRs at all breakpoints with mobile-first approach

### Principle VI: Accessibility First
- ✅ **PASS**: All interactive elements (tiles, detail view close button) are keyboard accessible (Tab, Enter, Escape per NFR-001 and NFR-002)
- ✅ **PASS**: Focus indicators required with 3:1 contrast (NFR-002)
- ✅ **PASS**: Semantic HTML (role, aria-label) mandated for tiles and buttons (NFR-003)
- ✅ **PASS**: WCAG AA contrast minimum enforced (4.5:1 normal, 3:1 large text per NFR-004)
- ✅ **PASS**: Touch target size 44x44px minimum on mobile (NFR-005)
- ⚠️ **WARN**: Detail view dismissal should be testable — spec requires Escape key and close button, but implementation approach (modal vs. inline) not yet locked; recommend finalizing during dev planning

### Principle VII: Immutable Data Flow
- ✅ **PASS**: Data flows unidirectionally: PlayHQ API → Backend → Client → UI (no client-side mutation of season data)
- ✅ **PASS**: Client MUST NOT infer season role from dates; server assigns role explicitly (Key Entities section)
- ✅ **PASS**: Registration costs are read-only on client (NFR-007); no pricing calculation or modification on frontend

### Principle VIII: Dependency Hygiene
- ℹ️ **INFO**: Spec does not introduce new third-party dependencies; uses existing Astro, Tailwind, and BaseLayout
- ℹ️ **INFO**: API integration with PlayHQ is external system dependency; version/compatibility should be tracked separately

### Principle IX: Cross-Feature Consistency
- ✅ **PASS**: Feature reuses existing tile component patterns from `src/pages/seasons.astro`
- ✅ **PASS**: Follows established Phoenix color scheme, typography, and spacing conventions
- ✅ **PASS**: Detail view interaction model (click to open, Escape to close) aligns with standard web UI patterns
- ✅ **PASS**: Accessibility patterns (focus indicators, aria-labels, keyboard nav) consistent with frontend standards

### Summary
- **6 PASS**: Principles I, II, III, IV, V, VII
- **1 WARN**: Principle VI (detail view dismissal pattern should be finalized)
- **1 PASS with INFO**: Principles VIII, IX (no new dependencies, consistent with existing patterns)

**Recommendation**: Feature is constitutionally sound. Address WARN by clarifying detail view implementation (modal vs. inline) during development planning phase.
