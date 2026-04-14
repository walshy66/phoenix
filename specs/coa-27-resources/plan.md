# Implementation Plan: COA-27 — Resources: In-Page Modal + Content Pipeline

**Branch**: `cameronwalsh/coa-27-resources` | **Date**: 2026-04-13 | **Spec**: `specs/coa-27-resources/spec.md`

---

## Summary

Two independent tracks delivered in sequence. Track A (modal display) can be built and shipped without waiting on open questions about the pipeline. Track B (content pipeline) depends on two open questions (OQ-1 and OQ-2) being resolved before scraping begins, but the merge infrastructure can be built in parallel.

The site remains fully static Astro after this feature. No backend is introduced. The scrape and merge scripts are local CLI tools in `scripts/`, following the established pattern of `scripts/scrape-playhq.js` and companions.

---

## Technical Context

- **Language/Version**: Node 22+ (engines field in package.json), TypeScript via Astro's frontmatter, plain JS for CLI scripts (matching existing scripts/)
- **Primary Dependencies**: Astro 6, Tailwind CSS 4, Vitest 4 — no new runtime dependencies (NFR-007)
- **Storage**: Static JSON files in `src/data/` — no database
- **Testing**: Vitest (existing harness), test harness pattern per `SeasonDetailModal.test.ts`
- **Target Platform**: Web — desktop and mobile, verified at 375px / 768px / 1440px
- **Performance Goals**: Modal opens within one animation frame (NFR-008); no additional HTTP request required to open a modal
- **Scale/Scope**: ~15 existing coaching resources, ~10+ player resources, ~5 manager resources; post-pipeline possibly 40–60 total

---

## Constitution Check

| Principle | Assessment |
|---|---|
| I — User Outcomes First | PASS: Three user stories with observable independent tests and Given/When/Then acceptance criteria |
| II — Test-First Discipline | PASS: Tests written before implementation; test harness pattern is established in the codebase |
| III — Backend Authority | N/A: Static site. Merge script enforces data contract (no duplicates, no uncategorised) at pipeline boundary |
| IV — Error Semantics | PASS: Modal fallback states for broken PDFs/videos specified; merge script skip/warn logging specified |
| V — AppShell Integrity | PASS: Modal is an overlay inside BaseLayout; no new routes or navigation shells |
| VI — Accessibility First | PASS: focus trap, role="dialog", aria-modal, aria-labelledby, Escape key, close aria-label — all specified |
| VII — Immutable Data Flow | PASS: Modal holds no persistent state; merge script appends only, never overwrites manual entries |
| VIII — Dependency Hygiene | PASS: No new runtime dependencies; CLI scripts use Node built-ins + fetch (Node 22 native) |
| IX — Cross-Feature Consistency | PASS: Modal pattern follows SeasonDetailModal / GameDetailModal established in codebase |

**Warnings carried from spec**:

- `Resource` interface extension (`sourceDomain?: string`) is additive. Confirm no open branch touching `src/lib/resources/types.ts` before implementation.
- OQ-1 (scrape URL patterns) and OQ-2 (admin review format) block running the scrape; they do not block the modal track or the merge script infrastructure.

---

## Open Questions — Blocking Analysis

| Question | Blocks | Decision needed before |
|---|---|---|
| OQ-1: Target URL patterns per org | Scrape script implementation | Track B scrape phase |
| OQ-2: Candidate file format (JSON vs CLI prompts) | Scrape script UX + merge script design | Track B scrape phase |
| OQ-3: `sourceDomain` display on existing placeholder cards | ResourceCard UI (minor display choice) | Track A Phase 2 card updates — low risk, default to omit label when field absent |
| OQ-4: Category mapping (Defence subcategory or not) | Category assigned to scraped entries | Track B merge phase; recommend map to existing `Defence` for now, no new filter chips |
| OQ-5: Backdrop click closes modal | Modal behaviour (one line of JS) | Track A Phase 1 — implement backdrop close as default, easy to remove |

