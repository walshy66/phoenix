# Data Model: COA-52 Weekly Games

This feature uses generated JSON data (no database schema changes).

---

## Weekly Games Artifact

**File**: `scripts/weekly-games-data.json`

```ts
interface WeeklyGamesData {
  generatedAt: string; // ISO8601
  window: {
    timezone: string; // "Australia/Melbourne"
    startDate: string; // Monday YYYY-MM-DD
    endDate: string;   // Friday YYYY-MM-DD
    label: string;     // e.g. "Week of 2026-04-13"
  };
  status: 'ok' | 'stale' | 'error';
  error?: {
    code: string;
    message: string;
  };
  days: {
    monday: Fixture[];
    tuesday: Fixture[];
    wednesday: Fixture[];
    friday: Fixture[];
  };
}

interface Fixture {
  fixtureId: string;
  gameId: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'friday';
  kickoffAt: string | null;      // ISO8601 or null for TBA
  kickoffLabel: string;          // "7:00 PM" or "TBA"
  homeTeam: string;
  awayTeam: string;
  grade?: string;
  venue?: string;
  detail: {
    squadsVisible: boolean;
    squads?: Array<{ name: string; role?: string }>;
  };
}
```

---

## Invariants

1. `days` always includes all four keys, even if arrays are empty.
2. Fixtures with null/invalid kickoff are represented as `kickoffAt: null` and sorted after timed fixtures.
3. Hidden squad data is never included in `detail.squads`.
4. `status=error` requires populated `error` object.
5. `window` always targets Mon–Fri for the upcoming display week.

---

## Migration Strategy

No DB migration required.

Data migration is file-contract migration only:
1. Introduce `weekly-games-data.json`.
2. Update `/scores` to consume new artifact.
3. Retire/decouple old `/scores` ladder/result rendering path once validated.
