# Implementation Plan: Sponsors Carousel & Get-Involved Integration

**Branch**: `cameronwalsh/coa-58-sponsors` | **Date**: 2026-04-18 | **Spec**: [spec.md](spec.md)

---

## Summary

Implement a **dual-scope sponsors feature** across two pages:

### Part 1: Home Page Carousel (Primary Feature)
Implement a **horizontal scrolling sponsors carousel** on the home page featuring sponsor logo cards with external links and a call-to-action (CTA) card for new sponsors. Reuse the fixed-width carousel pattern from COA-22 (HeroCircularCarousel) to maintain design consistency.

The carousel will:
- Display sponsor logos in fixed-width cards (200-250px) arranged in a horizontal scroll container
- Show 1 initial sponsor with a "Become a Sponsor" CTA card in the carousel
- Transition to show a static "Become a Sponsor" button when 6+ sponsors are onboarded
- Use optimized WebP images with PNG fallbacks
- Support keyboard navigation, screen readers, and touch interactions
- Handle image load failures gracefully with placeholder fallbacks

### Part 2: Get-Involved Page Grid (Secondary Feature)
Add sponsor logo to slot 1 of the existing 6-slot grid on the Get-Involved page:
- Display same sponsor logo (from carousel) in slot 1 of existing grid
- Logo clickable, opens Facebook link in new tab (same behavior as carousel)
- Slots 2-6 remain unchanged
- Minimal changes to existing get-involved page layout

**Technical Approach**:
- **Part 1**: Build `SponsorCarousel.astro` component reusing fixed-width card layout pattern from COA-22
- **Part 2**: Update `GetInvolvedGrid.astro` (existing component) to integrate sponsor logo into slot 1
- Create `sponsors.json` data source in `/src/data/` for sponsor configuration (shared by both parts)
- Implement carousel container with horizontal scroll (no auto-scroll; manual scroll only)
- Semantic HTML with proper accessibility attributes (alt text, aria-labels, focus management)
- Astro Image component for optimized image loading (eager for primary sponsor, lazy for others)
- Native CSS for styling; Tailwind utility classes for responsive layout
- Component integration into home page (`index.astro`) and get-involved page (`get-involved.astro`)

---

## Technical Context

| Aspect | Details |
|--------|---------|
| **Language/Version** | Astro 6.1.1, HTML/CSS/TypeScript |
| **Primary Dependencies** | Astro, Tailwind CSS 4.2.2 (no new packages required) |
| **Storage** | Frontend data source (`sponsors.json`); no backend mutations |
| **Testing** | Vitest 4.1.2 (unit + component integration tests) |
| **Target Platform** | Web (desktop, tablet, mobile) |
| **Performance Goals** | <1s page load with sponsor section visible; images load in <500ms (primary sponsor eager, others lazy) |
| **Scale/Scope** | Home page section; ~5KB CSS+JS minified; supports 1-10+ sponsors |
| **Related Feature** | COA-22 (HeroCircularCarousel) — reuse fixed-width card pattern |

---

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. User Outcomes First** | ✅ PASS | 3 user stories with 21 acceptance criteria; clear outcomes: view sponsor, click CTA, adaptive UI at sponsor threshold |
| **II. Test-First Discipline** | ✅ PASS | 21 detailed test scenarios covering display, interaction, image handling, accessibility, responsive design, edge cases |
| **III. Backend Authority** | ✅ PASS | Frontend-only; no server mutations; carousel state is local (scroll position, image load status) |
| **IV. Error Semantics** | ✅ PASS | Graceful image load failures (fallback placeholder); invalid links handled (image not wrapped in anchor); no JS errors |
| **V. AppShell Integrity** | ✅ PASS | Component integrates into home page layout; uses established carousel pattern; no custom nav shell |
| **VI. Accessibility First** | ✅ PASS | WCAG 2.1 AA: alt text, aria-labels, keyboard nav, focus indicators, link security (noopener/noreferrer), lazy loading |
| **VII. Immutable Data Flow** | ✅ PASS | Unidirectional: sponsor data → component props → rendering; scroll position is ephemeral; no client-side inference |
| **VIII. Dependency Hygiene** | ✅ PASS | No new npm packages; uses Astro, Tailwind, native browser APIs (no carousel library) |
| **IX. Cross-Feature Consistency** | ✅ PASS | Follows Astro component patterns; reuses COA-22 carousel layout; Tailwind + brand colors |

