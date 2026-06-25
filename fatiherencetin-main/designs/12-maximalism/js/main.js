/* ==========================================================================
   FATİH EREN ÇETİN — Maximalism
   Enhancement-only JS. Every section is fully visible without this file.
   Nothing important is gated behind any effect.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ----------------------------------------------------------------------
     1) SCROLL REVEAL — opt-in, fail-safe.
     Only hide-then-reveal when motion is allowed AND IntersectionObserver
     exists. If anything throws, we never leave content hidden.
     ---------------------------------------------------------------------- */
  (function setupReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) return; // stay visible
    var nodes = document.querySelectorAll('.reveal');
    if (!nodes.length) return;
    try {
      root.classList.add('anim'); // CSS now hides .reveal until .is-in
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            obs.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      nodes.forEach(function (n) { io.observe(n); });
    } catch (err) {
      // Failsafe: reveal everything if observer setup fails.
      root.classList.remove('anim');
      nodes.forEach(function (n) { n.classList.add('is-in'); });
    }
  })();

  /* ----------------------------------------------------------------------
     2) CUSTOM CURSOR — decorative, fine-pointer + motion only.
     Inner dot tracks exactly (precise clicks); ring lags slightly.
     ---------------------------------------------------------------------- */
  (function setupCursor() {
    if (reduceMotion || !finePointer) return;
    var cursor = document.querySelector('.cursor');
    if (!cursor) return;
    var dot = cursor.querySelector('.cursor__dot');
    var ring = cursor.querySelector('.cursor__ring');
    if (!dot || !ring) return;

    root.classList.add('cursor-on');

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my, raf = null;

    function onMove(e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      if (!raf) raf = requestAnimationFrame(loop);
    }
    function loop() {
      rx += (mx - rx) * 0.2;
      ry += (my - ry) * 0.2;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      if (Math.abs(mx - rx) > 0.4 || Math.abs(my - ry) > 0.4) {
        raf = requestAnimationFrame(loop);
      } else { raf = null; }
    }
    window.addEventListener('mousemove', onMove, { passive: true });

    // grow over interactive targets
    var grow = 'a,button,[data-cursor],.tool,.taglist li,.sticker,.statblock,.proj';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(grow)) root.classList.add('cursor-grow');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(grow)) root.classList.remove('cursor-grow');
    });
    document.addEventListener('mouseleave', function () {
      cursor.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function () {
      cursor.style.opacity = '1';
    });
  })();

  /* ----------------------------------------------------------------------
     3) HERO PARALLAX — depth layers drift with pointer. Decorative only.
     ---------------------------------------------------------------------- */
  (function setupParallax() {
    if (reduceMotion || !finePointer) return;
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var layers = hero.querySelectorAll('[data-depth]');
    if (!layers.length) return;

    var tx = 0, ty = 0, raf = null;
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });
    hero.addEventListener('mouseleave', function () {
      tx = 0; ty = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    });

    function apply() {
      raf = null;
      for (var i = 0; i < layers.length; i++) {
        var d = parseFloat(layers[i].getAttribute('data-depth')) || 0;
        var dx = (-tx * d * 100).toFixed(2);
        var dy = (-ty * d * 100).toFixed(2);
        // Use the independent `translate` property so CSS `transform: rotate()`
        // on the photo and stickers is preserved (no clobbering).
        layers[i].style.translate = dx + 'px ' + dy + 'px';
      }
    }
  })();

  /* ----------------------------------------------------------------------
     4) Smooth-scroll already handled by CSS; just close any focus oddities.
     Active nav link highlight (progressive, optional).
     ---------------------------------------------------------------------- */
  (function setupActiveNav() {
    if (!('IntersectionObserver' in window)) return;
    var sections = document.querySelectorAll('main section[id]');
    var links = {};
    document.querySelectorAll('.nav__links a[href^="#"]').forEach(function (a) {
      links[a.getAttribute('href').slice(1)] = a;
    });
    if (!sections.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = links[e.target.id];
        if (!a) return;
        if (e.isIntersecting) a.setAttribute('data-active', 'true');
        else a.removeAttribute('data-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  })();

})();
