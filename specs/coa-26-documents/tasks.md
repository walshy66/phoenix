# Implementation Tasks: Documents (Club Policies & Team Manager Resources)

**Feature Branch**: `cameronwalsh/coa-26-documents` | **Date**: 2026-04-11 | **Plan**: [plan.md](./plan.md)

---

## Overview

COA-26 is broken into **4 execution windows**, each with 2-3 atomic tasks. Tasks are designed to be executed sequentially, with clear dependencies and checkpoints. Follow the order strictly to avoid blocking issues.

**Estimated Total Effort**: ~16-20 hours across 4 windows

---

## Execution Window 1: Foundation (Data & Types)

**Duration**: ~2-3 hours | **Token Budget**: ~8k-10k

**Purpose**: Prepare data layer and type system. No UI changes yet.

**Definition of Done**:
- All data files created and valid
- TypeScript compiles without error
- PDF files organized in `/public/`
- Ready for UI implementation in Window 2

---

### Task W1-001: Update ResourceAudience Type [P]

**Spec Reference**: FR-018 | **Traceability**: US-2 (Team Manager)

**Description**: Update `src/lib/resources/types.ts` to add `'managers'` to `ResourceAudience` union type.

**Acceptance Criteria**:
1. `ResourceAudience` type now includes `'managers'` as third option
2. TypeScript file compiles without errors
3. Existing code references to `ResourceAudience` continue to work (backward compatible)
4. Linter passes

**Implementation Checklist**:
- [ ] Read current `src/lib/resources/types.ts`
- [ ] Add `'managers'` to the union type definition
- [ ] Run `npm run build` to verify TypeScript compilation
- [ ] Run linter check (if configured)
- [ ] Commit: "types(resources): add 'managers' audience to ResourceAudience"

**Dependencies**: None (standalone)

**Token Budget**: ~1k-1.5k

---

### Task W1-002: Create guides.json Data File [P]

**Spec Reference**: FR-015, FR-016, FR-017 | **Traceability**: US-3 (Guides)

**Description**: Create `src/data/guides.json` with initial guide entries following the Guide interface from data-model.md.

**Acceptance Criteria**:
1. File created at `src/data/guides.json`
2. Valid JSON format (no parse errors)
3. Contains at least one guide (initial: "How to Score a Game")
4. Each guide has: `id`, `title`, `category`, `youtubeUrl`, `description`, `dateAdded`
5. YouTube URL is valid (youtu.be or youtube.com format)
6. File passes JSON schema validation
7. Can be imported in Astro components without errors

**Guides to Include**:
```json
{
  "id": "guide-001",
  "title": "How to Score a Game",
  "category": "PlayHQ",
  "youtubeUrl": "https://youtu.be/OdTboL_uYqk?si=DHaDOyoUJOXQLC4G&t=2",
  "description": "Step-by-step tutorial for entering game scores in PlayHQ during a match.",
  "dateAdded": "2026-04-11"
}
```

**Implementation Checklist**:
- [ ] Create `src/data/guides.json`
- [ ] Add initial "How to Score a Game" guide entry
- [ ] Validate JSON format (use online validator or IDE)
- [ ] Verify file can be imported: `const guides = await import('../../data/guides.json')`
- [ ] Test in Astro REPL if available
- [ ] Commit: "data: create guides.json with initial PlayHQ guide"

**Dependencies**: None (standalone)

**Token Budget**: ~1.5k-2k

---

### Task W1-003: Update manager-resources.json URLs & Prepare PDFs [P]

**Spec Reference**: FR-018, FR-009 | **Traceability**: US-2 (Team Manager)

**Description**: Update placeholder URLs in `src/data/manager-resources.json` to point to correct resource paths. Prepare and organize all club policy and manager PDF files.

**Acceptance Criteria**:
1. All 8 manager resource entries in JSON have non-placeholder `url` values
2. URLs point to valid resource paths (e.g., `/resources/team-manager/constitution-bylaws.pdf`)
3. All `audience` fields set to `'managers'`
4. All `type` fields set to `'document'`
5. PDF files organized in `/public/resources/club-policies/` and `/public/resources/team-manager/`
6. File naming convention: lowercase kebab-case (e.g., `code-of-conduct.pdf`)
7. All PDFs compressed to <5MB (verify file sizes)
8. No dead links or 404s (verify paths match file names)

**Club Policy PDFs to Place** (in `/public/resources/club-policies/`):
- `code-of-conduct.pdf`
- `privacy-policy.pdf`
- `registration-and-eligibility.pdf`
- `uniform-policy.pdf`
- `player-welfare.pdf`
- `photography-social-media.pdf`
- `grievance-procedure.pdf`
- Plus any additional policies from old website

**Manager PDFs to Place** (in `/public/resources/team-manager/`):
- `annual-budget-template.pdf`
- `club-constitution-bylaws.pdf`
- `incident-report-form.pdf`
- `parent-communication-template.pdf`
- `registration-fees-policy.pdf`
- `sponsorship-proposal-template.pdf`
- `working-with-children-check-guide.pdf`
- `end-of-season-presentation-guide.pdf`

**Implementation Checklist**:
- [ ] Collect PDF files from old website or club documentation
- [ ] Compress PDFs to target <5MB per file (use Ghostscript or macOS Preview)
- [ ] Create `/public/resources/club-policies/` directory
- [ ] Create `/public/resources/team-manager/` directory
- [ ] Place all PDFs in correct directories with kebab-case filenames
- [ ] Verify file listing: `ls /public/resources/club-policies/` and `ls /public/resources/team-manager/`
- [ ] Read current `src/data/manager-resources.json`
- [ ] For each entry:
  - [ ] Update `url` to `/resources/team-manager/{kebab-case-name}.pdf`
  - [ ] Set `audience: "managers"`
  - [ ] Set `type: "document"`
  - [ ] Verify all required fields present
- [ ] Validate JSON syntax (online validator)
- [ ] Spot-check 3 URLs by attempting to fetch in browser
- [ ] Commit: "data: organize PDFs and update manager-resources.json URLs"

**Dependencies**: W1-001 (Type update must be complete first)

