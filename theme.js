/*!
 * theme.js v2.2.1 — pre-paint theme restore + scroll restoration.
 * Loaded synchronously in <head> (tiny) so the saved theme applies before
 * the first paint; index.js is deferred for faster parsing.
 */
(function () {
  'use strict';
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  try { window.scrollTo(0, 0); } catch (e) {}
  var t = 'dark';
  try {
    var v = localStorage.getItem('qt-theme');
    if (v === 'light' || v === 'dark') t = v;
  } catch (e) {}
  try {
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) { try { window.scrollTo(0, 0); } catch (err) {} }
    });
    window.addEventListener('load', function () { try { window.scrollTo(0, 0); } catch (err) {} });
  } catch (e) {}
  document.documentElement.setAttribute('data-theme', t);
  try {
    var m = document.querySelector('meta[name="theme-color"]');
    if (!m) { m = document.createElement('meta'); m.name = 'theme-color'; document.head.appendChild(m); }
    m.content = t === 'light' ? '#f7f9fc' : '#0d0f12';
  } catch (e) {}
})();


/* ==================================================================
 * v2.8.0 — INTERACTIVE PRELOADER
 * Created synchronously here (pre-paint, zero flash) and removed by
 * index.js when the hero entrance starts. Skipped entirely under
 * prefers-reduced-motion. CSP-safe: DOM primitives only.
 * ================================================================== */
(function () {
  'use strict';
  var reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  if (reduceMotion) return;
  if (document.getElementById('qt-loader')) return;

  var L = document.createElement('div');
  L.id = 'qt-loader';
  L.setAttribute('aria-hidden', 'true');

  /* --- نجوم متعددة الألوان (مثل شبكة الجسيمات في الموقع) --- */
  var stars = document.createElement('div');
  stars.className = 'qt-l-stars';
  var COLORS = ['#4dbb8a', '#e8d27a', '#3884ff', '#ff7847', '#f0ede8'];
  var COUNT = (window.innerWidth < 640) ? 26 : 46;
  for (var i = 0; i < COUNT; i++) {
    var st = document.createElement('span');
    st.className = 'qt-l-star';
    st.style.left = (Math.random() * 100).toFixed(2) + '%';
    st.style.top = (Math.random() * 100).toFixed(2) + '%';
    var sz = (1.5 + Math.random() * 3.5).toFixed(1);
    st.style.width = sz + 'px';
    st.style.height = sz + 'px';
    st.style.background = COLORS[i % COLORS.length];
    st.style.animationDuration = (1.6 + Math.random() * 2.6).toFixed(2) + 's';
    st.style.animationDelay = (Math.random() * 2.5).toFixed(2) + 's';
    stars.appendChild(st);
  }
  L.appendChild(stars);

  /* --- أرضية شبكية بمنظور --- */
  var grid = document.createElement('div');
  grid.className = 'qt-l-grid';
  L.appendChild(grid);

  /* --- درع الأمن السيبراني المتوهج (يُرسم ذاتيًا) --- */
  var NS = 'http://www.w3.org/2000/svg';
  var wrap = document.createElement('div');
  wrap.className = 'qt-l-shield-wrap';
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 64 64');
  svg.setAttribute('class', 'qt-l-shield');
  svg.setAttribute('aria-hidden', 'true');
  var bodyPath = document.createElementNS(NS, 'path');
  bodyPath.setAttribute('d', 'M32 10 14 17v14c0 12 8 19 18 23 10-4 18-11 18-23V17L32 10z');
  bodyPath.setAttribute('class', 'shield-body');
  var checkPath = document.createElementNS(NS, 'path');
  checkPath.setAttribute('d', 'M24 31.5l6 6 11-11');
  checkPath.setAttribute('class', 'shield-check');
  svg.appendChild(bodyPath);
  svg.appendChild(checkPath);
  wrap.appendChild(svg);
  L.appendChild(wrap);

  /* --- شريط التقدم + النسبة --- */
  var bar = document.createElement('div');
  bar.className = 'qt-l-bar';
  var fill = document.createElement('span');
  fill.className = 'qt-l-fill';
  bar.appendChild(fill);
  var pct = document.createElement('div');
  pct.className = 'qt-l-pct';
  pct.textContent = '0%';
  L.appendChild(bar);
  L.appendChild(pct);

  document.documentElement.appendChild(L);

  /* --- محرك التقدم: 0 -> 88% خلال 1.9 ثانية، الإكمال عند جاهزية الموقع --- */
  var fillEl = fill, pctEl = pct, t0 = performance.now();
  var MIN_SHOW = 1800, CAP = 4200, finished = false;
  function setP(v) {
    fillEl.style.width = v.toFixed(1) + '%';
    pctEl.textContent = Math.round(v) + '%';
  }
  function tick(now) {
    if (finished) return;
    var elapsed = Math.min(now - t0, 1900);
    var eased = 1 - Math.pow(1 - Math.min(elapsed / 1900, 1), 3);   // easeOutCubic
    setP(eased * 88);
  }
  var iv = setInterval(function () { tick(performance.now()); }, 120);
  function finish() {
    if (finished) return;
    finished = true;
    clearInterval(iv);
    setP(100);
    setTimeout(function () {
      L.classList.add('qt-l-done');
      setTimeout(function () {
        if (L.parentNode) L.parentNode.removeChild(L);
        try { delete window.qtLoaderFinish; } catch (e) {}
      }, 780);
    }, 380);
  }
  window.qtLoaderFinish = finish;
  window.addEventListener('load', function () {
    var wait = Math.max(0, MIN_SHOW - (performance.now() - t0));
    setTimeout(finish, wait);
  });
  setTimeout(finish, CAP);
})();
