import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Door } from '../types/door';
import { ObjectMetadata } from '../../commands/types';
import { Transform2D } from '../../types/geometry';

export interface DoorState {
    doors: { [id: string]: Door };
    selectedDoorId: string | null;
    hoveredDoorId: string | null;
    isPlacing: boolean;
    placementPreview: {
        position: { x: number; y: number };
        angle: number;
    } | null;
    defaultDoorWidth: number;
    defaultDoorHeight: number;
}

const initialState: DoorState = {
    doors: {},
    selectedDoorId: null,
    hoveredDoorId: null,
    isPlacing: false,
    placementPreview: null,
    defaultDoorWidth: 32,
    defaultDoorHeight: 80,
};

export const doorSlice = createSlice({
    name: 'door',
    initialState,
    reducers: {
        addDoor: (state, action: PayloadAction<Door>) => {
            const door = action.payload;
            state.doors[door.id] = door;
        },
        updateDoor: (state, action: PayloadAction<{
            id: string;
            geometry?: Door['geometry'];
            metadata?: Partial<ObjectMetadata>;
            transform?: Transform2D;
            roomId?: string | null;
        }>) => {
            const { id, ...updates } = action.payload;
            const door = state.doors[id];
            if (door) {
                Object.assign(door, updates);
            }
        },
        deleteDoor: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            delete state.doors[id];
            if (state.selectedDoorId === id) {
                state.selectedDoorId = null;
            }
            if (state.hoveredDoorId === id) {
                state.hoveredDoorId = null;
            }
        },
        selectDoor: (state, action: PayloadAction<string | null>) => {
            state.selectedDoorId = action.payload;
        },
        hoverDoor: (state, action: PayloadAction<string | null>) => {
            state.hoveredDoorId = action.payload;
        },
        startPlacingDoor: (state) => {
            state.isPlacing = true;
            state.placementPreview = null;
        },
        updatePlacementPreview: (state, action: PayloadAction<{
            position: { x: number; y: number };
            angle: number;
        }>) => {
            state.placementPreview = action.payload;
        },
        finishPlacingDoor: (state) => {
            state.isPlacing = false;
            state.placementPreview = null;
        },
        cancelPlacingDoor: (state) => {
            state.isPlacing = false;
            state.placementPreview = null;
        },
        setDoors: (state, action: PayloadAction<{ [id: string]: Door }>) => {
            state.doors = action.payload;
        },
        clearDoors: (state) => {
            state.doors = {};
            state.selectedDoorId = null;
            state.hoveredDoorId = null;
            state.isPlacing = false;
            state.placementPreview = null;
        },
        setDefaultDoorSize: (state, action: PayloadAction<{
            width: number;
            height: number;
        }>) => {
            state.defaultDoorWidth = action.payload.width;
            state.defaultDoorHeight = action.payload.height;
        },
    },
});

export const {
    addDoor,
    updateDoor,
    deleteDoor,
    selectDoor,
    hoverDoor,
    startPlacingDoor,
    updatePlacementPreview,
    finishPlacingDoor,
    cancelPlacingDoor,
    setDoors,
    clearDoors,
    setDefaultDoorSize,
} = doorSlice.actions;

export default doorSlice.reducer;
