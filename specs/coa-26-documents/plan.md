# Implementation Plan: Documents (Club Policies & Team Manager Resources)

**Branch**: cameronwalsh/coa-26-documents | **Date**: 2026-04-11 | **Spec**: [spec.md](./spec.md)

---

## Summary

This feature migrates real club documents from the old Bendigo Phoenix website onto the new Astro site. It consists of three independent but related pieces:

1. **Club Policies on the About page** — Replace placeholder text accordion with real PDF documents and external policy links in a two-column grid, with inline PDF embedding and download capability.
2. **Team Manager Resources on the Resources page** — Unhide the existing Manager tab, wire it to real documents using the same card layout as Coaching/Player tabs, with no filter controls.
3. **Guides section on the Resources page** — Add a new Guides tab with embedded YouTube instructional videos for coaches and managers, organized by category.

All content is **publicly accessible** without authentication. This is a **frontend-only, static-site feature** with no backend or database changes required.

---

## Technical Context

- **Platform**: Static site (Astro)
- **Language/Version**: Astro 5.x, TypeScript
- **UI Framework**: Astro components with Tailwind CSS
- **Storage**: JSON data files + static PDFs in `/public/`
- **Testing**: Component/integration tests via Vitest (where applicable)
- **Target Audience**: All visitors (public access required)
- **Performance Goals**: PDF embeds load within 3 seconds on simulated 3G; responsive at 375px, 768px, 1440px
- **Scale/Scope**: ~8 manager documents, 6-10 club policies, 1+ instructional guides

---

## Constitution Compliance Check

| Principle | Status | Notes |
|-----------|--------|-------|
| **I: User Outcomes First** | ✅ PASS | Each user story has measurable acceptance criteria and independent tests. Success is observable behaviour (viewing, downloading, tab switching). |
| **II: Test-First Discipline** | ✅ PASS | Comprehensive manual QA checklist provided. Component rendering tests will validate accordion state, PDF embed presence, tab visibility, and keyboard operability before implementation. |
| **III: Backend Authority & Invariants** | ✅ N/A | Static site. No server-side mutations or invariants to protect. Data is immutable JSON → HTML at build time. |
| **IV: Error Semantics & Observability** | ✅ PASS | Error states for broken PDFs and missing embeds are explicitly specified (FR-007, NFR-007). Console error logging will be monitored during QA. |
| **V: AppShell Integrity** | ✅ PASS | All UI renders within existing `BaseLayout`. About page section added inside existing structure. Resources page tab bar is extended, not replaced. |
| **VI: Accessibility First** | ✅ PASS | `aria-expanded`, `aria-controls`, keyboard operability (Enter/Space), screen reader labels for external links, descriptive `title` attributes on embeds, responsive layout. All explicitly required in NFRs and ACs. |
| **VII: Immutable Data Flow** | ✅ PASS | Data flows from JSON → HTML at build time. Only accordion open/close state is mutable (client-side, local, explicit). No inference or calculation. |
| **VIII: Dependency Hygiene** | ✅ PASS | No new dependencies required. PDF embed uses native `<embed>` tag. YouTube embeds use native `<iframe>`. NFR-009 explicitly prohibits PDF rendering libraries. |
| **IX: Cross-Feature Consistency** | ✅ PASS | Manager resource cards use existing card component pattern. Guides tab follows established `role="tab"` / `role="tabpanel"` tab pattern. Tailwind tokens (`brand-purple`, `brand-gold`, etc.) follow existing conventions. |

**Result**: Feature fully compliant with constitution. Proceed with implementation.

---

## Project Structure

