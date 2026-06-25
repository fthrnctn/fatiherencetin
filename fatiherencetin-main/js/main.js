/* ================================================
   MAIN APPLICATION SCRIPT
   Handles: Navigation, Modal, Scroll Reveal, Cards
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
                With a foundation in Mathematics, I specialize in building high-performing AI solutions and machine learning models. Currently, I am applying these skills at developing NLP-based audit prototypes and data pipelines.
            </p>
            <p class="bio-text">
                My passion lies in bridging the gap between complex algorithms and actionable business insights. I excel at translating technical concepts for non-technical stakeholders—a skill honed during my time instructing over 100 students in Python programming.
            </p>
            <p class="bio-text">
                I thrive in environments that require adaptability and technical leadership, having successfully mentored teams and coordinated research events.
            </p>
            
            <div class="section-title"><i class="fas fa-graduation-cap"></i>Education</div>
            <ul class="item-list">
                <li>Bilkent University - Mathematics</li>
            </ul>
            
            <div class="section-title"><i class="fas fa-trophy"></i>Fellowships & Communities</div>
            <ul class="item-list">
                <li>Yapay Zeka Teknoloji Akademisi</li>
            </ul>
            
            <div class="section-title"><i class="fas fa-heart"></i>Interests</div>
            <ul class="item-list">
                <li>AI/ML Research</li>
                <li>Data Science</li>
            </ul>
        `
    },

    ai: {
        icon: 'fas fa-robot',
        title: 'AI/ML Projects',
        content: `
            <a href="https://github.com/username/project1" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fas fa-brain"></i>Proje Adı 1</span>
                    <i class="fas fa-arrow-right project-card-arrow"></i>
                </div>
                <p class="project-card-desc">Bu proje hakkında kısa açıklama. Ne yaptığını ve hangi teknolojileri kullandığını anlat.</p>
            </a>
            
            <a href="https://github.com/username/project2" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fas fa-network-wired"></i>Proje Adı 2</span>
                    <i class="fas fa-arrow-right project-card-arrow"></i>
                </div>
                <p class="project-card-desc">Derin öğrenme modeli ile görüntü sınıflandırma projesi.</p>
            </a>
            
            <a href="https://github.com/username/project3" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fas fa-comments"></i>Proje Adı 3</span>
                    <i class="fas fa-arrow-right project-card-arrow"></i>
                </div>
                <p class="project-card-desc">NLP tabanlı chatbot veya metin analizi projesi.</p>
            </a>
            
            <a href="https://github.com/username/project4" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fas fa-eye"></i>Computer Vision</span>
                    <i class="fas fa-arrow-right project-card-arrow"></i>
                </div>
                <p class="project-card-desc">Görüntü işleme ve nesne tespit projesi.</p>
            </a>
            
            <a href="https://github.com/username/project5" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fas fa-music"></i>Audio ML</span>
                    <i class="fas fa-arrow-right project-card-arrow"></i>
                </div>
                <p class="project-card-desc">Ses tanıma ve müzik analizi projesi.</p>
            </a>
            
            <a href="https://github.com/username/project6" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fas fa-language"></i>Translation Model</span>
                    <i class="fas fa-arrow-right project-card-arrow"></i>
                </div>
                <p class="project-card-desc">Transformer tabanlı çeviri modeli.</p>
            </a>
            
            <a href="https://github.com/username/project7" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fas fa-heartbeat"></i>Health AI</span>
                    <i class="fas fa-arrow-right project-card-arrow"></i>
                </div>
                <p class="project-card-desc">Sağlık verisi analizi ve tahmin modeli.</p>
            </a>
            
            <a href="https://github.com/username/project8" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fas fa-chart-area"></i>Time Series</span>
                    <i class="fas fa-arrow-right project-card-arrow"></i>
                </div>
                <p class="project-card-desc">Zaman serisi analizi ve tahmin modelleri.</p>
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
            
            <a href="https://github.com/fecetinn/rule-based-segmentation-customer-value" target="_blank" class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title"><i class="fas fa-sitemap"></i>Rule-Based Segmentation</span>
                    <i class="fas fa-arrow-right project-card-arrow"></i>
                </div>
                <p class="project-card-desc">Rule-based customer segmentation and value classification.</p>
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

    diy: {
        icon: 'fas fa-tools',
        title: 'DIY Projects',
        content: `
            <div class="diy-modal-grid">
                <a href="https://github.com/username/3d-printing" target="_blank" class="diy-modal-icon">
                    <i class="fas fa-cube"></i>
                    <span class="diy-modal-label">3D Printing</span>
                    <p class="diy-modal-desc">Özel tasarım 3D baskı parçaları ve CAD modelleri.</p>
                </a>
                <a href="https://github.com/username/rc-car" target="_blank" class="diy-modal-icon">
                    <i class="fas fa-car"></i>
                    <span class="diy-modal-label">RC Araç</span>
                    <p class="diy-modal-desc">Uzaktan kumandalı araç yapımı ve modifikasyonları.</p>
                </a>
                <a href="https://github.com/username/electronics" target="_blank" class="diy-modal-icon">
                    <i class="fas fa-microchip"></i>
                    <span class="diy-modal-label">Elektronik</span>
                    <p class="diy-modal-desc">Arduino/ESP32 tabanlı IoT ve otomasyon projeleri.</p>
                </a>
                <a href="https://github.com/username/drone" target="_blank" class="diy-modal-icon">
                    <i class="fas fa-helicopter"></i>
                    <span class="diy-modal-label">Drone</span>
                    <p class="diy-modal-desc">FPV drone yapımı ve uçuş kontrol sistemleri.</p>
                </a>
                <a href="https://github.com/username/cnc" target="_blank" class="diy-modal-icon">
                    <i class="fas fa-cogs"></i>
                    <span class="diy-modal-label">CNC Router</span>
                    <p class="diy-modal-desc">CNC router yapımı ve CNC ile kesim projeleri.</p>
                </a>
                <a href="https://github.com/username/robot-arm" target="_blank" class="diy-modal-icon">
                    <i class="fas fa-robot"></i>
                    <span class="diy-modal-label">Robot Kol</span>
                    <p class="diy-modal-desc">6 eksenli robot kol tasarımı ve kontrolü.</p>
                </a>
                <a href="https://github.com/username/smart-home" target="_blank" class="diy-modal-icon">
                    <i class="fas fa-home"></i>
                    <span class="diy-modal-label">Smart Home</span>
                    <p class="diy-modal-desc">Akıllı ev otomasyon sistemleri.</p>
                </a>
            </div>
        `
    },

    skills: {
        icon: 'fas fa-code',
        title: 'Skills & Certifications',
        content: `
            <div class="skill-card">
                <div class="skill-card-header">
                    <span class="skill-card-title"><i class="fab fa-python"></i>Python & Machine Learning</span>
                    <a href="https://certificate-link.com" target="_blank" class="skill-card-link">
                        Sertifika <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
                <p class="skill-card-desc">TensorFlow, PyTorch, scikit-learn ile ML model geliştirme.</p>
            </div >
            
            <div class="skill-card">
                <div class="skill-card-header">
                    <span class="skill-card-title"><i class="fas fa-database"></i>Data Engineering</span>
                    <a href="https://certificate-link.com" target="_blank" class="skill-card-link">
                        Sertifika <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
                <p class="skill-card-desc">SQL, Pandas, Spark ile veri işleme ve analiz.</p>
            </div>
            
            <div class="skill-card">
                <div class="skill-card-header">
                    <span class="skill-card-title"><i class="fas fa-cloud"></i>Cloud & DevOps</span>
                    <a href="https://certificate-link.com" target="_blank" class="skill-card-link">
                        Sertifika <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
                <p class="skill-card-desc">AWS, Docker, Git ile deployment ve CI/CD.</p>
            </div>
            
            <div class="skill-card">
                <div class="skill-card-header">
                    <span class="skill-card-title"><i class="fas fa-code"></i>Web Development</span>
                </div>
                <p class="skill-card-desc">HTML, CSS, JavaScript, React ile web uygulamaları.</p>
            </div>
            
            <div class="skill-card">
                <div class="skill-card-header">
                    <span class="skill-card-title"><i class="fab fa-docker"></i>Containerization</span>
                    <a href="https://certificate-link.com" target="_blank" class="skill-card-link">
                        Sertifika <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
                <p class="skill-card-desc">Docker, Kubernetes ile container orchestration.</p>
            </div>
            
            <div class="skill-card">
                <div class="skill-card-header">
                    <span class="skill-card-title"><i class="fab fa-git-alt"></i>Version Control</span>
                </div>
                <p class="skill-card-desc">Git, GitHub, GitLab ile versiyon kontrolü ve CI/CD.</p>
            </div>
            
            <div class="skill-card">
                <div class="skill-card-header">
                    <span class="skill-card-title"><i class="fab fa-linux"></i>Linux Administration</span>
                    <a href="https://certificate-link.com" target="_blank" class="skill-card-link">
                        Sertifika <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
                <p class="skill-card-desc">Linux sistem yönetimi, shell scripting, otomasyon.</p>
            </div>
            
            <div class="skill-card">
                <div class="skill-card-header">
                    <span class="skill-card-title"><i class="fas fa-brain"></i>Deep Learning</span>
                    <a href="https://certificate-link.com" target="_blank" class="skill-card-link">
                        Sertifika <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
                <p class="skill-card-desc">CNN, RNN, Transformer modelleri ile derin öğrenme.</p>
            </div>
            
            <div class="skill-card">
                <div class="skill-card-header">
                    <span class="skill-card-title"><i class="fas fa-robot"></i>NLP & LLMs</span>
                </div>
                <p class="skill-card-desc">BERT, GPT, LangChain ile doğal dil işleme projeleri.</p>
            </div>
            
            <div class="skill-card">
                <div class="skill-card-header">
                    <span class="skill-card-title"><i class="fas fa-chart-bar"></i>Data Visualization</span>
                </div>
                <p class="skill-card-desc">Matplotlib, Plotly, Tableau ile veri görselleştirme.</p>
            </div>
`
    },

    blog: {
        icon: 'fas fa-pen-fancy',
        title: 'Blog Yazıları',
        content: `
    < a href = "https://medium.com/@username/article1" target = "_blank" class="blog-item" >
                <span class="blog-item-title">Makine Öğrenmesine Giriş</span>
                <i class="fas fa-arrow-right blog-item-arrow"></i>
            </a >
            
            <a href="https://medium.com/@username/article2" target="_blank" class="blog-item">
                <span class="blog-item-title">Python ile Veri Analizi</span>
                <i class="fas fa-arrow-right blog-item-arrow"></i>
            </a>
            
            <a href="https://medium.com/@username/article3" target="_blank" class="blog-item">
                <span class="blog-item-title">Derin Öğrenme Temelleri</span>
                <i class="fas fa-arrow-right blog-item-arrow"></i>
            </a>
            
            <a href="https://medium.com/@username/article4" target="_blank" class="blog-item">
                <span class="blog-item-title">3D Printing ile Prototipleme</span>
                <i class="fas fa-arrow-right blog-item-arrow"></i>
            </a>
            
            <a href="https://medium.com/@username/article5" target="_blank" class="blog-item">
                <span class="blog-item-title">Docker ile Deployment</span>
                <i class="fas fa-arrow-right blog-item-arrow"></i>
            </a>
            
            <a href="https://medium.com/@username/article6" target="_blank" class="blog-item">
                <span class="blog-item-title">AWS Lambda Başlangıç</span>
                <i class="fas fa-arrow-right blog-item-arrow"></i>
            </a>
            
            <a href="https://medium.com/@username/article7" target="_blank" class="blog-item">
                <span class="blog-item-title">Git ve GitHub İpuçları</span>
                <i class="fas fa-arrow-right blog-item-arrow"></i>
            </a>
            
            <a href="https://medium.com/@username/article8" target="_blank" class="blog-item">
                <span class="blog-item-title">React ile UI Geliştirme</span>
                <i class="fas fa-arrow-right blog-item-arrow"></i>
            </a>
            
            <a href="https://medium.com/@username/article9" target="_blank" class="blog-item">
                <span class="blog-item-title">Kaggle Yarışma Stratejileri</span>
                <i class="fas fa-arrow-right blog-item-arrow"></i>
            </a>
            
            <a href="https://medium.com/@username/article10" target="_blank" class="blog-item">
                <span class="blog-item-title">LLM Fine-Tuning Rehberi</span>
                <i class="fas fa-arrow-right blog-item-arrow"></i>
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
                
                <a href="https://github.com/fecetinn" target="_blank" class="project-card github-profile-link">
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
        title: 'Spotify Playlists',
        content: `
                <div class="spotify-content">
                    <a href="https://open.spotify.com/playlist/37i9dQZF1DWXe9gFZP0gtP" target="_blank" class="project-card">
                        <div class="project-card-header">
                            <span class="project-card-title"><i class="fas fa-spa"></i>Stress Relief</span>
                            <i class="fas fa-arrow-right project-card-arrow"></i>
                        </div>
                        <p class="project-card-desc">Ambient sounds for relaxation and stress relief.</p>
                    </a>

                    <a href="https://open.spotify.com/playlist/37i9dQZF1DX9j444F9NCBa" target="_blank" class="project-card">
                        <div class="project-card-header">
                            <span class="project-card-title"><i class="fas fa-music"></i>Calming Instrumental Covers</span>
                            <i class="fas fa-arrow-right project-card-arrow"></i>
                        </div>
                        <p class="project-card-desc">Peaceful piano covers of popular songs.</p>
                    </a>

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
        title: 'Social Platforms',
        content: `
                <div class="social-grid">
                    <a href="https://www.linkedin.com/in/fatih-eren-cetin" target="_blank" class="social-item">
                        <i class="fab fa-linkedin"></i>
                        <span>LinkedIn</span>
                    </a>

                    <a href="https://twitter.com/fthrnctn" target="_blank" class="social-item">
                        <i class="fab fa-twitter"></i>
                        <span>Twitter</span>
                    </a>

                    <a href="https://www.kaggle.com/fatiherencetin" target="_blank" class="social-item">
                        <i class="fab fa-kaggle"></i>
                        <span>Kaggle</span>
                    </a>

                    <a href="https://medium.com/@fatih.e.cetin" target="_blank" class="social-item">
                        <i class="fab fa-medium"></i>
                        <span>Medium</span>
                    </a>

                    <a href="https://github.com/fecetinn" target="_blank" class="social-item">
                        <i class="fab fa-github"></i>
                        <span>GitHub</span>
                    </a>

                    <a href="https://www.hackerrank.com/profile/fecetinn" target="_blank" class="social-item">
                        <i class="fab fa-hackerrank"></i>
                        <span>HackerRank</span>
                    </a>

                    <a href="mailto:fatih.e.cetin@gmail.com" target="_blank" class="social-item">
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

// Scroll effect
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    lastScrollY = window.scrollY;
});

// Mobile toggle
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const icon = navToggle.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

// Close menu on link click
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = navToggle.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    });
});

// Active link on scroll
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

// Card click handlers
bentoCards.forEach(card => {
    card.addEventListener('click', (e) => {
        // Don't open modal if clicking on a link inside the card
        if (e.target.closest('a')) {
            return; // Let the link work normally
        }
        const cardType = card.dataset.card;
        openModal(cardType);
    });
});

// Close modal handlers
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

// Hide close button on scroll
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
            // Staggered animation
            setTimeout(() => {
                entry.target.classList.add('revealed');
            }, index * 100);
            revealObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all cards
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
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ================================================
// HORIZONTAL SCROLL BUTTONS (Carousel Style)
// ================================================

const scrollButtons = document.querySelectorAll('.scroll-btn');

// Icon sizes + gap for precise scrolling (no half-visible icons)
const scrollConfig = {
    'diy': { iconSize: 60, gap: 8 },      // 60px icon + 8px gap = 68px per scroll
    'skills': { iconSize: 55, gap: 8 }    // 55px icon + 8px gap = 63px per scroll
};

scrollButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card modal from opening

        const target = btn.dataset.target;
        const scrollContainer = document.getElementById(`${target}-scroll`);
        const config = scrollConfig[target];

        if (scrollContainer && config) {
            // Scroll exactly one icon width + gap
            const scrollAmount = config.iconSize + config.gap;
            const isLeft = btn.classList.contains('scroll-left');

            // Add animation class to icons
            const icons = scrollContainer.querySelectorAll('.clickable-icon');
            icons.forEach(icon => icon.classList.add('scrolling'));

            // Perform the scroll
            if (isLeft) {
                scrollContainer.scrollLeft -= scrollAmount;
            } else {
                scrollContainer.scrollLeft += scrollAmount;
            }

            // Remove animation class after transition
            setTimeout(() => {
                icons.forEach(icon => icon.classList.remove('scrolling'));
            }, 300);
        }
    });
});

// ================================================
// GITHUB API - DYNAMIC STATS FETCHING
// ================================================

const GITHUB_USERNAME = 'fecetinn';

// Language colors from GitHub
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
        // Fetch user data
        const userResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
        const userData = await userResponse.json();

        // Update basic stats
        document.getElementById('github-repos').textContent = userData.public_repos || 0;
        document.getElementById('github-followers').textContent = userData.followers || 0;
        document.getElementById('github-following').textContent = userData.following || 0;

        // Fetch repos for stars and languages
        const reposResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`);
        const repos = await reposResponse.json();

        // Calculate total stars
        const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
        document.getElementById('github-stars').textContent = totalStars;

        // Calculate language distribution
        const languageCounts = {};
        let totalBytes = 0;

        repos.forEach(repo => {
            if (repo.language) {
                languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
                totalBytes++;
            }
        });

        // Sort and get top 5 languages
        const sortedLanguages = Object.entries(languageCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Render language bars
        const languagesContainer = document.getElementById('github-languages');
        if (languagesContainer && sortedLanguages.length > 0) {
            const maxCount = sortedLanguages[0][1];
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
        }

    } catch (error) {
        console.error('GitHub API Error:', error);
        // Show error state
        document.getElementById('github-repos').textContent = 'N/A';
        document.getElementById('github-stars').textContent = 'N/A';
        document.getElementById('github-followers').textContent = 'N/A';
        document.getElementById('github-following').textContent = 'N/A';
    }
}

// Fetch GitHub stats when modal opens
document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-card="github"]');
    if (card) {
        // Small delay to ensure modal content is rendered
        setTimeout(fetchGitHubStats, 100);
    }
});

// ================================================
// INITIALIZATION
// ================================================

console.log('🚀 Fatih Eren Çetin Portfolio - Loaded Successfully');
