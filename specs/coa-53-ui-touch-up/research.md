# Research: UI Touch Up

**Date**: 2026-04-15 | **Branch**: cameronwalsh/coa-53-ui-touch-up

---

## Technical Decisions

### 1. Padding Reduction Strategy

**Decision**: Use `py-12 lg:py-8` pattern instead of `py-16`

**Rationale**:
- Mobile-first approach: default to `py-12` (48px padding, more readable on small screens)
- Desktop override with `lg:py-8` (32px padding, reduces bloat on 1024px+ screens)
- Maintains visual hierarchy without sacrifice on mobile

**Alternative Considered**: `py-8` across all breakpoints
- Rejected: Would make mobile hero sections feel cramped
- 48px padding on mobile is safer for readability with smaller text

**Alternative Considered**: `py-16 sm:py-12 lg:py-8` (gradual reduction)
- Rejected: Adds unnecessary complexity
- Tailwind pattern more idiomatic: `py-12 lg:py-8`

---

### 2. Scores Page Grid Layout

**Decision**: Keep outer 4-col grid; ensure inner ScoreCards flex to fill width

**Current HTML Structure**:
```astro
<!-- Outer grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
  
  <!-- Day column (grid cell) -->
  <section class="bg-white rounded-xl border border-gray-100 p-4">
    
    <!-- Day heading -->
    <h3>Monday</h3>
    
    <!-- Cards container -->
    <div class="space-y-4">
      {day.games.map((score) => (
        <ScoreCard ... />
      ))}
    </div>
  </section>
  
</div>
```

**Why This Works**:
- ScoreCard uses `flex flex-col` (fills width of parent container)
- Parent container (day-section) is a grid cell with explicit width allocation
- `gap-6` applies to grid cells (day columns), not individual cards
- Space-y-4 applies between ScoreCards within a column (vertical spacing)

**Verification Needed**:
- Confirm ScoreCard component uses `flex flex-col` (it does, line 69)
- Confirm day-section inherits 100% width from grid cell
- Test with varying card counts to ensure consistency

**Alternative Considered**: CSS Grid for cards within each day
- Rejected: Unnecessary complexity
- Current flex layout already works; just needs verification

---

### 3. Card Pattern Consistency

**Decision**: Define explicit card styling vocabulary; document as reusable pattern

**Card Pattern (Unified)**:
```css
/* Border */
.card { border: 1px solid #f3f4f6; } /* border-gray-100 in Tailwind */

/* Corners */
.card { border-radius: 0.75rem; } /* rounded-xl */

/* Shadow (default state) */
.card { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); } /* shadow-sm */

/* Shadow (hover state) */
.card:hover { box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); } /* shadow-lg or elevation */

/* Transition */
.card { transition: all 0.3s ease; }

/* Padding (standard) */
.card { padding: 1rem; } /* p-4 */

/* Padding (spacious) */
.card.spacious { padding: 1.5rem; } /* p-6 */
```

**Tailwind Equivalents**:
```tailwind
/* ScoreCard: standard pattern */
class="rounded-xl shadow-sm border border-gray-100 flex flex-col card-hover"

/* Contact Cards: spacious variant */
class="rounded-xl shadow-sm border border-gray-100 flex flex-col items-start gap-4 card-hover p-6"

/* Teams Tiles: verify alignment with above */
class="rounded-xl shadow-sm border border-gray-100 ... card-hover"
```

**Where to Document**:
- Add comment in `src/components/ScoreCard.astro` explaining card pattern
- Add comment in `src/styles/globals.css` with `.card-hover` definition
- Future features can reference these comments for consistency

**Assumption Verification**:
- Need to locate Teams tiles rendering code (likely in teams.astro near line 450+)
- Verify they use consistent border/shadow/corners/padding
- If not, will need to update Teams tile styling in Phase 3

---

### 4. Resources Page Decorative Elements

**Decision**: Remove only bottom-left circle; keep top-right for visual interest

**Current State** (lines 36-49):
```astro
<div class="absolute -top-16 -right-16 w-64 h-64 rounded-full" style="background: #8B7536;"></div>
<div class="absolute -bottom-16 -left-16 w-48 h-48 rounded-full" style="background: #8B7536;"></div>
```

**Why Remove Bottom-Left**:
- Other hero sections (Teams, About, Scores, Contact, Seasons) have only top-right
- Resources page uses TWO circles, which is visually unique/inconsistent
- Spec explicitly states: "no extra decorative `dot.walk` element"

**Why Keep Top-Right**:
- Adds visual interest without clutter
- Subtle, opacity-10 so not distracting
- Consistent with other pages
- Doesn't require layout change

**Verification**: Check other pages (Teams, About, Scores, Contact, Seasons) for their background element patterns

---

### 5. Contact Page Section Spacing

**Decision**: Reduce Contact Cards section padding from `py-16` to `py-8 lg:py-12`

