# Feature Specification: Documents (Club Policies & Team Manager Resources)

**Feature Branch**: `cameronwalsh/coa-26-documents`  
**Created**: 2026-04-10  
**Status**: Draft  
**Input**: User request: "1:1 transition of documents from old website to new; Club Policies on About page with click-to-view and download; Team Manager Docs on Resources page following existing coach/player format"

---

## User Scenarios & Testing

### User Story 1 – Visitor browses Club Policies on About page (Priority: P1)

A visitor to the Phoenix website navigates to the About page and needs to review the club's official policies (code of conduct, privacy policy, etc.). They want to quickly find a specific policy by browsing an alphabetical list. For PDF policies, they read inline; for external web-based policies, they access via direct links.

**Why this priority**: Club policies are a cornerstone of transparency and governance. Public access to these documents is essential for club credibility and legal compliance. This is the first feature users expect to see working.

**Independent Test**: Can be fully tested by navigating to About > Club Policies section, verifying alphabetical order, clicking a policy to view the PDF inline, and downloading it. Delivers immediate value to all site visitors.

**Acceptance Scenarios**:

1. **Given** a visitor is on the About page, **When** they scroll to the Club Policies section, **Then** they see a two-column list of policies in alphabetical order
2. **Given** the policies list is displayed, **When** they click a PDF policy (has a download icon or arrow), **Then** the PDF displays inline (embedded viewer) on the page
3. **Given** a policy PDF is displayed inline, **When** they click the download button, **Then** the PDF downloads to their device with the correct filename
4. **Given** the policies list is displayed, **When** they click a web-based policy (has an external link icon), **Then** the page opens in a new tab
5. **Given** multiple PDF policies are expanded, **When** a user expands one policy and then clicks another, **Then** the first collapses and the new one displays (accordion behavior)

---

### User Story 2 – Team Manager accesses manager-specific resources (Priority: P1)

A team manager logs in or browses the Resources page and navigates to the "Team Manager" tab to find role-specific documents (team protocols, communication templates, event guidelines, etc.). The documents are organized in a format consistent with Coach and Player resources for familiarity.

**Why this priority**: Team managers are core stakeholders who need easy access to role-specific guidance. Parity with Coach/Player resource formats ensures usability and consistency across the platform. This is a peer feature to P1.

**Independent Test**: Can be fully tested by navigating to Resources > Team Manager tab, verifying documents display in the same layout as Coach/Player tabs, and downloading a document. Delivers immediate value to team managers.

**Acceptance Scenarios**:

1. **Given** a user is on the Resources page, **When** the page loads, **Then** they see the Team Manager tab alongside Coach and Player tabs (all tabs visible/enabled)
2. **Given** the Team Manager tab is selected, **When** the page displays, **Then** documents appear in the same layout format as Coach/Player resources (cards, grid, or list consistent with existing design)
3. **Given** documents are displayed on the Team Manager tab, **When** a user clicks a document, **Then** the PDF displays inline (embedded viewer)
4. **Given** a document PDF is displayed, **When** they click download, **Then** the PDF downloads with the correct filename
5. **Given** the Team Manager tab is selected, **When** the page displays, **Then** NO filters are shown (unlike Coach/Player tabs which may have filters)

---

### User Story 3 – Coach and Team Manager access instructional guides (Priority: P2)

Coaches and team managers need quick access to tutorial videos and guides for key club operations (e.g., how to score a game in PlayHQ). These guides are organized on the Resources page in a dedicated Guides section with embedded video players and clear categorization.

**Why this priority**: Guides reduce support burden by enabling coaches to self-serve on common operational tasks. P2 reflects that it's valuable but can follow the core document features.

**Independent Test**: Can be fully tested by navigating to Resources > Guides, verifying YouTube videos embed and play correctly, and confirming guides are organized logically.

**Acceptance Scenarios**:

1. **Given** a user is on the Resources page, **When** they see a Guides section, **Then** guides are displayed with embedded YouTube videos
2. **Given** a guide is displayed, **When** they view the page, **Then** the YouTube video embeds inline with standard player controls (play, pause, fullscreen)
3. **Given** a YouTube video is embedded, **When** the user interacts with it, **Then** all standard YouTube player controls function correctly
4. **Given** guides are displayed, **When** a user visits the Guides section, **Then** guides are organized by category or topic (e.g., PlayHQ, Team Management)

---

