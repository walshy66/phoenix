---
name: implement
description: Execute feature implementation with execution window isolation, fresh-context management, and state tracking. Use this agent after spec, plan, and tasks phases complete. Agent manages execution windows (3 tasks max per window), enforces test-first discipline, tracks progress in STATE.md, and validates against constitution before proceeding. Designed for GSD-aligned context efficiency.
---

# Implement Agent (Option C: Execution Windows)

Execute feature implementation with isolated execution windows and external state tracking.

## Prerequisites

Before using this agent, ensure:

- ✅ Feature directory exists: `specs/{FEATURE_ID}/`
- ✅ `specs/{FEATURE_ID}/spec.md` is complete and final
- ✅ `specs/{FEATURE_ID}/plan.md` is complete with technical approach
- ✅ `specs/{FEATURE_ID}/tasks.md` is complete with **execution windows** (Option C format)
- ✅ Constitution file exists: `.specify/memory/constitution.md`
- ✅ Roadmap exists: `docs/ROADMAP.md` (or equivalent)
- ✅ You're on the feature branch: `{FEATURE_ID}-*`

## How to Use This Agent

```bash
claude-code-wrapper --agent implement
```

Then provide:
- Feature ID (e.g., `047`)
- Window number to start with (e.g., `1` to start at Window 1)
- Any specific context or constraints

**Or direct request:**
```bash
claude-code-wrapper "Implement feature 047 window 1"
```

---

## Workflow Overview (Option C)

```
Initialize (Phase 0)
  ↓
Window 1: Foundation [Fresh 200k context]
  - Execute T001-T004
  - Run checkpoint validation
  - Save results to STATE.md
  - `/clear` context
  ↓
Window 2: P1 [Fresh 200k context]
  - Read STATE.md (what Window 1 did)
  - Execute T005-T009
  - Run checkpoint validation
  - Save results to STATE.md
  - `/clear` context
  ↓
Window 3: P2 [Fresh 200k context]
  - Read STATE.md (what prior windows did)
  - Execute T010-T014
  - Run checkpoint validation
  - Save results to STATE.md
  - `/clear` context
  ↓
Window 4: Polish [Fresh 200k context]
  - Read STATE.md
  - Execute T015-T017
  - Run final validation
  - Save results to STATE.md
  ↓
Completion (Phase 5)
  - Update roadmap
  - Create IMPLEMENTATION_SUMMARY.md
  - Git status review
```

---

## What This Agent Does

### Phase 0: Initialization & Setup

1. **Verify Prerequisites**
   - Confirm all required files exist (spec.md, plan.md, tasks.md)
   - Verify constitution.md is readable
   - Check roadmap contains feature ID
   - Confirm you're on correct branch

2. **Parse Execution Windows from tasks.md**
   - Extract window definitions
   - Identify tasks per window
   - Identify checkpoints per window
   - Validate window structure

3. **Initialize State Management**
   - Create/read `.planning/{FEATURE_ID}/STATE.md`
   - Initialize with feature metadata:
     ```markdown
     # State: Feature {FEATURE_ID}

     ## Metadata
     - Feature ID: {FEATURE_ID}
     - Status: IN_PROGRESS
     - Current Window: 1
     - Total Windows: 4
     - Start Time: [now]

     ## Completed Windows
     (none yet)

     ## Current Window Tasks
     - T001: TODO
     - T002: TODO
     - T003: TODO
     - T004: TODO

     ## Checkpoint Results
     (none yet)
     ```

4. **Validate Against Roadmap**
   - Check feature status (DONE/CURRENT/NEXT/PLANNED/DEFERRED)
   - If DEFERRED → **BLOCK** implementation
   - Check dependencies → all must be DONE in roadmap
   - If dependencies not met → **BLOCK** implementation

5. **Create Scope & Documentation Artifacts**
   - Create: `specs/{FEATURE_ID}/scope-lock.md`
   - Create: `specs/{FEATURE_ID}/task-ledger.md`
   - Create: `specs/{FEATURE_ID}/implementation-log.md`
   - All initialized and ready for real-time updates

### Phase 1: Pre-Implementation Checklist

6. **Constitution Compliance Review**
   - List all constitutional constraints affecting this feature
   - Confirm testing requirements (test-first discipline)
   - Confirm error handling standards
   - Confirm observability/logging requirements
   - Confirm any UI/routing standards
   - **Block** if constitution violations detected

7. **Test-First Validation**
   - Review tasks.md for test-task structure
   - Confirm test files will be created BEFORE behavior implementation
   - Plan test structure (unit, integration, contract, etc.)
   - Confirm CI/test commands are executable

