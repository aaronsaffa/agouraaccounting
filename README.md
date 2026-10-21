# Agoura Accounting — Cloudflare Pages migration

Preservation migration of the existing GoDaddy site, using its September 28, 2026 wget capture. No redesign. Static deployable files are in `public/`; server handlers are Cloudflare Pages Functions in `functions/api/`. There is no application dependency or build step.

## Local preview

```sh
python3 scripts/preview.py
```

Open http://127.0.0.1:8788 and http://127.0.0.1:8788/contact-us. This static preview deliberately returns unavailable for email delivery. It never sends mail or simulates success.

For the actual Cloudflare runtime, with Node and Wrangler installed:

```sh
npx wrangler pages dev public --port 8788
```

Stop the static preview first to free the port. Configure local bindings in ignored `.dev.vars`, following `.env.example`. No credentials belong in `public/` or Git.

## Cloudflare Pages preview setup

- Framework preset: **None**; build command: `exit 0`; build output directory: `public`; root directory: leave blank (repository root). No dependencies or application build are required. The no-op build command follows [Cloudflare’s static HTML guidance](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/) and allows Pages Functions to be packaged.
- Connect GitHub repository `aaronsaffa/agouraaccounting`. Production branch: `main`; preview deployments: custom branches, include only `dev`. Implementation is on `dev`; `main` contains the initial requirements checkpoint. Keep production deployments disabled while reviewing the migration. Creating a Pages project may trigger an initial build; project creation and deployment are left to the owner.
- Pages Functions must be included; use Git integration or Wrangler, rather than dashboard static drag-and-drop uploads.
- `wrangler.toml` declares the output directory. `/api/*` uses Functions; other requests serve static assets. Cloudflare serves `contact-us.html` at `/contact-us`; the legacy extension path redirects to the clean path.
- Repository preparation permits pushing `dev` and establishing `main` on origin. No Cloudflare deployment, DNS change, or original-site modification is part of this preparation.

## Contact delivery configuration required

Before starting the preview deployment, set all six bindings in Cloudflare Pages under **Settings → Variables and Secrets → Preview**. Store `RESEND_API_KEY` and `RECAPTCHA_SECRET_KEY` as encrypted secrets; the other values can be plain environment variables. No build-time variables are required. Production bindings are separate.

| Binding | Needed value |
| --- | --- |
| `RESEND_API_KEY` | Secret API key for an authorized Resend account |
| `CONTACT_TO` | Confirmed destination email; not inferred from public address |
| `CONTACT_FROM` | Sender address on a domain verified with Resend |
| `RECAPTCHA_SITE_KEY` | Public key for a client-owned reCAPTCHA v3 registration |
| `RECAPTCHA_SECRET_KEY` | Matching secret key |
| `RECAPTCHA_HOSTNAMES` | Comma-separated exact permitted hostnames, e.g. `dev.<project>.pages.dev`; no scheme, path, or wildcard |

The capture exposes `asaffa@gmail.com` as the messaging recipient and displays `info@agouraaccounting.com` on the home page. Confirm which recipient should receive both forms and messaging. Register the preview hostname with reCAPTCHA as well as listing it in `RECAPTCHA_HOSTNAMES`. Prefer the stable `dev.<project>.pages.dev` preview alias; unique deployment hostnames must also be allowed if used for form testing. Do not reuse GoDaddy's platform CAPTCHA keys. Resend is the prepared adapter; a different provider would require updating the backend.

Both existing contact forms retain optional Name and Message and required Email. The messaging dialog retains Name, Mobile, Email, and How can we help? Fields and business text are retained from the captured widget configuration. It sends email through the same handler; GoDaddy Conversations/SMS integration is replaced, not reproduced.

The backend checks same-origin JSON requests, field types and limits, a honeypot, reCAPTCHA v3 action/score/hostname, and email provider acceptance. Missing credentials, CAPTCHA errors, provider rejection, malformed responses, and timeouts return failure. Visitors keep their input after failure. Only a successful provider response with an email ID yields success. Acceptance means queued by the provider; it does not guarantee inbox arrival.

## Validation

```sh
python3 scripts/audit.py
deno check public/assets/site.js public/assets/font-scaler.js functions/api/contact.js functions/api/config.js
deno test tests/contact.test.js
```

See [migration notes](docs/MIGRATION.md) for provenance, comparisons, remaining dependencies, and verification limits. `scripts/browser-qa.js` connects to a separately launched headless Chromium-compatible browser on localhost:9222; it does not submit to the original site. Screenshots and browser reports go to ignored `artifacts/`.

`python3 scripts/migrate.py` regenerates the two pages, local copies, font-scaling helper, manifest, and original-capture hash inventory. It only reads `../agoura-migration/reference-download`. The three manually retrieved lazy logos and handwritten interactions/backend are separate inputs and are not overwritten. Hashed assets are named by source path to preserve all captured responsive variants.
