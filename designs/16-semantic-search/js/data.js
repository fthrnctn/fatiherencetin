/* ============================================================================
   data.js — Fatih Eren Çetin's REAL portfolio, chunked into a search corpus.
   Every fact here is verified from CONTENT.md (derived from the 2026-06 CV).
   Nothing is invented. Links exist ONLY where a real public URL exists.

   Each document has:
     id     — stable identifier
     kind   — "project" | "experience" | "skill" | "cert" | "about" | "education"
     title  — display heading
     tag    — short mono category label (shown as a chip on the result card)
     text   — the searchable body (also rendered as the snippet source)
     link   — { href, label } ONLY when a real URL exists; otherwise null
     state  — optional honesty label, e.g. "Private repo" / "No public link"
   The search index (TF-IDF over title+tag+text) is built from these in search.js.
   ============================================================================ */

const PROFILE = {
  name: "Fatih Eren Çetin",
  role: "AI Engineer · LLM & Agentic AI",
  location: "Ankara, Türkiye",
  oneLiner:
    "AI Engineer building production-grade LLM, RAG, and multi-agent systems — most recently a 9-agent Claude pipeline that lifted top-1 retrieval from 43% to 86% with 0% citation hallucination.",
  links: {
    email: "fatih.e.cetin@gmail.com",
    linkedin: "https://linkedin.com/in/fatih-eren-cetin",
    github: "https://github.com/FatihErenCetin",
    kaggle: "https://kaggle.com/fatiherencetin",
    hackerrank: "https://hackerrank.com/fecetinn",
  },
};

const STATS = [
  { value: "43% → 86%", label: "top-1 retrieval (7-query ground truth)" },
  { value: "0%", label: "citation hallucination (5 e2e scenarios)" },
  { value: "9 agents", label: "Claude pipeline (Sonnet 4.6 + Haiku 4.5)" },
  { value: "700+", label: "automated tests (Python + Playwright)" },
];