**Recommended defaults** (proceed without blocking on OQ-3, OQ-4, OQ-5):
- OQ-3: Omit `sourceDomain` label entirely when the field is absent — no "Bendigo Phoenix" fallback
- OQ-4: Both man-to-man and zone defence map to existing `Defence` category
- OQ-5: Backdrop click closes the modal (consistent with SeasonDetailModal / GameDetailModal)

---

## Project Structure

```
src/
├── components/
│   └── ResourceModal.astro          (new — Track A)
├── lib/
│   └── resources/
│       └── types.ts                 (update — add sourceDomain?: string, CandidateResource type)
├── data/
│   ├── coaching-resources.json      (updated by merge script — Track B)
│   ├── player-resources.json        (updated by merge script — Track B)
│   └── manager-resources.json       (untouched — manager resources are club-internal documents)
└── pages/
    └── resources/
        └── index.astro              (update — wire modal, add sourceDomain display, placeholder state)

scripts/
├── scrape-resources.js              (new — Track B, one-time local CLI)
└── merge-resources.js               (new — Track B, local CLI)

specs/coa-27-resources/
├── spec.md
├── plan.md                          (this file)
├── candidates/                      (gitignored working directory for scrape output)
│   └── candidates-YYYY-MM-DD.json   (produced by scrape, reviewed by admin, consumed by merge)
└── tasks.md                         (next artifact)

src/components/__tests__/
├── ResourceModal.test.ts            (new — Track A)
└── resource-merge.test.ts           (new — Track B, tests merge script logic)
```

The `specs/coa-27-resources/candidates/` directory should be added to `.gitignore` — candidate files are admin working artefacts, not source-controlled (they may contain unreviewed external URLs).

---

## Data Model Changes

### 1. `src/lib/resources/types.ts` — additive only

Add `sourceDomain?: string` to the `Resource` interface:

```ts
export interface Resource {
  id: string;
  title: string;
  description: string;
  audience: ResourceAudience;
  category: string;
  ageGroup: string;
  type: ResourceType;
  url: string;
  sourceDomain?: string;   // NEW — display name of source org, e.g. "Basketball Victoria"
  imageUrl?: string;
  dateAdded: string;
}
```

Add the `CandidateResource` type (used by both scrape and merge scripts — shared type for import in scripts):

```ts
export interface CandidateResource {
  title: string;
  sourceUrl: string;
  sourceDomain: string;
  inferredType: 'video' | 'pdf' | 'link';
  inferredCategory: string;         // CoachingCategory value or 'uncategorised'
  inferredAgeGroup: string;         // AgeGroup value or 'All Ages'
  inferredAudience: 'coaching' | 'players';
  reachable: boolean;
  status: 'pending' | 'approved' | 'rejected';
}
```

Note: `CandidateResource` is defined in types.ts for type safety but is only consumed by the CLI scripts — it is never imported by the Astro build.

### 2. JSON data files — no breaking changes

Existing entries with no `sourceDomain` field remain valid. The field is optional. No migration of existing entries is required.

### 3. Candidate file format (`candidates-YYYY-MM-DD.json`)

```json
{
  "scrapeDate": "2026-04-13",
  "sources": ["Basketball Victoria", "Basketball Australia", "NBL", "WNBL", "NBA", "WNBA"],
  "summary": { "total": 42, "reachable": 39, "unreachable": 3 },
  "candidates": [
    {
      "title": "...",
      "sourceUrl": "https://...",
      "sourceDomain": "Basketball Victoria",
      "inferredType": "video",
      "inferredCategory": "Defence",
      "inferredAgeGroup": "All Ages",
      "inferredAudience": "coaching",
      "reachable": true,
      "status": "pending"
    }
  ]
}
```

Admin edits `status` to `"approved"` or `"rejected"` directly in this file in their text editor (OQ-2 default: JSON file). The merge script reads this file and acts on `"approved"` entries.

---

## Track A — Modal Display

### Phase A1: ResourceModal component

**Goal**: A reusable `ResourceModal.astro` component following the established `SeasonDetailModal` and `GameDetailModal` pattern. Renders inline in `resources/index.astro` as a single instance whose content is swapped when different cards are opened.

**Key design decisions**:

1. **Single modal instance, not per-card**: One `<ResourceModal>` is rendered in the page DOM. JS swaps its content (title, url, type, sourceDomain) when a card is clicked. This avoids N DOM iframes (one per resource card) and keeps keyboard focus management simple.

2. **Near-fullscreen sizing**: Unlike the compact `max-w-2xl` SeasonDetailModal, ResourceModal uses `w-full h-full md:w-[95vw] md:h-[90vh]` — large enough to read PDFs and watch videos without zooming. Backdrop covers the full viewport behind it.

3. **URL stability**: The page URL does not change when the modal opens (FR-002). No hash routing, no query string. This is a deliberate trade-off: deep-linking to a specific open resource is out of scope for this feature.

4. **Video embed URL derivation**: YouTube watch URLs (`youtube.com/watch?v=ID`) are converted to embed URLs (`youtube.com/embed/ID`) in JS at modal open time. Vimeo (`vimeo.com/ID` → `player.vimeo.com/video/ID`) follows the same pattern. Unrecognised video URLs are treated as `type: 'link'` — consistent with the edge case in the spec.

5. **PDF/document embed**: Uses `<object data="{url}" type="application/pdf">` with an `<embed>` fallback. The native browser PDF viewer is relied upon (no PDF.js). The download button uses the HTML `download` attribute. Failure detection: `<object>` fires an `error` event if the document cannot be loaded; the JS handler shows the fallback message.

6. **Iframe error handling for video**: `iframe.onerror` and a `postMessage`-based approach are unreliable across providers. Instead, a `load` event timeout (3s) is used: if the iframe `load` event has not fired within 3 seconds, assume failure and show the fallback. On load, the fallback is hidden.

**Component interface**:

```
Props:
  (none — content is set via JS dataset attributes when the modal opens)

DOM contract (set by the card click handler before opening):
  data-modal-title       → resource title
  data-modal-url         → resource URL
  data-modal-type        → 'video' | 'pdf' | 'document' | 'link'
  data-modal-source      → sourceDomain (may be empty string)
```

**Accessibility implementation**:
- `role="dialog"` `aria-modal="true"` `aria-labelledby="resource-modal-title"`
- Focus sent to close button on open (consistent with existing modals)
- Focus trap: Tab/Shift+Tab cycle within modal only (same `trapFocus` utility pattern from GameDetailModal)
- Escape closes and returns focus to triggering card element (stored as `let triggerEl` before open)
- Close button: `aria-label="Close resource"`
- Video iframe: `title` attribute set from resource title + sourceDomain
- PDF object: `title` attribute set from resource title

### Phase A2: Card updates in `resources/index.astro`

**Goal**: Wire cards to open the modal rather than navigate, render `sourceDomain` when present, and show "Coming soon" state for `url: "#"` entries.

Changes to the inlined card `<article>` elements in the Coaching, Player, and Manager panels:

1. **data attributes on each card**: Add `data-resource-url`, `data-resource-type`, `data-resource-title`, `data-resource-source` to each `<article>`. These are read by the click handler.

2. **Click handler**: Delegated event listener on each grid (`#coaching-grid`, `#players-grid`, `#managers-grid`). On click, check `data-resource-type`:
   - If `link`: follow the existing `<a>` tag (opens in new tab). Modal does not open.
   - If `url === "#"`: do nothing / show tooltip. Modal does not open.
   - If `video`, `pdf`, `document`: populate the modal via the data attributes and open it.

3. **`type: 'link'` cards**: Keep the existing `<a href target="_blank">` anchor behaviour. No modal involvement.

4. **Placeholder cards (`url: "#"`)**: Replace the `<a>` action link with a `<span>` or `<button disabled>` labelled "Coming soon". Apply `cursor-not-allowed opacity-60` styling to the action area. The card itself remains visible and filterable — it just cannot be opened.

5. **`sourceDomain` display**: When `sourceDomain` is present, render a secondary label below the category badge: a small `text-xs text-gray-500` span showing the org name. No label shown when field is absent (OQ-3 default).

