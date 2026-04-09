# Spec: COA-34 — Get Involved Page: Images & Real Data

**Status**: READY_FOR_DEV
**Source**: Linear COA-34
**Priority**: High
**Feature Branch**: `coa-34-get-involved-images`
**Created**: 2026-04-08
**Depends On**: COA-30 (Get Involved page structure, events system, EventTile/EventModal components)

## Summary

The Get Involved page (built in COA-30) currently has no real event data or images. This feature populates the events gallery with 14 real club event posters sourced from the legacy Joomla site and club social media. Each image becomes an event entry in `src/data/events.md` with proper metadata, alt text, and optimised assets placed in `public/images/events/`. No structural or component changes are expected — this is a data and asset integration task.

---

## User Scenarios & Testing

### User Story 1 — Populate Events Gallery with Real Club Posters (Priority: P1)

A visitor arrives at the Get Involved page and sees a gallery of real club event posters spanning May 2025 to March 2026, giving them an immediate sense of the club's activity and community presence.

**Why this priority**: The page exists but is empty. Without real content it has no value. This is the minimum viable content to make the page useful.

**Independent Test**: Load `/get-involved` in a browser. Verify all 14 event images render correctly in the Events Gallery, display proper alt text, are responsive across viewports, and load within acceptable time.

**Acceptance Scenarios**:

1. Given the 14 event images are placed in `public/images/events/`, When the Get Involved page loads, Then all 14 images display in the Events Gallery section without broken image indicators.
2. Given the page is viewed on desktop (>1024px), When the user views the events grid, Then images display in a multi-column grid matching the existing EventTile layout from COA-30.
3. Given the page is viewed on mobile (<640px), When the user views the events grid, Then images stack responsively and maintain aspect ratio without horizontal overflow.
4. Given each event entry in events.md, When a user inspects or uses a screen reader, Then each image has descriptive alt text matching the inventory table below.
5. Given the page loads on standard broadband, When performance is measured, Then all event images load and are visible within 3 seconds (consistent with COA-30 NFR-013).

---

### User Story 2 — Click Event Poster for Details (Priority: P1)

A visitor clicks on an event poster tile and sees a modal with the event title, date, type, and full-size image, giving them more context about the club activity.

**Why this priority**: The modal system from COA-30 already exists. Populating it with real data completes the interaction loop.

**Independent Test**: Click any event tile. Verify the modal opens with correct title, date, image, and optional description. Verify modal closes via close button, backdrop click, and Escape key.

**Acceptance Scenarios**:

1. Given the user clicks a monthly poster tile (e.g., "Coming Up May 2025"), When the modal opens, Then it displays the event title, date (month/year), and the full poster image.
2. Given the user clicks a special event tile (e.g., "Winter Skills Clinic Session 1"), When the modal opens, Then it displays the event title, date, description if provided, and the full image.
3. Given the modal is open, When the user presses Escape or clicks the backdrop, Then the modal closes and focus returns to the tile.

---

### Edge Cases

- **Missing image file**: If an image file referenced in events.md does not exist at the expected path, the existing COA-30 fallback placeholder displays. No broken image icon visible to user.
- **Large image files**: Source poster images may be large PNG files. Images MUST be optimised (compressed, appropriately sized) before placement to meet the 3-second load target.
- **No April 2026 image**: The inventory has no April 2026 poster. The events.md should not include a placeholder entry for it. The gallery simply shows the 14 available posters.
- **November 2025 gap**: The monthly poster sequence is missing November 2025 (no poster was produced). This is intentional and expected. The events.md will skip November and jump from October 2025 (row 6) to December 2025 (row 7). No placeholder or note entry needed for November.
- **Image aspect ratio variation**: Some posters may have different aspect ratios. EventTile component (from COA-30) must handle this gracefully via object-fit or similar CSS without distortion.
- **Filename case sensitivity**: Image filenames have mixed casing (e.g., `PHOENIX_events_May25.png` vs `Phoenix_events_Feb26.png`). File paths in events.md MUST exactly match the actual filenames on disk.
- **Chronological ordering**: Events MUST be sorted per COA-30 rules — past events descending (most recent first). All 14 images are past events as of April 2026.

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST add all 14 event images from the inventory table to `public/images/events/`.
- **FR-002**: System MUST create corresponding event entries in `src/data/events.md` for each of the 14 images, with all required fields (id, title, date, image, status) populated.
- **FR-003**: Each event entry MUST have descriptive alt text as specified in the image inventory table.
- **FR-004**: All 14 events MUST have `status: "past"` since all event dates are before April 2026.
- **FR-005**: Images MUST be optimised for web delivery (compressed PNG or converted to WebP/JPEG where appropriate) to meet the 3-second page load target from COA-30.
- **FR-006**: Image file paths in events.md MUST exactly match the actual filenames placed in `public/images/events/`.
- **FR-007**: System MUST NOT modify existing COA-30 components (EventTile, EventModal, event filters, get-involved.astro page structure) unless a bug is discovered during integration.
- **FR-008**: Build system MUST validate all event entries in `src/data/events.md` at build time using the schema defined in COA-30: all required fields present (id, title, date, image, status), no duplicate IDs, image file paths must exist in `public/images/events/`, and all dates must be valid ISO-8601 format.

