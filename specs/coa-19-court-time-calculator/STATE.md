# State: Feature COA-19 — Court Time Calculator

## Metadata
- Feature ID: COA-19
- Status: COMPLETE
- Current Window: 5
- Total Windows: 5
- Start Time: 2026-04-07
- Completion Time: 2026-04-07

---

## Completed Windows

### Window 1: Algorithm (Pure TypeScript, No DOM) COMPLETE

- Tasks: Task 1, Task 2, Task 3 — all DONE
- Checkpoint: PASS
- Test Results: 17/17 passing (npx vitest run)
- Build: npm run build — zero TypeScript errors
- Files Created:
  - `src/lib/court-time/types.ts` — exports Player, Roster, RotationPlan, HalfPlan, SubstitutionEvent, PlayerSchedule, Stint
  - `src/lib/court-time/algorithm.ts` — exports generateRotationPlan, derivePlayerSchedules, computeCourtTargets, selectSecondHalfStarters, scheduleHalf
  - `src/lib/court-time/algorithm.test.ts` — 17 test cases, all passing
- Timestamp: 2026-04-07

#### Key implementation notes for downstream windows:

**Algorithm design (for Window 3 agent to understand the output shape):**

- `generateRotationPlan(players, startingFive)` returns a `RotationPlan` with `roster`, `halves[2]`, `totalPlayerMinutes`
- `derivePlayerSchedules(plan)` returns `PlayerSchedule[]` — one per player, each with `stints[]`
- Each `Stint` has `type: 'on-court' | 'bench'`, `startMinute` (0–39 absolute), `endMinute` (1–40), `durationMinutes`
- Half 1 covers absolute minutes 0–19; Half 2 covers absolute minutes 20–39
- `SubstitutionEvent.gameClockMinute` is half-relative elapsed (1–19)
- All substitution events have unique minutes within each half; no event at minute 0 or 20

**Algorithm correctness verified:**
- 7-player: players get 28 or 29 min, sum=200
- 8-player: all players get exactly 25 min
- 9-player: players get 22 or 23 min, sum=200
- Deterministic: same inputs produce identical JSON
- 5 players on court at every minute 0-39
- No same-minute substitutions; no substitutions at boundary minutes

**Key bug fixed in Window 1:**
The original algorithm computed half-2 targets from PLANNED half-1 targets rather than ACTUAL half-1 court minutes. This caused systematic under/over allocation. Fix: half-2 targets are now `totalTarget[i] - actualHalf1Minutes[i]`. Also added a correction pass in `scheduleHalf` to fix any over-target starters left after the initial bench placement.

---

### Window 2: UI Scaffolding (Astro Page, Form, Starting Five, Session Notice) COMPLETE

- Tasks: Task 4, Task 5 — all DONE (Task 6 merged into Task 5 per tasks.md)
- Checkpoint: PASS
- Build: npm run build — zero TypeScript errors, 11 pages built including /court-time-calculator
- Tests: 17/17 still passing (algorithm tests unaffected)
- Files Created:
  - `src/pages/court-time-calculator.astro` — full page with hero, session notice, roster form, starter selection, plan-display stub
- Files Modified:
  - `src/pages/coaching-resources.astro` — added Court Time Calculator card, added 'Tools' to categories
- Timestamp: 2026-04-07

#### Key implementation notes for Window 3:

**Page structure:**
- Three `<section>` elements toggled by `appState`: `#section-roster-entry`, `#section-starter-selection`, `#section-plan-display`
- `render()` toggles the `hidden` class on each section based on `appState`
- Module-level state: `let appState: AppState`, `let players: Player[]`, `let selectedIds: Set<string>`

**Roster form:**
- 9 player rows (`#row-player-1` … `#row-player-9`); rows 1–7 visible by default, 8–9 hidden
- Each input: `id="input-player-N"`, `aria-describedby="error-player-N"`, class `player-input`
- Error spans: `id="error-player-N"`, `role="alert"`, hidden by default
- Add/Remove buttons: `#btn-add-player`, `#btn-remove-player`
- Form submit → validates → populates `players: Player[]` with index-based IDs (`p0`, `p1`, …) → transitions to `starter-selection`

**Starter selection:**
- `#starter-list` — populated by `populateStarterList()` on transition from roster-entry
- Each toggle: `<button class="starter-toggle" data-player-id="pN" aria-pressed="false">`
- Count indicator: `#starter-count`
- Generate Plan button: `#btn-generate` — disabled until exactly 5 selected
- Back button: `#btn-back-to-roster` — returns to roster-entry WITHOUT clearing inputs (FR-017a)
- When 5 selected, unselected buttons get `disabled` to prevent 6th selection

