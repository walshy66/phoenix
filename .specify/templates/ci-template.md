# CI Test Contract — <FEATURE_ID>

**Feature**: <FEATURE_ID>  
**Purpose**: Define automated checks required to validate this feature in CI

---

## 1. Infrastructure Requirements

- Database container available
- Migrations applied automatically
- Clean database state per run

---

## 2. API Contract Tests

- [ ] Feature routes respond with expected status codes
- [ ] Error payloads match contract shape
- [ ] Invalid requests do not mutate state

---

## 3. Persistence Tests

- [ ] Create → persist → retrieve flow verified
- [ ] State restored from database
- [ ] Idempotent behavior verified (where applicable)

---

## 4. Authorization Tests

- [ ] Authorized access succeeds
- [ ] Unauthorized access fails
- [ ] Ownership rules enforced

---

## 5. Negative & Edge Tests

- [ ] Validation failures handled deterministically
- [ ] Missing dependencies handled
- [ ] No flaky or order-dependent tests

---

## 6. CI Exit Criteria

This feature is considered **CI-passing** when:
- All contract tests pass
- No data leakage between tests
- No environment coupling or hidden dependencies
