# Tasks: Seasons Page (COA-24)

**Input**: Specs from `/specs/coa-24-seasons-page/`  
**Strategy**: Option C Execution Windows (GSD-aligned, 8-phase delivery)  
**Windows**: 6 total, estimate 8–10 hours total (fresh context per window, ~60–90k tokens each)

---

## Format Guide

- **[P]**: Can run in parallel (different files, same window)
- **Window N**: Execution context boundary (fresh 200k context window per window)
- **WINDOW_CHECKPOINT**: Validation gate before next window
- **Traceability**: Each task traces back to spec (FR-XXX, AC-XXX, US-X)
- **Dependency**: What prior work must be done
- **Success Criteria**: Explicit test/acceptance condition

---

## Execution Window 1: Foundation & Structure (BLOCKING)

**Purpose**: Core infrastructure — types, placeholder data, utilities, directory setup  
**Phase**: 1 (Foundation)  
**Token Budget**: 60–75k  
**Duration**: ~1.5 hours  
**Checkpoint Validation**:
- [ ] TypeScript compiles without errors
- [ ] Placeholder data loads and type-checks
- [ ] Utility functions return expected outputs
- [ ] Test directory structure created
- [ ] Can proceed to Window 2 (components)

---

### T001 [P] Create types.ts with Season, KeyDate, RegistrationCost interfaces

**Window**: 1 (Foundation)  
**Phase**: Types  
**Traceability**: FR-001, FR-003, Key Entities section  
**Dependencies**: None  
**Description**: Create TypeScript interfaces for all season data structures per spec