**Overall**: ✅ **CONSTITUTIONAL COMPLIANCE: PASS** — No conflicts or violations.

---

## Project Structure

```
src/
├── components/
│   ├── SponsorCarousel.astro              (new carousel component - Part 1)
│   ├── SponsorCard.astro                  (new reusable sponsor card subcomponent)
│   ├── SponsorCTACard.astro               (new CTA card subcomponent)
│   ├── GetInvolvedGrid.astro              (existing grid, updated for Part 2)
│   └── __tests__/
│       ├── SponsorCarousel.component.test.ts      (component integration tests)
│       ├── SponsorCarousel.image-loading.test.ts  (image optimization tests)
│       ├── SponsorCarousel.accessibility.test.ts  (WCAG compliance tests)
│       ├── SponsorCarousel.responsive.test.ts     (breakpoint tests)
│       └── GetInvolvedGrid.integration.test.ts    (grid integration tests for Part 2)
│
├── data/
│   └── sponsors.json                      (new sponsor configuration data - shared)
│
└── pages/
    ├── index.astro                        (updated to include SponsorCarousel - Part 1)
    └── get-involved.astro                 (updated to integrate sponsor into slot 1 - Part 2)

specs/coa-58-sponsors/
├── spec.md                                (requirements)
├── plan.md                                (this file)
├── data-model.md                          (data structure)
├── research.md                            (spike items, alternatives)
├── contracts/
│   └── sponsor-data-contract.md          (data shape, validation rules)
└── quickstart.md                          (manual testing guide)
```

### Data Structure

**sponsors.json** — Sponsor configuration:
```json
{
  "sponsors": [
    {
      "id": "sponsor-001",
      "name": "MB Automation Victoria",
      "logo": "/images/sponsors/mb-automation-vic-logo.png",
      "link": "https://www.facebook.com/mb.automation.vic",
      "joinedDate": "2026-04-15"
    }
  ],
  "sponsorCountThreshold": 6,
  "ctaLink": "/get-involved"
}
```

### Component Props Interface

**SponsorCarousel.astro**:
```typescript
interface Sponsor {
  id: string;
  name: string;
  logo: string;        // Image URL (WebP or PNG)
  link?: string;       // Optional external URL
  joinedDate: string;  // ISO date string
}

interface Props {
  sponsors: Sponsor[];
  sponsorCountThreshold?: number;  // Default: 6
  ctaLink?: string;                // Default: "/get-involved"
}
```

---

## COA-22 Carousel Dependency Analysis

### Pattern Reuse from COA-22

The COA-22 HeroCircularCarousel implements a 3D rotating carousel with sophisticated animation. COA-58 needs a **different carousel type**: horizontal scrolling with fixed-width cards, not 3D rotation.

**Reusable Elements**:
1. **Fixed-Width Card Layout**: COA-22 uses fixed card dimensions (responsive across breakpoints)
2. **Image Optimization Strategy**: Eager loading for primary cards, lazy loading for secondary
3. **Accessibility Pattern**: Focus management, ARIA labels, keyboard navigation
4. **Responsive Breakpoints**: Mobile (320px), tablet (768px), desktop (1024px+)

**NOT Reusing**:
- 3D rotation animations (COA-58 uses horizontal scroll, no 3D perspective)
- Auto-advance/auto-rotation logic (COA-58 is manual scroll only)
- Click queue for animation sequencing (COA-58 uses native scroll behavior)

### Dependency Status

✅ **COA-22 Pattern Available**: HeroCircularCarousel.astro exists and proves responsive carousel pattern works in codebase.

⚠️ **Important**: Do NOT import/reuse HeroCircularCarousel component code directly. Instead, learn from its patterns (card layout, image loading, accessibility) and build a simpler scroll-based carousel.

---

## Phased Delivery

### Phase 0: Data Model & Shared Setup (P1)
**Goal**: Establish sponsor data source and shared components used by both Part 1 and Part 2

