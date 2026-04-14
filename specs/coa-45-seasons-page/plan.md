# Implementation Plan: COA-45 — Seasons Page Redesign

**Branch**: `cameronwalsh/coa-45-seasons-page` | **Date**: 2026-04-14 | **Spec**: `specs/coa-45-seasons-page/spec.md`

---

## Summary

Redesign `src/pages/seasons.astro` to serve as a season navigation hub. The page replaces the COA-24 modal interaction model with direct outbound navigation: the Winter 2026 card navigates internally to `/teams`; the Summer 2025/26 card opens the PlayHQ public season page in a new tab (`target="_blank" rel="noopener noreferrer"`). Summer 2026/27 and Archive are visually faded, non-interactive placeholders. A Training Information section (above the season cards grid) renders two venue cards — BSE and VCC — from a new static data file. Each venue card displays the venue name, address, and a structured training schedule (day, time slots, age groups). The existing Grading Information and Slam Dunk Financial Assistance sections are preserved unchanged. The `SeasonDetailModal` component and all modal client-side script are removed entirely. The Key Dates section previously on the seasons page is replaced by the Training Information section with per-venue training schedules.

---

## Technical Context

- **Language/Version**: TypeScript, Astro 4 (SSG), Node 20+
- **Styling**: Tailwind CSS — brand tokens in `tailwind.config.mjs` (`brand-purple`, `brand-gold`, `brand-offwhite`, `brand-black`)
- **Component model**: Astro components (`.astro`) — server-rendered, no React/framework components on this page
- **Static data**: New `src/data/venues.ts` following the pattern of existing `src/data/` JSON/TS files
- **Existing season types**: `src/lib/seasons/types.ts` (`Season`, `SeasonRole`, `SeasonStatus`) — not modified; new `SeasonCardConfig` type defined locally in `seasons.astro`
- **Existing utilities**: `src/lib/seasons/utils.ts` reused where appropriate; `getSeasonAriaLabel` updated to reflect navigation intent rather than "click to view details"
- **Target platform**: Web (SSG static output)
- **Performance**: All data is static; no API calls block render (FR-011, NFR-014)

---

## Constitution Check

| Principle | Result | Notes |
|---|---|---|
| I — User Outcomes First | PASS | Navigation to Teams page and PlayHQ are directly observable outcomes |
| II — Test-First Discipline | PASS | All acceptance criteria are Given/When/Then, independently testable from static data |
| III — Backend Authority | PASS | Season roles and clickability defined in static config, not inferred client-side |
| IV — Error Semantics | PASS | NFR-012/013 define explicit degradation; Teams page owns PlayHQ error handling |
| V — AppShell Integrity | PASS | BaseLayout wraps all content; no custom nav shell introduced |
| VI — Accessibility First | WARN | Existing `SeasonTile.astro` uses `focus:ring-blue-500` — replaced with `focus-visible:ring-brand-purple` during update |
| VII — Immutable Data Flow | PASS | Static data → Astro build → HTML; minimal client JS handles navigation events only |
| VIII — Dependency Hygiene | PASS | No new third-party dependencies |
| IX — Cross-Feature Consistency | WARN | `SeasonDetailModal` and all modal script must be fully removed, not left as dead code |

---

## SeasonTile.astro Usage Audit

Grep for `SeasonTile` across `src/` confirms:

- `src/pages/seasons.astro` — the page being redesigned (controlled)
- `src/lib/seasons/utils.ts` — type import only, no render
- `src/components/__tests__/SeasonTile.test.ts` — test file, updated in Phase 3
- `src/components/__tests__/seasons.*.test.ts` — integration/visual/responsive/accessibility/keyboard suites, reviewed in Phase 3
- `src/components/SeasonDetailModal.astro` — references `SeasonTile` implicitly; this component is deleted

No page outside `seasons.astro` renders `SeasonTile.astro`. Safe to update in place.

---

## Project Structure

```
src/
├── pages/
│   └── seasons.astro                     (redesigned — primary deliverable)
├── components/
│   ├── SeasonTile.astro                  (updated in place)
│   ├── SeasonDetailModal.astro           (deleted)
│   └── __tests__/
│       ├── SeasonTile.test.ts            (updated — navigation/disabled behaviour)
│       ├── SeasonDetailModal.test.ts     (deleted)
│       └── seasons.*.test.ts             (reviewed — remove modal assertions, add nav assertions)
├── data/
│   └── venues.ts                         (new — BSE and VCC venue static data with training schedules)
└── lib/
    └── seasons/
        ├── types.ts                      (read-only — no changes)
        ├── constants.ts                  (updated — replace PLACEHOLDER_SEASONS with COA-45 season set)
        └── utils.ts                      (updated — getSeasonAriaLabel reflects navigation intent)

specs/coa-45-seasons-page/
├── spec.md
└── plan.md                               (this file)
```

