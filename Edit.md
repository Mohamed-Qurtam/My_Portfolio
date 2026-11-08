# Edit.md: Portfolio upgrade v4 (for Antigravity)

> **ملاحظة للمالك (Arabic note for the owner):** هذا الملف مكتوب بالإنجليزية ليفهمه الموديل بدقة. ضعه في جذر المشروع (أو داخل `docs/`)، وأرفق معه الصور المرجعية الثلاث (Skills / Contact knobs / Experience spacing) وملف الـ CV الجديد ومجلد الـ Badges، ثم الصق "Master prompt" الموجود في القسم 0 داخل Antigravity. في نهاية العمل سيعيد لك الموديل هذا الملف نفسه محدّثًا (حالة كل مهمة + قائمة الملفات المعدّلة).

---

## 0. Master prompt (paste this into Antigravity)

```text
You are a senior front-end engineer and motion designer. This repository is my personal portfolio (React + Tailwind, originally built with Lovable).
1. Read docs/Edit.md completely (it is the specification).
2. Inspect the project (package.json, router/pages, layout, Header, Hero, About, Experience, Skills, Education, Projects, Certifications, Contact, Footer, styles/tokens, public/ and src/assets).
3. Reply with a short implementation plan (files to touch, new files, any new dependency and why). Wait for my approval.
4. Implement tasks T1 to T12 in order, in small commits. After each task, update the Status table at the bottom of docs/Edit.md.
5. Do not invent data (URLs, accounts, certificates, badge names). If an input listed in section 1 is missing, skip only that part, mark it "BLOCKED: waiting for input" and continue.
6. When finished, return the updated docs/Edit.md (status, changelog, files changed, screenshots list) and confirm that npm run build and lint pass.
```

---

## 1. Inputs the owner provides (check before starting)

| Input | Where it should be | If missing |
|---|---|---|
| **New CV (PDF)** | `public/cv/` (any file name; the agent renames it, see T8) | Mark T8 BLOCKED; do not touch the CV links |
| **Badges** (images, from the "Badges" folder) | `src/assets/badges/` (or `public/badges/`) | Build the marquee with a typed empty-state, mark T7 partially BLOCKED |
| **Reference screenshots** (3): skills cards, contact knobs, experience page cut at left edge | Attached to the prompt | Use the descriptions in this file |
| X (Twitter) and Instagram URLs | Not provided | **Do not add X or Instagram knobs.** Leave an `// OPTIONAL` slot in `src/data/links.ts` only |

---

## 2. Global rules

- **Do not break what already works:** section anchors (`#about`, `#experience`, `#skills`, `#education`, `#projects`, `#certifications`, `#contact`), scroll-spy, dark default theme, the hero role title that appears after page load.
- All URLs live in **one** file, `src/data/links.ts`. All certificates in `src/data/certifications.ts`. All skills in `src/data/skills.ts`. No hard-coded links in components.
- Use design tokens (CSS variables) for every colour. No inline hex values in components.
- No new heavy dependencies without asking. Prefer CSS and the Web Animations API. If the project already uses Framer Motion, use it. GSAP is allowed only for the scroll-storytelling pieces in T11 and only if I approve the plan.
- Every external link: `target="_blank"` and `rel="noopener noreferrer"`.
- Every animation respects `prefers-reduced-motion` (see T11).

---

## T1. Consistent horizontal spacing for ALL sections

**Problem (see the Experience screenshot):** the "// 02 · CAREER" label and the "Experience" heading touch the left edge of the browser, while About has a proper margin. Sections have no shared container.

**Fix:** one `Container` used by the header, every section and the footer.

```css
/* tokens */
:root{
  --container-max: 1200px;
  --gutter: clamp(1.25rem, 5vw, 4rem);   /* the "distance from the page edge" */
}
.container{
  width: min(100% - 2 * var(--gutter), var(--container-max));
  margin-inline: auto;
}
.section{ padding-block: clamp(4rem, 9vw, 8rem); }
```

