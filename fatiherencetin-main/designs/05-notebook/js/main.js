/* ============================================================
   Notebook execution mechanics.
   Progressive enhancement: outputs are visible by default (CSS).
   JS only adds the "run on scroll / run all" choreography.
   Under prefers-reduced-motion we DON'T hide anything.
   ============================================================ */
(function () {
  "use strict";

  var docEl = document.documentElement;
  docEl.classList.add("js");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var kernel = document.getElementById("kernel");
  var kernelState = document.getElementById("kernelState");
  var saveState = document.getElementById("saveState");

  var codeCells = Array.prototype.slice.call(
    document.querySelectorAll(".cell--code[data-exec]")
  );

  var timers = new Set();
  var busy = 0;

  function setKernel(state) {
    if (!kernel) return;
    kernel.setAttribute("data-state", state);
    if (kernelState) kernelState.textContent = state;
  }
  function busyInc() { busy++; setKernel("busy"); }
  function busyDec() { busy = Math.max(0, busy - 1); if (busy === 0) setKernel("idle"); }

  function execSpans(cell) {
    return cell.querySelectorAll(".exec");
  }
  function setExec(cell, text) {
    execSpans(cell).forEach(function (s) { s.textContent = text; });
  }

  // Put a cell back into the "not yet run" state (JS-enhanced only).
  function setPending(cell) {
    cell.dataset.state = "pending";
    cell.classList.add("is-pending");
    cell.classList.remove("is-running", "is-executed");
    setExec(cell, " "); // In[ ]:
  }

  // Mark a cell as fully executed (output visible, count assigned).
  function finishCell(cell) {
    cell.dataset.state = "done";
    cell.classList.remove("is-pending", "is-running");
    cell.classList.add("is-executed");
    setExec(cell, cell.getAttribute("data-exec"));
  }

  // Run one cell. opts.instant skips the "busy" delay.
  function runCell(cell, opts) {
    opts = opts || {};
    if (cell.dataset.state === "running" || cell.dataset.state === "done") return;

    cell.dataset.state = "running";
    cell.classList.remove("is-pending");
    cell.classList.add("is-running");
    setExec(cell, "*"); // In[*]:
    busyInc();

    if (opts.instant || reduce) {
      finishCell(cell);
      busyDec();
      return;
    }

    var t = setTimeout(function () {
      timers.delete(t);
      finishCell(cell);
      busyDec();
    }, 420 + Math.random() * 220);
    timers.add(t);
  }

  function clearTimers() {
    timers.forEach(function (t) { clearTimeout(t); });
    timers.clear();
  }

  /* ---------- top-level actions ---------- */

  // Reveal everything immediately (interrupt).
  function revealAll() {
    clearTimers();
    busy = 0;
    codeCells.forEach(function (cell) {
      cell.dataset.state = "running"; // bypass guard
      finishCell(cell);
    });
    setKernel("idle");
  }

  // Re-run all cells top-to-bottom with a stagger.
  function runAll(restart) {
    clearTimers();
    busy = 0;
    setKernel("idle");

    if (reduce) { revealAll(); return; }

    codeCells.forEach(function (cell) { setPending(cell); });
    if (saveState) saveState.textContent = "running…";

    var step = 0;
    codeCells.forEach(function (cell) {
      var t = setTimeout(function () {
        timers.delete(t);
        cell.dataset.state = "pending"; // ensure runnable
        runCell(cell);
      }, step);
      timers.add(t);
      step += 360;
    });

    var done = setTimeout(function () {
      timers.delete(done);
      if (saveState) saveState.textContent = "autosaved";
    }, step + 700);
    timers.add(done);
    void restart;
  }

  /* ---------- wire toolbar ---------- */
  function on(id, fn) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", fn);
  }
  on("btnRun", function () { runAll(false); });
  on("btnRunAll", function () { runAll(false); });
  on("btnRestart", function () { runAll(true); });
  on("btnStop", function () { revealAll(); if (saveState) saveState.textContent = "autosaved"; });

  /* ---------- click OR keyboard a code cell's input to (re)run it ---------- */
  codeCells.forEach(function (cell) {
    var source = cell.querySelector(".cell__source");
    if (!source) return;
    // focusable + runnable, but NO role/aria-label so the code text stays
    // readable to screen readers (it is real portfolio content).
    source.setAttribute("tabindex", "0");
    source.setAttribute("title", "Click or press Enter to re-run this cell");
    function trigger() {
      if (cell.dataset.state === "running") return;
      setPending(cell);
      // allow paint, then run
      requestAnimationFrame(function () { runCell(cell); });
    }
    source.addEventListener("click", trigger);
    source.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        trigger();
      }
    });
  });

  /* ---------- boot ---------- */
  if (reduce) {
    // Everything already visible via CSS; just keep counts correct.
    setKernel("idle");
    return;
  }

  // Start with code cells "un-run", then execute as they scroll into view.
  codeCells.forEach(setPending);
  setKernel("idle");

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var cell = entry.target;
        if (cell.dataset.state === "pending") runCell(cell);
        io.unobserve(cell);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.01 }); // any sliver — tall cells reveal too

    codeCells.forEach(function (cell) { io.observe(cell); });

    /* Safety backstop: a cell taller than the viewport, or any missed tick,
       must never leave its output stuck hidden. On scroll/resize, run any
       still-pending cell that has reached the viewport. */
    var backstop = function () {
      var vh = window.innerHeight || docEl.clientHeight || 0;
      codeCells.forEach(function (cell) {
        if (cell.dataset.state !== "pending") return;
        var r = cell.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) { io.unobserve(cell); runCell(cell); }
      });
    };
    window.addEventListener("scroll", backstop, { passive: true });
    window.addEventListener("resize", backstop, { passive: true });
  } else {
    // No IO support: just reveal everything.
    revealAll();
  }
})();
