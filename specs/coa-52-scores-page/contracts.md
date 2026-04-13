# Contracts: COA-52

## Contract A: Scraper -> Weekly JSON Artifact

The scraper must output `scripts/weekly-games-data.json` with this minimum shape:

```json
{
  "generatedAt": "2026-04-13T00:00:00.000Z",
  "window": {
    "timezone": "Australia/Melbourne",
    "startDate": "2026-04-13",
    "endDate": "2026-04-17",
    "label": "Week of 2026-04-13"
  },
  "status": "ok",
  "days": {
    "monday": [],
    "tuesday": [],
    "wednesday": [],
    "friday": []
  }
}
```

### Error variant

```json
{
  "generatedAt": "2026-04-13T00:00:00.000Z",
  "window": {
    "timezone": "Australia/Melbourne",
    "startDate": "2026-04-13",
    "endDate": "2026-04-17",
    "label": "Week of 2026-04-13"
  },
  "status": "error",
  "error": {
    "code": "PLAYHQ_FETCH_FAILED",
    "message": "Unable to load fixtures"
  },
  "days": {
    "monday": [],
    "tuesday": [],
    "wednesday": [],
    "friday": []
  }
}
```

---

## Contract B: `/scores` Page Rendering Rules

1. Must display title: **This Week's Games**.
2. Must render exactly four day columns in this order: Monday, Tuesday, Wednesday, Friday.
3. Must show per-day empty state if no fixtures in that bucket.
4. Must show full-page error state when `status = error`.
5. Must show kickoff as `TBA` when kickoff is missing/invalid.

---

## Contract C: Details Surface

For any fixture selected from `/scores`, detail surface must include:
- Teams
- Kickoff time (or TBA)
- Venue (if available)
- Grade/division summary (if available)
- No hidden squad/player fields

---

## Error Semantics

| Code | Meaning | User Message |
|---|---|---|
| `PLAYHQ_FETCH_FAILED` | Source request failed | "Unable to load games at this time. Please try again later." |
| `PLAYHQ_AUTH_FAILED` | Invalid/missing credentials | "Game data is temporarily unavailable." |
| `DATA_PARSE_FAILED` | Invalid generated JSON shape | "Game data is temporarily unavailable." |
| `NO_FIXTURES_FOR_WEEK` | Valid but empty week | "No games scheduled" |
