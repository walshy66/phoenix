# Spec: coa-61-seasons-update

**Status**: READY_FOR_DEV
**Feature Branch**: `cameronwalsh/coa-61-seasons-update`
**Created**: 2026-04-16
**Priority**: P1/P2

## Summary

This feature adds a Season Information section to the existing Seasons page (`/seasons`) consisting of 4 clickable cards: Training, Uniforms, Clearances, and Registration. Each card opens a modal displaying structured sub-cards with relevant season information. The modals reuse the site's established modal pattern (consistent with `ResourceModal.astro`) and the sub-card component is a new reusable primitive. The page currently has a working Training Information section, a 4-tile season navigation grid, a Slam Dunk Financial Assistance callout, and a conditional Grading Information section — all of which MUST be preserved.

This feature adds a new Season Information section in place of the existing Club Training Information (venue cards) section — it directly replaces that section's position in `seasons.astro`. It does not modify the season tile navigation, Slam Dunk Financial Assistance callout, or conditional Grading Information section.

---

## User Scenarios & Testing

### User Story 1 — View Training Information (Priority: P1)

A site visitor wants to learn about training schedules, times, and venues for the season. They click the Training card in the Season Information section and a modal opens showing training content in 2 sub-cards.

**Why this priority**: Training information is critical for new and existing members; it is one of the first things people look for when arriving at the Seasons page.

**Independent Test**: Click the Training card and verify the modal opens with 2 venue sub-cards (BSE and VCC) displaying location, schedule, and map link without breaking the page layout.

**Acceptance Scenarios**:

1. **Given** the Seasons page is displayed, **When** the user clicks the Training card in the Season Information section, **Then** a modal opens displaying 2 venue sub-cards (one per training location).
2. **Given** the Training modal is open, **When** the user examines the sub-cards, **Then** each sub-card displays the venue name, address, training schedule (day, time slots, and age groups), and a "View on map" link — and both sub-cards are consistently sized and styled.
3. **Given** the Training modal is open, **When** the user clicks outside the modal or clicks the close button (X), **Then** the modal closes, the page returns to its normal scroll position, and focus returns to the Training card that triggered the modal.
4. **Given** the Training modal is open, **When** the user presses the Escape key, **Then** the modal closes and focus returns to the Training card.
5. **Given** the Training modal is open on a mobile screen (less than 640px), **When** the page renders, **Then** the 2 sub-cards stack vertically within the modal and the layout does not overflow or break.

---

### User Story 2 — View Uniform Information (Priority: P1)

A site visitor needs details about team uniforms. They click the Uniforms card and a modal opens showing 4 uniform-related sub-cards in a 2x2 grid.

**Why this priority**: Uniform information is essential for team preparation and onboarding; it is part of the core seasonal information required before the season starts.

**Independent Test**: Click the Uniforms card and verify the modal opens with exactly 4 sub-cards arranged in a 2x2 grid, each covering one uniform topic.

**Acceptance Scenarios**:

1. **Given** the Seasons page is displayed, **When** the user clicks the Uniforms card, **Then** a modal opens displaying 4 uniform sub-cards in a 2x2 grid layout.
2. **Given** the Uniforms modal is open, **When** the user examines the 4 sub-cards, **Then** each sub-card covers one of: How To, Numbers, Loan, and 2nd Hand, with consistent sizing and styling across all 4.
3. **Given** the Uniforms modal is open, **When** the modal content exceeds the visible modal height, **Then** the modal content area scrolls smoothly without the modal header or close button scrolling out of view.
4. **Given** the Uniforms modal is open on a mobile screen (less than 640px), **When** the page renders, **Then** the 4 sub-cards stack into a single column (not a 2x2 grid) and remain fully readable.
5. **Given** the Uniforms modal is open, **When** the user closes it, **Then** the modal closes and focus returns to the Uniforms card.

---

### User Story 3 — View Registration Information (Priority: P1)

A site visitor wants to register for the season. They click the Registration card and a modal opens with 2 registration-related sub-cards.

**Why this priority**: Registration is essential for team participation and is often time-sensitive; this is core seasonal information alongside Training.

**Independent Test**: Click the Registration card and verify the modal opens with 2 registration sub-cards in a consistent layout matching the Training modal.

**Acceptance Scenarios**:

