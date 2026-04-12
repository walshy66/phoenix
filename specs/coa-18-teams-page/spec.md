# Spec: coa-18-teams-page

**Status**: READY_FOR_DEV
**Source**: COA-18
**Priority**: P1 (core page; Teams section does not exist yet)
**Primary Route**: `/teams` (Astro page at `src/pages/teams.astro`)
**Detail Route**: `/teams/[slug]` (Astro dynamic page at `src/pages/teams/[slug].astro`)

---

## Summary

This feature builds the Teams section for the Bendigo Phoenix Basketball Club website. It consists of two surfaces:

1. **Teams listing page** (`/teams`) — displays all club teams (up to 21) organised by age group, with info pills on each tile for Division, Game night, and Boys/Girls. A sticky filter bar lets users narrow teams by category.

2. **Team detail page** (`/teams/[slug]`) — shows full information for a specific team, including fixture, ladder, and training schedule. Fixture and ladder data is sourced from PlayHQ via a data-file pattern (consistent with how `scores.astro` already works: a script writes JSON files that the Astro pages read at build/request time). Training schedule and coaching staff are maintained manually in a static data file.

The first priority milestone (P1) is a fully functional Teams listing page backed by placeholder data. The second milestone (P2) wires up real PlayHQ data and builds the team detail pages. A P3 milestone adds the game detail modal.

---

## User Scenarios & Testing

### User Story 1 — Browse Teams by Age Group (Priority: P1)

A visitor lands on the Teams page and sees teams organised by age group (u10s, u12s, u14s, u16s, u18s) in that top-to-bottom order. Teams within each age group are listed alphabetically. This is the foundational structure of the page.

**Why this priority**: This is the entry point to the Teams section. Without this, the page has no purpose. It delivers the primary value of team discovery.

**Independent Test**: View the Teams page with placeholder data; all teams are correctly segmented by age group and sorted alphabetically within each group.

**Acceptance Scenarios**:

1. **Given** the Teams page loads, **When** I view the page, **Then** I see age group headers in this order: u10s, u12s, u14s, u16s, u18s
2. **Given** I view an age group section, **When** I examine the team tiles, **Then** teams within that section are sorted alphabetically by name
3. **Given** no filter is active, **When** I scroll through all sections, **Then** I see tiles for all teams with consistent styling across age groups
4. **Given** the Teams page is accessed on mobile (< 640px), **When** the page renders, **Then** tiles stack in a single column and age group headers remain readable

---

### User Story 2 — View Team Information Pills (Priority: P1)

Each team tile displays three key information pills: Division, Game night, and Boys/Girls. These give immediate context about the team without clicking through.

**Why this priority**: Coaches and parents scan for their team's division, game night, and gender at a glance. Without pills, every tile looks the same.

**Independent Test**: Each team tile displays all three pills with accurate placeholder data; pills are visually distinct from the tile background.

**Acceptance Scenarios**:

1. **Given** a team tile is rendered, **When** I view it, **Then** I see three pills: Division, Game night, and Boys/Girls
2. **Given** I view a boys' team tile, **When** I check the Boys/Girls pill, **Then** it displays "Boys"
3. **Given** I view a girls' team tile, **When** I check the Boys/Girls pill, **Then** it displays "Girls"
4. **Given** I view a team tile, **When** I check the Division pill, **Then** it shows the team's division label (e.g., "DIV 2")
5. **Given** a team plays on Tuesday, **When** I check the Game night pill, **Then** it shows "Tuesday"
6. **Given** a pill value is not yet available, **When** the tile renders, **Then** the pill shows "TBC" rather than being hidden or blank

---

### User Story 3 — Filter Teams by Category (Priority: P1)

Coaches and parents can filter teams using a sticky filter bar: All, Boys, Girls, Age group (with sub-selection), Game Day (with sub-selection), Grade (with sub-selection). Filters dynamically show or hide teams without a page reload.

**Why this priority**: Without filtering, finding a specific team among 21 tiles is tedious. This is core navigation.

**Independent Test**: Click "Boys" and verify only boys' teams are visible; click "All" and verify all teams return.

**Acceptance Scenarios**:

