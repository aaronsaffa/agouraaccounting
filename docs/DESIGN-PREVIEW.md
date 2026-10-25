# Desktop hero concept

Owner authorized a separate design branch and remote client-review preview on October 24, 2026. This is a scoped exception to the migration's preservation-only/no-push rules: changes and publication are for this preview branch only. Main remains the approved production site. No DNS changes are needed.

Branch: `design/desktop-hero`, based on production `58ee98f`. Dev contains documentation-only follow-ups; main needs no update at this time.

The concept retains all business wording, images, colors, fonts, and content order. At desktop widths (1024px and wider), the home wallpaper area is limited to 1600px wide and a viewport-aware height of 420–640px, rather than growing to two-thirds of the screen width. Its crop favors the tree and foreground. Mobile/tablet hero styles remain unchanged. A small preview notice is added on both pages, linking to the current website for comparison.

This preview is for design review. Form submissions are intercepted with an explicit no-send explanation and a link to the live contact page. Provider-acceptance logic and credentials are unchanged; no new Turnstile hostname is required. Popup opening/closing and required-field controls remain available for visual review. No analytics, application dependencies, or new image assets are added.

Cloudflare Pages must allow this branch in its custom preview-branch list in addition to `dev`. Production branch must remain `main`. The owner authorized the preview branch push and preview deployment; no merge into main or production deployment is authorized.

Owner confirmed saving the branch inclusion setting. Local static routes, asset references (including responsive srcsets), noindex metadata, and JavaScript syntax checks passed. No GoDaddy runtime URL was found in either page. The available 35 reference files match their capture hashes; 33 manifest paths are missing from this computer, so the full original-capture audit cannot be completed here. No reference files were edited.

Fresh screenshot QA is unavailable: the Windows capture helper reports a suspended Direct3D GPU device. Desktop/widescreen cropping and the unchanged mobile hero need visual review through the preview link before approval. This limitation does not affect production. The original migration JavaScript and backend files remain unchanged.
