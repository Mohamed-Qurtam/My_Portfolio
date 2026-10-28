# Portfolio Edits (v2)

Stack assumed: Lovable export (Vite + React + TypeScript + Tailwind + shadcn/ui). Apply in Antigravity IDE. Search the repo for the quoted strings to find the right files.

Summary of this round:

1. Remove the Firewall / Encryption / Latency / SOC status strip
2. Make the whole page fluid, with no empty space on the left and right at any zoom level
3. Education: clicking opens the degree certificate
4. Certifications: each card opens its own certificate link
5. Contact: icons only, no visible links or numbers

Earlier edits still apply: change `NSE 4/5` to `NSE 4`, and add `RCNA Routing & Switching` (Ruijie).

---

## 1. Remove the status strip

Search for any of these strings: `FIREWALL`, `DROPPED`, `IPsec`, `AES-256`, `LATENCY`, `HARDENED`, `SOC STATUS`.

- Delete the whole component or JSX block that renders them (probably in `Hero.tsx`, or a `StatusBar` / `Terminal` component).
- Delete its import and its usage.
- Delete any related CSS or animation (a blinking dot, a `pulse` class) if nothing else uses it.
- Make sure the hero still lines up after removal (no leftover empty `div` with margin or height).

## 2. Fluid layout: no side gaps at any zoom

The side gaps almost always come from one of these four things. Check each.

**a) Tailwind container cap.** Open `tailwind.config.ts`. Lovable projects usually have:

```ts
container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } }
```

Replace it with a fluid version:

```ts
container: {
  center: true,
  padding: "clamp(1rem, 3vw, 3rem)",
  screens: { "2xl": "100%" }   // removes the 1400px cap
},
```

**b) Fixed max-width wrappers.** Search the project for `max-w-`, `w-[`, `max-width`, `mx-auto` on page sections and the main wrapper (`App.tsx`, `Index.tsx`, `index.css`, `App.css`). For every section wrapper:

- Remove `max-w-6xl`, `max-w-7xl`, `max-w-screen-xl` and fixed `w-[###px]`.
- Use `w-full px-[clamp(1rem,3vw,3rem)]` instead.
- Remove the Vite default `#root { max-width: 1280px; margin: 0 auto; padding: 2rem; text-align: center }` in `App.css` if it is still there.

**c) Narrow inner blocks.** The Contact card in your screenshot stops at about 600px and leaves a large empty area on the right. Remove `max-w-md`, `max-w-xl` and `max-w-2xl` from card or grid wrappers and use `w-full`. Keep a width cap only on long paragraphs (`max-w-prose`), and never on cards or grids.

**d) Global reset.** In `src/index.css`:

```css
html, body, #root {
  width: 100%;
  min-height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;   /* prevents sideways scroll when zooming */
}
*, *::before, *::after { box-sizing: border-box; }
img, svg, video, iframe { max-width: 100%; height: auto; }
```

Also make sure `index.html` has:

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

Section wrapper pattern to reuse everywhere:

```tsx
<section className="w-full px-[clamp(1rem,3vw,3rem)] py-16">
  <div className="w-full">{/* content */}</div>
</section>
```

Make backgrounds and gradients full-bleed: put them on the `<section>` itself, not on an inner centered box.

Grids should reflow instead of keeping fixed widths:

```tsx
className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
```

Test at 25%, 50%, 100%, 150% and 200% browser zoom, and at a phone width in DevTools. There should be no horizontal scrollbar and no empty vertical strips at the left or right.

## 3. Education: open the degree certificate

Link: https://drive.google.com/file/d/1YKQLBMngLP9Vu5k9QKMVyejNX9ne2DMI/view?usp=sharing

Make the Education card (B.Sc. Communication & Electronics Engineering, Benha University) clickable:

```tsx
<a
  href="https://drive.google.com/file/d/1YKQLBMngLP9Vu5k9QKMVyejNX9ne2DMI/view?usp=sharing"
  target="_blank"
  rel="noopener noreferrer"
  className="block rounded-lg border border-white/10 bg-white/5 p-5 transition hover:border-emerald-400/60"
  aria-label="Open graduation certificate"
>
  {/* existing education card content */}
  <ExternalLink className="h-4 w-4 float-right opacity-60" />
</a>
```

