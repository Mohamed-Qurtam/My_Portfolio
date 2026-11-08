/*!
 * edit.js v2: portfolio upgrade (vanilla JS, no dependencies; CSS is injected by this file)
 *
 * Fixes & features:
 *   1. Nav scrolling: lands exactly on the chosen section (fixed-header offset, layout-shift
 *      correction) and the highlighted menu item always matches the section you are viewing.
 *   2. Responsive for every screen: mobile hamburger menu, fluid type, auto-stacking of side-by-side
 *      layouts on small screens, no horizontal overflow.
 *   3. LinkedIn / GitHub links point to the right profiles (hero + Contact card).
 *   4. About heading + text replaced; "Open to new opportunities" badge removed.
 *   5. Dark (default) / light theme toggle button with sun/moon icons, remembered between visits.
 *   6. Motion: role-title typing after load, scroll reveals, scroll-progress bar, hero aurora,
 *      floating + tilting photo, scrolling tools strip marquee, animated nav underline, card hovers.
 *   7. "Kaspersky EDR" tag added after "Splunk" in hero strip and Skills table.
 *
 * Creative Additions:
 *   8. Interactive Palo Alto NGFW Topology Telemetry Console (inspect Trust, DMZ, Untrust & Policies).
 *   9. Smooth animated stat counters for "AT A GLANCE" numbers on scroll.
 *  10. Interactive project category filter tabs with smooth transitions.
 *  11. One-click copy-to-clipboard with security toast alert for contact details.
 *  12. Click-to-replay capability on the role title.
 *
 * Install (in <head> WITHOUT defer so saved theme applies before first paint):
 *   <script src="edit.js"></script>
 */
