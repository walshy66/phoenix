# Tasks: COA-18 Teams Page

**Spec**: `specs/coa-18-teams-page/spec.md`
**Plan**: `specs/coa-18-teams-page/plan.md`
**Strategy**: Option C — Execution Windows (fresh context per window)
**Windows**: 6 total (W1–W3 = P1 listing; W4–W5 = P2 detail pages; W6 = P3 modal)

---

## Format Guide

- **[P]**: Can run in parallel within the same window (different files, no shared writes)
- **Window N**: Execution context boundary — implement agent starts a fresh 200k context
- **WINDOW_CHECKPOINT**: Validation gate before the next window may begin
- **Traceability**: Each task maps back to a spec requirement (FR-XXX, NFR-XXX, AC-N)
- **Dependency**: Prior task or window checkpoint that must be satisfied first

---

## Execution Window 1: Foundation — Data File and TeamTile Component

**Purpose**: Create the committed static data file and the reusable tile component. Everything else in P1 depends on these two files existing and being correct.

**Fresh context files to read at window start**:
- `specs/coa-18-teams-page/spec.md`
- `specs/coa-18-teams-page/plan.md`
- `src/components/SeasonTile.astro` (pattern reference)
- `src/components/ScoreCard.astro` (pattern reference)

**Token Budget**: 50–70k

**Checkpoint Validation**:
- [ ] `src/data/teams/teams.json` exists and is valid JSON
- [ ] JSON contains at least 8 teams spread across all five age groups (u10s, u12s, u14s, u16s, u18s)
- [ ] JSON includes both Boys and Girls entries, multiple game nights, multiple divisions
- [ ] Every team entry has: id, slug, name, gradeName, ageGroup, gender, gameNight, division, staff, training
- [ ] At least one team has null gender (to test TBC pill)
- [ ] At least one team has null division (to test TBC pill)
- [ ] `src/components/TeamTile.astro` exists and renders correctly in isolation
- [ ] TeamTile renders all three pills; null values show "TBC"
- [ ] TeamTile root element is an `<a>` with href="/teams/{slug}"
- [ ] data-age-group, data-gender, data-game-night, data-division attributes present on root element

---

### T001 Create `src/data/teams/teams.json` with placeholder team data

**Window**: 1 (Foundation)
**Phase**: Data
**Traceability**: FR-001, FR-002, FR-003, FR-004, AC-1, AC-2
**Dependencies**: None
**Description**: Create the committed static data file that is the single source of truth for P1 placeholder data and the permanent home for manually maintained staff and training fields.

**What to create**:
- File: `src/data/teams/teams.json`
- Create the `src/data/teams/` directory if it does not exist
- Include exactly 10 placeholder team objects covering:
  - All five age groups: u10s, u12s, u14s, u16s, u18s (at least one team per group; two groups should have two teams to test alphabetical sort)
  - Both genders: Boys and Girls
  - At least three distinct game nights (e.g., Monday, Wednesday, Friday)
  - At least three distinct divisions (e.g., DIV 1, DIV 2, DIV 3)
  - At least one team where gender is null (pill must show "TBC")
  - At least one team where division is null (pill must show "TBC")
- Each team object must have all fields from the plan's data structure:
  - id (string, e.g., "placeholder-u10s-gold")
  - slug (string, URL-safe, e.g., "phoenix-u10s-gold")
  - name (string, e.g., "Phoenix U10s Gold")
  - gradeName (string matching the parsing rules, e.g., "Saturday U10 Boys 1")
  - ageGroup (string: "u10s" | "u12s" | "u14s" | "u16s" | "u18s")
  - gender (string "Boys" | "Girls" | null)
  - gameNight (string day name | null)
  - division (string "DIV N" | null)
  - staff (array of { name, role } objects; at least two teams should have staff, at least one team should have empty array)
  - training (object { venue, day, time } | null; at least one team should have null)

**Slug format**: `phoenix-{team-name-lowercased-hyphenated}-{agegroup}-{gender-lowercased}-{division-lowercased-hyphenated}` per plan. Where gender or division is null, omit that segment.

**Test**: Open the file, confirm it is valid JSON, count team objects, verify field shapes manually.

---

### T002 Create `src/components/TeamTile.astro`

**Window**: 1 (Foundation)
**Phase**: Component
**Traceability**: FR-003, FR-004, FR-008, NFR-001, NFR-005, NFR-006, NFR-008, NFR-011, AC-2, AC-6
**Dependencies**: T001 (data shape defined by teams.json — confirm field names match)
**Description**: Create the reusable team tile component. This is an anchor element wrapping a card, consistent with the SeasonTile.astro and ScoreCard.astro visual pattern.

**What to create**:
- File: `src/components/TeamTile.astro`
- Props interface: `{ team: TeamEntry }` where TeamEntry matches the teams.json shape
- Root element: `<a href={`/teams/${team.slug}`} ...>` — native anchor, keyboard accessible without role="button"
- Data attributes on root `<a>`:
  - `data-age-group={team.ageGroup}`
  - `data-gender={team.gender ?? ''}`
  - `data-game-night={team.gameNight ?? ''}`
  - `data-division={team.division ?? ''}`
  - `class="team-tile"` (JS filter hook)
- Focus indicator: `focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2`
- Minimum height: `min-h-[44px]` (NFR-005 tap target)
- Card body:
  - Team name as `<p>` or `<span>` styled as heading (NOT h3 — age group sections use h2, tile name is not a heading level)
  - Three pill elements in a flex row:
    - Division pill: `bg-brand-purple text-white` | TBC state: `bg-gray-200 text-gray-500`
    - Game Night pill: `bg-brand-gold text-white` | TBC state: `bg-gray-200 text-gray-500`
    - Boys/Girls pill: Boys = `bg-gray-700 text-white`, Girls = `bg-purple-200 text-brand-purple` | TBC: `bg-gray-200 text-gray-500`
  - Each pill shows its value or "TBC" when the value is null (FR-004)
- Styling: consistent with SeasonTile.astro — card with border, rounded corners, hover state, white background or brand-purple background per existing pattern
- WCAG AA contrast: verify pill text/background combinations visually before marking complete (NFR-006)

