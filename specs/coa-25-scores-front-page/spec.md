# Feature Specification: Scores Front Page Carousel

**Feature Branch**: `cameronwalsh/coa-25-scores-front-page`  
**Created**: 2026-04-13  
**Status**: Draft  
**Input**: User description: "The home page has latest results, I'd like the games to show up there and have a scroll left/right option to have all the games from the 7 days display, it should auto rotate through (medium/slow speed) as there will be 21 games to go through, the user can use the click buttons to scroll if they want. The cards look great, so the UI is fine, just need to be able to click the game and have it take you to the game details from the scores page."

## User Scenarios & Testing

### User Story 1 - View Latest Game Results in Carousel (Priority: P1)

A club visitor lands on the home page and wants to quickly see recent game results without navigating away from the main page. The carousel displays games from the past 7 days in a horizontally scrollable format.

**Why this priority**: Core feature that delivers immediate value to site visitors; displays live data on home page without friction.

**Independent Test**: Carousel renders with valid game data from PlayHQ API; can be tested by simply loading the home page and verifying 7-day games appear.

**Acceptance Scenarios**:

1. **Given** the home page is loaded, **When** the carousel section is visible, **Then** the carousel displays games from the past 7 days in card format (6–8 games visible on desktop viewport)
2. **Given** there are 21+ games in the past 7 days, **When** the carousel renders, **Then** left/right scroll buttons are visible and functional
3. **Given** game data is fetched from PlayHQ API, **When** cards render, **Then** each card displays: opponent name, score, date, time, and match status (completed/upcoming)
4. **Given** a game card is visible, **When** the user clicks it, **Then** the browser navigates to the game details page (`/scores/<gameId>`)

---

### User Story 2 - Auto-Rotate Through Games (Priority: P1)

The carousel automatically cycles through games at a medium/slow pace, allowing passive scanning of all results without manual interaction.

**Why this priority**: Passive browsing feature that showcases all games in the 7-day window; critical for engagement on home page without user action required.

**Independent Test**: Auto-rotation can be tested independently by loading the page and observing carousel movement over ~10 seconds; no user interaction needed.

**Acceptance Scenarios**:

1. **Given** the carousel is visible and idle, **When** 3–4 seconds elapse, **Then** the carousel auto-advances by one game card
2. **Given** auto-rotation is active, **When** the carousel reaches the last game, **Then** it loops back to the first game seamlessly
3. **Given** the carousel is auto-rotating, **When** the user clicks a left/right scroll button or interacts with a card, **Then** auto-rotation pauses and the user's action takes effect
4. **Given** auto-rotation is paused due to user interaction, **When** the user stops interacting (no clicks for 5 seconds), **Then** auto-rotation resumes

---

### User Story 3 - Manual Scroll Control (Priority: P1)

Users can manually advance or retreat through the carousel using left/right navigation buttons for fine-grained control over which games they view.

**Why this priority**: User control over carousel navigation is essential; without it, users cannot reliably view specific games in a large dataset.

**Independent Test**: Left/right buttons can be tested independently by clicking them and verifying the carousel advances/retreats by one position.

**Acceptance Scenarios**:

1. **Given** the carousel displays 6+ games, **When** the user clicks the right button, **Then** the carousel advances by one game card
2. **Given** the carousel displays 6+ games, **When** the user clicks the left button, **Then** the carousel retreats by one game card
3. **Given** the carousel is at the first game, **When** the user clicks the left button, **Then** the carousel wraps to the last game (or does not advance; see edge cases)
4. **Given** the carousel is at the last game, **When** the user clicks the right button, **Then** the carousel wraps to the first game (or does not advance; see edge cases)
5. **Given** a scroll button is disabled (at boundary), **When** it is disabled, **Then** it displays visual feedback (opacity reduction, cursor change) to indicate it cannot advance further

---

### Edge Cases

- **Wrap-Around Behavior**: Should the carousel wrap from last to first (and vice versa), or should buttons become disabled at boundaries? **NEEDS CLARIFICATION**
- **Auto-Rotation Pause on Hover**: Should hovering over the carousel pause auto-rotation, or only user clicks?
- **Empty State**: If there are no games in the past 7 days, what is displayed? (Placeholder text, hidden section, fallback data?)
- **API Failure**: If PlayHQ API is unreachable, what fallback behavior occurs? (Cached data, error message, carousel hidden?)
- **Timezone Handling**: PlayHQ returns timestamps in UTC; should carousel filter/display games in local browser timezone or UTC?
- **Mobile Responsiveness**: On mobile (< 768px), how many game cards fit in viewport? Should cards be smaller or carousel scroll by fractional cards?
- **Loading State**: While game data is being fetched, what is shown? (Skeleton loader, empty carousel, placeholder cards?)

