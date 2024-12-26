import { Room } from '../models/Room';
import { Door } from '../models/Door';
import { Point2D } from '../components/canvas/types';
import { EventEmitter } from '../utils/EventEmitter';
import { ValidationError, ErrorSeverity } from '../types/errors';

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

interface ValidationManagerEvents {
    validationError: ValidationError;
}

export class ValidationManager extends EventEmitter<ValidationManagerEvents> {
    private readonly MIN_ROOM_AREA = 100; // square pixels
    private readonly MIN_DOOR_WIDTH = 24; // inches
    private readonly MAX_DOOR_WIDTH = 48; // inches
    private readonly MIN_DOOR_HEIGHT = 72; // inches
    private readonly MAX_DOOR_HEIGHT = 96; // inches
    private readonly WALL_SNAP_THRESHOLD = 5; // pixels

    private createValidationError(field: string, message: string, code: string, severity: ErrorSeverity = 'error'): ValidationError {
        const error: ValidationError = { field, message, code, severity };
        this.emit('validationError', error);
        return error;
    }

    validateRoom(room: Room): ValidationResult {
        const errors: ValidationError[] = [];
        const points = room.getPoints();

        // Check minimum points
        if (points.length < 3) {
            errors.push(this.createValidationError(
                'points',
                'Room must have at least 3 points',
                'ROOM_MIN_POINTS'
            ));
            return { isValid: false, errors };
        }

        // Check area
        const area = room.calculateArea();
        if (area < this.MIN_ROOM_AREA) {
            errors.push(this.createValidationError(
                'area',
                `Room area must be at least ${this.MIN_ROOM_AREA} square pixels`,
                'ROOM_MIN_AREA'
            ));
        }

        // Check for self-intersecting edges
        if (this.hasIntersectingEdges(points)) {
            errors.push(this.createValidationError(
                'edges',
                'Room edges must not intersect',
                'ROOM_INTERSECTING_EDGES'
            ));
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validatePointMove(room: Room, point: Point2D, newPosition: Point2D): ValidationResult {
        const errors: ValidationError[] = [];
        const points = room.getPoints();

        // Check if point exists in room
        const pointIndex = points.findIndex(p => p.x === point.x && p.y === point.y);
        if (pointIndex === -1) {
            errors.push(this.createValidationError(
                'point',
                'Point not found in room',
                'POINT_NOT_FOUND'
            ));
            return { isValid: false, errors };
        }

        // Create new points array with moved point
        const newPoints = [...points];
        newPoints[pointIndex] = newPosition;

        // Check if new configuration would create intersections
        if (this.hasIntersectingEdges(newPoints)) {
            errors.push(this.createValidationError(
                'edges',
                'Moving point would create intersecting edges',
                'POINT_MOVE_INTERSECTION'
            ));
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateDoorPosition(door: Door, room: Room): ValidationResult {
        const errors: ValidationError[] = [];
        const doorPosition = door.getPosition();
        const roomPoints = room.getPoints();

        // Check if door is on a wall
        let onWall = false;
        for (let i = 0; i < roomPoints.length; i++) {
            const start = roomPoints[i];
            const end = roomPoints[(i + 1) % roomPoints.length];
            if (this.isPointOnLineSegment(doorPosition, start, end, this.WALL_SNAP_THRESHOLD)) {
                onWall = true;
                break;
            }
        }

        if (!onWall) {
            errors.push(this.createValidationError(
                'position',
                'Door must be placed on a room wall',
                'DOOR_NOT_ON_WALL'
            ));
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateDoorRotation(door: Door, angle: number): ValidationResult {
        const errors: ValidationError[] = [];

        // Check if angle is a multiple of 90 degrees
        if (Math.abs(angle % 90) > 0.1) { // Allow small floating point errors
            errors.push(this.createValidationError(
                'rotation',
                'Door must be rotated in 90-degree increments',
                'DOOR_INVALID_ROTATION'
            ));
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateDoorSize(door: Door, width: number, height: number): ValidationResult {
        const errors: ValidationError[] = [];

        if (width < this.MIN_DOOR_WIDTH || width > this.MAX_DOOR_WIDTH) {
            errors.push(this.createValidationError(
                'width',
                `Door width must be between ${this.MIN_DOOR_WIDTH} and ${this.MAX_DOOR_WIDTH} inches`,
                'DOOR_INVALID_WIDTH'
            ));
        }

        if (height < this.MIN_DOOR_HEIGHT || height > this.MAX_DOOR_HEIGHT) {
            errors.push(this.createValidationError(
                'height',
                `Door height must be between ${this.MIN_DOOR_HEIGHT} and ${this.MAX_DOOR_HEIGHT} inches`,
                'DOOR_INVALID_HEIGHT'
            ));
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    private hasIntersectingEdges(points: Point2D[]): boolean {
        for (let i = 0; i < points.length; i++) {
            const a1 = points[i];
            const a2 = points[(i + 1) % points.length];

            for (let j = i + 2; j < points.length; j++) {
                const b1 = points[j];
                const b2 = points[(j + 1) % points.length];

                if (this.doLineSegmentsIntersect(a1, a2, b1, b2)) {
                    return true;
                }
            }
        }
        return false;
    }

    private doLineSegmentsIntersect(a1: Point2D, a2: Point2D, b1: Point2D, b2: Point2D): boolean {
        const det = (a2.x - a1.x) * (b2.y - b1.y) - (b2.x - b1.x) * (a2.y - a1.y);
        if (det === 0) return false;

        const lambda = ((b2.y - b1.y) * (b2.x - a1.x) + (b1.x - b2.x) * (b2.y - a1.y)) / det;
        const gamma = ((a1.y - a2.y) * (b2.x - a1.x) + (a2.x - a1.x) * (b2.y - a1.y)) / det;

        return (lambda > 0 && lambda < 1) && (gamma > 0 && gamma < 1);
    }

    private isPointOnLineSegment(point: Point2D, start: Point2D, end: Point2D, threshold: number): boolean {
        const d = this.distanceToLineSegment(point, start, end);
        return d <= threshold;
    }

    private distanceToLineSegment(point: Point2D, start: Point2D, end: Point2D): number {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) return Math.sqrt(
            Math.pow(point.x - start.x, 2) + 
            Math.pow(point.y - start.y, 2)
        );

        const t = Math.max(0, Math.min(1, (
            (point.x - start.x) * dx +
            (point.y - start.y) * dy
        ) / (length * length)));

        const projectionX = start.x + t * dx;
        const projectionY = start.y + t * dy;

        return Math.sqrt(
            Math.pow(point.x - projectionX, 2) +
            Math.pow(point.y - projectionY, 2)
        );
    }
}