6. **No change to filter logic**: The existing filter JS (`selectedTags`, `applyFilters`, `clearFilters`) requires no modifications — it reads `data-age` and `data-category` which are unchanged.

### Phase A3: Tests

Test file: `src/components/__tests__/ResourceModal.test.ts`

Following the `SeasonDetailModalTestHarness` pattern — a JS test harness that models modal state and validates transitions without requiring a real browser:

- Modal opens with correct content when triggered with `type: 'video'`
- Modal opens with correct content when triggered with `type: 'pdf'`
- Modal does not open when `url: "#"` card is activated
- Modal does not open when `type: 'link'` card is activated
- Modal closes on Escape keypress
- Modal closes on close button click
- Focus management: triggerEl is stored; focus returns on close
- Focus trap: Tab cycles within modal controls only
- Long title truncation: title exceeds one line, modal header renders without overflow
- Fallback state: video timeout → fallback content shown, iframe hidden
- Fallback state: PDF error event → fallback content shown, download link present
- Viewport resize: modal remains usable (CSS-only, validated via class assertions)

---

## Track B — Content Pipeline

### Phase B1: Merge script infrastructure (no OQ dependency)

**Goal**: Build `scripts/merge-resources.js` with full logic, tested against fixture candidate files. This can be built and tested before any live scraping happens.

The merge script:

1. Reads a candidate JSON file (path passed as CLI argument: `node scripts/merge-resources.js candidates/candidates-2026-04-13.json`)
2. Filters to entries with `status: "approved"`
3. Validates each approved entry:
   - Rejects entries with `inferredCategory === 'uncategorised'` — logs warning with title + URL
   - Skips entries where `sourceUrl` already exists in the target JSON file — logs skip with title + URL
4. Transforms `CandidateResource` → `Resource`:
   - `id`: auto-generated as `{audience}-{sourceDomain-slug}-{sequential-number}` (e.g., `coaching-basketballvic-001`)
   - `url`: from `sourceUrl`
   - `sourceDomain`: from `sourceDomain`
   - `type`: from `inferredType`
   - `category`: from `inferredCategory`
   - `ageGroup`: from `inferredAgeGroup`
   - `dateAdded`: today's date (ISO format)
5. Appends transformed entries to the correct JSON file (`coaching-resources.json` for `inferredAudience: 'coaching'`, `player-resources.json` for `'players'`)
6. Writes the file back (pretty-printed, 2-space indent — consistent with existing files)
7. Prints a summary: `Added 12 entries to coaching-resources.json. Skipped 3 (duplicate). Skipped 1 (uncategorised).`

**Idempotency guarantee**: Running the same candidate file twice produces identical output because step 3 skips on URL match.

Test file: `src/components/__tests__/resource-merge.test.ts`

Tests:
- Approved entry with valid category is added to target JSON
- Approved entry with `inferredCategory: 'uncategorised'` is skipped with warning
- Approved entry whose URL already exists in target JSON is skipped (no duplicate)
- Rejected entry is ignored entirely
- Pending entry is ignored entirely
- Running merge twice on same candidate file produces same output (idempotency)
- Manual entries in existing JSON are preserved exactly
- Output JSON remains valid against Resource interface shape

### Phase B2: Scrape script (requires OQ-1 and OQ-2 resolved)

**Goal**: `scripts/scrape-resources.js` — a local CLI one-time scrape of target organisations.

**Approach**: Node 22 native `fetch` (no external HTTP library needed). The script:

1. Iterates over configured source objects (each has: `name`, `urls` array of specific pages to fetch)
2. For each URL: fetches the page HTML, parses with a lightweight regex/string approach for links (no DOM parser — avoid adding `cheerio` or similar)
3. Identifies candidate links by heuristic:
   - `.pdf` extension → `inferredType: 'pdf'`
   - YouTube or Vimeo URL → `inferredType: 'video'`
   - Otherwise → `inferredType: 'link'`
4. Infers category from URL path keywords and link text:
   - Keywords: `defence`, `defense`, `man-to-man`, `zone` → `Defence`
   - `offence`, `offense`, `attack`, `transition`, `flow` → `Offence`
   - `drill`, `skill`, `fundamental` → `Drills` or `Fundamentals`
   - No match → `uncategorised` (admin must resolve before approving)
