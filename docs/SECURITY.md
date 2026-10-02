# Security and Privacy

This project is a local development/portfolio demo. It has useful security primitives, but the current API is not safe to expose publicly without additional controls.

## Implemented

- Login uses Passlib password hashes; new hashes use bcrypt-sha256 and existing bcrypt hashes remain verifiable.
- JWT access tokens are signed using the configured `SECRET_KEY` and expire after 24 hours.
- `get_current_user` checks the database user and active status for routes that use it.
- User registration uses the `admin` role dependency.
- The demo seeder creates default demo identities only when `APP_ENV=development`, and leaves existing accounts unchanged.
- `.gitignore` excludes `.env`, local databases, `.venv`, `node_modules`, and frontend build output. `.env.example` contains placeholders only.
- Production settings reject a short/default/placeholder signing secret.

## High-Priority Gaps

1. **Route authorization:** Many API routes do not depend on `get_current_user` or `require_roles`. In particular, admin user/status/role endpoints, agent execution, and CSV import/export currently lack route-level auth. Role metadata returned at login and client-side permissions do not secure these endpoints.
2. **Dashboard access:** `ProtectedRoute` checks for a user, not that the role is allowed to open a route. `/` redirecting by role is navigation behavior, not authorization.
3. **Development fallback:** With `DEBUG=True`, `get_current_user` can return the seeded admin when a protected route receives no token. Keep DEBUG disabled outside local development and remove the fallback before deployment.
4. **CORS:** `backend/main.py` allows all origins and credentials. Use an explicit trusted-origin allowlist.
5. **CSV handling:** No backend-enforced file-size limit, robust row schema validation, or consistent numeric error handling. Import/export access is not protected.
6. **LLM key handling:** `LLMClient` reads `OPENAI_API_KEY` from process environment. Do not commit it. The standalone service is optional and not part of agent workflow.
7. **Dataset provenance:** Verify that the raw transaction dataset is synthetic or that its license/privacy terms allow publication. Never place personal data in screenshots.

## Local Configuration

Copy `.env.example` to `.env` only if `.env` does not already exist. Keep the file private. For production, use a securely generated random key (at least 32 characters) and a production database URL; do not use any demo user or development secret. A placeholder in `.env.example` is not a usable production secret.

The database, tokens, model files, and customer details should be treated as sensitive local data. Avoid printing stored password hashes, API tokens, or raw customer records during debugging.

## Before Deployment

- Add and test route-level authentication and role authorization for every protected resource.
- Remove the debug admin fallback; set `DEBUG=False` and validate production settings at startup.
- Restrict CORS, use HTTPS and secure hosting, configure trusted hosts, and apply rate limiting to login and expensive operations.
- Enforce upload limits, schema/value validation, safe transaction rollback, duplicate rules, and import authorization.
- Review JWT storage/XSS exposure; the current frontend stores tokens in `localStorage`.
- Add security-focused integration tests, dependency scanning, and an explicit privacy/data-retention policy.
- Verify dataset licenses and choose an appropriate project license only with maintainer approval.
