# Error Response Examples

## Standard Error Responses

### Recoverable: Validation Error (400)

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Start date must be before end date.",
  "details": {
    "field": "startDate",
    "value": "2026-03-01",
    "constraint": "must_be_before_end_date"
  }
}
```

**UI Handling**:
```typescript
if (response.status === 400) {
  setError({
    message: errorData.message,
    recoverable: true,
    retry: () => submitForm()  // Retry button
  });
}
```

---

### Recoverable: Conflict Error (409)

```json
{
  "error": "CONFLICT",
  "message": "Cannot create session; active session already exists.",
  "details": {
    "resource": "session",
    "reason": "active_session_exists",
    "suggestion": "Complete or cancel active session first"
  }
}
```

**UI Handling**:
```typescript
if (response.status === 409) {
  setError({
    message: "You have an active session. Complete it before starting a new one.",
    recoverable: true,
    action: () => navigate('/session/active')  // Direct to active session
  });
}
```

---

### Recoverable: Not Found (404)

```json
{
  "error": "NOT_FOUND",
  "message": "User not found.",
  "details": {
    "resource": "user",
    "id": "user_id_hash"
  }
}
```

---

### Recoverable: Unauthorized (401)

```json
{
  "error": "UNAUTHORIZED",
  "message": "Session expired. Please log in again.",
  "details": {
    "reason": "session_expired"
  }
}
```

**UI Handling**:
```typescript
if (response.status === 401) {
  // Redirect to login
  navigate('/auth/login');
}
```

---

### Recoverable: Forbidden (403)

```json
{
  "error": "FORBIDDEN",
  "message": "You don't have permission to access this resource.",
  "details": {
    "resource": "session",
    "reason": "not_owned_by_user"
  }
}
```

---

### Invariant Failure: System Error (500)

```json
{
  "error": "INVARIANT_VIOLATION",
  "message": "System error. Please refresh and try again.",
  "code": "SESSION_ALREADY_ACTIVE"
}
```

**UI Handling**:
```typescript
if (response.status === 500) {
  setError({
    message: "A critical error occurred. Please refresh the page and try again.",
    recoverable: false,
    // No retry button - require page reload
  });
}
```

---

### Invariant Failure: Database Error (500)

```json
{
  "error": "DATABASE_ERROR",
  "message": "A database error occurred.",
  "code": "CONNECTION_LOST"
}
```

**Note**: Don't expose database error details to client. Log internally only.

---

## Complete Route Example

```typescript
// api/src/routes/sessions.ts

import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export async function registerSessionRoutes(app: FastifyInstance) {
  
  app.post('/sessions', async (request, reply) => {
    try {
      // 1. VALIDATE INPUT
      const schema = z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      });
      
      let data;
      try {
        data = schema.parse(request.body);
      } catch (error) {
        // Validation error is recoverable
        return reply.status(400).send({
          error: "VALIDATION_ERROR",
          message: error instanceof z.ZodError 
            ? error.errors[0].message 
            : "Invalid input",
          details: error instanceof z.ZodError 
            ? { field: error.errors[0].path.join('.') }
            : {}
        });
      }
      
      // 2. CHECK INVARIANT (before persistence)
      const activeCount = await prisma.actualSessionLog.count({
        where: {
          userId: request.user.id,
          status: 'IN_PROGRESS'
        }
      });
      
      if (activeCount > 0) {
        // Invariant violation is NOT recoverable
        request.log.error({
          event: 'INVARIANT_VIOLATION',
          code: 'SESSION_ALREADY_ACTIVE',
          userId: request.user.id,
          timestamp: new Date().toISOString()
        });
        
        return reply.status(409).send({
          error: "CONFLICT",
          message: "Cannot create session; active session already exists.",
          details: {
            reason: "active_session_exists"
          }
        });
      }
      
      // 3. CREATE (will fail with 500 if invariant broken)
      const session = await prisma.actualSessionLog.create({
        data: {
          userId: request.user.id,
          startedAt: new Date(data.startDate),
          plannedEndAt: new Date(data.endDate),
          status: 'IN_PROGRESS'
        }
      });
      
      return reply.status(201).send(session);
      
    } catch (error) {
      // Unexpected error - invariant failure
      request.log.error({
        event: 'DATABASE_ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: request.user.id,
        timestamp: new Date().toISOString()
      });
      
      return reply.status(500).send({
        error: "DATABASE_ERROR",
        message: "An unexpected error occurred. Please try again later.",
        code: "DATABASE_ERROR"
      });
    }
  });
  
}
```

---

## UI Error Boundary Example

```typescript
// app/src/components/SessionCard.tsx

