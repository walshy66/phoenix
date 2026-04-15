# Implementation Order & Tasks

**Spec**: COA-53 UI Touch Up | **Branch**: cameronwalsh/coa-53-ui-touch-up | **Date**: 2026-04-15

---

## Phase Execution Order

Execute phases **sequentially** to maintain code consistency and enable incremental testing.

### Phase 1: Hero Section Standardization (2–3 hours)

**Objective**: Standardize title sections across all 7 pages

**Files to Modify**:
1. `src/pages/teams.astro` (line ~128)
2. `src/pages/about.astro` (line ~6)
3. `src/pages/scores.astro` (line ~81)
4. `src/pages/seasons.astro` (line ~11)
5. `src/pages/contact.astro` (line ~7)
6. `src/pages/get-involved.astro` (line TBD)
7. `src/pages/resources/index.astro` (line ~36)

**Change Template**:

```astro
<!-- BEFORE -->
<section class="bg-brand-purple py-16 px-4 text-center relative overflow-hidden">
  <div class="absolute inset-0 opacity-10 pointer-events-none">
    <div class="absolute -top-16 -right-16 w-64 h-64 rounded-full" style="background: #8B7536;"></div>
  </div>
  <div class="relative z-10 max-w-3xl mx-auto">
    <p class="text-brand-gold font-bold text-sm uppercase tracking-widest mb-3">SUBTITLE</p>
    <h1 class="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight">TITLE</h1>
    <div class="h-1 w-16 bg-brand-gold mx-auto mt-4"></div>
    <!-- May or may not have descriptive text -->
  </div>
</section>

<!-- AFTER -->
<section class="bg-brand-purple py-12 lg:py-8 px-4 text-center relative overflow-hidden">
  <div class="absolute inset-0 opacity-10 pointer-events-none">
    <div class="absolute -top-16 -right-16 w-64 h-64 rounded-full" style="background: #8B7536;"></div>
  </div>
  <div class="relative z-10 max-w-3xl mx-auto">
    <p class="text-brand-gold font-bold text-sm uppercase tracking-widest mb-3">SUBTITLE</p>
    <h1 class="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight">TITLE</h1>
    <div class="h-1 w-16 bg-brand-gold mx-auto mt-4"></div>
    <p class="text-purple-200 mt-4 text-base max-w-xl mx-auto">
      One-line descriptive text explaining this page's purpose.
    </p>
  </div>
</section>
```

**Specific Changes per Page**:

| Page | Current Padding | Change To | Add Text? | Text Content |
|------|---|---|---|---|
| teams.astro | py-16 | py-12 lg:py-8 | YES | "Browse and discover the perfect team for your child." |
| about.astro | py-16 | py-12 lg:py-8 | YES | [Check existing content; add if missing] |
| scores.astro | py-16 | py-12 lg:py-8 | VERIFY | Already has "Live Updates" text |
| seasons.astro | py-16 | py-12 lg:py-8 | VERIFY | Already has descriptive text |
| contact.astro | py-16 | py-12 lg:py-8 | VERIFY | Already has "We'd love to hear from you..." text |
| get-involved.astro | TBD | py-12 lg:py-8 | YES | [Determine appropriate text] |
| resources/index.astro | py-16 | py-12 lg:py-8 | VERIFY | Already has descriptive text |

**Verification Steps**:
1. [ ] Read each page's current state (verify padding and text)
2. [ ] Update padding: `py-16` → `py-12 lg:py-8`
3. [ ] Add/verify descriptive text where missing
4. [ ] Test at 320px, 640px, 1024px, 1440px
5. [ ] Visual regression screenshot each page

**Commit Message**:
```
feat(ui): hero sections - standardize padding and descriptive text

Reduce excessive padding on purple hero sections across 7 pages:
Teams, About, Scores, Seasons, Contact, Get Involved, Resources.

Changes:
- py-16 → py-12 lg:py-8 (mobile-first responsive padding)
- Add 1-line descriptive text to Teams, About, Get Involved
- Verify text consistency on Scores, Seasons, Contact, Resources

Spec: COA-53 UI Touch Up
User Stories: 1, 2
```

---

### Phase 2: Scores Page Grid Refinement (1 hour)

