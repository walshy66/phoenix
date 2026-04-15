# Tasks: UI Touch Up (COA-53)

**Input**: Specs from `/specs/coa-53-ui-touch-up/`  
**Strategy**: Option C Execution Windows (isolated context, phased delivery)  
**Windows**: 5 total | **Estimated Total**: 5-8 hours development + testing

---

## Format Guide

- **[P]**: Task can run in parallel within same window (different files, no conflicts)
- **Window N**: Execution context boundary (fresh ~150k context window)
- **WINDOW_CHECKPOINT**: Validation gate before next window starts
- **Traceability**: Each task maps back to spec (FR-XXX, SC-XXX, AC-X)
- **Dependency**: What prior work must be done before this task

---

## Execution Window 1: Hero Section Standardization (FOUNDATION)

**Purpose**: Standardize title sections across all 7 pages with consistent padding (`py-12 lg:py-8`) and descriptive 1-line text.

**Token Budget**: 70-90k (7 pages, repetitive changes, visual testing)

**Why This Window First**: All other changes depend on pages being consistently styled. This establishes the visual foundation for subsequent phases.

**Checkpoint Validation**:
- [ ] All 7 pages render with reduced `py-8` padding on desktop (1024px+)
- [ ] All 7 pages display `py-12` padding on mobile (< 1024px)
- [ ] All 7 pages have 1-line descriptive text in hero section
- [ ] No horizontal scrolling at 320px, 640px, 1024px, 1440px viewports
- [ ] Visual regression pass at desktop (1440px)

---

### T001 [P] Update Teams page hero (py-16 → py-12 lg:py-8 + add descriptive text)

**Window**: 1 (Foundation)  
**Phase**: Hero Section  
**Traceability**: FR-001, FR-002, SC-001, SC-002, AC-1  
**Dependencies**: None  
**Description**: Modify Teams page hero section to use standardized padding and add 1-line descriptive text

**Files to Modify**:
- `src/pages/teams.astro` (approx. line 128-137)

**What to Change**:
```astro
<!-- BEFORE -->
<section class="bg-brand-purple py-16 px-4 text-center relative overflow-hidden">
  <h1>TEAMS</h1>
  ...
</section>

<!-- AFTER -->
<section class="bg-brand-purple py-12 lg:py-8 px-4 text-center relative overflow-hidden">
  <h1>TEAMS</h1>
  <p class="text-gold text-sm uppercase tracking-widest">Your Teams</p>
  <!-- or similar 1-liner -->
  ...
</section>
```

**Success Criteria**:
- Padding class changed from `py-16` to `py-12 lg:py-8`
- Descriptive text added below heading
- Text is visible and readable at all viewports
- No layout shifts or overflow at 320px viewport

**Test**:
```bash
# Visual inspection at breakpoints: 320px, 640px, 1024px, 1440px
# Compare with before/after screenshots
# Verify: padding visibly reduced on desktop, maintained on mobile
```

---

### T002 [P] Update About page hero (py-16 → py-12 lg:py-8 + add descriptive text)

**Window**: 1 (Foundation)  
**Phase**: Hero Section  
**Traceability**: FR-001, FR-002, SC-001, SC-002, AC-1  
**Dependencies**: None  
**Description**: Modify About page hero section to use standardized padding and add 1-line descriptive text

**Files to Modify**:
- `src/pages/about.astro` (approx. line 6-19)

**What to Change**:
Same pattern as T001:
```astro
<!-- BEFORE -->
<section class="bg-brand-purple py-16 px-4 ...">
  <h1>ABOUT</h1>

<!-- AFTER -->
<section class="bg-brand-purple py-12 lg:py-8 px-4 ...">
  <h1>ABOUT</h1>
  <p class="text-gold text-sm uppercase tracking-widest">Our Story</p>
  <!-- or similar 1-liner -->
```

**Success Criteria**:
- Padding updated, descriptive text added
- Consistent with T001 pattern
- Readable at all viewports, no overflow

**Test**:
```bash
# Visual inspection at 320px, 640px, 1024px, 1440px
# Compare with T001 (Teams) for consistency
```

---

### T003 [P] Update Scores page hero (py-16 → py-12 lg:py-8, verify text present)

**Window**: 1 (Foundation)  
**Phase**: Hero Section  
**Traceability**: FR-001, FR-002, SC-001, SC-002, AC-1  
**Dependencies**: None  
**Description**: Modify Scores page hero section to use standardized padding (text already present per plan)

**Files to Modify**:
- `src/pages/scores.astro` (approx. line 81-90)

