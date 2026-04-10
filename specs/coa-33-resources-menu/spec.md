# Feature Specification: Resources Menu & Pages

**Feature Branch**: `cameronwalsh/coa-33-resources-menu`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "Resources menu needs to provide options to Coaching Resources and Player Resources pages. Each section needs different content tailored to its audience."

---

## Overview

The Resources section is a top-level navigation entry that splits into two distinct audience lanes:
1. **Coaching Resources** — for coaches and volunteers
2. **Player Resources** — for players and families

This feature requires creating foundational pages and wiring the navigation menu to route between them. **The work can be split into 3 independent parts** that different agents can handle in parallel.

---

## Architecture & Design Context

- **Website**: Bendigo Phoenix basketball club (bendigophoenix.org.au)
- **Stack**: Astro + Tailwind CSS v4
- **Brand Colors**: 
  - Primary Purple: `#573F93`
  - Vegas Gold: `#8B7536`
  - Black: `#111111`
  - Off-White: `#F4F5F7`
- **Deployment**: VentraIP (SFTP from local builds)
- **Content Pattern**: Static pages with client-side interactivity (no backend, no auth for MVP)

---

## User Scenarios & Testing

### User Story 1 – Coach Discovers Coaching Resources (Priority: P1)

A coach or volunteer lands on the website, clicks "Resources" in the main navigation menu, and sees two clear options: Coaching Resources and Player Resources. They click Coaching Resources and are taken to a dedicated page that explains what resources are available for coaches (e.g., training guides, playbooks, schedule management tools).

**Why this priority**: Navigation and discovery are table-stakes for any new section. Without this, the entire Resources feature is inaccessible.

**Independent Test**: Can be tested by simply clicking the menu item and verifying navigation works. Delivers immediate navigation value.

**Acceptance Scenarios**:
1. **Given** user is on any page of the website, **When** they click "Resources" in the main navigation, **Then** they see two clear options/buttons: "Coaching Resources" and "Player Resources"
2. **Given** user has selected the "Resources" menu, **When** they click "Coaching Resources", **Then** they are navigated to `/resources/coaching` (or equivalent route)
3. **Given** user is on the Coaching Resources page, **When** they look at the page header/title, **Then** they see "Coaching Resources" prominently displayed
4. **Given** user is on the Coaching Resources page, **When** they use browser back button or click "Resources" again, **Then** they return to the Resources menu/parent

### User Story 2 – Player Discovers Player Resources (Priority: P1)

A player or family member lands on the website, navigates to Resources, and sees two clear options. They click Player Resources and are taken to a dedicated page that explains what resources are available for players (e.g., training tips, team schedules, registration info).

**Why this priority**: Same as Story 1 — equal importance for the second audience segment. Ensures both paths are discoverable and working.

**Independent Test**: Can be tested independently by verifying the Player Resources route and page structure without relying on coaching content.

**Acceptance Scenarios**:
1. **Given** user clicks "Resources" in navigation, **When** they click "Player Resources", **Then** they are navigated to `/resources/players` (or equivalent route)
2. **Given** user is on the Player Resources page, **When** they look at the page header/title, **Then** they see "Player Resources" prominently displayed
3. **Given** user is on either Resources page, **When** they look at the page, **Then** they see a clear way to navigate back to the Resources menu or home

### User Story 3 – Filter and Discover Coaching Resources (Priority: P1)

A coach lands on the Coaching Resources page and sees a filterable list of training materials. They use age group and skill category filters to narrow down resources relevant to their coaching level and players' age group. Player filters are entirely separate from Coaching filters, with distinct categories specific to each audience (Coaching: Defence, Offence, Drills, Tools; Players: Nutrition, Mental Skills, Rules, Development).

**Why this priority**: Filters are essential for resource discoverability. Without them, large resource lists become unusable; with them, coaches find relevant materials quickly.

**Independent Test**: Can be tested by applying filters and verifying that only matching resources render. Ensures the filtering logic works correctly and improves UX.

