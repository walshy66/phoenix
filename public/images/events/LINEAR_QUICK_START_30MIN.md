# 30-Minute Quick Start: Linear + Claude Code

**Goal**: Set up Linear, enable MCP, create your first feature issue, and verify the workflow works.

---

## Minute 1–5: Linear Project Setup

### 1. Open Linear
- Go to https://linear.app
- Click **Projects** → **Create project**
- Name: `CoachCW Features`
- Key: `CCW`
- Click **Create**

### 2. Define Custom Statuses
- Inside CoachCW Features, go **Settings** → **Issue statuses & automations**
- Delete the default statuses (Backlog, Todo, In Progress, Done, Canceled)
- Create these 6 statuses in this order:

```
Handover      (Unstarted, Blue)
Spec Draft    (Unstarted, Purple)
Spec Finalized (Unstarted, Green)
Building      (Started, Orange)
Review        (Started, Yellow)
Done          (Completed, Gray)
```

**How**: Click **+** → type name → pick category + color → **Create**

When done, you should see:
```
Unstarted: Handover > Spec Draft > Spec Finalized
Started: Building > Review
Completed: Done
```

---

## Minute 6–10: Enable Linear MCP in Claude Code

### 1. Open Terminal
```bash
claude mcp add linear https://mcp.linear.app/mcp
```

### 2. Verify
```bash
claude mcp list
```

You should see `linear` in the output. If it says "connection may fail," that's fine — restart Claude Code and try again.

### 3. (Optional) Add Linear API Key
If you want Claude Code to create/update issues programmatically:

- Go to Linear → **Settings** → **Security & access** → **Personal API keys**
- Click **Create new** → Name it `Claude Code` → **Create**
- Copy the token
- Add to your shell:
  ```bash
  export LINEAR_API_KEY="your_token_here"
  ```
  
Add this line to `~/.bashrc` or `~/.zshrc` so it persists.

---

## Minute 11–20: Create Your First Feature Issue

### 1. In Linear, Click "Create Issue" (or press `C`)

Fill in:
- **Title**: `Feature 054: Exercise Block & Tempo Persistence`
- **Description**: Paste your handover doc (the one I'll give you after this chat)
- **Status**: `Handover` (should be default)
- **Priority**: `High`

Click **Create**

Linear auto-assigns: `CCW-1`

### 2. Test the Status Transitions

- Click on the issue
- Change status from `Handover` → `Spec Draft` (click the status dropdown)
- Change it back to `Handover`

**Why**: Verify statuses work and are in the right order.

### 3. Copy the Issue URL

- Right-click on `CCW-1` and copy the link
- Paste it into a note — this is your feature's home for now

---

## Minute 21–25: Verify Linear MCP Works

### 1. Open Claude Code
```bash
claude
```

### 2. Ask Claude to Read the Issue

Type:
```
Show me all issues in the CCW project
```

Claude Code should respond with something like:
```
I'll fetch the issues from the CCW project for you.

CCW-1: Feature 054: Exercise Block & Tempo Persistence
Status: Handover
Priority: High
Created: 2026-03-27

Total: 1 issue
```

**If this works**: Linear MCP is connected. ✅

**If it fails**: 
```bash
# Try restarting Claude Code
exit
claude
# And ask again
```

---

## Minute 26–30: Document Your Workflow

### 1. Save This Checklist

Create a file in your repo:
```bash
touch docs/LINEAR_WORKFLOW.md
```

Paste this content:

```markdown
# Linear Workflow for CoachCW Features

## Status Definitions

- **Handover** (Blue): Chat doc created, awaiting spec work
- **Spec Draft** (Purple): Spec being written in Claude Code
- **Spec Finalized** (Green): Ready for implementation
- **Building** (Orange): In Claude Code implementation
- **Review** (Yellow): PR/review stage
- **Done** (Gray): Merged and shipped

## Workflow

1. **Chat** → Define feature intent here
2. **Linear** → Create issue, paste handover doc, set Handover
3. **Claude Code** → Start spec phase, update to Spec Draft
4. **Claude Code** → Finalize spec, update to Spec Finalized
5. **Claude Code** → Build, update to Building → Review → Done
6. **GitHub** → Merge PR, issue auto-closes (if configured)

## How to Create an Issue

1. Go to linear.app → CoachCW Features project
2. Click **Create issue** (or press `C`)
3. Title: `Feature {ID}: {Name}`
4. Description: Paste handover doc from chat
5. Status: `Handover`
6. Priority: High/Medium/Low
7. Click **Create**

## How to Update Status

Click the issue → Click the status dropdown → Select new status

No need to ask me — it's automatic in Linear.

## How to Check What's Ready to Build

In Claude Code:
```
Show me all CCW issues with Spec Finalized status
```

Claude Code will fetch and display them.

## 5 Features in Parallel

Keep all 5 feature issues open in Linear. Update each as it progresses through the workflow.

Example after 1 week:
```
CCW-1: Feature 054 — Done ✅
CCW-2: Feature 055 — Review 🔄
CCW-3: Feature 056 — Building
CCW-4: Feature 057 — Spec Finalized
CCW-5: Feature 058 — Handover
```

You know at a glance what's where.
```

### 2. You're Done

Seriously. That's the setup. No more configuration needed.

---

## What You Have Now

| Tool | Purpose |
|------|---------|
| **Linear** | Single source of truth for feature status |
| **Claude Code** | Reads Linear via MCP, implements features |
| **This Chat** | Ideation and handover docs |
| **Your Repo** | Source code, specs, plans |

---

## Ready to Start?

### Next: Create Feature 054 Issue

When you're ready, provide me with Feature 054's handover doc (from your current thinking), and I'll give you a summary to copy into Linear. You'll create `CCW-1` and you're live.

### Then: Repeat 4 More Times

For Features 055–058, repeat the same process:
1. Chat here for handover
2. Create Linear issue
3. Copy to `/ideas/` folder in repo

Once all 5 are in Linear as `Handover`, you can start specing them in parallel in Claude Code.

---

## Troubleshooting (Quick Fixes)

| Problem | Fix |
|---------|-----|
| Linear MCP not connecting | `claude mcp disable linear` then re-add it |
| Issue not showing up | Make sure you're in CoachCW Features project, not another one |
| Can't change status | Verify custom statuses are created in Settings |
| Claude Code can't read Linear | Make sure MCP is enabled (`claude mcp list`) |

---

## One More Thing

Once you've done this, you never have to worry about "where's feature X in the pipeline?" Linear shows you at a glance:

```
/path/to/linear.app/project/CCW
```

All 5 features, their status, blockers, and next steps. No spreadsheet. No hunting through notes.

---

**You're all set. Go create that first Linear project. When you're done, tell me "Linear is live" and we'll start the first feature handover.**

