# Scope Lock — COA-53 UI Touch Up

## Locked In Scope
- Standardize hero/title section vertical spacing to `py-12 lg:py-8` across:
  - Teams, About, Scores, Seasons, Contact, Get Involved, Resources
- Ensure each listed page has one-line descriptive hero text.
- Remove Resources hero bottom-left decorative circle element.
- Refine Scores day-column grid to 1/2/4 layout (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).
- Align Teams tiles and ScoreCard styling vocabulary:
  - `rounded-xl border border-gray-100 shadow-sm card-hover`
- Reduce Contact page gap between contact cards section and following section.

## Out of Scope
- Backend/data model changes.
- New dependencies.
- Reworking unrelated page sections/components.
- Replacing existing score ingestion/data pipelines.

## Acceptance Gate
Sign-off based on COA-53 spec acceptance criteria AC-1..AC-12 and success criteria SC-001..SC-009.
