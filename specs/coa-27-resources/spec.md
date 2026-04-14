# Spec: COA-27 — Resources: One-Time Scrape + Manual Merge

**Status**: READY_FOR_DEV
**Source**: COA-27 (Linear)
**Priority**: P1 (pipeline) / P1 (modal display)

## Summary

The existing Resources page looks good and the filtering UI is already in place. This feature delivers two distinct things:

1. **In-page modal display**: Resource cards currently link away from the site. This feature replaces that behaviour with a near-fullscreen modal so users view PDFs and watch embedded videos without leaving the page.

2. **Content curation pipeline**: A one-time web scrape of major basketball organisations (Basketball Victoria, Basketball Australia, NBL, WNBL, NBA, WNBA) produces candidate resources focused on skills videos, man-to-man defence, zone defence, and 3 simple flow offensive systems. An admin reviews the scraped candidates, approves or rejects each one, and approved items are merged into the existing static JSON data files alongside any manually curated entries. New scrapes in future run the same flow and merge with whatever already exists.

The page remains a static Astro site after this feature lands. There is no persistent backend database. The admin approval step is a local CLI/script workflow that produces updated JSON files, which are then committed and deployed.

---

## User Scenarios & Testing

### User Story 1 — Coach views a resource in-page without losing their place (Priority: P1)

A coach is browsing the Coaching Resources tab with several filters active. They find a relevant video and click to open it. The video plays in a near-fullscreen modal overlay. When they close the modal they are back on the exact same filtered view — their filters are still applied and the page has not navigated away.

**Why this priority**: Navigating away breaks the browsing flow and discards active filters. In-page display is the core UX improvement for all three resource types. Nothing else in this feature is more user-facing.

**Independent Test**: Open a resource card on the Coaching tab with at least one filter active. Confirm a modal opens. Confirm closing the modal returns to the same tab and filters remain applied.

**Acceptance Scenarios**:

1. **Given** a coach is on the Resources page with filters active, **When** they click a resource card, **Then** a near-fullscreen modal opens over the current page without a full navigation
2. **Given** a modal is open, **When** the user presses Escape or clicks the close button, **Then** the modal closes and the tab panel and active filters are restored exactly as they were before
3. **Given** a resource with `type: 'video'`, **When** the modal opens, **Then** the video is embedded inline in the modal using an iframe with standard player controls; the user does not navigate to YouTube or an external site
4. **Given** a resource with `type: 'pdf'` or `type: 'document'`, **When** the modal opens, **Then** the PDF renders inline at a size large enough to read without zooming; a visible download button is present
5. **Given** a resource with `type: 'link'`, **When** the user clicks the card, **Then** the link opens in a new browser tab (modal is not used for plain external links)
6. **Given** the modal is open on a 375px mobile viewport, **When** the user views a video, **Then** the video fills the available modal width, maintains a 16:9 aspect ratio, and all player controls are usable
7. **Given** the modal is open on a 375px mobile viewport, **When** the user views a PDF, **Then** the PDF is readable and a download button is accessible without scrolling past the document

---

### User Story 2 — Admin reviews and approves scraped resource candidates (Priority: P1)

An admin (club committee member or owner) runs a one-time scrape script against the target organisations. The script produces a candidate file listing found resources with their titles, URLs, types, and inferred categories. The admin opens that file, reviews each entry, marks approved/rejected, then runs a merge script. Approved entries are written into the relevant JSON data files alongside existing manual entries. Duplicate URLs are not created.

**Why this priority**: Without curated content in the JSON files, the resource cards show placeholder data. The pipeline is the mechanism for populating real content — it gates everything else.

**Independent Test**: Run the scrape script against at least one target source. Confirm a candidate file is produced. Mark some entries approved. Run the merge script. Confirm approved entries appear in the relevant JSON file and duplicates are not created if the same URL already exists.

**Acceptance Scenarios**:

