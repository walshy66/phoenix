# Feature Specification: Seasons Page

**Feature Branch**: `cameronwalsh/coa-45-seasons-page`
**Status**: READY_FOR_DEV
**Created**: 2026-04-13
**Last Enhanced**: 2026-04-14
**Primary Route**: `/seasons` (Astro page at `src/pages/seasons.astro`)

---

## Summary

This feature redesigns the Seasons page (`/seasons`) to serve as a season navigation hub. Visitors see a Training Information section (venue cards for BSE and VCC) above a row of season cards. Clickable cards navigate to the Teams page (`/teams`) with the appropriate season context. Disabled cards (upcoming season, Archive placeholder) are visually faded and non-interactive. The page builds on the existing `BaseLayout.astro`, `SeasonTile.astro`, and `src/lib/seasons/` patterns from COA-24, extending them to support the new interaction model and venue data.

This feature replaces the COA-24 season detail modal pattern with outbound navigation to the Teams page. The `SeasonDetailModal` component and its associated click handlers from `seasons.astro` are out of scope for this feature — they will be removed or bypassed as part of this redesign.

---

## User Scenarios & Testing

### User Story 1 — Browse Current Season (Winter 2026) (Priority: P1)

Visitor lands on the Seasons page and clicks the current season (Winter 2026) card to view the current team roster, competition ladder, and match results for the active season.

**Why this priority**: Current season is the most important data visitors need; drives engagement and retention.

**Independent Test**: Load `/seasons`, confirm the Winter 2026 card is visible with status "Grading", click it, and confirm navigation to the Teams page showing Winter 2026 data.

**Acceptance Scenarios**:

1. **Given** the Seasons page loads, **When** the page renders, **Then** Winter 2026 card is visible with status badge displaying "Grading"
2. **Given** Winter 2026 card is displayed, **When** visitor clicks it, **Then** visitor navigates to the Teams page showing Winter 2026 season data from PlayHQ
3. **Given** visitor uses keyboard navigation, **When** they Tab to the Winter 2026 card and press Enter or Space, **Then** the same navigation occurs as a mouse click
4. **Given** Winter 2026 card is displayed, **When** page renders on mobile (< 640px), **Then** card is full-width and positioned at the top of the season cards stack

---

### User Story 2 — Browse Past Season Data (Summer 2025/26) (Priority: P1)

Visitor clicks the past season (Summer 2025/26) card to view historical team roster, ladder, and results from the completed season pulled from PlayHQ.

**Why this priority**: Historical data is equally important for retrospective viewing; same navigation framework as current season ensures consistency.

**Independent Test**: Load `/seasons`, click the Summer 2025/26 card, confirm navigation to the Teams page with Summer 2025/26 season context.

**Acceptance Scenarios**:

1. **Given** the Seasons page loads, **When** the page renders, **Then** Summer 2025/26 card is visible with status badge displaying "Complete"
2. **Given** Summer 2025/26 card is displayed, **When** visitor clicks it, **Then** visitor navigates to the Teams page showing Summer 2025/26 season data from PlayHQ
3. **Given** Summer 2025/26 card is displayed, **When** visitor clicks it, **Then** the browser opens the PlayHQ public season page in a new tab (`target="_blank" rel="noopener noreferrer"`)

---

### User Story 3 — Identify Upcoming Season (Summer 2026/27) (Priority: P1)

Visitor sees the upcoming season card (Summer 2026/27) as visually disabled and faded, understanding registration is not yet open; card is not clickable.

**Why this priority**: Clear visual distinction prevents user confusion and sets expectations before registration opens.

**Independent Test**: Load `/seasons`, confirm Summer 2026/27 card is visually faded and does not navigate when clicked.

**Acceptance Scenarios**:

1. **Given** the Seasons page loads, **When** the page renders, **Then** Summer 2026/27 card is visually faded (reduced opacity) and shows status "Registration Coming Soon"
2. **Given** Summer 2026/27 card is displayed in faded state, **When** visitor clicks it, **Then** no navigation occurs and no error is shown
3. **Given** Summer 2026/27 card is displayed, **When** visitor Tabs to it via keyboard, **Then** it is not in the Tab order (tabindex="-1") or is marked aria-disabled="true" and does not respond to Enter/Space

---

### User Story 4 — View Training Information by Venue (Priority: P2)

