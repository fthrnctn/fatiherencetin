/* ================================================
   MAIN APPLICATION SCRIPT
   Handles: Navigation, Modal, Scroll Reveal, Cards
   Content sourced from the CV — see ../CONTENT.md
   ================================================ */

// ================================================
// CARD CONTENT DATA
// ================================================
const cardContents = {
    about: {
        icon: 'fas fa-user',
        title: 'About Me',
        content: `
            <div class="section-title"><i class="fas fa-quote-left"></i>About</div>
            <p class="bio-text">
                Mathematics BSc (full scholarship, Bilkent University) turned AI Engineer. I build
                production-grade LLM, RAG and multi-agent systems that act over tools, APIs and data.
            </p>
            <p class="bio-text">
                My most recent system is a 9-agent Claude pipeline that lifted top-1 retrieval from
                43% to 86% with 0% citation hallucination. I pair hands-on engineering with ISO/IEC
                42001 (AI Management) & 27001 Lead Auditor governance and reliability rigor.
            </p>

            <div class="section-title"><i class="fas fa-briefcase"></i>Experience</div>
            <ul class="item-list">
                <li>AI Engineer — MCV Conformity Assessment Consultancy (2024 – present)</li>
                <li>AI Fellow — Yapay Zeka ve Teknoloji Akademisi (top 4.7% of 31,700)</li>
                <li>Lab Assistant — Bilkent University (100+ students in Python)</li>
            </ul>

            <div class="section-title"><i class="fas fa-graduation-cap"></i>Education</div>
            <ul class="item-list">
                <li>BSc Mathematics, Full Scholarship — Bilkent University (2024)</li>
            </ul>

            <div class="section-title"><i class="fas fa-shield-halved"></i>Credentials</div>
            <ul class="item-list">
                <li>ISO/IEC 42001 Lead Auditor — AI Management System</li>
                <li>ISO/IEC 27001 Lead Auditor — Information Security</li>
            </ul>
        `
    },

    ai: {
        icon: 'fas fa-robot',
        title: 'LLM & Agentic Projects',
        content: `
            <a href="https://github.com/FatihErenCetin" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fas fa-diagram-project"></i>Multi-Agent LLM System</span>
                    <i class="fas fa-lock project-card-arrow" title="private repo"></i>
                </div>
                <p class="project-card-desc">Flagship — 9 specialized Claude agents (Sonnet 4.6 + Haiku 4.5) over a
                    deterministic orchestrator; dense RAG (Qdrant + Voyage-3-Large + rerank-2) lifted top-1 retrieval
                    43% → 86% with 0% citation hallucination; 700+ tests. <em>Private repository.</em></p>
            </a>

            <a href="https://github.com/FatihErenCetin/RAG-System" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fas fa-comments"></i>RAG — Chat With Your Documents</span>
                    <i class="fas fa-arrow-right project-card-arrow"></i>
                </div>
                <p class="project-card-desc">FastAPI + Streamlit + Google Gemini + ChromaDB; hexagonal (Ports & Adapters)
                    architecture, per-chunk source citations, TR/EN cross-lingual retrieval, 64-test suite.</p>
            </a>

            <a href="https://github.com/FatihErenCetin" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fas fa-network-wired"></i>Multi-Agent SME Assistant</span>
                    <i class="fas fa-arrow-right project-card-arrow"></i>
                </div>
                <p class="project-card-desc">Team project (core dev / lead) — Google Gemini function calling with
                    per-agent permission scoping; Telegram + Web; graceful degradation via API-key rotation and
                    deterministic fallbacks.</p>
            </a>

            <a href="https://github.com/FatihErenCetin" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fas fa-chart-area"></i>Investment-Incentive Analytics</span>
                    <i class="fas fa-arrow-right project-card-arrow"></i>
                </div>
                <p class="project-card-desc">132 official sources (55 Excel + 77 Word) → 77K-record dataset; 5-model
                    out-of-sample backtest (SARIMA 24% MAPE vs 93% seasonal-naive); Streamlit/Plotly dashboard.</p>
            </a>

            <a href="https://github.com/FatihErenCetin" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fas fa-coins"></i>Financial Time-Series Forecasting</span>
                    <i class="fas fa-arrow-right project-card-arrow"></i>
                </div>
                <p class="project-card-desc">30+ technical indicators (RSI, MACD, Bollinger Bands…); LightGBM and
                    SARIMA/SARIMAX models forecasting Borsa İstanbul closing prices.</p>
            </a>
        `
    },

    data: {
        icon: 'fas fa-chart-line',
        title: 'Data Science',
        content: `
            <a href="https://github.com/fecetinn/RFM-CLTV-Analysis-Online-Retail" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fas fa-users"></i>RFM-CLTV Analysis</span>
                    <i class="fas fa-arrow-right project-card-arrow"></i>
                </div>
                <p class="project-card-desc">Customer value analysis using RFM segmentation and CLTV prediction.</p>
            </a>

            <a href="https://github.com/fecetinn/Product-Rating-Review-Sorting-Analysis" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fas fa-star"></i>Rating & Review Sorting</span>
                    <i class="fas fa-arrow-right project-card-arrow"></i>
                </div>
                <p class="project-card-desc">Product rating and review sorting analysis for e-commerce.</p>
            </a>

            <a href="https://github.com/fecetinn/A-B-Testing-Bidding-Strategies-Analysis" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fas fa-flask"></i>A/B Testing Analysis</span>
                    <i class="fas fa-arrow-right project-card-arrow"></i>
                </div>
                <p class="project-card-desc">A/B testing for bidding strategies and conversion optimization.</p>
            </a>

            <a href="https://github.com/fecetinn/CLTV-Prediction-with-BN-BGD-and-Gamma-Gamma" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fas fa-chart-line"></i>CLTV Prediction</span>
                    <i class="fas fa-arrow-right project-card-arrow"></i>
                </div>
                <p class="project-card-desc">Customer lifetime value prediction using BG/NBD and Gamma-Gamma models.</p>
            </a>

            <a href="https://github.com/fecetinn/Customer_Segmentation_with_RFM" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fas fa-layer-group"></i>Customer Segmentation</span>
                    <i class="fas fa-arrow-right project-card-arrow"></i>
                </div>
                <p class="project-card-desc">Customer segmentation using RFM analysis and clustering.</p>
            </a>

            <a href="https://github.com/fecetinn/Telcom_Customer_Churn" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fas fa-user-slash"></i>Telco Customer Churn</span>
                    <i class="fas fa-arrow-right project-card-arrow"></i>
                </div>
                <p class="project-card-desc">Telecom customer churn prediction using machine learning.</p>
            </a>

            <a href="https://www.kaggle.com/code/fatiherencetin/telco-customer-churn" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fab fa-kaggle"></i>Kaggle: Churn Analysis</span>
                    <i class="fas fa-arrow-right project-card-arrow"></i>
                </div>
                <p class="project-card-desc">Kaggle notebook for telco customer churn analysis.</p>
            </a>
        `
    },

    certs: {
        icon: 'fas fa-certificate',
        title: 'Certifications',
        content: `
            <div class="skill-card">
                <div class="skill-card-header">
                    <span class="skill-card-title"><i class="fas fa-shield-halved"></i>ISO/IEC 42001 Lead Auditor</span>
                </div>
                <p class="skill-card-desc">AI Management System — governance, risk and lifecycle controls for AI.</p>
            </div>

            <div class="skill-card">
                <div class="skill-card-header">
                    <span class="skill-card-title"><i class="fas fa-lock"></i>ISO/IEC 27001:2022 Lead Auditor</span>
                </div>
                <p class="skill-card-desc">Information Security Management System.</p>
            </div>

            <div class="skill-card">
                <div class="skill-card-header">
                    <span class="skill-card-title"><i class="fas fa-wand-magic-sparkles"></i>Miuul — AI & Data Science</span>
                </div>
                <p class="skill-card-desc">Data Scientist Bootcamp, Generative AI & Prompt Engineering, Deep Learning,
                    Time Series, Recommendation Systems, ML Summer Camp.</p>
            </div>

            <div class="skill-card">
                <div class="skill-card-header">
                    <span class="skill-card-title"><i class="fas fa-graduation-cap"></i>Yapay Zeka ve Teknoloji Akademisi</span>
                </div>
                <p class="skill-card-desc">Deep Learning, Web App Development.</p>
            </div>
        `
    },

    skills: {
        icon: 'fas fa-code',
        title: 'Skills',
        content: `
            <div class="skill-card">
                <div class="skill-card-header">
                    <span class="skill-card-title"><i class="fas fa-robot"></i>LLM & Agentic</span>
                </div>
                <p class="skill-card-desc">Anthropic Claude API, Google Gemini, OpenAI API, MCP, LangGraph, LangChain,
                    multi-agent systems, function calling, structured outputs, prompt engineering.</p>
            </div>

            <div class="skill-card">
                <div class="skill-card-header">
                    <span class="skill-card-title"><i class="fas fa-magnifying-glass"></i>RAG & Retrieval</span>
                </div>
                <p class="skill-card-desc">Qdrant, ChromaDB, pgvector, sqlite-vec, Voyage embeddings, hybrid BM25 + dense
                    + RRF, reranking, grounded retrieval.</p>
            </div>

            <div class="skill-card">
                <div class="skill-card-header">
                    <span class="skill-card-title"><i class="fas fa-server"></i>Backend & Data</span>
                </div>
                <p class="skill-card-desc">Python, FastAPI, async Python, SQLAlchemy + Alembic, PostgreSQL, Redis,
                    Pydantic, Polars, scikit-learn, LightGBM.</p>
            </div>

            <div class="skill-card">
                <div class="skill-card-header">
                    <span class="skill-card-title"><i class="fas fa-shield-halved"></i>MLOps & Governance</span>
                </div>
                <p class="skill-card-desc">Docker & docker-compose, CI/CD (GitHub Actions), pytest (TDD), Ruff/mypy,
                    ISO/IEC 42001, ISO/IEC 27001, KVKK/GDPR/EU-AI-Act-aware engineering.</p>
            </div>
        `
    },

    kaggle: {
        icon: 'fab fa-kaggle',
        title: 'Kaggle & Profiles',
        content: `
            <a href="https://www.kaggle.com/fatiherencetin" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fab fa-kaggle"></i>Kaggle Profile</span>
                    <i class="fas fa-arrow-right project-card-arrow"></i>
                </div>
                <p class="project-card-desc">Notebooks and datasets — data science and ML experiments.</p>
            </a>

            <a href="https://www.kaggle.com/code/fatiherencetin/telco-customer-churn" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fas fa-book"></i>Telco Customer Churn</span>
                    <i class="fas fa-arrow-right project-card-arrow"></i>
                </div>
                <p class="project-card-desc">End-to-end churn analysis notebook.</p>
            </a>

            <a href="https://www.hackerrank.com/profile/fecetinn" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fab fa-hackerrank"></i>HackerRank</span>
                    <i class="fas fa-arrow-right project-card-arrow"></i>
                </div>
                <p class="project-card-desc">Problem-solving and algorithms.</p>
            </a>
        `
    },

    github: {
        icon: 'fab fa-github',
        title: 'GitHub Stats',
        content: `
            <div class="github-modal-content">
                <div class="github-stats-grid">
                    <div class="github-stat-card">
                        <i class="fas fa-code-branch"></i>
                        <span class="stat-value" id="github-repos">--</span>
                        <span class="stat-label">Repositories</span>
                    </div>
                    <div class="github-stat-card">
                        <i class="fas fa-star"></i>
                        <span class="stat-value" id="github-stars">--</span>
                        <span class="stat-label">Stars</span>
                    </div>
                    <div class="github-stat-card">
                        <i class="fas fa-users"></i>
                        <span class="stat-value" id="github-followers">--</span>
                        <span class="stat-label">Followers</span>
                    </div>
                    <div class="github-stat-card">
                        <i class="fas fa-user-plus"></i>
                        <span class="stat-value" id="github-following">--</span>
                        <span class="stat-label">Following</span>
                    </div>
                </div>

                <div class="github-languages">
                    <h4 class="github-section-title"><i class="fas fa-code"></i> Top Languages</h4>
                    <div class="language-bars" id="github-languages">
                        <div class="loading-text">Loading languages...</div>
                    </div>
                </div>

                <a href="https://github.com/FatihErenCetin" target="_blank" class="project-card github-profile-link">
                    <div class="project-card-header">
                        <span class="project-card-title"><i class="fab fa-github"></i>Visit My GitHub Profile</span>
                        <i class="fas fa-arrow-right project-card-arrow"></i>
                    </div>
                </a>
            </div>
        `
    },

    spotify: {
        icon: 'fab fa-spotify',
        title: 'Music I Code To',
        content: `
                <div class="spotify-content">
                    <a href="https://open.spotify.com/playlist/37i9dQZF1DWYoYGBbGKurt" target="_blank" class="project-card">
                        <div class="project-card-header">
                            <span class="project-card-title"><i class="fas fa-headphones"></i>lofi chill</span>
                            <i class="fas fa-arrow-right project-card-arrow"></i>
                        </div>
                        <p class="project-card-desc">Chill lo-fi beats for coding and studying.</p>
                    </a>

                    <a href="https://open.spotify.com/playlist/37i9dQZF1DWZZbwlv3Vmtr" target="_blank" class="project-card">
                        <div class="project-card-header">
                            <span class="project-card-title"><i class="fas fa-brain"></i>Focus Flow</span>
                            <i class="fas fa-arrow-right project-card-arrow"></i>
                        </div>
                        <p class="project-card-desc">Deep focus music for productive work sessions.</p>
                    </a>
                </div>
                `
    },

    social: {
        icon: 'fas fa-share-alt',
        title: 'Find Me Online',
        content: `
                <div class="social-grid">
                    <a href="https://www.linkedin.com/in/fatih-eren-cetin" target="_blank" class="social-item">
                        <i class="fab fa-linkedin"></i>
                        <span>LinkedIn</span>
                    </a>

                    <a href="https://github.com/FatihErenCetin" target="_blank" class="social-item">
                        <i class="fab fa-github"></i>
                        <span>GitHub</span>
                    </a>

                    <a href="https://www.kaggle.com/fatiherencetin" target="_blank" class="social-item">
                        <i class="fab fa-kaggle"></i>
                        <span>Kaggle</span>
                    </a>

                    <a href="https://www.hackerrank.com/profile/fecetinn" target="_blank" class="social-item">
                        <i class="fab fa-hackerrank"></i>
                        <span>HackerRank</span>
                    </a>

                    <a href="mailto:fatih.e.cetin@gmail.com" class="social-item">
                        <i class="fas fa-envelope"></i>
                        <span>Email</span>
                    </a>
                </div>
                `
    }
};

