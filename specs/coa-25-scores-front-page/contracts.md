# Contracts: COA-25 Scores Front Page Carousel

## 1) Artifact Contract (Homepage Consumer)

### File
- `scripts/home-games-data.json` (or agreed equivalent)

### Required Root Fields
- `generatedAt` (ISO timestamp)
- `status` (`success | stale | error`)
- `window` (`kind`, `startDate`, `endDate`, `timezone`)
- `games` (array)

### Optional Root Fields
- `staleBanner` (string|null)
- `error` (`code`, `message`)

### Validation Errors
- `INVALID_JSON`
- `INVALID_SHAPE`
- `INVALID_STATUS`

---

## 2) Game Item Contract

Required fields:
- `gameId`
- `homeTeam`
- `awayTeam`
- `status`

Recommended fields:
- `homeScore`, `awayScore`
- `kickoffDate`, `kickoffTime`, `kickoffDisplay`
- `competition`, `venue`, `court`

Rules:
- If time is missing or invalid, `kickoffDisplay` MUST be `TBA`.
- If score is unavailable, score fields remain `null`.

---

## 3) Detail Navigation Contract

From home carousel:
- Card action MUST navigate to: `/scores/{gameId}`

Behavioral guarantees:
- URL must be deep-linkable/shareable.
- Unknown IDs should return graceful not-found UI.

---

## 4) Error/Observability Contract

On refresh/fetch failure, logs MUST include:
- `timestamp`
- `operation`
- `status` and/or `errorCode`
- `message`
- `windowStart`
- `windowEnd`

User-visible behavior:
- Prior valid data available -> stale state with banner
- No prior valid data -> clear error state
