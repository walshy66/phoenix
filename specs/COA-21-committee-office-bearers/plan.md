# Implementation Plan: Committee Office Bearers

**Branch**: COA-21-committee-office-bearers | **Date**: 2026-04-08 | **Spec**: [spec.md](spec.md)

---

## Summary

Add a new "Committee Office Bearers" section to the contact page displaying three office bearers (Cam - President, Kylie - Secretary, Ainsley - Treasurer) with their photos, names, and titles. Section renders below existing contact cards in a responsive grid (3 columns desktop, 2 tablet, 1 mobile), uses circular image display, and reuses `.card-hover` styling for consistency. **Simplified scope: Static HTML inline in contact.astro with hardcoded office bearer data (no separate JSON file for MVP).**

---

## Technical Context

**Framework & Language**:
- Astro 4.x (static site generation)
- Node.js 20+ runtime
- No JavaScript bundling required (server-rendered HTML)

**Styling & Layout**:
- Tailwind CSS (v3+) with custom brand color extensions
- Responsive breakpoints: mobile (<768px), tablet (768px–1023px), desktop (≥1024px)
- Existing `.card-hover` CSS class for interactive effects

**Data Management**:
- JSON data file (`src/data/office-bearers.json`) imported at build time
- No API calls or client-side loading
- Static rendering during Astro build process

**Image Handling**:
- Public directory for static assets (`/public/images/office-bearers/`)
- Web-optimized JPG format (300px × 300px minimum, square aspect ratio)
- CSS circular crop via `border-radius: 50%` and `object-fit: cover`
- No image component library needed; native `<img>` tags with alt text

**Platform & Scale**:
- Target: Web (desktop, tablet, mobile)
- Performance goal: Static rendering (no runtime cost)
- Accessibility: WCAG 2.1 AA compliance required
- No authentication or backend state involved

---

## Constitution Compliance Check

**Principle I — User Outcomes First**:
✅ **PASS** — User Story 1 has measurable outcome: members can identify leadership via photos and names. Success Criteria SC-002, SC-003, SC-004 verify display and interaction. Acceptance criteria test independently for each user story.

**Principle II — Test-First Discipline**:
✅ **PASS** — Testing strategy covers unit (JSON validation), visual regression (grid layout at breakpoints), integration (page rendering), accessibility (keyboard navigation, screen reader), and responsive behavior. All acceptance criteria are testable and observable before implementation.

**Principle III — Backend Authority & Invariants**:
✅ **PASS** — No backend changes required. Data is static JSON (immutable at build time). No server state, no client inference, no identity validation. If future versions add admin UI or API, backend will be authoritative.

**Principle IV — Error Semantics & Observability**:
✅ **PASS** — Error handling is graceful: missing JSON file skips section silently, missing images show alt text without layout breakage (NFR-003). No need for structured error responses; errors are build-time or silent fallbacks.

**Principle V — AppShell Integrity**:
✅ **PASS** — Feature integrates within existing `contact.astro` page that renders via `BaseLayout`. No custom navigation or shell modifications. Consistent spacing, padding, and section structure maintained.

**Principle VI — Accessibility First**:
✅ **PASS** — NFR-001 explicitly covers WCAG 2.1 AA: descriptive alt text, keyboard focusable cards, visible focus indicators, screen reader announcements. Circular image cropping via CSS does not impact accessibility.

**Principle VII — Immutable Data Flow**:
✅ **PASS** — Data flows unidirectionally: JSON file → Astro import → static HTML rendering. No mutations, no client-side state changes, no re-renders. Office bearer information is read-only from admin perspective (until future admin feature).

**Principle VIII — Dependency Hygiene**:
✅ **PASS** — No new dependencies added. Uses only Astro and Tailwind (already in project). JSON parsing is native. No external libraries or APIs.

**Principle IX — Cross-Feature Consistency**:
✅ **PASS** — Follows existing patterns: `.card-hover` class reused, Tailwind utility classes match contact cards, semantic HTML structure consistent, responsive breakpoints align with existing layouts.

**Constitutional Violations**: None identified. Feature is architecturally sound and aligns with all nine principles.

---

## Project Structure

