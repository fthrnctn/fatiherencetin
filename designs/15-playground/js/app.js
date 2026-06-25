/* =============================================================================
   app.js — progressive enhancement over the static, no-JS-safe HTML.
   - Sets the year in the footer.
   - Adds a keyboard-accessible tag filter for Selected Work, driven by the
     real project data in window.CV (the static cards remain the source of
     truth and stay fully visible if this code never runs).
   - Smooth in-page nav with reduced-motion respect.
   No frameworks. No network calls.
   ============================================================================= */
(function () {
  "use strict";

  const CV = window.CV || {};
  const reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  /* ---- Footer year ---------------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear().toString();

  /* ---- Project tag filter --------------------------------------------------- */
  // Collect the unique tags present in the real data, build filter chips, and
  // show/hide the corresponding static <article data-tags="..."> cards.
  const filterHost = document.getElementById("work-filters");
  const cards = Array.prototype.slice.call(
    document.querySelectorAll("[data-project]")
  );

  if (filterHost && cards.length && Array.isArray(CV.projects)) {
    const tagSet = new Set();
    CV.projects.forEach((p) => (p.tags || []).forEach((t) => tagSet.add(t)));
    const tags = ["All"].concat(Array.from(tagSet).sort());

    let active = "All";

    function applyFilter(tag) {
      active = tag;
      let shown = 0;
      cards.forEach((card) => {
        const cardTags = (card.getAttribute("data-tags") || "")
          .split("|")
          .map((s) => s.trim());
        const match = tag === "All" || cardTags.indexOf(tag) !== -1;
        card.hidden = !match;
        if (match) shown++;
      });
      // Update chip pressed state.
      filterHost.querySelectorAll("button").forEach((b) => {
        const on = b.dataset.tag === tag;
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      const live = document.getElementById("work-filter-status");
      if (live) {
        live.textContent =
          tag === "All"
            ? shown + " projects shown."
            : shown + ' project' + (shown === 1 ? "" : "s") + ' tagged "' + tag + '".';
      }
    }

    const frag = document.createDocumentFragment();
    tags.forEach((tag) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.dataset.tag = tag;
      btn.textContent = tag;
      btn.setAttribute("aria-pressed", tag === "All" ? "true" : "false");
      btn.addEventListener("click", () => applyFilter(tag));
      frag.appendChild(btn);
    });
    filterHost.appendChild(frag);
    filterHost.hidden = false;
    applyFilter("All");
  }

  /* ---- Smooth scroll for in-page nav (respect reduced motion) --------------- */
  if (!reduceMotion) {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        // Move focus for keyboard users.
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    });
  }

  /* ---- Reveal-on-scroll (additive; content is visible without it) ----------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll("[data-reveal]").forEach((n) => io.observe(n));
  } else {
    // No IO or reduced motion: show everything immediately.
    document
      .querySelectorAll("[data-reveal]")
      .forEach((n) => n.classList.add("is-visible"));
  }
})();