```
specs/coa-26-documents/
├── spec.md                 (requirements and acceptance criteria)
├── plan.md                 (this file — technical approach)
└── tasks.md                (atomic implementation tasks)

src/
├── pages/
│   ├── about.astro         (MOD: Replace Club Policies placeholder with real data)
│   └── resources/
│       ├── index.astro     (MOD: Unhide Manager tab, add Guides tab, wire filters)
│       ├── coaching.astro
│       └── players.astro
│
├── data/
│   ├── coaching-resources.json    (existing)
│   ├── player-resources.json      (existing)
│   ├── manager-resources.json     (MOD: wire real document URLs)
│   └── guides.json                (NEW: instructional guide data)
│
├── lib/resources/
│   └── types.ts            (MOD: add 'managers' to ResourceAudience type)
│
└── layouts/
    └── BaseLayout.astro    (no changes required)

public/
├── resources/
│   ├── club-policies/      (NEW: PDF files for club policies)
│   │   ├── code-of-conduct.pdf
│   │   ├── privacy-policy.pdf
│   │   └── [other policies].pdf
│   └── team-manager/       (NEW: PDF files for manager resources)
│       ├── constitution-bylaws.pdf
│       ├── registration-fees.pdf
│       └── [other manager docs].pdf
```

---

## Data Model & Schema

### ClubPolicy (About page)

A new data structure (not persisted in a JSON file initially; defined inline or in a separate object in `about.astro`):

```typescript
interface ClubPolicy {
  name: string;           // Display name, used for alphabetical sort
  type: 'pdf' | 'external_link';
  filePath?: string;      // Path relative to /public/ (PDF only)
  url?: string;           // Full external URL (external_link only)
}
```

**Example policies**:
```javascript
const clubPolicies = [
  {
    name: 'Child Protection Policy',
    type: 'external_link',
    url: 'https://bendigobasketball.com.au/child-protection-policy/',
  },
  {
    name: 'Code of Conduct',
    type: 'pdf',
    filePath: 'resources/club-policies/code-of-conduct.pdf',
  },
  {
    name: 'Gender, Disrespect & Violence',
    type: 'external_link',
    url: 'https://sportsfocus.com.au/issue-gender-disrespect-violence/',
  },
  // ... more policies, sorted alphabetically by name
];
```

**Invariants**:
- Exactly one policy name per row (no duplicates)
- Each PDF policy must have a valid `filePath` pointing to `/public/resources/club-policies/*`
- Each external policy must have a valid `url` starting with `http://` or `https://`
- Policies are sorted alphabetically by `name` for display

---

### Guide (Resources page Guides tab)

New data file: `src/data/guides.json`

```typescript
interface Guide {
  id: string;              // Unique identifier (e.g., 'guide-001')
  title: string;           // Display title
  category: string;        // e.g., 'PlayHQ', 'Team Management'
  youtubeUrl: string;      // Full YouTube URL (e.g., https://youtu.be/OdTboL_uYqk or https://www.youtube.com/watch?v=OdTboL_uYqk)
  description?: string;    // Optional short description
  dateAdded: string;       // ISO date (e.g., '2026-04-11')
}
```

**Example**:
```json
[
  {
    "id": "guide-001",
    "title": "How to Score a Game",
    "category": "PlayHQ",
    "youtubeUrl": "https://youtu.be/OdTboL_uYqk?si=DHaDOyoUJOXQLC4G&t=2",
    "description": "Step-by-step tutorial for entering game scores in PlayHQ",
    "dateAdded": "2026-04-11"
  }
]
```

**Invariants**:
- Each guide has a unique `id`
- `youtubeUrl` must be a valid YouTube link (can be shortened `youtu.be/` or full `youtube.com/watch?v=`)
- `category` is a freeform string (not an enum) to allow flexibility for future additions

---

### Resource Type Update

Update `src/lib/resources/types.ts`:

**Before**:
```typescript
export type ResourceAudience = 'coaching' | 'players';
```

**After**:
```typescript
export type ResourceAudience = 'coaching' | 'players' | 'managers';
```

No other Resource interface fields need to change. Manager resources will use the same `Resource` interface, with:
- `audience: 'managers'`
- `type: 'document'`
- `url: string` (consistent with existing pattern)
- `category`, `ageGroup`, `dateAdded` as per the existing data structure

---

## Implementation Layers

### Layer 1: Data Layer

**New files**:
- `src/data/guides.json` — Instructional guide data with embedded YouTube URLs

**Modified files**:
- `src/lib/resources/types.ts` — Add `'managers'` to `ResourceAudience` type
- `src/data/manager-resources.json` — Update placeholder URLs (`"#"`) with real document paths or external links

