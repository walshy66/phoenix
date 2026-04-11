# API Contracts: Seasons Page (COA-24)

**Date**: 2026-04-11  
**Status**: PLACEHOLDER (awaiting PlayHQ API key and documentation)

---

## Overview

This document defines the expected API contracts for the Seasons feature, including:
- Backend endpoint for season data
- PlayHQ API data shapes (once available)
- Error response formats
- Caching and retry strategy

---

## Backend Endpoint: GET /api/seasons

**Purpose**: Fetch all seasons (current, next, previous, archive) with pre-computed roles and related data.

### Request

```http
GET /api/seasons
Authorization: (none required — public data)
Content-Type: application/json
```

### Success Response: 200 OK

```json
{
  "seasons": [
    {
      "id": "season-winter-2026",
      "name": "Winter 2026",
      "startDate": "2026-06-01T00:00:00Z",
      "endDate": "2026-09-30T23:59:59Z",
      "role": "current",
      "status": "active",
      "description": "Winter competitive season with grading and finals",
      "keyDates": [
        {
          "id": "kd-1",
          "label": "Registration Opens",
          "date": "2026-05-01T00:00:00Z",
          "description": "Online registration now open"
        },
        {
          "id": "kd-2",
          "label": "Grading Sessions",
          "date": "2026-05-20T19:00:00Z",
          "description": "Mandatory grading at City Court, 7–9 PM"
        },
        {
          "id": "kd-3",
          "label": "Season Starts",
          "date": "2026-06-01T00:00:00Z",
          "description": null
        },
        {
          "id": "kd-4",
          "label": "Finals",
          "date": "2026-09-25T00:00:00Z",
          "description": null
        }
      ],
      "registrationCosts": [
        {
          "id": "rc-1",
          "category": "U8–U10",
          "cost": 120.00,
          "description": "Includes 8 games + grading"
        },
        {
          "id": "rc-2",
          "category": "U12–U14",
          "cost": 150.00,
          "description": "Includes 10 games + grading"
        },
        {
          "id": "rc-3",
          "category": "Senior (Men & Women)",
          "cost": 180.00,
          "description": "Includes 12 games"
        },
        {
          "id": "rc-4",
          "category": "Late Registration (after July 1)",
          "cost": 200.00,
          "description": "Subject to team availability"
        }
      ]
    },
    {
      "id": "season-spring-2026",
      "name": "Spring 2026",
      "startDate": "2026-10-01T00:00:00Z",
      "endDate": "2026-12-31T23:59:59Z",
      "role": "next",
      "status": "coming_soon",
      "description": "Spring competitive season (coming soon)",
      "keyDates": [],
      "registrationCosts": []
    },
    {
      "id": "season-summer-2025-26",
      "name": "Summer 2025/26",
      "startDate": "2025-12-01T00:00:00Z",
      "endDate": "2026-02-28T23:59:59Z",
      "role": "previous",
      "status": "completed",
      "description": "Previous summer season (for reference)",
      "keyDates": [
        {
          "id": "kd-5",
          "label": "Registration Opened",
          "date": "2025-11-01T00:00:00Z",
          "description": null
        },
        {
          "id": "kd-6",
          "label": "Season Started",
          "date": "2025-12-01T00:00:00Z",
          "description": null
        },
        {
          "id": "kd-7",
          "label": "Finals",
          "date": "2026-02-25T00:00:00Z",
          "description": null
        }
      ],
      "registrationCosts": [
        {
          "id": "rc-5",
          "category": "U8–U10",
          "cost": 120.00,
          "description": null
        },
        {
          "id": "rc-6",
          "category": "U12–U14",
          "cost": 150.00,
          "description": null
        },
        {
          "id": "rc-7",
          "category": "Senior (Men & Women)",
          "cost": 180.00,
          "description": null
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

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| seasons | Season[] | Yes | Array of season objects in order: current, next, previous, archive (if applicable) |
| meta.fetched | ISO8601 | Yes | Timestamp when this response was generated |
| meta.cacheExpiry | ISO8601 | No | Time when cached data expires |
| meta.playHqLastSync | ISO8601 | No | Last sync with PlayHQ API (if available) |

### Season Object Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier (UUID, snowflake, or PlayHQ ID) |
| name | string | Yes | Human-readable name (e.g., "Winter 2026") |
| startDate | ISO8601 | Yes | Season start datetime |
| endDate | ISO8601 | Yes | Season end datetime |
| role | enum | Yes | 'current' \| 'next' \| 'previous' \| 'archive' |
| status | enum | Yes | 'active' \| 'coming_soon' \| 'completed' |
| description | string | No | Optional description/context |
| keyDates | KeyDate[] | Yes | Array of key dates (may be empty) |
| registrationCosts | RegistrationCost[] | Yes | Array of registration costs (may be empty) |

### KeyDate Object Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | Unique identifier for key date |
| label | string | Yes | Short label (e.g., "Registration Opens", "Finals") |
| date | ISO8601 | Yes | Date/time of the event |
| description | string \| null | No | Optional additional context |

### RegistrationCost Object Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | Unique identifier for cost entry |
| category | string | Yes | Age group or tier name (e.g., "U8–U10", "Senior Men") |
| cost | number | Yes | AUD amount as decimal (e.g., 150.00) |
| description | string \| null | No | Optional notes (e.g., "Includes 8 games") |

---

## Error Responses

### 500 Internal Server Error

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred while fetching season data.",
    "details": "Database connection failed",
    "timestamp": "2026-04-11T14:30:00Z"
  }
}
```

