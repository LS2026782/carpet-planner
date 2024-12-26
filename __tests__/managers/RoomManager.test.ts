import { RoomManager } from '../../src/managers/RoomManager';
import { ValidationManager } from '../../src/managers/ValidationManager';
import { Room } from '../../src/models/Room';
import { Point2D } from '../../src/components/canvas/types';

jest.mock('../../src/managers/ValidationManager');

describe('RoomManager', () => {
    let roomManager: RoomManager;
    let validationManager: jest.Mocked<ValidationManager>;
    let mockRoom: Room;

    beforeEach(() => {
        validationManager = {
            validateRoom: jest.fn().mockReturnValue({ isValid: true, errors: [] }),
            validatePointMove: jest.fn().mockReturnValue({ isValid: true, errors: [] })
        } as unknown as jest.Mocked<ValidationManager>;

        roomManager = new RoomManager(validationManager);

        mockRoom = new Room({
            id: 'room-1',
            points: [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 }
            ]
        });
    });

    describe('Room Creation', () => {
        it('should create a room with valid points', () => {
            const handler = jest.fn();
            roomManager.on('roomAdded', handler);

            const points = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 }
            ];

            const room = roomManager.createRoom(points);

            expect(room).toBeDefined();
            expect(room?.getPoints()).toEqual(points);
            expect(handler).toHaveBeenCalledWith(expect.any(Room));
        });

        it('should not create room if validation fails', () => {
            validationManager.validateRoom.mockReturnValue({ isValid: false, errors: ['Invalid room'] });

            const handler = jest.fn();
            roomManager.on('roomAdded', handler);

            const room = roomManager.createRoom([{ x: 0, y: 0 }]);

            expect(room).toBeNull();
            expect(handler).not.toHaveBeenCalled();
        });
    });

    describe('Room Management', () => {
        let testRoom: Room;

        beforeEach(() => {
            testRoom = roomManager.createRoom([
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 }
            ])!;
        });

        it('should get room by id', () => {
            const room = roomManager.getRoom(testRoom.id);
            expect(room).toBe(testRoom);
        });

        it('should get all rooms', () => {
            const rooms = roomManager.getRooms();
            expect(rooms).toHaveLength(1);
            expect(rooms[0]).toBe(testRoom);
        });

        it('should update room', () => {
            const handler = jest.fn();
            roomManager.on('roomUpdated', handler);

            testRoom.setPoints([
                { x: 0, y: 0 },
                { x: 200, y: 0 },
                { x: 200, y: 200 },
                { x: 0, y: 200 }
            ]);
            roomManager.updateRoom(testRoom);

            expect(handler).toHaveBeenCalledWith(testRoom);
        });

        it('should delete room', () => {
            const handler = jest.fn();
            roomManager.on('roomRemoved', handler);

            roomManager.deleteRoom(testRoom);

            expect(handler).toHaveBeenCalledWith(testRoom);
            expect(roomManager.getRoom(testRoom.id)).toBeUndefined();
        });
    });

    describe('Room Manipulation', () => {
        let testRoom: Room;

        beforeEach(() => {
            testRoom = roomManager.createRoom([
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 }
            ])!;
        });

        it('should move room', () => {
            const handler = jest.fn();
            roomManager.on('roomUpdated', handler);

            const delta = { x: 50, y: 50 };
            roomManager.moveRoom(testRoom, delta);

            const points = testRoom.getPoints();
            expect(points[0]).toEqual({ x: 50, y: 50 });
            expect(points[1]).toEqual({ x: 150, y: 50 });
            expect(points[2]).toEqual({ x: 150, y: 150 });
            expect(points[3]).toEqual({ x: 50, y: 150 });
            expect(handler).toHaveBeenCalledWith(testRoom);
        });

        it('should rotate room', () => {
            const handler = jest.fn();
            roomManager.on('roomUpdated', handler);

            roomManager.rotateRoom(testRoom, 90);

            const points = testRoom.getPoints();
            expect(points[0].x).toBeCloseTo(100);
            expect(points[0].y).toBeCloseTo(0);
            expect(handler).toHaveBeenCalledWith(testRoom);
        });

        it('should resize room', () => {
            const handler = jest.fn();
            roomManager.on('roomUpdated', handler);

            roomManager.resizeRoom(testRoom, 2);

            const points = testRoom.getPoints();
            expect(points[1].x).toBeCloseTo(200);
            expect(points[2].y).toBeCloseTo(200);
            expect(handler).toHaveBeenCalledWith(testRoom);
        });
    });

    describe('Room Selection', () => {
        let testRoom: Room;

        beforeEach(() => {
            testRoom = roomManager.createRoom([
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 }
            ])!;
        });

        it('should handle room selection', () => {
            const handler = jest.fn();
            roomManager.on('selectionChanged', handler);

            roomManager.setSelectedRoom(testRoom);
            expect(roomManager.getSelectedRoom()).toBe(testRoom);
            expect(handler).toHaveBeenCalledWith(testRoom);

            roomManager.clearSelection();
            expect(roomManager.getSelectedRoom()).toBeNull();
            expect(handler).toHaveBeenCalledWith(null);
        });

        it('should handle room hover', () => {
            const handler = jest.fn();
            roomManager.on('hoverChanged', handler);

            roomManager.setHoveredRoom(testRoom);
            expect(roomManager.getHoveredRoom()).toBe(testRoom);
            expect(handler).toHaveBeenCalledWith(testRoom);

            roomManager.setHoveredRoom(null);
            expect(roomManager.getHoveredRoom()).toBeNull();
            expect(handler).toHaveBeenCalledWith(null);
        });
    });

    describe('Room Preview', () => {
        it('should handle room preview', () => {
            const handler = jest.fn();
            roomManager.on('previewChanged', handler);

            const points = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 }
            ];

            roomManager.previewRoom(points);
            expect(handler).toHaveBeenCalledWith(points);

            roomManager.clearPreview();
            expect(handler).toHaveBeenCalledWith(null);
        });
    });
});
