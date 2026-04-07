---
name: migration-safety
description: Audit Prisma schema or migration changes for destructive operations, data loss risk, and safe rollout strategy. Use when modifying schema.prisma, generating migrations, reviewing DB changes, or adding new fields. Detects breaking changes, missing defaults, enum compatibility issues, and provides rollback strategies before changes are applied.
---

# Migration Safety Auditor

Protect database integrity and historical data by auditing schema changes before applying migrations.

## When to Use This Skill

- Adding new fields to existing tables
- Modifying enum values or constraints
- Reviewing migration files before applying
- Renaming or deleting columns (rare, but critical)
- Dropping tables or fields
- Changing field types or nullability
- Planning data backfill strategies

## Core Principles

1. **Detect Breaking Changes**: Flag any DROP, RENAME, or DELETE operations
2. **Default Values**: New required fields must have defaults or backfill plans
3. **Enum Safety**: Enum changes must not break existing application logic
4. **Data Preservation**: No historical athlete data or training logs lost
5. **Rollback Ready**: Every migration has a documented rollback strategy

## Safety Checks

### Check 1: Drop/Rename Detection
Detects destructive operations:
- `DROP TABLE`
- `DROP COLUMN`
- `RENAME COLUMN`
- `ALTER TABLE` (breaking changes)

**Question**: "This change will affect existing data in [Table]. Do you have a backup or a migration plan?"

### Check 2: Required Field Defaults
New mandatory fields must have one of:
- A `@default` value in schema
- A backfill migration plan documented
- An application-level default

**Question**: "New required field [fieldName] detected. What's the migration strategy for existing rows?"

### Check 3: Enum Safety
Enum changes must not break existing logic:
- Adding new enum values is safe (if code handles gracefully)
- Removing enum values is dangerous (breaks existing data references)
- Renaming enum values requires code updates first

**Question**: "Enum change detected. Are all existing values still valid in application code?"

## Workflow

1. **Present the Change**
   - Show schema diff or migration SQL
   - Highlight any destructive operations in red

2. **Run Safety Checks**
   - Check for DROP/RENAME operations
   - Verify new required fields have defaults
   - Validate enum changes against existing code

3. **Ask Clarifying Questions**
   - For destructive changes: "Is this intentional?"
   - For new fields: "What's the backfill strategy?"
   - For enums: "Will this break existing data?"

4. **Output Report**
   - Status: `[READY]` or `[BLOCKED]`
   - Findings: Specific risks with file/line references
   - Mitigations: Required steps to proceed safely
   - Rollback Plan: How to undo this migration if needed

## Output Format

```markdown
# Migration Safety Audit

**Status**: [READY] / [BLOCKED]

## Findings

1. [Risk description with file/line reference]
2. [Specific data impact analysis]

## Mitigations Required

- [ ] [Action required before applying migration]
- [ ] [Backup strategy]
- [ ] [Rollback procedure]

## Enum/Default Validation

| Field | Type | Risk | Mitigation |
|-------|------|------|-----------|
| fieldName | Breaking | Data loss if... | Add @default or backfill |

## Rollback Plan

How to undo this migration:
- Migration down command
- Data restoration steps (if applicable)
- Application redeploy order

## Notes

- Assumptions made during audit
- Context for future reference
- Links to related migrations
```

## Decision Tree

```
Is this change destructive (DROP/RENAME)?
├─ YES → BLOCKED (ask for backup/rollback plan)
└─ NO → Continue

Is this adding a new required field?
├─ YES → Check for @default or backfill plan
│        ├─ Has default/plan → OK
│        └─ No default/plan → BLOCKED
└─ NO → Continue

Is this modifying an enum?
├─ YES → Check existing code for enum usage
│        ├─ All values still valid → OK
│        └─ Values removed/renamed → BLOCKED (needs code updates first)
└─ NO → Continue

Result: [READY]
```

## Common Patterns

### Safe: Adding Optional Field
```prisma
model ActualSessionLog {
  // ✅ SAFE: Optional field, no default needed
  notes String?
}
```
**Audit Result**: ✅ READY

### Safe: Adding Required Field with Default
```prisma
model ActualSessionLog {
  // ✅ SAFE: Has @default, existing rows get value
  noteType NoteType @default(COMPLETION)
}
```
**Audit Result**: ✅ READY

### Blocked: Adding Required Field without Default
```prisma
model ActualSessionLog {
  // ❌ BLOCKED: No default, existing rows will fail
  notes String  // Missing @default(...)
}
```
**Audit Result**: 🛑 BLOCKED — Needs default or backfill plan

### Blocked: Removing Enum Value
```prisma
enum NoteType {
  COMPLETION
  // ❌ BLOCKED: Removing CONFIGURATION breaks existing data
  // (was: CONFIGURATION COMPLETION)
}
```
**Audit Result**: 🛑 BLOCKED — Need data migration first

## Before & After Checklist

### Before Applying Migration

- [ ] All safety checks passed (Status: READY)
- [ ] Rollback plan documented
- [ ] Backup created (if destructive)
- [ ] Code changes deployed (if enum changes)
- [ ] Team aware of migration plan

### After Applying Migration

- [ ] Migration applied successfully
- [ ] No data loss confirmed
- [ ] Application running with new schema
- [ ] Rollback plan verified (but not executed)
- [ ] Audit report archived

## Questions to Ask

**For new fields:**
- "What's the expected value for existing rows?"
- "Is a backfill migration needed?"
- "Should the field have a default?"

**For destructive changes:**
- "Can this data be recovered from backup?"
- "Is this column truly unused?"
- "What's the rollback plan?"

**For enum changes:**
- "Will this enum value appear in existing data?"
- "Can application code handle all enum values?"
- "Do we need a data migration?"

## Rollback Strategy Examples

### Safe Rollback (Optional Field)
```bash
# Undo: Simply remove the migration and schema change
git revert {migration_commit}
npx prisma migrate deploy
# No data loss, no issues
```

### Complex Rollback (Field with Data)
```bash
# Undo: Create down migration to restore column
# 1. Create down migration manually
# 2. Restore data from backup if needed
# 3. Deploy and test
```

## Related Requirements

- **Constitution II (Test-First)**: Migration must have tests verifying data integrity
- **Constitution VI (Backend Authority)**: Schema is single source of truth
- **Constitution VII (Lifecycle)**: Migrations are immutable once applied — get them right the first time