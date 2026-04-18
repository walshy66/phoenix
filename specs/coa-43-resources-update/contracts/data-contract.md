# Data Contract: COA-43 Resources

---

## Overview

This document defines the contract for resource data used by the COA-43 Resources page. Resources are stored as static JSON files and consumed by the frontend for filtering, search, and display.

---

## Resource Data Structure

### Interface Definition

```typescript
interface Resource {
  id: string;
  title: string;
  description?: string;
  section: 'coaching_resources' | 'player_resources' | 'manager' | 'guides' | 'forms';
  type: 'youtube_link' | 'image_png' | 'image_jpeg' | 'gif' | 'pdf' | 'external_link';
  url?: string;
  fileRef?: string;
  tags?: {
    age?: string[];
    category?: string[];
    skill?: string[];
  };
  createdAt: string;
  updatedAt: string;
}
```

### Field Specifications

#### Required Fields

**`id: string`**
- Unique identifier for the resource within a section
- Format: alphanumeric, kebab-case (e.g., `coaching-001`, `player-025`)
- No duplicates within a section
- Immutable (do not change after creation)

**`title: string`**
- Resource name, visible to users
- Max length: 255 characters
- Should be descriptive and searchable
- Example: "Full Court Press Drills"

**`section: string`**
- Which section this resource belongs to
- Must be one of: `'coaching_resources'` | `'player_resources'` | `'manager'` | `'guides'` | `'forms'`
- Determines which page tab displays the resource
- Determines available filters (Coaching/Player have filters; others are alphabetical)

**`type: string`**
- Resource content type
- Must be one of:
  - `'youtube_link'` — Embedded YouTube video
  - `'image_png'` — PNG image
  - `'image_jpeg'` — JPEG image
  - `'gif'` — Animated GIF
  - `'pdf'` — PDF document
  - `'external_link'` — Generic external link/website
- Determines how resource is displayed in modal/grid

**`createdAt: string`**
- ISO 8601 timestamp when resource was created
- Format: `YYYY-MM-DDTHH:mm:ssZ`
- Immutable (do not change)
- Used for sorting (newer resources first)
- Example: `"2026-04-18T10:00:00Z"`

**`updatedAt: string`**
- ISO 8601 timestamp when resource was last updated
- Format: `YYYY-MM-DDTHH:mm:ssZ`
- Updates when title, description, or tags change
- Does NOT update when category/section changes
- Example: `"2026-04-18T10:00:00Z"`

#### Optional Fields

**`description: string`** (optional)
- Longer explanation of resource content
- Max length: 1000 characters
- Used in keyword search
- Supports plain text only (no HTML/Markdown)
- If missing, resource still displays; just searchable by title

**`url: string`** (optional)
- HTTP(S) URL to external resource
- Required if `type` is `'external_link'` or `'youtube_link'`
- Must be valid, absolute URL
- Should be HTTPS (HTTP not recommended)
- Example: `"https://jr.nba.com/resource"`

**`fileRef: string`** (optional)
- Path to asset stored locally (in `public/` directory)
- Required if `type` is `'image_png'` | `'image_jpeg'` | `'gif'` | `'pdf'` (without external URL)
- Format: `"assets/section/filename.ext"`
- Example: `"assets/coaching/full-court-press.pdf"`
- Must exist in repository (checked at build time)

**`tags: object`** (optional, but recommended)
- Metadata for filtering and discovery
- If omitted, resource displays in unfiltered sections only
- See Tag Structure below

### Tag Structure

**`tags.age?: string[]`**
- Age groups this resource applies to
- Array of strings; can be empty or omitted
- Valid values: `['U8', 'U10', 'U12', 'U14', 'U16+']`
- Must not contain invalid values (e.g., `'u12'`, `'U12+'`)
- Example: `["U12", "U14"]`
- Matching logic: Resource matches if at least one age in filter is in this array (OR within filter type, AND across types)

**`tags.category?: string[]`**
- Category/domain of resource
- Array of strings; can be empty or omitted
- Valid values depend on section:
  - **Coaching**: `['Defence', 'Offence', 'Drills', 'Plays', 'Tools']`
  - **Player**: `['Solo', 'Group', 'Offence', 'Defence', 'Drill']`
  - **Manager**: (no filter, but can be tagged for future use)
  - **Guides**: (no filter)
  - **Forms**: (no filter)
- Example (Coaching): `["Defence", "Drills"]`

