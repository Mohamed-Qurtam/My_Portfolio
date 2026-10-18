# Edit.md: Portfolio tweaks (role reveal · Kaspersky EDR · looping animations)

Files in this folder:

| File | Purpose |
|---|---|
| `edit.js` | The only file you need. Vanilla JS, no dependencies; it injects its own CSS. |
| `Edit.md` | This document: what changed, why, and how to integrate it. |

> This folder is separate from the profile README `Edit.md` I made earlier. Don't overwrite one with the other.

---

## 1. What changed

| # | Request | Implementation |
|---|---|---|
| 1 | Show "Network & Security Engineer" only after the page has finished loading | The role line is emptied before first paint, then typed in after `window.load` **and** `document.fonts.ready` (+120 ms) |
| 2 | Add "Kaspersky EDR" to the tools list | A tag is cloned from the "Splunk" tag (so it keeps your styling) and inserted right after it, in the hero strip and in the Skills row. Safe to run repeatedly (no duplicates) |
| 3 | Smooth, continuous looping animations | Blinking cursor, pulsing status dot, floating photo with breathing glow, and a scrolling tools strip (details in section 4) |
| 4 | Accessibility | Screen readers hear the role text once through a polite status region; the typing animation and cursor are `aria-hidden`; loops stop under `prefers-reduced-motion`; marquee copies are `aria-hidden` + `inert`; the marquee pauses on hover and keyboard focus |

---

## 2. Where to insert the script

Because your page looks like a React/Vite build (the hero text is drawn by JavaScript after the HTML arrives), the safest spot is **one `<script defer>` tag in `index.html`**:

```html
<!-- index.html: just before </body> (or in <head>, with defer) -->
<script src="/edit.js" defer></script>
```

- Put `edit.js` in the `public/` folder (Vite/Lovable) or next to `index.html` (static site), so it is served at `/edit.js`.
- `defer` runs the script after parsing and before `DOMContentLoaded`. The script then **waits for `window.load`** before revealing the title, so you do not need to wrap anything yourself.
- A `MutationObserver` catches elements the framework renders late. It clears the role text in the same task as the render, so the text never flashes on screen. It stops watching 10 s after load.
- Not a React app? Same tag, nothing else to change.

Optional hooks (use them if auto-detection misses an element):

```html
<h2 data-role-title>NETWORK & SECURITY ENGINEER</h2>
<span data-pulse-dot></span>
<img data-hero-photo src="..." alt="...">
<div data-tools-strip> ...tags... </div>
```

---

## 3. Minimal self-contained snippets

### 3a. Title reveal after load

```html
<h2 id="role" aria-live="polite"></h2>

<script>
  window.addEventListener('load', function () {
    var el = document.getElementById('role');
    var text = 'Network & Security Engineer';
    var i = 0;
    // Respect reduced-motion: show everything at once
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = text;
      return;
    }
    (function type() {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(type, 55);
    })();
  });
</script>
```

(The full `edit.js` version avoids announcing every letter to screen readers by putting the animated copy in an `aria-hidden` span and announcing the full text once.)

### 3b. Append "Kaspersky EDR" to a tools list

```html
<script>
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-tools]').forEach(function (list) {
      var exists = Array.prototype.some.call(list.children, function (c) {
        return /kaspersky edr/i.test(c.textContent);
      });
      if (exists || !list.firstElementChild) return;
      var tag = list.firstElementChild.cloneNode(true); // copies the tag styling
      tag.textContent = 'Kaspersky EDR';
      list.appendChild(tag);
    });
  });
</script>
```

`edit.js` does the same without needing `data-tools`: it finds the "Splunk" tag, climbs to the tag wrapper, clones it, and inserts the new tag right after it.

---

## 4. Blueprint for the looping animations

