# Auth Security Logging Examples

## Example 1: Login Success Logging (Correct)

```typescript
// api/src/routes/auth/login.ts

import { hash } from 'crypto';

app.post('/auth/login', async (request, reply) => {
  const { provider, proof } = request.body;
  
  try {
    const subject = await validateProof(provider, proof);
    
    if (!subject) {
      // Log login failure
      request.log.error({
        event: 'LOGIN_FAILURE',
        timestamp: new Date().toISOString(),
        reason: 'INVALID_CREDENTIALS',
        identity_hash: hash('sha256', `${provider}:unknown`),  // Don't distinguish
        attempt_source: 'web'
      });
      
      return reply.status(400).send({
        error: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid credentials'
      });
    }
    
    // Resolve user
    const user = await prisma.user.findUnique({
      where: { provider_subject: { provider, subject } }
    });
    
    if (!user) {
      // User not found - still use INVALID_CREDENTIALS
      request.log.error({
        event: 'LOGIN_FAILURE',
        timestamp: new Date().toISOString(),
        reason: 'INVALID_CREDENTIALS',  // Same as wrong password
        identity_hash: hash('sha256', `${provider}:${subject}`),
        attempt_source: 'web'
      });
      
      return reply.status(400).send({
        error: 'USER_NOT_RESOLVED',
        message: 'User not found'
      });
    }
    
    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: generateToken(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    
    // Log success - AFTER session is created
    request.log.info({
      event: 'LOGIN_SUCCESS',
      timestamp: new Date().toISOString(),
      user_id_hash: hash('sha256', user.id),
      session_id: hash('sha256', session.id),
      provider: provider,
      session_duration_minutes: 7 * 24 * 60
    });
    
    return reply.send({
      sessionToken: session.token,
      user: { id: user.id }
    });
    
  } catch (error) {
    request.log.error({
      event: 'LOGIN_ERROR',
      timestamp: new Date().toISOString(),
      error_code: 'UNKNOWN',
      message: error.message
    });
    
    return reply.status(500).send({
      error: 'AUTH_ERROR',
      message: 'Login failed'
    });
  }
});
```

---

## Example 2: Signup Logging (Correct)

```typescript
// api/src/routes/auth/signup.ts

app.post('/auth/signup', async (request, reply) => {
  const { provider, proof, profile } = request.body;
  
  try {
    const subject = await validateProof(provider, proof);
    
    if (!subject) {
      request.log.error({
        event: 'SIGNUP_FAILURE',
        timestamp: new Date().toISOString(),
        reason: 'INVALID_CREDENTIALS',
        identity_hash: hash('sha256', `${provider}:unknown`)
      });
      
      return reply.status(400).send({
        error: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid credentials'
      });
    }
    
    // Check if identity already exists
    let user = await prisma.user.findUnique({
      where: { provider_subject: { provider, subject } }
    });
    
    if (user) {
      // Identity already mapped - log as INVALID_CREDENTIALS (don't reveal)
      request.log.error({
        event: 'SIGNUP_FAILURE',
        timestamp: new Date().toISOString(),
        reason: 'INVALID_CREDENTIALS',  // NOT "DUPLICATE_IDENTITY"
        identity_hash: hash('sha256', `${provider}:${subject}`)
      });
      
      // But proceed with login flow
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          token: generateToken(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });
      
      request.log.info({
        event: 'LOGIN_SUCCESS',
        timestamp: new Date().toISOString(),
        user_id_hash: hash('sha256', user.id),
        session_id: hash('sha256', session.id),
        note: 'signup_treated_as_login'
      });
      
      return reply.status(200).send({
        sessionToken: session.token,
        user: { id: user.id }
      });
    }
    
    // Create new user
    user = await prisma.user.create({
      data: {
        profile: {
          name: profile.name
          // Don't store email in logs - will be hashed
        },
        identities: {
          create: { provider, subject }
        }
      }
    });
    
    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: generateToken(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    
    // Log success
    request.log.info({
      event: 'SIGNUP_SUCCESS',
      timestamp: new Date().toISOString(),
      user_id_hash: hash('sha256', user.id),
      session_id: hash('sha256', session.id),
      provider: provider
      // Don't log: name, email, any PII
    });
    
    return reply.status(201).send({
      sessionToken: session.token,
      user: { id: user.id }
    });
    
  } catch (error) {
    if (error.code === 'P2002') {
      // Unique constraint - identity already exists
      request.log.error({
        event: 'SIGNUP_FAILURE',
        timestamp: new Date().toISOString(),
        reason: 'INVALID_CREDENTIALS',  // Don't reveal duplicate
        identity_hash: 'unable_to_hash'
      });
      
      return reply.status(400).send({
        error: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid credentials'
      });
    }
    
    request.log.error({
      event: 'SIGNUP_ERROR',
      timestamp: new Date().toISOString(),
      error_code: error.code,
      message: error.message
    });
    
    return reply.status(500).send({
      error: 'AUTH_ERROR',
      message: 'Signup failed'
    });
  }
});
```

---

## Example 3: Ownership Violation Logging (Correct)

```typescript
// api/src/services/session.service.ts

export async function getSessionForUser(userId: string, sessionId: string) {
  const session = await prisma.actualSessionLog.findUnique({
    where: { id: sessionId }
  });
  
  if (!session) {
    return null;
  }
  
  // Check ownership
  if (session.userId !== userId) {
    // Log violation WITHOUT exposing IDs
    logger.error({
      event: 'OWNERSHIP_VIOLATION',
      timestamp: new Date().toISOString(),
      user_id_hash: hash('sha256', userId),
      resource_type: 'session',
      severity: 'CRITICAL',
      // Don't include: session.id, session.userId, resource owner
    });
    
    // Return 403, no retry
    throw new UnauthorizedException('FORBIDDEN');
  }
  
  return session;
}
```