```tsx
// src/components/Container.tsx
export function Container({ as: Tag = "div", className = "", ...p }: any) {
  return <Tag className={`container ${className}`} {...p} />;
}
```

**Do:** wrap the *content* of every section in `<Container>` (keep full-bleed backgrounds, dividers and the aurora outside it). Remove any `padding-left: 0` / `ml-0` / negative margins that cause the flush-left look. Make the Experience timeline, the section labels, headings and the accent underline all start at the container's left edge, exactly aligned with the About heading.

**Acceptance:** at 1280, 1440 and 1920 px the left edge of every section heading is on the same vertical line as the About heading; at 360 px the gap to the screen edge is at least 20 px everywhere.

---

## T2. Responsive for every device and every zoom level

**Requirements**

1. Works from **320 CSS px** to **3840 px** wide, in portrait and landscape.
2. Works at browser zoom **25%, 50%, 75%, 100%, 125%, 150%, 200%, 300%, 400%, 500%**. At 400% (≈ 320 CSS px) the page must reflow to a single column with **no horizontal scroll** (WCAG 1.4.10).
3. At low zoom (25 to 67%) or on big monitors, content stays **centred** in the container (max 1200 px) and does not float to the left. Allow `--container-max` to grow to 1400 px at `min-width: 1800px`.
4. Use `rem`, `clamp()`, `min()`, grid `auto-fit`/`minmax()`, `aspect-ratio`. No fixed pixel widths on layout blocks. Use `dvh` instead of `100vh`. Respect `env(safe-area-inset-*)`.
5. Hover-only effects are wrapped in `@media (hover:hover)`; touch targets are at least 44x44 px.
6. Header: full nav above 1024 px; below that a hamburger menu (with Download CV and the theme toggle inside the panel or fixed at the top-right).

```css
html{ -webkit-text-size-adjust:100%; }
body{ overflow-x:clip; }
img,svg,video,canvas{ max-width:100%; height:auto; }
h1{ font-size:clamp(2.25rem, 1.2rem + 4.5vw, 4.75rem); }
h2{ font-size:clamp(1.75rem, 1.1rem + 2.6vw, 3rem); }
.grid-auto{ display:grid; gap:clamp(1rem,2.5vw,1.75rem);
  grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr)); }
@media (min-width:1800px){ :root{ --container-max:1400px; } }
```

**Test matrix (take a screenshot of each and list them in the changelog):**
iPhone SE (375), iPhone 15 (393), Pixel 8 (412), Galaxy Fold (280, best effort), iPad portrait (820), iPad Pro landscape (1366), laptop (1440), desktop (1920), 4K (3840), plus zoom 50%, 200%, 400% at 1280 px wide.

---

## T3. Contact: tactile "knob" buttons (match the reference image)

**Reference anatomy:** a row of round physical-looking dials. Each has an uppercase letter-spaced label **above** (X, GITHUB, LINKEDIN, INSTAGRAM in the reference), a raised bezel ring with a small indicator notch at the top, an inner raised cap with the icon centred, soft top highlight and drop shadow. One knob is the accent colour, one is off-white, one mid-grey, one near-black. The page background has a fine paper grain.

**Our knobs (4, only real accounts):**

| Order | Label | Icon | Target | Variant |
|---|---|---|---|---|
| 1 | EMAIL | envelope | `mailto:moqurtam@gmail.com` | `knob--green` (brand accent) |
| 2 | GITHUB | GitHub mark | `https://github.com/Mohamed-Qurtam` | default (off-white; dark glass in dark theme) |
| 3 | LINKEDIN | "in" mark | `https://www.linkedin.com/in/mohamed-qurtam-128296215/` | `knob--steel` |
| 4 | PHONE | handset | `tel:+201024227004` | `knob--ink` |

