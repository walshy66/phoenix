# Tasks: Resource Filters Mobile UX (COA-74)

**Input**: Specs from `/specs/coa-74-resource-filters/`  
**Strategy**: Execution Windows (GSD-aligned, 3-phase delivery)  
**Total Windows**: 3 | **Estimated Duration**: 6-7 days  
**Branch**: `cameronwalsh/coa-74-resource-filters`  
**Status**: READY_FOR_IMPLEMENTATION

---

## Format Guide

- **[P]**: Can run in parallel (different files, same window, no resource contention)
- **Window N**: Execution context boundary (fresh ~100k token context per window)
- **WINDOW_CHECKPOINT**: Validation gate before next window
- **Traceability**: Each task maps back to spec (FR-XXX, AC-XXX, US-X, SC-XXX)
- **Dependency**: What prior work or setup must be done before this task

---

## Execution Window 1: Foundation & P1 Fix (Mobile Filter Panel)

**Purpose**: Fix broken filter panel interaction on mobile; restore critical mobile functionality

**Token Budget**: 70-90k (estimate)

**Checkpoint Validation**:
- [ ] Filter state management unit tests pass
- [ ] FilterBar toggle works without console errors on mobile (< 768px)
- [ ] Filter state persists across page navigation (same session)
- [ ] All P1 acceptance criteria (AC 1-6) passing
- [ ] No console errors during rapid filter toggling

---

### T001 [P] Create `src/lib/resources/state.ts` — Session-level filter state management

**Window**: 1 (Foundation & P1)  
**Phase**: Infrastructure (Data Layer)  
**Traceability**: FR-002 (filter state preservation), AC 5-6 (cross-nav persistence)  
**Dependencies**: None  
**Task Size**: ~1-2 hours  

**Description**:
Create a new module to manage filter state at the session level using `sessionStorage` with fallback to in-memory state. This module is the single source of truth for active filters and panel open/close state per resource section.

**What to create**:

File: `/c/Users/camer/Documents/phoenix/src/lib/resources/state.ts`

Must export:
```typescript
// Filter state interface
interface ActiveFilters {
  age: string[];
  category: string[];
  skill: string[];
}

interface PanelState {
  isOpen: boolean;
}

// Public API
export function getActiveFilters(section: 'coaching_resources' | 'player_resources' | 'manager_resources'): ActiveFilters
export function setActiveFilter(section: string, type: 'age' | 'category' | 'skill', value: string, active: boolean): void
export function clearFilters(section: string): void
export function getPanelState(section: string): PanelState
export function setPanelState(section: string, isOpen: boolean): void
export function getFilterCount(section: string): number
```

**Implementation Requirements**:
- Use `sessionStorage` as primary storage (survives nav, resets on close)
- Keys should follow pattern: `filters:${section}`, `panel:${section}`
- Handle JSON serialization/deserialization safely
- Include try-catch for storage access (some browsers disable it)
- No logging required here; logging happens at component level
- Support sections: `coaching_resources`, `player_resources`, `manager_resources`

**Test File**:
- Create `/c/Users/camer/Documents/phoenix/src/lib/resources/__tests__/state.test.ts`
- Unit test cases:
  - `getActiveFilters()` returns empty state on first call
  - `setActiveFilter()` adds filter to active list
  - `setActiveFilter()` removes filter when active=false
  - `clearFilters()` resets all filters to empty
  - `setActiveFilter()` persists to sessionStorage
  - `getActiveFilters()` retrieves from sessionStorage after page reload simulation
  - `getPanelState()` / `setPanelState()` track open/close state
  - `getFilterCount()` returns correct count of active filters
  - Edge case: sessionStorage disabled → fallback to in-memory state

**Success Criteria**:
- All unit tests pass
- No TypeScript errors
- State persistence works across simulated page navigation
- sessionStorage used when available, in-memory fallback when not

---

### T002 Create unit tests for FilterBar toggle and state sync

**Window**: 1 (Foundation & P1)  
**Phase**: Tests (write FIRST, must fail before implementation)  
**Traceability**: FR-001 (panel without errors), AC 1-4 (toggle behavior), NFR-A-004 (aria-expanded)  
**Dependencies**: T001 (state.ts exists)  
**Task Size**: ~2 hours  

**Description**:
Write comprehensive unit tests for FilterBar.astro component interaction logic. These tests validate:
- Toggle button shows/hides filter panel
- aria-expanded attribute updates correctly
- aria-pressed updates when filters toggled
- Active filter count badge displays
- Clear all button clears selections

**What to create**:

File: `/c/Users/camer/Documents/phoenix/src/components/__tests__/FilterBar.test.ts`

**Test Cases** (must FAIL before T003 implementation):
1. Toggle button visible on mobile (< 768px), hidden on desktop (>= 768px)
2. Toggle button click expands panel → aria-expanded="true"
3. Toggle button click collapses panel → aria-expanded="false"
4. Filter button toggle updates aria-pressed attribute
5. Filter button toggle persists state to sessionStorage
6. Active filter count badge updates and displays correct number
7. "Clear all filters" button clears all selections and resets badge
8. No console errors on rapid toggle clicks (5+ rapid toggles)
9. Panel styling transitions smoothly on open/close
10. Keyboard focus remains on toggle button after click

