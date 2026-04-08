# Implementation Plan: Get Involved Events Page Redesign (COA-30)

**Branch**: coa-30-get-involved | **Date**: 2026-04-08 | **Spec**: specs/coa-30-get-involved/spec.md

## Summary

Redesign the `/get-involved` page to feature dynamic, clickable event tiles with a dedicated modal detail view. Replace hardcoded event data with a structured markdown data file (`src/data/events.md`) that separates upcoming and past events. This feature enhances community engagement by enabling visitors to discover events and learn details, while allowing maintainers to update events independently via Claude Code without developer intervention.

**High-level approach**:
1. Create `src/data/events.md` with YAML front-matter structure (required + optional fields)
2. Build event parsing utility to read and validate events at build time
3. Create reusable `EventModal` component (Astro + client-side interaction)
4. Refactor `/get-involved` page to render dynamic event sections with filtering/sorting
5. Provide maintainer documentation and Claude Code workflow for event updates

---

## Technical Context

**Language/Runtime**: Node 22.12.0+, Astro 6.1.1

**Frontend Framework**: Astro (SSG with optional client-side interactivity)
- Uses Astro components (.astro) for UI encapsulation
- Server-side rendering at build time
- Minimal client-side JavaScript (CSS + vanilla JS for modal interactions)

**Styling**: Tailwind CSS 4.2.2
- Utility-first approach
- Mobile-first responsive design (sm: 640px, md: 768px, lg: 1024px)
- Custom brand colors already defined (brand-purple, brand-gold, brand-black, brand-offwhite)

**Data Storage**: Markdown file (`src/data/events.md`)
- YAML front-matter blocks separated by `---`
- Parsed at Astro build time
- No runtime database or API required

**Testing Framework**: Vitest 4.1.2
- Unit tests for event parsing/filtering/sorting logic
- Component visual regression testing (optional but recommended)

**Target Platform**: Web (desktop/tablet/mobile)

**Performance Goals**:
- Page load < 3 seconds (FR-005, NFR-013)
- Cumulative Layout Shift < 0.1 (NFR-014)
- Modal animations 60fps (NFR-015)
- events.md < 100KB (NFR-016)

**Scale/Scope**:
- MVP: 5-10 upcoming events, 3-5 past events (extensible to 50+)
- Single-page GET /get-involved, no pagination initially
- Optional growth strategy documented for 100+ events

---

## Constitution Check

**Principle I (User Outcomes First)**: ✅ PASS
- Three distinct user stories with measurable success criteria (SC-001 through SC-012)
- US-1: Visitors discover upcoming events via clickable tiles
- US-2: Visitors build trust by viewing past activities
- US-3: Maintainers update events independently, enabling long-term sustainability
- Each delivers testable value

**Principle II (Test-First Discipline)**: ✅ PASS
- All acceptance criteria (AC-001 through AC-033) are independently testable
- Parser logic tested (valid/invalid YAML, missing fields, duplicate IDs)
- Modal behavior tested (open/close, keyboard, focus management)
- Responsive layout tested across breakpoints
- No behavior without corresponding test

**Principle III (Backend Authority & Invariants)**: ✅ PASS
- Events.md is single source of truth (build-time immutable)
- No client-side inference of event status or date-based filtering
- Sorting and filtering logic deterministic at build time
- All data validation enforced at build time (FR-015, NFR-017-020)

**Principle IV (Error Semantics & Observability)**: ✅ PASS
- Build-time validation catches: missing required fields, malformed YAML, duplicate IDs, invalid dates
- Each error logged with specific context (line number, field, reason)
- Invalid events skipped with clear warning; valid events render (NFR-017-020)
- Broken images show fallback + logged 404 (NFR-019)

**Principle V (AppShell Integrity)**: ✅ PASS
- Feature integrates into existing `/get-involved` page via BaseLayout
- No custom navigation shell
- Modal overlay temporary; does not alter page structure
- Maintains consistent header, footer, sidebar

**Principle VI (Accessibility First)**: ✅ PASS
- Keyboard navigation: Tab focuses tiles, Enter/Space opens modal (NFR-001, AC-027)
- Focus trap: modal captures focus while open, returns to tile on close (NFR-002, AC-028)
- ARIA: modal has role="dialog", aria-modal="true", close button labeled (NFR-003)
- Semantic HTML: sections with h2/h3 headings, event titles semantic (NFR-004)
- Images: alt text format "[Event Title] — [Date]" (NFR-005)
- Color contrast: section headings WCAG AA 4.5:1 (NFR-006)
- Tap targets: 44x44px minimum (NFR-007, AC-013)
- Screen reader: modal announced as dialog, labels provided (AC-029-030)

