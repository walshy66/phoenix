# Data Model: Position Responsibilities Carousel

**Feature**: COA-88 — Add Position Responsibilities Carousel  
**Date**: 2026-04-25

---

## Overview

The Position Responsibilities feature uses **static, frontend-only data**. No database schema changes or API endpoints are required.

Position data is defined as a TypeScript constant and imported by components. The carousel renders this data without mutations or server-side validation.

---

## Data Structure

### PositionImage Interface

```typescript
// src/lib/position-data.ts

export interface PositionImage {
  /**
   * Unique identifier for the position.
   * Used as data-index and carousel slide id.
   */
  id: string;

  /**
   * User-facing label displayed below the image.
   * Example: "Point Guard", "Center", "Coach"
   */
  label: string;

  /**
   * Screen reader and fallback text.
   * Describes the position responsibilities and key skills.
   */
  alt: string;

  /**
   * Public URL path to the image file.
   * Resolved relative to /public/ at runtime.
   * Example: "/images/positions/roles-point-guard.png"
   */
  src: string;
}
```

---

## Position Data

### POSITION_IMAGES Array

```typescript
export const POSITION_IMAGES: PositionImage[] = [
  {
    id: 'point-guard',
    label: 'Point Guard',
    alt: 'Point Guard: Controls the game, initiates offense, excellent ball-handling and court vision, primary playmaker.',
    src: '/images/positions/roles-point-guard.png',
  },
  {
    id: 'shooting-guard',
    label: 'Shooting Guard',
    alt: 'Shooting Guard: Reliable shooter, strong off-ball movement, excellent 3-point range, defensive versatility.',
    src: '/images/positions/roles-shooting-guard.png',
  },
  {
    id: 'small-forward',
    label: 'Small Forward',
    alt: 'Small Forward: Versatile player, strong on both ends, can shoot mid-range and 3-pointers, athletic defender.',
    src: '/images/positions/roles-small-forward.png',
  },
  {
    id: 'power-forward',
    label: 'Power Forward',
    alt: 'Power Forward: Paint presence, strong rebounder, low-post scorer, physical defender, pick-and-pop game.',
    src: '/images/positions/roles-power-forward.png',
  },
  {
    id: 'center',
    label: 'Center',
    alt: 'Center: Dominant in the paint, shot-blocker, rebounder, sets screens, protects rim on defense.',
    src: '/images/positions/roles-center.png',
  },
  {
    id: 'coach',
    label: 'Coach',
    alt: 'Coach: Game strategy, player development, team leadership, training fundamentals, tactical adjustments.',
    src: '/images/positions/roles-coach.png',
  },
];
```

### Data Invariants

- **Order**: Exactly 6 positions in this fixed order (Point Guard → Shooting Guard → Small Forward → Power Forward → Center → Coach)
- **Uniqueness**: Each `id` is unique and stable
- **URL Validity**: Each `src` maps to an actual file in `/public/images/positions/`
- **Accessibility**: Each `alt` text is descriptive and at least 50 characters

---

## Data Flow

### Import & Usage

```typescript
// In PositionResponsibilitiesCarousel.astro
import { POSITION_IMAGES, type PositionImage } from '../lib/position-data';

// Map to carousel slides (no mutations)
const slides = POSITION_IMAGES.map((pos, index) => ({
  id: pos.id,
  index: index,
  label: pos.label,
  image: pos.src,
  alt: pos.alt,
}));
```

### State Derivation

Carousel component derives state from position data:

```
POSITION_IMAGES (static)
        ↓
   slides array (immutable, derived)
        ↓
   currentIndex (reactive state: 0–5)
        ↓
   currentSlide (derived: slides[currentIndex])
        ↓
   view renders with currentSlide data
```

**No mutations** of POSITION_IMAGES occur at any point.

---

## Asset Directory

### Location & Structure

```
/public/images/positions/
├── roles-point-guard.png
├── roles-shooting-guard.png
├── roles-small-forward.png
├── roles-power-forward.png
├── roles-center.png
└── roles-coach.png
```

### Image Specifications

| Property | Value | Notes |
|----------|-------|-------|
| **Format** | PNG | Supports transparency for design flexibility |
| **Dimensions** | 600×800px (min: 400×500px) | Portrait orientation (3:4 aspect ratio) |
| **Compression** | Optimized (< 200KB each) | Use ImageOptim, PNGQuant, or similar |
| **Background** | Transparent preferred | Allows flexibility in future styling |
| **DPI** | 72 DPI (web standard) | No need for print resolution |
| **Color Space** | sRGB | Standard web color space |

