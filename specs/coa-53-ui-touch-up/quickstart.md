# Quickstart: UI Touch Up Testing

**Date**: 2026-04-15 | **Spec**: COA-53 | **Branch**: cameronwalsh/coa-53-ui-touch-up

---

## Setup

### Prerequisites

- Node.js 20+
- Phoenix project cloned
- Branch: `cameronwalsh/coa-53-ui-touch-up`

### Start Development Server

```bash
cd phoenix
npm run dev
```

Server runs at `http://localhost:3000` (or displayed port).

---

## Test Data & Seeding

### Scores Page

**Data File**: `scripts/scores-data.json` (if available)

**Placeholder Data**: Built-in placeholder with 1 game (Teams, About, Scores pages use fallback data)

**For Testing**: Current placeholder should be sufficient; focus on layout, not data completeness.

---

## Manual Verification Checklist

### Phase 1: Hero Sections (All 7 Pages)

#### Visit Each Page

```
Teams:        http://localhost:3000/teams
About:        http://localhost:3000/about
Scores:       http://localhost:3000/scores
Seasons:      http://localhost:3000/seasons
Contact:      http://localhost:3000/contact
Get Involved: http://localhost:3000/get-involved
Resources:    http://localhost:3000/resources
```

#### At Each Page, Check Hero Section

**Desktop (1024px+)**
- [ ] Heading in UPPERCASE white text
- [ ] Gold subtitle above heading
- [ ] Gold divider line below heading
- [ ] 1-line descriptive text below divider
- [ ] Padding **visibly reduced** (should feel compact, not bloated)
- [ ] Decorative background circles (if any) subtle and not distracting

**Tablet (640–1024px)**
- [ ] Same hero layout as desktop
- [ ] Text readable without zoom
- [ ] No horizontal scrolling

**Mobile (< 640px)**
- [ ] Hero text still readable
- [ ] Padding `py-12` maintains visual hierarchy
- [ ] No truncation of title or description
- [ ] No horizontal scrolling

#### Example: Teams Page

**Expected Layout**:
```
[Subtle background circle in top-right corner, opacity-10]

    BENDIGO PHOENIX JUNIORS
    (gold subtitle, small, uppercase, tracking-widest)
    
    TEAMS
    (white, large, bold, uppercase)
    
    ―――――――――
    (gold divider line, h-1 w-16)
    
    Browse and discover the perfect team for your child.
    (descriptive text, purple-200 color, base font size)
```

### Phase 2: Scores Page Grid

**URL**: http://localhost:3000/scores

#### Responsive Layout Verification

**Desktop (1024px+)**
- [ ] **4 columns** visible (Monday, Tuesday, Wednesday, Friday)
- [ ] Each column occupies ~25% width (minus gaps)
- [ ] Columns have equal spacing between them (gap-6 = 24px)
- [ ] All ScoreCards within a day have **identical height** (whether day has 1 or 5 cards)
- [ ] Card width uniform within column
- [ ] No horizontal scrolling

**Tablet (640–1024px)**
- [ ] At 640px: Grid switches to **2 columns**
- [ ] Columns are equal width
- [ ] Cards maintain uniform height
- [ ] No horizontal scrolling

**Mobile (< 640px)**
- [ ] **1 column** (vertical stack)
- [ ] Cards full width (minus padding)
- [ ] Cards readable without zoom
- [ ] No horizontal scrolling

#### ScoreCard Content Verification

For cards that exist, check:
- [ ] Competition label (e.g., "Bendigo Basketball Association")
- [ ] Result badge (W/L/D/TBD)
- [ ] Team names and scores (no truncation)
- [ ] Date and time formatted consistently
- [ ] Venue name (with ellipsis if long)

#### Card Styling

- [ ] Border: 1px gray-100 visible
- [ ] Corners: Rounded (24px radius)
- [ ] Shadow: Subtle shadow-sm visible
- [ ] Padding: Interior content has breathing room (p-4)
- [ ] Hover: Cursor changes; shadow elevates on hover

---

### Phase 3: Card Pattern Consistency

**Locations to Compare**:
- Teams page tiles
- Scores page cards
- Contact page cards

**Side-by-Side Comparison** (open in separate tabs at 1024px+):

```
http://localhost:3000/teams       (row of team tiles)
http://localhost:3000/scores      (grid of score cards)
http://localhost:3000/contact     (grid of contact cards)
```

#### Styling Checklist

- [ ] **Border**: Same color (gray-100) and weight (1px) across all cards
- [ ] **Corners**: All cards use rounded-xl (24px radius)
- [ ] **Shadow**: Default state has shadow-sm; hover elevates
- [ ] **Padding**: Interior content has consistent spacing (p-4 or p-6)
- [ ] **Hover Effect**:
  - [ ] Cursor becomes pointer
  - [ ] Shadow elevates (more prominent)
  - [ ] Transition timing smooth (~300ms)
  - [ ] 2px lift (translateY) visible

