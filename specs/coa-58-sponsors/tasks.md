# Tasks: Sponsors (COA-58) — Dual-Scope Implementation

**Input**: Specs from `/specs/coa-58-sponsors/`  
**Strategy**: Option C Execution Windows (GSD-aligned, dual-scope)  
**Branch**: `cameronwalsh/coa-58-sponsors`  
**Scope**: Part 1 (Home Carousel, 28-32 hrs) + Part 2 (Get-Involved Grid, 5-7 hrs) = 33-39 hours total

---

## Format Guide

- **[P]**: Can run in parallel (different files, same window, no conflicts)
- **Window N**: Execution context boundary (fresh ~60-80k token allocation per window)
- **WINDOW_CHECKPOINT**: Validation gate before next window
- **Traceability**: Each task maps back to spec (FR-C-XXX carousel, FR-G-XXX grid, US-1 through US-4)
- **Part**: Task belongs to Part 1 (carousel) or Part 2 (grid)
- **Phase**: Delivery phase from plan.md

---

## Execution Window 1: Shared Setup & Foundation

**Purpose**: Establish sponsor data source and reusable components used by BOTH Part 1 (carousel) and Part 2 (grid). This window BLOCKS all feature development.

**Part**: Shared (Phase 0)  
**Token Budget**: 60-80k  
**Duration**: 4-6 hours  

**Checkpoint Validation**:
- [ ] `sponsors.json` created and valid (parseable, contains 1 sponsor)
- [ ] `SponsorCard.astro` component created, accepts sponsor prop
- [ ] `SponsorCTACard.astro` component created, renders CTA text
- [ ] `SponsorCarousel.astro` skeleton created with Props interface (threshold logic in place)
- [ ] Unit tests pass for prop validation (12 tests)
- [ ] No TypeScript errors
- [ ] Can proceed to Window 2

---

### T001 [P] Create sponsors.json data source with initial sponsor

**Window**: 1 (Shared Setup)  
**Part**: Shared (Phase 0)  
**Traceability**: FR-C-001, FR-C-002, FR-G-001, FR-G-002  
**Dependencies**: None  
**Description**: Create sponsor configuration data file with 1 initial sponsor (MB Automation Victoria) and config parameters

**What to create**:
- File: `/src/data/sponsors.json`
- Content structure:
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
- Validation: JSON is valid, all fields present, URL is valid HTTPS

**Test**: Data file loads without error
```bash
# Manual: cat /src/data/sponsors.json | jq . > /dev/null && echo "Valid JSON"
```

---

### T002 [P] Create SponsorCard.astro subcomponent (reusable for carousel and grid)

**Window**: 1 (Shared Setup)  
**Part**: Shared (Phase 0)  
**Traceability**: FR-C-003, FR-C-005, FR-G-002, FR-G-003  
**Dependencies**: T001 (sponsor data structure known)  
**Description**: Create reusable sponsor card component for rendering individual sponsor logos (used by carousel Part 1 and grid Part 2)

**What to create**:
- File: `/src/components/SponsorCard.astro`
- Props interface:
  ```typescript
  interface Props {
    sponsor: {
      id: string;
      name: string;
      logo: string;
      link?: string;
      joinedDate: string;
    };
    isFirstSponsor?: boolean;  // For eager/lazy loading control (Part 1)
  }
  ```
- Render: Simple container with placeholder (logo will be added in Window 2)
  - Display sponsor name as text fallback
  - Data attribute: `data-testid={sponsor.id}` for testing
- Purpose: Single component used by both carousel (Part 1) and grid slot 1 (Part 2)

**Test**: Component accepts props without error
```bash
# Manual: npx astro build --no-exit && echo "No build errors"
```

---

### T003 [P] Create SponsorCTACard.astro subcomponent (Part 1 only)

**Window**: 1 (Shared Setup)  
**Part**: Shared (Phase 0, used only by Part 1)  
**Traceability**: FR-C-004, FR-C-009  
**Dependencies**: None  
**Description**: Create reusable "Become a Sponsor" CTA card component (used by carousel, not grid)

**What to create**:
- File: `/src/components/SponsorCTACard.astro`
- Props interface:
  ```typescript
  interface Props {
    ctaLink: string;
  }
  ```
- Render: Card with CTA text
  - Text: "Become a Sponsor"
  - Data attribute: `data-testid="sponsor-cta-card"`
  - Placeholder for link (will add in Window 3)
- Purpose: Displays in carousel when `sponsors.length < threshold`

**Test**: Component renders without error
```bash
# Manual: npx astro build --no-exit && echo "No build errors"
```

---

### T004 [P] Create SponsorCarousel.astro skeleton with Props and threshold logic

**Window**: 1 (Shared Setup)  
**Part**: Part 1 (Phase 1)  
**Traceability**: FR-C-001, FR-C-006, FR-C-010  
**Dependencies**: T001, T002, T003 (data and subcomponents defined)  
**Description**: Create main carousel component accepting sponsors array, threshold, and CTA link props. Implement threshold logic for CTA card visibility.

**What to create**:
- File: `/src/components/SponsorCarousel.astro`
- Props interface:
  ```typescript
  interface Sponsor {
    id: string;
    name: string;
    logo: string;
    link?: string;
    joinedDate: string;
  }

  interface Props {
    sponsors: Sponsor[];
    sponsorCountThreshold?: number;  // Default: 6
    ctaLink?: string;                // Default: "/get-involved"
  }
  ```
