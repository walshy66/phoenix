# Implementation Plan: UI Touch Up

**Branch**: cameronwalsh/coa-53-ui-touch-up | **Date**: 2026-04-15 | **Spec**: `/specs/coa-53-ui-touch-up/spec.md`

---

## Summary

This feature standardizes visual consistency across 7 high-traffic pages (Teams, About, Scores, Seasons, Contact, Get Involved, Resources) by:

1. **Title Section Standardization**: Adding consistent 1-line descriptive text to Teams, About, Scores, Seasons, Contact, Get Involved, and Resources pages
2. **Padding Reduction**: Reducing excessive purple hero section padding from `py-16` to `py-8` on desktop (keeping `py-12` on mobile)
3. **Scores Card Layout**: Refining the day-column grid from flexible to fixed 4-col/2-col/1-col responsive structure with uniform card sizing
4. **Card Pattern Consistency**: Aligning ScoreCard styling with Teams tiles (border, shadow, hover effects, padding)
5. **Resources Cleanup**: Removing the `dot.walk` decorative background element (duplicate circles) from Resources page hero
6. **Contact Spacing**: Reducing vertical gap between Contact Cards and next section by 50%

These are pure **frontend CSS/Tailwind changes** with no backend modifications, data model changes, or new components needed.

---

## Technical Context

- **Framework**: Astro 5.x with React 19 for interactive components
- **Styling**: Tailwind CSS with custom brand color palette
- **Language**: TypeScript + Astro component markup
- **Target Browsers**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Responsive Breakpoints**: 
  - Mobile: < 640px (sm)
  - Tablet: 640px–1024px (md/lg)
  - Desktop: 1024px+ (xl/2xl)
- **Images**: Optimized SVGs for brand assets
- **Performance Goals**: No bundle size increase; pure CSS optimization
- **Scale**: ~7 pages, 2-3 components, 0 new dependencies

---

## Constitution Compliance

### Principle I: User Outcomes First
**Status**: PASS
- Each change delivers clear visual improvement (consistency, reduced whitespace, better readability)
- Success is observable and measurable (spacing values, card alignment, grid columns)
- No feature bloat; purely UX polish

### Principle II: Test-First Discipline
**Status**: PASS
- All changes testable via visual regression at breakpoints: 320px, 640px, 1024px, 1440px
- No behavior logic; acceptance criteria are visual/layout checks
- No data model changes, so no unit test burden

### Principle III: Backend Authority & Invariants
**Status**: PASS
- Frontend-only CSS changes; no data mutations or server-side logic
- No invariants affected
- No client-side state inference

### Principle IV: Error Semantics & Observability
**Status**: PASS
- No new error conditions introduced
- Existing error states (empty Scores page, no teams) unaffected
- No logging or observability changes needed

### Principle V: AppShell Integrity
**Status**: PASS
- All changes confined to existing pages within `BaseLayout.astro`
- No custom navigation shells or layout structures introduced
- Responsive design maintained across all breakpoints

### Principle VI: Accessibility First
**Status**: PASS
- Spacing changes maintain contrast and readability (WCAG 2.1 AA)
- Tap targets remain > 44px minimum
- Keyboard navigation unaffected
- Focus indicators preserved
- No color changes that affect color-dependent information
- Grid reflow on mobile maintains logical reading order

### Principle VII: Immutable Data Flow
**Status**: PASS
- No data flow, state management, or data structure changes
- Pure presentation layer modifications
- No client-side data inference or calculation

### Principle VIII: Dependency Hygiene
**Status**: PASS
- Zero new dependencies
- No package.json changes
- No version updates required

### Principle IX: Cross-Feature Consistency
**Status**: PASS
- Establishes **Unified Hero Section Pattern**: All title sections use identical spacing (`py-8` desktop, `py-12` mobile) with consistent text hierarchy
- Establishes **Unified Card Pattern**: ScoreCard + Teams tiles use identical styling (border, shadow, corners, padding, hover)
- Prevents future design fragmentation through pattern standardization