---

## Data Design

### Season Card Configuration

A `SeasonCardConfig` interface is defined at the top of `seasons.astro` (not exported to shared types — it is display-only, page-scoped):

```ts
interface SeasonCardConfig {
  id: string
  name: string
  status: SeasonStatus
  role: SeasonRole
  clickable: boolean
  navigationTarget: string | null     // URL or path; null for disabled cards
  navigationExternal: boolean         // true = open in new tab with rel="noopener noreferrer"
  statusBadgeLabel: string            // Display text e.g. "Grading", "Complete"
}
```

Concrete data for this feature:

| id | role | status | clickable | navigationTarget | navigationExternal | statusBadgeLabel |
|---|---|---|---|---|---|---|
| `winter-2026` | `current` | `active` | true | `/teams` | false | Grading |
| `summer-2025-26` | `previous` | `completed` | true | `https://www.playhq.com/basketball-victoria/org/bendigo-basketball-association/domestic-competition-summer-202526/0bf74768` | true | Complete |
| `summer-2026-27` | `next` | `coming_soon` | false | null | false | Registration Coming Soon |
| `archive` | `archive` | `coming_soon` | false | null | false | Coming Soon |

### Venue Data (`src/data/venues.ts`)

New file following the `src/data/` pattern (TypeScript export, no framework dependencies). The `Venue` interface includes a `trainingSchedule` field containing a structured list of `TrainingSession` objects. Training schedule data is in scope and must be populated for both venues — it replaces the Key Dates section previously on the seasons page.

```ts
export interface TrainingSession {
  day: string           // e.g. "Sunday", "Wednesday"
  timeSlots: {
    time: string        // e.g. "4–5pm", "5–7pm"
    ageGroups: string[] // e.g. ["U10 Girls", "U14 & U16 Girls"]
  }[]
}

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

export const VENUES: Venue[] = [
  {
    id: 'bse',
    name: 'Bendigo South East College',
    shortCode: 'BSE',
    address: '56 Ellis St, Flora Hill VIC 3550 (Enter via Keck St)',
    suburb: 'Flora Hill',
    parking: null,
    contact: null,
    mapUrl: 'https://maps.app.goo.gl/FCia6GfDHqZwHWq6A',
    trainingSchedule: [
      {
        day: 'Sunday',
        timeSlots: [
          { time: '4–5pm', ageGroups: ['U10 Girls', 'U14 & U16 Girls'] },
          { time: '5–7pm', ageGroups: ['U16 & U18 Boys'] },
        ],
      },
    ],
  },
  {
    id: 'vcc',
    name: 'Victory Christian College',
    shortCode: 'VCC',
    address: '6 Kairn Rd, Strathdale VIC 3550',
    suburb: 'Strathdale',
    parking: null,
    contact: null,
    mapUrl: 'https://maps.app.goo.gl/y1g1ByEkq3HA3AAF7',
    trainingSchedule: [
      {
        day: 'Wednesday',
        timeSlots: [
          { time: '6–7pm', ageGroups: ['U10 Boys & Girls'] },
          { time: '7–8pm', ageGroups: ['U12 Boys'] },
        ],
      },
    ],
  },
]
```

---

## SeasonTile.astro Changes

### Element type

The component currently renders a `<button>` for all cards. COA-45 requires three distinct rendering modes:

1. **Clickable internal**: renders as `<a href="/teams">` — browser-native navigation, no JS required
2. **Clickable external**: renders as `<a href="..." target="_blank" rel="noopener noreferrer">` — opens in new tab (AC-4a)
3. **Disabled**: renders as `<div>` with `aria-disabled="true"`, `tabindex="-1"`, `cursor-not-allowed`, `opacity-50`

Using a semantic anchor for clickable cards removes the need for any `onClick` prop or JS event handler on the card itself. The existing `onClick?: () => void` prop and associated `onkeydown` handler are removed.

The external anchor for Summer 2025/26 must include `target="_blank" rel="noopener noreferrer"` as required by AC-4a. This attribute pair is also required on venue map links (NFR-016) — see Training Information Section below.

### Props interface

```ts
interface Props {
  season: SeasonCardConfig
}
```

`SeasonCardConfig` is imported from `seasons.astro` scope (or defined locally in the component — either works since it is page-scoped). The simplest approach: define `SeasonCardConfig` in `src/lib/seasons/types.ts` and export it so both `seasons.astro` and `SeasonTile.astro` share the same type.

### Badge styling (brand-aligned)

Replaces generic blue Tailwind tokens:

| State | Tailwind Classes |
|---|---|
| Grading (active/current) | `bg-yellow-100 text-brand-purple border border-brand-gold` |
| Complete | `bg-gray-100 text-gray-600 border border-gray-300` |
| Registration Coming Soon | `bg-purple-50 text-purple-400 border border-purple-200` |
| Coming Soon (archive) | `bg-gray-100 text-gray-400 border border-gray-200` |

