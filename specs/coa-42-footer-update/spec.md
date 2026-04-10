# Spec: COA-42 — Footer Update & Email Octopus Integration

**Status**: READY_FOR_DEV
**Source**: Linear Issue COA-42
**Priority**: High
**Feature Branch**: `cameronwalsh/coa-42-footer-update`
**Created**: 2026-04-10

## Summary

Redesign the site footer to integrate Email Octopus newsletter signup, update copyright and branding text, display the Phoenix United logo in the footer and header, and maintain responsive 4-column layout. The Email Octopus integration handles form submission backend; this spec focuses on form display, validation feedback, and user-visible behavior. All footer content updates reflect current organizational identity (Phoenix United Basketball Development Club Inc.) and establish visual consistency across the site.

---

## User Scenarios & Testing

### User Story 1 — Email Newsletter Signup Form Display (Priority: P1)

Visitors can subscribe to the Phoenix newsletter directly from the footer without leaving the site. The Email Octopus form displays in a dedicated footer section, maintaining the 4-column layout and providing a clear, accessible signup experience.

**Why this priority**: Email collection is a core business requirement for community engagement and marketing. This is the primary change driving the footer redesign and delivers immediate value by capturing leads.

**Independent Test**: Load the footer, verify the Email Octopus form renders with visible input field and submit button, enter a test email, click SUBSCRIBE, and confirm form submission completes without JavaScript errors. Works independently from other footer changes.

**Acceptance Scenarios**:

1. Given the footer loads on any page, When a visitor views the page, Then the Email Octopus signup form displays in the newsletter section with visible email input and SUBSCRIBE button
2. Given a visitor focuses the email input field, When they type a valid email address, Then the input accepts the value without validation errors
3. Given a visitor enters an email and clicks SUBSCRIBE, When the form submission completes, Then Email Octopus receives the signup (confirmed by Email Octopus dashboard) and the form displays a success message or clears for new input
4. Given the form is visible on mobile, When viewing on handheld devices (320px - 767px), Then the input and button remain accessible and usable without horizontal overflow
5. Given the page loads, When inspecting the browser console, Then no JavaScript errors occur related to the Email Octopus script or form rendering

---

### User Story 2 — Updated Copyright & Organizational Branding (Priority: P1)

The footer reflects current organizational identity and legal requirements with accurate copyright dates, updated tagline, and proper company name.

**Why this priority**: Legal compliance and brand consistency are essential. Outdated copyright and incorrect company information undermine credibility and may create compliance issues.

**Independent Test**: Inspect the footer text and verify copyright statement, tagline, and company name match specification exactly. Check that all text displays with correct formatting and brand colors.

**Acceptance Scenarios**:

1. Given the footer is rendered, When inspecting the copyright text, Then it displays exactly: "© Phoenix United Basketball Development Club Inc. 2003 - 2026 All rights reserved"
2. Given the footer is displayed, When reading the tagline, Then it shows: "Where Community Meets Competition. Proudly serving basketball in Bendigo."
3. Given the footer contains navigation links, When reading link labels, Then "compete in the Bendigo Basketball Association" is present as a clickable link
4. Given the footer is viewed, When clicking the Bendigo Basketball Association link, Then it navigates to https://bendigobasketball.com.au/ in a new browser tab with no JavaScript errors

---

### User Story 3 — Footer Logo Branding (Priority: P2)

The Phoenix United logo displays in the footer branding area, replacing any text placeholder and establishing stronger visual brand identity.

**Why this priority**: Visual branding reinforces identity and professionalism. Important for the overall redesign but does not block the primary Email Octopus signup functionality.

**Independent Test**: Verify the logo displays in the footer at correct size, maintains aspect ratio, and scales appropriately on different screen sizes. Confirm no image loading errors occur.

**Acceptance Scenarios**:

1. Given the footer renders, When looking at the footer branding area, Then the Phoenix United logo displays instead of any text "P" placeholder
2. Given the logo is visible, When inspecting dimensions, Then the logo height is 60–80px and maintains proper aspect ratio (no distortion)
3. Given the footer loads on different screen sizes, When viewing on mobile (320px–767px), tablet (768px–1023px), and desktop (1024px+), Then the logo scales responsively and remains fully visible
4. Given the logo image asset exists, When the page loads, Then no broken image indicators appear and the browser console shows no asset loading errors

---

### User Story 4 — Header Logo Branding (Priority: P3 / In-Scope)

The Phoenix United logo is added to the header/navigation area, replacing or complementing any existing "P" text element and establishing consistent visual branding across the entire site.

**Why this priority**: Header logo branding is important for professional appearance and navigation consistency. Included in COA-42 scope to complete visual branding work but can be refined in follow-up iterations if needed.

**Independent Test**: Verify the header logo displays on all pages, scales correctly on all screen sizes, and functions as a clickable home link.

**Acceptance Scenarios**:

1. Given the header is rendered on any page, When viewing the navigation area, Then the Phoenix United logo is visible
2. Given the logo is in the header, When clicking it, Then it navigates to the home page (/) without JavaScript errors
3. Given the header is displayed on multiple pages, When checking consistency, Then the logo appears with identical styling and position on every page
4. Given the header is viewed on mobile, tablet, and desktop, When checking layout, Then the logo scales appropriately and does not cause navigation overflow

---

### Edge Cases

