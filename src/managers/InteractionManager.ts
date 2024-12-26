import { EventEmitter } from '../utils/EventEmitter';
import {
    InteractionMode,
    InteractionState,
    InteractionHandler,
    InteractionEvent,
    DragEvent,
    ResizeEvent,
    RotateEvent,
    SelectEvent,
    HoverEvent,
    DrawEvent,
    KeyboardEvent as CustomKeyboardEvent,
    GestureEvent
} from '../types/events';
import { Point2D } from '../components/canvas/types';

interface InteractionEvents {
    drag: DragEvent;
    resize: ResizeEvent;
    rotate: RotateEvent;
    select: SelectEvent;
    hover: HoverEvent;
    draw: DrawEvent;
    keyboard: CustomKeyboardEvent;
    gesture: GestureEvent;
    modeChange: InteractionMode;
    stateChange: InteractionState;
}

export class InteractionManager extends EventEmitter<InteractionEvents> {
    private canvas: HTMLCanvasElement;
    private handlers: Set<InteractionHandler>;
    private enabled: boolean;
    private state: InteractionState;
    private touchStartTime: number;
    private lastTapTime: number;
    private doubleTapDelay: number;
    private touchStartDistance: number;
    private touchStartAngle: number;

    constructor(canvas: HTMLCanvasElement) {
        super();
        this.canvas = canvas;
        this.handlers = new Set();
        this.enabled = false;
        this.touchStartTime = 0;
        this.lastTapTime = 0;
        this.doubleTapDelay = 300; // ms
        this.touchStartDistance = 0;
        this.touchStartAngle = 0;

        this.state = {
            mode: 'select',
            isDrawing: false,
            isDragging: false,
            isResizing: false,
            isRotating: false,
            startPoint: null,
            currentPoint: null,
            selectedRoom: null,
            selectedDoor: null,
            selectedPoint: null,
            hoveredRoom: null,
            hoveredDoor: null,
            hoveredPoint: null
        };

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));

        // Touch events
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));

        // Keyboard events
        window.addEventListener('keydown', (e: globalThis.KeyboardEvent) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e: globalThis.KeyboardEvent) => this.handleKeyUp(e));

        // Context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    private getEventPoint(event: MouseEvent | Touch): Point2D {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    private handleMouseDown(event: MouseEvent): void {
        if (!this.enabled) return;

        const point = this.getEventPoint(event);
        this.state.startPoint = point;
        this.state.currentPoint = point;

        if (event.button === 0) { // Left click
            this.handlePrimaryButtonDown(event);
        } else if (event.button === 2) { // Right click
            this.handleSecondaryButtonDown(event);
        }
    }

    private handleMouseMove(event: MouseEvent): void {
        if (!this.enabled) return;

        const point = this.getEventPoint(event);
        this.state.currentPoint = point;

        if (this.state.isDragging) {
            this.handleDrag(event);
        } else if (this.state.isResizing) {
            this.handleResize(event);
        } else if (this.state.isRotating) {
            this.handleRotate(event);
        } else {
            this.handleHover(event);
        }
    }

    private handleMouseUp(event: MouseEvent): void {
        if (!this.enabled) return;

        if (this.state.isDragging) {
            this.endDrag(event);
        } else if (this.state.isResizing) {
            this.endResize(event);
        } else if (this.state.isRotating) {
            this.endRotate(event);
        }

        this.state.startPoint = null;
        this.state.currentPoint = null;
    }

    private handleWheel(event: WheelEvent): void {
        if (!this.enabled) return;

        if (event.ctrlKey) {
            event.preventDefault();
            // Pinch zoom gesture
            const scale = 1 - event.deltaY * 0.01;
            this.handleGesture({
                type: 'pinch',
                scale,
                center: this.getEventPoint(event)
            });
        }
    }

    private handleTouchStart(event: TouchEvent): void {
        if (!this.enabled) return;
        event.preventDefault();

        const now = Date.now();
        this.touchStartTime = now;

        if (event.touches.length === 1) {
            const point = this.getEventPoint(event.touches[0]);
            this.state.startPoint = point;
            this.state.currentPoint = point;

            if (now - this.lastTapTime < this.doubleTapDelay) {
                this.handleDoubleTap(event);
            }
        } else if (event.touches.length === 2) {
            this.handleMultiTouchStart(event);
        }
    }

    private handleTouchMove(event: TouchEvent): void {
        if (!this.enabled) return;
        event.preventDefault();

        if (event.touches.length === 1) {
            const point = this.getEventPoint(event.touches[0]);
            this.state.currentPoint = point;
            this.handleDrag(event);
        } else if (event.touches.length === 2) {
            this.handleMultiTouchMove(event);
        }
    }

    private handleTouchEnd(event: TouchEvent): void {
        if (!this.enabled) return;
        event.preventDefault();

        if (event.touches.length === 0) {
            if (Date.now() - this.touchStartTime < 200) {
                this.lastTapTime = Date.now();
                this.handleTap(event);
            }
            this.endDrag(event);
        }

        if (event.touches.length < 2) {
            this.touchStartDistance = 0;
            this.touchStartAngle = 0;
        }
    }

    private handleKeyDown(event: globalThis.KeyboardEvent): void {
        if (!this.enabled) return;

        this.notifyHandlers('onKeyboard', {
            type: 'keyDown',
            key: event.key,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
            originalEvent: event
        });
    }

    private handleKeyUp(event: globalThis.KeyboardEvent): void {
        if (!this.enabled) return;

        this.notifyHandlers('onKeyboard', {
            type: 'keyUp',
            key: event.key,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
            originalEvent: event
        });
    }

    private handlePrimaryButtonDown(event: MouseEvent): void {
        if (this.state.mode === 'draw') {
            this.notifyHandlers('onSelect', {
                type: 'select',
                point: this.state.currentPoint!,
                target: null,
                originalEvent: event
            });
        } else {
            this.startDrag(event);
        }
    }

    private handleSecondaryButtonDown(event: MouseEvent): void {
        if (this.state.mode === 'select') {
            this.startRotate(event);
        }
    }

    private startDrag(event: MouseEvent | TouchEvent): void {
        this.state.isDragging = true;
        this.notifyHandlers('onDrag', {
            type: 'dragStart',
            point: this.state.startPoint!,
            startPoint: this.state.startPoint!,
            delta: { x: 0, y: 0 },
            originalEvent: event
        });
    }

    private startRotate(event: MouseEvent | TouchEvent): void {
        this.state.isRotating = true;
        this.notifyHandlers('onRotate', {
            type: 'rotateStart',
            point: this.state.startPoint!,
            angle: 0,
            center: this.state.startPoint!,
            originalEvent: event
        });
    }

    private handleDrag(event: MouseEvent | TouchEvent): void {
        if (!this.state.startPoint || !this.state.currentPoint) return;

        const delta = {
            x: this.state.currentPoint.x - this.state.startPoint.x,
            y: this.state.currentPoint.y - this.state.startPoint.y
        };

        this.notifyHandlers('onDrag', {
            type: 'drag',
            point: this.state.currentPoint,
            startPoint: this.state.startPoint,
            delta,
            originalEvent: event
        });
    }

    private handleResize(event: MouseEvent | TouchEvent): void {
        if (!this.state.startPoint || !this.state.currentPoint) return;

        const center = this.state.startPoint;
        const startDistance = Math.hypot(
            this.state.startPoint.x - center.x,
            this.state.startPoint.y - center.y
        );
        const currentDistance = Math.hypot(
            this.state.currentPoint.x - center.x,
            this.state.currentPoint.y - center.y
        );
        const scale = currentDistance / startDistance;

        this.notifyHandlers('onResize', {
            type: 'resize',
            point: this.state.currentPoint,
            scale,
            center,
            originalEvent: event
        });
    }

    private handleRotate(event: MouseEvent | TouchEvent): void {
        if (!this.state.startPoint || !this.state.currentPoint) return;

        const center = this.state.startPoint;
        const startAngle = Math.atan2(
            this.state.startPoint.y - center.y,
            this.state.startPoint.x - center.x
        );
        const currentAngle = Math.atan2(
            this.state.currentPoint.y - center.y,
            this.state.currentPoint.x - center.x
        );
        const angle = (currentAngle - startAngle) * (180 / Math.PI);

        this.notifyHandlers('onRotate', {
            type: 'rotate',
            point: this.state.currentPoint,
            angle,
            center,
            originalEvent: event
        });
    }

    private handleHover(event: MouseEvent): void {
        this.notifyHandlers('onHover', {
            type: 'hover',
            point: this.state.currentPoint!,
            target: null,
            originalEvent: event
        });
    }

    private endDrag(event: MouseEvent | TouchEvent): void {
        if (this.state.isDragging) {
            this.notifyHandlers('onDrag', {
                type: 'dragEnd',
                point: this.state.currentPoint!,
                startPoint: this.state.startPoint!,
                delta: {
                    x: this.state.currentPoint!.x - this.state.startPoint!.x,
                    y: this.state.currentPoint!.y - this.state.startPoint!.y
                },
                originalEvent: event
            });
            this.state.isDragging = false;
        }
    }

    private endResize(event: MouseEvent | TouchEvent): void {
        if (this.state.isResizing) {
            this.notifyHandlers('onResize', {
                type: 'resizeEnd',
                point: this.state.currentPoint!,
                scale: 1,
                center: this.state.startPoint!,
                originalEvent: event
            });
            this.state.isResizing = false;
        }
    }

    private endRotate(event: MouseEvent | TouchEvent): void {
        if (this.state.isRotating) {
            this.notifyHandlers('onRotate', {
                type: 'rotateEnd',
                point: this.state.currentPoint!,
                angle: 0,
                center: this.state.startPoint!,
                originalEvent: event
            });
            this.state.isRotating = false;
        }
    }

    private handleDoubleTap(event: TouchEvent): void {
        this.notifyHandlers('onSelect', {
            type: 'select',
            point: this.state.currentPoint!,
            target: null,
            originalEvent: event
        });
    }

    private handleTap(event: TouchEvent): void {
        this.notifyHandlers('onSelect', {
            type: 'select',
            point: this.state.currentPoint!,
            target: null,
            originalEvent: event
        });
    }

    private handleMultiTouchStart(event: TouchEvent): void {
        if (event.touches.length !== 2) return;

        const touch1 = this.getEventPoint(event.touches[0]);
        const touch2 = this.getEventPoint(event.touches[1]);

        this.touchStartDistance = Math.hypot(
            touch2.x - touch1.x,
            touch2.y - touch1.y
        );

        this.touchStartAngle = Math.atan2(
            touch2.y - touch1.y,
            touch2.x - touch1.x
        );
    }

    private handleMultiTouchMove(event: TouchEvent): void {
        if (event.touches.length !== 2) return;

        const touch1 = this.getEventPoint(event.touches[0]);
        const touch2 = this.getEventPoint(event.touches[1]);

        const currentDistance = Math.hypot(
            touch2.x - touch1.x,
            touch2.y - touch1.y
        );

        const currentAngle = Math.atan2(
            touch2.y - touch1.y,
            touch2.x - touch1.x
        );

        const scale = currentDistance / this.touchStartDistance;
        const rotation = (currentAngle - this.touchStartAngle) * (180 / Math.PI);

        const center = {
            x: (touch1.x + touch2.x) / 2,
            y: (touch1.y + touch2.y) / 2
        };

        this.handleGesture({
            type: 'pinch',
            scale,
            rotation,
            center
        });
    }

    private handleGesture(gesture: GestureEvent): void {
        this.notifyHandlers('onGesture', gesture);
    }

    private notifyHandlers<K extends keyof InteractionHandler>(
        method: K,
        event: Parameters<NonNullable<InteractionHandler[K]>>[0]
    ): void {
        this.handlers.forEach(handler => {
            const callback = handler[method];
            if (callback) {
                callback(event as any);
            }
        });
    }

    public setMode(mode: InteractionMode): void {
        this.state.mode = mode;
        this.emit('modeChange', mode);
        // Update mode for all handlers that support it
        this.handlers.forEach(handler => {
            if ('setMode' in handler) {
                (handler as any).setMode(mode);
            }
        });
    }

    public getMode(): InteractionMode {
        return this.state.mode;
    }

    public getState(): InteractionState {
        return { ...this.state };
    }

    public addHandler(handler: InteractionHandler): void {
        this.handlers.add(handler);
    }

    public removeHandler(handler: InteractionHandler): void {
        this.handlers.delete(handler);
    }

    public enable(): void {
        this.enabled = true;
    }

    public disable(): void {
        this.enabled = false;
    }

    public destroy(): void {
        this.disable();
        this.handlers.clear();
        this.removeAllListeners();
    }
}
