/**
 * ThemeManager.js — Manages day/night theme transitions.
 * Controls CSS data-theme attribute and notifies game systems.
 */
export class ThemeManager {
    constructor() {
        this.isNight = false;
        this.transitionCallbacks = [];

        // Setup toggle button
        this.toggleBtn = document.getElementById('theme-toggle');
        this.toggleIcon = document.getElementById('toggle-icon');

        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());
        }
    }

    /**
     * Register a callback for theme changes: fn(isNight)
     */
    onThemeChange(fn) {
        this.transitionCallbacks.push(fn);
    }

    /**
     * Toggle between day and night
     */
    toggle() {
        this.isNight = !this.isNight;
        document.documentElement.setAttribute('data-theme', this.isNight ? 'night' : 'day');

        // Update toggle icon
        if (this.toggleIcon) {
            this.toggleIcon.textContent = this.isNight ? '☀️' : '🌙';
        }

        // Notify all listeners
        for (const fn of this.transitionCallbacks) {
            fn(this.isNight);
        }
    }
}