Visitor views a Training Information section displayed above the season cards, with venue cards for BSE and VCC showing location-specific training details and facility information.

**Why this priority**: Training information is essential for participants post-registration. P2 allows current season data to ship first; Training Information can follow.

**Independent Test**: Load `/seasons`, confirm the Training Information section is visible above the season cards with two venue cards (BSE and VCC) each showing address and facility details.

**Acceptance Scenarios**:

1. **Given** the Seasons page loads, **When** visitor views the page, **Then** Training Information section is visible above the 4 season cards
2. **Given** Training Information section is displayed, **When** page renders, **Then** section displays exactly 2 venue cards: Bendigo South East (BSE) and Victory Catholic College (VCC)
3. **Given** venue cards are displayed, **When** visitor views them, **Then** each card shows location and facility information (at minimum: venue name and address; parking and contact details where available)
4. **Given** venue cards are displayed, **When** a third venue is added to the data source, **Then** the grid accommodates it without layout breakage (up to 4 total supported)

---

### User Story 5 — Archive Placeholder (Priority: P3)

Visitor sees an Archive card as a visually faded placeholder; the card shows "Coming Soon" and is non-interactive.

**Why this priority**: Archive is a future feature; page can launch without it. Placeholder reserves space and communicates intent.

**Independent Test**: Load `/seasons`, confirm Archive card is visually faded, shows "Coming Soon", and does not navigate when clicked.

**Acceptance Scenarios**:

1. **Given** the Seasons page loads, **When** the page renders, **Then** Archive card is visually faded and shows status "Coming Soon"
2. **Given** Archive card is displayed in faded state, **When** visitor clicks it, **Then** no navigation occurs
3. **Given** Archive card is displayed, **When** visitor Tabs to it via keyboard, **Then** it is either excluded from Tab order or marked aria-disabled="true"

---

### Edge Cases

- PlayHQ data for Summer 2025/26 fails to load: Teams page shows a graceful error state ("Season data temporarily unavailable") — this is the responsibility of the Teams page, not the Seasons page.
- Season has no team data in PlayHQ: Teams page shows empty state — handled by Teams page, not Seasons page.
- New season added to data source: Admin adds season entry to the seasons data array; page auto-renders the new card in the correct position.
- Venue card overflow beyond 4 venues: Grid wraps to a new row; layout must not break or clip content.
- User lands on `/seasons` on mobile with slow connection: Training Information section and season cards must render from static data; no API call blocks render.
- Browser back navigation after visiting Teams page: Visitor returns to `/seasons`; page renders normally (no state to restore).
- Summer 2025/26 external link blocked by popup blocker: The external PlayHQ link uses a semantic `<a target="_blank">` anchor — not `window.open()`. Native anchor links are not subject to popup blockers; no JS fallback is needed.

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST render Training Information section above the season cards when at least one venue is configured (P2)
- **FR-002**: System MUST display exactly 4 season cards in fixed order: Winter 2026 (current), Summer 2025/26 (past), Summer 2026/27 (upcoming), Archive
- **FR-003**: System MUST display a status badge on each season card with the following text: Winter 2026 → "Grading"; Summer 2025/26 → "Complete"; Summer 2026/27 → "Registration Coming Soon"; Archive → "Coming Soon"
- **FR-004**: System MUST apply colour-coded styling to status badges using the existing design system tokens (see Key Entities — Status Badge Colour Mapping)
- **FR-005**: System MUST enable click and keyboard navigation on Winter 2026 and Summer 2025/26 cards. Winter 2026 navigates internally to `/teams`. Summer 2025/26 opens the PlayHQ public season page (`https://www.playhq.com/basketball-victoria/org/bendigo-basketball-association/domestic-competition-summer-202526/0bf74768`) in a new tab (`target="_blank" rel="noopener noreferrer"`).
- **FR-006**: System MUST disable click interaction on Summer 2026/27 (upcoming) and Archive cards; those cards MUST apply visual fading (`opacity-50` or equivalent) and a `not-allowed` cursor
- **FR-007**: System MUST render Training Information section with one venue card per configured venue; each card MUST display: venue name, address, and training schedule (day, time slots, and age groups) (P2)
- **FR-008**: System MUST support up to 4 venue cards in the Training Information section without layout breakage; venue data is maintained in a static data file (P2)
- **FR-009**: System MUST pass season context to the Teams page in a way the Teams page can consume to filter or display the correct season's data (implementation detail: URL query param `?season=winter-2026` or path-based — to be resolved during dev planning, consistent with Teams page expectations)
- **FR-010**: System MUST preserve the existing Grading Information section and Slam Dunk Financial Assistance callout from `seasons.astro` (per COA-24 preservation requirement); these sections MUST NOT be removed during this redesign
- **FR-011**: System MUST render all 4 season cards and the Training Information section from static data; no API call MUST block First Contentful Paint