```
phoenix/
├── src/
│   ├── data/
│   │   └── office-bearers.json              [NEW] Office bearer data file
│   ├── pages/
│   │   └── contact.astro                    [MODIFIED] Add office bearers section
│   ├── styles/
│   │   └── global.css                       [NO CHANGE] Reuse .card-hover
│   └── layouts/
│       └── BaseLayout.astro                 [NO CHANGE]
├── public/
│   └── images/
│       └── office-bearers/                  [NEW] Directory for photos
│           ├── cam.jpg                      [NEW] President photo
│           ├── kylie.jpg                    [NEW] Secretary photo
│           └── ainsley.jpg                  [NEW] Treasurer photo
└── specs/
    └── COA-21-committee-office-bearers/
        ├── spec.md                          [EXISTING]
        ├── plan.md                          [THIS FILE]
        └── tasks.md                         [TO BE CREATED]
```

---

## Implementation Approach

**Scope**: Add office bearers section directly to contact.astro (no separate data file for MVP)

**Tasks**:
1. Extract 3 images from Linear (Cam.png, Kylie.png, Ainsley.png)
2. Optimize and save as JPG to `/public/images/office-bearers/` (cam.jpg, kylie.jpg, ainsley.jpg)
3. Add office bearers section to contact.astro after existing contact cards
4. Render responsive grid (3-col desktop, 2-col tablet, 1-col mobile) with circular photos
5. Apply `.card-hover` styling for visual consistency
6. Verify responsiveness and accessibility

**Deliverables**:
- Updated contact.astro with office bearers section
- Three optimized JPG images in `/public/images/office-bearers/`
- Working responsive grid across all breakpoints
- WCAG 2.1 AA accessible (alt text, keyboard nav, semantic HTML)

**Estimated Time**: 2-3 hours (image extraction + optimization + implementation + testing)
**Estimated Complexity**: Low (static HTML, no dependencies, reuses existing patterns)

---

## File Changes Summary

| File | Status | Change Type | Description |
|------|--------|-------------|-------------|
| `src/data/office-bearers.json` | NEW | Data | Office bearer records (Cam, Kylie, Ainsley) |
| `src/pages/contact.astro` | MODIFY | Feature | Add office bearers section import and rendering |
| `public/images/office-bearers/cam.jpg` | NEW | Asset | President photo (300×300px JPG) |
| `public/images/office-bearers/kylie.jpg` | NEW | Asset | Secretary photo (300×300px JPG) |
| `public/images/office-bearers/ainsley.jpg` | NEW | Asset | Treasurer photo (300×300px JPG) |
| `specs/COA-21-committee-office-bearers/tasks.md` | NEW | Documentation | Atomic task breakdown for implementation |

---

## Responsive Design Strategy

### Breakpoint Architecture

**Mobile-First Approach**:
- Base: 1-column layout (`grid-cols-1`)
- Progressive enhancement: add columns at larger breakpoints

**Tailwind Breakpoints Used**:
- `sm:` (≥640px) — Intermediate breakpoint
- `lg:` (≥1024px) — Desktop breakpoint
- Custom tablet breakpoint (768px–1023px) managed via Tailwind `@media` or grid-gap adjustments

**Grid Configuration**:

| Device | Breakpoint | Columns | Gap | Width |
|--------|-----------|---------|-----|-------|
| Mobile | < 768px | 1 | 16px | Full – 2× padding (16px–24px) |
| Tablet | 768px–1023px | 2 | 20px | Full – padding within max-w-7xl |
| Desktop | ≥ 1024px | 3 | 24px | max-w-7xl (1344px) |

**Implementation**: Use Tailwind's responsive prefixes:
```astro
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
```

Note: Adjust `md:` breakpoint (768px default in Tailwind) via inline styles or config if needed for exact tablet breakpoint.

### Viewport Testing

**Test Cases**:
1. Desktop (1440px, 1920px) — 3-column layout, full gap spacing
2. Tablet (768px, 1024px) — 2-column layout, adjusted gap
3. Mobile (375px, 480px) — 1-column layout, full-width cards with side padding
4. Edge Cases (320px, very large 4K) — Verify usability, no horizontal scroll

### Text Readability

- Minimum font size: 14px (title) ✓ Meets WCAG AA
- Responsive font sizes: Optional `text-base` → `sm:text-lg` progression
- Line height: Default system-ui line height sufficient
- Padding: Consistent 24px padding ensures text doesn't touch edges

---

## Accessibility Strategy

### WCAG 2.1 AA Compliance

