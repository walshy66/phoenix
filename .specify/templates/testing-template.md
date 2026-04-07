# Testing Checklist — <FEATURE_ID>

**Feature**: <FEATURE_ID>  
**Purpose**: Verify this feature is testable end-to-end in a local development environment  
**Scope**: Manual and exploratory testing (non-CI)

---

## 1. Environment Preconditions

### 1.1 Docker & Database
- [ ] Docker Desktop is running
- [ ] Database container is healthy
- [ ] Database port is exposed to host
- [ ] Database reachable via admin tool (pgAdmin / Prisma Studio)

**Verification**
- `docker ps` shows DB container as healthy

---

### 1.2 Database Schema
- [ ] All migrations applied
- [ ] No pending or failed migrations
- [ ] Schema matches expected domain model

**Verification**
- `npx prisma migrate status` reports schema up to date

---

### 1.3 API Runtime
- [ ] API server running locally
- [ ] API connected to correct database
- [ ] Feature routes registered
- [ ] API reachable from host

**Verification**
- Health endpoint responds
- Feature route returns a controlled error (400 / 401 / 422)

---

### 1.4 Frontend Runtime
- [ ] Frontend dev server running
- [ ] Frontend env points to local API
- [ ] Feature mocks disabled
- [ ] Frontend restarted after env changes

**Verification**
- Browser network tab shows real API requests
- No mock adapters intercept requests

---

## 2. Environment Configuration

### Frontend
- [ ] `VITE_API_BASE` points to local API
- [ ] `VITE_USE_MOCKS=false`

### API
- [ ] `DATABASE_URL` points to local database
- [ ] Correct `NODE_ENV` set

---

## 3. Data Preconditions

List all upstream data required for this feature to function.

- [ ] Required parent entities exist
- [ ] Test data seeded or created
- [ ] Data relationships are valid

**Notes**
- Describe how required data was created or seeded.

---

## 4. Authentication Assumptions

- [ ] Auth strategy defined (real or mocked)
- [ ] Ownership rules testable
- [ ] Auth failure behavior verified

---

## 5. Feature Entry Point

Describe the canonical entry action for this feature.

> Example: “User opens a planned session”

- [ ] Entry action reachable in UI
- [ ] Entry action triggers expected API calls

---

## 6. Persistence Verification

- [ ] Writes persist to database
- [ ] Reads restore UI state
- [ ] State survives navigation
- [ ] State survives refresh

---

## 7. Error Handling Verification

- [ ] Validation errors do not mutate persisted state
- [ ] Recoverable errors are visible and retryable
- [ ] Non-recoverable errors block interaction
- [ ] Error payloads match contract

---

## 8. Manual Test Pass

- [ ] Happy path verified
- [ ] Invalid input tested
- [ ] Edge cases exercised
- [ ] Database state inspected

---

## Test Result

**Status**: ⬜ Not Tested / ⬜ Partial / ⬜ Verified  
**Tester**:  
**Date**:  
**Notes / Follow-ups**:
