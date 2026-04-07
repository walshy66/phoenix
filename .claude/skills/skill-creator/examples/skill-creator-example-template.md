# Skill Creation Template

Use this as a starting point when creating a new skill.

## Step 1: YAML Frontmatter

```yaml
---
name: skill-name-here
description: [One sentence of what it does]. Use when [trigger scenarios]. Always use this skill when [situation].
---
```

## Step 2: Headline & When to Use

```markdown
# Skill Name Here

Clear, action-oriented description of what this skill does.

## When to Use This Skill

- Creating/building X
- Reviewing/auditing X
- Fixing/refactoring X
- Validating X
```

## Step 3: Core Principles

```markdown
## Core Principles

1. **Principle One**: Explanation of why this matters
2. **Principle Two**: How this works
3. **Principle Three**: Non-negotiable rule
```

## Step 4: How to Use

```markdown
## How to Use This Skill

### Option 1: Quick Usage
```bash
claude-code-wrapper --agent [agent-name]
# Then describe what you want
```

### Option 2: Specific Request
```bash
claude-code-wrapper "Create X following skill-name pattern"
```
```

## Step 5: Workflow

```markdown
## Complete Workflow

### Phase 1: Input & Understanding
1. Read context (constitution, relevant docs)
2. Ask clarifying questions
3. Understand requirements

### Phase 2: Implementation
1. Step 1: ...
2. Step 2: ...
3. Step 3: ...

### Phase 3: Validation
1. Check quality
2. Verify completeness
3. Summarize output
```

## Step 6: Output Format

```markdown
## Output Format

When complete, the skill will deliver:

- **File 1**: Description
- **File 2**: Description
- **Report**: Summary of what was done

Example output:
```json
{
  "status": "complete",
  "files_created": [...],
  "summary": "..."
}
```
```

## Step 7: Quality Checks

```markdown
## Quality Checks

Before considering this skill complete:

- [ ] Check 1
- [ ] Check 2
- [ ] Check 3
- [ ] Check 4
- [ ] Check 5
```

## Step 8: Troubleshooting

```markdown
## Troubleshooting

**Q: Common question?**  
A: Answer with specific guidance

**Q: Another common issue?**  
A: Specific solution
```

---

## Example: Complete Minimal Skill

Here's a minimal skill that follows all rules:

### Folder Structure
```
.claude/skills/example-skill/
├── SKILL.md (200 lines)
├── examples/
│   └── sample-output.json
└── references/
    └── checklist.json
```

### SKILL.md (Minimal)

```markdown
---
name: example-skill
description: Do something useful. Use when you need X, Y, or Z.
---

# Example Skill

Do something useful with clear, repeatable patterns.

## When to Use This Skill

- Need to accomplish X
- Want to validate Y
- Building Z

## Core Principles

1. Always start with understanding
2. Follow established patterns
3. Validate before completion

## Workflow

1. **Input**: Understand what's needed
2. **Process**: Apply the pattern
3. **Output**: Deliver result

See `references/checklist.json` for validation rules.

## Output Format

Returns: Updated file or audit report

Example: See `examples/sample-output.json`

## Quality Checks

- [ ] Follows established pattern
- [ ] Validated against requirements
- [ ] No placeholders or TODOs

## Troubleshooting

**Q: How do I extend this?**  
A: Create a new skill or modify references/
```

### references/checklist.json

```json
{
  "checks": [
    {
      "id": "check-1",
      "description": "Verify X is done",
      "signals": ["evidence"]
    }
  ]
}
```

### examples/sample-output.json

```json
{
  "status": "complete",
  "summary": "Example output showing what skill produces"
}
```

---

## File Sizing Guide

| File Type | Ideal Size | When to Move to references/ |
|-----------|------------|---------------------------|
| SKILL.md | <500 lines | Move detailed checklists, long examples |
| Checklist | <100 items | Keep reference files under 100 items |
| Examples | 2-5 files | Each showing different use case |
| Scripts | Minimal | Keep to essential automation only |

---

## Naming Examples

### ✅ Good Names
- `error-semantics-enforcer` (clear action + domain)
- `auth-flow-designer` (domain + verb)
- `test-integrity-checker` (domain + purpose)
- `backend-data-ownership` (domain-focused)
- `migration-safety-auditor` (purpose + domain)

### ❌ Bad Names
- `error_handler` (underscore, vague)
- `ErrorHandler` (not lowercase, camelCase)
- `the-error-handler` (article, too long)
- `error-handling-and-validation-tool` (too long, vague)
- `misc-utilities` (not action-oriented)

---

## Common Structure Mistakes

| Mistake | Fix |
|---------|-----|
| YAML frontmatter on line 2 | Move to line 1, remove blank line |
| name: ErrorHandler | Change to name: error-handler (kebab-case) |
| Folder: error-handler, name: errorHandler | Match exactly: both kebab-case |
| SKILL.md is 800 lines | Move excess to references/ folder |
| No "Use when..." in description | Add specific trigger phrases |
| Examples don't work (syntax errors) | Use real, tested code |
| Code examples use placeholder paths | Use actual paths from project |

---

## Before Calling skill-creator Complete

Use this checklist:

```
Phase 1: Structure
- [ ] Folder name is kebab-case
- [ ] SKILL.md exists at root
- [ ] YAML frontmatter valid, line 1
- [ ] name matches folder exactly
- [ ] description includes "Use when..."

Phase 2: Content
- [ ] "When to Use" section present
- [ ] Core principles listed (3-5)
- [ ] Workflow is step-by-step
- [ ] Output format explicit
- [ ] Code examples are real and work

Phase 3: Organization
- [ ] references/ folder if needed
- [ ] examples/ folder with samples
- [ ] All files documented
- [ ] SKILL.md under 500 lines

Phase 4: Quality
- [ ] All links work (relative paths)
- [ ] No placeholder text
- [ ] Consistent terminology
- [ ] Related skills documented
```

Once all boxes checked → Skill is production-ready.