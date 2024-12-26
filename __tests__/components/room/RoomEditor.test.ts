import { RoomEditor } from '../../../src/components/room/RoomEditor';
import { Room, RoomPoint } from '../../../src/components/canvas/types';
import { EditableRoom, EditablePoint } from '../../../src/types/editor';
import { createTestCanvas } from '../../utils/testUtils';

describe('RoomEditor', () => {
    let editor: RoomEditor;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    beforeEach(() => {
        canvas = createTestCanvas();
        ctx = canvas.getContext('2d')!;
        editor = new RoomEditor(canvas);
    });

    it('should create editable points', () => {
        const point: EditablePoint = {
            id: 'p1',
            x: 100,
            y: 100,
            type: 'corner',
            isValid: true
        };

        const room: EditableRoom = {
            id: 'room1',
            points: [point],
            isValid: true
        };

        editor.setActiveRoom(room);
        expect(editor.getActiveRoom()).toBe(room);
    });

    it('should handle point selection', () => {
        const point: EditablePoint = {
            id: 'p1',
            x: 100,
            y: 100,
            type: 'corner'
        };

        editor.setSelectedPoint(point);
        expect(editor.getSelectedPoint()).toBe(point);
    });

    it('should handle point dragging', () => {
        const point: EditablePoint = {
            id: 'p1',
            x: 100,
            y: 100,
            type: 'corner'
        };

        const mouseEvent = new MouseEvent('mousedown', {
            clientX: 100,
            clientY: 100
        });

        editor.startDrag(point, mouseEvent, { x: 100, y: 100 });
        editor.drag({ x: 150, y: 150 }, mouseEvent);
        editor.endDrag();

        const updatedPoint = editor.getActiveRoom()?.points.find((p: RoomPoint) => p.id === point.id);
        expect(updatedPoint?.x).toBe(150);
        expect(updatedPoint?.y).toBe(150);
    });

    it('should validate points during drag', () => {
        const point: EditablePoint = {
            id: 'p1',
            x: 100,
            y: 100,
            type: 'corner'
        };

        const mouseEvent = new MouseEvent('mousedown', {
            clientX: 100,
            clientY: 100
        });

        editor.startDrag(point, mouseEvent, { x: 100, y: 100 });
        editor.drag({ x: -50, y: -50 }, mouseEvent);
        editor.endDrag();

        const updatedPoint = editor.getActiveRoom()?.points.find((p: RoomPoint) => p.id === point.id);
        expect(updatedPoint?.isValid).toBe(false);
    });

    it('should handle room rotation', () => {
        const points: EditablePoint[] = [
            { id: 'p1', x: 0, y: 0, type: 'corner' },
            { id: 'p2', x: 100, y: 0, type: 'corner' },
            { id: 'p3', x: 100, y: 100, type: 'corner' },
            { id: 'p4', x: 0, y: 100, type: 'corner' }
        ];

        const room: EditableRoom = {
            id: 'room1',
            points,
            isValid: true
        };

        editor.setActiveRoom(room);
        editor.rotateRoom(45); // 45 degrees clockwise

        const rotatedRoom = editor.getActiveRoom();
        expect(rotatedRoom?.points[0].x).not.toBe(0);
        expect(rotatedRoom?.points[0].y).not.toBe(0);
    });

    it('should handle room scaling', () => {
        const points: EditablePoint[] = [
            { id: 'p1', x: 0, y: 0, type: 'corner' },
            { id: 'p2', x: 100, y: 0, type: 'corner' },
            { id: 'p3', x: 100, y: 100, type: 'corner' },
            { id: 'p4', x: 0, y: 100, type: 'corner' }
        ];

        const room: EditableRoom = {
            id: 'room1',
            points,
            isValid: true
        };

        editor.setActiveRoom(room);
        editor.scaleRoom(2); // Double the size

        const scaledRoom = editor.getActiveRoom();
        expect(scaledRoom?.points[1].x).toBe(200);
        expect(scaledRoom?.points[1].y).toBe(0);
    });

    afterEach(() => {
        editor.destroy();
    });
});
