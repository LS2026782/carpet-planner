import { RenderContext, RenderOptions, MeasurementRenderer as IMeasurementRenderer } from './types';

export class MeasurementRenderer implements IMeasurementRenderer {
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private zoom: number;
    private panX: number;
    private panY: number;
    private units: 'meters' | 'feet';
    private precision: number;
    private showLabels: boolean;

    constructor(options: {
        ctx: CanvasRenderingContext2D;
        width: number;
        height: number;
        zoom: number;
        panX: number;
        panY: number;
        units: 'meters' | 'feet';
        precision: number;
        showLabels: boolean;
    }) {
        this.ctx = options.ctx;
        this.width = options.width;
        this.height = options.height;
        this.zoom = options.zoom;
        this.panX = options.panX;
        this.panY = options.panY;
        this.units = options.units;
        this.precision = options.precision;
        this.showLabels = options.showLabels;
    }

    public render(context: RenderContext): void {
        this.ctx = context.ctx;
        this.width = context.width;
        this.height = context.height;
        this.zoom = context.zoom;
        this.panX = context.panX;
        this.panY = context.panY;

        if (this.showLabels) {
            this.renderRulers();
        }
    }

    private renderRulers(): void {
        const { ctx } = this;
        ctx.save();

        // Set ruler style
        ctx.strokeStyle = '#666666';
        ctx.fillStyle = '#666666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Calculate ruler boundaries
        const startX = Math.floor(-this.panX / this.zoom / 100) * 100;
        const startY = Math.floor(-this.panY / this.zoom / 100) * 100;
        const endX = Math.ceil((this.width - this.panX) / this.zoom / 100) * 100;
        const endY = Math.ceil((this.height - this.panY) / this.zoom / 100) * 100;

        // Draw horizontal ruler
        for (let x = startX; x <= endX; x += 100) {
            const screenX = x * this.zoom + this.panX;
            ctx.beginPath();
            ctx.moveTo(screenX, 0);
            ctx.lineTo(screenX, 10);
            ctx.stroke();

            const value = this.formatMeasurement(x / 100);
            ctx.fillText(value, screenX, 20);
        }

        // Draw vertical ruler
        ctx.textAlign = 'right';
        for (let y = startY; y <= endY; y += 100) {
            const screenY = y * this.zoom + this.panY;
            ctx.beginPath();
            ctx.moveTo(0, screenY);
            ctx.lineTo(10, screenY);
            ctx.stroke();

            const value = this.formatMeasurement(y / 100);
            ctx.fillText(value, 20, screenY);
        }

        ctx.restore();
    }

    private formatMeasurement(value: number): string {
        const converted = this.units === 'feet' ? value * 3.28084 : value;
        return `${converted.toFixed(this.precision)}${this.units === 'feet' ? "'" : 'm'}`;
    }

    public setUnits(units: 'meters' | 'feet'): void {
        this.units = units;
    }

    public setPrecision(precision: number): void {
        this.precision = precision;
    }

    public setShowLabels(show: boolean): void {
        this.showLabels = show;
    }

    public destroy(): void {
        // Clean up any resources if needed
    }
}
