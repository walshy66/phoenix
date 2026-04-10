# Implementation Plan: COA-33 — Resources Menu & Pages

**Branch**: `cameronwalsh/coa-33-resources-menu`  
**Date**: 2026-04-10  
**Spec**: [COA-33 Spec](./spec.md)  
**Status**: Ready for Implementation

---

## Executive Summary

COA-33 requires creating a Resources section within the Bendigo Phoenix website navigation with two independent audience paths: Coaching Resources and Player Resources. The feature can be delivered as 3 parallel work streams:

- **Part A**: Update navigation menu to route to `/resources` landing page
- **Part B**: Create `/resources/coaching` page with filters and keyboard navigation
- **Part C**: Create `/resources/players` page with filters and keyboard navigation

### Key Finding: Pages Already Exist

The codebase already contains partial implementations at:
- `/src/pages/coaching-resources.astro` (existing, needs relocation)
- `/src/pages/player-resources.astro` (existing, needs relocation)

Both pages have working filter logic, resource cards, and responsive design. The primary work is:
1. Restructure these pages under `/resources/` subdirectory
2. Create a `/resources/index.astro` landing page
3. Update navbar links to point to new routes
4. Enhance filter logic with keyboard navigation and logging

---

## Technical Context

### Stack & Environment
- **Framework**: Astro (static site with client-side interactivity)
- **Styling**: Tailwind CSS v4 with custom brand colors
- **Markup Language**: TypeScript + Astro templates
- **Target Browsers**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile Breakpoints**: 320px (mobile), 768px (tablet), 1024px (desktop)
- **Performance Goal**: <2s LCP on 3G throttling
- **Accessibility**: WCAG 2.1 Level AA

### Brand Design System
- **Primary Purple**: `#573F93` (brand-purple, primary CTAs)
- **Accent Gold**: `#8B7536` (brand-gold, highlights)
- **Black Text**: `#111111` (brand-black)
- **Off-White BG**: `#F4F5F7` (brand-offwhite)
- **Navigation**: Sticky top with z-index 50, height 16 units (64px)

### Existing Patterns
- `ResourceCard.astro` component for displaying individual resources with icons, badges, and CTAs
- Filter button logic using `data-*` attributes and vanilla JavaScript event listeners
- BaseLayout wrapper with Navbar + Footer structure
- Tailwind for responsive design with flex/grid layouts
- No CMS/API integration required (static data only)

---

## Accessibility & Mobile Design Review

### Current Filter Implementation Analysis
The existing coaching-resources.astro and player-resources.astro pages have:
- Filter buttons with visual active states (color changes)
- Click event listeners for toggling filters
- Display toggling via inline styles

**Issues to Address**:
1. **Keyboard Navigation**: Arrow keys not implemented for filter button navigation
2. **Focus Management**: No visible focus indicators on filter buttons (critical WCAG issue)
3. **Mobile Touch Targets**: Need to verify buttons are 44x44px minimum per spec
4. **ARIA Labels**: Missing proper `role="button"` and `aria-pressed` attributes
5. **Logging**: No filter event logging implemented
6. **Broken Links**: No error handling for resource links

### Mobile Optimization Requirements
- Filter bar should wrap gracefully on 320px screens without horizontal overflow
- Filter buttons need adequate spacing (minimum 12px gap, 44x44px targets)
- Sticky filter bar should not exceed 15% of viewport height
- Resource cards should be fully tappable on mobile
- Auto-scroll to first result after filter applied

---

## Project Structure & File Organization

### Current State
```
src/
├── components/
│   ├── Navbar.astro              (has Resources dropdown menu)
│   ├── ResourceCard.astro        (reusable resource card component)
│   ├── EventCard.astro
│   ├── Footer.astro
│   └── ...other components
├── pages/
│   ├── index.astro
│   ├── about.astro
│   ├── coaching-resources.astro  (NEED TO MOVE: old route)
│   ├── player-resources.astro    (NEED TO MOVE: old route)
│   ├── scores.astro
│   ├── team.astro
│   └── ...other pages
├── layouts/
│   └── BaseLayout.astro          (wraps all pages with Navbar + Footer)
├── data/
│   └── events.md                 (data file example)
└── lib/
    ├── court-time/
    ├── events/
    └── ...other utilities
```

### Target Structure (Post-Implementation)
```
src/
├── components/
│   ├── Navbar.astro              (updated with new routes)
│   ├── ResourceCard.astro        (enhanced with logging, accessibility)
│   ├── ResourcesFilter.astro     (NEW: extracted filter bar component)
│   └── ...
├── pages/
│   ├── resources/
│   │   ├── index.astro           (NEW: Resources landing page)
│   │   ├── coaching.astro        (NEW: Coaching Resources page)
│   │   └── players.astro         (NEW: Player Resources page)
│   ├── ...other pages (index, about, etc.)
├── lib/
│   ├── resources/                (NEW: utility functions)
│   │   ├── logger.ts             (filter & error logging)
│   │   ├── filters.ts            (filter logic utilities)
│   │   └── types.ts              (TypeScript interfaces)
│   └── ...
└── data/
    ├── coaching-resources.json   (NEW: static resource data)
    └── player-resources.json     (NEW: static resource data)
```