(function () {
  'use strict';
  if (window.__qtEdit2) return;
  window.__qtEdit2 = true;

  /* ------------------------------------------------------------------ *
   * CONFIG
   * ------------------------------------------------------------------ */
  const CONFIG = {
    // Content
    linkedin: 'https://www.linkedin.com/in/mohamed-qurtam',
    github: 'https://github.com/Mohamed-Qurtam',
    aboutHeading: 'Networks. Security.',
    aboutText:
      "I'm a Network & Security Engineer, Communication & Electronics Engineering graduate " +
      '(Excellent with Honors) with hands-on experience in switches, routers, firewall ' +
      'configuration, SIEM monitoring and incident response. Beyond engineering, my work in ' +
      'cybersecurity content, technical session coordination and programming education shapes ' +
      'how I communicate complex ideas.',
    hideBadge: /open to new opportunities/i,

    // Role title (revealed only after the page has fully loaded)
    roleText: 'Network & Security Engineer',
    roleSelector: '[data-role-title]',
    rolePattern: /^network\s*&\s*security\s+engineer$/i,
    typeSpeedMs: 55,
    revealDelayMs: 120,
    addCursor: true,                       // set false if you see two cursors

    // Tools list
    newTool: 'Kaspersky EDR',
    toolAnchor: /^splunk/i,                // inserted right after this tag

    // Navigation
    navLabels: ['about', 'experience', 'skills', 'education', 'projects', 'certifications', 'contact'],
    scrollGapPx: 24,                       // space between header and section content after a jump
    spyRatio: 0.45,                        // a section is "current" once its content passes 45% of the viewport
    takeOverNav: true,                     // rebuild nav links so the site's own highlight is accurate
    mobileMenu: true,                      // hamburger menu on small screens
    mobileBreakpoint: 860,
    stackBreakpoint: 760,                  // side-by-side blocks stack below this width

    // Theme
    defaultTheme: 'dark',
    themeStorageKey: 'qt-theme',

    // Motion switches
    motion: { reveal: true, progress: true, aurora: true, photo: true, tilt: true, cards: true, marquee: true },
    marqueeDurationS: 40,
    stripSelector: '[data-tools-strip]',
    photoSelector: '[data-hero-photo]',

    // Creative Features
    interactiveTelemetry: true,
    statCounters: true,
    projectFilters: true,
    clipboardToast: true,

    observeForMs: 10000                    // keep watching the DOM this long after load
  };

  const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const S = {
    loaded: false, inited: false, role: null, revealed: false, header: null, cta: null,
    nav: null, tools: null, burger: null, menuEl: null, lock: null, token: 0, active: null,
    marquee: false, cards: false, revealSet: false, heroDone: false, about: false, badge: false,
    resp: false, fallback: {}, countersDone: false
  };

  /* ------------------------------------------------------------------ *
   * CSS (Blueprint values from Edit.md + Creative Features)
   * ------------------------------------------------------------------ */
  const CSS = `
:root{--qt-accent:var(--accent,#4dbb8a);--qt-header-h:76px;--qt-bg:#0d0f12;--qt-fg:#f2f0ed}
html{scroll-behavior:smooth;scroll-padding-top:calc(var(--qt-header-h) + 16px);-webkit-text-size-adjust:100%}
section[id]{scroll-margin-top:calc(var(--qt-header-h) + 16px)}
html,body{overflow-x:clip;max-width:100%}
img,video{max-width:100%;height:auto}
::selection{background:rgba(77,187,138,.35)}
:focus-visible{outline:2px solid var(--qt-accent);outline-offset:3px}
.qt-sr-only{position:absolute!important;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}

/* ---------- light theme: clean transition ---------- */
html, body, section, header {
  transition: background-color .35s ease, border-color .35s ease, color .35s ease;
}
::view-transition-old(root),::view-transition-new(root){animation-duration:.45s}

/* ---------- header ---------- */
.qt-header{-webkit-backdrop-filter:saturate(1.4) blur(14px);backdrop-filter:saturate(1.4) blur(14px);
  background-color:color-mix(in srgb,var(--qt-bg) 78%,transparent)!important;transition:box-shadow .3s ease}
.qt-header.qt-scrolled{box-shadow:0 10px 30px -12px rgba(0,0,0,.55)}
.qt-navlink{position:relative;transition:color .25s ease}
.qt-navlink::after{content:"";position:absolute;left:0;right:0;bottom:-7px;height:2px;border-radius:2px;
  background:var(--qt-accent);transform:scaleX(0);transform-origin:left;transition:transform .35s cubic-bezier(.2,.7,.2,1)}
.qt-navlink:hover::after,.qt-navlink.qt-active::after{transform:scaleX(1)}
.qt-navlink.qt-active{color:var(--qt-fg)!important}
.qt-tools{display:flex;align-items:center;gap:8px;margin-left:auto}
.qt-tools.qt-floating{position:fixed;right:16px;bottom:16px;z-index:9998}
.qt-iconbtn{width:40px;height:40px;display:inline-grid;place-items:center;border:1px solid rgba(127,127,127,.35);
  border-radius:10px;background:transparent;color:inherit;cursor:pointer;padding:0;
  transition:border-color .25s,transform .25s,background .25s}
.qt-iconbtn:hover{border-color:var(--qt-accent);transform:translateY(-2px);background:rgba(77,187,138,.1)}
.qt-theme svg{grid-area:1/1;width:20px;height:20px;transition:transform .55s cubic-bezier(.2,.7,.2,1),opacity .3s}
.qt-theme .qt-moon{opacity:0;transform:rotate(90deg) scale(.4)}
html[data-theme="light"] .qt-theme .qt-moon{opacity:1;transform:none}
html[data-theme="light"] .qt-theme .qt-sun{opacity:0;transform:rotate(-90deg) scale(.4)}
.qt-burger{display:none;flex-direction:column;gap:5px;justify-content:center;align-items:center}
.qt-burger span{display:block;width:18px;height:2px;background:currentColor;border-radius:2px;transition:transform .35s ease,opacity .25s}
.qt-burger[aria-expanded="true"] span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.qt-burger[aria-expanded="true"] span:nth-child(2){opacity:0}
.qt-burger[aria-expanded="true"] span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.qt-menu{position:fixed;left:0;right:0;top:var(--qt-header-h);z-index:60;padding:10px 20px 22px;display:grid;gap:2px;
  background:color-mix(in srgb,var(--qt-bg) 96%,transparent);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);
  border-bottom:1px solid rgba(127,127,127,.25);transform:translateY(-12px);opacity:0;visibility:hidden;
  transition:transform .35s cubic-bezier(.2,.7,.2,1),opacity .3s,visibility 0s linear .35s}
.qt-menu.qt-open{transform:none;opacity:1;visibility:visible;transition-delay:0s}
.qt-menu a{padding:13px 8px;color:var(--qt-fg);text-decoration:none;font:inherit;border-bottom:1px solid rgba(127,127,127,.16)}
.qt-menu a.qt-active{color:var(--qt-accent)}
.qt-menu a.qt-menu__cta{margin-top:10px;text-align:center;border:1px solid var(--qt-accent);border-radius:10px;color:var(--qt-accent)}

/* ---------- progress bar ---------- */
.qt-progress{position:fixed;top:0;left:0;right:0;height:3px;z-index:9999;transform-origin:0 50%;transform:scaleX(0);
  background:linear-gradient(90deg,var(--qt-accent),#7be3b8);pointer-events:none}

/* ---------- hero: aurora + floating photo ---------- */
.qt-hero{position:relative;isolation:isolate;overflow:hidden}
.qt-aurora{position:absolute;inset:0;z-index:-1;pointer-events:none;overflow:hidden}
.qt-aurora i{position:absolute;border-radius:50%;filter:blur(70px);opacity:.28;will-change:transform}
.qt-aurora i:nth-child(1){width:42vmax;height:42vmax;left:-10vmax;top:-12vmax;
  background:radial-gradient(circle,#4dbb8a,transparent 70%);animation:qt-drift-a 22s ease-in-out infinite alternate}
.qt-aurora i:nth-child(2){width:36vmax;height:36vmax;right:-8vmax;bottom:-14vmax;
  background:radial-gradient(circle,#2f7df0,transparent 70%);animation:qt-drift-b 28s ease-in-out infinite alternate}
.qt-aurora::after{content:"";position:absolute;inset:0;background-size:48px 48px;
  background-image:linear-gradient(rgba(127,127,127,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(127,127,127,.08) 1px,transparent 1px);
  -webkit-mask-image:radial-gradient(ellipse at 50% 40%,#000 20%,transparent 75%);mask-image:radial-gradient(ellipse at 50% 40%,#000 20%,transparent 75%)}
@keyframes qt-drift-a{to{transform:translate3d(8vmax,6vmax,0) scale(1.15)}}
@keyframes qt-drift-b{to{transform:translate3d(-7vmax,-5vmax,0) scale(1.1)}}
.qt-photo{position:relative;isolation:isolate;animation:qt-float 6s ease-in-out infinite;will-change:transform}
.qt-photo::before{content:"";position:absolute;inset:-6%;z-index:-1;border-radius:40%;
  background:radial-gradient(closest-side,rgba(77,187,138,.34),transparent);animation:qt-breathe 5s ease-in-out infinite}
.qt-photo img{transition:transform .25s ease-out;will-change:transform}
@keyframes qt-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes qt-breathe{0%,100%{opacity:.45;transform:scale(.96)}50%{opacity:1;transform:scale(1.06)}}

/* ---------- role cursor ---------- */
.qt-cursor{display:inline-block;margin-left:.15em;color:var(--qt-accent);animation:qt-blink 1.1s steps(1,end) infinite}
@keyframes qt-blink{0%,49%{opacity:1}50%,100%{opacity:0}}

/* ---------- tools strip (endless scroll) ---------- */
.qt-marquee{overflow:hidden;display:block!important;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);
  mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.qt-marquee__track{display:flex;width:max-content;animation:qt-marquee var(--qt-marquee-duration,40s) linear infinite}
.qt-marquee:hover .qt-marquee__track,.qt-marquee:focus-within .qt-marquee__track{animation-play-state:paused}
.qt-marquee__group{display:flex;flex-shrink:0;align-items:center;justify-content:space-around;gap:12px;padding-right:12px;min-width:100vw}
.qt-marquee__group>*{transition:transform .25s ease,border-color .25s ease}
.qt-marquee__group>*:hover{transform:translateY(-3px);border-color:var(--qt-accent)}
@keyframes qt-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* ---------- scroll reveal + card hover ---------- */
.qt-reveal{opacity:0;transform:translate3d(0,26px,0);
  transition:opacity .75s cubic-bezier(.2,.7,.2,1) calc(var(--qt-i,0)*70ms),transform .75s cubic-bezier(.2,.7,.2,1) calc(var(--qt-i,0)*70ms)}
.qt-reveal.qt-in{opacity:1;transform:none}
.qt-card{transition:transform .3s cubic-bezier(.2,.7,.2,1),border-color .3s ease,box-shadow .3s ease}
.qt-card:hover{transform:translateY(-4px);border-color:var(--qt-accent)!important;box-shadow:0 14px 34px -14px rgba(77,187,138,.4)}

/* ---------- responsive ---------- */
@media (max-width:${CONFIG.mobileBreakpoint}px){
  .qt-burger{display:inline-flex}
  .qt-nav,.qt-cta{display:none!important}
}
@media (min-width:${CONFIG.mobileBreakpoint + 1}px){.qt-menu{display:none}}
@media (max-width:900px){
  h1{font-size:clamp(2rem,9vw,3.4rem)!important;line-height:1.08!important}
  section[id]{padding-top:4.5rem!important;padding-bottom:4.5rem!important}
}
@media (max-width:${CONFIG.stackBreakpoint}px){
  [data-qt-stack]{flex-direction:column!important;grid-template-columns:minmax(0,1fr)!important;align-items:stretch!important}
  [data-qt-stack]>*{width:auto!important;max-width:100%!important}
  [data-qt-stack] img{max-width:min(100%,360px);margin-inline:auto}
  .qt-aurora i:nth-child(2){display:none}
  table{display:block;overflow-x:auto}
}

/* ---------- creative interactive additions ---------- */
.topology-telemetry {
  background: var(--bg-tertiary, #1c2126);
  border: 1px solid var(--border-accent, rgba(77, 187, 138, 0.3));
  border-left: 3px solid var(--qt-accent, #4dbb8a);
  border-radius: 6px;
  padding: 12px 18px;
  margin-top: 16px;
  font-family: var(--font-mono, monospace);
  font-size: 0.78rem;
  line-height: 1.5;
  color: var(--text-secondary, #b6bfc9);
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  transition: all 0.25s ease;
}
.topology-telemetry.active {
  border-color: var(--qt-accent, #4dbb8a);
  box-shadow: 0 0 20px rgba(77, 187, 138, 0.2);
}
.telemetry-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--qt-accent, #4dbb8a);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.telemetry-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--qt-accent, #4dbb8a);
  display: inline-block;
  animation: qt-blink 1.5s infinite;
}
.telemetry-body {
  color: var(--text-primary, #f0ede8);
}
.topology-interactive-node {
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
}
.topology-interactive-node:hover rect,
.topology-interactive-node.active rect {
  stroke: var(--qt-accent, #4dbb8a) !important;
  stroke-width: 2px !important;
  filter: drop-shadow(0 0 8px rgba(77, 187, 138, 0.5));
}

.project-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}
.project-filter-btn {
  font-family: var(--font-mono, monospace);
  font-size: 0.76rem;
  background: var(--bg-secondary, #161a1d);
  color: var(--text-secondary, #b6bfc9);
  border: 1px solid var(--border-primary, #2a3038);
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.project-filter-btn:hover,
.project-filter-btn.active {
  background: rgba(77, 187, 138, 0.15);
  border-color: var(--qt-accent, #4dbb8a);
  color: #fff;
}

.qt-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #1c2126;
  color: #f0ede8;
  border: 1px solid var(--border-accent, rgba(77, 187, 138, 0.4));
  border-left: 4px solid var(--qt-accent, #4dbb8a);
  padding: 12px 20px;
  border-radius: 6px;
  font-family: var(--font-mono, monospace);
  font-size: 0.82rem;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
  z-index: 9999;
  transform: translateY(40px);
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  gap: 10px;
}
.qt-toast.visible {
  transform: translateY(0);
  opacity: 1;
}

@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  .qt-cursor,.qt-photo,.qt-photo::before,.qt-marquee__track,.qt-aurora i{animation:none!important}
  .qt-reveal{opacity:1!important;transform:none!important;transition:none!important}
}`;

  function injectCSS() {
    const style = document.createElement('style');
    style.setAttribute('data-qt-style', '');
    style.textContent = CSS;
    document.head.appendChild(style);
    if (!document.querySelector('meta[name="viewport"]')) {
      const m = document.createElement('meta');
      m.name = 'viewport';
      m.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
      document.head.appendChild(m);
    }
  }

  /* ------------------------------------------------------------------ *
   * Helpers
   * ------------------------------------------------------------------ */
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const rafThrottle = (fn) => { let q = false; return () => { if (q) return; q = true; requestAnimationFrame(() => { q = false; fn(); }); }; };

  function ownText(el) {
    let s = '';
    el.childNodes.forEach((n) => { if (n.nodeType === 3) s += n.nodeValue; });
    return norm(s);
  }

  function retext(root, text) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let done = false, n;
    while ((n = w.nextNode())) {
      if (!norm(n.nodeValue)) continue;
      if (!done) { n.nodeValue = text; done = true; } else { n.nodeValue = ''; }
    }
    if (!done) root.appendChild(document.createTextNode(text));
  }

  function showToast(message) {
    let toast = document.getElementById('qt-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'qt-toast';
      toast.className = 'qt-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span style="color:var(--qt-accent,#4dbb8a);">🛡️</span> ${message}`;
    toast.classList.add('visible');
    clearTimeout(toast.__timer);
    toast.__timer = setTimeout(() => toast.classList.remove('visible'), 2600);
  }

  /* ------------------------------------------------------------------ *
   * Theme (dark default, remembered)
   * ------------------------------------------------------------------ */
  function savedTheme() {
    try {
      const v = localStorage.getItem(CONFIG.themeStorageKey);
      if (v === 'light' || v === 'dark') return v;
    } catch (e) { /* storage blocked */ }
    return CONFIG.defaultTheme;
  }

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    document.querySelectorAll('.qt-theme').forEach((b) => {
      const label = t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      b.setAttribute('aria-label', label);
      b.setAttribute('title', label);
      b.setAttribute('aria-pressed', String(t === 'light'));
    });
    if (document.head) {
      let m = document.querySelector('meta[name="theme-color"]');
      if (!m) { m = document.createElement('meta'); m.name = 'theme-color'; document.head.appendChild(m); }
      m.content = t === 'dark' ? '#0d0f12' : '#f2f0ed';
    }
  }

  function toggleTheme() {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    const run = () => {
      applyTheme(next);
      try { localStorage.setItem(CONFIG.themeStorageKey, next); } catch (e) { /* ignore */ }
    };
    if (document.startViewTransition && !reduceMotion) document.startViewTransition(run); // smooth cross-fade
    else run();
  }

  const SUN = '<svg class="qt-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const MOON = '<svg class="qt-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  /* ------------------------------------------------------------------ *
   * Content edits: badge, About, links, Kaspersky EDR
   * ------------------------------------------------------------------ */
  function hideBadge() {
    if (S.badge) return;
    for (const el of document.querySelectorAll('span,div,p,a')) {
      if (!CONFIG.hideBadge.test(ownText(el))) continue;
      let pill = el;
      const p = el.parentElement;
      if (p && p !== document.body && norm(p.textContent) === norm(el.textContent)) pill = p; // dot + label wrapper
      pill.style.setProperty('display', 'none', 'important');
      pill.setAttribute('aria-hidden', 'true');
      pill.setAttribute('data-qt-hidden', 'badge');
      S.badge = true;
      return;
    }
  }

  function editAbout() {
    if (S.about) return;
    const sec = getTarget('about');
    if (!sec) return;
    const h = Array.from(sec.querySelectorAll('h1,h2,h3')).find((e) => /^networks\./i.test(norm(e.textContent)));
    const p = Array.from(sec.querySelectorAll('p')).find(
      (e) => /hands-on experience/i.test(e.textContent) && /(switches|firewall)/i.test(e.textContent)
    );
    if (h && norm(h.textContent) !== CONFIG.aboutHeading) h.textContent = CONFIG.aboutHeading;
    if (p && norm(p.textContent) !== norm(CONFIG.aboutText)) p.textContent = CONFIG.aboutText;
    if (h && p) S.about = true;
  }

  function openUrl(url) { window.open(url, '_blank', 'noopener,noreferrer'); }

  function fixLinks() {
    document.querySelectorAll('a').forEach((a) => {
      const t = norm(a.textContent + ' ' + (a.getAttribute('aria-label') || '')).toLowerCase();
      const h = a.getAttribute('href') || '';
      let url = null;
      if (/linkedin/.test(t) || /linkedin\.com/i.test(h)) url = CONFIG.linkedin;
      else if (/github/.test(t) || /github\.com/i.test(h)) url = CONFIG.github;
      if (!url) return;
      if (h !== url) a.setAttribute('href', url);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    });

    // Contact cards that are plain <div>s (not links): make the whole card open the right page
    [[/linkedin\.com\/in\//i, CONFIG.linkedin], [/github\.com\//i, CONFIG.github]].forEach(([re, url]) => {
      document.querySelectorAll('p,span,div,td').forEach((el) => {
        if (el.closest('a') || el.closest('[data-qt-link]') || !re.test(ownText(el))) return;
        let card = el;
        for (let i = 0; i < 3; i++) {
          const par = card.parentElement;
          if (!par || par.children.length > 3 || par.querySelector('a') || norm(par.textContent).length >= 140) break;
          card = par;
        }
        if (card.querySelector('a') || card.closest('a')) return;
        card.setAttribute('data-qt-link', '1');
        card.setAttribute('role', 'link');
        card.setAttribute('tabindex', '0');
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => openUrl(url));
        card.addEventListener('keydown', (e) => { if (e.key === 'Enter') openUrl(url); });
      });
    });
  }

  function addTool() {
    const wanted = CONFIG.newTool.toLowerCase();
    document.querySelectorAll('span,li,a,button,div,code,p').forEach((el) => {
      if (el.closest('[data-qt-clone]')) return;
      const t = ownText(el);
      if (!t || t.length > 30 || !CONFIG.toolAnchor.test(t)) return;
      let unit = el, depth = 0;
      while (unit.parentElement && unit.parentElement.children.length < 3 && depth < 3) { unit = unit.parentElement; depth += 1; }
      const list = unit.parentElement;
      if (!list) return;
      if (Array.from(list.children).some((c) => norm(c.textContent).toLowerCase() === wanted)) return;
      const clone = unit.cloneNode(true);
      retext(clone, CONFIG.newTool);
      clone.setAttribute('data-qt-tool', 'added');
      unit.insertAdjacentElement('afterend', clone);
    });
  }

  /* ------------------------------------------------------------------ *
   * Role title: empty before first paint, typed in after the page has loaded
   * ------------------------------------------------------------------ */
  function prepareRole() {
    if (S.role) return;
    let el = document.querySelector(CONFIG.roleSelector);
    if (!el) {
      for (const c of document.querySelectorAll('h1,h2,h3,h4,p,span,div')) {
        if (c.closest('nav,footer,[data-qt-role]')) continue;
        if (CONFIG.rolePattern.test(ownText(c).replace(/\|$/, '').trim())) { el = c; break; }
      }
    }
    if (!el) return;
    el.style.minHeight = el.offsetHeight ? el.offsetHeight + 'px' : '';
    const next = el.nextElementSibling;
    const siblingCursor = next && (/cursor|caret|blink/i.test(next.className || '') || ownText(next) === '|');
    const after = window.getComputedStyle(el, '::after').content;
    const pseudoCursor = after && after !== 'none' && after !== 'normal';
    S.role = { el, addCursor: CONFIG.addCursor && !siblingCursor && !pseudoCursor };
    el.setAttribute('data-qt-role', 'pending');
    el.title = 'Click to replay typing reveal';
    el.textContent = '';

    el.addEventListener('click', () => {
      replayRole();
    });

    if (S.loaded) revealRole();
  }

  function revealRole(customText) {
    if (S.revealed || !S.role) return;
    S.revealed = true;
    const { el, addCursor } = S.role;
    const text = customText || CONFIG.roleText;
    el.innerHTML = '';
    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    const sr = document.createElement('span');
    sr.className = 'qt-sr-only';
    sr.setAttribute('role', 'status');
    sr.setAttribute('aria-live', 'polite');
    el.appendChild(visual);
    el.appendChild(sr);
    if (addCursor) {
      const c = document.createElement('span');
      c.className = 'qt-cursor';
      c.setAttribute('aria-hidden', 'true');
      c.textContent = '|';
      el.appendChild(c);
    }
    const finish = () => {
      visual.textContent = text;
      sr.textContent = text;
      el.setAttribute('data-qt-role', 'done');
      el.style.minHeight = '';
    };
    if (reduceMotion || !CONFIG.typeSpeedMs) { finish(); return; }
    let i = 0;
    (function tick() {
      i += 1;
      visual.textContent = text.slice(0, i);
      if (i < text.length) setTimeout(tick, CONFIG.typeSpeedMs); else finish();
    })();
  }

  function replayRole() {
    if (!S.role) return;
    S.revealed = false;
    revealRole();
  }

  /* ------------------------------------------------------------------ *
   * Navigation: exact scrolling + reliable highlight
   * ------------------------------------------------------------------ */
  function getTarget(id) {
    const direct = document.getElementById(id);
    if (direct) return direct;
    const cached = S.fallback[id];
    if (cached && cached.isConnected) return cached;
    for (const h of document.querySelectorAll('h1,h2,h3')) {
      if (norm(h.textContent).toLowerCase() === id) {
        const sec = h.closest('section') || h.parentElement;
        if (sec && !sec.id) sec.id = id;
        S.fallback[id] = sec;
        return sec;
      }
    }
    return null;
  }

  const headerH = () => (S.header ? S.header.getBoundingClientRect().height : 76);
  const padTop = (el) => parseFloat(getComputedStyle(el).paddingTop) || 0;

  function targetY(t) {
    return t.getBoundingClientRect().top + window.scrollY + padTop(t) - headerH() - CONFIG.scrollGapPx;
  }

  function smoothTo(getY) {
    const fn = typeof getY === 'function' ? getY : () => getY;
    const maxY = () => document.documentElement.scrollHeight - window.innerHeight;
    const clamp = (y) => Math.max(0, Math.min(y, maxY()));
    const token = ++S.token;
    let tries = 0, last = -1, still = 0;
    window.scrollTo({ top: clamp(fn()), behavior: reduceMotion ? 'auto' : 'smooth' });
    (function poll() {
      requestAnimationFrame(() => {
        if (token !== S.token) return; // user took over
        const cur = window.scrollY;
        still = Math.abs(cur - last) < 0.5 ? still + 1 : 0;
        last = cur;
        if (still >= 8) {
          const want = clamp(fn());
          if (Math.abs(cur - want) > 3 && tries < 3) {
            tries += 1; still = 0;
            window.scrollTo({ top: want, behavior: 'instant' });
          } else { S.lock = null; updateSpy(); return; }
        }
        poll();
      });
    })();
  }

  function goTo(id) {
    const t = getTarget(id);
    if (!t) return;
    S.lock = id;
    setActive(id);
    smoothTo(() => targetY(t));
    try { history.replaceState(null, '', '#' + id); } catch (e) { /* ignore */ }
  }

  function setActive(id) {
    if (S.active === id) return;
    S.active = id;
    document.querySelectorAll('.qt-navlink,.qt-menu a[data-qt-id]').forEach((a) => {
      const on = a.dataset.qtId === id;
      a.classList.toggle('qt-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }

  function updateSpy() {
    if (!S.nav) return;
    if (S.lock) { setActive(S.lock); return; }
    const limit = headerH() + window.innerHeight * CONFIG.spyRatio;
    let current = null;
    S.nav.items.forEach((it) => {
      const t = getTarget(it.id);
      if (t && t.getBoundingClientRect().top + padTop(t) <= limit) current = it.id;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = S.nav.items[S.nav.items.length - 1].id;
    }
    setActive(current);
  }

  function findHeader() {
    if (S.header && S.header.isConnected) return S.header;
    const hasLabel = (root) => Array.from(root.querySelectorAll('a,button')).some(
      (e) => CONFIG.navLabels.includes(norm(e.textContent).toLowerCase())
    );
    for (const h of document.querySelectorAll('header')) if (hasLabel(h)) return h;
    const link = Array.from(document.querySelectorAll('a,button')).find((e) => norm(e.textContent).toLowerCase() === 'about');
    for (let el = link; el && el !== document.body; el = el.parentElement) {
      const pos = getComputedStyle(el).position;
      if (pos === 'fixed' || pos === 'sticky') return el;
    }
    return null;
  }

  function takeOverNav() {
    if (S.nav || !CONFIG.takeOverNav) return;
    const header = findHeader();
    if (!header) return;
    S.header = header;
    header.classList.add('qt-header');
    S.cta = Array.from(header.querySelectorAll('a,button')).find((e) => /download\s*cv/i.test(norm(e.textContent))) || null;
    if (S.cta) S.cta.classList.add('qt-cta');

    const items = [];
    header.querySelectorAll('a,button').forEach((el) => {
      const label = norm(el.textContent);
      if (CONFIG.navLabels.includes(label.toLowerCase())) items.push({ el, id: label.toLowerCase(), label });
    });
    if (items.length < 4) return;

    const counts = {};
    items.forEach((i) => { counts[i.el.className] = (counts[i.el.className] || 0) + 1; });
    const base = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || '';

    let container = items[0].el.parentElement;
    while (container && !items.every((i) => container.contains(i.el))) container = container.parentElement;
    if (container) container.classList.add('qt-nav');

    items.forEach((i) => {
      const a = document.createElement('a');
      a.href = '#' + i.id;
      a.className = (base + ' qt-navlink').trim();
      a.textContent = i.label;
      a.dataset.qtId = i.id;
      i.el.replaceWith(a);
    });
    S.nav = { items: items.map((i) => ({ id: i.id, label: i.label })) };
    updateVars();
    updateSpy();
  }

  /* ------------------------------------------------------------------ *
   * Header tools: theme button + mobile menu
   * ------------------------------------------------------------------ */
  function setMenu(open) {
    if (!S.menuEl || !S.burger) return;
    S.menuEl.classList.toggle('qt-open', open);
    if (open) S.menuEl.removeAttribute('inert'); else S.menuEl.setAttribute('inert', '');
    S.burger.setAttribute('aria-expanded', String(open));
    S.burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  function buildMenuPanel() {
    const panel = document.createElement('div');
    panel.id = 'qt-menu';
    panel.className = 'qt-menu';
    panel.setAttribute('inert', '');
    S.nav.items.forEach((it) => {
      const a = document.createElement('a');
      a.href = '#' + it.id;
      a.textContent = it.label;
      a.dataset.qtId = it.id;
      panel.appendChild(a);
    });
    if (S.cta && S.cta.getAttribute('href')) {
      const c = document.createElement('a');
      c.href = S.cta.getAttribute('href');
      c.textContent = norm(S.cta.textContent);
      c.className = 'qt-menu__cta';
      if (S.cta.hasAttribute('download')) c.setAttribute('download', '');
      panel.appendChild(c);
    }
    document.body.appendChild(panel);
    S.menuEl = panel;
  }

  function ensureTools() {
    if (S.tools) return;
    if (!S.header && !S.loaded) return;
    const wrap = document.createElement('div');
    wrap.className = 'qt-tools';

    const theme = document.createElement('button');
    theme.type = 'button';
    theme.className = 'qt-iconbtn qt-theme';
    theme.innerHTML = SUN + MOON;
    theme.addEventListener('click', toggleTheme);
    wrap.appendChild(theme);

    if (S.nav && CONFIG.mobileMenu) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'qt-iconbtn qt-burger';
      b.setAttribute('aria-controls', 'qt-menu');
      b.setAttribute('aria-expanded', 'false');
      b.setAttribute('aria-label', 'Open menu');
      b.innerHTML = '<span></span><span></span><span></span>';
      b.addEventListener('click', () => setMenu(!S.menuEl.classList.contains('qt-open')));
      wrap.appendChild(b);
      S.burger = b;
      buildMenuPanel();
    }

    if (S.cta && S.cta.parentElement) S.cta.insertAdjacentElement('beforebegin', wrap);
    else if (S.header) S.header.appendChild(wrap);
    else { wrap.classList.add('qt-floating'); document.body.appendChild(wrap); }

    S.tools = wrap;
    applyTheme(document.documentElement.getAttribute('data-theme') || CONFIG.defaultTheme);
  }

  /* ------------------------------------------------------------------ *
   * Hero motion: aurora, floating + tilting photo
   * ------------------------------------------------------------------ */
  function decorateHero() {
    if (S.heroDone) return;
    const h1 = document.querySelector('h1');
    if (!h1) return;
    const hero = h1.closest('section') || (h1.parentElement && h1.parentElement.parentElement);
    if (!hero) return;
    S.hero = hero;
    hero.classList.add('qt-hero');

    if (CONFIG.motion.aurora && !reduceMotion) {
      const a = document.createElement('div');
      a.className = 'qt-aurora';
      a.setAttribute('aria-hidden', 'true');
      a.innerHTML = '<i></i><i></i>';
      hero.insertBefore(a, hero.firstChild);
    }

    if (CONFIG.motion.photo) {
      const img = document.querySelector(CONFIG.photoSelector) || hero.querySelector('img');
      if (img) {
        let w = img.parentElement;
        for (let i = 0; i < 3 && w && w !== hero; i++) {
          if (/benha|class of/i.test(w.textContent)) break;
          if (w.children.length > 3 || w.offsetWidth > hero.offsetWidth * 0.6) break;
          w = w.parentElement;
        }
        if (w && w !== hero && !reduceMotion) {
          w.classList.add('qt-photo');
          if (CONFIG.motion.tilt && window.matchMedia && window.matchMedia('(pointer:fine)').matches) {
            w.addEventListener('pointermove', (e) => {
              const r = w.getBoundingClientRect();
              const px = (e.clientX - r.left) / r.width - 0.5;
              const py = (e.clientY - r.top) / r.height - 0.5;
              img.style.transform = 'perspective(900px) rotateY(' + (px * 8).toFixed(2) + 'deg) rotateX(' + (-py * 8).toFixed(2) + 'deg) scale(1.04)';
            });
            w.addEventListener('pointerleave', () => { img.style.transform = ''; });
          }
        }
      }
    }
    S.heroDone = true;
  }

  /* ------------------------------------------------------------------ *
   * Tools strip marquee
   * ------------------------------------------------------------------ */
  function findStrip() {
    const explicit = document.querySelector(CONFIG.stripSelector);
    if (explicit) return explicit;
    for (const el of document.querySelectorAll('span,li,a,button,div')) {
      if (!/^palo alto$/i.test(ownText(el)) || el.closest('[data-qt-clone]')) continue;
      let p = el.parentElement, d = 0;
      while (p && d < 3) { if (p.children.length >= 8) return p; p = p.parentElement; d += 1; }
    }
    return null;
  }

  function buildMarquee() {
    if (S.marquee || reduceMotion) return;
    const strip = findStrip();
    if (!strip || strip.dataset.qtMarquee) return;
    const track = document.createElement('div');
    track.className = 'qt-marquee__track';
    const group = document.createElement('div');
    group.className = 'qt-marquee__group';
    Array.from(strip.children).forEach((k) => group.appendChild(k));
    const copy = group.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.setAttribute('inert', '');
    copy.setAttribute('data-qt-clone', '1');
    track.appendChild(group);
    track.appendChild(copy);
    strip.appendChild(track);
    strip.classList.add('qt-marquee');
    strip.dataset.qtMarquee = '1';
    strip.style.setProperty('--qt-marquee-duration', CONFIG.marqueeDurationS + 's');
    S.marquee = true;
  }

  /* ------------------------------------------------------------------ *
   * Cards + scroll reveal
   * ------------------------------------------------------------------ */
  function markCards() {
    if (S.cards || !CONFIG.motion.cards) return;
    let n = 0;
    document.querySelectorAll('section[id] div,section[id] article,section[id] li').forEach((el) => {
      if (n >= 60 || el.closest('header,.qt-menu,.qt-marquee')) return;
      const st = getComputedStyle(el);
      const border = parseFloat(st.borderTopWidth) + parseFloat(st.borderLeftWidth);
      const radius = parseFloat(st.borderTopLeftRadius);
      const h = el.offsetHeight;
      if (border > 0 && radius >= 6 && h >= 56 && h <= 360 && norm(el.textContent).length > 20) {
        el.classList.add('qt-card');
        n += 1;
      }
    });
    S.cards = true;
  }

  function setupReveal() {
    if (S.revealSet || !CONFIG.motion.reveal || reduceMotion || !('IntersectionObserver' in window)) return;
    S.revealSet = true;
    const chosen = new Set();
    const list = [];
    document.querySelectorAll('section[id] :is(h2,h3,p,li,figure,table,.qt-card)').forEach((el) => {
      if ((S.hero && S.hero.contains(el)) || el.closest('header,footer,.qt-menu,.qt-marquee')) return;
      for (let p = el.parentElement; p; p = p.parentElement) if (chosen.has(p)) return;
      chosen.add(el);
      list.push(el);
    });
    const counters = new Map();
    list.forEach((el) => {
      const n = counters.get(el.parentElement) || 0;
      counters.set(el.parentElement, n + 1);
      el.style.setProperty('--qt-i', Math.min(n, 8));
      el.classList.add('qt-reveal');
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting && en.boundingClientRect.top >= 0) return;
        const el = en.target;
        io.unobserve(el);
        requestAnimationFrame(() => el.classList.add('qt-in'));
        setTimeout(() => { el.classList.remove('qt-reveal', 'qt-in'); el.style.removeProperty('--qt-i'); }, 1400);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    list.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------ *
   * Responsive: stack side-by-side blocks on small screens
   * ------------------------------------------------------------------ */
  function fixResponsive() {
    document.querySelectorAll('[data-qt-stack]').forEach((el) => el.removeAttribute('data-qt-stack'));
    if (window.innerWidth > CONFIG.stackBreakpoint) return;
    document.querySelectorAll('main *,section *').forEach((el) => {
      if (el.closest('header,.qt-menu,.qt-marquee,.qt-aurora') || el.children.length < 2 || el.children.length > 3) return;
      const st = getComputedStyle(el);
      const isGrid = st.display === 'grid' && st.gridTemplateColumns.split(' ').length > 1;
      const isRow = st.display === 'flex' && st.flexDirection.indexOf('row') === 0 && st.flexWrap === 'nowrap';
      if (!isGrid && !isRow) return;
      const kids = Array.from(el.children).filter((c) => c.offsetParent !== null);
      if (kids.length < 2 || kids.every((c) => /^(A|BUTTON)$/.test(c.tagName))) return;
      const rects = kids.map((c) => c.getBoundingClientRect());
      const sideBySide = rects.every((r) => Math.abs(r.top - rects[0].top) < 12 && r.width >= 120);
      if (sideBySide) el.setAttribute('data-qt-stack', '1');
    });
  }

  /* ------------------------------------------------------------------ *
   * Creative Features: Telemetry, Stat Counters, Filters, Toast
   * ------------------------------------------------------------------ */
  const ZONE_TELEMETRY = {
    trust: {
      title: 'TRUST ZONE (Internal Network)',
      desc: 'Subnet 10.10.0.0/16 · Virtual Router Trust-VR · App-ID & User-ID deep inspection active · Enforced zero-trust lateral segmentation.'
    },
    dmz: {
      title: 'DMZ ZONE (Public Services)',
      desc: 'Subnet 172.16.0.0/24 · Public web & application services · Bidirectional NAT rules · DoS SYN/UDP Flood mitigation profiles engaged.'
    },
    untrust: {
      title: 'UNTRUST ZONE (External WAN / Internet)',
      desc: 'Subnet 0.0.0.0/0 · Perimeter border gateway · Strict ingress blocking · Threat Prevention (IPS & Anti-Spyware) inspecting all packets.'
    },
    firewall: {
      title: 'PALO ALTO NGFW CORE ENGINE',
      desc: 'Next-Generation Firewall appliance · Virtual Routers (VR) · Single-Pass Architecture (SP3) · Dynamic session state tracking active.'
    },
    policies: {
      title: 'SECURITY POLICIES LAYER',
      desc: 'Active enforcement: Source/Destination NAT, App-ID signature rules, QoS bandwidth reservation for mission-critical services, DoS threshold protection.'
    }
  };

  function setupInteractiveTelemetry() {
    if (!CONFIG.interactiveTelemetry) return;
    const diagram = document.querySelector('.featured-project__diagram');
    if (!diagram || document.getElementById('topology-telemetry')) return;

    const hud = document.createElement('div');
    hud.id = 'topology-telemetry';
    hud.className = 'topology-telemetry';
    hud.innerHTML = `
      <div class="telemetry-header">
        <span class="telemetry-dot" aria-hidden="true"></span>
        <span id="telemetry-title">PALO ALTO NGFW TELEMETRY CONSOLE</span>
      </div>
      <div class="telemetry-body" id="telemetry-desc">
        Click or hover any network zone or policy to inspect live firewall architectural parameters.
      </div>
    `;
    diagram.appendChild(hud);

    const titleEl = document.getElementById('telemetry-title');
    const descEl = document.getElementById('telemetry-desc');

    function activateZone(key) {
      const info = ZONE_TELEMETRY[key];
      if (!info) return;
      hud.classList.add('active');
      titleEl.textContent = info.title;
      descEl.textContent = info.desc;
    }

    diagram.querySelectorAll('g').forEach((g) => {
      const text = norm(g.textContent).toLowerCase();
      let zoneKey = null;
      if (text.includes('trust zone') || text.includes('zone: trust')) zoneKey = 'trust';
      else if (text.includes('dmz zone') || text.includes('zone: dmz')) zoneKey = 'dmz';
      else if (text.includes('untrust') || text.includes('zone: untrust')) zoneKey = 'untrust';
      else if (text.includes('palo alto') || text.includes('firewall')) zoneKey = 'firewall';
      else if (text.includes('security policies') || text.includes('nat') || text.includes('qos') || text.includes('dos')) zoneKey = 'policies';

      if (zoneKey) {
        g.classList.add('topology-interactive-node');
        g.setAttribute('role', 'button');
        g.setAttribute('tabindex', '0');
        g.setAttribute('aria-label', `Inspect ${zoneKey} zone`);
        g.addEventListener('mouseenter', () => activateZone(zoneKey));
        g.addEventListener('click', (e) => {
          e.preventDefault();
          activateZone(zoneKey);
        });
        g.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            activateZone(zoneKey);
          }
        });
      }
    });
  }

  function setupStatCounters() {
    if (!CONFIG.statCounters || S.countersDone) return;
    const statCards = document.querySelectorAll('.stat-card');
    if (!statCards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !S.countersDone) {
            S.countersDone = true;
            animateCounters();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    const firstCard = statCards[0];
    if (firstCard) observer.observe(firstCard.parentElement || firstCard);
  }

  function animateCounters() {
    document.querySelectorAll('.stat-card__number').forEach((el) => {
      const rawText = el.textContent.trim();
      const numMatch = rawText.match(/\d+/);
      if (!numMatch) return;
      const target = parseInt(numMatch[0], 10);
      const suffix = rawText.includes('+') ? '+' : '';
      const isYear = target > 2000;
      const start = isYear ? 2018 : 0;

      if (reduceMotion) {
        el.textContent = rawText;
        return;
      }

      const duration = 1200;
      const startTime = performance.now();

      function update(currentTime) {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * ease);
        el.textContent = current + suffix;
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target + suffix;
      }

      requestAnimationFrame(update);
    });
  }

  function setupProjectFilters() {
    if (!CONFIG.projectFilters) return;
    const beyondGrid = document.querySelector('.beyond__grid');
    if (!beyondGrid || document.getElementById('project-filters')) return;

    const beyondSection = beyondGrid.parentElement;
    if (!beyondSection) return;

    const filterContainer = document.createElement('div');
    filterContainer.id = 'project-filters';
    filterContainer.className = 'project-filters';
    filterContainer.setAttribute('role', 'tablist');
    filterContainer.setAttribute('aria-label', 'Project categories filter');

    const categories = [
      { id: 'all', label: 'All Projects (4)' },
      { id: 'sec', label: 'Network & Security' },
      { id: 'dev', label: 'Python & Web' },
      { id: 'sys', label: 'Embedded & Systems' }
    ];

    categories.forEach((cat, idx) => {
      const btn = document.createElement('button');
      btn.className = `project-filter-btn ${idx === 0 ? 'active' : ''}`;
      btn.textContent = cat.label;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      btn.dataset.filter = cat.id;

      btn.addEventListener('click', () => {
        filterContainer.querySelectorAll('.project-filter-btn').forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        applyFilter(cat.id);
      });

      filterContainer.appendChild(btn);
    });

    beyondSection.insertBefore(filterContainer, beyondGrid);

    function applyFilter(filter) {
      const featCard = document.querySelector('.featured-project-card');
      const cards = beyondGrid.querySelectorAll('.beyond-card');

      if (featCard) {
        featCard.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        if (filter === 'all' || filter === 'sec') {
          featCard.style.display = '';
          setTimeout(() => { featCard.style.opacity = '1'; featCard.style.transform = 'none'; }, 20);
        } else {
          featCard.style.opacity = '0';
          featCard.style.transform = 'scale(0.98)';
          setTimeout(() => { featCard.style.display = 'none'; }, 250);
        }
      }

      cards.forEach((card) => {
        const title = norm(card.querySelector('.beyond-card__title')?.textContent || '').toLowerCase();
        let match = false;
        if (filter === 'all') match = true;
        else if (filter === 'dev' && (title.includes('python') || title.includes('web'))) match = true;
        else if (filter === 'sys' && (title.includes('embedded') || title.includes('network') || title.includes('system'))) match = true;
        else if (filter === 'sec') match = false;

        card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        if (match) {
          card.style.display = '';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'none'; }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.98)';
          setTimeout(() => { card.style.display = 'none'; }, 250);
        }
      });
    }
  }

  function setupClipboardToast() {
    if (!CONFIG.clipboardToast) return;
    document.querySelectorAll('.contact__table-value a').forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (href.startsWith('mailto:') || href.startsWith('tel:')) {
        const textToCopy = link.textContent.trim();
        link.title = 'Click to open · Ctrl/Cmd+Click to copy to clipboard';
        link.addEventListener('click', (e) => {
          if (e.ctrlKey || e.metaKey || e.altKey) {
            e.preventDefault();
            navigator.clipboard.writeText(textToCopy).then(() => {
              showToast(`Copied ${textToCopy} to clipboard!`);
            });
          }
        });
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * Misc: CSS variables, progress bar, events
   * ------------------------------------------------------------------ */
  function updateVars() {
    const root = document.documentElement;
    root.style.setProperty('--qt-header-h', Math.round(headerH()) + 'px');
    const pick = (c) => (c && c !== 'transparent' && c !== 'rgba(0, 0, 0, 0)' ? c : null);
    const bg = pick(getComputedStyle(document.body).backgroundColor) || pick(getComputedStyle(root).backgroundColor);
    if (bg && !S.bgSet) { root.style.setProperty('--qt-bg', bg); S.bgSet = true; }
    const fg = getComputedStyle(document.body).color;
    if (fg && !S.fgSet) { root.style.setProperty('--qt-fg', fg); S.fgSet = true; }
  }

  function bindEvents() {
    if (S.inited) return;
    S.inited = true;

    if (CONFIG.motion.progress) {
      const bar = document.createElement('div');
      bar.className = 'qt-progress';
      bar.setAttribute('aria-hidden', 'true');
      document.body.appendChild(bar);
      S.bar = bar;
    }

    const onScroll = rafThrottle(() => {
      if (S.bar) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        S.bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0).toFixed(4) + ')';
      }
      if (S.header) S.header.classList.toggle('qt-scrolled', window.scrollY > 8);
      updateSpy();
    });
    window.addEventListener('scroll', onScroll, { passive: true });

    let rt = null;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        updateVars();
        fixResponsive();
        if (window.innerWidth > CONFIG.mobileBreakpoint) setMenu(false);
        onScroll();
      }, 150);
    });

    ['wheel', 'touchstart'].forEach((ev) => window.addEventListener(ev, () => { S.token += 1; S.lock = null; }, { passive: true }));
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) { S.token += 1; S.lock = null; }
      if (e.key === 'Escape') setMenu(false);
    });

    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (a) {
        const id = a.getAttribute('href').slice(1);
        if (!id || id === 'top') { e.preventDefault(); e.stopPropagation(); S.lock = null; smoothTo(0); setMenu(false); return; }
        if (getTarget(id)) { e.preventDefault(); e.stopPropagation(); goTo(id); setMenu(false); return; }
      }
      if (S.menuEl && S.menuEl.classList.contains('qt-open') && !e.target.closest('.qt-menu,.qt-burger')) setMenu(false);
    }, true);

    onScroll();
  }

  /* ------------------------------------------------------------------ *
   * Orchestration
   * ------------------------------------------------------------------ */
  function run() {
    if (!document.body) return;
    bindEvents();
    hideBadge();
    editAbout();
    fixLinks();
    addTool();                       // before the marquee copies the tags
    takeOverNav();
    ensureTools();
    decorateHero();
    if (CONFIG.motion.marquee) buildMarquee();
    if (S.loaded) { markCards(); setupReveal(); }
    setupInteractiveTelemetry();
    setupStatCounters();
    setupProjectFilters();
    setupClipboardToast();
    updateVars();
    updateSpy();
  }

  let timer = null;
  const schedule = () => { clearTimeout(timer); timer = setTimeout(run, 80); };

  function start() {
    injectCSS();
    applyTheme(savedTheme());        // dark by default, before first paint

    const observer = new MutationObserver(() => { prepareRole(); hideBadge(); editAbout(); schedule(); });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    prepareRole();
    schedule();

    const loadDone = document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise((res) => window.addEventListener('load', res, { once: true }));

    loadDone
      .then(() => (document.fonts && document.fonts.ready) || null)
      .then(() => new Promise((res) => setTimeout(res, CONFIG.revealDelayMs)))
      .then(() => {
        S.loaded = true;
        prepareRole();
        revealRole();
        run();
        fixResponsive();
        setTimeout(() => observer.disconnect(), CONFIG.observeForMs);
      });
  }

  window.qtEdit = { run, config: CONFIG, goTo, showToast, replayRole };
  if (document.head) start(); else document.addEventListener('DOMContentLoaded', start, { once: true });
})();
