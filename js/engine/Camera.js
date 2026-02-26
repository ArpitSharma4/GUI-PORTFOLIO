/**
 * Camera.js — Smooth-follow camera with world bounds clamping.
 * Follows the player along the X axis with lerp easing.
 */
export class Camera {
    constructor(canvasWidth, canvasHeight, worldWidth) {
        this.x = 0;
        this.y = 0;
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.worldWidth = worldWidth;

        // Smoothing factor (0 = no follow, 1 = instant snap)
        this.smoothing = 0.08;

        // Shake effect
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeTimer = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
    }

    /**
     * Resize camera viewport
     */
    resize(canvasWidth, canvasHeight) {
        this.width = canvasWidth;
        this.height = canvasHeight;
    }

    /**
     * Update camera to follow a target (usually the player)
     * @param {object} target — must have .x property
     * @param {number} dt — delta time in seconds
     */
    update(target, dt) {
        // Desired camera X centers the target on screen
        const desiredX = target.x - this.width / 2;

        // Lerp toward desired position
        this.x += (desiredX - this.x) * this.smoothing;

        // Clamp to world bounds
        this.x = Math.max(0, Math.min(this.x, this.worldWidth - this.width));

        // Camera Y stays fixed (side-scroller, no vertical camera movement)
        this.y = 0;

        // Update shake
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
            const progress = this.shakeTimer / this.shakeDuration;
            const intensity = this.shakeIntensity * progress;
            this.shakeOffsetX = (Math.random() - 0.5) * 2 * intensity;
            this.shakeOffsetY = (Math.random() - 0.5) * 2 * intensity;
        } else {
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
        }
    }

    /**
     * Apply camera transform to a canvas context
     */
    applyTransform(ctx) {
        ctx.save();
        ctx.translate(
            -Math.round(this.x) + this.shakeOffsetX,
            -Math.round(this.y) + this.shakeOffsetY
        );
    }

    /**
     * Restore canvas context after camera transform
     */
    resetTransform(ctx) {
        ctx.restore();
    }

    /**
     * Trigger a screen shake
     * @param {number} intensity — max pixel displacement
     * @param {number} duration — seconds
     */
    shake(intensity = 3, duration = 0.2) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.shakeTimer = duration;
    }

    /**
     * Convert screen coordinates to world coordinates
     */
    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    }

    /**
     * Check if a world-space rectangle is visible on screen
     */
    isVisible(worldX, worldY, width, height) {
        return (
            worldX + width > this.x &&
            worldX < this.x + this.width &&
            worldY + height > this.y &&
            worldY < this.y + this.height
        );
    }
}
