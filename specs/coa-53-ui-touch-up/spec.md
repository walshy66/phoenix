# Feature Specification: UI Touch Up

**Feature Branch**: `cameronwalsh/coa-53-ui-touch-up`  
**Created**: 2026-04-15  
**Status**: Draft  
**Input**: Design polish pass addressing spacing, consistency, and visual hierarchy across site

## User Scenarios & Testing

### User Story 1 - Consistent Title Sections (Priority: P1)

When visiting any page on the Phoenix website, users should encounter a consistent visual pattern in the title section. Currently, some pages (Teams, About, Scores) lack descriptive text in the purple title header, creating a visual imbalance compared to pages that have text.

**Why this priority**: Visual consistency is foundational to brand perception and user experience. Inconsistent title sections make the site feel incomplete or unpolished.

**Independent Test**: Can be tested by visiting Teams, About, and Scores pages and verifying that each title section now contains appropriate 1-liner descriptive text, matching the visual weight of other pages with title text.

**Acceptance Scenarios**:

1. **Given** user visits the Teams page, **When** page loads, **Then** the purple title section displays "Teams" as the heading with a short 1-line description below
2. **Given** user visits the About page, **When** page loads, **Then** the purple title section displays "About" as the heading with a short 1-line description below
3. **Given** user visits the Scores page, **When** page loads, **Then** the purple title section displays "Scores" as the heading with a short 1-line description below
4. **Given** user compares title sections across multiple pages, **When** viewing pages side-by-side, **Then** all title sections have visually consistent spacing and text weight

---

### User Story 2 - Reduced Purple Title Section Spacing (Priority: P1)

The purple title sections across all pages have excessive padding above and below the text, wasting valuable viewport space and making the site feel bloated. This needs to be significantly reduced while maintaining readability and visual balance.

**Why this priority**: Excessive whitespace degrades the perceived quality of the site and reduces content visibility. Tightening spacing immediately improves perceived polish.

**Independent Test**: Can be tested by comparing before/after screenshots of any page's title section. Visual inspection should confirm that padding is noticeably reduced and the section feels more compact without losing readability.

**Acceptance Scenarios**:

1. **Given** user views a page with a purple title section, **When** page loads, **Then** vertical padding above text is minimal (less than current state)
2. **Given** user views a page with a purple title section, **When** page loads, **Then** vertical padding below text is minimal (less than current state)
3. **Given** user views multiple pages, **When** comparing title sections, **Then** spacing is uniform across all pages
4. **Given** page has title text, **When** title is rendered, **Then** text remains readable and properly spaced within the section

---

### User Story 3 - Scores Page Card Consistency & Visibility (Priority: P1)

Scores page team cards are not uniform in size, columns are too narrow (making cards hard to read), and white text on white background creates poor contrast. The purple Phoenix team names become visually lost in the card, undermining the brand presence on the page.

**Why this priority**: The Scores page is a high-traffic user destination. Card visibility and readability directly impact usability and brand perception.

**Independent Test**: Can be tested by visiting the Scores page and verifying that (a) all cards are uniform height/width, (b) columns are appropriately wide, (c) cards have visible background color differentiation, and (d) purple team names stand out against the card background.

**Acceptance Scenarios**:

1. **Given** user visits the Scores page, **When** page loads, **Then** all team cards display at a uniform size (same height and width)
2. **Given** user views the card grid, **When** cards are rendered, **Then** columns are wide enough for text to be easily readable without truncation or cramping
3. **Given** user views a team card, **When** the card is rendered, **Then** the card background color is NOT white and provides contrast against the page background
4. **Given** user looks at a team card, **When** the card is displayed, **Then** the purple team name is visually distinct and stands out against the card background color

---

### User Story 4 - Clean Resources Page (Priority: P2)

The Resources page currently displays a `dot.walk` element that appears on no other page in the site. This element needs to be removed to maintain consistency and cleanliness.

**Why this priority**: This is a quick visual cleanup that improves consistency. Lower priority than core spacing issues but straightforward to implement.

**Independent Test**: Can be tested by visiting the Resources page and confirming that the `dot.walk` element is not visible anywhere on the page.

**Acceptance Scenarios**:

1. **Given** user visits the Resources page, **When** page loads, **Then** no `dot.walk` element is visible on the page
2. **Given** user views other pages, **When** comparing, **Then** Resources page matches the visual cleanliness of other pages

---

### User Story 5 - Contact Page Spacing (Priority: P2)

There is excessive empty space between the Contact Cards section and the Leadership section on the Contact page. This creates a visual disconnect and may suggest these are two unrelated sections. The spacing needs to be reduced, and the overall section structure may need discussion.

**Why this priority**: While important for visual cohesion, this is a refinement issue. The page is functional; this improves perceived polish. Requires design discussion to determine optimal layout.

**Independent Test**: Can be tested by visiting the Contact page and observing the visual spacing between contact cards and leadership sections. After changes, the sections should feel more connected.

**Acceptance Scenarios**:

1. **Given** user visits the Contact page, **When** page loads, **Then** vertical spacing between contact cards and leadership section is noticeably reduced
2. **Given** user views the Contact page, **When** observing the layout, **Then** the contact cards and leadership section feel visually connected (or appropriately separated if intentional redesign)

---

### Edge Cases

- What happens if a title section has no text? (Already addressed: we're adding text to all pages)
- How does spacing reduction affect mobile layouts? (Ensure mobile spacing remains appropriate and readable)
- What color choice for Scores cards works on both light and dark brand backgrounds? (Design decision needed)

## Requirements

### Functional Requirements

- **FR-001**: System MUST display consistent 1-line descriptive text in purple title sections for Teams, About, and Scores pages
- **FR-002**: System MUST render purple title sections with significantly reduced vertical padding (top and bottom) on all pages
- **FR-003**: System MUST NOT display the `dot.walk` element on the Resources page
- **FR-004**: System MUST render all team cards on the Scores page at uniform size (same height and width)
- **FR-005**: System MUST display Scores page cards with column widths sufficient for readable text without truncation
- **FR-006**: System MUST render Scores page cards with a non-white background color that provides visual contrast
- **FR-007**: System MUST reduce vertical spacing between Contact Cards section and Leadership section on the Contact page
- **FR-008**: System MUST maintain consistent padding and spacing across responsive breakpoints (mobile, tablet, desktop)

### Key Entities

- **Page Title Section**: Purple header component with optional descriptive text, appearing at the top of each page. Current state: inconsistent spacing and missing text on some pages.
- **Team Card**: Individual card component on Scores page displaying team information. Current state: non-uniform sizing, poor contrast, narrow columns.
- **Contact Page Sections**: Two sections (Contact Cards and Leadership) with excessive spacing between them. May be intentionally separate or should be restructured.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All pages with title sections display consistent vertical padding (within 2px tolerance across all pages)
- **SC-002**: Teams, About, and Scores pages all display 1-line descriptive text in their title sections
- **SC-003**: Scores page cards all render at identical height and width (within 1px tolerance for layout rounding)
- **SC-004**: Scores page card background color provides visual contrast against page background (WCAG AA standard minimum)
- **SC-005**: Purple team names on Scores cards have sufficient color contrast against card background (WCAG AA standard minimum)
- **SC-006**: Resources page renders with no `dot.walk` element visible
- **SC-007**: Contact page shows visually reduced spacing between Contact Cards and Leadership sections (at least 50% reduction from current state)
- **SC-008**: All changes maintain visual consistency and professional appearance across mobile, tablet, and desktop viewports