**Principle VII (Immutable Data Flow)**: ✅ PASS
- Events loaded from events.md at Astro build time
- No client-side data mutations
- Modal state (open/close) is ephemeral UI state, not data persistence
- Unidirectional flow: events.md → build → component props → render

**Principle VIII (Dependency Hygiene)**: ✅ PASS
- No new npm dependencies required (Astro, Tailwind, browser APIs suffice)
- If modal library added (e.g., headless-ui), rationale documented in decisions
- No bloat; prefer vanilla JS for modal interactions

**Principle IX (Cross-Feature Consistency)**: ✅ PASS
- Follows established Astro component patterns (see ScoreCard, ResourceCard)
- Tailwind responsive breakpoints consistent with site config
- Card-based tile design matches existing UI (ScoreCard style)
- Grid layout follows get-involved page conventions (4 columns desktop, responsive below)

---

## Project Structure

```
src/
├── data/
│   └── events.md              ← NEW: Event data file (YAML front-matter)
├── components/
│   ├── EventTile.astro        ← NEW: Event card tile component
│   ├── EventModal.astro       ← NEW: Modal detail view (reusable)
│   └── ... (existing)
├── lib/
│   ├── events/                ← NEW: Event parsing & validation
│   │   ├── types.ts           ← Event TS types
│   │   ├── parser.ts          ← Parse events.md YAML
│   │   ├── validator.ts       ← Validate event fields
│   │   ├── filters.ts         ← Filter/sort by status, date
│   │   └── parser.test.ts     ← Unit tests for parser
│   └── ... (existing)
├── pages/
│   └── get-involved.astro     ← MODIFIED: Integrate new event system
├── styles/
│   └── global.css             ← No changes needed (Tailwind handles it)
└── ... (existing)

specs/coa-30-get-involved/
├── spec.md                    ← User stories & requirements
├── plan.md                    ← This file
├── tasks.md                   ← Atomic task breakdown (next phase)
└── research.md                ← Design decisions & TBD resolutions
```

---

## Data Model

### Event Entity

```typescript
interface Event {
  // Required fields
  id: string;              // Unique slug (kebab-case, e.g., "phoenix-vs-albury")
  title: string;           // Event name
  date: string;            // ISO date YYYY-MM-DD
  image: string;           // Relative path, e.g., "/images/events/may-match.png"
  status: 'upcoming' | 'past'; // Controls which section

  // Optional fields
  time?: string;           // HH:MM (24-hour, AEST)
  location?: string;       // Venue/location name
  description?: string;    // Event description (max 500 chars recommended)
  updated?: string;        // ISO date of last update (maintainer reference only)
}

interface EventSection {
  title: 'Upcoming Events' | 'Past Events';
  events: Event[];
  visibility: boolean;     // true if section should render
}
```

### Storage: events.md Format

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

---
id: "junior-clinic"
title: "Junior Clinic"
date: "2026-04-20"
image: "/images/events/junior-clinic.png"
status: "upcoming"
---

