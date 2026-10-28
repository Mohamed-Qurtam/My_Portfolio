# Portfolio Edits

Stack assumed: Lovable export (Vite + React + TypeScript + Tailwind). Apply in Antigravity IDE. Search the repo for the strings quoted below to find the right files (usually `Certifications.tsx` and `Contact.tsx`, or a data file such as `certifications.ts`).

---

## 1. Fix certificate names

| Where | Current | Change to |
|---|---|---|
| Self-Study card | `Fortinet NSE 4/5` | `Fortinet NSE 4` |

Also search the whole project (Hero, About, Expertise, Skills, CV PDF text, meta tags) for `NSE 4/5` and replace every occurrence with `NSE 4`.

## 2. Add a new certificate

- **Title:** `RCNA Routing & Switching`
- **Issuer:** `Ruijie`
- **Category:** `Certificates & Programs` (change to Specialized Training if that fits better)

After adding it, the section subtitle and the filter tabs must stay correct. Do not hard-code the numbers. Compute them:

```tsx
const total = certs.length;                          // "18 verified credentials"
const countOf = (cat: string) => certs.filter(c => c.category === cat).length;
```

Use `total` in the subtitle (it currently says "17 verified credentials") and `countOf(...)` in each tab label (`All Credentials (18)`, `Certificates & Programs (5)`, and so on).

## 3. Make every certificate open its file

Goal: clicking any certificate card opens a viewer with that certificate's PDF. A button also links to the full Drive folder.

Drive folder: https://drive.google.com/drive/folders/1GX8z-OzSTBz4-1ZntqY3ULHgM-6usP_d?usp=sharing

### 3a. Collect the file IDs (manual step)

A Drive folder link does not expose its file list to code, so each PDF needs its own ID.

1. Make sure the folder sharing is set to **Anyone with the link: Viewer**.
2. For each PDF: right-click, **Share**, **Copy link**. The link looks like `https://drive.google.com/file/d/FILE_ID/view`. Keep only `FILE_ID`.
3. Fill in the table (one row per credential, 18 in total):

| Credential | Drive FILE_ID |
|---|---|
| eLearnSecurity Certified Incident Responder (eCIR) | |
| Certified SOC Analyst Foundation | |
| Cisco CyberOps | |
| Blue Team Scholarship | |
| CCNP Security Core | |
| CCNA Routing & Switching | |
| Red Hat System Administration I 9.0 | |
| AWS Academy Cloud Foundations | |
| MCSA Core | |
| Introduction to Cybersecurity Bootcamp, Cohort 5 | |
| Telecommunications and Network Infrastructure Training | |
| Python and Django Learning Guide | |
| Palo Alto Firewall | |
| Fortinet NSE 4 | |
| SANS SEC450: Blue Team Fundamentals | |
| Windows Endpoint Investigation | |
| CompTIA Security+ | |
| RCNA Routing & Switching | |

Self-study items may have no PDF. Leave the ID empty for those and the card will simply not open a viewer (handled below).

### 3b. Data shape

Add `fileId` (and `driveFolderUrl` once) to the certificate data:

```ts
export const DRIVE_FOLDER_URL =
  "https://drive.google.com/drive/folders/1GX8z-OzSTBz4-1ZntqY3ULHgM-6usP_d?usp=sharing";

export type Cert = {
  title: string;
  issuer: string;
  badge: "PROGRAM" | "FOUNDATION" | "EXAM TRACK" | "SCHOLARSHIP" | "TRAINING" | "BOOTCAMP" | "COURSE" | "SELF-STUDY";
  category: "Certificates & Programs" | "Specialized Training" | "Self-Study Paths";
  fileId?: string;   // Google Drive file id
};
```

### 3c. Viewer modal

Uses the shadcn `Dialog` that Lovable projects already include.

```tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";

const preview = (id: string) => `https://drive.google.com/file/d/${id}/preview`;
const open    = (id: string) => `https://drive.google.com/file/d/${id}/view`;

