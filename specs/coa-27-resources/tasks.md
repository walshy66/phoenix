# Tasks: COA-27 — Resources: In-Page Modal + Content Pipeline

**Input**: `specs/coa-27-resources/spec.md` + `specs/coa-27-resources/plan.md`
**Strategy**: Option C Execution Windows (GSD-aligned)
**Tracks**: Two independent tracks — Track A (Modal Display, no blockers) and Track B (Content Pipeline, B2 blocked on OQ-1/OQ-2)
**Windows**: 5 total

---

## Format Guide

- **[P]**: Can run in parallel within the same window (different files)
- **Window N**: Execution context boundary — fresh 200k context per window
- **WINDOW_CHECKPOINT**: Validation gate before the next window starts
- **Traceability**: Every task traces to a spec requirement (FR-XXX, AC-N, NFR-XXX)
- **Dependency**: Prior work that must be complete before this task starts

---

## Execution Window 1: Foundation (BLOCKING — both tracks)

**Purpose**: Shared type changes and .gitignore update that every subsequent task depends on. Two files, done once, clears the way for both tracks.

**Token Budget**: 20-30k (very light — two targeted file edits)

**Checkpoint Validation**:
- [ ] `src/lib/resources/types.ts` compiles with no TypeScript errors after adding `sourceDomain` and `CandidateResource`
- [ ] `.gitignore` updated — `specs/coa-27-resources/candidates/` is excluded
- [ ] `npm run build` passes (additive change, no breakage)
- [ ] No existing tests broken

---

### T001 Add `sourceDomain` and `CandidateResource` to `src/lib/resources/types.ts`

**Window**: 1 (Foundation)
**Phase**: Types
**Traceability**: FR-021 (sourceDomain on merged entries), FR-014 (CandidateResource shape), FR-020 (Resource interface conformance)
**Dependencies**: None
**Description**: Extend the existing `Resource` interface with the optional `sourceDomain?: string` field. Add the `CandidateResource` interface as a new export. Both changes are purely additive — no existing data files or consumers break.

**What to modify**:
- File: `src/lib/resources/types.ts`
- Add to `Resource` interface after `url: string`:
  ```ts
  sourceDomain?: string;  // Display name of source org, e.g. "Basketball Victoria"
  ```
- Add new exported interface `CandidateResource` (see plan.md Data Model section for full field list):
  - `title`, `sourceUrl`, `sourceDomain`, `inferredType`, `inferredCategory`, `inferredAgeGroup`, `inferredAudience`, `reachable`, `status`
- No other changes to this file

**Test**:
```bash
npx tsc --noEmit
npm run build
```
Both must pass with no errors. Existing data JSON files (`coaching-resources.json`, `player-resources.json`) require no changes — the new field is optional.

---

### T002 Add `specs/coa-27-resources/candidates/` to `.gitignore`

**Window**: 1 (Foundation)
**Phase**: Config
**Traceability**: NFR-009 (pipeline never runs at build time; candidate files are admin working artefacts)
**Dependencies**: None
**Description**: Candidate files produced by the scrape script contain unreviewed external URLs and are not source-controlled. Add the directory to `.gitignore` so they are never accidentally committed.

**What to modify**:
- File: `.gitignore` (root)
- Add a new entry (grouped near other generated/working artefacts):
  ```
  # COA-27: resource scrape candidates (admin working artefacts, not source-controlled)
  specs/coa-27-resources/candidates/
  ```

**Test**: Run `git status` after creating a file at `specs/coa-27-resources/candidates/test.json` and confirm it does not appear as an untracked file.

---

[WINDOW_CHECKPOINT_1]

**Before proceeding to Window 2**:
- [ ] T001: `npx tsc --noEmit` passes — no type errors
- [ ] T001: `npm run build` passes — no build errors
- [ ] T001: `CandidateResource` interface exported and usable
- [ ] T002: `.gitignore` updated — candidates directory excluded

If both pass, Window 1 is complete. Track A (Windows 2–3) and Track B Window 4 can now proceed. Track B Window 5 remains blocked on OQ-1 and OQ-2.

---

## Execution Window 2: Track A — ResourceModal Component

**Purpose**: Build `ResourceModal.astro` test-first. Tests are written first and must fail before the component exists. The component is built to make the tests pass.

**Token Budget**: 70-90k

**Checkpoint Validation**:
- [ ] `ResourceModal.test.ts` exists and all tests pass
- [ ] `ResourceModal.astro` exists and renders without build errors
- [ ] Component is not yet wired into `resources/index.astro` (that is Window 3)