**1. Perceivable**:
- **Visual Alt Text**: Every `<img>` includes descriptive alt text in format `"{Name}, {Title}"` (e.g., "Cam, President")
- **Color Contrast**: Text colors meet AA standards:
  - Name (text-brand-black `#111111` on white background) → High contrast ✓
  - Title (text-gray-500 `#6B7280` on white background) → AA compliant ✓
  - Hover shadow uses purple with transparency (visual cue, not color-dependent) ✓
- **Image Cropping**: Circular crop (CSS `border-radius: 50%`, `object-fit: cover`) does not impact alt text rendering or accessibility

**2. Operable**:
- **Keyboard Navigation**: Cards use semantic `<article>` tags; focus naturally flows via Tab ✓
- **Focus Indicators**: Existing `.card-hover` includes `transition` effect; browsers default focus ring visible (or add custom `:focus-visible` if needed)
- **Focus Order**: Logical left-to-right, top-to-bottom grid flow ✓
- **No Keyboard Traps**: Cards are not interactive (no links/buttons), so Tab passes through naturally ✓

**3. Understandable**:
- **Clear Labels**: Section heading (if added) and card layout clearly indicate "office bearers"
- **Consistent Design**: Matches existing contact cards, users understand pattern immediately
- **Language**: Simple English, no jargon; names and titles are straightforward

**4. Robust**:
- **Semantic HTML**: Uses `<section>`, `<article>`, `<img>` with alt text ✓
- **Screen Reader Support**:
  - Section heading (e.g., `<h2>Our Leadership</h2>`) announced
  - Each `<article>` represents a single office bearer
  - `<img>` alt text read aloud (e.g., "Cam, President")
  - Name and title text directly under image
- **ARIA Labels** (if needed): Optional `role="region"` on section or `aria-label="Committee office bearers"` for additional context

### Testing Plan

**Keyboard Navigation**:
1. Open contact page in browser
2. Tab from top of page to office bearers section
3. Verify focus ring visible on each card
4. Verify reading order matches visual layout
5. Tab past section to footer

**Screen Reader Testing**:
1. Use NVDA (Windows) or JAWS for testing
2. Verify section announces clearly (heading + cards)
3. Verify alt text read correctly
4. Check reading order for names and titles

**Automated Audits**:
1. Run axe DevTools on contact page
2. Run Lighthouse accessibility audit
3. Check for color contrast issues via WAVE
4. Verify no accessibility regressions from existing page score

---

## Image Handling Strategy

### Image Specifications

**Source Requirements**:
- Format: JPG (recommended) or PNG
- Minimum size: 300px × 300px (2× display size for retina)
- Aspect ratio: Square (1:1) — critical for circular crop
- Color space: sRGB
- Maximum file size: 30KB per image (compression target)

**Optimization Process**:
1. **Obtain** photos (from Linear, email, or provided asset)
2. **Crop** to square (1:1 aspect ratio) if needed
3. **Resize** to 300px × 300px
4. **Compress** using:
   - ImageMagick: `magick input.png -resize 300x300 -quality 85 output.jpg`
   - Or web tools: TinyJPG, Squoosh
5. **Validate** file size < 30KB
6. **Export** as JPG (progressive encoding for faster perceived load)

### Asset Storage

**Directory Structure**:
```
public/images/office-bearers/
├── cam.jpg           (President)
├── kylie.jpg         (Secretary)
└── ainsley.jpg       (Treasurer)
```

**File Naming Convention**:
- Lowercase
- Dash-separated (e.g., `kylie.jpg` not `Kylie.jpg` or `kylie-secretary.jpg`)
- Match `name` field in JSON for consistency

### CSS Circular Crop

**Implementation**:
```css
img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center;
}
```

**Breakdown**:
- `width/height: 150px` — Fixed size matching spec
- `border-radius: 50%` — Circle shape
- `object-fit: cover` — Maintain aspect ratio, fill container (no distortion)
- `object-position: center` — Center crop (prevents face cutoff if possible)

### Image Loading & Fallbacks

**Loading Behavior**:
- Images load with default browser lazy-loading (no `loading="lazy"` needed for above-fold)
- If image fails to load: browser displays alt text and broken image icon
- Card layout remains intact (fixed dimensions)

**Graceful Degradation**:
- If image file missing: alt text visible, no layout break
- If image dimensions wrong: `object-fit: cover` maintains aspect
- If image format unsupported: fallback icon/text shown

### Storage & Version Control

