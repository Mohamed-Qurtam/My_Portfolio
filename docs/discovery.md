# Phase 0: Project Discovery & Security Audit Report

**Candidate / Engineer:** Mohamed Qurtam — Network & Security Engineer  
**Date:** November 11, 2026  
**Auditor:** Senior Front-End & Application Security Reviewer  
**Repository:** `github.com/Mohamed-Qurtam/My_Portfolio`  
**Current Branch:** `audit/discovery`  

---

## 1. Executive Summary

This discovery audit evaluates the production readiness, security posture, code cleanliness, accessibility, and content fidelity of Mohamed Qurtam's personal portfolio. 

As a portfolio representing an aspiring **Network & Security Engineer**, the website itself serves as primary tangible evidence of technical rigor. Any architectural flaws, unhandled cross-site scripting attack vectors (such as unvalidated `innerHTML`), unpinned third-party CDNs, untracked repository clutter, or inconsistent professional data directly weaken candidate credibility in front of hiring managers and security recruiters.

---

## 2. File & Folder Inventory

A full audit of the project root and tracked repository contents was conducted.

| Item | Tracked in Git? | Status / Classification | Action Required |
|---|---|---|---|
| `index.html` (2,033 lines) | Yes | **Production Core** | Keep; sanitize and separate content to JSON. |
| `index.css` (3,660 lines) | Yes | **Production Core** | Keep; refactor tokens, logical properties, print CSS. |
| `index.js` (2,223 lines) | Yes | **Production Core** | Keep; remove `innerHTML`, eliminate framework artifacts. |
| `images/` (`portrait-600.webp`, `og-card.jpg`, etc.) | Yes | **Production Asset** | Keep; verify compression and responsive metadata. |
| `Badges/` (5 vendor PNG badges) | Yes | **Production Asset** | Keep; verify lossless optimization. |
| `Mohamed_Qurtam-Security_Engineer-CV.pdf` (244 KB) | Yes | **Production Asset** | Keep; verify metadata and text extractability. |
| `MyPhoto.jpeg` (689 KB) | Yes | **Deploy Risk / Waste** | Remove from git; archive into `_internal/`. |
| `node_modules/` (100+ files of `framer-motion`, `motion-dom`, `motion-utils`, `tslib`) | **Yes (Accidental commit `a888b56`)** | **CRITICAL DEPLOY HYGIENE** | Remove from git tracking immediately (`git rm -r --cached`). |
| `package.json` & `package-lock.json` | Yes | **Dead Dependency** | Declares `framer-motion` which is never imported or used. |
| `Edit.md` (41 KB internal prompt & revision log) | Yes | **Internal Documentation** | Move out of deployment root into `_internal/`. |
| `edit.js` (54 KB legacy prototype script) | Yes | **Dead Code** | Move out of deployment root into `_internal/`. |
| Leftovers from `portfolio-ideas-main` (`README.md`, `extract.sh`, `renovate.json`, `.husky/`, `package (2).json`, etc.) | Untracked in working copy | **Extraneous Clutter** | Clean up working directory; isolate reference material in parent directory. |
| `.gitignore` | Untracked | **Security Gap** | Create and commit comprehensive `.gitignore`. |

---

## 3. Discrepancy & Truthfulness Audit (CV vs. Website)

In accordance with **Non-Negotiable Rule #2**, content conflicts between the official CV (`Mohamed_Qurtam-Security_Engineer-CV.pdf`) and the live website are documented below rather than resolved silently:

| Topic | Official CV (`Mohamed_Qurtam-Security_Engineer-CV.pdf`) | Current Website (`index.html` / `index.js`) | Risk / Recommendation |
|---|---|---|---|
| **Professional Title** | **"Cyber Security Engineer"** (Header) / **"Adaptive Network Security Engineer and Tier 1 SOC Analyst"** (Summary) | **"Network & Security Engineer"** (Hero) / **"NETWORK & DEFENSE ENGINEER"** (Hanging Card) | **Inconsistency:** Recruiters scanning in 30s see 3 different titles. Recommend establishing a single unified title: **"Network & Security Engineer"** or **"Cyber Security Engineer"** across both artifacts. |
| **Phone Number(s)** | **`+20 1015220163`** (Single number listed under header) | Primary: **`+20 102 422 7004`**<br>Alt: **`+20 101 522 0163`** | **Discrepancy:** The CV lists only the alternate number. Recommend using `+20 101 522 0163` as the single verified source of truth and offering click-to-reveal to prevent scraping. |
| **"Tier 1 SOC Analyst" Claim** | Listed in Professional Summary ("Adaptive Network Security Engineer and Tier 1 SOC Analyst"), supported by certifications (`SOC Analyst Foundation – SIEM XPERT`, `eCIR`, `Cisco CyberOps`). | Stated in About lead paragraph. No explicit "SOC Analyst" entry in the work experience timeline. | **Truthfulness Check:** Candidate has verified SOC Analyst certifications and scholarship credentials, but no dedicated employer role titled "SOC Analyst". Recommend clarifying wording to *"Network & Security Engineer with Tier 1 SOC Operations Competency"*. |
| **Graduation Date & Degree** | B.Sc. Communication & Electronics Engineering – Benha University (June 2024, Excellent with Honors) | Matches website exactly. | Confirmed aligned. |
| **Current Employer** | Co-brand solution (Sep 2026 – now), Network & Security Engineer | Matches website. | Confirmed aligned. |

---

## 4. Code & Vulnerability Audit Findings Table

Findings are prioritized from **P0 (Critical / Security Blocker)** to **P3 (Minor Quality / Cosmetic)**:

| Finding ID | Severity | Category | Evidence (File:Line) | Finding Description & Vulnerability | Proposed Fix | Effort |
|---|---|---|---|---|---|---|
| **SEC-01** | **P0** | Supply Chain / Git Hygiene | `node_modules/` (git-tracked) | Over 100+ compiled and mapped node_modules files for `framer-motion` are tracked in git history and deployed to production. Framer Motion is never imported or executed anywhere in the codebase. | Remove `node_modules` from git cache (`git rm -r --cached node_modules`), add to `.gitignore`, and prune unused packages from `package.json`. | 15 min |
| **SEC-02** | **P0** | Application Security | Missing HTTP Headers (`vercel.json` / `_headers`) | No Content Security Policy (CSP), Permissions-Policy, HSTS, or `frame-ancestors` are configured. Site is vulnerable to clickjacking and malicious script injection. | Provide ready-to-deploy `vercel.json` and `_headers` with strict CSP (`default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`) and meta fallbacks. | 45 min |
| **SEC-03** | **P0** | DOM Security / XSS Hygiene | `index.js:226, 605, 706, 1153, 1584, 1630, 1683, 2111` | Multiple occurrences of `.innerHTML = ...` are used for dynamic DOM updates (e.g. topology telemetry HUD, toast notifications, buttons, and about text). This violates strict CSP and represents DOM-XSS risks. | Refactor all `.innerHTML` calls to safe DOM APIs: `textContent`, `document.createElement`, `replaceChildren()`, and SVG node construction. | 60 min |
| **SEC-04** | **P1** | Privacy & Spam Scraping | `index.html:1986, 2005`, `index.html:43` | Phone numbers (`+20 1024227004` and `+20 1015220163`) are exposed in plaintext HTML and JSON-LD schema, rendering them vulnerable to automated harvest by spam bots. | Obfuscate phone numbers behind an interactive click-to-reveal component; keep schema email obfuscated or masked. | 30 min |
| **SEC-05** | **P1** | Privacy & Network Leak | `index.html:62-65` | Fonts are fetched at runtime from external Google CDNs (`fonts.googleapis.com` and `fonts.gstatic.com`). This leaks visitor IP addresses, requires network roundtrips, and prevents strict `font-src 'self'` CSP. | Download and self-host modern WOFF2 font files locally in `fonts/` with `font-display: swap`. | 45 min |
| **SEC-06** | **P1** | Security Standards | Missing `/.well-known/security.txt` | No security contact or reporting disclosure policy is published on the site. A security engineer's portfolio should showcase compliance with RFC 9116. | Add `/.well-known/security.txt` with PGP key reference, canonical URL, and security contact details. | 15 min |
| **SEC-07** | **P1** | Architecture / CI/CD | `.github/workflows/` (missing) | No automated continuous integration pipeline exists to enforce HTML validation, dead-link checking, and secret scanning on pull requests. | Implement `.github/workflows/ci.yml` running HTML5 validator, markdown/link checker, and secret scan. | 45 min |
| **SEC-08** | **P1** | Deployment Hygiene | Root files: `Edit.md`, `edit.js`, `MyPhoto.jpeg` (689 KB) | Internal prompting instructions, experimental scripts, and an unoptimized 689 KB photo are located in the deployment root. | Quarantine internal prompt files and legacy scripts to `_internal/`; ensure only production assets are deployed. | 15 min |
| **A11Y-01** | **P1** | Progressive Enhancement | `index.html` / `index.js:370` | When JavaScript is disabled, certain dynamic elements (like credential modals and typewriter titles) have no visible fallback or can flash blank states. | Ensure 100% of text content, navigation anchors, and credential direct links work seamlessly with JavaScript disabled. | 45 min |
| **ARCH-01** | **P2** | Maintainability | `index.html:1-2033` | All credentials (30 items), skills, project descriptions, and personal metadata are hardcoded directly into a monolithic 2,033-line HTML file. | Decouple data into a clean, typed `content/site.json` schema with a lightweight Node build script. | 90 min |
| **A11Y-02** | **P2** | Accessibility / WCAG 2.2 | `index.css:2980-3020` | Certain subtle text/border combinations in light theme hover states test below 4.5:1 contrast ratio. | Normalize all dark/light theme tokens against WCAG 2.2 AA contrast standards (minimum 4.5:1 for body text, 3:1 for UI borders). | 45 min |
| **PERF-01** | **P2** | Performance / Print | `index.css` (missing print rules) | No dedicated print stylesheet exists. Recruiters printing the candidate portfolio to PDF receive messy web layouts and dark backgrounds. | Add `@media print` rules generating a clean, elegant, one-page ink-friendly executive resume summary. | 45 min |
| **I18N-01** | **P3** | Internationalization | `index.html:2` (`lang="en"`) | CSS uses physical properties (`left`, `right`) instead of logical properties (`inline-start`, `inline-end`), blocking seamless Arabic RTL adaptation. | Refactor layout containers to CSS logical properties and scaffold language toggle structure. | 60 min |

---

## 5. Audit Report Verification Status

Checking findings against the codebase baseline:
- **`innerHTML` in dynamic scripts**: **Confirmed** (8 instances identified across `index.js`).
- **`node_modules` tracked in git**: **Confirmed** (100+ files in commit history).
- **External Google Fonts dependency**: **Confirmed** (present in `index.html:62-65`).
- **Plaintext phone number exposure**: **Confirmed** (present in `index.html:43, 1986, 2005`).
- **Missing CSP and Security Headers**: **Confirmed** (no server headers config present).
- **Single Source of Truth mismatch**: **Confirmed** (CV title vs. site title vs. phone count).
- **All `target="_blank"` links have `rel="noopener noreferrer"`**: **Already Fixed / Clean** (100% of anchor tags audited comply).
- **Zero `eval` or `document.write`**: **Already Fixed / Clean** (0 instances found).
- **Zero inline HTML event handlers**: **Already Fixed / Clean** (0 instances found).

---

## 6. Stop Point & Action Required

Per **Phase 0 Instructions**, discovery is complete. All findings, severity levels, and discrepancies are documented above. 

**Next Steps upon your approval:**
1. Proceed to **Phase 1: Security Hardening** (deploy hygiene, purge tracked node_modules, create `_headers` / `vercel.json` CSP, self-host WOFF2 fonts, add `security.txt`, refactor `innerHTML`).
2. Confirm your preferred resolution for the 3 content conflicts (Title, Phone number, and SOC Analyst phrasing).

