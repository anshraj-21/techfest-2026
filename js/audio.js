// audio.js - Sound System (Web Audio API)

class VyomAudioSystem {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = localStorage.getItem('vyom_sound') === 'true';
        this.createToggleButton();
    }

    createToggleButton() {
        const btn = document.createElement('button');
        btn.id = 'sound-toggle';
        btn.textContent = this.enabled ? '[ SOUND: ON ]' : '[ SOUND: OFF ]';
        if (this.enabled) btn.classList.add('active');
        
        btn.addEventListener('click', () => {
            this.enabled = !this.enabled;
            localStorage.setItem('vyom_sound', this.enabled);
            btn.textContent = this.enabled ? '[ SOUND: ON ]' : '[ SOUND: OFF ]';
            btn.classList.toggle('active', this.enabled);
            if (this.enabled && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        });
        
        document.body.appendChild(btn);
    }

    play(type) {
        if (!this.enabled || this.ctx.state === 'suspended') return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime;

        switch(type) {
            case 'hover':
                // Subtle high-pitch click
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.05, now + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;
            case 'menu':
                // Mechanical whoosh
                osc.type = 'square';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                break;
            case 'success':
                // Success pulse
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.setValueAtTime(880, now + 0.1);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
                gain.gain.setValueAtTime(0.15, now + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
                break;
            case 'transition':
                // Deep sweep
                osc.type = 'sine';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.exponentialRampToValueAtTime(20, now + 0.4);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
                break;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Need user interaction to unlock audio context in some browsers, but button click handles it
    window.VYOM_AUDIO = new VyomAudioSystem();
});
