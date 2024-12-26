import {
    CommandValidator as ICommandValidator,
    Command,
    CommandContext,
    ValidationResult,
    RoomCommandPayload,
    DoorCommandPayload,
    TransformCommandPayload,
    GroupCommandPayload
} from './types';
import { GeometryObject, Point2D } from '../types/geometry';

interface ValidatableRoom {
    id: string;
    geometry: GeometryObject;
    metadata: {
        name?: string;
    };
}

interface ValidatableDoor {
    id: string;
    geometry: GeometryObject;
    metadata: {
        name?: string;
    };
}

interface ValidatableState {
    rooms: {
        rooms: { [id: string]: ValidatableRoom };
    };
    doors: {
        doors: { [id: string]: ValidatableDoor };
    };
}

export class CommandValidator implements ICommandValidator {
    async validate(command: Command, context: CommandContext): Promise<ValidationResult> {
        const commandName = command.constructor.name;
        
        switch (commandName) {
            case 'AddRoomCommand':
                return this.validateAddRoom(command as any, context);
            case 'AddDoorCommand':
                return this.validateAddDoor(command as any, context);
            case 'TransformObjectsCommand':
                return this.validateTransformObjects(command as any, context);
            case 'GroupObjectsCommand':
                return this.validateGroupObjects(command as any, context);
            default:
                return { isValid: true, errors: [] };
        }
    }

