# Tasks: COA-19 — Court Time Calculator (Window 7 — User Feedback Enhancement Pass)

**Status**: PENDING  
**Date Initiated**: 2026-04-12  
**Based On**: User feedback after Window 6 testing

---

## Overview

Window 7 focuses on three major enhancements based on coach feedback:
1. **Algorithm Constraint**: Max 10-minute consecutive on-court stints
2. **Feature**: Select "finisher" players (3 players pinned to end-of-game lineup)
3. **UI Simplification**: Combined roster entry + starter/finisher selection in single form

---

## Execution Window 7: Algorithm & UI Enhancements

### Task 1: Implement Max 10-Minute On-Court Stint Constraint

**Goal**: Prevent any player from staying on the court for more than 10 consecutive minutes. Forces better rotation rhythm and prevents fatigue buildup.

**Constraint Details**:
- Maximum consecutive on-court time: 10 minutes per stint
- A player must rotate off the bench after 10 continuous minutes on court
- Encourages 3-stint pattern across 2 halves (e.g., 10 + 5 + 10 + 5 = ~30 min total)
- Applies to both halves

**Files to Modify**:
- `src/lib/court-time/algorithm.ts` — update `scheduleHalf()` to enforce max stint length

**Algorithm Approach**:
- Track consecutive on-court minutes for each player at each minute
- When a player reaches 10 consecutive minutes, force a substitution (swap them out)
- Ensure substitute coming in is under their target and hasn't exceeded 10-min stint
- Adjust correction pass to respect 10-minute stint maximum

**Test Requirements**:
- All 17 existing algorithm tests must still pass
- New test: Verify no player has more than 10 consecutive on-court minutes in any half
- Verify court time distribution is still fair (within 1-minute variance)

**Acceptance Criteria**:
- [ ] `scheduleHalf()` enforces max 10-minute consecutive stint
- [ ] Test added: no player has >10 consecutive on-court minutes
- [ ] `npm test` — all 17+ algorithm tests pass
- [ ] `npm run build` — zero errors, zero warnings
- [ ] Generated rotation shows ~3 stints per player per half

---

### Task 2: Add "Finisher" Selection (Pin 3 Players for Game End)

**Goal**: Allow coaches to pin 3 players who must be on court for the final lineup, ensuring they finish the game.

**Algorithm Changes**:
- Accept `finisher5` parameter: 3 pinned players + 2 algorithm-determined players
- Ensure 3 pinned players are on court at minute 39-40 (last moment of game)
- Guarantee no substitutions with pinned players in final 4+ minutes (locked in at end)
- Distribute court time for all other players around this constraint
- If a pinned player has too low a court-time target to viably play the end, validation fails

**Files to Modify**:
- `src/lib/court-time/types.ts` — add `finisher5` field or similar to RotationPlan
- `src/lib/court-time/algorithm.ts` — update `generateRotationPlan()` to accept finisher players
- `src/pages/court-time-calculator.astro` — pass finisher data to algorithm (added in Task 3)

**Algorithm Approach**:
- After generating base rotation, identify the lineup at minute 39
- If pinned finishers aren't all on court, work backwards to shift their minutes forward
- Ensure pinned finishers have played enough to reach target before the end
- Lock them in for the final stint (no subs in final 4 minutes)

**Validation**:
- Pinned players must be different from starting 5 (no overlap)
- Pinned players must have sufficient court-time target to be viable for end-game
- Exactly 3 finishers must be selected (or 0 for optional)

**Test Requirements**:
- All 17 existing algorithm tests must still pass
- New test: Verify pinned finishers are on court at minute 39-40
- New test: Verify no subs with pinned players in final 4 minutes
- Test with various pinned/starter combinations

**Acceptance Criteria**:
- [ ] `generateRotationPlan()` accepts `finisher5` parameter
- [ ] Pinned finishers guaranteed on court at game end
- [ ] No substitutions with pinned players in final 4 minutes
- [ ] Test: finishers are locked in at the end
- [ ] `npm test` — all tests pass (including new ones)
- [ ] `npm run build` — zero errors, zero warnings

---

### Task 3: Simplify UI — Single Roster Form with Starter/Finisher Checkboxes

**Goal**: Combine roster entry, starter selection, and finisher selection into one cohesive form. Eliminate the two-step "Enter Roster" → "Select Starting Five" flow.

**UI Changes**:
- Replace separate sections with unified roster entry table
- Add two checkbox columns: "Starter" and "Finisher"
- Real-time validation: 5/5 starters, 3/3 finishers (or 0/3 if optional)
- Disable checkboxes when limits reached (can't select 6th starter, can't select 4th finisher)
- Live counter showing status: "5/5 Starters ✓" and "0/3 Finishers"
- Generate button only enabled when all criteria met

**Files to Modify**:
- `src/pages/court-time-calculator.astro` — major UI refactor:
  - Remove `#section-starter-selection` (no longer needed)
  - Update `#section-roster-entry` to include checkbox columns
  - Update form validation to handle both starters and finishers in one step
  - Update form submission to pass both to algorithm

