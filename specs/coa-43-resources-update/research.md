# Research: COA-43 Resources Update

---

## Overview

This document captures research, decisions, and alternatives considered during the planning phase of COA-43.

---

## Open Questions

### Q1: Should search be case-sensitive or case-insensitive?

**Status**: RESOLVED

**Decision**: Case-insensitive search (e.g., "defence", "Defence", "DEFENCE" all match).

**Rationale**:
- Users don't think about case when searching
- Coaches searching for "ball handling" should find "Ball Handling"
- Industry standard for web search

**Alternatives Considered**:
1. **Case-sensitive**: More performant, simpler implementation. Rejected because users expect case-insensitive.
2. **Fuzzy matching**: More forgiving (typos), but slower. Deferred to future feature.

---

### Q2: Should search be exact match or partial match?

**Status**: RESOLVED

**Decision**: Partial string match (e.g., "press" matches "Full Court Press Drills").

**Rationale**:
- More useful for discovery
- Users don't memorize exact resource titles
- Coaches searching "press" should find "Full Court Press" resources

**Alternatives Considered**:
1. **Exact phrase match**: Stricter, fewer false positives. Rejected because too rigid.
2. **Fuzzy/Levenshtein distance**: Handles typos, more permissive. Deferred to future.

---

### Q3: Should filters use AND-logic or OR-logic?

**Status**: RESOLVED

**Decision**: AND-logic (all active filters must match).

**Rationale**:
- AND-logic is more useful for refinement
- Coaches searching "U12 + Defence" want resources for under-12 defense, not all under-12 OR all defense
- Reduces result set to most relevant items
- Spec explicitly requires AND-logic (FR-003)

**Alternatives Considered**:
1. **OR-logic**: Broader results, less refinement. Rejected per spec.
2. **Mixed mode**: Different logic per category (e.g., Age is OR, Category is AND). Too confusing; rejected.

---

### Q4: Should skill tags be hardcoded or dynamically derived?

**Status**: RESOLVED

**Decision**: Dynamically derived from resource data.

**Rationale**:
- Coaches can add new skills without code changes
- Avoids outdated hardcoded lists
- Scales with resource library
- Aligns with static-site, human-editable philosophy

**Implementation**:
```typescript
// Extract all unique skill values from all resources in a section
function extractAvailableSkills(resources: Resource[], section: string): string[] {
  const skills = new Set<string>();
  resources
    .filter((r) => r.section === section)
    .forEach((r) => {
      r.tags?.skill?.forEach((s) => skills.add(s));
    });
  return Array.from(skills).sort(); // A–Z order
}
```

**Alternatives Considered**:
1. **Hardcoded list in code**: Simple, predictable. Rejected because requires code change to add skill.
2. **User-submitted skills via form**: More flexible, but adds backend complexity. Deferred to future.

---

### Q5: Should filter state persist across page reloads?

**Status**: RESOLVED

**Decision**: NO. Filters reset on page reload.

**Rationale**:
- Simpler implementation (no localStorage)
- Coaches expect fresh view after reload
- Static site philosophy (immutable data)
- Can be added later as enhancement

**Alternatives Considered**:
1. **localStorage persistence**: User-friendly, but adds complexity. Deferred to future feature.
2. **URL query params** (e.g., `?age=U12&category=Defence`): Shareable, bookmarkable. Considered for future.

---

### Q6: What should the "No results" message say?

**Status**: RESOLVED

**Decision**: "No results found" with a "Clear all filters" button.

**Rationale**:
- Clear and actionable
- Button lets users easily reset
- Doesn't blame the user

**Example**:
```
No results found

Try adjusting your filters or search term. 
[Clear all filters]
```

**Alternatives Considered**:
1. **Verbose message**: "We couldn't find any resources matching your filters..." Rejected as too wordy.
2. **No button**: Just message. Rejected because users need a way to reset.

---

