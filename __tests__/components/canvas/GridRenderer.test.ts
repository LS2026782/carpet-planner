import { GridRenderer } from '../../../src/components/canvas/GridRenderer';
import { RenderContext } from '../../../src/components/canvas/types';
import { createTestCanvas, createTestRenderContext } from '../../utils/testUtils';

describe('GridRenderer', () => {
    let renderer: GridRenderer;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    beforeEach(() => {
        canvas = createTestCanvas();
        ctx = canvas.getContext('2d')!;

        renderer = new GridRenderer({
            ctx,
            width: canvas.width,
            height: canvas.height,
            zoom: 1,
            panX: 0,
            panY: 0,
            gridSize: 20
        });
    });

    it('should render grid lines', () => {
        const renderContext = createTestRenderContext();
        renderer.render(renderContext);

        // Verify grid lines were drawn
        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.lineTo).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
    });

    it('should handle zoom and pan', () => {
        const renderContext = createTestRenderContext({
            zoom: 2,
            panX: 100,
            panY: 50
        });

        renderer.render(renderContext);

        // Verify transformations were applied
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
    });

    it('should update grid size', () => {
        const newGridSize = 40;
        renderer.setGridSize(newGridSize);

        const renderContext = createTestRenderContext();
        renderer.render(renderContext);

        // Verify grid was rendered with new size
        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.lineTo).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
    });

    it('should handle window resize', () => {
        const newWidth = 1024;
        const newHeight = 768;
        renderer.setSize(newWidth, newHeight);

        const renderContext = createTestRenderContext({
            width: newWidth,
            height: newHeight
        });

        renderer.render(renderContext);

        // Verify grid was rendered with new dimensions
        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.lineTo).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
    });

    it('should clean up on destroy', () => {
        renderer.destroy();
        // Add any specific cleanup checks if needed
    });
});
