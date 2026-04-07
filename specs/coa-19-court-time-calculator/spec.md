# Spec: COA-19 — Court Time Calculator

**Status**: IN_DESIGN
**Source**: https://linear.app/coachcw/issue/COA-19/court-time-calculator
**Priority**: High

---

## Summary

The Court Time Calculator is a client-side interactive tool for basketball coaches managing rosters of 7–9 players. It lives in the Coaching Resources section of the Bendigo Phoenix website. The coach enters player names before a game and the tool algorithmically distributes court time as evenly as possible across both halves of a 2 × 20 minute game, keeping exactly 5 players on court at all times. The tool produces two outputs: a Gantt chart displayed on screen showing each player's on-court and bench periods across the full game, and a printable substitution sheet that can be exported as a PDF for courtside use. No login, backend, or persistent storage is involved — all state exists only in the browser session.

This is the first interactive tool on the Phoenix website. All existing pages are static; this feature introduces client-side JavaScript logic and PDF generation.

---

## User Stories and Acceptance Scenarios

### User Story 1 — Enter Roster and Generate Plan (Priority: P1)

A coach arrives at the game venue, opens the tool on their phone, enters 7–9 player names, and taps "Generate Plan" to receive a court time schedule.

**Why P1**: This is the entire value of the tool. Without roster input and plan generation, nothing else exists.

**Independent Test**: Navigate to the tool page, enter 8 player names, submit the form, and verify a rotation plan is produced showing 8 players with time allocations summing to 40 minutes total per player-slot and exactly 5 players active at every point in the schedule.

**Acceptance Scenarios**:

1. Given the coach is on the Court Time Calculator page, When they enter exactly 7 player names and tap "Generate Plan", Then the tool produces a rotation plan where every player receives between 28 and 29 minutes of court time, the sum of all player minutes equals 200 (5 players × 40 min), and no two players share a court slot that would result in more or fewer than 5 active players at any moment.

2. Given the coach enters exactly 8 player names and taps "Generate Plan", Then every player receives exactly 25 minutes of court time, substitutions are distributed across both halves, and the total player-minutes equals 200.

3. Given the coach enters exactly 9 player names and taps "Generate Plan", Then every player receives either 22 or 23 minutes of court time, the sum of all player-minutes equals 200, and no player receives fewer than 22 or more than 23 minutes.

4. Given the coach enters fewer than 7 player names and attempts to submit, Then the form does not submit, an inline validation message is displayed explaining that 7–9 players are required, and no plan is generated.

5. Given the coach enters more than 9 player names and attempts to submit, Then the form does not submit, an inline validation message is displayed, and no plan is generated.

6. Given the coach enters 7–9 names where one or more names are blank or contain only whitespace, Then the form does not submit and identifies which name fields require input.

---

### User Story 2 — View Gantt Chart on Screen (Priority: P1)

After generating a plan, the coach sees a Gantt-style visual timeline showing each player's on-court (active) and off-bench (resting) periods across both halves.

**Why P1**: The Gantt chart is the primary on-screen output and is essential for the coach to verify and understand the rotation plan before the game.

**Independent Test**: Generate a plan for any valid roster size, then verify the Gantt chart renders with one row per player, a horizontal time axis representing 0–40 minutes, a visual break between the two halves at the 20-minute mark, and distinct colour coding for on-court versus bench periods.

**Acceptance Scenarios**:

1. Given a plan has been generated, When the Gantt chart is rendered, Then each player has exactly one row, the horizontal axis spans 0–40 minutes, the half-time break at 20 minutes is visually indicated, on-court periods are visually distinct from bench periods using brand colours, and the chart is labelled with player names on the left.

2. Given the chart is viewed on a mobile device with a narrow viewport, When the chart is wider than the screen, Then the chart container scrolls horizontally and does not overflow the page layout or hide any player rows.

3. Given the chart is viewed on a desktop viewport, When the plan is displayed, Then the chart fits within the content area without horizontal scrolling.

