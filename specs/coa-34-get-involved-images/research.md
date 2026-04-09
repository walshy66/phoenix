# Research: COA-34 — Get Involved Images

## Key Finding: Alt Text Architecture Gap

### Problem
The spec (FR-003, NFR-001) requires descriptive alt text per image from the inventory table. The current COA-30 implementation has no mechanism for custom alt text:

- `Event` interface: no `alt` field
- `EventTile.astro`: hardcodes `alt="${title} - ${date}"`
- `events.md` YAML: no `alt` field in schema

### Resolution
Add optional `alt` field to the pipeline. Fallback to existing behaviour when not provided. This is a 4-file, ~6-line change that is fully backwards compatible.

### Justification for Component Change
FR-007 says "System MUST NOT modify existing COA-30 components unless a bug is discovered during integration." The hardcoded alt text fails WCAG 2.1 AA requirements (Principle VI) because `alt="Coming Up May 2025 - 2025-05-01"` does not describe the poster content. This qualifies as an accessibility bug discovered during integration planning.

## Finding: filterByStatus Uses Date, Not Status Field

The `getUpcomingEvents` / `getPastEvents` functions in `src/lib/events/filters.ts` compare the event `date` against the build date, ignoring the `status` field in events.md. The `status` field is parsed but only used as a required field check in the parser.

**Impact**: All 14 events have dates before April 2026, so they will correctly appear as past events at build time regardless of what `status` value is set. Setting `status: "past"` is correct per spec and consistent with the actual date-based filtering.

## Finding: Category Field Inconsistency

`EventTile.astro` accepts a `category` prop and displays it as a badge. The `Event` interface in types.ts does not include `category`. The get-involved.astro page passes `category={event.category || 'Event'}`.

**Impact**: The parser will extract `category` from events.md if present (it parses all key-value pairs). The type system won't enforce it. For COA-34, we can add a `category` field to events.md entries (e.g., "Monthly Poster", "Skills Clinic", "Program", "Training") to improve the tile display. This is optional and non-blocking.

## Image Optimisation Strategy

### Approach: Pre-process before commit
Optimise images manually before placing in `public/images/events/`. No build-time optimisation pipeline.

### Tools
- **PNG**: `pngquant --quality=65-85 --strip` or `optipng -o3` -- target under 200KB per file
- **JPG**: `jpegoptim --max=85` or equivalent
- **WebP conversion**: Only if PNG compression cannot reach 200KB and text remains readable

### Why not Astro Image optimisation?
The images are in `public/` (static assets), not `src/`. Astro's built-in `<Image>` component only optimises images imported from `src/`. Using `public/` is consistent with COA-30's pattern. Moving to `src/assets/` would require changing the EventTile component to use Astro Image imports, which is a larger refactor outside COA-34 scope.

## Alternatives Considered

### 1. Use Astro Image component (rejected)
- Would require moving images to `src/assets/events/`
- Would require rewriting EventTile to use `<Image>` imports
- Better long-term but out of scope for COA-34 (data-only task)
- Could be a follow-up enhancement

### 2. Add alt text to title field (rejected)
- Could encode alt text into the title, but title is displayed in the UI
- Would make tile titles too long and cluttered
- Correct solution is a dedicated alt field

### 3. Use description field for alt text (rejected)
- Description is displayed in the modal and tile
- Alt text and description serve different purposes
- Dedicated alt field is cleaner
