import { EditablePoint, EditableRoom } from './editor';

export interface PropertyPanelEvents {
    pointSelect: EditablePoint;
    pointHover: EditablePoint | null;
    roomUpdate: EditableRoom;
    settingsUpdate: RoomSettings;
    pointUpdate: EditablePoint;
    pointDelete: { roomId: string; pointId: string };
    unitChange: 'meters' | 'feet';
}

export interface PropertyPanelOptions {
    showMeasurements?: boolean;
    showValidation?: boolean;
    showPointList?: boolean;
    showSettings?: boolean;
    showCoordinates?: boolean;
    units?: 'meters' | 'feet';
    precision?: number;
    defaultRoomType?: string;
    defaultUnits?: 'meters' | 'feet';
    minRoomArea?: number;
    minPointDistance?: number;
    maxPoints?: number;
}

export interface MeasurementDisplayOptions {
    units: 'meters' | 'feet';
    precision: number;
    showLabels: boolean;
}

export interface ValidationDisplayOptions {
    showErrors: boolean;
    showWarnings: boolean;
    showSuggestions: boolean;
}

export interface PointListDisplayOptions {
    showCoordinates: boolean;
    showIndex: boolean;
    allowSelection: boolean;
    allowReordering: boolean;
}

export interface PropertyPanelState {
    room: EditableRoom | null;
    selectedPoint: EditablePoint | null;
    hoveredPoint: EditablePoint | null;
    measurements: RoomMeasurements | null;
    validationIssues: ValidationIssue[];
    settings: RoomSettings;
    selectedRoom: EditableRoom | null;
    isEditing: boolean;
    units: 'meters' | 'feet';
}

export interface RoomMeasurements {
    width: number;
    height: number;
    area: number;
    perimeter: number;
    units: 'meters' | 'feet';
}

export interface ValidationIssue {
    type: 'error' | 'warning' | 'suggestion';
    message: string;
    pointId?: string;
    pointIds?: string[];
}

export interface RoomSettings {
    roomType: string;
    units: 'meters' | 'feet';
    gridSize: number;
    snapToGrid: boolean;
    name?: string;
    type?: string;
    notes?: string;
    roomId?: string;
}

export const defaultPropertyPanelOptions: Required<PropertyPanelOptions> = {
    showMeasurements: true,
    showValidation: true,
    showPointList: true,
    showSettings: true,
    showCoordinates: true,
    units: 'meters',
    precision: 2,
    defaultRoomType: 'rectangular',
    defaultUnits: 'meters',
    minRoomArea: 1,
    minPointDistance: 0.1,
    maxPoints: 50
};

// Unit conversion utilities
export const metersToFeet = (meters: number): number => meters * 3.28084;
export const feetToMeters = (feet: number): number => feet / 3.28084;

// Formatting utilities
export const formatMeasurement = (value: number | undefined, units: 'meters' | 'feet', precision: number = 2): string => {
    if (value === undefined) return '-';
    const converted = units === 'feet' ? metersToFeet(value) : value;
    return `${converted.toFixed(precision)} ${units}`;
};

export const formatArea = (value: number | undefined, units: 'meters' | 'feet', precision: number = 2): string => {
    if (value === undefined) return '-';
    const converted = units === 'feet' ? metersToFeet(value) * metersToFeet(value) : value;
    return `${converted.toFixed(precision)} ${units}²`;
};
