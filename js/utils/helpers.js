/**
 * helpers.js — Misc utility functions.
 */

/**
 * Clamp a number between min and max
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Map a value from one range to another
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
    return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/**
 * Check if the device supports touch
 */
export function isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}

/**
 * Get device pixel ratio
 */
export function getDevicePixelRatio() {
    return Math.min(window.devicePixelRatio || 1, 2);
}