1. **Given** the Seasons page is displayed, **When** the user clicks the Registration card, **Then** a modal opens displaying 2 registration sub-cards.
2. **Given** the Registration modal is open, **When** the user examines the sub-cards, **Then** each sub-card displays its image and associated content (title, description, or CTA) with consistent styling matching Training and Uniforms modals.
3. **Given** the user has opened the Training modal and then opens the Registration modal, **When** both are viewed in sequence, **Then** the modal container dimensions, sub-card sizing, header styling, and close button position are visually consistent between the two.
4. **Given** the Registration modal is open, **When** the user closes it, **Then** the modal closes and focus returns to the Registration card.

---

### User Story 4 — Complete Clearances via External Portal (Priority: P2)

A site visitor needs to complete their clearances before playing. They click the Clearances card, see a single centered sub-card with an image, and click the image to navigate to the external clearance portal.

**Why this priority**: Clearances are mandatory but typically completed once per season by a subset of players; less urgent than the registration and uniform modals but still a required part of the seasonal information set.

**Independent Test**: Click the Clearances card, verify the modal opens with 1 centered sub-card, and verify clicking the image opens the external clearance link in a new tab.

**Acceptance Scenarios**:

1. **Given** the Seasons page is displayed, **When** the user clicks the Clearances card, **Then** a modal opens displaying 1 clearance sub-card centered with generous surrounding padding.
2. **Given** the Clearances modal is open, **When** the user views the sub-card, **Then** the image is visually identifiable as clickable via a pointer cursor on hover and a visible hover state (e.g., opacity change or border highlight).
3. **Given** the Clearances modal is open, **When** the user clicks the image, **Then** the external clearance link opens in a new browser tab and the modal remains open (the click does not close the modal).
4. **Given** the Clearances modal is open, **When** the user closes it via the X button, Escape key, or clicking outside, **Then** the modal closes and focus returns to the Clearances card.
5. **Given** the Clearances modal is open on a mobile screen, **When** the page renders, **Then** the centered sub-card scales appropriately and the clickable image meets the 44x44px minimum touch target requirement.

---

### Edge Cases

- **Sub-card image fails to load**: A placeholder or broken-image treatment is shown; the sub-card layout does not collapse or overflow. Other sub-cards in the same modal are unaffected.
- **Very long text in a sub-card**: Text truncates or wraps gracefully; sub-card does not expand and break the grid. Modal layout is preserved.
- **Clearance external link is unreachable or returns a non-2xx status**: The link remains clickable and opens in a new tab. The external site is responsible for handling the error; the modal does not validate or monitor external link health. If the link becomes permanently invalid, it MUST be updated in the static data file by the content owner, and no special error UI is required within the modal.
- **Modal opened on very small mobile screen (less than 375px)**: Modal takes full width; sub-cards stack vertically; no horizontal overflow or clipped content.
- **User opens a modal and uses browser back button**: Back button behaviour is browser-native; if it closes the modal, the page state should remain valid. If it navigates away, return to `/seasons` should restore the page normally (no modal open by default).
- **Multiple rapid clicks on a Season Information card**: Modal opens only once; no stacking or duplicate modals are rendered.
- **Keyboard-only user navigating the Season Information section**: All 4 cards are reachable via Tab, activatable via Enter or Space, and the modal is fully operable (Tab between elements, Escape to close, focus trap within modal) without a mouse.

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST render a Season Information section on the Seasons page containing exactly 4 cards: Training, Uniforms, Clearances, and Registration.
- **FR-002**: System MUST open a modal when any of the 4 Season Information cards is clicked or activated via keyboard (Enter or Space).
- **FR-003**: System MUST display sub-cards within each modal using a consistent sub-card component with uniform dimensions, padding, border, and shadow across all modals. All sub-cards MUST have explicit `width` and `height` attributes on images and a consistent maximum width (e.g., 320px on desktop, 100% on mobile <640px) to prevent layout shift. All sub-cards MUST maintain a consistent aspect ratio (e.g., 16:9 or 1:1) across all 4 modals.
- **FR-004**: Training modal MUST display exactly 2 venue sub-cards sourced from `src/data/venues.ts` (BSE and VCC), showing venue name, address, training schedule, and map link. Layout: 2-column grid (Tailwind `grid-cols-2`) on desktop (≥640px), 1-column grid (Tailwind `grid-cols-1`) on mobile (<640px).
- **FR-005**: Uniforms modal MUST display exactly 4 sub-cards in a 2x2 grid (Tailwind `grid-cols-2`) on desktop (≥640px) and a single column (Tailwind `grid-cols-1`) on mobile (<640px).
- **FR-006**: Clearances modal MUST display exactly 1 sub-card, horizontally centered with generous padding on all sides using Tailwind `flex justify-center`.
- **FR-007**: Registration modal MUST display exactly 2 sub-cards. Layout: 2-column grid (Tailwind `grid-cols-2`) on desktop (≥640px), 1-column grid (Tailwind `grid-cols-1`) on mobile (<640px).
- **FR-008**: Each sub-card MUST display at minimum an image and associated content (title, description, or CTA text). The Clearance sub-card image MUST also function as a clickable link.
- **FR-009**: Clearance sub-card image link MUST open the external clearance URL in a new browser tab (`target="_blank" rel="noopener noreferrer"`).
- **FR-010**: System MUST close the active modal when the user clicks outside the modal container (on the backdrop), clicks the dedicated close button (X), or presses the Escape key.
- **FR-011**: All modals MUST trap focus within the modal while open; Tab and Shift+Tab MUST cycle through focusable elements inside the modal only.
- **FR-012**: On modal close, focus MUST return to the Season Information card that triggered the modal.
- **FR-013**: Only one modal MUST be open at a time. If a user clicks a Season Information card while another modal is open, the currently-open modal MUST close immediately before the new modal opens. This "close-first" behavior ensures a single, predictable modal state.
- **FR-014**: The Season Information section MUST replace the existing Club Training Information (venue cards) section in `seasons.astro` at the same position. The season tile navigation grid, Slam Dunk Financial Assistance callout, and the conditional Grading Information section MUST remain intact and unmodified.
- **FR-015**: Image sub-card content (images, titles, descriptions, and external URLs for Uniforms, Clearances, and Registration modals) MUST be sourced from a static data file in `src/data/`. Training sub-card content MUST be sourced directly from the existing `src/data/venues.ts` `VENUES` array — no duplicate data entry.