**Token Budget**: ~3k-4k

---

## Checkpoint 1: Window 1 Complete

Before proceeding to Window 2, verify:
- [ ] TypeScript compiles without errors: `npm run build`
- [ ] All data files are valid JSON
- [ ] PDF files exist at expected paths
- [ ] `src/lib/resources/types.ts` contains `'managers'` in `ResourceAudience`
- [ ] `src/data/guides.json` contains at least one guide with valid YouTube URL
- [ ] `src/data/manager-resources.json` updated with real URLs

**If any checkpoint fails**: Do not proceed to Window 2. Debug and fix the failing task.

---

## Execution Window 2: About Page - Club Policies Section

**Duration**: ~4-5 hours | **Token Budget**: ~15k-18k

**Purpose**: Implement Club Policies section on About page with accordion, PDF embed, download, and external links.

**Definition of Done**:
- Club Policies section fully rendered on About page
- All 10+ policies visible in two-column grid (desktop) / single-column (mobile)
- PDF expand/collapse accordion functional
- Download buttons produce correct filenames
- External links open in new tab
- No console errors
- Keyboard navigation (Tab, Enter/Space) working
- Responsive at 375px, 768px, 1440px

---

### Task W2-001: Create clubPolicies Data & Define ClubPolicy Type

**Spec Reference**: FR-001, FR-002 | **Traceability**: US-1 (Club Policies)

**Description**: Define the `ClubPolicy` interface and create the `clubPolicies` array in `src/pages/about.astro` with real policy data.

**Acceptance Criteria**:
1. `ClubPolicy` TypeScript interface defined (inline in about.astro or in separate types file)
2. `clubPolicies` array contains 10-15 real policies (mix of PDF and external links)
3. Policies sorted strictly alphabetically by `name`
4. PDFs reference paths in `/public/resources/club-policies/`
5. External links point to valid external URLs
6. No duplicate policy names
7. File compiles without TypeScript errors