5. Performs a HEAD request for each candidate URL and records `reachable: true/false`
6. Filters out clearly irrelevant pages by URL path patterns: `/tickets`, `/merchandise`, `/shop`, `/media/press`, `/contracts`, `/news` (unless the news article contains a skills video heuristic match)
7. Writes `specs/coa-27-resources/candidates/candidates-{date}.json`

**Dependency decision**: No new npm packages. Use Node 22 `fetch`, string-based HTML scanning (not full DOM parse), and `URL` built-in for URL manipulation. This keeps the script under ~200 lines and avoids adding cheerio/puppeteer to devDependencies (Principle VIII).

**Trade-off acknowledged**: String-based HTML scanning will miss dynamically rendered content (React/Vue SPAs). Organisations that render their resource pages client-side (e.g., NBA.com) may return low-yield results. This is acceptable for a one-time scrape — the admin reviews candidates and can supplement with manual entries. The spec explicitly covers the edge case where a source returns zero results.

**npm script addition**:

```json
"resources:scrape": "node scripts/scrape-resources.js",
"resources:merge": "node scripts/merge-resources.js"
```

### Phase B3: Post-merge card display validation

After merge, verify that:
- New entries appear in their correct tab panel (coaching/player)
- `sourceDomain` label renders correctly on newly added cards
- Existing placeholder cards still show "Coming soon" state
- Filters correctly include/exclude new entries by category and age group

This is a manual QA step, not a new automated test (the merge script tests and filter logic tests cover the underlying mechanics).

---

## Phased Delivery Summary

| Phase | Track | Description | Blocking on OQs? |
|---|---|---|---|
| A1 | Modal | `ResourceModal.astro` component + tests | None |
| A2 | Modal | Card wiring in `resources/index.astro` + `sourceDomain` display + placeholder state | OQ-3 (default: omit label) |
| A3 | Modal | `ResourceModal.test.ts` test suite | None |
| B1 | Pipeline | `merge-resources.js` + `resource-merge.test.ts` | None |
| B2 | Pipeline | `scrape-resources.js` | OQ-1, OQ-2 required |
| B3 | Pipeline | Live scrape run + admin review + merge + manual QA | OQ-1, OQ-2, OQ-4 required |

A1 → A2 → A3 can be shipped as a complete PR before B2 is started. B1 can be developed alongside A phases.

---

## Testing Strategy

### Unit tests (Vitest)

**`ResourceModal.test.ts`**: Test harness approach (no browser). Models modal open/close state, content population, focus management, fallback triggers, and placeholder guard. Follows `SeasonDetailModalTestHarness` pattern.

**`resource-merge.test.ts`**: Pure function tests for merge script logic. Input: fixture candidate JSON + fixture existing resource JSON. Output: resulting resource array. Validates idempotency, skip logic, uncategorised warning, and JSON schema conformance.

### Manual QA checklist

Derived from SC-001 through SC-010:

- [ ] Video card opens modal with embedded iframe (no navigation)
- [ ] PDF card opens modal with inline embed and download button
- [ ] `type: 'link'` card opens new tab (no modal)
- [ ] Placeholder card (`url: "#"`) shows "Coming soon", modal does not open
- [ ] Escape closes modal, focus returns to triggering card
- [ ] Close button closes modal, focus returns to triggering card
- [ ] Active filters remain after modal close (all three tabs)
- [ ] Video fallback shown when embed URL is invalid (manual test with `about:blank` iframe)
- [ ] PDF fallback shown when URL is invalid (manual test with 404 PDF URL)
- [ ] Modal at 375px: video fills width, 16:9 ratio maintained, controls usable
- [ ] Modal at 375px: PDF readable, download button visible without scrolling past content
- [ ] Modal at 1440px: overlay covers ≥85% viewport height and width, backdrop visible
- [ ] Tab key cycles within modal only (keyboard navigation test)
- [ ] axe DevTools scan on open modal: no critical/serious WCAG 2.1 AA violations
- [ ] Long title (50+ characters): modal header truncates with ellipsis, no overflow
- [ ] Resize viewport while modal is open: modal remains usable

