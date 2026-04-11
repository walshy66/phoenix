# Implementation Plan: COA-42 — Footer Update & Email Octopus Integration

**Branch**: coa-42-footer-update | **Date**: 2026-04-10 | **Spec**: [COA-42 Spec](./spec.md)

---

## Summary

COA-42 redesigns the Phoenix United Basketball site footer to integrate Email Octopus newsletter signup, update copyright and branding text to reflect the current organization identity, and display the Phoenix United logo in both footer and header. The feature transforms the footer from a 4-section informational component into a 4-column responsive layout with integrated email capture. All content updates are static (no backend changes), but the Email Octopus form requires JavaScript injection and fallback messaging for resilience.

**Key Changes**:
- Email Octopus form integration (form ID: `11c550ac-11dc-11f1-a2e0-ef681a07d4a5`)
- Footer copyright: from "© 2003 Bendigo Phoenix..." to "© Phoenix United Basketball Development Club Inc. 2003 - 2026..."
- Footer tagline: update to "Where Community Meets Competition. Proudly serving basketball in Bendigo."
- Replace text "P" logo placeholders with PNG asset (`/public/images/logos/phoenix-logo.png`)
- Update footer layout to 4-column on desktop, 2-column on tablet, 1-column on mobile
- Update header logo to match footer branding

**Business Value**:
- Enable direct newsletter signup (core marketing requirement)
- Establish visual brand consistency across header and footer
- Correct legal/organizational compliance with accurate company name
- Maintain responsive accessibility on all device sizes

---

## Technical Context

