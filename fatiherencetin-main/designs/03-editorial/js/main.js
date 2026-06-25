/* One orchestrated moment: a staggered settle of the hero on load.
   Content is fully visible without JS; this only adds the entrance.
   Honors prefers-reduced-motion (the CSS never hides content there). */
(function () {
  "use strict";

  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var reveals = Array.prototype.slice.call(
    document.querySelectorAll(".reveal")
  );

  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) {
      el.classList.add("is-in");
    });
    return;
  }

  // Trigger on the next frame so the initial hidden state paints first.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      reveals.forEach(function (el) {
        el.classList.add("is-in");
      });
    });
  });

  // Safety net: if delays/transitions are interrupted, force-show after 2s.
  window.setTimeout(function () {
    reveals.forEach(function (el) {
      el.classList.add("is-in");
    });
  }, 2000);
})();