**Acceptance Scenarios**:
1. **Given** user is on Coaching Resources page, **When** they view the filter bar, **Then** they see filter button groups for categories (Defence, Offence, Drills, Tools) and age groups (U12, U14, U16+)
2. **Given** user clicks a filter button (e.g., "Defence"), **When** the filter is applied, **Then** only resources with that category display and the button shows a selected/active state
3. **Given** user has one or more filters active, **When** they click a selected filter button, **Then** the filter is deselected and all matching resources return to view
4. **Given** user applies filters that result in no matching resources, **When** no resources render, **Then** a "No results" message displays with a prominent "Clear filters" button (or "Reset filters" link) allowing one-click removal of all active filters to restore full view
5. **Given** user applies filters and then reloads the page, **When** the page reloads, **Then** filters reset to default (no filters active) and all resources display
6. **Given** user applies filters on desktop, **When** they view the sticky filter bar, **Then** the bar remains visible while scrolling through resources without blocking more than 15% of viewport. Implementation: CSS `position: sticky; top: 0; z-index: 10;` ensures bar sticks below navbar. Bar height must be optimized (e.g., 60-80px on desktop, 80-100px on mobile) so it does not cover resource cards. Bar background must have full opacity and contrast to ensure readability behind it

### User Story 4 – Resources Menu Visual Consistency (Priority: P2)

The Resources menu item is styled consistently with other main navigation items and uses brand colors appropriately. It's clear this is a navigation entry point, and the visual hierarchy matches the rest of the site.

**Why this priority**: Design consistency ensures a professional, cohesive experience. Not blocking functionality but important for UX polish.

**Independent Test**: Can be tested by visual inspection and QA of the menu rendering across desktop, tablet, and mobile.

**Acceptance Scenarios**:
1. **Given** user views the main navigation, **When** they look at "Resources", **Then** it is styled with brand colors and matches the visual weight of other top-level menu items
2. **Given** "Resources" is hovered or focused, **When** a submenu or dropdown appears, **Then** the submenu clearly shows the two options (Coaching/Player) with consistent styling
3. **Given** user is on a mobile device, **When** they view the navigation, **Then** the Resources menu and its options are accessible and readable

### User Story 5 – Keyboard Navigation for Filter Controls (Priority: P1)

A user with keyboard-only access navigates to Coaching Resources and uses Tab, Shift+Tab, and arrow keys to select filters without a mouse.

**Why this priority**: Accessibility is a core principle. Keyboard-only users must be able to access all functionality. Filters are a key feature, so they must be fully keyboard-navigable.

**Independent Test**: Can be tested by removing mouse access and navigating filters using keyboard only. Verifies WCAG 2.1 AA compliance for keyboard navigation.

**Acceptance Scenarios**:
1. **Given** user has keyboard-only access, **When** they Tab through the page, **Then** all filter buttons receive keyboard focus (visible focus indicator with at least 3:1 contrast ratio)
2. **Given** a filter button is focused, **When** user presses Enter or Space, **Then** the filter is toggled on/off and resources update without page reload
3. **Given** multiple filter buttons in a group are visible, **When** user is focused on one filter button and presses Left/Right arrow keys, **Then** focus moves to the previous/next filter button in that group (logical keyboard navigation within group). When reaching the last button, Left arrow wraps to first button in group; when reaching first button, Right arrow wraps to last button in group
4. **Given** user is on the last filter button, **When** they press Down arrow, **Then** focus moves to the next category group (e.g., from age group to category). Down arrow is optional/advisory for moving between filter groups; focus can also advance via Tab
5. **Given** user has focused filters active, **When** they press Tab to move to the next control, **Then** all focused filters remain visually highlighted during navigation

### User Story 6 – Mobile Experience for Resources Pages (Priority: P1)

A player accesses Coaching Resources on a mobile phone (320px width) and can read, filter, and interact with resources without horizontal scrolling or tiny touch targets.

**Why this priority**: Mobile traffic is significant; filters must be fully functional and usable on small screens. Touch targets must meet WCAG guidelines.

**Independent Test**: Can be tested by viewing pages on 320px viewport (Chrome DevTools mobile emulation). Verifies no horizontal overflow and touch targets are at least 44x44px.

**Acceptance Scenarios**:
1. **Given** user is on a mobile device (320px width), **When** they view the filter bar, **Then** filter buttons wrap to multiple rows without horizontal overflow and remain fully visible
2. **Given** user is on mobile, **When** they interact with filter buttons, **Then** each button's touch target is at least 44x44px (WCAG mobile guidelines) with adequate spacing between buttons
3. **Given** filter bar is sticky on mobile, **When** user scrolls to view resources, **Then** filter bar remains visible and occupies no more than 15% of viewport (allowing resources to be visible)
4. **Given** user is on mobile, **When** they view resource cards, **Then** all text is readable (minimum 16px font size or readable with standard mobile zoom) and cards are fully tappable
5. **Given** user is on mobile, **When** they apply a filter, **Then** the page scrolls to show the first resource card (no content hidden above the fold)

