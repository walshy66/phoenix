# Implementation Plan: Resource Filters Mobile UX

**Branch**: `cameronwalsh/coa-74-resource-filters` | **Date**: 2026-04-22 | **Spec**: [spec.md](./spec.md)

---

## Summary

COA-74 fixes broken mobile filter panel interactions (P1), adds a horizontal scrollable carousel for resource tabs (P2), and polishes the filter panel with auto-collapse on scroll and proper sizing (P3). This feature restores critical mobile functionality for resource discovery on Coaching Resources and Player Resources pages.

**Why this matters**: Mobile users cannot reliably interact with filters due to JavaScript errors and poor UX. Fixing this unblocks mobile resource browsing for coaches and players who discover materials on-the-go.

---

## Technical Context

**Language/Version**: JavaScript (TypeScript) + Astro 6.1.1  
**Primary Dependencies**: Astro, Tailwind CSS 4.2.2, Vanilla JS (no extra carousel libraries)  
**Frontend Framework**: Astro static site generation with island-based interactivity  
**Testing Framework**: Vitest 4.1.2  
**Target Platform**: Web (mobile-first responsive design, < 768px breakpoint)  
**Mobile Breakpoint**: Tailwind `md:` breakpoint = 768px (below = mobile, at/above = desktop)  
**Touch Target Size**: 44px minimum (WCAG AA standard)  
**Performance Goals**:
- Filter toggle response: < 100ms
- Carousel swipe response: < 50ms (perceived as instant)
- Auto-collapse animation: 300ms completion with 60 FPS

**Key Components**:
- `FilterBar.astro` — filter panel toggle button and filter controls (currently on desktop only via `md:hidden`)
- `src/lib/resources/filters.ts` — filtering logic (unchanged by this feature)
- `src/lib/resources/types.ts` — type definitions for resources and filters
- Resource pages: `coaching-resources.astro`, `player-resources.astro`
- Carousel pattern: Reference existing `HeroCarousel.astro` for scroll mechanics

---

## Constitution Check

**Principle I: User Outcomes First**
- ✅ PASS: All acceptance criteria measurable and user-centric (100% of test attempts work, < 50ms response time, etc.)

**Principle II: Test-First Discipline**  
- ✅ PASS: Each story independently testable in isolation (filter toggle separate from carousel, carousel separate from auto-collapse)

**Principle III: Backend Authority & Invariants**
- ✅ PASS: Client-side filtering only; no server mutations. Filter logic in `src/lib/resources/filters.ts` is legitimate client-side code.

**Principle V: AppShell Integrity**
- ✅ PASS: Filter panel is overlay/slide-in on mobile, stays within main content. Tabs remain within app structure.

**Principle VI: Accessibility First**
- ✅ PASS: All touch targets 44px minimum, keyboard navigation (Tab/Arrow keys), ARIA attributes (`aria-pressed`, `aria-expanded`), live regions for announcements, focus indicators with 3:1 contrast

**Principle VII: Immutable Data Flow**
- ✅ PASS: Unidirectional: user selects → active filters update → grid re-renders (no inference or client-side state derivation)

**Principle VIII: Dependency Hygiene**
- ✅ PASS: Uses existing dependencies (Astro, Tailwind). No new carousel libraries; leverages native HTML scroll + CSS + vanilla JS

**Principle IX: Cross-Feature Consistency**
- ✅ PASS: FilterBar component already follows established patterns. Carousel implements using patterns from existing `HeroCarousel.astro` and `HeroCircularCarousel.astro`

---

## Project Structure

```
src/
├── components/
│   ├── FilterBar.astro               [MODIFY] Add P1 fixes + P3 auto-collapse script
│   ├── ResourceTabs.astro            [NEW] Carousel for resource section tabs (P2)
│   └── __tests__/
│       ├── FilterBar.test.ts         [NEW] FilterBar toggle, filter state, aria attrs
│       └── ResourceTabs.test.ts      [NEW] Carousel scroll, boundaries, active state
│
├── lib/resources/
│   ├── types.ts                      [VERIFY] No changes needed
│   ├── filters.ts                    [VERIFY] No changes needed
│   ├── state.ts                      [NEW] Session-level filter state management
│   └── __tests__/
│       └── state.test.ts             [NEW] Filter state persistence, cross-nav
│
├── pages/
│   ├── coaching-resources.astro      [MODIFY] Integrate FilterBar & ResourceTabs, connect filter logic
│   └── player-resources.astro        [MODIFY] Integrate FilterBar & ResourceTabs, connect filter logic
│
└── styles/
    └── resource-filters.css          [NEW] Carousel scroll, panel sizing, animations

specs/coa-74-resource-filters/
├── spec.md                           [GIVEN]
├── plan.md                           [THIS FILE]
├── tasks.md                          [TO CREATE]
├── research.md                       [TBD - if needed]
└── data-model.md                     [NOT NEEDED - no schema changes]
```

