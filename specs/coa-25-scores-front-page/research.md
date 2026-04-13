# Research: COA-25 Scores Front Page Carousel

## Scope Questions

1. How should auto-rotation + manual control be implemented without heavy dependencies?
2. How should 7-day data be sourced while preserving existing scraper patterns?
3. What should happen if deep-link details route is missing on this branch?

## Alternatives Considered

### A) CSS Scroll-Snap + imperative scrollLeft (chosen)
- **Pros**: lightweight, native scrolling behavior, good touch support, no new deps.
- **Cons**: requires careful index tracking and resize handling.

### B) Transform-only slider with absolute positioning
- **Pros**: deterministic per-frame animation behavior.
- **Cons**: more complex for responsive card counts and accessible browsing.

### C) Third-party carousel package
- **Pros**: faster initial implementation.
- **Cons**: violates dependency hygiene preference and may conflict with existing style patterns.

## Data Pipeline Options

### A) Extend existing scores scraper outputs (chosen)
- Reuse PlayHQ fetch and normalization patterns.
- Emit dedicated `home-games-data.json` tuned for 7-day homepage use.

### B) Fetch directly in client on homepage
- Rejected: poorer observability and violates preference for server-side authoritative artifact generation.

## Decisions

1. Use artifact-driven data flow for homepage carousel (same high-level pattern as prior score integrations).
2. Use deterministic looping behavior for both auto and manual navigation.
3. Treat missing details route as a planned compatibility checkpoint rather than blocking assumption.

## Open Questions (Non-Blocking)

- Exact auto-rotation interval default (spec allows medium/slow; choose constant in implementation and document).
- Number of cards visible at specific breakpoints can be finalized during UI tuning while preserving usability requirements.