**Policies to Include**:
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
  // ... more policies in alphabetical order
];
```

**Implementation Checklist**:
- [ ] Open `src/pages/about.astro`
- [ ] Define `ClubPolicy` interface (with `name`, `type`, `filePath?`, `url?`)
- [ ] Create `clubPolicies` array with all policies
- [ ] Sort array alphabetically: `const sorted = clubPolicies.sort((a, b) => a.name.localeCompare(b.name))`
- [ ] Verify all PDF paths exist in `/public/resources/club-policies/`
- [ ] Verify all external URLs are valid (HTTP/HTTPS)
- [ ] Run `npm run build` to verify TypeScript compilation
- [ ] Commit: "data(about): add clubPolicies array with real policies"

**Dependencies**: W1-003 (PDF files must be in place)

**Token Budget**: ~2k-2.5k

---

### Task W2-002: Build ClubPoliciesSection Component [P]

**Spec Reference**: FR-003, FR-004, FR-005, FR-006, FR-007 | **Traceability**: US-1 (Club Policies)

**Description**: Create a new `ClubPoliciesSection` component that renders the two-column grid layout, accordion for PDF expand/collapse, and download functionality.

**Acceptance Criteria**:
1. Component renders as Astro or React component (match codebase pattern)
2. Policies displayed in responsive grid: `grid-cols-1 sm:grid-cols-2`
3. Two-column on desktop (≥sm), single-column on mobile (<sm)
4. Each policy item shows:
   - [ ] Policy name
   - [ ] Icon: PDF icon for PDFs, external-link icon for external links
   - [ ] Action button: "Expand" for PDF, "Open" for external link
5. PDF items render with aria-expanded, aria-controls for accordion state
6. Clicking PDF item renders inline embed (`<embed>` tag)
7. Download button visible on expanded PDF with `download` attribute
8. Only one PDF can be expanded at a time (accordion behavior)
9. External links render with `target="_blank"` and `rel="noopener noreferrer"`
10. No layout shifts or overflow at any viewport
11. Tailwind utility classes used (brand-purple, brand-gold, etc.)
12. No console errors

**Implementation Checklist**:
- [ ] Create `src/components/ClubPoliciesSection.astro` (or .tsx/.jsx)
- [ ] Accept `policies` prop (array of ClubPolicy)
- [ ] Sort policies alphabetically in component
- [ ] Build responsive grid layout with Tailwind
- [ ] Render policy item list with icon and action button
- [ ] Add inline styles or CSS for accordion state (JavaScript-driven)
- [ ] Implement PDF embed rendering with `<embed>` tag
- [ ] Add download button with `href={filePath}` and `download` attributes
- [ ] Implement external link rendering with correct attributes
- [ ] Add aria-expanded, aria-controls ARIA attributes
- [ ] Test component renders without errors
- [ ] Verify styling with brand colors
- [ ] Commit: "feat(components): add ClubPoliciesSection component"

**Dependencies**: W2-001 (clubPolicies data must exist)

**Token Budget**: ~5k-6k

---

### Task W2-003: Implement Accordion JavaScript & Error Handling

**Spec Reference**: FR-005, FR-007, NFR-007 | **Traceability**: US-1 (Club Policies)

**Description**: Add JavaScript to the About page to handle accordion expand/collapse, download functionality, keyboard navigation, and error handling for missing PDFs.

**Acceptance Criteria**:
1. Clicking expand button toggles PDF embed visibility
2. Expanding one PDF collapses any previously expanded PDF (single-open accordion)
3. Download button appears on expanded PDF
4. Clicking download button triggers browser file download
5. Downloaded file has correct filename (matches policy name)
6. Enter/Space keyboard keys toggle accordion state
7. Tab key navigates through all policy items
8. Missing or broken PDF shows user-friendly error message: "Document temporarily unavailable"
9. No console JavaScript errors
10. Error message allows user to still interact with other policies
11. Embed has `title` attribute for accessibility

**Implementation Checklist**:
- [ ] Add `<script>` block to `about.astro` or create separate `accordion.ts` module
- [ ] Store currently expanded policy ID in variable
- [ ] On expand button click:
  - [ ] If different PDF was already expanded, close it
  - [ ] Show the selected PDF embed
  - [ ] Update aria-expanded to "true"
  - [ ] Show download button
- [ ] On download button click:
  - [ ] Create `<a href={filePath} download>` and trigger click
  - [ ] Verify filename matches policy name
- [ ] Implement keyboard handler:
  - [ ] On Enter/Space keydown on button, toggle expand state
  - [ ] Prevent default browser behavior
- [ ] Add onerror handler to embed:
  - [ ] If PDF fails to load, hide embed
  - [ ] Show error message div with friendly text
  - [ ] Show fallback download link
- [ ] Add `title` attribute to all embeds (e.g., `title="Code of Conduct PDF"`)
- [ ] Test at all three breakpoints (375px, 768px, 1440px)
- [ ] Verify no console errors: `npm run dev` → F12 → Console
- [ ] Test keyboard navigation with Tab and Enter/Space
- [ ] Commit: "feat(about): implement accordion and download logic"

**Dependencies**: W2-002 (Component must exist)

**Token Budget**: ~4k-5k

---

### Task W2-004: Accessibility & Responsive Testing (About Page)

**Spec Reference**: NFR-001, NFR-002, NFR-005 | **Traceability**: US-1, US-4 (Public access)

**Description**: Verify About page Club Policies section meets accessibility standards and responsive layout requirements.

**Acceptance Criteria**:
1. All accordion buttons have `aria-expanded` attribute reflecting state
2. All accordion buttons have `aria-controls` pointing to embed element ID
3. External link items have aria-label with "(opens in new tab)" suffix
4. PDF embed elements have descriptive `title` attribute
5. All interactive elements keyboard operable (Tab, Enter, Space)
6. Focus indicators visible on all focusable elements
7. Tab order is logical and follows document flow
8. Two-column layout on desktop (≥sm), single-column on mobile
9. No horizontal overflow at any viewport
10. Layout verified at 375px, 768px, 1440px
11. PDF embeds maintain minimum usable height (≥400px)
12. Run axe DevTools scan: No critical or serious violations
13. Color contrast meets WCAG AA (use WebAIM contrast checker)

**Testing Checklist**:
- [ ] Open About page in Chrome DevTools
- [ ] Run axe DevTools extension (auto-scan)
- [ ] Review results: Fix any critical/serious violations before proceeding
- [ ] Keyboard test:
  - [ ] Tab through all policy items
  - [ ] Verify focus outline visible
  - [ ] Press Enter/Space on PDF item → should expand
  - [ ] Press Enter/Space again → should collapse
  - [ ] Tab to external link → Press Enter → opens in new tab
- [ ] Screen reader test (NVDA or VoiceOver):
  - [ ] Navigate to Club Policies section
  - [ ] Verify section heading announced
  - [ ] Verify each policy announced with type hint
  - [ ] Verify external links announce "(opens in new tab)"
  - [ ] Verify embed title announced
- [ ] Responsive test:
  - [ ] DevTools: Set viewport to 375px
  - [ ] Verify single-column layout
  - [ ] Verify no overflow, buttons tappable
  - [ ] DevTools: Set to 768px → verify flexible layout
  - [ ] DevTools: Set to 1440px → verify two-column layout
  - [ ] Test on actual mobile device if available
- [ ] Color contrast test:
  - [ ] Use WebAIM Contrast Checker
  - [ ] Verify all text meets WCAG AA (4.5:1 for normal text, 3:1 for large text)
- [ ] Commit: "test(about): verify accessibility and responsive layout"

**Dependencies**: W2-003 (JavaScript must be implemented)

**Token Budget**: ~3k-4k

---

## Checkpoint 2: Window 2 Complete

Before proceeding to Window 3, verify:
- [ ] Club Policies section renders on About page
- [ ] Policies listed in alphabetical order
- [ ] Two-column layout on desktop, single-column on mobile
- [ ] PDF expand/collapse works without lag
- [ ] Download buttons produce correct filenames
- [ ] External links open in new tab
- [ ] No console errors
- [ ] Keyboard navigation (Tab, Enter/Space) functional
- [ ] Screen reader announces external links correctly
- [ ] axe DevTools scan: No critical/serious violations

**Manual QA Checklist** (from quickstart.md):
- [ ] Club Policies visible and positioned
- [ ] Policies alphabetical
- [ ] PDF items show correct icon
- [ ] External items show external-link icon
- [ ] PDF expands inline
- [ ] Download button downloads with correct filename
- [ ] Only one PDF expanded at a time
- [ ] External links open in new tab; About page stays open
- [ ] No console errors

---

## Execution Window 3: Resources Page - Manager Tab & Guides Tab

**Duration**: ~5-6 hours | **Token Budget**: ~18k-20k

**Purpose**: Unhide Manager tab, suppress filters, create and implement Guides tab with YouTube embeds.

**Definition of Done**:
- Manager tab visible on page load
- Manager resources display in same card layout as Coaching/Player tabs
- No filter controls visible when Manager tab active
- Guides tab added to tab bar
- YouTube videos embed and play with standard controls
- Responsive at 375px, 768px, 1440px
- Keyboard navigation (arrow keys) works for all tabs
- No console errors

---

### Task W3-001: Unhide Manager Tab & Suppress Filter Bar

**Spec Reference**: FR-008, FR-010, FR-011 | **Traceability**: US-2 (Team Manager)

**Description**: Remove `hidden` class from Manager tab button and update tab-switching JavaScript to suppress filter bar for Manager tab.

**Acceptance Criteria**:
1. Manager tab button (`#tab-managers`) has no `hidden` class
2. Manager tab button is visible and styled consistently with other tabs
3. `switchTab()` JavaScript function checks for `'managers'` tab
4. When Manager tab is active, `#filters-managers` remains hidden
5. When switching to other tabs, their filter bars show as before
6. `#filters-managers` never shows, even if tab switching logic is refactored
7. No console errors during tab switching
8. Tab click and keyboard navigation both work correctly