### Non-Functional Requirements

- **NFR-001** (Accessibility): Every image MUST have alt text that describes the content of the poster, not just "event image". Alt text from the inventory table below is the baseline.
- **NFR-002** (Performance): Total image payload for the events gallery SHOULD be under 2MB. Individual images SHOULD be under 200KB each after optimisation.
- **NFR-003** (Responsive): Images MUST display correctly at mobile (<640px), tablet (640-1024px), and desktop (>1024px) breakpoints using the existing COA-30 grid layout.
- **NFR-004** (Consistency): Event entries MUST follow the exact YAML front-matter format established in COA-30 spec. No new fields introduced.
- **NFR-005** (Image Format): Prefer PNG for poster images with text content (to preserve text clarity). Concrete optimization targets: PNG with `pngquant` 256-color palette or `optipng` compression; JPEG at 85% quality if PNG > 200KB; WebP at 80% quality as fallback only if both PNG and JPEG exceed targets. All formats must maintain text legibility and color fidelity. No format conversion required if original PNG meets 200KB target.

### Key Entities

- **Event** (as defined in COA-30): YAML front-matter block in `src/data/events.md` with required fields: `id`, `title`, `date`, `image`, `status`. Optional: `time`, `location`, `description`.
- **Event Image**: Static asset in `public/images/events/`. Referenced by relative path in event's `image` field.

---

## Image Inventory

All 14 images are past events and belong in the Events Gallery section. No April 2026 image exists.

| # | Filename | Type | Date (approx) | Alt Text | Event ID |
|---|----------|------|---------------|----------|----------|
| 1 | PHOENIX_events_May25.png | Monthly poster | 2025-05-01 | Coming Up May 2025 poster with Fuel and Focus workshop, uniforms required, and winter season start dates. | events-may-2025 |
| 2 | PHOENIX_events_June25.png | Monthly poster | 2025-06-01 | Coming Up June 2025 poster with Good Sports Week and daytime ladies basketball events. | events-june-2025 |
| 3 | PHOENIX_events_July25.png | Monthly poster | 2025-07-01 | Coming Up July 2025 poster with player journal check-in, school holidays, winter skills clinic, and BBA games back on. | events-july-2025 |
| 4 | PHOENIX_events_August25.png | Monthly poster | 2025-08-01 | Coming Up August 2025 poster with summer season registrations, Braves tryouts, uniform update, and finals timing. | events-august-2025 |
| 5 | PHOENIX_events_September25.png | Monthly poster | 2025-09-01 | Coming Up September 2025 poster with registrations closed, grading day, finals rounds, and team announcements. | events-september-2025 |
| 6 | PHOENIX_events_October25.png | Monthly poster | 2025-10-01 | Coming Up October 2025 poster with club training, grading game round 1, team name rules, club coach course, and player journal goals. | events-october-2025 |
| 7 | PHOENIX_events_December25.png | Monthly poster | 2025-12-01 | Coming Up December 2025 poster with last club training, last BBA games, Phoenix vs Bullets, and Christmas Day messaging. | events-december-2025 |
| 8 | PHOENIX_events_January26.png | Monthly poster | 2026-01-01 | Coming Up January 2026 poster with Melbourne United in Bendigo and BBA games start dates. | events-january-2026 |
| 9 | Phoenix_events_Feb26.png | Monthly poster | 2026-02-01 | Coming Up February 2026 poster with club Sunday training, Bendigo Spirit final, club training survey, Good Sports votes, and winter registration opening soon. | events-february-2026 |
| 10 | PHOENIX_events_march26.png | Monthly poster | 2026-03-01 | Coming Up March 2026 poster with club Sunday training, finals started, player journal entries and winners, and welcome to club day. | events-march-2026 |
| 11 | PHOENIX_SkillsClinic_2025Winter_1.png | Skills clinic | 2025-07-07 | Winter skills clinic session 1 poster for junior players aged 5 to 17 at Red Energy Arena. | skills-clinic-winter-2025-s1 |
| 12 | PHOENIX_SkillsClinic_2025Winter_2.png | Skills clinic | 2025-07-14 | Winter skills clinic session 2 poster for junior players aged 5 to 17 at Red Energy Arena. | skills-clinic-winter-2025-s2 |
| 13 | PHOENIX_Social_NEWTrainingSession.jpg | Training session | 2025-05-01 | New session training graphic for Wednesday 7pm open court with all players welcome and no coaches. | new-training-session-2025 |
| 14 | FuelAndFocus.png | Program | 2025-05-01 | Fuel and Focus program poster for men aged 16 plus with date, time, location, and registration call to action. | fuel-and-focus-2025 |

