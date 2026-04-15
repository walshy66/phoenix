# Spec: UI Touch Up

**Status**: READY_FOR_DEV
**Source**: COA-53
**Priority**: P1 (visual consistency and UX refinement across multiple high-traffic pages)
**Feature Branch**: `cameronwalsh/coa-53-ui-touch-up`

---

## Summary

Polish the Phoenix website's visual consistency by standardizing page title sections, reducing excessive padding on hero sections, improving card styling uniformity on the Scores page, and cleaning up stray UI elements on Resources. These changes enhance perceived quality, improve content visibility, and establish consistent card patterns for future features.

## User Scenarios & Testing

### User Story 1 — Consistent Title Sections (Priority: P1)

When visiting any page on the Phoenix website, users should encounter a consistent visual pattern in the title section. Currently, some pages (Teams, About, Scores) lack descriptive text in the purple title header, creating a visual imbalance compared to pages that have text.

**Why this priority**: Visual consistency is foundational to brand perception and user experience. Inconsistent title sections make the site feel incomplete or unpolished.

**Independent Test**: Can be tested by visiting Teams, About, and Scores pages and verifying that each title section now contains appropriate 1-liner descriptive text, matching the visual weight of other pages with title text.

**Acceptance Scenarios**:

1. **Given** user visits the Teams page, **When** page loads, **Then** the purple title section displays "TEAMS" as the heading with a short 1-line description below
2. **Given** user visits the About page, **When** page loads, **Then** the purple title section displays "ABOUT" as the heading with a short 1-line description below
3. **Given** user visits the Scores page, **When** page loads, **Then** the purple title section displays "SCORES" as the heading with a short 1-line description below
4. **Given** user compares title sections across multiple pages, **When** viewing pages side-by-side, **Then** all title sections have visually consistent spacing and text weight

---

### User Story 2 — Reduced Purple Title Section Spacing (Priority: P1)

The purple title sections across all pages have excessive padding above and below the text, wasting valuable viewport space and making the site feel bloated. This needs to be significantly reduced while maintaining readability and visual balance.

**Why this priority**: Excessive whitespace degrades the perceived quality of the site and reduces content visibility. Tightening spacing immediately improves perceived polish.

**Independent Test**: Can be tested by comparing before/after screenshots of any page's title section. Visual inspection should confirm that padding is noticeably reduced and the section feels more compact without losing readability.

**Acceptance Scenarios**:

1. **Given** user views a page with a purple title section, **When** page loads, **Then** vertical padding is reduced from `py-16` to `py-8` (desktop) and maintained appropriately on mobile
2. **Given** user views a page with a purple title section, **When** page loads, **Then** the one-liner descriptive text remains readable and properly aligned
3. **Given** user views multiple pages, **When** comparing title sections, **Then** spacing is uniform across all pages (Teams, About, Scores, Seasons, Contact, Get Involved, Resources)
4. **Given** page has subtitle and main heading with gold divider, **When** title is rendered, **Then** all elements remain properly proportioned and readable

---

### User Story 3 — Scores Page Card Consistency & Visibility (Priority: P1)

The Scores page currently organizes cards by day (Monday, Tuesday, Wednesday, Friday) in a 4-column layout on desktop. However, card sizing is inconsistent when different numbers of games appear in each day, creating visual irregularity. Additionally, the current column widths can be cramped, making card content harder to read. The card visual design (ScoreCard component) is well-established and provides good contrast, but the container layout needs refinement to ensure all cards render at uniform, readable sizes.

**Why this priority**: The Scores page is a high-traffic user destination. Consistent card sizing and readable column widths directly impact usability. This establishes a reusable card pattern for future features (e.g., Teams fixtures, game details).

**Independent Test**: Can be tested by visiting the Scores page and verifying that (a) all cards within each day column maintain consistent height and width, (b) columns are wide enough for card content (teams, score, time, venue) to render without truncation, (c) the overall grid layout feels balanced and professional across desktop and mobile viewports.

**Acceptance Scenarios**:

1. **Given** user visits the Scores page, **When** page loads on desktop (1024px+), **Then** the grid displays 4 equal-width columns (one per day: Monday, Tuesday, Wednesday, Friday)
2. **Given** cards are rendered within a day column, **When** viewing multiple cards, **Then** all cards in that column have identical height and width (uniform card sizing)
3. **Given** user views the day columns, **When** comparing columns, **Then** all columns occupy equal width and spacing across the desktop layout
4. **Given** user views a ScoreCard, **When** the card is rendered, **Then** the card displays: competition label, result badge/court pill, teams with score, date, time, and venue without text truncation
5. **Given** user views the page on tablet (640px–1024px), **When** the grid renders, **Then** the layout switches to 2 columns with appropriate spacing and card sizing
6. **Given** user views the page on mobile (< 640px), **When** the grid renders, **Then** cards stack in a single column and remain readable

---

### User Story 4 — Card Pattern Consistency Between Scores & Teams (Priority: P1)

As future features introduce more card-based layouts (Teams fixtures on detail pages, game details modals, etc.), the Scores page ScoreCard component establishes the authoritative design pattern. The Teams page tiles (created in COA-18) should visually align with Scores cards in: border styling, shadow treatment, hover states, and spacing. This ensures the codebase has a consistent, reusable card vocabulary.

**Why this priority**: Establishing a shared card pattern early prevents design fragmentation and reduces implementation time for future features. The ScoreCard is production-tested; Teams tiles should reflect the same visual language.

**Independent Test**: Can be tested by viewing Teams and Scores pages side-by-side and verifying that cards use consistent styling: border, shadow, rounded corners, padding, hover effects, and color treatments.

**Acceptance Scenarios**:

1. **Given** user views Teams tiles and Scores cards, **When** comparing styling, **Then** both use identical border color, weight, and rounded-corner radius
2. **Given** user hovers over a Teams tile or Scores card, **When** the hover effect triggers, **Then** both use the same shadow elevation and transition timing
3. **Given** tiles and cards are rendered, **When** inspecting spacing, **Then** internal padding (px/py values) is consistent across both components
4. **Given** a Scores card displays a win result (gold background), **When** the card is rendered, **Then** the result badge styling matches the brand color palette and contrast standards used elsewhere

---

### User Story 5 — Clean Resources Page (Priority: P2)

The Resources page currently displays a `dot.walk` element (decorative background shape) in the hero section that appears on no other page in the site. This element creates visual inconsistency with the standard hero pattern used across Teams, About, Scores, and other pages. Removing it aligns Resources with the site's visual grammar.

**Why this priority**: This is a quick visual cleanup that improves consistency. Lower priority than core spacing and card uniformity issues but straightforward to implement.

**Independent Test**: Can be tested by visiting the Resources page and confirming that the hero section matches the pattern used on other pages (single centered element with gold divider, no extra decorative shapes).

**Acceptance Scenarios**:

1. **Given** user visits the Resources page, **When** page loads, **Then** the hero section contains only: a gold subtitle, main heading "PHOENIX RESOURCES", gold divider, and descriptive text—no extra decorative `dot.walk` element
2. **Given** user views other pages with hero sections (Teams, About, Scores), **When** comparing Resources, **Then** all hero sections use identical visual treatment and spacing

---

### User Story 6 — Contact Page Section Spacing (Priority: P2)

The Contact page currently has excessive vertical spacing between the Contact Cards section (address, email, social) and the Leadership/Committee section below. This creates a visual disconnect that suggests the sections are unrelated. Reducing the gap improves visual flow and coherence.

**Why this priority**: While important for visual cohesion, this is a refinement issue. The page is functional; this improves perceived polish. The adjustment is straightforward and does not require layout restructuring.

**Independent Test**: Can be tested by visiting the Contact page and observing the vertical spacing between the two sections. After changes, the page should feel more visually connected.

**Acceptance Scenarios**:

1. **Given** user visits the Contact page, **When** page loads, **Then** the vertical gap between Contact Cards and the next section is visually reduced compared to current state
2. **Given** user scrolls through the page, **When** viewing the transition between sections, **Then** the layout feels cohesive without orphaning content

---

### Edge Cases

