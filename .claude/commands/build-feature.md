# /build-feature

Orchestrate the full CoachCW feature pipeline from local idea files to implementation.

## What This Command Does

Guides you through the complete pipeline in order:

```
Local Idea (docs/ideas/{slug}.md)
  ↓ design agent       — write spec.md from idea file
  ↓ design-reviewer    — validate spec structure and quality
  ↓ analyze agent      — audit for gaps, contradictions, missing edge cases
  ↓ clarify agent      — propose fixes, you approve/reject each
  ↓ plan agent         — write plan.md, data-model.md, contracts/, research.md
  ↓ tasks agent        — break plan into atomic tasks.md
  ↓ implement agent    — execute tasks, run tests, commit
  ↓ code-reviewer      — review implementation before merge
```

---

## Before You Start

Confirm the following before running any agent:

- [ ] Feature is marked **"Ready for Claude"** in Notion
- [ ] You are on the `main` branch (`git status`)
- [ ] Tests are passing (`cd api && npm test && cd ../app && npm test`)
- [ ] Docker DB is running (`docker compose -f docker/compose.db.yml ps`)

If any of these are not true — stop and resolve before proceeding.

---

## Step 1 — Handover

Run the handover agent to fetch the feature from Notion and create local files:

```
claude-code-wrapper --agent handover
```

The handover agent will:
- Search Notion for features marked "Ready for Claude"
- Let you pick if multiple exist
- Create `specs/{feature-slug}/FEATURE.md` and `specs/{feature-slug}/spec.md`
- Scan the codebase for relevant context automatically
- Merge the handover branch to main

**When complete:** You will see a success message with the feature slug and next steps.

Then:
```bash
git checkout -b {feature-slug}
```

Mark the feature **"In Design"** in Notion.

---

## Step 2 — Design

Run the design agent to write the full spec:

```
claude-code-wrapper --agent design {feature-slug}
```

The design agent reads `FEATURE.md` and writes a complete `spec.md` covering:
summary, user stories, functional requirements, non-functional requirements,
acceptance criteria, edge cases, and constitutional compliance.

**When complete:** Review `specs/{feature-slug}/spec.md` before proceeding.
The spec must make sense to you — you are the approver, not just a reviewer.

---

## Step 3 — Design Review

Run the design-reviewer agent to validate spec quality:

```
claude-code-wrapper --agent design-reviewer {feature-slug}
```

The reviewer checks structure, testability, traceability, and constitutional compliance.
It will output APPROVED, NEEDS REVISION, or BLOCKED with specific findings.

**If NEEDS REVISION or BLOCKED:** Address findings before proceeding to analyze.
**If APPROVED:** Continue.

---

## Step 4 — Analyze

Run the analyze agent to audit the spec for gaps:

```
claude-code-wrapper --agent analyze {feature-slug}
```

The analyzer identifies contradictions, missing edge cases, under-specified
requirements, and constitutional risks.

**When complete:** Review findings. Minor gaps are resolved in the clarify step.
Significant gaps may require returning to design.

---

## Step 5 — Clarify

Run the clarify agent to resolve outstanding issues:

```
claude-code-wrapper --agent clarify {feature-slug}
```

The clarify agent proposes specific fixes for each issue found in analyze.
**You approve or reject each fix.** This is a back-and-forth loop — run it
until the spec is tight and all open questions are resolved.

**When complete:** The spec is locked. No further spec changes after this point
without restarting from design.

Commit the finalised spec:
```bash
git add specs/{feature-slug}/
git commit -m "spec: finalise {feature-slug} spec"
```

---

## Step 6 — Plan

Run the plan agent to produce the implementation plan:

```
claude-code-wrapper --agent plan {feature-slug}
```

The plan agent writes:
- `specs/{feature-slug}/plan.md` — implementation approach and architecture
- `specs/{feature-slug}/data-model.md` — schema changes and data structures
- `specs/{feature-slug}/contracts/` — contract definitions
- `specs/{feature-slug}/research.md` — any open technical questions resolved