### Non-Functional Requirements

**Accessibility (WCAG 2.1 AA)**

- **NFR-001**: Clickable season cards (Winter 2026, Summer 2025/26) MUST be keyboard accessible — Tab to focus, Enter or Space to navigate, visible focus ring using `focus-visible` styles
- **NFR-002**: Disabled cards (Summer 2026/27, Archive) MUST communicate their non-interactive state without relying on colour alone — use `aria-disabled="true"` and cursor styling; they MUST be excluded from the Tab order (`tabindex="-1"`) or clearly non-interactive if left in the order
- **NFR-003**: All season cards MUST have a descriptive `aria-label` — for example: "Winter 2026, currently Grading, view Teams page" and "Summer 2026/27, Registration Coming Soon, not yet available"
- **NFR-004**: Venue cards in Training Information MUST use semantic heading hierarchy (`<h3>` within the Training Information `<section>`, which itself is within the page `<h1>`)
- **NFR-005**: All interactive elements (clickable cards) MUST have a minimum touch target size of 44x44px on mobile
- **NFR-006**: Text contrast for status badge text against badge background MUST meet WCAG AA minimum (4.5:1 for normal text under 18pt)

**Responsive Design**

- **NFR-007**: Page MUST use mobile-first layout; season cards MUST stack in a single column on mobile (< 640px), 2 columns on tablet (640px–1024px), and 4 columns on desktop (> 1024px)
- **NFR-008**: Training Information section MUST display venue cards in a responsive grid: 1 column mobile, 2 columns tablet and above
- **NFR-009**: Training Information section MUST appear above season cards at all breakpoints — no reordering on desktop

**AppShell / Layout**

- **NFR-010**: Page MUST render inside `BaseLayout.astro` — no custom navigation shell
- **NFR-011**: No inline layout or navigation element MUST be introduced that conflicts with the existing `Navbar.astro` or `Footer.astro` structure

**Error Handling**

- **NFR-012**: If venue data is missing or the venue array is empty, the Training Information section MUST NOT render — no empty section or broken layout
- **NFR-013**: If an unexpected season card configuration is encountered (e.g., unknown status value), the card MUST render with a safe default state (faded, non-interactive) rather than throw a runtime error

**Performance**

- **NFR-014**: Page initial render MUST complete from static data — no blocking API call; PlayHQ integration for Teams page is the Teams page's responsibility
- **NFR-015**: Season card images or icons (if used) MUST use `loading="lazy"` and appropriate sizing
- **NFR-016**: Venue card map links (when `mapUrl` is present) MUST open in a new tab using `target="_blank" rel="noopener noreferrer"` — consistent with the external link pattern used for the Summer 2025/26 season card (P2)

---

### Key Entities

**Season Card**

Represents a navigable or placeholder entry in the seasons grid. Extends the existing `Season` type from `src/lib/seasons/types.ts` with display-only fields for this page.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier matching the existing Season type (e.g., `"winter-2026"`) |
| `name` | `string` | Human-readable name (e.g., `"Winter 2026"`) |
| `status` | `SeasonStatus` | Existing enum: `'active'` \| `'coming_soon'` \| `'completed'` |
| `role` | `SeasonRole` | Existing enum: `'current'` \| `'next'` \| `'previous'` \| `'archive'` |
| `clickable` | `boolean` | Whether the card navigates on click; false for upcoming and archive |
| `teamsPagePath` | `string \| null` | Path or query string to pass to Teams page; null for non-clickable cards |

Concrete instances for this feature:

