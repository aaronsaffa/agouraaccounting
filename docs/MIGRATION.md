# Migration notes

## Repository and source

- Original remote: `https://github.com/aaronsaffa/agouraaccounting.git`.
- Initial state: empty checkout, unborn `main`, configured upstream `origin/main` marked gone. No fetch or remote modification was needed.
- Established `main` with project requirements and secret ignores, then created `dev` for implementation.
- Read-only capture: `../agoura-migration/reference-download`; log: `../agoura-migration/download.log`.
- Log reports 65 downloads (about 12 MB), with only the isteam host's `robots.txt` returning 404. The directory currently contains 68 files; the inventory records what was present at migration time.
- `capture-manifest.json` records SHA-256 hashes of all 68 files. Audit verifies that none changed.
- Original capture includes two public pages: `/` and `/contact-us`. No additional public page paths were found in page links or the captured navigation configuration.

## Preserved appearance and content

Retained original HTML structure, class names, inline styles, all CSS media queries, font definitions and licensing comments, hero image resolution variants, logo variants, font scaling, page titles, Open Graph/Twitter values and viewport/theme metadata. Business text is unchanged, including the original 2022 copyright year. Image metadata now points to locally hosted images on the original canonical domain. Added canonical links and a local favicon. Navigation uses root-relative clean paths.

The original lazy-image placeholders did not contain the three actual lower-page logos. Downloaded the existing Recklab, Enrolled Agent, and Thervo images, including their original pixel-density variants, into this repository from the exact URLs in the captured lazy-image attributes. They now load natively without the GoDaddy runtime. Browser screenshots verified them against the live site.

## GoDaddy dependencies replaced

| Original dependency | Replacement |
| --- | --- |
| wsimg image/font hosting and transformed image URLs | Local assets with retained captured variants |
| UX/radpack/React widget hydration and theme initialization | Captured static HTML/CSS, native JS interactions |
| Header dynamic font sizing | Standalone copy of captured scaler, without hosting runtime |
| GoDaddy contact.apps-api.instantpage.secureserver.net forms | `/api/contact` Cloudflare Pages Function + Resend |
| GoDaddy Conversations/Reamaze/Connections messaging | Same floating button; accessible local email dialog |
| GoDaddy CAPTCHA registration | Client-owned reCAPTCHA v3 configuration and server verification |
| GoDaddy tracking, TCC, TTI and telemetry | Removed |
| Uncaptured `/sw.js` registration | Removed; no offline behavior claimed |
| GoDaddy webmanifest icon URLs | Local logo |
| Powered by GoDaddy footer | Removed inaccurate attribution text; retained its spacing |

The reCAPTCHA disclosure retains exact original wording and reserved space. It is visible only when a configured reCAPTCHA script has loaded. The local unconfigured preview does not claim CAPTCHA protection.

## Forms and known differences

The capture has no native form action and no input names for user fields: GoDaddy hydration supplied submission behavior. Its contact widget configuration lists optional attachments, but neither captured HTML nor the live desktop/mobile forms rendered an attachment control during inspection. The migration preserves the visible fields; attachment upload support is not implemented. Confirm whether attachments are expected before enabling them.

The floating messaging widget declares `notificationPreference: EMAIL`, `formEmail: asaffa@gmail.com`, and required Name/Mobile/Email/How can we help? fields. Local implementation retains those labels, welcome text, and success wording. It uses an accessible modal with the original colors/fonts; precise popup layout and GoDaddy Conversations/SMS features are not reproduced. The unopened pages and launcher retain the original appearance.

## External dependencies remaining

- Google reCAPTCHA v3, loaded only when the email backend and CAPTCHA bindings are configured; Google's privacy/terms links remain.
- Server-side Google siteverify and Resend HTTPS email API.
- Public canonical URL and social-image URLs intentionally retain `https://agouraaccounting.com`; they will resolve to local images after migration.
- No frontend framework, external font request, GoDaddy asset request, analytics service, or hosting-runtime script remains.

## Verification and limits

- Original capture hash audit and all HTML/CSS asset existence checks passed.
- JavaScript syntax checks passed under Deno 2.9.7.
- Three backend test groups cover configuration, validation/origin/method/honeypot, CAPTCHA failures, provider failure/malformed responses/network errors, and accepted delivery using mocks. No real email was sent.
- Browser checks use the live original and local preview at 1440×900 and 390×900, including screenshots after lazy-image loading. Local navigation, failed submission with retained input, and messaging open/close are checked.
- Final measured results are recorded in `VALIDATION.md`; raw screenshots and reports are kept locally in ignored `artifacts/`.
- Cloudflare's deployed routing/runtime, live credentials, production CAPTCHA, actual mail acceptance/inbox arrival, spam volume, and email deliverability remain untested.
- Browser comparison does not cover every device, browser engine, pixel density, or breakpoint. Original-site submissions were never exercised.

References: [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/), [Resend send-email API](https://resend.com/docs/api-reference/emails/send-email).