**Implementation Checklist**:
- [ ] Open `src/pages/resources/index.astro`
- [ ] Find Manager tab button element (looks like `<button id="tab-managers" class="... hidden"...>`)
- [ ] Remove `hidden` class from the button
- [ ] Verify button now visible in browser
- [ ] Find `switchTab()` JavaScript function
- [ ] Update function to check if `tabName === 'managers'`
- [ ] If Manager tab:
  - [ ] Do NOT show `#filters-managers`
  - [ ] Explicitly add `hidden` class to `#filters-managers`
- [ ] For other tabs:
  - [ ] Show corresponding filter bar (existing behavior)
  - [ ] Add `hidden` to `#filters-managers` (permanent suppression)
- [ ] Add code comment: "Manager tab has no filters (FR-011)"
- [ ] Test:
  - [ ] Click each tab in sequence, observe filter bar behavior
  - [ ] Verify Manager tab never shows filters
  - [ ] Verify Coaching/Player tabs show filters
  - [ ] No console errors
- [ ] Commit: "feat(resources): unhide manager tab and suppress filter bar"

**Dependencies**: W1-001 (Type must exist for Resources to recognize 'managers')

**Token Budget**: ~2k-2.5k

---

### Task W3-002: Create & Implement GuidesTabPanel Component

**Spec Reference**: FR-015, FR-016, FR-017 | **Traceability**: US-3 (Guides)

**Description**: Create a new Guides tab and GuidesTabPanel component to render guide cards with embedded YouTube videos.

**Acceptance Criteria**:
1. Guides tab button added to tab bar (`id="tab-guides"`, `role="tab"`)
2. Guides tab panel created (`id="panel-guides"`, `role="tabpanel"`)
3. GuidesTabPanel component receives `guides` array as prop
4. Each guide card displays:
   - [ ] Title
   - [ ] Category label (e.g., "PlayHQ")
   - [ ] Embedded YouTube video with standard controls
   - [ ] Optional description
5. YouTube URLs transformed from various formats to embed URL at render time
6. Videos maintain 16:9 aspect ratio at all viewports (using Tailwind `aspect-video`)
7. Standard YouTube controls visible: play, pause, progress, volume, fullscreen, settings
8. YouTube iframe has descriptive `title` attribute
9. Guide cards use same responsive grid as resource cards
10. Guides grouped or visually labeled by category
11. No console errors
12. Tab bar keyboard navigation includes Guides tab (arrow keys work)

**Implementation Checklist**:
- [ ] Open `src/pages/resources/index.astro`
- [ ] Import guides from `src/data/guides.json`
- [ ] Find tab bar section (with existing tabs)
- [ ] Add Guides tab button:
  ```html
  <button id="tab-guides" role="tab" aria-selected="false" aria-controls="panel-guides" class="tab-btn">
    Guides
  </button>
  ```
- [ ] Add Guides panel div:
  ```html
  <div id="panel-guides" role="tabpanel" aria-labelledby="tab-guides" class="hidden">
    <!-- GuidesTabPanel component will go here -->
  </div>
  ```
- [ ] Create `src/components/GuidesTabPanel.astro` (or .tsx/.jsx)
- [ ] In GuidesTabPanel:
  - [ ] Accept `guides` prop
  - [ ] Implement YouTube URL transformation function
  - [ ] Map guides to card components
  - [ ] Render responsive grid (same as resource cards)
  - [ ] For each guide, render:
    - [ ] Title (as heading)
    - [ ] Category label (as badge or tag)
    - [ ] Embedded YouTube iframe with transformed URL
    - [ ] Optional description text
  - [ ] Use Tailwind `aspect-video` for 16:9 ratio
  - [ ] Add iframe attributes: `allowfullscreen`, `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"`
  - [ ] Add descriptive `title` to iframe
- [ ] Test:
  - [ ] Guides tab visible in tab bar
  - [ ] Click Guides tab → content appears
  - [ ] YouTube videos display and play
  - [ ] Controls visible on desktop and mobile
  - [ ] No console errors
- [ ] Commit: "feat(resources): add Guides tab with YouTube embeds"

**Dependencies**: W1-002 (guides.json must exist)

**Token Budget**: ~6k-7k

---

### Task W3-003: Implement Tab Switching for Guides Tab

**Spec Reference**: FR-015 | **Traceability**: US-3 (Guides)

**Description**: Update tab-switching JavaScript to include Guides tab in the switching logic.

**Acceptance Criteria**:
1. Clicking Guides tab button triggers `switchTab('guides')`
2. Guides tab panel becomes visible (remove `hidden` class)
3. Other tab panels hide (add `hidden` class)
4. `aria-selected` attributes updated correctly
5. Filter bar hidden when Guides tab active
6. Arrow key navigation works for all tabs including Guides
7. Guides tab cycles correctly in tab order (last tab wraps to first, etc.)
8. No console errors

**Implementation Checklist**:
- [ ] Open `src/pages/resources/index.astro`
- [ ] Find tab button elements and add click handlers (or ensure they exist)
- [ ] Verify each tab button has `onclick="switchTab('{tabName}')"` or similar
- [ ] Update `switchTab()` function to handle `'guides'` case:
  ```javascript
  function switchTab(tabName) {
    // Hide all panels
    ['coaching', 'players', 'managers', 'guides'].forEach(name => {
      document.getElementById(`panel-${name}`)?.classList.add('hidden');
    });
    // Show selected panel
    document.getElementById(`panel-${tabName}`)?.classList.remove('hidden');
    // Update aria-selected
    document.querySelectorAll('[role="tab"]').forEach(btn => {
      btn.setAttribute('aria-selected', btn.id === `tab-${tabName}`);
    });
    // Hide all filters except for Coaching/Player
    if (tabName !== 'managers' && tabName !== 'guides') {
      const filterBar = document.getElementById(`filters-${tabName}`);
      if (filterBar) filterBar.classList.remove('hidden');
    }
    // Always hide manager and ensure guides never shows filters
    document.getElementById('filters-managers')?.classList.add('hidden');
  }
  ```
- [ ] Update keyboard navigation (if arrow keys are handled separately):
  - [ ] Include 'guides' in tab order
  - [ ] Arrow right from Manager → Guides
  - [ ] Arrow left from Guides → Manager (or first tab)
