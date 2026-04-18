# Data Model: Sponsors Carousel

**Feature**: COA-58 Sponsors Carousel | **Date**: 2026-04-18

---

## Overview

The sponsors carousel uses a **static JSON data source** (`/src/data/sponsors.json`) for sponsor configuration. No database schema changes are required (frontend-only feature).

---

## Data Structure

### Root Configuration Object

**File**: `/src/data/sponsors.json`

```json
{
  "sponsors": [
    {
      "id": "sponsor-001",
      "name": "MB Automation Victoria",
      "logo": "/images/sponsors/mb-automation-vic-logo.png",
      "link": "https://www.facebook.com/mb.automation.vic",
      "joinedDate": "2026-04-15"
    },
    {
      "id": "sponsor-002",
      "name": "Another Sponsor",
      "logo": "/images/sponsors/another-sponsor-logo.png",
      "link": "https://example.com",
      "joinedDate": "2026-04-20"
    }
  ],
  "sponsorCountThreshold": 6,
  "ctaLink": "/get-involved"
}
```

### Sponsor Object Schema

| Field | Type | Required | Description | Constraints | Example |
|-------|------|----------|-------------|-------------|---------|
| `id` | string | ✅ Yes | Unique sponsor identifier | Alphanumeric, no spaces | `"sponsor-001"` |
| `name` | string | ✅ Yes | Sponsor display name | 1-100 chars | `"MB Automation Victoria"` |
| `logo` | string | ✅ Yes | Image file path or URL | Valid image path; WebP or PNG | `"/images/sponsors/logo.png"` |
| `link` | string | ❌ Optional | External sponsor website/social URL | Valid HTTP/HTTPS URL or null | `"https://www.facebook.com/mb.automation.vic"` or `null` |
| `joinedDate` | string | ✅ Yes | Date sponsor joined (ISO 8601) | Valid date string | `"2026-04-15"` |

### Configuration Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `sponsorCountThreshold` | number | 6 | Sponsor count at which static button appears; CTA card shown when count < threshold |
| `ctaLink` | string | `/get-involved` | Route for "Become a Sponsor" CTA card |

---

## Component Interface

**TypeScript Interface** (used in `SponsorCarousel.astro`):

```typescript
interface Sponsor {
  id: string;           // Unique identifier
  name: string;         // Sponsor name (used in alt text, aria-label)
  logo: string;         // Image path (public URL or relative path)
  link?: string;        // External URL (optional; null = no link)
  joinedDate: string;   // ISO date string
}

interface SponsorCarouselProps {
  sponsors: Sponsor[];           // Array of sponsor objects
  sponsorCountThreshold?: number; // Default: 6
  ctaLink?: string;              // Default: "/get-involved"
}
```

---

## Data Validation Rules

### Invariants

1. **Unique IDs**: Each sponsor must have a unique `id` field. Duplicate IDs are invalid.
2. **Non-Empty Name**: Sponsor `name` must be at least 1 character, max 100 characters.
3. **Valid Image Path**: Sponsor `logo` must be a valid file path or URL pointing to WebP or PNG image.
4. **Valid URL Format**: Sponsor `link` (if present) must be valid HTTP/HTTPS URL, or null/undefined.
5. **Valid Date Format**: `joinedDate` must be valid ISO 8601 date string (YYYY-MM-DD).
6. **Threshold Range**: `sponsorCountThreshold` must be positive integer (recommended: 1-20).

### Validation on Load

The `SponsorCarousel` component should validate sponsor data on load:

```typescript
function validateSponsor(sponsor: unknown): sponsor is Sponsor {
  if (!sponsor || typeof sponsor !== 'object') return false;
  
  const s = sponsor as Record<string, unknown>;
  
  // Required fields
  if (typeof s.id !== 'string' || !s.id.trim()) return false;
  if (typeof s.name !== 'string' || !s.name.trim()) return false;
  if (typeof s.logo !== 'string' || !s.logo.trim()) return false;
  if (typeof s.joinedDate !== 'string' || !isValidISO8601(s.joinedDate)) return false;
  
  // Optional link field
  if (s.link !== null && s.link !== undefined) {
    if (typeof s.link !== 'string' || !isValidURL(s.link)) return false;
  }
  
  return true;
}

function validateConfig(config: unknown) {
  if (!config || typeof config !== 'object') throw new Error('Invalid config');
  
  const c = config as Record<string, unknown>;
  
  if (!Array.isArray(c.sponsors)) throw new Error('Missing sponsors array');
  
  const validSponsors = c.sponsors.filter(validateSponsor);
  if (validSponsors.length === 0 && c.sponsors.length > 0) {
    console.warn('No valid sponsors found; using CTA-only carousel');
  }
  
  return {
    sponsors: validSponsors,
    threshold: typeof c.sponsorCountThreshold === 'number' ? c.sponsorCountThreshold : 6,
    ctaLink: typeof c.ctaLink === 'string' ? c.ctaLink : '/get-involved',
  };
}
```

---

## Constraints & Edge Cases

### Missing Fields

