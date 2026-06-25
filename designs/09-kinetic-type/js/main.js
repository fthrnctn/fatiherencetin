/* ============================================================
   Kinetic / Variable Typography — interaction layer
   - Token-by-token "generation" of the thesis (weight ramps in)
   - Hover "re-sample": axis jitter then settle (temperature feel)
   - Live temperature slider morphs the headline's sampling spread
   - Scroll maps progress -> weight/width on section headings
   - Oversized metrics count up
   CRITICAL: every effect is additive. No content is gated behind it.
   No-JS  -> CSS shows final, full-weight type + the real photo.
   Reduced-motion -> resolved type, no animation. Slider still usable.
   ============================================================ */
(function () {
  "use strict";

  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- math helpers ---------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function rnd() { return Math.random() * 2 - 1; } // -1..1

  function setAxes(el, w, wd, sl, gr) {
    el.style.setProperty("--w", w.toFixed(1));
    el.style.setProperty("--wd", wd.toFixed(1));
    el.style.setProperty("--sl", sl.toFixed(2));
    el.style.setProperty("--gr", (gr || 0).toFixed(1));
  }
  function cssNum(el, name, fallback) {
    var v = parseFloat(getComputedStyle(el).getPropertyValue(name));
    return isNaN(v) ? fallback : v;
  }

  /* ---------- hover re-sample (axis jitter, settle to rest) ---------- */
  function attachHover(word) {
    word.addEventListener("pointerenter", function () {
      if (mqReduce.matches || word._jit) return;
      word._jit = true;
      var rest = word._rest();
      var start = performance.now();
      var dur = 460;
      (function frame(now) {
        var t = clamp((now - start) / dur, 0, 1);
        if (t < 1) {
          var decay = 1 - t;
          setAxes(
            word,
            clamp(rest[0] + rnd() * 320 * decay, 120, 950),
            clamp(rest[1] + rnd() * 34 * decay, 60, 150),
            clamp(rest[2] - Math.random() * 11 * decay, -10, 0),
            0
          );
          requestAnimationFrame(frame);
        } else {
          setAxes(word, rest[0], rest[1], rest[2], 0);
          word._jit = false;
        }
      })(performance.now());
    });
  }

  /* ---------- prepare a thesis: cache bases + seeds ---------- */
  function prepare(container, restFactory) {
    var words = Array.prototype.slice.call(container.querySelectorAll(".kt-word"));
    words.forEach(function (w) {
      w._base = cssNum(w, "--w", 660);
      w._wdBase = cssNum(w, "--wd", 100);
      w._s1 = rnd(); w._s2 = rnd(); w._s3 = rnd();
      w._rest = function () { return restFactory(w); };
      attachHover(w);
    });
    return words;
  }

  /* ---------- token-by-token generation ---------- */
  function generate(container, words) {
    if (mqReduce.matches) {
      // resolved state, no animation
      words.forEach(function (w) { var r = w._rest(); setAxes(w, r[0], r[1], r[2], 0); w.style.opacity = "1"; });
      container.removeAttribute("data-pending");
      return;
    }
    container.setAttribute("data-pending", "");
    words.forEach(function (w) { w.style.opacity = "0"; setAxes(w, 150, 62, 0, -120); });
    void container.offsetWidth; // reflow lock-in

    var stagger = 72, dur = 600;
    var startedAt = performance.now();

    words.forEach(function (w, i) {
      var delay = i * stagger;
      (function frame(now) {
        var t = clamp((now - startedAt - delay) / dur, 0, 1);
        if (t <= 0) { requestAnimationFrame(frame); return; }
        var e = easeOut(t);
        w.style.opacity = e.toFixed(3);
        var r = w._rest();
        setAxes(w, lerp(150, r[0], e), lerp(62, r[1], e), lerp(0, r[2], e), lerp(-120, 0, e));
        if (t < 1) requestAnimationFrame(frame);
        else {
          w.style.opacity = "1";
          var rr = w._rest(); setAxes(w, rr[0], rr[1], rr[2], 0);
          if (i === words.length - 1) container.removeAttribute("data-pending");
        }
      })(performance.now());
    });

    // failsafe: never leave content hidden
    setTimeout(function () {
      container.removeAttribute("data-pending");
      words.forEach(function (w) { w.style.opacity = "1"; });
    }, (words.length - 1) * stagger + dur + 500);
  }

  /* ---------- quick re-roll animation (for resample button) ---------- */
  function reroll(words) {
    words.forEach(function (w) { w._s1 = rnd(); w._s2 = rnd(); w._s3 = rnd(); });
    if (mqReduce.matches) { words.forEach(function (w) { var r = w._rest(); setAxes(w, r[0], r[1], r[2], 0); }); return; }
    var start = performance.now(), dur = 520;
    words.forEach(function (w) {
      (function frame(now) {
        var t = clamp((now - start) / dur, 0, 1);
        var rest = w._rest();
        if (t < 1) {
          var decay = 1 - t;
          setAxes(w,
            clamp(rest[0] + rnd() * 280 * decay, 120, 950),
            clamp(rest[1] + rnd() * 30 * decay, 60, 150),
            clamp(rest[2] - Math.random() * 9 * decay, -10, 0), 0);
          requestAnimationFrame(frame);
        } else { setAxes(w, rest[0], rest[1], rest[2], 0); }
      })(performance.now());
    });
  }

  /* ============================================================
     HERO THESIS + temperature control
     ============================================================ */
  var heroThesis = document.getElementById("thesis");
  var heroWords = [];
  var temp = 0.18; // 0..1

  function heroRest(w) {
    var W = clamp(w._base + w._s1 * temp * 360, 120, 950);
    var WD = clamp(w._wdBase + w._s2 * temp * 42, 62, 150);
    var SL = clamp(-Math.abs(w._s3) * temp * 10, -10, 0);
    return [W, WD, SL];
  }
  function applyTemp() { heroWords.forEach(function (w) { var r = w._rest(); setAxes(w, r[0], r[1], r[2], 0); }); }

  if (heroThesis) {
    heroWords = prepare(heroThesis, heroRest);

    var controls = document.querySelector("[data-controls]");
    var slider = document.getElementById("temp");
    var readout = document.getElementById("temp-val");
    var resampleBtn = document.getElementById("resample");

    if (controls) controls.hidden = false; // reveal only when JS present

    function syncSlider() {
      var pct = parseFloat(slider.value);
      temp = clamp(pct / 100, 0, 1);
      slider.style.setProperty("--fill", pct + "%");
      if (readout) readout.textContent = temp.toFixed(2);
    }

    if (slider) {
      syncSlider();
      slider.addEventListener("input", function () { syncSlider(); applyTemp(); });
    }
    if (resampleBtn) {
      resampleBtn.addEventListener("click", function () {
        resampleBtn.classList.add("is-spin");
        setTimeout(function () { resampleBtn.classList.remove("is-spin"); }, 520);
        reroll(heroWords);
      });
    }

    // Pre-hide BEFORE fonts resolve, so the headline never flashes full-weight then blanks.
    // (Reduced-motion is left fully visible; generate() just resolves it with no animation.)
    if (!mqReduce.matches) {
      heroThesis.setAttribute("data-pending", "");
      heroWords.forEach(function (w) { w.style.opacity = "0"; setAxes(w, 150, 62, 0, -120); });
    }

    // run generation once fonts are ready (so weights animate on the real face)
    var startHero = function () { generate(heroThesis, heroWords); };
    if (document.fonts && document.fonts.ready) {
      // settle on EITHER outcome so a rejected fonts promise can never strand hidden text
      Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 1200); })]).then(startHero, startHero);
    } else { startHero(); }

    // Hard failsafe: the hero headline must NEVER stay hidden, whatever happens above.
    setTimeout(function () {
      if (!heroThesis.hasAttribute("data-pending")) return; // generation already resolved it
      heroThesis.removeAttribute("data-pending");
      heroWords.forEach(function (w) { w.style.opacity = "1"; var r = w._rest(); setAxes(w, r[0], r[1], r[2], 0); });
    }, 3200);
  }

  /* ============================================================
     CONTACT BIG TYPE — generate when scrolled into view
     ============================================================ */
  var contactBig = document.getElementById("contact-h");
  if (contactBig) {
    var contactWords = prepare(contactBig, function (w) { return [w._base, w._wdBase, 0]; });
    var fired = false;
    var runContact = function () { if (fired) return; fired = true; generate(contactBig, contactWords); };
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { runContact(); cio.disconnect(); } });
      }, { threshold: 0.35 });
      cio.observe(contactBig);
    } else { runContact(); }
  }

  /* ============================================================
     SCROLL -> variable axis on section headings
     ============================================================ */
  var headings = Array.prototype.slice.call(document.querySelectorAll("[data-axis-scroll]"));
  function updateHeadings() {
    if (mqReduce.matches) return;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var top = vh * 0.92, bottom = vh * 0.32;
    for (var i = 0; i < headings.length; i++) {
      var h = headings[i], r = h.getBoundingClientRect();
      if (r.bottom < -60 || r.top > vh + 60) continue;
      var p = clamp((top - r.top) / (top - bottom), 0, 1);
      h.style.setProperty("--w", lerp(250, 840, p).toFixed(1));
      h.style.setProperty("--wd", lerp(86, 108, p).toFixed(1));
    }
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { updateHeadings(); ticking = false; });
  }
  if (!mqReduce.matches) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    updateHeadings();
  }

  /* ============================================================
     METRICS COUNT-UP
     ============================================================ */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  function runCount(el) {
    var from = parseFloat(el.dataset.from || "0");
    var to = parseFloat(el.dataset.to || "0");
    var dec = parseInt(el.dataset.decimals || "0", 10);
    var suffix = el.dataset.suffix || "";
    if (mqReduce.matches || from === to) { el.textContent = to.toFixed(dec) + suffix; return; }
    var dur = 1100, start = performance.now();
    (function frame(now) {
      var t = clamp((now - start) / dur, 0, 1);
      el.textContent = lerp(from, to, easeOut(t)).toFixed(dec) + suffix;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = to.toFixed(dec) + suffix;
    })(performance.now());
  }
  if ("IntersectionObserver" in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { runCount(en.target); sio.unobserve(en.target); } });
    }, { threshold: 0.45 });
    counters.forEach(function (c) { sio.observe(c); });
  } else {
    counters.forEach(runCount);
  }

  /* keep the resting state correct if the user toggles reduced-motion live */
  if (mqReduce.addEventListener) {
    mqReduce.addEventListener("change", function () { if (heroWords.length) applyTemp(); });
  }
})();