- [ ] Test:
  - [ ] Click each tab in sequence
  - [ ] Verify correct panel shows
  - [ ] Verify filter bar hidden for Manager and Guides
  - [ ] Verify arrow key navigation works for all tabs
  - [ ] No console errors
- [ ] Commit: "feat(resources): add guides tab to tab switching logic"

**Dependencies**: W3-002 (Guides component must exist)

**Token Budget**: ~2k-2.5k

---

### Task W3-004: YouTube Embed Responsiveness & Accessibility Testing

**Spec Reference**: NFR-004, NFR-005 | **Traceability**: US-3 (Guides)

**Description**: Verify YouTube embeds maintain 16:9 aspect ratio, are responsive at all viewports, and meet accessibility standards.

**Acceptance Criteria**:
1. YouTube embeds maintain 16:9 aspect ratio at 375px, 768px, 1440px
2. Videos scale to fill available width without overflow
3. Video controls (play, fullscreen, volume) usable on mobile (44px+ tap targets)
4. Fullscreen works on desktop and mobile
5. Videos load and play without errors
6. Each iframe has descriptive `title` attribute (e.g., "How to Score a Game")
7. Keyboard navigation (Tab) includes video iframes
8. Screen reader announces video title and category
9. No layout shifts during video load or play
10. No console errors

**Testing Checklist**:
- [ ] Responsive test (Chrome DevTools):
  - [ ] Set viewport to 375px
  - [ ] Open Guides tab
  - [ ] Verify video fills width without overflow
  - [ ] Verify aspect ratio 16:9 (measure height/width)
  - [ ] Tap play button → video plays
  - [ ] Tap fullscreen → expands correctly
  - [ ] Set viewport to 768px → repeat checks
  - [ ] Set viewport to 1440px → repeat checks
- [ ] Accessibility test:
  - [ ] Inspect `<iframe>` element in DevTools
  - [ ] Verify `title` attribute is descriptive
  - [ ] Verify `allowfullscreen` attribute present
  - [ ] Keyboard test: Tab through guides → focus reaches iframes
  - [ ] Screen reader test: Read guide section, verify title/category announced
  - [ ] Run axe DevTools scan for violations
- [ ] Performance test:
  - [ ] Open Guides tab
  - [ ] Verify videos load within 3 seconds (Chrome Network tab)
  - [ ] Verify no console errors
- [ ] Commit: "test(resources): verify guides responsive and accessible"

**Dependencies**: W3-002, W3-003 (Guides component and tab switching must be complete)

**Token Budget**: ~4k-5k

---

### Task W3-005: Manager Tab Content & Filter Bar Integration Test

**Spec Reference**: FR-009, FR-010 | **Traceability**: US-2 (Team Manager)

**Description**: Verify Manager tab renders resource cards correctly and filter bar suppression works in all scenarios.

**Acceptance Criteria**:
1. Manager tab shows all 8 manager resources (from manager-resources.json)
2. Resource cards use same layout/styling as Coaching/Player cards
3. Cards display: title, description, category, action button
4. Action buttons (download/open link) work correctly
5. No filter bar visible when Manager tab active
6. Switching from filtered tab to Manager → filter bar hides
7. Switching back to original tab → filters still applied (state preserved)
8. No console errors during tab switching
9. Manager resources publicly accessible (no auth gate)

**Testing Checklist**:
- [ ] Open Resources page in browser
- [ ] Click Manager tab
- [ ] Count resources visible (should be ~8)
- [ ] Verify card layout matches Coaching/Player style
- [ ] Verify filter bar completely hidden
- [ ] Click a document link → download or open (should work)
- [ ] Switch to Coaching tab, apply a filter (click category chip)
- [ ] Switch back to Manager tab
- [ ] Verify filter bar still hidden
- [ ] Switch back to Coaching tab
- [ ] Verify filter is still applied (not reset)
- [ ] Test on mobile (375px): Cards stack vertically
- [ ] Verify no console errors: F12 → Console
- [ ] Test incognito window (no auth): Verify Manager resources visible
- [ ] Commit: "test(resources): verify manager tab and filter integration"

**Dependencies**: W3-001 (Manager tab must be visible)

**Token Budget**: ~3k-4k

---

## Checkpoint 3: Window 3 Complete

Before proceeding to Window 4, verify:
- [ ] Manager tab visible and clickable
- [ ] Manager resources display in card layout
- [ ] No filter controls visible for Manager tab
- [ ] Guides tab visible in tab bar
- [ ] Guides tab shows YouTube embeds with controls
- [ ] YouTube videos play correctly at all viewports
- [ ] Tab switching (click and keyboard arrow keys) works for all tabs
- [ ] Filter bar shows/hides correctly based on active tab
- [ ] No console errors

**Manual QA Checklist** (from quickstart.md):
- [ ] Manager tab visible (not hidden)
- [ ] Manager cards use same layout as Coaching/Player
- [ ] No filter bar for Manager tab
- [ ] Guides tab visible
- [ ] Guides show YouTube embeds with controls
- [ ] Videos responsive at 375px, 768px, 1440px
- [ ] Keyboard navigation (arrow keys) works
- [ ] No console errors

---

## Execution Window 4: Testing & Polish

**Duration**: ~4-5 hours | **Token Budget**: ~12k-15k

**Purpose**: Complete manual QA, accessibility audit, browser testing, and final polish.

**Definition of Done**:
- All 24 manual QA items passing
- No WCAG 2.1 AA violations
- Tested on 4 browsers (Chrome, Firefox, Safari, Edge)
- No JavaScript console errors
- PDF performance verified (3s load on 3G)
- Ready for merge and deployment

---

### Task W4-001: Complete Manual QA Checklist

**Spec Reference**: Testing Checklist in spec.md | **Traceability**: All user stories

**Description**: Execute the complete 24-item manual QA checklist from the spec to verify all features working correctly.

**Acceptance Criteria**:
- All 24 QA items pass (see spec.md "Testing Checklist")
- Notes documented for any known limitations
- Issues logged and fixed if blockers
- Feature-complete and user-ready