- Implement threshold logic:
  - `showCtaCard = sponsors.length < sponsorCountThreshold`
  - `showStaticButton = sponsors.length >= sponsorCountThreshold`
- Render: Container div with slots for subcomponents (not rendering cards yet)
- Purpose: Main carousel container for Part 1 (Part 2 uses SponsorCard directly in grid)

**Test**: Component accepts props, threshold logic works
```bash
# Manual: npx astro build --no-exit && echo "No build errors"
```

---

### T005 Create component integration test for props and threshold logic

**Window**: 1 (Shared Setup)  
**Part**: Shared (Phase 0)  
**Traceability**: FR-C-001, FR-C-006, US-1, US-3  
**Dependencies**: T002, T003, T004 (components created)  
**Description**: Write unit tests for component prop validation and threshold logic

**What to create**:
- File: `/src/components/__tests__/SponsorCarousel.component.test.ts`
- Test suite: Component Props & Threshold Logic (12 tests)
  - Test 1: SponsorCarousel accepts sponsors array prop
  - Test 2: SponsorCarousel accepts sponsorCountThreshold prop (custom value)
  - Test 3: SponsorCarousel uses default threshold (6) when not provided
  - Test 4: SponsorCarousel accepts ctaLink prop
  - Test 5: SponsorCarousel uses default ctaLink ("/get-involved") when not provided
  - Test 6: Threshold logic: showCtaCard true when sponsors.length < threshold
  - Test 7: Threshold logic: showCtaCard false when sponsors.length >= threshold
  - Test 8: Threshold logic: showStaticButton false when sponsors.length < threshold
  - Test 9: Threshold logic: showStaticButton true when sponsors.length >= threshold
  - Test 10: SponsorCard rendered for each sponsor in array
  - Test 11: SponsorCTACard rendered when showCtaCard true
  - Test 12: SponsorCTACard NOT rendered when showCtaCard false

**Test Framework**: Vitest 4.1.2
```bash
npm test -- SponsorCarousel.component.test.ts
```

**Test Status**: All 12 MUST PASS before Window 1 checkpoint

---

[WINDOW_CHECKPOINT_1: Shared Foundation Ready]

**Before proceeding to Window 2**:
- [ ] T001: sponsors.json created, valid JSON with 1 sponsor
- [ ] T002: SponsorCard component created, accepts props
- [ ] T003: SponsorCTACard component created
- [ ] T004: SponsorCarousel component created, threshold logic works
- [ ] T005: All 12 unit tests PASS
- [ ] No TypeScript errors
- [ ] Shared components ready for Part 1 carousel and Part 2 grid

**Handoff to Window 2**: SponsorCard and SponsorCTACard created (reusable), SponsorCarousel skeleton with threshold logic ready. Ready for Part 1 carousel layout implementation.

---

## Execution Window 2: Part 1 — Carousel Layout & Images

**Purpose**: Implement carousel container with responsive fixed-width cards, integrate Astro Image optimization, and add image load failure handling. Makes carousel visually functional.

**Part**: Part 1 (Phases 2-3)  
**Token Budget**: 70-90k  
**Duration**: 8-10 hours  

**Checkpoint Validation**:
- [ ] Carousel container scrolls horizontally on all screen sizes
- [ ] Cards maintain fixed width at breakpoints (200px/220px/250px)
- [ ] Sponsor logos display with Astro Image (WebP + PNG fallback)
- [ ] Primary sponsor loads eagerly, others lazy
- [ ] Failed images show gray placeholder
- [ ] CTA card visually distinct from sponsor cards
- [ ] All AC-1, AC-2, AC-10, AC-11, AC-12, AC-13 passing (display, responsive, images)
- [ ] Can proceed to Window 3

---

### T006 [P] Add carousel container with horizontal scroll styling

**Window**: 2 (Carousel Layout)  
**Part**: Part 1 (Phase 2)  
**Traceability**: FR-C-001, FR-C-002, AC-1, AC-2, AC-5  
**Dependencies**: T004 (SponsorCarousel ready)  
**Description**: Implement horizontal scroll container with responsive gap and overflow handling

**What to modify**:
- File: `/src/components/SponsorCarousel.astro`
- Add carousel container markup:
  ```html
  <div class="flex overflow-x-auto overflow-y-hidden gap-6 pb-4 scroll-smooth">
    <!-- Cards rendered here -->
  </div>
  ```
- Tailwind classes:
  - `overflow-x-auto overflow-y-hidden` — horizontal scroll
  - `gap-6` — 24px spacing between cards
  - `pb-4` — padding-bottom for scrollbar
  - `scroll-smooth` — smooth scrolling behavior
- Test on multiple viewports (320px, 768px, 1024px)

**Test**: Carousel scrolls horizontally
```bash
# Manual: npm run dev, verify horizontal scroll at multiple viewport sizes
```

---

### T007 [P] Define responsive card widths at breakpoints (200/220/250px)

**Window**: 2 (Carousel Layout)  
**Part**: Part 1 (Phase 2)  
**Traceability**: FR-C-001, FR-C-010, AC-2, AC-17, AC-18, AC-19  
**Dependencies**: T006 (carousel container ready)  
**Description**: Set fixed card widths with responsive scaling across breakpoints

