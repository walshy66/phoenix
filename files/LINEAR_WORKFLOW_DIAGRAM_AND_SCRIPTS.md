# Linear Option B: Workflow & Automation

## Visual Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CHAT (Claude.ai)                                │
│                                                                      │
│  You: Define feature intent                                         │
│  Claude: Refine, ask clarifying questions                           │
│  Output: Handover doc (copied to your clipboard)                    │
└─────────────────┬───────────────────────────────────────────────────┘
                  │
                  │ Copy handover doc
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                       LINEAR                                        │
│                                                                      │
│  Create issue: Feature {ID}: {Name}                                 │
│  Paste: Handover doc in description                                 │
│  Status: Handover (blue)                                            │
│  Result: CCW-1, CCW-2, ... CCW-5                                    │
└─────────────────┬───────────────────────────────────────────────────┘
                  │
                  │ 5 features ready to spec
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                  CLAUDE CODE (Spec Phase)                           │
│                                                                      │
│  /build-feature feature-054                                         │
│  ↓                                                                   │
│  Claude Code reads Linear issue (MCP)                               │
│  ↓                                                                   │
│  Writes: spec.md, plan.md, tasks.md                                 │
│  ↓                                                                   │
│  Updates Linear: Spec Draft → Spec Finalized                        │
└─────────────────┬───────────────────────────────────────────────────┘
                  │
                  │ Repeat for up to 5 features in parallel
                  │ (5 handovers → 5 specs → ready to build)
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                LINEAR DASHBOARD (Overview)                          │
│                                                                      │
│  CCW-1: Feature 054 — Spec Finalized ✅ (ready to build)            │
│  CCW-2: Feature 055 — Spec Finalized ✅ (ready to build)            │
│  CCW-3: Feature 056 — Spec Draft 🔄 (still writing)                 │
│  CCW-4: Feature 057 — Handover 📝 (new)                             │
│  CCW-5: Feature 058 — Backlog 📋 (not started)                      │
└─────────────────┬───────────────────────────────────────────────────┘
                  │
                  │ When ready to build, pick one
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│               CLAUDE CODE (Build Phase)                             │
│                                                                      │
│  /build-feature feature-054                                         │
│  ↓                                                                   │
│  Claude Code reads Linear (spec is ready)                           │
│  ↓                                                                   │
│  Implements feature                                                  │
│  ↓                                                                   │
│  Tests pass                                                          │
│  ↓                                                                   │
│  Updates Linear: Building → Review → Done                           │
│  ↓                                                                   │
│  Creates PR, merges                                                  │
└─────────────────┬───────────────────────────────────────────────────┘
                  │
                  │ Pick next feature from Linear
                  ↓
         [Repeat for CCW-2, CCW-3, ...]
```

---

## State Diagram: Feature Lifecycle

```
                    ┌─────────────┐
                    │  Handover   │ ← Created from chat
                    │   (Blue)    │
                    └──────┬──────┘
                           │
                           ↓
                    ┌─────────────────┐
                    │  Spec Draft     │ ← You're writing the spec
                    │   (Purple)      │
                    └──────┬──────────┘
                           │
                           ↓
                    ┌──────────────────┐
                    │ Spec Finalized   │ ← Ready for Claude Code to build
                    │   (Green) ✅      │
                    └──────┬───────────┘
                           │
                           ↓
                    ┌──────────────────┐
                    │  Building        │ ← In Claude Code implementation
                    │  (Orange)        │
                    └──────┬───────────┘
                           │
                           ↓
                    ┌──────────────────┐
                    │  Review          │ ← PR open, awaiting merge
                    │  (Yellow)        │
                    └──────┬───────────┘
                           │
                           ↓
                    ┌──────────────────┐
                    │  Done            │ ← Merged to main
                    │  (Gray)          │
                    └──────────────────┘
```

---

## Parallel Workflow Example

You can work on multiple features at different stages simultaneously:

**Monday:**
- Finish handover for Feature 054 → create CCW-1 (Handover)
- Finish handover for Feature 055 → create CCW-2 (Handover)

**Tuesday:**
- Start spec for 054 in Claude Code → update CCW-1 to Spec Draft
- Start spec for 055 in Claude Code → update CCW-2 to Spec Draft
- Finish handover for Feature 056 → create CCW-3 (Handover)

**Wednesday:**
- Finish spec for 054 → update CCW-1 to Spec Finalized ✅
- Finish spec for 055 → update CCW-2 to Spec Finalized ✅
- Start spec for 056 → update CCW-3 to Spec Draft

**Thursday:**
- Build 054 in Claude Code → update CCW-1 to Building
- Build 055 in Claude Code → update CCW-2 to Building
- Continue speccing 056

**Friday:**
- 054 done → update CCW-1 to Done ✅
- 055 in review → update CCW-2 to Review
- 056 ready for build → update CCW-3 to Spec Finalized

At any moment, Linear shows you the big picture:
```
CCW-1: Done ✅
CCW-2: Review (waiting for merge)
CCW-3: Building
CCW-4: Spec Draft (50% written)
CCW-5: Handover (new)
```

---

## Automation: Handover Doc → Linear Issue Script

If you want to automate creating Linear issues from your handover docs, here's a bash script:

### Setup

1. Save this script as `scripts/create-linear-issue.sh` in your repo

2. Make it executable:
```bash
chmod +x scripts/create-linear-issue.sh
```

3. Make sure `LINEAR_API_KEY` is set in your environment (see setup guide, Phase 2.3)

### The Script

```bash
#!/bin/bash

