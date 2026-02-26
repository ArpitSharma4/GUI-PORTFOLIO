/**
 * NPC.js — Non-player characters with idle animations and speech bubbles.
 * Types: developer, gardener, delivery, sweeper
 */
export class NPC {
    constructor(data, groundY) {
        this.id = data.id;
        this.type = data.type;
        this.x = data.x;
        this.baseX = data.x;
        this.groundY = groundY;
        this.speech = data.speech;
        this.direction = data.direction || 1;
        this.isWalking = data.isWalking || false;
        this.walkRange = data.walkRange || 40;

        // Animation state
        this.animCycle = Math.random() * Math.PI * 2;
        this.walkCycle = 0;

        // Speech bubble state
        this.showSpeech = false;
        this.speechAlpha = 0;

        // Night mode
        this.nightT = 0;
    }

    update(dt, time) {
        this.animCycle += dt * 3;

        // Walking NPCs (delivery person)
        if (this.isWalking) {
            this.walkCycle += dt * 1.5;
            this.x = this.baseX + Math.sin(this.walkCycle) * this.walkRange;
            this.direction = Math.cos(this.walkCycle) > 0 ? 1 : -1;
        }

        // Smooth speech bubble transition
        const targetSpeech = this.showSpeech ? 1 : 0;
        this.speechAlpha += (targetSpeech - this.speechAlpha) * 0.12;
    }

    setNightMode(nightT) {
        this.nightT = nightT;
    }

    /**
     * Render the NPC
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.groundY);

        const bob = Math.sin(this.animCycle) * 2;
        const armSwing = this.isWalking ? Math.sin(this.animCycle * 2) * 8 : Math.sin(this.animCycle * 0.5) * 3;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.scale(this.direction, 1);

        // Get NPC colors based on type
        const colors = this._getTypeColors();

        // --- Legs ---
        ctx.strokeStyle = colors.pants;
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';

        const legSwing = this.isWalking ? Math.sin(this.animCycle * 2) * 5 : 0;
        ctx.beginPath();
        ctx.moveTo(-4, -5);
        ctx.lineTo(-4 - legSwing * 0.4, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(4, -5);
        ctx.lineTo(4 + legSwing * 0.4, 0);
        ctx.stroke();

        // --- Body ---
        const bodyY = -22 + bob * 0.3;
        ctx.fillStyle = colors.shirt;
        ctx.beginPath();
        ctx.roundRect(-8, bodyY, 16, 18, 3);
        ctx.fill();

        // --- Arms ---
        ctx.strokeStyle = colors.skin;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-8, bodyY + 4);
        ctx.lineTo(-12 + armSwing * 0.3, bodyY + 13);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(8, bodyY + 4);
        ctx.lineTo(12 - armSwing * 0.3, bodyY + 13);
        ctx.stroke();

        // --- Type-specific item ---
        this._renderTypeItem(ctx, bodyY, colors);

        // --- Head ---
        const headY = bodyY - 11;
        ctx.fillStyle = colors.skin;
        ctx.beginPath();
        ctx.arc(0, headY, 8, 0, Math.PI * 2);
        ctx.fill();

        // Hair/hat
        ctx.fillStyle = colors.hair;
        ctx.beginPath();
        ctx.arc(0, headY - 2, 8, Math.PI, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#3E2723';
        ctx.beginPath();
        ctx.arc(3, headY - 1, 1.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    _renderTypeItem(ctx, bodyY, colors) {
        switch (this.type) {
            case 'developer':
                // Laptop
                ctx.fillStyle = '#607D8B';
                ctx.fillRect(-6, bodyY + 10, 12, 2);
                ctx.fillStyle = '#90A4AE';
                ctx.fillRect(-5, bodyY + 5, 10, 5);
                break;
            case 'gardener':
                // Watering can held by arm
                ctx.fillStyle = '#7CB342';
                ctx.beginPath();
                ctx.arc(13, bodyY + 12, 4, 0, Math.PI * 2);
                ctx.fill();
                // Water drops (animated)
                if (Math.sin(this.animCycle * 3) > 0.3) {
                    ctx.fillStyle = '#42A5F5';
                    ctx.beginPath();
                    ctx.arc(16, bodyY + 18, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            case 'delivery':
                // Package/box
                ctx.fillStyle = '#8D6E63';
                ctx.fillRect(-5, bodyY + 2, 10, 8);
                ctx.strokeStyle = '#5D4037';
                ctx.lineWidth = 0.8;
                ctx.strokeRect(-5, bodyY + 2, 10, 8);
                break;
            case 'sweeper':
                // Broom
                ctx.strokeStyle = '#8D6E63';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(12, bodyY + 2);
                ctx.lineTo(12, bodyY + 20);
                ctx.stroke();
                // Broom head
                ctx.strokeStyle = '#FFD54F';
                ctx.lineWidth = 1;
                for (let i = -3; i <= 3; i++) {
                    ctx.beginPath();
                    ctx.moveTo(12, bodyY + 20);
                    ctx.lineTo(12 + i, bodyY + 25);
                    ctx.stroke();
                }
                break;
        }
    }

    _getTypeColors() {
        const nt = this.nightT;
        const base = {
            developer: { shirt: '#42A5F5', pants: '#455A64', skin: '#FFCC80', hair: '#5D4037' },
            gardener: { shirt: '#66BB6A', pants: '#5D4037', skin: '#FFB74D', hair: '#3E2723' },
            delivery: { shirt: '#FF7043', pants: '#37474F', skin: '#FFCC80', hair: '#4E342E' },
            sweeper: { shirt: '#AB47BC', pants: '#455A64', skin: '#FFB74D', hair: '#3E2723' },
        };

        return base[this.type] || base.developer;
    }
}
