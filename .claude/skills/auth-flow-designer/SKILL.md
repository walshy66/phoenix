---
name: auth-flow-designer
description: Design and enforce secure, invariant-safe authentication and identity resolution flows for Feature 050 (Account Identity & Data Ownership). Use when specifying login/logout/signup flows, defining auth identity mapping, enforcing session lifecycle rules, or preventing enumeration attacks. Ensures identity immutability and authorization semantics are correct before implementation.
---

# Auth Flow Designer

Define secure authentication flows that preserve Feature 050 invariants and prevent enumeration attacks.

## When to Use This Skill

- Designing login flows
- Designing signup flows
- Designing logout flows
- Defining identity resolution rules
- Enforcing anti-enumeration semantics
- Specifying auth error handling
- Validating auth invariants

## Core Rules (Non-Negotiable)

1. **Single Stable Identity**: Auth identity = provider + subject (immutable)
2. **One User Per Identity**: Enforce unique constraint; never create duplicate Users
3. **User Resolution**: All auth flows must resolve to exactly one User
4. **Anti-Enumeration**: Login failures don't reveal account existence
5. **Immutable Mapping**: Once auth identity → User, never change it
6. **Session After Resolution**: Sessions created AFTER User is resolved
7. **Error Semantics**: Explicit, stable error codes (no generic "failed")

---

## Login Flow

### Correct Pattern

```
1. User provides auth proof (password, OAuth token, etc.)
2. Server validates proof against auth provider
3. If invalid → Return AUTH_INVALID_CREDENTIALS (no distinction between unknown/wrong)
4. If valid → Resolve auth identity to User
5. If User not found → Return USER_NOT_RESOLVED
6. If User found → Create session
7. Return session token
```

### Key Points

- **Step 3**: Never distinguish "unknown identity" from "wrong password"
- **Step 4**: Auth identity resolution is the authority
- **Step 6**: Session created ONLY after User exists

### Error Responses

```json
// Invalid proof (don't say which)
{ "error": "AUTH_INVALID_CREDENTIALS", "message": "Invalid credentials" }

// Identity can't be resolved to User
{ "error": "USER_NOT_RESOLVED", "message": "Cannot resolve user" }

// Duplicate identity mapped to multiple Users (system error)
{ "error": "DUPLICATE_USER_IDENTITY", "message": "System error" }
```

---

## Signup Flow

### Correct Pattern

```
1. User provides auth proof
2. Server validates proof
3. If invalid → Return AUTH_INVALID_CREDENTIALS
4. If valid → Check if identity already mapped
5. If already mapped → Treat as login (return session)
6. If not mapped → Create new User, map identity, create session
7. Ensure atomicity (identity mapping happens with User creation)
```

### Key Points

- **Step 5**: Don't reveal that identity already exists
- **Step 6**: User creation and identity mapping are atomic
- **Step 7**: If one fails, both fail

### Error Responses

Same as login (never reveal pre-existence):

```json
{ "error": "AUTH_INVALID_CREDENTIALS" }
// NOT: { "error": "ACCOUNT_EXISTS" } ← Reveals user existence
```

---

## Logout Flow

### Correct Pattern

```
1. User provides valid session token
2. Invalidate session
3. Return success
4. Make idempotent (repeated calls succeed)
```

### Key Points

- **Idempotency**: Logout twice = success both times
- **Session only**: Don't delete User or identity mapping
- **Simple**: Just invalidate the session

---

## Identity Resolution Rules

### Identity Key

```
provider (e.g., "google") + subject (e.g., user's Google ID)
NOT: email (can change), phone (can change), username (can be spoofed)
```

### Uniqueness Constraint

```sql
UNIQUE(provider, subject)
-- One identity can map to only one User
-- One User can have only one identity per provider
```

### Resolution Algorithm

```
Given (provider, subject):
1. Query for existing User with this identity
2. If found → Return User (guaranteed one due to unique constraint)
3. If not found → No User exists for this identity
4. If multiple found → SYSTEM ERROR (DUPLICATE_USER_IDENTITY)
```

---

## Session Lifecycle

### Creation

```
Session created ONLY AFTER User is resolved
Example:
  1. Auth proof validated
  2. User resolved (SELECT ... WHERE provider=X AND subject=Y)
  3. Session created
  4. Session returned to client
```

### Invalidation

```
Session invalidated on logout
Example:
  1. Client sends session token
  2. Session deleted from database
  3. Success returned (regardless of token validity - idempotent)
```

### No Other Changes

- Session lifecycle never changes based on identity
- Session lifecycle never changes based on roles/personas
- Execution semantics unchanged by auth

---

## Error Codes (Minimal Set)

| Code | When | Example |
|------|------|---------|
| AUTH_INVALID_CREDENTIALS | Proof validation fails | Wrong password |
| USER_NOT_RESOLVED | Valid proof but no User | New identity + login |
| DUPLICATE_USER_IDENTITY | System corrupted | Multiple Users for one identity |
| AUTH_REQUIRED | No session token | Missing auth |

**Golden Rule**: Never reveal account existence.

---

## Anti-Enumeration Checklist

- [ ] Login failure: don't distinguish "unknown" from "wrong password"
- [ ] Signup success: don't reveal if identity already exists
- [ ] Error messages: don't mention account existence
- [ ] Error timing: don't vary based on whether account exists
- [ ] Response shape: same for unknown vs. wrong password

---

## Feature 050 Invariants (Validation)

Ensure auth design respects:

- **I1**: Authoritative user identity resolution
- **I4**: Execution semantics untouched by auth
- **I7**: Stable, explicit error semantics
- **I8**: Multi-user isolation (one User per identity)

---

## Troubleshooting

**Q: Should I allow multiple identities per User?**  
A: Outside Feature 050 scope. Design for single identity per provider.

**Q: Can I use email as identity?**  
A: No. Emails can change. Use provider-issued stable subject.

**Q: What if proof validation is slow?**  
A: That's OK. Just ensure timing doesn't leak account existence.

**Q: Can I create User during login?**  
A: No. Separate login and signup. Don't auto-create Users.

**Q: Should logout delete User?**  
A: No. Just invalidate session. User persists.

---

## Related Docs

- Feature 050: Account Identity & Data Ownership
- error-semantics-enforcer: Error response patterns
- auth-security-logging: Logging rules for auth flows