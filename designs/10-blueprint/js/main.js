/* ============================================================================
   Blueprint — progressive enhancement only.
   Everything works with JS disabled: content is fully visible, links live,
   schematic is drawn via CSS. JS adds the sheet toggle, a count-up on the
   key metric, and a one-time replay of the line-draw when the hero enters view.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- SHEET TOGGLE (blueprint <-> whiteprint) ---------- */
  var toggle = document.getElementById('sheet-toggle');
  var STORE = 'few-sheet-mode';

  function applyMode(mode) {
    root.setAttribute('data-sheet', mode);
    if (toggle) toggle.setAttribute('aria-pressed', String(mode === 'white'));
  }

  try {
    var saved = localStorage.getItem(STORE);
    if (saved === 'white' || saved === 'blue') applyMode(saved);
  } catch (e) { /* storage unavailable — keep default */ }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-sheet') === 'white' ? 'blue' : 'white';
      applyMode(next);
      try { localStorage.setItem(STORE, next); } catch (e) {}
    });
  }

  /* ---------- COUNT-UP ON THE AMBER METRIC (43 -> 86) ----------
     Writes only into a dedicated text node — never innerHTML — so the
     "%" unit span is preserved and there is no markup-injection surface. */
  function countUp(textNode, from, to, dur) {
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var cur = Math.round(from + (to - from) * eased);
      textNode.nodeValue = from + '→' + cur;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- COUNT-UP THE AMBER METRIC WHEN IT ENTERS VIEW ----------
     The CSS line-draw already plays on load (no JS needed); here we only
     animate the headline number. Final value is in the HTML, so disabling
     JS or reduced-motion simply shows the static "43→86%". */
  var amberVal = document.querySelector('.dim--amber .dim__val');
  var amberText = amberVal ? amberVal.firstChild : null; // text node before .dim__unit

  if ('IntersectionObserver' in window && amberText && amberText.nodeType === 3 && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          amberText.nodeValue = '43→43';
          countUp(amberText, 43, 86, 900);
          io.disconnect();
        }
      });
    }, { threshold: 0.6 });
    io.observe(amberVal);
  }

  /* ---------- SCROLL-SPY: highlight current nav item ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = '#' + entry.target.id;
          navLinks.forEach(function (a) {
            var active = a.getAttribute('href') === id;
            a.style.color = active ? 'var(--ink)' : '';
            a.style.borderColor = active ? 'var(--hair)' : '';
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }
})();
