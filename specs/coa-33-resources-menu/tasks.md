# Tasks: COA-33 — Resources Menu & Pages

**Spec**: [COA-33 Spec](./spec.md)  
**Plan**: [COA-33 Plan](./plan.md)  
**Strategy**: Option C Execution Windows (GSD-aligned, isolated contexts)  
**Total Windows**: 7  
**Estimated Tokens**: 280–350k tokens (across all windows)

---

## Format Guide

- **[P]**: Task can run in parallel (different files, same window)
- **Window N**: Fresh 200k context per window execution
- **WINDOW_CHECKPOINT**: Validation gate before proceeding to next window
- **Traceability**: Each task traces back to spec (US-X, AC-X)
- **Dependency**: What prior work must be done first

---

## Execution Window 1: Infrastructure & Types

**Purpose**: Set up types, utilities, logging, and data structure  
**Token Budget**: 60–80k  
**Duration**: ~45 minutes  
**Checkpoint Validation**:
- [ ] All TypeScript types compile without errors
- [ ] Logger utilities can be imported in other files
- [ ] Filter utilities are pure functions (testable)
- [ ] Data files are valid JSON with no syntax errors
- [ ] No console warnings on import

---

### T001 [P] Create TypeScript types file

**Window**: 1 (Infrastructure)  
**Phase**: Types  
**Traceability**: Plan Phase 1.1, US-3, US-5  
**Dependencies**: None  
**Description**: Create `/src/lib/resources/types.ts` with Resource, FilterEvent, BrokenLinkEvent interfaces

**What to create**:
- File: `/src/lib/resources/types.ts`
- Export interfaces:
  - `Resource`: id, title, description, category, ageGroup, type ('pdf'|'link'|'video'|'document'), url, imageUrl?, dateAdded
  - `FilterEvent`: event_type ('filter_applied'|'filter_removed'), page, filter_category ('category'|'ageGroup'), filter_value, timestamp, session_id?
  - `BrokenLinkEvent`: event_type ('broken_link_detected'), page, resource_id, resource_url, http_status?, error_type?, timestamp, session_id?
  - Type union: `ResourcePage = 'coaching_resources' | 'player_resources'`

**Test**: 
```bash
npx tsc --noEmit src/lib/resources/types.ts
# Must pass with no errors
```

**Files Modified/Created**:
- `/src/lib/resources/types.ts` (NEW)

---

### T002 [P] Create logger utilities

**Window**: 1 (Infrastructure)  
**Phase**: Logging  
**Traceability**: Plan Phase 1.2, US-3 (logging)  
**Dependencies**: T001 (types must exist)  
**Description**: Create `/src/lib/resources/logger.ts` with logging functions

**What to create**:
- File: `/src/lib/resources/logger.ts`
- Export functions:
  - `getSessionId(): string` — Generate/retrieve anonymous session ID from localStorage, return 'server' if undefined (server render)
  - `logFilterEvent(event: FilterEvent): void` — Log to console.log with '[Filter Event]' prefix; TODO comment for telemetry service
  - `logBrokenLink(event: BrokenLinkEvent): void` — Log to console.error with '[Broken Link Detected]' prefix
  - `generateSessionId(): string` — Helper: generate unique session ID format `'sess_' + random()`
- All functions handle `typeof window === 'undefined'` gracefully

**Test**:
```bash
# In browser console, test:
# > import { getSessionId, logFilterEvent } from './logger'
# > logFilterEvent({ ... }) should print to console
# > localStorage should contain phoenix_session_id
```

**Files Modified/Created**:
- `/src/lib/resources/logger.ts` (NEW)

---

### T003 [P] Create filter logic utilities

**Window**: 1 (Infrastructure)  
**Phase**: Filter Utilities  
**Traceability**: Plan Phase 1.3, US-3  
**Dependencies**: T001 (types required)  
**Description**: Create `/src/lib/resources/filters.ts` with pure filter functions

**What to create**:
- File: `/src/lib/resources/filters.ts`
- Export functions:
  - `filterResources(resources: Resource[], activeFilters: Record<string, string>): Resource[]` — Return resources matching ALL active filters (AND logic)
    - If `activeFilters.ageGroup === 'all'`, ignore age filter
    - If `activeFilters.category === 'all'`, ignore category filter
    - Both must match (AND logic)
  - `getAvailableAgeGroups(resources: Resource[]): string[]` — Extract unique ageGroup values, sort, prepend 'All Ages'
  - `getAvailableCategories(resources: Resource[], audience: 'coaching' | 'player'): string[]` — Return categories appropriate to audience, sort, prepend 'All Categories'
    - Coaching: Defence, Offence, Drills, Fundamentals, Game Plans, Tools
    - Player: Nutrition, Mental Skills, Drills, Rules, Development

**Test**:
```typescript
// Unit tests in memory (validate logic):
const mockResources = [
  { id: '1', ageGroup: 'U12', category: 'Defence', ... },
  { id: '2', ageGroup: 'U14', category: 'Offence', ... }
];
const filtered = filterResources(mockResources, { ageGroup: 'U12', category: 'Defence' });
// Should return only resource 1
```

**Files Modified/Created**:
- `/src/lib/resources/filters.ts` (NEW)

---

### T004 [P] Create coaching resources data file

**Window**: 1 (Infrastructure)  
**Phase**: Data  
**Traceability**: Plan Phase 1.4, US-3  
**Dependencies**: T001 (types define structure)  
**Description**: Create `/src/data/coaching-resources.json` with coaching resource list

**What to create**:
- File: `/src/data/coaching-resources.json`
- Array of Resource objects, minimum 10 items, covering:
  - At least 3 different age groups (U12, U14, U16, Senior)
  - At least 5 different categories (Defence, Offence, Drills, Fundamentals, Game Plans, Tools)
  - Mix of types: pdf, link, video, document
  - Sample structure:
    ```json
    [
      {
        "id": "coaching-001",
        "title": "Defensive Positioning for U12",
        "description": "Guide to teaching defensive stance and positioning",
        "category": "Defence",
        "ageGroup": "U12",
        "type": "pdf",
        "url": "/resources/coaching-defensive-u12.pdf",
        "imageUrl": "/images/resources/defence.jpg",
        "dateAdded": "2026-03-15"
      }
    ]
    ```

**Test**:
```bash
# Validate JSON syntax
npx jsonlint src/data/coaching-resources.json
# Should pass without errors
```

**Files Modified/Created**:
- `/src/data/coaching-resources.json` (NEW)

---

### T005 [P] Create player resources data file

**Window**: 1 (Infrastructure)  
**Phase**: Data  
**Traceability**: Plan Phase 1.4, US-2  
**Dependencies**: T001 (types define structure)  
**Description**: Create `/src/data/player-resources.json` with player resource list

**What to create**:
- File: `/src/data/player-resources.json`
- Array of Resource objects, minimum 10 items, covering:
  - At least 4 different age groups (U8, U10, U12, U14, U16, U18, Senior)
  - At least 5 different categories (Nutrition, Mental Skills, Drills, Rules, Development)
  - Mix of types: pdf, link, video, document
  - Sample structure:
    ```json
    [
      {
        "id": "player-001",
        "title": "Nutrition for Young Athletes",
        "description": "Healthy eating guide for junior basketball players",
        "category": "Nutrition",
        "ageGroup": "U12",
        "type": "document",
        "url": "/resources/nutrition-guide.pdf",
        "imageUrl": "/images/resources/nutrition.jpg",
        "dateAdded": "2026-03-10"
      }
    ]
    ```

**Test**:
```bash
# Validate JSON syntax
npx jsonlint src/data/player-resources.json
# Should pass without errors
```

**Files Modified/Created**:
- `/src/data/player-resources.json` (NEW)

---

[WINDOW_CHECKPOINT_1]

**Before proceeding to Window 2**:
- [ ] `npx tsc --noEmit src/lib/resources/types.ts` — passes with 0 errors
- [ ] `npx jsonlint src/data/coaching-resources.json` — valid JSON
- [ ] `npx jsonlint src/data/player-resources.json` — valid JSON
- [ ] Logger functions can be imported: `import { logFilterEvent } from 'src/lib/resources/logger'` with no errors
- [ ] Filter functions can be imported: `import { filterResources } from 'src/lib/resources/filters'` with no errors