---

### T003 Write `ResourceModal.test.ts` (test-first — must fail before T004)

**Window**: 2 (Track A — Modal Component)
**Phase**: Tests
**Traceability**: FR-001 (modal opens for video/pdf/document), FR-002 (no navigation), FR-003 (link type skips modal), FR-007 (close button + Escape), FR-008 (focus returns on close), FR-010 (placeholder guard), FR-011 (PDF fallback), FR-012 (video fallback), NFR-001 (focus trap), NFR-002 (role/aria-modal), NFR-003 (close aria-label), NFR-004 (iframe title), NFR-005 (PDF object title)
**Dependencies**: T001 (types available)
**Description**: Write the full test harness for `ResourceModal` following the `SeasonDetailModalTestHarness` pattern already established in `src/components/__tests__/SeasonDetailModal.test.ts`. Model modal state and event handling as pure functions. Do not use a browser.

**What to create**:
- File: `src/components/__tests__/ResourceModal.test.ts`
- Harness class: `ResourceModalTestHarness` with:
  - Constructor accepting: `{ title, url, type, sourceDomain }`
  - `open()` / `close()` / `isOpen()` state methods
  - `pressEscape()` — simulates Escape keypress
  - `clickClose()` — simulates close button click
  - `getIframeTitle()` — returns the `title` attribute the iframe would receive
  - `getEmbedUrl(rawUrl)` — returns the converted embed URL for YouTube/Vimeo
  - `triggerVideoTimeout()` — simulates the 3-second fallback trigger
  - `triggerPdfError()` — simulates the `<object>` error event
  - `setTriggerEl(el)` / `getFocusTarget()` — focus management helpers

**Tests to write (all must FAIL before T004 exists)**:
1. Modal opens when `type: 'video'` — `isOpen()` is true after `open()`
2. Modal opens when `type: 'pdf'` — `isOpen()` is true after `open()`
3. Modal opens when `type: 'document'` — `isOpen()` is true after `open()`
4. Modal does NOT open when `url: "#"` — `open()` is a no-op, `isOpen()` remains false
5. Modal does NOT open when `type: 'link'` — `open()` is a no-op, `isOpen()` remains false
6. Escape keypress closes open modal — `isOpen()` is false after `pressEscape()`
7. Close button click closes open modal — `isOpen()` is false after `clickClose()`
8. Focus returns to trigger element on close — `getFocusTarget()` returns stored triggerEl after `close()`
9. Focus trap: Tab cycles only within modal controls (modal has at least close button and download/link as focusable elements)
10. Role attributes: harness reports `role="dialog"`, `aria-modal="true"`, `aria-labelledby` present
11. Close button has `aria-label="Close resource"`
12. Video iframe receives `title` attribute combining resource title and sourceDomain
13. PDF `<object>` receives `title` attribute matching resource title
14. YouTube embed URL conversion: `youtube.com/watch?v=ABC123` → `youtube.com/embed/ABC123`
15. Vimeo embed URL conversion: `vimeo.com/123456` → `player.vimeo.com/video/123456`
16. Unrecognised video URL: treated as `type: 'link'` (no embed, no modal — opens in new tab)
17. Video fallback shown after `triggerVideoTimeout()` — fallback content visible, iframe hidden
18. Video fallback includes direct link to original resource URL
19. PDF fallback shown after `triggerPdfError()` — fallback message visible, download link present
20. Long title: title string >60 characters renders without throwing (CSS truncation, not JS)
21. Backdrop click closes modal — `clickBackdrop()` sets `isOpen()` to false (OQ-5 default: yes)

**Test Status**: ALL tests must FAIL before T004 creates the component. Commit tests before implementing the component.

---

### T004 Create `ResourceModal.astro` component

**Window**: 2 (Track A — Modal Component)
**Phase**: Implementation
**Traceability**: FR-001 through FR-012, NFR-001 through NFR-008, NFR-011, NFR-012
**Dependencies**: T003 (tests must exist and fail), T001 (types ready)
**Description**: Implement the `ResourceModal.astro` component. Single modal instance — content set via JS data attributes on open. Follows the `GameDetailModal.astro` / `SeasonDetailModal.astro` pattern established in the codebase.

**What to create**:
- File: `src/components/ResourceModal.astro`
- Props: none (content is pushed to the modal via JS before it is shown — see DOM contract below)
- DOM contract (JS sets these attributes/properties on the modal element before calling `openModal()`):
  - `data-modal-title` — resource title string
  - `data-modal-url` — resource URL
  - `data-modal-type` — `'video' | 'pdf' | 'document' | 'link'`
  - `data-modal-source` — sourceDomain string (may be empty)