### Non-Functional Requirements

**Accessibility (WCAG 2.1 AA)**

- **NFR-001**: All 4 Season Information cards MUST be keyboard accessible — Tab to focus, Enter or Space to open the modal, and visible focus ring using `focus-visible` styles consistent with the existing `SeasonTile.astro` pattern (`focus-visible:ring-2 focus-visible:ring-brand-purple`).
- **NFR-002**: Each Season Information card MUST have a descriptive `aria-label` attribute — for example: "Training — view training information" and "Uniforms — view uniform details".
- **NFR-003**: Each modal MUST have `role="dialog"`, `aria-modal="true"`, and an `aria-labelledby` attribute pointing to the modal title element, consistent with the `ResourceModal.astro` pattern.
- **NFR-004**: The modal close button MUST have `aria-label="Close [modal name]"` and meet the 44x44px minimum touch target size.
- **NFR-005**: All interactive elements within modals (close button, clearance image link) MUST be keyboard operable and included in the modal focus trap.
- **NFR-006**: The clearance image link MUST have a descriptive `aria-label` (e.g., "Open clearance portal in a new tab") since it is an image-only link with no visible text label.
- **NFR-007**: Text contrast for sub-card titles and descriptions against their background MUST meet WCAG AA minimum (4.5:1 for normal text under 18pt).
- **NFR-008**: All interactive elements (Season Information cards, modal close button, clearance image link) MUST have a minimum touch target size of 44x44px on mobile.

**Responsive Design**

- **NFR-009**: The Season Information card grid MUST use mobile-first layout: single column on mobile (less than 640px), 2 columns on tablet (640px to 1024px), and 4 columns on desktop (greater than 1024px), consistent with the season tile grid breakpoints established in COA-45.
- **NFR-010**: Modals MUST be full-screen on mobile and floating (max-width constrained, with rounded corners) on tablet and desktop, consistent with `ResourceModal.astro` behaviour.
- **NFR-011**: Sub-card grids within modals MUST reflow to a single column on mobile (less than 640px); the Uniforms 2x2 grid becomes a 1-column stack.

**AppShell / Layout**

- **NFR-012**: The Season Information section MUST render inside the existing `BaseLayout.astro` wrapper used by `seasons.astro` — no custom navigation shell.
- **NFR-013**: The modal overlay MUST use `document.body.classList.add('overflow-hidden')` when open and remove it on close, consistent with the `ResourceModal.astro` pattern, to prevent page scroll behind the modal.

**Styling**

