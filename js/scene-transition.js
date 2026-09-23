// scene-transition.js - Cinematic Page Transitions

document.addEventListener('DOMContentLoaded', () => {
    // Inject the transition overlay if it doesn't exist
    let overlay = document.getElementById('scene-transition-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'scene-transition-overlay';
        overlay.style.cssText = `
            position: fixed; inset: 0; background: #020305; z-index: 9999999;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            opacity: 1; pointer-events: none; transition: opacity 0.8s ease-in-out;
        `;
        
        const scanline = document.createElement('div');
        scanline.style.cssText = `
            position: absolute; top: 0; left: 0; right: 0; height: 2px;
            background: var(--arc-gold); box-shadow: 0 0 15px var(--arc-gold-bright);
            animation: scanDown 2s infinite linear; opacity: 0.5;
        `;
        
        const text = document.createElement('div');
        text.id = 'st-text';
        text.style.cssText = `
            font-family: var(--hud-font); font-size: 0.8rem; color: var(--threat-red);
            letter-spacing: 8px; opacity: 0.8;
        `;
        text.innerText = "ESTABLISHING CONNECTION...";
        
        overlay.appendChild(scanline);
        overlay.appendChild(text);
        document.body.appendChild(overlay);
        
        // Add animation styles dynamically
        if(!document.getElementById('st-styles')) {
            const style = document.createElement('style');
            style.id = 'st-styles';
            style.innerHTML = `@keyframes scanDown { from { transform: translateY(0); } to { transform: translateY(100vh); } }`;
            document.head.appendChild(style);
        }

        // Fade in the page on load
        requestAnimationFrame(() => {
            setTimeout(() => {
                overlay.style.opacity = '0';
            }, 100); // slight delay to ensure render
        });
    }

    // Intercept navigation links
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = link.getAttribute('href');
            // Ignore anchors or external links for now if they exist, but these are all internal
            if (target && !target.startsWith('#') && !target.startsWith('http')) {
                e.preventDefault();
                
                // Play whoosh transition
                if (window.VYOM_AUDIO) {
                    window.VYOM_AUDIO.play('transition');
                }
                
                // Set text based on target
                const txt = document.getElementById('st-text');
                if (target.includes('events')) txt.innerText = "ENTERING ARENA NETWORK";
                else if (target.includes('gallery')) txt.innerText = "ARCHIVE ACCESS GRANTED";
                else if (target.includes('sponsors')) txt.innerText = "ALLIANCE NETWORK INITIALIZING";
                else if (target.includes('brochure')) txt.innerText = "DECRYPTING DOSSIER";
                else txt.innerText = "SYSTEM // TRANSITION";

                overlay.style.opacity = '1';
                
                setTimeout(() => {
                    window.location.href = target;
                }, 800); // 800ms transition time
            }
        });
    });
});
