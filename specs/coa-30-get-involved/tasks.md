# Tasks: Get Involved Events Page Redesign (COA-30)

**Spec**: `/specs/coa-30-get-involved/spec.md`  
**Plan**: `/specs/coa-30-get-involved/plan.md`  
**Strategy**: Execution Windows (6 phases grouped into 5 windows)  
**Total Windows**: 5 | **Estimated Scope**: M (20-30 hours)

---

## Format Guide

- **[P]**: Can run in parallel (different files, same window)
- **Window N**: Execution context boundary (fresh context)
- **WINDOW_CHECKPOINT**: Validation gate before next window
- **Scope**: S (small, <2h), M (medium, 2-4h), L (large, 4-8h)
- **Traceability**: Each task traces back to spec (FR-XXX, AC-XXX, US-X)
- **Dependency**: What prior work MUST complete first

---

## Execution Window 1: Foundation & Data Layer

**Purpose**: Build event parsing infrastructure and establish data file structure. BLOCKING: all subsequent work depends on this.

**Token Budget**: 70-80k

**Checkpoint Validation**:
- [ ] `src/data/events.md` created with seed data (5 upcoming, 3 past events)
- [ ] `src/lib/events/types.ts` compiles without errors
- [ ] `src/lib/events/parser.ts` parses valid YAML blocks correctly
- [ ] `src/lib/events/validator.ts` validates required fields and rejects invalid events
- [ ] `src/lib/events/filters.ts` filters by status and sorts chronologically
- [ ] All unit tests in `parser.test.ts` pass (parser, validator, filters)
- [ ] No TypeScript errors or warnings

---

### T001 [P] Create events.md seed data file

**Window**: 1 (Foundation)  
**Phase**: Data Layer  
**Scope**: S  
**Traceability**: FR-006, FR-007  
**Dependencies**: None  
**Description**: Create initial `src/data/events.md` with 5 upcoming and 3 past events using YAML front-matter format specified in plan.md

**What to create**:
- File: `src/data/events.md`
- Format: YAML front-matter blocks (one per event) separated by `---` on own lines
- Content:
  - 5 upcoming events: "Phoenix vs Albury" (2026-05-15), "Junior Clinic" (2026-04-20), "Season Launch" (2026-05-10), "Social Game" (2026-06-01), "Championships" (2026-06-15)
  - 3 past events: "Grand Final 2025" (2025-12-10), "Spring Friendly" (2026-03-15), "Training Camp" (2026-02-28)
  - All required fields: id, title, date (YYYY-MM-DD), image, status
  - Mix of events: some with time/location/description, some without (test optional field handling)

**Examples**:
```markdown
---
id: "phoenix-vs-albury"
title: "Bendigo Phoenix vs Albury"
date: "2026-05-15"
time: "19:30"
location: "Bendigo Basketball Stadium"
description: "Home game — support your team!"
image: "/images/events/may-match.png"
status: "upcoming"
---

---
id: "junior-clinic"
title: "Junior Clinic"
date: "2026-04-20"
image: "/images/events/junior-clinic.png"
status: "upcoming"
---

---
id: "grand-final-2025"
title: "Grand Final 2025"
date: "2025-12-10"
image: "/images/events/grand-final.png"
status: "past"
---
```

**Test**: File is valid YAML, no parsing errors when read by Astro

---

### T002 [P] Create Event type definitions

**Window**: 1 (Foundation)  
**Phase**: Data Layer  
**Scope**: S  
**Traceability**: FR-001, FR-003, FR-014  
**Dependencies**: None  
**Description**: Create TypeScript interfaces for Event and EventSection with proper type safety

**What to create**:
- File: `src/lib/events/types.ts`
- Interfaces:
  - `Event`: Required fields (id, title, date, image, status), optional fields (time, location, description, updated)
  - `EventSection`: { title: 'Upcoming Events' | 'Past Events'; events: Event[]; visibility: boolean }
  - Type guard: `isEvent(obj): obj is Event`
  - Date type: Date strings as YYYY-MM-DD ISO format

**Example**:
```typescript
export interface Event {
  // Required
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  image: string;
  status: 'upcoming' | 'past';
  
  // Optional
  time?: string; // HH:MM
  location?: string;
  description?: string;
  updated?: string; // YYYY-MM-DD
}

export interface EventSection {
  title: 'Upcoming Events' | 'Past Events';
  events: Event[];
  visibility: boolean;
}
```

**Test**: TypeScript compiles without errors, types correctly restrict field values

---

### T003 [P] Create event parser (YAML front-matter)

**Window**: 1 (Foundation)  
**Phase**: Data Layer  
**Scope**: M  
**Traceability**: FR-006, FR-015  
**Dependencies**: T002 (Event types)  
**Description**: Parse YAML front-matter blocks from events.md file

