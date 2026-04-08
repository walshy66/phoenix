# Feature Specification: Get Involved Events Page Redesign

**Feature Branch**: `COA-30-get-involved-events`  
**Created**: 2026-04-08  
**Status**: READY_FOR_DEV  
**Input**: User description: "The tiles in upcoming events should click to 'more details' of that event, we need a past events section on this page too, so people can see the past things we've done."
**Priority**: High (Core community engagement feature)

## User Scenarios & Testing

### User Story 1 - Browse Upcoming Club Events (Priority: P1)

A visitor arrives at the Get Involved page and wants to see what's happening soon at Bendigo Phoenix. They should be able to scan a list of upcoming events presented as clickable tiles, and click to learn more details about each event.

**Why this priority**: Core value — this is the primary entry point for members and potential members to discover what the club is doing. Without this, the page has no purpose.

**Independent Test**: Can be fully tested by navigating to `/get-involved` (events section) and verifying that event tiles display upcoming events with clickable behavior and modal detail views. Delivers immediate value as a browsable event list.

**Acceptance Scenarios**:

1. **Given** the Get Involved page is loaded, **When** the user views the Upcoming Events section, **Then** upcoming events are displayed as clickable tiles with event name, date, and image
2. **Given** the user is viewing upcoming event tiles, **When** they click on a tile, **Then** a modal detail view opens displaying full event information (name, date, time, location, description, image)
3. **Given** an event tile is clicked, **When** the modal opens, **Then** it displays all available event metadata from the events file, with optional fields (time, location, description) gracefully omitted if not provided
4. **Given** there are no upcoming events in the events.md file, **When** the user loads the Upcoming Events section, **Then** a clear placeholder message is displayed (e.g., "No upcoming events scheduled. Check back soon!")
5. **Given** an event has a missing or broken image, **When** the page renders the event tile, **Then** a fallback placeholder image or icon is displayed with alt text describing the event

---

### User Story 2 - Explore Past Club Activities (Priority: P1)

A prospective member or current member wants to see what the club has done historically. They should be able to access a dedicated section showing past events so they understand the club's activity level and scope.

**Why this priority**: Essential for brand/community narrative — showcasing past activities builds confidence in the club's consistency and engagement. P1 because it's a core UX requirement explicitly stated in the issue.

**Independent Test**: Can be fully tested by verifying that a "Past Events" section is accessible and displays historical events independently of the upcoming events section. Delivers value even if upcoming events are minimal.

**Acceptance Scenarios**:

1. **Given** the Get Involved page is loaded, **When** the user scrolls down, **Then** a "Past Events" section is clearly visible below the Upcoming Events section
2. **Given** the Past Events section is visible, **When** the user views past event tiles, **Then** they display event name, date, and image with the same tile styling as upcoming events
3. **Given** the user clicks on a past event tile, **When** the modal opens, **Then** it displays full archived event information (name, date, time, location, description, image)
4. **Given** the page structure, **When** the user compares Upcoming and Past Events sections, **Then** the visual distinction is clear (different section heading, typography, layout, or styling that makes it immediately obvious which section is which)
5. **Given** there are no past events in the events.md file, **When** the user views the past events section, **Then** either: (a) the section is hidden entirely, OR (b) a placeholder message is displayed (implementation choice to be decided before dev)
6. **Given** a user is on a handheld device, **When** they view the Upcoming and Past Events sections, **Then** both sections are responsive and tiles stack in a mobile-friendly grid (1-2 columns) without horizontal overflow

---

### User Story 3 - Maintainer Updates Events via Claude Code (Priority: P2 → P1.5)

Site maintainers (less technical users) need to easily update events by coming to Claude Code with new event information. They should be able to provide data in flexible formats, and Claude Code parses and updates the events file without requiring developer intervention.

**Why this priority**: Operational efficiency and sustainability — without this, events become stale and the feature loses credibility. Upgraded from P2 to P1.5 because event data maintenance is critical for the feature's long-term viability. The visitor-facing feature (US-1, US-2) cannot deliver value if maintainers cannot update events independently.

**Independent Test**: Can be fully tested end-to-end: (1) Maintainer provides event data to Claude Code using the documented interface, (2) Claude Code parses input and updates `src/data/events.md`, (3) Site is redeployed or next build includes changes, (4) Verify events appear on the site with correct status and all metadata. Works independently of visitor experience.