(`import { ExternalLink } from "lucide-react"`)

## 4. Certifications: each card opens its own link

Behavior: clicking a card opens that credential's link in a new tab. Cards with two links (AWS) show a small chooser. Cards without a link are not clickable.

### 4a. Data

Replace the `fileId` approach from the previous Edit.md with `links`:

```ts
export type CertLink = { label: string; url: string };

export type Cert = {
  title: string;
  issuer: string;
  badge: "PROGRAM" | "FOUNDATION" | "EXAM TRACK" | "SCHOLARSHIP" | "TRAINING" | "BOOTCAMP" | "COURSE" | "SELF-STUDY" | "BADGE";
  category: "Certificates & Programs" | "Specialized Training" | "Self-Study Paths";
  links?: CertLink[];
};

export const certs: Cert[] = [
  // ---- existing cards, now with links ----
  { title: "eLearnSecurity Certified Incident Responder (eCIR)", issuer: "Notriders Academy", badge: "PROGRAM", category: "Certificates & Programs",
    links: [{ label: "Certificate", url: "https://drive.google.com/file/d/1U3nc-dl__KVdkAw0PaqUIPF5vKrxSHwd/view?usp=drive_link" }] },

  { title: "Certified SOC Analyst Foundation", issuer: "SIEM XPERT", badge: "FOUNDATION", category: "Certificates & Programs",
    links: [{ label: "Certificate", url: "https://drive.google.com/file/d/1q3H_YCJveJDsXrD3EGm3w5sclJfrkxZN/view?usp=drive_link" }] },

  { title: "Cisco CyberOps", issuer: "National Telecommunication Institute (NTI)", badge: "EXAM TRACK", category: "Certificates & Programs",
    links: [{ label: "Certificate", url: "https://drive.google.com/file/d/16mzr0Lk03SLLSQ0HiTNbxEDPSj6NuuA4/view?usp=drive_link" }] },

  { title: "Blue Team Scholarship", issuer: "CyberTalents", badge: "SCHOLARSHIP", category: "Certificates & Programs",
    links: [{ label: "Certificate", url: "https://drive.google.com/file/d/1XDtfgNCP-kV3xGv7v02Rk-qcBfgqLhKE/view?usp=drive_link" }] },

  { title: "CCNP Security Core", issuer: "Notriders Academy", badge: "TRAINING", category: "Specialized Training",
    links: [{ label: "Certificate", url: "https://drive.google.com/file/d/1iEaCKJsy4R6mz3QLsaHioKnacQlvwk2d/view?usp=sharing" }] },
  // ^ ASSUMPTION: "[Network Security] Deploying Security Strategies for the Modern Network r04" is the CCNP Security Core certificate. Change the title if not.

  { title: "Red Hat System Administration I 9.0", issuer: "National Telecommunication Institute (NTI)", badge: "TRAINING", category: "Specialized Training",
    links: [{ label: "Certificate of Attendance (RH124-9.0)", url: "https://drive.google.com/file/d/1QVTkQjwiuQtyfk7D3yP2wrJJm5zTYHYG/view?usp=sharing" }] },

  { title: "AWS Academy Cloud Foundations", issuer: "National Telecommunication Institute (NTI)", badge: "TRAINING", category: "Specialized Training",
    links: [
      { label: "Certificate 1", url: "https://drive.google.com/file/d/1L5qaQ-5jqh2WHwfdx1BRQFdgTmUx0pyt/view?usp=sharing" },
      { label: "Certificate 2", url: "https://drive.google.com/file/d/1LFM7bOxht2R-7WVQeOsoydPG5IpV7FSb/view?usp=sharing" },
    ] },

  { title: "Introduction to Cybersecurity Bootcamp, Cohort 5", issuer: "CyberTalents", badge: "BOOTCAMP", category: "Specialized Training",
    links: [{ label: "Certificate", url: "https://drive.google.com/file/d/1NzhskWHd4Wzg7T-h1Fpe7dPVV4Xbvg_i/view?usp=drive_link" }] },

  { title: "Telecommunications and Network Infrastructure Training", issuer: "Systel Telecom", badge: "TRAINING", category: "Specialized Training",
    links: [{ label: "Certificate", url: "https://drive.google.com/file/d/11nTpb6ZLxbLoDsn22s7zrZOvjgnRJ_vo/view?usp=drive_link" }] },
  // Certificate text: Introduction to Telecommunications, Public Safety Communication, Microwave and Broadband Communication, Fiber Optics, CCTV, Practical Workshop.

  { title: "Python and Django Learning Guide", issuer: "Udemy", badge: "COURSE", category: "Specialized Training",
    links: [{ label: "Certificate", url: "https://drive.google.com/file/d/1zjSyNqXSZ-0-2d-u2HGU3gzBU_FDR7B3/view?usp=drive_link" }] },

  // ---- new cards ----
  { title: "RCNA Routing & Switching", issuer: "Ruijie", badge: "PROGRAM", category: "Certificates & Programs",
    links: [{ label: "Certificate", url: "https://drive.google.com/file/d/13qUudB4qcc1zqsOi3IRdZwo8PpN-u5eK/view?usp=sharing" }] },

  { title: "Sales Specialist: Kaspersky Next Optimum (S47.2)", issuer: "Kaspersky", badge: "PROGRAM", category: "Certificates & Programs",
    links: [{ label: "Certificate", url: "https://drive.google.com/file/d/1bYXSNl-WsSbDgFxuu3br72vQgtfU0uyh/view?usp=drive_link" }] },

  { title: "Fortinet NSE 1", issuer: "Fortinet", badge: "PROGRAM", category: "Certificates & Programs",
    links: [{ label: "Certificate", url: "https://drive.google.com/file/d/1Zu7S_-dQnHMSjr2NScvsbjc9_uuMpn7I/view?usp=drive_link" }] },

  { title: "Fortinet NSE 2", issuer: "Fortinet", badge: "PROGRAM", category: "Certificates & Programs",
    links: [{ label: "Certificate", url: "https://drive.google.com/file/d/1jlEzjSlGVRJN2dyuMWsMVSeIUxpMmn_p/view?usp=sharing" }] },

  { title: "Black Belt Support Stage 1 (Jun 2026)", issuer: "Mindtickle verification", badge: "BADGE", category: "Certificates & Programs",
    links: [{ label: "Verify credential", url: "https://verification.mindtickle.com/01-S0EJ8dDXTLOg6QEJ3wGMDg" }] },

  { title: "Cisco Black Belt Firewall Support Stage 2", issuer: "Cisco · Mindtickle verification", badge: "BADGE", category: "Certificates & Programs",
    links: [{ label: "Verify credential", url: "https://verification.mindtickle.com/01-bhe9EWWyTPCdkHAv1QysoQ" }] },

  // ---- existing cards with NO link yet (not clickable) ----
  { title: "CCNA Routing & Switching", issuer: "National Telecommunication Institute (NTI)", badge: "TRAINING", category: "Specialized Training" },
  { title: "MCSA Core", issuer: "Notriders Academy", badge: "TRAINING", category: "Specialized Training" },
  { title: "Palo Alto Firewall", issuer: "Self-study", badge: "SELF-STUDY", category: "Self-Study Paths" },
  { title: "Fortinet NSE 4", issuer: "Self-study", badge: "SELF-STUDY", category: "Self-Study Paths" },
  { title: "SANS SEC450: Blue Team Fundamentals", issuer: "Self-study", badge: "SELF-STUDY", category: "Self-Study Paths" },
  { title: "Windows Endpoint Investigation", issuer: "Self-study", badge: "SELF-STUDY", category: "Self-Study Paths" },
  { title: "CompTIA Security+", issuer: "Self-study", badge: "SELF-STUDY", category: "Self-Study Paths" },
];
```