**If all checkpoints pass**: Infrastructure is ready for feature pages  
**If any checkpoint fails**: Debug and fix in Window 1, do NOT proceed

---

## Execution Window 2: Navbar & Landing Page (Part A)

**Purpose**: Wire navigation and create `/resources` landing page  
**Token Budget**: 70–90k  
**Duration**: ~60 minutes  
**Checkpoint Validation**:
- [ ] Navbar links updated to `/resources/*`
- [ ] Landing page renders at `/resources`
- [ ] Navigation dropdown has two functional buttons
- [ ] No console errors on page load
- [ ] AC-1 through AC-3 (User Story 1-2) verified

---

### T006 Update Navbar with new routes

**Window**: 2 (Navigation)  
**Phase**: Navigation  
**Traceability**: US-1, AC-1  
**Dependencies**: T001–T005 (infrastructure ready)  
**Description**: Modify `/src/components/Navbar.astro` to route Resources menu to `/resources`, coaching to `/resources/coaching`, player to `/resources/players`

**What to modify**:
- File: `/src/components/Navbar.astro`
- Locate the Resources dropdown/menu section
- Change links:
  - Old: `/coaching-resources` → New: `/resources/coaching`
  - Old: `/player-resources` → New: `/resources/players`
  - New: Add link to `/resources` landing page (optional, may redirect from main Resources click)
- Update `currentPath.includes('resources')` check to match new nested routes (or keep as is, should still work)
- Verify no console errors, styling intact

**Test**:
```bash
# Visual inspection in dev server:
# > npm run dev
# > Navigate to site, click Resources menu
# > Desktop: Dropdown shows two options with updated links
# > Mobile: Menu shows Resources section with two options
# > No console errors in DevTools
```

**Files Modified/Created**:
- `/src/components/Navbar.astro` (MODIFIED)

---

### T007 Create Resources landing page

**Window**: 2 (Navigation)  
**Phase**: Pages  
**Traceability**: US-1, AC-2 & AC-4  
**Dependencies**: T006 (navbar ready with `/resources` link)  
**Description**: Create `/src/pages/resources/index.astro` with landing page showing two options: Coaching and Player Resources

**What to create**:
- File: `/src/pages/resources/index.astro`
- Structure:
  - Wraps with `BaseLayout` (includes Navbar + Footer)
  - Page title: "Resources"
  - Hero section:
    - Brand-purple background (`bg-brand-purple`)
    - White or off-white text
    - Heading: "Phoenix Resources"
    - Subheading: "Choose your path" (or similar)
    - Optional gold accent bar (border-bottom, stripe)
  - Two clickable buttons/cards (side-by-side on desktop, stacked on mobile):
    - **Coaching Resources** button:
      - Href: `/resources/coaching`
      - Icon/visual: whistle emoji or coaching-themed SVG
      - Text: "Coaching Resources"
      - Subtitle: "For coaches and volunteers"
      - Styling: Gold accent, rounded corners, hover state
    - **Player Resources** button:
      - Href: `/resources/players`
      - Icon/visual: player emoji or basketball SVG
      - Text: "Player Resources"
      - Subtitle: "For players and families"
      - Styling: Gold accent, rounded corners, hover state
  - Optional breadcrumb: "Home > Resources"
  - Responsive: Tailwind grid/flex responsive classes (e.g., `grid-cols-1 md:grid-cols-2`)

**Test**:
```bash
# In dev server:
# > npm run dev
# > Navigate to http://localhost:3000/resources (or equivalent)
# > Page renders with title, hero, two buttons
# > Click "Coaching Resources" → navigates to /resources/coaching (will 404 until T008/T009 created)
# > Click "Player Resources" → navigates to /resources/players (will 404 until T010/T011 created)
# > Mobile view: buttons stack vertically
# > No console errors
```

**Files Modified/Created**:
- `/src/pages/resources/index.astro` (NEW)

---

### T008 Verify navbar active state on Resources routes

**Window**: 2 (Navigation)  
**Phase**: Navigation  
**Traceability**: US-1 (User discovers Resources)  
**Dependencies**: T006, T007 (navbar and landing page created)  
**Description**: Ensure navbar correctly highlights Resources menu item when on `/resources*` pages

**What to verify**:
- File: `/src/components/Navbar.astro`
- Locate the active-state logic (likely `currentPath.includes('resources')`)
- Test scenarios:
  - On `/resources` → Resources menu item highlighted
  - On `/resources/coaching` → Resources menu item highlighted
  - On `/resources/players` → Resources menu item highlighted
  - On other pages (e.g., `/`) → Resources menu item NOT highlighted
- Desktop dropdown visual state (color, underline)
- Mobile menu visual state

**Test**:
```bash
# Manual testing in dev server:
# > npm run dev
# > Navigate to /resources → check navbar
# > Navigate to /resources/coaching → check navbar
# > Navigate to /resources/players → check navbar
# > Verify highlight is consistent
# > No console errors
```

**Files Modified/Created**:
- None (verification only, may require minor navbar adjustments in T006)

---

[WINDOW_CHECKPOINT_2]

**Before proceeding to Window 3**:
- [ ] Navbar links updated to `/resources/*` routes (T006)
- [ ] `/resources/index.astro` renders without errors (T007)
- [ ] Clicking landing page buttons navigates to intended routes (T007)
- [ ] Navbar active state highlights Resources on all `/resources*` pages (T008)
- [ ] No console errors when navigating between pages
- [ ] US-1 & US-2 navigation acceptance criteria passing (AC-1, AC-2, AC-4)

**If all checkpoints pass**: Navigation and landing page complete, ready for resource pages  
**If any checkpoint fails**: Debug in Window 2, do NOT proceed to Window 3

---

## Execution Window 3: Coaching Resources Page (Part B)

**Purpose**: Create `/resources/coaching` page with filters, keyboard navigation, and logging  
**Token Budget**: 90–110k  
**Duration**: ~90 minutes  
**Checkpoint Validation**:
- [ ] Page renders at `/resources/coaching`
- [ ] All resources from data file display
- [ ] Filters toggle on/off (visual feedback)
- [ ] Multiple filters can be combined
- [ ] Keyboard navigation works (Tab, arrows, Enter/Space)
- [ ] Focus is visible (gold border)
- [ ] No console errors
- [ ] US-3 & US-5 acceptance criteria verified

---

### T009 Create Coaching Resources page structure

**Window**: 3 (Coaching Page)  
**Phase**: Pages  
**Traceability**: US-3, AC-5 (page structure)  
**Dependencies**: T004 (coaching resources data ready), T001–T002 (types, logger ready)  
**Description**: Create `/src/pages/resources/coaching.astro` with hero, filter bar, resource grid, and no-results message

**What to create**:
- File: `/src/pages/resources/coaching.astro`
- Frontmatter (Astro script):
  - Import coaching resources from `/src/data/coaching-resources.json`
  - Import `filterResources`, `getAvailableAgeGroups`, `getAvailableCategories` from `/src/lib/resources/filters`
  - Calculate available filters from data
- Structure:
  - Wrapped with `BaseLayout` (Navbar + Footer)
  - Page title: "Coaching Resources"
  - Hero section:
    - Brand-purple background
    - White text
    - Heading: "Coaching Resources"
    - Subheading: "Tools and guides for coaches and volunteers"
    - Optional gold accent bar
  - Filter bar (see T010):
    - Age group buttons (All Ages, U12, U14, U16, Senior)
    - Category buttons (All Categories, Defence, Offence, Drills, Fundamentals, Game Plans, Tools)
    - "Clear Filters" button
  - Resources grid:
    - 3 columns on desktop (1024px+), 2 on tablet (768px), 1 on mobile (320px)
    - Uses `ResourceCard` component for each resource
    - Set initial display: all resources visible
  - No-results message:
    - Hidden initially
    - Shows when filters result in zero matches
    - Text: "No resources match your current filters."
    - Includes "Clear filters" button
  - CTA section (optional):
    - "Want to contribute resources? Contact us"

**Test**:
```bash
# In dev server:
# > npm run dev
# > Navigate to /resources/coaching
# > Page renders with title, hero, filter bar, all resources visible
# > Filter bar displays correctly (buttons, styling)
# > Resources grid shows in 3 columns (desktop) or 1 column (mobile)
# > No console errors
```

