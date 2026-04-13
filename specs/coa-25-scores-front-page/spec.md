# Spec: coa-25-scores-front-page

**Status**: READY_FOR_DEV
**Source**: https://linear.app/coachcw/issue/COA-25/scores-front-page
**Priority**: P1
**Primary Surface**: Home page latest results section

---

## Summary

Upgrade the home page latest results area into a horizontally scrollable game carousel that shows Phoenix games from the most recent 7-day window. The carousel must auto-rotate at a readable pace, support manual left/right navigation, and allow users to open each game’s details surface via the existing Scores detail route.

This feature keeps the current card visual style and focuses on interaction, data freshness, and navigation continuity.

---

## User Scenarios & Testing

### User Story 1 — Browse 7-Day Games on Home Page (Priority: P1)

As a visitor, I can see recent games directly on the home page in a scrollable carousel so I can quickly review results without leaving the page.

**Why this priority**: This is the core user value and the primary reason for the feature request.

**Independent Test**: Load the home page with a dataset containing 7-day games and verify cards, controls, and ordering render correctly.

**Acceptance Scenarios**:

1. **Given** I open the home page, **When** the latest results section loads, **Then** I see game cards sourced from the last 7 days.
2. **Given** multiple games are returned, **When** cards render, **Then** each card shows opponent context, score state, date, local kickoff time, and match status.
3. **Given** there are more games than fit the viewport, **When** I view the section, **Then** left and right navigation controls are available.
4. **Given** there are no games in the 7-day window, **When** the section renders, **Then** a clear empty state is shown instead of broken or blank content.

---

### User Story 2 — Auto-Rotate and Manual Control (Priority: P1)

As a visitor, I can let the carousel rotate automatically and also manually move left/right so I can passively scan games or directly control what I see.

**Why this priority**: The request explicitly requires both passive auto-rotation and user-driven navigation.

**Independent Test**: Observe carousel movement over time, then interact with controls and verify pause/resume behavior.

**Acceptance Scenarios**:

1. **Given** the carousel is idle, **When** the configured interval elapses, **Then** the carousel advances by one card.
2. **Given** the carousel reaches the final card, **When** auto-rotation advances, **Then** it loops to the first card seamlessly.
3. **Given** I click a navigation control, **When** interaction occurs, **Then** auto-rotation pauses and the carousel moves one step in the selected direction.
4. **Given** interaction has stopped, **When** the resume delay elapses, **Then** auto-rotation resumes.

---

### User Story 3 — Open Game Details from Home Cards (Priority: P1)

As a visitor, I can activate a game card and open that game’s details so I can move from summary context to full game information.

**Why this priority**: Without deep-link navigation, the home carousel is informational only and does not complete the user journey.

**Independent Test**: Activate a game card via mouse and keyboard and verify details open via deep-linkable URL.

**Acceptance Scenarios**:

1. **Given** a game card is visible, **When** I activate it, **Then** I navigate to the corresponding game details route.
2. **Given** I am on a game details surface opened from home, **When** I return, **Then** I can continue browsing from the same home-page context.
3. **Given** the details source has hidden squad/player data, **When** detail content is rendered, **Then** hidden fields remain suppressed.

---

## Edge Cases

- No games returned for the target 7-day window.
- Only 1 game returned (controls and auto-rotation should not degrade UX).
- API/source timeout or temporary network failure.
- Stale data fallback available vs no prior successful dataset.
- Duplicate game IDs in source payload.
- Missing kickoff time (show `TBA` and place after timed entries if ordering is needed).
- Missing venue/court values.
- Rapid repeated control clicks causing index desync.
- Keyboard-only and touch-only interaction paths.
- Mobile viewport where only a subset of cards is visible.

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST display games for a rolling 7-day window in the home latest results carousel, calculated in `Australia/Melbourne` timezone using inclusive local date boundaries (`window.startDate` through `window.endDate`).
- **FR-002**: System MUST use authoritative source data and MUST NOT fabricate unavailable match values.
- **FR-003**: System MUST render each game card with at least: teams/opponent context, status, date, and kickoff time when available; for upcoming or score-unavailable games, score values MUST remain unavailable (null/placeholder) and MUST NOT be fabricated.
- **FR-004**: System MUST provide left/right carousel controls when more than one card exists.
- **FR-005**: System MUST support automatic carousel advancement on a steady medium/slow interval.
- **FR-006**: System MUST pause auto-rotation during manual interaction and resume after an idle delay.
- **FR-007**: Carousel navigation MUST loop from last→first and first→last.
- **FR-008**: Activating a game card MUST navigate to the deep-linkable game details URL.
- **FR-009**: If source refresh fails, system MUST show the most recent valid dataset with a visible stale indication when available.
- **FR-010**: If source refresh fails and no valid prior dataset exists, system MUST show a user-visible error state.
- **FR-011**: System MUST log refresh/fetch failures with structured fields: `timestamp`, `operation`, `status/errorCode`, `message`, `windowStart`, `windowEnd`.

### Non-Functional Requirements

