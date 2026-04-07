---
name: skill-creator
description: Create, refactor, or standardize Claude skills under `.claude/skills/` following modular structure with SKILL.md + bundled resources. Use when building new skills, standardizing existing skills, organizing reference materials, or enforcing naming/structure conventions. Always use this skill when creating skills to ensure consistency, proper YAML frontmatter, and high-quality documentation.
---

# Skill Creator

Create, refactor, and standardize Claude skills with consistent structure and high-quality documentation.

## When to Use This Skill

- Creating a brand new skill from scratch
- Refactoring or improving an existing skill
- Standardizing skill folder structure
- Adding or organizing reference materials
- Enforcing naming conventions across skills
- Migrating Codex skills to Claude format
- System-wide skill audit or update

## Skill Architecture (Non-Negotiable)

Every Claude skill follows this structure:

```
.claude/skills/{skill-name}/
├── SKILL.md                    (required - main skill file)
├── references/                 (optional - reference materials)
│   ├── checklist.json
│   ├── definitions.md
│   └── rules.json
├── examples/                   (optional - example outputs/use cases)
│   ├── template.md
│   ├── example-output.json
│   └── sample-audit.md
└── scripts/                    (optional - executable utilities)
    ├── validate.sh
    └── generate.py
```

### Why This Structure?