**What to create**:
- File: `src/lib/events/parser.ts`
- Export function: `parseEvents(fileContent: string): { events: Event[]; warnings: string[] }`
- Logic:
  - Split content by `---` delimiters
  - Extract YAML front-matter from each block
  - Parse YAML into Event object
  - Collect warnings for malformed/invalid entries (don't throw)
  - Return: { events: valid Event array, warnings: validation issues }
- Error handling:
  - Malformed YAML → log warning, skip event
  - Missing required fields → log warning, skip event
  - Invalid date format → log warning, skip event
  - Duplicate ID → use first, warn on second

**Example**:
```typescript
export async function parseEvents(fileContent: string) {
  const blocks = fileContent.split(/^---$/m);
  const events: Event[] = [];
  const warnings: string[] = [];
  
  for (const block of blocks) {
    if (!block.trim()) continue;
    try {
      const event = parseBlock(block);
      events.push(event);
    } catch (error) {
      warnings.push(`Failed to parse event: ${error.message}`);
    }
  }
  
  return { events, warnings };
}
```

**Test**: Parses valid YAML, skips invalid blocks with warnings, handles missing/extra fields

---

### T004 [P] Create event validator

**Window**: 1 (Foundation)  
**Phase**: Data Layer  
**Scope**: S  
**Traceability**: FR-015, AC-031, AC-032, AC-033  
**Dependencies**: T002 (Event types)  
**Description**: Validate Event objects for required fields, correct formats, and data integrity

**What to create**:
- File: `src/lib/events/validator.ts`
- Export function: `validateEvent(obj: unknown): { valid: boolean; errors: string[] }`
- Validation rules:
  - Required fields: id (string), title (string), date (YYYY-MM-DD), image (string), status ('upcoming'|'past')
  - Optional fields allowed: time (HH:MM), location (string), description (string), updated (YYYY-MM-DD)
  - Date format: YYYY-MM-DD (reject if invalid)
  - Status: only 'upcoming' or 'past'
  - ID: no spaces, kebab-case recommended
- Return: { valid: boolean, errors: string[] of specific issues }
- Detect duplicate IDs: export `findDuplicateIds(events: Event[]): string[]`

**Test**: Valid events pass, invalid dates/status/missing fields rejected, duplicates detected

---

### T005 [P] Create event filter and sort logic

**Window**: 1 (Foundation)  
**Phase**: Data Layer  
**Scope**: M  
**Traceability**: FR-007, FR-012, AC-017, AC-018, AC-019  
**Dependencies**: T002 (Event types)  
**Description**: Filter events by status and sort chronologically with tiebreaker logic

**What to create**:
- File: `src/lib/events/filters.ts`
- Export functions:
  - `filterByStatus(events: Event[], status: 'upcoming' | 'past', today: Date): Event[]`
  - `sortEvents(events: Event[], direction: 'asc' | 'desc'): Event[]`
  - `processEvents(events: Event[], today: Date): { upcomingEvents: Event[]; pastEvents: Event[] }`
- Logic:
  - Filter: upcoming = date >= today, past = date < today
  - Sort upcoming: chronological ascending (earliest first)
  - Sort past: chronological descending (most recent first)
  - Tiebreaker: if same date, alphabetical by title
  - Date comparison: use `new Date(event.date).getTime()`
- Today's date: parameter passed (Astro build time)

**Example**:
```typescript
export function processEvents(events: Event[], today: Date) {
  const upcomingEvents = filterByStatus(events, 'upcoming', today)
    .sort((a, b) => /* asc sort */);
  
  const pastEvents = filterByStatus(events, 'past', today)
    .sort((a, b) => /* desc sort then title tiebreaker */);
  
  return { upcomingEvents, pastEvents };
}
```

**Test**: Filters correctly by date, sorts chronologically + tiebreaker, handles edge cases (same date, no events)

---

### T006 Write unit tests for parser, validator, filters

**Window**: 1 (Foundation)  
**Phase**: Testing  
**Scope**: L  
**Traceability**: All FR-006, FR-007, FR-012, FR-015  
**Dependencies**: T001-T005 (all modules to test)  
**Description**: Comprehensive unit test suite for all data layer logic

**What to create**:
- File: `src/lib/events/__tests__/parser.test.ts`
- Test suite structure:
  - **Parser tests** (20+ tests):
    - Parse valid YAML block → correct Event object
    - Parse multiple blocks → correct array
    - Missing optional fields → event still valid
    - Invalid YAML → warning, event skipped
    - Missing required field → warning, event skipped
    - Invalid date (not YYYY-MM-DD) → warning, skipped
    - Duplicate ID → first used, second skipped with warning
    - Invalid status (not upcoming/past) → warning, skipped
  - **Validator tests** (15+ tests):
    - Valid event passes validation
    - Missing required fields → validation error
    - Invalid date format → validation error
    - Invalid status → validation error
    - Optional fields allowed to be undefined
  - **Filter tests** (15+ tests):
    - Filter upcoming: date >= today
    - Filter past: date < today
    - Sort upcoming: chronological ascending
    - Sort past: chronological descending
    - Tiebreaker: same date, alphabetical by title
    - Empty arrays handled correctly
    - Edge case: event on today's date (should be upcoming)

**Example test structure**:
```typescript
describe('Event Parser', () => {
  describe('parseEvents', () => {
    it('should parse valid YAML front-matter block', () => {
      const content = `---\nid: test\ntitle: Test\ndate: 2026-05-15\n...`;
      const { events, warnings } = parseEvents(content);
      expect(events).toHaveLength(1);
      expect(warnings).toHaveLength(0);
    });
    
    it('should skip invalid YAML and log warning', () => {
      const content = `---\ninvalid yaml: :\n---`;
      const { events, warnings } = parseEvents(content);
      expect(events).toHaveLength(0);
      expect(warnings.length).toBeGreaterThan(0);
    });
  });
});
```

**Test**: All tests pass, coverage > 90% for data layer

---

[WINDOW_CHECKPOINT_1]

**Gate Before Window 2**: Validate

```bash
# Run: npm test -- parser.test.ts
# Verify: All tests pass, no TypeScript errors
npx tsc --noEmit
npm test -- src/lib/events/__tests__/parser.test.ts
```

If all tests pass, Window 1 is complete. If any test fails, debug within Window 1 — do NOT proceed to Window 2.

---

## Execution Window 2: Component Architecture & Modal

**Purpose**: Build reusable EventTile and EventModal components with full interactivity and accessibility

**Token Budget**: 80-90k

**Checkpoint Validation**:
- [ ] EventTile component renders correctly (title, date, image)
- [ ] EventModal component opens/closes via click, backdrop, Escape
- [ ] Modal focus trap verified (Tab cycles within modal)
- [ ] Focus returns to tile after modal closes
- [ ] Image fallback works on 404
- [ ] Alt text format correct ("[Event Title] — [Date]")
- [ ] Keyboard navigation: Tab, Enter/Space, Escape all work
- [ ] Component tests pass (interactions, focus, accessibility)

---

### T007 [P] Create EventTile component

**Window**: 2 (Components)  
**Phase**: UI Components  
**Scope**: M  
**Traceability**: FR-001, FR-016, AC-001, AC-006  
**Dependencies**: T002 (Event types from Window 1)  
**Description**: Build reusable event tile card component for display in grid

**What to create**:
- File: `src/components/EventTile.astro`
- Props: `{ event: Event; onTileClick?: (event: Event) => void }`
- Renders:
  - Event image with alt text: "[Event Title] — [Date]"
  - Event title (h3 or semantic heading)
  - Event date (formatted human-readable, e.g., "May 15, 2026")
  - Optional: time if present (display HH:MM)
  - Optional: location if present (show venue)
  - No description in tile (only in modal)
- Styling:
  - Card layout with rounded corners (Tailwind)
  - Hover effect (shadow, slight scale)
  - Clickable as button (cursor-pointer, focus outline)
  - Responsive: scales at different breakpoints
- Accessibility:
  - Semantic button or link element (keyboard focusable)
  - Alt text on image
  - No empty title attributes

**Example HTML structure**:
```html
<button class="event-tile">
  <img src="/images/events/..." alt="Phoenix vs Albury — May 15, 2026" />
  <h3>{event.title}</h3>
  <p class="date">{formatted date}</p>
  {#if event.time}<p class="time">{event.time}</p>{/if}
  {#if event.location}<p class="location">{event.location}</p>{/if}
</button>
```

**Test**: Renders all fields, image loads, alt text correct, focusable and clickable

---

### T008 [P] Create EventModal component (structure + styles)

**Window**: 2 (Components)  
**Phase**: UI Components  
**Scope**: M  
**Traceability**: FR-002, FR-003, FR-013, AC-002, AC-007, AC-016  
**Dependencies**: T002 (Event types)  
**Description**: Build modal overlay component with Astro markup and Tailwind styling

**What to create**:
- File: `src/components/EventModal.astro`
- Props: `{ event: Event; isOpen: boolean; onClose: () => void }`
- Structure:
  - Backdrop div (semi-transparent dark, blur effect)
  - Modal container (centered, max-width 600px, white background)
  - Header: close button (×) top-right, 44x44px minimum
  - Content: event image, title, date, time, location, description (all optional fields gracefully handled)
  - Image: same alt text as tile "[Event Title] — [Date]"
  - Text overflow: description scrollable if long (max-height 60vh), rest of modal fixed
- Styling (Tailwind):
  - Backdrop: `bg-black/50` with `backdrop-blur`
  - Modal: white bg, rounded corners, shadow
  - Close button: large visible (44x44px), top-right corner
  - Responsive: mobile (max-width 90vw), desktop (600px)
  - Animation: fade-in and scale-up on open (250ms)
- ARIA attributes:
  - `role="dialog"` on modal container
  - `aria-modal="true"`
  - Close button: `aria-label="Close"`
  - Heading: `<h2>` for event title

**Test**: Modal renders with correct structure, close button visible, responsive on mobile, ARIA attributes present

---

### T009 Implement modal keyboard interaction (open/close/focus)

**Window**: 2 (Components)  
**Phase**: UI Components  
**Scope**: M  
**Traceability**: FR-013, NFR-001, NFR-002, AC-027, AC-028, AC-005  
**Dependencies**: T008 (modal component created)  
**Description**: Add client-side JavaScript for keyboard navigation, focus management, and close behavior

**What to create**:
- File: `src/components/EventModal.astro` (add `<script>` section)
- Client-side behavior (vanilla JavaScript):
  - **Open**: Triggered by tile click (pass through event data)
  - **Close behaviors**:
    - Escape key → closes modal
    - Close button click → closes modal
    - Backdrop click → closes modal
  - **Focus trap** while modal open:
    - Tab key cycles through focusable elements (close button, links in description)
    - Tab at end wraps to first focusable element
    - Shift+Tab at start wraps to last focusable element
    - Focus never escapes to background
  - **Focus return** after modal closes:
    - Focus returns to the tile that opened the modal
    - Store reference to opened tile element
  - **State management**:
    - Simple `isOpen` boolean state
    - Toggle on tile click, Escape, close button, backdrop

**Implementation approach**:
```javascript
// In EventModal.astro <script> section
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.querySelector('[role="dialog"]');
  const closeBtn = modal.querySelector('[aria-label="Close"]');
  const backdrop = modal.querySelector('.backdrop');
  let openedBy = null;
  
  // Close modal
  function closeModal() {
    modal.style.display = 'none';
    if (openedBy) openedBy.focus();
  }
  
  // Focus trap
  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const focusables = modal.querySelectorAll('button, a, [tabindex]');
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
  
  // Event listeners
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab') trapFocus(e);
  });
});
```

**Test**: Escape closes modal, Tab traps focus, backdrop click closes, focus returns to tile, no console errors

---

### T010 [P] Implement image fallback + error handling

**Window**: 2 (Components)  
**Phase**: UI Components  
**Scope**: S  
**Traceability**: FR-011, AC-011, AC-012, NFR-019  
**Dependencies**: T007 (EventTile), T008 (EventModal)  
**Description**: Add image loading error handling with SVG placeholder fallback

**What to create**:
- File: `src/components/EventImageFallback.astro` (new reusable component)
- Logic:
  - Render `<img>` with src from event.image
  - `onerror` handler: replace with fallback placeholder
  - Fallback: SVG icon (calendar/event badge) centered with semi-transparent background
  - Maintain aspect ratio (400x250px recommended, or 16:9)
  - Alt text always present: "[Event Title] — [Date]"
- Use in: EventTile and EventModal
- Styling: consistent appearance in both contexts (tile and modal)

**SVG Placeholder Example**:
```html
<svg class="fallback-icon" viewBox="0 0 24 24">
  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
</svg>
```

**Test**: Image 404 triggers fallback, alt text preserved, placeholder displays correctly, no console errors

---

### T011 Write component tests (interactions, focus, accessibility)

**Window**: 2 (Components)  
**Phase**: Testing  
**Scope**: L  
**Traceability**: FR-001, FR-002, FR-013, NFR-001, NFR-002  
**Dependencies**: T007-T010 (all components)  
**Description**: Test EventTile and EventModal behavior, keyboard navigation, focus management, image fallback

**What to create**:
- File: `src/components/__tests__/EventTile.test.ts`
- File: `src/components/__tests__/EventModal.test.ts`
- Test structure:
  - **EventTile Tests** (10+ tests):
    - Renders title, date, image correctly
    - Optional fields (time, location) render if present
    - Image alt text correct format
    - Clickable (fires callback on click)
    - Focusable (Tab focus outline visible)
    - Enter/Space opens modal (tested with focus)
    - Fallback displays on image 404
  - **EventModal Tests** (15+ tests):
    - Renders full event details (title, date, time, location, description)
    - Close button visible and functional
    - Escape key closes modal
    - Backdrop click closes modal
    - Focus trap: Tab cycles within modal
    - Focus trap: Shift+Tab cycles backward
    - Focus returns to tile after close
    - Modal hidden on initial render, visible when isOpen=true
    - Image fallback works in modal context
    - Scrollable content for long descriptions
    - ARIA attributes present (role, aria-modal, aria-label)

**Test**: All components behave correctly, keyboard navigation works, focus management safe, no console errors

---

[WINDOW_CHECKPOINT_2]

**Gate Before Window 3**: Component Validation

```bash
# Run: npm test -- EventTile.test.ts EventModal.test.ts
# Verify: All tests pass, no console errors
npm test -- src/components/__tests__/
```

If all tests pass, Window 2 is complete. If any test fails, debug within Window 2.

---

## Execution Window 3: Page Integration & Responsive Layout

**Purpose**: Integrate components into `/get-involved` page with filtering, sorting, and responsive grid layout

**Token Budget**: 80-90k

**Checkpoint Validation**:
- [ ] `/get-involved` page reads events from events.md at build time
- [ ] Events correctly filtered (upcoming/past sections)
- [ ] Events correctly sorted (upcoming ascending, past descending, tiebreaker works)
- [ ] "Upcoming Events" section renders EventTile components in responsive grid
- [ ] "Past Events" section renders only if events exist (hidden if empty)
- [ ] Visual distinction between sections clear (heading, styling)
- [ ] Empty state placeholder shown for upcoming events if no events
- [ ] Grid responsive at all breakpoints (1/2/3-4 columns)
- [ ] Page load time measured < 3 seconds
- [ ] No console errors, layout stable (CLS < 0.1)

---

### T012 Refactor `/get-involved` page to use events.md

**Window**: 3 (Page Integration)  
**Phase**: Page Integration  
**Scope**: L  
**Traceability**: FR-001, FR-004, FR-007, AC-001, AC-006  
**Dependencies**: T001-T006 (data layer), T007-T010 (components from Window 2)  
**Description**: Modify `/get-involved.astro` page to load and render dynamic events instead of hardcoded data

**What to modify**:
- File: `src/pages/get-involved.astro`
- Changes:
  - Import: parseEvents from `src/lib/events/parser.ts`
  - Import: processEvents from `src/lib/events/filters.ts`
  - Import: EventTile, EventModal from components
  - Read events.md file at build time: `const fileContent = await fs.readFile('src/data/events.md', 'utf-8')`
  - Parse and validate: `const { events, warnings } = parseEvents(fileContent)`
  - Log warnings to console (for build-time observability)
  - Process events: `const { upcomingEvents, pastEvents } = processEvents(events, new Date())`
  - Render "Upcoming Events" section:
    - Heading: h2 "Upcoming Events"
    - Grid: responsive layout (see T013)
    - Event tiles: map over upcomingEvents, render EventTile
    - Empty state: if no upcoming events, show placeholder message
  - Conditional "Past Events" section:
    - Only render if pastEvents.length > 0
    - Heading: h2 "Past Events" (visually distinct from upcoming)
    - Grid: same responsive layout
    - Event tiles: map over pastEvents, render EventTile
  - Modal state: manage at page component level (open/close toggle)
  - Pass EventModal component with current event + isOpen + onClose handlers

**Integration approach**:
```astro
---
import EventTile from '../components/EventTile.astro';
import EventModal from '../components/EventModal.astro';
import { parseEvents } from '../lib/events/parser';
import { processEvents } from '../lib/events/filters';
import fs from 'fs';

const fileContent = await fs.readFile('src/data/events.md', 'utf-8');
const { events, warnings } = parseEvents(fileContent);

if (warnings.length > 0) {
  console.warn('Event validation warnings:', warnings);
}

const { upcomingEvents, pastEvents } = processEvents(events, new Date());
---

<section class="upcoming-events">
  <h2>Upcoming Events</h2>
  {upcomingEvents.length > 0 ? (
    <div class="grid">
      {upcomingEvents.map(event => (
        <EventTile event={event} />
      ))}
    </div>
  ) : (
    <p class="placeholder">No upcoming events scheduled. Check back soon!</p>
  )}
</section>

{pastEvents.length > 0 && (
  <section class="past-events">
    <h2>Past Events</h2>
    <div class="grid">
      {pastEvents.map(event => (
        <EventTile event={event} />
      ))}
    </div>
  </section>
)}

<EventModal event={selectedEvent} isOpen={modalOpen} onClose={closeModal} />
```

**Test**: Page builds without errors, events parsed and rendered, sections visible, no console errors

---

### T013 [P] Build responsive grid layout for event tiles

**Window**: 3 (Page Integration)  
**Phase**: Responsive Layout  
**Scope**: M  
**Traceability**: NFR-008, NFR-009, NFR-010, AC-013, AC-014, AC-015  
**Dependencies**: T007 (EventTile dimensions)  
**Description**: Create responsive CSS grid with proper spacing and breakpoints

**What to create**:
- CSS (Tailwind classes) applied to `.grid` container in `/get-involved` page
- Responsive breakpoints:
  - Mobile (<640px): 1 column, full width minus padding
  - Tablet (640-1024px): 2 columns, centered with max-width
  - Desktop (>1024px): 3-4 columns, matches existing `/get-involved` layout
- Spacing:
  - Gap between tiles: 1.5rem (24px)
  - Container padding: 1rem (16px) mobile, 1.5rem (24px) tablet, 2rem (32px) desktop
  - Max-width: container 1280px on desktop
- Tile dimensions:
  - Each tile: consistent aspect ratio (4:3 or 16:9)
  - Min-height: 300px (ensures touch target large enough)
  - Width: 100% of grid cell
- No horizontal overflow at any breakpoint
- Grid responsive classes:
  ```
  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6
  ```

**Test**: Grid renders correctly at all breakpoints, no overflow, proper spacing, tiles align

---

### T014 [P] Add visual distinction between sections (heading, styling)

**Window**: 3 (Page Integration)  
**Phase**: Responsive Layout  
**Scope**: S  
**Traceability**: FR-010, AC-008, SC-006  
**Dependencies**: T012 (page structure)  
**Description**: Style section headings and backgrounds to clearly differentiate upcoming vs past events

**What to create**:
- CSS (Tailwind) for two section classes: `.upcoming-events` and `.past-events`
- Upcoming Events:
  - Heading: h2 with brand-purple color, size 2xl, bold
  - Background: subtle light purple tint or white
  - Border or divider below section
- Past Events:
  - Heading: h2 with muted color (gray), size 2xl, bold
  - Background: subtle light gray tint or white
  - Optional: italic text in heading to suggest "archived"
- Accessibility: high color contrast (WCAG AA 4.5:1)
- Spacing: 3rem (48px) gap between sections

**Example Tailwind**:
```html
<section class="upcoming-events py-8">
  <h2 class="text-3xl font-bold text-brand-purple mb-6">Upcoming Events</h2>
  <div class="grid ...">...</div>
</section>

<section class="past-events py-8 bg-gray-50 border-t-2 border-gray-200">
  <h2 class="text-3xl font-bold text-gray-600 mb-6">Past Events</h2>
  <div class="grid ...">...</div>
</section>
```

**Test**: Sections visually distinct (color, styling, typography), contrast meets WCAG AA, proper spacing

---

### T015 [P] Add empty state placeholders + responsive text

**Window**: 3 (Page Integration)  
**Phase**: Responsive Layout  
**Scope**: S  
**Traceability**: AC-009, AC-010, AC-020, AC-021, AC-022  
**Dependencies**: T012 (page structure)  
**Description**: Handle edge cases: no upcoming events, optional fields missing, text overflow

**What to create**:
- Empty state messaging:
  - Upcoming Events: "No upcoming events scheduled. Check back soon!" (shown if 0 upcoming)
  - Past Events: section hidden entirely if 0 past (decision from plan.md)
- Placeholder styling: centered text, muted gray color, padding 2rem
- Optional field handling:
  - If event has no time → don't show empty time placeholder
  - If event has no location → don't show empty location placeholder
  - If event has no description → modal just shows title/date/image
- Text overflow (tile):
  - Title truncation: max-width, text-overflow ellipsis, 1-2 lines
  - Date/time/location: always fit on tile (short format)
- Text overflow (modal):
  - Description: max-height 60vh, scrollable if too long
  - Other text: no truncation (modal provides space)
- Responsive text sizing: smaller fonts on mobile, normal on desktop

**Test**: Empty states display correctly, missing fields handled gracefully, text doesn't overflow, responsive at all breakpoints

---

### T016 Performance check: page load time + CLS measurement

**Window**: 3 (Page Integration)  
**Phase**: Performance  
**Scope**: S  
**Traceability**: NFR-013, NFR-014, SC-005  
**Dependencies**: T012-T015 (page complete)  
**Description**: Verify page load < 3 seconds and Cumulative Layout Shift < 0.1

**What to do**:
- Measure using browser DevTools Lighthouse or equivalent:
  - Full page load time (`npm run build && npm run preview`)
  - Check Network tab: time to first contentful paint (FCP)
  - Check Performance tab: Cumulative Layout Shift (CLS)
- Verify:
  - Page load time < 3 seconds (target from NFR-013)
  - CLS < 0.1 (target from NFR-014)
  - No render-blocking resources
  - Images properly sized/optimized
- If slow, optimize:
  - Check if events.md too large
  - Ensure images are optimized (< 200KB each)
  - Defer non-critical CSS/JS
- Document results in comment/note

**Test**: Page load < 3s, CLS < 0.1, no console warnings about layout shifts

---

[WINDOW_CHECKPOINT_3]

**Gate Before Window 4**: Integration Validation

```bash
# Run: npm run build
# Run: npm run preview
# Check: Page loads without errors, events display correctly, grid responsive
# Measure: Lighthouse scores (Performance > 80, Accessibility > 90)
```

If page builds, events render correctly, and performance targets met, Window 3 is complete.

---

## Execution Window 4: Accessibility & Build-Time Validation

**Purpose**: Ensure full WCAG AA compliance and build-time error handling with warnings

**Token Budget**: 70-80k

**Checkpoint Validation**:
- [ ] Keyboard navigation: Tab focuses tiles, Enter/Space opens modal, Escape closes
- [ ] Focus management: Modal traps focus, returns to tile after close
- [ ] ARIA attributes: modal role, close button label, section headings
- [ ] Semantic HTML: sections use h2 headings, button elements for tiles
- [ ] Color contrast: all text WCAG AA 4.5:1
- [ ] Alt text: images have correct format "[Event Title] — [Date]"
- [ ] Tap targets: 44x44px minimum on mobile
- [ ] Screen reader testing: modal announced, event details readable
- [ ] Build-time validation: malformed events produce warnings (not errors)
- [ ] No console errors or warnings

---

### T017 [P] Audit keyboard navigation + focus management

**Window**: 4 (Accessibility)  
**Phase**: Accessibility  
**Scope**: M  
**Traceability**: NFR-001, NFR-002, AC-027, AC-028, AC-005  
**Dependencies**: T007-T009 (modal keyboard logic), T012-T016 (page integration)  
**Description**: Verify keyboard accessibility end-to-end: Tab navigation, focus visibility, focus trap

**What to test**:
- Manual keyboard navigation testing:
  1. Load `/get-involved` page in browser
  2. Press Tab repeatedly → each event tile should be focused (visible outline)
  3. With tile focused, press Enter or Space → modal should open
  4. With modal open, press Tab repeatedly → focus cycles through focusable elements (close button, links)
  5. Focus should NOT escape to background page
  6. Press Shift+Tab at start → focus wraps to last element (close button)
  7. With any modal element focused, press Escape → modal closes
  8. After close, focus returns to the tile that opened the modal
  9. Repeat for multiple tiles → each correctly traps/returns focus
- Verify focus visible at all times: outline or ring visible around focused element
- Test on mobile: tap tile → modal opens → on-screen keyboard doesn't hide close button

**Test**: Create manual test checklist; pass all steps without errors

---

### T018 [P] Audit ARIA labels + semantic HTML

**Window**: 4 (Accessibility)  
**Phase**: Accessibility  
**Scope**: M  
**Traceability**: NFR-003, NFR-004, AC-029, AC-030  
**Dependencies**: T008 (modal markup), T012 (page structure)  
**Description**: Verify ARIA attributes, roles, and semantic HTML structure

**What to verify**:
- Modal ARIA:
  - Modal container has `role="dialog"`
  - Modal container has `aria-modal="true"`
  - Close button has `aria-label="Close"` or visible text label
  - Modal title is first focusable or labeled via `aria-labelledby`
- Section semantics:
  - "Upcoming Events" heading is `<h2>`
  - "Past Events" heading is `<h2>`
  - Headings are semantic (not styled divs)
  - No missing heading levels (h1 exists, h2 below it)
- Event tiles:
  - Tiles are `<button>` or `<a>` (native focusable element)
  - Tile text contains event title (readable by screen reader)
  - Image has alt text
- Images:
  - All images have alt text
  - Alt text format: "[Event Title] — [Date]"
  - Fallback placeholder also has descriptive alt text
- Color contrast:
  - Use WebAIM Contrast Checker or Lighthouse audit
  - Section headings: purple/gray on white → 4.5:1 (WCAG AA)
  - Body text: gray/black on white → 4.5:1 (WCAG AA)

**Tools**: 
- Browser DevTools Accessibility Inspector
- axe DevTools (Chrome extension)
- WebAIM Contrast Checker (webaim.org/resources/contrastchecker)
- Lighthouse audit (DevTools → Lighthouse)

**Test**: All ARIA attributes present, semantic HTML correct, contrast meets WCAG AA

---

### T019 [P] Screen reader testing (modal + event details)

**Window**: 4 (Accessibility)  
**Phase**: Accessibility  
**Scope**: M  
**Traceability**: AC-029, AC-030, NFR-001-007  
**Dependencies**: T008 (modal), T012 (page)  
**Description**: Verify screen reader announces modal, event details, and navigation correctly

**What to test** (using NVDA, JAWS, or macOS VoiceOver):
- Navigate to `/get-involved` page
- Screen reader should announce:
  - Page heading/structure
  - "Upcoming Events" heading (h2)
  - First event tile: "Button: [Event Title]" or "Link: [Event Title]"
- Tab to event tile and press Enter
- Screen reader should announce:
  - "Dialog: [Event Title]"
  - "Button: Close"
  - Event details: date, time, location, description
  - Image alt text
- Press Tab from close button → cycles to next focusable element
- Press Escape → modal closes, "Dialog closed" (or similar)
- Screen reader should return to tile: "[Event Title] button"
- Navigate "Past Events" section:
  - "Past Events" heading announced (h2)
  - Past event tiles announced similarly
- If no upcoming events: empty state message should be announced

**Screen reader to test**: At least one of:
- NVDA (Windows, free)
- VoiceOver (macOS, built-in)
- JAWS (Windows, commercial)

**Test**: All announcements clear and accurate, modal behavior understandable to screen reader user, no missing labels

---

### T020 [P] Add build-time validation for malformed events

**Window**: 4 (Accessibility)  
**Phase**: Build Validation  
**Scope**: M  
**Traceability**: FR-015, NFR-017, NFR-018, AC-031, AC-032, AC-033  
**Dependencies**: T005 (validator), T006 (parser tests)  
**Description**: Enhance parser to catch and log build-time warnings for invalid events without blocking build

**What to add**:
- File: `src/lib/events/parser.ts` (enhance existing)
- Validation on parse:
  - For each event, run `validateEvent(event)` from validator
  - Collect all validation errors as warnings
  - If event invalid, skip it but log specific reason
  - Include event ID (if available) in warning message
  - Format: `[events.md:LINE] Invalid event [ID]: [specific error]`
- Logging:
  - Log warnings to console.warn() during build
  - Include: file name, event ID, field name, reason
  - Do NOT throw error (let build continue)
  - Count total warnings at end: `[build] Processed 10 events: 8 valid, 2 warnings`
- Duplicate ID detection:
  - Track seen IDs
  - If duplicate found: use first occurrence, log warning with line numbers
  - Example: `[events.md:15] Duplicate event ID "phoenix-vs-albury" (first seen line 5); skipping`

**Example warning messages**:
```
[events.md:42] Invalid event "event-2": missing required field "date"
[events.md:67] Invalid event "event-3": invalid date format "2026/05/15" (expected YYYY-MM-DD)
[events.md:89] Invalid event "event-4": invalid status "future" (must be "upcoming" or "past")
[events.md:15] Duplicate event ID "junior-clinic"; skipping duplicate at line 95
```

**Test**: Invalid events skipped with clear warnings, valid events still render, build completes successfully

---

### T021 [P] Verify tap targets + mobile accessibility (44x44px minimum)

**Window**: 4 (Accessibility)  
**Phase**: Accessibility  
**Scope**: S  
**Traceability**: NFR-007, AC-013, AC-016  
**Dependencies**: T007 (EventTile), T008 (EventModal), T013 (responsive grid)  
**Description**: Ensure touch targets meet minimum 44x44px size on mobile devices

**What to verify**:
- Event tiles (mobile):
  - Each tile button: at least 44x44px
  - Padding/margin around tile to prevent accidental adjacent clicks
- Modal close button:
  - At least 44x44px (verified in T009)
  - Positioned in corner without overlap
- Modal on small viewport (< 640px):
  - Modal fits within viewport (< 100vw, < 100vh)
  - Content scrollable if too long
  - Close button always visible and reachable without scrolling
- Test on actual mobile or mobile emulation:
  - DevTools → Toggle device toolbar
  - Tap tiles: easy to hit, no accidental misses
  - Tap close button: easy to hit without scrolling

**Measurement**:
- Use DevTools element inspector
- Right-click tile → Inspect → measure size
- Width/height should be >= 44px in both dimensions
- Or: use Lighthouse accessibility audit

**Test**: All touch targets >= 44x44px, no overlaps, mobile-friendly

---

### T022 Write integration test for full a11y flow (keyboard + screen reader)

**Window**: 4 (Accessibility)  
**Phase**: Testing  
**Scope**: L  
**Traceability**: AC-027, AC-028, AC-029, AC-030  
**Dependencies**: T008-T009 (modal), T012 (page)  
**Description**: Create comprehensive integration test script for accessibility testing

**What to create**:
- File: `specs/coa-30-get-involved/a11y-test-checklist.md`
- Test checklist (manual, step-by-step):
  - Keyboard navigation:
    - [ ] Tab focuses first tile
    - [ ] Tab continues through all tiles
    - [ ] Tiles appear in logical order (left-to-right, top-to-bottom)
    - [ ] Enter/Space on tile opens modal
    - [ ] Tab in modal focuses close button, content
    - [ ] Shift+Tab cycles backward
    - [ ] Escape closes modal
    - [ ] Focus returns to opened tile
  - Focus visibility:
    - [ ] Focused element has visible outline (no outline-none)
    - [ ] Outline color has sufficient contrast (not hard to see)
  - ARIA:
    - [ ] Modal announced as dialog/modal
    - [ ] Close button labeled
    - [ ] Headings announced
    - [ ] Image alt text read correctly
  - Color contrast (WebAIM checker):
    - [ ] Purple heading on white: >= 4.5:1
    - [ ] Gray muted text on white: >= 4.5:1
  - Screen reader (NVDA or VoiceOver):
    - [ ] Page structure announced
    - [ ] Event tiles announced with titles
    - [ ] Modal dialog announced
    - [ ] Close button announced
    - [ ] All event details readable
  - Mobile (< 640px):
    - [ ] Grid single column, no overflow
    - [ ] Tap targets >= 44x44px
    - [ ] Close button visible without scrolling
  - Performance:
    - [ ] Page loads < 3s
    - [ ] No jank when opening/closing modal
    - [ ] Animations smooth (60fps)

**Test**: Checklist created and ready for manual testing (can be executed by QA or accessibility auditor)

---

[WINDOW_CHECKPOINT_4]

**Gate Before Window 5**: Accessibility Validation

```bash
# Run: Manual keyboard navigation test
# Run: Manual screen reader test (NVDA/VoiceOver)
# Run: Lighthouse accessibility audit
# Run: npm run build (verify warnings logged, no errors)
# Check: Tap targets 44x44px, color contrast WCAG AA
```

If all accessibility checks pass, build completes with only warnings (not errors), Window 4 is complete.

---

## Execution Window 5: Maintainer Workflow & Polish

**Purpose**: Document maintainer workflow for event updates, final testing, and handover

**Token Budget**: 60-70k

**Checkpoint Validation**:
- [ ] Maintainer event update prompt documented in research.md
- [ ] One-page event update guide created
- [ ] Format examples provided (markdown, JSON, natural language)
- [ ] Claude Code prompt tested with 3+ format types
- [ ] Generated events.md valid YAML (no parser errors)
- [ ] End-to-end test: add event → build → verify renders
- [ ] End-to-end test: change event status → build → verify moves section
- [ ] Lighthouse scores: Performance > 80, Accessibility > 90, Best Practices > 90
- [ ] All tests passing (unit + integration + a11y)
- [ ] Documentation complete and maintainer-ready
- [ ] Ready for merge

---

### T023 [P] Document Claude Code maintainer workflow

**Window**: 5 (Maintainer & Polish)  
**Phase**: Documentation  
**Scope**: M  
**Traceability**: FR-008, FR-009, SC-003, SC-009  
**Dependencies**: T001-T006 (event format defined)  
**Description**: Create comprehensive maintainer guide and Claude Code prompt template

**What to create**:
- File: `specs/coa-30-get-involved/research.md` (new section: "Maintainer Workflow")
- Content:
  - **One-page event update guide** (target: 1 printed page):
    - What is an event? (simple explanation)
    - Required fields: id, title, date, image, status
    - Optional fields: time, location, description, updated
    - How to provide data to Claude Code (natural language, markdown, JSON)
    - Examples of each format
    - What to expect from Claude Code (generates updated events.md for review)
    - How to review generated events.md (check all events present)
    - How to commit and deploy (git add/commit/push, CI/CD runs build)
  - **Claude Code prompt template**:
    ```
    I need to update the events for our Get Involved page. Here's the data:
    [USER PROVIDES DATA IN ANY FORMAT]
    
    Please parse this into our event format and generate an updated events.md file.
    Required fields: id (kebab-case slug), title, date (YYYY-MM-DD), image (/images/events/...), status (upcoming or past)
    Optional fields: time (HH:MM), location, description
    
    Respond with the complete events.md file ready to commit to src/data/events.md.
    ```
  - **Format examples**:
    - Markdown bullet list format
    - JSON array format
    - Natural language description format
    - CSV/table format
  - **Validation instructions**:
    - What warnings to expect
    - How to interpret build output
    - How to fix common errors (bad date format, missing fields, etc.)
  - **Onboarding checklist**:
    - [ ] Read one-page guide
    - [ ] Understand event format
    - [ ] Provide test event data to Claude Code
    - [ ] Review generated events.md
    - [ ] Commit and deploy
    - [ ] Verify event appears on site

**Test**: Guide is clear and understandable by non-technical user, prompt successfully generates valid events.md

---

### T024 [P] Test Claude Code prompt with 3+ format types

**Window**: 5 (Maintainer & Polish)  
**Phase**: Testing  
**Scope**: M  
**Traceability**: FR-008, SC-007, SC-009  
**Dependencies**: T023 (prompt template), T001-T006 (event format)  
**Description**: Validate maintainer workflow by testing prompt with multiple input formats

**What to test**:
1. **Test Case 1: Markdown format**
   - Input to Claude Code:
     ```
     New upcoming events:
     - Bendigo Phoenix vs Melbourne (May 28, 2026, 7:30pm, Bendigo Basketball Stadium)
     - Season Finale (June 15, 2026, 2:00pm, Bendigo Basketball Stadium)
     
     Past event to add:
     - Pre-season Friendly (April 5, 2026, retired)
     ```
   - Expected output: Valid events.md with 3 events correctly formatted
   - Verify: No parse errors, all fields correct, status correct

2. **Test Case 2: JSON format**
   - Input to Claude Code:
     ```json
     [
       { "id": "vs-sunbury", "title": "Phoenix vs Sunbury", "date": "2026-05-22", "time": "19:30", "location": "Stadium", "image": "/images/events/vs-sunbury.png", "status": "upcoming" },
       { "id": "winter-camp", "title": "Winter Camp", "date": "2026-07-01", "image": "/images/events/winter-camp.png", "status": "upcoming" }
     ]
     ```
   - Expected output: Valid events.md with 2 events
   - Verify: JSON parsed correctly, no data loss

3. **Test Case 3: Natural language format**
   - Input to Claude Code:
     ```
     Add an upcoming event called "Community Clinic" on June 5th at 4pm at the main gym.
     Also mark the "Winter Warm-up" event (originally scheduled for February 14) as past.
     ```
   - Expected output: Valid events.md with updated/new events
   - Verify: Natural language interpreted correctly, dates/times formatted, status correct

4. **For each test**:
   - Generated events.md should be valid YAML
   - Run `npm run build` with generated file → should succeed with no errors
   - Events should render correctly on `/get-involved` page
   - Check `npm run build` output → should show "8 valid, 0 warnings" (or similar)

**Test**: All 3 format tests succeed, generated events.md always valid, no build errors

---

### T025 [P] End-to-end test: add event via Claude Code → deploy → verify

**Window**: 5 (Maintainer & Polish)  
**Phase**: Integration Testing  
**Scope**: L  
**Traceability**: SC-003, SC-004, SC-005  
**Dependencies**: T023-T024 (workflow tested), T012-T022 (feature complete)  
**Description**: Full maintainer workflow validation: provide event data to Claude Code, commit, deploy, verify renders

**What to test**:
1. **Step 1: Provide event data to Claude Code**
   - Use prompt template from T023
   - Provide markdown format:
     ```
     New upcoming event:
     - Bendigo Phoenix vs Albury (May 15, 2026, 7:30pm, Bendigo Basketball Stadium) — Home game, come support!
     ```
   - Expected: Claude Code generates complete events.md

2. **Step 2: Copy generated events.md to src/data/events.md**
   - Replace existing file with generated one
   - No manual edits

3. **Step 3: Run build**
   - Command: `npm run build`
   - Expected: Build succeeds with 0 errors
   - Check output: Should log "Processed X events: X valid, 0 warnings"
   - No TypeScript errors, no missing files

4. **Step 4: Start preview server**
   - Command: `npm run preview`
   - Navigate to `/get-involved`
   - Verify new event appears in "Upcoming Events" section
   - Click on new event → modal opens with full details
   - Verify all metadata correct (title, date, time, location, description)
   - Check image loads (or fallback displays if missing)

5. **Step 5: Verify page metrics**
   - Page load time < 3s (DevTools Lighthouse)
   - CLS < 0.1
   - Accessibility score > 90
   - No console errors

**Test**: Full workflow succeeds without developer intervention, event renders correctly, performance targets met

---

### T026 End-to-end test: change event status (upcoming→past) → redeploy → verify

**Window**: 5 (Maintainer & Polish)  
**Phase**: Integration Testing  
**Scope**: M  
**Traceability**: FR-007, AC-024, AC-025  
**Dependencies**: T025 (previous e2e test)  
**Description**: Test event status change workflow: update status in events.md, rebuild, verify event moves sections

**What to test**:
1. **Step 1: Edit events.md**
   - Change one upcoming event's status from "upcoming" to "past"
   - Example: "Phoenix vs Albury" (was upcoming, now past)
   - Keep all other fields identical (title, date, image, description, etc.)

2. **Step 2: Run build**
   - Command: `npm run build`
   - Expected: Build succeeds, event processed correctly
   - Check output: Should log no warnings, all events valid

3. **Step 3: Start preview and navigate to `/get-involved`**
   - Event should NO LONGER appear in "Upcoming Events" section
   - Event SHOULD NOW appear in "Past Events" section
   - Verify event data intact (title, date, time, location, description, image)
   - No data loss

4. **Step 4: Verify sort order**
   - Past Events section should show most recent first
   - If multiple past events, verify chronological descending order

5. **Step 5: Click past event in modal**
   - Modal opens with full details
   - All data correct and readable

**Test**: Status change successful, event moves correctly between sections, data integrity maintained, sort order correct

---

### T027 [P] Final Lighthouse audit + performance profiling

**Window**: 5 (Maintainer & Polish)  
**Phase**: Performance Validation  
**Scope**: M  
**Traceability**: NFR-013, NFR-014, SC-005, SC-008  
**Dependencies**: T025-T026 (e2e tests complete)  
**Description**: Run comprehensive Lighthouse audit and measure performance metrics

**What to measure**:
1. **Lighthouse audit** (DevTools):
   - Run on `/get-involved` page (production build)
   - Target scores:
     - Performance: > 80
     - Accessibility: > 90
     - Best Practices: > 90
     - SEO: > 90
   - Check specific metrics:
     - First Contentful Paint (FCP): < 2s
     - Largest Contentful Paint (LCP): < 2.5s
     - Cumulative Layout Shift (CLS): < 0.1
     - Interaction to Next Paint (INP): < 200ms

2. **Performance profile** (DevTools Performance tab):
   - Record page load
   - Check: no long tasks (> 50ms)
   - Check: modal open/close animations smooth (60fps)
   - Check: no render-blocking resources

3. **Bundle size**:
   - Check events.md file size: should be < 100KB (per NFR-016)
   - Check page HTML size: reasonable for static site

4. **Document results**:
   - Create `specs/coa-30-get-involved/performance-results.txt` with:
     - Lighthouse scores
     - Performance metrics (FCP, LCP, CLS, INP)
     - Page load time
     - Bundle size
     - Any optimization notes

**Test**: Lighthouse scores > 80, performance metrics within targets, no console warnings

---

### T028 Finalize documentation + create quickstart guide for maintainers

**Window**: 5 (Maintainer & Polish)  
**Phase**: Documentation  
**Scope**: M  
**Traceability**: SC-003, SC-009  
**Dependencies**: T023 (workflow documented), T025-T027 (all testing complete)  
**Description**: Create final maintainer documentation and quickstart guide

**What to create**:
- File: `specs/coa-30-get-involved/MAINTAINER_GUIDE.md`
- Content (one page, printable):
  - **Quick Start**
    - Goal: Update events on Get Involved page
    - Who: Site maintainers (non-technical OK)
    - How: Use Claude Code with event data
  - **Step-by-step**
    1. Gather event info (title, date, time, location, description, image)
    2. Go to Claude Code and provide data in any format
    3. Claude Code generates events.md
    4. Review generated file
    5. Copy to `src/data/events.md` (ask developer to merge)
    6. Site CI/CD rebuilds and deploys automatically
  - **Format examples** (quick reference)
    - Markdown list
    - JSON array
    - Natural language sentence
  - **Common questions**
    - Q: What's an ID? A: kebab-case slug, e.g., "phoenix-vs-albury"
    - Q: What if I forget a field? A: Claude Code will ask for clarification
    - Q: How do I change an event from upcoming to past? A: Provide same data, just change status="past"
    - Q: Can I delete an event? A: Remove it from the data you provide to Claude Code
    - Q: Where do images go? A: Ask developer; typically `/images/events/`
  - **Troubleshooting**
    - Build fails: Check for typos in date (YYYY-MM-DD format required)
    - Event doesn't appear: Verify status is "upcoming" or "past"
    - Image broken: Verify path and ask developer about image upload
  - **Contact**
    - For help: reach out to [developer contact]

- File: `specs/coa-30-get-involved/QUICKSTART.md`
- Content (developer quick reference):
  - Overview of feature
  - Key files modified/created
  - How to test manually
  - How to help maintainers (review PR, deploy)
  - Rollback plan (revert events.md if corrupted)

**Test**: Documentation clear and helpful, non-technical user can follow guide, developer can use quickstart

---

### T029 [P] Final integration test: all acceptance criteria verified

**Window**: 5 (Maintainer & Polish)  
**Phase**: Integration Testing  
**Scope**: L  
**Traceability**: All AC-001 through AC-033  
**Dependencies**: T025-T028 (all work complete)  
**Description**: Comprehensive final test covering all acceptance criteria from spec

**What to test** (checklist):
- **US-1: Browse Upcoming Events**
  - [ ] AC-001: `/get-involved` loads, Upcoming Events section visible
  - [ ] AC-002: Click event tile → modal opens with full details
  - [ ] AC-003: Click close button → modal closes, focus returns to tile
  - [ ] AC-004: Click backdrop → modal closes without affecting page
  - [ ] AC-005: Press Escape → modal closes, focus returns

- **US-2: Explore Past Events**
  - [ ] AC-006: Past Events section visible below Upcoming
  - [ ] AC-007: Click past event → modal opens with details
  - [ ] AC-008: Sections visually distinct (heading, color, styling)

- **Empty States**
  - [ ] AC-009: No upcoming events → placeholder message shown
  - [ ] AC-010: No past events → section hidden entirely

- **Image Handling**
  - [ ] AC-011: Missing/broken image → fallback placeholder shown
  - [ ] AC-012: Modal with missing image → fallback shown

- **Responsive Design**
  - [ ] AC-013: Mobile (<640px): single/2-column grid, 44x44px tap targets
  - [ ] AC-014: Tablet (640-1024px): 2-3 column grid
  - [ ] AC-015: Desktop (>1024px): 3-4 column grid
  - [ ] AC-016: Modal mobile: scrollable content, close button visible

- **Sorting & Filtering**
  - [ ] AC-017: Upcoming sorted ascending (next first)
  - [ ] AC-018: Past sorted descending (most recent first)
  - [ ] AC-019: Same date → alphabetical by title tiebreaker

- **Optional Fields**
  - [ ] AC-020: No time field → no empty placeholder
  - [ ] AC-021: No location field → no empty placeholder
  - [ ] AC-022: No description field → only title/date/image

- **Data Persistence**
  - [ ] AC-023: Maintainer provides data → Claude Code generates valid events.md
  - [ ] AC-024: Status change upcoming→past → event moves section
  - [ ] AC-025: Status change → all original data preserved
  - [ ] AC-026: Claude Code parses multiple formats → valid YAML

- **Accessibility**
  - [ ] AC-027: Keyboard navigation: Tab, Enter/Space, Escape all work
  - [ ] AC-028: Modal focus trap: Tab cycles within modal
  - [ ] AC-029: Screen reader: modal announced as dialog, close button labeled
  - [ ] AC-030: Screen reader: sections and event titles announced

- **Error Handling**
  - [ ] AC-031: Missing required field → warning logged, other events render
  - [ ] AC-032: Invalid date format → warning logged, build succeeds
  - [ ] AC-033: Duplicate ID → first used, duplicate skipped with warning

**Test**: All 33 acceptance criteria verified and passing, no exceptions

---

### T030 Code cleanup + final review before merge

**Window**: 5 (Maintainer & Polish)  
**Phase**: Polish  
**Scope**: M  
**Traceability**: All (code quality)  
**Dependencies**: T029 (all testing complete)  
**Description**: Clean up code, remove debug logs, ensure consistency before merge

**What to do**:
1. **Code review** across all new files:
   - Check for console.log(), debug comments, commented-out code
   - Remove test/debug code
   - Ensure consistent naming (kebab-case for files, camelCase for functions, UPPER_CASE for constants)
   - Check for unused imports
   - Verify JSDoc comments for exported functions

2. **Linting** (if project has eslint):
   - Run: `npm run lint --fix`
   - Address any remaining warnings
   - Ensure TypeScript strict mode compliance

3. **Test suite**:
   - Run full test suite: `npm test`
   - Verify all tests pass (unit + integration + a11y checklist)
   - Check code coverage: aim for > 80% on critical paths (parser, filters)

4. **Build validation**:
   - Run: `npm run build`
   - Verify no errors or unexpected warnings
   - Check output for event processing messages
   - Ensure types compile correctly

5. **Final documentation review**:
   - Ensure all markdown files (spec, plan, tasks, maintainer guide, research) are up-to-date
   - Check for typos and clarity
   - Verify links and references work

6. **Git cleanup**:
   - Ensure all changes committed
   - Branch is ready for PR
   - Commit messages clear and descriptive

**Test**: All linting passes, tests pass, build succeeds, documentation polished

---

[WINDOW_CHECKPOINT_5]

**Gate Before Merge**: Final Validation

```bash
# Run all validation checks
npm test                          # All tests pass
npm run lint --fix               # Linting clean
npm run build                    # Build succeeds
npm run preview                  # Page loads and events display

# Manual verification
# - All 33 ACs verified passing
# - Performance targets met (Lighthouse > 80, < 3s load, CLS < 0.1)
# - Accessibility full WCAG AA
# - Maintainer documentation complete
# - All files cleaned up, no debug code
```

If all checks pass, feature is ready for merge to main branch.

---

## Summary

**Total Tasks**: 30  
**Total Windows**: 5  
**Estimated Duration**: 20-30 hours  
**Critical Path**: Window 1 → Window 2 → Window 3 → (Windows 4 & 5 can overlap if staffed)

**Key Dependencies**:
- Window 1 (Foundation) must complete before any other work
- Window 2 (Components) depends on Window 1 types + foundation
- Window 3 (Page Integration) depends on Windows 1 & 2
- Windows 4 (Accessibility) & 5 (Maintainer) can run in parallel after Window 3
- All windows must pass checkpoints before final merge

**Success Criteria**:
- All 33 acceptance criteria (AC-001 to AC-033) passing
- All 12 success criteria (SC-001 to SC-012) met
- Lighthouse scores > 80 (Performance, Accessibility, Best Practices)
- Page load < 3 seconds, CLS < 0.1
- Maintainer can update events independently via Claude Code
- Full WCAG AA accessibility
- Zero console errors in production build

---

## Implementation Notes

1. **Start with Window 1**: Build event data layer first; everything depends on it
2. **Test-first**: Write tests before implementation (Principle II)
3. **Parallel opportunities**: Within each window, mark tasks [P] if they can run in parallel
4. **Use checkpoints**: Don't proceed to next window until checkpoint validated
5. **Maintainer focus**: Window 5 workflow is critical for long-term sustainability
6. **Document decisions**: Any TBD from spec should be resolved in Window 1-2