**Client Handling**:
- Display error banner: "Season details are temporarily unavailable; check back soon"
- Log error with code, timestamp, and message
- Retry after user refreshes page

### 503 Service Unavailable

```json
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "The season service is temporarily unavailable. Please try again later.",
    "timestamp": "2026-04-11T14:30:00Z"
  }
}
```

**Client Handling**:
- Display error banner: "Season details are temporarily unavailable; check back soon"
- Suggest retry after 30 seconds
- Log error and availability window

### 400 Bad Request (Malformed Query)

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid query parameters",
    "details": "Parameter 'year' must be numeric",
    "timestamp": "2026-04-11T14:30:00Z"
  }
}
```

**Client Handling**:
- Log error (developer issue)
- Display generic error banner
- Do not retry

---

## PlayHQ API Integration (Future)

Once PlayHQ API key is available, the backend will need to transform PlayHQ data to the above schema.

### Expected PlayHQ Endpoints (Placeholder)

**Note**: These are guesses based on typical sports API patterns. Verify with actual PlayHQ documentation.

#### GET /graphql — Query Teams & Seasons

```graphql
query FetchSeasons {
  seasons(limit: 100) {
    id
    name
    startDate
    endDate
    teams {
      id
      name
      ageGroup
      registrationFee
      registrationDeadline
    }
  }
}
```

#### Transformation Logic (Pseudo-Code)

```typescript
// Pseudo-code for transforming PlayHQ data
function transformPlayHqSeasonsToLocal(
  playHqData: PlayHqSeasonResponse[]
): Season[] {
  const now = new Date()
  
  return playHqData.map(phqSeason => {
    const startDate = new Date(phqSeason.startDate)
    const endDate = new Date(phqSeason.endDate)
    
    // Backend MUST determine role (client cannot)
    let role: SeasonRole
    if (now >= startDate && now <= endDate) {
      role = 'current'
    } else if (startDate > now) {
      role = 'next'
    } else if (endDate < now) {
      // Check if archive (2+ distinct years)
      role = shouldCreateArchive(allSeasons) ? 'archive' : 'previous'
    } else {
      role = 'previous'
    }
    
    // Extract registration costs from teams
    const registrationCosts = [
      ...new Map(
        phqSeason.teams.map(team => [
          team.ageGroup,
          {
            id: `cost-${team.ageGroup}`,
            category: team.ageGroup,
            cost: team.registrationFee,
            description: null
          }
        ])
      ).values()
    ]
    
    return {
      id: phqSeason.id,
      name: phqSeason.name,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      role,
      status: role === 'next' ? 'coming_soon' : role === 'current' ? 'active' : 'completed',
      description: `${role.charAt(0).toUpperCase() + role.slice(1)} season`,
      keyDates: [],  // TODO: extract from PlayHQ or manage separately
      registrationCosts
    }
  })
}
```

---

## Caching Strategy

### HTTP Headers

```
Cache-Control: public, max-age=3600
ETag: "seasons-v1-2026-04-11-14-30"
Last-Modified: 2026-04-11T14:30:00Z
```

### Client Caching (Frontend)

```typescript
// Astro component example
const cacheKey = 'seasons-data'
const cacheTTL = 60 * 60 * 1000 // 1 hour