import React from 'react';
import { ErrorBoundary, FallbackComponent } from 'react-error-boundary';

const SessionErrorFallback: FallbackComponent = ({ error, resetErrorBoundary }) => (
  <div className="p-4 bg-red-100 border border-red-400 rounded">
    <h3 className="font-bold">Failed to load session</h3>
    <p className="text-sm">{error.message}</p>
    <button 
      onClick={resetErrorBoundary}
      className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
    >
      Try Again
    </button>
  </div>
);

export function SessionCard({ sessionId }: { sessionId: string }) {
  return (
    <ErrorBoundary
      FallbackComponent={SessionErrorFallback}
      onError={(error) => {
        console.error('SessionCard error:', error);
        // Track in monitoring
      }}
      onReset={() => {
        // Reset any internal state
      }}
    >
      <SessionContent sessionId={sessionId} />
    </ErrorBoundary>
  );
}
```

---

## Error Handling in API Client

```typescript
// app/src/api/client.ts

export async function apiCall(
  endpoint: string, 
  options: RequestInit = {}
): Promise<any> {
  const response = await fetch(endpoint, options);
  
  if (!response.ok) {
    const errorData = await response.json();
    
    // Classify error
    if (response.status === 400) {
      // Recoverable: validation error
      throw {
        code: errorData.error,
        message: errorData.message,
        recoverable: true,
        details: errorData.details
      };
    } else if (response.status === 409) {
      // Recoverable: conflict
      throw {
        code: errorData.error,
        message: errorData.message,
        recoverable: true,
        suggestion: errorData.details.suggestion
      };
    } else if (response.status === 401 || response.status === 403) {
      // Auth errors
      throw {
        code: errorData.error,
        message: errorData.message,
        recoverable: response.status === 401, // Logout recovery
        redirect: response.status === 401 ? '/auth/login' : undefined
      };
    } else if (response.status === 500) {
      // Invariant failure: NOT recoverable
      throw {
        code: errorData.error,
        message: errorData.message,
        recoverable: false,
        fatal: true
      };
    }
  }
  
  return response.json();
}
```

---

## Testing Error Responses

```typescript
// api/src/routes/__tests__/sessions.test.ts

import { test, describe, expect } from 'vitest';
import { build } from '../../server';

describe('Session Error Handling', () => {
  
  test('returns 400 for validation error', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/sessions',
      payload: { startDate: 'invalid-date' }
    });
    
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: 'VALIDATION_ERROR',
      message: expect.any(String),
      details: expect.objectContaining({ field: 'startDate' })
    });
  });
  
  test('returns 409 for active session conflict', async () => {
    // Create active session
    await prisma.actualSessionLog.create({
      data: {
        userId: 'user-1',
        status: 'IN_PROGRESS',
        startedAt: new Date()
      }
    });
    
    const response = await app.inject({
      method: 'POST',
      url: '/sessions',
      headers: { 'x-actor-id': 'user-1' },
      payload: {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 3600000).toISOString()
      }
    });
    
    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      error: 'CONFLICT',
      message: expect.stringContaining('active session'),
      details: { reason: 'active_session_exists' }
    });
  });
  
});
```