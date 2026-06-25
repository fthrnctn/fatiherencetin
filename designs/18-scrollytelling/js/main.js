/* ============================================================================
   main.js — progressive enhancement for the scrollytelling case study.
   - Builds the pipeline SVG from FEC.pipeline.
   - Syncs the sticky diagram to the active scroll step via IntersectionObserver.
   - Animates the before/after reveal when it enters view.
   - Honors prefers-reduced-motion: no scroll-driven highlighting, diagram shows
     its full final state, reveal bars set instantly. Native scroll is never hijacked.
   - With JS off, index.html already renders every step + final diagram statically.
   ========================================================================== */
(function () {
  "use strict";

  var FEC = window.FEC;
  if (!FEC) { return; } // data failed to load → keep the static no-JS page as-is

  var doc = document;
  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Flip no-js → js so CSS can dim inactive steps etc.
  doc.body.classList.remove("no-js");
  doc.body.classList.add("js");

  /* ---------------------------------------------------------------------- *
   * 1. Build the pipeline SVG                                              *
   * ---------------------------------------------------------------------- */
  var SVG_NS = "http://www.w3.org/2000/svg";

  // grid → pixel layout. 6 columns (0..5), 3 rows (0..2).
  var VB_W = 640, VB_H = 320;
  var COLS = 6, ROWS = 3;
  var NODE_W = 92, NODE_H = 56;
  var padX = 14, padY = 26;
  var colGap = (VB_W - padX * 2 - NODE_W) / (COLS - 1);
  var rowGap = (VB_H - padY * 2 - NODE_H) / (ROWS - 1);

  function nodeCenter(n) {
    var x = padX + n.col * colGap + NODE_W / 2;
    var y = padY + n.row * rowGap + NODE_H / 2;
    return { x: x, y: y };
  }
  function nodeBox(n) {
    return {
      x: padX + n.col * colGap,
      y: padY + n.row * rowGap,
      w: NODE_W, h: NODE_H,
    };
  }

  var nodesById = {};
  FEC.pipeline.nodes.forEach(function (n) { nodesById[n.id] = n; });

  function el(tag, attrs) {
    var e = doc.createElementNS(SVG_NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    }
    return e;
  }

  function buildSVG() {
    var svg = el("svg", {
      "class": "diagram__svg",
      viewBox: "0 0 " + VB_W + " " + VB_H,
      role: "img",
      "aria-label":
        "Pipeline diagram: user question → deterministic orchestrator → " +
        "article-aware chunking → dense retrieval → rerank → 9 Claude agents → " +
        "citation verification → human-in-the-loop → cited answer with 0% hallucination.",
    });

    // arrowhead marker
    var defs = el("defs");
    var marker = el("marker", {
      id: "ah", viewBox: "0 0 10 10", refX: "8", refY: "5",
      markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse",
    });
    var mpath = el("path", { d: "M0,0 L10,5 L0,10 z", "class": "edge__head" });
    marker.appendChild(mpath);
    defs.appendChild(marker);
    svg.appendChild(defs);

    // edges first (under nodes)
    var edgeEls = {}; // key "from>to" → path
    FEC.pipeline.edges.forEach(function (pair) {
      var a = nodesById[pair[0]], b = nodesById[pair[1]];
      if (!a || !b) { return; }
      var ca = nodeCenter(a), cb = nodeCenter(b);
      var ba = nodeBox(a), bb = nodeBox(b);
      var d;

      if (b.col > a.col) {
        // forward edge: exit right edge of a, enter left edge of b. Smooth S-curve.
        var x1 = ba.x + ba.w, y1 = ca.y;
        var x2 = bb.x,        y2 = cb.y;
        var midX = (x1 + x2) / 2;
        d = "M " + x1 + " " + y1 +
            " C " + midX + " " + y1 + " " + midX + " " + y2 + " " + x2 + " " + y2;
      } else {
        // backward / same-column cross-row edge (e.g. rerank → agents):
        // drop from the bottom of a, then curve across to the top of b.
        // a is higher row (smaller row index) here, so exit a's bottom, enter b's top.
        var ax = ca.x, ay = ba.y + ba.h;       // bottom-center of a
        var bx = cb.x, by = bb.y;              // top-center of b
        var midY = (ay + by) / 2;
        d = "M " + ax + " " + ay +
            " C " + ax + " " + midY + " " + bx + " " + midY + " " + bx + " " + by;
      }

      var p = el("path", { "class": "edge", d: d, "marker-end": "url(#ah)" });
      p.dataset.from = pair[0];
      p.dataset.to = pair[1];
      svg.appendChild(p);
      edgeEls[pair[0] + ">" + pair[1]] = p;
    });

    // nodes
    var nodeEls = {};
    FEC.pipeline.nodes.forEach(function (n) {
      var box = nodeBox(n);
      var g = el("g", { "class": "node" });
      g.dataset.node = n.id;
      var rect = el("rect", {
        x: box.x, y: box.y, width: box.w, height: box.h, rx: 9,
      });
      g.appendChild(rect);

      // label (supports \n via two-line split)
      var lines = n.label.split("\n");
      var startY = box.y + box.h / 2 - (lines.length - 1) * 7 - 2;
      lines.forEach(function (ln, i) {
        var t = el("text", {
          x: box.x + box.w / 2, y: startY + i * 14,
          "text-anchor": "middle", "class": "node__label",
        });
        t.textContent = ln;
        g.appendChild(t);
      });
      var sub = el("text", {
        x: box.x + box.w / 2, y: box.y + box.h - 8,
        "text-anchor": "middle", "class": "node__sub",
      });
      sub.textContent = n.sub;
      g.appendChild(sub);

      svg.appendChild(g);
      nodeEls[n.id] = g;
    });

    return { svg: svg, nodeEls: nodeEls, edgeEls: edgeEls };
  }

  var built = buildSVG();
  var wrap = doc.getElementById("diagram-svgwrap");
  if (wrap) {
    wrap.innerHTML = "";
    wrap.appendChild(built.svg);
  }

  /* ---------------------------------------------------------------------- *
   * 2. Active-node logic                                                   *
   * ---------------------------------------------------------------------- */
  // Map step id → { nodes:[...], label }
  var stepConfig = {};
  FEC.caseStudy.steps.forEach(function (s) {
    stepConfig[s.id] = s;
  });

  function edgesForNodes(activeSet) {
    // an edge is active if both endpoints are active
    var active = [];
    FEC.pipeline.edges.forEach(function (pair) {
      if (activeSet[pair[0]] && activeSet[pair[1]]) { active.push(pair[0] + ">" + pair[1]); }
    });
    return active;
  }

  var capLabel = doc.getElementById("diagram-caplabel");
  var dotsWrap = null;

  // build progress dots in the caption
  (function buildDots() {
    var cap = doc.querySelector(".diagram__cap");
    if (!cap) { return; }
    dotsWrap = doc.createElement("span");
    dotsWrap.className = "diagram__dots";
    FEC.caseStudy.steps.forEach(function (s) {
      var d = doc.createElement("span");
      d.className = "dot";
      d.dataset.step = s.id;
      dotsWrap.appendChild(d);
    });
    cap.appendChild(dotsWrap);
  })();

  function setActiveStep(stepId) {
    var cfg = stepConfig[stepId];
    if (!cfg) { return; }
    var activeSet = {};
    cfg.nodes.forEach(function (id) { activeSet[id] = true; });

    // nodes
    Object.keys(built.nodeEls).forEach(function (id) {
      built.nodeEls[id].classList.toggle("is-active", !!activeSet[id]);
    });
    // edges
    var activeEdges = {};
    edgesForNodes(activeSet).forEach(function (k) { activeEdges[k] = true; });
    Object.keys(built.edgeEls).forEach(function (k) {
      built.edgeEls[k].classList.toggle("is-active", !!activeEdges[k]);
    });
    // caption + dots
    if (capLabel) {
      var idx = FEC.caseStudy.steps.findIndex(function (s) { return s.id === stepId; });
      capLabel.textContent = (idx + 1) + " · " + shortCap(stepId);
    }
    if (dotsWrap) {
      Array.prototype.forEach.call(dotsWrap.children, function (d) {
        d.classList.toggle("is-active", d.dataset.step === stepId);
      });
    }
  }

  function shortCap(stepId) {
    switch (stepId) {
      case "problem": return "The problem";
      case "architecture": return "Architecture";
      case "retrieval": return "Retrieval";
      case "result": return "The result";
      case "reliability": return "Reliability";
      default: return "Pipeline";
    }
  }

  /* ---------------------------------------------------------------------- *
   * 3. Sync steps → diagram with IntersectionObserver                      *
   * ---------------------------------------------------------------------- */
  var steps = Array.prototype.slice.call(doc.querySelectorAll(".step[data-step]"));

  if (prefersReduced) {
    // Reduced motion: show the FULL final pipeline (all nodes lit), no scroll sync.
    var all = {};
    FEC.pipeline.nodes.forEach(function (n) { all[n.id] = true; });
    Object.keys(built.nodeEls).forEach(function (id) {
      built.nodeEls[id].classList.add("is-active");
    });
    var allEdges = {};
    edgesForNodes(all).forEach(function (k) { allEdges[k] = true; });
    Object.keys(built.edgeEls).forEach(function (k) {
      built.edgeEls[k].classList.toggle("is-active", !!allEdges[k]);
    });
    if (capLabel) { capLabel.textContent = "Full pipeline"; }
    if (dotsWrap) {
      Array.prototype.forEach.call(dotsWrap.children, function (d) { d.classList.add("is-active"); });
    }
    steps.forEach(function (s) { s.classList.add("is-active"); });
    // reveal bars instant
    setRevealInstant();
  } else {
    // initialize on first step
    if (steps.length) { setActiveStep(steps[0].dataset.step); steps[0].classList.add("is-active"); }

    var activeId = steps.length ? steps[0].dataset.step : null;

    // Pick the active step using a fixed "reading line" ~52% down the viewport.
    // The active step is the LAST one whose top has crossed that line — so the
    // diagram updates as soon as you START reading a step, not only once its
    // geometric center reaches mid-screen (which, with tall steps, felt laggy).
    // Falls back to the nearest-to-line step when nothing has crossed yet.
    function pickActive() {
      var vh = window.innerHeight || doc.documentElement.clientHeight;
      var line = vh * 0.52;
      var chosen = null;
      var nearest = null, nearestDist = Infinity;
      for (var i = 0; i < steps.length; i++) {
        var r = steps[i].getBoundingClientRect();
        if (r.top <= line) { chosen = steps[i]; } // keep last that crossed the line
        var d = Math.abs((r.top + r.height / 2) - line);
        if (d < nearestDist) { nearestDist = d; nearest = steps[i]; }
      }
      return chosen || nearest;
    }

    function applyActive() {
      var best = pickActive();
      if (best && best.dataset.step !== activeId) {
        activeId = best.dataset.step;
        setActiveStep(activeId);
        steps.forEach(function (s) { s.classList.toggle("is-active", s === best); });
      }
    }

    // rAF-throttled scroll/resize sync — native scroll is never hijacked.
    var ticking = false;
    function onScroll() {
      if (ticking) { return; }
      ticking = true;
      requestAnimationFrame(function () { ticking = false; applyActive(); });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    // IntersectionObserver is a cheap "wake up and recompute" trigger; the
    // actual choice is made by pickActive() so IO and scroll never disagree.
    var io = new IntersectionObserver(function () { applyActive(); }, {
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });
    steps.forEach(function (s) { io.observe(s); });

    // sync once after layout settles (fonts/images can shift step positions)
    applyActive();
    window.addEventListener("load", applyActive);
  }

  /* ---------------------------------------------------------------------- *
   * 4. Before/after reveal                                                 *
   * ---------------------------------------------------------------------- */
  function setRevealInstant() {
    var bars = doc.querySelectorAll(".reveal__bar");
    bars.forEach(function (bar) {
      var pct = bar.getAttribute("data-pct") || "0";
      bar.style.setProperty("--w", pct + "%");
    });
  }

  function animateReveal() {
    var bars = doc.querySelectorAll(".reveal__bar");
    // start at 0
    bars.forEach(function (bar) { bar.style.setProperty("--w", "0%"); });
    // count-up the percent labels in sync with the bar transition
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        bars.forEach(function (bar) {
          var pct = parseInt(bar.getAttribute("data-pct"), 10) || 0;
          bar.style.setProperty("--w", pct + "%");
          countUp(bar.querySelector(".reveal__pct"), pct, 1050);
        });
      });
    });
  }

  function countUp(node, target, duration) {
    if (!node) { return; }
    var start = null;
    function frame(ts) {
      if (start === null) { start = ts; }
      var t = Math.min(1, (ts - start) / duration);
      // easeOutCubic to match the bar's cubic-bezier feel
      var eased = 1 - Math.pow(1 - t, 3);
      node.textContent = Math.round(eased * target) + "%";
      if (t < 1) { requestAnimationFrame(frame); }
      else { node.textContent = target + "%"; }
    }
    requestAnimationFrame(frame);
  }

  if (!prefersReduced) {
    // bars start at 0 (CSS default --w:0%); animate when the reveal enters view, once
    var reveal = doc.getElementById("reveal");
    if (reveal) {
      // zero the labels until animated
      reveal.querySelectorAll(".reveal__pct").forEach(function (n) { n.textContent = "0%"; });
      var played = false;
      var rio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !played) {
            played = true;
            animateReveal();
            rio.disconnect();
          }
        });
      }, { threshold: 0.4 });
      rio.observe(reveal);
    }
  }

  /* ---------------------------------------------------------------------- *
   * 5. (Light) re-render dynamic sections from data to prove single-source *
   *    — only the hero stats, which we keep identical to the static markup.*
   *    Skipped to avoid layout flash; static HTML already matches data.js. *
   * ---------------------------------------------------------------------- */
  // Intentionally left as a no-op: the static HTML is generated from the same
  // facts in data.js, kept in sync by hand. data.js is also the source the
  // diagram/steps/reveal read from, so the interactive parts ARE data-driven.

})();
