# Feature Specification: Footer Update

**Feature Branch**: `cameronwalsh/coa-42-footer-update`  
**Created**: 2026-04-10  
**Status**: Draft  
**Input**: User description: "Need to add the email octopus email collector to the footer of the site. Replace quick links section with the email form, update tagline, copyright, add logo, and update links."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Email Newsletter Signup Integration (Priority: P1)

Visitors can subscribe to the Phoenix newsletter directly from the footer without leaving the site. The Email Octopus form replaces the "Quick Links" section, maintaining the 4-column layout and providing a clear, accessible signup experience.

**Why this priority**: Email collection is a core business requirement for community engagement and marketing. This is the primary change driving the footer redesign and delivers immediate value by capturing leads.

**Independent Test**: Can be fully tested by loading the footer, verifying the Email Octopus form displays correctly, submitting a test email, and confirming it's received by the Email Octopus account. Works independently from other footer changes.

**Acceptance Scenarios**:

1. **Given** the footer is loaded, **When** a visitor views the page, **Then** the Email Octopus signup form displays in the newsletter section (column 3 or 4 in the 4-column layout)
2. **Given** a visitor enters a valid email address, **When** they click "SUBSCRIBE", **Then** the form submission succeeds and Email Octopus receives the signup
3. **Given** the Email Octopus script is embedded, **When** the page loads, **Then** no JavaScript errors occur and the form renders without layout shift
4. **Given** the form is visible, **When** viewed on mobile, **Then** it remains accessible and readable (responsive design)

---

### User Story 2 - Updated Branding & Copyright Information (Priority: P1)

The footer reflects current organizational identity and legal requirements with accurate copyright dates, updated tagline, and proper company name.

**Why this priority**: Legal compliance and brand consistency are essential. Outdated copyright and incorrect company information undermine credibility and may create compliance issues. This must ship with the Email Octopus integration.

**Independent Test**: Can be fully tested by inspecting the footer text, verifying all copy matches specification, checking that links resolve correctly, and confirming visual consistency with brand colors.

**Acceptance Scenarios**:

1. **Given** the footer is rendered, **When** inspecting the copyright text, **Then** it displays exactly: "© Phoenix United Basketball Development Club Inc. 2003 - 2026 All rights reserved"
2. **Given** the footer is displayed, **When** reading the tagline, **Then** it shows: "Where Community Meets Competition. Proudly serving basketball in Bendigo."
3. **Given** the footer contains a link to Bendigo Basketball, **When** clicking "compete in the Bendigo Basketball Association", **Then** it navigates to https://bendigobasketball.com.au/ in a new tab
4. **Given** the footer text is present, **When** inspecting CSS, **Then** all text uses brand colors (purple #573F93 for primary, gold #8B7536 for accents, off-white #F4F5F7 for text)

---

### User Story 3 - Logo Branding in Footer (Priority: P2)

The Phoenix United logo replaces the text "P" in the footer, establishing stronger visual brand identity and consistency with site design.

**Why this priority**: Visual branding reinforces identity and professionalism. This is important for the overall redesign but does not block the primary Email Octopus signup functionality. Can be refined post-MVP if needed.

**Independent Test**: Can be fully tested by verifying the logo displays correctly at appropriate size, maintains aspect ratio, and is clickable (if intended to link to home page). Works independently from email integration.

**Acceptance Scenarios**:

1. **Given** the footer renders, **When** looking at the footer branding area, **Then** the Phoenix United logo displays instead of a text "P"
2. **Given** the logo is visible, **When** inspecting dimensions, **Then** it is appropriately sized (recommended 60-80px height) to fit footer proportions
3. **Given** the logo is displayed, **When** clicked, **Then** it navigates to the home page (if intended) or is marked as decorative (no click handler if not)
4. **Given** the footer loads on different screen sizes, **When** viewing on mobile/tablet/desktop, **Then** the logo scales responsively and remains visible

---

### User Story 4 - Logo Branding in Header (Priority: P3)

The Phoenix United logo is added to the header/navigation, replacing or complementing any existing "P" text element. This establishes consistent visual branding across the entire site.

**Why this priority**: Header logo branding is important for professional appearance and navigation consistency, but can be addressed as a follow-up task. This is explicitly noted as a potential sub-task and does not block the footer work.

**Independent Test**: Can be fully tested by verifying the header logo displays, scales correctly, and functions as a clickable home link.

**Acceptance Scenarios**:

1. **Given** the header is rendered, **When** viewing the navigation area, **Then** the Phoenix United logo is visible in the site header
2. **Given** the logo is in the header, **When** clicked, **Then** it navigates to the home page
3. **Given** the header is displayed on all pages, **When** checking consistency, **Then** the logo appears on every page with the same styling and position

---

### Edge Cases

- What happens if the Email Octopus form fails to load (network error, script blocked)? → Display a fallback message or link to email signup alternative
- How does the footer render if the logo image fails to load? → Display a text fallback or placeholder
- What happens on very small screens (mobile, < 320px)? → Footer columns stack vertically, form remains usable
- How should the form behave if a user has JavaScript disabled? → Form should either fail gracefully with a link to signup or provide a no-JS fallback

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST embed and render the Email Octopus signup form using the provided script tag (form ID: `11c550ac-11dc-11f1-a2e0-ef681a07d4a5`)
- **FR-002**: System MUST display the form in a dedicated footer section, maintaining a 4-column layout structure
- **FR-003**: System MUST include the updated tagline: "Where Community Meets Competition. Proudly serving basketball in Bendigo."
- **FR-004**: System MUST display the copyright text: "© Phoenix United Basketball Development Club Inc. 2003 - 2026 All rights reserved"
- **FR-005**: System MUST render the "compete in the Bendigo Basketball Association" text as a clickable link to https://bendigobasketball.com.au/
- **FR-006**: System MUST display the Phoenix United logo (phoenix-logo.svg or similar) in the footer branding area, replacing the text "P"
- **FR-007**: System MUST include the Phoenix United logo in the header/navigation area as a clickable home page link
- **FR-008**: System MUST maintain responsive design; footer columns stack on mobile, form remains usable on all screen sizes
- **FR-009**: System MUST preserve existing footer sections (address, email contact, social links) with updated styling if needed
- **FR-010**: System MUST use brand colors consistently: primary purple (#573F93), gold accents (#8B7536), black (#111111), off-white (#F4F5F7), white

### Key Entities *(include if feature involves data)*

- **Email Subscriber**: Represents a user who has submitted their email through the Email Octopus form; stored in Email Octopus system, not directly in our database
- **Footer Configuration**: Defines the layout, text content, links, and embedded forms for the site footer; includes column structure, copyright text, and social links
- **Branding Asset**: Phoenix United logo (SVG or PNG); used in both header and footer; should support both light and dark background variants if applicable

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Email Octopus form successfully collects email signups with zero JavaScript errors in browser console
- **SC-002**: Email Octopus dashboard confirms successful form submissions and email delivery
- **SC-003**: Footer displays all required text (tagline, copyright, links) with exact wording and proper formatting
- **SC-004**: Phoenix United logo displays correctly in footer and header on all tested screen sizes (mobile: 320px+, tablet: 768px+, desktop: 1024px+)
- **SC-005**: External link to Bendigo Basketball Association resolves and opens correctly
- **SC-006**: Footer layout maintains 4-column structure on desktop; columns stack vertically on mobile with no horizontal overflow
- **SC-007**: Page load time does not increase by more than 100ms due to Email Octopus script injection
- **SC-008**: 100% of footer text matches the specification exactly (no typos, correct formatting)
