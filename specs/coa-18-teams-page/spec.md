# Feature Specification: Teams Page

**Feature Branch**: `cameronwalsh/coa-18-teams-page`  
**Created**: 2026-04-12  
**Status**: Spec Development  
**Input**: User description: "Teams page with age-group segmentation, team tiles with info pills, filtering, and individual team detail pages with PlayHQ integration"

---

## User Scenarios & Testing (*mandatory)*

### User Story 1 - Browse Teams by Age Group (Priority: P1)

A visitor lands on the Teams page and sees teams organized by age group (u10s, u12s, u14s, u16s, u18s). Teams within each age group are alphabetically ordered. This is the foundational page structure.

**Why this priority**: This is the entry point to the Teams section. Without this, the page has no purpose. It delivers the primary value of team discovery.

**Independent Test**: Can be fully tested by viewing the Teams page with placeholder data; user sees all 21 teams correctly segmented and sorted alphabetically within groups.

**Acceptance Scenarios**:

1. **Given** the Teams page loads, **When** I view the page, **Then** I see age group headers (u10s, u12s, u14s, u16s, u18s) in top-to-bottom order
2. **Given** I view an age group section, **When** I examine the team tiles, **Then** teams are sorted alphabetically by name within that section
3. **Given** the page displays, **When** I scroll through all sections, **Then** I see placeholder team tiles for all 21 teams with consistent styling

---

### User Story 2 - View Team Information Pills (Priority: P1)

Each team tile displays three key information pills: Division, Game night, and Boys/Girls. These pills give immediate context about the team without clicking.

**Why this priority**: This is essential UX—coaches and parents scan for their team's division, game night, and gender at a glance.

**Independent Test**: Each team tile displays all three pills with accurate data; pills are visually distinct and readable.

**Acceptance Scenarios**:

1. **Given** a team tile is rendered, **When** I look at it, **Then** I see three pills labeled "Division," "Game night," and "Boys/Girls"
2. **Given** I view a boys' team tile, **When** I check the Boys/Girls pill, **Then** it displays "Boys"
3. **Given** I view a u14s division team, **When** I look at the Division pill, **Then** it shows the correct division name (e.g., "DIV2")
4. **Given** a team plays on Tuesday night, **When** I check the Game night pill, **Then** it shows "Tuesday"

---

### User Story 3 - Filter Teams by Category (Priority: P1)

Coaches and parents can filter teams using options at the top: All, Age group, Boys, Game Day, Girls, Grade. Filters dynamically show/hide teams.

**Why this priority**: Essential discovery feature. Without filtering, finding your specific team in 21 tiles becomes tedious. This is core navigation.

**Independent Test**: Can filter by a single category (e.g., "Boys") and see only boys' teams displayed; all other teams hidden. Filter resets when "All" is clicked.

**Acceptance Scenarios**:

1. **Given** the Teams page loads, **When** I click "Boys", **Then** only boys' teams display and all girls' teams are hidden
2. **Given** teams are filtered by Boys, **When** I click "Girls", **Then** only girls' teams display
3. **Given** teams are filtered, **When** I click "All", **Then** all 21 teams reappear
4. **Given** I click "Age group", **When** I select "u14s", **Then** only u14s teams display across all divisions
5. **Given** I click "Game Day", **When** I select "Tuesday", **Then** only teams playing Tuesday display
6. **Given** I click "Grade", **When** I select a specific grade, **Then** only teams in that grade display

---

### User Story 4 - Navigate to Team Detail Page (Priority: P1)

Clicking a team tile takes the user to that team's detail page, where full information is available.

**Why this priority**: This is the critical link between discovery and engagement. Without this navigation, tiles are decorative.

**Independent Test**: Click any team tile and navigate to its dedicated detail page with correct team name and data displayed.

**Acceptance Scenarios**:

1. **Given** I view the Teams page, **When** I click a team tile, **Then** I navigate to that team's detail page
2. **Given** I click a team tile, **When** the detail page loads, **Then** the team name matches the tile I clicked
3. **Given** I navigate back from a detail page, **When** I return to Teams, **Then** my filter selections persist

---

### User Story 5 - View Team Fixture & Ladder (Priority: P2)

On each team's detail page, I can see the team's fixture (games) and ladder (standings) for the current season.

**Why this priority**: High value—coaches and parents need this operational info. Deferred slightly because the data comes from PlayHQ API, which requires integration; the team browsing (P1) works with placeholder data.

**Independent Test**: Navigate to a team detail page and see a "Fixture" section and "Ladder" section populated with real PlayHQ data.

**Acceptance Scenarios**:

1. **Given** I'm on a team detail page, **When** I look at the Fixture section, **Then** I see upcoming games with dates, times, opponents, and venues
2. **Given** a game has been played, **When** I view the Fixture, **Then** completed games show results (score)
3. **Given** I'm on a team detail page, **When** I look at the Ladder section, **Then** I see the team's current position, wins, losses, draws
4. **Given** I click on a game in the Fixture, **When** the game detail modal opens, **Then** I see play-by-play or final stats from PlayHQ

---

### User Story 6 - View Coach & Assistant Information (Priority: P2)

Each team detail page shows the coach name and team manager name. If an assistant coach exists, they are listed. No contact details are exposed.

**Why this priority**: Important for communication context but sourced from PlayHQ; deferred to P2 with API integration.

**Independent Test**: Navigate to a team detail page and see coach, manager, and assistant names displayed (if available); no email or phone visible.

**Acceptance Scenarios**:

1. **Given** I view a team detail page, **When** I look for coach info, **Then** I see "Coach: [Name]" (no contact details)
2. **Given** a team has a manager, **When** I view the detail page, **Then** I see "Manager: [Name]"
3. **Given** a team has an assistant coach, **When** I view the detail page, **Then** I see "Assistant: [Name]"
4. **Given** a player is marked as "hidden" in PlayHQ, **When** I view player lists, **Then** that player is not displayed

---

### User Story 7 - View Training Schedule (Priority: P2)

Each team detail page displays training venue, day, and time so parents know where and when their child trains.

**Why this priority**: Important operational info sourced from PlayHQ; deferred to P2.

**Independent Test**: Navigate to a team detail page and see training venue, day, and time clearly displayed.

**Acceptance Scenarios**:

1. **Given** I view a team detail page, **When** I look for training info, **Then** I see "Training: [Venue] • [Day] @ [Time]"
2. **Given** a team doesn't have training scheduled, **When** I view the detail page, **Then** no training info is shown or it says "No training scheduled"

---

### User Story 8 - Click Game Details Modal (Priority: P3)

