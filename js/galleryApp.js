// galleryApp.js - Visual Archive Logic
function renderGallery() {
    const grid = document.getElementById('archive-grid');
    if (!grid || typeof PHOTOS === 'undefined') return;

    grid.innerHTML = PHOTOS.map((photo, index) => {
        // Variable sizing for masonry effect
        let spanClass = '';
        if (index % 5 === 0) spanClass = 'large';
        else if (index % 3 === 0) spanClass = 'tall';
        
        const delay = (index % 10) * 0.1;

        return `
        <div class="archive-item ${spanClass}" style="animation-delay: ${delay}s" onclick="openLightbox(${index})">
            <img src="${photo.src}" alt="${photo.title || 'Vidyut Archive'}" loading="lazy">
            <div class="a-overlay">
                <div class="hud-corner tl"></div><div class="hud-corner tr"></div>
                <div class="hud-corner bl"></div><div class="hud-corner br"></div>
                <div class="a-meta">
                    <span class="a-id">ARCHIVE // ${String(index + 1).padStart(3, '0')}</span>
                    <span class="a-title">${photo.title || 'CLASSIFIED'}</span>
                </div>
                <div class="m-scan-line"></div>
            </div>
        </div>
        `;
    }).join('');
}

let currentPhotoIndex = 0;

function openLightbox(index) {
    currentPhotoIndex = index;
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lb-img');
    const meta = document.getElementById('lb-meta');
    
    if (!lb || !img || !PHOTOS[index]) return;
    
    if(window.VYOM_AUDIO) window.VYOM_AUDIO.playSFX('mission-open');
    
    const photo = PHOTOS[index];
    img.src = photo.src;
    meta.innerHTML = `[ IMAGE ${String(index + 1).padStart(2,'0')} / ${String(PHOTOS.length).padStart(2,'0')} ]<br><span style="color:var(--white)">${photo.title || 'RECORD'} // Vidyut</span>`;
    
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (lb) {
        lb.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function nextPhoto(e) {
    if(e) e.stopPropagation();
    if (currentPhotoIndex < PHOTOS.length - 1) {
        openLightbox(currentPhotoIndex + 1);
        if(window.VYOM_AUDIO) window.VYOM_AUDIO.playSFX('hover');
    }
}

function prevPhoto(e) {
    if(e) e.stopPropagation();
    if (currentPhotoIndex > 0) {
        openLightbox(currentPhotoIndex - 1);
        if(window.VYOM_AUDIO) window.VYOM_AUDIO.playSFX('hover');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderGallery();
    
    const lb = document.getElementById('lightbox');
    if(lb) {
        lb.addEventListener('click', (e) => {
            if(e.target === lb || e.target.classList.contains('lb-content')) {
                closeLightbox();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (!document.getElementById('lightbox').classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextPhoto();
        if (e.key === 'ArrowLeft') prevPhoto();
    });
});
