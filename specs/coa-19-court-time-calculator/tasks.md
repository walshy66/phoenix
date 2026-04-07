# Tasks: COA-19 — Court Time Calculator

**Input**: `specs/coa-19-court-time-calculator/spec.md` + `specs/coa-19-court-time-calculator/plan.md`
**Strategy**: Option C — Execution Windows (5 windows, one per plan phase)
**Windows**: 5 total

---

## Format Guide

- **[P]**: Can run in parallel (different files, same window)
- **Window N**: One fresh agent context — do not carry conversation state between windows
- **WINDOW_CHECKPOINT**: Validation gate that must pass before the next window starts
- **Traceability**: Every task maps back to a Functional Requirement (FR-XXX) or Acceptance Criterion (AC-N)
- **Dependency**: Prior work that must exist before this task can begin

---

## Execution Window 1: Algorithm (Pure TypeScript, No DOM)

**Goal**: Implement and fully verify the rotation algorithm as an isolated TypeScript module. No UI, no Astro, no DOM.

### Fresh-Context Brief

You are implementing a basketball court time rotation algorithm for the Bendigo Phoenix website (Astro, TypeScript). No UI work in this phase — pure TypeScript only. The tool distributes 40 minutes of court time across 7–9 players keeping exactly 5 on court at all times across 2 × 20 minute halves. Total player-minutes must equal 200. Max 1-minute variance between any two players.

Files to create:
- `src/lib/court-time/types.ts` (data structures)
- `src/lib/court-time/algorithm.ts` (pure TS function, no DOM)
- `src/lib/court-time/algorithm.test.ts` (unit tests)

Key rules from spec: whole-minute substitutions only, no two subs at same minute, no sub at minute 0 or 20, coach selects first-half starting five, algorithm determines second-half starters by picking 5 players with most court time remaining. See `specs/coa-19-court-time-calculator/plan.md` section 3 for the full algorithm design.