---
id: "past-launch-2025"
title: "2025 Season Launch"
date: "2026-03-01"
image: "/images/events/2025-launch.png"
status: "past"
---
```

### Filtering & Sorting Logic

**Filtering by status**:
- `upcoming`: date >= today (build date)
- `past`: date < today (build date)

**Sorting within section**:
- Upcoming: chronological ascending (earliest/next first)
- Past: chronological descending (most recent first)
- Tiebreaker: alphabetical by title if same date

**Today's Date**: Build-time (Astro generates static HTML at build; all dates compared against build date, not client time)

---

## Design Decisions Resolved (TBD → Final)

### 1. Empty Past Events Section Behavior

**Decision**: Hide section entirely if no past events exist
- **Rationale**: Cleaner UX; past events are secondary value. If zero past events, showing empty state takes vertical space with no information gain.
- **Implementation**: Conditional rendering in `/get-involved` page; check `pastEvents.length` before rendering section
- **Impact**: AC-010 → "section is hidden entirely" (option a)

### 2. Modal Component

**Decision**: Build custom modal using vanilla JavaScript + Tailwind CSS
- **Rationale**: 
  - No new npm dependencies (Principle VIII)
  - Simple focus trap, Escape key close, backdrop click implemented in ~100 lines
  - Full control over styling/animations
  - Future-proof: can extract as reusable component for other pages
- **Alternatives Rejected**:
  - headless-ui: adds dependency complexity; overkill for single use case
  - Third-party modal library: increases bundle size
- **Implementation**: Create `EventModal.astro` component with Astro-managed markup + inline client script

### 3. Image Handling & Fallback

**Decision**: Fallback to event icon badge on image 404
- **Rationale**: Graceful degradation; users still understand event type
- **Implementation**: 
  - Use `<img>` with `onerror` handler (client-side fallback)
  - SVG icon wrapper (calendar, event, etc.)
  - Alt text: "[Event Title] — [Date]"
- **Asset Path**: Assumed `public/images/events/` for all event images

### 4. Event Tiles in Modal vs. Tile View

**Decision**: Tile shows only title, date, image; modal shows all fields (title, date, time, location, description, image)
- **Rationale**: 
  - Tiles are glanceable; text-heavy tiles reduce scannability
  - Modal provides detailed view without cluttering grid
  - Responsive; avoids truncation issues on mobile
- **Implementation**: Two separate rendering paths in page component

### 5. Today's Date Reference

**Decision**: Use Astro build time as "today"
- **Rationale**: 
  - Events.md is regenerated on each deploy; build time is reliable
  - No client-side date logic needed (Principle III: Backend Authority)
  - All event filtering deterministic and verifiable at build time
- **Implementation**: Astro `new Date()` in build context; compare against event.date
- **Note**: Maintainers must deploy to reflect status changes (e.g., after event date passes)

### 6. Modal Animation

**Decision**: Fade-in/scale-up entrance with 250ms duration
- **Rationale**: Smooth, modern feel; quick enough to feel responsive
- **CSS**: Tailwind opacity/scale utilities + transition classes
- **Backdrop**: Semi-transparent dark with blur effect

### 7. Maintainer Workflow Documentation

**Decision**: Create one-page event update guide + Claude Code prompt template
- **Rationale**: Non-technical maintainers need clear, concise instructions
- **Location**: `specs/coa-30-get-involved/research.md` (Claude Code prompt section)
- **Formats Supported**: Markdown list, JSON array, natural language
- **Output**: Automated events.md generation with review step before commit

### 8. Pagination/Growth Strategy

**Decision**: No pagination MVP; document growth strategy for 100+ events
- **Rationale**: 5-10 upcoming + 3-5 past events sufficient for launch; page load remains fast
- **Future**: If past events exceed 20, add "Show More" button or pagination
- **Note**: events.md structure supports unlimited events; refactor only needed if UX/perf becomes issue

---

## Phased Delivery

### Phase 1: Foundation & Data Layer (Sprint 1)

**Objective**: Build event parsing infrastructure and data file structure

**Tasks**:
- [ ] Create `src/data/events.md` with initial seed data (5 upcoming, 3 past events)
- [ ] Create `src/lib/events/types.ts` with Event, EventSection TypeScript interfaces
- [ ] Create `src/lib/events/parser.ts` to parse YAML front-matter blocks from events.md
- [ ] Create `src/lib/events/validator.ts` to validate event fields (required, type, format)
- [ ] Create `src/lib/events/filters.ts` to filter by status and sort chronologically
- [ ] Write unit tests for parser, validator, filters in `src/lib/events/parser.test.ts`

**Deliverables**:
- Tested event parsing pipeline
- Type-safe Event interface
- Validation with clear error messages
- Sort/filter logic verified by tests

**Dependencies**: None (Phase 1 is foundational)

**Test Coverage**: 
- Parser: valid YAML, missing fields, invalid dates, duplicate IDs
- Validator: required vs optional fields, date format, status enum
- Filters: upcoming/past separation, chronological sort, tiebreaker

---

### Phase 2: Component Architecture (Sprint 1, end)

**Objective**: Build reusable Astro/React components for event display

**Tasks**:
- [ ] Create `src/components/EventTile.astro` to render event card (title, date, image, thumbnail)
- [ ] Create `src/components/EventModal.astro` with client-side JS for interaction (open/close, keyboard, focus trap)
- [ ] Add modal CSS for animations (fade-in, scale-up, backdrop blur)
- [ ] Implement image fallback via onerror handler + SVG placeholder
- [ ] Implement keyboard navigation (Tab, Enter/Space, Escape, focus trap)
- [ ] Implement backdrop click to close modal
- [ ] Write component tests (interactions, focus management, keyboard)

**Deliverables**:
- EventTile component (reusable, takes Event prop)
- EventModal component (reusable, Astro + client JS)
- Keyboard accessibility verified
- Focus management tested
- Image error handling tested

**Dependencies**: Phase 1 (Event types, parsing)

**Test Coverage**:
- Modal open/close via click, backdrop, Escape
- Focus trap: Tab cycles within modal, not escape
- Focus return to tile after close
- Keyboard accessible (Enter/Space opens)
- Image 404 triggers fallback
- Alt text correct format

---

### Phase 3: Page Integration & Data Flow (Sprint 2, early)

**Objective**: Integrate event components into `/get-involved` page

**Tasks**:
- [ ] Refactor `src/pages/get-involved.astro` to read events from events.md (replace hardcoded)
- [ ] Implement event filtering (upcoming/past) and sorting at build time
- [ ] Render "Upcoming Events" section with EventTile components in responsive grid
- [ ] Conditionally render "Past Events" section (hide if empty)
- [ ] Add visual distinction between sections (heading styling, color, typography)
- [ ] Implement empty state placeholders (upcoming: "No upcoming events scheduled...", past: hidden)
- [ ] Test responsive grid (1 col mobile, 2 col tablet, 3-4 col desktop)
- [ ] Verify page load performance < 3 seconds

**Deliverables**:
- `/get-involved` page uses events.md as data source
- Events correctly filtered and sorted
- Responsive grid layout at all breakpoints
- Empty states handled gracefully
- Performance verified

**Dependencies**: Phase 1 (parser, filters), Phase 2 (EventTile, EventModal components)

**Test Coverage**:
- Events parsed and rendered correctly
- Filtering by status works (upcoming/past sections correct)
- Sorting chronological + tiebreaker works
- Grid responsive (mobile, tablet, desktop)
- Empty state shows placeholder or hidden
- Page load time measured

---

### Phase 4: Accessibility & Validation (Sprint 2)

**Objective**: Ensure WCAG AA compliance and build-time validation

**Tasks**:
- [ ] Audit keyboard navigation (Tab focuses tiles, Enter/Space opens modal)
- [ ] Audit focus management (modal traps focus, returns to tile)
- [ ] Audit ARIA labels (modal role, close button, event titles)
- [ ] Audit semantic HTML (h2/h3 headings, section structure)
- [ ] Audit color contrast (section headings, text on backgrounds) WCAG AA
- [ ] Audit alt text (images, fallback placeholders)
- [ ] Verify tap targets 44x44px minimum (mobile)
- [ ] Screen reader testing (modal announced, event details read)
- [ ] Add build-time validation: warn on invalid events, don't block build

**Deliverables**:
- Full WCAG AA accessibility audit passed
- Build-time warnings for malformed events
- Screen reader compatible
- Mobile-friendly tap targets
- No console errors

**Dependencies**: Phase 2 (modal component), Phase 3 (page integration)

**Test Coverage**:
- Keyboard nav end-to-end
- Focus trap verified
- ARIA attributes correct
- Semantic HTML valid
- Alt text present and correct
- Color contrast WCAG AA
- 44x44px tap targets
- Screen reader tested

---

### Phase 5: Maintainer Workflow & Docs (Sprint 2, late)

**Objective**: Enable maintainers to update events independently via Claude Code

**Tasks**:
- [ ] Create `specs/coa-30-get-involved/research.md` with design decisions + Claude Code prompt
- [ ] Document event update workflow (how maintainers provide data to Claude Code)
- [ ] Create one-page event update guide (for non-technical users)
- [ ] Provide event format examples (markdown, JSON, natural language)
- [ ] Document validation output (what warnings to expect)
- [ ] Test Claude Code prompt with 3 format types (markdown, JSON, natural language)
- [ ] Verify generated events.md is valid YAML (no parser errors)
- [ ] Create maintainer onboarding checklist

**Deliverables**:
- Documented Claude Code prompt for event updates
- One-page maintainer guide
- Format examples (markdown, JSON, natural language)
- Tested prompt generates valid events.md
- Onboarding checklist for maintainers

**Dependencies**: Phase 1 (event format, validation), Phase 3 (page integration)

**Test Coverage**:
- Claude Code prompt parses 3+ format types correctly
- Generated events.md valid YAML
- Round-trip test: generate → parse → render (no data loss)
- Maintainer can follow guide without dev help (usability test)

---

### Phase 6: Polish & Final Testing (Sprint 3)

**Objective**: End-to-end testing, performance optimization, documentation finalization

**Tasks**:
- [ ] End-to-end test: add event via Claude Code → deploy → verify renders
- [ ] End-to-end test: change event status upcoming→past → redeploy → verify moves section
- [ ] Lighthouse audit (performance, accessibility, best practices)
- [ ] Visual regression test (tile rendering, modal appearance, responsive layouts)
- [ ] Performance profiling (build time, bundle size, page load)
- [ ] Finalize documentation: API docs, examples, troubleshooting
- [ ] Create quickstart.md for manual testing
- [ ] Prepare for handover to maintainers

**Deliverables**:
- All end-to-end tests passing
- Lighthouse score > 90 (performance, accessibility, best practices)
- Visual regression tests passing
- Documentation complete and maintainer-ready
- Quickstart guide for manual verification

**Dependencies**: All previous phases

**Test Coverage**:
- Complete user flow end-to-end
- Performance benchmarks met (< 3s load, CLS < 0.1)
- Visual consistency across browsers/devices
- No visual regressions from existing design
- Documentation clarity verified by user test

---

## Testing Strategy

### Unit Tests (Vitest)

**File**: `src/lib/events/parser.test.ts`

1. **Parser Tests**
   - Parse valid YAML front-matter block → correct Event object
   - Parse multiple blocks → array of Events
   - Handle missing optional fields gracefully
   - Reject invalid YAML (log warning, skip event)
   - Reject missing required fields (id, title, date, image, status)
   - Reject invalid date format (not YYYY-MM-DD)
   - Reject duplicate IDs (use first, warn on second)
   - Reject invalid status (not "upcoming" or "past")

2. **Validator Tests**
   - Valid event passes all checks
   - Missing required field → validation error
   - Invalid date format → validation error
   - Invalid status enum → validation error
   - Optional fields allowed to be undefined

3. **Filter Tests**
   - Filter by status: "upcoming" events have date >= today
   - Filter by status: "past" events have date < today
   - Sort upcoming events chronological ascending
   - Sort past events chronological descending
   - Tiebreaker: same date → alphabetical by title
   - Empty result set handled correctly

### Component Tests (Optional: Vitest + Astro)

1. **EventTile Component**
   - Renders title, date, image
   - Renders optional fields (time, location) if present
   - Image fallback on 404
   - Alt text format correct
   - Clickable (accessible via click, Enter, Space)

2. **EventModal Component**
   - Opens on tile click
   - Displays full event details
   - Close button functional
   - Backdrop click closes
   - Escape key closes
   - Focus trap (Tab cycles within modal)
   - Focus returns to tile after close
   - Animations smooth (no console errors)

### Integration Tests (E2E manual)

1. **Page Integration**
   - `/get-involved` loads without errors
   - Upcoming Events section renders all upcoming events
   - Past Events section renders past events (or hidden if empty)
   - Events correctly filtered and sorted
   - Responsive layout at all breakpoints (1/2/3-4 columns)

2. **User Flows**
   - Click tile → modal opens → close button → modal closes → focus returns
   - Click tile → modal opens → press Escape → modal closes
   - Click tile → modal opens → click backdrop → modal closes
   - Tab through tiles → all focusable → Enter opens modal
   - Mobile: tap tile → modal fits viewport → close button accessible
   - Screen reader: modal announced, event details readable

3. **Maintainer Workflow**
   - Provide event data to Claude Code (markdown format)
   - Claude Code generates valid events.md
   - Run `npm run build` → no errors
   - Deploy → events appear on live site
   - Update event status → redeploy → event moves section

### Build-Time Validation Tests

1. **Error Handling**
   - Missing required field → build warning (not error)
   - Malformed YAML → build warning (not error)
   - Duplicate ID → use first, warn on second
   - Invalid date → warn, skip event
   - Valid events still render despite warnings

2. **Performance**
   - Build completes in < 30s with 20 events
   - Lighthouse score > 90 (performance, accessibility)
   - Page load < 3 seconds
   - CLS < 0.1

### Accessibility Tests (Manual)

1. **Keyboard Navigation**
   - Tab through page: tiles focusable in order
   - Tile focused: Enter or Space opens modal
   - Modal open: Tab cycles through focusable elements (close button, content)
   - Modal open: Escape closes modal
   - Modal closed: focus returns to opened tile

2. **Screen Reader**
   - Modal announced as dialog/modal region
   - Close button label announced
   - Event title announced as heading
   - Date, location, description announced
   - Image alt text announced

3. **Color Contrast**
   - Section headings (purple on white) WCAG AA 4.5:1
   - Body text (gray/black on white) WCAG AA 4.5:1
   - Use WebAIM contrast checker

4. **Responsive Layout**
   - Mobile <640px: 1 column, no overflow
   - Tablet 640-1024px: 2 column, no overflow
   - Desktop >1024px: 3-4 column, no overflow
   - Tap targets 44x44px minimum

---

## Critical Files & Components

| File | Type | Purpose | Status |
|------|------|---------|--------|
| `src/data/events.md` | Data | Event data store (YAML front-matter) | NEW |
| `src/lib/events/types.ts` | TS | Event, EventSection interfaces | NEW |
| `src/lib/events/parser.ts` | TS | Parse events.md YAML | NEW |
| `src/lib/events/validator.ts` | TS | Validate event fields | NEW |
| `src/lib/events/filters.ts` | TS | Filter/sort events | NEW |
| `src/lib/events/parser.test.ts` | Test | Unit tests for parser logic | NEW |
| `src/components/EventTile.astro` | Component | Event tile card | NEW |
| `src/components/EventModal.astro` | Component | Modal detail view | NEW |
| `src/pages/get-involved.astro` | Page | Main page (modified) | MODIFY |
| `specs/coa-30-get-involved/research.md` | Docs | Design decisions, Claude Code prompt | NEW |
| `specs/coa-30-get-involved/quickstart.md` | Docs | Manual testing guide | NEW |

---

## Research & Open Questions

See `research.md` for detailed:
- Design decisions rationale (modal approach, date handling, pagination strategy)
- Claude Code prompt template for maintainer workflow
- Image asset organization guidelines
- Growth strategy for 100+ events (pagination, filtering, infinite scroll)
- Rollback plan if events.md becomes corrupted or too large

---

## Constitution Compliance Summary

All 9 principles addressed:

✅ **I. User Outcomes First**: Three user stories with measurable success criteria
✅ **II. Test-First**: All AC testable; unit + integration tests planned
✅ **III. Backend Authority**: Build-time filtering/sorting; no client-side inference
✅ **IV. Error Semantics**: Build-time validation with specific warnings
✅ **V. AppShell Integrity**: Integrates into existing page layout
✅ **VI. Accessibility**: Full WCAG AA + keyboard nav + screen reader
✅ **VII. Immutable Data Flow**: events.md → build → component → render
✅ **VIII. Dependency Hygiene**: No new npm deps; vanilla JS for modal
✅ **IX. Cross-Feature Consistency**: Follows ScoreCard/ResourceCard patterns

---

## Success Criteria (Measurable)

All SC from spec achievable with this plan:

- **SC-001**: Modal opens/closes without errors, displays all metadata ✅
- **SC-002**: Past Events section visible and populated (hidden if empty) ✅
- **SC-003**: Maintainers update via Claude Code workflow ✅
- **SC-004**: 100% of event images valid (fallback for broken) ✅
- **SC-005**: Page load < 3s, CLS < 0.1 ✅
- **SC-006**: Sections visually distinct ✅
- **SC-007**: Claude Code parses 3+ formats (markdown, JSON, natural language) ✅
- **SC-008**: Modal smooth animations, no jank ✅
- **SC-009**: Maintainer success on first attempt (documented workflow) ✅
- **SC-010**: events.md remains valid YAML after updates ✅
- **SC-011**: Responsive at all breakpoints ✅
- **SC-012**: Full keyboard + screen reader accessibility ✅

---

## Next Steps

1. **Review & Approve Plan**: Confirm design decisions (modal, date handling, empty state), image asset path
2. **Create Tasks Phase**: Break plan into atomic, sequenced tasks (task.md)
3. **Phase 1 Kickoff**: Build event data layer and parsing logic
4. **Parallel Work**: Phase 2 component development starts once Phase 1 types are defined

---

## Notes for Implementation Team

- **Naming Convention**: Use kebab-case for event IDs (e.g., "bendigo-phoenix-vs-albury")
- **Image Paths**: Assume `public/images/events/` directory; document size requirements (e.g., 400x250px, < 200KB)
- **Time Format**: Event times in 24-hour HH:MM format, assumed AEST (Bendigo local time)
- **Markdown Parsing**: Use simple regex/string split for YAML blocks; full YAML parser not needed (Astro has built-in)
- **Build Performance**: Keep events.md < 100KB; at 100 events (~200 bytes each), still safe
- **Testing Philosophy**: Write tests first; implementation follows (Principle II)
- **Accessibility**: Use native HTML `<dialog>` element if confident in Astro support; else custom `<div role="dialog">`