| Scenario | Handling | Notes |
|----------|----------|-------|
| Missing `id` | Skip sponsor (warn in console) | ID required for React key and tracking |
| Missing `name` | Skip sponsor (warn in console) | Name required for alt text and aria-label |
| Missing `logo` | Skip sponsor (warn in console) | Logo required for display |
| Missing `link` | Render logo as static image (no anchor) | Optional per spec; graceful fallback |
| Missing `joinedDate` | Use today's date (warn in console) | Non-critical; used for sorting (future) |
| Missing `sponsorCountThreshold` | Default to 6 | Configurable; safe default provided |
| Missing `ctaLink` | Default to `/get-involved` | Fallback to sensible default |

### Invalid Data

| Scenario | Handling | Example |
|----------|----------|---------|
| Invalid image path/URL | Show gray placeholder; warn in console | `logo: "invalid-path"` |
| Invalid URL in link | Skip anchor; render as static image | `link: "not-a-url"` |
| Invalid ISO date | Use today; warn in console | `joinedDate: "2026-13-01"` |
| Duplicate IDs | Use first occurrence; warn in console | Two sponsors with `id: "s-001"` |

### Empty Array

| Scenario | Handling | Notes |
|----------|----------|-------|
| Empty sponsors array | Show CTA card only (no sponsor cards) | Valid state; waiting for first sponsor |

---

## File Storage & Optimization

### Image Directory Structure

**Location**: `/public/images/sponsors/`

```
public/images/sponsors/
├── mb-automation-vic-logo.png          (PNG fallback)
├── mb-automation-vic-logo.webp         (WebP optimized)
├── another-sponsor-logo.png
├── another-sponsor-logo.webp
└── ...
```

### Image File Naming Convention

- Use lowercase, kebab-case: `sponsor-name-logo.ext`
- Include both `.webp` and `.png` for each logo
- Max file size: ~100KB per WebP, ~150KB per PNG

### Optimization Strategy

1. **Primary Sponsor** (first in array):
   - Load with `loading="eager"` for immediate display
   - Load with `decoding="auto"` for main thread rendering

2. **Secondary Sponsors** (rest of array):
   - Load with `loading="lazy"` to defer until visible
   - Load with `decoding="async"` for background processing

3. **Image Format**:
   - Serve WebP on modern browsers (Chrome, Firefox, Edge)
   - Fall back to PNG on older browsers (IE 11, older Safari)
   - Use Astro Image component for automatic optimization

---

## Future Extensibility

### Sorting Sponsors

**By Joined Date** (ascending, newest first):
```typescript
const sortedSponsors = sponsors.sort(
  (a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime()
);
```

### Adding Sponsor Tier/Level

Extend schema for future sponsorship levels:
```typescript
interface Sponsor {
  id: string;
  name: string;
  logo: string;
  link?: string;
  joinedDate: string;
  tier?: 'platinum' | 'gold' | 'silver';  // Future: for special styling
  featured?: boolean;                      // Future: pin sponsor to top
}
```

### Adding Sponsor Categories

Extend schema for sponsor types:
```typescript
{
  "sponsors": [...],
  "categories": {
    "official": [...],
    "partners": [...],
    "supporters": [...]
  }
}
```

---

## Migration Path

### Adding a New Sponsor

1. Add new object to `sponsors` array in `/src/data/sponsors.json`
2. Ensure all required fields are present and valid
3. Upload logo images to `/public/images/sponsors/`
4. Rebuild site: `npm run build`

### Updating Sponsor Link

Edit `link` field in sponsors.json; rebuild.

### Updating Sponsor Logo

Replace image file in `/public/images/sponsors/`; rebuild.

### Changing Threshold

Update `sponsorCountThreshold` value in sponsors.json; no component changes needed.

---

## Testing Validation

### Test Data

**Valid Sponsor**:
```json
{
  "id": "test-sponsor-001",
  "name": "Test Sponsor Inc",
  "logo": "/images/sponsors/test-logo.png",
  "link": "https://example.com",
  "joinedDate": "2026-04-15"
}
```

**Invalid Sponsor (Missing Name)**:
```json
{
  "id": "invalid-001",
  "logo": "/images/sponsors/logo.png",
  "joinedDate": "2026-04-15"
}
```

**No Link (Valid)**:
```json
{
  "id": "no-link-sponsor",
  "name": "Display Only Sponsor",
  "logo": "/images/sponsors/logo.png",
  "joinedDate": "2026-04-15"
}
```

---

## Reference: Complete Example

```json
{
  "sponsors": [
    {
      "id": "sponsor-001",
      "name": "MB Automation Victoria",
      "logo": "/images/sponsors/mb-automation-vic-logo.png",
      "link": "https://www.facebook.com/mb.automation.vic",
      "joinedDate": "2026-04-15"
    },
    {
      "id": "sponsor-002",
      "name": "Local Business Name",
      "logo": "/images/sponsors/local-business-logo.png",
      "link": "https://localbusiness.com.au",
      "joinedDate": "2026-04-20"
    },
    {
      "id": "sponsor-003",
      "name": "Community Partner",
      "logo": "/images/sponsors/community-partner-logo.png",
      "joinedDate": "2026-05-01"
    }
  ],
  "sponsorCountThreshold": 6,
  "ctaLink": "/get-involved"
}
```

---

**Data Model**: Complete & Ready for Implementation

Status: ✅ Approved for Phase 1 (data model) implementation
