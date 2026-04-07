# Spec: COA-23 — Homepage, Contact & Footer Cleanup

**Status**: IN_DESIGN
**Sources**:
- https://linear.app/coachcw/issue/COA-23/welcome-to-the-phoenix-family-section
- https://linear.app/coachcw/issue/COA-31/contact-us
- https://linear.app/coachcw/issue/COA-32/footer-menu
**Priority**: Urgent

---

## Summary

This feature bundles three small UI cleanup changes across the Bendigo Phoenix website. First, the "Welcome to the Phoenix Family" section on the homepage is removed so the score tracker section immediately follows the hero/intro content without an intermediate welcome block. Second, the Contact Us page is simplified — the "Find Us" section is removed entirely, and the email contacts list is updated to include General Enquiries, President, and Treasurer addresses. Third, the site footer is restructured from 3 columns to 4 columns by promoting "Quick Links" from a secondary line beneath "Follow Us" into its own dedicated fourth column. No new pages, routes, or data sources are introduced — all changes are UI layout and content edits only.

---

## User Scenarios & Testing

### User Story 1 — Remove Welcome Section from Homepage (Priority: P1)

As a site visitor, I want the homepage to transition directly from the intro into the score tracker, so I can access current scores without scrolling past an unnecessary welcome block.

**Why P1**: The section is explicitly flagged for removal. Its presence creates friction between the hero and the score tracker — the primary dynamic content on the page.

**Independent Test**: Load the homepage and verify there is no "Welcome to the Phoenix Family" heading or associated section content visible anywhere on the page. Confirm the score tracker renders as the next section after the header/hero.

**Acceptance Scenarios**:
1. Given a visitor loads the homepage,
   When they scroll past the hero/header area,
   Then they do not see a "Welcome to the Phoenix Family" section or any heading/content that was part of that block.

2. Given the welcome section has been removed,
   When a visitor loads the homepage,
   Then the score tracker section renders as the immediately following section with correct spacing and no layout gaps.

---

### User Story 2 — Update Contact Us Page (Priority: P1)

As a site visitor, I want the Contact Us page to show relevant email contacts without a confusing "Find Us" section, so I can quickly find the right contact for my enquiry.

**Why P1**: The page has a broken information architecture — "Find Us" doesn't add value and the email contacts are incomplete.

**Independent Test**: Load the Contact Us page and verify: (1) no "Find Us" section is visible, (2) three email addresses are listed — General Enquiries, President, and Treasurer.

**Acceptance Scenarios**:
1. Given a visitor loads the Contact Us page,
   When they view the page,
   Then there is no "Find Us" section or any associated location/map content.

2. Given a visitor loads the Contact Us page,
   When they view the email contact list,
   Then they see three entries: "General Enquiries" (hello@...), "President" (president@bendigophoenix.org.au), and "Treasurer" (treasurer@bendigophoenix.org.au).

3. Given the "Find Us" section is removed,
   When a visitor views the Contact Us page,
   Then the remaining content (email section) renders with correct spacing and no layout gaps.

---

### User Story 3 — Restructure Footer to 4 Columns (Priority: P1)

As a site visitor, I want the footer to have four clearly distinct columns including a Quick Links column, so I can easily navigate to key sections from the footer.

**Why P1**: The current footer misrepresents the information hierarchy — Quick Links is buried as a secondary row under Follow Us, which makes it hard to find and visually cluttered.

**Independent Test**: Load any page and inspect the footer — verify it renders 4 equal columns: one for each of the expected groups (e.g., About/Logo, Quick Links, Follow Us, and one other), with Quick Links as a standalone column, not nested beneath Follow Us.

**Acceptance Scenarios**:
1. Given a visitor views the footer on any page,
   When they look at the footer layout,
   Then the footer renders as 4 columns, not 3.

2. Given a visitor views the footer,
   When they look for Quick Links,
   Then Quick Links appears as its own dedicated column — not as a secondary row beneath "Follow Us".

3. Given the footer is restructured to 4 columns,
   When viewed on desktop,
   Then all four columns are horizontally aligned with consistent spacing.

4. Given the footer is restructured to 4 columns,
   When viewed on a mobile/handheld device,
   Then the columns stack appropriately without broken layout.

---

### Edge Cases

- Removing the welcome section must not leave an orphaned spacer, divider, or padding block that creates a visual gap on the homepage.
- Score tracker must render correctly as the immediate successor section — verify its top margin/padding doesn't assume a preceding welcome section.
- Contact page "Find Us" removal must not break surrounding layout (check surrounding section containers for dependent spacing).
- Email links on Contact page must use `mailto:` anchors and not be plain text.
- Footer 4-column restructure must not overflow on mid-size viewports (tablet range) — verify at common breakpoints.
- Quick Links items must be preserved exactly; only their column placement changes.
- No footer content should be lost during restructure — only layout changes.

---

## Requirements

### Functional Requirements