**Objective**: Fix day-column grid layout for uniform card sizing

**File**: `src/pages/scores.astro` (line ~112)

**Current Code**:
```astro
<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
  {scoresByDay.map((day) => (
    <section class="bg-white rounded-xl border border-gray-100 p-4">
      <h3 class="text-lg font-bold text-brand-black mb-4">{day.label}</h3>

      {day.games.length > 0 ? (
        <div class="space-y-4">
          {day.games.map((score: any) => (
            <ScoreCard
              homeTeam={score.homeTeam}
              awayTeam={score.awayTeam}
              homeScore={score.homeScore}
              awayScore={score.awayScore}
              date={score.date}
              time={score.time}
              venue={score.venue}
              court={score.court}
              competition={score.competition}
              status={score.status}
            />
          ))}
        </div>
      ) : (
        <div class="text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg p-3">
          No games scheduled.
        </div>
      )}
    </section>
  ))}
</div>
```

**Changes**:

1. **Change grid breakpoint** from `xl:grid-cols-4` to `lg:grid-cols-4`:
   ```astro
   <!-- BEFORE -->
   <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

   <!-- AFTER -->
   <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
   ```

2. **Verify** day-section container ensures equal width:
   - Grid cells (`<section>` elements) inherit 100% width from grid
   - No need for explicit width specification
   - Verify `gap-6` applies correctly

3. **Verify** ScoreCard interior layout:
   - ScoreCard uses `flex flex-col` (line 69)
   - Fills parent width automatically
   - No changes needed to ScoreCard component

**Testing**:
1. [ ] Load scores.astro
2. [ ] At 1024px: 4 columns visible
3. [ ] At 768px: Verify transition (should be 2 columns at sm breakpoint)
4. [ ] At 640px: Still 2 columns
5. [ ] At 320px: 1 column
6. [ ] All cards uniform height within day
7. [ ] No horizontal scrolling
8. [ ] No card truncation

**Commit Message**:
```
feat(ui): scores page grid - refine responsive layout

Fix day-column grid layout to ensure uniform card sizing:
- Change breakpoint: xl:grid-cols-4 → lg:grid-cols-4 (activate at 1024px)
- Verify 4-col/2-col/1-col responsive rendering
- Ensure ScoreCards uniform height within day columns

Spec: COA-53 UI Touch Up
User Story: 3
```

---

### Phase 3: Card Pattern Consistency (30–45 minutes)

**Objective**: Verify ScoreCard + Teams tiles use identical styling

**Files to Review**:
- `src/components/ScoreCard.astro` (verify styling)
- `src/pages/teams.astro` (locate + compare tile styling)
- `src/styles/globals.css` (verify .card-hover class)

**Card Pattern (Reference)**:
```
border-gray-100 1px
rounded-xl (24px)
shadow-sm (default)
shadow-md on hover
p-4 or p-6 (padding)
card-hover (transition effect)
```

**Steps**:

1. [ ] Open ScoreCard.astro (line 69):
   - Verify: `rounded-xl shadow-sm border border-gray-100 flex flex-col card-hover`
   - Document: "Establishes unified card pattern"

2. [ ] Open teams.astro and locate team tile rendering:
   - Search for `grid` or `flex` near line 300+ (teams listing)
   - Find markup that renders team cards/tiles
   - Compare styling with ScoreCard

3. [ ] If Teams tiles use different styling:
   - [ ] Update to match ScoreCard pattern
   - [ ] Apply `rounded-xl border border-gray-100 shadow-sm card-hover`
   - [ ] Match padding (p-4 or p-6)

4. [ ] Verify `globals.css` has `.card-hover` class:
   ```css
   .card-hover {
     @apply transition-all duration-300 ease-out;
   }
   .card-hover:hover {
     @apply shadow-md -translate-y-0.5;
   }
   ```

5. [ ] Add comment to ScoreCard explaining pattern:
   ```astro
   ---
   /**
    * ScoreCard: Establishes unified card pattern used across Phoenix
    * - Border: border-gray-100 (light gray)
    * - Corners: rounded-xl (24px)
    * - Shadow: shadow-sm (default), elevated on hover
    * - Padding: p-4 (16px)
    * - Hover: .card-hover class provides transition + elevation
    *
    * Future cards should follow this pattern for consistency.
    */
   ---
   ```

