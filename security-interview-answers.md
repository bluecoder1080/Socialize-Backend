# Security Interview Q&A for Socialize Backend

Use this as a speaking script. Each answer is structured for clarity: decision, rationale, tradeoff, and production-grade improvements.

## 1) Why did you use JWT over sessions? What are the tradeoffs?

### Strong answer

I used JWT-based auth because it keeps the backend mostly stateless and easier to scale horizontally. Any API instance can validate the token without checking shared session storage.

### Why this is good

- Works well with load-balanced microservice or multi-instance setups.
- Reduces dependency on centralized in-memory session stores for basic auth checks.
- Fits REST-style APIs where each request is self-contained.

### Tradeoffs

- Revocation is harder than sessions: once issued, a JWT remains valid until expiry unless you add deny-lists or token versioning.
- Token payload size adds overhead to every request.
- Secret/key management becomes critical.

### Interview closing line

JWT gives scale and simplicity for distributed APIs, but sessions are stronger for immediate revocation and strict server-side control.

## 2) Why store JWT in a cookie instead of localStorage?

### Strong answer

I prefer cookie transport for browser clients because I can set security flags like HttpOnly, Secure, and SameSite. That reduces token exposure to JavaScript and mitigates common attack paths.

### Cookie vs localStorage

- Cookie with HttpOnly: JavaScript cannot read token directly.
- localStorage: any successful XSS can exfiltrate token immediately.
- Cookie automatically attaches with requests to same origin, which simplifies auth wiring.

### Important caveat

Cookies introduce CSRF risk unless SameSite and/or CSRF tokens are configured properly.

### Interview closing line

localStorage is easier, but cookies with proper flags are safer for browser-based auth in most production setups.

## 3) What are HttpOnly, Secure, and SameSite cookie flags? Why do they matter?

### Strong answer

These flags harden cookie handling at the browser layer.

- HttpOnly: blocks JavaScript access to cookie, reducing token theft via XSS.
- Secure: cookie is sent only over HTTPS, preventing leakage on plaintext HTTP.
- SameSite: controls cross-site cookie sending and helps reduce CSRF.

### Typical production setup

- Access token cookie: HttpOnly + Secure + SameSite=Lax (or Strict where possible).
- If cross-site frontend/backend is required, use SameSite=None + Secure and add CSRF protection.

### Interview closing line

These flags are low-effort, high-impact protections that should be default in production.

## 4) How does bcrypt work? What is a salt and why is it needed?

### Strong answer

bcrypt is a password-hashing algorithm that is intentionally slow and adaptive. It uses a unique random salt per password and a configurable work factor (cost).

### Why salt matters

- Salt ensures identical passwords do not produce identical hashes.
- It defeats rainbow-table precomputation attacks.
- Even if two users have same password, stored hashes differ.

### Why bcrypt is good

- Slow hashing increases attacker cost for brute-force cracking.
- Work factor can be increased over time as hardware gets faster.

### Interview closing line

bcrypt protects password storage by combining per-password salting with computational hardness.

## 5) What is the difference between hashing and encryption?

### Strong answer

Hashing is one-way, encryption is two-way.

- Hashing: irreversible fingerprint; used for password verification.
- Encryption: reversible with key; used when original data must be recovered.

### Practical use

- Passwords: hash only, never encrypt.
- Sensitive business data that must be read later: encrypt.

### Interview closing line

If you need to verify equality, hash. If you need to recover plaintext later, encrypt.

## 6) How would you prevent brute force attacks on /signin?

### Strong answer

I would use layered controls, not just one control.

### Recommended controls

- Rate limiting by IP and by account/email key.
- Account lockout or progressive delays after repeated failures.
- CAPTCHA after threshold failures.
- Uniform error message for invalid email/password to avoid account enumeration.
- Login event logging and anomaly detection.
- Optional MFA for high-risk accounts.

### Express-level implementation idea

- Apply route-specific limiter to /signin.
- Track failed attempts in Redis with TTL for distributed environments.

### Interview closing line

Brute-force defense should combine throttling, detection, and user-friction controls based on risk.

## 7) What is CSRF? How does SameSite cookie protect against it?

### Strong answer

CSRF is when a malicious site causes a victim’s browser to send authenticated requests to your site using existing cookies.

### SameSite protection

- SameSite=Strict: cookie never sent on cross-site requests.
- SameSite=Lax: sends on top-level safe navigations, blocks many cross-site POST scenarios.
- SameSite=None: allows cross-site cookie usage, so you must add CSRF tokens and strict origin checks.

### Additional protections

- CSRF token (double-submit or synchronizer pattern).
- Validate Origin/Referer headers for sensitive state-changing requests.

### Interview closing line

SameSite reduces CSRF surface, but token-based CSRF defense is still required in cross-site architectures.

## 8) What is XSS? How does HttpOnly cookie help?

### Strong answer

XSS happens when attacker-controlled script executes in your web app context, typically due to unsanitized input/output.

### HttpOnly benefit

- If token is in HttpOnly cookie, injected JavaScript cannot read it directly.
- This prevents easy token exfiltration compared to localStorage tokens.

### Important limitation

- HttpOnly does not stop XSS itself.
- Attacker scripts can still perform actions in user context while page is open.

### Full defense strategy

- Output encoding and input validation.
- Content-Security-Policy.
- Avoid dangerous HTML injection patterns.

### Interview closing line

HttpOnly reduces impact of XSS on token theft, but XSS prevention must still be treated as a first-class requirement.

## 9) How do you refresh a JWT token when it expires?

### Strong answer

Use short-lived access tokens and long-lived refresh tokens with rotation.

### Typical flow

1. Access token expires.
2. Client calls refresh endpoint with refresh token cookie.
3. Server validates refresh token against DB/allow-list and token family state.
4. Server issues new access token and a new refresh token (rotation).
5. Old refresh token is invalidated.

### Why rotation matters

If refresh token is stolen and reused, reuse detection can revoke the whole token family.

### Security best practices

- Store refresh tokens hashed in DB.
- Bind refresh tokens to device/session metadata.
- Revoke on logout/password change/suspicious activity.

### Interview closing line

Short access token plus rotating refresh token gives a good balance of UX and security.

## 10) What happens if a JWT secret is leaked? How do you rotate it?

### Strong answer

If the signing secret leaks, attackers can mint valid tokens. That is a critical incident requiring immediate key rotation and token invalidation strategy.

### Incident response

- Introduce key IDs and support multiple active verification keys temporarily.
- Start signing new tokens with new key immediately.
- Invalidate existing tokens based on issued-at cutoff, token version, or deny-list.
- Force re-login for impacted sessions.
- Audit logs for abuse and scope blast radius.

### Preventive design

- Keep secrets in vault/KMS, never in source control.
- Use periodic key rotation policy.
- Prefer asymmetric keys (private signs, public verifies) for larger distributed systems.

### Interview closing line

A leaked JWT secret is treated as compromise: rotate keys fast, invalidate trust, and re-establish sessions securely.

## Bonus: 30-second summary answer for auth design

I use JWT for stateless scaling, store it in hardened cookies for browser security, hash passwords with bcrypt and per-password salts, and defend auth endpoints with rate limiting and anomaly controls. For token lifecycle, I use short-lived access tokens and rotating refresh tokens. I also plan key rotation and incident response for secret compromise as part of production readiness.

## Rapid Revision Checklist

- Explain JWT vs session tradeoff clearly.
- Mention cookie flags and why each matters.
- Distinguish XSS and CSRF correctly.
- Describe brute-force protection as layered controls.
- Explain refresh-token rotation and reuse detection.
- Explain secret leak incident response and key rotation.
