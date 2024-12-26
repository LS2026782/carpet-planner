import { EventEmitter } from '../utils/EventEmitter';
import { CanvasAccessibility } from '../utils/CanvasAccessibility';
import {
    Point2D,
    Room,
    Door,
    RoomPoint,
    GridRenderer as IGridRenderer,
    RoomRenderer as IRoomRenderer,
    DoorRenderer as IDoorRenderer,
    MeasurementRenderer as IMeasurementRenderer,
    RenderContext,
    GridRendererOptions,
    RoomRendererOptions,
    DoorRendererOptions,
    MeasurementRendererOptions
} from '../components/canvas/types';
import { GridRenderer } from '../components/canvas/GridRenderer';
import { RoomRenderer } from '../components/canvas/RoomRenderer';
import { DoorRenderer } from '../components/canvas/DoorRenderer';
import { MeasurementRenderer } from '../components/canvas/MeasurementRenderer';
import { adaptPointsToRoomPoints } from '../utils/typeAdapters';

interface CanvasManagerEvents {
    cursorMove: Point2D;
    click: Point2D;
    modeChange: string;
    gridSizeChange: number;
}

interface CanvasManagerOptions {
    gridSize?: number;
    enableAccessibility?: boolean;
    enableSound?: boolean;
}

interface CanvasState {
    width: number;
    height: number;
    zoom: number;
    panX: number;
    panY: number;
    rooms: Room[];
    doors: Door[];
    selectedRoom: Room | null;
    selectedDoor: Door | null;
    previewPoints: RoomPoint[];
    units: 'meters' | 'feet';
    precision: number;
    showLabels: boolean;
}

/**
 * Manages canvas rendering and accessibility features
 * @extends EventEmitter<CanvasManagerEvents>
 */
export class CanvasManager extends EventEmitter<CanvasManagerEvents> {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private accessibility: CanvasAccessibility;
    private gridRenderer: IGridRenderer;
    private roomRenderer: IRoomRenderer;
    private doorRenderer: IDoorRenderer;
    private measurementRenderer: IMeasurementRenderer;
    private animationFrameId?: number;
    private cursorElement: HTMLDivElement;
    private modeElement: HTMLDivElement;
    private gridSize: number;
    private state: CanvasState;

    constructor(canvas: HTMLCanvasElement, options: CanvasManagerOptions = {}) {
        super();

        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Could not get canvas context');
        }
        this.context = context;

        // Initialize grid size
        this.gridSize = options.gridSize || 20;

        // Initialize state
        this.state = {
            width: canvas.width,
            height: canvas.height,
            zoom: 1,
            panX: 0,
            panY: 0,
            rooms: [],
            doors: [],
            selectedRoom: null,
            selectedDoor: null,
            previewPoints: [],
            units: 'meters',
            precision: 2,
            showLabels: true
        };

        // Create canvas container for accessibility elements
        const container = document.createElement('div');
        container.className = 'canvas-container';
        canvas.parentElement?.insertBefore(container, canvas);
        container.appendChild(canvas);

        // Create cursor element
        this.cursorElement = document.createElement('div');
        this.cursorElement.className = 'canvas-cursor';
        container.appendChild(this.cursorElement);

        // Create mode indicator
        this.modeElement = document.createElement('div');
        this.modeElement.className = 'canvas-mode';
        this.modeElement.textContent = 'Navigate';
        container.appendChild(this.modeElement);

        // Initialize renderers
        const baseOptions = {
            ctx: this.context,
            width: this.state.width,
            height: this.state.height,
            zoom: this.state.zoom,
            panX: this.state.panX,
            panY: this.state.panY
        };

        this.gridRenderer = new GridRenderer({
            ...baseOptions,
            gridSize: this.gridSize
        } as GridRendererOptions);

        this.roomRenderer = new RoomRenderer({
            ...baseOptions,
            rooms: this.state.rooms,
            selectedRoom: this.state.selectedRoom,
            showMeasurements: true
        } as RoomRendererOptions);

        this.doorRenderer = new DoorRenderer({
            ...baseOptions,
            doors: this.state.doors,
            selectedDoor: this.state.selectedDoor,
            showMeasurements: true
        } as DoorRendererOptions);

        this.measurementRenderer = new MeasurementRenderer({
            ...baseOptions,
            units: this.state.units,
            precision: this.state.precision,
            showLabels: this.state.showLabels
        } as MeasurementRendererOptions);

        // Initialize accessibility features
        this.accessibility = new CanvasAccessibility({
            canvas,
            gridSize: this.gridSize,
            enableSound: options.enableSound ?? true,
            announceActions: options.enableAccessibility ?? true
        });