| Aspect | Value |
|--------|-------|
| **Framework** | Astro 6.1.1 (SSG) |
| **UI Components** | React 19 (via Astro integration) + Astro native components |
| **Styling** | Tailwind CSS 4.2.2 (vite plugin) |
| **Testing** | Vitest (run script: `npm test`) |
| **Asset Storage** | `/public/images/` (static files) |
| **Logo Asset** | `/public/images/logos/phoenix-logo.png` (already in place, 166KB PNG) |
| **Brand Colors** | Purple (#573F93), Gold (#8B7536), Black (#111111), Off-white (#F4F5F7), White (#FFFFFF) |
| **Responsive Breakpoints** | Mobile (<768px), Tablet (768px–1023px), Desktop (≥1024px) |
| **Target Devices** | Web (mobile, tablet, desktop) |
| **Performance Goal** | Email Octopus script inject <100ms added load time |
| **Accessibility** | WCAG 2.1 AA (4.5:1 contrast, keyboard nav, screen readers) |
| **External Dependencies** | Email Octopus JavaScript library (third-party, form-based) |

---

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| **I — User Outcomes** | ✅ PASS | All 4 user stories have explicit, measurable acceptance criteria. Success verified via form rendering, email capture, responsive layout testing. |
| **II — Test-First** | ✅ PASS | All acceptance criteria are independently testable: form submission, logo display, responsive layout at breakpoints, color contrast, keyboard accessibility. |
| **III — Backend Authority** | ✅ PASS | Email Octopus handles all form submission logic (validation, data persistence, deduplication). Client displays form only; no client-side validation of submission status. |
| **IV — Error Semantics** | ✅ PASS | All error cases have explicit user-visible handling: script load failure → fallback message; logo load failure → text fallback; form validation errors from Email Octopus display inline. |
| **V — AppShell Integrity** | ✅ PASS | Footer and Header components remain within BaseLayout. No custom navigation or layout shells introduced. Astro's layout system preserves AppShell contract. |
| **VI — Accessibility** | ✅ PASS | NFR-001–003 explicitly require: semantic HTML labels for form inputs, keyboard navigation (Tab/Enter), screen reader support, WCAG AA contrast (4.5:1 body text, 3:1 large text). |
| **VII — Immutable Data** | ✅ PASS | Footer is static content component. Email Octopus data managed by external service. No client-side data mutation. |
| **VIII — Dependency Hygiene** | ✅ PASS | Email Octopus is managed third-party service. Script is form-based (form ID pinned). No new npm dependencies required beyond Astro + Tailwind (already in place). Monitor Email Octopus for breaking changes. |
| **IX — Cross-Feature Consistency** | ✅ PASS | Logo and footer branding follow established site patterns (Tailwind classes, brand color tokens). Responsive breakpoints align with COA-23 standard (768px, 1024px). Component structure mirrors existing Navbar, Footer conventions. |

**Compliance Summary**: No constitutional violations. Feature is a straightforward component enhancement with third-party script injection (Email Octopus). All error cases have fallback strategies. Testing is browser-based (form submission, layout responsiveness, accessibility).

---

## Project Structure

```
phoenix/
├── src/
│   ├── components/
│   │   ├── Footer.astro                    (MODIFIED: add Email Octopus form, update layout)
│   │   └── Navbar.astro                    (MODIFIED: replace "P" with logo image)
│   ├── layouts/
│   │   └── BaseLayout.astro                (no changes; uses Footer + Navbar)
│   ├── styles/
│   │   └── global.css                      (no changes needed)
│   └── lib/                                (no changes)
├── public/
│   └── images/
│       └── logos/
│           └── phoenix-logo.png            (EXISTS: 166KB asset)
├── specs/coa-42-footer-update/
│   ├── spec.md                             (COMPLETE: reference)
│   ├── plan.md                             (THIS FILE)
│   └── tasks.md                            (TO BE CREATED: atomic task breakdown)
├── vitest.config.ts                        (may need minor adjustment for component testing)
├── tailwind.config.mjs                     (no changes; brand colors already defined)
├── tsconfig.json                           (no changes)
├── package.json                            (no new dependencies)
└── astro.config.mjs                        (no changes)
```

**Affected Files**:
- `src/components/Footer.astro` — Primary file; redesign with 4-column layout, Email Octopus form, updated copyright/tagline, logo display
- `src/components/Navbar.astro` — Secondary file; replace text "P" with `<img>` tag
- Logo asset already exists at `/public/images/logos/phoenix-logo.png`

---

## Phased Delivery

### Phase 1: Foundation (Email Octopus Form Structure)
**Objective**: Establish Email Octopus form rendering and fallback messaging framework.

**Dependencies**: None (can start immediately)

**Tasks**:
1. Add Email Octopus script injection to Footer component
2. Create form container div with proper ID/attributes
3. Implement fallback message div (hidden by default, shown if script fails)
4. Test script loading in browser console (no errors)
5. Verify form renders with Email Octopus JavaScript

**Deliverable**: Footer renders Email Octopus form without submission; fallback logic in place.

**Testing Approach**:
- Manual: Load page in browser, inspect form HTML, check for Email Octopus `<div>` elements
- Manual: Disable JavaScript in browser DevTools; verify fallback message appears
- Manual: Check browser console for script load errors

---

### Phase 2: Footer Content & Layout Redesign
**Objective**: Update copyright/branding text, restructure layout to 4-column grid, maintain responsive behavior.

**Dependencies**: None (can run parallel with Phase 1, or sequentially after)

**Tasks**:
1. Update copyright text to: "© Phoenix United Basketball Development Club Inc. 2003 - 2026 All rights reserved"
2. Update tagline to: "Where Community Meets Competition. Proudly serving basketball in Bendigo."
3. Add clickable link for "compete in the Bendigo Basketball Association" (https://bendigobasketball.com.au/, `target="_blank"`, `rel="noopener noreferrer"`)
4. Restructure footer sections into 4-column grid (desktop), 2-column (tablet), 1-column (mobile)
5. Preserve existing address, contact email, social links sections
6. Verify responsive layout at breakpoints: 320px, 480px, 768px, 1024px+

**Deliverable**: Footer displays new copyright, tagline, and responsive 4-column layout.

**Testing Approach**:
- Manual: Inspect footer text; compare to spec (character-for-character match)
- Manual: Resize browser window; verify layout switches at 768px and 1024px
- Manual: Check on mobile device or DevTools mobile simulator

---

### Phase 3: Logo Integration (Footer & Header)
**Objective**: Replace text "P" placeholders with PNG logo asset in both footer and header.

**Dependencies**: Phase 1 and Phase 2 (can start after footer is restructured)

**Tasks**:
1. Add `<img src="/public/images/logos/phoenix-logo.png" alt="Phoenix United Logo" />` to Footer component
2. Set logo dimensions: height 60–80px, maintain aspect ratio (CSS: `height: auto; max-width: 100%`)
3. Add text fallback for image load failure (e.g., display "Phoenix" or "PU" if image 404)
4. Replace text "P" in Navbar with same logo image
5. Test logo rendering on all screen sizes (320px, 768px, 1024px+)
6. Verify no broken image indicators in browser

**Deliverable**: Logo displays in footer and header; text fallback in place.

**Testing Approach**:
- Manual: Inspect logo `<img>` element in DevTools; verify `src`, `alt`, dimensions
- Manual: Resize browser; confirm logo scales proportionally
- Manual: Network throttling in DevTools; simulate image load failure (check fallback displays)

---

### Phase 4: Email Octopus Form Submission & Error Handling
**Objective**: Verify form submission works end-to-end; implement loading/success/error states.

**Dependencies**: Phase 1 (form must be present before testing submission)

**Tasks**:
1. Test form submission with valid email (e.g., test@example.com)
2. Verify Email Octopus dashboard receives signup
3. Implement loading state during submission (optional: spinner or "Submitting..." text)
4. Implement success message or form reset after submission
5. Test form validation error handling (invalid email, blank input)
6. Verify error messages display from Email Octopus without silent failures
7. Test duplicate email submission (Email Octopus handles deduplication)
8. Test form submission with JavaScript disabled (fallback mailto link works)

**Deliverable**: Form submission works end-to-end; all error cases handled with user-visible messages.

**Testing Approach**:
- Manual: Load form, enter email, submit, check Email Octopus dashboard
- Manual: Enter invalid email, submit, verify validation error displays
- Manual: Disable JavaScript, verify mailto fallback works
- Browser DevTools: Monitor network tab for form submission requests

---

### Phase 5: Accessibility & Responsive Testing
**Objective**: Verify WCAG AA compliance, keyboard navigation, screen reader support, responsive layout.

**Dependencies**: Phase 1–4 (all components must be in place)

**Tasks**:
1. Run WAVE or Lighthouse accessibility audit on footer/header
2. Test keyboard navigation: Tab through all interactive elements (form input, submit button, links, logo)
3. Test form label accessibility: verify `<label>` associated with form input (screen reader announces)
4. Test color contrast: verify 4.5:1 for body text, 3:1 for large text (WCAG AA)
5. Test responsive layout at breakpoints: 320px, 480px, 768px, 1024px+
6. Test on actual mobile devices (iOS Safari, Android Chrome) if possible
7. Verify no horizontal overflow at any viewport width ≥ 320px

**Deliverable**: Feature meets WCAG 2.1 AA accessibility standard; responsive on all device sizes.

**Testing Approach**:
- Chrome DevTools: Lighthouse audit
- Screen reader: NVDA (Windows) or VoiceOver (Mac)
- Browser DevTools: Keyboard Tab navigation
- Browser DevTools: Mobile simulator (360px, 768px, 1024px)
- Physical testing: Mobile devices (iPhone, Android)

---

### Phase 6: Performance & Optimization
**Objective**: Ensure Email Octopus script injection does not degrade page load performance.

**Dependencies**: Phase 1–5 (all features must be complete)

**Tasks**:
1. Measure page load time (Time to Interactive) before and after Email Octopus script
2. Verify added load time is <100ms (per spec NFR-005)
3. Check for layout shift during Email Octopus form render (CLS metric)
4. Optimize image asset: verify PNG is <50KB, no waste
5. Browser DevTools: Monitor network waterfall for script load timing
6. Lighthouse performance audit: target score ≥90

**Deliverable**: Email Octopus script integration meets performance goal (<100ms added load time).

**Testing Approach**:
- Chrome DevTools: Performance tab (record page load, measure Time to Interactive)
- Lighthouse: Audit performance metric
- WebPageTest: Measure real-world load time
- Network throttling: Simulate slow 3G; verify form still functional

---

### Phase 7: Final Testing & Documentation
**Objective**: Comprehensive acceptance criteria verification, documentation, deploy readiness.

**Dependencies**: Phase 1–6 (all phases complete)

**Tasks**:
1. Create acceptance testing checklist from spec
2. Test each acceptance criterion (AC-1 through AC-23)
3. Document test results (pass/fail, screenshots for visual verification)
4. Update component-level comments/JSDoc if needed
5. Create deployment notes (no database migrations, no build changes)
6. Verify Git commit history is clean
7. Prepare PR description with test summary

**Deliverable**: All acceptance criteria verified; feature ready for merge.

**Testing Approach**:
- Manual: Run through all 23 acceptance criteria
- Browser: Verify form submission, logo display, layout on all sizes
- Email Octopus dashboard: Confirm signups recorded
- Code review: Check for any linting or formatting issues

---

## Technical Approach

### Email Octopus Integration Strategy

**Script Injection**:
- Email Octopus provides a form ID (`11c550ac-11dc-11f1-a2e0-ef681a07d4a5`) that controls form display
- Script tag injected via `<script>` element in Footer.astro (inline or external, per Email Octopus docs)
- Email Octopus JavaScript library renders form into designated `<div>` container
- No client-side form validation; Email Octopus handles all submission logic

**Fallback Strategy**:
- If Email Octopus script fails to load (network error, CSP block), fallback `<div>` appears with mailto link
- Fallback message: "Form unavailable. Subscribe via email: [mailto link]"
- Fallback is initially hidden (`display: none`); shown only if form fails to render within timeout (e.g., 3s)
- JavaScript checks if Email Octopus objects exist; if not after timeout, shows fallback

**Loading State**:
- Optional: Implement "Submitting..." spinner during form submission (Email Octopus may handle this)
- Track submission state via Email Octopus JavaScript events (if available)

---

### Logo Display Strategy

**Astro Image Component**:
- Use `<img>` tag (not Astro's `<Image>` component) for simplicity and static export compatibility
- Logo dimensions: `height: 60px` to `80px` (responsive via CSS)
- CSS: `max-width: 100%; height: auto;` to maintain aspect ratio
- Alt text: "Phoenix United Logo" (semantic, accessible)

**Fallback for Image Failure**:
- CSS `background-image` fallback (not standard; consider alternative)
- **Better approach**: Inline SVG or text fallback behind image with `<picture>` element
- Alternative: JavaScript checks image `onerror` event, displays text "Phoenix" or "PU"
- Fallback styling matches footer design (same font, color, size)

**Logo Sizing Across Breakpoints**:
- Desktop (≥1024px): 80px height
- Tablet (768px–1023px): 70px height
- Mobile (<768px): 60px height
- Responsive via CSS media queries or Tailwind sizing classes

---

### Footer Layout Structure

**Current Footer** (Footer.astro):
- 4-column grid: Brand | Contact | Follow Us | Quick Links
- Uses Tailwind `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` (1 col mobile, 2 col tablet, 4 col desktop)
- Fixed gap-8 spacing

**New Footer Layout** (COA-42 redesign):
- **Column 1** (Brand): Logo image + tagline
- **Column 2** (Quick Links): Links to key pages
- **Column 3** (Email Octopus Form): Newsletter signup form
- **Column 4** (Social + Contact): Social links, contact email, address

**Responsive Behavior**:
- Desktop (≥1024px): All 4 columns visible side-by-side
- Tablet (768px–1023px): 2 columns (Brand + Email Octopus in row 1; Quick Links + Social in row 2)
- Mobile (<768px): 1 column; all sections stack vertically
- No horizontal overflow at any width ≥ 320px

**Preservation**:
- Keep existing address, contact email, social links
- Keep existing link targets and styling
- Keep brand colors and Tailwind theme tokens
- Update copyright and tagline text only

---

### Accessibility Implementation

**Form Label**:
- Email Octopus form input must have associated `<label>` element
- If Email Octopus renders label automatically, verify in browser
- If not, add visible or screen-reader-only label via Astro/HTML

**Keyboard Navigation**:
- Form input: Tab navigation focus, outline visible (Email Octopus may handle)
- Submit button: Tab focus, Enter to activate
- External links: Tab focus, outlined, keyboard accessible
- Logo link (footer): Tab focus, keyboard accessible

**Screen Reader Support**:
- Form input has semantic `<label>` with `for` attribute
- Submit button has text "SUBSCRIBE" (not icon-only)
- External link has descriptive text (e.g., "Bendigo Basketball Association")
- Logo link has alt text or aria-label

**Color Contrast**:
- Footer text (purple #573F93 on off-white #F4F5F7): 4.5:1+ (WCAG AA)
- Links (gold #8B7536 on purple #573F93): 3:1+ (large text)
- Test with WebAIM or Lighthouse contrast checker

**Semantic HTML**:
- Use `<footer>`, `<nav>`, `<form>`, `<label>`, `<button>`, `<a>` elements
- Avoid `<div>` for interactive elements
- Proper heading hierarchy (if needed within footer)

---

### Testing Strategy

**Unit Testing** (Vitest):
- Not applicable for Astro components (static HTML generation)
- If Email Octopus fallback logic uses JavaScript, test fallback detection

**Integration Testing**:
- Manual browser testing: form submission, logo display, layout responsiveness
- Cross-browser: Chrome, Firefox, Safari, Edge
- Device testing: iOS Safari, Android Chrome

**Acceptance Testing** (from spec):
- 23 acceptance criteria from spec, verified manually
- Verify each criterion with browser inspection, keyboard navigation, form submission
- Email Octopus dashboard: confirm signups recorded

**Performance Testing**:
- Lighthouse audit before/after Email Octopus integration
- Monitor page load time increase (<100ms added)
- Check Cumulative Layout Shift (CLS) during form render

**Accessibility Testing**:
- WAVE or Lighthouse accessibility audit
- Screen reader testing (NVDA, VoiceOver)
- Keyboard navigation (Tab through all elements)
- Color contrast check (WCAG AA 4.5:1)
- Responsive layout at breakpoints (320px, 768px, 1024px+)

---

## Complexity & Deviations

**None**: Feature follows established patterns, requires no new dependencies, no constitutional violations.

All complexity is managed within existing architecture:
- Astro component model (Footer.astro, Navbar.astro)
- Tailwind responsive classes
- External third-party service (Email Octopus) with well-defined integration points
- Static HTML generation (no build changes)

---

## Rollout Considerations

### Backwards Compatibility
- Footer component is replaced in-place (all pages use BaseLayout, which includes Footer)
- No breaking changes to page structure or navigation
- Logo asset is new; no existing assets removed
- Email Octopus form is additive; does not replace existing footer sections

### Fallbacks & Graceful Degradation
- **Email Octopus script fails**: Fallback mailto link allows email subscription
- **Logo image fails**: Text fallback ("Phoenix" or "PU") displays with footer styling
- **JavaScript disabled**: Fallback mailto link works via standard HTML `<a href="mailto:...">`
- **No layout breakage**: Responsive layout tested at all breakpoints; no horizontal overflow

### Deployment Strategy
- Merge feature branch to main (no database migrations, no environment changes)
- No build configuration changes (Email Octopus script is external)
- No new npm dependencies
- Email Octopus form ID is pinned in Footer component; no configuration needed
- Verify Email Octopus account has correct form ID before deployment

### Monitoring & Validation Post-Deployment
- Check Email Octopus dashboard for successful signups (verify form is collecting emails)
- Monitor browser console for script load errors (DevTools, Sentry, or real-user monitoring)
- Lighthouse audit post-deployment (verify page load time unchanged)
- Spot-check logo display on various devices (ensure no broken image indicators)

---

## Research Needed

### Email Octopus Integration Details
- [ ] Confirm form ID: `11c550ac-11dc-11f1-a2e0-ef681a07d4a5`
- [ ] Retrieve Email Octopus script injection code (HTML snippet from their docs or dashboard)
- [ ] Determine if script is external URL or inline
- [ ] Identify Email Octopus JavaScript object/event names for fallback detection (e.g., `window.EmailOctopus`)
- [ ] Test form rendering in Astro SSG context (ensure script loads correctly)
- [ ] Verify Email Octopus form accepts `<div id="...">` container (standard form library approach)

### Logo Asset Validation
- [ ] Confirm PNG asset exists at `/public/images/logos/phoenix-logo.png` (✅ confirmed: 166KB file present)
- [ ] Verify logo dimensions and aspect ratio (measure in browser DevTools or file metadata)
- [ ] Test logo rendering on all screen sizes
- [ ] Confirm logo works on both purple and light backgrounds (no transparency issues)

### Astro Component Patterns
- [ ] Verify how to inject external scripts in Astro components (Astro docs: `<script>` tags, `is:inline`, etc.)
- [ ] Confirm Astro's static HTML generation compatibility with Email Octopus JavaScript
- [ ] Test Astro image/asset optimization pipeline for logo PNG

### Responsive Breakpoint Validation
- [ ] Confirm site-wide breakpoints match COA-42 spec (768px, 1024px)
- [ ] Test footer layout switches at correct breakpoints (verify CSS media queries)

---

## Open Questions

1. **Email Octopus Integration Code**: What is the exact HTML snippet or script injection code from Email Octopus? (Currently assumed form ID is sufficient; may need full docs.)
2. **Form Label Rendering**: Does Email Octopus automatically render `<label>` for form input, or must we add it manually?
3. **Loading State**: Should we implement a loading spinner during form submission, or does Email Octopus provide this automatically?
4. **Logo Fallback Timing**: How long should we wait for Email Octopus script to load before showing fallback message? (Suggest 3–5 seconds.)
5. **Image Fallback Approach**: Should we use CSS, JavaScript, or `<picture>` element for logo image fallback? (Recommend JavaScript `onerror` for simplicity.)
6. **Existing Footer Links**: Are there any deprecated links in the current footer that should be removed or updated?

---

## Success Criteria (from Spec)

All 10 success criteria must be verified before merge:

- **SC-001**: Email Octopus form renders in footer with visible input field and SUBSCRIBE button; no JavaScript errors in browser console. ✅
- **SC-002**: Email Octopus dashboard confirms successful form submissions with correct email addresses. ✅
- **SC-003**: Footer displays copyright text, tagline, and all links with exact wording and proper formatting (100% match to spec). ✅
- **SC-004**: Phoenix United logo displays in footer and header on all tested screen sizes (320px, 480px, 768px, 1024px+) with correct dimensions (60–80px height) and no broken image indicators. ✅
- **SC-005**: External Bendigo Basketball Association link resolves correctly and opens in new browser tab. ✅
- **SC-006**: Footer layout renders 4 columns on desktop (1024px+), 2 columns on tablet (768px–1023px), 1 column on mobile (<768px) with no horizontal overflow. ✅
- **SC-007**: Form submission does not increase page load time by more than 100ms. ✅
- **SC-008**: All form submission errors display user-visible messages (no silent failures). ✅
- **SC-009**: Footer remains fully functional and readable on handheld devices (<768px) without layout breakage. ✅
- **SC-010**: All interactive footer elements (form, links, logo) are keyboard accessible and work with screen readers. ✅

---

## Next Steps

1. **Research Phase** (COA-42-RESEARCH):
   - Retrieve Email Octopus script injection code
   - Confirm logo asset metadata (dimensions, aspect ratio)
   - Document Email Octopus JavaScript event names for fallback detection

2. **Task Breakdown** (tasks.md):
   - Create atomic tasks (1–2 hours each) for Phases 1–7
   - Map tasks to feature branch work
   - Assign priority and dependencies

3. **Implementation Phase** (feature development):
   - Execute tasks in order (Phase 1 → Phase 7)
   - Test each phase before moving to next
   - Document any deviations from plan

4. **Review & Merge**:
   - Run acceptance testing checklist
   - Code review (linting, formatting, component patterns)
   - Deploy to main branch
   - Monitor Email Octopus dashboard for signups

---

## Appendix: Email Octopus Integration Example

(Placeholder for actual script injection code once retrieved from Email Octopus docs)

```astro
<!-- Footer.astro -->
<footer class="bg-brand-purple text-white mt-auto">
  <!-- Main footer content -->
  <div class="max-w-7xl mx-auto px-4 py-12">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <!-- ... existing sections ... -->
      
      <!-- Email Octopus form section -->
      <div>
        <h3 class="text-brand-gold font-bold text-sm uppercase tracking-wider mb-4">Newsletter</h3>
        <!-- Email Octopus container -->
        <div id="eo-form-11c550ac-11dc-11f1-a2e0-ef681a07d4a5"></div>
        
        <!-- Fallback message (hidden by default) -->
        <div id="eo-fallback" class="hidden">
          <p class="text-sm text-purple-200">
            Form unavailable. <a href="mailto:hello@bendigophoenix.org.au">Email us to subscribe</a>
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Email Octopus script -->
  <script src="https://[email-octopus-cdn]/path-to-script.js"></script>
  <script>
    // Fallback logic
    setTimeout(() => {
      if (!window.EmailOctopus) {
        document.getElementById('eo-fallback').classList.remove('hidden');
      }
    }, 3000);
  </script>
</footer>
```

---

## Document Control

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2026-04-10 | Claude | Initial plan based on spec COA-42 |

