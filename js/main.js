// Main JavaScript file for landing page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for navbar height
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
            
            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });
    
    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.about-card, .feature-item');
    animateElements.forEach(el => {
        observer.observe(el);
    });
    
    // Floating coins animation
    animateFloatingCoins();
    
    // Create particle effect
    createParticleEffect();
});

function animateFloatingCoins() {
    const coins = document.querySelectorAll('.coin');
    
    coins.forEach((coin, index) => {
        // Add random movement variation
        const randomDelay = Math.random() * 2;
        const randomDuration = 3 + Math.random() * 2;
        
        coin.style.animationDelay = randomDelay + 's';
        coin.style.animationDuration = randomDuration + 's';
        
        // Add subtle rotation
        setInterval(() => {
            const randomRotation = Math.random() * 360;
            coin.style.transform = `translateY(${Math.sin(Date.now() * 0.001 + index) * 20}px) rotate(${randomRotation}deg)`;
        }, 100);
    });
}

function createParticleEffect() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    const particlesContainer = document.querySelector('.hero-particles');
    if (!particlesContainer) return;
    
    // Create floating particles
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Random size
        const size = Math.random() * 6 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random shape
        const shapes = ['50%', '0%', '20%'];
        particle.style.borderRadius = shapes[Math.floor(Math.random() * shapes.length)];
        
        // Random color with opacity
        const colors = [
            'rgba(255, 215, 0, 0.6)', 
            'rgba(50, 205, 50, 0.6)', 
            'rgba(147, 112, 219, 0.6)',
            'rgba(255, 165, 0, 0.6)',
            'rgba(255, 20, 147, 0.6)'
        ];
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Add glow effect
        particle.style.boxShadow = `0 0 ${size * 2}px ${particle.style.backgroundColor}`;
        
        // Random animation duration
        const duration = Math.random() * 15 + 8;
        particle.style.animationDuration = duration + 's';
        
        // Random animation delay
        const delay = Math.random() * 8;
        particle.style.animationDelay = delay + 's';
        
        // Add random transform
        particle.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        particlesContainer.appendChild(particle);
    }
    
    // Create interactive mouse particles
    createMouseParticles();
}

// Add styles for particles
const particleStyles = `
.particle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.6;
    animation: floatParticle infinite linear;
    pointer-events: none;
    filter: blur(0.5px);
}

@keyframes floatParticle {
    0% {
        transform: translateY(100vh) rotate(0deg) scale(0);
        opacity: 0;
        filter: blur(2px);
    }
    10% {
        opacity: 0.8;
        transform: translateY(90vh) rotate(36deg) scale(1);
        filter: blur(0px);
    }
    50% {
        opacity: 1;
        filter: blur(0px);
    }
    90% {
        opacity: 0.6;
        filter: blur(1px);
    }
    100% {
        transform: translateY(-100px) rotate(360deg) scale(0);
        opacity: 0;
        filter: blur(2px);
    }
}

.particle:nth-child(odd) {
    animation-direction: reverse;
}

.particle:nth-child(3n) {
    animation-duration: 12s !important;
    transform-origin: center;
}

.particle:nth-child(5n) {
    animation-duration: 18s !important;
    filter: blur(1px) brightness(1.2);
}

/* Interactive cursor trail */
.cursor-trail {
    position: fixed;
    width: 8px;
    height: 8px;
    background: radial-gradient(circle, rgba(255,215,0,0.8) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    mix-blend-mode: screen;
}

/* Enhanced hover glow for interactive elements */
.btn:hover, .game-card:hover, .category-card:hover {
    animation: hoverGlow 0.6s ease-in-out;
}

@keyframes hoverGlow {
    0% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.3); }
    50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.3); }
    100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.4); }
}

.navbar.scrolled {
    background: rgba(15, 15, 35, 0.98);
    box-shadow: var(--shadow-lg);
}

.about-card,
.feature-item {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}

.about-card.animate,
.feature-item.animate {
    opacity: 1;
    transform: translateY(0);
}

@media (max-width: 768px) {
    .nav-menu {
        position: fixed;
        top: 70px;
        left: -100%;
        width: 100%;
        height: calc(100vh - 70px);
        background: var(--bg-primary);
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        padding-top: var(--spacing-xl);
        transition: var(--transition-normal);
        z-index: 999;
    }
    
    .nav-menu.active {
        left: 0;
    }
    
    .hamburger.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }
    
    .hamburger.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
}
`;

