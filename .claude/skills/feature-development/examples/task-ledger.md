# Example: Task Ledger (tasks.md)

This is what a well-formed `specs/{slug}/tasks.md` looks like mid-feature.

---

## Feature: exercise-history (047)

### Status: IN PROGRESS

---

## Tasks

### Backend

- [x] TASK-001: Write failing unit test for ExerciseHistoryRepository.findByExerciseId (ownership scoped)
- [x] TASK-002: Implement ExerciseHistoryRepository with userId constructor injection
- [x] TASK-003: Write failing contract test for GET /api/v1/exercise-history/:exerciseId
- [x] TASK-004: Implement GET /api/v1/exercise-history/:exerciseId route handler
- [x] TASK-005: Write failing integration test for 401 on unauthenticated request
- [x] TASK-006: Write failing integration test for empty state (no history)
- [ ] TASK-007: Write failing integration test for personal best calculation
- [ ] TASK-008: Implement personal best aggregation in repository
- [ ] TASK-009: Register route in server bootstrap

### Frontend

- [ ] TASK-010: Write failing test for ExerciseHistoryPanel renders empty state
- [ ] TASK-011: Implement ExerciseHistoryPanel component (empty state)
- [ ] TASK-012: Write failing test for ExerciseHistoryPanel renders data
- [ ] TASK-013: Implement data display in ExerciseHistoryPanel
- [ ] TASK-014: Connect to API via useExerciseHistory hook

---

## Scope Lock Log

| Date | Task | Issue | Decision |
|------|------|-------|----------|
| 2026-03-01 | TASK-008 | Personal best requires touching session-logs module | Approved — read-only access to existing module |

---

## Commit Log

| Task | Commit | Message |
|------|--------|---------|
| TASK-001–002 | abc1234 | feat(exercise-history): scoped repository with ownership enforcement [task-001-002] |
| TASK-003–004 | def5678 | feat(exercise-history): GET exercise history route with auth [task-003-004] |
| TASK-005–006 | ghi9012 | feat(exercise-history): integration tests for 401 and empty state [task-005-006] |
