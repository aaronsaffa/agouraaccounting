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

## Public-domain verification — October 24, 2026

Read-only checks from the new computer after owner activation of the apex. Earlier DNS-hold notes are historical; no DNS, deployment, push, promotion, subscription, or source-site changes were made during these checks.

| Check | Result |
| --- | --- |
| Apex HTTPS `/` and `/contact-us` | HTTP 200; certificate validation passed without bypass |
| HTTP `/contact-us` | 301 to `https://agouraaccounting.com/contact-us` |
| HTTPS `/contact-us.html` | 301 to `/contact-us` |
| `/api/config` | HTTP 200, `enabled: true`; this proves binding presence, not valid credentials or delivery |
| Contact page and `/assets/site.js` | Byte-for-byte SHA-256 match with local files |
| Home page | Matches local file after normalizing Cloudflare email obfuscation only |
| All 64 files in `public/assets/` | Each public URL returned HTTP 200 |
| Cloudflare-added email decoder | `/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js` returned 200; live home email link/text are transformed at the edge |
| GET `/api/contact` | 405, `accepted: false` |
| Same-origin JSON POST `{}` | 400, `accepted: false`; no token or valid inquiry, so no delivery attempted |
| Cross-origin JSON POST `{}` | 403, `accepted: false` |
| www HTTP `/`, HTTPS `/`, `/contact-us`, `/api/config` | Cloudflare HTTP 522; no working www route or redirect |
| Pages custom domains dashboard | Only `agouraaccounting.com`, Active / SSL enabled; www is not registered |
| Production bindings dashboard | All six expected binding names are present as Secrets; values were not revealed |

DNS queries to 1.1.1.1 confirmed Cloudflare nameservers `cris` and `millie`, proxied apex A responses, and `www` CNAME to apex. The missing www Pages registration is consistent with the 522 result; the DNS alias alone does not establish a Pages custom-domain route. No configuration fix was applied.

Mail DNS remains published: MX `agouraaccounting-com.mail.protection.outlook.com` (priority 0), autodiscover CNAME `autodiscover.outlook.com`, tenant TXT `NETORGFT7985848.onmicrosoft.com`, SPF `v=spf1 include:secureserver.net -all`, and both SRV records (`_sip._tls` → `sipdir.online.lync.com:443`, `_sipfederationtls._tcp` → `sipfed.online.lync.com:5061`, priority 100 / weight 1). These records do not prove Microsoft 365 send/receive or SPF alignment. `_dmarc` TXT and the standard Microsoft `selector1`/`selector2` DKIM CNAMEs returned NXDOMAIN; other selectors and actual message authentication were not tested. No mail DNS changes are authorized or proposed solely from these observations.

Google and Cloudflare DNS-over-HTTPS DS queries returned NOERROR with no DS answer (parent `com` SOA in authority); DNSKEY lookup also returned no key. DNSSEC delegation is not enabled as observed. Final full-zone export/backup is still pending; these targeted queries are not a complete DNS backup.

Pending owner checks on the public apex: submit home, Contact Us, and floating messaging forms with distinct labels; confirm success plus receipt of all three messages; send from the Microsoft 365 business mailbox to an external mailbox and reply back. No valid inquiry was submitted by the agent, no CAPTCHA was solved, and no inbox receipt was independently verified. Prior Pages-domain acceptance is not public-domain acceptance. Fresh desktop/mobile visual and browser-console coverage is not complete in this session. The live original has been replaced at the apex; historical original comparison evidence remains the reference.

Owner subsequently replied “all three worked” to the explicit three-form success-and-inbox checklist. Public-apex form acceptance is complete based on this owner confirmation, superseding the pending form checks in the preceding paragraph; the agent did not independently inspect the inbox. Microsoft 365 business-mailbox send/receive was a separate fourth check and is not covered by that response. A targeted follow-up is pending. www routing and the final full-zone export remain open.

Microsoft 365 follow-up, October 24: owner reports sending a test message to the business email address with no failure notice received so far. The client is unavailable until October 25. Actual inbox receipt and outbound business-mailbox delivery/reply remain unverified; no bounce is not proof of delivery. Complete the two-way check with the client when available.

HTTP comparison downloads are local ignored files under `artifacts/`. Web search's fetch tool could not access these URLs; the results above were obtained with direct HTTPS requests and read-only Cloudflare UI inspection.

www activation follow-up, October 24: after owner activation through Pages, www HTTPS `/`, `/contact-us`, and `/api/config` each returned HTTP 200 with certificate verification enabled. Config reports enabled. Owner screenshot shows both custom domains Active / SSL enabled. Earlier www 522 observations are resolved; www serves directly (no apex redirect on these HTTPS page requests). www form success/delivery and HTTP redirect behavior were not retested in this follow-up. No agent DNS changes or deployments occurred.
