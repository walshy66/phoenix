# Data Contract: Sponsor Configuration

**Feature**: COA-58 Sponsors Carousel | **Component**: `SponsorCarousel.astro` | **Date**: 2026-04-18

---

## Contract Overview

This document defines the **data shape, validation rules, and API contract** for sponsor configuration in the Sponsors Carousel feature. All sponsor data flows through this contract before rendering.

---

## Data Shape Contract

### Configuration File Format

**Location**: `/src/data/sponsors.json`

**MIME Type**: `application/json`

**Root Schema**:
```typescript
{
  sponsors: Sponsor[];           // Required: array of sponsor objects
  sponsorCountThreshold: number; // Optional: sponsor count threshold (default: 6)
  ctaLink: string;               // Optional: CTA route (default: "/get-involved")
}
```

### Sponsor Object Contract

**Schema**:
```typescript
interface Sponsor {
  id: string;           // Required: unique identifier (alphanumeric, no spaces)
  name: string;         // Required: sponsor name (1-100 characters)
  logo: string;         // Required: image file path or URL (WebP or PNG)
  link?: string | null; // Optional: external sponsor URL (HTTP/HTTPS or null)
  joinedDate: string;   // Required: ISO 8601 date string (YYYY-MM-DD)
}
```

### Field Specifications

| Field | Type | Required | Validation | Example |
|-------|------|----------|-----------|---------|
| `id` | string | ✅ Yes | Alphanumeric, no spaces, 1-50 chars, unique | `"sponsor-001"` |
| `name` | string | ✅ Yes | 1-100 characters | `"MB Automation Victoria"` |
| `logo` | string | ✅ Yes | Valid file path or URL; WebP or PNG extension | `"/images/sponsors/mb-auto-logo.png"` |
| `link` | string \| null | ❌ No | Valid HTTP/HTTPS URL or null | `"https://facebook.com/mb.automation.vic"` or `null` |
| `joinedDate` | string | ✅ Yes | ISO 8601 date (YYYY-MM-DD) | `"2026-04-15"` |

### Configuration Field Specifications

| Field | Type | Default | Validation | Example |
|-------|------|---------|-----------|---------|
| `sponsorCountThreshold` | number | `6` | Positive integer, 1-20 | `6` |
| `ctaLink` | string | `"/get-involved"` | Relative or absolute path | `"/get-involved"` |

---

## Validation Rules

### Required Field Validation

```typescript
// All required fields must be present and non-empty
function validateRequiredFields(sponsor: unknown): boolean {
  if (!sponsor || typeof sponsor !== 'object') return false;
  
  const s = sponsor as Record<string, unknown>;
  
  // Check required fields exist and are non-empty
  if (!s.id || typeof s.id !== 'string' || !s.id.trim()) return false;
  if (!s.name || typeof s.name !== 'string' || !s.name.trim()) return false;
  if (!s.logo || typeof s.logo !== 'string' || !s.logo.trim()) return false;
  if (!s.joinedDate || typeof s.joinedDate !== 'string') return false;
  
  return true;
}
```

### Field-Level Validation Rules

#### `id` Validation
```typescript
function validateSponsorId(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  if (id.length < 1 || id.length > 50) return false;
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) return false; // alphanumeric, underscore, dash only
  return true;
}
```

**Rules**:
- Type: string
- Min length: 1
- Max length: 50
- Pattern: `[a-zA-Z0-9_-]+` (alphanumeric, underscore, dash; no spaces)
- Uniqueness: Must be unique within sponsors array

#### `name` Validation
```typescript
function validateSponsorName(name: unknown): name is string {
  if (typeof name !== 'string') return false;
  if (name.length < 1 || name.length > 100) return false;
  return true;
}
```

**Rules**:
- Type: string
- Min length: 1
- Max length: 100
- Allowed characters: Any (including spaces, punctuation)
- Trimmed on display (leading/trailing whitespace removed)