**Structure**:
- Outer wrapper: `role="dialog"` `aria-modal="true"` `aria-labelledby="resource-modal-title"` `id="resource-modal"`, hidden by default
- Backdrop: full-viewport fixed overlay, darkened (`bg-black/60`), closes modal on click (OQ-5 default)
- Modal panel: `w-full h-full md:w-[95vw] md:h-[90vh]` centred on desktop, full-height on mobile
- Header: `id="resource-modal-title"` for aria binding, truncate-with-ellipsis if overflow, shows sourceDomain below title when present
- Content area: conditionally renders video iframe or PDF `<object>` based on `data-modal-type`
- Video iframe: `allow="autoplay; fullscreen; picture-in-picture"`, `title` = resource title + sourceDomain, 16:9 aspect-ratio wrapper
- PDF `<object>` + `<embed>` fallback: `type="application/pdf"`, `title` = resource title, fills available height
- Download button (PDF/document only): `<a href download>`, uses `brand-gold` colour token, always visible
- Fallback states: hidden by default, shown by JS on timeout (video) or error event (PDF)
- Close button: `aria-label="Close resource"`, positioned in header, focuses on modal open
- Script: handles open/close, focus trap (reuse `trapFocus` utility if it exists in GameDetailModal, otherwise inline), Escape key, video embed URL derivation, 3-second timeout fallback for video, `<object>` error event for PDF, backdrop click close

**Styling**: Use existing Tailwind tokens: `brand-purple`, `brand-gold`, `brand-offwhite`, `brand-black`. Follow the visual pattern of `GameDetailModal.astro`.

**Test Status**: After implementation, ALL 21 tests in T003 must PASS.

---

[WINDOW_CHECKPOINT_2]

**Before proceeding to Window 3**:
- [ ] All 21 tests in `ResourceModal.test.ts` pass
- [ ] `npm run build` passes — `ResourceModal.astro` builds without errors
- [ ] Component renders at 375px, 768px, 1440px (manual spot-check — full responsive QA is in Window 3)
- [ ] No TypeScript errors

---

## Execution Window 3: Track A — Wire Modal into Resources Page

**Purpose**: Connect `ResourceModal.astro` into `resources/index.astro`, update resource cards to open the modal instead of navigating, add `sourceDomain` display, and show "Coming soon" state for placeholder cards. This window completes Track A.

**Token Budget**: 60-80k

**Checkpoint Validation**:
- [ ] All SC-001 through SC-010 manually verified
- [ ] All acceptance criteria AC-1 through AC-11 passing
- [ ] No console errors on modal open/close
- [ ] axe DevTools scan on open modal: no critical/serious WCAG 2.1 AA violations
- [ ] Track A complete — ready to merge independently of Track B

---

### T005 Wire `ResourceModal` into `resources/index.astro` and update card behaviour

**Window**: 3 (Track A — Page Wiring)
**Phase**: Implementation
**Traceability**: FR-001 (modal opens), FR-002 (no navigation), FR-003 (link type opens new tab), FR-006 (title + sourceDomain in header), FR-007 (close button + Escape), FR-008 (filter state preserved on close), FR-010 (placeholder guard), FR-022 (sourceDomain on card), FR-023 (Coming soon state)
**Dependencies**: T004 (component ready), T001 (types ready)
**Description**: Single edit to `src/pages/resources/index.astro`. Imports `ResourceModal`, renders one instance at the bottom of `<BaseLayout>`, adds data attributes to each resource card article, wires a delegated click handler on each grid, and adds the `sourceDomain` label and placeholder "Coming soon" state.

**What to modify**:
- File: `src/pages/resources/index.astro`

**Changes**:

1. **Import and render ResourceModal**: Add `import ResourceModal from '../../components/ResourceModal.astro'` to the frontmatter. Add `<ResourceModal />` as the last child before the closing `</BaseLayout>` tag. One instance only — shared across all three panels.

2. **Data attributes on each card `<article>`**: For every resource card rendered in `#coaching-grid`, `#players-grid`, `#managers-grid`, add:
   - `data-resource-url={resource.url}`
   - `data-resource-type={resource.type}`
   - `data-resource-title={resource.title}`
   - `data-resource-source={resource.sourceDomain ?? ''}`
   These are read by the delegated click handler.