**Public Directory Decision**:
- Images stored in `/public/images/office-bearers/` (committed to Git)
- Astro static build includes these in output
- No CDN needed for MVP (can be added later)

**Build-Time Processing**:
- Images are static assets, not processed by Astro image plugin (none required for JPG)
- No runtime transformation needed

---

## Testing Strategy

### Unit Testing (Data Validation)

**Test File**: `office-bearers.json` validation script (optional, can be manual)

**Tests**:
1. JSON syntax valid (parseable)
2. Array contains exactly 3 office bearers
3. Each entry has required fields: `id`, `name`, `title`, `image`
4. `id` values are unique
5. `image` paths exist and are accessible
6. No missing or null values

**Implementation**: Simple Node.js script or manual verification before commit

---

### Visual Regression Testing

**Baseline**: Screenshot office bearers section at key breakpoints before feature merge

**Test Cases**:
1. **Desktop (1440px)**: 3 cards in single row, even spacing
2. **Tablet (768px)**: 2 cards in first row, 1 in second row
3. **Mobile (375px)**: Single column, full-width cards
4. **Hover**: Card lifts 4px, shadow appears (mouse over card)
5. **Circular Images**: Photos display cropped as circles, no distortion

**Tools**: 
- Manual visual testing (browser DevTools)
- Optional: Playwright or Chromatic for automated screenshot comparison

**Regression Check**: Compare new contact page screenshots to baseline; no unintended layout shifts

---

### Integration Testing

**Scope**: Contact page renders office bearers section correctly

**Test Cases**:
1. Contact page loads without errors
2. Office bearers section exists (DOM query for `<section>` with office bearers)
3. Three cards render (DOM count: 3 `<article>` elements)
4. Each card displays:
   - Image (`<img>` with `src` and alt)
   - Name text
   - Title text
5. Grid classes applied correctly (`grid-cols-1`, `lg:grid-cols-3`, etc.)
6. `.card-hover` class present on cards

**Tools**: 
- Astro build + manual inspection
- Optional: Vitest + Testing Library for automated checks

---

### Accessibility Testing

**Keyboard Navigation**:
1. Use Tab key to navigate through page
2. Reach office bearers cards
3. Verify visible focus ring on each card
4. Tab through all 3 cards, then out to next section
5. Reverse Tab (Shift+Tab) works correctly

**Screen Reader Testing** (NVDA, JAWS, VoiceOver):
1. Open contact page in screen reader
2. Navigate to office bearers section
3. Verify announced: section heading (if present) and role
4. Read each card:
   - Image alt text announced: "{Name}, {Title}"
   - Name and title text read
5. Verify reading order logical

**Automated Audits**:
1. **axe DevTools**: Run accessibility scan on contact page
   - Target: 0 violations (or document acceptable exclusions)
2. **Lighthouse**: Run accessibility audit
   - Target: 100 score (or document any regressed items)
3. **WAVE**: Check for color contrast and structural issues

**Acceptance Criteria**:
- No WCAG 2.1 AA violations reported
- Keyboard navigation smooth and predictable
- Screen reader announces all content clearly
- No accessibility regression from existing page

---

### Responsive Testing

**Test Scenarios**:

| Viewport | Device | Test |
|----------|--------|------|
| 320px | Small mobile | Layout usable, no horizontal scroll |
| 375px | Standard mobile | 1-column grid, readable text |
| 480px | Large mobile | Still 1 column, cards fit |
| 768px | Tablet (boundary) | Transition to 2 columns |
| 1024px | Tablet/Desktop (boundary) | Transition to 3 columns |
| 1440px | Desktop | Full 3-column grid, centered |
| 1920px | Large desktop | max-w-7xl constrains width, centered |

**Tools**:
- Chrome DevTools Device Emulation
- Safari Responsive Design Mode
- Firefox Responsive Design Mode

**Checks**:
- No horizontal scrolling at any breakpoint
- Cards reflow smoothly without layout jumps
- Text remains readable (≥14px)
- Images display correctly (circular crop maintained)

---

### Image Loading Testing

**Test Cases**:
1. All images load successfully (network tab: 200 OK)
2. Images display as 150px circles (inspect element)
3. Circular crop visible (no corners showing)
4. Object-fit: cover maintains aspect ratio

**Edge Cases**:
1. **Missing Image File**:
   - Delete one JPG from public directory
   - Rebuild site
   - Verify card still renders with alt text visible
   - Layout unchanged

