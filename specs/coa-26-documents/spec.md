# Feature Specification: Documents (Club Policies & Team Manager Resources)

**Feature Branch**: `cameronwalsh/coa-26-documents`
**Created**: 2026-04-10
**Status**: READY_FOR_DEV
**Source**: User request: "1:1 transition of documents from old website to new; Club Policies on About page with click-to-view and download; Team Manager Docs on Resources page following existing coach/player format"

---

## Summary

This feature migrates real club documents from the old Bendigo Phoenix website onto the new Astro site. It covers three areas:

1. **Club Policies on the About page** — replace the existing placeholder text accordion with real PDF documents and external policy links, displayed in a two-column layout with inline PDF viewing and download.
2. **Team Manager Resources tab on the Resources page** — unhide the already-scaffolded Manager tab and wire it to real documents, publicly accessible and filter-free.
3. **Guides section on the Resources page** — add a new Guides tab (or section) with embedded YouTube instructional videos for coaches and managers.

---

## User Scenarios & Testing

### User Story 1 — Visitor browses Club Policies on About page (Priority: P1)

A visitor to the Phoenix website navigates to the About page and needs to review the club's official policies (code of conduct, privacy policy, etc.). They want to quickly find a specific policy by browsing an alphabetical list. For PDF policies, they read inline; for external web-based policies, they access via direct links.

**Why this priority**: Club policies are a cornerstone of transparency and governance. Public access to these documents is essential for club credibility and legal compliance.

**Independent Test**: Navigate to About > Club Policies section, verify alphabetical two-column layout, click a PDF policy to view it embedded on the page, click the download button, confirm the file downloads with the correct filename.

**Acceptance Scenarios**:

1. **Given** a visitor is on the About page, **When** they scroll to the Club Policies section, **Then** they see a two-column grid of policy items in strict alphabetical order
2. **Given** the policies list is displayed, **When** they click the expand button on a PDF policy, **Then** the PDF embeds inline on the same page without navigating away
3. **Given** a policy PDF is displayed inline, **When** they click the download button, **Then** the PDF downloads to their device with a filename matching the document name
4. **Given** the policies list is displayed, **When** they click an external policy link, **Then** the target URL opens in a new tab and the About page remains open
5. **Given** one PDF policy is already expanded, **When** the user expands a different policy, **Then** the previously expanded policy collapses (accordion — only one open at a time)
6. **Given** a visitor is on the About page, **When** they view the Club Policies section, **Then** PDF policy items show a download/expand icon and external policy items show an external-link icon with a visually distinct treatment

---

### User Story 2 — Team Manager accesses manager-specific resources (Priority: P1)

A team manager browses the Resources page and navigates to the "Team Manager" tab to find role-specific documents (team protocols, communication templates, event guidelines, etc.). Documents are organised consistently with the Coach and Player resource cards.

**Why this priority**: Team managers are core stakeholders who need easy access to role-specific guidance. Parity with Coach/Player resource formats ensures usability and consistency.

**Independent Test**: Navigate to Resources > Team Manager tab, confirm the tab is visible (not hidden), confirm documents display using the same card layout as Coaching/Player tabs, click a document link and confirm it functions correctly.

**Acceptance Scenarios**:

1. **Given** a user is on the Resources page, **When** the page loads, **Then** the Team Manager tab is visible and enabled alongside Coaching Resources and Player Resources tabs
2. **Given** the Team Manager tab is selected, **When** the page renders, **Then** documents display using the same card layout as the Coaching and Player tabs (card grid, consistent styling)
3. **Given** the Team Manager tab is selected, **When** the page renders, **Then** no filter controls (age group chips, category chips) are shown for this tab
4. **Given** the Team Manager tab is active and has no filter controls, **When** the user switches from a tab that had filters applied, **Then** no filter bar is shown and all manager documents are visible
5. **Given** a document card is displayed, **When** the user clicks the document action link, **Then** the document opens or downloads as appropriate to its type (PDF downloads, links open in a new tab)

---