### File Changes Summary
| Action | File | Purpose |
|--------|------|---------|
| Create | `/src/pages/resources/index.astro` | Landing page with two CTAs |
| Create | `/src/pages/resources/coaching.astro` | Coaching Resources page |
| Create | `/src/pages/resources/players.astro` | Player Resources page |
| Modify | `/src/components/Navbar.astro` | Update resource links to `/resources/*` |
| Enhance | `/src/components/ResourceCard.astro` | Add link error handling + logging |
| Create | `/src/components/ResourcesFilter.astro` | Extract filter bar to reusable component |
| Create | `/src/lib/resources/logger.ts` | Logging utilities for filters & errors |
| Create | `/src/lib/resources/types.ts` | TypeScript types for resources |
| Create | `/src/lib/resources/filters.ts` | Filter logic utilities |
| Create | `/src/data/coaching-resources.json` | Static coaching resource data |
| Create | `/src/data/player-resources.json` | Static player resource data |
| Delete | `/src/pages/coaching-resources.astro` | Old route (redirect or migrate data) |
| Delete | `/src/pages/player-resources.astro` | Old route (redirect or migrate data) |

---

## Implementation Approach

### Phase 1: Data Structure & Infrastructure (Foundation)

**Goal**: Set up types, data files, and logging utilities.

#### 1.1 Create TypeScript Types (`src/lib/resources/types.ts`)
```typescript
export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  ageGroup: string;
  type: 'pdf' | 'link' | 'video' | 'document';
  url: string;
  imageUrl?: string;
  dateAdded: string;
}

export interface FilterEvent {
  event_type: 'filter_applied' | 'filter_removed';
  page: 'coaching_resources' | 'player_resources';
  filter_category: 'category' | 'ageGroup';
  filter_value: string;
  timestamp: string;
}

export interface BrokenLinkEvent {
  event_type: 'broken_link_detected';
  page: 'coaching_resources' | 'player_resources';
  resource_id: string;
  resource_url: string;
  http_status?: number;
  error_type?: string;
  timestamp: string;
}
```

#### 1.2 Create Logging Utilities (`src/lib/resources/logger.ts`)
- `logFilterEvent(event: FilterEvent)`: Log filter interactions to console and telemetry
- `logBrokenLink(event: BrokenLinkEvent)`: Log broken resource links
- `getSessionId()`: Generate or retrieve anonymous session ID (localStorage)
- Support for Google Analytics or custom event tracking (future expansion)

#### 1.3 Create Filter Logic Utilities (`src/lib/resources/filters.ts`)
- `filterResources(resources: Resource[], activeFilters: Record<string, string>)`: Pure filter function
- `getAvailableAgeGroups(resources: Resource[])`: Extract unique age groups from resources
- `getAvailableCategories(resources: Resource[], page: string)`: Extract categories per audience

#### 1.4 Create Resource Data Files
- `src/data/coaching-resources.json`: Array of coaching resources with metadata
- `src/data/player-resources.json`: Array of player resources with metadata
- Manually migrate data from existing pages (or load from existing Astro frontmatter)

---

### Phase 2: Navigation & Landing Page (User Facing)

**Goal**: Create Resources landing page and update navbar routing.

#### 2.1 Update Navbar (`src/components/Navbar.astro`)
- Change resource dropdown links from `/coaching-resources` and `/player-resources` to `/resources/coaching` and `/resources/players`
- Update `currentPath.includes('resources')` check to work with new nested routes
- Test that dropdown opens/closes correctly and items are tappable on mobile

#### 2.2 Create Resources Index Page (`src/pages/resources/index.astro`)
- Page title: "Resources"
- Hero section with brand-purple background, gold accent bar
- Two large, clickable option buttons: "Coaching Resources" and "Player Resources"
- Each button includes:
  - Icon or visual indicator (e.g., whistle for coaches, player icon for players)
  - Descriptive text ("for coaches and volunteers" vs "for players and families")
  - Hover state with gold underline
- Responsive: stacks vertically on mobile, side-by-side on tablet+
- Include breadcrumb: Home > Resources (optional back navigation)
- Ensure no console errors on render

#### 2.3 Verify Routing
- Test that `/resources` renders the landing page
- Test that navbar "Resources" click navigates to `/resources`
- Test that breadcrumb/back button returns to resources index (not home)

---

### Phase 3: Coaching Resources Page (Part B)

**Goal**: Create `/resources/coaching` page with enhanced filters, accessibility, and logging.

