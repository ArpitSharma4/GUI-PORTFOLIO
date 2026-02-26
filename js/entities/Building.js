/**
 * Building.js — Interactive building / house entity.
 * Renders procedurally drawn houses with roofs, doors, windows.
 * Highlights when player is nearby.
 */
export class Building {
    constructor(data, groundY) {
        this.id = data.id;
        this.type = data.type; // 'house' or 'office'
        this.x = data.x;
        this.groundY = groundY;
        this.width = data.width;
        this.height = data.height;
        this.color = data.color;
        this.roofColor = data.roofColor;
        this.label = data.label;
        this.project = data.project;

        // Interaction state
        this.isHighlighted = false;
        this.highlightAlpha = 0;

        // Night mode
        this.nightT = 0;

        // Window animation
        this.windowFlicker = Math.random() * Math.PI * 2;
    }

    update(dt, time) {
        // Smooth highlight transition
        const targetAlpha = this.isHighlighted ? 1 : 0;
        this.highlightAlpha += (targetAlpha - this.highlightAlpha) * 0.1;

        this.windowFlicker += dt * 2;
    }

    setNightMode(nightT) {
        this.nightT = nightT;
    }

    /**
     * Render the building
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        const bx = this.x;
        const by = this.groundY - this.height;
        const w = this.width;
        const h = this.height;

        ctx.save();

        // --- Highlight glow ---
        if (this.highlightAlpha > 0.01) {
            ctx.shadowColor = `rgba(212, 119, 93, ${this.highlightAlpha * 0.5})`;
            ctx.shadowBlur = 20;
        }

        if (this.type === 'office') {
            this._renderOffice(ctx, bx, by, w, h);
        } else {
            this._renderHouse(ctx, bx, by, w, h);
        }

        // --- Label ---
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.font = `600 11px 'Pixelify Sans', cursive`;
        ctx.textAlign = 'center';
        ctx.fillStyle = this.nightT > 0.5 ? '#E8E0D5' : '#3E2723';
        ctx.fillText(this.label, bx + w / 2, by - 8);

        ctx.restore();
    }

    _renderHouse(ctx, bx, by, w, h) {
        const roofHeight = h * 0.3;

        // --- Wall ---
        ctx.fillStyle = this._interpolateColor(this.color, this._darken(this.color, 0.4), this.nightT);
        ctx.beginPath();
        ctx.rect(bx, by + roofHeight, w, h - roofHeight);
        ctx.fill();
        ctx.strokeStyle = this._interpolateColor('#B8A080', '#5A4838', this.nightT);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // --- Roof ---
        ctx.fillStyle = this._interpolateColor(this.roofColor, this._darken(this.roofColor, 0.35), this.nightT);
        ctx.beginPath();
        ctx.moveTo(bx - 10, by + roofHeight);
        ctx.lineTo(bx + w / 2, by);
        ctx.lineTo(bx + w + 10, by + roofHeight);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = this._interpolateColor('#6D4C33', '#3A2818', this.nightT);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // --- Door ---
        const doorW = w * 0.18;
        const doorH = h * 0.32;
        const doorX = bx + w / 2 - doorW / 2;
        const doorY = by + h - doorH;
        ctx.fillStyle = this._interpolateColor('#6D4C33', '#3A2818', this.nightT);
        ctx.beginPath();
        ctx.roundRect(doorX, doorY, doorW, doorH, [4, 4, 0, 0]);
        ctx.fill();

        // Door knob
        ctx.fillStyle = '#FFD54F';
        ctx.beginPath();
        ctx.arc(doorX + doorW * 0.75, doorY + doorH * 0.55, 2, 0, Math.PI * 2);
        ctx.fill();

        // --- Windows ---
        this._renderWindow(ctx, bx + w * 0.15, by + roofHeight + h * 0.12, w * 0.2, h * 0.18);
        this._renderWindow(ctx, bx + w * 0.65, by + roofHeight + h * 0.12, w * 0.2, h * 0.18);
    }

    _renderOffice(ctx, bx, by, w, h) {
        // --- Glass building ---
        const glassColor = this._interpolateColor('rgba(176, 190, 197, 0.9)', 'rgba(55, 71, 79, 0.9)', this.nightT);
        ctx.fillStyle = glassColor;
        ctx.beginPath();
        ctx.roundRect(bx, by, w, h, [6, 6, 0, 0]);
        ctx.fill();

        // Frame lines
        ctx.strokeStyle = this._interpolateColor('#607D8B', '#263238', this.nightT);
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, w, h);

        // Horizontal floor lines
        const floors = 4;
        for (let i = 1; i < floors; i++) {
            const fy = by + (h / floors) * i;
            ctx.beginPath();
            ctx.moveTo(bx, fy);
            ctx.lineTo(bx + w, fy);
            ctx.stroke();
        }

        // Vertical dividers
        ctx.lineWidth = 1;
        for (let i = 1; i < 3; i++) {
            const vx = bx + (w / 3) * i;
            ctx.beginPath();
            ctx.moveTo(vx, by);
            ctx.lineTo(vx, by + h);
            ctx.stroke();
        }

        // Windows with glow at night
        for (let row = 0; row < floors; row++) {
            for (let col = 0; col < 3; col++) {
                const winX = bx + (w / 3) * col + 8;
                const winY = by + (h / floors) * row + 8;
                const winW = w / 3 - 16;
                const winH = h / floors - 16;
                this._renderWindow(ctx, winX, winY, winW, winH);
            }
        }

        // Entrance
        const doorW = w * 0.25;
        const doorH = h * 0.18;
        ctx.fillStyle = this._interpolateColor('#455A64', '#1A2A35', this.nightT);
        ctx.fillRect(bx + w / 2 - doorW / 2, by + h - doorH, doorW, doorH);
    }

    _renderWindow(ctx, wx, wy, ww, wh) {
        // Window glass
        const glassDay = '#87CEEB';
        const glassNight = '#2A3A4A';
        ctx.fillStyle = this._interpolateColor(glassDay, glassNight, this.nightT);
        ctx.fillRect(wx, wy, ww, wh);

        // Window glow at night
        if (this.nightT > 0.3) {
            const glowAlpha = (this.nightT - 0.3) / 0.7;
            const flicker = 0.85 + 0.15 * Math.sin(this.windowFlicker + wx);
            ctx.fillStyle = `rgba(255, 224, 130, ${glowAlpha * 0.6 * flicker})`;
            ctx.fillRect(wx, wy, ww, wh);

            // Window glow bloom
            const bloom = ctx.createRadialGradient(
                wx + ww / 2, wy + wh / 2, 2,
                wx + ww / 2, wy + wh / 2, ww
            );
            bloom.addColorStop(0, `rgba(255, 224, 130, ${glowAlpha * 0.15 * flicker})`);
            bloom.addColorStop(1, 'rgba(255, 224, 130, 0)');
            ctx.fillStyle = bloom;
            ctx.fillRect(wx - ww / 2, wy - wh / 2, ww * 2, wh * 2);
        }

        // Window frame
        ctx.strokeStyle = this._interpolateColor('#5D4037', '#2A1A10', this.nightT);
        ctx.lineWidth = 1;
        ctx.strokeRect(wx, wy, ww, wh);

        // Cross divider
        ctx.beginPath();
        ctx.moveTo(wx + ww / 2, wy);
        ctx.lineTo(wx + ww / 2, wy + wh);
        ctx.moveTo(wx, wy + wh / 2);
        ctx.lineTo(wx + ww, wy + wh / 2);
        ctx.stroke();
    }

    _interpolateColor(dayColor, nightColor, t) {
        // Simple text-based — for hex colors
        if (dayColor.startsWith('#') && nightColor.startsWith('#')) {
            const dr = parseInt(dayColor.slice(1, 3), 16);
            const dg = parseInt(dayColor.slice(3, 5), 16);
            const db = parseInt(dayColor.slice(5, 7), 16);
            const nr = parseInt(nightColor.slice(1, 3), 16);
            const ng = parseInt(nightColor.slice(3, 5), 16);
            const nb = parseInt(nightColor.slice(5, 7), 16);
            const r = Math.round(dr + (nr - dr) * t);
            const g = Math.round(dg + (ng - dg) * t);
            const b = Math.round(db + (nb - db) * t);
            return `rgb(${r}, ${g}, ${b})`;
        }
        return t > 0.5 ? nightColor : dayColor;
    }

    _darken(hex, amount) {
        const r = Math.max(0, Math.round(parseInt(hex.slice(1, 3), 16) * (1 - amount)));
        const g = Math.max(0, Math.round(parseInt(hex.slice(3, 5), 16) * (1 - amount)));
        const b = Math.max(0, Math.round(parseInt(hex.slice(5, 7), 16) * (1 - amount)));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}