**Files Modified/Created**:
- `/src/pages/resources/coaching.astro` (NEW)

---

### T010 Implement filter logic (show/hide resources)

**Window**: 3 (Coaching Page)  
**Phase**: Filter Logic  
**Traceability**: US-3, AC-6 (filters toggle and update display)  
**Dependencies**: T009 (page structure ready)  
**Description**: Add client-side script to coaching page that handles filter button clicks, updates active state, filters resources, and shows/hides cards

**What to implement**:
- File: `/src/pages/resources/coaching.astro` (add `<script>` section)
- State management (vanilla JavaScript):
  - `let activeAgeGroup = 'all'`
  - `let activeCategory = 'all'`
- Click event listeners on filter buttons:
  - On age filter button click: set `activeAgeGroup` to button's `data-age` value, call `applyFilters()`
  - On category filter button click: set `activeCategory` to button's `data-category` value, call `applyFilters()`
  - On "Clear Filters" button click: reset both to 'all', call `applyFilters()`
- `applyFilters()` function:
  - Iterate over all resource cards (select by `data-category` and `data-age`)
  - Show card if `card.dataset.age === 'all' || card.dataset.age === activeAgeGroup` AND `card.dataset.category === 'all' || card.dataset.category === activeCategory`
  - Hide card otherwise (set `style.display = 'none'`)
  - Update button visual states:
    - Active button: `bg-brand-purple text-white` (age) or `bg-brand-gold text-white` (category)
    - Inactive button: `bg-white text-brand-purple/gold border border-brand-purple/gold`
  - Show/hide no-results message based on visible card count
- Test multiple filter combinations (AND logic)

**Test**:
```bash
# In dev server:
# > npm run dev → /resources/coaching
# > Click "Defence" → only Defence resources show, button fills with purple
# > Click "Defence" again → all resources show, button returns to outline
# > Click "U12" + "Defence" → only U12 + Defence resources show
# > Click filter combination with zero matches → "No results" message shows
# > Click "Clear Filters" → all resources show, all buttons outline
# > No console errors
```

**Files Modified/Created**:
- `/src/pages/resources/coaching.astro` (MODIFIED, adds script)

---

### T011 Implement keyboard navigation for filter buttons

**Window**: 3 (Coaching Page)  
**Phase**: Keyboard Navigation  
**Traceability**: US-5, AC-11 (keyboard navigation)  
**Dependencies**: T010 (filter logic ready)  
**Description**: Add keyboard event listeners to filter buttons for Tab, arrow keys, Enter/Space navigation

**What to implement**:
- File: `/src/pages/resources/coaching.astro` (add/extend `<script>` section)
- Add to filter bar:
  - `role="group"` and `aria-label="Filter resources by age group"` on age filter container
  - `role="group"` and `aria-label="Filter resources by category"` on category filter container
  - Each button: `aria-label="Filter by age group: {ageGroup}"` (or equivalent)
  - Each button: `aria-pressed="true"` if active, `aria-pressed="false"` if inactive
  - Each button: `role="button"` (if not semantic `<button>` element, which is preferred)
- Add focus styles to CSS/Tailwind:
  - Focus indicator: 3px gold border, gold ring offset
  - Example: `focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2`
- Add keyboard event listeners:
  - For age filter group:
    - Tab focuses buttons in order (browser default)
    - ArrowLeft: Move focus to previous button (if not at start)
    - ArrowRight: Move focus to next button (if not at end)
    - Enter/Space: Click focused button (toggle filter)
  - For category filter group: Same logic
  - Skip arrow navigation across group boundaries (stop at group end)
- Update `aria-pressed` on each filter toggle

**Test**:
```bash
# Keyboard-only testing (no mouse):
# > npm run dev → /resources/coaching
# > Tab to age filter group → focus visible on first button
# > ArrowRight → focus moves to next age button
# > ArrowLeft → focus moves to previous age button
# > Space → toggle filter, button updates aria-pressed, resources re-filter
# > Tab → move to category filter group
# > Repeat arrow tests on category group
# > Tab to "Clear Filters" button → button focusable
# > Enter on Clear Filters → all filters reset
# > No console errors
# > No keyboard traps
```

**Files Modified/Created**:
- `/src/pages/resources/coaching.astro` (MODIFIED, adds keyboard listeners)

---

### T012 Add filter event logging

**Window**: 3 (Coaching Page)  
**Phase**: Logging  
**Traceability**: US-3, Plan Phase 3.4 (filter logging)  
**Dependencies**: T002 (logger ready), T010 (filter logic ready)  
**Description**: Import logger and log filter events when buttons are clicked

**What to implement**:
- File: `/src/pages/resources/coaching.astro` (modify script)
- Add import: `import { logFilterEvent, getSessionId } from '/src/lib/resources/logger'`
- In `applyFilters()` function (or click handlers):
  - When a filter is applied (button becomes active):
    ```typescript
    logFilterEvent({
      event_type: 'filter_applied',
      page: 'coaching_resources',
      filter_category: 'category', // or 'ageGroup'
      filter_value: 'Defence', // the selected value
      timestamp: new Date().toISOString(),
      session_id: getSessionId(),
    });
    ```
  - When a filter is removed (button becomes inactive):
    ```typescript
    logFilterEvent({
      event_type: 'filter_removed',
      page: 'coaching_resources',
      filter_category: 'category',
      filter_value: 'Defence',
      timestamp: new Date().toISOString(),
      session_id: getSessionId(),
    });
    ```
- When "Clear Filters" is clicked:
  - Log two separate `filter_removed` events (one for age, one for category)
  - Or log a single event with `event_type: 'clear_filters'` (custom, optional)

**Test**:
```bash
# In dev server with console open:
# > npm run dev → /resources/coaching
# > Click "Defence" filter
# > Console should show: [Filter Event] { event_type: 'filter_applied', page: 'coaching_resources', ... }
# > Click "Defence" again
# > Console should show: [Filter Event] { event_type: 'filter_removed', ... }
# > Verify timestamp and session_id are present
```

**Files Modified/Created**:
- `/src/pages/resources/coaching.astro` (MODIFIED, adds logging)

---

### T013 Mobile optimization: filter bar and grid layout

**Window**: 3 (Coaching Page)  
**Phase**: Mobile  
**Traceability**: Plan Phase 3.6 (mobile optimization), AC-9 (mobile layout)  
**Dependencies**: T009 (page structure ready)  
**Description**: Apply Tailwind responsive classes to ensure filter bar and grid layout wrap gracefully on mobile (320px), with 44x44px minimum button targets and no horizontal overflow

**What to implement**:
- File: `/src/pages/resources/coaching.astro` (modify HTML)
- Filter bar container:
  - `flex flex-wrap gap-1.5` (6px gap between buttons)
  - `sticky top-16 z-40` (below navbar, stays visible)
  - `bg-white padding` (white background, padding for visual separation)
- Filter buttons:
  - `px-3 py-2` (12px horizontal, 8px vertical = ~44px height when combined with text)
  - `text-xs font-medium` (small text to fit on mobile)
  - `rounded-full` (pill shape)
  - `border` for outline state
  - Verify minimum touch target in DevTools (44x44px)
- Resources grid:
  - `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` (1 col mobile, 2 tablet, 3 desktop)
  - No horizontal overflow
- No-results message:
  - Responsive text size: `text-sm md:text-base`
  - Button styling consistent with filter buttons

**Test**:
```bash
# Mobile testing in DevTools:
# > npm run dev → /resources/coaching
# > Chrome DevTools: Set viewport to 320px (mobile)
# > Filter buttons wrap to multiple rows without overflow
# > Use DevTools Inspect: measure button (should be ≥44x44px)
# > Resource cards display 1 per row, fully visible
# > Filter bar sticky while scrolling
# > Tablet (768px): 2 columns, filters may wrap
# > Desktop (1024px+): 3 columns, filters on one row
# > No horizontal scrolling at any breakpoint
```

**Files Modified/Created**:
- `/src/pages/resources/coaching.astro` (MODIFIED, adds responsive classes)

---

### T014 Enhance ResourceCard component with link error handling

**Window**: 3 (Coaching Page)  
**Phase**: Components  
**Traceability**: Plan Phase 3.5 (broken link detection), US-3 (resource links work)  
**Dependencies**: T002 (logger ready)  
**Description**: Modify `/src/components/ResourceCard.astro` to add error handling for broken links and log broken link events