3. **Delegated click handler (inline `<script>`)**: Add a single event listener on each grid div. On card click:
   - Read the four `data-resource-*` attributes from the closest `<article>`
   - If `type === 'link'`: do nothing (the existing `<a target="_blank">` anchor handles it)
   - If `url === '#'`: do nothing (card is non-interactive — see item 5)
   - Otherwise: populate the modal's data attributes and call `openModal()`, storing the clicked card as the trigger element for focus return

4. **`sourceDomain` label on cards**: In the card template, after the category badge, add:
   ```html
   {resource.sourceDomain && (
     <span class="text-xs text-gray-500 mt-1 block">{resource.sourceDomain}</span>
   )}
   ```
   No label rendered when `sourceDomain` is absent (OQ-3 default).

5. **Placeholder card state (`url: "#"`)**: Replace the card's `<a>` action link with a non-interactive element when `resource.url === '#'`:
   - Use `<span class="cursor-not-allowed opacity-60 ...">Coming soon</span>` in place of the action anchor
   - The card remains visible and filterable — only the action element is replaced

6. **No changes to filter logic**: The existing `applyFilters`, `selectedTags`, `clearFilters` JS reads `data-age` and `data-category` — these are unchanged. Filter state is preserved across modal open/close because no navigation occurs (FR-002).

**Test**: Manual QA checklist from `plan.md` Testing Strategy section — all 16 items. Focus on:
- Video card opens modal with embedded iframe (no navigation)
- PDF card opens modal with embed and download button
- `type: 'link'` card opens new tab, no modal
- Placeholder card shows "Coming soon", modal does not open
- Escape closes modal, focus returns to triggering card
- Close button closes modal, focus returns to triggering card
- Active filters remain after modal close on all three tabs
- Fallback states (manual test with `about:blank` iframe URL and a 404 PDF URL)

---

### T006 Responsive and accessibility QA for Track A

**Window**: 3 (Track A — QA)
**Phase**: Validation
**Traceability**: NFR-006 (375px/768px/1440px), SC-006 (keyboard nav), SC-007 (WCAG 2.1 AA), SC-008 (no overflow/broken ratios), SC-009 (no console errors), AC-6 (filters preserved), AC-7 (mobile video), AC-10 (focus trap), AC-16 (axe audit)
**Dependencies**: T005 (modal wired into page)
**Description**: Structured manual QA pass covering responsive layout, keyboard navigation, and accessibility audit. Not a new automated test file — this is the validation gate before Track A can be considered done.

**QA checklist** (all items must pass):

Responsive:
- [ ] 375px: open a video resource — video fills modal width, 16:9 ratio maintained, controls usable
- [ ] 375px: open a PDF resource — PDF is readable, download button visible without scrolling past content
- [ ] 768px: modal opens and closes correctly, no layout overflow
- [ ] 1440px: modal overlay covers ≥85% viewport height and width, darkened backdrop visible behind modal
- [ ] Resize viewport while modal is open (desktop to mobile and back) — modal remains usable without reload

Keyboard navigation:
- [ ] Tab key cycles only within modal controls while modal is open (focus does not reach the page behind)
- [ ] Shift+Tab cycles in reverse within modal controls
- [ ] Escape closes modal from any focused element within the modal
- [ ] Focus returns to the exact resource card that opened the modal after close

Accessibility audit:
- [ ] Open modal with axe DevTools browser extension — no critical or serious WCAG 2.1 AA violations reported
- [ ] `role="dialog"` and `aria-modal="true"` present on modal element
- [ ] `aria-labelledby` points to the modal title element
- [ ] Close button has visible label or `aria-label="Close resource"`
- [ ] Video iframe has descriptive `title` attribute (includes resource title)
- [ ] PDF `<object>` has descriptive `title` attribute

Console and errors:
- [ ] No JavaScript console errors during modal open, video/PDF display, or modal close
- [ ] Video fallback appears when iframe load times out (test by pasting an invalid YouTube embed URL into the data attribute via DevTools)
- [ ] PDF fallback appears when `<object>` errors (test by using a 404 URL)

Placeholder and link cards:
- [ ] Placeholder card (`url: "#"`) shows "Coming soon" text, action area is non-interactive
- [ ] `type: 'link'` card still opens in new tab, modal does not appear
- [ ] Long resource title (>60 chars) truncates in modal header with ellipsis — no overflow

**Test Status**: All checklist items must pass before WINDOW_CHECKPOINT_3.

---

[WINDOW_CHECKPOINT_3]

