# Linear Setup Checklist & Issue Template

## ✅ Setup Checklist (Do These First)

### Linear Project Setup
- [ ] Log into linear.app
- [ ] Create project: `CoachCW Features` (key: `CCW`)
- [ ] Delete default statuses
- [ ] Create custom statuses in order:
  - [ ] Handover (Unstarted, Blue)
  - [ ] Spec Draft (Unstarted, Purple)
  - [ ] Spec Finalized (Unstarted, Green)
  - [ ] Building (Started, Orange)
  - [ ] Review (Started, Yellow)
  - [ ] Done (Completed, Gray)
- [ ] (Optional) Create label group `pipeline-phase` with labels: foundation, intelligence-foundation, coach-expansion

### Claude Code Setup
- [ ] Open terminal and run: `claude mcp add linear https://mcp.linear.app/mcp`
- [ ] Verify: `claude mcp list` (should show `linear`)
- [ ] (Optional) Generate Linear API key: Settings → Security & access → Personal API keys
- [ ] (Optional) Export API key: `export LINEAR_API_KEY="your_token_here"`
- [ ] (Optional) Create `.claude/skills/linear/SKILL.md` from the template in the setup guide

### First Issue
- [ ] Create a test issue in Linear to verify everything works
- [ ] Update its status from `Handover` to `Spec Draft` to test the workflow

---

## Issue Template for Handover Docs

When you finish a feature handover doc here in Claude.ai, use this template to create the Linear issue:

### Linear Issue Template

**Title:**
```
Feature {ID}: {Feature Name}
```

Example:
```
Feature 054: Exercise Block & Tempo Persistence
```

**Description:**
```markdown
## Raw Idea
{Copy the "Raw Idea" section from the handover doc here}

## Why It Matters
{Copy relevant context}

## What Done Looks Like
{Acceptance criteria}

## Main Flow
{The core user action}

## Non-Goals
{Explicit scope boundaries}

## Context & Dependencies
- Depends on: Feature {ID} (if applicable)
- Roadmap order: {number}
- Related: Feature {ID}, Feature {ID}

## Edge Cases & Known Gotchas
{Any invariants, constraints, or tricky scenarios}

## Open Questions
{Unresolved questions or decisions needed}

## Handover Doc Source
Created in Claude.ai chat session on {date}
Full doc location: `/ideas/{slug}.md` (after you copy it to the repo)

---

**Status**: Handover
**Priority**: High / Medium / Low
**Labels**: [pipeline-phase label if applicable]
```

### Example: Feature 054

```markdown
## Raw Idea
Persist exercise block data (sets, reps, actual weight, tempo) deterministically across session lifecycle. 
Tempo is optional/null-valid. Once a session is COMPLETED, blocks are immutable.

## Why It Matters
Enables performance signal engine (Feature 055) to read corrected, finalized session history. 
Powers progression suggestions and plateau detection downstream.

## What Done Looks Like
- ExerciseBlock table with explicit schema (setNumber, repTarget, actualReps, weight, tempo)
- Session can't be COMPLETED until all required fields are populated
- Tempo optional; blocks persist even if tempo is null
- Blocks immutable post-COMPLETED (invariant enforced server-side)

## Main Flow
User logs a set in session → data written to ExerciseBlock → on completion, block locked.

## Non-Goals
- Auto-calculating tempo from sensor data (future)
- Visualization of tempo trends (future, Feature 058)
- Equipment change splitting (deferred to Feature 055 decision)

## Context & Dependencies
- Depends on: Feature 053 (Session Revisioning & Audit Integrity)
- Roadmap order: 54
- Enables: Feature 055 (Performance Signal Engine), Feature 056 (Fatigue Detection)

## Edge Cases & Known Gotchas
- Tempo is nullable — test both null and populated cases
- Blocks immutable post-COMPLETED — prevent accidental edits after fact
- Multiple sets per exercise — ordering must be deterministic (setNumber)
- Session correction (post-completion edit) must NOT create duplicate blocks

## Open Questions
- Should tempo validation reject impossible values (e.g., 10-second eccentrics)? Or log warnings?
- Multi-set exercise: allow bulk-add or one-by-one only?

## Handover Doc
Created: 2026-03-27
Location: `/ideas/feature-054.md`
```