**Tasks**:
1. Create `/src/data/sponsors.json` with 1 initial sponsor (MB Automation Victoria) and configuration
2. Create `SponsorCard.astro` subcomponent to render individual sponsor cards (reusable)
3. Create `SponsorCTACard.astro` subcomponent to render "Become a Sponsor" CTA card (Part 1 only)
4. Write unit tests for component prop validation and render logic
5. Document sponsor data schema and shared interfaces

**Definition of Done**:
- sponsors.json created with 1 initial sponsor
- SponsorCard.astro renders sponsor logo with link
- SponsorCTACard.astro renders "Become a Sponsor" CTA
- No errors in console
- Components accept props correctly
- Tests verify prop validation

---

### Part 1: Home Page Carousel (Primary Feature)

### Phase 1: Carousel Structure & Layout (P1)
**Goal**: Build the carousel component with fixed-width card layout and horizontal scroll

**Tasks**:
1. Create `SponsorCarousel.astro` with Props interface; accept sponsors array, threshold, and CTA link
2. Implement sponsor count threshold logic (show CTA card when < threshold, show static button when >= threshold)
3. Add carousel container with `overflow-x: auto; overflow-y: hidden` for horizontal scroll
4. Define fixed card width: 200px mobile, 220px tablet, 250px desktop (using Tailwind responsive classes)
5. Add internal padding (16-20px) to cards per spec
6. Implement gap spacing between cards (24px) using Tailwind `gap-6` or custom CSS
7. Add fade gradient edges (left/right overlays) to indicate scrollability
8. Write responsive design tests

**Definition of Done**:
- SponsorCarousel renders with 1 sponsor card + 1 CTA card
- Carousel scrolls horizontally on all screen sizes
- Cards maintain fixed width and aspect ratio
- Logos visible in cards with proper spacing
- Fade edges visible on desktop (optional on mobile)
- No layout shifts or overflow issues

---

### Phase 2: Image Optimization & Loading (P1)
**Goal**: Implement Astro Image component integration with WebP/PNG optimization and lazy loading

**Tasks**:
1. Create sponsor logo image assets in `/public/images/sponsors/` directory
2. Integrate Astro Image component for each sponsor/CTA card in carousel
3. Implement `loading="eager"` for first sponsor, `loading="lazy"` for others
4. Set WebP format with PNG fallback using Astro Image optimization
5. Define image sizing constraints: max-width 100%, max-height: card-height, object-fit: contain
6. Implement image load failure handling: display gray placeholder if image fails
7. Write image loading and optimization tests

**Definition of Done**:
- Sponsor logos display correctly without distortion
- WebP served on modern browsers; PNG fallback on older browsers
- Primary sponsor image eager-loads; others lazy-load
- Failed images show placeholder gracefully
- No console errors for image load issues

---

### Phase 3: Link Handling & CTA Navigation (P1)
**Goal**: Implement sponsor link clicks and CTA navigation with proper security and accessibility

**Tasks**:
1. Wrap sponsor logo with `<a>` tag when link is present (in SponsorCard.astro)
2. Add `target="_blank"` and `rel="noopener noreferrer"` attributes for security
3. Add descriptive `aria-label` (e.g., "Visit MB Automation Victoria (opens in new tab)")
4. Implement CTA card link to `/get-involved` (or config-driven route)
5. Handle missing/invalid links: skip anchor wrapper, display as static image only
6. Add focus styles: 2px outline with WCAG AA contrast
7. Write link handling and navigation tests

**Definition of Done**:
- Sponsor links open in new tab without errors
- Reverse tabnabbing prevented (rel="noopener noreferrer" present)
- CTA card navigates to sponsorship page
- Invalid links don't throw errors; image displayed as static
- Focus indicators visible on keyboard navigation

---

### Phase 4: Accessibility & Semantics (P1)
**Goal**: Ensure WCAG 2.1 AA compliance with keyboard navigation, screen readers, and semantic HTML

