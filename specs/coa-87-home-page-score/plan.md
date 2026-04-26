# Implementation Plan: COA-87 Home Page Score

**Branch**: `cameronwalsh/coa-87-home-page-score`  
**Date**: 2026-04-27  
**Spec**: `specs/coa-87-home-page-score/spec.md`

---

## Summary

Disable the homepage score carousel by default while preserving the existing carousel implementation for future re-enablement. The implementation will use a single central toggle to prevent the carousel from rendering or bootstrapping on `/`, and it will keep the `/scores` pages untouched.

The homepage must no longer pay the cost of loading carousel-specific data or initialization work when the feature is off. When the toggle is re-enabled later, the current score surface should come back without rebuilding the feature.

---

## Technical Context

- **Language/Runtime**: TypeScript/JavaScript on Node 22+ in an Astro site
- **Framework**: Astro + Tailwind
- **Storage**: None; this is a presentation-layer change only
- **Testing**: Vitest plus page/component behavior checks
- **Target Platform**: Public web homepage (`/`)
- **Performance Goal**: Avoid loading or bootstrapping homepage score-carousel work when disabled
- **Scope**: Single homepage surface and its supporting client bootstrap

---

## Constitution Check

- **Principle I (User Outcomes First)**: ✅ PASS — the homepage presents less clutter and less work by default.
- **Principle II (Test-First Discipline)**: ✅ PASS — the plan calls for tests that fail before the toggle and render changes.
- **Principle III (Backend Authority & Invariants)**: ✅ PASS — no server-side data authority changes are introduced.
- **Principle IV (Error Semantics & Observability)**: ✅ PASS — no new error path is introduced; the disabled state should be clean and silent.
- **Principle V (AppShell Integrity)**: ✅ PASS — the existing site shell remains intact and only one homepage section is gated.
- **Principle VI (Accessibility First)**: ✅ PASS — hidden carousel controls must not remain in the DOM when the feature is off.
- **Principle VII (Immutable Data Flow)**: ✅ PASS — the carousel implementation is preserved rather than mutated into a new system.
- **Principle IX (Cross-Feature Consistency)**: ✅ PASS — the work follows existing Astro/Tailwind homepage patterns.

No constitutional deviations are expected.

---

## Project Structure

```text
src/
  pages/
    index.astro                  # Gate homepage score section behind a single toggle
  components/
    HomeScoresCarousel.astro      # Keep implementation intact, but it must only mount when enabled
  lib/
    home-scores/
      carousel.ts                 # Existing helper logic remains reusable
    playhq/
      renderers.ts                # Existing server-side renderer remains reusable if needed later
specs/coa-87-home-page-score/
  spec.md
  plan.md
  tasks.md
```

---

## Phased Delivery

### Phase 1 — Test Coverage and Toggle Design

1. Add failing tests for the homepage default-off state.
2. Confirm the homepage no longer renders the score section when disabled.
3. Confirm carousel-related controls and initialization are absent in the disabled state.
4. Confirm `/scores` routes remain unaffected.

**Exit Criteria**
- Tests capture the expected off-by-default behavior.
- The feature toggle strategy is clear and centralized.

### Phase 2 — Homepage Gating and Work Removal

1. Introduce a single central toggle for the homepage score surface.
2. Gate the score artifact loading and carousel render path behind that toggle.
3. Ensure the homepage does not emit the carousel section, controls, or bootstrap script when disabled.
4. Preserve the existing carousel code path for re-enablement.

**Exit Criteria**
- Homepage renders cleanly with the carousel absent.
- No unnecessary carousel work is performed when disabled.

### Phase 3 — Validation and Regression Checks

1. Run focused tests and homepage checks.
2. Confirm responsive layout remains intact without the score surface.
3. Verify the feature can be re-enabled without rewriting the existing implementation.

**Exit Criteria**
- All acceptance criteria are satisfied.
- The disabled and re-enabled states are both understood and stable.

---

## Testing Strategy

- **Unit/behavior tests**:
  - Homepage output when the feature is disabled.
  - Presence/absence of carousel section markers and controls.
  - Preservation of `/scores` route behavior.
- **Manual checks**:
  - Load the homepage and verify there is no score carousel or reserved spacing.
  - Confirm the rest of the homepage still renders in order.
  - Check the homepage at mobile, tablet, and desktop widths.
- **Regression checks**:
  - Confirm the existing carousel component still exists and can be re-enabled by the single toggle.

---

## Risks & Mitigations

1. **Homepage still loads carousel data even when hidden**  
   - Mitigation: keep the data-loading step inside the same gated branch as the render.
2. **Hidden controls remain in the DOM**  
   - Mitigation: render nothing for the score section when disabled; do not leave a placeholder wrapper.
3. **Re-enabling later becomes ambiguous**  
   - Mitigation: keep the toggle centralized and documented in the plan/spec.
4. **Home layout spacing changes unexpectedly**  
   - Mitigation: verify the homepage with the section removed at key breakpoints.

---

## Ready for Tasks Phase

- [x] Technical context defined
- [x] Constitution alignment confirmed
- [x] Project structure identified
- [x] Phased delivery sequenced
- [x] Testing strategy documented

Next: `/skill:tasks`
