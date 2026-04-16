# Implementation Plan: COA-61 — Seasons Update

**Branch**: `cameronwalsh/coa-61-seasons-update` | **Date**: 2026-04-16 | **Spec**: `specs/coa-61-seasons-update/spec.md`

---

## Summary

Add a Season Information section to `src/pages/seasons.astro` replacing the existing Club Training Information (venue cards) section. The section contains 4 clickable cards (Training, Uniforms, Clearances, Registration). Each card opens a self-contained modal displaying structured sub-cards. The implementation introduces one new data file, two new Astro components, and a new `<script>` block in `seasons.astro` for modal orchestration.

No new npm dependencies. No backend changes. All data is static at build time.

---

## Technical Context

- **Language/Version**: TypeScript (Astro's frontmatter), vanilla JS (client `<script>` blocks)
- **UI Framework**: Astro 5 — Astro components only, no React
- **Styling**: Tailwind CSS utility classes, mobile-first
- **Storage**: None — all data is static files in `src/data/`
- **Testing**: Manual acceptance tests (browser-based); no Vitest unit tests apply to pure Astro markup. Edge cases verified visually at target breakpoints.
- **Target Platform**: Web (desktop + mobile)
- **Performance Goals**: Zero API calls; all content rendered at build time; sub-card images use `loading="lazy"`
- **Scale/Scope**: Single page, 4 modals, 9 sub-cards total across all modals

---

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I — User Outcomes First | PASS | 4 user stories with testable ACs; preserved sections confirmed via AC-13 |
| II — Test-First Discipline | PASS | 16 ACs in Given/When/Then; all testable in-browser before final images land |
| III — Backend Authority | PASS | Static site only; no backend interaction; no client-side data mutation |
| IV — Error Semantics | PASS | NFR-017 (broken image placeholder) and NFR-018 (missing data file safe state) defined |
| V — AppShell Integrity | PASS | Renders inside existing `BaseLayout.astro`; no custom shell; body scroll lock matches `ResourceModal.astro` |
| VI — Accessibility First | PASS | NFR-001–NFR-008 cover keyboard, ARIA, touch targets, focus trap, focus return |
| VII — Immutable Data Flow | PASS | Static data → Astro component → HTML; JS handles open/close only |
| VIII — Dependency Hygiene | PASS | Zero new dependencies |
| IX — Cross-Feature Consistency | PASS | Modal pattern mirrors `ResourceModal.astro`; card focus ring matches `SeasonTile.astro` |

---

## Project Structure

```
src/
├── data/
│   ├── venues.ts                          (existing — Training sub-cards source of truth)
│   └── season-info.ts                     (NEW — image sub-cards for Uniforms, Clearances, Registration)
│
├── components/
│   ├── SeasonInfoCard.astro               (NEW — top-level clickable card; triggers a modal)
│   ├── SeasonInfoModal.astro              (NEW — modal container + both sub-card variants)
│   └── ResourceModal.astro               (existing — not modified)
│
├── pages/
│   └── seasons.astro                     (MODIFIED — replace Club Training Information section)
│
public/
└── uploads/                              (existing — sub-card images already present)

specs/coa-61-seasons-update/
├── spec.md
└── plan.md                               (this file)
```

### Image file mapping (uploads/ → sub-card)

| File | Sub-card |
|---|---|
| `uploads/uniform_how-to_order.png` | Uniforms — How To |
| `uploads/uniform_numbers.png` | Uniforms — Numbers |
| `uploads/uniform_loan_program.png` | Uniforms — Loan |
| `uploads/uniform_2nd_hand.png` | Uniforms — 2nd Hand |
| `uploads/registration_clearance.png` | Clearances — (single sub-card, clickable link) |
| `uploads/registration_how_to.png` | Registration — How To |
| `uploads/registration_winter26_fees.png` | Registration — Fees / Winter 2026 |

Images `registration_closed.png`, `registration_winter_fee_breakdown.png`, `wanna_ref.png`, and `volunteers_needed.png` are available but not allocated to the Season Information section based on the 2+1+2 sub-card counts in the spec. The implementer must confirm the final mapping with the content owner before launch; placeholder `alt` text and titles must be updated at that time.

---

## Data Model

### New file: `src/data/season-info.ts`

Defines two TypeScript interfaces and a single exported array `SEASON_INFO_CARDS`. Training does not appear here — it is sourced directly from `VENUES` in `src/data/venues.ts`.

```ts
export interface ImageSubCard {
  id: string
  title: string
  description: string | null
  imageSrc: string        // e.g. '/uploads/uniform_how-to_order.png'
  imageAlt: string
  linkUrl: string | null  // only set for the Clearances sub-card
  linkLabel: string | null
}

export interface SeasonInfoCard {
  id: 'training' | 'uniforms' | 'clearances' | 'registration'
  label: string
  icon: string
  description: string
  modalTitle: string
  subCards: ImageSubCard[]  // empty for 'training' — VENUES is used instead
}

export const SEASON_INFO_CARDS: SeasonInfoCard[] = [
  {
    id: 'training',
    label: 'Training',
    icon: '🏀',
    description: 'Venues, times, and age groups for club training sessions.',
    modalTitle: 'Training Information',
    subCards: [],           // Training modal renders VENUES directly
  },
  {
    id: 'uniforms',
    label: 'Uniforms',
    icon: '👕',
    description: 'How to order, borrow, or buy second-hand team uniforms.',
    modalTitle: 'Uniform Information',
    subCards: [
      {
        id: 'uniform-how-to',
        title: 'How To Order',
        description: null,
        imageSrc: '/uploads/uniform_how-to_order.png',
        imageAlt: 'Instructions for ordering a team uniform',
        linkUrl: null,
        linkLabel: null,
      },
      {
        id: 'uniform-numbers',
        title: 'Numbers',
        description: null,
        imageSrc: '/uploads/uniform_numbers.png',
        imageAlt: 'Guide to selecting a uniform number',
        linkUrl: null,
        linkLabel: null,
      },
      {
        id: 'uniform-loan',
        title: 'Loan Program',
        description: null,
        imageSrc: '/uploads/uniform_loan_program.png',
        imageAlt: 'Information about the uniform loan program',
        linkUrl: null,
        linkLabel: null,
      },
      {
        id: 'uniform-2nd-hand',
        title: '2nd Hand',
        description: null,
        imageSrc: '/uploads/uniform_2nd_hand.png',
        imageAlt: 'Information about purchasing second-hand uniforms',
        linkUrl: null,
        linkLabel: null,
      },
    ],
  },
  {
    id: 'clearances',
    label: 'Clearances',
    icon: '📋',
    description: 'Complete your clearance before the season starts.',
    modalTitle: 'Clearances',
    subCards: [
      {
        id: 'clearance-portal',
        title: 'Submit a Clearance',
        description: null,
        imageSrc: '/uploads/registration_clearance.png',
        imageAlt: 'Clearance submission form — click to open the clearance portal',
        linkUrl: 'https://form.jotform.com/222288044427860',
        linkLabel: 'Open clearance portal in a new tab',
      },
    ],
  },
  {
    id: 'registration',
    label: 'Registration',
    icon: '📝',
    description: 'Register your player for the upcoming season.',
    modalTitle: 'Registration Information',
    subCards: [
      {
        id: 'registration-how-to',
        title: 'How To Register',
        description: null,
        imageSrc: '/uploads/registration_how_to.png',
        imageAlt: 'Step-by-step guide to registering for the season',
        linkUrl: null,
        linkLabel: null,
      },
      {
        id: 'registration-fees',
        title: 'Season Fees',
        description: null,
        imageSrc: '/uploads/registration_winter26_fees.png',
        imageAlt: 'Winter 2026 registration fee breakdown',
        linkUrl: null,
        linkLabel: null,
      },
    ],
  },
]
```

Note: `title`, `description`, and `imageAlt` values above are working placeholders. Final copy must be confirmed by the content owner before launch (per spec OQ-004). The structural layout and component wiring can be fully tested with these placeholders.

---

## Component Design

### SeasonInfoCard.astro

A `<button>` element styled as a card. Renders inside the Season Information grid in `seasons.astro`.

Props:
- `id: string` — matches `SeasonInfoCard.id`, used as the `data-modal-id` attribute to identify which modal to open
- `label: string`
- `icon: string`
- `description: string`
- `ariaLabel: string` — e.g. `"Training — view training information"`

Rendered as a `<button type="button">` (not `<a>`) because it triggers a modal, not navigation. Styling:

```
rounded-xl border-2 border-gray-200 bg-white p-6 text-center shadow-sm
transition-all duration-200
hover:border-brand-purple hover:shadow-md
focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2
min-h-[120px] md:min-h-[140px]
```

This is visually distinct from `SeasonTile.astro` (which uses coloured background tones and status badges) — the Season Information cards use a white background with a border, no status badge, and a textual description below the icon.

### SeasonInfoModal.astro

A single modal component that handles all 4 modal variants. It renders the correct sub-card layout based on a `data-modal-id` attribute set at runtime by the card click handler.

All 4 modal containers are pre-rendered in the HTML at build time (hidden by default), each identified by `id="season-info-modal-{card.id}"`. The client script toggles visibility.

Structure for each modal instance:

```
<div id="season-info-modal-{id}" class="fixed inset-0 z-[70] hidden" role="dialog" aria-modal="true" aria-labelledby="season-info-modal-title-{id}" data-open="false">
  <!-- backdrop -->
  <div class="absolute inset-0 bg-black/15" aria-hidden="true"></div>
  <!-- panel -->
  <div class="relative z-10 flex h-full w-full items-center justify-center md:p-4">
    <div class="flex h-full w-full flex-col overflow-hidden bg-brand-offwhite md:h-auto md:max-h-[90vh] md:w-[95vw] md:max-w-3xl md:rounded-xl md:shadow-xl">
      <!-- header -->
      <header class="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 md:px-6">
        <h2 id="season-info-modal-title-{id}" class="text-lg font-black uppercase tracking-tight text-brand-black md:text-xl">{card.modalTitle}</h2>
        <button type="button" id="season-info-close-{id}" aria-label="Close {card.modalTitle}" class="min-h-[44px] min-w-[44px] ...">
          <!-- X icon -->
        </button>
      </header>
      <!-- body — sub-card grid -->
      <div class="overflow-y-auto p-4 md:p-6">
        <!-- Training: venue sub-cards (text-only, 2 col desktop / 1 col mobile) -->
        <!-- Uniforms: image sub-cards (2x2 desktop / 1 col mobile) -->
        <!-- Clearances: 1 centered image sub-card -->
        <!-- Registration: image sub-cards (2 col desktop / 1 col mobile) -->
      </div>
    </div>
  </div>
</div>
```

The backdrop uses `bg-black/15` (approximately 15% opacity) per NFR-014 — a lighter overlay than `ResourceModal.astro`'s `bg-black/60`, giving a floating feel.

Sub-card grid classes per modal:

| Modal | Desktop grid class | Mobile behaviour |
|---|---|---|
| Training | `grid-cols-2` | `grid-cols-1` (base) |
| Uniforms | `sm:grid-cols-2` | `grid-cols-1` (base) |
| Clearances | `flex justify-center` | Same (centered) |
| Registration | `sm:grid-cols-2` | `grid-cols-1` (base) |

Sub-card variants:

**Venue sub-card** (Training only): White card, `rounded-lg border border-gray-200 p-6 shadow-sm`. Renders `venue.name`, `venue.shortCode`, `venue.address`, training schedule rows, and a "View on Map" anchor — exactly as the existing Club Training Information section renders them, so the existing markup from `seasons.astro` lines 36–69 can be extracted verbatim as the venue sub-card template.

**Image sub-card** (Uniforms, Clearances, Registration): White card, `rounded-lg border border-gray-200 overflow-hidden shadow-sm`. Top section is the image (`<img loading="lazy" width="..." height="...">`). When `linkUrl` is set (Clearances only), the `<img>` is wrapped in `<a href="{linkUrl}" target="_blank" rel="noopener noreferrer" aria-label="{linkLabel}">` with `class="block cursor-pointer hover:opacity-90 transition-opacity"`. Bottom section renders `title` and optional `description` in a `p-4` padding block.

Broken image fallback (NFR-017): The `<img>` includes an `onerror` inline handler or a `<figure>` with an accessible `<figcaption>`. A simpler static approach: give the image a parent `<div class="bg-gray-100 min-h-[120px] flex items-center justify-center">` that shows behind the image. If the image fails, the neutral background is visible and the alt text renders as the browser's broken-image indicator. The sub-card dimensions do not collapse.

---

## Client-Side JavaScript

The script block lives in `seasons.astro` (not in the component, to keep Astro component script hoisting predictable). It handles all 4 modals with a single shared implementation.

Key behaviours:

**Open**
1. Record `triggerEl = document.activeElement` (the card button that was clicked)
2. If another modal is already open, close it first (FR-013 close-first behaviour)
3. Remove `hidden` from the target modal, set `data-open="true"`, add `overflow-hidden` to `document.body`
4. `requestAnimationFrame(() => closeBtn.focus())` — focus the close button

**Close**
1. Add `hidden` to modal, set `data-open="false"`, remove `overflow-hidden` from `document.body`
2. `triggerEl.focus()` — return focus to the triggering card

**Focus trap** (same pattern as `ResourceModal.astro`)
- `keydown` listener: if `Tab` and modal is open, wrap focus within modal's focusable elements
- Selector: `'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'`

**Escape**
- Global `keydown` listener: if `Escape` and any modal is `data-open="true"`, close it

**Backdrop click**
- Each backdrop `div` has a `click` listener that calls `closeModal`

**Card activation**
- Each `SeasonInfoCard` button has a `click` listener
- Also handles `keydown` for `Enter` and `Space` (buttons handle these natively, but explicitly listed in spec)

**Multiple rapid clicks (edge case)**
- Guard: if `modal.dataset.open === 'true'` and same modal, do nothing

---

## Phased Delivery

### Phase 1: Data File

Create `src/data/season-info.ts` with the `SeasonInfoCard` and `ImageSubCard` interfaces and the `SEASON_INFO_CARDS` array (placeholder copy acceptable for non-Training modals).

Deliverable: TypeScript compiles cleanly; `VENUES` in `src/data/venues.ts` is unchanged.

Verification: Import `SEASON_INFO_CARDS` in a scratch context or confirm via build that the types resolve.

---

### Phase 2: SeasonInfoCard Component

Create `src/components/SeasonInfoCard.astro`.

Renders a `<button>` with the icon, label, description, correct `aria-label`, and `data-modal-id` attribute. Applies all Tailwind classes for hover and focus-visible ring.

Deliverable: Component renders correctly in isolation; meets NFR-001, NFR-002, NFR-008.

Manual check: Tab to the button, confirm visible focus ring (`ring-2 ring-brand-purple`). Click button — nothing happens yet (no script). Inspect DOM for `aria-label` attribute.

---

### Phase 3: SeasonInfoModal Component

Create `src/components/SeasonInfoModal.astro`.

Props: `card: SeasonInfoCard`, `venues: Venue[]` (passed only when `card.id === 'training'`).

Renders the modal shell (backdrop + panel + header + close button) and the appropriate sub-card grid inside the scrollable body.

- Training: iterate `venues` to render venue sub-cards (extract the existing markup from `seasons.astro` lines 34–69)
- Uniforms/Registration: iterate `card.subCards` to render image sub-cards in appropriate grid
- Clearances: single centered image sub-card with the external link wrapper

All modals initially have `class="fixed inset-0 z-[70] hidden"` and `data-open="false"`.

Deliverable: All 4 modal HTML structures present in page source when `seasons.astro` is updated; `aria-labelledby` resolves to correct `<h2>` for each modal.

Manual check: Remove `hidden` class from one modal in DevTools — verify layout, sub-card grid, and close button render correctly at 320px, 768px, and 1280px viewports.

---

### Phase 4: Replace Section in seasons.astro

Modify `src/pages/seasons.astro`:

1. Add imports: `import SeasonInfoCard from '../components/SeasonInfoCard.astro'`, `import SeasonInfoModal from '../components/SeasonInfoModal.astro'`, `import { SEASON_INFO_CARDS } from '../data/season-info'`
2. Replace the entire `VENUES.length > 0 &&` section (lines 26–72) with the new Season Information section:

```astro
<section aria-labelledby="season-info-heading" class="bg-brand-offwhite px-4 py-12 sm:px-6 lg:px-8">
  <div class="mx-auto max-w-7xl">
    <h2 id="season-info-heading" class="mb-2 text-2xl font-bold uppercase tracking-wide text-brand-purple">
      Season Information
    </h2>
    <div class="mb-8 h-1 w-12 bg-brand-gold"></div>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {SEASON_INFO_CARDS.map((card) => (
        <SeasonInfoCard
          id={card.id}
          label={card.label}
          icon={card.icon}
          description={card.description}
          ariaLabel={`${card.label} — view ${card.label.toLowerCase()} information`}
        />
      ))}
    </div>
  </div>
</section>

{SEASON_INFO_CARDS.map((card) => (
  <SeasonInfoModal card={card} venues={card.id === 'training' ? VENUES : []} />
))}
```

3. Remove the `import { VENUES }` line (now only used inside `SeasonInfoModal`)
4. Keep `VENUES` import if it is still needed for `SeasonInfoModal` — pass it down via props only for Training

Deliverable: `seasons.astro` builds cleanly; the four Season Information cards appear on the page; the four modal HTML structures are in the DOM; the existing season tile grid, financial assistance callout, and grading section are all intact.

Manual check: Inspect page source for all 4 card buttons and all 4 modal `<div>` elements. Confirm the old `Club Training Information` section heading is gone.

---

### Phase 5: Client-Side Modal Script

Add a `<script>` block at the bottom of `seasons.astro` (inside `<BaseLayout>`, after all modal components). This block wires all card buttons to their modals.

```ts
(function () {
  const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';
  let triggerEl: HTMLElement | null = null;
  let openModalEl: HTMLElement | null = null;

  function getModal(id: string): HTMLElement | null {
    return document.getElementById(`season-info-modal-${id}`);
  }

  function closeModal(modal: HTMLElement) {
    modal.classList.add('hidden');
    modal.setAttribute('data-open', 'false');
    document.body.classList.remove('overflow-hidden');
    if (triggerEl) triggerEl.focus();
    openModalEl = null;
    triggerEl = null;
  }

  function openModal(modal: HTMLElement, trigger: HTMLElement) {
    if (openModalEl && openModalEl !== modal) {
      closeModal(openModalEl);
    }
    if (modal.dataset.open === 'true') return;

    triggerEl = trigger;
    openModalEl = modal;
    modal.classList.remove('hidden');
    modal.setAttribute('data-open', 'true');
    document.body.classList.add('overflow-hidden');

    const closeBtn = modal.querySelector<HTMLElement>('[data-close-btn]');
    requestAnimationFrame(() => closeBtn?.focus());
  }

  function trapFocus(event: KeyboardEvent, modal: HTMLElement) {
    if (event.key !== 'Tab') return;
    const nodes = Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // Wire each card button
  document.querySelectorAll<HTMLButtonElement>('[data-modal-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modal = getModal(btn.dataset.modalId!);
      if (modal) openModal(modal, btn);
    });
  });

  // Wire close buttons and backdrops
  document.querySelectorAll<HTMLElement>('[data-close-btn]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modal = btn.closest<HTMLElement>('[role="dialog"]');
      if (modal) closeModal(modal);
    });
  });

  document.querySelectorAll<HTMLElement>('[data-modal-backdrop]').forEach((backdrop) => {
    backdrop.addEventListener('click', () => {
      const modal = backdrop.closest<HTMLElement>('[role="dialog"]');
      if (modal) closeModal(modal);
    });
  });

  // Global keyboard handler
  document.addEventListener('keydown', (event) => {
    if (!openModalEl) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal(openModalEl);
      return;
    }
    trapFocus(event, openModalEl);
  });
})();
```

The close button in `SeasonInfoModal.astro` uses `data-close-btn` and the backdrop uses `data-modal-backdrop` as selector hooks — no IDs needed in the script.

Deliverable: All 4 modals open and close via click, Escape key, and backdrop click. Focus trap works. Focus returns to triggering card on close. Only one modal open at a time.

---

### Phase 6: Accessibility and Responsive Pass

Verify all NFRs with manual testing at breakpoints:

- 320px: single-column card grid; single-column sub-card stacks; no horizontal overflow
- 640px (sm): 2-column card grid; 2-column sub-card grids for Training/Registration; 2x2 grid for Uniforms
- 1024px+ (lg): 4-column card grid; grid layouts unchanged from 640px inside modals

Keyboard run-through:
1. Tab to Training card — confirm `focus-visible` ring visible
2. Press Enter — modal opens, focus on close button
3. Tab through elements — confirm focus trap (only close button and any links inside modal)
4. Shift+Tab — wraps back to last focusable
5. Escape — modal closes, focus returns to Training card
6. Repeat for Uniforms, Clearances (confirm image link is focusable and opens in new tab), Registration
7. Click Uniforms card while Training modal is open — confirm Training closes first

Touch target check: close button and clearance image link must be at least 44x44px (enforced via `min-h-[44px] min-w-[44px]` on close button; clearance image will be naturally larger).

ARIA check (DevTools accessibility tree):
- Each card button: `role=button`, `aria-label` populated
- Each modal `div`: `role=dialog`, `aria-modal=true`, `aria-labelledby` resolves to correct `<h2>`
- Clearance image link: `aria-label="Open clearance portal in a new tab"`

---

### Phase 7: Error / Edge Case Pass

- Remove image src from one sub-card in dev — confirm card renders neutral background, no layout collapse
- Resize to below 375px — confirm no horizontal scroll
- Rapid-click a card — confirm modal opens only once, no duplicates

---

## Testing Strategy

This feature is an Astro static site with no server-side logic and no Vitest-testable pure functions. All testing is manual and browser-based, mapped directly to the spec's 16 acceptance criteria.

**Pre-flight checklist (run before marking complete)**

| AC | Test action | Expected |
|---|---|---|
| AC-01 | Load `/seasons` | 4 Season Information cards visible: Training, Uniforms, Clearances, Registration (in order) |
| AC-02 | Click Training | Modal opens with 2 venue sub-cards |
| AC-03 | Click Uniforms (desktop > 640px) | Modal opens with 4 sub-cards in 2x2 grid |
| AC-04 | Click Uniforms (mobile < 640px) | 4 sub-cards in 1-column stack |
| AC-05 | Click Registration | Modal opens with 2 sub-cards |
| AC-06 | Click Clearances | Modal opens with 1 centered sub-card |
| AC-07 | Click clearance image | External URL opens in new tab; modal stays open |
| AC-08 | Click X on any modal | Modal closes; focus returns to triggering card |
| AC-09 | Press Escape on any modal | Modal closes; focus returns to triggering card |
| AC-10 | Click backdrop | Modal closes |
| AC-11 | Tab inside open modal | Focus cycles only within modal |
| AC-12 | Tab to card, press Enter or Space | Modal opens; focus moves to close button |
| AC-13 | Inspect page | Season tile grid, financial assistance callout, grading section all present |
| AC-14 | Desktop > 1024px | 4 Season Information cards in one row |
| AC-15 | Mobile < 640px | 4 Season Information cards in 1 column |
| AC-16 | Break an image src | Visible placeholder; modal layout intact |

---

## Complexity Tracker

No constitutional violations. No deviations from established patterns.

One deliberate design choice worth noting: `SeasonInfoModal.astro` renders all 4 modal containers at build time (all hidden). An alternative would be to inject modal HTML dynamically via the client script. The static pre-render approach is chosen because:
- It aligns with Principle VII (immutable data flow — no client-side HTML generation)
- It is consistent with how `ResourceModal.astro` works (single pre-rendered container)
- It allows `aria-labelledby` references to be fully resolved at build time
- It avoids any flash or paint cost on open

The trade-off is a minor increase in initial HTML payload (4 modal skeletons × ~20 lines each). This is negligible for a page of this size.

---

## Open Items Before Implementation Starts

1. **Image-to-sub-card mapping**: The mapping in this plan (see Image file mapping table above) is inferred from file names. The implementer must confirm with the content owner that:
   - `registration_how_to.png` is intended for Registration sub-card 1
   - `registration_winter26_fees.png` is intended for Registration sub-card 2
   - The remaining uploads (`registration_closed.png`, `registration_winter_fee_breakdown.png`, `wanna_ref.png`, `volunteers_needed.png`) are not part of this feature
2. **Sub-card titles and descriptions**: Placeholder copy is acceptable for development and structural testing. Final copy must be provided before launch.
3. **Image dimensions**: The implementer should check actual pixel dimensions of each upload to set correct `width` and `height` attributes on `<img>` elements (prevents layout shift, per NFR-020).
