import { RenderContext, RenderOptions, CanvasRenderer as ICanvasRenderer } from './types';

export class CanvasRenderer implements ICanvasRenderer {
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private zoom: number;
    private panX: number;
    private panY: number;

    constructor(options: {
        ctx: CanvasRenderingContext2D;
        width: number;
        height: number;
        zoom: number;
        panX: number;
        panY: number;
    }) {
        this.ctx = options.ctx;
        this.width = options.width;
        this.height = options.height;
        this.zoom = options.zoom;
        this.panX = options.panX;
        this.panY = options.panY;
    }

    public render(context: RenderContext): void {
        this.ctx = context.ctx;
        this.width = context.width;
        this.height = context.height;
        this.zoom = context.zoom;
        this.panX = context.panX;
        this.panY = context.panY;

        // Clear the canvas
        this.clear();

        // Apply global transformations
        this.applyTransform();
    }

    private clear(): void {
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.restore();
    }

    private applyTransform(): void {
        this.ctx.save();
        this.ctx.setTransform(
            this.zoom, 0,
            0, this.zoom,
            this.panX, this.panY
        );
    }

    public setSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
    }

    public destroy(): void {
        // Clean up any resources if needed
        this.ctx.restore(); // Restore any saved states
    }
}