export function CertGrid({ certs }: { certs: Cert[] }) {
  const [active, setActive] = useState<Cert | null>(null);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {certs.map((c) => (
          <button
            key={c.title}
            onClick={() => c.fileId && setActive(c)}
            disabled={!c.fileId}
            className="text-left rounded-lg border border-white/10 bg-white/5 p-4
                       transition hover:border-emerald-400/60 hover:bg-white/10
                       disabled:cursor-default disabled:hover:border-white/10"
            aria-label={c.fileId ? `Open ${c.title} certificate` : c.title}
          >
            {/* keep existing badge, title, issuer markup here */}
            {c.fileId && <ExternalLink className="h-4 w-4 float-right opacity-60" />}
          </button>
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={() => setActive(null)}>
        <DialogContent className="max-w-4xl w-[95vw] h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{active?.title}</DialogTitle>
          </DialogHeader>
          {active?.fileId && (
            <iframe
              src={preview(active.fileId)}
              title={active.title}
              className="flex-1 w-full rounded-md border-0"
              allow="autoplay"
            />
          )}
          {active?.fileId && (
            <a href={open(active.fileId)} target="_blank" rel="noopener noreferrer"
               className="text-sm text-emerald-400 hover:underline self-end">
              Open in new tab
            </a>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### 3d. "View all certificates" button

Place under the filter tabs:

```tsx
<a href={DRIVE_FOLDER_URL} target="_blank" rel="noopener noreferrer"
   className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:underline">
  <FolderOpen className="h-4 w-4" /> View all certificates (Google Drive)
</a>
```

(`import { FolderOpen } from "lucide-react"`)

### Notes

- If the iframe shows "You need access", the file is not shared as Anyone with the link.
- The embedded Drive viewer can be blocked on some browsers with strict tracking protection, so keep the "Open in new tab" link.
- Optional and more robust: download the PDFs into `public/certs/` and point the iframe at `/certs/<name>.pdf`. This avoids Drive permission and embedding problems.

---

## 4. Contact section: icon format

Replace the current emoji icons and plain-text rows with lucide icons. Each row becomes a clickable icon card, with a copy button for email and phone.

Install if missing: `npm i lucide-react`

```tsx
import { useState } from "react";
import { Mail, Phone, Linkedin, Github, FileText, Copy, Check } from "lucide-react";

const contacts = [
  { label: "Email",             value: "moqurtam@gmail.com",                    href: "mailto:moqurtam@gmail.com",                             icon: Mail,     copy: true },
  { label: "Phone (primary)",   value: "+20 1024227004",                        href: "tel:+201024227004",                                     icon: Phone,    copy: true },
  { label: "Phone (alternate)", value: "+20 1015220163",                        href: "tel:+201015220163",                                     icon: Phone,    copy: true },
  { label: "LinkedIn",          value: "linkedin.com/in/mohamed-qurtam-128296215", href: "https://linkedin.com/in/mohamed-qurtam-128296215",    icon: Linkedin, external: true },
  { label: "GitHub",            value: "github.com/Mohamed-Qurtam",             href: "https://github.com/Mohamed-Qurtam",                     icon: Github,   external: true },
  { label: "Resume",            value: "Download CV (PDF)",                     href: "/cv.pdf",                                               icon: FileText, download: true },
];
// Keep the existing CV path if it is not /cv.pdf.

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Copy ${text}`}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="p-2 rounded-md text-zinc-400 hover:text-emerald-400 hover:bg-white/5 transition"
    >
      {done ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

export function ContactList() {
  return (
    <ul className="rounded-xl border border-white/10 bg-white/[0.03] divide-y divide-white/10 overflow-hidden">
      {contacts.map(({ label, value, href, icon: Icon, copy, external, download }) => (
        <li key={label} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition">
          <span className="grid place-items-center h-10 w-10 shrink-0 rounded-lg bg-emerald-400/10 text-emerald-400">
            <Icon className="h-5 w-5" />
          </span>

          <a
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            {...(download ? { download: true } : {})}
            className="min-w-0 flex-1"
          >
            <span className="block text-xs uppercase tracking-wide text-zinc-400">{label}</span>
            <span className="block truncate font-mono text-sm text-emerald-400">{value}</span>
          </a>

          {copy && <CopyButton text={value.replace(/\s/g, "")} />}
        </li>
      ))}
    </ul>
  );
}
```

Optional, more compact variant: a row of round icon-only buttons (Mail, Phone, LinkedIn, GitHub, CV) above the list, each with a `title` tooltip, for a quick-contact bar.

---

## Checklist

- [ ] `NSE 4/5` replaced with `NSE 4` everywhere
- [ ] `RCNA Routing & Switching (Ruijie)` added; counts are computed, now 18
- [ ] Drive file IDs filled in; clicking a card opens its PDF
- [ ] "View all certificates" button links to the Drive folder
- [ ] Contact section uses lucide icons with working `mailto:`, `tel:` and copy buttons
- [ ] Test on mobile width and in light/dark mode
