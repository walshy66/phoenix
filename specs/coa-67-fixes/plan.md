# Implementation Plan: COA-67 Fixes (UI & Link Corrections)

**Branch**: `cameronwalsh/coa-67-fixes` | **Date**: 2026-04-19 | **Spec**: [specs/coa-67-fixes/spec.md](spec.md)

---

## Summary

COA-67 bundles six independent UI and link corrections across the Phoenix app's home page, modals, filters, and contact page. All fixes are **frontend-only** (CSS and text updates) with no backend changes required. Changes are isolated to component styling and text labels, maintaining desktop layout integrity and following established Astro + Tailwind patterns.

### High-Level Technical Approach
1. **Fix home page card links and text** — Update href and labels in quickLinks array
2. **Fix modal image display** — CSS adjustments for uniform information and registration modals (object-fit: contain, overflow handling)
3. **Fix filter layouts** — CSS flex-wrap and responsive adjustments for Teams and Resources page filters
4. **Fix contact page email alignment** — CSS text alignment and spacing adjustments

---

## Technical Context

- **Framework**: Astro (v4+) with TypeScript
- **Styling**: Tailwind CSS 3.x (utility-first, mobile-first breakpoints)
- **Component Encapsulation**: Astro `.astro` components (not React)
- **Testing Strategy**: Visual regression testing (DevTools device emulation) + accessibility verification
- **Storage**: Static site generated (no backend API involved in these fixes)
- **Target Browsers**: Chrome, Firefox, Safari (desktop and mobile)
- **Responsive Breakpoints**: 320px, 375px (iPhone SE), 768px (tablet), 1024px, 1920px+
- **Performance Goals**: No layout thrashing, CSS-only solutions preferred, zero new dependencies
- **Accessibility Baseline**: WCAG 2.1 AA (keyboard navigation, color contrast 4.5:1, 44px tap targets)

---

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. User Outcomes First** | ✅ PASS | Six prioritized user stories with measurable outcomes (link redirection, image display, filter fit, email alignment) |
| **II. Test-First Discipline** | ✅ PASS | 32 acceptance criteria covering all interaction modes and breakpoints; tests precede implementation |
| **III. Backend Authority** | ✅ PASS | Frontend-only changes; no state mutations, no invariant changes, links are static |
| **IV. Error Semantics** | ✅ PASS | Graceful modal image fallback; no silent failures |
| **V. AppShell Integrity** | ✅ PASS | Existing components only; no new navigation shells; responsive breakpoints maintained |
| **VI. Accessibility First** | ✅ PASS | WCAG 2.1 AA: keyboard nav (Tab, focus traps), color contrast, 44px tap targets, responsive reflow |
| **VII. Immutable Data Flow** | ✅ PASS | Static text and CSS-driven styling; no state inference |
| **VIII. Dependency Hygiene** | ✅ PASS | No new dependencies; uses existing Astro + Tailwind stack |
| **IX. Cross-Feature Consistency** | ✅ PASS | Follows Astro + Tailwind patterns; no framework fragmentation |

**Overall Status**: ✅ **CONSTITUTIONAL COMPLIANCE: PASS**

---

## Project Structure

The Phoenix codebase uses a standard Astro project layout:

```
src/
├── pages/
│   ├── index.astro                    (home page — Team card fix)
│   ├── contact.astro                  (contact page — email alignment fix)
│   ├── teams.astro                    (Teams page — filter layout fix)
│   ├── resources/
│   │   └── index.astro                (Resources page — filter layout fix)
│   └── seasons.astro                  (Seasons page — modal images fix)
│
├── components/
│   ├── FilterBar.astro                (filter layout — used on resources & teams)
│   ├── SeasonInfoModal.astro          (modal for uniform/registration — image layout)
│   └── [other components]
│
├── layouts/
│   └── BaseLayout.astro               (consistent layout across all pages)
│
├── styles/
│   └── [global styles]
│
└── lib/
    └── [utility functions]

tailwind.config.mjs                     (Tailwind breakpoints: sm:768px, md:1024px, lg:1280px, etc.)
astro.config.mjs                        (Astro configuration)
```