#### `logo` Validation
```typescript
function validateLogoPath(logo: unknown): logo is string {
  if (typeof logo !== 'string') return false;
  if (logo.length < 1) return false;
  
  // Check file extension
  const ext = logo.toLowerCase().split('.').pop();
  if (!['png', 'webp'].includes(ext)) return false;
  
  // Check if valid URL or relative path
  if (logo.startsWith('http://') || logo.startsWith('https://')) {
    return isValidUrl(logo);
  }
  
  // Check if valid relative path
  return logo.startsWith('/') && !logo.includes(' ');
}
```

**Rules**:
- Type: string
- Min length: 1
- File extension: `.png` or `.webp` (case-insensitive)
- Format: Either absolute URL (`http://...`, `https://...`) or relative path (`/images/...`)
- No spaces in path
- Valid URL format if HTTP/HTTPS

#### `link` Validation
```typescript
function validateSponsorLink(link: unknown): link is string | null {
  if (link === null || link === undefined) return true; // Optional field
  if (typeof link !== 'string') return false;
  if (link.length === 0) return true; // Empty string treated as null
  
  // Must be valid URL if present
  return isValidUrl(link);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
}
```

**Rules**:
- Type: string (URL) or null
- Optional: Can be null, undefined, or empty string (all treated as "no link")
- Format: Valid HTTP or HTTPS URL if present
- Must start with `http://` or `https://`
- No relative paths allowed (external links only)

#### `joinedDate` Validation
```typescript
function validateJoinedDate(date: unknown): date is string {
  if (typeof date !== 'string') return false;
  
  // ISO 8601 format: YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  
  // Check if valid date
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;
  
  // Can't be in future
  if (d > new Date()) return false;
  
  return true;
}
```

**Rules**:
- Type: string
- Format: ISO 8601 (`YYYY-MM-DD`)
- Must be valid date (e.g., no `2026-02-30`)
- Must not be in the future

#### Configuration Field Validation
```typescript
function validateThreshold(threshold: unknown): number {
  if (typeof threshold === 'number' && threshold > 0 && threshold < 20) {
    return threshold;
  }
  return 6; // Default
}

function validateCtaLink(link: unknown): string {
  if (typeof link === 'string' && (link.startsWith('/') || link.startsWith('http'))) {
    return link;
  }
  return '/get-involved'; // Default
}
```

**Threshold Rules**:
- Type: number
- Min: 1
- Max: 20
- Default: 6 (if invalid or missing)

**CTA Link Rules**:
- Type: string
- Format: Relative path (e.g., `/get-involved`) or absolute URL
- Default: `/get-involved` (if invalid or missing)

---

## Complete Sponsor Validation

```typescript
interface Sponsor {
  id: string;
  name: string;
  logo: string;
  link?: string | null;
  joinedDate: string;
}

function validateSponsor(data: unknown): sponsor is Sponsor {
  if (!data || typeof data !== 'object') {
    console.warn('Sponsor data is not an object:', data);
    return false;
  }
  
  const s = data as Record<string, unknown>;
  
  // Validate required fields
  if (!validateSponsorId(s.id)) {
    console.warn('Invalid sponsor ID:', s.id);
    return false;
  }
  
  if (!validateSponsorName(s.name)) {
    console.warn('Invalid sponsor name:', s.name);
    return false;
  }
  
  if (!validateLogoPath(s.logo)) {
    console.warn('Invalid logo path:', s.logo);
    return false;
  }
  
  if (!validateJoinedDate(s.joinedDate)) {
    console.warn('Invalid joinedDate:', s.joinedDate);
    return false;
  }
  
  // Validate optional link
  if (s.link && !validateSponsorLink(s.link)) {
    console.warn('Invalid sponsor link:', s.link);
    return false;
  }
  
  return true;
}

function loadAndValidateConfig(json: unknown): {
  sponsors: Sponsor[];
  threshold: number;
  ctaLink: string;
} {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid configuration: not an object');
  }
  
  const config = json as Record<string, unknown>;
  
  if (!Array.isArray(config.sponsors)) {
    throw new Error('Invalid configuration: sponsors must be an array');
  }
  
  const validSponsors = config.sponsors.filter(validateSponsor);
  
  if (validSponsors.length === 0 && config.sponsors.length > 0) {
    console.warn(`No valid sponsors found (${config.sponsors.length} invalid)`);
  }
  
  return {
    sponsors: validSponsors,
    threshold: validateThreshold(config.sponsorCountThreshold),
    ctaLink: validateCtaLink(config.ctaLink),
  };
}
```

