// particles.js - Cinematic Particle Field (Canvas)

(function() {
    const canvas = document.getElementById('hero-particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let width, height, particles = [];
    let isVisible = true;
    
    // Performance: reduce particles if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const maxParticles = prefersReducedMotion ? 15 : (window.innerWidth < 768 ? 40 : 80);

    function initParticles() {
        particles = [];
        for (let i = 0; i < maxParticles; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.4,
                speedY: (Math.random() - 0.5) * 0.4,
                opacity: Math.random() * 0.5 + 0.1,
                // mostly cinematic gold, occasionally red
                color: Math.random() > 0.85 ? '#C51D27' : '#C9A45A'
            });
        }
    }

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        // Handle High DPI displays
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        initParticles();
    }

    function drawParticles() {
        if (!isVisible) {
            requestAnimationFrame(drawParticles);
            return;
        }

        ctx.clearRect(0, 0, width, height);
        
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Wrap around
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.opacity;
            
            // Subtle glow
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            
            ctx.fill();
        });
        
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
        requestAnimationFrame(drawParticles);
    }

    window.addEventListener('resize', () => {
        // debounce resize
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(resizeCanvas, 200);
    });

    // Pause on tab hidden
    document.addEventListener('visibilitychange', () => {
        isVisible = document.visibilityState === 'visible';
    });

    resizeCanvas();
    if (!prefersReducedMotion) {
        drawParticles();
    }
})();