### Focus ring

`focus:ring-blue-500` and the `button:focus-visible` style block replaced with `focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2`.

### aria-label

Updated in `utils.ts` — `getSeasonAriaLabel` produces:
- Clickable internal: `"Winter 2026, Grading, view Teams page"`
- Clickable external: `"Summer 2025/26, Complete, view on PlayHQ (opens in new tab)"`
- Disabled: `"Summer 2026/27, Registration Coming Soon, not yet available"` and `"Archive, Coming Soon, not yet available"`

### Hover states

Disabled cards: hover no-op (remove `hover:shadow-md`, `hover:border-blue-300`, `hover:bg-blue-50`). Clickable cards retain hover lift with brand border colour: `hover:shadow-md hover:border-brand-purple`.

---

## seasons.astro Changes

### Removals

- Import of `SeasonDetailModal` — deleted
- Import of `KeyDatesSection` — deleted (Key Dates section is replaced by the Training Information section with venue-based training schedules)
- Import of `PLACEHOLDER_KEY_DATES` and `PLACEHOLDER_REGISTRATION_COSTS` from constants — deleted
- The `<SeasonDetailModal id="season-detail-modal" isOpen={false} />` element — deleted
- The entire `<script>` block (modal state management, click/keyboard handlers, backdrop management) — deleted
- The `<style>` block referencing `#season-detail-modal` — deleted
- The `<KeyDatesSection>` usage inside the Main Seasons Section — deleted

### Additions

- Import of `VENUES` from `src/data/venues.ts`
- Import of `SeasonCardConfig` type from `src/lib/seasons/types.ts`
- Local `SEASON_CARDS: SeasonCardConfig[]` array (the four cards defined above)
- Training Information section (new, above season cards) — renders venue name, address, training schedule (day, time slots, age groups) per venue card

### Preserved exactly as-is

- Page Hero section
- Grading Information section (with `isGradingActive` flag and conditional render)
- Slam Dunk Financial Assistance callout section

### Page section order (top to bottom)

1. Page Hero (unchanged)
2. Training Information section (new — conditional on `VENUES.length > 0`)
3. Season Cards grid (redesigned)
4. Grading Information section (preserved, conditional on `isGradingActive`)
5. Slam Dunk Financial Assistance callout (preserved)

### Season Cards grid responsive breakpoints

Current: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
Updated: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`

Reason: spec NFR-007 specifies tablet breakpoint at 640px (Tailwind `sm:`), not 768px (`md:`).

---

## Training Information Section

```html
<section aria-labelledby="training-info-heading" class="py-12 px-4 sm:px-6 lg:px-8 bg-brand-offwhite">
  <div class="max-w-7xl mx-auto">
    <h2 id="training-info-heading" class="text-2xl font-bold text-brand-purple uppercase tracking-wide mb-2">
      Training Information
    </h2>
    <div class="h-1 w-12 bg-brand-gold mb-8"></div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <!-- venue cards -->
    </div>
  </div>
</section>
```

Each venue card renders:
- `<h3>` for venue name — satisfies NFR-004 heading hierarchy
- Address text
- Training schedule: grouped by day, then each time slot with its age groups listed
- "View on Map" anchor to `mapUrl` (if present) — must use `target="_blank" rel="noopener noreferrer"` (NFR-016, consistent with the external link pattern on the Summer 2025/26 season card)
- Minimum touch target on map link: `min-h-[44px]` or `py-3`

Training schedule display structure (per venue card):

```
Sunday
  4–5pm — U10 Girls, U14 & U16 Girls
  5–7pm — U16 & U18 Boys