- FR-001: System MUST remove the "Welcome to the Phoenix Family" section from the homepage.
- FR-002: System MUST ensure the score tracker section renders immediately after the preceding homepage section with no orphaned layout elements.
- FR-003: System MUST remove the "Find Us" section from the Contact Us page.
- FR-004: System MUST display three email contacts on the Contact Us page: General Enquiries (hello@bendigophoenix.org.au or equivalent), President (president@bendigophoenix.org.au), and Treasurer (treasurer@bendigophoenix.org.au).
- FR-005: Email contacts MUST be rendered as clickable `mailto:` links, not plain text.
- FR-006: System MUST restructure the footer from 3 columns to 4 columns.
- FR-007: System MUST render Quick Links as a standalone fourth column in the footer — not as a secondary row beneath "Follow Us".
- FR-008: System MUST NOT remove or reorder any existing Quick Links items — only their column placement changes.
- FR-009: System MUST NOT alter any footer content other than the column layout restructure.
- FR-010: System MUST NOT introduce any new pages, routes, or data sources.
- FR-011: System MUST remove the existing single email link and descriptive paragraph from the Email card before adding the three labelled contacts.

### Non-Functional Requirements

- NFR-001: All changes MUST preserve existing responsive behaviour — handheld and desktop layouts must render without broken elements.
- NFR-002: Footer MUST render 4 columns at desktop (≥1024px), 2 columns at tablet (768px–1023px), and 1 column at mobile (<768px).
- NFR-003: All interactive elements (email links, footer nav links) MUST remain keyboard accessible.
- NFR-004: Removed sections MUST NOT leave orphaned HTML containers, spacers, or dividers in the DOM.
- NFR-005: Changes MUST follow existing Astro/Tailwind code patterns in the codebase.

### Key Entities

- **Homepage**: The root page (`/`) containing the welcome section and score tracker.
- **WelcomeSection**: The "Welcome to the Phoenix Family" content block to be removed.
- **ScoreTracker**: The section that must render as the immediate successor on the homepage.
- **ContactPage**: The Contact Us page containing the "Find Us" section and email list.
- **FindUsSection**: The section on the Contact Us page to be removed.
- **EmailContacts**: The list of email addresses (General Enquiries, President, Treasurer) on Contact Us.
- **Footer**: The global site footer component containing columns including Quick Links and Follow Us.
- **QuickLinksColumn**: The footer column currently misplaced — to be promoted to a standalone 4th column.

---

## Success Criteria

- SC-001: Homepage shows no "Welcome to the Phoenix Family" section.
- SC-002: Contact Us page shows no "Find Us" section.
- SC-003: Contact Us page shows exactly three email contacts: General Enquiries, President, Treasurer — all as mailto links.
- SC-004: Footer renders 4 columns on desktop.
- SC-005: Quick Links is a standalone footer column, not nested under "Follow Us".
- SC-006: Footer layout is responsive — 4 columns at desktop, 2 at tablet, 1 at mobile.
- SC-007: No existing footer content (links, text) is lost or reordered.

---

## Acceptance Criteria

- AC-001: Given a visitor loads the homepage, Then no "Welcome to the Phoenix Family" heading or section content is visible.
- AC-002: Given the welcome section is removed, Then the score tracker section renders immediately after the preceding section with no orphaned containers or spacing gaps.
- AC-003: Given a visitor loads the Contact Us page, Then no "Find Us" section is visible.
- AC-004: Given a visitor loads the Contact Us page, Then three email contacts are displayed: General Enquiries, President, and Treasurer.
- AC-005: Given a visitor clicks an email contact on the Contact Us page, Then a mailto link is triggered (not a broken link or plain text).
- AC-006: Given a visitor views the footer on any page on desktop, Then the footer renders as 4 horizontal columns.
- AC-007: Given a visitor views the footer, Then "Quick Links" is a standalone column — not a secondary row under "Follow Us".
- AC-008: Given a visitor views the footer on a handheld device, Then the footer columns stack correctly without overflow or broken layout.
- AC-009: Given the footer restructure is complete, Then all existing Quick Links items are present and unchanged — only their layout position has changed.
- AC-010: Given the footer is restructured to 4 columns, Then the Follow Us column still contains all existing social links (Facebook, Instagram) with correct hrefs.

---

## Constitutional Compliance

- ✅ User Outcomes: Each user story has explicit, measurable acceptance scenarios.
- ✅ Test-First: All ACs are independently testable and observable via browser inspection.
- ✅ Backend Authority: Not applicable — all changes are frontend/static site UI edits with no backend involvement.
- ✅ AppShell: Changes maintain existing layout structures — no custom navigation shells introduced.
- ✅ Identity Boundary: Not applicable — no user authentication or identity management involved.
- ✅ Accessibility: NFR-003 addresses keyboard accessibility; FR-005 ensures email links are proper anchors.
- ✅ Responsive: NFR-001 and NFR-002 explicitly require responsive layout verification at all breakpoints.
- ✅ Immutable Data: Not applicable — no data mutation concerns for static content changes.
- ⚠️ Orphaned DOM: FR-009 and NFR-004 guard against leftover containers from removed sections — implement agent must verify DOM is clean after removal.
