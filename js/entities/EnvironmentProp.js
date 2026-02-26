/**
 * EnvironmentProp.js — Decorative world elements.
 * Trees, fences, flowers, lamps, signs, benches.
 * All drawn procedurally on canvas.
 */
export class EnvironmentProp {
    /**
     * Draw a stylized tree
     */
    static drawTree(ctx, x, groundY, size, nightT, time) {
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
        const leafDay = [102, 187, 106];
        const leafNight = [61, 107, 64];
        const lr = Math.round(leafDay[0] + (leafNight[0] - leafDay[0]) * nightT);
        const lg = Math.round(leafDay[1] + (leafNight[1] - leafDay[1]) * nightT);
        const lb = Math.round(leafDay[2] + (leafNight[2] - leafDay[2]) * nightT);

        ctx.fillStyle = `rgb(${lr}, ${lg}, ${lb})`;
        ctx.beginPath();
        ctx.ellipse(x + sway, groundY - trunkH - canopyR * 0.5, canopyR, canopyR * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Darker canopy layer
        ctx.fillStyle = `rgb(${Math.max(0, lr - 20)}, ${Math.max(0, lg - 20)}, ${Math.max(0, lb - 10)})`;
        ctx.beginPath();
        ctx.ellipse(x + sway - 5 * size, groundY - trunkH - canopyR * 0.3, canopyR * 0.7, canopyR * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();
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
     * Draw a cluster of flowers
     */
    static drawFlowers(ctx, x, groundY, count, spread, nightT, time) {
        const colors = ['#EF5350', '#FFD54F', '#CE93D8', '#FF8A65', '#81C784'];

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
     * Draw a wooden sign
     */
    static drawSign(ctx, x, groundY, text, nightT) {
        const signW = 80;
        const signH = 40;
        const postH = 45;

        // Post
        ctx.fillStyle = nightT > 0.5 ? '#4A3322' : '#6D4C33';
        ctx.fillRect(x - 2.5, groundY - postH, 5, postH);

        // Sign board
        ctx.fillStyle = nightT > 0.5 ? '#5A4838' : '#8D6E63';
        ctx.beginPath();
        ctx.roundRect(x - signW / 2, groundY - postH - signH + 5, signW, signH, 4);
        ctx.fill();
        ctx.strokeStyle = nightT > 0.5 ? '#3A2818' : '#5D4037';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Text
        ctx.font = `700 9px 'Pixelify Sans', cursive`;
        ctx.textAlign = 'center';
        ctx.fillStyle = nightT > 0.5 ? '#E8E0D5' : '#FFF8E7';

        const lines = text.split('\n');
        lines.forEach((line, i) => {
            ctx.fillText(line, x, groundY - postH - signH + 20 + i * 12);
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