---

## Work Breakdown: 3 Independent Parts

The feature can be delivered as **3 independent parallel streams**. Each part is fully testable and deployable on its own.

### **Part A: Resources Menu Routing & Navigation** (COA-33a)

**What**: Wire up the Resources menu item in the main navigation and create a gateway/router page (or landing page) that displays two clear options: Coaching Resources and Player Resources. Handle menu state and routing logic.

**Deliverables**:
- Update main navigation component (`src/components/Navbar.astro`) to include a "Resources" entry
- Create a Resources index/landing page (`src/pages/resources/index.astro`) that presents two clearly clickable option buttons
- Implement routing to `/resources/coaching` and `/resources/players` paths via Astro file-based routing
- Ensure Resources menu item is visually distinct and brand-compliant (use purple `#573F93` and gold `#8B7536`)
- Add breadcrumb navigation on the Resources index page: `<nav aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li>Resources</li></ol></nav>` (HTML structure with semantic nav, aria-label, and matching site styling)
- Create `/resources/index.astro` as a gateway page with:
  - Page title: "Resources"
  - Hero section introducing two audience paths (Coaching vs. Players)
  - Two large, clickable buttons: "Coaching Resources" and "Player Resources"
  - Brief descriptions under each button explaining the target audience
  - Responsive design matching existing site layout

**File Structure**: Use Astro file-based routing (standard `.astro` file placement):
```
src/
  pages/
    resources/
      index.astro           (gateway/landing page)
      coaching.astro        (Coaching Resources page)
      players.astro         (Player Resources page)
  components/
    Navbar.astro            (updated to include Resources menu item)
  data/
    resources.md            (resource definitions with separate coaching/player categories)
```

**Dependencies**: None. Can be completed independently.

**Acceptance**:
- Menu item appears in navigation across all pages with proper styling
- Clicking "Resources" in navbar navigates to `/resources/index.astro`
- Landing page displays two prominent buttons: "Coaching Resources" and "Player Resources"
- Clicking each button navigates to the correct route (`/resources/coaching` or `/resources/players`)
- Menu item styling uses brand colors and matches visual hierarchy of other top-level nav items
- Landing page is responsive (works on mobile 320px, tablet 768px, desktop 1024px)
- Breadcrumb or back navigation is visible on landing page

**Testing**: Visual QA + link testing + responsive design testing. No content dependencies.

---

### **Part B: Coaching Resources Page** (COA-33b)

**What**: Create a dedicated Coaching Resources page (`/resources/coaching`) with structure, layout, and placeholder content zones ready to be filled by coaches. This page is the home for coaching-focused materials (e.g., training guides, playbooks, tools like the court time calculator).

**Deliverables**:
- Create `/resources/coaching` page component
- Define page layout/sections (e.g., hero, introduction, resources grid/list, call-to-action)
- Add page title and meta tags
- Include navigation back to Resources menu or home
- Set up content zones or sections (marked as placeholders for future content)
- Apply brand colors and Tailwind styling

**Dependencies**: Part A must be complete (routing), but the page itself is self-contained.

**Acceptance**:
- Page renders at correct route
- Page title clearly identifies it as "Coaching Resources"
- Layout is responsive (mobile, tablet, desktop)
- Sections are labeled and styled (placeholders for content are acceptable)
- Navigation back to parent/home works
- Filter bar displays with category and age group filter buttons
- Filters are fully functional (clicking toggles selection, resources update)
- Filter buttons are keyboard-accessible (Tab, Enter/Space, arrow keys work)
- Touch targets on mobile are at least 44x44px with no horizontal overflow
- "No results" message displays when filters return zero resources
- Broken resource links are logged (see Logging & Observability section)

**Testing**: Page rendering + responsive design QA + filter interaction testing + keyboard navigation testing + mobile testing.

---

### **Part C: Player Resources Page** (COA-33c)

**What**: Create a dedicated Player Resources page (`/resources/players`) with structure, layout, and placeholder content zones ready to be filled by club staff. This page is the home for player-focused materials (e.g., team schedules, training tips, registration info).

**Deliverables**:
- Create `/resources/players` page component
- Define page layout/sections (e.g., hero, introduction, resources grid/list, call-to-action)
- Add page title and meta tags
- Include navigation back to Resources menu or home
- Set up content zones or sections (marked as placeholders for future content)
- Apply brand colors and Tailwind styling