- **NFR-014**: Modals MUST use a subtle backdrop (approximately 10–20% black opacity overlay, or equivalent) rather than a heavy black mask, to maintain a floating, elevated feel consistent with the design direction.
- **NFR-015**: Modal containers MUST use the site's design system tokens: `bg-brand-offwhite` or `bg-white` background, `brand-purple` accents, `brand-gold` highlights, `rounded-xl`, and `shadow-xl`, consistent with the `ResourceModal.astro` container styling.
- **NFR-016**: Season Information cards MUST be visually distinct from the existing season navigation tiles (`SeasonTile.astro`) to avoid user confusion between the two sections. A section heading ("Season Information" or equivalent) and distinct card styling MUST differentiate the two.

**Error Handling**

- **NFR-017**: If a sub-card image fails to load, the sub-card MUST render a visible placeholder (e.g., a neutral background with an icon or alt text area) without collapsing its layout or breaking the modal grid.
- **NFR-018**: If the static data file for Season Information card content is missing or malformed, the page MUST still render without a runtime error — the Season Information section MUST either be omitted or show a safe empty state.

**Performance**

- **NFR-019**: Season Information cards and modal content MUST be rendered from static data at build time — no API call MUST block First Contentful Paint.
- **NFR-020**: Sub-card images MUST use `loading="lazy"` and appropriate `width` and `height` attributes to prevent layout shift. All sub-card images MUST be optimized (WebP preferred, JPEG fallback) and compressed to under 100KB each. At build time, images MUST be validated for accessibility (non-empty `alt` text) and correct dimensions (matching declared `width`/`height` attributes). Images that fail validation MUST trigger a build warning (not an error, to allow graceful degradation per NFR-018).

---

### Key Entities

**Season Information Card**

Top-level clickable card in the Season Information section. Triggers a modal on click.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (e.g., `"training"`, `"uniforms"`, `"clearances"`, `"registration"`) |
| `label` | `string` | Display label on the card (e.g., `"Training"`) |
| `icon` | `string` | Emoji or icon identifier for the card face |
| `description` | `string` | Short teaser text displayed on the card |
| `modalTitle` | `string` | Title shown in the modal header when this card is opened |
| `subCards` | `SubCard[]` | Ordered list of sub-cards to render inside the modal |

Concrete instances:

| id | label | Sub-card count | Layout |
|---|---|---|---|
| `training` | Training | 2 | Side-by-side (desktop), stacked (mobile) |
| `uniforms` | Uniforms | 4 | 2x2 grid (desktop), single column (mobile) |
| `clearances` | Clearances | 1 | Centered with padding |
| `registration` | Registration | 2 | Side-by-side (desktop), stacked (mobile) |

**Sub-Card**

Sub-cards come in two variants depending on the modal:

*Image sub-card* — used for Uniforms, Clearances, and Registration modals.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Unique identifier within the parent card's sub-card array |
| `title` | `string` | Yes | Sub-card heading |
| `description` | `string \| null` | No | Supporting text or description |
| `imageSrc` | `string` | Yes | Path to image (relative to `public/` or absolute URL) |
| `imageAlt` | `string` | Yes | Descriptive alt text for the image (required for accessibility) |
| `linkUrl` | `string \| null` | No | External URL if the sub-card image is a clickable link |
| `linkLabel` | `string \| null` | No | Accessible label for the link (required when `linkUrl` is set) |

*Venue sub-card* — used exclusively by the Training modal. Sourced directly from `src/data/venues.ts` (`VENUES` array). No images. Each venue card displays:

| Field | Source | Description |
|---|---|---|
| `name` | `venue.name` | Venue full name (e.g. "Bendigo South East College") |
| `shortCode` | `venue.shortCode` | Short identifier (e.g. "BSE") |
| `address` | `venue.address` | Full street address |
| `trainingSchedule` | `venue.trainingSchedule` | Array of sessions: day, time slots, age groups |
| `mapUrl` | `venue.mapUrl` | Google Maps link — rendered as an accessible "View on map" link |

The Training modal renders the `VENUES` array directly — no separate static data file entry is needed for the Training sub-cards. The existing `src/data/venues.ts` is the source of truth.

Note: The Clearances sub-card is the only image sub-card where `linkUrl` is set. All other image sub-cards are display-only.

**Season Information Modal**

Container that opens on Season Information card click. Wraps sub-cards and handles open/close behaviour.

