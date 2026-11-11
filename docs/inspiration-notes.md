# Inspiration Notes: Technical Portfolio Patterns

**Auditor / Engineer:** Mohamed Qurtam — Network & Security Engineer  
**Date:** November 11, 2026  
**Source Repository:** `portfolio-ideas` gallery (read-only reference)  

---

## Selected Benchmark Portfolios

As a Network & Security Engineer portfolio, our site must project:
1. **Immediate technical credibility** (scannable credentials and verified vendor certifications).
2. **Restraint and elegance** (purposeful micro-interactions, avoiding gimmicky 3D physics that slow down recruiters).
3. **Flawless security and performance** (zero third-party data leaks, zero CSP violations, 100% no-JS resilience).

The following 5 portfolios were selected from `portfolio-ideas` and studied for their architecture, mobile UX, and proof-of-work layout:

---

### 1. Brittany Chiang (`v4.brittanychiang.com` / `bchiang7/v4`)
- **Key Pattern Extracted:**
  - **Information Architecture:** Split focus on hero (immediate value proposition + clear CTA + social proof) followed by scannable experience timeline and highlighted engineering projects.
  - **Proof of Work:** Project cards display architecture tags (e.g., `BGP`, `Palo Alto`, `OSPF`, `SIEM`) as crisp semantic chips rather than walls of text.
  - **Motion Restraint:** Subtle hover transitions (`150ms-250ms ease`), avoiding disruptive scrolljacking or excessive particle simulations.
  - **Takeaway for Mohamed:** Maintain our signature dark green terminal aesthetic, but tighten spacing between the hero text, CTAs, and interactive terminal badges.

---

### 2. Max Böck (`mxb.dev` / `maxboeck/mxb`)
- **Key Pattern Extracted:**
  - **Progressive Enhancement:** 100% of the site's content, navigation, and resume details are readable and navigable with JavaScript completely disabled.
  - **Typography & Theme System:** Fluid typography using CSS `clamp()`, clean monospaced accents (`IBM Plex Mono`), and a bulletproof dark/light theme switch that prevents flash of unstyled content (FOUC).
  - **Takeaway for Mohamed:** All certificate links, modal targets, and navigation links must fall back cleanly to direct anchors or new tabs if JavaScript fails or is disabled.

---

### 3. Tania Rascia (`taniarascia.com` / `taniarascia/taniarascia.com`)
- **Key Pattern Extracted:**
  - **Content-First Simplicity:** Zero bloated frameworks; high contrast ratios (well above 7:1 for headers and 4.5:1 for body copy).
  - **Mobile Navigation:** Clean, un-cluttered mobile drawer with solid background, crisp z-index layering, and no transparent bleeding over hero elements.
  - **Takeaway for Mohamed:** Fix the mobile nav drawer so it has an opaque solid backdrop in both light mode and dark mode, preventing navigation text from overlapping hero typography.

---

### 4. Jemima Abu (`jemimaabu.com` / `jemimaabu/portfolio`)
- **Key Pattern Extracted:**
  - **Accessibility (a11y) Leadership:** Full WCAG 2.2 AA compliance, visible `:focus-visible` keyboard rings, proper `aria-expanded` and `aria-controls` for mobile menus and modals, and escape-key dismissal.
  - **Pure Vanilla Stack:** Demonstrates how clean HTML5, CSS3, and modern vanilla JavaScript can outperform heavy single-page app bundles in speed and reliability.
  - **Takeaway for Mohamed:** Implement proper modal focus trapping, `aria-modal="true"`, `role="dialog"`, and `Escape` key listeners for all credential and education preview dialogs.

---

### 5. Victor Eke (`victoreke.com` / `evavic44/victoreke.com`)
- **Key Pattern Extracted:**
  - **Credential & Badge Showcase:** Clean horizontal scroller / marquee for vendor badges (e.g., Cisco, Veeam, CyberHoc) with smooth continuous CSS animation (`infinite linear`) that works smoothly across mobile, tablet, and desktop without stuttering.
  - **Responsive Spacing:** Modular spacing tokens (`--space-sm`, `--space-md`, `--space-lg`) that scale proportionally down on mobile viewports.
  - **Takeaway for Mohamed:** Fix the badge ticker and tech stack marquee to loop smoothly across touch screens and mobile browsers (iOS WebKit and Android Chrome), with pause-on-hover / pause-on-focus for accessibility.

---

## Synthesis: Design & Security Principles for Mohamed Qurtam
1. **Single Source of Truth:** Unify role title to **"Network & Security Engineer"** across the entire website, CV, and schema metadata.
2. **Defensive Mobile UX:** Resolve z-index stacking and modal overlays so mobile navigation and popups never bleed into page contents.
3. **Hardened Security Posture:** Ship zero-leak self-hosted fonts, strict CSP headers in `vercel.json`, and safe DOM manipulation (zero `innerHTML`).

