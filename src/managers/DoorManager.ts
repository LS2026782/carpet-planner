import { Door } from '../models/Door';
import { Point2D } from '../components/canvas/types';
import { EventEmitter } from '../utils/EventEmitter';
import { ValidationManager } from './ValidationManager';
import { Room } from '../models/Room';
import { v4 as uuidv4 } from 'uuid';

interface DoorManagerEvents {
    doorAdded: Door;
    doorRemoved: Door;
    doorUpdated: Door;
    selectionChanged: Door | null;
    hoverChanged: Door | null;
}

export class DoorManager extends EventEmitter<DoorManagerEvents> {
    private doors: Map<string, Door>;
    private selectedDoor: Door | null;
    private hoveredDoor: Door | null;
    private validationManager: ValidationManager;
    private readonly DOOR_SELECTION_THRESHOLD = 10; // pixels

    constructor(validationManager: ValidationManager) {
        super();
        this.doors = new Map();
        this.selectedDoor = null;
        this.hoveredDoor = null;
        this.validationManager = validationManager;
    }

    createDoor(position: Point2D, room: Room): Door {
        const door = new Door(uuidv4(), position);

        if (this.validationManager.validateDoorPosition(door, room).isValid) {
            this.doors.set(door.getId(), door);
            this.emit('doorAdded', door);
            return door;
        } else {
            throw new Error('Invalid door position');
        }
    }

    getDoor(id: string): Door | undefined {
        return this.doors.get(id);
    }

    getDoors(): Door[] {
        return Array.from(this.doors.values());
    }

    updateDoor(door: Door, room: Room): void {
        const existingDoor = this.doors.get(door.getId());
        if (!existingDoor) {
            throw new Error(`Door with id ${door.getId()} not found`);
        }

        if (this.validationManager.validateDoorPosition(door, room).isValid) {
            this.doors.set(door.getId(), door);
            this.emit('doorUpdated', door);
        } else {
            throw new Error('Invalid door position');
        }
    }

    moveDoor(door: Door, delta: Point2D): void {
        const position = door.getPosition();
        door.setPosition({
            x: position.x + delta.x,
            y: position.y + delta.y
        });
        this.emit('doorUpdated', door);
    }

    rotateDoor(door: Door, angle: number): void {
        if (this.validationManager.validateDoorRotation(door, angle).isValid) {
            door.setAngle(angle);
            this.emit('doorUpdated', door);
        } else {
            throw new Error('Invalid door rotation');
        }
    }

    resizeDoor(door: Door, scale: number): void {
        const { width, height } = door.getDimensions();
        const newWidth = width * scale;
        const newHeight = height * scale;

        if (this.validationManager.validateDoorSize(door, newWidth, newHeight).isValid) {
            door.setDimensions(newWidth, newHeight);
            this.emit('doorUpdated', door);
        } else {
            throw new Error('Invalid door size');
        }
    }

    deleteDoor(door: Door): void {
        if (this.doors.delete(door.getId())) {
            if (this.selectedDoor === door) {
                this.selectedDoor = null;
                this.emit('selectionChanged', null);
            }
            if (this.hoveredDoor === door) {
                this.hoveredDoor = null;
                this.emit('hoverChanged', null);
            }
            this.emit('doorRemoved', door);
        }
    }

    findDoorAtPoint(point: Point2D): Door | null {
        for (const door of this.doors.values()) {
            const doorPos = door.getPosition();
            const { width, height } = door.getDimensions();
            const angle = door.getAngle();

            // Transform point to door's local space
            const dx = point.x - doorPos.x;
            const dy = point.y - doorPos.y;
            const rad = (angle * Math.PI) / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);
            const localX = dx * cos + dy * sin;
            const localY = -dx * sin + dy * cos;

            // Check if point is within door bounds
            if (
                localX >= -width / 2 &&
                localX <= width / 2 &&
                localY >= -height / 2 &&
                localY <= height / 2
            ) {
                return door;
            }
        }
        return null;
    }

    setSelectedDoor(door: Door | null): void {
        if (this.selectedDoor !== door) {
            this.selectedDoor = door;
            this.emit('selectionChanged', door);
        }
    }

    getSelectedDoor(): Door | null {
        return this.selectedDoor;
    }

    setHoveredDoor(door: Door | null): void {
        if (this.hoveredDoor !== door) {
            this.hoveredDoor = door;
            this.emit('hoverChanged', door);
        }
    }

    getHoveredDoor(): Door | null {
        return this.hoveredDoor;
    }

    clearSelection(): void {
        if (this.selectedDoor) {
            this.selectedDoor = null;
            this.emit('selectionChanged', null);
        }
    }

    previewDoor(position: Point2D): void {
        // Create a temporary door for preview
        const door = new Door('preview', position);
        this.emit('doorUpdated', door);
    }

    clearPreview(): void {
        this.emit('doorUpdated', null);
    }
}
