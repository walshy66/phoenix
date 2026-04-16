# Scope Lock — COA-61 Seasons Update

## Locked In Scope
- Replace the old Club Training Information section in `src/pages/seasons.astro` with a new **Season Information** section.
- Render exactly 4 cards in order: Training, Uniforms, Clearances, Registration.
- Open modal dialogs per card with accessible semantics and keyboard support.
- Source Training modal content from `src/data/venues.ts`.
- Source Uniforms/Clearances/Registration image-card content from `src/data/season-info.ts`.
- Keep existing season tiles grid, financial assistance callout, and grading section intact.
- Ensure responsive behavior for section grid and modal sub-card grids.
- Ensure clearances image opens external URL in a new tab with safe rel attributes.

## Out of Scope
- Any backend/API integration.
- Changes to season tile business logic.
- Changes to unrelated tests failing in baseline (`resource-merge`, `events/parser`).
- New third-party dependencies.

## Acceptance Gate
Sign-off against `specs/coa-61-seasons-update/spec.md` acceptance criteria AC-01..AC-17 and success criteria SC-001..SC-009.