**What to modify**:
- File: `/src/components/ResourceCard.astro`
- Ensure component receives props: `id`, `title`, `description`, `category`, `ageGroup`, `type`, `url`, `page` ('coaching_resources'|'player_resources')
- In resource card HTML:
  - Add `data-id={id}` to card container for JavaScript selection
  - Add `data-category={category}` and `data-age={ageGroup}` (used by filter logic in T010)
  - Link button: `target={url.startsWith('/') ? undefined : '_blank'}` (internal in same tab, external in new tab)
  - Link button: `rel="noopener noreferrer"` for external links
- In `<script>` section:
  - Add error listener on link:
    ```typescript
    document.querySelectorAll('a[data-resource-url]').forEach(link => {
      link.addEventListener('error', () => {
        logBrokenLink({
          event_type: 'broken_link_detected',
          page: page,
          resource_id: id,
          resource_url: url,
          timestamp: new Date().toISOString(),
          session_id: getSessionId(),
        });
      });
    });
    ```
  - Optional: Add click listener with HEAD fetch to validate link (lightweight, non-blocking)

**Test**:
```bash
# Test with real resource:
# > npm run dev → /resources/coaching
# > Click a resource link
# > If link is valid, opens in new tab (external) or same tab (internal)
# > Check console: should see either no error or '[Broken Link Detected]' if 404
```

**Files Modified/Created**:
- `/src/components/ResourceCard.astro` (MODIFIED, adds error handling)

---

[WINDOW_CHECKPOINT_3]

**Before proceeding to Window 4**:
- [ ] `/resources/coaching` renders without console errors (T009)
- [ ] All coaching resources display in grid (T009)
- [ ] Filter buttons toggle on/off (visual feedback) (T010)
- [ ] Multiple filters can be combined (AND logic) (T010)
- [ ] "No results" message shows when zero matches (T010)
- [ ] Keyboard navigation works: Tab, arrows, Enter/Space (T011)
- [ ] Focus is visible with gold border (T011)
- [ ] Filter events logged to console (T012)
- [ ] Mobile layout wraps without horizontal overflow (T013)
- [ ] Button touch targets are 44x44px minimum (T013)
- [ ] Filter bar sticky while scrolling (T013)
- [ ] ResourceCard component receives and uses all props (T014)
- [ ] US-3 & US-5 acceptance criteria verified
- [ ] No console errors or warnings

**If all checkpoints pass**: Part B (Coaching Resources) complete, ready for Part C  
**If any checkpoint fails**: Debug in Window 3, do NOT proceed to Window 4

---

## Execution Window 4: Player Resources Page (Part C)

**Purpose**: Create `/resources/players` page (mirror of Part B with player-specific data and messaging)  
**Token Budget**: 85–105k  
**Duration**: ~90 minutes  
**Checkpoint Validation**:
- [ ] Page renders at `/resources/players`
- [ ] All resources from player data file display
- [ ] Filters, keyboard navigation, logging work (same as Part B)
- [ ] No console errors
- [ ] US-2 & US-5 acceptance criteria verified
- [ ] Both pages (coaching & player) can coexist without conflicts

---

### T015 Create Player Resources page structure

**Window**: 4 (Player Page)  
**Phase**: Pages  
**Traceability**: US-2, AC-1 (player page structure)  
**Dependencies**: T005 (player resources data ready), T009 (coaching page structure as reference)  
**Description**: Create `/src/pages/resources/players.astro` with structure identical to coaching page but with player-specific data, messaging, and categories

**What to create**:
- File: `/src/pages/resources/players.astro`
- Frontmatter:
  - Import player resources from `/src/data/player-resources.json`
  - Import filter utilities
  - Calculate available filters (age groups, player-specific categories)
- Structure (identical to coaching page):
  - BaseLayout, page title "Player Resources"
  - Hero section with player-specific messaging: "Resources for players and families"
  - Filter bar with:
    - Age groups (derived from data: U8, U10, U12, U14, U16, U18, Senior)
    - Player-specific categories: All Categories, Nutrition, Mental Skills, Drills, Rules, Development
  - Resources grid (3 cols desktop, 2 tablet, 1 mobile)
  - No-results message
  - CTA section (e.g., "Have suggestions? Contact us")
- Responsive classes identical to T009/T013

**Test**:
```bash
# In dev server:
# > npm run dev → /resources/players
# > Page renders with title, hero, filter bar, all resources visible
# > Filter buttons show player-specific categories (Nutrition, Mental Skills, etc.)
# > Grid displays in 3 columns (desktop) or 1 column (mobile)
# > No console errors
```

**Files Modified/Created**:
- `/src/pages/resources/players.astro` (NEW)

---

### T016 Implement filter logic for Player Resources page

**Window**: 4 (Player Page)  
**Phase**: Filter Logic  
**Traceability**: US-2, AC-1 (filters work)  
**Dependencies**: T015 (page structure ready)  
**Description**: Add client-side filter script to player page (logic identical to T010, but for `page: 'player_resources'`)

**What to implement**:
- File: `/src/pages/resources/players.astro` (add `<script>` section)
- State management: `activeAgeGroup = 'all'`, `activeCategory = 'all'`
- Click listeners on filter buttons (identical to T010)
- `applyFilters()` function (identical logic, different page context)
- Button state updates (same visual feedback)
- Show/hide no-results message

**Test**:
```bash
# In dev server:
# > npm run dev → /resources/players
# > Click "Nutrition" → only Nutrition resources show
# > Click "U12" + "Mental Skills" → filtered results show
# > Click combination with zero matches → "No results" shows
# > Click "Clear Filters" → all resources show
```

**Files Modified/Created**:
- `/src/pages/resources/players.astro` (MODIFIED, adds script)

---

### T017 Implement keyboard navigation for Player Resources page

**Window**: 4 (Player Page)  
**Phase**: Keyboard Navigation  
**Traceability**: US-5 (keyboard navigation for all resource pages)  
**Dependencies**: T016 (filter logic ready)  
**Description**: Add keyboard event listeners to player page filter buttons (logic identical to T011, page context `player_resources`)

**What to implement**:
- File: `/src/pages/resources/players.astro` (add/extend `<script>` section)
- Add ARIA roles/labels:
  - `role="group"` on filter containers
  - `aria-label` on containers and buttons
  - `aria-pressed` on buttons
- Add focus styles (same 3px gold border, ring offset)
- Add keyboard listeners:
  - Tab navigation (browser default)
  - ArrowLeft/Right within groups
  - Enter/Space to toggle filter
- Update `aria-pressed` on toggle

**Test**:
```bash
# Keyboard-only testing:
# > npm run dev → /resources/players
# > Tab to filter group → focus visible
# > ArrowRight → move focus to next button
# > Space → toggle filter
# > Tab to next group
# > Repeat arrow tests
# > No keyboard traps, logical tab order
```

**Files Modified/Created**:
- `/src/pages/resources/players.astro` (MODIFIED, adds keyboard listeners)

---

### T018 Add filter event logging for Player Resources page

**Window**: 4 (Player Page)  
**Phase**: Logging  
**Traceability**: US-2, Plan Phase 4.2 (logging identifies page)  
**Dependencies**: T002 (logger ready), T016 (filter logic ready)  
**Description**: Import logger and log filter events (with `page: 'player_resources'`)

**What to implement**:
- File: `/src/pages/resources/players.astro` (modify script)
- Import logger: `import { logFilterEvent, getSessionId } from '/src/lib/resources/logger'`
- In filter click handlers:
  - Log `filter_applied` and `filter_removed` events
  - Set `page: 'player_resources'` (different from Part B)
  - Include all event metadata (category, value, timestamp, session_id)

**Test**:
```bash
# In dev server with console open:
# > npm run dev → /resources/players
# > Click "Nutrition" filter
# > Console: [Filter Event] { page: 'player_resources', ... }
# > Verify page context is correct
```

**Files Modified/Created**:
- `/src/pages/resources/players.astro` (MODIFIED, adds logging)

---

### T019 Mobile optimization for Player Resources page

**Window**: 4 (Player Page)  
**Phase**: Mobile  
**Traceability**: Plan Phase 4.3 (mobile optimization)  
**Dependencies**: T015 (page structure ready)  
**Description**: Apply responsive Tailwind classes (identical to T013) to ensure mobile layout wraps gracefully