**Dependencies**: Part A must be complete (routing), but the page itself is self-contained.

**Acceptance**:
- Page renders at correct route
- Page title clearly identifies it as "Player Resources"
- Layout is responsive (mobile, tablet, desktop)
- Sections are labeled and styled (placeholders for content are acceptable)
- Navigation back to parent/home works
- Filter bar displays with category and age group filter buttons
- Filters are fully functional (clicking toggles selection, resources update)
- Filter buttons are keyboard-accessible (Tab, Enter/Space, arrow keys work)
- Touch targets on mobile are at least 44x44px with no horizontal overflow
- "No results" message displays when filters return zero resources
- Broken resource links are logged (see Logging & Observability section)

**Testing**: Page rendering + responsive design QA + filter interaction testing + keyboard navigation testing + mobile testing.

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST render a "Resources" menu item in the main navigation on all pages
- **FR-002**: System MUST route `/resources` to a gateway page or index that lists two options: Coaching Resources and Player Resources
- **FR-003**: System MUST route `/resources/coaching` to a dedicated Coaching Resources page
- **FR-004**: System MUST route `/resources/players` to a dedicated Player Resources page
- **FR-005**: Clicking a Resources option MUST navigate to the correct route without page reload errors
- **FR-006**: Users MUST be able to navigate back to the Resources menu or home from either sub-page
- **FR-007**: All Resources pages MUST render correctly at mobile (320px width), tablet (768px width), and desktop (1024px width) breakpoints with: (1) no horizontal scrolling, (2) readable text (minimum 16px font or readable with standard zoom), (3) tappable buttons (44x44px minimum touch target), (4) no content hidden above the fold on mobile after applying filters
- **FR-008**: Resources menu item styling MUST use brand colors (primary purple `#573F93`, accent gold `#8B7536`) and match the visual hierarchy of other main nav items
- **FR-009**: System MUST provide filter controls on both Coaching and Player Resources pages with category and age group filter buttons. Filter logic: Multiple selections within the same category type (e.g., Defence AND Offence) use OR logic (show resources matching ANY selected category). Selections across different category types (e.g., Defence + U12) use AND logic (show resources matching BOTH criteria). Example: "Defence OR Offence" AND "U12" returns resources tagged with (Defence or Offence) and U12 age group
- **FR-010**: System MUST allow users to apply/remove filters and update displayed resources in real-time without page reload. Filters are exclusive per resource: a resource appears if it matches the selected criteria (not multiple resources per filter selection)
- **FR-011**: System MUST display a "No results" message with a "Clear filters" button when applied filters return zero matching resources
- **FR-012**: All filter buttons MUST be keyboard-accessible and support Tab, Enter/Space, and arrow key navigation per WCAG 2.1 AA standards
- **FR-013**: System MUST render filter buttons with touch targets of at least 44x44px on mobile devices
- **FR-014**: System MUST log filter interactions (filter name, selected value, timestamp) to analytics/telemetry for usage insights
- **FR-015**: System MUST log broken resource links with resource ID and URL for monitoring. Broken links include: HTTP 4xx/5xx status codes, request timeouts (>5 seconds), redirect loops, CORS failures, or failed image loads (onerror event). Log details: event_type, page, resource_id, resource_url, http_status/error_type, timestamp

### Non-Functional Requirements

- **NFR-001**: All pages MUST load within 2 seconds on simulated 3G connection (measured via Lighthouse performance audit with 3G throttling in Chrome DevTools)
- **NFR-002**: All pages MUST be responsive and render correctly at 320px (mobile), 768px (tablet), and 1024px (desktop) breakpoints
- **NFR-003**: All interactive elements MUST pass WCAG 2.1 Level AA accessibility standards including color contrast (4.5:1 for text, 3:1 for graphics), keyboard navigation, and focus indicators
- **NFR-004**: All console output MUST be error-free when interacting with filters, applying/removing filters, and navigating between pages (formerly NFR-005)
- **NFR-005**: Filter operations (applying/removing filters, re-rendering resources list) MUST complete within 100ms on desktop devices and 200ms on mobile devices (measured using performance.mark/measure in browser DevTools)

### Key Entities

- **Resources Menu Item**: A navigation entry that triggers discovery of coaching/player resources
- **Resources Landing Page**: A gateway/index page that presents the two audience paths
- **Coaching Resources Page**: A dedicated page for coaching-focused content and tools
- **Player Resources Page**: A dedicated page for player-focused content and schedules

