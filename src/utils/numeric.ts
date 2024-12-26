/**
 * Safely converts a value to a number
 */
export function parseNumber(value: unknown): number {
    if (typeof value === 'number' && !isNaN(value)) {
        return value;
    }
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
}

/**
 * Safely converts a value to a number with a default value
 */
export function parseNumberWithDefault(value: unknown, defaultValue: number): number {
    if (typeof value === 'number' && !isNaN(value)) {
        return value;
    }
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
}

/**
 * Clamps a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Converts degrees to radians
 */
export function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Converts radians to degrees
 */
export function toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
}

/**
 * Formats a number to a fixed number of decimal places
 */
export function formatNumber(value: number, decimals = 1): string {
    return value.toFixed(decimals);
}

/**
 * Validates that a number is positive
 */
export function validatePositive(value: number, name = 'Value'): void {
    if (value <= 0) {
        throw new Error(`${name} must be positive`);
    }
}

/**
 * Validates that a number is non-negative
 */
export function validateNonNegative(value: number, name = 'Value'): void {
    if (value < 0) {
        throw new Error(`${name} must be non-negative`);
    }
}

/**
 * Rounds a number to the nearest step value
 */
export function roundToNearest(value: number, step: number): number {
    return Math.round(value / step) * step;
}

/**
 * Calculates the distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the angle between two points in radians
 */
export function angle(x1: number, y1: number, x2: number, y2: number): number {
    return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Normalizes an angle to be between 0 and 2π
 */
export function normalizeAngle(angle: number): number {
    while (angle < 0) angle += Math.PI * 2;
    while (angle >= Math.PI * 2) angle -= Math.PI * 2;
    return angle;
}