Clicking on a game in the fixture opens a modal with detailed game information (similar to PlayHQ's own interface).

**Why this priority**: Nice-to-have detail view; not critical for initial launch. Can be implemented after core pages are live.

**Independent Test**: Click a game and verify the modal displays; close modal and return to fixture.

**Acceptance Scenarios**:

1. **Given** I view a fixture, **When** I click a game, **Then** a modal opens showing game details (opponent, time, venue, etc.)
2. **Given** the modal is open, **When** I click close or outside the modal, **Then** the modal closes and I'm back on the fixture
3. **Given** a game is upcoming, **When** I view the modal, **Then** I see pre-game info (opponent, venue, time)
4. **Given** a game has been played, **When** I view the modal, **Then** I see final score and game stats

---

## Edge Cases

- What happens when a team has no games scheduled yet? → Show "No games scheduled" placeholder
- What if a coach or manager name is very long? → Truncate with ellipsis; full name visible on hover or in modal
- What if PlayHQ API is unavailable? → Show skeleton loaders or "Loading..." state; degrade gracefully with cached data if available
- What if a team is marked as "hidden" in PlayHQ? → Team should still appear on the Teams page but with a "Private" badge; detail page shows minimal public info
- What if a player is hidden in PlayHQ? → Player name and stats are not exposed in any UI
- What if there are more than 21 teams in the future? → Pagination or infinite scroll; filter logic should scale

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all teams organized by age group (u10s, u12s, u14s, u16s, u18s) in top-to-bottom order
- **FR-002**: System MUST sort teams alphabetically within each age group
- **FR-003**: System MUST display each team tile with three information pills: Division, Game night, Boys/Girls
- **FR-004**: System MUST allow filtering by: All, Age group, Boys, Game Day, Girls, Grade
- **FR-005**: System MUST dynamically show/hide teams based on active filter(s)
- **FR-006**: System MUST allow users to click a team tile and navigate to that team's detail page
- **FR-007**: System MUST display fixture data for each team (games, dates, times, opponents, venues)
- **FR-008**: System MUST display ladder data for each team (position, wins, losses, draws)
- **FR-009**: System MUST display coach name, team manager name, and assistant names (if available) without exposing contact details
- **FR-010**: System MUST display training venue, day, and time for each team
- **FR-011**: System MUST NOT expose hidden players from PlayHQ in any UI
- **FR-012**: System MUST allow users to click a game in the fixture to open a detail modal
- **FR-013**: System MUST fetch team, fixture, ladder, and coach data from PlayHQ API using provided credentials
- **FR-014**: System MUST validate that player "hidden" flag is respected before rendering player information
- **FR-015**: System MUST support graceful degradation if PlayHQ API is temporarily unavailable (show cached data or loading state)

### Key Entities

- **Team**: Represents a basketball team with attributes: id (PlayHQ), name, age_group (u10s–u18s), division, boys_or_girls, game_night, coach_id, manager_id, assistant_id(s), training_venue, training_day, training_time
- **Game/Fixture**: A scheduled or completed game with: game_id (PlayHQ), opponent, date, time, venue, home_or_away, result (if completed), play_by_play (if available)
- **Ladder**: League standings with: team_id, position, wins, losses, draws, points_for, points_against
- **Coach**: Person entity with: id (PlayHQ), name, role (coach/manager/assistant), hidden flag
- **Player**: Person entity with: id (PlayHQ), name, hidden flag (if true, do not display)

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Teams page loads in under 2 seconds with all 21 tiles rendered and responsive
- **SC-002**: Filters work instantly on client-side; no delay when switching filter categories
- **SC-003**: Team detail pages load fixture/ladder data within 3 seconds of page load (from PlayHQ API)
- **SC-004**: 100% of teams correctly display Division, Game night, and Boys/Girls pills
- **SC-005**: Zero hidden players are exposed in any UI view
- **SC-006**: Game detail modals open within 500ms of click
- **SC-007**: PlayHQ API integration is complete and tested with real club data
- **SC-008**: Page is fully responsive on mobile (320px+), tablet, and desktop viewports
- **SC-009**: Accessibility: page meets WCAG 2.1 AA standards (proper heading hierarchy, alt text, contrast, focus indicators)
- **SC-010**: On Teams page, no team is incorrectly categorized or sorted; alphabetical order verified for all 21 teams
- **SC-011**: When PlayHQ API is unavailable, page degrades gracefully with user-facing messaging (not errors)

---

## Technical Notes

### PlayHQ API Flow

**Organisation ID**: `90c7fb8e-b434-42ea-9af5-625235ca11e7`  
**API Key**: `4a1e6a01-32f3-477d-9c08-4d9ec6b50148`  
**Base URL**: `https://api.playhq.com`

1. **Fetch Seasons**: `GET /seasons?organisation={organisation_id}` → Extract current season ID
2. **Fetch Teams**: `GET /teams?season={season_id}` → Extract all team objects
3. **Fetch Grades**: `GET /grades?season={season_id}` → Extract grade IDs for filtering
4. **Fetch Fixture**: `GET /fixtures?grade={grade_id}` → Games for each team/grade
5. **Fetch Ladder**: `GET /ladder?grade={grade_id}` → Standings for each team/grade
6. **Fetch Game Detail**: `GET /games/{game_id}` → Full game summary

### Data Mapping

- Age group derived from team name or grade data
- Division extracted from grade or team object
- Boys/Girls from team gender attribute
- Game night extracted from fixture schedule (day of week)
- Coach/Manager/Assistant from team roster (hidden flag respected)
- Training info from team schedule or separate API call

### Placeholder Strategy

Until PlayHQ integration is complete:
- Use 21 hardcoded team objects with realistic names, divisions, and game nights
- Mock fixture data with 3–5 sample games per team
- Mock ladder data with realistic standings
- Replace with live API data once integration is verified

---

## Implementation Roadmap

### Phase 1: Teams Page (P1 Stories)
- Build teams grid layout with age group segmentation
- Implement client-side filtering logic
- Create placeholder team data
- Style team tiles with info pills
- Test navigation to detail pages

### Phase 2: Team Detail Pages & PlayHQ Integration (P2 Stories)
- Build team detail page layout
- Integrate PlayHQ API for fixture, ladder, coach data
- Display training schedule
- Respect hidden player flag
- Implement graceful degradation

### Phase 3: Game Detail Modal & Polish (P3 Stories)
- Build game detail modal
- Add animations and interactions
- Performance optimization
- Accessibility audit and fixes
- Responsive testing across devices

---

## Open Questions / NEEDS CLARIFICATION

- Should filter selections persist across page navigation? (i.e., if I filter by "Boys" and then click a team, when I return to Teams, is "Boys" still active?)
- Are there specific CSS or design tokens for the info pills (colors, fonts, sizes)?
- Should the Teams page have a hero section or title bar, or does it start directly with age group headers?
- Is pagination needed, or is infinite scroll preferred for potential future growth beyond 21 teams?
- Should team tiles have hover effects or animations?
- For the game detail modal, should stats be embedded in the modal or link to PlayHQ directly?