---

## P1: Filter Panel Mobile Interaction (CRITICAL)

### Problem & Root Cause

Currently, FilterBar.astro has:
- Desktop-only display: `class="hidden md:flex"` (shows on desktop, hidden on mobile)
- Simple toggle script that doesn't handle all edge cases
- Missing filter state persistence across page navigation
- No error handling for rapid filter toggling

Mobile users:
1. Cannot open/close the filter panel without console errors
2. Cannot select filters without UI glitches
3. Lose filter state when navigating away and back
4. See broken styling or non-functional buttons

### Technical Approach

**1.1 Fix FilterBar Display Logic**
- Remove `hidden md:flex` constraint; make panel visible on mobile with proper styling
- On mobile: panel slides in/out as overlay or collapsible section (controlled by toggle button)
- On desktop: panel visible inline as part of normal layout
- Implement smooth show/hide with CSS transitions or animations

**1.2 Implement Session-Level State Management**
- Create new `src/lib/resources/state.ts` module to manage filter state
- Store active filters in `sessionStorage` (survives page reload/nav within session, resets on close)
- Alternative: in-memory component state (simpler, resets on page reload)
- Recommendation: Use `sessionStorage` with fallback to component state for best UX
- Export functions:
  - `getActiveFilters(section: ResourceSection): ActiveFilters`
  - `setActiveFilter(section: ResourceSection, type: 'age'|'category'|'skill', value: string, active: boolean)`
  - `clearFilters(section: ResourceSection)`
  - `getPanelState(section: ResourceSection): {isOpen: boolean}`
  - `setPanelState(section: ResourceSection, isOpen: boolean)`

**1.3 Enhance FilterBar.astro Toggle Script**
- Improve inline script to handle:
  - Proper aria-expanded state management
  - Dynamic button label updates ("Show filters" ↔ "Hide filters")
  - Active filter count badge display
  - Filter button toggle (aria-pressed, class updates, state sync)
  - Error boundary for rapid toggling
  - Logging of filter events for debugging
- Maintain existing button styling and touch targets (44px minimum)
- Add error boundary: catch and log any toggle errors to console with stack trace

**1.4 Connect Filter Logic to Page**
- On `coaching-resources.astro` and `player-resources.astro`:
  - Pass `activeFilters` and `searchKeyword` to FilterBar component
  - Pass available filters (ages, categories, skills) from resources data
  - Wire "Clear all filters" button to call `clearFilters()`
  - Listen for filter change events and re-render resource grid
  - Initialize filter state from `sessionStorage` on page load

**1.5 Keyboard Accessibility**
- Ensure all filter buttons are keyboard navigable:
  - Tab: focus moves between buttons
  - Enter/Space: toggles selected filter
  - Focus indicators: 2px solid outline with 3:1 contrast ratio
- Live region (`aria-live="polite"`) announces filter count changes

### Key Implementation Details

**FilterBar.astro Changes**:
```astro
// Current inline script has:
- toggle.addEventListener('click', () => { ... })

// New inline script must have:
- Error try/catch wrapper
- sessionStorage read/write
- aria-pressed updates on filter buttons
- aria-expanded state on toggle
- Active filter count badge updates
- Logging: console.log(`[FilterBar] Toggle clicked, section=${section}, newState=${expanded}`)
- Logging: console.log(`[FilterBar] Filter applied: type=${type}, value=${value}, active=${active}`)
```

**State Management (state.ts)**:
```typescript
export function getActiveFilters(section: ResourceSection): ActiveFilters {
  const key = `filters:${section}`;
  const stored = sessionStorage.getItem(key);
  return stored ? JSON.parse(stored) : { age: [], category: [], skill: [] };
}

export function setActiveFilter(
  section: ResourceSection,
  type: 'age' | 'category' | 'skill',
  value: string,
  active: boolean
): void {
  const filters = getActiveFilters(section);
  if (active) {
    if (!filters[type].includes(value)) filters[type].push(value);
  } else {
    filters[type] = filters[type].filter(v => v !== value);
  }
  sessionStorage.setItem(`filters:${section}`, JSON.stringify(filters));
}

// Similar for clearFilters, getPanelState, setPanelState
```