#### 3.1 Create Page Component (`src/pages/resources/coaching.astro`)
- Import data from `/src/data/coaching-resources.json`
- Render BaseLayout with title "Coaching Resources"
- Include hero section (brand-purple, gold accent, descriptive text)
- Include filter bar (see 3.2 below)
- Include resources grid (3 columns on desktop, 2 on tablet, 1 on mobile)
- Include no-results message with "Clear filters" button
- Include CTA section for resource submissions

#### 3.2 Create/Enhance Filter Bar Component
**Option A**: Extract to reusable component `ResourcesFilter.astro`
- Props: `categories`, `ageGroups`, `onFilterChange`
- Return filter state via client-side script
- Supports multiple instances (coaching + player pages)

**Option B**: Keep filter logic in page, enhance with accessibility
- Add `role="group"` and `aria-label="Filter resources"` to filter container
- Add `role="switch"` or `aria-pressed="true/false"` to each filter button
- Add visible focus outline (e.g., 3px gold border on focus)
- Add keyboard event listeners for arrow key navigation

**Recommendation**: Option B initially (simpler), extract to Option A if reuse needed

#### 3.3 Implement Keyboard Navigation
For each filter group (age groups, categories):
1. **Tab navigation**: Tab to focus first button in group
2. **Arrow keys**: Left/Right arrows move focus between buttons in same group
3. **Enter/Space**: Toggle filter on/off
4. **Focus persistence**: All active filters remain highlighted during navigation
5. **Visual feedback**: 
   - Focus indicator (gold 3px border + shadow)
   - Active state (filled background + white text)

**Implementation details**:
```typescript
// In <script> section:
document.querySelectorAll('[role="group"]').forEach(group => {
  const buttons = group.querySelectorAll('button');
  
  buttons.forEach((btn, idx) => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' && idx > 0) {
        buttons[idx - 1].focus();
      } else if (e.key === 'ArrowRight' && idx < buttons.length - 1) {
        buttons[idx + 1].focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
});
```

#### 3.4 Implement Filter Logging
On each filter toggle:
```typescript
// Log filter applied
logFilterEvent({
  event_type: 'filter_applied',
  page: 'coaching_resources',
  filter_category: 'category',
  filter_value: 'Defence',
  timestamp: new Date().toISOString(),
});

// Log to console in development
console.log('Filter Applied:', { page: 'coaching_resources', category: 'Defence' });
```

#### 3.5 Enhance ResourceCard Component
- Add error handling for broken links:
  ```typescript
  // In ResourceCard click handler
  btn.addEventListener('click', async (e) => {
    if (isExternalUrl && isHashLink) {
      // Try fetch to validate link
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        logBrokenLink({
          event_type: 'broken_link_detected',
          page: 'coaching_resources',
          resource_id: resourceId,
          resource_url: url,
          http_status: response.status,
          timestamp: new Date().toISOString(),
        });
      }
    }
  });
  ```

#### 3.6 Mobile Optimization
- **Filter bar layout**: Use `flex-wrap: wrap` with `gap-1.5` (6px gap)
- **Button sizing**: Minimum 44x44px with padding: `px-3 py-2` (adjustable)
- **Sticky positioning**: `sticky top-16 z-40` (below navbar at z-50)
- **Viewport check**: Filter bar + padding should not exceed 15% of viewport
- **Auto-scroll**: After filter applied, scroll to first visible resource
  ```typescript
  const firstCard = document.querySelector('#resources-grid > div');
  if (firstCard) {
    firstCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  ```

#### 3.7 Success Criteria for Part B
- Page renders without console errors
- All resources display initially
- Filters toggle on/off correctly (visual feedback)
- Multiple filters can be combined (AND logic)
- Arrow keys navigate between filter buttons
- Enter/Space key toggles filter
- Focus is visible (gold border on buttons)
- No-results message appears when no matches
- Mobile layout wraps gracefully (no horizontal overflow)
- Resource links open correctly (external in new tab)
- Filter events logged to console (or telemetry service)
- Broken links are detected and logged

---

### Phase 4: Player Resources Page (Part C)

**Goal**: Create `/resources/players` page with same enhancements as Part B.

#### 4.1 Create Page Component (`src/pages/resources/players.astro`)
- Identical structure to coaching page (hero, filters, grid, CTA)
- Import data from `/src/data/player-resources.json`
- Use audience-specific categories: "Nutrition", "Mental Skills", "Rules", "Development"
- Hero section color/messaging tailored to players (not coaches)

#### 4.2 Reuse Filter & Accessibility Logic
- Copy filter button logic from coaching page
- Adapt keyboard navigation and logging for `page: 'player_resources'`
- Ensure logging events correctly identify the page source

#### 4.3 Mobile Optimization
- Same as Part B (wrap, spacing, touch targets, auto-scroll)