### Key Files to Modify

1. **Home Page Card Fix** → `/src/pages/index.astro` (quickLinks array)
2. **Modal Image Fix** → `/src/components/SeasonInfoModal.astro` (CSS overflow/sizing)
3. **Filter Layout Fixes** → `/src/components/FilterBar.astro` (CSS flex-wrap) and `/src/pages/resources/index.astro` (spacing)
4. **Contact Page Email Fix** → `/src/pages/contact.astro` (CSS text alignment)

---

## Phased Delivery

### Phase 1: Home Page Card Link & Text Fixes (P1)
**Scope**: Update Team card link and text labels  
**Files Modified**: `src/pages/index.astro`  
**Changes**:
- Change Team card href from `/team/` to `/teams/`
- Change Team card title from "Team" to "Teams"
- Change Team card subtitle from "Meet our players, coaches and staff" to "Your team results and ladder"
- Verify Coaching Resources card href is `/resources/`

**Test Verification**:
- AC-1 through AC-6 (Team card text, links, desktop rendering)

**Deliverable**: Team card correctly links to `/teams/` and displays updated text

---

### Phase 2: Modal Image Display Fixes (P1)
**Scope**: Fix image cropping in uniform information and registration modals on mobile  
**Files Modified**: `src/components/SeasonInfoModal.astro`  
**Changes**:
- Add CSS rule `object-fit: contain` to modal images to preserve aspect ratio
- Adjust image container sizing (max-width, max-height) to scale responsively without distortion
- Verify overflow behavior on small screens (320px, 375px)
- Ensure modal scroll behavior remains functional

**Test Verification**:
- AC-7 through AC-12 (Mobile modal image display, scrolling, fallback handling)

**Deliverable**: Modal images display in full without cropping at 320px–768px breakpoints

---

### Phase 3: Filter Layout Fixes (P2)
**Scope**: Fix filter overflow on Teams and Resources pages on mobile  
**Files Modified**: `src/components/FilterBar.astro` and `src/pages/resources/index.astro`  
**Changes**:
- Update FilterBar to use `flex-wrap` on filter controls (Age, Category, Skill buttons)
- Ensure filter buttons wrap to multiple lines on mobile without breaking layout
- Add compact vertical spacing on mobile (<768px) so filters don't consume >50% viewport height
- Verify tab accessibility (Tab key navigation, focus indicators) after layout changes
- Ensure no layout shift when filters are applied

**Test Verification**:
- AC-13 through AC-18 (Teams & Resources filter wrapping, accessibility, content accessibility)

**Deliverable**: Filters fit within viewport width and occupy ≤50% vertical space on mobile; Tab navigation works

---

### Phase 4: Contact Page Email Alignment Fix (P3)
**Scope**: Fix email address overflow and alignment on contact card  
**Files Modified**: `src/pages/contact.astro`  
**Changes**:
- Update email section CSS to ensure text alignment is left-aligned with card padding
- Use `whitespace-nowrap` or word-break rules to prevent email overflow on 375px screens
- Verify email text stays within card boundary on all breakpoints (375px, 768px, 1024px)
- Ensure email links remain clickable with adequate tap target height

**Test Verification**:
- AC-19 through AC-21 (Email alignment, mobile rendering, no overflow)

**Deliverable**: Email addresses display left-aligned within card boundaries at all breakpoints

---

### Phase 5: Cross-Platform Testing & Regression Verification (All)
**Scope**: Verify all fixes on multiple breakpoints and real devices  
**Files Modified**: None (testing only)  
**Changes**:
- DevTools device emulation testing at 320px, 375px, 768px, 1024px, 1920px
- Real iOS Safari and Chrome Android device testing
- Visual regression screenshots (before/after) on desktop
- Accessibility inspection (color contrast, focus indicators, ARIA labels)
- Keyboard navigation verification (Tab, Enter/Space on filters and modals)

