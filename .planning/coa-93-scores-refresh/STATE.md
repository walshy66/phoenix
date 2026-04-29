# State: Feature coa-93-scores-refresh

## Metadata
- Feature Slug: coa-93-scores-refresh
- Status: IN_PROGRESS
- Current Window: 1
- Start Time: 2026-04-29
- Last Updated: 2026-04-29
- Linear Issue: COA-93
- Branch: cameronwalsh/coa-93-scores-refresh

## Window Plan
- Window 1: Update PlayHQ refresh workflow schedule + Melbourne time gate

## Constitutional Constraints In Scope
- Principle II: Test-first discipline
- Principle IV: Structured logging and safe operational behavior
- Principle IX: Cross-feature consistency

## Completed Windows

### Window 1 — Workflow schedule update ✅
- Added failing workflow test first
- Updated `.github/workflows/playhq-sync.yml` to run hourly at :30 during the refresh window
- Added Melbourne local-time gate to prevent out-of-window runs
- Validation passed: `npx vitest run src/lib/playhq/workflow.test.ts`
