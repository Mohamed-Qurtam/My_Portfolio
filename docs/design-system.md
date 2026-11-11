# Design System & Accessibility Specification

**Candidate / Engineer:** Mohamed Qurtam — Network & Security Engineer  
**Date:** November 11, 2026  
**Auditor:** UI/UX Front-End & Design Systems Lead  
**Repository:** `github.com/Mohamed-Qurtam/My_Portfolio`  
**Current Branch:** `feat/design-system`  

---

## 1. Executive Summary

This design system establishes a systematic, accessible, and high-performance engineering interface for Mohamed Qurtam's personal portfolio. Rooted in defensive security aesthetics—dark terminal green with a warm paper counterpart—it replaces ad-hoc CSS properties with unified custom properties, fluid typography, and verified WCAG 2.2 AA contrast compliance.

---

## 2. Design Tokens Architecture

### 2.1 Color Tokens (Single Source of Truth)

All color tokens are scoped via CSS Custom Properties in `index.css`:

| Token | Dark Mode (`:root`) | Light Mode (`[data-theme="light"]`) | Semantic Purpose |
|---|---|---|---|
| `--bg-primary` | `#0e1012` | `#f5f2ea` | Base canvas background (warm paper tone on light) |
| `--bg-secondary` | `#161a1d` | `#faf8f3` | Card surface, containers, navigation bars |
| `--bg-tertiary` | `#1c2126` | `#ebe7dc` | Inset backgrounds, badge containers |
| `--bg-elevated` | `#222930` | `#ffffff` | Floating overlays, modal dialogs, tooltips |
| `--text-primary` | `#f0ede8` | `#202b3a` | High-emphasis headings, lead statements |
| `--text-secondary` | `#b6bfc9` | `#4a5568` | Body copy, technical descriptions, dates |
| `--text-tertiary` | `#929da9` | `#596775` | Captions, metadata tags, subtle labels |
| `--accent` | `#4dbb8a` | `#0f7a56` | Primary action emerald, verified status, active states |
| `--accent-dim` | `#3a9470` | `#0b5e42` | Hover focus states, pressed button states |
| `--accent-glow` | `rgba(77, 187, 138, 0.12)` | `rgba(15, 122, 86, 0.12)` | Ambient glow around focused / active cards |
| `--border-primary` | `#2a3038` | `#dcd6c8` | Standard structural borders |
| `--border-subtle` | `#1e2429` | `#e8e3d8` | Subtle card dividers, ticker borders |
| `--border-accent` | `rgba(77, 187, 138, 0.3)` | `rgba(15, 122, 86, 0.35)` | Highlighted boundaries, active badges |

---

### 2.2 Fluid Typography Scale

Typography employs CSS `clamp()` to scale smoothly between 320px mobile viewports and 1920px widescreen displays without abrupt breakpoint jumps:

| Element / Style | Font Family | Size Range (`clamp`) | Line Height | Letter Spacing | Max Line Length |
|---|---|---|---|---|---|
| **Display Name** (`.hero__name`) | `Space Grotesk` | `clamp(2rem, 5vw, 3.6rem)` | `1.15` | `-0.02em` | `24ch` |
| **Role Typewriter** (`.hero__role-line`) | `IBM Plex Mono` | `clamp(0.95rem, 2.2vw, 1.25rem)` | `1.4` | `0.06em` | `40ch` |
| **Section Headings** (`h2.section-heading`) | `Space Grotesk` | `clamp(1.75rem, 3.8vw, 2.5rem)` | `1.2` | `-0.01em` | `32ch` |
| **Card Headings** (`h3`, `h4`) | `Space Grotesk` | `clamp(1.1rem, 2vw, 1.35rem)` | `1.35` | `0` | `45ch` |
| **Body Paragraphs** (`p`, `.hero__intro`) | `Space Grotesk` | `clamp(0.92rem, 1.5vw, 1.05rem)` | `1.7` | `0` | **`68ch` max** |
| **Technical Badges / Eyebrows** | `IBM Plex Mono` | `clamp(0.72rem, 1.2vw, 0.8rem)` | `1.4` | `0.05em` | N/A |

---

### 2.3 Modular Spacing & Radius Scale

```css
--space-2xs: 0.2rem;   /* 3.2px */
--space-xs:  0.4rem;   /* 6.4px */
--space-sm:  0.65rem;  /* 10.4px */
--space-md:  0.9rem;   /* 14.4px */
--space-lg:  1.25rem;  /* 20px */
--space-xl:  1.5rem;   /* 24px */
--space-2xl: 2.0rem;   /* 32px */
--space-3xl: 2.75rem;  /* 44px */
--space-4xl: 3.5rem;   /* 56px */
--space-5xl: clamp(1.75rem, 3.5vw, 3rem);

--radius-sm: 4px;      /* Chips, input fields, code chips */
--radius-md: 8px;      /* Standard cards, dialogs, buttons */
--radius-lg: 12px;     /* Hanging portrait frame, feature containers */
```

---

## 3. WCAG 2.2 AA Contrast Verification Matrix

All color tokens were mathematically verified using the W3C Relative Luminance Formula (`(L1 + 0.05) / (L2 + 0.05)`). WCAG 2.2 AA mandates a minimum contrast ratio of **4.5:1 for body copy** and **3.0:1 for large text and graphical user interface components**.