| Attribute | Value |
|---|---|
| `role` | `"dialog"` |
| `aria-modal` | `"true"` |
| `aria-labelledby` | ID of the modal title `<h2>` element |
| Dismiss triggers | Backdrop click, close button click, Escape key |
| Focus on open | Close button receives focus immediately on open |
| Focus on close | Returns to the triggering Season Information card |
| Body scroll | `overflow-hidden` applied to `<body>` while open |

---

## Success Criteria

- **SC-001**: All 4 Season Information cards are visually distinct from each other and from the existing season navigation tiles; each card has a clear label and is identifiable as clickable.
- **SC-002**: Modal opens within 200ms of card click (smooth perceived response, no visible delay).
- **SC-003**: Sub-cards render with consistent dimensions and spacing across all 4 modals; no sub-card size discrepancy is visible when switching between modals.
- **SC-004**: The Uniforms modal displays 4 sub-cards in a 2x2 grid on desktop (greater than 640px) and a 1-column stack on mobile (less than 640px), without overflow.
- **SC-005**: The Clearances sub-card image link opens the external clearance URL in a new tab without closing the modal.
- **SC-006**: Broken sub-card images show a visible placeholder; the modal layout is not broken by the missing image.
- **SC-007**: All 4 modals are keyboard operable: Tab to navigate within, Escape to close, and focus returns to the triggering card on close.
- **SC-008**: The Season Information section is present on the Seasons page in place of the Club Training Information (venue cards) section; the season tile grid, financial assistance callout, and grading section remain intact.
- **SC-009**: On a 320px viewport, the Season Information card grid and all modal sub-card layouts render without horizontal overflow or clipped content.

---

## Acceptance Criteria

1. **Given** the Seasons page loads, **When** the page renders, **Then** a Season Information section is visible containing exactly 4 cards: Training, Uniforms, Clearances, and Registration — in that order.
2. **Given** I click the Training card, **When** the modal opens, **Then** 2 sub-cards are displayed inside the modal with consistent styling.
3. **Given** I click the Uniforms card, **When** the modal opens, **Then** 4 sub-cards are displayed in a 2x2 grid on desktop.
4. **Given** I click the Uniforms card on a mobile device (less than 640px), **When** the modal opens, **Then** the 4 sub-cards are displayed in a single column stack.
5. **Given** I click the Registration card, **When** the modal opens, **Then** 2 sub-cards are displayed inside the modal with styling consistent with the Training modal.
6. **Given** I click the Clearances card, **When** the modal opens, **Then** 1 sub-card is displayed, horizontally centered with visible surrounding padding.
7. **Given** the Clearances modal is open, **When** I click the sub-card image, **Then** the external clearance URL opens in a new browser tab and the modal remains open.
8. **Given** any modal is open, **When** I click the X close button, **Then** the modal closes and focus returns to the card that opened it.
9. **Given** any modal is open, **When** I press the Escape key, **Then** the modal closes and focus returns to the card that opened it.
10. **Given** any modal is open, **When** I click the backdrop (outside the modal panel), **Then** the modal closes.
11. **Given** any modal is open, **When** I press Tab repeatedly, **Then** focus cycles only through elements within the modal (focus trap active); focus does not move to elements behind the modal.
12. **Given** I Tab to a Season Information card and press Enter or Space, **When** the modal opens, **Then** the modal opens the same as a mouse click and focus moves to the close button.
13. **Given** the Seasons page renders, **When** I inspect the page sections, **Then** the Season Information section has replaced the Club Training Information (venue cards) section, and the season tile grid, Slam Dunk Financial Assistance callout, and conditional Grading Information section are all still present and unmodified.
14. **Given** the page renders on desktop (greater than 1024px), **When** I view the Season Information section, **Then** all 4 cards are displayed in a single horizontal row (4 columns).
15. **Given** the page renders on mobile (less than 640px), **When** I view the Season Information section, **Then** the 4 cards stack into a single column.
16. **Given** a sub-card image fails to load in any modal, **When** the broken image renders, **Then** a visible placeholder appears and the modal layout is not broken.
17. **Given** the Clearances modal is open and the external clearance link is unreachable, **When** the user clicks the clearance image, **Then** the user's browser attempts to navigate to the URL in a new tab, and any resulting error (404, timeout, etc.) is handled by the browser and the external server, not by the modal.

---

## Constitutional Compliance

