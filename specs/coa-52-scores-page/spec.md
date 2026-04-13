# Spec: coa-52-scores-page

**Status**: READY_FOR_DEV
**Source**: https://linear.app/coachcw/issue/COA-52/scores-page
**Priority**: P1
**Primary Route**: `/scores`

---

## Summary

Build a new Scores page experience titled **"This Week's Games"** that shows upcoming fixtures for the next Mon–Fri window in four day columns (Monday, Tuesday, Wednesday, Friday), ordered by earliest kickoff first. Users can open a game’s full details from each tile. Data refreshes weekly on Sunday so the page always reflects the upcoming week.

---

## User Scenarios & Testing

### User Story 1 — View This Week's Games Grid (Priority: P1)

As a visitor, I can open Scores and immediately understand this week’s game schedule in a predictable day-by-day layout.

**Why this priority**: This is the core page value and must work before any secondary enhancements.

**Independent Test**: Load `/scores` with fixture data and verify the 4-column day grid, title, ordering, and day empty states.

**Acceptance Scenarios**:

1. **Given** I open the Scores page, **When** the page loads, **Then** I see the page title "This Week's Games".
2. **Given** fixtures are available for the target week, **When** the grid renders, **Then** I see exactly 4 columns labeled Monday, Tuesday, Wednesday, and Friday.
3. **Given** a day has multiple games, **When** games are shown in that day’s column, **Then** games are sorted by kickoff time ascending.
4. **Given** a day has no fixtures, **When** that column renders, **Then** I see "No games scheduled" for that day.
5. **Given** some fixtures have missing/invalid kickoff time, **When** displayed, **Then** those fixtures show "TBA" and are listed after timed fixtures for the same day.

---

### User Story 2 — Open Game Details (Priority: P1)

As a visitor, I can open full details for a selected game from the weekly grid.

**Why this priority**: The schedule overview must connect to full game context to be useful.

**Independent Test**: Click any game tile and verify full details open and return path preserves schedule context.

**Acceptance Scenarios**:

1. **Given** a game tile is visible, **When** I activate it (click/tap/keyboard), **Then** I am taken to a game detail surface containing teams, time, venue, and any non-hidden squad details.
2. **Given** I am on game details, **When** I go back/close, **Then** I return to the weekly grid without losing context.
3. **Given** squad/player data is marked hidden by source data, **When** details are rendered, **Then** hidden information is not displayed.

---

### User Story 3 — Weekly Automatic Refresh (Priority: P2)

As a site owner, I need weekly fixture data to refresh on Sunday without manual editing.

**Why this priority**: Operationally important for freshness but secondary to the P1 user-facing schedule UI.

**Independent Test**: Simulate Sunday refresh and verify next week’s fixtures are available and rendered on `/scores`.

**Acceptance Scenarios**:

1. **Given** it is Sunday in `Australia/Melbourne` timezone, **When** refresh processing runs, **Then** the upcoming Mon–Fri fixture window is fetched from the source.
2. **Given** refreshed data is available, **When** users open `/scores`, **Then** they see the new upcoming week’s fixtures.
3. **Given** refresh fails, **When** `/scores` is requested, **Then** users receive a clear error state and the failure is logged.

---

### User Story 4 — Responsive and Accessible Layout (Priority: P2)

As a visitor on any device, I can read and use the weekly grid and game interactions.

**Why this priority**: Required for broad usability and constitutional accessibility standards.

**Independent Test**: Verify behavior and readability at mobile (320px), tablet (768px), desktop (1024px+) with keyboard-only navigation.

**Acceptance Scenarios**:

1. **Given** I view the page on mobile, **When** layout adapts, **Then** game content remains readable and interactive without broken overlap.
2. **Given** I navigate using keyboard only, **When** I tab through interactive elements, **Then** each game tile is focusable with visible focus state and can be activated.
3. **Given** I use assistive technology, **When** content is announced, **Then** day groupings and game actions are conveyed with semantic structure.

