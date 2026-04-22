# Feature Specification: Resource Filters Mobile UX

**Feature Branch**: `cameronwalsh/coa-74-resource-filters`  
**Created**: 2026-04-22  
**Status**: READY_FOR_DEV  
**Input**: COA-74 bug report + screenshot analysis  
**Priority**: P1 (blocking) + P2/P3 enhancements  
**Related Components**: `FilterBar.astro`, `src/lib/resources/filters.ts`, Coaching Resources page

---

## Summary

Mobile users cannot reliably access and use the resource filter panel on Coaching Resources and Player Resources pages. On desktop, filters work correctly, but mobile users experience broken interactions when toggling the filter panel. Additionally, the resource category tabs (Coaching Resources, Player Resources, Manager Resources, Guides, Forms) are stacked vertically on mobile, which violates mobile UX patterns and reduces discoverability.

This feature fixes the filter panel interaction on mobile (P1), converts tabs to a horizontal carousel (P2), and adds polish for filter panel sizing and auto-collapse on scroll (P3).

---

## User Scenarios & Testing

### User Story 1 - Filter Panel Interaction on Mobile (Priority: P1)

Mobile users need to open, interact with, and close the filter panel on Coaching Resources and Player Resources pages without JavaScript errors or visual glitches.

**Why this priority**: Filter functionality is currently broken on mobile—users cannot access the filter panel without encountering console errors. This is a blocker for mobile resource discovery and must be fixed immediately.

**Independent Test**: Can be tested on mobile (< 768px breakpoint) by:
1. Opening Coaching Resources page
2. Tapping "Show filters" button
3. Verifying filter panel appears, all controls are interactive (tap filter buttons, type in search if present)
4. Tapping "Show filters" again to collapse
5. Confirming no JavaScript console errors occur
6. Verifying filter selections persist while panel is closed and reopen with same selections

**Acceptance Scenarios**:

1. **Given** I am on the Coaching Resources page on mobile (screen width < 768px), **When** I tap the "Show filters" button, **Then** the filter panel slides/expands into view, button label changes to "Hide filters", and `aria-expanded` is set to "true"

2. **Given** the filter panel is open on mobile, **When** I tap age, category, or skill filter buttons, **Then** the button styling updates (toggles active state), filter value is added/removed from the active filter state, and matching resources are immediately filtered without requiring additional user action

3. **Given** filters are currently applied on mobile, **When** I view the "Show filters" button, **Then** it displays "Show filters (2 active)" when there are 2 active filters, making it clear that filters are applied and how many are selected

4. **Given** the filter panel is open on mobile, **When** I tap the "Show filters" button (now labeled "Hide filters"), **Then** the filter panel collapses smoothly, button label reverts to "Show filters", `aria-expanded` is set to "false", and active filter selections are preserved

5. **Given** filters are active and the panel is collapsed, **When** I navigate away and return to the same resource page, **Then** the filter state is preserved (same filters are applied and panel remains collapsed unless explicitly reopened)

6. **Given** any filter is active on mobile, **When** I tap "Clear all filters and search" button, **Then** all active filters are removed, search field is cleared if present, and filter button displays full result count again

---

### User Story 2 - Resource Tabs Mobile Carousel (Priority: P2)

On mobile, resource category tabs (Coaching Resources, Player Resources, Manager Resources, Guides, Forms) should be a left/right scrollable carousel instead of stacked vertically, allowing one-handed discovery and conforming to mobile navigation patterns.

**Why this priority**: Current tab layout is vertically stacked and "looks terrible" on mobile, violates mobile UX patterns, and reduces discoverability. Carousel improves visual hierarchy, supports one-handed scrolling, and is familiar to mobile users. This is a key UX polish for the resources feature.

**Independent Test**: Can be tested on mobile (< 768px breakpoint) by:
1. Opening resources page (any section)
2. Observing tabs render as horizontal scrollable carousel
3. Swiping left/right to scroll through tabs
4. Verifying active tab is visually distinct and remains visible in viewport
5. Confirming scroll stops at boundaries (no infinite scroll)
6. Rotating device and confirming carousel adapts to new orientation

**Acceptance Scenarios**:

1. **Given** I am on the resources page on mobile (screen width < 768px), **When** I view the resource section tabs, **Then** they are displayed in a horizontal, left/right scrollable carousel (not stacked vertically) with a minimum of 44px height for touch targets

2. **Given** the carousel is visible, **When** I swipe or flick left or right on the tab area, **Then** the carousel scrolls smoothly in that direction, revealing adjacent tabs, with scroll momentum preserved on touch devices

3. **Given** the carousel contains 5+ tabs, **When** I scroll to the left boundary, **Then** the leftmost tab stops at the left edge and does not scroll further; the same applies to the right boundary with the rightmost tab

4. **Given** a resource section tab is currently active (e.g., "Coaching Resources"), **When** I view the carousel, **Then** that tab is visually highlighted with the active style (e.g., background color, underline, or border) and positioned within or near the viewport center to ensure visibility

5. **Given** I am viewing a carousel with 1–2 tabs, **When** I load the page, **Then** all tabs are visible without scrolling, and the carousel does not have visible scroll indicators (since all content fits)

6. **Given** the carousel has overflow content, **When** I view the carousel on mobile, **Then** scroll indicators using CSS gradient fade are visible on the left and right edges if content is scrollable, improving affordance and maintaining visual consistency with the design system

---

### User Story 3 - Filter Panel Size & Auto-Collapse (Priority: P3)

When the filter panel is open on mobile, it should be appropriately sized (not exceed 50% of viewport) and auto-collapse when the user scrolls down in the resource list, maximizing content visibility while keeping filters easily accessible.

**Why this priority**: Nice-to-have UX polish. While Story 1 fixes the broken interaction and Story 2 improves discoverability, this story improves the overall experience by maximizing usable screen real estate for content discovery. Users can still quickly re-open filters with a single tap.

**Independent Test**: Can be tested on mobile by:
1. Opening filter panel on resources page
2. Confirming panel height is reasonable (visual inspection)
3. Scrolling down in resource list
4. Verifying filter panel collapses/slides up
5. Scrolling back to top
6. Verifying panel behavior on scroll up (either stays collapsed or re-expands based on design decision)
7. Closing panel, navigating away, returning, confirming state is preserved

**Acceptance Scenarios**:

1. **Given** the filter panel is open on mobile, **When** I view the screen, **Then** the panel occupies a maximum of 50% of the viewport height (measured from top of filter panel to viewport bottom), ensuring at least 50% of the viewport is available for resource content

2. **Given** the filter panel is open and I begin scrolling down in the resource list, **When** I scroll more than 100px downward, **Then** the filter panel smoothly slides up/collapses over the course of ~300ms without interrupting resource browsing, and the toggle button remains visible and sticky at the top

3. **Given** the filter panel is collapsed due to scroll, **When** I scroll back to the top of the page (within 100px of top), **Then** the filter panel remains collapsed until the user explicitly taps "Show filters", providing predictable and consistent behavior across all resource pages

4. **Given** I close the filter panel on a resource page, **When** I navigate to a different resource section and return to the original section, **Then** the filter panel state is preserved (closed) and active filter selections are retained

5. **Given** the filter panel is open, **When** I interact with a filter button (select/deselect), **Then** the filter application happens immediately (no additional "Apply" button required), and the panel remains open to allow quick successive filter adjustments

---

### Edge Cases

- **Empty filter category**: If age, category, or skill filter has zero options available (all resources have been filtered out), the filter group is still rendered but all options display as disabled/inactive, and a message like "No matching resources for this filter" is not shown inline (instead, "no results" message appears in the grid)

- **Few vs. many tabs**: 
  - With 1-2 tabs: All tabs fit in viewport; carousel has no scroll; no scroll indicators shown
  - With 3-4 tabs: Some tabs may be cut off; carousel is scrollable; scroll indicators appear on edges
  - With 5+ tabs: Carousel definitely scrollable; scroll indicators present; active tab centered in viewport

- **Device rotation (portrait ↔ landscape)**: 
  - When user rotates device while filter panel is open, panel remains open and resizes to fit new viewport height (never exceed 50%)
  - Active filter selections persist through rotation
  - Carousel tabs re-flow to fit new width; active tab remains visible and highlighted

