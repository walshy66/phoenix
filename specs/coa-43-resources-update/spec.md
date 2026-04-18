# Spec: COA-43 — Resources Page Update

**Status**: READY_FOR_DEV
**Source**: COA-43 (Linear)
**Priority**: P1

## Summary

This feature enhances the existing Resources page (delivered in COA-27 and COA-33) with:

1. **Keyboard search / keyword filtering** across all resource title and description text
2. **AND-logic filtering** (not OR): Multiple filter selections across Age, Category, and Skill act as independent filters — resources must match ALL active filters to display
3. **Enhanced content types and metadata** supporting PNG/JPEG/GIF/PDF alongside existing YouTube and external links
4. **Six-section layout**: Coaching Resources, Player Resources, Manager, Guides, and Forms sections, each with distinct filter rules
5. **Graceful degradation**: Resources render with title and type only; optional metadata (description, tags) is incomplete-friendly

The page remains static (no backend database). All content is human-readable JSON. No custom code is required to add resources — content additions are copy-paste-friendly post-launch.

---

## User Scenarios & Testing

### User Story 1 — Coach narrows results with AND-logic filters (Priority: P1)

A coach on the Coaching Resources page applies filters for "U12" and "Defence". The page shows only resources that have BOTH tags — not resources tagged with either one, but both. If the coach adds a third filter for "Ball Handling", only resources tagged with Age=U12 AND Category=Defence AND Skill=Ball Handling appear. Removing a filter immediately updates the list.

**Why this priority**: AND-logic filtering is more useful for discovery than OR-logic. A coach looking for age+category+skill-specific content gets fewer, more relevant results. This is the core filtering improvement.

**Independent Test**: Apply filters for U12, Defence, and Ball Handling. Verify only resources with all three tags display. Remove the Skill filter. Verify resources with U12 and Defence (regardless of Skill) now display.

**Acceptance Scenarios**:
1. **Given** a coach has selected "U12" and "Defence" filters, **When** the page updates, **Then** only resources tagged with both Age="U12" AND Category="Defence" appear (not resources with only one tag)
2. **Given** a coach selects three filters (Age, Category, Skill), **When** the results update, **Then** resources must match all three filter values to display
3. **Given** filters are active and the coach removes one filter, **When** the page re-filters, **Then** resources matching the remaining filters immediately display without page reload
4. **Given** no filters match any resources, **When** the page renders, **Then** a "No results" message displays with a clear "Clear all filters" button to reset the view

---

### User Story 2 — Coach searches resources by keyword (Priority: P1)

A coach is on the Coaching Resources page and searches for "full court press". The system searches across resource titles and descriptions, displaying only resources containing that phrase. Keyword search works independently of filters — a coach can search AND filter simultaneously.

**Why this priority**: Keyword search unlocks discovery for users who know what they want but don't know which age/category/skill tags apply. Combined with filters, it provides fast access to specific content.

**Independent Test**: Type "defence" into the search box. Verify only resources with "defence" in title or description appear. Then apply a "U12" filter. Verify results are AND'd: only resources matching "defence" text AND U12 age tag display.

**Acceptance Scenarios**:
1. **Given** a coach types a keyword in the search box, **When** they press Enter or the input blur event fires, **Then** resources are filtered to only those containing the keyword in title or description (case-insensitive)
2. **Given** filters are active and the coach types a keyword, **When** the results update, **Then** resources must match BOTH the active filters AND contain the keyword
3. **Given** search results in no matches, **When** the page renders, **Then** a "No results" message displays; clearing the search or filters restores the full list
4. **Given** the coach clears the search box, **When** the input becomes empty, **Then** all matching filtered resources (or all resources if no filters active) immediately display again

---

### User Story 3 — Different sections have different filter availability (Priority: P1)

Manager, Guides, and Forms sections have no filters — only alphabetical sorting. Coaching and Player Resources have age/category/skill filters. A coach opening the Guides tab sees a simple alphabetically sorted list with no filter bar.

**Why this priority**: Different audiences have different information needs. Guides and Forms are reference material that don't benefit from filtering; streamlining the UI for these sections improves usability.

**Independent Test**: Open the Coaching Resources tab and verify filters are present. Open the Guides tab and verify no filters are shown, only an alphabetical list.