2. **Corrupted Image**:
   - Replace image with corrupted file
   - Page loads, broken image icon shows
   - Alt text visible
   - Card layout intact

3. **Wrong Aspect Ratio**:
   - Replace square image with portrait (e.g., 300×600)
   - `object-fit: cover` crops to square
   - Verify centered crop (face not cut off if possible)

---

## Rollout Plan

### Pre-Deployment Checklist

- [ ] All tests passing (unit, visual, integration, accessibility, responsive)
- [ ] Code reviewed for quality and pattern consistency
- [ ] Contact page renders without errors
- [ ] Office bearers section displays correctly at all breakpoints
- [ ] Alt text for all images verified
- [ ] Accessibility audit passed (0 violations or documented exclusions)
- [ ] Images optimized (<30KB each)
- [ ] JSON data valid and complete

### Staging Review

1. **Deploy to staging environment** (if available)
2. **Cross-browser testing**:
   - Chrome (latest)
   - Firefox (latest)
   - Safari (latest, if available)
   - Edge (latest)
3. **Device testing**:
   - iPhone 12/14 (iOS)
   - Android phone (Chrome)
   - iPad (Safari)
4. **Accessibility second pass**:
   - Screen reader test on staging (NVDA/JAWS)
   - Keyboard navigation verification
5. **Performance check**:
   - Lighthouse audit on staging
   - Image load time check
   - Total page size check

### Code Review Gate

**Reviewer Checklist**:
- [ ] Spec compliance: all FR and NFR requirements met
- [ ] Constitution alignment: all 9 principles respected
- [ ] Code quality: naming, comments, no dead code
- [ ] Pattern consistency: matches existing contact cards
- [ ] Accessibility: alt text, focus states, semantic HTML
- [ ] Responsive: breakpoints correct, no layout shifts
- [ ] Performance: no unnecessary dependencies, images optimized
- [ ] Documentation: admin guide updated (how to change office bearers)

### Merge Process

1. **Reviewer approves** pull request
2. **Squash commits** (if multiple) into single logical commit
3. **Merge to main** with clear commit message:
   ```
   feat(COA-21): Add Committee Office Bearers section to contact page
   
   - Display 3 office bearers (President, Secretary, Treasurer) with photos
   - Responsive grid: 3 cols (desktop), 2 cols (tablet), 1 col (mobile)
   - Load data from office-bearers.json
   - WCAG 2.1 AA accessible with keyboard nav and screen reader support
   - Reuse .card-hover styling for visual consistency
   ```
4. **Verify production build** passes
5. **Monitor for issues** post-merge (error logs, accessibility audit)

### Post-Deployment

1. **Visual verification** on production
2. **Accessibility audit** re-run (Lighthouse)
3. **No regression** from existing contact page
4. **Update admin guide** in team documentation
5. **Announce** to team/stakeholders

---

## Research & Validation

### Questions Addressed in Spec

**Q1: Section Heading?**
- Spec recommends optional heading (e.g., "Our Leadership")
- Decision for Phase 3: Add heading for clarity; use `<h2>` with gold underline or just text
- User impact: Improves scanability and SEO

**Q2: Gold Accent Bar on Cards?**
- Spec notes optional enhancement
- Decision: Use existing `.card-hover` without additional border; keep minimal
- Rationale: Existing contact cards don't have accent bar; consistency matters

**Q3: Image Aspect Ratio?**
- Spec requires square (1:1)
- Decision: Enforce via image specs and `object-fit: cover` CSS
- Fallback: Circular crop centers image, preventing face cutoff

**Q4: Interactive Cards (Clickable)?**
- Spec clarifies no interaction for P1
- Decision: Presentational `<article>` elements, not `<button>` or `<a>`
- Future: Can add email links or social profiles in Phase 2+

### Items Requiring External Input

**1. Photo Assets**:
- Status: Awaiting office bearer photos
- Requirement: Square JPG, 300px × 300px minimum
- Responsibility: Project manager / admin to source photos
- Timeline: Critical path item; needed before Phase 1

**2. Office Bearer Confirmation**:
- Names: Cam (President), Kylie (Secretary), Ainsley (Treasurer)
- Status: Confirmed in spec
- Action: Verify names match official club records before commit

**3. Email Address Alignment**:
- Contact page lists `president@bendigophoenix.org.au` and `treasurer@bendigophoenix.org.au`
- Decision: No change to emails in this feature
- Future: Could link office bearer cards to email addresses (P2)