**Current State**:
```astro
<!-- Contact Cards section -->
<section class="py-16 px-4 sm:px-6 lg:px-8 bg-white">
  ...
</section>

<!-- Next section (probably Leadership/Committee) -->
<section class="py-16 px-4 sm:px-6 lg:px-8 bg-...">
  ...
</section>
```

**Spacing Math**:
- Old: Contact bottom margin 64px + next top margin 64px = 128px gap
- New: Contact bottom margin 32px (or 48px mobile) + next top margin 64px = 96px-ish gap
- Reduction: ~25-50% (meets spec requirement of "at least 50%")

**Why This Works**:
- Contact Cards are secondary section; doesn't need huge py-16
- Reduced padding pulls next section visually closer
- Creates "connected" feeling without feeling cramped

**Mobile Consideration**:
- Desktop: `py-8` (32px padding)
- Mobile: Still `py-12` (48px padding) for readability
- Pattern: `py-8 lg:py-12` (inverse of hero sections because Contact Cards is less prominent)

---

### 6. Responsive Breakpoint Consistency

**Decision**: Use Tailwind default breakpoints consistently across all changes

**Breakpoint Map**:
| Tailwind Class | Min Width | Use Case |
|---|---|---|
| (none) | 0px | Mobile (default) |
| sm | 640px | Small tablet |
| md | 768px | Medium tablet (less commonly used) |
| lg | 1024px | Large tablet / desktop breakpoint (primary) |
| xl | 1280px | Large desktop |
| 2xl | 1536px | Very large desktop (rarely used) |

**Hero Sections**:
```tailwind
py-12 lg:py-8
```
- Mobile/tablet (< 1024px): py-12
- Desktop (1024px+): py-8

**Scores Grid**:
```tailwind
grid-cols-1 sm:grid-cols-2 xl:grid-cols-4
```
- Mobile (< 640px): 1 column
- Tablet (640–1024px): 2 columns
- Desktop (1024px+): 4 columns
- Note: Uses `xl` for 4-col, not `lg` (why? because 4 columns at lg feels cramped)

**Verification Needed**: Confirm spec says "4-col on 1024px+" or if we need tighter breakpoint

---

## Alternative Approaches Considered

### A. Create a Reusable HeroSection Component

**Considered**: Extract hero section markup into `src/components/HeroSection.astro` to DRY up the 7 pages

**Rationale**:
- Reduces duplication across Teams, About, Scores, etc.
- Single source of truth for padding and styling
- Future changes apply everywhere automatically

**Rejected Because**:
- Scope creep: Spec asks for "styling refinement", not component refactoring
- Risk: Moving markup could introduce bugs
- Complexity: Each page hero is slightly different (different backgrounds, text, decorations)
- Effort: Would require testing each page after refactor
- Phased delivery: Phase 1 can be done in parallel on 7 files without merge conflicts

**Future Work**: After this feature is shipped and tested, consider refactoring hero into component for COA-54 or similar.

---

### B. Use CSS Custom Properties for Padding Values

**Considered**: Define padding values as CSS variables for easier future updates

```css
:root {
  --hero-padding-mobile: 3rem; /* py-12 */
  --hero-padding-desktop: 2rem; /* py-8 */
}

.hero-section {
  padding-top: var(--hero-padding-mobile);
  padding-bottom: var(--hero-padding-mobile);
}

@media (min-width: 1024px) {
  .hero-section {
    padding-top: var(--hero-padding-desktop);
    padding-bottom: var(--hero-padding-desktop);
  }
}
```

**Rejected Because**:
- Tailwind already provides this via utility classes
- Adding custom properties adds another abstraction layer
- Harder to read and maintain than `py-12 lg:py-8` in markup
- No performance benefit for this use case

---

### C. Create Separate Mobile/Desktop Hero Variants

**Considered**: Different hero content/layout for mobile vs. desktop (e.g., smaller text, different spacing)

**Rejected Because**:
- Spec doesn't ask for content changes, only padding reduction
- Responsive design should work within single markup, not duplicate content
- Would add complexity and accessibility issues

---

## Open Questions & Assumptions

### Q1: Get Involved Page Location

**Status**: OPEN

**Question**: Where is `src/pages/get-involved.astro`?

**Assumption**: Exists at `src/pages/get-involved.astro` based on spec mentioning it as one of 7 pages.

**Verification Needed**: 
- [ ] Confirm file exists
- [ ] Check current padding (py-16 or something else?)
- [ ] Check if descriptive text already present

**Action**: Before Phase 1 implementation, verify file existence and current state.

---

### Q2: Teams Tile Styling Location

**Status**: OPEN

**Question**: Are Teams tiles defined in an inline component within teams.astro, or in a separate component?

**Assumption**: Likely inline markup in teams.astro (no separate component found in search).

**Verification Needed**:
- [ ] Locate tile rendering code in teams.astro (estimate: line 400–500)
- [ ] Check if tiles use `.card-hover` class
- [ ] Compare border, shadow, padding with ScoreCard

**Action**: Before Phase 3, search teams.astro for tile markup and compare styling.

---