4. Given any Gantt chart is displayed, When a coach reads the chart, Then each row clearly distinguishes which player is on court and which is on the bench at any given minute, and the half-time transition is unambiguous.

---

### User Story 3 — Export Substitution Sheet as PDF (Priority: P1)

The coach taps "Export PDF" and receives a printable substitution sheet they can use courtside during the game.

**Why P1**: The PDF is the primary take-to-court artifact. The Gantt chart is a planning aid; the PDF is the game-day tool.

**Independent Test**: Generate a plan, tap "Export PDF", and verify a PDF file is downloaded containing a substitution schedule that lists each substitution event (time, player coming on, player sitting down), structured for at-a-glance reading during a game.

**Acceptance Scenarios**:

1. Given a plan has been generated, When the coach taps "Export PDF", Then a PDF file is downloaded to the device containing the substitution sheet.

2. Given the PDF is opened, Then it lists each substitution event with: the game clock time (e.g. "18:00 — First Half"), the player(s) coming onto the court, and the player(s) moving to the bench.

3. Given the PDF is opened on a mobile device (iOS Safari or Android Chrome), When the download is triggered, Then the file downloads or opens in the native PDF viewer without error.

4. Given no plan has been generated yet, When the coach sees the page, Then the "Export PDF" button is either hidden or visibly disabled with a label indicating a plan must be generated first.

5. Given the PDF is printed or viewed on screen, Then all text is legible at standard document size (no text is clipped or overflowing page bounds).

---

### User Story 4 — Set Starting Five (Priority: P1)

Before generating a plan, the coach selects which 5 players start the first half.

**Why P1**: Coaches always have a preferred starting lineup. Forcing the algorithm to choose who starts removes meaningful control at a high-stakes moment (tip-off). The second-half starting five is derived by the algorithm to continue even distribution from where the first half left off.

**Independent Test**: Enter 8 player names, designate 5 as starters, generate a plan, and verify the first-half starting five in the Gantt chart matches exactly the coach's selection.

**Acceptance Scenarios**:

1. Given the coach has entered 7–9 player names, When they proceed to plan setup, Then the tool displays all entered players and prompts the coach to select exactly 5 starters for the first half.

2. Given the coach has selected exactly 5 starters, When they tap "Generate Plan", Then the generated plan begins with those 5 players on court at minute 0 of the first half.

3. Given the coach attempts to generate a plan with fewer than 5 starters selected, Then the form does not submit and an inline message indicates exactly 5 starters must be chosen.

4. Given the coach attempts to select more than 5 starters, Then the selection control prevents selection of a 6th player (e.g. by disabling remaining options once 5 are selected).

5. Given the second half, When the plan is generated, Then the second-half starting five is determined by the algorithm to best continue even distribution — the coach does not set the second-half lineup in this version.

---

### User Story 5 — Understand Session-Only Data Policy (Priority: P2)

The coach is informed that their roster data is not saved, so they are not surprised if the data is lost on navigation or browser close.

**Why P2**: Coaches must set expectations before entering data. Losing a roster at game time is a high-frustration event that a simple notice prevents.

**Independent Test**: Load the tool page and verify a session-data notice is visible before or immediately after the roster input form, clearly stating that data is not saved if the page is closed or navigated away from.

**Acceptance Scenarios**:

1. Given the coach visits the Court Time Calculator page, When the page loads, Then a visible notice explains that session data is not saved and will be lost if the page is closed or navigated away from.

2. Given a plan has been generated and the coach navigates away and returns, When they return to the page, Then the previous roster and plan are not present (confirming the session-only nature), or alternatively the notice is sufficient to set expectations before any data is entered.

---

### User Story 6 — Reset and Re-enter Roster (Priority: P2)

After generating a plan, the coach can start over with a different roster.

**Why P2**: Coaches may need to adjust for late arrivals or a player not attending. A reset path is essential but secondary to the core generation flow.

