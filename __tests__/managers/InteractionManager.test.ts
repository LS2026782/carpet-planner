import { InteractionManager } from '../../src/managers/InteractionManager';
import { InteractionHandler, InteractionMode } from '../../src/types/events';
import { createTestCanvas } from '../utils/testUtils';

describe('InteractionManager', () => {
    let manager: InteractionManager;
    let canvas: HTMLCanvasElement;
    let handler: InteractionHandler;

    beforeEach(() => {
        canvas = createTestCanvas();
        manager = new InteractionManager(canvas);
        handler = {
            onDrag: jest.fn(),
            onResize: jest.fn(),
            onRotate: jest.fn(),
            onSelect: jest.fn(),
            onHover: jest.fn(),
            onDraw: jest.fn(),
            onKeyboard: jest.fn(),
            onGesture: jest.fn()
        };
        manager.addHandler(handler);
        manager.enable();
    });

    afterEach(() => {
        manager.destroy();
    });

    describe('Mode Management', () => {
        it('should start in select mode', () => {
            expect(manager.getMode()).toBe('select');
        });

        it('should change modes', () => {
            manager.setMode('draw');
            expect(manager.getMode()).toBe('draw');
        });

        it('should maintain state', () => {
            const state = manager.getState();
            expect(state.mode).toBe('select');
            expect(state.isDrawing).toBe(false);
            expect(state.isDragging).toBe(false);
            expect(state.isResizing).toBe(false);
            expect(state.isRotating).toBe(false);
        });
    });

    describe('Mouse Events', () => {
        it('should handle left click in draw mode', () => {
            manager.setMode('draw');
            canvas.dispatchEvent(new MouseEvent('mousedown', {
                button: 0,
                clientX: 100,
                clientY: 100
            }));

            expect(handler.onDraw).toHaveBeenCalledWith(expect.objectContaining({
                type: 'drawStart',
                point: expect.any(Object)
            }));
        });

        it('should handle drag operations', () => {
            // Start drag
            canvas.dispatchEvent(new MouseEvent('mousedown', {
                button: 0,
                clientX: 100,
                clientY: 100
            }));

            // Move while dragging
            canvas.dispatchEvent(new MouseEvent('mousemove', {
                clientX: 150,
                clientY: 150
            }));

            // End drag
            canvas.dispatchEvent(new MouseEvent('mouseup'));

            expect(handler.onDrag).toHaveBeenCalledWith(expect.objectContaining({
                type: 'dragStart'
            }));
            expect(handler.onDrag).toHaveBeenCalledWith(expect.objectContaining({
                type: 'drag'
            }));
            expect(handler.onDrag).toHaveBeenCalledWith(expect.objectContaining({
                type: 'dragEnd'
            }));
        });

        it('should handle right click rotation in select mode', () => {
            // Start rotation
            canvas.dispatchEvent(new MouseEvent('mousedown', {
                button: 2,
                clientX: 100,
                clientY: 100
            }));

            // Move while rotating
            canvas.dispatchEvent(new MouseEvent('mousemove', {
                clientX: 150,
                clientY: 150
            }));

            // End rotation
            canvas.dispatchEvent(new MouseEvent('mouseup'));

            expect(handler.onRotate).toHaveBeenCalledWith(expect.objectContaining({
                type: 'rotateStart'
            }));
            expect(handler.onRotate).toHaveBeenCalledWith(expect.objectContaining({
                type: 'rotate'
            }));
            expect(handler.onRotate).toHaveBeenCalledWith(expect.objectContaining({
                type: 'rotateEnd'
            }));
        });

        it('should handle hover events', () => {
            canvas.dispatchEvent(new MouseEvent('mousemove', {
                clientX: 100,
                clientY: 100
            }));

            expect(handler.onHover).toHaveBeenCalledWith(expect.objectContaining({
                type: 'hover',
                point: expect.any(Object)
            }));
        });
    });

    describe('Touch Events', () => {
        it('should handle single touch drag', () => {
            const touchStart = new TouchEvent('touchstart', {
                touches: [{ clientX: 100, clientY: 100 } as Touch]
            });
            const touchMove = new TouchEvent('touchmove', {
                touches: [{ clientX: 150, clientY: 150 } as Touch]
            });
            const touchEnd = new TouchEvent('touchend', {
                touches: []
            });

            canvas.dispatchEvent(touchStart);
            canvas.dispatchEvent(touchMove);
            canvas.dispatchEvent(touchEnd);

            expect(handler.onDrag).toHaveBeenCalledWith(expect.objectContaining({
                type: 'dragStart'
            }));
            expect(handler.onDrag).toHaveBeenCalledWith(expect.objectContaining({
                type: 'drag'
            }));
            expect(handler.onDrag).toHaveBeenCalledWith(expect.objectContaining({
                type: 'dragEnd'
            }));
        });

        it('should handle pinch gesture', () => {
            const touchStart = new TouchEvent('touchstart', {
                touches: [
                    { clientX: 100, clientY: 100 } as Touch,
                    { clientX: 200, clientY: 200 } as Touch
                ]
            });
            const touchMove = new TouchEvent('touchmove', {
                touches: [
                    { clientX: 50, clientY: 50 } as Touch,
                    { clientX: 250, clientY: 250 } as Touch
                ]
            });

            canvas.dispatchEvent(touchStart);
            canvas.dispatchEvent(touchMove);

            expect(handler.onGesture).toHaveBeenCalledWith(expect.objectContaining({
                type: 'pinch',
                scale: expect.any(Number),
                rotation: expect.any(Number)
            }));
        });
    });

    describe('Keyboard Events', () => {
        it('should handle keyboard events', () => {
            const keyDown = new KeyboardEvent('keydown', {
                key: 'Escape',
                ctrlKey: true
            });
            const keyUp = new KeyboardEvent('keyup', {
                key: 'Escape',
                ctrlKey: true
            });

            window.dispatchEvent(keyDown);
            window.dispatchEvent(keyUp);

            expect(handler.onKeyboard).toHaveBeenCalledWith(expect.objectContaining({
                type: 'keyDown',
                key: 'Escape',
                ctrlKey: true
            }));
            expect(handler.onKeyboard).toHaveBeenCalledWith(expect.objectContaining({
                type: 'keyUp',
                key: 'Escape',
                ctrlKey: true
            }));
        });
    });

    describe('Handler Management', () => {
        it('should add and remove handlers', () => {
            const newHandler: InteractionHandler = {
                onDrag: jest.fn()
            };

            manager.addHandler(newHandler);
            canvas.dispatchEvent(new MouseEvent('mousedown', {
                button: 0,
                clientX: 100,
                clientY: 100
            }));
            expect(newHandler.onDrag).toHaveBeenCalled();

            manager.removeHandler(newHandler);
            canvas.dispatchEvent(new MouseEvent('mousedown', {
                button: 0,
                clientX: 200,
                clientY: 200
            }));
            expect(newHandler.onDrag).toHaveBeenCalledTimes(1);
        });
    });

    describe('Enable/Disable', () => {
        it('should ignore events when disabled', () => {
            manager.disable();

            canvas.dispatchEvent(new MouseEvent('mousedown', {
                button: 0,
                clientX: 100,
                clientY: 100
            }));

            expect(handler.onDrag).not.toHaveBeenCalled();
        });

        it('should handle events when re-enabled', () => {
            manager.disable();
            manager.enable();

            canvas.dispatchEvent(new MouseEvent('mousedown', {
                button: 0,
                clientX: 100,
                clientY: 100
            }));

            expect(handler.onDrag).toHaveBeenCalled();
        });
    });

    describe('Cleanup', () => {
        it('should clean up resources on destroy', () => {
            manager.destroy();

            canvas.dispatchEvent(new MouseEvent('mousedown', {
                button: 0,
                clientX: 100,
                clientY: 100
            }));

            expect(handler.onDrag).not.toHaveBeenCalled();
        });
    });
});