**Test Framework**: Vitest + Astro test utilities (or jsdom for component rendering)

**Success Criteria**:
- All tests written and FAIL (because FilterBar script not yet enhanced)
- Tests are independent and don't rely on external data
- Each test covers one specific interaction scenario
- Tests document expected behavior for implementation phase

---

### T003 Enhance FilterBar.astro inline script for P1 functionality

**Window**: 1 (Foundation & P1)  
**Phase**: Implementation (after tests fail)  
**Traceability**: FR-001 (errors), FR-002 (state sync), AC 1-4, NFR-A-004 (aria-expanded)  
**Dependencies**: T001 (state.ts ready), T002 (tests written and failing)  
**Task Size**: ~3-4 hours  

**Description**:
Modify `src/components/FilterBar.astro` inline script to fix broken P1 functionality. Implement proper toggle logic, state synchronization with state.ts, ARIA attribute management, and error handling.

**What to modify**:

File: `/c/Users/camer/Documents/phoenix/src/components/FilterBar.astro`

**Changes required**:
1. **Toggle Button Behavior**:
   - Click handler wraps toggle logic in try-catch
   - Updates aria-expanded attribute (true/false)
   - Updates button label ("Show filters" ↔ "Hide filters")
   - Calls `setPanelState(section, newState)` to persist state

2. **Filter Button Click Handler**:
   - Each filter button listens to click
   - Toggle aria-pressed attribute
   - Call `setActiveFilter(section, type, value, active)` from state.ts
   - Update visual button styling (background/color)
   - Apply filters immediately (no separate "Apply" button)

3. **Active Filter Badge**:
   - Display filter count on toggle button
   - Call `getFilterCount(section)` from state.ts
   - Update badge text in real-time as filters change
   - Hide badge when count = 0

4. **Clear All Button**:
   - Click handler calls `clearFilters(section)`
   - Reset all filter buttons to inactive state
   - Hide active filter badge
   - Re-render grid immediately

5. **Error Boundary**:
   - Wrap toggle/filter logic in try-catch
   - Log errors to console: `console.error('[FilterBar] Error:', error)`
   - Keep UI functional even if state.ts fails

6. **Initialization**:
   - On component render, read initial state from state.ts
   - Apply initial active filters and panel state
   - Restore filter button styling based on loaded state

**Key Code Pattern**:
```astro
<script is:inline>
  import { getActiveFilters, setActiveFilter, clearFilters, getPanelState, setPanelState, getFilterCount } from '../lib/resources/state.ts';

  const toggle = document.querySelector('[data-mobile-filter-toggle]');
  const section = toggle?.getAttribute('data-section');

  if (!section) return;

  // Initialize from state
  const initialState = getPanelState(section);
  const initialFilters = getActiveFilters(section);
  
  // Toggle click handler
  toggle.addEventListener('click', () => {
    try {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      const newState = !isOpen;
      
      setPanelState(section, newState);
      toggle.setAttribute('aria-expanded', String(newState));
      toggle.textContent = newState ? 'Hide filters' : 'Show filters';
      // Update panel visibility
      document.querySelector(`[data-filter-panel="${section}"]`)?.classList.toggle('hidden');
    } catch (error) {
      console.error('[FilterBar] Toggle error:', error);
    }
  });

  // Filter button handlers
  document.querySelectorAll(`[data-filter-button][data-section="${section}"]`).forEach(btn => {
    btn.addEventListener('click', () => {
      try {
        const type = btn.getAttribute('data-type');
        const value = btn.getAttribute('data-value');
        const active = btn.getAttribute('aria-pressed') === 'false';
        
        setActiveFilter(section, type, value, active);
        btn.setAttribute('aria-pressed', String(active));
        btn.classList.toggle('bg-brand-purple', active);
        
        // Trigger grid re-render (handled by page)
        window.dispatchEvent(new CustomEvent('filtersChanged', { detail: { section } }));
      } catch (error) {
        console.error('[FilterBar] Filter error:', error);
      }
    });
  });

  // Clear all handler
  const clearBtn = document.querySelector(`[data-clear-filters][data-section="${section}"]`);
  clearBtn?.addEventListener('click', () => {
    try {
      clearFilters(section);
      document.querySelectorAll(`[data-filter-button][data-section="${section}"]`).forEach(btn => {
        btn.setAttribute('aria-pressed', 'false');
        btn.classList.remove('bg-brand-purple');
      });
      window.dispatchEvent(new CustomEvent('filtersChanged', { detail: { section } }));
    } catch (error) {
      console.error('[FilterBar] Clear error:', error);
    }
  });
</script>
```

**Test Status**: T002 tests must PASS after this implementation

---

### T004 Update coaching-resources.astro and player-resources.astro to integrate FilterBar

**Window**: 1 (Foundation & P1)  
**Phase**: Integration (after FilterBar enhanced)  
**Traceability**: FR-002 (filter persistence), AC 5-6, SC-009 (preserve state on nav)  
**Dependencies**: T001 (state.ts), T003 (FilterBar enhanced)  
**Task Size**: ~2-3 hours  