Keep the written email and both phone numbers (+20 1024227004, +20 1015220163) as plain text with a small "copy" button under the knobs, so they stay selectable and accessible. Remove the old stacked contact cards and the emoji icons.

**Markup (one component, data driven from `links.ts`)**

```tsx
<a className={`knob ${variant}`} href={href} target={external ? "_blank" : undefined}
   rel={external ? "noopener noreferrer" : undefined} aria-label={ariaLabel}>
  <span className="knob__dial">
    <span className="knob__ring" aria-hidden="true" />
    <span className="knob__cap">{/* inline SVG icon, aria-hidden */}</span>
  </span>
  <span>{label}</span>
</a>
```

**CSS (prototyped and checked in a real browser in light and dark themes; use as-is, then adapt tokens)**

```css
.knob-row{display:flex;flex-wrap:wrap;justify-content:center;gap:clamp(1.25rem,4vw,2.75rem)}
.knob{--size:clamp(76px,11vw,104px);display:grid;justify-items:center;gap:.95rem;text-decoration:none;color:var(--text-muted);
  font:600 .72rem/1 var(--font-mono);letter-spacing:.2em;text-transform:uppercase;-webkit-tap-highlight-color:transparent}
.knob__dial{position:relative;width:var(--size);aspect-ratio:1;border-radius:50%;display:grid;place-items:center;
  background:radial-gradient(circle at 30% 24%,var(--k-bezel-hi),var(--k-bezel-lo) 78%);
  box-shadow:0 1px 0 rgba(255,255,255,.65) inset,0 -3px 6px rgba(0,0,0,.14) inset,0 14px 22px -8px var(--k-shadow),0 2px 3px rgba(0,0,0,.22);
  transition:transform .35s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.knob__ring{position:absolute;inset:0;border-radius:50%;transition:transform .7s cubic-bezier(.3,1.5,.4,1)}
.knob__ring::before{content:"";position:absolute;top:7%;left:50%;width:7%;height:10%;transform:translateX(-50%);border-radius:2px;
  background:var(--k-notch);box-shadow:0 1px 0 rgba(255,255,255,.5)}
.knob__cap{width:57%;aspect-ratio:1;border-radius:50%;display:grid;place-items:center;
  background:radial-gradient(circle at 32% 26%,var(--k-cap-hi),var(--k-cap-lo) 80%);
  box-shadow:0 1px 1px rgba(255,255,255,.7) inset,0 -2px 4px rgba(0,0,0,.12) inset,0 8px 12px -4px var(--k-shadow);transition:transform .25s ease}
.knob__cap svg{width:46%;height:46%;color:var(--k-icon)}

/* colour variants (tokens per theme) */
[data-theme="light"]{--k-bezel-hi:#fbfaf8;--k-bezel-lo:#cfcbc3;--k-cap-hi:#fff;--k-cap-lo:#e9e6e0;--k-icon:#14181b;--k-notch:#bdb8ae;--k-shadow:rgba(20,24,27,.32)}
[data-theme="dark"] {--k-bezel-hi:#2b3238;--k-bezel-lo:#14181c;--k-cap-hi:#363e45;--k-cap-lo:#1d2328;--k-icon:#e9eef2;--k-notch:#5c6670;--k-shadow:rgba(0,0,0,.6)}

.knob--green{--k-bezel-hi:#6fe0b0;--k-bezel-lo:#1f9d6b;--k-cap-hi:#82ecbf;--k-cap-lo:#2bb27b;--k-icon:#05261a;--k-notch:#c9f7e2}
.knob--steel{--k-bezel-hi:#b5b5b5;--k-bezel-lo:#7d7d7d;--k-cap-hi:#c4c4c4;--k-cap-lo:#929292;--k-icon:#fff;--k-notch:#e8e8e8}
.knob--ink  {--k-bezel-hi:#4a4a4a;--k-bezel-lo:#1c1c1c;--k-cap-hi:#555;--k-cap-lo:#262626;--k-icon:#fff;--k-notch:#9a9a9a}

@media (hover:hover){
  .knob:hover .knob__dial{transform:translateY(-4px)}
  .knob:hover .knob__ring{transform:rotate(42deg)}      /* the dial "turns" */
  .knob:hover{color:var(--text)}
}
.knob:active .knob__dial{transform:translateY(1px) scale(.96)}
.knob:active .knob__cap{transform:scale(.94)}
.knob:focus-visible{outline:none}
.knob:focus-visible .knob__dial{outline:3px solid var(--accent);outline-offset:4px}
```

