# Tasks: COA-45 — Seasons Page Redesign

**Input**: `specs/coa-45-seasons-page/spec.md` and `specs/coa-45-seasons-page/plan.md`
**Branch**: `cameronwalsh/coa-45-seasons-page`
**Strategy**: Option C Execution Windows (max 3 tasks per window)
**Windows**: 5 total
**Last Updated**: 2026-04-14 (post-clarification regeneration)

---

## What Changed From Previous tasks.md

The following clarifications from spec/plan review are now baked into every relevant task:

1. `TrainingSession` interface is defined and exported from `src/data/venues.ts` alongside the `Venue` interface — not in `types.ts` or anywhere else.
2. `VENUES` array in `src/data/venues.ts` must include full `trainingSchedule` data for both BSE and VCC at creation time (not deferred).
3. Venue cards must display the training schedule (day, time slots, age groups) — not just name and address.
4. Training Information section replaces the Key Dates section. `KeyDatesSection` import is removed from `seasons.astro`. Neither `PLACEHOLDER_KEY_DATES` nor `PLACEHOLDER_REGISTRATION_COSTS` remain.
5. AC-4a is explicit: the Summer 2025/26 anchor element must have `target="_blank"` and `rel="noopener noreferrer"` as HTML attributes — test assertions must verify these attributes directly on the anchor, not just the href.
6. NFR-016 is explicit: venue map links must also carry `target="_blank" rel="noopener noreferrer"` — test assertions must verify this on every map anchor.

---

## Format Guide

- **[P]**: Can run in parallel (different files, same window)
- **Window N**: Execution context boundary (fresh 200k context)
- **WINDOW_CHECKPOINT**: Validation gate before next window
- **Traceability**: Each task maps back to spec (FR-XXX, NFR-XXX, AC-XXX)
- **Dependency**: What prior work must be complete

---

## Execution Window 1: Static Data and Types (Foundation)

**Purpose**: Establish the shared type layer and static data that every other task depends on. No visual change; no build-breaking removals yet.

**Token Budget**: 50-70k (small files, foundational work)

**Checkpoint Validation**:
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `SeasonCardConfig` is exported from `src/lib/seasons/types.ts`
- [ ] `getSeasonAriaLabel` in `src/lib/seasons/utils.ts` accepts `SeasonCardConfig` and produces correct strings for all three card modes
- [ ] `src/data/venues.ts` exports `TrainingSession`, `Venue`, and `VENUES` — with full `trainingSchedule` data for BSE and VCC
- [ ] `src/lib/seasons/constants.ts` exports `SEASON_CARDS` with all 4 card configs

---

### T001 — Add SeasonCardConfig type and update getSeasonAriaLabel

**Window**: 1 (Foundation)
**Phase**: Types and utilities
**Traceability**: FR-002, FR-003, FR-005, FR-006, NFR-003
**Dependencies**: None
**Parallel**: [P] (touches different files from T002)

**What to change**:

File: `src/lib/seasons/types.ts`
- Add and export `SeasonCardConfig` interface:
  ```ts
  export interface SeasonCardConfig {
    id: string
    name: string
    status: SeasonStatus
    role: SeasonRole
    clickable: boolean
    navigationTarget: string | null
    navigationExternal: boolean   // true = opens in new tab with rel="noopener noreferrer"
    statusBadgeLabel: string      // display text e.g. "Grading", "Complete"
  }
  ```
- Do not modify `SeasonStatus`, `SeasonRole`, or `Season` — they are read-only for this feature.

File: `src/lib/seasons/utils.ts`
- Update (or overload) `getSeasonAriaLabel` to accept `SeasonCardConfig` and return:
  - Clickable internal (`clickable: true, navigationExternal: false`): `"{name}, {statusBadgeLabel}, view Teams page"`
  - Clickable external (`clickable: true, navigationExternal: true`): `"{name}, {statusBadgeLabel}, view on PlayHQ (opens in new tab)"`
  - Disabled (`clickable: false`): `"{name}, {statusBadgeLabel}, not yet available"`

File: `src/lib/seasons/utils.test.ts`
- Add or update test cases to cover all three aria-label variants using `SeasonCardConfig` inputs
- Tests must pass before window checkpoint

**Test**: `npx vitest run src/lib/seasons/utils.test.ts` — all pass

---

### T002 — Create src/data/venues.ts with TrainingSession, Venue, and VENUES