1. **Given** the Teams page loads, **When** I click "Boys", **Then** only boys' teams display; all girls' teams are hidden
2. **Given** teams are filtered by Boys, **When** I click "Girls", **Then** only girls' teams display
3. **Given** teams are filtered, **When** I click "All", **Then** all teams reappear with age group structure preserved
4. **Given** I select "Age group" filter and choose "u14s", **When** the filter applies, **Then** only u14s teams display across all divisions
5. **Given** I select "Game Day" and choose "Tuesday", **When** the filter applies, **Then** only teams with Game night = Tuesday display
6. **Given** I select "Grade" and choose a specific grade, **When** the filter applies, **Then** only teams in that grade display
7. **Given** a filter is active and produces no matching teams, **When** the view updates, **Then** I see a "No teams match this filter" message rather than a blank page
8. **Given** I am using keyboard navigation, **When** I Tab to the filter bar and press Enter on a filter button, **Then** the filter activates and focus remains in the filter bar

---

### User Story 4 — Navigate to Team Detail Page (Priority: P1)

Clicking a team tile navigates the user to that team's detail page.

**Why this priority**: This is the critical link between discovery and engagement. Without navigation, tiles are purely decorative.

**Independent Test**: Click any team tile and arrive at its dedicated detail page; the URL changes and the team name matches the tile clicked.

**Acceptance Scenarios**:

1. **Given** I view the Teams page, **When** I click a team tile, **Then** the browser navigates to `/teams/[team-slug]`
2. **Given** I arrive at a team detail page, **When** the page loads, **Then** the team name displayed matches the tile I clicked
3. **Given** I navigate back from a detail page to the Teams listing, **When** I return, **Then** any previously active filter is still applied
4. **Given** I use keyboard navigation, **When** I Tab to a team tile and press Enter, **Then** the same navigation occurs as a mouse click

---

### User Story 5 — View Team Fixture and Ladder (Priority: P2)

On each team's detail page, I can see the team's upcoming and completed games (fixture) and current league standings (ladder) for the active season.

**Why this priority**: High-value operational information. Deferred to P2 because it requires PlayHQ data files to be generated; the listing page (P1) works with placeholder data.

**Independent Test**: Navigate to a team detail page and see a Fixture section with at least one game row and a Ladder section with at least one standings row.

**Acceptance Scenarios**:

1. **Given** I am on a team detail page, **When** I view the Fixture section, **Then** I see upcoming games with date, time, opponent, and venue
2. **Given** a game has been completed, **When** I view it in the Fixture, **Then** the row shows the final score
3. **Given** I am on a team detail page, **When** I view the Ladder section, **Then** I see the team's position, wins, losses, draws, and points
4. **Given** no games are scheduled, **When** I view the Fixture section, **Then** I see a "No games scheduled" placeholder message
5. **Given** no ladder data is available, **When** I view the Ladder section, **Then** I see a "Ladder not yet available" placeholder message

---

### User Story 6 — View Coach and Manager Information (Priority: P2)

Each team detail page shows the coach name and team manager name. No contact details (email, phone) are shown. This data is manually maintained in a static data file — it is not sourced from the PlayHQ API.

**Why this priority**: Important for communication context. Deferred to P2 alongside other detail page content. Manually maintained because the PlayHQ public API does not expose a dedicated staff endpoint.

**Independent Test**: Navigate to a team detail page and see coach and manager names displayed without any contact details.

**Acceptance Scenarios**:

1. **Given** I view a team detail page, **When** I look for staff info, **Then** I see "Coach: [Name]" with no phone or email visible
2. **Given** a team has a manager, **When** I view the detail page, **Then** I see "Manager: [Name]"
3. **Given** a team has no coach or manager entered in the data file, **When** I view the detail page, **Then** the staff section is not rendered (not shown as blank)

---

### User Story 7 — View Training Schedule (Priority: P2)

Each team detail page displays training venue, day, and time so parents know where and when their child trains. This data is manually maintained in a static data file — it is not available from the PlayHQ API.

**Why this priority**: Important operational info. Deferred to P2 alongside other detail page content.

**Independent Test**: Navigate to a team detail page and see training information displayed as venue, day, and time.

**Acceptance Scenarios**:

1. **Given** I view a team detail page, **When** I look at the Training section, **Then** I see "Training: [Venue] · [Day] @ [Time]"
2. **Given** a team has no training entry in the data file, **When** I view the detail page, **Then** I see "No training scheduled" rather than blank space

---

### User Story 8 — Game Detail Modal (Priority: P3)

Clicking on a game in the fixture opens a modal with full game details.

**Why this priority**: Nice-to-have enhancement. Not required for initial launch.

**Independent Test**: Click a game row; a modal opens with game details. Press Escape or click outside; the modal closes.

**Acceptance Scenarios**:

1. **Given** I view a fixture, **When** I click a game row, **Then** a modal opens showing opponent, time, venue, and home/away status
2. **Given** a game has been played, **When** I view the modal, **Then** the final score is visible
3. **Given** the modal is open, **When** I press Escape or click outside the modal, **Then** the modal closes and focus returns to the game row I clicked
4. **Given** I am on mobile, **When** the modal opens, **Then** it occupies the full viewport height and is scrollable

---

## Edge Cases

- Team has no games scheduled yet — show "No games scheduled" placeholder in Fixture section
- PlayHQ data file is missing or stale — show skeleton placeholder state; do not show raw error messages to the user
- A coach or manager name is very long — truncate with ellipsis; full name accessible on hover (desktop) or within detail page (mobile)
- Filter produces zero results — show "No teams match this filter" messaging with a "Clear filter" action
- Future growth beyond 21 teams — filtering and layout must scale without hardcoded counts; no logic may assume exactly 21 teams
- Team slug collision — if two teams produce the same slug, the generation logic must append a disambiguator (e.g., team ID suffix)
- Age group is not one of the five known groups — team is placed in an "Other" section at the bottom rather than dropped silently

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST display all teams organised by age group in this order: u10s, u12s, u14s, u16s, u18s
- **FR-002**: System MUST sort teams alphabetically within each age group
- **FR-003**: System MUST display each team tile with three information pills: Division, Game night, Boys/Girls
- **FR-004**: Pills with unknown values MUST display "TBC" rather than rendering blank or being omitted
- **FR-005**: System MUST provide a filter bar with options: All, Boys, Girls, Age group, Game Day, Grade
- **FR-006**: System MUST show/hide team tiles dynamically based on the active filter without a page reload
- **FR-007**: System MUST show a "No teams match this filter" message when a filter produces zero results
- **FR-008**: System MUST allow users to click a team tile to navigate to `/teams/[team-slug]`
- **FR-009**: System MUST preserve active filter state when the user navigates back from a detail page to the listing; filter state MUST be stored in `sessionStorage` under the key `teams-filter` as `{ type, value }`
- **FR-010**: System MUST display fixture data on the team detail page: date, time, opponent, venue, home/away, and result if completed
- **FR-011**: System MUST display ladder data on the team detail page: position, wins, losses, draws, points
- **FR-012**: System MUST display coach and manager names on the team detail page without any contact details; both are sourced from a manually maintained static data file
- **FR-013**: System MUST display training venue, day, and time on the team detail page; sourced from a manually maintained static data file
- **FR-014**: System MUST support a game detail modal (P3) that opens on game row click and closes via Escape key or outside click
- **FR-015**: System MUST source fixture and ladder data from PlayHQ-generated data files using the `/v1/grades/{gradeId}/games` endpoint (consistent with the existing `scripts/scores-data.json` pattern); placeholder data used in P1 until files are generated
- **FR-016**: System MUST derive team metadata (age group, gender, game night, division) by parsing the PlayHQ grade name string (e.g. `"Monday U14 Girls 4"` → ageGroup=u14s, gender=Girls, gameNight=Monday, division=DIV 4)
- **FR-017**: System MUST degrade gracefully when PlayHQ data files are absent or incomplete — show placeholder states, not raw errors

### Non-Functional Requirements

**Accessibility (WCAG 2.1 AA)**

- **NFR-001**: All team tiles MUST be keyboard accessible — Tab to focus, Enter to activate navigation
- **NFR-002**: All filter buttons MUST be keyboard accessible — Tab to focus, Enter/Space to activate
- **NFR-003**: Activated filter state MUST be communicated via `aria-pressed` or equivalent, not colour alone
- **NFR-004**: Game detail modal (P3) MUST trap focus while open; Escape key MUST close it and return focus to the triggering element
- **NFR-005**: All interactive elements MUST have a minimum tap target size of 44x44px
- **NFR-006**: Colour contrast for pill text and backgrounds MUST meet WCAG AA minimum (4.5:1 for normal text)
- **NFR-007**: Age group headings MUST use proper heading hierarchy (e.g., `<h2>` for age groups within the Teams page `<h1>`)

**Responsive Design**

- **NFR-008**: Teams listing page MUST use a mobile-first layout: single-column tiles on < 640px, 2-column on 640px–1024px, 3–4 column on > 1024px
- **NFR-009**: Filter bar MUST be horizontally scrollable on mobile if filter options overflow the viewport width
- **NFR-010**: Team detail page MUST stack all sections vertically on mobile; two-column layout permitted on desktop for fixture + ladder side by side
- **NFR-011**: All tile layouts MUST be consistent with the design pattern established in `SeasonTile.astro` and `ScoreCard.astro`

