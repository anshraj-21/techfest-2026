// audio.js - Advanced Cinematic Audio Manager

class VidyutAudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        
        this.isMuted = localStorage.getItem('vidyut_audio_enabled') !== 'true';
        
        this.activeAmbient = null;
        this.ambientOscillators = [];
        this.synths = {};
        
        this.initUI();
    }

    initUI() {
        // Build the SOUND: ON/OFF toggle in the navbar if it doesn't exist
        let toggle = document.getElementById('global-audio-toggle');
        if (!toggle) {
            toggle = document.createElement('button');
            toggle.id = 'global-audio-toggle';
            toggle.style.cssText = `
                position: fixed; bottom: 30px; right: 30px; z-index: 100000;
                background: rgba(8, 11, 15, 0.9); border: 1px solid var(--steel);
                color: var(--silver); padding: 10px 15px; font-family: var(--hud-font);
                font-size: 0.7rem; letter-spacing: 3px; cursor: none;
                transition: all 0.3s;
            `;
            document.body.appendChild(toggle);
        }
        
        this.updateUI();
        
        toggle.addEventListener('click', () => {
            this.toggleMute();
        });

        // Add hover sounds to interactables
        document.querySelectorAll('a, button, .archive-item, .m-item, .event-card').forEach(el => {
            el.addEventListener('mouseenter', () => this.playSFX('hover'));
            el.addEventListener('click', () => this.playSFX('impact-soft'));
        });
    }

    updateUI() {
        const toggle = document.getElementById('global-audio-toggle');
        if (toggle) {
            toggle.innerText = this.isMuted ? 'SOUND: OFF' : 'SOUND: ON';
            if (!this.isMuted) {
                toggle.style.borderColor = 'var(--arc-gold)';
                toggle.style.color = 'var(--arc-gold)';
            } else {
                toggle.style.borderColor = 'var(--steel)';
                toggle.style.color = 'var(--silver)';
            }
        }
    }

    initContext() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        
        this.masterGain = this.ctx.createGain();
        this.musicGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();
        
        this.musicGain.connect(this.masterGain);
        this.sfxGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
        
        this.masterGain.gain.value = this.isMuted ? 0 : 0.6;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('vidyut_audio_enabled', (!this.isMuted).toString());
        this.updateUI();

        if (!this.isMuted && !this.ctx) {
            this.initContext();
            this.setScene('ambient-command'); // Default scene
        } else if (this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.6, this.ctx.currentTime, 0.5);
            if (!this.isMuted && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        }
        
        if (!this.isMuted) this.playSFX('system-beep');
    }

    setScene(sceneName) {
        if (this.isMuted || !this.ctx) return;
        if (this.activeAmbient === sceneName) return;
        
        this.activeAmbient = sceneName;
        const t = this.ctx.currentTime;
        
        // Fade out existing ambient
        this.ambientOscillators.forEach(osc => {
            if(osc.gainNode) {
                osc.gainNode.gain.setTargetAtTime(0, t, 2.0); // 2 second fade out
                setTimeout(() => osc.stop(), 3000);
            }
        });
        this.ambientOscillators = [];

        // Generate new procedural ambient based on scene
        let freq1, freq2;
        if (sceneName === 'ambient-command') { freq1 = 55; freq2 = 55.5; } // Low A drone
        else if (sceneName === 'ambient-tech') { freq1 = 110; freq2 = 112; } // Higher, digital
        else if (sceneName === 'ambient-threat') { freq1 = 41; freq2 = 42; } // Extremely low E
        else { freq1 = 65; freq2 = 66; }

        this._createDrone(freq1, freq2, t);
    }

    _createDrone(f1, f2, t) {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.value = f1;
        osc2.frequency.value = f2;
        
        gainNode.gain.setValueAtTime(0, t);
        gainNode.gain.setTargetAtTime(0.3, t + 1, 3.0); // Slow 3 second fade in
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(this.musicGain);
        
        osc1.start(t);
        osc2.start(t);
        
        osc1.gainNode = gainNode;
        this.ambientOscillators.push(osc1, osc2);
    }

    playSFX(type) {
        if (this.isMuted || !this.ctx) return;
        const t = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);

        switch (type) {
            case 'hover':
            case 'metal-click':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(600, t);
                osc.frequency.exponentialRampToValueAtTime(1200, t + 0.03);
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.1, t + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
                osc.start(t);
                osc.stop(t + 0.05);
                break;

            case 'impact-soft':
                osc.type = 'square';
                osc.frequency.setValueAtTime(100, t);
                osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.3, t + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
                osc.start(t);
                osc.stop(t + 0.2);
                break;

            case 'impact-heavy':
            case 'mission-open':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(80, t);
                osc.frequency.exponentialRampToValueAtTime(20, t + 0.5);
                
                // Distortion curve for heavy impact
                const dist = this.ctx.createWaveShaper();
                const curve = new Float32Array(400);
                for(let i=0; i<400; i++) curve[i] = Math.sin(i * Math.PI / 100);
                dist.curve = curve;
                
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.6, t + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
                
                osc.disconnect();
                osc.connect(dist);
                dist.connect(gain);
                
                osc.start(t);
                osc.stop(t + 1);
                break;
                
            case 'system-beep':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, t);
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                osc.start(t);
                osc.stop(t + 0.15);
                break;
                
            case 'transition': // whoosh
                this._createNoiseWhoosh(t);
                break;
        }
    }
    
    _createNoiseWhoosh(t) {
        const bufferSize = this.ctx.sampleRate * 1.0;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(100, t);
        filter.frequency.exponentialRampToValueAtTime(2000, t + 0.5);
        filter.frequency.exponentialRampToValueAtTime(100, t + 1.0);
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.5);
        gain.gain.linearRampToValueAtTime(0, t + 1.0);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        noise.start(t);
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    window.VYOM_AUDIO = new VidyutAudioManager();
    
    // Automatically try to start audio if previously enabled
    if (!window.VYOM_AUDIO.isMuted) {
        const interactionEvents = ['click', 'keydown', 'mousemove', 'touchstart'];
        const startAudio = () => {
            window.VYOM_AUDIO.initContext();
            window.VYOM_AUDIO.setScene('ambient-command');
            interactionEvents.forEach(e => document.removeEventListener(e, startAudio));
        };
        interactionEvents.forEach(e => document.addEventListener(e, startAudio, { once: true }));
    }
});
