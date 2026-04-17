# Feature Specification: Newsletter Link Redirects with State Management

**Feature Branch**: `cameronwalsh/coa-60-fix-links`  
**Created**: 2026-04-17  
**Status**: Draft  
**Input**: User description: "Old links in newsletter need redirect to new pages with specific UI states (modals open, sections pinned)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Redirect old newsletter links to new pages (Priority: P1)

A club member clicks on an old link from a newsletter sent before the site migration. The link should redirect to the new site structure without 404 errors.

**Why this priority**: Newsletter links are public-facing, time-sensitive, and failing links damage brand perception and drive support questions. This is blocking any newsletter sends with old links.

**Independent Test**: Can be fully tested by clicking each of the six old links and verifying the correct new page loads. Delivers immediate value by fixing broken links.

**Acceptance Scenarios**:

1. **Given** user clicks `https://www.bendigophoenix.org.au/seasons/training`, **When** page loads, **Then** user is redirected to `https://bendigophoenix.org.au/seasons/` and sees the page
2. **Given** user clicks `https://www.bendigophoenix.org.au/team/players`, **When** page loads, **Then** user is redirected to `https://bendigophoenix.org.au/resources/` and sees the page
3. **Given** user clicks `https://www.bendigophoenix.org.au/get-involved/volunteers`, **When** page loads, **Then** user is redirected to `https://bendigophoenix.org.au/get-involved/` and sees the page
4. **Given** user clicks `https://www.bendigophoenix.org.au/seasons/clearances`, **When** page loads, **Then** user is redirected to `https://bendigophoenix.org.au/seasons/` and sees the page
5. **Given** user clicks `https://www.bendigophoenix.org.au/seasons/uniforms`, **When** page loads, **Then** user is redirected to `https://bendigophoenix.org.au/seasons/` and sees the page
6. **Given** user clicks `https://www.bendigophoenix.org.au/about/club-policies`, **When** page loads, **Then** user is redirected to `https://bendigophoenix.org.au/about/` and sees the page

---

### User Story 2 - Open training modal on redirect (Priority: P1)

When redirected from the old training link, the Seasons page loads with the training modal already open, maintaining the user's original intent.

**Why this priority**: User clicked to view training info; opening the modal directly completes that intent without requiring an extra click. Part of core redirect functionality.

**Independent Test**: Click the `/seasons/training` old link and verify the Seasons page loads with the training modal open.

**Acceptance Scenarios**:

1. **Given** user visits the old `/seasons/training` link, **When** redirected to `/seasons/`, **Then** the training modal is automatically open
2. **Given** user is on the Seasons page with training modal open, **When** they close the modal, **Then** modal state is cleared for subsequent interactions

---

### User Story 3 - Open Player Journal resource on redirect (Priority: P1)

When redirected from the old player link, the Resources page loads with the Player Journal resource already open/visible, preserving the user's navigation intent.

**Why this priority**: User clicked to view player resources; opening the Player Journal directly completes that intent. Part of core redirect functionality.

**Independent Test**: Click the `/team/players` old link and verify the Resources page loads with Player Journal visible/open.

**Acceptance Scenarios**:

1. **Given** user visits the old `/team/players` link, **When** redirected to `/resources/`, **Then** the Player Journal resource is automatically open/active
2. **Given** user is viewing the Player Journal on Resources page, **When** they switch to another resource, **Then** the URL state updates appropriately

---

### User Story 4 - Pin to Volunteer section on redirect (Priority: P2)

When redirected from the old volunteer link, the Get Involved page loads and smoothly scrolls/pins to the "Volunteer with us" section.

**Why this priority**: User clicked to view volunteer info; pinning to that section provides immediate context. P2 because scrolling is a UX enhancement vs. hard requirement.

**Independent Test**: Click the `/get-involved/volunteers` old link and verify the Get Involved page loads pinned to the Volunteer section.

**Acceptance Scenarios**:

1. **Given** user visits the old `/get-involved/volunteers` link, **When** redirected to `/get-involved/`, **Then** the page is pinned/scrolled to the "Volunteer with us" section
2. **Given** user is on Get Involved page pinned to Volunteer section, **When** they scroll to another section, **Then** the URL hash updates accordingly

---

### User Story 5 - Open clearances modal on redirect (Priority: P2)

When redirected from the old clearances link, the Seasons page loads with the clearances modal already open.

**Why this priority**: User clicked to view clearances; opening the modal directly completes that intent. P2 because it's one of multiple modals on the same page.

**Independent Test**: Click the `/seasons/clearances` old link and verify the Seasons page loads with the clearances modal open.

**Acceptance Scenarios**:

1. **Given** user visits the old `/seasons/clearances` link, **When** redirected to `/seasons/`, **Then** the clearances modal is automatically open
2. **Given** user is on Seasons page with clearances modal open, **When** they close the modal, **Then** modal state is cleared

---

### User Story 6 - Open uniforms modal on redirect (Priority: P2)

When redirected from the old uniforms link, the Seasons page loads with the uniforms modal already open.

**Why this priority**: User clicked to view uniforms; opening the modal directly completes that intent. P2 because it's one of multiple modals on the same page.

**Independent Test**: Click the `/seasons/uniforms` old link and verify the Seasons page loads with the uniforms modal open.

**Acceptance Scenarios**:

1. **Given** user visits the old `/seasons/uniforms` link, **When** redirected to `/seasons/`, **Then** the uniforms modal is automatically open
2. **Given** user is on Seasons page with uniforms modal open, **When** they close the modal, **Then** modal state is cleared

---

### User Story 7 - Pin to club policies section on redirect (Priority: P2)

When redirected from the old club policies link, the About page loads and smoothly scrolls/pins to the "Club Policies" section.

**Why this priority**: User clicked to view club policies; pinning to that section provides immediate context. P2 because scrolling is a UX enhancement vs. hard requirement.

**Independent Test**: Click the `/about/club-policies` old link and verify the About page loads pinned to the Club Policies section.

**Acceptance Scenarios**:

1. **Given** user visits the old `/about/club-policies` link, **When** redirected to `/about/`, **Then** the page is pinned/scrolled to the "Club Policies" section
2. **Given** user is on About page pinned to Club Policies section, **When** they scroll to another section, **Then** the URL hash updates accordingly

---

### Edge Cases

- What happens when a user visits an old link with trailing slashes (e.g/, `https://www.bendigophoenix.org.au/seasons/training/`)?
- What happens if the user manually removes the `www.` prefix from the old domain?
- What happens if the target modal or section doesn't exist on the new page?
- What happens if a user bookmarked the old URL and it contains browser history?
- What happens if users visit the old domain without a specific path (just `https://www.bendigophoenix.org.au/`)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST redirect old `www.bendigophoenix.org.au` domain requests to the new `bendigophoenix.org.au` domain without the `www.` prefix
- **FR-002**: System MUST support six specific URL redirect mappings as defined in the User Stories (seasons/training, team/players, get-involved/volunteers, seasons/clearances, seasons/uniforms, about/club-policies)
- **FR-003**: System MUST preserve query parameters and URL hash fragments during redirects (e.g/, `?ref=newsletter` should persist)
- **FR-004**: Redirects MUST return HTTP 301 (permanent redirect) to ensure SEO credit and proper browser caching
- **FR-005**: System MUST open modals (training, clearances, uniforms) by passing state via URL parameters (e.g., `?modal=training`) that the frontend consumes on page load
- **FR-006**: System MUST pin/scroll to sections (Volunteer, Club Policies) by using URL hash anchors (e.g., `#volunteer-with-us`) that the frontend consumes on page load
- **FR-007**: System MUST handle trailing slashes in old URLs and normalize them during redirect
- **FR-008**: System MUST log all redirect requests for analytics and debugging purposes (source URL, target URL, timestamp)

### Key Entities *(include if feature involves data)*

- **Redirect Rule**: Maps an old URL path to a new URL path, with optional state parameters (modal name or section anchor)
  - `oldPath`: string (e.g., `/seasons/training`)
  - `newPath`: string (e.g/, `/seasons/`)
  - `stateType`: enum (`modal` | `anchor` | `none`)
  - `stateValue`: string or null (e.g/, `training`, `volunteer-with-us`)
  - `httpCode`: number (301)

- **Redirect Log Entry**: Audit trail of redirects for analytics
  - `sourceUrl`: string (full old URL)
  - `targetUrl`: string (full new URL)
  - `timestamp`: ISO datetime
  - `userAgent`: string (optional, for debugging)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All six redirect rules are implemented and return HTTP 301 status codes (verified via curl or HTTP client testing)
- **SC-002**: Clicking each of the six old newsletter links results in landing on the correct new page without 404 errors
- **SC-003**: Modals (training, clearances, uniforms) open automatically when the corresponding old link is clicked; users do not see the page then have to manually open the modal
- **SC-004**: Section anchors (Volunteer, Club Policies) result in automatic scroll/pin to the target section when the corresponding old link is clicked
- **SC-005**: Trailing slash variants of old URLs (with and without trailing `/`) both redirect correctly
- **SC-006**: Redirect implementation is maintainable by a non-technical successor (documented in handover docs, no hardcoded paths, rules stored in config file or frontmatter)
- **SC-007**: No broken links remain in any previous newsletter archives or published materials (verified through manual testing of all six links and any other old links discovered during QA)