**What to modify**:
- File: `/src/components/SponsorCard.astro` and `/src/components/SponsorCTACard.astro`
- Add responsive width classes to both components:
  - Mobile (320px): `w-[200px]` fixed width
  - Tablet (768px): `sm:w-[220px]` fixed width
  - Desktop (1024px+): `lg:w-[250px]` fixed width
- Add flex classes: `flex-shrink-0` (prevent card compression)
- Add padding: `p-4` or `p-5` (16-20px internal padding)
- Add aspect ratio: aspect-square or aspect-video (depends on logo aspect ratio)

**Test**: Cards maintain fixed width
```bash
# Manual: Render at 320px/768px/1024px, verify widths match
```

---

### T008 [P] Add fade gradient edges (desktop only) to signal scrollability

**Window**: 2 (Carousel Layout)  
**Part**: Part 1 (Phase 2)  
**Traceability**: FR-C-001, AC-1  
**Dependencies**: T006 (carousel container ready)  
**Description**: Implement left/right fade overlays to indicate horizontal scroll (desktop only)

**What to create/modify**:
- File: `/src/components/SponsorCarousel.astro`
- Add CSS pseudo-elements:
  - `::before` (left fade): linear-gradient(to right, rgba(255,255,255,1), transparent)
  - `::after` (right fade): linear-gradient(to left, rgba(255,255,255,1), transparent)
  - Position: absolute, overlaid, width 40-60px
  - Show only on desktop: `md:block hidden`
- CSS property: `pointer-events: none` (allow clicks through fade)

**Test**: Fade edges visible on desktop
```bash
# Manual: Render at 1024px+, verify fade gradients on left/right edges
```

---

### T009 Integrate Astro Image component with WebP + PNG fallback

**Window**: 2 (Carousel Images)  
**Part**: Part 1 (Phase 3)  
**Traceability**: FR-C-002, FR-C-005, FR-C-008, AC-10, AC-11, AC-20  
**Dependencies**: T002, T007 (SponsorCard ready, widths defined)  
**Description**: Add Astro Image component to SponsorCard with WebP optimization and PNG fallback

**What to modify**:
- File: `/src/components/SponsorCard.astro`
- Import Astro Image: `import { Image } from 'astro:assets';`
- Replace text placeholder with Image element:
  ```astro
  <Image
    src={sponsor.logo}
    alt={`${sponsor.name} logo`}
    loading={isFirstSponsor ? 'eager' : 'lazy'}
    format="webp"
    width={250}
    height={250}
    class="w-full h-auto object-contain object-center"
  />
  ```
- Accessibility: alt text includes sponsor name (e.g., "MB Automation Victoria logo")
- Image styling: `object-contain object-center` prevents distortion, centers logo

**Test**: Images load with Astro Image
```bash
# Manual: Inspect img elements, verify src contains .webp extension, alt text descriptive
```

---

### T010 [P] Implement image load failure handling with gray placeholder

**Window**: 2 (Carousel Images)  
**Part**: Part 1 (Phase 3)  
**Traceability**: FR-C-009, AC-12, AC-13, AC-21  
**Dependencies**: T009 (Astro Image integrated)  
**Description**: Add fallback CSS for broken images to display gray placeholder

**What to modify**:
- File: `/src/components/SponsorCard.astro`
- Add CSS rule for image error fallback:
  ```css
  .sponsor-logo-wrapper {
    background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 200px;
  }
  ```
- Wrap image in container: `<div class="sponsor-logo-wrapper"><Image ... /></div>`
- Gray background shows if image fails to load
- No layout shift if image breaks

**Test**: Broken images show placeholder
```bash
# Manual: Change logo URL to invalid path, verify gray placeholder displays, no errors
```

---

### T011 [P] Create image loading and optimization test

**Window**: 2 (Carousel Images)  
**Part**: Part 1 (Phase 3)  
**Traceability**: FR-C-002, FR-C-005, AC-10, AC-11, AC-12, AC-13, AC-20  
**Dependencies**: T009, T010 (image handling complete)  
**Description**: Write tests for image loading strategy, optimization, and fallback

**What to create**:
- File: `/src/components/__tests__/SponsorCarousel.image-loading.test.ts`
- Test suite: Image Loading & Optimization (8 tests)
  - Test 1: First sponsor logo has loading="eager"
  - Test 2: Subsequent sponsors have loading="lazy"
  - Test 3: Image alt text is descriptive (includes sponsor name)
  - Test 4: Image src contains .webp extension (WebP format)
  - Test 5: Image has width and height attributes (Astro Image output)
  - Test 6: Broken image URL shows placeholder (no layout shift)
  - Test 7: Fallback PNG available (browser without WebP support)
  - Test 8: No console errors when image fails to load

**Test Framework**: Vitest 4.1.2
```bash
npm test -- SponsorCarousel.image-loading.test.ts
```

**Test Status**: All 8 MUST PASS before Window 2 checkpoint

---

### T012 [P] Create responsive design test at breakpoints (320/768/1024px)

**Window**: 2 (Carousel Layout)  
**Part**: Part 1 (Phase 2)  
**Traceability**: FR-C-001, FR-C-010, AC-2, AC-17, AC-18, AC-19  
**Dependencies**: T007 (responsive widths defined)  
**Description**: Write tests validating card sizing and layout at all breakpoints