### User Story 4 – Public visitors access Club Policies without authentication (Priority: P1)

A prospective member or parent visiting the site should be able to read club policies without logging in, reinforcing transparency and accessibility.

**Why this priority**: Club policies must be publicly visible to establish trust and meet legal/governance expectations. This removes barriers to access.

**Independent Test**: Can be fully tested by visiting the About page while logged out, confirming Club Policies section is visible, and successfully viewing/downloading a policy. Confirms no authentication gates are in place.

**Acceptance Scenarios**:

1. **Given** a visitor is logged out, **When** they navigate to the About page, **Then** the Club Policies section is visible and accessible
2. **Given** the visitor is on Club Policies, **When** they click to view a policy, **Then** the PDF displays without prompting for login

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST display Club Policies on the About page in a dedicated section
- **FR-002**: Club Policies MUST be listed in alphabetical order
- **FR-003**: Club Policies list MUST display in a two-column layout
- **FR-004**: System MUST display an expand arrow/button next to each PDF policy name and an external link icon next to web-based policies
- **FR-005**: When a PDF policy expand button is clicked, the PDF MUST display inline (embedded viewer) on the same page without navigation
- **FR-005a**: When a web-based policy link is clicked, the external URL MUST open in a new tab (no navigation away from Club Policies section)
- **FR-006**: When a policy PDF is displayed inline, a download button MUST be present and functional
- **FR-007**: System MUST support accordion behavior (expanding one PDF policy collapses any previously expanded PDF policy)
- **FR-008**: Team Manager resources MUST be displayed on the Resources page under a "Team Manager" tab
- **FR-009**: Team Manager resources MUST follow the same display format and interactions as Coach and Player resources (embed inline, download functionality)
- **FR-010**: Team Manager tab MUST be enabled and visible on the Resources page
- **FR-011**: Team Manager resources MUST NOT display any filter controls (unlike Coach/Player tabs)
- **FR-012**: Both Club Policies and Team Manager documents MUST be publicly viewable (no authentication required)
- **FR-013**: PDF embed viewer MUST be responsive and function across desktop and mobile devices
- **FR-014**: Downloaded PDF filenames MUST equal the original document name
- **FR-015**: Guides section MUST display on the Resources page with embedded YouTube videos
- **FR-016**: YouTube video embeds MUST display inline with full player controls (play, pause, fullscreen, etc.)
- **FR-017**: Guides MUST be organized by category or topic for easy navigation

### Key Entities

- **ClubPolicy**: Represents a single policy document or link (PDF or external)
  - Attributes: name (string), type (enum: 'pdf' | 'external_link'), filePath (string for PDFs) or url (string for external), displayOrder (number via alphabetical sort)
  
- **TeamManagerResource**: Represents a single team manager-specific document (e.g., Team Protocol, Event Guidelines)
  - Attributes: name (string), filePath (string), category (optional string for future filtering), resourceType (string)

- **Guide**: Represents a single instructional guide (video or reference material)
  - Attributes: title (string), category (string), youtubeUrl (string or embed code), description (optional string), displayOrder (number)

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: All Club Policies from the old website are successfully migrated and accessible on the About page without 404 errors
- **SC-002**: All Team Manager documents from the old website are successfully migrated and accessible on the Resources > Team Manager tab without 404 errors
- **SC-003**: Inline PDF viewer loads and displays within 2 seconds on desktop (3g connection simulated)
- **SC-004**: 100% of download buttons function correctly and produce downloadable files with correct filenames
- **SC-005**: Accordion behavior (expand/collapse) operates without lag or visual glitches
- **SC-006**: Feature functions identically on Chrome, Firefox, Safari, and Edge (latest versions)
- **SC-007**: Responsive design verified on mobile (375px), tablet (768px), and desktop (1920px) viewports
- **SC-008**: No console errors or accessibility violations (WCAG 2.1 AA) detected during manual testing
- **SC-009**: YouTube video embeds load within 3 seconds on 3G connection
- **SC-010**: All guide video embeds are responsive and maintain aspect ratio on all viewport sizes
- **SC-011**: YouTube player controls (play, pause, fullscreen, volume) function correctly in all guide embeds

---

## Edge Cases

