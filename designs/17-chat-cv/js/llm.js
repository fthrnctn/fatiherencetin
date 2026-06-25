/* =========================================================================
 * llm.js — OPTIONAL, additive WebGPU upgrade. NOT the default path.
 *
 * The required experience is the instant TF-IDF retrieval-QA (chat.js). This
 * module only does something when the user explicitly clicks the "load local
 * model" button. If clicked and WebGPU is available, it lazy-imports
 * Transformers.js and loads a small instruct model, then RE-PHRASES answers
 * grounded strictly on the retrieved chunk text. It NEVER fetches anything on
 * page load. If WebGPU/CDN is unavailable, it fails gracefully and the instant
 * retrieval path keeps working untouched.
 *
 * Honesty: this is clearly labeled as an optional ~1GB download. The retrieved
 * chunk remains the ground truth; the model only paraphrases it.
 * ====================================================================== */
(function () {
  "use strict";

  var state = { loading: false, ready: false, gen: null };
  var btn, statusEl;

  function setStatus(text) { if (statusEl) statusEl.textContent = text; }

  function supported() {
    return typeof navigator !== "undefined" && "gpu" in navigator;
  }

  async function load() {
    if (state.loading || state.ready) return;
    if (!supported()) {
      setStatus("WebGPU isn't available in this browser — the instant retrieval mode (default) keeps working.");
      btn.disabled = true;
      return;
    }
    state.loading = true;
    btn.disabled = true;
    btn.setAttribute("aria-busy", "true");
    setStatus("Loading a small local model in your browser (~1GB, one-time)… the chat already works without this.");

    try {
      var mod = await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2");
      var pipeline = mod.pipeline;
      state.gen = await pipeline(
        "text-generation",
        "onnx-community/Llama-3.2-1B-Instruct-q4f16",
        {
          device: "webgpu",
          progress_callback: function (p) {
            if (p && p.status === "progress" && p.file && typeof p.progress === "number") {
              setStatus("Downloading " + p.file + " — " + Math.round(p.progress) + "%");
            } else if (p && p.status === "ready") {
              setStatus("Model ready.");
            }
          }
        }
      );
      state.ready = true;
      state.loading = false;
      btn.setAttribute("aria-busy", "false");
      btn.textContent = "🧠 Local model active";
      btn.classList.add("llm-btn--active");
      setStatus("Local model active — answers are now re-phrased by an in-browser LLM, grounded strictly on the retrieved CV section.");
      document.documentElement.classList.add("llm-ready");
    } catch (e) {
      state.loading = false;
      btn.disabled = false;
      btn.setAttribute("aria-busy", "false");
      setStatus("Couldn't load the local model (network or WebGPU). No problem — the instant retrieval mode is the default and still works.");
      if (window.console) console.warn("LLM load failed:", e);
    }
  }

  // Public: rephrase a grounded answer. Returns the original text on any issue.
  async function rephrase(question, groundedText) {
    if (!state.ready || !state.gen) return groundedText;
    var messages = [
      {
        role: "system",
        content:
          "You are answering as Fatih Eren Çetin's CV assistant. Answer ONLY using the CONTEXT. " +
          "Do not add facts, numbers, or links not in the CONTEXT. Keep it to 2-3 sentences, first person."
      },
      { role: "user", content: "CONTEXT:\n" + groundedText + "\n\nQUESTION: " + question }
    ];
    try {
      var out = await state.gen(messages, { max_new_tokens: 160, do_sample: false, temperature: 0 });
      var txt = "";
      if (Array.isArray(out) && out[0] && out[0].generated_text) {
        var g = out[0].generated_text;
        if (Array.isArray(g)) { txt = (g[g.length - 1] && g[g.length - 1].content) || ""; }
        else { txt = String(g); }
      }
      txt = (txt || "").trim();
      return txt.length > 10 ? txt : groundedText;
    } catch (e) {
      return groundedText;
    }
  }

  function init() {
    btn = document.getElementById("llm-load-btn");
    statusEl = document.getElementById("llm-status");
    if (!btn) return;
    if (!supported()) {
      btn.disabled = true;
      btn.title = "WebGPU not available in this browser";
      setStatus("Optional. WebGPU not detected here — the default instant mode needs no download.");
    }
    btn.addEventListener("click", load);
    window.LocalLLM = { rephrase: rephrase, isReady: function () { return state.ready; } };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
