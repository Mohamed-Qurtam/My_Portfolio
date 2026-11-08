# Portfolio Edits (v3)

Stack assumed: Lovable export (Vite + React + TypeScript + Tailwind + shadcn/ui). Apply in Antigravity IDE. Search the repo for the quoted strings to find the right files.

This version replaces v2. What changes:

1. Contact: delete **Phone (primary)**
2. Fix the layout so it is responsive on every device and zoom level (your screenshots show content stuck to the left edge with zero padding, and the hero spread too thin on wide screens)
3. Marquee bar: add **Firepower** between Palo Alto and FortiGate
4. Tighten the spacing between sections
5. Certificates: add Fortinet NSE 1, NSE 2, NSE 3 with links
6. Light mode: a softer, eye-friendly theme
7. More motion

Still applies from earlier rounds: status strip removed, `NSE 4/5` renamed to `NSE 4`, RCNA added, education card links to the degree certificate, per-card certificate links, icon-only contact.

---

## 1. Contact: delete Phone (primary)

In the `contacts` array, delete this entry (the number is +20 1024227004):

```ts
{ label: "Phone (primary)", href: "tel:+201024227004", icon: Phone },
```

Keep the other number, and rename it since it is now the only phone:

```ts
{ label: "Phone", href: "tel:+201015220163", icon: Phone },
```

Search the whole project for `1024227004` and `01024227004` and remove every other occurrence (footer, JSON-LD / meta tags, CV text). Keep the icon-only format.

---

## 2. Responsive on all devices and zoom levels

### What your screenshots show

- **Screenshot 2:** "Experience", the tag, "Back to top" and the Strengths box touch the left edge with 0px padding. The text is clipped at the screen edge. This means a section wrapper lost its horizontal padding. Never allow 0.
- **Screenshot 1:** at about 1900px wide the hero text sits at the far left and the photo at the far right, with a huge empty middle. The hero is also a full screen tall with a lot of dead space.
- The second hero button, next to "Download CV", shows an empty box with no readable label.

### a) One fluid page wrapper (use it on every section)

Create `src/components/Section.tsx`:

```tsx
import { ReactNode } from "react";

export function Section({ id, children, className = "" }:
  { id?: string; children: ReactNode; className?: string }) {
  return (
    <section
      id={id}
      className={`w-full scroll-mt-16 px-[clamp(1rem,4vw,4rem)] py-[clamp(2.5rem,6vw,5rem)] ${className}`}
    >
      <div className="mx-auto w-full max-w-[min(100%,110rem)]">{children}</div>
    </section>
  );
}
```

Replace every section's outer wrapper (About, Experience, Skills, Education, Projects, Certifications, Contact) with `<Section id="...">`. Remove any `px-0`, `-mx-*`, `ml-*`, `pl-0` or negative margins on those wrappers or on their children (cards, headings, the tag, "Back to top"). Check `index.css` and `App.css` for the same.

### b) Fluid root size (scales the whole site on big screens, and stays stable when zooming)

In `src/index.css`:

```css
html {
  font-size: clamp(14px, 0.35vw + 12.5px, 19px);   /* 14px on small phones, about 19px on 4K / ultrawide */
  scrollbar-gutter: stable;
  -webkit-text-size-adjust: 100%;
}
html, body, #root { width: 100%; min-height: 100%; margin: 0; padding: 0; }
body { overflow-x: clip; }                          /* clip, not hidden: keeps sticky nav working */
*, *::before, *::after { box-sizing: border-box; min-width: 0; }
img, svg, video, canvas, iframe { max-width: 100%; height: auto; }
```

Make sure the font sizes, paddings and widths across the components use `rem` or Tailwind classes, not hard-coded `px`. Search for `px` in inline styles and `w-[...px]` / `h-[...px]` and convert to `rem`, `clamp()`, `%` or `vw`.

### c) Fluid type

Use `clamp()` for the big text:

```tsx
<h1 className="text-[clamp(2.25rem,5vw+0.5rem,5rem)] leading-[1.05]">Mohamed Qurtam</h1>
<p  className="text-[clamp(0.8rem,0.9vw+0.5rem,1.15rem)] tracking-wide">ENTERPRISE SWITCHING &amp; ROUTING SPECIALIST (CISCO · RUIJIE)</p>
```