// Inject particle styles
const styleSheet = document.createElement('style');
styleSheet.textContent = particleStyles;
document.head.appendChild(styleSheet);

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function createMouseParticles() {
    let mouseX = 0, mouseY = 0;
    let isMoving = false;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMoving = true;
        
        // Create trail particle occasionally
        if (Math.random() < 0.3) {
            createTrailParticle(mouseX, mouseY);
        }
        
        setTimeout(() => {
            isMoving = false;
        }, 100);
    });
    
    // Create periodic sparkles around mouse
    setInterval(() => {
        if (isMoving) {
            createSparkleParticle(mouseX, mouseY);
        }
    }, 200);
}

function createTrailParticle(x, y) {
    const particle = document.createElement('div');
    const colors = ['#FFD700', '#32CD32', '#9370DB', '#FF69B4'];
    
    particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 4px;
        height: 4px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        box-shadow: 0 0 8px currentColor;
    `;
    
    document.body.appendChild(particle);
    
    particle.animate([
        { opacity: 0.8, transform: 'scale(1)' },
        { opacity: 0, transform: 'scale(0)' }
    ], {
        duration: 800,
        easing: 'ease-out'
    }).addEventListener('finish', () => {
        particle.remove();
    });
}

function createSparkleParticle(x, y) {
    const particle = document.createElement('div');
    particle.innerHTML = '✨';
    
    const offsetX = (Math.random() - 0.5) * 60;
    const offsetY = (Math.random() - 0.5) * 60;
    
    particle.style.cssText = `
        position: fixed;
        left: ${x + offsetX}px;
        top: ${y + offsetY}px;
        font-size: 12px;
        pointer-events: none;
        z-index: 9999;
    `;
    
    document.body.appendChild(particle);
    
    particle.animate([
        { 
            opacity: 0, 
            transform: 'scale(0) rotate(0deg)',
            filter: 'blur(2px)'
        },
        { 
            opacity: 1, 
            transform: 'scale(1) rotate(180deg)',
            filter: 'blur(0px)'
        },
        { 
            opacity: 0, 
            transform: 'scale(0) rotate(360deg)',
            filter: 'blur(2px)'
        }
    ], {
        duration: 1500,
        easing: 'ease-in-out'
    }).addEventListener('finish', () => {
        particle.remove();
    });
}

function createClickEffect(e) {
    const colors = ['#FFD700', '#32CD32', '#9370DB', '#FF69B4'];
    
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        
        particle.style.cssText = `
            position: fixed;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            width: 6px;
            height: 6px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            box-shadow: 0 0 10px currentColor;
        `;
        
        const angle = (i / 12) * Math.PI * 2;
        const distance = 80 + Math.random() * 40;
        
        document.body.appendChild(particle);
        
        particle.animate([
            { 
                opacity: 1,
                transform: 'scale(1) translate(0, 0)'
            },
            { 
                opacity: 0,
                transform: `scale(0) translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`
            }
        ], {
            duration: 1000,
            easing: 'ease-out'
        }).addEventListener('finish', () => {
            particle.remove();
        });
    }
}

// Add click effects to buttons and interactive elements
document.addEventListener('click', createClickEffect);

// Enhanced hover effects for buttons
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn, .game-card, .category-card');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function(e) {
            createMiniSparkles(e.target);
        });
    });
});

function createMiniSparkles(element) {
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < 6; i++) {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = ['✨', '⭐', '💫'][Math.floor(Math.random() * 3)];
        
        sparkle.style.cssText = `
            position: fixed;
            left: ${rect.left + Math.random() * rect.width}px;
            top: ${rect.top + Math.random() * rect.height}px;
            font-size: 10px;
            pointer-events: none;
            z-index: 1000;
        `;
        
        document.body.appendChild(sparkle);
        
        sparkle.animate([
            { 
                opacity: 0,
                transform: 'scale(0) translateY(0)'
            },
            { 
                opacity: 1,
                transform: 'scale(1) translateY(-20px)'
            },
            { 
                opacity: 0,
                transform: 'scale(0) translateY(-40px)'
            }
        ], {
            duration: 1200,
            easing: 'ease-out'
        }).addEventListener('finish', () => {
            sparkle.remove();
        });
    }
}

// Optimized scroll handler
const handleScroll = debounce(() => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
}, 10);

window.addEventListener('scroll', handleScroll);
