import { GeometryObject, Point2D, Transform2D } from '../../types/geometry';
import { ObjectMetadata } from '../../commands/types';

export interface DoorMeasurements {
    width: number;
    height: number;
    area: number;
    distanceFromStart: number;
    distanceFromEnd: number;
    angleFromWall: number;
}

export interface DoorStyle {
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    opacity?: number;
    dashPattern?: number[];
    handleStyle?: {
        size: number;
        color: string;
        position: 'left' | 'right';
    };
    swingDirection?: 'in' | 'out';
    swingAngle?: number;
}

export interface DoorValidation {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface Door {
    id: string;
    name?: string;
    geometry: GeometryObject;
    transform?: Transform2D;
    metadata: ObjectMetadata;
    style?: DoorStyle;
    measurements?: DoorMeasurements;
    validation?: DoorValidation;
    roomId: string | null;
    groupId?: string | null;
    isSelected?: boolean;
    isHovered?: boolean;
    isEditing?: boolean;
    isResizing?: boolean;
    isRotating?: boolean;
    isMoving?: boolean;
    isDragging?: boolean;
    isLocked?: boolean;
    isVisible?: boolean;
    zIndex?: number;
    tags?: string[];
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface DoorState {
    doors: { [id: string]: Door };
    selectedDoorId: string | null;
    hoveredDoorId: string | null;
    isPlacing: boolean;
    placementPreview: {
        position: Point2D;
        angle: number;
    } | null;
    defaultDoorWidth: number;
    defaultDoorHeight: number;
}

export interface DoorPlacementState {
    isPlacing: boolean;
    position: Point2D | null;
    angle: number;
    roomId: string | null;
    isValid: boolean;
    errors: string[];
}

export interface DoorEditingState {
    isEditing: boolean;
    originalTransform: Transform2D;
    currentTransform: Transform2D;
    isValid: boolean;
    errors: string[];
}

export interface DoorTransformState {
    isTransforming: boolean;
    originalTransform: Transform2D;
    currentTransform: Transform2D;
    transformType: 'move' | 'rotate' | 'scale' | null;
    transformOrigin: Point2D | null;
    transformStart: Point2D | null;
    isValid: boolean;
    errors: string[];
}

export interface DoorSelectionState {
    selectedDoorId: string | null;
    hoveredDoorId: string | null;
    selectionBox: {
        start: Point2D | null;
        end: Point2D | null;
    };
}

export interface DoorHistoryState {
    undoStack: Door[];
    redoStack: Door[];
    currentIndex: number;
    maxSize: number;
}

export interface DoorPreferences {
    defaultStyle: DoorStyle;
    snapToGrid: boolean;
    gridSize: number;
    defaultWidth: number;
    defaultHeight: number;
    showMeasurements: boolean;
    showValidation: boolean;
    measurementUnit: 'inches' | 'feet' | 'meters' | 'centimeters';
    measurementPrecision: number;
}

// Helper functions
export function isValidDoor(door: Door): DoorValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!door.id) errors.push('Door ID is required');
    if (!door.geometry) errors.push('Door geometry is required');
    if (!door.metadata) errors.push('Door metadata is required');

    // Check geometry
    if (door.geometry) {
        if (door.geometry.type !== 'rect') {
            errors.push('Door geometry must be a rectangle');
        } else {
            const rect = door.geometry.data as { width: number; height: number };
            if (rect.width <= 0) errors.push('Door width must be positive');
            if (rect.height <= 0) errors.push('Door height must be positive');
        }
    }

    // Check style
    if (door.style) {
        if (!isValidColor(door.style.fillColor)) {
            errors.push('Invalid fill color');
        }
        if (!isValidColor(door.style.strokeColor)) {
            errors.push('Invalid stroke color');
        }
        if (typeof door.style.strokeWidth !== 'number' || door.style.strokeWidth < 0) {
            errors.push('Invalid stroke width');
        }
        if (door.style.handleStyle) {
            if (!isValidColor(door.style.handleStyle.color)) {
                errors.push('Invalid handle color');
            }
            if (door.style.handleStyle.size <= 0) {
                errors.push('Handle size must be positive');
            }
        }
    }

    // Check measurements
    if (door.measurements) {
        if (door.measurements.width <= 0) errors.push('Door width must be positive');
        if (door.measurements.height <= 0) errors.push('Door height must be positive');
        if (door.measurements.angleFromWall < 0 || door.measurements.angleFromWall > 360) {
            errors.push('Door angle must be between 0 and 360 degrees');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

function isValidColor(color: string): boolean {
    // Basic color validation (hex, rgb, rgba)
    return /^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$|^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$|^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/.test(color);
}
