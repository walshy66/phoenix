# Feature Specification: Scores Page – This Week's Games

**Feature Branch**: `cameronwalsh/coa-52-scores-page`
**Created**: 2026-04-13
**Status**: Specifying
**Input**: User description: "Need to use the API to pull in the information for each game day. 4 columns Mon|Tuesday|Wednesday|Friday. Games ordered by time, earliest first. Click through to game details. Refresh every Sunday with upcoming week's games. Title: 'This Week's Games'."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 – View This Week's Games at a Glance (Priority: P1)

A visitor lands on the Scores page and immediately sees all games for the upcoming week organised by day (Mon–Fri), with the earliest games appearing first within each day column. This is the primary use case: quick orientation to when their team plays.

**Why this priority**: Essential for site visitors to know when games are happening; core value of the page.

**Independent Test**: Can be fully tested by loading the page and verifying the 4-column grid displays correctly with games in chronological order. Delivers immediate visibility of the week's schedule.

**Acceptance Scenarios**:

1. **Given** it is Sunday–Friday and the page loads, **When** the page renders, **Then** a grid with 4 columns (Monday, Tuesday, Wednesday, Friday) is visible with correct day labels.
2. **Given** multiple games occur on the same day, **When** displayed in that day's column, **Then** games are ordered by kickoff time (earliest first).
3. **Given** no games are scheduled for a particular day, **When** that day's column renders, **Then** an empty state message (e.g., "No games scheduled") is shown.
4. **Given** the page is visited on Sunday, **When** it loads, **Then** it displays the upcoming week's games (Mon–Fri of the following week).

---

### User Story 2 – Click Through to Game Details (Priority: P1)

A visitor clicks on a game tile and is taken to detailed information about that match (venue, teams, squad details, etc.), mirroring the experience available in PlayHQ.

**Why this priority**: Without drill-down to details, the page is surface-level; users need full context (lineups, venue, time confirmation).

**Independent Test**: Can be fully tested by clicking a game tile and verifying the detail view or modal/link loads with expected PlayHQ data (team names, kickoff time, venue, squad info). Independently testable from the grid layout.

**Acceptance Scenarios**:

1. **Given** a game is displayed on the Scores page, **When** clicked, **Then** either a modal opens or the user navigates to a detail page showing full game information (teams, time, venue, squad details if available).
2. **Given** the user is viewing game details, **When** they close the modal or navigate back, **Then** they return to the Scores page with the week's games still visible.
3. **Given** a game's squad information is marked as hidden in PlayHQ, **When** the user views details, **Then** hidden player information is not exposed (per PlayHQ privacy rules).

---

### User Story 3 – Automatic Weekly Refresh (Priority: P2)

Every Sunday, the page content automatically fetches and displays the next week's games without requiring manual intervention. This ensures the page is always current.

**Why this priority**: Automation reduces administrative burden and keeps the page fresh; important for ongoing usability but can be delivered as a scheduled task separate from the UI.

**Independent Test**: Can be tested by checking that the data fetch is triggered on Sunday (or on-demand refresh is available) and that the grid updates with the correct week's games. Does not block the core grid/click-through features.

**Acceptance Scenarios**:

1. **Given** the page is accessed on a Sunday, **When** the page loads or shortly thereafter, **Then** a fresh API call is made to retrieve the next week's fixtures.
2. **Given** new game data is fetched, **When** the grid updates, **Then** all games for the upcoming week (Mon–Fri) are reflected accurately.
3. **Given** the refresh occurs, **When** the page updates, **Then** there is no visible flicker or loss of user context (smooth update or brief loading indicator).

---

### User Story 4 – Responsive Grid Layout (Priority: P2)

The 4-column grid adapts gracefully on smaller screens (tablet, mobile), ensuring the Scores page remains readable and usable across devices.