1. **Given** the admin runs the scrape script, **When** it completes, **Then** a human-readable candidate file is produced listing each found resource with: title, source URL, inferred type (video/pdf/link), inferred category, and a status field defaulting to `pending`
2. **Given** the candidate file exists, **When** the admin sets a resource's status to `approved`, **Then** running the merge script adds that entry to the appropriate JSON data file
3. **Given** the candidate file exists, **When** the admin sets a resource's status to `rejected`, **Then** running the merge script skips that entry
4. **Given** a resource URL already exists in the target JSON file, **When** the merge script runs, **Then** the existing entry is not duplicated (idempotent merge on URL)
5. **Given** the merge script completes, **When** the admin inspects the JSON data files, **Then** approved entries are present and the file remains valid JSON conforming to the existing `Resource` interface
6. **Given** a resource is manually present in a JSON file (hand-authored), **When** the merge script runs, **Then** manually authored entries are preserved and not overwritten

---

### User Story 3 — Coach discovers curated skills and tactics content (Priority: P1)

A coach opens the Resources page and finds real, curated content focused on the priority areas: skills videos, man-to-man defence, zone defence, and 3 simple flow offensive systems. The resources are sourced from Basketball Victoria, Basketball Australia, NBL, WNBL, NBA, and WNBA.

**Why this priority**: Without real content, the page is a skeleton. This story validates that the pipeline has delivered usable resources and the right content categories are represented.

**Independent Test**: After merge, open the Coaching Resources tab and confirm at least one resource from the priority categories (man-to-man defence, zone defence, offensive systems, skills videos) is present with a working URL and correct category/ageGroup tags.

**Acceptance Scenarios**:

1. **Given** the merge has been run and approved entries are in the JSON files, **When** a coach opens the Coaching Resources tab, **Then** at least one entry is present in each of the priority content areas (man-to-man defence, zone defence, offensive systems)
2. **Given** resources from external sources are present, **When** the coach views a resource card, **Then** the source organisation is visible on the card (e.g., "Basketball Victoria", "NBA")
3. **Given** a scrape-sourced video resource is in the coaching JSON, **When** the coach opens it via the modal, **Then** the video plays inline without navigating away
4. **Given** the filters are applied for "Defence", **When** the coach views the filtered list, **Then** man-to-man and zone defence resources appear and are not filtered out

---

### Edge Cases

- **Scrape returns no results for a source**: The candidate file notes that source returned zero results. The merge script does not fail. Admin is not required to take action.
- **Scraped resource has no clear category**: Entry appears in candidate file with category marked `uncategorised`. Admin must manually assign a valid category before setting status to `approved`; the merge script MUST reject approved entries with `uncategorised` category and log a warning.
- **Scraped video URL is not a recognised embed provider**: Entry appears in candidate file but is flagged as `type: 'link'` (not `type: 'video'`), so it opens in a new tab rather than embedding in the modal. Admin may manually correct the type if the URL is a known embeddable format.
- **Duplicate URL in candidate file and existing JSON**: Merge script skips the entry and logs it as a skip (not an error). Admin can see the skip log.
- **Modal opened on a resource with `url: "#"` (placeholder)**: Modal MUST NOT open for placeholder resources. The card action link is disabled or shows a "Coming soon" state when `url` is `"#"`.
- **PDF fails to load in modal embed**: Display a fallback message within the modal: "This document could not be loaded. Use the download link below to open it directly." The download link must remain functional.
- **Video embed fails (video removed, private, or network error)**: Display a fallback message within the modal: "Video unavailable — it may have been removed. Try opening the direct link." Provide the original resource URL as a fallback link opening in a new tab.
- **Modal opened on very long title**: The modal header must truncate with ellipsis if the title overflows one line; full title accessible via `title` attribute or `aria-label`.
- **User opens modal, then resizes viewport between desktop and mobile**: Modal must remain usable at the new viewport size without requiring a page reload.
- **Candidate file contains a resource URL that is already broken at scrape time**: Scrape script should attempt a HEAD request to each URL and flag unreachable URLs in the candidate file as `status: pending, reachable: false`. Admin decides whether to include or exclude; the merge script does not block on this.

---

## Requirements

### Functional Requirements

**Modal Display**

