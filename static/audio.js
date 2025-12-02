// ===== AUDIO SYSTEM =====
// Simple Web Audio API based audio system with synthesized sounds

class AudioManager {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        this.initialized = false;
        this.muted = false;
        
        // Volume settings
        this.masterVolume = 0.7;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.5;
        
        // Load saved volumes
        this.loadVolumes();
    }
    
    async init() {
        if (this.initialized) return;
        
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain nodes
            this.masterGain = this.context.createGain();
            this.sfxGain = this.context.createGain();
            this.musicGain = this.context.createGain();
            
            // Connect gain nodes
            this.sfxGain.connect(this.masterGain);
            this.musicGain.connect(this.masterGain);
            this.masterGain.connect(this.context.destination);
            
            // Apply volumes
            this.masterGain.gain.value = this.masterVolume;
            this.sfxGain.gain.value = this.sfxVolume;
            this.musicGain.gain.value = this.musicVolume;
            
            this.initialized = true;
            console.log('Audio system initialized');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }
    
    playSound(type) {
        if (!this.initialized || this.muted) return;
        
        try {
            const now = this.context.currentTime;
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            switch(type) {
                case 'jump':
                    osc.frequency.setValueAtTime(200, now);
                    osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
                    break;
                    
                case 'land':
                    osc.frequency.setValueAtTime(150, now);
                    osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                    osc.start(now);
                    osc.stop(now + 0.05);
                    break;
                    
                case 'collect':
                    osc.frequency.setValueAtTime(800, now);
                    osc.frequency.setValueAtTime(1200, now + 0.05);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                    osc.start(now);
                    osc.stop(now + 0.15);
                    break;
                    
                case 'damage':
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(100, now);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                    osc.start(now);
                    osc.stop(now + 0.2);
                    break;
                    
                case 'timeWarp':
                    osc.frequency.setValueAtTime(400, now);
                    osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    osc.start(now);
                    osc.stop(now + 0.3);
                    break;
            }
        } catch (error) {
            console.warn('Sound playback failed:', error);
        }
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
        this.saveVolumes();
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.sfxVolume;
        }
        this.saveVolumes();
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicVolume;
        }
        this.saveVolumes();
    }
    
    mute() {
        this.muted = true;
        if (this.masterGain) {
            this.masterGain.gain.value = 0;
        }
    }
    
    unmute() {
        this.muted = false;
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }
    
    saveVolumes() {
        try {
            localStorage.setItem('audioVolumes', JSON.stringify({
                master: this.masterVolume,
                sfx: this.sfxVolume,
                music: this.musicVolume
            }));
        } catch (error) {
            console.warn('Failed to save volumes:', error);
        }
    }
    
    loadVolumes() {
        try {
            const saved = localStorage.getItem('audioVolumes');
            if (saved) {
                const volumes = JSON.parse(saved);
                this.masterVolume = volumes.master || 0.7;
                this.sfxVolume = volumes.sfx || 0.8;
                this.musicVolume = volumes.music || 0.5;
            }
        } catch (error) {
            console.warn('Failed to load volumes:', error);
        }
    }
    
    handleVisibilityChange() {
        if (!this.initialized) return;
        
        try {
            if (document.hidden) {
                // Tab is hidden - suspend audio context
                if (this.context.state === 'running') {
                    this.context.suspend();
                }
            } else {
                // Tab is visible - resume audio context
                if (this.context.state === 'suspended') {
                    this.context.resume();
                }
            }
        } catch (error) {
            console.warn('Failed to handle visibility change:', error);
        }
    }
}

// Create global audio manager
const audioManager = new AudioManager();

// Initialize on first user interaction
document.addEventListener('click', () => {
    audioManager.init();
}, { once: true });

document.addEventListener('keydown', () => {
    audioManager.init();
}, { once: true });

// Handle tab visibility changes
document.addEventListener('visibilitychange', () => {
    audioManager.handleVisibilityChange();
});
