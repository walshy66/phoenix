# Feature Specification: Fixes (UI & Link Corrections)

**Feature Branch**: `cameronwalsh/coa-67-fixes`  
**Created**: 2026-04-19  
**Status**: Draft  
**Input**: User description: "Multiple bugs across home page, mobile, teams, resources, and contact pages"

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

**Independent Test**: Can be fully tested by viewing the uniform information modal on mobile device (tested at breakpoints: 375px, 768px), confirming images display in full without cropping, and verifying modal height/scroll behavior is correct.

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

- What happens when a modal contains images of varying sizes (portrait, landscape, square)? → Images should scale proportionally within modal bounds without distortion
- How does the filter layout handle when a new filter option is added in future? → Design must be flexible enough to accommodate additional filters (wrap/scroll/collapsible strategy)
- What happens on very large screens (desktop >1920px) with filters? → Filters should display horizontally without excessive spacing or wrapping
- How should team card links behave if `/teams/` endpoint is unavailable? → Graceful error or fallback (handled separately if needed)

## Requirements

### Functional Requirements

- **FR-001**: Home page Team card MUST link to `/teams/` (not `/team/`)
- **FR-002**: Home page Team card text MUST display "Teams" as the title
- **FR-003**: Home page Team card subtitle MUST read "Your team results and ladder"
- **FR-004**: Coaching Resources card MUST link to `/resources/`
- **FR-005**: Uniform information modal MUST display images in full on mobile viewports (320px to 768px) without cropping
- **FR-006**: Registration modal MUST display images in full on mobile viewports without cropping
- **FR-007**: Teams page filter controls MUST fit within viewport width on mobile (either wrap, scroll, or collapse)
- **FR-008**: Resources page filter MUST occupy ≤50% of viewport height on mobile
- **FR-009**: Contact page email addresses MUST be left-aligned within card boundaries on all viewports
- **FR-010**: All fixes MUST maintain desktop layout integrity (no regression on >768px viewports)

### Key Entities

- **Home Page Cards**: Team, Coaching Resources (title, subtitle, link, styling)
- **Modals**: Uniform Information, Registration (image container sizing/overflow behavior)
- **Filter Components**: Teams page, Resources page (layout strategy: wrap/scroll/collapse)
- **Contact Card**: Email addresses (alignment, spacing relative to card boundary)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Home page Team card links to correct URL (`/teams/` confirmed in browser DevTools)
- **SC-002**: All modal images display at 100% width without cropping on mobile (verified at 375px, 768px breakpoints)
- **SC-003**: Teams page filters remain interactive and accessible on mobile without layout overflow (tested on real device or Chrome/Safari mobile emulation)
- **SC-004**: Resources page filter height ≤50% of viewport (measured via DevTools or manual inspection)
- **SC-005**: Contact page email addresses sit within card boundaries with 0-8px left padding (visual regression testing)
- **SC-006**: No layout shifts or content jumps occur when interacting with filters on mobile (Lighthouse Cumulative Layout Shift score <0.1)
- **SC-007**: 100% of acceptance scenarios pass on mobile viewports (iOS Safari, Chrome Android)
- **SC-008**: Desktop layout regression tests pass (no changes to desktop >768px styling)