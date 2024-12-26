/// <reference types="jest" />

declare module 'eventemitter3';

declare global {
    interface Window {
        requestAnimationFrame: (callback: FrameRequestCallback) => number;
        cancelAnimationFrame: (handle: number) => void;
    }

    namespace jest {
        interface Matchers<R> {
            toBeWithinRange(floor: number, ceiling: number): R;
        }
    }

    var expect: jest.Expect;
    var jest: typeof import('@jest/globals').jest;
}

export {};