**What to Change**:
```astro
<!-- BEFORE -->
<section class="bg-brand-purple py-16 px-4 ...">
  <h1>SCORES</h1>
  <!-- May already have "Live Updates" text -->

<!-- AFTER -->
<section class="bg-brand-purple py-12 lg:py-8 px-4 ...">
  <h1>SCORES</h1>
  <!-- Ensure "Live Updates" or similar 1-liner is present -->
```

**Success Criteria**:
- Padding updated to `py-12 lg:py-8`
- Descriptive text verified (add if missing)
- Consistent with T001, T002 pattern

**Test**:
```bash
# Visual inspection at 320px, 640px, 1024px, 1440px
# Verify text present and readable
```

---

### T004 [P] Update Seasons page hero (py-16 → py-12 lg:py-8, verify text present)

**Window**: 1 (Foundation)  
**Phase**: Hero Section  
**Traceability**: FR-001, FR-002, SC-001, SC-002, AC-1  
**Dependencies**: None  
**Description**: Modify Seasons page hero section to use standardized padding (text already present per plan)

**Files to Modify**:
- `src/pages/seasons.astro` (approx. line 11-24)

**What to Change**:
Same pattern as T003 (likely already has descriptive text).

**Success Criteria**:
- Padding updated to `py-12 lg:py-8`
- Descriptive text verified and present
- Consistent with previous tasks

**Test**:
```bash
# Visual inspection at 320px, 640px, 1024px, 1440px
```

---

### T005 [P] Update Contact page hero (py-16 → py-12 lg:py-8, verify text present)

**Window**: 1 (Foundation)  
**Phase**: Hero Section  
**Traceability**: FR-001, FR-002, SC-001, SC-002, AC-1  
**Dependencies**: None  
**Description**: Modify Contact page hero section to use standardized padding (text already present per plan)

**Files to Modify**:
- `src/pages/contact.astro` (approx. line 7-19)

**What to Change**:
Same pattern as previous tasks.

**Success Criteria**:
- Padding updated to `py-12 lg:py-8`
- Descriptive text present
- Consistent with all previous hero updates

**Test**:
```bash
# Visual inspection at 320px, 640px, 1024px, 1440px
```

---

### T006 [P] Update Get Involved page hero (py-16 → py-12 lg:py-8 + add descriptive text)

**Window**: 1 (Foundation)  
**Phase**: Hero Section  
**Traceability**: FR-001, FR-002, SC-001, SC-002, AC-1  
**Dependencies**: None  
**Description**: Modify Get Involved page hero section to use standardized padding and add 1-line descriptive text

**Files to Modify**:
- `src/pages/get-involved.astro` (approx. line TBD)

**What to Change**:
Same pattern as T001 (likely needs descriptive text added).

**Success Criteria**:
- Padding updated to `py-12 lg:py-8`
- Descriptive text added (e.g., "Get Involved", "Join Us", or similar)
- Consistent with all previous tasks

**Test**:
```bash
# Visual inspection at 320px, 640px, 1024px, 1440px
```

---

### T007 [P] Update Resources page hero (py-16 → py-12 lg:py-8 + verify text, remove dot.walk)

**Window**: 1 (Foundation)  
**Phase**: Hero Section + Cleanup  
**Traceability**: FR-001, FR-002, FR-003, SC-001, SC-002, SC-005  
**Dependencies**: None  
**Description**: Modify Resources page hero to standardized padding, verify text, and remove duplicate decorative circle (dot.walk)

**Files to Modify**:
- `src/pages/resources/index.astro` (approx. line 36-49)

**What to Change**:
```astro
<!-- BEFORE -->
<section class="bg-brand-purple py-16 px-4 text-center relative overflow-hidden">
  <div class="absolute inset-0 opacity-10 pointer-events-none">
    <div class="absolute -top-16 -right-16 w-64 h-64 rounded-full" style="background: #8B7536;"></div>
    <div class="absolute -bottom-16 -left-16 w-48 h-48 rounded-full" style="background: #8B7536;"></div>  ← DELETE THIS
  </div>
  ...
</section>

<!-- AFTER -->
<section class="bg-brand-purple py-12 lg:py-8 px-4 text-center relative overflow-hidden">
  <div class="absolute inset-0 opacity-10 pointer-events-none">
    <div class="absolute -top-16 -right-16 w-64 h-64 rounded-full" style="background: #8B7536;"></div>
  </div>
  <!-- Ensure descriptive text is present below heading -->
  ...
</section>
```

**Success Criteria**:
- Padding updated to `py-12 lg:py-8`
- Bottom-left circular background element deleted
- Only top-right circle remains (matches other pages)
- Descriptive text verified/added
- Hero matches pattern of other pages

