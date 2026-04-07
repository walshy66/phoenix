---
name: error-semantics-enforcer
description: Enforce Principle V (Observability & Error Semantics) by implementing clear, structured error responses that distinguish recoverable errors from invariant failures. Use when building routes, services, or reviewing error handling. Ensures all API errors are structured JSON, UI handles errors gracefully, and invariant violations halt with explicit logging.
---

# Error Semantics Enforcer

Implement consistent error handling following Principle V across API routes and UI components.

## When to Use This Skill

- Building new API route handlers
- Adding error handling to services
- Reviewing error handling for compliance
- Implementing UI error boundaries
- Validating error response shapes
- Designing error recovery flows

## Core Principles

1. **Recoverable Errors (400/409)**: Return clear user affordances (retry, helpful message)
2. **Invariant Failures (500)**: Halt execution, log structurally, return explicit error code
3. **Structured Responses**: All API errors are `{ error: "CODE", message: "...", details?: {...} }`
4. **UI Error Boundaries**: Wrap feature modules to prevent local failures from crashing AppShell
5. **Never Change Behavior**: Logging/errors must not alter execution or lifecycle semantics

---

## Error Classification

### Recoverable Errors (HTTP 400/409)

User can retry or take alternative action:
- Validation failures (invalid input)
- Conflict errors (resource already exists)
- Rate limiting
- Network timeouts
- Temporary service unavailability

**Response**:
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Start date must be before end date.",
  "details": { "field": "startDate" }
}
```

**UI Handling**: Show user message + retry button

---

### Invariant Failures (HTTP 500)

System is in invalid state. Halt and log:
- "Exactly one active session" violated
- Data integrity corruption
- Constraint violations
- Authorization invariant broken

**Response**:
```json
{
  "error": "INVARIANT_VIOLATION",
  "message": "Cannot create session; active session already exists.",
  "code": "SESSION_ALREADY_ACTIVE"
}
```

**UI Handling**: Show error message, disable action, log severity alert

---

## Standard Error Codes

| Code | Status | When | Example |
|------|--------|------|---------|
| VALIDATION_ERROR | 400 | Input fails schema | Name field empty |
| CONFLICT | 409 | Resource already exists | Session already active |
| NOT_FOUND | 404 | Resource doesn't exist | User not found |
| UNAUTHORIZED | 401 | No valid identity | Missing session token |
| FORBIDDEN | 403 | Valid user, no access | User doesn't own resource |
| INVARIANT_VIOLATION | 500 | System invariant broken | Multiple active sessions |
| DATABASE_ERROR | 500 | Unexpected DB failure | Connection lost |

---

## API Implementation Pattern

### ✅ Correct Error Handling

```typescript
app.post('/sessions', async (request, reply) => {
  try {
    const { startDate, endDate } = request.body;
    
    // 1. Validate input
    if (!startDate || !endDate) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: "startDate and endDate are required."
      });
    }
    
    // 2. Check invariant
    const active = await prisma.session.count({
      where: { userId: request.user.id, status: 'ACTIVE' }
    });
    
    if (active > 0) {
      return reply.status(409).send({
        error: "CONFLICT",
        message: "Cannot create session; active session already exists."
      });
    }
    
    // 3. Execute
    const session = await prisma.session.create({ ... });
    return reply.status(201).send(session);
    
  } catch (error) {
    // 4. Catch unexpected errors
    request.log.error(error);
    return reply.status(500).send({
      error: "DATABASE_ERROR",
      message: "An unexpected error occurred."
    });
  }
});
```

---

## UI Implementation Pattern

### ✅ Correct Error Boundary

```typescript
import { ErrorBoundary } from 'react-error-boundary';

function SessionCard() {
  return (
    <ErrorBoundary
      fallback={<div>Failed to load session</div>}
      onError={(error) => console.error(error)}
    >
      <SessionContent />
    </ErrorBoundary>
  );
}
```

### ✅ Correct Error Display

```typescript
const [error, setError] = useState<ApiError | null>(null);

async function handleSaveSession() {
  try {
    const response = await fetch('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      
      // Recoverable: show retry
      if (response.status === 409) {
        setError({
          message: errorData.message,
          recoverable: true,
          retry: () => handleSaveSession() // Retry button
        });
      }
      // Invariant: show fatal message
      else if (response.status === 500) {
        setError({
          message: 'System error. Please refresh and try again.',
          recoverable: false
        });
      }
      return;
    }
    
    setSession(await response.json());
    setError(null);
  } catch (error) {
    setError({ message: 'Network error', recoverable: true });
  }
}
```

---

## Validation Checklist

Before considering error handling complete:

- [ ] All input validation uses Zod (or equivalent)
- [ ] Validation errors return 400 with VALIDATION_ERROR code
- [ ] All invariants checked server-side (not client assumptions)
- [ ] Invariant violations return 500 with explicit code
- [ ] All error responses are structured JSON
- [ ] No raw error messages leak to client
- [ ] UI wrapped in Error Boundary
- [ ] Recoverable errors show retry affordance
- [ ] Invariant failures show clear message (no retry)
- [ ] All errors logged internally with request.log.error()
- [ ] Error codes are consistent across app

---

## Error Recovery Flows

### Recoverable Error Flow
```
User Action
  ↓
Validation Check
  ├─ FAIL → Show message + retry button
  │           User can retry or cancel
  └─ PASS → Continue

Invariant Check
  ├─ FAIL → Show fatal message (no retry)
  │         User must refresh/reload
  └─ PASS → Success
```

### Invariant Failure Flow
```
System State Change
  ↓
Check Invariant
  ├─ PASS → Return success
  └─ FAIL → Return 500 error
           Log severity alert
           Client must reload
           User sees fatal message
```

---

## Troubleshooting

**Q: What if two users create sessions simultaneously?**  
A: Server checks invariant atomically before creation. Second request gets CONFLICT (409).

**Q: Should I return 403 or 404 for unauthorized access?**  
A: Use 403 for "valid user, no access". Can use 404 to hide resource existence (privacy).

**Q: Can I return custom error codes?**  
A: Yes, but document them. Use standard codes as baseline, add domain-specific ones as needed.

**Q: How do I distinguish validation from authorization?**  
A: Validation = input structure (400). Auth = user access (401/403). Invariant = system state (500).

**Q: Should error messages reveal system details?**  
A: No. Log details internally, send safe messages to client.

---

## Related Principles

- **Constitution V (Observability)**: Errors must be observable and logged
- **Constitution VI (Backend Authority)**: Backend enforces invariants, client doesn't
- **Constitution II (Test-First)**: Error cases tested before implementation