**Independent Test**: Generate a plan, then trigger a reset, and verify the roster form is restored to its empty state and no previous plan or Gantt chart is displayed.

**Acceptance Scenarios**:

1. Given a plan has been generated, When the coach taps "Start Over" or equivalent reset control, Then the roster form is cleared, the Gantt chart is removed from the page, and the tool returns to the initial roster-entry state.

2. Given the form is cleared, When the coach enters a new roster and generates a plan, Then a new plan is generated and displayed correctly.

3. Given the coach is on the starting five selection step (has entered a valid roster but not yet generated a plan), When they trigger "Start Over" or equivalent reset, Then the roster form is cleared, the starting five selection is cleared, and the tool returns to the initial roster-entry state.

---

### User Story 7 — Access Tool from Coaching Resources (Priority: P2)

The Court Time Calculator is discoverable from the existing Coaching Resources page.

**Why P2**: Discovery through the existing page is necessary for coaches to find the tool, but the tool itself works independently once reached.

**Independent Test**: Load the Coaching Resources page and verify a link or card entry for the Court Time Calculator is present and navigates to the correct tool page.

**Acceptance Scenarios**:

1. Given a coach visits the Coaching Resources page, When they scan the page, Then an entry for the Court Time Calculator is visible, clearly labelled, and links to the tool page.

2. Given the coach taps or clicks the Court Time Calculator entry, When the navigation completes, Then they arrive at the Court Time Calculator tool page.

---

### User Story 8 — Copy/Rename Players for Readability (Priority: P3)

The coach can edit player names after initial entry to correct spelling or update for a late substitution before regenerating.

**Why P3**: Desirable for polish but not blocking — the coach can re-enter names via the reset flow if needed.

**Independent Test**: Generate a plan, then edit one player name field (if the UI allows editing post-generation), re-generate, and verify the updated name appears in both the Gantt chart and PDF.

**Acceptance Scenarios**:

1. Given the tool supports name correction, When the coach edits a name and regenerates, Then all output (Gantt and PDF) reflects the updated name.

---

## Edge Cases

### Roster Size Edge Cases

- **7 players**: 40 ÷ 7 = 5.71 rotations needed across 200 total player-minutes. Four players receive 29 minutes and three players receive 28 minutes. Which players receive the extra minute is determined by a random selection at plan generation time (consistent with FR-015 — same inputs always produce the same result). The total must equal exactly 200.

- **8 players**: 40 ÷ 8 = exactly 25 minutes each. No remainder. All players receive equal time. This is the cleanest case.

- **9 players**: 40 ÷ 9 = 22.22 minutes each. Two players receive 23 minutes and seven players receive 22 minutes. Which players receive the extra minute is determined by a random selection at plan generation time (consistent with FR-015 — same inputs always produce the same result). Total must equal exactly 200.

- **Boundary inputs**: The form must reject exactly 6 players (below minimum) and exactly 10 players (above maximum) with clear validation messages.

### Substitution Frequency Edge Cases

- **Minimising unnecessary substitutions**: The algorithm must not introduce substitutions beyond what is required to satisfy the court time equity constraint. For example, if a player can remain on court for 10 consecutive minutes and still receive their fair share of total time, they should. The goal is maximum consecutive run lengths, not a fixed number of subs.

- **Substitutions must occur at whole-minute marks**: All planned substitution times must be expressed as whole minutes (e.g. 10:00, not 10:30) to be readable and actionable courtside.

- **Half-time boundary**: Substitutions must respect the half-time break. No substitution spans the half-time boundary. The algorithm treats each half as an independent block. All 5 starting players for the second half are defined explicitly (they may differ from the 5 who finished the first half).

- **Bunching**: The algorithm must not schedule two substitutions within the same minute. Each substitution event has a unique game-clock time.

- **Multiple simultaneous substitutions**: If two players must swap at the same time, this counts as a single substitution event with multiple players listed, not two separate events at the same timestamp.

### Gantt Chart Edge Cases