### Testing Strategy (P1)

**Unit Tests** (`FilterBar.test.ts`):
- Toggle button display (visible on mobile, hidden on desktop)
- Toggle functionality: click expands/collapses panel
- aria-expanded attribute updates correctly
- aria-pressed updates when filter selected/deselected
- Active filter count displays correctly
- Clear all filters clears all selections

**Integration Tests**:
- Filter state persists when navigating from Coaching → Player → back to Coaching
- Filter state clears on session end (close browser tab)
- No console errors on rapid filter toggling
- Filter grid updates immediately when filter applied

**Manual Testing (Mobile)**:
1. Open Coaching Resources on iPhone/Android (< 768px)
2. Tap "Show filters" button → panel appears, label changes to "Hide filters"
3. Tap age filter (e.g., "U12") → button highlights, results filter immediately
4. Tap category filter → both filters applied, count badge shows "2 active"
5. Tap "Hide filters" → panel closes, label reverts to "Show filters", filters preserved
6. Navigate to Player Resources → return to Coaching Resources → filters still applied
7. Verify no console errors throughout

---

## P2: Resource Tabs Carousel (ENHANCEMENT)

### Problem & Root Cause

On mobile, resource tabs (Coaching Resources, Player Resources, Manager Resources, Guides, Forms) are stacked vertically, which:
- Violates mobile UX patterns (expected horizontal scrolling for tabs)
- Reduces discoverability (only 1-2 tabs visible at a time)
- Looks poor on mobile (too much vertical space)
- Doesn't match native mobile app patterns

### Technical Approach

**2.1 Create ResourceTabs Component**
- New Astro component `src/components/ResourceTabs.astro`
- Props:
  - `tabs: { label: string; href: string; active: boolean }[]`
  - `section: ResourceSection`
- Renders:
  - Mobile (< 768px): Horizontal scrollable carousel with scroll indicators
  - Desktop (≥ 768px): Standard horizontal tab bar (no scroll needed)

**2.2 Carousel Implementation**
- Use native HTML scrolling (no JS library needed)
- Container: `overflow-x-auto scroll-smooth` (native scroll behavior)
- Each tab: `flex-shrink-0 px-4 py-3 whitespace-nowrap`
- Active tab: visual highlight (border-bottom or background)
- Scroll indicators: CSS gradient fade on left/right edges when content overflows

**2.3 Scroll Indicators (Visual Affordance)**
- CSS technique: linear gradients on left/right edges
- Fade-in effect when carousel has overflow content
- Example:
  ```css
  .carousel::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 32px;
    background: linear-gradient(to right, rgba(255,255,255,0.8), transparent);
    pointer-events: none;
    z-index: 10;
  }
  ```
- Disappear when user scrolls to boundary

**2.4 Keyboard Navigation**
- Left/Right arrow keys scroll carousel left/right
- Home/End keys jump to first/last tab
- Tab key navigates between tabs (standard)
- Enter/Space: click active tab link

**2.5 Momentum Scroll**
- Native browser momentum scroll (automatic on iOS with `scroll-behavior: smooth`)
- Smooth scrolling on Android/Chrome via CSS property
- No JS-based scroll handler needed (uses browser native for best performance)

**2.6 Active Tab Visibility**
- On load, ensure active tab is visible in viewport
- Use `Element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })` if needed
- Only necessary if active tab is off-screen on load

### Key Implementation Details

**ResourceTabs.astro**:
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
const hasOverflow = tabs.length > 3; // Visual heuristic
---

<div class="resource-tabs-carousel md:resource-tabs-bar" role="tablist">
  <div class="carousel-scroll-container overflow-x-auto scroll-smooth">
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