---

## Risk Assessment

### Technical Risks

**Risk 1: Image Sizing & Aspect Ratio**
- **Likelihood**: Medium
- **Impact**: Images distorted if not square; circular crop looks odd
- **Mitigation**:
  - Enforce image spec (300×300px square JPG)
  - Test with non-square image to verify fallback (object-fit: cover)
  - Document image requirements for admins
- **Contingency**: Add placeholder image if original unavailable

**Risk 2: JSON Import Errors**
- **Likelihood**: Low
- **Impact**: Page fails to build if JSON malformed
- **Mitigation**:
  - Validate JSON before commit (use online validator)
  - Include error handling in Astro (conditional render)
  - Add fallback empty state if data unavailable
- **Contingency**: Ship with hardcoded fallback if data file issues

**Risk 3: Responsive Layout Breakpoint Mismatch**
- **Likelihood**: Low
- **Impact**: Grid reflows at wrong breakpoint; Tailwind defaults may not match spec
- **Mitigation**:
  - Test all breakpoints (320px, 375px, 768px, 1024px, 1440px)
  - Verify grid columns transition correctly
  - Use Tailwind's `md:` (640px) and `lg:` (1024px) prefixes
  - Document any custom breakpoint overrides
- **Contingency**: Add custom CSS if Tailwind defaults don't align

**Risk 4: Accessibility Focus Indicators**
- **Likelihood**: Low
- **Impact**: Focus ring invisible or low contrast; keyboard navigation feels broken
- **Mitigation**:
  - Test keyboard Tab navigation on contact page
  - Use browser default focus ring (typically sufficient)
  - If needed, add custom `:focus-visible` with brand colors
  - Verify focus ring contrast meets WCAG AA
- **Contingency**: Add explicit CSS focus state if default insufficient

---

### Project/Process Risks

**Risk 5: Scope Creep (Admin UI)**
- **Likelihood**: Medium
- **Impact**: Feature delayed by admin UI requests; MVP slips
- **Mitigation**:
  - Clearly scope P1 as "static JSON data only"
  - Admin UI (form to edit office bearers) explicitly P2+
  - Document in spec and plan: admin edits JSON directly for MVP
- **Contingency**: Ship P1 without admin UI; add in follow-up sprint

**Risk 6: Photo Asset Delays**
- **Likelihood**: High
- **Impact**: Blocked at Phase 1; cannot proceed without images
- **Mitigation**:
  - Confirm photo availability with stakeholders early
  - Request photos from Linear or email
  - Plan image optimization in parallel
  - Have placeholder/fallback option ready
- **Contingency**: Use placeholder images for development; swap real photos on day of launch

**Risk 7: Browser/Device Compatibility**
- **Likelihood**: Low (modern browsers)
- **Impact**: Layout broken on older browsers; circular crop not supported
- **Mitigation**:
  - CSS features used (`border-radius`, `object-fit`) widely supported (IE11+ / all modern)
  - Test in Chrome, Firefox, Safari, Edge
  - Use feature queries if needed (`@supports`)
  - Document minimum browser version (e.g., IE11 unsupported but not major issue)
- **Contingency**: Fallback to square crop (remove `border-radius: 50%`) if circular unsupported

---

### Schedule Risks

**Risk 8: Time Underestimation**
- **Likelihood**: Medium
- **Impact**: Phase 1–2 bleed into Phase 3; testing time squeezed
- **Mitigation**:
  - Phase 1 (data): 1–2 hours
  - Phase 2 (rendering): 2–3 hours
  - Phase 3 (polish): 1–2 hours
  - Phase 4 (testing): 2–3 hours
  - **Total**: 6–10 hours (conservative estimate)
  - Build in 20% buffer for unknowns
- **Contingency**: Extend Phase 3 polish (defer non-critical styling) if time tight; Phase 4 testing is non-negotiable

**Risk 9: Accessibility Audit Failures**
- **Likelihood**: Low
- **Impact**: Blockers found in Phase 4; requires rework
- **Mitigation**:
  - Follow WCAG guidelines upfront (alt text, semantic HTML)
  - Test keyboard nav during Phase 2 (not deferred to Phase 4)
  - Use automated tools early (axe, Lighthouse) to catch issues
  - Budget Phase 4 for fixes if audit finds issues
- **Contingency**: Prioritize high-impact violations; document exclusions for low-impact issues

