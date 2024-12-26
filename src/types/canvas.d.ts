declare interface CanvasRenderingContext2DExtended extends CanvasRenderingContext2D {
    // Add any custom canvas context methods here
}

declare interface HTMLCanvasElementExtended extends HTMLCanvasElement {
    getContext(contextId: '2d'): CanvasRenderingContext2DExtended | null;
}

declare interface CanvasState {
    scale: number;
    offset: {
        x: number;
        y: number;
    };
    gridSize: number;
    showGrid: boolean;
}

declare interface RenderOptions {
    isSelected?: boolean;
    isPreview?: boolean;
    showMeasurements?: boolean;
}

declare interface CanvasRenderingContext2DSettings {
    alpha?: boolean;
    desynchronized?: boolean;
    colorSpace?: PredefinedColorSpace;
    willReadFrequently?: boolean;
}

declare type CanvasContextType = '2d' | 'webgl' | 'webgl2' | 'bitmaprenderer';

declare interface CanvasRenderingContextOptions {
    contextType: CanvasContextType;
    settings?: CanvasRenderingContext2DSettings;
}

declare interface CanvasTransform {
    translate: (x: number, y: number) => void;
    scale: (x: number, y: number) => void;
    rotate: (angle: number) => void;
    transform: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
    setTransform: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
    resetTransform: () => void;
}

declare interface CanvasGradient {
    addColorStop(offset: number, color: string): void;
}

declare interface CanvasPattern {
    setTransform(transform?: DOMMatrix2DInit): void;
}

declare interface TextMetrics {
    width: number;
    actualBoundingBoxLeft: number;
    actualBoundingBoxRight: number;
    actualBoundingBoxAscent: number;
    actualBoundingBoxDescent: number;
    fontBoundingBoxAscent: number;
    fontBoundingBoxDescent: number;
}

declare interface ImageData {
    readonly width: number;
    readonly height: number;
    readonly data: Uint8ClampedArray;
}

declare interface Path2D {
    addPath(path: Path2D, transform?: DOMMatrix2DInit): void;
    closePath(): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
    ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
    rect(x: number, y: number, width: number, height: number): void;
}

declare type CanvasFillRule = 'nonzero' | 'evenodd';
declare type CanvasLineCap = 'butt' | 'round' | 'square';
declare type CanvasLineJoin = 'round' | 'bevel' | 'miter';
declare type CanvasTextAlign = 'start' | 'end' | 'left' | 'right' | 'center';
declare type CanvasTextBaseline = 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom';
declare type CanvasDirection = 'ltr' | 'rtl' | 'inherit';
declare type ImageSmoothingQuality = 'low' | 'medium' | 'high';
declare type GlobalCompositeOperation = 'source-over' | 'source-in' | 'source-out' | 'source-atop' | 'destination-over' | 'destination-in' | 'destination-out' | 'destination-atop' | 'lighter' | 'copy' | 'xor' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';
