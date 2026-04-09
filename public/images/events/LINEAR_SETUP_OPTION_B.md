# Linear + Claude Code Setup (Option B)

## Overview

Linear becomes your execution tracker. You create issues here, update them as features move through handover → spec → build → review → done. Claude Code reads Linear via MCP and can auto-populate what to build next.

**Setup time: ~30 minutes**

---

## Phase 1: Linear Project Setup (10 min)

### 1.1 Create the Project

1. Go to linear.app and log in
2. Click **Projects** in the sidebar
3. Click **Create project**
4. Name: `CoachCW Features`
5. Key: `CCW` (auto-generated, keep it)
6. Description: `Feature handover → spec → build pipeline`
7. Click **Create**

### 1.2 Define Custom Statuses

This replaces Linear's default (Backlog, Todo, In Progress, Done) with your pipeline stages.

1. Inside the CoachCW Features project, go **Settings** → **Issue statuses & automations**
2. You'll see the default workflow. Delete the defaults and create these six statuses in order:

| Status | Category | Color | Description |
|--------|----------|-------|-------------|
| Handover | Unstarted | Blue | Chat doc created, awaiting spec work |
| Spec Draft | Unstarted | Purple | Spec being written |
| Spec Finalized | Unstarted | Green | Ready for Claude Code to build |
| Building | Started | Orange | In Claude Code implementation |
| Review | Started | Yellow | PR/review stage |
| Done | Completed | Gray | Merged and shipped |

**How to create:**
- Click the **+** button to add a new status
- Type the name, select the category (Unstarted / Started / Completed), pick a color
- Click **Create**
- Drag to reorder if needed

When done, your workflow should look like:
```
Unstarted: Handover > Spec Draft > Spec Finalized
Started: Building > Review
Completed: Done
```

### 1.3 Add a "Pipeline Stage" Label Set (Optional but Useful)

This lets you tag features by domain later (e.g., "foundation", "intelligence-foundation", "coach-expansion").

1. Go **Settings** → **Labels**
2. Create a label group called `pipeline-phase`
3. Add labels:
   - `foundation`
   - `intelligence-foundation`
   - `coach-expansion`

---

## Phase 2: Enable Linear MCP in Claude Code (10 min)

### 2.1 Add Linear MCP Server

Open your terminal and run:

```bash
claude mcp add linear https://mcp.linear.app/mcp
```

This registers Linear's official MCP server with Claude Code.

### 2.2 Verify Connection

Exit Claude Code (or restart it), then run:

```bash
claude mcp list
```

You should see `linear` in the output. If it says "connection may fail," that's normal — Linear's docs note MCP is early stage. If it fails, try:
- Restarting Claude Code
- Disabling and re-enabling the server: `claude mcp disable linear` then `claude mcp add linear ...` again

### 2.3 (Optional) Set Linear API Key for Programmatic Access

If you want Claude Code to create/update Linear issues programmatically (not just read), generate an API key:

1. Linear → **Settings** → **Security & access** → **Personal API keys**
2. Click **Create new**
3. Name: `Claude Code`
4. Click **Create**
5. Copy the token (you won't see it again)
6. Add to your shell environment:
   ```bash
   export LINEAR_API_KEY="your_token_here"
   ```

Save this in `~/.bashrc`, `~/.zshrc`, or wherever you keep environment variables so it persists across sessions.

---

## Phase 3: Create Your First Feature Issue (5 min)

### 3.1 Create an Issue

1. In Linear, inside CoachCW Features project, click **Create issue** (or press `C`)
2. Fill out:
   - **Title**: `Feature 054: Exercise Block & Tempo Persistence`
   - **Description**: Paste your handover doc from this chat (or a summary)
   - **Status**: `Handover` (default)
   - **Priority**: `High` (or appropriate)
   - **Labels**: `intelligence-foundation` (optional)
3. Press **Enter** or click **Create**

Linear auto-assigns an issue key: `CCW-1`, `CCW-2`, etc.

### 3.2 Link the Issue to Roadmap Context (Optional)

Add a comment in the Linear issue with:
```
Depends on: Feature 053 (Session Revisioning)
Roadmap order: 54
Related features: 055, 056, 057
```

This gives Claude Code context when it reads the issue.

---

## Phase 4: Create a Linear-Reading Skill for Claude Code (Optional, 10 min)

This is a bonus: a skill that lets Claude Code read Linear issues and suggest what to build next.

### 4.1 Create the Skill File

Create this file in your project:

```bash
mkdir -p .claude/skills/linear
touch .claude/skills/linear/SKILL.md
```

### 4.2 Skill Content

```markdown
---
name: linear-feature-tracker
description: Read CoachCW Features from Linear and suggest next builds
tags: [linear, feature-tracking, roadmap]
---

# Linear Feature Tracker Skill

## Overview

This skill helps you track CoachCW features across handover → spec → build → review → done pipeline.

## When to Use

- **At session start**: `/features-status` to see all 5 features and where they are
- **When starting a build**: `/features-ready-to-build` to find which specs are finalized
- **When updating progress**: Update the Linear issue status as you work

## Commands

### View All Features

From Claude Code:

```bash
linear issues -p CCW --team CoachCW Features --format table
```

This shows all issues in the CoachCW Features project with their current status.

### Filter by Status

See only features ready to build:

```bash
linear issues -p CCW --status "Spec Finalized" --format table
```

### View a Specific Feature

```bash
linear issue CCW-1  # Shows full details of issue CCW-1
```

### Update an Issue Status

When you move a feature to the next stage (e.g., from "Spec Draft" to "Spec Finalized"):

```bash
linear issue update CCW-1 --status "Spec Finalized"
```

Or from Claude Code, use the Linear MCP tool directly:

```
I'll update the Linear issue status for you.
```

Then Claude Code calls the Linear MCP to transition it.

### Add a Comment

When you've completed a phase:

```bash
linear issue comment CCW-1 "Spec finalized. Ready for Claude Code. Handover doc: [link]"
```

## Workflow: Chat to Build

1. **Handover phase (this chat)**:
   - You create a Linear issue and set status to `Handover`
   - Copy your handover doc and paste it in the issue description

2. **Spec Draft phase**:
   - In Claude Code, open the issue
   - Update status to `Spec Draft`
   - Reference the issue when you start spec work

3. **Spec Finalized phase**:
   - When spec is locked in, update Linear to `Spec Finalized`
   - Add a comment linking to where the spec is stored (e.g., `specs/feature-054/spec.md`)

4. **Building phase**:
   - Assign the issue to yourself (or keep it as context)
   - Update status to `Building`
   - Reference the issue in your commit messages: `git commit -m "feat: feature 054 [CCW-1]"`

5. **Review phase**:
   - Update status to `Review`
   - Paste PR link in a comment

6. **Done**:
   - Merge PR
   - Update Linear to `Done`
   - Linear auto-archives or you manually close

## Example: Reading Features at Session Start

In Claude Code, start a session and ask:

```
Show me all CoachCW features and their current status.
```

Claude can then use the Linear MCP to fetch issues and display:

```
CCW-1: Feature 054 — Spec Finalized (ready to build)
CCW-2: Feature 055 — Spec Draft (still writing)
CCW-3: Feature 056 — Handover (new)
CCW-4: Feature 057 — Building (in progress)
CCW-5: Feature 058 — Review (waiting on PR review)
```

## Linear MCP Tools (Available via Linear MCP)

These are built-in to the Linear MCP. Claude Code can call them:

- **getIssue(issueKey)**: Get full details of a single issue
- **listIssues(projectKey, status?)**: List all issues, optionally filtered by status
- **updateIssue(issueKey, fields)**: Update title, status, description, priority, labels
- **createIssue(project, title, description, status?, priority?)**: Create a new feature issue
- **addComment(issueKey, comment)**: Post a comment on an issue
- **getProject(projectKey)**: Get project details and available statuses

## Pro Tips

- **Commit message format**: Include the issue key in every commit: `CCW-1` appears in your git history
- **Batch updates**: If you're moving multiple features, do it in one session to avoid context ping-pong
- **Linear as source-of-truth**: Always check Linear for what's ready next. Don't assume from memory.
- **Comments as audit trail**: Each phase transition (spec → build, build → review) gets a comment. This is your log.

---
```

### 4.3 Enable the Skill in Claude Code

Add this to your `.claude/settings.json`:

```json
{
  "skills": [
    {
      "path": ".claude/skills/linear/SKILL.md"
    }
  ]
}
```

Now Claude Code will load this skill automatically and can reference it when you ask about feature status.

---

## Phase 5: Workflow Integration (Ongoing)

### 5.1 Your New Chat → Build Loop

1. **Here (Claude.ai)**:
   - Chat with me about feature intent
   - Refine until handover doc is ready
   - I create a summary for you to copy

2. **Linear**:
   - Create new issue in CoachCW Features project
   - Paste handover doc in description
   - Set status to `Handover`

3. **Claude Code (Spec Phase)**:
   - Open new session with `/build-feature {feature-slug}`
   - Claude Code reads the Linear issue (via MCP)
   - Creates spec, plan, tasks
   - Updates Linear status to `Spec Draft` → `Spec Finalized`

4. **Claude Code (Build Phase)**:
   - Run `/build-feature` again or new session
   - Claude Code fetches Linear issue and reads `Spec Finalized` status
   - Implements feature
   - Updates Linear to `Building` → `Review` → `Done`

5. **Tracking 5 in Parallel**:
   - Each feature is its own Linear issue (CCW-1 through CCW-5)
   - Linear dashboard shows all 5 and their current stage at a glance
   - No more context switching between chat and spreadsheet

### 5.2 Sample Session Flow

**Start of day in Claude Code:**

```
You: "Show me what's ready to build next"

Claude Code: "Let me check Linear for you.
 
CCW-1: Feature 054 — Spec Finalized ✅ (ready to build)
CCW-2: Feature 055 — Spec Finalized ✅ (ready to build)
CCW-3: Feature 056 — Spec Draft 🔄 (still writing)
CCW-4: Feature 057 — Handover 📝 (new)
CCW-5: Feature 058 — Backlog 📋 (not started)

You have 2 features ready to build."

You: "Start CCW-1"

Claude Code: [reads CCW-1 issue, sees spec doc link, starts building]
```

---

## Phase 6: Optional — Auto-Status Updates with Hooks (Advanced)

If you want Claude Code to automatically update Linear when you commit, add a git hook:

### 6.1 Create a Post-Commit Hook

```bash
# .git/hooks/post-commit
#!/bin/bash

# Extract Linear issue key from commit message
ISSUE_KEY=$(git log -1 --format=%B | grep -o "CCW-[0-9]\+")

if [ -n "$ISSUE_KEY" ]; then
  # Update Linear issue to "Review" status when commit is made
  linear issue update $ISSUE_KEY --status "Review"
  echo "Updated $ISSUE_KEY in Linear"
fi
```

Make it executable:

```bash
chmod +x .git/hooks/post-commit
```

Now every time you commit with a message like `"feat: feature 054 [CCW-1]"`, Linear auto-updates.

**Note**: This requires `LINEAR_API_KEY` in your environment (from Phase 2.3).

---

## Quick Reference

| Phase | Action | Tool | Status |
|-------|--------|------|--------|
| Chat | Define feature intent | Claude.ai (here) | Handover |
| Create | Make Linear issue | Linear | Handover |
| Spec Write | Write spec.md | Claude Code | Spec Draft |
| Spec Lock | Finalize spec | Claude Code | Spec Finalized |
| Build | Implement feature | Claude Code | Building |
| Review | Open PR | Claude Code | Review |
| Merge | Merge PR | GitHub | Done |

---

## Troubleshooting

### Linear MCP not connecting?

```bash
claude mcp disable linear
claude mcp add linear https://mcp.linear.app/mcp
# Restart Claude Code
```

### Issue key not showing up?

Make sure you're in the CoachCW Features project when you create the issue. Linear auto-assigns keys per project.

### Want to see all 5 features at once?

Go to Linear, filter by project = CoachCW Features. You'll see a table of all issues with their current status.

### Can I use the Linear web dashboard instead of CLI?

Yes. All the same actions (create, update status, add comments) work in the web UI. The CLI commands are just faster alternatives.

---

## Next Steps

1. **Today**: Set up Linear project + custom statuses (Phase 1)
2. **Today**: Enable Linear MCP in Claude Code (Phase 2)
3. **Next feature**: Create first issue, run through handover → spec → build loop
4. **After 2–3 features**: Consider adding the skill (Phase 4) for faster status queries
5. **When ready**: Add git hook for auto-updates (Phase 6)

You don't need everything on day one. Start with phases 1–2 and grow into the rest as you find rhythm.

---
