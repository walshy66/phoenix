---
name: fitness-domain
description: Provide CoachCW fitness domain knowledge including core concepts, training terminology, session and exercise data structures, business rules, and calculation specs. Use when implementing or reviewing any feature that touches training sessions, exercises, sets, reps, load, progression, or athlete data. Grounds implementation in correct domain semantics — prevents misuse of domain terms and incorrect data modelling.
---

# Fitness Domain

Core domain knowledge for CoachCW. Grounds all implementation in correct fitness semantics.

## When to Use This Skill

- Implementing any feature that touches session logs, exercises, or athlete data
- Modelling new domain entities or extending existing ones
- Writing specs or requirements for training-related features
- Reviewing code that involves load, volume, progression, or performance calculations
- Naming fields, endpoints, or UI elements in the training domain

---

## Core Concepts

### The Execution Hierarchy

CoachCW is execution-first. Understanding this hierarchy is essential to every domain decision.

```
Athlete
└── Session Log (one execution of a training session)
    └── Actual Exercise Log (one exercise performed in a session)
        └── Actual Set Log (one set performed: weight, reps, outcome)
```

**Key rule (Constitution — Execution vs Planning Authority):**
Session execution is independent of planning. An athlete can log sessions without any program defined. Planning structures (programs, phases, blocks) may contextualise sessions but never own or gate them.

---

### Session

A **session** is a single discrete training event — a defined period during which an athlete performs exercises.

| Term | Definition |
|---|---|
| Session | One training event from start to completion |
| Active session | A session that has been started but not yet completed |
| Completed session | A session with a `completedAt` timestamp and `COMPLETED` status |
| Abandoned session | A session that was started but closed without completing |

**Invariant:** Exactly one active session per athlete at any time. A second session cannot be started while one is active. This is enforced server-side — never client-side.

**Session lifecycle:**
```
ACTIVE → COMPLETED
ACTIVE → ABANDONED
```

A completed session is **immutable**. Its logged data must not be modified except through the correction flow (post-completion editing via a new revision).

---

### Exercise

An **exercise** is a named movement pattern performed during a session.

| Term | Definition |
|---|---|
| Exercise | A named movement (e.g. "Dumbbell Bench Press") |
| Canonical exercise | A system-defined exercise available to all athletes |
| Custom exercise | A user-created exercise visible only to that athlete |
| Retired exercise | An exercise no longer available for new logging |

**Key rule:** Exercise identity is by UUID, not name. Names may change (aliases), UUIDs do not.

**Exercise name construction:**

The display name is built from two components and written once into the database at creation time:

- One or more **Equipment** records (from the equipment table) — e.g. "Dumbbell", "Barbell", "Cable"
- A **free-text movement pattern** field — e.g. "Bench Press", "Back Squat", "Row"

The name is assembled as `{equipment} {equipment} ... {movement pattern}` and stored as a static string. It is not dynamically assembled at query time.

Examples:
- `[Barbell]` + `[Back Squat]` → `"Barbell Back Squat"`
- `[Dumbbell]` + `[Dumbbell]` + `[Bench Press]` → `"Dumbbell Bench Press"`
- `[Cable]` + `[Row]` → `"Cable Row"`

**Multiple equipment records per exercise are permitted.** The order of equipment in the name follows creation order.

**Aliases:**

When a user attempts to create an exercise with a name that matches an existing exercise (or a known alias), the system resolves to the existing `exerciseId` rather than creating a duplicate record. The submitted name is stored as an alias on the existing exercise and is searchable. This keeps the exercise catalog clean while supporting regional and colloquial naming variations.

- Alias lookup is case-insensitive
- Aliases are stored on the Exercise record and indexed for search
- The canonical name is used for display; aliases surface in search results only

**Common exercise classifications:**
- **Compound**: Multi-joint movement (squat, deadlift, bench press, row, overhead press)
- **Isolation**: Single-joint movement (bicep curl, leg extension, lateral raise)
- **Bodyweight**: Uses bodyweight as primary resistance (pull-up, dip, push-up)
- **Unilateral**: One limb at a time (split squat, single-arm row)

---

### Set

A **set** is one continuous bout of an exercise — a specific number of repetitions performed without rest.

| Term | Definition |
|---|---|
| Set | One bout of an exercise without rest |
| Rep (repetition) | One complete cycle of the movement |
| Working set | A set performed at training intensity |
| Warm-up set | A sub-maximal set before working sets |
| Drop set | A set performed immediately after another with reduced weight |

**Set data:**
```typescript
{
  weight: number | null,    // kg — null for bodyweight exercises
  reps: number | null,      // null if failure/AMRAP not counted
  rpe: number | null,       // Rate of Perceived Exertion 1-10 (optional)
  outcome: 'COMPLETED' | 'FAILED' | 'PARTIAL'
}
```

---

### Load and Volume

**Load** = the weight lifted in a single set (kg).

**Volume** = total work performed. Calculated as:
```
Volume = Sets × Reps × Weight
```

