/* =============================================================================
   data.js — Fatih Eren Çetin · canonical portfolio content as structured data.
   ONLY verified facts (see CONTENT.md). No invented metrics, repos or links.
   Exposed on window.CV for the no-module static page.
   ============================================================================= */
(function () {
  "use strict";

  const CV = {
    identity: {
      name: "Fatih Eren Çetin",
      role: "AI Engineer · LLM & Agentic AI",
      location: "Ankara, Türkiye",
      oneLiner:
        "AI Engineer building production-grade LLM, RAG, and multi-agent systems — most recently a 9-agent Claude pipeline that lifted top-1 retrieval from 43% to 86% with 0% citation hallucination.",
      playgroundFrame:
        "Train a tiny neural net in your browser — a 30-second demo of the fundamentals behind the production systems I build. It is a teaching toy, not my production model.",
      about:
        "Mathematics BSc (full scholarship, Bilkent University) turned AI Engineer. I build production-grade LLM, RAG and multi-agent systems that act over tools, APIs and data — paired with ISO/IEC 42001 (AI Management) & 27001 Lead Auditor governance and reliability rigor. Foundations from instructing 100+ students in Python.",
    },

    stats: [
      { value: "9-agent", label: "Claude pipeline (Sonnet 4.6 + Haiku 4.5)" },
      { value: "43% → 86%", label: "top-1 retrieval (7-query ground truth)" },
      { value: "0%", label: "citation hallucination (5 e2e scenarios)" },
      { value: "700+", label: "automated tests (Python + Playwright)" },
      { value: "ISO 42001 / 27001", label: "Lead Auditor" },
      { value: "Top 4.7%", label: "AI fellow of 31,700 applicants" },
    ],

    // Selected work — rationale + tradeoffs shown, not just successes.
    projects: [
      {
        id: "flagship",
        title: "Multi-Agent LLM System — Citation-Backed Regulatory Documents",
        flag: "Flagship",
        state: { kind: "private", label: "Private repo — no public link" },
        summary:
          "9 specialized Claude agents (Sonnet 4.6 + Haiku 4.5) over a deterministic Python orchestrator that drafts regulatory documents with enforced, verifiable citations.",
        rationale:
          "Chose a deterministic orchestrator over an autonomous agent loop so every step is auditable and reproducible — predictability beat cleverness for a compliance workload. Used dense RAG with article-aware chunking because legislation is structured; provenance is enforced at generation time, not patched afterward.",
        metrics: [
          "Top-1 retrieval 43% → 86% on a 7-query legislation ground-truth set",
          "0% citation hallucination across 5 end-to-end scenarios (provenance enforcement)",
          "700+ tests (Python + Playwright); per-step token / cost / latency auditing",
        ],
        stack: [
          "Claude Sonnet 4.6 + Haiku 4.5",
          "Qdrant",
          "Voyage-3-Large + rerank-2",
          "FastAPI",
          "Arq / Redis",
          "PostgreSQL",
        ],
        tags: ["Multi-Agent", "Dense RAG", "FastAPI", "Provenance"],
        link: null,
      },
      {
        id: "rag-system",
        title: "RAG Systems — Chat With Your Documents",
        flag: "Public",
        state: { kind: "public", label: "Public on GitHub" },
        summary:
          "FastAPI + Streamlit + Google Gemini + ChromaDB document-QA system with per-chunk source citations and cross-lingual TR/EN retrieval.",
        rationale:
          "Built on a hexagonal (ports & adapters) architecture so the LLM and the vector store are swappable behind interfaces — the retrieval layer is not welded to one vendor. Every answer carries per-chunk citations so a reader can verify the source.",
        metrics: [
          "Hexagonal architecture — swappable LLM / vector-store adapters",
          "Per-chunk source citations; cross-lingual TR/EN",
          "64-test suite",
        ],
        stack: ["FastAPI", "Streamlit", "Google Gemini", "ChromaDB"],
        tags: ["RAG", "Citations", "Hexagonal"],
        link: "https://github.com/FatihErenCetin/RAG-System",
      },
      {
        id: "sme-assistant",
        title: "Multi-Agent SME Operations Assistant",
        flag: "Team — core dev / lead",
        state: { kind: "private", label: "No public link" },
        summary:
          "Gemini function-calling assistant for SME operations across Telegram and Web, with per-agent permission scoping and graceful degradation.",
        rationale:
          "Scoped permissions per agent so a tool failure or a compromised step cannot exceed its authority. Designed API-key rotation with deterministic fallbacks, so the system degrades into a predictable mode instead of failing outright.",
        metrics: [
          "Per-agent permission scoping",
          "API-key rotation + deterministic fallbacks (graceful degradation)",
          "Telegram + Web surfaces",
        ],
        stack: ["Google Gemini", "Function calling", "Telegram Bot", "Web"],
        tags: ["Multi-Agent", "Function Calling", "Reliability"],
        link: null,
      },
      {
        id: "investment",
        title: "Investment-Incentive Analytics & Forecasting Platform",
        flag: "Data + Forecasting",
        state: { kind: "private", label: "No public link" },
        summary:
          "Reconciled 132 official sources (55 Excel + 77 Word) into a 77K-record dataset, then backtested forecasting models out-of-sample.",
        rationale:
          "Ran a 5-model out-of-sample backtest instead of trusting in-sample fit — the honest comparison was against a seasonal-naive baseline. SARIMA earned its place by beating that baseline by a wide margin, not by being the fanciest option.",
        metrics: [
          "132 sources (55 Excel + 77 Word) → 77K-record dataset (Parquet + SQLite)",
          "5-model out-of-sample backtest",
          "SARIMA 24% MAPE vs 93% seasonal-naive baseline",
        ],
        stack: ["Python", "SARIMA", "Polars", "Streamlit / Plotly"],
        tags: ["Forecasting", "Data Engineering", "Backtest"],
        link: null,
      },
      {
        id: "financial-ts",
        title: "Financial Time-Series Forecasting",
        flag: "Time-Series",
        state: { kind: "private", label: "No public link" },
        summary:
          "Forecasting over Borsa İstanbul equities using 30+ technical indicators and a gradient-boosting + classical-stats ensemble.",
        rationale:
          "Paired LightGBM with SARIMA/SARIMAX rather than reaching for a deep net — on this data volume the gradient-boosted + classical approach was the better-calibrated, more interpretable bet.",
        metrics: [
          "30+ technical indicators (RSI, MACD, Bollinger, …)",
          "LightGBM + SARIMA / SARIMAX",
          "Borsa İstanbul equities",
        ],
        stack: ["LightGBM", "SARIMA / SARIMAX", "scikit-learn", "Python"],
        tags: ["Time-Series", "LightGBM", "Feature Engineering"],
        link: null,
      },
    ],

    experience: [
      {
        role: "AI Engineer",
        org: "MCV Uluslararası Uygunluk Değerlendirme Danışmanlık",
        location: "Ankara",
        dates: "09/2024 – Present",
        bullets: [
          "Built an agentic ISO/IEC 17020 conformity-audit assistant: Claude Agent SDK + 2 MCP servers + local hybrid RAG (FTS5 BM25 + sqlite-vec + RRF), on-device and KVKK / EU-AI-Act compliant.",
          "Built a full-stack multi-agent RAG import-compliance assistant (FastAPI + LangGraph).",
          "Designed and delivered an internal AI training curriculum (LLM, prompt engineering, RAG, agents).",
        ],
      },
      {
        role: "AI Fellow",
        org: "Yapay Zeka ve Teknoloji Akademisi",
        location: "Remote",
        dates: "12/2025 – Present",
        bullets: [
          "Selected in the top 4.7% of 31,700 applicants; one of 5 fellows building community tooling.",
          "Lead developer of a 4-person team building a Slack microservice platform: Slack Bolt, async SQLAlchemy / PostgreSQL, Groq Llama 3.3 summarization, sentence-transformers + UMAP/HDBSCAN clustering.",
        ],
      },
      {
        role: "AI Engineering Intern",
        org: "MCV Uluslararası Uygunluk Değerlendirme Danışmanlık",
        location: "Ankara",
        dates: "2024",
        bullets: [
          "Internship preceding the full-time AI Engineer role — early LLM and RAG prototyping.",
        ],
      },
      {
        role: "Lab Assistant",
        org: "Bilkent University",
        location: "Ankara",
        dates: "2022 – 2024",
        bullets: ["Instructed 100+ students in Python across lab sessions."],
      },
      {
        role: "Innovation Intern",
        org: "SA",
        location: "—",
        dates: "2022",
        bullets: ["Early-career innovation internship."],
      },
    ],

    education: [
      {
        degree: "BSc Mathematics (Full Scholarship)",
        org: "Bilkent University",
        dates: "2024",
        note: "English-medium.",
      },
    ],

    skills: [
      {
        group: "LLM & Agentic",
        items: [
          "Anthropic Claude API",
          "Google Gemini",
          "OpenAI API",
          "MCP",
          "LangGraph",
          "LangChain",
          "Multi-agent systems",
          "Function calling",
          "Structured outputs",
          "Prompt engineering",
        ],
      },
      {
        group: "RAG & Retrieval",
        items: [
          "Qdrant",
          "ChromaDB",
          "pgvector",
          "sqlite-vec",
          "Voyage embeddings",
          "Hybrid BM25 + dense + RRF",
          "Reranking",
        ],
      },
      {
        group: "Backend & Data",
        items: [
          "Python",
          "FastAPI",
          "async Python",
          "SQLAlchemy + Alembic",
          "PostgreSQL",
          "Redis",
          "Pydantic",
          "Polars",
          "scikit-learn",
          "LightGBM",
        ],
      },
      {
        group: "MLOps & Governance",
        items: [
          "Docker & docker-compose",
          "CI/CD (GitHub Actions)",
          "pytest (TDD)",
          "Ruff / mypy",
          "ISO/IEC 42001",
          "ISO/IEC 27001",
          "KVKK / GDPR / EU-AI-Act-aware",
        ],
      },
    ],

    certifications: [
      {
        name: "ISO/IEC 42001 Lead Auditor",
        note: "AI Management System",
        starred: true,
      },
      {
        name: "ISO/IEC 27001:2022 Lead Auditor",
        note: "Information Security",
        starred: true,
      },
      {
        name: "Miuul",
        note:
          "Data Scientist Bootcamp · Generative AI & Prompt Engineering · Deep Learning · Time Series · Recommendation Systems · ML Summer Camp",
        starred: false,
      },
      {
        name: "Yapay Zeka ve Teknoloji Akademisi",
        note: "Deep Learning · Web App Development",
        starred: false,
      },
    ],

    contact: {
      email: "fatih.e.cetin@gmail.com",
      links: [
        { label: "LinkedIn", href: "https://linkedin.com/in/fatih-eren-cetin" },
        { label: "GitHub", href: "https://github.com/FatihErenCetin" },
        { label: "Kaggle", href: "https://kaggle.com/fatiherencetin" },
        { label: "HackerRank", href: "https://hackerrank.com/fecetinn" },
      ],
    },
  };

  window.CV = CV;
})();