**Principle I (User Outcomes First)**
PASS. All 4 user stories have explicit, testable outcomes: the user can access specific information (training, uniforms, registration, clearances) via a modal without leaving the Seasons page. Success criteria are observable and do not require instrumentation. SC-008 explicitly validates that existing page value is preserved.

**Principle II (Test-First Discipline)**
PASS. All 16 acceptance criteria are in Given/When/Then format and are independently testable with static data before any content images or external URLs are finalised. The new sub-card component and modal trigger can be tested in isolation (open/close behaviour, focus trap, keyboard activation) before sub-card content is populated.

WARN: Sub-card image `src` values and external clearance URL must be confirmed before implementation begins. Tests that validate image rendering or clearance link destination will need these values. Placeholder values in the static data file will allow structural tests to pass; content tests are blocked on content being provided.

**Principle III (Backend Authority and Invariants)**
PASS. This feature is entirely static. All Season Information card configuration, sub-card content, and external URLs are sourced from a static data file at build time. No server-side data is fetched and no client-side state is inferred from a server response. There is no backend interaction.

**Principle IV (Error Semantics and Observability)**
PASS. NFR-017 and NFR-018 define explicit degradation behaviour for missing images and malformed data. SC-006 and AC-16 confirm the image fallback requirement is testable. No silent failures are permitted — if the static data is missing, the section must either be omitted or show a safe empty state (NFR-018), not throw a runtime error.

**Principle V (AppShell Integrity)**
PASS. NFR-012 explicitly requires the Season Information section to render inside the existing `BaseLayout.astro` used by `seasons.astro`. No custom navigation shell is introduced. NFR-013 requires body scroll lock on modal open (consistent with `ResourceModal.astro`). AC-13 confirms all existing preserved sections remain intact.

RESOLVED: The Season Information section replaces the Club Training Information (venue cards) section at its current position in `seasons.astro`.

**Principle VI (Accessibility First)**
PASS. NFR-001 through NFR-008 cover: keyboard activation of all 4 cards, descriptive `aria-label` on each card, `role="dialog"` / `aria-modal="true"` / `aria-labelledby` on each modal, 44x44px touch targets, focus trap within modals, focus return on close, and WCAG AA contrast for sub-card text. The clearance image link requires a descriptive `aria-label` (NFR-006) since it is an image-only link. AC-11 and AC-12 verify keyboard behaviour.

WARN: Sub-card image `imageAlt` values must be provided as non-empty, descriptive strings in the static data file before implementation. An empty `alt=""` would be appropriate only if the image is decorative, but since sub-cards rely on images to convey information content, meaningful alt text is required. This is a content-provision dependency, not a spec gap.

**Principle VII (Immutable Data Flow)**
PASS. Data flows unidirectionally: static data file (build-time) → Astro component → rendered HTML. Client-side JavaScript handles only modal open/close and focus management. No client-side data inference or state mutation occurs.

**Principle VIII (Dependency Hygiene)**
PASS. No new third-party dependencies are introduced. The modal pattern reuses the existing JavaScript approach from `ResourceModal.astro`. The sub-card component uses existing Tailwind utility classes and Astro component patterns.

**Principle IX (Cross-Feature Consistency)**
PASS. The modal interaction model (click to open, Escape to close, backdrop click to close, focus trap, body scroll lock, focus return to trigger) directly mirrors `ResourceModal.astro`. Season Information cards use `focus-visible:ring-2 focus-visible:ring-brand-purple` consistent with `SeasonTile.astro`. Sub-card image loading uses `loading="lazy"` consistent with the image loading patterns in the hero carousel and resource cards. Static data is placed in `src/data/` consistent with `src/data/venues.ts`.

---

## Open Questions

All open questions resolved.

| # | Question | Resolution |
|---|---|---|
| OQ-001 | What images are available for each sub-card? | Images are in the `uploads/` folder. Implementer to match image files to sub-cards during data file creation. |
| OQ-002 | What is the external URL for the Clearances sub-card image link? | `https://form.jotform.com/222288044427860` (opens in new tab) |
| OQ-003 | Where does the Season Information section sit in `seasons.astro`? | Replaces the Club Training Information (venue cards) section at its current position. |
| OQ-004 | What are the titles and descriptions for each sub-card? | Titles derived from image content / uploads folder. Placeholder text acceptable during dev; final copy to be confirmed by content owner before launch. |
| OQ-005 | What happens when a modal is open and another card is clicked? | Close the first modal before opening the second (close-first behaviour). |