**What to implement**:
- File: `/src/pages/resources/players.astro` (modify HTML)
- Filter bar: `flex flex-wrap gap-1.5`, `sticky top-16 z-40`
- Buttons: `px-3 py-2`, `text-xs font-medium`, `rounded-full`
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- No-results message: responsive text sizing

**Test**:
```bash
# Mobile testing:
# > npm run dev → /resources/players
# > Set DevTools viewport to 320px
# > Filter buttons wrap without overflow
# > Grid 1 column on mobile, 2 on tablet, 3 on desktop
# > Touch targets 44x44px minimum
# > Filter bar sticky
```

**Files Modified/Created**:
- `/src/pages/resources/players.astro` (MODIFIED, adds responsive classes)

---

[WINDOW_CHECKPOINT_4]

**Before proceeding to Window 5**:
- [ ] `/resources/players` renders without console errors (T015)
- [ ] All player resources display in grid (T015)
- [ ] Filter buttons toggle on/off (visual feedback) (T016)
- [ ] Multiple filters work (AND logic) (T016)
- [ ] "No results" message shows correctly (T016)
- [ ] Keyboard navigation works (T017)
- [ ] Focus is visible (T017)
- [ ] Filter events logged with `page: 'player_resources'` (T018)
- [ ] Mobile layout optimized (T019)
- [ ] Button targets 44x44px (T019)
- [ ] Both coaching and player pages can coexist without conflicts
- [ ] US-2 & US-5 acceptance criteria verified (player audience)
- [ ] No console errors or warnings

**If all checkpoints pass**: Part C (Player Resources) complete, both parts functional  
**If any checkpoint fails**: Debug in Window 4, do NOT proceed to Window 5

---

## Execution Window 5: Accessibility Audit & Keyboard Testing

**Purpose**: Comprehensive accessibility testing (WCAG 2.1 AA) and keyboard-only validation  
**Token Budget**: 60–80k  
**Duration**: ~75 minutes  
**Checkpoint Validation**:
- [ ] WAVE/Axe scan: 0 errors or only pre-approved alerts
- [ ] Color contrast 4.5:1 for text, 3:1 for graphics
- [ ] Keyboard-only navigation: all features accessible
- [ ] Screen reader testing: elements announced correctly
- [ ] No focus traps or missing focus indicators
- [ ] Both pages pass accessibility audit

---

### T020 Run automated accessibility scans (WAVE, Axe)

**Window**: 5 (Accessibility)  
**Phase**: Testing  
**Traceability**: Plan Phase 5.4 (accessibility audit)  
**Dependencies**: T014, T019 (both pages complete)  
**Description**: Use browser DevTools extensions (WAVE, Axe DevTools) to scan coaching and player pages for WCAG violations

**What to test**:
- Tool: WAVE WebAIM (browser extension) or Axe DevTools
- Pages:
  - `/resources/coaching`
  - `/resources/players`
- Scan for:
  - Missing alt text on images
  - Color contrast violations
  - Missing labels on form/interactive elements
  - Missing ARIA roles/attributes
  - Structural errors (heading hierarchy, etc.)
  - Empty links/buttons
  - Redundant alt text

**Test**:
```bash
# Using Axe DevTools (Chrome):
# > npm run dev → /resources/coaching
# > Open Axe DevTools panel (DevTools > Axe DevTools)
# > Run scan
# > Review: 0 violations, any alerts are reviewed and approved
# > Repeat for /resources/players
# > Document any pre-approved alerts (e.g., vendor issues)
```

**Expected Output**:
- Report of violations (should be 0) and alerts (reviewed and acceptable)
- Screenshot or CSV export of results

**Files Modified/Created**:
- `/accessibility-audit-results.md` (NEW, summary of scan results)

---

### T021 Verify color contrast (4.5:1 text, 3:1 graphics)

**Window**: 5 (Accessibility)  
**Phase**: Testing  
**Traceability**: Plan Phase 5.4 (color contrast)  
**Dependencies**: T009, T015 (pages created with brand colors)  
**Description**: Check color contrast ratios for all text and interactive elements against backgrounds

