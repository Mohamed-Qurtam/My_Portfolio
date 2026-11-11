# Security Hardening & Threat Model Report

**Candidate / Engineer:** Mohamed Qurtam — Network & Security Engineer  
**Date:** November 11, 2026  
**Auditor:** Application Security Reviewer  
**Repository:** `github.com/Mohamed-Qurtam/My_Portfolio`  
**Deploy URL:** `https://urtamportfolio.vercel.app/`  
**Branch:** `fix/security-and-mobile-ux`  

---

## 1. Threat Model for a Static Personal Portfolio

While a static HTML/CSS/JS site has no application database or backend API attack surface, it represents high-value identity infrastructure for a **Network & Security Engineer**. The threats and attack vectors modeled include:

| Threat ID | Threat Category | Threat Agent & Scenario | Impact |
|---|---|---|---|
| **TM-01** | **Content Injection & DOM-XSS** | An attacker targets dynamic DOM update functions via query strings, hash parameters, or unescaped strings written directly into `.innerHTML`. | Execution of malicious scripts in visitor sessions, defacing candidate identity. |
| **TM-02** | **Clickjacking & UI Redress** | Malicious third-party websites frame the portfolio via `<iframe>` to trick hiring managers or siphon interactions. | Credibility loss, deceptive UI overlay attacks. |
| **TM-03** | **Data Leakage & Visitor Tracking** | Relying on third-party CDNs (e.g., Google Fonts, unpinned libraries) exposes visitor IP addresses and browsing habits to third-party providers. | Privacy violation; violates zero-trust principles for a security engineer. |
| **TM-04** | **Credential Harvesting & Scraping** | Spam bots and malicious scraping engines harvest plaintext phone numbers and emails for phishing campaigns and SIM-swap reconnaissance. | Target harassment, targeted social engineering attacks against the candidate. |
| **TM-05** | **Supply Chain Compromise** | Accidental tracking and deployment of unused bloated dependencies (`node_modules`) exposing attack surface through vulnerable dev dependencies. | Supply chain degradation, repository bloat, potential build-phase pipeline hijacking. |
| **TM-06** | **Missing Responsible Disclosure Policy** | Security researchers finding edge-case anomalies have no standard channel to report them safely. | Uncoordinated public disclosure. |

---

## 2. Security Hardening Measures Applied

### A. Deploy & Supply Chain Hygiene (SEC-01, SEC-08)
- **Untracked `node_modules` from Git:** Removed 100+ files of unused `framer-motion` and its sub-packages from Git tracking (`git rm -r --cached node_modules`). Reduced repository footprint by over 98,000 lines of dead code.
- **Quarantined Internal Development Assets:** Moved `Edit.md`, legacy prototype `edit.js`, and raw uncompressed `MyPhoto.jpeg` out of public production build into `_internal/`.
- **Comprehensive `.gitignore`:** Added rules ignoring `node_modules/`, `_internal/`, environment files, OS artifacts, and temporary scratch scripts.

### B. Strict HTTP Security Headers (`vercel.json` & `_headers`) (SEC-02)
Configured modern security headers across the Vercel deployment edge:
```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https:; frame-src 'self' https://drive.google.com https://verification.mindtickle.com; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
}
```
- `X-Content-Type-Options: nosniff` — Prevents MIME-type sniffing.
- `X-Frame-Options: DENY` & `frame-ancestors 'none'` — Defends completely against clickjacking attacks.
- `Referrer-Policy: strict-origin-when-cross-origin` — Protects internal URI path privacy on outbound navigation.
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()` — Completely disables invasive device hardware APIs.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` — Enforces HTTPS strict transport security.
- `Cross-Origin-Opener-Policy: same-origin` — Isolates the browsing context from cross-origin tabs.

### C. Zero Third-Party Network IP Leaks (SEC-05)
- **Self-Hosted WOFF2 Fonts:** Space Grotesk and IBM Plex Mono are now self-hosted locally under `/fonts/` with `font-display: swap` and long-term immutable caching (`max-age=31536000`).
- **Eliminated Google CDN Roundtrips:** Removed runtime connections to `fonts.googleapis.com` and `fonts.gstatic.com`.

### D. Zero `innerHTML` DOM-XSS Remediation (SEC-03)
- Replaced all 8 instances of `.innerHTML` in `index.js` with secure DOM manipulation primitives:
  - `document.createElement()` and `document.createTextNode()`
  - `.replaceChildren()` and `.textContent = ''`
  - Safe SVG namespace element creation (`createElementNS('http://www.w3.org/2000/svg', ...)`)

### E. Privacy & Contact Scraper Defense (SEC-04)
- Replaced scrapeable `tel:+20...` plaintext links with an interactive, accessible click-to-reveal component (`#phoneRevealBtn`).
- Split phone strings across discrete data attributes to defeat naive regex scrapers.
- Unified canonical candidate phone to `+20 101 522 0163` (matching the official CV).

### F. Responsible Disclosure Standard (RFC 9116) (SEC-06)
- Published `/.well-known/security.txt` containing official security contact URI, expiration timestamp, and canonical domain references.

### G. Automated Continuous Integration Quality Gate (SEC-07)
- Added `.github/workflows/ci.yml` running automated linting, HTML validation, dead-link checking, and secret scanning on pull requests.

---

## 3. What Remains & Why

1. **Inline CSS Styles (`style-src 'unsafe-inline'` in CSP):**
   - *Status:* Maintained temporarily in CSP for dynamic interactive elements (canvas particle opacity, scroll progress rings).
   - *Next Step (Phase 2):* Refactor inline styles into CSS Custom Properties (`var(--...)`) to transition CSP to `style-src 'self'`.
2. **Third-Party Iframe Preview Boundaries:**
   - *Status:* Google Drive previews are allowed under `frame-src 'self' https://drive.google.com`. Mindtickle verification was upgraded to a verified credential card because Mindtickle restricts iframe embedding (`X-Frame-Options: SAMEORIGIN`).

---

## 4. Verification & Testing Procedures

### 1. Security Headers Audit
Run your live Vercel URL against industry benchmark scanners:
- **[SecurityHeaders.com](https://securityheaders.com/?q=https%3A%2F%2Furtamportfolio.vercel.app%2F):** Target grade: **A+**.
- **[Mozilla Observatory](https://observatory.mozilla.org/analyze/urtamportfolio.vercel.app):** Verifies CSP strictness, HSTS preload compliance, and referrer isolation.

### 2. Browser DevTools Verification
1. Open Chrome or Firefox DevTools (`F12`) on `https://urtamportfolio.vercel.app/`.
2. Inspect the **Network** tab:
   - Verify that **0 requests** are sent to Google Fonts or third-party ad networks.
   - Verify that all fonts load with `200` or `304` directly from `/fonts/*.woff2`.
3. Inspect the **Console** tab:
   - Verify there are **0 CSP violation warnings** or blocked resources.