- **FR-001**: System MUST open a near-fullscreen modal overlay when a user activates a resource card with `type: 'video'` or `type: 'pdf'` or `type: 'document'`
- **FR-002**: The modal MUST NOT trigger a page navigation; the URL MUST NOT change when the modal opens
- **FR-003**: Resources with `type: 'link'` MUST continue to open in a new tab; they MUST NOT use the modal
- **FR-004**: For `type: 'video'` resources, the modal MUST embed the video inline using a recognised embed provider format (YouTube embed URL derived from the stored URL; Vimeo embed URL where applicable); standard player controls (play, pause, volume, fullscreen, CC) MUST be enabled. URLs from unrecognised embed providers MUST fall back to the `type: 'link'` behaviour (new tab) rather than attempting an unsupported embed
- **FR-005**: For `type: 'pdf'` and `type: 'document'` resources, the modal MUST render the PDF using a native browser embed at a usable reading size; a visible download button using the `download` attribute MUST be present
- **FR-006**: The modal MUST display the resource title and source organisation (where present) in a clearly readable header
- **FR-007**: The modal MUST provide a visible close button and MUST also close on Escape keypress
- **FR-008**: When the modal closes, focus MUST return to the resource card that opened it; the tab panel and active filter state MUST be preserved
- **FR-009**: The modal MUST be near-fullscreen on desktop (covering at least 85% of viewport height and width with a visible darkened overlay backdrop) and MUST fill the full viewport height on mobile
- **FR-010**: If a resource `url` is `"#"`, the card action MUST be visually disabled or show a "Coming soon" label; the modal MUST NOT open for placeholder resources
- **FR-011**: For PDFs that fail to load in the modal embed, a fallback message and a direct download link MUST render within the modal
- **FR-012**: For videos that fail to load in the modal embed, a fallback message and a direct link to the original resource URL opening in a new tab MUST render within the modal

**Content Curation Pipeline**

- **FR-013**: A scrape script MUST accept a list of target source domains and produce a candidate JSON file. Target sources: Basketball Victoria, Basketball Australia, NBL, WNBL, NBA, WNBA
- **FR-014**: Each candidate entry MUST include: `title`, `sourceUrl`, `sourceDomain`, `inferredType` (`video | pdf | link`), `inferredCategory` (or `uncategorised`), `inferredAgeGroup` (or `All Ages` if not determinable), `reachable` (boolean HEAD check result), and `status` (`pending | approved | rejected`)
- **FR-015**: Content focus for the scrape MUST target: skills development videos, man-to-man defence, zone defence, and simple flow offensive systems. Pages clearly unrelated to these areas (merchandise, ticketing, media/press, player contracts) MUST be excluded from candidates.
- **FR-016**: A merge script MUST read an approved candidate file and write approved entries to the appropriate JSON data file (`coaching-resources.json` for coaching-audience content, `player-resources.json` for player-audience content). The routing decision MUST be driven by an `audience` field on each candidate entry (`'coaching' | 'player'`); the admin MUST set this field during review if the scrape cannot infer it; the merge script MUST reject approved entries with a missing or invalid `audience` value and log a warning
- **FR-017**: The merge script MUST be idempotent on `sourceUrl`: if an entry with the same URL already exists in the target JSON file, the entry MUST be skipped and logged
- **FR-018**: The merge script MUST skip any approved entry where `inferredCategory` is `uncategorised` and MUST log a warning identifying the skipped entry by title and URL
- **FR-019**: Manually authored entries already present in JSON data files MUST be preserved by the merge script; the script MUST NOT truncate or overwrite the file, only append new approved entries
- **FR-020**: After merge, all JSON data files MUST remain valid JSON conforming to the existing `Resource` interface defined in `src/lib/resources/types.ts`
- **FR-021**: Each merged resource entry MUST include a `sourceDomain` field identifying the originating organisation (e.g., `"Basketball Victoria"`) so it can be displayed on the resource card

**Resource Card Display**

- **FR-022**: Resource cards MUST display the `sourceDomain` field when present, rendered as a secondary label below the category badge
- **FR-023**: Resource cards MUST visually distinguish placeholder resources (`url: "#"`) from live resources — placeholder cards MUST show a "Coming soon" state and their action link MUST be non-interactive

### Non-Functional Requirements

