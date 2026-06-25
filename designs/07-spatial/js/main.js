/* =========================================================
   Fatih Eren Çetin — Spatial hero
   Three.js embedding-field: points + edges, idle drift,
   pointer parallax, drag-to-orbit, proximity labels.
   Graceful fallbacks: no-WebGL -> CSS gradient; reduced-motion
   -> single static frame. Content never gated behind the canvas.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Scroll reveal (independent of the 3D scene) ---------- */
  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- WebGL capability check ---------- */
  function webglOK() {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext &&
        (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) { return false; }
  }

  function noWebGL() {
    document.body.classList.add("no-webgl");
  }

  /* ---------- Soft round sprite for points ---------- */
  function makeSprite() {
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var ctx = c.getContext("2d");
    var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0.0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.85)");
    g.addColorStop(0.55, "rgba(255,255,255,0.22)");
    g.addColorStop(1.0, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    var t = new THREE.Texture(c);
    t.needsUpdate = true;
    return t;
  }

  /* ---------- The 3D scene ---------- */
  function initScene() {
    if (typeof THREE === "undefined" || !webglOK()) { noWebGL(); return; }

    var canvas = document.getElementById("bg-canvas");
    var labelLayer = document.getElementById("node-labels");
    if (!canvas) { noWebGL(); return; }

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (e) { noWebGL(); return; }

    renderer.setClearColor(0x000000, 0);
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(DPR);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(58, 1, 0.1, 2000);
    camera.position.set(0, 0, 132);

    var group = new THREE.Group();
    scene.add(group);

    /* --- palette --- */
    var COLORS = [
      new THREE.Color(0x5EE6C5), // teal
      new THREE.Color(0x7AA2F7), // blue
      new THREE.Color(0xB69CFF)  // violet
    ];
    var WEIGHTS = [0.34, 0.40, 0.26];
    function pickColor() {
      var r = Math.random(), a = 0;
      for (var i = 0; i < WEIGHTS.length; i++) { a += WEIGHTS[i]; if (r <= a) return COLORS[i].clone(); }
      return COLORS[1].clone();
    }

    /* --- generate nodes inside a flattened sphere --- */
    var NODE_COUNT = 240;
    var R = 58;
    var nodes = [];
    for (var i = 0; i < NODE_COUNT; i++) {
      // random point in a ball, biased toward shell for structure
      var u = Math.random(), v = Math.random();
      var theta = u * Math.PI * 2;
      var phi = Math.acos(2 * v - 1);
      var rad = R * Math.pow(Math.random(), 0.62);
      var x = rad * Math.sin(phi) * Math.cos(theta);
      var y = rad * Math.sin(phi) * Math.sin(theta) * 0.78; // flatten vertically
      var z = rad * Math.cos(phi);
      nodes.push({ p: new THREE.Vector3(x, y, z), c: pickColor() });
    }

    /* --- named anchor nodes (real stack terms) --- */
    var LABELS = ["Claude Agents", "Dense RAG", "Qdrant", "LangGraph", "FastAPI",
      "MCP", "Multi-Agent", "Voyage", "pgvector", "Reranking", "ISO 42001", "Embeddings"];
    var named = [];
    var used = {};
    for (var n = 0; n < LABELS.length; n++) {
      var idx;
      do { idx = Math.floor(Math.random() * NODE_COUNT); } while (used[idx]);
      used[idx] = true;
      nodes[idx].named = LABELS[n];
      named.push(idx);
    }

    /* --- points geometry --- */
    var posArr = new Float32Array(NODE_COUNT * 3);
    var colArr = new Float32Array(NODE_COUNT * 3);
    var sizeArr = new Float32Array(NODE_COUNT);
    for (var k = 0; k < NODE_COUNT; k++) {
      posArr[k * 3] = nodes[k].p.x;
      posArr[k * 3 + 1] = nodes[k].p.y;
      posArr[k * 3 + 2] = nodes[k].p.z;
      colArr[k * 3] = nodes[k].c.r;
      colArr[k * 3 + 1] = nodes[k].c.g;
      colArr[k * 3 + 2] = nodes[k].c.b;
      sizeArr[k] = nodes[k].named ? 5.4 : (1.8 + Math.random() * 2.0);
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(colArr, 3));
    pGeo.setAttribute("psize", new THREE.BufferAttribute(sizeArr, 1));

    var sprite = makeSprite();
    // ShaderMaterial gives per-point size + soft sprite + additive glow
    var pMat = new THREE.ShaderMaterial({
      uniforms: { uTex: { value: sprite }, uScale: { value: renderer.getSize(new THREE.Vector2()).height } },
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: [
        "attribute float psize;",
        "varying vec3 vColor;",
        "void main(){",
        "  vColor = color;",
        "  vec4 mv = modelViewMatrix * vec4(position, 1.0);",
        "  gl_PointSize = psize * (300.0 / max(-mv.z, 1.0));",
        "  gl_Position = projectionMatrix * mv;",
        "}"
      ].join("\n"),
      fragmentShader: [
        "uniform sampler2D uTex;",
        "varying vec3 vColor;",
        "void main(){",
        "  vec4 t = texture2D(uTex, gl_PointCoord);",
        "  gl_FragColor = vec4(vColor, 1.0) * t;",
        "}"
      ].join("\n")
    });
    var points = new THREE.Points(pGeo, pMat);
    group.add(points);

    /* --- edges: connect each node to nearest neighbours --- */
    var edges = [];
    var seen = {};
    for (var a = 0; a < NODE_COUNT; a++) {
      var dists = [];
      for (var b = 0; b < NODE_COUNT; b++) {
        if (a === b) continue;
        dists.push({ b: b, d: nodes[a].p.distanceToSquared(nodes[b].p) });
      }
      dists.sort(function (m, n2) { return m.d - n2.d; });
      var deg = nodes[a].named ? 3 : 2;
      for (var e = 0; e < deg; e++) {
        var bi = dists[e].b;
        if (dists[e].d > 26 * 26) continue;
        var key = a < bi ? a + "_" + bi : bi + "_" + a;
        if (seen[key]) continue;
        seen[key] = true;
        edges.push([a, bi]);
      }
    }
    var lPos = new Float32Array(edges.length * 6);
    var lCol = new Float32Array(edges.length * 6);
    for (var le = 0; le < edges.length; le++) {
      var n1 = nodes[edges[le][0]], n2v = nodes[edges[le][1]];
      lPos[le * 6] = n1.p.x; lPos[le * 6 + 1] = n1.p.y; lPos[le * 6 + 2] = n1.p.z;
      lPos[le * 6 + 3] = n2v.p.x; lPos[le * 6 + 4] = n2v.p.y; lPos[le * 6 + 5] = n2v.p.z;
      lCol[le * 6] = n1.c.r; lCol[le * 6 + 1] = n1.c.g; lCol[le * 6 + 2] = n1.c.b;
      lCol[le * 6 + 3] = n2v.c.r; lCol[le * 6 + 4] = n2v.c.g; lCol[le * 6 + 5] = n2v.c.b;
    }
    var lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute("position", new THREE.BufferAttribute(lPos, 3));
    lGeo.setAttribute("color", new THREE.BufferAttribute(lCol, 3));
    var lMat = new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.16,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    var lines = new THREE.LineSegments(lGeo, lMat);
    group.add(lines);

    /* --- sparse far starfield for depth --- */
    var SF = 420;
    var sfPos = new Float32Array(SF * 3);
    for (var s = 0; s < SF; s++) {
      sfPos[s * 3] = (Math.random() - 0.5) * 520;
      sfPos[s * 3 + 1] = (Math.random() - 0.5) * 340;
      sfPos[s * 3 + 2] = (Math.random() - 0.5) * 520 - 120;
    }
    var sfGeo = new THREE.BufferGeometry();
    sfGeo.setAttribute("position", new THREE.BufferAttribute(sfPos, 3));
    var sfMat = new THREE.PointsMaterial({
      color: 0x7AA2F7, size: 0.7, transparent: true, opacity: 0.5,
      depthWrite: false, blending: THREE.AdditiveBlending, map: sprite
    });
    var starfield = new THREE.Points(sfGeo, sfMat);
    starfield.position.z = -40;
    scene.add(starfield);

    /* --- labels DOM --- */
    var labelEls = [];
    if (labelLayer) {
      for (var li = 0; li < named.length; li++) {
        var el = document.createElement("span");
        el.className = "node-label";
        el.textContent = nodes[named[li]].named;
        labelLayer.appendChild(el);
        labelEls.push(el);
      }
    }

    /* --- sizing --- */
    function resize() {
      var w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();

    /* --- pointer state --- */
    var targetX = 0, targetY = 0;   // parallax target (radians)
    var curX = 0, curY = 0;
    var dragX = 0, dragY = 0;       // accumulated drag offset
    var dragging = false, lastPX = 0, lastPY = 0;
    var ptrPx = { x: -9999, y: -9999, active: false };

    var hero = document.querySelector(".hero");

    function onMove(ev) {
      var nx = (ev.clientX / window.innerWidth) * 2 - 1;
      var ny = (ev.clientY / window.innerHeight) * 2 - 1;
      targetX = nx * 0.28;
      targetY = ny * 0.16;
      ptrPx.x = ev.clientX; ptrPx.y = ev.clientY; ptrPx.active = true;
      if (dragging) {
        dragX += (ev.clientX - lastPX) * 0.005;
        dragY += (ev.clientY - lastPY) * 0.004;
        dragY = Math.max(-0.6, Math.min(0.6, dragY));
        lastPX = ev.clientX; lastPY = ev.clientY;
      }
    }
    function onDown(ev) {
      if (ev.pointerType === "touch") return; // keep scroll natural on touch
      // only orbit when grabbing within the hero region
      if (hero && ev.clientY > hero.getBoundingClientRect().bottom) return;
      dragging = true; lastPX = ev.clientX; lastPY = ev.clientY;
      document.body.style.cursor = "grabbing";
    }
    function onUp() { dragging = false; document.body.style.cursor = ""; }
    function onLeave() { ptrPx.active = false; }

    if (!reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      window.addEventListener("pointerup", onUp, { passive: true });
      window.addEventListener("pointercancel", onUp, { passive: true });
      window.addEventListener("blur", onUp);
      document.addEventListener("pointerleave", onLeave);
    }
    window.addEventListener("resize", function () { resize(); if (reduce) renderOnce(); });

    /* --- label projection --- */
    var v = new THREE.Vector3();
    function updateLabels() {
      if (!labelEls.length) return;
      // Keep the proximity labels tied to the hero: once the hero has scrolled
      // mostly out of view, clear them so they never float over lower content.
      var heroInView = !hero || hero.getBoundingClientRect().bottom > window.innerHeight * 0.4;
      if (!heroInView) {
        for (var ci = 0; ci < labelEls.length; ci++) labelEls[ci].classList.remove("on");
        return;
      }
      var bestI = -1, bestD = 1e9;
      var W = window.innerWidth, H = window.innerHeight;
      var screen = [];
      for (var i = 0; i < named.length; i++) {
        v.copy(nodes[named[i]].p);
        group.localToWorld(v);
        v.project(camera);
        var sx = (v.x * 0.5 + 0.5) * W;
        var sy = (-v.y * 0.5 + 0.5) * H;
        var visible = v.z < 1;
        screen.push({ sx: sx, sy: sy, visible: visible });
        if (visible && ptrPx.active && ptrPx.y < H * 0.92) {
          var dx = sx - ptrPx.x, dy = sy - ptrPx.y;
          var d = dx * dx + dy * dy;
          if (d < bestD) { bestD = d; bestI = i; }
        }
      }
      for (var j = 0; j < labelEls.length; j++) {
        var on = (j === bestI) && bestD < (96 * 96) && screen[j].visible;
        if (on) {
          labelEls[j].style.transform =
            "translate(" + screen[j].sx + "px," + screen[j].sy + "px) translate(-50%, -150%)";
          labelEls[j].classList.add("on");
        } else {
          labelEls[j].classList.remove("on");
        }
      }
    }

    /* --- render --- */
    var clock = new THREE.Clock();
    function frame(t) {
      curX += (targetX - curX) * 0.05;
      curY += (targetY - curY) * 0.05;
      dragX *= 0.96; // ease drag back to rest
      dragY *= 0.96;

      var time = clock.getElapsedTime();
      group.rotation.y = time * 0.035 + curX + dragX;
      group.rotation.x = Math.sin(time * 0.12) * 0.10 + curY + dragY;
      group.position.y = Math.sin(time * 0.35) * 1.6;
      group.scale.setScalar(1 + Math.sin(time * 0.5) * 0.012);

      starfield.rotation.y = time * 0.012;

      updateLabels();
      renderer.render(scene, camera);
    }

    function renderOnce() {
      group.rotation.y = 0.5;
      group.rotation.x = -0.12;
      renderer.render(scene, camera);
    }

    if (reduce) {
      // single static frame, no loop
      renderOnce();
    } else {
      var raf = 0, paused = false;
      function loop() { frame(); raf = requestAnimationFrame(loop); }
      // pause when tab hidden to save battery; guard against stacking loops on resume
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          paused = true;
          if (raf) { cancelAnimationFrame(raf); raf = 0; }
        } else if (paused) {
          paused = false;
          if (!raf) raf = requestAnimationFrame(loop);
        }
      });
      raf = requestAnimationFrame(loop);
      if (hero) hero.style.cursor = "grab";
    }
  }

  /* ---------- boot ---------- */
  function boot() {
    initReveal();
    initScene();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else { boot(); }
})();