### User Story 3 — Coach and Team Manager access instructional guides (Priority: P2)

Coaches and team managers need quick access to tutorial videos for key club operations (e.g., how to score a game in PlayHQ). These are displayed as a Guides tab on the Resources page with embedded YouTube players.

**Why this priority**: Guides reduce support burden by enabling coaches to self-serve on common operational tasks. P2 reflects that it follows the core document features in priority.

**Independent Test**: Navigate to Resources > Guides tab, confirm the tab appears, confirm YouTube videos embed and play, confirm guides are organised by category.

**Acceptance Scenarios**:

1. **Given** a user is on the Resources page, **When** the page loads, **Then** a Guides tab is visible in the tab bar alongside the existing resource tabs
2. **Given** the Guides tab is selected, **When** the page renders, **Then** guide cards are displayed, each showing a title, category label, and embedded YouTube video player
3. **Given** a guide card is displayed, **When** the user views it, **Then** the YouTube video is embedded inline with full standard player controls (play, pause, fullscreen, volume, CC where available)
4. **Given** guides are displayed, **When** the user views the Guides tab, **Then** guides are visually grouped by category heading (e.g., "PlayHQ", "Team Management"). Within each category, guides MUST be sorted alphabetically by title (A-Z).
5. **Given** a YouTube video is embedded, **When** the user interacts with it on a mobile viewport (375px), **Then** the video maintains a 16:9 aspect ratio and all controls remain usable

---

### User Story 4 — Public visitors access Club Policies without authentication (Priority: P1)

A prospective member or parent visiting the site should be able to read club policies without logging in, reinforcing transparency and accessibility.

**Why this priority**: Club policies must be publicly visible to establish trust and meet legal/governance expectations.

**Independent Test**: Visit About page without logging in (or in an incognito window), confirm Club Policies section is visible, and successfully view and download a policy.

**Acceptance Scenarios**:

1. **Given** a visitor has not logged in, **When** they navigate to the About page, **Then** the Club Policies section is visible and all policy items are accessible
2. **Given** the visitor is viewing the Club Policies section, **When** they click to view or download a policy, **Then** the PDF displays and downloads without any authentication prompt

---

### Edge Cases