**Description**:
Integrate FilterBar component into resource pages and wire filter change events to grid re-rendering. Initialize filter state from sessionStorage on page load.

**What to modify**:

Files: 
- `/c/Users/camer/Documents/phoenix/src/pages/coaching-resources.astro`
- `/c/Users/camer/Documents/phoenix/src/pages/player-resources.astro`

**Changes required**:
1. **Import state management**:
   - Import `getActiveFilters`, `getPanelState` from state.ts
   - On page load, read initial filters from sessionStorage

2. **FilterBar integration**:
   - Pass `section="coaching_resources"` prop to FilterBar
   - Pass `availableFilters` (ages, categories, skills) from resources data
   - Pass current `activeFilters` to FilterBar

3. **Event listener setup**:
   - Listen for `filtersChanged` custom event
   - On event, apply filters via `src/lib/resources/filters.ts`
   - Re-render grid with filtered results

4. **Panel state restoration**:
   - Initialize panel open/closed state from getPanelState()
   - If user returns to page, panel reopens in previous state

**Example Pattern**:
```astro
---
import { getActiveFilters, getPanelState } from '@lib/resources/state';
import FilterBar from '@components/FilterBar.astro';

const section = 'coaching_resources';
const activeFilters = getActiveFilters(section);
const panelState = getPanelState(section);
const availableFilters = {
  ages: extractUniqueAges(resources),
  categories: extractUniqueCategories(resources),
  skills: extractUniqueSkills(resources),
};
---

<FilterBar 
  section={section}
  activeFilters={activeFilters}
  availableFilters={availableFilters}
  initialPanelOpen={panelState.isOpen}
/>

<script is:inline>
  window.addEventListener('filtersChanged', (e) => {
    const { section } = e.detail;
    const filters = getActiveFilters(section);
    // Apply filters to grid and re-render
    filterAndRenderGrid(filters);
  });
</script>
```

**Test Status**: Integration is manual; verified by T005

---

### T005 Integration test: Filter state persistence across page navigation

**Window**: 1 (Foundation & P1)  
**Phase**: Integration / Manual Testing  
**Traceability**: AC 5-6 (state preservation), SC-009 (cross-nav persistence)  
**Dependencies**: T001 (state.ts), T003 (FilterBar), T004 (pages integrated)  
**Task Size**: ~2-3 hours  

**Description**:
Write integration test validating that filter state survives navigation between resource pages. Simulate: open Coaching Resources → apply filters → navigate to Player Resources → return to Coaching Resources → verify filters still applied.

**What to create**:

File: `/c/Users/camer/Documents/phoenix/src/__tests__/integration/filter-state-persistence.test.ts`

**Test Scenario**:
1. Load Coaching Resources page
2. Tap "Show filters" button
3. Select age filter "U12"
4. Select category filter "Passing"
5. Verify grid filters to show only U12 + Passing resources
6. Navigate to Player Resources page
7. Verify filters are NOT applied (different section)
8. Navigate back to Coaching Resources
9. Verify filters are still applied (same section, same state)
10. Verify "Show filters" button shows "2 active" badge

**Test Framework**: Vitest + jsdom or Playwright (if E2E needed)

**Success Criteria**:
- Filter state persists in sessionStorage across page navigation
- Different sections have independent filter states
- No console errors during navigation

---

[WINDOW_CHECKPOINT_1]

**Before proceeding to Window 2, validate**:
- [ ] T001: state.ts tests pass (sessionStorage working)
- [ ] T002: FilterBar unit tests pass
- [ ] T003: FilterBar enhanced script working without errors
- [ ] T004: Pages integrated with FilterBar
- [ ] T005: Integration test passes (state persists across nav)
- [ ] Manual test: Filter panel opens/closes on mobile without errors
- [ ] Manual test: Filter selections persist within session
- [ ] All AC 1-6 (P1 acceptance criteria) passing
- [ ] No console errors in browser DevTools

**If checkpoint fails**: Fix failing tests/issues in Window 1 before proceeding. Do NOT proceed to Window 2 until all P1 criteria met.

---

## Execution Window 2: P2 Carousel (Resource Tabs)

**Purpose**: Implement horizontal scrollable carousel for resource tabs; improve mobile UX and discoverability

**Token Budget**: 70-90k (estimate)

**Checkpoint Validation**:
- [ ] ResourceTabs carousel renders on mobile (< 768px)
- [ ] Carousel scrolls smoothly with native momentum
- [ ] Scroll indicators visible when content overflows
- [ ] Keyboard navigation works (arrow keys, Home, End)
- [ ] All P2 acceptance criteria (AC 7-11) passing
- [ ] No horizontal overflow on any device

---

### T006 [P] Create `src/components/ResourceTabs.astro` — Carousel component

**Window**: 2 (P2 - Carousel)  
**Phase**: Component Implementation  
**Traceability**: FR-003 (carousel on mobile), AC 7-11  
**Dependencies**: Window 1 complete  
**Task Size**: ~3-4 hours  

**Description**:
Create new Astro component that renders resource tabs as a horizontal scrollable carousel on mobile (< 768px) and as standard horizontal tabs on desktop (>= 768px).

**What to create**:

File: `/c/Users/camer/Documents/phoenix/src/components/ResourceTabs.astro`

**Component Props**:
```typescript
interface Tab {
  label: string;
  href: string;
  active: boolean;
}

interface Props {
  tabs: Tab[];
  section: string; // For tracking active section in logs
}
```

**Markup Requirements**:
- Use semantic `role="tablist"` on container
- Each tab is `role="tab"` with `aria-selected` attribute
- Use flexbox for carousel layout
- Mobile (< 768px): overflow-x-auto, scroll-smooth
- Desktop (>= 768px): standard horizontal layout (no scroll needed)

**Styling Requirements** (CSS + Tailwind):
- Mobile: `.carousel-scroll-container` with `overflow-x-auto scroll-smooth -webkit-overflow-scrolling: touch`
- Each tab: `flex-shrink-0 px-4 py-3 whitespace-nowrap` (prevents wrapping)
- Active tab: `border-b-2 border-brand-purple text-brand-purple font-bold`
- Inactive tab: `border-b-2 border-transparent text-gray-600 hover:text-brand-purple`
- All tabs: smooth transition on color/border changes

**Key Code Pattern**:
```astro
---
interface Tab {
  label: string;
  href: string;
  active: boolean;
}

interface Props {
  tabs: Tab[];
  section: string;
}

const { tabs, section } = Astro.props;
---

<div class="resource-tabs-carousel" role="tablist" data-section={section}>
  <div class="carousel-scroll-container overflow-x-auto scroll-smooth -webkit-overflow-scrolling-touch">
    {tabs.map((tab) => (
      <a
        href={tab.href}
        role="tab"
        aria-selected={tab.active}
        class="flex-shrink-0 px-4 py-3 whitespace-nowrap border-b-2 transition"
        class:list={{
          'border-brand-purple text-brand-purple font-bold': tab.active,
          'border-transparent text-gray-600 hover:text-brand-purple': !tab.active,
        }}
      >
        {tab.label}
      </a>
    ))}
  </div>
</div>

<style>
  .carousel-scroll-container {
    display: flex;
    gap: 0;
    scroll-behavior: smooth;
  }
</style>
```

**Test Status**: Unit tests follow in T007

---

### T007 Create `src/styles/resource-filters.css` — Carousel styling and scroll indicators

**Window**: 2 (P2 - Carousel)  
**Phase**: Styling (CSS utilities and scroll indicators)  
**Traceability**: FR-004 (smooth scroll), FR-011 (scroll indicators), AC 6 (affordance)  
**Dependencies**: T006 (ResourceTabs component exists)  
**Task Size**: ~1-2 hours  

**Description**:
Create CSS file with carousel-specific styles: native scroll container, scroll indicators (gradient fade), smooth scroll behavior, momentum scroll for iOS.

**What to create**:

File: `/c/Users/camer/Documents/phoenix/src/styles/resource-filters.css`

**Required CSS**:
```css
/* Carousel scroll container */
.carousel-scroll-container {
  display: flex;
  gap: 0;
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch; /* iOS momentum scroll */
  scrollbar-width: none; /* Hide scrollbar on Firefox */
}

.carousel-scroll-container::-webkit-scrollbar {
  display: none; /* Hide scrollbar on Chrome/Safari */
}

/* Scroll indicators (gradient fade on edges) */
@supports (background: linear-gradient(90deg, rgba(0,0,0,.1))) {
  .carousel-scroll-container::before {
    content: '';
    position: sticky;
    left: 0;
    width: 16px;
    background: linear-gradient(to right, rgba(255,255,255,0.8), transparent);
    z-index: 10;
    pointer-events: none;
  }

  .carousel-scroll-container::after {
    content: '';
    position: sticky;
    right: 0;
    width: 16px;
    background: linear-gradient(to left, rgba(255,255,255,0.8), transparent);
    z-index: 10;
    pointer-events: none;
  }
}

/* Mobile-only carousel (hide on desktop) */
@media (min-width: 768px) {
  .resource-tabs-carousel {
    display: flex;
    justify-content: flex-start;
  }

  .carousel-scroll-container {
    overflow-x: visible;
    scroll-behavior: auto;
  }

  .carousel-scroll-container::before,
  .carousel-scroll-container::after {
    display: none;
  }
}
```

**Import**: Link in `src/layouts/Layout.astro` or main style import so it's available globally

**Test Status**: Styling validated via manual testing in T009

---

### T008 Create unit tests for ResourceTabs carousel

**Window**: 2 (P2 - Carousel)  
**Phase**: Tests (write FIRST, must fail before keyboard nav implementation)  
**Traceability**: FR-004 (scroll response), FR-008 (keyboard nav), AC 7-11  
**Dependencies**: T006 (ResourceTabs exists)  
**Task Size**: ~2-3 hours  

**Description**:
Write unit tests for carousel rendering, scroll behavior, keyboard navigation, and scroll indicators.

**What to create**:

File: `/c/Users/camer/Documents/phoenix/src/components/__tests__/ResourceTabs.test.ts`

