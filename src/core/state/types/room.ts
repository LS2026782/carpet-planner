import { GeometryObject, Point2D, Transform2D } from '../../types/geometry';
import { ObjectMetadata } from '../../commands/types';

export interface RoomPoint extends Point2D {
    id: string;
    isSelected?: boolean;
    isHovered?: boolean;
}

export interface RoomMeasurements {
    area: number;
    perimeter: number;
    width: number;
    height: number;
    diagonal: number;
}

export interface RoomStyle {
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    opacity?: number;
    dashPattern?: number[];
    fillPattern?: string;
}

export interface RoomValidation {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface Room {
    id: string;
    name?: string;
    points: RoomPoint[];
    geometry: GeometryObject;
    transform?: Transform2D;
    metadata: ObjectMetadata;
    style?: RoomStyle;
    measurements?: RoomMeasurements;
    validation?: RoomValidation;
    groupId?: string | null;
    isSelected?: boolean;
    isHovered?: boolean;
    isEditing?: boolean;
    isDrawing?: boolean;
    isResizing?: boolean;
    isRotating?: boolean;
    isMoving?: boolean;
    isDragging?: boolean;
    isLocked?: boolean;
    isVisible?: boolean;
    zIndex?: number;
    tags?: string[];
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface RoomState {
    rooms: { [id: string]: Room };
    selectedRoomId: string | null;
    hoveredRoomId: string | null;
    selectedPointId: string | null;
    hoveredPointId: string | null;
    isDrawing: boolean;
    drawingPoints: RoomPoint[];
}

export interface RoomDrawingState {
    isDrawing: boolean;
    points: RoomPoint[];
    currentPoint: Point2D | null;
    isValid: boolean;
    errors: string[];
}

export interface RoomEditingState {
    isEditing: boolean;
    originalPoints: RoomPoint[];
    currentPoints: RoomPoint[];
    selectedPointId: string | null;
    isValid: boolean;
    errors: string[];
}

export interface RoomTransformState {
    isTransforming: boolean;
    originalTransform: Transform2D;
    currentTransform: Transform2D;
    transformType: 'move' | 'rotate' | 'scale' | null;
    transformOrigin: Point2D | null;
    transformStart: Point2D | null;
    isValid: boolean;
    errors: string[];
}

export interface RoomSelectionState {
    selectedRoomId: string | null;
    selectedPointId: string | null;
    hoveredRoomId: string | null;
    hoveredPointId: string | null;
    selectionBox: {
        start: Point2D | null;
        end: Point2D | null;
    };
}

export interface RoomHistoryState {
    undoStack: Room[];
    redoStack: Room[];
    currentIndex: number;
    maxSize: number;
}

export interface RoomPreferences {
    defaultStyle: RoomStyle;
    snapToGrid: boolean;
    gridSize: number;
    minPointDistance: number;
    maxPoints: number;
    autoClose: boolean;
    showMeasurements: boolean;
    showValidation: boolean;
    measurementUnit: 'inches' | 'feet' | 'meters' | 'centimeters';
    measurementPrecision: number;
}

// Helper functions
export function isValidRoom(room: Room): RoomValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!room.id) errors.push('Room ID is required');
    if (!room.points || !Array.isArray(room.points)) errors.push('Room points must be an array');
    if (!room.geometry) errors.push('Room geometry is required');
    if (!room.metadata) errors.push('Room metadata is required');

    // Check points
    if (room.points) {
        if (room.points.length < 3) {
            errors.push('Room must have at least 3 points');
        }

        // Check for duplicate points
        const duplicates = room.points.filter((point, index, array) =>
            array.findIndex(p => p.x === point.x && p.y === point.y) !== index
        );
        if (duplicates.length > 0) {
            warnings.push('Room has duplicate points');
        }

        // Check for self-intersections
        if (hasSelfIntersections(room.points)) {
            errors.push('Room has self-intersections');
        }
    }

    // Check style
    if (room.style) {
        if (!isValidColor(room.style.fillColor)) {
            errors.push('Invalid fill color');
        }
        if (!isValidColor(room.style.strokeColor)) {
            errors.push('Invalid stroke color');
        }
        if (typeof room.style.strokeWidth !== 'number' || room.style.strokeWidth < 0) {
            errors.push('Invalid stroke width');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

function isValidColor(color: string): boolean {
    // Basic color validation (hex, rgb, rgba)
    return /^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$|^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$|^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/.test(color);
}

function hasSelfIntersections(points: Point2D[]): boolean {
    // Check for self-intersections using line segment intersection
    for (let i = 0; i < points.length; i++) {
        const a1 = points[i];
        const a2 = points[(i + 1) % points.length];

        for (let j = i + 2; j < points.length; j++) {
            const b1 = points[j];
            const b2 = points[(j + 1) % points.length];

            if (doLinesIntersect(a1, a2, b1, b2)) {
                return true;
            }
        }
    }
    return false;
}

function doLinesIntersect(a1: Point2D, a2: Point2D, b1: Point2D, b2: Point2D): boolean {
    const det = (a2.x - a1.x) * (b2.y - b1.y) - (b2.x - b1.x) * (a2.y - a1.y);
    if (det === 0) return false;

    const lambda = ((b2.y - b1.y) * (b2.x - a1.x) + (b1.x - b2.x) * (b2.y - a1.y)) / det;
    const gamma = ((a1.y - a2.y) * (b2.x - a1.x) + (a2.x - a1.x) * (b2.y - a1.y)) / det;

    return lambda > 0 && lambda < 1 && gamma > 0 && gamma < 1;
}