- **Missing or corrupt PDF file**: Display a user-friendly inline message ("Document temporarily unavailable") rather than a broken embed or console error. The item should still be visible in the list with the error state instead of the embed.
- **Broken external policy link**: Display the item in the list with a warning indicator; clicking it still attempts to open the link in a new tab (do not silently disable the link, as the URL itself is the content).
- **Very long policy or document title**: Text must wrap or truncate with ellipsis in a way that does not break the two-column grid layout or card layout. The full title must be accessible via a `title` attribute or similar mechanism.
- **JavaScript disabled**: Club Policies must degrade to a list of direct download links (for PDFs) and anchor links (for external). No PDF embed fallback needed — just accessible links. Resources page tabs may not function; this is an acceptable static fallback for this site type.
- **Browser with no native PDF embed support**: Provide a visible "Open PDF" fallback link alongside the embed. Do not rely solely on the embed tag rendering.
- **Very large PDF (>10MB)**: No special lazy-loading required; this is a static site without a CDN layer at this stage. Files should be reasonably compressed during asset preparation. No in-browser size warning is required for MVP.
- **Manager tab filter bar conflict**: The codebase already has a filter bar scaffolded for the managers tab (`filters-managers` div with age and category chips). The Manager tab must suppress the filter bar when active — the `filters-managers` div should either be removed from the DOM or kept permanently hidden, consistent with FR-011.
- **Empty manager resources or guides**: If a tab panel has zero items (e.g., before real data is wired in), display a non-breaking empty state ("No resources available yet — check back soon.").

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST display a Club Policies section on the About page, positioned below existing About content and before the footer
- **FR-002**: Club Policies items MUST be listed in strict alphabetical order by policy name
- **FR-003**: Club Policies MUST be displayed in a two-column grid layout on desktop; single-column on mobile (below `sm` breakpoint)
- **FR-004**: Each PDF policy item MUST display an expand/download icon; each external policy item MUST display an external-link icon with a visual distinction from PDF items
- **FR-005**: When the expand button of a PDF policy is clicked, the PDF MUST embed inline within the same page without navigating away or opening a new tab
- **FR-005a**: External policy items MUST open their URL in a new tab (`target="_blank"` with `rel="noopener noreferrer"`); the About page MUST remain open
- **FR-006**: When a PDF policy is expanded inline, a visible download button MUST be present. Clicking the button MUST initiate a file download using a direct link with the `download` attribute set to the original filename (e.g., `<a href="/resources/club-policies/file.pdf" download="Code of Conduct.pdf">`). The filename in the `download` attribute MUST match the policy `name` field.
- **FR-007**: Only one PDF policy may be expanded at a time; expanding a second policy MUST collapse the previously expanded one (accordion behaviour)
- **FR-008**: The Team Manager tab on the Resources page MUST be visible and enabled (the existing `hidden` CSS class MUST be removed from the tab button)
- **FR-009**: Team Manager resource cards MUST use the same card layout and interaction pattern as the Coaching and Player resource cards
- **FR-010**: When the Team Manager tab is active, no filter controls (age chip row, category chip row, clear button) MUST be visible — the filter bar for the managers tab MUST be suppressed entirely
- **FR-011**: The existing `filters-managers` DOM element MUST remain permanently hidden regardless of tab state, to prevent the manager filter bar from ever appearing
- **FR-012**: All Club Policies and Team Manager documents MUST be accessible without authentication
- **FR-013**: The PDF inline embed MUST be responsive — it must fill the available column width and display at a usable minimum height on both desktop and mobile
- **FR-014**: Downloaded PDF filenames MUST match the source document name as stored in the file path
- **FR-015**: A Guides tab MUST be added to the Resources page tab bar
- **FR-016**: Each guide card MUST display an embedded YouTube video player inline with standard controls enabled
- **FR-017**: Guide cards MUST display a category label and be visually grouped or sorted by category
- **FR-018**: If any tab panel (Club Policies, Team Manager, or Guides) has zero items to display, a non-breaking empty state message MUST render: "No resources available yet — check back soon." The message MUST be centered, accessible to screen readers, and styled consistently with other page sections.
- **FR-019**: The `ResourceAudience` type in `src/lib/resources/types.ts` MUST be updated from `'coaching' | 'players'` to `'coaching' | 'players' | 'managers'`, so manager resources conform to the shared `Resource` interface. No additional type system changes required; filter suppression is handled in the `switchTab` function logic, not the type definition.
- **FR-020**: The Club Policies section MUST replace the existing placeholder text accordion in `src/pages/about.astro` — all six placeholder policy objects (Code of Conduct, Registration & Eligibility, etc.) MUST be removed and replaced with real documents

### Non-Functional Requirements

- **NFR-001 (Accessibility)**: All expand/collapse accordion buttons MUST have `aria-expanded` state, correct `aria-controls` associations, and be fully keyboard operable (Enter/Space to toggle, focus visible). Tab bar keyboard navigation (arrow keys) already exists and MUST continue to work after adding the Guides tab.
- **NFR-002 (Accessibility)**: External link items MUST include a visually hidden "(opens in new tab)" label or `aria-label` suffix so screen reader users are informed before activating the link.
- **NFR-003 (Accessibility)**: PDF embed elements MUST have a descriptive `title` attribute (e.g., `title="Code of Conduct PDF"`).
- **NFR-004 (Accessibility)**: YouTube embeds MUST have a descriptive `title` attribute on the `<iframe>` element.
- **NFR-005 (Responsive)**: All new UI must be verified at 375px (mobile), 768px (tablet), and 1440px (desktop) viewports. Two-column Club Policies grid collapses to one column on mobile. Resource cards maintain their existing responsive grid behaviour.
- **NFR-006 (Performance)**: PDF files stored in `/public/` MUST be compressed before commit. No individual file should exceed 5MB without explicit justification.
- **NFR-007 (Error handling)**: A broken or missing PDF must not throw a JavaScript error or produce a blank broken embed. A visible fallback message or link must render in its place.
- **NFR-008 (Consistency)**: New UI components on the Resources page MUST inherit the existing Tailwind utility class conventions (`brand-purple`, `brand-gold`, `brand-offwhite`, `brand-black`) and follow the established card pattern already used by Coaching and Player tabs.
- **NFR-009 (No new heavy dependencies)**: The PDF embed solution MUST use the browser-native `<embed>` or `<object>` tag as the primary approach. A third-party PDF rendering library (e.g., PDF.js) MUST NOT be introduced without a separate architectural decision.