---

## Edge Cases

- PlayHQ/source API unavailable or times out.
- Invalid credentials or missing configuration for data fetch.
- Partial payload (missing venue, missing team names, missing kickoff).
- No fixtures for one or more required day columns.
- No fixtures at all for the target Mon–Fri window.
- Duplicate fixture IDs in source payload.
- Saturday/Sunday browsing should still target upcoming Mon–Fri window.
- Timezone boundary issues around Sunday 00:00 rollover.
- Very high game volume for a single day.

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST derive and display fixtures for the upcoming Mon–Fri window.
- **FR-002**: System MUST render exactly four day columns: Monday, Tuesday, Wednesday, Friday; fixtures scheduled on other days (Thursday, Saturday, Sunday) MUST NOT be rendered in the weekly grid.
- **FR-003**: System MUST sort games within each day by kickoff time ascending.
- **FR-004**: System MUST display "No games scheduled" for any day with zero fixtures.
- **FR-005**: Each game tile MUST display an at-a-glance summary (teams/grade/time minimum).
- **FR-006**: Each game tile MUST provide an interactive path to full game details via a deep-linkable detail URL.
- **FR-007**: Game detail view MUST include teams, kickoff time, and venue when available.
- **FR-008**: System MUST suppress hidden squad/player/staff fields from source data.
- **FR-009**: Page heading MUST be "This Week's Games".
- **FR-010**: System MUST trigger a weekly refresh every Sunday in `Australia/Melbourne` timezone for the next Mon–Fri window.
- **FR-011**: On data fetch failure, system MUST show the most recent successful weekly dataset (if available) with a visible stale-data banner; if no prior successful dataset exists, system MUST provide a user-visible error state.
- **FR-012**: System MUST log refresh and fetch failures with, at minimum, `timestamp`, `operation`, `status/errorCode`, `message`, `windowStart`, and `windowEnd`.
- **FR-013**: Source fixture data MUST be treated as authoritative; client view MUST NOT infer or fabricate unavailable server values.

### Non-Functional Requirements

- **NFR-001 (Performance)**: Initial page render for the grid MUST complete within 2 seconds on a standard connection under normal payload size.
- **NFR-002 (Accessibility)**: Interactive controls MUST be keyboard accessible with visible focus indicators.
- **NFR-003 (Accessibility)**: Color contrast and semantics MUST satisfy WCAG 2.1 AA for text and controls.
- **NFR-004 (Responsive)**: Layout MUST be usable at 320px, 768px, and 1024px+ breakpoints.
- **NFR-005 (Error Semantics)**: User-facing errors MUST be clear, actionable, and distinguish temporary fetch failure from empty schedule.
- **NFR-006 (Observability)**: Refresh/fetch outcomes MUST be logged with `timestamp`, `operation`, `status/errorCode`, `message`, `windowStart`, and `windowEnd`.
- **NFR-007 (Consistency)**: Scores page MUST render within existing site shell/navigation patterns.
- **NFR-008 (Data Hygiene)**: Sensitive credentials MUST NOT be exposed in rendered page content or client-visible payloads.

### Key Entities

- **Fixture**: Single scheduled game record (`fixtureId`, `homeTeam`, `awayTeam`, `kickoffAt`, `venue`, `grade`, `dayOfWeek`, `visibilityFlags`).
- **Week Window**: Target display window with `startDate` (Monday) and `endDate` (Friday).
- **Daily Bucket**: Grouped list of fixtures per supported day column.
- **Game Detail View Model**: Expanded detail payload for a selected fixture including only permitted fields.
- **Refresh Run**: One scheduled/triggered retrieval attempt for upcoming week with status metadata (`startedAt`, `completedAt`, `status`, `errorCode?`).

---

## Success Criteria

