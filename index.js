/*!
 * index.js v3: one script for the whole portfolio page (vanilla JS, no dependencies;
 * all CSS is injected by this file). It replaces edit.js from the previous update.
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
      "I'm a Network & Security Engineer, Communication & Electronics Engineering graduate " +
      '(Excellent with Honors) with hands-on experience in switches, routers, firewall ' +
      'configuration, SIEM monitoring and incident response. Beyond engineering, my work in ' +
      'cybersecurity content, technical session coordination and programming education shapes ' +
      'how I communicate complex ideas.',
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
    takeOverNav: true,
    mobileMenu: true,
    mobileBreakpoint: 860,
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
  const CSS = `
:root{--qt-accent:#3fb883;--qt-header-h:76px;--qt-bg:#0d0f12;--qt-fg:#f2f0ed}
html{scroll-behavior:smooth;scroll-padding-top:calc(var(--qt-header-h) + 16px);-webkit-text-size-adjust:100%}
section[id]{scroll-margin-top:calc(var(--qt-header-h) + 16px)}
html,body{overflow-x:clip;max-width:100%}
img,video{max-width:100%;height:auto}
::selection{background:rgba(63,184,131,.35)}
:focus-visible{outline:2px solid var(--qt-accent);outline-offset:3px}
.qt-sr-only{position:absolute!important;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}

/* ---------- light theme: clean transition ---------- */
html, body, section, header, .card, .stat-card, .cert-card-clean, .project-card-interactive {
  transition: background-color .35s ease, border-color .35s ease, color .35s ease;
}
::view-transition-old(root),::view-transition-new(root){animation-duration:.45s}

/* ---------- header ---------- */
.qt-header{-webkit-backdrop-filter:saturate(1.4) blur(14px);backdrop-filter:saturate(1.4) blur(14px);
  background-color:color-mix(in srgb,var(--qt-bg) 78%,transparent)!important;transition:box-shadow .3s ease;
  padding-right:calc(40px + 32px)!important}
.qt-header.qt-scrolled{box-shadow:0 10px 30px -12px rgba(0,0,0,.55)}
.qt-navlink{position:relative;transition:color .25s ease}
.qt-navlink::after{content:"";position:absolute;left:0;right:0;bottom:-7px;height:2px;border-radius:2px;
  background:var(--qt-accent);transform:scaleX(0);transform-origin:left;transition:transform .35s cubic-bezier(.2,.7,.2,1)}
.qt-navlink:hover::after,.qt-navlink.qt-active::after{transform:scaleX(1)}
.qt-navlink.qt-active{color:var(--qt-fg)!important}

/* theme + menu buttons: fixed at the top-right corner of the page */
.qt-tools{position:fixed;top:calc(var(--qt-header-h)/2 - 20px);right:16px;z-index:9998;display:flex;align-items:center;gap:8px}
.qt-iconbtn{width:40px;height:40px;display:inline-grid;place-items:center;border:1px solid rgba(127,127,127,.35);
  border-radius:10px;background:color-mix(in srgb,var(--qt-bg) 70%,transparent);color:var(--qt-fg);cursor:pointer;padding:0;
  transition:border-color .25s,transform .25s,background .25s}
.qt-iconbtn:hover{border-color:var(--qt-accent);transform:translateY(-2px);background:rgba(63,184,131,.14)}
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