**Testing** (Visual Side-by-Side):

1. [ ] Open browser tabs:
   - Tab 1: `http://localhost:3000/teams` (scroll to team tiles)
   - Tab 2: `http://localhost:3000/scores` (scroll to score cards)

2. [ ] Compare visually:
   - [ ] Border color identical
   - [ ] Border weight identical (1px)
   - [ ] Corner radius identical (rounded-xl)
   - [ ] Shadow styling identical (shadow-sm)
   - [ ] Padding consistent (p-4)
   - [ ] Hover effect (shadow elevation + lift) identical

3. [ ] If differences found:
   - Document in research.md
   - Decide: Align Teams to ScoreCard, or vice versa
   - Update styling in Phase 3 or flag for future work

**Commit Message**:
```
docs(ui): card pattern - document unified styling

Establish and document unified card pattern used across Phoenix:
- ScoreCard (Scores page)
- Teams tiles (Teams page)
- Contact cards (Contact page)

Card pattern:
- Border: border-gray-100 1px
- Corners: rounded-xl
- Shadow: shadow-sm (default), shadow-md on hover
- Padding: p-4
- Hover: .card-hover transition + elevation

Add comments to ScoreCard and globals.css explaining pattern.
Verify Teams tiles and Contact cards alignment.

Spec: COA-53 UI Touch Up
User Story: 4
```

---

### Phase 4: Resources Page Cleanup (15 minutes)

**Objective**: Remove decorative dot.walk background element

**File**: `src/pages/resources/index.astro` (line ~36–40)

**Current Code**:
```astro
<section class="bg-brand-purple py-16 px-4 text-center relative overflow-hidden">
  <div class="absolute inset-0 opacity-10 pointer-events-none">
    <div class="absolute -top-16 -right-16 w-64 h-64 rounded-full" style="background: #8B7536;"></div>
    <div class="absolute -bottom-16 -left-16 w-48 h-48 rounded-full" style="background: #8B7536;"></div>
  </div>
  ...
</section>
```

**Change**:

Delete line ~39 (the second circular div):

```astro
<!-- REMOVE THIS LINE -->
<div class="absolute -bottom-16 -left-16 w-48 h-48 rounded-full" style="background: #8B7536;"></div>

<!-- RESULT -->
<section class="bg-brand-purple py-16 px-4 text-center relative overflow-hidden">
  <div class="absolute inset-0 opacity-10 pointer-events-none">
    <div class="absolute -top-16 -right-16 w-64 h-64 rounded-full" style="background: #8B7536;"></div>
  </div>
  ...
</section>
```

**Testing**:

1. [ ] Load `http://localhost:3000/resources`
2. [ ] Visually compare hero section with other pages (Teams, About, Scores)
3. [ ] Verify:
   - [ ] Only one circular background (top-right)
   - [ ] No bottom-left circle visible
   - [ ] Hero matches pattern of other pages

**Commit Message**:
```
feat(ui): resources page - remove duplicate decorative element

Remove extraneous bottom-left circular background from Resources page hero.
Aligns with hero pattern used on other pages (single top-right circle).

Spec: COA-53 UI Touch Up
User Story: 5
```

---

### Phase 5: Contact Page Spacing (15 minutes)

**Objective**: Reduce vertical gap between Contact Cards and next section

**File**: `src/pages/contact.astro` (line ~22)

**Current Code**:
```astro
<!-- Contact Cards Section -->
<section class="py-16 px-4 sm:px-6 lg:px-8 bg-white">
  <div class="max-w-7xl mx-auto">
    <!-- Grid of 3 contact cards -->
  </div>
</section>

<!-- Next Section (Leadership/Committee or similar) -->
<section class="py-16 px-4 sm:px-6 lg:px-8 bg-...">
  ...
</section>
```

**Change**:

Update Contact Cards section padding from `py-16` to `py-8 lg:py-12`:

```astro
<!-- BEFORE -->
<section class="py-16 px-4 sm:px-6 lg:px-8 bg-white">

<!-- AFTER -->
<section class="py-8 lg:py-12 px-4 sm:px-6 lg:px-8 bg-white">
```