**Generate Plan button stub (Window 2 behaviour):**
- Currently: `console.log('generate', Array.from(selectedIds)); appState = 'plan-display'; render();`
- Window 3 must replace this with: build `startingFive` from `selectedIds`, call `generateRotationPlan`, call `derivePlayerSchedules`, then `renderGantt()`

**Plan display section:**
- `#section-plan-display` is present but empty (contains `#gantt-container` div)
- Window 3 adds Gantt rendering, accessible summary, Start Over button, disabled Export PDF button

---

## Current Window Tasks

Window 5: Integration, Polish, and Final Verification

- Task 10: Full acceptance criteria verification pass — DONE
- Task 11: Accessibility and mobile polish audit — DONE
- Task 12: Final build check and privacy confirmation — DONE

---

### Window 5: Integration, Polish, and Final Verification COMPLETE

- Tasks: Task 10, Task 11, Task 12 — all DONE
- Checkpoint: PASS
- Build: npm run build — zero TypeScript errors, zero build warnings, 11 pages built
- Tests: 17/17 passing (no regressions)
- Files Modified:
  - `src/pages/court-time-calculator.astro` — fixed truncateName maxLen (16→30 per FR-003a), added visible plan-generation error element + handler, added focus-visible ring styles to all interactive buttons and dynamically created starter toggle buttons, added aria-label to gantt-summary details element, added generate-error reset in Start Over handler
- Privacy: Zero network requests during roster entry, plan generation, or PDF export (NFR-015 confirmed by code analysis — no fetch/XHR, client-side only)
- Timestamp: 2026-04-07

#### Acceptance Criteria Summary (Window 5)

All 21 ACs verified:
- AC-1: PASS — session notice always visible outside toggled sections; form uses w-full, max-w-2xl, px-4; responsive at 375px
- AC-2: PASS — 7-player: 28 or 29 min each, sum=200 (unit tested)
- AC-3: PASS — 8-player: exactly 25 min each (unit tested)
- AC-4: PASS — 9-player: 22 or 23 min each, sum=200 (unit tested)
- AC-5: PASS — gold half-time marker at 50%; on-court bg-brand-purple, bench bg-brand-offwhite
- AC-6: PASS — overflow-x-auto + min-width:600px inner div
- AC-7: PASS — exportPdf() builds A4 doc with two half sections, countdown clock format, IN/OUT lines
- AC-8: PASS — disabled initially, enabled after renderGantt(), re-disabled in Start Over
- AC-9: PASS — Remove button disabled at 7; validation count-check < 7 present
- AC-10: PASS — Add button disabled at 9; UI prevents reaching 10
- AC-11: PASS — per-field aria-invalid + error span revealed on blank submission
- AC-12: PASS — Start Over clears all state, inputs, Gantt, summary; returns to roster-entry
- AC-13: PASS — coaching-resources.astro has type:'link', category:'Tools', url:'/court-time-calculator'
- AC-14: PASS — BaseLayout wraps entire page; Navbar/Footer always present
- AC-15: PASS — seeded PRNG with deterministic seed derived from player names (unit tested)
- AC-16: PASS — no same-minute subs, no events at minute 0 or 20 (unit tested)
- AC-17: PASS — /iP(ad|hone|od)/i detection; window.open(bloburl) path for iOS
- AC-18: PASS — all inputs have <label for="...">; error spans have role="alert" + aria-describedby; <details> with court time summary; starter buttons have aria-pressed
- AC-19: PASS — starter selection section hidden until valid roster submit; Generate Plan disabled until count===5
- AC-20: PASS — algorithm initialises all slots with startingFive so starters are on-court minute 0
- AC-21: PASS — selectSecondHalfStarters() is algorithm-only; no coach input for second half

#### Polish fixes in Window 5:
- truncateName: 16→30 chars (was incorrectly set to 16, spec requires 30 per FR-003a)
- All static and dynamic buttons now have focus-visible:ring-2 styles (NFR-001)
- Plan generation failure now shows #generate-error paragraph (no more silent failure)
- <details> gantt-summary has descriptive aria-label for screen readers

---

### Window 4: PDF Export COMPLETE

- Tasks: Task 8, Task 9 — all DONE
- Checkpoint: PASS
- Build: npm run build — zero TypeScript errors, 11 pages built
- Tests: 17/17 still passing (algorithm tests unaffected)
- Dependencies: `jspdf@^4.2.1` added to package.json
- Files Modified:
  - `src/pages/court-time-calculator.astro` — added `exportPdf()` async function, wired Export PDF button, reset logic in Start Over handler, added `<p id="pdf-error">` element