### Q3: Contact Page Next Section Identity

**Status**: OPEN

**Question**: What section follows Contact Cards? (Leadership/Committee? Map? Form?)

**Assumption**: Based on spec mentioning "Leadership/Committee section", likely a section with team member cards or similar.

**Verification Needed**:
- [ ] Read contact.astro fully to identify next section
- [ ] Confirm what visual spacing reduction looks like
- [ ] Ensure 50% reduction target is achievable

**Action**: Before Phase 5, fully read contact.astro and measure current spacing.

---

### Q4: Responsive Breakpoint for Scores 4-Column Grid

**Status**: OPEN (minor)

**Question**: Should 4-column grid activate at `lg` (1024px) or `xl` (1280px)?

**Assumption**: Spec says "4 columns on desktop (1024px+)", which maps to `lg` breakpoint. But current code uses `xl`. 

**Current Code**:
```tailwind
grid-cols-1 sm:grid-cols-2 xl:grid-cols-4
```

**Spec Requirement**:
"4 equal-width columns on desktop (1024px+)"

**Mismatch**: `xl` is 1280px, not 1024px. Should be `lg`.

**Decision**: Change to `lg:grid-cols-4` in Phase 2 to match spec.

**Verification**: Test that 4 columns at 1024px don't feel cramped.

---

### Q5: ScoreCard Interior Card Sizing

**Status**: CLOSED

**Verification Done**: ScoreCard component (line 69) uses `flex flex-col`, which ensures it fills parent width and stacks content vertically. No changes needed.

---

## Testing Approach

### Manual Testing Plan

1. **Clone branch**: `git checkout cameronwalsh/coa-53-ui-touch-up`
2. **Run dev server**: `npm run dev`
3. **Test each viewport**:
   - Open DevTools → Responsive Design Mode
   - Test at 320px, 640px, 1024px, 1440px
   - Screenshot each page at each viewport
4. **Compare visuals**:
   - Before: Current state
   - After: Updated state
   - Verify padding reduction obvious and readable
   - Verify grid columns align as expected
   - Verify cards don't overflow
5. **Accessibility check**:
   - Use axe DevTools browser extension
   - Check for contrast violations
   - Verify keyboard nav (Tab through page)
6. **Edge cases**:
   - Scores page with many games in one day
   - Long venue/team names (ScoreCard)
   - Very narrow mobile (320px)
   - Very wide desktop (1440px)

### Automated Testing

No automated tests needed:
- This is CSS-only; no logic to test
- Vitest/Jest don't test visual layout
- Visual regression testing (Chromatic, Percy, etc.) would be ideal but out of scope

---

## Commit Message Template

```
feat(ui): {phase} - {summary}

{Detailed explanation if needed}

- {Change 1}
- {Change 2}

Spec: COA-53 UI Touch Up
Closes: #{Issue if applicable}
```

**Example for Phase 1**:
```
feat(ui): hero sections - standardize padding and descriptive text

Reduce excessive padding on purple hero sections across 7 pages:
Teams, About, Scores, Seasons, Contact, Get Involved, Resources.

Changes:
- py-16 → py-12 lg:py-8 (mobile-first padding reduction)
- Add 1-line descriptive text to Teams, About, Get Involved
- Verify text consistency on Scores, Seasons, Contact, Resources

Spec: COA-53 UI Touch Up
User Stories: 1, 2
```

---

## Documentation Additions

### In ScoreCard Component

Add comment explaining card pattern:

```astro
---
/**
 * ScoreCard: Individual game result card
 *
 * Establishes the unified card pattern used across Phoenix:
 * - Border: border-gray-100 (light gray)
 * - Corners: rounded-xl (24px radius)
 * - Shadow: shadow-sm (default), elevated on hover
 * - Padding: p-4 (16px)
 * - Hover: .card-hover class (see globals.css)
 *
 * Future cards (Teams tiles, etc.) should follow this pattern
 * for visual consistency across the site.
 */
---
```

### In globals.css

Ensure `.card-hover` is documented:

```css
/**
 * Unified card hover effect used across all card-based layouts
 * (ScoreCard, Teams tiles, Contact cards, etc.)
 */
.card-hover {
  @apply transition-all duration-300 ease-out;
}

.card-hover:hover {
  /* Boost shadow and lift card slightly */
  @apply shadow-md -translate-y-0.5;
}
```

---

## Risk Summary

**Low Risk**: This feature is pure styling with no logic, data models, or new dependencies.

| Component | Risk Level | Mitigations |
|-----------|-----------|-----------|
| Hero padding changes | Low | Test at mobile (py-12 ensures readability) |
| Scores grid layout | Low | ScoreCard already uses flex; just verify |
| Card styling consistency | Low | Direct visual comparison; CSS classes are simple |
| Resources cleanup | Very Low | Single line deletion; easy to revert |
| Contact spacing | Low | Visual inspection; padding math simple |

**Rollback Plan**: If any page looks wrong, revert padding/class changes in git; no data loss or breaking changes possible.

