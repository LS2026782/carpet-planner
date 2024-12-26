import { Room, RoomData } from '../models/Room';
import { Point2D } from '../components/canvas/types';
import { EventEmitter } from '../utils/EventEmitter';
import { ValidationManager } from './ValidationManager';
import { v4 as uuidv4 } from 'uuid';

interface RoomManagerEvents {
    roomAdded: Room;
    roomRemoved: Room;
    roomUpdated: Room;
    selectionChanged: Room | null;
    hoverChanged: Room | null;
    previewChanged: Point2D[] | null;
    preview: Point2D[] | null;
}

export class RoomManager extends EventEmitter<RoomManagerEvents> {
    private rooms: Map<string, Room>;
    private selectedRoom: Room | null;
    private hoveredRoom: Room | null;
    private previewPoints: Point2D[] | null;
    private validationManager: ValidationManager;
    private readonly POINT_SELECTION_THRESHOLD = 10; // pixels
    private readonly GRID_SIZE = 20; // pixels

    constructor(validationManager: ValidationManager) {
        super();
        this.rooms = new Map();
        this.selectedRoom = null;
        this.hoveredRoom = null;
        this.previewPoints = null;
        this.validationManager = validationManager;
    }

    createRoom(points: Point2D[]): Room | null {
        const roomData: RoomData = {
            id: uuidv4(),
            points: points
        };
        const room = new Room(roomData);

        if (this.validationManager.validateRoom(room).isValid) {
            this.rooms.set(room.id, room);
            this.emit('roomAdded', room);
            return room;
        }
        return null;
    }

    getRoom(id: string): Room | undefined {
        return this.rooms.get(id);
    }

    getRooms(): Room[] {
        return Array.from(this.rooms.values());
    }

    updateRoom(room: Room): void {
        const existingRoom = this.rooms.get(room.id);
        if (!existingRoom) {
            throw new Error(`Room with id ${room.id} not found`);
        }

        if (this.validationManager.validateRoom(room).isValid) {
            this.rooms.set(room.id, room);
            this.emit('roomUpdated', room);
        }
    }

    updateRoomPoint(room: Room, oldPoint: Point2D, newPoint: Point2D): void {
        if (this.validationManager.validatePointMove(room, oldPoint, newPoint).isValid) {
            room.updatePoint(oldPoint, newPoint);
            this.emit('roomUpdated', room);
        }
    }

    updateRoomPoints(room: Room, points: Point2D[]): void {
        const tempRoom = new Room({
            id: room.id,
            name: room.getName(),
            points: points
        });

        if (this.validationManager.validateRoom(tempRoom).isValid) {
            room.setPoints(points);
            this.emit('roomUpdated', room);
        }
    }

    movePoint(room: Room, point: Point2D, delta: Point2D): void {
        const newPoint = {
            x: point.x + delta.x,
            y: point.y + delta.y
        };

        if (this.validationManager.validatePointMove(room, point, newPoint).isValid) {
            room.updatePoint(point, newPoint);
            this.emit('roomUpdated', room);
        }
    }

    moveRoom(room: Room, delta: Point2D): void {
        const points = room.getPoints().map(point => ({
            x: point.x + delta.x,
            y: point.y + delta.y
        }));

        const tempRoom = new Room({
            id: room.id,
            name: room.getName(),
            points: points
        });

        if (this.validationManager.validateRoom(tempRoom).isValid) {
            room.setPoints(points);
            this.emit('roomUpdated', room);
        }
    }

    rotateRoom(room: Room, angle: number): void {
        const center = room.getCenter();
        const points = room.getPoints().map(point => {
            const dx = point.x - center.x;
            const dy = point.y - center.y;
            const rad = (angle * Math.PI) / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);
            return {
                x: center.x + dx * cos - dy * sin,
                y: center.y + dx * sin + dy * cos
            };
        });

        const tempRoom = new Room({
            id: room.id,
            name: room.getName(),
            points: points
        });

        if (this.validationManager.validateRoom(tempRoom).isValid) {
            room.setPoints(points);
            this.emit('roomUpdated', room);
        }
    }

    resizeRoom(room: Room, scale: number): void {
        const center = room.getCenter();
        const points = room.getPoints().map(point => {
            const dx = point.x - center.x;
            const dy = point.y - center.y;
            return {
                x: center.x + dx * scale,
                y: center.y + dy * scale
            };
        });

        const tempRoom = new Room({
            id: room.id,
            name: room.getName(),
            points: points
        });

        if (this.validationManager.validateRoom(tempRoom).isValid) {
            room.setPoints(points);
            this.emit('roomUpdated', room);
        }
    }

    deleteRoom(room: Room): void {
        if (this.rooms.delete(room.id)) {
            if (this.selectedRoom === room) {
                this.selectedRoom = null;
                this.emit('selectionChanged', null);
            }
            if (this.hoveredRoom === room) {
                this.hoveredRoom = null;
                this.emit('hoverChanged', null);
            }
            this.emit('roomRemoved', room);
        }
    }

    findRoomAtPoint(point: Point2D): Room | null {
        for (const room of this.rooms.values()) {
            if (room.containsPoint(point)) {
                return room;
            }
        }
        return null;
    }

    findRoomPointAtPoint(point: Point2D): { room: Room; point: Point2D } | null {
        for (const room of this.rooms.values()) {
            const closestPoint = room.findClosestPoint(point, this.POINT_SELECTION_THRESHOLD);
            if (closestPoint) {
                return { room, point: closestPoint };
            }
        }
        return null;
    }

    findPointAtPosition(point: Point2D): Point2D | null {
        for (const room of this.rooms.values()) {
            const closestPoint = room.findClosestPoint(point, this.POINT_SELECTION_THRESHOLD);
            if (closestPoint) {
                return closestPoint;
            }
        }
        return null;
    }

    getRoomCenter(room: Room): Point2D {
        return room.getCenter();
    }

    snapToGrid(point: Point2D): Point2D {
        return {
            x: Math.round(point.x / this.GRID_SIZE) * this.GRID_SIZE,
            y: Math.round(point.y / this.GRID_SIZE) * this.GRID_SIZE
        };
    }

    setSelectedRoom(room: Room | null): void {
        if (this.selectedRoom !== room) {
            this.selectedRoom = room;
            this.emit('selectionChanged', room);
        }
    }

    getSelectedRoom(): Room | null {
        return this.selectedRoom;
    }

    setHoveredRoom(room: Room | null): void {
        if (this.hoveredRoom !== room) {
            this.hoveredRoom = room;
            this.emit('hoverChanged', room);
        }
    }

    getHoveredRoom(): Room | null {
        return this.hoveredRoom;
    }

    setHoveredPoint(point: Point2D | null): void {
        // This is a helper method that doesn't need an event since points are part of rooms
        // and we handle point hover visualization in the renderer
    }

    clearSelection(): void {
        if (this.selectedRoom) {
            this.selectedRoom = null;
            this.emit('selectionChanged', null);
        }
    }

    previewRoom(points: Point2D[]): void {
        this.previewPoints = points;
        this.emit('previewChanged', points);
        this.emit('preview', points); // For backward compatibility
    }

    clearPreview(): void {
        if (this.previewPoints) {
            this.previewPoints = null;
            this.emit('previewChanged', null);
            this.emit('preview', null); // For backward compatibility
        }
    }
}
