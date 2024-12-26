import { CanvasManager } from './CanvasManager';

interface CanvasManagerFactoryOptions {
    gridSize?: number;
    enableAccessibility?: boolean;
    enableSound?: boolean;
}

/**
 * Creates a new CanvasManager instance with the specified options
 * @param canvas The canvas element to manage
 * @param options Optional configuration options
 * @returns A new CanvasManager instance
 */
export function createCanvasManager(
    canvas: HTMLCanvasElement,
    options: CanvasManagerFactoryOptions = {}
): CanvasManager {
    const defaultOptions = {
        gridSize: 20,
        enableAccessibility: true,
        enableSound: true
    };

    const mergedOptions = { ...defaultOptions, ...options };

    try {
        return new CanvasManager(canvas, mergedOptions);
    } catch (error) {
        console.error('Failed to create CanvasManager:', error);
        throw error;
    }
}

/**
 * Creates a new CanvasManager instance with accessibility features enabled
 * @param canvas The canvas element to manage
 * @param options Optional configuration options
 * @returns A new CanvasManager instance with accessibility enabled
 */
export function createAccessibleCanvasManager(
    canvas: HTMLCanvasElement,
    options: Omit<CanvasManagerFactoryOptions, 'enableAccessibility'> = {}
): CanvasManager {
    return createCanvasManager(canvas, {
        ...options,
        enableAccessibility: true
    });
}

/**
 * Creates a new CanvasManager instance optimized for performance
 * @param canvas The canvas element to manage
 * @param options Optional configuration options
 * @returns A new CanvasManager instance with performance optimizations
 */
export function createPerformanceCanvasManager(
    canvas: HTMLCanvasElement,
    options: Omit<CanvasManagerFactoryOptions, 'enableAccessibility' | 'enableSound'> = {}
): CanvasManager {
    return createCanvasManager(canvas, {
        ...options,
        enableAccessibility: false,
        enableSound: false
    });
}
