# COA-30: Get Involved Events Page Redesign

**Status**: READY_FOR_DEV | **Branch**: coa-30-get-involved | **Date**: 2026-04-08

This directory contains the complete specification, technical plan, and testing documentation for the Get Involved Events Page redesign feature.

---

## Documents

| Document | Purpose | Length |
|----------|---------|--------|
| **spec.md** | User stories, requirements, acceptance criteria | 423 lines |
| **plan.md** | Technical approach, phased delivery, architecture | 693 lines |
| **research.md** | Design decisions, Claude Code workflow, alternatives | 586 lines |
| **quickstart.md** | Manual testing guide for QA/validation | 685 lines |

---

## Quick Summary

### What is COA-30?

Redesign the `/get-involved` page to:
1. Replace hardcoded events with dynamic data from `src/data/events.md`
2. Add clickable event tiles that open a modal with full details
3. Separate upcoming and past events into distinct sections
4. Enable maintainers to update events via Claude Code without developer help

### Why This Matters

- **Visitor Value**: Event discovery and detailed information access
- **Community Trust**: Showcasing past activities builds credibility
- **Operational Sustainability**: Non-technical users can maintain events

### Key Technical Decisions

| Decision | Chosen | Rationale |
|----------|--------|-----------|
| Modal Component | Custom vanilla JS | No new dependencies (Principle VIII); full control |
| Data Storage | YAML front-matter in events.md | Readable for maintainers; parsed at build time |
| Today's Date | Build time (Astro static generation) | Deterministic filtering (Principle III); no client-side logic |
| Empty Past Events | Hide section entirely | Cleaner MVP; shows naturally when events accumulate |
| Image Fallback | SVG icon + alt text | Graceful degradation; accessible |
| Pagination | None (MVP) | 5-10 events sufficient; growth strategy documented |

---

## Phased Delivery Overview

### Phase 1: Foundation (Sprint 1)
- Event data layer (types, parser, validator, filters)
- Unit tests for parsing/sorting logic
- Deliverable: Tested event pipeline

### Phase 2: Components (Sprint 1 end)
- EventTile and EventModal Astro components
- Keyboard interaction and focus management
- Component tests
- Deliverable: Reusable, accessible modal component

### Phase 3: Page Integration (Sprint 2 early)
- Integrate into /get-involved page
- Implement filtering and responsive grid
- Empty state handling
- Deliverable: Working feature on page

### Phase 4: Accessibility (Sprint 2)
- WCAG AA compliance audit
- Build-time validation
- Screen reader testing
- Deliverable: Fully accessible feature

### Phase 5: Maintainer Workflow (Sprint 2 late)
- Claude Code prompt template
- One-page maintainer guide
- Tested with 3+ input formats
- Deliverable: Non-technical users can update events

### Phase 6: Polish & E2E (Sprint 3)
- End-to-end testing
- Performance optimization
- Finalize documentation
- Deliverable: Production-ready feature

---

## File Deliverables

### New Files to Create

```
src/data/
└── events.md                    (Event data store with YAML)

src/components/
├── EventTile.astro             (Event tile card)
└── EventModal.astro            (Modal detail view)

src/lib/events/
├── types.ts                     (Event interfaces)
├── parser.ts                    (Parse events.md)
├── validator.ts                (Validate fields)
├── filters.ts                   (Filter/sort logic)
└── parser.test.ts              (Unit tests)
```

### Modified Files

```
src/pages/get-involved.astro    (Use new event system)
```

### Documentation Files (Already Created)

```
specs/coa-30-get-involved/
├── spec.md                     (Requirements)
├── plan.md                     (Technical plan) NEW
├── research.md                 (Design decisions) NEW
├── quickstart.md               (Testing guide) NEW
└── README.md                   (This file) NEW
```

---

## Constitutional Compliance

All 9 CoachCW principles addressed:

- ✅ **I. User Outcomes First**: Three user stories with measurable success criteria
- ✅ **II. Test-First**: All AC testable; unit + integration test strategy
- ✅ **III. Backend Authority**: Build-time filtering; no client-side inference
- ✅ **IV. Error Semantics**: Build-time validation with specific warnings
- ✅ **V. AppShell Integrity**: Integrates into existing page layout
- ✅ **VI. Accessibility First**: WCAG AA + keyboard + screen reader
- ✅ **VII. Immutable Data Flow**: events.md to build to component to render
- ✅ **VIII. Dependency Hygiene**: No new npm dependencies
- ✅ **IX. Cross-Feature Consistency**: Follows ScoreCard/ResourceCard patterns

---

## Success Criteria (All Achievable)

SC-001: Modal displays event details without errors
SC-002: Past Events section visible, correctly filtered
SC-003: Maintainers update events via Claude Code
SC-004: 100% of images valid (fallback for broken)
SC-005: Page load < 3s, CLS < 0.1
SC-006: Sections visually distinct
SC-007: Claude Code parses 3+ formats
SC-008: Modal animations smooth (60fps)
SC-009: Maintainer success on first attempt
SC-010: events.md remains valid YAML
SC-011: Responsive at all breakpoints
SC-012: Keyboard + screen reader accessible

