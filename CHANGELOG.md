# Changelog & Engineering Evolution

All notable improvements, security hardening measures, architectural decouplings, and responsive enhancements made to Mohamed Qurtam's personal portfolio are documented in this file.

---

## [2.0.0] - 2026-11-11

### Security Hardening & Privacy (Phase 1)
- **Strict Edge Headers:** Added production [`vercel.json`](file:///m:/Personal/Portfolio/vercel.json) and [`_headers`](file:///m:/Personal/Portfolio/_headers) providing strict Content Security Policy (`default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security: max-age=31536000`, `Cross-Origin-Opener-Policy: same-origin`, and `Permissions-Policy` denying camera, microphone, and geolocation.
- **Self-Hosted Local WOFF2 Fonts:** Downloaded all 32 WOFF2 font variants for Space Grotesk and IBM Plex Mono locally into [`fonts/`](file:///m:/Personal/Portfolio/fonts). Completely eliminated runtime Google CDN roundtrips and visitor IP leaks.
- **Zero-DOM-XSS Hygiene:** Refactored all 8 instances of `.innerHTML` across `index.js` into safe DOM primitives (`textContent`, `replaceChildren()`, `createElement`, `createElementNS`).
- **Deploy Hygiene & Supply Chain Cleanup:** Purged 100+ accidental git-tracked `node_modules` files (`framer-motion`), shrinking repository footprint by ~98,000 lines of dead code. Quarantined internal notes (`Edit.md`), prototypes (`edit.js`), and raw images (`MyPhoto.jpeg`) to git-ignored `_internal/`.
- **Anti-Scraping Phone Obfuscation:** Replaced plaintext `tel:` links with an interactive click-to-reveal knob (`#phoneRevealBtn`) with discrete data attributes to thwart automated web scraping bots.
- **RFC 9116 Standard:** Added [`.well-known/security.txt`](file:///m:/Personal/Portfolio/.well-known/security.txt) with official candidate security contact channels.
- **CI/CD Quality Pipeline:** Added [`.github/workflows/ci.yml`](file:///m:/Personal/Portfolio/.github/workflows/ci.yml) for automated HTML validation, secret scanning, and link integrity verification.

### Mobile UI/UX & Visual Architecture (User Feedback)
- **Mindtickle Credential Card:** Diagnosed and resolved the iframe block on Mindtickle verification links (`X-Frame-Options: SAMEORIGIN`), replacing the empty black box with an official **Verified Digital Credential Card** in the certificate modal featuring Cisco Black Belt verification metadata and a direct verification CTA.
- **Light Mode Mobile Navigation Drawer:** Resolved mobile menu transparency collision in light mode. Enforced 100% opaque, solid background (`#f5f2ea`) and balanced backdrop blur on viewports `≤1024px`.
- **Marquee & Badges Looping:** Unified hardware-accelerated CSS marquee animations (`@keyframes tech-ticker-loop` and `@keyframes vendor-marquee-loop`) to continuously loop left-to-right on all mobile, tablet, and desktop viewports.
- **Hero Section Vertical Rhythm:** Tightened vertical margins and padding between hero heading, tagline, intro, and CTA buttons on mobile devices.
- **Typewriter Title Interaction:** Unified `"Network & Security Engineer"` typewriter effect to trigger smoothly on initial page load and replay instantly upon interactive tap or click.
- **Education Section Modal:** Transformed the B.Sc. card click into a native modal popup (`role="dialog"`, `aria-modal="true"`, focus trap, escape key dismissal) displaying degree honors and embedding the verified graduation document.

### Systematic Design System (Phase 2)
- **Token Architecture:** Unified color, typography, modular spacing, and radius tokens across dark and light themes in [`index.css`](file:///m:/Personal/Portfolio/index.css).
- **WCAG 2.2 AA Contrast Compliance:** Tested and normalized all text/background pairs. Updated light mode tertiary copy to `#596775`, achieving **5.18:1 contrast** (exceeding the 4.5:1 AA threshold).
- **Keyboard Navigation Focus Visible:** Configured prominent emerald `:focus-visible` rings (2px outline, 3px offset) on all buttons, links, and focusable cards.
- **Reading Comfort:** Constrained all body copy to `68ch` maximum line length (strictly below 75 characters).

### Architecture & Content Decoupling (Phase 3)
- **Content Decoupling:** Extracted all resume data, skills, projects, certifications, and metadata into [`content/site.json`](file:///m:/Personal/Portfolio/content/site.json).
- **Static Build Script:** Added zero-dependency static validator [`build.js`](file:///m:/Personal/Portfolio/build.js) ensuring HTML synchronization on build.
- **Ink-Friendly Print Stylesheet:** Added comprehensive `@media print` rules generating a clean, ink-friendly CV layout hiding interactive web chrome and displaying contact URLs.
- **Custom 404 Route:** Created [`404.html`](file:///m:/Personal/Portfolio/404.html) matching the dark terminal theme, providing clear navigation back home, and logging zero third-party telemetry.
- **CSS Container Queries:** Implemented `@container` queries for card-level responsiveness regardless of screen width.

### Documentation (Phase 0 – 5)
- [`docs/discovery.md`](file:///m:/Personal/Portfolio/docs/discovery.md): Discovery audit and discrepancy matrix.
- [`docs/inspiration-notes.md`](file:///m:/Personal/Portfolio/docs/inspiration-notes.md): Analysis of 5 benchmark security engineer portfolios.
- [`docs/security.md`](file:///m:/Personal/Portfolio/docs/security.md): Threat model and verification instructions.
- [`docs/design-system.md`](file:///m:/Personal/Portfolio/docs/design-system.md): Tokens table, contrast matrix, and component state specifications.
- [`docs/audit-results.md`](file:///m:/Personal/Portfolio/docs/audit-results.md): Lighthouse 95+ projections and performance budget verification (504.9 KB raw payload).
