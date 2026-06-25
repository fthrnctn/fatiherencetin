/* =========================================================================
 * chat.js — the conversational UI controller over the retriever.
 *
 * Responsibilities:
 *   - Seed a friendly first message + suggested-question chips.
 *   - On submit/chip-click: retrieve via window.Retriever, then render a
 *     GROUNDED answer composed only from KB chunks, with a source tag.
 *   - If no chunk clears the confidence threshold → honest "not in my CV".
 *   - Keyboard-accessible, ARIA live region, optional typing animation
 *     (disabled under prefers-reduced-motion).
 *
 * No network. No model. Pure DOM + the local TF-IDF retriever.
 * ====================================================================== */
(function () {
  "use strict";

  var SCORE_THRESHOLD = 0.08;  // below this, we decline rather than invent
  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var els = {};
  var msgSeq = 0;

  function $(sel, root) { return (root || document).querySelector(sel); }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function scrollToBottom() {
    if (!els.log) return;
    els.log.scrollTop = els.log.scrollHeight;
  }

  /* ---- message rendering ---------------------------------------------- */

  function addUserMessage(text) {
    var wrap = el("div", "msg msg--user");
    wrap.setAttribute("role", "listitem");
    var bubble = el("div", "msg__bubble");
    bubble.appendChild(el("p", "msg__text", text));
    wrap.appendChild(bubble);
    els.log.appendChild(wrap);
    scrollToBottom();
  }

  // returns the bubble element so the typewriter can fill it in
  function addBotShell(sourceLabel, linkObj) {
    var id = "botmsg-" + (++msgSeq);
    var wrap = el("div", "msg msg--bot");
    wrap.setAttribute("role", "listitem");

    var avatar = el("div", "msg__avatar", "");
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = "FC";

    var bubble = el("div", "msg__bubble");
    bubble.id = id;

    var body = el("p", "msg__text");
    bubble.appendChild(body);

    if (sourceLabel) {
      var meta = el("div", "msg__meta");
      var tag = el("span", "msg__source");
      tag.textContent = "— from: " + sourceLabel;
      meta.appendChild(tag);
      bubble.appendChild(meta);

      if (linkObj && linkObj.href) {
        var a = el("a", "msg__link");
        a.href = linkObj.href;
        a.textContent = linkObj.label || "Open link";
        if (/^https?:/i.test(linkObj.href)) {
          a.target = "_blank";
          a.rel = "noopener noreferrer";
        }
        meta.appendChild(a);
      }
    }

    wrap.appendChild(avatar);
    wrap.appendChild(bubble);
    els.log.appendChild(wrap);
    scrollToBottom();
    return { wrap: wrap, body: body };
  }

  function typewriter(node, text, done) {
    if (reduceMotion) {
      node.textContent = text;
      if (done) done();
      scrollToBottom();
      return;
    }
    node.textContent = "";
    var i = 0;
    var step = Math.max(1, Math.round(text.length / 160)); // finish in ~constant time
    var timer = setInterval(function () {
      i += step;
      node.textContent = text.slice(0, i);
      scrollToBottom();
      if (i >= text.length) {
        clearInterval(timer);
        node.textContent = text;
        if (done) done();
      }
    }, 14);
  }

  function showThinking() {
    var wrap = el("div", "msg msg--bot msg--thinking");
    wrap.setAttribute("aria-hidden", "true");
    var avatar = el("div", "msg__avatar");
    avatar.textContent = "FC";
    var bubble = el("div", "msg__bubble");
    var dots = el("div", "thinking");
    dots.appendChild(el("span"));
    dots.appendChild(el("span"));
    dots.appendChild(el("span"));
    bubble.appendChild(dots);
    wrap.appendChild(avatar);
    wrap.appendChild(bubble);
    els.log.appendChild(wrap);
    scrollToBottom();
    return wrap;
  }

  /* ---- the core: answer a question ------------------------------------ */

  function answer(question) {
    addUserMessage(question);
    announce("You asked: " + question);

    var result = window.Retriever.search(question);
    var hits = result.hits || [];
    var top = hits[0];

    var delay = reduceMotion ? 0 : 360;
    var thinking = reduceMotion ? null : showThinking();

    setTimeout(function () {
      if (thinking && thinking.parentNode) thinking.parentNode.removeChild(thinking);

      // No confident match → honest decline. Never invent.
      if (!top || top.score < SCORE_THRESHOLD) {
        var shell = addBotShell("Honest answer", {
          label: window.KB.contact.email,
          href: "mailto:" + window.KB.contact.email
        });
        var declineText =
          "That's not something covered in my CV, so I won't guess. " +
          "For anything beyond what's here, reach me at " + window.KB.contact.email + ".";
        typewriter(shell.body, declineText, function () { announce(declineText); });
        renderFollowups();
        return;
      }

      var chunk = top.chunk;
      var linkObj = chunk.link || null;
      var shell2 = addBotShell(chunk.source, linkObj);
      var bodyText = chunk.text;

      // OPTIONAL upgrade: if the local LLM was explicitly loaded by the user,
      // let it re-phrase the grounded chunk. The chunk text remains ground
      // truth; on any failure we fall straight back to the verbatim chunk.
      if (window.LocalLLM && window.LocalLLM.isReady()) {
        shell2.body.textContent = "…";
        window.LocalLLM.rephrase(question, bodyText).then(function (phrased) {
          shell2.body.textContent = phrased;
          finishAnswer(shell2, chunk, linkObj, hits, top, phrased, true);
        }).catch(function () {
          shell2.body.textContent = bodyText;
          finishAnswer(shell2, chunk, linkObj, hits, top, bodyText, false);
        });
      } else {
        typewriter(shell2.body, bodyText, function () {
          finishAnswer(shell2, chunk, linkObj, hits, top, bodyText, false);
        });
      }

      renderFollowups();
    }, delay);
  }

  // Appends the link-note + "also relevant" runner-up after the body text is
  // in place. `viaLLM` flags answers re-phrased by the optional local model.
  function finishAnswer(shell, chunk, linkObj, hits, top, spokenText, viaLLM) {
    if (viaLLM) {
      var badge = el("div", "msg__meta");
      badge.appendChild(el("span", "msg__llm", "re-phrased by local LLM · grounded on " + chunk.source));
      shell.body.parentNode.appendChild(badge);
    }
    if (!linkObj && chunk.noLink && chunk.linkNote) {
      var note = el("div", "msg__meta");
      note.appendChild(el("span", "msg__note", chunk.linkNote));
      shell.body.parentNode.appendChild(note);
    }
    // surface a runner-up if it's also strong & meaningfully different
    var second = hits[1];
    if (second && second.score > SCORE_THRESHOLD * 2 &&
        second.chunk.id !== chunk.id && second.score > top.score * 0.5) {
      var rel = el("div", "msg__related");
      var b = el("button", "msg__related-btn");
      b.type = "button";
      b.textContent = "Also relevant: " + second.chunk.source;
      b.addEventListener("click", function () {
        var s = addBotShell(second.chunk.source, second.chunk.link || null);
        typewriter(s.body, second.chunk.text, function () {
          if (!second.chunk.link && second.chunk.noLink && second.chunk.linkNote) {
            var nn = el("div", "msg__meta");
            nn.appendChild(el("span", "msg__note", second.chunk.linkNote));
            s.body.parentNode.appendChild(nn);
          }
        });
        b.disabled = true;
      });
      rel.appendChild(b);
      shell.body.parentNode.appendChild(rel);
    }
    announce(spokenText);
    scrollToBottom();
  }

  /* ---- suggested-question chips --------------------------------------- */

  function renderChips(container, questions) {
    container.textContent = "";
    questions.forEach(function (q) {
      var chip = el("button", "chip", q);
      chip.type = "button";
      chip.addEventListener("click", function () {
        answer(q);
        focusInput();
      });
      container.appendChild(chip);
    });
  }

  // a rotating set of follow-ups shown after each answer
  function renderFollowups() {
    if (!els.followups) return;
    var all = window.KB.suggestedChips.slice();
    // simple rotation so it doesn't feel static
    renderFollowups._i = (renderFollowups._i || 0) + 1;
    var rotated = all.slice(renderFollowups._i % all.length)
      .concat(all.slice(0, renderFollowups._i % all.length));
    renderChips(els.followups, rotated.slice(0, 4));
  }

  /* ---- a11y live region ----------------------------------------------- */

  function announce(text) {
    if (els.live) els.live.textContent = text;
  }

  function focusInput() {
    if (els.input) els.input.focus();
  }

  /* ---- init ----------------------------------------------------------- */

  function init() {
    els.log = $("#chat-log");
    els.form = $("#chat-form");
    els.input = $("#chat-input");
    els.chips = $("#chat-chips");
    els.followups = $("#chat-followups");
    els.live = $("#chat-live");

    if (!els.log || !els.form || !els.input) return; // no-JS markup stays

    // The static FAQ ships open so no-JS users see every answer immediately.
    // With JS on, the live chat supersedes it — collapse it to a tidy nicety.
    var faq = $("#static-faq");
    if (faq) faq.removeAttribute("open");

    // ensure retriever is built
    if (window.Retriever && !window.Retriever.ready) window.Retriever.build();

    // seed message
    var seed = addBotShell("Fatih Eren Çetin · live", null);
    var seedText =
      "Hi — I'm a tiny RAG widget grounded in Fatih's real CV. Ask me anything " +
      "about his projects, experience, stack or governance work. I retrieve the " +
      "best-matching section client-side and answer only from what's actually there. " +
      "Try a question below 👇";
    // seed renders instantly even with motion on (don't make recruiters wait)
    seed.body.textContent = seedText;

    renderChips(els.chips, window.KB.suggestedChips);

    els.form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = els.input.value.trim();
      if (!v) return;
      answer(v);
      els.input.value = "";
      els.input.focus();
    });
    // Enter submits via the native form's submit event above — no extra
    // keydown handler needed; this keeps the input fully keyboard-operable.
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.ChatCV = { ask: answer };
})();
