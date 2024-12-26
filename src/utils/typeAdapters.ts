import { Room as ModelRoom, RoomData } from '../models/Room';
import { Door as ModelDoor, DoorData } from '../models/Door';
import { Room as CanvasRoom, Door as CanvasDoor, Point2D, RoomPoint } from '../components/canvas/types';

/**
 * Converts a model Room to a canvas Room
 */
export function adaptRoomToCanvas(room: ModelRoom | null): CanvasRoom | null {
    if (!room) return null;

    return {
        id: room.getId(),
        points: room.getPoints().map((point, index) => ({
            id: `${room.getId()}-point-${index}`,
            x: point.x,
            y: point.y
        })),
        isSelected: false, // These will be managed by the canvas components
        isHovered: false,
        isValid: true
    };
}

/**
 * Converts an array of model Rooms to canvas Rooms
 */
export function adaptRoomsToCanvas(rooms: ModelRoom[]): CanvasRoom[] {
    return rooms.map(room => adaptRoomToCanvas(room)!);
}

/**
 * Converts a model Door to a canvas Door
 */
export function adaptDoorToCanvas(door: ModelDoor | null): CanvasDoor | null {
    if (!door) return null;

    const position = door.getPosition();
    const dimensions = door.getDimensions();
    
    return {
        id: door.getId(),
        x: position.x,
        y: position.y,
        width: dimensions.width,
        height: dimensions.height,
        rotation: door.getAngle(),
        isSelected: false, // These will be managed by the canvas components
        isHovered: false,
        isValid: true
    };
}

/**
 * Converts an array of model Doors to canvas Doors
 */
export function adaptDoorsToCanvas(doors: ModelDoor[]): CanvasDoor[] {
    return doors.map(door => adaptDoorToCanvas(door)!);
}

/**
 * Converts canvas points to room points
 */
export function adaptPointsToRoomPoints(points: Point2D[]): RoomPoint[] {
    return points.map((point, index) => ({
        ...point,
        id: `point-${index}`
    }));
}

/**
 * Converts room points to canvas points
 */
export function adaptRoomPointsToPoints(points: RoomPoint[]): Point2D[] {
    return points.map(point => ({
        x: point.x,
        y: point.y
    }));
}

/**
 * Converts a canvas Room to a model Room
 */
export function adaptCanvasToRoom(room: CanvasRoom): ModelRoom {
    const roomData: RoomData = {
        id: room.id,
        points: adaptRoomPointsToPoints(room.points)
    };
    return new ModelRoom(roomData);
}

/**
 * Converts a canvas Door to a model Door
 */
export function adaptCanvasToDoor(door: CanvasDoor): ModelDoor {
    const modelDoor = new ModelDoor(door.id, { x: door.x, y: door.y });
    modelDoor.setDimensions(door.width, door.height);
    modelDoor.setAngle(door.rotation);
    return modelDoor;
}