# create-linear-issue.sh
# Creates a Linear issue from a feature handover doc

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Defaults
PROJECT_KEY="CCW"
TEAM_ID="eng" # Adjust if your team has a different ID
DEFAULT_STATUS="Handover"
DEFAULT_PRIORITY="2" # Linear priority: 1=urgent, 2=high, 3=medium, 4=low

# Check for required env var
if [ -z "$LINEAR_API_KEY" ]; then
  echo -e "${RED}❌ LINEAR_API_KEY not set${NC}"
  echo "   Export it: export LINEAR_API_KEY='your_token_here'"
  exit 1
fi

# Parse arguments
FEATURE_ID=$1
FEATURE_NAME=$2
PRIORITY=${3:-$DEFAULT_PRIORITY}

if [ -z "$FEATURE_ID" ] || [ -z "$FEATURE_NAME" ]; then
  echo -e "${YELLOW}Usage:${NC} $0 <feature-id> <feature-name> [priority]"
  echo ""
  echo "Examples:"
  echo "  $0 054 'Exercise Block & Tempo Persistence'"
  echo "  $0 055 'Exercise Performance Signal Engine' 1"
  echo ""
  echo "Priority: 1=urgent, 2=high (default), 3=medium, 4=low"
  exit 1
fi

# Construct issue title
TITLE="Feature $FEATURE_ID: $FEATURE_NAME"

# Get description from stdin (pipe a doc in)
echo -e "${YELLOW}📝 Paste the handover doc content (Ctrl+D when done):${NC}"
DESCRIPTION=$(cat)

if [ -z "$DESCRIPTION" ]; then
  echo -e "${RED}❌ No description provided${NC}"
  exit 1
fi

# Escape quotes for JSON
DESCRIPTION=$(echo "$DESCRIPTION" | sed 's/"/\\"/g')

# Build GraphQL mutation
read -r -d '' MUTATION <<EOF || true
mutation {
  issueCreate(
    input: {
      teamId: "$TEAM_ID"
      title: "$TITLE"
      description: "$DESCRIPTION"
      priority: $PRIORITY
      labelIds: []
    }
  ) {
    issue {
      id
      identifier
      title
      url
    }
  }
}
EOF

echo -e "${YELLOW}📤 Creating Linear issue...${NC}"

# Call Linear GraphQL API
RESPONSE=$(curl -s -X POST \
  "https://api.linear.app/graphql" \
  -H "Authorization: Bearer $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$MUTATION" | jq -Rs .)}")

# Parse response
ISSUE_KEY=$(echo "$RESPONSE" | jq -r '.data.issueCreate.issue.identifier // empty')
ISSUE_URL=$(echo "$RESPONSE" | jq -r '.data.issueCreate.issue.url // empty')
ERROR=$(echo "$RESPONSE" | jq -r '.errors[0].message // empty')

if [ -n "$ERROR" ]; then
  echo -e "${RED}❌ Error creating issue:${NC}"
  echo "$ERROR"
  exit 1
fi

if [ -z "$ISSUE_KEY" ]; then
  echo -e "${RED}❌ Failed to create issue (no key returned)${NC}"
  echo "Response: $RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Issue created: $ISSUE_KEY${NC}"
echo "Title: $TITLE"
echo "URL: $ISSUE_URL"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Open: $ISSUE_URL"
echo "  2. Verify status is set to 'Handover'"
echo "  3. Update status to 'Spec Draft' when you start speccing"

```

### Usage

Once the script is set up:

```bash
# Create an issue for Feature 054
scripts/create-linear-issue.sh 054 "Exercise Block & Tempo Persistence"

# The script prompts you to paste the handover doc
# Paste it, press Ctrl+D, and the issue is created
```

Or pipe a file directly:

```bash
# If you saved the handover doc to a file
scripts/create-linear-issue.sh 054 "Exercise Block & Tempo Persistence" < /tmp/handover.md
```

### What It Does

1. Takes feature ID and name as arguments
2. Prompts you to paste (or pipe) the handover doc
3. Calls Linear's GraphQL API with your API key
4. Creates the issue in the `CCW` project
5. Returns the issue key (e.g., `CCW-1`) and URL

---

## Alternative: Manual (Simpler)

If scripts feel like overkill, just:

1. Create the issue in Linear web UI manually (takes 1 minute)
2. Paste the handover doc in the description
3. Set status to `Handover`

The automation is nice but not required. Linear's web UI is fast enough.

---

## Recommended: Alias for Convenience

Add this to your shell config (`~/.zshrc`, `~/.bashrc`, etc.):

```bash
# Linear issue creation alias
alias linear-issue='bash scripts/create-linear-issue.sh'
```

Then you can just run:

```bash
linear-issue 054 "Exercise Block & Tempo Persistence"
```

---
