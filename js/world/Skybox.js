import { WORLD_CONFIG } from './worldData.js';

export class Skybox {
    constructor(canvasWidth, canvasHeight) {
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.isNight = false;
        this.currentSeason = 'summer';
        this.transitionProgress = 0; // 0 = day, 1 = night

        // Celestial body
        this.celestialAngle = 0;

        // Stars & Clouds
        this.stars = [];
        this._generateStars(80);
        this.clouds = [];
        this._generateClouds(6);
    }

    _generateStars(count) {
        this.stars = [];
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random(),
                y: Math.random() * 0.5,
                size: 0.5 + Math.random() * 1.5,
                twinkleSpeed: 1 + Math.random() * 3,
                twinkleOffset: Math.random() * Math.PI * 2
            });
        }
    }

    _generateClouds(count) {
        this.clouds = [];
        for (let i = 0; i < count; i++) {
            this.clouds.push({
                x: Math.random() * 2 - 0.2,
                y: 0.05 + Math.random() * 0.25,
                width: 80 + Math.random() * 120,
                height: 30 + Math.random() * 25,
                speed: 8 + Math.random() * 15
            });
        }
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
    }

    setTheme(isNight) {
        this.isNight = isNight;
    }

    setSeason(season) {
        this.currentSeason = season;
    }

    update(dt, time) {
        const target = this.isNight ? 1 : 0;
        this.transitionProgress += (target - this.transitionProgress) * dt * 2;
        this.celestialAngle += dt * 0.05;

        for (const cloud of this.clouds) {
            cloud.x += (cloud.speed / this.width) * dt;
            if (cloud.x > 1.3) {
                cloud.x = -0.3;
                cloud.y = 0.05 + Math.random() * 0.25;
            }
        }
    }

    render(ctx, time) {
        const t = this.transitionProgress;
        const w = this.width;
        const h = this.height;

        // Get seasonal colors
        const palette = WORLD_CONFIG.seasons[this.currentSeason] || WORLD_CONFIG.seasons.summer;

        // --- Sky gradient ---
        const grad = ctx.createLinearGradient(0, 0, 0, h * 0.75);

        // Theme colors (interpolated with season)
        const dayTop = this._hexToRgb(palette.skyTop);
        const dayBot = this._hexToRgb(palette.skyBottom);
        const nightTop = { r: 11, g: 16, b: 38 };
        const nightBot = { r: 26, g: 26, b: 62 };

        const topR = this._lerp(dayTop.r, nightTop.r, t);
        const topG = this._lerp(dayTop.g, nightTop.g, t);
        const topB = this._lerp(dayTop.b, nightTop.b, t);
        const botR = this._lerp(dayBot.r, nightBot.r, t);
        const botG = this._lerp(dayBot.g, nightBot.g, t);
        const botB = this._lerp(dayBot.b, nightBot.b, t);

        grad.addColorStop(0, `rgb(${topR}, ${topG}, ${topB})`);
        grad.addColorStop(1, `rgb(${botR}, ${botG}, ${botB})`);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // --- Stars (night only) ---
        if (t > 0.3) {
            const starAlpha = Math.max(0, (t - 0.3) / 0.7);
            for (const star of this.stars) {
                const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(time * star.twinkleSpeed + star.twinkleOffset));
                ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha * twinkle * 0.8})`;
                ctx.beginPath();
                ctx.arc(star.x * w, star.y * h, star.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // --- Sun (day) ---
        if (t < 0.7) {
            const sunAlpha = Math.max(0, 1 - t / 0.7);
            const sunX = w * 0.8;
            const sunY = h * 0.12 + Math.sin(this.celestialAngle) * 8;
            const sunR = 32;

            const sunGlow = ctx.createRadialGradient(sunX, sunY, sunR * 0.5, sunX, sunY, sunR * 4);
            sunGlow.addColorStop(0, `rgba(255, 213, 79, ${0.3 * sunAlpha})`);
            sunGlow.addColorStop(1, 'rgba(255, 213, 79, 0)');
            ctx.fillStyle = sunGlow;
            ctx.beginPath();
            ctx.arc(sunX, sunY, sunR * 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = `rgba(255, 213, 79, ${sunAlpha})`;
            ctx.beginPath();
            ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
            ctx.fill();
        }

        // --- Moon (night) ---
        if (t > 0.3) {
            const moonAlpha = Math.max(0, (t - 0.3) / 0.7);
            const moonX = w * 0.15;
            const moonY = h * 0.1 + Math.sin(this.celestialAngle * 0.7) * 5;
            const moonR = 22;

            const moonGlow = ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, moonR * 5);
            moonGlow.addColorStop(0, `rgba(232, 224, 208, ${0.15 * moonAlpha})`);
            moonGlow.addColorStop(1, 'rgba(232, 224, 208, 0)');
            ctx.fillStyle = moonGlow;
            ctx.beginPath();
            ctx.arc(moonX, moonY, moonR * 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = `rgba(232, 224, 208, ${moonAlpha})`;
            ctx.beginPath();
            ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = `rgb(${topR}, ${topG}, ${topB})`;
            ctx.beginPath();
            ctx.arc(moonX + 7, moonY - 3, moonR * 0.78, 0, Math.PI * 2);
            ctx.fill();
        }

        // --- Clouds ---
        for (const cloud of this.clouds) {
            const cx = cloud.x * w;
            const cy = cloud.y * h;
            const cAlpha = this._lerp(0.7, 0.2, t);
            const cr = this._lerp(255, 40, t);
            const cg = this._lerp(255, 40, t);
            const cb = this._lerp(255, 65, t);

            ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${cAlpha})`;
            this._drawCloud(ctx, cx, cy, cloud.width, cloud.height);
        }
    }

    _drawCloud(ctx, x, y, w, h) {
        ctx.beginPath();
        ctx.ellipse(x, y, w * 0.5, h * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x - w * 0.25, y + h * 0.1, w * 0.3, h * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + w * 0.25, y + h * 0.05, w * 0.34, h * 0.34, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    _lerp(a, b, t) {
        return a + (b - a) * t;
    }

    _hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }
}

