# Implementation Plan: COA-19 — Court Time Calculator

**Branch**: coa-19 | **Date**: 2026-04-07 | **Spec**: `specs/coa-19-court-time-calculator/spec.md`

---

## 1. Overview

The Court Time Calculator is built as a single Astro page (`src/pages/court-time-calculator.astro`) containing a vanilla TypeScript application managed entirely within the page's `<script>` block. There is no JavaScript framework (React, Preact, Vue) installed on this site; the existing pattern is Astro + vanilla TS DOM manipulation, and this feature follows that pattern exactly. The rotation algorithm lives in a separate pure TypeScript module (`src/lib/court-time/algorithm.ts`) with no DOM dependencies so it can be unit-tested in isolation. The Gantt chart is rendered as CSS div bars (not SVG) for simplicity, accessibility, and Tailwind compatibility. PDF export uses jsPDF loaded dynamically from npm — it is the only new runtime dependency. The feature is delivered in five execution windows designed for sub-agent handoff, each with a well-defined surface area.

---

## 2. Technical Decisions

### 2.1 No JavaScript Framework

**Decision**: Vanilla TypeScript + DOM manipulation inside Astro `<script>` blocks. No React, Preact, or Svelte.

**Reasoning**: The project has zero framework dependencies. Adding Preact or React for a single interactive page introduces a new runtime (~45 KB), new patterns, and framework-specific Astro integration config. The tool's interactivity — form submission, DOM updates, conditional display — is well within what vanilla TS handles cleanly. The existing `coaching-resources.astro` page demonstrates this pattern with filter logic. Consistency with the codebase outweighs the ergonomic benefits of a reactive framework for this scale of UI.

**Implication for architecture**: State is held in module-level variables in the script block. Re-rendering is done by targeting specific DOM nodes and replacing `innerHTML` or toggling CSS classes. There is one master `render()` dispatch function that reflects the current app state to the DOM.

### 2.2 Gantt Chart: CSS Div Bars, Not SVG

**Decision**: Render the Gantt chart as a structured set of `<div>` elements using absolute/relative positioning and percentage-based widths.

**Reasoning**: SVG is more precise but requires manual coordinate math, is harder to style with Tailwind utility classes, and produces less accessible markup by default. CSS div bars map directly to Tailwind layout utilities (`relative`, `absolute`, percentage widths calculated as inline styles). Minimum visible bar width is enforced with a CSS `min-width` rule to satisfy the edge case for 1–2 minute stints. Horizontal scroll is handled with `overflow-x: auto` on the chart container. The accessibility text summary (NFR-005) sits below the chart as a `<details>` element listing each player's court time allocation.

**Container approach**: The chart has a fixed minimum pixel width (e.g. `min-width: 600px`) so the time axis is always readable, with the outer wrapper allowing horizontal scroll on narrow viewports.

### 2.3 PDF Library: jsPDF

**Decision**: Use `jsPDF` (v2.x) for client-side PDF generation.

**Reasoning**:

| Library | Size (gzipped) | iOS Safari | Notes |
|---|---|---|---|
| jsPDF | ~270 KB | Yes | Mature, widely used, no external deps at runtime, works in all modern browsers including iOS Safari via `blob:` URL + `window.open()` fallback |
| pdfmake | ~400 KB | Yes | More layout power but significantly heavier |
| @react-pdf/renderer | ~150 KB + React | Requires React | Not viable — no React on this site |
| pdf-lib | ~280 KB | Yes | Lower-level, more work for formatted tables |

jsPDF is the right choice: it is the most familiar, has excellent TypeScript types via `@types/jspdf`, and the substitution sheet is a simple document (title, table rows) that does not need pdfmake's advanced layout engine.

**iOS Safari handling**: Direct `a.download` on blob URLs fails on iOS Safari. The export function will detect iOS and call `window.open(blobUrl)` instead of triggering a programmatic download. jsPDF's `.output('bloburl')` method produces a URL suitable for this pattern.

**Dynamic import**: jsPDF is imported dynamically (`import('jspdf')`) inside the export button handler so the ~270 KB bundle does not block initial page load. It is fetched only when the coach taps "Export PDF".

