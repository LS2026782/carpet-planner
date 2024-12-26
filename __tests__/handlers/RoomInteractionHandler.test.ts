import { RoomInteractionHandler } from '../../src/handlers/RoomInteractionHandler';
import { RoomManager } from '../../src/managers/RoomManager';
import { ValidationManager } from '../../src/managers/ValidationManager';
import { Room } from '../../src/models/Room';
import { Point2D } from '../../src/components/canvas/types';

jest.mock('../../src/managers/RoomManager');
jest.mock('../../src/managers/ValidationManager');

describe('RoomInteractionHandler', () => {
    let handler: RoomInteractionHandler;
    let roomManager: jest.Mocked<RoomManager>;
    let validationManager: jest.Mocked<ValidationManager>;
    let mockRoom: Room;

    beforeEach(() => {
        roomManager = {
            createRoom: jest.fn(),
            updateRoom: jest.fn(),
            deleteRoom: jest.fn(),
            findRoomAtPoint: jest.fn(),
            findRoomPointAtPoint: jest.fn(),
            setSelectedRoom: jest.fn(),
            setHoveredRoom: jest.fn(),
            clearSelection: jest.fn(),
            previewRoom: jest.fn(),
            clearPreview: jest.fn(),
            moveRoom: jest.fn(),
            movePoint: jest.fn(),
            rotateRoom: jest.fn(),
            resizeRoom: jest.fn()
        } as unknown as jest.Mocked<RoomManager>;

        validationManager = {
            validateRoom: jest.fn().mockReturnValue({ isValid: true, errors: [] }),
            validatePointMove: jest.fn().mockReturnValue({ isValid: true, errors: [] })
        } as unknown as jest.Mocked<ValidationManager>;

        mockRoom = new Room({
            id: 'room-1',
            points: [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 }
            ]
        });

        handler = new RoomInteractionHandler(roomManager, validationManager);
    });

    describe('Drawing Mode', () => {
        it('should start drawing mode', () => {
            handler.startDrawing();
            expect(handler['isDrawing']).toBe(true);
            expect(roomManager.clearSelection).toHaveBeenCalled();
        });

        it('should handle point placement while drawing', () => {
            handler.startDrawing();

            handler.onSelect({
                type: 'select',
                point: { x: 0, y: 0 },
                target: null,
                originalEvent: new MouseEvent('mousedown')
            });

            expect(roomManager.previewRoom).toHaveBeenCalledWith([{ x: 0, y: 0 }]);
        });

        it('should create room when enough points are placed', () => {
            handler.startDrawing();
            roomManager.createRoom.mockReturnValue(mockRoom);

            // Place three points to form a room
            handler.onSelect({
                type: 'select',
                point: { x: 0, y: 0 },
                target: null,
                originalEvent: new MouseEvent('mousedown')
            });

            handler.onSelect({
                type: 'select',
                point: { x: 100, y: 0 },
                target: null,
                originalEvent: new MouseEvent('mousedown')
            });

            handler.onSelect({
                type: 'select',
                point: { x: 100, y: 100 },
                target: null,
                originalEvent: new MouseEvent('mousedown')
            });

            expect(roomManager.createRoom).toHaveBeenCalled();
            expect(handler['isDrawing']).toBe(false);
        });
    });

    describe('Room Selection', () => {
        it('should handle room selection', () => {
            roomManager.findRoomAtPoint.mockReturnValue(mockRoom);

            handler.onSelect({
                type: 'select',
                point: { x: 50, y: 50 },
                target: null,
                originalEvent: new MouseEvent('mousedown')
            });

            expect(roomManager.setSelectedRoom).toHaveBeenCalledWith(mockRoom);
        });

        it('should handle room hover', () => {
            roomManager.findRoomAtPoint.mockReturnValue(mockRoom);

            handler.onHover({
                type: 'hover',
                point: { x: 50, y: 50 },
                target: null,
                originalEvent: new MouseEvent('mousemove')
            });

            expect(roomManager.setHoveredRoom).toHaveBeenCalledWith(mockRoom);
        });
    });

    describe('Room Manipulation', () => {
        beforeEach(() => {
            roomManager.findRoomAtPoint.mockReturnValue(mockRoom);
            handler.onSelect({
                type: 'select',
                point: { x: 50, y: 50 },
                target: null,
                originalEvent: new MouseEvent('mousedown')
            });
        });

        it('should handle room dragging', () => {
            handler.onDrag({
                type: 'drag',
                point: { x: 60, y: 60 },
                startPoint: { x: 50, y: 50 },
                delta: { x: 10, y: 10 },
                originalEvent: new MouseEvent('mousemove')
            });

            expect(roomManager.moveRoom).toHaveBeenCalledWith(mockRoom, { x: 10, y: 10 });
        });

        it('should handle room rotation', () => {
            handler.onRotate({
                type: 'rotate',
                point: { x: 60, y: 60 },
                angle: 90,
                center: { x: 50, y: 50 },
                originalEvent: new MouseEvent('mousemove')
            });

            expect(roomManager.rotateRoom).toHaveBeenCalledWith(mockRoom, 90);
        });

        it('should handle room resizing', () => {
            handler.onResize({
                type: 'resize',
                point: { x: 60, y: 60 },
                scale: 1.5,
                center: { x: 50, y: 50 },
                originalEvent: new MouseEvent('mousemove')
            });

            expect(roomManager.resizeRoom).toHaveBeenCalledWith(mockRoom, 1.5);
        });
    });

    describe('Keyboard Interaction', () => {
        beforeEach(() => {
            roomManager.findRoomAtPoint.mockReturnValue(mockRoom);
            handler.onSelect({
                type: 'select',
                point: { x: 50, y: 50 },
                target: null,
                originalEvent: new MouseEvent('mousedown')
            });
        });

        it('should handle room deletion', () => {
            handler.onKeyboard({
                type: 'keyDown',
                key: 'Delete',
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false
            });

            expect(roomManager.deleteRoom).toHaveBeenCalledWith(mockRoom);
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

            expect(roomManager.clearSelection).toHaveBeenCalled();
            expect(roomManager.clearPreview).toHaveBeenCalled();
            expect(handler['isDrawing']).toBe(false);
        });
    });
});
