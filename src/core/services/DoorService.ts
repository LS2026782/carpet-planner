import { BaseService } from './BaseService';
import { GeometryObject, Point2D } from '../types/geometry';
import { Door } from '../state/types/door';

export class DoorService extends BaseService {
    async createDoor(
        geometry: GeometryObject,
        roomId: string | null = null,
        name?: string
    ): Promise<string> {
        try {
            const payload = {
                geometry,
                metadata: {
                    id: '', // Will be set by command
                    name,
                    type: 'door' as const
                },
                roomId,
                style: {
                    fillColor: '#ffffff',
                    strokeColor: '#000000',
                    strokeWidth: 1
                }
            };

            const result = await this.executeCommand('ADD_DOOR', payload);
            
            if (!result.success) {
                throw new Error(result.error);
            }

            return result.data.id;
        } catch (error) {
            return this.handleError(error);
        }
    }

    async updateDoor(id: string, updates: Partial<Door>): Promise<void> {
        try {
            this.validateId(id, 'door');
            const door = this.state.doors.doors[id];
            this.validateExists(door, 'Door', id);

            const payload = {
                id,
                door: {
                    ...updates,
                    metadata: updates.metadata ? {
                        ...updates.metadata,
                        type: 'door' as const
                    } : undefined
                }
            };

            const result = await this.executeCommand('UPDATE_DOOR', payload);

            if (!result.success) {
                throw new Error(result.error);
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    async deleteDoor(id: string): Promise<void> {
        try {
            this.validateId(id, 'door');
            const door = this.state.doors.doors[id];
            this.validateExists(door, 'Door', id);

            const payload = { id };
            const result = await this.executeCommand('DELETE_DOOR', payload);

            if (!result.success) {
                throw new Error(result.error);
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    async moveDoor(id: string, delta: Point2D): Promise<void> {
        try {
            this.validateId(id, 'door');
            const door = this.state.doors.doors[id];
            this.validateExists(door, 'Door', id);

            const result = await this.executeCommand('TRANSFORM_OBJECTS', {
                objectIds: [id],
                transform: {
                    translate: delta
                }
            });

            if (!result.success) {
                throw new Error(result.error);
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    async rotateDoor(id: string, angle: number, origin?: Point2D): Promise<void> {
        try {
            this.validateId(id, 'door');
            const door = this.state.doors.doors[id];
            this.validateExists(door, 'Door', id);

            const result = await this.executeCommand('TRANSFORM_OBJECTS', {
                objectIds: [id],
                transform: {
                    rotate: angle,
                    origin: origin || this.getDoorCenter(door)
                }
            });

            if (!result.success) {
                throw new Error(result.error);
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    async attachToRoom(doorId: string, roomId: string | null): Promise<void> {
        try {
            this.validateId(doorId, 'door');
            const door = this.state.doors.doors[doorId];
            this.validateExists(door, 'Door', doorId);

            if (roomId) {
                const room = this.state.rooms.rooms[roomId];
                this.validateExists(room, 'Room', roomId);
            }

            const payload = {
                id: doorId,
                door: {
                    roomId
                }
            };

            const result = await this.executeCommand('UPDATE_DOOR', payload);

            if (!result.success) {
                throw new Error(result.error);
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    getDoor(id: string): Door {
        this.validateId(id, 'door');
        const door = this.state.doors.doors[id];
        this.validateExists(door, 'Door', id);
        return door;
    }

    getAllDoors(): Door[] {
        return Object.values(this.state.doors.doors);
    }

    getDoorsByRoom(roomId: string): Door[] {
        return this.getAllDoors().filter(door => door.roomId === roomId);
    }

    getSelectedDoor(): Door | null {
        const id = this.state.doors.selectedDoorId;
        return id ? this.state.doors.doors[id] : null;
    }

    private getDoorCenter(door: Door): Point2D {
        const rect = door.geometry.data as { x: number; y: number; width: number; height: number };
        return {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2
        };
    }
}

export const doorService = new DoorService();
