import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Point2D } from '../../types/geometry';

export interface CanvasState {
    viewport: {
        width: number;
        height: number;
        offset: Point2D;
        scale: number;
        rotation: number;
    };
    interaction: {
        isDragging: boolean;
        dragStart: Point2D | null;
        dragOffset: Point2D;
        isRotating: boolean;
        rotationCenter: Point2D | null;
        rotationStart: number | null;
        isScaling: boolean;
        scaleCenter: Point2D | null;
        scaleStart: number | null;
    };
    cursor: {
        position: Point2D;
        isOverCanvas: boolean;
        type: string;
    };
    selection: {
        isSelecting: boolean;
        selectionBox: {
            start: Point2D | null;
            end: Point2D | null;
        };
    };
}

const initialState: CanvasState = {
    viewport: {
        width: 800,
        height: 600,
        offset: { x: 0, y: 0 },
        scale: 1,
        rotation: 0,
    },
    interaction: {
        isDragging: false,
        dragStart: null,
        dragOffset: { x: 0, y: 0 },
        isRotating: false,
        rotationCenter: null,
        rotationStart: null,
        isScaling: false,
        scaleCenter: null,
        scaleStart: null,
    },
    cursor: {
        position: { x: 0, y: 0 },
        isOverCanvas: false,
        type: 'default',
    },
    selection: {
        isSelecting: false,
        selectionBox: {
            start: null,
            end: null,
        },
    },
};

export const canvasSlice = createSlice({
    name: 'canvas',
    initialState,
    reducers: {
        // Viewport actions
        setViewportSize: (state, action: PayloadAction<{ width: number; height: number }>) => {
            state.viewport.width = action.payload.width;
            state.viewport.height = action.payload.height;
        },
        setViewportOffset: (state, action: PayloadAction<Point2D>) => {
            state.viewport.offset = action.payload;
        },
        setViewportScale: (state, action: PayloadAction<number>) => {
            state.viewport.scale = action.payload;
        },
        setViewportRotation: (state, action: PayloadAction<number>) => {
            state.viewport.rotation = action.payload;
        },

        // Interaction actions
        startDragging: (state, action: PayloadAction<Point2D>) => {
            state.interaction.isDragging = true;
            state.interaction.dragStart = action.payload;
            state.interaction.dragOffset = { x: 0, y: 0 };
        },
        updateDragging: (state, action: PayloadAction<Point2D>) => {
            if (state.interaction.dragStart) {
                state.interaction.dragOffset = {
                    x: action.payload.x - state.interaction.dragStart.x,
                    y: action.payload.y - state.interaction.dragStart.y,
                };
            }
        },
        stopDragging: (state) => {
            state.interaction.isDragging = false;
            state.interaction.dragStart = null;
            state.interaction.dragOffset = { x: 0, y: 0 };
        },
        startRotating: (state, action: PayloadAction<{ center: Point2D; start: number }>) => {
            state.interaction.isRotating = true;
            state.interaction.rotationCenter = action.payload.center;
            state.interaction.rotationStart = action.payload.start;
        },
        updateRotating: (state, action: PayloadAction<number>) => {
            state.viewport.rotation = action.payload;
        },
        stopRotating: (state) => {
            state.interaction.isRotating = false;
            state.interaction.rotationCenter = null;
            state.interaction.rotationStart = null;
        },
        startScaling: (state, action: PayloadAction<{ center: Point2D; start: number }>) => {
            state.interaction.isScaling = true;
            state.interaction.scaleCenter = action.payload.center;
            state.interaction.scaleStart = action.payload.start;
        },
        updateScaling: (state, action: PayloadAction<number>) => {
            state.viewport.scale = action.payload;
        },
        stopScaling: (state) => {
            state.interaction.isScaling = false;
            state.interaction.scaleCenter = null;
            state.interaction.scaleStart = null;
        },

        // Cursor actions
        updateCursorPosition: (state, action: PayloadAction<Point2D>) => {
            state.cursor.position = action.payload;
        },
        setCursorOverCanvas: (state, action: PayloadAction<boolean>) => {
            state.cursor.isOverCanvas = action.payload;
        },
        setCursorType: (state, action: PayloadAction<string>) => {
            state.cursor.type = action.payload;
        },

        // Selection actions
        startSelection: (state, action: PayloadAction<Point2D>) => {
            state.selection.isSelecting = true;
            state.selection.selectionBox.start = action.payload;
            state.selection.selectionBox.end = action.payload;
        },
        updateSelection: (state, action: PayloadAction<Point2D>) => {
            state.selection.selectionBox.end = action.payload;
        },
        stopSelection: (state) => {
            state.selection.isSelecting = false;
            state.selection.selectionBox.start = null;
            state.selection.selectionBox.end = null;
        },

        // Reset actions
        resetViewport: (state) => {
            state.viewport = initialState.viewport;
        },
        resetInteraction: (state) => {
            state.interaction = initialState.interaction;
        },
        resetCanvas: () => initialState,
    },
});

export const {
    setViewportSize,
    setViewportOffset,
    setViewportScale,
    setViewportRotation,
    startDragging,
    updateDragging,
    stopDragging,
    startRotating,
    updateRotating,
    stopRotating,
    startScaling,
    updateScaling,
    stopScaling,
    updateCursorPosition,
    setCursorOverCanvas,
    setCursorType,
    startSelection,
    updateSelection,
    stopSelection,
    resetViewport,
    resetInteraction,
    resetCanvas,
} = canvasSlice.actions;

export default canvasSlice.reducer;