**Test**:
```bash
# Visual inspection at 320px, 640px, 1024px, 1440px
# Verify: only ONE circle visible (top-right), no bottom-left
# Compare Resources hero with Teams/About/Scores for consistency
```

---

[WINDOW_CHECKPOINT_1]

**Before proceeding to Window 2, verify**:
- [ ] T001-T007 all hero sections updated
- [ ] All 7 pages render with `py-12 lg:py-8` padding
- [ ] All 7 pages have 1-line descriptive text
- [ ] Resources page has decorative circle removed (only 1 circle visible)
- [ ] Visual regression pass at 320px, 640px, 1024px, 1440px
- [ ] No horizontal scrolling at any viewport
- [ ] All pages load without console errors

**If checkpoint fails**, stay in Window 1 and fix. **Do NOT proceed** to Window 2 until all checks pass.

---

## Execution Window 2: Scores Page Grid Refinement

**Purpose**: Fix day-column grid layout to ensure uniform card sizing and consistent column widths across responsive breakpoints.

**Token Budget**: 50-70k (grid CSS adjustment, visual testing, card verification)

**Why After Window 1**: Depends on Scores page hero being standardized; grid layout is isolated change that doesn't block other phases.

**Checkpoint Validation**:
- [ ] Desktop (1024px+): 4 equal-width columns render (one per day)
- [ ] Tablet (640-1024px): 2 equal-width columns render
- [ ] Mobile (< 640px): 1 column renders
- [ ] All ScoreCards within same day column have identical height/width
- [ ] Visual regression pass at all breakpoints

---

### T008 Verify ScoreCard component styling (rounded-xl border border-gray-100 shadow-sm)

**Window**: 2 (Grid Refinement)  
**Phase**: Verification  
**Traceability**: FR-006, SC-004, SC-007, NFR-002  
**Dependencies**: T001-T007 (hero sections completed)  
**Description**: Verify ScoreCard component uses correct styling classes; document for reference

**Files to Review**:
- `src/components/ScoreCard.astro`

**What to Verify**:
```astro
<!-- ScoreCard should include these classes: -->
<div class="rounded-xl border border-gray-100 shadow-sm card-hover ...">
  <!-- Card content -->
</div>
```

**Success Criteria**:
- ScoreCard has `rounded-xl` class (24px border radius)
- ScoreCard has `border border-gray-100` (1px gray border)
- ScoreCard has `shadow-sm` class (subtle shadow)
- ScoreCard has `card-hover` class for hover effects
- Padding is consistent (p-4 or p-6)

**Test**:
```bash
# Visual inspection in browser DevTools
# Inspect a ScoreCard element; verify classes present
# Hover over card; verify shadow elevation and translation effect
```

---

### T009 Review Scores page grid structure and adjust for uniform column width

**Window**: 2 (Grid Refinement)  
**Phase**: Grid CSS  
**Traceability**: FR-004, FR-005, SC-003, SC-004, AC-3, AC-4  
**Dependencies**: T001-T007 (Scores hero completed), T008 (ScoreCard verified)  
**Description**: Ensure Scores page day-column grid uses consistent breakpoints and ensures all columns occupy equal width

**Files to Modify**:
- `src/pages/scores.astro` (approx. line 112-141, grid structure)

**What to Verify/Change**:
```astro
<!-- CURRENT (verify) -->
<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
  {scoresByDay.map((day) => (
    <section class="bg-white rounded-xl border border-gray-100 p-4">
      <!-- Day header -->
      <h3>{day.name}</h3>
      <!-- ScoreCards in space-y-4 layout -->
      <div class="space-y-4">
        {day.games.map((score) => (
          <ScoreCard {...score} />
        ))}
      </div>
    </section>
  ))}
</div>

<!-- If grid needs adjustment for consistency, change to: -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  <!-- same content as above -->
</div>
```

**Issue Being Fixed**:
- Ensure all 4 day columns render at equal width on desktop
- Ensure day containers have explicit width (e.g., `flex-1` or implicit from grid)
- Verify ScoreCards within each day stretch to fill container width

**Success Criteria**:
- Grid uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (or similar breakpoint pattern)
- At 1024px+: 4 equal-width columns
- At 640-1024px: 2 equal-width columns
- At < 640px: 1 column
- All cards in same day column have identical width and height
- Gap between columns is consistent (gap-6)

**Test**:
```bash
# Visual inspection at 320px, 640px, 1024px, 1440px
# Measure column widths in DevTools; verify all 4 columns equal width at desktop
# Verify cards in same day have same height
# Test with days having different game counts (1 game vs 5+ games)
```

---

[WINDOW_CHECKPOINT_2]

