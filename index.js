/*!
 * index.js v3.1: one script for the whole portfolio page (vanilla JS, no dependencies;
 * styling lives in index.css). Supersedes the legacy edit.js typed-reveal script.
 *
 * CONTENT / LINKS
 *   - "Read the project book" opens the Google Drive project book
 *   - LinkedIn (hero + Contact) -> /in/mohamed-qurtam-128296215/ ; GitHub fixed too
 *   - Experience titles show the job title only ("Network & Security Engineer")
 *   - "All Projects (4)" -> "All Projects (2)"
 *   - About heading/text, "Open to new opportunities" badge removed, Kaspersky EDR tag
 * FIXES
 *   - Light mode: photo, background images and emoji keep their real colours
 *   - Theme button + mobile menu button live at the top-right of the page (fixed)
 *   - Exact menu scrolling and correct highlighted item; responsive on every screen
 * MOTION (all sections)
 *   - Hero: staggered entrance, typed role, name sheen, network-constellation canvas,
 *     aurora, floating + tilting photo, cursor spotlight
 *   - Sections: heading blur-in + accent line, labels shimmer, per-type reveals
 *     (left / zoom / pop / clip / up), chips pop, timeline dot pings, check icons draw,
 *     diagram lines flow, card hover sweep, button ripple + magnetic pull,
 *     progress bar, scrolling tools strip
 *   - Everything stops under "prefers-reduced-motion"
 *
 * Install (in <head>, WITHOUT defer, so the saved theme applies before first paint):
 *   <script src="/index.js"></script>
 */
