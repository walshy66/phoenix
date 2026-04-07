---
name: auth-security-logging
description: Define safe, invariant-aligned logging and audit practices for authentication and identity events in Feature 050. Use when specifying auth logging requirements, designing audit trails, ensuring PII-safe logging, or validating logging compliance. Prevents credential leakage, account enumeration via logs, and ensures logging doesn't alter runtime behavior.
---

# Auth Security Logging

Implement secure, PII-safe logging for authentication without revealing account existence.

## When to Use This Skill

- Designing auth event logging
- Specifying audit trail requirements
- Reviewing auth logging for PII leakage
- Validating logging doesn't change behavior
- Planning incident response logging
- Ensuring compliance with data protection rules

## Core Rules (Non-Negotiable)

1. **Never Log Secrets**: Passwords, tokens, credentials are forbidden
2. **Never Log PII**: Email addresses, full names, phone numbers are forbidden
3. **Never Log Existence Signals**: Don't log things that reveal accounts exist
4. **Always Log Violations**: Ownership violations and invariant breaks MUST be logged
5. **Logging ≠ Behavior**: Logging must never change execution or error semantics
6. **Safe Surrogates**: Use hashed/redacted identifiers if needed (not reversible)

---

## Logging Taxonomy

### Audit Logs (Security-Critical)

Used for compliance, incident response, security investigations:
- Authentication events (login, signup, logout)
- Authorization failures
- Ownership violations
- Rate limit triggers

**Storage**: Durable, encrypted, restricted access

**Example**:
```json
{
  "event": "LOGIN_SUCCESS",
  "timestamp": "2026-02-24T10:30:00Z",
  "identity_hash": "abc123def456",
  "session_id": "sess_xyz",
  "ip": "192.168.1.1"
}
```

### Application Logs (Operational)

Used for debugging, monitoring, error tracking:
- Flow progress (step 1, step 2, etc.)
- Non-sensitive errors
- Performance metrics

**Storage**: Standard logs, may be less restricted

---

## Required Events

### Event 1: LOGIN_SUCCESS

```json
{
  "event": "LOGIN_SUCCESS",
  "timestamp": "ISO8601",
  "identity_hash": "sha256(provider + subject)",
  "session_id": "session_token_id",
  "user_id": "user_id_hash"
}
```

**Fields**:
- `identity_hash`: Hash of (provider + subject), one-way (non-reversible)
- `session_id`: Session token identifier (not the token itself)
- `user_id`: Hashed user ID (not plaintext)

**Never Log**:
- Email, username, real name
- Session token
- Auth proof/password
- Auth provider subject in plaintext

---

### Event 2: LOGIN_FAILURE

```json
{
  "event": "LOGIN_FAILURE",
  "timestamp": "ISO8601",
  "reason": "INVALID_CREDENTIALS",
  "identity_hash": "sha256(provider + subject)",
  "attempt_count": 1
}
```

**Key Rule**: Use identical response shape for unknown vs. wrong password:
- Don't distinguish "account not found" from "password wrong"
- Both use `reason: "INVALID_CREDENTIALS"`
- Both use same `identity_hash` (not revealing existence)

---

### Event 3: SIGNUP_SUCCESS

```json
{
  "event": "SIGNUP_SUCCESS",
  "timestamp": "ISO8601",
  "identity_hash": "sha256(provider + subject)",
  "user_id": "user_id_hash",
  "session_id": "session_token_id"
}
```

---

### Event 4: SIGNUP_FAILURE

```json
{
  "event": "SIGNUP_FAILURE",
  "timestamp": "ISO8601",
  "reason": "INVALID_CREDENTIALS",  // or DUPLICATE_IDENTITY
  "identity_hash": "sha256(provider + subject)"
}
```

**Key Rule**: If identity already exists, don't say so:
- Return `reason: "INVALID_CREDENTIALS"` (same as login)
- Never log "account already exists" message

---

### Event 5: LOGOUT

```json
{
  "event": "LOGOUT",
  "timestamp": "ISO8601",
  "session_id": "session_token_id",
  "user_id": "user_id_hash"
}
```

**Idempotent**: Log even if session already invalid

---

### Event 6: OWNERSHIP_VIOLATION

```json
{
  "event": "OWNERSHIP_VIOLATION",
  "timestamp": "ISO8601",
  "reason": "SESSION_NOT_OWNED",
  "user_id": "user_id_hash",
  "resource_type": "session",
  "severity": "CRITICAL"
}
```

**Always Log**: Never suppress ownership violations

**Never Log**:
- Resource IDs in plaintext
- User's actual identity
- Which user owns the resource

---

### Event 7: SESSION_CREATION

```json
{
  "event": "SESSION_CREATED",
  "timestamp": "ISO8601",
  "session_id": "session_token_id",
  "user_id": "user_id_hash",
  "user_resolution_time_ms": 45
}
```

**Key Rule**: Log AFTER user resolution (not before)

---

### Event 8: SESSION_INVALIDATION

```json
{
  "event": "SESSION_INVALIDATED",
  "timestamp": "ISO8601",
  "session_id": "session_token_id",
  "reason": "EXPLICIT_LOGOUT"  // or "EXPIRED", "REVOKED"
}
```