**Test Cases** (must FAIL before T009 keyboard nav implementation):
1. Carousel renders all tabs passed in props
2. Active tab has `aria-selected="true"`, inactive tabs have `aria-selected="false"`
3. Active tab has correct styling class (brand-purple border)
4. Carousel container has `role="tablist"`, each tab has `role="tab"`
5. Keyboard: Left Arrow key moves focus to previous tab
6. Keyboard: Right Arrow key moves focus to next tab
7. Keyboard: Home key moves focus to first tab
8. Keyboard: End key moves focus to last tab
9. Scroll indicators appear only when carousel has overflow (> 3 tabs)
10. Scroll indicators disappear when carousel fits all tabs (< 3 tabs)
11. Mobile (< 768px): carousel is scrollable
12. Desktop (>= 768px): carousel is not scrollable, tabs display normally

**Test Framework**: Vitest + jsdom

**Success Criteria**:
- All tests written and FAIL (keyboard nav not yet implemented)
- Tests are independent and mock no external dependencies
- Tests cover both rendering and interaction

---

### T009 Add keyboard navigation to ResourceTabs

**Window**: 2 (P2 - Carousel)  
**Phase**: Implementation (after tests fail)  
**Traceability**: FR-008 (keyboard accessible), AC 7, NFR-A-006 (arrow keys, home/end)  
**Dependencies**: T006 (ResourceTabs exists), T008 (tests written and failing)  
**Task Size**: ~2 hours  

**Description**:
Implement keyboard navigation script in ResourceTabs component to handle arrow keys, Home, and End key presses.

**What to modify**:

File: `/c/Users/camer/Documents/phoenix/src/components/ResourceTabs.astro` (add inline script)

**Keyboard Handlers**:
```astro
<script is:inline>
  document.querySelectorAll('[role="tablist"]').forEach((tablist) => {
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const container = tablist.querySelector('.carousel-scroll-container');

    if (!tabs.length || !container) return;

    tabs.forEach((tab, index) => {
      tab.addEventListener('keydown', (e) => {
        let nextTab = null;

        if (e.key === 'ArrowRight') {
          e.preventDefault();
          nextTab = tabs[Math.min(index + 1, tabs.length - 1)];
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          nextTab = tabs[Math.max(index - 1, 0)];
        } else if (e.key === 'Home') {
          e.preventDefault();
          nextTab = tabs[0];
        } else if (e.key === 'End') {
          e.preventDefault();
          nextTab = tabs[tabs.length - 1];
        }

        if (nextTab) {
          (nextTab as HTMLElement).focus();
          (nextTab as HTMLElement).scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
          });
        }
      });
    });
  });
</script>
```

**Test Status**: T008 tests must PASS after this implementation

---

### T010 Integration test: Carousel rendering and interaction on mobile

**Window**: 2 (P2 - Carousel)  
**Phase**: Integration / Manual Testing  
**Traceability**: AC 7-11, SC-002 (no overflow), SC-003 (smooth scroll response)  
**Dependencies**: T006 (ResourceTabs), T007 (styles), T009 (keyboard nav)  
**Task Size**: ~2-3 hours  

**Description**:
Write integration test validating carousel renders correctly on mobile and desktop, scrolls smoothly, and keyboard navigation works. Include manual testing checklist for real devices.

**What to create**:

File: `/c/Users/camer/Documents/phoenix/src/__tests__/integration/resource-tabs-carousel.test.ts`

**Test Scenarios**:
1. Mobile viewport (375px width): Carousel renders, all tabs visible or scrollable
2. Mobile viewport: Swipe left → carousel scrolls left
3. Mobile viewport: Scroll right boundary → carousel stops at rightmost tab
4. Desktop viewport (1024px width): All tabs visible, no scrolling
5. Keyboard navigation: Tab through tabs, arrow keys navigate, focus visible
6. Device rotation: Portrait → landscape → all tabs reflow, active tab remains visible
7. Scroll indicators: Visible with > 3 tabs, hidden with < 3 tabs
8. No horizontal overflow on any viewport width (320px to 1024px)

**Manual Testing Checklist**:
- [ ] iPhone SE (375px): Tap tabs, swipe carousel
- [ ] iPhone 13 (390px): Verify smooth swipe response (< 50ms perceived)
- [ ] Samsung Galaxy A50 (720px): Carousel scrolls smoothly
- [ ] Device rotation: Tabs reflow, active tab visible
- [ ] Keyboard: Tab and arrow keys navigate tabs
- [ ] Desktop browser at mobile viewport: Carousel works as expected

**Success Criteria**:
- All carousel functionality works on mobile
- No horizontal overflow detected
- Swipe response feels smooth (native scroll)
- Keyboard navigation complete

---

[WINDOW_CHECKPOINT_2]

**Before proceeding to Window 3, validate**:
- [ ] T006: ResourceTabs component renders correctly
- [ ] T007: CSS styles applied, scroll indicators visible
- [ ] T008: Carousel unit tests pass
- [ ] T009: Keyboard navigation works (arrow keys, Home, End)
- [ ] T010: Integration test passes (carousel on mobile, desktop)
- [ ] Manual test: Carousel scrolls smoothly on iPhone/Android
- [ ] Manual test: No horizontal overflow on any device
- [ ] All AC 7-11 (P2 acceptance criteria) passing
- [ ] Active tab always visible and highlighted