Example: 3 sets × 5 reps × 100kg = 1500kg total volume

**Weekly volume** = sum of volume across all sessions in a 7-day window.

**Note:** Volume is always calculated server-side from logged data. The frontend never computes volume — it displays what the backend returns.

---

### Intensity

**Intensity** describes how hard a set is relative to maximum capacity.

| Measure | Description | Use in CoachCW |
|---|---|---|
| % 1RM | Percentage of one-rep maximum | Reference only — not primary metric |
| RPE | Rate of Perceived Exertion (1-10) | Optional per-set field |
| RIR | Reps In Reserve (0 = failure, 3 = 3 reps left) | Derived from RPE where RPE + RIR ≈ 10 |

**1RM Estimation (Epley formula):**
```
Estimated 1RM = weight × (1 + reps / 30)
```
Only valid for sets of 1-12 reps. Do not apply to sets > 12 reps.

This is a reference calculation only — CoachCW does not currently surface 1RM estimates to athletes. When implemented (Feature 055+), calculation must be server-side.

---

### Personal Best

A **personal best (PB)** for an exercise is the highest estimated 1RM achieved across all completed sessions.

```
PB = max(weight × (1 + reps / 30)) across all completed sets for an exercise
```

Where multiple sets have equal estimated 1RM, the most recent is used.

**Rules:**
- PB is derived from completed sessions only — active or abandoned sessions excluded
- PB is scoped per athlete — never cross-athlete
- PB is calculated server-side — never client-side
- PB calculation ignores sets with `outcome: 'FAILED'`

---

### Consistency

**Consistency** measures how regularly an athlete is training.

CoachCW defines consistency as:
- **Sessions per week**: Count of completed sessions in each 7-day rolling window
- **Sessions per month**: Count of completed sessions in the current calendar month
- **Current streak**: Consecutive weeks with at least one completed session
- **Longest streak**: Longest run of consecutive weeks with at least one completed session

**Rules:**
- Timezone is the athlete's local timezone for week/month boundaries — not UTC
- A "week" starts on Monday (ISO week standard)
- Abandoned sessions do not count toward consistency
- Active sessions do not count until completed

---

### Progressive Overload

**Progressive overload** is the principle of gradually increasing training stimulus over time to drive adaptation.

In CoachCW context, progression can be:
- **Load progression**: Increasing weight over time for the same rep scheme
- **Volume progression**: Increasing total sets or reps
- **Density progression**: Same work in less time

**CoachCW current scope (MVP):** CoachCW surfaces history and metrics to help athletes track progression manually. Automated progression suggestions are post-MVP (Feature 057).

---

## Data Model Reference

### SessionLog

```typescript
{
  id: string,               // UUID
  athleteId: string,        // Internal — never exposed at API boundary
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED',
  startedAt: Date,
  completedAt: Date | null,
  notes: string | null,
  deletedAt: Date | null,   // Soft delete only
}
```

### ActualExerciseLog

```typescript
{
  id: string,               // UUID
  sessionLogId: string,
  exerciseId: string,       // References Exercise catalog
  orderIndex: number,       // Position within session
  notes: string | null,
}
```

### ActualSetLog

```typescript
{
  id: string,               // UUID
  exerciseLogId: string,
  setNumber: number,        // 1-indexed within exercise
  weight: number | null,    // kg
  reps: number | null,
  rpe: number | null,       // 1-10
  outcome: 'COMPLETED' | 'FAILED' | 'PARTIAL',
}
```

### Exercise

```typescript
{
  id: string,               // UUID — stable identity
  name: string,             // Display name — may change
  aliases: string[],        // Alternative names for search
  category: string,         // e.g. 'STRENGTH', 'CARDIO'
  muscleGroups: string[],   // Primary muscles targeted
  isSystem: boolean,        // true = canonical, false = custom
  ownerId: string | null,   // null for system exercises
  retiredAt: Date | null,   // null = active
}
```

---

## Units & Measurement

### Storage Rule (NON-NEGOTIABLE)

**All measurements are stored in metric units regardless of user preference.**

- Weight: **kg** (kilograms), stored as `number` with up to 2 decimal places
- Distance: **m** (metres), stored as `number` with up to 2 decimal places
- Height: **cm** (centimetres), stored as `number` with up to 1 decimal place

User unit preference is stored on the user account (`unitPreference: 'METRIC' | 'IMPERIAL'`). It controls display only — never storage.

**Why:** Changing a user's preference must never require a data migration. All calculations (volume, PB, consistency) operate on stored metric values directly.

---

### Display Conversion Rules

Conversion happens at the API response layer or frontend display layer — never in domain logic or database queries.

#### Weight: kg → lb

```
lb = kg × 2.20462
```

**Rounding rule for display:** Round to nearest **0.25 lb**.

```typescript
function kgToLb(kg: number): number {
  const raw = kg * 2.20462;
  return Math.round(raw * 4) / 4; // nearest 0.25
}

// Examples:
// 100 kg → 220.462 lb → display: 220.5 lb
// 20 kg  → 44.092 lb  → display: 44.0 lb
// 102.5 kg → 226.0 lb → display: 226.0 lb
```

