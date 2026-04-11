# Implementation Plan: Seasons Page (COA-24)

**Branch**: `cameronwalsh/coa-24-seasons-page`  
**Date**: 2026-04-11  
**Spec**: `specs/coa-24-seasons-page/spec.md`  
**Status**: READY_FOR_IMPLEMENTATION

---

## Executive Summary

The Seasons page (COA-24) enables coaches and parents to view seasonal information including current, next, and previous season details with registration costs and key dates. The feature is built in Astro with static/interactive components, uses hardcoded placeholder data (until PlayHQ API integration), and must meet WCAG 2.1 AA accessibility standards with keyboard navigation and responsive design across mobile, tablet, and desktop.

**Key Deliverables**:
- Season tile grid (Current, Next, Previous, Archive)
- Modal detail view with registration costs and key dates
- Full keyboard accessibility (Tab, Enter, Escape)
- Responsive layout (1-col mobile, 2-col tablet, 4-col desktop)
- Error states with explicit placeholder messaging
- No new dependencies required

---

## Technical Context

### Technology Stack
- **Framework**: Astro 6.1.1 (static site generation + client-side interactivity)
- **Styling**: Tailwind CSS 4.2.2 (utility-first, mobile-first)
- **Testing**: Vitest (unit/integration tests)
- **Target Platform**: Web (desktop, tablet, mobile)
- **Layout System**: BaseLayout (existing Astro component)
- **Component Language**: Astro components (.astro files) with optional client-side JavaScript

### Performance Targets
- **Initial Render**: Data must not block First Contentful Paint (FCP); defer PlayHQ fetch to background
- **Detail View Animation**: Open/close transitions complete within 300ms
- **Data Fetch (MVP)**: Hardcoded placeholder data loads instantly; PlayHQ integration future phase
- **Cumulative Layout Shift (CLS)**: < 0.1 when detail view opens/closes
- **Responsive**: All breakpoints < 768px (mobile), 768-1024px (tablet), > 1024px (desktop)

### Accessibility Standards
- WCAG 2.1 AA compliance mandatory
- Keyboard navigation required (Tab, Enter, Escape)
- Focus indicators (min 3px, 3:1 contrast)
- Touch targets 44x44px minimum on mobile
- ARIA labels for all interactive elements
- Semantic HTML (role, aria-label, aria-expanded)

### Data Model (Pre-API)
```typescript
interface Season {
  id: string
  name: string
  startDate: string // ISO 8601
  endDate: string // ISO 8601
  role: 'current' | 'next' | 'previous' | 'archive'
  status: 'active' | 'coming_soon' | 'completed'
}

interface KeyDate {
  label: string
  date: string // ISO 8601
  description?: string
}

interface RegistrationCost {
  id: string
  category: string
  cost: number // AUD decimal
  description?: string
}
```

---

## Constitution Compliance

### Principle I: User Outcomes First
- ✅ **PASS**: P1/P2/P3 user stories have measurable outcomes (click count, page load visibility, refresh behavior)
- ✅ **PASS**: Each story independently testable and shippable
- ✅ **PASS**: Success criteria tied to user behavior (viewing, clicking, scrolling)

### Principle II: Test-First Discipline
- ✅ **PASS**: All acceptance criteria in Given/When/Then format; testable before implementation
- ✅ **PASS**: Will write failing tests for each user story before component code
- ✅ **PASS**: Tests verify user outcomes (detail view opens, focus returns, keyboard works)

### Principle III: Backend Authority & Invariants
- ✅ **PASS**: Season role (`current`/`next`/`previous`/`archive`) determined server-side only
- ✅ **PASS**: Client MUST NOT infer role from dates; receives pre-computed value from backend
- ✅ **PASS**: Registration costs read-only from PlayHQ; no client-side pricing calculation
- ✅ **PASS**: Archive visibility (2+ years) server-determined; conditional rendering on client

### Principle IV: Error Semantics & Observability
- ✅ **PASS**: All error states explicit: "Data unavailable", "No scheduled dates announced yet", "Registration pricing to be confirmed", "Season details are temporarily unavailable; check back soon"
- ✅ **PASS**: Errors must log to observability (console.error with timestamp, field, status code)
- ✅ **PASS**: Distinguishes recoverable errors (missing field) from fatal (API 5xx)

