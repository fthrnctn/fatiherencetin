/* ============================================================
   CYBERPUNK / HUD — progressive enhancement only.
   All content is present & visible without JS. This script
   only adds atmosphere, count-ups, glitch-on-enter, scrollspy.
   Everything respects prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- decorative clock readout ---------- */
  var clock = document.getElementById('rail-clock');
  if (clock) {
    var tick = function () {
      var d = new Date();
      var p = function (n) { return (n < 10 ? '0' : '') + n; };
      clock.textContent = p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
    };
    tick();
    if (!reduce) setInterval(tick, 1000);
  }

  /* ---------- decorative ambient ticker jitter (obviously fake) ---------- */
  if (!reduce) {
    var tToks = document.getElementById('t-toks');
    var tUp = document.getElementById('t-up');
    setInterval(function () {
      if (document.hidden) return;
      if (tToks) tToks.textContent = (170 + Math.random() * 60).toFixed(1);
      if (tUp) tUp.textContent = (99.9 + Math.random() * 0.09).toFixed(2) + '%';
    }, 1400);
  }

  /* ---------- count-up for verified metrics ---------- */
  function countUp(el) {
    var to = parseInt(el.getAttribute('data-to'), 10);
    if (isNaN(to)) return;
    if (reduce) { el.textContent = String(to); return; }
    var start = null, dur = 1100;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(to * eased));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = String(to);
    }
    requestAnimationFrame(step);
  }

  /* ---------- gauge fill animation (default markup already correct) ---------- */
  function fillGauge(path) {
    if (reduce) return;
    var len = parseFloat(path.getAttribute('data-len'));
    var fill = parseFloat(path.getAttribute('data-fill'));
    if (!len || !fill) return;
    path.style.transition = 'none';
    path.style.strokeDasharray = fill + ' ' + len;
    path.style.strokeDashoffset = fill; // empty
    // force reflow then animate
    void path.getBoundingClientRect();
    path.style.transition = 'stroke-dashoffset 1.3s cubic-bezier(.2,.7,.2,1)';
    path.style.strokeDashoffset = '0';
  }

  /* ---------- one-shot glitch ---------- */
  function glitchOnce(el) {
    if (reduce) return;
    el.classList.add('is-glitch');
    setTimeout(function () { el.classList.remove('is-glitch'); }, 480);
  }

  /* ---------- reveal + section enter ---------- */
  var revealEls = [];
  if (!reduce) {
    /* NOTE: hero panels/gauge are intentionally excluded — they are the
       signature verified metrics and must never be hidden/flash on first
       paint. Their count-up + gauge fill run via a dedicated observer below. */
    var sel = '.about, .clearances, .log__row, .mission, .cap, .creds, .comms';
    revealEls = Array.prototype.slice.call(document.querySelectorAll(sel));
    revealEls.forEach(function (el) { el.classList.add('reveal'); });
  }

  if (hasIO) {
    /* reveal observer */
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          ro.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { ro.observe(el); });

    /* metrics fire-once observer */
    var fired = false;
    var mo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !fired) {
          fired = true;
          document.querySelectorAll('.num[data-to]').forEach(countUp);
          var gv = document.querySelector('.gauge__value');
          if (gv) fillGauge(gv);
          mo.disconnect();
        }
      });
    }, { threshold: 0.3 });
    var hero = document.getElementById('hero');
    if (hero) mo.observe(hero);

    /* glitch headings on enter */
    var go = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { glitchOnce(e.target); go.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.module__title.glitch').forEach(function (el) { go.observe(el); });

    /* scrollspy for rail nav */
    var links = {};
    document.querySelectorAll('.rail__nav a').forEach(function (a) {
      links[a.getAttribute('href').slice(1)] = a;
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = links[e.target.id];
        if (!a) return;
        if (e.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].removeAttribute('aria-current'); });
          a.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    ['about', 'work', 'projects', 'stack', 'contact'].forEach(function (id) {
      var s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  } else {
    /* no IntersectionObserver: just resolve final values, nothing hidden */
    document.querySelectorAll('.num[data-to]').forEach(function (el) {
      el.textContent = el.getAttribute('data-to');
    });
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- hero name auto-glitch on load (single, restrained) ---------- */
  var heroName = document.querySelector('.hero__name[data-glitch="auto"]');
  if (heroName && !reduce) {
    setTimeout(function () { glitchOnce(heroName); }, 650);
  }

  /* ============================================================
     ambient canvas — drifting data motes + scan blips (decorative)
     ============================================================ */
  var canvas = document.getElementById('fx-canvas');
  if (canvas && canvas.getContext && !reduce) {
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var motes = [];
    var COLORS = ['56,225,201', '139,224,78', '200,107,255'];

    function resize() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var target = Math.min(64, Math.floor((W * H) / 22000));
      motes = [];
      for (var i = 0; i < target; i++) motes.push(newMote());
    }
    function newMote() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -0.12 - Math.random() * 0.28,
        r: Math.random() < 0.12 ? 1.6 : 0.9,
        a: 0.12 + Math.random() * 0.4,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        ph: Math.random() * Math.PI * 2
      };
    }
    var t = 0, raf = null;
    function frame() {
      t += 0.016;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        m.x += m.vx; m.y += m.vy;
        if (m.y < -6) { m.y = H + 6; m.x = Math.random() * W; }
        if (m.x < -6) m.x = W + 6; else if (m.x > W + 6) m.x = -6;
        var tw = m.a * (0.6 + 0.4 * Math.sin(t * 2 + m.ph));
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + m.c + ',' + tw.toFixed(3) + ')';
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf) raf = requestAnimationFrame(frame); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt); rt = setTimeout(resize, 180);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });
    resize();
    start();
  }
})();
