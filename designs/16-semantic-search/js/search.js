/* ============================================================================
   search.js — a REAL client-side search engine over Fatih's portfolio.

   The instant, no-download default is genuine TF-IDF + cosine similarity:
     - tokenize + light stemming
     - per-document term frequencies (sublinear: 1 + log tf)
     - inverse document frequency: ln(1 + N / df)
     - L2-normalized tf-idf vectors; query scored by cosine similarity
   This is honestly the same family of lexical retrieval that pairs with the
   dense/hybrid RAG Fatih ships in production. Nothing here is hardcoded — the
   ranking is computed from the corpus at runtime.

   Optional "⚡ semantic mode" lazy-loads a MiniLM embedder via Transformers.js
   and re-ranks by embedding cosine. It is purely additive and never blocks load.
   ============================================================================ */
(function () {
  "use strict";

  const { PROFILE, STATS, DOCS, SUGGESTED_QUERIES } = window.PORTFOLIO;

  /* --------------------------- tokenization ------------------------------ */
  // Keep alphanumerics; treat ISO/MCP-style tokens reasonably. Lowercase.
  const STOP = new Set(
    ("a an and are as at be by for from has have in into is it its of on or " +
      "that the to was were will with this these those over via per " +
      "i my me we our")
      .split(" ")
  );

  function tokenize(str) {
    if (!str) return [];
    return String(str)
      .toLowerCase()
      // split on anything that's not a letter/number; keep + and . inside tokens
      .split(/[^a-z0-9.+]+/i)
      .map((t) => t.replace(/^[.+]+|[.+]+$/g, "")) // trim stray punctuation
      .filter((t) => t.length >= 2 && !STOP.has(t))
      .map(stem);
  }

  // Very light, conservative stemmer (plurals / common endings only).
  function stem(t) {
    if (t.length <= 3) return t;
    if (t.endsWith("ies")) return t.slice(0, -3) + "y";
    if (t.endsWith("sses")) return t.slice(0, -2);
    if (t.endsWith("ing") && t.length > 5) return t.slice(0, -3);
    if (t.endsWith("ed") && t.length > 4) return t.slice(0, -2);
    if (t.endsWith("s") && !t.endsWith("ss")) return t.slice(0, -1);
    return t;
  }

  /* ------------------------ build the TF-IDF index ----------------------- */
  const N = DOCS.length;
  const df = Object.create(null); // term -> document frequency

  // Field weighting: title & tag & stack terms count extra (repeated).
  function docTerms(doc) {
    const titleTokens = tokenize(doc.title);
    const tagTokens = tokenize(doc.tag);
    const stackTokens = (doc.stack || []).flatMap(tokenize);
    const bodyTokens = tokenize(doc.text);
    // weight by repetition: title x3, tag x2, stack x2, body x1
    return []
      .concat(titleTokens, titleTokens, titleTokens)
      .concat(tagTokens, tagTokens)
      .concat(stackTokens, stackTokens)
      .concat(bodyTokens);
  }

  const index = DOCS.map((doc) => {
    const terms = docTerms(doc);
    const tf = Object.create(null);
    for (const term of terms) tf[term] = (tf[term] || 0) + 1;
    for (const term of Object.keys(tf)) df[term] = (df[term] || 0) + 1;
    return { doc, tf, terms };
  });

  const idf = Object.create(null);
  for (const term of Object.keys(df)) {
    idf[term] = Math.log(1 + N / df[term]);
  }

  // Precompute L2-normalized tf-idf weight vectors per doc.
  for (const entry of index) {
    const w = Object.create(null);
    let sumSq = 0;
    for (const term of Object.keys(entry.tf)) {
      const weight = (1 + Math.log(entry.tf[term])) * (idf[term] || 0);
      w[term] = weight;
      sumSq += weight * weight;
    }
    const norm = Math.sqrt(sumSq) || 1;
    for (const term of Object.keys(w)) w[term] /= norm;
    entry.w = w;
    entry.norm = norm;
  }

  /* ----------------------------- query scoring --------------------------- */
  function lexicalSearch(query) {
    const qTokens = tokenize(query);
    if (qTokens.length === 0) return [];

    const qtf = Object.create(null);
    for (const t of qTokens) qtf[t] = (qtf[t] || 0) + 1;

    // L2-normalized tf-idf query vector
    const qw = Object.create(null);
    let qSumSq = 0;
    for (const term of Object.keys(qtf)) {
      const weight = (1 + Math.log(qtf[term])) * (idf[term] || 0);
      qw[term] = weight;
      qSumSq += weight * weight;
    }
    const qNorm = Math.sqrt(qSumSq) || 1;
    for (const term of Object.keys(qw)) qw[term] /= qNorm;

    const queryTermSet = new Set(Object.keys(qtf));

    const results = [];
    for (const entry of index) {
      let score = 0;
      for (const term of Object.keys(qw)) {
        if (entry.w[term]) score += qw[term] * entry.w[term];
      }
      // tiny prefix-match bonus so partial typing ("forecast") still surfaces
      // documents whose terms start with the query token ("forecasting").
      let prefixHit = false;
      if (score === 0) {
        for (const qt of queryTermSet) {
          for (const dt of Object.keys(entry.tf)) {
            if (dt.startsWith(qt) && qt.length >= 3) {
              score += 0.05 * (idf[dt] || 0);
              prefixHit = true;
              break;
            }
          }
          if (prefixHit) break;
        }
      }
      if (score > 0) {
        results.push({ doc: entry.doc, score, matched: queryTermSet });
      }
    }
    results.sort((a, b) => b.score - a.score);
    return results;
  }

  /* --------------------- snippet + highlight rendering ------------------- */
  // Turn a raw display word into the same comparable stems the index uses.
  // A word like "Multi-Agent" yields ["multiagent","multi","agent"] so that
  // hyphenated/compound display text highlights for tokenized queries too.
  function wordStems(raw) {
    if (!raw) return [];
    const lower = String(raw).toLowerCase();
    const out = [];
    // whole-word form (mirror tokenize's trim of stray . / +)
    const whole = lower.replace(/[^a-z0-9.+]/gi, "").replace(/^[.+]+|[.+]+$/g, "");
    if (whole.length >= 2) out.push(stem(whole));
    // sub-tokens split on the same boundaries tokenize uses
    for (const sub of lower.split(/[^a-z0-9.+]+/i)) {
      const t = sub.replace(/^[.+]+|[.+]+$/g, "");
      if (t.length >= 2) out.push(stem(t));
    }
    return out;
  }

  // Build a snippet around the first matched term; highlight all matched terms.
  function makeSnippet(text, queryTokens) {
    const words = text.split(/\s+/);
    let hit = -1;
    for (let i = 0; i < words.length; i++) {
      if (matchesAny(wordStems(words[i]), queryTokens)) {
        hit = i;
        break;
      }
    }
    let start = 0;
    if (hit > -1) start = Math.max(0, hit - 8);
    const slice = words.slice(start, start + 34);
    let snippet = slice.join(" ");
    if (start > 0) snippet = "… " + snippet;
    if (start + 34 < words.length) snippet += " …";
    return highlight(snippet, queryTokens);
  }

  // `stems` is one stem or an array of stems for a display word.
  function matchesAny(stems, queryTokens) {
    const list = Array.isArray(stems) ? stems : [stems];
    for (const stemmed of list) {
      if (!stemmed) continue;
      for (const qt of queryTokens) {
        if (stemmed === qt) return true;
        if (qt.length >= 3 && stemmed.startsWith(qt)) return true;
      }
    }
    return false;
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function highlight(text, queryTokens) {
    // Highlight word-by-word so we match on the stem, not raw substring.
    return text
      .split(/(\s+)/)
      .map((piece) => {
        if (/^\s+$/.test(piece)) return piece;
        const stems = wordStems(piece);
        const safe = escapeHtml(piece);
        if (stems.length && matchesAny(stems, queryTokens)) {
          return "<mark>" + safe + "</mark>";
        }
        return safe;
      })
      .join("");
  }

  /* ============================ DOM / UI ================================= */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const KIND_LABEL = {
    project: "Project",
    experience: "Experience",
    skill: "Skill group",
    cert: "Certification",
    about: "About",
    education: "Education",
  };

  const els = {};
  let semantic = null; // { embed(text)->Float32Array, docVecs:[], ready:bool }
  let semanticOn = false;
  let lastQuery = "";

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    els.input = $("#search-input");
    els.results = $("#results");
    els.resultMeta = $("#result-meta");
    els.chips = $("#chips");
    els.catalog = $("#catalog");
    els.clear = $("#clear-btn");
    els.semanticBtn = $("#semantic-btn");
    els.semanticStatus = $("#semantic-status");

    if (!els.input) return; // no-JS / structure missing — static catalog stands

    // The input ships `disabled` so it can't be typed into when JS is off
    // (the static catalog is the fallback then). JS re-enables it now.
    els.input.disabled = false;
    els.input.removeAttribute("disabled");

    // Mark JS as active (CSS reveals interactive chrome).
    document.documentElement.classList.add("js");

    renderChips();
    renderCatalog();
    wireEvents();

    // Deep-link support: #q=foo
    const hashQ = decodeURIComponent((location.hash.match(/q=([^&]*)/) || [])[1] || "");
    if (hashQ) {
      els.input.value = hashQ;
      runSearch(hashQ);
    }
    // Command-palette autofocus — but only on fine-pointer devices, so we don't
    // force the on-screen keyboard open on phones the moment the page loads.
    const finePointer =
      window.matchMedia && window.matchMedia("(pointer: fine)").matches;
    if (finePointer) {
      els.input.focus({ preventScroll: true });
    }
  }

  function wireEvents() {
    els.input.addEventListener("input", (e) => runSearch(e.target.value));
    els.clear.addEventListener("click", () => {
      els.input.value = "";
      runSearch("");
      els.input.focus();
    });
    // "/" focuses the search box (command-palette feel).
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== els.input) {
        e.preventDefault();
        els.input.focus();
        els.input.select();
      }
      if (e.key === "Escape" && document.activeElement === els.input) {
        els.input.value = "";
        runSearch("");
      }
    });
    if (els.semanticBtn) {
      els.semanticBtn.addEventListener("click", toggleSemantic);
    }
  }

  function renderChips() {
    els.chips.innerHTML = "";
    for (const q of SUGGESTED_QUERIES) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = q;
      b.setAttribute("aria-label", "Search for " + q);
      b.addEventListener("click", () => {
        els.input.value = q;
        runSearch(q);
        els.input.focus();
      });
      els.chips.appendChild(b);
    }
  }

  /* ---------------------------- run a search ----------------------------- */
  function runSearch(rawQuery) {
    const query = (rawQuery || "").trim();
    lastQuery = query;
    els.clear.hidden = query.length === 0;

    if (query.length === 0) {
      els.results.innerHTML = "";
      els.results.hidden = true;
      els.resultMeta.textContent = "";
      els.resultMeta.hidden = true;
      els.catalog.hidden = false;
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
      return;
    }

    els.catalog.hidden = true;
    els.results.hidden = false;
    els.resultMeta.hidden = false;

    let ranked = lexicalSearch(query);
    let mode = "BM25-style TF-IDF · cosine";

    if (semanticOn && semantic && semantic.ready) {
      ranked = semanticRerank(query, ranked);
      mode = "semantic re-rank · MiniLM embeddings";
    }

    renderResults(ranked, query, mode);
    try {
      history.replaceState(null, "", "#q=" + encodeURIComponent(query));
    } catch (e) {}
  }

  function renderResults(ranked, query, mode) {
    const qTokens = tokenize(query);
    els.results.innerHTML = "";

    if (ranked.length === 0) {
      els.resultMeta.innerHTML =
        '<span class="rm-count">0 results</span>' +
        '<span class="visually-hidden"> — ranked by </span>' +
        '<span class="rm-mode">' + escapeHtml(mode) + "</span>";
      const empty = document.createElement("div");
      empty.className = "no-results";
      empty.innerHTML =
        "<p><strong>No matches for “" + escapeHtml(query) + "”.</strong></p>" +
        "<p>Nothing in Fatih's verified portfolio matches that. I only answer from real content — " +
        "I won't invent a result. Try one of the suggested queries, or browse the full catalog below.</p>";
      els.results.appendChild(empty);
      // Also reveal the catalog underneath as a graceful fallback.
      els.catalog.hidden = false;
      return;
    }

    const max = ranked[0].score || 1;
    els.resultMeta.innerHTML =
      '<span class="rm-count">' +
      ranked.length +
      (ranked.length === 1 ? " result" : " results") +
      "</span>" +
      '<span class="visually-hidden"> — ranked by </span>' +
      '<span class="rm-mode" title="Ranking computed live in your browser — not hardcoded">' +
      escapeHtml(mode) +
      "</span>";

    for (const r of ranked) {
      els.results.appendChild(resultCard(r, qTokens, max));
    }
  }

  function resultCard(r, qTokens, maxScore) {
    const d = r.doc;
    const card = document.createElement("article");
    card.className = "result kind-" + d.kind;

    const head = document.createElement("div");
    head.className = "result-head";

    const tag = document.createElement("span");
    tag.className = "result-tag";
    tag.textContent = d.tag;
    head.appendChild(tag);

    const kind = document.createElement("span");
    kind.className = "result-kind";
    kind.textContent = KIND_LABEL[d.kind] || d.kind;
    head.appendChild(kind);

    // relevance bar — visualizes the REAL computed score (normalized to top hit)
    const relWrap = document.createElement("span");
    relWrap.className = "result-rel";
    const pct = Math.round((r.score / maxScore) * 100);
    relWrap.title = "Relevance score " + r.score.toFixed(3) + " (cosine)";
    relWrap.setAttribute("role", "img");
    relWrap.setAttribute(
      "aria-label",
      "relevance " + pct + "% (cosine score " + r.score.toFixed(3) + ")"
    );
    relWrap.innerHTML =
      '<span class="rel-bar" aria-hidden="true"><span class="rel-fill" style="width:' +
      pct +
      '%"></span></span><span class="rel-num" aria-hidden="true">' +
      pct +
      "</span>";
    head.appendChild(relWrap);

    card.appendChild(head);

    const h = document.createElement("h3");
    h.className = "result-title";
    h.innerHTML = highlight(d.title, qTokens);
    card.appendChild(h);

    const p = document.createElement("p");
    p.className = "result-snippet";
    p.innerHTML = makeSnippet(d.text, qTokens);
    card.appendChild(p);

    const foot = document.createElement("div");
    foot.className = "result-foot";

    if (d.link && d.link.href) {
      const a = document.createElement("a");
      a.className = "result-link";
      a.href = d.link.href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.innerHTML = "↗ " + escapeHtml(d.link.label);
      foot.appendChild(a);
    } else if (d.state) {
      const s = document.createElement("span");
      s.className = "result-state";
      s.textContent = d.state;
      foot.appendChild(s);
    }
    card.appendChild(foot);
    return card;
  }

  /* --------------------------- catalog (empty state) --------------------- */
  function renderCatalog() {
    const groups = [
      { kind: "project", title: "Projects" },
      { kind: "experience", title: "Experience" },
      { kind: "education", title: "Education" },
      { kind: "skill", title: "Skills" },
      { kind: "cert", title: "Certifications" },
    ];
    els.catalog.innerHTML = "";
    for (const g of groups) {
      const docs = DOCS.filter((d) => d.kind === g.kind);
      if (!docs.length) continue;
      const section = document.createElement("section");
      section.className = "cat-section";
      section.setAttribute("aria-label", g.title);

      const h = document.createElement("h2");
      h.className = "cat-title";
      h.textContent = g.title;
      section.appendChild(h);

      const grid = document.createElement("div");
      grid.className = "cat-grid kind-" + g.kind;
      for (const d of docs) grid.appendChild(catalogCard(d));
      section.appendChild(grid);
      els.catalog.appendChild(section);
    }
  }

  function catalogCard(d) {
    const card = document.createElement("article");
    card.className = "cat-card kind-" + d.kind;

    const head = document.createElement("div");
    head.className = "result-head";
    const tag = document.createElement("span");
    tag.className = "result-tag";
    tag.textContent = d.tag;
    head.appendChild(tag);
    card.appendChild(head);

    const h = document.createElement("h3");
    h.className = "result-title";
    h.textContent = d.title;
    card.appendChild(h);

    const p = document.createElement("p");
    p.className = "result-snippet";
    p.textContent = d.text;
    card.appendChild(p);

    if (d.stack && d.stack.length) {
      const tw = document.createElement("div");
      tw.className = "stack";
      for (const s of d.stack) {
        const sp = document.createElement("span");
        sp.className = "stack-tag";
        sp.textContent = s;
        tw.appendChild(sp);
      }
      card.appendChild(tw);
    }

    const foot = document.createElement("div");
    foot.className = "result-foot";
    if (d.link && d.link.href) {
      const a = document.createElement("a");
      a.className = "result-link";
      a.href = d.link.href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.innerHTML = "↗ " + escapeHtml(d.link.label);
      foot.appendChild(a);
    } else if (d.state) {
      const s = document.createElement("span");
      s.className = "result-state";
      s.textContent = d.state;
      foot.appendChild(s);
    }
    card.appendChild(foot);
    return card;
  }

  /* ===================== OPTIONAL: semantic mode ========================= */
  // Lazy-loads Transformers.js + all-MiniLM-L6-v2 ONLY on explicit click.
  async function toggleSemantic() {
    if (semanticOn) {
      semanticOn = false;
      els.semanticBtn.classList.remove("on");
      els.semanticBtn.setAttribute("aria-pressed", "false");
      els.semanticStatus.textContent = "Semantic mode off · using instant TF-IDF.";
      if (lastQuery) runSearch(lastQuery);
      return;
    }

    if (semantic && semantic.ready) {
      semanticOn = true;
      els.semanticBtn.classList.add("on");
      els.semanticBtn.setAttribute("aria-pressed", "true");
      els.semanticStatus.textContent = "Semantic mode on · re-ranking with MiniLM.";
      if (lastQuery) runSearch(lastQuery);
      return;
    }

    // First activation: load the model.
    els.semanticBtn.disabled = true;
    els.semanticBtn.classList.add("loading");
    els.semanticStatus.textContent = "Loading embedder (~30MB, once)… BM25 still active.";

    try {
      const mod = await import(
        "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2"
      );
      const { pipeline, env } = mod;
      env.allowLocalModels = false;

      els.semanticStatus.textContent = "Downloading all-MiniLM-L6-v2…";
      const extractor = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2",
        {
          progress_callback: (p) => {
            if (p && p.status === "progress" && p.progress != null) {
              els.semanticStatus.textContent =
                "Downloading model… " + Math.round(p.progress) + "%";
            }
          },
        }
      );

      const embed = async (text) => {
        const out = await extractor(text, { pooling: "mean", normalize: true });
        return out.data; // Float32Array, normalized
      };

      els.semanticStatus.textContent = "Embedding " + DOCS.length + " documents…";
      const docVecs = [];
      for (const d of DOCS) {
        docVecs.push(await embed(d.title + ". " + d.text));
      }

      semantic = { embed, docVecs, ready: true };
      semanticOn = true;
      els.semanticBtn.classList.remove("loading");
      els.semanticBtn.classList.add("on");
      els.semanticBtn.setAttribute("aria-pressed", "true");
      els.semanticStatus.textContent =
        "Semantic mode ready · " + DOCS.length + " docs embedded, re-ranking on.";
      if (lastQuery) runSearch(lastQuery);
    } catch (err) {
      els.semanticBtn.classList.remove("loading");
      els.semanticStatus.textContent =
        "Couldn't load the embedder (offline / blocked). Instant TF-IDF still works perfectly.";
      // leave semanticOn false — lexical path is untouched
      console.warn("Semantic mode failed to load:", err);
    } finally {
      els.semanticBtn.disabled = false;
    }
  }

  function cosine(a, b) {
    // both are L2-normalized already → dot product
    let dot = 0;
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) dot += a[i] * b[i];
    return dot;
  }

  function semanticRerank(query, lexicalRanked) {
    // Embed the query, score ALL docs by embedding cosine, then blend with the
    // lexical score so results stay honest (pure-vector can drift on tiny corpora).
    // This runs synchronously off the cached query vector.
    // We embed the query inline via a cached promise to keep the input handler snappy.
    // For simplicity here we compute against precomputed doc vectors.
    if (!semantic._qCache) semantic._qCache = Object.create(null);
    // Synchronous fallback: if query not yet embedded, kick off async + return lexical.
    if (semantic._qCache[query] === undefined) {
      semantic._qCache[query] = null; // pending
      semantic.embed(query).then((vec) => {
        semantic._qCache[query] = vec;
        if (lastQuery === query) runSearch(query); // re-render once ready
      });
      return lexicalRanked; // show lexical instantly; semantic refines a tick later
    }
    const qVec = semantic._qCache[query];
    if (!qVec) return lexicalRanked;

    const lexById = Object.create(null);
    const maxLex = (lexicalRanked[0] && lexicalRanked[0].score) || 1;
    for (const r of lexicalRanked) lexById[r.doc.id] = r.score / maxLex;

    const matched = lexicalRanked.length
      ? lexicalRanked[0].matched
      : new Set(tokenize(query));

    const scored = DOCS.map((doc, i) => {
      const sem = cosine(qVec, semantic.docVecs[i]); // 0..1 (normalized)
      const lex = lexById[doc.id] || 0;
      // blend: lean on semantics but keep lexical signal so exact terms win.
      const score = 0.65 * sem + 0.35 * lex;
      return { doc, score, matched };
    });
    // keep only reasonably-relevant docs so semantic mode doesn't dump all 18
    scored.sort((a, b) => b.score - a.score);
    const top = scored[0].score;
    return scored.filter((r) => r.score >= Math.max(0.25, top * 0.45));
  }
})();
