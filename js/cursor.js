// cursor.js - Futuristic Desktop Cursor

document.addEventListener('DOMContentLoaded', () => {
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    
    if (isTouchDevice) {
        document.body.style.cursor = 'auto';
        return; // Disable on touch
    }

    const ring = document.createElement('div');
    ring.id = 'Vidyut-cursor-ring';
    
    const dot = document.createElement('div');
    dot.id = 'Vidyut-cursor-dot';

    document.body.appendChild(ring);
    document.body.appendChild(dot);

    let isMoving = false;

    document.addEventListener('mousemove', (e) => {
        if (!isMoving) {
            window.requestAnimationFrame(() => {
                ring.style.left = `${e.clientX}px`;
                ring.style.top = `${e.clientY}px`;
                dot.style.left = `${e.clientX}px`;
                dot.style.top = `${e.clientY}px`;
                isMoving = false;
            });
            isMoving = true;
        }
    });

    // Hover states for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, .sp-card, .gal-item');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-hover');
            if(window.Vidyut_AUDIO) window.Vidyut_AUDIO.play('hover');
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-hover');
        });
    });
});
