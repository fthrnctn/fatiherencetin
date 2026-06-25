/* ============================================================
   Fatih Eren Çetin — Swiss style
   Minimal, precise motion: reveal-on-scroll + count-up numerals.
   Everything degrades to fully-visible content with no JS and
   under prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var supportsIO = "IntersectionObserver" in window;

  /* ---------- 1. Reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal]")
  );

  function revealAll() {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  if (reduceMotion || !supportsIO) {
    // No motion / no observer: make everything visible immediately.
    revealAll();
  } else {
    // Safety net: if observer setup throws, nothing stays hidden.
    try {
      var revealIO = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
      );
      revealEls.forEach(function (el) {
        revealIO.observe(el);
      });
    } catch (e) {
      revealAll();
    }
  }

  /* ---------- 2. Count-up numerals (once) ---------- */
  var numEls = Array.prototype.slice.call(
    document.querySelectorAll("[data-count]")
  );

  function formatNum(value, decimals) {
    return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
  }

  function animateNumber(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var from = parseFloat(el.getAttribute("data-from") || "0");
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";

    if (isNaN(target)) return;

    // Static target already present in the HTML — only animate the delta.
    if (target === from) {
      el.textContent = formatNum(target, decimals) + suffix;
      return;
    }

    var duration = 1100;
    var start = null;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var current = from + (target - from) * easeOutCubic(p);
      el.textContent = formatNum(current, decimals) + suffix;
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = formatNum(target, decimals) + suffix;
      }
    }

    el.textContent = formatNum(from, decimals) + suffix;
    requestAnimationFrame(step);
  }

  if (!reduceMotion && supportsIO) {
    var numIO = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateNumber(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    numEls.forEach(function (el) {
      numIO.observe(el);
    });
  }
  // Else: leave the final values already rendered in the HTML untouched.

  /* ---------- 3. Active section in nav (subtle) ---------- */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".nav a[href^='#']")
  );
  var linkById = {};
  navLinks.forEach(function (a) {
    linkById[a.getAttribute("href").slice(1)] = a;
  });

  if (supportsIO && navLinks.length) {
    var sectionIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = linkById[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) {
              l.removeAttribute("aria-current");
            });
            link.setAttribute("aria-current", "true");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    Object.keys(linkById).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) sectionIO.observe(sec);
    });
  }
})();