#### Visual Inspection

Hover over:
1. A Team tile → note shadow/lift effect
2. A ScoreCard → same effect should trigger
3. A Contact card → same effect should trigger

If effects differ, note the discrepancy for Phase 3 review.

---

### Phase 4: Resources Page Cleanup

**URL**: http://localhost:3000/resources

#### Hero Section Verification

**Visual Check**:
- [ ] Only **one circular background** element (top-right corner)
- [ ] Background circle is subtle (opacity-10)
- [ ] **No second circular element** in bottom-left corner
- [ ] Hero section matches other pages (Teams, About, Scores)

**What Should NOT Be Visible**:
- [ ] No bottom-left circle
- [ ] No extra decorative shapes

**Tab Bar Below Hero**:
- [ ] Coaching Resources, Player Resources, Manager Resources, Guides tabs visible
- [ ] Tab styling clean and readable

---

### Phase 5: Contact Page Spacing

**URL**: http://localhost:3000/contact

#### Spacing Verification

**Desktop (1024px+)**:
- [ ] Contact hero section (with "CONTACT US" heading) visible
- [ ] Below hero: Contact Cards section (Address, Email, Social Media)
- [ ] Below Contact Cards: **Next section** (Leadership/Committee or similar)
- [ ] **Vertical gap between Contact Cards and next section is noticeably reduced**
  - Should feel like sections belong together, not separate paragraphs
  - Estimate: ~50% less whitespace than current state

**Mobile (< 640px)**:
- [ ] Contact Cards stack vertically
- [ ] Spacing between sections maintained (not cramped)
- [ ] All content readable

#### Detailed Check

Scroll through page:
1. [ ] Hero section visible
2. [ ] Contact Cards (Address, Email, Social) displayed
3. [ ] Gap between Contact Cards section and next section **visibly reduced**
4. [ ] Page feels cohesive (not like unrelated sections)
5. [ ] No content orphaned or cut off

---

## Visual Regression Testing

### Screenshot Workflow

For each page and viewport, capture before/after:

1. **Setup**:
   - Open DevTools → Toggle Device Toolbar
   - Set viewport: 320px, 640px, 1024px, 1440px

2. **Capture**:
   - DevTools → Menu (⋯) → More Tools → Screenshots
   - OR: Save viewport screenshot manually

3. **Compare**:
   - Side-by-side comparison
   - Note changes in padding, spacing, alignment

### Viewports to Test

| Viewport | Width | Device | Purpose |
|----------|-------|--------|---------|
| Mobile Small | 320px | iPhone SE | Minimum width |
| Mobile Large | 428px | iPhone 14 | Typical mobile |
| Tablet | 768px | iPad | Intermediate |
| Desktop Small | 1024px | MacBook Air | Laptop minimum |
| Desktop Large | 1440px | iMac | Standard monitor |

### Visual Regression Checklist

**Hero Sections** (all 7 pages):
- [ ] Padding reduced visibly on desktop (1024px+)
- [ ] Text readable on mobile (320px)
- [ ] Descriptive text present
- [ ] Spacing consistent across pages

**Scores Page**:
- [ ] 4-column layout at desktop (1024px+)
- [ ] 2-column layout at tablet (640–1024px)
- [ ] 1-column layout at mobile (< 640px)
- [ ] Cards uniform within column
- [ ] No truncation at any size

**Contact Page**:
- [ ] Section spacing reduced
- [ ] Sections feel connected
- [ ] Content not orphaned

**Resources Page**:
- [ ] Single background circle (not two)
- [ ] Hero matches other pages

---

## Accessibility Testing

### Color Contrast

Use **axe DevTools** browser extension:

1. Open page
2. Click axe DevTools icon
3. Click "Scan this page"
4. Review results:
   - [ ] No critical contrast violations
   - [ ] No warnings for hero section text
   - [ ] Gold (#D4AF37) on purple meets 4.5:1 ratio

### Keyboard Navigation

For each page:

1. [ ] Press **Tab** repeatedly
2. [ ] Focus indicator visible on interactive elements (buttons, links)
3. [ ] Focus order logical (left-to-right, top-to-bottom)
4. [ ] No keyboard traps

### Screen Reader (macOS/Windows)

If available, test with:
- [ ] NVDA (Windows) or
- [ ] JAWS or
- [ ] VoiceOver (macOS)

**Checklist**:
- [ ] Page heading announced correctly
- [ ] Descriptive text read aloud
- [ ] Card content readable in sequence
- [ ] No screen-reader-only barriers

---

## Common Issues & Fixes

### Issue: Hero Padding Looks Too Tight on Mobile

**Symptom**: Text cramped; heading feels squished

**Fix**: Verify `py-12 lg:py-8` pattern applied (not just `py-8`)

```astro
<!-- ❌ Wrong: Tiny on mobile -->
<section class="py-8 ...">

<!-- ✅ Correct: Comfortable on mobile, compact on desktop -->
<section class="py-12 lg:py-8 ...">
```

---

### Issue: Scores Grid Shows 5 Columns at 1024px

**Symptom**: Columns too narrow; layout broken

**Fix**: Verify `lg:grid-cols-4` is used, not `xl:grid-cols-4`

```tailwind
<!-- ❌ Wrong: Breaks at 1024px -->
grid-cols-1 sm:grid-cols-2 xl:grid-cols-4

<!-- ✅ Correct: 4 columns at 1024px -->
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
```

---

### Issue: ScoreCards Have Different Heights

**Symptom**: Cards in same day column misaligned vertically

**Fix**: Ensure day-section container uses `flex flex-col` and ScoreCard uses `flex-1` or explicit height:

```astro
<!-- Day section container -->
<section class="flex flex-col gap-4">
  {day.games.map((score) => (
    <ScoreCard ... />  <!-- Uses flex flex-col; fills width -->
  ))}
</section>
```

---

### Issue: Resources Page Still Shows Two Circles

**Symptom**: Extra decorative circle visible in bottom-left

**Fix**: Verify second `<div>` with `absolute -bottom-16 -left-16 ...` removed:

```astro
<!-- ❌ Wrong: Two circles -->
<div class="absolute -top-16 -right-16 ..."></div>
<div class="absolute -bottom-16 -left-16 ..."></div>

<!-- ✅ Correct: One circle only -->
<div class="absolute -top-16 -right-16 ..."></div>
```

---

### Issue: Contact Page Spacing Not Reduced

**Symptom**: Gap between Contact Cards and next section unchanged

**Fix**: Verify Contact Cards section padding changed:

```astro
<!-- ❌ Wrong: Still py-16 -->
<section class="py-16 ...">

<!-- ✅ Correct: Reduced to py-8 -->
<section class="py-8 lg:py-12 ...">
```

---

## Testing Summary

**Total Test Cases**: ~30

| Area | Tests | Status |
|------|-------|--------|
| Hero Sections (7 pages) | 7 × 3 viewports = 21 | [ ] |
| Scores Grid | 3 breakpoints | [ ] |
| Card Consistency | 3 pages side-by-side | [ ] |
| Resources Cleanup | 1 visual check | [ ] |
| Contact Spacing | 2 viewports | [ ] |
| Accessibility | 3 checks (contrast, keyboard, ARIA) | [ ] |

---

## Sign-Off Checklist

After testing, confirm:

- [ ] All 7 pages render with standardized hero sections
- [ ] Padding reduced to py-8 on desktop, py-12 on mobile
- [ ] Descriptive text present on all pages
- [ ] Scores page grid: 4/2/1 columns at desktop/tablet/mobile
- [ ] ScoreCards uniform height within day columns
- [ ] Card styling consistent across Teams, Scores, Contact pages
- [ ] Resources page: Single background circle (no dot.walk)
- [ ] Contact page: Section spacing reduced by ~50%
- [ ] No horizontal scrolling at any viewport
- [ ] Accessibility: Contrast, keyboard nav, screen reader OK
- [ ] No regressions: Other pages unaffected

---

## Troubleshooting

### Dev Server Won't Start

```bash
# Clear cache
rm -rf .astro/

# Reinstall dependencies
npm install

# Start fresh
npm run dev
```

### Changes Not Visible

```bash
# Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
# OR: Open DevTools → Network tab → Disable cache → Refresh

# Check git status
git status

# Verify branch
git branch
```

### Responsive Design Mode Issues

```
Chrome/Edge:
  F12 → Ctrl+Shift+M (or Cmd+Shift+M on Mac)
  
Firefox:
  F12 → Ctrl+Shift+M
  
Safari:
  Develop → Enter Responsive Design Mode
```

---

## Quick Links

- **Spec**: `/specs/coa-53-ui-touch-up/spec.md`
- **Plan**: `/specs/coa-53-ui-touch-up/plan.md`
- **Research**: `/specs/coa-53-ui-touch-up/research.md`
- **Dev Server**: `http://localhost:3000`
- **Pages**:
  - Teams: `/teams`
  - About: `/about`
  - Scores: `/scores`
  - Seasons: `/seasons`
  - Contact: `/contact`
  - Get Involved: `/get-involved`
  - Resources: `/resources`

