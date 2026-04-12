# Tasks: COA-19 — Court Time Calculator Fixes (Window 6)

**Status**: IN_PROGRESS  
**Date Started**: 2026-04-12  
**Previous Work**: Windows 1-5 complete (all 21 acceptance criteria passing)

---

## Problem Statement

The current algorithm produces fragmented court time patterns:
- Players receive 2–3 minute chunks scattered throughout the half
- Too many substitutions disrupt game flow
- Spec requirement: "prefer fewer, well-spaced substitutions over perfectly equal time"

**User Feedback**: Pattern should create longer contiguous stretches on court before substitution.

---

## Execution Window 6: Algorithm Redesign + UI Enhancements

### Task 1: Redesign Rotation Algorithm for Longer Playing Stretches

**Goal**: Refactor `scheduleHalf` to produce round-robin rotation blocks instead of late-placement slots.

**Approach**:
- Divide each 20-minute half into rotation **windows** (e.g., 4–5 min blocks)
- Distribute players across windows in a pattern that keeps groups together
- Rotate through so each player gets continuous stretches, not fragments
- Maintain target minutes distribution (7-player: 28–29 min, 8-player: 25 min, 9-player: 22–23 min)

**Files to modify**:
- `src/lib/court-time/algorithm.ts` — redesign `scheduleHalf()` function

**Test requirements**:
- Existing unit tests (17 total) must still pass
- Generate 8-player plan and verify:
  - Each player gets exactly 25 minutes total
  - Maximum contiguous stretch on court is 5+ minutes (not 2–3 min)
  - Fewer substitutions overall than current implementation
  - No same-minute substitutions, no events at minute 0 or 20

**Acceptance Criteria**:
- [ ] `scheduleHalf` replaced with round-robin window-based logic
- [ ] `npm test` — all 17 algorithm tests pass
- [ ] Generated plan shows longer playing stretches (visually verify in Gantt chart)
- [ ] Substitution count reduced from current ~15/half to ~6–8/half

---

### Task 2: Reverse Timeline Axis (Countdown Style)

**Goal**: Display Gantt chart timeline as countdown within each half instead of absolute elapsed time.

**Current**: 0, 5, 10, 15, 20 | 25, 30, 35, 40 (left to right, absolute)  
**Target**: 20, 15, 10, 5, 0 | 20, 15, 10, 5, 0 (right to left, countdown per half)

**Files to modify**:
- `src/pages/court-time-calculator.astro` — update `renderGantt()` function

**Implementation details**:
- Flip time axis labels: show countdown times instead of elapsed
- Adjust percentage-based positioning: `(40 - minute) / 40 * 100%` instead of `minute / 40 * 100%`
- Ensure half-time marker (gold line) stays at visual 50% boundary
- Update any time-related tooltips or labels to use countdown format

**Acceptance Criteria**:
- [ ] Time axis shows countdown per half (20, 15, 10, 5, 0 for each half)
- [ ] All stint bars repositioned correctly (right-to-left)
- [ ] Half-time marker remains visually clear at 50%
- [ ] Gantt chart remains readable and unaffected by this visual change
- [ ] Mobile horizontal scroll still works

---

### Task 3: Display Substitution Events List on Page

**Goal**: Add a visible, structured list of all substitution events below the Gantt chart, so coaches can review the plan before PDF export.

**Content**:
- Section title: "Substitution Events"
- Group by half (First Half, Second Half)
- Per event: countdown time + players coming on + players sitting down
- Example: "18:00 — Asha IN, Lorenzo OUT"

**Files to modify**:
- `src/pages/court-time-calculator.astro` — add new section and render function

**HTML structure**:
```
<section id="section-substitution-events">
  <h3>Substitution Events</h3>
  <div class="space-y-4">
    <div>
      <h4>First Half</h4>
      <ul>
        <li>20:00 — Asha IN, Lorenzo OUT</li>
        ...
      </ul>
    </div>
    <div>
      <h4>Second Half</h4>
      <ul>
        <li>18:00 — Henry IN, Cam OUT</li>
        ...
      </ul>
    </div>
  </div>
</section>
```

**Render function**:
- `renderSubstitutionEvents(plan: RotationPlan)` — builds list from plan.halves[].substitutions
- Converts gameClockMinute to countdown format (20 - gameClockMinute)
- Displays as MM:00 (e.g., "18:00")
- Sorted chronologically within each half

**Acceptance Criteria**:
- [ ] Substitution list appears below Gantt chart (after plan generation)
- [ ] Organized by First Half and Second Half
- [ ] Times displayed as countdown (20, 19, 18, ... format)
- [ ] Each sub shows player names clearly (no IDs)
- [ ] List is hidden until plan is generated
- [ ] List is cleared on "Start Over"
- [ ] Responsive layout on mobile (doesn't overflow)

---

### Task 4: Verify All Changes and Acceptance Criteria

**Goal**: Full integration test of algorithm redesign + UI changes.

**Test steps**:
1. Generate 7-player plan → verify longer stretches + fewer subs + all 21 AC still passing
2. Generate 8-player plan → verify each player gets 25 min, clean pattern
3. Generate 9-player plan → verify 22–23 min distribution, clean pattern
4. Gantt chart renders correctly with countdown timeline
5. Substitution list displays correctly on page
6. PDF export still works (list not needed in PDF, PDF unchanged from Window 4)
7. Start Over clears both Gantt and sub list
8. Mobile responsiveness check (375px viewport)

**Acceptance Criteria**:
- [ ] All 21 original ACs still passing (no regressions)
- [ ] Algorithm produces visibly longer playing stretches
- [ ] Timeline countdown format displays correctly
- [ ] Substitution list displays all events, readable, responsive
- [ ] `npm test` — all 17 tests pass
- [ ] `npm run build` — zero errors, zero warnings
- [ ] Feature works on mobile (tested in browser devtools 375px)

---

## Checkpoint (Window 6)

**Done When**:
- [ ] Task 1: Algorithm redesigned, tests passing, longer stretches visible
- [ ] Task 2: Timeline axis reversed to countdown format
- [ ] Task 3: Substitution list implemented and displaying
- [ ] Task 4: Full integration verified, no regressions, mobile tested
- [ ] State.md updated with Window 6 completion notes

---

## Notes

- **Risk**: Algorithm change could break tests. Will run full test suite after Task 1.
- **Timeline**: Countdown should NOT affect PDF export (PDF was designed for countdown already per Window 4 notes)
- **Mobile**: Ensure sub list doesn't break responsive layout on 375px screens
- **Gantt visual**: Double-check bar widths/offsets with reversed timeline — math should still work