- **Very short on-court stint**: If a player has a stint of 1–2 minutes in the algorithm output, the Gantt bar for that period must still be visually rendered (minimum visible bar width) and not invisible.

- **Name length**: Player names up to 30 characters must not overflow the Gantt row label area. Names exceeding 30 characters may be truncated with an ellipsis.

- **All players equal time (8-player case)**: The Gantt should still render correctly with perfectly uniform bars.

- **Gantt vs PDF clock direction**: The Gantt chart time axis runs left-to-right as elapsed time (0→40 minutes), which is the natural visual direction for a timeline. Only the PDF uses basketball countdown format (time remaining in the half). These two formats MUST NOT be confused — the Gantt always shows elapsed time, and the PDF always shows remaining time.

### PDF Edge Cases

- **iOS Safari download**: iOS Safari does not support `download` attribute on anchor tags pointing to blob URLs in all cases. The PDF export must use a method compatible with iOS Safari (e.g. opening the PDF in a new tab if direct download fails).

- **Long player names in PDF**: Player names in the PDF substitution list must not overflow table cell or line boundaries.

- **PDF before plan generation**: The export action must not be triggerable before a plan exists in memory.

- **Empty substitution list**: Theoretically, if all 5 starting players remain on court for the full 40 minutes (impossible given the constraints of 7–9 players and equal time distribution, but the system should not crash if the substitution list is empty for any reason).

### Session Edge Cases

- **Page refresh mid-session**: If the coach refreshes the page, all data is lost. This is expected behaviour and is covered by the session data notice (US-4).

- **Back button after navigation**: If the coach navigates away and uses the browser back button, the tool reloads fresh with no pre-populated data.

---

## Requirements

### Functional Requirements

**Roster Input**

- FR-001: The tool MUST accept between 7 and 9 player names as free-text input.
- FR-002: The tool MUST reject submission if fewer than 7 or more than 9 player names are provided, displaying an inline validation message.
- FR-003: The tool MUST reject submission if any provided name field is blank or contains only whitespace.
- FR-003a: Player names exceeding 30 characters MUST be accepted as input but MUST be truncated to 30 characters (with a trailing ellipsis where space permits) in all display contexts (Gantt chart row labels, PDF). No validation error is shown for names longer than 30 characters — the truncation is handled silently at the display layer.
- FR-004: The tool MUST NOT accept or process player data beyond the current browser session. No data is transmitted to any server or persisted in localStorage, IndexedDB, or cookies.
- FR-005: The tool MUST NOT support roster sizes of 5 or 6 players. This range is explicitly out of scope.

**Rotation Algorithm**

- FR-006: The algorithm MUST maintain exactly 5 players on court at all times throughout both halves.
- FR-007: The algorithm MUST distribute court time as evenly as possible across all players. The maximum difference in court time between any two players in the same roster MUST NOT exceed 1 minute.
- FR-008: For a 7-player roster, the algorithm MUST produce a schedule where the sum of all player court-time minutes equals exactly 200. Four players receive 29 minutes and three players receive 28 minutes. Which players receive the extra minute MUST be determined by a random selection at plan generation time, consistent with FR-015 (same inputs always produce the same output).
- FR-009: For an 8-player roster, the algorithm MUST produce a schedule where each player receives exactly 25 minutes of court time.
- FR-010: For a 9-player roster, the algorithm MUST produce a schedule where the sum of all player court-time minutes equals exactly 200. Two players receive 23 minutes and seven players receive 22 minutes. Which players receive the extra minute MUST be determined by a random selection at plan generation time, consistent with FR-015 (same inputs always produce the same output).
- FR-011: All substitution times MUST be expressed as whole-minute half-relative values in the range 1–19 (e.g. minute 8 means 8 minutes into that half). Minute 0 (tip-off) and minute 20 (half-time) are not valid substitution minutes. The internal `gameClockMinute` value is stored as elapsed minutes (1–19); the PDF display layer converts to countdown format by computing `(20 - gameClockMinute)` formatted as `MM:00` (e.g. elapsed minute 5 → "15:00"). The Gantt chart displays elapsed time (left-to-right, 0→40) and does not use countdown format.
- FR-012: No two substitution events within the same half MAY share the same game clock minute. Every substitution event within a half MUST occur at a unique minute value.
- FR-013: No substitution event MUST span the half-time boundary. Each half is scheduled independently.
- FR-014: The algorithm MUST maximise each player's consecutive on-court time. Each player's court time MUST be delivered in the fewest possible continuous stints — ideally one uninterrupted on-court block per half. Substitutions MUST only occur when required to honour a player's half-time target (FR-007 and FR-008 through FR-010). The algorithm MUST NOT split a player's half-allocation into multiple non-contiguous stints if a single contiguous block satisfies all other constraints.
- FR-015: The algorithm MUST produce a deterministic output given the same ordered list of player names and the same starting five selection — the same inputs always produce the same plan.