**Tasks**:
1. Add descriptive `alt` attributes to all sponsor logo images
2. Add ARIA labels to sponsor links (via aria-label attribute)
3. Ensure carousel container is properly labeled (aria-label or heading)
4. Implement keyboard focus management: Tab through sponsor links in order
5. Add visible focus indicators (2px outline, min 3:1 contrast ratio)
6. Test with screen reader (NVDA/JAWS simulation in tests)
7. Verify reduced-motion support (no animations, just scroll)
8. Write accessibility compliance tests

**Definition of Done**:
- All images have descriptive alt text
- All links have aria-label describing action
- Keyboard navigation works (Tab, Enter, Space)
- Focus indicators visible and meet WCAG AA contrast
- Screen readers announce sponsor names and link actions correctly
- Reduced-motion preference respected (if animations added later)

---

### Phase 5: Carousel Testing & Integration (P1)
**Goal**: Comprehensive testing of carousel component and home page integration

**Tasks**:
1. Write component integration tests (render, props, conditional rendering)
2. Write image loading and optimization tests (WebP/PNG, eager/lazy, fallback)
3. Write responsive design tests (breakpoints, card sizing, scroll behavior)
4. Write link/navigation tests (anchor wrapping, target="_blank", aria-label)
5. Write edge case tests (missing data, broken images, invalid links)
6. Test responsive layout at breakpoints (320px, 768px, 1024px)
7. Achieve >85% code coverage for carousel component
8. Update `/src/pages/index.astro` to import and render SponsorCarousel
9. Load sponsor data from `/src/data/sponsors.json` on home page
10. Conditional rendering: show/hide static "Become a Sponsor" button based on sponsor count
11. Test page load performance with carousel included
12. Verify no console errors or layout conflicts

**Definition of Done**:
- Carousel renders on home page without errors
- All image, link, and accessibility tests pass
- Carousel displays correctly at 320px, 768px, 1024px+ breakpoints
- Touch scroll works on mobile
- Cards scale responsively
- Sponsor data loads correctly
- Static button visibility logic works (hidden <6 sponsors, visible 6+)
- Page loads without performance degradation
- No conflicts with other page sections

---

### Phase 6: Part 1 Edge Cases & Documentation (P1)
**Goal**: Handle edge cases and create documentation for carousel

**Tasks**:
1. Handle missing sponsor data (empty array) — show CTA card only
2. Handle missing/null sponsor links — display logo as static image (no anchor)
3. Handle broken image URLs — show gray placeholder
4. Handle slow network — lazy load non-primary sponsors without blocking
5. Handle malformed URLs in sponsor.link field — sanitize/validate before rendering
6. Write edge case tests covering all scenarios
7. Achieve >85% code coverage for all carousel logic
8. Document sponsor data structure in `data-model.md`
9. Document API/data contract in `contracts/sponsor-data-contract.md`

**Definition of Done**:
- All edge case tests pass
- No sponsor data: carousel shows CTA card only
- Missing link: image not clickable, no JS errors
- Broken image: placeholder displays, layout doesn't break
- Slow network: page remains responsive
- Malformed URL: safely skipped, no XSS risk
- Code coverage >85%
- Data documentation complete

---

### Part 2: Get-Involved Page Grid Integration (Secondary Feature)

### Phase 7: Get-Involved Grid Integration (P2)
**Goal**: Add sponsor logo to slot 1 of existing 6-slot grid on get-involved page

**Tasks**:
1. Locate existing `GetInvolvedGrid.astro` component on get-involved page
2. Update grid component to support sponsor logo in slot 1
3. Load first sponsor from `/src/data/sponsors.json`
4. Render sponsor logo in slot 1 using SponsorCard.astro (reuse from Part 1)
5. Keep slots 2-6 unchanged (existing content)
6. Logo clickable, opens Facebook link in new tab (same behavior as carousel)
7. Add integration tests for get-involved grid sponsor slot
8. Test responsive layout on get-involved page

**Definition of Done**:
- Sponsor logo appears in slot 1 of get-involved grid
- Logo is clickable and opens Facebook link in new tab
- Slots 2-6 remain unchanged
- Responsive layout maintained
- No console errors
- Integration tests pass

---

### Phase 8: Part 2 Testing & Cleanup (P2)
**Goal**: Complete testing for get-involved integration and finalize documentation