| Season | id | status | role | clickable | navigationTarget | statusBadgeLabel |
|---|---|---|---|---|---|---|
| Winter 2026 | `winter-2026` | `active` | `current` | `true` | Internal: `/teams` | "Grading" |
| Summer 2025/26 | `summer-2025-26` | `completed` | `previous` | `true` | External (new tab): `https://www.playhq.com/basketball-victoria/org/bendigo-basketball-association/domestic-competition-summer-202526/0bf74768` | "Complete" |
| Summer 2026/27 | `summer-2026-27` | `coming_soon` | `next` | `false` | None | "Registration Coming Soon" |
| Archive | `archive` | `coming_soon` | `archive` | `false` | None | "Coming Soon" |

Note: The `statusBadgeLabel` displayed on screen (e.g., "Grading") is distinct from the `status` enum value (e.g., `"active"`). The mapping is maintained in the page or a utility — the `SeasonStatus` enum is not changed.

**Status Badge Colour Mapping**

Using existing design system tokens from `tailwind.config.mjs`:

| Status / State | Badge Background | Badge Text | Tailwind Classes |
|---|---|---|---|
| Grading (active/current) | `brand-gold` tint | `brand-purple` | `bg-yellow-100 text-brand-purple border border-brand-gold` |
| Complete (completed) | Gray tint | Gray | `bg-gray-100 text-gray-600 border border-gray-300` |
| Registration Coming Soon | Muted purple tint | `brand-purple` at 60% | `bg-purple-50 text-purple-400 border border-purple-200` |
| Coming Soon (archive) | Gray tint | Gray | `bg-gray-100 text-gray-400 border border-gray-200` |

Note: The existing `SeasonTile.astro` uses generic Tailwind blue tokens (`bg-blue-100`, `text-blue-800`) which do not align with the Phoenix brand palette. This feature introduces brand-aligned badge colours. The `SeasonTile` component should be updated or a new variant used to apply these tokens.

**Venue**

Represents a training location displayed in the Training Information section. Maintained in a static data file (location TBD during dev planning, consistent with `src/data/` pattern).

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Unique identifier (e.g., `"bse"`, `"vcc"`) |
| `name` | `string` | Yes | Full venue name |
| `shortCode` | `string` | Yes | Abbreviated label (e.g., `"BSE"`, `"VCC"`) |
| `address` | `string` | Yes | Full street address — **TBD: must be provided before P2 dev begins** |
| `suburb` | `string` | Yes | Suburb name for display (e.g., `"Bendigo South East"`) |
| `parking` | `string \| null` | No | Parking notes (e.g., `"Free parking on Sternberg Street"`) |
| `contact` | `string \| null` | No | Contact name or phone for venue queries |
| `mapUrl` | `string \| null` | No | Google Maps URL for the address |
| `trainingSchedule` | `TrainingSession[]` | Yes | Structured list of training sessions (day, timeSlots with time and ageGroups) |

Note: Training schedule information (day, time slots, age groups) MUST be displayed in each venue card. This replaces the Key Dates section currently on the seasons page.

Known venues:

| Venue | id | shortCode | address | mapUrl | Training Schedule |
|---|---|---|---|---|---|
| Bendigo South East College | `bse` | `BSE` | 56 Ellis St, Flora Hill VIC 3550 (Enter via Keck St) | https://maps.app.goo.gl/FCia6GfDHqZwHWq6A | Sunday: 4–5pm (U10 Girls, U14 & U16 Girls), 5–7pm (U16 & U18 Boys) |
| Victory Christian College | `vcc` | `VCC` | 6 Kairn Rd, Strathdale VIC 3550 | https://maps.app.goo.gl/y1g1ByEkq3HA3AAF7 | Wednesday: 6–7pm (U10 Boys & Girls), 7–8pm (U12 Boys) |

**Teams Page Context**

The Teams page (`/teams`) must accept a season parameter to filter or display the correct season's data. The mechanism (URL query param `?season=winter-2026` or path-based `/teams/winter-2026`) must be agreed between this feature and the Teams page implementation. This is an open question to resolve during dev planning (see Open Questions).

The PlayHQ season ID for Summer 2025/26 required by the Teams page integration is also a TBD:

| Season | PlayHQ Season ID |
|---|---|
| Winter 2026 | TBD — to be retrieved from PlayHQ admin |
| Summer 2025/26 | **TBD — must be confirmed before clickable navigation can be wired** |

---

## Success Criteria