- **Filter panel state across navigation**:
  - Closing the filter panel on Coaching Resources → navigating to Player Resources → returning to Coaching Resources: panel state is preserved (closed), filters are NOT reset
  - This requires session-level state management (localStorage or in-memory session state)

- **No results state**: 
  - When filters result in zero matching resources, grid shows "no results" message with emoji and "Clear filters" button
  - Filter panel remains interactive (user can adjust or clear filters without closing panel)

- **Mobile to desktop transition**:
  - User opens filter panel on mobile (< 768px), panel is visible as overlay/slide-in
  - User resizes browser or rotates to landscape (transitions to >= 768px breakpoint)
  - Filter panel should automatically show/display as part of normal desktop layout (since it's hidden by `md:hidden` on desktop, it needs to be visible or toggled back to visible state)

- **Rapid filter toggling**: If user rapidly taps multiple filter buttons, all taps are registered and applied immediately without lag or dropped events. No debounce that would cause missed taps.

---

## Requirements

### Functional Requirements

- **FR-001**: Filter panel on mobile (< 768px) MUST open without console errors when toggle button is clicked; JavaScript errors must be captured and logged for debugging
- **FR-002**: Filter selections on mobile MUST be applied immediately upon toggle (no "Apply" button needed) and preserved during the session; filter state MUST survive page navigation within the same resource section
- **FR-003**: Resource tabs MUST render as a horizontal scrollable carousel on mobile breakpoint (< 768px); tabs MUST stack vertically or display as standard tabs on desktop (>= 768px)
- **FR-004**: Carousel MUST support native touch swipe/scroll gestures for left/right navigation and MUST support mouse wheel scrolling on desktop; scroll behavior MUST be smooth and momentum-based on touch devices
- **FR-005**: Filter panel height on mobile MUST not exceed 50% of viewport; panel MUST be scrollable internally if filters exceed available height
- **FR-006**: Filter panel MUST auto-collapse when user scrolls down more than 100px in the resource list; auto-collapse MUST complete within 300ms
- **FR-007**: All filter buttons MUST have a minimum touch target size of 44px (height and width) per WCAG AA standards
- **FR-008**: All filter interactions MUST be keyboard accessible: Tab key to navigate between buttons, Enter or Space to toggle filter state, visible focus indicators on all interactive elements
- **FR-009**: Filter panel toggle button MUST display active filter count when filters are applied (e.g., "2 active") instead of result count
- **FR-010**: Clear Filters button MUST reset all active filters and search keyword in a single action
- **FR-011**: Resource tab carousel MUST indicate scroll position/overflow with visual indicators (gradient fade or arrow hints) on edges when content is scrollable
- **FR-012**: Filter state (active filters and panel open/closed state) MUST be initialized on page load from persistent storage (localStorage); if no prior state exists, filters initialize to empty (no active filters) and panel starts in closed state

### Non-Functional Requirements

**Accessibility (WCAG 2.1 AA)**
- **NFR-A-001**: All filter buttons and interactive controls MUST have sufficient color contrast (4.5:1 for text, 3:1 for graphics) against their background
- **NFR-A-002**: Focus indicators MUST be visible on all interactive elements with a minimum contrast of 3:1 and outline width of at least 2px
- **NFR-A-003**: All filter buttons MUST have semantic `aria-pressed` attribute indicating active/inactive state
- **NFR-A-004**: Filter panel toggle button MUST have `aria-expanded` attribute that updates when panel opens/closes
- **NFR-A-005**: Filter panel container MUST have a live region (`aria-live="polite"`) that announces filter changes using the format: "[N] resources found" or "[N] resources found with [filter names] applied" (e.g., "25 resources found with Age (U12) and Category (Conditioning) applied") to provide clear feedback to screen reader users
- **NFR-A-006**: Resource tab carousel MUST support keyboard navigation: Arrow keys (Left/Right) to scroll, Home/End to go to start/end of tabs

**Mobile Interaction & Responsiveness**
- **NFR-M-001**: All touch targets (buttons, filter options) MUST be at least 44px × 44px to accommodate thumb/finger tapping
- **NFR-M-002**: Filter panel MUST render without horizontal overflow on any mobile device (width 320px to 768px)
- **NFR-M-003**: Carousel scroll MUST be smooth and not cause layout shift (use `scroll-behavior: smooth` and stable scroll anchoring)
- **NFR-M-004**: Device rotation (portrait ↔ landscape) MUST not cause filter panel or carousel layout to break; active filters and scroll position MUST be preserved

**Error Handling & Observability**
- **NFR-E-001**: Any JavaScript errors during filter toggle or carousel interaction MUST be caught and logged to console (include error type, message, and stack trace)
- **NFR-E-002**: If filter application fails (e.g., filtering logic throws), system MUST display a recoverable error message ("Failed to apply filters. Try again.") without breaking the UI
- **NFR-E-003**: Filter state changes (apply, clear, auto-collapse) MUST be logged with timestamps for debugging and analytics
- **NFR-E-004**: Carousel scroll errors MUST be handled gracefully; if momentum scroll fails, fallback to stepped scroll

**Performance**
- **NFR-P-001**: Filter toggle response time MUST be < 100ms (measured from click to visual panel movement)
- **NFR-P-002**: Carousel scroll flick response time MUST be < 50ms (perceived as instant)
- **NFR-P-003**: Auto-collapse animation MUST complete within 300ms without janky frame drops (target 60 FPS)

### Key Entities

- **Filter Panel**: Container holding filter controls (buttons for age, category, skill selections, and a "Clear all" button) for resource discovery on mobile; stored in `FilterBar.astro` component; active filters stored in page-level state or component instance
- **Active Filters**: Object with structure `{ age: string[], category: string[], skill: string[] }` representing currently selected filters; sourced from `src/lib/resources/types.ts`
- **Resource Tabs**: Navigation for Coaching Resources, Player Resources, Manager Resources, Guides, Forms; tabs exist on a parent container or layout level above individual resource pages
- **Mobile Breakpoint**: 768px (Tailwind `md:` breakpoint); below 768px = mobile layout (filter button visible, carousel required); >= 768px = desktop layout (filter panel always visible, tabs normal layout)
- **Filter State**: Session-scoped state that persists within a user's session for a given resource section; must survive page navigation but resets on full page reload or session end

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Filter panel toggle works on 100% of test attempts on mobile (no console errors, no broken state) across iOS Safari, Chrome, and Android Chrome
- **SC-002**: Resource tabs carousel renders without horizontal overflow on all tested mobile devices (iPhone SE, iPhone 13, Samsung Galaxy A50, Android 480px min-width) and adapts smoothly to rotation
- **SC-003**: Carousel swipe response time is < 50ms (perceived as instant); momentum scroll momentum feels native on iOS and Android
- **SC-004**: Filter panel auto-collapse initiates within 100ms of detecting >100px downward scroll and completes within 300ms
- **SC-005**: Users can open filter panel, select 1-3 filters, view updated results, and close panel in < 5 seconds on mobile without frustration or needing to re-tap buttons
- **SC-006**: All filter buttons, carousel tabs, and toggle button meet 44px minimum touch target size on any device running the feature
- **SC-007**: Focus indicators on filter buttons are visible and have at least 3:1 contrast ratio when keyboard-navigated
- **SC-008**: After applying filters, the active filter count badge on the toggle button displays immediately (< 100ms) and accurately reflects the number of selected filters
- **SC-009**: Filter state is preserved when user navigates away from a resource section and returns within the same session (e.g., go to Player Resources, return to Coaching Resources, filters still applied)
- **SC-010**: "No results" state displays correctly when all filters result in zero matching resources, and user can clear filters to restore results in a single tap

---

## Non-Goals

The following are explicitly out of scope for this feature and will not be implemented:

- **Server-side filter state persistence**: Filter selections are session-only (not saved to user account or database); filters reset on page reload or session end
- **Advanced filter operators**: No "AND"/"OR" logic, range queries, or complex boolean filters; only simple multi-select for age, category, skill
- **Filter history or "recent filters"**: No tracking of previous filter combinations or quick-access to frequently used filters
- **Search autocomplete**: If search is added, it will be basic keyword matching without autocomplete suggestions or faceted search
- **Resource recommendations**: No ML-based or popularity-based suggestions based on applied filters
- **Filter analytics dashboard**: Filter events will be logged for debugging but not exposed in a user-facing analytics dashboard
- **Bulk filter management**: Users cannot save filter presets or templates for reuse
- **Nested or hierarchical filters**: All filters are flat; no parent-child relationships (e.g., cannot filter "U12 Defence" as a combined criterion)

---

## Acceptance Criteria

**P1 Story: Filter Panel Interaction**

1. **Given** I am on the Coaching Resources page on mobile (< 768px width) **When** I tap the "Show filters" button **Then** a filter panel slides/fades into view with the label text changing to "Hide filters" and the toggle button's `aria-expanded` attribute set to "true"

2. **Given** the filter panel is visible on mobile **When** I tap an age filter button (e.g., "U12") **Then** the button's background color changes to the active state (brand-purple), `aria-pressed` attribute becomes "true", the filter is added to the active filters, and the resource grid immediately updates to show only matching resources

3. **Given** filters are currently active (e.g., age="U12") **When** I view the "Show filters" button **Then** it displays a badge or inline text showing "2 active" (count of selected filters) instead of the result count

4. **Given** the filter panel is open **When** I tap the "Hide filters" button (previously "Show filters") **Then** the panel slides/fades out of view, label reverts to "Show filters", `aria-expanded` becomes "false", and active filters are preserved

5. **Given** multiple filters are active (e.g., age + category) **When** I tap the "Clear all filters" button **Then** all filters are deselected in a single action, all filter buttons return to inactive state, the resource grid shows all resources, and the active filter count badge is hidden

6. **Given** I have applied filters on Coaching Resources and I navigate to Player Resources **When** I return to Coaching Resources later in the same session **Then** the same filters are still applied and the filter panel is in the same open/closed state as I left it

**P2 Story: Resource Tabs Carousel**

7. **Given** I am on the resources page on mobile (< 768px width) **When** I view the resource section tabs (Coaching Resources, Player Resources, Manager, Guides, Forms) **Then** they are displayed in a horizontal, left-to-right scrollable carousel, not stacked vertically

8. **Given** the carousel contains more tabs than fit in the viewport **When** I swipe left on the tab area **Then** the carousel scrolls left smoothly, revealing tabs that were hidden on the right side

9. **Given** I have scrolled the carousel partway **When** I reach the leftmost tab **Then** the carousel cannot scroll further left (boundary stop), and the leftmost tab is fully visible without cutting off

10. **Given** a resource section tab is currently active (e.g., "Coaching Resources") **When** I view the carousel **Then** that tab is visually highlighted (distinct background, border, or underline) and is positioned within the visible viewport area

11. **Given** the carousel has fewer than 3 tabs **When** I load the page **Then** all tabs fit in the viewport horizontally and the carousel does not scroll (no visible scroll indicators)

**P3 Story: Filter Panel Size & Auto-Collapse**

12. **Given** the filter panel is open on mobile **When** I scroll down 100px or more in the resource list **Then** the filter panel smoothly slides up out of view within 300ms, the toggle button remains sticky at the top, and I can still tap it to reopen the filter panel

13. **Given** the filter panel has auto-collapsed due to downward scroll **When** I scroll back to the top of the page **Then** the filter panel remains collapsed until I explicitly tap the toggle button

14. **Given** the filter panel is open **When** I view the screen **Then** the panel does not exceed 50% of the viewport height, leaving at least 50% of the screen for resource content

15. **Given** the filter panel contains many filter options and exceeds the max height **When** I view the panel **Then** the panel is scrollable internally (users can scroll within the panel to see all options) and the "Clear all filters and search" button remains sticky at the bottom of the panel, always visible and actionable without requiring scrolling to the bottom

16. **Given** the filter panel is open on mobile (< 768px) **When** the viewport resizes to desktop width (>= 768px) or device rotates to landscape with sufficient width **Then** the filter panel automatically transitions from overlay/slide-in mode to the standard desktop sidebar layout, remaining visible as part of the normal layout without requiring a toggle button

---

## Integration Points

This feature integrates with:

- **FilterBar.astro**: Component that renders the filter toggle button, filter panel, and filter controls. Currently has `data-mobile-filter-shell` and inline script for toggle behavior. P1 work focuses on fixing bugs in this component's interaction handling.

- **src/lib/resources/filters.ts**: Core filtering logic that applies age, category, skill filters to resource arrays. This logic is unchanged; P1 focuses on the UI interaction, not the filtering algorithm.

- **Coaching Resources & Player Resources pages**: Pages that use FilterBar and should support mobile filters. The carousel (P2) may require a new parent layout component to manage tabs above the individual resource pages.

- **Responsive breakpoint**: Uses Tailwind's `md:` breakpoint (768px). Mobile layout applies below 768px; desktop layout applies at 768px and above.

- **Filter state management**: Currently page-level state; may require elevation to a session-level context or localStorage if state must survive cross-page navigation (Story 1, Scenario 6 requires this).

---

## Constitutional Compliance

**Principle I: User Outcomes First**
- ✅ PASS: Each user story has explicit, measurable acceptance criteria. SC-001 measures "100% of test attempts", SC-003 measures "< 50ms response time", etc. Success is defined by observable user behavior: opening filter panel, selecting filters, viewing results.

**Principle II: Test-First Discipline**
- ✅ PASS: All acceptance criteria are independently testable. Each AC defines Given-When-Then scenarios that can be tested without other features. Filter toggle can be tested in isolation (P1), carousel scroll can be tested independently (P2).

**Principle III: Backend Authority & Invariants**
- ✅ PASS: This feature is entirely client-side UI interaction. Filter logic resides in `src/lib/resources/filters.ts` on the client (legitimate for client-side resource filtering). No server mutation or invariant enforcement is required. Filter state is filtered resources, not authoritative data.

**Principle V: AppShell Integrity**
- ✅ PASS: Filter panel does not break or replace AppShell navigation. Filter panel is an overlay/slide-in on mobile, staying within the main content area. Resource tabs (P2) remain within the app structure and do not create custom navigation shells.

**Principle VI: Accessibility First**
- ✅ PASS: All touch targets are 44px minimum (FR-007). Keyboard accessibility required (FR-008): Tab, Enter, Space, Arrow keys all specified in acceptance criteria. ARIA attributes (`aria-pressed`, `aria-expanded`) are required. Focus indicators with 3:1 contrast required. Live regions for announcing filter changes.

**Principle VII: Immutable Data Flow**
- ✅ PASS: Filter state is unidirectional: user selects → active filters update → resource grid re-renders. No client-side inference of server state. Filter state is derived from user selections, not inferred.

**Principle VIII: Dependency Hygiene**
- ✅ PASS: Feature uses existing dependencies (Tailwind, Astro). No new third-party carousel or filter libraries are introduced in this spec. Carousel is implemented using native HTML scroll with CSS and vanilla JavaScript.

**Principle IX: Cross-Feature Consistency**
- ✅ PASS: FilterBar component already exists and follows established patterns. Carousel implementation will follow patterns used in `HeroCarousel.astro` and `HeroCircularCarousel.astro` (existing carousel components in codebase). No new patterns introduced; reuses established component structure.

---

## Open Questions & Design Decisions

- **P3 Scroll Behavior**: RESOLVED - Panel remains collapsed until user explicitly taps the toggle button (AC-13), providing predictable and consistent behavior.

- **Filter State Persistence Mechanism**: RESOLVED - Filter state (active filters and panel open/closed state) MUST be initialized on page load from localStorage (FR-012). If no prior state exists, filters initialize to empty and panel starts in closed state.

- **Carousel Scroll Indicators**: RESOLVED - Scroll indicators use CSS gradient fade on left and right edges (AC-6, P2 Story), providing visual consistency with the design system.

---

## Testing Strategy

This feature is testable across three dimensions:

1. **Functional Testing**: All acceptance criteria can be tested manually on mobile/tablet/desktop browsers (Safari, Chrome, Firefox). No backend mocking needed since filters are client-side.

2. **Device Testing**: Test on real devices (iPhone, Android) and emulators. Specific test devices recommended: iPhone SE (small screen), iPhone 13 (standard), Samsung Galaxy A50 (Android).

3. **Accessibility Testing**: Use keyboard navigation (Tab, Arrow keys) and screen readers (NVDA, JAWS, VoiceOver) to verify ARIA attributes and focus management.

4. **Integration Testing**: Verify filter state persists when navigating between resource sections (Coaching → Player → Coaching). Verify carousel scroll doesn't affect filter state or panel visibility.
