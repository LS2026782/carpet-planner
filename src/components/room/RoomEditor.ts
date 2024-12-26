import { RoomManager } from '../../managers/RoomManager';
import { ValidationManager } from '../../managers/ValidationManager';

export class RoomEditor {
    private roomManager: RoomManager;
    private validationManager: ValidationManager;
    private isEditing: boolean = false;

    constructor(
        roomManager: RoomManager,
        validationManager: ValidationManager
    ) {
        this.roomManager = roomManager;
        this.validationManager = validationManager;
    }

    startDrawing(): void {
        this.isEditing = true;
        this.roomManager.clearSelection();
    }

    stopDrawing(): void {
        this.isEditing = false;
        this.roomManager.clearSelection();
    }

    startEditing(): void {
        this.isEditing = true;
        this.roomManager.clearSelection();
    }

    stopEditing(): void {
        this.isEditing = false;
        this.roomManager.clearSelection();
    }

    isActive(): boolean {
        return this.isEditing;
    }
}
