/* =========================================================================
 * data.js — the knowledge base for the "Chat with my CV" RAG widget.
 *
 * Everything here is VERIFIED CV content (see CONTENT.md). Nothing invented.
 * The chat retrieves over `KB.chunks` (TF-IDF + cosine) and renders answers
 * composed ONLY from these chunks. `KB.intents` are curated, hand-tuned
 * answers for the suggested-question chips so they always resolve cleanly.
 *
 * This file is plain data + tiny helpers. No framework. Exposed on window.KB.
 * ====================================================================== */
(function () {
  "use strict";

  // -- Identity (rendered into the hero, instantly, before any JS logic) ----
  var IDENTITY = {
    name: "Fatih Eren Çetin",
    role: "AI Engineer · LLM & Agentic AI",
    location: "Ankara, Türkiye",
    oneLiner:
      "AI Engineer building production-grade LLM, RAG, and multi-agent systems — most recently a 9-agent Claude pipeline that lifted top-1 retrieval from 43% to 86% with 0% citation hallucination."
  };

  var CONTACT = {
    email: "fatih.e.cetin@gmail.com",
    linkedin: "https://linkedin.com/in/fatih-eren-cetin",
    github: "https://github.com/FatihErenCetin",
    kaggle: "https://kaggle.com/fatiherencetin",
    hackerrank: "https://hackerrank.com/fecetinn"
  };

  /* -----------------------------------------------------------------------
   * KNOWLEDGE BASE CHUNKS
   * Each chunk is one retrievable unit:
   *   id     — stable key
   *   source — short tag shown to the user ("— from: …")
   *   text   — the grounded answer text (verbatim-safe CV content)
   *   link   — optional {label, href}; only REAL urls. Flagship/3/4/5 = none.
   *   tags   — extra keywords to boost retrieval (not shown)
   * --------------------------------------------------------------------- */
  var chunks = [
    {
      id: "about",
      source: "About",
      text:
        "I'm a Mathematics BSc (full scholarship, Bilkent University) turned AI Engineer. I build production-grade LLM, RAG and multi-agent systems that act over tools, APIs and data — paired with ISO/IEC 42001 (AI Management) and 27001 Lead Auditor governance and reliability rigor. My foundations come from instructing 100+ students in Python.",
      tags: "who are you background summary profile mathematics bilkent scholarship governance teaching introduce yourself"
    },
    {
      id: "exp-mcv",
      source: "Experience · MCV",
      text:
        "AI Engineer at MCV Uluslararası Uygunluk Değerlendirme Danışmanlık (Ankara, Sep 2024 – Present). I built an agentic ISO/IEC 17020 conformity-audit assistant using the Claude Agent SDK + 2 MCP servers + a local hybrid RAG (FTS5 BM25 + sqlite-vec + RRF) — fully on-device and KVKK / EU-AI-Act compliant. I also built a full-stack multi-agent RAG import-compliance assistant (FastAPI + LangGraph), and designed and delivered an internal AI training curriculum covering LLMs, prompt engineering, RAG and agents.",
      tags: "current job work mcv audit iso 17020 claude agent sdk mcp hybrid rag fts5 bm25 sqlite-vec rrf langgraph fastapi on-device kvkk eu ai act conformity assistant"
    },
    {
      id: "exp-fellow",
      source: "Experience · AI Fellowship",
      text:
        "AI Fellow at Yapay Zeka ve Teknoloji Akademisi (Remote, Dec 2025 – Present). I was admitted in the top 4.7% of 31,700 applicants, as one of 5 fellows building community tooling. I'm the lead developer of a 4-person team building a Slack microservice platform — Slack Bolt, async SQLAlchemy/PostgreSQL, Groq Llama 3.3 channel summarization, and sentence-transformers + UMAP/HDBSCAN clustering.",
      tags: "fellowship fellow academy slack team lead developer top 4.7% 31700 groq llama sentence transformers umap hdbscan clustering microservice bolt postgresql async community"
    },
    {
      id: "exp-earlier",
      source: "Experience · Earlier",
      text:
        "Earlier roles: MCV Intern (2024); Lab Assistant at Bilkent University (2022–2024), where I instructed 100+ students in Python; and an Innovation Intern at SA (2022).",
      tags: "earlier internship intern lab assistant bilkent teaching teach taught instructed instructing mentoring python 100 students sa innovation history experience teaching python"
    },
    {
      id: "edu",
      source: "Education",
      text:
        "BSc in Mathematics (Full Scholarship) from Bilkent University, 2024 — English-medium. The mathematics foundation is why retrieval quality, evaluation and probability-grounded reasoning come naturally in my LLM work.",
      tags: "education degree university bilkent mathematics math bsc scholarship graduate study academic"
    },
    {
      id: "proj-flagship",
      source: "Projects · Flagship",
      text:
        "My flagship is the Multi-Agent LLM System for Citation-Backed Regulatory Documents (private repo). It's 9 specialized Claude agents (Sonnet 4.6 + Haiku 4.5) over a deterministic Python orchestrator, with dense RAG (article-aware chunking, Qdrant + Voyage-3-Large embeddings + Voyage rerank-2). It lifted top-1 retrieval from 43% to 86% on a 7-query legislation ground-truth set, and achieved 0% citation hallucination across 5 end-to-end scenarios via provenance enforcement. Stack: async FastAPI + Arq/Redis + PostgreSQL, per-step token/cost/latency auditing, human-in-the-loop review, and 700+ tests (Python + Playwright).",
      tags: "flagship best project multi-agent regulatory citation legislation 9 agents claude sonnet haiku qdrant voyage rerank dense rag 43 86 top-1 retrieval 0% hallucination provenance fastapi arq redis postgresql 700 tests human in the loop orchestrator",
      noLink: true,
      linkNote: "Private repository — see my GitHub profile for public work."
    },
    {
      id: "proj-rag-system",
      source: "Projects · RAG-System (public)",
      text:
        "RAG Systems — Chat With Your Documents is my public project. It's FastAPI + Streamlit + Google Gemini + ChromaDB, built with a hexagonal (Ports & Adapters) architecture, with per-chunk source citations, cross-lingual TR/EN support, and a 64-test suite. This is the one project with public source code.",
      tags: "public open source rag system chat documents fastapi streamlit gemini chromadb hexagonal ports adapters citations cross-lingual turkish english 64 tests github code repository",
      link: { label: "github.com/FatihErenCetin/RAG-System", href: "https://github.com/FatihErenCetin/RAG-System" }
    },
    {
      id: "proj-sme",
      source: "Projects · SME Assistant",
      text:
        "The Multi-Agent SME Operations Assistant (team project, I was core developer / lead) uses Google Gemini function calling with per-agent permission scoping. It runs on Telegram + Web and degrades gracefully via API-key rotation and deterministic fallbacks.",
      tags: "sme operations assistant team gemini function calling permission scoping telegram web api key rotation deterministic fallback graceful degradation multi-agent",
      noLink: true,
      linkNote: "No public link for this project."
    },
    {
      id: "proj-investment",
      source: "Projects · Investment Analytics",
      text:
        "The Investment-Incentive Analytics & Forecasting Platform reconciled 132 official sources (55 Excel + 77 Word) into a 77K-record dataset (Parquet + SQLite). It runs a 5-model out-of-sample backtest where SARIMA hit 24% MAPE versus a 93% seasonal-naive baseline. Visualized with Streamlit / Plotly.",
      tags: "investment incentive analytics forecasting platform 132 sources 55 excel 77 word 77k records parquet sqlite 5 model backtest sarima 24 mape seasonal naive baseline streamlit plotly data",
      noLink: true,
      linkNote: "No public link for this project."
    },
    {
      id: "proj-financial",
      source: "Projects · Financial Forecasting",
      text:
        "Financial Time-Series Forecasting on Borsa İstanbul: 30+ technical indicators (RSI, MACD, Bollinger…) feeding LightGBM + SARIMA/SARIMAX models.",
      tags: "financial time series forecasting borsa istanbul stock 30 technical indicators rsi macd bollinger lightgbm sarima sarimax models prediction",
      noLink: true,
      linkNote: "No public link for this project."
    },
    {
      id: "skills-llm",
      source: "Skills · LLM & Agentic",
      text:
        "LLM & Agentic stack: Anthropic Claude API, Google Gemini, OpenAI API, MCP, LangGraph, LangChain, multi-agent systems, function calling, structured outputs, and prompt engineering.",
      tags: "skills llm agentic stack tools claude gemini openai mcp langgraph langchain multi-agent function calling structured outputs prompt engineering technologies"
    },
    {
      id: "skills-rag",
      source: "Skills · RAG & Retrieval",
      text:
        "RAG & Retrieval stack: Qdrant, ChromaDB, pgvector, sqlite-vec, Voyage embeddings, hybrid BM25 + dense retrieval with RRF, and reranking.",
      tags: "skills rag retrieval vector database qdrant chromadb pgvector sqlite-vec voyage embeddings hybrid bm25 dense rrf reranking search"
    },
    {
      id: "skills-backend",
      source: "Skills · Backend & Data",
      text:
        "Backend & Data stack: Python, FastAPI, async Python, SQLAlchemy + Alembic, PostgreSQL, Redis, Pydantic, Polars, scikit-learn, and LightGBM.",
      tags: "skills backend data engineering python fastapi async sqlalchemy alembic postgresql redis pydantic polars scikit-learn sklearn lightgbm database api"
    },
    {
      id: "skills-mlops",
      source: "Skills · MLOps & Governance",
      text:
        "MLOps & Governance stack: Docker & docker-compose, CI/CD (GitHub Actions), pytest (TDD), Ruff/mypy, plus ISO/IEC 42001, ISO/IEC 27001 and KVKK / GDPR / EU-AI-Act awareness.",
      tags: "skills mlops governance devops docker docker-compose ci cd github actions pytest tdd ruff mypy iso 42001 27001 kvkk gdpr eu ai act compliance testing linting"
    },
    {
      id: "certs",
      source: "Certifications",
      text:
        "Certifications: ISO/IEC 42001 Lead Auditor (AI Management System); ISO/IEC 27001:2022 Lead Auditor (Information Security); Miuul (Data Scientist Bootcamp, Generative AI & Prompt Engineering, Deep Learning, Time Series, Recommendation Systems, ML Summer Camp); and Yapay Zeka ve Teknoloji Akademisi (Deep Learning, Web App Development).",
      tags: "certifications certificate iso 42001 27001 lead auditor ai management information security governance miuul bootcamp data scientist generative ai deep learning time series recommendation academy"
    },
    {
      id: "governance",
      source: "Skills · MLOps & Governance",
      text:
        "Yes — governance is a core part of my profile. I'm an ISO/IEC 42001 Lead Auditor (AI Management System) and an ISO/IEC 27001:2022 Lead Auditor (Information Security), and I build with KVKK / GDPR / EU-AI-Act awareness. At MCV my agentic audit assistant runs fully on-device specifically to stay KVKK / EU-AI-Act compliant.",
      tags: "governance compliance iso 42001 27001 lead auditor ai management information security kvkk gdpr eu ai act regulation responsible ai safety on-device privacy do you have governance experience"
    },
    {
      id: "result",
      source: "Projects · Flagship",
      text:
        "My strongest result: on the flagship multi-agent system I lifted top-1 retrieval from 43% to 86% on a 7-query legislation ground-truth set, and achieved 0% citation hallucination across 5 end-to-end scenarios by enforcing provenance. It's backed by 700+ automated tests (Python + Playwright).",
      tags: "strongest result best metric achievement impact 43 86 top-1 retrieval 0 hallucination provenance 700 tests numbers proof outcomes accuracy improvement",
      noLink: true,
      linkNote: "Private repository — see my GitHub profile for public work."
    },
    {
      id: "open-to-work",
      source: "Contact",
      text:
        "Yes — I'm open to AI Engineer roles focused on LLM, RAG and agentic systems. The fastest way to reach me is email at fatih.e.cetin@gmail.com, or connect on LinkedIn.",
      tags: "open to work hiring available job role opportunity contact reach email linkedin availability are you available looking for work hire",
      link: { label: "fatih.e.cetin@gmail.com", href: "mailto:fatih.e.cetin@gmail.com" }
    },
    {
      id: "contact",
      source: "Contact",
      text:
        "You can reach me by email at fatih.e.cetin@gmail.com, on LinkedIn (in/fatih-eren-cetin), or GitHub (FatihErenCetin). I'm also on Kaggle (fatiherencetin) and HackerRank (fecetinn).",
      tags: "contact email linkedin github kaggle hackerrank reach links connect get in touch social",
      link: { label: "fatih.e.cetin@gmail.com", href: "mailto:fatih.e.cetin@gmail.com" }
    },
    {
      id: "stack-overview",
      source: "Skills",
      text:
        "My core tech stack spans four areas. LLM & Agentic: Claude API, Gemini, OpenAI, MCP, LangGraph, LangChain, multi-agent, function calling, structured outputs. RAG & Retrieval: Qdrant, ChromaDB, pgvector, sqlite-vec, Voyage embeddings, hybrid BM25 + dense + RRF, reranking. Backend & Data: Python, FastAPI, async, SQLAlchemy/Alembic, PostgreSQL, Redis, Pydantic, Polars, scikit-learn, LightGBM. MLOps & Governance: Docker, CI/CD (GitHub Actions), pytest (TDD), Ruff/mypy, ISO/IEC 42001 & 27001.",
      tags: "tech stack technologies overview what do you use tools full list everything languages frameworks summary"
    }
  ];

  /* -----------------------------------------------------------------------
   * CURATED INTENTS — power the suggested-question chips.
   * Each maps a question to one or more chunk ids (highest-confidence answer).
   * The retriever falls back to TF-IDF for free-typed questions.
   * --------------------------------------------------------------------- */
  var intents = [
    { q: "What's your flagship project?", chunks: ["proj-flagship"] },
    { q: "Do you have governance / ISO experience?", chunks: ["governance"] },
    { q: "What's your strongest result?", chunks: ["result"] },
    { q: "What's your tech stack?", chunks: ["stack-overview"] },
    { q: "Tell me about the Slack project", chunks: ["exp-fellow"] },
    { q: "Are you open to work?", chunks: ["open-to-work"] }
  ];

  // The chips shown under the seed message (subset, ordered for scanning).
  var suggestedChips = intents.map(function (i) { return i.q; });

  /* -----------------------------------------------------------------------
   * Structured content for the scannable portfolio below the chat.
   * Same facts; shaped for cards. Keeps a single source of truth.
   * --------------------------------------------------------------------- */
  var stats = [
    { value: "43% → 86%", label: "top-1 retrieval (7-query ground truth)" },
    { value: "0%", label: "citation hallucination (5 scenarios)" },
    { value: "9-agent", label: "Claude pipeline (Sonnet 4.6 + Haiku 4.5)" },
    { value: "700+", label: "automated tests (Python + Playwright)" },
    { value: "Top 4.7%", label: "AI fellow of 31,700 applicants" },
    { value: "2× ISO LA", label: "42001 (AI) + 27001 (InfoSec)" }
  ];

  var projects = [
    {
      title: "Multi-Agent LLM System — Citation-Backed Regulatory Documents",
      flag: "Flagship",
      state: "Private repository",
      summary:
        "9 specialized Claude agents (Sonnet 4.6 + Haiku 4.5) over a deterministic Python orchestrator, with dense RAG (article-aware chunking, Qdrant + Voyage-3-Large + rerank-2).",
      rationale:
        "Chose a deterministic orchestrator over an open-ended agent loop for auditability; dense RAG with article-aware chunking + reranking because legislation is citation-critical and exact provenance matters more than recall breadth.",
      metrics: ["43% → 86% top-1 retrieval", "0% citation hallucination", "700+ tests"],
      tags: ["Claude", "Multi-Agent", "Dense RAG", "FastAPI", "Arq/Redis", "PostgreSQL"],
      link: null
    },
    {
      title: "RAG Systems — Chat With Your Documents",
      flag: "Public",
      state: "Open source",
      summary:
        "FastAPI + Streamlit + Google Gemini + ChromaDB with a hexagonal (Ports & Adapters) architecture, per-chunk source citations, and cross-lingual TR/EN support.",
      rationale:
        "Hexagonal architecture so the LLM and vector store are swappable adapters — the retrieval core is testable in isolation, which is how it reaches a 64-test suite without a live model.",
      metrics: ["64-test suite", "Per-chunk citations", "TR / EN cross-lingual"],
      tags: ["FastAPI", "Streamlit", "Gemini", "ChromaDB", "Hexagonal"],
      link: { label: "View on GitHub", href: "https://github.com/FatihErenCetin/RAG-System" }
    },
    {
      title: "Multi-Agent SME Operations Assistant",
      flag: "Team · core dev/lead",
      state: "No public link",
      summary:
        "Google Gemini function calling with per-agent permission scoping, on Telegram + Web.",
      rationale:
        "Per-agent permission scoping plus deterministic fallbacks and API-key rotation — graceful degradation was a requirement, not a nice-to-have, because the assistant touches business operations.",
      metrics: ["Permission scoping", "API-key rotation", "Deterministic fallbacks"],
      tags: ["Gemini", "Function Calling", "Telegram", "Web"],
      link: null
    },
    {
      title: "Investment-Incentive Analytics & Forecasting Platform",
      flag: "Data / Forecasting",
      state: "No public link",
      summary:
        "Reconciled 132 official sources (55 Excel + 77 Word) into a 77K-record dataset (Parquet + SQLite); 5-model out-of-sample backtest.",
      rationale:
        "Ran an honest out-of-sample backtest against a seasonal-naive baseline rather than reporting in-sample fit — SARIMA's 24% MAPE only means something next to the 93% naive baseline.",
      metrics: ["132 sources → 77K records", "SARIMA 24% MAPE", "vs 93% seasonal-naive"],
      tags: ["SARIMA", "Backtest", "Polars", "Streamlit", "Plotly"],
      link: null
    },
    {
      title: "Financial Time-Series Forecasting",
      flag: "Data / Forecasting",
      state: "No public link",
      summary:
        "30+ technical indicators (RSI, MACD, Bollinger…) feeding LightGBM + SARIMA/SARIMAX on Borsa İstanbul.",
      rationale:
        "Paired a gradient-boosted model (LightGBM) with classical SARIMA/SARIMAX so tree-based feature interactions and explicit seasonality are both captured, rather than betting on one family.",
      metrics: ["30+ indicators", "LightGBM", "SARIMA / SARIMAX"],
      tags: ["LightGBM", "SARIMA", "scikit-learn", "Borsa İstanbul"],
      link: null
    }
  ];

  var experience = [
    {
      org: "MCV Uluslararası Uygunluk Değerlendirme Danışmanlık",
      title: "AI Engineer",
      where: "Ankara",
      when: "Sep 2024 – Present",
      bullets: [
        "Agentic ISO/IEC 17020 conformity-audit assistant: Claude Agent SDK + 2 MCP servers + local hybrid RAG (FTS5 BM25 + sqlite-vec + RRF), on-device and KVKK / EU-AI-Act compliant.",
        "Full-stack multi-agent RAG import-compliance assistant (FastAPI + LangGraph).",
        "Designed & delivered an internal AI training curriculum (LLMs, prompt engineering, RAG, agents)."
      ]
    },
    {
      org: "Yapay Zeka ve Teknoloji Akademisi",
      title: "AI Fellow",
      where: "Remote",
      when: "Dec 2025 – Present",
      bullets: [
        "Admitted in the top 4.7% of 31,700 applicants; one of 5 fellows building community tooling.",
        "Lead developer of a 4-person team — Slack microservice platform: Slack Bolt, async SQLAlchemy/PostgreSQL, Groq Llama 3.3 summarization, sentence-transformers + UMAP/HDBSCAN clustering."
      ]
    },
    {
      org: "Bilkent University & earlier",
      title: "MCV Intern · Lab Assistant · Innovation Intern",
      where: "Ankara",
      when: "2022 – 2024",
      bullets: [
        "MCV Intern (2024).",
        "Lab Assistant, Bilkent University (2022–2024) — instructed 100+ students in Python.",
        "Innovation Intern, SA (2022)."
      ]
    }
  ];

  var skillGroups = [
    {
      name: "LLM & Agentic",
      items: ["Anthropic Claude API", "Google Gemini", "OpenAI API", "MCP", "LangGraph", "LangChain", "Multi-agent", "Function calling", "Structured outputs", "Prompt engineering"]
    },
    {
      name: "RAG & Retrieval",
      items: ["Qdrant", "ChromaDB", "pgvector", "sqlite-vec", "Voyage embeddings", "Hybrid BM25 + dense", "RRF", "Reranking"]
    },
    {
      name: "Backend & Data",
      items: ["Python", "FastAPI", "Async Python", "SQLAlchemy + Alembic", "PostgreSQL", "Redis", "Pydantic", "Polars", "scikit-learn", "LightGBM"]
    },
    {
      name: "MLOps & Governance",
      items: ["Docker / compose", "CI/CD (GitHub Actions)", "pytest (TDD)", "Ruff / mypy", "ISO/IEC 42001", "ISO/IEC 27001", "KVKK / GDPR / EU-AI-Act"]
    }
  ];

  var certifications = [
    { name: "ISO/IEC 42001 Lead Auditor", note: "AI Management System", star: true },
    { name: "ISO/IEC 27001:2022 Lead Auditor", note: "Information Security", star: true },
    { name: "Miuul", note: "Data Scientist Bootcamp · GenAI & Prompt Eng. · Deep Learning · Time Series · Recommendation Systems · ML Summer Camp" },
    { name: "Yapay Zeka ve Teknoloji Akademisi", note: "Deep Learning · Web App Development" }
  ];

  window.KB = {
    identity: IDENTITY,
    contact: CONTACT,
    chunks: chunks,
    intents: intents,
    suggestedChips: suggestedChips,
    stats: stats,
    projects: projects,
    experience: experience,
    skillGroups: skillGroups,
    certifications: certifications
  };
})();
