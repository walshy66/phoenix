# Data Model: COA-25 Scores Front Page Carousel

## Storage Strategy

No database schema changes.

Feature uses generated JSON artifact(s) in `scripts/` as authoritative input for homepage rendering.

## Primary Entity: HomeGamesArtifact

```json
{
  "generatedAt": "2026-04-13T00:00:00.000Z",
  "status": "success | stale | error",
  "window": {
    "kind": "rolling-7-days",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "timezone": "Australia/Melbourne"
  },
  "staleBanner": "string | null",
  "error": { "code": "string", "message": "string" },
  "games": [
    {
      "gameId": "string",
      "homeTeam": "string",
      "awayTeam": "string",
      "homeScore": "number | null",
      "awayScore": "number | null",
      "status": "completed | upcoming | cancelled | unknown",
      "kickoffDate": "YYYY-MM-DD | null",
      "kickoffTime": "HH:mm:ss | null",
      "kickoffDisplay": "string",
      "competition": "string | null",
      "venue": "string | null",
      "court": "string | null"
    }
  ]
}
```

## Invariants

1. `status` determines render state precedence:
   - `error` -> show error state
   - `stale` -> show data + stale indicator
   - `success` -> show data normally
2. `gameId` uniquely identifies each game item in `games`.
3. Missing kickoff values are represented with `null` fields and display fallback (`TBA`).
4. Source data remains authoritative; absent fields are never fabricated.

## Derived UI State (Not Persisted)

- `currentIndex`
- `isAutoRotating`
- `lastInteractionAt`
- `visibleCount` (viewport dependent)

These are ephemeral interaction values only.