**HTML Structure**:
```html
<table>
  <thead>
    <tr>
      <th>Player Name</th>
      <th>Starter</th>
      <th>Finisher</th>
    </tr>
  </thead>
  <tbody>
    <tr> (rows 1-9)
      <td><input type="text" id="input-player-N"></td>
      <td><input type="checkbox" class="starter-checkbox" data-player-idx="N"></td>
      <td><input type="checkbox" class="finisher-checkbox" data-player-idx="N"></td>
    </tr>
  </tbody>
</table>

<div>5/5 Starters ✓</div>
<div>0/3 Finishers (optional)</div>

<button id="btn-generate">Generate Plan</button>
```

**JavaScript Logic**:
- Listen to checkbox changes
- Update starter/finisher count in real time
- Disable 6th starter checkbox when 5 already selected
- Disable 4th finisher checkbox when 3 already selected
- Prevent overlap: if a player is checked as starter, uncheck as finisher and vice versa
- Enable Generate button only when: 7-9 players named, 5 starters, 3 finishers (or 0)

**Validation**:
- No player can be both starter AND finisher (show error if attempted)
- Exactly 5 starters required
- 0 or 3 finishers (optional, but if any selected, must be exactly 3)
- All player names must be non-blank

**Files State Management**:
- Rename `appState` values if needed (may not need `starter-selection` state anymore)
- Direct transition: `roster-entry` → `plan-display` (skip intermediate state)

**Test Requirements**:
- Manual UI testing: checkbox behavior, enable/disable, validation
- Check constraints work (can't select 6 starters, can't select 4 finishers)
- Check overlap prevention (can't be both starter and finisher)
- Verify form submission passes correct data to algorithm

**Acceptance Criteria**:
- [ ] Single form combines roster entry + starter/finisher selection
- [ ] Real-time counter shows "5/5 Starters ✓" and "3/3 Finishers"
- [ ] Checkboxes disable appropriately (6th starter, 4th finisher blocked)
- [ ] No overlap: player can't be both starter and finisher
- [ ] Generate button only enabled when valid
- [ ] Form validation prevents generation with invalid state
- [ ] Submission passes `players`, `starters`, and `finishers` to algorithm
- [ ] `npm run build` — zero errors, zero warnings
- [ ] Mobile responsive (375px viewport works)

---

### Task 4: Integration & Verification

**Goal**: Full integration test of all three enhancements together. Ensure no regressions.

**Test Steps**:
1. **Algorithm Tests**:
   - Run all 17 existing tests → all pass
   - New max-stint test → passes
   - New finisher-pinning test → passes
   - Test 7/8/9 player rosters with finishers pinned
   
2. **UI Tests**:
   - Enter roster with starters and finishers
   - Generate plan with finishers
   - Verify Gantt shows finishers locked in at end
   - Verify sub list shows no late subs for finishers
   - Test "Start Over" clears everything
   
3. **End-to-End**:
   - 8-player roster: select 5 starters, pin 3 finishers
   - Verify rotation: starters at minute 0, finishers at minute 39-40
   - Verify no player has >10 consecutive minutes
   - Export PDF → verify format correct
   
4. **Regression Check**:
   - All 21 original acceptance criteria still passing
   - No new errors or warnings in build

**Acceptance Criteria**:
- [ ] All 17+ algorithm tests passing
- [ ] UI form works as specified
- [ ] Finishers locked in at game end
- [ ] No player exceeds 10-minute consecutive stint
- [ ] `npm test` — all pass
- [ ] `npm run build` — zero errors, zero warnings
- [ ] No regressions in original 21 ACs
- [ ] Mobile responsive confirmed

---

## Checkpoint (Window 7)

**Done When**:
- [ ] Task 1: Max 10-minute stint constraint implemented, tests passing
- [ ] Task 2: Finisher selection working, algorithm handles pinned players
- [ ] Task 3: UI simplified to single roster form with checkboxes
- [ ] Task 4: Full integration verified, no regressions
- [ ] State.md updated with Window 7 completion notes

---

## Dependencies & Notes

- **Task 1** must complete before Tasks 2 & 3 (algorithm is foundation)
- **Tasks 2 & 3** can be done in parallel (UI and algorithm features are independent)
- **Task 4** depends on all three tasks completing
- **Risk**: Max 10-minute stint constraint might require significant algorithm refactoring
- **Fallback**: If Task 1 proves too complex, can be moved to Window 8

---

## Success Metrics

- ✅ Algorithm produces cleaner rotation pattern (3 stints per player, max 10 min each)
- ✅ Coaches can pin 3 finishers and they're guaranteed to play the end
- ✅ Simpler UI flow (one form instead of two)
- ✅ All 17 tests + new tests passing
- ✅ Zero build errors/warnings
- ✅ Mobile responsive
- ✅ No regressions
