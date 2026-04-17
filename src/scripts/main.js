/**
 * Skymap - Constellation Finder
 * Main JavaScript file for website interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSmoothScroll();
    initScrollReveal();
    initNavScrollEffect();
    initScreenshotCarousel();
});

/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuLinks = document.querySelectorAll('.mobile-menu a');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when clicking a link
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
}

/**
 * Smooth Scroll for anchor links
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navHeight = document.querySelector('.nav').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Scroll Reveal Animation
 */
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.feature-card, .audience-card, .privacy-card, .contact-card, .section-header'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

/**
 * Navigation scroll effect
 */
function initNavScrollEffect() {
    const nav = document.querySelector('.nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add shadow when scrolled
        if (currentScroll > 50) {
            nav.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
        } else {
            nav.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });
}

/**
 * Screenshot Carousel - Drag to scroll
 */
function initScreenshotCarousel() {
    const carousel = document.querySelector('.screenshot-carousel');
    const track = document.querySelector('.screenshot-track');
    
    if (!carousel || !track) return;

    let isDown = false;
    let startX;
    let scrollLeft;
    let animationPaused = false;

    carousel.addEventListener('mouseenter', () => {
        track.style.animationPlayState = 'paused';
        animationPaused = true;
    });

    carousel.addEventListener('mouseleave', () => {
        if (!isDown) {
            track.style.animationPlayState = 'running';
            animationPaused = false;
        }
    });

    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.style.cursor = 'grabbing';
        startX = e.pageX - carousel.offsetLeft;
        
        // Get current transform value
        const transform = window.getComputedStyle(track).transform;
        const matrix = new DOMMatrix(transform);
        scrollLeft = matrix.m41;
    });

    carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
    });

    carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
    });

    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        track.style.transform = `translateX(${scrollLeft + walk}px)`;
    });

    // Touch events for mobile
    carousel.addEventListener('touchstart', (e) => {
        isDown = true;
        track.style.animationPlayState = 'paused';
        startX = e.touches[0].pageX - carousel.offsetLeft;
        
        const transform = window.getComputedStyle(track).transform;
        const matrix = new DOMMatrix(transform);
        scrollLeft = matrix.m41;
    });

    carousel.addEventListener('touchend', () => {
        isDown = false;
        track.style.animationPlayState = 'running';
    });

    carousel.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const x = e.touches[0].pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        track.style.transform = `translateX(${scrollLeft + walk}px)`;
    });
}

/**
 * Add parallax effect to stars
 */
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const stars = document.querySelector('.stars');
    const stars2 = document.querySelector('.stars2');
    const stars3 = document.querySelector('.stars3');
    
    if (stars) stars.style.transform = `translateY(${scrolled * 0.1}px)`;
    if (stars2) stars2.style.transform = `translateY(${scrolled * 0.2}px)`;
    if (stars3) stars3.style.transform = `translateY(${scrolled * 0.3}px)`;
});

/**
 * Console easter egg for astronomy lovers
 */
console.log(`
    ✨ Welcome to Skymap ✨
    
    Looking for stars in the code? 
    The real ones are in the night sky!
    
    Download Skymap and explore the universe.
    🌟 🪐 🌙 ⭐ 🌌
`);