**Before proceeding to Window 3, verify**:
- [ ] T008: ScoreCard styling verified and documented
- [ ] T009: Grid structure reviewed and adjusted if needed
- [ ] Scores page renders 4 equal columns at 1024px+
- [ ] Scores page renders 2 equal columns at 640-1024px
- [ ] Scores page renders 1 column at < 640px
- [ ] All ScoreCards within same day have uniform height/width
- [ ] Visual regression pass at all breakpoints
- [ ] No overflow or horizontal scrolling

**If checkpoint fails**, stay in Window 2 and fix. **Do NOT proceed** to Window 3.

---

## Execution Window 3: Card Pattern Consistency & Teams Tiles

**Purpose**: Verify ScoreCard and Teams tiles use identical styling (border, shadow, corners, padding, hover effects).

**Token Budget**: 40-60k (verification, visual comparison, minor adjustments if needed)

**Why After Window 2**: Depends on grid refinement being complete; establishes pattern for future features.

**Checkpoint Validation**:
- [ ] Teams tiles use same styling as ScoreCard (rounded-xl border border-gray-100 shadow-sm)
- [ ] Hover effects identical on both components
- [ ] Padding consistent (p-4 or p-6)
- [ ] Visual side-by-side comparison shows no style differences

---

### T010 Locate Teams page tile markup and document styling

**Window**: 3 (Card Pattern)  
**Phase**: Verification  
**Traceability**: FR-006, SC-007, NFR-002, AC-7  
**Dependencies**: T001-T009 (prior phases complete)  
**Description**: Find Teams page tile rendering code, extract styling information, compare with ScoreCard

**Files to Review**:
- `src/pages/teams.astro` (approx. line 450+, look for tile/card rendering)

**What to Do**:
1. Locate where Teams tiles are rendered (grid of team cards)
2. Extract the markup and CSS classes used for each tile
3. Document the current styling (border, shadow, padding, corners)
4. Note any differences from ScoreCard styling

**Success Criteria**:
- Found Teams tile markup location
- Extracted styling classes
- Documented for comparison with ScoreCard

**Test**:
```bash
# Grep for "Teams" tile rendering in teams.astro
# Inspect element in browser to see applied classes
# Visual inspection: zoom in on a tile, note styling
```

---

### T011 Compare Teams tiles with ScoreCard styling; align if needed

**Window**: 3 (Card Pattern)  
**Phase**: Alignment  
**Traceability**: FR-006, SC-007, NFR-002, AC-7  
**Dependencies**: T008 (ScoreCard verified), T010 (Teams tiles located)  
**Description**: Side-by-side comparison of Teams tile styling vs ScoreCard; make adjustments to align if needed

**What to Compare**:
```
ScoreCard:
- Border: border border-gray-100 ✓
- Corners: rounded-xl ✓
- Shadow: shadow-sm ✓
- Padding: p-4 ✓
- Hover: card-hover class ✓

Teams Tile (check against above):
- Border: ? (should be border border-gray-100)
- Corners: ? (should be rounded-xl)
- Shadow: ? (should be shadow-sm)
- Padding: ? (should be p-4)
- Hover: ? (should be card-hover)
```

**If Differences Found**:
- Update Teams tile markup to match ScoreCard pattern
- File: `src/pages/teams.astro` or component file if extracted

**Success Criteria**:
- Teams tiles use identical styling to ScoreCard: `rounded-xl border border-gray-100 shadow-sm card-hover p-4`
- Padding is consistent (p-4 or p-6)
- Hover effects triggered at same speed (0.3s ease)
- Visual comparison shows no perceptible differences

**Test**:
```bash
# Open Teams and Scores pages side-by-side in browser
# Zoom in on a Teams tile and a ScoreCard
# Compare: borders, shadows, corners, padding
# Hover over both; verify shadow elevation and translation timing match
# Visual regression: take screenshots at 1024px for comparison
```

---

### T012 Verify .card-hover class exists and is correctly defined in globals.css

**Window**: 3 (Card Pattern)  
**Phase**: Verification  
**Traceability**: FR-006, SC-007, NFR-002  
**Dependencies**: T010, T011 (card comparisons complete)  
**Description**: Ensure .card-hover CSS class is defined and consistent

**Files to Review**:
- `src/styles/globals.css` (or equivalent global styles file)

**What to Verify**:
```css
/* Should include .card-hover with: */
.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);  /* or shadow-md equivalent */
  transform: translateY(-2px);
}
```

**If Missing or Incorrect**:
- Add or update .card-hover class definition
- Ensure transition timing is 0.3s ease (consistent with plan)
- Shadow elevation should match shadow-md or higher (visible on hover)