Section titles: `text-[clamp(1.75rem,3vw+0.5rem,3rem)]`.

### d) Hero

Find the hero (`Hero.tsx`, the component with "DEFENSIVE SECURITY · RESILIENT INFRASTRUCTURE").

```tsx
<section id="home"
  className="relative w-full min-h-[min(100svh,60rem)] px-[clamp(1rem,4vw,4rem)] pt-24 pb-[clamp(3rem,8vw,6rem)]
             grid items-center gap-[clamp(1.5rem,4vw,4rem)] grid-cols-1 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
  <div className="order-2 md:order-1 min-w-0">{/* text, buttons, social icons */}</div>
  <div className="order-1 md:order-2 justify-self-center md:justify-self-end">
    {/* photo: w-[clamp(11rem,22vw,22rem)] aspect-[3/4] */}
  </div>
</section>
```

- Remove any `h-screen`, `min-h-screen`, `h-[100vh]` from the hero. Use `100svh` (it fixes mobile browser bars).
- Photo size: `w-[clamp(11rem,22vw,22rem)]`.
- The text block should take the full column (`max-w-none`), with the paragraph at `max-w-[60ch]`.
- **Empty second button:** open the hero buttons and check that it has a label (for example "View Projects"). If it does, the text color is the same as the background (typical shadcn `variant="outline"` problem). Fix with `className="text-foreground border-border hover:bg-primary/10"`.

### e) Marquee bar sizing

Make the bar a normal block, not absolutely positioned at `bottom-0` of a fixed-height hero. See section 3.

### f) Grids that reflow

```tsx
className="grid w-full gap-[clamp(0.75rem,1.5vw,1.5rem)] grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
```

The certificates grid should be `grid-cols-1 md:grid-cols-2 2xl:grid-cols-3`. For long text (emails, URLs, certificate titles) add `break-words`.

### g) Experience timeline on small screens

The date column and the content should stack on phones:

```tsx
className="grid grid-cols-1 gap-2 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-8"
```

### h) Test matrix

Browser zoom 25%, 50%, 75%, 100%, 125%, 150%, 200%, 300%. DevTools device sizes: 320, 375, 768, 1024, 1440, 1920, 2560. Pass criteria: no horizontal scrollbar, no text touching the screen edge, nothing clipped, no big empty areas.

---

## 3. Marquee bar: add Firepower

Find the bar with FortiGate, Splunk, Kaspersky EDR, Wireshark, Nmap, IDS/IPS, CCNA, Linux, AWS, Python, Bash, Palo Alto (search for `Kaspersky EDR` or `marquee`).

Because the bar loops, "between Palo Alto and FortiGate" is the end of the list. Add Firepower **after Palo Alto**, so the loop reads: ... Bash, Palo Alto, **Firepower**, FortiGate, Splunk ...

```tsx
const tools = [
  "FortiGate", "Splunk", "Kaspersky EDR", "Wireshark", "Nmap", "IDS/IPS",
  "CCNA", "Linux", "AWS", "Python", "Bash", "Palo Alto", "Firepower",
];
```

If your list has the first FortiGate as the loop start, no other change is needed. If the items are written as separate JSX chips, add one more chip after Palo Alto in each copy (the original and the duplicate for the seamless loop). Make sure the Palo Alto chip is no longer cut off at the right edge (see your screenshot).

Better marquee (seamless, pauses on hover, soft fade at the edges, glow on hover):

