/**
 * Player.js — Main character entity.
 * Handles walking, sprinting, jumping, animations, shadow, and rendering.
 * Drawn procedurally on canvas.
 */
export class Player {
    constructor(x, groundY, canvasHeight) {
        this.x = x;
        this.y = groundY;
        this.groundY = groundY;
        this.width = 28;
        this.height = 48;

        // Movement
        this.speed = 180;          // base walk speed (px/s)
        this.sprintMultiplier = 1.8;
        this.velocityX = 0;
        this.direction = 1;        // 1 = right, -1 = left
        this.isMoving = false;
        this.isSprinting = false;

        // Jump physics
        this.velocityY = 0;
        this.gravity = 900;        // px/s²
        this.jumpForce = -380;     // initial upward velocity
        this.isGrounded = true;
        this.isJumping = false;
        this.jumpSquash = 0;       // squash/stretch effect

        // Dust particles on land
        this.dustParticles = [];

        // Animation
        this.walkCycle = 0;
        this.breathCycle = 0;
        this.bobCycle = 0;
        this.sprintTrails = [];    // afterimage positions

        // Canvas reference
        this.canvasHeight = canvasHeight;

        // Theme glow
        this.glowAlpha = 0;
        this.targetGlowAlpha = 0;

        // Audio callback
        this.onJump = null;
        this.onLand = null;
        this.onStep = null;
        this.stepTimer = 0;
    }

    /**
     * Update player position and animation state
     */
    update(input, collision, dt) {
        // --- Horizontal movement ---
        this.velocityX = 0;
        this.isMoving = false;
        this.isSprinting = false;

        const sprinting = input.isSprinting();

        if (input.isMovingLeft()) {
            const spd = sprinting ? this.speed * this.sprintMultiplier : this.speed;
            this.velocityX = -spd;
            this.direction = -1;
            this.isMoving = true;
            this.isSprinting = sprinting;
        }
        if (input.isMovingRight()) {
            const spd = sprinting ? this.speed * this.sprintMultiplier : this.speed;
            this.velocityX = spd;
            this.direction = 1;
            this.isMoving = true;
            this.isSprinting = sprinting;
        }

        // Apply horizontal velocity
        this.x += this.velocityX * dt;

        // --- Jump ---
        if (input.isJumpPressed() && this.isGrounded) {
            this.velocityY = this.jumpForce;
            this.isGrounded = false;
            this.isJumping = true;
            this.jumpSquash = -0.3; // stretch up on jump
            if (this.onJump) this.onJump();
        }

        // Apply gravity
        if (!this.isGrounded) {
            this.velocityY += this.gravity * dt;
            this.y += this.velocityY * dt;

            // Check ground collision
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.velocityY = 0;
                this.isGrounded = true;
                this.isJumping = false;
                this.jumpSquash = 0.3; // squash on land
                this._spawnDust();
                if (this.onLand) this.onLand();
            }
        }

        // Decay squash/stretch
        this.jumpSquash *= 0.85;

        // --- Constrain X to bounds ---
        const constrained = collision.constrainPlayer(this);
        this.x = constrained.x;
        if (this.isGrounded) {
            this.y = constrained.y;
            this.groundY = constrained.y;
        }

        // --- Walk animation ---
        if (this.isMoving && this.isGrounded) {
            const walkSpeed = this.isSprinting ? 16 : 10;
            this.walkCycle += dt * walkSpeed;
            this.bobCycle += dt * walkSpeed;

            // Footstep sound timer
            const stepInterval = this.isSprinting ? 0.18 : 0.3;
            this.stepTimer += dt;
            if (this.stepTimer >= stepInterval) {
                this.stepTimer = 0;
                if (this.onStep) this.onStep(this.isSprinting);
            }
        } else {
            this.walkCycle *= 0.85;
            this.bobCycle *= 0.85;
            this.stepTimer = 0;
        }

        // Idle breathing
        this.breathCycle += dt * 2.5;

        // Smooth glow transition (night)
        this.glowAlpha += (this.targetGlowAlpha - this.glowAlpha) * 0.05;