**If checkpoint fails**: Fix carousel rendering or navigation in Window 2 before proceeding. Do NOT proceed to Window 3 until carousel fully functional.

---

## Execution Window 3: P3 Polish (Filter Panel Sizing & Auto-Collapse)

**Purpose**: Add max-height constraint to filter panel, implement auto-collapse on scroll, polish UX

**Token Budget**: 60-80k (estimate)

**Checkpoint Validation**:
- [ ] Filter panel max-height is 50vh
- [ ] Panel scrollable internally when overflowing
- [ ] Auto-collapse triggers after 100px+ downward scroll
- [ ] Auto-collapse completes within 300ms
- [ ] Filters preserved after auto-collapse
- [ ] All P3 acceptance criteria (AC 12-15) passing

---

### T011 [P] Update FilterBar.astro with panel max-height and internal scroll

**Window**: 3 (P3 - Polish)  
**Phase**: Styling & Markup  
**Traceability**: FR-005 (max 50vh), FR-006 (internal scroll), AC 12-15  
**Dependencies**: Window 2 complete  
**Task Size**: ~1-2 hours  

**Description**:
Modify FilterBar panel markup and styling to add max-height constraint and internal scrolling. Make "Clear all filters" button sticky at bottom of panel.

**What to modify**:

File: `/c/Users/camer/Documents/phoenix/src/components/FilterBar.astro`

**Changes required**:
1. **Panel container styling**:
   - Add `max-h-[50vh]` (Tailwind max height = 50% viewport)
   - Add `overflow-y-auto` (scrollable if content exceeds max-height)
   - Add `transition-all duration-300` (smooth show/hide animation)

2. **Internal structure**:
   - Wrap filter controls in scrollable container
   - Make "Clear all filters" button sticky at bottom: `sticky bottom-0 bg-white z-10`
   - Ensure sticky button doesn't get hidden by overflow

3. **CSS Enhancement** (in resource-filters.css):
   ```css
   [data-filter-panel] {
     max-height: 50vh;
     overflow-y: auto;
     transition: all 300ms ease-out;
     scroll-behavior: smooth;
   }

   [data-clear-filters] {
     position: sticky;
     bottom: 0;
     background: white;
     z-index: 10;
     border-top: 1px solid #e5e7eb;
   }
   ```

**Example Markup Pattern**:
```astro
<div 
  id={`filter-panel-${section}`}
  class="max-h-[50vh] overflow-y-auto transition-all duration-300"
  data-filter-panel
  data-section={section}>
  
  <!-- Scrollable filter controls -->
  <div class="flex flex-col gap-3 p-4">
    <!-- age filters -->
    <!-- category filters -->
    <!-- skill filters -->
  </div>

  <!-- Sticky clear button -->
  <button 
    data-clear-filters 
    data-section={section}
    class="sticky bottom-0 w-full bg-white border-t px-4 py-3">
    Clear all filters
  </button>
</div>
```

**Test Status**: Styling validated via manual testing in T013

---

### T012 Create unit tests for auto-collapse behavior

**Window**: 3 (P3 - Polish)  
**Phase**: Tests (write FIRST, must fail before scroll listener implementation)  
**Traceability**: FR-006 (auto-collapse on scroll), AC 12-14, NFR-P-003 (300ms animation)  
**Dependencies**: T001 (state.ts), T011 (panel styling)  
**Task Size**: ~2 hours  

**Description**:
Write unit tests for auto-collapse detection and animation. Test scroll event handling, delta calculation, state preservation, and animation timing.

**What to create**:

File: `/c/Users/camer/Documents/phoenix/src/components/__tests__/FilterBar.auto-collapse.test.ts`

**Test Cases** (must FAIL before T013 implementation):
1. Scroll listener initialized on component mount
2. Scroll delta tracked and compared to 100px threshold
3. Panel remains open when scroll < 100px down
4. Panel closes when scroll > 100px down (aria-expanded="false")
5. Filters remain active after auto-collapse (state preserved)
6. Active filter badge still displays after collapse
7. Toggle button remains sticky and clickable after collapse
8. Animation completes within 300ms
9. Panel can be reopened by clicking toggle button
10. Scroll up does NOT auto-expand (remains collapsed until user taps toggle)
11. No rapid collapse/expand cycles (debounced)
12. Panel max-height is 50vh before collapse

**Test Framework**: Vitest + jsdom with scroll event simulation

**Success Criteria**:
- All tests written and FAIL (scroll listener not yet implemented)
- Tests simulate scroll events and verify state changes
- Tests validate timing and animation behavior

---

### T013 Implement scroll listener and auto-collapse logic

**Window**: 3 (P3 - Polish)  
**Phase**: Implementation (after tests fail)  
**Traceability**: FR-006 (auto-collapse), AC 12-14, NFR-P-003 (300ms)  
**Dependencies**: T001 (state.ts), T011 (panel styling), T012 (tests written and failing)  
**Task Size**: ~2-3 hours  

