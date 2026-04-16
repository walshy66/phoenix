# State: Feature coa-61-seasons-update

## Metadata
- Feature Slug: coa-61-seasons-update
- Status: IN_PROGRESS
- Current Window: 4
- Start Time: 2026-04-16
- Last Updated: 2026-04-16
- Linear Issue: COA-61
- Branch: cameronwalsh/coa-61-seasons-update

## Window Plan
- Window 1: Data + reusable card/modal components
- Window 2: Seasons page integration + modal behavior script
- Window 3: Responsive/accessibility/edge-case verification
- Window 4: Content mapping + final QA + handoff artifacts

## Constitutional Constraints In Scope
- Principle I: User outcomes first (modal-based access to core season info)
- Principle II: Test-first discipline (targeted source/assertion tests added)
- Principle V: AppShell integrity (kept BaseLayout and existing page sections)
- Principle VI: Accessibility first (dialog semantics, keyboard support, focus return)
- Principle IX: Cross-feature consistency (modal behavior aligned to existing patterns)

## Completed Windows

### Window 1 — Foundation ✅
- `src/data/season-info.ts`
- `src/components/SeasonInfoCard.astro`
- `src/components/SeasonInfoModal.astro`

### Window 2 — Integration ✅
- Replaced old training section with Season Information section in `src/pages/seasons.astro`
- Added modal open/close/focus-trap script
- Ensured one modal open at a time, Escape/backdrop close, focus return

### Window 3 — Verification ✅
- Updated and ran targeted tests:
  - `src/components/__tests__/seasons.training-info.test.ts`
  - `src/components/__tests__/seasons.responsive.test.ts`
- Added image fallback handling + explicit dimensions in modal image cards
- Build passes (`npm run build`)

### Window 4 — Finalization ⏳
- Completed:
  - Asset path fix to `public/uploads/`
  - Alt text copy updates in `season-info.ts`
  - Scope/task/log artifacts created
- Remaining:
  - Full manual acceptance sweep in browser (all AC-01..AC-17)
  - Final implementation summary + Linear move to Review

## Validation Notes
- `npm test` still fails due unrelated baseline issues:
  - `src/components/__tests__/resource-merge.test.ts` (SyntaxError)
  - `src/lib/events/parser.test.ts` (existing parser assertion mismatch)
