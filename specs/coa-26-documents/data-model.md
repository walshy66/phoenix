# Data Model: Documents Feature (COA-26)

**Date**: 2026-04-11 | **Branch**: cameronwalsh/coa-26-documents

---

## Overview

This feature introduces two new data structures and one type update to support Club Policies, Team Manager Resources, and Guides:

1. **ClubPolicy** (new) — Club policies for the About page
2. **Guide** (new) — Instructional guides for the Resources Guides tab
3. **ResourceAudience** type update (existing) — Add `'managers'` to supported audiences

No database changes are required; this is a static site with JSON data files.

---

## Data Structures

### 1. ClubPolicy (About Page)

**Location**: Defined inline in `src/pages/about.astro` (initial) or in `src/data/club-policies.json` (future refactor)

**TypeScript Interface**:
```typescript
interface ClubPolicy {
  name: string;           // Display name; used for alphabetical sorting
  type: 'pdf' | 'external_link';
  filePath?: string;      // For type='pdf': path relative to /public/, e.g., "resources/club-policies/code-of-conduct.pdf"
  url?: string;           // For type='external_link': full URL, e.g., "https://bendigobasketball.com.au/child-protection-policy/"
}
```

**Invariants**:
- Exactly one policy `name` per entry (no duplicates)
- If `type` is `'pdf'`, `filePath` must be provided and valid
- If `type` is `'external_link'`, `url` must be provided and be a valid absolute URL
- `filePath` paths must exist in `/public/resources/club-policies/`
- `name` is used for alphabetical sorting in ascending order (A-Z)
- `name` length should be reasonable; very long names will truncate with ellipsis in UI

**Example Data**:
```javascript
const clubPolicies = [
  {
    name: 'Child Protection Policy',
    type: 'external_link',
    url: 'https://bendigobasketball.com.au/child-protection-policy/',
  },
  {
    name: 'Code of Conduct',
    type: 'pdf',
    filePath: 'resources/club-policies/code-of-conduct.pdf',
  },
  {
    name: 'Gender, Disrespect & Violence',
    type: 'external_link',
    url: 'https://sportsfocus.com.au/issue-gender-disrespect-violence/',
  },
  {
    name: 'Privacy Policy',
    type: 'pdf',
    filePath: 'resources/club-policies/privacy-policy.pdf',
  },
  {
    name: 'Registration & Eligibility',
    type: 'pdf',
    filePath: 'resources/club-policies/registration-and-eligibility.pdf',
  },
  // ... more policies, sorted alphabetically by name
];
```

**Display Behaviour**:
- Sorted strictly alphabetically by `name` (case-insensitive)
- Two-column grid on desktop (≥sm breakpoint), single-column on mobile (<sm)
- Each policy renders as a list item or card showing:
  - `name` (with truncate/ellipsis if very long)
  - Icon: 📄 for PDF, 🔗 for external link
  - Action: "Expand" for PDF, "Open" for external link
- PDF policies expand inline with embedded `<embed>` tag; only one can be expanded at a time
- External links open in new tab with `target="_blank"` and `rel="noopener noreferrer"`

---

### 2. Guide (Resources Page Guides Tab)

**Location**: `src/data/guides.json`

**TypeScript Interface**:
```typescript
interface Guide {
  id: string;              // Unique identifier, e.g., 'guide-001', 'how-to-score'
  title: string;           // Display title, e.g., "How to Score a Game"
  category: string;        // e.g., 'PlayHQ', 'Team Management', 'Coaching Basics'
  youtubeUrl: string;      // Full YouTube URL: https://youtu.be/{VIDEO_ID} or https://www.youtube.com/watch?v={VIDEO_ID}
  description?: string;    // Optional: short description visible in card
  dateAdded: string;       // ISO date, e.g., '2026-04-11'
}
```

**Invariants**:
- Each guide must have a unique `id`
- `title` is required and should be descriptive
- `category` is a freeform string (not an enum) to allow flexibility for future categories
- `youtubeUrl` must be a valid YouTube URL (either short `youtu.be/` or full `youtube.com/watch?v=` format)
- `dateAdded` should be an ISO 8601 date string (YYYY-MM-DD)
- `description` is optional; if provided, should be 1-3 sentences

