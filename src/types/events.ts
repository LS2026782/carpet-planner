import { Point2D } from '../components/canvas/types';
import { Room } from '../models/Room';
import { Door } from '../models/Door';

export type InteractionMode = 'select' | 'draw' | 'door';

export interface InteractionState {
    mode: InteractionMode;
    isDrawing: boolean;
    isDragging: boolean;
    isResizing: boolean;
    isRotating: boolean;
    startPoint: Point2D | null;
    currentPoint: Point2D | null;
    selectedRoom: Room | null;
    selectedDoor: Door | null;
    selectedPoint: Point2D | null;
    hoveredRoom: Room | null;
    hoveredDoor: Door | null;
    hoveredPoint: Point2D | null;
}

export type RoomPoint = {
    index: number;
    point: Point2D;
    room: Room;
};

export interface BaseEvent {
    type: string;
    originalEvent: Event;
}

export interface SelectEvent extends BaseEvent {
    type: 'select';
    point: Point2D;
    target: Room | Door | RoomPoint | null;
}

export interface DragEvent extends BaseEvent {
    type: 'drag' | 'dragStart' | 'dragEnd';
    point: Point2D;
    startPoint: Point2D;
    delta: Point2D;
}

export interface RotateEvent extends BaseEvent {
    type: 'rotate' | 'rotateStart' | 'rotateEnd';
    point: Point2D;
    angle: number;
    center: Point2D;
}

export interface ResizeEvent extends BaseEvent {
    type: 'resize' | 'resizeStart' | 'resizeEnd';
    point: Point2D;
    scale: number;
    center: Point2D;
}

export interface HoverEvent extends BaseEvent {
    type: 'hover';
    point: Point2D;
    target: Room | Door | RoomPoint | null;
}

export interface DrawEvent extends BaseEvent {
    type: 'draw';
    point: Point2D;
    points: Point2D[];
}

export interface KeyboardEvent {
    type: 'keyDown' | 'keyUp';
    key: string;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
    originalEvent: Event;
}

export interface GestureEvent {
    type: 'pinch' | 'rotate' | 'pan';
    scale?: number;
    rotation?: number;
    center?: Point2D;
}

export interface InteractionHandler {
    onDrag?(event: DragEvent): void;
    onRotate?(event: RotateEvent): void;
    onResize?(event: ResizeEvent): void;
    onSelect?(event: SelectEvent): void;
    onHover?(event: HoverEvent): void;
    onDraw?(event: DrawEvent): void;
    onKeyboard?(event: KeyboardEvent): void;
    onGesture?(event: GestureEvent): void;
    setMode?(mode: InteractionMode): void;
}