**Starting Five**

- FR-016: The tool MUST require the coach to select exactly 5 players as the first-half starting lineup before plan generation is permitted.
- FR-017: The tool MUST prevent the coach from selecting fewer than or more than 5 starters (e.g. disable additional selections once 5 are chosen).
- FR-017a: The tool MUST present roster entry and starting five selection as two sequential steps. After the coach submits a valid roster (7–9 names, no blanks), the tool transitions to the starting five selection step. The coach MUST NOT be able to reach the starting five selection step without first submitting a valid roster. A "Back" control MUST allow the coach to return to roster entry from the starting five step without losing the entered names.
- FR-018: The generated plan MUST begin with the coach-selected 5 players on court at minute 0 of the first half.
- FR-019: The second-half starting five MUST be determined by the algorithm, not the coach, in this version. The algorithm MUST select the 5 players with the highest remaining court time target after the first half completes (i.e., total target minus first-half court time). Ties in remaining target are broken by original roster entry order (lower index wins).

**Gantt Chart**

- FR-020: The tool MUST render a Gantt chart after plan generation showing one row per player.
- FR-021: The Gantt chart MUST display a continuous horizontal time axis from 0 to 40 minutes.
- FR-022: The Gantt chart MUST visually distinguish on-court periods from bench periods for each player.
- FR-023: The Gantt chart MUST display a visual separator or label at the 20-minute mark indicating the half-time boundary.
- FR-024: The Gantt chart MUST be screen-only. It MUST NOT appear in the exported PDF.
- FR-025: The Gantt chart MUST support horizontal scrolling on viewports where it cannot be fully displayed without scrolling, rather than truncating or overflowing.

**Substitution Sheet (PDF Export)**

- FR-026: The tool MUST provide a mechanism to export a substitution sheet as a PDF file.
- FR-027: The PDF MUST contain: (a) a starting lineup section at the top of each half listing the 5 players who begin that half on court; (b) a substitution events section listing each event in chronological order within that half, with the half-relative game clock time displayed in countdown format (see FR-027a), the player(s) coming onto the court, and the player(s) moving to the bench. The second-half starting lineup MUST be clearly shown since it is algorithm-determined and may surprise the coach.
- FR-027a: All game clock times displayed in the PDF MUST use basketball countdown format — the time remaining in the half at the moment of the substitution (e.g. a substitution at half-relative minute 5 is displayed as "15:00" since there are 15 minutes remaining in the half). Times MUST be formatted as MM:SS with always two digits for each (e.g. "15:00", "08:00", "02:00"). The section heading for each half's substitution list MUST read "First Half" or "Second Half". Each substitution event line MUST read in the format: "[MM:SS] — [Player A] IN, [Player B] OUT" (or list multiple players if it is a multi-player swap).
- FR-028: The PDF export action MUST be disabled or hidden until a plan has been successfully generated.
- FR-029: The PDF MUST be generated entirely client-side without transmitting any data to a server.
- FR-030: The PDF MUST be compatible with download or in-tab viewing on iOS Safari and Android Chrome.