**New static assets**:
- `/public/resources/club-policies/*.pdf` — Club policy PDF files (6-10 files)
- `/public/resources/team-manager/*.pdf` — Manager resource PDFs (variable; existing entries may point elsewhere)

---

### Layer 2: About Page (`src/pages/about.astro`)

**Changes**:
1. Replace the existing `policies` array (six hardcoded placeholder objects) with a real `clubPolicies` array containing PDF and external link entries
2. Replace the placeholder accordion component with a new two-column grid component that:
   - Displays policies in strict alphabetical order
   - Renders PDF items with an expand/download icon
   - Renders external items with an external-link icon and `target="_blank"` with `rel="noopener noreferrer"`
   - Implements single-open accordion behaviour (only one PDF expanded at a time)
   - Embeds PDFs inline using native `<embed>` tag with responsive width/height
   - Provides a download button that initiates a file download with correct filename
   - Handles missing/broken PDFs with a user-friendly fallback message
   - Maintains responsive layout: 2 columns on desktop, 1 column on mobile (below `sm` breakpoint)
   - Applies `aria-expanded`, `aria-controls`, keyboard operability (Enter/Space)

**Key implementation notes**:
- Use Tailwind `grid grid-cols-1 sm:grid-cols-2 gap-6` for responsive layout
- Embed tag: `<embed src={filePath} type="application/pdf" />`
- Download button: `<a href={filePath} download />` to trigger browser download with filename
- Fallback: If PDF fails to load, display "Document temporarily unavailable" message instead of broken embed
- Keyboard: attach `onclick` and `onkeydown` handlers to accordion buttons for Enter/Space support

---

### Layer 3: Resources Page (`src/pages/resources/index.astro`)

**Changes**:

1. **Manager Tab Visibility**:
   - Remove `hidden` class from the Manager tab button (`#tab-managers`)
   - Ensure tab button is visible alongside Coaching and Player tabs

2. **Manager Tab Filter Suppression**:
   - Keep `#filters-managers` div with `hidden` class but ensure it is NEVER toggled by JavaScript
   - Modify the existing `switchTab` JavaScript function to skip `#filters-managers` when switching to `managers` tab
   - Ensure the filter bar remains hidden regardless of tab state transitions
   - (Alternative: remove `#filters-managers` and `#managers-no-results` from DOM entirely if they are not used elsewhere)

3. **Add Guides Tab**:
   - Add a new tab button with `id="tab-guides"` and `role="tab"` following the same pattern as existing tabs
   - Position it after the Manager tab in the tab bar
   - Add a corresponding `<div id="panel-guides" role="tabpanel">` section
   - Import `guides.json` data and render guide cards with embedded YouTube players

4. **Guides Tab Panel Content**:
   - Display guide cards in a responsive grid (same as resource cards)
   - Each card shows:
     - Guide title
     - Category label (e.g., "PlayHQ")
     - Embedded YouTube player (`<iframe>` with `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen`)
   - Group or visually separate guides by category
   - Apply `aria-label` and `title` to `<iframe>` for accessibility
   - Maintain 16:9 aspect ratio on all viewports (use `aspect-video` or equivalent Tailwind utility)

5. **Manager Resources Tab Panel**:
   - Ensure manager resources display with the same card layout as Coaching/Player tabs
   - Cards already defined in `manager-resources.json`; no filter bar is shown for this tab

---

### Layer 4: Component Structure

**New/Modified components**:
- **ClubPoliciesSection** (About page) — Two-column grid, accordion, PDF embed, download
- **GuidesTabPanel** (Resources page) — Guide cards, YouTube embeds, category grouping

**Existing components used**:
- **ResourceCard** (or similar) — Existing card pattern for manager resources and guides
- **BaseLayout** — Existing layout (no changes)

---

## Phased Delivery

### Phase 1: Data & Type Preparation (Parallel-ready)

**Tasks**:
- Update `ResourceAudience` type to include `'managers'`
- Create `src/data/guides.json` with initial guide entries
- Prepare PDF files for club policies and manager resources in `/public/resources/`
- Update `manager-resources.json` with real document URLs (or placeholder paths to be filled)

**Deliverable**: Data layer ready; no UI changes yet.