// ================================================
// DOM ELEMENTS
// ================================================
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');
const bentoCards = document.querySelectorAll('.bento-card[data-expandable="true"]');

// ================================================
// NAVBAR FUNCTIONALITY
// ================================================
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    lastScrollY = window.scrollY;
});

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const icon = navToggle.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = navToggle.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    });
});

const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// ================================================
// MODAL FUNCTIONALITY
// ================================================
function openModal(cardType) {
    const content = cardContents[cardType];
    if (!content) return;

    modalBody.innerHTML = `
                <div class="modal-header">
                    <div class="card-icon"><i class="${content.icon}"></i></div>
                    <h2>${content.title}</h2>
                </div>
                ${content.content}
                `;

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

bentoCards.forEach(card => {
    card.addEventListener('click', (e) => {
        if (e.target.closest('a')) {
            return; // Let the link work normally
        }
        const cardType = card.dataset.card;
        openModal(cardType);
    });
});

modalClose.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});

modalBody.addEventListener('scroll', () => {
    if (modalBody.scrollTop > 50) {
        modalClose.classList.add('scroll-hide');
    } else {
        modalClose.classList.remove('scroll-hide');
    }
});

// ================================================
// SCROLL REVEAL ANIMATION
// ================================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('revealed');
            }, index * 100);
            revealObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.bento-card').forEach(card => {
    revealObserver.observe(card);
});

