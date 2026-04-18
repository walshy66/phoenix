# Tasks: COA-67 Fixes (UI & Link Corrections)

**Input**: Specs from `specs/coa-67-fixes/`
**Strategy**: Option C Execution Windows (GSD-aligned)
**Windows**: 5 total, estimated 280–380k tokens total across all windows

---

## Format Guide

- **[P]**: Can run in parallel (different files, same window)
- **Window N**: Execution context boundary (fresh 200k context window)
- **WINDOW_CHECKPOINT**: Validation gate before next window
- **Traceability**: Each task traces back to spec (FR-XXX, AC-XXX, US-X)
- **Dependency**: What prior work must be done

---

## Execution Window 1: Home Page Card Fixes (P1)

**Purpose**: Fix navigation links and text labels on home page cards (blocks user journeys to teams and resources)

**Token Budget**: 60–80k

**Checkpoint Validation**:
- [ ] Team card href changed from `/team/` to `/teams/`
- [ ] Team card title text reads "Teams" (not "Team")
- [ ] Team card subtitle reads "Your team results and ladder"
- [ ] Coaching Resources card href is `/resources/`
- [ ] Desktop layout (1024px) shows no regression
- [ ] All AC-1 through AC-6 passing

---

### T001 Update home page Team card link and text labels

**Window**: 1 (Home Page Cards)
**Phase**: Frontend — Text & Link Updates
**Traceability**: FR-001, FR-002, FR-003, FR-004; AC-1 through AC-6; US-1
**Dependencies**: None (can start immediately)
**Description**: Modify Team card quickLinks array entry in home page component to correct href and text

**What to create/modify**:
- File: `src/pages/index.astro`
- Locate: `quickLinks` array (or equivalent card data structure on home page)
- Changes:
  - Team card href: Change from `/team/` to `/teams/`
  - Team card title: Change from "Team" to "Teams"
  - Team card subtitle: Change from "Meet our players, coaches and staff" to "Your team results and ladder"
  - Verify Coaching Resources card href is `/resources/` (if not already correct)
- No CSS changes needed at this stage; text updates only

**Test Expectations**:
```
Manual test:
1. Open home page in browser (desktop 1024px)
2. Click Team card → verify URL is `/teams/` in address bar
3. Read Team card text → verify title says "Teams"
4. Read subtitle text → verify it says "Your team results and ladder"
5. Verify card layout unchanged from original (no visual regression at 1024px)
6. Click Coaching Resources card → verify URL is `/resources/`
```

**Success Criteria**:
- AC-1: Team card displays "Teams" as title
- AC-2: Team card subtitle reads "Your team results and ladder"
- AC-3: Team card link goes to `/teams/` (desktop click test)
- AC-4: Team card link works on mobile (375px)
- AC-5: Coaching Resources card navigates to `/resources/`
- AC-6: Desktop layout (1024px) unchanged

---

[WINDOW_CHECKPOINT_1]

**Before proceeding to Window 2**:
- [ ] T001: Team card text and links updated and verified
- [ ] Home page displays correct text labels on all breakpoints
- [ ] Both card links resolve to correct routes (`/teams/` and `/resources/`)
- [ ] No visual regression on desktop (1024px, 1920px)
- [ ] All AC-1 through AC-6 passing

If checkpoint passes, proceed to Window 2.
If checkpoint fails, remain in Window 1 and fix issues.

---

## Execution Window 2: Modal Image Display Fixes (P1)

**Purpose**: Fix image cropping and display issues in uniform information and registration modals on mobile

**Token Budget**: 70–90k

**Checkpoint Validation**:
- [ ] Modal images display in full (no cropping) at 320px, 375px, 768px
- [ ] Images maintain aspect ratio without distortion
- [ ] Modal scrolling works correctly when content exceeds viewport height
- [ ] Missing/failed images display gracefully with fallback
- [ ] All AC-7 through AC-12 passing

---

### T002 Audit existing modal component and identify image container CSS

**Window**: 2 (Modal Image Fixes)
**Phase**: Frontend — CSS Analysis
**Traceability**: FR-005, FR-006; AC-7 through AC-12; US-2, US-3
**Dependencies**: T001 (home page done; ready to move to modals)
**Description**: Read and document current modal image CSS to identify overflow and sizing issues

**What to do**:
- File: `src/components/SeasonInfoModal.astro` (or equivalent modal component used by uniform information and registration forms)
- Identify:
  - Current image container sizing (width, height, max-width, max-height)
  - Current overflow behavior (visible, hidden, auto, scroll)
  - Current object-fit value (if any)
  - Breakpoint-specific CSS rules affecting modal height
  - Modal scroll container configuration
- Document findings in a task comment or development notes
- Screenshot current state on mobile emulation (375px, 768px) to confirm cropping issue

**Test Expectations**:
```
Visual inspection:
1. Open DevTools, set device to iPhone SE (375px)
2. Navigate to page with uniform information modal
3. Take screenshot showing image cropping/overflow issue
4. Document current CSS rules on image and container elements
5. Verify this matches the spec screenshot (cropped images)
```

**Success Criteria**:
- Current CSS rules documented (overflow, sizing)
- Cropping issue visually confirmed at 375px
- Ready to implement CSS fix in next task

---

### T003 [P] Fix modal image CSS with object-fit and responsive sizing

**Window**: 2 (Modal Image Fixes)
**Phase**: Frontend — CSS Implementation
**Traceability**: FR-005, FR-006; AC-7 through AC-9; US-2
**Dependencies**: T002 (CSS audit complete)
**Description**: Update modal image container CSS to prevent cropping and maintain aspect ratio

