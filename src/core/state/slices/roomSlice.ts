import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Room } from '../types/room';
import { ObjectMetadata } from '../../commands/types';
import { Transform2D } from '../../types/geometry';

export interface RoomState {
    rooms: { [id: string]: Room };
    selectedRoomId: string | null;
    hoveredRoomId: string | null;
    selectedPointId: string | null;
    hoveredPointId: string | null;
    isDrawing: boolean;
    drawingPoints: Room['points'];
}

const initialState: RoomState = {
    rooms: {},
    selectedRoomId: null,
    hoveredRoomId: null,
    selectedPointId: null,
    hoveredPointId: null,
    isDrawing: false,
    drawingPoints: [],
};

export const roomSlice = createSlice({
    name: 'room',
    initialState,
    reducers: {
        addRoom: (state, action: PayloadAction<Room>) => {
            const room = action.payload;
            state.rooms[room.id] = room;
        },
        updateRoom: (state, action: PayloadAction<{
            id: string;
            geometry?: Room['geometry'];
            metadata?: Partial<ObjectMetadata>;
            transform?: Transform2D;
            points?: Room['points'];
        }>) => {
            const { id, ...updates } = action.payload;
            const room = state.rooms[id];
            if (room) {
                Object.assign(room, updates);
            }
        },
        deleteRoom: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            delete state.rooms[id];
            if (state.selectedRoomId === id) {
                state.selectedRoomId = null;
            }
            if (state.hoveredRoomId === id) {
                state.hoveredRoomId = null;
            }
        },
        selectRoom: (state, action: PayloadAction<string | null>) => {
            state.selectedRoomId = action.payload;
        },
        hoverRoom: (state, action: PayloadAction<string | null>) => {
            state.hoveredRoomId = action.payload;
        },
        selectPoint: (state, action: PayloadAction<string | null>) => {
            state.selectedPointId = action.payload;
        },
        hoverPoint: (state, action: PayloadAction<string | null>) => {
            state.hoveredPointId = action.payload;
        },
        startDrawing: (state) => {
            state.isDrawing = true;
            state.drawingPoints = [];
        },
        addDrawingPoint: (state, action: PayloadAction<Room['points'][0]>) => {
            state.drawingPoints.push(action.payload);
        },
        updateDrawingPoint: (state, action: PayloadAction<{
            index: number;
            point: Room['points'][0];
        }>) => {
            const { index, point } = action.payload;
            if (index >= 0 && index < state.drawingPoints.length) {
                state.drawingPoints[index] = point;
            }
        },
        finishDrawing: (state) => {
            state.isDrawing = false;
            state.drawingPoints = [];
        },
        cancelDrawing: (state) => {
            state.isDrawing = false;
            state.drawingPoints = [];
        },
        setRooms: (state, action: PayloadAction<{ [id: string]: Room }>) => {
            state.rooms = action.payload;
        },
        clearRooms: (state) => {
            state.rooms = {};
            state.selectedRoomId = null;
            state.hoveredRoomId = null;
            state.selectedPointId = null;
            state.hoveredPointId = null;
            state.isDrawing = false;
            state.drawingPoints = [];
        },
    },
});

export const {
    addRoom,
    updateRoom,
    deleteRoom,
    selectRoom,
    hoverRoom,
    selectPoint,
    hoverPoint,
    startDrawing,
    addDrawingPoint,
    updateDrawingPoint,
    finishDrawing,
    cancelDrawing,
    setRooms,
    clearRooms,
} = roomSlice.actions;

export default roomSlice.reducer;