**Definition of Done**:
- TypeScript types compile without error
- `guides.json` is valid JSON
- PDF files exist in `/public/` with correct filenames
- `manager-resources.json` URLs point to valid resources (or are clearly marked as TBD)

---

### Phase 2: About Page — Club Policies Section

**Tasks**:
- Replace placeholder `policies` array in `about.astro` with real `clubPolicies` array
- Build two-column grid layout with responsive collapse to single column
- Implement accordion expand/collapse for PDF policies
- Implement PDF embedding with native `<embed>` tag
- Implement download button with correct filename
- Add error handling for missing/corrupt PDFs
- Add ARIA labels, `aria-expanded`, `aria-controls` for keyboard operability
- Add external link icons and `target="_blank"` handling for external policies
- Test at 375px, 768px, 1440px viewports

**Deliverable**: Club Policies section fully functional on About page.

**Definition of Done**:
- [ ] Policies display in strict alphabetical order
- [ ] Two-column layout on desktop, single-column on mobile
- [ ] PDF items show expand/download icon; external items show external-link icon
- [ ] PDF expands inline without page navigation
- [ ] Download button produces correct filename
- [ ] Only one PDF can be expanded at a time
- [ ] External links open in new tab; About page stays open
- [ ] No console errors
- [ ] Keyboard navigation (Enter/Space) works on accordion buttons
- [ ] Responsive at 375px, 768px, 1440px

---

### Phase 3: Resources Page — Manager Tab & Guides Tab

**Tasks**:
- Remove `hidden` class from Manager tab button
- Update `switchTab` JavaScript function to suppress filter bar for managers tab
- Add Guides tab button and panel to Resources page
- Import and render guides data in Guides panel
- Build YouTube embed cards with category grouping
- Ensure YouTube embeds are responsive and maintain 16:9 aspect ratio
- Add ARIA labels and `title` attributes to YouTube iframes
- Test Manager tab visibility and filter suppression
- Test Guides tab rendering and YouTube embed responsiveness

**Deliverable**: Manager and Guides tabs fully functional on Resources page.

**Definition of Done**:
- [ ] Manager tab visible on page load (no `hidden` class)
- [ ] Manager tab shows card layout matching Coaching/Player tabs
- [ ] No filter bar visible when Manager tab is active
- [ ] Guides tab visible in tab bar
- [ ] Guide cards display YouTube embeds with controls
- [ ] YouTube embeds responsive at 375px, 768px, 1440px
- [ ] Guides grouped/labelled by category
- [ ] No console errors
- [ ] Keyboard navigation (arrow keys) includes Guides tab
- [ ] Responsive at all breakpoints

---

### Phase 4: Testing & Polish

**Tasks**:
- Run manual QA checklist from spec (all 24 items)
- Run accessibility audit (axe DevTools or equivalent) — target WCAG 2.1 AA
- Verify PDF files are compressed (<5MB each without justification)
- Verify no JavaScript console errors
- Test browser compatibility (Chrome, Firefox, Safari, Edge latest)
- Test JavaScript disabled fallback (Club Policies should degrade to list of links)
- Document any edge cases or known limitations

**Deliverable**: Feature fully tested and ready for merge.

**Definition of Done**:
- [ ] All manual QA items passing
- [ ] No WCAG 2.1 AA violations (axe report)
- [ ] All browsers tested
- [ ] PDF performance acceptable (3s on 3G throttle)
- [ ] No regressions in existing About or Resources pages

---

## Testing Strategy

### Manual QA (from spec)

The spec includes a comprehensive testing checklist with 24 items covering:
- Club Policies layout and interaction
- Accordion behaviour
- PDF embed and download
- External link handling
- Manager tab visibility and filters
- Guides tab and YouTube embed responsiveness
- Keyboard navigation and accessibility
- Responsive layout at three breakpoints

**Test environment**:
- Local development (`npm run dev`)
- Production build preview (`npm run build && npm run preview`)
- Chrome DevTools throttling: Simulated 3G for PDF load time verification

### Component/Unit Tests (Vitest)