---

## Project Structure

```
src/
├── pages/
│   ├── teams.astro              ← Hero: Add 1-liner, reduce py-16→py-8
│   ├── about.astro              ← Hero: Add 1-liner, reduce py-16→py-8
│   ├── scores.astro             ← Hero: Add 1-liner, reduce py-16→py-8
│   │                            ← Grid: Fix day-column layout
│   ├── seasons.astro            ← Hero: Add 1-liner, reduce py-16→py-8
│   ├── contact.astro            ← Hero: Add 1-liner, reduce py-16→py-8
│   │                            ← Reduce section spacing
│   ├── get-involved.astro       ← Hero: Add 1-liner, reduce py-16→py-8
│   ├── resources/
│   │   └── index.astro          ← Hero: Add 1-liner, reduce py-16→py-8, remove dot.walk
│
├── components/
│   ├── ScoreCard.astro          ← Verify card styling consistent with pattern
│   └── (no new components needed)
│
└── styles/
    └── globals.css              ← Verify .card-hover class exists
```

---

## Phased Delivery

### Phase 1: Hero Section Standardization (P1 Stories 1-2)

**Objective**: Standardize title sections across all 7 pages with consistent padding and descriptive text.

**Changes**:
- **teams.astro** (line 128-137): Reduce `py-16` → `py-8`, add descriptive text after divider
- **about.astro** (line 6-19): Reduce `py-16` → `py-8`, add descriptive text after divider
- **scores.astro** (line 81-90): Reduce `py-16` → `py-8`, add "Live Updates" text (already present; ensure consistency)
- **seasons.astro** (line 11-24): Already has `py-16`; reduce to `py-8`, text already present
- **contact.astro** (line 7-19): Already has text; reduce `py-16` → `py-8`
- **get-involved.astro** (line TBD): Reduce `py-16` → `py-8`, add descriptive text
- **resources/index.astro** (line 36-49): Reduce `py-16` → `py-8`, verify text present

**Detailed Changes**:

```astro
<!-- OLD -->
<section class="bg-brand-purple py-16 px-4 text-center relative overflow-hidden">

<!-- NEW -->
<section class="bg-brand-purple py-8 lg:py-12 px-4 text-center relative overflow-hidden">
```

Note: On mobile, Tailwind's `py-12` is default; on desktop (lg breakpoint), use `py-8`. This requires checking if `py-12` needs explicit mobile breakpoint.

**Responsive Pattern**:
- Mobile (< 640px): `py-12` (maintain readability on small screens)
- Desktop (1024px+): `py-8` (reduce excessive whitespace)
- Tailwind: `py-12 lg:py-8` or add custom breakpoint if needed

**Files Modified**: 7 `.astro` page files
**Testing**: Visual regression at 320px (mobile), 640px (tablet), 1024px (desktop), 1440px (desktop+)

---

### Phase 2: Scores Page Grid Refinement (P1 Story 3)

**Objective**: Fix day-column grid layout to ensure uniform card sizing and consistent column widths.

**Current State** (scores.astro lines 112-141):
```astro
<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
  {scoresByDay.map((day) => (
    <section class="bg-white rounded-xl border border-gray-100 p-4">
      <!-- Day header + cards -->
    </section>
  ))}
</div>
```

**Issue**: 
- Day-columns are containers, not grid cells
- ScoreCard components inside are in a flex/space-y-4 layout
- Column widths don't guarantee uniform card sizing across different card counts
- Need to ensure all ScoreCards within a day have identical height/width

