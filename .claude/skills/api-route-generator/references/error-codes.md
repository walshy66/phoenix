# Standard Error Codes

Use these ONLY. Never expose raw database or application errors.

```json
{
    "VALIDATION_ERROR": {
        "statusCode": 400,
        "code": "VALIDATION_ERROR",
        "message": "The request body or parameters failed validation."
    },
    "NOT_FOUND": {
        "statusCode": 404,
        "code": "NOT_FOUND",
        "message": "The requested resource was not found."
    },
    "UNAUTHORIZED": {
        "statusCode": 401,
        "code": "UNAUTHORIZED",
        "message": "Authentication is required to access this resource."
    },
    "FORBIDDEN": {
        "statusCode": 403,
        "code": "FORBIDDEN",
        "message": "You do not have permission to perform this action."
    },
    "DATABASE_ERROR": {
        "statusCode": 500,
        "code": "DATABASE_ERROR",
        "message": "A database error occurred while processing the request."
    },
    "INTERNAL_SERVER_ERROR": {
        "statusCode": 500,
        "code": "INTERNAL_SERVER_ERROR",
        "message": "An unexpected internal server error occurred."
    }
}
```

## Error Response Format

Always return errors in this format:

```typescript
return reply.status(statusCode).send({
  error: "ERROR_CODE",
  message: "User-facing message (from the codes above)",
  // Optional: details field for debugging (internal only, never expose in prod)
});
```

## When to Use Each Code

| Situation | Code | Status |
|-----------|------|--------|
| Zod validation fails | VALIDATION_ERROR | 400 |
| Resource doesn't exist | NOT_FOUND | 404 |
| No user identity in request | UNAUTHORIZED | 401 |
| User authenticated but lacks access to resource | FORBIDDEN | 403 |
| Database query failed unexpectedly | DATABASE_ERROR | 500 |
| Other unexpected errors | INTERNAL_SERVER_ERROR | 500 |

**Golden Rule**: Log the full error internally with `request.log.error(error)`, but only send the standardized code and message to the client.