**What to create**:
- File: `/src/components/__tests__/SponsorCarousel.responsive.test.ts`
- Test suite: Responsive Design & Breakpoints (8 tests)
  - Test 1: At 320px, card width is 200px
  - Test 2: At 768px, card width is 220px
  - Test 3: At 1024px, card width is 250px
  - Test 4: Card aspect ratio maintained at all breakpoints
  - Test 5: No horizontal overflow at 320px
  - Test 6: No horizontal overflow at 768px
  - Test 7: No horizontal overflow at 1024px
  - Test 8: Sponsor logos centered and scaled at all breakpoints

**Test Framework**: Vitest with viewport simulation
```bash
npm test -- SponsorCarousel.responsive.test.ts
```

**Test Status**: All 8 MUST PASS before Window 2 checkpoint

---

[WINDOW_CHECKPOINT_2: Part 1 Carousel Layout & Images Complete]

**Before proceeding to Window 3**:
- [ ] T006: Carousel container scrolls horizontally
- [ ] T007: Cards maintain responsive width (200/220/250px)
- [ ] T008: Fade edges visible on desktop
- [ ] T009: Astro Image integrated with WebP/PNG
- [ ] T010: Broken images show gray placeholder
- [ ] T011: Image loading tests PASS (8 tests)
- [ ] T012: Responsive tests PASS (8 tests)
- [ ] AC-1, AC-2, AC-10, AC-11, AC-12, AC-13, AC-17, AC-18, AC-19 validated
- [ ] No layout shifts or image errors
- [ ] Carousel visually complete and responsive

**Handoff to Window 3**: Carousel layout complete, images optimized, responsive at all breakpoints. Ready for link handling and accessibility.

---

## Execution Window 3: Part 1 — Links, Security & Accessibility

**Purpose**: Implement sponsor and CTA links with security attributes, keyboard navigation, screen reader support, and WCAG 2.1 AA compliance. Makes carousel fully interactive and accessible.

**Part**: Part 1 (Phases 4-5)  
**Token Budget**: 75-90k  
**Duration**: 8-10 hours  

**Checkpoint Validation**:
- [ ] Sponsor links open in new tab with rel="noopener noreferrer"
- [ ] CTA card links to /get-involved
- [ ] Missing/invalid links handled gracefully
- [ ] All images have descriptive alt text
- [ ] All links have aria-label
- [ ] Tab navigation works (focus indicators visible)
- [ ] Keyboard Enter/Space triggers navigation
- [ ] All AC-3 through AC-9, AC-14 through AC-16, AC-6, AC-7, AC-8 passing
- [ ] Can proceed to Window 4

---

### T013 [P] Implement sponsor link wrapping with security attributes

**Window**: 3 (Links & Security)  
**Part**: Part 1 (Phase 4)  
**Traceability**: FR-C-003, FR-C-005, FR-C-007, AC-3, AC-4, AC-5, AC-14  
**Dependencies**: T009 (image component ready)  
**Description**: Wrap sponsor logo with anchor tag, add target="_blank" and rel="noopener noreferrer"

