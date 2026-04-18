# Feature Specification: Fixes (UI & Link Corrections)

**Feature Branch**: `cameronwalsh/coa-67-fixes`  
**Created**: 2026-04-19  
**Status**: READY_FOR_DEV  
**Source**: COA-67 (Linear)  
**Priority**: P0 (Multiple critical mobile UX issues affecting core user journeys)  
**Input**: User description: "Multiple bugs across home page, mobile, teams, resources, and contact pages"

## Summary

This feature bundles six independent UI and link correction fixes across the Phoenix app:
1. **Home Page Team Card**: Correct link path and text labels (P1 — blocks navigation to teams)
2. **Mobile Modals**: Fix image display cropping in uniform information and registration modals (P1 — breaks mobile UX)
3. **Teams/Resources Filters**: Fix mobile filter layout overflow (P2 — degrades UX but doesn't block function)
4. **Contact Page Email**: Fix email address alignment/overflow (P3 — visual polish)

These are largely CSS/layout fixes with minor text updates; no backend changes required. All fixes maintain desktop layout integrity (>768px) and follow established Astro + Tailwind patterns.

## User Scenarios & Testing

### User Story 1 - Home Page Team Card Text & Link Updates (Priority: P1)

Users viewing the home page need to navigate to team results and the full teams list via updated cards with correct links and text labels.

**Why this priority**: Core navigation issue affecting multiple user journeys (coaches, players, visitors) trying to access team information.

**Independent Test**: Can be fully tested by updating the Team card text/link, verifying the redirect works, and confirming the card displays correctly on desktop and mobile.

**Acceptance Scenarios**:

1. **Given** user is on the home page, **When** they click the Team card, **Then** they are directed to `/teams/` (not `/team/`)
2. **Given** the Team card is visible, **When** user reads the card text, **Then** the title reads "Teams" (not "Team")
3. **Given** the Team card is visible, **When** user reads the card subtitle, **Then** it reads "Your team results and ladder" (not "Meet our players, coaches and staff")
4. **Given** Coaching Resources card is visible, **When** user clicks it, **Then** they navigate to `/resources/` with no errors

---

### User Story 2 - Mobile Modal Images Display (Priority: P1)

Mobile users viewing uniform/player information in modals see images cropped or not fully displayed, making the content unusable.

**Why this priority**: Critical usability issue on mobile affecting user trust in player/uniform information; blocks mobile user journey completely.

**Independent Test**: Can be fully tested by viewing the uniform information modal on mobile device (tested at breakpoints: 375px, 768px), confirming images display in full without cropping, verifying modal height/scroll behavior is correct, and testing modal scrollability on 320px devices.

**Screenshot - Uniform Information Modal (Images Cropped)**:
![Uniform modal showing cropped/stretched uniform images on mobile](https://uploads.linear.app/09cfe698-cd1e-4c7d-b0f1-963e4254dd2b/65ab1082-6783-413b-8ccc-861139956ef9/8cd508ac-232b-4387-a4c0-bb8b8c89f016)

**Acceptance Scenarios**:

1. **Given** user opens the uniform information modal on mobile, **When** the modal loads, **Then** images display in full without horizontal or vertical cropping
2. **Given** modal content exceeds viewport height, **When** user scrolls, **Then** all content is accessible and images remain properly sized
3. **Given** user is on a small phone (375px width), **When** modal appears, **Then** layout adapts and images scale appropriately

---

### User Story 3 - Mobile Registration Modal Images (Priority: P1)

Mobile users registering for programs see registration form modal images cropped similarly to uniform modals.

**Why this priority**: Mobile registration is a critical conversion point; broken images undermine confidence and block registration flow.

**Independent Test**: Can be fully tested by opening the registration modal on mobile, confirming images display correctly, and submitting a test registration.

**Screenshot - Registration Modal (Images Cropped)**:
![Registration modal showing cropped event/team images on mobile](https://uploads.linear.app/09cfe698-cd1e-4c7d-b0f1-963e4254dd2b/48bff057-6b7a-4b6e-849c-294c94cc97b3/f5bc821e-2cb9-456e-a9e8-d9d73599ba8d)

**Acceptance Scenarios**:

1. **Given** user opens registration modal on mobile, **When** modal loads, **Then** all images display in full and are appropriately sized
2. **Given** user scrolls through the registration form, **When** images come into view, **Then** they render without cropping or distortion

---

### User Story 4 - Teams Page Filter Layout on Mobile (Priority: P2)

Mobile users on the teams page see filter controls that don't fit within the row, making the page difficult to navigate or causing layout overflow.

**Why this priority**: Filter usability impacts ability to find and view teams; affects mobile experience but doesn't block core function if filters are optimized or made collapsible.

**Independent Test**: Can be fully tested by viewing the teams page on mobile, confirming filters are accessible and functional (either wrapping, scrollable, or collapsible), and verifying the page layout remains stable.

**Acceptance Scenarios**:

1. **Given** user views teams page on mobile, **When** filter controls are visible, **Then** they fit within the viewport width (either wrapped to multiple lines OR horizontally scrollable)
2. **Given** filters are present, **When** user clicks a filter, **Then** the filter applies without layout shift or page jump
3. **Given** user is on small phone (375px), **When** page loads, **Then** all filter options are accessible (not hidden or cut off)

---

### User Story 5 - Resources Page Mobile Filter Overflow (Priority: P2)

Mobile users on the resources page see filters that consume too much vertical space, preventing users from interacting with resource content below the filter.

**Why this priority**: Filter visibility/overflow blocks access to resources but doesn't prevent viewing them if page is scrolled; fixable with compact filter design or collapsible state.

**Independent Test**: Can be fully tested by loading resources page on mobile, confirming filters are compact or collapsible, and verifying resources below are accessible within reasonable scroll distance.

**Screenshot - Resources Page Mobile Filter (Too Large)**:
![Resources page showing filter section taking up 60%+ of viewport on mobile](https://uploads.linear.app/09cfe698-cd1e-4c7d-b0f1-963e4254dd2b/b2a00b14-0c3a-485b-a70e-fadcebea5471/c7b51f19-9646-4db3-8d3c-265a9f1768d6)

**Acceptance Scenarios**:

1. **Given** user opens resources page on mobile, **When** page loads, **Then** filter controls occupy ≤50% of viewport height
2. **Given** filters are visible, **When** user scrolls down, **Then** they can access and click resource items without the filter blocking interaction
3. **Given** filter has multiple options, **When** expanded or in use, **Then** there is a way to collapse or hide it to reveal more content

---

### User Story 6 - Contact Page Email Address Alignment (Priority: P3)

Mobile users viewing contact information see email addresses positioned outside the contact card boundary, creating visual inconsistency and appearing broken.

**Why this priority**: Visual bug affecting perceived professionalism; doesn't block functionality but improves polish and trust.

**Independent Test**: Can be fully tested by viewing contact page on mobile, confirming all email addresses sit within or properly aligned with the contact card boundaries.

**Screenshot - Contact Page Email Misalignment**:
![Contact page showing email addresses extending outside the card boundary on mobile](https://uploads.linear.app/09cfe698-cd1e-4c7d-b0f1-963e4254dd2b/7b3ef257-1196-4bdc-a32f-ea5b4a6085ec/b95c5f93-db7e-45f3-851b-cb3fd6843ec2)

**Acceptance Scenarios**:

1. **Given** user views contact page, **When** email addresses are visible, **Then** they are left-aligned with the card and do not overflow or sit outside the card edge
2. **Given** contact information is displayed, **When** user views on mobile (375px+), **Then** email addresses remain contained and readable

---

### Edge Cases

- **Varying Image Sizes in Modals**: What if uniform images are portrait, landscape, or square? → Images MUST scale proportionally within modal bounds without distortion; use CSS `object-fit: contain` to preserve aspect ratio
- **Filter Growth**: What if a new filter option is added in future? → Layout strategy (wrap/scroll/collapse) must accommodate additional filters without breaking at 375px
- **Large Screens (>1920px)**: How do filters behave on ultra-wide desktops? → Filters should display horizontally without excessive spacing or wrapping; maintain same layout as 1024px-1920px range
- **Broken Links**: What if `/teams/` or `/resources/` endpoint is unavailable? → Links will result in standard 404 page (no special handling required for this fix)
- **Modal Image Load Failure**: What if an image fails to load? → Modal shows gracefully with fallback background color; CSS must prevent layout collapse
- **Empty Filter State**: What if no filters are present? → Layout should not break; filters are conditionally rendered (not affected by this fix)
- **Touch Devices on Filters**: Do tap targets for filter buttons meet 44px minimum? → Verify during testing; if not, adjust padding/height accordingly

## Requirements

### Functional Requirements

- **FR-001**: Home page Team card MUST link to `/teams/` (not `/team/`)
- **FR-002**: Home page Team card text MUST display "Teams" as the title
- **FR-003**: Home page Team card subtitle MUST read "Your team results and ladder"
- **FR-004**: Coaching Resources card MUST link to `/resources/`
- **FR-005**: Uniform information modal MUST display images in full on mobile viewports (375px to 768px) without cropping, with scrollable container on 320px devices
- **FR-006**: Registration modal MUST display images in full on mobile viewports without cropping
- **FR-007**: Teams page filter controls MUST fit within viewport width on mobile (wrap, scroll, or collapse are all valid approaches)
- **FR-008**: Resources page filter MUST occupy ≤50% of viewport height on mobile
- **FR-009**: Contact page email addresses MUST be left-aligned within card boundaries on all viewports
- **FR-010**: All fixes MUST maintain desktop layout integrity (no regression on ≥768px viewports)

### Non-Functional Requirements

#### Accessibility (Principle VI — WCAG 2.1 AA)
- **NFR-001**: Filter controls on Teams and Resources pages MUST remain keyboard accessible; Tab navigation must work regardless of layout changes (wrap/scroll/collapse)
- **NFR-002**: All text (card titles, subtitles, email addresses) MUST maintain minimum color contrast of 4.5:1 against backgrounds (WCAG AA standard)
- **NFR-003**: Email addresses on Contact page MUST be readable and tappable at 44px minimum tap target height on mobile
- **NFR-004**: Modal images MUST not break focus management; if modals are keyboard-navigable, focus traps must still function

#### Responsive Layout (Principle V — AppShell Consistency)
- **NFR-005**: All components MUST render correctly at breakpoints: 375px (target iPhone SE, primary mobile), 768px (tablet), 1024px (small desktop), 1920px+ (wide desktop); 320px devices supported with scrollable modal containers
- **NFR-006**: No layout shifts or reflow jank when transitioning between breakpoints
- **NFR-007**: Filter wrapping/scrolling/collapse MUST be flexbox-based (no custom scroll containers) for consistency with existing Astro + Tailwind patterns
- **NFR-008**: Modals MUST maintain 100% image visibility without distortion; object-fit: contain is preferred to avoid stretching

#### Error Handling & Observability
- **NFR-009**: If a modal image fails to load, the modal MUST display gracefully (fallback color or placeholder) without breaking the UI
- **NFR-010**: No silent failures; if a link is broken (404), the browser will handle naturally (no custom error handling required for this fix)

#### Performance
- **NFR-011**: Filter layout changes MUST not cause layout thrashing; use CSS-only solutions where possible
- **NFR-012**: No new dependencies added; fixes MUST use existing Astro + Tailwind tooling

### Key Entities

- **Home Page Cards**: Team, Coaching Resources (title, subtitle, link, styling)
- **Modals**: Uniform Information, Registration (image container sizing/overflow behavior)
- **Filter Components**: Teams page, Resources page (layout strategy: wrap/scroll/collapse)
- **Contact Card**: Email addresses (alignment, spacing relative to card boundary)

### Implementation Notes

All fixes are **CSS and/or component text updates**; no backend changes required:
- **Story 1** (Team Card): Update link href and text labels in home page component
- **Stories 2–3** (Modals): CSS overflow/sizing adjustments; verify image containers scale responsively
- **Stories 4–5** (Filters): CSS layout adjustments (flexbox wrap, overflow handling, or collapsible state)
- **Story 6** (Email Alignment): CSS text alignment and padding adjustments

## Success Criteria

### Measurable Outcomes

- **SC-001**: Home page Team card links to `/teams/` (confirmed via DevTools Network tab or clicking the link and verifying URL matches expected route)
- **SC-002**: All modal images display at 100% width and height without cropping on mobile breakpoints (verified at 375px, 768px in DevTools device emulation; modal scrollable on 320px)
- **SC-003**: Teams page filters fit within viewport width on mobile (375px and 768px) without horizontal overflow; tab navigation remains functional
- **SC-004**: Resources page filter occupies ≤50% of viewport height (measured in DevTools; remaining space shows resource list above fold)
- **SC-005**: Contact page email addresses align left within card boundary with 0-8px padding and no overflow on mobile (375px, 768px); verified via visual inspection
- **SC-006**: No cumulative layout shift (CLS) when viewing modals or interacting with filters on mobile; Lighthouse CLS score <0.1
- **SC-007**: 100% of functional requirements (FR-001 to FR-010) verified on iOS Safari and Chrome Android (or equivalents in DevTools)
- **SC-008**: Desktop layouts unchanged at 1024px and 1920px breakpoints (visual regression testing; compare before/after screenshots)
- **SC-009**: Text contrast on all updated elements meets WCAG AA (4.5:1 minimum) verified via browser accessibility inspector
- **SC-010**: Keyboard navigation (Tab) works on filters and modal interactions; focus indicators visible throughout

---

## Acceptance Criteria

### Home Page Team Card Fixes (Stories 1)

1. **Given** user is on the home page, **When** they view the Team card, **Then** it displays "Teams" as the title (not "Team")
2. **Given** the Team card is visible, **When** user reads the subtitle, **Then** it reads "Your team results and ladder" (not "Meet our players, coaches and staff")
3. **Given** user clicks the Team card on desktop, **When** the click completes, **Then** they navigate to `/teams/` (verified in browser address bar)
4. **Given** user clicks the Team card on mobile (375px), **When** the click completes, **Then** they navigate to `/teams/`
5. **Given** user views the Coaching Resources card, **When** they click it, **Then** they navigate to `/resources/` without errors
6. **Given** desktop viewport (1024px), **When** home page renders, **Then** Team and Coaching Resources cards display with correct text and links (no regression from original design)

### Mobile Modal Image Display (Stories 2–3)

7. **Given** user opens the uniform information modal on mobile (375px width), **When** the modal renders, **Then** all images display in full without horizontal or vertical cropping
8. **Given** modal is open on mobile (375px), **When** user scrolls through modal content, **Then** images remain properly sized and do not stretch or distort
9. **Given** user is on a small phone (320px width), **When** uniform modal opens, **Then** images adapt responsively without breaking layout
9b. **Given** user is on a small phone (320px width), **When** the uniform modal content exceeds viewport height, **Then** the modal is scrollable and all content remains accessible
10. **Given** user opens the registration modal on mobile (375px), **When** the modal renders, **Then** all images display in full without cropping
11. **Given** registration modal is open, **When** user scrolls, **Then** images remain visible and properly sized throughout modal
12. **Given** modal images fail to load (404), **When** modal renders, **Then** it displays gracefully with fallback background color

### Teams & Resources Page Filter Layout (Stories 4–5)

13. **Given** user views teams page on mobile (375px), **When** page loads, **Then** filter controls fit within viewport width (wrap, scroll, or collapse are all acceptable approaches)
14. **Given** filters are visible on teams page mobile, **When** user clicks a filter to apply it, **Then** there is no layout shift or page jump
15. **Given** user is on small phone (375px), **When** teams page loads, **Then** all filter options are accessible (not hidden or cut off)
16. **Given** user views resources page on mobile (375px), **When** page loads, **Then** filters occupy ≤50% of viewport height and resource list is visible above fold
17. **Given** resources page is open on mobile, **When** user scrolls down, **Then** they can access and click resource items without filter blocking interaction
18. **Given** resources page has multiple filter options, **When** user expands or uses filters, **Then** content remains accessible (no excessive page jump)

### Contact Page Email Alignment (Story 6)

19. **Given** user views contact page on mobile (375px), **When** email addresses are visible, **Then** they are left-aligned within card boundary
20. **Given** contact card is displayed on mobile, **When** email text renders, **Then** it does not overflow outside card edge
21. **Given** user is on tablet (768px), **When** contact page renders, **Then** email addresses remain contained and readable within card

### Responsive & Cross-Platform Verification

22. **Given** any fix is applied, **When** page is viewed on desktop (1024px), **Then** layout remains unchanged (no regression)
23. **Given** any fix is applied, **When** page is viewed on large desktop (1920px), **Then** layout remains unchanged and properly scaled
24. **Given** user navigates between mobile (375px) and desktop (1024px) viewport, **When** they resize browser, **Then** layout reflows smoothly without jank
25. **Given** modal or filter is open, **When** user resizes viewport, **Then** content reflows responsively without breaking interaction

### Accessibility & Keyboard Navigation

26. **Given** user navigates filters on Teams page using Tab key, **When** they Tab through filters, **Then** focus indicator is visible and filters remain interactive
27. **Given** user navigates Resources page filters using keyboard, **When** they Tab and press Enter/Space on a filter, **Then** filter applies correctly
28. **Given** modal is open on mobile, **When** user navigates using Tab, **Then** focus remains within modal (focus trap works) and close button/action is accessible
29. **Given** any updated text (Team card, email address), **When** user inspects it with accessibility tools, **Then** text contrast meets WCAG AA (4.5:1 minimum)

### Testing on Real Devices (Mobile & Desktop)

30. **Given** all fixes are implemented, **When** tested on iOS Safari (iPhone 12), **Then** modals display correctly and filters are accessible
31. **Given** all fixes are implemented, **When** tested on Chrome Android, **Then** modals display correctly and filters fit within viewport
32. **Given** all fixes are implemented, **When** tested on desktop (Chrome, Firefox, Safari on macOS/Windows), **Then** no regressions and desktop layout unchanged

---

## Constitutional Compliance

This specification has been reviewed against CoachCW constitutional principles to ensure alignment with core values and technical requirements.

### Principle I: User Outcomes First
**Status**: ✅ **PASS**

Every user story has an explicit, measurable outcome tied to user behavior:
- **Story 1** (P1): Users can navigate to teams from home page (outcome: correct link works)
- **Story 2–3** (P1): Mobile users see images properly (outcome: no cropping, full visibility)
- **Story 4–5** (P2): Mobile users can use filters without overflow (outcome: filters fit viewport)
- **Story 6** (P3): Contact page appears professional (outcome: email text properly aligned)

Success criteria are measurable and observable (SC-001 through SC-010).

### Principle II: Test-First Discipline
**Status**: ✅ **PASS**

Acceptance Criteria section includes 32 detailed test scenarios covering:
- Home page card fixes (6 scenarios)
- Mobile modal image display (6 scenarios)
- Teams & Resources filter layout (6 scenarios)
- Contact page email alignment (3 scenarios)
- Responsive & cross-platform (4 scenarios)
- Accessibility & keyboard navigation (4 scenarios)
- Real device testing (3 scenarios)

Each test is independently executable and validates user outcomes. All scenarios follow Given/When/Then format.

### Principle III: Backend Authority & Invariants
**Status**: ✅ **PASS**

This feature is frontend-only with no backend changes:
- No data mutations or API calls
- Links are static (hardcoded URLs)
- All fixes are CSS and text updates
- No client-side state inference
- No authorization or validation changes

### Principle IV: Error Semantics & Observability
**Status**: ✅ **PASS**

Error handling is addressed:
- **NFR-009**: Modal image load failure displays gracefully with fallback color
- **AC-12**: Modal handles missing images without breaking layout
- **Edge Case**: Broken links will result in standard browser 404 (no custom handling needed)

No silent failures specified; all scenarios address failure modes explicitly.

### Principle V: AppShell Integrity
**Status**: ✅ **PASS**

All fixes maintain AppShell consistency:
- **Scope**: Modifications to existing components only (no new navigation shells)
- **NFR-007**: Filter layout changes use flexbox-based approach consistent with existing Astro + Tailwind patterns
- **FR-010**: Desktop layouts (>768px) explicitly untouched
- **AC-22 through AC-25**: Responsive verification across all breakpoints

No custom navigation paradigms introduced; changes are localized to component styling.

### Principle VI: Accessibility First
**Status**: ✅ **PASS** (WCAG 2.1 AA)

Accessibility is integrated throughout:

**Keyboard Navigation**:
- **NFR-001**: Filter controls remain keyboard accessible (Tab navigation must work)
- **AC-26 through AC-29**: Detailed keyboard navigation test scenarios
- Focus management explicitly verified in AC-28

**Color Contrast**:
- **NFR-002**: Text maintains 4.5:1 minimum contrast (WCAG AA standard)
- **SC-009**: Contrast verified via accessibility inspector
- **AC-29**: Updated text inspected for compliance

**Touch & Tap Targets**:
- **NFR-003**: Email addresses have 44px minimum tap target on mobile
- **AC-19 through AC-21**: Mobile email rendering verified
- **AC-15**: Filter accessibility verified on small phones (375px)

**Mobile & Responsive**:
- **NFR-005**: All components render correctly at 320px, 375px, 768px, 1024px, 1920px breakpoints
- **NFR-006**: No layout shifts when transitioning between breakpoints
- **AC-24**: Resize behavior verified for smooth reflow

**WCAG 2.1 AA Compliance**:
- ✅ Level A: All requirements met (keyboard nav, color contrast, text alternatives)
- ✅ Level AA: All requirements met (enhanced contrast, mobile responsiveness, accessibility features)

### Principle VII: Immutable Data Flow
**Status**: ✅ **PASS**

Data flows are unidirectional; no state mutations:
- **Home Page Cards**: Links and text are static (no state changes)
- **Modals**: Image display is CSS-driven; no state mutation
- **Filters**: User interaction applies filters (backend already handles state; frontend is read-only in this context)
- **Contact Page**: Email text is static (no mutation)

No client-side inference of server state; all content comes from component props or static data.

### Principle VIII: Dependency Hygiene
**Status**: ✅ **PASS**

No new external dependencies introduced:
- Uses existing Astro components
- Uses Tailwind CSS (already in stack)
- CSS is native (no animation libraries)
- JavaScript is minimal/native (if any)
- **NFR-012**: Explicitly stated that no new dependencies should be added

No version pinning concerns; no security vulnerabilities introduced.

### Principle IX: Cross-Feature Consistency
**Status**: ✅ **PASS**

All fixes follow established CoachCW patterns:
- Component structure matches existing Astro components (home page cards, modals, filter components already exist)
- Styling uses Astro + Tailwind with established brand colors (#573F93, #8B7536)
- Responsive design follows mobile-first breakpoint conventions (320px, 375px, 768px, 1024px, 1920px)
- Accessibility patterns match established WCAG standards across the codebase
- No new component paradigms or framework versions introduced

No pattern fragmentation; changes integrate seamlessly with existing architecture.

### Summary: Constitutional Alignment

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. User Outcomes First** | ✅ PASS | Clear, measurable outcomes; 6 prioritized stories with testable criteria |
| **II. Test-First Discipline** | ✅ PASS | 32 comprehensive acceptance criteria covering all interaction modes |
| **III. Backend Authority** | ✅ PASS | Frontend-only changes; no server mutations or inference |
| **IV. Error Semantics** | ✅ PASS | Graceful error handling for missing images; no silent failures |
| **V. AppShell Integrity** | ✅ PASS | Existing components only; no new navigation or custom shells |
| **VI. Accessibility First** | ✅ PASS | WCAG 2.1 AA compliant; keyboard nav, contrast, responsive across breakpoints |
| **VII. Immutable Data Flow** | ✅ PASS | Static content and CSS-driven styling; no state inference |
| **VIII. Dependency Hygiene** | ✅ PASS | No new external dependencies; uses existing Astro + Tailwind stack |
| **IX. Cross-Feature Consistency** | ✅ PASS | Follows established Astro + Tailwind patterns; no framework fragmentation |

**Overall Status**: ✅ **CONSTITUTIONAL COMPLIANCE: PASS**

All nine constitutional principles are satisfied. No conflicts or violations identified. Specification is complete, testable, and ready for implementation.

### Open Questions: None

All sections are fully specified. The spec is actionable and ready for the implement agent.

---

## Notes for Implementation Agent

1. **Files to Modify** (identified during review):
   - Home page component (update Team card text and href)
   - Modal components for uniform information and registration (CSS sizing/overflow)
   - Filter components on teams.astro and resources/index.astro (CSS layout adjustments)
   - Contact page component (CSS email text alignment)

2. **Testing Strategy**:
   - Use DevTools device emulation for 375px, 768px, 1024px, 1920px testing
   - Run on real iOS device (iOS Safari) and Android device (Chrome) for final validation
   - Compare before/after screenshots for visual regression on desktop
   - Use accessibility inspector to verify color contrast and ARIA/semantic HTML

3. **CSS-First Approach**:
   - Prefer CSS-only solutions (flexbox wrapping, object-fit, padding adjustments)
   - No component logic changes required unless edge case discovered
   - Use Tailwind utility classes where possible for consistency

4. **No Backend Changes Required**: All fixes are frontend styling/text updates.