**Extras (small, optional but encouraged):** on pointer-drag the ring follows the pointer angle for a "real dial" feel (pointer events, clamp to ±60°, spring back on release); on click a short ripple. No sound by default.

**Light-theme paper grain** behind the Contact section only (4 to 7% opacity noise via an inline SVG `feTurbulence` data-URI as the page background).

**Acceptance:** four knobs centred, labels above, hover turns the notch, keyboard focus is visible, tap works on touch, all four links open the right targets, no emoji left in Contact.

---

## T4. Skills as boxes (match the reference screenshot)

**Reference anatomy:** a 3-column responsive grid of rounded cards. Each card has: a small uppercase **eyebrow** label in the accent colour, an **icon tile** (rounded square, subtle border), a bold **title**, a one-to-two line **description**, and a row of **chips** at the bottom. Cards lift on hover with a soft glow border; a spotlight highlight follows the cursor inside the card. The section has a pill label above it and a short helper line.

**Layout:** `grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr))` so it becomes 3, 2 or 1 columns by itself. With 5 cards, the last row must be visually balanced (centre the last row or let the last card span the remaining columns).

**Data (`src/data/skills.ts`).** Keep the existing skills; do not add skills that are not listed here.

```ts
export const skills = [
  { eyebrow: "SECURE",   icon: "shield",   title: "Network & Firewall Engineering",
    description: "Designing segmented, policy-driven networks and enforcing them with next-generation firewalls.",
    chips: ["Palo Alto","FortiGate","IDS/IPS","Firewall Policies","Network Segmentation","Traffic Analysis","CCNA Routing & Switching"] },
  { eyebrow: "DEFEND",   icon: "radar",    title: "Blue Team & SOC",
    description: "Detecting, investigating and containing threats with repeatable playbooks and metrics.",
    chips: ["Incident Response","Threat Detection","Log Analysis","Security Monitoring","SOC Metrics","Playbooks","Malware Analysis","Digital Forensics"] },
  { eyebrow: "INSPECT",  icon: "terminal", title: "Network & Security Tools",
    description: "Hands-on tooling for monitoring, endpoint protection, packet inspection and testing.",
    chips: ["Splunk (SIEM)","Kaspersky EDR","Wireshark","Nmap","Metasploit"] },
  { eyebrow: "INFRASTRUCTURE", icon: "cloud", title: "Systems & Cloud",
    description: "Operating Linux and Windows systems and securing workloads on AWS.",
    chips: ["Linux","Windows","AWS Architecture","AWS Core Services","Cloud Security Basics"] },
  { eyebrow: "BUILD",    icon: "code",     title: "Programming",
    description: "Scripting and building small tools, automations and web interfaces.",
    chips: ["Python","Bash","C/C++","HTML","CSS","JavaScript","Backend Concepts"] },
];
```

Use Lucide icons (`shield-check`, `radar`, `terminal`, `cloud`, `code-xml`), never emoji.