### 3.1 Dark Theme Ratios (Base `#0e1012`)

| Foreground Token | Color Hex | Background Token | Background Hex | Contrast Ratio | WCAG 2.2 Status |
|---|---|---|---|---|---|
| `--text-primary` | `#f0ede8` | `--bg-primary` | `#0e1012` | **16.33 : 1** | **PASS (AAA)** |
| `--text-secondary` | `#b6bfc9` | `--bg-primary` | `#0e1012` | **10.24 : 1** | **PASS (AAA)** |
| `--text-tertiary` | `#929da9` | `--bg-primary` | `#0e1012` | **6.92 : 1** | **PASS (AA)** |
| `--accent` | `#4dbb8a` | `--bg-primary` | `#0e1012` | **7.98 : 1** | **PASS (AAA)** |
| `--text-primary` | `#f0ede8` | `--bg-secondary` | `#161a1d` | **14.99 : 1** | **PASS (AAA)** |
| `--text-secondary` | `#b6bfc9` | `--bg-secondary` | `#161a1d` | **9.41 : 1** | **PASS (AAA)** |
| `--accent` | `#4dbb8a` | `--bg-secondary` | `#161a1d` | **7.33 : 1** | **PASS (AAA)** |

---

### 3.2 Light Theme Ratios (Base `#f5f2ea`)

| Foreground Token | Color Hex | Background Token | Background Hex | Contrast Ratio | WCAG 2.2 Status |
|---|---|---|---|---|---|
| `--text-primary` | `#202b3a` | `--bg-primary` | `#f5f2ea` | **12.79 : 1** | **PASS (AAA)** |
| `--text-secondary` | `#4a5568` | `--bg-primary` | `#f5f2ea` | **6.73 : 1** | **PASS (AA)** |
| `--text-tertiary` | `#596775` | `--bg-primary` | `#f5f2ea` | **5.18 : 1** | **PASS (AA)** |
| `--accent` | `#0f7a56` | `--bg-primary` | `#f5f2ea` | **4.77 : 1** | **PASS (AA)** |
| `--text-primary` | `#202b3a` | `--bg-secondary` | `#faf8f3` | **13.48 : 1** | **PASS (AAA)** |
| `--text-secondary` | `#4a5568` | `--bg-secondary` | `#faf8f3` | **7.09 : 1** | **PASS (AA)** |
| `--text-tertiary` | `#596775` | `--bg-secondary` | `#faf8f3` | **5.46 : 1** | **PASS (AA)** |
| `--accent` | `#0f7a56` | `--bg-secondary` | `#faf8f3` | **5.02 : 1** | **PASS (AA)** |

*Result:* **100% of text and background pairings pass WCAG 2.2 Level AA guidelines.**

---

## 4. Component States Checklist

| Component | Default | Hover | Focus-Visible | Active (Pressed) | Touch Minimum |
|---|---|---|---|---|---|
| **Primary Button** (`.btn-primary`) | Solid emerald fill, dark contrast text | `translateY(-2px)`, deep emerald shadow | `outline: 2px solid var(--accent); outline-offset: 3px;` | `translateY(0)`, scale `0.98` | **≥ 44px height** |
| **Secondary Button** (`.btn-secondary`) | Subtle border, transparent backdrop | Border color shifts to emerald, soft glow | `outline: 2px solid var(--accent); outline-offset: 3px;` | Scaled down `0.98` | **≥ 44px height** |
| **Credential Card** (`.cert-card-clean`) | Muted surface with subtle border | Border highlights to `--border-accent`, external link shifts `↗` | Emerald focus ring, raised elevation | Border flashes active emerald | **Full card clickable (≥ 64px)** |
| **Filter Tab Button** (`.certs-filter-btn`) | Monospaced chip, subtle border | Active border highlight | High-contrast outline | Active state adds solid accent indicator | **≥ 44px x 44px** |
| **Theme Toggle** (`#navThemeToggle`) | Rounded pill with Sun/Moon icon | Border shifts to emerald | Focus outline ring | Icon rotates slightly, scales down `0.95` | **44px x 44px** |
| **Back-To-Top** (`#qt-floating-top`) | Circular progress indicator | Background lightens, arrow nudges upward | Circular focus outline | Scaled down `0.92` | **44px x 44px** |
| **Hanging Portrait Card** (`#heroPortraitCard`) | Resting at `0deg`, subtle cord tension | Perspective tilt follows pointer | Focus ring around outer frame | Pendulum damped swing animation (`frame-swing`) | **Touch friendly on full card** |

---

## 5. Accessibility & Motion Rules

1. **Touch Target Size:** Every interactive element has a minimum bounding box of `44px x 44px` on touch screens.
2. **Progressive Enhancement:** 100% of content, certifications, and links are navigable without JavaScript enabled.
3. **Prefers-Reduced-Motion:**
   - Under `@media (prefers-reduced-motion: reduce)`, all animations (`tech-ticker-loop`, `vendor-marquee-loop`, `frame-swing`, ambient canvas) are stopped immediately.
   - Transitions drop to `0s` and tickers switch to accessible horizontal scrollbars.