- Mobile viewport: Ensure reduced title padding remains readable and maintains appropriate visual hierarchy on small screens (< 640px).
- Day columns on Scores page with varying card counts: All cards should maintain uniform sizing even when some days have more games than others.
- ScoreCard with long venue or team names: Ensure truncation and overflow handling remains consistent with current ScoreCard design.
- Teams tiles with long names or multiple pills: Verify pill wrapping and tile sizing remains consistent (already addressed in COA-18 spec).
- Hero sections with and without descriptive text: All title sections should render cleanly whether text is present or absent.

## Requirements

### Functional Requirements

- **FR-001**: System MUST display consistent 1-line descriptive text in all purple hero/title sections across these pages: Teams, About, Scores, Seasons, Contact, Get Involved, and Resources
- **FR-002**: System MUST reduce vertical padding on all hero sections from `py-16` to `py-8` on desktop; mobile padding (`py-12`) remains appropriate for smaller viewports
- **FR-003**: System MUST NOT display any decorative `dot.walk` background elements in the Resources page hero section
- **FR-004**: System MUST render Scores page day-columns with 4 equal-width columns on desktop (1024px+), 2 columns on tablet (640px–1024px), and 1 column on mobile (< 640px)
- **FR-005**: System MUST render all ScoreCards within each day column at uniform height and width, regardless of content variation
- **FR-006**: System MUST apply consistent card styling (border, shadow, rounded corners, padding, hover states) across ScoreCard and Teams tile components
- **FR-007**: System MUST reduce vertical spacing between Contact Cards section and the next section on the Contact page by at least 50% from current state
- **FR-008**: System MUST maintain consistent padding and spacing across responsive breakpoints (mobile, tablet, desktop) on all affected pages

### Non-Functional Requirements

- **NFR-001**: All hero sections MUST render with consistent visual hierarchy: subtitle (gold, smaller), main heading (large, uppercase, white), gold divider, and optional descriptive text below
- **NFR-002**: Card styling across Scores and Teams pages MUST use Tailwind classes consistently: `rounded-xl` (corners), `shadow-sm` (default), `card-hover` (hover effect), `border border-gray-100` (borders)
- **NFR-003**: All spacing adjustments MUST maintain proper contrast, readability, and accessibility standards (WCAG 2.1 AA minimum)
- **NFR-004**: Layout changes MUST not introduce any horizontal scrolling or content overflow on mobile viewports

### Key Entities

- **Hero/Title Section**: Purple background component with subtitle, heading, gold divider, and optional descriptive text. Appears at top of: Teams, About, Scores, Seasons, Contact, Get Involved, Resources pages. Current state: inconsistent padding; some pages missing descriptive text.
- **ScoreCard**: Individual game result card displaying: competition label, result badge/court pill, teams with scores, date, time, venue. Used on Scores page within day-based columns. Current state: good design pattern established; needs container layout refinement.
- **Teams Tile**: Individual team card on Teams listing page displaying: team name, Division pill, Game Night pill, Boys/Girls pill. Current state: consistent styling established in COA-18; needs alignment with ScoreCard pattern.
- **Day Column Container**: Grid container on Scores page organizing cards by day (Monday, Tuesday, Wednesday, Friday). Current state: column widths and card sizing need uniformity.

## Success Criteria

- **SC-001**: All hero sections across all pages display identical vertical padding: `py-8` (desktop), `py-12` (mobile)
- **SC-002**: Teams, About, Scores, Seasons, Contact, Get Involved, and Resources pages all display 1-line descriptive text in their hero sections
- **SC-003**: Scores page day columns render at equal width on desktop (4 columns), tablet (2 columns), mobile (1 column) with consistent spacing between columns
- **SC-004**: All ScoreCards within each Scores day column render at identical height and width, regardless of content variation (within 1px tolerance for layout rounding)
- **SC-005**: Resources page renders with no decorative background elements in the hero section; hero matches the pattern used on other pages
- **SC-006**: Contact page vertical spacing between Contact Cards and next section is reduced by at least 50% from current state, creating visual cohesion
- **SC-007**: Card styling consistency verified: ScoreCard and Teams tiles both use `rounded-xl border border-gray-100 shadow-sm` and matching hover effects
- **SC-008**: All pages pass visual regression testing at 320px, 640px, 1024px, and 1440px viewports; no horizontal scrolling or text truncation introduced
- **SC-009**: All contrast and accessibility standards (WCAG 2.1 AA) remain met after spacing and color adjustments

