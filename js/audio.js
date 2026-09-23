class VidyutAudioSystem {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isMuted = localStorage.getItem('vidyut_audio') !== 'true';
        this.droneOsc = null;
        
        // Add toggle button if it doesn't exist
        if (!document.getElementById('audio-toggle')) {
            const btn = document.createElement('button');
            btn.id = 'audio-toggle';
            btn.className = this.isMuted ? '' : 'playing';
            btn.innerHTML = this.isMuted ? '🔊 SOUND OFF' : '🔊 SOUND ON';
            btn.onclick = () => this.toggleSound();
            document.body.appendChild(btn);
        }

        // Only init if not muted, or wait for toggle
        if (!this.isMuted) {
            this.initContext();
        }
    }

    initContext() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = this.isMuted ? 0 : 0.4;
        
        this.startDrone();
    }

    startDrone() {
        if (!this.ctx || this.droneOsc) return;
        
        // Deep sub-bass drone
        this.droneOsc = this.ctx.createOscillator();
        this.droneOsc.type = 'sine';
        this.droneOsc.frequency.setValueAtTime(45, this.ctx.currentTime); // Low F
        
        // Add some subtle movement to the drone
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // Very slow
        
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 5;
        
        lfo.connect(lfoGain);
        lfoGain.connect(this.droneOsc.frequency);
        lfo.start();

        const droneGain = this.ctx.createGain();
        droneGain.gain.value = 0.3;
        
        this.droneOsc.connect(droneGain);
        droneGain.connect(this.masterGain);
        this.droneOsc.start();
    }

    toggleSound() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('vidyut_audio', (!this.isMuted).toString());
        
        const btn = document.getElementById('audio-toggle');
        if (btn) {
            btn.innerHTML = this.isMuted ? '🔊 SOUND OFF' : '🔊 SOUND ON';
            btn.className = this.isMuted ? '' : 'playing';
        }

        if (!this.ctx && !this.isMuted) {
            this.initContext();
        } else if (this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime, 0.5);
            if (!this.isMuted && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        }
        
        if (!this.isMuted) this.play('click');
    }

    play(type) {
        if (this.isMuted || !this.ctx) return;
        
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);

        if (type === 'hover') {
            // Metallic tick
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, t);
            osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.1, t + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
            osc.start(t);
            osc.stop(t + 0.1);
        } 
        else if (type === 'click' || type === 'menu') {
            // Heavy metallic impact
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, t);
            osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
            
            // Add noise impact
            const bufferSize = this.ctx.sampleRate * 0.3; // 300ms
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const noiseFilter = this.ctx.createBiquadFilter();
            noiseFilter.type = 'lowpass';
            noiseFilter.frequency.setValueAtTime(1000, t);
            noiseFilter.frequency.exponentialRampToValueAtTime(100, t + 0.2);
            
            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.3, t);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
            
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.masterGain);
            
            osc.start(t);
            osc.stop(t + 0.3);
            noise.start(t);
        }
        else if (type === 'transition') {
            // Low-frequency sweep
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, t);
            osc.frequency.exponentialRampToValueAtTime(40, t + 1);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.5, t + 0.1);
            gain.gain.linearRampToValueAtTime(0, t + 1);
            osc.start(t);
            osc.stop(t + 1);
        }
    }
}

// Bind interactions globally
document.addEventListener('DOMContentLoaded', () => {
    window.VYOM_AUDIO = new VidyutAudioSystem();
    
    // Play transition sound if unmuted
    if(window.VYOM_AUDIO && !window.VYOM_AUDIO.isMuted) {
        // Need user interaction first on many browsers, but if it's stored it might work
        setTimeout(() => window.VYOM_AUDIO.play('transition'), 500);
    }
    
    document.querySelectorAll('a, button, .sp-card, .br-item').forEach(el => {
        el.addEventListener('mouseenter', () => window.VYOM_AUDIO.play('hover'));
        el.addEventListener('click', () => window.VYOM_AUDIO.play('click'));
    });
});