**Window**: 1 (Foundation)
**Phase**: Static data
**Traceability**: FR-001, FR-007, FR-008, NFR-004, NFR-012, NFR-016, AC-8
**Dependencies**: None
**Parallel**: [P] (different file from T001)

**What to create**:

File: `src/data/venues.ts` (new file — no framework imports, plain TypeScript exports only)

Export `TrainingSession` interface:
```ts
export interface TrainingSession {
  day: string
  timeSlots: {
    time: string
    ageGroups: string[]
  }[]
}
```

Export `Venue` interface:
```ts
export interface Venue {
  id: string
  name: string
  shortCode: string
  address: string
  suburb: string
  parking: string | null
  contact: string | null
  mapUrl: string | null
  trainingSchedule: TrainingSession[]
}
```

Export `VENUES: Venue[]` with exactly two entries populated in full:

BSE entry:
- `id`: `"bse"`
- `name`: `"Bendigo South East College"`
- `shortCode`: `"BSE"`
- `address`: `"56 Ellis St, Flora Hill VIC 3550 (Enter via Keck St)"`
- `suburb`: `"Flora Hill"`
- `parking`: `null`
- `contact`: `null`
- `mapUrl`: `"https://maps.app.goo.gl/FCia6GfDHqZwHWq6A"`
- `trainingSchedule`:
  ```ts
  [
    {
      day: 'Sunday',
      timeSlots: [
        { time: '4–5pm', ageGroups: ['U10 Girls', 'U14 & U16 Girls'] },
        { time: '5–7pm', ageGroups: ['U16 & U18 Boys'] },
      ],
    },
  ]
  ```

VCC entry:
- `id`: `"vcc"`
- `name`: `"Victory Christian College"`
- `shortCode`: `"VCC"`
- `address`: `"6 Kairn Rd, Strathdale VIC 3550"`
- `suburb`: `"Strathdale"`
- `parking`: `null`
- `contact`: `null`
- `mapUrl`: `"https://maps.app.goo.gl/y1g1ByEkq3HA3AAF7"`
- `trainingSchedule`:
  ```ts
  [
    {
      day: 'Wednesday',
      timeSlots: [
        { time: '6–7pm', ageGroups: ['U10 Boys & Girls'] },
        { time: '7–8pm', ageGroups: ['U12 Boys'] },
      ],
    },
  ]
  ```

**Test**: `npx tsc --noEmit` passes; file is importable with `import { VENUES, TrainingSession, Venue } from '../data/venues'`

---

### T003 — Update constants.ts with COA-45 SEASON_CARDS

**Window**: 1 (Foundation)
**Phase**: Static data
**Traceability**: FR-002, FR-003, FR-004, FR-005, FR-006, AC-1 through AC-7
**Dependencies**: T001 (SeasonCardConfig must be exported before this file imports it)

**What to change**:

File: `src/lib/seasons/constants.ts`
- Import `SeasonCardConfig` from `./types`
- Add and export `SEASON_CARDS: SeasonCardConfig[]` with 4 entries in order:

  1. Winter 2026:
     - `id`: `"winter-2026"`, `name`: `"Winter 2026"`, `role`: `"current"`, `status`: `"active"`
     - `clickable`: `true`, `navigationTarget`: `"/teams"`, `navigationExternal`: `false`
     - `statusBadgeLabel`: `"Grading"`

  2. Summer 2025/26:
     - `id`: `"summer-2025-26"`, `name`: `"Summer 2025/26"`, `role`: `"previous"`, `status`: `"completed"`
     - `clickable`: `true`, `navigationTarget`: `"https://www.playhq.com/basketball-victoria/org/bendigo-basketball-association/domestic-competition-summer-202526/0bf74768"`, `navigationExternal`: `true`
     - `statusBadgeLabel`: `"Complete"`

  3. Summer 2026/27:
     - `id`: `"summer-2026-27"`, `name`: `"Summer 2026/27"`, `role`: `"next"`, `status`: `"coming_soon"`
     - `clickable`: `false`, `navigationTarget`: `null`, `navigationExternal`: `false`
     - `statusBadgeLabel`: `"Registration Coming Soon"`

  4. Archive:
     - `id`: `"archive"`, `name`: `"Archive"`, `role`: `"archive"`, `status`: `"coming_soon"`
     - `clickable`: `false`, `navigationTarget`: `null`, `navigationExternal`: `false`
     - `statusBadgeLabel`: `"Coming Soon"`

- Do NOT remove `PLACEHOLDER_SEASONS` yet — `seasons.astro` still references it and the build will break. That removal happens in T006 (Window 3) when `seasons.astro` no longer imports it.