**Complete Example** (`src/data/guides.json`):
```json
[
  {
    "id": "guide-001",
    "title": "How to Score a Game",
    "category": "PlayHQ",
    "youtubeUrl": "https://youtu.be/OdTboL_uYqk?si=DHaDOyoUJOXQLC4G&t=2",
    "description": "Step-by-step tutorial for entering game scores in PlayHQ during a match.",
    "dateAdded": "2026-04-11"
  },
  {
    "id": "guide-002",
    "title": "Team Communications Best Practices",
    "category": "Team Management",
    "youtubeUrl": "https://www.youtube.com/watch?v=example_video_id",
    "description": "Tips for effective communication with parents, players, and coaches.",
    "dateAdded": "2026-04-15"
  }
]
```

**Display Behaviour**:
- Guides displayed as cards in a responsive grid (same layout as resource cards)
- Each card shows:
  - `title` at the top
  - `category` label (e.g., badge or tag)
  - Embedded YouTube player with `<iframe>` (16:9 aspect ratio, standard controls)
  - Optional `description` below or alongside video
- Guides grouped or visually separated by category (can be sorted by category or displayed with category labels)
- YouTube URL transformed at render time from various formats to standard embed URL:
  - `https://youtu.be/{VIDEO_ID}` → `https://www.youtube.com/embed/{VIDEO_ID}`
  - `https://www.youtube.com/watch?v={VIDEO_ID}` → `https://www.youtube.com/embed/{VIDEO_ID}`
  - Query params (e.g., `?t=120` for timestamps) are preserved where possible

---

### 3. ResourceAudience Type Update

**File**: `src/lib/resources/types.ts`

**Change**:
```typescript
// Before:
export type ResourceAudience = 'coaching' | 'players';

// After:
export type ResourceAudience = 'coaching' | 'players' | 'managers';
```

**Impact**:
- Manager resources in `src/data/manager-resources.json` now conform to the `Resource` interface with `audience: 'managers'`
- No schema changes to the `Resource` interface itself
- `ResourceType` already includes `'document'`, so manager resources can use `type: 'document'`
- Manager resources use `url` field (not `filePath`) consistent with existing pattern

**Manager Resource Example** (in `src/data/manager-resources.json`):
```json
{
  "id": "manager-001",
  "title": "Club Constitution & By-Laws",
  "description": "Official Bendigo Phoenix constitution and by-laws document.",
  "audience": "managers",
  "category": "Policies",
  "ageGroup": "All Ages",
  "type": "document",
  "url": "/resources/team-manager/constitution-bylaws.pdf",
  "dateAdded": "2026-01-01"
}
```

---

## File Organization

### New Files

```
src/data/guides.json
├── Array of Guide objects
├── Initial entry: How to Score a Game (PlayHQ category)
└── Extensible for future guides
```

### Modified Files

```
src/lib/resources/types.ts
├── Add 'managers' to ResourceAudience type
└── No other changes to Resource interface

src/data/manager-resources.json
├── Update placeholder urls ("# ") with real document paths
├── Ensure all entries have audience: 'managers'
├── Ensure all entries have type: 'document'
└── Example: "url": "/resources/team-manager/constitution-bylaws.pdf"

src/pages/about.astro
├── Replace hardcoded placeholder policies array with real clubPolicies
├── Render clubPolicies in alphabetical order
└── Implement accordion + inline PDF embed UI

src/pages/resources/index.astro
├── Remove 'hidden' class from Manager tab button
├── Add Guides tab button and panel
├── Import guides.json and render Guides panel
└── Update switchTab() to suppress filters-managers
```

### Static Assets

```
/public/resources/club-policies/
├── code-of-conduct.pdf
├── privacy-policy.pdf
├── registration-and-eligibility.pdf
├── uniform-policy.pdf
├── player-welfare.pdf
├── photography-social-media.pdf
├── grievance-procedure.pdf
└── [additional policies as sourced]

/public/resources/team-manager/
├── annual-budget-template.pdf
├── club-constitution-bylaws.pdf
├── incident-report-form.pdf
├── parent-communication-template.pdf
├── registration-fees-policy.pdf
├── sponsorship-proposal-template.pdf
├── working-with-children-check-guide.pdf
└── end-of-season-presentation-guide.pdf
```

**File Naming Convention**: Lowercase kebab-case (e.g., `code-of-conduct.pdf`, `working-with-children-check-guide.pdf`)