Where applicable, write tests for:
- **Accordion state management**: Verify only one PDF expanded at a time
- **Sorting**: Verify Club Policies are alphabetical
- **URL handling**: Verify external links have `target="_blank"` and `rel="noopener"`
- **YouTube URL transformation**: Verify `youtu.be/` URLs are converted to `youtube.com/embed/` for iframe src
- **Responsive layout**: Verify grid collapses from 2 to 1 column below `sm` breakpoint (if component-testable)

Note: Astro is a static site generator, so most testing will be manual verification of rendered HTML and user interaction. Focus on invariants and error states.

### Accessibility Audit

- Run axe DevTools or WAVE on About page Club Policies section
- Run axe DevTools on Resources page with Manager and Guides tabs active
- Verify ARIA attributes are present and correct
- Verify keyboard navigation works (Tab, Enter, Space, arrow keys)
- Verify screen reader announces external link destinations

### Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Verify:
- PDF embeds render (use `<embed>` with fallback `<a>` link)
- YouTube iframes load and play
- Responsive layout works
- Accordion accordion open/close smooth
- No console errors

---

## Key Technical Decisions

### Decision 1: Native PDF Embed vs. PDF.js

**Choice**: Use native `<embed>` tag with fallback `<a>` link.

**Rationale**:
- NFR-009 explicitly prohibits introducing a PDF rendering library (like PDF.js)
- Native embed is simpler, lighter, and works in all modern browsers
- Fallback link ensures users without native PDF support can still download the file
- Trade-off: PDF rendering is browser-dependent (less control over appearance), but acceptable for MVP

**Implementation**:
```html
<embed 
  src="/resources/club-policies/code-of-conduct.pdf" 
  type="application/pdf" 
  class="w-full min-h-[600px] rounded-lg"
  title="Code of Conduct PDF"
/>
<!-- Fallback for browsers without PDF support -->
<a href="/resources/club-policies/code-of-conduct.pdf" class="block text-center py-4 text-brand-purple underline">
  Open PDF (opens in new tab)
</a>
```

---

### Decision 2: Filter Bar Suppression Strategy

**Choice**: Keep `#filters-managers` DOM element with `hidden` class; update `switchTab` JS function to never toggle it.

**Rationale**:
- Avoids removing DOM elements (safer for future changes)
- Explicit suppression in code documents intent clearly
- Maintains existing filter infrastructure for other tabs
- Prevents accidental display of filters if JS logic is refactored

**Implementation**:
```javascript
function switchTab(tabName) {
  // Show the appropriate filter bar, unless it's the managers tab
  if (tabName !== 'managers') {
    const filterBar = document.getElementById(`filters-${tabName}`);
    if (filterBar) filterBar.classList.remove('hidden');
  }
  // Manager tab: explicitly keep filters-managers hidden
  const managerFilters = document.getElementById('filters-managers');
  if (managerFilters) managerFilters.classList.add('hidden');
}
```

---

### Decision 3: Guides Data Storage

**Choice**: Store guides in `src/data/guides.json` following the same pattern as existing resource data.

**Rationale**:
- Consistent with codebase conventions (all resource data in `src/data/`)
- Easy to extend with more guides in future
- Separates data from logic (component imports and renders)
- Allows non-developers to add guides without editing components

**Structure**: Array of Guide objects with `id`, `title`, `category`, `youtubeUrl`, `description`, `dateAdded`.

---

### Decision 4: YouTube URL Transformation

**Choice**: Accept full YouTube URLs in `guides.json`; transform at render time to `youtube.com/embed/` format for iframes.