```tsx
export function ToolMarquee() {
  const row = [...tools, ...tools];   // duplicated for a seamless loop
  return (
    <div className="group relative w-full overflow-hidden border-y border-border bg-card/60 py-3
                    [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <ul className="flex w-max gap-4 animate-marquee group-hover:[animation-play-state:paused]">
        {row.map((t, i) => (
          <li key={i}
              className="shrink-0 rounded-md border border-border bg-background/60 px-4 py-1.5 font-mono text-xs
                         transition hover:-translate-y-0.5 hover:border-primary hover:text-primary
                         hover:shadow-[0_0_1.25rem_hsl(var(--primary)/0.35)]">
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

In `tailwind.config.ts` under `theme.extend`:

```ts
keyframes: { marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } } },
animation: { marquee: "marquee 35s linear infinite" },
```

(Because the list is duplicated, `-50%` gives a perfect loop.)

---

## 4. Tighter spacing between sections

Your screenshot 2 shows about 300px of empty space between "Back to top" and the next section's tag.

1. **Delete the inline "↑ Back to top" button** at the end of each section. The round floating arrow button (bottom right, with the progress ring) already does this job. This alone removes most of the dead space.
2. Use the `Section` wrapper from section 2a: vertical padding is `clamp(2.5rem, 6vw, 5rem)` (40px to 80px) instead of the current large value.
3. Search for and remove or reduce: `py-24`, `py-32`, `pt-32`, `pb-32`, `mb-24`, `mt-24`, `min-h-screen`, and any empty spacer `<div className="h-*" />` between sections.
4. Do not stack padding: if one section has `pb-*` and the next has `pt-*` plus the wrapper padding, remove the extra `pb`/`pt`.
5. Heading gap: the heading block should have `mb-[clamp(1.25rem,3vw,2.5rem)]`.
6. Keep the thin divider line, but put it on the section top (`border-t border-border`) rather than on a tall empty block.

---

## 5. Certificates: Fortinet NSE 1, NSE 2, NSE 3

Add or update these entries in the `certs` array (same `Cert` type as in v2):

```ts
{ title: "Fortinet NSE 1", issuer: "Fortinet", badge: "PROGRAM", category: "Certificates & Programs",
  links: [{ label: "Certificate", url: "https://drive.google.com/file/d/1Zu7S_-dQnHMSjr2NScvsbjc9_uuMpn7I/view?usp=sharing" }] },

{ title: "Fortinet NSE 2", issuer: "Fortinet", badge: "PROGRAM", category: "Certificates & Programs",
  links: [{ label: "Certificate", url: "https://drive.google.com/file/d/1jlEzjSlGVRJN2dyuMWsMVSeIUxpMmn_p/view?usp=drive_link" }] },

{ title: "Fortinet NSE 3", issuer: "Fortinet", badge: "PROGRAM", category: "Certificates & Programs" },
// NSE 3: no link was given yet. Add: links: [{ label: "Certificate", url: "..." }]
```

If NSE 1 and NSE 2 are already in your array from v2, just replace their links with the ones above (NSE 1 now uses `usp=sharing`, NSE 2 uses `usp=drive_link`).

NSE 3 stays visible but not clickable until you send me (or paste in) its link.

Keep `Fortinet NSE 4` in the Self-Study group, and sort the Fortinet cards in order: NSE 1, NSE 2, NSE 3, NSE 4.

Counts are computed with `certs.length` and `countOf(category)`, so the subtitle and the tabs update on their own. Do not hard-code the number.

---

## 6. Light mode: easier on the eyes

Why it hurts: pure white backgrounds, strong neon-emerald on white (low contrast, glows), and the dark-mode glow/grid effects staying at full strength.

### a) Palette (replace the `:root` block in `src/index.css`)

The values assume shadcn's HSL variables (`--background: H S% L%`). If yours use another format, convert the hex values noted in comments.

```css
:root {
  /* warm paper, never pure white */
  --background: 42 28% 95%;          /* #f5f2ea */
  --foreground: 215 28% 17%;         /* #202b3a soft navy, not black */

  --card: 40 30% 97.5%;              /* #faf8f3 */
  --card-foreground: 215 28% 17%;
  --popover: 40 30% 97.5%;
  --popover-foreground: 215 28% 17%;

  --muted: 40 18% 90%;               /* #ebe7dc */
  --muted-foreground: 215 14% 38%;   /* readable grey, 5:1 on background */

  --border: 38 16% 82%;              /* #dcd6c8 */
  --input: 38 16% 82%;
  --ring: 162 70% 28%;

  /* deeper emerald: readable on light backgrounds (contrast 5:1+) */
  --primary: 162 78% 26%;            /* #0f7a56 */
  --primary-foreground: 42 40% 97%;

  --secondary: 215 40% 90%;          /* soft blue-grey */
  --secondary-foreground: 215 40% 20%;
  --accent: 195 55% 88%;             /* soft teal wash */
  --accent-foreground: 200 50% 18%;

  --shadow-soft: 0 0.25rem 1.5rem -0.5rem hsl(215 30% 20% / 0.12);
}