### 2.4 Algorithm Isolation

**Decision**: The rotation algorithm lives in `src/lib/court-time/algorithm.ts` as a pure TypeScript module. It imports no DOM APIs, no Astro utilities, and no third-party libraries.

**Reasoning**: The algorithm is the most complex and failure-prone part of this feature. Isolating it as a pure function (input: `Player[]` + `startingFive: Player[]` → output: `RotationPlan`) makes it independently testable with a simple test harness. Correctness can be verified before any UI is built.

### 2.5 TypeScript Types: Shared Type Module

**Decision**: All shared data structures from the spec (`Player`, `RotationPlan`, `HalfPlan`, `SubstitutionEvent`, `PlayerSchedule`, `Stint`) are defined in `src/lib/court-time/types.ts`. Both the algorithm and the page script import from this file.

### 2.6 Tailwind Version

**Note for implementing agents**: This project uses **Tailwind CSS v4** via `@tailwindcss/vite` (not PostCSS). Brand colours are defined as `@theme` variables in `src/styles/global.css` and are available as `bg-brand-purple`, `text-brand-gold`, etc. in Tailwind utility classes. There is no `tailwind.config.mjs` in active use. Do not attempt to modify `tailwind.config.mjs`; add any new custom CSS to `src/styles/global.css`.

---

## 3. Algorithm Design Notes

These notes specify the mathematical approach the implementing agent must follow. The algorithm must be deterministic, produce results meeting FR-006 through FR-015, and favour long consecutive stints over frequent rotations.

### 3.1 Court Time Targets

Given `n` players (7, 8, or 9) and 40 total minutes with 5 players always on court:

```
totalMinutes = 40
totalPlayerMinutes = 5 * 40 = 200
baseMinutes = floor(200 / n)          // e.g. 28 for n=7, 25 for n=8, 22 for n=9
remainder = 200 mod n                 // e.g. 4 for n=7, 0 for n=8, 2 for n=9
```

The first `remainder` players in roster entry order receive `baseMinutes + 1` minutes. The remaining players receive `baseMinutes` minutes. This is deterministic by definition (FR-015).

### 3.2 Half Allocation

Each half is 20 minutes. The algorithm distributes each player's total court time target across the two halves. Preferred split is as close to 50/50 as possible, but the half-time constraint means each player's per-half allocation must be a whole number.

```
halfTarget[p] = round(target[p] / 2)
```

Because of rounding, the sum across players of `halfTarget[p]` for a single half may not equal exactly 100. The algorithm must correct this: if the sum for half 1 is less than 100, distribute the extra minutes to the players with the most bench time so far; if more than 100, reduce from players with least bench time. After correction, half 2 targets are set as `target[p] - halfTarget1[p]`.

### 3.3 Scheduling a Single Half

Given a half with 20 minutes, a starting five, and per-player minute targets for this half:

**Step 1 — Represent the schedule as a slot sequence.**
Create a 20-element array (`slots[0..19]`) representing minutes 0–19. Each slot holds the 5 player IDs currently on court. Initialise all slots with the starting five.

**Step 2 — Compute deficits.**
For each player not in the starting five, they have a target of `halfTarget[p]` minutes and currently 0 assigned. For players in the starting five, they are provisionally assigned 20 minutes — far over target for bench players.

**Step 3 — Apply substitutions greedily.**
The goal is to honour each player's half-target while minimising substitution count (FR-014). Use the following approach:

- For each bench player `b` ordered by descending half-target, find a starting player `s` who is most over their half-target.
- Determine a substitution window: player `b` comes on for player `s` for `halfTarget[b]` consecutive minutes.
- Place this window as late in the half as possible (to give `s` maximum consecutive early time) without conflicting with another substitution at the same minute.
- Mark the entry and exit minutes of `b` as substitution events.

**Step 4 — Resolve minute conflicts (FR-012).**
If two substitution events land on the same minute, shift one by +1 or -1 minute (adjusting the stint duration accordingly). Apply this correction iteratively until no two events share a minute. Adjustments must keep all stints ≥ 1 minute and all events within minutes 1–19 (no event at minute 0 or 20).