**Why this priority**: Accessibility/responsiveness is important for secondary interactions; core functionality (viewing this week's games) works on all devices, but layout may shift to stacked columns or scrollable grid on mobile.

**Independent Test**: Can be fully tested by viewing the page on mobile, tablet, and desktop and confirming the grid is readable and game information is accessible without horizontal scrolling (or with natural scrolling for a dense grid).

**Acceptance Scenarios**:

1. **Given** the page is viewed on a mobile device, **When** it renders, **Then** the grid either stacks to 1–2 columns or remains a 4-column scrollable grid (design decision) while maintaining readability.
2. **Given** a game tile is displayed on a small screen, **When** the user taps it, **Then** the detail view opens and is appropriately sized for the screen.

---

### Edge Cases

* What happens if the PlayHQ API is unreachable? → Display an error message ("Unable to load games at this time. Please try again later.") and optionally show cached data from the last successful fetch.
* What if a game's kickoff time is invalid or missing? → Display the time as "TBA" and order such games after those with confirmed times.
* What if today is Saturday or Sunday? → The page always displays Mon–Fri of the next week (not the current partial week).
* What if there are more than 10 games on a single day? → The day column scrolls vertically, or games are shown in a paginated view within that column.

---

## Requirements *(mandatory)*

### Functional Requirements

* **FR-001**: System MUST fetch the current week's fixtures from the PlayHQ API using the organisation ID and season ID.
* **FR-002**: System MUST display fixtures in a 4-column grid layout with headers for Monday, Tuesday, Wednesday, and Friday.
* **FR-003**: Games within each day column MUST be ordered by kickoff time in ascending order (earliest first).
* **FR-004**: System MUST display an empty state message for any day with no scheduled games.
* **FR-005**: Each game tile MUST show game title/summary (e.g., "U10 Boys vs Opponent" or "Grade division").
* **FR-006**: Each game tile MUST be clickable and link to or open full game details from PlayHQ (including teams, time, venue, squad).
* **FR-007**: System MUST NOT expose player or staff information marked as hidden in PlayHQ.
* **FR-008**: Page title MUST read "This Week's Games".
* **FR-009**: System MUST refresh game data every Sunday (automatic or on-demand) to pull the next week's fixtures.
* **FR-010**: System MUST handle API errors gracefully (e.g., network failure, invalid credentials) and display user-friendly error messages.

### Key Entities

* **Game/Fixture**: Represents a single scheduled match. Attributes: `gameId` (PlayHQ ID), `homeTeam`, `awayTeam`, `kickoffTime`, `venue`, `grade`, `division`, `day`, `squads` (with hidden flag).
* **Week**: Represents the Monday–Friday window for which games are displayed. Attributes: `startDate` (Monday), `endDate` (Friday).
* **API Response**: Data structure from PlayHQ containing fixture list for a given season/grade; includes game IDs, team details, times, venues.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

* **SC-001**: Scores page loads and displays the 4-column grid within 2 seconds on a standard connection.
* **SC-002**: 100% of non-hidden game fixtures are displayed correctly on the Scores page for the current week.
* **SC-003**: Users can click through from any game tile to its full details without errors.
* **SC-004**: Responsive design: page is readable and functional on mobile (320px), tablet (768px), and desktop (1024px+).
* **SC-005**: Page title displays as "This Week's Games" and matches the site's design and branding.
* **SC-006**: API errors are caught and communicated to users within 5 seconds with a clear message.
* **SC-007**: Data refresh on Sunday completes without manual intervention and updates the page within 5 minutes of Sunday 00:00 AEST.

---

## Technical Notes

* **API Integration**: Use PlayHQ public API (x-api-key: `4a1e6a01-32f3-477d-9c08-4d9ec6b50148`, organisation ID: `90c7fb8e-b434-42ea-9af5-625235ca11e7`). Endpoints: Seasons → Teams → Grades → Fixtures.
* **Data Caching**: Consider caching fixture data to reduce API calls and improve performance; refresh cache on Sundays.
* **Week Definition**: Always filter fixtures for Mon–Fri of the current or next week (not Thu–Sat, not Sun).
* **Accessibility**: Ensure game tiles are keyboard-navigable; use semantic HTML and ARIA labels where appropriate.
* **Brand Alignment**: Use Bendigo Phoenix brand colours (Primary Purple `#573F93`, Vegas Gold `#8B7536`, Black `#111111`, Off-White `#F4F5F7`).
* **Handover**: Document the PlayHQ API credentials, data fetch schedule, and error handling in the README for the next maintainer."