// ================================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ================================================
// HORIZONTAL SCROLL BUTTONS (Carousel Style)
// ================================================
const scrollButtons = document.querySelectorAll('.scroll-btn');
const scrollConfig = {
    'skills': { iconSize: 55, gap: 8 }
};

scrollButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = btn.dataset.target;
        const scrollContainer = document.getElementById(`${target}-scroll`);
        const config = scrollConfig[target];
        if (scrollContainer && config) {
            const scrollAmount = config.iconSize + config.gap;
            const isLeft = btn.classList.contains('scroll-left');
            const icons = scrollContainer.querySelectorAll('.clickable-icon');
            icons.forEach(icon => icon.classList.add('scrolling'));
            if (isLeft) {
                scrollContainer.scrollLeft -= scrollAmount;
            } else {
                scrollContainer.scrollLeft += scrollAmount;
            }
            setTimeout(() => {
                icons.forEach(icon => icon.classList.remove('scrolling'));
            }, 300);
        }
    });
});

// ================================================
// GITHUB API - DYNAMIC STATS FETCHING
// ================================================
const GITHUB_USERNAME = 'FatihErenCetin';

const languageColors = {
    'Python': '#3572A5',
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Jupyter Notebook': '#DA5B0B',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Shell': '#89e051',
    'SQL': '#e38c00',
    'R': '#198CE7',
    'Java': '#b07219'
};

