# FEATURE: COA-19 — Court Time Calculator

**Linear Issue**: COA-19
**URL**: https://linear.app/coachcw/issue/COA-19/court-time-calculator
**Priority**: High
**Status**: Spec Draft
**Project**: Phoenix (Astro website)
**Section**: Coaching Resources

---

## Intent

Build a mobile-first court time calculator for basketball coaches managing 7–9 player rosters. The tool algorithmically distributes court time as evenly as possible across all players for a 2 × 20 minute half game format. It lives in the Coaching Resources section of the Phoenix website.

Coaches with 5–6 players can manage rotations manually. This tool targets the harder case: 7–9 players where equal court time is not easily calculated in your head.

---

## User's Core Action

A coach arrives at the game, enters their 7–9 player names, and the tool generates a substitution plan that distributes court time as evenly as possible across both halves. The coach sees a Gantt chart of player rotations on screen, and can export a substitution sheet as a PDF to use courtside.

---

## What This Is NOT

- No login or user accounts — purely session-based (data lives only in the browser for the session)
- No in-game adjustment in this version (out of MVP scope)
- Not for rosters of 5–6 players (manual rotation is sufficient)
- No persistent save — closing the tab clears the session
- No custom game formats — only 2 × 20 min halves supported in this version

---

## Inputs

- **Player names** (7–9 players) — free text, entered at start of session
- Game format is fixed: **2 halves × 20 minutes each** (40 minutes total)
- **5 players on court at all times**

---

## Outputs

- **Gantt chart** (screen-only): visual timeline per player showing on-court and off-bench periods across both halves
- **Substitution sheet** (PDF export): a printable schedule showing substitution events (who comes in, who sits, and at what time)

---

## Rotation Algorithm

- Distribute court time as evenly as possible across all players
- 5 players on court at all times from the 7–9 player pool
- Game: 2 × 20 min halves = 40 min total
- Substitutions happen at discrete time intervals (algorithm decides when)

---

## Design Constraints

- Must be usable on mobile (coach is courtside — large tap targets, no tiny controls)
- No login required — purely session-based
- PDF export of substitution sheet only (Gantt chart is screen-only)
- Gantt chart is screen-only

---

## Open Questions Resolved

| Question | Answer |
|---|---|
| What are the outputs? | Gantt chart (screen) + substitution sheet (PDF) |
| Game format? | Fixed: 2 × 20 min halves only |
| In-game adjustment in MVP? | No — out of scope |
| Players on court at once? | Always 5 |

---

## Codebase Context

- **Framework**: Astro (static site, no backend)
- **Styling**: Tailwind CSS
- **Existing pages**: `src/pages/coaching-resources.astro` — the tool will link from here
- **Layout**: `src/layouts/BaseLayout.astro` — all pages use this
- **Brand colours**: `brand-purple` (primary), `brand-gold` (accent), `brand-offwhite` (backgrounds)
- **No backend, no database, no auth** — all logic runs client-side in the browser
- **PDF generation**: will need a client-side PDF library (e.g. jsPDF or similar)
- **No existing interactive tools** on the site — this is the first one

---

## Known Concerns / Edge Cases

- Uneven division: 40 min total, 5 slots on court — some players will get slightly more court time than others when the number doesn't divide evenly (e.g. 7 players = ~28.5 min each)
- Algorithm must handle 7, 8, and 9 player rosters distinctly
- Substitution frequency: too many subs disrupts game flow — algorithm should prefer fewer, well-spaced substitutions over perfectly equal time at the cost of constant changes
- Mobile PDF generation and download must work on iOS Safari and Android Chrome
- Gantt chart must be readable on a small screen (horizontal scroll acceptable)
- Session data loss: coach must understand data is not saved if they navigate away