**What to modify**:
- File: `src/components/SeasonInfoModal.astro`
- Changes:
  - Add `object-fit: contain` to image elements (preserves aspect ratio, no distortion)
  - Set image `max-width: 100%` and `max-height: 100%` within modal bounds
  - Ensure modal container has `overflow-y: auto` or `overflow: hidden` with appropriate height constraints
  - Test at breakpoints: 320px, 375px, 768px
  - No changes to desktop layout (1024px+)
- Use Tailwind utilities where possible (e.g., `object-contain`, `max-w-full`, `max-h-full`)

**Test Expectations**:
```
Manual test at multiple breakpoints:
1. DevTools iPhone SE (375px):
   - Open uniform information modal
   - Verify image displays in full (width and height visible, no cropping)
   - Verify image doesn't distort or stretch
   - Scroll modal content → verify image remains properly sized
2. Repeat at 320px (ultra-small phone)
3. Repeat at 768px (tablet)
4. Desktop 1024px → verify no regression in modal appearance
5. Verify modal height adapts to content without breaking
```

**Success Criteria**:
- AC-7: Images display in full on mobile without cropping
- AC-8: Images don't distort when scrolling
- AC-9: Images adapt responsively on small phones (320px)
- No desktop regressions

---

### T004 [P] Test registration modal image display on mobile

**Window**: 2 (Modal Image Fixes)
**Phase**: Frontend — Testing
**Traceability**: FR-006; AC-10 through AC-11; US-3
**Dependencies**: T003 (modal CSS fixed)
**Description**: Verify registration modal (same component as uniform modal) displays images correctly after CSS fix

**What to test**:
- File: (Same modal component used by registration; verify via code inspection)
- Test scenarios:
  1. Open registration form/modal on 375px (mobile)
  2. Verify all images in registration modal display in full (no cropping)
  3. Scroll through registration form → verify images remain visible and properly sized
  4. Test on 320px ultra-small phone → confirm responsive adaptation
  5. Verify form remains functional after CSS changes (no interaction breakage)
- Compare before/after screenshots to confirm fix

**Test Expectations**:
```
Manual test:
1. Navigate to registration page/modal on mobile (375px)
2. Screenshot modal with images visible
3. Scroll through form content
4. Verify image scaling matches uniform modal fix (same component, same CSS)
5. Repeat on 320px and 768px to confirm consistency
```

**Success Criteria**:
- AC-10: Registration modal images display in full on mobile
- AC-11: Images remain visible when scrolling through form
- Registration form interaction not broken by CSS changes

---

### T005 [P] Test modal image fallback behavior when image fails to load

**Window**: 2 (Modal Image Fixes)
**Phase**: Frontend — Edge Case Testing
**Traceability**: FR-005, FR-006; AC-12; NFR-009
**Dependencies**: T003 (modal CSS finalized)
**Description**: Verify modal displays gracefully if image URL is broken or missing