**Solution**:
1. Keep outer grid: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`
2. Add inner grid for ScoreCards to ensure uniform sizing:
   ```astro
   <div class="space-y-3">  <!-- Keep as space-y to separate cards in same column -->
     {day.games.map((score) => (
       <ScoreCard ... />
     ))}
   </div>
   ```
3. ScoreCards already use `flex flex-col`; ensure they fill parent width

**Implementation Steps**:
- Verify ScoreCard component uses consistent sizing (it does: `flex flex-col` with p-4)
- Adjust day-column container to ensure equal width allocation
- Add comment for grid breakpoints: 4 cols (desktop 1024px+), 2 cols (tablet 640-1024px), 1 col (mobile < 640px)

**Files Modified**: 
- `src/pages/scores.astro` (grid structure)
- No component changes needed

**Testing**: 
- Verify 4 equal columns render at 1024px+ with varying card counts
- Verify 2 equal columns at 640-1024px
- Verify 1 column at < 640px
- Check cards don't overflow or have inconsistent heights

---

### Phase 3: Card Pattern Consistency (P1 Story 4)

**Objective**: Ensure ScoreCard and Teams tiles use identical styling for borders, shadows, hover effects, and padding.

**Current State**:
- **ScoreCard**: `rounded-xl shadow-sm border border-gray-100` with `card-hover` class
- **Teams tiles**: Found in teams.astro around line TBD (need to locate)

**Card Pattern Definition** (establish reusable vocabulary):
```css
/* Border */
border border-gray-100

/* Corners */
rounded-xl

/* Shadow (default) */
shadow-sm