**Before proceeding to Window 4**:
- [ ] T005: `ResourceModal` wired into page, all card behaviours correct
- [ ] T006: All QA checklist items pass
- [ ] All acceptance criteria AC-1 through AC-11 verified
- [ ] `npm run build` passes
- [ ] Track A is shippable as a standalone PR (no dependency on Track B)

Track A is complete at this checkpoint. Track B (Windows 4–5) can proceed independently.

---

## Execution Window 4: Track B — Merge Script Infrastructure

**Purpose**: Build `scripts/merge-resources.js` and its Vitest test suite. This window has no dependency on OQ-1 or OQ-2 — it works entirely against fixture data and can be built while scrape questions are resolved.

**Token Budget**: 60-80k

**Checkpoint Validation**:
- [ ] All `resource-merge.test.ts` tests pass
- [ ] `merge-resources.js` runs without error against a fixture candidate file
- [ ] `package.json` has `resources:merge` script entry
- [ ] Output JSON validates against the `Resource` interface shape

---

### T007 Write `resource-merge.test.ts` (test-first — must fail before T008)

**Window**: 4 (Track B — Merge Script)
**Phase**: Tests
**Traceability**: FR-016 (approved entries written to correct JSON), FR-017 (idempotent on sourceUrl), FR-018 (uncategorised skipped with warning), FR-019 (manual entries preserved), FR-020 (output valid JSON), FR-021 (sourceDomain present on merged entries), AC-13 (approved entries appended), AC-14 (duplicate skipped), AC-15 (uncategorised skipped with warning)
**Dependencies**: T001 (CandidateResource type defined)
**Description**: Pure function unit tests for merge script logic. Input: fixture candidate JSON + fixture existing resource JSON. Output: resulting resource array. No file I/O in the tests — the merge logic is extracted as pure functions and tested in isolation.

**What to create**:
- File: `src/components/__tests__/resource-merge.test.ts`
- Fixture data (inline in test file or in a `fixtures/` sub-object):
  - `fixtureExistingCoaching`: 2-3 valid `Resource` objects matching the existing `Resource` interface (manually authored entries)
  - `fixtureCandidates`: a `CandidateResource[]` array covering:
    - One approved entry, valid category, coaching audience, URL not in existing data
    - One approved entry with `inferredCategory: 'uncategorised'`
    - One approved entry whose `sourceUrl` already exists in `fixtureExistingCoaching`
    - One rejected entry
    - One pending entry
    - One approved entry, valid category, players audience

**Tests to write (all must FAIL before T008 exists)**:
1. Approved entry with valid category and new URL is added to output array
2. Approved entry with `inferredCategory: 'uncategorised'` is NOT added; a warning is logged (spy on `console.warn`)
3. Approved entry whose `sourceUrl` already exists in target JSON is NOT added; a skip is logged (spy on `console.log`)
4. Rejected entry is not added to output (regardless of category)
5. Pending entry is not added to output
6. Approved coaching entry goes to `coaching-resources.json` output; approved players entry goes to `player-resources.json` output (separate output arrays)
7. Existing entries in target JSON are all present in output — nothing removed or overwritten
8. Running merge twice on the same candidate file produces identical output (idempotency — second run skips all by URL match)
9. Output entries contain `sourceDomain` field matching the candidate's `sourceDomain`
10. Output entries contain `dateAdded` field in ISO date format (`YYYY-MM-DD`)
11. Output entry `id` is auto-generated in the pattern `{audience}-{sourceDomain-slug}-{n}` and does not collide with existing entry IDs
12. Output JSON is parseable and all output entries conform to the `Resource` interface shape (required fields present, no extra required fields missing)

**Test Status**: ALL tests must FAIL before T008 implements the script. Commit tests before implementing.

---

### T008 Create `scripts/merge-resources.js` and add npm script

**Window**: 4 (Track B — Merge Script)
**Phase**: Implementation
**Traceability**: FR-016 through FR-021, NFR-009 (local CLI only, not at build time), NFR-010 (idempotent)
**Dependencies**: T007 (tests must exist and fail), T001 (types defined for reference)
**Description**: Implement the merge script as a local CLI tool in `scripts/`. Plain JS (matching the existing `scripts/scrape-playhq.js` pattern). Uses Node 22 built-ins only — no new npm dependencies.