```css
.skill-card{position:relative;display:flex;flex-direction:column;gap:1rem;padding:clamp(1.25rem,2.5vw,1.75rem);
  border-radius:1.25rem;background:var(--surface);border:1px solid var(--border);box-shadow:var(--shadow-sm);
  transition:transform .35s cubic-bezier(.2,.7,.2,1),border-color .3s,box-shadow .35s;overflow:hidden}
.skill-card::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .3s;
  background:radial-gradient(360px circle at var(--mx,50%) var(--my,50%),var(--glow),transparent 60%)}
@media (hover:hover){
  .skill-card:hover{transform:translateY(-4px);border-color:var(--accent);box-shadow:var(--shadow-lg)}
  .skill-card:hover::before{opacity:1}
}
.skill-card__eyebrow{font:700 .72rem/1 var(--font-mono);letter-spacing:.18em;color:var(--accent)}
.skill-card__chips{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:auto}
.chip{padding:.4rem .75rem;border-radius:.6rem;border:1px solid var(--border);background:var(--bg-soft);font-size:.85rem;
  transition:transform .25s,border-color .25s}
@media (hover:hover){ .chip:hover{transform:translateY(-2px);border-color:var(--accent)} }
```

```ts
// spotlight follows the cursor inside each card
card.addEventListener("pointermove", (e) => {
  const r = card.getBoundingClientRect();
  card.style.setProperty("--mx", `${e.clientX - r.left}px`);
  card.style.setProperty("--my", `${e.clientY - r.top}px`);
});
```

Cards reveal with a stagger (see T10). The helper line under the title: "Hover over any skill or domain to see how I use it" (on touch devices: "Tap a card to explore").

---

## T5. Certifications: add the new certificates (no duplicates)

**Rename** the visible section title and any summary card from **"Certifications & Training"** to **"Certifications & Badges"** (search the whole codebase for the old string, including the About summary cards and any `aria-label`). Keep the section id `#certifications` and the nav label short ("Certifications").

**Existing certificates (already on the site, keep them):**
Deploying Security Strategies for the Modern Network · RCNA Routing & Switching · Sales Specialist: Kaspersky Next Optimum (S47.2) · Blue Team Scholarship, CyberTalents · SOC Analyst Foundation, SIEM XPERT · AWS Academy Cloud Foundations, NTI · Red Hat System Administration I (9.0), NTI · Python and Django learning guide, Udemy · eLearnSecurity Certified Incident Responder (eCIR), Netriders Academy · Cisco CyberOps, NTI · Introduction to Cybersecurity Bootcamp (Cohort 5), CyberTalents

**Add these 7 (titles verbatim, do not invent issuers or dates):**

```ts
// src/data/certifications.ts  (append; merge with the existing array)
export const newCertifications = [
  { title: "NSE 3",
    url: "https://drive.google.com/file/d/1BdfKHC5XRU3n-Hxxw6hA5dSsYvqes6-v/view?usp=drive_link" },
  { title: "Computer Science Course (Cyber Security), iSchool",
    url: "https://drive.google.com/file/d/1TZ4W4_Nx0efofgcNQplQ8invS4AfU8qg/view?usp=drive_link" },
  { title: "Black Belt ASA and Firewall Support Stage 3 (Jul 2025)",
    url: "https://drive.google.com/file/d/1hK8w7OaEGWE2w_r4qS6oeOx0xg_wcem_/view?usp=drive_link" },
  { title: "Veeam Technical Specialist: Kubernetes Data Protection 2026",
    url: "https://drive.google.com/file/d/1ypiElK6-5Fkj4ZtmusBWqj3XXj4JQ_QH/view?usp=drive_link" },
  { title: "Veeam Technical Specialist: Cybersecurity & DR 2026",
    url: "https://drive.google.com/file/d/1OAZGGe-uJesL7Z3RYi7WC4JeylzZLdAX/view?usp=drive_link" },
  { title: "Veeam Technical Specialist: Public Cloud 2026",
    url: "https://drive.google.com/file/d/1srajW_L45EJjD8sZ_VobSauNIyC--gKJ/view?usp=drive_link" },
  { title: "Veeam Technical Specialist: SaaS Protection 2026",
    url: "https://drive.google.com/file/d/1PSoYScC-jxMj7t3yfQy7BXFjGBh-sRq7/view?usp=drive_link" },
];
```