**What to test**:
- File: `src/components/SeasonInfoModal.astro`
- Test method:
  1. Temporarily modify an image src to a broken URL in development
  2. Open modal and verify:
     - Modal still displays (doesn't crash)
     - Broken image shows fallback (alt text, placeholder background color, or browser default)
     - Modal layout doesn't collapse or shift
     - Other content in modal remains accessible
  3. Restore correct image src after testing
- Verify CSS includes fallback background color for image containers (if not already present)

**Test Expectations**:
```
Manual test:
1. Set image src to broken URL (e.g., /broken-image.png)
2. Open modal
3. Verify modal renders without error
4. Verify broken image area shows gracefully (no layout break)
5. Verify other modal content is still accessible and readable
6. Restore correct image src
```

**Success Criteria**:
- AC-12: Modal displays gracefully when image fails to load
- NFR-009: No layout collapse or modal crash on missing images
- Fallback appearance acceptable (no visual errors)

---

[WINDOW_CHECKPOINT_2]

**Before proceeding to Window 3**:
- [ ] T002: Modal CSS audit documented
- [ ] T003: Modal image CSS updated (object-fit, sizing)
- [ ] T004: Registration modal tested and confirmed fixed
- [ ] T005: Fallback behavior verified for missing images
- [ ] All AC-7 through AC-12 passing
- [ ] Modal images display correctly at 320px, 375px, 768px without cropping
- [ ] No desktop regressions at 1024px, 1920px

If checkpoint passes, proceed to Window 3.
If checkpoint fails, remain in Window 2 and fix issues.

---

## Execution Window 3: Filter Layout Fixes (P2)

**Purpose**: Fix filter overflow and layout issues on Teams and Resources pages on mobile

**Token Budget**: 80–100k

**Checkpoint Validation**:
- [ ] Teams page filters wrap or scroll appropriately on mobile (375px)
- [ ] Resources page filters occupy ≤50% of viewport height on mobile
- [ ] No layout shift when filters are applied
- [ ] Tab navigation and focus management work correctly on filters
- [ ] All AC-13 through AC-18 passing

---

### T006 Audit Teams and Resources page filter layouts

**Window**: 3 (Filter Layout Fixes)
**Phase**: Frontend — CSS Analysis
**Traceability**: FR-007, FR-008; AC-13 through AC-18; US-4, US-5
**Dependencies**: T005 (modals done; ready for filter work)
**Description**: Document current filter component CSS to identify overflow issues at mobile breakpoints

**What to do**:
- Files:
  - `src/components/FilterBar.astro` (shared filter component)
  - `src/pages/teams.astro` (Teams page using FilterBar)
  - `src/pages/resources/index.astro` (Resources page using FilterBar)
- Identify:
  - Current flex layout on filter container (flex-direction, flex-wrap, gap)
  - Current filter button sizing and spacing
  - Breakpoint-specific rules (if any)
  - How filters are rendered on mobile (375px) — are they wrapping or overflowing?
  - Current height constraints on filter section
  - How much vertical space filters consume on mobile
- Document findings and take screenshots at 375px to confirm overflow/layout issue
- Compare findings against spec (FR-007 — wrap or scroll; FR-008 — ≤50% viewport height)

**Test Expectations**:
```
Visual inspection:
1. DevTools: Set to mobile (375px)
2. Navigate to Teams page
3. Screenshot showing filter overflow/wrapping behavior (should show issue)
4. Navigate to Resources page
5. Screenshot showing filter height and resource list visibility (should show filter taking >50% space)
6. Document current CSS flex rules
```

**Success Criteria**:
- Current CSS rules documented for FilterBar
- Mobile filter layout issues visually confirmed at 375px
- Filter overflow/height issues match spec description

---

### T007 [P] Update FilterBar component to wrap filters on mobile

**Window**: 3 (Filter Layout Fixes)
**Phase**: Frontend — CSS Implementation
**Traceability**: FR-007; AC-13 through AC-15; US-4
**Dependencies**: T006 (CSS audit complete)
**Description**: Update FilterBar flex layout to wrap filter buttons on mobile

**What to modify**:
- File: `src/components/FilterBar.astro`
- Changes:
  - Add or update flex-wrap rule: `flex-wrap: wrap` on filter container (or use Tailwind `flex-wrap`)
  - Ensure gap spacing is consistent when buttons wrap to multiple lines
  - Verify filter buttons don't exceed max-width constraints that would prevent wrapping
  - Test at 375px to confirm wrapping behavior
  - Maintain tab navigation (Tab key works through wrapped buttons, focus order preserved)
  - No CSS changes for desktop (1024px+) — filters should display horizontally without wrapping
- Use Tailwind utilities (e.g., `flex`, `flex-wrap`, `gap-2`) for consistency

**Test Expectations**:
```
Manual test at mobile:
1. DevTools: 375px (iPhone SE)
2. Navigate to Teams page
3. Verify filter buttons wrap to multiple lines (no horizontal overflow)
4. Verify no layout shift when filters are applied/changed
5. Verify gap spacing is consistent between wrapped rows
6. Tab through filters using keyboard → verify focus order is logical and indicators visible
7. Desktop 1024px → verify filters display horizontally without wrapping (no regression)
8. Verify filter functionality not broken (filters still apply when clicked)
```

**Success Criteria**:
- AC-13: Filters fit within viewport width on mobile (wrap to multiple lines)
- AC-14: No layout shift when filter is applied
- AC-15: All filter options accessible on small phone (375px)
- Teams page filter behavior correct

---

### T008 [P] Adjust Resources page filter height to ≤50% viewport

**Window**: 3 (Filter Layout Fixes)
**Phase**: Frontend — CSS Implementation
**Traceability**: FR-008; AC-16 through AC-18; US-5
**Dependencies**: T006 (CSS audit complete), T007 (FilterBar wrapping updated)
**Description**: Reduce filter section height on Resources page so it occupies ≤50% of mobile viewport

**What to modify**:
- File: `src/pages/resources/index.astro`
- Changes:
  - Identify filter container CSS (padding, margins, spacing between filter items)
  - Reduce vertical padding or spacing on mobile (<768px) to make filters more compact
  - Option A: Use `flex-wrap` (same as T007) so filters wrap to multiple lines instead of taking height
  - Option B: Add collapsible/toggle state for filter section (if current compact approach insufficient)
  - Target: Filters should occupy ≤50% of viewport height on mobile (375px)
  - Ensure resource list is visible above fold on 375px (user can see resources without scrolling past filter)
  - Test at 375px and verify resources visible in bottom half of screen
  - No changes to desktop layout (1024px+) — filters can be full height on desktop
- Use Tailwind utilities for responsive spacing (e.g., `py-2 md:py-4`)

**Test Expectations**:
```
Manual test at mobile:
1. DevTools: 375px (iPhone SE)
2. Navigate to Resources page
3. Screenshot showing filter section and below
4. Measure: Filter section should occupy ≤50% of 375px viewport (≤188px approximately)
5. Verify resource list is visible in bottom half (not blocked by filter)
6. Scroll down → verify resources are accessible and clickable
7. Desktop 1024px → verify filter layout acceptable on larger screen (no compression regression)
8. Verify filter functionality still works (filters still apply/update resources)
```

**Success Criteria**:
- AC-16: Filters occupy ≤50% viewport height on mobile
- AC-17: Resource list visible above fold on mobile
- AC-18: Resources remain accessible and clickable (no filter blocking interaction)
- Resources page layout correct at mobile and desktop

---

### T009 [P] Verify filter keyboard navigation and accessibility after layout changes

**Window**: 3 (Filter Layout Fixes)
**Phase**: Frontend — Accessibility Testing
**Traceability**: NFR-001; AC-26, AC-27; US-4, US-5
**Dependencies**: T007, T008 (filter CSS changes complete)
**Description**: Test that Tab navigation and focus management work correctly with wrapped/compact filters

**What to test**:
- Files: Teams page and Resources page (both using updated FilterBar)
- Test scenarios:
  1. **Keyboard Navigation**:
     - Open Teams page on desktop (1024px)
     - Press Tab key repeatedly → cycle through all filter buttons
     - Verify focus indicator visible on each button
     - Verify focus order is logical (left-to-right, top-to-bottom on wrapped buttons)
     - Press Enter/Space on focused filter → verify filter applies correctly
  2. Repeat on Resources page
  3. **Mobile Tab Navigation**:
     - DevTools: 375px (iPhone SE)
     - Repeat Tab navigation test
     - Verify focus order remains logical with wrapped buttons
  4. **Screen Reader Testing** (optional but recommended):
     - Use browser accessibility inspector to verify filter buttons have proper ARIA labels
     - Verify semantic HTML (buttons are `<button>` elements, not divs)
- Document any accessibility issues found

**Test Expectations**:
```
Manual test:
1. Open Teams page on 1024px
2. Press Tab key → cycle through all filters
3. Verify focus indicator visible on each (outline or shadow)
4. Press Enter/Space on a filter → verify it applies
5. Repeat on Resources page
6. DevTools: 375px mobile
7. Repeat Tab navigation (should still work with wrapped buttons)
8. No error messages or console warnings related to focus management
```

**Success Criteria**:
- NFR-001: Tab navigation works through all filters regardless of layout (wrap/compact)
- AC-26: Filters remain keyboard accessible after layout changes
- AC-27: Enter/Space key applies filters correctly
- Focus indicators visible throughout
- No accessibility regressions

---

[WINDOW_CHECKPOINT_3]

**Before proceeding to Window 4**:
- [ ] T006: Filter CSS audit documented
- [ ] T007: Teams page filters wrap correctly on mobile (375px)
- [ ] T008: Resources page filter height ≤50% viewport on mobile
- [ ] T009: Tab navigation works, focus indicators visible
- [ ] All AC-13 through AC-18 passing
- [ ] No layout shift when filters applied
- [ ] Resource list visible above fold on mobile
- [ ] Desktop layouts unchanged at 1024px, 1920px

If checkpoint passes, proceed to Window 4.
If checkpoint fails, remain in Window 3 and fix issues.

---

## Execution Window 4: Contact Page Email Alignment Fix (P3)

**Purpose**: Fix email address alignment and overflow on contact page on mobile

**Token Budget**: 60–80k

**Checkpoint Validation**:
- [ ] Email addresses left-aligned within card boundaries at all breakpoints
- [ ] No overflow or text extending outside card edge on 375px
- [ ] Email links remain clickable with ≥44px tap target height
- [ ] All AC-19 through AC-21 passing

---

### T010 Audit contact page email alignment and identify overflow issue

**Window**: 4 (Contact Page Email Fix)
**Phase**: Frontend — CSS Analysis
**Traceability**: FR-009; AC-19 through AC-21; US-6
**Dependencies**: T009 (filters done; ready for contact page)
**Description**: Document current contact card CSS to identify email overflow/alignment issues

**What to do**:
- File: `src/pages/contact.astro`
- Identify:
  - Current email section CSS (text-align, padding, margins, word-break)
  - Email link styling (display, width constraints, overflow handling)
  - Contact card container width and padding
  - Current behavior on mobile (375px) — where does overflow occur?
  - Current line-break/whitespace handling on email text
- Take screenshots at 375px and 768px showing current misalignment/overflow issue
- Document findings to prepare for CSS fix

**Test Expectations**:
```
Visual inspection:
1. DevTools: 375px (iPhone SE)
2. Navigate to Contact page
3. Screenshot showing email addresses with overflow/misalignment issue
4. Measure email text position relative to card edge
5. Document current CSS rules on email elements
6. Verify this matches spec screenshot (email extending outside card)
```

**Success Criteria**:
- Current CSS rules documented (text-align, padding, overflow)
- Email overflow/alignment issue visually confirmed at 375px
- Ready to implement CSS fix in next task

---

### T011 Fix contact page email alignment and prevent overflow

**Window**: 4 (Contact Page Email Fix)
**Phase**: Frontend — CSS Implementation
**Traceability**: FR-009; AC-19 through AC-21; US-6
**Dependencies**: T010 (CSS audit complete)
**Description**: Update email section CSS to ensure left-alignment and prevent overflow on mobile

**What to modify**:
- File: `src/pages/contact.astro`
- Changes:
  - Set email text `text-align: left` (if not already)
  - Ensure email container has appropriate padding (0-8px left/right) to stay within card boundary
  - Use `word-wrap: break-word` or `word-break: break-word` to handle long email addresses on narrow screens
  - Alternative: Use `whitespace-nowrap` with overflow handling (requires space for email on single line)
  - Ensure email link has `display: inline` or `display: block` (test both to confirm alignment)
  - Verify email links remain clickable with ≥44px tap target height on mobile
  - Test at 375px, 768px, 1024px
  - No changes to desktop layout (1024px+)
- Use Tailwind utilities (e.g., `text-left`, `truncate`, `break-words`, `px-2`)

**Test Expectations**:
```
Manual test at multiple breakpoints:
1. DevTools 375px (iPhone SE):
   - Open Contact page
   - Verify email addresses left-aligned within card
   - Verify no text extends outside card edge
   - Verify email is readable (text not crushed or distorted)
2. DevTools 768px (tablet):
   - Verify email remains contained and readable
3. Desktop 1024px:
   - Verify email alignment unchanged from original (no regression)
4. Click email link on mobile → verify it opens email client (clickable with adequate tap target)
```

**Success Criteria**:
- AC-19: Email addresses left-aligned within card boundary on mobile
- AC-20: No overflow on mobile (375px)
- AC-21: Email remains contained and readable on tablet (768px)
- Email links clickable with ≥44px tap target

---

### T012 [P] Verify email contrast and tap target accessibility

**Window**: 4 (Contact Page Email Fix)
**Phase**: Frontend — Accessibility Testing
**Traceability**: NFR-002, NFR-003; AC-29; US-6
**Dependencies**: T011 (email CSS fixed)
**Description**: Test that email text meets contrast requirements and tap targets are adequate

**What to test**:
- File: `src/pages/contact.astro`
- Test scenarios:
  1. **Color Contrast**:
     - Open Contact page on desktop
     - Use browser accessibility inspector (Chrome DevTools > Elements > Accessibility)
     - Select email text element
     - Verify color contrast ratio is ≥4.5:1 (WCAG AA standard)
     - Compare background color and text color
  2. **Tap Target Size**:
     - DevTools: 375px mobile
     - Measure email link height/width
     - Verify ≥44px in at least one dimension (height or width)
     - Verify adequate spacing from other touch elements (no accidental clicks)
  3. **Readability**:
     - Visual inspection that email text is clear and readable at all breakpoints
- Document any contrast or tap target issues found

**Test Expectations**:
```
Manual test:
1. Chrome DevTools > Elements > Accessibility
2. Select email text element
3. Verify color contrast in inspector (should show ≥4.5:1 for WCAG AA)
4. DevTools 375px mobile
5. Measure email link height (should be ≥44px)
6. Verify email text is readable and not compressed
```

**Success Criteria**:
- NFR-002: Email text contrast ≥4.5:1 (WCAG AA)
- NFR-003: Email tap target ≥44px on mobile
- AC-29: Email text meets accessibility standards
- No contrast or tap target regressions

---

[WINDOW_CHECKPOINT_4]

**Before proceeding to Window 5**:
- [ ] T010: Contact page CSS audit documented
- [ ] T011: Email alignment fixed (left-aligned, no overflow)
- [ ] T012: Email contrast and tap target verified
- [ ] All AC-19 through AC-21 passing
- [ ] Email addresses contained within card boundaries at 375px, 768px
- [ ] Email remains clickable and accessible

If checkpoint passes, proceed to Window 5.
If checkpoint fails, remain in Window 4 and fix issues.

---

## Execution Window 5: Cross-Platform Testing & Regression Verification

**Purpose**: Comprehensive testing across all breakpoints and real devices to validate all fixes and ensure no desktop regressions

**Token Budget**: 70–90k (test-heavy, no implementation)

**Checkpoint Validation**:
- [ ] All fixes verified on 320px, 375px, 768px, 1024px, 1920px
- [ ] Visual regression testing confirms no desktop regressions
- [ ] Real device testing passed (iOS Safari, Chrome Android if available)
- [ ] Accessibility compliance verified (contrast, keyboard nav, tap targets)
- [ ] All AC-22 through AC-32 passing
- [ ] Feature ready for merge

---

### T013 Responsive breakpoint testing (320px, 375px, 768px, 1024px, 1920px)

**Window**: 5 (Cross-Platform Testing)
**Phase**: QA — Responsive Testing
**Traceability**: FR-001 through FR-010, AC-22 through AC-25; US-1 through US-6
**Dependencies**: T012 (all fixes complete in prior windows)
**Description**: Systematically test all fixes at each responsive breakpoint to confirm layout integrity

**What to test**:
- Use Chrome DevTools device emulation for all breakpoints
- Test on each page:
  - Home page (Team card, Coaching Resources card)
  - Modals (uniform information, registration)
  - Teams page (filters)
  - Resources page (filters, resource list)
  - Contact page (email)

**Test Matrix**:

| Breakpoint | Home Page | Modals | Teams Filters | Resources Filters | Contact Email |
|---|---|---|---|---|---|
| **320px** (ultra-small) | Text visible, link works | Images no crop, scrolls OK | Wrap/visible | ≤50% height, list visible | No overflow |
| **375px** (target iPhone SE) | Text visible, link works | Images no crop, scrolls OK | Wrap/visible, no shift | ≤50% height, list visible | No overflow |
| **768px** (tablet) | Text visible, link works | Images no crop, scrolls OK | Wrap/visible, no shift | ≤50% height, list visible | No overflow |
| **1024px** (small desktop) | No regression from original | No regression from original | No regression, horizontal | No regression, horizontal | No regression |
| **1920px** (large desktop) | No regression from original | No regression from original | No regression, horizontal | No regression, horizontal | No regression |

**Test Expectations**:
```
For each breakpoint:
1. Navigate to Home page
   - Verify Team card text correct ("Teams", "Your team results and ladder")
   - Verify Team card link goes to `/teams/`
   - Verify Coaching Resources card link goes to `/resources/`
   - Screenshot to compare against original (check for regressions)

2. Open modal (uniform information or registration)
   - Verify images display in full (no cropping)
   - Scroll content → verify images remain visible
   - Screenshot to compare

3. Navigate to Teams page
   - Verify filters wrap/display correctly
   - Click filter → verify no layout shift
   - Screenshot to compare

4. Navigate to Resources page
   - Verify filters ≤50% height (mobile only)
   - Verify resource list visible
   - Verify filters don't block resources
   - Screenshot to compare

5. Navigate to Contact page
   - Verify email left-aligned, no overflow
   - Verify email readable
   - Screenshot to compare

Repeat for each breakpoint (320px, 375px, 768px, 1024px, 1920px)
```

**Success Criteria**:
- AC-22: Any fix applied → desktop layout unchanged at 1024px
- AC-23: Any fix applied → large desktop (1920px) layout correct
- AC-24: Resize between mobile and desktop → smooth reflow without jank
- AC-25: Modal/filter open on resize → content reflows responsively
- All mobile fixes working correctly at 320px, 375px, 768px
- No visual regressions compared to original design

---

### T014 [P] Accessibility verification (contrast, keyboard nav, tap targets)

**Window**: 5 (Cross-Platform Testing)
**Phase**: QA — Accessibility Testing
**Traceability**: NFR-001 through NFR-004, AC-26 through AC-29; US-1 through US-6
**Dependencies**: T012 (all fixes complete)
**Description**: Verify all updated elements meet WCAG 2.1 AA accessibility standards

**What to test**:
- **Color Contrast** (NFR-002, AC-29):
  - Team card text color contrast against background (≥4.5:1)
  - Email text color contrast against card background (≥4.5:1)
  - Filter button text contrast (≥4.5:1)
  - Use Chrome DevTools > Elements > Accessibility or dedicated contrast checker
  
- **Keyboard Navigation** (NFR-001, AC-26, AC-27):
  - Tab through Home page → click Team card and Coaching Resources card using Enter
  - Tab through Teams page filters → press Enter/Space on each filter
  - Tab through Resources page filters → press Enter/Space on each filter
  - Verify focus indicator visible on all interactive elements
  - Verify logical focus order (left-to-right, top-to-bottom)
  - Verify Enter key submits filters without JavaScript errors
  
- **Tap Targets** (NFR-003, AC-29):
  - Measure filter buttons on mobile (375px) → ensure ≥44px height or width
  - Measure email links on mobile (375px) → ensure ≥44px height or width
  - Verify adequate spacing between tap targets (minimum 8px recommended)
  
- **Modal Focus & Keyboard Navigation** (NFR-004, AC-28):
  - Open modal on desktop
  - Tab through modal content → verify focus remains within modal (focus trap works)
  - Press Escape key → verify modal closes (if implemented)
  - Verify close button is Tab-accessible
  - Repeat on mobile (375px)

**Test Expectations**:
```
Accessibility audit:
1. Chrome DevTools > Elements > Accessibility panel
2. Select Team card text → verify contrast ≥4.5:1
3. Select email text → verify contrast ≥4.5:1
4. Select filter button text → verify contrast ≥4.5:1
5. Measure filter button height on 375px → should be ≥44px
6. Measure email link height on 375px → should be ≥44px
7. Open Home page, press Tab repeatedly → click Team card with Enter
8. Open Teams page, press Tab repeatedly → press Space on filter
9. Open modal on 375px, press Tab → verify focus trap, close button accessible
10. No contrast warnings in DevTools accessibility panel
```

**Success Criteria**:
- NFR-001: Tab navigation works on all filters regardless of layout
- NFR-002: Text contrast ≥4.5:1 on all updated elements
- NFR-003: Tap targets ≥44px on mobile for filters and email
- NFR-004: Modal focus traps work, keyboard nav functional
- AC-26 through AC-29: All accessibility tests passing
- No accessibility violations in Chrome DevTools

---

### T015 [P] Real device testing (iOS Safari and Chrome Android)

**Window**: 5 (Cross-Platform Testing)
**Phase**: QA — Real Device Testing
**Traceability**: AC-30, AC-31; US-1 through US-6
**Dependencies**: T012 (all fixes complete), T013 (DevTools testing confirmed)
**Description**: Test all fixes on real iOS and Android devices to ensure cross-platform compatibility

**What to test**:
- **iOS Safari (iPhone 12 or similar)**:
  - Open home page → click Team card → verify URL changes to `/teams/`
  - Open modals → verify images display in full on 375px viewport
  - Open Teams page → verify filters display correctly, no overflow
  - Open Resources page → verify filters don't take >50% of screen
  - Open Contact page → verify email is contained and clickable
  - Verify all interactions smooth and responsive (no lag)
  
- **Chrome Android (if available)**:
  - Repeat all tests from iOS Safari
  - Verify appearance and behavior consistent across platforms
  
- **Fallback (DevTools Emulation if Real Device Unavailable)**:
  - Use Chrome DevTools device emulation set to iPhone SE (375px) and iPad (768px)
  - Document in test results if real device testing was unavailable

**Test Expectations**:
```
Real device test:
1. iPhone 12 (iOS Safari):
   - Navigate to home page
   - Click Team card → confirm URL is `/teams/`
   - Open modal → confirm images full and visible
   - Navigate to Teams page → confirm filters wrapped, no overflow
   - Navigate to Resources page → confirm filters ≤50% height
   - Navigate to Contact page → confirm email contained
   - Screenshot each page for documentation

2. Android device (Chrome if available):
   - Repeat all above tests
   - Compare screenshots for consistency between iOS and Android

If real device unavailable:
- Document limitation
- Confirm DevTools testing at 375px and 768px is representative
```

**Success Criteria**:
- AC-30: All fixes tested on iOS Safari; modals and filters display correctly
- AC-31: All fixes tested on Chrome Android (or documented if unavailable); behavior consistent
- All user interactions work smoothly on real devices
- Screenshots confirm fixes match design intent
- No platform-specific bugs or issues

---

### T016 [P] Visual regression testing (before/after screenshots)

**Window**: 5 (Cross-Platform Testing)
**Phase**: QA — Regression Testing
**Traceability**: FR-010, AC-22, AC-23, SC-008; US-1 through US-6
**Dependencies**: T012 (all fixes complete), T013 (responsive testing confirmed)
**Description**: Compare before/after screenshots on desktop to confirm no visual regressions

**What to test**:
- Capture screenshots of each page/component at desktop breakpoints (1024px, 1920px) **BEFORE** fixes were applied (if original state still available in git history or prior snapshots)
- Capture screenshots at same breakpoints **AFTER** fixes applied
- Compare side-by-side:
  - Home page layout, spacing, colors (Team card should have same style, only text/link changed)
  - Modal layout and styling on desktop (CSS changes should not affect desktop display)
  - Filter layout on desktop (filters should be horizontal, same as before)
  - Contact page layout and email styling on desktop

**Test Expectations**:
```
Visual regression comparison:
1. Capture desktop 1024px screenshot of home page AFTER fixes
   - Compare Team card position, color, font size (should match original)
   - Compare text rendering (new text "Teams" should match style of original)
   - Compare Coaching Resources card (should match original)

2. Capture desktop 1024px screenshot of modals AFTER fixes
   - Compare modal size, position, styling
   - Compare image display on desktop (should match original, no layout change)

3. Capture desktop 1024px screenshot of Teams page AFTER fixes
   - Compare filter layout (should be horizontal, same as original)
   - Compare filter spacing and styling

4. Capture desktop 1024px screenshot of Contact page AFTER fixes
   - Compare email styling and alignment
   - Compare contact card layout

5. Capture desktop 1920px screenshots of all pages
   - Verify proper scaling and spacing on large screens
   - No excessive whitespace or layout breakage

All screenshots should show no visual regression from original design.
```

**Success Criteria**:
- FR-010: All fixes maintain desktop layout integrity (no regression on ≥768px)
- AC-22: Desktop 1024px layout unchanged
- AC-23: Large desktop 1920px layout unchanged
- SC-008: Before/after visual comparison shows no regressions
- All desktop screenshots match original design intent

---

### T017 [P] Lighthouse accessibility audit and performance verification

**Window**: 5 (Cross-Platform Testing)
**Phase**: QA — Automated Audit
**Traceability**: SC-006, SC-009, SC-010; NFR-011; US-1 through US-6
**Dependencies**: T012 (all fixes complete)
**Description**: Run Lighthouse audit to verify accessibility score, performance, and no CLS regressions

**What to test**:
- **Accessibility Score**:
  - Run Lighthouse audit on each page (home, teams, resources, contact)
  - Verify Accessibility score ≥95 (no new violations introduced)
  - Check for any flagged contrast, focus, or ARIA issues
  
- **Performance**:
  - Verify no performance regression from CSS changes
  - Check Cumulative Layout Shift (CLS) <0.1 when modals open, filters applied
  - Verify First Contentful Paint (FCP) unchanged
  
- **Best Practices**:
  - Verify no deprecated APIs or practices introduced
  - Check for console errors or warnings

**Test Expectations**:
```
Lighthouse audit:
1. Open home page in Chrome
2. DevTools > Lighthouse
3. Audit categories: Accessibility, Performance, Best Practices
4. Verify Accessibility score ≥95
5. Check for any flagged issues (should be 0 new issues from this feature)
6. Note FCP, CLS, other metrics
7. Repeat for Teams page, Resources page, Contact page, and modal pages

Expected results:
- Accessibility: ≥95 (no new violations)
- Performance: No degradation from baseline (CSS-only changes should not impact)
- CLS: <0.1 (no layout jank from CSS changes)
- No console errors
```

**Success Criteria**:
- SC-006: CLS <0.1 when modals open or filters applied (no jank)
- SC-009: All text elements meet WCAG AA contrast (4.5:1 minimum)
- SC-010: Keyboard navigation works; focus indicators visible
- Lighthouse Accessibility score ≥95
- No new performance or best practices violations

---

### T018 [P] Final comprehensive acceptance criteria checklist

**Window**: 5 (Cross-Platform Testing)
**Phase**: QA — Final Verification
**Traceability**: All AC (comprehensive checklist); US-1 through US-6
**Dependencies**: T013, T014, T015, T016, T017 (all testing complete)
**Description**: Run comprehensive checklist of all 32 acceptance criteria to confirm feature is complete

**What to test**:
- Systematically verify each of the 32 acceptance criteria from the spec
- Mark each as PASS or FAIL
- If any FAIL, document the issue and determine if it requires a fix (should not happen if prior windows passed checkpoints)

**Acceptance Criteria Checklist**:

**Home Page Team Card (AC-1 through AC-6)**:
- [ ] AC-1: Team card displays "Teams" as title
- [ ] AC-2: Team card subtitle reads "Your team results and ladder"
- [ ] AC-3: Team card links to `/teams/` (desktop click)
- [ ] AC-4: Team card links to `/teams/` (mobile 375px click)
- [ ] AC-5: Coaching Resources card navigates to `/resources/`
- [ ] AC-6: Desktop 1024px layout unchanged (no regression)

**Mobile Modal Image Display (AC-7 through AC-12)**:
- [ ] AC-7: Uniform modal images display in full on 375px (no cropping)
- [ ] AC-8: Modal images don't distort when scrolling
- [ ] AC-9: Images adapt responsively on 320px
- [ ] AC-10: Registration modal images display in full on 375px
- [ ] AC-11: Registration modal images visible when scrolling
- [ ] AC-12: Modal displays gracefully if image fails to load

**Teams & Resources Filter Layout (AC-13 through AC-18)**:
- [ ] AC-13: Teams page filters fit within viewport width on 375px (wrap)
- [ ] AC-14: No layout shift when Teams page filter is applied
- [ ] AC-15: All filter options accessible on 375px (not hidden)
- [ ] AC-16: Resources page filters occupy ≤50% viewport height on 375px
- [ ] AC-17: Resources page resource list visible above fold on 375px
- [ ] AC-18: Resource items accessible when scrolling (filter doesn't block)

**Contact Page Email Alignment (AC-19 through AC-21)**:
- [ ] AC-19: Email addresses left-aligned within card on 375px
- [ ] AC-20: Email addresses don't overflow card edge on 375px
- [ ] AC-21: Email addresses contained and readable on 768px

**Responsive & Cross-Platform Verification (AC-22 through AC-25)**:
- [ ] AC-22: Desktop 1024px layout unchanged from original
- [ ] AC-23: Large desktop 1920px layout unchanged and properly scaled
- [ ] AC-24: Viewport resize between mobile and desktop reflows smoothly
- [ ] AC-25: Modal/filter open during resize reflows responsively

**Accessibility & Keyboard Navigation (AC-26 through AC-29)**:
- [ ] AC-26: Teams page filters keyboard accessible (Tab works)
- [ ] AC-27: Resources page filters keyboard accessible (Enter/Space applies filter)
- [ ] AC-28: Modal keyboard accessible (focus trap, Tab works)
- [ ] AC-29: Updated text contrast meets WCAG AA (4.5:1 minimum)

**Testing on Real Devices (AC-30 through AC-32)**:
- [ ] AC-30: iOS Safari (iPhone 12) — all fixes display correctly
- [ ] AC-31: Chrome Android — all fixes display correctly and consistent with iOS
- [ ] AC-32: Desktop Chrome, Firefox, Safari — no regressions

**Test Expectations**:
```
Final checklist:
1. Go through each AC systematically
2. Test each scenario on appropriate breakpoint
3. Mark PASS or FAIL
4. If any FAIL, document the specific issue
5. Expected: All 32 AC should PASS after prior windows completed

If all PASS: Feature is complete and ready for merge.
If any FAIL: Identify which task needs rework and return to that window.
```

**Success Criteria**:
- All 32 acceptance criteria (AC-1 through AC-32) PASS
- Feature complete and verified across all breakpoints and platforms
- Ready for merge to main

---

[WINDOW_CHECKPOINT_5]

**Feature Complete**:
- [ ] T013: Responsive testing at 320px, 375px, 768px, 1024px, 1920px complete
- [ ] T014: Accessibility verification (contrast, keyboard nav, tap targets) complete
- [ ] T015: Real device testing (iOS Safari, Chrome Android) complete
- [ ] T016: Visual regression testing (no desktop regressions) complete
- [ ] T017: Lighthouse audit passing (Accessibility ≥95, CLS <0.1)
- [ ] T018: All 32 acceptance criteria verified and PASSING
- [ ] No outstanding bugs or issues
- [ ] Code clean and ready for merge

**Feature Status**: ✅ **READY FOR MERGE**

All windows passed checkpoints. All acceptance criteria verified. All fixes working across all breakpoints and platforms. No regressions on desktop. Accessibility compliance verified. Ready to merge to main.

---

## Summary

**Total Execution Windows**: 5
**Estimated Tokens**:
- Window 1 (Home Page Cards): 60–80k
- Window 2 (Modal Image Fixes): 70–90k
- Window 3 (Filter Layout Fixes): 80–100k
- Window 4 (Contact Email Fix): 60–80k
- Window 5 (Cross-Platform Testing): 70–90k
- **Total**: 340–440k tokens (realistic range for full feature with comprehensive testing)

**Implementation Strategy**:
- Each window executed in fresh 200k context
- Implement agent manages window boundaries via `/clear` between windows
- STATE.md tracks checkpoint progress
- If a window fails, only that window is redone
- Clear hand-offs between windows via checkpoints

---

## Key Rules

### Rule 1: One Window = One Fresh Context
- Implement agent `/clear`s between windows
- Each window starts with clean 200k context
- Only prior checkpoint results in STATE.md carry forward

### Rule 2: Checkpoints Gate Progression
- Each window has explicit validation checklist
- MUST pass before proceeding to next window
- If checkpoint fails, stay in window and fix
- Never skip ahead

### Rule 3: Test-First Within Each Window
- Visual/manual tests performed before implementation in early windows
- Tests must confirm issue or validate fix
- Before window checkpoint, all tests pass
- Later windows are QA-focused (regression and accessibility testing)

### Rule 4: Traceability Every Task
- Every task maps back to spec (FR-XXX, AC-XXX, US-X)
- Every AC validated by end of feature
- No orphaned work

### Rule 5: Window Independence
- Later windows depend on earlier windows' checkpoints, not conversation history
- Implement agent reads STATE.md, not chat memory
- Can restart any window without losing prior work

---

## Checklist Before Implement Phase

- [x] All 5 windows created and sequenced
- [x] Tasks logically organized within windows (18 total tasks)
- [x] Dependencies documented (linear progression through windows)
- [x] Parallel opportunities marked [P] within windows
- [x] Traceability to spec established (every task → FR/AC/US)
- [x] Test tasks precede implementation tasks in early windows
- [x] Checkpoints clearly defined and measurable
- [x] Token budgets estimated per window (60–100k each)
- [x] Ready for implement agent with Option C window management

---

## Files Modified Summary

1. **`src/pages/index.astro`** — Home page Team card links and text (T001)
2. **`src/components/SeasonInfoModal.astro`** — Modal image CSS (T002–T005)
3. **`src/components/FilterBar.astro`** — Filter wrapping and layout (T006–T009)
4. **`src/pages/teams.astro`** — Filter layout verification (T006–T009)
5. **`src/pages/resources/index.astro`** — Filter height and spacing (T006–T009)
6. **`src/pages/contact.astro`** — Email alignment and spacing (T010–T012)

---

## Next Steps

1. **Review Tasks**: Understand window sequencing and checkpoints
2. **Implement Phase**: Run with implement agent, Option C window management
   - Agent will manage windows, track progress in STATE.md
   - `/clear` between windows to isolate contexts

---

## Tips for Implementer

- **Keep focus narrow**: One file or one CSS rule per task
- **Test incrementally**: Verify each fix with manual testing at key breakpoints (375px, 1024px)
- **Screenshot often**: Use DevTools screenshots to compare before/after and catch regressions
- **Accessibility first**: Verify contrast and keyboard nav as you go, don't leave for end
- **Use Tailwind**: Prefer Tailwind utilities over custom CSS for consistency
- **No backend**: All CSS and text; no API or database changes
- **Mobile-first mindset**: Test at 375px first, then verify desktop (1024px) for regression

