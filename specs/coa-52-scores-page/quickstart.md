# Quickstart: COA-52 Manual Verification

## 1) Prerequisites

- Branch: `coa-52-scores-page`
- Node installed (`>=22.12.0`)
- `PLAYHQ_API_KEY` exported in shell

```bash
npm install
```

---

## 2) Generate Weekly Data

Run the weekly scraper and artifact validator:

```bash
npm run scores:refresh
npm run scores:check
```

(Combined command)

```bash
npm run scores:refresh:weekly
```

---

## 3) Run Site Locally

```bash
npm run dev
```

Visit:
- `http://localhost:4321/scores`

---

## 4) Verification Checklist

- [ ] Title reads **This Week's Games**
- [ ] 4 day columns exist in order: Monday, Tuesday, Wednesday, Friday
- [ ] Fixtures sorted earliest first per day
- [ ] TBA fixtures rendered after timed fixtures
- [ ] Empty day shows "No games scheduled"
- [ ] Fixture activation opens details route (`/scores/[gameId]`) and back link returns to `/scores`
- [ ] Hidden squad/player data is not visible
- [ ] Keyboard tab/focus/enter works for fixture interactions
- [ ] Layout is usable at 320px, 768px, 1024px+

---

## 5) Failure-State Checks

1. Temporarily rename JSON artifact:
   ```bash
   mv scripts/weekly-games-data.json scripts/weekly-games-data.bak.json
   ```
2. Reload `/scores`.
3. Verify user-friendly error or fallback state appears.
4. Restore file:
   ```bash
   mv scripts/weekly-games-data.bak.json scripts/weekly-games-data.json
   ```

---

## 6) Sunday Refresh Smoke Check

- Trigger scheduled refresh manually via GitHub Actions workflow: `Weekly Scores Refresh` (workflow_dispatch).
- Confirm new `generatedAt` timestamp in `scripts/weekly-games-data.json`.
- Confirm `/scores` reflects updated week window.
- If refresh fails, confirm stale banner appears (when prior success exists) or error state appears (when no prior success).
