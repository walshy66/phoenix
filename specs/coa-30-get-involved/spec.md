# Feature Specification: Get Involved Events Page Redesign

**Feature Branch**: `COA-30-get-involved-events`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "The tiles in upcoming events should click to 'more details' of that event, we need a past events section on this page too, so people can see the past things we've done."

## User Scenarios & Testing

### User Story 1 - Browse Upcoming Club Events (Priority: P1)

A visitor arrives at the Get Involved/Events page and wants to see what's happening soon at Bendigo Phoenix. They should be able to scan a list of upcoming events presented as clickable tiles.

**Why this priority**: Core value — this is the primary entry point for members and potential members to discover what the club is doing. Without this, the page has no purpose.

**Independent Test**: Can be fully tested by navigating to `/get-involved/events` and verifying that event tiles display upcoming events. Delivers immediate value as a browsable event list.

**Acceptance Scenarios**:

1. **Given** the Get Involved/Events page is loaded, **When** the user views the page, **Then** upcoming events are displayed as clickable tiles with event details (name, date, image)
2. **Given** the user is viewing event tiles, **When** they click on a tile, **Then** a "more details" view opens showing full event information
3. **Given** an event tile is clicked, **When** the detail view loads, **Then** it displays relevant event metadata (date, time, location, description, etc.)

---

### User Story 2 - Explore Past Club Activities (Priority: P1)

A prospective member or current member wants to see what the club has done historically. They should be able to access a dedicated section showing past events so they understand the club's activity level and scope.

**Why this priority**: Essential for brand/community narrative — showcasing past activities builds confidence in the club's consistency and engagement. P1 because it's a core UX requirement explicitly stated in the issue.

**Independent Test**: Can be fully tested by verifying that a "Past Events" section is accessible and displays historical events independently of the upcoming events section. Delivers value even if upcoming events are minimal.

**Acceptance Scenarios**:

1. **Given** the Get Involved/Events page is loaded, **When** the user scrolls down or looks for past content, **Then** a "Past Events" section is clearly visible
2. **Given** the Past Events section is visible, **When** the user views past event tiles, **Then** they display event details (name, date, image)
3. **Given** the user clicks on a past event tile, **When** the detail view opens, **Then** it shows the archived event information
4. **Given** the page structure, **When** the user navigates between current and past sections, **Then** the distinction between upcoming and past is visually clear

---

### User Story 3 - Maintainer Updates Events via Claude Code (Priority: P2)

Site maintainers (less technical users) need to easily update events by coming to Claude Code with new event information. They should be able to provide data in a flexible way (pasted lists, natural language, or a mix), and Claude handles the parsing and file updates.

**Why this priority**: Operational efficiency and sustainability — this enables handover to a non-technical owner. P2 because it's a content management concern, but essential for long-term maintenance without developer involvement.

**Independent Test**: Can be fully tested by providing Claude Code with new event data → Claude parses it and updates `src/data/events.md` → verify events appear on the site with correct status. Works independently of the visitor experience.

**Acceptance Scenarios**:

1. **Given** the maintainer has new upcoming events to add, **When** they provide the event data to Claude Code (structured list or natural language), **Then** Claude parses the input and updates the events file
2. **Given** an event date has passed, **When** the maintainer tells Claude Code to mark it as "past", **Then** the event automatically moves from Upcoming to Past Events section on the site
3. **Given** multiple event updates (new events, status changes, metadata updates), **When** they provide all changes in one Claude Code session, **Then** Claude processes all updates correctly and writes a single updated events file
4. **Given** the maintainer provides event data in multiple formats (markdown blocks, JSON, or plain text descriptions), **When** Claude Code receives it, **Then** Claude is flexible enough to parse any format and produce consistent output
5. **Given** an event has moved to past, **When** the maintainer or visitor checks the site, **Then** the event is no longer in Upcoming Events and appears in Past Events with all original details intact

---

### Edge Cases