**Reasoning**:
- Desktop: py-8 (32px padding) reduces gap by ~50%
- Mobile: py-12 (48px padding) maintains readability
- Creates "connected" feeling between sections

**Testing**:

1. [ ] Load `http://localhost:3000/contact`
2. [ ] Scroll to view Contact Cards section
3. [ ] Visually inspect vertical gap:
   - [ ] Gap noticeably reduced from current state
   - [ ] Sections feel related, not orphaned
   - [ ] Mobile spacing (py-12) still readable
4. [ ] Verify on:
   - [ ] Desktop (1440px)
   - [ ] Tablet (768px)
   - [ ] Mobile (320px)

**Commit Message**:
```
feat(ui): contact page - reduce section spacing

Reduce vertical padding on Contact Cards section from py-16 to py-8 lg:py-12.
Creates visual cohesion with next section; reduces excessive whitespace.

Spacing reduction:
- Desktop: 64px → 32px (50% reduction)
- Mobile: 64px → 48px (25% reduction, maintains readability)

Spec: COA-53 UI Touch Up
User Story: 6
```

---

## Task Checklist (Implementation)

### Phase 1: Hero Sections

**Task 1.1**: teams.astro
- [ ] Read current hero section (line ~128)
- [ ] Change `py-16` → `py-12 lg:py-8`
- [ ] Add descriptive text: "Browse and discover the perfect team for your child."
- [ ] Test at 320px, 640px, 1024px, 1440px
- [ ] Screenshot for before/after comparison

**Task 1.2**: about.astro
- [ ] Read current hero section (line ~6)
- [ ] Change `py-16` → `py-12 lg:py-8`
- [ ] Check if descriptive text present; add if missing
- [ ] Test at all breakpoints

**Task 1.3**: scores.astro
- [ ] Read current hero section (line ~81)
- [ ] Change `py-16` → `py-12 lg:py-8`
- [ ] Verify "Live Updates" text present
- [ ] Test at all breakpoints

**Task 1.4**: seasons.astro
- [ ] Read current hero section (line ~11)
- [ ] Change `py-16` → `py-12 lg:py-8`
- [ ] Verify descriptive text present
- [ ] Test at all breakpoints

**Task 1.5**: contact.astro
- [ ] Read current hero section (line ~7)
- [ ] Change `py-16` → `py-12 lg:py-8`
- [ ] Verify "We'd love to hear from you..." text present
- [ ] Test at all breakpoints

**Task 1.6**: get-involved.astro
- [ ] Locate file and hero section
- [ ] Change `py-16` → `py-12 lg:py-8`
- [ ] Add appropriate descriptive text
- [ ] Test at all breakpoints

**Task 1.7**: resources/index.astro
- [ ] Read current hero section (line ~36)
- [ ] Change `py-16` → `py-12 lg:py-8`
- [ ] Verify descriptive text present
- [ ] Test at all breakpoints

**Task 1.8**: Commit Phase 1
- [ ] Review all 7 page changes
- [ ] Commit with provided message

---

### Phase 2: Scores Grid

**Task 2.1**: scores.astro grid
- [ ] Locate outer grid (line ~112)
- [ ] Change `xl:grid-cols-4` → `lg:grid-cols-4`
- [ ] Verify day-section containers inherit width
- [ ] Test at 1024px, 768px, 640px, 320px
- [ ] Verify 4/2/1 column layout

**Task 2.2**: ScoreCard verification
- [ ] Confirm ScoreCard component uses `flex flex-col` (it does)
- [ ] No changes to component needed

**Task 2.3**: Test uniform card sizing
- [ ] At 1024px: 4 columns with equal widths
- [ ] Load multiple score games in one day
- [ ] Verify cards have identical height
- [ ] Screenshot for verification

**Task 2.4**: Commit Phase 2
- [ ] Review grid changes
- [ ] Commit with provided message

---

### Phase 3: Card Consistency

**Task 3.1**: ScoreCard review
- [ ] Open src/components/ScoreCard.astro
- [ ] Verify line 69 uses: `rounded-xl shadow-sm border border-gray-100 flex flex-col card-hover`
- [ ] Add documentation comment explaining pattern