### Asset Delivery

Images must be provided before implementation begins. They should be placed in the directory structure above before running the feature build.

**Total Assets**: 6 PNG files, approximately 1.2 MB total (uncompressed)

---

## Future Extensibility

### If Position Data Becomes Dynamic

If positions are later sourced from an API:

1. Create API endpoint: `GET /api/positions` returning array of PositionImage
2. Fetch in page component: `const positions = await fetch('/api/positions').json()`
3. Pass to carousel component: `<PositionResponsibilitiesCarousel positions={positions} />`
4. Carousel remains unchanged (receives props instead of imports)

Example change to carousel:

```typescript
interface Props {
  positions?: PositionImage[];  // Optional; falls back to static data
}

const { positions = POSITION_IMAGES } = Astro.props;
```

### If Position Data Needs Versioning

If audit trail or versioning is needed:

1. Add `version: string` field to PositionImage
2. Track in Git history (position-data.ts changes)
3. No database needed; Git becomes the audit trail

---

## Validation & Error Handling

### Build-Time Validation

Add a type guard to ensure data integrity:

```typescript
// src/lib/position-data.ts

export function validatePositionData(data: PositionImage[]): boolean {
  // Must have exactly 6 positions
  if (data.length !== 6) {
    console.error(`Expected 6 positions, got ${data.length}`);
    return false;
  }

  // Each position must have required fields
  return data.every((pos) => {
    if (!pos.id || !pos.label || !pos.alt || !pos.src) {
      console.error(`Invalid position data:`, pos);
      return false;
    }
    if (pos.alt.length < 50) {
      console.warn(`Position ${pos.id} alt text is short:`, pos.alt);
    }
    return true;
  });
}

// Validate on import
if (!validatePositionData(POSITION_IMAGES)) {
  throw new Error('Position data validation failed');
}
```

### Runtime Image Load Errors

Carousel component handles image load failures gracefully:

```typescript
<img
  src={position.src}
  alt={position.alt}
  onError={(e) => {
    // Fallback message
    console.warn(`Image failed to load: ${position.src}`);
    // Modal remains dismissible
  }}
/>
```

---

## No Schema Changes Required

This feature does NOT modify:
- Database schema (no Prisma changes)
- API contracts (no new endpoints)
- User models (no new fields)
- Existing tables or migrations

All data is **frontend-only and static**.

---

## Data Consistency

Position data is **immutable by design**:
- Defined as `const POSITION_IMAGES`
- Passed as props (no mutation)
- State is carousel index only (ephemeral)
- No persistence needed

If data needs to change, code redeploy is required (Git → deploy → new build).

---

## Testing Considerations

### Unit Tests

Test data structure and invariants:

```typescript
test('POSITION_IMAGES has exactly 6 items', () => {
  expect(POSITION_IMAGES).toHaveLength(6);
});

test('each position has required fields', () => {
  POSITION_IMAGES.forEach((pos) => {
    expect(pos).toHaveProperty('id');
    expect(pos).toHaveProperty('label');
    expect(pos).toHaveProperty('alt');
    expect(pos).toHaveProperty('src');
  });
});

test('all position IDs are unique', () => {
  const ids = POSITION_IMAGES.map((p) => p.id);
  expect(new Set(ids)).toHaveSize(6);
});

test('all image sources start with /images/positions/', () => {
  POSITION_IMAGES.forEach((pos) => {
    expect(pos.src).toMatch(/^\/images\/positions\//);
  });
});
```

### Integration Tests

Test carousel rendering with real data:

```typescript
test('carousel renders all 6 position slides', async () => {
  // Mount carousel with POSITION_IMAGES
  // Assert DOM has 6 carousel-slide elements
  // Assert each slide has correct image src
});
```

---

## Migration & Rollback

**No migrations needed**: This feature adds no database changes.

**Rollback**: Simply remove component files and revert carousel-resources.astro changes.

---

## Summary

| Aspect | Value |
|--------|-------|
| **Data Type** | Static TypeScript constant |
| **Location** | `/src/lib/position-data.ts` |
| **Mutability** | Immutable |
| **Persistence** | None (frontend-only) |
| **Schema Changes** | None |
| **API Endpoints** | None |
| **Asset Count** | 6 PNG images |
| **Total Payload** | ~1.2 MB (images + code) |
| **Update Mechanism** | Code redeploy (Git) |

---

**Prepared by**: Claude Code Plan Agent  
**Date**: 2026-04-25
