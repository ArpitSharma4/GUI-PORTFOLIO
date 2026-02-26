/**
 * SeasonManager.js — Manages seasonal transitions (Spring, Summer, Autumn, Winter).
 * Controls the data-season attribute and notifies game systems.
 */
export const SEASONS = {
    SPRING: 'spring',
    SUMMER: 'summer',
    AUTUMN: 'autumn',
    WINTER: 'winter'
};

export class SeasonManager {
    constructor() {
        this.seasons = [SEASONS.SPRING, SEASONS.SUMMER, SEASONS.AUTUMN, SEASONS.WINTER];
        this.currentSeasonIndex = 1; // Start with Summer as default
        this.currentSeason = this.seasons[this.currentSeasonIndex];
        this.transitionCallbacks = [];

        // Setup toggle button
        this.toggleBtn = document.getElementById('season-toggle');
        this.seasonIcon = document.getElementById('season-icon');

        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.nextSeason());
        }

        // Initialize theme
        document.documentElement.setAttribute('data-season', this.currentSeason);
    }

    /**
     * Register a callback for season changes: fn(season)
     */
    onSeasonChange(fn) {
        this.transitionCallbacks.push(fn);
    }

    /**
     * Switch to the next season in rotation
     */
    nextSeason() {
        this.currentSeasonIndex = (this.currentSeasonIndex + 1) % this.seasons.length;
        this.currentSeason = this.seasons[this.currentSeasonIndex];

        document.documentElement.setAttribute('data-season', this.currentSeason);

        // Update icon based on season
        if (this.seasonIcon) {
            this.seasonIcon.textContent = this._getSeasonIcon(this.currentSeason);
        }

        // Notify all listeners
        for (const fn of this.transitionCallbacks) {
            fn(this.currentSeason);
        }
    }

    _getSeasonIcon(season) {
        switch (season) {
            case SEASONS.SPRING: return '🌸';
            case SEASONS.SUMMER: return '🌻';
            case SEASONS.AUTUMN: return '🍁';
            case SEASONS.WINTER: return '❄️';
            default: return '🌻';
        }
    }
}