### Key Entities

- **ClubPolicy**: Represents a single policy entry in the Club Policies section on the About page.
  - `name` (string): Display name, used for alphabetical sort
  - `type` (`'pdf' | 'external_link'`): Determines render behaviour
  - `filePath` (string, PDF only): Path relative to `/public/`, e.g., `resources/club-policies/code-of-conduct.pdf`
  - `url` (string, external_link only): Full external URL
  - Note: This entity is separate from the existing `Resource` interface. Policy PDF files are stored in `/public/resources/club-policies/` following the folder structure already established in the spec. The `filePath` field references these stored files.

- **Resource** (existing interface, `src/lib/resources/types.ts`): All Team Manager documents MUST conform to this existing interface. The `audience` field value `'managers'` must be added to the `ResourceAudience` type. The `type` field value `'document'` already exists in `ResourceType`. Manager resources MUST use `url` (not `filePath`) consistent with existing JSON schemas.

- **Guide**: Represents a single instructional video guide on the Resources Guides tab.
  - `id` (string)
  - `title` (string)
  - `category` (string): e.g., `'PlayHQ'`, `'Team Management'`
  - `youtubeUrl` (string): Full YouTube URL (e.g., `https://youtu.be/OdTboL_uYqk` or `https://www.youtube.com/watch?v=OdTboL_uYqk&t=2`). The embed URL MUST be derived at render time by extracting the video ID and constructing `https://www.youtube.com/embed/{VIDEO_ID}` (timestamps and query parameters MUST be removed from the embed URL for iframe safety). Video ID extraction: for `youtu.be/{ID}` extract `{ID}`; for `watch?v={ID}` extract `{ID}` before the first `&` if present.
  - `dateAdded` (string, ISO date)
  - Note: Guide data and references MUST be stored following the same folder structure pattern as club policies and manager resources, with guide references and metadata organized in `/public/resources/guides/` to maintain consistency with the resource organization established in the spec.

---

## Implementation Notes

### Codebase Context (What Already Exists)

- `src/pages/about.astro`: Has a Club Policies section with a JavaScript accordion, but all content is placeholder text (six hard-coded policy objects). This section already has the accordion interaction pattern; the change is to replace text content with PDF embeds and real data.
- `src/pages/resources/index.astro`: Has three tabs (Coaching, Player, Manager). The Manager tab button has `class="tab-btn hidden"` and the panel is `class="hidden"`. A filter bar for managers (`id="filters-managers"`) is already scaffolded with age and category chips but must remain hidden.
- `src/data/manager-resources.json`: Exists with eight placeholder entries (`url: "#"`). These URLs must be replaced with real file paths or left as `"#"` until files are sourced.
- `src/lib/resources/types.ts`: `ResourceAudience` is currently `'coaching' | 'players'` — must add `'managers'`.

### File Storage Conventions

- Store PDF files under `/public/resources/club-policies/` and `/public/resources/team-manager/`
- Filename convention: `[name-in-kebab-case].pdf` (e.g., `code-of-conduct.pdf`)
- External policy links (do not require file storage):
  - **Child Protection Policy**: https://bendigobasketball.com.au/child-protection-policy/
  - **Gender, Disrespect & Violence**: https://sportsfocus.com.au/issue-gender-disrespect-violence/

### Guides Data