**Task 3.2**: Teams tiles review
- [ ] Open src/pages/teams.astro
- [ ] Locate team tile rendering (search for grid/flex around line 300+)
- [ ] Compare with ScoreCard styling

**Task 3.3**: Verify .card-hover class
- [ ] Open src/styles/globals.css
- [ ] Confirm .card-hover class exists with proper hover effects
- [ ] If missing, create it

**Task 3.4**: Side-by-side visual test
- [ ] Open Teams page at 1024px (separate tab)
- [ ] Open Scores page at 1024px (separate tab)
- [ ] Open Contact page at 1024px (separate tab)
- [ ] Compare visually: border, shadow, corners, padding, hover
- [ ] Document any differences

**Task 3.5**: Commit Phase 3 (if changes made)
- [ ] If Teams tiles need updating, commit those changes
- [ ] If .card-hover needs creation, commit that
- [ ] Commit documentation comments

---

### Phase 4: Resources Cleanup

**Task 4.1**: resources/index.astro
- [ ] Open file and locate line ~36
- [ ] Find and delete the second circular div (line ~39)
- [ ] Verify only one circle remains

**Task 4.2**: Test
- [ ] Load http://localhost:3000/resources
- [ ] Verify only top-right circle visible
- [ ] Compare with other pages visually

**Task 4.3**: Commit Phase 4
- [ ] Review deletion
- [ ] Commit with provided message

---

### Phase 5: Contact Spacing

**Task 5.1**: contact.astro
- [ ] Open file and locate Contact Cards section (line ~22)
- [ ] Change `py-16` → `py-8 lg:py-12`

**Task 5.2**: Test
- [ ] Load http://localhost:3000/contact
- [ ] Scroll to Contact Cards section
- [ ] Verify spacing reduced at desktop (1024px+)
- [ ] Verify spacing still readable on mobile (320px)

**Task 5.3**: Commit Phase 5
- [ ] Review change
- [ ] Commit with provided message

---

## Post-Implementation Testing

### Full Visual Regression

After all phases complete:

1. [ ] Test all 7 pages at 320px, 640px, 1024px, 1440px
2. [ ] Take screenshots at each viewport
3. [ ] Compare with original state (visual diff)
4. [ ] Document any unexpected changes

### Accessibility Audit

- [ ] Run axe DevTools on each page
- [ ] Check contrast ratios (gold/purple/white text)
- [ ] Test keyboard navigation (Tab through pages)
- [ ] Verify focus indicators visible
- [ ] Test screen reader (if available)

### Manual QA Checklist

- [ ] No horizontal scrolling at any viewport
- [ ] All text readable and not truncated
- [ ] Cards maintain uniform sizing
- [ ] Spacing feels balanced and intentional
- [ ] Hover effects work smoothly
- [ ] Mobile layout feels natural at 320px

### Performance Check

- [ ] Run Lighthouse (Performance, Accessibility, Best Practices)
- [ ] Verify no CSS bloat
- [ ] No new dependencies introduced
- [ ] Bundle size unchanged

---

## Git Workflow

### Before Starting

```bash
git checkout cameronwalsh/coa-53-ui-touch-up
git pull origin cameronwalsh/coa-53-ui-touch-up
```

### During Implementation

```bash
# After each phase
git add src/pages/...
git commit -m "feat(ui): {phase} - {summary}"

# Before final submission
git log --oneline -5  # Verify commits
git diff main..HEAD   # Review changes
```

### After All Phases

```bash
# Verify final state
git status  # Should be clean
git log --oneline -5  # Should show 5 commits (1 per phase)

# Push to GitHub (prepare for PR)
git push origin cameronwalsh/coa-53-ui-touch-up
```

---

## Time Estimates

| Phase | Tasks | Est. Time | Status |
|-------|-------|-----------|--------|
| 1 | Hero sections (7 pages) | 1.5–2 hrs | [ ] |
| 2 | Scores grid | 45 min | [ ] |
| 3 | Card consistency | 30–45 min | [ ] |
| 4 | Resources cleanup | 15 min | [ ] |
| 5 | Contact spacing | 15 min | [ ] |
| Testing | Visual regression + accessibility | 1–1.5 hrs | [ ] |
| **Total** | — | **4–5 hrs** | — |