**Rationale**:
- Users may have YouTube links from different sources (shortened `youtu.be/`, watch links with parameters, etc.)
- Render-time transformation is transparent and centralized
- Allows flexibility in data entry (don't force a specific URL format)

**Implementation**:
```typescript
function getYouTubeEmbedUrl(url: string): string {
  // Handle https://youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  
  // Handle https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  
  return url; // Return as-is if unrecognized (will fail visibly)
}
```

---

### Decision 5: Club Policies Sorting

**Choice**: Sort strictly alphabetically by policy name; display in a two-column grid.

**Rationale**:
- FR-002 requires "strict alphabetical order"
- Makes policies easy to find and scan
- No special grouping or categorization needed
- Two-column layout (FR-003) maximizes readability on desktop while collapsing to single-column on mobile

**Implementation**:
```typescript
const clubPolicies = [ /* ... */ ];
const sortedPolicies = clubPolicies.sort((a, b) => a.name.localeCompare(b.name));
```

---

## Error Handling & Edge Cases

### Missing or Corrupt PDF

**Spec requirement** (FR-007, NFR-007): Display a user-friendly inline message ("Document temporarily unavailable") rather than a broken embed. The item should still be visible in the list.

**Implementation approach**:
- Wrap `<embed>` in a container with `onerror` handler or use `<object>` fallback
- On error, hide the embed and show an error message: "Document temporarily unavailable"
- Keep the policy item visible in the list with the error state
- Provide a fallback download link if available

```html
<div id="pdf-{id}" class="relative">
  <embed 
    src="/resources/club-policies/code-of-conduct.pdf" 
    type="application/pdf" 
    onerror="document.getElementById('pdf-{id}-error').classList.remove('hidden')"
  />
  <div id="pdf-{id}-error" class="hidden text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
    <p class="text-sm text-gray-600">Document temporarily unavailable</p>
    <a href="/resources/club-policies/code-of-conduct.pdf" class="text-xs text-brand-purple underline mt-2 inline-block">
      Try downloading instead
    </a>
  </div>
</div>
```

### Broken External Policy Link

**Spec requirement** (Edge Case): Display the item in the list with a warning indicator; clicking still attempts to open the link.

**Implementation approach**:
- Render the link normally with an external-link icon
- No special validation needed (it's a URL; user will see if it's broken)
- Trust that club staff provide correct URLs

---

### Very Long Policy or Document Title

**Spec requirement** (Edge Case): Text must wrap or truncate without breaking the grid. Full title accessible via `title` attribute.

**Implementation approach**:
- Use Tailwind `truncate` or `line-clamp-2` on titles
- Add `title` attribute with full text for tooltip/accessibility
- Adjust grid gap and padding to prevent overflow

```html
<h3 class="font-bold text-gray-900 truncate" title="Full title text">
  Very Long Policy Name
</h3>
```

---

### JavaScript Disabled

**Spec requirement** (Edge Case): Club Policies must degrade to a list of direct download links (PDFs) and anchor links (external).

**Implementation approach**:
- Render policy items as a simple list with native links
- Use `<noscript>` fallback or ensure basic list rendering works without JS
- Accordion expand/collapse is a JS enhancement; without JS, all items display as links

```html
<noscript>
  <ul class="space-y-2">
    <li><a href="/resources/club-policies/code-of-conduct.pdf">Code of Conduct (PDF)</a></li>
    <li><a href="https://example.com/policy" target="_blank">External Policy</a></li>
  </ul>
</noscript>
```

---

### Very Large PDF (>10MB)

**Spec requirement** (NFR-006): PDF files should be reasonably compressed. No special lazy-loading required. No in-browser size warning needed for MVP.

**Implementation**: Ensure PDFs are compressed during asset preparation (outside the scope of this task, but documented for QA).

---

## Accessibility Considerations

### ARIA & Semantic HTML

- **Accordion buttons**: `aria-expanded="true|false"`, `aria-controls="pdf-embed-id"`
- **External links**: `aria-label="Policy Name (opens in new tab)"` or visually hidden "(opens in new tab)" span
- **PDF embeds**: `title="Code of Conduct PDF"` for screen readers
- **YouTube embeds**: `title="How to Score a Game"` on the `<iframe>`
- **Tabs**: Existing `role="tab"` and `role="tabpanel"` on Resources page; maintain consistency for Guides tab

### Keyboard Navigation

- **Accordion buttons**: Enter/Space to toggle
- **Tab bar**: Arrow keys to navigate between tabs (already implemented; must verify Guides tab is included)
- **Links**: Tab to focus, Enter to activate (native browser behaviour)
- **Focus indicators**: Visible outline on all interactive elements (Tailwind `focus:ring-2 focus:ring-brand-purple`)

### Responsive Design

- **Mobile (375px)**: Single-column Club Policies grid, stacked YouTube embeds
- **Tablet (768px)**: Responsive adjustments, maintained readability
- **Desktop (1440px)**: Two-column Club Policies grid, full-width embeds

### Color Contrast

- Policy titles and text must meet WCAG AA contrast ratios
- Existing Tailwind color tokens (`brand-purple`, `brand-gold`, `brand-offwhite`, `brand-black`) are used to maintain consistency

---

## Performance & Optimization

### PDF Loading

- **Target**: PDF embeds load within 3 seconds on simulated 3G (Chrome DevTools throttle)
- **Strategy**: Keep PDF files <5MB; use compression tools before commit
- **Monitoring**: Manual QA will verify load time using Chrome DevTools

### Asset Organization

- PDFs stored in `/public/resources/club-policies/` and `/public/resources/team-manager/`
- No dynamic image loading or lazy-loading needed for MVP (static site)
- Bundle size impact: Minimal (no new JS dependencies)

### CSS & JavaScript

- All styling via Tailwind utilities (no new CSS files)
- Minimal JavaScript (accordion state, tab switching, filter bar suppression)
- No third-party libraries for PDF rendering or video embedding

---

## Documentation & Handoff Notes

### For QA/Testing

Refer to the comprehensive manual QA checklist in the spec (24 items). Use the "Independent Test" sections of each user story as the primary verification steps.

### For Future Maintainers

- **Club Policies**: To add or update policies, edit the `clubPolicies` array in `about.astro` and add/update PDF files in `/public/resources/club-policies/`.
- **Manager Resources**: Update URLs in `src/data/manager-resources.json` and add PDF files to `/public/resources/team-manager/`.
- **Guides**: Add entries to `src/data/guides.json` with valid YouTube URLs; videos will embed automatically.
- **Filters**: The filter bar suppression logic in `switchTab()` must explicitly keep `#filters-managers` hidden; do not remove without understanding the intent.

---

## Success Criteria (Verification Checklist)

- [ ] All Club Policies from the old website are accessible on About page without 404 errors
- [ ] All Team Manager documents accessible on Resources > Manager tab without 404 errors
- [ ] PDF embeds load within 3 seconds on 3G throttle
- [ ] Download buttons produce correct filename for each document
- [ ] Accordion expand/collapse operates smoothly with no layout shift
- [ ] Feature works on Chrome, Firefox, Safari, Edge (latest)
- [ ] Layout verified at 375px, 768px, 1440px with no overflow
- [ ] No WCAG 2.1 AA violations (axe audit)
- [ ] YouTube embeds load and play on Guides tab at all viewports
- [ ] Manager tab visible on page load (no `hidden` class)
- [ ] No JavaScript console errors during interaction
- [ ] Keyboard navigation (Tab, Enter, Space, arrow keys) functional
- [ ] Screen reader announces external links as "(opens in new tab)"

---

## Risks & Mitigations

### Risk 1: PDF File Format or Encoding Issues

**Mitigation**: Test PDF files in multiple browsers before commit. Verify using Chrome, Firefox, Safari. If a PDF doesn't render, provide a fallback download link.

### Risk 2: YouTube URL Format Variation

**Mitigation**: Implement robust URL parsing in the `getYouTubeEmbedUrl()` function to handle multiple formats (youtu.be/..., youtube.com/watch?v=..., with query params, etc.).

### Risk 3: Filter Bar Conflict with Tab Switching

**Mitigation**: Explicitly test that `#filters-managers` remains hidden when switching tabs. Update `switchTab()` function with clear comments explaining the suppression logic. Add a comment in HTML marking this as intentional.

### Risk 4: Accessibility Overlooked

**Mitigation**: Run axe DevTools scan on both About and Resources pages before merge. Verify keyboard navigation manually. Check aria-labels and title attributes.

### Risk 5: Responsive Layout Breaks on Edge Cases

**Mitigation**: Test at exact viewport widths (375px, 768px, 1440px) using Chrome DevTools. Verify grid collapse and PDF/video aspect ratios.

---

## Next Phase: Tasks

This plan is ready for handoff to the **tasks.md** phase, which will break the implementation into atomic, testable tasks organized by phase and layer. Each task will have:
- Clear acceptance criteria
- Links to relevant spec sections
- Estimated effort
- Dependencies on other tasks

See `tasks.md` for detailed task breakdown and execution order.
