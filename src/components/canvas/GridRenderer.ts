import { RenderContext, RenderOptions, GridRenderer as IGridRenderer } from './types';

export class GridRenderer implements IGridRenderer {
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private zoom: number;
    private panX: number;
    private panY: number;
    private gridSize: number;

    constructor(options: {
        ctx: CanvasRenderingContext2D;
        width: number;
        height: number;
        zoom: number;
        panX: number;
        panY: number;
        gridSize: number;
    }) {
        this.ctx = options.ctx;
        this.width = options.width;
        this.height = options.height;
        this.zoom = options.zoom;
        this.panX = options.panX;
        this.panY = options.panY;
        this.gridSize = options.gridSize;
    }

    public render(context: RenderContext): void {
        this.ctx = context.ctx;
        this.width = context.width;
        this.height = context.height;
        this.zoom = context.zoom;
        this.panX = context.panX;
        this.panY = context.panY;

        this.renderGrid();
    }

    private renderGrid(): void {
        const { ctx } = this;
        ctx.save();

        // Set grid style
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 0.5;

        // Calculate grid boundaries
        const startX = Math.floor(-this.panX / this.zoom / this.gridSize) * this.gridSize;
        const startY = Math.floor(-this.panY / this.zoom / this.gridSize) * this.gridSize;
        const endX = Math.ceil((this.width - this.panX) / this.zoom / this.gridSize) * this.gridSize;
        const endY = Math.ceil((this.height - this.panY) / this.zoom / this.gridSize) * this.gridSize;

        // Draw vertical lines
        for (let x = startX; x <= endX; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, startY);
            ctx.lineTo(x, endY);
            ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = startY; y <= endY; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
        }

        // Draw major grid lines
        const majorGridSize = this.gridSize * 5;
        ctx.strokeStyle = '#c0c0c0';
        ctx.lineWidth = 1;

        // Draw major vertical lines
        for (let x = startX; x <= endX; x += majorGridSize) {
            ctx.beginPath();
            ctx.moveTo(x, startY);
            ctx.lineTo(x, endY);
            ctx.stroke();
        }

        // Draw major horizontal lines
        for (let y = startY; y <= endY; y += majorGridSize) {
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
        }

        ctx.restore();
    }

    public setGridSize(size: number): void {
        this.gridSize = size;
    }

    public setSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
    }

    public destroy(): void {
        // Clean up any resources if needed
    }
}
