# Quickstart: COA-25 Manual Verification

## Prerequisites

- Branch: `coa-25-scores-front-page`
- Node >= 22
- Dependencies installed: `npm install`
- PlayHQ env configured (if generating fresh data)

## Refresh Data

```bash
npm run scores:refresh
npm run scores:check
npm run home-scores:refresh
npm run home-scores:check
```

## Run Locally

```bash
npm run dev
```

Visit:
- `http://localhost:4321/`

## Manual Checklist

- [ ] Latest results section renders carousel from recent games data
- [ ] Left/right controls move by one card
- [ ] Carousel loops at ends
- [ ] Auto-rotation advances when idle
- [ ] Auto-rotation pauses on interaction and resumes after delay
- [ ] Card activation opens `/scores/{gameId}`
- [ ] Empty state appears when games list is empty
- [ ] Stale banner appears when status is `stale`
- [ ] Error state appears when status is `error`
- [ ] Keyboard tab/enter/space operation works on controls/cards
- [ ] Layout remains usable at 320px / 768px / 1024+

## Failure-State Drill

1. Temporarily set artifact status to `error` and reload home page.
2. Verify user-friendly error message in latest results section.
3. Restore artifact.

## Build Check

```bash
npm run build
```

Expected: build succeeds with no new errors.
