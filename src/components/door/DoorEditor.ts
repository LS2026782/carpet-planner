import { DoorManager } from '../../managers/DoorManager';
import { RoomManager } from '../../managers/RoomManager';
import { ValidationManager } from '../../managers/ValidationManager';

export class DoorEditor {
    private doorManager: DoorManager;
    private roomManager: RoomManager;
    private validationManager: ValidationManager;
    private isEditing: boolean = false;

    constructor(
        doorManager: DoorManager,
        roomManager: RoomManager,
        validationManager: ValidationManager
    ) {
        this.doorManager = doorManager;
        this.roomManager = roomManager;
        this.validationManager = validationManager;
    }

    startDoorPlacement(): void {
        this.isEditing = true;
        this.doorManager.clearSelection();
    }

    stopDoorPlacement(): void {
        this.isEditing = false;
        this.doorManager.clearSelection();
    }

    startEditing(): void {
        this.isEditing = true;
        this.doorManager.clearSelection();
    }

    stopEditing(): void {
        this.isEditing = false;
        this.doorManager.clearSelection();
    }

    isActive(): boolean {
        return this.isEditing;
    }
}
