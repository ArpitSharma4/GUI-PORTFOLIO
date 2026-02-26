/**
 * CollisionSystem.js — Simple AABB collision and boundary constraints.
 * Keeps player on the ground and within world bounds.
 */
export class CollisionSystem {
    /**
     * @param {number} worldWidth — total world width in pixels
     * @param {number} groundY — Y position of the ground surface (from top of canvas)
     */
    constructor(worldWidth, groundY) {
        this.worldWidth = worldWidth;
        this.groundY = groundY;

        /** List of solid rectangular zones the player cannot walk through */
        this.solidZones = [];

        /** List of interactive zones (buildings, NPCs, skills) */
        this.interactiveZones = [];
    }

    /**
     * Update ground Y (needed on canvas resize)
     */
    setGroundY(y) {
        this.groundY = y;
    }

    /**
     * Add a solid zone the player cannot enter
     */
    addSolidZone(x, y, width, height, id = null) {
        this.solidZones.push({ x, y, width, height, id });
    }

    /**
     * Add an interactive zone with associated data
     */
    addInteractiveZone(x, y, width, height, data) {
        this.interactiveZones.push({ x, y, width, height, data });
    }

    /**
     * Clear all zones (for rebuilding after resize)
     */
    clearZones() {
        this.solidZones = [];
        this.interactiveZones = [];
    }

    /**
     * Constrain player position to valid bounds
     * @param {object} player — must have x, y, width, height
     * @returns {object} — corrected { x, y }
     */
    constrainPlayer(player) {
        let { x, y } = player;
        const halfWidth = player.width / 2;

        // Keep within world horizontal bounds
        x = Math.max(halfWidth, Math.min(x, this.worldWidth - halfWidth));

        // Keep on ground
        y = this.groundY;

        // Check solid zones (prevent walking through buildings)
        for (const zone of this.solidZones) {
            if (this._overlapsX(x, halfWidth, zone)) {
                // Push player out of the zone
                const playerLeft = x - halfWidth;
                const playerRight = x + halfWidth;
                const zoneLeft = zone.x;
                const zoneRight = zone.x + zone.width;

                // Determine which side is closer to push out
                const overlapLeft = playerRight - zoneLeft;
                const overlapRight = zoneRight - playerLeft;

                if (overlapLeft < overlapRight) {
                    x = zoneLeft - halfWidth;
                } else {
                    x = zoneRight + halfWidth;
                }
            }
        }

        return { x, y };
    }

    /**
     * Check if player X overlaps with a zone
     */
    _overlapsX(playerX, halfWidth, zone) {
        const playerLeft = playerX - halfWidth;
        const playerRight = playerX + halfWidth;
        return playerRight > zone.x && playerLeft < zone.x + zone.width;
    }

    /**
     * Find the nearest interactive zone the player is within range of
     * @param {object} player — must have x, y
     * @param {number} range — interaction range in pixels
     * @returns {object|null} — the zone data or null
     */
    findNearbyInteractive(player, range = 80) {
        let closest = null;
        let closestDist = Infinity;

        for (const zone of this.interactiveZones) {
            const zoneCenterX = zone.x + zone.width / 2;
            const dist = Math.abs(player.x - zoneCenterX);

            if (dist < range && dist < closestDist) {
                closest = zone;
                closestDist = dist;
            }
        }

        return closest;
    }

    /**
     * AABB overlap test between two rectangles
     */
    static testOverlap(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }
}