**Navigation and Integration**

- FR-031: The Court Time Calculator MUST be accessible via a link or card on the Coaching Resources page.
- FR-032: The Court Time Calculator MUST render within the existing BaseLayout (Navbar + Footer). No custom navigation shell is permitted.
- FR-033: The tool MUST provide a "Start Over" or equivalent control that clears all state and returns the tool to its initial roster-entry state.
- FR-034: The tool MUST display a visible notice before or at roster entry that session data is not saved and will be lost on navigation or page close.

### Non-Functional Requirements

**Accessibility**

- NFR-001: All interactive controls (form inputs, buttons) MUST have visible focus indicators and meet WCAG 2.1 AA contrast requirements.
- NFR-002: All form inputs MUST have associated visible labels (not placeholder-only labels).
- NFR-003: All buttons MUST have descriptive accessible names (via visible text or aria-label).
- NFR-004: Error messages MUST be programmatically associated with their relevant input fields (aria-describedby or equivalent) so screen readers announce them.
- NFR-005: The Gantt chart, being a visual-only element, MUST include a text-based summary or accessible description (aria-label or adjacent summary text) so the plan is not exclusively conveyed through the visual chart.

**Mobile / Layout**

- NFR-006: All interactive controls MUST have a minimum tap target size of 44 × 44 CSS pixels on mobile viewports.
- NFR-007: The roster entry form MUST be fully usable on a 375px-wide viewport (iPhone SE) without horizontal scrolling of the form itself.
- NFR-008: The tool page MUST render correctly and be usable on desktop viewports (1024px and above).
- NFR-009: The tool MUST use brand colours (brand-purple, brand-gold, brand-offwhite) and be visually consistent with the existing site design system.

**PDF Compatibility**

- NFR-010: The PDF export MUST function on iOS Safari (version 15 and above) and Android Chrome (version 100 and above).
- NFR-011: The substitution sheet PDF MUST be formatted for portrait A4 or US Letter size, with margins sufficient to prevent content clipping when printed.
- NFR-012: The PDF MUST NOT require any external network request to generate (all fonts and layout must be self-contained in the client-side bundle).

**Performance**

- NFR-013: Plan generation from form submission to Gantt chart render MUST complete within 1 second on a mid-range mobile device.
- NFR-014: PDF generation and download initiation MUST complete within 3 seconds on a mid-range mobile device.

**Data and Privacy**

- NFR-015: Player names MUST NOT be transmitted outside the browser. No analytics events, error tracking payloads, or network requests MUST include player name data.

---

## Key Entities

These are the client-side data structures the tool operates on. They exist only in memory for the duration of the browser session.

### Roster

The input provided by the coach at the start of a session.

```
Roster {
  players: Player[]       // ordered list, 7–9 entries
}
```

### Player

A single player entry in the roster.

```
Player {
  id: string              // stable identifier for the session (e.g. index-based)
  name: string            // free-text name entered by the coach, trimmed
}
```

### RotationPlan

The full computed schedule for both halves, produced by the algorithm from the Roster.

```
RotationPlan {
  roster: Player[]
  halves: HalfPlan[]      // always exactly 2 entries
  totalPlayerMinutes: number  // must equal 200
}
```

### HalfPlan

The schedule for one half (20 minutes).

```
HalfPlan {
  halfNumber: 1 | 2
  startingFive: Player[]  // exactly 5 players
  substitutions: SubstitutionEvent[]
}
```

### SubstitutionEvent

A single planned substitution at a specific game clock time within a half.

```
SubstitutionEvent {
  gameClockMinute: number     // whole number, 1–19 within the half (half-relative; minute 1 = first minute after tip-off or half-time whistle)
  playersComingOn: Player[]   // 1 or more players entering the court
  playersSittingDown: Player[]// same count as playersComingOn
}
```

### PlayerSchedule

A derived view of a single player's activity, used for Gantt chart rendering.

```
PlayerSchedule {
  player: Player
  stints: Stint[]
}
```