- **Email Octopus script fails to load** (network error, script blocked by security policy): Form input and button display, but submission attempt shows a user-visible error or fallback message (e.g., "Form unavailable. Please email directly to [address]."). No silent failures.
- **Logo image asset fails to load**: Display a text fallback (e.g., "Phoenix" or abbreviated "PU") with same styling instead of broken image indicator.
- **Very small screens (< 320px)**: Footer columns stack into single column, form input and button remain usable with no horizontal overflow.
- **User has JavaScript disabled**: Email Octopus form will not function (Email Octopus requires JavaScript). Provide a visible fallback email link with `mailto:` in the footer so users can subscribe by email if JavaScript is unavailable.
- **Form submission timeout or network latency**: Display a loading state (spinner or "Submitting...") during submission, then show success message or error state clearly.
- **Invalid email submitted**: Email Octopus validates on submission. System displays validation error message from Email Octopus without silent rejection.
- **User submits same email multiple times**: Email Octopus handles deduplication; form allows resubmission, Email Octopus backend decides whether to add or ignore duplicate.

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST embed the Email Octopus form script tag in the footer component using form ID `11c550ac-11dc-11f1-a2e0-ef681a07d4a5`. Email Octopus JavaScript handles all form submission logic.
- **FR-002**: System MUST display the Email Octopus form in a dedicated footer section, maintaining a 4-column layout structure where the form occupies one column.
- **FR-003**: System MUST display the updated tagline: "Where Community Meets Competition. Proudly serving basketball in Bendigo."
- **FR-004**: System MUST display the copyright text: "© Phoenix United Basketball Development Club Inc. 2003 - 2026 All rights reserved"
- **FR-005**: System MUST render the text "compete in the Bendigo Basketball Association" as a clickable link to https://bendigobasketball.com.au/ with `target="_blank"` and `rel="noopener noreferrer"`.
- **FR-006**: System MUST display the Phoenix United logo (file location: `/public/images/logos/phoenix-logo.png`) in the footer branding area, replacing any text placeholder.
- **FR-007**: System MUST display the Phoenix United logo in the header/navigation area as a clickable link to the home page (`/`).
- **FR-008**: System MUST maintain responsive footer layout: 4 columns on desktop (≥1024px), 2 columns on tablet (768px–1023px), 1 column on mobile (<768px). Form remains usable on all screen sizes.
- **FR-009**: System MUST preserve existing footer sections (address, email contact, social links) with styling aligned to brand colors and current design system.
- **FR-010**: System MUST use brand colors consistently throughout footer: primary purple (#573F93), gold accents (#8B7536), black (#111111), off-white (#F4F5F7), white (#FFFFFF).
- **FR-011**: System MUST display a fallback message or mailto link if Email Octopus script fails to load, allowing users to subscribe via email as an alternative.
- **FR-012**: System MUST display a text fallback (e.g., "Phoenix" or "PU") if the logo image asset fails to load, styled consistently with footer design.

### Non-Functional Requirements

- **NFR-001 (Accessibility)**: Email form input MUST have an associated `<label>` element (visible or `sr-only`). All interactive elements (form input, submit button, logo link, external links) MUST be keyboard accessible (Tab navigation, Enter to activate).
- **NFR-002 (Accessibility)**: Color contrast for all footer text and links MUST meet WCAG 2.1 AA standard (4.5:1 for body text, 3:1 for large text).
- **NFR-003 (Accessibility)**: Email Octopus form MUST be navigable via screen reader. Ensure form labels and button text are present in HTML, not just visual styling.
- **NFR-004 (Responsive Layout)**: Footer MUST render without horizontal overflow at any viewport width ≥ 320px. Test at breakpoints: 320px (mobile), 480px (small mobile), 768px (tablet), 1024px+ (desktop).
- **NFR-005 (Performance)**: Email Octopus script injection MUST not increase cumulative page load time by more than 100ms (measured from start of script load to form interactive). Monitor via browser DevTools and real-world measurements.
- **NFR-006 (Error Handling)**: All form submission errors MUST display actionable messages to the user (e.g., "Invalid email format" or "Network error. Try again or email us directly."). No silent failures or console-only errors.
- **NFR-007 (Brand Consistency)**: Logo asset is high-quality PNG. Maintain aspect ratio to prevent distortion.
- **NFR-008 (Security)**: External links (Bendigo Basketball Association) MUST include `target="_blank"` and `rel="noopener noreferrer"` to prevent reverse tabnabbing.
- **NFR-009 (DOM Hygiene)**: Footer component MUST not create orphaned containers, dividers, or padding that cause visual gaps if Email Octopus script fails.

### Key Entities

- **Phoenix United Logo**: PNG image asset (60–80px height recommended). Location: `/public/images/logos/phoenix-logo.png`. Used in both footer and header. Should maintain aspect ratio and remain visible on all screen sizes.
- **Email Octopus Form**: Embedded form widget controlled by Email Octopus JavaScript (form ID: `11c550ac-11dc-11f1-a2e0-ef681a07d4a5`). Submission handled entirely by Email Octopus; this spec defines only display and fallback behavior.
- **Footer Configuration**: Static content component containing copyright text, tagline, navigation links, social links, and embedded Email Octopus form. Updated for 4-column responsive layout.
- **Footer Layout**: Responsive grid: 4 columns on desktop, 2 on tablet, 1 on mobile. Columns: (1) Organization info + logo, (2) Quick Links, (3) Email Octopus form, (4) Social/Contact.
- **External Link**: Bendigo Basketball Association (https://bendigobasketball.com.au/) — opens in new tab with security attributes.

---

## Success Criteria

- **SC-001**: Email Octopus form renders in footer with visible input field and SUBSCRIBE button; no JavaScript errors in browser console.
- **SC-002**: Email Octopus dashboard confirms successful form submissions with correct email addresses.
- **SC-003**: Footer displays copyright text, tagline, and all links with exact wording and proper formatting (100% match to spec).
- **SC-004**: Phoenix United logo displays in footer and header on all tested screen sizes (320px, 480px, 768px, 1024px+) with correct dimensions (60–80px height) and no broken image indicators.
- **SC-005**: External Bendigo Basketball Association link resolves correctly and opens in new browser tab.
- **SC-006**: Footer layout renders 4 columns on desktop (1024px+), 2 columns on tablet (768px–1023px), 1 column on mobile (<768px) with no horizontal overflow.
- **SC-007**: Form submission does not increase page load time by more than 100ms.
- **SC-008**: All form submission errors display user-visible messages (no silent failures).
- **SC-009**: Footer remains fully functional and readable on handheld devices (<768px) without layout breakage.
- **SC-010**: All interactive footer elements (form, links, logo) are keyboard accessible and work with screen readers.

---

## Acceptance Criteria

### Form Display & Submission

1. Given the footer loads, When viewing the Email Octopus form section, Then the form displays with a visible email input field, placeholder text "Enter your email", and a "SUBSCRIBE" button.
2. Given a visitor enters a valid email (e.g., test@example.com), When they click SUBSCRIBE, Then the form submission completes without JavaScript errors and Email Octopus records the signup.
3. Given the form submission completes, When the user views the form, Then a success message appears (or form clears for new input) and the browser console shows no errors.
4. Given a visitor enters invalid email (e.g., "invalid" or blank), When they click SUBSCRIBE, Then Email Octopus validation error displays in the form (e.g., "Please enter a valid email").
5. Given the Email Octopus script fails to load, When the footer renders, Then a fallback message displays (e.g., "Form unavailable. Email us at..." with a mailto link) instead of a broken form.

### Copyright & Branding Text

6. Given the footer is rendered, When inspecting the copyright section, Then the text reads exactly: "© Phoenix United Basketball Development Club Inc. 2003 - 2026 All rights reserved"
7. Given the footer is displayed, When reading the tagline section, Then the text shows exactly: "Where Community Meets Competition. Proudly serving basketball in Bendigo."
8. Given the footer is viewed, When looking at navigation links, Then the link text "compete in the Bendigo Basketball Association" is present and clickable.

### Logo Display

9. Given the footer renders, When looking at the organization branding area, Then the Phoenix United logo displays (SVG or PNG) instead of a text "P".
10. Given the logo is visible in the footer, When inspecting its dimensions via browser DevTools, Then the height is between 60–80px and aspect ratio is maintained (no distortion).
11. Given the logo is visible on desktop (1024px+), When checking the header, Then the same Phoenix United logo displays in the navigation area.
12. Given the header logo is visible, When clicking it, Then it navigates to the home page (/) without errors.
13. Given the footer is viewed on mobile (320px–767px), When checking responsive layout, Then the logo scales proportionally and remains fully visible in single-column layout.
14. Given the logo image asset cannot be loaded, When the page renders, Then a text fallback displays (e.g., "Phoenix" or "PU") with footer styling instead of a broken image icon.

### Responsive Layout

15. Given the footer is viewed on desktop (≥1024px), When inspecting the layout, Then the footer renders as 4 horizontal columns with equal spacing.
16. Given the footer is viewed on tablet (768px–1023px), When inspecting the layout, Then the footer renders as 2 columns (stacked vertically or side-by-side as appropriate) with no overflow.
17. Given the footer is viewed on mobile (<768px), When inspecting the layout, Then all footer sections stack into a single column with no horizontal overflow and readable text size.
18. Given the Email Octopus form is in the footer, When viewing on mobile, Then the input field and SUBSCRIBE button stack vertically and remain fully usable.

### Links & External Navigation

19. Given the Bendigo Basketball Association link is visible, When clicking it, Then it opens https://bendigobasketball.com.au/ in a new browser tab (target="_blank" behavior).
20. Given the external link is clicked, When inspecting HTML, Then the link includes security attributes `rel="noopener noreferrer"` to prevent security vulnerabilities.

### Brand Colors & Accessibility

21. Given the footer is displayed, When inspecting text and link colors, Then primary text uses purple (#573F93) or off-white (#F4F5F7) with sufficient contrast for WCAG 2.1 AA compliance (4.5:1 for body text).
22. Given the footer is viewed, When navigating via keyboard (Tab key), Then all interactive elements (form input, button, links, logo) receive visible focus indicators and are reachable.
23. Given the Email Octopus form is displayed, When using a screen reader, Then the input field has an associated label (visible or `sr-only`) and the SUBSCRIBE button text is announced correctly.

---

## Responsive Breakpoint Specification

Aligned with COA-23 established breakpoints. Footer layout varies by screen width:

| Breakpoint | Width | Footer Layout | Logo Size |
|-----------|-------|---------------|-----------| 
| Mobile | <768px | 1 column (stacked) | Scale to fit |
| Tablet | 768px–1023px | 2 columns | Scale to fit |
| Desktop | ≥1024px | 4 columns | 60–80px height |

---

## Logo Asset Specification

**Current Status**: Logo asset location to be confirmed. Suggested location: `/public/images/logos/phoenix-logo.svg`

**Recommended Path**: `/public/images/logos/` — This aligns with existing codebase structure:
- `/public/images/events/` — Contains event images
- `/public/images/office-bearers/` — Contains office bearer photos
- New: `/public/images/logos/` — For organizational logos

**Asset Requirements**:
- **Format**: SVG (preferred) or PNG at 2x resolution (160–160px for 80px display)
- **Filename**: `phoenix-logo.svg` or `phoenix-united-logo.svg`
- **Aspect Ratio**: Maintain existing ratio (likely 1:1 or 2:3)
- **Color**: Should be self-contained or work on both light and dark backgrounds
- **Size**: SVG: no limit; PNG: optimized for web (< 50KB)

**Fallback**: If asset fails to load, display text "Phoenix" or "PU" styled identically to footer design.

---

## Email Octopus Integration Notes

Email Octopus form handling is owned by the Email Octopus JavaScript library. This spec defines only:
- Form display location and styling in the footer
- Fallback message if script fails to load
- User feedback during submission (success/error messages)
- Form accessibility (labels, keyboard navigation, screen reader support)

Email Octopus handles:
- Email validation
- Form submission to Email Octopus backend
- Deduplication and subscriber management
- Confirmation emails and automations

---

## Constitutional Compliance

- ✅ **Principle I (User Outcomes)**: Each user story has explicit, measurable acceptance scenarios. Success is defined by form rendering, email collection, and responsive layout on all devices.
- ✅ **Principle II (Test-First)**: All ACs are independently testable and observable via browser inspection, keyboard navigation testing, and Email Octopus dashboard verification.
- ✅ **Principle III (Backend Authority)**: Email Octopus handles all form submission validation and data persistence. Client displays form only; no client-side inference of submission status (must receive explicit response from Email Octopus).
- ✅ **Principle IV (Error Semantics)**: All form errors (validation, network, script failure) display user-visible, actionable messages. No silent failures; console errors do not block user feedback.
- ✅ **Principle V (AppShell Integrity)**: Footer component maintains consistent layout structure and renders within AppShell. No custom navigation or layout shells introduced.
- ✅ **Principle VI (Accessibility)**: NFR-001, NFR-002, NFR-003 explicitly require keyboard accessibility, WCAG AA contrast compliance, screen reader support, and semantic HTML. All form inputs have associated labels.
- ✅ **Principle VII (Immutable Data)**: Footer is static content; Email Octopus data is managed by external service. No client-side data mutation.
- ✅ **Principle VIII (Dependency Hygiene)**: Email Octopus is a managed third-party service. Script is pinned (form ID). Monitor for breaking changes in Email Octopus API.
- ✅ **Principle IX (Cross-Feature Consistency)**: Logo and footer branding follow established site design patterns and color system. Responsive breakpoints align with COA-23. Astro component structure follows existing conventions.
- ✅ **Security**: External links use `rel="noopener noreferrer"`. Form submission respects user privacy (Email Octopus privacy policy applies).
- ✅ **Responsive Design**: Desktop (4-column), tablet (2-column), mobile (1-column) layouts explicitly tested. Breakpoints match site-wide standards.

---

## Next Steps

1. **Asset Confirmation**: Confirm logo file exists at `/public/images/logos/phoenix-logo.svg` (or suggest alternative location if directory structure differs).
2. **Implementation**: Build footer component with Email Octopus script embed, fallback messaging, and responsive layout.
3. **Testing**: Verify form renders, submits, and Email Octopus dashboard receives signups. Test all acceptance criteria.
4. **Deployment**: Merge to main and deploy with Email Octopus form ID validation.