**Tasks**:
1. Write integration tests for GetInvolvedGrid with sponsor slot
2. Test responsive layout at breakpoints (320px, 768px, 1024px)
3. Test sponsor link behavior (opens in new tab, proper rel attributes)
4. Test image loading and fallback on get-involved page
5. Verify no layout conflicts with existing grid slots
6. Test edge cases (missing sponsor, broken image)
7. Write quickstart.md with setup and manual test procedures
8. Write troubleshooting section for common issues
9. Document examples for future sponsor updates

**Definition of Done**:
- All get-involved integration tests pass
- Responsive tests pass at 320px, 768px, 1024px+ breakpoints
- Link behavior verified
- Image loading verified
- No conflicts with existing grid content
- quickstart.md complete
- Troubleshooting guide documented

---

## Research & Spike Items

### R1: Image Optimization Strategy
**Status**: Deferred to Phase 3
**Questions**:
- Should sponsor logos be hosted on CDN or in `/public/images/sponsors/`?
- What max file size for sponsor logos (spec suggests ~100KB per WebP)?
- Should Astro Image component be used for automatic WebP optimization or manual format handling?

**Resolution**: Use Astro Image component with WebP format; PNG fallback via `<picture>` element. Store images in `/public/images/sponsors/`. Target max 100KB per logo.

---

### R2: Sponsor Data Source
**Status**: Deferred to Phase 1
**Questions**:
- Should sponsor data live in `/src/data/sponsors.json` or be fetched from an API/CMS?
- How will sponsors be added/updated in the future? Manual JSON edit, CMS integration, or admin panel?

**Resolution**: Start with `/src/data/sponsors.json` for MVP. Future phase can integrate CMS or API. Current approach allows Astro static generation.

---

### R3: Scroll Behavior & Affordances
**Status**: Ready for Phase 2
**Questions**:
- Should carousel auto-scroll, or is manual scroll (via user dragging/scrolling) sufficient?
- Should scrollbar be visible on all devices?

**Resolution**: Manual scroll only (no auto-scroll). Fade edges on desktop provide affordance. Scrollbar visible on mobile to indicate more content.

---

### R4: Threshold Logic & Static Button Placement
**Status**: Ready for Phase 1 & 7
**Questions**:
- Where should the static "Become a Sponsor" button appear (if triggered at 6+ sponsors)?
- Should CTA card and static button be mutually exclusive (show one, never both)?

**Resolution**: Static button placed below carousel or in sidebar (confirm placement with designer). CTA card always in carousel; static button only shows at 6+ sponsors. Never show both.

---

## Dependency Analysis

### Internal Dependencies

| Feature | Status | Impact | Notes |
|---------|--------|--------|-------|
| COA-22 (Hero Carousel) | ✅ Available | Pattern reference only | Reuse layout pattern, not code; build separate scroll carousel |
| Tailwind CSS 4.2.2 | ✅ Available | Styling framework | Already in stack; no new version needed |
| Astro 6.1.1 | ✅ Available | Framework & Image component | Already in stack; Image component built-in |
| Vitest 4.1.2 | ✅ Available | Testing framework | Already in stack; use for component tests |

### External Dependencies

None required. All technology already in stack (Astro, Tailwind, Vitest).

### No New NPM Packages

Feature uses only existing dependencies. No bundle size increase.

---

## Risk Assessment

### Part 1: Home Page Carousel

#### High Risk Items

**R1: Image Load Failures**
- **Risk**: Broken sponsor image URLs break carousel layout or show 404 placeholder
- **Mitigation**: Implement fallback gray placeholder CSS; test with intentionally broken URLs
- **Phase**: Phase 2 (image optimization)

**R2: Scroll Behavior Consistency**
- **Risk**: Carousel scroll behavior differs across browsers (Firefox, Safari, Chrome) or devices (touch vs. mouse)
- **Mitigation**: Test on multiple browsers and devices; use native scroll (not JS-driven) for consistency
- **Phase**: Phase 1 & 5 (carousel structure and testing)

#### Medium Risk Items

**R3: Link Security (Reverse Tabnabbing)**
- **Risk**: External sponsor links could allow reverse tabnabbing attacks without proper rel attributes
- **Mitigation**: Enforce `rel="noopener noreferrer"` on all external links via component validation
- **Phase**: Phase 3 (link handling)