**Note**: November 2025 is missing from the monthly posters. This is expected — no poster was produced for that month.

---

## Success Criteria

- **SC-001**: All 14 images display correctly on the Get Involved page at all breakpoints (mobile, tablet, desktop).
- **SC-002**: All 14 event entries in events.md parse without build warnings.
- **SC-003**: Each image has descriptive alt text (not generic placeholder text).
- **SC-004**: Page load time for `/get-involved` remains under 3 seconds with all images loaded.
- **SC-005**: Clicking any event tile opens the modal with correct event data and image.
- **SC-006**: No broken image icons, 404 errors, or console errors related to event images.

---

## Acceptance Criteria

**AC-001**: Given all 14 images are in `public/images/events/` and events.md is populated, When the Get Involved page loads, Then all 14 event tiles display with their poster images visible.

**AC-002**: Given the page is loaded on mobile (<640px), When the user scrolls through the events gallery, Then tiles stack responsively without horizontal overflow and images maintain aspect ratio.

**AC-003**: Given a screen reader user navigates the events gallery, When focus reaches an event tile, Then the screen reader announces the descriptive alt text for the poster image.

**AC-004**: Given the user clicks on any event tile, When the modal opens, Then it displays the correct title, date, and full poster image for that event.

**AC-005**: Given the events.md file is parsed at build time, When the build runs, Then all 14 events pass validation (no missing required fields, no duplicate IDs) and zero warnings are logged.

**AC-006**: Given all images are optimised, When total image payload is measured, Then it is under 2MB combined and no single image exceeds 200KB.

**AC-007**: Given all 14 events have `status: "past"`, When the page renders, Then all events appear in the Past Events section sorted by date descending. Exact expected order (by event date, newest to oldest): March 2026, February 2026, January 2026, December 2025, October 2025 (November 2025 skipped), September 2025, August 2025, July 2025 (Winter Skills Clinic sessions), June 2025, May 2025 (New Training Session and Fuel & Focus), ending with earliest May 2025 entries last.

**AC-008**: Given the events gallery has no upcoming events, When the Upcoming Events section renders, Then the placeholder message "No upcoming events scheduled. Check back soon!" is displayed (per COA-30 empty state handling).

---

## Constitutional Compliance

- **PASS — Principle I (User Outcomes First)**: Clear user value — the page goes from empty to populated with real club content. Success criteria are measurable and testable.

- **PASS — Principle II (Test-First)**: All acceptance criteria are independently testable via browser inspection, screen reader, performance measurement, and build output verification.

- **PASS — Principle III (Backend Authority)**: Events.md is the single source of truth. All data is build-time processed. No client-side inference of event status or data.

- **PASS — Principle IV (Error Semantics)**: COA-30 already handles missing fields, malformed YAML, and broken images with build-time warnings. This feature adds no new error paths.

- **PASS — Principle V (AppShell Integrity)**: No structural changes to the page. Content integrates into the existing COA-30 layout within BaseLayout.

- **PASS — Principle VI (Accessibility)**: Every image has descriptive alt text. Existing COA-30 keyboard navigation and ARIA patterns apply unchanged.

- **PASS — Principle VII (Immutable Data Flow)**: Events loaded at build time, rendered as static HTML. No client-side data mutation.

- **PASS — Principle VIII (Dependency Hygiene)**: No new dependencies. Uses existing Astro build pipeline and static assets only.

- **PASS — Principle IX (Cross-Feature Consistency)**: Uses existing EventTile, EventModal, and events.md format from COA-30. No new patterns introduced.

- **PASS — Responsive**: Inherits COA-30 responsive grid (1-col mobile, 2-col tablet, 4-col desktop).

---

## Implementation Notes

1. **Image source**: Images must be obtained from the legacy Joomla site or club social media and attached to the Linear issue before implementation begins.
2. **Image optimisation**: Run images through compression (e.g., `pngquant`, `optipng`, or equivalent) to meet the 200KB-per-image target. Convert to WebP only if PNG size is excessive and text readability is preserved.
3. **No component changes expected**: If the existing EventTile component does not handle varied aspect ratios well, a minor CSS fix (e.g., `object-fit: cover` or `object-fit: contain`) is acceptable but should be noted in the PR.
4. **Events.md format**: Follow the exact YAML front-matter block format from COA-30. Use the event IDs and alt text from the inventory table above. Event titles (shown in UI) are independent of filenames — e.g., filename `PHOENIX_events_May25.png` should have title `Coming Up May 2025` (from alt text). Filenames are asset identifiers only.
5. **All events are "past"**: Since all 14 posters are from May 2025 through March 2026 and today is April 2026, all entries should have `status: "past"`. The Upcoming Events section will show its empty state placeholder.
