# Data Model: Seasons Page (COA-24)

**Date**: 2026-04-11  
**Status**: FRONTEND FOCUSED (no database migrations required for MVP)

---

## Overview

The Seasons feature operates on three main entities:
1. **Season** — Competitive period with metadata and role (current/next/previous/archive)
2. **KeyDate** — Important milestone within a season (registration opens, grading, etc.)
3. **RegistrationCost** — Pricing tier for a season (age group, category, amount)

For MVP, all data is **hardcoded in frontend** (`src/lib/seasons/constants.ts`). Once PlayHQ API is available, data will be fetched from backend endpoint (to be defined in Phase 8).

---

## TypeScript Types

### Season Entity

```typescript
interface Season {
  id: string                          // Unique identifier (from PlayHQ or internal UUID)
  name: string                        // Human-readable: "Winter 2026", "Summer 2025/26"
  startDate: string                   // ISO 8601: "2026-06-01"
  endDate: string                     // ISO 8601: "2026-09-30"
  role: SeasonRole                    // 'current' | 'next' | 'previous' | 'archive'
  status: SeasonStatus                // 'active' | 'coming_soon' | 'completed'
  description?: string                // Optional: brief season description
  keyDates?: KeyDate[]                // Related key dates (optional array)
  registrationCosts?: RegistrationCost[]  // Related registration costs (optional array)
}

type SeasonRole = 'current' | 'next' | 'previous' | 'archive'
type SeasonStatus = 'active' | 'coming_soon' | 'completed'
```

**Invariants**:
- `id` must be unique across all seasons
- `startDate` must be <= `endDate`
- `role` must be pre-computed by backend (client MUST NOT calculate)
- `status` typically matches role: `current` → `active`, `next` → `coming_soon`, `previous` → `completed`
- At most 1 season with `role: 'current'` in a given response
- At most 1 season with `role: 'next'` in a given response
- At most 1 season with `role: 'previous'` in a given response
- Archive seasons count: 0 if < 2 distinct calendar years, N if >= 2 years

---

### KeyDate Entity

```typescript
interface KeyDate {
  id?: string                     // Optional identifier
  label: string                   // "Registration Opens", "Grading Sessions", "Season Starts", "Finals"
  date: string                    // ISO 8601: "2026-07-15"
  description?: string            // Optional: "Grading sessions at City Court, 7–9 PM"
  seasonId?: string               // Optional: reference back to Season
}
```

**Invariants**:
- `label` should be one of predefined types (or custom)
- `date` must be valid ISO 8601 date or datetime
- `description` is optional; may be null or undefined
- Multiple KeyDate records may share same `label` (e.g., multiple grading sessions on different dates)

**Empty State**:
- If `keyDates` array is empty or missing, display: "No scheduled dates announced yet"
- Client MUST NOT hide the Key Dates card; always show card with placeholder text

---

### RegistrationCost Entity

```typescript
interface RegistrationCost {
  id?: string                     // Optional identifier
  category: string                // "U8–U10", "U12–U14", "Senior Men", "Late Registration", etc.
  cost: number                    // AUD amount as decimal: 150.00, 200.50
  description?: string            // Optional: "Includes 4 games", "After July 1"
  seasonId?: string               // Optional: reference back to Season
}
```

**Invariants**:
- `category` should be descriptive and user-facing
- `cost` must be numeric (no currency symbols in data)
- `cost` should include cents (e.g., 150.00, not 150)
- `description` is optional; used for notes/qualifications
- Multiple RegistrationCost records may exist per season (multiple age groups/tiers)

**Empty State**:
- If `registrationCosts` array is empty or missing, display: "Registration pricing to be confirmed"
- Client MUST NOT hide the Registration Costs card; always show card with placeholder text

---

## MVP Hardcoded Data (src/lib/seasons/constants.ts)

