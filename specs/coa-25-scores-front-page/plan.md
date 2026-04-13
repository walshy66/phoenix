# Implementation Plan: COA-25 Scores Front Page Carousel

**Branch**: `coa-25-scores-front-page`  
**Date**: 2026-04-13  
**Spec**: `specs/coa-25-scores-front-page/spec.md`

---

## Summary

Implement a home-page latest results carousel powered by authoritative PlayHQ-derived data for a rolling 7-day window. Keep existing card styling, add looped left/right navigation plus auto-rotation, and deep-link each card to game details.

Because the current branch only has `src/pages/scores.astro` (no dynamic `/scores/[gameId]` route), the plan includes a compatibility checkpoint to either consume an existing details route if present or create a minimal details surface in this feature.

---

## Technical Context

- **Language/Runtime**: TypeScript/JavaScript on Node 22+ (Astro site)
- **Framework**: Astro + Tailwind
- **Data Source**: PlayHQ external API via existing script pattern
- **Storage**: Generated JSON artifact in `scripts/` (no DB changes)
- **Testing**: Vitest (unit/helper behavior), manual browser checks for interaction/a11y
- **Target Platform**: Public web (home page)
- **Performance Goal**: latest results section renders in <=2s under normal payload
- **Scope Size**: Single-page enhancement + scraper/artifact + optional details-route compatibility

---

## Constitution Check

- **Principle I (User Outcomes First)**: ✅ PASS — direct homepage visibility of recent games.
- **Principle II (Test-First Discipline)**: ✅ PASS — helper and carousel behavior tests added before implementation.
- **Principle III (Backend Authority)**: ✅ PASS — source data authoritative; no fabricated values.
- **Principle IV (Error Semantics & Observability)**: ✅ PASS — stale/error/empty states and structured logs required.
- **Principle V (AppShell Integrity)**: ✅ PASS — enhancement stays inside existing home page shell.
- **Principle VI (Accessibility First)**: ✅ PASS — keyboard focus/action and semantic labels included.
- **Principle VII (Immutable Data Flow)**: ✅ PASS — carousel state is transient UI state only.
- **Principle IX (Cross-Feature Consistency)**: ✅ PASS — reuses existing score-card language and scores detail linkage.

No constitutional deviations expected.

---

## Project Structure

```text
scripts/
  scrape-home-games.js              # new or extension of existing scraper logic
  check-home-games-data.js          # artifact contract verification
  home-games-data.json              # generated artifact (committed)

src/lib/home-scores/
  transforms.ts                     # 7-day filtering, sorting, normalization
  transforms.test.ts
  carousel.ts                       # index + pause/resume behavior helpers
  carousel.test.ts
  contracts.ts                      # artifact validator
  contracts.test.ts

src/components/
  HomeScoresCarousel.astro          # new carousel wrapper section
  HomeGameCardLink.astro            # optional wrapper over existing ScoreCard

src/pages/
  index.astro                       # replace static recentScores with artifact-driven carousel
  scores/[gameId].astro             # add only if missing and needed for deep-link contract

specs/coa-25-scores-front-page/
  plan.md
  research.md
  data-model.md
  contracts.md
  quickstart.md
  tasks.md                          # next phase
```

---

## Phased Delivery

### Phase 1 — Data Contract + 7-Day Artifact

1. Define `home-games-data` contract (success/stale/error + metadata).
2. Implement transform helpers for rolling 7-day selection and normalization.
3. Create/update scraper path to emit artifact and structured logs.
4. Add artifact check script and package scripts.

**Exit Criteria**
- Contract tests pass.
- Generated artifact validates.
- Failure path produces stale/error states with required log fields.

### Phase 2 — Carousel Interaction Foundation

1. Build carousel state helpers (next/prev/loop/pause/resume).
2. Add tests for index wrapping and timer pause/resume transitions.
3. Build UI component that renders cards + controls + status states.

**Exit Criteria**
- Carousel helper tests pass.
- Looping and pause/resume behavior verified.

### Phase 3 — Home Page Integration

1. Replace static `recentScores` in `index.astro` with artifact-driven carousel.
2. Preserve card visual style; ensure responsive card counts and overflow behavior.
3. Add empty/stale/error state rendering.

**Exit Criteria**
- Home page renders valid states at 320/768/1024+.
- Keyboard navigation works for controls and cards.

### Phase 4 — Detail Navigation Compatibility

1. Validate presence of `/scores/[gameId]` route on branch.
2. If missing, add minimal detail route behavior to satisfy deep-link acceptance.
3. Verify back-navigation preserves reasonable user context.

**Exit Criteria**
- Card click and keyboard activation open valid game detail URL.
- Not-found handling graceful for missing game IDs.

### Phase 5 — Validation + Documentation

1. Run focused tests and full build.
2. Update quickstart/HOWTO references for home carousel refresh command.
3. Produce implementation summary evidence.

**Exit Criteria**
- Build passes.
- Manual acceptance checklist completed.

---

## Testing Strategy

- **Test-first** for all new helper modules.
- **Unit Tests**:
  - 7-day filtering and normalization.
  - TBA ordering behavior.
  - carousel index loop and pause/resume state changes.
  - artifact contract validation.
- **Manual Tests**:
  - home page control interactions and auto-rotation.
  - keyboard-only operation.
  - screen reader labels for controls/actions.
  - responsive checks at 320/768/1024+.
  - empty/stale/error visual states.
- **Build Validation**: `npm run build`.

---

## Risks & Mitigations

1. **Missing details route on current branch**  
   - Mitigation: explicit Phase 4 compatibility gate.
2. **Timer drift/jank on long carousel lists (~21 cards)**  
   - Mitigation: deterministic state helper + reduced-motion handling.
3. **API/source instability**  
   - Mitigation: stale fallback and clear user-visible status.
4. **Interaction regressions on mobile**  
   - Mitigation: manual breakpoint checklist and keyboard/touch validation.

---

## Ready for Tasks Phase

- [x] Technical context defined
- [x] Constitution alignment confirmed
- [x] File/project structure identified
- [x] Phased delivery sequenced
- [x] Testing strategy documented
- [x] Supporting artifacts created (`research.md`, `data-model.md`, `contracts.md`, `quickstart.md`)

Next: `/skill:tasks`