### Principle V: AppShell Integrity
- ✅ **PASS**: Feature uses existing BaseLayout; no custom navigation shell
- ✅ **PASS**: Responsive design at all breakpoints via Tailwind mobile-first approach
- ✅ **PASS**: Detail view modal maintains page structure; no cumulative layout shift

### Principle VI: Accessibility First
- ✅ **PASS**: All tiles and buttons keyboard accessible (Tab to focus, Enter to activate, Escape to close)
- ✅ **PASS**: Visible focus indicators (min 3px outline, 3:1 contrast) on all interactive elements
- ✅ **PASS**: Semantic HTML with role, aria-label, aria-expanded, aria-describedby where needed
- ✅ **PASS**: WCAG AA contrast (4.5:1 normal text, 3:1 large text)
- ✅ **PASS**: Touch targets 44x44px minimum on mobile

### Principle VII: Immutable Data Flow
- ✅ **PASS**: One-way data: Backend → Frontend (read-only)
- ✅ **PASS**: No client-side mutation of season data; state limited to UI (detail view open/close)
- ✅ **PASS**: Detail view state isolated; doesn't modify underlying season data

### Principle VIII: Dependency Hygiene
- ℹ️ **INFO**: No new third-party dependencies required
- ℹ️ **INFO**: Uses existing Astro, Tailwind, Vitest already in project
- ℹ️ **INFO**: Future PlayHQ API integration will introduce API client dependency (scope deferred)

### Principle IX: Cross-Feature Consistency
- ✅ **PASS**: Reuses existing tile card component patterns from current `src/pages/seasons.astro`
- ✅ **PASS**: Follows established Phoenix color scheme, typography, spacing conventions
- ✅ **PASS**: Detail view modal pattern consistent with EventModal.astro precedent
- ✅ **PASS**: Accessibility patterns match frontend standards (focus management, ARIA)

**Summary**: Feature is constitutionally sound. All 9 principles either PASS or require no action (Principle VIII).

---

## Project Structure

```
src/
├── pages/
│   └── seasons.astro                    (Main page component)
├── components/
│   ├── SeasonTile.astro                 (Reusable tile card)
│   ├── SeasonDetailModal.astro          (Detail view modal)
│   ├── KeyDatesSection.astro            (Key dates card section)
│   ├── RegistrationCostsCard.astro      (Registration costs table)
│   └── __tests__/
│       ├── SeasonTile.test.ts
│       ├── SeasonDetailModal.test.ts
│       ├── KeyDatesSection.test.ts
│       └── seasons.integration.test.ts
├── layouts/
│   └── BaseLayout.astro                 (Existing layout)
└── lib/
    ├── seasons/
    │   ├── types.ts                     (Season, KeyDate, RegistrationCost types)
    │   ├── constants.ts                 (Hardcoded placeholder data)
    │   ├── utils.ts                     (Formatting, date logic)
    │   └── api.ts                       (PlayHQ API integration - future)

specs/coa-24-seasons-page/
├── spec.md                              (Requirements)
├── plan.md                              (This file)
├── research.md                          (PlayHQ API investigation)
├── data-model.md                        (Schema for seasons data)
└── contracts/
    └── api.md                           (PlayHQ API response shapes)
```

### Component Breakdown

#### `src/pages/seasons.astro`
- Main page entry point
- Wraps BaseLayout with title and description
- Renders Hero section (existing)
- Orchestrates Key Dates section, Season tiles grid, detail modal state
- Manages detail view open/close state with client-side JavaScript

#### `src/components/SeasonTile.astro`
- Reusable season card with emoji icon, title, status badge
- Props: `season` (Season object), `isActive` (boolean for visual state)
- Emits click event to parent for detail view trigger
- Keyboard accessible (role="button", tabindex="0", Enter/Space to activate)
- Mobile-friendly with min-height, consistent padding

#### `src/components/SeasonDetailModal.astro`
- Modal overlay (fixed positioning, backdrop opacity)
- Renders inside detail view container
- Contains: close button (top-right), Registration Costs card (top), Key Dates card (below)
- Props: `season` (Season object), `isOpen` (boolean), `onClose` (callback)
- Dismissible via Escape key, close button, or click outside (with focus management)