- Timestamp: 2026-04-07

#### Key implementation notes for Window 5:

**PDF export implementation:**
- `exportPdf(plan: RotationPlan)` uses dynamic `import('jspdf')` — bundle cost deferred until button tap
- A4 portrait, 20mm margins, 170mm working width
- Header: "Bendigo Phoenix — Court Time Calculator" (bold 14pt) + date + player count
- First Half section: starting lineup + substitution events in countdown format
- Second Half section: starting lineup labelled "(algorithm selected)" + substitution events
- Clock format: elapsed `gameClockMinute` converted to countdown via `(20 - event.gameClockMinute)` padded as `MM:00`
- Event line format: `"[MM:SS] — [Player A] IN, [Player B] OUT"`
- iOS detection: `/iP(ad|hone|od)/i.test(navigator.userAgent)` → `window.open(bloburl)` instead of `doc.save()`
- Error handling: `try/catch` reveals `#pdf-error` paragraph on failure; never fails silently
- Footer: "Generated by Bendigo Phoenix Coach Toolkit — session data not saved" at page bottom (8pt, grey)

**Button state lifecycle:**
- Initial: `disabled`, `opacity-50 cursor-not-allowed bg-gray-200 text-gray-500`
- After Generate Plan: `disabled` removed, styled `bg-brand-purple text-white`, `onclick` assigned via `.onclick =`
- After Start Over: `disabled` restored, `.onclick = null`, styling reset to muted state

---

### Window 3: Gantt Chart Rendering COMPLETE

- Tasks: Task 6, Task 7 — all DONE
- Checkpoint: PASS
- Build: npm run build — zero TypeScript errors, 11 pages built
- Tests: 17/17 still passing (algorithm tests unaffected)
- Files Modified:
  - `src/pages/court-time-calculator.astro` — added full Gantt rendering, accessible summary, Start Over, disabled Export PDF
- Timestamp: 2026-04-07

#### Key implementation notes for Window 4:

**Plan display section structure:**
- `#section-plan-display` now renders Gantt chart and accessible summary after Generate Plan
- `#gantt-container` — populated by `renderGantt(schedules)` with CSS div-based bars
- `#gantt-summary` / `#gantt-summary-content` — `<details>` listing each player's court minutes
- `#btn-start-over` — wired, resets all state and returns to roster-entry
- `#btn-export-pdf` — present, `disabled`, `aria-label="Export substitution sheet as PDF"`, not wired

**Gantt structure:**
- `overflow-x: auto` wrapper with `min-width: 600px` inner div, `padding-left: 120px` for player labels
- Time axis at top: tick labels at 0,5,10,15,20,25,30,35,40 with percentage left offsets
- Half-time marker: absolute div at `left: calc(120px + 50%)`, `width:2px`, `bg-brand-gold` colour
- Per-player rows: absolute label div at left:-120px, relative timeline div with absolute stint bars
- On-court stints: `background: var(--color-brand-purple)`; bench stints: `background: var(--color-brand-offwhite)` with gray border
- Min-width 8px on all bars; widths/offsets are `% of 40 minutes`

**Module-level state added:**
- `let currentPlan: RotationPlan | null = null`
- `let currentSchedules: PlayerSchedule[] = []`

**Imports added to script block:**
- `import { generateRotationPlan, derivePlayerSchedules } from '../lib/court-time/algorithm'`
- `import type { RotationPlan, PlayerSchedule } from '../lib/court-time/types'`

---

## Checkpoint Results

### Window 1 Checkpoint — PASS

- [x] `src/lib/court-time/types.ts` exists and exports all 7 types
- [x] `src/lib/court-time/algorithm.ts` exists and exports generateRotationPlan, derivePlayerSchedules, and all helpers
- [x] `src/lib/court-time/algorithm.test.ts` exists with all 17 test cases (12 required + 5 additional)
- [x] `npm test` exits with code 0 — all 17 tests pass
- [x] `npm run build` exits with zero TypeScript errors
- [x] No DOM imports or framework imports anywhere in `src/lib/court-time/`

### Window 2 Checkpoint — PASS

- [x] `src/pages/court-time-calculator.astro` exists and renders at /court-time-calculator with Navbar and Footer (AC-14)
- [x] Session data notice is visible above the roster form on page load (FR-034, AC-1)
- [x] Roster form validates correctly: rejects blank names with inline error messages (AC-9, AC-10, AC-11)
- [x] Add/Remove Player buttons correctly show/hide inputs and respect the 7–9 bounds
- [x] Starting five selector shows after valid roster submit, counts correctly, disables the 6th selection (FR-017, AC-19)
- [x] Generate Plan button is disabled until exactly 5 starters selected (FR-016)
- [x] Coaching Resources page shows the Court Time Calculator card (FR-031, AC-13)
- [x] `npm run build` exits with zero TypeScript errors — 11 pages built including /court-time-calculator