**AppShell / Layout**

- **NFR-012**: Both `/teams` and `/teams/[slug]` pages MUST render inside `BaseLayout.astro` — no custom navigation shell
- **NFR-013**: Filter bar on the listing page MUST use `sticky top-16` positioning consistent with the existing filter tab pattern in `team.astro`

**Error Handling**

- **NFR-014**: If a PlayHQ data file is missing, pages MUST render with all placeholder states and a user-facing message such as "Team details are temporarily unavailable"
- **NFR-015**: If a specific data field (e.g., game time) is null, the page MUST display "TBC" or "—" rather than blank space or a JavaScript error
- **NFR-016**: All data loading failures MUST log a structured message to the browser console for debugging (field name, page, reason)

**Performance**

- **NFR-017**: Teams listing page initial render MUST complete within 2 seconds with all tiles visible
- **NFR-018**: Filter interactions MUST produce visible feedback within 100ms (client-side filtering, no network request)
- **NFR-019**: Images on team tiles (if any are added) MUST use `loading="lazy"` and be appropriately sized

### Key Entities

- **Team**: Represents a basketball team
  - `id`: Unique identifier (from PlayHQ)
  - `slug`: URL-safe identifier derived from team name (e.g., "phoenix-u14s-gold-boys")
  - `name`: Human-readable team name (e.g., "PHOENIX Roughnuts") — from PlayHQ
  - `gradeName`: Raw PlayHQ grade name (e.g., "Friday U18 Boys 2") — source for derived fields
  - `ageGroup`: Derived from `gradeName` (e.g., "U18" → `u18s`)
  - `division`: Derived from `gradeName` (e.g., "2" → `"DIV 2"`)
  - `gender`: Derived from `gradeName` (`"Boys"` | `"Girls"`)
  - `gameNight`: Derived from `gradeName` (e.g., `"Friday"`)
  - Relations: hasOne `TrainingSchedule`, hasMany `Staff`, hasMany `Games`, hasOne `Ladder`

- **Staff**: A person associated with a team — manually maintained in static data file
  - `name`: Full name
  - `role`: `"coach"` | `"manager"`

- **Game** (Fixture entry):
  - `id`: PlayHQ game ID
  - `opponent`: Opponent team name
  - `date`: ISO 8601 date
  - `time`: Local time string (e.g., "7:00 PM") — display "TBC" if null
  - `venue`: Venue name
  - `homeOrAway`: `"home"` | `"away"`
  - `status`: `"upcoming"` | `"completed"` | `"cancelled"`
  - `homeScore`: integer or null
  - `awayScore`: integer or null

- **Ladder**: League standings entry for a team
  - `position`: integer rank
  - `wins`: integer
  - `losses`: integer
  - `draws`: integer
  - `pointsFor`: integer
  - `pointsAgainst`: integer
  - `points`: integer (total competition points; displayed as "Pts" column in the ladder table)

- **TrainingSchedule**:
  - `venue`: Venue name
  - `day`: Day of week
  - `time`: Local time string

---

## Success Criteria

- **SC-001**: Teams listing page renders all teams within 2 seconds with correct age group segmentation and alphabetical ordering
- **SC-002**: Filter interactions produce visible results within 100ms with no page reload
- **SC-003**: All team tiles display all three pills (Division, Game night, Boys/Girls); "TBC" shown when data is absent
- **SC-004**: Team detail pages render fixture and ladder data sourced from PlayHQ data files
- **SC-005**: Team detail pages display coach and manager names from the manually maintained data file; staff section is absent when no entry exists
- **SC-006**: Game detail modal (P3) opens within 200ms of click; closes via Escape key and outside click
- **SC-007**: Both pages render correctly at 320px, 640px, 1024px, and 1440px viewports
- **SC-008**: Both pages pass WCAG 2.1 AA audit (keyboard navigation, contrast, focus indicators, heading hierarchy)
- **SC-009**: When PlayHQ data files are absent, both pages render gracefully with placeholder states — no unhandled errors
- **SC-010**: Filter state persists when the user navigates back from a detail page to the listing

---

## Acceptance Criteria