Notes on the data:

- The links for NSE 1 and NSE 2 are new cards. If you meant them to replace the old NSE 4/5 card, remove `Fortinet NSE 4`, or keep it as shown.
- The Black Belt items are Mindtickle verification pages, not Drive files. They open fine in a new tab.
- Self-study items, CCNA R&S, MCSA Core and NSE 4 have no link yet. Add `links: [...]` to them later and they become clickable automatically.
- The "Certificates & Programs" and "Specialized Training" categories for the new cards are my guess. Move them as you prefer.
- Counts update by themselves. Do not hard-code "17" anywhere.

```tsx
const total = certs.length;
const countOf = (cat: string) => certs.filter(c => c.category === cat).length;
```

### 4b. Card component

```tsx
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const openTab = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

export function CertGrid({ certs }: { certs: Cert[] }) {
  const [multi, setMulti] = useState<Cert | null>(null);

  const onClick = (c: Cert) => {
    if (!c.links?.length) return;
    if (c.links.length === 1) return openTab(c.links[0].url);
    setMulti(c);                       // 2+ links: let the visitor choose
  };

  return (
    <>
      <div className="grid w-full gap-4 grid-cols-1 md:grid-cols-2">
        {certs.map((c) => {
          const clickable = !!c.links?.length;
          return (
            <button
              key={c.title}
              onClick={() => onClick(c)}
              disabled={!clickable}
              className="text-left w-full rounded-lg border border-white/10 bg-white/5 p-4 transition
                         hover:border-emerald-400/60 hover:bg-white/10
                         disabled:cursor-default disabled:hover:border-white/10 disabled:hover:bg-white/5"
              aria-label={clickable ? `Open ${c.title} certificate` : c.title}
            >
              {/* keep the existing badge / title / issuer markup here */}
              {clickable && <ExternalLink className="h-4 w-4 float-right opacity-60" />}
            </button>
          );
        })}
      </div>

      <Dialog open={!!multi} onOpenChange={() => setMulti(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{multi?.title}</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-2">
            {multi?.links?.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                 className="flex items-center justify-between rounded-md border border-white/10 px-4 py-3 hover:border-emerald-400/60">
                {l.label} <ExternalLink className="h-4 w-4" />
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

Remove the "View all certificates (Drive folder)" link and the iframe viewer from the previous Edit.md. Each card now goes to its own file only.

## 5. Contact: icons only

Remove the visible email, phone numbers, URLs and "Download CV (PDF)" text, along with the heading rows and the copy buttons. Show only icon buttons. The links stay in the `href`, and the label appears only as a tooltip and for screen readers.

```tsx
import { Mail, Phone, Linkedin, Github, FileText } from "lucide-react";