**QA Checklist** (copy from spec.md):
1. [ ] Club Policies section appears on About page
2. [ ] Policies listed in strict alphabetical order
3. [ ] Two-column layout on desktop; single-column on mobile (375px)
4. [ ] PDF policy items show expand/download icon; external items show external-link icon
5. [ ] Clicking a PDF policy item embeds the PDF inline (no navigation)
6. [ ] Download button appears on expanded PDF and produces correct filename on download
7. [ ] Expanding one policy collapses the previous (accordion)
8. [ ] External policy links open in new tab; About page stays open
9. [ ] All Club Policies publicly accessible without login
10. [ ] Team Manager tab visible in Resources page tab bar (not hidden)
11. [ ] Team Manager tab shows same card layout as Coaching/Player tabs
12. [ ] No filter chips or clear button visible when Team Manager tab is active
13. [ ] Manager documents accessible without login
14. [ ] Guides tab visible in Resources page tab bar
15. [ ] Guide cards display YouTube embeds with standard controls
16. [ ] YouTube videos responsive at 375px, 768px, 1440px
17. [ ] Guides display category labels
18. [ ] No console errors during accordion, tab, or video interaction
19. [ ] Responsive layout verified at 375px, 768px, 1440px
20. [ ] Keyboard: accordion expand/collapse via Enter/Space
21. [ ] Keyboard: tab bar arrow-key navigation includes Guides tab
22. [ ] Screen reader: external links announce "(opens in new tab)"
23. [ ] Screen reader: PDF embeds have descriptive `title` attribute
24. [ ] PDF fallback link visible if browser cannot render embed

**Implementation Checklist**:
- [ ] Print out QA checklist from spec.md
- [ ] For each item, test in Chrome on desktop (1440px)
- [ ] For each item, test on mobile (375px) if viewport-dependent
- [ ] Test in incognito window (verify public access)
- [ ] Document any failures with screenshot/video
- [ ] Fix any blockers before proceeding
- [ ] Document any known limitations or workarounds
- [ ] Sign off: All 24 items passing
- [ ] Commit: "test(qa): manual QA complete, all items passing"

**Dependencies**: W3-004 (All features must be complete)

**Token Budget**: ~5k-6k

---

### Task W4-002: Accessibility Audit & WCAG 2.1 AA Compliance

**Spec Reference**: NFR-001 through NFR-006, AC-8, AC-14 | **Traceability**: All user stories

**Description**: Run comprehensive accessibility audit using axe DevTools and verify WCAG 2.1 AA compliance.

**Acceptance Criteria**:
1. About page: axe DevTools scan shows 0 critical/serious violations
2. Resources page (Manager tab): axe DevTools scan shows 0 critical/serious violations
3. Resources page (Guides tab): axe DevTools scan shows 0 critical/serious violations
4. All interactive elements keyboard operable (Tab, Enter, Space, arrow keys)
5. Focus indicators visible on all focusable elements
6. Screen reader announcements correct and complete
7. External links announce "(opens in new tab)" or similar
8. PDF embeds have descriptive `title` attributes
9. YouTube embeds have descriptive `title` attributes
10. Color contrast meets WCAG AA (4.5:1 for normal text, 3:1 for large)
11. No layout shifts during interaction
12. No tab-trapping (user can tab out of embeds/iframes)

**Testing Checklist**:
- [ ] Install axe DevTools browser extension if not already
- [ ] About page scan:
  - [ ] Open About page in Chrome
  - [ ] Run axe DevTools (Alt+A or extension menu)
  - [ ] Review results: 0 critical, 0 serious
  - [ ] Document any moderate/minor issues (can be accepted with justification)
- [ ] Resources page - Manager tab scan:
  - [ ] Open Resources page
  - [ ] Click Manager tab
  - [ ] Run axe DevTools
  - [ ] Review results: 0 critical, 0 serious
- [ ] Resources page - Guides tab scan:
  - [ ] Click Guides tab
  - [ ] Run axe DevTools
  - [ ] Review results: 0 critical, 0 serious
- [ ] Keyboard navigation test:
  - [ ] Tab through About page: Verify all interactive elements reachable
  - [ ] Tab through Resources page: Verify all tabs and cards reachable
  - [ ] Verify Tab order logical
  - [ ] Verify no elements unreachable via keyboard
- [ ] Focus indicators test:
  - [ ] Tab to each interactive element
  - [ ] Verify focus outline visible (typically blue ring)
  - [ ] Verify outline is sufficient contrast
- [ ] Color contrast test:
  - [ ] Use WebAIM Contrast Checker tool
  - [ ] Sample text colors on About page: Verify ≥4.5:1 normal text
  - [ ] Sample text colors on Resources: Verify ≥4.5:1 normal text
  - [ ] Large text: Verify ≥3:1
- [ ] Screen reader test (NVDA or VoiceOver):
  - [ ] Enable screen reader
  - [ ] Navigate to Club Policies section
  - [ ] Verify heading announced: "Club Policies" or similar
  - [ ] Verify each policy name announced
  - [ ] Verify PDF vs. external link indicated
  - [ ] Expand a PDF: Verify title attribute announced (e.g., "Code of Conduct PDF")
  - [ ] Navigate to external link: Verify "(opens in new tab)" announced
  - [ ] Navigate to Guides tab
  - [ ] Verify guide title, category, video announced
  - [ ] Verify video title attribute announced
- [ ] No tab-trapping:
  - [ ] Tab into a YouTube iframe
  - [ ] Verify you can tab out (usually via Tab key)
  - [ ] Verify focus doesn't get stuck in iframe
- [ ] If violations found:
  - [ ] Document and investigate
  - [ ] Fix in code (e.g., add missing aria-label, improve contrast)
  - [ ] Re-scan to verify fix
- [ ] Commit: "test(a11y): accessibility audit complete, WCAG 2.1 AA compliant"

**Dependencies**: W4-001 (Manual QA must be passing)

**Token Budget**: ~4k-5k

---

### Task W4-003: Browser Compatibility Testing

**Spec Reference**: SC-006 | **Traceability**: All user stories

**Description**: Test feature on 4 major browsers (Chrome, Firefox, Safari, Edge) to verify consistent behavior.