**Test Verification**:
- AC-22 through AC-32 (Responsive verification, accessibility, real device testing)

**Deliverable**: All fixes verified across breakpoints and real devices; no regressions on desktop

---

## Testing Strategy

### Unit Testing (Visual + Manual)
- **Home Page Cards**: Click Team card and verify URL is `/teams/`; read text and verify correct labels
- **Modal Images**: Open uniform information and registration modals on 375px and 768px screens; verify images display without cropping
- **Filter Layouts**: Load Teams and Resources pages on mobile; verify filters wrap and don't overflow
- **Email Alignment**: View contact page on mobile; verify email text stays within card bounds

### Responsive Testing Checklist
| Breakpoint | Test Scenario | Expected Behavior |
|------------|---------------|-------------------|
| **320px** (small phone) | Modal opens, filters visible, email text | Images scale, filters wrap, no overflow |
| **375px** (target iPhone SE) | All user interactions | Full functionality, no cropping, no alignment issues |
| **768px** (tablet) | Filters, modals, email | Transition point verified, no jank |
| **1024px** (small desktop) | All components | Desktop layout intact, no regression |
| **1920px** (large desktop) | Filters, modals, layout | Proper scaling, no excessive spacing |

### Accessibility Testing
- **Color Contrast**: Verify 4.5:1 ratio on all text (Team card, email addresses) using accessibility inspector
- **Keyboard Navigation**: Tab through filters on Teams/Resources pages; verify focus indicators visible
- **Modal Focus**: Verify focus trap works in modals; close button accessible via Tab
- **Tap Targets**: Measure email links and filter buttons; ensure ≥44px height/width on mobile

### Cross-Browser Testing
- Chrome (desktop + Android emulation)
- Firefox (desktop)
- Safari (desktop + iOS emulation in DevTools)
- **Real Device Testing**: iOS Safari (iPhone 12) and Chrome Android (if available)

### Lighthouse Audit
- **CLS (Cumulative Layout Shift)**: <0.1 when modals open, filters applied
- **Accessibility Score**: ≥95 (no new accessibility violations)
- **No Performance Regression**: Page load and interaction times unchanged

---

## Research & Open Questions

### Questions Resolved During Spec Review

1. **How should modal images scale on ultra-small screens (320px)?**
   - **Decision**: Use CSS `object-fit: contain` with max-width/max-height to preserve aspect ratio without distortion. Modal scrolls if content exceeds viewport height.

2. **What layout approach for filter overflow — wrap, scroll, or collapse?**
   - **Decision**: Use flexbox wrap on filters so buttons wrap to multiple lines naturally. This maintains semantic HTML and keyboard accessibility without custom JavaScript.

3. **Should email text on contact page be shortened or use multi-line layout?**
   - **Decision**: Keep full email text; use left alignment and padding adjustment. Email links are clickable and readable at 375px with `whitespace-nowrap` to prevent awkward breaks.

4. **Are there any deprecation concerns with Astro or Tailwind versions?**
   - **Decision**: None identified. Astro v4 is current; Tailwind 3 is stable and widely used. No version upgrades required.

### No Outstanding Research Needed

All specifications are clear and actionable. The feature is pure CSS/text fixes with no architectural decisions required. Edge cases are addressed in the spec (varying image sizes, broken links, empty filter state, etc.).

---

## Complexity Tracker

### Deviations from Standard Patterns

None identified. All fixes follow established Astro + Tailwind conventions:
- Home page card links are static (no new routing)
- Modal image sizing uses standard CSS (object-fit, overflow)
- Filter layout uses Tailwind utility classes (flex, flex-wrap, gap)
- Contact page email alignment uses standard Tailwind spacing and text utilities

### Why CSS-Only Approach

All six fixes are CSS and text updates because:
- **Home page cards**: Text and href are in hardcoded data array (no logic change)
- **Modal images**: CSS `object-fit: contain` solves aspect ratio preservation (no component logic)
- **Filter layout**: Flexbox wrap is native CSS (no JavaScript needed)
- **Email alignment**: CSS padding and alignment utilities (no logic change)