---

## Content Management Strategy

### Resource Data Structure

Each resource object MUST have the following properties:

```
{
  id: string (unique identifier)
  title: string (resource name, max 100 chars)
  description: string (brief description of content, max 300 chars)
  audience: string (one of: "coaching" | "players" — REQUIRED to separate content types)
  category: string (
    if audience="coaching": one of "Defence", "Offence", "Drills", "Tools"
    if audience="players": one of "Nutrition", "Mental Skills", "Rules", "Development"
  )
  ageGroup: string (one of: "U12", "U14", "U16+")
  type: string (one of: "pdf", "link", "video", "document")
  url: string (absolute URL or internal path; external links open in new tab)
  imageUrl: string (optional; fallback icon shown if missing)
  dateAdded: string (ISO 8601 date when resource was added)
}
```

**Constraint**: Resources on the Coaching page MUST have `audience: "coaching"` and categories from the coaching list. Resources on the Player page MUST have `audience: "players"` and categories from the player list. Filter logic MUST respect this separation.

### Adding & Managing Resources

**MVP Approach (Static/Hardcoded)**:
- Resources are defined in `src/data/resources.md` or as a frontmatter array in page components
- New resources are added by editing the data file and rebuilding the site via `npm run build`
- Changes are deployed via SFTP to VentraIP

**Future Expansion**:
- A CMS integration (Decap CMS, Sanity, Prismic) could allow coaches/admins to add resources via a web interface
- A backend API could fetch resources from a database
- For now, the MVP uses static data to avoid backend complexity

### Content Lifecycle

1. **Creation**: Coach or club admin identifies a new resource (URL, PDF, document)
2. **Metadata Entry**: Resource details (title, description, category, age group, type) are documented
3. **Validation**: URL is tested to ensure it's not broken; image (if provided) is verified
4. **Addition**: Resource entry is added to `src/data/resources.md` or page frontmatter
5. **Build & Deploy**: Site is rebuilt and deployed to VentraIP via SFTP
6. **Monitoring**: Broken links are logged and monitored via error tracking

### Content Ownership

- **Coaching Resources**: Managed by coaching staff or designated coach. Owner can add/remove resources from `src/data/resources.md` and trigger rebuilds
- **Player Resources**: Managed by club administrators or player development lead. Owner can add/remove resources from `src/data/resources.md` and trigger rebuilds. All player resources MUST be reviewed and approved by the club president or designated approver before publication to ensure they align with club policies and values
- All resources MUST be reviewed for accuracy, relevance, and appropriateness before publication

### Placeholder Content Strategy

**For MVP launch**, pages MUST include sample resources (e.g., 3-5 example resources per page) in `src/data/resources.md` to demonstrate the filtering system and layout. These sample resources should:
- Cover all filter categories (Coaching: Defence, Offence, Drills, Tools; Players: Nutrition, Mental Skills, Rules, Development)
- Include multiple age groups (U12, U14, U16+) to allow meaningful filter combinations
- Use realistic titles and descriptions (e.g., "Full Court Press Defence Drill - U14", "Nutrition Guide for Young Athletes")
- Link to existing public URLs (team wiki, external guides, or temporary placeholder links) that are verified to be accessible

**Empty state** (when no filters match): Display "No resources match your filters." with "Clear filters" button. Do not leave page blank or show error message.

---

## Logging & Observability

### Filter Interaction Logging

Every time a user applies or removes a filter, the system MUST log:
- `event_type`: "filter_applied" | "filter_removed"
- `page`: "coaching_resources" | "player_resources"
- `filter_category`: "category" | "ageGroup"
- `filter_value`: the selected category or age group (e.g., "Defence", "U12")
- `timestamp`: ISO 8601 datetime
- `user_session_id`: anonymous session ID (no PII)

**Implementation**: For MVP, use Google Analytics 4 (gtag.js) for tracking filter interactions as custom events. If Google Analytics is not configured, fallback to custom logging: send filter events via POST to a custom endpoint (e.g., `/api/logs`) which stores them in a server-side log file or database. Development environments may use browser console logging. Events MUST include: event_type, page, filter_category, filter_value, timestamp, user_session_id (anonymous, no PII).

**Example**:
```javascript
// When user clicks a filter button
logEvent({
  event_type: "filter_applied",
  page: "coaching_resources",
  filter_category: "category",
  filter_value: "Defence",
  timestamp: new Date().toISOString()
});
```

