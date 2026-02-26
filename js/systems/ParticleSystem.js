import { WORLD_CONFIG } from '../world/worldData.js';

export class ParticleSystem {
    constructor(canvasWidth, canvasHeight, worldWidth) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.worldWidth = worldWidth;
        this.groundY = canvasHeight * 0.72;

        this.particles = [];
        this.isNight = false;
        this.currentSeason = 'summer';
        this.maxParticles = 40;

        this._spawnInitial();
    }

    _spawnInitial() {
        this.particles = [];
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(this._createParticle());
        }
    }

    _createParticle() {
        if (this.isNight) {
            return this._createFirefly();
        }
        return Math.random() > 0.7 ? this._createBird() : this._createLeaf();
    }

    _createLeaf() {
        const palette = WORLD_CONFIG.seasons[this.currentSeason] || WORLD_CONFIG.seasons.summer;
        const colors = palette.particles;
        const isWinter = this.currentSeason === 'winter';

        return {
            type: isWinter ? 'snow' : 'leaf',
            x: Math.random() * this.worldWidth,
            y: Math.random() * this.groundY * 1.2 - 100,
            size: isWinter ? 1.5 + Math.random() * 2 : 2 + Math.random() * 3,
            speedX: isWinter ? -5 + Math.random() * 10 : 10 + Math.random() * 20,
            speedY: isWinter ? 15 + Math.random() * 25 : 5 + Math.random() * 15,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: isWinter ? 0 : 1 + Math.random() * 3,
            wobble: Math.random() * Math.PI * 2,
            alpha: 0.4 + Math.random() * 0.4,
            color: colors[Math.floor(Math.random() * colors.length)]
        };
    }

    _createBird() {
        const goingRight = Math.random() > 0.5;
        // Winter has fewer birds
        if (this.currentSeason === 'winter' && Math.random() > 0.3) return this._createLeaf();

        return {
            type: 'bird',
            x: goingRight ? -20 : this.worldWidth + 20,
            y: 30 + Math.random() * this.groundY * 0.3,
            speedX: (goingRight ? 1 : -1) * (40 + Math.random() * 60),
            wingCycle: Math.random() * Math.PI * 2,
            wingSpeed: 5 + Math.random() * 2,
            size: 3 + Math.random() * 2,
            alpha: 0.5 + Math.random() * 0.3
        };
    }

    _createFirefly() {
        return {
            type: 'firefly',
            x: Math.random() * this.worldWidth,
            y: this.groundY * 0.3 + Math.random() * this.groundY * 0.6,
            size: 1.5 + Math.random() * 2,
            speedX: -5 + Math.random() * 10,
            speedY: -5 + Math.random() * 10,
            pulseCycle: Math.random() * Math.PI * 2,
            pulseSpeed: 1 + Math.random() * 3,
            alpha: 0,
            changeTimer: 2 + Math.random() * 4
        };
    }

    resize(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.groundY = canvasHeight * 0.72;
    }

    setNightMode(isNight) {
        if (this.isNight !== isNight) {
            this.isNight = isNight;
            this._spawnInitial();
        }
    }

    setSeason(season) {
        if (this.currentSeason !== season) {
            this.currentSeason = season;
            this._spawnInitial();
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            switch (p.type) {
                case 'leaf':
                case 'snow':
                    p.x += p.speedX * dt;
                    p.y += p.speedY * dt + Math.sin(p.wobble) * 8 * dt;
                    p.rotation += p.rotSpeed * dt;
                    p.wobble += dt * 2;

                    if (p.y > this.groundY || p.x > this.worldWidth + 50 || p.x < -50) {
                        const next = this._createLeaf();
                        Object.assign(p, next);
                        p.y = -10;
                    }
                    break;

                case 'bird':
                    p.x += p.speedX * dt;
                    p.wingCycle += p.wingSpeed * dt;
                    p.y += Math.sin(p.wingCycle * 0.3) * 5 * dt;

                    if ((p.speedX > 0 && p.x > this.worldWidth + 50) || (p.speedX < 0 && p.x < -50)) {
                        const next = this._createBird();
                        Object.assign(p, next);
                    }
                    break;

                case 'firefly':
                    p.pulseCycle += p.pulseSpeed * dt;
                    p.alpha = 0.3 + 0.7 * Math.max(0, Math.sin(p.pulseCycle));
                    p.x += p.speedX * dt;
                    p.y += p.speedY * dt;
                    p.changeTimer -= dt;
                    if (p.changeTimer <= 0) {
                        p.speedX = -5 + Math.random() * 10;
                        p.speedY = -5 + Math.random() * 10;
                        p.changeTimer = 2 + Math.random() * 4;
                    }
                    if (p.x < 0) p.x = this.worldWidth;
                    if (p.x > this.worldWidth) p.x = 0;
                    if (p.y < this.groundY * 0.2) p.speedY = Math.abs(p.speedY);
                    if (p.y > this.groundY - 10) p.speedY = -Math.abs(p.speedY);
                    break;
            }
        }
    }

    render(ctx, camera) {
        camera.applyTransform(ctx);

        for (const p of this.particles) {
            if (!camera.isVisible(p.x - 20, p.y - 20, 40, 40)) continue;

            switch (p.type) {
                case 'snow':
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = p.alpha;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                    break;

                case 'leaf':
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation);
                    ctx.globalAlpha = p.alpha;
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                    ctx.globalAlpha = 1;
                    break;

                case 'bird':
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.globalAlpha = p.alpha;
                    const wingY = Math.sin(p.wingCycle) * 4;
                    ctx.strokeStyle = '#5D4037';
                    ctx.lineWidth = 1.5;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.quadraticCurveTo(-p.size, -p.size + wingY, -p.size * 2, wingY);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.quadraticCurveTo(p.size, -p.size + wingY, p.size * 2, wingY);
                    ctx.stroke();
                    ctx.restore();
                    ctx.globalAlpha = 1;
                    break;

                case 'firefly':
                    ctx.save();
                    ctx.globalAlpha = p.alpha;
                    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
                    glow.addColorStop(0, `rgba(255, 213, 79, ${p.alpha * 0.3})`);
                    glow.addColorStop(1, 'rgba(255, 213, 79, 0)');
                    ctx.fillStyle = glow;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = `rgba(255, 213, 79, ${p.alpha})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                    ctx.globalAlpha = 1;
                    break;
            }
        }

        camera.resetTransform(ctx);
    }
}
