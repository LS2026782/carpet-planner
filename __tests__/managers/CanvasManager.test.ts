import { CanvasManager } from '../../src/managers/CanvasManager';
import { RenderContext } from '../../src/components/canvas/types';
import {
    createTestCanvas,
    createTestRoom,
    createTestDoor,
    createTestRenderContext,
    wait,
    nextFrame
} from '../utils/testUtils';
import {
    createMockCanvasRenderer,
    createMockGridRenderer,
    createMockRoomRenderer,
    createMockDoorRenderer,
    createMockMeasurementRenderer
} from '../mocks/canvasRenderers';

describe('CanvasManager', () => {
    let manager: CanvasManager;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let mockCanvasRenderer: ReturnType<typeof createMockCanvasRenderer>;
    let mockGridRenderer: ReturnType<typeof createMockGridRenderer>;
    let mockRoomRenderer: ReturnType<typeof createMockRoomRenderer>;
    let mockDoorRenderer: ReturnType<typeof createMockDoorRenderer>;
    let mockMeasurementRenderer: ReturnType<typeof createMockMeasurementRenderer>;

    beforeEach(() => {
        // Setup canvas and context
        canvas = createTestCanvas();
        ctx = canvas.getContext('2d')!;

        // Create mock renderers
        mockCanvasRenderer = createMockCanvasRenderer();
        mockGridRenderer = createMockGridRenderer();
        mockRoomRenderer = createMockRoomRenderer();
        mockDoorRenderer = createMockDoorRenderer();
        mockMeasurementRenderer = createMockMeasurementRenderer();

        // Create manager with mock renderers
        manager = new CanvasManager(canvas, {
            canvasRenderer: mockCanvasRenderer,
            gridRenderer: mockGridRenderer,
            roomRenderer: mockRoomRenderer,
            doorRenderer: mockDoorRenderer,
            measurementRenderer: mockMeasurementRenderer
        });
    });

    afterEach(() => {
        manager.destroy();
    });

    it('should initialize with all renderers', () => {
        const expectedContext = createTestRenderContext();

        expect(mockCanvasRenderer.render).toHaveBeenCalledWith(
            expect.objectContaining(expectedContext)
        );
        expect(mockGridRenderer.render).toHaveBeenCalledWith(
            expect.objectContaining(expectedContext)
        );
        expect(mockRoomRenderer.render).toHaveBeenCalledWith(
            expect.objectContaining(expectedContext),
            expect.objectContaining({ rooms: [] })
        );
        expect(mockDoorRenderer.render).toHaveBeenCalledWith(
            expect.objectContaining(expectedContext),
            expect.objectContaining({ doors: [] })
        );
        expect(mockMeasurementRenderer.render).toHaveBeenCalledWith(
            expect.objectContaining(expectedContext)
        );
    });

    it('should render all components', () => {
        const room = createTestRoom();
        const door = createTestDoor();

        manager.setRooms([room]);
        manager.setDoors([door]);
        manager.render();

        // Verify each renderer was called with correct context
        const expectedContext = createTestRenderContext();
        expect(mockCanvasRenderer.render).toHaveBeenCalledWith(
            expect.objectContaining(expectedContext)
        );
        expect(mockGridRenderer.render).toHaveBeenCalledWith(
            expect.objectContaining(expectedContext)
        );
        expect(mockRoomRenderer.render).toHaveBeenCalledWith(
            expect.objectContaining(expectedContext),
            expect.objectContaining({ rooms: [room] })
        );
        expect(mockDoorRenderer.render).toHaveBeenCalledWith(
            expect.objectContaining(expectedContext),
            expect.objectContaining({ doors: [door] })
        );
        expect(mockMeasurementRenderer.render).toHaveBeenCalledWith(
            expect.objectContaining(expectedContext)
        );
    });

    it('should handle zoom and pan', () => {
        manager.setZoom(2);
        manager.setPan(100, 50);
        manager.render();

        const expectedContext = {
            ...createTestRenderContext(),
            zoom: 2,
            panX: 100,
            panY: 50,
            transform: {
                scale: 2,
                offset: { x: 100, y: 50 }
            }
        };

        expect(mockCanvasRenderer.render).toHaveBeenCalledWith(
            expect.objectContaining(expectedContext)
        );
    });

    it('should handle window resize', async () => {
        const newWidth = 1024;
        const newHeight = 768;
        canvas.width = newWidth;
        canvas.height = newHeight;

        manager.handleResize();
        await nextFrame(); // Wait for resize observer to trigger
        manager.render();

        const expectedContext = {
            ...createTestRenderContext(),
            width: newWidth,
            height: newHeight
        };

        expect(mockCanvasRenderer.render).toHaveBeenCalledWith(
            expect.objectContaining(expectedContext)
        );
    });

    it('should clean up resources on destroy', () => {
        manager.destroy();

        // Verify destroy was called on each renderer
        expect(mockCanvasRenderer.destroy).toHaveBeenCalled();
        expect(mockGridRenderer.destroy).toHaveBeenCalled();
        expect(mockRoomRenderer.destroy).toHaveBeenCalled();
        expect(mockDoorRenderer.destroy).toHaveBeenCalled();
        expect(mockMeasurementRenderer.destroy).toHaveBeenCalled();
    });

    it('should handle animation frame updates', async () => {
        manager.startAnimation();
        await nextFrame();
        expect(mockCanvasRenderer.render).toHaveBeenCalled();
        manager.stopAnimation();
    });

    it('should update room selection', () => {
        const room = createTestRoom();
        manager.setSelectedRoom(room);
        manager.render();
        expect(mockRoomRenderer.setSelectedRoom).toHaveBeenCalledWith(room);
    });

    it('should update door selection', () => {
        const door = createTestDoor();
        manager.setSelectedDoor(door);
        manager.render();
        expect(mockDoorRenderer.setSelectedDoor).toHaveBeenCalledWith(door);
    });

    it('should handle measurement settings', () => {
        manager.setMeasurementUnits('feet');
        manager.setMeasurementPrecision(1);
        manager.setShowMeasurements(false);
        manager.render();

        expect(mockMeasurementRenderer.setUnits).toHaveBeenCalledWith('feet');
        expect(mockMeasurementRenderer.setPrecision).toHaveBeenCalledWith(1);
        expect(mockMeasurementRenderer.setShowLabels).toHaveBeenCalledWith(false);
    });
});
