/* =====================================================================
   Vaporwave / Outrun — progressive enhancement only.
   Without JS the page is fully visible & readable. Without motion
   preference, reveals + counters resolve to their final state instantly.
   ===================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  var reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  /* ---- current year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- counters (final value already in HTML as fallback) ---- */
  function runCounter(el) {
    var to = parseFloat(el.getAttribute("data-count-to"));
    var from = parseFloat(el.getAttribute("data-count-from")) || 0;
    if (isNaN(to)) return;
    var dur = 1100;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(from + (to - from) * eased));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = String(to);
    }
    requestAnimationFrame(step);
  }

  /* ---- reveal-on-scroll + lazy counters ---- */
  var revealEls = [].slice.call(document.querySelectorAll(".reveal"));
  function showAll() {
    for (var i = 0; i < revealEls.length; i++) revealEls[i].classList.add("is-visible");
  }

  // The whole reveal pipeline is wrapped so that ANY failure falls back to
  // showing every element — content must never be left hidden behind .js.
  try {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      // Show everything; counters keep their HTML final value.
      showAll();
    } else {
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          el.classList.add("is-visible");
          try {
            var counters = el.querySelectorAll("[data-count-to]");
            for (var i = 0; i < counters.length; i++) runCounter(counters[i]);
          } catch (e) { /* final value already in HTML */ }
          obs.unobserve(el);
        });
      }, { rootMargin: "0px 0px -10% 0px", threshold: 0.15 });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  } catch (e) {
    showAll();
  }

  /* ---- active nav link via scroll spy (decorative; isolated) ---- */
  try {
    var navLinks = [].slice.call(document.querySelectorAll(".nav__links a"));
    var sections = navLinks
      .map(function (a) { return document.querySelector(a.getAttribute("href")); })
      .filter(Boolean);

    if (sections.length && "IntersectionObserver" in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          navLinks.forEach(function (a) {
            a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
          });
        });
      }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
      sections.forEach(function (s) { spy.observe(s); });
    }
  } catch (e) { /* nav highlighting is purely cosmetic */ }

  /* ---- subtle scroll parallax on the hero sun (motion only; isolated) ---- */
  if (!reduceMotion) {
    try {
      var sun = document.querySelector(".scene__sun");
      var stars = document.querySelector(".scene__stars");
      var ticking = false;
      window.addEventListener("scroll", function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var y = window.scrollY || 0;
          if (y < window.innerHeight * 1.2) {
            if (sun) sun.style.transform = "translate(-50%, " + (50 + y * 0.04) + "%)";
            if (stars) stars.style.transform = "translateY(" + (y * 0.06) + "px)";
          }
          ticking = false;
        });
      }, { passive: true });
    } catch (e) { /* parallax is purely cosmetic */ }
  }
})();
