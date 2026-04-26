# Spec: COA-87 — Home Page Score

**Status**: READY_FOR_DEV
**Source**: https://linear.app/coachcw/issue/COA-87/home-page-score
**Priority**: Medium
**Primary Surface**: Home page (`/`)

---

## Summary

Remove the home page score carousel from the homepage by default so the page feels lighter and loads with less above-the-fold work. The existing score-carousel implementation must remain available for future re-enablement, but it should not appear on the homepage unless the feature is turned back on through a central toggle or equivalent existing switch.

This feature is about hiding the homepage score surface without deleting the underlying capability.

---

## User Scenarios & Testing

### User Story 1 — Hide the Home Score Carousel by Default (Priority: P1)

As a visitor, I want the homepage to open without the score carousel, so I can get to the core home content faster.

**Why this priority**: The issue requests removal of the homepage score carousel and explicitly calls out page slowdown.

**Independent Test**: Load the homepage in the default configuration and verify the score-carousel section is absent.

**Acceptance Scenarios**:
1. Given a visitor opens the homepage, When the default page renders, Then the score carousel is not visible.
2. Given a visitor opens the homepage, When the default page renders, Then the "Latest Results" heading and related carousel controls are not shown.
3. Given a visitor opens the homepage, When the default page renders, Then no empty placeholder, spacer, or broken container remains where the carousel used to be.
4. Given a visitor opens the homepage, When the default page renders, Then the remaining homepage sections still appear in the expected order.

---

### User Story 2 — Preserve the Carousel for Future Re-Enablement (Priority: P1)

As a developer, I want the existing carousel behavior preserved behind a single switch, so I can restore it later without rebuilding the feature.

**Why this priority**: The issue says not to lose the code and asks to review how it is toggled on and off.

**Independent Test**: Verify the carousel implementation still exists and can be restored by turning the switch back on.

**Acceptance Scenarios**:
1. Given the carousel switch is turned on, When the homepage renders, Then the existing score carousel can appear again.
2. Given the carousel switch is turned off, When the homepage renders, Then the carousel stays hidden without requiring code deletion.
3. Given a developer reviews the homepage design, When they inspect the toggle behavior, Then the carousel logic is still present and controlled centrally rather than scattered across unrelated areas.

---

### User Story 3 — Reduce Homepage Work When the Carousel Is Off (Priority: P1)

As a visitor, I want the homepage to avoid unnecessary score-carousel work when the feature is off, so the page remains quick and simple.

**Why this priority**: The issue specifically calls out not wanting the carousel to slow the page down.

**Independent Test**: Load the homepage with the carousel disabled and verify the page does not do carousel-specific work just to hide the section.

**Acceptance Scenarios**:
1. Given the carousel is disabled, When the homepage loads, Then the carousel section does not initialize.
2. Given the carousel is disabled, When the homepage loads, Then no carousel-specific controls or interactive elements are present in the page output.
3. Given the carousel is disabled, When the homepage is inspected, Then the homepage does not incur avoidable carousel-related overhead during initial render.

---

## Edge Cases

- The hidden carousel must not leave behind an orphaned wrapper, spacer, or extra vertical gap on the homepage.
- Re-enabling the carousel must restore the existing surface without altering the order or spacing of the surrounding homepage sections.
- The toggle must remain centralized; the homepage should not rely on scattered conditional checks in multiple unrelated places.
- If score data is missing while the carousel is disabled, the homepage must still render normally because the carousel is not required.
- If the carousel is re-enabled and the score data is unavailable, the existing empty/stale/error behavior should continue to work as it does today.
- Removing the carousel from the homepage must not affect the `/scores` page or individual score detail pages.
- Hidden carousel controls must not remain focusable or announced to assistive technology when the feature is off.

---

## Requirements

### Functional Requirements