async function fetchGitHubStats() {
    try {
        const userResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
        const userData = await userResponse.json();

        document.getElementById('github-repos').textContent = userData.public_repos || 0;
        document.getElementById('github-followers').textContent = userData.followers || 0;
        document.getElementById('github-following').textContent = userData.following || 0;

        const reposResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`);
        const repos = await reposResponse.json();

        const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
        document.getElementById('github-stars').textContent = totalStars;

        const languageCounts = {};
        let totalBytes = 0;
        repos.forEach(repo => {
            if (repo.language) {
                languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
                totalBytes++;
            }
        });

        const sortedLanguages = Object.entries(languageCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const languagesContainer = document.getElementById('github-languages');
        if (languagesContainer && sortedLanguages.length > 0) {
            languagesContainer.innerHTML = sortedLanguages.map(([lang, count]) => {
                const percent = Math.round((count / totalBytes) * 100);
                const color = languageColors[lang] || '#8b949e';
                return `
                    <div class="language-item">
                        <span class="lang-name">${lang}</span>
                        <div class="lang-bar"><div class="lang-fill" style="width: ${percent}%; background: ${color};"></div></div>
                        <span class="lang-percent">${percent}%</span>
                    </div>
                `;
            }).join('');
        } else if (languagesContainer) {
            languagesContainer.innerHTML = '<div class="loading-text">No public language data yet.</div>';
        }
    } catch (error) {
        console.error('GitHub API Error:', error);
        ['github-repos', 'github-stars', 'github-followers', 'github-following'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = 'N/A';
        });
    }
}

document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-card="github"]');
    if (card) {
        setTimeout(fetchGitHubStats, 100);
    }
});

// ================================================
// INITIALIZATION
// ================================================
console.log('🚀 Fatih Eren Çetin — AI Engineer · Loaded');