    private async validateAddRoom(command: { payload: RoomCommandPayload }, context: CommandContext): Promise<ValidationResult> {
        const errors: string[] = [];
        const { geometry } = command.payload;
        const state = context.state as ValidatableState;

        // Validate geometry
        if (!this.isValidPolygon(geometry)) {
            errors.push('Invalid room geometry: Room must be a valid polygon with at least 3 points');
        }

        // Check for self-intersections
        if (this.hasSelfIntersections(geometry)) {
            errors.push('Invalid room geometry: Room polygon has self-intersections');
        }

        // Check for overlaps with existing rooms
        const existingRooms = Object.values(state.rooms.rooms);
        for (const room of existingRooms) {
            if (this.geometriesOverlap(geometry, room.geometry)) {
                errors.push(`Room overlaps with existing room ${room.metadata.name || room.id}`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    private async validateAddDoor(command: { payload: DoorCommandPayload }, context: CommandContext): Promise<ValidationResult> {
        const errors: string[] = [];
        const { geometry, roomId } = command.payload;
        const state = context.state as ValidatableState;

        // Validate door dimensions
        if (geometry.type !== 'rect') {
            errors.push('Invalid door geometry: Door must be a rectangle');
        }

        // If roomId is provided, validate door placement
        if (roomId) {
            const room = state.rooms.rooms[roomId];
            if (!room) {
                errors.push(`Room with id ${roomId} not found`);
            } else if (!this.isDoorOnWall(geometry, room.geometry)) {
                errors.push('Door must be placed on a room wall');
            }
        }

        // Check for overlaps with existing doors
        const existingDoors = Object.values(state.doors.doors);
        for (const door of existingDoors) {
            if (this.geometriesOverlap(geometry, door.geometry)) {
                errors.push(`Door overlaps with existing door ${door.metadata.name || door.id}`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    private async validateTransformObjects(command: { payload: TransformCommandPayload }, context: CommandContext): Promise<ValidationResult> {
        const errors: string[] = [];
        const { objectIds, transform } = command.payload;
        const state = context.state as ValidatableState;

        // Validate object existence
        for (const id of objectIds) {
            const room = state.rooms.rooms[id];
            const door = state.doors.doors[id];
            if (!room && !door) {
                errors.push(`Object with id ${id} not found`);
            }
        }

        // Validate transform values
        if (transform.scale) {
            if (transform.scale.x <= 0 || transform.scale.y <= 0) {
                errors.push('Scale values must be positive');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    private async validateGroupObjects(command: { payload: GroupCommandPayload }, context: CommandContext): Promise<ValidationResult> {
        const errors: string[] = [];
        const { objectIds } = command.payload;
        const state = context.state as ValidatableState;

        if (objectIds.length < 2) {
            errors.push('A group must contain at least 2 objects');
        }

        // Validate object existence and adjacency
        const objects: { id: string; geometry: GeometryObject }[] = [];
        for (const id of objectIds) {
            const room = state.rooms.rooms[id];
            const door = state.doors.doors[id];
            if (!room && !door) {
                errors.push(`Object with id ${id} not found`);
            } else {
                objects.push({
                    id,
                    geometry: room ? room.geometry : door!.geometry
                });
            }
        }

        // Check if objects form a connected group
        if (!this.isConnectedGroup(objects)) {
            errors.push('All objects in a group must be connected');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Geometry validation helpers
    private isValidPolygon(geometry: GeometryObject): boolean {
        if (geometry.type !== 'polygon') return false;
        const points = (geometry.data as { points: Point2D[] }).points;
        return points.length >= 3;
    }

    private hasSelfIntersections(geometry: GeometryObject): boolean {
        // Implement line segment intersection check
        // This is a simplified check - you might want to use a more robust algorithm
        if (geometry.type !== 'polygon') return false;
        const points = (geometry.data as { points: Point2D[] }).points;
        
        for (let i = 0; i < points.length; i++) {
            const a1 = points[i];
            const a2 = points[(i + 1) % points.length];
            
            for (let j = i + 2; j < points.length; j++) {
                const b1 = points[j];
                const b2 = points[(j + 1) % points.length];
                
                if (this.lineSegmentsIntersect(a1, a2, b1, b2)) {
                    return true;
                }
            }
        }
        
        return false;
    }

    private geometriesOverlap(geom1: GeometryObject, geom2: GeometryObject): boolean {
        // Implement bounding box check first, then detailed intersection check
        // This is a simplified check - you might want to use a more robust algorithm
        const bbox1 = this.getBoundingBox(geom1);
        const bbox2 = this.getBoundingBox(geom2);
        
        return !(
            bbox1.max.x < bbox2.min.x ||
            bbox1.min.x > bbox2.max.x ||
            bbox1.max.y < bbox2.min.y ||
            bbox1.min.y > bbox2.max.y
        );
    }

    private isDoorOnWall(doorGeom: GeometryObject, roomGeom: GeometryObject): boolean {
        // Implement door-wall intersection check
        // This is a simplified check - you might want to use a more robust algorithm
        if (roomGeom.type !== 'polygon') return false;
        const points = (roomGeom.data as { points: Point2D[] }).points;
        
        // Get door center point
        const doorCenter = this.getGeometryCenter(doorGeom);
        
        // Check if door center is close to any wall
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            
            if (this.pointToLineDistance(doorCenter, p1, p2) < 0.1) { // Threshold value
                return true;
            }
        }
        
        return false;
    }

    private isConnectedGroup(objects: { id: string; geometry: GeometryObject }[]): boolean {
        if (objects.length < 2) return true;
        
        const visited = new Set<string>();
        const stack = [objects[0].id];
        
        while (stack.length > 0) {
            const currentId = stack.pop()!;
            visited.add(currentId);
            
            const current = objects.find(obj => obj.id === currentId)!;
            
            for (const obj of objects) {
                if (!visited.has(obj.id) && this.geometriesOverlap(current.geometry, obj.geometry)) {
                    stack.push(obj.id);
                }
            }
        }
        
        return visited.size === objects.length;
    }

    // Geometry utility functions
    private lineSegmentsIntersect(a1: Point2D, a2: Point2D, b1: Point2D, b2: Point2D): boolean {
        const det = (a2.x - a1.x) * (b2.y - b1.y) - (b2.x - b1.x) * (a2.y - a1.y);
        if (det === 0) return false;
        
        const lambda = ((b2.y - b1.y) * (b2.x - a1.x) + (b1.x - b2.x) * (b2.y - a1.y)) / det;
        const gamma = ((a1.y - a2.y) * (b2.x - a1.x) + (a2.x - a1.x) * (b2.y - a1.y)) / det;
        
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }

    private getBoundingBox(geometry: GeometryObject): { min: Point2D; max: Point2D } {
        let points: Point2D[] = [];
        
        switch (geometry.type) {
            case 'point':
                points = [geometry.data as Point2D];
                break;
            case 'line':
                points = [
                    (geometry.data as { start: Point2D; end: Point2D }).start,
                    (geometry.data as { start: Point2D; end: Point2D }).end
                ];
                break;
            case 'rect':
                const rect = geometry.data as { x: number; y: number; width: number; height: number };
                points = [
                    { x: rect.x, y: rect.y },
                    { x: rect.x + rect.width, y: rect.y },
                    { x: rect.x + rect.width, y: rect.y + rect.height },
                    { x: rect.x, y: rect.y + rect.height }
                ];
                break;
            case 'polygon':
                points = (geometry.data as { points: Point2D[] }).points;
                break;
            default:
                throw new Error(`Unsupported geometry type: ${geometry.type}`);
        }
        
        const min = { x: Infinity, y: Infinity };
        const max = { x: -Infinity, y: -Infinity };
        
        for (const point of points) {
            min.x = Math.min(min.x, point.x);
            min.y = Math.min(min.y, point.y);
            max.x = Math.max(max.x, point.x);
            max.y = Math.max(max.y, point.y);
        }
        
        return { min, max };
    }

    private getGeometryCenter(geometry: GeometryObject): Point2D {
        const bbox = this.getBoundingBox(geometry);
        return {
            x: (bbox.min.x + bbox.max.x) / 2,
            y: (bbox.min.y + bbox.max.y) / 2
        };
    }

    private pointToLineDistance(point: Point2D, lineStart: Point2D, lineEnd: Point2D): number {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        
        if (lenSq !== 0) {
            param = dot / lenSq;
        }
        
        let xx, yy;
        
        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }
        
        const dx = point.x - xx;
        const dy = point.y - yy;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
}

export const commandValidator = new CommandValidator();