### Broken Link Monitoring

When a resource link fails to load (404, timeout, or redirect failure), the system MUST log:
- `event_type`: "broken_link_detected"
- `page`: "coaching_resources" | "player_resources"
- `resource_id`: the resource's unique ID
- `resource_url`: the URL that failed
- `http_status`: HTTP status code (e.g., 404, 503) or error type (e.g., "timeout")
- `timestamp`: ISO 8601 datetime

**Implementation**: Resource cards should validate links on render. A failed image load (onerror handler) or broken link click should trigger logging. This can be sent to an error tracking service (Sentry, Rollbar, or custom logging endpoint).

**Example**:
```javascript
// In ResourceCard component, when link fails
logError({
  event_type: "broken_link_detected",
  page: "coaching_resources",
  resource_id: resource.id,
  resource_url: resource.url,
  http_status: 404,
  timestamp: new Date().toISOString()
});
```

### Error Tracking

All JavaScript errors that occur during filter operations or resource card rendering MUST be logged with:
- Error message
- Stack trace
- Page and component where error occurred
- Timestamp

This data helps identify issues with filters, missing resources, or broken functionality. Use Sentry or similar service for production error tracking.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: All three parts (menu, index, coaching page, player page) render without console errors or broken links. Measured by: running page in browser DevTools and verifying console is clean (0 errors/warnings related to feature).
- **SC-002**: Users can reach Coaching Resources and Player Resources pages from the main navigation in fewer than 3 clicks. Measured by: clicking "Resources" menu → seeing two options → clicking one of them (3 clicks total). All links should work without errors.
- **SC-003**: Both Resources sub-pages load within 2 seconds on simulated 3G connection. Measured by: running Lighthouse audit in Chrome DevTools with "Throttle: Slow 3G" setting and verifying Largest Contentful Paint (LCP) < 2s.
- **SC-004**: All pages pass responsive design testing across 320px, 768px, and 1024px breakpoints. Measured by: viewing pages in Chrome DevTools device emulation at each breakpoint and verifying: (1) no horizontal scrolling, (2) text is readable without zoom, (3) buttons/links are tappable, (4) filter buttons wrap gracefully on mobile without overflow.
- **SC-005**: Coaching and Player Resources pages have distinct visual treatment (color accents, layout, typography) so users understand they are different audience sections. Measured by: visual inspection showing each page has unique hero color, section headers, and messaging.
- **SC-006**: Back navigation (breadcrumb, back button, or Resources menu link) works reliably, reducing user confusion about page hierarchy. Measured by: clicking back navigation from each Resources page returns user to `/resources` or home without errors.
- **SC-007**: Filter buttons on both Resources pages are fully keyboard-accessible with visible focus indicators. Measured by: navigating to each page using keyboard only (Tab, Shift+Tab, Enter, Space, arrow keys) and verifying all filters can be applied/removed without mouse.
- **SC-008**: Filter logging is functional and events are emitted for each filter interaction. Measured by: opening browser DevTools, applying filters, and verifying console logs or network requests show filter events being recorded.
- **SC-009**: Broken resource links are detected and logged. Measured by: clicking a broken resource link or observing a failed image load, then verifying error is logged to console or error tracking service.

---

## Edge Cases & Notes

- **Nested routing**: Ensure the Resources menu doesn't interfere with other top-level navigation items
- **Mobile UX**: Verify that submenu/options appear clearly on mobile (no hidden dropdowns that aren't tappable)
- **Content placeholders**: Both sub-pages should have clear placeholder areas so it's obvious where future content (blog posts, tools, schedules) will live
- **Future expansion**: Architecture should allow for easy addition of more sub-sections under Resources later (e.g., `/resources/administrators`)
- **SEO metadata**: Each page should have appropriate title and meta tags for search engines

---

## Implementation Notes

- Use Astro's file-based routing for `/resources`, `/resources/coaching`, and `/resources/players`
- Leverage Tailwind CSS v4 for responsive styling and brand color variables
- Keep pages static for MVP (no database, no authentication)
- Follow existing site patterns for layout, navigation, and component reuse
- Consider a shared `ResourcesLayout` component for consistent header/footer/nav across sub-pages

---

## Deployment & Handover

- Each part can be deployed independently via SFTP to VentraIP
- All code should follow existing project conventions (documented in project `.claude/` folder)
- Specs and decisions should be consolidated into reusable patterns for future similar features
