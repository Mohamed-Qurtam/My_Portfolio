<!-- ============================================================
  PART 1 — COPY-READY PROFILE (paste into README.md / profile page)
  PART 2 — Responsive, motion, accessibility \& upgrade notes
  Replace the \[YOUR-...] placeholders with your real URLs.

<a id="top"></a>

<div align="center">

# Mohamed Qurtam

### Network \& Security Engineer

**Securing networks. Engineering resilient infrastructure.**

[Email](mailto:moqurtam@gmail.com) · [LinkedIn](https://www.linkedin.com/in/YOUR-LINKEDIN) · [GitHub](https://github.com/YOUR-GITHUB) · [Download CV](YOUR-CV-LINK.pdf)

[Summary](#summary) · [Experience](#experience) · [Skills](#skills) · [Education](#education) · [Projects](#projects) · [Certifications](#certifications) · [Contact](#contact)

</div>

\---

## Summary

Network \& Security Engineer working at the intersection of network infrastructure and defensive security. Communication \& Electronics Engineering graduate (Excellent with Honors) with hands-on experience in switches, routers, firewall configuration, SIEM monitoring and incident response. At Co-brand Solution, I design, deploy and secure enterprise infrastructure for clients across the MENA region. Beyond engineering, my work in cybersecurity content, technical session coordination and programming education shapes how I communicate complex ideas.

**Strengths:** Analytical thinking · Clear documentation · Knowledge sharing

[Back to top](#top)

\---

## Experience

### Network \& Security Engineer: Co-brand Solution

*Sep 2026 – Present*

Design, deploy and secure enterprise network and security infrastructure for clients across the MENA region, including firewalls, switching, Wi-Fi and SD-WAN. Monitor and troubleshoot to meet SLAs, run security hardening and vulnerability assessments, and document solutions for client handover.

### Programming Tutor (DEMI): iSchool

*2026*

Delivered programming lessons, guided students through coding projects and problem-solving activities, and helped them build logical thinking and fundamental programming skills.

### IT Specialist: Information Systems Department, Egyptian Military Academy

*2025 – 2026*

Performed maintenance and repairs for computers, monitors and printers. Managed account administration and installed firmware, updates and system images for PCs.

### Content Creator, Cybersecurity Track: Armstrong

*2024*

Created 20+ educational modules simplifying cybersecurity concepts and boosted learner engagement through structured content.

### Session Coordinator: Almentor

*2023 – 2025*

Managed 100+ technical sessions with high participant satisfaction and reduced session issues through refined coordination workflows.

[Back to top](#top)

\---

## Skills

|Area|Tools \& topics|
|-|-|
|**Network \& firewall engineering**|Palo Alto, FortiGate, IDS/IPS, firewall policies, network segmentation, traffic analysis, CCNA routing \& switching|
|**Blue Team \& SOC**|Incident response, threat detection, log analysis, security monitoring, SOC metrics, playbooks, malware analysis, digital forensics|
|**Network \& Security tools**|Splunk (SIEM), Wireshark, Nmap, Metasploit|
|**Systems \& cloud**|Linux, Windows, AWS architecture, AWS core services, cloud security basics|
|**Programming**|Python, Bash, C/C++, HTML, CSS, JavaScript, backend concepts|

[Back to top](#top)

\---

## Education

**B.Sc. Communication \& Electronics Engineering**
Benha University · June 2024 · *Excellent with Honors*

An engineering foundation in communication, electronics and technical problem-solving.

[Back to top](#top)

\---

## Projects

### Network Security Architecture (Graduation Project)

A secure network built with Palo Alto firewalls, designed for scalability, performance and layered protection.

* **Zone-based segmentation:** virtual routers and multiple security zones establish the network architecture.
* **Application-aware policies:** NAT policies and application-based security rules control network traffic.
* **Performance \& protection:** QoS policies and DoS protection support a secure, scalable network.

[Read the project book](YOUR-PROJECT-BOOK-LINK)

### Beyond the Firewall

* **Python \& web development:** signal analysis, game development, and web applications using HTML, CSS, JavaScript and backend concepts.
* **Networks \& embedded systems:** technical projects involving networking, embedded systems and automation.

[Back to top](#top)

\---

## Certifications

* Deploying Security Strategies for the Modern Network
* RCNA Routing \& Switching
* Sales Specialist: Kaspersky Next Optimum (S47.2)
* Blue Team Scholarship, CyberTalents
* SOC Analyst Foundation, SIEM XPERT
* AWS Academy Cloud Foundations, NTI
* Red Hat System Administration I (9.0), NTI
* Python and Django learning guide, Udemy
* eLearnSecurity Certified Incident Responder (eCIR), Netriders Academy
* Cisco CyberOps, National Telecommunication Institute (NTI)
* Introduction to Cybersecurity Bootcamp (Cohort 5), CyberTalents

[Back to top](#top)

\---

## Contact

For professional opportunities and conversations about network and security engineering:

* Email: [moqurtam@gmail.com](mailto:moqurtam@gmail.com)
* Phone: +20 1024227004 · +20 1015220163
* [LinkedIn](https://www.linkedin.com/in/YOUR-LINKEDIN) · [GitHub](https://github.com/YOUR-GITHUB)

[Back to top](#top)

\---

\---

# PART 2 — Notes (delete this part before publishing)

## 1\. Responsive guidance for Markdown

* **Keep tables narrow.** The Skills table has two columns, so it stays readable on phones. Avoid 4+ column tables; use bullet lists instead.
* **Use headings in a clean hierarchy** (one `#`, then `##` sections, `###` entries). GitHub, GitLab and most static-site renderers build a mobile-friendly outline from them.
* **Prefer percentage widths for images**, never fixed pixels: `<img src="..." width="100%" alt="...">`.
* **Dark/light mode images** (GitHub supports this):

```html
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="banner-dark.png">
    <img src="banner-light.png" alt="Mohamed Qurtam, Network \& Security Engineer" width="100%">
  </picture>
  ```

* **Short lines of text.** Long paragraphs wrap fine, but keep each experience entry to 1–3 lines.

## 2\. Motion ideas (what actually works in Markdown)

Markdown itself cannot run CSS or JavaScript, and GitHub strips both. Motion has to come from assets:

|Idea|How|Caveat|
|-|-|-|
|Animated banner|Animated SVG or GIF at the top|Keep under \~1 MB; add a static fallback|
|Typing tagline|Hosted "typing SVG" services|Depends on a third-party service staying online|
|Network-diagram animation|Short looping GIF or animated SVG of the Palo Alto zone diagram|Label it "illustrative", as on your site|
|Section reveal / hover effects|Only possible once rendered as a webpage (see section 4)|Not available on GitHub|

Keep motion subtle: one animated element at the top is enough.

## 3\. Accessibility tips

* **Alt text:** describe the content, not "image". Example: `alt="Network diagram: external network passes through a Palo Alto firewall into three segmented security zones"`.
* **Contrast:** aim for at least 4.5:1 for body text. Your site's grey-on-black body text is quite dim; consider lightening it.
* **Link text:** use descriptive text ("Read the project book"), not "click here".
* **Don't rely on emoji or colour alone** to carry meaning.
* **Motion:** avoid flashing; keep animated GIFs short and non-essential, since Markdown can't honour `prefers-reduced-motion`.
* **Headings in order:** never skip levels (`#` → `###`).

## 4\. Upgrade path to a webpage

Your portfolio site already exists (it has Selected Work, Expertise, Experience, About and Contact sections), so treat this file as the **single source of truth for content**.

1. **Anchors:** the `#summary`, `#experience`, `#skills`... links above map 1:1 to the site's nav items. Add `id` attributes with the same names.
2. **Content sync:** keep the wording identical between this file and the site so edits only happen once.
3. **Minimal CSS plan:**

```css
   :root { color-scheme: dark light; }
   body { max-width: 72ch; margin: auto; padding: 1rem; line-height: 1.6; }
   img { max-width: 100%; height: auto; }
   section { scroll-margin-top: 4rem; }
   @media (prefers-reduced-motion: no-preference) {
     .reveal { animation: fade-up .6s ease both; }
   }
   @keyframes fade-up { from { opacity: 0; transform: translateY(12px); } }
   ```

4. **Minimal JS plan:** one `IntersectionObserver` that adds the `.reveal` class when a section scrolls into view (about 10 lines), plus highlighting the active nav link.
5. **Before launch:** check Lighthouse accessibility score, add a meta description and Open Graph image, and test on a phone-width viewport.