#### 4.4 Success Criteria for Part C
- Same as Part B, but for player audience
- Distinct categories per spec (Nutrition, Mental Skills, Rules, Development)
- Logging correctly identifies `page: 'player_resources'`

---

### Phase 5: Testing & Verification

**Goal**: Validate all three parts against spec acceptance criteria.

#### 5.1 Navigation Testing (Part A)
- [ ] Navbar "Resources" menu item exists and is styled with brand colors
- [ ] Clicking "Resources" on navbar navigates to `/resources`
- [ ] `/resources/index.astro` displays with title "Resources"
- [ ] Two buttons visible: "Coaching Resources" and "Player Resources"
- [ ] Clicking "Coaching Resources" navigates to `/resources/coaching`
- [ ] Clicking "Player Resources" navigates to `/resources/players`
- [ ] Back navigation works (browser back button, breadcrumb if added)
- [ ] Mobile menu also has Resources section with same options
- [ ] Menu is accessible (no console errors)

#### 5.2 Coaching Resources Testing (Part B)
- [ ] Page renders at `/resources/coaching`
- [ ] Page title is "Coaching Resources"
- [ ] Hero section displays with brand-purple background
- [ ] Resources display in 3-column grid (desktop), 2-column (tablet), 1-column (mobile)
- [ ] Filter buttons exist for age groups and categories
- [ ] Clicking filter button toggles selection (visual feedback)
- [ ] Multiple filters can be combined
- [ ] Applying filter updates displayed resources in real-time
- [ ] No-results message displays when filters match zero resources
- [ ] "Clear filters" button resets all filters
- [ ] All filter buttons are keyboard accessible:
  - [ ] Tab focuses first button in group
  - [ ] Arrow keys navigate between buttons
  - [ ] Enter/Space toggles filter
  - [ ] Focus is visible (gold outline)
- [ ] Mobile testing (Chrome DevTools 320px):
  - [ ] Filter buttons wrap without overflow
  - [ ] Button touch targets are 44x44px minimum
  - [ ] Filter bar is sticky and visible while scrolling
  - [ ] After filter applied, page scrolls to first resource
- [ ] Resource cards render correctly with title, description, type badge, age group, category
- [ ] Links work (click opens resource or external URL in new tab)
- [ ] Filter events logged to console
- [ ] Broken links detected and logged
- [ ] No console errors or warnings

#### 5.3 Player Resources Testing (Part C)
- [ ] Same as Part B but for `/resources/players`
- [ ] Categories are audience-appropriate (Nutrition, Mental Skills, Rules, Development)
- [ ] Logging correctly identifies `page: 'player_resources'`

#### 5.4 Accessibility Audit
- [ ] WAVE or Axe DevTools scan shows no WCAG 2.1 AA violations
- [ ] Color contrast: 4.5:1 for text, 3:1 for graphics
- [ ] Focus indicators visible on all interactive elements
- [ ] Keyboard-only navigation works for all features
- [ ] Screen reader testing (VoiceOver/NVDA) on filter buttons and results

#### 5.5 Performance Audit
- [ ] Lighthouse audit on 3G throttling: LCP < 2s
- [ ] No layout shifts (CLS) when applying filters
- [ ] No memory leaks (DevTools profiler)

#### 5.6 Cross-Browser Testing
- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

#### 5.7 Device Testing
- [ ] iPhone SE (375px)
- [ ] iPhone 12/14/15 (390px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px+)
- [ ] Android devices (Samsung Galaxy S21: 360px)

---

## Detailed Component Architecture

### Component Hierarchy
```
BaseLayout
├── Navbar (updated with /resources/* links)
├── Main Content
│   ├── Page: /resources/index.astro
│   │   ├── Hero section
│   │   ├── Two buttons (Coaching / Player)
│   │   └── Optional breadcrumb
│   ├── Page: /resources/coaching.astro
│   │   ├── Hero section
│   │   ├── Filter bar (filter buttons in groups)
│   │   ├── Resources grid
│   │   │   └── ResourceCard (×N)
│   │   ├── No-results message
│   │   └── CTA section
│   └── Page: /resources/players.astro
│       └── (same as coaching)
└── Footer
```

### Data Flow
```
Resource Data (.json)
↓
Page Component (astro file)
├─ Load data
├─ Render filter buttons
├─ Render resource cards
└─ Script: Handle clicks, filters, logging
```

### State Management (Client-Side)
```typescript
// In <script> tag of page
let activeAge: string = 'all';
let activeCategory: string = 'all';
let sessionId: string = generateSessionId(); // from localStorage

function applyFilters() {
  // Filter logic: show/hide cards based on activeAge + activeCategory
  // Update no-results visibility
  // Log filter event
}

// Event listeners on filter buttons
document.querySelectorAll('.age-filter').forEach(btn => {
  btn.addEventListener('click', (e) => {
    activeAge = btn.getAttribute('data-age') || 'all';
    updateButtonStates(); // Update visual states
    applyFilters(); // Re-filter cards
    logFilterEvent(); // Log to analytics
  });
});
```