**What to create**:
- File: `scripts/merge-resources.js`
- CLI usage: `node scripts/merge-resources.js <path-to-candidate-file.json>`
- Logic (extract as pure functions so tests can import them without triggering file I/O):
  1. Read candidate file at the path passed as `process.argv[2]`; fail with a clear error message if not provided or not found
  2. Filter to entries with `status: "approved"`
  3. For each approved entry:
     - If `inferredCategory === 'uncategorised'`: log warning with title + URL, skip
     - If `sourceUrl` already exists in the target JSON: log skip with title + URL, skip
  4. Transform `CandidateResource` → `Resource`:
     - `id`: `{inferredAudience}-{sourceDomain-slug}-{n}` where slug is lowercase, hyphens only, and `n` is a zero-padded sequential integer not already used in the target file
     - `url`: from `sourceUrl`
     - `sourceDomain`: from `sourceDomain`
     - `type`: from `inferredType`
     - `category`: from `inferredCategory`
     - `ageGroup`: from `inferredAgeGroup`
     - `audience`: from `inferredAudience`
     - `dateAdded`: today's ISO date (`YYYY-MM-DD`)
     - `title`, `description`: from candidate (description may default to `title` if not present in candidate)
  5. Append new entries to the correct file: `coaching` → `src/data/coaching-resources.json`; `players` → `src/data/player-resources.json`
  6. Write file back: pretty-printed, 2-space indent (matching existing file format)
  7. Print summary: `Added N entries to coaching-resources.json. Skipped N (duplicate). Skipped N (uncategorised).`
- Export pure functions (`filterApproved`, `validateEntry`, `transformCandidate`, `mergeEntries`) so tests can import and call them directly without triggering Node file I/O

**What to modify**:
- File: `package.json`
- Add to `scripts` block:
  ```json
  "resources:merge": "node scripts/merge-resources.js"
  ```

**Test Status**: ALL 12 tests in `resource-merge.test.ts` must PASS after implementation. Run the script manually against a small fixture file to verify summary output and idempotency.

---

### T009 Manual smoke test: merge script against fixture candidate file

**Window**: 4 (Track B — Merge Smoke Test)
**Phase**: Validation
**Traceability**: SC-004 (merge adds approved candidates, no duplicates when run twice), AC-13 (approved appended, existing untouched, valid JSON), AC-14 (duplicate skipped)
**Dependencies**: T008 (merge script implemented and tested)
**Description**: Manual validation that the merge script works end-to-end against a real (small) fixture file before the scrape script is built. Creates a fixture candidate file by hand and runs the merge twice.

**Steps**:
1. Create a small fixture at `specs/coa-27-resources/candidates/smoke-test.json` (3–4 entries: 1 approved valid, 1 approved uncategorised, 1 rejected, 1 approved duplicate of an existing coaching entry)
2. Run: `node scripts/merge-resources.js specs/coa-27-resources/candidates/smoke-test.json`
3. Verify summary log: "Added 1 entries. Skipped 1 (duplicate). Skipped 1 (uncategorised)."
4. Inspect `src/data/coaching-resources.json` — confirm 1 new entry appended, all previous entries intact, valid JSON
5. Run the same command again (idempotency): `node scripts/merge-resources.js specs/coa-27-resources/candidates/smoke-test.json`
6. Verify summary: "Added 0 entries. Skipped 2 (duplicate). Skipped 1 (uncategorised)." — no duplicates created
7. Inspect `coaching-resources.json` again — entry count unchanged, file is still valid JSON

**Test Status**: All 6 verification steps must pass. The smoke-test file is in `candidates/` and is gitignored — it does not get committed.

---

[WINDOW_CHECKPOINT_4]

**Before proceeding to Window 5**:
- [ ] All 12 tests in `resource-merge.test.ts` pass
- [ ] T009 smoke test: merge script runs, produces correct summary, idempotency confirmed
- [ ] `npm run build` still passes — merge script is CLI-only, not imported by Astro build
- [ ] `package.json` has `resources:merge` npm script
- [ ] Track B merge infrastructure is complete and independently testable

Window 5 (scrape script) remains blocked until OQ-1 and OQ-2 are resolved. Do not proceed to Window 5 without those answers.

---

## Execution Window 5: Track B — Scrape Script (BLOCKED on OQ-1 and OQ-2)

**Purpose**: Build `scripts/scrape-resources.js` and run the live one-time scrape. This window cannot begin until OQ-1 (target URL patterns per org) and OQ-2 (candidate file format — confirmed JSON) are resolved by the feature owner.

**Blocking conditions** (do not start this window until both are answered):
- **OQ-1**: Specific pages/URL patterns to target on each of the six organisations (Basketball Victoria, Basketball Australia, NBL, WNBL, NBA, WNBA). Without these, the scrape crawls from homepages with low signal-to-noise ratio.
- **OQ-2**: Candidate file format confirmed as JSON edited in text editor (plan.md default: yes — but confirm before building scrape UX around it).