html { transition: background-color .35s ease, color .35s ease; }
body, .card, header, section { transition: background-color .35s ease, border-color .35s ease, color .35s ease; }
```

Leave the existing `.dark { ... }` block as it is.

### b) Tone down the effects in light mode

```css
/* hero glows and grid */
:root .hero-glow       { opacity: .35; mix-blend-mode: multiply; }   /* use your glow class names */
:root .hero-grid       { opacity: .5;  filter: invert(1) opacity(.08); }
:root .particles       { opacity: .5; }                              /* or set the canvas particle colour to hsl(162 60% 30% / .5) */

/* soft depth instead of neon */
:root .card, :root [class*="rounded-lg"] { box-shadow: var(--shadow-soft); }
```

Use the real class names from your components (search `glow`, `grid`, `particles`, `canvas`). If the particle background is a canvas, read the theme (`document.documentElement.classList.contains("dark")`) and draw with `hsl(162 55% 32% / .55)` in light mode.

### c) Light-mode details

- Replace any hard-coded `bg-white`, `text-black`, `text-emerald-400`, `border-white/10` and `bg-white/5` with theme tokens: `bg-card`, `text-foreground`, `text-primary`, `border-border`, `bg-muted/50`. These hard-coded dark-mode values are the main reason light mode looks wrong. Search for `white/`, `emerald-`, `zinc-`, `#` colours.
- The mono labels (`// 02 · CAREER`): `text-primary bg-primary/10 border-primary/30`.
- Optional soft page gradient for light mode only: `background-image: radial-gradient(60rem 30rem at 10% -10%, hsl(162 60% 85% / .6), transparent), radial-gradient(50rem 30rem at 100% 0%, hsl(215 70% 88% / .55), transparent);`
- Theme toggle: also respect the system setting on first load (`window.matchMedia("(prefers-color-scheme: dark)")`) and save the choice in `localStorage`.

---

## 7. More motion (creative pack)

Install: `npm i framer-motion`

All animations must respect reduced motion. Add once in `index.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
}
```

### 7.1 Scroll progress bar (top of the page)

```tsx
import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });
  return <motion.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-primary" />;
}
```

Render it once in `App.tsx`.

### 7.2 Reveal on scroll with stagger (use for every section)

```tsx
import { motion, Variants } from "framer-motion";

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item: Variants = { hidden: { opacity: 0, y: 24, filter: "blur(6px)" }, show: { opacity: 1, y: 0, filter: "blur(0)", transition: { duration: .6, ease: [.22,1,.36,1] } } };

export const Reveal = ({ children, className = "" }: any) => (
  <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10% 0px" }} className={className}>
    {children}
  </motion.div>
);
export const RevealItem = ({ children, className = "" }: any) => (
  <motion.div variants={item} className={className}>{children}</motion.div>
);
```

Wrap each section's grid in `<Reveal>` and each card in `<RevealItem>`.

### 7.3 Hero: rotating typewriter role line

```tsx
import { useEffect, useState } from "react";

const roles = ["Enterprise Switching & Routing", "Network Security", "SOC & Incident Response", "Firewall Engineering"];

export function Typewriter() {
  const [i, setI] = useState(0), [txt, setTxt] = useState(""), [del, setDel] = useState(false);
  useEffect(() => {
    const full = roles[i];
    const t = setTimeout(() => {
      if (!del) { setTxt(full.slice(0, txt.length + 1)); if (txt === full) setTimeout(() => setDel(true), 1200); }
      else { setTxt(full.slice(0, txt.length - 1)); if (txt === "") { setDel(false); setI((i + 1) % roles.length); } }
    }, del ? 30 : 60);
    return () => clearTimeout(t);
  }, [txt, del, i]);
  return <span className="font-mono text-primary">{txt}<span className="ml-0.5 inline-block w-[0.5ch] animate-pulse">▍</span></span>;
}
```