---

## Data Migration & Population

### Phase 1: Type Update (No Data Migration Needed)

1. Update `ResourceAudience` type in `src/lib/resources/types.ts`
2. No data migration required; existing data is unchanged

### Phase 2: Club Policies

1. Source real policy PDFs from old website or club documentation
2. Store PDFs in `/public/resources/club-policies/` with kebab-case filenames
3. Create `clubPolicies` array in `about.astro` with entries pointing to PDF files or external URLs
4. Verify files are compressed (<5MB each)

**Example Sources**:
- Old website: https://bendigophoenix.org.au/ (or archive)
- Club documentation: Internal files provided by club leadership
- External policies: Bendigo Basketball Association policies (external links)

### Phase 3: Team Manager Resources

1. Source manager documents from old website or club documentation
2. Store PDFs in `/public/resources/team-manager/` with kebab-case filenames
3. Update `manager-resources.json` entries: replace placeholder `url: "#"` with real paths (e.g., `/resources/team-manager/constitution-bylaws.pdf`)
4. Verify files are compressed (<5MB each)

**Example Mapping** (placeholder → real):
```json
Before:
{
  "id": "manager-001",
  "title": "Club Constitution & By-Laws",
  "url": "#"
}

After:
{
  "id": "manager-001",
  "title": "Club Constitution & By-Laws",
  "url": "/resources/team-manager/constitution-bylaws.pdf"
}
```

### Phase 4: Guides

1. Create `src/data/guides.json` with initial guide entry
2. Populate with `Guide` objects from provided YouTube URLs
3. Test YouTube URL transformation logic (handles `youtu.be/` and `youtube.com/watch?v=` formats)

**Initial Guide**:
```json
{
  "id": "guide-001",
  "title": "How to Score a Game",
  "category": "PlayHQ",
  "youtubeUrl": "https://youtu.be/OdTboL_uYqk?si=DHaDOyoUJOXQLC4G&t=2",
  "description": "Step-by-step tutorial for entering game scores in PlayHQ.",
  "dateAdded": "2026-04-11"
}
```

---

## Data Validation & Constraints

### ClubPolicy Validation

At render time or build time, validate:
- [ ] Each `name` is unique (no duplicates)
- [ ] If `type` is `'pdf'`, `filePath` must be provided
- [ ] If `type` is `'external_link'`, `url` must be provided
- [ ] For PDFs: File exists at `/public/{filePath}`
- [ ] For external links: URL is valid (starts with `http://` or `https://`)
- [ ] Sorting: Policies are displayed in alphabetical order by `name`

**Validation Location**: Astro component frontmatter or utility function (non-critical; warnings can be logged)

### Guide Validation

At build time, validate:
- [ ] Each `id` is unique
- [ ] `youtubeUrl` is a valid YouTube link
- [ ] `dateAdded` is a valid ISO date
- [ ] `category` is a non-empty string

**Validation Location**: Build script or Astro plugin (can warn on console during `npm run build`)

### Manager Resource Validation

Existing validation (already in place):
- [ ] Each `id` is unique
- [ ] `audience` includes `'managers'` (after type update)
- [ ] `type` is `'document'`
- [ ] `url` is non-empty

**Validation Location**: Existing resource filter logic in `src/lib/resources/filters.ts`

---

## Backwards Compatibility

### No Breaking Changes

- Existing `Resource` interface unchanged (only type `ResourceAudience` expanded)
- Existing `coaching` and `players` audiences unaffected
- Existing data files (`coaching-resources.json`, `player-resources.json`) unchanged
- Existing About page structure preserved; Club Policies section added/replaced as new feature

### Migration Assumptions

- Old website and club have access to real PDFs or can source them
- URLs in `manager-resources.json` are relative to `/public/` or absolute external links
- No existing code relies on the `hidden` class of `tab-managers`; removal is safe

---

## Future Data Extensions

### Possible Extensions (Out of Scope for MVP)

1. **Policy Versions**: Add `version` and `versionDate` to `ClubPolicy`
   ```typescript
   interface ClubPolicy {
     // ... existing fields
     version?: string;       // e.g., "2.0"
     versionDate?: string;   // ISO date of this version
     previousUrl?: string;   // Link to previous version
   }
   ```