**Success Criteria**:
- .card-hover class exists in globals.css
- Transition: `all 0.3s ease`
- Hover shadow: visible elevation increase
- Transform: translateY(-2px) or similar subtle lift
- Class is applied to ScoreCard and Teams tile components

**Test**:
```bash
# Search globals.css for ".card-hover"
# Verify CSS rules present
# Hover over ScoreCard and Teams tile in browser
# Compare timing and elevation of both hover effects
```

---

[WINDOW_CHECKPOINT_3]

**Before proceeding to Window 4, verify**:
- [ ] T010: Teams tile styling documented
- [ ] T011: Teams tiles aligned with ScoreCard styling
- [ ] T012: .card-hover class verified/defined correctly
- [ ] ScoreCard and Teams tiles look identical (side-by-side visual comparison)
- [ ] Hover effects trigger at same timing and elevation
- [ ] Visual regression pass at desktop (1024px+)

**If checkpoint fails**, stay in Window 3 and fix. **Do NOT proceed** to Window 4.

---

## Execution Window 4: Resources Cleanup & Contact Spacing

**Purpose**: Remove decorative elements from Resources page and reduce Contact page section spacing.

**Token Budget**: 40-60k (minor CSS/markup changes, visual testing)

**Why After Window 3**: These are isolated changes that don't depend on card patterns; grouped for efficiency.

**Checkpoint Validation**:
- [ ] Resources page: Only 1 decorative circle visible (top-right), no bottom-left
- [ ] Resources page: Hero matches pattern of other pages
- [ ] Contact page: Vertical spacing between Contact Cards and next section reduced by ~50%
- [ ] Contact page: Layout feels cohesive at desktop and mobile

---

### T013 Remove bottom-left decorative circle from Resources page hero

**Window**: 4 (Cleanup)  
**Phase**: Resources Cleanup  
**Traceability**: FR-003, SC-005, AC-8  
**Dependencies**: T001-T012 (prior phases complete)  
**Description**: Delete second circular background element from Resources page hero section

**Files to Modify**:
- `src/pages/resources/index.astro` (approx. line 36-49)

**What to Change**:
```astro
<!-- BEFORE (in Resources hero) -->
<div class="absolute inset-0 opacity-10 pointer-events-none">
  <div class="absolute -top-16 -right-16 w-64 h-64 rounded-full" style="background: #8B7536;"></div>
  <div class="absolute -bottom-16 -left-16 w-48 h-48 rounded-full" style="background: #8B7536;"></div>  ← DELETE THIS ENTIRE DIV
</div>

<!-- AFTER -->
<div class="absolute inset-0 opacity-10 pointer-events-none">
  <div class="absolute -top-16 -right-16 w-64 h-64 rounded-full" style="background: #8B7536;"></div>
</div>
```

**Success Criteria**:
- Bottom-left circular div completely deleted
- Only one circle (top-right) remains
- Hero section still renders correctly
- Resources hero now matches Teams/About/Scores pattern

**Test**:
```bash
# Visual inspection at 320px, 640px, 1024px, 1440px
# View Resources page hero; verify only 1 circle visible
# Compare with T001 (Teams) to ensure consistency
# Verify no console errors on page load
```

---

### T014 Reduce Contact page section spacing (py-16 → py-8 lg:py-12)

**Window**: 4 (Cleanup)  
**Phase**: Contact Spacing  
**Traceability**: FR-007, SC-006, AC-9  
**Dependencies**: T001-T012 (prior phases complete)  
**Description**: Reduce vertical padding on Contact Cards section to improve visual flow

**Files to Modify**:
- `src/pages/contact.astro` (approx. line 22, Contact Cards section)

**What to Change**:
```astro
<!-- BEFORE -->
<section class="py-16 px-4 sm:px-6 lg:px-8 bg-white">
  <!-- Contact Cards (address, email, social) -->
</section>

<!-- AFTER -->
<section class="py-8 lg:py-12 px-4 sm:px-6 lg:px-8 bg-white">
  <!-- Contact Cards (address, email, social) -->
</section>
```

**Rationale**:
- Current state: py-16 top + py-16 bottom = 128px total gap (excessive)
- Target state: py-8 top + next section py-16 = 96px total gap (~25% reduction at desktop)
- Mobile: py-12 maintains readability on smaller screens

**Success Criteria**:
- Contact Cards section padding changed from `py-16` to `py-8 lg:py-12`
- Visual gap between Contact Cards and next section visibly reduced
- Layout feels cohesive without orphaning content
- Mobile padding (py-12) remains readable

**Test**:
```bash
# Visual inspection at 320px, 640px, 1024px, 1440px
# Focus on transition between Contact Cards and next section
# Measure pixel gap before/after in DevTools
# Verify spacing reduction is visible (at least 50%)
# Check mobile (py-12) is appropriate for readability
```

