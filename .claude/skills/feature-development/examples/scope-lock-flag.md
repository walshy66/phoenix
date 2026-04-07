# Example: Scope Lock Flag

This is what a properly formatted scope flag looks like when a task hits an out-of-scope decision.

---

## Scope Flag — TASK-008

**Feature**: exercise-history (047)  
**Task**: Implement personal best aggregation in repository  
**Flagged by**: implement agent  
**Date**: 2026-03-01

---

### What the task requires

To calculate personal best for an exercise, the repository needs to query
`ActualExerciseLog` records across all completed sessions for the user.

### Why this is potentially out of scope

The `ActualExerciseLog` model is owned by the `session-logs` module
(`api/src/modules/session-logs/`). The feature spec for `exercise-history`
declares its scope as read-only access to existing session data, but does
not explicitly name which modules are in or out of scope.

### Options

**Option A — Read-only access to session-logs module (recommended)**
- Add a read-only query to `api/src/modules/exercise-history/` that selects
  from `ActualExerciseLog` directly via Prisma
- No changes to `session-logs` module itself
- Scoped by `userId` via athlete join — compliant with Principle VI
- Risk: low — read-only, no schema changes, no mutations

**Option B — Add a method to session-logs repository**
- Add `getExerciseHistory(userId, exerciseId)` to the existing
  `session-logs` repository
- Cleaner separation of concerns long-term
- Risk: touches another feature's module, requires cross-feature review

**Option C — Defer personal best to a separate task**
- Implement basic history without personal best now
- Add personal best in a follow-up task after scope is clarified
- Risk: incomplete feature, may require UI rework

### Recommendation

**Option A.** Read-only Prisma access from within the exercise-history
module is consistent with how `exercise-history` was built in 047. It does
not modify any existing module and stays within the ownership model.

---

**Waiting for user decision before proceeding.**