#### `src/components/RegistrationCostsCard.astro`
- Table of category → cost rows
- Error state: "Registration pricing to be confirmed" if no data
- Props: `season` (Season object), optional `registrationCosts` (RegistrationCost[])
- Responsive table with horizontal scroll on mobile

#### `src/components/KeyDatesSection.astro`
- Grid of key date cards (Registration Opens, Season Starts, Grading, Finals)
- Error state: "No scheduled dates announced yet" if no data
- Props: `season` (Season object), optional `keyDates` (KeyDate[])
- 4-column grid on desktop, responsive to 2-col tablet, 1-col mobile

#### `src/lib/seasons/types.ts`
- TypeScript interfaces for Season, KeyDate, RegistrationCost
- Enums for role and status

#### `src/lib/seasons/constants.ts`
- Hardcoded placeholder data for MVP:
  - Winter 2026 (current)
  - Spring 2026 (next, coming soon)
  - Summer 2025/26 (previous)
  - No archive (< 2 years of data)

#### `src/lib/seasons/utils.ts`
- `formatDate()`: Convert ISO date to readable format (e.g., "June 1, 2026")
- `getSeasonRole()`: Placeholder for server-side logic (client must not use)
- `getArchiveSeasons()`: Filter logic for archive display (server-side only)

---

## Phased Delivery Strategy

### Phase 1: Foundation & Structure (1 task)
**Objective**: Set up project structure, types, and placeholder data
- Create component directory structure
- Define TypeScript types (Season, KeyDate, RegistrationCost)
- Build constants.ts with hardcoded placeholder data
- Create utils.ts with helper functions
- Setup component test directory

**Deliverable**: No visible UI changes; foundation ready for component implementation
**Testing**: Type validation (TS compiler passes)

---

### Phase 2: Core Components (3 tasks)
**Objective**: Build reusable Astro components for tiles, detail view, cards
- SeasonTile.astro: Render season cards with emoji, title, status badge
- SeasonDetailModal.astro: Modal overlay with fixed positioning, backdrop
- RegistrationCostsCard.astro: Table of registration costs with error state
- KeyDatesSection.astro: Grid of key date cards

**Deliverable**: Static component rendering (no interactivity yet)
**Testing**: 
- Unit tests: component renders with valid props
- Unit tests: error states display placeholder text correctly
- Visual regression: layout consistency across breakpoints

---

### Phase 3: Page Integration & Interactivity (2 tasks)
**Objective**: Wire components into seasons.astro page, add detail view open/close logic
- Refactor seasons.astro to use new components
- Add client-side JavaScript for detail view state management
- Implement modal open/close on tile click
- Focus management (return focus to tile on close)

**Deliverable**: P1 user story fully functional (view current season, click, see details, close)
**Testing**:
- Integration tests: click season tile → detail view opens → registration costs visible
- Integration tests: close via button/Escape → detail view closes, focus returns
- Manual keyboard testing: Tab through tiles, Enter to open, Escape to close

---

### Phase 4: Responsive Design & Mobile Polish (1 task)
**Objective**: Ensure tiles and detail view responsive at all breakpoints, mobile UX optimized
- Verify 1-col mobile (< 640px), 2-col tablet (640–1024px), 4-col desktop (> 1024px)
- Test detail view on mobile (full-screen or centered modal)
- Verify touch targets 44x44px minimum
- Test no layout shift when detail view opens/closes (CLS < 0.1)

**Deliverable**: Feature fully responsive, mobile-first approach
**Testing**:
- Responsive testing at 375px, 768px, 1024px, 1920px viewports
- Touch interaction testing on mobile device (or emulator)
- CLS measurement with Lighthouse or Web Vitals

---