**Acceptance Scenarios**:

1. **Given** the maintainer has new upcoming events to add, **When** they provide the event data to Claude Code using the standard event update prompt/workflow, **Then** Claude parses the input and generates an updated events.md file for the maintainer to review and commit
2. **Given** an event date has passed, **When** the maintainer tells Claude Code to change status from "upcoming" to "past", **Then** the event automatically moves from Upcoming to Past Events section on the next site build
3. **Given** multiple event updates (new events, status changes, metadata updates), **When** they provide all changes to Claude Code in one interaction, **Then** Claude processes all updates in a single batch and produces one consistent events.md file
4. **Given** the maintainer provides event data in flexible formats (markdown bullet list, JSON array, CSV, or natural language description), **When** Claude Code receives it, **Then** Claude parses the input and converts to the correct front-matter block format with all required fields
5. **Given** an event status changes to "past", **When** the site rebuilds with updated events.md, **Then** the event is removed from Upcoming Events and appears in Past Events with all original details (title, date, time, location, image, description) intact
6. **Given** the maintainer is a non-technical user, **When** they read the one-page event update documentation/prompt, **Then** they understand the format and can successfully provide event data without developer help

---

### Edge Cases

- **No upcoming events**: Display a clear placeholder message (e.g., "No upcoming events scheduled. Check back soon!")
- **No past events**: Either hide the Past Events section entirely OR display a placeholder message (implementation to decide before dev, but maintain either/or consistently)
- **Very long descriptions**: Truncate in tile view (e.g., max 100 characters or 2 lines with ellipsis); show full text in modal. Apply consistent text truncation across all event descriptions.
- **Missing optional metadata**: Event tiles and modal gracefully omit time, location, and description if not provided in events.md. No empty fields or broken layout.
- **Image loading failure**: Display a fallback placeholder (e.g., generic event icon or event category badge) with alt text describing the event. Alt text format: "[Event Title] — [Date]"
- **Sorting within sections**:
  - Upcoming: Chronological ascending (earliest/next upcoming first)
  - Past: Chronological descending (most recent past events first)
  - **Tiebreaker**: If two events share the same date, sort alphabetically by title
- **Modal on mobile**: Modal fits within viewport with scrollable content if description is very long. Backdrop dims page content. Close button is large enough (min 44x44px) and positioned clearly.
- **Responsive breakpoints**:
  - Mobile (<640px): 1 tile per row
  - Tablet (640px-1024px): 2 tiles per row
  - Desktop (>1024px): 3-4 tiles per row (matches existing page grid)
- **Date/Time timezone**: All event dates are stored as YYYY-MM-DD (date only, no time component in date field). Time field is optional and stored as HH:MM in local timezone (assumed AEST for Bendigo context). No timezone conversion applied. Site context makes AEST assumption clear.
- **Duplicate event IDs**: If events.md contains duplicate `id` values, system MUST prevent both from rendering (use first occurrence only, log warning on build)

## Requirements

### Functional Requirements

- **FR-001**: System MUST display upcoming events as clickable tiles within the existing `/get-involved` page in a dedicated "Upcoming Events" section
- **FR-002**: System MUST provide a modal overlay detail view when an event tile is clicked, displaying all available event information
- **FR-003**: The modal detail view MUST display full event information: title, date, image, and optional fields (time, location, description) if present in events.md
- **FR-004**: System MUST display a dedicated "Past Events" section on the same `/get-involved` page, below the Upcoming Events section
- **FR-005**: Past event tiles MUST be clickable and open the same modal detail view as upcoming events
- **FR-006**: System MUST read events from a structured markdown file (`src/data/events.md`) with YAML front-matter blocks separated by `---` delimiters
- **FR-007**: System MUST filter events by a `status` field: `status: upcoming` → appears in Upcoming Events section; `status: past` → appears in Past Events section
- **FR-008**: Claude Code MUST be able to accept event data in multiple flexible formats via a documented maintainer workflow:
  - Markdown bullet list or block format
  - JSON array format
  - CSV or table format
  - Natural language instructions (e.g., "add an event on May 15th called Season Launch", "mark the Junior Clinic as past")
