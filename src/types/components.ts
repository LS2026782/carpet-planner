/**
 * Type definitions for components
 */

import { Room, Door, Point, Rectangle, CanvasContext, RenderState } from './models';

// Canvas Components
export interface GridRendererProps {
    ctx: CanvasContext;
    gridSize?: number;
}

export interface RoomRendererProps {
    ctx: CanvasContext;
    wallColor?: string;
    wallWidth?: number;
    selectedColor?: string;
    roomFillColor?: string;
}

export interface DoorRendererProps {
    ctx: CanvasContext;
    doorColor?: string;
    selectedColor?: string;
    doorWidth?: number;
    arcColor?: string;
}

export interface MeasurementRendererProps {
    ctx: CanvasContext;
    textColor?: string;
    lineColor?: string;
    fontSize?: number;
    fontFamily?: string;
    padding?: number;
    lineWidth?: number;
}

export interface CanvasRendererProps {
    canvas: HTMLCanvasElement;
}

// Room Components
export interface RoomEditorProps {
    room: Room;
    canvasRenderer: any; // TODO: Define CanvasRenderer type
    isEditing?: boolean;
}

export interface RoomListProps {
    container: HTMLElement;
    canvasRenderer: any;
    onRoomSelect?: (room: Room) => void;
}

export interface RoomFormProps {
    container: HTMLElement;
    roomEditor: any;
}

// Door Components
export interface DoorEditorProps {
    canvasRenderer: any;
    isEditing?: boolean;
    doors?: Door[];
}

export interface DoorControlsProps {
    container: HTMLElement;
    doorEditor: any;
}

// UI Components
export interface ToolbarProps {
    container: HTMLElement;
    roomEditor: any;
    doorEditor: any;
}

export interface SettingsPanelProps {
    container: HTMLElement;
    canvasRenderer: any;
}

export interface CalculationsPanelProps {
    container: HTMLElement;
}

// Common Component Methods
export interface ComponentMethods {
    show?: () => void;
    hide?: () => void;
    update?: (data: any) => void;
    reset?: () => void;
    setEnabled?: (enabled: boolean) => void;
    setVisible?: (visible: boolean) => void;
}

// Event Handlers
export interface CanvasEventHandlers {
    handleMouseDown: (event: MouseEvent) => void;
    handleMouseMove: (event: MouseEvent) => void;
    handleMouseUp: (event: MouseEvent) => void;
    handleClick?: (event: MouseEvent) => void;
}

// Settings
export interface SettingsGroup {
    title: string;
    settings: Setting[];
}

export interface Setting {
    id: string;
    label: string;
    type: 'number' | 'text' | 'select' | 'checkbox' | 'color';
    value: any;
    options?: { value: string; label: string }[];
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    onChange: (value: any) => void;
}

// Calculations
export interface RoomCalculations {
    area: number;
    carpetUsed: number;
    wastage: number;
}

export interface CarpetRequirement {
    type: string;
    width: number;
    length: number;
    quantity: number;
}

// Position
export interface Position {
    top?: number | string;
    left?: number | string;
    right?: number | string;
    bottom?: number | string;
}

// Common Props
export interface CommonProps {
    className?: string;
    style?: Partial<CSSStyleDeclaration>;
    id?: string;
}

// Component States
export interface EditingState {
    isEditing: boolean;
    currentItem: Room | Door | null;
    selectedItem: Room | Door | null;
    dragStart: Point | null;
    dragOffset: Point;
}

export interface PanelState {
    isVisible: boolean;
    position: Position;
}

export interface ToolbarState {
    activeMode: 'room' | 'door' | null;
    enabledButtons: string[];
}

// Component Classes
export interface CanvasRenderer {
    canvas: HTMLCanvasElement;
    ctx: CanvasContext;
    gridRenderer: GridRenderer;
    roomRenderer: RoomRenderer;
    doorRenderer: DoorRenderer;
    measurementRenderer: MeasurementRenderer;
    selectedRoom: Room | null;
    selectedDoor: Door | null;
    scale: number;
    offset: Point;
    render(state: RenderState): void;
    setSize(width: number, height: number): void;
    setScale(scale: number): void;
    setOffset(offset: Point): void;
    setSelectedRoom(room: Room | null): void;
    setSelectedDoor(door: Door | null): void;
    setGridSize(size: number): void;
}

export interface GridRenderer {
    ctx: CanvasContext;
    gridSize: number;
    gridColor: string;
    render(width: number, height: number): void;
    setGridSize(size: number): void;
    setGridColor(color: string): void;
}

export interface RoomRenderer {
    ctx: CanvasContext;
    wallColor: string;
    wallWidth: number;
    selectedColor: string;
    roomFillColor: string;
    render(room: Room, isSelected?: boolean): void;
    renderVertices(points: Point[]): void;
    setWallColor(color: string): void;
    setSelectedColor(color: string): void;
    setRoomFillColor(color: string): void;
    setWallWidth(width: number): void;
}

export interface DoorRenderer {
    ctx: CanvasContext;
    doorColor: string;
    selectedColor: string;
    doorWidth: number;
    arcColor: string;
    render(door: Door, isSelected?: boolean): void;
    renderDoorArc(door: Door): void;
    renderEndpoints(door: Door): void;
    getAngle(start: Point, end: Point): number;
    setDoorColor(color: string): void;
    setSelectedColor(color: string): void;
    setArcColor(color: string): void;
    setDoorWidth(width: number): void;
}

export interface MeasurementRenderer {
    ctx: CanvasContext;
    textColor: string;
    lineColor: string;
    fontSize: number;
    fontFamily: string;
    padding: number;
    lineWidth: number;
    renderRoomMeasurements(room: Room): void;
    renderDoorMeasurement(door: Door): void;
    renderWallMeasurement(start: Point, end: Point): void;
    renderMeasurementText(point: Point, length: number): void;
    calculateDistance(start: Point, end: Point): number;
    setTextColor(color: string): void;
    setLineColor(color: string): void;
    setFontSize(size: number): void;
    setFontFamily(font: string): void;
}