---

## Filter Logic & State Management

### Filter Button Implementation
Each filter button:
- `data-age="U12"` or `data-category="Defence"` for filtering
- `class="filter-btn age-filter"` or `class="filter-btn cat-filter"` for JavaScript hooks
- Active state: `bg-brand-purple text-white` (age) or `bg-brand-gold text-white` (category)
- Inactive state: `bg-white text-brand-purple/gold border border-brand-purple/gold`
- Focus state: visible outline (e.g., `focus:ring-2 focus:ring-brand-gold focus:ring-offset-2`)

### Filter Logic (Unchanged from Existing)
- **Single active filter per group**: Only one age group active at a time, only one category active at a time
- **AND logic between groups**: Show resources matching BOTH age group AND category
- **'All' option**: Resets that group to show all values
- **No URL persistence**: Filters reset on page reload

### Enhanced: Reset Behavior
- "Clear filters" button resets activeAge and activeCategory to 'all'
- Updates button visual states
- Re-applies filter logic to show all resources
- Logs clear-all-filters event

---

## Keyboard Navigation Implementation

### Requirements (WCAG 2.1 AA)
1. All interactive elements reachable via Tab
2. Focus visible with at least 3:1 contrast
3. Logical tab order (left-to-right, top-to-bottom)
4. Arrow keys for navigation within button groups (optional but recommended)

### Implementation Steps

**Step 1**: Add focus styles to filter buttons
```css
.filter-btn:focus {
  outline: 3px solid #8B7536;
  outline-offset: 2px;
}

/* Or use ring utility */
.filter-btn:focus {
  @apply focus-visible:ring-2 focus-visible:ring-brand-gold;
}
```

**Step 2**: Add arrow key listeners
```typescript
const filterGroups = {
  age: document.querySelectorAll('.age-filter'),
  category: document.querySelectorAll('.cat-filter'),
};

['age', 'category'].forEach(group => {
  filterGroups[group].forEach((btn, idx) => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' && idx > 0) {
        e.preventDefault();
        filterGroups[group][idx - 1].focus();
      } else if (e.key === 'ArrowRight' && idx < filterGroups[group].length - 1) {
        e.preventDefault();
        filterGroups[group][idx + 1].focus();
      }
    });
  });
});
```

**Step 3**: Ensure space/enter toggles filter
```typescript
btn.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    btn.click();
  }
});
```

---

## Mobile Optimization Checklist

### Layout & Spacing
- [ ] Filter buttons use `flex-wrap: wrap` with `gap-1.5` (6px)
- [ ] Each button has minimum padding: `px-3 py-2` (12px + 8px)
- [ ] Touch target size: minimum 44x44px (verify with DevTools)
- [ ] No horizontal scrolling on 320px viewport
- [ ] Filter bar sticky: `sticky top-16 z-40` (below navbar)

### Responsive Grid
- [ ] Desktop (1024px+): 3-column grid
- [ ] Tablet (768px): 2-column grid
- [ ] Mobile (320px): 1-column grid
- [ ] Card padding/margins consistent across all sizes

### Sticky Filter Bar
- [ ] Height: Monitor actual height on 320px (should not exceed 15% of viewport = ~48px)
- [ ] If filter buttons wrap to multiple rows, adjust height accordingly
- [ ] Ensure resource cards remain visible below sticky bar

### Auto-Scroll Behavior
After applying a filter:
```typescript
// Scroll first visible resource into view
const firstCard = document.querySelector('#resources-grid > :not([style*="display: none"])');
if (firstCard) {
  firstCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
```

### Text & Typography
- [ ] Minimum font size: 16px (or readable with standard zoom)
- [ ] Line height: 1.5 for readability
- [ ] Adequate color contrast: 4.5:1 for text on background

---

## Logging & Observability Implementation

### Filter Event Logging
**Where**: Each time a filter button is clicked
```typescript
logFilterEvent({
  event_type: 'filter_applied', // or 'filter_removed' if unsetting
  page: 'coaching_resources', // or 'player_resources'
  filter_category: 'category', // or 'ageGroup'
  filter_value: 'Defence', // the selected value
  timestamp: new Date().toISOString(),
  session_id: getSessionId(), // anonymous, from localStorage
});
```

**Output Options**:
1. **Development**: `console.log()` (always enabled)
2. **Production**: Send to Google Analytics, Segment, or custom endpoint
   ```typescript
   if (typeof window !== 'undefined' && window.gtag) {
     window.gtag('event', 'filter_applied', {
       page: 'coaching_resources',
       filter_category: 'category',
       filter_value: 'Defence',
     });
   }
   ```

