/**
 * SkillIcon.js — Floating skill badge in the park area.
 * Bobs up and down with a soft glow, shows description on proximity.
 */
export class SkillIcon {
    constructor(data, groundY) {
        this.id = data.id;
        this.x = data.x;
        this.groundY = groundY;
        this.name = data.name;
        this.icon = data.icon;
        this.color = data.color;
        this.description = data.description;

        // Animation
        this.bobCycle = Math.random() * Math.PI * 2;
        this.glowCycle = Math.random() * Math.PI * 2;

        // Interaction
        this.showTooltip = false;
        this.tooltipAlpha = 0;

        // Night
        this.nightT = 0;
    }

    update(dt) {
        this.bobCycle += dt * 2;
        this.glowCycle += dt * 3;

        // Smooth tooltip transition
        const target = this.showTooltip ? 1 : 0;
        this.tooltipAlpha += (target - this.tooltipAlpha) * 0.1;
    }

    setNightMode(nightT) {
        this.nightT = nightT;
    }

    render(ctx) {
        const floatY = this.groundY - 60 + Math.sin(this.bobCycle) * 6;
        const glowPulse = 0.5 + 0.5 * Math.sin(this.glowCycle);

        ctx.save();

        // --- Glow ---
        const glowR = 25 + glowPulse * 8;
        const glow = ctx.createRadialGradient(this.x, floatY, 5, this.x, floatY, glowR);
        glow.addColorStop(0, this.color + '40');
        glow.addColorStop(1, this.color + '00');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, floatY, glowR, 0, Math.PI * 2);
        ctx.fill();

        // --- Badge circle ---
        ctx.fillStyle = this.nightT > 0.5 ? '#1E1A2E' : '#FFF8E7';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(this.x, floatY, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // --- Icon emoji ---
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, this.x, floatY);

        // --- Name label ---
        ctx.font = `600 10px 'Pixelify Sans', cursive`;
        ctx.fillStyle = this.nightT > 0.5 ? '#E8E0D5' : '#3E2723';
        ctx.fillText(this.name, this.x, floatY + 28);

        // --- Tooltip description ---
        if (this.tooltipAlpha > 0.01) {
            ctx.globalAlpha = this.tooltipAlpha;
            const tooltipY = floatY + 42;

            // Background
            const textWidth = ctx.measureText(this.description).width;
            const tooltipW = Math.min(textWidth + 20, 200);

            ctx.fillStyle = this.nightT > 0.5 ? 'rgba(30, 26, 46, 0.92)' : 'rgba(255, 248, 231, 0.95)';
            ctx.strokeStyle = this.color + '60';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(this.x - tooltipW / 2, tooltipY, tooltipW, 40, 6);
            ctx.fill();
            ctx.stroke();

            // Text
            ctx.font = `400 9px 'Quicksand', sans-serif`;
            ctx.fillStyle = this.nightT > 0.5 ? '#B0A8A0' : '#5D4037';
            ctx.textAlign = 'center';

            // Word wrap
            const words = this.description.split(' ');
            let line = '';
            let lineY = tooltipY + 13;
            for (const word of words) {
                const test = line + word + ' ';
                if (ctx.measureText(test).width > tooltipW - 14) {
                    ctx.fillText(line.trim(), this.x, lineY);
                    line = word + ' ';
                    lineY += 12;
                } else {
                    line = test;
                }
            }
            ctx.fillText(line.trim(), this.x, lineY);

            ctx.globalAlpha = 1;
        }

        ctx.restore();
    }
}
