# Data Contracts: Documents Feature (COA-26)

**Date**: 2026-04-11 | **Branch**: cameronwalsh/coa-26-documents

---

## Overview

This document defines the data contracts for the Documents feature (COA-26). Since this is a static Astro site, there are no HTTP API contracts, only **data structure contracts** that define the shape and semantics of JSON data and component props.

---

## JSON Data Contracts

### guides.json Contract

**File**: `src/data/guides.json`

**Shape**:
```typescript
interface Guide {
  id: string;              // Unique identifier
  title: string;           // Display title
  category: string;        // Category name
  youtubeUrl: string;      // Full YouTube URL
  description?: string;    // Optional description
  dateAdded: string;       // ISO date
}

// Root shape
type Guides = Guide[];
```

**Example**:
```json
[
  {
    "id": "guide-001",
    "title": "How to Score a Game",
    "category": "PlayHQ",
    "youtubeUrl": "https://youtu.be/OdTboL_uYqk",
    "description": "Step-by-step tutorial for scoring in PlayHQ.",
    "dateAdded": "2026-04-11"
  }
]
```

**Validation Rules**:
- `id`: Required, string, unique across all guides, non-empty
- `title`: Required, string, non-empty, 1-200 characters
- `category`: Required, string, non-empty, 1-50 characters (freeform, not enum)
- `youtubeUrl`: Required, string, valid YouTube URL (supports `youtu.be/` or `youtube.com/watch?v=`)
- `description`: Optional, string, 0-500 characters
- `dateAdded`: Required, string, valid ISO date (YYYY-MM-DD format)

**Constraints**:
- Maximum 100 guides (no hard limit, but reasonable for performance)
- File size should be <50 KB
- No circular references (JSON array is flat)

**Backward Compatibility**: N/A (new file)

---

### manager-resources.json Contract Update

**File**: `src/data/manager-resources.json`

**Shape** (existing with updates):
```typescript
interface Resource {
  id: string;
  title: string;
  description: string;
  audience: 'coaching' | 'players' | 'managers';  // Updated: added 'managers'
  category: string;
  ageGroup: string;
  type: 'pdf' | 'link' | 'video' | 'document';     // 'document' used for manager resources
  url: string;                                      // Must be non-empty for managers
  imageUrl?: string;
  dateAdded: string;
}

// Root shape
type Resources = Resource[];
```

**Example Manager Entry**:
```json
{
  "id": "manager-001",
  "title": "Club Constitution & By-Laws",
  "description": "Official Bendigo Phoenix constitution and by-laws document. Required reading for all committee members.",
  "audience": "managers",
  "category": "Policies",
  "ageGroup": "All Ages",
  "type": "document",
  "url": "/resources/team-manager/constitution-bylaws.pdf",
  "dateAdded": "2026-01-01"
}
```