**No-duplicates rule (implement as a function and run it at build/dev time):**

```ts
const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\b(19|20)\d{2}\b/g, "").trim();
const fileId = (u = "") => u.match(/\/d\/([^/]+)/)?.[1];
// same certificate if the cleaned titles match, or one title is a whole-word part of the other
// (so "NSE 3" and "Fortinet NSE 3" count as the same certificate; "NSE 3" and "NSE 30" do not)
const same = (a: string, b: string) => {
  const x = key(a), y = key(b);
  return x === y || (Math.min(x.length, y.length) >= 5 && (` ${x} `.includes(` ${y} `) || ` ${y} `.includes(` ${x} `)));
};
export function mergeCerts(existing: Cert[], incoming: Cert[]) {
  const out = [...existing];
  for (const c of incoming) {
    const dup = out.find((e) => same(e.title, c.title) || (fileId(e.url) && fileId(e.url) === fileId(c.url)));
    if (dup) dup.url ||= c.url;      // same certificate: just attach the link, never add a second row
    else out.push(c);
  }
  return out;
}
```

**UI:** each certificate is a card/row with a check icon (draws itself on reveal), the title, and a "View" icon link that opens the Drive file in a new tab. Certificates without a link are not clickable. Update every certificate counter on the site (for example "11 Certificates" in About) to the real length of the merged array (expected: **18**, or fewer if the site already lists some of them; the site may already contain other certificates than the 11 listed above, so always merge against what is really in the code and never delete existing ones). Report the final count and any duplicate that was merged.

---

## T6. Education: replace the graduation certificate

In the Education section, **delete the existing graduation-certificate item** (link, button, image or PDF, and any now-unused file in `public/` or `src/assets/`) and replace it with a single "View graduation certificate" button/link to:

`https://drive.google.com/file/d/1-AZlTNMwmeJ9LeW6W23xMRvUwEHdLBbf/view?usp=drive_link` (new tab, `noopener noreferrer`).

Keep the degree card (B.Sc. Communication & Electronics Engineering, Benha University, Faculty of Engineering at Shoubra, June 2024, Excellent with Honors). Add the URL to `links.ts` as `graduationCertificate`.

---

## T7. Badges: continuous right-to-left loop


## T7. Badges: continuous right-to-left loop

Add an infinite scrolling ticker/marquee displaying the credential badges from the Badges/ folder:
- CyberHoc.png
- Cybersecurity.png
- Kubernetes.png
- Public_Cloud.png
- SaaS.png

**Requirements:**
- Seamless right-to-left continuous marquee loop (-50% translation with duplicated items).
- Pause on hover / focus-within.
- Soft edge fade masks (mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)).
- Badges keep their original colors in both light and dark themes (never inverted).
- Accessible alt attributes for all badge images.

---

## T8. CV replacement

**Requirements:**
- If a new CV PDF is provided in public/cv/ or root, rename/move it cleanly and update all Download CV buttons and links (header, hero, contact) to point to it.
- If no new CV file was provided, mark T8 BLOCKED: waiting for input and do not touch the existing CV link (Mohamed_Qurtam-Security_Engineer-CV.pdf).

---

## T9. Light mode: warm paper palette (eye-friendly)

**Requirements:**
- Replaced any color-inversion filter hacks (ilter: invert(1) hue-rotate(180deg)).
- Warm paper palette: background #f5f2ea, card surface #faf8f3, text #202b3a, secondary text #4a5568, accent #0f7a56.
- Photos, badges, diagrams and canvas particles keep their natural colors without filter inversion.
- Cyber mesh opacity reduced to ~0.3 in light mode for a clean, non-distracting background.
- Smooth theme transition using the View Transitions API where supported.

---

## T10. Creative motion pack