**`tags.skill?: string[]`**
- Specific skill or technique taught/covered
- Array of strings; can be empty or omitted
- No predefined list; derived dynamically from all resources
- Custom per resource and per section
- Examples: `["Positioning", "Communication", "Ball Handling"]`
- Coaches can create new skills as needed

---

## Validation Rules

### Schema Compliance

Every resource MUST satisfy:
1. `id` is unique within the section
2. `id` is non-empty string
3. `title` is non-empty string (max 255 chars)
4. `section` is one of the valid enum values
5. `type` is one of the valid enum values
6. `createdAt` and `updatedAt` are valid ISO 8601 timestamps
7. If `type` is `'external_link'` or `'youtube_link'`, `url` MUST be present
8. If `type` is `'image_*'` or `'pdf'` with no external URL, `fileRef` MUST be present
9. `tags.age` values are from whitelist: `['U8', 'U10', 'U12', 'U14', 'U16+']`
10. `tags.category` values match section-specific whitelist
11. `tags.skill` values are non-empty strings (no specific whitelist)

### At Build Time

A validation script (`scripts/validate-resources.js`) checks:
- [ ] All JSON files parse without syntax errors
- [ ] All resources conform to schema
- [ ] All file references exist in `public/`
- [ ] All URLs are valid (basic check: starts with http/https)
- [ ] No duplicate IDs within a section
- [ ] All timestamps are ISO 8601 compliant

**Failure**: Build fails with clear error message listing violations.

---

## Examples

### Example 1: Complete Coaching Resource

```json
{
  "id": "coaching-050",
  "title": "Full Court Press Drills",
  "description": "Step-by-step drills for teaching full-court press coverage. Includes trap positions, rotations, and execution drills.",
  "section": "coaching_resources",
  "type": "pdf",
  "fileRef": "assets/coaching/full-court-press-drills.pdf",
  "tags": {
    "age": ["U14", "U16+"],
    "category": ["Defence", "Drills"],
    "skill": ["Positioning", "Communication", "Rotation"]
  },
  "createdAt": "2026-03-20T10:00:00Z",
  "updatedAt": "2026-04-18T14:30:00Z"
}
```

### Example 2: Minimal Guide (No Tags)

```json
{
  "id": "guides-001",
  "title": "Basketball Rules Quick Reference",
  "section": "guides",
  "type": "pdf",
  "url": "https://example.com/rules-reference.pdf",
  "createdAt": "2026-04-01T09:00:00Z",
  "updatedAt": "2026-04-01T09:00:00Z"
}
```

### Example 3: External Link with Tags

```json
{
  "id": "coaching-075",
  "title": "NBA Coach Development Program",
  "description": "Free coaching development resources from the official NBA website.",
  "section": "coaching_resources",
  "type": "external_link",
  "url": "https://nba.com/teams/training/coaching",
  "tags": {
    "age": ["U16+"],
    "category": ["Tools"],
    "skill": ["Coaching Fundamentals"]
  },
  "createdAt": "2026-03-25T13:00:00Z",
  "updatedAt": "2026-03-25T13:00:00Z"
}
```

### Example 4: Image Resource

```json
{
  "id": "player-025",
  "title": "Shooting Form Diagram",
  "description": "Visual guide to proper shooting form and release point.",
  "section": "player_resources",
  "type": "image_png",
  "fileRef": "assets/player/shooting-form.png",
  "tags": {
    "age": ["U10", "U12", "U14", "U16+"],
    "category": ["Drills", "Solo"],
    "skill": ["Shooting", "Form"]
  },
  "createdAt": "2026-04-10T11:00:00Z",
  "updatedAt": "2026-04-10T11:00:00Z"
}
```

---

## File Format & Storage

### JSON File Structure

Each section has a separate JSON file in `src/data/`:

| File | Section | Purpose |
|------|---------|---------|
| `coaching-resources.json` | `coaching_resources` | Resources for coaches |
| `player-resources.json` | `player_resources` | Resources for players |
| `manager-resources.json` | `manager` | Resources for managers/committee |
| `guides.json` | `guides` | Training guides and references |
| `forms.json` | `forms` | Forms and templates (if exists) |

### File Format

Each file is an array of Resource objects:

```json
[
  { resource 1 },
  { resource 2 },
  ...
]
```

Example:
```json
[
  {
    "id": "coaching-001",
    "title": "Defensive Positioning for U12",
    ...
  },
  {
    "id": "coaching-002",
    "title": "Full Court Press — U14",
    ...
  }
]
```