- One guide confirmed for initial launch:
  - Category: PlayHQ
  - Title: How to Score a Game
  - YouTube URL: https://youtu.be/OdTboL_uYqk?si=DHaDOyoUJOXQLC4G&t=2
- Additional guides may be added as real content is identified.

### Manager Tab Filter Suppression

The Resources page already has a `filters-managers` div that is currently hidden via `class="space-y-2 hidden"`. The `switchTab` JavaScript function shows the filter panel that matches the active tab. To suppress filters for the manager tab permanently, the implementation must either:
- Remove the `filters-managers` div from the DOM entirely, and update the `switchTab` function to not attempt to show filters for the `managers` tab; or
- Keep `filters-managers` with a `hidden` class that is never toggled by tab switching.

The existing `managers-no-results` div and manager filter clear button infrastructure may also be removed if the manager tab will have no filter functionality.

### Guides Tab Placement

The Guides tab MUST be added to the existing `role="tablist"` tab bar in the Resources page, following the same `role="tab"` pattern as the existing tabs. The tab button ID should be `tab-guides` and the panel ID `panel-guides`. The Guides tab does not require a filter bar.

---

## Success Criteria

- **SC-001**: All Club Policies from the old website are accessible on the About page without 404 errors
- **SC-002**: All Team Manager documents from the old website are accessible on the Resources > Team Manager tab without 404 errors
- **SC-003**: Inline PDF viewer displays within 3 seconds on a simulated 3G connection (Chrome DevTools throttle)
- **SC-004**: All download buttons produce a downloadable file with the correct filename (verified manually for each document)
- **SC-005**: Accordion expand/collapse operates with no visible lag or layout shift
- **SC-006**: Feature functions correctly on Chrome, Firefox, Safari, and Edge (latest stable versions)
- **SC-007**: Layout verified at 375px, 768px, and 1440px viewports with no overflow or broken grid
- **SC-008**: No WCAG 2.1 AA violations detected during axe DevTools or equivalent accessibility audit
- **SC-009**: YouTube video embeds load and play on the Guides tab across all three viewport sizes
- **SC-010**: Team Manager tab is visible on page load (no `hidden` class on the tab button)
- **SC-011**: No JavaScript console errors during normal interaction with Club Policies accordion, Team Manager tab, or Guides tab

---

## Acceptance Criteria

1. **Given** a visitor loads the About page, **When** they scroll to Club Policies, **Then** a two-column grid of policies is displayed in alphabetical order (single column on mobile)
2. **Given** the Club Policies section is visible, **When** the user clicks a PDF policy, **Then** the PDF renders inline within the page; no navigation or new tab opens
3. **Given** a PDF is displayed inline, **When** the user clicks the download button, **Then** the browser downloads the file with a filename matching the stored document name
4. **Given** the Club Policies section is visible, **When** the user clicks an external policy link, **Then** the link opens in a new tab; the About page stays open
5. **Given** one PDF policy is open, **When** the user opens a different PDF policy, **Then** the first policy collapses automatically
6. **Given** the About page is loaded without authentication, **When** the user views Club Policies, **Then** all items are visible and functional with no login gate
7. **Given** an external policy item is displayed, **When** a user hovers or focuses the link, **Then** the item displays a visually distinct external-link icon (not a download/expand icon), and screen readers announce "(opens in new tab)"
8. **Given** the Resources page loads, **When** the page is rendered, **Then** the Team Manager tab is visible in the tab bar (not hidden)
9. **Given** the Team Manager tab is active, **When** the user inspects the filter bar area, **Then** no filter chips or clear buttons are shown for the manager tab
10. **Given** the Team Manager tab is active, **When** the page renders, **Then** manager document cards use the same grid layout, card component, spacing, and button styles as the Coaching and Player resource cards
11. **Given** the Resources page loads, **When** the user views the tab bar, **Then** a Guides tab is present and selectable
12. **Given** the Guides tab is active, **When** the user views a guide card, **Then** a YouTube video player is embedded inline with standard controls visible
13. **Given** the Guides tab is active on a 375px viewport, **When** the user views an embedded YouTube video, **Then** the video maintains a 16:9 aspect ratio and controls are usable
14. **Given** an accordion button for a PDF policy is focused via keyboard, **When** the user presses Enter or Space, **Then** the policy expands or collapses correctly
15. **Given** the Club Policies section is rendered, **When** an axe accessibility scan is run, **Then** no critical or serious violations are reported
16. **Given** a guide card with a YouTube video is displayed, **When** the YouTube video fails to load (network error, video removed, or private video), **Then** a user-friendly fallback message appears ("Video unavailable — try again later or contact support") instead of a broken embed

