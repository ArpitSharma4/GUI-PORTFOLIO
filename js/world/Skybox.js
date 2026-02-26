/**
 * Skybox.js — Renders the sky gradient, sun/moon, stars, and clouds.
 * Responds to theme changes with smooth transitions.
 */
export class Skybox {
    constructor(canvasWidth, canvasHeight) {
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.isNight = false;
        this.transitionProgress = 0; // 0 = day, 1 = night

        // Sun/Moon
        this.celestialY = 0;
        this.celestialAngle = 0;

        // Stars
        this.stars = [];
        this._generateStars(80);

        // Clouds
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
                x: Math.random() * 2 - 0.2,   // can start off-screen
                y: 0.05 + Math.random() * 0.25,
                width: 80 + Math.random() * 120,
                height: 30 + Math.random() * 25,
                speed: 8 + Math.random() * 15   // pixels per second
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

    /**
     * @param {number} dt — delta time
     * @param {number} time — total elapsed time
     */
    update(dt, time) {
        // Smooth transition progress
        const target = this.isNight ? 1 : 0;
        this.transitionProgress += (target - this.transitionProgress) * dt * 2;

        // Celestial body slow arc
        this.celestialAngle += dt * 0.05;

        // Move clouds
        for (const cloud of this.clouds) {
            cloud.x += (cloud.speed / this.width) * dt;
            if (cloud.x > 1.3) {
                cloud.x = -0.3;
                cloud.y = 0.05 + Math.random() * 0.25;
            }
        }
    }

    /**
     * Render sky to canvas
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} time — total elapsed time
     */
    render(ctx, time) {
        const t = this.transitionProgress;
        const w = this.width;
        const h = this.height;

        // --- Sky gradient ---
        const grad = ctx.createLinearGradient(0, 0, 0, h * 0.75);

        // Interpolate colors
        const topR = this._lerp(135, 11, t);
        const topG = this._lerp(206, 16, t);
        const topB = this._lerp(235, 38, t);
        const botR = this._lerp(240, 26, t);
        const botG = this._lerp(230, 26, t);
        const botB = this._lerp(211, 62, t);

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

            // Sun glow
            const sunGlow = ctx.createRadialGradient(sunX, sunY, sunR * 0.5, sunX, sunY, sunR * 4);
            sunGlow.addColorStop(0, `rgba(255, 213, 79, ${0.3 * sunAlpha})`);
            sunGlow.addColorStop(1, 'rgba(255, 213, 79, 0)');
            ctx.fillStyle = sunGlow;
            ctx.beginPath();
            ctx.arc(sunX, sunY, sunR * 4, 0, Math.PI * 2);
            ctx.fill();

            // Sun body
            ctx.fillStyle = `rgba(255, 213, 79, ${sunAlpha})`;
            ctx.beginPath();
            ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
            ctx.fill();

            // Sun rays
            ctx.strokeStyle = `rgba(255, 213, 79, ${0.2 * sunAlpha})`;
            ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + time * 0.3;
                ctx.beginPath();
                ctx.moveTo(sunX + Math.cos(angle) * (sunR + 5), sunY + Math.sin(angle) * (sunR + 5));
                ctx.lineTo(sunX + Math.cos(angle) * (sunR + 18), sunY + Math.sin(angle) * (sunR + 18));
                ctx.stroke();
            }
        }

        // --- Moon (night) ---
        if (t > 0.3) {
            const moonAlpha = Math.max(0, (t - 0.3) / 0.7);
            const moonX = w * 0.15;
            const moonY = h * 0.1 + Math.sin(this.celestialAngle * 0.7) * 5;
            const moonR = 22;

            // Moon glow
            const moonGlow = ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, moonR * 5);
            moonGlow.addColorStop(0, `rgba(232, 224, 208, ${0.15 * moonAlpha})`);
            moonGlow.addColorStop(1, 'rgba(232, 224, 208, 0)');
            ctx.fillStyle = moonGlow;
            ctx.beginPath();
            ctx.arc(moonX, moonY, moonR * 5, 0, Math.PI * 2);
            ctx.fill();

            // Moon body
            ctx.fillStyle = `rgba(232, 224, 208, ${moonAlpha})`;
            ctx.beginPath();
            ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
            ctx.fill();

            // Moon crescent shadow
            ctx.fillStyle = `rgba(${topR}, ${topG}, ${topB}, ${moonAlpha * 0.85})`;
            ctx.beginPath();
            ctx.arc(moonX + 7, moonY - 3, moonR * 0.78, 0, Math.PI * 2);
            ctx.fill();
        }

        // --- Clouds ---
        for (const cloud of this.clouds) {
            const cx = cloud.x * w;
            const cy = cloud.y * h;
            const cAlphaDay = 0.7;
            const cAlphaNight = 0.2;
            const cAlpha = this._lerp(cAlphaDay, cAlphaNight, t);

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
}