(function () {
  'use strict';
  if (window.__qtIndex) return;
  window.__qtIndex = true;

  /* Force page to start from top on every load/reload */
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  /* ------------------------------------------------------------------ *
   * CONFIG
   * ------------------------------------------------------------------ */
  const CONFIG = {
    // Links
    linkedin: 'https://www.linkedin.com/in/mohamed-qurtam-128296215/',
    github: 'https://github.com/Mohamed-Qurtam',
    projectBook: 'https://drive.google.com/file/d/16xB6Mx-rEupEh8hRWhIrd3jw6Q8Gj5_u/view?usp=drive_link',
    projectBookPattern: /read the project book/i,

    // Content
    aboutHeading: 'Networks. Security.',
    aboutText:
      'Adaptive Network Security Engineer and Tier 1 SOC Analyst , Communication & Electronics Engineering graduate ' +
      '(Excellent with Honors) with hands-on expertise in router/switch configuration, firewall administration, and real-time SIEM monitoring. ' +
      'Skilled in combining network topology insights with security operations to analyze log data, perform initial triage, and accelerate incident response. ' +
      'Proven track record in designing resilient architectures, minimizing attack surfaces, and executing proactive threat detection strategies to defend enterprise environments.',
    aboutHTML:
      'Adaptive <strong>Network Security Engineer</strong> and <strong>Tier 1 SOC Analyst</strong>, Communication & Electronics Engineering graduate ' +
      '(Excellent with Honors) with hands-on expertise in router/switch configuration, firewall administration, and real-time SIEM monitoring. ' +
      'Skilled in combining network topology insights with security operations to analyze log data, perform initial triage, and accelerate incident response. ' +
      'Proven track record in designing resilient architectures, minimizing attack surfaces, and executing proactive threat detection strategies to defend enterprise environments.',
    hideBadge: /open to new opportunities/i,
    projectsCount: 2,
    allProjectsPattern: /^all\s+projects\s*\(\s*\d+\s*\)$/i,
    jobTitleOnly: true,                    // "Title: Company" -> "Title"
    jobWords: /(engineer|specialist|tutor|creator|coordinator|developer|analyst|manager|intern|officer|lead)/i,

    // Role title (typed after the page has fully loaded)
    roleText: 'Network & Security Engineer',
    roleSelector: '[data-role-title]',
    rolePattern: /^network\s*&\s*security\s+engineer$/i,
    typeSpeedMs: 55,
    revealDelayMs: 120,
    addCursor: true,

    // Tools list
    newTool: 'Kaspersky EDR',
    toolAnchor: /^splunk/i,

    // Navigation
    navLabels: ['about', 'experience', 'skills', 'education', 'projects', 'certifications', 'contact'],
    scrollGapPx: 24,
    spyRatio: 0.45,
    takeOverNav: false,
    mobileMenu: false,
    mobileBreakpoint: 1024,
    stackBreakpoint: 760,

    // Theme
    defaultTheme: 'dark',
    themeStorageKey: 'qt-theme',

    // Creative Features
    interactiveTelemetry: true,
    statCounters: true,
    projectFilters: true,
    clipboardToast: true,

    // Motion switches
    motion: {
      heroIntro: true, sheen: true, network: true, aurora: true, photo: true, tilt: true,
      spotlight: true, progress: true, reveal: true, labels: true, headings: true, chips: true,
      dots: true, checks: true, flow: true, cards: true, buttons: true, magnet: true, marquee: true
    },
    marqueeDurationS: 40,
    stripSelector: '[data-tools-strip]',
    photoSelector: '[data-hero-photo]',

    observeForMs: 10000
  };

  const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const finePointer = !!(window.matchMedia && window.matchMedia('(pointer:fine)').matches);
  const S = {
    loaded: false, inited: false, settled: false, role: null, revealed: false, header: null, cta: null,
    nav: null, tools: null, burger: null, menuEl: null, lock: null, token: 0, active: null,
    marquee: false, cards: false, revealSet: false, heroDone: false, heroItems: false, about: false,
    badge: false, fallback: {}, hero: null, checked: new WeakSet()
  };

  /* ------------------------------------------------------------------ *
   * CSS
   * ------------------------------------------------------------------ */


  /* ------------------------------------------------------------------ *
   * Helpers
   * ------------------------------------------------------------------ */
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const rafThrottle = (fn) => { let q = false; return () => { if (q) return; q = true; requestAnimationFrame(() => { q = false; fn(); }); }; };
  const safe = (fn) => { try { fn(); } catch (e) { if (window.console) console.warn('[index.js] ' + (fn.name || 'step') + ':', e); } };

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

  /* ------------------------------------------------------------------ *
   * Theme
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
    const isLight = t === 'light';
    const label = isLight ? 'Dark' : 'Light';

    // Update navbar theme button matching Pic 3
    const navBtn = document.getElementById('navThemeToggle');
    const navLabel = document.getElementById('navThemeLabel');
    if (navLabel) navLabel.textContent = label;
    if (navBtn) {
      navBtn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    }

    // Update CSS variables for dynamic elements
    const root = document.documentElement;
    root.style.setProperty('--qt-bg', isLight ? '#f7f9fc' : '#0d0f12');
    root.style.setProperty('--qt-fg', isLight ? '#1c2b3d' : '#e6edf3');
    root.style.setProperty('--qt-accent', isLight ? '#0c7d55' : '#4dbb8a');

    document.querySelectorAll('.qt-theme').forEach((b) => {
      const btnLabel = isLight ? 'Switch to dark mode' : 'Switch to light mode';
      b.setAttribute('aria-label', btnLabel);
      b.setAttribute('title', btnLabel);
      b.setAttribute('aria-pressed', String(isLight));
    });

    if (document.head) {
      let m = document.querySelector('meta[name="theme-color"]');
      if (!m) { m = document.createElement('meta'); m.name = 'theme-color'; document.head.appendChild(m); }
      m.content = isLight ? '#f7f9fc' : '#0d0f12';
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || CONFIG.defaultTheme;
    const next = current === 'light' ? 'dark' : 'light';
    const run = () => {
      applyTheme(next);
      try { localStorage.setItem(CONFIG.themeStorageKey, next); } catch (e) { /* ignore */ }
    };
    if (document.startViewTransition && !reduceMotion) document.startViewTransition(run);
    else run();
  }

  const SUN = '<svg class="qt-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const MOON = '<svg class="qt-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  /* ------------------------------------------------------------------ *
   * Content: badge, About, links, labels, job titles, Kaspersky EDR
   * ------------------------------------------------------------------ */
  function hideBadge() {
    if (S.badge) return;
    for (const el of document.querySelectorAll('span,div,p,a')) {
      if (!CONFIG.hideBadge.test(ownText(el))) continue;
      let pill = el;
      const p = el.parentElement;
      if (p && p !== document.body && norm(p.textContent) === norm(el.textContent)) pill = p;
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
      (e) => /(hands-on experience|Adaptive Network Security)/i.test(e.textContent)
    );
    if (h && norm(h.textContent) !== CONFIG.aboutHeading) h.textContent = CONFIG.aboutHeading;
    if (p && !p.querySelector('strong')) {
      // Build about text using safe DOM APIs (SEC-03: no innerHTML)
      p.textContent = '';
      const parts = [
        { text: 'Adaptive ' },
        { text: 'Network Security Engineer', bold: true },
        { text: ' and ' },
        { text: 'Tier 1 SOC Analyst', bold: true },
        { text: ', Communication & Electronics Engineering graduate (Excellent with Honors) with hands-on expertise in router/switch configuration, firewall administration, and real-time SIEM monitoring. Skilled in combining network topology insights with security operations to analyze log data, perform initial triage, and accelerate incident response. Proven track record in designing resilient architectures, minimizing attack surfaces, and executing proactive threat detection strategies to defend enterprise environments.' }
      ];
      parts.forEach(part => {
        if (part.bold) {
          const strong = document.createElement('strong');
          strong.textContent = part.text;
          p.appendChild(strong);
        } else {
          p.appendChild(document.createTextNode(part.text));
        }
      });
    }
    if (h && p) S.about = true;
  }

  function openUrl(url) { window.open(url, '_blank', 'noopener,noreferrer'); }

  function fixLinks() {
    document.querySelectorAll('a').forEach((a) => {
      const t = norm(a.textContent + ' ' + (a.getAttribute('aria-label') || '')).toLowerCase();
      const h = a.getAttribute('href') || '';
      let url = null;
      if (CONFIG.projectBookPattern.test(t)) url = CONFIG.projectBook;
      else if (/linkedin/.test(t) || /linkedin\.com/i.test(h)) url = CONFIG.linkedin;
      else if (/github/.test(t) || /github\.com/i.test(h)) url = CONFIG.github;
      if (!url) return;
      if (h !== url) a.setAttribute('href', url);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    });

    // Contact cards that are plain <div>s: make the whole card open the right page
    [[/linkedin\.com\/in\//i, CONFIG.linkedin], [/github\.com\//i, CONFIG.github]].forEach(([re, url]) => {
      document.querySelectorAll('p,span,div').forEach((el) => {
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

  // Everything after a ":" in a job heading is dropped, in one text node or across several
  function cutAfterColon(el) {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let found = false, prefix = '', n;
    const nodes = [];
    while ((n = w.nextNode())) nodes.push(n);
    nodes.forEach((node) => {
      if (found) { if (node.nodeValue) node.nodeValue = ''; return; }
      const i = node.nodeValue.indexOf(':');
      if (i < 0) { prefix += node.nodeValue; return; }
      prefix += node.nodeValue.slice(0, i);
      if (CONFIG.jobWords.test(prefix) || norm(prefix).length > 2) {
        node.nodeValue = node.nodeValue.slice(0, i).replace(/\s+$/, '');
        found = true;
      }
    });
  }

  function fixLabels() {
    // "All Projects (4)" -> "All Projects (2)"
    const want = 'All Projects (' + CONFIG.projectsCount + ')';
    document.querySelectorAll('button,a,span,li,div').forEach((el) => {
      const t = norm(el.textContent);
      if (t.length < 30 && CONFIG.allProjectsPattern.test(t) && t !== want) retext(el, want);
    });

    // Experience: job title only
    if (!CONFIG.jobTitleOnly) return;
    const sec = getTarget('experience');
    if (!sec) return;
    const heads = Array.from(sec.querySelectorAll('h3,h4,h5,h6'));
    heads.forEach(cutAfterColon);
    if (!heads.length) {
      sec.querySelectorAll('div,p,span').forEach((el) => {
        const t = ownText(el);
        if (t.length <= 110 && t.indexOf(':') > 2 && CONFIG.jobWords.test(t.split(':')[0])) cutAfterColon(el);
      });
    }
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
   * Light mode: keep real colours for background photos and emoji
   * ------------------------------------------------------------------ */
  function markKeep() {
    document.querySelectorAll('body *').forEach((el) => {
      if (S.checked.has(el)) return;
      S.checked.add(el);
      if (/^(SCRIPT|STYLE|IMG|VIDEO|CANVAS|IFRAME|SVG|PATH|BR)$/i.test(el.tagName)) return;
      if (el.closest('.qt-keep,.qt-aurora,.qt-progress,.qt-spot')) return;
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg !== 'none' && /url\(/.test(bg)) el.classList.add('qt-keep');
    });
  }

  const EMOJI_RE = /(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F)(?:\uFE0F|\u200D(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})\uFE0F?)*/u;

  function markEmoji() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const p = n.parentElement;
        if (!p || /^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/.test(p.tagName) || p.closest('.qt-emoji')) return NodeFilter.FILTER_REJECT;
        return EMOJI_RE.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach((node) => {
      let cur = node, guard = 0;
      while (cur && guard++ < 8) {
        const m = EMOJI_RE.exec(cur.nodeValue);
        if (!m) break;
        // splitText keeps the site's original text node in place (safe for React)
        const emojiNode = cur.splitText(m.index);
        const rest = emojiNode.nodeValue.length > m[0].length ? emojiNode.splitText(m[0].length) : null;
        const span = document.createElement('span');
        span.className = 'qt-emoji qt-keep';
        emojiNode.parentNode.insertBefore(span, emojiNode);
        span.appendChild(emojiNode);
        cur = rest;
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * Role title
   * ------------------------------------------------------------------ */
  function prepareRole() {
    const el = document.querySelector(CONFIG.roleSelector) || document.querySelector('[data-role-title]');
    if (!el) return;
    if (!S.role) {
      S.role = { el, text: null };   // resolved at reveal time (CONFIG.roleText) so ar.js can localize it
    }
    el.style.cursor = 'pointer';
    el.title = 'Click to replay typing';

    if (!el.dataset.qtRoleBound) {
      el.dataset.qtRoleBound = '1';
      const triggerReplay = (e) => {
        if (e) e.stopPropagation();
        replayRole();
      };
      el.addEventListener('click', triggerReplay);
      el.addEventListener('touchstart', triggerReplay, { passive: true });
      el.addEventListener('pointerdown', triggerReplay);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerReplay(e);
        }
      });
    }

    // Start typing immediately on load across all devices
    if (!S.roleStarted) {
      S.roleStarted = true;
      el.textContent = '';
      setTimeout(() => {
        typeRole();
      }, 120);
    }
  }

  function revealRole() {
    if (!S.role) return;
    if (!S.revealed) {
      S.revealed = true;
      S.role.el.setAttribute('data-qt-role', 'done');
    }
    typeRole();
  }

  /* ------------------------------------------------------------------ *
   * Navigation
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
        if (token !== S.token) return;
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

  function initNavItems() {
    if (S.nav && S.nav.items && S.nav.items.length) return;
    const links = Array.from(document.querySelectorAll('.nav__link[href^="#"], .qt-navlink'));
    if (!links.length) return;
    S.nav = {
      items: links.map((a) => ({
        id: a.getAttribute('href').replace(/^#/, ''),
        label: norm(a.textContent),
        el: a
      }))
    };
  }

  function setActive(id) {
    if (S.active === id) return;
    S.active = id;
    document.querySelectorAll('.nav__link, .qt-navlink, .qt-menu a[data-qt-id]').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const on = href === '#' + id || a.dataset.qtId === id || a.id === 'nav-' + id;
      a.classList.toggle('active', on);
      a.classList.toggle('qt-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }

  function updateSpy() {
    initNavItems();
    if (!S.nav || !S.nav.items || !S.nav.items.length) return;
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
    // setActive(null) clears every highlight, so nothing is marked active
    // while the page is still on the hero.
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
      if (el.closest('.qt-tools')) return;
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
   * Top-right controls: theme button (+ hamburger on small screens)
   * ------------------------------------------------------------------ */
  function setMenu(open) {
    if (!S.menuEl || !S.burger) return;
    S.menuEl.classList.toggle('qt-open', open);
    if (open) S.menuEl.removeAttribute('inert'); else S.menuEl.setAttribute('inert', '');
    S.burger.setAttribute('aria-expanded', String(open));
    S.burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  function ensureTools() {
    const navThemeBtn = document.getElementById('navThemeToggle');
    if (navThemeBtn && !navThemeBtn.dataset.bound) {
      navThemeBtn.dataset.bound = '1';
      navThemeBtn.addEventListener('click', toggleTheme);
    }
    // Only apply on first run; re-applying on every ensureTools() pass
    // overwrote user toggles and repeated work.
    if (!ensureTools._applied) {
      ensureTools._applied = true;
      applyTheme(savedTheme());
    }
  }

  function ensureBurger() {
    if (S.burger || !S.tools || !S.nav || !CONFIG.mobileMenu) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'qt-iconbtn qt-burger';
    b.setAttribute('aria-controls', 'qt-menu');
    b.setAttribute('aria-expanded', 'false');
    b.setAttribute('aria-label', 'Open menu');
    b.appendChild(document.createElement('span'));
    b.appendChild(document.createElement('span'));
    b.appendChild(document.createElement('span'));
    b.addEventListener('click', () => setMenu(!S.menuEl.classList.contains('qt-open')));
    S.tools.insertBefore(b, S.tools.firstChild);   // burger sits left of the theme button
    S.burger = b;

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

  /* ------------------------------------------------------------------ *
   * Hero: entrance sequence, aurora + network canvas, photo, name sheen
   * ------------------------------------------------------------------ */
  function startNetwork(container, hero) {
    if (reduceMotion || !CONFIG.motion.network) return;
    const cv = document.createElement('canvas');
    cv.className = 'qt-net';
    cv.setAttribute('aria-hidden', 'true');
    container.appendChild(cv);
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const mouse = { x: -9999, y: -9999 };
    let w = 0, h = 0, nodes = [], visible = true;

    function size() {
      const r = hero.getBoundingClientRect();
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(70, Math.max(20, (w * h) / 22000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: 1 + Math.random() * 1.6
      }));
    }

    function frame() {
      requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      ctx.clearRect(0, 0, w, h);
      const link = Math.min(150, w / 6);
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        const dx = a.x - mouse.x, dy = a.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 14400) { const d = Math.sqrt(d2) || 1; const f = (1 - d / 120) * 0.9; a.x += (dx / d) * f; a.y += (dy / d) * f; }
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j], ddx = a.x - b.x, ddy = a.y - b.y, dd = ddx * ddx + ddy * ddy;
          if (dd < link * link) {
            ctx.strokeStyle = 'rgba(63,184,131,' + (0.3 * (1 - Math.sqrt(dd) / link)).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(63,184,131,.6)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
      }
    }

    size();
    frame();
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(hero); else window.addEventListener('resize', size);
    if ('IntersectionObserver' in window) new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(hero);
    hero.addEventListener('pointermove', (e) => { const r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  }

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
      a.appendChild(document.createElement('i'));
      a.appendChild(document.createElement('i'));
      hero.insertBefore(a, hero.firstChild);
      startNetwork(a, hero);
    }

    if (CONFIG.motion.sheen && !reduceMotion) h1.classList.add('qt-sheen');

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
          if (CONFIG.motion.tilt && finePointer) {
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

  // Hide the hero text blocks before first paint; they rise in one after another once the page has loaded
  function markHeroItems() {
    if (S.heroItems || !CONFIG.motion.heroIntro || reduceMotion) return;
    const h1 = document.querySelector('h1');
    if (!h1 || !h1.parentElement) return;
    let i = 0;
    Array.from(h1.parentElement.children).forEach((c) => {
      if (c.classList.contains('qt-aurora') || c.getAttribute('aria-hidden') === 'true' || c.style.display === 'none') return;
      c.classList.add('qt-hero-item');
      c.style.setProperty('--qt-i', String(i++));
    });
    S.heroItems = true;
    if (S.loaded) document.documentElement.classList.add('qt-go');
  }

  /* ------------------------------------------------------------------ *
   * Tools strip
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
    if (S.marquee || reduceMotion || document.querySelector('.tech-ticker__track')) return;
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
   * Section motion: marking helpers
   * ------------------------------------------------------------------ */
  const inSection = 'section[id]';
  const skipZone = (el) => el.closest('header,.qt-menu,.qt-marquee,.qt-tools,.qt-aurora');

  function markCards() {
    if (S.cards || !CONFIG.motion.cards) return;
    let n = 0;
    document.querySelectorAll(inSection + ' div,' + inSection + ' article,' + inSection + ' li').forEach((el) => {
      if (n >= 70 || skipZone(el)) return;
      const st = getComputedStyle(el);
      const border = parseFloat(st.borderTopWidth) + parseFloat(st.borderLeftWidth);
      const radius = parseFloat(st.borderTopLeftRadius);
      const h = el.offsetHeight, len = norm(el.textContent).length;
      if (border > 0 && radius >= 6 && ((h >= 56 && h <= 360 && len > 20) || (h >= 34 && h < 56 && len > 32))) {
        el.classList.add('qt-card');
        n += 1;
      }
    });
    S.cards = true;
  }

  function markChips() {
    if (!CONFIG.motion.chips) return;
    let n = 0;
    document.querySelectorAll(inSection + ' span,' + inSection + ' button,' + inSection + ' a,' + inSection + ' li,' + inSection + ' div').forEach((el) => {
      if (n >= 140 || S.checked.has(el) && el.classList.contains('qt-chip') || skipZone(el) || el.classList.contains('qt-card')) return;
      if (el.children.length > 2) return;
      const h = el.offsetHeight, len = norm(el.textContent).length;
      if (h < 20 || h > 44 || len < 2 || len > 32 || el.offsetWidth > 320) return;
      const st = getComputedStyle(el);
      if ((parseFloat(st.borderTopWidth) > 0) && parseFloat(st.borderTopLeftRadius) >= 3 && !el.classList.contains('qt-chip')) {
        el.classList.add('qt-chip');
        n += 1;
      }
    });
  }

  function markDots() {
    if (!CONFIG.motion.dots) return;
    const sec = getTarget('experience');
    if (!sec || sec.querySelector('.qt-dot')) return;
    let first = true;
    sec.querySelectorAll('span,div,i').forEach((el) => {
      const w = el.offsetWidth, h = el.offsetHeight;
      if (w < 6 || w > 16 || Math.abs(w - h) > 1 || el.children.length) return;
      const r = getComputedStyle(el).borderTopLeftRadius;
      if (!(r.indexOf('%') > -1 ? parseFloat(r) >= 50 : parseFloat(r) >= w / 2)) return;
      el.classList.add('qt-dot');
      if (first) { el.classList.add('qt-live'); first = false; }
    });
  }

  function markChecks() {
    if (!CONFIG.motion.checks) return;
    const sec = getTarget('certifications');
    if (!sec) return;
    sec.querySelectorAll('svg').forEach((svg) => {
      if (svg.classList.contains('qt-check') || svg.getBoundingClientRect().width > 30) return;
      svg.classList.add('qt-check');
      if (!('IntersectionObserver' in window) || reduceMotion) { svg.classList.add('qt-draw'); return; }
      const io = new IntersectionObserver((en) => {
        if (en[0].isIntersecting) { svg.classList.add('qt-draw'); io.disconnect(); }
      }, { threshold: 0.6 });
      io.observe(svg);
    });
  }

  function markFlow() {
    if (!CONFIG.motion.flow || reduceMotion) return;
    document.querySelectorAll('#projects svg :is(line,path,polyline)').forEach((el) => {
      if (el.classList.contains('qt-flow') || el.closest('.qt-keep')) return;
      const st = getComputedStyle(el);
      if (st.stroke === 'none' || (st.fill !== 'none' && st.fill !== 'rgba(0, 0, 0, 0)')) return;
      if (parseFloat(st.strokeWidth) > 3) return;
      el.classList.add('qt-flow');
    });
  }

  function markLabels() {
    if (!CONFIG.motion.labels || reduceMotion) return;
    document.querySelectorAll(inSection + ' span,' + inSection + ' p,' + inSection + ' div').forEach((el) => {
      if (el.classList.contains('qt-label') || el.children.length > 1) return;
      if (/^\/\/\s*\d*/.test(ownText(el)) && ownText(el).length < 40) el.classList.add('qt-label');
    });
  }

  function markButtons() {
    if (!CONFIG.motion.buttons) return;
    document.querySelectorAll('main button,main a,' + inSection + ' button,' + inSection + ' a,.qt-hero button,.qt-hero a').forEach((el) => {
      if (el.classList.contains('qt-btn') || skipZone(el) || el.closest('.qt-tools')) return;
      const t = norm(el.textContent);
      if (t.length < 2 || t.length > 40 || /back to top/i.test(t)) {
        if (/back to top|^↑/i.test(t)) el.classList.add('qt-top');
        return;
      }
      const st = getComputedStyle(el);
      if (st.position !== 'static' || el.offsetHeight < 28 || el.offsetHeight > 64) return;
      const boxed = parseFloat(st.borderTopWidth) > 0 || (st.backgroundColor && st.backgroundColor !== 'rgba(0, 0, 0, 0)');
      if (!boxed || parseFloat(st.paddingLeft) < 10 || parseFloat(st.borderTopLeftRadius) < 3) return;
      el.classList.add('qt-btn');
      if (CONFIG.motion.magnet && finePointer && !reduceMotion &&
          (el.closest('.qt-hero') || /project book|download cv|view projects|get in touch/i.test(t))) {
        el.classList.add('qt-magnet');
        el.addEventListener('pointermove', (e) => {
          const r = el.getBoundingClientRect();
          el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px,' +
            ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + 'px)';
        });
        el.addEventListener('pointerleave', () => { el.style.transform = ''; });
      }
      if (!reduceMotion) {
        el.addEventListener('pointerdown', (e) => {
          const r = el.getBoundingClientRect();
          const d = Math.max(r.width, r.height) * 2;
          const s = document.createElement('span');
          s.className = 'qt-ripple';
          s.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px';
          el.appendChild(s);
          s.addEventListener('animationend', () => s.remove());
        });
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * Scroll reveal (different effect per element type) + failsafe
   * ------------------------------------------------------------------ */
  function variantFor(el) {
    const tag = el.tagName;
    if (/^H[1-6]$/.test(tag)) return 'blur';
    if (el.classList.contains('qt-chip')) return 'pop';
    if (el.classList.contains('qt-card')) return 'zoom';
    if (tag === 'LI') return 'left';
    if (tag === 'FIGURE' || tag === 'TABLE') return 'clip';
    return 'up';
  }

  function showEl(el) {
    el.classList.add('qt-in');
    if (el.classList.contains('qt-h2')) el.classList.add('qt-line');
    const delay = 750 + (Number(el.style.getPropertyValue('--qt-i')) || 0) * 70 + 350;
    setTimeout(() => {
      el.classList.remove('qt-reveal', 'qt-in', 'qt-r-left', 'qt-r-zoom', 'qt-r-pop', 'qt-r-blur', 'qt-r-clip');
      el.style.removeProperty('--qt-i');
    }, delay);
  }

  function setupReveal() {
    if (S.revealSet || !CONFIG.motion.reveal || reduceMotion || !('IntersectionObserver' in window)) return;
    S.revealSet = true;

    if (CONFIG.motion.headings) {
      document.querySelectorAll(inSection + ' h2').forEach((h) => { if (!(S.hero && S.hero.contains(h))) h.classList.add('qt-h2'); });
    }

    const chosen = new Set();
    const list = [];
    document.querySelectorAll(inSection + ' :is(h2,h3,p,li,figure,table,.qt-card,.qt-chip)').forEach((el) => {
      if ((S.hero && S.hero.contains(el)) || skipZone(el) || el.closest('footer')) return;
      for (let p = el.parentElement; p; p = p.parentElement) if (chosen.has(p)) return;
      chosen.add(el);
      list.push(el);
    });
    const counters = new Map();
    list.forEach((el) => {
      const n = counters.get(el.parentElement) || 0;
      counters.set(el.parentElement, n + 1);
      el.style.setProperty('--qt-i', Math.min(n, el.classList.contains('qt-chip') ? 12 : 8));
      el.classList.add('qt-reveal', 'qt-r-' + variantFor(el));
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting && en.boundingClientRect.top >= 0) return;
        io.unobserve(en.target);
        requestAnimationFrame(() => showEl(en.target));
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    list.forEach((el) => io.observe(el));

    // Failsafe: anything already on screen is never left invisible
    const rescue = () => document.querySelectorAll('.qt-reveal:not(.qt-in)').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) showEl(el);
    });
    setTimeout(rescue, 5000);
    let st = null;
    window.addEventListener('scroll', () => { clearTimeout(st); st = setTimeout(rescue, 400); }, { passive: true });
  }

  /* ------------------------------------------------------------------ *
   * Responsive: stack side-by-side blocks on small screens
   * ------------------------------------------------------------------ */
  function fixResponsive() {
    document.querySelectorAll('[data-qt-stack]').forEach((el) => el.removeAttribute('data-qt-stack'));
    if (window.innerWidth > CONFIG.stackBreakpoint) return;
    document.querySelectorAll('main,main *,section,section *').forEach((el) => {
      if (el.closest('header,.qt-menu,.qt-marquee,.qt-aurora,.vendor-badges-marquee,.tech-ticker,.vendor-badges-track,.tech-ticker__track') || el.children.length < 2 || el.children.length > 4) return;
      const st = getComputedStyle(el);
      const isGrid = st.display === 'grid' && st.gridTemplateColumns.split(' ').length > 1;
      const isRow = st.display === 'flex' && st.flexDirection.indexOf('row') === 0 && st.flexWrap === 'nowrap';
      if (!isGrid && !isRow) return;
      // only real in-flow columns count (not the aurora/canvas layers or absolutely positioned decorations)
      const kids = Array.from(el.children).filter((c) => c.offsetParent !== null &&
        !c.classList.contains('qt-aurora') && !/^(absolute|fixed)$/.test(getComputedStyle(c).position));
      if (kids.length < 2 || kids.length > 3 || kids.every((c) => /^(A|BUTTON)$/.test(c.tagName))) return;
      // side by side = each column starts to the right of the previous one and they overlap vertically
      const rects = kids.map((c) => c.getBoundingClientRect()).sort((a, b) => a.left - b.left);
      const sideBySide = rects.every((r, i) => r.width >= 120 && (i === 0 ||
        (r.left >= rects[i - 1].right - 4 && r.top < rects[i - 1].bottom && rects[i - 1].top < r.bottom)));
      if (sideBySide) el.setAttribute('data-qt-stack', '1');
    });
  }

  /* ------------------------------------------------------------------ *
   * Misc: variables, events
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

    if (CONFIG.motion.spotlight && finePointer && !reduceMotion) {
      const spot = document.createElement('div');
      spot.className = 'qt-spot';
      spot.setAttribute('aria-hidden', 'true');
      document.body.appendChild(spot);
      const move = rafThrottle(() => {});
      window.addEventListener('pointermove', (e) => {
        spot.style.setProperty('--qt-x', e.clientX + 'px');
        spot.style.setProperty('--qt-y', e.clientY + 'px');
        spot.classList.add('qt-on');
      }, { passive: true });
      document.addEventListener('pointerleave', () => spot.classList.remove('qt-on'));
      void move;
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

    // Captured before the site's own handlers
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const ctl = e.target.closest && e.target.closest('a,button,[role="button"],[role="link"]');
      if (ctl && CONFIG.projectBookPattern.test(norm(ctl.textContent))) {
        e.preventDefault(); e.stopPropagation();
        openUrl(CONFIG.projectBook);
        return;
      }
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
   * Creative Features: Telemetry, Stat Counters, Filters, Toast, Replay
   * ------------------------------------------------------------------ */
  const ZONE_TELEMETRY = {
    standby: {
      title: 'PALO ALTO NGFW TELEMETRY CONSOLE // STANDBY',
      desc: 'Select or hover any network zone or security policy in the topology above to inspect verified architectural parameters.'
    },
    untrust: {
      title: 'UNTRUST ZONE (External Network / Internet)',
      desc: 'External WAN ingress · Perimeter border gateway · Strict ingress filtering · Inbound traffic routed through Palo Alto Threat Prevention (IPS & Anti-Spyware).'
    },
    trust: {
      title: 'TRUST ZONE (Internal Network / Corporate LAN)',
      desc: 'Protected corporate network · Dedicated Virtual Router (Trust-VR) · App-ID and User-ID deep packet inspection · Zero-trust lateral segmentation enforced.'
    },
    dmz: {
      title: 'DMZ ZONE (Public-Facing Services)',
      desc: 'Isolated perimeter network hosting public-facing services · Bidirectional NAT rules · Strict intra-zone isolation preventing DMZ-to-Trust traversal.'
    },
    firewall: {
      title: 'PALO ALTO NGFW CORE ENGINE',
      desc: 'Next-Generation Firewall appliance · Virtual Routers (VR) · Single-Pass Architecture (SP3) · Dynamic session state tracking active.'
    },
    policies: {
      title: 'SECURITY POLICIES LAYER',
      desc: 'Active enforcement: Source/Destination NAT, App-ID signature rules, QoS bandwidth reservation for mission-critical services, DoS threshold protection.'
    },
    wan: {
      title: 'WAN / INTERNET PERIMETER',
      desc: 'Public IP uplink · Border gateway connection terminating onto Palo Alto untrusted external interface.'
    },
    nat: {
      title: 'NAT (NETWORK ADDRESS TRANSLATION)',
      desc: 'Bidirectional Source NAT (SNAT) for egress Internet access and Destination NAT (DNAT) for public DMZ services.'
    },
    appid: {
      title: 'APP-ID DEEP PACKET INSPECTION',
      desc: 'Application-layer protocol identification independent of port or SSL encryption, enforcing granular application control.'
    },
    qos: {
      title: 'QoS BANDWIDTH POLICIES',
      desc: 'Guaranteed latency and bandwidth reservations for mission-critical VoIP and administrative channels.'
    },
    dos: {
      title: 'DoS PROTECTION PROFILES',
      desc: 'SYN/UDP/ICMP flood mitigation with dynamic threshold-based rate-limiting to protect perimeter availability.'
    }
  };

  function setupInteractiveTelemetry() {
    if (!CONFIG.interactiveTelemetry) return;
    const diagram = document.querySelector('.featured-project__diagram');
    if (!diagram || document.getElementById('topology-telemetry')) return;

    const hud = document.createElement('div');
    hud.id = 'topology-telemetry';
    hud.className = 'topology-telemetry';
    // Build telemetry HUD using safe DOM APIs (SEC-03: no innerHTML)
    const telHeader = document.createElement('div');
    telHeader.className = 'telemetry-header';
    const telDot = document.createElement('span');
    telDot.className = 'telemetry-dot';
    telDot.setAttribute('aria-hidden', 'true');
    const telTitle = document.createElement('span');
    telTitle.id = 'telemetry-title';
    telTitle.textContent = 'PALO ALTO NGFW TELEMETRY CONSOLE // STANDBY';
    telHeader.appendChild(telDot);
    telHeader.appendChild(telTitle);
    const telBody = document.createElement('div');
    telBody.className = 'telemetry-body';
    telBody.id = 'telemetry-desc';
    telBody.textContent = 'Select or hover any network zone or security policy in the topology above to inspect verified architectural parameters.';
    hud.appendChild(telHeader);
    hud.appendChild(telBody);
    diagram.appendChild(hud);

    const titleEl = document.getElementById('telemetry-title');
    const descEl = document.getElementById('telemetry-desc');

    const lines = {
      wan: diagram.querySelector('#flow-wan-fw'),
      trust: diagram.querySelector('#flow-fw-trust'),
      dmz: diagram.querySelector('#flow-fw-dmz'),
      untrust: diagram.querySelector('#flow-fw-untrust')
    };

    function clearLineHighlights() {
      Object.values(lines).forEach((l) => { if (l) l.classList.remove('active'); });
    }

    function activateZone(key, nodeEl) {
      const info = ZONE_TELEMETRY[key] || ZONE_TELEMETRY.standby;
      hud.classList.toggle('active', key !== 'standby');
      titleEl.textContent = info.title;
      descEl.textContent = info.desc;

      diagram.querySelectorAll('.topology-interactive-node').forEach((n) => n.classList.remove('active'));
      if (nodeEl) nodeEl.classList.add('active');

      clearLineHighlights();
      if (key === 'trust' && lines.trust) lines.trust.classList.add('active');
      else if (key === 'dmz' && lines.dmz) lines.dmz.classList.add('active');
      else if (key === 'untrust') {
        if (lines.untrust) lines.untrust.classList.add('active');
        if (lines.wan) lines.wan.classList.add('active');
      } else if (key === 'wan' && lines.wan) lines.wan.classList.add('active');
      else if (key === 'firewall') {
        Object.values(lines).forEach((l) => { if (l) l.classList.add('active'); });
      }
    }

    function resetStandby() {
      activateZone('standby', null);
    }

    diagram.addEventListener('mouseleave', resetStandby);

    diagram.querySelectorAll('g').forEach((g) => {
      let zoneKey = g.dataset.zone || null;
      if (!zoneKey) {
        const text = norm(g.textContent).toLowerCase();
        // Crucial: untrust MUST precede trust check to prevent substring false positive
        if (text.includes('untrust') || text.includes('external')) zoneKey = 'untrust';
        else if (text.includes('trust zone') || text.includes('internal lan')) zoneKey = 'trust';
        else if (text.includes('dmz')) zoneKey = 'dmz';
        else if (text.includes('palo alto') || text.includes('firewall')) zoneKey = 'firewall';
        else if (text.includes('security policies')) zoneKey = 'policies';
        else if (text.includes('wan') || text.includes('internet')) zoneKey = 'wan';
        else if (text.includes('nat')) zoneKey = 'nat';
        else if (text.includes('app-id')) zoneKey = 'appid';
        else if (text.includes('qos')) zoneKey = 'qos';
        else if (text.includes('dos')) zoneKey = 'dos';
      }

      if (zoneKey && ZONE_TELEMETRY[zoneKey]) {
        g.classList.add('topology-interactive-node');
        g.setAttribute('role', 'button');
        g.setAttribute('tabindex', '0');
        g.setAttribute('aria-label', `Inspect ${ZONE_TELEMETRY[zoneKey].title}`);

        g.addEventListener('mouseenter', () => activateZone(zoneKey, g));
        g.addEventListener('focus', () => activateZone(zoneKey, g));
        g.addEventListener('click', (e) => {
          e.preventDefault();
          activateZone(zoneKey, g);
        });
        g.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            activateZone(zoneKey, g);
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
      { id: 'all', label: 'All Projects (2)' },
      { id: 'dev', label: 'Python & Web' },
      { id: 'sys', label: 'Networks & Systems' }
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
        if (filter === 'all' || filter === 'sys') {
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

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`Copied ${text} to clipboard!`);
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast(`Copied ${text} to clipboard!`);
    } catch (e) {
      showToast(`Copied ${text}`);
    }
  }

  function setupClipboardToast() {
    // Hook into contact copy buttons (Edit.md T3)
    document.querySelectorAll('.contact-card__copy, .contact-copy-btn').forEach((btn) => {
      if (btn.dataset.qtCopyInit) return;
      btn.dataset.qtCopyInit = '1';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const text = btn.dataset.copy || '';
        if (!text) return;
        copyToClipboard(text);
        btn.classList.add('copied');
        const txtEl = btn.querySelector('.contact-copy-btn__text');
        if (txtEl) txtEl.textContent = 'Copied!';
        clearTimeout(btn.__copyTimer);
        btn.__copyTimer = setTimeout(() => {
          btn.classList.remove('copied');
          if (txtEl) txtEl.textContent = 'Copy';
        }, 1500);
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Credentials (Badges & Certificates): In-Page Popup Modal (Pic 2)
   * ------------------------------------------------------------------ */
  function extractDriveFileId(url) {
    if (!url) return null;
    const m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    return m ? m[1] : null;
  }

  function setupCertModal() {
    // 1. Certificate cards in #certsList
    document.querySelectorAll('.cert-card-clean').forEach((card) => {
      if (card.dataset.qtCertBound) return;
      card.dataset.qtCertBound = '1';

      const linksAttr = card.dataset.links;
      if (!linksAttr) {
        card.style.cursor = 'default';
        return;
      }

      let links;
      try {
        links = JSON.parse(linksAttr);
      } catch (e) {
        return;
      }

      if (!links || !links.length) {
        card.style.cursor = 'default';
        return;
      }

      card.style.cursor = 'pointer';

      const openModal = () => {
        const title = (card.querySelector('.cert-card-clean__title') || {}).textContent || 'Certificate';
        const provider = (card.querySelector('.cert-card-clean__provider') || {}).textContent || '';
        const badge = (card.querySelector('.cert-type-badge') || {}).textContent || 'CREDENTIAL';
        showCredentialPopup({
          title: title.trim(),
          subtitle: provider.trim(),
          badge: badge.trim(),
          links: links,
          type: 'cert'
        });
      };

      card.addEventListener('click', openModal);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal();
        }
      });
    });

    // 2. Accredited Vendor Badges in Marquee (Pic 2: pop-up instead of Google Drive redirect)
    document.querySelectorAll('.vendor-badge-item').forEach((badgeItem) => {
      if (badgeItem.dataset.qtBadgeBound) return;
      badgeItem.dataset.qtBadgeBound = '1';
      badgeItem.style.cursor = 'pointer';

      badgeItem.addEventListener('click', (e) => {
        e.preventDefault();
        const label = (badgeItem.querySelector('.vendor-badge-label') || {}).textContent || 'Vendor Badge';
        const img = badgeItem.querySelector('.vendor-badge-img');
        const imgSrc = img ? img.getAttribute('src') : '';
        const driveUrl = badgeItem.getAttribute('href') || '';
        showCredentialPopup({
          title: label.trim(),
          subtitle: 'Accredited Vendor Badge',
          badge: 'VENDOR BADGE',
          badgeImg: imgSrc,
          driveUrl: driveUrl,
          links: driveUrl ? [{ label: 'Google Drive', url: driveUrl }] : [],
          type: 'badge'
        });
      });
    });

    // 3. Education Card (Pic 4: pop-up instead of Google Drive redirect)
    const eduCard = document.getElementById('educationCard') || document.querySelector('.education-card--link');
    if (eduCard && !eduCard.dataset.qtEduBound) {
      eduCard.dataset.qtEduBound = '1';
      eduCard.style.cursor = 'pointer';

      const openEduModal = (e) => {
        if (e) e.preventDefault();
        showCredentialPopup({
          title: 'B.Sc. Communication & Electronics Engineering',
          subtitle: 'Benha University · Faculty of Engineering at Shoubra · June 2024 · Excellent with Honors',
          badge: 'GRADUATION CERTIFICATE',
          type: 'cert',
          links: [{
            label: 'Graduation Certificate',
            url: 'https://drive.google.com/file/d/1-AZlTNMwmeJ9LeW6W23xMRvUwEHdLBbf/view?usp=drive_link'
          }]
        });
      };

      eduCard.addEventListener('click', openEduModal);
      eduCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openEduModal();
        }
      });
    }
  }

  function showCredentialPopup(opts) {
    const existing = document.getElementById('cert-chooser-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'cert-chooser-overlay';
    overlay.className = 'cert-chooser-overlay cert-popup-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', opts.title);

    const dialog = document.createElement('div');
    dialog.className = 'cert-chooser-dialog cert-popup-dialog';

    // Header
    const header = document.createElement('div');
    header.className = 'cert-popup-header';

    const infoWrap = document.createElement('div');
    infoWrap.className = 'cert-popup-info';

    const badgeSpan = document.createElement('span');
    badgeSpan.className = 'cert-popup-type-badge';
    badgeSpan.textContent = opts.badge || 'CREDENTIAL';

    const titleEl = document.createElement('h3');
    titleEl.className = 'cert-popup-title';
    titleEl.textContent = opts.title;

    infoWrap.appendChild(badgeSpan);
    infoWrap.appendChild(titleEl);

    if (opts.subtitle) {
      const subEl = document.createElement('span');
      subEl.className = 'cert-popup-subtitle';
      subEl.textContent = opts.subtitle;
      infoWrap.appendChild(subEl);
    }

    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'cert-popup-actions';

    // If external link exists, provide an explicit "Open in New Tab" action
    if (opts.links && opts.links.length) {
      const extBtn = document.createElement('a');
      extBtn.className = 'cert-popup-ext-link';
      extBtn.target = '_blank';
      extBtn.rel = 'noopener noreferrer';
      extBtn.setAttribute('aria-label', 'Open document in new tab');
      extBtn.textContent = 'Open ↗';
      extBtn.href = opts.links[0].url;
      actionsWrap.appendChild(extBtn);
      // update link when tab changes
      dialog.__updateExtLink = (url) => { extBtn.href = url; };
    }

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'cert-popup-close';
    closeBtn.setAttribute('aria-label', 'Close credential popup');
    closeBtn.textContent = '\u00d7';

    actionsWrap.appendChild(closeBtn);
    header.appendChild(infoWrap);
    header.appendChild(actionsWrap);
    dialog.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = 'cert-popup-body';

    if (opts.type === 'badge' && opts.badgeImg) {
      // Badge display: Large high-res format
      const imgWrap = document.createElement('div');
      imgWrap.className = 'cert-popup-badge-view';
      const img = document.createElement('img');
      img.src = opts.badgeImg;
      img.alt = opts.title;
      img.className = 'cert-popup-badge-img';
      imgWrap.appendChild(img);
      body.appendChild(imgWrap);
    } else if (opts.links && opts.links.length) {
      // Multi-link tabs (e.g. AWS certificates)
      let tabsWrap = null;
      if (opts.links.length > 1) {
        tabsWrap = document.createElement('div');
        tabsWrap.className = 'cert-popup-tabs';
        opts.links.forEach((l, idx) => {
          const tabBtn = document.createElement('button');
          tabBtn.type = 'button';
          tabBtn.className = `cert-popup-tab ${idx === 0 ? 'active' : ''}`;
          tabBtn.textContent = l.label || `Certificate ${idx + 1}`;
          tabBtn.onclick = () => {
            tabsWrap.querySelectorAll('.cert-popup-tab').forEach((b) => b.classList.remove('active'));
            tabBtn.classList.add('active');
            if (dialog.__updateExtLink) dialog.__updateExtLink(l.url);
            renderViewer(idx);
          };
          tabsWrap.appendChild(tabBtn);
        });
        dialog.appendChild(tabsWrap);
      }

      const viewerWrap = document.createElement('div');
      viewerWrap.className = 'cert-popup-viewer-wrap';

      function renderViewer(idx) {
        viewerWrap.textContent = '';
        const currentLink = opts.links[idx];
        const isMindtickle = currentLink.url && currentLink.url.includes('mindtickle.com');
        const fileId = extractDriveFileId(currentLink.url);

        if (isMindtickle) {
          // Mindtickle denies iframe embedding via X-Frame-Options / CSP.
          // Render a verified digital credential card with direct verification action.
          const card = document.createElement('div');
          card.className = 'cert-popup-direct-card';

          const badge = document.createElement('div');
          badge.className = 'cert-popup-direct-badge';
          const dot = document.createElement('span');
          dot.textContent = '● ';
          dot.style.color = 'var(--accent, #4dbb8a)';
          badge.appendChild(dot);
          badge.appendChild(document.createTextNode('Cisco Black Belt Academy · Verified'));

          const svgNS = 'http://www.w3.org/2000/svg';
          const svg = document.createElementNS(svgNS, 'svg');
          svg.setAttribute('viewBox', '0 0 24 24');
          svg.setAttribute('class', 'cert-popup-direct-icon');
          svg.setAttribute('fill', 'none');
          svg.setAttribute('stroke', 'currentColor');
          svg.setAttribute('stroke-width', '1.75');
          svg.setAttribute('stroke-linecap', 'round');
          svg.setAttribute('stroke-linejoin', 'round');
          const path1 = document.createElementNS(svgNS, 'path');
          path1.setAttribute('d', 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z');
          const path2 = document.createElementNS(svgNS, 'path');
          path2.setAttribute('d', 'M9 12l2 2 4-4');
          svg.appendChild(path1);
          svg.appendChild(path2);

          const title = document.createElement('h4');
          title.className = 'cert-popup-direct-title';
          title.textContent = currentLink.label || opts.title;

          const desc = document.createElement('p');
          desc.className = 'cert-popup-direct-desc';
          desc.textContent = 'This credential is authenticated through Cisco Systems Mindtickle verification service. Cisco restricts iframe embedding for security; click below to verify the official record live.';

          const actions = document.createElement('div');
          actions.className = 'cert-popup-direct-actions';

          const verifyBtn = document.createElement('a');
          verifyBtn.className = 'cert-popup-direct-btn cert-popup-direct-btn--primary';
          verifyBtn.href = currentLink.url;
          verifyBtn.target = '_blank';
          verifyBtn.rel = 'noopener noreferrer';
          verifyBtn.textContent = 'Verify Official Credential ↗';

          const copyBtn = document.createElement('button');
          copyBtn.type = 'button';
          copyBtn.className = 'cert-popup-direct-btn cert-popup-direct-btn--secondary';
          copyBtn.textContent = 'Copy Verification Link';
          copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(currentLink.url).then(() => {
              showToast('Verification URL copied to clipboard!');
            }).catch(() => {
              showToast('Link: ' + currentLink.url);
            });
          });

          actions.appendChild(verifyBtn);
          actions.appendChild(copyBtn);

          card.appendChild(badge);
          card.appendChild(svg);
          card.appendChild(title);
          card.appendChild(desc);
          card.appendChild(actions);

          viewerWrap.appendChild(card);
        } else {
          const previewUrl = fileId
            ? `https://drive.google.com/file/d/${fileId}/preview`
            : currentLink.url;

          const iframe = document.createElement('iframe');
          iframe.src = previewUrl;
          iframe.className = 'cert-popup-iframe';
          iframe.setAttribute('title', currentLink.label || opts.title);
          iframe.setAttribute('allow', 'autoplay');
          iframe.setAttribute('loading', 'lazy');
          viewerWrap.appendChild(iframe);
        }
      }

      renderViewer(0);
      body.appendChild(viewerWrap);
    }

    dialog.appendChild(body);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add('open'));

    function close() {
      overlay.classList.remove('open');
      setTimeout(() => overlay.remove(), 260);
      document.removeEventListener('keydown', onKeyDown);
    }

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    function onKeyDown(e) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKeyDown);
  }

  function showToast(message) {
    let toast = document.getElementById('qt-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'qt-toast';
      toast.className = 'qt-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = '';
    const icon = document.createElement('span');
    icon.style.cssText = 'color:var(--qt-accent,#3fb883)';
    icon.textContent = '🛡️';
    toast.appendChild(icon);
    toast.appendChild(document.createTextNode(' ' + message));
    toast.classList.add('visible');
    clearTimeout(toast.__timer);
    toast.__timer = setTimeout(() => toast.classList.remove('visible'), 2600);
  }

  /* ------------------------------------------------------------------ *
   * Typewriter Role Title on Load & On Click (Pic 4)
   * ------------------------------------------------------------------ */
  let typeRoleTimer = null;
  function typeRole() {
    const el = (S.role && S.role.el) || document.querySelector(CONFIG.roleSelector) || document.querySelector('[data-role-title]');
    if (!el) return;
    const fullText = (S.role && S.role.text) || CONFIG.roleText || 'Network & Security Engineer';

    if (typeRoleTimer) {
      clearInterval(typeRoleTimer);
      typeRoleTimer = null;
    }
    el.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'role-cursor';
    cursor.textContent = '|';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.style.cssText = 'color:var(--accent,#3fb883);margin-left:3px;display:inline-block;animation:roleCursorBlink 0.75s infinite;';
    el.appendChild(cursor);

    let i = 0;
    typeRoleTimer = setInterval(() => {
      if (i < fullText.length) {
        cursor.before(fullText.charAt(i));
        i++;
      } else {
        clearInterval(typeRoleTimer);
        typeRoleTimer = null;
      }
    }, CONFIG.typeSpeedMs || 42);
  }

  function replayRole() {
    typeRole();
  }

  function fixFadeIn() {
    document.querySelectorAll('.fade-in').forEach((el) => {
      el.classList.add('visible');
    });
  }

  function setupCertFilters() {
    const tabsContainer = document.querySelector('.certs-filter-tabs');
    const certsList = document.getElementById('certsList');
    if (!tabsContainer || !certsList || tabsContainer.dataset.qtInit) return;
    tabsContainer.dataset.qtInit = '1';

    const cards = certsList.querySelectorAll('.cert-card-clean');
    tabsContainer.querySelectorAll('.certs-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        tabsContainer.querySelectorAll('.certs-filter-btn').forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const filter = btn.dataset.filter || 'all';
        let matchIdx = 0;
        cards.forEach((card) => {
          const category = card.dataset.category;
          const match = filter === 'all' || category === filter;
          card.classList.remove('stagger-in');
          if (match) {
            card.style.display = '';
            card.style.animationDelay = `${matchIdx * 35}ms`;
            void card.offsetWidth;
            card.classList.add('stagger-in');
            matchIdx++;
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  let cyberMeshInit = false;
  function setupCyberMeshCanvas() {
    if (cyberMeshInit) return;
    const canvas = document.getElementById('hero-cyber-canvas');
    if (!canvas) return;
    const hero = canvas.closest('.hero');
    if (!hero) return;
    cyberMeshInit = true;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;
    let nodes = [];
    const NODE_COUNT = 38;
    const MAX_DIST = 110;
    let animId = null;
    let isVisible = true;
    let mouse = { x: -9999, y: -9999, active: false };

    function resize() {
      const rect = hero.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    function createNodes() {
      nodes = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          r: Math.random() * 1.6 + 1
        });
      }
    }

    resize();
    createNodes();
    window.addEventListener('resize', () => {
      resize();
      if (!nodes.length) createNodes();
    }, { passive: true });

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    }, { passive: true });

    function draw() {
      if (!isVisible) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(77, 187, 138, 0.45)';
        ctx.fill();
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.22;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(77, 187, 138, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        if (mouse.active) {
          const mdx = nodes[i].x - mouse.x;
          const mdy = nodes[i].y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 140) {
            const alpha = (1 - mdist / 140) * 0.35;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(77, 187, 138, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    if (reduceMotion) {
      draw();
      return;
    }

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          isVisible = e.isIntersecting;
          if (isVisible) {
            if (!animId && !document.hidden) animId = requestAnimationFrame(draw);
          } else {
            if (animId) { cancelAnimationFrame(animId); animId = null; }
          }
        });
      }, { threshold: 0.05 });
      io.observe(hero);
    } else {
      animId = requestAnimationFrame(draw);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (animId) { cancelAnimationFrame(animId); animId = null; }
      } else if (isVisible && !animId) {
        animId = requestAnimationFrame(draw);
      }
    });
  }

  function setupHeroTelemetryTicker() {
    // Telemetry ticker removed per Edit.md
  }

  let spotlightInit = false;
  function setupCardSpotlightGlow() {
    if (spotlightInit) return;
    const cards = document.querySelectorAll(
      '.skill-card, .cert-card-clean, .education-card, .what-card, .beyond-card, .featured-project-card, .stat-card'
    );
    if (!cards.length) return;
    spotlightInit = true;

    cards.forEach((card) => {
      card.classList.add('card-spotlight');
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        card.style.removeProperty('--mouse-x');
        card.style.removeProperty('--mouse-y');
        card.style.removeProperty('--mx');
        card.style.removeProperty('--my');
      }, { passive: true });
    });
  }

  let phoneRevealInit = false;
  function setupPhoneReveal() {
    if (phoneRevealInit) return;
    const btn = document.getElementById('phoneRevealBtn');
    if (!btn) return;
    phoneRevealInit = true;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const a = btn.dataset.phA || '';
      const b = btn.dataset.phB || '';
      const phone = (a + b).trim();
      const cleanPhone = phone.replace(/\s+/g, '');

      const label = btn.querySelector('.knob__label');
      if (label) label.textContent = phone;
      btn.setAttribute('aria-label', 'Phone: ' + phone);

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(phone).then(() => {
          showToast('Phone copied: ' + phone);
        }).catch(() => {
          showToast('Phone: ' + phone);
        });
      } else {
        showToast('Phone: ' + phone);
      }

      // Next click opens dialer directly
      btn.onclick = () => {
        window.location.href = 'tel:' + cleanPhone;
      };
    });
  }

  let hangingFrameInit = false;
  function setupHangingFrameCard() {
    if (hangingFrameInit) return;
    const container = document.getElementById('heroPortraitCard');
    if (!container) return;
    hangingFrameInit = true;

    const triggerSwing = (e) => {
      container.dataset.swinging = '1';
      container.style.transform = '';
      container.classList.remove('swinging');
      void container.offsetWidth; // trigger reflow
      container.classList.add('swinging');
    };

    container.addEventListener('click', triggerSwing);
    container.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') {
        triggerSwing(e);
      }
    });

    container.addEventListener('animationend', () => {
      container.classList.remove('swinging');
      delete container.dataset.swinging;
    });

    container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerSwing();
      }
    });

    // 3D perspective tilt on hover and mouse direction tracking across hero
    if (finePointer && !reduceMotion) {
      const hero = document.getElementById('hero') || container.closest('section') || document.body;
      let raf = null;

      const onMove = (e) => {
        if (container.dataset.swinging === '1' || container.classList.contains('swinging')) return;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const rect = container.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const maxDistX = Math.max(window.innerWidth * 0.45, 260);
          const maxDistY = Math.max(window.innerHeight * 0.45, 260);
          const dx = Math.min(1, Math.max(-1, (e.clientX - cx) / maxDistX));
          const dy = Math.min(1, Math.max(-1, (e.clientY - cy) / maxDistY));
          const rotX = -dy * 8;
          const rotY = dx * 8;
          const transX = dx * 6;
          const transY = dy * 4;
          container.style.transform = `perspective(800px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translate3d(${transX.toFixed(1)}px, ${transY.toFixed(1)}px, 0)`;
        });
      };

      hero.addEventListener('mousemove', onMove, { passive: true });
      hero.addEventListener('mouseleave', () => {
        if (raf) cancelAnimationFrame(raf);
        container.style.transform = '';
      });
    }
  }

  let mobileNavInit = false;
  function setupMobileNav() {
    if (mobileNavInit) return;
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    const overlay = document.getElementById('navOverlay');
    if (!toggle || !links) return;
    mobileNavInit = true;

    function openNav() {
      toggle.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
      links.classList.add('open');
      if (overlay) overlay.classList.add('open');
      document.body.style.overflow = 'hidden';

      const firstFocusable = links.querySelector('a, button');
      if (firstFocusable) firstFocusable.focus();
    }

    function closeNav() {
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      links.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      document.body.style.removeProperty('overflow');
    }

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = links.classList.contains('open');
      if (isOpen) {
        closeNav();
        toggle.focus();
      } else {
        openNav();
      }
    });

    if (overlay) {
      overlay.addEventListener('click', () => {
        closeNav();
        toggle.focus();
      });
    }

    links.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        closeNav();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (!links.classList.contains('open')) return;
      if (e.key === 'Escape') {
        closeNav();
        toggle.focus();
        return;
      }

      if (e.key === 'Tab') {
        const focusables = Array.from(links.querySelectorAll('a, button, [tabindex="0"]')).filter(
          (el) => !el.hasAttribute('disabled')
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && links.classList.contains('open')) {
        closeNav();
      }
    }, { passive: true });
  }

  function setupFloatingProgressTop() {
    if (document.getElementById('qt-floating-top')) return;
    const btn = document.createElement('button');
    btn.id = 'qt-floating-top';
    btn.className = 'qt-floating-top';
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', 'Back to top');
    btn.title = 'Back to top';
    // Build back-to-top button using safe DOM APIs (SEC-03: no innerHTML)
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 44 44');
    svg.setAttribute('class', 'qt-progress-circle');
    svg.setAttribute('aria-hidden', 'true');
    const bgCircle = document.createElementNS(svgNS, 'circle');
    bgCircle.setAttribute('cx', '22'); bgCircle.setAttribute('cy', '22'); bgCircle.setAttribute('r', '18');
    bgCircle.setAttribute('fill', 'none'); bgCircle.setAttribute('stroke', 'rgba(255,255,255,0.08)'); bgCircle.setAttribute('stroke-width', '3');
    const fgCircle = document.createElementNS(svgNS, 'circle');
    fgCircle.id = 'qt-scroll-progress';
    fgCircle.setAttribute('cx', '22'); fgCircle.setAttribute('cy', '22'); fgCircle.setAttribute('r', '18');
    fgCircle.setAttribute('fill', 'none'); fgCircle.setAttribute('stroke', 'var(--qt-accent, #3fb883)'); fgCircle.setAttribute('stroke-width', '3');
    fgCircle.setAttribute('stroke-dasharray', '113.1'); fgCircle.setAttribute('stroke-dashoffset', '113.1');
    svg.appendChild(bgCircle); svg.appendChild(fgCircle);
    btn.appendChild(svg);
    const arrow = document.createElement('span');
    arrow.className = 'qt-top-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '\u2191';
    btn.appendChild(arrow);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      smoothTo(0);
    });
    document.body.appendChild(btn);

    const circ = 2 * Math.PI * 18; // 113.1
    const pBar = document.getElementById('qt-scroll-progress');

    window.addEventListener('scroll', () => {
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollMax > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollMax)) : 0;
      if (pBar) pBar.style.strokeDashoffset = String((circ * (1 - progress)).toFixed(2));
      btn.classList.toggle('visible', window.scrollY > 350);
    }, { passive: true });
  }

  /* ------------------------------------------------------------------ *
   * Orchestration
   * ------------------------------------------------------------------ */
  function run() {
    if (!document.body) return;
    safe(fixFadeIn);
    safe(bindEvents);
    safe(hideBadge);
    safe(editAbout);
    safe(fixLinks);
    safe(fixLabels);
    safe(addTool);
    safe(takeOverNav);
    safe(ensureTools);
    safe(ensureBurger);
    safe(decorateHero);
    safe(markHeroItems);
    if (CONFIG.motion.marquee) safe(buildMarquee);
    if (S.loaded) {
      safe(markEmoji);
      safe(markKeep);
      safe(markCards);
      safe(markChips);
      safe(markDots);
      safe(markChecks);
      safe(markFlow);
      safe(markLabels);
      safe(markButtons);
      safe(setupReveal);
    }
    safe(setupInteractiveTelemetry);
    safe(setupStatCounters);
    safe(setupProjectFilters);
    safe(setupCertFilters);
    safe(setupCertModal);
    safe(setupFloatingProgressTop);
    safe(setupClipboardToast);
    safe(setupCyberMeshCanvas);
    safe(setupHeroTelemetryTicker);
    safe(setupCardSpotlightGlow);
    safe(setupHangingFrameCard);
    safe(setupPhoneReveal);
    safe(setupMobileNav);
    safe(updateVars);
    safe(updateSpy);
  }

  // After the first seconds only the cheap content fixes keep running (filters, re-renders)
  function light() {
    safe(hideBadge);
    safe(fixLabels);
    safe(fixLinks);
  }

  let timer = null;
  const schedule = () => { clearTimeout(timer); timer = setTimeout(S.settled ? light : run, S.settled ? 150 : 80); };

  function start() {
    applyTheme(savedTheme());

    // Runs before paint on every DOM change, so old text never flashes
    const observer = new MutationObserver(() => {
      if (!S.settled) { prepareRole(); hideBadge(); editAbout(); markHeroItems(); }
      schedule();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    prepareRole();
    schedule();

    // If anything below goes wrong, never leave the hero hidden
    setTimeout(() => document.documentElement.classList.add('qt-go-all'), 4500);

    const loadDone = document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise((res) => window.addEventListener('load', res, { once: true }));

    loadDone
      .then(() => Promise.race([(document.fonts && document.fonts.ready) || null,
        new Promise(function (r) { setTimeout(r, 1500); })]))
      .then(() => new Promise((res) => setTimeout(res, CONFIG.revealDelayMs)))
      .then(() => {
        S.loaded = true;
        document.documentElement.classList.add('qt-go');   // starts the hero entrance
        safe(prepareRole);
        safe(revealRole);
        run();
        safe(fixResponsive);
        setTimeout(() => { S.settled = true; }, CONFIG.observeForMs);
      });
  }

  window.qtIndex = { run, config: CONFIG, goTo, showToast, replayRole };
  if (document.head) start(); else document.addEventListener('DOMContentLoaded', start, { once: true });
})();