**What to create**:
- File: `src/lib/seasons/types.ts`
- Interfaces:
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
    cost: number // AUD
    description?: string
  }
  ```
- Enums: `SeasonRole`, `SeasonStatus`
- Export types for re-use across components

**Success Criteria**:
- [ ] File created at correct path
- [ ] All interfaces match spec data model (plan.md, Data Model section)
- [ ] TypeScript compiler: `npx tsc --noEmit` passes without errors
- [ ] Types are exported for import in components

---

### T002 [P] Create constants.ts with hardcoded placeholder data

**Window**: 1 (Foundation)  
**Phase**: Data  
**Traceability**: FR-003 (placeholders allowed), Plan Implementation Notes  
**Dependencies**: T001 (types.ts exists)  
**Description**: Create hardcoded placeholder seasons matching spec until PlayHQ API available

**What to create**:
- File: `src/lib/seasons/constants.ts`
- Exports:
  ```typescript
  export const PLACEHOLDER_SEASONS: Season[] = [
    {
      id: 'winter-2026',
      name: 'Winter 2026',
      startDate: '2026-06-01',
      endDate: '2026-09-30',
      role: 'current',
      status: 'active'
    },
    {
      id: 'spring-2026',
      name: 'Spring 2026',
      startDate: '2026-10-01',
      endDate: '2026-12-31',
      role: 'next',
      status: 'coming_soon'
    },
    {
      id: 'summer-2025-26',
      name: 'Summer 2025/26',
      startDate: '2025-12-01',
      endDate: '2026-02-28',
      role: 'previous',
      status: 'completed'
    }
  ]

  export const PLACEHOLDER_KEY_DATES: Record<string, KeyDate[]> = {
    'winter-2026': [
      // Placeholder: "No scheduled dates announced yet"
    ],
    'spring-2026': [],
    'summer-2025-26': []
  }

  export const PLACEHOLDER_REGISTRATION_COSTS: Record<string, RegistrationCost[]> = {
    'winter-2026': [],
    'spring-2026': [],
    'summer-2025-26': []
  }
  ```
- Matches plan.md placeholder structure (Winter, Spring, Summer; no Archive)

**Success Criteria**:
- [ ] File created at correct path
- [ ] Data matches plan.md Placeholder Structure section
- [ ] All seasons type-check against Season interface
- [ ] No archive seasons in array (< 2 years rule)
- [ ] Data can be imported by components

---

### T003 [P] Create utils.ts with helper functions

**Window**: 1 (Foundation)  
**Phase**: Utilities  
**Traceability**: FR-001 (display logic), spec implementation notes  
**Dependencies**: T001 (types.ts)  
**Description**: Create utility functions for formatting and filtering

**What to create**:
- File: `src/lib/seasons/utils.ts`
- Functions:
  ```typescript
  export function formatDate(iso: string): string
    // Convert "2026-06-01" → "June 1, 2026"
    // Return "Date TBA" if invalid

  export function shouldShowArchive(seasons: Season[]): boolean
    // Return true if seasons include 2+ distinct calendar years
    // Used for conditional rendering (server-side only, but exported for reference)

  export function getSeasonRole(season: Season): string
    // Helper: returns human-readable role label ("Current", "Next", "Previous", "Archive")

  export function getCurrencyFormatted(amount: number): string
    // Format 150.00 → "$150.00"
    // Locale: en-AU (AUD)
  ```
- All return types typed
- No client-side date logic (per Principle VII); helper only formats

**Success Criteria**:
- [ ] File created at correct path
- [ ] All functions export and are callable
- [ ] formatDate() works for valid and invalid inputs
- [ ] getCurrencyFormatted() returns AUD format
- [ ] Functions are pure (no side effects)
- [ ] Unit tests written before implementation

---

### T004 [P] Create component test directory structure and fixture data

**Window**: 1 (Foundation)  
**Phase**: Testing Infrastructure  
**Traceability**: Principle II (test-first), plan.md Testing Strategy  
**Dependencies**: T001, T002  
**Description**: Set up test directory and create mock/fixture data for component testing

**What to create**:
- Directory: `src/components/__tests__/`
- File: `src/components/__tests__/fixtures.ts`
  ```typescript
  export const mockSeason: Season = { /* current season */ }
  export const mockKeyDates: KeyDate[] = [ /* fixture */ ]
  export const mockRegistrationCosts: RegistrationCost[] = [ /* fixture */ ]
  
  // Edge cases
  export const mockSeasonNoData: Season = { /* all empty */ }
  export const mockSeasonMissingFields: Season = { /* partial */ }
  ```
- Vitest configuration already exists (project assumption)
- Fixtures match types.ts interfaces

**Success Criteria**:
- [ ] Directory created at correct path
- [ ] fixtures.ts exports mock data that type-checks
- [ ] All fixtures match Season/KeyDate/RegistrationCost interfaces
- [ ] Fixtures used in T005+ tests

---

[WINDOW_CHECKPOINT_1]

**Before proceeding to Window 2**:
- [ ] T001: types.ts created, TypeScript compiles
- [ ] T002: constants.ts created, data loads without error
- [ ] T003: utils.ts created, functions callable and typed
- [ ] T004: Test directory and fixtures created
- [ ] All files located at correct paths per spec structure (plan.md)
- [ ] No TypeScript errors when running `npx tsc --noEmit`

**If checkpoint passes**: Proceed to Window 2 (component development)  
**If checkpoint fails**: Debug and fix within Window 1; do NOT skip ahead

---

## Execution Window 2: Core Components — SeasonTile & DetailModal

**Purpose**: Build reusable Astro components for season tiles and detail view modal  
**Phases**: 2 (Core Components), 3 (Integration) preparation  
**Token Budget**: 80–100k  
**Duration**: ~2–2.5 hours  
**Checkpoint Validation**:
- [ ] SeasonTile renders with valid props
- [ ] SeasonDetailModal opens/closes correctly
- [ ] Unit tests for both components pass
- [ ] Can proceed to Window 3 (full page integration)

---

### T005 [P] Write unit tests for SeasonTile component (test-first)

**Window**: 2 (Components)  
**Phase**: 2 Testing (write FIRST, must fail before T007 implementation)  
**Traceability**: AC-1.1 (Current Season visible), AC-1.2 (clickable), AC-1.4 (focus management)  
**Dependencies**: T004 (fixtures available)  
**Description**: Write failing unit tests for SeasonTile component

**What to create**:
- File: `src/components/__tests__/SeasonTile.test.ts`
- Tests (must FAIL initially):
  ```
  ✓ Renders season name and status badge
  ✓ Displays role-based emoji icon (current, next, previous, archive)
  ✓ Accepts onClick callback and invokes on click
  ✓ Accepts onKeyDown for keyboard events (Enter/Space)
  ✓ Has role="button" and tabindex="0" for keyboard accessibility
  ✓ Has aria-label describing season and role
  ✓ Applies focus class when focused (for visible indicator)
  ✓ Mobile responsive: full-width on < 768px
  ✓ Shows "Coming Soon" visual state when status = 'coming_soon'
  ✓ Shows muted styling when role = 'previous' or 'archive'
  ```
- Use Vitest + jsdom (or Astro test utilities)
- All tests should FAIL before component implementation

**Test Status**: **MUST FAIL** before Window 3

---

### T006 [P] Write unit tests for SeasonDetailModal component (test-first)

**Window**: 2 (Components)  
**Phase**: 2 Testing (write FIRST, must fail before T008 implementation)  
**Traceability**: AC-1.2 (detail view opens), AC-1.4 (close and focus), NFR-001/NFR-002 (keyboard)  
**Dependencies**: T004 (fixtures available)  
**Description**: Write failing unit tests for SeasonDetailModal component

**What to create**:
- File: `src/components/__tests__/SeasonDetailModal.test.ts`
- Tests (must FAIL initially):
  ```
  ✓ Renders when isOpen = true
  ✓ Hidden when isOpen = false
  ✓ Has role="dialog" and aria-label
  ✓ Renders close button with aria-label="Close season details"
  ✓ Renders RegistrationCostsCard above KeyDatesSection
  ✓ Calls onClose callback on close button click
  ✓ Calls onClose callback on Escape key press
  ✓ Accepts registrationCosts and keyDates props and displays them
  ✓ Handles empty keyDates: shows placeholder text
  ✓ Handles empty registrationCosts: shows placeholder text
  ✓ Has backdrop with opacity
  ✓ Focus trap: Tab doesn't exit modal to background (if implemented)
  ```
- All tests should FAIL before component implementation

**Test Status**: **MUST FAIL** before Window 3

---

### T007 Create SeasonTile.astro component

**Window**: 2 (Components)  
**Phase**: 2 Implementation (after tests fail)  
**Traceability**: AC-1.1 (visible), AC-1.2 (clickable), AC-1.4 (keyboard)  
**Dependencies**: T005 (tests must exist and fail), T001 (types), T003 (utils)  
**Description**: Implement SeasonTile component to render season card

**What to create**:
- File: `src/components/SeasonTile.astro`
- Props: `season: Season`, `onClick?: () => void`
- Renders:
  - Emoji icon based on season role (current → 🏆, next → 📅, previous → 📚, archive → 📦)
  - Season name and role label
  - Status badge ("Registration Open", "Coming Soon", "Past Season")
  - Full-width responsive container
  - Semantic HTML: `<button>` or `<div role="button" tabindex="0">`
  - aria-label: "Current Season: Winter 2026, click to view details"
- Styling:
  - Tailwind classes (mobile-first responsive)
  - Min 44x44px touch target on mobile
  - Visible focus indicator (ring-2 ring-offset-2 on focus)
  - "Coming Soon" state: reduced opacity, disabled cursor
  - "Previous" state: muted text color
- No client-side JavaScript in this phase (interactivity added in Window 3)

**Test Status**: T005 must PASS after implementation

---

### T008 Create SeasonDetailModal.astro component

**Window**: 2 (Components)  
**Phase**: 2 Implementation (after tests fail)  
**Traceability**: AC-1.2 (opens), AC-1.4 (closes, focus), NFR-001 (keyboard)  
**Dependencies**: T006 (tests must exist and fail), T001 (types)  
**Description**: Implement modal component for season detail view

**What to create**:
- File: `src/components/SeasonDetailModal.astro`
- Props: `season: Season`, `isOpen: boolean`, `onClose?: () => void`, `registrationCosts?: RegistrationCost[]`, `keyDates?: KeyDate[]`
- Renders:
  - Modal overlay (fixed positioning, z-index layer)
  - Backdrop with opacity (click outside to close, optional)
  - Close button (top-right), aria-label="Close season details"
  - RegistrationCostsCard component (slot or child)
  - KeyDatesSection component (slot or child)
  - role="dialog", aria-label, aria-describedby for accessibility
  - Mobile-friendly: full-screen or centered modal with padding
- Styling:
  - Fixed positioning, center on desktop
  - Max-width constraint (max-w-2xl in Tailwind)
  - Smooth fade-in/fade-out animation (300ms per spec, NFR-017)
  - No layout shift when opens/closes (CLS < 0.1, NFR-019)
- Client-side: minimal (open/close state managed by parent; Astro island if needed)

**Test Status**: T006 must PASS after implementation

---

### T009 [P] Create RegistrationCostsCard.astro component

**Window**: 2 (Components)  
**Phase**: 2 Implementation  
**Traceability**: FR-005 (registration costs visible), FR-007 (accurate pricing)  
**Dependencies**: T001 (types), T003 (utils)  
**Description**: Implement registration costs table card

**What to create**:
- File: `src/components/RegistrationCostsCard.astro`
- Props: `season: Season`, `registrationCosts?: RegistrationCost[]`
- Renders:
  - Card container with padding and border
  - Table: Category | Cost columns
  - Each cost formatted via `getCurrencyFormatted()` (AUD)
  - Optional description text below cost
  - **Error state**: If no costs, show "Registration pricing to be confirmed" (placeholder text, not blank)
  - Responsive table: horizontal scroll on mobile (< 640px)
  - Accessible: table semantic HTML, th headers

**Test Status**: Unit tests (T010) must verify before T008 calls this component

---

### T010 [P] Create KeyDatesSection.astro component

**Window**: 2 (Components)  
**Phase**: 2 Implementation  
**Traceability**: FR-001 (key dates visible above tiles), AC-1.3 (dates in detail view)  
**Dependencies**: T001 (types), T003 (utils)  
**Description**: Implement key dates grid card

**What to create**:
- File: `src/components/KeyDatesSection.astro`
- Props: `keyDates?: KeyDate[]`, `season?: Season`
- Renders:
  - Grid container: 4-col on desktop (> 1024px), 2-col on tablet (640–1024px), 1-col on mobile (< 640px)
  - Each date card: label, formatted date via `formatDate()`, optional description
  - Icon per date type (e.g., 📝 for registration, ⚽ for season start, 🏆 for finals)
  - **Error state**: If no dates, show "No scheduled dates announced yet" (placeholder, not blank)
  - Responsive: padding and font size scale per breakpoint
  - Accessible: semantic HTML, good contrast

**Test Status**: Unit tests verify layout and error states

---

[WINDOW_CHECKPOINT_2]

**Before proceeding to Window 3**:
- [ ] T005: SeasonTile unit tests PASS
- [ ] T006: SeasonDetailModal unit tests PASS
- [ ] T007: SeasonTile component created and renders correctly
- [ ] T008: SeasonDetailModal component created and renders correctly
- [ ] T009: RegistrationCostsCard component created and renders
- [ ] T010: KeyDatesSection component created and renders
- [ ] All components type-check and render without errors
- [ ] Components can be imported by parent pages
- [ ] No console errors or TypeScript issues

**If checkpoint passes**: Proceed to Window 3 (page integration and interactivity)  
**If checkpoint fails**: Fix component implementation within Window 2; do NOT skip ahead

---

## Execution Window 3: Page Integration & Interactivity (P1 MVP)

**Purpose**: Wire components into seasons.astro page, add detail view modal open/close state and keyboard navigation  
**Phases**: 3 (Page Integration & Interactivity), 4 (Responsive Design) prep  
**Token Budget**: 80–100k  
**Duration**: ~2.5 hours  
**Checkpoint Validation**:
- [ ] seasons.astro page loads with all components visible
- [ ] Click season tile → detail modal opens
- [ ] Close button/Escape key → modal closes, focus returns
- [ ] All P1 AC (AC-1.1 through AC-1.6) passing
- [ ] Can proceed to Window 4 (responsive & accessibility)

---

### T011 [P] Write integration tests for P1 happy path (test-first)

**Window**: 3 (Integration)  
**Phase**: 3 Testing (write FIRST, must fail before T013 implementation)  
**Traceability**: AC-1.1 through AC-1.6 (P1 user story)  
**Dependencies**: T007, T008 (components exist)  
**Description**: Write integration tests for full P1 workflow

**What to create**:
- File: `src/components/__tests__/seasons.integration.test.ts`
- Tests (must FAIL initially):
  ```
  ✓ Page loads with Current Season, Next Season, Previous Season tiles visible
  ✓ Click Current Season tile → detail modal opens
  ✓ Detail modal shows Winter 2026 with registration costs card visible
  ✓ Close button closes modal, focus returns to Current Season tile
  ✓ Escape key closes modal, focus returns to Current Season tile
  ✓ Tab through tiles (mobile: 1 tile, tablet: 2, desktop: 4 visible)
  ✓ Enter key on Next Season (Coming Soon) → modal opens showing placeholder
  ✓ Previous Season tile shows with muted styling
  ✓ No layout shift when modal opens/closes (CLS < 0.1)
  ✓ Detail view animation completes within 300ms
  ```
- Use Astro integration test setup (or Playwright if available)
- All tests should FAIL before implementation

**Test Status**: **MUST FAIL** before Window 4

---

### T012 [P] Write contract tests for detail view interactions (test-first)

**Window**: 3 (Integration)  
**Phase**: 3 Testing (write FIRST)  
**Traceability**: AC-1.2 (clickable), AC-1.4 (keyboard dismissal), NFR-001  
**Dependencies**: T007, T008 (components)  
**Description**: Write keyboard and focus management contract tests

**What to create**:
- File: `src/components/__tests__/seasons.keyboard.test.ts`
- Tests (must FAIL initially):
  ```
  ✓ Tab focus enters first tile
  ✓ Tab through all visible tiles in order
  ✓ Enter on focused tile opens modal
  ✓ Space on focused tile opens modal
  ✓ When modal open, Escape closes it
  ✓ When modal closes, focus returns to originally clicked tile
  ✓ Close button click closes modal and returns focus
  ✓ Tab does NOT exit modal to background (focus trap, if implemented)
  ✓ Modal receives initial focus on open (close button or first interactive element)
  ```
- Mock keyboard events (KeyboardEvent)
- All tests should FAIL

**Test Status**: **MUST FAIL** before Window 4

---

### T013 Refactor/create seasons.astro page with component composition

**Window**: 3 (Integration)  
**Phase**: 3 Implementation (after tests fail)  
**Traceability**: FR-001 (four tiles), FR-002 (key dates above), AC-1.1 (visible), AC-1.2 (clickable)  
**Dependencies**: T011, T012 (tests must exist), T007–T010 (components)  
**Description**: Refactor or create main seasons.astro page integrating all components

**What to create/modify**:
- File: `src/pages/seasons.astro`
- Structure:
  ```astro
  ---
  import BaseLayout from '@/layouts/BaseLayout.astro'
  import SeasonTile from '@/components/SeasonTile.astro'
  import SeasonDetailModal from '@/components/SeasonDetailModal.astro'
  import KeyDatesSection from '@/components/KeyDatesSection.astro'
  import { PLACEHOLDER_SEASONS, PLACEHOLDER_KEY_DATES, PLACEHOLDER_REGISTRATION_COSTS } from '@/lib/seasons/constants'

  const seasons = PLACEHOLDER_SEASONS
  const keyDates = PLACEHOLDER_KEY_DATES
  const registrationCosts = PLACEHOLDER_REGISTRATION_COSTS
  ---

  <BaseLayout title="Seasons" description="View current, upcoming, and past seasons">
    <section class="container">
      <!-- Hero section (existing or new) -->
      <h1>Seasons</h1>

      <!-- Key Dates Section (above tiles) -->
      <KeyDatesSection keyDates={keyDates['winter-2026']} />

      <!-- Season Tiles Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {seasons.map(season => (
          <SeasonTile 
            season={season}
            onClick={() => /* handle open modal */}
          />
        ))}
      </div>

      <!-- Detail Modal (conditionally rendered or always rendered but hidden) -->
      <SeasonDetailModal
        isOpen={/* selectedSeason ? true : false */}
        season={/* selectedSeason */}
        registrationCosts={/* registrationCosts[selectedSeason?.id] */}
        keyDates={/* keyDates[selectedSeason?.id] */}
        onClose={() => /* close modal, return focus */}
      />
    </section>
  </BaseLayout>

  <script>
    // Client-side state management for modal
    // Open/close on tile click
    // Keyboard event listeners (Escape to close)
    // Focus management (store initial focus, return on close)
  </script>
  ```
- Page-level state: selectedSeason, isModalOpen
- Event handlers: handleTileClick, handleModalClose, handleKeydown
- Responsive grid: 1-col mobile, 2-col tablet, 4-col desktop

**Test Status**: T011 and T012 must PASS after implementation

---

### T014 Implement client-side modal state and keyboard event handlers

**Window**: 3 (Integration)  
**Phase**: 3 Implementation (interactivity)  
**Traceability**: AC-1.2 (opens on click), AC-1.4 (Escape to close, focus return)  
**Dependencies**: T013 (seasons.astro page structure), T007–T008 (components)  
**Description**: Add JavaScript for modal open/close, keyboard handling, focus management

**What to create/modify**:
- File: `src/pages/seasons.astro` (add/update `<script>` section)
- Functionality:
  ```typescript
  // State
  let selectedSeasonId: string | null = null
  let initialFocusElement: HTMLElement | null = null

  // Handlers
  function handleTileClick(e: Event, seasonId: string) {
    selectedSeasonId = seasonId
    initialFocusElement = e.currentTarget as HTMLElement
    // Component reactivity updates modal isOpen prop
  }

  function handleModalClose() {
    selectedSeasonId = null
    // Return focus to initial tile
    if (initialFocusElement) {
      setTimeout(() => initialFocusElement?.focus(), 0)
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && selectedSeasonId) {
      handleModalClose()
    }
  }

  // Event listeners
  document.addEventListener('keydown', handleKeydown)
  // Click handlers attached to tiles via onClick props
  ```
- Astro reactivity: use `isOpen` prop on modal to conditionally render/show
- Focus trap implementation (if needed per spec): Tab shouldn't exit modal

**Test Status**: T011, T012 must PASS after implementation

---

[WINDOW_CHECKPOINT_3]

**Before proceeding to Window 4**:
- [ ] T011: Integration tests for P1 happy path PASS
- [ ] T012: Keyboard and focus tests PASS
- [ ] T013: seasons.astro page created/refactored with component composition
- [ ] T014: Client-side modal state and event handlers implemented
- [ ] Click season tile → modal opens with correct season data
- [ ] Escape key or close button → modal closes, focus returns to tile
- [ ] Tab navigation works through tiles
- [ ] All P1 acceptance criteria (AC-1.1 through AC-1.6) validated
- [ ] No console errors or TypeScript issues

**If checkpoint passes**: Proceed to Window 4 (responsive design, mobile, tablet, desktop)  
**If checkpoint fails**: Fix integration issues within Window 3; do NOT skip ahead

---

## Execution Window 4: Responsive Design & Mobile Polish

**Purpose**: Verify responsive layout at all breakpoints (mobile < 640px, tablet 640–1024px, desktop > 1024px), optimize touch targets, test mobile UX  
**Phases**: 4 (Responsive Design & Mobile Polish)  
**Token Budget**: 70–90k  
**Duration**: ~2 hours  
**Checkpoint Validation**:
- [ ] Mobile (375px): 1-col tiles, 44x44px touch targets, readable text
- [ ] Tablet (768px): 2-col tiles, proper spacing
- [ ] Desktop (1920px): 4-col tiles, modal centered, no overflow
- [ ] All viewports: no layout shift (CLS < 0.1)
- [ ] Animation duration verified: 300ms
- [ ] Can proceed to Window 5 (accessibility)

---

### T015 [P] Write responsive design tests (test-first)

**Window**: 4 (Responsive)  
**Phase**: 4 Testing (write FIRST, test at multiple viewports)  
**Traceability**: NFR-007 (all breakpoints), NFR-008 (tile columns), NFR-009 (no CLS)  
**Dependencies**: T013 (seasons.astro page)  
**Description**: Write tests for responsive layout at key breakpoints

**What to create**:
- File: `src/components/__tests__/seasons.responsive.test.ts`
- Tests (must FAIL or need manual verification initially):
  ```
  ✓ Mobile (375px): tiles stack 1-column
  ✓ Mobile: touch targets >= 44x44px
  ✓ Mobile: font sizes >= 12px
  ✓ Mobile: detail modal full-screen or centered with padding
  ✓ Tablet (768px): tiles display 2-columns
  ✓ Tablet: spacing adequate, text readable
  ✓ Desktop (1024px+): tiles display 4-columns
  ✓ Desktop: detail modal centered, max-width applied
  ✓ All viewports: no horizontal overflow
  ✓ All viewports: CLS < 0.1 when modal opens/closes
  ✓ Animation duration: detail modal 300ms (measured with performance API)
  ```
- Use Vitest viewport simulation or manual browser testing
- Some tests may require manual verification (CLS measurement, animation timing)

**Test Status**: Tests verify responsive behavior

---

### T016 [P] Adjust Tailwind responsive classes and mobile-first styling

**Window**: 4 (Responsive)  
**Phase**: 4 Implementation  
**Traceability**: NFR-007, NFR-008 (responsive at all breakpoints), NFR-010 (font sizes, padding)  
**Dependencies**: T013 (seasons.astro), T007–T010 (components)  
**Description**: Refine responsive styling for tiles and modal at all breakpoints

**What to modify**:
- Files: `src/pages/seasons.astro`, `src/components/*.astro`
- Responsive grid for tiles:
  ```tailwind
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
  ```
- SeasonTile responsive padding and font:
  ```tailwind
  class="p-4 md:p-6 text-base md:text-lg"
  ```
- SeasonDetailModal responsive:
  ```tailwind
  max-w-lg md:max-w-2xl; full-screen on mobile or centered
  ```
- Touch targets: verify all buttons/tiles >= 44x44px on mobile (use min-h-11 min-w-11 if needed)
- Font sizes: >= 12px mobile, >= 14px desktop (spec NFR-010)
- No horizontal overflow at any viewport
- Animation: CSS `transition: all 300ms ease-in-out` on modal

**Test Status**: T015 tests should PASS or be satisfied by manual review

---

### T017 [P] Test CLS and animation performance

**Window**: 4 (Responsive)  
**Phase**: 4 Validation (measure, don't code)  
**Traceability**: NFR-017 (300ms animation), NFR-019 (CLS < 0.1)  
**Dependencies**: T013 (seasons.astro), T016 (styling)  
**Description**: Measure and validate Cumulative Layout Shift and animation duration

**What to test**:
- Manual testing with browser DevTools:
  1. Open seasons.astro in Chrome
  2. Open Performance tab
  3. Click season tile, measure modal open animation (should be ~300ms)
  4. Check for layout shifts (CLS should be < 0.1)
  5. Close modal, verify no shifts
  6. Test on mobile viewport (375px) and tablet (768px)
- Use Lighthouse Performance audit (target > 85 score)
- Use web-vitals library if integrated (measure CLS, LCP, FID)

**Success Criteria**:
- [ ] Animation duration: 300ms ± 50ms (acceptable)
- [ ] CLS score: < 0.1 (no noticeable layout shift)
- [ ] Lighthouse Performance: > 85 (or acceptable per project standards)
- [ ] Manual testing on 3+ devices/viewports: no issues

---

[WINDOW_CHECKPOINT_4]

**Before proceeding to Window 5**:
- [ ] T015: Responsive design tests PASS or verified
- [ ] T016: Responsive styling applied, no overflow at any viewport
- [ ] T017: Performance metrics measured and acceptable
  - [ ] Animation: 300ms
  - [ ] CLS: < 0.1
  - [ ] Lighthouse: > 85 or acceptable
- [ ] Mobile (375px): 1-col, 44x44px targets, readable
- [ ] Tablet (768px): 2-col, proper spacing
- [ ] Desktop (1920px): 4-col, centered modal
- [ ] No console errors or warnings

**If checkpoint passes**: Proceed to Window 5 (accessibility & keyboard)  
**If checkpoint fails**: Optimize responsive styling within Window 4; do NOT skip ahead

---

## Execution Window 5: Accessibility & Keyboard Navigation (WCAG 2.1 AA)

**Purpose**: Ensure full WCAG 2.1 AA compliance, keyboard-only navigation, visible focus indicators, ARIA labels, semantic HTML  
**Phases**: 5 (Accessibility & Keyboard Navigation)  
**Token Budget**: 75–90k  
**Duration**: ~2 hours  
**Checkpoint Validation**:
- [ ] All tiles and modal buttons have visible focus indicators (3px, 3:1 contrast)
- [ ] Keyboard-only navigation: Tab through tiles, Enter to open, Escape to close
- [ ] ARIA labels on all interactive elements (tiles, close button, modal)
- [ ] Semantic HTML (role, aria-label, aria-expanded, aria-describedby)
- [ ] Contrast ratios: 4.5:1 normal, 3:1 large text (verified)
- [ ] Axe scan: no critical/serious violations
- [ ] Can proceed to Window 6 (testing & documentation)

---

### T018 [P] Write accessibility contract tests (test-first)

**Window**: 5 (Accessibility)  
**Phase**: 5 Testing (write FIRST, test ARIA, focus, contrast)  
**Traceability**: NFR-001–NFR-006 (keyboard, focus, ARIA, contrast)  
**Dependencies**: T007–T010 (components), T013 (page)  
**Description**: Write automated accessibility tests using Axe, ARIA checks, focus management

**What to create**:
- File: `src/components/__tests__/seasons.accessibility.test.ts`
- Tests (must FAIL initially):
  ```
  ✓ No Axe violations (critical or serious level)
  ✓ All season tiles have role="button" or <button>
  ✓ All tiles have aria-label (e.g., "Current Season: Winter 2026")
  ✓ Detail modal has role="dialog" and aria-label
  ✓ Close button has aria-label="Close season details"
  ✓ Modal has aria-describedby pointing to description element (if applicable)
  ✓ All interactive elements have visible focus indicator (via CSS class)
  ✓ Focus indicator meets 3:1 contrast ratio
  ✓ Text contrast: 4.5:1 normal, 3:1 large text (all combinations)
  ✓ Tab order is logical (tiles in order, modal next)
  ✓ Focus returns to tile on modal close
  ✓ Keyboard-only navigation works end-to-end
  ✓ Escape key closes modal (not intercepted elsewhere)
  ✓ No focus trap outside modal (when closed)
  ```
- Use `axe-core` library for automated scans
- Manual contrast verification (use WCAG contrast checker)
- All tests should FAIL or show violations

**Test Status**: **MUST FAIL** or show violations before T019

---

### T019 [P] Implement ARIA labels, semantic HTML, focus indicators

**Window**: 5 (Accessibility)  
**Phase**: 5 Implementation (after tests reveal gaps)  
**Traceability**: NFR-001–NFR-006 (keyboard, focus, ARIA, contrast)  
**Dependencies**: T018 (tests must exist), T007–T010 (components), T013 (page)  
**Description**: Add ARIA labels, semantic HTML, and visible focus styles

**What to modify**:
- File: `src/components/SeasonTile.astro`
  - Add `role="button"` if div, or use `<button>`
  - Add `aria-label="Current Season: Winter 2026, click to view details"`
  - Add `tabindex="0"` if div
  - Add focus class: `focus:outline-2 focus:outline-offset-2 focus:outline-blue-600` (3px, 3:1 contrast)
  - Add keyboard handler: `onKeyDown` for Enter/Space
- File: `src/components/SeasonDetailModal.astro`
  - Add `role="dialog"`
  - Add `aria-label="Season details for Winter 2026"`
  - Add `aria-describedby` if modal has description
  - Close button: `aria-label="Close season details"`
  - Ensure semantic structure: modal as `<div role="dialog">` or `<dialog>` (if browser support exists)
- File: `src/lib/seasons/utils.ts`
  - Add function `getSeasonAriaLabel(season)` to generate descriptive labels
- All text: verify contrast ratios (4.5:1 normal, 3:1 large text)
  - Background color vs. text color
  - Focus indicator outline vs. background

**Test Status**: T018 tests must PASS after implementation

---

### T020 [P] Keyboard navigation and focus trap implementation

**Window**: 5 (Accessibility)  
**Phase**: 5 Implementation (keyboard-only workflows)  
**Traceability**: NFR-001 (Tab, Enter, Escape), AC-1.4 (close and focus)  
**Dependencies**: T013 (seasons.astro), T018 (keyboard tests)  
**Description**: Implement full keyboard navigation including focus trap in modal (if applicable)

**What to implement**:
- File: `src/pages/seasons.astro` (modify `<script>` section)
- Keyboard handlers:
  ```typescript
  function handleKeydown(e: KeyboardEvent) {
    // Tab: browser default, but ensure focus order is correct
    if (e.key === 'Escape' && selectedSeasonId) {
      handleModalClose()
    }
    // Enter/Space on tile: handled via onKeyDown on SeasonTile
  }

  // Focus trap (modal only, if implemented):
  function setupFocusTrap(modalElement: HTMLElement) {
    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    function handleTabKey(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          (lastElement as HTMLElement).focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          (firstElement as HTMLElement).focus()
        }
      }
    }

    modalElement.addEventListener('keydown', handleTabKey)
  }
  ```
- Test keyboard workflows:
  1. Tab through all tiles (in order)
  2. Enter on tile → modal opens, focus on close button or first interactive element
  3. Tab within modal (closes button, content)
  4. Shift+Tab to go backwards
  5. Escape → modal closes, focus returns to tile
  6. Tab from modal → should NOT cycle back to tiles (focus returns only via Escape/close button)

**Test Status**: T018 keyboard tests must PASS

---

[WINDOW_CHECKPOINT_5]

**Before proceeding to Window 6**:
- [ ] T018: Accessibility tests PASS or reveal specific violations
- [ ] T019: ARIA labels, semantic HTML, focus indicators implemented
- [ ] T020: Keyboard navigation full workflow working (Tab, Enter, Escape, focus trap)
- [ ] All season tiles have aria-label and role="button"
- [ ] Detail modal has role="dialog", aria-label, and close button labeled
- [ ] Focus indicators visible (3px outline, 3:1 contrast)
- [ ] Axe scan: no critical/serious violations
- [ ] Contrast ratios verified: 4.5:1 normal, 3:1 large text
- [ ] Keyboard-only navigation tested: Tab → Enter → Escape → focus returns
- [ ] No console errors

**If checkpoint passes**: Proceed to Window 6 (error handling, testing, docs)  
**If checkpoint fails**: Fix accessibility issues within Window 5; do NOT skip ahead

---

## Execution Window 6: Error Handling, Testing, & Documentation

**Purpose**: Implement error states with explicit messaging, finalize comprehensive test coverage, document component API and integration approach  
**Phases**: 6 (Error Handling & Empty States), 7 (Testing & Validation), 8 (Documentation & Next Season Integration)  
**Token Budget**: 75–90k  
**Duration**: ~2.5 hours  
**Checkpoint Validation**:
- [ ] All error states display explicit placeholder text (no blank fields)
- [ ] Error logging to observability system (console.error with context)
- [ ] Integration tests cover all P1/P2 user stories
- [ ] E2E tests validate keyboard and responsive behavior
- [ ] Test coverage > 80%
- [ ] Component API documented
- [ ] Feature ready for merge

---

### T021 [P] Implement error states and placeholder messaging

**Window**: 6 (Error Handling)  
**Phase**: 6 Implementation  
**Traceability**: NFR-011–NFR-015 (error handling, placeholders, logging)  
**Dependencies**: T007–T010 (components), T013 (page)  
**Description**: Add error states and explicit placeholder messages for empty/missing data

**What to implement**:
- Files: `src/components/*.astro`, `src/pages/seasons.astro`
- Error state implementations:
  ```astro
  <!-- RegistrationCostsCard: empty state -->
  {registrationCosts && registrationCosts.length > 0 ? (
    <table>...</table>
  ) : (
    <p class="text-gray-600">Registration pricing to be confirmed</p>
  )}

  <!-- KeyDatesSection: empty state -->
  {keyDates && keyDates.length > 0 ? (
    <div class="grid ...">
      {keyDates.map(d => (...))}
    </div>
  ) : (
    <p class="text-gray-600">No scheduled dates announced yet</p>
  )}

  <!-- Global API failure banner (in seasons.astro) -->
  {apiError && (
    <div class="bg-red-50 border border-red-200 p-4 rounded">
      <p class="text-red-800">Season details are temporarily unavailable; check back soon</p>
    </div>
  )}
  ```
- Logging: Add observability calls
  ```typescript
  function logError(field: string, code: string, message: string) {
    console.error({
      timestamp: new Date().toISOString(),
      field,
      code,
      message,
      component: 'seasons'
    })
  }
  ```
- Error scenarios to handle:
  - Missing key dates → "No scheduled dates announced yet"
  - Missing registration costs → "Registration pricing to be confirmed"
  - Missing season name → "Season details unavailable"
  - PlayHQ API failure → "Season details are temporarily unavailable; check back soon"
- Partial data: skeleton loader in registration costs area (optional for MVP)

**Test Status**: Error state tests should verify messaging

---

### T022 [P] Finalize comprehensive test suite (unit, integration, E2E)

**Window**: 6 (Testing)  
**Phase**: 7 Implementation (complete test coverage)  
**Traceability**: Principle II (test-first), plan.md Testing Strategy  
**Dependencies**: All prior windows (T001–T020)  
**Description**: Write final unit, integration, and E2E tests to ensure feature completeness

**What to create/finalize**:
- Files:
  - `src/components/__tests__/SeasonTile.test.ts` (existing from T005, complete)
  - `src/components/__tests__/SeasonDetailModal.test.ts` (existing from T006, complete)
  - `src/components/__tests__/RegistrationCostsCard.test.ts` (new, unit tests)
  - `src/components/__tests__/KeyDatesSection.test.ts` (new, unit tests)
  - `src/components/__tests__/seasons.integration.test.ts` (existing from T011, complete)
  - `src/components/__tests__/seasons.accessibility.test.ts` (existing from T018, finalize)
  - `src/components/__tests__/seasons.responsive.test.ts` (existing from T015, finalize)
  - `src/components/__tests__/seasons.e2e.test.ts` (new, if using Playwright/Cypress)

- Test coverage targets:
  - Unit: SeasonTile, SeasonDetailModal, RegistrationCostsCard, KeyDatesSection
  - Integration: Full user workflows (P1: view current, click, close)
  - E2E: Browser-level keyboard, responsive, focus management
  - Accessibility: Axe, ARIA, contrast, keyboard-only
  - Performance: CLS, animation duration
  - Error states: Empty data, API failure, logging

- Test statistics:
  - Total test count: 50+ (unit: 20, integration: 15, E2E: 10, accessibility: 5+)
  - Coverage target: > 80% of component code
  - Coverage target: > 70% of page code
  - All tests passing before merge

**Success Criteria**:
- [ ] All tests in `src/components/__tests__/` pass
- [ ] `npm test -- seasons` runs without errors
- [ ] Coverage > 80% reported by Vitest
- [ ] No skipped (`.skip`) or todo (`.todo`) tests

---

### T023 [P] Write component API documentation

**Window**: 6 (Documentation)  
**Phase**: 8 Documentation  
**Traceability**: plan.md Phase 8, Future Integration section  
**Dependencies**: All components (T007–T010, T013)  
**Description**: Document component props, events, styling customization, integration points

**What to create**:
- File: `specs/coa-24-seasons-page/COMPONENT_API.md`
- Document each component:
  ```markdown
  ## SeasonTile

  **Path**: `src/components/SeasonTile.astro`

  **Props**:
  - `season: Season` (required) — Season object with id, name, startDate, endDate, role, status
  - `onClick?: () => void` (optional) — Callback when tile clicked

  **Accessibility**:
  - role="button" or <button>
  - aria-label: "{role}: {name}, click to view details"
  - Tab to focus, Enter/Space to activate
  - Visible focus indicator (3px outline)

  **Styling**:
  - Responsive: full-width on mobile, responsive grid on desktop
  - Touch targets: 44x44px minimum on mobile
  - Status states: "Coming Soon" (reduced opacity), "Previous" (muted text)
  - Focus indicator: blue-600 outline, 3px, offset-2

  **Example**:
  \`\`\`astro
  <SeasonTile 
    season={{ id: 'winter-2026', name: 'Winter 2026', ... }}
    onClick={() => handleTileClick()}
  />
  \`\`\`
  ```
- Same format for SeasonDetailModal, RegistrationCostsCard, KeyDatesSection
- Document data types (Season, KeyDate, RegistrationCost) and their sources
- Include constraint notes (e.g., "role assigned server-side, not calculated by client")

**Test Status**: Documentation for reference

---

### T024 Write integration guide for PlayHQ API (post-MVP)

**Window**: 6 (Documentation)  
**Phase**: 8 Documentation (Post-MVP planning)  
**Traceability**: plan.md Open Questions, Future Integration  
**Dependencies**: spec.md, plan.md  
**Description**: Document how to swap hardcoded data for real PlayHQ API when key available

**What to create**:
- File: `specs/coa-24-seasons-page/PLAYHQ_INTEGRATION_GUIDE.md`
- Content:
  ```markdown
  ## PlayHQ API Integration Guide

  ### Phase: Post-MVP (when API key available)

  ### Current State (MVP)
  - Seasons data is hardcoded in `src/lib/seasons/constants.ts`
  - Components render placeholder data
  - No real network calls

  ### Integration Steps

  1. **Obtain PlayHQ API Key**
     - Contact PlayHQ support
     - Document API endpoint, authentication method, rate limits
     - See `specs/coa-24-seasons-page/contracts/api.md` for expected response shapes

  2. **Create API Client**
     - File: `src/lib/seasons/api.ts`
     - Function: `async function fetchSeasons(): Promise<Season[]>`
     - Handle errors: retry logic, timeout, 5xx errors
     - Log errors to observability

  3. **Replace Constants**
     - In `src/pages/seasons.astro`:
     ```astro
     // Before (MVP):
     import { PLACEHOLDER_SEASONS } from '@/lib/seasons/constants'
     const seasons = PLACEHOLDER_SEASONS

     // After (PlayHQ API):
     import { fetchSeasons } from '@/lib/seasons/api'
     const seasons = await fetchSeasons()
     ```

  4. **Test API Integration**
     - Mock PlayHQ API responses
     - Test error scenarios (network failure, 5xx, timeout)
     - Test data transformation (if needed)
     - Verify no layout shift, CLS stays < 0.1

  5. **Next Season Polling Strategy**
     - Plan for polling interval (e.g., every 30 seconds, every 5 minutes)
     - Implement on client-side JavaScript:
     ```typescript
     setInterval(async () => {
       const latestSeasons = await fetchSeasons()
       if (latestSeasons.find(s => s.role === 'next' && s.status === 'active')) {
         // Replace placeholder tile with real data
         // Refresh page or update state without layout shift
       }
     }, 30000) // 30 seconds
     ```

  6. **Archive Display Logic**
     - Backend counts distinct calendar years
     - If >= 2 years, include Archive season(s) in response
     - Client conditionally renders Archive tile:
     ```astro
     {seasons.find(s => s.role === 'archive') && (
       <SeasonTile season={...} />
     )}
     ```

  ### Testing
  - Mock API: use Vitest.mock() or MSW (Mock Service Worker)
  - Test happy path: fetch, render, no errors
  - Test error paths: API 5xx, timeout, partial data
  - Test polling: verify no layout shift, data updates correctly

  ### Performance Considerations
  - Data fetch must not block First Contentful Paint (FCP)
  - Defer API calls to background if > 2 seconds on 4G
  - Implement skeleton loader while fetching registration costs
  - Consider SWR (stale-while-revalidate) pattern for caching

  ### Rollout Plan
  1. Deploy hardcoded MVP first (low risk)
  2. Enable feature flag for PlayHQ API integration
  3. A/B test: 10% users with real API, 90% with placeholders
  4. Monitor error rates, performance metrics
  5. Gradually roll out to 100% once stable
  ```

**Test Status**: Documentation for reference

---

### T025 Final integration test: end-to-end P1 + P2 workflows

**Window**: 6 (Final Validation)  
**Phase**: 7 Validation (comprehensive testing)  
**Traceability**: All AC (AC-1.1 through AC-4.4)  
**Dependencies**: All prior windows  
**Description**: Write and run final E2E test covering all user stories and edge cases

**What to create**:
- File: `src/components/__tests__/seasons.final.test.ts` (or Playwright/Cypress)
- Test scenarios:
  ```
  User Story 1: View Current Season
  ✓ Load page, Current Season tile visible
  ✓ Click Current Season → detail modal opens with Winter 2026
  ✓ Registration costs and key dates visible
  ✓ Escape or close button → modal closes, focus returns to tile
  ✓ On mobile: all elements readable, no horizontal overflow

  User Story 2: View Next Season Placeholder
  ✓ Load page, Next Season "Coming Soon" tile visible
  ✓ Click Next Season → detail modal opens
  ✓ Shows "Season details coming soon — check back when registration opens"
  ✓ Escape → modal closes

  User Story 3: View Previous Season
  ✓ Load page, Previous Season (Summer 2025/26) visible
  ✓ Click Previous Season → detail modal opens with past dates
  ✓ Registration costs visible
  ✓ Escape → modal closes

  Accessibility:
  ✓ Tab through all tiles
  ✓ Enter on focused tile → modal opens
  ✓ Escape closes modal
  ✓ Focus returns to tile
  ✓ No ARIA violations (Axe scan)
  ✓ All focus indicators visible
  ✓ Contrast ratios met

  Performance:
  ✓ Page load FCP < 2s
  ✓ Modal animation 300ms ± 50ms
  ✓ CLS < 0.1 when modal opens/closes
  ✓ No layout shift at any viewport

  Error States:
  ✓ Missing key dates → shows "No scheduled dates announced yet"
  ✓ Missing registration costs → shows "Registration pricing to be confirmed"
  ✓ Missing data fields → shows placeholders, not blank
  ✓ Error logged to observability

  Responsive:
  ✓ Mobile (375px): 1-col tiles, 44x44px touch targets
  ✓ Tablet (768px): 2-col tiles
  ✓ Desktop (1920px): 4-col tiles, centered modal
  ✓ No horizontal overflow
  ✓ Text readable at all sizes
  ```
- Run and ensure all tests PASS

**Success Criteria**:
- [ ] All test scenarios above PASS
- [ ] No console errors or warnings
- [ ] No TypeScript errors
- [ ] All performance metrics met
- [ ] All accessibility checks passed
- [ ] Feature is production-ready

---

[WINDOW_CHECKPOINT_6]

**Feature Complete**:
- [ ] T021: Error states implemented, explicit placeholder messaging
- [ ] T022: Comprehensive test suite complete, coverage > 80%
- [ ] T023: Component API documented
- [ ] T024: PlayHQ integration guide written
- [ ] T025: Final E2E test PASSES, all user stories validated
- [ ] All P1/P2 acceptance criteria (AC-1.1 through AC-4.4) validated
- [ ] All windows 1–5 checkpoints passed
- [ ] No console errors or warnings
- [ ] TypeScript: no errors
- [ ] Ready for merge to main

**Feature Ready for Merge**:
- All acceptance criteria PASSING
- Test coverage > 80%
- WCAG 2.1 AA compliance verified
- Responsive design verified (mobile, tablet, desktop)
- Performance targets met (CLS < 0.1, animation 300ms, FCP < 2s)
- Documentation complete
- No blockers or open issues

---

## Summary

**Total Execution Windows**: 6  
**Estimated Tokens per Window**:
- Window 1 (Foundation): 60–75k
- Window 2 (Components): 80–100k
- Window 3 (Integration): 80–100k
- Window 4 (Responsive): 70–90k
- Window 5 (Accessibility): 75–90k
- Window 6 (Error Handling, Testing, Docs): 75–90k

**Total Estimated**: 480–600k tokens (comfortable headroom within typical session limits)

**Implementation Strategy**:
- Each window executed in fresh 200k context
- Implement agent manages window boundaries and STATE.md
- Checkpoints gate progression; failures resolved within window
- Test-first discipline: tests written before implementation in each window
- Clear hand-offs between windows via checkpoint validation

---

## Key Rules for Implementation

### Rule 1: One Window = One Fresh Context
- Agent calls `/clear` between windows to start fresh
- Only STATE.md carries forward (checkpoint validation)
- No conversation history dependencies

### Rule 2: Checkpoints Gate Progression
- Each window has explicit validation checklist
- MUST pass before proceeding to next window
- If checkpoint fails, stay in window and fix
- Never skip ahead or defer to next window

### Rule 3: Test-First Within Each Window
- Tests written FIRST in every task
- Tests must FAIL before implementation
- Tests must PASS after implementation
- Before window checkpoint, all tests pass

### Rule 4: Traceability Every Task
- Every task maps back to spec (FR-XXX, AC-XXX, US-X)
- Every AC validated by end of feature
- No orphaned work

### Rule 5: Window Independence
- Later windows depend on earlier windows' checkpoints, not conversation history
- Agent reads STATE.md checkpoint results, not chat memory
- Can restart any window without losing prior work

---

## File Paths (Ready for Implementation)

**Locations for all deliverables**:
- Component files: `src/components/*.astro` (SeasonTile, SeasonDetailModal, RegistrationCostsCard, KeyDatesSection)
- Page file: `src/pages/seasons.astro`
- Library files: `src/lib/seasons/` (types.ts, constants.ts, utils.ts)
- Test files: `src/components/__tests__/` (*.test.ts files)
- Documentation: `specs/coa-24-seasons-page/` (COMPONENT_API.md, PLAYHQ_INTEGRATION_GUIDE.md)

---

## Next Steps

1. **Review Tasks**: Understand window sequencing and checkpoint validation
2. **Implement Phase**: Execute implement agent with Option C window management
   - Run each window in isolation
   - Validate checkpoints before moving forward
   - Use STATE.md to track progress across windows
3. **Deploy**: Once all 6 windows complete and merge checklist satisfied, PR ready

---

## Testing Priorities

**Must Have Before Each Checkpoint**:
- Window 1: Types compile, data loads, utils work
- Window 2: Components render without errors, unit tests pass
- Window 3: Modal opens/closes, focus returns, keyboard works
- Window 4: Responsive layout verified, no CLS, animation 300ms
- Window 5: Keyboard navigation works, ARIA labels present, Axe scan clean
- Window 6: All tests pass, error states working, docs complete

---

## Constitutional Alignment

This task plan adheres to all 9 principles:
- **Principle I** (User Outcomes First): Each task maps to user story, measurable outcomes
- **Principle II** (Test-First): Tests written before implementation in each window
- **Principle III** (Backend Authority): Season role assigned server-side, client receives pre-computed
- **Principle IV** (Error Semantics): All error states explicit, logged to observability
- **Principle V** (AppShell Integrity): Uses BaseLayout, responsive at all breakpoints
- **Principle VI** (Accessibility First): Keyboard nav, focus indicators, ARIA labels, WCAG AA
- **Principle VII** (Immutable Data Flow): Data flows unidirectional (API → client → UI)
- **Principle VIII** (Dependency Hygiene): No new dependencies (uses existing Astro, Tailwind)
- **Principle IX** (Cross-Feature Consistency): Reuses tile patterns, follows Phoenix conventions

---

**Status**: READY_FOR_IMPLEMENTATION
