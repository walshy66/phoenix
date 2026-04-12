# Scope Lock: coa-18-teams-page

## Feature Slug
coa-18-teams-page

## Source
COA-18

## Priority
P1 (core page; Teams section does not exist yet)

## Primary Route
/teams (Astro page at src/pages/teams.astro)

## Detail Route
/teams/[slug] (Astro dynamic page at src/pages/teams/[slug].astro)

## Summary
This feature builds the Teams section for the Bendigo Phoenix Basketball Club website. It consists of two surfaces:

1. Teams listing page (/teams) — displays all club teams (up to 21) organised by age group, with info pills on each tile for Division, Game night, and Boys/Girls. A sticky filter bar lets users narrow teams by category.

2. Team detail page (/teams/[slug]) — shows full information for a specific team, including fixture, ladder, and training schedule. Fixture and ladder data is sourced from PlayHQ via a data-file pattern (consistent with how scores.astro already works: a script writes JSON files that the Astro pages read at build/request time). Training schedule and coaching staff are maintained manually in a static data file.

The first priority milestone (P1) is a fully functional Teams listing page backed by placeholder data. The second milestone (P2) wires up real PlayHQ data and builds the team detail pages. A P3 milestone adds the game detail modal.

## Success Criteria

- SC-001: Teams listing page renders all teams within 2 seconds with correct age group segmentation and alphabetical ordering
- SC-002: Filter interactions produce visible results within 100ms with no page reload
- SC-003: All team tiles display all three pills (Division, Game night, Boys/Girls); "TBC" shown when data is absent
- SC-004: Team detail pages render fixture and ladder data sourced from PlayHQ data files
- SC-005: Team detail pages display coach and manager names from the manually maintained data file; staff section is absent when no entry exists
- SC-006: Game detail modal (P3) opens within 200ms of click; closes via Escape key and outside click
- SC-007: Both pages render correctly at 320px, 640px, 1024px, and 1440px viewports
- SC-008: Both pages pass WCAG 2.1 AA audit (keyboard navigation, contrast, focus indicators, heading hierarchy)
- SC-009: When PlayHQ data files are absent, both pages render gracefully with placeholder states — no unhandled errors
- SC-010: Filter state persists when the user navigates back from a detail page to the listing

## Acceptance Criteria

1. Given the Teams page loads with placeholder data, When I view the page, Then age group sections appear in u10s → u12s → u14s → u16s → u18s order and teams are alphabetical within each section
2. Given I view a team tile, When I inspect it, Then Division, Game night, and Boys/Girls pills are all visible; any unknown value shows "TBC"
3. Given I click "Boys" in the filter bar, When the filter applies, Then only boys' teams are visible and age group headers for age groups with no matching teams are hidden
4. Given no teams match the active filter, When the view updates, Then a "No teams match this filter" message appears with a "Clear filter" action
5. Given I click "All" in the filter bar, When the filter applies, Then all teams and all age group headers are restored
6. Given I click a team tile, When I arrive at the detail page, Then the URL is /teams/[slug] and the displayed team name matches the tile I clicked
7. Given I navigate back from a team detail page, When I return to the Teams listing, Then my previously selected filter is still active
8. Given I am on a team detail page, When I view the Fixture section, Then I see at least one game row with date, opponent, and venue displayed
9. Given a game is completed, When I view it in the Fixture, Then a score is displayed in the format "Home Score – Away Score"
10. Given I am on a team detail page, When I view staff info, Then I see coach and manager names with no email or phone number; staff section is omitted entirely if neither is present in the data file
11. Given PlayHQ data files are absent, When either page loads, Then placeholder states display and a user-facing notice says details are temporarily unavailable — no raw error output is shown
12. Given I Tab through the filter bar using keyboard only, When I press Enter on "Girls", Then the filter activates; the active button communicates its pressed state without relying on colour alone
13. Given I am on mobile (< 640px), When I view the Teams listing, Then tiles are single-column and the filter bar scrolls horizontally without clipping
14. Given both pages render, When I inspect the HTML, Then <BaseLayout> wraps all content and no custom navigation shell is present
15. Given I apply a filter and some age groups have no matching teams, When the view updates, Then age group section headers for those groups are hidden alongside their tiles (no orphan headers remain visible)

## Constraints

### Functional Requirements
- FR-001: System MUST display all teams organised by age group in this order: u10s, u12s, u14s, u16s, u18s
- FR-002: System MUST sort teams alphabetically within each age group
- FR-003: System MUST display each team tile with three information pills: Division, Game night, Boys/Girls
- FR-004: Pills with unknown values MUST display "TBC" rather than rendering blank or being omitted
- FR-005: System MUST provide a filter bar with options: All, Boys, Girls, Age group, Game Day, Grade
- FR-006: System MUST show/hide team tiles dynamically based on the active filter without a page reload
- FR-007: System MUST show a "No teams match this filter" message when a filter produces zero results
- FR-008: System MUST allow users to click a team tile to navigate to /teams/[team-slug]
- FR-009: System MUST preserve active filter state when the user navigates back from a detail page to the listing; filter state MUST be stored in sessionStorage under the key teams-filter as { type, value }
- FR-010: System MUST display fixture data on the team detail page: date, time, opponent, venue, home/away, and result if completed
- FR-011: System MUST display ladder data on the team detail page: position, wins, losses, draws, points
- FR-012: System MUST display coach and manager names on the team detail page without any contact details; both are sourced from a manually maintained static data file
- FR-013: System MUST display training venue, day, and time on the team detail page; sourced from a manually maintained static data file
- FR-014: System MUST support a game detail modal (P3) that opens on game row click and closes via Escape key or outside click
- FR-015: System MUST source fixture and ladder data from PlayHQ-generated data files using the /v1/grades/{gradeId}/games endpoint (consistent with the existing scripts/scores-data.json pattern); placeholder data used in P1 until files are generated
- FR-016: System MUST derive team metadata (age group, gender, game night, division) by parsing the PlayHQ grade name string (e.g. "Monday U14 Girls 4" → ageGroup=u14s, gender=Girls, gameNight=Monday, division=DIV 4)
- FR-017: System MUST degrade gracefully when PlayHQ data files are absent or incomplete — show placeholder states, not raw errors

### Non-Functional Requirements
#### Accessibility (WCAG 2.1 AA)
- NFR-001: All team tiles MUST be keyboard accessible — Tab to focus, Enter to activate navigation
- NFR-002: All filter buttons MUST be keyboard accessible — Tab to focus, Enter/Space to activate
- NFR-003: Activated filter state MUST be communicated via aria-pressed or equivalent, not colour alone
- NFR-004: Game detail modal (P3) MUST trap focus while open; Escape key MUST close it and return focus to the triggering element
- NFR-005: All interactive elements MUST have a minimum tap target size of 44x44px
- NFR-006: Colour contrast for pill text and backgrounds MUST meet WCAG AA minimum (4.5:1 for normal text)
- NFR-007: Age group headings MUST use proper heading hierarchy (e.g., h2 for age groups within the Teams page h1)

#### Responsive Design
- NFR-008: Teams listing page MUST use a mobile-first layout: single-column tiles on < 640px, 2-column on 640px–1024px, 3–4 column on > 1024px
- NFR-009: Filter bar MUST be horizontally scrollable on mobile if filter options overflow the viewport width
- NFR-010: Team detail page MUST stack all sections vertically on mobile; two-column layout permitted on desktop for fixture + ladder side by