### Phase 5: Accessibility & Keyboard Navigation (1 task)
**Objective**: Full WCAG 2.1 AA compliance, keyboard-only navigation
- Add visible focus indicators (3px outline, 3:1 contrast)
- Add aria-label, aria-expanded, aria-describedby to all interactive elements
- Semantic HTML: role="button" on season tiles, role="dialog" on modal
- Test keyboard-only navigation (Tab through all elements, enter to activate, Escape to close)
- Verify focus trap in modal (when open, focus doesn't leave modal)
- Verify contrast ratios (4.5:1 normal, 3:1 large text)

**Deliverable**: Feature passes WCAG AA scanner (Axe, pa11y, or manual audit)
**Testing**:
- Automated accessibility tests: Axe, pa11y
- Manual keyboard navigation test (no mouse)
- Manual screen reader test (NVDA, JAWS, or VoiceOver)
- Contrast checker for all text/button combinations

---

### Phase 6: Error Handling & Empty States (1 task)
**Objective**: Graceful handling of all error/empty scenarios per spec
- PlayHQ API failure: show "Season details are temporarily unavailable; check back soon" banner
- Missing key dates: "No scheduled dates announced yet"
- Missing registration costs: "Registration pricing to be confirmed"
- Partial data (slow registration costs fetch): skeleton loader in costs area
- Next season placeholder: "Coming Soon" visual state, detail view shows "Season details coming soon — check back when registration opens"
- Logging: console.error with timestamp, field, status code for all errors

**Deliverable**: All error/empty states have explicit, helpful messaging
**Testing**:
- Edge case tests: render with missing fields, empty arrays
- Error injection tests: simulate API failures, timeout scenarios
- Logging verification: console.error called with correct info

---

### Phase 7: Testing & Validation (2 tasks)
**Objective**: Comprehensive test coverage, E2E validation, performance measurement
- Unit tests: Each component with valid/invalid props, error states
- Integration tests: Full user workflows (load page, click tile, view details, close)
- E2E tests: Browser-level testing of keyboard navigation, focus management, responsive layout
- Performance testing: CLS measurement, animation duration (300ms), data fetch time

**Deliverable**: Feature 100% tested, passing all performance targets
**Testing**:
- Unit test coverage > 80%
- Integration tests for all P1 user stories
- E2E tests for P1/P2 workflows
- Performance audit (Lighthouse, Core Web Vitals)

---

### Phase 8: Documentation & Next Season Integration (1 task)
**Objective**: Document component API, prepare for PlayHQ API integration
- Component API documentation: props, events, styling customization
- Integration guide: how to connect PlayHQ API when key available
- Archive logic documentation: how archive population works
- Data polling strategy: plan for Next Season placeholder → real data transition

**Deliverable**: Team ready to integrate PlayHQ API post-MVP
**No code changes**: Documentation only

---

## Testing Strategy

### Unit Tests (Per Component)
**Location**: `src/components/__tests__/[Component].test.ts`

#### SeasonTile.test.ts
```
✓ Renders season name and emoji icon
✓ Displays correct status badge (Registration Open, Coming Soon, Past Season)
✓ Accepts click event and triggers callback
✓ Keyboard accessible: Tab focus, Enter/Space to activate
✓ Focus indicator visible (test class applied)
✓ Aria-label matches season name and role
✓ Mobile responsive: full-width on < 768px
```

#### SeasonDetailModal.test.ts
```
✓ Modal opens/closes with isOpen prop
✓ Renders close button with aria-label
✓ Dismissible via close button click
✓ Dismissible via Escape key
✓ Shows registration costs card (from props)
✓ Shows key dates card (from props)
✓ Focus management: focus returns to trigger tile on close
✓ Backdrop click (optional, depends on implementation)
```

#### RegistrationCostsCard.test.ts
```
✓ Renders table with category and cost columns
✓ Error state: "Registration pricing to be confirmed" if no costs
✓ Formats cost as AUD currency (e.g., $150.00)
✓ Renders description text if provided
✓ Mobile responsive: horizontal scroll on < 640px
```

#### KeyDatesSection.test.ts
```
✓ Renders grid of date cards (4-col desktop, 2-col tablet, 1-col mobile)
✓ Error state: "No scheduled dates announced yet" if no dates
✓ Formats dates as readable (e.g., "June 1, 2026")
✓ Displays optional description text
✓ Icons render correctly for each date type
```

### Integration Tests
**Location**: `src/components/__tests__/seasons.integration.test.ts`

```
✓ Page loads with all season tiles visible (Current, Next, Previous)
✓ Click Current Season tile → detail modal opens with registration costs visible
✓ Registration costs card appears above key dates in modal
✓ Close button closes modal, focus returns to tile
✓ Escape key closes modal, focus returns to tile
✓ Tab through all tiles, then into detail modal when open
✓ Next Season placeholder shows "Coming Soon" visual state
✓ Previous Season shows with muted styling
✓ Archive tile hidden when < 2 years data
✓ Detail view open/close animation completes within 300ms
✓ No layout shift when detail view opens (CLS < 0.1 via measurement)
✓ Mobile: tiles stack 1-col, detail modal full-screen or centered
✓ Mobile: touch targets 44x44px minimum
✓ Tablet: tiles display 2-col
✓ Desktop: tiles display 4-col
```

### E2E Tests
**Location**: `src/components/__tests__/seasons.e2e.test.ts` (or Playwright/Cypress suite)

```
✓ Load page in Chrome, Firefox, Safari
✓ User Story 1: View Current Season (click, verify registration costs, close)
✓ User Story 2: View Next Season placeholder (click, see "Coming Soon" message)
✓ User Story 3: View Previous Season (click, verify past dates)
✓ Keyboard-only navigation: Tab through all tiles, open/close with Enter/Escape
✓ Mobile (375px): swipe to close detail view (if applicable), touch targets work
✓ Tablet (768px): 2-col layout, detail view centered
✓ Desktop (1920px): 4-col layout, detail view modal
✓ Error scenario: detail view shows placeholder if data missing
✓ Performance: page load FCP < 2s, detail modal animation 300ms
```

### Accessibility Tests
**Framework**: Axe-core (automated) + manual WCAG 2.1 AA audit

```
✓ No color contrast violations (4.5:1 normal, 3:1 large text)
✓ All buttons/tiles have visible focus indicators
✓ Focus order logical (tiles in order, detail modal last)
✓ All interactive elements have aria-label or aria-describedby
✓ Modal has role="dialog" and is properly marked
✓ Close button has aria-label="Close season details"
✓ Season tiles have aria-expanded when detail view open
✓ No accessibility violations from Axe scan
✓ Manual NVDA/JAWS test: page structure clear, all interactive elements announced
```

### Performance Tests
**Tools**: Lighthouse, Web Vitals, custom CLS measurement

```
✓ First Contentful Paint (FCP): < 2 seconds
✓ Detail view animation: 300ms (measured with DevTools)
✓ Cumulative Layout Shift (CLS): < 0.1 when detail view opens/closes
✓ Time to Interactive (TTI): < 3.5 seconds
✓ Mobile (4G): all above metrics still met
✓ Lighthouse Performance score: > 85
```

---

## Risk Mitigation & Dependencies

### Risk 1: PlayHQ API Not Available at Start
**Impact**: Cannot fetch real season data until API key obtained  
**Mitigation**: Build with hardcoded placeholder data in Phase 1 → substitute API calls in future phase  
**Contingency**: Create abstract `SeasonDataProvider` interface; swap implementations (hardcoded vs. API) without changing components

### Risk 2: Detail View Causes Layout Shift
**Impact**: CLS violation (> 0.1), poor Core Web Vitals  
**Mitigation**: Use fixed positioning for modal (absolute overlay, not DOM reflow); verify CLS < 0.1 in Phase 4  
**Contingency**: If inline expansion required, use CSS `height: 0 → auto` with transition; measure CLS before/after

### Risk 3: Mobile Detail View UX (Small Screen)
**Impact**: Modal might feel cramped; user can't see close button  
**Mitigation**: On mobile, render detail modal full-screen or centered with padding; explicit close button in header  
**Contingency**: Allow swipe-to-close gesture in addition to click-outside and Escape

### Risk 4: Next Season Placeholder Replacement
**Impact**: When real data arrives, page refresh required OR client polling needed  
**Mitigation**: Document data polling strategy for post-MVP; spec allows page refresh for MVP  
**Contingency**: Implement optional polling in Phase 8 (document approach for future integration)

### Risk 5: Archive Display Logic Bug
**Impact**: Archive shown when < 2 years data, or not shown when >= 2 years  
**Mitigation**: Server-side logic only (client must not determine year count); include unit test for archive visibility  
**Contingency**: Log backend response to verify season count and archive inclusion

### Risk 6: Empty/Missing Data States Not Clear
**Impact**: Users confused by blank fields or missing information  
**Mitigation**: All empty states have explicit placeholder text (per spec); Phase 6 dedicated to error handling  
**Contingency**: A/B test placeholder text with users; adjust messaging based on feedback

### Risk 7: Accessibility Regression
**Impact**: Feature ships with WCAG AA violations  
**Mitigation**: Phase 5 dedicated to accessibility; Axe scan + manual audit required before merge  
**Contingency**: Use accessibility linter (eslint-plugin-jsx-a11y) to catch issues in dev

### Risk 8: Performance Degradation
**Impact**: Detail view animation feels slow, CLS spike  
**Mitigation**: Measure performance in Phase 4/7; use Lighthouse and Web Vitals tools  
**Contingency**: Optimize CSS animations (use `transform` instead of width/height); defer non-critical rendering

### External Dependencies
- **PlayHQ API**: Future dependency; contract defined in `specs/coa-24-seasons-page/contracts/api.md` (not yet implemented)
- **Backend Season Role Service**: Assumes backend provides `role` field; no client-side date logic
- **Observability System**: Error logging; assumes app has console or analytics setup

---

## Architecture Decisions

### Decision 1: Modal vs. Inline Expansion
**Choice**: Modal overlay (fixed positioning, backdrop)  
**Rationale**: 
- Avoids cumulative layout shift (no tile reflow)
- Clear focus management (modal closes, focus returns)
- Standard web pattern (users expect modal behavior)
- Accessibility simpler: role="dialog", clear dismiss path (Escape)

**Alternative Considered**: Inline expansion (detail view appears below tile)
- Pros: No backdrop (simpler), mobile-friendly
- Cons: Layout shift risk, focus management trickier, less familiar pattern
- Rejected because spec emphasizes NFR-019 (no reflow)

---

### Decision 2: Hardcoded Data (MVP) vs. Live API
**Choice**: Hardcoded placeholder data until PlayHQ API key available  
**Rationale**:
- Unblocks development while API integration pending
- All data structures in place; minimal code change to swap API calls
- Spec explicitly allows placeholders (FR-003)
- Reduces external dependency risk

**Alternative Considered**: Build full API integration with fallback to hardcoded data
- Pros: Feature ready immediately when API available
- Cons: Extra complexity upfront, API contract undefined, error handling harder to test
- Rejected as over-engineering for MVP

---

### Decision 3: Component Reuse Pattern
**Choice**: Reuse existing tile/card patterns from `src/pages/seasons.astro`  
**Rationale**:
- Spec explicitly recommends reuse (Design Notes)
- Consistent styling, spacing, typography
- Reduces duplicate code
- Maintains design system integrity (Principle IX)

**Alternative Considered**: Build new custom tile components
- Pros: Full control over styling
- Cons: Design inconsistency, extra CSS, diverges from spec guidance
- Rejected to maintain consistency

---

### Decision 4: State Management Approach
**Choice**: Minimal client-side state (detail view open/close only)  
**Rationale**:
- MVP feature has simple interactivity (click to open, press Escape to close)
- No need for state library (React, Zustand, etc.)
- Astro + vanilla JavaScript sufficient
- Supports Principle VII (immutable data flow)

**Alternative Considered**: Vue/React component with state management
- Pros: Richer interactivity later, component reusability
- Cons: Adds build complexity, JavaScript bundle size, unnecessary for MVP
- Rejected as over-engineering; can add later if needed

---

### Decision 5: Accessibility Keyboard Trap vs. Non-Trap
**Choice**: Focus trap in modal (focus stays within modal while open)  
**Rationale**:
- Standard modal behavior (ARIA Authoring Practices Guide)
- Users expect Tab to cycle within modal, not background
- Prevents accidental interaction with tiles while modal open
- Improves accessibility for keyboard-only users

**Alternative Considered**: No focus trap (Tab exits modal to background)
- Pros: Less code, simpler implementation
- Cons: Confusing for keyboard users, not standard modal pattern
- Rejected for accessibility best practice

---

## Open Questions & Research

### Question 1: PlayHQ API Contract
**Status**: Unknown (waiting for API key)  
**Impact**: Affects data model, error handling, caching strategy  
**Research Plan** (Phase 8 / Future):
- Obtain PlayHQ API documentation
- Define Season, KeyDate, RegistrationCost shapes from API
- Document error responses and retry logic
- Plan caching strategy (e.g., SWR, stale-while-revalidate)
- See `specs/coa-24-seasons-page/contracts/api.md` for placeholder contract

### Question 2: Backend Service for Season Role Determination
**Status**: Assumed server-side; implementation TBD  
**Impact**: Client receives pre-computed `role` field; no client-side date logic  
**Research Plan** (Parallel with backend team):
- Define endpoint: GET `/api/seasons` → returns Season[] with `role` pre-assigned
- Clarify role assignment logic: exact boundary conditions (today == startDate?)
- Plan caching/invalidation (e.g., role changes at midnight UTC?)
- See `specs/coa-24-seasons-page/data-model.md` for schema

### Question 3: Data Polling Strategy for Next Season
**Status**: Not required for MVP (page refresh only)  
**Impact**: User experience when Next Season placeholder → real data  
**Research Plan** (Phase 8 / Post-MVP):
- Decide polling interval (every 30 seconds? hourly?)
- Implement optimistic UI update (replace placeholder without page refresh)
- Plan WebSocket alternative for real-time updates
- Document in `specs/coa-24-seasons-page/research.md`

### Question 4: Archive Year Grouping Display
**Status**: Hidden in MVP (spec says "chronological list")  
**Impact**: How to display 5+ old seasons without clutter  
**Research Plan** (Phase 8 / Post-MVP):
- Clarify "chronological list" format: separate cards per year? dropdown groups? scroll list?
- Test usability of archive display with actual user feedback
- Consider performance with 10+ seasons
- Document in `specs/coa-24-seasons-page/research.md`

---

## Success Criteria & Acceptance

### For MVP (Phase 1–7)
- [ ] All P1 user stories implemented and passing E2E tests
- [ ] Feature fully responsive (mobile, tablet, desktop)
- [ ] WCAG 2.1 AA accessibility compliance verified
- [ ] All error states display explicit placeholder text
- [ ] No external dependencies added
- [ ] Test coverage > 80%
- [ ] Performance targets met (CLS < 0.1, animation 300ms)
- [ ] PR ready for review with all checklist items complete

### For Post-MVP (Phase 8+)
- [ ] PlayHQ API contract obtained and documented
- [ ] API integration implementation plan written
- [ ] Next Season polling strategy designed
- [ ] Archive display UX researched and approved

---

## File Checklist

- [x] `spec.md` (requirements document)
- [ ] `plan.md` (this file — **ready for generation**)
- [ ] `research.md` (PlayHQ API, archive logic, polling strategy)
- [ ] `data-model.md` (Prisma schema, if backend needed; or data structure docs)
- [ ] `contracts/api.md` (PlayHQ API response shapes, placeholders)
- [x] `src/components/SeasonTile.astro` (to be created in Phase 2)
- [x] `src/components/SeasonDetailModal.astro` (to be created in Phase 2)
- [x] `src/components/RegistrationCostsCard.astro` (to be created in Phase 2)
- [x] `src/components/KeyDatesSection.astro` (to be created in Phase 2)
- [x] `src/lib/seasons/types.ts` (to be created in Phase 1)
- [x] `src/lib/seasons/constants.ts` (to be created in Phase 1)
- [x] `src/lib/seasons/utils.ts` (to be created in Phase 1)

---

## Next Steps

### Immediate (Next Meeting)
1. Review and approve implementation plan
2. Clarify detail view implementation (confirm modal approach)
3. Validate phased delivery schedule
4. Begin Phase 1: create types and placeholder data

### Week 1
- Complete Phase 1–3 (foundation, components, page integration)
- Pass P1 user story E2E tests
- No accessibility gaps identified

### Week 2
- Complete Phase 4–7 (responsive design, accessibility, testing)
- Full WCAG AA compliance verified
- PR ready for merge

### Week 3+
- Obtain PlayHQ API key and contract
- Begin Phase 8: document integration approach
- Plan next feature iteration

---

## Contact & Escalation

**Feature Lead**: Cameron Walsh  
**Branch**: `cameronwalsh/coa-24-seasons-page`  
**Questions**: Refer to spec.md or create a Linear issue with `coa-24` label
