// ===== PARTICLE SYSTEM =====
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.particleCount = 120;
        this.connectionDistance = 150;
        this.mouseRadius = 200;

        this.resize();
        this.init();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                radius: Math.random() * 2 + 0.5,
                color: Math.random() > 0.5 ? '#6c3ce0' : '#00d4ff',
                alpha: Math.random() * 0.5 + 0.3
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((p, i) => {
            // Mouse interaction
            const dx = this.mouse.x - p.x;
            const dy = this.mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.mouseRadius) {
                const force = (this.mouseRadius - dist) / this.mouseRadius;
                const angle = Math.atan2(dy, dx);
                p.vx -= Math.cos(angle) * force * 0.5;
                p.vy -= Math.sin(angle) * force * 0.5;
            }

            // Update position
            p.x += p.vx;
            p.y += p.vy;

            // Damping
            p.vx *= 0.99;
            p.vy *= 0.99;

            // Boundaries
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            // Keep in bounds
            p.x = Math.max(0, Math.min(this.canvas.width, p.x));
            p.y = Math.max(0, Math.min(this.canvas.height, p.y));

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fill();

            // Draw connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const cdx = p.x - p2.x;
                const cdy = p.y - p2.y;
                const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

                if (cdist < this.connectionDistance) {
                    const opacity = (1 - cdist / this.connectionDistance) * 0.3;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = '#6c3ce0';
                    this.ctx.globalAlpha = opacity;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }

            this.ctx.globalAlpha = 1;
        });

        requestAnimationFrame(() => this.animate());
    }
}

// ===== STAT COUNTER ANIMATION =====
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2000;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            stat.textContent = Math.floor(target * eased);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                stat.textContent = target;
            }
        }

        requestAnimationFrame(update);
    });
}

// ===== SKILL BARS ANIMATION =====
function animateSkillBars() {
    const fills = document.querySelectorAll('.skill-fill');
    fills.forEach(fill => {
        const level = fill.getAttribute('data-level');
        fill.style.width = level + '%';
    });
}

// ===== PROGRESS BARS ANIMATION =====
function animateProgressBars() {
    const bars = document.querySelectorAll('.progress-bar');
    bars.forEach(bar => {
        const progress = bar.getAttribute('data-progress');
        bar.style.width = progress + '%';
    });
}

// ===== PROJECT CARD EXPAND =====
function initProjectCards() {
    const cards = document.querySelectorAll('.project-card:not(.locked)');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const isExpanded = card.classList.contains('expanded');
            // Close all cards
            document.querySelectorAll('.project-card.expanded').forEach(c => {
                c.classList.remove('expanded');
            });
            // Toggle clicked card
            if (!isExpanded) {
                card.classList.add('expanded');
            }
        });
    });
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ===== INTERSECTION OBSERVER =====
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Trigger specific animations
                if (entry.target.classList.contains('about')) {
                    animateSkillBars();
                }
                if (entry.target.classList.contains('projects')) {
                    animateProgressBars();
                }
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// ===== CONTACT FORM =====
function initContactForm() {
    const form = document.getElementById('contactForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('.form-submit');
        const originalText = btn.querySelector('.submit-text').textContent;
        btn.querySelector('.submit-text').textContent = 'TRANSMISJA WYSŁANA ✓';
        btn.style.background = 'linear-gradient(135deg, #00ff88, #00d4ff)';

        setTimeout(() => {
            btn.querySelector('.submit-text').textContent = originalText;
            btn.style.background = '';
            form.reset();
        }, 3000);
    });
}

// ===== NAV SCROLL EFFECT =====
function initNavScroll() {
    const nav = document.querySelector('.nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(10, 10, 18, 0.95)';
        } else {
            nav.style.background = 'rgba(10, 10, 18, 0.85)';
        }
    });
}

// ===== GLITCH TEXT EFFECT =====
function initGlitchEffect() {
    const title = document.querySelector('.hero-title');
    setInterval(() => {
        if (Math.random() > 0.95) {
            title.style.textShadow = `
                2px 0 #ff00ff,
                -2px 0 #00d4ff
            `;
            setTimeout(() => {
                title.style.textShadow = 'none';
            }, 100);
        }
    }, 200);
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
    animateStats();
    initProjectCards();
    initSmoothScroll();
    initScrollAnimations();
    initContactForm();
    initNavScroll();
    initGlitchEffect();
});