- **SKILL.md**: Always loaded first (metadata + instructions)
- **references/**: Heavy reference materials (loaded as needed)
- **examples/**: Sample outputs and templates (helps users understand expected results)
- **scripts/**: Executable code for deterministic tasks (don't load unless called)

This keeps SKILL.md lean (<500 lines) while making full documentation available.

---

## SKILL.md Requirements

### YAML Frontmatter (Lines 1-4)

```yaml
---
name: skill-name
description: [50-150 words describing what the skill does and when to use it]
---
```

**Rules:**
- MUST start at line 1 (no blank lines before)
- `name` MUST match folder name exactly (kebab-case)
- `description` MUST include "Use when..." trigger context
- Valid YAML only (no special characters in name/description without quotes)

### Body Structure

1. **Headline** — Descriptive title (same or similar to name)
2. **When to Use** — Bullet list of trigger scenarios
3. **Core Principles** — Non-negotiable rules for this skill (3-5)
4. **How to Use** — Usage examples with code blocks
5. **Complete Workflow** — Step-by-step process
6. **Output Format** — What the skill produces
7. **Common Patterns** — Reusable patterns or templates
8. **Validation/Quality Checks** — How to verify the skill was applied correctly
9. **Troubleshooting** — Common questions and answers
10. **Related Skills/Agents** — Dependencies or companion tools

### Style Guidelines

- **Imperative voice**: "Create...", "Verify...", "Audit..."
- **Concrete examples**: Show actual code, JSON, markdown
- **Clear paths**: Use exact file paths (e.g., `api/src/routes/` not `src/routes`)
- **Progressive disclosure**: Overview first, details in reference files
- **Scannable**: Use headers, code blocks, tables, bullet points
- **Link context**: Reference constitution, roadmap, or related artifacts

---

## Naming Conventions (Strict)

- **Folder name**: `kebab-case`, under 64 characters, no underscores
- **YAML `name`**: MUST exactly match folder name
- **Examples**:
  - ✅ `error-semantics-enforcer` (clear, action-oriented)
  - ✅ `auth-flow-designer` (domain + verb)
  - ✅ `backend-data-ownership` (domain-focused)
  - ❌ `error_handler` (underscore instead of kebab)
  - ❌ `ErrorHandler` (not lowercase)
  - ❌ `error-handler-and-validator` (too long, vague)

---

## Workflow: Creating a New Skill

### Phase 1: Define Intent

1. **Clarify trigger phrases**: When will users request this skill?
   - "Build a Fastify route"
   - "Audit test files for lifecycle violations"
   - "Design an auth flow"

2. **Choose a name**: Clear, action-oriented, kebab-case
   - From triggers above: `api-route-generator`, `test-integrity-checker`, `auth-flow-designer`

3. **Write 1-paragraph description**: Include "Use when..."
   - "Generate Fastify 5 routes with Zod validation, Prisma integration, and strict error handling. **Use when** building new API endpoints, adding validation, or structuring error responses."

### Phase 2: Outline the Skill Body

4. **List core principles** (3-5 non-negotiable rules)
   - Example: "All inputs validated with Zod", "Backend enforces all invariants"

5. **Document the workflow** (step-by-step process)
   - What does user input?
   - What does skill do?
   - What's the output?

6. **Create reference files** (if needed)
   - Checklists (JSON)
   - Definitions (Markdown)
   - Examples (JSON/Markdown)

### Phase 3: Write SKILL.md

7. **Start with frontmatter** (lines 1-4)

8. **Write body sections** (follow structure above)

9. **Keep SKILL.md under 500 lines**
   - If longer, move content to `references/`
   - Reference bundled files: "See `references/checklist.json` for full list"

10. **Include concrete examples**
    - Code blocks showing input/output
    - Real file paths
    - Actual command examples

### Phase 4: Create Supporting Files

11. **Add references/** (if content >100 lines)
    - `checklist.json`: Audits, checks, validation rules
    - `definitions.md`: Glossary, detailed rules
    - `rules.json`: Structured data for checks

12. **Add examples/** (always)
    - `template.md`: Template structure
    - `example-output.json`: Sample output
    - `sample-audit.md`: Example report

13. **Add scripts/** (if deterministic)
    - Validation scripts
    - Code generation utilities
    - Automation helpers

---

## Example: Creating error-semantics-enforcer

### Step 1: Intent
- **Trigger**: "Add error handling to this route"
- **Name**: `error-semantics-enforcer`
- **Description**: "Enforce Principle V (Observability & Error Semantics) by implementing clear, structured error responses and distinguishing recoverable errors from invariant failures. Use when building routes, services, or reviewing error handling for compliance."

### Step 2: Core Principles
1. Recoverable errors return clear user affordances (400/409 with retry suggestion)
2. Invariant failures halt and log (500 with explicit error code)
3. All API errors structured: `{ error: "CODE", message: "...", details?: {...} }`
4. Frontend wrapped in Error Boundary (prevents crash propagation)
5. Error semantics never change execution behavior (logging only)

### Step 3: Workflow
```
Input: Route handler or service method
  ↓
Identify failure type: recoverable vs invariant?
  ↓
Apply API standards (structured JSON)
  ↓
Apply UI standards (Error Boundary + user message)
  ↓
Output: Updated code with explicit error handling
```

### Step 4: Files
- `SKILL.md` — Main (complete instructions)
- `references/checklist.json` — Error classification matrix
- `examples/error-responses.json` — Standard response shapes
- `examples/error-audit-report.md` — Audit template

---

## Quality Checks

Before considering a skill complete:

- [ ] YAML frontmatter valid and starts at line 1
- [ ] `name` matches folder name exactly
- [ ] `description` includes "Use when..." triggers
- [ ] SKILL.md is under 500 lines (or content moved to references/)
- [ ] All code examples are real (actual paths, actual syntax)
- [ ] Workflow is step-by-step and actionable
- [ ] Trigger phrases are clear and testable
- [ ] Examples cover happy path AND edge cases
- [ ] Output format is explicit (JSON, Markdown, etc.)
- [ ] Related skills/agents are documented
- [ ] References/ files organized and documented
- [ ] No placeholder text or "TBD" sections
- [ ] Consistent terminology throughout
- [ ] Links to constitution, roadmap, or related docs where applicable

---

## Common Patterns

### Pattern 1: Audit/Review Skill
**Purpose**: Review code/docs for compliance

Structure:
- **When to Use**: Reviewing X, auditing Y, validating Z
- **Checklist**: JSON with checks and signals
- **Workflow**: Read → Check → Report
- **Output**: Audit report (status + findings)

Example: `test-integrity-checker`, `backend-data-ownership`

### Pattern 2: Code Generation Skill
**Purpose**: Generate code following standards

Structure:
- **When to Use**: Building X, implementing Y
- **Core Rules**: Non-negotiable patterns
- **Workflow**: Input → Generate → Output
- **Output**: Code files with templates

Example: `api-route-generator`

### Pattern 3: Design/Strategy Skill
**Purpose**: Make architectural decisions

Structure:
- **When to Use**: Designing X, planning Y
- **Principles**: Decision-making rules
- **Workflow**: Clarify → Design → Document
- **Output**: Architecture/design docs

Example: `auth-flow-designer`, `error-semantics-enforcer`

---

## System-Wide Refactor Mode

If explicitly instructed to refactor all skills:

1. **Scan** `.claude/skills/` for all folders
2. **Check** each for:
   - Valid YAML frontmatter at line 1
   - `name` matches folder name
   - Required metadata fields present
   - Kebab-case naming
   - File structure organized

3. **Standardize**:
   - Insert missing YAML frontmatter
   - Rename folders to kebab-case
   - Align `name` field with folder
   - Create `references/` and `examples/` if missing
   - Move long content to bundled files

4. **Report**: List all changes with rationale

---

## Validation Script (Optional)

If a skill includes validation, create `scripts/validate.sh`:

```bash
#!/bin/bash
# Validate skill structure and YAML

SKILL_DIR="$1"

# Check YAML frontmatter
head -5 "$SKILL_DIR/SKILL.md" | grep -q "^---" || exit 1

# Check folder/name match
FOLDER_NAME=$(basename "$SKILL_DIR")
YAML_NAME=$(grep "^name:" "$SKILL_DIR/SKILL.md" | cut -d' ' -f2)
[[ "$FOLDER_NAME" == "$YAML_NAME" ]] || exit 1

echo "✅ Skill structure valid"
```

---

## Troubleshooting

**Q: SKILL.md is too long (>500 lines)?**  
A: Move detailed checklists, examples, or reference material to `references/` and `examples/` folders. Link from SKILL.md with "See `references/checklist.json` for details."

**Q: Folder name doesn't match YAML `name`?**  
A: Update folder name to match (kebab-case). Example: rename `ErrorHandler/` to `error-semantics-enforcer/`.

**Q: No clear output format?**  
A: Define explicitly: "Output is a JSON audit report with status + findings" or "Output is updated route code with error handling."

**Q: Too many trigger phrases?**  
A: Pick 3-5 specific ones. Vague triggers (like "anything related to") dilute the skill.

**Q: When should I create a skill vs. an agent?**  
A: **Skills** are reusable, contextual tools (audit, generate, enforce patterns). **Agents** are sequential workflows (specify → design → plan → implement). Use agents for workflows, skills for modular tasks.

---

## Related Skills/Agents

- **skill-creator** (this skill) — Create and maintain skills
- **Any new skill** — Uses this skill-creator as reference

---

## References

- [Claude Skills Documentation](https://code.claude.com/docs/en/skills#configure-skills)
- [CoachCW Constitution](.specify/memory/constitution.md)
- [Related Skills](.claude/skills/)