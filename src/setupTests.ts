// Configure Jest DOM environment
import '@testing-library/jest-dom';

// Create a mock DOMMatrix implementation
class MockDOMMatrix implements DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    is2D = true;
    isIdentity = true;

    // Transform methods
    multiplySelf = jest.fn().mockReturnThis();
    preMultiplySelf = jest.fn().mockReturnThis();
    translateSelf = jest.fn().mockReturnThis();
    scaleSelf = jest.fn().mockReturnThis();
    scale3dSelf = jest.fn().mockReturnThis();
    rotateSelf = jest.fn().mockReturnThis();
    rotateFromVectorSelf = jest.fn().mockReturnThis();
    rotateAxisAngleSelf = jest.fn().mockReturnThis();
    skewXSelf = jest.fn().mockReturnThis();
    skewYSelf = jest.fn().mockReturnThis();
    invertSelf = jest.fn().mockReturnThis();

    // Non-mutating transform methods
    multiply = jest.fn().mockReturnThis();
    translate = jest.fn().mockReturnThis();
    scale = jest.fn().mockReturnThis();
    scaleNonUniform = jest.fn().mockReturnThis();
    scale3d = jest.fn().mockReturnThis();
    rotate = jest.fn().mockReturnThis();
    rotateFromVector = jest.fn().mockReturnThis();
    rotateAxisAngle = jest.fn().mockReturnThis();
    skewX = jest.fn().mockReturnThis();
    skewY = jest.fn().mockReturnThis();
    inverse = jest.fn().mockReturnThis();

    // Other methods
    flipX = jest.fn().mockReturnThis();
    flipY = jest.fn().mockReturnThis();
    setMatrixValue = jest.fn().mockReturnThis();
    transformPoint = jest.fn().mockReturnValue({ x: 0, y: 0 });
    toFloat32Array = jest.fn().mockReturnValue(new Float32Array(16));
    toFloat64Array = jest.fn().mockReturnValue(new Float64Array(16));
    toString = jest.fn().mockReturnValue('matrix(1, 0, 0, 1, 0, 0)');
    toJSON = jest.fn().mockReturnValue({
        a: 1, b: 0, c: 0, d: 1, e: 0, f: 0,
        m11: 1, m12: 0, m13: 0, m14: 0,
        m21: 0, m22: 1, m23: 0, m24: 0,
        m31: 0, m32: 0, m33: 1, m34: 0,
        m41: 0, m42: 0, m43: 0, m44: 1,
        is2D: true,
        isIdentity: true
    });
}

// Create a partial mock of CanvasRenderingContext2D with required properties
const mockCtx = {
    save: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    closePath: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    rect: jest.fn(),
    fillText: jest.fn(),
    strokeText: jest.fn(),
    setLineDash: jest.fn(),
    clearRect: jest.fn(),
    measureText: jest.fn(() => ({ width: 50 } as TextMetrics)),
    arc: jest.fn(),
    ellipse: jest.fn(),
    bezierCurveTo: jest.fn(),
    quadraticCurveTo: jest.fn(),
    canvas: {
        width: 800,
        height: 600,
        style: {}
    } as HTMLCanvasElement,
    // Add required properties with default values
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    lineCap: 'butt' as CanvasLineCap,
    lineJoin: 'miter' as CanvasLineJoin,
    miterLimit: 10,
    font: '10px sans-serif',
    textAlign: 'start' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    direction: 'ltr' as CanvasDirection,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over' as GlobalCompositeOperation,
    // Add stub implementations for required methods
    getTransform: () => new MockDOMMatrix(),
    setTransform: jest.fn(),
    getLineDash: () => [],
    createLinearGradient: jest.fn(),
    createPattern: jest.fn(),
    createRadialGradient: jest.fn(),
    drawImage: jest.fn(),
    isPointInPath: jest.fn(),
    isPointInStroke: jest.fn()
} as unknown as CanvasRenderingContext2D;

// Mock canvas element
const getContextMock = jest.fn().mockImplementation((contextId: '2d' | 'webgl' | 'bitmaprenderer') => {
    if (contextId === '2d') {
        return mockCtx;
    }
    return null;
});

// Override getContext method
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: getContextMock
});

// Mock window resize observer
class MockResizeObserver implements ResizeObserver {
    constructor(callback: ResizeObserverCallback) {}
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
}

// Override ResizeObserver
Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: MockResizeObserver
});

// Mock requestAnimationFrame with proper type casting
const rAF = ((callback: FrameRequestCallback) => {
    return window.setTimeout(() => callback(Date.now()), 0);
}) as unknown as typeof window.requestAnimationFrame;

// Mock cancelAnimationFrame with proper type casting
const cAF = ((handle: number) => {
    window.clearTimeout(handle);
}) as unknown as typeof window.cancelAnimationFrame;

// Override animation frame methods
Object.defineProperty(window, 'requestAnimationFrame', {
    configurable: true,
    value: rAF
});

Object.defineProperty(window, 'cancelAnimationFrame', {
    configurable: true,
    value: cAF
});

// Mock getBoundingClientRect
const mockGetBoundingClientRect = jest.fn(() => ({
    width: 800,
    height: 600,
    top: 0,
    left: 0,
    right: 800,
    bottom: 600,
    x: 0,
    y: 0,
    toJSON: () => ({})
}));

// Override getBoundingClientRect
Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: mockGetBoundingClientRect
});

// Export mocks for use in tests
export {
    mockCtx,
    getContextMock,
    mockGetBoundingClientRect,
    MockDOMMatrix
};