- **SC-001**: Page title displays exactly "This Week's Games".
- **SC-002**: 100% of valid fixtures for the target Mon–Fri window appear in the correct day column.
- **SC-003**: Within each day column, fixture order is always earliest-to-latest by kickoff.
- **SC-004**: Users can open game details from any listed fixture without navigation or rendering errors.
- **SC-005**: Hidden squad/player fields are never displayed in UI output.
- **SC-006**: Page is usable at 320px, 768px, and 1024px+ with keyboard interaction.
- **SC-007**: Sunday refresh completes automatically and updates the upcoming week dataset without manual content edits.
- **SC-008**: On source/API failure, a user-facing error appears and a structured log entry is produced.

---

## Acceptance Criteria (System-Level)

1. **AC-001**: Given the target week has fixtures, when `/scores` loads, then the title and four required day columns are present.
2. **AC-002**: Given multiple fixtures in one day, when rendered, then ordering is ascending by kickoff time.
3. **AC-003**: Given a day has zero fixtures, when rendered, then that day shows "No games scheduled".
4. **AC-004**: Given a fixture has unknown kickoff, when rendered, then time is shown as "TBA" and placed after timed entries for that day.
5. **AC-005**: Given a user activates a fixture tile, when detail view opens, then teams/time/venue are shown where available and the detail view is addressable via a shareable URL.
6. **AC-006**: Given hidden squad data flags, when detail view renders, then hidden fields are omitted.
7. **AC-007**: Given a user exits game details (or uses browser back), when returning to the schedule, then prior weekly context remains visible.
8. **AC-008**: Given a source fetch failure, when `/scores` renders, then the most recent successful weekly data is shown with a visible stale-data banner; if no prior successful data exists, a clear error message is shown instead of silent failure.
9. **AC-009**: Given a source fetch failure, when failure occurs, then logs include `timestamp`, `operation`, `status/errorCode`, `message`, `windowStart`, and `windowEnd`.
10. **AC-010**: Given Sunday refresh schedule time in `Australia/Melbourne` arrives, when refresh runs, then upcoming Mon–Fri data is refreshed.
11. **AC-011**: Given mobile viewport (320px), when page renders, then content remains legible and actionable.
12. **AC-012**: Given keyboard-only navigation, when tabbing through game items, then focus is visible and activation works.
13. **AC-013**: Given assistive technology use, when reading the page, then day groupings and item actions are semantically understandable.
14. **AC-014**: Given no fixtures exist for the target week, when page renders, then a full-page empty state explains no games are scheduled.
15. **AC-015**: Given fixtures exist on Thursday, Saturday, or Sunday, when the weekly grid renders, then those fixtures are excluded and no day column is created for those days.

---

## Constitutional Compliance

- ✅ **Principle I — User Outcomes First**: Stories define clear user value and measurable outcomes.
- ✅ **Principle II — Test-First Discipline**: Acceptance criteria are explicit and independently testable.
- ✅ **Principle III — Backend Authority & Invariants**: Source data treated as authoritative; no client fabrication.
- ✅ **Principle IV — Error Semantics & Observability**: Error messaging and structured logging are required.
- ✅ **Principle V — AppShell Integrity**: Page remains within existing site shell/navigation patterns.
- ✅ **Principle VI — Accessibility First**: Keyboard, semantics, and contrast requirements explicitly included.
- ✅ **Principle VII — Immutable Data Flow**: Refresh/fetch state modeled explicitly; no opaque client mutation behavior.
- ✅ **Principle IX — Cross-Feature Consistency**: Aligns with existing `/scores` route and shared site interaction patterns.
- ✅ **Detail Surface Behavior**: Detail access is deep-linkable and URL-addressable, with predictable back-navigation to the weekly schedule.

---

## Notes

- Do not store raw third-party API keys in committed spec text, runtime UI output, or client-exposed payloads.
- This spec focuses on behavior and quality constraints (WHAT), not implementation mechanics (HOW).