- **FR-009**: Site maintainers MUST be able to update events via Claude Code without developer intervention, using a provided event update interface/workflow that produces a valid updated events.md file
- **FR-010**: System MUST visually distinguish between Upcoming Events and Past Events sections using distinct heading styling, section styling, or typography
- **FR-011**: System MUST handle missing event images gracefully by displaying a fallback placeholder icon or badge with event alt text
- **FR-012**: Events MUST be sorted chronologically within each section: upcoming events in ascending order (next upcoming first), past events in descending order (most recent first). Tiebreaker: alphabetical by title.
- **FR-013**: Modal MUST close when user: (a) clicks outside the modal (on backdrop), (b) clicks a close button (×), or (c) presses Escape key. Focus MUST return to the clicked tile after modal closes.
- **FR-014**: System MUST support events with optional fields (time, location, description) without breaking layout if absent. Required fields: id, title, date, image, status.
- **FR-015**: System MUST validate events.md on build; invalid events (missing required fields, malformed dates, duplicate IDs) MUST be logged as build warnings but not block deployment
- **FR-016**: Each event tile MUST include event title, date, and image. Optional fields (time, location) MAY be shown in tile if space allows, or revealed only in modal detail view.

### Key Entities

- **Event**: Represents a single club activity stored as a YAML front-matter block in events.md
  - **Required attributes**: 
    - `id` (string): Unique slug (kebab-case, e.g., "bendigo-phoenix-vs-albury"). Used for deduplication. MUST be unique within events.md.
    - `title` (string): Event name (e.g., "Bendigo Phoenix vs Albury")
    - `date` (string): Event date in ISO format YYYY-MM-DD (e.g., "2026-05-15"). Used for filtering (upcoming vs past) and sorting. Comparison: if date >= today → upcoming; if date < today → past.
    - `image` (string): Image path. Format: relative path starting with `/` (e.g., "/images/events/may-match.png"). Resolves from public/ directory. If missing/broken, fallback placeholder is shown.
    - `status` (string): Either "upcoming" or "past". Controls which section event appears in. MUST be one of these two values.
  
  - **Optional attributes**: 
    - `time` (string): Event start time in HH:MM format (24-hour, e.g., "19:30"). Timezone: AEST (Bendigo local). Can be omitted if event is all-day or time unknown.
    - `location` (string): Event venue/location (e.g., "Bendigo Basketball Stadium"). Can be omitted for virtual events or if location TBD.
    - `description` (string): Event description/details (plain text or markdown). Max suggested length: 500 characters for readability. Can be omitted if minimal details needed.
    - `updated` (string): ISO date when event was last updated (e.g., "2026-04-08"). Optional; used for maintainer reference only, not displayed on frontend.
  
  - **Example**:
    ```markdown
    ---
    id: "bendigo-phoenix-vs-albury"
    title: "Bendigo Phoenix vs Albury"
    date: "2026-05-15"
    time: "19:30"
    location: "Bendigo Basketball Stadium"
    description: "Home game — support your team! Come cheer on the Phoenix."
    image: "/images/events/may-match.png"
    status: "upcoming"
    updated: "2026-04-08"
    ---
    ```

- **EventSection**: Logical UI grouping of filtered events
  - `title`: "Upcoming Events" or "Past Events"
  - `events`: Array of Event objects after filtering by status and sorting chronologically
  - `visibility`: true if section should render, false if hidden (e.g., if no past events and decision is to hide empty section)

### Data Storage Structure

Events are stored in **`src/data/events.md`** as a single markdown file with multiple YAML front-matter blocks, one per event. Each block is separated by `---` delimiters on their own lines.

```markdown
---
id: "event-slug-1"
title: "Event Title"
date: "2026-05-15"
time: "19:30"
location: "Location Name"
description: "Event description here"
image: "/images/events/event-image.png"
status: "upcoming"
updated: "2026-04-08"
---

---
id: "event-slug-2"
title: "Another Event"
date: "2026-06-20"
image: "/images/events/another-event.png"
status: "upcoming"
---

---
id: "past-event-1"
title: "Past Event"
date: "2026-03-10"
image: "/images/events/past-event.png"
status: "past"
updated: "2026-03-15"
---
```

