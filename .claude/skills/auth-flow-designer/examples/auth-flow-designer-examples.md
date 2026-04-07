# Auth Flow Examples

## Example 1: Login Flow (Correct)

```typescript
// api/src/routes/auth/login.ts

app.post('/auth/login', async (request, reply) => {
  const { provider, proof } = request.body;
  
  try {
    // Step 1: Validate proof with provider
    const subject = await validateProof(provider, proof);
    if (!subject) {
      // Don't distinguish "unknown" from "wrong password"
      return reply.status(400).send({
        error: "AUTH_INVALID_CREDENTIALS",
        message: "Invalid credentials"
      });
    }
    
    // Step 2: Resolve identity to User
    const user = await prisma.user.findUnique({
      where: { provider_subject: { provider, subject } }
    });
    
    if (!user) {
      // Identity maps to no User
      return reply.status(401).send({
        error: "USER_NOT_RESOLVED",
        message: "User not found"
      });
    }
    
    // Step 3: Create session AFTER User resolution
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: generateToken(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    
    // Log success (no PII)
    request.log.info({
      event: 'LOGIN_SUCCESS',
      user_id_hash: hash(user.id),
      session_id: hash(session.id)
    });
    
    return reply.send({
      sessionToken: session.token,
      user: { id: user.id }
    });
    
  } catch (error) {
    request.log.error({ event: 'LOGIN_ERROR', error: error.message });
    return reply.status(500).send({
      error: "AUTH_ERROR",
      message: "Login failed"
    });
  }
});
```

---

## Example 2: Signup Flow (Correct)

```typescript
// api/src/routes/auth/signup.ts

app.post('/auth/signup', async (request, reply) => {
  const { provider, proof, profile } = request.body;
  
  try {
    // Step 1: Validate proof
    const subject = await validateProof(provider, proof);
    if (!subject) {
      // Same error as login - don't reveal anything
      return reply.status(400).send({
        error: "AUTH_INVALID_CREDENTIALS",
        message: "Invalid credentials"
      });
    }
    
    // Step 2: Check if identity already mapped
    let user = await prisma.user.findUnique({
      where: { provider_subject: { provider, subject } }
    });
    
    if (user) {
      // Identity already exists - treat as login
      // Don't say "account already exists"
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          token: generateToken(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });
      
      return reply.status(200).send({
        sessionToken: session.token,
        user: { id: user.id }
      });
    }
    
    // Step 3: Create new User AND map identity (atomic)
    user = await prisma.user.create({
      data: {
        profile: {
          name: profile.name,
          email: profile.email
        },
        identities: {
          create: {
            provider,
            subject
          }
        }
      }
    });
    
    // Step 4: Create session
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
      user_id_hash: hash(user.id),
      session_id: hash(session.id)
    });
    
    return reply.status(201).send({
      sessionToken: session.token,
      user: { id: user.id }
    });
    
  } catch (error) {
    // On UNIQUE constraint violation, treat as login
    if (error.code === 'P2002') {
      // Identity already exists - don't say so
      return reply.status(400).send({
        error: "AUTH_INVALID_CREDENTIALS",
        message: "Invalid credentials"
      });
    }
    
    request.log.error({ event: 'SIGNUP_ERROR', error: error.message });
    return reply.status(500).send({
      error: "AUTH_ERROR",
      message: "Signup failed"
    });
  }
});
```

---

## Example 3: Logout Flow (Correct)

```typescript
// api/src/routes/auth/logout.ts

app.post('/auth/logout', async (request, reply) => {
  const sessionToken = request.headers.authorization?.split(' ')[1];
  
  if (!sessionToken) {
    // No session provided - idempotent, just return success
    return reply.status(200).send({ success: true });
  }
  
  try {
    // Find and invalidate session
    const session = await prisma.session.findUnique({
      where: { token: sessionToken }
    });
    
    if (session) {
      await prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() }
      });
    }
    
    // Always return success (idempotent)
    request.log.info({
      event: 'LOGOUT',
      session_id_hash: hash(sessionToken)
    });
    
    return reply.status(200).send({ success: true });
    
  } catch (error) {
    // Even on error, return success (idempotent)
    request.log.error({ event: 'LOGOUT_ERROR', error: error.message });
    return reply.status(200).send({ success: true });
  }
});
```

