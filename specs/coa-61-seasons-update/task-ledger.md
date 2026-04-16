# Task Ledger — COA-61 Seasons Update

## Window 1 — Data & Components Foundation ✅
- T1.1 Create `src/data/season-info.ts` ✅
- T1.2 Create `src/components/SeasonInfoCard.astro` ✅
- T1.3 Create `src/components/SeasonInfoModal.astro` ✅

### Evidence
- Data file exports card + sub-card types and 4 card definitions.
- Modal component supports training/uniforms/clearances/registration layouts.
- Dialog semantics and close button accessibility attributes in place.

## Window 2 — Page Integration & Script Wiring ✅
- T2.1 Replace old Club Training section in `src/pages/seasons.astro` ✅
- T2.2 Add modal open/close/focus script ✅
- T2.3 Add selector attributes (`data-close-btn`, `data-modal-backdrop`) ✅

### Evidence
- `/seasons` now renders Season Information section before season tile grid.
- Modal script handles open/close, escape, backdrop click, focus return, single-open behavior.

## Window 3 — Verification & Edge Cases ✅ (Automated + Build)
- T3.1 Responsive checks (source assertions) ✅
- T3.2 Keyboard/focus behavior checks (source assertions + script review) ✅
- T3.3 Edge handling for image fallback and modal switching ✅

### Evidence
- Added/updated tests:
  - `src/components/__tests__/seasons.training-info.test.ts`
  - `src/components/__tests__/seasons.responsive.test.ts`
- Targeted tests pass:
  - `npx vitest run src/components/__tests__/seasons.training-info.test.ts src/components/__tests__/seasons.responsive.test.ts`
- Build passes:
  - `npm run build`

## Window 4 — Content & Handoff ✅ (Implementation)
- T4.1 Confirm image mapping + static paths ✅
- T4.2 Replace placeholder alt text with descriptive final alt text ✅
- T4.3 Final QA checklist ⚠️ pending full manual browser sweep

### Evidence
- Copied assets to `public/uploads/` for runtime serving.
- Updated alt text in `src/data/season-info.ts`.
- Added explicit image dimensions and lazy loading in modal image cards.

## Baseline Test Note
- Full suite still has unrelated baseline failures:
  - `src/components/__tests__/resource-merge.test.ts` (SyntaxError)
  - `src/lib/events/parser.test.ts` (existing assertion mismatch)