**File Format Rules**:
- Each event is a separate front-matter block delimited by `---` on its own line (top and bottom)
- YAML is whitespace-sensitive; use consistent indentation (no tabs, use spaces)
- String values should be quoted if they contain special characters or colons
- No markdown body content between blocks (blank lines are fine)
- File must be valid YAML to parse correctly on build

**Build-time Processing**:
- Astro reads events.md, parses each front-matter block into an Event object
- Events are filtered by `status` field into two arrays: upcoming and past
- Arrays are sorted chronologically (see FR-012 for sort order)
- Empty sections are either hidden or shown with placeholder message (decision TBD before dev)
- Invalid/malformed events are logged as warnings but don't block build
- Events are passed to the page component for rendering

## Success Criteria

### Measurable Outcomes

- **SC-001**: Visitors can click on an event tile and view full details in a functioning modal overlay. Modal opens without JavaScript errors and displays all available event metadata. Modal closes cleanly via outside-click, close button, or Escape key.

- **SC-002**: Past Events section is visible and populated with correctly filtered and sorted events. If no past events exist, section is either hidden OR shows a clear placeholder message (consistent with product decision).

- **SC-003**: Site maintainers can update events via Claude Code following the documented maintainer workflow, without requiring developer intervention to commit or deploy.

- **SC-004**: 100% of event tiles display valid images. Broken or missing images show a fallback placeholder with alt text. No 404 errors in browser console for event images.

- **SC-005**: Page load time for `/get-involved` page with events section is under 3 seconds (measured on typical network conditions). Event tiles render without layout shift or cumulative layout shift > 0.1.

- **SC-006**: Visual distinction between Upcoming and Past Events sections is clear via heading design, color, typography, or section styling. Heuristic test: non-technical user can immediately identify which section is which without reading text.

- **SC-007**: Claude Code maintainer workflow can reliably parse event data in at least 3 different formats: (1) markdown bullet list, (2) JSON array, (3) natural language description. Produces valid events.md output for all three formats.

- **SC-008**: Modal overlay opens and closes smoothly without visual jank, layout shift, or accessibility issues. Animations are fluid (60fps). Focus management works (focus trap in modal, return to tile on close).

- **SC-009**: A non-technical maintainer (no programming background) reads the one-page event update documentation and successfully provides event data to Claude Code without developer help. First attempt produces valid events.md output.

- **SC-010**: Events file (`src/data/events.md`) remains syntactically valid YAML after each Claude Code update. Build does not fail due to malformed YAML. Invalid individual events are logged as warnings, not errors.

- **SC-011**: All event tiles are responsive and render without overflow or broken layout on handheld (<640px), tablet (640-1024px), and desktop (>1024px) viewports. Tap targets are minimum 44x44px on mobile.

- **SC-012**: Modal is keyboard accessible: Escape closes modal, Tab cycles through focusable elements, focus is trapped within modal while open, focus returns to tile after close. Screen reader announces modal as a dialog and provides close button label.

---

## Acceptance Criteria

### Happy Path: Upcoming Events

**AC-001** Given a visitor loads `/get-involved` page with upcoming events in events.md, When the page renders, Then the Upcoming Events section is visible with event tiles displayed in a responsive grid.

**AC-002** Given event tiles are displayed, When a user clicks on an upcoming event tile, Then a modal overlay opens displaying the full event details (title, date, time if present, location if present, description if present, image).

**AC-003** Given a modal is open with event details, When the user clicks the close button (×), Then the modal closes and focus returns to the clicked event tile.

**AC-004** Given a modal is open, When the user clicks outside the modal (on the backdrop/dimmed area), Then the modal closes cleanly without affecting other page content.

**AC-005** Given a modal is open, When the user presses the Escape key, Then the modal closes and focus returns to the clicked event tile.

### Happy Path: Past Events

**AC-006** Given a visitor loads `/get-involved` page with past events in events.md, When the page renders, Then the Past Events section is visible below Upcoming Events with correctly filtered and sorted past event tiles.

**AC-007** Given past event tiles are displayed, When a user clicks on a past event tile, Then a modal overlay opens displaying the full archived event details in the same format as upcoming events.

**AC-008** Given both Upcoming and Past Events sections are visible, When a visitor views the page, Then the two sections are visually distinct (different headings, styling, or typography) making it immediately clear which events are upcoming vs past.

