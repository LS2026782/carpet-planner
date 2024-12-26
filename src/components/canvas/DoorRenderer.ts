import { RenderContext, RenderOptions, Door, DoorRenderer as IDoorRenderer } from './types';

export class DoorRenderer implements IDoorRenderer {
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private zoom: number;
    private panX: number;
    private panY: number;
    private doors: Door[] = [];
    private selectedDoor: Door | null = null;
    private hoveredDoor: Door | null = null;
    private showMeasurements: boolean = true;

    constructor(options: {
        ctx: CanvasRenderingContext2D;
        width: number;
        height: number;
        zoom: number;
        panX: number;
        panY: number;
        doors: Door[];
    }) {
        this.ctx = options.ctx;
        this.width = options.width;
        this.height = options.height;
        this.zoom = options.zoom;
        this.panX = options.panX;
        this.panY = options.panY;
        this.doors = options.doors;
    }

    public render(context: RenderContext, options?: RenderOptions): void {
        this.ctx = context.ctx;
        this.width = context.width;
        this.height = context.height;
        this.zoom = context.zoom;
        this.panX = context.panX;
        this.panY = context.panY;

        if (options?.doors) {
            this.doors = options.doors;
        }

        this.renderDoors();
    }

    private renderDoors(): void {
        this.doors.forEach(door => {
            this.renderDoor(door);
        });
    }

    private renderDoor(door: Door): void {
        const { ctx } = this;
        ctx.save();

        // Transform context for door position and rotation
        ctx.translate(door.x * this.zoom + this.panX, door.y * this.zoom + this.panY);
        ctx.rotate(door.rotation * Math.PI / 180);

        // Draw door rectangle
        ctx.beginPath();
        ctx.rect(
            -door.width * this.zoom / 2,
            -door.height * this.zoom / 2,
            door.width * this.zoom,
            door.height * this.zoom
        );

        // Set styles based on selection/hover state
        if (door === this.selectedDoor) {
            ctx.strokeStyle = '#007bff';
        } else if (door === this.hoveredDoor) {
            ctx.strokeStyle = '#6c757d';
        } else {
            ctx.strokeStyle = '#000000';
        }

        ctx.stroke();

        // Draw measurements if enabled
        if (this.showMeasurements) {
            this.renderMeasurements(door);
        }

        ctx.restore();
    }

    private renderMeasurements(door: Door): void {
        const { ctx } = this;
        ctx.save();
        ctx.font = '12px Arial';
        ctx.fillStyle = '#666666';
        ctx.textAlign = 'center';

        // Width measurement
        const widthText = `${door.width}`;
        ctx.fillText(widthText, 0, door.height * this.zoom / 2 + 20);

        // Height measurement
        ctx.save();
        ctx.rotate(-Math.PI / 2);
        const heightText = `${door.height}`;
        ctx.fillText(heightText, 0, door.width * this.zoom / 2 + 20);
        ctx.restore();

        ctx.restore();
    }

    public setDoors(doors: Door[]): void {
        this.doors = doors;
    }

    public setSelectedDoor(door: Door | null): void {
        this.selectedDoor = door;
    }

    public setHoveredDoor(door: Door | null): void {
        this.hoveredDoor = door;
    }

    public setShowMeasurements(show: boolean): void {
        this.showMeasurements = show;
    }

    public destroy(): void {
        // Clean up any resources if needed
    }
}