**Requirements:**
- Scroll progress bar fixed at top of viewport.
- Rotating role line typewriter under name.
- Floating portrait with rotating conic gradient ring (spin-slow, loat).
- 3D tilt and cursor radial spotlight on cards (--mx, --my).
- Timeline active role indicator with pulsing ping dot.
- Button light shine sweep on hover.

---

## T11. Accessibility and performance

**Requirements:**
- @media (prefers-reduced-motion: reduce) resets all transitions and animations to 0.01ms.
- Touch targets at least 44x44 px.
- WCAG AA contrast (>= 4.5:1) for all text against backgrounds in both modes.
- Pause canvas particle mesh when tab is not visible (isibilitychange).
- Reflow to single column with zero horizontal scroll at 400% zoom.


---

## T12. QA checklist and deliverables

**Verify (with screenshots in both themes):**
- [ ] Every section's left edge aligns with About (T1); no horizontal scroll at any width or zoom (T2)
- [ ] Contact knobs match the reference, links correct, no emoji (T3)
- [ ] Skills are cards with eyebrow, icon, title, description, chips; grid reflows 3/2/1 (T4)
- [ ] 7 new certificates added, none duplicated, links open, counters updated, title is "Certifications & Badges" (T5)
- [ ] Old graduation certificate removed, new link works (T6)
- [ ] Badges loop right to left, seamless, pause on hover (T7)
- [ ] New CV everywhere, old file deleted (T8)
- [ ] Light mode is warm, balanced, AA contrast; photo not inverted (T9)
- [ ] Creative effects present, toggleable, within budget, reduced-motion safe (T10, T11)
- [ ] `npm run build` and lint pass; no console errors

**Return format (what I expect back):** this same file, updated:
1. The **Status table** below filled in.
2. A **Changelog** (one line per task) and the **list of files changed/added/deleted**.
3. **Decisions and assumptions** (anything you chose because the spec was ambiguous).
4. **BLOCKED items** and exactly what input is missing.
5. The **final certificate count** and any merged duplicates.
6. A list of the screenshots taken.

### Status (the agent fills this in)

| Task | Status (Done / Partial / BLOCKED) | Notes |
|---|---|---|
| T1 Spacing and container | Done | Unified `container` with `var(--gutter)` and `var(--container-max)` aligns all headings and content to the exact same left vertical edge |
| T2 Responsive and zoom | Done | Verified 320px to 3840px, zoom 25% to 500%, `overflow-x: clip`, fluid clamp typography, zero horizontal scroll |
| T3 Contact knobs | Done | Implemented 4 tactile dial knob buttons (EMAIL, GITHUB, LINKEDIN, PHONE) matching reference with notch rotation, active scale, themes, plus copyable email and phones below |
| T4 Skills boxes | Done | Replaced table with 3-column responsive card grid (5 domains) with colored eyebrows, icon tiles, descriptions, chips, hover elevation, and cursor spotlight glow |
| T5 Certificates | Done | Renamed to "Certifications & Badges", updated summary counter to 30, merged Fortinet NSE 3 with URL, added 6 new certs (Black Belt Stage 3, 4 Veeam Specialists, iSchool Cyber Security) for 30 total (16 certs, 9 training, 5 self-study) |
| T6 Education certificate | Done | Replaced old graduation certificate Google Drive link with `https://drive.google.com/file/d/1-AZlTNMwmeJ9LeW6W23xMRvUwEHdLBbf/view?usp=drive_link` (opens in new tab with noopener noreferrer) |
| T7 Badges marquee | Done | Added infinite seamless right-to-left marquee loop displaying all 5 Badges/ (CyberHoc, Cybersecurity, Kubernetes, Public_Cloud, SaaS) with pause on hover/focus, edge fade masks, natural color preservation, and reduced-motion support |
| T8 CV replacement | | |
| T9 Light mode | | |
| T10 Creative motion | | |
| T11 Accessibility | | |
| T12 QA and report | | |