1. **Given** the Teams page loads with placeholder data, **When** I view the page, **Then** age group sections appear in u10s → u12s → u14s → u16s → u18s order and teams are alphabetical within each section
2. **Given** I view a team tile, **When** I inspect it, **Then** Division, Game night, and Boys/Girls pills are all visible; any unknown value shows "TBC"
3. **Given** I click "Boys" in the filter bar, **When** the filter applies, **Then** only boys' teams are visible and age group headers for age groups with no matching teams are hidden
4. **Given** no teams match the active filter, **When** the view updates, **Then** a "No teams match this filter" message appears with a "Clear filter" action
5. **Given** I click "All" in the filter bar, **When** the filter applies, **Then** all teams and all age group headers are restored
6. **Given** I click a team tile, **When** I arrive at the detail page, **Then** the URL is `/teams/[slug]` and the displayed team name matches the tile I clicked
7. **Given** I navigate back from a team detail page, **When** I return to the Teams listing, **Then** my previously selected filter is still active
8. **Given** I am on a team detail page, **When** I view the Fixture section, **Then** I see at least one game row with date, opponent, and venue displayed
9. **Given** a game is completed, **When** I view it in the Fixture, **Then** a score is displayed in the format "Home Score – Away Score"
10. **Given** I am on a team detail page, **When** I view staff info, **Then** I see coach and manager names with no email or phone number; staff section is omitted entirely if neither is present in the data file
11. **Given** PlayHQ data files are absent, **When** either page loads, **Then** placeholder states display and a user-facing notice says details are temporarily unavailable — no raw error output is shown
12. **Given** I Tab through the filter bar using keyboard only, **When** I press Enter on "Girls", **Then** the filter activates; the active button communicates its pressed state without relying on colour alone
13. **Given** I am on mobile (< 640px), **When** I view the Teams listing, **Then** tiles are single-column and the filter bar scrolls horizontally without clipping
14. **Given** both pages render, **When** I inspect the HTML, **Then** `<BaseLayout>` wraps all content and no custom navigation shell is present
15. **Given** I apply a filter and some age groups have no matching teams, **When** the view updates, **Then** age group section headers for those groups are hidden alongside their tiles (no orphan headers remain visible)

---

## Constitutional Compliance

- **Principle I (User Outcomes)**: PASS. Each user story has a clear, measurable outcome tied to a real user need (team discovery, team detail lookup). Success criteria are observable.

- **Principle II (Test-First)**: PASS. All acceptance scenarios are in Given/When/Then format and are independently testable. P1 stories are testable with placeholder data before PlayHQ integration.

- **Principle III (Backend Authority)**: PASS. This is a static Astro site. Data authority lives in PlayHQ-generated data files produced by the existing scraper script pattern. The client does not infer or recalculate fields — it reads from data files.

- **Principle IV (Error Semantics)**: PASS. NFR-014 through NFR-016 require graceful degradation with user-facing placeholder messaging and console logging. No raw errors may surface to users.

- **Principle V (AppShell Integrity)**: PASS. NFR-012 explicitly requires both pages to render inside `BaseLayout.astro`. No custom nav shell is permitted.

- **Principle VI (Accessibility First)**: PASS. NFR-001 through NFR-007 cover keyboard navigation, ARIA state for filters, focus management for modal, tap targets, contrast, and heading hierarchy.

- **Principle VII (Immutable Data Flow)**: PASS. Data flows from PlayHQ data files → Astro build → rendered HTML. Client-side JS handles only filter show/hide and modal open/close. No client-side data mutation or inference occurs.

- **Principle IX (Cross-Feature Consistency)**: PASS. Spec references existing patterns explicitly: `BaseLayout.astro`, `ScoreCard.astro`, `SeasonTile.astro`, the `sticky top-16` filter bar from `team.astro`, and the scraper → JSON → page data pattern from `scores.astro`. No new patterns are introduced without justification.

---

## Open Questions

All questions resolved in `specs/coa-18-teams-page/plan.md` (Open Questions — Resolved for Implementation):

1. **Filter state persistence**: Use `sessionStorage` with key `teams-filter` as `{ type, value }`.
2. **Design tokens for pills**: Division = `bg-brand-purple text-white`; Game Night = `bg-brand-gold text-white`; Boys = `bg-gray-700 text-white`; Girls = `bg-purple-200 text-brand-purple`; TBC = `bg-gray-200 text-gray-500`.
3. **Page hero**: Yes — hero section matching `team.astro` / `scores.astro` pattern. Sub-headline: "Bendigo Phoenix Juniors" with gold divider.
4. **Teams data source for P1**: `src/data/teams/teams.json` (committed static import).
5. **Game detail modal scope (P3)**: Pre-populated data from the fixture file — no runtime API call.
6. **Pagination vs scroll**: No pagination in scope; CSS grid scales naturally by count.