**When complete:** Review `plan.md`. Verify the approach matches your intent
before breaking it into tasks.

---

## Step 7 — Tasks

Run the tasks agent to break the plan into atomic tasks:

```
claude-code-wrapper --agent tasks {feature-slug}
```

The tasks agent writes `specs/{feature-slug}/tasks.md` — an ordered list of
atomic, independently testable implementation tasks.

**When complete:** Review `tasks.md`. Each task should be small enough to
complete in one focused session. If any task feels too large, ask the tasks
agent to break it down further before proceeding.

Commit the plan and tasks:
\```bash
git add specs/{feature-slug}/
git commit -m "plan: {feature-slug} plan and tasks ready"
\```

---

## ⛔ STOP — Review Gate Before Implementation

**Do not proceed to Step 8 until you have done all of the following:**

- [ ] Read `specs/{feature-slug}/spec.md` in full
- [ ] Read `specs/{feature-slug}/plan.md` in full
- [ ] Read `specs/{feature-slug}/tasks.md` in full
- [ ] You are satisfied the spec matches your intent
- [ ] You are satisfied the task list is the right scope
- [ ] You have no unresolved questions

**When you are ready to proceed, explicitly tell Claude:**
> "I've reviewed the plan for {feature-slug}. Proceed to implementation."

Claude will not start Step 8 until it receives that confirmation from you.

---

## Step 8 — Implement

Run the implement agent to execute the tasks:

```
claude-code-wrapper --agent implement {feature-slug}
```

The implement agent:
- Works through `tasks.md` in order
- Writes failing tests first (TDD — Red phase)
- Implements minimal code to pass tests (Green phase)
- Commits after each completed task

**Execution window discipline:** The implement agent runs a maximum of 3 tasks
per session. After 3 tasks, run `/clear` and restart with:
```
claude-code-wrapper --agent implement {feature-slug}
```
The agent reads `STATE.md` to resume where it left off.

**When complete:** All tasks marked `[x]` in `tasks.md`. All tests passing.

---

## Step 9 — Code Review

Run the code-reviewer agent before merging:

```
claude-code-wrapper --agent code-reviewer {feature-slug}
```

The reviewer produces a structured report with outcome:
- **APPROVED** — ready to merge
- **CHANGES REQUIRED** — fix findings, then re-run code-reviewer
- **BLOCKED** — do not merge until resolved

**When APPROVED:**
```bash
git checkout main
git merge {feature-slug}
git push origin main
```

Mark the feature **"Done"** in Notion.
Update `ROADMAP.md` status to `DONE`.

---

## Pipeline Status Reference

Use this to track where you are:

| Step | Agent | Output | Your Action |
|---|---|---|---|
| 1 | handover | FEATURE.md, spec stub | Mark "In Design", checkout branch |
| 2 | design | spec.md | Review and approve spec |
| 3 | design-reviewer | Review report | Address findings or continue |
| 4 | analyze | Gap analysis | Review findings |
| 5 | clarify | Resolved spec | Approve/reject each fix, commit spec |
| 6 | plan | plan.md, data-model.md | Review approach |
| 7 | tasks | tasks.md | Review task sizing, commit |
| 8 | implement | Working code, tests | Monitor, /clear every 3 tasks |
| 9 | code-reviewer | Review report | Fix findings or merge |

---

## If Something Goes Wrong

**Spec needs a major rework after analyze/clarify:**
→ Return to design agent. Re-run from Step 2.

**Implementation diverges from plan:**
→ Stop implement. Discuss with plan agent. Update plan.md before continuing.

**Tests failing after implementation:**
→ Do not merge. Fix in the same branch. Re-run code-reviewer.

**Notion MCP not responding:**
→ Run `/mcp` in Claude Code to check server status. Restart if needed.