---

## Example: Valid Configuration

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
      "name": "Local Business Co.",
      "logo": "/images/sponsors/local-business-logo.webp",
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

## Example: Invalid Data & Handling

### Invalid: Missing Required Field

**Input**:
```json
{
  "id": "sponsor-001",
  "name": "Sponsor Name"
  // Missing: logo, joinedDate
}
```

**Handling**:
```
⚠️  WARN: Invalid sponsor ID: sponsor-001 (missing logo)
⚠️  WARN: Invalid sponsor ID: sponsor-001 (missing joinedDate)
→  Sponsor skipped; warning logged
```

### Invalid: Bad Logo Path

**Input**:
```json
{
  "id": "sponsor-001",
  "name": "Test Sponsor",
  "logo": "invalid-logo.jpg",  // .jpg not allowed
  "joinedDate": "2026-04-15"
}
```

**Handling**:
```
⚠️  WARN: Invalid logo path: invalid-logo.jpg
→  Sponsor skipped; warning logged
```

### Invalid: Bad URL

**Input**:
```json
{
  "id": "sponsor-001",
  "name": "Test Sponsor",
  "logo": "/images/sponsors/logo.png",
  "link": "facebook.com/test",  // Missing https://
  "joinedDate": "2026-04-15"
}
```

**Handling**:
```
⚠️  WARN: Invalid sponsor link: facebook.com/test
→  Sponsor rendered without link; image is static (not clickable)
```

### Invalid: Future Date

**Input**:
```json
{
  "id": "sponsor-001",
  "name": "Test Sponsor",
  "logo": "/images/sponsors/logo.png",
  "joinedDate": "2099-12-31"  // Future date
}
```

**Handling**:
```
⚠️  WARN: Invalid joinedDate: 2099-12-31 (future date)
→  Sponsor skipped; warning logged
```

### Invalid: Duplicate ID

**Input**:
```json
{
  "sponsors": [
    {
      "id": "sponsor-001",
      "name": "Sponsor A",
      "logo": "/images/sponsors/logo-a.png",
      "joinedDate": "2026-04-15"
    },
    {
      "id": "sponsor-001",  // DUPLICATE ID
      "name": "Sponsor B",
      "logo": "/images/sponsors/logo-b.png",
      "joinedDate": "2026-04-20"
    }
  ]
}
```

**Handling**:
```
⚠️  WARN: Duplicate sponsor ID: sponsor-001
→  Both sponsors included (no deduplication); warning logged
→  Component should track/alert developer
```

---

## Error Handling Specifications

### Validation Errors

| Error Type | Handling | User Impact | Developer Action |
|-----------|----------|-------------|------------------|
| **Missing required field** | Sponsor skipped; console warn | Sponsor not displayed | Review `sponsors.json` for missing field |
| **Invalid field type** | Sponsor skipped; console warn | Sponsor not displayed | Fix field type in JSON |
| **Invalid format** (bad URL, bad date) | Sponsor skipped; console warn | Sponsor not displayed | Fix value format in JSON |
| **Bad logo path** | Sponsor skipped; console warn | Sponsor not displayed | Fix path; ensure file exists |
| **Future date** | Sponsor skipped; console warn | Sponsor not displayed | Use past or current date |
| **Duplicate ID** | Both included; console warn | Confusing state | Ensure all IDs unique |
| **Empty sponsors array** | CTA card only; no warn | Shows "Become a Sponsor" CTA | Expected state; waiting for sponsors |
| **Invalid config object** | Load fails; error thrown | Page shows error banner | Fix root JSON structure |

