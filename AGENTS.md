# Agoura Accounting migration

- Preserve https://agouraaccounting.com as closely as possible: existing layout, exact business wording, images, fonts, colors, metadata, and mobile behavior. No redesign or previous redesign code.
- Plain HTML, CSS, and JavaScript; deployable static files in public/. Dependencies require justification.
- Preserve / and /contact-us; repair local paths and copy required assets locally.
- Replace GoDaddy hosting, form, messaging, analytics, and lazy-image dependencies with local behavior and Cloudflare Pages Functions.
- Never report form success until the configured email backend accepts delivery. Keep credentials outside source control.
- Original read-only source: ../agoura-migration/reference-download; log: ../agoura-migration/download.log. Never modify either.
- Work on dev; keep main established. Make useful local commits. Never push, deploy, change DNS, or modify the original website.
- Validate local preview, navigation, assets, forms, and JS. Compare desktop/mobile with original when browser tooling is available. Document external dependencies and untested behavior.