### Broken Link Detection
**Where**: In ResourceCard component when link is clicked or image fails to load
```typescript
logBrokenLink({
  event_type: 'broken_link_detected',
  page: 'coaching_resources',
  resource_id: 'res-001', // from resource data
  resource_url: 'https://example.com/resource.pdf',
  http_status: 404, // if available
  error_type: 'fetch_error', // 'fetch_error', 'image_load_failed', 'timeout'
  timestamp: new Date().toISOString(),
  session_id: getSessionId(),
});
```

### Logger Implementation
`src/lib/resources/logger.ts`:
```typescript
export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  
  let sessionId = localStorage.getItem('phoenix_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('phoenix_session_id', sessionId);
  }
  return sessionId;
}

export function logFilterEvent(event: FilterEvent): void {
  console.log('[Filter Event]', event);
  // TODO: Send to telemetry service
}

export function logBrokenLink(event: BrokenLinkEvent): void {
  console.error('[Broken Link Detected]', event);
  // TODO: Send to error tracking service (Sentry, etc.)
}
```

---

## Edge Cases & Error Handling

### No Resources Match Filters
**Scenario**: User selects "U12" + "Offence" but no resources match
**Behavior**:
1. Hide all resource cards
2. Display "No resources match your current filters" message
3. Show "Clear all filters" button
4. User can click button to reset filters (or click a specific filter)

**Code**:
```typescript
const visibleCount = cards.filter(card => card.style.display !== 'none').length;
const noResultsEl = document.getElementById('no-results');
if (noResultsEl) {
  noResultsEl.classList.toggle('hidden', visibleCount > 0);
}
```

### Broken Resource Links
**Scenario**: Resource URL returns 404 or connection timeout
**Behavior**:
1. Log error with resource ID and URL
2. Allow user to click link anyway (may fail in browser)
3. Consider disabling link or showing warning badge (future enhancement)

**Current Implementation**: Logging only (no UI changes in MVP)

### Empty Resource Lists
**Scenario**: A page has no resources defined (future, during development)
**Behavior**:
1. Display "Coming soon" or placeholder message
2. Show CTA to submit resources

**Code**: Already in place in coaching-resources.astro and player-resources.astro

### Missing Images in Resource Cards
**Scenario**: `imageUrl` is undefined or image fails to load
**Behavior**: 
1. Display icon placeholder (emoji or SVG) based on resource type
2. Already implemented in ResourceCard.astro

### Mobile Menu Accessibility
**Current**: Navbar dropdown on desktop, menu items in mobile menu
**Verify**: Mobile menu items are keyboard accessible and properly labeled

---

## Accessibility Checklist

### Keyboard Navigation
- [ ] All filter buttons are focusable via Tab
- [ ] Focus order is logical (left-to-right, top-to-bottom)
- [ ] Focus is visually distinct (gold outline, 3px)
- [ ] Arrow keys navigate within filter groups
- [ ] Enter/Space key toggles filter
- [ ] Clear Filters button is tabbable

### Color & Contrast
- [ ] Button text on background: 4.5:1 minimum
- [ ] Active state (filled button): white text on purple/gold
- [ ] Inactive state: purple/gold text on white
- [ ] No information conveyed by color alone (button also has text/icon)

### ARIA & Labels
- [ ] Filter container: `role="group" aria-label="Filter resources"`
- [ ] Filter buttons: `role="button"` (or semantic `<button>` elements)
- [ ] Active filter: `aria-pressed="true"`
- [ ] Filter label: `aria-label="Filter by category: Defence"`
- [ ] No-results message: `role="status" aria-live="polite"`

### Semantic HTML
- [ ] Use `<button>` for interactive elements (not `<div role="button">`)
- [ ] Use `<a>` for navigation links with proper `href`
- [ ] Use heading hierarchy: h1 for page title, h2 for sections

### Responsive Text
- [ ] Minimum font size: 16px on mobile (no zoom required)
- [ ] Line height: 1.5 for readability
- [ ] No horizontal scrolling on 320px viewport

### Testing Tools
- [ ] WAVE WebAIM (browser extension)
- [ ] Axe DevTools (browser extension)
- [ ] VoiceOver (macOS) or NVDA (Windows)
- [ ] Manual keyboard-only testing

---

## Testing Verification Checklist

### Part A: Navigation & Landing Page
Navigation Testing:
- [ ] Navbar displays "Resources" menu item
- [ ] "Resources" in navbar has purple background, white text
- [ ] Navbar active state shows gold underline when on `/resources*` pages
- [ ] Desktop: Dropdown menu appears with two options
- [ ] Mobile: Menu section shows "RESOURCES" label with two links
- [ ] Clicking "Resources" navigates to `/resources` (landing page)
- [ ] `/resources/index.astro` renders without console errors