**Step 5 — Merge simultaneous swaps.**
If at any minute both a player entering and a player leaving happen (due to multiple swaps), these are represented as a single `SubstitutionEvent` with multiple `playersComingOn` and `playersSittingDown` entries.

**Step 6 — Validate.**
Assert: sum of all player stints = 100 player-minutes; exactly 5 players active at every minute; no two events at same minute; all events at minutes 1–19.

### 3.4 Second-Half Starting Five (FR-019)

After scheduling the first half, compute `courtTimeAfterHalf1[p]` for each player. Compute the remaining target for each player: `remaining[p] = target[p] - courtTimeAfterHalf1[p]`. The second-half starting five is the 5 players with the highest `remaining[p]` values. Ties are broken by original roster entry order (deterministic). These 5 players start with the most court time left to serve, which naturally produces the most equitable second half.

### 3.5 Deriving PlayerSchedule (Gantt Data)

After both halves are scheduled, derive `PlayerSchedule[]` by walking each player's timeline minute by minute across the full 40-minute game. Each contiguous block of on-court or bench time becomes a `Stint`. `startMinute` and `endMinute` are absolute game clock minutes (0–40), not half-relative. Half 2 absolute minutes = half 2 half-relative minutes + 20.

---

## 4. Phase Breakdown

---

### Phase 1 — Algorithm (Pure TypeScript, No DOM)

**Goal**: Implement and fully verify the rotation algorithm as an isolated TypeScript module. No UI, no Astro, no DOM.

**Inputs required before starting**:
- This plan.md
- The spec (for FR-006 through FR-015 and the data structure definitions)

**Tasks**:

1. Create `src/lib/court-time/types.ts` — define all types from spec section "Key Entities": `Player`, `Roster`, `RotationPlan`, `HalfPlan`, `SubstitutionEvent`, `PlayerSchedule`, `Stint`.
2. Create `src/lib/court-time/algorithm.ts` — implement `generateRotationPlan(players: Player[], startingFive: Player[]): RotationPlan` following the design notes in section 3.
3. Implement `computeCourtTargets(n: number): number[]` — returns per-player minute targets summing to 200, first `remainder` players get `baseMinutes + 1`.
4. Implement `scheduleHalf(players: Player[], startingFive: Player[], targets: number[], halfNumber: 1 | 2): HalfPlan` — produces a valid HalfPlan.
5. Implement `derivePlayerSchedules(plan: RotationPlan): PlayerSchedule[]` — converts HalfPlan substitution events into per-player Stint arrays.
6. Implement `selectSecondHalfStarters(players: Player[], half1Plan: HalfPlan): Player[]` — returns 5 players with highest remaining target.
7. Create `src/lib/court-time/algorithm.test.ts` — write test cases:
   - 7-player roster: all court times are 28 or 29, sum is 200, no player differs by more than 1 minute
   - 8-player roster: all court times exactly 25
   - 9-player roster: all court times are 22 or 23, sum is 200
   - Starting five: verify first half begins with coach-selected players
   - Determinism: same input → same output (call twice, compare)
   - No two substitutions at same minute (both halves)
   - No substitution at minute 0 or 20
   - Sum of player-minutes per half = 100
   - Stint continuity: no gaps or overlaps in any player's timeline
8. Run tests and confirm all pass. Fix algorithm until all tests pass.

**Outputs produced**:
- `src/lib/court-time/types.ts` — final, tested
- `src/lib/court-time/algorithm.ts` — final, tested
- `src/lib/court-time/algorithm.test.ts` — all passing

**Fresh-context brief for a cold agent starting Phase 1**:

You are implementing a basketball court time rotation algorithm for the Bendigo Phoenix website (Astro, TypeScript). No UI work in this phase — pure TypeScript only. The tool distributes 40 minutes of court time across 7–9 players keeping exactly 5 on court at all times across 2 × 20 minute halves. Total player-minutes must equal 200. Max 1-minute variance between any two players.

