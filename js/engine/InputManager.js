/**
 * InputManager.js — Handles keyboard + mobile touch input.
 * Tracks held keys for smooth movement, sprint, jump, and single-press actions.
 */
export class InputManager {
    constructor() {
        /** Currently held keys */
        this.keys = {};

        /** Keys pressed this frame (for single-press actions like 'E') */
        this.justPressed = {};

        /** Whether touch/mobile controls are active */
        this.isMobile = false;

        /** Mobile directional state */
        this.mobileLeft = false;
        this.mobileRight = false;
        this.mobileInteract = false;
        this.mobileSprint = false;
        this.mobileJump = false;

        this._init();
    }

    _init() {
        // Detect mobile
        this.isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        // Keyboard events
        window.addEventListener('keydown', (e) => this._onKeyDown(e));
        window.addEventListener('keyup', (e) => this._onKeyUp(e));

        // CRITICAL: Reset all keys when window loses focus to prevent stuck keys
        window.addEventListener('blur', () => this._clearAllKeys());
        window.addEventListener('visibilitychange', () => {
            if (document.hidden) this._clearAllKeys();
        });
        window.addEventListener('contextmenu', () => this._clearAllKeys());

        // Setup mobile controls if present
        if (this.isMobile) {
            this._initMobileControls();
        }
    }

    /**
     * Clear all pressed key states — prevents stuck keys
     */
    _clearAllKeys() {
        this.keys = {};
        this.justPressed = {};
        this.mobileLeft = false;
        this.mobileRight = false;
        this.mobileInteract = false;
        this.mobileSprint = false;
        this.mobileJump = false;
    }

    _onKeyDown(e) {
        const key = e.key.toLowerCase();

        // Prevent default for game keys
        if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'a', 'd', 'w', 's', 'e', 't', ' ', 'shift'].includes(key)) {
            e.preventDefault();
        }

        if (!this.keys[key]) {
            this.justPressed[key] = true;
        }
        this.keys[key] = true;
    }

    _onKeyUp(e) {
        const key = e.key.toLowerCase();
        this.keys[key] = false;
    }

    _initMobileControls() {
        const mobileControls = document.getElementById('mobile-controls');
        const joyLeft = document.getElementById('joy-left');
        const joyRight = document.getElementById('joy-right');
        const interactBtn = document.getElementById('mobile-interact');
        const jumpBtn = document.getElementById('mobile-jump');
        const sprintBtn = document.getElementById('mobile-sprint');

        if (mobileControls) {
            mobileControls.classList.remove('hidden');
            mobileControls.classList.add('active');
        }

        // Hide desktop HUD on mobile
        const hud = document.getElementById('hud');
        if (hud) hud.classList.add('hidden');

        if (joyLeft) {
            joyLeft.addEventListener('touchstart', (e) => { e.preventDefault(); this.mobileLeft = true; }, { passive: false });
            joyLeft.addEventListener('touchend', (e) => { e.preventDefault(); this.mobileLeft = false; }, { passive: false });
            joyLeft.addEventListener('touchcancel', () => { this.mobileLeft = false; });
        }

        if (joyRight) {
            joyRight.addEventListener('touchstart', (e) => { e.preventDefault(); this.mobileRight = true; }, { passive: false });
            joyRight.addEventListener('touchend', (e) => { e.preventDefault(); this.mobileRight = false; }, { passive: false });
            joyRight.addEventListener('touchcancel', () => { this.mobileRight = false; });
        }

        if (interactBtn) {
            interactBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.mobileInteract = true;
            }, { passive: false });
            interactBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.mobileInteract = false;
            }, { passive: false });
        }

        if (jumpBtn) {
            jumpBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.mobileJump = true; }, { passive: false });
            jumpBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.mobileJump = false; }, { passive: false });
        }

        if (sprintBtn) {
            sprintBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.mobileSprint = true; }, { passive: false });
            sprintBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.mobileSprint = false; }, { passive: false });
        }
    }

    /**
     * Call at end of each frame to reset single-press states
     */
    endFrame() {
        this.justPressed = {};
        this.mobileInteract = false;
        this.mobileJump = false;
    }

    /** Check if moving left */
    isMovingLeft() {
        return this.keys['arrowleft'] || this.keys['a'] || this.mobileLeft;
    }

    /** Check if moving right */
    isMovingRight() {
        return this.keys['arrowright'] || this.keys['d'] || this.mobileRight;
    }

    /** Check if sprinting (hold Shift) */
    isSprinting() {
        return this.keys['shift'] || this.mobileSprint;
    }

    /** Check if jump was just pressed this frame */
    isJumpPressed() {
        return this.justPressed[' '] || this.justPressed['w'] || this.justPressed['arrowup'] || this.mobileJump;
    }

    /** Check if interact was just pressed this frame */
    isInteractPressed() {
        return this.justPressed['e'] || this.mobileInteract;
    }

    /** Check if theme toggle was just pressed */
    isThemeTogglePressed() {
        return this.justPressed['t'];
    }

    /** Check if close/escape was just pressed */
    isClosePressed() {
        return this.justPressed['escape'];
    }
}
