# Tasks: COA-43 — Resources Page Update

**Input**: Specs from `/specs/coa-43-resources-update/`  
**Strategy**: Option C Execution Windows (GSD-aligned)  
**Windows**: 4 total, estimate ~260–340k tokens total  

---

## Format Guide

- **[P]**: Can run in parallel (different files, same window)
- **Window N**: Execution context boundary (fresh 200k context window)
- **WINDOW_CHECKPOINT**: Validation gate before next window
- **Traceability**: Each task traces back to spec (FR-XXX, SC-XXX, US-X)
- **Dependency**: What prior work must be done

---

## Execution Window 1: Foundation — Data Schema & Migration

**Purpose**: Establish new Resource interface and migrate existing JSON data to new schema.

**Token Budget**: 60–80k

**Checkpoint Validation**:
- [ ] `src/lib/resources/types.ts` updated with new Resource interface (tags, section, fileRef)
- [ ] All JSON files (`coaching-resources.json`, `player-resources.json`, `manager-resources.json`, `guides.json`) migrated to new schema
- [ ] JSON schema validation script runs without errors; all files valid
- [ ] No TypeScript compilation errors
- [ ] Can proceed to Window 2

---

### T001 [P] Update Resource interface in types.ts

**Window**: 1 (Foundation)  
**Phase**: Schema Definition  
**Traceability**: FR-001, FR-015, NFR-007  
**Dependencies**: None  

**Description**: Update the Resource interface to support new schema: tags (age, category, skill), section (enum), fileRef (optional), and enhanced type enum.

**What to create**:
- File: `src/lib/resources/types.ts`
- Add/update interface `Resource`:
  - `id`: string (unchanged)
  - `title`: string (unchanged)
  - `description?`: string (unchanged, optional)
  - `section`: 'coaching_resources' | 'player_resources' | 'manager' | 'guides' | 'forms' (NEW)
  - `type`: 'youtube_link' | 'image_png' | 'image_jpeg' | 'gif' | 'pdf' | 'external_link' (ENHANCED)
  - `url?`: string (optional, for links)
  - `fileRef?`: string (NEW, optional, for embedded assets)
  - `tags?`: object (NEW, optional)
    - `age?`: string[] (array of age group tags)
    - `category?`: string[] (array of category tags)
    - `skill?`: string[] (array of skill tags)
  - `createdAt`: string (ISO timestamp)
  - `updatedAt`: string (ISO timestamp)

**Test**: TypeScript compiles without errors; interface available for import

---

### T002 [P] Migrate coaching-resources.json to new schema

**Window**: 1 (Foundation)  
**Phase**: Data Migration  
**Traceability**: FR-001, FR-015, NFR-007  
**Dependencies**: T001 (interface defined)  

**Description**: Update `src/data/coaching-resources.json` with new schema: map old `audience`→`section`, old `category`→`tags.category`, old `ageGroup`→`tags.age`, add `tags.skill`, ensure `type` is one of the new enum values.

**What to do**:
- File: `src/data/coaching-resources.json`
- For each resource, transform:
  - Set `section: 'coaching_resources'` (from old `audience: 'coaching'`)
  - Move `category` (string) → `tags.category` (array, e.g., `['Defence']`)
  - Move `ageGroup` (string) → `tags.age` (array, e.g., `['U12']`)
  - Add `tags.skill` (array, can be empty initially or derived from category)
  - Update `type` to new enum (e.g., `'pdf'` → `'pdf'`, `'link'` → `'external_link'`, `'video'` → `'youtube_link'`)
  - Ensure `createdAt` and `updatedAt` are ISO strings
- Preserve all other fields (`id`, `title`, `description`, `url`)

**Test**: JSON is valid; all resources have `section`, `type`, and optional `tags`; file imports without error

---

### T003 [P] Migrate player-resources.json to new schema

**Window**: 1 (Foundation)  
**Phase**: Data Migration  
**Traceability**: FR-001, FR-015, NFR-007  
**Dependencies**: T001 (interface defined)  

**Description**: Update `src/data/player-resources.json` with new schema (same transformation as T002).

**What to do**:
- File: `src/data/player-resources.json`
- Apply same transformations as T002 (audience→section, category→tags.category, etc.)
- Ensure categories match Player Resources values (Solo, Group, Offence, Defence, Drill)

**Test**: JSON is valid; all resources have `section: 'player_resources'`, `type`, and optional `tags`; file imports without error

---

### T004 [P] Migrate manager-resources.json and guides.json to new schema

**Window**: 1 (Foundation)  
**Phase**: Data Migration  
**Traceability**: FR-001, FR-015, NFR-007  
**Dependencies**: T001 (interface defined)  

**Description**: Update `src/data/manager-resources.json` and `src/data/guides.json` with new schema. These sections have minimal tags (no age/category filters).

**What to do**:
- Files:
  - `src/data/manager-resources.json` (set `section: 'manager'`)
  - `src/data/guides.json` (set `section: 'guides'`)
- For each resource:
  - Set appropriate `section` value
  - Update `type` to new enum
  - Optionally add minimal `tags` (e.g., `tags.category` for organization; leave age/skill empty)
  - Ensure `createdAt`, `updatedAt`, `id`, `title`, `url` present

**Test**: Both JSON files valid; resources have `section` and `type`; files import without error

---

### T005 Create JSON schema validation script

**Window**: 1 (Foundation)  
**Phase**: Validation Tooling  
**Traceability**: FR-001, FR-019, NFR-007  
**Dependencies**: T001 (interface defined)  

