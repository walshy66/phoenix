# Data Model: COA-43 Resources Update

---

## Overview

COA-43 enhances the Resource data model to support AND-logic filtering, keyword search, and graceful degradation for incomplete metadata. The schema moves from single-value category/ageGroup fields to array-based tag objects, enabling flexible filtering and future extensibility.

---

## Current Schema (COA-27/COA-33)

```typescript
interface Resource {
  id: string;
  title: string;
  description?: string;
  audience: 'coaching' | 'players' | 'managers';  // Audience
  category: string;                                // Single value
  ageGroup: string;                                // Single value
  type: 'pdf' | 'link' | 'video' | 'document';
  url: string;
  dateAdded: string;
  sourceDomain?: string;
  imageUrl?: string;
}
```

### Example (Current)

```json
{
  "id": "coaching-001",
  "title": "U12 Defensive Fundamentals",
  "description": "A comprehensive guide...",
  "audience": "coaching",
  "category": "Defence",
  "ageGroup": "U12",
  "type": "link",
  "url": "https://example.com/defence-u12",
  "dateAdded": "2026-03-15"
}
```

---

## New Schema (COA-43)

```typescript
interface Resource {
  id: string;                                       // Unique identifier
  title: string;                                    // Required
  description?: string;                            // Optional; used in search
  section: 'coaching_resources' | 'player_resources' | 'manager' | 'guides' | 'forms';
  type: 'youtube_link' | 'image_png' | 'image_jpeg' | 'gif' | 'pdf' | 'external_link';
  url?: string;                                     // Optional if fileRef is used
  fileRef?: string;                                // Optional pointer to asset storage
  tags?: {                                          // Optional; incomplete metadata allowed
    age?: string[];                                 // ['U8', 'U10', 'U12', 'U14', 'U16+']
    category?: string[];                           // Varies by section
    skill?: string[];                              // Custom per resource
  };
  createdAt: string;                               // ISO 8601 timestamp
  updatedAt: string;                               // ISO 8601 timestamp
}
```

### Key Changes

1. **`audience` → `section`**: Clearer naming. Maps directly to tab structure.
   - `'coaching'` → `'coaching_resources'`
   - `'players'` → `'player_resources'`
   - `'managers'` → `'manager'`
   - New: `'guides'`, `'forms'`

2. **`category` string → `tags.category` array**: Allows resources to have multiple categories.
   - **Before**: `"category": "Defence"`
   - **After**: `"tags": { "category": ["Defence", "Drills"] }`

3. **`ageGroup` string → `tags.age` array**: Allows resources to apply to multiple age groups.
   - **Before**: `"ageGroup": "U12"`
   - **After**: `"tags": { "age": ["U12", "U14"] }`

4. **New `tags.skill` array**: Custom per resource. Enables fine-grained filtering.
   - Example: `"skill": ["Positioning", "Communication", "Ball Handling"]`

5. **`type` expanded**: Support new media types.
   - Old: `'pdf' | 'link' | 'video' | 'document'`
   - New: `'youtube_link' | 'image_png' | 'image_jpeg' | 'gif' | 'pdf' | 'external_link'`

6. **`url` optional**: For image assets with `fileRef`, URL not needed.

7. **`fileRef` new**: Points to asset storage (e.g., `"assets/coaching/image.png"`).

8. **`dateAdded` → `createdAt`/`updatedAt`**: Standard timestamps for audit trail.

9. **`tags` optional**: Resources with only title and type display gracefully.

---

## Examples

### Example 1: Full Resource (Coaching, Multiple Tags)

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

**Filtering Behavior**:
- Matches `age: U14` OR `age: U16+` (any value in filter)
- Matches `category: Defence` OR `category: Drills`
- Matches `skill: Positioning` OR `skill: Communication` OR `skill: Rotation`
- If ALL three filters are active (e.g., `age: U12`, `category: Defence`, `skill: Positioning`), this resource does NOT match (age is U14/U16+, not U12)

### Example 2: Minimal Resource (Guides Section, No Tags)

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

**Filtering Behavior**:
- No tags: displays in Guides section regardless of filters (Guides has no filters)
- Searchable by title: "Basketball" or "Rules" will match
- Sorted alphabetically by title