---

## Testing Strategy

### Unit Tests (Vitest)
- Event parsing (valid/invalid YAML, missing fields, duplicate IDs)
- Validation (required fields, date format, status enum)
- Filtering & sorting (upcoming/past, chronological, tiebreaker)

### Component Tests
- Modal interactions (open/close, keyboard, focus trap)
- Image handling (display, 404 fallback, alt text)
- Responsive layout (1/2/3-4 columns)

### E2E Tests (Manual)
- Complete user flows (tile to modal to close to focus return)
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader compatibility
- Mobile responsiveness

### Build-Time Validation
- Error handling (missing fields, malformed YAML, duplicate IDs)
- Performance (build < 30s, page load < 3s)

### QA Verification
- See quickstart.md for complete manual testing guide

---

## Maintainer Workflow (Claude Code)

### How Non-Technical Users Update Events

1. Gather event data in any format:
   - Markdown bullet list
   - JSON array
   - Natural language descriptions
   - CSV or table

2. Go to Claude Code and provide event data

3. Claude Code generates updated events.md

4. Maintainer reviews, commits, and deploys

### Supported Input Formats

- Markdown list
- JSON array
- Natural language descriptions
- CSV/table format

See research.md for complete prompt template and examples.

---

## How to Use These Documents

### For Implementation Team

1. Read plan.md first: Understand technical approach and architecture
2. Review research.md: Understand design decisions and rationale
3. Create tasks.md: Break plan into atomic development tasks
4. Execute Phase 1-6: Follow phased delivery roadmap
5. Use quickstart.md: QA validates feature with manual testing guide

### For Project Manager

1. plan.md: Estimate effort for each phase
2. plan.md Phased Delivery: Schedule sprints
3. Constitution Check: Confirm compliance
4. Success Criteria: Track deliverables

### For QA Engineer

1. spec.md: Read acceptance criteria
2. quickstart.md: Follow manual testing steps
3. research.md: Understand design decisions
4. plan.md: Understand test strategy

### For Maintainers (Non-Technical Users)

1. research.md: Event update guide (one-page section)
2. Claude Code prompt: Use documented workflow
3. Examples: See format examples in research.md

---

## Next Steps

### Immediate (Before Phase 1 Kickoff)

1. Review plan.md and confirm design decisions
2. Confirm image asset path: public/images/events/
3. Decide: Should Past Events be hidden if empty? (DECIDED: Yes)
4. Create initial events.md seed data (5 upcoming, 3 past)
5. Create tasks.md (atomic task breakdown)

### Phase 1 Kickoff

1. Create type definitions and parser logic
2. Write unit tests
3. Build event data validation

### Ongoing

1. Follow phased delivery schedule (Phase 1-6)
2. Track progress against tasks.md
3. Run automated tests on each push
4. Validate against acceptance criteria

---

## Key Metrics & Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page Load | < 3 seconds | Lighthouse audit |
| CLS | < 0.1 | Performance metrics |
| Build Time | < 30 seconds | npm run build timing |
| Modal Animation | 60fps | Performance profiler |
| Build Warnings | 0 | Build output |
| Test Coverage | 80%+ | Vitest report |
| Accessibility | WCAG AA | WebAIM contrast checker |
| Responsive | All breakpoints | Manual testing at 375px/768px/1400px |

---

## Escalation & Questions

### Design Decisions Already Made

All 8 TBD items from spec resolved in plan.md and research.md:

1. Empty Past Events Section -> Hide
2. Modal Component -> Custom vanilla JS
3. Claude Code Workflow -> Prompt template + one-page guide
4. Image Asset Organization -> public/images/events/
5. Today's Date Reference -> Build time (Astro)
6. Pagination Strategy -> None MVP; documented for growth
7. Modal Animation -> Fade-in/scale-up 250ms
8. Sorting Tiebreaker -> Alphabetical by title

### If Questions Arise

- Check research.md (Design Decisions section)
- Check plan.md (Architecture & Design Decisions Resolved section)
- Create issue in Linear if decision needs revisiting

---

## Sign-Off

**Plan created**: 2026-04-08
**Status**: READY_FOR_DEV
**Constitutional compliance**: ALL 9 PRINCIPLES ADDRESSED
**Success criteria**: ALL 12 ACHIEVABLE

Ready to proceed to Phase 1 kickoff.

---

## File Structure Summary

```
specs/coa-30-get-involved/
├── spec.md             (User-provided requirements)
├── plan.md             (Technical approach & phased delivery)
├── research.md         (Design decisions & Claude Code workflow)
├── quickstart.md       (Manual testing guide)
└── README.md           (This file)

Implementation will create:
├── src/data/events.md
├── src/components/EventTile.astro
├── src/components/EventModal.astro
├── src/lib/events/types.ts
├── src/lib/events/parser.ts
├── src/lib/events/validator.ts
├── src/lib/events/filters.ts
├── src/lib/events/parser.test.ts
└── src/pages/get-involved.astro (modified)
```

---

Questions? See plan.md, research.md, or quickstart.md for detailed information.