---

[WINDOW_CHECKPOINT_4]

**Before proceeding to Final Validation (Window 5), verify**:
- [ ] T013: Bottom-left circle removed from Resources page
- [ ] T013: Resources hero matches Teams/About/Scores pattern
- [ ] T014: Contact Cards section padding reduced
- [ ] T014: Vertical gap between Contact Cards and next section visibly reduced
- [ ] T014: Mobile spacing (py-12) readable and appropriate
- [ ] Visual regression pass at desktop and mobile
- [ ] No console errors on Resources or Contact pages

**If checkpoint fails**, stay in Window 4 and fix. **Do NOT proceed** to Window 5.

---

## Execution Window 5: Final Validation & Polish

**Purpose**: Comprehensive visual regression testing across all pages and breakpoints; verify no regressions; document completion.

**Token Budget**: 30-50k (testing-heavy, visual inspection, final screenshots)

**Why Last**: Only runs after all functional changes complete; ensures entire feature works together.

**Checkpoint Validation**:
- [ ] All pages render correctly at 320px, 640px, 1024px, 1440px
- [ ] No horizontal scrolling at any viewport
- [ ] All WCAG 2.1 AA contrast standards maintained
- [ ] All acceptance criteria (AC-1 through AC-12) verified

---

### T015 [P] Visual regression testing at all breakpoints (320px, 640px, 1024px, 1440px)

**Window**: 5 (Final Validation)  
**Phase**: Testing  
**Traceability**: SC-008, SC-009, NFR-003, NFR-004, AC-10, AC-11, AC-12  
**Dependencies**: T001-T014 (all changes complete)  
**Description**: Comprehensive visual regression testing across all 7 pages at critical breakpoints

**What to Test**:
```
PAGES TO TEST (7 total):
1. Teams
2. About
3. Scores
4. Seasons
5. Contact
6. Get Involved
7. Resources

BREAKPOINTS (4 total):
- 320px (mobile small)
- 640px (tablet small)
- 1024px (tablet large / desktop breakpoint)
- 1440px (desktop)

VISUAL CHECKS PER PAGE:
- Hero section padding (py-8 on desktop, py-12 on mobile)
- Descriptive text present and readable
- No horizontal scrolling
- Text contrast meets WCAG 2.1 AA (4.5:1 normal, 3:1 large)
- Decorative elements don't overflow
```

**Special Attention**:
- **Scores page**: Verify grid columns (4 at 1024px+, 2 at 640-1024px, 1 at < 640px)
- **Scores page**: Verify card heights uniform within each day column
- **Resources page**: Verify only 1 circular background visible
- **Contact page**: Verify spacing between Contact Cards and next section reduced
- **Teams page**: Verify tiles match ScoreCard styling
- **All pages**: No horizontal scrolling at any viewport

**Test**:
```bash
# Use browser DevTools responsive design mode or similar
# Test each page at each breakpoint:
npm test -- pages  # if integration tests exist
# OR manual testing:
# 1. Open each page in browser
# 2. Set viewport to 320px, take screenshot
# 3. Repeat for 640px, 1024px, 1440px
# 4. Compare before/after screenshots for visual consistency
# 5. Check: no overflow, text readable, spacing correct
```

---

### T016 [P] Accessibility verification (contrast, keyboard navigation, touch targets)

**Window**: 5 (Final Validation)  
**Phase**: Testing  
**Traceability**: SC-009, NFR-003, AC-12  
**Dependencies**: T001-T014 (all changes complete)  
**Description**: Verify spacing changes maintain WCAG 2.1 AA accessibility standards

**What to Check**:
```
CONTRAST (WCAG 2.1 AA):
- Text on brand-purple background: 4.5:1+ (normal text)
- All other text on backgrounds: verify with tools

KEYBOARD NAVIGATION:
- Tab through all interactive elements
- Focus indicators visible on all focusable items
- No focus traps

TOUCH TARGETS:
- All buttons/links ≥ 44px in both dimensions
- Spacing adjustments don't create sub-44px targets

SCREEN READER:
- Headings announced correctly
- Descriptions read properly
- No missing alt text (if applicable)

COLOR NOT SOLE INDICATOR:
- Gold dividers don't carry meaning (text labels present)
- No information conveyed by color alone
```

**Test**:
```bash
# Use axe DevTools or WAVE browser extension
# Check each page for contrast issues
# Tab through pages; verify focus visible and logical
# Inspect elements to verify touch target sizes
# Use screen reader (NVDA, JAWS, or macOS VoiceOver) to test announcements
# Fix any issues found
```

