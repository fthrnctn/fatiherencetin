# Canonical content — fatiherencetin.com

Single source of truth for all design variants. Derived from the CV (cv-en.tex,
2026-06). **Only verified facts** — do not invent metrics, repos, or links.

## Identity
- **Name:** Fatih Eren Çetin
- **Role:** AI Engineer · LLM & Agentic AI
- **Location:** Ankara, Türkiye
- **Hero thesis:** Building production-grade LLM, RAG & multi-agent systems.
- **One-liner (CV profile):** AI Engineer building production-grade LLM, RAG, and
  multi-agent systems — most recently a 9-agent Claude pipeline that lifted top-1
  retrieval from 43% to 86% with 0% citation hallucination.

## About (long)
Mathematics BSc (full scholarship, Bilkent University) turned AI Engineer. I build
production-grade LLM, RAG and multi-agent systems that act over tools, APIs and
data — paired with ISO/IEC 42001 (AI Management) & 27001 Lead Auditor governance
and reliability rigor. Foundations from instructing 100+ students in Python.

## Signature stats (verified — safe to feature)
- 9-agent Claude pipeline (Sonnet 4.6 + Haiku 4.5)
- 43% → 86% top-1 retrieval (7-query ground truth)
- 0% citation hallucination across 5 end-to-end scenarios
- 700+ automated tests (Python + Playwright E2E)
- ISO/IEC 42001 & 27001 Lead Auditor
- Mathematics BSc — full scholarship

## Experience
1. **AI Engineer** — MCV Uluslararası Uygunluk Değerlendirme Danışmanlık · Ankara · 09/2024–Present
   - Agentic ISO/IEC 17020 conformity-audit assistant (Claude Agent SDK + 2 MCP servers + local hybrid RAG: FTS5 BM25 + sqlite-vec + RRF), on-device, KVKK/EU-AI-Act compliant.
   - Full-stack multi-agent RAG import-compliance assistant (FastAPI + LangGraph).
   - Designed & delivered an internal AI training curriculum (LLM, prompt eng., RAG, agents).
2. **AI Fellow** — Yapay Zeka ve Teknoloji Akademisi · Remote · 12/2025–Present
   - Top 4.7% of 31,700 applicants; one of 5 fellows building community tooling.
   - Lead developer of a 4-person team — Slack microservice platform (Slack Bolt, async SQLAlchemy/PostgreSQL, Groq Llama 3.3 summarization, sentence-transformers + UMAP/HDBSCAN clustering).
3. Earlier: MCV Intern (2024); Lab Assistant, Bilkent (2022–2024, 100+ students in Python); SA Innovation Intern (2022).

## Education
- **BSc Mathematics (Full Scholarship)** — Bilkent University, 2024. English-medium.

## Projects (real — from CV)
1. **Multi-Agent LLM System — Citation-Backed Regulatory Documents**  *(flagship, private repo)*
   9 specialized Claude agents (Sonnet 4.6 + Haiku 4.5) over a deterministic Python orchestrator; dense RAG (Qdrant + Voyage-3-Large + rerank-2); 43→86% top-1, 0% hallucination, 700+ tests. Async FastAPI + Arq/Redis + PostgreSQL, human-in-the-loop review.
   Tags: Claude · Multi-Agent · RAG · FastAPI. **Link:** none (private) — link to GitHub profile.
2. **RAG Systems — Chat With Your Documents**  *(public)*
   FastAPI + Streamlit + Google Gemini + ChromaDB; hexagonal (Ports & Adapters) architecture, per-chunk source citations, TR/EN cross-lingual, 64-test suite.
   **Link:** https://github.com/FatihErenCetin/RAG-System
3. **Multi-Agent SME Operations Assistant (Gemini, Telegram + Web)**  *(team — core dev/lead)*
   Google Gemini function calling, per-agent permission scoping, graceful degradation (API-key rotation + deterministic fallbacks). Link: none.
4. **Investment-Incentive Analytics & Forecasting Platform**
   132 official sources (55 Excel + 77 Word), 77K-record dataset (Parquet + SQLite); 5-model out-of-sample backtest — SARIMA 24% MAPE vs 93% seasonal-naive; Streamlit/Plotly. Link: none.
5. **Financial Time-Series Forecasting**
   30+ technical indicators (RSI, MACD, Bollinger…), LightGBM + SARIMA/SARIMAX, Borsa İstanbul. Link: none.

## Skills (real stack — NO AWS/React/Node/Kubernetes; those were wrong on the old site)
- **LLM & Agentic:** Anthropic Claude API, Google Gemini, OpenAI API, MCP, LangGraph, LangChain, multi-agent systems, function calling, structured outputs, prompt engineering
- **RAG & Retrieval:** Qdrant, ChromaDB, pgvector, sqlite-vec, Voyage embeddings, hybrid BM25+dense + RRF, reranking
- **Backend & Data:** Python, FastAPI, async Python, SQLAlchemy + Alembic, PostgreSQL, Redis, Pydantic, Polars, scikit-learn, LightGBM
- **MLOps & Governance:** Docker & docker-compose, CI/CD (GitHub Actions), pytest (TDD), Ruff/mypy, ISO/IEC 42001, ISO/IEC 27001, KVKK/GDPR/EU-AI-Act-aware

## Certifications
- ★ **ISO/IEC 42001 Lead Auditor** (AI Management System)
- ★ **ISO/IEC 27001:2022 Lead Auditor** (Information Security)
- Miuul: Data Scientist Bootcamp, Generative AI & Prompt Engineering, Deep Learning, Time Series, Recommendation Systems, ML Summer Camp
- Yapay Zeka ve Teknoloji Akademisi: Deep Learning, Web App Development

## Data-science portfolio (older, real — under the `fecetinn` GitHub account)
RFM-CLTV Analysis, Rating & Review Sorting, A/B Testing, CLTV Prediction (BG/NBD + Gamma-Gamma),
Customer Segmentation (RFM), Rule-Based Segmentation, Telco Customer Churn (+ Kaggle notebook).
Base: https://github.com/fecetinn

## Contact / links (VERIFIED — use exactly these)
- Email: fatih.e.cetin@gmail.com
- LinkedIn: https://linkedin.com/in/fatih-eren-cetin
- GitHub (primary): https://github.com/FatihErenCetin
- Kaggle: https://kaggle.com/fatiherencetin
- HackerRank: https://hackerrank.com/fecetinn

## Personal touch (user opted in — keep light)
- Spotify "music I code to" — existing links are real public playlists (lofi chill, Focus Flow); fine to keep. `[user can swap to a personal playlist]`
- Older Kaggle/DS work above adds depth.

## DO NOT include (fake / unverified — removed from old site)
- github.com/username/* placeholder projects; medium @username blog posts; DIY (3d-printing/rc-car/drone) links
- Twitter @fthrnctn, Medium @fatih.e.cetin (unverified) — omit unless user confirms
- AWS, React, Node.js, Kubernetes, TensorFlow/PyTorch as primary, certificate-link.com
- Phone number (privacy — omit from public site)

## Two GitHub handles — note for user
CV/primary is **FatihErenCetin** (has RAG-System). Older DS repos live under **fecetinn**.
Site uses FatihErenCetin as primary; DS section links to fecetinn. Consider consolidating.
