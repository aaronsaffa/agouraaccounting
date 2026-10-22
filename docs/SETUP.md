# Migration handoff — October 22, 2026

## Decisions and completed work

- Preserve the approved site, static HTML/CSS/JS in `public/`, Pages Functions in `functions/`. No added dependencies.
- Repository `aaronsaffa/agouraaccounting`; routine work on `dev`. On October 22, 2026 the owner explicitly authorized pushing pending dev documentation and merging/pushing the approved migration into `main` to trigger a production build for pre-DNS testing. No DNS change or manual deployment is authorized. The pre-migration main checkpoint is `13bcefc`.
- Cloudflare Pages project `agouraaccounting` is connected. Owner reports dev preview deployment succeeded and appearance is approved.
- Build: None preset, `exit 0`, output `public`, root blank; production branch `main`, preview branch `dev`.
- Stable alias `https://dev.agouraaccounting.pages.dev` confirmed available with HTTP 200 on October 21, 2026. Use this URL for form testing; unique deployment URLs are intentionally not in the initial allowlist.
- Replaced Google reCAPTCHA with Cloudflare Turnstile. The widget must be created in **Managed** mode. Client uses submission-time execution and interaction-only appearance, action `contact` or `messaging`.
- Server verifies Turnstile success, exact configured hostname and expected form action before Resend. Missing configuration fails closed; no bypass or fake acceptance. Tokens are single-use and expire after five minutes. Each attempt uses a new widget; errors, expiry and timeouts release Send and retain input.
- Secret keys stay in Cloudflare encrypted bindings or ignored local `.dev.vars`; `.env.example` has empty key placeholders. No live keys are committed.
- Original read-only capture remains unchanged. Asset audit, syntax checks, four backend test groups and one browser-controller test passed. Controller tests mock the DOM and services; they do not prove live widget behavior.

## Current state and remaining work

- Preview accepted by owner: all three forms (home, contact-us, messaging) succeed and deliver email; desktop and mobile appearance approved.
- All six Preview bindings are encrypted Secrets. `/api/config` reports enabled.
- Turnstile error 110200 was caused by testing `0709b88f.agouraaccounting.pages.dev` instead of the authorized stable alias. Use the stable alias; do not add random deployment hostnames.
- Owner confirmed all six Production bindings are now Secrets, including `CONTACT_TO`. This avoids dashboard Text values being superseded by this Wrangler-managed configuration. The public site key is intentionally returned by `/api/config`; no secret keys are recorded in Git.
- Owner confirmed widget authorization for `agouraaccounting.pages.dev`, `agouraaccounting.com`, and `www.agouraaccounting.com`. Production `TURNSTILE_HOSTNAMES` should contain these three comma-separated hostnames.
- Production promotion authorized; Git push triggers the Pages build. Production runtime configuration, actual form delivery and appearance must be checked at `https://agouraaccounting.pages.dev` after the build succeeds.

Next steps:

1. Complete the authorized push of dev and merge/push to main. Retain all history; no force pushes.
2. Check the production Pages URL, `/contact-us`, static assets and public `/api/config` after build completion. Presence of bindings does not prove their values are correct.
3. Owner tests all three forms on the production Pages URL and confirms inbox delivery; confirm desktop/mobile appearance. No automatic email submission or challenge solving is part of repository checks.
4. Only after production acceptance, separately authorize and plan custom-domain activation and DNS cutover. Check existing DNS and preserve mail records before any change. Public-domain TLS/routing requires verification after cutover.

Credentials are entered directly in Cloudflare. All six bindings can be Secrets: `RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_TO`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `TURNSTILE_HOSTNAMES`. Any provider acceptance followed by a lost browser response may result in duplicate email if a visitor retries.

## References

- [Widget configuration](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/)
- [Server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Hostname restrictions](https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/)

Local preview `/` and `/contact-us` returned HTTP 200; unconfigured `/api/config` returned disabled with no site key. Browser inventory was empty in this session, so a fresh desktop/mobile screenshot comparison could not be performed.
