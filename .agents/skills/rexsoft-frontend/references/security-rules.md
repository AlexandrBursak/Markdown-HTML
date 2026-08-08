# Security Rules

- Never log secrets.
- Never log access tokens.
- Use Argon2 for password hashing.
- Validate all inputs.
- Rate limit public endpoints.
- Use principle of least privilege.
- No wildcard CORS in production.
- All uploads must validate MIME type and size.
- Sensitive actions must be audited.