**R4: Accessibility Compliance**
- **Risk**: Missing alt text, broken focus management, or invalid ARIA labels cause WCAG failures
- **Mitigation**: Comprehensive accessibility tests in Phase 4; manual WCAG audit before merge
- **Phase**: Phase 4 & 5 (accessibility and testing)

#### Low Risk Items

**R5: Sponsor Data Schema Changes**
- **Risk**: Future schema changes break existing sponsor cards
- **Mitigation**: Document schema in contracts; validate data shape on load
- **Phase**: Phase 0 & 6 (data model and documentation)

---

### Part 2: Get-Involved Page Grid Integration

#### High Risk Items

**R6: Grid Layout Breaking**
- **Risk**: Adding sponsor logo to slot 1 breaks existing grid layout or responsiveness
- **Mitigation**: Test grid at all breakpoints (320px, 768px, 1024px); ensure SponsorCard fits existing grid dimensions
- **Phase**: Phase 7 & 8 (integration and testing)

#### Medium Risk Items

**R7: Image Sizing Mismatch**
- **Risk**: Sponsor logo in grid slot 1 different dimensions than carousel, causing inconsistent appearance
- **Mitigation**: Reuse SponsorCard.astro component; test image dimensions in grid context
- **Phase**: Phase 7 (grid integration)

**R8: Existing Get-Involved Content Conflicts**
- **Risk**: Sponsor logo takes up space intended for other content in slot 1
- **Mitigation**: Confirm with design that slot 1 is available for sponsor; test with existing slots 2-6 unchanged
- **Phase**: Phase 7 (grid integration)

#### Low Risk Items

**R9: Component Reuse**
- **Risk**: SponsorCard.astro component properties don't match grid slot requirements
- **Mitigation**: Validate SponsorCard props work in grid context; adjust component if needed
- **Phase**: Phase 7 (grid integration)

---

## Success Metrics

### Part 1: Home Page Carousel

#### Functional Success

- [ ] Carousel renders on home page without errors
- [ ] 1 sponsor card + 1 CTA card visible and scrollable
- [ ] Sponsor logo clickable (opens in new tab)
- [ ] CTA card clickable (navigates to /get-involved)
- [ ] Invalid links handled gracefully (no JS errors)
- [ ] Carousel Part 1 acceptance criteria pass

#### Performance Success

- [ ] Page load time <1s with carousel visible
- [ ] Sponsor logo images load <500ms (primary eager, others lazy)
- [ ] Carousel doesn't cause layout shift on page load
- [ ] Scroll performance smooth (60 FPS on desktop, 30 FPS min on mobile)

#### Accessibility Success

- [ ] WCAG 2.1 AA compliance verified (carousel)
- [ ] All sponsor images have descriptive alt text
- [ ] All sponsor links have aria-label
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Focus indicators visible with 3:1+ contrast

#### Testing Success

- [ ] All Part 1 acceptance criteria have passing tests
- [ ] Code coverage >85% (carousel component)
- [ ] No skipped or flaky tests
- [ ] Responsive tests pass at 320px, 768px, 1024px+ breakpoints

---

### Part 2: Get-Involved Page Grid Integration

#### Functional Success

- [ ] Sponsor logo appears in slot 1 of get-involved grid
- [ ] Logo is clickable and opens Facebook link in new tab
- [ ] Slots 2-6 remain unchanged
- [ ] Invalid links handled gracefully (no JS errors)
- [ ] Grid Part 2 acceptance criteria pass

#### Design Success

- [ ] Sponsor logo integrates seamlessly with existing grid
- [ ] Image dimensions match grid slot requirements
- [ ] Responsive layout maintained on mobile, tablet, desktop

#### Testing Success

- [ ] All Part 2 acceptance criteria have passing tests
- [ ] Get-involved integration tests pass
- [ ] Responsive tests pass at 320px, 768px, 1024px+ breakpoints
- [ ] No layout conflicts with existing grid slots

---

## Definition of Done

Feature is **complete** when all Part 1 and Part 2 deliverables are merged:

### Part 1: Home Page Carousel
1. ✅ Carousel code merged to `cameronwalsh/coa-58-sponsors` branch
2. ✅ All Part 1 acceptance criteria tests pass (Vitest)
3. ✅ All carousel test suites pass: component, image, link, accessibility, responsive
4. ✅ Carousel code coverage >85%
5. ✅ WCAG 2.1 AA compliance verified (carousel, manual audit + automated tests)
6. ✅ SponsorCarousel renders on home page without errors
7. ✅ Sponsor data loads from `/src/data/sponsors.json`
8. ✅ Image optimization verified: WebP with PNG fallback, eager/lazy loading
9. ✅ Edge cases handled: missing data, broken images, invalid links
10. ✅ Carousel performance metrics met: <1s page load, <500ms image load
11. ✅ No breaking changes to existing components or styles

### Part 2: Get-Involved Page Grid Integration
12. ✅ Get-involved grid code merged to `cameronwalsh/coa-58-sponsors` branch
13. ✅ All Part 2 acceptance criteria tests pass (Vitest)
14. ✅ Get-involved integration tests pass (grid + sponsor slot)
15. ✅ Sponsor logo appears in slot 1, slots 2-6 unchanged
16. ✅ Responsive layout verified at 320px, 768px, 1024px+ breakpoints
17. ✅ No layout conflicts or breaking changes to get-involved page

### Documentation & Finalization
18. ✅ Documentation complete: quickstart.md, data-model.md, contracts/
19. ✅ Code coverage >85% (combined carousel + grid integration)
20. ✅ All edge cases handled for both parts
21. ✅ Ready for PR review and merge to main

---

## Timeline Estimate

| Phase | Task Count | Estimated Duration | Dependencies |
|-------|------------|-------------------|--------------|
| **Phase 0 (Shared Setup)** | 5 | 3-4 hours | None |
| **Part 1: Home Page Carousel** | | | |
| Phase 1: Carousel Structure | 7 | 4-5 hours | Phase 0 |
| Phase 2: Image Optimization | 7 | 4-5 hours | Phase 1 |
| Phase 3: Link Handling | 7 | 3-4 hours | Phase 2 |
| Phase 4: Accessibility | 8 | 4-5 hours | Phase 3 |
| Phase 5: Carousel Testing & Integration | 12 | 6-8 hours | Phase 4 |
| Phase 6: Part 1 Edge Cases & Docs | 9 | 4-5 hours | Phase 5 |
| **Part 2: Get-Involved Grid Integration** | | | |
| Phase 7: Grid Integration | 7 | 2-3 hours | Phase 0 & 6 |
| Phase 8: Part 2 Testing & Cleanup | 9 | 3-4 hours | Phase 7 |
| **Total** | **71** | **33-43 hours** | Sequential |

**Timeline Notes**:
- Phase 0 establishes shared data source (`sponsors.json`) and reusable components (SponsorCard, SponsorCTACard) used by both parts
- Part 1 (Phases 1-6): 28-32 hours for carousel implementation
- Part 2 (Phases 7-8): 5-7 hours for get-involved grid integration (much simpler)
- Total dual-scope implementation: 33-43 hours (vs. 40-55 hours for original carousel-only plan)

---

## Next Steps

1. **Review This Plan**: Ensure technical decisions align with project goals and constraints
2. **Confirm Dual-Scope Approach**:
   - Part 1: Home page carousel (primary feature) - 28-32 hours
   - Part 2: Get-involved grid slot 1 (secondary feature) - 5-7 hours
   - Total: 33-43 hours
3. **Ask Clarifying Questions** (if needed):
   - Where should the static "Become a Sponsor" button appear on page?
   - Should sponsor images be stored locally or on CDN?
   - Should sponsors be added/managed via JSON or future CMS?
   - Get-involved slot 1 confirmed available for sponsor logo?
4. **Create `tasks.md`**: Break phases into atomic tasks with estimated effort
5. **Begin Implementation**: Start Phase 0 (shared setup) after approval

---

## Appendix: File Reference

### Phase 0: Shared Setup
- **Create**: `/src/data/sponsors.json` (sponsor configuration - shared by both parts)
- **Create**: `/src/components/SponsorCard.astro` (sponsor card subcomponent - reused by both parts)
- **Create**: `/src/components/SponsorCTACard.astro` (CTA card subcomponent - Part 1 only)