- **NFR-001 (Accessibility)**: Carousel controls and cards MUST be keyboard accessible with visible focus indicators.
- **NFR-002 (Accessibility)**: Semantic labels/roles MUST make carousel controls and card actions understandable to assistive technology.
- **NFR-003 (Responsive)**: Carousel MUST remain usable at 320px, 768px, and 1024px+ breakpoints.
- **NFR-004 (Performance)**: Initial render of latest results section SHOULD complete within 2 seconds under normal payload conditions.
- **NFR-005 (Error Semantics)**: Empty, stale, and error states MUST be visually distinct and user-comprehensible.
- **NFR-006 (AppShell)**: Feature MUST render within existing home page shell/navigation without introducing a custom shell.
- **NFR-007 (Consistency)**: Card styling and interaction language MUST remain consistent with existing scores experience.
- **NFR-008 (Accessibility: Motion)**: When user motion preferences indicate reduced motion, carousel auto-rotation MUST be disabled or significantly reduced to avoid continuous movement.

### Key Entities

- **Home Carousel Game Item**: Summary record shown in the home carousel (`gameId`, teams/opponent, score state, kickoff, status, venue/court optional).
- **Carousel View State**: Interaction state (`currentIndex`, `isAutoRotating`, `lastInteractionAt`, `itemCount`).
- **Game Detail Route Reference**: Deep-link target for selected card (`gameId`-based URL).
- **Refresh Run**: One data refresh attempt for the 7-day window with status and structured error metadata.

---

## Success Criteria

- **SC-001**: Home page latest results always shows a valid state: populated carousel, empty state, stale state, or error state.
- **SC-002**: Users can reach any card in the dataset via auto-rotation or manual controls without broken navigation.
- **SC-003**: Card activation opens the correct game details URL with no navigation errors.
- **SC-004**: Carousel interaction is usable across mobile/tablet/desktop breakpoints.
- **SC-005**: Keyboard-only users can navigate controls and open cards.
- **SC-006**: Failure paths produce structured logs and user-visible messaging.

---

## Acceptance Criteria (System-Level)

1. **Given** home page load succeeds with games in range, **When** latest results renders, **Then** a horizontal carousel of game cards is shown.
2. **Given** carousel idle state, **When** the auto-advance interval elapses, **Then** the active index advances by one.
3. **Given** active index is at the last card, **When** advancing occurs, **Then** the carousel loops to the first card.
4. **Given** active index is at the first card, **When** reverse navigation occurs, **Then** the carousel loops to the last card.
5. **Given** user clicks/taps navigation controls, **When** input is received, **Then** movement occurs exactly one step per action.
6. **Given** user interaction occurs, **When** auto-rotation was active, **Then** auto-rotation pauses immediately.
7. **Given** no further user interaction, **When** idle delay elapses, **Then** auto-rotation resumes.
8. **Given** a card is activated, **When** navigation executes, **Then** the browser opens that game’s detail route.
9. **Given** source returns no games, **When** section renders, **Then** a clear empty-state message is shown.
10. **Given** source refresh fails and prior data exists, **When** section renders, **Then** stale data is shown with visible stale indicator.
11. **Given** source refresh fails and no prior data exists, **When** section renders, **Then** a clear error state is shown.
12. **Given** keyboard-only navigation, **When** tabbing through the section, **Then** controls and cards are reachable and actionable.
13. **Given** screen-reader usage, **When** controls/cards are announced, **Then** labels and actions are semantically clear.
14. **Given** mobile viewport at 320px, **When** the carousel is used, **Then** content remains readable and operable without overlap.
15. **Given** temporary data service failure, **When** failure occurs, **Then** structured logs include required observability fields.
16. **Given** a game kickoff occurs exactly on the configured 7-day boundary in `Australia/Melbourne`, **When** artifact filtering runs, **Then** the game is included; and when just outside the boundary, it is excluded.
17. **Given** a game is upcoming or has unavailable scores, **When** cards render, **Then** score placeholders are shown and no fabricated score is displayed.
18. **Given** a user opens `/scores/{gameId}` for an unknown or expired ID, **When** details render, **Then** a clear not-found state is shown without crash.
19. **Given** reduced-motion user preference is enabled, **When** the home carousel loads, **Then** automatic rotation is disabled or reduced while manual controls remain usable.

---

## Constitutional Compliance

- ✅ **Principle I — User Outcomes First**: Stories are user-centered and independently testable.
- ✅ **Principle II — Test-First Discipline**: Acceptance criteria are explicit and behavior-observable for TDD implementation.
- ✅ **Principle III — Backend Authority & Invariants**: Source data is authoritative; no client-side fabrication of unavailable values.
- ✅ **Principle IV — Error Semantics & Observability**: Empty/stale/error states and structured logging are required.
- ✅ **Principle V — AppShell Integrity**: Scope is constrained to the existing home page shell.
- ✅ **Principle VI — Accessibility First**: Keyboard, focus visibility, and semantic announcements are explicitly required.
- ✅ **Principle VII — Immutable Data Flow**: Carousel state is view-only interaction state; no mutation of authoritative records.
- ✅ **Principle IX — Cross-Feature Consistency**: Reuses existing scores interaction model and detail-route behavior.

---

## Notes

- This specification defines **what** must happen, not implementation mechanics.
- Existing card visual design is intentionally preserved; scope targets behavior, data freshness, and navigation.