---

## Forbidden Data (NEVER LOG)

| Data | Why | Exception |
|------|-----|-----------|
| Passwords | Credential leakage | None |
| Auth tokens | Credential leakage | None |
| Session tokens | Credential leakage | None |
| Email addresses | PII leakage | None (use hash) |
| Real names | PII leakage | None |
| Phone numbers | PII leakage | None |
| OAuth subject ID | Enumeration risk | None (use hash) |
| Request bodies | May contain secrets | None (log headers only) |
| Full IP addresses | Privacy concern | OK to log if needed (masked) |

---

## Safe Substitutes

| Original | Problem | Safe Substitute |
|----------|---------|-----------------|
| `provider: "google", subject: "abc123"` | Reveals account | `identity_hash: "sha256(google:abc123)"` |
| `email: "user@example.com"` | PII | `identity_hash` or omit |
| `session_token` | Credential | `session_id` (hash of token) |
| `user_id: 42` | Enumeration | `user_id_hash: "sha256(42)"` (one-way) |

---

## Logging Rules by Event

### Login/Signup Flows

```typescript
// ✅ CORRECT
logger.info('LOGIN_FAILURE', {
  event: 'LOGIN_FAILURE',
  identity_hash: sha256(`${provider}:${subject}`),
  reason: 'INVALID_CREDENTIALS',  // Never distinguish unknown vs wrong password
  timestamp: new Date().toISOString()
});

// ❌ WRONG
logger.info('LOGIN_FAILURE', {
  email: user.email,           // PII leakage
  reason: 'ACCOUNT_NOT_FOUND'  // Reveals account existence
});
```

---

### Ownership Violations

```typescript
// ✅ CORRECT
logger.error('OWNERSHIP_VIOLATION', {
  event: 'OWNERSHIP_VIOLATION',
  user_id_hash: sha256(user.id),
  resource_type: 'session',
  severity: 'CRITICAL',
  timestamp: new Date().toISOString()
});

// ❌ WRONG
logger.error('OWNERSHIP_VIOLATION', {
  user_id: user.id,              // Plaintext ID
  session_id: session.id,        // Reveals resource
  owner_id: session.userId,      // Reveals owner
  message: 'User 42 tried to access session 789'  // All PII
});
```

---

## Anti-Enumeration in Logging

### ✅ CORRECT

```json
{ "event": "LOGIN_FAILURE", "reason": "INVALID_CREDENTIALS" }
{ "event": "LOGIN_FAILURE", "reason": "INVALID_CREDENTIALS" }  // Same for both cases
```

Result: Attacker can't tell if account exists by reading logs.

---

### ❌ WRONG

```json
{ "event": "LOGIN_FAILURE", "reason": "ACCOUNT_NOT_FOUND" }
{ "event": "LOGIN_FAILURE", "reason": "WRONG_PASSWORD" }
```

Result: Attacker can enumerate accounts by reading logs.

---

## Feature 050 Invariant Compliance

Validate logging respects:

- **I1**: User identity logging doesn't leak raw IDs
- **I4**: Logging never changes execution behavior
- **I7**: Error logging uses stable, explicit codes
- **I8**: Multi-user isolation preserved (no cross-user data in logs)

---

## Audit Trail Requirements

### Completeness

- Every auth event logged
- Every ownership violation logged
- Timestamps precise (ISO8601)
- Events immutable (append-only)

### Durability

- Audit logs persistent (not deleted with session)
- Backups created regularly
- Access restricted to security team

### Searchability

- Query by event type
- Query by time range
- Query by identity hash (for incident investigation)

---

## Logging Checklist

Before considering auth logging complete:

- [ ] No passwords logged anywhere
- [ ] No tokens logged anywhere
- [ ] No email addresses logged plaintext
- [ ] All identities hashed (one-way)
- [ ] Login/signup failures use identical logging
- [ ] Ownership violations always logged
- [ ] Session creation logs after resolution
- [ ] Logout is idempotent
- [ ] Audit logs durable and immutable
- [ ] No plaintext user IDs in logs
- [ ] Logging doesn't change behavior
- [ ] Log retention policy defined

---

## Troubleshooting

**Q: How do I log which account was accessed without leaking PII?**  
A: Use `user_id_hash: sha256(user.id)` (one-way). Can't be reversed.

**Q: Should I log IP addresses?**  
A: If needed, mask last octet: `192.168.1.X` instead of `192.168.1.42`.

**Q: Can I log full user ID?**  
A: Only if it's hashed. Never plaintext integers or UUIDs in logs.

**Q: What if someone tries wrong password multiple times?**  
A: Log each attempt with same `reason: "INVALID_CREDENTIALS"`. Don't log attempt count per identity (enumeration risk).

**Q: How long to keep audit logs?**  
A: Define policy (e.g., 1 year). Document and enforce.

---

## Related Docs

- Feature 050: Account Identity & Data Ownership
- auth-flow-designer: Auth flow design
- error-semantics-enforcer: Error logging patterns