**Test**:
- Render TeamTile with a complete team object: confirm three pills show correct values
- Render TeamTile with gender=null: confirm Boys/Girls pill shows "TBC"
- Render TeamTile with division=null: confirm Division pill shows "TBC"
- Inspect HTML: confirm root is `<a>`, data attributes are present, class="team-tile" is present

---

[WINDOW_CHECKPOINT_1]

**Before proceeding to Window 2, verify**:
- [ ] T001: `src/data/teams/teams.json` is valid JSON with 10 well-formed entries
- [ ] T002: `src/components/TeamTile.astro` exists with correct data attributes, anchor root, and TBC pill logic
- [ ] No console errors when either file is used in the Astro build

---

## Execution Window 2: Teams Listing Page — Structure and Layout

**Purpose**: Build `src/pages/teams.astro` — the main listing page. This window covers the static page structure: hero, age-group sections, grid rendering, and data loading. Filter interactivity is in Window 3.

**Fresh context files to read at window start**:
- `specs/coa-18-teams-page/spec.md`
- `specs/coa-18-teams-page/plan.md`
- `src/data/teams/teams.json` (just created)
- `src/components/TeamTile.astro` (just created)
- `src/pages/scores.astro` (hero and data-loading pattern reference)
- `src/pages/team.astro` (filter bar pattern reference, first 80 lines)

**Token Budget**: 60–80k

**Checkpoint Validation**:
- [ ] `/teams` page loads without errors
- [ ] Hero section renders with purple background, "Teams" heading, gold divider (matches scores.astro pattern)
- [ ] Age group sections appear in order: u10s → u12s → u14s → u16s → u18s
- [ ] Each age group section has an `<h2>` heading (NFR-007)
- [ ] Teams within each section are sorted alphabetically by name (FR-002)
- [ ] All 10 placeholder tiles render with correct pills
- [ ] Tiles use a responsive CSS grid: 1-col mobile, 2-col 640px+, 3-col 1024px+ (NFR-008)
- [ ] Page renders inside BaseLayout (NFR-012)
- [ ] Filter bar is present in the DOM (even if not yet wired up — JS added in Window 3)

---

### T003 Create `src/pages/teams.astro` — data loading, grouping, sorting, and page structure

**Window**: 2 (Listing Page Structure)
**Phase**: Page (Astro frontmatter + HTML structure)
**Traceability**: FR-001, FR-002, FR-005, FR-017, NFR-007, NFR-008, NFR-012, NFR-013, AC-1, AC-14, AC-15
**Dependencies**: Window 1 checkpoint passed (teams.json and TeamTile.astro exist)
**Description**: Create the full teams listing page. This task covers everything except the filter interactivity JS (added in Window 3).

**What to create**:
- File: `src/pages/teams.astro`

**Frontmatter (---) section**:
```
import BaseLayout from '../layouts/BaseLayout.astro';
import TeamTile from '../components/TeamTile.astro';
import teamsData from '../data/teams/teams.json';

// Fallback if import somehow fails
const allTeams = teamsData?.teams ?? [];

// Group by ageGroup in canonical order
const AGE_GROUP_ORDER = ['u10s', 'u12s', 'u14s', 'u16s', 'u18s'];
const grouped = {};
for (const ag of AGE_GROUP_ORDER) grouped[ag] = [];
grouped['other'] = [];

for (const team of allTeams) {
  const key = AGE_GROUP_ORDER.includes(team.ageGroup) ? team.ageGroup : 'other';
  grouped[key].push(team);
}

// Sort alphabetically within each group (FR-002)
for (const key of Object.keys(grouped)) {
  grouped[key].sort((a, b) => a.name.localeCompare(b.name));
}

// Derive unique filter values from data (for filter bar buttons)
const gameNights = [...new Set(allTeams.map(t => t.gameNight).filter(Boolean))].sort();
const divisions = [...new Set(allTeams.map(t => t.division).filter(Boolean))].sort();
```

**Page structure**:
1. `<BaseLayout title="Teams" description="...">`
2. Hero section — matches `team.astro` pattern:
   - `bg-brand-purple py-16 px-4 text-center relative overflow-hidden`
   - Decorative circle div (opacity-10)
   - "Bendigo Phoenix Juniors" in gold, small caps
   - `<h1>` "TEAMS" — white, uppercase, font-black
   - Gold divider `h-1 w-16 bg-brand-gold mx-auto mt-4`
   - Sub-headline in purple-200
3. Filter bar — `sticky top-16 z-40 bg-white border-b border-gray-200` (NFR-013):
   - Horizontally scrollable container: `overflow-x-auto` (NFR-009)
   - Inner flex row: `flex gap-2 px-4 py-3 min-w-max`
   - Buttons: "All", "Boys", "Girls", then one per age group in order, then one per gameNight, then one per division
   - Button base classes: `px-4 py-2 rounded-full text-sm font-semibold border transition-colors min-h-[44px]` (NFR-005)
   - Active state classes (applied by JS in Window 3): `bg-brand-purple text-white border-brand-purple`
   - Inactive state classes: `bg-white text-gray-700 border-gray-300 hover:border-brand-purple`
   - Each button: `data-filter-type` ("all" | "gender" | "ageGroup" | "gameNight" | "division"), `data-filter-value`, `aria-pressed="false"`
   - "All" button: `data-filter-type="all"` `data-filter-value="all"` `aria-pressed="true"` (default active)
4. Main content area — `max-w-6xl mx-auto px-4 py-8`
5. For each age group in AGE_GROUP_ORDER (skip if empty, also render "Other" if non-empty):
   - Section element: `<section class="age-group-section mb-10" data-age-group="{ag}">`
   - `<h2>` heading: uppercase age group label (e.g., "U10s"), `text-2xl font-black text-brand-purple mb-4`
   - CSS grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`
   - `<TeamTile team={team} />` for each team in the group
6. "No teams match this filter" message — hidden by default:
   - `<div id="no-results" class="hidden text-center py-16">`
   - Message text: "No teams match this filter."
   - "Clear filter" button: `id="clear-filter-btn"`, same pill styling as filter buttons

**Test**:
- Run `npm run dev` (or `npm run build`), open `/teams`
- Confirm page loads inside BaseLayout (check nav, footer present)
- Confirm hero renders with purple background and gold divider
- Confirm u10s section appears before u12s, u12s before u14s, etc.
- Confirm each section has an h2 heading
- Confirm teams within each section are in alphabetical order
- Confirm all 10 tiles render with pills
- Resize to 320px: confirm 1-column grid
- Resize to 640px: confirm 2-column grid
- Resize to 1024px: confirm 3-column grid
- Confirm filter bar is horizontally scrollable on narrow viewport (no wrapping, no clipping)

---

[WINDOW_CHECKPOINT_2]

**Before proceeding to Window 3, verify**:
- [ ] T003: `/teams` page loads, no build errors, no console errors
- [ ] All 10 placeholder tiles visible, grouped and sorted correctly
- [ ] Hero and filter bar render; filter bar scrolls horizontally on mobile
- [ ] Page passes visual check at 320px, 640px, 1024px, 1440px

---

## Execution Window 3: Filter Interactivity and Accessibility

**Purpose**: Wire up the client-side filter JavaScript, sessionStorage persistence, "no results" state, and all keyboard/ARIA accessibility requirements for the filter bar. This window also validates the full P1 acceptance criteria end-to-end.

**Fresh context files to read at window start**:
- `specs/coa-18-teams-page/spec.md` (User Stories 1–4, all AC, NFR-001 through NFR-009)
- `specs/coa-18-teams-page/plan.md` (Filter JS logic section)
- `src/pages/teams.astro` (just created — read it fully before touching it)

**Token Budget**: 60–80k

**Checkpoint Validation**:
- [ ] Clicking "Boys" hides all girls' tiles; age group sections with no visible tiles are hidden
- [ ] Clicking "Girls" shows only girls' tiles
- [ ] Clicking "All" restores all tiles and all age group sections
- [ ] Selecting a specific age group (e.g., u14s) shows only u14s tiles
- [ ] Selecting a game night shows only matching tiles
- [ ] Selecting a division shows only matching tiles
- [ ] When filter produces zero results, "No teams match this filter" message appears with "Clear filter" button
- [ ] Clicking "Clear filter" resets to "All"
- [ ] Filter state is saved to sessionStorage on each change
- [ ] On page reload with saved sessionStorage state, the correct filter is restored
- [ ] Tab to filter bar, press Enter on "Girls": filter activates, focus stays in filter bar
- [ ] Active filter button has aria-pressed="true"; others have aria-pressed="false"
- [ ] Clicking a team tile navigates to `/teams/{slug}` (will 404 until P2 — that is acceptable)
- [ ] Navigate back from a detail page (or any page): filter is still applied

---

### T004 Add filter interactivity `<script>` block to `src/pages/teams.astro`

**Window**: 3 (Filter Interactivity)
**Phase**: Client-side JS
**Traceability**: FR-005, FR-006, FR-007, FR-009, NFR-002, NFR-003, NFR-018, AC-3, AC-4, AC-5, AC-7, AC-12, AC-13
**Dependencies**: Window 2 checkpoint passed (teams.astro exists with correct data attributes)
**Description**: Add a `<script>` block inside `teams.astro` implementing all filter logic. No external JS file — inline script to keep it co-located with the page markup.

**What to add** (inside the HTML section of teams.astro, before `</BaseLayout>`):

```html
<script>
  // --- State ---
  const STORAGE_KEY = 'teams-filter';
  let activeFilter = { type: 'all', value: 'all' };

  // --- Element references ---
  const filterButtons = document.querySelectorAll('[data-filter-type]');
  const tiles = document.querySelectorAll('.team-tile');
  const sections = document.querySelectorAll('.age-group-section');
  const noResults = document.getElementById('no-results');
  const clearBtn = document.getElementById('clear-filter-btn');

  // --- Apply filter ---
  function applyFilter(type, value) {
    activeFilter = { type, value };

    // 1. Update aria-pressed and active styles on buttons
    filterButtons.forEach(btn => {
      const isActive = btn.dataset.filterType === type && btn.dataset.filterValue === value;
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      btn.classList.toggle('bg-brand-purple', isActive);
      btn.classList.toggle('text-white', isActive);
      btn.classList.toggle('border-brand-purple', isActive);
      btn.classList.toggle('bg-white', !isActive);
      btn.classList.toggle('text-gray-700', !isActive);
      btn.classList.toggle('border-gray-300', !isActive);
    });

    // 2. Show/hide tiles
    tiles.forEach(tile => {
      let show = false;
      if (type === 'all') {
        show = true;
      } else if (type === 'gender') {
        show = tile.dataset.gender.toLowerCase() === value.toLowerCase();
      } else if (type === 'ageGroup') {
        show = tile.dataset.ageGroup === value;
      } else if (type === 'gameNight') {
        show = tile.dataset.gameNight === value;
      } else if (type === 'division') {
        show = tile.dataset.division === value;
      }
      tile.classList.toggle('hidden', !show);
    });

    // 3. Hide age group sections that have no visible tiles
    sections.forEach(section => {
      const visibleTiles = section.querySelectorAll('.team-tile:not(.hidden)');
      section.classList.toggle('hidden', visibleTiles.length === 0);
    });

    // 4. Show/hide "no results" message
    const anyVisible = [...tiles].some(t => !t.classList.contains('hidden'));
    noResults.classList.toggle('hidden', anyVisible);

    // 5. Persist to sessionStorage
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(activeFilter));
    } catch (e) {
      // sessionStorage unavailable — continue without persistence
    }
  }

  // --- Wire up filter buttons ---
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      applyFilter(btn.dataset.filterType, btn.dataset.filterValue);
    });
    // Keyboard: Enter and Space both activate (Space is default for button elements)
    // <button> elements handle this natively — no additional keydown listener needed
  });

  // --- Wire up "Clear filter" button ---
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      applyFilter('all', 'all');
    });
  }

  // --- Restore from sessionStorage on page load ---
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.type && parsed.value) {
        applyFilter(parsed.type, parsed.value);
        return; // applyFilter already ran
      }
    }
  } catch (e) {
    // Ignore parse errors — default to "All"
  }

  // Default: apply "all" filter (sets aria-pressed correctly on page load)
  applyFilter('all', 'all');