---

### T017 [P] Edge case testing (long names, varying content, empty states, narrow viewports)

**Window**: 5 (Final Validation)  
**Phase**: Testing  
**Traceability**: SC-008, NFR-004, AC-10, AC-11  
**Dependencies**: T001-T014 (all changes complete)  
**Description**: Verify feature handles edge cases gracefully

**Edge Cases to Test**:
```
1. LONG TEAM NAMES (Teams page):
   - Tile doesn't overflow or break layout
   - Text truncates gracefully with ellipsis if needed

2. VARYING GAME COUNTS (Scores page):
   - Days with 1 game vs. 5+ games render at same column width
   - Cards maintain uniform height even with different counts

3. EMPTY STATES (Scores page):
   - "No games scheduled" message displays correctly
   - Layout remains stable

4. LONG VENUE NAMES (ScoreCard):
   - Text truncates or wraps appropriately
   - Card doesn't overflow

5. NARROW VIEWPORTS (< 320px):
   - Layout degrades gracefully
   - No horizontal scrolling
   - Content remains readable

6. VERY WIDE VIEWPORTS (2560px+):
   - Layout doesn't stretch excessively
   - Content remains readable and centered
```

**Test**:
```bash
# Manually test each edge case
# Use browser DevTools to test narrow viewports (< 320px)
# Search for test data with long names (Teams, Venues)
# Inspect layout stability at edge viewport widths
# Verify: no overflow, no horizontal scroll, graceful degradation
```

---

### T018 Compile final acceptance criteria validation matrix

**Window**: 5 (Final Validation)  
**Phase**: Validation  
**Traceability**: All AC-1 through AC-12, SC-001 through SC-009  
**Dependencies**: T015, T016, T017 (all testing complete)  
**Description**: Verify all acceptance criteria and success criteria are met; document completion

**What to Verify**:
```
ACCEPTANCE CRITERIA (from spec):

AC-1: Teams, About, Scores pages hero sections display descriptive text
AC-2: All hero sections have py-8 (desktop), py-12 (mobile) padding
AC-3: Scores page grid: 4 columns (desktop), 2 (tablet), 1 (mobile)
AC-4: ScoreCards uniform height/width in same day column
AC-5: Scores grid switches to 2 columns at 640-1024px viewport
AC-6: Scores grid displays 1 column at < 640px viewport
AC-7: ScoreCard and Teams tiles use identical styling
AC-8: Resources page hero: no dot.walk, matches other pages pattern
AC-9: Contact page spacing between sections visibly reduced
AC-10: 320px viewport: content readable, no horizontal scrolling
AC-11: 1440px viewport: layout balanced, no overflow
AC-12: WCAG 2.1 AA contrast and accessibility maintained

SUCCESS CRITERIA (from spec):

SC-001: All hero sections: py-8 (desktop), py-12 (mobile)
SC-002: 7 pages display 1-line descriptive text in hero
SC-003: Scores grid: 4/2/1 columns with consistent spacing
SC-004: ScoreCards uniform height/width (within 1px)
SC-005: Resources hero: no dot.walk, matches pattern
SC-006: Contact spacing reduced 50%
SC-007: Card styling: rounded-xl border border-gray-100 shadow-sm
SC-008: Visual regression pass at 320/640/1024/1440px, no scrolling
SC-009: WCAG 2.1 AA contrast & accessibility maintained
```

**Success Criteria**:
- All AC-1 through AC-12 verified and passing
- All SC-001 through SC-009 verified and passing
- No regressions detected from before state
- All pages load without console errors
- Feature is complete and ready for merge

**Test**:
```bash
# Create validation checklist
# Go through each AC and SC
# Mark as PASS or FAIL with evidence
# If all PASS, feature is complete
# If any FAIL, return to appropriate window and fix
```

---

[WINDOW_CHECKPOINT_5 — FINAL]

**Feature Complete Validation**:
- [ ] T015: Visual regression pass at 320px, 640px, 1024px, 1440px
- [ ] T015: No horizontal scrolling at any viewport
- [ ] T015: All 7 pages render correctly
- [ ] T016: WCAG 2.1 AA contrast verified
- [ ] T016: Keyboard navigation works
- [ ] T016: Touch targets ≥ 44px
- [ ] T017: Edge cases handled gracefully
- [ ] T018: All AC-1 through AC-12 PASS
- [ ] T018: All SC-001 through SC-009 PASS
- [ ] No regressions from before state
- [ ] All pages load without errors
- [ ] Ready for code review and merge

**If checkpoint fails**, identify which task(s) need rework, return to that window, and fix.

---

## Summary: Execution Flow

