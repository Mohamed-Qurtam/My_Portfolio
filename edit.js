/*!
 * edit.js: portfolio tweaks & creative interactive features (vanilla JS, no dependencies)
 *
 * Core Features (per Edit.md specifications):
 *   1. Role title ("Network & Security Engineer") rendered only AFTER page load
 *      (window "load" + web fonts ready + 120ms), with character-by-character typing reveal
 *      and screen-reader polite announcement.
 *   2. "Kaspersky EDR" cloned from "Splunk" tag in hero ticker & Skills table (idempotent).
 *   3. Continuous smooth looping animations:
 *      - 1.1s terminal cursor blink (hard on/off)
 *      - 2s status dot pulse ring
 *      - 6s floating arch photo + 5s breathing glow (decoupled loops)
 *      - 40s seamless tools marquee strip with fade edges, pausing on hover/focus
 *   4. Full WCAG accessibility & prefers-reduced-motion: reduce compliance.
 *
 * Creative Additions:
 *   5. Interactive Palo Alto NGFW Topology Telemetry console (inspect Trust, DMZ, Untrust & Policies).
 *   6. Dynamic Stat Counter animation for "AT A GLANCE" numbers on scroll.
 *   7. Interactive Project Category Filter Tabs with smooth transitions.
 *   8. One-click Copy-to-Clipboard with cybersecurity toast notification for Contact items.
 *   9. Role replay trigger so visitors can re-experience the terminal typing animation.
 */
