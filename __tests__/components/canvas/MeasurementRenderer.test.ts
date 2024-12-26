import { MeasurementRenderer } from '../../../src/components/canvas/MeasurementRenderer';
import { RenderContext } from '../../../src/components/canvas/types';
import { createTestCanvas, createTestRenderContext } from '../../utils/testUtils';

describe('MeasurementRenderer', () => {
    let renderer: MeasurementRenderer;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    beforeEach(() => {
        canvas = createTestCanvas();
        ctx = canvas.getContext('2d')!;

        renderer = new MeasurementRenderer({
            ctx,
            width: canvas.width,
            height: canvas.height,
            zoom: 1,
            panX: 0,
            panY: 0,
            units: 'meters',
            precision: 2,
            showLabels: true
        });
    });

    it('should render measurement labels', () => {
        const renderContext = createTestRenderContext();
        renderer.render(renderContext);

        // Verify labels were drawn
        expect(ctx.fillText).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
    });

    it('should handle unit conversion', () => {
        renderer.setUnits('feet');
        const renderContext = createTestRenderContext();
        renderer.render(renderContext);

        // Verify text was drawn with converted units
        expect(ctx.fillText).toHaveBeenCalled();
        const calls = (ctx.fillText as jest.Mock).mock.calls;
        const someTextIncludesFeet = calls.some(([text]) => text.includes("'"));
        expect(someTextIncludesFeet).toBe(true);
    });

    it('should handle precision changes', () => {
        renderer.setPrecision(1);
        const renderContext = createTestRenderContext();
        renderer.render(renderContext);

        // Verify text was drawn with correct precision
        expect(ctx.fillText).toHaveBeenCalled();
        const calls = (ctx.fillText as jest.Mock).mock.calls;
        const someTextHasOneDecimal = calls.some(([text]) => /\d\.\d[m']/.test(text));
        expect(someTextHasOneDecimal).toBe(true);
    });

    it('should toggle label visibility', () => {
        renderer.setShowLabels(false);
        const renderContext = createTestRenderContext();
        renderer.render(renderContext);

        // Verify no labels were drawn
        expect(ctx.fillText).not.toHaveBeenCalled();
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

    it('should clean up on destroy', () => {
        renderer.destroy();
        // Add any specific cleanup checks if needed
    });
});
