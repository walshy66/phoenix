# Scope Lock — COA-87 Home Page Score

## Locked Scope
- Hide the homepage score carousel by default on `/`.
- Preserve the existing `HomeScoresCarousel` implementation for future re-enablement.
- Keep the `/scores` page and `/scores/[gameId]` pages unchanged.
- Avoid reserved spacing, placeholder wrappers, and carousel bootstrapping when disabled.

## Out of Scope
- Rewriting the score carousel UI.
- Changing the `/scores` pages.
- Introducing new data sources or backend behavior.
- Adding new dependencies.