/* Hover effect */
.card-hover {
  transition: all 0.3s ease;
}
.card-hover:hover {
  /* Boost shadow on hover */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Padding */
p-4 (or p-6 for larger cards)
```

**Tasks**:
1. Locate Teams page tile rendering (teams.astro line ~450+)
2. Extract Teams tile component or inline markup
3. Compare styling with ScoreCard
4. Align: ensure both use `rounded-xl border border-gray-100 shadow-sm card-hover`
5. Test hover effects on both components

**Files Modified**:
- `src/pages/teams.astro` (verify tile styling)
- `src/components/ScoreCard.astro` (verify consistency)
- `src/styles/globals.css` (verify `.card-hover` class defined)

**Testing**: 
- Side-by-side visual comparison at 1024px
- Verify hover effects trigger at identical speed/elevation
- Check padding consistency (p-4 or p-6)

---

### Phase 4: Resources Cleanup (P2 Story 5)

**Objective**: Remove decorative `dot.walk` elements from Resources page hero section.

**Current State** (resources/index.astro lines 36-49):
```astro
<section class="bg-brand-purple py-16 px-4 text-center relative overflow-hidden">
  <div class="absolute inset-0 opacity-10 pointer-events-none">
    <div class="absolute -top-16 -right-16 w-64 h-64 rounded-full" style="background: #8B7536;"></div>
    <div class="absolute -bottom-16 -left-16 w-48 h-48 rounded-full" style="background: #8B7536;"></div>  ← REMOVE THIS
  </div>
  ...
</section>
```

**Changes**:
- Remove the second circular div (bottom-left)
- Keep only the top-right circle to match pattern used on other pages

**Before**:
```astro
<div class="absolute -top-16 -right-16 w-64 h-64 rounded-full" style="background: #8B7536;"></div>
<div class="absolute -bottom-16 -left-16 w-48 h-48 rounded-full" style="background: #8B7536;"></div>
```

**After**:
```astro
<div class="absolute -top-16 -right-16 w-64 h-64 rounded-full" style="background: #8B7536;"></div>
```

**Files Modified**: 
- `src/pages/resources/index.astro` (1 line deletion)

**Testing**: 
- Visual inspection: Resources hero matches Teams/About/Scores/etc.
- Verify no decorative elements on mobile (< 640px)

---

### Phase 5: Contact Page Spacing (P2 Story 6)

**Objective**: Reduce vertical gap between Contact Cards section and next section by ~50%.

**Current State** (contact.astro lines 22+):
```astro
<section class="py-16 px-4 sm:px-6 lg:px-8 bg-white">
  <!-- Contact Cards grid -->
</section>

<!-- Next section starts here with its own py-16 -->
```

**Issue**: Two consecutive `py-16` sections create excessive whitespace (~64px top + ~64px bottom = 128px total).

**Solution**: Reduce Contact Cards section from `py-16` to `py-8`:
```astro
<!-- Before -->
<section class="py-16 px-4 sm:px-6 lg:px-8 bg-white">

<!-- After -->
<section class="py-8 lg:py-12 px-4 sm:px-6 lg:px-8 bg-white">
```

This reduces top gap from 64px to 32px (desktop) or 48px (mobile), creating visual cohesion.

**Files Modified**: 
- `src/pages/contact.astro` (1 class change)

**Testing**: 
- Visual inspection at desktop: spacing between Contact Cards and next section noticeably reduced
- Verify mobile spacing (py-12) remains readable

---

## Responsive Design Considerations

### Breakpoints Used

| Breakpoint | Tailwind | Screen Size | Usage |
|-----------|----------|-------------|-------|
| Mobile | None | < 640px | Default; py-12, grid-cols-1 |
| Tablet | sm/md/lg | 640–1024px | py-12, grid-cols-2 |
| Desktop | lg/xl | 1024px+ | py-8, grid-cols-4 |
| Large Desktop | 2xl | 1440px+ | py-8, grid-cols-4 (unchanged) |

### Key Changes by Breakpoint

**Hero Sections**:
- Mobile (< 640px): `py-12` (maintain readability)
- Desktop (1024px+): `py-8` (reduce bloat)
- Tablet: Inherit mobile `py-12` unless explicitly overridden

**Scores Page Grid**:
- Mobile (< 640px): `grid-cols-1` (single column)
- Tablet (640–1024px): `grid-cols-2` (2 columns)
- Desktop (1024px+): `grid-cols-4` (4 columns)
- All cards: Same height/width within column

**Contact Page**:
- Mobile: `py-8 lg:py-12` (smaller top/bottom gap)
- Desktop: Same reduced gap maintained

---

## Testing Strategy

### Visual Regression Testing

**Viewports to Test**:
1. **320px** (mobile small): Smallest phone screen
2. **640px** (tablet small): iPad portrait
3. **1024px** (tablet large): iPad landscape / desktop breakpoint
4. **1440px** (desktop): Standard monitor

**Test Cases**:

#### Hero Sections (All 7 Pages)
- [ ] Subtitle (gold, small, uppercase) visible and correctly spaced
- [ ] Main heading (white, large, uppercase, bold) present
- [ ] Gold divider line (h-1 w-16) rendered correctly
- [ ] Descriptive text (1 line) present and readable
- [ ] Padding reduced: py-8 on desktop (1024px+), py-12 on mobile
- [ ] Decorative background circles don't overflow on mobile
- [ ] No horizontal scrolling at any viewport

#### Scores Page Grid
- [ ] 4 equal columns render at 1024px+ (each ~25% width minus gaps)
- [ ] 2 equal columns render at 640–1024px (each ~50% width minus gaps)
- [ ] 1 column renders at < 640px
- [ ] Cards maintain uniform height within each day column
- [ ] Cards within a day don't overflow or wrap text
- [ ] Gaps between columns consistent (gap-6)
- [ ] No horizontal scrolling

#### Card Styling (ScoreCard + Teams Tiles)
- [ ] Border: gray-100, 1px, visible on white background
- [ ] Corners: rounded-xl (24px radius)
- [ ] Shadow: shadow-sm (subtle, visible on hover)
- [ ] Padding: p-4 (16px) consistent
- [ ] Hover effect: Shadow elevation + 2px translateY applied
- [ ] Transition timing: Smooth 0.3s ease

#### Resources Page
- [ ] Only one circular background element (top-right)
- [ ] Bottom-left circle removed
- [ ] Hero matches other pages visually

#### Contact Page
- [ ] Vertical gap between Contact Cards and next section reduced
- [ ] Section feels cohesive (not orphaned)
- [ ] Spacing at mobile (py-12) maintains readability

### Accessibility Testing

- [ ] **Contrast**: All text meets WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text)
- [ ] **Keyboard Navigation**: Tab through all interactive elements; focus visible
- [ ] **Screen Reader**: Headings, descriptions, links announced correctly
- [ ] **Color Not Sole Indicator**: Gold dividers don't carry meaning; text labels present
- [ ] **Touch Targets**: All buttons/links ≥ 44px in both dimensions
- [ ] **Spacing**: Reduced padding doesn't cause truncation or overlap

### Edge Cases

- [ ] **Long Team Names** (Teams page): Names truncate gracefully; tiles don't overflow
- [ ] **Varying Game Counts** (Scores page): Days with 1 game vs. 5+ games render at same column width
- [ ] **Empty States** (Scores page): "No games scheduled" message displays correctly
- [ ] **Very Long Venue Names** (ScoreCard): Text truncates with ellipsis; tooltip shows full name
- [ ] **Narrow Viewports** (< 320px): Layout degrades gracefully; no horizontal scrolling

### Manual Testing Checklist

1. **Desktop (1440px)**
   - [ ] All pages load without errors
   - [ ] Hero sections reduced padding; text readable
   - [ ] Scores page: 4 equal columns with uniform cards
   - [ ] Contact page: Spacing reduced, cohesive
   - [ ] Resources page: No decorative circles

2. **Tablet (1024px)**
   - [ ] Grid switches from 4 to 2 columns
   - [ ] All text readable
   - [ ] Cards maintain sizing

3. **Tablet (640px)**
   - [ ] At breakpoint: grid still 2 columns
   - [ ] Spacing looks good

4. **Mobile (320px)**
   - [ ] Single column grid
   - [ ] Hero text readable with smaller padding
   - [ ] No horizontal scrolling
   - [ ] Touch targets 44px+

### Tooling & Capture

- **Visual Regression**: Take screenshots at each viewport; compare before/after
- **Browser DevTools**: Use responsive design mode to test breakpoints
- **Accessibility**: axe DevTools, WAVE, or similar to check contrast and structure
- **Performance**: Lighthouse to ensure no CSS bloat

---

## Implementation Order

Execute phases **sequentially** (each depends on previous for consistency):

1. **Phase 1** (Hero Sections): 7 pages, 1 change each (py-16 → py-8, add text)
2. **Phase 2** (Scores Grid): 1 page, grid refinement
3. **Phase 3** (Card Consistency): Review & verify pattern alignment (no major changes expected)
4. **Phase 4** (Resources Cleanup): 1 line deletion
5. **Phase 5** (Contact Spacing): 1 class change

**Estimated Effort**: 
- Phase 1: 1–2 hours (straightforward padding + text changes)
- Phase 2: 1 hour (grid CSS adjustment)
- Phase 3: 30 min (verification + testing)
- Phase 4: 15 min (1 line deletion)
- Phase 5: 15 min (1 class change)
- **Total**: ~3–4 hours development + testing

---

## Key Files to Modify

### Phase 1 (7 files)
```
src/pages/teams.astro              Line 128: py-16 → py-8, add text
src/pages/about.astro              Line 6: py-16 → py-8, add text
src/pages/scores.astro             Line 81: py-16 → py-8 (text already present)
src/pages/seasons.astro            Line 11: py-16 → py-8 (text already present)
src/pages/contact.astro            Line 7: py-16 → py-8 (text already present)
src/pages/get-involved.astro       Line TBD: py-16 → py-8, add text
src/pages/resources/index.astro    Line 36: py-16 → py-8, remove dot.walk
```

### Phase 2 (1 file)
```
src/pages/scores.astro             Line 112: Verify/adjust grid for uniform card sizing
```

### Phase 3 (Review only; no changes expected)
```
src/components/ScoreCard.astro     Verify styling
src/pages/teams.astro              Locate & verify tile styling
src/styles/globals.css             Verify .card-hover class
```

### Phase 4 (1 file, 1 line)
```
src/pages/resources/index.astro    Line 39: Delete second circular background
```

### Phase 5 (1 file, 1 change)
```
src/pages/contact.astro            Line 22: py-16 → py-8 lg:py-12
```

---

## Complexity Tracking

**No Constitutional Deviations**: This feature is pure CSS/Tailwind refinement. All changes conform to established patterns and principles.

**No Additional Complexity**: 
- Zero new components
- Zero new dependencies
- Zero new state or logic
- Zero data model changes
- Zero backend changes

**Simplicity Wins**:
- Phased delivery allows independent testing of each page
- All changes are mechanical (padding values, grid classes, text additions)
- No algorithmic complexity or business logic
- Rollback is trivial (revert padding/class changes)

---

## Deliverables

### On Completion

1. **All 7 pages** render with:
   - Consistent hero section padding (py-8 desktop, py-12 mobile)
   - Descriptive 1-liner text in hero section
   - No decorative background clutter

2. **Scores page** renders with:
   - Fixed 4-col/2-col/1-col responsive grid
   - Uniform card sizing within each day column
   - Properly spaced gaps

3. **Card styling** verified:
   - ScoreCard and Teams tiles use identical pattern
   - Border, shadow, corners, padding, hover effects consistent

4. **Contact page** renders with:
   - Reduced vertical spacing between sections
   - Cohesive visual flow

5. **Test coverage**:
   - Visual regression tests at 320px, 640px, 1024px, 1440px
   - Accessibility spot-checks (contrast, keyboard, screen reader)
   - Edge cases validated

---

## Success Criteria from Spec

- **SC-001**: ✅ All hero sections identical padding (py-8 desktop, py-12 mobile)
- **SC-002**: ✅ 7 pages display 1-line descriptive text
- **SC-003**: ✅ Scores grid 4/2/1 columns with consistent spacing
- **SC-004**: ✅ ScoreCards uniform height/width in same day column
- **SC-005**: ✅ Resources hero: no dot.walk; matches pattern
- **SC-006**: ✅ Contact spacing reduced 50%
- **SC-007**: ✅ Card styling: rounded-xl border border-gray-100 shadow-sm
- **SC-008**: ✅ Visual regression at 320/640/1024/1440px; no scrolling
- **SC-009**: ✅ WCAG 2.1 AA contrast & accessibility maintained

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Padding change breaks mobile layout | Test at 320px; adjust py-12 if needed |
| Scores cards overflow in day columns | Ensure container width = 100%; cards scale proportionally |
| Teams tiles don't align with ScoreCard | Direct visual comparison; adjust border/shadow/padding |
| Contact page spacing feels disconnected | Visual inspection at desktop & mobile; verify gap ≥ 50% reduction |
| Resources page circles return | Code review; verify second div deleted |
| Responsive breakpoint misalignment | Use Tailwind breakpoints consistently (sm/md/lg/xl) |

---

## Notes for Implementation

1. **Tailwind Breakpoint Reminder**:
   - `py-12` applies to all screens by default
   - `lg:py-8` overrides at 1024px+ breakpoint
   - Pattern: `py-12 lg:py-8` for reduced desktop padding

2. **Card Pattern Consistency**:
   - Establish `.card-hover` class in globals.css if missing
   - Document class usage in comments for future features

3. **Scores Grid**:
   - Verify `gap-6` applies to all breakpoints
   - Ensure day-column containers have `flex-1` or explicit width

4. **Testing Priority**:
   - Desktop (1024px+): Most traffic; design intent clearest
   - Mobile (320px): Edge case; hardest to read
   - Tablet (640px): Breakpoint transition; verify column switch

5. **Commit Strategy**:
   - Commit each phase separately for clarity
   - Commit message: "feat(ui): {phase} - {summary}" (e.g., "feat(ui): hero sections - standardize padding and text")
   - Link to spec/issue in commit body

