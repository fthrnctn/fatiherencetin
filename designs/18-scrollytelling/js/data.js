/* ============================================================================
   data.js — single source of truth (structured, verified facts only)
   Derived from CONTENT.md. NO invented metrics, repos, or links.
   Exposed on window.FEC for the no-module page.
   ========================================================================== */
(function () {
  "use strict";

  /* The flagship scrollytelling steps. Each step = one commentary panel +
     a `nodes` array naming which pipeline nodes light up in the sticky SVG. */
  const caseStudy = {
    title: "How I took retrieval from 43% to 86% with 0% hallucination",
    subtitle:
      "Multi-Agent LLM System — Citation-Backed Regulatory Documents (flagship, private repo)",
    metricBefore: 43,
    metricAfter: 86,
    metricUnit: "% top-1 retrieval",
    metricGround: "measured on a 7-query legislation ground-truth set",
    steps: [
      {
        id: "problem",
        kicker: "01 · The problem",
        title: "Wrong citations are worse than no answer.",
        body:
          "The task: answer regulatory questions and back every claim with the exact article it came from. In a compliance setting a confident answer citing the wrong clause is a liability, not a convenience. So the bar was not “sounds right” — it was provenance: every sentence traceable to a real source, or it doesn’t ship.",
        decision: {
          label: "Framing decision",
          choice: "Optimise for citation correctness, not fluency.",
          why:
            "A fluent answer with a bad citation passes a demo and fails an audit. The whole system is built backwards from that constraint.",
        },
        nodes: ["query"],
      },
      {
        id: "architecture",
        kicker: "02 · Architecture",
        title: "A deterministic orchestrator driving 9 specialised agents.",
        body:
          "Rather than one big autonomous loop, control flow lives in plain Python — a deterministic orchestrator that calls 9 narrow Claude agents (retrieve, draft, verify-citation, critique, …). Determinism where it matters; model intelligence only at the steps that need it.",
        decision: {
          label: "Cost / quality decision",
          choice: "Sonnet 4.6 for hard reasoning steps, Haiku 4.5 for cheap ones — not one model everywhere.",
          why:
            "Running the strongest model on every step is wasteful; running a cheap model on the hard steps is fragile. Routing by step keeps the verification/synthesis steps sharp while classification and formatting stay fast and cheap.",
        },
        nodes: ["orchestrator", "agents"],
      },
      {
        id: "retrieval",
        kicker: "03 · Retrieval",
        title: "Article-aware chunking + dense RAG.",
        body:
          "Legislation has structure — articles, clauses, sub-items. Chunking on that structure (instead of fixed token windows) keeps a citation unit intact. Retrieval is dense: Qdrant over Voyage-3-Large embeddings, then Voyage rerank-2 re-scores the shortlist before anything reaches an agent.",
        decision: {
          label: "Retrieval decision",
          choice: "Dense embeddings + a reranker, over naive keyword search.",
          why:
            "Regulatory questions paraphrase the law — they rarely share surface keywords with the clause that answers them. Dense retrieval matches meaning; the reranker fixes the “close but not top-1” cases that sink citation accuracy.",
        },
        nodes: ["chunk", "retrieve", "rerank"],
      },
      {
        id: "result",
        kicker: "04 · The result",
        title: "Top-1 retrieval: 43% → 86%.",
        body:
          "On a 7-query legislation ground-truth set, the share of questions whose single best-retrieved chunk was the correct article doubled — from 43% to 86%. Top-1 is the metric that matters here: the verifier trusts the first result, so getting the right clause to rank first is what actually moves citation quality.",
        decision: {
          label: "How it was measured",
          choice: "An offline ground-truth set, scored top-1, not vibes.",
          why:
            "A small hand-labelled set you can re-run on every change is worth more than a big one you measure once. Each retrieval tweak was scored against the same 7 queries, so the 43→86 gain is reproducible, not anecdotal.",
        },
        nodes: ["retrieve", "rerank"],
        reveal: true,
      },
      {
        id: "reliability",
        kicker: "05 · Reliability",
        title: "0% citation hallucination — enforced, not hoped for.",
        body:
          "A dedicated agent re-checks every cited claim against its source before the answer is returned; unverifiable claims are dropped or flagged for a human. Across 5 end-to-end scenarios, zero hallucinated citations. The whole pipeline is covered by 700+ tests (Python + Playwright) with per-step token, cost and latency auditing.",
        decision: {
          label: "Reliability decision",
          choice: "Provenance enforcement + human-in-the-loop, over “trust the model”.",
          why:
            "You can’t prompt your way to a guarantee. A verification step that can refuse to answer — plus a human review gate — is what turns 0% hallucination from a lucky run into a property of the system.",
        },
        nodes: ["verify", "human", "answer"],
      },
    ],
  };

  /* SVG pipeline nodes — id must match the `nodes` arrays above.
     x/y are in a 0..100 viewBox-relative grid; layout is computed in main.js. */
  const pipeline = {
    nodes: [
      { id: "query",        label: "User question",        sub: "regulatory Q",        col: 0, row: 1 },
      { id: "orchestrator", label: "Deterministic\norchestrator", sub: "plain Python",  col: 1, row: 1 },
      { id: "chunk",        label: "Article-aware\nchunking", sub: "structure-aware",   col: 2, row: 0 },
      { id: "retrieve",     label: "Dense retrieval",      sub: "Qdrant · Voyage-3",   col: 3, row: 0 },
      { id: "rerank",       label: "Rerank",               sub: "Voyage rerank-2",     col: 4, row: 0 },
      { id: "agents",       label: "9 Claude agents",      sub: "Sonnet 4.6 · Haiku 4.5", col: 2, row: 2 },
      { id: "verify",       label: "Citation verify",      sub: "provenance gate",     col: 3, row: 2 },
      { id: "human",        label: "Human-in-the-loop",    sub: "review gate",         col: 4, row: 2 },
      { id: "answer",       label: "Cited answer",         sub: "0% hallucination",    col: 5, row: 1 },
    ],
    /* directed edges (from → to) */
    edges: [
      ["query", "orchestrator"],
      ["orchestrator", "chunk"],
      ["chunk", "retrieve"],
      ["retrieve", "rerank"],
      ["rerank", "agents"],
      ["orchestrator", "agents"],
      ["agents", "verify"],
      ["verify", "human"],
      ["verify", "answer"],
      ["human", "answer"],
    ],
  };

  /* Signature stats for the hero strip. */
  const stats = [
    { value: "43→86%", label: "top-1 retrieval", note: "7-query ground truth" },
    { value: "0%", label: "citation hallucination", note: "5 end-to-end scenarios" },
    { value: "9", label: "Claude agents", note: "Sonnet 4.6 + Haiku 4.5" },
    { value: "700+", label: "automated tests", note: "Python + Playwright" },
    { value: "42001 / 27001", label: "Lead Auditor", note: "AI mgmt + InfoSec" },
    { value: "top 4.7%", label: "AI fellow", note: "of 31,700 applicants" },
  ];

  /* Other projects (the flagship is the scrolly itself, so it's excluded here). */
  const projects = [
    {
      name: "RAG Systems — Chat With Your Documents",
      state: "public",
      url: "https://github.com/FatihErenCetin/RAG-System",
      blurb:
        "FastAPI + Streamlit + Google Gemini + ChromaDB. Hexagonal (ports & adapters) architecture so the LLM and vector store are swappable adapters, not load-bearing dependencies.",
      rationale:
        "Hexagonal kept Gemini and ChromaDB at the edges — the core stays testable and the providers are replaceable.",
      metrics: ["per-chunk citations", "TR / EN cross-lingual", "64-test suite"],
      tags: ["FastAPI", "Gemini", "ChromaDB", "RAG"],
    },
    {
      name: "Multi-Agent SME Operations Assistant",
      state: "team",
      url: null,
      blurb:
        "Gemini function-calling assistant over Telegram + Web, with per-agent permission scoping so each agent can only touch what its role allows.",
      rationale:
        "API-key rotation + deterministic fallbacks: when the model or a key is unavailable, it degrades to a predictable path instead of failing the user.",
      metrics: ["per-agent permission scoping", "API-key rotation", "deterministic fallbacks"],
      tags: ["Gemini", "Function calling", "Telegram", "Web"],
    },
    {
      name: "Investment-Incentive Analytics & Forecasting Platform",
      state: "private",
      url: null,
      blurb:
        "Reconciled 132 official sources (55 Excel + 77 Word) into a single 77K-record dataset (Parquet + SQLite), then forecast incentive activity.",
      rationale:
        "Out-of-sample backtest across 5 models: SARIMA reached 24% MAPE versus a 93% seasonal-naive baseline — the baseline is what proves the model earned its place.",
      metrics: ["132 sources → 77K records", "5-model backtest", "SARIMA 24% MAPE vs 93% naive"],
      tags: ["SARIMA", "Polars", "Streamlit", "Plotly"],
    },
    {
      name: "Financial Time-Series Forecasting",
      state: "private",
      url: null,
      blurb:
        "30+ technical indicators (RSI, MACD, Bollinger, …) feeding a LightGBM + SARIMA/SARIMAX ensemble over Borsa İstanbul series.",
      rationale:
        "Pairing a gradient-boosted model with classical seasonal models covers both non-linear feature interactions and explicit seasonality.",
      metrics: ["30+ indicators", "LightGBM + SARIMA/SARIMAX", "Borsa İstanbul"],
      tags: ["LightGBM", "SARIMAX", "Time series"],
    },
  ];

  const experience = [
    {
      role: "AI Engineer",
      org: "MCV Uluslararası Uygunluk Değerlendirme Danışmanlık",
      place: "Ankara",
      dates: "09/2024 – Present",
      bullets: [
        "Agentic ISO/IEC 17020 conformity-audit assistant: Claude Agent SDK + 2 MCP servers + local hybrid RAG (FTS5 BM25 + sqlite-vec + RRF) — on-device, KVKK / EU-AI-Act compliant.",
        "Full-stack multi-agent RAG import-compliance assistant (FastAPI + LangGraph).",
        "Designed & delivered an internal AI training curriculum (LLM, prompt engineering, RAG, agents).",
      ],
    },
    {
      role: "AI Fellow",
      org: "Yapay Zeka ve Teknoloji Akademisi",
      place: "Remote",
      dates: "12/2025 – Present",
      bullets: [
        "Selected top 4.7% of 31,700 applicants; one of 5 fellows building community tooling.",
        "Lead developer of a 4-person team — Slack microservice platform: Slack Bolt, async SQLAlchemy / PostgreSQL, Groq Llama 3.3 summarization, sentence-transformers + UMAP/HDBSCAN clustering.",
      ],
    },
    {
      role: "Earlier roles",
      org: "MCV · Bilkent University · SA",
      place: "",
      dates: "2022 – 2024",
      bullets: [
        "MCV Intern (2024).",
        "Lab Assistant, Bilkent University (2022–2024) — instructed 100+ students in Python.",
        "SA Innovation Intern (2022).",
      ],
    },
  ];

  const education = {
    degree: "BSc Mathematics (Full Scholarship)",
    school: "Bilkent University",
    year: "2024",
    note: "English-medium",
  };

  const skills = [
    {
      group: "LLM & Agentic",
      items: [
        "Anthropic Claude API", "Google Gemini", "OpenAI API", "MCP", "LangGraph",
        "LangChain", "Multi-agent systems", "Function calling", "Structured outputs",
        "Prompt engineering",
      ],
    },
    {
      group: "RAG & Retrieval",
      items: [
        "Qdrant", "ChromaDB", "pgvector", "sqlite-vec", "Voyage embeddings",
        "Hybrid BM25 + dense + RRF", "Reranking",
      ],
    },
    {
      group: "Backend & Data",
      items: [
        "Python", "FastAPI", "Async Python", "SQLAlchemy + Alembic", "PostgreSQL",
        "Redis", "Pydantic", "Polars", "scikit-learn", "LightGBM",
      ],
    },
    {
      group: "MLOps & Governance",
      items: [
        "Docker & docker-compose", "CI/CD (GitHub Actions)", "pytest (TDD)",
        "Ruff / mypy", "ISO/IEC 42001", "ISO/IEC 27001", "KVKK / GDPR / EU-AI-Act-aware",
      ],
    },
  ];

  const certifications = [
    { name: "ISO/IEC 42001 Lead Auditor", note: "AI Management System", star: true },
    { name: "ISO/IEC 27001:2022 Lead Auditor", note: "Information Security", star: true },
    {
      name: "Miuul",
      note: "Data Scientist Bootcamp · Generative AI & Prompt Engineering · Deep Learning · Time Series · Recommendation Systems · ML Summer Camp",
      star: false,
    },
    {
      name: "Yapay Zeka ve Teknoloji Akademisi",
      note: "Deep Learning · Web App Development",
      star: false,
    },
  ];

  const contact = {
    email: "fatih.e.cetin@gmail.com",
    links: [
      { label: "LinkedIn", url: "https://linkedin.com/in/fatih-eren-cetin" },
      { label: "GitHub", url: "https://github.com/FatihErenCetin" },
      { label: "Kaggle", url: "https://kaggle.com/fatiherencetin" },
      { label: "HackerRank", url: "https://hackerrank.com/fecetinn" },
    ],
  };

  window.FEC = {
    identity: {
      name: "Fatih Eren Çetin",
      role: "AI Engineer · LLM & Agentic AI",
      location: "Ankara, Türkiye",
      oneLiner:
        "AI Engineer building production-grade LLM, RAG, and multi-agent systems — most recently a 9-agent Claude pipeline that lifted top-1 retrieval from 43% to 86% with 0% citation hallucination.",
      about:
        "Mathematics BSc (full scholarship, Bilkent University) turned AI Engineer. I build production-grade LLM, RAG and multi-agent systems that act over tools, APIs and data — paired with ISO/IEC 42001 (AI Management) & 27001 Lead Auditor governance and reliability rigor. Foundations from instructing 100+ students in Python.",
    },
    caseStudy,
    pipeline,
    stats,
    projects,
    experience,
    education,
    skills,
    certifications,
    contact,
  };
})();
