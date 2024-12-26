import { ValidationManager } from '../../src/managers/ValidationManager';
import { Room } from '../../src/models/Room';
import { Door } from '../../src/models/Door';
import { Point2D } from '../../src/components/canvas/types';

describe('ValidationManager', () => {
    let validationManager: ValidationManager;
    let mockRoom: Room;
    let mockDoor: Door;

    beforeEach(() => {
        validationManager = new ValidationManager();

        mockRoom = new Room({
            id: 'room-1',
            points: [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 }
            ]
        });

        mockDoor = new Door('door-1', { x: 50, y: 0 });
    });

    describe('Room Validation', () => {
        it('should validate a valid room', () => {
            const result = validationManager.validateRoom(mockRoom);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject room with too few points', () => {
            const invalidRoom = new Room({
                id: 'invalid-room',
                points: [
                    { x: 0, y: 0 },
                    { x: 100, y: 0 }
                ]
            });

            const result = validationManager.validateRoom(invalidRoom);
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('must have at least 3 points');
        });

        it('should reject room with too small area', () => {
            const tinyRoom = new Room({
                id: 'tiny-room',
                points: [
                    { x: 0, y: 0 },
                    { x: 1, y: 0 },
                    { x: 1, y: 1 },
                    { x: 0, y: 1 }
                ]
            });

            const result = validationManager.validateRoom(tinyRoom);
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('area');
        });

        it('should reject room with self-intersecting edges', () => {
            const intersectingRoom = new Room({
                id: 'intersecting-room',
                points: [
                    { x: 0, y: 0 },
                    { x: 100, y: 0 },
                    { x: 0, y: 100 },
                    { x: 100, y: 100 }
                ]
            });

            const result = validationManager.validateRoom(intersectingRoom);
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('intersect');
        });
    });

    describe('Point Movement Validation', () => {
        it('should validate valid point movement', () => {
            const point = { x: 0, y: 0 };
            const newPosition = { x: 50, y: 50 };

            const result = validationManager.validatePointMove(mockRoom, point, newPosition);
            expect(result.isValid).toBe(true);
        });

        it('should reject movement of non-existent point', () => {
            const point = { x: 999, y: 999 };
            const newPosition = { x: 50, y: 50 };

            const result = validationManager.validatePointMove(mockRoom, point, newPosition);
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('Point not found');
        });

        it('should reject movement that creates self-intersection', () => {
            const point = { x: 0, y: 0 };
            const newPosition = { x: 100, y: 100 };

            const result = validationManager.validatePointMove(mockRoom, point, newPosition);
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('intersect');
        });
    });

    describe('Door Validation', () => {
        it('should validate valid door position', () => {
            const result = validationManager.validateDoorPosition(mockDoor, mockRoom);
            expect(result.isValid).toBe(true);
        });

        it('should reject door not on wall', () => {
            mockDoor.setPosition({ x: 50, y: 50 });

            const result = validationManager.validateDoorPosition(mockDoor, mockRoom);
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('must be placed on a room wall');
        });

        it('should validate valid door rotation', () => {
            const result = validationManager.validateDoorRotation(mockDoor, 90);
            expect(result.isValid).toBe(true);
        });

        it('should reject invalid door rotation', () => {
            const result = validationManager.validateDoorRotation(mockDoor, 45);
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('90-degree increments');
        });

        it('should validate valid door size', () => {
            const result = validationManager.validateDoorSize(mockDoor, 32, 80);
            expect(result.isValid).toBe(true);
        });

        it('should reject invalid door size', () => {
            const result = validationManager.validateDoorSize(mockDoor, 10, 60);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(2);
            expect(result.errors[0]).toContain('width');
            expect(result.errors[1]).toContain('height');
        });
    });
});