### Example 3: Image Resource (Player Resources)

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

**Filtering Behavior**:
- Visible in Player Resources section
- Matches any of: `age: U10 | U12 | U14 | U16+` (applies to all ages)
- Matches `category: Drills` or `category: Solo`
- Matches `skill: Shooting` or `skill: Form`

### Example 4: External Link (Coaching, Incomplete Tags)

```json
{
  "id": "coaching-075",
  "title": "NBA Coach Dev Program",
  "description": "Free coaching development resources from NBA official site.",
  "section": "coaching_resources",
  "type": "external_link",
  "url": "https://nba.com/teams/training/coaching",
  "tags": {
    "age": ["U16+"],
    "category": ["Tools"]
  },
  "createdAt": "2026-03-25T13:00:00Z",
  "updatedAt": "2026-03-25T13:00:00Z"
}
```

**Filtering Behavior**:
- Has `age` and `category` tags
- Missing `skill` tag: won't match any Skill filter, but will appear when Skill filter is not active
- If Skill filter is active (e.g., `skill: Ball Handling`), this resource is hidden (no skill tag)

---

## Migration Path

### Step 1: Map Old Schema to New

| Old Field | New Field | Mapping Logic |
|-----------|-----------|----------------|
| `audience: 'coaching'` | `section: 'coaching_resources'` | 1:1 rename |
| `audience: 'players'` | `section: 'player_resources'` | 1:1 rename |
| `audience: 'managers'` | `section: 'manager'` | 1:1 rename |
| `category: 'Defence'` | `tags.category: ['Defence']` | String → array |
| `ageGroup: 'U12'` | `tags.age: ['U12']` | String → array |
| `type: 'pdf'` | `type: 'pdf'` | Keep same (if compatible) |
| `type: 'video'` | `type: 'youtube_link'` | Map based on URL |
| `type: 'link'` | `type: 'external_link'` | Generic external link |
| `dateAdded: '2026-03-15'` | `createdAt: '2026-03-15T00:00:00Z'` | Add time component |
| N/A | `updatedAt: '2026-03-15T00:00:00Z'` | Set to createdAt initially |
| N/A | `tags.skill: []` | Derive from category or leave empty |
| N/A | `url: undefined` if no URL | Remove if only asset |
| N/A | `fileRef: 'assets/...'` | Add for image/PDF assets |

### Step 2: Update JSON Files

**File**: `src/data/coaching-resources.json`

Before:
```json
[
  {
    "id": "coaching-001",
    "title": "Defensive Positioning for U12",
    "description": "...",
    "audience": "coaching",
    "category": "Defence",
    "ageGroup": "U12",
    "type": "link",
    "url": "https://jr.nba.com/...",
    "dateAdded": "2026-03-15",
    "sourceDomain": "NBA"
  }
]
```

After:
```json
[
  {
    "id": "coaching-001",
    "title": "Defensive Positioning for U12",
    "description": "...",
    "section": "coaching_resources",
    "type": "external_link",
    "url": "https://jr.nba.com/...",
    "tags": {
      "age": ["U12"],
      "category": ["Defence"],
      "skill": ["Positioning"]
    },
    "createdAt": "2026-03-15T00:00:00Z",
    "updatedAt": "2026-03-15T00:00:00Z"
  }
]
```

### Step 3: Validation Script

Create `scripts/validate-resources.js` to ensure all JSON files conform to schema:

```typescript
// Validates:
// - All required fields present (id, title, section, type)
// - section is one of: coaching_resources, player_resources, manager, guides, forms
// - type is one of: youtube_link, image_png, image_jpeg, gif, pdf, external_link
// - tags.age contains only: U8, U10, U12, U14, U16+
// - tags.category and tags.skill are arrays of strings
// - url is present if type is external_link or youtube_link
// - fileRef is present if type is image_* or pdf
// - createdAt/updatedAt are valid ISO 8601
```

---

## Invariants & Constraints

### Data Invariants

1. **Resource ID Uniqueness**: Each `id` is unique within a section.
   - Constraint: No two resources in `coaching_resources.json` can have the same `id`.

2. **Required Fields**: Every resource must have `id`, `title`, `section`, `type`.
   - Constraint: These fields cannot be null or undefined.

