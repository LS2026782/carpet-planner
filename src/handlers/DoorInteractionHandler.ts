import { DoorManager } from '../managers/DoorManager';
import { RoomManager } from '../managers/RoomManager';
import { ValidationManager } from '../managers/ValidationManager';
import { Point2D } from '../components/canvas/types';
import {
    InteractionHandler,
    DragEvent,
    ResizeEvent,
    RotateEvent,
    SelectEvent,
    HoverEvent,
    KeyboardEvent as CustomKeyboardEvent,
    GestureEvent,
    InteractionMode
} from '../types/events';
import { Door } from '../models/Door';

export class DoorInteractionHandler implements InteractionHandler {
    private doorManager: DoorManager;
    private roomManager: RoomManager;
    private validationManager: ValidationManager;
    private selectedDoor: Door | null = null;
    private selectedPoint: Point2D | null = null;
    private isPlacing: boolean = false;
    private mode: InteractionMode = 'select';

    constructor(
        doorManager: DoorManager,
        roomManager: RoomManager,
        validationManager: ValidationManager
    ) {
        this.doorManager = doorManager;
        this.roomManager = roomManager;
        this.validationManager = validationManager;
    }

    onDrag = (event: DragEvent): void => {
        if (this.mode !== 'select') return;

        if (this.selectedDoor) {
            // Move door
            const delta = {
                x: event.delta.x,
                y: event.delta.y
            };
            this.doorManager.moveDoor(this.selectedDoor, delta);
        }
    };

    onRotate = (event: RotateEvent): void => {
        if (this.mode !== 'select' || !this.selectedDoor) return;

        const currentAngle = this.selectedDoor.getAngle();
        const newAngle = currentAngle + event.angle;
        this.doorManager.rotateDoor(this.selectedDoor, newAngle);
    };

    onSelect = (event: SelectEvent): void => {
        console.log('DoorInteractionHandler.onSelect', {
            mode: this.mode,
            point: event.point
        });

        if (this.mode === 'door') {
            const room = this.roomManager.findRoomAtPoint(event.point);
            console.log('Found room:', room);
            
            if (room) {
                try {
                    console.log('Creating door at', event.point);
                    const door = this.doorManager.createDoor(event.point, room);
                    console.log('Door created:', door);
                    this.selectedDoor = door;
                    this.doorManager.setSelectedDoor(door);
                } catch (error) {
                    console.error('Failed to create door:', error);
                }
            }
            return;
        }

        if (this.mode === 'select') {
            const door = this.doorManager.findDoorAtPoint(event.point);
            this.selectedDoor = door;
            this.doorManager.setSelectedDoor(door);
        }
    };

    onHover = (event: HoverEvent): void => {
        if (this.mode === 'door') {
            const room = this.roomManager.findRoomAtPoint(event.point);
            if (room) {
                // Show preview of where door would be placed
                this.doorManager.previewDoor(event.point);
            } else {
                this.doorManager.clearPreview();
            }
            return;
        }

        if (this.mode === 'select') {
            const door = this.doorManager.findDoorAtPoint(event.point);
            this.doorManager.setHoveredDoor(door);
        }
    };

    onKeyboard = (event: CustomKeyboardEvent): void => {
        if (event.type === 'keyDown') {
            switch (event.key) {
                case 'Delete':
                case 'Backspace':
                    if (this.selectedDoor) {
                        this.doorManager.deleteDoor(this.selectedDoor);
                        this.selectedDoor = null;
                    }
                    break;

                case 'Escape':
                    this.doorManager.clearSelection();
                    this.selectedDoor = null;
                    this.isPlacing = false;
                    this.doorManager.clearPreview();
                    break;

                case 'r':
                    if (this.selectedDoor) {
                        const currentAngle = this.selectedDoor.getAngle();
                        this.doorManager.rotateDoor(this.selectedDoor, currentAngle + 90);
                    }
                    break;
            }
        }
    };

    setMode(mode: InteractionMode): void {
        console.log('DoorInteractionHandler.setMode', mode);
        this.mode = mode;
        if (mode === 'door') {
            this.startPlacing();
        } else {
            this.stopPlacing();
        }
    }

    startPlacing(): void {
        console.log('DoorInteractionHandler.startPlacing');
        this.isPlacing = true;
        this.selectedDoor = null;
        this.doorManager.clearSelection();
    }

    stopPlacing(): void {
        console.log('DoorInteractionHandler.stopPlacing');
        this.isPlacing = false;
        this.doorManager.clearPreview();
    }
}