**Description**:
Implement scroll event listener in FilterBar inline script that detects downward scroll > 100px and auto-collapses the filter panel. Use state.ts to persist panel state.

**What to modify**:

File: `/c/Users/camer/Documents/phoenix/src/components/FilterBar.astro` (enhance inline script)

**Scroll Listener Implementation**:
```astro
<script is:inline>
  import { getPanelState, setPanelState } from '../lib/resources/state.ts';

  const resourceContainer = document.querySelector('[data-resource-list]');
  if (!resourceContainer) return;

  let lastScrollY = 0;
  let autoCollapseTimeout;

  resourceContainer.addEventListener('scroll', () => {
    const currentScrollY = resourceContainer.scrollTop;
    const delta = currentScrollY - lastScrollY;

    // Find all filter panels and check if they're open
    document.querySelectorAll('[data-filter-panel]').forEach((panel) => {
      const section = panel.getAttribute('data-section');
      const toggle = document.querySelector(`[data-mobile-filter-toggle][data-section="${section}"]`);

      if (!toggle || !section) return;

      const isOpen = toggle.getAttribute('aria-expanded') === 'true';

      // Auto-collapse on 100px+ downward scroll
      if (delta > 100 && isOpen) {
        clearTimeout(autoCollapseTimeout);
        autoCollapseTimeout = setTimeout(() => {
          try {
            setPanelState(section, false);
            toggle.setAttribute('aria-expanded', 'false');
            toggle.textContent = 'Show filters';
            panel.classList.add('hidden');
            console.log(`[FilterBar] Auto-collapsed due to scroll, delta=${delta}px`);
          } catch (error) {
            console.error('[FilterBar] Auto-collapse error:', error);
          }
        }, 100); // Debounce 100ms before collapse
      }
    });

    lastScrollY = currentScrollY;
  });
</script>
```