### Pipeline QA

- [ ] Scrape script produces candidate file with at least one entry from ≥3 target sources
- [ ] Merge script run twice on same file: no duplicate entries in output JSON
- [ ] Merge skips and logs approved entry with `uncategorised` category
- [ ] Merge skips and logs entry with URL already present in target JSON
- [ ] Output JSON is valid (parseable, no trailing commas)
- [ ] Manual entries in existing JSON are unchanged after merge

---

## Architectural Trade-offs

### Trade-off 1: Single modal instance vs per-card modal

Chosen: **single modal instance**, content swapped via JS.

Alternative: render one `<ResourceModal>` per resource card at build time.

Per-card approach would pre-render all modal content in the HTML, which means N iframes all loading simultaneously on page load — a significant performance penalty for a page with 40+ resources. It also complicates focus management (which dialog is open?). The single-instance approach keeps DOM size flat and iframe loading lazy.

### Trade-off 2: URL does not change on modal open

Chosen: **no URL change**.

Alternative: push a hash (`#resource-coaching-003`) or query param (`?resource=coaching-003`) to the URL so the modal can be deep-linked.

Deep-linking was not requested in the spec and adds complexity (popstate handler, scroll restoration, back button interaction with tab/filter state). For a coaching resource library at a community club level, direct links to resources are not a user need identified in any user story. This can be added later as a separate enhancement.

### Trade-off 3: String-based HTML scraping vs headless browser

Chosen: **string-based scanning with native fetch**.

Alternative: add Puppeteer or Playwright to scrape SPAs.

A headless browser would be necessary for sites that render resource listings via JavaScript. However, adding Puppeteer (~100MB) as a devDependency violates the spirit of Principle VIII for a one-time admin tool. The spec acknowledges that some sources may return zero results from the scrape, and the admin can manually add entries. The string-based approach is sufficient for static HTML pages (Basketball Victoria, Basketball Australia likely serve static content).

### Trade-off 4: Native browser PDF embed vs PDF.js

Chosen: **native `<object>`/`<embed>` browser PDF rendering**.

Alternative: embed PDF.js for consistent cross-browser experience.

PDF.js adds ~500KB to bundle size. Safari and Chrome both natively render PDFs inline in `<object>` elements. Mobile Safari does not render inline PDFs in `<object>` but shows a download prompt — the download button in the modal covers this case gracefully. The spec specifies a download button must be present (FR-005), which is the right fallback. PDF.js would be overkill for this use case and violates NFR-007.

### Trade-off 5: Video iframe error detection via timeout

Chosen: **3-second load timeout** to detect failed video embeds.

The `iframe.onerror` event does not fire for embedded YouTube/Vimeo content because the iframe itself loads (it's the video inside that may be unavailable). A `postMessage` listener for provider-specific error events is non-standardised. The 3-second timeout approach is pragmatic: if the iframe's `load` event has fired within 3 seconds, assume the embed is working and hide the fallback. If not, show the fallback. This is the same technique used by most embedding implementations in static sites.

---

## Files to Create / Modify

| Action | Path | Track |
|---|---|---|
| Create | `src/components/ResourceModal.astro` | A |
| Update | `src/lib/resources/types.ts` | A/B |
| Update | `src/pages/resources/index.astro` | A |
| Create | `src/components/__tests__/ResourceModal.test.ts` | A |
| Create | `scripts/merge-resources.js` | B |
| Create | `scripts/scrape-resources.js` | B |
| Create | `src/components/__tests__/resource-merge.test.ts` | B |
| Update | `package.json` (add npm scripts) | B |
| Update | `.gitignore` (add `specs/coa-27-resources/candidates/`) | B |

The legacy `src/pages/coaching-resources.astro` and `src/pages/player-resources.astro` files are already 301-redirecting to `/resources`. They require no changes.

The standalone `ResourceCard.astro` component is not used by `resources/index.astro` (which inlines its card markup directly). It is not modified or removed; it can be cleaned up in a separate housekeeping PR.