### Image Load Errors

| Error | Handling | User Impact | Resolution |
|-------|----------|-------------|-----------|
| **Broken image URL (404)** | Placeholder displayed (gray box + text) | Gray placeholder visible | Verify logo file exists at path |
| **Network error during load** | Lazy load deferred; placeholder shown | Blurred/missing image initially | User can wait or refresh |
| **Unsupported format** | Browser shows broken image | Image not displayed | Use PNG or WebP format |

### Link Errors

| Error | Handling | User Impact | Resolution |
|-------|----------|-------------|-----------|
| **Missing link (null)** | Image is static (not clickable) | Cannot click sponsor logo | Optional per spec; not error |
| **Invalid URL** | Image is static (not clickable) | Cannot click sponsor logo | Provide valid HTTP/HTTPS URL |
| **Malformed URL** | Image is static (not clickable) | Cannot click sponsor logo | Fix URL format |

---

## Runtime Assertions

The following assertions should hold at runtime:

1. **Uniqueness**: All sponsor `id` values are unique
2. **Completeness**: All required fields are present and non-empty
3. **Type Safety**: All fields match expected types
4. **Format Validity**: All URLs, paths, and dates match expected formats
5. **Threshold Range**: `sponsorCountThreshold` is positive integer in range 1-20
6. **Array Length**: Sponsors array can be empty (valid state) but not undefined

---

## Backward Compatibility

If sponsor schema is extended in the future (e.g., adding `tier`, `website`, `description`):

1. **New Optional Fields**: Can be added without breaking existing configs
2. **Field Removals**: Not recommended; instead deprecate and ignore
3. **Type Changes**: Require migration; document in changelog

**Example Extension**:
```typescript
interface SponsorExtended extends Sponsor {
  tier?: 'platinum' | 'gold' | 'silver';  // New optional field
  website?: string;                        // New optional field
  // Backward compatible: existing configs still work
}
```

---

## Testing Validation Contract

### Valid Test Data

```typescript
const validSponsors = [
  {
    id: 'test-001',
    name: 'Test Sponsor',
    logo: '/images/sponsors/test.png',
    link: 'https://example.com',
    joinedDate: '2026-04-15',
  },
  {
    id: 'test-002',
    name: 'No Link Sponsor',
    logo: '/images/sponsors/test2.webp',
    link: null,  // Optional link
    joinedDate: '2026-04-20',
  },
];

const validConfig = {
  sponsors: validSponsors,
  sponsorCountThreshold: 6,
  ctaLink: '/get-involved',
};
```

### Invalid Test Data

```typescript
const invalidSponsors = [
  {
    id: 'test-001',
    name: 'Missing Logo',
    // Missing logo field
    joinedDate: '2026-04-15',
  },
  {
    id: 'test-002',
    name: 'Bad URL',
    logo: '/images/sponsors/test.png',
    link: 'not-a-url',  // Invalid format
    joinedDate: '2026-04-15',
  },
  {
    id: 'test-003',
    name: 'Future Date',
    logo: '/images/sponsors/test.png',
    joinedDate: '2099-12-31',  // Future date
  },
];
```

---

## Contract Version

**Version**: 1.0  
**Last Updated**: 2026-04-18  
**Status**: ✅ Approved for Implementation

This contract is frozen for COA-58 MVP. Future extensions (e.g., CMS integration, sponsor tiers) will define new contracts.

---

**Contract Ready for Implementation**: All validation rules defined, test data prepared, error handling specified.