```typescript
export const SEASONS_MOCK: Season[] = [
  {
    id: 'season-winter-2026',
    name: 'Winter 2026',
    startDate: '2026-06-01',
    endDate: '2026-09-30',
    role: 'current',
    status: 'active',
    description: 'Winter competitive season with grading and finals',
    keyDates: [
      {
        id: 'kd-1',
        label: 'Registration Opens',
        date: '2026-05-01',
        description: 'Online registration now open'
      },
      {
        id: 'kd-2',
        label: 'Grading Sessions',
        date: '2026-05-20',
        description: 'Mandatory grading at City Court'
      },
      {
        id: 'kd-3',
        label: 'Season Starts',
        date: '2026-06-01'
      },
      {
        id: 'kd-4',
        label: 'Finals',
        date: '2026-09-25'
      }
    ],
    registrationCosts: [
      {
        id: 'rc-1',
        category: 'U8–U10',
        cost: 120.00,
        description: 'Includes 8 games + grading'
      },
      {
        id: 'rc-2',
        category: 'U12–U14',
        cost: 150.00,
        description: 'Includes 10 games + grading'
      },
      {
        id: 'rc-3',
        category: 'Senior (Men & Women)',
        cost: 180.00,
        description: 'Includes 12 games'
      },
      {
        id: 'rc-4',
        category: 'Late Registration (after July 1)',
        cost: 200.00,
        description: 'Subject to team availability'
      }
    ]
  },

  {
    id: 'season-spring-2026',
    name: 'Spring 2026',
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    role: 'next',
    status: 'coming_soon',
    description: 'Spring competitive season (coming soon)',
    keyDates: [],  // Placeholder: no dates yet
    registrationCosts: []  // Placeholder: no costs yet
  },

  {
    id: 'season-summer-2025-26',
    name: 'Summer 2025/26',
    startDate: '2025-12-01',
    endDate: '2026-02-28',
    role: 'previous',
    status: 'completed',
    description: 'Previous summer season (for reference)',
    keyDates: [
      {
        id: 'kd-5',
        label: 'Registration Opened',
        date: '2025-11-01'
      },
      {
        id: 'kd-6',
        label: 'Season Started',
        date: '2025-12-01'
      },
      {
        id: 'kd-7',
        label: 'Finals',
        date: '2026-02-25'
      }
    ],
    registrationCosts: [
      {
        id: 'rc-5',
        category: 'U8–U10',
        cost: 120.00
      },
      {
        id: 'rc-6',
        category: 'U12–U14',
        cost: 150.00
      },
      {
        id: 'rc-7',
        category: 'Senior (Men & Women)',
        cost: 180.00
      }
    ]
  }

  // Note: No Archive season (only 1 distinct year: 2026)
]
```

---

## Future: Backend API Schema

### GET /api/seasons → Season[]

**Response Shape** (to be finalized with backend team):

```typescript
interface GetSeasonsResponse {
  seasons: Season[]
  meta: {
    fetched: string                   // ISO timestamp when data fetched
    cacheExpiry?: string              // Optional: when cache expires
    playHqLastSync?: string           // Optional: last PlayHQ sync time
  }
}
```

**Response Example**:
```json
{
  "seasons": [
    {
      "id": "phq-season-123",
      "name": "Winter 2026",
      "startDate": "2026-06-01",
      "endDate": "2026-09-30",
      "role": "current",
      "status": "active",
      "keyDates": [
        {
          "label": "Registration Opens",
          "date": "2026-05-01",
          "description": "Online registration now open"
        }
      ],
      "registrationCosts": [
        {
          "category": "U8–U10",
          "cost": 120.00,
          "description": "Includes 8 games + grading"
        }
      ]
    }
  ],
  "meta": {
    "fetched": "2026-04-11T14:30:00Z",
    "cacheExpiry": "2026-04-12T14:30:00Z",
    "playHqLastSync": "2026-04-11T12:00:00Z"
  }
}
```

---

## Data Flow (MVP)

```
src/pages/seasons.astro
  │
  ├─ import SEASONS_MOCK from src/lib/seasons/constants.ts
  │
  ├─ Render season tiles (map over SEASONS_MOCK)
  │  │
  │  ├─ SeasonTile component (props: { season, onClick })
  │  │  └─ Displays: name, emoji, status badge
  │  │
  │  └─ On click: open detail modal
  │
  ├─ Render detail modal (state: isOpen, selectedSeason)
  │  │
  │  ├─ SeasonDetailModal (props: { season, isOpen, onClose })
  │  │  │
  │  │  ├─ RegistrationCostsCard (props: { registrationCosts })
  │  │  │  └─ If empty: show "Registration pricing to be confirmed"
  │  │  │
  │  │  └─ KeyDatesSection (props: { keyDates })
  │  │     └─ If empty: show "No scheduled dates announced yet"
  │  │
  │  └─ On close: clear selectedSeason, return focus
  │
  └─ Client-side JavaScript: handle modal state, keyboard (Escape, Enter, Tab)
```

---

## Data Flow (Future: PlayHQ API)

```
src/pages/seasons.astro (with async fetch)
  │
  ├─ Fetch GET /api/seasons (backend endpoint)
  │  │
  │  ├─ On success: cache response, use SEASONS_MOCK as fallback
  │  │
  │  └─ On error (5xx, timeout):
  │     └─ Show error banner: "Season details are temporarily unavailable; check back soon"
  │        Log error to observability: { code, timestamp, field }
  │
  ├─ Transform API response to Season[] (maintain type safety)
  │
  └─ Render components as above (identical to MVP data flow)
```

---

## Validation & Constraints

### Frontend Validation (Client-Side)