- **NFR-001 (Accessibility — Modal)**: The modal MUST trap keyboard focus while open; Tab and Shift+Tab MUST cycle through modal controls only. Focus MUST not escape to the document behind the modal.
- **NFR-002 (Accessibility — Modal)**: The modal MUST be announced to screen readers using `role="dialog"` and `aria-modal="true"`. The modal title MUST be associated via `aria-labelledby`.
- **NFR-003 (Accessibility — Modal)**: The close button MUST have a visible label or `aria-label="Close"`. The Escape key MUST close the modal.
- **NFR-004 (Accessibility — Video embed)**: The video iframe MUST have a descriptive `title` attribute (e.g., `title="Zone Defence — Basketball Victoria"`).
- **NFR-005 (Accessibility — PDF embed)**: The PDF embed element MUST have a descriptive `title` attribute.
- **NFR-006 (Responsive)**: The modal MUST be verified at 375px, 768px, and 1440px viewports. On mobile, the modal fills the full viewport height. On desktop, the modal covers at least 85% of viewport height and width with a darkened overlay backdrop.
- **NFR-007 (No new heavy dependencies)**: The modal MUST be implemented using native HTML/CSS/JS (or minimal Astro-idiomatic code). A third-party modal library MUST NOT be introduced without a separate architectural decision.
- **NFR-008 (Performance)**: The modal MUST open within one animation frame of the user's click — no perceptible delay before the overlay appears. Video and PDF content may lazy-load within the open modal.
- **NFR-009 (Pipeline — No network calls at build time)**: The scrape script is a standalone local CLI tool. It MUST NOT run automatically at build time or deployment time. It is run manually by an admin once.
- **NFR-010 (Pipeline — Reproducible output)**: Running the merge script multiple times on the same approved candidate file MUST produce the same result (idempotent); no duplicate entries may accumulate.
- **NFR-011 (Consistency)**: Modal styling MUST use the existing Tailwind colour tokens (`brand-purple`, `brand-gold`, `brand-offwhite`, `brand-black`) and follow the established card and filter UI conventions.
- **NFR-012 (Error handling)**: No JavaScript console errors MAY occur during normal modal open/close interactions. Failed embed loads MUST be caught and surface the fallback UI silently (no uncaught exceptions).

### Key Entities

- **Resource** (existing interface, `src/lib/resources/types.ts`): All coached and player resources conform to this interface. The `sourceDomain` field is a new optional addition: `sourceDomain?: string` — the display name of the originating organisation (e.g., `"Basketball Victoria"`).

- **CandidateResource**: Produced by the scrape script. Not stored in the site permanently — it is an intermediate artefact used during admin review.
  - `title` (string)
  - `sourceUrl` (string): The full URL of the found resource
  - `sourceDomain` (string): Human-readable name of the source organisation
  - `inferredType` (`'video' | 'pdf' | 'link'`)
  - `inferredCategory` (string): One of the valid `CoachingCategory` values, or `'uncategorised'`
  - `inferredAgeGroup` (string): One of the valid `AgeGroup` values, or `'All Ages'`
  - `audience` (`'coaching' | 'player'`): Determines which JSON data file the entry is merged into. The scrape script should infer this where possible; the admin MUST set it before approving if it is absent or unclear.
  - `reachable` (boolean): Result of a HEAD request at scrape time
  - `status` (`'pending' | 'approved' | 'rejected'`): Set by admin during review; defaults to `'pending'`

- **ResourceModal** (new UI component): The overlay component that renders resource content in-page.
  - Accepts: resource title, url, type, sourceDomain
  - Renders: video iframe (for `video`), PDF embed + download link (for `pdf`/`document`), fallback states
  - Behaviour: focus trap, Escape to close, returns focus on close

---

## Success Criteria

