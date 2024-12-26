import { RenderContext, Room, Door } from '../../src/components/canvas';

/**
 * Creates a test render context with default values
 */
export const createTestRenderContext = (overrides = {}): RenderContext => ({
    ctx: document.createElement('canvas').getContext('2d')!,
    width: 800,
    height: 600,
    zoom: 1,
    panX: 0,
    panY: 0,
    transform: {
        scale: 1,
        offset: { x: 0, y: 0 }
    },
    offset: { x: 0, y: 0 },
    scale: 1,
    ...overrides
});

/**
 * Creates a test room with default values
 */
export const createTestRoom = (overrides = {}): Room => ({
    id: 'test-room',
    points: [
        { id: 'p1', x: 0, y: 0 },
        { id: 'p2', x: 100, y: 0 },
        { id: 'p3', x: 100, y: 100 },
        { id: 'p4', x: 0, y: 100 }
    ],
    ...overrides
});

/**
 * Creates a test door with default values
 */
export const createTestDoor = (overrides = {}): Door => ({
    id: 'test-door',
    x: 50,
    y: 0,
    width: 32,
    height: 80,
    rotation: 0,
    ...overrides
});

/**
 * Creates a canvas element with the specified dimensions
 */
export const createTestCanvas = (width = 800, height = 600): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
};

/**
 * Simulates a mouse event at the specified coordinates
 */
export const createMouseEvent = (
    type: string,
    x: number,
    y: number,
    options: Partial<MouseEventInit> = {}
): MouseEvent => {
    return new MouseEvent(type, {
        clientX: x,
        clientY: y,
        bubbles: true,
        cancelable: true,
        ...options
    });
};

/**
 * Simulates a touch event at the specified coordinates
 */
export const createTouchEvent = (
    type: string,
    x: number,
    y: number,
    options: Partial<TouchEventInit> = {}
): TouchEvent => {
    const touch = new Touch({
        identifier: 0,
        target: document.body,
        clientX: x,
        clientY: y,
        screenX: x,
        screenY: y,
        pageX: x,
        pageY: y,
        radiusX: 1,
        radiusY: 1,
        rotationAngle: 0,
        force: 1,
    });

    return new TouchEvent(type, {
        touches: [touch],
        targetTouches: [touch],
        changedTouches: [touch],
        bubbles: true,
        cancelable: true,
        ...options
    });
};

/**
 * Waits for a specified number of milliseconds
 */
export const wait = (ms: number): Promise<void> => 
    new Promise(resolve => setTimeout(resolve, ms));

/**
 * Waits for the next animation frame
 */
export const nextFrame = (): Promise<void> =>
    new Promise(resolve => requestAnimationFrame(() => resolve()));

/**
 * Creates a mock function that returns a promise resolving after a delay
 */
export const createAsyncMock = <T>(
    result: T,
    delay = 0
): jest.Mock<Promise<T>> => {
    return jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(result), delay))
    );
};

/**
 * Type guard for checking if a value is a DOM element
 */
export const isElement = (value: unknown): value is Element => {
    return value instanceof Element;
};

/**
 * Type guard for checking if a value is an HTML element
 */
export const isHTMLElement = (value: unknown): value is HTMLElement => {
    return value instanceof HTMLElement;
};

/**
 * Type guard for checking if a value is a canvas element
 */
export const isCanvas = (value: unknown): value is HTMLCanvasElement => {
    return value instanceof HTMLCanvasElement;
};