Use it under the name (keep the main title static for SEO).

### 7.4 Hero: floating photo with a rotating gradient ring, plus mouse parallax glow

```css
@keyframes spin-slow { to { transform: rotate(360deg); } }
@keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-0.6rem) } }

.photo-wrap { position: relative; animation: float 6s ease-in-out infinite; }
.photo-wrap::before {
  content: ""; position: absolute; inset: -0.4rem; border-radius: inherit; z-index: -1;
  background: conic-gradient(from 0deg, hsl(var(--primary)), hsl(210 80% 55%), transparent 60%, hsl(var(--primary)));
  filter: blur(0.6rem); opacity: .7; animation: spin-slow 8s linear infinite;
}
```

Mouse-follow glow behind the hero:

```tsx
const onMove = (e: React.MouseEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
};
// <section onMouseMove={onMove} className="hero-spot ...">
```

```css
.hero-spot::after { content:""; position:absolute; inset:0; pointer-events:none;
  background: radial-gradient(28rem circle at var(--mx,50%) var(--my,40%), hsl(var(--primary)/.14), transparent 60%); }
```

### 7.5 Spotlight and 3D tilt on cards (certificates, projects, skills)

```tsx
import { useRef } from "react";

export function TiltCard({ children, className = "" }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.MouseEvent) => {
    const el = ref.current!, r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(60rem) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-2px)`;
    el.style.setProperty("--sx", `${x * 100}%`); el.style.setProperty("--sy", `${y * 100}%`);
  };
  const leave = () => { ref.current!.style.transform = ""; };
  return (
    <div ref={ref} onMouseMove={move} onMouseLeave={leave}
         className={`relative transition-transform duration-200 will-change-transform
                     before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:opacity-0
                     before:transition-opacity before:duration-300 hover:before:opacity-100
                     before:bg-[radial-gradient(14rem_circle_at_var(--sx)_var(--sy),hsl(var(--primary)/.18),transparent_70%)] ${className}`}>
      {children}
    </div>
  );
}
```

Wrap the certificate buttons: `<TiltCard className="rounded-lg"><button ...>...</button></TiltCard>`. Disable on touch screens with `@media (hover: none) { ... }` or by skipping the handler when `matchMedia("(hover: none)").matches`.

### 7.6 Experience timeline: the line draws as you scroll

```tsx
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function Timeline({ children }: any) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 60%"] });
  const h = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  return (
    <div ref={ref} className="relative">
      <div className="absolute left-0 top-0 h-full w-px bg-border" />
      <motion.div style={{ height: h }} className="absolute left-0 top-0 w-px bg-primary shadow-[0_0_0.75rem_hsl(var(--primary))]" />
      {children}
    </div>
  );
}
```

Add a pulse to the current-job dot: `animate-ping` on a duplicate dot behind the "Network & Security Engineer" marker.

### 7.7 Nav: sliding active pill + scroll-spy

```tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const links = ["about","experience","skills","education","projects","certifications","contact"];

export function useScrollSpy() {
  const [active, setActive] = useState("about");
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    links.forEach((id) => { const el = document.getElementById(id); el && io.observe(el); });
    return () => io.disconnect();
  }, []);
  return active;
}

// in each nav link:
// {active === id && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-md bg-primary/10 ring-1 ring-primary/30" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
```

Make the nav links `relative`. Add `scroll-behavior: smooth` to `html`.

### 7.8 Animated counters (use for "24 credentials", years of experience, etc.)

```tsx
import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";

export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const c = animate(0, to, { duration: 1.4, ease: "easeOut", onUpdate: v => (ref.current!.textContent = Math.round(v) + suffix) });
    return () => c.stop();
  }, [inView, to, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}
```

In the Certifications subtitle: `<Counter to={certs.length} /> verified credentials`.

### 7.9 Section headings: underline grows, label slides in

```tsx
<motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
  {/* // 02 · CAREER tag */}
</motion.div>
<motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: .8, delay: .15 }}
  className="mt-3 block h-0.5 w-16 origin-left bg-gradient-to-r from-primary to-transparent" />
