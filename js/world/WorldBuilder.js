/**
 * WorldBuilder.js — Assembles the entire game world from worldData.
 * Creates entities, sets up collision zones, manages rendering order.
 */
import { Building } from '../entities/Building.js';
import { NPC } from '../entities/NPC.js';
import { SkillIcon } from '../entities/SkillIcon.js';
import { EnvironmentProp } from '../entities/EnvironmentProp.js';
import { ParallaxLayer } from './ParallaxLayer.js';
import { Skybox } from './Skybox.js';
import { WORLD_CONFIG, BUILDINGS, NPCS, SKILLS, ENVIRONMENT } from './worldData.js';

export class WorldBuilder {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.groundY = canvasHeight * WORLD_CONFIG.groundFraction;

        // Entity lists
        this.buildings = [];
        this.npcs = [];
        this.skills = [];

        // Layer systems
        this.skybox = null;
        this.parallaxLayers = [];

        // Night transition
        this.nightT = 0;
        this.totalTime = 0;
        this.currentSeason = 'summer';

        this._build();
    }

    _build() {
        const w = this.canvasWidth;
        const h = this.canvasHeight;
        const gy = this.groundY;

        // --- Skybox ---
        this.skybox = new Skybox(w, h);

        // --- Parallax layers ---
        this.parallaxLayers = [
            new ParallaxLayer(0.15, 'mountains', this._getParallaxColors('mountains', this.currentSeason)),
            new ParallaxLayer(0.35, 'hills', this._getParallaxColors('hills', this.currentSeason)),
            new ParallaxLayer(0.55, 'trees', this._getParallaxColors('trees', this.currentSeason))
        ];

        // --- Buildings ---
        this.buildings = BUILDINGS.map(data => new Building(data, gy));

        // --- NPCs ---
        this.npcs = NPCS.map(data => new NPC(data, gy));

        // --- Skills ---
        this.skills = SKILLS.map(data => new SkillIcon(data, gy));
    }

    _getParallaxColors(type, season) {
        const p = WORLD_CONFIG.seasons[season] || WORLD_CONFIG.seasons.summer;
        if (type === 'mountains') {
            return {
                fill: season === 'winter' ? '#B0BEC5' : '#90A4AE',
                nightFill: '#1A1C2C',
                trunk: '#6D4C33',
                nightTrunk: '#3A2818'
            };
        } else if (type === 'hills') {
            return {
                fill: p.grass,
                nightFill: this._darken(p.grass, 0.4),
                trunk: '#6D4C33',
                nightTrunk: '#3A2818'
            };
        } else { // trees
            return {
                fill: p.leaves,
                nightFill: p.leavesDark,
                trunk: '#6D4C33',
                nightTrunk: '#3A2818'
            };
        }
    }

    _darken(hex, amount) {
        const rgb = this._hexToRgb(hex);
        return `rgb(${Math.round(rgb.r * (1 - amount))}, ${Math.round(rgb.g * (1 - amount))}, ${Math.round(rgb.b * (1 - amount))})`;
    }

    _hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    /**
     * Rebuild on resize
     */
    resize(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.groundY = canvasHeight * WORLD_CONFIG.groundFraction;

        this.skybox.resize(canvasWidth, canvasHeight);

        // Update entity ground positions
        for (const b of this.buildings) b.groundY = this.groundY;
        for (const n of this.npcs) n.groundY = this.groundY;
        for (const s of this.skills) s.groundY = this.groundY;
    }

    /**
     * Set the current season
     */
    setSeason(season) {
        this.currentSeason = season;
        this.skybox.setSeason(season);

        // Update parallax colors
        this.parallaxLayers[0].setColors(this._getParallaxColors('mountains', season));
        this.parallaxLayers[1].setColors(this._getParallaxColors('hills', season));
        this.parallaxLayers[2].setColors(this._getParallaxColors('trees', season));
    }

    /**
     * Set all entities to day/night mode
     */
    setNightMode(isNight) {
        this.skybox.setTheme(isNight);
        for (const b of this.buildings) b.setNightMode(this.nightT);
        for (const n of this.npcs) n.setNightMode(this.nightT);
        for (const s of this.skills) s.setNightMode(this.nightT);
    }

    /**
     * Setup collision zones for the collision system
     */
    setupCollisions(collisionSystem) {
        collisionSystem.clearZones();

        for (const b of this.buildings) {
            // Interactive zone (wider than the building for approach detection)
            collisionSystem.addInteractiveZone(
                b.x - 30, this.groundY - b.height,
                b.width + 60, b.height,
                { type: 'building', building: b }
            );
        }

        for (const n of this.npcs) {
            collisionSystem.addInteractiveZone(
                n.x - 50, this.groundY - 60,
                100, 60,
                { type: 'npc', npc: n }
            );
        }

        for (const s of this.skills) {
            collisionSystem.addInteractiveZone(
                s.x - 40, this.groundY - 100,
                80, 100,
                { type: 'skill', skill: s }
            );
        }
    }

    /**
     * Update all world entities
     */
    update(dt, camera) {
        this.totalTime += dt;

        // Smooth night transition value
        const targetNight = this.skybox.isNight ? 1 : 0;
        this.nightT += (targetNight - this.nightT) * dt * 2;

        this.skybox.update(dt, this.totalTime);

        for (const b of this.buildings) {
            b.setNightMode(this.nightT);
            b.update(dt, this.totalTime);
        }
        for (const n of this.npcs) {
            n.setNightMode(this.nightT);
            n.update(dt, this.totalTime);
        }
        for (const s of this.skills) {
            s.setNightMode(this.nightT);
            s.update(dt);
        }
    }

    /**
     * Render the entire world in correct Z-order
     */
    render(ctx, camera) {
        const w = this.canvasWidth;
        const h = this.canvasHeight;
        const gy = this.groundY;

        // Layer 0: Sky
        this.skybox.render(ctx, this.totalTime);

        // Layers 1-3: Parallax backgrounds
        for (const layer of this.parallaxLayers) {
            layer.render(ctx, camera, w, h, gy, this.nightT);
        }

        // Apply camera transform for world-space objects
        camera.applyTransform(ctx);

        // Layer 4: Buildings (behind player)
        for (const b of this.buildings) {
            if (camera.isVisible(b.x - 20, gy - b.height - 20, b.width + 40, b.height + 40)) {
                b.render(ctx);
            }
        }

        // Layer 5: Ground / Road surface
        this._renderGround(ctx, camera);

        // Layer 5.5: Signs and Benches (behind player)
        this._renderSignsAndBenches(ctx, camera);

        // Layer 6: NPCs
        for (const n of this.npcs) {
            if (camera.isVisible(n.x - 30, gy - 70, 60, 70)) {
                n.render(ctx);
            }
        }

        // Layer 6.5: Skill icons
        for (const s of this.skills) {
            if (camera.isVisible(s.x - 30, gy - 110, 60, 110)) {
                s.render(ctx);
            }
        }

        // [PLAYER IS RENDERED BY main.js HERE — Layer 7]

        camera.resetTransform(ctx);
    }

    /**
     * Render foreground elements (Layer 8) — after player
     */
    renderForeground(ctx, camera) {
        camera.applyTransform(ctx);

        const gy = this.groundY;

        // Foreground trees (rendered partially in front of player)
        for (const tree of ENVIRONMENT.trees) {
            if (camera.isVisible(tree.x - 30, gy - 100, 60, 100)) {
                EnvironmentProp.drawTree(ctx, tree.x, gy, tree.size, this.nightT, this.totalTime, this.currentSeason);
            }
        }

        // Fences
        for (const fence of ENVIRONMENT.fences) {
            if (camera.isVisible(fence.x, gy - 35, fence.width, 35)) {
                EnvironmentProp.drawFence(ctx, fence.x, gy, fence.width, this.nightT);
            }
        }

        // Flowers
        for (const flower of ENVIRONMENT.flowers) {
            if (camera.isVisible(flower.x - flower.spread, gy - 20, flower.spread * 2, 20)) {
                EnvironmentProp.drawFlowers(ctx, flower.x, gy, flower.count, flower.spread, this.nightT, this.totalTime, this.currentSeason);
            }
        }

        // Lamps (foreground, player walks behind)
        for (const lamp of ENVIRONMENT.lamps) {
            if (camera.isVisible(lamp.x - 60, gy - 85, 120, 85)) {
                EnvironmentProp.drawLamp(ctx, lamp.x, gy, this.nightT, this.totalTime);
            }
        }

        camera.resetTransform(ctx);
    }


    /**
     * Render the ground / path
     */
    _renderGround(ctx, camera) {
        const gy = this.groundY;
        const worldW = WORLD_CONFIG.width;
        const palette = WORLD_CONFIG.seasons[this.currentSeason] || WORLD_CONFIG.seasons.summer;

        // --- Ground ---
        const groundDay = this._hexToRgb(palette.grassDark); // Using grassDark as basis for ground
        const groundNight = { r: 74, g: 55, b: 40 };
        const gr = Math.round(groundDay.r + (groundNight.r - groundDay.r) * this.nightT);
        const gg = Math.round(groundDay.g + (groundNight.g - groundDay.g) * this.nightT);
        const gb = Math.round(groundDay.b + (groundNight.b - groundDay.b) * this.nightT);

        ctx.fillStyle = `rgb(${gr}, ${gg}, ${gb})`;
        ctx.fillRect(-50, gy, worldW + 100, this.canvasHeight - gy + 50);

        // --- Grass strip ---
        const grassDay = this._hexToRgb(palette.grass);
        const grassNight = { r: 61, g: 90, b: 61 };
        const gsr = Math.round(grassDay.r + (grassNight.r - grassDay.r) * this.nightT);
        const gsg = Math.round(grassDay.g + (grassNight.g - grassDay.g) * this.nightT);
        const gsb = Math.round(grassDay.b + (grassNight.b - grassDay.b) * this.nightT);

        ctx.fillStyle = `rgb(${gsr}, ${gsg}, ${gsb})`;
        ctx.fillRect(-50, gy - 4, worldW + 100, 8);

        // --- Path / sidewalk ---
        const pathDayR = 212, pathDayG = 196, pathDayB = 168;
        const pathNightR = 90, pathNightG = 74, pathNightB = 56;
        const pr = Math.round(pathDayR + (pathNightR - pathDayR) * this.nightT);
        const pg = Math.round(pathDayG + (pathNightG - pathDayG) * this.nightT);
        const pb = Math.round(pathDayB + (pathNightB - pathDayB) * this.nightT);

        ctx.fillStyle = `rgb(${pr}, ${pg}, ${pb})`;
        ctx.fillRect(-50, gy + 4, worldW + 100, 14);

        // Path dashes
        ctx.setLineDash([12, 18]);
        ctx.strokeStyle = `rgba(${Math.max(0, pr - 25)}, ${Math.max(0, pg - 25)}, ${Math.max(0, pb - 20)}, 0.5)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-50, gy + 11);
        ctx.lineTo(worldW + 100, gy + 11);
        ctx.stroke();
        ctx.setLineDash([]);
    }


    /**
     * Render signs and benches (between buildings and player)
     */
    _renderSignsAndBenches(ctx, camera) {
        for (const sign of ENVIRONMENT.signs) {
            if (camera.isVisible(sign.x - 50, this.groundY - 90, 100, 90)) {
                EnvironmentProp.drawSign(ctx, sign.x, this.groundY, sign.text, this.nightT);
            }
        }
        for (const bench of ENVIRONMENT.benches) {
            if (camera.isVisible(bench.x - 20, this.groundY - 30, 40, 30)) {
                EnvironmentProp.drawBench(ctx, bench.x, this.groundY, this.nightT);
            }
        }
    }

    /**
     * Check player proximity to interactive objects
     */
    checkInteractions(playerX, range = 80) {
        // Check buildings
        for (const b of this.buildings) {
            const dist = Math.abs(playerX - (b.x + b.width / 2));
            b.isHighlighted = dist < range + b.width / 2;
            if (b.isHighlighted) {
                return { type: 'building', data: b };
            }
        }

        // Check NPCs
        for (const n of this.npcs) {
            const dist = Math.abs(playerX - n.x);
            const inRange = dist < range;
            n.showSpeech = inRange;
            if (inRange) {
                return { type: 'npc', data: n };
            }
        }

        // Check skills
        for (const s of this.skills) {
            const dist = Math.abs(playerX - s.x);
            s.showTooltip = dist < range * 0.7;
        }

        return null;
    }

    /**
     * Render NPC speech bubbles (in screen space, after camera)
     */
    renderSpeechBubbles(ctx, camera) {
        camera.applyTransform(ctx);

        for (const n of this.npcs) {
            if (n.speechAlpha > 0.01) {
                this._drawSpeechBubble(ctx, n.x, this.groundY - 65, n.speech, n.speechAlpha);
            }
        }

        camera.resetTransform(ctx);
    }

    _drawSpeechBubble(ctx, x, y, text, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;

        ctx.font = `500 10px 'Quicksand', sans-serif`;
        const maxWidth = 180;

        // Word wrap
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            if (ctx.measureText(testLine).width > maxWidth) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) lines.push(currentLine);

        const lineHeight = 14;
        const paddingX = 10;
        const paddingY = 8;
        const bubbleW = maxWidth + paddingX * 2;
        const bubbleH = lines.length * lineHeight + paddingY * 2;
        const bx = x - bubbleW / 2;
        const by = y - bubbleH;

        // Bubble background
        ctx.fillStyle = this.nightT > 0.5 ? 'rgba(30, 26, 46, 0.92)' : 'rgba(255, 248, 231, 0.95)';
        ctx.strokeStyle = this.nightT > 0.5 ? 'rgba(58, 53, 85, 0.8)' : 'rgba(212, 196, 160, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(bx, by, bubbleW, bubbleH, 8);
        ctx.fill();
        ctx.stroke();

        // Tail
        ctx.fillStyle = this.nightT > 0.5 ? 'rgba(30, 26, 46, 0.92)' : 'rgba(255, 248, 231, 0.95)';
        ctx.beginPath();
        ctx.moveTo(x - 6, by + bubbleH);
        ctx.lineTo(x, by + bubbleH + 8);
        ctx.lineTo(x + 6, by + bubbleH);
        ctx.fill();

        // Text
        ctx.fillStyle = this.nightT > 0.5 ? '#E8E0D5' : '#3E2723';
        ctx.textAlign = 'left';
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], bx + paddingX, by + paddingY + 10 + i * lineHeight);
        }

        ctx.restore();
    }
}