<script is:inline>
  // Keyboard navigation for carousel
  document.querySelectorAll('[role="tablist"]').forEach((list) => {
    const tabs = list.querySelectorAll('[role="tab"]');
    const container = list.querySelector('.carousel-scroll-container');

    if (!tabs.length || !container) return;

    tabs.forEach((tab, i) => {
      tab.addEventListener('keydown', (e) => {
        let nextTab = null;
        if (e.key === 'ArrowRight') {
          nextTab = tabs[Math.min(i + 1, tabs.length - 1)];
        } else if (e.key === 'ArrowLeft') {
          nextTab = tabs[Math.max(i - 1, 0)];
        } else if (e.key === 'Home') {
          nextTab = tabs[0];
        } else if (e.key === 'End') {
          nextTab = tabs[tabs.length - 1];
        }

        if (nextTab) {
          e.preventDefault();
          (nextTab as HTMLElement).focus();
          (nextTab as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });
  });
</script>

<style>
  .carousel-scroll-container {
    display: flex;
    gap: 0;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch; /* iOS momentum scroll */
  }

  /* Scroll indicator gradients */
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
</style>
```

**Page Integration** (coaching-resources.astro):
```astro
const tabs = [
  { label: 'Coaching Resources', href: '/coaching-resources', active: true },
  { label: 'Player Resources', href: '/player-resources', active: false },
  { label: 'Manager Resources', href: '/manager-resources', active: false },
  { label: 'Guides', href: '/guides', active: false },
  { label: 'Forms', href: '/forms', active: false },
];

<ResourceTabs tabs={tabs} section="coaching_resources" />
```

### Testing Strategy (P2)

**Unit Tests** (`ResourceTabs.test.ts`):
- Carousel renders all tabs
- Active tab has correct aria-selected and styling
- Keyboard navigation: arrow keys move focus between tabs
- Home/End keys jump to first/last tab
- Scroll indicators appear only when content overflows

**Integration Tests**:
- On mobile (< 768px), carousel is visible and scrollable
- On desktop (≥ 768px), tabs display in standard layout (no scroll)
- Device rotation (portrait ↔ landscape) preserves active tab and scroll position
- Swipe/scroll gestures work on real mobile devices

**Manual Testing (Mobile)**:
1. Open resources page on mobile
2. Observe tabs in horizontal scrollable carousel
3. Swipe left/right to scroll through tabs
4. Verify active tab is highlighted and visible
5. Tap inactive tab to navigate
6. Verify no horizontal overflow

---

## P3: Filter Panel Size & Auto-Collapse (POLISH)

### Problem & Root Cause

When filter panel is open on mobile:
- Panel can take up entire viewport, hiding resources
- User must manually close panel to see results
- No auto-collapse on scroll, so panel stays in the way

### Technical Approach

**3.1 Panel Max Height (50% Viewport)**
- Set filter panel max-height: `max-h-[50vh]` in Tailwind
- Panel is scrollable internally if filters exceed height (preserve all filter options)
- "Clear all filters" button sticky at bottom of panel

**3.2 Auto-Collapse on Scroll**
- Detect scroll events on resource grid (resourceList container)
- When scroll delta > 100px downward:
  - Trigger auto-collapse animation (300ms)
  - Slide panel up out of view
  - Keep toggle button sticky at top
- Logging: `console.log(`[FilterBar] Auto-collapsed due to scroll, delta=${delta}px`)`

**3.3 Scroll Re-expansion Behavior (Design Decision)**
- **Recommendation: Remain collapsed until user taps toggle**
- Reason: Clearer, more predictable behavior. User knows they control the panel.
- Alternative: Auto-expand when scroll back to top (more aggressive)
- **Decision must be documented in PR**

**3.4 Implementation Details**
- Add scroll listener to page container
- Track scroll position (last known scroll Y)
- On scroll event:
  - Calculate delta = scrollY - lastScrollY
  - If delta > 100px downward && panel is open:
    - Call `setPanelState(section, false)` to close panel
    - Trigger CSS transition (panel slides up)
- On scroll back to top (scrollY < 100px):
  - Option A: Do nothing (panel stays collapsed)
  - Option B: Auto-expand (panel slides down)
  - **Document chosen behavior**

**3.5 Panel State Preservation on Scroll**
- Auto-collapse does NOT clear filter selections
- Filters remain active while panel is collapsed
- Toggle button still shows active filter count

### Key Implementation Details

**FilterBar.astro Modifications**:
```astro
// Existing:
<div id={`filter-panel-${section}`} class="hidden md:flex ..." data-filter-bar>
  <!-- filter controls -->
</div>

// New:
<div id={`filter-panel-${section}`} 
     class="md:flex flex-col gap-3 max-h-[50vh] overflow-y-auto transition-all duration-300"
     data-filter-panel
     data-section={section}>
  <!-- filter controls, scrollable if needed -->
  
  <!-- Sticky clear button -->
  <button sticky bottom-0 data-clear-filters>Clear all filters</button>
</div>

<script is:inline>
  // Scroll listener for auto-collapse
  const resourceList = document.querySelector('[data-resource-list]');
  if (!resourceList) return;

  let lastScrollY = 0;
  let autoCollapseTimeout;

  resourceList.addEventListener('scroll', () => {
    const delta = resourceList.scrollTop - lastScrollY;
    const shell = resourceList.closest('[data-mobile-filter-shell]');
    const section = shell?.getAttribute('data-section');
    const toggle = shell?.querySelector('[data-mobile-filter-toggle]');
    const panel = shell?.querySelector('[data-filter-panel]');

    if (delta > 100 && toggle?.getAttribute('aria-expanded') === 'true') {
      // Auto-collapse
      clearTimeout(autoCollapseTimeout);
      autoCollapseTimeout = setTimeout(() => {
        toggle.setAttribute('aria-expanded', 'false');
        panel?.classList.add('hidden');
        console.log(`[FilterBar] Auto-collapsed due to scroll, delta=${delta}px`);
      }, 300);
    }

    lastScrollY = resourceList.scrollTop;
  });
</script>
```

### Testing Strategy (P3)

**Unit Tests**:
- Panel max-height is 50vh
- Panel has overflow-y-auto for internal scrolling
- Clear button is sticky at bottom

**Integration Tests**:
- Auto-collapse triggers after 100px scroll
- Auto-collapse completes within 300ms
- Filters remain active after auto-collapse
- Toggle button shows correct active filter count after collapse
- Panel can be re-opened by tapping toggle

**Manual Testing**:
1. Open filter panel on mobile
2. Scroll down in resource list by 100px+
3. Verify panel slides up out of view
4. Verify toggle button remains visible at top
5. Tap toggle to re-open panel
6. Scroll back to top
7. Verify panel behavior (stays collapsed or re-expands per design decision)

---

## Phased Delivery Strategy

### Phase 1: Foundation & P1 Fix (Days 1-3)

**Goals**: Restore broken filter functionality on mobile

**Tasks**:
1. Create `src/lib/resources/state.ts` (session state management)
2. Update `FilterBar.astro` inline script for proper toggle + state sync
3. Update `coaching-resources.astro` and `player-resources.astro` to use FilterBar correctly
4. Write unit tests for FilterBar toggle and state management
5. Manual mobile testing to confirm no console errors

**Deliverables**:
- Filter panel opens/closes without errors
- Filters apply immediately
- Filter state persists within session
- All acceptance criteria for P1 user story pass
- No console errors

**Testing Checkpoint**:
- All P1 acceptance criteria verified on mobile (< 768px)
- No console errors
- Filter state preserved across page navigation

---

### Phase 2: P2 Carousel (Days 4-5)

**Goals**: Implement horizontal scrollable carousel for resource tabs

**Tasks**:
1. Create `src/components/ResourceTabs.astro` component
2. Add carousel scroll container styling (Tailwind + CSS)
3. Implement scroll indicators (gradient fade)
4. Add keyboard navigation (arrow keys, home/end)
5. Integrate ResourceTabs into resource pages
6. Write unit tests for carousel functionality
7. Manual testing on multiple mobile devices

**Deliverables**:
- Carousel renders on mobile (< 768px)
- Carousel scrolls smoothly with swipe/drag/wheel
- Scroll indicators appear on edges
- Keyboard navigation works
- All P2 acceptance criteria pass
- No horizontal overflow

**Testing Checkpoint**:
- Carousel scrollable on mobile
- Active tab visible and highlighted
- No layout shifts or overflow
- Device rotation preserves state

---

### Phase 3: P3 Polish (Days 6-7)

**Goals**: Add auto-collapse and proper panel sizing

**Tasks**:
1. Add max-height: 50vh to filter panel
2. Make panel internally scrollable for overflow
3. Implement scroll listener for auto-collapse detection
4. Add auto-collapse animation (300ms transition)
5. Document scroll re-expansion behavior (design decision)
6. Write integration tests for auto-collapse
7. Manual testing of scroll behavior and edge cases

**Deliverables**:
- Panel max-height 50vh on mobile
- Panel auto-collapses on 100px+ scroll
- Auto-collapse completes in ~300ms
- Filters preserved after auto-collapse
- Clear button sticky at panel bottom
- All P3 acceptance criteria pass

**Testing Checkpoint**:
- Auto-collapse triggers correctly
- Panel remains scrollable internally
- No janky animations
- State preserved through collapse/expand cycles

---

## Testing Strategy (Complete)

### Test Layers

**1. Unit Tests** (Vitest)
- Filter state management (getActiveFilters, setActiveFilter, clearFilters)
- FilterBar toggle logic and aria attribute updates
- Carousel keyboard navigation
- Scroll indicator visibility logic

**2. Integration Tests** (Vitest + manual)
- Filter state persists across page navigation
- FilterBar correctly reflects active filters from state
- Carousel scroll doesn't affect filter state
- Auto-collapse triggers and preserves filters

**3. Manual Testing** (Mobile devices)
- iPhone SE (small screen, 375px width)
- iPhone 13 (standard, 390px width)
- Samsung Galaxy A50 (Android, 720px width)
- Desktop browsers at mobile viewport (< 768px)

**4. Accessibility Testing**
- Keyboard navigation (Tab, Arrow keys, Enter, Space)
- Screen reader (VoiceOver, TalkBack)
- Focus indicators (visible, 3:1 contrast)
- ARIA attributes (aria-expanded, aria-pressed, aria-live)

**5. Edge Cases**
- Rapid filter toggling (no dropped events)
- Device rotation (portrait ↔ landscape)
- Few vs. many tabs (< 3 vs. > 5)
- Mobile-to-desktop transition (resize browser)
- No results state (filter results in zero matches)

### Test File Structure

```
src/
├── lib/resources/__tests__/
│   └── state.test.ts          [NEW] Filter state management
│
└── components/__tests__/
    ├── FilterBar.test.ts      [NEW] Toggle, filters, aria attrs
    └── ResourceTabs.test.ts   [NEW] Carousel scroll, keyboard nav
```

---

## Research & Open Questions

### Resolved Design Decisions

1. **Carousel Library**: Use native HTML scroll + CSS instead of JS library
   - Rationale: Lighter weight, better performance, less dependencies
   - Existing patterns (HeroCarousel, HeroCircularCarousel) use vanilla JS/CSS

2. **State Persistence**: sessionStorage with component state fallback
   - Rationale: survives page reload/nav within session, resets on close
   - Alternative: localStorage (persists across sessions, complexity)
   - Alternative: URL params (shareable, but visible in URL)

3. **Scroll Momentum**: Native browser momentum (iOS -webkit-overflow-scrolling, Android native)
   - Rationale: Best UX, zero JS overhead
   - No custom scroll handler needed

### Pending Design Decisions (Document in PR)

1. **P3 Scroll Re-expansion Behavior**
   - Option A: Panel remains collapsed until user taps toggle (RECOMMENDED)
   - Option B: Panel auto-expands when scroll back to top
   - **Decision must be made before Phase 3 implementation**
   - **Document rationale in PR description**

2. **Scroll Indicator Style**
   - Gradient fade (recommended): smooth, matches Tailwind aesthetic
   - Arrow hints: more explicit affordance
   - **Choose based on design system review**

### Potential Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Filter state lost on page navigation | P1 blocker | Use sessionStorage, tested before Phase 1 merge |
| Carousel scroll performance janky on older Android | P2 UX issue | Test on real devices, fallback to non-smooth scroll |
| Auto-collapse animation causes layout shift | P3 UX issue | Use CSS transition (no paint), test 60 FPS |
| Touch target size < 44px on narrow screens | Accessibility fail | Review on 320px width device |
| Rapid filter toggling causes race condition | P1 bug | Add error boundary + debounce in state.ts |

---

## Complexity Tracking

**Deviation from Constitution**: None  
**Additional Complexity vs. Simpler Alternatives**: None significant

All decisions align with existing codebase patterns:
- Carousel pattern: consistent with HeroCarousel.astro
- Filter state: component-level, no server involvement (complies with Principle III)
- Accessibility: matches existing standards in codebase
- Testing: uses existing Vitest setup

---

## Quick Reference: Key Metrics

| Metric | Target | Component |
|--------|--------|-----------|
| Filter toggle response | < 100ms | FilterBar script |
| Carousel swipe response | < 50ms | Native scroll |
| Auto-collapse animation | 300ms | CSS transition |
| Panel max-height | 50vh | Tailwind max-h-[50vh] |
| Scroll threshold | 100px | Auto-collapse detection |
| Touch target size | 44px minimum | Button styling |
| Focus indicator contrast | 3:1 | CSS outline |
| Auto-collapse scroll detect | 100px + 300ms | setTimeout + scroll listener |

---

## Next Steps

1. **Review Plan**: Ensure technical decisions are sound
2. **Clarify P3 Scroll Behavior**: Decide re-expansion behavior before Phase 3
3. **Create tasks.md**: Break plan into atomic tasks for implementation
4. **Begin Phase 1**: Start with state.ts and FilterBar fixes
5. **Testing Checkpoint**: Verify P1 before moving to Phase 2

---

## Files to Create/Modify

### New Files
- `src/lib/resources/state.ts` — session state management
- `src/components/ResourceTabs.astro` — carousel component
- `src/lib/resources/__tests__/state.test.ts` — state tests
- `src/components/__tests__/FilterBar.test.ts` — FilterBar tests
- `src/components/__tests__/ResourceTabs.test.ts` — carousel tests
- `specs/coa-74-resource-filters/tasks.md` — task breakdown

### Modified Files
- `src/components/FilterBar.astro` — P1 fixes + P3 auto-collapse
- `src/pages/coaching-resources.astro` — integrate FilterBar + ResourceTabs
- `src/pages/player-resources.astro` — integrate FilterBar + ResourceTabs

### Reference (No Changes)
- `src/lib/resources/types.ts` — already has correct types
- `src/lib/resources/filters.ts` — filtering logic unchanged
- `src/components/HeroCarousel.astro` — reference pattern for carousel
- `src/components/HeroCircularCarousel.astro` — reference pattern for scroll

---

## Success Criteria Checklist

### P1 (Critical)
- [ ] Filter panel opens/closes without console errors on mobile
- [ ] Filters apply immediately when button clicked
- [ ] Active filter count badge displays correctly
- [ ] Filter state persists within session (sessionStorage)
- [ ] Filter state preserved across page navigation
- [ ] Clear all filters button works
- [ ] All touch targets ≥ 44px
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] aria-expanded and aria-pressed attributes correct
- [ ] Live region announces filter changes
- [ ] No console errors on rapid filter toggling

### P2 (Enhancement)
- [ ] Carousel renders on mobile (< 768px)
- [ ] Carousel scrolls smoothly with native momentum
- [ ] Scroll indicators visible when content overflows
- [ ] Active tab highlighted and visible
- [ ] Keyboard navigation works (arrow keys, Home, End)
- [ ] No horizontal overflow on any device
- [ ] Device rotation preserves scroll position
- [ ] All tabs keyboard accessible

### P3 (Polish)
- [ ] Panel max-height is 50vh
- [ ] Panel scrollable internally when overflow
- [ ] Auto-collapse triggers after 100px scroll
- [ ] Auto-collapse animation completes in ~300ms
- [ ] Filters preserved after auto-collapse
- [ ] Toggle button remains sticky at top
- [ ] Clear button sticky at bottom
- [ ] Scroll re-expansion behavior documented

---

## Accessibility Checklist (WCAG 2.1 AA)

- [ ] All buttons ≥ 44px × 44px touch target (FR-007)
- [ ] Focus indicators visible, 3:1 contrast, ≥ 2px outline (NFR-A-002)
- [ ] aria-pressed on filter buttons (NFR-A-003)
- [ ] aria-expanded on toggle button (NFR-A-004)
- [ ] aria-live region on filter panel (NFR-A-005)
- [ ] Keyboard navigation: Tab, Arrow keys, Home/End (NFR-A-006, FR-008)
- [ ] Color contrast 4.5:1 text, 3:1 graphics (NFR-A-001)
- [ ] No horizontal overflow (NFR-M-002)
- [ ] Smooth scroll, no layout shift (NFR-M-003)
- [ ] Device rotation preserves state (NFR-M-004)

---

**Document Date**: 2026-04-22  
**Plan Status**: READY FOR TASKS  
**Next Deliverable**: tasks.md (atomic task breakdown)