(function () {
  'use strict';

  if (window.__qtEditLoaded) return; // never run twice
  window.__qtEditLoaded = true;

  /* ------------------------------------------------------------------ *
   * CONFIG
   * ------------------------------------------------------------------ */
  const CONFIG = {
    // 1) Role title
    roleText: 'Network & Security Engineer',
    roleSelector: '[data-role-title]',
    rolePattern: /^network\s*&\s*security\s+engineer$/i,
    typeSpeedMs: 50,
    revealDelayMs: 120,
    addCursor: true,
    setDocumentTitle: false,
    documentTitle: 'Mohamed Qurtam | Network & Security Engineer',

    // 2) Tools list
    newTool: 'Kaspersky EDR',
    toolAnchor: /^splunk/i,

    // 3) Loops & Visuals
    animations: true,
    pulseSelector: '[data-pulse-dot]',
    photoSelector: '[data-hero-photo]',
    photoAltPattern: /qurtam|portrait|graduation|mohamed/i,
    marquee: true,
    stripSelector: '[data-tools-strip]',
    marqueeDurationS: 40,

    // 4) Creative Enhancements
    interactiveTelemetry: true,
    statCounters: true,
    projectFilters: true,
    clipboardToast: true,

    observeForMs: 10000
  };

  const reduceMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const state = {
    loaded: false,
    role: null,
    revealed: false,
    marquee: false,
    countersDone: false
  };

  /* ------------------------------------------------------------------ *
   * Injected CSS (Blueprint values from Edit.md + Creative Additions)
   * ------------------------------------------------------------------ */
  const CSS = `
:root {
  --qt-accent: var(--accent, #4dbb8a);
}

.qt-sr-only {
  position: absolute !important;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Blinking terminal cursor: 1.1s, hard on/off, forever */
.qt-cursor {
  display: inline-block;
  margin-left: .15em;
  color: var(--qt-accent, #4dbb8a);
  animation: qt-blink 1.1s steps(1, end) infinite;
  user-select: none;
}
@keyframes qt-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

/* Status dot: 2s pulse ring */
.qt-pulse {
  animation: qt-pulse 2s ease-in-out infinite;
}
@keyframes qt-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(77, 187, 138, 0.65);
  }
  50% {
    transform: scale(1.15);
    opacity: 0.85;
    box-shadow: 0 0 0 8px rgba(77, 187, 138, 0);
  }
}

/* Hero photo: 6s float + 5s glow (different lengths so loop never looks mechanical) */
.qt-float {
  animation: qt-float 6s ease-in-out infinite;
  will-change: transform;
}
.qt-glow {
  animation: qt-glow 5s ease-in-out infinite;
}
.qt-float.qt-glow {
  animation: qt-float 6s ease-in-out infinite, qt-glow 5s ease-in-out infinite;
}
@keyframes qt-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@keyframes qt-glow {
  0%, 100% { filter: drop-shadow(0 0 12px rgba(77, 187, 138, 0.14)); }
  50% { filter: drop-shadow(0 0 26px rgba(77, 187, 138, 0.38)); }
}

/* Tools strip marquee: endless scroll, pauses on hover/focus */
.qt-marquee {
  overflow: hidden;
  display: block !important;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}
.qt-marquee__track {
  display: flex;
  width: max-content;
  animation: qt-marquee var(--qt-marquee-duration, 40s) linear infinite;
}
.qt-marquee:hover .qt-marquee__track,
.qt-marquee:focus-within .qt-marquee__track {
  animation-play-state: paused;
}
.qt-marquee__group {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-around;
  gap: 12px;
  padding-right: 12px;
  min-width: 100vw;
}
@keyframes qt-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

/* Replay cursor hook */
[data-role-title] {
  cursor: pointer;
  transition: opacity 0.2s ease;
}
[data-role-title]:hover .qt-cursor {
  color: #fff;
}

/* Interactive Topology Telemetry Box */
.topology-telemetry {
  background: #111417;
  border: 1px solid var(--border-accent, rgba(77, 187, 138, 0.3));
  border-left: 3px solid var(--qt-accent, #4dbb8a);
  border-radius: 6px;
  padding: 10px 16px;
  margin-top: 16px;
  font-family: var(--font-mono, monospace);
  font-size: 0.76rem;
  line-height: 1.5;
  color: #b6bfc9;
  display: flex;
  flex-direction: column;
  gap: 3px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  transition: all 0.25s ease;
}
.topology-telemetry.active {
  border-color: var(--qt-accent, #4dbb8a);
  box-shadow: 0 0 16px rgba(77, 187, 138, 0.15);
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
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--qt-accent, #4dbb8a);
  display: inline-block;
  animation: qt-blink 1.5s infinite;
}
.telemetry-body {
  color: #f0ede8;
}

/* Interactive SVG Diagram Node Hovers */
.topology-interactive-node {
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
}
.topology-interactive-node:hover rect,
.topology-interactive-node.active rect {
  stroke: var(--qt-accent, #4dbb8a) !important;
  stroke-width: 2px !important;
  filter: drop-shadow(0 0 8px rgba(77, 187, 138, 0.4));
}

/* Project Filter Tabs */
.project-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}
.project-filter-btn {
  font-family: var(--font-mono, monospace);
  font-size: 0.74rem;
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
  color: #f0ede8;
}

/* Clipboard Toast */
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

@media (prefers-reduced-motion: reduce) {
  .qt-cursor, .qt-pulse, .qt-float, .qt-glow, .qt-marquee__track {
    animation: none !important;
  }
}
`;

  function injectCSS() {
    if (document.querySelector('style[data-qt-style]')) return;
    const style = document.createElement('style');
    style.setAttribute('data-qt-style', '');
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------ *
   * Helpers
   * ------------------------------------------------------------------ */
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

  function ownText(el) {
    let s = '';
    el.childNodes.forEach((n) => { if (n.nodeType === 3) s += n.nodeValue; });
    return norm(s);
  }

  function retext(root, text) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let done = false, n;
    while ((n = walker.nextNode())) {
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
   * 1) Role title: hidden before first paint, typed after full load
   * ------------------------------------------------------------------ */
  function prepareRole() {
    if (state.role) return;

    let el = document.querySelector(CONFIG.roleSelector);
    if (!el) {
      const candidates = document.querySelectorAll('h1,h2,h3,h4,p,span,div');
      for (const c of candidates) {
        if (c.closest('nav,footer,[data-qt-role]')) continue;
        const t = ownText(c).replace(/\|$/, '').trim();
        if (CONFIG.rolePattern.test(t)) { el = c; break; }
      }
    }
    if (!el) return;

    el.style.minHeight = el.offsetHeight ? el.offsetHeight + 'px' : '';

    const next = el.nextElementSibling;
    const hasSiblingCursor =
      next && (/cursor|caret|blink/i.test(next.className || '') || ownText(next) === '|');
    const after = window.getComputedStyle(el, '::after').content;
    const hasPseudoCursor = after && after !== 'none' && after !== 'normal';

    state.role = {
      el,
      addCursor: CONFIG.addCursor && !hasSiblingCursor && !hasPseudoCursor
    };

    el.setAttribute('data-qt-role', 'pending');
    el.title = 'Click to replay typing reveal';
    el.textContent = '';

    // Allow user to click to replay
    el.addEventListener('click', () => {
      replayRole();
    });

    if (state.loaded) revealRole();
  }

  function revealRole(customText) {
    if (!state.role) return;
    const { el, addCursor } = state.role;
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
      const cursor = document.createElement('span');
      cursor.className = 'qt-cursor';
      cursor.setAttribute('aria-hidden', 'true');
      cursor.textContent = '|';
      el.appendChild(cursor);
    }

    const finish = () => {
      visual.textContent = text;
      sr.textContent = text;
      el.setAttribute('data-qt-role', 'done');
      el.style.minHeight = '';
      state.revealed = true;
    };

    if (reduceMotion || !CONFIG.typeSpeedMs) {
      finish();
      return;
    }

    let i = 0;
    (function tick() {
      i += 1;
      visual.textContent = text.slice(0, i);
      if (i < text.length) {
        setTimeout(tick, CONFIG.typeSpeedMs);
      } else {
        finish();
      }
    })();
  }

  function replayRole() {
    if (!state.role) return;
    state.revealed = false;
    revealRole();
  }

  /* ------------------------------------------------------------------ *
   * 2) Add "Kaspersky EDR" next to "Splunk" in every tools list
   * ------------------------------------------------------------------ */
  function addTool() {
    const wanted = CONFIG.newTool.toLowerCase();

    document.querySelectorAll('span,li,a,button,div,code,p').forEach((el) => {
      if (el.closest('[data-qt-clone]')) return;
      const t = ownText(el);
      if (!t || t.length > 30 || !CONFIG.toolAnchor.test(t)) return;

      let unit = el, depth = 0;
      while (unit.parentElement && unit.parentElement.children.length < 3 && depth < 3) {
        unit = unit.parentElement; depth += 1;
      }
      const list = unit.parentElement;
      if (!list) return;

      const already = Array.from(list.children).some(
        (c) => norm(c.textContent).toLowerCase() === wanted
      );
      if (already) return;

      const clone = unit.cloneNode(true);
      retext(clone, CONFIG.newTool);
      clone.setAttribute('data-qt-tool', 'added');
      unit.insertAdjacentElement('afterend', clone);
    });
  }

  /* ------------------------------------------------------------------ *
   * 3) Looping Animations (Marquee & Decorators)
   * ------------------------------------------------------------------ */
  function findStrip() {
    const explicit = document.querySelector(CONFIG.stripSelector);
    if (explicit) return explicit;
    for (const el of document.querySelectorAll('span,li,a,button,div')) {
      if (!/^palo alto$/i.test(ownText(el)) || el.closest('[data-qt-clone]')) continue;
      let p = el.parentElement, depth = 0;
      while (p && depth < 3) {
        if (p.children.length >= 8) return p;
        p = p.parentElement; depth += 1;
      }
    }
    return null;
  }

  function buildMarquee() {
    if (!CONFIG.marquee || reduceMotion || state.marquee) return;
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
    state.marquee = true;
  }

  function decorate() {
    if (reduceMotion) return;

    // Status dot ("Open to new opportunities")
    let dot = document.querySelector(CONFIG.pulseSelector);
    if (!dot) {
      for (const el of document.querySelectorAll('span,div,p')) {
        if (!/open to new opportunities/i.test(ownText(el))) continue;
        for (const scope of [el, el.parentElement]) {
          if (!scope) continue;
          dot = Array.from(scope.children).find(
            (c) => !norm(c.textContent) && c.offsetWidth > 0 && c.offsetWidth <= 16
          );
          if (dot) break;
        }
        if (dot) break;
      }
    }
    if (dot) dot.classList.add('qt-pulse');

    // Hero photo
    let img = document.querySelector(CONFIG.photoSelector);
    if (!img) {
      img = Array.from(document.querySelectorAll('main img, section img, img')).find(
        (i) => CONFIG.photoAltPattern.test(i.alt || '')
      );
    }
    if (img) {
      const wrap = img.closest('figure') || img.parentElement || img;
      wrap.classList.add('qt-float');
      img.classList.add('qt-glow');
    }
  }

  /* ------------------------------------------------------------------ *
   * 4) Creative Feature: Interactive Palo Alto NGFW Telemetry Console
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

    // Create HUD box
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

    // Connect SVG node elements
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

  /* ------------------------------------------------------------------ *
   * 5) Creative Feature: Stat Counter Animation ("AT A GLANCE")
   * ------------------------------------------------------------------ */
  function setupStatCounters() {
    if (!CONFIG.statCounters || state.countersDone) return;
    const statCards = document.querySelectorAll('.stat-card');
    if (!statCards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !state.countersDone) {
            state.countersDone = true;
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

  /* ------------------------------------------------------------------ *
   * 6) Creative Feature: Project Category Filter Tabs
   * ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------ *
   * 7) Creative Feature: One-Click Copy-to-Clipboard with Toast
   * ------------------------------------------------------------------ */
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
   * Orchestration
   * ------------------------------------------------------------------ */
  function run() {
    addTool();
    if (CONFIG.animations) {
      buildMarquee();
      decorate();
    }
    setupInteractiveTelemetry();
    setupStatCounters();
    setupProjectFilters();
    setupClipboardToast();
  }

  let timer = null;
  const schedule = () => { clearTimeout(timer); timer = setTimeout(run, 80); };

  function start() {
    injectCSS();

    const observer = new MutationObserver(() => { prepareRole(); schedule(); });
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
        state.loaded = true;
        if (CONFIG.setDocumentTitle) document.title = CONFIG.documentTitle;
        prepareRole();
        revealRole();
        run();
        setTimeout(() => observer.disconnect(), CONFIG.observeForMs);
      });
  }

  window.qtEdit = {
    run,
    config: CONFIG,
    showToast,
    replayRole,
    state
  };

  if (document.head) start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });
})();