---

## How to Fill In the Linear Issue

1. **Title field**: Copy the feature name with ID
2. **Description field**: Paste the full markdown block above
3. **Status**: Set to `Handover`
4. **Priority**: `High` for blockers, `Medium` for feature work, `Low` for nice-to-haves
5. **Labels**: Add `intelligence-foundation` or your pipeline phase (if created)
6. **Click Create**

Linear auto-assigns the key (CCW-1, CCW-2, etc.).

---

## Workflow Transitions (Update Status As You Go)

### From "Handover" to "Spec Draft"
When you move from chat to Claude Code spec phase:
```
Status: Spec Draft
Add comment: "Starting spec phase in Claude Code. Branch: feature/054-exercise-blocks"
```

### From "Spec Draft" to "Spec Finalized"
When spec is locked and ready to build:
```
Status: Spec Finalized
Add comment: "Spec complete. Spec file: /specs/feature-054/spec.md. Ready for build phase."
```

### From "Spec Finalized" to "Building"
When Claude Code starts implementation:
```
Status: Building
Assign to: You (optional)
Add comment: "Implementation started. Git branch: feature/054-exercise-blocks"
```

### From "Building" to "Review"
When PR is opened:
```
Status: Review
Add comment: "PR: #123 opened. Tests: ✅ All passing."
```

### From "Review" to "Done"
When PR is merged:
```
Status: Done
Add comment: "Merged to main. Commit: abc123def456"
```

---

## Five Features in Parallel

Once you have 5 features created, your Linear dashboard shows:

```
CCW-1: Feature 054 — Spec Finalized ✅
CCW-2: Feature 055 — Spec Draft 🔄
CCW-3: Feature 056 — Handover 📝
CCW-4: Feature 057 — Handover 📝
CCW-5: Feature 058 — Backlog 📋
```

At a glance, you know:
- Which 1 is ready to build (CCW-1)
- Which 2 are being specced (CCW-2)
- Which 3 are waiting for handover work (CCW-3, CCW-4, CCW-5)

No more hunting through chat threads or spreadsheets.

---

## Quick Commands (After MCP is Set Up)

Once Linear MCP is enabled, you can ask Claude Code:

```
"What's the status of all 5 CoachCW features?"
```

Claude Code will fetch from Linear and show:

```
CCW-1: Feature 054 - Exercise Block & Tempo Persistence
Status: Spec Finalized
Priority: High
Created: 2026-03-27

CCW-2: Feature 055 - Exercise Performance Signal Engine
Status: Spec Draft
...
```

Or filter for just ones ready to build:

```
"Show me features in Spec Finalized status"
```

Result:
```
CCW-1: Feature 054 — Spec Finalized
```

---

## Why This Works for Your Use Case

1. **Chat happens here** → You define intent with me in natural language
2. **Linear holds the record** → Issue is the canonical version, always up to date
3. **Claude Code reads Linear** → When you start a build, Claude Code knows what you're working on
4. **Status is visible** → You glance at Linear and know the 5 features at a glance
5. **No manual copy-paste loops** → Linear MCP lets Claude Code fetch issues directly

You avoid:
- ❌ Copying specs between chat and files
- ❌ Losing track of which feature is where
- ❌ Forgetting to update a tracker somewhere
- ❌ Tab-switching between tools

---

## Gotchas to Avoid

1. **Create issues in the right project** — Make sure you're creating them in "CoachCW Features", not another project
2. **Don't mix MCP with manual API calls** — Stick to one method (Linear web UI, Linear CLI, or MCP through Claude Code)
3. **Comment updates, don't edit** — Add comments to keep an audit trail; don't edit issue description after creation
4. **Issue key goes in commits** — Format commit messages as `feat: feature 054 [CCW-1]` so Linear can auto-link to PRs (Phase 6)

---

## Day 1 Checklist

- [ ] Set up Linear project and statuses (15 min)
- [ ] Enable Linear MCP in Claude Code (5 min)
- [ ] Create one test issue, move it through statuses to verify workflow (5 min)
- [ ] Read the full setup guide once (10 min)
- [ ] You're done. Proceed with building features.

Total: ~35 minutes for a working system.

---