---

## Example 4: Identity Resolution Validation

```typescript
// Test: Ensure identity → User mapping is unique

test('identity to user mapping is unique', async () => {
  // Create user 1
  const user1 = await prisma.user.create({
    data: {
      profile: { name: 'User 1' },
      identities: {
        create: { provider: 'google', subject: 'google-123' }
      }
    }
  });
  
  // Try to create user 2 with same identity
  const user2 = await expect(
    prisma.user.create({
      data: {
        profile: { name: 'User 2' },
        identities: {
          create: { provider: 'google', subject: 'google-123' }  // Same identity
        }
      }
    })
  ).rejects.toThrow('Unique constraint failed');
  
  // Verify only user1 exists
  const resolved = await prisma.user.findUnique({
    where: { provider_subject: { provider: 'google', subject: 'google-123' } }
  });
  
  expect(resolved.id).toBe(user1.id);
});
```

---

## Example 5: Anti-Enumeration Test

```typescript
// Test: Verify login doesn't reveal account existence

test('login failure never reveals account existence', async () => {
  // Create user
  const user = await prisma.user.create({
    data: {
      profile: { name: 'Test User' },
      identities: { create: { provider: 'google', subject: 'real-id' } }
    }
  });
  
  // Unknown identity response
  const unknownResponse = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { provider: 'google', proof: 'valid-proof-for-unknown-id' }
  });
  
  // Wrong password response (same identity as real user)
  const wrongPassResponse = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { provider: 'google', proof: 'invalid-proof-for-real-id' }
  });
  
  // Both should have identical response
  expect(unknownResponse.statusCode).toBe(400);
  expect(wrongPassResponse.statusCode).toBe(400);
  expect(unknownResponse.json()).toEqual({
    error: 'AUTH_INVALID_CREDENTIALS',
    message: expect.any(String)
  });
  expect(wrongPassResponse.json()).toEqual({
    error: 'AUTH_INVALID_CREDENTIALS',
    message: expect.any(String)
  });
  
  // Response times should be similar (no timing side-channels)
  // (In practice, hash comparison and proof validation take similar time)
});
```

---

## Example 6: Schema with Identity Mapping

```prisma
// prisma/schema.prisma

model User {
  id        String    @id @default(cuid())
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  profile   Profile?
  sessions  Session[]
  identities UserIdentity[]
  
  @@unique([id])
}

model UserIdentity {
  id        String    @id @default(cuid())
  userId    String    @unique  // One identity per User
  provider  String    // google, github, etc.
  subject   String    // Provider's user ID
  
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Unique constraint: one identity per provider per subject
  @@unique([provider, subject])
  @@index([userId])
  @@index([provider])
}

model Session {
  id        String    @id @default(cuid())
  userId    String
  token     String    @unique  // Session token (hashed in practice)
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime  @default(now())
  
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([token])
}

model Profile {
  id        String    @id @default(cuid())
  userId    String    @unique
  name      String
  email     String?
  
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## Example 7: Invariant Violation Detection

```typescript
// Test: Detect if two Users map to same identity (system error)

test('detects duplicate identity mapping (system error)', async () => {
  // Manually corrupt data (in real system, this would indicate a bug)
  const user1 = await prisma.user.create({
    data: { profile: { name: 'User 1' } }
  });
  
  const user2 = await prisma.user.create({
    data: { profile: { name: 'User 2' } }
  });
  
  // Manually create duplicate mapping (bypassing constraint)
  // This should never happen in production, but if it does:
  
  const duplicates = await prisma.user.findMany({
    where: {
      identities: {
        some: { provider: 'google', subject: 'google-123' }
      }
    }
  });
  
  if (duplicates.length > 1) {
    // CRITICAL: System is corrupted
    request.log.error({
      event: 'INVARIANT_VIOLATION',
      code: 'DUPLICATE_USER_IDENTITY',
      severity: 'CRITICAL',
      duplicateCount: duplicates.length
    });
    
    // Alert ops, halt auth operations
    throw new Error('Identity mapping corrupted');
  }
});
```