# Migration Safety Audit Report

**Feature**: [FEATURE_ID]  
**Date**: [DATE]  
**Reviewer**: Claude Migration Safety Auditor  
**Status**: [READY] / [BLOCKED]

---

## Changes Summary

[Brief description of what's changing in the schema]

---

## Safety Checks Results

### ✅ / ❌ Check 1: Destructive Operations

**Signal Search**: DROP TABLE, DROP COLUMN, RENAME COLUMN, ALTER TABLE

**Finding**: [Describe any destructive operations found, or "No destructive operations detected"]

**Risk Level**: [CRITICAL / HIGH / LOW / NONE]

**Mitigation** (if applicable):
- [ ] Backup created before migration
- [ ] Rollback procedure documented
- [ ] Data restoration plan in place

---

### ✅ / ❌ Check 2: New Field Defaults

**Signal Search**: new `required` fields, `@default` annotations, `NOT NULL` constraints

**Findings**:
| Field | Table | Type | Default | Risk | Mitigation |
|-------|-------|------|---------|------|-----------|
| [fieldName] | [table] | required | [has/@default/none] | [risk] | [mitigation] |

**Risk Level**: [HIGH / LOW / NONE]

---

### ✅ / ❌ Check 3: Enum Safety

**Signal Search**: Enum definitions, enum usage in code

**Findings**:
- Enum values added: [list new values] (Safe - application code handles new values)
- Enum values removed: [list removed values] (⚠️ Risk - may break existing data references)
- Enum values renamed: [list renames] (⚠️ Risk - existing data will be invalid)

**Risk Level**: [HIGH / LOW / NONE]

**Code Impact Analysis**:
- Locations using this enum: [files/line numbers]
- Will new/removed values break existing logic? [YES / NO]

**Mitigation** (if removing/renaming):
- [ ] Application code updated to handle changes
- [ ] Data migration plan created
- [ ] Existing data audit completed

---

### ✅ / ❌ Check 4: Nullability Changes

**Finding**: [Any fields converting between required/optional]

**Risk Level**: [HIGH / LOW / NONE]

---

## Impact Analysis

### Data Impact
- **Existing rows affected**: [count or description]
- **Data loss risk**: [YES / NO]
- **Rollback difficulty**: [EASY / MEDIUM / HARD]

### Application Impact
- **Code changes required**: [YES / NO]
- **Breaking changes**: [List any]
- **Deployment order**: [schema first/code first/simultaneous]

---

## Rollback Plan

### Undo Procedure
```bash
# Step 1: Revert migration
git revert {migration_commit_hash}

# Step 2: Deploy down migration
npx prisma migrate deploy

# Step 3: Restore data (if applicable)
# [Specific commands or restore from backup]

# Step 4: Redeploy application
npm run build && npm run deploy
```

### Rollback Difficulty: [EASY / MEDIUM / HARD]

**Rationale**: [Why this difficulty level]

---

## Decision Checklist

Before applying this migration:

- [ ] Status is [READY] (not BLOCKED)
- [ ] All safety checks reviewed and understood
- [ ] Rollback plan documented and tested
- [ ] Backup created (if data-affecting)
- [ ] Code changes deployed (if needed)
- [ ] Team notified of migration plan
- [ ] Migration time window scheduled (if production)

After applying this migration:

- [ ] Migration applied successfully
- [ ] No data loss confirmed
- [ ] Application running with new schema
- [ ] Logs checked for errors
- [ ] Rollback plan verified (but not executed)
- [ ] Audit report filed

---

## Notes & Assumptions

[Any context, assumptions, or special considerations]

---

## Related Files

- Schema changes: [link to schema.prisma diff]
- Migration file: [link to migration SQL]
- Related code changes: [links to application code that uses new fields]
- Related feature spec: [link to feature spec if applicable]