- What happens if a PDF file is corrupt or missing? → Display a user-friendly error message ("Document unavailable") rather than breaking the page
- What happens if an external policy link is broken? → Display a warning icon and disable the link; show tooltip "External link unavailable"
- How does the system handle very large PDF files (>50MB)? → Consider lazy-loading or a warning before embed to prevent performance issues
- What if a policy/document name is extremely long? → Text truncation with ellipsis or wrapping must maintain layout integrity in 2-column grid
- How does the system behave if JavaScript is disabled? → Fallback to download links for PDFs and direct links for external policies (no embed, but documents remain accessible)
- What if the user's browser doesn't support PDF embeds? → Provide a fallback link to open in a new tab or force download

---

## Implementation Notes

### Document Structure

**Club Policies** (About page):
- Container: dedicated section below About content, before footer
- Layout: 2-column grid
- Sorting: Alphabetical by policy name
- Interaction: 
  - PDF policies: Click arrow to expand/view inline
  - Web-based policies: Click external link icon to open in new tab
- Styling: Align with existing About page design
- Visual differentiation: PDF policies show download/expand icon, external policies show external link icon with "(opens in new tab)" tooltip

**Team Manager Resources** (Resources page):
- Container: Team Manager tab alongside Coach and Player tabs
- Layout: Match Coach/Player resource card layout
- Sorting: Match Coach/Player sorting (likely by type or upload date)
- Interaction: Click to expand/view inline
- Filters: None (unlike Coach/Player tabs)
- Styling: Inherit from existing Resources page component

**Guides** (Resources page):
- Container: Dedicated Guides section on Resources page (can be a tab or separate section)
- Layout: Grid or list of guide cards with embedded YouTube player
- Sorting: By category (e.g., PlayHQ, Team Management, General) then by relevance
- Interaction: Click guide card to view embedded YouTube video inline
- Video embeds: Responsive, full player controls enabled
- Styling: Align with existing Resources page design

### File Management

- You will download all PDF documents manually from the old site
- Store files in the project repository under a logical path (e.g., `/public/resources/club-policies/` and `/public/resources/team-manager/`)
- Filename convention: `[name-in-kebab-case].pdf` (e.g., `code-of-conduct.pdf`)
- External policy links (to be included in the policies list):
  - **Child Protection Policy**: https://bendigobasketball.com.au/child-protection-policy/
  - **Gender, Disrespect & Violence**: https://sportsfocus.com.au/issue-gender-disrespect-violence/
- These external links open in new tabs and do not require download

### Guides Resources

- Guides section on Resources page with YouTube embedded videos
- Guide resources (to be included):
  - **Category: PlayHQ**
    - **How to Score a Game** (YouTube): https://youtu.be/OdTboL_uYqk?si=DHaDOyoUJOXQLC4G&t=2
- Additional guides can be added as needed in future iterations

### PDF Embed Library

- Use a lightweight, standard PDF embed solution (browser native `<embed>` tag, Mozilla PDF.js, or similar)
- Ensure download button is always visible and functional
- Ensure proper CORS handling for PDF loading

### Accessibility

- Ensure PDF viewer is keyboard navigable
- Add ARIA labels to expand/collapse buttons
- Ensure focus management for accordion behavior
- Ensure alt text for policy/document titles

---

## Testing Checklist (Manual QA)

- [ ] Club Policies section appears on About page
- [ ] Policies listed in strict alphabetical order
- [ ] Two-column layout displays correctly on desktop/tablet/mobile
- [ ] Each policy has a visible expand arrow
- [ ] Clicking arrow displays PDF inline
- [ ] Download button appears and functions
- [ ] Expanding one policy collapses the previous (accordion)
- [ ] Team Manager tab visible on Resources page
- [ ] Team Manager resources display in same format as Coach/Player
- [ ] Team Manager tab has no filter controls
- [ ] All documents are publicly accessible (logged out)
- [ ] PDFs load within acceptable time (<2s on 3g)
- [ ] No console errors during interaction
- [ ] Filenames preserved correctly on download
- [ ] Responsive behavior tested at 375px, 768px, 1920px
- [ ] External links work correctly and open in new tabs
- [ ] Error handling for broken PDF files and external links
- [ ] Guides section visible on Resources page
- [ ] YouTube videos embed and display correctly
- [ ] YouTube player controls function (play, pause, fullscreen, volume)
- [ ] Video embeds are responsive at 375px, 768px, 1920px
- [ ] Guides are organized by category
- [ ] No console errors during guide video playback

---

## Questions for Clarification

None at this stage — all requirements are clear. Proceed with implementation.