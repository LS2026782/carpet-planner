import { Room } from '../../models/Room';
import { Point } from '../canvas';

// Export components
export { RoomEditor } from './RoomEditor';
export { RoomList } from './RoomList';
export { RoomForm } from './RoomForm';

// Export shared interfaces
export interface RoomComponentOptions {
    container: HTMLElement;
}

export interface RoomEditorOptions extends RoomComponentOptions {
    gridSize: number;
}

export interface RoomEvents {
    'room:add': (room: Room) => void;
    'room:update': (room: Room) => void;
    'room:delete': (room: Room) => void;
    'room:select': (room: Room | null) => void;
    'preview:update': (room: Room | null) => void;
}

export interface RoomPoint extends Point {
    index: number;
    isSelected?: boolean;
}

export interface RoomDimensions {
    area: number;
    perimeter: number;
}

export interface RoomValidationResult {
    isValid: boolean;
    errors: string[];
}

// Export type guards
export function isValidRoomPoint(point: any): point is RoomPoint {
    return (
        typeof point === 'object' &&
        point !== null &&
        typeof point.x === 'number' &&
        typeof point.y === 'number' &&
        typeof point.index === 'number'
    );
}

export function isValidRoom(room: any): room is Room {
    return (
        room instanceof Room &&
        typeof room.id === 'string' &&
        Array.isArray(room.getPoints()) &&
        room.getPoints().length >= 3 &&
        room.getPoints().every((p: any) => 
            typeof p === 'object' &&
            p !== null &&
            typeof p.x === 'number' &&
            typeof p.y === 'number'
        )
    );
}

// Export utility functions
export function calculateRoomDimensions(room: Room): RoomDimensions {
    return {
        area: room.calculateArea(),
        perimeter: room.calculatePerimeter()
    };
}

export function validateRoom(room: Room): RoomValidationResult {
    const errors: string[] = [];
    const points = room.getPoints();

    if (points.length < 3) {
        errors.push('Room must have at least 3 points');
    }

    // Check for self-intersections
    for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        for (let k = i + 2; k < points.length; k++) {
            const l = (k + 1) % points.length;
            if (j !== k && i !== l) {
                if (doLineSegmentsIntersect(
                    points[i], points[j],
                    points[k], points[l]
                )) {
                    errors.push('Room walls cannot intersect');
                    break;
                }
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

// Helper function to check if two line segments intersect
function doLineSegmentsIntersect(
    p1: Point,
    p2: Point,
    p3: Point,
    p4: Point
): boolean {
    const denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    if (denominator === 0) return false;

    const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator;
    const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator;

    return ua > 0 && ua < 1 && ub > 0 && ub < 1;
}
