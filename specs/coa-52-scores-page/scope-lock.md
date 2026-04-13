# Scope Lock — COA-52 Scores Page

## Locked In Scope
- Replace current `/scores` experience with **This Week's Games** weekly fixture grid.
- Render exactly 4 day columns: Monday, Tuesday, Wednesday, Friday.
- Sort within day by kickoff ascending; unknown time displays `TBA` and appears after timed fixtures.
- Support deep-linkable game details surface from each fixture tile.
- Add weekly refresh pipeline (Sunday, Australia/Melbourne).
- Add stale-data banner + error state fallback behavior.
- Add structured failure logging fields required by spec.

## Out of Scope
- Rebuilding unrelated pages/routes.
- Introducing new external dependencies unless unavoidable.
- Expanding to Thursday/Saturday/Sunday columns.

## Acceptance Gate
Only AC-001..AC-015 and SC-001..SC-008 are used for sign-off.