### Part 1: Home Page Carousel
- **Create**: `/src/components/SponsorCarousel.astro` (main carousel component)
- **Create**: `/src/components/__tests__/SponsorCarousel.*.test.ts` (carousel test files)
- **Modify**: `/src/pages/index.astro` (integrate carousel, manage static button)

### Part 2: Get-Involved Grid
- **Modify**: `/src/components/GetInvolvedGrid.astro` (add sponsor logo to slot 1)
- **Create**: `/src/components/__tests__/GetInvolvedGrid.integration.test.ts` (grid integration tests)
- **Modify**: `/src/pages/get-involved.astro` (if needed for data loading)

### Documentation
- **Create**: `/specs/coa-58-sponsors/data-model.md`
- **Create**: `/specs/coa-58-sponsors/contracts/sponsor-data-contract.md`
- **Create**: `/specs/coa-58-sponsors/research.md`
- **Create**: `/specs/coa-58-sponsors/quickstart.md`

### Key Styling Classes

- `overflow-x-auto overflow-y-hidden` — horizontal scroll container
- `w-[200px] sm:w-[220px] lg:w-[250px]` — responsive card width
- `flex-shrink-0` — prevent card compression
- `object-contain object-center` — logo sizing (no distortion)
- `focus:outline-2 focus:outline-offset-2 focus:outline-brand-purple` — focus style

---

## Notes for Implementation Team

### Dual-Scope Strategy

1. **Phase 0: Shared Foundation**: Build once, use twice
   - `sponsors.json` data source (used by carousel and grid)
   - `SponsorCard.astro` component (reused in carousel and grid slot 1)
   - `SponsorCTACard.astro` (Part 1 only, not needed for Part 2)
   - This approach minimizes duplication and ensures consistency

2. **Part 1 (Primary): Carousel on Home Page**
   - Higher complexity: carousel layout, scroll behavior, image optimization
   - More test coverage needed (responsive, accessibility, edge cases)
   - Estimated 28-32 hours
   - Reuses patterns from COA-22 (responsive layout, image optimization)

3. **Part 2 (Secondary): Grid Slot Integration**
   - Much simpler: leverage Phase 0 and Part 1 components
   - Minimal changes to existing GetInvolvedGrid component
   - Estimated 5-7 hours
   - Use existing SponsorCard.astro (no new complexity)

### Pattern Over Reuse
- Learn from COA-22's responsive layout and image optimization patterns, but build a simpler horizontal-scroll carousel (not 3D rotation)
- Reuse SponsorCard.astro in both carousel and grid contexts to maintain consistency

### Astro Image Component
- Use built-in Astro Image for automatic WebP optimization
- Wrap in `<picture>` element for explicit PNG fallback
- Implement once in Phase 0, reuse in both Part 1 and Part 2

### Sponsor Count Logic
- Implement in Phase 0 (shared setup)
- Threshold (6) configurable via `/src/data/sponsors.json` for future adjustments
- Only affects Part 1 (carousel threshold); Part 2 always shows first sponsor

### Testing Strategy
- Phase 0: Unit tests for shared components (SponsorCard, SponsorCTACard)
- Part 1 (Phases 1-6): Component, image, link, accessibility, responsive, edge case tests
- Part 2 (Phases 7-8): Integration tests for grid slot, responsive tests, edge cases

### Accessibility Priority
- Build accessibility in from Phase 0, not as afterthought
- Every component needs alt text, aria-labels, focus management
- WCAG 2.1 AA compliance verified before Part 1 merge

### Image Optimization
- Don't oversimplify: WebP + PNG fallback, eager/lazy loading, error fallback placeholders are non-negotiable
- Implement in Phase 2 (shared image optimization for both parts)

### Documentation
- Write quickstart.md as you go (during Phases 1-8)
- Document data model once (Phase 0 completion)
- Include examples for both carousel and grid integration
- Troubleshooting covers both Part 1 and Part 2

---

**Plan Created**: 2026-04-18 | **Status**: Ready for Review & Approval