- **SC-001**: Training Information section is visible and readable on all screen sizes (desktop, tablet, mobile) with venue name and address legible at minimum 12px on mobile (P2)
- **SC-002**: Visitor can click Winter 2026 card and arrive at the Teams page with Winter 2026 season data loaded within 2 seconds of navigation on 4G
- **SC-003**: Visitor can click Summer 2025/26 card and the browser initiates navigation to the PlayHQ public season page in a new tab; load time is dependent on the external PlayHQ site and is not a metric we own or enforce
- **SC-004**: Winter 2026 card displays "Grading" status badge with brand-aligned colour styling (gold/purple, not generic blue)
- **SC-005**: Visitor can visually identify Summer 2026/27 and Archive cards as non-interactive (faded, cursor change) without clicking them; clicking produces no navigation or error
- **SC-006**: Page renders completely from static data with no API call blocking First Contentful Paint
- **SC-007**: All 4 season cards and Training Information section render correctly at 320px, 640px, 1024px, and 1440px viewports
- **SC-008**: Both clickable cards pass WCAG 2.1 AA keyboard and contrast audit; disabled cards communicate non-interactive state without colour alone
- **SC-009**: Existing Grading Information and Slam Dunk Financial Assistance sections remain present on the page and are not removed by this implementation

---

## Acceptance Criteria

1. **Given** the Seasons page loads, **When** I view the page, **Then** 4 season cards are visible in this order: Winter 2026, Summer 2025/26, Summer 2026/27, Archive
2. **Given** I view the Winter 2026 card, **When** the page renders, **Then** the status badge reads "Grading" with brand-aligned gold/purple styling
3. **Given** I click the Winter 2026 card, **When** navigation triggers, **Then** the browser navigates to the Teams page with Winter 2026 season context
4. **Given** I click the Summer 2025/26 card, **When** navigation triggers, **Then** the browser opens the PlayHQ public season page (`https://www.playhq.com/basketball-victoria/org/bendigo-basketball-association/domestic-competition-summer-202526/0bf74768`) in a new tab
4a. **Given** I inspect the Summer 2025/26 card anchor element, **When** the page is rendered, **Then** the anchor has `target="_blank"` and `rel="noopener noreferrer"` attributes
5. **Given** I view the Summer 2026/27 card, **When** the page renders, **Then** the card is visually faded and the status badge reads "Registration Coming Soon"
6. **Given** I click the Summer 2026/27 card, **When** the click fires, **Then** no navigation occurs
7. **Given** I Tab to the Summer 2026/27 card using keyboard only, **When** I press Enter or Space, **Then** no navigation occurs and no error is produced
8. **Given** the page loads (P2 scope), **When** I view the page, **Then** the Training Information section appears above the 4 season cards with BSE and VCC venue cards each showing a name and address
9. **Given** I view the page on mobile (< 640px), **When** the page renders, **Then** season cards stack in a single column and Training Information venue cards stack vertically
10. **Given** I view the page on desktop (> 1024px), **When** the page renders, **Then** 4 season cards display in a horizontal row and Training Information shows 2 venue cards side by side
11. **Given** the page renders, **When** I inspect the HTML, **Then** `BaseLayout.astro` wraps all content and no custom navigation shell is present
12. **Given** I Tab through the clickable season cards, **When** I press Enter, **Then** navigation occurs; when I press Escape, **Then** no unexpected modal or overlay appears (COA-24 modal is not active in this redesign)
13. **Given** I view the page, **When** I scroll to the bottom, **Then** the Grading Information section (when active) and Slam Dunk Financial Assistance callout are still present

---

## Open Questions

These items must be resolved before implementation of the relevant stories begins.