**Acceptance Scenarios**:
1. **Given** a coach views the Coaching Resources tab, **When** they look at the page, **Then** filter controls for Age, Category, and Skill are visible
2. **Given** a coach opens the Player Resources tab, **When** they look at the page, **Then** filter controls for Age, Category, and Skill are visible (with Player-specific category values)
3. **Given** a coach opens the Manager, Guides, or Forms tabs, **When** they look at the page, **Then** no filter controls are displayed; resources are sorted alphabetically by title
4. **Given** resources in unfiltered sections (Manager/Guides/Forms), **When** the page renders, **Then** they appear in ascending alphabetical order by title

---

### User Story 4 — Resources degrade gracefully with incomplete metadata (Priority: P2)

A resource in the data file has a title and type, but is missing description and tags (age, category, skill). It still displays on the Resources page and is not filtered out. It will match keyword searches if the title is relevant. It will display in unfiltered sections. It will be hidden only in sections where a filter is active that would exclude it (e.g., Coaching Resources with U12 filter active — the resource with no age tag is hidden because it doesn't have the U12 tag).

**Why this priority**: Allows content to be added iteratively without requiring all metadata upfront. A coach can add a guide today even if they don't have time to tag it with age groups — it still shows up in the unfiltered views, and can be tagged later.

**Independent Test**: Create a resource with only title and type. Verify it displays in unfiltered sections (Guides, Forms, Manager) and in filtered sections with no filters active. Verify it is hidden if a filter is active (because it lacks the tag). Verify it appears in keyword search if the title matches.

**Acceptance Scenarios**:
1. **Given** a resource is missing description and tags, **When** the Guides tab renders, **Then** the resource displays with its title and type (no "empty" states from missing metadata)
2. **Given** a resource lacks age/category tags and Coaching Resources is viewed with no filters active, **When** the page renders, **Then** the resource displays
3. **Given** the same resource and Coaching Resources is viewed with "U12" filter active, **When** the page filters, **Then** the resource is hidden (because it lacks the U12 age tag and thus doesn't match the filter)
4. **Given** a resource's title contains the search keyword, **When** a coach searches, **Then** the resource appears in results even if description is empty or tags are incomplete

---

## Requirements

### Functional Requirements

**Content Types**
- **FR-001**: System MUST support the following resource types: `youtube_link`, `image_png`, `image_jpeg`, `gif`, `pdf`, `external_link`
- **FR-002**: System MUST treat all types as displayable in the modal (video embeds, image previews, PDF embeds, direct links); the modal behaviour is already specified in COA-27

**Filtering Logic (AND-Logic)**
- **FR-003**: System MUST apply AND-logic filtering: a resource displays only if it matches ALL active filters (age AND category AND skill)
- **FR-004**: When no filters are active, System MUST display all resources in the relevant section
- **FR-005**: When one or more filters are active, System MUST display only resources that have tags matching all active filter selections
- **FR-006**: Removing a filter MUST immediately re-filter results; no page reload is required

**Keyword Search**
- **FR-007**: System MUST provide a search input field in filtered sections (Coaching Resources, Player Resources)
- **FR-008**: Search MUST be case-insensitive and match partial strings in resource title or description. Matching MUST be ASCII-based (no diacritical normalization); searching "defence" matches "defence" but not "défence".
- **FR-009**: Keyword search MUST be combined with active filters using AND-logic: resources must match both the filters and contain the keyword
- **FR-010**: Clearing the search box MUST immediately restore all filtered results (or all resources if no filters active)
- **FR-011**: Search input MUST be debounced or triggered on blur to avoid excessive re-renders

**Section-Specific Filter Rules**
- **FR-012**: Coaching Resources section MUST have filter controls for: Age (U8, U10, U12, U14, U16+), Category (Defence, Drills, Offence, Plays, Tools), Skill (varies by resource; all present skills displayed as filter options)
- **FR-013**: Player Resources section MUST have filter controls for: Age (U8, U10, U12, U14, U16+), Category (Solo, Group, Offence, Defence, Drill), Skill (varies by resource; all present skills displayed as filter options)

  **NOTE**: Category values differ by section. Coaching Resources uses "Drills" (plural); Player Resources uses "Drill" (singular). "Tools" appears only in Coaching Resources. These are distinct taxonomies; do not mix across sections.

- **FR-014**: Manager, Guides, and Forms sections MUST NOT display filter controls; resources in these sections MUST be sorted alphabetically by title (A–Z)

**Metadata Handling**
- **FR-015**: System MUST render resources that have only title and type; description and tags are optional
- **FR-016**: If a resource lacks any tag required by an active filter, the resource MUST be excluded. Example: If "U12" filter is active and resource has no age tag, resource is hidden. If no age filter is active, resources with or without age tags are included.
- **FR-017**: If a resource has a tag value that is not in the active filter set, but the active filter is empty, the resource MUST be included (e.g., a resource with Skill="Ball Handling" displays even if no Skill filter is selected)

**No Results State**
- **FR-018**: When filters or search produce zero matching resources, System MUST display a "No results found" message with a visible button or link to clear all filters and restore the full list
- **FR-019**: If resource JSON files cannot be loaded or are malformed, System MUST log error to console and display an empty section (no crash, no infinite loading state)

**No Results UX**
- **FR-020**: When filters or search produce zero matching resources, the resource grid area MUST display a centered "No results found" message with:
  - Clear text describing what filters are active (e.g., "No resources match Age=U12 and Category=Defence")
  - A visible "Clear all filters and search" button or link that resets all filters and search box
  - No grid cells or placeholder images displayed

**Result Count Display**
- **FR-021**: When search or filters are active, System MUST display the count of matching resources above the grid (e.g., "4 resources found").
When no filters or search are active, this count is optional or hidden.

### Non-Functional Requirements

- **NFR-001 (Keyboard accessibility — Search)**: The search input MUST be keyboard accessible with clear focus indicator; Tab must reach it; Enter and blur events trigger search
- **NFR-002 (Keyboard accessibility — Filters)**: Filter buttons MUST be navigable via Tab, Shift+Tab, and Space/Enter to toggle state. Selected filters MUST have BOTH: visual indicator (e.g., background color change, border highlight, or filled background) AND ARIA attribute aria-pressed="true". Unselected filters MUST have aria-pressed="false".
- **NFR-003 (Responsive — Mobile)**: Both search input and filter bar MUST remain sticky and usable on 375px viewport. If combined into one sticky header, that header may not exceed 15% of viewport height. Filters may wrap to multiple lines but MUST be accessible without horizontal scroll.
- **NFR-004 (Responsive — Aspect ratios)**: Image and GIF resources MUST maintain original aspect ratios in grid view without letterboxing or distortion
- **NFR-005 (Accessibility — Results list)**: Search and filter results MUST be announced to screen readers; a live region MUST announce "N results found" when filters change
- **NFR-006 (Performance)**: Filter and search operations MUST complete within 100ms to feel responsive; debouncing is acceptable
- **NFR-007 (Data structure)**: All resource data MUST remain in human-readable JSON format in `src/data/`; no new database or server-side storage is introduced
- **NFR-008 (Layout consistency)**: Resources MUST render in the existing grid layout established by COA-27 and COA-33; no layout changes to the page structure

### Key Entities

- **Resource** (extended from COA-27): The existing Resource interface in `src/lib/resources/types.ts`. This feature does not change the interface but relies on the `title`, `type`, `description`, and optional `tags` (age, category, skill) fields.
  - `id` (string): Unique identifier
  - `title` (string): Required
  - `type` ('youtube_link' | 'image_png' | 'image_jpeg' | 'gif' | 'pdf' | 'external_link'): Required
  - `url` (string): For links and embeds; optional for image assets with fileRef
  - `fileRef` (string): Pointer to asset storage (for embedded images); optional
  - `description` (string): Optional; used for keyword search
  - `section` (string): 'coaching_resources' | 'player_resources' | 'manager' | 'guides' | 'forms'
  - `tags` (object): Optional
    - `age` (array of strings): ['U8', 'U10', 'U12', 'U14', 'U16+']
    - `category` (array of strings): Varies by section
    - `skill` (array of strings): Custom per resource
  - `createdAt` (ISO string): Timestamp
  - `updatedAt` (ISO string): Timestamp

---

## Success Criteria

- **SC-001**: AND-logic filtering works correctly: selecting U12 + Defence displays only resources with both tags, not resources with either tag alone
- **SC-002**: Keyword search matches partial text in title and description and correctly combines with active filters
- **SC-003**: Removing a single filter updates results immediately without requiring page reload
- **SC-004**: Unfiltered sections (Manager, Guides, Forms) display resources in alphabetical order with no filter controls visible
- **SC-005**: A resource with only title and type displays in all views; it is hidden only when a filter active excludes it (missing the tag)
- **SC-006**: No results state appears when filters or search produce zero matches; "Clear all filters" restores the full list
- **SC-007**: Keyboard navigation works: Tab reaches search and filter buttons; Space/Enter toggles filter state; screen reader announces result count
- **SC-008**: Filter bar remains usable on 375px, 768px, and 1440px viewports without overflow or horizontal scroll
- **SC-009**: No JavaScript console errors during filter/search operations

---

## Acceptance Criteria

1. **Given** a coach selects "U12" and "Defence" filters, **When** the page re-renders, **Then** only resources with both Age="U12" AND Category="Defence" tags are displayed
2. **Given** a coach types "press" in the search box, **When** blur or Enter fires, **Then** only resources containing "press" in title or description are displayed
3. **Given** search is active and "U12" filter is selected, **When** the results update, **Then** only resources matching BOTH the search term AND the U12 filter are shown
4. **Given** multiple filters are active, **When** the coach removes one filter, **Then** results immediately update to reflect the remaining filters without page reload
5. **Given** filters produce zero matching resources, **When** the page renders, **Then** a "No results found" message displays with a "Clear all filters" button
6. **Given** Coaching Resources tab is active, **When** the page renders, **Then** Age, Category, and Skill filter controls are visible
7. **Given** Guides tab is active, **When** the page renders, **Then** no filter controls are visible and resources are sorted alphabetically by title
8. **Given** a resource has only title and type (no description or tags), **When** Guides section renders (no filters active), **Then** the resource displays with title and type
9. **Given** the same resource and Coaching Resources section is viewed with "U12" filter active, **When** the page re-filters, **Then** the resource is hidden (lacks U12 age tag)
10. **Given** search input is focused, **When** a coach types and presses Tab, **When** the search executes and focus moves to the next focusable element, **Then** the filter results are updated
11. **Given** filter buttons are present, **When** a coach navigates with Tab/Shift+Tab and presses Space, **When** a filter is toggled, **Then** the filter state changes visually and results update
12. **Given** resources are displayed on a 375px viewport with filters active, **When** the page renders, **Then** the filter bar is sticky, remains readable, and does not require horizontal scroll to access all filters
13. **Given** image (PNG/JPEG) or GIF resources are in the grid, **When** the page renders, **Then** images maintain original aspect ratio without letterboxing or distortion

---

## Filtering Algorithm Pseudocode

```
Function filterResources(resources, activeFilters, searchKeyword, section):
  results = resources.filter(r => r.section == section)
  
  // Apply AND-logic filters
  if activeFilters.age.length > 0:
    results = results.filter(r => r.tags.age has any value in activeFilters.age)
  if activeFilters.category.length > 0:
    results = results.filter(r => r.tags.category has any value in activeFilters.category)
  if activeFilters.skill.length > 0:
    results = results.filter(r => r.tags.skill has any value in activeFilters.skill)
  
  // Apply keyword search
  if searchKeyword.length > 0:
    results = results.filter(r => 
      r.title.toLowerCase().includes(searchKeyword.toLowerCase()) OR
      r.description?.toLowerCase().includes(searchKeyword.toLowerCase())
    )
  
  // Sort
  if section in ['manager', 'guides', 'forms']:
    results = results.sort((a, b) => a.title.localeCompare(b.title))
  else:
    // Coaching and Player Resources: sort by creation date (newest first), then by title for tie-breaking
    results = results.sort((a, b) => 
      b.createdAt.localeCompare(a.createdAt) || a.title.localeCompare(b.title)
    )
  
  return results
```

---

## Handover: Adding Resources Post-Launch

Resources are stored as human-readable JSON files in `src/data/`:
- `coaching-resources.json` — Resources for coaches
- `player-resources.json` — Resources for players
- `manager-resources.json` — Manager/committee resources
- `guides.json` — Training guides
- `forms.json` — Forms (if section exists)

**To add a resource**:
1. Open the relevant JSON file (e.g., `coaching-resources.json`)
2. Add a new object to the array with:
   - `id`: Unique identifier (e.g., "coaching-123")
   - `title`: Resource name
   - `type`: One of the supported types
   - `url`: (for links) or `fileRef`: (for embedded assets)
   - `description`: (optional)
   - `tags`: (optional)
     - `age`: Array of age groups (e.g., ["U12", "U14"])
     - `category`: Array of categories (e.g., ["Defence"])
     - `skill`: Array of skills (e.g., ["Ball Handling"])
3. Save the file
4. No code changes required; content appears on next page load (static site)

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

---

## Constitutional Compliance

- **Principle I (User Outcomes First)**: Each user story delivers measurable value (faster discovery via AND-filters, keyword search, graceful degradation). Success criteria are observable. PASS.

- **Principle II (Test-First Discipline)**: Acceptance criteria are defined in Given/When/Then format. Each functional requirement is testable. Filter and search logic is deterministic and verifiable. PASS.

- **Principle III (Backend Authority & Invariants)**: No backend — static site. Data is stored in JSON; all logic runs client-side on static data. No server-side mutations required. PASS.

- **Principle IV (Error Semantics & Observability)**: No results state is explicit (FR-018). Incomplete metadata is handled gracefully (FR-015, FR-016). No silent failures; console errors ruled out (NFR-008). PASS.

- **Principle V (AppShell Integrity)**: Resources page renders within existing BaseLayout. Search and filter UI are overlaid on the existing grid — no custom navigation introduced. Responsive design follows established breakpoints. PASS.

- **Principle VI (Accessibility First)**: Keyboard navigation for search and filters (NFR-001, NFR-002). Screen reader announcements for result count (NFR-005). All controls keyboard-accessible. WCAG 2.1 AA implied by acceptance criteria. PASS.

- **Principle VII (Immutable Data Flow)**: Resource data is immutable — filters and search only read, never write. Filter state is derived from user input, not cached. No data inference on client side. PASS.

- **Principle VIII (Dependency Hygiene)**: No new dependencies introduced. Filtering and search use native JavaScript. No third-party libraries required. PASS.

- **Principle IX (Cross-Feature Consistency)**: Filtering and search UI follow established patterns from COA-27 and COA-33. No new component library introduced. JSON data structure is consistent with existing resources. PASS.

**Compliance Status**: ✅ PASS — No violations identified. Feature aligns with all constitutional principles.

---

## Related Features

- **COA-27** (Resources Modal): Delivers modal display for video/PDF resources. This feature (COA-43) adds filtering and search to the modal's data source.
- **COA-33** (Resources Menu): Delivers the tab structure and initial page layout. This feature enhances filtering within that structure.
- **COA-26** (Documents): Delivers Guides and Forms sections. This feature ensures those sections display in alphabetical order without filters.

---

## Notes for Implementation

1. **Filter state**: Filter selections should not persist across page reloads (unless localStorage is explicitly added in a future feature). Closing the page resets filters.
2. **Search debouncing**: Implement a 300–500ms debounce on search input to avoid excessive re-renders while typing.
3. **Skill discovery**: Skill filters are dynamic — the set of available skills is derived from all resources in a section THAT MATCH ACTIVE AGE AND CATEGORY FILTERS. Example: If "U12" age filter is active, skill filter options show only skills from resources tagged U12. This prevents users from selecting skill filters that would result in zero matches. If no Age or Category filters are active, all skills in the section are shown.
4. **Unfiltered sections**: Manager, Guides, and Forms sections receive a simplified UI without search or filter controls. Keyword search across these sections can be added in a future feature if needed.
5. **Category values**: Category values differ by section (see FR-012 and FR-013 for specifics). Coaching Resources uses: Defence, Drills, Offence, Plays, Tools. Player Resources uses: Solo, Group, Offence, Defence, Drill (singular). Do not mix category taxonomies across sections.
5. **Image aspect ratio**: Ensure image resources (PNG, JPEG, GIF) are constrained to maintain aspect ratio in the grid; CSS `aspect-ratio` or `object-fit: contain` handles this.
6. **Modal integration**: The modal (from COA-27) receives filtered resources as input. No changes to modal logic are needed.