## Requirements

### Functional Requirements

- **FR-001**: System MUST fetch games from PlayHQ API for the past 7 days (168 hours from now)
- **FR-002**: System MUST render each game as a card displaying: opponent name, match score, date, time, and match status
- **FR-003**: System MUST display left and right navigation buttons that advance/retreat the carousel by one game card per click
- **FR-004**: System MUST auto-advance the carousel every 3–4 seconds when idle (no user interaction for 5 seconds)
- **FR-005**: System MUST pause auto-rotation when the user clicks a navigation button or interacts with a card
- **FR-006**: System MUST resume auto-rotation 5 seconds after user interaction stops
- **FR-007**: System MUST navigate to game details page (`/scores/<gameId>`) when a game card is clicked
- **FR-008**: System MUST display 6–8 game cards in viewport on desktop (1920px+), 4–5 on tablet (768px–1280px), and 2–3 on mobile (< 768px)
- **FR-009**: System MUST handle wrap-around at carousel boundaries (looping first ↔ last) **[NEEDS CLARIFICATION: confirm looping behavior vs. button disable]**
- **FR-010**: System MUST gracefully handle empty state if fewer than 2 games exist in past 7 days
- **FR-011**: System MUST handle API failures by displaying a user-friendly error or fallback state (cached data if available)

### Key Entities

- **Game Card**: Represents a single match with opponent, score, date, time, status, and game ID for deep linking
  - Attributes: `gameId`, `opponentName`, `opponentScore`, `phoenixScore`, `date`, `time`, `status` (completed/upcoming/cancelled)
  - Inherits styling from existing game card component (as noted in issue description)

- **Carousel Container**: Manages scroll position, auto-rotation state, and button visibility
  - State: `currentIndex`, `autoRotating`, `games`, `isLoading`, `error`
  - Methods: `advance()`, `retreat()`, `pauseAutoRotation()`, `resumeAutoRotation()`

- **PlayHQ API Integration**: Fetches fixture/result data for the organization
  - Endpoint: `GET /competitions/{id}/fixtures` or equivalent (review OpenAPI spec for exact endpoint)
  - Filters: `fromDate` = 7 days ago, `toDate` = today
  - Caching: Reuse existing pattern from COA-52 (Scores page) and COA-18 (Teams page)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Carousel renders within 2 seconds of page load (including API fetch and card rendering)
- **SC-002**: Auto-rotation advances carousel visibly every 3–4 seconds without jank or layout shift
- **SC-003**: User can navigate to any game in the 7-day window within 3 clicks of left/right buttons
- **SC-004**: Clicking a game card navigates to `/scores/<gameId>` within 500ms
- **SC-005**: Carousel adapts to viewport width: displays 6倓8 cards on desktop, 4–5 on tablet, 2–3 on mobile
- **SC-006**: No console errors or network failures when carousel mounts and data is fetched
- **SC-007**: Auto-rotation resume delay is consistent (± 500ms variation acceptable)
- **SC-008**: Empty state (< 2 games) is handled without breaking layout or throwing errors

---

## Implementation Notes

### Reuse Existing Patterns

- **Game Card Component**: Existing card UI from scores page (COA-52) should be reused; no new card design needed
- **PlayHQ API Integration**: Follow the same API call and caching strategy as COA-18 (Teams page) and COA-52 (Scores page); review those issues for exact fetch logic
- **State Management**: Use Astro's client-side React component + hooks for carousel state (auto-rotation timer, current index, pause/resume logic)

### Handover Considerations

- **Config**: Auto-rotation speed (3–4 seconds) should be a named constant at the top of the component for easy adjustment
- **Documentation**: Add inline comments explaining the auto-rotation timer cleanup and pause/resume logic for clarity to the next maintainer
- **Testing**: Provide manual test steps in the issue for non-technical person (e.g., "Click right button, expect card to advance")

### Open Decisions

1. **Wrap-Around Behavior**: Looping vs. button disable at boundaries — **request clarification from Walshy**
2. **Auto-Rotation Resume Delay**: Is 5 seconds appropriate, or should it be shorter/longer? **request user feedback**
3. **Mobile Card Count**: Confirm expected card count on mobile before implementing responsive breakpoints