/* The corpus. Ordered roughly by relevance for the empty-state catalog. */
const DOCS = [
  /* ---- PROJECTS ---- */
  {
    id: "proj-flagship",
    kind: "project",
    title: "Multi-Agent LLM System — Citation-Backed Regulatory Documents",
    tag: "flagship",
    text:
      "Flagship multi-agent LLM system. 9 specialized Claude agents (Sonnet 4.6 + Haiku 4.5) " +
      "coordinated by a deterministic Python orchestrator. Dense RAG with article-aware chunking, " +
      "Qdrant vector store, Voyage-3-Large embeddings and Voyage rerank-2 reranking. " +
      "Lifted top-1 retrieval from 43% to 86% on a 7-query legislation ground-truth set, with " +
      "0% citation hallucination across 5 end-to-end scenarios via provenance enforcement. " +
      "Async FastAPI backend with Arq and Redis task queues and PostgreSQL. Per-step token, cost " +
      "and latency auditing. Human-in-the-loop review. 700+ tests in Python and Playwright.",
    link: null,
    state: "Private repo — no public link",
    stack: ["Claude", "Multi-Agent", "Dense RAG", "Qdrant", "Voyage", "FastAPI", "Redis", "PostgreSQL"],
  },
  {
    id: "proj-rag-system",
    kind: "project",
    title: "RAG Systems — Chat With Your Documents",
    tag: "public",
    text:
      "Public retrieval-augmented-generation app. FastAPI backend, Streamlit UI, Google Gemini for " +
      "generation, ChromaDB vector store. Hexagonal (Ports & Adapters) architecture for testability. " +
      "Per-chunk source citations so every answer is grounded. Cross-lingual Turkish and English " +
      "document support. 64-test suite.",
    link: { href: "https://github.com/FatihErenCetin/RAG-System", label: "github.com/FatihErenCetin/RAG-System" },
    state: null,
    stack: ["FastAPI", "Streamlit", "Gemini", "ChromaDB", "RAG", "Hexagonal"],
  },
  {
    id: "proj-sme",
    kind: "project",
    title: "Multi-Agent SME Operations Assistant",
    tag: "team · lead",
    text:
      "Multi-agent operations assistant for small-and-medium enterprises. Google Gemini function " +
      "calling routes user intent to scoped tools. Per-agent permission scoping limits what each " +
      "agent can touch. Graceful degradation through API-key rotation and deterministic fallbacks " +
      "when the model is unavailable. Telegram and Web front-ends. Core developer and lead on a team.",
    link: null,
    state: "Team project — no public link",
    stack: ["Gemini", "Function Calling", "Multi-Agent", "Telegram", "Permission Scoping"],
  },
  {
    id: "proj-investment",
    kind: "project",
    title: "Investment-Incentive Analytics & Forecasting Platform",
    tag: "forecasting",
    text:
      "Analytics and forecasting platform over 132 official sources (55 Excel + 77 Word) consolidated " +
      "into a 77,000-record dataset stored as Parquet and SQLite. Ran a 5-model out-of-sample backtest; " +
      "SARIMA reached 24% MAPE versus a 93% seasonal-naive baseline. Streamlit and Plotly dashboards " +
      "for exploration of investment incentives.",
    link: null,
    state: "No public link",
    stack: ["SARIMA", "Forecasting", "Polars", "Streamlit", "Plotly", "Backtesting"],
  },
  {
    id: "proj-finance",
    kind: "project",
    title: "Financial Time-Series Forecasting",
    tag: "forecasting",
    text:
      "Financial time-series forecasting on Borsa İstanbul equities. 30+ technical indicators " +
      "(RSI, MACD, Bollinger Bands and more) as features. Models: LightGBM gradient boosting plus " +
      "SARIMA / SARIMAX statistical baselines. Time-series cross-validation.",
    link: null,
    state: "No public link",
    stack: ["LightGBM", "SARIMA", "SARIMAX", "Time-Series", "Technical Indicators"],
  },

  /* ---- EXPERIENCE ---- */
  {
    id: "exp-mcv",
    kind: "experience",
    title: "AI Engineer — MCV Uluslararası Uygunluk Değerlendirme Danışmanlık",
    tag: "Ankara · 09/2024–Present",
    text:
      "AI Engineer. Built an agentic ISO/IEC 17020 conformity-audit assistant: Claude Agent SDK with " +
      "2 MCP servers and a local hybrid RAG (FTS5 BM25 + sqlite-vec + RRF reciprocal rank fusion), " +
      "running on-device and KVKK / EU-AI-Act compliant. Built a full-stack multi-agent RAG " +
      "import-compliance assistant with FastAPI and LangGraph. Designed and delivered an internal AI " +
      "training curriculum covering LLMs, prompt engineering, RAG and agents.",
    link: null,
    state: null,
    stack: ["Claude Agent SDK", "MCP", "Hybrid RAG", "FTS5 BM25", "sqlite-vec", "RRF", "FastAPI", "LangGraph"],
  },
  {
    id: "exp-fellow",
    kind: "experience",
    title: "AI Fellow — Yapay Zeka ve Teknoloji Akademisi",
    tag: "Remote · 12/2025–Present",
    text:
      "AI Fellow, admitted in the top 4.7% of 31,700 applicants; one of 5 fellows building community " +
      "tooling. Lead developer of a 4-person team building a Slack microservice platform: Slack Bolt, " +
      "async SQLAlchemy over PostgreSQL, Groq Llama 3.3 for channel summarization and feature-request " +
      "labeling, and sentence-transformers embeddings with UMAP/HDBSCAN clustering.",
    link: null,
    state: null,
    stack: ["Slack Bolt", "async SQLAlchemy", "PostgreSQL", "Groq Llama 3.3", "sentence-transformers", "UMAP", "HDBSCAN"],
  },
  {
    id: "exp-earlier",
    kind: "experience",
    title: "Earlier — Internships & Teaching",
    tag: "2022–2024",
    text:
      "MCV Intern (2024). Lab Assistant at Bilkent University (2022–2024), instructing 100+ students " +
      "in Python. SA Innovation Intern (2022).",
    link: null,
    state: null,
    stack: ["Python teaching", "Bilkent", "Internship"],
  },

  /* ---- EDUCATION ---- */
  {
    id: "edu-bilkent",
    kind: "education",
    title: "BSc Mathematics (Full Scholarship) — Bilkent University",
    tag: "2024 · English-medium",
    text:
      "Bachelor of Science in Mathematics, Bilkent University, 2024. Full scholarship. " +
      "English-medium instruction. Mathematical foundations behind the ML and retrieval work.",
    link: null,
    state: null,
    stack: ["Mathematics", "Full Scholarship", "Bilkent"],
  },

  /* ---- SKILLS (one document per group) ---- */
  {
    id: "skill-llm",
    kind: "skill",
    title: "LLM & Agentic",
    tag: "skills",
    text:
      "Anthropic Claude API, Google Gemini, OpenAI API, Model Context Protocol (MCP), LangGraph, " +
      "LangChain, multi-agent systems, function calling, structured outputs, prompt engineering.",
    link: null,
    state: null,
    stack: ["Claude API", "Gemini", "OpenAI", "MCP", "LangGraph", "LangChain", "function calling", "structured outputs", "prompt engineering"],
  },
  {
    id: "skill-rag",
    kind: "skill",
    title: "RAG & Retrieval",
    tag: "skills",
    text:
      "Qdrant, ChromaDB, pgvector, sqlite-vec, Voyage embeddings, hybrid BM25 + dense retrieval with " +
      "RRF (reciprocal rank fusion), reranking.",
    link: null,
    state: null,
    stack: ["Qdrant", "ChromaDB", "pgvector", "sqlite-vec", "Voyage", "hybrid BM25+dense", "RRF", "reranking"],
  },
  {
    id: "skill-backend",
    kind: "skill",
    title: "Backend & Data",
    tag: "skills",
    text:
      "Python, FastAPI, async Python, SQLAlchemy with Alembic migrations, PostgreSQL, Redis, Pydantic, " +
      "Polars, scikit-learn, LightGBM.",
    link: null,
    state: null,
    stack: ["Python", "FastAPI", "async", "SQLAlchemy", "Alembic", "PostgreSQL", "Redis", "Pydantic", "Polars", "scikit-learn", "LightGBM"],
  },
  {
    id: "skill-mlops",
    kind: "skill",
    title: "MLOps & Governance",
    tag: "skills",
    text:
      "Docker and docker-compose, CI/CD with GitHub Actions, pytest (test-driven development), " +
      "Ruff and mypy, ISO/IEC 42001, ISO/IEC 27001, KVKK / GDPR / EU-AI-Act-aware engineering.",
    link: null,
    state: null,
    stack: ["Docker", "docker-compose", "GitHub Actions", "pytest", "TDD", "Ruff", "mypy", "ISO 42001", "ISO 27001", "KVKK", "GDPR", "EU AI Act"],
  },

  /* ---- CERTIFICATIONS ---- */
  {
    id: "cert-42001",
    kind: "cert",
    title: "ISO/IEC 42001 Lead Auditor",
    tag: "★ certification",
    text:
      "ISO/IEC 42001 Lead Auditor — Artificial Intelligence Management System. Governance and audit " +
      "rigor applied directly to the LLM and agentic systems I build.",
    link: null,
    state: null,
    stack: ["ISO 42001", "AI governance", "Lead Auditor"],
  },
  {
    id: "cert-27001",
    kind: "cert",
    title: "ISO/IEC 27001:2022 Lead Auditor",
    tag: "★ certification",
    text:
      "ISO/IEC 27001:2022 Lead Auditor — Information Security Management System.",
    link: null,
    state: null,
    stack: ["ISO 27001", "information security", "Lead Auditor"],
  },
  {
    id: "cert-miuul",
    kind: "cert",
    title: "Miuul programs",
    tag: "certification",
    text:
      "Miuul: Data Scientist Bootcamp, Generative AI & Prompt Engineering, Deep Learning, " +
      "Time Series, Recommendation Systems, ML Summer Camp.",
    link: null,
    state: null,
    stack: ["Data Science", "Generative AI", "Deep Learning", "Time Series", "Recommendation Systems"],
  },
  {
    id: "cert-yztech",
    kind: "cert",
    title: "Yapay Zeka ve Teknoloji Akademisi programs",
    tag: "certification",
    text:
      "Yapay Zeka ve Teknoloji Akademisi: Deep Learning, Web App Development.",
    link: null,
    state: null,
    stack: ["Deep Learning", "Web Development"],
  },

  /* ---- ABOUT ---- */
  {
    id: "about-1",
    kind: "about",
    title: "About — from Mathematics to AI Engineering",
    tag: "about",
    text:
      "Mathematics BSc (full scholarship, Bilkent University) turned AI Engineer. I build " +
      "production-grade LLM, RAG and multi-agent systems that act over tools, APIs and data — " +
      "paired with ISO/IEC 42001 (AI Management) and 27001 Lead Auditor governance and reliability " +
      "rigor. Foundations from instructing 100+ students in Python.",
    link: null,
    state: null,
    stack: ["AI Engineer", "governance", "reliability", "teaching"],
  },
];

/* Suggested-query chips — each runs a REAL query through the same search. */
const SUGGESTED_QUERIES = [
  "RAG",
  "multi-agent",
  "governance / ISO",
  "forecasting",
  "Python",
  "Claude",
  "FastAPI",
];

/* expose for the (non-module) scripts */
window.PORTFOLIO = { PROFILE, STATS, DOCS, SUGGESTED_QUERIES };
