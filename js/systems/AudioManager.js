/**
 * AudioManager.js — Comprehensive procedural audio system.
 * Uses Web Audio API to generate all sounds on-the-fly.
 */
export class AudioManager {
    constructor() {
        this.ctx = null;
        this.isInitialized = false;
        this.isMuted = false;
        this.isNight = false;
        this.currentSeason = 'summer';

        this.masterGain = null;
        this.ambientIndex = null;
        this.fireflyInterval = null;
    }

    ensureReady() {
        if (this.isInitialized) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.isInitialized = true;

        // Start ambiance
        this._playAmbientLoop();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime, 0.1);
        }
        return this.isMuted;
    }

    /**
     * Top-level play method for procedural sounds
     */
    play(soundType, options = {}) {
        if (!this.isInitialized || this.isMuted) return null;

        switch (soundType) {
            case 'footstep':
                return this._playFootstep(options.isSprinting);
            case 'jump':
                return this._playJump();
            case 'land':
                return this._playLand();
            case 'interact':
                return this._playInteract();
            case 'modal-open':
                return this._playModalOpen();
            case 'close':
                return this._playClose();
            case 'theme-switch':
                return this._playThemeSwitch();
            case 'ambient-birds':
                return this._playAmbientBirds();
            case 'ambient-crickets':
                return this._playAmbientCrickets();
            case 'firefly-sparkle':
                return this._playFireflySparkle();
            default:
                return null;
        }
    }

    stop(index) {
        // Simple procedural sounds usually stop themselves, 
        // but for loops we'd track gain or source. 
        // For this implementation, we focus on fire-and-forget.
        if (index === 'ambiance' && this.ambientSource) {
            this.ambientSource.stop();
        }
    }

    // --- Specific Sound Generators ---

    _playFootstep(isSprinting) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Higher pitch for faster small feet
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(isSprinting ? 120 : 80, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    _playJump() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    _playLand() {
        const noise = this._createNoiseBuffer();
        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        source.buffer = noise;
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        source.start();
        source.stop(this.ctx.currentTime + 0.2);
    }

    _playInteract() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    _playModalOpen() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
    }

    _playClose() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    _playThemeSwitch() {
        // Shimmering chord effect
        const freqs = [440, 554.37, 659.25, 880];
        freqs.forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.value = f;
            osc.type = 'sine';

            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.03, this.ctx.currentTime + 0.1 + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start();
            osc.stop(this.ctx.currentTime + 1.0);
        });
    }

    // --- Ambiance ---

    _playAmbientBirds() {
        // High pitched chirps at random intervals
        const birdInterval = setInterval(() => {
            if (this.isMuted || this.isNight) {
                clearInterval(birdInterval);
                return;
            }
            if (Math.random() > 0.6) this._playBirdChirp();
        }, 3000);
    }

    _playBirdChirp() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const base = 1500 + Math.random() * 1000;
        osc.frequency.setValueAtTime(base, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(base + 500, this.ctx.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(base, this.ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
    }

    _playAmbientCrickets() {
        const cricketInterval = setInterval(() => {
            if (this.isMuted || !this.isNight) {
                clearInterval(cricketInterval);
                return;
            }
            if (Math.random() > 0.5) this._playCricket();
        }, 2000);
    }

    _playCricket() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 4000 + Math.random() * 500;

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        for (let i = 0; i < 3; i++) {
            gain.gain.linearRampToValueAtTime(0.015, this.ctx.currentTime + i * 0.1);
            gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + i * 0.1 + 0.05);
        }

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
    }

    _startFireflySparkle() {
        if (this.fireflyInterval) clearInterval(this.fireflyInterval);
        this.fireflyInterval = setInterval(() => {
            if (this.isMuted || !this.isNight) {
                clearInterval(this.fireflyInterval);
                return;
            }
            if (Math.random() > 0.7) this._playFireflySparkle();
        }, 4000);
    }

    _playFireflySparkle() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 2000 + Math.random() * 2000;

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.03, this.ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    // --- State Management ---

    setNightMode(isNight) {
        if (this.isNight !== isNight) {
            this.isNight = isNight;
            this._playAmbientLoop();
        }
    }

    setSeason(season) {
        if (this.currentSeason !== season) {
            this.currentSeason = season;
            this._playAmbientLoop();
        }
    }

    _playAmbientLoop() {
        if (!this.isInitialized || this.isMuted) return;

        // Winter reduces animal sounds
        const activityModifier = this.currentSeason === 'winter' ? 0.3 : 1.0;

        if (!this.isNight) {
            this._playAmbientBirds();
        } else {
            this._playAmbientCrickets();
            this._startFireflySparkle();
        }
    }

    // --- Helpers ---

    _createNoiseBuffer() {
        const bufferSize = this.ctx.sampleRate * 0.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    _lerp(a, b, t) {
        return a + (b - a) * t;
    }
}
