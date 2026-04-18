# Implementation Plan: COA-43 Resources Update

**Branch**: cameronwalsh/coa-43-resources-update | **Date**: 2026-04-18 | **Spec**: specs/coa-43-resources-update/spec.md

---

## Summary

COA-43 enhances the Resources page (already scaffolded in COA-27/COA-33) with AND-logic filtering, keyboard-accessible search, and graceful degradation for incomplete metadata. The feature is static-site only — all filtering and search logic runs client-side on JSON data. No backend changes required.

Core improvements:
1. **AND-logic filtering** across Age, Category, and Skill (not OR)
2. **Keyword search** across title and description text (case-insensitive, ASCII-based)
3. **Section-aware filters** (Coaching/Player have filters; Manager/Guides/Forms are alphabetical only)
4. **Dynamic skill filters** that respect active Age/Category selections
5. **Graceful metadata handling** (resources with missing tags/descriptions still display)
6. **Enhanced UX** with result count display and detailed "No results" messaging showing active filters
7. **Error resilience** (malformed JSON files logged but don't crash the page)
8. **Keyboard + screen reader accessibility** (Tab, Space, Enter, aria-pressed, aria-live announcements)

---

## Technical Context

| Property | Value |
|----------|-------|
| **Language/Runtime** | TypeScript + Astro 5 (static site) |
| **UI Framework** | Astro components + vanilla JavaScript (no React needed) |
| **Storage** | JSON files in `src/data/` (human-editable) |
| **Build Process** | Astro static build |
| **Testing** | Vitest for logic; browser manual testing for UI |
| **Target Platform** | Web (mobile-responsive, 375px–1440px+) |
| **Performance Goal** | Filter/search within 100ms (debounced) |
| **Scale** | ~50–100 resources per section |

---

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| **I: User Outcomes First** | ✅ PASS | And-logic filtering & keyword search deliver measurable discovery improvements. Success criteria are testable. |
| **II: Test-First Discipline** | ✅ PASS | Filter/search logic can be unit-tested independently. Integration tests verify UI behavior. |
| **III: Backend Authority & Invariants** | ✅ PASS | No backend mutations. All filtering runs on immutable JSON data. Client cannot bypass invariants. |
| **IV: Error Semantics & Observability** | ✅ PASS | "No results" state is explicit. Incomplete metadata handled gracefully (not hidden). Console errors ruled out. |
| **V: AppShell Integrity** | ✅ PASS | Resources page uses existing BaseLayout. Filter UI overlays existing grid. No custom navigation. |
| **VI: Accessibility First** | ✅ PASS | Keyboard navigation (Tab, Space, Enter) for all controls. Search input accessible. Screen reader announcements for result count. WCAG 2.1 AA compliant. |
| **VII: Immutable Data Flow** | ✅ PASS | Filter state derived from user input only. No cached state. Data read-only, never written. |
| **VIII: Dependency Hygiene** | ✅ PASS | No new dependencies. Filtering uses native JavaScript array methods. |
| **IX: Cross-Feature Consistency** | ✅ PASS | Filters follow COA-27/COA-33 tab patterns. JSON data structure aligns with existing resources. |

**Compliance Status**: ✅ PASS — No violations identified.

---

## Project Structure

```
src/
├── data/
│   ├── coaching-resources.json       (updated schema: tags, type)
│   ├── player-resources.json         (updated schema: tags, type)
│   ├── manager-resources.json        (updated schema: minimal tags)
│   ├── guides.json                   (updated schema: minimal tags)
│   └── forms.json                    (new, if needed)
│
├── lib/
│   └── resources/
│       ├── types.ts                  (updated: Resource interface with tags.age/category/skill)
│       ├── filters.ts                (ENHANCED: filterByAge, filterByCategory, filterBySkill, searchByKeyword)
│       ├── logger.ts                 (unchanged)
│       └── skills.ts                 (NEW: dynamically extract available skills per section)
│
├── components/
│   ├── ResourceCard.astro            (unchanged)
│   ├── ResourceModal.astro           (unchanged)
│   └── FilterBar.astro               (ENHANCED: search input, skill filter row, clear button)
│
└── pages/
    └── resources/
        └── index.astro               (ENHANCED: and-logic filtering, search debounce, no-results state)

scripts/
└── seed-resources.js                 (HELPER: script to validate JSON structure and extract skills)

specs/coa-43-resources-update/
├── spec.md                           (requirements)
├── plan.md                           (this file)
├── data-model.md                     (JSON schema and examples)
├── contracts/                        (N/A — no API)
├── quickstart.md                     (manual test steps)
├── research.md                       (if questions arise)
└── tasks.md                          (atomic implementation tasks)
```

---

## Data Schema Changes

### Current Resource Interface

```typescript
// src/lib/resources/types.ts (simplified)
export interface Resource {
  id: string;
  title: string;
  description?: string;          // Optional
  audience: 'coaching' | 'players' | 'managers';
  category: string;              // Single string
  ageGroup: string;              // Single string
  type: 'pdf' | 'link' | 'video' | 'document';
  url: string;
  dateAdded: string;
}
```

### Enhanced Resource Interface

```typescript
export interface Resource {
  id: string;
  title: string;
  description?: string;                         // Optional
  section: 'coaching_resources' | 'player_resources' | 'manager' | 'guides' | 'forms';
  type: 'youtube_link' | 'image_png' | 'image_jpeg' | 'gif' | 'pdf' | 'external_link';
  url?: string;                                 // Optional for image assets with fileRef
  fileRef?: string;                             // New: asset storage pointer
  tags?: {                                      // New: optional
    age?: string[];                             // ['U8', 'U10', 'U12', 'U14', 'U16+']
    category?: string[];                        // Varies by section
    skill?: string[];                           // Custom per resource
  };
  createdAt: string;
  updatedAt: string;
}
```

### JSON Migration Strategy

**Phase 1 (Before Implementation)**:
- Audit existing JSON files
- Map old `audience` to new `section`
- Map old `category` (string) to new `tags.category` (array)
- Map old `ageGroup` (string) to new `tags.age` (array)
- Add `type` support for PNG/JPEG/GIF/PDF (not just `pdf` | `link` | `video`)

**Phase 2 (During Implementation)**:
- Update JSON files with new schema
- Add sample `skill` tags (derived from category initially)
- Validate schema with helper script

**Phase 3 (Post-Implementation)**:
- Document schema for human editing
- Provide examples in quickstart.md

---

## Filtering Algorithm & Logic

### Core Filter Function

```typescript
// src/lib/resources/filters.ts
export function filterResources(
  resources: Resource[],
  activeFilters: { age: string[]; category: string[]; skill: string[] },
  searchKeyword: string,
  section: string
): Resource[] {
  let results = resources.filter((r) => r.section === section);

  // Apply AND-logic: each active filter must match
  if (activeFilters.age.length > 0) {
    results = results.filter((r) =>
      r.tags?.age?.some((a) => activeFilters.age.includes(a))
    );
  }

  if (activeFilters.category.length > 0) {
    results = results.filter((r) =>
      r.tags?.category?.some((c) => activeFilters.category.includes(c))
    );
  }

  if (activeFilters.skill.length > 0) {
    results = results.filter((r) =>
      r.tags?.skill?.some((s) => activeFilters.skill.includes(s))
    );
  }

  // Apply keyword search (title + description)
  if (searchKeyword.trim().length > 0) {
    const lowerKeyword = searchKeyword.toLowerCase();
    results = results.filter((r) =>
      r.title.toLowerCase().includes(lowerKeyword) ||
      r.description?.toLowerCase().includes(lowerKeyword)
    );
  }

  // Sort based on section
  if (['manager', 'guides', 'forms'].includes(section)) {
    results.sort((a, b) => a.title.localeCompare(b.title)); // A–Z
  } else {
    results.sort((a, b) => {
      // createdAt descending, then title A–Z
      const dateCompare =
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return dateCompare !== 0 ? dateCompare : a.title.localeCompare(b.title);
    });
  }

  return results;
}
```

### Search Debouncing

Search input fires on:
- **Blur event** (user leaves field)
- **Enter key** (user presses Enter)

Debounce delay: 300ms (if typing continuously)

```typescript
function debounceSearch(fn: () => void, delay = 300) {
  let timeout: NodeJS.Timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
  };
}
```

---

## Phased Delivery

### Phase 1: Schema & Data (Days 1-2)
- [ ] Update `src/lib/resources/types.ts` with new Resource interface
- [ ] Migrate JSON files to new schema (tags.age, tags.category, tags.skill)
- [ ] Add new resource types (image_png, image_jpeg, gif, pdf, external_link, youtube_link)
- [ ] Validate JSON structure (create validation script)
- [ ] Update `coaching-resources.json`, `player-resources.json`, `manager-resources.json`, `guides.json`

**Deliverable**: All JSON files conform to new schema; no compilation errors.

### Phase 2: Filter Logic (Days 3-4)
- [ ] Enhance `src/lib/resources/filters.ts` with AND-logic filtering
- [ ] Add `filterByAge()`, `filterByCategory()`, `filterBySkill()` functions
- [ ] Add `searchByKeyword()` function
- [ ] Create `extractAvailableSkills()` helper (dynamic skill discovery)
- [ ] Write unit tests for filtering logic (Vitest)

**Deliverable**: Filter functions tested; logic verifiable without UI.

### Phase 3: UI Components & Page Logic (Days 5-7)
- [ ] Update `src/pages/resources/index.astro`:
  - Add search input field (coaching/player sections only)
  - Add skill filter row (dynamic from data, respecting active Age/Category filters)
  - Implement AND-logic filtering state
  - Add debounced search handler (300ms, ASCII-based, case-insensitive)
  - Add result count display above grid (FR-021: "X resources found")
  - Add "No results" state with detailed message showing active filters (FR-020)
  - Add error handling for malformed JSON files (FR-019: log but don't crash)
  - Add clear button with "Clear all filters and search" text
- [ ] Update `src/components/FilterBar.astro`:
  - Add search input with keyboard accessibility
  - Add skill filter buttons with aria-pressed attributes
  - Add active filter summary
  - Ensure sticky header max 15% viewport height on mobile (NFR-003)
- [ ] Implement filter state management (vanilla JS, no React)
- [ ] Implement screen reader announcements (aria-live region for result count)

**Deliverable**: Filters and search working in browser; tab navigation functional; result counts and error handling in place.

### Phase 4: Keyboard & Accessibility (Days 8-9)
- [ ] Implement keyboard navigation for filter buttons (Tab, Shift+Tab)
- [ ] Implement Space/Enter to toggle filter state with aria-pressed updates
- [ ] Verify aria-pressed attributes correctly reflect active/inactive states (NFR-002)
- [ ] Verify screen reader announcements (result count updates, filter state via aria-pressed)
- [ ] Test focus indicators on all controls (`:focus-visible`)
- [ ] Test on 375px, 768px, 1440px viewports
- [ ] Verify sticky header height constraint (max 15% viewport on 375px)
- [ ] Verify dynamic skill filters only show skills from age/category-matched resources

**Deliverable**: Full keyboard nav with aria-pressed; screen reader compatible; mobile UX verified.

### Phase 5: Testing & Documentation (Days 10)
- [ ] Create unit tests for filter logic (AND-logic, search, skill extraction)
- [ ] Create integration tests for page interactions (filter/search flows)
- [ ] Test dynamic skill filtering respects active Age/Category (Change 4 behavior)
- [ ] Test error handling for malformed JSON files (FR-019)
- [ ] Test aria-pressed attributes on filter buttons (NFR-002)
- [ ] Test result count display and no-results messaging with active filters (FR-020, FR-021)
- [ ] Update quickstart.md with manual test steps
- [ ] Document data schema in data-model.md
- [ ] Test edge cases (empty filters, missing tags, no JSON files, etc.)
- [ ] Test mobile responsiveness (375px header height constraint)

**Deliverable**: 80%+ test coverage; all new clarifications verified; quickstart guide ready.

---

## Testing Strategy

### Unit Tests (Vitest)
- Filter functions with various active filter combinations
- Search keyword matching (partial, case-insensitive)
- AND-logic correctness (multiple filters + search)
- Edge cases: empty tags, missing description, no matching resources

**Example**:
```typescript
describe('filterResources', () => {
  it('returns resources matching all active filters (AND-logic)', () => {
    const filters = { age: ['U12'], category: ['Defence'], skill: [] };
    const result = filterResources(mockResources, filters, '', 'coaching_resources');
    expect(result).toContainEqual(expect.objectContaining({ title: 'U12 Defence' }));
  });

  it('combines search and filter with AND-logic', () => {
    const filters = { age: ['U12'], category: [], skill: [] };
    const result = filterResources(mockResources, filters, 'press', 'coaching_resources');
    expect(result.every(r => r.tags?.age?.includes('U12'))).toBe(true);
    expect(result.every(r => r.title.toLowerCase().includes('press') || r.description?.toLowerCase().includes('press'))).toBe(true);
  });
});
```

### Integration Tests (Browser)
- Filter state persists during tab switching
- Search input debounces correctly (300ms)
- No results message appears with detailed filter description and clears properly (FR-020)
- Result count displays above grid when filters/search active (FR-021)
- Dynamic skill filters update when Age/Category filters change (Change 4)
- Keyboard navigation works (Tab, Space, Enter)
- aria-pressed attributes update when filters toggled
- Error gracefully handled if JSON file is missing/malformed (FR-019)
- Mobile header respects 15% height constraint on 375px viewport (Change 10)
- Screen reader announces result count

### Manual Testing (Browser)
- Test on Coaching Resources tab: apply filters, verify AND-logic
- Test on Player Resources tab: verify different category values
- Test on Guides/Manager/Forms tabs: verify no filters shown, alphabetical sort
- Test keyboard navigation: Tab to filters, Space to toggle
- Test search: type "defence", verify results match
- Test responsive: open on 375px, 768px, 1440px

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| **JSON schema migration breaks existing data** | Validate with helper script before deployment; keep old data files as backup. |
| **Filter logic is slow (>100ms)** | Test with 1000 resources; optimize array operations if needed. |
| **Keyboard navigation not working for some controls** | Test with keyboard only (no mouse) on all browsers. |
| **Screen reader doesn't announce results** | Use aria-live region; test with NVDA/JAWS. |
| **Skills list grows too large in UI** | Limit to top 10 most common skills, or use search input for skill filter. |
| **Search matches too many results (noisy)** | Use exact substring matching, not fuzzy; document behavior in quickstart. |

---

## Success Criteria Checklist

- [ ] **SC-001**: AND-logic filtering works (U12 + Defence = only resources with both tags)
- [ ] **SC-002**: Keyword search matches partial text (case-insensitive, ASCII-based); combines with filters correctly
- [ ] **SC-003**: Removing a filter updates results immediately (no page reload)
- [ ] **SC-004**: Unfiltered sections (Manager, Guides, Forms) display alphabetically, no filters visible
- [ ] **SC-005**: Resources with only title and type display correctly in all views
- [ ] **SC-006**: No results state appears with message describing active filters (e.g., "No resources match Age=U12 and Category=Defence"); "Clear all filters and search" button works
- [ ] **SC-007**: Result count displays above grid when filters/search active (e.g., "4 resources found")
- [ ] **SC-008**: Dynamic skill filters respect active Age/Category selections (don't show skills that would produce zero matches)
- [ ] **SC-009**: Keyboard nav works (Tab, Space, Enter); filter buttons have aria-pressed="true/false"; screen reader announces count and filter state
- [ ] **SC-010**: Filter bar sticky on 375px viewport, header max 15% height; filters wrap but no horizontal scroll
- [ ] **SC-011**: Malformed JSON files logged to console but don't crash page; empty section displays gracefully
- [ ] **SC-012**: No console errors during filter/search operations; all edge cases handled

---

## Dependencies & Imports

### No New Dependencies Required
- Filtering: native JavaScript array methods (`filter`, `some`, `sort`)
- Search: native string methods (`toLowerCase`, `includes`)
- Accessibility: Astro + vanilla JS, no special libs

### Existing Imports to Use
```typescript
import { filterByAge, filterByCategory, filterBySkill, searchByKeyword } from '../../lib/resources/filters';
import coachingResources from '../../data/coaching-resources.json';
import playerResources from '../../data/player-resources.json';
```

---

## Next Steps

1. **Spec Review**: Confirm schema and filtering algorithm align with business needs
2. **Phase 1**: Begin data schema migration and JSON validation
3. **Phase 2**: Implement filter logic and unit tests
4. **Phase 3-5**: Build UI, test accessibility, document

---

## Handover & Maintenance

After launch, coaches can add resources via JSON:

**Example**:
```json
{
  "id": "coaching-050",
  "title": "Full Court Press Drills",
  "type": "pdf",
  "fileRef": "assets/coaching/full-court-press-drills.pdf",
  "description": "Step-by-step drills for teaching full-court press coverage.",
  "section": "coaching_resources",
  "tags": {
    "age": ["U14", "U16+"],
    "category": ["Defence", "Drills"],
    "skill": ["Positioning", "Communication"]
  },
  "createdAt": "2026-04-18T10:00:00Z",
  "updatedAt": "2026-04-18T10:00:00Z"
}
```

No code changes required; content appears on next page load.

---

## Key Technical Decisions

### Decision 1: AND-Logic Filtering
- **Rationale**: AND-logic is more useful for discovery than OR. A coach searching for "U12 + Defence" gets 5 relevant results, not 50 mixed results.
- **Trade-off**: Users need to understand filter semantics (all active filters apply).
- **Mitigation**: Label filter bar with "Filter by age, category, or skill" and show active filters clearly.

### Decision 2: Client-Side Only (No Backend)
- **Rationale**: Resources are static and human-editable. Backend would add complexity without value.
- **Trade-off**: Search is limited to title + description (no full-text indexing). Scales to ~1000 resources before noticeable slowdown.
- **Mitigation**: Use debouncing (300ms) to avoid excessive re-renders; test with 500+ resources.

### Decision 3: Dynamic Skill Discovery
- **Rationale**: Skills vary per resource and per section. Rather than hardcoding them, extract from data.
- **Trade-off**: Requires validation script to catch typos in JSON.
- **Mitigation**: Provide schema validation as part of deployment checklist.

### Decision 4: No Search in Unfiltered Sections
- **Rationale**: Guides, Forms, Manager sections are reference material; alphabetical sort is sufficient.
- **Trade-off**: Users cannot search these sections. Can be added in future feature if needed.
- **Mitigation**: Document in quickstart; mention as future enhancement.

### Decision 5: Graceful Degradation for Incomplete Metadata
- **Rationale**: Allows coaches to add resources incrementally without requiring all tags upfront.
- **Trade-off**: Resources without tags won't match active filters; might confuse users.
- **Mitigation**: Document in data-model.md; provide examples showing tag structure.

---

## Related Features

- **COA-27** (Resources Modal): Displays resources in modal. COA-43 filters this source.
- **COA-33** (Resources Menu): Provides tab structure and initial layout. COA-43 enhances filtering within that structure.
- **COA-26** (Documents): Delivers Guides and Forms. COA-43 ensures alphabetical sorting here.

---

## Notes for Implementation Team

1. **Filter state persistence**: Do NOT persist across page reloads (unless localStorage is explicitly added in a future feature).
2. **Search debouncing**: 300–500ms is sufficient; longer delays feel laggy.
3. **Keyboard focus**: Ensure focus ring is visible on all filter buttons and search input.
4. **Screen reader testing**: Use NVDA (Windows) or VoiceOver (Mac); verify result count is announced.
5. **Mobile testing**: Test on actual 375px device (e.g., iPhone SE); filter bar should wrap, not overflow.
6. **Performance baseline**: Measure filter + search time with 500 resources; target <100ms.
7. **No console errors**: Use browser devtools; fix any warnings or errors before merge.