---

## Success Criteria Mapping

| Success Criteria | Owner | Verification | Status |
|---|---|---|---|
| **SC-001**: Office bearers section rendered and visually distinct | Phase 2 | Visual inspection; DOM exists | Pending Phase 2 |
| **SC-002**: Three office bearers display with correct photos, names, titles | Phase 2 | Manual test; visual regression | Pending Phase 2 |
| **SC-003**: Responsive grid adapts at breakpoints | Phase 4 | Device testing (375px, 768px, 1440px) | Pending Phase 4 |
| **SC-004**: Hover card lifts with shadow | Phase 2 | Manual hover test | Pending Phase 2 |
| **SC-005**: Photos load in circular crop | Phase 2 | Visual inspection; element inspect | Pending Phase 2 |
| **SC-006**: Admin updates JSON without touching code | Phase 1 | Data file exists; admin guide written | Pending Phase 1 |
| **SC-007**: Page accessibility score ≥ WCAG 2.1 AA | Phase 4 | Lighthouse audit; axe scan | Pending Phase 4 |
| **SC-008**: Section appears after contact cards | Phase 2 | DOM order inspection | Pending Phase 2 |

---

## Next Steps

1. **Approve Plan**: Review and sign off on technical approach, phases, and risks
2. **Confirm Photo Availability**: Validate Cam, Kylie, Ainsley photos ready or placeholder ready
3. **Create Tasks**: Break Phase 1–5 into atomic tasks in `tasks.md`
4. **Begin Phase 1**: Create office-bearers.json and prepare images
5. **Weekly Sync**: Track progress against phases; escalate blockers
6. **Merge When Ready**: Follow rollout plan for staging → production

---

## Appendix: Complexity Tracking

### Complexity Assessment

This feature is **low-to-medium complexity**:

**Low Complexity**:
- No backend changes (static JSON)
- No new dependencies (Astro + Tailwind already present)
- Reuses existing `.card-hover` styling
- No state management or client-side logic
- Straightforward Astro templating

**Medium Complexity**:
- Responsive grid (3 breakpoints to manage)
- Image optimization and circular cropping
- Comprehensive testing (accessibility + responsive)
- Potential photo sourcing delays

**Deviations from Simpler Alternatives**: None significant. Feature is architecturally simple and follows established patterns.

**Justification for Approach**:
1. JSON data file over hardcoded: Enables easy admin updates without code
2. Circular crop via CSS: Standard practice; no image processing libraries needed
3. Responsive grid via Tailwind: Proven pattern in Bendigo Phoenix codebase
4. Reuse `.card-hover`: Consistency with existing contact cards

---

## Appendix: Accessibility Specifications

### Alt Text Examples

```json
{
  "id": "president",
  "name": "Cam",
  "title": "President",
  "image": "/images/office-bearers/cam.jpg",
  "altText": "Cam, President"  // Format: {Name}, {Title}
}
```

Rendered as:
```html
<img src="/images/office-bearers/cam.jpg" alt="Cam, President" />
```

### Focus Style (if custom)

```css
.card-hover:focus-visible {
  outline: 3px solid #573F93;
  outline-offset: 2px;
}
```

Or rely on browser default (usually sufficient).

### Semantic HTML Structure

```html
<section aria-label="Committee office bearers">
  <h2>Our Leadership</h2>
  <div class="grid ...">
    <article>
      <img src="..." alt="Cam, President" />
      <h3>Cam</h3>
      <p>President</p>
    </article>
    <!-- Repeat for Kylie, Ainsley -->
  </div>
</section>
```

---

## Appendix: Admin Maintenance Guide

### Updating Office Bearer Information

**To change a name, title, or photo**:

1. Open `src/data/office-bearers.json`
2. Edit the relevant entry:
   ```json
   {
     "id": "president",
     "name": "NEW_NAME",              // Change here
     "title": "NEW_TITLE",            // Change here
     "image": "/images/office-bearers/NEW_IMAGE.jpg"  // Change here
   }
   ```
3. If updating photo:
   - Replace JPG in `/public/images/office-bearers/`
   - Optimize to 300×300px, <30KB
   - Update `image` path in JSON
4. Rebuild site: `npm run build` (or deploy normally)
5. Verify changes on contact page

**No code changes needed.** JSON edit alone is sufficient.

---

**Plan Complete** | Ready for Task Breakdown and Implementation Phase