---

## Testing Checklist (Manual QA)

- [ ] Club Policies section appears on About page
- [ ] Policies listed in strict alphabetical order
- [ ] Two-column layout on desktop; single-column on mobile (375px)
- [ ] PDF policy items show expand/download icon; external items show external-link icon
- [ ] Clicking a PDF policy item embeds the PDF inline (no navigation)
- [ ] Download button appears on expanded PDF and produces correct filename on download
- [ ] Expanding one policy collapses the previous (accordion)
- [ ] External policy links open in new tab; About page stays open
- [ ] All Club Policies publicly accessible without login
- [ ] Team Manager tab visible in Resources page tab bar (not hidden)
- [ ] Team Manager tab shows same card layout as Coaching/Player tabs
- [ ] No filter chips or clear button visible when Team Manager tab is active
- [ ] Manager documents accessible without login
- [ ] Guides tab visible in Resources page tab bar
- [ ] Guide cards display YouTube embeds with standard controls
- [ ] YouTube videos responsive at 375px, 768px, 1440px
- [ ] Guides display category labels
- [ ] No console errors during accordion, tab, or video interaction
- [ ] Responsive layout verified at 375px, 768px, 1440px
- [ ] Keyboard: accordion expand/collapse via Enter/Space
- [ ] Keyboard: tab bar arrow-key navigation includes Guides tab
- [ ] Screen reader: external links announce "(opens in new tab)"
- [ ] Screen reader: PDF embeds have descriptive `title` attribute
- [ ] PDF fallback link visible if browser cannot render embed
- [ ] axe DevTools: no critical/serious accessibility violations

---

## Constitutional Compliance

- **Principle I (User Outcomes First)**: Each user story has a measurable independent test. Success criteria are observable. PASS.
- **Principle II (Test-First Discipline)**: The testing checklist and acceptance criteria are specified before implementation. Manual QA criteria are exhaustive. PASS.
- **Principle III (Backend Authority & Invariants)**: No backend — this is a static Astro site. All data is in JSON files or hard-coded. No server-side invariants to protect. N/A.
- **Principle IV (Error Semantics & Observability)**: Error states for broken PDFs and missing embeds are specified. Console errors are included as a success criterion. PASS.
- **Principle V (AppShell Integrity)**: All new UI renders within the existing `BaseLayout`. No custom nav shell introduced. Resources page tab bar is extended (not replaced). About page section added inside the existing page structure. PASS.
- **Principle VI (Accessibility First)**: `aria-expanded`, `aria-controls`, keyboard operability, screen reader announcements for external links, and `title` attributes on embeds are all explicitly required in NFRs and ACs. PASS.
- **Principle VII (Immutable Data Flow)**: Static site — data flows from JSON to rendered HTML at build time. No runtime state mutation beyond accordion open/close state, which is local and explicit. PASS.
- **Principle VIII (Dependency Hygiene)**: NFR-009 explicitly prohibits introducing a PDF rendering library. YouTube embed uses a native `<iframe>`. No new dependencies required. PASS.
- **Principle IX (Cross-Feature Consistency)**: Manager resource cards use the existing card component pattern. New Guides tab follows the existing `role="tab"` / `role="tabpanel"` tab pattern. Tailwind colour tokens follow existing conventions. PASS.

**Open Questions**:
- None blocking. Proceed with implementation.