**Acceptance Criteria**:
1. Chrome (latest): All features working, no errors
2. Firefox (latest): All features working, no errors
3. Safari (latest, macOS): All features working, no errors
4. Edge (latest, Chromium-based): All features working, no errors
5. PDF embeds render in all browsers
6. YouTube embeds load and play in all browsers
7. Responsive layout works on all browsers
8. Keyboard navigation works on all browsers
9. No browser-specific console errors
10. Visual styling consistent across browsers

**Testing Checklist**:
- [ ] Chrome (latest):
  - [ ] Navigate to About page
  - [ ] Verify Club Policies visible and functional
  - [ ] Expand a PDF: Verify renders in Chrome PDF reader
  - [ ] Click external link: Verify opens in new tab
  - [ ] Download a PDF: Verify file appears in downloads
  - [ ] Navigate to Resources page
  - [ ] Click Manager tab: Verify cards visible
  - [ ] Click Guides tab: Verify videos play
  - [ ] F12 Console: Verify no errors
- [ ] Firefox (latest):
  - [ ] Repeat above steps
  - [ ] Verify PDF renders (Firefox uses pdf.js)
  - [ ] Verify keyboard navigation works
  - [ ] F12 Console: Verify no errors
- [ ] Safari (macOS, latest):
  - [ ] Repeat above steps
  - [ ] Verify PDF renders (Safari native PDF reader)
  - [ ] Verify YouTube embeds work
  - [ ] Open Web Inspector (Cmd+Opt+I): Verify no errors
- [ ] Edge (Chromium-based, latest):
  - [ ] Repeat above steps (similar to Chrome)
  - [ ] F12 Console: Verify no errors
- [ ] Document browser-specific behavior if any
- [ ] If major discrepancies found:
  - [ ] Debug and fix
  - [ ] Re-test on affected browser
- [ ] All browsers passing: Proceed to deployment
- [ ] Commit: "test(browsers): cross-browser compatibility verified"

**Dependencies**: W4-002 (Accessibility must be passing)

**Token Budget**: ~5k-6k

---

### Task W4-004: PDF Performance & File Size Verification

**Spec Reference**: NFR-006, SC-003 | **Traceability**: US-1 (Club Policies)

**Description**: Verify PDF files are compressed appropriately and load within performance targets.

**Acceptance Criteria**:
1. All PDF files <5MB (no files >5MB without justification)
2. Each PDF loads within 3 seconds on simulated 3G connection (Chrome DevTools Slow 3G)
3. No uncompressed or unnecessarily large PDFs committed
4. File sizes documented (if any file >2MB, note the reason)
5. No broken PDF files in repository

**Testing Checklist**:
- [ ] Check file sizes:
  - [ ] Open file explorer / terminal
  - [ ] List PDF files: `ls -lh /public/resources/club-policies/` and `/public/resources/team-manager/`
  - [ ] Verify all files show size (e.g., 245K, 1.2M, etc.)
  - [ ] Identify any files >5MB (should be none)
  - [ ] Note any files 2-5MB and document reason in commit
- [ ] Performance test (Chrome DevTools):
  - [ ] Open Chrome DevTools (F12)
  - [ ] Go to Network tab
  - [ ] Enable throttling: Set to "Slow 3G"
  - [ ] Navigate to About page
  - [ ] Expand a PDF policy
  - [ ] Watch Network waterfall: Verify PDF request completes within 3 seconds
  - [ ] If PDF takes >3 seconds:
    - [ ] Check file size (may need re-compression)
    - [ ] Consider re-compressing using Ghostscript or similar
    - [ ] Re-test after compression
  - [ ] Repeat for 2-3 PDFs to verify pattern
  - [ ] Reset throttling to "No throttling"
- [ ] Verify PDF integrity:
  - [ ] Download a PDF from the site
  - [ ] Open in PDF reader (Adobe Reader, Preview, etc.)
  - [ ] Verify content is readable and not corrupted
  - [ ] Repeat for 2-3 PDFs
- [ ] Document any large files:
  - [ ] If file is 2-5MB, add comment in about.astro or manager-resources.json
  - [ ] Example: `// policy-large-images.pdf: 3.2MB (contains high-res photos, necessary for compliance docs)`
- [ ] Commit: "test(performance): verify PDF compression and load times"

**Dependencies**: W4-001 (Manual QA must be passing)

**Token Budget**: ~3k-4k

---

### Task W4-005: Final Polish & Documentation

**Spec Reference**: All | **Traceability**: All user stories

**Description**: Perform final code review, update documentation, and prepare for merge.

**Acceptance Criteria**:
1. All code follows codebase conventions (naming, formatting, patterns)
2. No lingering console.log, TODO, or debug code
3. TypeScript compiles without warnings
4. Linter passes (if configured)
5. All comments clear and helpful
6. No dead code or unused imports
7. Documentation updated (if applicable)
8. Git history clean (commits have clear messages)
9. All tasks completed and tracked
10. Ready for code review and merge

**Implementation Checklist**:
- [ ] Code review pass:
  - [ ] Check `src/pages/about.astro` for code quality
  - [ ] Check `src/pages/resources/index.astro` for code quality
  - [ ] Check any new components for consistency with codebase
  - [ ] Verify no `console.log` or debug code
  - [ ] Verify no TODO or FIXME comments without context
  - [ ] Verify naming is clear and consistent
- [ ] TypeScript check:
  - [ ] Run `npm run build`
  - [ ] Verify no TypeScript errors or warnings
  - [ ] If errors: Fix before proceeding
- [ ] Linter check (if configured):
  - [ ] Run `npm run lint` (or similar)
  - [ ] Fix any violations
- [ ] Remove dead code:
  - [ ] Verify all imports are used
  - [ ] Verify all functions/components are called
  - [ ] Remove any placeholder code
- [ ] Update documentation:
  - [ ] If new components created, add JSDoc comments
  - [ ] If complex logic, add inline comments explaining intent
  - [ ] Verify quickstart.md is still accurate
- [ ] Git hygiene:
  - [ ] Review commit history: `git log --oneline cameronwalsh/coa-26-documents..main`
  - [ ] Verify commit messages are clear (e.g., "feat(...): ...", "test(...): ...")
  - [ ] If squashing needed, perform interactive rebase
