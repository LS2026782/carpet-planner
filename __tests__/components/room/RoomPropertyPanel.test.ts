import { RoomPropertyPanel } from '../../../src/components/room/RoomPropertyPanel';
import { EditableRoom, EditablePoint, ValidationError, createPoint, createRoom } from '../../../src/types/editor';

describe('RoomPropertyPanel', () => {
    let panel: RoomPropertyPanel;
    let container: HTMLElement;
    let mockRoom: EditableRoom;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);

        const points: EditablePoint[] = [
            createPoint(0, 0),
            createPoint(100, 0),
            createPoint(100, 100),
            createPoint(0, 100)
        ];

        mockRoom = {
            ...createRoom(points),
            width: 100,
            height: 100,
            area: 10000,
            perimeter: 400,
            validationErrors: []
        };

        panel = new RoomPropertyPanel(container);
    });

    afterEach(() => {
        panel.destroy();
        document.body.removeChild(container);
    });

    it('should render room measurements', () => {
        panel.setRoom(mockRoom);

        const widthElement = container.querySelector('[data-testid="room-width"]');
        const heightElement = container.querySelector('[data-testid="room-height"]');
        const areaElement = container.querySelector('[data-testid="room-area"]');
        const perimeterElement = container.querySelector('[data-testid="room-perimeter"]');

        expect(widthElement?.textContent).toContain('100');
        expect(heightElement?.textContent).toContain('100');
        expect(areaElement?.textContent).toContain('10000');
        expect(perimeterElement?.textContent).toContain('400');
    });

    it('should update measurements when room changes', () => {
        panel.setRoom(mockRoom);

        const updatedRoom = {
            ...mockRoom,
            width: 200,
            height: 150,
            area: 30000,
            perimeter: 700
        };

        panel.setRoom(updatedRoom);

        const widthElement = container.querySelector('[data-testid="room-width"]');
        const heightElement = container.querySelector('[data-testid="room-height"]');
        const areaElement = container.querySelector('[data-testid="room-area"]');
        const perimeterElement = container.querySelector('[data-testid="room-perimeter"]');

        expect(widthElement?.textContent).toContain('200');
        expect(heightElement?.textContent).toContain('150');
        expect(areaElement?.textContent).toContain('30000');
        expect(perimeterElement?.textContent).toContain('700');
    });

    it('should clear measurements when room is null', () => {
        panel.setRoom(mockRoom);
        panel.setRoom(null);

        const widthElement = container.querySelector('[data-testid="room-width"]');
        const heightElement = container.querySelector('[data-testid="room-height"]');
        const areaElement = container.querySelector('[data-testid="room-area"]');
        const perimeterElement = container.querySelector('[data-testid="room-perimeter"]');

        expect(widthElement?.textContent).toContain('0');
        expect(heightElement?.textContent).toContain('0');
        expect(areaElement?.textContent).toContain('0');
        expect(perimeterElement?.textContent).toContain('0');
    });

    it('should display validation errors', () => {
        const validationErrors: ValidationError[] = [
            {
                type: 'error',
                message: 'Room is too small',
                code: 'ROOM_TOO_SMALL'
            },
            {
                type: 'warning',
                message: 'Room is not square',
                code: 'ROOM_NOT_SQUARE'
            }
        ];

        const roomWithErrors = {
            ...mockRoom,
            validationErrors
        };

        panel.setRoom(roomWithErrors);

        const errorElements = container.querySelectorAll('[data-testid="validation-error"]');
        expect(errorElements).toHaveLength(2);
        expect(errorElements[0].textContent).toContain('Room is too small');
        expect(errorElements[1].textContent).toContain('Room is not square');
    });

    it('should clear validation errors when room is valid', () => {
        const validationErrors: ValidationError[] = [
            {
                type: 'error',
                message: 'Room is too small',
                code: 'ROOM_TOO_SMALL'
            }
        ];

        const roomWithErrors = {
            ...mockRoom,
            validationErrors
        };

        panel.setRoom(roomWithErrors);
        panel.setRoom(mockRoom);

        const errorElements = container.querySelectorAll('[data-testid="validation-error"]');
        expect(errorElements).toHaveLength(0);
    });

    it('should handle point selection', () => {
        const callback = jest.fn();
        panel.on('pointSelect', callback);

        panel.setRoom(mockRoom);
        const pointElement = container.querySelector('[data-testid="point-0"]');
        pointElement?.dispatchEvent(new MouseEvent('click'));

        expect(callback).toHaveBeenCalledWith(mockRoom.points[0]);
    });

    it('should update point coordinates', () => {
        const callback = jest.fn();
        panel.on('pointUpdate', callback);

        panel.setRoom(mockRoom);
        panel.setSelectedPoint(mockRoom.points[0]);

        const xInput = container.querySelector('[data-testid="point-x-input"]') as HTMLInputElement;
        const yInput = container.querySelector('[data-testid="point-y-input"]') as HTMLInputElement;

        xInput.value = '50';
        xInput.dispatchEvent(new Event('change'));
        yInput.value = '50';
        yInput.dispatchEvent(new Event('change'));

        expect(callback).toHaveBeenCalledWith({ ...mockRoom.points[0], x: 50, y: 50 });
    });
});
