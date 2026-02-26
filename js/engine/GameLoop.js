/**
 * GameLoop.js — Core game loop with delta-time
 * Runs update() and render() at ~60fps via requestAnimationFrame.
 */
export class GameLoop {
    constructor() {
        this.isRunning = false;
        this.lastTimestamp = 0;
        this.updateCallbacks = [];
        this.renderCallbacks = [];
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTimer = 0;
        this._boundTick = this._tick.bind(this);
    }

    /**
     * Register an update callback: fn(deltaTime)
     */
    onUpdate(fn) {
        this.updateCallbacks.push(fn);
    }

    /**
     * Register a render callback: fn(ctx, deltaTime)
     */
    onRender(fn) {
        this.renderCallbacks.push(fn);
    }

    /**
     * Start the game loop
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTimestamp = performance.now();
        requestAnimationFrame(this._boundTick);
    }

    /**
     * Stop the game loop
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * Internal tick — called every frame
     */
    _tick(timestamp) {
        if (!this.isRunning) return;

        // Calculate delta time in seconds, cap at 100ms to prevent spiral of death
        const rawDelta = (timestamp - this.lastTimestamp) / 1000;
        const dt = Math.min(rawDelta, 0.1);
        this.lastTimestamp = timestamp;

        // FPS counter
        this.frameCount++;
        this.fpsTimer += dt;
        if (this.fpsTimer >= 1.0) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTimer -= 1.0;
        }

        // Update all systems
        for (const fn of this.updateCallbacks) {
            fn(dt);
        }

        // Render all systems
        for (const fn of this.renderCallbacks) {
            fn(dt);
        }

        requestAnimationFrame(this._boundTick);
    }
}
