/**
 * AudioManager.js — Game audio system using Web Audio API.
 * All sounds are procedurally generated (no external files needed).
 * Includes: footsteps, jump, land, interact, ambient background.
 */
export class AudioManager {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.isMuted = false;
        this.isInitialized = false;
        this.isNight = false;

        // Ambient
        this.ambientNodes = [];
        this.ambientInterval = null;

        // Volume levels
        this.volumes = {
            master: 0.35,
            sfx: 0.5,
            ambient: 0.15,
            footstep: 0.12,
        };
    }

    /**
     * Initialize audio context on first user interaction (required by browsers)
     */
    init() {
        if (this.isInitialized) return;

        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = this.volumes.master;
            this.masterGain.connect(this.context.destination);
            this.isInitialized = true;

            // Start ambient
            this._startAmbient();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    /**
     * Quick init on any user interaction
     */
    ensureReady() {
        if (!this.isInitialized) this.init();
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    // ==========================================
    // SOUND EFFECTS
    // ==========================================

    /**
     * Footstep sound — soft tap
     */
    playFootstep(isSprinting = false) {
        if (!this.isInitialized || this.isMuted) return;

        const ctx = this.context;
        const now = ctx.currentTime;

        // Short noise burst filtered to sound like a soft step
        const duration = isSprinting ? 0.04 : 0.06;
        const freq = isSprinting ? 300 + Math.random() * 100 : 200 + Math.random() * 80;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.value = freq;

        filter.type = 'lowpass';
        filter.frequency.value = 800;
        filter.Q.value = 1;

        gain.gain.setValueAtTime(this.volumes.footstep * (isSprinting ? 1.3 : 1), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + duration);
    }

    /**
     * Jump sound — rising whoosh
     */
    playJump() {
        if (!this.isInitialized || this.isMuted) return;

        const ctx = this.context;
        const now = ctx.currentTime;

        // Rising tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

        gain.gain.setValueAtTime(this.volumes.sfx * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.2);

        // Whoosh noise
        this._playNoiseBurst(0.08, 2000, 0.08);
    }

    /**
     * Landing sound — soft thud
     */
    playLand() {
        if (!this.isInitialized || this.isMuted) return;

        const ctx = this.context;
        const now = ctx.currentTime;

        // Low thud
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);

        gain.gain.setValueAtTime(this.volumes.sfx * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.15);

        // Dust noise
        this._playNoiseBurst(0.06, 600, 0.06);
    }

    /**
     * Interact / dialogue open sound — pleasant chime
     */
    playInteract() {
        if (!this.isInitialized || this.isMuted) return;

        const ctx = this.context;
        const now = ctx.currentTime;

        // Two-note chime (musical!)
        const notes = [523, 659]; // C5, E5
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            const t = now + i * 0.1;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(this.volumes.sfx * 0.35, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t);
            osc.stop(t + 0.35);
        });
    }

    /**
     * Modal open — deeper chime with slight reverb feel
     */
    playModalOpen() {
        if (!this.isInitialized || this.isMuted) return;

        const ctx = this.context;
        const now = ctx.currentTime;

        const notes = [392, 523, 659]; // G4, C5, E5 (major chord)
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            const t = now + i * 0.08;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(this.volumes.sfx * 0.25, t + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t);
            osc.stop(t + 0.6);
        });
    }

    /**
     * Close / back sound — descending note
     */
    playClose() {
        if (!this.isInitialized || this.isMuted) return;

        const ctx = this.context;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(250, now + 0.12);

        gain.gain.setValueAtTime(this.volumes.sfx * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    /**
     * Theme toggle sound — magical shimmer
     */
    playThemeSwitch() {
        if (!this.isInitialized || this.isMuted) return;

        const ctx = this.context;
        const now = ctx.currentTime;

        // Ascending arpeggio
        const notes = [330, 440, 554, 660, 880]; // E4, A4, C#5, E5, A5
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            const t = now + i * 0.06;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(this.volumes.sfx * 0.15, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t);
            osc.stop(t + 0.5);
        });
    }

    // ==========================================
    // AMBIENT BACKGROUND
    // ==========================================

    _startAmbient() {
        // Periodically play ambient sounds
        this._playAmbientLoop();
    }

    _playAmbientLoop() {
        if (this.ambientInterval) clearInterval(this.ambientInterval);

        this.ambientInterval = setInterval(() => {
            if (this.isMuted || !this.isInitialized) return;

            if (this.isNight) {
                this._playCricket();
            } else {
                if (Math.random() > 0.5) {
                    this._playBirdChirp();
                }
            }
        }, 2000 + Math.random() * 3000);
    }

    _playBirdChirp() {
        const ctx = this.context;
        if (!ctx) return;
        const now = ctx.currentTime;

        // Bird chirp: quick frequency up-down
        const tweetCount = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < tweetCount; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            const baseFreq = 2000 + Math.random() * 1500;
            const t = now + i * 0.12;

            osc.frequency.setValueAtTime(baseFreq, t);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, t + 0.04);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, t + 0.08);

            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(this.volumes.ambient * 0.5, t + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t);
            osc.stop(t + 0.1);
        }
    }

    _playCricket() {
        const ctx = this.context;
        if (!ctx) return;
        const now = ctx.currentTime;

        // Cricket: rapid clicking
        const chirps = 3 + Math.floor(Math.random() * 4);
        for (let i = 0; i < chirps; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'square';
            osc.frequency.value = 4000 + Math.random() * 1000;

            const t = now + i * 0.06;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(this.volumes.ambient * 0.08, t + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t);
            osc.stop(t + 0.03);
        }
    }

    /**
     * Noise burst utility — used for whoosh, dust, etc.
     */
    _playNoiseBurst(duration, filterFreq, volume) {
        const ctx = this.context;
        if (!ctx) return;
        const now = ctx.currentTime;

        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = filterFreq;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        source.start(now);
    }

    // ==========================================
    // CONTROLS
    // ==========================================

    setNightMode(isNight) {
        this.isNight = isNight;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.isMuted ? 0 : this.volumes.master;
        }
        return this.isMuted;
    }

    setVolume(level) {
        this.volumes.master = level;
        if (this.masterGain && !this.isMuted) {
            this.masterGain.gain.value = level;
        }
    }
}
