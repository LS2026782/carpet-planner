import { Room, Door, Point2D, RoomPoint } from '../components/canvas/types';

export interface EditablePoint extends RoomPoint {
    isValid?: boolean;
    error?: string;
    type?: 'corner' | 'midpoint' | 'point';
}

export interface EditableRoom extends Room {
    isValid?: boolean;
    error?: string;
    points: EditablePoint[];
    width?: number;
    height?: number;
    area?: number;
    perimeter?: number;
    validationErrors?: ValidationError[];
}

export interface ValidationError {
    message: string;
    type: 'error' | 'warning';
    field?: string;
    code?: string;
}

export interface SnapResult {
    x: number;
    y: number;
    snapped: boolean;
    point?: Point2D;
    target?: Point2D;
    distance?: number;
}

export interface EditorState {
    rooms: Room[];
    doors: Door[];
    selectedRoom: Room | null;
    selectedDoor: Door | null;
    selectedPoint: RoomPoint | null;
    hoveredPoint: RoomPoint | null;
    hoveredRoom: Room | null;
    hoveredDoor: Door | null;
    zoom: number;
    panX: number;
    panY: number;
    gridSize: number;
    snapToGrid: boolean;
    showMeasurements: boolean;
    measurementUnits: 'meters' | 'feet';
    measurementPrecision: number;
    isDrawing: boolean;
    isDragging: boolean;
    isResizing: boolean;
    isRotating: boolean;
    dragStartPoint: Point2D | null;
    dragEndPoint: Point2D | null;
    mousePosition: Point2D | null;
}

export interface EditorAction {
    type: string;
    payload?: any;
}

export interface EditorContext {
    state: EditorState;
    dispatch: (action: EditorAction) => void;
}

export interface EditorProps {
    width: number;
    height: number;
    initialState?: Partial<EditorState>;
    onChange?: (state: EditorState) => void;
    onRoomCreate?: (room: Room) => void;
    onRoomUpdate?: (room: Room) => void;
    onRoomDelete?: (roomId: string) => void;
    onDoorCreate?: (door: Door) => void;
    onDoorUpdate?: (door: Door) => void;
    onDoorDelete?: (doorId: string) => void;
}

export interface RoomValidationResult {
    isValid: boolean;
    message?: string;
    errors?: ValidationError[];
}

export interface DoorValidationResult {
    isValid: boolean;
    message?: string;
    errors?: ValidationError[];
}

export interface RoomUtils {
    createRoom: (points: RoomPoint[]) => Room;
    updateRoom: (room: Room, updates: Partial<Room>) => Room;
    validateRoom: (room: Room) => RoomValidationResult;
    getRoomArea: (room: Room) => number;
    getRoomPerimeter: (room: Room) => number;
    isPointInRoom: (point: Point2D, room: Room) => boolean;
    isPointNearRoomEdge: (point: Point2D, room: Room, threshold: number) => boolean;
    getRoomCenter: (room: Room) => Point2D;
    rotateRoom: (room: Room, angle: number, center?: Point2D) => Room;
    scaleRoom: (room: Room, scale: number, center?: Point2D) => Room;
    snapPointToGrid: (point: Point2D, gridSize: number) => Point2D;
}

export interface DoorUtils {
    createDoor: (x: number, y: number, width: number, height: number) => Door;
    updateDoor: (door: Door, updates: Partial<Door>) => Door;
    validateDoor: (door: Door, room: Room) => DoorValidationResult;
    isDoorInWall: (door: Door, room: Room) => boolean;
    rotateDoor: (door: Door, angle: number) => Door;
    snapDoorToWall: (door: Door, room: Room) => Door;
}

export interface EditorCommands {
    undo: () => void;
    redo: () => void;
    selectRoom: (room: Room | null) => void;
    selectDoor: (door: Door | null) => void;
    selectPoint: (point: RoomPoint | null) => void;
    addRoom: (room: Room) => void;
    updateRoom: (room: Room) => void;
    deleteRoom: (roomId: string) => void;
    addDoor: (door: Door) => void;
    updateDoor: (door: Door) => void;
    deleteDoor: (doorId: string) => void;
    setZoom: (zoom: number) => void;
    setPan: (x: number, y: number) => void;
    setGridSize: (size: number) => void;
    toggleSnapToGrid: () => void;
    toggleMeasurements: () => void;
    setMeasurementUnits: (units: 'meters' | 'feet') => void;
    setMeasurementPrecision: (precision: number) => void;
}

export interface EditorHistory {
    past: EditorState[];
    present: EditorState;
    future: EditorState[];
}

export interface EditorKeyboardShortcuts {
    [key: string]: () => void;
}

// Utility functions
export const createPoint = (x: number, y: number, id?: string): RoomPoint => ({
    id: id || `p${Date.now()}`,
    x,
    y
});

export const createRoom = (points: RoomPoint[], id?: string): Room => ({
    id: id || `r${Date.now()}`,
    points
});
