import { RenderContext, RenderOptions, Room, RoomPoint, RoomRenderer as IRoomRenderer } from './types';

export class RoomRenderer implements IRoomRenderer {
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private zoom: number;
    private panX: number;
    private panY: number;
    private rooms: Room[] = [];
    private selectedRoom: Room | null = null;
    private selectedPoint: RoomPoint | null = null;
    private hoveredPoint: RoomPoint | null = null;
    private showMeasurements: boolean = true;
    private previewPoints: RoomPoint[] | null = null;

    constructor(options: {
        ctx: CanvasRenderingContext2D;
        width: number;
        height: number;
        zoom: number;
        panX: number;
        panY: number;
        rooms: Room[];
    }) {
        this.ctx = options.ctx;
        this.width = options.width;
        this.height = options.height;
        this.zoom = options.zoom;
        this.panX = options.panX;
        this.panY = options.panY;
        this.rooms = options.rooms;
    }

    public render(context: RenderContext, options?: RenderOptions): void {
        this.ctx = context.ctx;
        this.width = context.width;
        this.height = context.height;
        this.zoom = context.zoom;
        this.panX = context.panX;
        this.panY = context.panY;

        if (options?.rooms) {
            this.rooms = options.rooms;
        }

        // Render existing rooms
        this.renderRooms();

        // Render preview if available
        if (this.previewPoints && this.previewPoints.length > 0) {
            this.renderPreview();
        }

        // Render points for selected room
        if (this.selectedRoom) {
            this.renderRoomPoints(this.selectedRoom);
        }
    }

    private renderRooms(): void {
        this.rooms.forEach(room => {
            this.renderRoom(room);
        });
    }

    private renderRoom(room: Room): void {
        const { ctx } = this;
        ctx.save();

        // Fill
        ctx.beginPath();
        room.points.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.closePath();
        ctx.fillStyle = room === this.selectedRoom ? 'rgba(0, 123, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)';
        ctx.fill();

        // Stroke
        ctx.lineWidth = room === this.selectedRoom ? 2 : 1;
        ctx.strokeStyle = room === this.selectedRoom ? '#007bff' : '#333';
        ctx.stroke();

        ctx.restore();
    }

    private renderPreview(): void {
        if (!this.previewPoints || this.previewPoints.length === 0) return;

        const { ctx } = this;
        ctx.save();

        // Draw lines
        ctx.beginPath();
        this.previewPoints.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();

        // Draw points
        this.previewPoints.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#007bff';
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        ctx.restore();
    }

    private renderRoomPoints(room: Room): void {
        const { ctx } = this;
        ctx.save();

        room.points.forEach(point => {
            const isSelected = this.selectedPoint === point;
            const isHovered = this.hoveredPoint === point;

            ctx.beginPath();
            ctx.arc(point.x, point.y, isSelected || isHovered ? 6 : 4, 0, Math.PI * 2);
            ctx.fillStyle = isSelected ? '#007bff' : (isHovered ? '#4dabf7' : '#fff');
            ctx.fill();
            ctx.strokeStyle = '#007bff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        ctx.restore();
    }

    private transformPoint(point: RoomPoint): { x: number; y: number } {
        return {
            x: point.x * this.zoom + this.panX,
            y: point.y * this.zoom + this.panY
        };
    }

    public setRooms(rooms: Room[]): void {
        this.rooms = rooms;
    }

    public setSelectedRoom(room: Room | null): void {
        this.selectedRoom = room;
    }

    public setSelectedPoint(point: RoomPoint | null): void {
        this.selectedPoint = point;
    }

    public setHoveredPoint(point: RoomPoint | null): void {
        this.hoveredPoint = point;
    }

    public setPreviewPoints(points: RoomPoint[] | null): void {
        this.previewPoints = points;
    }

    public setShowMeasurements(show: boolean): void {
        this.showMeasurements = show;
    }

    public destroy(): void {
        // Clean up any resources if needed
    }
}
