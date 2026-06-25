/* Neobrutalism portfolio — progressive enhancement only.
   Nothing here gates content: the page is fully readable with JS disabled. */
(function () {
  "use strict";

  /* Footer year stamp (decorative). */
  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  /* Portrait fallback — if the JPG fails to load (404/offline), replace the
     broken <img> with an initials block so the hero never shows a broken-image
     glyph. With JS off, the <img>'s alt text is shown instead. No content gated. */
  var portrait = document.querySelector(".photo img");
  if (portrait) {
    portrait.addEventListener("error", function () {
      if (portrait.dataset.fallbackDone) return;
      portrait.dataset.fallbackDone = "1";
      var fb = document.createElement("div");
      fb.className = "photo__fallback";
      fb.setAttribute("role", "img");
      fb.setAttribute("aria-label", portrait.alt || "Fatih Eren Çetin");
      fb.textContent = "FEÇ";
      if (portrait.parentNode) portrait.parentNode.insertBefore(fb, portrait);
      portrait.remove();
    });
  }

  /* Active-nav highlighting — purely cosmetic, no content hidden. */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav__links a[href^="#"]')
  );
  var sections = navLinks
    .map(function (a) {
      var el = document.getElementById(a.getAttribute("href").slice(1));
      return el ? { link: a, el: el } : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var current = null;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var match = sections.find(function (s) {
              return s.el === entry.target;
            });
            if (match) {
              if (current) {
                current.classList.remove("is-active");
                current.removeAttribute("aria-current");
              }
              match.link.classList.add("is-active");
              match.link.setAttribute("aria-current", "true");
              current = match.link;
            }
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      io.observe(s.el);
    });
  }
})();