### Empty States

**AC-009** Given the events.md file has no upcoming events, When the Upcoming Events section renders, Then a clear placeholder message is displayed (e.g., "No upcoming events scheduled. Check back soon!").

**AC-010** Given the events.md file has no past events, When the page renders, Then either: (a) the Past Events section is hidden entirely, OR (b) a placeholder message is displayed (product decision to be made before implementation; must be consistent with SC-002).

### Image Handling

**AC-011** Given an event tile has a missing or broken image path, When the page renders, Then a fallback placeholder icon or badge is displayed instead of a broken image. The placeholder includes alt text describing the event (e.g., "Event icon: [Event Title] — [Date]").

**AC-012** Given a modal is open with event details, When the event has no image, Then the fallback placeholder is displayed in the modal as well, maintaining consistent UX.

### Responsive Design

**AC-013** Given a visitor views the `/get-involved` page on a mobile device (<640px), When the page renders, Then event tiles stack in a single column or 2-column grid without horizontal overflow. Tap targets for tiles are minimum 44x44px.

**AC-014** Given a visitor views the `/get-involved` page on a tablet (640-1024px), When the page renders, Then event tiles display in a 2-3 column grid. Layout remains centered and readable.

**AC-015** Given a visitor views the `/get-involved` page on desktop (>1024px), When the page renders, Then event tiles display in a 3-4 column grid matching the existing page layout. All sections are horizontally aligned.

**AC-016** Given a modal is open on a mobile device, When event description is long, Then the modal content is scrollable within the viewport. The close button remains visible and accessible without scrolling.

### Sorting & Filtering

**AC-017** Given the Upcoming Events section displays multiple events, When the events are rendered, Then they are sorted chronologically in ascending order: next upcoming event first, then subsequent events by date.

**AC-018** Given the Past Events section displays multiple events, When the events are rendered, Then they are sorted chronologically in descending order: most recent past event first.

**AC-019** Given two events share the same date, When they are rendered, Then they are sorted alphabetically by title (tiebreaker) to ensure consistent ordering.

### Optional Fields

**AC-020** Given an event in events.md has no `time` field, When the event tile or modal renders, Then no empty time placeholder is shown. The tile/modal layout adapts gracefully.

**AC-021** Given an event in events.md has no `location` field, When the event tile or modal renders, Then no empty location placeholder is shown.

**AC-022** Given an event in events.md has no `description` field, When the event tile or modal renders, Then the tile shows only title, date, and image. The modal shows only title, date, and image.

### Data Persistence & Maintainer Workflow

**AC-023** Given a maintainer provides new event data to Claude Code using the documented workflow, When Claude processes the input, Then Claude generates an updated events.md file with all new/modified events correctly formatted as YAML front-matter blocks.

**AC-024** Given a maintainer marks an event as "past" via Claude Code, When the site rebuilds with the updated events.md, Then the event no longer appears in Upcoming Events and appears in Past Events section.

**AC-025** Given an event's status is changed from upcoming to past, When the updated site renders, Then all original event details (title, date, time, location, image, description) are preserved intact. No data is lost.

**AC-026** Given Claude Code parses event data in multiple formats (markdown, JSON, natural language), When the output events.md is parsed by the build system, Then the file is syntactically valid YAML with no errors or warnings for valid events.

### Accessibility

**AC-027** Given a visitor uses a keyboard to navigate the `/get-involved` page, When they Tab to an event tile, Then the tile is visually focused and pressing Enter/Space opens the modal.

**AC-028** Given a modal is open and a visitor uses keyboard navigation, When they press Tab, Then focus cycles through all focusable elements within the modal (title, close button, description text) and does not escape to the background page.

**AC-029** Given a modal is open and a visitor uses a screen reader, When the modal opens, Then the screen reader announces the modal as a dialog/modal region and provides the close button label and event title for context.

**AC-030** Given a visitor uses a screen reader, When they navigate the Upcoming and Past Events sections, Then the sections are semantically labeled (headings) and event titles are read clearly along with dates and descriptions.

### Error Handling & Build Validation

**AC-031** Given events.md contains an event with a missing required field (id, title, date, image, or status), When the build process parses the file, Then the invalid event is skipped with a build-time warning logged. Valid events are still rendered.