/* ---------- progress bar + cursor spotlight ---------- */
.qt-progress{position:fixed;top:0;left:0;right:0;height:3px;z-index:9999;transform-origin:0 50%;transform:scaleX(0);
  background:linear-gradient(90deg,var(--qt-accent),#7be3b8);pointer-events:none}
.qt-spot{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:0;transition:opacity .4s;
  background:radial-gradient(420px circle at var(--qt-x,50%) var(--qt-y,50%),rgba(63,184,131,.09),transparent 60%)}
.qt-spot.qt-on{opacity:1}

/* ---------- hero: entrance, aurora, network, photo, name sheen ---------- */
.qt-hero{position:relative;isolation:isolate;overflow:hidden}
.qt-hero-item{opacity:0}
html.qt-go .qt-hero-item{opacity:1;animation:qt-rise .85s cubic-bezier(.2,.7,.2,1) backwards;animation-delay:calc(var(--qt-i,0)*110ms + 60ms)}
html.qt-go-all .qt-hero-item{opacity:1!important;animation:none!important}
@keyframes qt-rise{from{opacity:0;transform:translate3d(0,28px,0);filter:blur(6px)}to{opacity:1;transform:none;filter:blur(0)}}
.qt-aurora{position:absolute;inset:0;z-index:-1;pointer-events:none;overflow:hidden}
.qt-aurora i{position:absolute;border-radius:50%;filter:blur(70px);opacity:.28;will-change:transform}
.qt-aurora i:nth-child(1){width:42vmax;height:42vmax;left:-10vmax;top:-12vmax;
  background:radial-gradient(circle,#3fb883,transparent 70%);animation:qt-drift-a 22s ease-in-out infinite alternate}
.qt-aurora i:nth-child(2){width:36vmax;height:36vmax;right:-8vmax;bottom:-14vmax;
  background:radial-gradient(circle,#2f7df0,transparent 70%);animation:qt-drift-b 28s ease-in-out infinite alternate}
.qt-aurora::after{content:"";position:absolute;inset:0;background-size:48px 48px;
  background-image:linear-gradient(rgba(127,127,127,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(127,127,127,.08) 1px,transparent 1px);
  -webkit-mask-image:radial-gradient(ellipse at 50% 40%,#000 20%,transparent 75%);mask-image:radial-gradient(ellipse at 50% 40%,#000 20%,transparent 75%)}
.qt-net{position:absolute;inset:0;width:100%;height:100%}
@keyframes qt-drift-a{to{transform:translate3d(8vmax,6vmax,0) scale(1.15)}}
@keyframes qt-drift-b{to{transform:translate3d(-7vmax,-5vmax,0) scale(1.1)}}
.qt-photo{position:relative;isolation:isolate;opacity:0}
html.qt-go .qt-photo,html.qt-go-all .qt-photo{opacity:1;animation:qt-pop .95s cubic-bezier(.2,.7,.2,1) .35s backwards,qt-float 6s ease-in-out 1.3s infinite;will-change:transform}
.qt-photo::before{content:"";position:absolute;inset:-6%;z-index:-1;border-radius:40%;
  background:radial-gradient(closest-side,rgba(63,184,131,.34),transparent);animation:qt-breathe 5s ease-in-out infinite}
.qt-photo img{transition:transform .25s ease-out;will-change:transform}
@keyframes qt-pop{from{opacity:0;transform:scale(.86) translate3d(0,20px,0)}to{opacity:1;transform:none}}
@keyframes qt-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes qt-breathe{0%,100%{opacity:.45;transform:scale(.96)}50%{opacity:1;transform:scale(1.06)}}
@supports ((-webkit-background-clip:text) or (background-clip:text)){
  .qt-sheen{background-image:linear-gradient(100deg,currentColor 38%,var(--qt-accent) 50%,currentColor 62%);
    background-size:250% 100%;background-position:120% 0;-webkit-background-clip:text;background-clip:text;
    -webkit-text-fill-color:transparent;animation:qt-sheen 7s ease-in-out 1.6s infinite}
}
@keyframes qt-sheen{0%,20%{background-position:120% 0}60%,100%{background-position:-20% 0}}
.qt-cursor{display:inline-block;margin-left:.15em;color:var(--qt-accent);animation:qt-blink 1.1s steps(1,end) infinite}
@keyframes qt-blink{0%,49%{opacity:1}50%,100%{opacity:0}}

/* ---------- tools strip ---------- */
.qt-marquee{overflow:hidden;display:block!important;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);
  mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.qt-marquee__track{display:flex;width:max-content;animation:qt-marquee var(--qt-marquee-duration,40s) linear infinite}
.qt-marquee:hover .qt-marquee__track,.qt-marquee:focus-within .qt-marquee__track{animation-play-state:paused}
.qt-marquee__group{display:flex;flex-shrink:0;align-items:center;justify-content:space-around;gap:12px;padding-right:12px;min-width:100vw}
.qt-marquee__group>*{transition:transform .25s ease,border-color .25s ease}
.qt-marquee__group>*:hover{transform:translateY(-3px);border-color:var(--qt-accent)}
@keyframes qt-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* ---------- section motion ---------- */
.qt-reveal{opacity:0;transform:translate3d(0,26px,0);
  transition:opacity .75s cubic-bezier(.2,.7,.2,1) calc(var(--qt-i,0)*70ms),transform .75s cubic-bezier(.2,.7,.2,1) calc(var(--qt-i,0)*70ms),
  filter .75s cubic-bezier(.2,.7,.2,1) calc(var(--qt-i,0)*70ms),clip-path .9s cubic-bezier(.2,.7,.2,1) calc(var(--qt-i,0)*70ms)}
.qt-reveal.qt-r-left{transform:translate3d(-34px,0,0)}
.qt-reveal.qt-r-zoom{transform:translate3d(0,18px,0) scale(.95)}
.qt-reveal.qt-r-pop{transform:scale(.7)}
.qt-reveal.qt-r-blur{transform:translate3d(0,18px,0);filter:blur(8px)}
.qt-reveal.qt-r-clip{opacity:1;transform:none;clip-path:inset(0 0 100% 0)}
.qt-reveal.qt-in{opacity:1;transform:none;filter:none;clip-path:inset(0 0 0 0)}

.qt-h2{background-image:linear-gradient(90deg,var(--qt-accent),transparent);background-repeat:no-repeat;
  background-position:0 100%;background-size:0 3px;padding-bottom:.2em;
  transition:background-size .9s cubic-bezier(.2,.7,.2,1) .25s}
.qt-h2.qt-line{background-size:72px 3px}
.qt-label{background-image:linear-gradient(100deg,transparent 30%,rgba(63,184,131,.28) 50%,transparent 70%);
  background-size:250% 100%;background-position:150% 0;background-repeat:no-repeat;animation:qt-label 5.5s ease-in-out infinite}
@keyframes qt-label{0%,30%{background-position:150% 0}70%,100%{background-position:-50% 0}}

.qt-card{transition:transform .3s cubic-bezier(.2,.7,.2,1),border-color .3s ease,box-shadow .3s ease,background-position .9s ease;
  background-image:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.07) 50%,transparent 60%);
  background-size:250% 100%;background-position:150% 0;background-repeat:no-repeat}
.qt-card:hover{transform:translateY(-4px);border-color:var(--qt-accent)!important;
  box-shadow:0 14px 34px -14px rgba(63,184,131,.4);background-position:-50% 0}
.qt-chip{transition:transform .25s ease,border-color .25s ease,background-color .25s ease,color .25s ease}
.qt-chip:hover{transform:translateY(-2px);border-color:var(--qt-accent)!important}

.qt-dot{animation:qt-ping 2.4s ease-out 2}
.qt-dot.qt-live{animation:qt-ping 2.4s ease-out infinite}
@keyframes qt-ping{0%{box-shadow:0 0 0 0 rgba(63,184,131,.6)}100%{box-shadow:0 0 0 12px rgba(63,184,131,0)}}
.qt-check :is(path,polyline,circle){stroke-dasharray:70;stroke-dashoffset:70}
.qt-check.qt-draw :is(path,polyline,circle){animation:qt-draw .9s ease forwards}
@keyframes qt-draw{to{stroke-dashoffset:0}}
.qt-flow{stroke-dasharray:5 7;animation:qt-dash 1.6s linear infinite}
@keyframes qt-dash{to{stroke-dashoffset:-24}}
.qt-emoji{display:inline-block;transition:transform .35s cubic-bezier(.2,.7,.2,1)}
.qt-card:hover .qt-emoji,a:hover .qt-emoji{animation:qt-wiggle .6s ease}
@keyframes qt-wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-14deg) scale(1.15)}60%{transform:rotate(10deg) scale(1.15)}}
.qt-btn{position:relative;overflow:hidden}
.qt-ripple{position:absolute;border-radius:50%;pointer-events:none;background:rgba(63,184,131,.45);
  transform:scale(0);animation:qt-ripple .65s ease-out forwards}
@keyframes qt-ripple{to{transform:scale(1);opacity:0}}
.qt-magnet{transition:transform .25s cubic-bezier(.2,.7,.2,1)}
.qt-top{transition:transform .25s ease}
.qt-top:hover{transform:translateY(-4px)}

/* ---------- responsive ---------- */
@media (max-width:${CONFIG.mobileBreakpoint}px){
  .qt-burger{display:inline-flex}
  .qt-nav,.qt-cta{display:none!important}
  .qt-header{padding-right:calc(40px*2 + 8px + 32px)!important}
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
.topology-telemetry{background:var(--bg-tertiary,#1c2126);border:1px solid var(--border-accent,rgba(77,187,138,.3));border-left:3px solid var(--qt-accent,#3fb883);border-radius:6px;padding:12px 18px;margin-top:16px;font-family:var(--font-mono,monospace);font-size:.78rem;line-height:1.5;color:var(--text-secondary,#b6bfc9);display:flex;flex-direction:column;gap:4px;box-shadow:0 4px 16px rgba(0,0,0,.3);transition:all .25s ease}
.topology-telemetry.active{border-color:var(--qt-accent,#3fb883);box-shadow:0 0 20px rgba(63,184,131,.2)}
.telemetry-header{display:flex;align-items:center;gap:8px;color:var(--qt-accent,#3fb883);font-weight:600;letter-spacing:.08em;text-transform:uppercase}
.telemetry-dot{width:7px;height:7px;border-radius:50%;background:var(--qt-accent,#3fb883);display:inline-block;animation:qt-blink 1.5s infinite}
.telemetry-body{color:var(--text-primary,#f0ede8)}
.topology-interactive-node{cursor:pointer;transition:transform .2s ease,filter .2s ease}
.topology-interactive-node:hover rect,.topology-interactive-node.active rect{stroke:var(--qt-accent,#3fb883)!important;stroke-width:2px!important;filter:drop-shadow(0 0 8px rgba(63,184,131,.5))}
.project-filters{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px}
.project-filter-btn{font-family:var(--font-mono,monospace);font-size:.76rem;background:var(--bg-secondary,#161a1d);color:var(--text-secondary,#b6bfc9);border:1px solid var(--border-primary,#2a3038);padding:6px 14px;border-radius:4px;cursor:pointer;transition:all .2s ease}
.project-filter-btn:hover,.project-filter-btn.active{background:rgba(63,184,131,.15);border-color:var(--qt-accent,#3fb883);color:#fff}
.qt-toast{position:fixed;bottom:24px;right:24px;background:#1c2126;color:#f0ede8;border:1px solid var(--border-accent,rgba(77,187,138,.4));border-left:4px solid var(--qt-accent,#3fb883);padding:12px 20px;border-radius:6px;font-family:var(--font-mono,monospace);font-size:.82rem;box-shadow:0 12px 32px rgba(0,0,0,.6);z-index:9999;transform:translateY(40px);opacity:0;pointer-events:none;transition:all .3s cubic-bezier(.16,1,.3,1);display:flex;align-items:center;gap:10px}
.qt-toast.visible{transform:translateY(0);opacity:1}
.nav__toggle{display:none!important}
.fade-in{opacity:1!important;transform:none!important}
.contact__table-value{display:flex;align-items:center;flex-wrap:wrap;gap:8px}
.contact__copy-btn{background:rgba(255,255,255,.04);border:1px solid var(--border-primary,#2a3038);color:var(--text-secondary,#b6bfc9);cursor:pointer;padding:2px 8px;border-radius:4px;font-size:.72rem;font-family:var(--font-mono,monospace);line-height:1.4;transition:all .2s ease;display:inline-flex;align-items:center;gap:4px}
.contact__copy-btn:hover{border-color:var(--qt-accent,#3fb883);color:var(--qt-accent,#3fb883);background:rgba(63,184,131,.12)}
.qt-floating-top{position:fixed;bottom:28px;right:28px;width:46px;height:46px;border-radius:50%;background:color-mix(in srgb,var(--qt-bg,#0d0f12) 88%,transparent);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border:1px solid var(--border-accent,rgba(77,187,138,.3));box-shadow:0 8px 24px rgba(0,0,0,.5);cursor:pointer;display:grid;place-items:center;z-index:999;opacity:0;transform:translateY(16px) scale(.85);pointer-events:none;transition:opacity .3s cubic-bezier(.2,.7,.2,1),transform .3s cubic-bezier(.2,.7,.2,1),border-color .25s ease}
.qt-floating-top.visible{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}
.qt-floating-top:hover{border-color:var(--qt-accent,#3fb883);transform:translateY(-3px) scale(1.05);box-shadow:0 12px 28px rgba(63,184,131,.25)}
.qt-progress-circle{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}
.qt-top-arrow{color:var(--qt-accent,#3fb883);font-size:1.15rem;font-weight:700;line-height:1;transition:transform .25s ease}
.qt-floating-top:hover .qt-top-arrow{transform:translateY(-2px)}
.topology-interactive-node.active rect{stroke:var(--qt-accent,#3fb883)!important;stroke-width:2.2px!important;filter:drop-shadow(0 0 10px rgba(63,184,131,.6))!important}

@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  .qt-cursor,.qt-photo,.qt-photo::before,.qt-marquee__track,.qt-aurora i,.qt-sheen,.qt-label,.qt-dot,.qt-flow,.qt-hero-item,.qt-ripple{animation:none!important}
  .qt-hero-item,.qt-photo{opacity:1!important}
  .qt-reveal{opacity:1!important;transform:none!important;filter:none!important;clip-path:none!important;transition:none!important}
  .qt-check :is(path,polyline,circle){stroke-dashoffset:0!important}
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
    el.style.cursor = 'pointer';
    el.title = 'Click to replay typing animation';
    el.onclick = () => replayRole();
    el.textContent = '';
    if (S.loaded) revealRole();
  }

  const ROLES_CYCLE = [
    'Network & Security Engineer',
    'Next-Gen Firewall Architect (Fortinet · Palo Alto)',
    'Enterprise Switching & Routing Specialist (Cisco · Ruijie)',
    'Defensive Security & Incident Response (Splunk · EDR)'
  ];
  let roleCycleIdx = 0;
  let roleTimer = null;

  function revealRole() {
    if (S.revealed || !S.role) return;
    S.revealed = true;
    const { el, addCursor } = S.role;
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
    const finish = (text) => {
      visual.textContent = text;
      sr.textContent = text;
      el.setAttribute('data-qt-role', 'done');
      el.style.minHeight = '';
    };
    if (reduceMotion || !CONFIG.typeSpeedMs) { finish(ROLES_CYCLE[0]); return; }

    let isDeleting = false;
    let charIdx = 0;

    function typeLoop() {
      const currentRole = ROLES_CYCLE[roleCycleIdx];
      sr.textContent = currentRole;

      if (!isDeleting) {
        charIdx++;
        visual.textContent = currentRole.slice(0, charIdx);
        if (charIdx === currentRole.length) {
          el.setAttribute('data-qt-role', 'done');
          roleTimer = setTimeout(() => {
            isDeleting = true;
            typeLoop();
          }, 3200);
          return;
        }
        roleTimer = setTimeout(typeLoop, CONFIG.typeSpeedMs);
      } else {
        charIdx--;
        visual.textContent = currentRole.slice(0, charIdx);
        if (charIdx === 0) {
          isDeleting = false;
          roleCycleIdx = (roleCycleIdx + 1) % ROLES_CYCLE.length;
          roleTimer = setTimeout(typeLoop, 450);
          return;
        }
        roleTimer = setTimeout(typeLoop, 25);
      }
    }

    el.onclick = () => {
      clearTimeout(roleTimer);
      isDeleting = false;
      charIdx = 0;
      roleCycleIdx = (roleCycleIdx + 1) % ROLES_CYCLE.length;
      typeLoop();
    };

    const item = el.closest('.qt-hero-item');
    const idx = item ? Number(item.style.getPropertyValue('--qt-i')) || 0 : 0;
    setTimeout(typeLoop, idx * 110 + 250);
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
    if (S.tools) return;
    const wrap = document.createElement('div');
    wrap.className = 'qt-tools';
    const theme = document.createElement('button');
    theme.type = 'button';
    theme.className = 'qt-iconbtn qt-theme';
    theme.innerHTML = SUN + MOON;
    theme.addEventListener('click', toggleTheme);
    wrap.appendChild(theme);
    document.body.appendChild(wrap);
    S.tools = wrap;
    applyTheme(document.documentElement.getAttribute('data-theme') || CONFIG.defaultTheme);
  }

  function ensureBurger() {
    if (S.burger || !S.tools || !S.nav || !CONFIG.mobileMenu) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'qt-iconbtn qt-burger';
    b.setAttribute('aria-controls', 'qt-menu');
    b.setAttribute('aria-expanded', 'false');
    b.setAttribute('aria-label', 'Open menu');
    b.innerHTML = '<span></span><span></span><span></span>';
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
      a.innerHTML = '<i></i><i></i>';
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
      if (el.closest('header,.qt-menu,.qt-marquee,.qt-aurora') || el.children.length < 2 || el.children.length > 4) return;
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
    hud.innerHTML = `
      <div class="telemetry-header">
        <span class="telemetry-dot" aria-hidden="true"></span>
        <span id="telemetry-title">PALO ALTO NGFW TELEMETRY CONSOLE // STANDBY</span>
      </div>
      <div class="telemetry-body" id="telemetry-desc">
        Select or hover any network zone or security policy in the topology above to inspect verified architectural parameters.
      </div>
    `;
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
   * Certifications: Direct Link Opening & Multi-Link Chooser (Edit.md §4)
   * ------------------------------------------------------------------ */
  function setupCertModal() {
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

      const openCredential = () => {
        if (links.length === 1) {
          window.open(links[0].url, '_blank', 'noopener,noreferrer');
        } else {
          showCertChooser(card, links);
        }
      };

      card.addEventListener('click', openCredential);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openCredential();
        }
      });
    });
  }

  function showCertChooser(card, links) {
    const existing = document.getElementById('cert-chooser-overlay');
    if (existing) existing.remove();

    const title = (card.querySelector('.cert-card-clean__title') || {}).textContent || 'Choose Certificate';

    const overlay = document.createElement('div');
    overlay.id = 'cert-chooser-overlay';
    overlay.className = 'cert-chooser-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', title.trim());

    const dialog = document.createElement('div');
    dialog.className = 'cert-chooser-dialog';

    const header = document.createElement('div');
    header.className = 'cert-chooser-dialog__header';

    const titleEl = document.createElement('h3');
    titleEl.className = 'cert-chooser-dialog__title';
    titleEl.textContent = title.trim();

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'cert-chooser-dialog__close';
    closeBtn.setAttribute('aria-label', 'Close credential chooser');
    closeBtn.innerHTML = '&times;';

    header.appendChild(titleEl);
    header.appendChild(closeBtn);
    dialog.appendChild(header);

    const linksContainer = document.createElement('div');
    linksContainer.className = 'cert-chooser-dialog__links';

    links.forEach((link) => {
      const a = document.createElement('a');
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'cert-chooser-link';
      a.innerHTML = `<span>${link.label}</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
      a.addEventListener('click', () => close());
      linksContainer.appendChild(a);
    });

    dialog.appendChild(linksContainer);
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
    toast.innerHTML = `<span style="color:var(--qt-accent,#3fb883);">🛡️</span> ${message}`;
    toast.classList.add('visible');
    clearTimeout(toast.__timer);
    toast.__timer = setTimeout(() => toast.classList.remove('visible'), 2600);
  }

  function replayRole() {
    if (!S.role || !S.role.el) return;
    S.revealed = false;
    S.role.el.setAttribute('data-qt-role', 'pending');
    S.role.el.innerHTML = '';
    revealRole();
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
            if (!animId) animId = requestAnimationFrame(draw);
          } else {
            if (animId) { cancelAnimationFrame(animId); animId = null; }
          }
        });
      }, { threshold: 0.05 });
      io.observe(hero);
    } else {
      animId = requestAnimationFrame(draw);
    }
  }

  function setupHeroTelemetryTicker() {
    // Telemetry ticker removed per Edit.md
  }

  let spotlightInit = false;
  function setupCardSpotlightGlow() {
    if (spotlightInit) return;
    const cards = document.querySelectorAll(
      '.cert-card-clean, .contact-icon-btn, .education-card, .what-card, .beyond-card, .featured-project-card, .stat-card'
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
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        card.style.removeProperty('--mouse-x');
        card.style.removeProperty('--mouse-y');
      }, { passive: true });
    });
  }

  function setupFloatingProgressTop() {
    if (document.getElementById('qt-floating-top')) return;
    const btn = document.createElement('button');
    btn.id = 'qt-floating-top';
    btn.className = 'qt-floating-top';
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', 'Back to top');
    btn.title = 'Back to top';
    btn.innerHTML = `
      <svg viewBox="0 0 44 44" class="qt-progress-circle" aria-hidden="true">
        <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="3"/>
        <circle id="qt-scroll-progress" cx="22" cy="22" r="18" fill="none" stroke="var(--qt-accent, #3fb883)" stroke-width="3" stroke-dasharray="113.1" stroke-dashoffset="113.1"/>
      </svg>
      <span class="qt-top-arrow" aria-hidden="true">↑</span>
    `;
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
    injectCSS();
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
      .then(() => (document.fonts && document.fonts.ready) || null)
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
