import { RoomRenderer } from '../../../src/components/canvas/RoomRenderer';
import { Room, RoomPoint } from '../../../src/components/canvas/types';
import { createTestCanvas, createTestRoom, createTestRenderContext } from '../../utils/testUtils';

describe('RoomRenderer', () => {
    let renderer: RoomRenderer;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    beforeEach(() => {
        canvas = createTestCanvas();
        ctx = canvas.getContext('2d')!;

        renderer = new RoomRenderer({
            ctx,
            width: canvas.width,
            height: canvas.height,
            zoom: 1,
            panX: 0,
            panY: 0,
            rooms: []
        });
    });

    it('should render rooms', () => {
        const room = createTestRoom();
        const renderContext = createTestRenderContext();
        renderer.render(renderContext, { rooms: [room] });

        // Verify room was drawn
        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.lineTo).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
    });

    it('should handle room selection', () => {
        const room = createTestRoom();
        renderer.setSelectedRoom(room);

        const renderContext = createTestRenderContext();
        renderer.render(renderContext, { rooms: [room] });

        // Verify selected room style
        expect(ctx.strokeStyle).toBe('#007bff');
    });

    it('should handle point selection', () => {
        const room = createTestRoom();
        const point = room.points[0];
        renderer.setSelectedPoint(point);

        const renderContext = createTestRenderContext();
        renderer.render(renderContext, { rooms: [room] });

        // Verify point highlight was drawn
        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.arc).toHaveBeenCalled();
        expect(ctx.fill).toHaveBeenCalled();
    });

    it('should handle point hover', () => {
        const room = createTestRoom();
        const point = room.points[0];
        renderer.setHoveredPoint(point);

        const renderContext = createTestRenderContext();
        renderer.render(renderContext, { rooms: [room] });

        // Verify hovered point style
        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.arc).toHaveBeenCalled();
        expect(ctx.fill).toHaveBeenCalled();
    });

    it('should handle measurements', () => {
        const room = createTestRoom();
        renderer.setShowMeasurements(true);

        const renderContext = createTestRenderContext();
        renderer.render(renderContext, { rooms: [room] });

        // Verify measurements were drawn
        expect(ctx.fillText).toHaveBeenCalled();
    });

    it('should handle zoom and pan', () => {
        const room = createTestRoom();
        const renderContext = createTestRenderContext({
            zoom: 2,
            panX: 100,
            panY: 50
        });

        renderer.render(renderContext, { rooms: [room] });

        // Verify transformations were applied
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
    });

    it('should clean up on destroy', () => {
        renderer.destroy();
        // Add any specific cleanup checks if needed
    });
});
