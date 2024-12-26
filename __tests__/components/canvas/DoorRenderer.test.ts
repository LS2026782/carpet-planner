import { DoorRenderer } from '../../../src/components/canvas/DoorRenderer';
import { Door, RenderContext } from '../../../src/components/canvas/types';
import { createTestCanvas, createTestDoor, createTestRenderContext } from '../../utils/testUtils';

describe('DoorRenderer', () => {
    let renderer: DoorRenderer;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    beforeEach(() => {
        canvas = createTestCanvas();
        ctx = canvas.getContext('2d')!;

        renderer = new DoorRenderer({
            ctx,
            width: canvas.width,
            height: canvas.height,
            zoom: 1,
            panX: 0,
            panY: 0,
            doors: []
        });
    });

    it('should render doors', () => {
        const door = createTestDoor();
        const renderContext = createTestRenderContext();
        renderer.render(renderContext, { doors: [door] });

        // Verify door was drawn
        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.rect).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
    });

    it('should handle door selection', () => {
        const door = createTestDoor();
        renderer.setSelectedDoor(door);

        const renderContext = createTestRenderContext();
        renderer.render(renderContext, { doors: [door] });

        // Verify selected door style
        expect(ctx.strokeStyle).toBe('#007bff');
    });

    it('should handle door hover', () => {
        const door = createTestDoor();
        renderer.setHoveredDoor(door);

        const renderContext = createTestRenderContext();
        renderer.render(renderContext, { doors: [door] });

        // Verify hovered door style
        expect(ctx.strokeStyle).toBe('#6c757d');
    });

    it('should handle measurements', () => {
        const door = createTestDoor();
        renderer.setShowMeasurements(true);

        const renderContext = createTestRenderContext();
        renderer.render(renderContext, { doors: [door] });

        // Verify measurements were drawn
        expect(ctx.fillText).toHaveBeenCalled();
    });

    it('should handle zoom and pan', () => {
        const door = createTestDoor();
        const renderContext = createTestRenderContext({
            zoom: 2,
            panX: 100,
            panY: 50
        });

        renderer.render(renderContext, { doors: [door] });

        // Verify transformations were applied
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.translate).toHaveBeenCalled();
        expect(ctx.rotate).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
    });

    it('should handle door rotation', () => {
        const door = createTestDoor({ rotation: 45 });
        const renderContext = createTestRenderContext();
        renderer.render(renderContext, { doors: [door] });

        // Verify rotation was applied
        expect(ctx.rotate).toHaveBeenCalledWith(45 * Math.PI / 180);
    });

    it('should clean up on destroy', () => {
        renderer.destroy();
        // Add any specific cleanup checks if needed
    });
});