**Key Details**:
- Debounce collapse with 100ms timeout (prevents rapid collapse/expand)
- Only auto-collapse if panel is currently open
- Preserve filter state (don't clear filters during collapse)
- Log collapse event for debugging
- Panel remains collapsed until user taps toggle (no auto-expand on scroll up)

**Test Status**: T012 tests must PASS after this implementation

---

### T014 Update FilterBar.astro styling for smooth transition and animation

**Window**: 3 (P3 - Polish)  
**Phase**: Styling / Animation  
**Traceability**: FR-006 (smooth collapse), NFR-P-003 (300ms animation, 60 FPS)  
**Dependencies**: T011 (panel markup), T013 (collapse logic)  
**Task Size**: ~1 hour  

**Description**:
Enhance FilterBar CSS with smooth transition and animation properties to ensure auto-collapse completes smoothly without layout shift or janky frames.

**What to modify**:

File: `/c/Users/camer/Documents/phoenix/src/styles/resource-filters.css` (add new rules)

**CSS Requirements**:
```css
/* FilterBar panel transitions */
[data-filter-panel] {
  max-height: 50vh;
  overflow-y: auto;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 1;
  visibility: visible;
}

[data-filter-panel].hidden {
  max-height: 0;
  opacity: 0;
  visibility: hidden;
  overflow: hidden;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Toggle button sticky positioning */
[data-mobile-filter-toggle] {
  position: sticky;
  top: 0;
  z-index: 50;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

/* Clear button sticky at bottom */
[data-clear-filters] {
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 10;
  border-top: 1px solid #e5e7eb;
}

/* Prevent layout shift during transition */
* {
  box-sizing: border-box;
}

@media (prefers-reduced-motion: reduce) {
  [data-filter-panel],
  [data-filter-panel].hidden {
    transition: none;
  }
}
```

**Key Details**:
- Use `cubic-bezier(0.4, 0, 0.2, 1)` easing for smooth Material Design motion
- Use opacity + visibility + max-height for smooth collapse (no janky reflow)
- Sticky positioning keeps toggle button visible during auto-collapse
- Respect `prefers-reduced-motion` for accessibility

**Test Status**: Animation validated via manual testing in T015

---

### T015 Integration test: Auto-collapse behavior and panel preservation

**Window**: 3 (P3 - Polish)  
**Phase**: Integration / Manual Testing  
**Traceability**: AC 12-15, SC-004 (collapse within 100ms + 300ms), SC-005 (UX timing)  
**Dependencies**: T011 (panel styling), T013 (collapse logic), T014 (animation)  
**Task Size**: ~2-3 hours  

**Description**:
Write integration test validating auto-collapse behavior and state preservation. Include manual testing checklist for scroll behavior and animation smoothness.

**What to create**:

File: `/c/Users/camer/Documents/phoenix/src/__tests__/integration/filter-auto-collapse.test.ts`

**Test Scenarios**:
1. Panel open, scroll < 100px → panel remains open
2. Panel open, scroll > 100px → panel collapses within 300ms
3. Panel collapsed, toggle button still visible and clickable
4. Tap toggle button → panel re-opens
5. Auto-collapse doesn't clear filters (state preserved)
6. Active filter badge displays after collapse
7. Scroll > 100px with panel closed → no effect
8. Scroll back to top → panel remains closed (no auto-expand)
9. Multiple collapse/expand cycles → no lag or stuttering
10. Toggle button remains sticky at top throughout

**Manual Testing Checklist**:
- [ ] Open filter panel on mobile
- [ ] Scroll down slowly → panel remains visible initially
- [ ] Scroll down 100px+ → panel slides up smoothly in ~300ms
- [ ] Toggle button remains visible and sticky at top
- [ ] Tap toggle → panel reopens (no glitch)
- [ ] Filters still applied after collapse/expand cycle
- [ ] Scroll back to top → panel stays collapsed (as designed)
- [ ] 60 FPS throughout (use DevTools Performance tab)
- [ ] No layout shift or janky transitions
- [ ] Test on real iPhone and Android device

**Success Criteria**:
- Auto-collapse triggers correctly at 100px threshold
- Collapse animation completes in ~300ms without frame drops
- Filter state preserved through collapse/expand cycles
- Toggle button remains accessible and sticky
- Smooth 60 FPS animation (no janky frames)

---

### T016 [P] Update API documentation with P3 changes

**Window**: 3 (P3 - Polish)  
**Phase**: Documentation  
**Traceability**: All features (user-facing docs)  
**Dependencies**: T015 (feature complete)  
**Task Size**: ~1 hour  

**Description**:
Update project documentation to reflect all P1, P2, P3 features. Add examples and screenshots if applicable.

**What to modify/create**:

File: `/c/Users/camer/Documents/phoenix/docs/API.md` or equivalent component docs

**Documentation additions**:
1. **Resource Tabs Carousel**: Describe mobile carousel behavior, note non-scrollable on desktop
2. **Filter Panel on Mobile**: Document filter toggle, active filter badge, clear all button
3. **Auto-Collapse**: Document 100px scroll threshold and ~300ms collapse behavior
4. **Panel Max-Height**: Document 50vh constraint and internal scrolling
5. **Keyboard Navigation**: Document Tab, Arrow keys, Home/End for both carousel and filters
6. **Accessibility**: Note ARIA attributes, touch target sizes, focus indicators

**Optional**: Add screenshots or animated GIFs of carousel and auto-collapse behavior

**Test Status**: Documentation reviewed manually before merge

---

### T017 [P] Code cleanup and final linting

**Window**: 3 (P3 - Polish)  
**Phase**: Cleanup  
**Traceability**: All (code quality)  
**Dependencies**: T015 (feature complete)  
**Task Size**: ~1 hour  

**Description**:
Clean up code, remove debug logs, ensure consistent formatting and TypeScript compliance.

**What to do**:
1. Remove any console.log or console.debug statements (keep console.error)
2. Run `npm run lint --fix` to auto-format code
3. Run TypeScript compiler: `npx tsc --noEmit` to check for type errors
4. Review inline scripts for clarity and remove dead code
5. Ensure all imports are used
6. Run full test suite: `npm test`

**Checklist**:
- [ ] No debug console.log statements
- [ ] All tests pass
- [ ] TypeScript types correct
- [ ] Linter passes
- [ ] No unused imports

**Success Criteria**:
- Clean, formatted code ready for merge
- No warnings or errors in tests, linter, TypeScript
- All tests passing

---

[WINDOW_CHECKPOINT_3]

**Before merging, validate**:
- [ ] T011: Filter panel max-height working, internal scroll functional
- [ ] T012: Auto-collapse unit tests pass
- [ ] T013: Scroll listener detects scroll and collapses panel
- [ ] T014: Animation smooth, 300ms completion, 60 FPS
- [ ] T015: Integration test passes, manual testing complete
- [ ] T016: Documentation updated
- [ ] T017: Code cleanup complete, tests pass
- [ ] All AC 12-15 (P3 acceptance criteria) passing
- [ ] No console errors or warnings
- [ ] Feature ready for merge to main

**If checkpoint fails**: Fix any remaining issues in Window 3 before merge. All P3 polish must be complete.

---

## Summary

**Total Execution Windows**: 3  
**Estimated Task Count**: 17 tasks (5-6 per window, with parallelization)  

**Token Allocation**:
- Window 1 (P1): 70-90k
- Window 2 (P2): 70-90k
- Window 3 (P3): 60-80k
- **Total**: 200-260k tokens

**Key Milestones**:
- WINDOW_CHECKPOINT_1: P1 critical fixes complete (filter toggle, state management, accessibility)
- WINDOW_CHECKPOINT_2: P2 carousel implemented (mobile-first horizontal scroll)
- WINDOW_CHECKPOINT_3: P3 polish complete (panel sizing, auto-collapse, documentation)

**Implementation Strategy**:
1. Window 1 focuses on fixing broken mobile filter interaction (P1 blocker)
2. Window 2 adds carousel for resource tabs (UX enhancement)
3. Window 3 polishes panel UX with sizing and auto-collapse (final touches)
4. Each window can be executed in isolation with fresh context
5. Checkpoints gate progression to next window (no skipping ahead)
6. Tests are written FIRST within each window, must FAIL before implementation
7. All work is client-side; no backend changes required

---

**Document Date**: 2026-04-22  
**Tasks Status**: READY_FOR_IMPLEMENTATION  
**Next Step**: Execute Window 1 tasks with implement agent