### Encoding

- Charset: UTF-8
- Line endings: LF (Unix style, not CRLF)
- Indentation: 2 spaces
- No trailing commas
- No comments in JSON (use supplementary docs)

---

## Consumer Contract

### Frontend Usage

The frontend (`src/pages/resources/index.astro`) imports and uses resource data:

```typescript
import coachingResources from '../../data/coaching-resources.json';
import playerResources from '../../data/player-resources.json';
// ...

// Consumer expects:
// - Resources have valid `id`, `title`, `section`, `type`
// - `tags.age`, `tags.category`, `tags.skill` are optional arrays
// - `description` is optional string
// - `createdAt`, `updatedAt` are ISO 8601 timestamps
// - Resources can be sorted by `createdAt` (descending)
// - Resources can be sorted by `title` (ascending, A–Z)
```

### Filter Function Contract

Filter functions (`src/lib/resources/filters.ts`) accept:
- Input: Array of Resource objects
- Filter state: `{ age: string[], category: string[], skill: string[] }`
- Search keyword: string
- Expected behavior: AND-logic filtering, case-insensitive partial match search

```typescript
function filterResources(
  resources: Resource[],
  activeFilters: { age: string[]; category: string[]; skill: string[] },
  searchKeyword: string,
  section: string
): Resource[]
```

---

## Breaking Changes

### Migration from COA-27/COA-33

Old schema:
```json
{
  "id": "coaching-001",
  "title": "...",
  "audience": "coaching",
  "category": "Defence",
  "ageGroup": "U12",
  "type": "pdf",
  "url": "...",
  "dateAdded": "2026-03-15"
}
```

New schema:
```json
{
  "id": "coaching-001",
  "title": "...",
  "section": "coaching_resources",
  "type": "pdf",
  "url": "...",
  "tags": {
    "age": ["U12"],
    "category": ["Defence"],
    "skill": [...]
  },
  "createdAt": "2026-03-15T00:00:00Z",
  "updatedAt": "2026-03-15T00:00:00Z"
}
```

**Migration Path**:
1. Add new `section` field (map `audience`)
2. Convert `category` and `ageGroup` strings to `tags` arrays
3. Add `createdAt` and `updatedAt` timestamps
4. Add `tags.skill` values (derived or manual)
5. Remove old `audience` and `ageGroup` fields
6. Update `type` values if needed

See `data-model.md` for detailed migration steps.

---

## Maintenance & Governance

### Who Can Edit

- Product team (Linear)
- Coaches with Git access
- Administrators

### Change Process

1. Edit JSON file directly in Git
2. Validate with: `npm run validate-resources`
3. Commit with message: `docs: add/update resource {id}`
4. Create PR for review
5. Merge to `main`
6. Deploy (static build regenerates from JSON)

### Version Control

- All changes tracked in Git history
- Revert capability via `git revert` or `git reset`
- No data loss (JSON is source of truth)

### Deprecation Policy

- Remove `audience` field by COA-50 (future)
- Keep `ageGroup` as alias if needed (TBD)
- Announce breaking changes in release notes

---

## Performance & Limits

### Scalability

- **Current scale**: 50–100 resources per section ✅
- **Practical limit**: ~1000 resources per section (before UI sluggishness)
- **Performance target**: Filter + search in <100ms

### Optimization Hints

- If data exceeds 500 resources, consider:
  - Server-side full-text search (Elasticsearch, etc.)
  - Pagination (50 results per page)
  - Virtual scrolling (render only visible items)

---

## FAQs

### Q: Can a resource belong to multiple sections?

**A**: No. Each resource has exactly one `section`. Create duplicate resources if content applies to multiple sections.

### Q: What if I make a typo in `tags.age`?

**A**: The validation script catches it. Build fails with error message. Fix and retry.

### Q: Can I add custom values to `tags.category`?

**A**: Only within section-specific whitelists (see table above). Contact product team to expand whitelist.

### Q: What if `fileRef` path doesn't exist?

**A**: Validation script catches it. Build fails. Add the asset file to `public/` and retry.

### Q: Can I search within a section?

**A**: Yes. Search is scoped to the currently active section tab. Searching "defence" on Coaching Resources only searches that section.

---

## Support & Issues

For questions or issues with resource data:
1. Check `data-model.md` for detailed specs
2. Check examples above
3. Run validation script: `npm run validate-resources`
4. Review build output for error messages
5. Open issue on Linear: tag as @product-team

