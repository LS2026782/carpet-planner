/**
 * Type definitions for core models
 */

export interface Point {
    x: number;
    y: number;
}

export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Room {
    id: number;
    name: string;
    points: Point[];
    rectangles: Rectangle[];
    drops: any[]; // TODO: Define Drop interface
    area: number;
    carpetUsed: number;
    wastage: number;
    color: string;
    carpetType: 'standard' | 'premium' | 'luxury';
    carpetWidth: number;
    pileDirection: 'north' | 'south' | 'east' | 'west';
    lastModified: Date;
    showMeasurements?: boolean;
}

export interface Door {
    x: number;
    y: number;
    width: number;
    roomId: number;
    swingDirection: 'inward' | 'outward';
    swingLeft: boolean;
    transitionType: 'standard' | 'threshold' | 'reducer';
    start: Point;
    end: Point;
    showMeasurements?: boolean;
}

export interface Config {
    GRID: {
        SIZE: number;
        VISIBLE: boolean;
    };
    MEASUREMENTS: {
        UNITS: 'feet' | 'meters';
        PRECISION: number;
    };
    DISPLAY: {
        SHOW_MEASUREMENTS: boolean;
        SHOW_ROOM_NAMES: boolean;
        THEME: 'light' | 'dark';
    };
    PIXELS_PER_FOOT: number;
}

export interface RenderState {
    rooms?: Room[];
    doors?: Door[];
    previewRectangle?: Rectangle;
    previewDoor?: Door;
}

export interface EventEmitter {
    on(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
    emit(event: string, ...args: any[]): void;
}

export interface CanvasContext extends CanvasRenderingContext2D {
    // Add any custom canvas context methods here if needed
}
