import { BaseService } from './BaseService';
import { RoomService } from './RoomService';
import { DoorService } from './DoorService';
import { GroupService } from './GroupService';

// Create service instances
export const roomService = new RoomService();
export const doorService = new DoorService();
export const groupService = new GroupService();

// Export service classes and instances
export {
    BaseService,
    RoomService,
    DoorService,
    GroupService,
};

// Re-export service types
export type { Room } from '../state/types/room';
export type { Door } from '../state/types/door';
export type { Group } from './GroupService';

// Helper function to initialize all services
export function initializeServices(): void {
    // Add any initialization logic here
    // For example, loading saved state, setting up event listeners, etc.
}

// Helper function to get all services
export function getServices() {
    return {
        room: roomService as RoomService,
        door: doorService as DoorService,
        group: groupService as GroupService,
    } as const;
}

// Helper function to reset all services
export async function resetServices(): Promise<void> {
    const services = getServices();
    
    // Clear all rooms
    const rooms = services.room.getAllRooms();
    for (const room of rooms) {
        await services.room.executeCommand('DELETE_ROOM', { id: room.id });
    }

    // Clear all doors
    const doors = services.door.getAllDoors();
    for (const door of doors) {
        await services.door.executeCommand('DELETE_DOOR', { id: door.id });
    }

    // Clear history
    await services.room.executeCommand('CLEAR_HISTORY', { scope: 'all' });
}

// Helper function to save current state
export async function saveState(): Promise<void> {
    const state = {
        rooms: roomService.getAllRooms(),
        doors: doorService.getAllDoors(),
    };

    try {
        localStorage.setItem('carpetPlanner_state', JSON.stringify(state));
    } catch (error) {
        console.error('Failed to save state:', error);
    }
}

// Helper function to load saved state
export async function loadState(): Promise<void> {
    try {
        const savedState = localStorage.getItem('carpetPlanner_state');
        if (!savedState) return;

        const state = JSON.parse(savedState);
        const services = getServices();

        // Clear existing state
        await resetServices();

        // Restore rooms
        for (const room of state.rooms) {
            await services.room.createRoom(room.geometry, room.name);
        }

        // Restore doors
        for (const door of state.doors) {
            await services.door.createDoor(door.geometry, door.roomId, door.name);
        }
    } catch (error) {
        console.error('Failed to load state:', error);
    }
}

// Helper function to export state
export async function exportState(): Promise<string> {
    const state = {
        rooms: roomService.getAllRooms(),
        doors: doorService.getAllDoors(),
        version: '1.0.0', // Add version for future compatibility
        timestamp: new Date().toISOString(),
    };

    return JSON.stringify(state, null, 2);
}

// Helper function to import state
export async function importState(stateJson: string): Promise<void> {
    try {
        const state = JSON.parse(stateJson);
        const services = getServices();

        // Validate version if needed
        if (!state.version) {
            throw new Error('Invalid state format: missing version');
        }

        // Clear existing state
        await resetServices();

        // Restore rooms
        for (const room of state.rooms) {
            await services.room.createRoom(room.geometry, room.name);
        }

        // Restore doors
        for (const door of state.doors) {
            await services.door.createDoor(door.geometry, door.roomId, door.name);
        }
    } catch (error) {
        console.error('Failed to import state:', error);
        throw new Error('Failed to import state: Invalid format');
    }
}