```

Section is conditionally rendered: `{VENUES.length > 0 && (<section>...</section>)}` — satisfies NFR-012.

---

## External Link Requirements

Two distinct locations require `target="_blank" rel="noopener noreferrer"`:

| Location | Requirement | Source |
|---|---|---|
| Summer 2025/26 season card anchor | `target="_blank" rel="noopener noreferrer"` | AC-4a, FR-005 |
| Venue map links (when `mapUrl` is present) | `target="_blank" rel="noopener noreferrer"` | NFR-016 |

Both must use the native `<a>` element — not `window.open()`. Native anchors are not subject to popup blockers and require no JS fallback.

---

## Deletions

| File | Action | Reason |
|---|---|---|
| `src/components/SeasonDetailModal.astro` | Delete | Modal pattern replaced by navigation; dead code rule |
| `src/components/__tests__/SeasonDetailModal.test.ts` | Delete | Tests for deleted component |

`RegistrationCostsCard` and `KeyDatesSection` components are not deleted — they may be used by other pages or features. Their test files are left untouched. Only the import and usage in `seasons.astro` is removed.

---

## Phased Delivery

### Phase 1 — Static Data and Types (P1 foundation)

- Add `SeasonCardConfig` to `src/lib/seasons/types.ts` (exported)
- Update `getSeasonAriaLabel` in `src/lib/seasons/utils.ts` to accept `SeasonCardConfig`
- Define `TrainingSession` interface in `src/data/venues.ts`
- Create `src/data/venues.ts` with `Venue` interface and `VENUES` array — including full `trainingSchedule` data for BSE and VCC
- Update `src/lib/seasons/constants.ts` — replace `PLACEHOLDER_SEASONS` with COA-45 season set using `SeasonCardConfig`

Deliverable: data layer ready, no visual change. Training schedule data fully populated.

### Phase 2 — SeasonTile.astro Update (P1)

- Update Props to accept `SeasonCardConfig`
- Implement three-element rendering strategy (anchor internal, anchor external with `target="_blank" rel="noopener noreferrer"`, div disabled)
- Apply brand-aligned badge colour classes
- Update focus ring to `focus-visible:ring-brand-purple`
- Remove `onClick` prop and JS event handlers from component
- Update `aria-label` generation
- Update hover states

Deliverable: component renders correctly for all four card states; AC-4a satisfied for Summer 2025/26 anchor.

### Phase 3 — seasons.astro Redesign (P1)

- Remove `SeasonDetailModal`, `KeyDatesSection` imports
- Remove modal element, `<script>` block, `<style>` block
- Wire `SEASON_CARDS` array to `SeasonTile` grid
- Fix grid breakpoint (`md:` → `sm:`)
- Preserve Grading Information and Slam Dunk sections
- Verify page builds and nav works end-to-end (Winter 2026 → `/teams`, Summer 2025/26 → PlayHQ new tab)

Deliverable: P1 stories fully implemented and verifiable.

### Phase 4 — Training Information Section (P2)

- Import `VENUES` in `seasons.astro`
- Insert Training Information section above season cards grid
- Implement venue card markup with heading hierarchy, address, training schedule (day, time slots, age groups), and map links
- Map links use `target="_blank" rel="noopener noreferrer"` (NFR-016)
- Conditional render when `VENUES.length === 0`
- Verify responsive layout at 320px, 640px, 1024px, 1440px

Deliverable: P2 story fully implemented; training schedule visible per venue card; Key Dates section fully replaced.

### Phase 5 — Test Suite Cleanup (all priorities)

- Delete `SeasonDetailModal.astro` and `SeasonDetailModal.test.ts`
- Update `SeasonTile.test.ts` for new Props shape and navigation/disabled behaviour
- Review `seasons.*.test.ts` files — remove all modal-related assertions, add navigation assertions
- Add assertions for `target="_blank" rel="noopener noreferrer"` on Summer 2025/26 anchor (AC-4a) and venue map links (NFR-016)
- Verify no references to `SeasonDetailModal` remain in `src/`
- Run existing test suite; fix any failures

Deliverable: clean test suite, no dead code, no dangling modal references.

---

## Open Questions (none blocking)

All OQ-001 through OQ-005 from the spec are resolved. No open questions remain before implementation begins.

The only implementation detail to confirm during Phase 2: whether `SeasonCardConfig` lives in `src/lib/seasons/types.ts` (shared) or is defined locally in `SeasonTile.astro`. Recommendation: add it to `types.ts` so both files share the same type without an import cycle.

---

## Complexity Tracker

| Item | Decision | Justification |
|---|---|---|
| Three render modes in SeasonTile | `<a>` for clickable, `<div>` for disabled | Semantic HTML; removes need for JS navigation handlers on cards; `<button>` with JS would work but is less accessible for link-style navigation |
| SeasonCardConfig as new type | Added to `types.ts` | Avoids prop shape drift between `seasons.astro` and `SeasonTile.astro`; keeps type system as single source of truth |
| Modal deleted, not feature-flagged | Hard delete | Spec and COA-24 requirement both state modal must not remain as dead code; no other page uses it |
| `sm:` breakpoint for 2-col grid | Changed from `md:` | Aligns with spec NFR-007 (640px tablet boundary); `md:` is 768px in Tailwind which violates the spec |
| TrainingSession as structured type | Nested interface (`day`, `timeSlots[]{time, ageGroups}`) | Spec requires training schedule displayed as day, time slots, and age groups — a flat string would not support structured rendering; structured type enables future sorting or filtering |
| Key Dates section replaced | Removed import and usage; not deleted from codebase | Training Information section with per-venue training schedules is the in-scope replacement; KeyDatesSection component may be used elsewhere and is not deleted |
| External link attributes enforced in two places | AC-4a (season card) and NFR-016 (map links) both require `target="_blank" rel="noopener noreferrer"` | Consistent external link behaviour across the page; both use native `<a>` — no JS workaround needed |