**Description**: Create helper script to validate all resource JSON files against the new schema. Catches missing fields, invalid `section`/`type` values, and malformed tags. Handles error cases gracefully (FR-019).

**What to create**:
- File: `scripts/validate-resources.js` (or `.ts` if using tsx runner)
- Script reads all JSON files from `src/data/`
- For each resource, validates:
  - `id`, `section`, `type`, `title`, `createdAt`, `updatedAt` are present
  - `section` is one of: coaching_resources, player_resources, manager, guides, forms
  - `type` is one of: youtube_link, image_png, image_jpeg, gif, pdf, external_link
  - `tags` (if present) has valid `age`, `category`, `skill` arrays
  - File loading errors are caught and logged to console with clear error messages
  - Reports errors and exit code
- Error handling (FR-019):
  - If JSON file cannot be parsed, log error: `Error loading [filename]: [error message]`
  - If file is missing, log error: `File not found: [path]`
  - Continue validating other files (no crash)
- Output example:
  ```
  ✓ coaching-resources.json: 15 resources validated
  ✓ player-resources.json: 12 resources validated
  ✓ manager-resources.json: 8 resources validated
  ✓ guides.json: 20 resources validated
  All resources valid.
  ```

**Test**: Run script; all files pass validation with no errors

---

[WINDOW_CHECKPOINT_1]

**Before proceeding to Window 2**:
- [ ] T001: `src/lib/resources/types.ts` updated; TypeScript compiles
- [ ] T002: `coaching-resources.json` migrated to new schema
- [ ] T003: `player-resources.json` migrated to new schema
- [ ] T004: `manager-resources.json` and `guides.json` migrated to new schema
- [ ] T005: Validation script runs; all JSON files pass validation
- [ ] Foundation is complete; data is consistent and valid

If all checkpoints pass, proceed to Window 2.  
If any checkpoint fails, debug and fix within Window 1 (do NOT proceed).

---

## Execution Window 2: Filter Logic — Core Algorithms & Unit Tests

**Purpose**: Implement and unit-test the filtering and search algorithms (AND-logic, keyword search, skill extraction).

**Token Budget**: 70–90k

**Checkpoint Validation**:
- [ ] `src/lib/resources/filters.ts` implemented with core functions
- [ ] `src/lib/resources/skills.ts` implemented with skill extraction
- [ ] All unit tests pass (Vitest)
- [ ] Filter logic testable without UI
- [ ] Can proceed to Window 3

---

### T006 [P] Create filters.ts with core filtering functions

**Window**: 2 (Filter Logic)  
**Phase**: Implementation  
**Traceability**: FR-003, FR-004, FR-005, FR-008, FR-009  
**Dependencies**: T001 (types), T002–T004 (data migrated)  

**Description**: Implement the `filterResources` function and helper functions for AND-logic filtering and keyword search.

**What to create**:
- File: `src/lib/resources/filters.ts`
- Export functions:
  - `filterResources(resources: Resource[], activeFilters: {age: string[], category: string[], skill: string[]}, searchKeyword: string, section: string): Resource[]`
    - Filters to section
    - Applies AND-logic: if age filter active, match resources with age tag; same for category, skill
    - Applies keyword search (title + description, case-insensitive, partial match)
    - Sorts: coaching/player by createdAt DESC then title ASC; manager/guides/forms by title ASC
    - Returns filtered, sorted results
  - `filterByAge(resources: Resource[], ageValues: string[]): Resource[]` (helper)
  - `filterByCategory(resources: Resource[], categoryValues: string[]): Resource[]` (helper)
  - `filterBySkill(resources: Resource[], skillValues: string[]): Resource[]` (helper)
  - `searchByKeyword(resources: Resource[], keyword: string): Resource[]` (helper)

**Algorithm** (pseudocode from spec):
```typescript
export function filterResources(
  resources: Resource[],
  activeFilters: { age: string[]; category: string[]; skill: string[] },
  searchKeyword: string,
  section: string
): Resource[] {
  let results = resources.filter((r) => r.section === section);

  // AND-logic filters
  if (activeFilters.age.length > 0) {
    results = results.filter((r) =>
      r.tags?.age?.some((a) => activeFilters.age.includes(a))
    );
  }
  if (activeFilters.category.length > 0) {
    results = results.filter((r) =>
      r.tags?.category?.some((c) => activeFilters.category.includes(c))
    );
  }
  if (activeFilters.skill.length > 0) {
    results = results.filter((r) =>
      r.tags?.skill?.some((s) => activeFilters.skill.includes(s))
    );
  }

  // Keyword search
  if (searchKeyword.trim().length > 0) {
    const lowerKeyword = searchKeyword.toLowerCase();
    results = results.filter((r) =>
      r.title.toLowerCase().includes(lowerKeyword) ||
      r.description?.toLowerCase().includes(lowerKeyword)
    );
  }

  // Sort
  if (['manager', 'guides', 'forms'].includes(section)) {
    results.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    results.sort((a, b) => {
      const dateCompare =
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return dateCompare !== 0 ? dateCompare : a.title.localeCompare(b.title);
    });
  }

  return results;
}
```

**Test**: Unit tests in T008 must pass for this function

---

### T007 [P] Create skills.ts with dynamic skill extraction

**Window**: 2 (Filter Logic)  
**Phase**: Implementation  
**Traceability**: FR-012, FR-013, Note 3  
**Dependencies**: T001 (types), T002–T004 (data), T006 (filters)  

**Description**: Implement function to dynamically extract available skills from resources in a given section. Skills respect active Age and Category filters to prevent zero-match combinations (per Note 3).

