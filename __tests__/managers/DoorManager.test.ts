import { DoorManager } from '../../src/managers/DoorManager';
import { ValidationManager } from '../../src/managers/ValidationManager';
import { Door, SwingDirection } from '../../src/models/Door';
import { Room } from '../../src/models/Room';
import { Point2D } from '../../src/components/canvas/types';

jest.mock('../../src/managers/ValidationManager');

describe('DoorManager', () => {
    let doorManager: DoorManager;
    let validationManager: jest.Mocked<ValidationManager>;
    let mockRoom: Room;
    let mockDoor: Door;

    beforeEach(() => {
        validationManager = {
            validateDoorPosition: jest.fn().mockReturnValue({ isValid: true, errors: [] }),
            validateDoorRotation: jest.fn().mockReturnValue({ isValid: true, errors: [] }),
            validateDoorSize: jest.fn().mockReturnValue({ isValid: true, errors: [] })
        } as unknown as jest.Mocked<ValidationManager>;

        doorManager = new DoorManager(validationManager);

        mockRoom = new Room({
            id: 'room-1',
            points: [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 }
            ]
        });

        const position = { x: 50, y: 0 };
        mockDoor = new Door('door-1', position);
    });

    describe('Door Creation', () => {
        it('should create a door with valid position', () => {
            const handler = jest.fn();
            doorManager.on('doorAdded', handler);

            const position = { x: 50, y: 0 };
            const door = doorManager.createDoor(position, mockRoom);

            expect(door).toBeDefined();
            expect(door.getPosition()).toEqual(position);
            expect(handler).toHaveBeenCalledWith(expect.any(Door));
        });

        it('should throw error if validation fails', () => {
            validationManager.validateDoorPosition.mockReturnValue({ isValid: false, errors: ['Invalid position'] });

            expect(() => {
                doorManager.createDoor({ x: 50, y: 50 }, mockRoom);
            }).toThrow('Invalid door position');
        });
    });

    describe('Door Management', () => {
        let testDoor: Door;

        beforeEach(() => {
            testDoor = doorManager.createDoor({ x: 50, y: 0 }, mockRoom);
        });

        it('should get door by id', () => {
            const door = doorManager.getDoor(testDoor.getId());
            expect(door).toBe(testDoor);
        });

        it('should get all doors', () => {
            const doors = doorManager.getDoors();
            expect(doors).toHaveLength(1);
            expect(doors[0]).toBe(testDoor);
        });

        it('should update door', () => {
            const handler = jest.fn();
            doorManager.on('doorUpdated', handler);

            testDoor.setPosition({ x: 60, y: 0 });
            doorManager.updateDoor(testDoor, mockRoom);

            expect(handler).toHaveBeenCalledWith(testDoor);
        });

        it('should delete door', () => {
            const handler = jest.fn();
            doorManager.on('doorRemoved', handler);

            doorManager.deleteDoor(testDoor);

            expect(handler).toHaveBeenCalledWith(testDoor);
            expect(doorManager.getDoor(testDoor.getId())).toBeUndefined();
        });
    });

    describe('Door Selection', () => {
        let testDoor: Door;

        beforeEach(() => {
            testDoor = doorManager.createDoor({ x: 50, y: 0 }, mockRoom);
        });

        it('should handle door selection', () => {
            const handler = jest.fn();
            doorManager.on('selectionChanged', handler);

            doorManager.setSelectedDoor(testDoor);
            expect(doorManager.getSelectedDoor()).toBe(testDoor);
            expect(handler).toHaveBeenCalledWith(testDoor);

            doorManager.clearSelection();
            expect(doorManager.getSelectedDoor()).toBeNull();
            expect(handler).toHaveBeenCalledWith(null);
        });

        it('should handle door hover', () => {
            const handler = jest.fn();
            doorManager.on('hoverChanged', handler);

            doorManager.setHoveredDoor(testDoor);
            expect(doorManager.getHoveredDoor()).toBe(testDoor);
            expect(handler).toHaveBeenCalledWith(testDoor);

            doorManager.setHoveredDoor(null);
            expect(doorManager.getHoveredDoor()).toBeNull();
            expect(handler).toHaveBeenCalledWith(null);
        });
    });

    describe('Door Manipulation', () => {
        let testDoor: Door;

        beforeEach(() => {
            testDoor = doorManager.createDoor({ x: 50, y: 0 }, mockRoom);
        });

        it('should move door', () => {
            const handler = jest.fn();
            doorManager.on('doorUpdated', handler);

            const delta = { x: 10, y: 0 };
            doorManager.moveDoor(testDoor, delta);

            expect(testDoor.getPosition()).toEqual({ x: 60, y: 0 });
            expect(handler).toHaveBeenCalledWith(testDoor);
        });

        it('should rotate door', () => {
            const handler = jest.fn();
            doorManager.on('doorUpdated', handler);

            doorManager.rotateDoor(testDoor, 90);

            expect(testDoor.getAngle()).toBe(90);
            expect(handler).toHaveBeenCalledWith(testDoor);
        });

        it('should resize door', () => {
            const handler = jest.fn();
            doorManager.on('doorUpdated', handler);

            doorManager.resizeDoor(testDoor, 1.5);

            expect(testDoor.getDimensions()).toEqual({
                width: 48,
                height: 120
            });
            expect(handler).toHaveBeenCalledWith(testDoor);
        });
    });

    describe('Door Finding', () => {
        let testDoor: Door;

        beforeEach(() => {
            testDoor = doorManager.createDoor({ x: 50, y: 0 }, mockRoom);
        });

        it('should find door at point', () => {
            const door = doorManager.findDoorAtPoint({ x: 50, y: 0 });
            expect(door).toBe(testDoor);
        });

        it('should not find door at distant point', () => {
            const door = doorManager.findDoorAtPoint({ x: 200, y: 200 });
            expect(door).toBeNull();
        });
    });

    describe('Door Preview', () => {
        it('should handle door preview', () => {
            const handler = jest.fn();
            doorManager.on('doorUpdated', handler);

            doorManager.previewDoor({ x: 50, y: 0 });
            expect(handler).toHaveBeenCalled();

            doorManager.clearPreview();
            expect(handler).toHaveBeenCalledWith(null);
        });
    });
});