**AC-032** Given events.md contains an event with an invalid date format (not YYYY-MM-DD), When the build process parses the file, Then the event is skipped with a warning. The build completes successfully and valid events render.

**AC-033** Given events.md contains two events with the same `id` value, When the build process parses the file, Then the first occurrence is used and the duplicate is skipped with a warning logged.

---

## Non-Functional Requirements

### Accessibility

- **NFR-001**: All event tiles MUST be keyboard accessible. Tab navigation MUST focus tiles; Enter/Space MUST open modal.
- **NFR-002**: Modal MUST trap keyboard focus while open. Escape key MUST close modal. Focus MUST return to the tile that opened the modal.
- **NFR-003**: Modal MUST have `role="dialog"` and `aria-modal="true"`. Close button MUST have accessible label (aria-label or text label).
- **NFR-004**: Event sections MUST have semantic HTML headings (h2 or h3). Event titles MUST be marked as headings or in a semantic structure.
- **NFR-005**: Images MUST have alt text. Format: "[Event Title] — [Date]" for events with images, or generic fallback for placeholder images.
- **NFR-006**: Color contrast between section headings and background MUST meet WCAG AA standards (4.5:1 for large text).
- **NFR-007**: Tap targets (event tiles, close button) MUST be minimum 44x44px on mobile devices.

### Responsive Layout

- **NFR-008**: Mobile (<640px): Event tiles stack in 1 column or 2-column grid. Sections full-width with appropriate padding (16px-24px).
- **NFR-009**: Tablet (640-1024px): Event tiles in 2-3 column grid. Sections centered with max-width constraint.
- **NFR-010**: Desktop (>1024px): Event tiles in 3-4 column grid matching existing `/get-involved` page layout. Grid gap consistent with rest of site.
- **NFR-011**: Modal MUST be mobile-responsive: max-width 90vw on mobile, max-height 90vh with scrollable content. Backdrop opacity and blur applied.
- **NFR-012**: No horizontal overflow on any viewport. Content layers MUST not exceed viewport width.

### Performance

- **NFR-013**: Full `/get-involved` page load (including events section) MUST complete in < 3 seconds on typical network (4G). Measured via Lighthouse or equivalent.
- **NFR-014**: Cumulative Layout Shift (CLS) for events tiles MUST be < 0.1 to avoid jank when page first renders.
- **NFR-015**: Modal open/close animations MUST be smooth (60fps). No frame drops or stuttering visible to user.
- **NFR-016**: Events.md file size MUST remain manageable (< 100KB) to avoid build slowdown. If future growth expected, document pagination strategy.

### Error Handling & Observability

- **NFR-017**: Missing required event fields (id, title, date, image, status) MUST be caught at build time. Invalid events skipped with clear warning message logged to build output.
- **NFR-018**: Malformed YAML in events.md MUST NOT crash build. Parser MUST log specific error (line number, reason). Valid events still render.
- **NFR-019**: Broken image paths MUST NOT cause 404 errors visible to user. Fallback placeholder displayed. 404 logged to server for maintainer awareness.
- **NFR-020**: Duplicate event IDs MUST be detected at build time. First occurrence used, second skipped with warning. No silent data loss.

### Data Integrity

- **NFR-021**: Events read from events.md at build time are immutable in production. No client-side mutations. State limited to modal open/close.
- **NFR-022**: Date field MUST be validated as YYYY-MM-DD format. Invalid dates skipped with warning.
- **NFR-023**: Status field MUST be one of: "upcoming" or "past". Any other value causes event to be skipped with warning.

### Code Patterns & Consistency

- **NFR-024**: Implementation MUST follow existing Astro component patterns used in scr/components/ (ScoreCard, ResourceCard, Footer).
- **NFR-025**: Styling MUST use Tailwind utility classes. Responsive breakpoints MUST align with existing site configuration (sm: 640px, md: 768px, lg: 1024px, etc.).
- **NFR-026**: No new external dependencies (npm packages) without justification. Prefer built-in Astro, Tailwind, and browser APIs.
- **NFR-027**: Modal component MUST be reusable. If a modal library (e.g., headless-ui) is introduced, document rationale and ensure it's WCAG-compliant.

---

## Constitutional Compliance