Files to create:
- `src/lib/court-time/types.ts` (data structures)
- `src/lib/court-time/algorithm.ts` (pure TS function, no DOM)
- `src/lib/court-time/algorithm.test.ts` (unit tests)

Key rules from spec: whole-minute substitutions only, no two subs at same minute, no sub at minute 0 or 20, coach selects first-half starting five, algorithm determines second-half starters by picking 5 players with most court time remaining. See plan.md section 3 for the full algorithm design.

The test runner is Vitest (or Node's native test runner if Vitest is not installed — check `package.json`). Run tests with `npm test` or `npx vitest run`.

---

### Phase 2 — UI Scaffolding (Astro Page, Form, Starting Five, Session Notice)

**Goal**: Build the page shell and all input UI. The page renders the complete input flow (session notice → roster form → starting five selector → generate button) using vanilla TypeScript state management. No plan generation output yet — clicking "Generate Plan" at this stage can log to console.

**Inputs required before starting**:
- Phase 1 complete: `src/lib/court-time/types.ts` exists
- `src/pages/coaching-resources.astro` (to understand ResourceCard usage)
- `src/layouts/BaseLayout.astro`
- `src/styles/global.css` (brand colour reference)

**Tasks**:

1. Create `src/pages/court-time-calculator.astro` — wrap in `BaseLayout` with title "Court Time Calculator" and appropriate description.
2. Add hero section matching the style of `coaching-resources.astro` (brand-purple background, gold accent, page title).
3. Add session data notice (FR-034) — a visually prominent banner above the form explaining data is not saved if the page is closed. Style with a `bg-brand-gold/10 border border-brand-gold` pattern.
4. Implement the roster entry form:
   - Dynamic player name inputs: start with 7 inputs, add/remove buttons to go from 7 to 9 (or render all 9 with the extra two hidden, showing/hiding via JS)
   - Each input has a visible `<label>` (NFR-002), e.g. "Player 1", "Player 2"
   - Inputs have `aria-describedby` pointing to an error span below each field (NFR-004)
   - Minimum tap target 44px height (NFR-006)
   - "Add Player" button (disabled at 9 players), "Remove Player" button (disabled at 7 players)
5. Implement client-side form validation (triggered on submit):
   - Reject if fewer than 7 or more than 9 names
   - Reject if any name is blank or whitespace-only
   - Display inline error messages per field and a summary message
   - Use `aria-invalid` and `aria-describedby` on errored inputs
6. Implement the starting five selection step:
   - After valid roster entry, transition the UI to show all players as checkboxes/toggle buttons
   - Allow selecting exactly 5; disable further selection once 5 are chosen (FR-017)
   - Show count indicator: "3 of 5 selected"
   - "Generate Plan" button is disabled until exactly 5 are selected
   - "Back" link to return to roster editing
7. Implement app state machine in the `<script>` block:
   - States: `roster-entry` | `starter-selection` | `plan-display`
   - Each state shows/hides the correct section using CSS class toggling (`hidden`)
   - No page navigation — all state transitions happen in-DOM
8. Add `src/lib/court-time/` import to page script: `import type { Player } from '../lib/court-time/types'` (types only at this stage).
9. Add "Court Time Calculator" entry to `src/pages/coaching-resources.astro`:
   - Add a new resource object to the `resources` array with `type: 'link'`, url pointing to `/court-time-calculator`, category: `'Tools'`, ageGroup: `'All Ages'`
   - Update the `categories` array to include `'Tools'` if not present
10. Verify the page renders at `localhost:4321/court-time-calculator` with correct Navbar and Footer.
11. Verify the Coaching Resources page shows the new card.
12. Verify the roster form is fully usable at 375px viewport width without horizontal overflow.

**Outputs produced**:
- `src/pages/court-time-calculator.astro` — page shell + full input UI, functional state machine, no plan output yet
- `src/pages/coaching-resources.astro` — updated with Court Time Calculator entry

**Fresh-context brief for a cold agent starting Phase 2**:

You are building the Astro page and input UI for the Court Time Calculator (COA-19) on the Bendigo Phoenix basketball website. No plan generation or Gantt chart in this phase — just the page and input forms.

Existing files you need to read:
- `src/layouts/BaseLayout.astro` — wrap your page in this
- `src/pages/coaching-resources.astro` — pattern reference and you need to add a card here
- `src/styles/global.css` — brand colours as Tailwind v4 `@theme` variables
- `src/lib/court-time/types.ts` — import `Player` type (created in Phase 1)

Create `src/pages/court-time-calculator.astro`. The page has three UI states managed by vanilla TypeScript DOM manipulation (no framework): `roster-entry`, `starter-selection`, `plan-display`. Phase 2 only implements the first two states. Use `hidden` CSS class toggling to show/hide sections.

The project uses Tailwind v4 via `@tailwindcss/vite` — brand classes are `bg-brand-purple`, `text-brand-gold`, `bg-brand-offwhite`. Do not edit `tailwind.config.mjs`.

Key requirements: session data notice always visible, all inputs have visible labels, minimum 44px touch targets, inline validation errors with `aria-describedby` associations, starting five selection prevents 6th checkbox being selected.

---

### Phase 3 — Gantt Chart Rendering

**Goal**: Wire the algorithm output to the DOM and render the Gantt chart. After this phase, the full generate-and-display flow works end-to-end. The PDF export button is present but disabled.

**Inputs required before starting**:
- Phase 1 complete: `src/lib/court-time/algorithm.ts` and `types.ts`
- Phase 2 complete: `src/pages/court-time-calculator.astro` with `plan-display` state section stub

**Tasks**:

1. In `court-time-calculator.astro` script, import `generateRotationPlan` and `derivePlayerSchedules` from `../lib/court-time/algorithm`.
2. Wire the "Generate Plan" button click handler to call `generateRotationPlan(players, startingFive)` and `derivePlayerSchedules(plan)`, store result in module-level state variables `currentPlan` and `currentSchedules`.
3. Transition app state to `plan-display` after generation.
4. Implement the `renderGantt(schedules: PlayerSchedule[])` function:
   - Container: `<div class="overflow-x-auto">` wrapping an inner div with `style="min-width: 600px"`
   - Time axis header: 41 tick marks at 0–40 with labels at 0, 5, 10, 15, 20, 25, 30, 35, 40
   - Half-time marker: a vertical line or gold divider at the 20-minute position (50% of the axis width)
   - Per-player row: player name label (left, fixed width ~120px, truncated with ellipsis at 30 chars per spec), followed by a `relative` timeline bar container
   - Within each row's timeline, render `<div>` segments for each `Stint`:
     - Width: `(stint.durationMinutes / 40) * 100%` as inline style
     - Left offset: `(stint.startMinute / 40) * 100%` as inline style
     - On-court stints: `bg-brand-purple` with white text (or no text for narrow bars)
     - Bench stints: `bg-brand-offwhite border border-gray-200`
     - Minimum visible width: add `min-width: 8px` via inline style so 1-minute stints are visible
     - Position: `absolute` within a `relative` full-width row container
5. Add accessible text summary below the chart (NFR-005): a `<details><summary>Court time summary</summary>` element listing each player's name and total court time in minutes as a plain text list.
6. Add "Start Over" button in the plan-display state (FR-033): clears `currentPlan` and `currentSchedules`, resets all form fields, transitions back to `roster-entry` state.
7. Add "Export PDF" button — present but `disabled` and visually muted until Phase 4 wires it. Use `aria-label="Export substitution sheet as PDF"` and ensure it is clearly labelled as disabled state (NFR-003).
8. Verify correctness: generate a plan for 7, 8, and 9 players, inspect the Gantt bars and confirm they visually match expected court time distributions.
9. Verify mobile Gantt: at 375px viewport, confirm horizontal scroll works and player name labels are visible.
10. Verify the half-time marker is visually clear.

**Outputs produced**:
- `src/pages/court-time-calculator.astro` — updated with working Gantt render, Start Over, disabled Export PDF button
- Full generate → display flow working end-to-end

**Fresh-context brief for a cold agent starting Phase 3**:

You are implementing the Gantt chart rendering for the Court Time Calculator (COA-19). The algorithm (Phase 1) and page scaffold (Phase 2) are already complete.

Existing files you need to read:
- `src/pages/court-time-calculator.astro` — add Gantt rendering to the existing `plan-display` state section and `<script>` block
- `src/lib/court-time/algorithm.ts` — import `generateRotationPlan` and `derivePlayerSchedules`
- `src/lib/court-time/types.ts` — `PlayerSchedule`, `Stint` types

The Gantt chart is CSS div-based, not SVG. Each player row is a `relative`-positioned div with `absolute`-positioned child divs for each stint. Width and left position are percentage-based on a 40-minute full game clock. The outer container uses `overflow-x: auto` with an inner `min-width: 600px` div. On-court stints use `bg-brand-purple`; bench stints use `bg-brand-offwhite border border-gray-200`. Minimum visible bar width is 8px.

The half-time marker sits at 50% of the chart width and must be visually distinct (gold vertical line: `bg-brand-gold w-0.5 absolute top-0 bottom-0`).

After rendering, add an accessible `<details>` text summary listing each player's court time totals (NFR-005). Add a "Start Over" button that resets state. Add an Export PDF button (disabled — Phase 4 will activate it).

---

### Phase 4 — PDF Export

**Goal**: Implement the client-side PDF generation and download. After this phase, "Export PDF" produces a downloadable substitution sheet compatible with iOS Safari and Android Chrome.

**Inputs required before starting**:
- Phase 3 complete: `currentPlan` is available in script scope, Export PDF button exists in DOM

**Tasks**:

1. Install jsPDF: `npm install jspdf`. Confirm `package.json` is updated.
2. In `court-time-calculator.astro` script, implement `exportPdf(plan: RotationPlan)` as an async function using a dynamic import:
   ```typescript
   async function exportPdf(plan: RotationPlan) {
     const { jsPDF } = await import('jspdf');
     // ... build document
   }
   ```
3. Build the PDF document:
   - Page size: A4 portrait
   - Margins: 20mm on all sides
   - Header: "Bendigo Phoenix — Court Time Calculator" in bold, date and roster size below
   - Section heading: "First Half Substitutions" / "Second Half Substitutions"
   - For each `SubstitutionEvent` in chronological order:
     - Game clock time (e.g. "Minute 8")
     - Players coming on: listed by name with "IN:" prefix
     - Players sitting down: listed by name with "OUT:" prefix
     - A thin separator line between events
   - Footer: "Generated by Bendigo Phoenix Coach Toolkit — session data not saved"
   - Ensure no text overflows page bounds (use `doc.splitTextToSize()` for long names)
4. Implement iOS-safe download:
   ```typescript
   const isIos = /iP(ad|hone|od)/i.test(navigator.userAgent);
   if (isIos) {
     window.open(doc.output('bloburl'), '_blank');
   } else {
     doc.save('court-time-calculator.pdf');
   }
   ```
5. Enable the Export PDF button: remove the `disabled` attribute in the `renderGantt` function after plan generation (or in the state transition to `plan-display`).
6. Add error handling: wrap the export in try/catch; on failure display a visible error message near the button (do not fail silently — per spec quality note).
7. Verify PDF on desktop: open in Chrome, check layout, margins, text clipping.
8. Verify PDF content: for an 8-player roster, confirm the PDF lists the correct substitution events with times matching the Gantt chart.
9. Verify the Export PDF button is absent/disabled before plan generation (FR-028 / acceptance criterion 8).
10. Verify long player names (30-char names) do not overflow PDF content area.

**Outputs produced**:
- `src/pages/court-time-calculator.astro` — PDF export fully wired
- `package.json` and `package-lock.json` — jsPDF added
- Working PDF export on desktop Chrome

**Fresh-context brief for a cold agent starting Phase 4**:

You are implementing PDF export for the Court Time Calculator (COA-19). All previous phases are complete — the page generates rotation plans and displays a Gantt chart. You need to wire the "Export PDF" button.

File to edit: `src/pages/court-time-calculator.astro` — find the `exportPdf` stub or the disabled Export PDF button handler in the `<script>` block.

Install jsPDF: `npm install jspdf`. Use a dynamic import so it doesn't block page load:
```typescript
const { jsPDF } = await import('jspdf');
```

The PDF is a simple text document: A4 portrait, 20mm margins. It lists substitution events from `currentPlan.halves[0].substitutions` and `currentPlan.halves[1].substitutions`. Each event shows the game clock minute, players coming on (IN:), and players sitting down (OUT:). Half 2 minutes are half-relative (1–19), not absolute — display them as "Minute X of Second Half".

iOS Safari does not support `a.download` on blob URLs. Use `window.open(doc.output('bloburl'))` on iOS. Detect iOS with `/iP(ad|hone|od)/i.test(navigator.userAgent)`.

The Export PDF button must be disabled before a plan is generated and enabled after. Wrap export in try/catch and show a visible error message on failure.

Data type reference: `src/lib/court-time/types.ts`. The `currentPlan` variable is in scope in the page's script block.

---

### Phase 5 — Integration, Polish, and Final Verification

**Goal**: End-to-end verification of all acceptance criteria, accessibility pass, mobile testing, and any outstanding polish. No new features — only fixes, improvements, and the Coaching Resources entry if not already done in Phase 2.

**Inputs required before starting**:
- Phases 1–4 complete: full working tool

**Tasks**:

1. Verify all acceptance criteria from the spec against the live tool:
   - AC-1: 375px viewport, form visible, session notice present
   - AC-2: 7-player plan, court times 28 or 29, sum 200
   - AC-3: 8-player plan, all exactly 25
   - AC-4: 9-player plan, court times 22 or 23, sum 200
   - AC-5: Half-time marker visible, on-court/bench visually distinct
   - AC-6: Narrow viewport Gantt scrolls horizontally
   - AC-7: PDF downloads with correct content
   - AC-8: Export PDF disabled before plan generation
   - AC-9: 6 or fewer names → validation error, no plan
   - AC-10: 10+ names → validation error
   - AC-11: Blank names → per-field validation
   - AC-12: Start Over clears form and Gantt
   - AC-13: Coaching Resources card present and links correctly
   - AC-14: Navbar and Footer present on tool page
   - AC-15: Deterministic output (generate same roster twice)
   - AC-16: No two events at same minute, no event at 0 or 20
   - AC-19: Starting five selection presented, exactly 5 required
   - AC-20: Gantt shows selected 5 starting on court at minute 0
2. Accessibility pass:
   - Keyboard navigation through all interactive elements
   - Focus indicators visible on all buttons and inputs
   - Screen reader labels: check all `aria-label`, `aria-describedby`, `aria-invalid` attributes are correct
   - Gantt `<details>` text summary readable
   - Error messages associated with inputs via `aria-describedby`
3. Contrast check: on-court bar (`bg-brand-purple`) text contrast meets WCAG AA. If text appears on bars, ensure white text on purple is used.
4. Mobile tap target audit: measure all buttons — ensure ≥ 44 × 44px.
5. Long name edge case: enter 8 players with 30-character names, verify Gantt labels truncate with ellipsis and PDF does not overflow.
6. Performance: generate plan and observe time to Gantt render — should be well under 1 second. PDF generation should complete under 3 seconds.
7. Confirm `src/pages/coaching-resources.astro` has the Court Time Calculator card with `type: 'link'` (not PDF), category `'Tools'`, and url `/court-time-calculator`. If not done in Phase 2, do it now.
8. Confirm `categories` array in `coaching-resources.astro` includes `'Tools'` so the filter button renders.
9. Final build check: run `npm run build` and confirm no TypeScript errors or build failures.
10. Review all player name data handling: confirm no names are logged to console, sent in network requests, or written to localStorage/sessionStorage. Open DevTools Network tab and verify no requests during plan generation or PDF export.

**Outputs produced**:
- All acceptance criteria verified
- `npm run build` passes with zero errors
- Tool is production-ready

**Fresh-context brief for a cold agent starting Phase 5**:

You are doing final integration verification and polish for the Court Time Calculator (COA-19). All four prior phases are complete: algorithm, page UI, Gantt chart, and PDF export. Your job is verification and fixes only — no new features.

Run the dev server: `npm run dev`. Navigate to `http://localhost:4321/court-time-calculator`.

Work through the acceptance criteria checklist in plan.md section 4, Phase 5, Task 1. For each AC that fails, fix the issue in `src/pages/court-time-calculator.astro` or `src/lib/court-time/algorithm.ts`.

Run `npm run build` at the end and confirm zero errors.

Key files:
- `src/pages/court-time-calculator.astro`
- `src/lib/court-time/algorithm.ts`
- `src/lib/court-time/types.ts`
- `src/pages/coaching-resources.astro`

---

## 5. File Structure

New files created by this feature:

```
src/
├── lib/
│   └── court-time/
│       ├── types.ts                  # Shared TypeScript types (Player, RotationPlan, etc.)
│       ├── algorithm.ts              # Pure rotation algorithm, no DOM dependencies
│       └── algorithm.test.ts         # Unit tests for algorithm
└── pages/
    └── court-time-calculator.astro   # New interactive page

specs/
└── coa-19-court-time-calculator/
    ├── spec.md                       # (existing)
    └── plan.md                       # (this file)
```

Modified files:

```
src/
└── pages/
    └── coaching-resources.astro      # Add Court Time Calculator card entry
```

No new components are created. The tool is self-contained within the Astro page and the `src/lib/court-time/` module. No changes to `BaseLayout.astro`, `global.css`, or any existing component.

---

## 6. Testing Strategy

### Algorithm Tests (Phase 1)

Unit tests in `src/lib/court-time/algorithm.test.ts`. Run with whatever test runner is available (check `package.json` — if no test framework is installed, add Vitest as a dev dependency: `npm install -D vitest`).

Required test cases:

| Test | Assertion |
|---|---|
| 7-player court times | All players have 28 or 29 min; sum = 200; max diff = 1 |
| 8-player court times | All players have exactly 25 min |
| 9-player court times | All players have 22 or 23 min; sum = 200; max diff = 1 |
| Starting five honoured | First 5 active at minute 0 of half 1 match coach selection |
| Second-half starters | 5 players with most remaining target start half 2 |
| Determinism | `generateRotationPlan(p, s)` called twice returns identical JSON |
| No same-minute subs | All substitution event minutes are unique within each half |
| No boundary subs | No event at game clock minute 0 or 20 (absolute) |
| Total player-minutes | Sum of all stint durations = 200 |
| Half totals | Sum of player-minutes per half = 100 |
| Stint continuity | No player has a gap or overlap in their timeline |
| 5-on-court invariant | At every minute 0–39, exactly 5 players are active |

### UI Verification (Phases 2–4)

Manual verification against acceptance criteria (listed in Phase 5 tasks). No automated browser tests in scope for this feature.

### Build Verification (Phase 5)

`npm run build` must complete with zero TypeScript errors and zero Astro build warnings. This is the final gate before the feature is considered complete.

---

## 7. Dependencies

### New Runtime Dependency

| Package | Version | Purpose | Install |
|---|---|---|---|
| `jspdf` | `^2.5.1` | Client-side PDF generation | `npm install jspdf` |

### New Dev Dependency (if not already present)

| Package | Version | Purpose | Install |
|---|---|---|---|
| `vitest` | `^3.x` | Algorithm unit tests | `npm install -D vitest` |

No other new dependencies are required. The Gantt chart uses only CSS/Tailwind (no charting library). The algorithm uses only plain TypeScript (no utility libraries).

### Note on jsPDF Bundle Size

jsPDF is ~270 KB gzipped. This is loaded **dynamically** (via `import('jspdf')` inside the export handler) so it does not affect initial page load time. The cost is paid only when the coach taps "Export PDF", at which point the 3-second budget (NFR-014) is sufficient for the dynamic fetch + document generation + download initiation.