const contacts = [
  { label: "Email",             href: "mailto:moqurtam@gmail.com",                            icon: Mail },
  { label: "Phone (primary)",   href: "tel:+201024227004",                                    icon: Phone },
  { label: "Phone (alternate)", href: "tel:+201015220163",                                    icon: Phone },
  { label: "LinkedIn",          href: "https://linkedin.com/in/mohamed-qurtam-128296215",     icon: Linkedin, external: true },
  { label: "GitHub",            href: "https://github.com/Mohamed-Qurtam",                    icon: Github,   external: true },
  { label: "Resume (PDF)",      href: "/cv.pdf",                                              icon: FileText, download: true },
];
// Keep your existing CV file path if it is not /cv.pdf.

export function ContactIcons() {
  return (
    <ul className="flex w-full flex-wrap items-center gap-4">
      {contacts.map(({ label, href, icon: Icon, external, download }) => (
        <li key={label}>
          <a
            href={href}
            title={label}
            aria-label={label}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            {...(download ? { download: true } : {})}
            className="group grid h-14 w-14 place-items-center rounded-xl border border-white/10 bg-white/5
                       text-emerald-400 transition hover:-translate-y-0.5 hover:border-emerald-400/60
                       hover:bg-emerald-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
          >
            <Icon className="h-6 w-6" />
            <span className="sr-only">{label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
```

Keep the heading ("Contact", "Let's talk.") and the intro sentence. Make this component `w-full`, with no `max-w-*`, as in section 2.

---

## Checklist

- [ ] Status strip (Firewall / Encryption / Latency / SOC status) removed, with its CSS
- [ ] `tailwind.config.ts` container is fluid; no `max-w-*` on page sections or cards; `#root` reset done
- [ ] No horizontal scrollbar or side gaps at 25%, 50%, 100%, 150%, 200% zoom and on mobile
- [ ] Education card opens the degree certificate
- [ ] Each certificate card opens only its own link; AWS shows two choices
- [ ] New cards added: RCNA, Kaspersky S47.2, NSE 1, NSE 2, Black Belt Stage 1, Black Belt Stage 2
- [ ] `NSE 4/5` changed to `NSE 4`; counts computed (now 23)
- [ ] Contact shows icons only, with working `mailto:`, `tel:`, LinkedIn, GitHub and CV links