```typescript
// Type guards for empty/invalid data
function isSeasonValid(season: Season): boolean {
  return !!(
    season.id &&
    season.name &&
    season.startDate &&
    season.endDate &&
    season.role &&
    season.status
  )
}

function hasKeyDates(season: Season): boolean {
  return Array.isArray(season.keyDates) && season.keyDates.length > 0
}

function hasRegistrationCosts(season: Season): boolean {
  return Array.isArray(season.registrationCosts) && season.registrationCosts.length > 0
}

// Render helpers
export function formatDate(isoDate: string): string {
  // Convert ISO date to readable format: "June 1, 2026"
  // Handles null/undefined gracefully
  if (!isoDate) return 'Date TBA'
  const date = new Date(isoDate)
  return date.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatCost(cost?: number): string {
  // Format AUD currency: 150.00 → "$150.00"
  if (cost === undefined || cost === null) return 'TBA'
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD'
  }).format(cost)
}
```

### Empty State Rules

| Entity | Empty State | Message |
|--------|-------------|---------|
| KeyDate | Array is empty or missing | "No scheduled dates announced yet" |
| RegistrationCost | Array is empty or missing | "Registration pricing to be confirmed" |
| Season.name | Null or empty string | Don't render tile (invalid season) |
| Season.startDate | Missing | Use "Date TBA" in key dates |
| Season.endDate | Missing | Use "Date TBA" in key dates |
| Registration cost | 0 or null | "Free" or "TBA" (depends on PlayHQ contract) |

---

## Database Considerations (Future)

When PlayHQ API integration is complete, consider backend database schema:

```prisma
model Season {
  id String @id @default(cuid())
  
  // From PlayHQ
  playHqId String? @unique
  name String
  startDate DateTime
  endDate DateTime
  
  // Server-computed
  role String // 'current' | 'next' | 'previous' | 'archive'
  status String // 'active' | 'coming_soon' | 'completed'
  
  // Relations
  keyDates KeyDate[]
  registrationCosts RegistrationCost[]
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  syncedAt DateTime? // Last sync with PlayHQ
}

model KeyDate {
  id String @id @default(cuid())
  
  seasonId String
  season Season @relation(fields: [seasonId], references: [id], onDelete: Cascade)
  
  label String
  date DateTime
  description String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model RegistrationCost {
  id String @id @default(cuid())
  
  seasonId String
  season Season @relation(fields: [seasonId], references: [id], onDelete: Cascade)
  
  category String
  cost Decimal // Use Decimal for money, not Float
  description String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## Migration Strategy (Future)

When adding backend database:
1. Create Prisma schema as above
2. Generate migration: `npx prisma migrate dev --name add_seasons`
3. Seed with hardcoded data initially
4. Once PlayHQ API available, replace seed with API sync logic
5. No data loss expected (fresh schema)

---

## Caching & Invalidation (Future)

Once API integration complete:
- Cache season data with TTL of 1 hour
- Invalidate cache on:
  - User manual refresh (browser refresh button)
  - Scheduled background sync (every 30 minutes)
  - Admin updates to season data (via webhook if PlayHQ supports)
- Stale-while-revalidate strategy: serve cache while fetching fresh data in background

---

## Archive Logic (Future: Phase 8)

Archive seasons are determined by backend logic:

```typescript
// Backend logic (pseudo-code)
function getArchiveSeasons(allSeasons: Season[]): Season[] {
  // Count distinct calendar years
  const years = new Set(
    allSeasons.map(s => new Date(s.startDate).getFullYear())
  )
  
  // Include archive only if 2+ distinct years
  if (years.size < 2) return []
  
  // Return all seasons except current/next/previous
  return allSeasons.filter(s => s.role === 'archive')
}

// Client logic (Astro)
function shouldRenderArchiveTile(seasons: Season[]): boolean {
  // Archive tile rendered only if at least one archive season in response
  return seasons.some(s => s.role === 'archive')
}
```

---

## Error Logging

All data fetch errors must be logged with structured information:

```typescript
// Error logging example
interface DataError {
  timestamp: string          // ISO 8601
  code: string               // 'FETCH_ERROR', 'PARSE_ERROR', 'INVALID_DATA'
  field?: string             // 'registrationCosts', 'keyDates', etc.
  statusCode?: number        // HTTP status if applicable
  message: string            // User-facing message
  details?: unknown          // Raw error for debugging
}

// Usage
console.error('Seasons data error:', {
  timestamp: new Date().toISOString(),
  code: 'FETCH_ERROR',
  statusCode: 500,
  message: 'Season details are temporarily unavailable; check back soon',
  details: error
})
```

---

## Summary

- **MVP**: Hardcoded data, all types defined, no database changes
- **Phase 8**: Finalize PlayHQ API contract, define backend endpoint
- **Post-MVP**: Implement backend database schema, cache strategy, archive logic
- **Key Rule**: Backend MUST compute season `role`; client MUST NOT infer from dates
- **Empty States**: Always show card with placeholder text; never hide or leave blank