Landing Page Tests:
- [ ] Page title is "Resources"
- [ ] Hero section displays with brand-purple background
- [ ] Two buttons visible: "Coaching Resources" and "Player Resources"
- [ ] Each button has descriptive text (e.g., "For coaches and volunteers")
- [ ] Buttons are styled with gold accent, rounded corners
- [ ] Clicking "Coaching Resources" navigates to `/resources/coaching`
- [ ] Clicking "Player Resources" navigates to `/resources/players`
- [ ] Breadcrumb or back navigation works
- [ ] Mobile layout: buttons stack vertically
- [ ] No console errors or warnings

### Part B: Coaching Resources Page
Rendering & Content:
- [ ] Page renders at `/resources/coaching`
- [ ] Page title: "Coaching Resources"
- [ ] Hero section displays with brand-purple background + gold accent bar
- [ ] Descriptive text explains page is for coaches
- [ ] Resources grid displays in 3 columns (desktop), 2 (tablet), 1 (mobile)
- [ ] ResourceCard components render with title, description, type, age group, category badges
- [ ] "View Resource" button is visible and clickable
- [ ] No console errors on initial load

Filter Functionality:
- [ ] Age group filter buttons display: All Ages, U8, U10, U12, U14, U16, U18, Senior
- [ ] Category filter buttons display: All Categories, Defence, Offence, Drills, Fundamentals, Game Plans, Tools
- [ ] Filter buttons have active state styling (filled bg, white text)
- [ ] Clicking a filter button toggles it on (filled) or off (outlined)
- [ ] Only one button per group can be active (clicking new one deactivates previous)
- [ ] Applying filters updates resource grid in real-time (no page reload)
- [ ] Resources with matching age group AND category are visible
- [ ] Resources with non-matching filters are hidden
- [ ] When filters result in zero matches, "No results" message appears
- [ ] "Clear filters" button resets all filters and shows all resources again
- [ ] Page reload resets filters (no persistence in MVP)

Keyboard Navigation:
- [ ] Tab key focuses filter buttons in order
- [ ] Focus is visually distinct (gold outline)
- [ ] Arrow left/right keys move focus between buttons in same group
- [ ] Arrow keys skip to next/previous group on group boundary
- [ ] Enter/Space key toggles focused filter button
- [ ] Tabbing past filter group moves to next tabbable element
- [ ] No keyboard traps

Mobile (320px viewport):
- [ ] Filter buttons wrap to multiple rows
- [ ] No horizontal overflow or scrolling
- [ ] Each button touch target is 44x44px minimum (verify in DevTools)
- [ ] Gap between buttons is adequate (minimum 8px)
- [ ] Filter bar remains sticky while scrolling (top: 16 units below navbar)
- [ ] Filter bar height does not exceed 15% of viewport
- [ ] Resource cards are fully visible and tappable
- [ ] After applying filter, page auto-scrolls to first resource (optional but nice)

Resource Links:
- [ ] Internal links (starting with `/`) open in same tab
- [ ] External links open in new tab (`target="_blank"`)
- [ ] All links are functional (check against data)
- [ ] Placeholder links (`url: '#'`) show appropriate handling

Logging & Errors:
- [ ] Filter events logged to console with correct page/filter_category/filter_value
- [ ] Broken links are detected and logged (if applicable)
- [ ] No console errors during filter operations

### Part C: Player Resources Page
- [ ] Repeat all Part B tests but for `/resources/players`
- [ ] Category options are audience-appropriate: Nutrition, Mental Skills, Drills, Rules, Development
- [ ] Logging correctly identifies `page: 'player_resources'`
- [ ] Hero section messaging is tailored to players (not coaches)

### Accessibility Audit
- [ ] WAVE scan: 0 errors, any alerts reviewed
- [ ] Axe scan: 0 violations
- [ ] Color contrast: All text 4.5:1, graphics 3:1
- [ ] Keyboard-only navigation: All features accessible without mouse
- [ ] Screen reader (NVDA/VoiceOver): All elements announced correctly

### Cross-Browser Compatibility
- [ ] Chrome (latest): All features work, no console errors
- [ ] Firefox (latest): All features work, no console errors
- [ ] Safari (latest): All features work, no console errors
- [ ] Edge (latest): All features work, no console errors

### Performance
- [ ] Lighthouse audit on 3G throttling: LCP < 2 seconds
- [ ] No Cumulative Layout Shift (CLS) when applying filters
- [ ] No memory leaks (DevTools performance monitor)

---

## Implementation Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Filter logic has bugs (wrong AND/OR logic) | Filters don't work as intended | Medium | Comprehensive unit tests for filter logic; manual QA on each filter combination |
| Keyboard navigation not fully implemented | Fails accessibility audit | High | Follow WCAG 2.1 AA guidelines; test with actual keyboard-only user |
| Mobile buttons too small or not properly spaced | Mobile UX fails WCAG | High | Verify 44x44px minimum in DevTools; test on real mobile devices |
| Old routes (`/coaching-resources`, `/player-resources`) are used by users | Breaks external links/bookmarks | Medium | Set up 301 redirects from old routes to new routes (or keep old pages as redirects) |
| Logging not implemented or working | Can't track user behavior | Low | Implement console.log first; add telemetry later if needed |
| Performance regression due to filter logic | LCP > 2s on 3G | Low | Profile with DevTools; optimize filter function if needed (unlikely with small data sets) |

