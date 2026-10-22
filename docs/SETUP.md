# Migration handoff — October 21, 2026

## Decisions and completed work

- Preserve the approved site, static HTML/CSS/JS in `public/`, Pages Functions in `functions/`. No added dependencies.
- Repository `aaronsaffa/agouraaccounting`; migration work and pushes on `dev` only. `main` remains the requirements checkpoint (`13bcefc`). Never merge, deploy manually, or change DNS without new authorization.
- Cloudflare Pages project `agouraaccounting` is connected. Owner reports dev preview deployment succeeded and appearance is approved.
- Build: None preset, `exit 0`, output `public`, root blank; production branch `main`, preview branch `dev`.
- Stable alias `https://dev.agouraaccounting.pages.dev` confirmed available with HTTP 200 on October 21, 2026. Use this URL for form testing; unique deployment URLs are intentionally not in the initial allowlist.
- Replaced Google reCAPTCHA with Cloudflare Turnstile. The widget must be created in **Managed** mode. Client uses submission-time execution and interaction-only appearance, action `contact` or `messaging`.
- Server verifies Turnstile success, exact configured hostname and expected form action before Resend. Missing configuration fails closed; no bypass or fake acceptance. Tokens are single-use and expire after five minutes. Each attempt uses a new widget; errors, expiry and timeouts release Send and retain input.
- Secret keys stay in Cloudflare encrypted bindings or ignored local `.dev.vars`; `.env.example` has empty key placeholders. No live keys are committed.
- Original read-only capture remains unchanged. Asset audit, syntax checks, four backend test groups and one browser-controller test passed. Controller tests mock the DOM and services; they do not prove live widget behavior.

## Remaining setup, in order

Current position: **step 1 pending**. Turnstile and Resend are not yet configured. Guide the owner through one step per response; never request keys in chat. Update this file as milestones are confirmed.

1. In Cloudflare dashboard → Turnstile → Add widget: name `Agoura Accounting dev`, hostname `dev.agouraaccounting.pages.dev`, mode **Managed**. Leave pre-clearance off. Create it and keep the keys page open. No DNS changes are needed for Turnstile.
2. In Workers & Pages → `agouraaccounting` → Settings → Variables and Secrets, select **Preview**. Enter the public site key as `TURNSTILE_SITE_KEY`, the secret key directly as encrypted `TURNSTILE_SECRET_KEY`, and plain `TURNSTILE_HOSTNAMES=dev.agouraaccounting.pages.dev`. Remove obsolete `RECAPTCHA_*` bindings if present. Do not put placeholders or testing keys into the live preview bindings.
3. Sign into/create Resend. Confirm the destination (`CONTACT_TO`) privately; the source mentions both `asaffa@gmail.com` and `info@agouraaccounting.com`, so do not assume one. For an initial no-DNS test, use Resend's permitted testing sender/recipient restrictions shown in its dashboard. A custom sender requires a verified domain; do not add DNS records as part of the currently authorized work. Stop and discuss that separately if needed.
4. Create a Resend API key with sending access, restricted to the intended domain where supported. Enter it directly as encrypted `RESEND_API_KEY` in Pages **Preview**. Enter authorized `CONTACT_FROM` and confirmed `CONTACT_TO` as plain variables. All six bindings must be present before sending is enabled. Never share keys in chat.
5. After bindings are saved, trigger a fresh dev preview build so it receives the bindings (request/authorize a new dev commit or retry the preview in Cloudflare). Do not deploy `main`.
6. Test `/`, `/contact-us`, and the messaging dialog at the stable alias on desktop/mobile. Check challenge interaction, expiry/retry, retained fields on failure and provider rejection, and real success only after Resend returns an email ID. Confirm the message in Resend and the recipient inbox. Report ambiguous network failures before manually retrying: provider acceptance followed by a lost browser response can result in duplicate email on resubmission.
7. Record live verification results here and in `VALIDATION.md`. Production secrets, domain verification, promotion to main, custom domains, and DNS remain separate future work.

## References

- [Widget configuration](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/)
- [Server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Hostname restrictions](https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/)

Local preview `/` and `/contact-us` returned HTTP 200; unconfigured `/api/config` returned disabled with no site key. Browser inventory was empty in this session, so a fresh desktop/mobile screenshot comparison could not be performed.
