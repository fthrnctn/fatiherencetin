/* =========================================================================
 * portfolio.js — renders the scannable portfolio below the chat from KB data.
 *
 * The HTML ships with a full static fallback (so no-JS users see everything).
 * When JS is on, we ENHANCE: we clear the static fallback containers and
 * render the richer card layouts from window.KB. All text via textContent —
 * no innerHTML with data. Idempotent and dependency-free.
 * ====================================================================== */
(function () {
  "use strict";

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function $(sel) { return document.querySelector(sel); }

  function renderStats() {
    var host = $("#stats-grid");
    if (!host || !window.KB.stats) return;
    host.textContent = "";
    window.KB.stats.forEach(function (s) {
      var card = el("div", "stat");
      card.appendChild(el("div", "stat__value", s.value));
      card.appendChild(el("div", "stat__label", s.label));
      host.appendChild(card);
    });
  }

  function renderProjects() {
    var host = $("#projects-grid");
    if (!host || !window.KB.projects) return;
    host.textContent = "";
    window.KB.projects.forEach(function (p) {
      var card = el("article", "card");

      var head = el("div", "card__head");
      var flag = el("span", "card__flag", p.flag);
      if (/flagship/i.test(p.flag)) flag.classList.add("card__flag--gold");
      if (/public/i.test(p.flag)) flag.classList.add("card__flag--public");
      head.appendChild(flag);
      var state = el("span", "card__state", p.state);
      if (/no public link|private/i.test(p.state)) state.classList.add("card__state--muted");
      head.appendChild(state);
      card.appendChild(head);

      card.appendChild(el("h3", "card__title", p.title));
      card.appendChild(el("p", "card__summary", p.summary));

      var rat = el("p", "card__rationale");
      var rl = el("span", "card__rationale-label", "Why this way: ");
      rat.appendChild(rl);
      rat.appendChild(document.createTextNode(p.rationale));
      card.appendChild(rat);

      var metrics = el("ul", "card__metrics");
      p.metrics.forEach(function (m) {
        var li = el("li", "metric", m);
        metrics.appendChild(li);
      });
      card.appendChild(metrics);

      var tags = el("div", "card__tags");
      p.tags.forEach(function (t) { tags.appendChild(el("span", "tag", t)); });
      card.appendChild(tags);

      var foot = el("div", "card__foot");
      if (p.link && p.link.href) {
        var a = el("a", "btn btn--ghost", p.link.label);
        a.href = p.link.href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        foot.appendChild(a);
      } else {
        foot.appendChild(el("span", "card__nolink", "No public link — confidential / private repo"));
      }
      card.appendChild(foot);

      host.appendChild(card);
    });
  }

  function renderExperience() {
    var host = $("#experience-list");
    if (!host || !window.KB.experience) return;
    host.textContent = "";
    window.KB.experience.forEach(function (x) {
      var item = el("article", "xp");
      var head = el("div", "xp__head");
      var left = el("div", "xp__left");
      left.appendChild(el("h3", "xp__title", x.title));
      left.appendChild(el("div", "xp__org", x.org));
      head.appendChild(left);
      var right = el("div", "xp__right");
      right.appendChild(el("div", "xp__when", x.when));
      right.appendChild(el("div", "xp__where", x.where));
      head.appendChild(right);
      item.appendChild(head);

      var ul = el("ul", "xp__bullets");
      x.bullets.forEach(function (b) { ul.appendChild(el("li", null, b)); });
      item.appendChild(ul);
      host.appendChild(item);
    });
  }

  function renderSkills() {
    var host = $("#skills-grid");
    if (!host || !window.KB.skillGroups) return;
    host.textContent = "";
    window.KB.skillGroups.forEach(function (g) {
      var col = el("div", "skillgroup");
      col.appendChild(el("h3", "skillgroup__name", g.name));
      var ul = el("ul", "skillgroup__items");
      g.items.forEach(function (s) { ul.appendChild(el("li", "skillchip", s)); });
      col.appendChild(ul);
      host.appendChild(col);
    });
  }

  function renderCerts() {
    var host = $("#certs-list");
    if (!host || !window.KB.certifications) return;
    host.textContent = "";
    window.KB.certifications.forEach(function (c) {
      var li = el("li", "cert");
      if (c.star) li.classList.add("cert--star");
      var name = el("span", "cert__name", (c.star ? "★ " : "") + c.name);
      li.appendChild(name);
      li.appendChild(el("span", "cert__note", c.note));
      host.appendChild(li);
    });
  }

  function init() {
    if (!window.KB) return;
    try {
      renderStats();
      renderProjects();
      renderExperience();
      renderSkills();
      renderCerts();
      document.documentElement.classList.add("js-enhanced");
    } catch (e) {
      // if enhancement fails, leave the static fallback intact
      if (window.console) console.error("portfolio render failed:", e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