- **SC-001**: All resource cards on the Coaching, Player, and Manager tabs open their content in the modal (for video/pdf/document types) without navigating away from the page
- **SC-002**: Active filters and tab state are fully preserved after closing the modal — no filter reset occurs
- **SC-003**: The scrape script produces a candidate file containing at least one result from at least three of the six target sources and a minimum of ten candidate entries in total on a live run
- **SC-004**: The merge script successfully adds approved candidates to the correct JSON file with no duplicate entries when run twice on the same candidate file
- **SC-005**: After merge, at least one resource from each of the priority content areas (man-to-man defence, zone defence, offensive systems) is present and openable in the modal
- **SC-006**: The modal passes keyboard navigation: focus is trapped while open, Escape closes it, focus returns to the triggering card
- **SC-007**: No WCAG 2.1 AA violations detected in the modal via axe DevTools
- **SC-008**: Modal layout verified at 375px, 768px, and 1440px viewports with no overflow or broken aspect ratios
- **SC-009**: No JavaScript console errors during modal open, content display, and close interactions
- **SC-010**: Placeholder resource cards (`url: "#"`) display a "Coming soon" state and do not open the modal

---

## Acceptance Criteria

1. **Given** a coach clicks a resource card with `type: 'video'`, **When** the click is registered, **Then** a near-fullscreen modal opens with the video embedded inline and no page navigation occurs
2. **Given** a coach clicks a resource card with `type: 'pdf'` or `type: 'document'`, **When** the click is registered, **Then** a near-fullscreen modal opens displaying the PDF at a readable size with a download button present
3. **Given** a resource card with `type: 'link'`, **When** the user activates the card, **Then** the URL opens in a new tab and no modal appears
4. **Given** the modal is open, **When** the user presses Escape, **Then** the modal closes without triggering navigation and focus returns to the resource card that originally opened it
5. **Given** the modal is open, **When** the user clicks the close button, **Then** the modal closes and focus returns to the resource card that opened it
6. **Given** filters are active on the Coaching tab before opening a modal, **When** the modal is closed, **Then** the same filters remain applied and the Coaching tab is still active
7. **Given** the modal is open on a 375px viewport displaying a video, **When** the user views the content, **Then** the video fills the modal width, maintains a 16:9 aspect ratio, and player controls are usable
8. **Given** a video embed within the modal fails to load, **When** the embed error is detected, **Then** a fallback message and a direct link to the resource URL appear in place of the embed
9. **Given** a PDF embed within the modal fails to load, **When** the embed error is detected, **Then** a fallback message and a direct download link appear within the modal
10. **Given** the modal is open, **When** the user tabs through the modal, **Then** focus cycles only within the modal controls and does not reach the document behind it
11. **Given** a resource card has `url: "#"`, **When** the page renders that card, **Then** the card shows a "Coming soon" label and the action button is non-interactive
12. **Given** the modal is open and the user resizes the viewport between mobile (375px) and desktop (1440px), **When** the resize completes, **Then** the modal remains visible and usable at the new viewport size without requiring a page reload, and no content overflows or becomes inaccessible
13. **Given** the modal is open and displays a resource with a title longer than one line, **When** the modal header renders, **Then** the title is truncated with an ellipsis and the full title is accessible via the element's `title` attribute or `aria-label`
14. **Given** the admin runs the scrape script against a configured source, **When** the script completes, **Then** a candidate JSON file exists containing entries with title, sourceUrl, sourceDomain, inferredType, inferredCategory, audience, reachable status, and a default `status: "pending"`
15. **Given** the scrape script targets a source and that source returns zero matching resources, **When** the script completes, **Then** the candidate file notes that the source returned zero results, the script exits successfully (non-error), and no action is required from the admin for that source
16. **Given** the candidate file has entries with `status: "approved"`, **When** the admin runs the merge script, **Then** approved entries are appended to the correct JSON data file determined by the `audience` field; existing entries are untouched; the file remains valid JSON
17. **Given** an approved candidate URL already exists in the target JSON file, **When** the merge script runs, **Then** the entry is skipped and a skip message is logged; no duplicate is created
18. **Given** an approved candidate has `inferredCategory: "uncategorised"`, **When** the merge script runs, **Then** that entry is skipped and a warning is logged identifying it by title and URL
19. **Given** an approved candidate has a missing or invalid `audience` value, **When** the merge script runs, **Then** that entry is skipped and a warning is logged identifying it by title and URL
20. **Given** the Resources page is viewed with an axe accessibility audit, **When** the modal is open, **Then** no critical or serious WCAG 2.1 AA violations are reported

---

## Open Questions for Owner

The following items require a decision before implementation begins:

**OQ-1 — Source scrape scope**: The Linear issue lists six target organisations (Basketball Victoria, Basketball Australia, NBL, WNBL, NBA, WNBA). Are there specific sections or URL patterns within those sites to target (e.g., `/coaching`, `/resources`, `/videos`)? Or should the scrape attempt general discovery from the homepage? This affects scrape quality and avoids crawling irrelevant sections.

**OQ-2 — Admin review format**: Should the candidate file be a JSON file edited in a text editor, a simple CLI prompt-and-confirm flow, or something else? The spec currently assumes a JSON file the admin edits manually — confirm this is the intended workflow.

**OQ-3 — `sourceDomain` display on cards**: The spec adds `sourceDomain` as an optional field on resource cards. Should this be shown on existing placeholder cards that have no source domain (e.g., the current `coaching-001` through `coaching-015` entries)? If yes, what should display for manually curated entries with no source org — omit the label, or show "Bendigo Phoenix"?

**OQ-4 — Category mapping for scrape**: The existing `CoachingCategory` type has: Defence, Offence, Drills, Fundamentals, Game Plans, Tools. Should "man-to-man defence" and "zone defence" both map to the existing `Defence` category, or should a new subcategory be introduced? A new category would require updating the filter chips.

**OQ-5 — Modal backdrop behaviour on desktop**: Should clicking the backdrop (outside the modal content area) close the modal, in addition to the close button and Escape key?

---

## Constitutional Compliance

- **Principle I (User Outcomes First)**: Each user story has a measurable independent test. Success criteria are observable and trace to user behaviour (browsing without navigation loss, reviewing curated content). PASS.

- **Principle II (Test-First Discipline)**: Acceptance criteria are defined in Given/When/Then format before implementation. Manual QA is specified through success criteria and acceptance criteria. PASS.

- **Principle III (Backend Authority & Invariants)**: No backend — this is a static Astro site. The scrape and merge pipeline runs locally and produces static JSON. No server-side invariants are in scope. The merge script enforces the data contract (valid JSON, no duplicates, no uncategorised entries). N/A for backend authority; pipeline integrity is enforced at the script level. PASS.

- **Principle IV (Error Semantics & Observability)**: Modal failure states for broken PDFs and failed video embeds are specified in FR-011, FR-012, and edge cases. Console errors from uncaught embed failures are explicitly ruled out (NFR-012). Skip and warning logs from the merge script are specified in FR-017, FR-018. PASS.

- **Principle V (AppShell Integrity)**: The modal renders over the existing Resources page within `BaseLayout`. No custom navigation shell is introduced. The modal is an overlay component, not a new route. PASS.

- **Principle VI (Accessibility First)**: Focus trapping (NFR-001), `role="dialog"` and `aria-modal` (NFR-002), close button `aria-label` (NFR-003), descriptive `title` on iframe and embed (NFR-004, NFR-005), and accessibility auditing in success criteria (SC-007) are all specified. PASS.

- **Principle VII (Immutable Data Flow)**: The merge script appends to static JSON files — it does not mutate existing entries. The modal holds no persistent state — it reads from the resource data and renders. Tab and filter state is preserved across modal open/close without mutation of the underlying data. PASS.

- **Principle VIII (Dependency Hygiene)**: NFR-007 explicitly prohibits introducing a third-party modal library. The video embed uses native iframe. The PDF embed uses native browser embed. No new runtime dependencies are required. PASS.

- **Principle IX (Cross-Feature Consistency)**: Modal styling follows existing Tailwind colour tokens and card UI conventions (NFR-011). The `sourceDomain` field extension to `Resource` is additive and optional — it does not break existing data files. The scrape/merge pipeline follows the same JSON file pattern already used by all resource data files. PASS.

**Warnings**:

- WARN: `Resource` interface extension (`sourceDomain?: string`) is additive, but the existing `types.ts` definition will need updating. This is low risk but must be coordinated if COA-26 work is still open on a separate branch — confirm no merge conflict before implementing.
- WARN: OQ-1 through OQ-5 above are not blocking implementation of the modal (User Story 1), but OQ-1 and OQ-2 are blocking the pipeline work (User Story 2). Modal implementation can proceed independently while pipeline questions are resolved.
