# Implementation Plan: COA-34 — Get Involved Page: Images & Real Data

**Branch**: coa-34-get-involved-images | **Date**: 2026-04-09 | **Spec**: [spec.md](./spec.md)

## Summary

Replace the placeholder event data in `src/data/events.md` with 14 real club event entries and their corresponding poster images. Add an `alt` field to the Event type and EventTile component so each image gets spec-defined descriptive alt text. Optimise all images to meet the 200KB/2MB budget. No structural page changes required.

## Technical Context

- **Framework**: Astro (static site generator)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Storage**: Static files (events.md YAML frontmatter, public/images/)
- **Testing**: Manual browser verification, build validation, Lighthouse
- **Target Platform**: Web (desktop + mobile)
- **Performance Goals**: Page load under 3s, total image payload under 2MB, individual images under 200KB

## Constitution Check

- Principle I (User Outcomes First): PASS — Transforms empty page into real content.
- Principle II (Test-First): PASS — All acceptance criteria verifiable via build + browser.
- Principle III (Backend Authority): PASS — events.md is single source of truth, build-time processed.
- Principle IV (Error Semantics): PASS — No new error paths. COA-30 fallback placeholder handles missing images.
- Principle V (AppShell Integrity): PASS — No structural changes to page layout.
- Principle VI (Accessibility): PASS — Adding descriptive alt text per image. Requires new `alt` field.
- Principle VII (Immutable Data Flow): PASS — Static build-time rendering only.
- Principle VIII (Dependency Hygiene): PASS — No new dependencies. Image optimisation is a build-prep step.
- Principle IX (Cross-Feature Consistency): PASS — Uses existing COA-30 patterns and components.

## Critical Finding: Alt Text Gap

The spec requires per-image descriptive alt text (e.g., "Coming Up May 2025 poster with Fuel and Focus workshop..."). However, the current implementation has NO mechanism for custom alt text:

- `Event` type in `src/lib/events/types.ts` has no `alt` field
- `EventTile.astro` hardcodes alt as `${title} - ${date}`
- `events.md` YAML format has no `alt` field

**Resolution**: Add an optional `alt` field to the Event type, events.md entries, the parser in get-involved.astro, and EventTile.astro. This is a minimal, backwards-compatible change. If `alt` is not provided, the existing `${title} - ${date}` fallback remains.

This is technically a component change, which FR-007 says to avoid "unless a bug is discovered during integration." The missing alt text is an accessibility deficiency that qualifies as a bug -- the hardcoded alt text does not describe poster content as required by WCAG.

## Project Structure

```
public/images/events/           (NEW - 14 image files)
  PHOENIX_events_May25.png
  PHOENIX_events_June25.png
  PHOENIX_events_July25.png
  PHOENIX_events_August25.png
  PHOENIX_events_September25.png
  PHOENIX_events_October25.png
  PHOENIX_events_December25.png
  PHOENIX_events_January26.png
  Phoenix_events_Feb26.png
  PHOENIX_events_march26.png
  PHOENIX_SkillsClinic_2025Winter_1.png
  PHOENIX_SkillsClinic_2025Winter_2.png
  PHOENIX_Social_NEWTrainingSession.jpg
  FuelAndFocus.png

src/data/events.md              (REPLACE - 14 real entries replace 8 placeholders)
src/lib/events/types.ts         (EDIT - add optional `alt` field)
src/components/EventTile.astro  (EDIT - use `alt` prop with fallback)
src/pages/get-involved.astro    (EDIT - pass `alt` through parser and to EventTile)
```

## Phased Delivery

### Phase 1: Alt Text Support (Code Changes)

Add `alt` field support across the event pipeline. This is done first so the data phase can use it immediately.

1. Add `alt?: string` to `Event` interface in `src/lib/events/types.ts`
2. Update `EventTile.astro` Props interface to accept `alt?: string`, use it in img tag with fallback: `alt={alt || \`${title} - ${date}\`}`
3. Update parser in `get-involved.astro` to extract `alt` field from frontmatter
4. Update EventTile invocations in `get-involved.astro` to pass `alt={event.alt}`
5. Update EventModal (if it displays images) to also use the alt field

**Verification**: Build succeeds. Existing placeholder events still render (backwards compatible).

### Phase 2: Image Assets

Obtain, optimise, and place the 14 event images.

1. Source all 14 images from Linear issue attachments / legacy Joomla site / club social media
2. Create `public/images/events/` directory
3. Optimise each image:
   - PNG posters: run through `pngquant` or `optipng` targeting under 200KB each
   - JPG files: compress to 85% quality if over 200KB
   - Convert to WebP only if PNG compression cannot reach target and text remains readable
4. Place files with EXACT filenames matching the inventory table (case-sensitive)
5. Verify total payload under 2MB

**Verification**: `ls -la public/images/events/` shows all 14 files, each under 200KB, total under 2MB.

### Phase 3: Event Data

Replace placeholder events.md with real event entries.

1. Remove all existing placeholder entries from `src/data/events.md`
2. Add 14 entries from the spec inventory table with:
   - All required fields: id, title, date, image, status ("past")
   - Alt text from inventory table
   - Optional fields (description, category/type) where applicable
3. Ensure chronological ordering in the file (though display order is computed by filters)
4. Ensure image paths exactly match filenames: `/images/events/PHOENIX_events_May25.png` etc.

**Verification**: `npm run build` succeeds with zero warnings. Dev server shows 14 tiles in Past Events.

### Phase 4: Integration Verification

End-to-end validation across viewports and interactions.

1. Desktop (>1024px): Verify 4-column grid, all 14 images visible, no broken images
2. Tablet (640-1024px): Verify 2-column layout
3. Mobile (<640px): Verify single-column stack, no horizontal overflow
4. Click each tile: Verify modal opens with correct title, date, image
5. Modal dismissal: Escape key, backdrop click, close button
6. Screen reader: Check alt text announced for each image
7. Performance: Lighthouse audit on /get-involved, confirm LCP under 3s
8. Console: Zero 404 errors or broken image warnings

## Testing Strategy

This is primarily a data/asset integration task. Testing is manual and build-validation based:

| Test | Method | Pass Criteria |
|------|--------|---------------|
| Build validation | `npm run build` | Zero warnings, all 14 events parsed |
| Visual rendering | Browser at 3 breakpoints | All 14 tiles render, no broken images |
| Alt text | DOM inspection / screen reader | Each img has descriptive alt from spec |
| Modal interaction | Click each tile | Correct data displayed, dismissal works |
| Performance | Lighthouse / Network tab | Total images < 2MB, page load < 3s |
| Image paths | Console check | Zero 404 errors |
| Sort order | Visual check | Past events: March 2026 first, May 2025 last |
| Empty upcoming | Visual check | "No upcoming events scheduled" message shown |

## Complexity Notes

- **Alt field addition**: Minimal change (4 files, ~6 lines of code). Backwards compatible. Justified by accessibility requirement.
- **Image optimisation**: Manual pre-processing step. No build-time tooling added.
- **No new dependencies**: All work uses existing Astro build pipeline.

## Open Questions

1. **Image source availability**: Are all 14 images attached to the Linear issue or do some need to be sourced from social media? (Blocking for Phase 2)
2. **Category field**: The EventTile accepts `category` but the Event type doesn't define it. Should the 14 events use categories like "Monthly Poster", "Skills Clinic", "Program"? (Non-blocking, can default to "Event")

## Next Steps

1. Review this plan
2. Proceed to tasks phase: atomic task breakdown for implementation