```

### 7.10 Buttons and icons

- Magnetic hero buttons: on mouse move, `translate(x*0.2, y*0.2)` of the button (same idea as TiltCard), reset on leave.
- Contact icons: `hover:-translate-y-1 hover:rotate-[-6deg] active:scale-95`, plus a tooltip fade-in.
- Download CV: a small arrow that drops (`group-hover:translate-y-0.5`) and a shine sweep:

```css
.btn-shine { position: relative; overflow: hidden; }
.btn-shine::after { content:""; position:absolute; inset:0; transform: translateX(-120%) skewX(-20deg);
  background: linear-gradient(90deg, transparent, hsl(0 0% 100% / .35), transparent); transition: transform .7s; }
.btn-shine:hover::after { transform: translateX(120%) skewX(-20deg); }
```

### 7.11 Theme switch animation

Use the View Transitions API for a smooth fade between light and dark (fallback is instant):

```ts
const toggle = () => {
  const apply = () => document.documentElement.classList.toggle("dark");
  // @ts-ignore
  document.startViewTransition ? document.startViewTransition(apply) : apply();
};
```

### 7.12 Performance and accessibility

- Animate only `transform` and `opacity` (plus the soft blur in reveals); never width, height, top or left.
- Use `viewport={{ once: true }}` so reveals do not replay.
- Pause the particle canvas when the tab is hidden (`document.visibilitychange`) and cap its count on mobile (for example 40 instead of 120).
- Keep the reduced-motion rule from the top of this section.

---

## Checklist

- [x] Phone (primary) removed everywhere; the remaining number is labelled "Phone"
- [ ] `Section` wrapper used on every section; no `px-0` / negative margins; fluid root font size set
- [ ] Hero uses the grid, no full-screen height, the second button has a visible label
- [ ] No horizontal scrollbar at any zoom (25% to 300%) or any device width (320 to 2560)
- [ ] Firepower added after Palo Alto in the marquee; loop is seamless
- [ ] Inline "Back to top" buttons deleted; section spacing tightened
- [ ] Fortinet NSE 1 and NSE 2 linked; NSE 3 added (waiting for its link)
- [ ] Light-mode tokens replaced; hard-coded `white/` `emerald-` colours converted to tokens
- [ ] Motion pack applied (progress bar, reveals, typewriter, tilt, timeline, nav pill, counters, marquee) with reduced-motion fallback

---

## Status Table

| Task | Description | Status |
| :--- | :--- | :--- |
| **T1** | Contact & Phone Cleanup (delete primary phone `+20 1024227004`, keep single phone `+20 1015220163` as "Phone") | ✅ Completed |
| **T2** | Fluid Page Wrapper & Edge Spacing (`clamp(1.75rem, 4.5vw, 4.5rem)` padding, zero text clipping) | Pending |
| **T3** | Fluid Root Typography & Scaling (`clamp(14px, 0.35vw + 12.5px, 19px)`, `overflow-x: clip`) | Pending |
| **T4** | Hero Layout & Button Contrast (`min-height: min(100svh, 55rem)`, accessible buttons) | Pending |
| **T5** | Core Technologies Marquee with "Firepower" (added after Palo Alto, seamless loop, edge fade) | Pending |
| **T6** | Tightened Section Spacing (remove inline back-to-top, reduce vertical gaps to clamp) | Pending |
| **T7** | Certifications: Fortinet NSE 1, 2, 3 & Badges from `Badges/` directory integration | Pending |
| **T8** | Eye-Friendly Warm Light Mode Palette (clean design tokens, no color-inversion filter hack) | Pending |
| **T9** | Scroll Progress Bar & Section Reveals (viewport observer, stagger animations) | Pending |
| **T10** | Hero Photo Floating Ring & Role Typer (conic gradient ring, float animation, typewriter) | Pending |
| **T11** | Card 3D Tilt, Spotlight Glow & Timeline Pulse (radial cursor spotlight, current role pulse) | Pending |
| **T12** | Tactile Contact Buttons, Button Shine & Reduced-Motion Fallbacks | Pending |