### Stint

A continuous block of time a player is either on court or on the bench.

```
Stint {
  type: 'on-court' | 'bench'
  startMinute: number     // 0–39, absolute game clock
  endMinute: number       // 1–40, absolute game clock
  durationMinutes: number // endMinute - startMinute
}
```

---

## Success Criteria

- SC-001: A coach with a 7-player roster can enter names, generate a plan, view a readable Gantt chart, and export a PDF in under 2 minutes total interaction time.
- SC-002: The generated plan for any valid roster (7, 8, or 9 players) produces court time allocations where no player's time differs from another by more than 1 minute.
- SC-003: The total of all player court-time minutes across any generated plan equals exactly 200.
- SC-004: The exported PDF downloads successfully (or opens in the native viewer) on both iOS Safari and Android Chrome without error.
- SC-005: The Gantt chart is readable on a 375px-wide mobile viewport without truncating any player row or name.
- SC-006: The tool is discoverable from the Coaching Resources page via a clearly labelled entry.
- SC-007: No player name data is transmitted outside the browser during any part of the tool's operation.
- SC-008: The substitution schedule contains no event that crosses the half-time boundary and no two events at the same game clock minute.
- SC-009: A coach who enters fewer than 7 or more than 9 names receives a clear validation message and is not able to proceed to plan generation.
- SC-010: The session data notice is visible to every coach before they commit names to the form.

---

## Acceptance Criteria

1. Given the tool page is loaded on a 375px-wide mobile viewport, When the page renders, Then the roster entry form is fully visible and usable without horizontal scrolling, all input labels are visible, and the session data notice is displayed.

2. Given the coach enters 7 valid player names and submits, When the plan is generated, Then the Gantt chart appears with 7 player rows, each player's total on-court duration is either 28 or 29 minutes, and the sum of all durations is 200 minutes.

3. Given the coach enters 8 valid player names and submits, When the plan is generated, Then each player's total on-court duration is exactly 25 minutes.

4. Given the coach enters 9 valid player names and submits, When the plan is generated, Then each player's total on-court duration is either 22 or 23 minutes, and the sum of all durations is 200 minutes.

5. Given a plan is displayed, When the coach inspects the Gantt chart, Then the half-time marker is visible at the 20-minute position and on-court periods are visually distinct from bench periods.

6. Given the coach is viewing a plan on a narrow mobile viewport, When the Gantt chart is wider than the screen, Then the chart scrolls horizontally without overflowing the page or hiding player name labels.

7. Given a plan has been generated, When the coach taps "Export PDF", Then a PDF file is downloaded (or opened in the PDF viewer on iOS), the file contains a chronological list of substitution events, and each event clearly identifies the game clock time, the half, the player(s) coming on, and the player(s) sitting down.

8. Given no plan has been generated, When the coach views the page, Then the "Export PDF" control is absent or visibly disabled, and tapping it (if visible) produces no file download.

9. Given the coach enters 6 or fewer player names and attempts to submit, Then the form is not submitted, and an inline validation message adjacent to the form explains that 7–9 players are required.

10. Given the coach enters 10 or more player names and attempts to submit, Then the form is not submitted, and an inline validation message explains the player count limit.

11. Given the coach enters any name field as blank or whitespace-only and attempts to submit, Then the form is not submitted, and the blank field(s) are individually identified with a validation message.

12. Given a plan has been generated, When the coach taps "Start Over", Then the form returns to its empty initial state, the Gantt chart is removed, and no plan data remains visible.

13. Given the coach visits the Coaching Resources page, When they view the page, Then a card or link entry for the Court Time Calculator is present, clearly labelled as a tool (not a document or PDF), and clicking it navigates to the Court Time Calculator page.

14. Given any state of the tool, When the page is rendered, Then the Bendigo Phoenix Navbar and Footer from BaseLayout are present and functional.

15. Given two identical ordered roster inputs with the same starting five selection are submitted on separate sessions, When both plans are generated, Then the substitution schedules are identical (deterministic output).