The test runner is Vitest (or Node's native test runner if Vitest is not installed — check `package.json`). Run tests with `npm test` or `npx vitest run`. If Vitest is not present, install it: `npm install -D vitest`.

---

### Tasks

- [ ] **Task 1: Create types and algorithm module**

  **Traceability**: FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-016, FR-018, FR-019
  **Dependencies**: None

  Sub-steps:
  1. Create `src/lib/court-time/types.ts`. Define all types from the spec "Key Entities" section: `Player`, `Roster`, `RotationPlan`, `HalfPlan`, `SubstitutionEvent`, `PlayerSchedule`, `Stint`. Refer to the exact field names and field types in `spec.md`.
  2. Create `src/lib/court-time/algorithm.ts`. Implement the following exported functions — no DOM imports, no Astro utilities, no third-party libraries:
     - `computeCourtTargets(n: number, seed: string): number[]` — returns per-player minute targets (length n) summing to 200. `Math.floor(200 / n)` minutes base; `(200 % n)` players receive one extra minute. Which players receive the extra minute MUST be determined by a seeded random selection derived from `seed` (e.g. a simple deterministic shuffle using the seed string) so the same inputs always produce the same targets (FR-015). Do not use roster entry order to assign the extra minute.
     - `scheduleHalf(players: Player[], startingFive: Player[], targets: number[], halfNumber: 1 | 2): HalfPlan` — produces a valid HalfPlan following the 6-step greedy approach in plan.md section 3.3.
     - `selectSecondHalfStarters(players: Player[], half1Plan: HalfPlan, targets: number[]): Player[]` — returns the 5 players with highest remaining target after half 1; ties broken by roster entry order.
     - `derivePlayerSchedules(plan: RotationPlan): PlayerSchedule[]` — walks each player's timeline minute-by-minute across both halves (absolute 0–40 clock) and emits contiguous `Stint` blocks.
     - `generateRotationPlan(players: Player[], startingFive: Player[]): RotationPlan` — top-level entry point; orchestrates all helper functions and returns a complete `RotationPlan`. The `seed` passed to `computeCourtTargets` MUST be derived deterministically from the inputs (e.g. `players.map(p => p.name).join(',')`) so FR-015 is satisfied.
  3. Validate internally at the end of `generateRotationPlan`: assert `totalPlayerMinutes === 200`, exactly 5 players active per minute, no same-minute substitution events, no events at absolute minutes 0 or 20. Throw a descriptive `Error` if any assertion fails.

- [ ] **Task 2: Write and pass algorithm unit tests**

  **Traceability**: FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-018, FR-019; AC-2, AC-3, AC-4, AC-15, AC-16
  **Dependencies**: Task 1 complete (algorithm functions exported)

  Sub-steps:
  1. Create `src/lib/court-time/algorithm.test.ts`. Write the following test cases (using Vitest `test`/`expect`):

     | Test name | Assertion |
     |---|---|
     | 7-player court times | All players have 28 or 29 min; sum = 200; max diff ≤ 1 |
     | 8-player court times | All players have exactly 25 min |
     | 9-player court times | All players have 22 or 23 min; sum = 200; max diff ≤ 1 |
     | Starting five honoured | Minute-0 active players in half 1 match coach selection exactly |
     | Second-half starters | 5 players with most remaining target start half 2 |
     | Determinism | `generateRotationPlan(p, s)` called twice with the same inputs returns identical JSON — including which players received the extra minute in 7/9-player cases |
     | No same-minute subs | All `gameClockMinute` values unique within each half |
     | No boundary subs | No event at absolute minute 0 or 20 in either half |
     | Total player-minutes | Sum of all stint `durationMinutes` = 200 |
     | Half totals | Sum of player-minutes per half = 100 |
     | Stint continuity | No player has a gap or overlap in their 0–40 timeline |
     | 5-on-court invariant | At every minute 0–39, exactly 5 players have an active on-court stint |

  2. Run `npx vitest run` (or `npm test`). Fix algorithm bugs until all 12 test cases pass with zero failures.
  3. Confirm the output of `npx vitest run` shows all tests green before marking this task done.

- [ ] **Task 3: Verify test runner is configured and CI-safe**

  **Traceability**: FR-015 (determinism verifiable via tests)
  **Dependencies**: Task 2 passing

  Sub-steps:
  1. Check `package.json` for a `"test"` script. If absent, add: `"test": "vitest run"`.
  2. If Vitest was not already present, confirm it is listed under `devDependencies` in `package.json`.
  3. Run `npm test` from the project root and confirm it exits with code 0 and prints a passing summary.
  4. Run `npm run build` and confirm no TypeScript errors are introduced by the new files (Astro may not pick up the lib files in its compilation, but there must be no errors under `src/lib/court-time/`).

---

### Done When (Window 1 Checkpoint)

- [ ] `src/lib/court-time/types.ts` exists and exports all 7 types
- [ ] `src/lib/court-time/algorithm.ts` exists and exports `generateRotationPlan`, `derivePlayerSchedules`, and all helpers
- [ ] `src/lib/court-time/algorithm.test.ts` exists with all 12 test cases
- [ ] `npm test` exits with code 0 — all 12 tests pass
- [ ] `npm run build` exits with zero TypeScript errors
- [ ] No DOM imports or framework imports anywhere in `src/lib/court-time/`

**Do not start Window 2 until all six checkboxes above are checked.**

---

## Execution Window 2: UI Scaffolding (Astro Page, Form, Starting Five, Session Notice)

**Goal**: Build the page shell and all input UI. The page renders the complete input flow (session notice → roster form → starting five selector → generate button) using vanilla TypeScript state management. No plan generation output yet — clicking "Generate Plan" at this stage can log to console.

**Requires**: Window 1 complete (`src/lib/court-time/types.ts` exists for the `Player` import)

### Fresh-Context Brief

You are building the Astro page and input UI for the Court Time Calculator (COA-19) on the Bendigo Phoenix basketball website. No plan generation or Gantt chart in this phase — just the page and input forms.

Existing files you need to read:
- `src/layouts/BaseLayout.astro` — wrap your page in this
- `src/pages/coaching-resources.astro` — pattern reference and you need to add a card here
- `src/styles/global.css` — brand colours as Tailwind v4 `@theme` variables
- `src/lib/court-time/types.ts` — import `Player` type (created in Window 1)

Create `src/pages/court-time-calculator.astro`. The page has three UI states managed by vanilla TypeScript DOM manipulation (no framework): `roster-entry`, `starter-selection`, `plan-display`. Window 2 only implements the first two states. Use `hidden` CSS class toggling to show/hide sections.

The project uses Tailwind v4 via `@tailwindcss/vite` — brand classes are `bg-brand-purple`, `text-brand-gold`, `bg-brand-offwhite`. Do not edit `tailwind.config.mjs`.

Key requirements: session data notice always visible, all inputs have visible labels, minimum 44px touch targets, inline validation errors with `aria-describedby` associations, starting five selection prevents a 6th checkbox being selected.

---

### Tasks

- [ ] **Task 4: Create the Astro page with hero, session notice, and roster form**

  **Traceability**: FR-001, FR-002, FR-003, FR-003a, FR-004, FR-032, FR-034; AC-1, AC-9, AC-10, AC-11, AC-14; NFR-001, NFR-002, NFR-004, NFR-006, NFR-007, NFR-009
  **Dependencies**: Window 1 complete; `src/lib/court-time/types.ts` exists

  Sub-steps:
  1. Create `src/pages/court-time-calculator.astro`. Wrap content in `BaseLayout` with `title="Court Time Calculator"` and a brief description meta value. This satisfies FR-032 and AC-14.
  2. Add a hero section matching the pattern in `src/pages/coaching-resources.astro`: `bg-brand-purple` background, gold accent, page title in white.
  3. Add the session data notice immediately above the roster form (FR-034, AC-1): a `div` styled with `bg-brand-gold/10 border border-brand-gold rounded p-4`. Text must clearly state data is not saved if the page is closed. This element is always visible — not toggled by state.
  4. Implement the roster entry form inside a `<section id="section-roster-entry">`:
     - Render 9 player name `<input>` elements. Start with 7 visible; the 8th and 9th begin with `class="hidden"`.
     - Each input has a corresponding `<label>` with text "Player N" (NFR-002). Labels must be visible, not placeholder-only.
     - Each input has `aria-describedby="error-player-N"` pointing to a sibling `<span id="error-player-N" role="alert" class="hidden text-red-600 text-sm">` (NFR-004).
     - All inputs and buttons must have `min-height: 44px` (NFR-006). Apply via Tailwind `h-11` or equivalent.
     - "Add Player" button: disabled when 9 players are visible. On click, reveals the next hidden input.
     - "Remove Player" button: disabled when 7 players are visible. On click, hides the last visible input and clears its value.
  5. Add client-side validation in the `<script>` block, triggered on form submit:
     - Count visible (non-hidden) inputs. If fewer than 7 or more than 9, show a summary error message and call `event.preventDefault()` (FR-002; AC-9, AC-10).
     - For each visible input, if the trimmed value is empty, mark it with `aria-invalid="true"` and reveal its error span (FR-003; AC-11).
     - Only proceed to the next state if all visible inputs have non-blank values.
     - Names longer than 30 characters are accepted without error. Truncation to 30 chars with ellipsis is handled at the display layer (Gantt labels, PDF) — not at input validation time (FR-003a).
  6. Implement the `render()` dispatch function and app state variable in the `<script>` block:
     - `type AppState = 'roster-entry' | 'starter-selection' | 'plan-display'`
     - `let appState: AppState = 'roster-entry'`
     - `render()` toggles the `hidden` class on each `<section>` based on `appState`.
  7. Confirm the page compiles by running `npm run dev` and navigating to `http://localhost:4321/court-time-calculator`.
  8. Verify at 375px viewport: form fully visible, no horizontal overflow, session notice visible, all labels shown (AC-1, NFR-007).

- [ ] **Task 5: Implement starting five selector state and coaching resources card** [P]

  **Traceability**: FR-016, FR-017, FR-017a, FR-031; AC-13, AC-19; NFR-003, NFR-006
  **Dependencies**: Task 4 complete (`appState` and `render()` exist in the script block)

  Sub-steps:
  1. Add `<section id="section-starter-selection" class="hidden">` to the page. This section contains:
     - A heading "Select Starting Five".
     - A count indicator: `<p id="starter-count">0 of 5 selected</p>`.
     - A list of toggle buttons or checkboxes — one per player — rendered from the current roster array. Use `<button type="button" aria-pressed="false">` or `<input type="checkbox">` elements, each with a visible label and `min-height: 44px` (NFR-006).
     - A "Generate Plan" `<button id="btn-generate">` that begins `disabled` (FR-016). It becomes enabled only when exactly 5 starters are selected.
     - A "Back" `<button id="btn-back-to-roster">` that transitions state back to `roster-entry` WITHOUT clearing the entered player names — inputs must still be populated when the coach returns (FR-017a).
  2. Implement selection logic in the `<script>` block:
     - Maintain a `Set<string>` of selected player IDs.
     - On each toggle: update the set, update `aria-pressed` (or `checked`), update the count indicator text, and enable/disable "Generate Plan".
     - When the set already contains 5 players, add `disabled` to all unselected toggles (FR-017; AC-19). Remove `disabled` if a selection is deselected.
  3. Populate the starter selection section when transitioning from `roster-entry` to `starter-selection`: read all visible input values, create `Player[]` with index-based IDs, store in module-level `let players: Player[] = []`, then `render()` the starter section with those player names.
  4. Clicking "Generate Plan" (when exactly 5 are selected) should currently just `console.log('generate', selectedIds)` — Gantt rendering is added in Window 3. Transition `appState` to `plan-display` and call `render()` so the (empty) plan section becomes visible.
  5. In `src/pages/coaching-resources.astro`, add the Court Time Calculator entry to the `resources` array:
     ```
     { type: 'link', title: 'Court Time Calculator', url: '/court-time-calculator', category: 'Tools', ageGroup: 'All Ages', description: 'Generate an even court time rotation for 7–9 players.' }
     ```
     Add `'Tools'` to the `categories` array if not already present (FR-031; AC-13).
  6. Verify the Coaching Resources page shows the new card and clicking it navigates to `/court-time-calculator` (AC-13).

---

### Done When (Window 2 Checkpoint)

- [ ] `src/pages/court-time-calculator.astro` exists and renders at `localhost:4321/court-time-calculator` with Navbar and Footer (AC-14)
- [ ] Session data notice is visible above the roster form on page load (FR-034, AC-1)
- [ ] Roster form validates correctly: rejects < 7, > 9, blank names with inline error messages (AC-9, AC-10, AC-11)
- [ ] Add/Remove Player buttons correctly show/hide inputs and respect the 7–9 bounds
- [ ] Starting five selector shows after valid roster submit, counts correctly, disables the 6th selection (FR-017, AC-19)
- [ ] Generate Plan button is disabled until exactly 5 starters selected (FR-016)
- [ ] Coaching Resources page shows the Court Time Calculator card (FR-031, AC-13)
- [ ] At 375px viewport, form has no horizontal overflow (NFR-007)

**Do not start Window 3 until all eight checkboxes above are checked.**

---

## Execution Window 3: Gantt Chart Rendering

**Goal**: Wire the algorithm output to the DOM and render the Gantt chart. After this phase, the full generate-and-display flow works end-to-end. The PDF export button is present but disabled.

**Requires**: Window 1 complete (algorithm), Window 2 complete (page scaffolding with `plan-display` state stub)

### Fresh-Context Brief

You are implementing the Gantt chart rendering for the Court Time Calculator (COA-19). The algorithm (Window 1) and page scaffold (Window 2) are already complete.

Existing files you need to read:
- `src/pages/court-time-calculator.astro` — add Gantt rendering to the existing `plan-display` state section and `<script>` block
- `src/lib/court-time/algorithm.ts` — import `generateRotationPlan` and `derivePlayerSchedules`
- `src/lib/court-time/types.ts` — `PlayerSchedule`, `Stint` types

The Gantt chart is CSS div-based, not SVG. Each player row is a `relative`-positioned div with `absolute`-positioned child divs for each stint. Width and left position are percentage-based on a 40-minute full game clock. The outer container uses `overflow-x: auto` with an inner `min-width: 600px` div. On-court stints use `bg-brand-purple`; bench stints use `bg-brand-offwhite border border-gray-200`. Minimum visible bar width is 8px.

The half-time marker sits at 50% of the chart width and must be visually distinct (gold vertical line: `bg-brand-gold w-0.5 absolute top-0 bottom-0`).

After rendering, add an accessible `<details>` text summary listing each player's court time totals (NFR-005). Add a "Start Over" button that resets state. Add an Export PDF button (disabled — Window 4 will activate it).

---

### Tasks

- [ ] **Task 6: Wire algorithm to Generate Plan button and implement renderGantt()**

  **Traceability**: FR-006, FR-018, FR-020, FR-021, FR-022, FR-023, FR-024, FR-025; AC-2, AC-3, AC-4, AC-5, AC-6, AC-15, AC-20; NFR-005, NFR-009
  **Dependencies**: Window 1 and Window 2 complete

  Sub-steps:
  1. At the top of the `<script>` block, add: `import { generateRotationPlan, derivePlayerSchedules } from '../lib/court-time/algorithm';`. Also add `import type { RotationPlan, PlayerSchedule } from '../lib/court-time/types';`.
  2. Add module-level state variables: `let currentPlan: RotationPlan | null = null;` and `let currentSchedules: PlayerSchedule[] = [];`.
  3. Replace the `console.log('generate', ...)` stub in the Generate Plan click handler with:
     - Build `const startingFive: Player[]` from the 5 selected IDs.
     - Call `currentPlan = generateRotationPlan(players, startingFive)`.
     - Call `currentSchedules = derivePlayerSchedules(currentPlan)`.
     - Transition `appState = 'plan-display'` and call `render()`.
     - After `render()`, call `renderGantt(currentSchedules)`.
  4. Implement `function renderGantt(schedules: PlayerSchedule[]): void` in the script block:
     - Target the `<div id="gantt-container">` element inside `#section-plan-display`.
     - Build the following DOM structure via `innerHTML` (or manual `createElement`):
       ```
       <div class="overflow-x-auto">
         <div style="min-width:600px; position:relative;">
           <!-- Time axis: labels at 0,5,10,15,20,25,30,35,40 -->
           <!-- Half-time marker: absolute div at left:50%, bg-brand-gold, w-0.5, full height -->
           <!-- One row per player -->
         </div>
       </div>
       ```
     - Time axis: render tick labels at minutes 0, 5, 10, 15, 20, 25, 30, 35, 40 using percentage left offsets (`minute / 40 * 100`%).
     - Half-time marker: `position:absolute; left:50%; top:0; bottom:0; width:2px; background: var(--color-brand-gold)` (or `bg-brand-gold` Tailwind class). Must be visually clear (AC-5).
     - Per-player row: `display:flex; align-items:center`. Left label: fixed width 120px, `overflow:hidden; text-overflow:ellipsis; white-space:nowrap` (30-char truncation per spec edge cases). Right timeline: `position:relative; flex:1; height:32px`.
     - Per-stint div: `position:absolute; height:100%`. Width = `(stint.durationMinutes / 40 * 100)%`. Left = `(stint.startMinute / 40 * 100)%`. `min-width:8px`. On-court: `bg-brand-purple`. Bench: `bg-brand-offwhite border border-gray-300` (FR-022).
  5. Add a `<details id="gantt-summary" class="mt-4"><summary>Court time summary</summary></details>` element below the chart container in the `plan-display` section HTML. After calling `renderGantt`, populate its inner content with a `<ul>` listing each player's name and total on-court minutes (NFR-005).
  6. Manually test: generate a plan for 7, 8, and 9 players. Confirm bar widths match expected allocations visually. Confirm the half-time gold line is visible. Confirm the accessible summary `<details>` lists correct minute totals.
  7. At 375px viewport, confirm the chart scrolls horizontally and player name labels remain visible (AC-6, FR-025).

- [ ] **Task 7: Add Start Over button and disabled Export PDF button**

  **Traceability**: FR-026, FR-028, FR-033; AC-8, AC-12; NFR-003
  **Dependencies**: Task 6 complete (plan-display section rendering)

  Sub-steps:
  1. Inside `#section-plan-display`, add two buttons below the Gantt chart and summary:
     - `<button id="btn-start-over" type="button">Start Over</button>` — styled with brand colours, minimum 44px height (NFR-006).
     - `<button id="btn-export-pdf" type="button" disabled aria-label="Export substitution sheet as PDF">Export PDF</button>` — visually muted (`opacity-50 cursor-not-allowed`) to communicate the disabled state. The `aria-label` satisfies NFR-003 (AC-8).
  2. Implement the Start Over click handler in the `<script>` block (FR-033; AC-12):
     - Set `currentPlan = null` and `currentSchedules = []`.
     - Clear the Gantt container: `document.getElementById('gantt-container')!.innerHTML = ''`.
     - Clear the summary details.
     - Reset all player name inputs to empty strings.
     - Reset the starting five selection set to empty; re-disable the Generate Plan button.
     - Set `appState = 'roster-entry'` and call `render()`.
  3. Do not wire the Export PDF button click yet — that is Window 4. The button must exist in the DOM, be `disabled`, and show no action when clicked.
  4. Verify AC-8: before a plan is generated, the Export PDF button is disabled. After generation, it remains disabled (Window 4 enables it).
  5. Verify AC-12: clicking Start Over returns to the empty roster form with no Gantt data remaining.

---

### Done When (Window 3 Checkpoint)

- [ ] Clicking Generate Plan (with valid roster + 5 starters) produces a Gantt chart with one row per player (FR-020)
- [ ] Time axis spans 0–40 with labels at every 5-minute mark (FR-021)
- [ ] Half-time gold marker is visible at the 20-minute position (FR-023, AC-5)
- [ ] On-court stints are `bg-brand-purple`, bench stints are `bg-brand-offwhite` (FR-022, AC-5)
- [ ] All bars use percentage widths/offsets; 1-minute stints have `min-width:8px`
- [ ] Chart scrolls horizontally at 375px viewport without overflowing the page (FR-025, AC-6)
- [ ] Accessible `<details>` summary below chart lists player names and court time minutes (NFR-005)
- [ ] Start Over clears all state and returns to roster entry (FR-033, AC-12)
- [ ] Export PDF button is present, disabled, and has an `aria-label` (FR-028, AC-8, NFR-003)

**Do not start Window 4 until all nine checkboxes above are checked.**

---

## Execution Window 4: PDF Export

**Goal**: Implement the client-side PDF generation and download. After this phase, "Export PDF" produces a downloadable substitution sheet compatible with iOS Safari and Android Chrome.

**Requires**: Window 3 complete (`currentPlan` in scope, Export PDF button exists in DOM as disabled)

### Fresh-Context Brief

You are implementing PDF export for the Court Time Calculator (COA-19). All previous phases are complete — the page generates rotation plans and displays a Gantt chart. You need to wire the "Export PDF" button.

File to edit: `src/pages/court-time-calculator.astro` — find the disabled Export PDF button handler in the `<script>` block.

Install jsPDF: `npm install jspdf`. Use a dynamic import so it doesn't block page load:
```typescript
const { jsPDF } = await import('jspdf');
```

The PDF is a simple text document: A4 portrait, 20mm margins. It has two sections — one per half. Each section starts with the starting lineup (5 players on court at the beginning of that half), then lists substitution events chronologically.

**Critical — clock format**: `SubstitutionEvent.gameClockMinute` is half-relative elapsed (1–19). The PDF displays countdown time (time remaining in the half), not elapsed. Convert with `(20 - gameClockMinute)` formatted as `MM:00` — e.g. elapsed minute 5 → "15:00". This matches how a coach reads the game clock courtside. The format for each event line is: `"[MM:SS] — [Player A] IN, [Player B] OUT"`.

The second-half starting lineup is algorithm-determined — it must appear clearly in the PDF since the coach didn't choose it (FR-027).

iOS Safari does not support `a.download` on blob URLs. Use `window.open(doc.output('bloburl'))` on iOS. Detect iOS with `/iP(ad|hone|od)/i.test(navigator.userAgent)`.

The Export PDF button must be disabled before a plan is generated and enabled after. Wrap export in try/catch and show a visible error message on failure.

Data type reference: `src/lib/court-time/types.ts`. The `currentPlan` variable is in scope in the page's script block.

---

### Tasks

- [ ] **Task 8: Install jsPDF and implement exportPdf()**

  **Traceability**: FR-026, FR-027, FR-027a, FR-029, FR-030; AC-7, AC-17; NFR-010, NFR-011, NFR-012, NFR-014
  **Dependencies**: Window 3 complete; `currentPlan` variable exists in scope

  Sub-steps:
  1. Run `npm install jspdf` from the project root. Confirm `jspdf` appears in `dependencies` in `package.json`.
  2. In the `<script>` block of `court-time-calculator.astro`, implement `async function exportPdf(plan: RotationPlan): Promise<void>`. Use a dynamic import to avoid blocking initial page load (NFR-014):
     ```typescript
     const { jsPDF } = await import('jspdf');
     ```
  3. Build the PDF document (FR-027, FR-027a, NFR-011):
     - `const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })`
     - Margins: 20mm on all sides. Working width = 170mm.
     - Header (bold): "Bendigo Phoenix — Court Time Calculator"
     - Subheader: current date + roster size (e.g. "7 Apr 2026 — 8 players")
     - **First Half section**:
       - Section heading: "First Half" (bold)
       - Starting lineup block: "Starting: [Player A], [Player B], [Player C], [Player D], [Player E]" — the 5 players from `plan.halves[0].startingFive`
       - For each `SubstitutionEvent` in `plan.halves[0].substitutions` ordered by `gameClockMinute`:
         - Convert to countdown: `const remaining = 20 - event.gameClockMinute; const display = String(remaining).padStart(2,'0') + ':00'`
         - Line: `"{display} — {playersComingOn names} IN, {playersSittingDown names} OUT"`
         - Thin separator line (`doc.line(...)`) between events
     - **Second Half section**:
       - Section heading: "Second Half" (bold)
       - Starting lineup block: "Starting: [players]" — from `plan.halves[1].startingFive`. Label this clearly as algorithm-determined (e.g. add "(auto)" or a note like "Algorithm selected")
       - Same substitution event format as first half, using countdown from 20 min
     - Footer on last page: "Generated by Bendigo Phoenix Coach Toolkit — session data not saved"
     - Use `doc.splitTextToSize(text, 170)` on all player name lines to prevent overflow for 30-character names (FR-003a, NFR-011).
  4. Implement iOS-safe download (FR-030, AC-17; NFR-010):
     ```typescript
     const isIos = /iP(ad|hone|od)/i.test(navigator.userAgent);
     if (isIos) {
       window.open(doc.output('bloburl'), '_blank');
     } else {
       doc.save('court-time-calculator.pdf');
     }
     ```
  5. Wrap the entire function body in `try { ... } catch (err) { ... }`. On error: reveal a `<p id="pdf-error" class="hidden text-red-600">` element adjacent to the Export PDF button with text "PDF export failed. Please try again." Do not fail silently (spec quality notes).

- [ ] **Task 9: Enable Export PDF button and verify end-to-end**

  **Traceability**: FR-028; AC-7, AC-8; NFR-003, NFR-013, NFR-014, NFR-015
  **Dependencies**: Task 8 complete (`exportPdf()` implemented)

  Sub-steps:
  1. In the `renderGantt()` function (or immediately after it is called in the Generate Plan handler), enable the Export PDF button by removing the `disabled` attribute and removing the muted styling:
     ```typescript
     const btnExport = document.getElementById('btn-export-pdf') as HTMLButtonElement;
     btnExport.disabled = false;
     btnExport.classList.remove('opacity-50', 'cursor-not-allowed');
     ```
  2. Wire the Export PDF button click handler:
     ```typescript
     btnExport.addEventListener('click', () => {
       if (currentPlan) exportPdf(currentPlan);
     });
     ```
  3. In the Start Over handler (added in Task 7), re-disable the Export PDF button and restore muted styling so the disabled state resets correctly (AC-8, FR-028).
  4. Verify AC-8: before generation, button is disabled. After generation, button is enabled. After Start Over, button is disabled again.
  5. Verify AC-7: generate an 8-player plan, click Export PDF on desktop Chrome. Confirm:
     - PDF downloads/opens successfully
     - "First Half" and "Second Half" sections are present
     - Each section opens with a "Starting:" lineup of 5 players
     - Substitution event times are in countdown MM:00 format (e.g. a sub at elapsed minute 5 shows "15:00", not "Minute 5")
     - Each event line is formatted as "[MM:SS] — [Player] IN, [Player] OUT"
     - No text overflows the page margins
  6. Verify NFR-015 compliance: open DevTools Network tab, generate a plan, click Export PDF. Confirm zero outbound network requests are made during either action.
  7. Run `npm run build` and confirm no TypeScript errors.

---

### Done When (Window 4 Checkpoint)

- [ ] `jspdf` is listed in `package.json` dependencies
- [ ] Export PDF button is disabled before plan generation and enabled after (FR-028, AC-8)
- [ ] Export PDF button is re-disabled after Start Over
- [ ] PDF downloads on desktop Chrome with correct content: title, two half sections, chronological substitution events with game clock times, IN:/OUT: player names (FR-027, AC-7)
- [ ] iOS detection code present; `window.open(bloburl)` path exists for iOS (FR-030, AC-17)
- [ ] Export errors surface a visible message and do not fail silently
- [ ] No network requests occur during plan generation or PDF export (NFR-015)
- [ ] `npm run build` exits with zero errors

**Do not start Window 5 until all eight checkboxes above are checked.**

---

## Execution Window 5: Integration, Polish, and Final Verification

**Goal**: End-to-end verification of all acceptance criteria, accessibility pass, mobile testing, and build sign-off. No new features — only fixes, improvements, and any outstanding polish.

**Requires**: Windows 1–4 complete (full working tool)

### Fresh-Context Brief

You are doing final integration verification and polish for the Court Time Calculator (COA-19). All four prior phases are complete: algorithm, page UI, Gantt chart, and PDF export. Your job is verification and fixes only — no new features.

Run the dev server: `npm run dev`. Navigate to `http://localhost:4321/court-time-calculator`.

Work through the acceptance criteria checklist below. For each AC that fails, fix the issue in `src/pages/court-time-calculator.astro` or `src/lib/court-time/algorithm.ts`.

Run `npm run build` at the end and confirm zero errors.

Key files:
- `src/pages/court-time-calculator.astro`
- `src/lib/court-time/algorithm.ts`
- `src/lib/court-time/types.ts`
- `src/pages/coaching-resources.astro`

---

### Tasks

- [ ] **Task 10: Full acceptance criteria verification pass**

  **Traceability**: All acceptance criteria AC-1 through AC-21 (excluding deferred scope)
  **Dependencies**: Windows 1–4 complete

  Work through each AC below. Check it off when confirmed passing. If it fails, fix and re-test.

  | AC | Description | Pass? |
  |---|---|---|
  | AC-1 | 375px viewport: form visible, no horizontal scroll, session notice present, labels shown | |
  | AC-2 | 7-player plan: all times 28 or 29 min, sum = 200 | |
  | AC-3 | 8-player plan: all times exactly 25 min | |
  | AC-4 | 9-player plan: all times 22 or 23 min, sum = 200 | |
  | AC-5 | Half-time marker visible; on-court and bench visually distinct | |
  | AC-6 | Narrow viewport: Gantt scrolls horizontally, no overflow, names visible | |
  | AC-7 | Export PDF: downloads on Chrome, correct content with IN:/OUT: events per half | |
  | AC-8 | Export PDF disabled before plan generated; disabled again after Start Over | |
  | AC-9 | 6 or fewer names: form blocked, inline validation message shown | |
  | AC-10 | 10+ names: form blocked, inline validation message shown | |
  | AC-11 | Blank name field: field identified individually with validation message | |
  | AC-12 | Start Over: form emptied, Gantt removed, tool returns to roster-entry state | |
  | AC-13 | Coaching Resources card present, labelled as tool (not PDF), links to correct URL | |
  | AC-14 | Navbar and Footer present in all app states | |
  | AC-15 | Same roster + same starting five on two separate sessions → identical substitution schedules | |
  | AC-16 | No two substitution events at same minute; no event at absolute minute 0 or 20 | |
  | AC-17 | iOS detection code present; export uses `window.open(bloburl)` on iOS path | |
  | AC-18 | Screen reader: all inputs have announced labels, errors announced, Gantt text summary accessible | |
  | AC-19 | Starting five step shown after roster submit; exactly 5 required before Generate Plan enables | |
  | AC-20 | Gantt shows all 5 selected starters on-court from minute 0 with no bench stint before minute 1 | |
  | AC-21 | Second-half starting five is algorithm-determined (no coach input for second half) | |

- [ ] **Task 11: Accessibility and mobile polish audit**

  **Traceability**: NFR-001 through NFR-007; AC-18
  **Dependencies**: Task 10 complete (all ACs passing)

  Sub-steps:
  1. Keyboard navigation: tab through all interactive elements in all three app states (`roster-entry`, `starter-selection`, `plan-display`). Confirm every focusable element has a visible focus ring (NFR-001). Fix any element that loses focus indicator.
  2. Screen reader audit (using browser DevTools accessibility tree or VoiceOver/NVDA): confirm all player name inputs have associated `<label>` text announced on focus (NFR-002). Confirm `aria-describedby` error spans are announced when `aria-invalid="true"` is set (NFR-004). Confirm the Gantt `<details>` summary text is navigable and announces player court times (NFR-005; AC-18).
  3. Confirm all buttons have visible text or `aria-label` values that describe their action clearly (NFR-003). Check: Add Player, Remove Player, Generate Plan, Back, Start Over, Export PDF.
  4. Tap target audit: using browser DevTools device emulation at 375px, measure the height of every button and input. All must be at minimum 44px (NFR-006). Fix any shortfall with `min-h-[44px]` or `h-11`.
  5. WCAG AA contrast check: `bg-brand-purple` on-court bars — if any text is rendered on top of a purple bar, confirm white text is used. Bench bars use `bg-brand-offwhite` with no text — confirm background is sufficiently distinct from on-court bars.
  6. Long name edge case: enter 8 players with 30-character names (e.g. "Abcdefghijklmnopqrstuvwxyz1234"). Confirm Gantt row labels truncate with ellipsis and do not overflow their 120px container. Confirm PDF does not clip or overflow any name.

- [ ] **Task 12: Final build check and privacy confirmation**

  **Traceability**: FR-004, FR-015; NFR-015; SC-007
  **Dependencies**: Task 11 complete

  Sub-steps:
  1. Run `npm test`. Confirm all algorithm unit tests still pass (no regressions from Window 4 or 5 changes).
  2. Run `npm run build`. Confirm zero TypeScript errors and zero Astro build warnings. Fix any issues before proceeding.
  3. Privacy check — open browser DevTools Network tab. Perform the following actions and confirm zero outbound network requests are made by any of them:
     - Enter a roster with player names
     - Submit the roster and select starters
     - Click Generate Plan
     - Click Export PDF
     Player names must never appear in any network payload (FR-004, NFR-015, SC-007).
  4. Performance check: generate a plan for 9 players and time the Gantt render visually. It should complete well under 1 second (NFR-013). Note the result; no fix needed unless it is obviously degraded.
  5. Confirm `src/pages/coaching-resources.astro` has: `type: 'link'` (not `'pdf'`), `category: 'Tools'`, `url: '/court-time-calculator'`, and that `'Tools'` is in the `categories` array so the filter button renders (FR-031, AC-13).

---

### Done When (Window 5 Checkpoint — Feature Complete)

- [ ] All 21 acceptance criteria verified and passing (Task 10 table fully checked)
- [ ] All interactive elements have visible focus indicators (NFR-001)
- [ ] All inputs have announced labels; error messages announced by screen readers (NFR-002, NFR-004)
- [ ] All buttons have descriptive accessible names (NFR-003)
- [ ] All interactive controls are at least 44px tall (NFR-006)
- [ ] 30-character names truncate in Gantt and do not overflow PDF
- [ ] `npm test` exits code 0 — all algorithm tests pass
- [ ] `npm run build` exits with zero TypeScript errors and zero build warnings
- [ ] Zero network requests observed during roster entry, plan generation, or PDF export (NFR-015)
- [ ] Coaching Resources card is `type: 'link'`, category `'Tools'`, links to `/court-time-calculator`

**All checkboxes checked = feature complete and production-ready.**

---

## Summary

| Window | Goal | Key Outputs | Estimated Token Budget |
|---|---|---|---|
| 1 — Algorithm | Pure TS rotation algorithm + unit tests | `types.ts`, `algorithm.ts`, `algorithm.test.ts` | 70–90k |
| 2 — UI Scaffolding | Astro page, roster form, starter selection, session notice | `court-time-calculator.astro` (input states), updated `coaching-resources.astro` | 80–100k |
| 3 — Gantt Chart | Algorithm wired to DOM, Gantt rendered, Start Over, disabled Export PDF | `court-time-calculator.astro` (plan-display state) | 80–100k |
| 4 — PDF Export | jsPDF install, exportPdf(), iOS-safe download, error handling | `court-time-calculator.astro` (export handler), `package.json` | 60–80k |
| 5 — Integration | AC verification, a11y audit, build check, privacy check | All files verified; zero build errors | 50–70k |

**Execution dependency graph**:
```
Window 1 (Algorithm) — no dependencies, start immediately
  |
Window 2 (UI Scaffolding) — requires Window 1 (types.ts for Player import)
  |
Window 3 (Gantt) — requires Window 1 (algorithm) + Window 2 (page scaffolding)
  |
Window 4 (PDF Export) — requires Window 3 (currentPlan in scope, Export PDF button in DOM)
  |
Window 5 (Integration) — requires Windows 1–4 complete
```
