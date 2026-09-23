// eventsApp.js - Event Database Logic & Terminal Modal
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQbm3JM-zS7JIrrynJanazeWr59TuT6T6cm9jpcEQR2VvhdUgli_wOdUxRSf__k08D/exec';

let currentFilter = 'all';
let currentSearch = '';

function initEvents() {
    renderEvents();
    
    // Filters
    document.querySelectorAll('.db-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.db-filter').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.cat;
            if(window.VYOM_AUDIO) window.VYOM_AUDIO.play('hover');
            renderEvents();
        });
    });

    // Search
    const searchInput = document.getElementById('search-input');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value.toLowerCase();
            renderEvents();
        });
    }
}

function renderEvents() {
    const grid = document.getElementById('mission-grid');
    if (!grid) return;
    
    const filtered = EVENTS.filter(ev => {
        const matchCat = currentFilter === 'all' || ev.cat === currentFilter;
        const matchSearch = ev.name.toLowerCase().includes(currentSearch) || ev.desc.toLowerCase().includes(currentSearch);
        return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="no-missions">[ NO MISSIONS MATCH QUERY ]</div>';
        return;
    }

    grid.innerHTML = filtered.map((ev, idx) => {
        const fallBackImg = ev.img || 'https://images.unsplash.com/photo-1614729939124-03290b5609ce?auto=format&fit=crop&q=80&w=600';
        return `
        <div class="mission-card" style="animation-delay: ${idx * 0.05}s">
            <div class="hud-corner tl"></div><div class="hud-corner tr"></div>
            <div class="hud-corner bl"></div><div class="hud-corner br"></div>
            <div class="m-img-wrap">
                <img src="${fallBackImg}" alt="${ev.name}" loading="lazy" class="m-img">
                <div class="m-cat-tag">${ev.catLabel}</div>
                <div class="m-id-tag">ID: VY-${ev.id.substring(0,6).toUpperCase()}</div>
                <div class="m-scan-line"></div>
            </div>
            <div class="m-info">
                <h3 class="m-name">${ev.name}</h3>
                <div class="m-desc">${ev.tagline || ev.desc.substring(0, 80)+'...'}</div>
                
                <div class="m-meta-grid">
                    <div class="m-meta"><span>MODE</span>${ev.team.substring(0,15)}</div>
                    <div class="m-meta"><span>DATE</span>${ev.date.substring(0,12)}</div>
                </div>
                
                <div class="m-actions">
                    <button class="btn-secondary" onclick="openDetails('${ev.id}')">[ DETAILS ]</button>
                    <button class="btn-primary" onclick="openRegister('${ev.id}')">[ REGISTER ]</button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function getEventById(id) {
    return EVENTS.find(e => e.id === id);
}

// Modal Logic
function openDetails(id) {
    const ev = getEventById(id);
    if (!ev) return;
    if(window.VYOM_AUDIO) window.VYOM_AUDIO.play('menu');
    alert(`MISSION DOSSIER: ${ev.name}\n\n${ev.desc}\n\nVenue: ${ev.venue}`);
    // Ideally this would be a full page view or another modal. For brevity, using an alert/prompt style or I could build a custom details view.
    // The prompt requested a registration terminal specifically, we can use the same terminal for details.
}

function openRegister(id) {
    const ev = getEventById(id);
    if (!ev) return;
    
    if(window.VYOM_AUDIO) window.VYOM_AUDIO.play('menu');

    document.getElementById('term-event-id').textContent = `VY-${ev.id.substring(0,6).toUpperCase()}`;
    document.getElementById('term-event-name').textContent = ev.name;
    document.getElementById('term-event-cat').textContent = ev.catLabel;
    
    // Generate Fields
    const fContainer = document.getElementById('term-fields');
    if(ev.formFields && ev.formFields.length > 0) {
        fContainer.innerHTML = ev.formFields.map(f => {
            const isFull = f.full ? 'full' : '';
            if (f.type === 'select') {
                const opts = f.options.map(o => `<option value="${o}">${o}</option>`).join('');
                return `<div class="term-group ${isFull}">
                    <label>${f.label} ${f.required?'<span class="req">*</span>':''}</label>
                    <select name="${f.id}" ${f.required?'required':''}>
                        <option value="">-- SELECT --</option>
                        ${opts}
                    </select>
                </div>`;
            }
            return `<div class="term-group ${isFull}">
                <label>${f.label} ${f.required?'<span class="req">*</span>':''}</label>
                <input type="${f.type}" name="${f.id}" placeholder="${f.placeholder||''}" ${f.required?'required':''}>
            </div>`;
        }).join('');
    } else {
        fContainer.innerHTML = `<div class="term-group full"><div class="sys-msg" style="color:var(--energy-red)">[ REGISTRATION CURRENTLY OFFLINE FOR THIS MISSION ]</div></div>`;
        document.getElementById('term-submit-btn').style.display = 'none';
    }

    document.getElementById('reg-terminal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeTerminal() {
    document.getElementById('reg-terminal').classList.remove('open');
    document.body.style.overflow = '';
}

function submitForm(e) {
    e.preventDefault();
    if(window.VYOM_AUDIO) window.VYOM_AUDIO.play('hover');
    
    const btn = document.getElementById('term-submit-btn');
    const status = document.getElementById('term-status');
    btn.textContent = '[ TRANSMITTING... ]';
    btn.disabled = true;
    
    // Collect Data
    const formData = new FormData(e.target);
    const dataObj = {};
    formData.forEach((value, key) => { dataObj[key] = value; });
    
    // Send
    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            event_name: document.getElementById('term-event-name').textContent,
            ...dataObj
        })
    }).then(() => {
        if(window.VYOM_AUDIO) window.VYOM_AUDIO.play('success');
        e.target.style.display = 'none';
        document.getElementById('term-success').style.display = 'flex';
        status.innerHTML = '';
    }).catch(err => {
        btn.textContent = '[ INITIATE UPLOAD ]';
        btn.disabled = false;
        status.innerHTML = `<span style="color:var(--hot-red)">[ TRANSMISSION FAILED: ${err.message} ]</span>`;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initEvents();
    
    const form = document.getElementById('term-form');
    if(form) form.addEventListener('submit', submitForm);
    
    // Esc to close
    document.addEventListener('keydown', e => {
        if(e.key === 'Escape') closeTerminal();
    });
});
