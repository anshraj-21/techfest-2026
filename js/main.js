// main.js - Core UI Logic

document.addEventListener('DOMContentLoaded', () => {
    // Navbar Scroll Blur
    const navbar = document.getElementById('hud-navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Mobile Menu
    const hamburger = document.getElementById('btn-hamburger');
    const cmdMenu = document.getElementById('cmd-menu');
    if (hamburger && cmdMenu) {
        hamburger.addEventListener('click', () => {
            const isOpen = cmdMenu.classList.contains('open');
            if (isOpen) {
                cmdMenu.classList.remove('open');
                document.body.style.overflow = '';
            } else {
                cmdMenu.classList.add('open');
                document.body.style.overflow = 'hidden';
                if(window.Vidyut_AUDIO) window.Vidyut_AUDIO.play('menu');
            }
        });
    }

    // System Boot Sequence (if present)
    const sysBoot = document.getElementById('sys-boot');
    if (sysBoot) {
        const bar = document.getElementById('boot-bar');
        const title = document.getElementById('boot-title');
        
        setTimeout(() => {
            if (bar) bar.style.width = '100%';
        }, 100);

        setTimeout(() => {
            if (title) title.classList.add('show');
            if(window.Vidyut_AUDIO) window.Vidyut_AUDIO.play('success');
        }, 800);

        setTimeout(() => {
            sysBoot.classList.add('hidden');
            if(window.Vidyut_AUDIO) window.Vidyut_AUDIO.play('transition');
            setTimeout(() => sysBoot.remove(), 500); // Cleanup
        }, 2000);
    }
});

// Cinematic Reveal Intersections
const revealOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, revealOptions);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
});
