/**
 * SpriteSheet.js — Sprite atlas loader and animator.
 * Placeholder for future sprite-based character art.
 */
export class SpriteSheet {
    constructor(imageSrc, frameWidth, frameHeight, frameCount) {
        this.image = new Image();
        this.image.src = imageSrc;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.frameCount = frameCount;
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.fps = 8;
        this.loaded = false;

        this.image.onload = () => {
            this.loaded = true;
        };
    }

    update(dt) {
        this.frameTimer += dt;
        if (this.frameTimer >= 1 / this.fps) {
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
            this.frameTimer = 0;
        }
    }

    draw(ctx, x, y, flipX = false) {
        if (!this.loaded) return;

        ctx.save();
        ctx.translate(x, y);
        if (flipX) ctx.scale(-1, 1);

        ctx.drawImage(
            this.image,
            this.currentFrame * this.frameWidth, 0,
            this.frameWidth, this.frameHeight,
            -this.frameWidth / 2, -this.frameHeight,
            this.frameWidth, this.frameHeight
        );

        ctx.restore();
    }
}