        // Sprint trails
        if (this.isSprinting && this.isMoving && this.isGrounded) {
            this.sprintTrails.push({ x: this.x, y: this.y, alpha: 0.4, dir: this.direction });
            if (this.sprintTrails.length > 5) this.sprintTrails.shift();
        }
        for (let i = this.sprintTrails.length - 1; i >= 0; i--) {
            this.sprintTrails[i].alpha -= dt * 3;
            if (this.sprintTrails[i].alpha <= 0) this.sprintTrails.splice(i, 1);
        }

        // Update dust particles
        for (let i = this.dustParticles.length - 1; i >= 0; i--) {
            const d = this.dustParticles[i];
            d.x += d.vx * dt;
            d.y += d.vy * dt;
            d.vy -= 40 * dt;
            d.alpha -= dt * 3;
            d.size *= 0.97;
            if (d.alpha <= 0) this.dustParticles.splice(i, 1);
        }
    }

    _spawnDust() {
        for (let i = 0; i < 6; i++) {
            this.dustParticles.push({
                x: this.x + (Math.random() - 0.5) * 16,
                y: this.groundY,
                vx: (Math.random() - 0.5) * 50,
                vy: -(10 + Math.random() * 30),
                alpha: 0.5 + Math.random() * 0.3,
                size: 2 + Math.random() * 3
            });
        }
    }

    setNightMode(isNight) {
        this.targetGlowAlpha = isNight ? 0.15 : 0;
    }

    /**
     * Render the player character on canvas
     */
    render(ctx) {
        // --- Sprint afterimage trails ---
        for (const trail of this.sprintTrails) {
            ctx.save();
            ctx.translate(trail.x, trail.y);
            ctx.globalAlpha = trail.alpha * 0.3;
            ctx.scale(trail.dir, 1);
            ctx.fillStyle = '#FF8A65';
            ctx.beginPath();
            ctx.roundRect(-10, -24, 20, 20, 4);
            ctx.fill();
            ctx.fillStyle = '#FFCC80';
            ctx.beginPath();
            ctx.arc(0, -37, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.restore();
        }

        // --- Dust particles ---
        for (const d of this.dustParticles) {
            ctx.save();
            ctx.globalAlpha = d.alpha;
            ctx.fillStyle = '#C4A882';
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.restore();
        }

        ctx.save();
        ctx.translate(this.x, this.y);

        // Squash/stretch transform for jump
        const scaleX = 1 + this.jumpSquash * 0.5;
        const scaleY = 1 - this.jumpSquash * 0.5;
        ctx.scale(scaleX, scaleY);

        const breathOffset = Math.sin(this.breathCycle) * 1.2;
        const walkLeg = Math.sin(this.walkCycle) * (this.isSprinting ? 10 : 6);
        const headBob = this.isGrounded ? Math.abs(Math.sin(this.bobCycle)) * (this.isSprinting ? 2.5 : 1.5) : 0;

        // --- Night glow ---
        if (this.glowAlpha > 0.005) {
            const glowGrad = ctx.createRadialGradient(0, -this.height / 2, 5, 0, -this.height / 2, 80);
            glowGrad.addColorStop(0, `rgba(255, 204, 128, ${this.glowAlpha})`);
            glowGrad.addColorStop(1, 'rgba(255, 204, 128, 0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(0, -this.height / 2, 80, 0, Math.PI * 2);
            ctx.fill();
        }

        // --- Shadow (scales with height) ---
        const airHeight = this.groundY - this.y;
        const shadowScale = Math.max(0.3, 1 - airHeight / 150);
        ctx.fillStyle = `rgba(0, 0, 0, ${0.12 * shadowScale})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, 16 * shadowScale, 4 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mirror if facing left
        ctx.scale(this.direction, 1);

        // Jump offset for body rendering
        const jumpOffsetY = this.isGrounded ? 0 : (this.y - this.groundY);

        // --- Legs ---
        ctx.strokeStyle = '#5D4037';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';

        if (!this.isGrounded) {
            // Legs tucked when airborne
            ctx.beginPath();
            ctx.moveTo(-5, -6 + jumpOffsetY);
            ctx.lineTo(-8, -12 + jumpOffsetY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(5, -6 + jumpOffsetY);
            ctx.lineTo(8, -12 + jumpOffsetY);
            ctx.stroke();
        } else {
            // Left leg
            ctx.beginPath();
            ctx.moveTo(-5, -6);
            ctx.lineTo(-5 - walkLeg * 0.4, -1);
            ctx.stroke();
            // Right leg
            ctx.beginPath();
            ctx.moveTo(5, -6);
            ctx.lineTo(5 + walkLeg * 0.4, -1);
            ctx.stroke();
        }

        // --- Body ---
        const bodyY = -24 + breathOffset - headBob * 0.3;
        ctx.fillStyle = this.isSprinting ? '#FF7043' : '#FF8A65'; // Slightly redder when sprinting
        ctx.beginPath();
        ctx.roundRect(-10, bodyY, 20, 20, 4);
        ctx.fill();
        ctx.strokeStyle = this.isSprinting ? '#E65100' : '#E67350';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Sprint lines effect
        if (this.isSprinting && this.isMoving && this.isGrounded) {
            ctx.strokeStyle = `rgba(255, 138, 101, 0.4)`;
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 3; i++) {
                const ly = bodyY + 4 + i * 6;
                ctx.beginPath();
                ctx.moveTo(-16 - i * 3, ly);
                ctx.lineTo(-22 - i * 5, ly);
                ctx.stroke();
            }
        }

        // --- Arms ---
        ctx.strokeStyle = '#FFCC80';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';

        if (!this.isGrounded) {
            // Arms up when jumping
            ctx.beginPath();
            ctx.moveTo(-10, bodyY + 3);
            ctx.lineTo(-15, bodyY - 5);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(10, bodyY + 3);
            ctx.lineTo(15, bodyY - 5);
            ctx.stroke();
        } else {
            const armSwing = this.isSprinting ? walkLeg * 0.5 : walkLeg * 0.3;
            ctx.beginPath();
            ctx.moveTo(-10, bodyY + 5);
            ctx.lineTo(-14 + armSwing, bodyY + 14);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(10, bodyY + 5);
            ctx.lineTo(14 - armSwing, bodyY + 14);
            ctx.stroke();
        }

        // --- Head ---
        const headY = bodyY - 13 - headBob * 0.5;
        ctx.fillStyle = '#FFCC80';
        ctx.beginPath();
        ctx.arc(0, headY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#E0B070';
        ctx.lineWidth = 1;
        ctx.stroke();

        // --- Hair ---
        ctx.fillStyle = '#3E2723';
        ctx.beginPath();
        ctx.arc(0, headY - 3, 10, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(5, headY - 6, 6, 4, -0.2, 0, Math.PI);
        ctx.fill();

        // Hair flow when sprinting
        if (this.isSprinting && this.isMoving) {
            ctx.beginPath();
            ctx.moveTo(-6, headY - 8);
            ctx.lineTo(-14, headY - 6);
            ctx.lineTo(-10, headY - 10);
            ctx.fill();
        }

        // --- Eyes ---
        ctx.fillStyle = '#3E2723';
        const eyeY = headY - 1;
        if (!this.isGrounded) {
            // Wide excited eyes when jumping
            ctx.beginPath();
            ctx.arc(4, eyeY, 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(5, eyeY - 1, 0.9, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(4, eyeY, 1.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(4.8, eyeY - 0.8, 0.7, 0, Math.PI * 2);
            ctx.fill();
        }

        // --- Mouth ---
        ctx.strokeStyle = '#5D4037';
        ctx.lineWidth = 1;
        if (!this.isGrounded) {
            // Open mouth when jumping ("wheee!")
            ctx.fillStyle = '#5D4037';
            ctx.beginPath();
            ctx.ellipse(3, headY + 4, 2.5, 2, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.isSprinting) {
            // Determined grin
            ctx.beginPath();
            ctx.arc(3, headY + 3, 3, 0, Math.PI);
            ctx.stroke();
        } else {
            // Normal smile
            ctx.beginPath();
            ctx.arc(3, headY + 3, 2.5, 0.1, Math.PI - 0.1);
            ctx.stroke();
        }

        ctx.restore();
    }
}