| # | Question | Priority | Blocking |
|---|---|---|---|
| OQ-001 | ~~What are the full addresses (and any parking/contact details) for BSE and VCC training venues?~~ **RESOLVED** — BSE: 56 Ellis St Flora Hill (enter via Keck St); VCC: 6 Kairn Rd Strathdale. Training schedules confirmed. | P2 | ~~Blocks Training Information section~~ Resolved |
| OQ-002 | ~~What is the PlayHQ season ID for Summer 2025/26?~~ **RESOLVED** — `0bf74768-492e-4f43-adcf-c863f59c9422`. MVP approach: Summer 2025/26 card links externally to PlayHQ public page (`https://www.playhq.com/basketball-victoria/org/bendigo-basketball-association/domestic-competition-summer-202526/0bf74768`) opening in a new tab. | P1 | Resolved |
| OQ-003 | ~~What is the PlayHQ season ID for Winter 2026?~~ **RESOLVED** — `b3efb4fc-f645-4b5a-a777-50cc99464849`. Winter 2026 card navigates internally to `/teams`. | P1 | Resolved |
| OQ-004 | ~~How does the Teams page accept a season parameter?~~ **RESOLVED** — MVP navigation model confirmed: Winter 2026 → internal `/teams`; Summer 2025/26 → external PlayHQ link (new tab); Summer 2026/27 → non-clickable; Archive → non-clickable. No season param support required on Teams page for this feature. Note: PlayHQ public page does not support URL-based club filtering — a Phoenix-only filter cannot be applied via link. | P1 | Resolved |
| OQ-005 | ~~Should `SeasonTile.astro` be updated or a new variant introduced?~~ **RESOLVED** — Update `SeasonTile.astro` in place. The blue tokens are incorrect and should be replaced with brand tokens directly. **Implementation note**: Before changing, grep the codebase for all usages of `SeasonTile.astro` to confirm no other page relies on the existing blue styling. | P1 | Resolved |

---

## Constitutional Compliance

**Principle I (User Outcomes First)**
PASS. All user stories have explicit, measurable outcomes (navigation to Teams page, visual recognition of disabled state, venue information display). Success criteria are observable without instrumentation.

**Principle II (Test-First Discipline)**
PASS. All acceptance criteria are in Given/When/Then format and are independently testable with static data before PlayHQ integration. P1 stories (season cards, navigation) are fully testable before P2 (Training Information) begins.

**Principle III (Backend Authority and Invariants)**
PASS. Season data (role, status, clickability) is determined by the static data configuration — the client does not infer season role from dates. PlayHQ season IDs are supplied as configuration values, not derived client-side. The Teams page is responsible for fetching and displaying PlayHQ data once navigated to; the Seasons page has no API calls.

**Principle IV (Error Semantics and Observability)**
PASS. NFR-012 and NFR-013 define explicit degradation behaviour for missing venue data and unknown season states. Navigation failures (Teams page unavailable) are handled by the Teams page, which has its own error handling spec. No silent failures permitted.

**Principle V (AppShell Integrity)**
PASS. NFR-010 explicitly requires `BaseLayout.astro`. No custom nav shell is introduced. The existing Grading Information and Slam Dunk sections are explicitly preserved (FR-010, AC-13).

**Principle VI (Accessibility First)**
PASS. NFR-001 through NFR-006 cover keyboard navigation on clickable cards, aria-disabled and tabindex handling on non-interactive cards, descriptive aria-labels, semantic heading hierarchy for venue cards, 44x44px touch targets, and WCAG AA contrast for badge text. Disabled state is communicated without colour alone (NFR-002).

WARN: The existing `SeasonTile.astro` uses `focus:ring-blue-500` which is not a brand token. This feature should align the focus ring colour with brand-purple or brand-gold during implementation. Not a blocking issue but should be addressed in OQ-005.

**Principle VII (Immutable Data Flow)**
PASS. Data flows unidirectionally: static data file → Astro build → rendered HTML. Client-side JS handles only click/keyboard navigation events. No client-side season role inference or data mutation occurs.

**Principle VIII (Dependency Hygiene)**
PASS. No new third-party dependencies are introduced. Feature uses existing Astro, Tailwind, and BaseLayout patterns.

**Principle IX (Cross-Feature Consistency)**
PASS. Feature reuses `SeasonTile.astro`, `BaseLayout.astro`, and the `src/lib/seasons/` types established in COA-24. Venue data follows the same static data file pattern used in `src/data/teams/`. Season card grid uses the same responsive column breakpoints as the Teams listing page.

WARN: The COA-24 `seasons.astro` page includes a `SeasonDetailModal` and client-side modal management script. COA-45 replaces the modal interaction with outbound navigation. The spec explicitly notes this (Summary section), but the implementation must ensure the modal code is removed or bypassed — not left as dead code. This should be addressed as a task during implementation.

**Summary**

| Result | Count | Notes |
|---|---|---|
| PASS | 9 | All core principles pass |
| WARN | 2 | Focus ring colour token (Principle VI); modal dead code cleanup (Principle IX) |
| FAIL | 0 | None |
| OPEN | 5 | OQ-001 through OQ-005 — must be resolved before respective stories begin |
