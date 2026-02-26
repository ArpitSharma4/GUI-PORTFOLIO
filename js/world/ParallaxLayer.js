/**
 * ParallaxLayer.js — Renders parallax background layers.
 * Each layer scrolls at a different speed relative to the camera.
 */
export class ParallaxLayer {
    /**
     * @param {number} scrollFactor — 0.0 (no scroll) to 1.0 (full camera speed)
     * @param {string} drawType — 'mountains', 'hills', or 'trees'
     * @param {object} colors — { fill, nightFill, trunk, nightTrunk } color strings
     */
    constructor(scrollFactor, drawType, colors) {
        this.scrollFactor = scrollFactor;
        this.drawType = drawType;
        this.colors = colors;

        // Pre-generate the shape data
        this.shapes = [];
        this._generateShapes();
    }

    setColors(colors) {
        this.colors = colors;
    }

    _generateShapes() {
        const segments = 40;
        this.shapes = [];

        switch (this.drawType) {
            case 'mountains':
                for (let i = 0; i < segments; i++) {
                    this.shapes.push({
                        x: i / segments,
                        height: 0.15 + Math.random() * 0.2,
                        width: 0.08 + Math.random() * 0.06
                    });
                }
                break;
            case 'hills':
                for (let i = 0; i < segments; i++) {
                    this.shapes.push({
                        x: i / segments,
                        height: 0.08 + Math.random() * 0.12,
                        width: 0.06 + Math.random() * 0.08
                    });
                }
                break;
            case 'trees':
                for (let i = 0; i < 60; i++) {
                    this.shapes.push({
                        x: i / 60,
                        height: 0.06 + Math.random() * 0.1,
                        trunk: 0.004 + Math.random() * 0.003,
                        canopySize: 0.015 + Math.random() * 0.015
                    });
                }
                break;
        }
    }

    /**
     * Render the parallax layer
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     * @param {number} canvasWidth
     * @param {number} canvasHeight
     * @param {number} groundY — Y position of the ground
     * @param {number} nightT — 0 (day) to 1 (night) transition progress
     */
    render(ctx, camera, canvasWidth, canvasHeight, groundY, nightT) {
        const offsetX = camera.x * this.scrollFactor;

        ctx.save();
        ctx.translate(-offsetX, 0);

        const totalWidth = camera.worldWidth + canvasWidth;

        switch (this.drawType) {
            case 'mountains':
                this._renderMountains(ctx, totalWidth, canvasHeight, groundY, nightT);
                break;
            case 'hills':
                this._renderHills(ctx, totalWidth, canvasHeight, groundY, nightT);
                break;
            case 'trees':
                this._renderTrees(ctx, totalWidth, canvasHeight, groundY, nightT);
                break;
        }

        ctx.restore();
    }

    _renderMountains(ctx, totalWidth, h, groundY, nt) {
        const baseY = groundY - 20;
        const color = this._hexToRgb(this.colors.fill);
        const nightColor = this._hexToRgb(this.colors.nightFill);

        const r = this._lerp(color.r, nightColor.r, nt);
        const g = this._lerp(color.g, nightColor.g, nt);
        const b = this._lerp(color.b, nightColor.b, nt);

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.beginPath();
        ctx.moveTo(-100, baseY);

        for (const shape of this.shapes) {
            const sx = shape.x * totalWidth;
            const peakY = baseY - shape.height * h;
            const hw = shape.width * totalWidth * 0.5;

            ctx.lineTo(sx - hw, baseY);
            ctx.lineTo(sx, peakY);
            ctx.lineTo(sx + hw, baseY);
        }

        ctx.lineTo(totalWidth + 100, baseY);
        ctx.lineTo(totalWidth + 100, h);
        ctx.lineTo(-100, h);
        ctx.closePath();
        ctx.fill();
    }

    _renderHills(ctx, totalWidth, h, groundY, nt) {
        const baseY = groundY - 5;
        const color = this._hexToRgb(this.colors.fill);
        const nightColor = this._hexToRgb(this.colors.nightFill);

        const r = this._lerp(color.r, nightColor.r, nt);
        const g = this._lerp(color.g, nightColor.g, nt);
        const b = this._lerp(color.b, nightColor.b, nt);

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.beginPath();
        ctx.moveTo(-100, baseY);

        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];
            const sx = shape.x * totalWidth;
            const peakY = baseY - shape.height * h;
            const hw = shape.width * totalWidth;

            const cpX = sx;
            const cpY = peakY;
            ctx.quadraticCurveTo(cpX, cpY, sx + hw, baseY);
        }

        ctx.lineTo(totalWidth + 100, baseY);
        ctx.lineTo(totalWidth + 100, h);
        ctx.lineTo(-100, h);
        ctx.closePath();
        ctx.fill();
    }

    _renderTrees(ctx, totalWidth, h, groundY, nt) {
        const baseY = groundY;
        const color = this._hexToRgb(this.colors.fill);
        const nightColor = this._hexToRgb(this.colors.nightFill);
        const trunkColor = this._hexToRgb(this.colors.trunk);
        const nightTrunkColor = this._hexToRgb(this.colors.nightTrunk);

        const trunkR = this._lerp(trunkColor.r, nightTrunkColor.r, nt);
        const trunkG = this._lerp(trunkColor.g, nightTrunkColor.g, nt);
        const trunkB = this._lerp(trunkColor.b, nightTrunkColor.b, nt);

        const leafR = this._lerp(color.r, nightColor.r, nt);
        const leafG = this._lerp(color.g, nightColor.g, nt);
        const leafB = this._lerp(color.b, nightColor.b, nt);

        for (const shape of this.shapes) {
            const tx = shape.x * totalWidth;
            const trunkH = shape.height * h;
            const tw = shape.trunk * totalWidth;
            const canopy = shape.canopySize * totalWidth;

            ctx.fillStyle = `rgb(${trunkR}, ${trunkG}, ${trunkB})`;
            ctx.fillRect(tx - tw, baseY - trunkH, tw * 2, trunkH);

            ctx.fillStyle = `rgb(${leafR}, ${leafG}, ${leafB})`;
            ctx.beginPath();
            ctx.ellipse(tx, baseY - trunkH - canopy * 0.3, canopy, canopy * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    _lerp(a, b, t) {
        return Math.round(a + (b - a) * t);
    }

    _hexToRgb(hex) {
        if (!hex) return { r: 255, g: 255, b: 255 };
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }
}