/* ==================================================================
 * FANTASY LAYER v1: custom cursor + click sparkles
 * - Custom cursor only on fine-pointer, hover-capable devices with
 *   motion allowed (touch devices and reduced-motion users keep the
 *   native cursor and see zero extra work).
 * - Dot follows instantly; ring trails with easing and grows over
 *   interactive elements, compresses on press.
 * - Sparkle burst on every click (desktop, motion-allowed only).
 * - CSP-safe: DOM primitives only, no innerHTML, no eval.
 * ================================================================== */
(function () {
  'use strict';
  if (window.__qtFantasy) return;
  window.__qtFantasy = true;

  var reduceMotion = false;
  var finePointer = false;
  try {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    finePointer = window.matchMedia('(pointer: fine)').matches &&
                  window.matchMedia('(hover: hover)').matches;
  } catch (e) { /* very old engines: keep native cursor */ }
  if (!finePointer || reduceMotion) return;

  function init() {
    if (!document.body) return;
    var root = document.documentElement;
    root.classList.add('qt-cursor-active');

    var dot = document.createElement('div');
    dot.className = 'qt-cursor-dot qt-hidden';
    dot.setAttribute('aria-hidden', 'true');
    var ring = document.createElement('div');
    ring.className = 'qt-cursor-ring qt-hidden';
    ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    var x = -100, y = -100, rx = -100, ry = -100, seen = false;
    var INTERACTIVE = 'a, button, [role="button"], [onclick], summary, input[type="submit"], input[type="checkbox"], label, .knob, .cert-card-clean, .stat-card, .qt-theme, .timeline-item';

    function applyDot() {
      dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) translate(-50%,-50%)';
    }

    document.addEventListener('pointermove', function (e) {
      x = e.clientX; y = e.clientY;
      if (!seen) {
        seen = true; rx = x; ry = y;
        dot.classList.remove('qt-hidden');
        ring.classList.remove('qt-hidden');
        applyDot();
      }
      applyDot();
    }, { passive: true });

    // Ring trails behind the dot with easing
    (function loop() {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();

    document.addEventListener('pointerover', function (e) {
      var t = e.target && e.target.closest ? e.target.closest(INTERACTIVE) : null;
      ring.classList.toggle('qt-hover', !!t);
      dot.classList.toggle('qt-hover', !!t);
    }, { passive: true });

    document.addEventListener('pointerdown', function (e) {
      ring.classList.add('qt-press');
      sparkle(e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener('pointerup', function () {
      ring.classList.remove('qt-press');
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      dot.classList.add('qt-hidden');
      ring.classList.add('qt-hidden');
    });

    document.addEventListener('mouseenter', function () {
      if (seen) {
        dot.classList.remove('qt-hidden');
        ring.classList.remove('qt-hidden');
      }
    });

    // --- Sparkle burst on click ---
    var COLORS = ['#4dbb8a', '#8fe6bd', '#e8d27a', '#f0ede8'];
    function sparkle(px, py) {
      if (reduceMotion) return;
      for (var i = 0; i < 12; i++) {
        (function (i) {
          var s = document.createElement('span');
          s.className = 'qt-spark';
          var c = COLORS[i % COLORS.length];
          s.style.background = c;
          s.style.boxShadow = '0 0 8px ' + c;
          s.style.left = px + 'px';
          s.style.top = py + 'px';
          document.body.appendChild(s);
          var angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.5;
          var dist = 26 + Math.random() * 40;
          var dx = Math.cos(angle) * dist;
          var dy = Math.sin(angle) * dist;
          var anim = s.animate([
            { transform: 'translate(-50%,-50%) rotate(0deg) scale(1)', opacity: 1 },
            { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) rotate(180deg) scale(0.15)', opacity: 0 }
          ], { duration: 560 + Math.random() * 280, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' });
          anim.onfinish = function () {
            if (s.parentNode) s.parentNode.removeChild(s);
          };
        })(i);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();

/* ==================================================================
 * FEATURED-SIX LAYER: collapse the credential wall to six flagship
 * certificates; "Show all 30 credentials" reveals the rest and the
 * category filter tabs. CSP-safe DOM primitives only.
 * ================================================================== */
(function () {
  'use strict';
  if (window.__qtFeatured) return;
  window.__qtFeatured = true;

  function init() {
    var btn = document.getElementById('certsShowAllBtn');
    if (!btn || btn.dataset.qtFeatInit) return;
    btn.dataset.qtFeatInit = '1';
    var label = btn.querySelector('.certs-showall-btn__label');
    var count = btn.querySelector('.certs-showall-btn__count');
    btn.addEventListener('click', function () {
      var expanded = document.body.classList.toggle('certs-expanded');
      btn.setAttribute('aria-expanded', String(expanded));
      if (label) label.textContent = expanded ? 'Show featured six only' : 'Show all 30 credentials';
      if (count) count.textContent = expanded ? '−24' : '+24';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