- **✅ Principle I (User Outcomes First)**: Each user story delivers clear, measurable value. US-1 enables event discovery. US-2 builds trust via community narrative. US-3 enables independent maintenance. Success criteria are specific and testable (SC-001 through SC-012).

- **✅ Principle II (Test-First)**: All acceptance criteria are independently testable and observable via browser inspection, keyboard navigation, screen reader testing, and build validation. Error cases (empty state, missing fields, broken images) are specified with expected behavior (AC-009 through AC-033).

- **✅ Principle III (Backend Authority & Invariants)**: Events.md is the single source of truth for event data. Build-time filtering ensures status-based categorization is authoritative. No client-side inference of event status or date-based filtering. Sorting and filtering are deterministic and verifiable at build time.

- **✅ Principle IV (Error Semantics & Observability)**: NFR-017 through NFR-020 define clear error handling: missing fields, malformed YAML, broken images, duplicate IDs all logged at build time with specific warnings. No silent failures. Invalid events skipped but valid events continue rendering.

- **✅ Principle V (AppShell Integrity)**: Events feature integrates into existing `/get-involved` page. No custom navigation shell. Maintains consistent header, footer, and sidebar layout from BaseLayout. Modal overlays are temporary and do not alter page structure.

- **✅ Principle VI (Accessibility First)**: NFR-001 through NFR-007 specify keyboard navigation, focus management, ARIA labels, semantic HTML, color contrast, and tap targets. AC-027 through AC-030 verify keyboard and screen reader accessibility. Modal follows WAI-ARIA dialog pattern.

- **✅ Principle VII (Immutable Data Flow)**: Events loaded from events.md at build time. No client-side data mutations. Modal state (open/close) is ephemeral UI state, not data persistence. Events flow unidirectionally: events.md → build → component → render.

- **✅ Principle VIII (Dependency Hygiene)**: Spec avoids prescribing specific libraries. Uses existing Astro, Tailwind, browser APIs. If modal library added (e.g., headless-ui), must be documented and justified in implementation.

- **✅ Principle IX (Cross-Feature Consistency)**: Implementation follows established patterns: Astro components, Tailwind utilities, responsive grid layout, card-based UI matching ScoreCard/ResourceCard. Modal component designed for reusability in other features.

- **✅ Astro/Tailwind Requirements**: Events.md content parsed into Astro component. Responsive breakpoints follow site conventions (mobile-first, sm/md/lg). Images use optimized relative paths. No custom CSS — Tailwind utilities only.

- **⚠️ Maintainer Workflow Clarity**: US-3 relies on documented Claude Code prompt/workflow for event updates. This is a design concern (not a blocker) — implementation must define how maintainers are onboarded (one-page prompt, Claude Code skill, or documented process). SC-009 requires success on "first attempt" which may need user testing to validate.

---

## Implementation Notes & Decisions TBD

1. **Empty Past Events Section**: Decide before dev: hide empty section OR show placeholder message. Update AC-010 and NFR consistency once decided.

2. **Modal Component**: Decide: build custom modal or use headless-ui (or similar). If external library, document rationale and verify WCAG compliance.

3. **Claude Code Maintainer Workflow**: Define before dev:
   - Is there a documented prompt template maintainers follow?
   - Is there a Claude Code skill or agent for event updates?
   - How is the updated events.md validated before committing?
   - Who reviews and merges the events.md PR?

4. **Image Asset Organization**: Clarify where event images live:
   - `public/images/events/` assumed based on FR-008 paths
   - Document image upload process for maintainers
   - Define image size/format requirements (width, height, aspect ratio, file size)

5. **Today's Date Reference**: Clarify for event filtering:
   - Use server build time as "today"? (events.md generated at build time)
   - Or use client's local time? (events compared at runtime)
   - Recommend: build-time filtering is simpler; document AEST assumption for Bendigo context

6. **Pagination for Many Events**: If 100+ past events expected in future:
   - Design pagination or "load more" strategy now to avoid refactoring
   - Or set cap on visible past events (e.g., last 12 months)

7. **Modal Animation**: Specify animation preference before dev:
   - Fade-in/scale-in for modal entrance?
   - Backdrop blur intensity?
   - Animation duration (250ms, 300ms, etc.)?

8. **Sorting Tiebreaker**: Confirmed: alphabetical by title if same date. Document in events.md examples.