```
Window 1: Hero Section Standardization (Foundation)
├─ T001-T007: Update all 7 page heroes
└─ CHECKPOINT_1: All heroes standardized, Resources circle removed

Window 2: Scores Page Grid Refinement
├─ T008-T009: Verify card styling, refine grid layout
└─ CHECKPOINT_2: Grid renders 4/2/1 columns, cards uniform

Window 3: Card Pattern Consistency
├─ T010-T012: Verify Teams tiles match ScoreCard, .card-hover defined
└─ CHECKPOINT_3: Teams and Scores cards identical styling

Window 4: Resources + Contact Spacing
├─ T013-T014: Remove Resources circle, reduce Contact spacing
└─ CHECKPOINT_4: Resources clean, Contact cohesive

Window 5: Final Validation (No Implementation — Testing Only)
├─ T015-T018: Visual regression, accessibility, edge cases, AC validation
└─ CHECKPOINT_5: Feature complete, all AC/SC passing, ready for merge
```

---

## Key Rules for Implementation

### Rule 1: Fresh Context Per Window
- Each window starts with clean context (implement agent runs `/clear` between windows)
- Read STATE.md to understand checkpoint status
- Only prior checkpoint results carry forward, not conversation history

### Rule 2: Test-First Within Each Window
- All changes are CSS/markup edits; no behavior logic
- Visual testing is the primary validation method
- Compare before/after screenshots at each breakpoint

### Rule 3: Checkpoint Gates Progression
- Window 1 must pass before Window 2 starts
- Window 2 must pass before Window 3 starts
- And so on through Window 5
- **Never skip ahead**; if checkpoint fails, stay in that window and fix

### Rule 4: Parallel Tasks [P] Only Within Same Window
- T001-T007 can run in parallel (different files)
- T008-T009 cannot be parallel (T008 informs T009)
- T015-T017 can run in parallel (different testing aspects)

### Rule 5: Traceability to Spec
- Every task maps back to FR-XXX, SC-XXX, or AC-X
- No orphaned work
- Completion validation references spec requirements

---

## Testing Summary

**Visual Regression Testing**:
- Test at 4 breakpoints: 320px, 640px, 1024px, 1440px
- All 7 pages: Teams, About, Scores, Seasons, Contact, Get Involved, Resources
- Compare before/after screenshots
- Document pass/fail status

**Accessibility Testing**:
- WCAG 2.1 AA contrast verification
- Keyboard navigation testing
- Touch target size verification (≥ 44px)
- Screen reader testing (if resources available)

**Edge Case Testing**:
- Long team names (truncation)
- Varying game counts (uniform card sizing)
- Empty states (Scores page)
- Narrow/wide viewports (graceful degradation)

---

## Deliverables

Upon completion:
1. All 7 pages with standardized hero sections (py-12 lg:py-8 + descriptive text)
2. Scores page with refined grid (4/2/1 columns) and uniform card sizing
3. Resources page with decorative circle removed
4. Contact page with reduced spacing between sections
5. ScoreCard and Teams tiles with verified consistent styling
6. Visual regression test results at all breakpoints
7. Accessibility verification report
8. Feature ready for merge to main

---

## Notes for Implement Agent

1. **Tailwind Breakpoints**:
   - `py-12` applies to all screens by default
   - `lg:py-8` overrides at 1024px+ (Tailwind lg = 1024px)
   - Use pattern: `py-12 lg:py-8` for reduced desktop padding

2. **Grid Breakpoints**:
   - `grid-cols-1` = mobile (< 640px)
   - `sm:grid-cols-2` = tablet (640-1024px)
   - `lg:grid-cols-4` or `xl:grid-cols-4` = desktop (1024px+)
   - Verify breakpoint choice matches site's convention

3. **Card Hover Effect**:
   - .card-hover must be defined in globals.css if not already
   - Ensure applied to both ScoreCard and Teams tiles

4. **Testing Priority**:
   - Desktop (1024px+): Most traffic; design intent clearest
   - Mobile (320px): Most challenging; ensure readability
   - Tablet (640px): Breakpoint transition; verify column switch

5. **If Stuck**:
   - Refer back to plan.md for detailed implementation notes per phase
   - Use git diff to compare before/after CSS changes
   - Browser DevTools responsive design mode is your friend

---

## Success Looks Like

- All 7 pages look visually cohesive with standardized spacing
- Scores page grid renders perfectly at all responsive breakpoints
- Cards look uniform and professional (no styling mismatches)
- Resources page is clean (no stray decorative elements)
- Contact page feels connected (no orphaned sections)
- Visual regression passes at all viewports
- Feature is merge-ready with no outstanding issues