</script>
```

**Important implementation notes**:
- All filter buttons in teams.astro must be `<button>` elements (not `<a>` or `<div>`) so keyboard Enter/Space work natively (NFR-002)
- If the filter buttons were rendered as `<a>` in Window 2, change them to `<button type="button">` in this task
- The "Clear filter" button must also be a `<button type="button">`

**Test**:
- Open `/teams` in browser
- Click "Boys": verify only boys tiles visible, age group headers with no boys teams hidden
- Click "Girls": verify only girls tiles visible
- Click "All": verify all tiles and all headers restored
- Click a specific age group button: verify only matching tiles visible
- Click a game night button: verify only matching tiles visible
- Click a division that has no teams (if applicable): verify "No teams match this filter" message + "Clear filter" button appear
- Click "Clear filter": verify reset to all
- With "Girls" active, reload page: verify "Girls" filter is restored from sessionStorage
- Tab to the filter bar, press Enter on "Boys": verify filter activates; inspect aria-pressed attributes
- Confirm active button has aria-pressed="true", all others aria-pressed="false"
- Click any team tile: verify navigation to `/teams/{slug}` (will 404 until P2)
- Navigate back: verify filter is still applied

---

[WINDOW_CHECKPOINT_3: P1 COMPLETE]

**Before proceeding to Window 4 (P2), verify all P1 acceptance criteria**:
- [ ] AC-1: Age groups appear in correct order; teams alphabetical within each group
- [ ] AC-2: All three pills visible on tiles; "TBC" shown for null values
- [ ] AC-3: "Boys" filter shows only boys teams; empty age group headers hidden
- [ ] AC-4: "No teams match this filter" + "Clear filter" appear when results are zero
- [ ] AC-5: "All" restores all tiles and headers
- [ ] AC-6: Clicking a tile navigates to /teams/{slug}
- [ ] AC-7: Navigating back preserves active filter
- [ ] AC-12 (keyboard): Tab to filter, Enter activates, aria-pressed updates
- [ ] AC-13 (keyboard): Tab to filter bar, no colour-only communication of state
- [ ] AC-14: Single-column tiles at < 640px, horizontal filter bar scroll
- [ ] AC-15: BaseLayout wraps all content

**P1 is complete when all checkpoints above pass.**

---

## Execution Window 4: PlayHQ Scraper Script

**Purpose**: Build `scripts/scrape-teams.js`. This is an independent Node.js script — no Astro involvement. It fetches Phoenix team data from PlayHQ and writes `scripts/teams-data.json`.

**Fresh context files to read at window start**:
- `specs/coa-18-teams-page/plan.md` (scrape-teams.js section, data structures, grade name parsing, slug generation)
- `scripts/scrape-playhq.js` (read fully — copy apiFetch/fetchAllPages pattern, env var pattern, org/tenant constants)

**Token Budget**: 60–80k

**Checkpoint Validation**:
- [ ] `node scripts/scrape-teams.js` runs without crashing
- [ ] `scripts/teams-data.json` is written on success
- [ ] JSON contains a `teams` array and `lastUpdated` timestamp
- [ ] Each team entry has: id, gradeId, slug, name, gradeName, ageGroup, gender, gameNight, division, fixture (array), ladder (object or null)
- [ ] Grade name parsing is correct for at least 3 variants (verify against known grade names)
- [ ] Slug collision handling works (test by providing two teams with identical slugs)
- [ ] Script gracefully handles missing API key with the same error message pattern as scrape-playhq.js
- [ ] Script gracefully handles a 404 or empty response for a team's fixture/ladder

---

### T005 Create `scripts/scrape-teams.js`

**Window**: 4 (Scraper)
**Phase**: Node.js script
**Traceability**: FR-015, FR-016, FR-017, SC-004
**Dependencies**: Window 3 checkpoint passed (P1 complete); Window 4 is independent of P1 Astro files
**Description**: New Node.js scraper script following the established `scrape-playhq.js` pattern. Fetches all Phoenix teams from PlayHQ, derives metadata by parsing grade names, fetches fixture and ladder per team, writes `scripts/teams-data.json`.

**What to create**:
- File: `scripts/scrape-teams.js`

**Structure** (mirror scrape-playhq.js top-level pattern):
1. Imports: `fs`, `path`, `https` (or `node-fetch` if already used in scrape-playhq.js — match exactly)
2. Constants: copy `API_KEY`, `TENANT_ID`, `ORG_ID`, `BASE_URL`, `SEASON_IDS` from `scrape-playhq.js`
3. Helper functions copied from scrape-playhq.js (or imported if shared):
   - `apiFetch(path)` — makes authenticated GET request
   - `fetchAllPages(path, pageSize)` — paginates through all results
4. Grade name parsing function `parseGradeName(gradeName)`:
   - Input: raw PlayHQ grade name string (e.g., "Monday U14 Girls 4")
   - Output: `{ ageGroup, gender, gameNight, division }`
   - Rules from plan: day = first token if day-of-week; ageGroup = token matching /^U\d+$/i → lowercased + "s"; gender = "Boys"|"Girls" token (case-insensitive); division = last numeric token → "DIV N"
   - All four fields default to null if not found
   - Unknown ageGroup → "other" (not null)
5. Slug generation function `generateSlug(name, ageGroup, gender, division)`:
   - Lowercase name, replace non-alphanumeric with "-", collapse multiple "-"
   - Append ageGroup, gender (lowercased), division (lowercased, "div-N")
   - Trim leading/trailing "-"
   - Returns slug string (collision check in main loop)
6. Main async function:
   ```
   For each seasonId in SEASON_IDS:
     a. fetchAllPages('/v1/seasons/{seasonId}/teams?pageSize=100')
     b. Filter: team.name.toLowerCase().includes('phoenix')
     c. For each Phoenix team:
        - parse = parseGradeName(team.gradeName or team.grade?.name)
        - slug = generateSlug(team.name, ...) with collision check
        - fixture = await apiFetch('/v1/grades/{team.gradeId}/games')
          Normalise each game: { id, date, time, opponent, venue, homeOrAway, status, homeScore, awayScore }
          Wrap in try/catch; on error: fixture = []
        - ladder = await apiFetch('/v1/grades/{team.gradeId}/ladder')
          Find Phoenix row by name match
          Extract: { position, wins, losses, draws, pointsFor, pointsAgainst, points }
          Wrap in try/catch; on error: ladder = null
        - Push to teams array
   Write scripts/teams-data.json: { lastUpdated, teams }
   ```
7. Error handling:
   - Missing API key → `console.error('[scrape-teams] PLAYHQ_API_KEY not set'); process.exit(1);`
   - Individual team fixture/ladder fetch failure → `console.warn('[scrape-teams] Could not fetch fixture for team {id}:', err.message)` and continue
   - Final write failure → `console.error('[scrape-teams] Failed to write teams-data.json:', err); process.exit(1);`

**Test**:
- Run `node scripts/scrape-teams.js` with valid API key
- Confirm `scripts/teams-data.json` is created
- Inspect JSON: confirm `teams` array is non-empty, `lastUpdated` is an ISO timestamp
- Inspect at least 3 team entries: verify ageGroup, gender, gameNight, division are correctly parsed
- Inspect fixture array for one team: verify game objects have all required fields
- Inspect ladder for one team: verify position, wins, losses, etc. present
- Run without API key: confirm error message and non-zero exit code
- Temporarily break a fixture URL (edit script, restore after): confirm script continues and logs a warning, still writes output

---

[WINDOW_CHECKPOINT_4]

**Before proceeding to Window 5, verify**:
- [ ] T005: Script runs successfully and writes `scripts/teams-data.json`
- [ ] Grade name parsing correct for all fetched teams
- [ ] At least one team has fixture data; at least one has ladder data
- [ ] Script handles errors gracefully (missing key, bad fixture response)

---

## Execution Window 5: Team Detail Page

**Purpose**: Build `src/pages/teams/[slug].astro`. This page renders fixture, ladder, staff, and training for a single team. It also updates `src/pages/teams.astro` to load from `scripts/teams-data.json` with fallback to `src/data/teams/teams.json`.

**Fresh context files to read at window start**:
- `specs/coa-18-teams-page/spec.md` (User Stories 5–7, AC-8, AC-9, AC-10, AC-11, NFR-010, NFR-014, NFR-015, NFR-016)
- `specs/coa-18-teams-page/plan.md` (Phase 2 deliverables, error handling in [slug].astro)
- `scripts/teams-data.json` (inspect shape of actual generated data)
- `src/data/teams/teams.json` (staff and training source)
- `src/pages/scores.astro` (table and row highlighting pattern reference)
- `src/pages/teams.astro` (will be updated in this window)

**Token Budget**: 80–100k (larger due to two files and more complex layout)

**Checkpoint Validation**:
- [ ] `src/pages/teams/[slug].astro` exists and generates static paths from teams-data.json (or fallback)
- [ ] Navigating to `/teams/{slug}` for a real team loads correctly inside BaseLayout
- [ ] Fixture section renders with table columns: Date, Time, Opponent, Venue, Home/Away, Score
- [ ] Upcoming games show "—" in Score column; completed games show "Home – Away" score
- [ ] Empty fixture shows "No games scheduled" message (not blank)
- [ ] Ladder section renders with columns: Pos, W, L, D, PF, PA, Pts; Phoenix row highlighted
- [ ] Empty ladder shows "Ladder not yet available" message
- [ ] Staff section renders coach and manager names (no email, no phone); section absent if neither present
- [ ] Training section shows "Training: [Venue] · [Day] @ [Time]"; shows "No training scheduled" if no entry
- [ ] Deleting `scripts/teams-data.json` and rebuilding: listing page falls back to teams.json placeholder; detail pages show "Team details are temporarily unavailable" notice
- [ ] All null fields display "TBC" or "—", never blank or JS error
- [ ] Console logs structured warnings for missing fields (NFR-016)

---

### T006 [P] Update `src/pages/teams.astro` data loading to use `scripts/teams-data.json` with fallback

**Window**: 5 (Detail Pages)
**Phase**: Page update
**Traceability**: FR-015, FR-017, NFR-014, AC-11
**Dependencies**: Window 4 checkpoint passed (teams-data.json available); Window 3 checkpoint passed (teams.astro exists)
**Description**: Update the listing page's data-loading frontmatter to try `scripts/teams-data.json` first, fall back to `src/data/teams/teams.json`, and merge staff/training fields from the static file onto each team by ID match.

**What to modify** in `src/pages/teams.astro` frontmatter:

Replace the existing `import teamsData from ...` with:
```javascript
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import staticTeamsData from '../data/teams/teams.json';

