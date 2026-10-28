# Tablet Zero optional anonymous intake API

**Not deployed by this pull request.** GitHub Pages cannot receive or privately store anonymous POST submissions. This separate Cloudflare Worker + D1 service provides a moderation queue without requiring visitors to have GitHub accounts.

## Setup (owner action)

1. Create a Cloudflare account/project and a D1 database: `npx wrangler d1 create tabletzero-submissions`.
2. Copy `wrangler.toml.example` to `wrangler.toml` (gitignored) and replace the D1 UUID. From `intake/`, apply migrations via `npx wrangler d1 migrations apply tabletzero-submissions --remote`.
3. Create a Cloudflare Turnstile widget restricted to **tabletzero.org** (and www if used). Server verification is mandatory. Set private values with `npx wrangler secret put TURNSTILE_SECRET`, `ADMIN_KEY`, `RATE_SALT`; optionally `AGENT_KEY` for known automated operators. Never store these in Git.
4. Deploy the Worker and use a dedicated `api.tabletzero.org` custom domain or carefully review the generated workers.dev hostname. **HTTPS required**.
5. In `assets/intake-config.js`, set the actual HTTPS API base URL and the PUBLIC Turnstile site key; commit the changed config to deploy the form. Until then, the page exports JSON locally and explicitly reports that direct intake is unavailable.
6. Test a real submission and an admin-only review before advertising the service. Rotate keys if leaked. Avoid logging submission bodies or verification tokens.

## API and consent

`POST /v1/submissions` accepts JSON with `kind` (book, objection, response, trial, revision), `title`, `body`, `author`, `authorship` (human, human_ai, ai_generated), `model`, `model_version`, `prompt`, `editing`, `book_id`, `consent:true`, and `turnstile` token for human visitors. Returns HTTP 202 with a receipt ID, never public content. For approved automation use `x-tablet-agent-key` privately instead of Turnstile. Agents do not gain automatic publication or doctrine-editing powers. Do not embed the private agent key in public client JavaScript.

`GET /v1/admin/submissions?status=pending` and `PATCH /v1/admin/submissions/{id}` require an administrator Bearer token. Approved means **ready for separate editorial publication**, not instantly live. No public moderation index exposed.

## Moderation/privacy

- Default status is pending. No unreviewed text gets publicly rendered.
- Submitters must consent to licensed publication of approved contribution text under CC BY 4.0, and certify rights to share it. Drafts not approved remain private.
- A salted daily rate fingerprint reduces spam without storing plain visitor IP addresses. No per-user account is created. The operator must publish a retention policy and provide a deletion/contact mechanism **before activating production intake**.
- Replace the simple shared-key admin interface with proper access control if multiple moderators are added. Worker code is a minimal launch backend, not a finished abuse-defense platform.
- Recommended: do not enable public agent keys for unknown parties, add monitoring, and apply Cloudflare rate-limiting rules.

Source: [Cloudflare D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/), [Turnstile server verification](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
