/* ar.js — Arabic page overrides for JS-generated strings.
   Loaded deferred AFTER index.js; window.qtIndex.config is the live CONFIG
   object, so mutating it before DOMContentLoaded (defer runs before that)
   is safe and picked up by the role/typewriter and all dynamic builders. */
(function () {
  'use strict';
  if (!window.qtIndex || !window.qtIndex.config) return;
  var C = window.qtIndex.config;
  window.__arBootAt = Math.round(performance.now());
  C.roleText = 'مهندس شبكات وأمن سيبراني';

  /* The dynamic strings live inside index.js closures; override at the DOM
     level with a Mutation-free micro-patch: rebind textContent after builders
     run by hooking the same events index.js uses (DOMContentLoaded + load). */
  var STR = {
    'Open menu': 'فتح القائمة',
    'Close menu': 'إغلاق القائمة',
    'Back to top': 'العودة للأعلى',
    '\u2191 Top': '\u2191 للأعلى',
    'Show all 30 credentials': 'عرض جميع الاعتمادات (٣٠)',
    'Show featured six only': 'عرض الست المميزة فقط',
    '+24': '+\u0662\u0664',
    '\u221224': '\u2212\u0662\u0664',
    'Copy Verification Link': 'نسخ رابط التوثيق',
    'Verify Official Credential \u2197': 'توثيق الاعتماد الرسمي \u2197',
    'Cisco Black Belt Academy \u00b7 Verified': 'أكاديمية Cisco Black Belt · موثّق',
    'Copied!': 'تم النسخ!'
  };

  function translate(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var t = n.nodeValue.trim();
        if (!t) return NodeFilter.FILTER_REJECT;
        return STR[t] ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      n.nodeValue = STR[n.nodeValue.trim()];
    });
    // aria-labels + titles on dynamically created elements
    root.querySelectorAll('[aria-label], [title]').forEach(function (el) {
      var v = el.getAttribute('aria-label');
      if (v && STR[v]) el.setAttribute('aria-label', STR[v]);
      var t = el.getAttribute('title');
      if (t && STR[t]) el.setAttribute('title', STR[t]);
    });
  }

  function run() { translate(document.body); }
  function boot() {
    run();
    /* index.js's typed reveal can fire before this deferred script (fonts.ready
       race); replay it now that CONFIG.roleText is Arabic. */
    setTimeout(function () {
      try { if (window.qtIndex && window.qtIndex.replayRole) window.qtIndex.replayRole(); } catch (e) {}
    }, 80);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
  // modal builders run on click — re-translate after any click settles
  document.addEventListener('click', function () { setTimeout(run, 60); }, { passive: true });
})();