        // Set up accessibility event listeners
        this.setupAccessibilityEvents();
    }

    /**
     * Sets up accessibility event listeners
     * @private
     */
    private setupAccessibilityEvents(): void {
        this.accessibility.on('move', (position) => {
            this.updateCursor(position);
            this.emit('cursorMove', position);
        });

        this.accessibility.on('click', (position) => {
            this.emit('click', position);
        });

        this.accessibility.on('modeChange', (mode) => {
            this.updateMode(mode);
            this.emit('modeChange', mode);
        });

        // Update cursor position on mouse move
        this.canvas.addEventListener('mousemove', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const position = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
            this.accessibility.setCursorPosition(position);
        });
    }

    /**
     * Updates the cursor position and appearance
     * @private
     */
    private updateCursor(position: Point2D): void {
        this.cursorElement.style.left = `${position.x}px`;
        this.cursorElement.style.top = `${position.y}px`;
        this.cursorElement.dataset.mode = this.accessibility.getCurrentMode();
    }

    /**
     * Updates the mode indicator
     * @private
     */
    private updateMode(mode: string): void {
        this.modeElement.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
        this.cursorElement.dataset.mode = mode;
    }

    /**
     * Sets the rooms to render
     */
    setRooms(rooms: Room[]): void {
        this.state.rooms = rooms;
        this.roomRenderer.setRooms(rooms);
    }

    /**
     * Sets the selected room
     */
    setSelectedRoom(room: Room | null): void {
        this.state.selectedRoom = room;
        this.roomRenderer.setSelectedRoom(room);
    }

    /**
     * Sets the preview points
     */
    setPreviewPoints(points: Point2D[] | null): void {
        if (points === null) {
            this.state.previewPoints = [];
        } else {
            this.state.previewPoints = adaptPointsToRoomPoints(points);
        }
        this.roomRenderer.setPreviewPoints(points || []);
    }

    /**
     * Sets the doors to render
     */
    setDoors(doors: Door[]): void {
        this.state.doors = doors;
        this.doorRenderer.setDoors(doors);
    }

    /**
     * Sets the selected door
     */
    setSelectedDoor(door: Door | null): void {
        this.state.selectedDoor = door;
        this.doorRenderer.setSelectedDoor(door);
    }

    /**
     * Starts the animation loop
     */
    startAnimation(): void {
        const animate = () => {
            this.render();
            this.animationFrameId = requestAnimationFrame(animate);
        };
        animate();
    }

    /**
     * Stops the animation loop
     */
    stopAnimation(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    /**
     * Renders the canvas
     * @private
     */
    private render(): void {
        // Clear canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update state
        this.state.width = this.canvas.width;
        this.state.height = this.canvas.height;

        // Create render context
        const context: RenderContext = {
            ctx: this.context,
            width: this.state.width,
            height: this.state.height,
            zoom: this.state.zoom,
            panX: this.state.panX,
            panY: this.state.panY,
            transform: {
                scale: this.state.zoom,
                offset: { x: this.state.panX, y: this.state.panY }
            },
            offset: { x: this.state.panX, y: this.state.panY },
            scale: this.state.zoom
        };

        // Render layers
        this.gridRenderer.render(context);
        this.roomRenderer.render(context);
        this.doorRenderer.render(context);
        this.measurementRenderer.render(context);
    }

    /**
     * Handles canvas resize
     */
    handleResize(): void {
        this.state.width = this.canvas.width;
        this.state.height = this.canvas.height;

        const context: RenderContext = {
            ctx: this.context,
            width: this.state.width,
            height: this.state.height,
            zoom: this.state.zoom,
            panX: this.state.panX,
            panY: this.state.panY,
            transform: {
                scale: this.state.zoom,
                offset: { x: this.state.panX, y: this.state.panY }
            },
            offset: { x: this.state.panX, y: this.state.panY },
            scale: this.state.zoom
        };

        this.gridRenderer.render(context);
        this.roomRenderer.render(context);
        this.doorRenderer.render(context);
        this.measurementRenderer.render(context);
    }

    /**
     * Sets the grid size
     */
    setGridSize(size: number): void {
        this.gridSize = size;
        this.gridRenderer.setGridSize(size);
        this.accessibility.setGridSize(size);
        this.emit('gridSizeChange', size);
    }

    /**
     * Gets the grid size
     */
    getGridSize(): number {
        return this.gridSize;
    }

    /**
     * Enables or disables sound effects
     */
    setSoundEnabled(enabled: boolean): void {
        this.accessibility.setSoundEnabled(enabled);
    }

    /**
     * Enables or disables screen reader announcements
     */
    setAnnouncementsEnabled(enabled: boolean): void {
        this.accessibility.setAnnouncementsEnabled(enabled);
    }

    /**
     * Cleans up resources
     */
    destroy(): void {
        this.stopAnimation();
        this.accessibility.destroy();
        this.gridRenderer.destroy();
        this.roomRenderer.destroy();
        this.doorRenderer.destroy();
        this.measurementRenderer.destroy();
        this.removeAllListeners();
    }
}