**What to modify**:
- File: `/src/components/SponsorCard.astro`
- Update render:
  ```astro
  {sponsor.link ? (
    <a
      href={sponsor.link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit ${sponsor.name} (opens in new tab)`}
      class="block focus:outline-2 focus:outline-offset-2 focus:outline-brand-purple"
    >
      <div class="sponsor-logo-wrapper"><Image ... /></div>
    </a>
  ) : (
    <div class="sponsor-logo-wrapper"><Image ... /></div>
  )}
  ```
- Conditional: Only wrap if sponsor.link is present and valid
- Security attributes:
  - `target="_blank"` — open in new tab
  - `rel="noopener noreferrer"` — prevent reverse tabnabbing
- Accessibility:
  - `aria-label={`Visit ${sponsor.name} (opens in new tab)`}` — screen reader announcement
  - Focus style: `focus:outline-2 focus:outline-offset-2 focus:outline-brand-purple`

**Test**: Links render with security attributes
```bash
# Manual: Inspect anchor elements, verify target="_blank" and rel="noopener noreferrer"
```

---

### T014 [P] Implement CTA card link and conditional rendering

**Window**: 3 (Links & Security)  
**Part**: Part 1 (Phase 4)  
**Traceability**: FR-C-004, FR-C-009, AC-3, AC-17, AC-18  
**Dependencies**: T003, T004 (SponsorCTACard and threshold logic ready)  
**Description**: Add link to CTA card and conditional rendering based on sponsor count

**What to modify**:
- File: `/src/components/SponsorCTACard.astro`
- Update render:
  ```astro
  <a
    href={ctaLink}
    class="flex items-center justify-center w-full h-full bg-brand-light-purple hover:bg-brand-purple transition focus:outline-2 focus:outline-offset-2 focus:outline-brand-purple"
  >
    <span class="font-semibold text-center px-4">Become a Sponsor</span>
  </a>
  ```
- Link attributes:
  - `href={ctaLink}` — default "/get-involved"
  - Internal link (no target="_blank")
  - Keyboard accessible: Enter/Space triggers navigation
- Styling: Distinct from sponsor cards (different background color, hover state)

**Test**: CTA card is clickable and navigates
```bash
# Manual: Render carousel with <6 sponsors, verify CTA card visible and clickable
```

---

### T015 [P] Add conditional static button below carousel (>= 6 sponsors)

**Window**: 3 (Links & Security)  
**Part**: Part 1 (Phase 4)  
**Traceability**: FR-C-006, FR-C-009, US-2, AC-3  
**Dependencies**: T004 (threshold logic exists), T014 (CTA card ready)  
**Description**: Implement static "Become a Sponsor" button that appears when sponsor count reaches threshold

**What to modify**:
- File: `/src/pages/index.astro` (where carousel integrates)
- Add button visibility logic after carousel:
  ```astro
  {sponsorCount >= sponsorCountThreshold && (
    <div class="mt-8 text-center">
      <a
        href={ctaLink}
        class="inline-block px-6 py-3 bg-brand-purple text-white rounded hover:bg-brand-purple-dark transition focus:outline-2 focus:outline-offset-2"
      >
        Become a Sponsor
      </a>
    </div>
  )}
  ```
- Conditional: Show only when `sponsors.length >= threshold`
- CTA card remains in carousel regardless (never hide both)
- Button placement: Below carousel, centered

**Test**: Static button visibility controlled by sponsor count
```bash
# Manual: With 5 sponsors → button hidden; with 6+ → button visible
```

---

### T016 Create test for link handling and security

**Window**: 3 (Links & Security)  
**Part**: Part 1 (Phase 4)  
**Traceability**: FR-C-003, FR-C-005, AC-3, AC-4, AC-5, AC-14, AC-16, AC-21  
**Dependencies**: T013, T014, T015 (links implemented)  
**Description**: Write tests for sponsor and CTA link behavior, security attributes, edge cases

**What to create**:
- File: `/src/components/__tests__/SponsorCarousel.links.test.ts`
- Test suite: Link Handling & Security (12 tests)
  - Test 1: Sponsor with valid link has correct href
  - Test 2: Sponsor link has target="_blank"
  - Test 3: Sponsor link has rel="noopener noreferrer"
  - Test 4: Sponsor link has aria-label with sponsor name and "(opens in new tab)"
  - Test 5: Sponsor without link is NOT wrapped in anchor
  - Test 6: Sponsor without link displays logo as static image
  - Test 7: CTA card link has correct ctaLink value
  - Test 8: CTA card link navigates (no target="_blank")
  - Test 9: Invalid URL doesn't render as anchor (safely handled)
  - Test 10: Malformed URLs skipped without XSS risk
  - Test 11: Static button visible when sponsors.length >= threshold
  - Test 12: Static button hidden when sponsors.length < threshold

**Test Framework**: Vitest 4.1.2
```bash
npm test -- SponsorCarousel.links.test.ts
```

**Test Status**: All 12 MUST PASS before Window 3 checkpoint

---

### T017 Create accessibility compliance test (WCAG 2.1 AA)

**Window**: 3 (Links & Security)  
**Part**: Part 1 (Phase 5)  
**Traceability**: FR-C-008, AC-6, AC-7, AC-8, AC-9, AC-15  
**Dependencies**: T013, T014, T015 (accessibility attributes in place)  
**Description**: Write tests for keyboard navigation, screen reader support, focus management, WCAG compliance

**What to create**:
- File: `/src/components/__tests__/SponsorCarousel.accessibility.test.ts`
- Test suite: Accessibility & WCAG 2.1 AA Compliance (14 tests)
  - Test 1: All images have alt attribute
  - Test 2: Alt text is descriptive (includes sponsor name)
  - Test 3: All sponsor links have aria-label
  - Test 4: aria-label is descriptive (includes sponsor name and "(opens in new tab)")
  - Test 5: Sponsor links are focusable (tabindex implicit or native link)
  - Test 6: CTA card is focusable
  - Test 7: Focus indicators visible (outline-2, outline-offset-2)
  - Test 8: Focus indicator has sufficient contrast (WCAG AA 3:1 min)
  - Test 9: Keyboard Tab moves focus through links in order
  - Test 10: Keyboard Enter opens sponsor link in new tab
  - Test 11: Carousel container has descriptive aria-label
  - Test 12: No keyboard traps (Tab exits carousel)
  - Test 13: No animations that conflict with reduced-motion preference
  - Test 14: Screen readers announce "(opens in new tab)" for external links

**Test Framework**: Vitest with axe-core
```bash
npm test -- SponsorCarousel.accessibility.test.ts
```

**Test Status**: All 14 MUST PASS before Window 3 checkpoint

---

### T018 Handle edge case: missing/invalid sponsor links

**Window**: 3 (Links & Security)  
**Part**: Part 1 (Phase 4)  
**Traceability**: FR-C-005, AC-16, AC-21  
**Dependencies**: T013 (sponsor link wrapping ready)  
**Description**: Implement graceful handling for missing or invalid URLs

**What to modify**:
- File: `/src/components/SponsorCard.astro`
- Add URL validation function:
  ```typescript
  const isValidUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  ```
- Update conditional:
  ```astro
  {isValidUrl(sponsor.link) ? (
    <a href={sponsor.link} ...>...</a>
  ) : (
    <div>...</div>
  )}
  ```
- No JS errors for missing/invalid URLs
- Sponsor logo displays as static image (not clickable)

**Test**: Invalid URLs handled gracefully
```bash
# Manual: Render sponsor with missing/invalid link, verify image not clickable, no console error
```

---

[WINDOW_CHECKPOINT_3: Part 1 Links & Accessibility Complete]

**Before proceeding to Window 4**:
- [ ] T013: Sponsor links have target="_blank" and rel="noopener noreferrer"
- [ ] T014: CTA card links to /get-involved
- [ ] T015: Static button visibility controlled by threshold
- [ ] T016: Link handling tests PASS (12 tests)
- [ ] T017: Accessibility tests PASS (14 tests)
- [ ] T018: Invalid URLs handled gracefully
- [ ] AC-3 through AC-9, AC-14 through AC-16 validated
- [ ] No XSS vulnerabilities
- [ ] Keyboard navigation works (Tab through links, Enter/Space to open)
- [ ] Part 1 carousel fully interactive and accessible

**Handoff to Window 4**: Part 1 carousel complete (layout, images, links, accessibility). Ready for home page integration and Part 2 grid integration.

---

## Execution Window 4: Part 1 Integration + Part 2 Simple Grid Integration

**Purpose**: Integrate Part 1 carousel into home page, integrate Part 2 sponsor logo into get-involved grid slot 1, verify both implementations work, document feature, finalize.

**Part**: Part 1 (Phase 6-7) + Part 2 (Phase 7-8)  
**Token Budget**: 60-80k  
**Duration**: 6-8 hours  

**Checkpoint Validation**:
- [ ] SponsorCarousel renders on home page without errors
- [ ] Sponsor logo appears in get-involved grid slot 1 (Part 2)
- [ ] Sponsor data loads correctly from sponsors.json
- [ ] All acceptance criteria tests PASS
- [ ] Code coverage >85%
- [ ] Documentation complete
- [ ] No console errors
- [ ] Ready for merge

---

### T019 [P] Integrate Part 1: SponsorCarousel into home page

**Window**: 4 (Integration & Polish)  
**Part**: Part 1 (Phase 7)  
**Traceability**: FR-C-001 through FR-C-010, US-1, US-2  
**Dependencies**: T013, T014, T015 (Part 1 complete)  
**Description**: Update home page to import and render SponsorCarousel component with proper section layout

**What to modify**:
- File: `/src/pages/index.astro`
- Add imports:
  ```astro
  import SponsorCarousel from '../components/SponsorCarousel.astro';
  import sponsorsData from '../data/sponsors.json';
  ```
- Render carousel section:
  ```astro
  <section class="py-12 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4">
      <h2 class="text-3xl font-bold mb-8">Our Sponsors</h2>
      <SponsorCarousel
        sponsors={sponsorsData.sponsors}
        sponsorCountThreshold={sponsorsData.sponsorCountThreshold}
        ctaLink={sponsorsData.ctaLink}
      />
    </div>
  </section>
  ```
- Placement: After hero section (TBD with design, can adjust)
- No layout conflicts with existing sections

**Test**: Carousel renders on home page
```bash
# Manual: npm run dev, visit localhost:3000, verify carousel visible and functional
```

---

### T020 [P] Integrate Part 2: Add sponsor logo to get-involved grid slot 1

**Window**: 4 (Integration & Polish)  
**Part**: Part 2 (Phase 7)  
**Traceability**: FR-G-001, FR-G-002, US-3  
**Dependencies**: T002 (SponsorCard ready), T001 (sponsors.json ready)  
**Description**: Update get-involved page to display sponsor logo in slot 1 of 6-slot grid (much simpler than Part 1)

**What to modify**:
- File: `/src/pages/get-involved.astro` OR `/src/components/GetInvolvedGrid.astro` (locate existing grid)
- Locate existing sponsors grid (lines ~229-238 in get-involved.astro per spec)
- Replace slot 1 with sponsor card:
  ```astro
  import SponsorCard from '../components/SponsorCard.astro';
  import sponsorsData from '../data/sponsors.json';

  // In grid render:
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
    {sponsorsData.sponsors.length > 0 && (
      <SponsorCard sponsor={sponsorsData.sponsors[0]} />
    )}
    {/* Slots 2-6 remain unchanged */}
    {Array.from({ length: 5 }).map((_, i) => (
      <div class="h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
        <a href="mailto:hello@bendigophoenix.org.au?subject=Sponsorship%20Enquiry" aria-label="Become a sponsor" class="text-xs text-gray-400 font-semibold hover:text-gray-600">
          Become a Sponsor
        </a>
      </div>
    ))}
  </div>
  ```
- Key: Only slot 1 changes; slots 2-6 remain placeholder CTA boxes
- Sponsor logo clickable (uses SponsorCard from Part 1)

**Test**: Grid renders with sponsor in slot 1
```bash
# Manual: Visit /get-involved, verify sponsor logo in slot 1, other slots unchanged
```

---

### T021 Create data-model.md documentation

**Window**: 4 (Integration & Polish)  
**Part**: Shared  
**Traceability**: FR-C-001, FR-G-001  
**Dependencies**: T001 (sponsors.json created)  
**Description**: Document sponsor data structure, schema, validation rules for future updates

**What to create**:
- File: `/specs/coa-58-sponsors/data-model.md`
- Content sections:
  - Sponsor schema (fields, types, constraints)
  - Example sponsor object
  - Configuration schema (threshold, ctaLink)
  - Validation rules (required, URL format, date format)
  - Adding new sponsors (step-by-step)
  - Future CMS integration notes
- Format: Clear, maintainable, developer-friendly

**Test**: Documentation is complete and accurate
```bash
# Manual: Review data-model.md for clarity
```

---

### T022 Create sponsor data contract documentation

**Window**: 4 (Integration & Polish)  
**Part**: Shared  
**Traceability**: FR-C-001, FR-G-001  
**Dependencies**: T001 (sponsors.json created)  
**Description**: Document TypeScript interfaces, data validation, API contracts

**What to create**:
- File: `/specs/coa-58-sponsors/contracts/sponsor-data-contract.md`
- Content sections:
  - Sponsor interface (TypeScript type)
  - Props interfaces (SponsorCarousel, SponsorCard, SponsorCTACard)
  - Data validation requirements
  - Constraint rules (threshold, URL format, etc.)
  - Error handling (missing fields, invalid URLs)
  - Examples (valid/invalid sponsor objects)
  - Future integration notes
- Format: Technical, for developers

**Test**: Documentation is complete and accurate
```bash
# Manual: Review contract.md for technical completeness
```

---

### T023 Create quickstart.md manual testing guide

**Window**: 4 (Integration & Polish)  
**Part**: Shared  
**Traceability**: FR-C-001 through FR-C-010, FR-G-001 through FR-G-005  
**Dependencies**: T019, T020 (integration complete)  
**Description**: Write manual testing guide with test checklist and troubleshooting

**What to create**:
- File: `/specs/coa-58-sponsors/quickstart.md`
- Content sections:
  - Setup instructions
  - Manual test procedures (Part 1 carousel and Part 2 grid)
  - Test checklist (all AC scenarios)
  - Adding a new sponsor
  - Troubleshooting section:
    - Sponsor image not loading
    - Link doesn't open in new tab
    - Focus indicator not visible
    - Responsive layout broken
  - Performance profiling
  - Accessibility validation (WAVE, axe)
- Format: User-friendly, step-by-step

**Test**: Documentation is complete and helpful
```bash
# Manual: Review quickstart.md for clarity and completeness
```

---

### T024 Run final acceptance criteria validation test

**Window**: 4 (Integration & Polish)  
**Part**: Shared  
**Traceability**: US-1, US-2, US-3, US-4 (all acceptance criteria)  
**Dependencies**: T019, T020 (integration complete), T016, T017 (tests exist)  
**Description**: Write final integration test validating all 44 acceptance criteria (21 Part 1 + 23 Part 2 from spec)

**What to create**:
- File: `/src/components/__tests__/SponsorFeature.final.test.ts`
- Test suite: Final Integration & All Acceptance Criteria (21 Part 1 + 23 Part 2 scenarios)
- **Part 1 Carousel Tests (21)**:
  - Carousel display & responsiveness (4)
  - Carousel navigation & interaction (4)
  - Sponsor logo interaction & accessibility (5)
  - CTA card display & interaction (4)
  - Image loading & fallback (2)
  - Edge cases (2)

- **Part 2 Grid Tests (23)**:
  - Grid layout & sponsor display (4)
  - Sponsor logo interaction & accessibility (8)
  - CTA slot display & interaction (5)
  - Image loading & fallback (2)
  - Grid consistency & spacing (3)
  - Edge cases (1)

**Run all tests**:
```bash
npm test -- SponsorFeature.final.test.ts
npm test -- SponsorCarousel
npm run build
npm run lint
```

**Test Status**: All tests MUST PASS before merge

---

### T025 Code cleanup and final quality assurance

**Window**: 4 (Integration & Polish)  
**Part**: Shared  
**Traceability**: All (quality)  
**Dependencies**: T024 (tests complete)  
**Description**: Clean up code, ensure consistent style, verify no warnings

**What to do**:
- Review all files created in Windows 1-3:
  - `/src/data/sponsors.json`
  - `/src/components/SponsorCarousel.astro`
  - `/src/components/SponsorCard.astro`
  - `/src/components/SponsorCTACard.astro`
  - `/src/components/__tests__/*.test.ts`
  - `/src/pages/index.astro` (modified)
  - `/src/pages/get-involved.astro` (modified)
  - Documentation files
- Remove debug logs and comments
- Ensure consistent naming (camelCase, descriptive)
- Ensure consistent formatting
- Run linter and fix warnings:
  ```bash
  npm run lint --fix
  npm run format
  ```
- Run full test suite:
  ```bash
  npm test
  npm run build
  ```

**Test**: All tests pass, no warnings
```bash
npm test
npm run lint
npm run build
# Expected: 0 errors, 0 warnings
```

---

[WINDOW_CHECKPOINT_4: Feature Complete & Ready for Merge]

**Before Merge to main**:
- [ ] T019: SponsorCarousel renders on home page without errors
- [ ] T020: Sponsor logo in get-involved grid slot 1, slots 2-6 unchanged
- [ ] T021: data-model.md complete and accurate
- [ ] T022: sponsor-data-contract.md complete and accurate
- [ ] T023: quickstart.md complete with manual test guide
- [ ] T024: Final integration test PASSES (all 44 AC)
- [ ] T025: Code cleanup complete, no warnings
- [ ] All 44 acceptance criteria PASSING (21 Part 1 + 23 Part 2)
- [ ] Code coverage >85%
- [ ] No console errors or warnings
- [ ] npm test — all tests PASS
- [ ] npm run build — succeeds with no errors
- [ ] npm run lint — no warnings
- [ ] Documentation complete and accurate
- [ ] Ready for PR review and merge to main

**Feature Status**: ✅ **COMPLETE** (Dual-Scope: Part 1 Carousel + Part 2 Grid)

---

## Summary

**Scope**: Dual-scope implementation (Part 1 + Part 2)  
**Total Execution Windows**: 4  
**Total Tasks**: 25  
**Estimated Duration**: 33-39 hours total

| Window | Focus | Tasks | Duration | Part Coverage |
|--------|-------|-------|----------|---|
| Window 1 | Shared Foundation | 5 | 4-6 hrs | Phase 0 (setup) |
| Window 2 | Part 1 Layout & Images | 7 | 8-10 hrs | Phases 2-3 (carousel structure, images) |
| Window 3 | Part 1 Links & Accessibility | 6 | 8-10 hrs | Phases 4-5 (links, keyboard, WCAG) |
| Window 4 | Integration & Documentation | 7 | 6-8 hrs | Phases 6-8 (home page + grid integration + docs) |
| **Total** | **Dual-Scope Feature** | **25** | **26-34 hrs** | **33-39 hrs with planning/review** |

**Token Budget**: ~280k total (~60-80k per window)

**Part Breakdown**:
- **Part 1 (Home Carousel)**: Windows 2-3 + Window 4 integration = 28-32 hours ✅
- **Part 2 (Get-Involved Grid)**: Window 4 integration = 5-7 hours ✅ (much simpler, reuses Part 1 components)

---

## Key Distinctions: Part 1 vs Part 2

### Part 1: Home Page Carousel (Primary Feature)
- **Complexity**: High (full carousel with scroll, navigation, optimization)
- **Components**: SponsorCarousel (main), SponsorCard, SponsorCTACard (reused)
- **Windows**: 1 (setup), 2 (layout/images), 3 (links/accessibility), 4 (integration)
- **Testing**: Comprehensive (image loading, responsive design, accessibility)
- **Effort**: 28-32 hours

### Part 2: Get-Involved Grid (Secondary Feature)
- **Complexity**: Very low (add sponsor logo to existing slot 1)
- **Components**: Reuses SponsorCard from Part 1 (no new components)
- **Window**: 4 (simple integration)
- **Testing**: Basic integration tests (slot 1 renders, slots 2-6 unchanged)
- **Effort**: 5-7 hours (mostly covered in Part 1 Window 2-3 image/link work)

---

## Execution Guidelines

### Rule 1: Window Independence
- Each window starts fresh with only state.md carrying forward
- No conversation history carries between windows
- Checkpoint validation gates progression

### Rule 2: Test-First Discipline
- Tests written FIRST (before implementation)
- Tests must FAIL initially, PASS after implementation
- All tests in window must PASS before checkpoint

### Rule 3: Checkpoint Validation
- Each window has explicit checkpoint validation
- Checkpoint MUST PASS before next window starts
- If checkpoint fails, debug/fix within window (don't skip ahead)

### Rule 4: Traceability
- Every task maps to spec (FR-C-XXX or FR-G-XXX, AC-XXX, US-X)
- Every acceptance criterion has at least one test
- No orphaned tasks

### Rule 5: Parallel Opportunities [P]
- Tasks marked [P] can run in parallel IF they touch different files
- T001-T004: All parallel (different files)
- T006-T008: Sequential (same file, SponsorCarousel)
- T011-T012: Parallel (different test files)

### Rule 6: Code Quality
- No debug logs or comments in final code
- Consistent naming and formatting
- Linter passes, no TypeScript errors
- >85% code coverage

---

## Handoff Between Windows

### Window 1 → Window 2
**Deliverable**: sponsors.json (data), SponsorCard, SponsorCTACard, SponsorCarousel (skeleton with threshold logic)  
**Accept When**: All T001-T005 tests PASS, no TypeScript errors

### Window 2 → Window 3
**Deliverable**: Carousel container, responsive cards, Astro Image integration, image error fallback  
**Accept When**: All T006-T012 tests PASS, carousel scrolls horizontally, images display correctly

### Window 3 → Window 4
**Deliverable**: Sponsor links, CTA card link, static button logic, keyboard navigation, accessibility  
**Accept When**: All T013-T018 tests PASS, carousel fully interactive and WCAG compliant

### Window 4 → Merge
**Deliverable**: Home page integration (Part 1), grid integration (Part 2), documentation, final validation  
**Accept When**: All T024 final integration tests PASS, documentation complete, ready for PR

---

## Notes for Implementation Agent

1. **Dual-Scope Strategy**: Part 1 (carousel) is primary and complex. Part 2 (grid) is secondary and simple, reusing Part 1 components.

2. **Shared Components**: SponsorCard used by both carousel (Part 1) and grid slot 1 (Part 2). SponsorCTACard only in carousel. sponsors.json shared.

3. **Test-First in Every Window**: Tests written BEFORE implementation. Each window has explicit test files and passing criteria.

4. **Image Optimization Critical**: WebP + PNG fallback, eager/lazy loading, error fallback all required. Test with broken URLs.

5. **Accessibility First**: Build in from Window 1. Alt text, aria-labels, focus management, keyboard nav all required before merge.

6. **Documentation**: Write quickstart.md, data-model.md, and contracts/ files during Window 4. By feature completion, all docs must be accurate and helpful.

7. **No Context Carry-Over**: Each window starts fresh. Only state.md and checkpoint results carry forward. Implement agent will clear context between windows.

---

**Created**: 2026-04-18  
**Status**: Ready for Implementation  
**Next Step**: Begin Window 1 execution with T001-T005
