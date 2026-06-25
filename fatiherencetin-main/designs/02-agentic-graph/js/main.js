/* =========================================================================
   Agentic-graph hero — retrieval pulses + hover highlight + scroll reveal.
   Pure vanilla. Honors prefers-reduced-motion.
   The rAF loop pauses when the graph scrolls offscreen or the tab is hidden,
   so it costs nothing while you read the rest of the page.
   ========================================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  var reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  var SVGNS = "http://www.w3.org/2000/svg";
  var svg = document.getElementById("pipeline");

  // teardown handle so a live motion-preference flip doesn't leak observers
  var teardown = null;

  /* ------------------------------------------------------------------ *
   * 1. PIPELINE PULSES
   * ------------------------------------------------------------------ */
  function initPulses() {
    if (teardown) { teardown(); teardown = null; }
    if (!svg) return;

    var edges = Array.prototype.slice.call(svg.querySelectorAll("path.edge"));
    var layer = svg.querySelector("#pulses");
    if (!layer || !edges.length) return;

    layer.textContent = ""; // reset on re-init

    var pulses = [];
    edges.forEach(function (edge) {
      var len = edge.getTotalLength();
      if (!len) return;
      var flow = edge.getAttribute("data-flow") || "blue";
      var count = len > 170 ? 2 : 1;
      for (var k = 0; k < count; k++) {
        var c = document.createElementNS(SVGNS, "circle");
        c.setAttribute("r", "3.1");
        c.setAttribute("class", "pulse pulse--" + flow);
        layer.appendChild(c);
        pulses.push({
          edge: edge,
          len: len,
          dist: (len / count) * k + Math.random() * 30,
          speed: 58 + Math.random() * 46, // px / second
          el: c
        });
      }
    });

    function place(p) {
      var d = p.dist < 0 ? 0 : (p.dist > p.len ? p.len : p.dist);
      var pt = p.edge.getPointAtLength(d);
      p.el.setAttribute("cx", pt.x.toFixed(1));
      p.el.setAttribute("cy", pt.y.toFixed(1));
    }

    if (reduceMQ.matches) {
      // frozen, intentional resting state — no loop to run
      pulses.forEach(function (p) {
        p.dist = p.len * 0.6;
        place(p);
        p.el.style.opacity = "0.9";
      });
      return;
    }

    var raf = 0, last = 0, running = false, inView = true;

    function frame(now) {
      if (!last) last = now;
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      for (var i = 0; i < pulses.length; i++) {
        var p = pulses[i];
        p.dist += p.speed * dt;
        if (p.dist > p.len + 6) p.dist = -(Math.random() * 26);
        var t = p.len ? p.dist / p.len : 0;
        var op = 1;
        if (p.dist < 0) op = 0;
        else if (t < 0.07) op = t / 0.07;
        else if (t > 0.93) op = (1 - t) / 0.07;
        p.el.style.opacity = (op < 0 ? 0 : op).toFixed(2);
        if (p.dist >= 0) place(p);
      }
      raf = window.requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      last = 0; // avoid a time jump after a pause
      raf = window.requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
    }
    function sync() { (inView && !document.hidden) ? start() : stop(); }

    var io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(function (entries) {
        inView = entries[entries.length - 1].isIntersecting;
        sync();
      }, { threshold: 0 });
      io.observe(svg);
    } else {
      start();
    }

    function onVis() { sync(); }
    document.addEventListener("visibilitychange", onVis);

    teardown = function () {
      stop();
      if (io) io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }

  /* ------------------------------------------------------------------ *
   * 2. NODE HOVER -> light connected edges
   * ------------------------------------------------------------------ */
  function initHover() {
    if (!svg) return;
    var nodes = svg.querySelectorAll(".node[data-edges]");
    Array.prototype.forEach.call(nodes, function (node) {
      var ids = (node.getAttribute("data-edges") || "").split(",");
      function set(on) {
        node.classList.toggle("hot", on);
        ids.forEach(function (id) {
          var e = svg.getElementById(id.trim());
          if (e) e.classList.toggle("lit", on);
        });
      }
      node.addEventListener("mouseenter", function () { set(true); });
      node.addEventListener("mouseleave", function () { set(false); });
    });
  }

  /* ------------------------------------------------------------------ *
   * 3. SCROLL REVEAL
   * ------------------------------------------------------------------ */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (reduceMQ.matches || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------ */
  function boot() {
    initPulses();
    initHover();
    initReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // re-evaluate pulses if the user flips the motion preference live
  var onChange = function () { initPulses(); };
  if (reduceMQ.addEventListener) reduceMQ.addEventListener("change", onChange);
  else if (reduceMQ.addListener) reduceMQ.addListener(onChange);
})();
