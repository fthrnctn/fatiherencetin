/* =========================================================================
 * retriever.js — a real, tiny TF-IDF + cosine retrieval engine.
 *
 * This is the actual RAG core. No fakery:
 *   1. Tokenize + light stopword removal + crude stemming.
 *   2. Build a TF-IDF vector per chunk over the corpus (text + boost tags).
 *   3. At query time, vectorize the question the same way and rank chunks by
 *      cosine similarity. Return ranked hits with scores.
 *
 * `KB.intents` give curated chip answers a small score bump so the suggested
 * questions always resolve to the intended chunk — but free-typed questions
 * are answered purely by the TF-IDF math.
 *
 * Exposed on window.Retriever = { search(query) -> [{chunk, score}], ready }.
 * ====================================================================== */
(function () {
  "use strict";

  var STOP = ("a an the of to in on for and or is are was were be been being do does did " +
    "with by at as from your you i me my our we it this that these those what whats which who whom " +
    "how when where why have has had can could would should will tell about into over under " +
    "do you your yours s re ll ve t").split(/\s+/);
  var STOPSET = Object.create(null);
  STOP.forEach(function (w) { STOPSET[w] = true; });

  function stem(w) {
    // deliberately conservative — just fold common plural/verb endings
    if (w.length > 4 && /ing$/.test(w)) return w.slice(0, -3);
    if (w.length > 4 && /ies$/.test(w)) return w.slice(0, -3) + "y";
    if (w.length > 3 && /es$/.test(w)) return w.slice(0, -2);
    if (w.length > 3 && /s$/.test(w) && !/ss$/.test(w)) return w.slice(0, -1);
    return w;
  }

  function tokenize(s) {
    if (!s) return [];
    var raw = String(s)
      .toLowerCase()
      // keep intra-word things like "sqlite-vec", "iso/iec", "42001"
      .replace(/[^a-z0-9çğıöşü\/\-+%.]+/gi, " ")
      .split(/\s+/);
    var out = [];
    for (var i = 0; i < raw.length; i++) {
      var t = raw[i].replace(/^[.\-/]+|[.\-/]+$/g, "");
      if (!t) continue;
      // split slash/compound but ALSO keep the joined form (sqlite-vec)
      var parts = t.split(/[\/]/).filter(Boolean);
      parts.forEach(function (p) {
        if (p.length < 2 && !/[0-9]/.test(p)) return;
        if (STOPSET[p]) return;
        out.push(stem(p));
      });
      if (parts.length > 1 && !STOPSET[t]) out.push(t);
    }
    return out;
  }

  var docs = [];        // [{chunk, tf:{term:count}, len}]
  var idf = Object.create(null);
  var ready = false;

  function build() {
    var KB = window.KB;
    if (!KB || !KB.chunks) return;
    var N = KB.chunks.length;
    var df = Object.create(null);

    KB.chunks.forEach(function (c) {
      // weight: tags counted twice (they are curated retrieval boosters),
      // source label once, body once.
      var toks = tokenize(c.text)
        .concat(tokenize(c.tags))
        .concat(tokenize(c.tags)) // tags x2
        .concat(tokenize(c.source));
      var tf = Object.create(null);
      toks.forEach(function (t) { tf[t] = (tf[t] || 0) + 1; });
      var seen = Object.create(null);
      Object.keys(tf).forEach(function (t) {
        if (!seen[t]) { df[t] = (df[t] || 0) + 1; seen[t] = true; }
      });
      docs.push({ chunk: c, tf: tf, len: 0 });
    });

    Object.keys(df).forEach(function (t) {
      idf[t] = Math.log((N + 1) / (df[t] + 0.5)) + 1; // smoothed idf
    });

    // precompute tf-idf vector length per doc
    docs.forEach(function (d) {
      var sum = 0;
      Object.keys(d.tf).forEach(function (t) {
        var w = (1 + Math.log(d.tf[t])) * (idf[t] || 0);
        sum += w * w;
      });
      d.len = Math.sqrt(sum) || 1;
    });

    ready = true;
  }

  function vectorize(query) {
    var toks = tokenize(query);
    var tf = Object.create(null);
    toks.forEach(function (t) { tf[t] = (tf[t] || 0) + 1; });
    var vec = Object.create(null);
    var sum = 0;
    Object.keys(tf).forEach(function (t) {
      var w = (1 + Math.log(tf[t])) * (idf[t] || 0);
      if (w > 0) { vec[t] = w; sum += w * w; }
    });
    return { vec: vec, len: Math.sqrt(sum) || 1, tokens: toks };
  }

  function cosine(qvec, qlen, doc) {
    var dot = 0;
    var keys = Object.keys(qvec);
    for (var i = 0; i < keys.length; i++) {
      var t = keys[i];
      if (doc.tf[t]) {
        var dw = (1 + Math.log(doc.tf[t])) * (idf[t] || 0);
        dot += qvec[t] * dw;
      }
    }
    return dot / (qlen * doc.len);
  }

  // exact normalized-text match against a curated intent question
  function matchIntent(query) {
    var KB = window.KB;
    if (!KB.intents) return null;
    var norm = query.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    for (var i = 0; i < KB.intents.length; i++) {
      var iq = KB.intents[i].q.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      if (norm === iq) return KB.intents[i];
    }
    return null;
  }

  function search(query) {
    if (!ready) build();
    var q = vectorize(query);
    if (q.tokens.length === 0) {
      return { hits: [], tokens: [], intent: null };
    }
    var scored = docs.map(function (d) {
      return { chunk: d.chunk, score: cosine(q.vec, q.len, d) };
    });

    // curated-intent bump: if the query equals a chip question, lift its chunk
    var intent = matchIntent(query);
    if (intent) {
      scored.forEach(function (s) {
        if (intent.chunks.indexOf(s.chunk.id) !== -1) s.score += 1.0;
      });
    }

    scored.sort(function (a, b) { return b.score - a.score; });
    return { hits: scored, tokens: q.tokens, intent: intent };
  }

  window.Retriever = {
    search: search,
    build: build,
    get ready() { return ready; },
    // exposed for the debug "how it works" panel / tests
    _tokenize: tokenize
  };

  // build eagerly once data is present
  if (window.KB) build();
})();
