# Spec: COA-87 — Home Page Score

**Status**: IN_DESIGN
**Source**: https://linear.app/coachcw/issue/COA-87/home-page-score
**Priority**: Medium
**Primary Surface**: Home page (`/`)

---

## Summary

Remove the home page score carousel from the homepage by default so the page loads faster and has less above-the-fold work to do. The implementation must preserve the existing carousel code, data pipeline, and rendering logic for future reuse, but the homepage should not render or initialize the score carousel unless the feature is explicitly re-enabled through a central toggle.

This feature is specifically about turning the home score surface off without deleting the underlying implementation.

---

## User Scenarios & Testing

### User Story 1 — Hide the Home Score Carousel by Default (Priority: P1)

As a visitor, I want the homepage to load without the score carousel, so I get to the core home content faster and the page feels lighter.

**Why this priority**: The issue explicitly asks to remove the home page score carousel and avoid slowing the page down.

**Independent Test**: Load the homepage and verify the latest-results/carousel section does not render at all in the default configuration.

**Acceptance Scenarios**:
1. Given a visitor opens the homepage, When the page renders in the default configuration, Then the score carousel is not visible.
2. Given a visitor opens the homepage, When the page renders in the default configuration, Then there is no empty placeholder, spacing gap, or broken container where the carousel used to be.
3. Given a visitor opens the homepage, When the page renders in the default configuration, Then the page still shows the rest of the homepage content in the expected order.

---

### User Story 2 — Preserve the Existing Carousel for Future Re-Enablement (Priority: P1)

As a developer, I want the existing carousel implementation to remain intact, so I can turn it back on later without rebuilding the feature.

**Why this priority**: The issue explicitly says not to lose the code and suggests the current on/off behavior should be reviewed.

**Independent Test**: Verify the carousel component and supporting libraries remain in the codebase and can be re-enabled via the central toggle without rewriting the feature.

**Acceptance Scenarios**:
1. Given the feature toggle is switched on, When the homepage renders, Then the existing score carousel can appear again using the same implementation path.
2. Given the feature toggle is switched off, When the homepage renders, Then the carousel remains hidden without requiring code deletion.
3. Given a developer inspects the code, When they review the homepage implementation, Then the carousel logic is still present and isolated behind a clear toggle.

---

### User Story 3 — Reduce Homepage Work When the Carousel Is Off (Priority: P1)

As a visitor, I want the homepage to avoid unnecessary score-carousel work when the feature is disabled, so the page feels faster and simpler.

**Why this priority**: The issue mentions not wanting the carousel to slow the page down.

**Independent Test**: Load the homepage with the feature disabled and confirm the carousel data and initialization logic are not executed during the initial render path.

**Acceptance Scenarios**:
1. Given the feature is disabled, When the homepage is server-rendered, Then it does not load or prepare score-carousel data just to hide the section.
2. Given the feature is disabled, When the homepage loads in the browser, Then no carousel bootstrapping or live refresh activity runs for that section.
3. Given the feature is disabled, When the homepage is measured, Then it does not incur avoidable overhead from the removed carousel surface.

---

## Edge Cases

- The carousel must not leave an orphaned section wrapper, spacer, or margin on the homepage when disabled.
- Re-enabling the feature must restore the existing homepage score surface without changing the surrounding layout.
- The toggle must be centralized; the homepage should not need scattered conditional logic in multiple unrelated files.
- If carousel data files are missing while the feature is disabled, the homepage should still render normally because the carousel is not required.
- If the feature is re-enabled but the underlying score artifact is unavailable, the existing error/stale handling should continue to work as before.
- Removing the carousel from the homepage must not affect `/scores` or `/scores/[gameId]` routes.

---

## Requirements

### Functional Requirements

- FR-001: System MUST not render the home page score carousel on `/` when the feature is disabled.
- FR-002: System MUST not reserve visual space for the hidden carousel when the feature is disabled.
- FR-003: System MUST preserve the existing `HomeScoresCarousel` implementation and supporting score-home libraries for future reuse.
- FR-004: System MUST use a single central toggle or configuration switch to control whether the home score carousel appears.
- FR-005: System MUST avoid loading or initializing carousel-specific data and browser behavior on the homepage when the feature is disabled.
- FR-006: System MUST keep the rest of the homepage content and ordering intact when the carousel is removed.
- FR-007: System MUST NOT affect the `/scores` section or individual score detail routes.
- FR-008: System MUST follow the existing Astro/Tailwind code patterns already used in the project.

### Non-Functional Requirements

- NFR-001: Homepage render time SHOULD improve or remain the same when the carousel is disabled.
- NFR-002: The solution MUST be easy to re-enable without rebuilding the carousel from scratch.
- NFR-003: Changes MUST remain accessible by avoiding hidden interactive controls in the DOM when the feature is off.
- NFR-004: Changes MUST preserve responsive behavior of the rest of the homepage.
- NFR-005: The toggle mechanism MUST be maintainable and obvious to future developers.

### Key Entities

- **HomePage**: The homepage route (`/`) that currently imports and renders the score carousel.
- **HomeScoresCarousel**: The existing carousel component and bootstrap logic used for the home score surface.
- **HomeGamesArtifact**: The loaded data artifact that feeds the carousel.
- **FeatureToggle**: The central configuration switch that determines whether the carousel is rendered.

---

## Success Criteria

- SC-001: The homepage no longer shows the score carousel by default.
- SC-002: The homepage has no blank gap where the carousel used to be.
- SC-003: The existing carousel code remains intact and can be re-enabled.
- SC-004: Disabling the carousel removes unnecessary homepage work.
- SC-005: The rest of the homepage continues to render normally.

---

## Acceptance Criteria (System-Level)

1. Given the feature is disabled, When a user opens `/`, Then the home score carousel is not rendered.
2. Given the feature is disabled, When a user opens `/`, Then no empty placeholder or reserved carousel space is visible.
3. Given the feature is disabled, When the homepage loads, Then carousel-specific initialization does not run.
4. Given the feature is re-enabled, When a user opens `/`, Then the existing score carousel renders again.
5. Given the feature is disabled, When a user navigates to `/scores`, Then the scores page still works normally.
6. Given the feature is disabled, When a user navigates to `/scores/{gameId}`, Then score details still work normally.
7. Given the homepage loads with the carousel disabled, When layout is inspected, Then the surrounding hero/quick-links/sponsor sections remain aligned and intact.

---

## Constitutional Compliance

- ✅ User Outcomes: The spec focuses on a visible homepage outcome and a reversible developer outcome.
- ✅ Test-First: Each story and acceptance criterion is externally observable.
- ✅ Backend Authority: Not applicable — this is a frontend homepage rendering change.
- ✅ AppShell: The existing shell is preserved; only one surface is conditionally removed.
- ✅ Accessibility: Hidden carousel controls must not remain interactive when disabled.
- ✅ Responsive: The remaining homepage layout must keep its current responsive behavior.
- ✅ Immutable Data: The underlying score implementation is preserved rather than mutated away.

---

## Notes

- The issue description implies a toggle-based removal rather than deleting the feature entirely.
- The exact toggle source can follow existing project conventions, but it should be centralized and easy to reverse.
