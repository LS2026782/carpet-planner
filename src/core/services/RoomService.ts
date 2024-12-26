import { BaseService } from './BaseService';
import { GeometryObject, Point2D } from '../types/geometry';
import { CommandPayload } from '../commands/types';
import { Room } from '../state/types/room';

export class RoomService extends BaseService {
    async createRoom(geometry: GeometryObject, name?: string): Promise<string> {
        try {
            const payload = {
                geometry,
                metadata: {
                    id: '', // Will be set by command
                    name,
                    type: 'room' as const
                },
                points: [], // Points will be extracted from geometry by the command
                style: {
                    fillColor: '#ffffff',
                    strokeColor: '#000000',
                    strokeWidth: 1
                }
            };

            const result = await this.executeCommand('ADD_ROOM', payload);
            
            if (!result.success) {
                throw new Error(result.error);
            }

            return result.data.id;
        } catch (error) {
            return this.handleError(error);
        }
    }

    async updateRoom(id: string, updates: Partial<Room>): Promise<void> {
        try {
            this.validateId(id, 'room');
            const room = this.state.rooms.rooms[id];
            this.validateExists(room, 'Room', id);

            const payload = {
                id,
                room: {
                    ...updates,
                    metadata: updates.metadata ? {
                        ...updates.metadata,
                        type: 'room' as const
                    } : undefined
                }
            };
            const result = await this.executeCommand('UPDATE_ROOM', payload);

            if (!result.success) {
                throw new Error(result.error);
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    async deleteRoom(id: string): Promise<void> {
        try {
            this.validateId(id, 'room');
            const room = this.state.rooms.rooms[id];
            this.validateExists(room, 'Room', id);

            const payload = { id };
            const result = await this.executeCommand('DELETE_ROOM', payload);

            if (!result.success) {
                throw new Error(result.error);
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    async moveRoom(id: string, delta: Point2D): Promise<void> {
        try {
            this.validateId(id, 'room');
            const room = this.state.rooms.rooms[id];
            this.validateExists(room, 'Room', id);

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

    async rotateRoom(id: string, angle: number, origin?: Point2D): Promise<void> {
        try {
            this.validateId(id, 'room');
            const room = this.state.rooms.rooms[id];
            this.validateExists(room, 'Room', id);

            const result = await this.executeCommand('TRANSFORM_OBJECTS', {
                objectIds: [id],
                transform: {
                    rotate: angle,
                    origin: origin || this.getRoomCenter(room)
                }
            });

            if (!result.success) {
                throw new Error(result.error);
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    async scaleRoom(id: string, scale: Point2D, origin?: Point2D): Promise<void> {
        try {
            this.validateId(id, 'room');
            const room = this.state.rooms.rooms[id];
            this.validateExists(room, 'Room', id);

            const result = await this.executeCommand('TRANSFORM_OBJECTS', {
                objectIds: [id],
                transform: {
                    scale,
                    origin: origin || this.getRoomCenter(room)
                }
            });

            if (!result.success) {
                throw new Error(result.error);
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    getRoom(id: string): Room {
        this.validateId(id, 'room');
        const room = this.state.rooms.rooms[id];
        this.validateExists(room, 'Room', id);
        return room;
    }

    getAllRooms(): Room[] {
        return Object.values(this.state.rooms.rooms);
    }

    getSelectedRoom(): Room | null {
        const id = this.state.rooms.selectedRoomId;
        return id ? this.state.rooms.rooms[id] : null;
    }

    private getRoomCenter(room: Room): Point2D {
        if (!room.points.length) {
            throw new Error('Room has no points');
        }

        const sumX = room.points.reduce((sum, point) => sum + point.x, 0);
        const sumY = room.points.reduce((sum, point) => sum + point.y, 0);
        
        return {
            x: sumX / room.points.length,
            y: sumY / room.points.length
        };
    }
}

export const roomService = new RoomService();