let allTeams = [];
let usingPlaceholder = false;

try {
  const generatedPath = join(process.cwd(), 'scripts', 'teams-data.json');
  if (existsSync(generatedPath)) {
    const raw = readFileSync(generatedPath, 'utf-8');
    const generated = JSON.parse(raw);
    // Merge staff and training from static file by ID
    const staticById = Object.fromEntries((staticTeamsData.teams ?? []).map(t => [t.id, t]));
    allTeams = (generated.teams ?? []).map(team => ({
      ...team,
      staff: staticById[team.id]?.staff ?? [],
      training: staticById[team.id]?.training ?? null,
    }));
  } else {
    allTeams = staticTeamsData.teams ?? [];
    usingPlaceholder = true;
    console.warn('[teams.astro] teams-data.json not found; using placeholder data');
  }
} catch (e) {
  allTeams = staticTeamsData.teams ?? [];
  usingPlaceholder = true;
  console.warn('[teams.astro] Failed to load teams-data.json:', e.message);
}
```

The grouping/sorting logic below this block remains unchanged.

**Test**:
- With `scripts/teams-data.json` present: confirm listing page loads real team data
- Delete `scripts/teams-data.json`: confirm listing page falls back to placeholder data without error
- Confirm console.warn is logged when falling back

---

### T007 Create `src/pages/teams/[slug].astro` — team detail page

**Window**: 5 (Detail Pages)
**Phase**: Page (dynamic route)
**Traceability**: FR-010, FR-011, FR-012, FR-013, FR-017, NFR-010, NFR-014, NFR-015, NFR-016, AC-8, AC-9, AC-10, AC-11
**Dependencies**: Window 4 checkpoint passed; T006 complete (data loading pattern established)
**Description**: Create the dynamic team detail page. Uses `getStaticPaths()` to generate one route per team. Renders fixture table, ladder table, staff section, and training section — all with graceful empty and error states.

**What to create**:
- File: `src/pages/teams/[slug].astro`
- Create the `src/pages/teams/` directory if it does not exist

**Frontmatter**:
```javascript
import BaseLayout from '../../layouts/BaseLayout.astro';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import staticTeamsData from '../../data/teams/teams.json';