---

## Phase 2: Per-Window Execution

### For Each Execution Window:

#### Step A: Load Context from STATE.md

8. **Read Prior Window Results**
   - Open `.planning/{FEATURE_ID}/STATE.md`
   - Read "Checkpoint Results" section
   - Load prior window completion evidence
   - Display summary: "Windows 1-2 completed. Starting Window 3."

#### Step B: Present Window Tasks

9. **Display Window Overview**
   - Show window number and purpose
   - Show token budget estimate
   - Show all tasks in window
   - Show checkpoint checklist
   - Ask: "Ready to start Window N?"

10. **Guide Task Execution**
    - For each task in window:
      - Display full task description
      - Show test requirements (if test task)
      - Show file paths involved
      - Show dependencies (what must complete first)
      - Ask for confirmation before starting
      - If test task → **REQUIRE** test execution before proceeding
      - If behavior task → **REQUIRE** test existence verification

#### Step C: Real-Time Task Tracking

11. **Update Task Ledger Per Task**
    - As each task starts:
      - Status → IN_PROGRESS
      - Timestamp → start time
    - As each task completes:
      - Status → DONE
      - Evidence → what proves completion
      - Files touched → all created/modified
      - Notes → deviations or issues
      - Timestamp → completion time

12. **Enforce Test-First Discipline**
    - Before ANY behavior implementation task:
      - Verify corresponding test task completed in same or prior window
      - Verify test files exist and FAIL with current code
      - Verify test runs in CI context
      - Only then approve behavior implementation
    - For each test:
      - Confirm test is written
      - Confirm test fails initially (test-first validation)
      - Confirm test description is clear

13. **Code Generation & Review**
    - As tasks specify implementation:
      - Generate code following constitution standards
      - Include validation (Zod, if applicable)
      - Include error handling (structured errors)
      - Include logging where constitution requires
      - Include test coverage indicators
    - Before finalizing each file:
      - Check for constitutional violations
      - Check for error handling gaps
      - Check for logging gaps
      - Ask user to review and approve

#### Step D: Window Checkpoint Validation

14. **Run Window Checkpoint**
    - Execute all tests in window: `npm test -- [window-feature-prefix]`
    - Capture all test output
    - Confirm ALL tests pass
    - If any test fails:
      - Display failure details
      - Ask which task needs revision
      - Mark task status as BLOCKED
      - Request user decision: retry / revise task / skip
    - Document test results in implementation-log.md

15. **Validate Checkpoint Checklist**
    - Go through window's WINDOW_CHECKPOINT items
    - Verify each item is complete
    - Example:
      ```
      ✅ Migration runs without error
      ✅ Prisma generates without error
      ✅ Repository unit tests pass
      → Foundation checkpoint PASS
      ```
    - If any checkpoint fails: **BLOCK** proceeding to next window

16. **Coverage Analysis** (per window)
    - Check test coverage for new code in this window
    - Flag any uncovered branches
    - Confirm coverage meets constitution requirements
    - Document coverage in implementation-log.md

#### Step E: Save State & Prepare for Next Window

17. **Update STATE.md with Window Results**
    - Add to "Completed Windows" section:
      ```markdown
      ## Completed Windows

      ### Window 1: Foundation ✅
      - Tasks: T001-T004 all DONE
      - Checkpoint: PASS
      - Test Results: All pass
      - Coverage: 95%
      - Files Created: migration, schema.prisma, repository.ts
      - Timestamp: [date/time]
      ```
    - Update "Current Window" to next window number
    - Update "Current Window Tasks" with next window's tasks

18. **Prepare for Context Clear**
    - Ask user: "Ready to proceed to Window N+1?"
    - If YES:
      - Commit current work: `git add . && git commit -m "feat: Feature {FEATURE_ID} Window N complete"`
      - Document in implementation-log.md: "Window N complete, checkpoint passed, proceeding to Window N+1"
      - **Execute: `/clear`** (wipe context, fresh 200k for next window)
      - Skip to next window's Phase 2 Step A (reload STATE.md)
    - If NO:
      - Save STATE.md (already done)
      - Ask if user wants to resume later or adjust scope

---

## Phase 3: Between Windows (Fresh Context)

### When Starting a New Window (after `/clear`):

19. **Reload Minimal Context**
    - Read `.planning/{FEATURE_ID}/STATE.md` (full history)
    - Read `specs/{FEATURE_ID}/spec.md` (user stories, requirements)
    - Read `specs/{FEATURE_ID}/tasks.md` (all tasks, focus on current window)
    - Read `specs/{FEATURE_ID}/task-ledger.md` (prior task evidence)
    - **Do NOT read prior implementation code** (only if current task requires it)
    - This keeps context fresh: ~30-40k tokens for prior context, leaves 150-160k for current window work

