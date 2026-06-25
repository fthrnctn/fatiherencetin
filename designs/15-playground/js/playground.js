/* =============================================================================
   playground.js — wires the MLP (nn.js) to the <canvas> + controls.
   Renders a live decision-boundary color field, the data points, and a live
   loss/epoch/accuracy readout while training in-browser. No libraries.
   ============================================================================= */
(function () {
  "use strict";

  if (!window.PlaygroundNN) return;
  const { Net, makeDataset } = window.PlaygroundNN;

  const el = (id) => document.getElementById(id);

  const ui = {
    canvas: el("pg-canvas"),
    play: el("pg-play"),
    reset: el("pg-reset"),
    step: el("pg-step"),
    dataset: el("pg-dataset"),
    activation: el("pg-activation"),
    lr: el("pg-lr"),
    lrOut: el("pg-lr-out"),
    hidden: el("pg-hidden"),
    hiddenOut: el("pg-hidden-out"),
    noise: el("pg-noise"),
    noiseOut: el("pg-noise-out"),
    epoch: el("pg-epoch"),
    loss: el("pg-loss"),
    acc: el("pg-acc"),
    status: el("pg-status"),
  };

  // If the playground markup is absent, bail quietly (no-JS fallback shows).
  if (!ui.canvas || !ui.canvas.getContext) return;

  const ctx = ui.canvas.getContext("2d");
  const reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  // Domain: data x,y live in roughly [-1.15, 1.15]; map to canvas pixels.
  const DOMAIN = 1.15;
  const N_POINTS = 220;
  const GRID = 60; // boundary resolution (GRID x GRID cells)

  let net = null;
  let data = [];
  let running = false;
  let booted = false;
  let rafId = null;
  let boundaryCanvas = document.createElement("canvas");
  boundaryCanvas.width = GRID;
  boundaryCanvas.height = GRID;
  const bctx = boundaryCanvas.getContext("2d");

  function readConfig() {
    return {
      dataset: ui.dataset.value,
      activation: ui.activation.value,
      learningRate: parseFloat(ui.lr.value),
      hidden: parseInt(ui.hidden.value, 10),
      noise: parseFloat(ui.noise.value),
      seed: 1234,
    };
  }

  function px(coord) {
    // coord in [-DOMAIN, DOMAIN] -> [0, size]
    const size = ui.canvas.width;
    return ((coord + DOMAIN) / (2 * DOMAIN)) * size;
  }

  // Two-class palette: navy (#2B4C7E -> class 0) and amber (#E0892B -> class 1).
  function boundaryColor(p) {
    // p in [0,1]; blend toward each class color, lighter near 0.5.
    const c0 = [43, 76, 126]; // navy
    const c1 = [224, 137, 43]; // amber
    const t = p;
    const r = Math.round(c0[0] + (c1[0] - c0[0]) * t);
    const g = Math.round(c0[1] + (c1[1] - c0[1]) * t);
    const b = Math.round(c0[2] + (c1[2] - c0[2]) * t);
    // Lower alpha near the boundary (0.5) for a "confidence" feel.
    const conf = Math.abs(p - 0.5) * 2; // 0 at boundary, 1 at extremes
    const a = 0.18 + conf * 0.5;
    return [r, g, b, a];
  }

  function renderBoundary() {
    const img = bctx.createImageData(GRID, GRID);
    const d = img.data;
    for (let gy = 0; gy < GRID; gy++) {
      for (let gx = 0; gx < GRID; gx++) {
        const x = (gx / (GRID - 1)) * 2 * DOMAIN - DOMAIN;
        const y = DOMAIN - (gy / (GRID - 1)) * 2 * DOMAIN; // flip y
        const p = net.predict(x, y);
        const [r, g, b, a] = boundaryColor(p);
        const idx = (gy * GRID + gx) * 4;
        d[idx] = r;
        d[idx + 1] = g;
        d[idx + 2] = b;
        d[idx + 3] = Math.round(a * 255);
      }
    }
    bctx.putImageData(img, 0, 0);
  }

  function draw() {
    const size = ui.canvas.width;
    ctx.clearRect(0, 0, size, size);

    // Decision-boundary color field (upscaled, smoothed).
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(boundaryCanvas, 0, 0, GRID, GRID, 0, 0, size, size);

    // Subtle grid lines.
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 8; i++) {
      const p = (i / 8) * size;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, size);
      ctx.moveTo(0, p);
      ctx.lineTo(size, p);
      ctx.stroke();
    }

    // Data points.
    for (let i = 0; i < data.length; i++) {
      const pt = data[i];
      const cx = px(pt.x);
      const cy = size - px(pt.y); // flip y for screen coords
      ctx.beginPath();
      ctx.arc(cx, cy, 3.4, 0, Math.PI * 2);
      ctx.fillStyle = pt.label === 1 ? "#FFB454" : "#7FA8E0";
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(7,12,22,0.85)";
      ctx.stroke();
    }
  }

  function updateReadout() {
    ui.epoch.textContent = net.epoch.toString();
    ui.loss.textContent = isNaN(net.loss) ? "—" : net.loss.toFixed(4);
    ui.acc.textContent = (net.accuracy(data) * 100).toFixed(1) + "%";
  }

  function rebuild(resetParamsOnly) {
    const cfg = readConfig();
    // Regenerate data only when the dataset/noise changed or on full reset.
    if (!resetParamsOnly || !data.length) {
      const rng = window.PlaygroundNN.mulberry32(99);
      data = makeDataset(cfg.dataset, N_POINTS, cfg.noise, rng);
    }
    net = new Net(cfg);
    renderBoundary();
    draw();
    updateReadout();
  }

  function loop() {
    if (!running || !net) return;
    // A few steps per frame keeps it lively without hammering the main thread.
    const stepsPerFrame = 3;
    for (let i = 0; i < stepsPerFrame; i++) net.trainStep(data);
    renderBoundary();
    draw();
    updateReadout();
    rafId = requestAnimationFrame(loop);
  }

  function setRunning(on) {
    // Guard against the boot race: if the engine isn't built yet (e.g. Play is
    // pressed before the lazy IntersectionObserver boots it), build it now.
    if (on && !net) boot();
    running = on;
    ui.play.setAttribute("aria-pressed", on ? "true" : "false");
    ui.play.textContent = on ? "⏸ Pause" : "▶ Play";
    ui.status.textContent = on ? "Training…" : "Paused";
    if (on) {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(rafId);
    }
  }

  /* ---- Wire controls -------------------------------------------------------- */
  function bindLiveOutputs() {
    const sync = () => {
      ui.lrOut.textContent = parseFloat(ui.lr.value).toFixed(3);
      ui.hiddenOut.textContent = ui.hidden.value;
      ui.noiseOut.textContent = parseFloat(ui.noise.value).toFixed(2);
    };
    ui.lr.addEventListener("input", () => {
      sync();
      if (net) net.lr = parseFloat(ui.lr.value);
    });
    ui.hidden.addEventListener("input", () => {
      sync();
    });
    ui.hidden.addEventListener("change", () => {
      setRunning(false);
      boot();
      rebuild(true);
    });
    ui.noise.addEventListener("input", sync);
    ui.noise.addEventListener("change", () => {
      setRunning(false);
      boot();
      rebuild(false);
    });
    sync();
  }

  ui.play.addEventListener("click", () => setRunning(!running));
  ui.reset.addEventListener("click", () => {
    setRunning(false);
    boot();
    rebuild(false);
    ui.status.textContent = "Reset — press Play to train";
  });
  ui.step.addEventListener("click", () => {
    if (running) setRunning(false);
    if (!net) boot();
    net.trainStep(data);
    renderBoundary();
    draw();
    updateReadout();
    ui.status.textContent = "Stepped one epoch";
  });
  ui.activation.addEventListener("change", () => {
    setRunning(false);
    boot();
    rebuild(false);
    if (ui.activation.value === "sigmoid") {
      ui.status.textContent =
        "Sigmoid hidden layers train slowly (vanishing gradients) — try a higher learning rate or many epochs.";
    } else {
      ui.status.textContent = reduceMotion
        ? "Reduced-motion on — press Play or Step to train."
        : "Ready — press Play to train";
    }
  });
  ui.dataset.addEventListener("change", () => {
    setRunning(false);
    boot();
    rebuild(false);
  });

  bindLiveOutputs();

  // Build the net + paint the initial dataset and boundary. Idempotent —
  // safe to call from boot-on-load and from every control handler.
  function boot() {
    if (booted) return;
    booted = true;
    rebuild(false);
    if (reduceMotion) {
      ui.status.textContent =
        "Reduced-motion on — auto-training is off. Press Play or Step to train.";
    } else {
      ui.status.textContent = "Ready — press Play to train";
    }
  }

  // Boot eagerly: the playground is the hero centerpiece, so the canvas must
  // show the initial dataset + boundary immediately (never a blank box waiting
  // for scroll). It's a tiny 2-input net — building it is cheap. We never
  // auto-train: training only starts on an explicit Play/Step, so first paint
  // is not blocked and reduced-motion users get a still image until they ask.
  boot();

  // Pause when the tab is hidden to save cycles.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && running) setRunning(false);
  });
})();
