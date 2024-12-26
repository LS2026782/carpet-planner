// Extend the global namespace for Jest
declare global {
    // Extend Window interface
    interface Window {
        ResizeObserver: typeof ResizeObserver;
    }

    // Override requestAnimationFrame and cancelAnimationFrame
    function requestAnimationFrame(callback: FrameRequestCallback): number;
    function cancelAnimationFrame(handle: number): void;
}

// Extend Jest's expect
declare namespace jest {
    interface Matchers<R> {
        toHaveStyle(style: { [key: string]: any }): R;
    }
}

// Export empty object to make this a module
export {};
