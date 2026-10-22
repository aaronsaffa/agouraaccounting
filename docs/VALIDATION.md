# Local verification — October 11, 2026

Live original compared with migrated local pages using headless Brave/Chromium. All four comparison pairs had identical page heights and identical recorded heading positions, sizes, and font sizes.

| Page | Viewport | Original height | Local height | Local overflow / missing images / browser errors |
| --- | --- | --- | --- | --- |
| Home | 1440 × 900 | 2890 px | 2890 px | None / none / none |
| Contact Us | 1440 × 900 | 1266 px | 1266 px | None / none / none |
| Home | 390 × 900 | 2433 px | 2433 px | None / none / none |
| Contact Us | 390 × 900 | 1063 px | 1063 px | None / none / none |

The live original produced third-party network failures during browser checks; local pages made no GoDaddy requests. Missing-hosting attribution and the unconfigured CAPTCHA disclosure are intentionally blank, with original spacing reserved. Screenshots were visually reviewed for layout, hero/logo placement, fonts, content, forms, footer, and lower-page logos.

- Capture audit: all 68 source hashes unchanged.
- Asset audit: every local HTML/CSS image, srcset, font, script, stylesheet, and icon reference exists.
- JavaScript syntax checks: passed for both frontend scripts and both Pages handlers.
- Backend tests: 3 groups passed, 0 failed; includes accepted-provider response, failures, malformed responses, network errors, input/origin validation, and CAPTCHA checks. All outbound delivery mocked.
- Browser form failure: original error wording displayed; input retained; no success displayed.
- Messaging: floating button opens dialog; close control closes it.
- Navigation: home/logo and footer contact links resolve to preserved local public paths. Contact extension redirects to clean path.

No production email or CAPTCHA credentials were available. Cloudflare routing/runtime and actual email delivery remain untested. The Python preview serves static pages and an explicitly unavailable mail endpoint; it is not a Cloudflare Functions emulator.

Raw comparison evidence is available locally under ignored `artifacts/` (`original-*.png`, `local-*.png`, `browser-report.json`, and `interaction-report.json`). Headless full-page screenshot capture initially had a compositor artifact; final screenshots use a full-height viewport after recording dimensions at the stated viewport size.

## Turnstile update — October 21, 2026

Owner confirmed successful dev preview deployment and approved appearance before this update. Stable branch alias `dev.agouraaccounting.pages.dev` returned HTTP 200. Replacement code passes asset/capture audit, JavaScript checks, four mocked backend test groups and a mocked browser-controller lifecycle test (errors, expiry, timeout, retries, provider failure, success). No live Turnstile or Resend configuration is available yet; managed challenge appearance and real delivery remain pending. Current setup and decisions: [SETUP.md](SETUP.md).

Local preview `/` and `/contact-us` returned HTTP 200; unconfigured `/api/config` returned disabled with no site key. Browser inventory was empty in this session, so a fresh desktop/mobile screenshot comparison could not be performed.

October 22, 2026: owner confirmed a successful form test at the stable dev alias after resolving Turnstile error 110200 caused by using a deployment-specific hostname. All six Preview bindings are now saved as Secrets. Owner subsequently confirmed receipt of the test email in the destination inbox. Owner confirmed all three form variants work (home, contact-us, floating messaging), following the success-and-delivery checklist. Owner subsequently approved desktop and mobile appearance. Preview acceptance is complete based on these owner checks; this is not exhaustive automated browser/device coverage.

Production promotion October 22, 2026: approved dev history merged to main as `2aad805` and pushed. Production Pages home, contact-us, site.js and config returned HTTP 200. Config reports enabled; downloaded home HTML and site.js match repository files byte-for-byte. Production form delivery and owner visual checks remain pending. No DNS change was made.

Owner subsequently confirmed production is all working following the request to test all three forms and email delivery. Production acceptance is complete based on owner checks. DNS cutover and public-domain routing/TLS verification remain pending and separately authorized.

Client-review revision: removed Mobile and standardized Name/Email/Message requirements in all three forms and backend. Added coverage for missing/blank fields for each form kind and required HTML controls. Asset audit, syntax checks and seven test groups pass. No browser available; updated popup visual comparison and live preview/client approval remain pending. Previous acceptance applies to the prior version. DNS migration paused.