---

## Example 4: Logout Logging (Correct)

```typescript
// api/src/routes/auth/logout.ts

app.post('/auth/logout', async (request, reply) => {
  const sessionToken = request.headers.authorization?.split(' ')[1];
  
  // Find session
  const session = sessionToken
    ? await prisma.session.findUnique({ where: { token: sessionToken } })
    : null;
  
  // Invalidate if found
  if (session) {
    await prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() }
    });
  }
  
  // Log logout (idempotent - always log)
  logger.info({
    event: 'LOGOUT',
    timestamp: new Date().toISOString(),
    session_id_hash: session ? hash('sha256', session.id) : 'unknown',
    user_id_hash: session ? hash('sha256', session.userId) : 'unknown'
  });
  
  // Always return success
  return reply.status(200).send({ success: true });
});
```

---

## Example 5: Rate Limit Logging

```typescript
// api/src/middleware/rate-limit.ts

const loginAttempts = new Map<string, { count: number; resetAt: Date }>();

export function checkLoginRateLimit(identityHash: string) {
  const now = Date.now();
  const attempt = loginAttempts.get(identityHash);
  
  if (!attempt || attempt.resetAt.getTime() < now) {
    // First attempt or reset
    loginAttempts.set(identityHash, {
      count: 1,
      resetAt: new Date(now + 15 * 60 * 1000)  // 15 min window
    });
    return true;
  }
  
  if (attempt.count >= 5) {
    // Rate limit exceeded
    logger.warn({
      event: 'RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString(),
      identity_hash: identityHash,
      attempt_count: attempt.count,
      reset_at: attempt.resetAt.toISOString()
    });
    
    return false;
  }
  
  attempt.count++;
  return true;
}
```

---

## Example 6: Structured Audit Log Format

```json
{
  "event": "LOGIN_SUCCESS",
  "timestamp": "2026-02-24T10:30:45.123Z",
  "user_id_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "session_id": "sess_abcd1234",
  "identity_hash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
  "provider": "google",
  "ip_address": "192.168.1.0",
  "user_agent": "Mozilla/5.0...",
  "source": "web"
}
```

---

## Example 7: Logging Configuration

```typescript
// api/src/logging/audit-logger.ts

import pino from 'pino';
import fs from 'fs';

// Separate audit logger (durable, restricted)
export const auditLogger = pino(
  pino.destination({
    dest: '/var/log/coachcw-audit.log',  // Durable storage
    minLength: 4096,  // Buffer writes
    fsync: true       // Force disk write (durable)
  })
);

// Application logger (standard)
export const appLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

// Never log PII or secrets
export function sanitizeForLogging(data: any) {
  const forbidden = ['password', 'token', 'email', 'secret', 'proof'];
  const sanitized = { ...data };
  
  for (const key of forbidden) {
    if (key in sanitized) {
      delete sanitized[key];
    }
  }
  
  return sanitized;
}
```

---

## Example 8: Audit Log Query (Incident Investigation)

```bash
# Search for all login attempts by specific hashed user
grep "LOGIN_" /var/log/coachcw-audit.log | \
  grep "user_id_hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

# Search for ownership violations
grep "OWNERSHIP_VIOLATION" /var/log/coachcw-audit.log | tail -20

# Export to JSON for analysis
grep "LOGIN_SUCCESS" /var/log/coachcw-audit.log | jq . > login_analysis.json
```

---

## Example 9: Testing Logging (No PII Leakage)

```typescript
// api/src/routes/__tests__/auth.test.ts

test('login failure logging never reveals account existence', async () => {
  // Capture logs
  const logs: any[] = [];
  const testLogger = {
    error: (data: any) => logs.push(data)
  };
  
  // Unknown identity
  await login({ provider: 'google', proof: 'valid-but-unknown' }, testLogger);
  const unknownLog = logs[logs.length - 1];
  
  // Clear logs
  logs.length = 0;
  
  // Wrong password (real identity)
  await login({ provider: 'google', proof: 'invalid-for-real-id' }, testLogger);
  const wrongPassLog = logs[logs.length - 1];
  
  // Both should have:
  // - Same reason
  // - No email/PII
  // - No "account found" indicator
  expect(unknownLog.reason).toBe('INVALID_CREDENTIALS');
  expect(wrongPassLog.reason).toBe('INVALID_CREDENTIALS');
  expect(unknownLog).not.toHaveProperty('email');
  expect(wrongPassLog).not.toHaveProperty('email');
  expect(Object.keys(unknownLog)).toEqual(Object.keys(wrongPassLog));
});

test('ownership violation logging never exposes resource ID', async () => {
  const logs: any[] = [];
  const testLogger = {
    error: (data: any) => logs.push(data)
  };
  
  // Try to access another user's session
  await getSession({ userId: 'user-1', sessionId: 'session-of-user-2' }, testLogger);
  const violationLog = logs[logs.length - 1];
  
  // Must not include resource ID or owner ID
  expect(violationLog).not.toHaveProperty('resource_id');
  expect(violationLog).not.toHaveProperty('owner_id');
  expect(violationLog).not.toHaveProperty('session_id');
  expect(violationLog.event).toBe('OWNERSHIP_VIOLATION');
  expect(violationLog.severity).toBe('CRITICAL');
});
```