export interface Point2D {
    x: number;
    y: number;
}

// Alias for backward compatibility
export type Point = Point2D;

export interface RoomPoint extends Point2D {
    id: string;
}

export interface Transform {
    scale: number;
    offset: Point2D;
}

export interface RenderContext {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    zoom: number;
    panX: number;
    panY: number;
    transform: Transform;
    offset: Point2D;
    scale: number;
}

export interface RenderOptions {
    strokeStyle?: string;
    fillStyle?: string;
    lineWidth?: number;
    lineDash?: number[];
    font?: string;
    showMeasurements?: boolean;
    rooms?: Room[];
    doors?: Door[];
    selectedRoom?: Room | null;
    selectedDoor?: Door | null;
    previewPoints?: Point2D[] | null;
}

export interface Room {
    id: string;
    points: RoomPoint[];
    isSelected?: boolean;
    isHovered?: boolean;
    isValid?: boolean;
}

export interface Door {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    isSelected?: boolean;
    isHovered?: boolean;
    isValid?: boolean;
}

export interface BaseRendererOptions {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    zoom: number;
    panX: number;
    panY: number;
}

export interface CanvasRendererOptions extends BaseRendererOptions {}

export interface GridRendererOptions extends BaseRendererOptions {
    gridSize: number;
}

export interface RoomRendererOptions extends BaseRendererOptions {
    rooms: Room[];
    selectedRoom?: Room | null;
    selectedPoint?: RoomPoint | null;
    hoveredPoint?: RoomPoint | null;
    showMeasurements?: boolean;
}

export interface DoorRendererOptions extends BaseRendererOptions {
    doors: Door[];
    selectedDoor?: Door | null;
    hoveredDoor?: Door | null;
    showMeasurements?: boolean;
}

export interface MeasurementRendererOptions extends BaseRendererOptions {
    units: 'meters' | 'feet';
    precision: number;
    showLabels: boolean;
}

export interface Renderer {
    render(context: RenderContext, options?: RenderOptions): void;
    destroy(): void;
}

export interface CanvasRenderer extends Renderer {
    setSize(width: number, height: number): void;
}

export interface GridRenderer extends Renderer {
    setGridSize(size: number): void;
    setSize(width: number, height: number): void;
}

export interface RoomRenderer extends Renderer {
    setRooms(rooms: Room[]): void;
    setSelectedRoom(room: Room | null): void;
    setSelectedPoint(point: RoomPoint | null): void;
    setHoveredPoint(point: RoomPoint | null): void;
    setShowMeasurements(show: boolean): void;
    setPreviewPoints(points: Point2D[] | null): void;
}

export interface DoorRenderer extends Renderer {
    setDoors(doors: Door[]): void;
    setSelectedDoor(door: Door | null): void;
    setHoveredDoor(door: Door | null): void;
    setShowMeasurements(show: boolean): void;
}

export interface MeasurementRenderer extends Renderer {
    setUnits(units: 'meters' | 'feet'): void;
    setPrecision(precision: number): void;
    setShowLabels(show: boolean): void;
}