- FR-001: System MUST not render the home page score carousel on `/` when the feature is disabled.
- FR-002: System MUST not leave reserved visual space for the score carousel when the feature is disabled.
- FR-003: System MUST preserve the existing home score carousel implementation for future reuse.
- FR-004: System MUST use a single central toggle or equivalent existing switch to control whether the home score carousel appears.
- FR-005: System MUST avoid initializing carousel-specific interactive behavior when the feature is disabled.
- FR-006: System MUST keep the rest of the homepage content and ordering intact when the carousel is removed.
- FR-007: System MUST NOT affect the `/scores` page or score detail pages.
- FR-008: System MUST follow the existing project patterns and conventions already used in the codebase.
- FR-009: System MUST not load or initialize the home score artifact or carousel bootstrap when the feature is disabled.

### Non-Functional Requirements

- NFR-001: The solution MUST keep the homepage accessible by avoiding hidden interactive controls when the carousel is off.
- NFR-002: The solution MUST preserve responsive behavior for the remaining homepage content.
- NFR-003: The solution MUST remain easy to re-enable without rebuilding the carousel from scratch.
- NFR-004: The solution SHOULD reduce unnecessary homepage work when the carousel is disabled.
- NFR-005: The toggle mechanism MUST be understandable and maintainable for future developers.

### Key Entities

- **HomePage**: The homepage route (`/`) that currently includes the score surface.
- **HomeScoresCarousel**: The existing score-carousel surface and its supporting interaction behavior.
- **FeatureToggle**: The single centralized switch that determines whether the homepage score surface is shown, with default-off behavior.
- **ScoresPages**: The existing `/scores` and `/scores/[gameId]` views that must remain unaffected.

---

## Success Criteria

- SC-001: The homepage no longer shows the score carousel by default.
- SC-002: The homepage has no blank gap where the carousel used to be.
- SC-003: The existing carousel behavior remains available for re-enablement.
- SC-004: Disabling the carousel removes unnecessary homepage work.
- SC-005: The rest of the homepage continues to render normally.
- SC-006: The `/scores` area and score detail pages continue to work unchanged.

---

## Acceptance Criteria

1. Given the feature is disabled, When a user opens `/`, Then the score carousel is not rendered.
2. Given the feature is disabled, When a user opens `/`, Then no empty placeholder or reserved carousel space is visible.
3. Given the feature is disabled, When the homepage loads, Then carousel-specific initialization does not run.
4. Given the carousel switch is turned on, When a user opens `/`, Then the Latest Results section and carousel controls are visible again.
5. Given the feature is disabled, When a user opens `/`, Then the homepage still shows the remaining sections in the expected order.
6. Given the feature is disabled, When a user navigates to `/scores`, Then the scores page still works normally.
7. Given the feature is disabled, When a user navigates to `/scores/{gameId}`, Then score details still work normally.
8. Given the homepage loads with the carousel disabled, When layout is inspected, Then the surrounding hero, quick links, and sponsor sections remain aligned and intact.

---

## Constitutional Compliance

- ✅ Principle I — User Outcomes First: The spec is focused on a visible homepage outcome and a reversible developer outcome.
- ✅ Principle II — Test-First Discipline: User stories and acceptance criteria are observable and testable.
- ✅ Principle III — Backend Authority & Invariants: Not applicable; this is a frontend rendering change with no backend authority changes.
- ✅ Principle IV — Error Semantics & Observability: Not directly applicable; the feature removes work rather than introducing new error paths.
- ✅ Principle V — AppShell Integrity: The existing site shell and page structure remain intact.
- ✅ Principle VI — Accessibility First: Hidden controls must not remain interactive or announced when the carousel is off.
- ✅ Principle VII — Immutable Data Flow: The underlying carousel capability is preserved rather than rewritten or mutated away.
- ✅ Principle IX — Cross-Feature Consistency: The feature follows the existing homepage and scores patterns already used in the project.
- ✅ Responsive: Remaining homepage content must continue to work at mobile, tablet, and desktop breakpoints.

---

## Notes

- The issue description implies a toggle-based removal rather than deleting the feature entirely.
- The exact toggle source can follow existing project conventions, but it should stay centralized and easy to reverse.