- What happens when there are no upcoming events? (Display a placeholder message like "No upcoming events scheduled")
- What happens when there are no past events yet? (Hide or show an empty placeholder in the Past Events section)
- How does the page handle very long event descriptions or missing metadata?
- What if an event image fails to load? (Show a fallback placeholder or alt text)
- How are events sorted within each section? (Chronological order — most recent upcoming first, most recent past first)

## Requirements

### Functional Requirements

- **FR-001**: System MUST display upcoming events as clickable tiles on `/get-involved/events`
- **FR-002**: System MUST provide a modal overlay "more details" view when an event tile is clicked
- **FR-003**: The modal detail view MUST display full event information (date, time, location, description, image)
- **FR-004**: System MUST display a dedicated "Past Events" section on the same page, below upcoming events
- **FR-005**: Past event tiles MUST also be clickable and open the same modal detail view
- **FR-006**: System MUST read events from a structured markdown file (`src/data/events.md`) with front-matter blocks
- **FR-007**: System MUST filter events by a `status` field: `status: upcoming` → appears in Upcoming Events; `status: past` → appears in Past Events
- **FR-008**: Claude Code MUST be able to accept event data in multiple formats:
  - Pasted structured list (markdown blocks, JSON, or table format)
  - Natural language instructions ("add 3 new events", "mark these as past", "update date on event X")
- **FR-009**: Site maintainers MUST be able to update events via Claude Code by providing new/modified event data
- **FR-010**: System MUST clearly distinguish between upcoming and past events visually
- **FR-011**: System MUST handle missing or invalid event data gracefully (fallbacks, placeholders)
- **FR-012**: Events MUST be sorted chronologically within each section (upcoming: ascending by date; past: descending by date for most recent first)
- **FR-013**: Modal MUST close when user clicks outside it or on a close button
- **FR-014**: System MUST support events with optional fields (time, location, description) without breaking if absent

### Key Entities

- **Event**: Represents a single club activity stored as a markdown front-matter block
  - **Required attributes**: `id` (unique slug), `title`, `date` (ISO format: YYYY-MM-DD), `image` (relative path or URL), `status` (upcoming | past)
  - **Optional attributes**: `time` (HH:MM format), `location`, `description`, `updated`
  - **Example**:
    ```
    ---
    id: "bendigo-phoenix-vs-albury"
    title: "Bendigo Phoenix vs Albury"
    date: "2026-05-15"
    time: "19:30"
    location: "Bendigo Basketball Stadium"
    description: "Home game — support your team!"
    image: "/images/events/may-match.png"
    status: "upcoming"
    updated: "2026-04-08"
    ---
    ```

- **EventSection**: Logical grouping of filtered events
  - Attributes: title ("Upcoming Events" or "Past Events"), events (filtered array), visibility

### Data Storage Structure

Events are stored in **`src/data/events.md`** as a single markdown file with multiple front-matter blocks, one per event:

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
---
```

Astro will parse these blocks, filter by status, and render them.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Visitors can click on an event tile and view full details in modal without errors
- **SC-002**: Past Events section is visible and populated with correctly filtered events
- **SC-003**: Site maintainers can update events via Claude Code in a single session without developer intervention
- **SC-004**: 100% of event tiles have valid images and metadata (no broken images or missing required fields)
- **SC-005**: Page load time remains under 3 seconds for the full events page (upcoming + past combined)
- **SC-006**: Distinction between upcoming and past events is clear enough that 95%+ of first-time users correctly identify which section is which
- **SC-007**: Claude Code can reliably parse event data in at least 3 different input formats (markdown blocks, JSON, natural language descriptions)
- **SC-008**: Modal overlay opens/closes smoothly with no visual glitches or accessibility issues
- **SC-009**: A non-technical maintainer can successfully add/update/move events after reading a 1-page Claude Code prompt with examples
- **SC-010**: Events file (`src/data/events.md`) remains valid and parseable after each Claude Code update (no syntax errors)