**Token Budget**: 80-100k (scrape script is the most complex piece; also includes live scrape run and admin review)

**Checkpoint Validation**:
- [ ] Scrape script produces candidate file with ≥1 result from ≥3 of the 6 target sources (SC-003)
- [ ] Admin review complete: candidate file has `approved`/`rejected` status on all entries
- [ ] Merge run against reviewed candidate file: approved entries in correct JSON files
- [ ] Manual QA: `sourceDomain` label visible on new cards, filters correctly include new entries
- [ ] SC-005: at least one resource from each of man-to-man defence, zone defence, offensive systems present

---

### T010 Create `scripts/scrape-resources.js`

**Window**: 5 (Track B — Scrape Script)
**Phase**: Implementation
**Traceability**: FR-013 (scrape accepts target sources, produces candidate file), FR-014 (candidate entry fields), FR-015 (content focus: skills, defence, offence), AC-12 (candidate file produced with all required fields)
**Dependencies**: T001 (CandidateResource type for reference), OQ-1 resolved (URL patterns), OQ-2 confirmed (JSON format)
**Description**: One-time local CLI scrape script. Node 22 native `fetch` only — no new npm dependencies. String-based HTML scanning (not full DOM parse). Writes `specs/coa-27-resources/candidates/candidates-{YYYY-MM-DD}.json`.

**What to create**:
- File: `scripts/scrape-resources.js`
- Configuration object at top of file — one entry per target org, editable by admin before running:
  ```js
  const SOURCES = [
    { name: 'Basketball Victoria', urls: [ /* filled from OQ-1 answer */ ] },
    { name: 'Basketball Australia', urls: [ /* filled from OQ-1 answer */ ] },
    { name: 'NBL', urls: [ /* filled from OQ-1 answer */ ] },
    { name: 'WNBL', urls: [ /* filled from OQ-1 answer */ ] },
    { name: 'NBA', urls: [ /* filled from OQ-1 answer */ ] },
    { name: 'WNBA', urls: [ /* filled from OQ-1 answer */ ] },
  ];
  ```
- Logic per source URL:
  1. Fetch page HTML with `fetch()`, follow redirects, catch network errors gracefully (log source as zero-results if fetch fails)
  2. Extract all `<a href>` links from raw HTML via regex (not DOM parse)
  3. Infer type from URL: `.pdf` extension → `'pdf'`; YouTube/Vimeo URL → `'video'`; else → `'link'`
  4. Infer category from URL path + link text keywords (see plan.md Phase B2 for keyword lists)
  5. Filter out irrelevant URLs: skip paths matching `/tickets`, `/merchandise`, `/shop`, `/media/press`, `/contracts`, `/news` (unless link text has a skills keyword match)
  6. Deduplicate by URL within the candidate list
  7. Perform HEAD request for each candidate URL; record `reachable: true/false`
  8. Set `status: 'pending'` on all entries
- Output: write `specs/coa-27-resources/candidates/candidates-{date}.json` conforming to the candidate file format in plan.md Data Model section (includes `scrapeDate`, `sources`, `summary`, `candidates` array)
- If a source returns zero candidates after filtering: log it, include the source name in a `zeroResultSources` field in the output summary. Script does not fail.

**What to modify**:
- File: `package.json`
- Add to `scripts` block:
  ```json
  "resources:scrape": "node scripts/scrape-resources.js"
  ```

**Test**: No automated unit tests for the scrape script (it is a one-time network tool). Validation is the live run in T011.

---

### T011 Run live scrape, admin review, and merge

**Window**: 5 (Track B — Live Run)
**Phase**: Pipeline Execution + Validation
**Traceability**: US-2 (admin reviews and approves scraped candidates), US-3 (coach discovers curated content), SC-003 (≥1 result from ≥3 sources), SC-004 (merge idempotent), SC-005 (priority content areas represented), AC-12 through AC-15
**Dependencies**: T010 (scrape script built), T008 (merge script ready), OQ-4 guidance applied (Defence category for man-to-man and zone — plan.md default)
**Description**: The one-time production run. Run scrape → review candidates → run merge → validate output in the browser.