File: `src/lib/seasons/constants.test.ts`
- Add tests asserting: `SEASON_CARDS` has length 4, order is correct by id, `clickable` values match spec (true/true/false/false), `navigationExternal` is true only for Summer 2025/26

**Test**: `npx vitest run src/lib/seasons/constants.test.ts` — all pass

---

[WINDOW_CHECKPOINT_1]

**Before proceeding to Window 2**:
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npx vitest run src/lib/seasons/utils.test.ts` — all pass
- [ ] `npx vitest run src/lib/seasons/constants.test.ts` — all pass
- [ ] `src/data/venues.ts` exists and exports `TrainingSession`, `Venue`, and `VENUES`
- [ ] `VENUES[0].trainingSchedule` and `VENUES[1].trainingSchedule` are non-empty arrays
- [ ] `SeasonCardConfig` exported from `src/lib/seasons/types.ts`

Do NOT proceed if any check fails. Fix within Window 1.

---

## Execution Window 2: SeasonTile.astro Update (P1)

**Purpose**: Update the component to support three render modes — internal anchor, external anchor (with `target="_blank" rel="noopener noreferrer"`), and disabled div — with brand-aligned badge colours and correct accessibility attributes.

**Token Budget**: 60-80k (component + test file)

**Checkpoint Validation**:
- [ ] `SeasonTile.astro` renders `<a>` for clickable cards, `<div>` for disabled cards
- [ ] External anchor (Summer 2025/26) has `target="_blank"` and `rel="noopener noreferrer"` as HTML attributes
- [ ] Brand badge colours applied (no generic blue tokens remain)
- [ ] Focus ring uses `focus-visible:ring-brand-purple`
- [ ] `npx vitest run src/components/__tests__/SeasonTile.test.ts` — all pass

---

### T004 — Rewrite SeasonTile.astro for three render modes

**Window**: 2 (SeasonTile)
**Phase**: Component implementation
**Traceability**: FR-003, FR-004, FR-005, FR-006, NFR-001, NFR-002, NFR-003, NFR-005, NFR-006, AC-2, AC-4, AC-4a, AC-5, AC-6, AC-7, AC-12
**Dependencies**: T001 (SeasonCardConfig type), T003 (constants available for reference)

**What to change**:

File: `src/components/SeasonTile.astro`
- Update Props interface: `interface Props { season: SeasonCardConfig }` — import `SeasonCardConfig` from `src/lib/seasons/types`
- Remove the existing `onClick?: () => void` prop and all `onkeydown` / JS event handler attributes

Implement three conditional rendering modes:

1. Clickable internal (`season.clickable && !season.navigationExternal`):
   ```html
   <a href={season.navigationTarget} aria-label={getSeasonAriaLabel(season)} class="...focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 hover:shadow-md hover:border-brand-purple">
   ```

2. Clickable external (`season.clickable && season.navigationExternal`):
   ```html
   <a href={season.navigationTarget} target="_blank" rel="noopener noreferrer" aria-label={getSeasonAriaLabel(season)} class="...focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 hover:shadow-md hover:border-brand-purple">
   ```
   The `target="_blank"` and `rel="noopener noreferrer"` attributes are required here for AC-4a compliance. They must be literal HTML attributes on the `<a>` element, not set via JavaScript.

3. Disabled (`!season.clickable`):
   ```html
   <div aria-disabled="true" tabindex="-1" class="...cursor-not-allowed opacity-50">
   ```
   No `href`, no click handler, excluded from Tab order via `tabindex="-1"`.

Badge colour classes — replace all generic blue tokens with brand-aligned classes:
- `active` / Grading: `bg-yellow-100 text-brand-purple border border-brand-gold`
- `completed` / Complete: `bg-gray-100 text-gray-600 border border-gray-300`
- `coming_soon` + role `next` / Registration Coming Soon: `bg-purple-50 text-purple-400 border border-purple-200`
- `coming_soon` + role `archive` / Coming Soon: `bg-gray-100 text-gray-400 border border-gray-200`

Badge label: render `{season.statusBadgeLabel}` — do NOT derive from `season.status` enum; the pre-mapped string is the source of truth.

Focus ring: replace `focus:ring-blue-500` and any `button:focus-visible` style block with `focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2` on the anchor element only.

Hover states: disabled cards get no hover (remove `hover:shadow-md`, `hover:border-blue-300`, `hover:bg-blue-50`). Clickable cards use `hover:shadow-md hover:border-brand-purple`.

**Test**: `npx astro check` — zero type errors on `SeasonTile.astro`

---

### T005 — Update SeasonTile.test.ts for new Props and render modes

**Window**: 2 (SeasonTile)
**Phase**: Tests
**Traceability**: FR-004, FR-005, FR-006, NFR-001, NFR-002, NFR-003, AC-2, AC-4a, AC-5, AC-6, AC-7
**Dependencies**: T004 (component updated — tests written against new shape)

**What to change**:

File: `src/components/__tests__/SeasonTile.test.ts`
- Replace all tests using the old Props shape (`onClick`, generic blue classes, `<button>` element)
- Required test cases:
  - Clickable internal card renders `<a>` with `href="/teams"` and no `target` attribute
  - Clickable external card renders `<a>` with `href` matching the PlayHQ URL — assert `target="_blank"` and `rel="noopener noreferrer"` as explicit attribute values (AC-4a)
  - Disabled card renders as `<div>` — not `<a>`, not `<button>`
  - Disabled card has `aria-disabled="true"` attribute
  - Disabled card has `tabindex="-1"` attribute
  - Disabled card has `opacity-50` class
  - Disabled card has `cursor-not-allowed` class
  - Badge label text matches `statusBadgeLabel` value from props (e.g. "Grading", "Complete")
  - Active/current card badge has class `bg-yellow-100` and `text-brand-purple`
  - Clickable card anchor has `focus-visible:ring-brand-purple`
  - `aria-label` contains the season name and statusBadgeLabel
- Delete all assertions referencing `onClick` prop, `<button>` element, blue token classes (`bg-blue-100`, `text-blue-800`, `focus:ring-blue-500`)

**Test**: `npx vitest run src/components/__tests__/SeasonTile.test.ts` — all pass, zero failures

---

[WINDOW_CHECKPOINT_2]

**Before proceeding to Window 3**:
- [ ] `npx astro check` — zero errors in `SeasonTile.astro`
- [ ] `npx vitest run src/components/__tests__/SeasonTile.test.ts` — all pass
- [ ] No generic blue Tailwind tokens remain in `SeasonTile.astro` (grep for `bg-blue-100`, `text-blue-800`, `focus:ring-blue-500`)
- [ ] External anchor test asserts both `target="_blank"` and `rel="noopener noreferrer"` by attribute value
- [ ] `SeasonDetailModal.astro` still exists — Window 3 handles deletion

Do NOT proceed if any check fails. Fix within Window 2.

---

## Execution Window 3: seasons.astro Redesign and Modal Removal (P1)

**Purpose**: Redesign the page template — remove all modal code and the KeyDatesSection import, wire SEASON_CARDS to the SeasonTile grid, fix responsive breakpoints, preserve Grading Information and Slam Dunk sections. Delivers fully working P1. Training Information section is NOT added here — that is Window 4.

**Token Budget**: 70-90k (large page file + multiple test files)

**Checkpoint Validation**:
- [ ] `npx astro build` succeeds with zero errors
- [ ] `seasons.astro` contains no reference to `SeasonDetailModal`, `KeyDatesSection`, `PLACEHOLDER_KEY_DATES`, `PLACEHOLDER_REGISTRATION_COSTS`, or modal `<script>` / `<style>` blocks
- [ ] 4 `SeasonTile` components rendered in correct order
- [ ] Winter 2026 card is an `<a href="/teams">`; Summer 2025/26 card is an `<a>` with PlayHQ URL, `target="_blank"`, `rel="noopener noreferrer"`
- [ ] Grading Information and Slam Dunk sections still present in rendered HTML
- [ ] `src/components/SeasonDetailModal.astro` does not exist

---

### T006 — Rewrite seasons.astro: remove modal and KeyDatesSection, wire season cards

**Window**: 3 (seasons.astro)
**Phase**: Page implementation
**Traceability**: FR-002, FR-003, FR-005, FR-006, FR-010, FR-011, NFR-007, NFR-009, NFR-010, NFR-011, AC-1 through AC-7, AC-9, AC-10, AC-11, AC-12, AC-13, SC-004, SC-006, SC-009
**Dependencies**: T001 (SeasonCardConfig type), T003 (SEASON_CARDS), T004 (SeasonTile updated Props)

**What to change**:

File: `src/pages/seasons.astro`

Removals (all must be deleted, not commented out):
- Import of `SeasonDetailModal` from `../components/SeasonDetailModal.astro`
- Import of `KeyDatesSection` (replaces Key Dates section per clarification; Training Information section added in T008)
- Imports of `PLACEHOLDER_KEY_DATES` and `PLACEHOLDER_REGISTRATION_COSTS` from constants
- The `<SeasonDetailModal id="season-detail-modal" isOpen={false} />` element
- The entire `<script>` block (modal state management, click/keyboard handlers, backdrop)
- The `<style>` block referencing `#season-detail-modal` or any modal-related selectors
- The `<KeyDatesSection>` element inside the seasons section
- Import of `PLACEHOLDER_SEASONS` (replaced by `SEASON_CARDS`)