**What to create**:
- File: `src/lib/resources/skills.ts`
- Export functions:
  - `extractAvailableSkills(resources: Resource[], section: string, activeFilters?: {age: string[], category: string[]}): string[]`
    - Filters resources to section
    - If activeFilters provided: further filter by Age and Category (AND-logic)
    - Collects all unique `tags.skill` values from resulting resources
    - Returns sorted array of skill names (A–Z)
    - Returns empty array if no skills present
- Behavior:
  - If Age filter "U12" is active, only skills from U12 resources are shown
  - If both Age "U12" and Category "Defence" are active, only skills from resources matching both are shown
  - If no Age/Category filters active, all skills in section are shown
- Example:
  - Input: 10 coaching resources, 5 tagged U12 with skills ['Ball Handling', 'Positioning'], 5 tagged U16+ with skills ['Leadership', 'Positioning']
  - With no filters: `['Ball Handling', 'Leadership', 'Positioning']`
  - With U12 filter: `['Ball Handling', 'Positioning']` (only U12 resources' skills)

**Test**: Unit tests in T008 must pass for this function

---

### T008 Create unit tests for filters.ts and skills.ts

**Window**: 2 (Filter Logic)  
**Phase**: Tests (Test-First; must pass before implementation is "done")  
**Traceability**: FR-003, FR-004, FR-005, FR-008, FR-009, FR-012, FR-013  
**Dependencies**: T001 (types), T006 (filters), T007 (skills)  

**Description**: Write comprehensive unit tests (Vitest) for filtering and skill extraction logic. Tests verify AND-logic correctness, search matching, edge cases.

**What to create**:
- File: `src/lib/resources/__tests__/filters.test.ts`
- File: `src/lib/resources/__tests__/skills.test.ts`

**Filters Tests** (filters.test.ts):
```typescript
describe('filterResources', () => {
  // Test AND-logic filters
  it('returns all resources when no filters active', () => {
    const filters = { age: [], category: [], skill: [] };
    const result = filterResources(mockResources, filters, '', 'coaching_resources');
    expect(result).toHaveLength(mockResources.filter(r => r.section === 'coaching_resources').length);
  });

  it('filters by age AND-logic', () => {
    const filters = { age: ['U12'], category: [], skill: [] };
    const result = filterResources(mockResources, filters, '', 'coaching_resources');
    expect(result.every(r => r.tags?.age?.includes('U12'))).toBe(true);
  });

  it('filters by age AND category (AND-logic)', () => {
    const filters = { age: ['U12'], category: ['Defence'], skill: [] };
    const result = filterResources(mockResources, filters, '', 'coaching_resources');
    expect(result.every(r => 
      r.tags?.age?.includes('U12') && r.tags?.category?.includes('Defence')
    )).toBe(true);
  });

  // Test search
  it('searches by keyword in title', () => {
    const filters = { age: [], category: [], skill: [] };
    const result = filterResources(mockResources, filters, 'press', 'coaching_resources');
    expect(result.every(r => 
      r.title.toLowerCase().includes('press') || 
      r.description?.toLowerCase().includes('press')
    )).toBe(true);
  });

  it('combines search and filters with AND-logic', () => {
    const filters = { age: ['U12'], category: [], skill: [] };
    const result = filterResources(mockResources, filters, 'press', 'coaching_resources');
    expect(result.every(r => 
      r.tags?.age?.includes('U12') && 
      (r.title.toLowerCase().includes('press') || r.description?.toLowerCase().includes('press'))
    )).toBe(true);
  });

  // Test sorting
  it('sorts coaching resources by createdAt DESC then title ASC', () => {
    const filters = { age: [], category: [], skill: [] };
    const result = filterResources(mockCoachingResources, filters, '', 'coaching_resources');
    for (let i = 0; i < result.length - 1; i++) {
      const curr = new Date(result[i].createdAt).getTime();
      const next = new Date(result[i + 1].createdAt).getTime();
      expect(curr).toBeGreaterThanOrEqual(next);
    }
  });

  it('sorts manager/guides resources by title ASC', () => {
    const filters = { age: [], category: [], skill: [] };
    const result = filterResources(mockGuides, filters, '', 'guides');
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].title.localeCompare(result[i + 1].title)).toBeLessThanOrEqual(0);
    }
  });

  // Test edge cases
  it('returns empty array when no resources match filters', () => {
    const filters = { age: ['U99'], category: [], skill: [] };
    const result = filterResources(mockResources, filters, '', 'coaching_resources');
    expect(result).toHaveLength(0);
  });

  it('handles resources without tags gracefully', () => {
    const resourcesWithMissing = [
      { id: '1', title: 'No Tags', type: 'pdf', section: 'coaching_resources', createdAt: '2026-04-18T00:00:00Z', updatedAt: '2026-04-18T00:00:00Z' },
      ...mockResources
    ];
    const filters = { age: [], category: [], skill: [] };
    const result = filterResources(resourcesWithMissing, filters, '', 'coaching_resources');
    expect(result.some(r => r.id === '1')).toBe(true);
  });

  it('excludes resources without matching tag when filter active', () => {
    const resourcesWithMissing = [
      { id: '1', title: 'No Age Tag', type: 'pdf', section: 'coaching_resources', tags: { category: ['Defence'] }, createdAt: '2026-04-18T00:00:00Z', updatedAt: '2026-04-18T00:00:00Z' },
      ...mockResources
    ];
    const filters = { age: ['U12'], category: [], skill: [] };
    const result = filterResources(resourcesWithMissing, filters, '', 'coaching_resources');
    expect(result.some(r => r.id === '1')).toBe(false);
  });

  // Test case-insensitive search
  it('search is case-insensitive', () => {
    const filters = { age: [], category: [], skill: [] };
    const result1 = filterResources(mockResources, filters, 'DEFENCE', 'coaching_resources');
    const result2 = filterResources(mockResources, filters, 'defence', 'coaching_resources');
    expect(result1).toEqual(result2);
  });
});
```

**Skills Tests** (skills.test.ts):
```typescript
describe('extractAvailableSkills', () => {
  it('returns unique skills from section', () => {
    const skills = extractAvailableSkills(mockResources, 'coaching_resources');
    expect(skills).toContain('Ball Handling');
    expect(skills).toContain('Positioning');
    // Verify unique (no duplicates)
    expect(new Set(skills).size).toBe(skills.length);
  });

  it('returns sorted skills A-Z', () => {
    const skills = extractAvailableSkills(mockResources, 'coaching_resources');
    const sorted = [...skills].sort();
    expect(skills).toEqual(sorted);
  });

  it('returns empty array if no skills in section', () => {
    const skillsForManager = extractAvailableSkills(mockResources, 'manager');
    expect(skillsForManager).toEqual([]);
  });

  it('filters to section only', () => {
    const coachingSkills = extractAvailableSkills(mockResources, 'coaching_resources');
    const playerSkills = extractAvailableSkills(mockResources, 'player_resources');
    // May differ because each section has different resources
    expect(coachingSkills.length).toBeGreaterThan(0);
  });
});
```

**Test Status**: All tests must PASS after T006 and T007 implementation

---

[WINDOW_CHECKPOINT_2]

**Before proceeding to Window 3**:
- [ ] T006: `filters.ts` implemented; core functions present
- [ ] T007: `skills.ts` implemented; skill extraction working
- [ ] T008: All unit tests pass (Vitest)
- [ ] Filter logic testable without UI
- [ ] No TypeScript errors

If all checkpoints pass, proceed to Window 3.  
If any checkpoint fails, debug and fix within Window 2 (do NOT proceed).

---

## Execution Window 3: UI Components & Page Logic — Filtering UI, State, Search

**Purpose**: Build the Resources page filtering and search UI. Update FilterBar component, implement page logic with state management, debouncing, and no-results messaging.

**Token Budget**: 80–100k

**Checkpoint Validation**:
- [ ] `src/pages/resources/index.astro` updated with filter state, search debounce, and filtering logic
- [ ] `src/components/FilterBar.astro` enhanced with search input and skill filter buttons
- [ ] Filter state management working (vanilla JS, no React)
- [ ] Search debounces correctly (300ms)
- [ ] Filters and search combine with AND-logic in UI
- [ ] No-results state displays correctly
- [ ] Browser manual test: filters and search work
- [ ] Can proceed to Window 4

---

### T009 [P] Enhance FilterBar.astro with search input and skill filters

**Window**: 3 (UI Components)  
**Phase**: Component Implementation  
**Traceability**: FR-007, NFR-001, NFR-002, SC-002, SC-006  
**Dependencies**: T006, T007 (filter functions), T001 (types)  

**Description**: Update FilterBar component to display search input, age filter buttons, category filter buttons, skill filter buttons (dynamic), and clear button.

**What to modify**:
- File: `src/components/FilterBar.astro`
- Add props:
  - `section: string` (coaching_resources | player_resources | manager | guides | forms)
  - `availableAges?: string[]` (e.g., ['U8', 'U10', 'U12', 'U14', 'U16+'])
  - `availableCategories?: string[]` (varies by section)
  - `availableSkills?: string[]` (dynamic from data)
  - `activeFilters?: {age: string[], category: string[], skill: string[]}` (current selections)
  - `searchKeyword?: string` (current search text)
  - `resultCount?: number` (for aria-live announcements)

- Render:
  - Search input (only for coaching/player sections):
    - `<input type="search" placeholder="Search by keyword..." id="search-input" />`
    - Accessible with `<label for="search-input">Search resources</label>`
  - Age filter row (only for coaching/player sections):
    - Buttons for each age value: `<button data-filter-type="age" data-filter-value="U12">U12</button>`
    - Active state CSS class: `is-active` when in `activeFilters.age`
  - Category filter row (only for coaching/player sections):
    - Buttons for each category
  - Skill filter row (only for coaching/player sections; only if skills available):
    - Buttons for each skill
  - Clear all button:
    - `<button class="btn-clear">Clear all filters</button>`
  - Result count announcement (aria-live):
    - `<div aria-live="polite" aria-atomic="true">Results: {resultCount}</div>`

- Structure (HTML):
  ```html
  <form class="filter-bar" data-section="{section}">
    {section in ['coaching_resources', 'player_resources'] && (
      <>
        <div class="search-group">
          <label for="search-input">Search resources</label>
          <input type="search" id="search-input" value={searchKeyword} />
        </div>
        
        <div class="filters">
          <fieldset>
            <legend>Age</legend>
            {availableAges?.map(age => (
              <button type="button" data-filter-type="age" data-filter-value={age} 
                      class={activeFilters.age.includes(age) ? 'is-active' : ''}>
                {age}
              </button>
            ))}
          </fieldset>
          
          <fieldset>
            <legend>Category</legend>
            {availableCategories?.map(cat => (
              <button type="button" data-filter-type="category" data-filter-value={cat}
                      class={activeFilters.category.includes(cat) ? 'is-active' : ''}>
                {cat}
              </button>
            ))}
          </fieldset>
          
          {availableSkills && availableSkills.length > 0 && (
            <fieldset>
              <legend>Skill</legend>
              {availableSkills.map(skill => (
                <button type="button" data-filter-type="skill" data-filter-value={skill}
                        class={activeFilters.skill.includes(skill) ? 'is-active' : ''}>
                  {skill}
                </button>
              ))}
            </fieldset>
          )}
        </div>

        <button type="button" class="btn-clear">Clear all filters</button>
      </>
    )}

    <div aria-live="polite" aria-atomic="true" class="result-count">
      Results: {resultCount}
    </div>
  </form>
  ```

**Styling**: Use Tailwind utility classes; ensure buttons have visible focus indicators (`:focus-visible`); wrap filters on mobile (Flex + gap). Mobile constraint (NFR-003): If search and filters are in a sticky header, header max height = 15% of viewport. Filters may wrap to multiple lines but must remain accessible without horizontal scroll.

**Test**: Component renders without errors; search input and filter buttons present; aria-live region renders; mobile header height verified at 375px viewport

---

### T010 Update Resources page logic to implement filtering and search

**Window**: 3 (UI Components)  
**Phase**: Page Logic Implementation  
**Traceability**: FR-003, FR-004, FR-005, FR-007, FR-008, FR-009, FR-011, SC-001, SC-002, SC-003, SC-006  
**Dependencies**: T006, T007 (filter functions), T009 (FilterBar component)  

**Description**: Update `src/pages/resources/index.astro` to implement filtering state, search debouncing, AND-logic application, and result updates.

**What to modify**:
- File: `src/pages/resources/index.astro`
- Import:
  - `filterResources`, `filterByAge`, etc. from `src/lib/resources/filters.ts`
  - `extractAvailableSkills` from `src/lib/resources/skills.ts`
  - `FilterBar` from `src/components/FilterBar.astro`
  - Resource data from `src/data/coaching-resources.json`, etc.

- Add page-level logic (in Astro script or in vanilla JS module):
  - Initialize `activeFilters = { age: [], category: [], skill: [] }`
  - Initialize `searchKeyword = ''`
  - Define `applyFilters()` function:
    ```typescript
    function applyFilters(section: string) {
      const results = filterResources(
        allResources,
        activeFilters,
        searchKeyword,
        section
      );
      return results;
    }
    ```
  - For each tab/section, pass:
    - `activeFilters` prop to FilterBar
    - `availableAges`, `availableCategories`, `availableSkills` (from `extractAvailableSkills()`)
    - `resultCount` (length of filtered results)
    - Filtered resources to ResourceCard grid

- Vanilla JS module (client-side interactivity):
  - Listen to filter button clicks: update `activeFilters[type]`
  - Listen to search input: debounce and update `searchKeyword`
  - On filter/search change: call `applyFilters(currentSection)` and re-render grid
  - Listen to clear button: reset `activeFilters` and `searchKeyword`

**Debounce Implementation** (300ms):
```typescript
function debounceSearch(fn: () => void, delay = 300) {
  let timeout: NodeJS.Timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
  };
}

const handleSearch = debounceSearch(() => {
  const keyword = document.getElementById('search-input').value;
  searchKeyword = keyword;
  applyFilters(currentSection);
  updateResultsUI();
}, 300);
```

- No-results state (FR-020, FR-021):
  ```typescript
  if (filteredResults.length === 0) {
    // Build filter description: "No resources match Age=U12 and Category=Defence"
    const activeFiltersList = [];
    if (activeFilters.age.length > 0) activeFiltersList.push(`Age=${activeFilters.age.join(',')}`);
    if (activeFilters.category.length > 0) activeFiltersList.push(`Category=${activeFilters.category.join(',')}`);
    if (activeFilters.skill.length > 0) activeFiltersList.push(`Skill=${activeFilters.skill.join(',')}`);
    if (searchKeyword) activeFiltersList.push(`"${searchKeyword}"`);
    
    const filterText = activeFiltersList.length > 0 
      ? `No resources match ${activeFiltersList.join(' and ')}`
      : 'No resources found';
    
    renderNoResultsMessage(filterText);
    showClearAllButton(); // Button text: "Clear all filters and search"
  } else {
    renderResourceGrid(filteredResults);
    // Display result count above grid (FR-021): "4 resources found"
    displayResultCount(filteredResults.length);
  }
  ```

**Test**: Filters work; search works; AND-logic applies; debounce works (verified by typing and seeing delayed results); no-results appears with active filter description; result count displays above grid; clear button resets all filters and search

---

### T011 [P] Implement keyboard-accessible search input

**Window**: 3 (UI Components)  
**Phase**: Accessibility Implementation  
**Traceability**: NFR-001, NFR-002, SC-007  
**Dependencies**: T009 (FilterBar), T010 (page logic)  

**Description**: Ensure search input is fully keyboard accessible. Tab reaches it, Enter triggers search, blur triggers search.

**What to do**:
- In vanilla JS module (src/pages/resources/index.astro client script):
  - Listen to search input:
    - On `change` event: debounce + apply filters
    - On `blur` event: apply filters immediately (no debounce)
    - On `keydown` Enter: apply filters immediately
  - Verify focus indicator is visible:
    - Check `:focus-visible` CSS is applied (Tailwind: `focus-visible:ring-2 focus-visible:ring-blue-500`)
  - Test with Tab key only (no mouse)

**Test**: Tab reaches search input; Enter/blur triggers search; focus ring visible; no mouse required

---

### T012 [P] Implement keyboard-accessible filter buttons

**Window**: 3 (UI Components)  
**Phase**: Accessibility Implementation  
**Traceability**: NFR-002, SC-007  
**Dependencies**: T009 (FilterBar), T010 (page logic)  

**Description**: Ensure filter buttons are fully keyboard accessible. Tab navigates, Space/Enter toggles, active state is visually clear and semantically accessible (NFR-002 enhanced).

**What to do**:
- In FilterBar component (T009) HTML/JSX:
  - Filter buttons must include `aria-pressed` attribute:
    - `aria-pressed="true"` when filter is active
    - `aria-pressed="false"` when filter is inactive
  - Example: `<button type="button" aria-pressed={activeFilters.age.includes('U12')} ...>`
- In vanilla JS module:
  - Verify filter buttons are focusable (use `<button>`, not `<div>`)
  - Listen to filter button clicks and keyboard events:
    - On `click`: toggle filter, update aria-pressed
    - On `keydown` Space: prevent default, toggle filter, update aria-pressed
    - On `keydown` Enter: toggle filter, update aria-pressed
  - Verify active state is visually distinct:
    - CSS class `is-active` applies:
      - Background color change
      - Border/underline
      - Text or icon indicator
  - Ensure focus ring visible:
    - Tailwind `focus-visible:ring-2`

**Test**: Tab reaches each filter button; Space toggles active state; Enter toggles; active state visually clear; focus ring visible; screen reader announces "pressed" or "not pressed" based on aria-pressed state

---

### T013 [P] Add aria-live result count announcements

**Window**: 3 (UI Components)  
**Phase**: Accessibility Implementation  
**Traceability**: NFR-005, SC-007  
**Dependencies**: T009 (FilterBar), T010 (page logic)  

**Description**: Update the aria-live region to announce result count whenever filters/search change.

**What to do**:
- In FilterBar component (T009), ensure aria-live region is present:
  ```html
  <div aria-live="polite" aria-atomic="true" class="sr-only">
    Results: {resultCount} resources found
  </div>
  ```
  (Use `.sr-only` to hide visually but keep for screen readers)
- In page logic (T010), update aria-live text whenever results change:
  ```typescript
  function updateResultCount(count: number) {
    const liveRegion = document.querySelector('[aria-live]');
    liveRegion.textContent = `Results: ${count} resources found`;
  }
  ```

**Test**: Screen reader (NVDA/VoiceOver) announces "Results: X resources found" when filters change

---

[WINDOW_CHECKPOINT_3]

**Before proceeding to Window 4**:
- [ ] T009: FilterBar component renders with search, filters, clear button
- [ ] T010: Page logic applies filters and search; AND-logic works
- [ ] T011: Search input keyboard accessible (Tab, Enter, blur)
- [ ] T012: Filter buttons keyboard accessible (Tab, Space, Enter)
- [ ] T013: aria-live announces result count on filter/search change
- [ ] Browser manual test: filters work, search works, AND-logic verified
- [ ] No console errors
- [ ] Can proceed to Window 4

If all checkpoints pass, proceed to Window 4.  
If any checkpoint fails, debug and fix within Window 3 (do NOT proceed).

---

## Execution Window 4: Testing, Responsive Design, Documentation, & Polish

**Purpose**: Final validation through integration tests, responsive testing, keyboard accessibility verification, and documentation updates.

**Token Budget**: 50–70k

**Checkpoint Validation**:
- [ ] Integration tests pass (filter + search flows)
- [ ] Responsive testing passes (375px, 768px, 1440px viewports)
- [ ] Keyboard navigation fully verified
- [ ] Screen reader compatible
- [ ] No console errors
- [ ] Documentation updated
- [ ] Feature ready for merge

---

### T014 [P] Create integration tests for filter and search flows

**Window**: 4 (Testing)  
**Phase**: Integration Tests  
**Traceability**: FR-003, FR-004, FR-005, FR-007, FR-008, FR-009, SC-001, SC-002, SC-003, SC-006  
**Dependencies**: T010 (page logic), T011–T013 (accessibility)  

**Description**: Write integration tests (Vitest + testing-library or similar) to verify filter and search flows work end-to-end on the Resources page.

**What to create**:
- File: `src/__tests__/pages/resources.integration.test.ts` (or `.astro.test.ts` if testing Astro components)
- Tests:
  ```typescript
  describe('Resources page filtering and search', () => {
    it('applies AND-logic filter: U12 + Defence', async () => {
      // Render coaching resources section
      // Click U12 button, then Defence button
      // Verify only resources with both tags display
      // Verify resources with only one tag are hidden
    });

    it('combines search and filter with AND-logic', async () => {
      // Render coaching resources
      // Type "press" in search
      // Click "U12" filter
      // Verify results match both search AND filter
    });

    it('updates results immediately when removing filter', async () => {
      // Apply multiple filters
      // Click one filter to deactivate
      // Verify results update without page reload
    });

    it('displays no-results message when no matches', async () => {
      // Apply filter that matches no resources
      // Verify "No results found" message appears
    });

    it('clears filters and restores full list', async () => {
      // Apply filters
      // Click "Clear all filters"
      // Verify all resources in section are displayed
    });

    it('searches by keyword in title and description', async () => {
      // Type keyword in search
      // Verify results contain keyword in title or description
    });

    it('hides resources without matching tag when filter active', async () => {
      // Create scenario with resource missing age tag
      // Apply age filter
      // Verify resource is hidden
    });

    it('displays resources with only title and type', async () => {
      // Create resource with minimal metadata
      // Render section with no filters
      // Verify resource displays
    });
  });
  ```

**Test Status**: All integration tests must PASS

---

### T015 [P] Responsive design testing (375px, 768px, 1440px)

**Window**: 4 (Testing)  
**Phase**: Responsive Testing  
**Traceability**: NFR-003, SC-008  
**Dependencies**: T009 (FilterBar), T010 (page logic)  

**Description**: Manually test Resources page on three viewport sizes to verify filter bar remains usable, no horizontal scroll, and layout adapts.

**What to test**:
- Viewport: 375px (mobile, iPhone SE)
  - Filter bar visible
  - Buttons wrap to multiple lines if needed
  - No horizontal scroll required
  - Search input full width or wrapped
  - Resource grid displays single column
  
- Viewport: 768px (tablet)
  - Filter bar wraps if space constrained
  - Filters remain accessible
  - Grid displays 2–3 columns
  
- Viewport: 1440px (desktop)
  - All filters on one row if space allows
  - Grid displays 4+ columns
  - Filter bar sticky (if implemented)

**Test Status**: Manual browser testing; document any layout issues and fix in code

---

### T016 [P] Keyboard navigation and accessibility verification

**Window**: 4 (Testing)  
**Phase**: Accessibility Testing  
**Traceability**: NFR-001, NFR-002, NFR-005, SC-007  
**Dependencies**: T011–T013 (accessibility features)  

**Description**: Comprehensive keyboard-only testing without mouse. Verify Tab order, Space/Enter for toggles, screen reader announcements.

**What to test**:
- Tab navigation:
  - Tab reaches search input
  - Tab reaches all filter buttons (in logical order)
  - Tab reaches clear button
  - Tab order is logical (left-to-right, top-to-bottom)
  
- Search input:
  - Type keyword
  - Press Tab (blur event): search executes
  - Type keyword
  - Press Enter: search executes
  
- Filter buttons:
  - Tab to filter button
  - Press Space: toggles active state
  - Press Enter: toggles active state
  - Active state visually changes
  - Results update
  
- Clear button:
  - Tab to clear button
  - Press Space or Enter: resets all filters
  - Results restore to full list
  
- Screen reader (NVDA on Windows, VoiceOver on Mac):
  - Search input label announced
  - Filter buttons labels/values announced
  - Result count announced when filters change
  - No results message announced

**Test Status**: Manual keyboard testing; document any issues and fix in code

---

### T017 Update quickstart.md with manual test steps

**Window**: 4 (Testing)  
**Phase**: Documentation  
**Traceability**: FR-001–FR-018, NFR-001–NFR-008, SC-001–SC-009  
**Dependencies**: All prior tasks  

**Description**: Document manual test scenarios in quickstart guide for QA and stakeholders.

**What to create/update**:
- File: `specs/coa-43-resources-update/quickstart.md`
- Add sections:
  - **Setup**: How to run the site locally
  - **Test Scenario 1: AND-logic Filtering**
    - Navigate to Coaching Resources tab
    - Click "U12" filter
    - Click "Defence" filter
    - Expected: Only resources with both Age=U12 AND Category=Defence display
  - **Test Scenario 2: Keyword Search**
    - Type "press" in search box
    - Expected: Only resources with "press" in title/description display
  - **Test Scenario 3: Combining Search and Filter**
    - Apply "U12" filter
    - Type "press" in search
    - Expected: Only resources matching both U12 AND "press" display
  - **Test Scenario 4: Unfiltered Sections**
    - Navigate to Guides tab
    - Expected: No filters visible; resources sorted alphabetically
  - **Test Scenario 5: Incomplete Metadata**
    - Create a test resource with only title and type
    - Verify it displays in Guides (unfiltered)
    - Verify it hides when age filter active in Coaching Resources
  - **Test Scenario 6: Keyboard Navigation**
    - Tab to search input
    - Type "defence", press Tab
    - Tab through filter buttons, press Space to toggle
    - Tab to clear button, press Enter
    - Expected: All keyboard interactions work without mouse
  - **Test Scenario 7: Responsive**
    - Resize browser to 375px, 768px, 1440px
    - Verify filter bar usable at all sizes
  - **Test Scenario 8: No Results**
    - Apply filter that matches no resources
    - Expected: "No results found" message with clear button
  - **Test Scenario 9: Screen Reader**
    - Use NVDA or VoiceOver
    - Navigate filters and search
    - Expected: Result count announced

**Test Status**: Document is ready for QA handoff

---

### T018 Update data-model.md with schema and examples

**Window**: 4 (Testing)  
**Phase**: Documentation  
**Traceability**: FR-001, FR-015, NFR-007  
**Dependencies**: T001 (types), T002–T004 (data)  

**Description**: Document the Resource JSON schema and provide clear examples for coaches adding resources post-launch.

**What to create/update**:
- File: `specs/coa-43-resources-update/data-model.md`
- Sections:
  - **Resource Interface** (TypeScript):
    ```typescript
    interface Resource {
      id: string;
      title: string;
      description?: string;
      section: 'coaching_resources' | 'player_resources' | 'manager' | 'guides' | 'forms';
      type: 'youtube_link' | 'image_png' | 'image_jpeg' | 'gif' | 'pdf' | 'external_link';
      url?: string;
      fileRef?: string;
      tags?: {
        age?: string[];
        category?: string[];
        skill?: string[];
      };
      createdAt: string; // ISO 8601
      updatedAt: string; // ISO 8601
    }
    ```
  - **Supported Sections**: coaching_resources, player_resources, manager, guides, forms
  - **Supported Types**: youtube_link (embedded), image_png/image_jpeg/gif (embedded), pdf (embedded or download), external_link (clickable)
  - **Age Groups**: ['U8', 'U10', 'U12', 'U14', 'U16+']
  - **Categories by Section**:
    - Coaching: Defence, Drills, Offence, Plays, Tools
    - Player: Solo, Group, Offence, Defence, Drill
    - Manager: (custom, optional)
    - Guides: (custom, optional)
    - Forms: (custom, optional)
  - **Skills**: Dynamic per section; all unique skill tags used as filter options
  - **Examples**:
    ```json
    {
      "id": "coaching-050",
      "title": "Full Court Press Drills",
      "type": "pdf",
      "fileRef": "assets/coaching/full-court-press-drills.pdf",
      "description": "Step-by-step drills for teaching full-court press coverage.",
      "section": "coaching_resources",
      "tags": {
        "age": ["U14", "U16+"],
        "category": ["Defence", "Drills"],
        "skill": ["Positioning", "Communication"]
      },
      "createdAt": "2026-04-18T10:00:00Z",
      "updatedAt": "2026-04-18T10:00:00Z"
    }
    ```

**Test Status**: Documentation is clear and examples are accurate

---

### T019 Code cleanup, linting, and final validation

**Window**: 4 (Testing)  
**Phase**: Polish  
**Traceability**: FR-001–FR-018, NFR-001–NFR-008, SC-001–SC-009  
**Dependencies**: All prior tasks  

**Description**: Clean up code, run linter, ensure no console errors, remove debug logs, verify TypeScript compilation.

**What to do**:
- Remove any console.log, console.error, debug comments from:
  - `src/lib/resources/filters.ts`
  - `src/lib/resources/skills.ts`
  - `src/pages/resources/index.astro` (client script)
  - `src/components/FilterBar.astro`
  
- Run linter:
  ```bash
  npm run lint -- --fix
  ```
  
- Run TypeScript check:
  ```bash
  npx tsc --noEmit
  ```
  
- Run all tests:
  ```bash
  npm test
  ```
  
- Check browser console (F12 DevTools) for any errors/warnings during:
  - Page load
  - Filter application
  - Search input
  - Clear filters
  
- Verify no hardcoded breakpoints or pixel values in responsive styles (use Tailwind breakpoints)

**Test Status**: All linting, TypeScript, tests pass; browser console clean

---

[WINDOW_CHECKPOINT_4]

**Feature Complete**:
- [ ] T014: Integration tests pass
- [ ] T015: Responsive design verified at 375px, 768px, 1440px
- [ ] T016: Keyboard navigation fully verified (Tab, Space, Enter)
- [ ] T017: Quickstart documentation complete and accurate
- [ ] T018: Data-model documentation complete with examples
- [ ] T019: Code cleanup, linting, tests all pass
- [ ] No console errors
- [ ] All acceptance criteria met
- [ ] Ready for merge to main

---

## Summary

**Total Execution Windows**: 4  
**Estimated Tokens**:
- Window 1 (Foundation): 60–80k
- Window 2 (Filter Logic): 70–90k
- Window 3 (UI & Interactivity): 80–100k
- Window 4 (Testing & Polish): 50–70k
- **Total**: 260–340k tokens

**Savings**: By isolating into execution windows, we avoid context bloat and maintain clear hand-off points. Each window can be executed in a fresh 200k context.

**Implementation Strategy**: 
- Each window executed in fresh context (implement agent `/clear`s between windows)
- Window checkpoints block progression (must pass before next window)
- STATE.md tracks checkpoint progress
- Test-first discipline (tests fail before implementation, pass after)
- Accessibility-first (keyboard, screen reader testing in every window)
- Clear traceability to spec (every task traces to FR/SC/US)

---

## Key Rules

### Rule 1: One Window = One Fresh Context
- Implement agent clears context between windows
- Each window starts with clean 200k tokens
- Only checkpoint results carry forward via STATE.md

### Rule 2: Checkpoints Gate Progression
- Each window has explicit validation checklist
- MUST pass before proceeding
- If checkpoint fails, stay in window and fix (do NOT skip ahead)

### Rule 3: Test-First Within Each Window
- Tests written FIRST in every task (or alongside implementation)
- Tests must FAIL before implementation is "done"
- Tests must PASS after implementation
- Before window checkpoint, all tests passing

### Rule 4: Traceability Every Task
- Every task maps back to spec (FR-XXX, SC-XXX, US-X)
- Every functional and non-functional requirement has a task
- No orphaned work

### Rule 5: Window Independence
- Later windows depend on earlier windows' checkpoints, not conversation history
- Implement agent reads STATE.md, not chat memory
- Can restart any window without losing prior work

---

## Checklist Before Implement Phase

- [x] All 4 windows created and sequenced
- [x] Tasks logically organized within windows (2–3 tasks per window, max 3)
- [x] Dependencies documented (T001 → T002–T004 → T005, etc.)
- [x] Parallel opportunities marked [P]
- [x] Traceability to spec established (every task → FR/SC/US)
- [x] Test-first tasks present (T008, T014, T016)
- [x] Checkpoints clearly defined (what validates completion?)
- [x] Token budgets estimated per window
- [x] Ready for implement agent with Option C window management

---

## Next Steps

1. **Review Tasks**: Confirm window sequencing and checkpoint definitions
2. **Implement Phase**: Launch implement agent
   - Implement agent will manage windows, `/clear` between them, track STATE.md
   - Each window is a focused implementation context
   - No window can proceed until prior checkpoint passes