---

## Acceptance Criteria

1. **Given** user visits Teams, About, or Scores pages, **When** page loads, **Then** the hero section displays: gold subtitle (tracking-widest, small), main heading in uppercase, gold divider, and 1-line descriptive text below
2. **Given** user compares hero sections across Teams, About, Scores, Seasons, Contact, Get Involved, and Resources, **When** viewing pages, **Then** all hero sections display identical padding: `py-8` (desktop), `py-12` (mobile)
3. **Given** user views the Scores page on desktop (1024px+), **When** page loads, **Then** the grid displays 4 equal-width columns for Monday, Tuesday, Wednesday, and Friday
4. **Given** multiple ScoreCards are rendered within a Scores day column, **When** page displays, **Then** all cards in that column have identical height and width
5. **Given** user resizes viewport from desktop to tablet (640px–1024px), **When** layout reflows, **Then** Scores page grid switches to 2 columns and cards remain uniform
6. **Given** user resizes viewport to mobile (< 640px), **When** layout reflows, **Then** Scores page grid displays 1 column and cards remain readable
7. **Given** user views a ScoreCard and a Teams tile, **When** comparing styling, **Then** both components use identical border (gray-100), shadow (shadow-sm), rounded corners (rounded-xl), and hover effects
8. **Given** user visits the Resources page hero section, **When** page loads, **Then** no `dot.walk` or extra decorative elements are visible; hero matches other pages' pattern
9. **Given** user scrolls through the Contact page, **When** viewing the transition from Contact Cards to the next section, **Then** the vertical spacing is visibly reduced and the page feels cohesive
10. **Given** user views any affected page on a 320px mobile viewport, **When** page loads, **Then** content remains readable with no horizontal scrolling or truncation
11. **Given** user views any affected page on a 1440px desktop viewport, **When** page loads, **Then** layout is balanced with appropriate spacing and no overflowing content
12. **Given** all visual changes are implemented, **When** pages render, **Then** all WCAG 2.1 AA contrast and accessibility standards are maintained

---

## Constitutional Compliance

- **Principle I (User Outcomes First)**: PASS. Each user story has a clear, measurable outcome tied to user experience and brand perception. Success criteria are observable and testable (e.g., card sizing uniformity, spacing reduction, visual consistency).

- **Principle II (Test-First Discipline)**: PASS. All acceptance scenarios are in Given/When/Then format and are independently testable at the component and page levels. P1 and P2 stories are independently shippable.

- **Principle III (Backend Authority & Invariants)**: PASS. This is a frontend-only visual refinement feature. No backend changes; all mutations are purely CSS/styling adjustments that do not alter data models or invariants.

- **Principle IV (Error Semantics & Observability)**: PASS. No error handling required for this feature. Changes are purely visual and do not introduce new failure modes. Existing error states (empty Scores page, no teams match filter) are unaffected.

- **Principle V (AppShell Integrity)**: PASS. All changes are constrained to existing pages within BaseLayout.astro. No new custom navigation shells or layout structures introduced. Hero sections, grid layouts, and card components remain within the established AppShell structure.

- **Principle VI (Accessibility First)**: PASS. All spacing and styling changes maintain or improve accessibility: WCAG 2.1 AA contrast standards are preserved, tap targets remain > 44px, keyboard navigation is unaffected, focus indicators remain visible. Grid column changes on mobile maintain readability.

- **Principle VII (Immutable Data Flow)**: PASS. This feature does not modify data flow, state management, or data structures. All changes are visual presentation only. No client-side data inference or calculation introduced.

- **Principle IX (Cross-Feature Consistency)**: PASS. Changes establish and enforce consistency: standardized hero sections across all pages, unified card styling (ScoreCard + Teams tiles), consistent spacing patterns. No new patterns introduced; all changes conform to existing conventions.

---

## Open Questions

None. This spec is complete and ready for implementation. All spacing values, affected pages, card styling rules, and responsive breakpoints are explicitly defined.