Additions:
- `import { SEASON_CARDS } from '../lib/seasons/constants'`
- `import type { SeasonCardConfig } from '../lib/seasons/types'`

Season cards grid:
- Replace existing card loop or static card markup with `{SEASON_CARDS.map(season => <SeasonTile season={season} />)}`
- Fix responsive breakpoint: change `md:grid-cols-2` to `sm:grid-cols-2` (spec NFR-007 requires 640px boundary, not 768px)
- Full grid class should be: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`

Page section order after this task (no Training Information yet):
1. Page Hero — unchanged
2. Season Cards grid — redesigned
3. Grading Information section — preserved, conditional on `isGradingActive`
4. Slam Dunk Financial Assistance callout — preserved

Also delete this file entirely:
- `src/components/SeasonDetailModal.astro`

Also remove `PLACEHOLDER_SEASONS` export from `src/lib/seasons/constants.ts` now that no file imports it.

**Test**: `npx astro build` completes with zero errors; `npx astro check` reports zero type errors on `seasons.astro`

---

### T007 — Clean up seasons.* test suite: remove modal assertions, add navigation and AC-4a assertions

**Window**: 3 (seasons.astro)
**Phase**: Test cleanup
**Traceability**: AC-1 through AC-7, AC-4a, AC-12, AC-13, SC-004, SC-005
**Dependencies**: T006 (seasons.astro redesigned — test expectations must match new behaviour)

**What to change**:

Delete this file entirely:
- `src/components/__tests__/SeasonDetailModal.test.ts`

Review and update every file in the seasons test suite — remove modal assertions, add navigation assertions:
- `src/components/__tests__/seasons.integration.test.ts`
- `src/components/__tests__/seasons-integration.test.ts`
- `src/components/__tests__/seasons.keyboard.test.ts`
- `src/components/__tests__/seasons.keyboard.extended.test.ts`
- `src/components/__tests__/seasons.accessibility.test.ts`
- `src/components/__tests__/seasons.responsive.test.ts`
- `src/components/__tests__/seasons.visual-polish.test.ts`
- `src/components/__tests__/seasons.empty-states.test.ts`
- `src/components/__tests__/seasons.error-states.test.ts`
- `src/components/__tests__/seasons.performance.test.ts`
- `src/components/__tests__/seasons.final-validation.test.ts`
- `src/components/__tests__/seasons-fixtures.test.ts`

In each file, make these changes:
- Remove all assertions referencing `SeasonDetailModal`, `isOpen`, modal open/close events, backdrop, click-outside behaviour, or the `<script>` block
- Replace "clicking a card opens a modal" assertions with:
  - "Winter 2026 card is an `<a>` with `href='/teams'`"
  - "Summer 2025/26 card is an `<a>` with `href` containing the PlayHQ URL, `target='_blank'`, and `rel='noopener noreferrer'`" — assert both attributes explicitly (AC-4a)
- Replace keyboard modal-trigger assertions with: "pressing Enter on Winter 2026 card follows the href"
- Preserve or add assertions for: 4 season cards visible in correct order, disabled cards have `aria-disabled="true"` and `opacity-50`, Grading Information section present, Slam Dunk section present

After updates, run dead code scan and confirm empty output for each:
```bash
grep -r "SeasonDetailModal" src/
grep -r "PLACEHOLDER_KEY_DATES" src/
grep -r "PLACEHOLDER_REGISTRATION_COSTS" src/
grep -r "PLACEHOLDER_SEASONS" src/
grep -r "KeyDatesSection" src/pages/seasons.astro
```

**Test**: `npx vitest run` — full test suite passes with zero failures; grep commands all return empty

---

[WINDOW_CHECKPOINT_3]

**Before proceeding to Window 4**:
- [ ] `npx astro build` — zero errors
- [ ] `npx astro check` — zero errors
- [ ] `npx vitest run` — full suite passes
- [ ] `grep -r "SeasonDetailModal" src/` — empty
- [ ] `grep -r "PLACEHOLDER_SEASONS" src/` — empty
- [ ] `grep -r "KeyDatesSection" src/pages/seasons.astro` — empty
- [ ] `src/components/SeasonDetailModal.astro` does not exist
- [ ] `src/components/__tests__/SeasonDetailModal.test.ts` does not exist
- [ ] Summer 2025/26 `<a>` element has `target="_blank"` and `rel="noopener noreferrer"` — verified by test assertion
- [ ] Grading Information and Slam Dunk sections visible in built HTML

P1 is complete at this checkpoint. Do NOT proceed to Window 4 if P1 is broken.

---

## Execution Window 4: Training Information Section (P2)

**Purpose**: Add the Training Information section (venue cards for BSE and VCC) above the season cards grid. Each venue card must display the venue name, address, and the full training schedule (day, time slots, age groups). Map links must use `target="_blank" rel="noopener noreferrer"` (NFR-016). This section replaces Key Dates visually; Key Dates was removed in T006.

**Token Budget**: 60-80k (markup addition + test file)

**Checkpoint Validation**:
- [ ] Training Information section renders above season cards at all breakpoints
- [ ] Two venue cards visible: BSE and VCC
- [ ] Each venue card shows: name, address, training schedule (day, time slots, age groups)
- [ ] Map links have `target="_blank"` and `rel="noopener noreferrer"` — verified by test assertion
- [ ] Section does NOT render when VENUES is empty (NFR-012)
- [ ] `npx astro build` succeeds

---

### T008 — Add Training Information section to seasons.astro with schedule display

**Window**: 4 (Training Information)
**Phase**: P2 implementation
**Traceability**: FR-001, FR-007, FR-008, NFR-004, NFR-008, NFR-009, NFR-012, NFR-016, AC-8, AC-9, AC-10, SC-001, SC-007
**Dependencies**: T002 (venues.ts with TrainingSession data), T006 (seasons.astro redesigned and stable)

**What to change**:

File: `src/pages/seasons.astro`
- Add import: `import { VENUES } from '../data/venues'`
- Insert the Training Information section between Page Hero and the Season Cards grid (satisfies NFR-009)

Section markup:

```astro
{VENUES.length > 0 && (
  <section aria-labelledby="training-info-heading" class="py-12 px-4 sm:px-6 lg:px-8 bg-brand-offwhite">
    <div class="max-w-7xl mx-auto">
      <h2 id="training-info-heading" class="text-2xl font-bold text-brand-purple uppercase tracking-wide mb-2">
        Training Information
      </h2>
      <div class="h-1 w-12 bg-brand-gold mb-8"></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {VENUES.map(venue => (
          <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 class="text-lg font-semibold text-brand-purple mb-1">{venue.name}</h3>
            <p class="text-sm text-gray-500 font-mono mb-1">{venue.shortCode}</p>
            <p class="text-sm text-gray-700 mb-4">{venue.address}</p>
            <div class="mb-4">
              {venue.trainingSchedule.map(session => (
                <div class="mb-2">
                  <p class="text-sm font-semibold text-brand-purple">{session.day}</p>
                  {session.timeSlots.map(slot => (
                    <p class="text-sm text-gray-700">
                      {slot.time} — {slot.ageGroups.join(', ')}
                    </p>
                  ))}
                </div>
              ))}
            </div>
            {venue.mapUrl && (
              <a
                href={venue.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center text-sm text-brand-purple underline py-3 min-h-[44px]"
              >
                View on Map
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
)}
```

Key requirements enforced by this markup:
- `VENUES.length > 0` conditional — no empty section rendered (NFR-012)
- `<h2>` for section heading, `<h3>` inside each venue card — satisfies NFR-004 heading hierarchy
- `sm:grid-cols-2` — 1-col mobile, 2-col tablet and above (NFR-008)
- Training schedule rendered by day then by time slot with age groups (FR-007)
- Map link `target="_blank" rel="noopener noreferrer"` — satisfies NFR-016
- Map link `min-h-[44px]` — satisfies NFR-005 touch target

**Test**: `npx astro build` passes; visually inspect built HTML to confirm training schedule visible in both venue cards

---

### T009 — Write Training Information tests including schedule and external link assertions

**Window**: 4 (Training Information)
**Phase**: Tests
**Traceability**: FR-001, FR-007, FR-008, NFR-004, NFR-008, NFR-009, NFR-012, NFR-016, AC-8, AC-9, AC-10, SC-001, SC-007
**Dependencies**: T008 (section implemented — tests verify live markup)

**What to create or update**:

Create or add to file: `src/components/__tests__/seasons.training-info.test.ts`

Required test cases:
- Training Information section is present in rendered HTML when VENUES has entries
- Section contains an `<h2>` (or element with id `training-info-heading`) with text "Training Information"
- Exactly two venue cards are rendered (one for BSE, one for VCC)
- BSE card contains an `<h3>` with text "Bendigo South East College" and a text node containing "56 Ellis St, Flora Hill VIC 3550"
- BSE card shows training day "Sunday", time "4–5pm", and age groups "U10 Girls" and "U14 & U16 Girls"
- BSE card shows time "5–7pm" and age group "U16 & U18 Boys"
- VCC card contains an `<h3>` with text "Victory Christian College" and a text node containing "6 Kairn Rd, Strathdale VIC 3550"
- VCC card shows training day "Wednesday", time "6–7pm", and age group "U10 Boys & Girls"
- VCC card shows time "7–8pm" and age group "U12 Boys"
- BSE map anchor has `href` containing `maps.app.goo.gl/FCia6GfDHqZwHWq6A`, `target="_blank"`, and `rel="noopener noreferrer"` — assert all three attribute values (NFR-016)
- VCC map anchor has `href` containing `maps.app.goo.gl/y1g1ByEkq3HA3AAF7`, `target="_blank"`, and `rel="noopener noreferrer"` — assert all three attribute values (NFR-016)
- Training Information section appears before the season cards grid in DOM order (NFR-009)
- When VENUES is empty (mock empty array), no element with `aria-labelledby="training-info-heading"` or heading "Training Information" is present (NFR-012)

**Test**: `npx vitest run src/components/__tests__/seasons.training-info.test.ts` — all pass

---

[WINDOW_CHECKPOINT_4]

**Before proceeding to Window 5**:
- [ ] `npx astro build` — zero errors
- [ ] Training Information section visible above season cards in built HTML
- [ ] Both venue cards show name, address, and full training schedule (day, time slots, age groups)
- [ ] `npx vitest run src/components/__tests__/seasons.training-info.test.ts` — all pass
- [ ] Tests assert `target="_blank"` and `rel="noopener noreferrer"` on map anchors (NFR-016)
- [ ] Test proves section does NOT render when VENUES is empty

P2 is complete at this checkpoint.

---

## Execution Window 5: Final Validation and Cleanup

**Purpose**: Sweep all 13 acceptance criteria, confirm no dead code remains, run full build and test suite. Minimal code changes — this window is mostly verification.

**Token Budget**: 40-60k (reading, verifying, targeted fixes only)

**Checkpoint Validation**:
- [ ] All 13 acceptance criteria from spec verified by inspection or test assertion
- [ ] `npx tsc --noEmit`, `npx astro check`, `npx astro build`, `npx vitest run` all exit with code 0
- [ ] All dead code grep commands return empty output
- [ ] Feature ready for PR

---

### T010 — Final acceptance criteria sweep, dead code verification, full build

**Window**: 5 (Polish)
**Phase**: Validation
**Traceability**: All AC-1 through AC-13, all SC-001 through SC-009
**Dependencies**: All prior tasks complete

**What to do**:

Step 1 — Verify all 13 acceptance criteria by tracing each to implementation:
- AC-1: 4 cards visible in order: Winter 2026, Summer 2025/26, Summer 2026/27, Archive
- AC-2: Winter 2026 badge reads "Grading" with `bg-yellow-100 text-brand-purple border-brand-gold` classes
- AC-3: Winter 2026 card is `<a href="/teams">` — no modal, no JS handler
- AC-4: Summer 2025/26 card is `<a>` with PlayHQ URL and `target="_blank"`
- AC-4a: Summer 2025/26 anchor element has `target="_blank"` and `rel="noopener noreferrer"` as explicit HTML attributes — verify by test assertion in SeasonTile.test.ts
- AC-5: Summer 2026/27 card has `opacity-50` and badge reads "Registration Coming Soon"
- AC-6: Summer 2026/27 is a `<div>` with no `href` — clicking does not navigate
- AC-7: Summer 2026/27 has `tabindex="-1"` and/or `aria-disabled="true"`
- AC-8: Training Information section visible above 4 season cards; BSE and VCC cards with name, address, and training schedule
- AC-9: Mobile (< 640px) — season cards single column, venue cards stacked vertically
- AC-10: Desktop (> 1024px) — 4 season cards in row, 2 venue cards side by side
- AC-11: `BaseLayout.astro` wraps all content; no custom nav shell present
- AC-12: Tabbing to Winter 2026 `<a>` and pressing Enter follows href; no modal or overlay appears
- AC-13: Grading Information section and Slam Dunk Financial Assistance callout present on scroll

Step 2 — Dead code scan (all must return empty):
```bash
grep -r "SeasonDetailModal" src/
grep -r "PLACEHOLDER_KEY_DATES" src/
grep -r "PLACEHOLDER_REGISTRATION_COSTS" src/
grep -r "PLACEHOLDER_SEASONS" src/
grep -r "KeyDatesSection" src/pages/seasons.astro
grep -r "focus:ring-blue-500" src/components/SeasonTile.astro
grep -r "bg-blue-100" src/components/SeasonTile.astro
```

Step 3 — Fix any issues found. If a fix requires more than a minor edit to a single file, note the file and commit the fix before the final build run.

Step 4 — Run full validation:
```bash
npx tsc --noEmit
npx astro check
npx astro build
npx vitest run
```

**Test**: All four commands exit with code 0. All 13 ACs verified.

---

[WINDOW_CHECKPOINT_5 — FEATURE COMPLETE]

**Feature done when**:
- [ ] All 13 acceptance criteria verified
- [ ] Zero TypeScript errors, zero build errors, full test suite green
- [ ] AC-4a confirmed: Summer 2025/26 anchor has `target="_blank"` and `rel="noopener noreferrer"` by attribute assertion
- [ ] NFR-016 confirmed: venue map links have `target="_blank"` and `rel="noopener noreferrer"` by attribute assertion
- [ ] No dead modal code or Key Dates imports remain in `src/`
- [ ] Ready for PR to `main`

---

## Dependency Graph

```
Window 1 (Types + Data)
  T001 [P] — types.ts, utils.ts, utils.test.ts
  T002 [P] — venues.ts (TrainingSession + Venue + VENUES with schedules)
  T003     — constants.ts, constants.test.ts
    |
    v
Window 2 (SeasonTile Component)
  T004     — SeasonTile.astro rewrite (three render modes, AC-4a external link)
  T005     — SeasonTile.test.ts (explicit target/_blank/rel assertions)
    |
    v
Window 3 (seasons.astro + Modal Removal)
  T006     — seasons.astro redesign, delete SeasonDetailModal.astro, remove KeyDatesSection
  T007     — seasons.*.test.ts suite cleanup (remove modal, add AC-4a nav assertions)
    |
    v
Window 4 (Training Information — P2)
  T008     — Training section in seasons.astro (schedule display + NFR-016 map links)
  T009     — seasons.training-info.test.ts (schedule + external link attribute assertions)
    |
    v
Window 5 (Final Validation)
  T010     — AC sweep, dead code scan, full build
```

---

## Task Summary

| Task | Window | File(s) | Priority | Key Traceability |
|---|---|---|---|---|
| T001 | 1 | `types.ts`, `utils.ts`, `utils.test.ts` | P1 | FR-002, NFR-003 |
| T002 | 1 | `src/data/venues.ts` (new — includes TrainingSession and schedule data) | P2 | FR-001, FR-007, NFR-016 |
| T003 | 1 | `constants.ts`, `constants.test.ts` | P1 | FR-002, FR-003, AC-1 through AC-7 |
| T004 | 2 | `SeasonTile.astro` (three render modes, external link attributes) | P1 | FR-003 through FR-006, NFR-001 through NFR-006, AC-4a |
| T005 | 2 | `SeasonTile.test.ts` (target/rel attribute assertions) | P1 | AC-2, AC-4, AC-4a, AC-5, AC-6, AC-7 |
| T006 | 3 | `seasons.astro` (remove modal + KeyDatesSection, wire cards), delete `SeasonDetailModal.astro` | P1 | FR-002, FR-010, FR-011, AC-1 through AC-7 |
| T007 | 3 | `seasons.*.test.ts` suite (12 files), delete `SeasonDetailModal.test.ts` | P1 | AC-1 through AC-7, AC-4a, AC-12, AC-13 |
| T008 | 4 | `seasons.astro` (Training section with schedule and NFR-016 map links) | P2 | FR-001, FR-007, FR-008, NFR-016, AC-8 |
| T009 | 4 | `seasons.training-info.test.ts` (schedule + map link attribute assertions) | P2 | AC-8 through AC-10, NFR-016 |
| T010 | 5 | Read-only sweep + targeted fixes | All | All AC, all SC |