2. **Guide Metadata**: Add `duration`, `level`, `transcript`
   ```typescript
   interface Guide {
     // ... existing fields
     duration?: number;      // Video duration in seconds
     level?: 'beginner' | 'intermediate' | 'advanced';
     transcript?: string;    // Transcribed text for accessibility
   }
   ```

3. **Manager Resource Subcategories**: Add `subcategory` for more granular organization
   ```typescript
   // In manager-resources.json
   "subcategory": "Team Operations"  // e.g., under "Administration"
   ```

4. **Policy Search Index**: Add searchable content index
   ```typescript
   interface ClubPolicy {
     // ... existing fields
     searchText?: string;    // Concatenated text for search
   }
   ```

---

## Data Size & Performance

### Estimated Data Sizes

- **Club Policies**: ~10 JSON objects = ~2-3 KB (minified)
- **Guides**: ~5-10 JSON objects = ~2-3 KB (minified)
- **Manager Resources**: ~8 JSON objects = ~3-4 KB (already exists)
- **PDF Files**: ~6-10 × 500 KB to 5 MB = 3-50 MB depending on compression

### Impact on Build

- No impact: All data is static JSON and PDFs (no dynamic generation)
- Build time: Negligible (JSON is parsed once at build time)
- Bundle size: PDFs are static assets; not included in JS bundle

### Impact on Runtime

- No impact: All data is baked into HTML at build time
- First contentful paint: No change (PDFs are loaded on-demand, not at page load)
- Memory: Minimal (all data is static)

---

## Maintenance & Updating

### How to Add a New Club Policy

1. Obtain PDF file from club leadership
2. Compress PDF if needed (target <5 MB)
3. Place in `/public/resources/club-policies/{kebab-case-name}.pdf`
4. Add entry to `clubPolicies` array in `about.astro`:
   ```javascript
   {
     name: 'New Policy Name',
     type: 'pdf',
     filePath: 'resources/club-policies/new-policy-name.pdf',
   }
   ```
5. Rebuild site: `npm run build`

### How to Add a New Manager Resource

1. Obtain PDF or finalize URL for document
2. If PDF: Compress and place in `/public/resources/team-manager/{kebab-case-name}.pdf`
3. Add or update entry in `src/data/manager-resources.json`:
   ```json
   {
     "id": "manager-009",
     "title": "New Document Title",
     "description": "...",
     "audience": "managers",
     "category": "Finance",
     "ageGroup": "All Ages",
     "type": "document",
     "url": "/resources/team-manager/new-document.pdf",
     "dateAdded": "2026-04-15"
   }
   ```
4. Rebuild site: `npm run build`

### How to Add a New Guide

1. Find YouTube video URL (or have someone provide it)
2. Add entry to `src/data/guides.json`:
   ```json
   {
     "id": "guide-002",
     "title": "Video Title",
     "category": "Category Name",
     "youtubeUrl": "https://youtu.be/VIDEO_ID",
     "description": "Short description",
     "dateAdded": "2026-04-15"
   }
   ```
3. Rebuild site: `npm run build`

---

## Data Integrity & Validation

### Build-Time Validation (Recommended)

Create an Astro integration or build script to validate:

```typescript
// astro.config.mjs — Add validation hook
export default defineConfig({
  integrations: [
    {
      name: 'validate-data',
      hooks: {
        'astro:build:start': async () => {
          const guides = await import('./src/data/guides.json');
          const ids = new Set();
          for (const guide of guides.default) {
            if (ids.has(guide.id)) {
              throw new Error(`Duplicate guide ID: ${guide.id}`);
            }
            ids.add(guide.id);
            // Validate youtubeUrl format
            if (!isValidYoutubeUrl(guide.youtubeUrl)) {
              console.warn(`Invalid YouTube URL in guide ${guide.id}`);
            }
          }
        },
      },
    },
  ],
});
```

### Runtime Validation (Fallback)

Display error states gracefully:
- Missing PDF: Show "Document temporarily unavailable" message
- Invalid YouTube URL: Show empty iframe with error text
- No guides/policies: Show "No resources available yet" message

---

## Summary

This data model is minimal, static, and maintainable:
- No database changes required
- All data is JSON or static files
- Easily extensible for future features
- Backward compatible with existing code
- Supports public access without authentication