3. **Type-URL Coupling**:
   - If `type` is `'external_link'` or `'youtube_link'`, `url` MUST be present.
   - If `type` is `'image_*'` or `'pdf'` with no URL, `fileRef` MUST be present.

4. **Age Group Whitelist**: `tags.age` values must be from: `['U8', 'U10', 'U12', 'U14', 'U16+']`.
   - Constraint: No free-form age values (prevents typos like `'u12'` or `'U12+'`).

5. **Category Whitelist (Per Section)**:
   - **Coaching**: `['Defence', 'Offence', 'Drills', 'Plays', 'Tools']`
   - **Player**: `['Solo', 'Group', 'Offence', 'Defence', 'Drill']`
   - **Manager**: (no filters, but can have tags for future use)
   - **Guides**: (no filters)
   - **Forms**: (no filters)

6. **Timestamp Format**: `createdAt` and `updatedAt` must be valid ISO 8601 strings.
   - Constraint: `YYYY-MM-DDTHH:mm:ssZ` format.

### Operational Constraints

1. **No Circular References**: Resources don't reference other resources.
2. **No Inline Code**: URLs and fileRefs only; no inline scripts or executables.
3. **Asset Paths**: All `fileRef` paths must exist in `public/` directory.

---

## FAQ: Graceful Degradation

### Q: What if a resource has no tags at all?

**A**: The resource displays in all sections (since no filters are active by default). Once a filter is active in that section, the resource is hidden (treated as non-matching).

Example:
- Guides tab (no filters): Resource displays
- Coaching Resources tab (no filters): Resource displays
- Coaching Resources tab (U12 filter active): Resource hidden (no age tag to match)

### Q: What if a resource has age and category tags, but no skill tags?

**A**: The resource matches age and category filters, but is always hidden if a Skill filter is active (no skill tag = no match).

### Q: Can a resource belong to multiple sections?

**A**: No. Each resource has exactly one `section`. If content should appear in multiple sections, create duplicate resources (same title, different `id` and `section`).

### Q: Can I search within a specific section, or only across all?

**A**: Search is scoped to the current active section tab. Searching "defence" on the Coaching Resources tab only searches that section's resources.

### Q: What if I add a new skill tag that no other resource has?

**A**: The skill appears as a filter option, but selecting it matches only that one resource. This is intentional — it allows gradual tagging without requiring bulk updates.

---

## File Locations

| File | Purpose | Status |
|------|---------|--------|
| `src/lib/resources/types.ts` | TypeScript interface definitions | Update with new schema |
| `src/data/coaching-resources.json` | Coaching resources (migrated) | Migrate to new schema |
| `src/data/player-resources.json` | Player resources (migrated) | Migrate to new schema |
| `src/data/manager-resources.json` | Manager resources (migrated) | Migrate to new schema |
| `src/data/guides.json` | Guides (migrated) | Migrate to new schema |
| `src/data/forms.json` | Forms (new, if needed) | Create if adding forms section |
| `scripts/validate-resources.js` | Schema validation helper | Create new |

---

## Backward Compatibility

After migration, the old schema files are **deprecated**. The legacy `coaching-resources.astro` and `player-resources.astro` pages continue to work (they read old in-file data), but they are not updated. The new `resources/index.astro` page uses the new JSON schema.

**Future cleanup**: Remove old pages in a separate cleanup task (COA-XX).

---

## Example Validation & Handover

### For Coaches Adding Resources

**Step 1**: Copy an existing resource as a template.

**Step 2**: Update fields:
```json
{
  "id": "coaching-NEW",
  "title": "Your Resource Title",
  "description": "Brief description of what this covers.",
  "section": "coaching_resources",
  "type": "pdf",
  "fileRef": "assets/coaching/your-file.pdf",
  "tags": {
    "age": ["U14", "U16+"],
    "category": ["Defence"],
    "skill": ["Positioning", "Communication"]
  },
  "createdAt": "2026-04-18T10:00:00Z",
  "updatedAt": "2026-04-18T10:00:00Z"
}
```

**Step 3**: Validate (optional):
```bash
npm run validate-resources
```

**Step 4**: Commit and deploy. No code changes needed.

