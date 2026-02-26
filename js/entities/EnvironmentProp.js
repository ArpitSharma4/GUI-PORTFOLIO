import { WORLD_CONFIG } from '../world/worldData.js';

export class EnvironmentProp {
    /**
     * Draw a stylized tree with seasonal colors
     */
    static drawTree(ctx, x, groundY, size, nightT, time, season = 'summer') {
        const palette = WORLD_CONFIG.seasons[season] || WORLD_CONFIG.seasons.summer;
        const trunkH = 50 * size;
        const canopyR = 25 * size;
        const sway = Math.sin(time * 1.5 + x * 0.01) * 2 * size;

        // Trunk
        const trunkDay = [109, 76, 51];
        const trunkNight = [74, 51, 34];
        const tr = Math.round(trunkDay[0] + (trunkNight[0] - trunkDay[0]) * nightT);
        const tg = Math.round(trunkDay[1] + (trunkNight[1] - trunkDay[1]) * nightT);
        const tb = Math.round(trunkDay[2] + (trunkNight[2] - trunkDay[2]) * nightT);

        ctx.fillStyle = `rgb(${tr}, ${tg}, ${tb})`;
        ctx.fillRect(x - 4 * size, groundY - trunkH, 8 * size, trunkH);

        // Canopy
        const leafColor = this._hexToRgb(palette.leaves);
        const leafDarkColor = this._hexToRgb(palette.leavesDark);

        const lr = Math.round(leafColor.r * (1 - nightT * 0.4));
        const lg = Math.round(leafColor.g * (1 - nightT * 0.4));
        const lb = Math.round(leafColor.b * (1 - nightT * 0.4));

        ctx.fillStyle = `rgb(${lr}, ${lg}, ${lb})`;
        ctx.beginPath();
        ctx.ellipse(x + sway, groundY - trunkH - canopyR * 0.5, canopyR, canopyR * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Darker canopy layer
        const ldr = Math.round(leafDarkColor.r * (1 - nightT * 0.4));
        const ldg = Math.round(leafDarkColor.g * (1 - nightT * 0.4));
        const ldb = Math.round(leafDarkColor.b * (1 - nightT * 0.4));

        ctx.fillStyle = `rgb(${ldr}, ${ldg}, ${ldb})`;
        ctx.beginPath();
        ctx.ellipse(x + sway - 5 * size, groundY - trunkH - canopyR * 0.3, canopyR * 0.7, canopyR * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();

        // Winter snow cap
        if (season === 'winter') {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * (1 - nightT * 0.3)})`;
            ctx.beginPath();
            ctx.ellipse(x + sway, groundY - trunkH - canopyR * 0.8, canopyR * 0.8, canopyR * 0.4, 0, Math.PI, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Draw a white picket fence segment
     */
    static drawFence(ctx, x, groundY, width, nightT) {
        const fenceH = 28;
        const postW = 4;
        const postGap = 14;

        // Color
        const dayR = 245, dayG = 240, dayB = 232;
        const nightR = 122, nightG = 112, nightB = 104;
        const r = Math.round(dayR + (nightR - dayR) * nightT);
        const g = Math.round(dayG + (nightG - dayG) * nightT);
        const b = Math.round(dayB + (nightB - dayB) * nightT);

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.strokeStyle = `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 20)})`;
        ctx.lineWidth = 0.8;

        // Horizontal rails
        ctx.fillRect(x, groundY - fenceH * 0.7, width, 3);
        ctx.fillRect(x, groundY - fenceH * 0.35, width, 3);

        // Vertical pickets
        const picketCount = Math.floor(width / postGap);
        for (let i = 0; i <= picketCount; i++) {
            const px = x + i * postGap;
            ctx.fillRect(px, groundY - fenceH, postW, fenceH);
            // Pointed top
            ctx.beginPath();
            ctx.moveTo(px, groundY - fenceH);
            ctx.lineTo(px + postW / 2, groundY - fenceH - 4);
            ctx.lineTo(px + postW, groundY - fenceH);
            ctx.fill();
        }
    }

    /**
     * Draw a cluster of flowers with seasonal check
     */
    static drawFlowers(ctx, x, groundY, count, spread, nightT, time, season = 'summer') {
        const palette = WORLD_CONFIG.seasons[season] || WORLD_CONFIG.seasons.summer;
        const colors = palette.particles; // Use seasonal particle colors for flowers

        for (let i = 0; i < count; i++) {
            const fx = x + (i - count / 2) * spread * 0.6 + Math.sin(i * 137.5) * spread * 0.3;
            const sway = Math.sin(time * 2 + i * 1.5) * 1.5;
            const color = colors[i % colors.length];

            // Stem
            const stemH = 8 + (i % 3) * 4;
            ctx.strokeStyle = nightT > 0.5 ? '#3D5A3D' : '#66BB6A';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(fx, groundY);
            ctx.lineTo(fx + sway, groundY - stemH);
            ctx.stroke();

            // Flower head
            const dimAmount = nightT * 0.4;
            ctx.globalAlpha = 1 - dimAmount;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(fx + sway, groundY - stemH, 3 + (i % 2), 0, Math.PI * 2);
            ctx.fill();

            // Center
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(fx + sway, groundY - stemH, 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    static _hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }


    /**
     * Draw a street lamp
     */
    static drawLamp(ctx, x, groundY, nightT, time) {
        const lampH = 70;

        // Post
        ctx.fillStyle = nightT > 0.5 ? '#37474F' : '#546E7A';
        ctx.fillRect(x - 2.5, groundY - lampH, 5, lampH);

        // Lamp head
        ctx.fillStyle = nightT > 0.5 ? '#455A64' : '#607D8B';
        ctx.beginPath();
        ctx.roundRect(x - 10, groundY - lampH - 8, 20, 10, 3);
        ctx.fill();

        // Light cone (night only)
        if (nightT > 0.2) {
            const lightAlpha = (nightT - 0.2) / 0.8;
            const flicker = 0.9 + 0.1 * Math.sin(time * 5 + x);

            // Warm bulb
            ctx.fillStyle = `rgba(255, 224, 130, ${lightAlpha * 0.9 * flicker})`;
            ctx.beginPath();
            ctx.arc(x, groundY - lampH - 3, 4, 0, Math.PI * 2);
            ctx.fill();

            // Light cone on ground
            const coneGrad = ctx.createRadialGradient(x, groundY - 5, 5, x, groundY - 5, 60);
            coneGrad.addColorStop(0, `rgba(255, 224, 130, ${lightAlpha * 0.2 * flicker})`);
            coneGrad.addColorStop(1, 'rgba(255, 224, 130, 0)');
            ctx.fillStyle = coneGrad;
            ctx.beginPath();
            ctx.ellipse(x, groundY - 5, 60, 15, 0, 0, Math.PI * 2);
            ctx.fill();

            // Upward glow
            const upGlow = ctx.createRadialGradient(x, groundY - lampH, 3, x, groundY - lampH, 35);
            upGlow.addColorStop(0, `rgba(255, 224, 130, ${lightAlpha * 0.15 * flicker})`);
            upGlow.addColorStop(1, 'rgba(255, 224, 130, 0)');
            ctx.fillStyle = upGlow;
            ctx.beginPath();
            ctx.arc(x, groundY - lampH, 35, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Draw a wooden sign with wrapped and centered text
     */
    static drawSign(ctx, x, groundY, text, nightT) {
        const signW = 100; // Increased width for better text fit
        const signH = 55;  // Increased height
        const postH = 45;
        const padding = 12; // Internal breathing room

        // 1. Draw Post
        ctx.fillStyle = nightT > 0.5 ? '#4A3322' : '#6D4C33';
        ctx.fillRect(x - 3, groundY - postH, 6, postH);

        // 2. Draw Sign Board
        const boardX = x - signW / 2;
        const boardY = groundY - postH - signH;

        ctx.fillStyle = nightT > 0.5 ? '#5A4838' : '#8D6E63';
        ctx.beginPath();
        ctx.roundRect(boardX, boardY, signW, signH, 6);
        ctx.fill();

        ctx.strokeStyle = nightT > 0.5 ? '#3A2818' : '#5D4037';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 3. Draw Text (Wrapped and Centered)
        ctx.font = `700 10px 'Pixelify Sans', cursive`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle'; // For vertical centering
        ctx.fillStyle = nightT > 0.5 ? '#E8E0D5' : '#FFF8E7';

        const maxWidth = signW - padding * 2;
        const words = text.split(/\s+/);
        const lines = [];
        let currentLine = '';

        // Simple wrapping engine
        for (const word of words) {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);

        // Calculate total text height for vertical centering
        const lineHeight = 13;
        const totalTextHeight = lines.length * lineHeight;
        const startY = boardY + (signH / 2) - (totalTextHeight / 2) + (lineHeight / 2);

        lines.forEach((line, i) => {
            ctx.fillText(line, x, startY + i * lineHeight);
        });
    }

    /**
     * Draw a park bench
     */
    static drawBench(ctx, x, groundY, nightT) {
        const seatW = 36;
        const seatH = 4;
        const legH = 14;

        // Seat
        ctx.fillStyle = nightT > 0.5 ? '#5A4838' : '#8D6E63';
        ctx.fillRect(x - seatW / 2, groundY - legH - seatH, seatW, seatH);

        // Backrest
        ctx.fillRect(x - seatW / 2, groundY - legH - seatH - 10, seatW, 3);

        // Legs
        ctx.fillStyle = nightT > 0.5 ? '#37474F' : '#546E7A';
        ctx.fillRect(x - seatW / 2 + 3, groundY - legH, 3, legH);
        ctx.fillRect(x + seatW / 2 - 6, groundY - legH, 3, legH);
    }
}
