/* =============================================================================
   nn.js — A tiny, dependency-free MLP with real forward pass + backprop.
   Generic ML-literacy teaching toy. NOT a production model.

   Architecture: 2 inputs (x, y) -> 1 hidden layer (configurable width)
                 -> 1 hidden layer (configurable width) -> 1 sigmoid output.
   Trained with full-batch gradient descent + binary cross-entropy loss.
   Pure JS, no libraries. Exposed on window.PlaygroundNN.
   ============================================================================= */
(function () {
  "use strict";

  /* ---- Activations and their derivatives (derivative wrt pre-activation z) -- */
  const ACT = {
    relu: {
      f: (z) => (z > 0 ? z : 0),
      // derivative wrt z, given the post-activation a (a === z when z>0)
      d: (a) => (a > 0 ? 1 : 0),
    },
    tanh: {
      f: (z) => Math.tanh(z),
      d: (a) => 1 - a * a, // tanh'(z) = 1 - tanh(z)^2 = 1 - a^2
    },
    sigmoid: {
      f: (z) => 1 / (1 + Math.exp(-z)),
      d: (a) => a * (1 - a),
    },
  };

  const sigmoid = (z) => 1 / (1 + Math.exp(-z));

  /* ---- Small deterministic RNG so resets are reproducible-ish per seed ------ */
  function mulberry32(seed) {
    let t = seed >>> 0;
    return function () {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ===========================================================================
     Dataset generators. Each returns [{x, y, label}] with x,y in roughly
     [-1, 1] and label in {0, 1}. `noise` jitters the points.
     =========================================================================== */
  function makeDataset(kind, n, noise, rng) {
    const pts = [];
    const jitter = () => (rng() * 2 - 1) * noise;

    if (kind === "circles") {
      // Inner blob = class 1, outer ring = class 0.
      for (let i = 0; i < n; i++) {
        const inner = i % 2 === 0;
        const r = inner ? rng() * 0.4 : 0.6 + rng() * 0.4;
        const a = rng() * Math.PI * 2;
        pts.push({
          x: r * Math.cos(a) + jitter(),
          y: r * Math.sin(a) + jitter(),
          label: inner ? 1 : 0,
        });
      }
    } else if (kind === "spirals") {
      // Two interleaved spirals.
      const per = Math.floor(n / 2);
      for (let c = 0; c < 2; c++) {
        for (let i = 0; i < per; i++) {
          const t = (i / per) * 3.2; // radians of sweep
          const r = 0.15 + t * 0.26;
          const a = t * 2.0 + c * Math.PI;
          pts.push({
            x: r * Math.cos(a) + jitter() * 0.6,
            y: r * Math.sin(a) + jitter() * 0.6,
            label: c,
          });
        }
      }
    } else {
      // "xor" — four diagonal blobs forming an XOR pattern.
      const centers = [
        { cx: -0.5, cy: -0.5, label: 0 },
        { cx: 0.5, cy: 0.5, label: 0 },
        { cx: -0.5, cy: 0.5, label: 1 },
        { cx: 0.5, cy: -0.5, label: 1 },
      ];
      for (let i = 0; i < n; i++) {
        const c = centers[i % 4];
        pts.push({
          x: c.cx + (rng() * 2 - 1) * 0.32 + jitter(),
          y: c.cy + (rng() * 2 - 1) * 0.32 + jitter(),
          label: c.label,
        });
      }
    }
    return pts;
  }

  /* ===========================================================================
     Network. Layers stored as weight matrices + bias vectors.
     Layout: [2] -> [h1] -> [h2] -> [1]
     =========================================================================== */
  function Net(config) {
    this.config = config;
    this.init();
  }

  Net.prototype.init = function () {
    const c = this.config;
    this.rng = mulberry32(c.seed || 1234);
    this.act = ACT[c.activation] || ACT.tanh;
    this.lr = c.learningRate;

    const sizes = [2, c.hidden, c.hidden, 1];
    this.sizes = sizes;
    this.W = [];
    this.b = [];

    for (let l = 0; l < sizes.length - 1; l++) {
      const inN = sizes[l];
      const outN = sizes[l + 1];
      // He-ish / Xavier-ish scaling for stable starts.
      const scale = Math.sqrt(2 / (inN + outN));
      const w = new Float64Array(inN * outN);
      const bias = new Float64Array(outN);
      for (let i = 0; i < w.length; i++) {
        w[i] = (this.rng() * 2 - 1) * scale * 2;
      }
      this.W.push(w);
      this.b.push(bias);
    }
    this.epoch = 0;
    this.loss = NaN;
  };

  // Forward for a single sample; returns {acts: [...layer activations], out}.
  Net.prototype.forward = function (x0, y0) {
    const acts = [[x0, y0]];
    let prev = acts[0];
    for (let l = 0; l < this.W.length; l++) {
      const inN = this.sizes[l];
      const outN = this.sizes[l + 1];
      const w = this.W[l];
      const b = this.b[l];
      const isLast = l === this.W.length - 1;
      const out = new Array(outN);
      for (let j = 0; j < outN; j++) {
        let z = b[j];
        for (let i = 0; i < inN; i++) {
          z += prev[i] * w[i * outN + j];
        }
        out[j] = isLast ? sigmoid(z) : this.act.f(z);
      }
      acts.push(out);
      prev = out;
    }
    return acts;
  };

  // Just the scalar prediction in [0,1] for boundary rendering.
  Net.prototype.predict = function (x0, y0) {
    const acts = this.forward(x0, y0);
    return acts[acts.length - 1][0];
  };

  // One full-batch gradient-descent step over `data`. Returns mean BCE loss.
  Net.prototype.trainStep = function (data) {
    const L = this.W.length;
    // Gradient accumulators, same shapes as W and b.
    const gW = this.W.map((w) => new Float64Array(w.length));
    const gb = this.b.map((b) => new Float64Array(b.length));

    let totalLoss = 0;
    const eps = 1e-7;

    for (let s = 0; s < data.length; s++) {
      const pt = data[s];
      const acts = this.forward(pt.x, pt.y);
      const yhat = acts[L][0];
      const target = pt.label;

      // Binary cross-entropy.
      totalLoss += -(
        target * Math.log(yhat + eps) +
        (1 - target) * Math.log(1 - yhat + eps)
      );

      // delta per layer (error signal wrt pre-activation z).
      const deltas = new Array(L);
      // Output layer: with sigmoid + BCE, dL/dz = (yhat - target).
      deltas[L - 1] = [yhat - target];

      // Backpropagate through hidden layers.
      for (let l = L - 2; l >= 0; l--) {
        const outN = this.sizes[l + 1];
        const nextN = this.sizes[l + 2];
        const wNext = this.W[l + 1];
        const aThis = acts[l + 1]; // post-activation of this hidden layer
        const dNext = deltas[l + 1];
        const d = new Array(outN);
        for (let j = 0; j < outN; j++) {
          let sum = 0;
          for (let k = 0; k < nextN; k++) {
            sum += wNext[j * nextN + k] * dNext[k];
          }
          d[j] = sum * this.act.d(aThis[j]);
        }
        deltas[l] = d;
      }

      // Accumulate gradients.
      for (let l = 0; l < L; l++) {
        const inN = this.sizes[l];
        const outN = this.sizes[l + 1];
        const aPrev = acts[l];
        const d = deltas[l];
        const gw = gW[l];
        const gbl = gb[l];
        for (let j = 0; j < outN; j++) {
          gbl[j] += d[j];
          const aprefix = d[j];
          for (let i = 0; i < inN; i++) {
            gw[i * outN + j] += aPrev[i] * aprefix;
          }
        }
      }
    }

    // Apply averaged gradients.
    const m = data.length;
    const lr = this.lr;
    for (let l = 0; l < L; l++) {
      const w = this.W[l];
      const gw = gW[l];
      for (let i = 0; i < w.length; i++) {
        w[i] -= (lr * gw[i]) / m;
      }
      const b = this.b[l];
      const gbl = gb[l];
      for (let j = 0; j < b.length; j++) {
        b[j] -= (lr * gbl[j]) / m;
      }
    }

    this.epoch += 1;
    this.loss = totalLoss / m;
    return this.loss;
  };

  // Training accuracy at the 0.5 threshold.
  Net.prototype.accuracy = function (data) {
    let correct = 0;
    for (let i = 0; i < data.length; i++) {
      const p = this.predict(data[i].x, data[i].y) >= 0.5 ? 1 : 0;
      if (p === data[i].label) correct++;
    }
    return data.length ? correct / data.length : 0;
  };

  window.PlaygroundNN = { Net, makeDataset, mulberry32 };
})();