| Element | Animation | Timing | Values | Why it looks smooth |
|---|---|---|---|---|
| Role cursor `\|` | Blink | `1.1s steps(1,end) infinite` | opacity 1 → 0 at 50% | Hard on/off like a real terminal cursor |
| "Open to new opportunities" dot | Pulse ring | `2s ease-in-out infinite` | scale 1 → 1.15, ring grows 0 → 7px and fades | Slow ease; the ring fades as it expands |
| Hero photo (wrapper) | Float | `6s ease-in-out infinite` | `translateY(0 → -10px → 0)` | Only `transform` is animated, so it runs on the GPU |
| Hero photo (image) | Glow breathing | `5s ease-in-out infinite` | `drop-shadow` 10px/10% → 22px/30% | 6s vs 5s lengths drift apart, so the loop never looks mechanical |
| Tools strip | Marquee | `40s linear infinite` | `translateX(0 → -50%)` across two identical groups | Linear easing and a duplicated group give a seamless wrap; pauses on hover/focus |

CSS core (already injected by `edit.js`):

```css
.qt-cursor { animation: qt-blink 1.1s steps(1, end) infinite; }
@keyframes qt-blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }

.qt-float  { animation: qt-float 6s ease-in-out infinite; }
@keyframes qt-float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }

.qt-marquee__track { display: flex; width: max-content;
  animation: qt-marquee 40s linear infinite; }
@keyframes qt-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }

@media (prefers-reduced-motion: reduce) {
  .qt-cursor, .qt-pulse, .qt-float, .qt-glow, .qt-marquee__track { animation: none !important; }
}
```

Tuning: change `marqueeDurationS` (bigger = slower), or edit the `6s` / `5s` / `2s` values in the `CSS` string at the top of `edit.js`.

---

## 5. Usage and integration steps

1. Copy `edit.js` into `public/` (or beside `index.html`).
2. Add `<script src="/edit.js" defer></script>` before `</body>`.
3. Open the page with the cache disabled and check:
   - The role line is empty at first, then types in after the page loads.
   - "Kaspersky EDR" appears right after "Splunk" in the hero strip and in the Skills row.
   - The cursor blinks, the dot pulses, the photo floats, and the strip scrolls.
4. In DevTools, turn on **Rendering → Emulate prefers-reduced-motion: reduce** and reload. Everything should appear instantly with no loops.
5. Optional: set `setDocumentTitle: true` in `CONFIG` if you also want the browser-tab title set after load. It is off by default because search engines and link previews read the title from the raw HTML.

### Troubleshooting

| Symptom | Fix |
|---|---|
| Two cursors | Set `addCursor: false` in `CONFIG` (the site already draws one) |
| Role line not found | Add `data-role-title` to that element |
| Strip scrolls but looks cramped or too fast | Raise `marqueeDurationS`, or set `marquee: false` |
| Strip breaks after a React re-render | Set `marquee: false`; the strip is static in your hero so this is unlikely |
| Photo does not float | Add `data-hero-photo` to the `<img>` |
| After a client-side route change | Call `window.qtEdit.run()` |

---

## 6. Changelog

- **Added** `edit.js` (single file, no dependencies, injects its own CSS).
- **Changed** the hero role line to render only after full page load and web fonts are ready, with a typing reveal and a screen-reader-friendly announcement.
- **Added** "Kaspersky EDR" to the tools list after "Splunk" (hero strip and Skills row), idempotent.
- **Added** looping animations: cursor blink 1.1s, status-dot pulse 2s, photo float 6s + glow 5s, tools marquee 40s.
- **Added** reduced-motion handling: no loops, instant reveal.

---

## 7. Compatibility notes

- Modern browsers (Chrome/Edge/Firefox/Safari from about 2020). Uses `MutationObserver`, `Promise`, CSS variables and `inert`; no IE support.
- No backend changes and no third-party code.
- I checked the file's syntax and ran it in a simulated DOM (role empty before load, then typed; Kaspersky EDR added once per list with no duplicates on re-run). I haven't tested it on your live page, so check the visual items in step 3, since selectors depend on your real markup.