16. Given the substitution schedule produced by the algorithm, When each event's game clock minute is inspected, Then no two events share the same minute value, and no event has a game clock minute of 0 or 20 (no substitution at tip-off or at the half-time boundary).

17. Given the PDF export is triggered on iOS Safari 15+, When the export completes, Then either a file download is initiated or the PDF opens in a new tab — the operation does not silently fail or display an unhandled error.

18. Given the tool page, When a screen reader user navigates the page, Then all form inputs have announced labels, all error messages are announced when triggered, and a textual summary of the plan is accessible alongside or in place of the visual Gantt chart.

19. Given the coach has entered 7–9 player names, When they proceed to plan setup, Then a starting five selection step is presented showing all entered players and requiring exactly 5 to be selected before generation is enabled.

20. Given the coach has selected exactly 5 starters and generates a plan, When the Gantt chart renders, Then each of the 5 selected starters has a row beginning with an on-court stint starting at minute 0, and the remaining players' rows begin with a bench stint starting at minute 0.

21. Given the coach has selected 5 starters and a plan is generated, When the second half of the Gantt chart is inspected, Then the second-half starting five is different from or the same as the first-half starters based purely on algorithm-determined equity — not on coach selection.

---

## Open Questions and Deferred Scope

### Deferred to Future Version

| Topic | Current Decision | Future Consideration |
|---|---|---|
| In-game adjustment | Out of MVP scope. The plan is generated pre-game and is static. | A future version could allow a coach to mark a substitution as skipped or delayed mid-game and recalculate the remaining schedule. |
| Custom game formats | Only 2 × 20 min halves supported. | Future formats could include 4 quarters, overtime, or custom half lengths for tournaments. |
| Plan persistence | Session-only. Closing the tab clears all data. | A future version could offer local storage save/load or a shareable URL encoding the plan. |
| Roster of 5–6 players | Explicitly not supported. | Could be added if coaches request it, though the tool offers little value over mental arithmetic for small rosters. |
| Named starting five selection | Coach selects first-half starting five in MVP. Second-half lineup is algorithm-determined. | A future version could allow the coach to also set the second-half starting lineup. |
| Substitution rationale display | The Gantt and PDF show what happens, not why. | A future version could show the algorithm's reasoning (e.g. "Player A has most bench time remaining"). |

### Resolved Open Questions (from FEATURE.md)

| Question | Resolution |
|---|---|
| What are the outputs? | Gantt chart (screen-only) + substitution sheet (PDF export). |
| Game format? | Fixed: 2 × 20 min halves only. No user input for this. |
| In-game adjustment in MVP? | No — explicitly out of scope. |
| Players on court at once? | Always exactly 5. |

---

## Quality Compliance Notes

These notes capture how general web quality principles apply to this feature, given the project has no formal constitution document.

- **Client-side authority**: There is no backend. All data derivation, validation, and computation is necessarily client-side. The spec is consistent with this constraint throughout.
- **No silent failures**: FR-002, FR-003, and FR-024 ensure the tool communicates failures to the user explicitly. PDF export errors must surface a user-readable message rather than failing silently.
- **Accessibility**: NFR-001 through NFR-005 address WCAG 2.1 AA compliance. The Gantt chart's visual-only nature is specifically called out with a requirement for a textual equivalent (NFR-005).
- **Mobile-first**: The tool is explicitly designed for courtside mobile use. NFR-006 and NFR-007 set hard minimums for tap targets and viewport compatibility before desktop is considered.
- **No data exfiltration**: FR-004 and NFR-015 together ensure player name data never leaves the browser. This is a privacy constraint even in a no-login context.
- **Layout consistency**: FR-028 ensures the tool does not introduce a custom navigation shell, maintaining visual consistency with the rest of the Phoenix site.
- **Determinism**: FR-015 ensures the algorithm is predictable and testable. A non-deterministic algorithm would be untestable and could produce inconsistent plans for the same roster.