This simplicity is **good** — it reduces risk of regression and makes testing straightforward.

### No Architectural Violations

- No new component dependencies or imports
- No new external libraries
- No changes to data structures or props
- No client-side state inference
- No backend API changes

---

## Implementation Notes

### Acceptance Criteria Mapping

Each of the six user stories maps to specific acceptance criteria and implementation steps:

**Story 1 (Home Page Team Card)**: AC-1 through AC-6
- Update quickLinks array in index.astro
- Test link redirection (desktop + mobile)

**Story 2 (Uniform Modal Images)**: AC-7 through AC-11
- Update SeasonInfoModal image container CSS
- Test at 320px, 375px, 768px
- Verify scrolling behavior

**Story 3 (Registration Modal Images)**: AC-10 through AC-11
- Same component fix as Story 2 (single change)
- Test registration modal image display

**Story 4 (Teams Filter Layout)**: AC-13 through AC-15
- Update FilterBar flex layout for Teams page
- Verify no layout shift on filter apply
- Tab navigation test

**Story 5 (Resources Filter Layout)**: AC-16 through AC-18
- Update FilterBar spacing to keep ≤50% viewport height
- Verify resource list visible above fold on mobile
- Content accessibility verification

**Story 6 (Contact Page Email)**: AC-19 through AC-21
- Update email section CSS alignment
- Test mobile rendering (375px, 768px)
- Verify no overflow

### Success Criteria Validation

All 10 measurable success criteria (SC-001 through SC-010) are testable with DevTools:
- **SC-001 to SC-002**: Link clicks and modal image display (DevTools Network, device emulation)
- **SC-003 to SC-004**: Filter layout and spacing (visual inspection in DevTools)
- **SC-005**: Email alignment (visual inspection on 375px and 768px)
- **SC-006**: CLS score (Lighthouse audit)
- **SC-007 to SC-010**: Cross-browser and accessibility verification

---

## Git & Deployment

- **Branch**: `cameronwalsh/coa-67-fixes` (already active)
- **No Database Migrations**: All CSS and text updates; no schema changes
- **No Environment Variables**: No new config needed
- **Deployment Strategy**: Merge to main via PR; standard CI/CD (no special handling)
- **Rollback**: Simple revert if regression discovered (isolated changes)

---

## Summary: What Gets Built

### Phase 1 Deliverable
- Home page Team card links to `/teams/` instead of `/team/`
- Team card title says "Teams"
- Team card subtitle says "Your team results and ladder"
- Coaching Resources card links to `/resources/`

### Phase 2 Deliverable
- Uniform information modal images display in full on mobile (320px–768px) without cropping
- Registration modal images display in full on mobile without cropping
- All modal images maintain aspect ratio (no distortion)

### Phase 3 Deliverable
- Teams page filters wrap to multiple lines on mobile (375px)
- Resources page filters fit within ≤50% viewport height on mobile
- No layout shift when filters are applied
- Tab navigation remains functional on filters

### Phase 4 Deliverable
- Contact page email addresses left-aligned within card boundary
- No overflow on mobile (375px–768px)
- Email links remain clickable with ≥44px tap targets

### Phase 5 Deliverable
- All fixes verified on 320px, 375px, 768px, 1024px, 1920px
- Visual regression testing confirms no desktop regressions
- Accessibility compliance verified (contrast, keyboard nav, tap targets)
- Real device testing on iOS Safari and Chrome Android (if available)

---

## Ready for Implementation

This plan provides:
- ✅ Clear technical context (Astro, Tailwind, mobile-first responsive design)
- ✅ Constitution alignment (all 9 principles satisfied)
- ✅ Phased delivery (5 phases, each independently valuable)
- ✅ Testing strategy (visual, accessibility, cross-browser)
- ✅ Specific file changes (5 files modified)
- ✅ No research blockers (all decisions made)
- ✅ Success criteria (32 acceptance criteria, 10 measurable success criteria)

**Next Step**: Proceed to tasks phase to generate atomic implementation tasks.