**Steps**:
1. Run scrape: `npm run resources:scrape`
2. Open `specs/coa-27-resources/candidates/candidates-{date}.json` in text editor
3. For each candidate:
   - Verify title and URL make sense
   - Check `reachable` flag — skip unreachable if the content is not important
   - Assign correct category if `inferredCategory: 'uncategorised'` — must set a valid `CoachingCategory` value before approving
   - Set `status` to `"approved"` or `"rejected"` for each entry
   - Ensure at least one approved entry per priority area: Defence (man-to-man and zone), Offence (flow systems), Drills/Fundamentals (skills videos)
4. Run merge: `npm run resources:merge specs/coa-27-resources/candidates/candidates-{date}.json`
5. Inspect merge summary output — note counts, confirm any warnings for uncategorised/duplicate entries
6. Run `npm run build` — confirm build passes with new JSON data
7. Open Resources page in browser (dev server or build preview):
   - Coaching tab: confirm new sourced resources visible with `sourceDomain` label
   - Filter for "Defence" — man-to-man and zone entries appear
   - Open a sourced video resource in the modal — video embeds inline (Track A integration)
   - Open a sourced PDF resource in the modal — PDF renders inline with download button
   - Confirm filter state preserved after modal close

**Pipeline QA checklist**:
- [ ] Candidate file produced with entries from ≥3 of the 6 target sources (SC-003)
- [ ] All approved entries present in `coaching-resources.json` or `player-resources.json` after merge
- [ ] No duplicate URLs in output JSON files
- [ ] `sourceDomain` field present on all merged entries
- [ ] Output JSON files are valid (parseable, no trailing commas)
- [ ] Manual entries in existing JSON files unchanged
- [ ] Run merge twice — second run: "Added 0 entries" (idempotency confirmed, SC-004)
- [ ] At least one resource in each of: man-to-man defence, zone defence, offensive systems (SC-005)

**Test Status**: All 8 pipeline QA checklist items must pass. Track B is complete when this checkpoint is fully green.

---

[WINDOW_CHECKPOINT_5]

**Feature Complete**:
- [ ] All windows 1–5 passed their checkpoints
- [ ] Track A: modal opens for all video/pdf/document resources, filter state preserved, accessibility validated
- [ ] Track B: merge script tested and idempotent, scrape run, real content in JSON files
- [ ] SC-001 through SC-010 all satisfied
- [ ] AC-1 through AC-16 all verified
- [ ] `npm run build` passes
- [ ] Ready for final PR merge

---

## Summary

**Total Execution Windows**: 5
**Estimated Tokens**:
- Window 1 (Foundation): 20-30k
- Window 2 (Modal Component): 70-90k
- Window 3 (Page Wiring + QA): 60-80k
- Window 4 (Merge Script): 60-80k
- Window 5 (Scrape Script + Live Run): 80-100k
- **Total**: 290-380k tokens

**Track sequencing**:
```
Window 1 (Foundation) — no dependencies, start immediately
  ↓
Window 2 (Modal Component) — depends on Window 1
  ↓
Window 3 (Page Wiring) — depends on Window 2 — Track A COMPLETE here (shippable PR)
  ↓ (parallel with Window 4 if desired)
Window 4 (Merge Script) — depends on Window 1 only — can start after Window 1
  ↓
Window 5 (Scrape + Live Run) — depends on Window 4 AND OQ-1/OQ-2 resolved
```

Track A (Windows 2–3) and Track B Window 4 can be developed in parallel after Window 1 completes. Track B Window 5 is the only window blocked on external questions.

---

## Key Rules

### Rule 1: One window = one fresh context
Each window is executed in a clean 200k context. The implement agent reads `STATE.md` for prior checkpoint results, not chat history.

### Rule 2: Checkpoints gate progression
Each window has an explicit validation checklist. A window is not done until its checkpoint passes. Never skip ahead on assumption.

### Rule 3: Test-first within each implementation window
Tests in T003 and T007 must be committed and confirmed failing before T004 and T008 are written. Do not write implementation and tests together.

### Rule 4: Track A is independently shippable
After Window 3 checkpoint passes, Track A can be merged as a standalone PR without waiting on Track B. The modal works with existing placeholder data. Track B adds real content later.

### Rule 5: Window 5 does not start without OQ-1 and OQ-2
Do not attempt to implement T010 without confirmed URL patterns (OQ-1) and confirmed candidate file format (OQ-2). Building the scrape against the wrong targets wastes the entire window.

### Rule 6: No new runtime dependencies
NFR-007 is a hard constraint. No third-party modal library, no PDF.js, no cheerio, no puppeteer. Node 22 built-ins only for scripts. Native HTML/CSS/JS only for the modal.