### Q7: Should unfiltered sections (Manager, Guides, Forms) have search?

**Status**: RESOLVED

**Decision**: NO. Search only in Coaching/Player Resources sections.

**Rationale**:
- Guides and Forms are reference material; alphabetical sort is sufficient
- Keeps UI simple for less-complex sections
- Can add search later if needed
- Spec allows section-specific rules (FR-014)

**Alternatives Considered**:
1. **Add search everywhere**: More powerful, but adds noise to simpler sections. Deferred to future.
2. **Hidden search (Ctrl+F)**: Browser's built-in search is sufficient.

---

### Q8: How should image aspect ratios be handled?

**Status**: RESOLVED

**Decision**: CSS `aspect-ratio` property with `object-fit: contain`.

**Rationale**:
- Maintains original aspect ratio
- No letterboxing or distortion
- Works in modern browsers (99.7% support)
- Simple CSS, no JavaScript needed

**Implementation**:
```css
.resource-image {
  aspect-ratio: 16 / 9; /* or auto, depending on use case */
  object-fit: contain;
  width: 100%;
  height: 100%;
}
```

**Alternatives Considered**:
1. **Hardcoded fixed dimensions**: Simple, but distorts images. Rejected.
2. **JavaScript dynamic sizing**: Overkill for static images. Rejected.
3. **`object-fit: cover`**: Crops images. Rejected; `contain` is better.

---

### Q9: Should incomplete resources (missing tags) appear in unfiltered views?

**Status**: RESOLVED

**Decision**: YES. Resources with missing tags display in unfiltered sections.

**Rationale**:
- Allows coaches to add resources incrementally
- No need to wait for complete metadata
- Graceful degradation per spec (FR-015)
- Resources hidden only if filter explicitly excludes them (missing tag)