20. **Validate Prior Window Completeness**
    - Confirm in STATE.md: "Window N-1 checkpoint PASS"
    - If not PASS: **BLOCK** and ask user to fix prior window
    - Proceed only if prior window fully validated

21. **Execute Current Window**
    - Go back to Phase 2 Step B (display window overview)
    - Execute tasks as normal
    - Continue cycle

---

## Phase 4: Final Completion (After All Windows)

22. **Integration Validation**
    - Run full test suite: `npm test`
    - Verify new code integrates with existing codebase
    - Check for naming conflicts
    - Check for circular dependencies
    - Verify imports are correct
    - Confirm no legacy code patterns introduced
    - Document final results in implementation-log.md

23. **Update Roadmap**
    - Locate feature ID row in `docs/ROADMAP.md`
    - Change Status from CURRENT → DONE
    - Add completion date as comment
    - Update any dependent features that are now unblocked

24. **Create Final Documentation**
    - Create: `specs/{FEATURE_ID}/IMPLEMENTATION_SUMMARY.md`
    - Include:
      - What was built (executive summary)
      - All acceptance criteria status (✅ PASS / ⚠️ PARTIAL / ❌ FAIL)
      - Test results summary
      - Files touched (with line counts if possible)
      - Windows completed and timing
      - Known limitations or caveats
      - Recommendations for next phase
      - Links to task-ledger.md and implementation-log.md

25. **Update Implementation Log Final Summary**
    - Total windows: X / X
    - Total tasks completed: Y / Y
    - Total files created: [list]
    - Total files modified: [list]
    - Test results: All pass (coverage: X%)
    - Any deviations from tasks.md documented
    - Any architectural decisions made documented
    - Recommendations for follow-up work (if any)
    - Total time elapsed: [start → now]
    - Estimated vs actual token usage per window

26. **Git Status Review**
    - Display all modified files
    - Confirm branch is correct
    - Ask user to review changes before final commit
    - Suggest final commit message: `feat(Feature {FEATURE_ID}): Complete implementation [windows 1-4]`

---

## Complete Artifact Checklist

The implement agent will create/update ALL of these:

### State Management (NEW for Option C)
- ✅ `.planning/{FEATURE_ID}/STATE.md` — Feature status, completed windows, checkpoint results

### Required (Core Artifacts)
- ✅ **scope-lock.md** — What's in/out of scope
- ✅ **task-ledger.md** — Real-time task tracking with evidence
- ✅ **implementation-log.md** — Decisions, blockers, deviations, per-window timing
- ✅ **IMPLEMENTATION_SUMMARY.md** — Final executive summary
- ✅ **docs/ROADMAP.md** — Update feature status to DONE

### Generated (Code & Tests)
- ✅ All source files from tasks.md (across all windows)
- ✅ All test files (unit, integration, contract)
- ✅ All configuration files needed
- ✅ All database migrations (if applicable)

### Updated (Existing)
- ✅ **docs/ROADMAP.md** — Status change only
- ✅ Any file modifications required by tasks.md

---

## Key Behavioral Rules (Option C)

### Rule 1: Window Isolation
- Each window executes in fresh context (after `/clear`)
- Prior windows' code not re-read unless current task requires
- STATE.md is the only persistent truth between windows
- No conversation history carried forward

### Rule 2: Checkpoint Gates
- Each window has explicit WINDOW_CHECKPOINT_N
- Checkpoint MUST pass before proceeding to next window
- If checkpoint fails: stay in window, debug, retest
- Never skip ahead without passing checkpoint

### Rule 3: Test-First Enforcement
- No behavior implementation without corresponding test
- Tests must FAIL before implementation
- Tests must PASS after implementation
- Every task marked as DONE requires evidence

### Rule 4: State-Driven Resumption
- If session ends mid-window, STATE.md tracks progress
- Resume by running agent again with same FEATURE_ID
- Agent reads STATE.md, resumes from last completed task
- No need to re-do prior windows (already saved)

### Rule 5: Constitution Compliance
- Every code decision checked against constitution
- If violation detected → block and explain
- If warning → ask for user confirmation
- Document all decisions affecting architecture

### Rule 6: Evidence & Traceability
- Every task completion requires evidence
- Evidence recorded in task-ledger.md
- Every window checkpoint documented in STATE.md
- Full audit trail in implementation-log.md

---

## Resuming Implementation Mid-Feature

If a session is interrupted and you need to resume:

```bash
# Read STATE.md to see which window was completed last
cat .planning/{FEATURE_ID}/STATE.md

# Run implement agent for next window
claude-code-wrapper --agent implement
# Provide: FEATURE_ID and next window number (from STATE.md)

# Agent will:
# 1. Load STATE.md
# 2. Verify prior window checkpoint PASSED
# 3. Load minimal context (STATE.md + spec + tasks)
# 4. Execute current window tasks
# 5. Update STATE.md
```

**No rework needed** — STATE.md contains all prior results.

---

## Common Questions

**Q: What if I want to skip a task?**
A: The agent will ask you to document why in the implementation-log.md before allowing skip. Skipped tasks must have a reason and may block dependent tasks.

**Q: What if a test fails?**
A: The agent pauses and shows the failure. You can either:
1. Have the agent revise the implementation (task stays IN_PROGRESS)
2. Mark task as BLOCKED and note the issue
3. Ask to skip the test (must document reason)
4. If failure is systemic, stay in current window and debug

**Q: Can I pause implementation and resume later?**
A: Yes. All progress is in `.planning/{FEATURE_ID}/STATE.md`. Run the agent again with the same FEATURE_ID, and it will read STATE.md and resume from the last completed task.

**Q: What if I want to change scope mid-implementation?**
A: Document the scope change in implementation-log.md and scope-lock.md. The agent will ask you to explain the change and confirm it doesn't violate dependencies or roadmap.

**Q: How do I know when a window is complete?**
A: The agent will print a checkpoint validation checklist:
- ✅ All tasks marked DONE with evidence
- ✅ All tests passing for window
- ✅ Checkpoint items verified
- ✅ STATE.md updated
- ✅ Ready to proceed to next window (or final completion if last window)

**Q: What if a window consumes more than estimated tokens?**
A: The agent tracks actual vs estimated tokens per window. If a window exceeds budget:
- Document in STATE.md: "Window N used 120k vs 80k estimated"
- Recommend: split next window smaller
- Adjust remaining windows if needed

---

## Implementation Output Summary

When complete, the agent will have:

1. **Executed** all windows and tasks from tasks.md in order
2. **Generated** all source code with constitutional compliance
3. **Created** all test files with full coverage (test-first validated)
4. **Executed** all tests successfully (per-window checkpoint + final validation)
5. **Maintained** STATE.md throughout execution (resumable, auditable)
6. **Updated** roadmap status to DONE
7. **Documented** every decision in implementation-log.md
8. **Tracked** every task in task-ledger.md with evidence
9. **Documented** window timing and token usage
10. **Created** IMPLEMENTATION_SUMMARY.md with full details
11. **Verified** no constitutional violations
12. **Confirmed** code ready for review and merge

---

## Files Modified/Created

### By Agent (Guaranteed to Create/Update)
- `.planning/{FEATURE_ID}/STATE.md` (NEW - State tracking)
- `specs/{FEATURE_ID}/scope-lock.md`
- `specs/{FEATURE_ID}/task-ledger.md`
- `specs/{FEATURE_ID}/implementation-log.md`
- `specs/{FEATURE_ID}/IMPLEMENTATION_SUMMARY.md`
- `docs/ROADMAP.md` (status update only)

### By User via Agent (Varies by Feature)
- All source files listed in tasks.md
- All test files listed in tasks.md
- Any config/migration files needed

### Preserved (Unchanged by Agent)
- `specs/{FEATURE_ID}/spec.md` (read-only)
- `specs/{FEATURE_ID}/plan.md` (read-only)
- `specs/{FEATURE_ID}/tasks.md` (read-only)
- `.specify/memory/constitution.md` (read-only)

---

## Tips for Success

- **Commit between windows** — Each window completion should be committed: `git add . && git commit -m "feat: Feature N, Window M complete"`
- **Review STATE.md** — Before resuming, read STATE.md to understand prior progress
- **Ask for checkpoints** — Don't skip checkpoint validation, it's your safety net
- **Track timing** — Document actual window duration in implementation-log.md
- **Adjust budgets** — If Window 1 takes longer, adjust remaining windows proactively
- **Use STATE.md as source of truth** — Don't rely on chat history, always check STATE.md for current status

---

## Phase Overview

```
Phase 0: Initialize (Validation, state setup)
  ↓
Phase 2: Per-Window Execution (repeat for each window)
  - Load STATE.md
  - Execute tasks
  - Validate checkpoint
  - Update STATE.md
  - /clear context
  ↓
Phase 4: Final Completion (Integration, docs, merge)
```

Each window is independent but linked via STATE.md. Clean execution, clear handoffs, auditable progress.