---

## Deployment Plan

### Pre-Deployment Checklist
- [ ] All components created and tested locally
- [ ] No console errors or warnings in all browsers
- [ ] Responsive design tested on mobile/tablet/desktop
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Filter logic verified with multiple test cases
- [ ] Keyboard navigation working correctly
- [ ] Logging implemented and tested
- [ ] Data migration complete (resources in `.json` files)
- [ ] Old routes handled (redirect or keep if backward compatibility needed)

### Deployment Steps
1. Build site: `npm run build`
2. Test in build output
3. Deploy to VentraIP via SFTP (existing process)
4. Verify pages render on live site
5. Monitor console logs for errors (first 24 hours)
6. Verify Google Analytics (if integrated) shows filter events

### Rollback Plan
- Keep old pages (`/src/pages/coaching-resources.astro`, etc.) in a backup branch
- If critical issue found, revert Navbar links to old routes temporarily
- Fix issue in development, re-test, and redeploy

---

## Summary & Next Steps

### Completed Tasks
- Spec reviewed and understood
- Codebase explored (existing resources pages found)
- Architecture designed
- File structure planned
- Components identified (new and enhanced)
- Accessibility requirements detailed
- Mobile optimization strategy outlined
- Logging approach defined
- Testing checklist created

### Ready for Implementation
The team can now:
1. **Part A**: Update Navbar and create `/resources/index.astro` (lowest risk, enables Parts B & C)
2. **Part B**: Create `/resources/coaching.astro` with enhanced filters and accessibility
3. **Part C**: Create `/resources/players.astro` (mirror of Part B with different data)

Each part can be implemented and tested independently, then merged when ready.

### Success Criteria
All acceptance criteria from spec met:
- Navigation works and routes correctly
- Pages render without errors
- Filters functional and keyboard-accessible
- Mobile experience optimized (44x44px buttons, no overflow)
- Logging in place
- Accessibility audit passed
- Performance meets goals (<2s LCP on 3G)

---

## Appendix: Code Examples

### Example: ResourceCard with Error Handling
```astro
---
interface Props {
  id: string;
  title: string;
  description: string;
  category: string;
  ageGroup: string;
  type: 'pdf' | 'link' | 'video' | 'document';
  url: string;
  page: 'coaching_resources' | 'player_resources';
}

const { id, title, description, category, ageGroup, type, url, page } = Astro.props;
---

<div class="resource-card bg-white rounded-xl shadow-sm border border-gray-100" 
     data-category={category} data-age={ageGroup} data-id={id}>
  <!-- ... content ... -->
  <a
    href={url}
    target={url.startsWith('/') ? undefined : '_blank'}
    rel="noopener noreferrer"
    class="mt-4 inline-flex items-center gap-2 bg-brand-purple text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-purple-800 transition-colors"
    data-resource-id={id}
  >
    View Resource
  </a>
</div>

<script define:vars={{page, id, url}}>
  // Error logging for broken links
  document.querySelectorAll('[data-resource-id]').forEach(link => {
    link.addEventListener('error', () => {
      console.error('[Broken Link Detected]', {
        event_type: 'broken_link_detected',
        page: page,
        resource_id: id,
        resource_url: url,
        timestamp: new Date().toISOString(),
      });
    });
  });
</script>
```

### Example: Filter Button with Keyboard Navigation
```astro
<div role="group" aria-label="Filter by age group" class="flex flex-wrap gap-1.5">
  {ageGroups.map((group) => (
    <button
      type="button"
      data-age={group === 'All Ages' ? 'all' : group}
      class="filter-btn age-filter px-3 py-2 rounded-full text-xs font-medium border transition-colors focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
      aria-label={`Filter by age group: ${group}`}
      aria-pressed={group === 'All Ages' ? 'true' : 'false'}
    >
      {group}
    </button>
  ))}
</div>

<script>
  // Keyboard navigation
  document.querySelectorAll('[role="group"]').forEach(group => {
    const buttons = Array.from(group.querySelectorAll('button'));
    
    buttons.forEach((btn, idx) => {
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && idx > 0) {
          e.preventDefault();
          buttons[idx - 1].focus();
        } else if (e.key === 'ArrowRight' && idx < buttons.length - 1) {
          e.preventDefault();
          buttons[idx + 1].focus();
        } else if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  });
</script>
```

---

**Plan Created**: 2026-04-10  
**Status**: Ready for Implementation  
**Next Phase**: Atomic tasks definition and developer assignment