async function getSeasons(): Promise<Season[]> {
  // Try cache first
  const cached = localStorage.getItem(cacheKey)
  if (cached) {
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp < cacheTTL) {
      return data
    }
  }
  
  // Fetch fresh data
  const response = await fetch('/api/seasons')
  const { seasons } = await response.json()
  
  // Cache response
  localStorage.setItem(cacheKey, JSON.stringify({
    data: seasons,
    timestamp: Date.now()
  }))
  
  return seasons
}
```

### Invalidation Events

Cache should be invalidated when:
1. User manually refreshes page (Ctrl+F5)
2. TTL expires (1 hour)
3. Scheduled background sync (every 30 minutes)
4. Admin updates season data (via webhook, if available)

---

## Retry Logic

### Client Retry Strategy

```typescript
interface RetryConfig {
  maxRetries: number
  initialDelayMs: number
  backoffFactor: number
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  backoffFactor: 2
}

async function fetchWithRetry(
  url: string,
  config: RetryConfig = defaultRetryConfig
): Promise<Response> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, { timeout: 5000 })
      if (response.ok) return response
      
      // Don't retry 4xx errors (except 429)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      lastError = new Error(`HTTP ${response.status}`)
    } catch (error) {
      lastError = error as Error
      console.error(`Attempt ${attempt} failed:`, lastError.message)
    }
    
    // Exponential backoff before next retry
    if (attempt < config.maxRetries) {
      const delay = config.initialDelayMs * Math.pow(config.backoffFactor, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}
```

---

## Monitoring & Observability

### Server-Side Logging

All season data requests should be logged:

```typescript
// Backend logging example
logger.info('seasons.fetch', {
  timestamp: new Date().toISOString(),
  duration: fetchDurationMs,
  statusCode: response.status,
  recordCount: seasons.length,
  source: 'PlayHQ API' // or 'cached'
})
```

### Client-Side Error Logging

All fetch errors should be captured:

```typescript
// Client error logging example
console.error('seasons.error', {
  timestamp: new Date().toISOString(),
  code: errorCode, // 'FETCH_ERROR', 'PARSE_ERROR', etc.
  field: affectedField, // 'registrationCosts', 'keyDates', etc.
  statusCode: httpStatus,
  message: userFacingMessage,
  details: rawError
})
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-11 | Initial placeholder contract |
| (TBD) | (TBD) | Updated with actual PlayHQ API shape |

---

## Questions for Backend Team

1. What is the exact date boundary logic for season role?
   - If today == startDate, is season `current` or is previous season still `current`?
2. How should archive years be determined?
   - Distinct calendar years? Or specific year cutoff?
3. What are PlayHQ API rate limits?
   - How often can we poll for next season data?
4. What is the expected response time for /api/seasons?
   - Should we implement skeleton loaders or is < 500ms expected?
5. Are there timezone considerations?
   - Are dates in UTC or local time (Australia/Melbourne)?

---

## Next Steps

1. Obtain PlayHQ API documentation and sandbox credentials
2. Test PlayHQ endpoints with actual data
3. Finalize transformation logic and field mappings
4. Implement backend endpoint at `/api/seasons`
5. Update this contract with actual response examples
