/* ============================================================================
   Live ASCII / dither portrait renderer.
   Reads the baked 6-bit luminance grid (window.PORTRAIT) and draws it as ASCII
   art + error-diffusion dither onto a <canvas>. No pixel reads from the image,
   so it is robust on file://, offline, and across browsers.

   Robust fallback contract:
   - The real <img> is shown by default (no-JS / no-canvas).
   - We only swap to the canvas (and reveal controls) AFTER a successful render.
   - prefers-reduced-motion => static render, no resolve / shimmer.
   ========================================================================== */
(function () {
  "use strict";

  var P = window.PORTRAIT;
  var viewport = document.getElementById("viewport");
  var canvas = viewport ? viewport.querySelector(".viewport__canvas") : null;
  var screen = viewport ? viewport.querySelector(".viewport__screen") : null;
  var knob = document.getElementById("knob");
  var statusEl = document.getElementById("status");

  if (!P || !canvas || !screen || !canvas.getContext) return; // -> keep photo
  var ctx;
  try {
    ctx = canvas.getContext("2d");
    if (!ctx) return;
  } catch (e) {
    return; // keep photo
  }

  /* ---- decode baked grid into Float brightness 0..1 ---- */
  var BC = P.cols, BR = P.rows;
  var lut = {};
  for (var i = 0; i < P.alphabet.length; i++) lut[P.alphabet[i]] = i / 63;
  var base = new Float32Array(BC * BR);
  for (var k = 0; k < P.data.length; k++) base[k] = lut[P.data[k]];

  /* ---- character ramps (low -> high brightness) ---- */
  var RAMPS = {
    std: " .:-=+*#%@",
    blocks: " ·░▒▓█",
    fine: " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@",
    binary: " 1" /* special-cased: 'on' cells draw a random 0/1 */
  };
  var PAL = {
    green: { fg: "#00ff9c", bg: "#050805" },
    amber: { fg: "#ffb000", bg: "#0a0700" },
    mono:  { fg: "#c7d0cc", bg: "#0b0b0f" }
  };
  var RES_COLS = [64, 84, 104, 128];

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- state ---- */
  var state = {
    ramp: "std", dither: "atkinson", palette: "green", res: 2, invert: true
  };
  /* last render cache (for shimmer / partial redraw) */
  var R = { cols: 0, rows: 0, cw: 0, ch: 0, font: 0, chars: null, levels: null, fg: "#00ff9c" };

  /* ---- helpers ---- */
  function clampDpr() { return Math.min(2, window.devicePixelRatio || 1); }

  function downsample(C, Rr) {
    var out = new Float32Array(C * Rr);
    for (var y = 0; y < Rr; y++) {
      var by0 = Math.floor(y * BR / Rr);
      var by1 = Math.max(by0 + 1, Math.floor((y + 1) * BR / Rr));
      for (var x = 0; x < C; x++) {
        var bx0 = Math.floor(x * BC / C);
        var bx1 = Math.max(bx0 + 1, Math.floor((x + 1) * BC / C));
        var sum = 0, n = 0;
        for (var yy = by0; yy < by1; yy++) {
          var row = yy * BC;
          for (var xx = bx0; xx < bx1; xx++) { sum += base[row + xx]; n++; }
        }
        out[y * C + x] = n ? sum / n : 0;
      }
    }
    return out;
  }

  /* build the char + level grids for the current state */
  function build(C, Rr) {
    var grid = downsample(C, Rr);
    var rampKey = state.ramp;
    var ramp = RAMPS[rampKey];
    var L = ramp.length;                 // quantization levels
    var levels = new Int16Array(C * Rr);
    var chars = new Array(C * Rr);

    // value buffer in level space (0..L-1)
    var buf = new Float32Array(C * Rr);
    for (var i = 0; i < C * Rr; i++) {
      var b = grid[i];
      if (state.invert) b = 1 - b;
      buf[i] = b * (L - 1);
    }

    function put(idx, lvl) {
      levels[idx] = lvl;
      if (rampKey === "binary") {
        chars[idx] = lvl <= 0 ? " " : (Math.random() < 0.5 ? "0" : "1");
      } else {
        chars[idx] = ramp[lvl];
      }
    }

    if (state.dither === "off") {
      for (var p = 0; p < C * Rr; p++) {
        var lv = Math.round(buf[p]);
        if (lv < 0) lv = 0; if (lv > L - 1) lv = L - 1;
        put(p, lv);
      }
    } else {
      var fs = state.dither === "floyd";
      for (var y = 0; y < Rr; y++) {
        for (var x = 0; x < C; x++) {
          var idx = y * C + x;
          var old = buf[idx];
          var nl = Math.round(old);
          if (nl < 0) nl = 0; if (nl > L - 1) nl = L - 1;
          var err = old - nl;
          put(idx, nl);
          if (fs) {
            diffuse(buf, C, Rr, x + 1, y,     err * 7 / 16);
            diffuse(buf, C, Rr, x - 1, y + 1, err * 3 / 16);
            diffuse(buf, C, Rr, x,     y + 1, err * 5 / 16);
            diffuse(buf, C, Rr, x + 1, y + 1, err * 1 / 16);
          } else { // atkinson
            var e = err / 8;
            diffuse(buf, C, Rr, x + 1, y,     e);
            diffuse(buf, C, Rr, x + 2, y,     e);
            diffuse(buf, C, Rr, x - 1, y + 1, e);
            diffuse(buf, C, Rr, x,     y + 1, e);
            diffuse(buf, C, Rr, x + 1, y + 1, e);
            diffuse(buf, C, Rr, x,     y + 2, e);
          }
        }
      }
    }
    return { chars: chars, levels: levels, L: L, rampKey: rampKey };
  }

  function diffuse(buf, C, Rr, x, y, v) {
    if (x < 0 || x >= C || y < 0 || y >= Rr) return;
    buf[y * C + x] += v;
  }

  /* layout + paint */
  function layout() {
    var W = screen.clientWidth, H = screen.clientHeight;
    if (!W || !H) return null;
    var cols = RES_COLS[state.res];
    var rows = Math.round(cols * BR / BC);
    var dpr = clampDpr();
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R.cols = cols; R.rows = rows;
    R.cw = W / cols; R.ch = H / rows;
    R.font = R.ch * 1.06;
    R.fg = PAL[state.palette].fg;
    return { W: W, H: H, cols: cols, rows: rows };
  }

  function setFont() {
    ctx.font = R.font.toFixed(2) + 'px "IBM Plex Mono", ui-monospace, monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = R.fg;
  }

  function drawCell(c, r) {
    var ch = R.chars[r * R.cols + c];
    if (ch === " ") return;
    ctx.fillText(ch, c * R.cw + R.cw / 2, r * R.ch + R.ch / 2);
  }

  function paintRows(r0, r1) {
    setFont();
    for (var r = r0; r <= r1; r++) {
      for (var c = 0; c < R.cols; c++) drawCell(c, r);
    }
  }

  function clearAll() {
    ctx.setTransform(clampDpr(), 0, 0, clampDpr(), 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  /* ---- shimmer (subtle data flicker) ---- */
  var shimmerTimer = null, shimmerPrev = [];
  function stopShimmer() {
    if (shimmerTimer) { clearInterval(shimmerTimer); shimmerTimer = null; }
    shimmerPrev = [];
  }
  function startShimmer() {
    stopShimmer();
    if (reduceMotion || document.hidden) return;
    shimmerTimer = setInterval(function () {
      if (document.hidden) return;
      setFont();
      // restore previous
      for (var i = 0; i < shimmerPrev.length; i++) {
        var pp = shimmerPrev[i];
        repaintCell(pp.c, pp.r);
      }
      shimmerPrev = [];
      var total = R.cols * R.rows;
      var n = Math.max(6, Math.round(total * 0.006));
      var L = RAMPS[R.rampKey].length;
      for (var j = 0; j < n; j++) {
        var idx = (Math.random() * total) | 0;
        var c = idx % R.cols, r = (idx / R.cols) | 0;
        var base0 = R.chars[idx];
        if (base0 === " ") continue;
        // compute a nudged alternate char
        var alt;
        if (R.rampKey === "binary") {
          alt = base0 === "0" ? "1" : "0";
        } else {
          var lv = R.levels[idx] + (Math.random() < 0.5 ? 1 : -1);
          if (lv < 1) lv = 1; if (lv > L - 1) lv = L - 1;
          alt = RAMPS[R.rampKey][lv];
        }
        // erase + draw alt
        ctx.clearRect(c * R.cw, r * R.ch, R.cw + 1, R.ch + 1);
        if (alt !== " ") ctx.fillText(alt, c * R.cw + R.cw / 2, r * R.ch + R.ch / 2);
        shimmerPrev.push({ c: c, r: r });
      }
    }, 140);
  }
  function repaintCell(c, r) {
    ctx.clearRect(c * R.cw, r * R.ch, R.cw + 1, R.ch + 1);
    drawCell(c, r);
  }

  /* ---- full render ---- */
  var resolveRAF = null;
  function render(animate) {
    if (resolveRAF) { cancelAnimationFrame(resolveRAF); resolveRAF = null; }
    stopShimmer();
    var lay = layout();
    if (!lay) return false;
    var g = build(lay.cols, lay.rows);
    R.chars = g.chars; R.levels = g.levels; R.rampKey = g.rampKey;

    screen.style.background = PAL[state.palette].bg;
    clearAll();

    if (animate && !reduceMotion) {
      var startRow = 0;
      var t0 = performance.now();
      var dur = 700;
      var step = function (t) {
        var prog = Math.min(1, (t - t0) / dur);
        var target = Math.floor(prog * (R.rows - 1));
        if (target >= startRow) { paintRows(startRow, target); startRow = target + 1; }
        if (prog < 1) { resolveRAF = requestAnimationFrame(step); }
        else { resolveRAF = null; startShimmer(); }
      };
      resolveRAF = requestAnimationFrame(step);
    } else {
      paintRows(0, R.rows - 1);
      startShimmer();
    }
    updateStatus();
    return true;
  }

  function updateStatus() {
    if (!statusEl) return;
    statusEl.innerHTML =
      '<span>RAMP <b>' + state.ramp + '</b></span>' +
      '<span>DITHER <b>' + state.dither + '</b></span>' +
      '<span>PAL <b>' + state.palette + '</b></span>' +
      '<span>GRID <b>' + R.cols + '×' + R.rows + '</b></span>' +
      (state.invert ? '<span><b>NEGATIVE</b></span>' : '');
  }

  /* ---- controls ---- */
  function wire() {
    var form = knob;
    form.addEventListener("change", function (e) {
      var t = e.target;
      if (!t.name) return;
      if (t.name === "ramp") state.ramp = t.value;
      else if (t.name === "dither") state.dither = t.value;
      else if (t.name === "palette") state.palette = t.value;
      else if (t.name === "invert") state.invert = t.checked;
      else if (t.name === "res") {
        state.res = parseInt(t.value, 10);
        var out = document.getElementById("resval");
        if (out) out.textContent = RES_COLS[state.res] + "c";
      }
      render(false);
    });
    // live label while sliding res
    var res = document.getElementById("res");
    if (res) res.addEventListener("input", function () {
      var out = document.getElementById("resval");
      if (out) out.textContent = RES_COLS[parseInt(res.value, 10)] + "c";
    });
  }

  /* ---- resize ---- */
  var rzTimer = null;
  function onResize() {
    clearTimeout(rzTimer);
    rzTimer = setTimeout(function () { render(false); }, 150);
  }

  /* ---- boot ---- */
  function boot() {
    var ok = false;
    try { ok = render(true); } catch (e) { ok = false; }
    if (!ok) { stopShimmer(); return; } // keep photo fallback

    viewport.classList.add("is-ascii");
    viewport.setAttribute("data-pal", state.palette);
    if (knob) { knob.hidden = false; wire(); }

    var resOut = document.getElementById("resval");
    if (resOut) resOut.textContent = RES_COLS[state.res] + "c";

    if (window.ResizeObserver) {
      new ResizeObserver(onResize).observe(screen);
    } else {
      window.addEventListener("resize", onResize);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopShimmer(); else startShimmer();
    });
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      var onMq = function () { reduceMotion = mq.matches; if (reduceMotion) stopShimmer(); else startShimmer(); };
      if (mq.addEventListener) mq.addEventListener("change", onMq);
      else if (mq.addListener) mq.addListener(onMq);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