### Window 4 Checkpoint — PASS

- [x] `npm install jspdf` complete; `jspdf` in `dependencies` in `package.json` (Task 8.1)
- [x] `exportPdf(plan)` implemented as `async function` with dynamic `import('jspdf')` (Task 8.2, FR-029, NFR-014)
- [x] PDF content: A4 portrait, 20mm margins, header with date + roster size, First Half and Second Half sections (Task 8.3, FR-027, NFR-011)
- [x] Starting lineup listed for both halves; Second Half labelled as algorithm-selected (FR-027)
- [x] Substitution events in countdown MM:00 format — `(20 - gameClockMinute)` (FR-027a)
- [x] Event line format: `[MM:SS] — [Player] IN, [Player] OUT` (FR-027a)
- [x] iOS-safe download: `window.open(bloburl)` for iOS, `doc.save()` for all others (Task 8.4, FR-030, AC-17)
- [x] `try/catch` wraps entire function; `#pdf-error` revealed on failure (Task 8.5)
- [x] Export PDF button enabled after `renderGantt()` call; disabled attribute removed, classes updated (Task 9.1, FR-028, AC-8)
- [x] `btnExport.onclick` wired to call `exportPdf(currentPlan)` (Task 9.2)
- [x] Start Over handler re-disables Export PDF, clears `onclick`, restores muted styles, hides `#pdf-error` (Task 9.3, AC-8, FR-028)
- [x] `npm run build` exits with zero TypeScript errors — 11 pages built (Task 9.5)
- [x] `npm test` 17/17 passing (algorithm unaffected)

### Window 3 Checkpoint — PASS

- [x] Clicking Generate Plan (with valid roster + 5 starters) calls generateRotationPlan + derivePlayerSchedules and passes result to renderGantt() (FR-020)
- [x] Time axis spans 0–40 with labels at every 5-minute mark (FR-021)
- [x] Half-time gold marker at 50% chart width using brand-gold colour (FR-023, AC-5)
- [x] On-court stints use brand-purple; bench stints use brand-offwhite with gray border (FR-022, AC-5)
- [x] All bars use percentage widths/offsets; min-width:8px applied to all stints (FR-022)
- [x] Chart uses overflow-x:auto with min-width:600px inner div for horizontal scrolling at 375px (FR-025, AC-6)
- [x] `<details id="gantt-summary">` with player-by-player court time list populated after generation (NFR-005)
- [x] Start Over resets currentPlan, currentSchedules, all inputs, starter selection, and returns to roster-entry (FR-033, AC-12)
- [x] Export PDF button present, disabled, aria-label set; no click action (FR-028, AC-8, NFR-003)
- [x] `npm run build` exits with zero TypeScript errors — 11 pages built
- [x] `npm test` 17/17 passing (algorithm unaffected)

### Window 5 Checkpoint — PASS (Feature Complete)

- [x] All 21 acceptance criteria verified and passing (Task 10 table fully checked)
- [x] All interactive elements have visible focus-visible ring indicators (NFR-001): focus-visible:ring-2 added to all static buttons (Add Player, Remove Player, Next/Submit, Back to Roster, Generate Plan, Start Over, Export PDF) and dynamically created starter toggle buttons
- [x] All inputs have `<label for="...">` with visible text; error spans have role="alert" + aria-describedby (NFR-002, NFR-004)
- [x] All buttons have descriptive accessible names via visible text or aria-label (NFR-003): Add Player, Remove Player, Next: Select Starting Five, Back to Roster, Generate Plan, Start Over, Export PDF (aria-label)
- [x] All interactive controls use h-11 (44px) Tailwind class (NFR-006)
- [x] 30-character name truncation fixed: truncateName maxLen corrected from 16 to 30 (FR-003a)
- [x] Gantt labels use overflow:hidden + text-overflow:ellipsis in 116px container
- [x] `npm test` exits code 0 — all 17 algorithm tests pass (no regressions)
- [x] `npm run build` exits with zero TypeScript errors and zero build warnings — 11 pages built
- [x] Zero network requests during roster entry, plan generation, or PDF export (client-side only, no fetch/XHR) (NFR-015)
- [x] Coaching Resources card: type:'link', category:'Tools', url:'/court-time-calculator', 'Tools' in categories array (FR-031, AC-13)
- [x] Plan generation failure now reveals #generate-error paragraph (no silent failure)