**Why 0.25:** Standard barbell plates are available in 0.25 lb increments. Rounding to a finer value implies precision that doesn't exist in practice.

#### Weight: lb → kg (user input)

```
kg = lb / 2.20462
```

**Rounding rule for storage:** Round to nearest **0.25 kg** before storing.

```typescript
function lbToKg(lb: number): number {
  const raw = lb / 2.20462;
  return Math.round(raw * 4) / 4; // nearest 0.25
}

// Examples:
// 225 lb → 102.058 kg → store: 102.0 kg
// 135 lb → 61.235 kg  → store: 61.25 kg
```

#### Height: cm → ft/in

```
totalInches = cm / 2.54
feet = Math.floor(totalInches / 12)
inches = totalInches % 12
```

**Rounding rule for display:** Round inches to nearest **0.5 in**. Display as `5'11"` or `5'11.5"`.

```typescript
function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const rawInches = totalInches % 12;
  const inches = Math.round(rawInches * 2) / 2; // nearest 0.5
  return { feet, inches };
}

// Examples:
// 180 cm → 5'11.0"
// 175 cm → 5'8.9" → display: 5'9.0"
```

#### Height: ft/in → cm (user input)

```
cm = (feet × 12 + inches) × 2.54
```

**Rounding rule for storage:** Round to nearest **0.5 cm** before storing.

#### Distance: m → miles or km

```
km   = m / 1000
miles = m / 1609.344
```

**Rounding rule for display:** Round to **2 decimal places** for both km and miles.

---

### Unit Labels

Always display the unit label alongside the value. Never show a bare number.

| Context | Metric display | Imperial display |
|---|---|---|
| Weight (set log) | `100 kg` | `220.5 lb` |
| Bodyweight | `85 kg` | `187.5 lb` |
| Height | `180 cm` | `5'11"` |
| Distance (short) | `400 m` | `0.25 mi` |
| Distance (long) | `5.00 km` | `3.11 mi` |

---

### User Input

When a user logs a weight in imperial, the frontend:
1. Accepts the value in lb
2. Converts to kg using `lbToKg()` rounding rule
3. Sends kg to the API

The API always receives and stores kg. It never receives lb.

When displaying back to the user, the API returns kg and the frontend converts for display.

**Never send imperial values to the API.**

---

### Unit Preference Change

When a user changes their `unitPreference`:
- No data migration required or permitted
- All stored values remain in metric
- Display layer re-converts from stored metric using the new preference
- Historical entries display correctly in the new unit automatically

---

## Naming Conventions

Use these terms consistently across code, APIs, specs, and UI copy.

| ✅ Correct | ❌ Avoid | Why |
|---|---|---|
| Session | Workout, Training | "Session" is the CoachCW term |
| Exercise | Movement, Activity | Consistent with catalog naming |
| Set | Round | "Set" is standard fitness terminology |
| Rep | Repetition | "Rep" is the standard abbreviation |
| Weight | Load (in UI copy) | "Weight" is clearer to athletes; "load" is technical |
| Complete a session | Finish, End | "Complete" matches the status enum |
| Personal best | PR, Record | "PB" is the CoachCW term |
| Athlete | User (in domain code) | "Athlete" in domain; "user" at auth boundary only |

---

## Business Rules

These rules are invariants — they must be enforced server-side.

| Rule | Description |
|---|---|
| One active session | An athlete may have at most one ACTIVE session at a time |
| Completed sessions are immutable | Completed session data is not modified — corrections create a new revision |
| Soft delete only | Sessions and exercise logs are never hard deleted |
| Exercise ownership | Custom exercises are only visible to their owner athlete. System exercises are visible to all athletes. Coach-scoped exercise visibility (coach creates exercise, visible to all their athletes) is future scope — do not implement until the role/permission system exists. |
| Set order is stable | Set numbers within an exercise are 1-indexed and stable once logged |
| No empty sessions | A session must have at least one exercise log to be completed |
| Abandoned sessions excluded | Abandoned sessions are excluded from all metrics and history |

---

## What CoachCW Does NOT Do (Current Scope)

These are explicitly out of scope until the Intelligence Foundation features (054+):

- Automated progression recommendations
- Real-time form feedback
- Nutrition tracking
- Heart rate or wearable integration
- Program generation
- Periodisation planning
- Fatigue or recovery scoring

Do not model, spec, or implement any of the above until the relevant roadmap feature is active.

---

## Related Skills

- `backend-data-ownership` — ownership rules for all domain data
- `migration-safety` — schema changes to domain models
- `spec-writer` — writing specs that correctly use domain terminology
- `feature-development` — implementation workflow for domain features

## Related Principles

- **Constitution — Execution vs Planning Authority**: Sessions are independent of programs
- **Constitution VI** (Backend Authority): All calculations server-side
- **Constitution — Zero-State Validity**: No sessions/exercises is a valid state