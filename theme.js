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
  document.documentElement.setAttribute('data-theme', t);
  try {
    var m = document.querySelector('meta[name="theme-color"]');
    if (!m) { m = document.createElement('meta'); m.name = 'theme-color'; document.head.appendChild(m); }
    m.content = t === 'light' ? '#f7f9fc' : '#0d0f12';
  } catch (e) {}
})();