**What to test**:
- Elements to check:
  - Active filter button: white text on brand-purple (#573F93) or brand-gold (#8B7536)
    - Expected: white (#FFFFFF) on purple = 7.9:1 (pass)
    - Expected: white (#FFFFFF) on gold = 4.6:1 (pass)
  - Inactive filter button: purple/gold text on white background
    - Expected: #573F93 on #FFFFFF = 6.2:1 (pass)
    - Expected: #8B7536 on #FFFFFF = 4.2:1 (pass)
  - Resource card text on white background
  - Hero section text on purple background
- Tool: WebAIM Contrast Checker or built-in DevTools
- Minimum thresholds:
  - Normal text: 4.5:1
  - Graphics: 3:1
  - Large text (18pt+): 3:1

**Test**:
```bash
# Using Chrome DevTools:
# > npm run dev → /resources/coaching
# > Open DevTools, Inspect active filter button
# > Check computed colors in Elements panel
# > Right-click button, select "Inspect"
# > Under Styles, note background-color and color
# > Use WebAIM: https://webaim.org/resources/contrastchecker/
# > Input colors and verify ratio ≥ 4.5:1
# > Repeat for all interactive elements and text
```

**Expected Output**:
- All contrast ratios ≥ 4.5:1 for text
- All contrast ratios ≥ 3:1 for graphics
- Report any exceptions

**Files Modified/Created**:
- (No code changes, verification only)

---

### T022 Keyboard-only navigation test (no mouse)

**Window**: 5 (Accessibility)  
**Phase**: Testing  
**Traceability**: US-5, AC-11 (keyboard navigation)  
**Dependencies**: T017 (keyboard listeners added to both pages)  
**Description**: Test all pages using only keyboard (no mouse/trackpad). Verify all features accessible, no traps, logical tab order.

**What to test**:
- Pages:
  - `/resources` (landing page)
  - `/resources/coaching`
  - `/resources/players`
- Navigation:
  - Tab to navbar → click Resources → should navigate to `/resources`
  - Tab to landing page buttons → Enter to select → navigate to resource pages
  - On resource page: Tab to filter buttons → arrow keys move focus → Enter toggles
  - Tab to "Clear Filters" button → Enter resets filters
  - Tab to resource links → Enter opens link (in same or new tab)
- Verify:
  - No keyboard traps (always able to Tab out)
  - Tab order is logical (left-to-right, top-to-bottom)
  - Focus is visible (gold outline)
  - All interactive elements reachable
  - Arrow keys work within filter groups (not across other elements)
  - Home/End keys (optional) work for filters

**Test Script**:
```bash
# Keyboard-only test:
# 1. Disconnect mouse/trackpad or use Dev Tools input simulation
# 2. npm run dev
# 3. Tab to Navbar → Resources should be focusable
# 4. Tab down to focus on Resources menu item
# 5. Enter → should navigate to /resources
# 6. On landing page:
#    - Tab to "Coaching Resources" button
#    - Verify focus is visible (gold border)
#    - Enter → navigate to /resources/coaching
# 7. On coaching page:
#    - Tab focuses first filter button (age group)
#    - ArrowRight → move to next age button
#    - ArrowLeft → move to previous age button
#    - Space → toggle filter
#    - Tab → move to category filter group (or next element)
#    - Repeat arrow tests on category group
# 8. Tab to "Clear Filters" button
#    - Enter → reset all filters
# 9. Tab to resource card link
#    - Enter → open link
# 10. Repeat steps on /resources/players
```

**Expected Output**:
- All features accessible without mouse
- No keyboard traps
- Tab order logical
- Focus always visible

**Files Modified/Created**:
- (No code changes, testing only)

---

### T023 Screen reader testing (NVDA/VoiceOver)

**Window**: 5 (Accessibility)  
**Phase**: Testing  
**Traceability**: Plan Phase 5.4 (screen reader testing)  
**Dependencies**: T009, T015 (pages with ARIA labels added in T011, T017)  
**Description**: Test pages with screen reader (NVDA on Windows, VoiceOver on macOS) to verify all elements are announced correctly

**What to test**:
- Screen reader: NVDA (Windows) or VoiceOver (macOS)
- Pages:
  - `/resources/coaching`
  - `/resources/players`
- Elements to verify:
  - Page heading ("Coaching Resources" / "Player Resources") announced
  - Filter container role and label: "group, Filter resources by age group"
  - Filter buttons: name, state (aria-pressed true/false)
    - Expected: "Defence button, pressed, false" or "Defence button, not pressed"
  - No-results message: announced when visible, uses aria-live="polite"
  - Resource cards: title, description, category, age group, link
  - CTA section: readable and understandable
- Listen for:
  - Proper heading hierarchy (h1, h2, not skipped levels)
  - Button roles announced
  - Filter state changes announced
  - Links have descriptive text (not just "Click here")
  - No redundant announcements (e.g., duplicate links)

**Test Script**:
```bash
# Screen reader test (NVDA on Windows):
# 1. npm run dev → /resources/coaching
# 2. Start NVDA (Windows key + Alt + N, or via Start menu)
# 3. Focus on page (click in browser window)
# 4. Press Ctrl+Home to go to start of page
# 5. Press D to jump to next heading → should announce "Coaching Resources" (h1)
# 6. Press H to jump to next heading → filter section heading
# 7. Press T to jump to next table/form → filter group
# 8. Arrow keys navigate through buttons → should announce:
#    - Button name: "Defence"
#    - Button state: "pressed, false" or "not pressed"
# 9. Press Space on button → toggle filter
#    - NVDA should announce: "pressed, true"
#    - Filtered resources should be announced
# 10. Press N for next button/navigation → "Clear Filters button"
# 11. Navigate through resource cards → verify all text announced
# 12. Repeat for /resources/players
```

**Expected Output**:
- All elements announced with correct names and states
- Button role and state changes announced
- No missing or redundant announcements
- Navigation logical and complete

**Files Modified/Created**:
- (No code changes, testing only)

---

### T024 Focus indicator visibility check

**Window**: 5 (Accessibility)  
**Phase**: Testing  
**Traceability**: Plan Phase 3.3 (focus state styling)  
**Dependencies**: T011, T017 (focus styles added)  
**Description**: Verify focus indicators are visible (3px gold border with sufficient contrast) on all interactive elements

**What to test**:
- Filter buttons: When Tab-focused, should show:
  - 3px gold border (#8B7536) OR
  - CSS ring: `ring-2 ring-brand-gold ring-offset-2`
  - Minimum 3:1 contrast (gold on white background = 4.2:1, acceptable)
  - Not hidden or invisible
- Clear Filters button: Same focus indicator
- Resource card links: Same focus indicator
- Navbar: Same focus indicator
- Landing page buttons: Same focus indicator
- Verify focus is not removed or hidden by:
  - `outline: none` without replacement
  - Opacity < 1
  - Color same as background
  - Browser's default focus ring (should be enhanced)

**Test**:
```bash
# Visual inspection:
# 1. npm run dev → /resources/coaching
# 2. Press Tab repeatedly → cycle through filter buttons
# 3. On each focus, verify:
#    - Gold border or ring is visible
#    - Border is at least 3px
#    - Text is readable (contrast ≥ 3:1 against background)
#    - Focus indicator is not hidden behind other elements
# 4. Inspect with DevTools:
#    - Focus on filter button
#    - Right-click → Inspect
#    - In Styles, look for :focus or :focus-visible rules
#    - Verify `outline` or `ring` classes present
# 5. Measure focus ring:
#    - Take screenshot
#    - Measure pixel width (should be ≥3px)
# 6. Repeat for all pages
```

**Expected Output**:
- Focus indicators visible on all interactive elements
- 3px minimum width/border
- Sufficient contrast (≥3:1)
- Not obscured or hidden

**Files Modified/Created**:
- (No code changes, testing only)

---

[WINDOW_CHECKPOINT_5]

**Before proceeding to Window 6**:
- [ ] WAVE/Axe scan: 0 violations (or pre-approved alerts documented) (T020)
- [ ] Color contrast: All text 4.5:1, graphics 3:1 (T021)
- [ ] Keyboard-only navigation: all features accessible (T022)
- [ ] No keyboard traps or illogical tab order (T022)
- [ ] Screen reader: All elements announced correctly (T023)
- [ ] Focus indicators visible on all interactive elements (T024)
- [ ] Both resource pages pass all accessibility checks
- [ ] WCAG 2.1 AA compliance verified

**If all checkpoints pass**: Accessibility audit complete, feature WCAG compliant  
**If any checkpoint fails**: Identify issues, create bug tickets for Window 6, or fix in this window if time allows

---

## Execution Window 6: Mobile & Cross-Browser Testing

**Purpose**: Comprehensive mobile and cross-browser compatibility testing  
**Token Budget**: 70–90k  
**Duration**: ~90 minutes  
**Checkpoint Validation**:
- [ ] Mobile devices: iPhone SE (375px), iPad (768px), Android (360px)
- [ ] Browsers: Chrome, Firefox, Safari, Edge (all latest)
- [ ] No layout shifts, overflow, or rendering issues
- [ ] Performance: LCP < 2s on 3G throttling
- [ ] All user stories passing across all devices/browsers

---

### T025 Mobile device testing (phones and tablets)

**Window**: 6 (Mobile & Browser)  
**Phase**: Testing  
**Traceability**: Plan Phase 5.6 (device testing), AC-9 (mobile layout)  
**Dependencies**: T013, T019 (responsive design implemented)  
**Description**: Test on actual mobile devices or emulators (iPhone SE 375px, iPhone 12 390px, iPad 768px, Android 360px)

**What to test**:
- Devices:
  - iPhone SE (375px) — older small phone
  - iPhone 12/14/15 (390px) — modern standard phone
  - iPad (768px) — tablet
  - Samsung Galaxy S21 (360px) — Android baseline
- Test scenarios:
  - **Navigation**:
    - Can tap "Resources" menu (minimum 44x44px)
    - Mobile menu appears/disappears correctly
    - Navigation to all pages works
  - **Landing Page** (`/resources`):
    - Title, hero, two buttons visible
    - Buttons stack vertically on mobile, side-by-side on tablet+
    - Text readable at default zoom (16px font)
    - No horizontal overflow
  - **Coaching/Player Pages** (`/resources/coaching`, `/resources/players`):
    - Hero section readable
    - Filter buttons wrap without overflow
    - Each button ≥44x44px (touch target)
    - Grid: 1 column on phone, 2 on tablet
    - Resource card text/images fully visible
    - "View Resource" button tappable
    - Sticky filter bar visible while scrolling
    - Filter bar height ≤15% of viewport
    - No-results message readable
    - "Clear Filters" button tappable
  - **Interaction**:
    - Tapping filter button toggles selection (visual feedback)
    - Tapping resource link opens URL (correct tab behavior)
    - Scrolling smooth, no jank or layout shift
    - Filter events logged (check console)
- Test in DevTools Device Emulation:
  - Chrome DevTools → Device Toggle (Ctrl+Shift+M)
  - Select "iPhone SE" → test
  - Select "iPad" → test
  - Select "Galaxy S21" → test
- Test on real devices (if available):
  - iOS: Use Safari or Chrome on actual iPhone
  - Android: Use Chrome or Firefox on actual Android device

**Test Script**:
```bash
# Chrome DevTools emulation:
# 1. npm run dev
# 2. Open Chrome DevTools (F12)
# 3. Click Device Toggle (Ctrl+Shift+M or click phone icon)
# 4. Select "iPhone SE" (375px)
# 5. Navigate to /resources/coaching
# 6. Verify:
#    - Page fits in viewport (no horizontal scroll)
#    - Filter buttons wrap and are tappable (44x44px)
#    - Grid is 1 column
#    - Text is readable
#    - No layout shifts
# 7. Tap filter button → verify toggle works
# 8. Tap "View Resource" → verify link works
# 9. Repeat for iPad (768px), Galaxy S21 (360px)
# 10. Rotate device (landscape/portrait) → verify layout adapts
```

**Expected Output**:
- All pages functional and readable on all device sizes
- No overflow or horizontal scrolling
- Touch targets ≥44x44px
- Grid adapts correctly (1/2/3 columns)
- No layout shifts or jank

**Files Modified/Created**:
- (No code changes, testing only)

---

### T026 Cross-browser testing (Chrome, Firefox, Safari, Edge)

**Window**: 6 (Mobile & Browser)  
**Phase**: Testing  
**Traceability**: Plan Phase 5.6 (cross-browser testing)  
**Dependencies**: T009, T015 (pages complete)  
**Description**: Test all pages on latest versions of Chrome, Firefox, Safari, and Edge

**What to test**:
- Browsers:
  - Chrome (latest 2 versions, e.g., v125+)
  - Firefox (latest)
  - Safari (latest, macOS)
  - Edge (latest)
- Test scenarios (all pages):
  - `/resources`
  - `/resources/coaching`
  - `/resources/players`
- Verify:
  - **Rendering**:
    - Layout correct, no distortion
    - Colors accurate (brand-purple, brand-gold)
    - Typography correct (fonts loaded, sizing)
    - Images render
  - **Interaction**:
    - Filter buttons toggle correctly
    - Links work (internal and external)
    - Keyboard navigation works
    - Focus indicators visible
  - **Console**:
    - No errors or warnings
    - Filter events logged
  - **Performance**:
    - Page loads quickly (no stalled requests)
    - Filters apply without lag
- Test on each browser:
  - Open dev site: `npm run dev`
  - Navigate to each page
  - Apply filters, click links, use keyboard
  - Check DevTools console for errors
  - Take screenshot for visual comparison

**Test Script**:
```bash
# Chrome testing:
# 1. npm run dev
# 2. Open Chrome, navigate to localhost:3000
# 3. Test /resources → verify rendering, no errors
# 4. Test /resources/coaching → filters work, no errors
# 5. Test /resources/players → filters work, no errors
# 6. Open DevTools console → should be clean
# 7. Repeat in Firefox, Safari, Edge
# 8. Document any browser-specific issues
```

**Expected Output**:
- All pages render correctly in all browsers
- No console errors in any browser
- Filters work in all browsers
- Keyboard navigation works in all browsers
- Colors, fonts, images display correctly
- Performance is consistent

**Files Modified/Created**:
- (No code changes, testing only)

---

### T027 Performance audit (Lighthouse, 3G throttling)

**Window**: 6 (Mobile & Browser)  
**Phase**: Testing  
**Traceability**: Plan Phase 5.5 (performance audit), Goal: LCP < 2s on 3G  
**Dependencies**: T009, T015 (pages complete)  
**Description**: Run Lighthouse audit on all pages with 3G throttling to verify LCP (Largest Contentful Paint) < 2s

**What to test**:
- Pages:
  - `/resources`
  - `/resources/coaching`
  - `/resources/players`
- Conditions:
  - Device: Mobile (emulated)
  - Network: Slow 3G (throttled)
  - CPU: 4x slowdown (mobile CPU simulation)
- Metrics:
  - LCP (Largest Contentful Paint): Target < 2s
  - CLS (Cumulative Layout Shift): Should be ≤ 0.1 (no jank)
  - FID (First Input Delay): Should be ≤ 100ms
  - TTFB (Time to First Byte): Should be ≤ 600ms
- Report:
  - Performance score (should be ≥80)
  - Any warnings or opportunities for improvement

**Test Script**:
```bash
# Lighthouse testing:
# 1. npm run dev
# 2. Open Chrome DevTools (F12)
# 3. Click Lighthouse tab (or Install Lighthouse extension)
# 4. Select "Mobile" profile
# 5. Under "Throttling", select "Slow 3G"
# 6. Navigate to /resources/coaching
# 7. Click "Analyze page load"
# 8. Wait for report
# 9. Review:
#    - LCP value (should be < 2000ms)
#    - CLS value (should be ≤ 0.1)
#    - Performance score (should be ≥80)
# 10. Note any "Opportunities" section
# 11. Repeat for /resources/players and /resources
```

**Expected Output**:
- All pages: LCP < 2s on 3G throttling
- CLS ≤ 0.1 (minimal layout shift when applying filters)
- Performance score ≥80
- No critical warnings

**Files Modified/Created**:
- (No code changes, testing only)

---

[WINDOW_CHECKPOINT_6]

**Before proceeding to Window 7**:
- [ ] Mobile device testing: All pages functional on 375px, 390px, 768px, 360px (T025)
- [ ] No horizontal overflow on any device (T025)
- [ ] Touch targets ≥44x44px (T025)
- [ ] Grid responsive: 1/2/3 columns (T025)
- [ ] Cross-browser: No errors in Chrome, Firefox, Safari, Edge (T026)
- [ ] Rendering consistent across browsers (T026)
- [ ] Filters work in all browsers (T026)
- [ ] Keyboard navigation works in all browsers (T026)
- [ ] Performance: LCP < 2s on 3G throttling (T027)
- [ ] CLS ≤ 0.1 (T027)
- [ ] Performance score ≥80 (T027)

**If all checkpoints pass**: Mobile and cross-browser testing complete  
**If any checkpoint fails**: Document issues, prioritize for Window 7 or post-launch fixes

---

## Execution Window 7: Integration Testing & Final Verification

**Purpose**: End-to-end testing, spec acceptance criteria validation, final fixes, and deployment prep  
**Token Budget**: 80–100k  
**Duration**: ~120 minutes  
**Checkpoint Validation**:
- [ ] All user stories (US-1 through US-5) acceptance criteria passing
- [ ] No console errors or warnings
- [ ] Code clean and ready for merge
- [ ] Deployment checklist completed
- [ ] Feature ready for production

---

### T028 End-to-end flow testing (all user stories)

**Window**: 7 (Integration)  
**Phase**: Testing  
**Traceability**: US-1 through US-5 (all acceptance criteria)  
**Dependencies**: T006–T027 (all features complete and tested)  
**Description**: Execute complete user flows for each user story to verify all acceptance criteria are met

**What to test**:
- **US-1: Coach Discovers Coaching Resources**
  - [ ] Click "Resources" in navbar → navigate to `/resources`
  - [ ] See two buttons: "Coaching Resources" and "Player Resources"
  - [ ] Click "Coaching Resources" → navigate to `/resources/coaching`
  - [ ] See page title "Coaching Resources"
  - [ ] See hero section with brand-purple background
  - [ ] Use browser back button → return to `/resources`
  - [ ] Click "Resources" again → navigate back to `/resources/coaching`

- **US-2: Player Discovers Player Resources**
  - [ ] Click "Resources" in navbar → navigate to `/resources`
  - [ ] Click "Player Resources" → navigate to `/resources/players`
  - [ ] See page title "Player Resources"
  - [ ] See hero section
  - [ ] Use browser back button → return to `/resources`

- **US-3: Filter and Discover Coaching Resources**
  - [ ] On `/resources/coaching`, see all resources displayed
  - [ ] See filter buttons: age groups (All Ages, U12, U14, U16, Senior) and categories (All Categories, Defence, Offence, Drills, Fundamentals, Game Plans, Tools)
  - [ ] Click "Defence" filter → only Defence resources show, button highlights
  - [ ] Click "U12" filter → only U12 + Defence resources show
  - [ ] Click "Defence" again → deselect, now only U12 resources show
  - [ ] Click filter combo with zero results → "No results" message shows
  - [ ] Click "Clear Filters" → all filters reset, all resources show
  - [ ] Reload page → filters reset (no persistence)

- **US-4: Resources Menu Visual Consistency**
  - [ ] Navbar: "Resources" menu item styled with brand colors (purple, gold)
  - [ ] Dropdown/mobile menu: two options visible with consistent styling
  - [ ] Hover state: gold underline or color change
  - [ ] Mobile viewport: Resources menu and options accessible and readable

- **US-5: Keyboard Navigation for Filter Controls**
  - [ ] Tab to filter buttons → focus visible (gold outline)
  - [ ] Arrow left/right → move focus between buttons in same group
  - [ ] Enter/Space → toggle filter
  - [ ] Tab to "Clear Filters" button → Enter to reset
  - [ ] All features accessible without mouse
  - [ ] No keyboard traps

**Test Script**:
```bash
# Complete flow testing:
# 1. npm run dev
# 2. Start fresh browser session (clear localStorage/cookies)
# 3. Navigate to homepage
# 4. Execute US-1 flow above
# 5. Verify all AC passed, document any issues
# 6. Execute US-2 flow
# 7. Execute US-3 flow (focus on filter combinations)
# 8. Execute US-4 flow (visual inspection)
# 9. Execute US-5 flow (keyboard-only)
# 10. Check DevTools console → should be clean
# 11. Document: "All user stories passing" or list any failures
```

**Expected Output**:
- All acceptance criteria for US-1 through US-5 passing
- No console errors
- No missing features or bugs

**Files Modified/Created**:
- `/TESTING-RESULTS.md` (NEW, document all test results)

---

### T029 Build site and verify production build

**Window**: 7 (Integration)  
**Phase**: Build  
**Traceability**: Deployment Plan (pre-deployment checklist)  
**Dependencies**: All tasks complete (T001–T027)  
**Description**: Build the site using `npm run build` and verify output contains all new pages and no errors

**What to test**:
- Build process:
  - Run: `npm run build`
  - Verify: No errors or critical warnings
  - Check: Build output in `dist/` directory
- Verify build artifacts:
  - `/dist/resources/index.html` exists
  - `/dist/resources/coaching/index.html` exists
  - `/dist/resources/players/index.html` exists
  - All assets (CSS, JS) included
  - No broken links in build output
- Test in built version:
  - Start local HTTP server: `npx http-server dist/`
  - Navigate to each page
  - Verify layout, styling, interactivity
  - Test filters, keyboard navigation
  - Check console for errors

**Test Script**:
```bash
# Build verification:
# 1. npm run build
# 2. Check exit code (should be 0)
# 3. ls dist/resources/ → should contain:
#    - index.html
#    - coaching/index.html
#    - players/index.html
# 4. npx http-server dist/
# 5. Open http://localhost:8080 (or port shown)
# 6. Navigate to /resources, /resources/coaching, /resources/players
# 7. Verify rendering, filters work, no console errors
# 8. Copy build artifacts to deployment staging area
```

**Expected Output**:
- Build completes with 0 errors
- All new pages in build output
- Production build runs without errors

**Files Modified/Created**:
- (No code changes, verification only)

---

### T030 Code cleanup and linting

**Window**: 7 (Integration)  
**Phase**: Code Quality  
**Traceability**: Best Practices  
**Dependencies**: All code changes complete (T001–T027)  
**Description**: Remove debug logs, console.log statements, fix linting errors, ensure consistent code style

**What to do**:
- File review:
  - `/src/lib/resources/types.ts` — no debug code
  - `/src/lib/resources/logger.ts` — no debug code
  - `/src/lib/resources/filters.ts` — no debug code
  - `/src/data/*.json` — no trailing commas, valid syntax
  - `/src/components/Navbar.astro` — clean code, no debug logs
  - `/src/pages/resources/*.astro` — remove any `console.log` or `// TODO` comments (except long-term TODOs)
  - All Astro `<script>` sections — no unused variables, proper formatting
- Run linter:
  - `npm run lint` (or equivalent, per project config)
  - Fix any errors (indentation, semicolons, unused variables)
  - Fix any warnings if applicable
- Remove:
  - Commented-out code blocks
  - Debug `console.log` statements (keep production logging)
  - Unused imports
- Verify:
  - Code consistency (naming, formatting, indentation)
  - No TypeScript errors: `npx tsc --noEmit`

**Test Script**:
```bash
# Code cleanup:
# 1. npm run lint
# 2. Review output for errors/warnings
# 3. npm run lint --fix (if auto-fix available)
# 4. Manually fix remaining issues
# 5. npx tsc --noEmit → check for TS errors
# 6. Review git diff for cleanup commits
# 7. npm test (if tests exist)
# 8. Verify no new issues introduced
```

**Expected Output**:
- `npm run lint` returns 0 errors, 0 warnings
- `npx tsc --noEmit` returns 0 errors
- Code is clean and production-ready

**Files Modified/Created**:
- (Code cleanup across all new files)

---

### T031 Documentation update (README, deployment notes)

**Window**: 7 (Integration)  
**Phase**: Documentation  
**Traceability**: Deployment Plan  
**Dependencies**: All features complete (T001–T030)  
**Description**: Update project documentation with new pages, routing information, and deployment notes

**What to create/update**:
- File: `README.md` or equivalent
  - Add new pages section:
    - `/resources` — landing page routing to coaching and player pages
    - `/resources/coaching` — coaching resources with filters (age group, category)
    - `/resources/players` — player resources with filters (age group, category)
  - Add keyboard navigation notes for accessibility
  - Add filter categories reference (coaching vs player)
- File: `DEPLOYMENT.md` (if exists) or add to README
  - Note: No database changes, static pages only
  - Data files: `/src/data/coaching-resources.json` and `/src/data/player-resources.json`
  - Routes: Old `/coaching-resources` and `/player-resources` routes deprecated, redirect to new routes (if applicable)
  - Logging: Filter events logged to console; ready for telemetry integration
- File: Create `MIGRATION.md` (optional, if old pages being removed)
  - Old routes: `/coaching-resources`, `/player-resources`
  - New routes: `/resources/coaching`, `/resources/players`
  - Redirect plan: 301 redirect old routes to new routes (if backward compatibility needed)

**Files Modified/Created**:
- `README.md` (UPDATED, add Resources section)
- `DEPLOYMENT.md` (UPDATED or created)

---

### T032 Final sign-off and merge checklist

**Window**: 7 (Integration)  
**Phase**: QA  
**Traceability**: Deployment Plan (pre-deployment checklist)  
**Dependencies**: T028–T031 (all testing and documentation complete)  
**Description**: Complete final sign-off checklist before merging to main branch

**What to verify**:
- [ ] All user stories (US-1 through US-5) acceptance criteria PASS
- [ ] All tests passing (if automated tests exist)
- [ ] No console errors or warnings on any page
- [ ] Responsive design verified (mobile, tablet, desktop)
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Keyboard navigation working
- [ ] Cross-browser testing passed (Chrome, Firefox, Safari, Edge)
- [ ] Performance audit passed (LCP < 2s on 3G)
- [ ] Code linting passed (`npm run lint` → 0 errors)
- [ ] TypeScript compilation passed (`npx tsc --noEmit` → 0 errors)
- [ ] Build successful (`npm run build` → 0 errors)
- [ ] Production build tested and working
- [ ] Documentation updated (README, deployment notes)
- [ ] No new bugs or regressions introduced
- [ ] Ready for deployment

**Sign-Off**:
- [ ] Developer: Feature complete and tested
- [ ] QA: All test scenarios passed
- [ ] Code review: No issues found (if peer review required)
- [ ] Ready to merge to main

**Files Modified/Created**:
- `/SIGN-OFF.md` (NEW, document sign-off and test results)

---

[WINDOW_CHECKPOINT_7]

**Final Checkpoint — Feature Complete**:
- [ ] All user stories (US-1 through US-5) acceptance criteria verified
- [ ] End-to-end flows tested and passing (T028)
- [ ] Production build successful (T029)
- [ ] Code clean and linting passed (T030)
- [ ] Documentation updated (T031)
- [ ] Final sign-off checklist completed (T032)
- [ ] No console errors or warnings
- [ ] No breaking changes or regressions
- [ ] Feature ready for production merge and deployment

**If all checkpoints pass**: COA-33 complete, ready for merge to main and deployment  
**If any checkpoint fails**: Create bug ticket and fix before final merge

---

## Summary

**Total Windows**: 7  
**Total Tasks**: 32  
**Estimated Effort**:
- Window 1: 45 min (Infrastructure)
- Window 2: 60 min (Navigation)
- Window 3: 90 min (Coaching Page)
- Window 4: 90 min (Player Page)
- Window 5: 75 min (Accessibility)
- Window 6: 90 min (Mobile & Browser)
- Window 7: 120 min (Integration & Sign-Off)
- **Total**: ~570 minutes (~9.5 hours)

**Token Budget**: 280–350k tokens (across all windows)

**Parallelization Opportunities**:
- Windows 3 and 4 can execute in parallel (different pages, same structure)
- Within Window 1: T001, T002, T003, T004, T005 are [P] (parallel-capable)
- Within Window 5: Testing tasks (T020–T024) can be split across multiple testers

**Handoff Between Windows**:
- Each window has clear entry requirements (dependencies) and exit validation (checkpoint)
- Checkpoint must pass before next window starts
- State documented in `/SIGN-OFF.md` or similar tracking file

---

**Ready for Implementation**: Use `feature-development` skill or implement agent to execute windows in sequence.
