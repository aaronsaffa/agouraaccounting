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

## Future Cloudflare Pages setup (not performed)

- Framework: None; build command: blank; output directory: `public`; root directory: repository root.
- Production branch: `main`; preview branch: `dev`. Implementation is currently on `dev`; `main` contains the initial requirements checkpoint.
- Pages Functions must be included; use Git integration or Wrangler, rather than dashboard static drag-and-drop uploads.
- `wrangler.toml` declares the output directory. `/api/*` uses Functions; other requests serve static assets. Cloudflare serves `contact-us.html` at `/contact-us`; the legacy extension path redirects to the clean path.
- No push, deployment, DNS change, or original-site modification has been performed.

## Contact delivery configuration required

Set these in Cloudflare Pages separately for production and preview as appropriate:

| Binding | Needed value |
| --- | --- |
| `RESEND_API_KEY` | Secret API key for an authorized Resend account |
| `CONTACT_TO` | Confirmed destination email; not inferred from public address |
| `CONTACT_FROM` | Sender address on a domain verified with Resend |
| `RECAPTCHA_SITE_KEY` | Public key for a client-owned reCAPTCHA v3 registration |
| `RECAPTCHA_SECRET_KEY` | Matching secret key |
| `RECAPTCHA_HOSTNAMES` | Comma-separated permitted hostnames, including any intended preview host |

The capture exposes `asaffa@gmail.com` as the messaging recipient and displays `info@agouraaccounting.com` on the home page. Confirm which recipient should receive both forms and messaging. Do not reuse GoDaddy's platform CAPTCHA keys. Resend is the prepared adapter; a different provider would require updating the backend.

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