**Validation Rules** (for manager resources):
- `id`: Required, string, unique, non-empty
- `title`: Required, string, non-empty, 1-200 characters
- `description`: Required, string, non-empty, 10-500 characters
- `audience`: Required, must be `'managers'` for this resource type
- `category`: Required, string, non-empty, examples: "Policies", "Administration", "Finance", "Compliance", "Communication", "Events"
- `ageGroup`: Required for existing Resource interface, but for managers all use `"All Ages"`
- `type`: Required, must be `'document'` for manager resources
- `url`: Required, non-empty string, points to `/resources/team-manager/*.pdf` or external URL
- `dateAdded`: Required, valid ISO date (YYYY-MM-DD)
- `imageUrl`: Optional (managers typically don't use images)

**Constraints**:
- All entries must have `audience: 'managers'`
- All entries must have `type: 'document'`
- All entries must have non-empty `url`
- Maximum 50 manager resources
- File size should be <50 KB

**Breaking Changes**: None. This is a backward-compatible type extension (added new audience value). Existing `'coaching'` and `'players'` entries are unaffected.

---

### club-policies.json (Future) Contract

**File**: `src/data/club-policies.json` (optional future refactor)

**Shape** (if moved to separate file):
```typescript
interface ClubPolicy {
  name: string;           // Display name; used for sorting
  type: 'pdf' | 'external_link';
  filePath?: string;      // For PDFs: path relative to /public/
  url?: string;           // For external links: full URL
}

// Root shape
type ClubPolicies = ClubPolicy[];
```

**Example**:
```json
[
  {
    "name": "Child Protection Policy",
    "type": "external_link",
    "url": "https://bendigobasketball.com.au/child-protection-policy/"
  },
  {
    "name": "Code of Conduct",
    "type": "pdf",
    "filePath": "resources/club-policies/code-of-conduct.pdf"
  }
]
```

**Validation Rules**:
- `name`: Required, string, unique, non-empty, 1-200 characters
- `type`: Required, must be `'pdf'` or `'external_link'`
- If `type === 'pdf'`:
  - `filePath`: Required, non-empty string, path exists in `/public/`
  - `url`: Must not be present
- If `type === 'external_link'`:
  - `url`: Required, non-empty string, valid absolute URL (starts with http/https)
  - `filePath`: Must not be present

**Constraints**:
- Maximum 50 policies
- File size should be <20 KB
- File names must be unique (prevent collisions)

**Current Status**: Data is defined inline in `about.astro` (not a separate file). Can be refactored to JSON in future.

---

## Component Prop Contracts

### ClubPoliciesSection Component Props

**Props**:
```typescript
interface ClubPoliciesSectionProps {
  policies: ClubPolicy[];
}
```

**Usage**:
```astro
<ClubPoliciesSection policies={clubPolicies} />
```

**Behavior**:
- Accepts array of `ClubPolicy` objects
- Renders as two-column grid on desktop, single-column on mobile
- Sorts policies alphabetically by `name` before rendering
- PDF policies render with accordion expand/collapse
- External links render with open-in-new-tab behavior
- No props for customization (single use case)

---

### GuidesTabPanel Component Props

**Props**:
```typescript
interface GuidesTabPanelProps {
  guides: Guide[];
}
```

**Usage**:
```astro
<GuidesTabPanel guides={guides} />
```

**Behavior**:
- Accepts array of `Guide` objects
- Renders as responsive grid of cards
- Each card displays YouTube embed using transformed URL
- Cards grouped or labeled by `category`
- No filter controls

---

## Type Updates

### ResourceAudience Type Update

**File**: `src/lib/resources/types.ts`

**Change**:
```typescript
// Before:
export type ResourceAudience = 'coaching' | 'players';

// After:
export type ResourceAudience = 'coaching' | 'players' | 'managers';
```

**Impact**:
- `Resource` interface now allows `audience: 'managers'`
- All existing code using `ResourceAudience` is still valid
- Filter functions must handle `'managers'` audience (no filters shown for manager resources)
- No code changes required for backward compatibility

---

## Data Flow Contracts

### About Page Data Flow

```
about.astro frontmatter
  └─ clubPolicies: ClubPolicy[]
     └─ ClubPoliciesSection component
        ├─ Render as HTML
        └─ JavaScript accordion logic (client-side)
```

**Invariants**:
- `clubPolicies` array is sorted alphabetically at render time
- Only one PDF can be expanded at a time (enforced by JavaScript)
- Download button filename matches PDF filename

---

### Resources Page Data Flow

```
resources/index.astro frontmatter
  ├─ managerResources: Resource[]  (audience === 'managers')
  │  └─ ManagerTabPanel component
  │     └─ Render as resource cards (same as coaching/player resources)
  │
  └─ guides: Guide[]
     └─ GuidesTabPanel component
        └─ Render as YouTube embed cards grouped by category
```

**Invariants**:
- Manager resources always use `type: 'document'`
- Manager resources always use `audience: 'managers'`
- Manager tab never shows filter controls
- Guides tab is independent of filters

---

## Static Asset Contracts

### PDF File Organization

**Structure**:
```
/public/resources/
├── club-policies/
│   └── {kebab-case-filename}.pdf
└── team-manager/
    └── {kebab-case-filename}.pdf
```

**Filename Requirements**:
- Lowercase
- Kebab-case (hyphens, no spaces or special chars)
- `.pdf` extension
- Examples: `code-of-conduct.pdf`, `working-with-children-check-guide.pdf`

**File Requirements**:
- Format: Valid PDF
- Size: <5 MB (target <2 MB for faster loading)
- Accessibility: PDFs should contain text (not scanned images if possible)
- Compression: Compressed before commit

**Path References**:
- In `ClubPolicy`: Use relative path `'resources/club-policies/code-of-conduct.pdf'`
- In `Resource` (manager): Use absolute path `'/resources/team-manager/constitution-bylaws.pdf'`

---

## Error Handling Contracts

### Missing PDF File

**Error Condition**: `filePath` points to non-existent PDF

**Handling**:
```html
<!-- Embed attempts to load -->
<embed src="/resources/club-policies/missing.pdf" type="application/pdf" />

<!-- On error, show fallback -->
<div class="bg-yellow-50 border border-yellow-200 p-4 rounded">
  <p>Document temporarily unavailable</p>
  <a href="/resources/club-policies/missing.pdf">Try downloading</a>
</div>
```

**User Experience**: Policy item still visible in list; embed replaced with message

---

### Invalid YouTube URL

**Error Condition**: `youtubeUrl` is not a valid YouTube link or cannot be transformed

**Handling**:
```html
<!-- Iframe attempts to load with invalid URL -->
<iframe src="https://www.youtube.com/embed/invalid_url"></iframe>

<!-- YouTube returns 404 or blank player -->
<!-- Fallback: Show link to video instead -->
<a href="https://youtu.be/invalid_url" target="_blank">Watch on YouTube</a>
```

**User Experience**: Blank video player with fallback link; guide card still visible

---

### Broken External Link

**Error Condition**: `url` returns 404 or is unreachable

**Handling**:
```html
<!-- Link rendered normally with target="_blank" -->
<a href="https://unreachable-url.example.com" target="_blank" rel="noopener noreferrer">
  External Policy
</a>

<!-- User clicks and gets browser 404 page -->
<!-- No special handling in our code -->
```

**User Experience**: Link opens but destination is not found. This is acceptable; URL validity is the responsibility of data maintainer.

---

## Validation Contracts

### Guide ID Validation

**Rule**: Each `id` must be unique within `guides.json`

**Check**:
```typescript
const ids = new Set(guides.map(g => g.id));
if (ids.size !== guides.length) {
  throw new Error('Duplicate guide IDs found');
}
```

**Enforcement**: Build-time warning (non-blocking) or Astro plugin validation

---

### YouTube URL Validation

**Rule**: `youtubeUrl` must be a valid YouTube link

**Check**:
```typescript
function isValidYoutubeUrl(url: string): boolean {
  return /(?:youtu\.be|youtube\.com)/.test(url);
}
```

**Enforcement**: Runtime warning if URL doesn't match pattern (still renders, but may fail to load)

---

### ClubPolicy Type Consistency

**Rule**: If `type === 'pdf'`, then `filePath` must exist; if `type === 'external_link'`, then `url` must exist

**Check**:
```typescript
for (const policy of clubPolicies) {
  if (policy.type === 'pdf' && !policy.filePath) {
    throw new Error(`PDF policy ${policy.name} missing filePath`);
  }
  if (policy.type === 'external_link' && !policy.url) {
    throw new Error(`External policy ${policy.name} missing url`);
  }
}
```

**Enforcement**: Build-time error (blocking)

---

## Serialization Contracts

### JSON Serialization

All data files are valid JSON and do not require special serialization:
- No circular references
- No functions or symbols
- Dates as ISO strings (not Date objects)
- All strings use UTF-8 encoding

### TypeScript Compilation

- `guides.json` is validated against `Guide[]` type
- `manager-resources.json` is validated against `Resource[]` type
- `clubPolicies` array in `about.astro` is validated against `ClubPolicy[]` type
- TypeScript compiler ensures type safety at build time

---

## API Version & Stability

### Version: 1.0

No versioning is needed for static JSON data (not an API). However, if these contracts are exposed via an API in future:
- Current version: `1.0`
- Stable: Yes
- Breaking changes: None planned for MVP

### Future Compatibility

If a CMS or API is added in future:
- New endpoints should follow RESTful conventions
- JSON shape should remain backward compatible
- New fields are acceptable (old clients ignore unknown fields)
- Removed fields would be breaking changes (to be avoided)

---

## Summary

These contracts define the data shape and behavior for COA-26:

| Contract | Type | Status | Validation |
|----------|------|--------|-----------|
| `guides.json` | JSON | New | Build-time |
| `manager-resources.json` | JSON | Updated | Existing |
| `ClubPolicy` | Type | New (inline) | Runtime |
| `ResourceAudience` | Type | Updated | Compile-time |
| Component props | TypeScript | New | Compile-time |
| PDF files | Static assets | New | Manual |

All contracts are simple, deterministic, and easily validated before deployment.
