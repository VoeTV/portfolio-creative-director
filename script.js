// ===== PARTICLE SYSTEM =====
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.particleCount = 100;
        this.connectionDistance = 140;
        this.mouseRadius = 180;

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
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                radius: Math.random() * 2 + 0.5,
                color: this.getRandomColor(),
                alpha: Math.random() * 0.5 + 0.2
            });
        }
    }

    getRandomColor() {
        const colors = ['#5865F2', '#6c3ce0', '#00d4ff', '#a855f7'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.init();
        });
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((p, i) => {
            // Mouse interaction - attract gently
            const dx = this.mouse.x - p.x;
            const dy = this.mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.mouseRadius && dist > 0) {
                const force = (this.mouseRadius - dist) / this.mouseRadius;
                const angle = Math.atan2(dy, dx);
                p.vx += Math.cos(angle) * force * 0.15;
                p.vy += Math.sin(angle) * force * 0.15;
            }

            // Update position
            p.x += p.vx;
            p.y += p.vy;

            // Damping
            p.vx *= 0.98;
            p.vy *= 0.98;

            // Boundaries - wrap around
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

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
                    const opacity = (1 - cdist / this.connectionDistance) * 0.2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = '#5865F2';
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

// ===== DISCORD LIVE DATA =====
const GUILD_ID = '546810742553444382';
const INVITE_CODE = 't5eb3v2W7';

async function fetchDiscordData() {
    try {
        // Fetch widget data (online members, voice channels)
        const widgetRes = await fetch(`https://discord.com/api/guilds/${GUILD_ID}/widget.json`);
        const widgetData = await widgetRes.json();

        // Fetch invite data (member count, online count)
        const inviteRes = await fetch(`https://discord.com/api/v10/invites/${INVITE_CODE}?with_counts=true`);
        const inviteData = await inviteRes.json();

        const memberCount = inviteData.profile?.member_count || inviteData.approximate_member_count || 0;
        const onlineCount = widgetData.presence_count || inviteData.profile?.online_count || 0;
        const channels = widgetData.channels || [];
        const voiceMembers = widgetData.members || [];

        // Update hero stats
        updateStats(memberCount, channels.length, onlineCount);

        // Update voice channels section
        updateVoiceChannels(channels, voiceMembers);

        // Update widget text
        const widgetText = document.querySelector('.widget-text');
        if (widgetText) {
            widgetText.textContent = `+${onlineCount} online teraz`;
        }

        // Update member count in roles
        const memberRoleCount = document.getElementById('role-member-count');
        if (memberRoleCount) {
            memberRoleCount.textContent = memberCount;
        }

    } catch (error) {
        console.warn('Nie udało się pobrać danych z Discord:', error);
    }
}

function updateStats(members, channels, online) {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const label = stat.nextElementSibling?.textContent?.trim();
        if (label === 'CZŁONKÓW') {
            stat.setAttribute('data-target', members);
        } else if (label === 'KANAŁÓW') {
            stat.setAttribute('data-target', channels);
        } else if (label === 'ONLINE') {
            stat.setAttribute('data-target', online);
        }
    });
}

function updateVoiceChannels(channels, members) {
    const voiceContainer = document.getElementById('voice-channels-list');
    if (!voiceContainer) return;

    // Count members per channel
    const channelMemberCount = {};
    members.forEach(member => {
        if (member.channel_id) {
            channelMemberCount[member.channel_id] = (channelMemberCount[member.channel_id] || 0) + 1;
        }
    });

    // Sort channels by position
    const sortedChannels = [...channels].sort((a, b) => a.position - b.position);

    // Build HTML
    voiceContainer.innerHTML = sortedChannels.map(channel => {
        const count = channelMemberCount[channel.id] || 0;
        const usersHtml = count > 0
            ? `<span class="channel-users">${count} ${count === 1 ? 'osoba' : count < 5 ? 'osoby' : 'osób'}</span>`
            : '';
        return `
            <div class="channel-item voice">
                <span class="channel-hash">🔊</span>
                <span class="channel-name">${channel.name}</span>
                ${usersHtml}
            </div>
        `;
    }).join('');
}

// ===== STAT COUNTER ANIMATION =====
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2500;
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

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animate children with stagger
                const children = entry.target.querySelectorAll('.info-card, .channel-category, .role-card, .event-card');
                children.forEach((child, index) => {
                    child.style.opacity = '0';
                    child.style.transform = 'translateY(20px)';
                    child.style.transition = `all 0.5s ease-out ${index * 0.1}s`;
                    setTimeout(() => {
                        child.style.opacity = '1';
                        child.style.transform = 'translateY(0)';
                    }, 50);
                });
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// ===== NAV SCROLL EFFECT =====
function initNavScroll() {
    const nav = document.querySelector('.nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(10, 10, 18, 0.98)';
            nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        } else {
            nav.style.background = 'rgba(10, 10, 18, 0.9)';
            nav.style.boxShadow = 'none';
        }
    });
}

// ===== CHANNEL HOVER EFFECTS =====
function initChannelEffects() {
    const channels = document.querySelectorAll('.channel-item');
    channels.forEach(channel => {
        channel.addEventListener('mouseenter', () => {
            channel.style.background = 'rgba(88, 101, 242, 0.1)';
        });
        channel.addEventListener('mouseleave', () => {
            channel.style.background = 'transparent';
        });
    });
}

// ===== TYPING EFFECT FOR TERMINAL =====
function initTypingEffect() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const outputs = entry.target.querySelectorAll('.terminal-output');
                outputs.forEach((output, index) => {
                    output.style.opacity = '0';
                    setTimeout(() => {
                        output.style.opacity = '1';
                        output.style.transition = 'opacity 0.3s';
                    }, 300 + index * 200);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.terminal-body').forEach(terminal => {
        observer.observe(terminal);
    });
}

// ===== DISCORD WIDGET ANIMATION =====
function initWidgetAnimation() {
    const avatars = document.querySelectorAll('.user-avatar');
    avatars.forEach((avatar, index) => {
        avatar.style.animation = `float ${3 + index * 0.5}s ease-in-out infinite`;
        avatar.style.animationDelay = `${index * 0.2}s`;
    });
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', async () => {
    new ParticleSystem();

    // Fetch live Discord data first, then animate stats
    await fetchDiscordData();
    animateStats();

    initSmoothScroll();
    initScrollAnimations();
    initNavScroll();
    initChannelEffects();
    initTypingEffect();
    initWidgetAnimation();
});