**Example**:
- Guides tab (no filters): Resource displays
- Coaching Resources (no filters): Resource displays
- Coaching Resources (U12 filter): Resource hidden (no age tag = doesn't match)

**Alternatives Considered**:
1. **Hide resources with missing tags**: Forces complete metadata upfront. Rejected; too strict.
2. **Warn user about incomplete data**: Adds clutter. Rejected.

---

### Q10: Should the search input be debounced, throttled, or real-time?

**Status**: RESOLVED

**Decision**: Debounced (300ms delay after user stops typing).

**Rationale**:
- Avoids excessive re-renders while typing
- Feels responsive (not laggy)
- 300ms is imperceptible to users
- Balances performance and UX

**Implementation**:
```typescript
const debouncedSearch = debounce(() => {
  const results = filterResources(
    resources,
    activeFilters,
    searchKeyword,
    currentSection
  );
  updateResults(results);
}, 300);
```

**Alternatives Considered**:
1. **Real-time (no debounce)**: Responsive, but could cause lag with 500+ resources. Rejected for performance.
2. **Throttle instead**: Updates on fixed interval (e.g., every 300ms). Debounce is better for search.
3. **Search only on blur/Enter**: Less discoverable, requires explicit action. Debounce is better.

---

## Alternatives Considered

### Alternative 1: Backend-Driven Filtering (Rejected)

**Idea**: Move filtering logic to a backend API (FastAPI, Node, etc.).

**Pros**:
- Full-text search with indexing (fast for large datasets)
- Can cache results
- More scalable for 10k+ resources

**Cons**:
- Adds backend complexity
- Requires database
- Violates static-site philosophy
- Slower than local filtering (network latency)
- More infrastructure to maintain

**Decision**: REJECTED. Static-site approach is sufficient for current scale (50–100 resources).

---

### Alternative 2: OR-Logic Filtering (Rejected)

**Idea**: Use OR-logic instead of AND-logic.

**Example**: "U12" OR "Defence" displays any resource tagged with either.

**Pros**:
- Broader result set
- Simpler to understand for some users

**Cons**:
- Less useful for refinement
- Too many results (noisy)
- Spec explicitly requires AND-logic
- Coaches want specific results, not broad categories

**Decision**: REJECTED per spec (FR-003).

---

### Alternative 3: Fuzzy Matching for Search (Rejected)

**Idea**: Implement fuzzy search (e.g., "dfence" matches "defence").

**Pros**:
- Forgiving of typos
- More discoverable

**Cons**:
- More complex algorithm
- Slower performance
- User still types keyword; most don't have typos
- Can be added later if users request

**Decision**: DEFERRED to future feature (COA-XX). Current partial-match is sufficient.

---

### Alternative 4: Hierarchical Filters (Rejected)

**Idea**: Group filters by type (Age, Category, Skill) with collapsible sections.

**Pros**:
- Cleaner UI for 20+ filter options
- Better organization

**Cons**:
- More complex UI logic
- Takes up more vertical space on mobile
- Current flat layout is fine for current data volume
- Can be added later if filters grow significantly

**Decision**: DEFERRED to future feature.

---

### Alternative 5: URL Query Params for Sharing (Rejected)

**Idea**: Encode active filters in URL (e.g., `/resources?age=U12&category=Defence`).

**Pros**:
- Shareable filter configurations
- Bookmarkable searches
- Better for collaboration

**Cons**:
- More complex URL parsing logic
- State management complexity
- Not required for MVP
- Can be added later if users request

**Decision**: DEFERRED to future feature (COA-XX).

---

### Alternative 6: Filter Presets (Rejected)

**Idea**: Offer pre-made filter combinations (e.g., "U12 Beginner", "U16+ Advanced").

**Pros**:
- Faster discovery for common use cases
- Educational (shows common combinations)

**Cons**:
- Adds maintenance burden (updating presets)
- Not required for MVP
- AND-logic filters are flexible enough
- Can be added later if analytics show common patterns

**Decision**: DEFERRED to future feature.

---

## Technology Decisions

### Decision 1: Client-Side Filtering (JavaScript)

**Why**: Static site, immutable JSON data.

**Technology**: Vanilla JavaScript (no React, no Vue, no heavy libraries).

**Rationale**:
- Resources are JSON files, not API endpoints
- No state management library needed
- Astro handles SSR; client hydration for interactivity
- No new dependencies required

**Alternatives**:
- Use React for filtering UI (rejected: overkill for this feature)
- Use Alpine.js (rejected: not in stack; vanilla JS is simpler)

---

### Decision 2: JSON Storage (No Database)

**Why**: Content is human-editable, coach-managed.

**Format**: Human-readable JSON in `src/data/`.

**Rationale**:
- Coaches can add resources via copy-paste
- No database admin required
- Version-controlled in Git
- Easy to review changes
- Spec requires this (NFR-007)

**Alternatives**:
- SQL database (rejected: overkill, requires backend)
- Headless CMS (rejected: adds complexity, requires login)

---

### Decision 3: Dynamic Skill Extraction

**Why**: Skills vary per resource; no fixed list.

**Implementation**: Extract from JSON at build time or runtime.

**Rationale**:
- Coaches add new skills without code changes
- No hardcoded lists to maintain
- Scales with resource library

**Code**:
```typescript
function extractAvailableSkills(resources: Resource[], section: string): string[] {
  const skills = new Set<string>();
  resources
    .filter((r) => r.section === section)
    .forEach((r) => {
      r.tags?.skill?.forEach((s) => skills.add(s));
    });
  return Array.from(skills).sort();
}
```

---

### Decision 4: Debounced Search

**Why**: Avoid excessive re-renders while typing.

**Delay**: 300ms.

**Implementation**: Custom debounce function.

**Rationale**:
- 300ms is imperceptible to users
- Reduces CPU load with large datasets
- Standard practice in search UIs
- No external library needed (native JavaScript)

---

### Decision 5: No Persistence (localStorage)

**Why**: Simpler, aligns with static-site philosophy.

**Behavior**: Filters reset on page reload.

**Rationale**:
- MVP doesn't require persistence
- Coach opens resources page fresh each time
- localStorage adds complexity
- Can be added later if users request

---

## Performance Considerations

### Baseline Performance Targets

- **Filter operation**: <100ms for 500 resources
- **Search operation**: <100ms for 500 resources (with debounce)
- **Combined (filter + search)**: <100ms
- **DOM update**: <50ms (browser rendering)

### Optimization Strategies

1. **Array Operations**: Use native methods (`filter`, `some`, `sort`).
2. **Debouncing**: Avoid re-render thrashing.
3. **Caching**: Can cache available skills if extracted at build time.
4. **Lazy Loading**: If resource grid grows, use virtual scrolling (future).

### Testing Methodology

```javascript
const start = performance.now();
const results = filterResources(...);
const end = performance.now();
console.log(`Filter took ${end - start}ms`);
```

---

## Accessibility Considerations

### WCAG 2.1 AA Compliance Goals

1. **Keyboard Navigation (WCAG 2.1 2.1.1)**
   - All interactive controls reachable via Tab
   - Filter buttons toggleable via Space/Enter
   - Search input accessible

2. **Focus Indicators (WCAG 2.1 2.4.7)**
   - Visible focus ring on all controls
   - Contrast ratio >= 3:1

3. **Screen Reader Announcements (WCAG 2.1 4.1.3)**
   - Result count announced when filters change
   - Active filters announced
   - Button state announced

4. **Color Contrast (WCAG 2.1 1.4.3)**
   - Text: >= 4.5:1 ratio (normal)
   - Large text: >= 3:1 ratio
   - UI components: >= 3:1 ratio

### Implementation Details

- Use `aria-live="polite"` for result count updates
- Use `aria-pressed` for toggle buttons
- Use semantic HTML (`button`, `label`, `fieldset`)
- Provide visible focus indicators (Tailwind `focus:ring-2`)

---

## Security Considerations

### Threats

1. **Malicious JSON**: Coach edits JSON, adds `<script>` tag.
   - **Mitigation**: Astro sanitizes content; JSON is data-only.

2. **XSS via Resource Titles/Descriptions**: Coach adds HTML in title.
   - **Mitigation**: Astro escapes content by default; `.innerHTML` avoided.

3. **URL Injection**: Coach adds malicious URL in resource.
   - **Mitigation**: Astro validates URLs; link handlers check protocol.

### Validation

- Validate JSON schema at build time (create `scripts/validate-resources.js`)
- Reject resources with invalid URLs or file paths
- Test with malicious payloads (e.g., `"; DROP TABLE--`, `<img onerror=alert('xss')>`)

---

## Scalability Notes

### Current Scale
- ~50–100 resources per section
- Filter/search completes in <10ms

### Future Scale (1000+ resources)
- May need optimization:
  - **Virtual scrolling**: Only render visible items
  - **Indexing**: Pre-compute available filters
  - **Pagination**: Show 50 results per page
  - **API backend**: Full-text search engine (Elasticsearch, etc.)

### When to Upgrade

- If average filter time > 100ms, optimize
- If UI feels sluggish on mobile, consider virtual scrolling
- If coaches report slow searches, implement backend search

---

## Summary

All major decisions are **RESOLVED** and documented above. No blockers identified. Implementation can proceed with confidence.

**Key Decisions Recap**:
1. AND-logic filtering (per spec)
2. Case-insensitive, partial-match search
3. Debounced search (300ms)
4. Dynamic skill extraction
5. Client-side filtering (no backend)
6. JSON storage (no database)
7. No persistence (fresh on reload)
8. Unfiltered sections have no search (Manager, Guides, Forms)
9. Graceful degradation for incomplete metadata
10. Image aspect ratio via CSS (`aspect-ratio` + `object-fit`)

