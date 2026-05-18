/* =================================================================
   Skymap — Cosmic Immersive Landing Microinteractions
   Vanilla, no dependencies. Respects prefers-reduced-motion.
   ================================================================= */

(function () {
    'use strict';

    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse = matchMedia('(hover: none)').matches;
    const isDesktop = !isCoarse && matchMedia('(min-width: 901px)').matches;

    document.documentElement.classList.toggle('reduce-motion', reduceMotion);

    document.addEventListener('DOMContentLoaded', () => {
        initYear();
        initScrollProgress();
        initStickyHeader();
        initDrawer();
        initSmoothScroll();
        initMagnetic();
        initTilt();
        initReveal();
        initCounters();
        initConstellationReveal();
        initDistanceDiagram();
        initParallaxPhone();
        if (isDesktop) initCustomCursor();
        if (!reduceMotion) initStarfield();
        initFilmstripDrag();
    });

    function initYear() {
        const y = document.getElementById('year');
        if (y) y.textContent = new Date().getFullYear();
    }

    function initScrollProgress() {
        const bar = document.querySelector('.scroll-progress');
        if (!bar) return;
        const set = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const v = max > 0 ? Math.min(1, window.scrollY / max) : 0;
            bar.style.transform = `scaleX(${v})`;
        };
        addEventListener('scroll', set, { passive: true });
        addEventListener('resize', set);
        set();
    }

    function initStickyHeader() {
        const header = document.getElementById('siteHeader');
        const sentinel = document.querySelector('.header-sentinel');
        if (!header || !sentinel) return;
        const io = new IntersectionObserver(([entry]) => {
            header.classList.toggle('is-scrolled', !entry.isIntersecting);
        });
        io.observe(sentinel);
    }

    function initDrawer() {
        const toggle = document.querySelector('.nav-toggle');
        const drawer = document.getElementById('drawer');
        const scrim = document.querySelector('.drawer-scrim');
        if (!toggle || !drawer || !scrim) return;
        const setOpen = (open) => {
            toggle.setAttribute('aria-expanded', String(open));
            drawer.classList.toggle('is-open', open);
            scrim.classList.toggle('is-visible', open);
            document.body.style.overflow = open ? 'hidden' : '';
        };
        toggle.addEventListener('click', () => setOpen(!drawer.classList.contains('is-open')));
        scrim.addEventListener('click', () => setOpen(false));
        drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
        addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    }

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', (e) => {
                const href = a.getAttribute('href');
                if (!href || href === '#') return;
                const target = document.querySelector(href);
                if (!target) return;
                e.preventDefault();
                const headerH = document.getElementById('siteHeader')?.offsetHeight || 0;
                const y = target.getBoundingClientRect().top + window.scrollY - headerH - 12;
                window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
            });
        });
    }

    function initMagnetic() {
        if (!isDesktop || reduceMotion) return;
        const strength = 0.28;
        document.querySelectorAll('[data-magnetic]').forEach(el => {
            const label = el.querySelector('.btn-label');
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
                if (label) label.style.transform = `translate(${x * strength * 0.55}px, ${y * strength * 0.55}px)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
                if (label) label.style.transform = '';
            });
        });
    }

    function initTilt() {
        if (!isDesktop || reduceMotion) return;
        document.querySelectorAll('[data-tilt]').forEach(card => {
            const inner = card.querySelector('.tilt-inner');
            if (!inner) return;
            let raf = 0;
            let targetX = 0, targetY = 0, curX = 0, curY = 0;
            const max = 8;

            const onMove = (e) => {
                const r = card.getBoundingClientRect();
                const x = ((e.clientX - r.left) / r.width - 0.5);
                const y = ((e.clientY - r.top) / r.height - 0.5);
                targetX = x * max;
                targetY = y * -max;
                if (!raf) raf = requestAnimationFrame(tick);
            };
            const onLeave = () => {
                targetX = 0; targetY = 0;
                if (!raf) raf = requestAnimationFrame(tick);
            };
            const tick = () => {
                curX += (targetX - curX) * 0.12;
                curY += (targetY - curY) * 0.12;
                inner.style.transform = `rotateY(${curX}deg) rotateX(${curY}deg)`;
                if (Math.abs(targetX - curX) > 0.05 || Math.abs(targetY - curY) > 0.05) {
                    raf = requestAnimationFrame(tick);
                } else {
                    raf = 0;
                    if (targetX === 0 && targetY === 0) inner.style.transform = '';
                }
            };
            card.addEventListener('mousemove', onMove);
            card.addEventListener('mouseleave', onLeave);
        });
    }

    function initReveal() {
        const items = document.querySelectorAll('.reveal');
        if (!items.length) return;
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const siblings = el.parentNode ? [...el.parentNode.children].filter(n => n.classList.contains('reveal')) : [];
                const i = siblings.indexOf(el);
                el.style.transitionDelay = `${Math.max(0, Math.min(i, 5)) * 80}ms`;
                el.classList.add('is-visible');
                io.unobserve(el);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
        items.forEach(i => io.observe(i));
    }

    function initCounters() {
        const els = document.querySelectorAll('.counter');
        if (!els.length) return;

        const animate = (el) => {
            const target = parseFloat(el.dataset.target);
            const suffix = el.dataset.suffix || '';
            const duration = 1700;
            const start = performance.now();
            const easeOut = (t) => 1 - Math.pow(1 - t, 3);
            const isInt = Number.isInteger(target);
            const tick = (now) => {
                const t = Math.min(1, (now - start) / duration);
                const v = easeOut(t) * target;
                el.textContent = (isInt ? Math.floor(v) : v.toFixed(2)) + suffix;
                if (t < 1) requestAnimationFrame(tick);
                else el.textContent = (isInt ? Math.floor(target) : target.toFixed(2)) + suffix;
            };
            requestAnimationFrame(tick);
        };

        if (reduceMotion) {
            els.forEach(el => {
                const t = parseFloat(el.dataset.target);
                el.textContent = (Number.isInteger(t) ? Math.floor(t) : t.toFixed(2)) + (el.dataset.suffix || '');
            });
            return;
        }
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
            });
        }, { threshold: 0.5 });
        els.forEach(el => io.observe(el));
    }

    // -----------------------------------------------------------
    // Constellation connect-the-dots reveal
    // -----------------------------------------------------------
    function initConstellationReveal() {
        const svg = document.querySelector('.constellation-svg');
        if (!svg) return;
        const lines = svg.querySelectorAll('.constellation-line');
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    lines.forEach(l => l.classList.add('is-visible'));
                    io.unobserve(svg);
                }
            });
        }, { threshold: 0.3 });
        io.observe(svg);
    }

    // -----------------------------------------------------------
    // Distance diagram fills
    // -----------------------------------------------------------
    function initDistanceDiagram() {
        const diagram = document.querySelector('.distance-diagram');
        if (!diagram) return;
        const io = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                diagram.classList.add('is-visible');
                io.unobserve(diagram);
            }
        }, { threshold: 0.4 });
        io.observe(diagram);
    }

    // -----------------------------------------------------------
    // Subtle parallax on the phone in the hero
    // -----------------------------------------------------------
    function initParallaxPhone() {
        if (reduceMotion) return;
        const phones = document.querySelectorAll('[data-parallax-y]');
        if (!phones.length) return;

        let scrollY = window.scrollY;
        let ticking = false;
        const tick = () => {
            phones.forEach(el => {
                const strength = parseFloat(el.dataset.parallaxY) || 0.15;
                el.style.transform = `translate3d(0, ${scrollY * strength * -0.4}px, 0)`;
            });
            ticking = false;
        };
        addEventListener('scroll', () => {
            scrollY = window.scrollY;
            if (!ticking) {
                requestAnimationFrame(tick);
                ticking = true;
            }
        }, { passive: true });
        tick();
    }

    // -----------------------------------------------------------
    // Custom cursor (desktop only)
    // -----------------------------------------------------------
    function initCustomCursor() {
        if (reduceMotion) return;
        const dot = document.querySelector('.cursor-dot');
        const ring = document.querySelector('.cursor-ring');
        if (!dot || !ring) return;
        let mx = -100, my = -100;
        let rx = -100, ry = -100;

        addEventListener('mousemove', (e) => {
            mx = e.clientX; my = e.clientY;
            dot.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
        });

        const tick = () => {
            rx += (mx - rx) * 0.16;
            ry += (my - ry) * 0.16;
            ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);

        document.querySelectorAll('a, button, [data-magnetic], [data-tilt], details summary').forEach(el => {
            el.addEventListener('mouseenter', () => { dot.classList.add('is-hover'); ring.classList.add('is-hover'); });
            el.addEventListener('mouseleave', () => { dot.classList.remove('is-hover'); ring.classList.remove('is-hover'); });
        });
    }

    // -----------------------------------------------------------
    // Starfield canvas — twinkling random stars
    // -----------------------------------------------------------
    function initStarfield() {
        const canvas = document.querySelector('.starfield');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = Math.min(devicePixelRatio || 1, 2);

        let stars = [];
        let w = innerWidth, h = innerHeight;

        const resize = () => {
            w = innerWidth;
            h = innerHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            populate();
        };

        const populate = () => {
            const count = Math.min(180, Math.floor((w * h) / 8500));
            stars = [];
            for (let i = 0; i < count; i++) {
                stars.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    r: Math.random() * 1.1 + 0.2,
                    a: Math.random() * 0.6 + 0.3,
                    s: Math.random() * 0.02 + 0.005,
                    phase: Math.random() * Math.PI * 2,
                    color: pickColor(),
                });
            }
        };

        const pickColor = () => {
            const palette = ['#ffffff', '#cdd6f4', '#dbe5ff', '#ffe4b8'];
            // very rare warm/violet outliers
            if (Math.random() < 0.04) return Math.random() < 0.5 ? '#ffb86b' : '#c485ff';
            return palette[(Math.random() * palette.length) | 0];
        };

        resize();
        addEventListener('resize', resize);

        let parallaxY = 0;
        addEventListener('scroll', () => {
            parallaxY = window.scrollY * 0.04;
        }, { passive: true });

        let t = 0;
        const tick = () => {
            t += 1;
            ctx.clearRect(0, 0, w, h);
            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                s.phase += s.s;
                const tw = Math.sin(s.phase) * 0.35 + 0.65;
                ctx.globalAlpha = s.a * tw;
                ctx.fillStyle = s.color;
                ctx.beginPath();
                ctx.arc(s.x, s.y - (parallaxY * (s.r * 0.6 + 0.4)), s.r, 0, Math.PI * 2);
                ctx.fill();

                // occasional glow
                if (s.r > 1) {
                    ctx.globalAlpha = (s.a * tw) * 0.4;
                    ctx.beginPath();
                    ctx.arc(s.x, s.y - (parallaxY * (s.r * 0.6 + 0.4)), s.r * 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.globalAlpha = 1;
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    function initFilmstripDrag() {
        const strip = document.querySelector('.filmstrip');
        if (!strip) return;
        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;

        strip.addEventListener('mousedown', (e) => {
            isDown = true;
            strip.style.cursor = 'grabbing';
            startX = e.pageX - strip.offsetLeft;
            scrollLeft = strip.scrollLeft;
        });
        strip.addEventListener('mouseleave', () => { isDown = false; strip.style.cursor = ''; });
        strip.addEventListener('mouseup', () => { isDown = false; strip.style.cursor = ''; });
        strip.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - strip.offsetLeft;
            const walk = (x - startX) * 1.5;
            strip.scrollLeft = scrollLeft - walk;
        });
    }

})();