- [ ] Update MEMORY.md if relevant (handoff notes)
- [ ] Create summary document:
  - [ ] List all files modified
  - [ ] List all files created
  - [ ] List any known limitations
  - [ ] List any future enhancements for follow-up
- [ ] Final verification:
  - [ ] Run `npm run build` one last time
  - [ ] Run `npm run dev` and spot-check key features
  - [ ] All 24 QA items still passing
- [ ] Commit: "docs: final polish and documentation"

**Dependencies**: W4-004 (PDF verification must be passing)

**Token Budget**: ~3k-4k

---

## Checkpoint 4: Window 4 Complete

Before merge, verify:
- [ ] All 24 manual QA items passing
- [ ] axe DevTools: 0 critical/serious violations (About & Resources pages)
- [ ] Tested on Chrome, Firefox, Safari, Edge (all latest)
- [ ] No JavaScript console errors on any browser
- [ ] PDF performance verified (3s load on 3G)
- [ ] TypeScript compiles without errors
- [ ] Linter passes
- [ ] Code clean (no console.log, debug code, dead code)
- [ ] Git history clean with clear commit messages
- [ ] Documentation updated

---

## Merge Checklist

When all windows complete and all checkpoints pass:

- [ ] Branch name: `cameronwalsh/coa-26-documents`
- [ ] All changes committed
- [ ] Push to remote: `git push origin cameronwalsh/coa-26-documents`
- [ ] Create Pull Request (or ask for review)
- [ ] Code review completed
- [ ] All reviewer comments resolved
- [ ] Merge to `main`
- [ ] Delete feature branch
- [ ] Deploy to staging/production as per process

---

## Task Tracking

Use this table to track progress through all 4 windows:

| Task | Window | Status | Notes |
|------|--------|--------|-------|
| W1-001: Update ResourceAudience Type | 1 | ⬜ | Standalone, can start immediately |
| W1-002: Create guides.json | 1 | ⬜ | Standalone, can start immediately |
| W1-003: Prepare PDFs & Update manager-resources.json | 1 | ⬜ | Depends on W1-001 |
| W2-001: Create clubPolicies Data | 2 | ⬜ | Depends on W1-003 |
| W2-002: Build ClubPoliciesSection Component | 2 | ⬜ | Depends on W2-001 |
| W2-003: Implement Accordion JavaScript | 2 | ⬜ | Depends on W2-002 |
| W2-004: Accessibility & Responsive Testing | 2 | ⬜ | Depends on W2-003 |
| W3-001: Unhide Manager Tab & Suppress Filters | 3 | ⬜ | Depends on W1-001 |
| W3-002: Create GuidesTabPanel Component | 3 | ⬜ | Depends on W1-002 |
| W3-003: Implement Tab Switching for Guides | 3 | ⬜ | Depends on W3-002 |
| W3-004: YouTube Embed Testing | 3 | ⬜ | Depends on W3-003 |
| W3-005: Manager Tab Integration Testing | 3 | ⬜ | Depends on W3-001 |
| W4-001: Complete Manual QA Checklist | 4 | ⬜ | Depends on W3-005 |
| W4-002: Accessibility Audit | 4 | ⬜ | Depends on W4-001 |
| W4-003: Browser Compatibility Testing | 4 | ⬜ | Depends on W4-002 |
| W4-004: PDF Performance Verification | 4 | ⬜ | Depends on W4-001 |
| W4-005: Final Polish & Documentation | 4 | ⬜ | Depends on W4-004 |

---

## Execution Notes

### Parallel Tasks [P]

These tasks can run in parallel within their window:
- **Window 1**: W1-001, W1-002, W1-003 can all start at the same time (W1-003 depends on W1-001, so do W1-001 first)
- **Window 2**: W2-001, W2-002 can overlap, but W2-003 must wait for W2-002
- **Window 3**: W3-001, W3-002 can overlap; W3-003, W3-004, W3-005 can overlap with each other but depend on earlier tasks
- **Window 4**: W4-001 must complete first; W4-002, W4-003, W4-004 can overlap; W4-005 last

### Token Budget Guidance

- **Window 1**: ~8k-10k tokens (data/type prep)
- **Window 2**: ~15k-18k tokens (About page implementation + testing)
- **Window 3**: ~18k-20k tokens (Resources page implementation + testing)
- **Window 4**: ~12k-15k tokens (QA and final polish)
- **Total**: ~53k-63k tokens

Adjust based on actual implementation complexity.

### Common Gotchas

1. **PDF Paths**: Ensure paths in `clubPolicies` use relative paths like `'resources/club-policies/code-of-conduct.pdf'` (not absolute).
2. **Filter Bar Suppression**: The `#filters-managers` div must ALWAYS be hidden. Make the suppression explicit in code with comments.
3. **Accordion State**: Only one PDF should be expanded at a time. Use JavaScript to track the "currently expanded" policy.
4. **YouTube URL Transformation**: Handle both `youtu.be/` and `youtube.com/watch?v=` formats.
5. **Responsive Layout**: Test at exact viewport widths (375px, 768px, 1440px) using Chrome DevTools, not approximate sizes.
6. **Accessibility**: Every interactive element needs keyboard support and ARIA attributes. Run axe DevTools frequently.
7. **No Breaking Changes**: Ensure existing Coaching/Player resources continue to work. Don't modify existing data files except to update manager-resources.json URLs.

---

## Support & References

- **Spec**: [spec.md](./spec.md) — Full requirements and acceptance criteria
- **Plan**: [plan.md](./plan.md) — Technical architecture and design decisions
- **Data Model**: [data-model.md](./data-model.md) — Data structure details
- **Contracts**: [contracts.md](./contracts.md) — API and data contracts
- **Research**: [research.md](./research.md) — Technology decisions and alternatives
- **Quickstart**: [quickstart.md](./quickstart.md) — Manual testing guide

---

## End of Tasks Document

**Last Updated**: 2026-04-11 | **Status**: READY_FOR_DEV | **Next Step**: Begin Window 1