export async function getStaticPaths() {
  let teams = [];
  try {
    const generatedPath = join(process.cwd(), 'scripts', 'teams-data.json');
    if (existsSync(generatedPath)) {
      const raw = readFileSync(generatedPath, 'utf-8');
      const generated = JSON.parse(raw);
      const staticById = Object.fromEntries((staticTeamsData.teams ?? []).map(t => [t.id, t]));
      teams = (generated.teams ?? []).map(team => ({
        ...team,
        staff: staticById[team.id]?.staff ?? [],
        training: staticById[team.id]?.training ?? null,
      }));
    } else {
      teams = staticTeamsData.teams ?? [];
    }
  } catch (e) {
    teams = staticTeamsData.teams ?? [];
    console.warn('[teams/[slug].astro] Failed to load teams-data.json:', e.message);
  }

  return teams.map(team => ({
    params: { slug: team.slug },
    props: { team },
  }));
}

const { team } = Astro.props;
const hasFixture = team.fixture && team.fixture.length > 0;
const hasLadder = team.ladder != null;
const hasStaff = team.staff && team.staff.length > 0;
const hasTraining = team.training != null;
const coach = team.staff?.find(s => s.role === 'coach');
const manager = team.staff?.find(s => s.role === 'manager');
```

**Page HTML structure**:

1. `<BaseLayout title={team.name} description="...">`

2. Hero section (matches scores.astro / team.astro pattern):
   - Purple background, team name as h1, age group + pills row below

3. Main content: `<main class="max-w-5xl mx-auto px-4 py-8">`

4. Desktop two-column layout for fixture + ladder:
   `<div class="lg:grid lg:grid-cols-2 lg:gap-8">`

5. **Fixture section**:
   ```html
   <section class="mb-8">
     <h2 class="text-xl font-black text-brand-purple uppercase mb-4">Fixture</h2>
     {hasFixture ? (
       <div class="overflow-x-auto">
         <table class="w-full text-sm">
           <thead><tr>
             <th>Date</th><th>Time</th><th>Opponent</th><th>Venue</th><th>H/A</th><th>Score</th>
           </tr></thead>
           <tbody>
             {team.fixture.map(game => (
               <tr data-game-id={game.id}>
                 <td>{game.date ?? 'TBC'}</td>
                 <td>{game.time ?? 'TBC'}</td>
                 <td>{game.opponent ?? '—'}</td>
                 <td>{game.venue ?? '—'}</td>
                 <td>{game.homeOrAway ?? '—'}</td>
                 <td>
                   {game.status === 'completed' && game.homeScore != null && game.awayScore != null
                     ? `${game.homeScore} – ${game.awayScore}`
                     : '—'}
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     ) : (
       <p class="text-gray-500">No games scheduled.</p>
     )}
   </section>
   ```

6. **Ladder section**:
   ```html
   <section class="mb-8">
     <h2 class="text-xl font-black text-brand-purple uppercase mb-4">Ladder</h2>
     {hasLadder ? (
       <div class="overflow-x-auto">
         <table class="w-full text-sm">
           <thead><tr><th>Pos</th><th>W</th><th>L</th><th>D</th><th>PF</th><th>PA</th><th>Pts</th></tr></thead>
           <tbody>
             <tr class="border-l-4 border-l-brand-gold font-semibold">
               <td>{team.ladder.position}</td>
               <td>{team.ladder.wins}</td>
               <td>{team.ladder.losses}</td>
               <td>{team.ladder.draws}</td>
               <td>{team.ladder.pointsFor}</td>
               <td>{team.ladder.pointsAgainst}</td>
               <td>{team.ladder.points}</td>
             </tr>
           </tbody>
         </table>
       </div>
     ) : (
       <p class="text-gray-500">Ladder not yet available.</p>
     )}
   </section>
   ```

7. **Staff section** (rendered only if hasStaff):
   ```html
   {hasStaff && (
     <section class="mb-8">
       <h2 class="text-xl font-black text-brand-purple uppercase mb-4">Staff</h2>
       {coach && <p><span class="font-semibold">Coach:</span> {coach.name}</p>}
       {manager && <p><span class="font-semibold">Manager:</span> {manager.name}</p>}
     </section>
   )}
   ```

8. **Training section**:
   ```html
   <section class="mb-8">
     <h2 class="text-xl font-black text-brand-purple uppercase mb-4">Training</h2>
     {hasTraining
       ? <p>Training: {team.training.venue} · {team.training.day} @ {team.training.time}</p>
       : <p class="text-gray-500">No training scheduled.</p>
     }
   </section>
   ```

**Error handling**:
- If `teams-data.json` is absent at build time, `getStaticPaths` falls back to `teams.json` slugs; detail pages render with placeholder data and a notice banner at the top of main: `<div class="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">Team details are temporarily unavailable. Please check back soon.</div>` — shown only when `usingPlaceholder` is true.
- Console log for missing fields:
  ```javascript
  if (game.time == null) console.warn('[teams/[slug].astro] Missing field:', { field: 'time', teamId: team.id, reason: 'null from API' });
  ```

**Test**:
- Navigate to `/teams/{slug}` for a team with fixture and ladder: confirm both tables render correctly
- Confirm a completed game shows score; upcoming game shows "—"
- Confirm Phoenix row in ladder has gold left border
- Navigate to a team with staff: confirm coach and manager names appear, no email/phone visible
- Navigate to a team with no staff (empty staff array): confirm Staff section is not rendered at all
- Navigate to a team with no training: confirm "No training scheduled" message
- Delete `scripts/teams-data.json`, rebuild: confirm detail page shows "Team details are temporarily unavailable" notice
- Confirm all null fields show "TBC" or "—" — no blank cells, no JS errors
- Resize to 320px: confirm all sections stack vertically
- Resize to 1024px+: confirm fixture and ladder appear side by side

---

[WINDOW_CHECKPOINT_5: P2 COMPLETE]

**Before proceeding to Window 6 (P3), verify all P2 acceptance criteria**:
- [ ] AC-8: Fixture section shows date, opponent, venue for at least one game
- [ ] AC-9: Completed games show score in "Home – Away" format
- [ ] AC-10: Staff section shows coach and manager; absent entirely when neither is in data file
- [ ] AC-11: "Team details are temporarily unavailable" when data files are absent; no raw error output
- [ ] Detail pages render correctly at 320px and 1024px (NFR-010)
- [ ] teams.astro falls back to teams.json placeholder without errors

**P2 is complete when all checkpoints above pass.**

---

## Execution Window 6: Game Detail Modal (P3)

**Purpose**: Add the game detail modal to the team detail page. Clicking a game row opens a modal with full game details, accessible via keyboard, Escape, and outside click.

**Fresh context files to read at window start**:
- `specs/coa-18-teams-page/spec.md` (User Story 8, NFR-004, NFR-005, SC-006, AC from P3 section)
- `specs/coa-18-teams-page/plan.md` (Phase 3 deliverables, modal JS behaviour)
- `src/pages/teams/[slug].astro` (read fully — will be modified)
- `src/components/SeasonDetailModal.astro` (existing modal pattern reference)

**Token Budget**: 50–70k

**Checkpoint Validation**:
- [ ] Clicking a game row opens the modal within 200ms
- [ ] Modal displays: opponent, date, time, venue, home/away status
- [ ] Modal shows score for completed games; omits score row for upcoming games
- [ ] Escape key closes modal and returns focus to the game row that opened it
- [ ] Clicking outside the modal panel (on overlay) closes modal and returns focus
- [ ] Tabbing within modal: focus is trapped (does not escape to page behind)
- [ ] On mobile (< 640px): modal occupies full viewport height and is scrollable

---

### T008 [P] Create `src/components/GameModal.astro`

**Window**: 6 (Modal)
**Phase**: Component
**Traceability**: FR-014, NFR-004, NFR-005, SC-006
**Dependencies**: Window 5 checkpoint passed (detail page exists)
**Description**: Create the game detail modal component. Hidden by default. Populated via JS from data attributes on the game row that triggered it.

**What to create**:
- File: `src/components/GameModal.astro`
- Markup (hidden by default, shown by JS):
  ```html
  <!-- Overlay -->
  <div id="game-modal-overlay"
       class="hidden fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
       role="dialog"
       aria-modal="true"
       aria-labelledby="modal-title">

    <!-- Panel -->
    <div id="game-modal-panel"
         class="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-screen overflow-y-auto">

      <div class="flex justify-between items-start mb-4">
        <h2 id="modal-title" class="text-xl font-black text-brand-purple uppercase"></h2>
        <button id="modal-close-btn"
                class="text-gray-500 hover:text-gray-900 text-2xl leading-none min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close game details">
          &times;
        </button>
      </div>

      <dl class="space-y-2 text-sm">
        <div class="flex gap-2"><dt class="font-semibold w-24 flex-shrink-0">Date</dt><dd id="modal-date"></dd></div>
        <div class="flex gap-2"><dt class="font-semibold w-24 flex-shrink-0">Time</dt><dd id="modal-time"></dd></div>
        <div class="flex gap-2"><dt class="font-semibold w-24 flex-shrink-0">Opponent</dt><dd id="modal-opponent"></dd></div>
        <div class="flex gap-2"><dt class="font-semibold w-24 flex-shrink-0">Venue</dt><dd id="modal-venue"></dd></div>
        <div class="flex gap-2"><dt class="font-semibold w-24 flex-shrink-0">Home/Away</dt><dd id="modal-homeaway"></dd></div>
        <div id="modal-score-row" class="flex gap-2 hidden"><dt class="font-semibold w-24 flex-shrink-0">Score</dt><dd id="modal-score"></dd></div>
      </dl>
    </div>
  </div>
  ```

**Test**: File exists with correct structure; all id attributes present; hidden by default.

---

### T009 Wire game rows and modal JS into `src/pages/teams/[slug].astro`

**Window**: 6 (Modal)
**Phase**: Integration
**Traceability**: FR-014, NFR-004, NFR-005, SC-006, US-8 all AC
**Dependencies**: T008 (GameModal.astro exists)
**Description**: Import GameModal into the detail page, add data attributes to game rows, and add the modal open/close JS.

**What to modify in `src/pages/teams/[slug].astro`**:

1. Add import: `import GameModal from '../../components/GameModal.astro';`

2. Add `<GameModal />` once, just before `</BaseLayout>`

3. Update each game row `<tr>` to include data attributes and make it interactive:
   ```html
   <tr
     class="game-row cursor-pointer hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
     role="button"
     tabindex="0"
     data-game-id={game.id}
     data-opponent={game.opponent ?? '—'}
     data-date={game.date ?? 'TBC'}
     data-time={game.time ?? 'TBC'}
     data-venue={game.venue ?? '—'}
     data-homeaway={game.homeOrAway ?? '—'}
     data-status={game.status}
     data-home-score={game.homeScore ?? ''}
     data-away-score={game.awayScore ?? ''}
   >
   ```

4. Add `<script>` block (before `</BaseLayout>`):
   ```javascript
   <script>
   const overlay = document.getElementById('game-modal-overlay');
   const panel = document.getElementById('game-modal-panel');
   const closeBtn = document.getElementById('modal-close-btn');
   let triggerEl = null;

   function openModal(row) {
     triggerEl = row;
     document.getElementById('modal-title').textContent = row.dataset.opponent;
     document.getElementById('modal-date').textContent = row.dataset.date;
     document.getElementById('modal-time').textContent = row.dataset.time;
     document.getElementById('modal-opponent').textContent = row.dataset.opponent;
     document.getElementById('modal-venue').textContent = row.dataset.venue;
     document.getElementById('modal-homeaway').textContent = row.dataset.homeaway;

     const scoreRow = document.getElementById('modal-score-row');
     if (row.dataset.status === 'completed' && row.dataset.homeScore && row.dataset.awayScore) {
       document.getElementById('modal-score').textContent =
         `${row.dataset.homeScore} – ${row.dataset.awayScore}`;
       scoreRow.classList.remove('hidden');
     } else {
       scoreRow.classList.add('hidden');
     }

     overlay.classList.remove('hidden');
     closeBtn.focus();
   }

   function closeModal() {
     overlay.classList.add('hidden');
     if (triggerEl) triggerEl.focus();
     triggerEl = null;
   }

   // Focus trap
   panel.addEventListener('keydown', e => {
     if (e.key === 'Escape') { closeModal(); return; }
     if (e.key !== 'Tab') return;
     const focusable = Array.from(panel.querySelectorAll(
       'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
     )).filter(el => !el.disabled);
     if (!focusable.length) return;
     const first = focusable[0];
     const last = focusable[focusable.length - 1];
     if (e.shiftKey && document.activeElement === first) {
       e.preventDefault(); last.focus();
     } else if (!e.shiftKey && document.activeElement === last) {
       e.preventDefault(); first.focus();
     }
   });

   // Close on overlay click (not panel click)
   overlay.addEventListener('click', e => {
     if (e.target === overlay) closeModal();
   });

   // Close button
   closeBtn.addEventListener('click', closeModal);

   // Wire game rows
   document.querySelectorAll('.game-row').forEach(row => {
     row.addEventListener('click', () => openModal(row));
     row.addEventListener('keydown', e => {
       if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(row); }
     });
   });
   </script>
   ```

**Test**:
- Click a game row: confirm modal opens, correct data populated, focus moves to close button
- Click close button: confirm modal closes, focus returns to clicked row
- Press Escape while modal open: confirm modal closes, focus returns
- Click outside modal panel (on overlay): confirm modal closes
- Tab repeatedly within modal: confirm focus does not escape to page behind
- On mobile (< 640px): confirm modal slides up from bottom as full-width sheet, content is scrollable
- Click an upcoming game: confirm Score row is hidden in modal
- Click a completed game: confirm Score row shows "Home – Away" format

---

[WINDOW_CHECKPOINT_6: P3 COMPLETE]

**Before marking COA-18 complete, verify all P3 acceptance criteria**:
- [ ] Modal opens within 200ms of click (SC-006)
- [ ] Modal closes via Escape key (NFR-004)
- [ ] Modal closes via outside click
- [ ] Focus trapped within modal while open (NFR-004)
- [ ] Focus returns to triggering row on close (NFR-004)
- [ ] Completed games show score in modal; upcoming games do not
- [ ] Mobile: full-viewport modal with scroll

**COA-18 is complete when Windows 1–6 all pass their checkpoints.**

---

## Summary

| Window | Purpose | Tasks | Key Files | Budget |
|---|---|---|---|---|
| W1 | Foundation: data + tile component | T001, T002 | `src/data/teams/teams.json`, `src/components/TeamTile.astro` | 50–70k |
| W2 | Listing page structure + layout | T003 | `src/pages/teams.astro` | 60–80k |
| W3 | Filter interactivity + P1 validation | T004 | `src/pages/teams.astro` (script block) | 60–80k |
| W4 | PlayHQ scraper | T005 | `scripts/scrape-teams.js` | 60–80k |
| W5 | Detail pages + data source update | T006, T007 | `src/pages/teams/[slug].astro`, `src/pages/teams.astro` | 80–100k |
| W6 | Game detail modal | T008, T009 | `src/components/GameModal.astro`, `src/pages/teams/[slug].astro` | 50–70k |

**Execution dependency graph**:
```
W1 (Foundation) — no dependencies, start here
  ↓
W2 (Listing Structure) — depends: W1 checkpoint
  ↓
W3 (Filter + P1 Complete) — depends: W2 checkpoint
  ↓
W4 (Scraper) — can start after W1; does NOT require W2 or W3
  ↓
W5 (Detail Pages) — depends: W3 + W4 both complete
  ↓
W6 (Modal) — depends: W5 checkpoint
```

**Note on W4 parallelism**: W4 (scraper) only depends on knowing the data shape (W1 checkpoint). If two developers are working in parallel, W4 can run concurrently with W2/W3. A solo implementer should complete W3 first (P1 milestone) then run W4.

---

## Traceability Matrix

| Task | FR | NFR | AC |
|---|---|---|---|
| T001 | FR-001, FR-002, FR-003, FR-004 | — | AC-1, AC-2 |
| T002 | FR-003, FR-004, FR-008 | NFR-001, NFR-005, NFR-006, NFR-008, NFR-011 | AC-2, AC-6 |
| T003 | FR-001, FR-002, FR-005, FR-017 | NFR-007, NFR-008, NFR-009, NFR-012, NFR-013 | AC-1, AC-14, AC-15 |
| T004 | FR-005, FR-006, FR-007, FR-009 | NFR-002, NFR-003, NFR-018 | AC-3, AC-4, AC-5, AC-7, AC-12, AC-13 |
| T005 | FR-015, FR-016, FR-017 | — | SC-004 |
| T006 | FR-015, FR-017 | NFR-014 | AC-11 |
| T007 | FR-010, FR-011, FR-012, FR-013, FR-017 | NFR-010, NFR-014, NFR-015, NFR-016 | AC-8, AC-9, AC-10, AC-11 |
| T008 | FR-014 | NFR-004, NFR-005 | SC-006 |
| T009 | FR-014 | NFR-004, NFR-005 | SC-006, US-8 all AC |
