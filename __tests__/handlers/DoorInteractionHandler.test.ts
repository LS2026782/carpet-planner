import { DoorInteractionHandler } from '../../src/handlers/DoorInteractionHandler';
import { DoorManager } from '../../src/managers/DoorManager';
import { RoomManager } from '../../src/managers/RoomManager';
import { ValidationManager } from '../../src/managers/ValidationManager';
import { Door } from '../../src/models/Door';
import { Room } from '../../src/models/Room';
import { Point2D } from '../../src/components/canvas/types';

jest.mock('../../src/managers/DoorManager');
jest.mock('../../src/managers/RoomManager');
jest.mock('../../src/managers/ValidationManager');

describe('DoorInteractionHandler', () => {
    let handler: DoorInteractionHandler;
    let doorManager: jest.Mocked<DoorManager>;
    let roomManager: jest.Mocked<RoomManager>;
    let validationManager: jest.Mocked<ValidationManager>;
    let mockDoor: Door;
    let mockRoom: Room;

    beforeEach(() => {
        doorManager = {
            createDoor: jest.fn(),
            moveDoor: jest.fn(),
            rotateDoor: jest.fn(),
            resizeDoor: jest.fn(),
            deleteDoor: jest.fn(),
            findDoorAtPoint: jest.fn(),
            setSelectedDoor: jest.fn(),
            setHoveredDoor: jest.fn(),
            clearSelection: jest.fn(),
            previewDoor: jest.fn(),
            clearPreview: jest.fn()
        } as unknown as jest.Mocked<DoorManager>;

        roomManager = {
            findRoomAtPoint: jest.fn()
        } as unknown as jest.Mocked<RoomManager>;

        validationManager = {
            validateDoorPosition: jest.fn().mockReturnValue({ isValid: true, errors: [] }),
            validateDoorRotation: jest.fn().mockReturnValue({ isValid: true, errors: [] }),
            validateDoorSize: jest.fn().mockReturnValue({ isValid: true, errors: [] })
        } as unknown as jest.Mocked<ValidationManager>;

        mockDoor = new Door('door-1', { x: 100, y: 0 });
        mockRoom = new Room({
            id: 'room-1',
            points: [
                { x: 0, y: 0 },
                { x: 200, y: 0 },
                { x: 200, y: 200 },
                { x: 0, y: 200 }
            ]
        });

        handler = new DoorInteractionHandler(doorManager, roomManager, validationManager);
    });

    describe('Door Placement', () => {
        it('should start door placement mode', () => {
            handler.startDoorPlacement();
            expect(handler['isPlacingDoor']).toBe(true);
            expect(handler['selectedDoor']).toBeNull();
        });

        it('should handle door placement on select', () => {
            handler.startDoorPlacement();
            roomManager.findRoomAtPoint.mockReturnValue(mockRoom);
            doorManager.createDoor.mockReturnValue(mockDoor);

            handler.onSelect({
                type: 'select',
                point: { x: 100, y: 0 },
                target: null,
                originalEvent: new MouseEvent('mousedown')
            });

            expect(doorManager.createDoor).toHaveBeenCalledWith({ x: 100, y: 0 }, mockRoom);
            expect(doorManager.setSelectedDoor).toHaveBeenCalledWith(mockDoor);
            expect(handler['isPlacingDoor']).toBe(false);
        });

        it('should handle door placement preview', () => {
            handler.startDoorPlacement();
            roomManager.findRoomAtPoint.mockReturnValue(mockRoom);

            handler.onHover({
                type: 'hover',
                point: { x: 100, y: 0 },
                target: null,
                originalEvent: new MouseEvent('mousemove')
            });

            expect(doorManager.previewDoor).toHaveBeenCalledWith({ x: 100, y: 0 });
        });

        it('should clear preview when not over room', () => {
            handler.startDoorPlacement();
            roomManager.findRoomAtPoint.mockReturnValue(null);

            handler.onHover({
                type: 'hover',
                point: { x: 300, y: 300 },
                target: null,
                originalEvent: new MouseEvent('mousemove')
            });

            expect(doorManager.clearPreview).toHaveBeenCalled();
        });
    });

    describe('Door Selection', () => {
        it('should handle door selection', () => {
            doorManager.findDoorAtPoint.mockReturnValue(mockDoor);

            handler.onSelect({
                type: 'select',
                point: { x: 100, y: 0 },
                target: null,
                originalEvent: new MouseEvent('mousedown')
            });

            expect(doorManager.setSelectedDoor).toHaveBeenCalledWith(mockDoor);
        });

        it('should handle door hover', () => {
            doorManager.findDoorAtPoint.mockReturnValue(mockDoor);

            handler.onHover({
                type: 'hover',
                point: { x: 100, y: 0 },
                target: null,
                originalEvent: new MouseEvent('mousemove')
            });

            expect(doorManager.setHoveredDoor).toHaveBeenCalledWith(mockDoor);
        });
    });

    describe('Door Manipulation', () => {
        beforeEach(() => {
            doorManager.findDoorAtPoint.mockReturnValue(mockDoor);
            handler.onSelect({
                type: 'select',
                point: { x: 100, y: 0 },
                target: null,
                originalEvent: new MouseEvent('mousedown')
            });
        });

        it('should handle door dragging', () => {
            handler.onDrag({
                type: 'drag',
                point: { x: 110, y: 0 },
                startPoint: { x: 100, y: 0 },
                delta: { x: 10, y: 0 },
                originalEvent: new MouseEvent('mousemove')
            });

            expect(doorManager.moveDoor).toHaveBeenCalledWith(mockDoor, { x: 10, y: 0 });
        });

        it('should handle door rotation', () => {
            handler.onRotate({
                type: 'rotate',
                point: { x: 110, y: 0 },
                angle: 90,
                center: { x: 100, y: 0 },
                originalEvent: new MouseEvent('mousemove')
            });

            expect(doorManager.rotateDoor).toHaveBeenCalledWith(mockDoor, 90);
        });

        it('should handle door resizing', () => {
            handler.onResize({
                type: 'resize',
                point: { x: 110, y: 0 },
                scale: 1.5,
                center: { x: 100, y: 0 },
                originalEvent: new MouseEvent('mousemove')
            });

            expect(doorManager.resizeDoor).toHaveBeenCalledWith(mockDoor, 1.5);
        });
    });

    describe('Keyboard Interaction', () => {
        beforeEach(() => {
            doorManager.findDoorAtPoint.mockReturnValue(mockDoor);
            handler.onSelect({
                type: 'select',
                point: { x: 100, y: 0 },
                target: null,
                originalEvent: new MouseEvent('mousedown')
            });
        });

        it('should handle door deletion', () => {
            handler.onKeyboard({
                type: 'keyDown',
                key: 'Delete',
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false
            });

            expect(doorManager.deleteDoor).toHaveBeenCalledWith(mockDoor);
            expect(handler['selectedDoor']).toBeNull();
        });

        it('should handle escape key', () => {
            handler.onKeyboard({
                type: 'keyDown',
                key: 'Escape',
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false
            });

            expect(doorManager.clearSelection).toHaveBeenCalled();
            expect(handler['selectedDoor']).toBeNull();
            expect(handler['isPlacingDoor']).toBe(false);
            expect(doorManager.clearPreview).toHaveBeenCalled();
        });

        it('should handle rotation shortcut', () => {
            handler.onKeyboard({
                type: 'keyDown',
                key: 'r',
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false
            });

            expect(doorManager.rotateDoor).toHaveBeenCalledWith(mockDoor, 90);
        });

        it('should handle swing direction toggle', () => {
            handler.onKeyboard({
                type: 'keyDown',
                key: ' ',
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false
            });

            expect(mockDoor.getSwingDirection()).toBe('right');
        });
    });

    describe('Gesture Handling', () => {
        beforeEach(() => {
            doorManager.findDoorAtPoint.mockReturnValue(mockDoor);
            handler.onSelect({
                type: 'select',
                point: { x: 100, y: 0 },
                target: null,
                originalEvent: new MouseEvent('mousedown')
            });
        });

        it('should handle pinch gesture', () => {
            handler.onGesture({
                type: 'pinch',
                scale: 1.5,
                center: { x: 100, y: 0 }
            });

            expect(doorManager.resizeDoor).toHaveBeenCalledWith(mockDoor, 1.5);
        });

        it('should handle rotate gesture', () => {
            handler.onGesture({
                type: 'rotate',
                rotation: 45,
                center: { x: 100, y: 0 }
            });

            expect(doorManager.rotateDoor).toHaveBeenCalledWith(mockDoor, 45);
        });
    });
});
