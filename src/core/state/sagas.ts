import { all, takeLatest, put, select, call } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './reducers';
import { Room } from './types/room';
import { Door } from './types/door';
import { Group } from '../services/GroupService';
import { Effect } from 'redux-saga/effects';

interface Point2D {
    x: number;
    y: number;
}

interface RoomDimensions {
    area: number;
    perimeter: number;
}

// Helper functions
function* calculateRoomDimensions(points: Point2D[]): Generator<Effect, RoomDimensions, any> {
    // Calculate area using the Shoelace formula
    let area = 0;
    let perimeter = 0;
    
    for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        area += points[i].x * points[j].y;
        area -= points[j].x * points[i].y;
        
        // Calculate distance between points for perimeter
        const dx = points[j].x - points[i].x;
        const dy = points[j].y - points[i].y;
        perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    
    area = Math.abs(area) / 2;
    return { area, perimeter };
}

type SagaEffect = Effect | Effect[];
type SagaGenerator<T = void> = Generator<SagaEffect, T, any>;

// Room sagas
function* handleRoomCreation(action: PayloadAction<Room>): SagaGenerator {
    try {
        const dimensions = yield call(calculateRoomDimensions, action.payload.points);
        yield put({ 
            type: 'room/updateRoom',
            payload: {
                id: action.payload.id,
                room: dimensions
            }
        });
    } catch (error) {
        console.error('Failed to calculate room dimensions:', error);
    }
}

function* handleRoomUpdate(action: PayloadAction<{ id: string; room: Partial<Room> }>): SagaGenerator {
    try {
        const state: RootState = yield select();
        const room = state.rooms.rooms[action.payload.id];
        
        if (room && action.payload.room.points) {
            const dimensions = yield call(calculateRoomDimensions, action.payload.room.points);
            yield put({
                type: 'room/updateRoom',
                payload: {
                    id: action.payload.id,
                    room: dimensions
                }
            });
        }
    } catch (error) {
        console.error('Failed to update room dimensions:', error);
    }
}

// Door sagas
function* handleDoorPlacement(action: PayloadAction<{ position: Point2D; roomId: string | null }>): SagaGenerator {
    try {
        const state: RootState = yield select();
        const { position, roomId } = action.payload;
        
        if (roomId) {
            const room = state.rooms.rooms[roomId];
            if (room) {
                // Validate door placement
                // TODO: Add door placement validation logic
                
                yield put({
                    type: 'door/finishPlacingDoor',
                    payload: { roomId }
                });
            }
        }
    } catch (error) {
        console.error('Failed to place door:', error);
        yield put({ type: 'door/cancelPlacingDoor' });
    }
}

// Group sagas
function* handleGroupCreation(action: PayloadAction<Group>): SagaGenerator {
    try {
        const state: RootState = yield select();
        const { objectIds } = action.payload;
        
        // Update all objects to reference the group
        for (const id of objectIds) {
            const room = state.rooms.rooms[id];
            const door = state.doors.doors[id];
            
            if (room) {
                yield put({
                    type: 'room/updateRoom',
                    payload: {
                        id,
                        room: { groupId: action.payload.id }
                    }
                });
            } else if (door) {
                yield put({
                    type: 'door/updateDoor',
                    payload: {
                        id,
                        door: { groupId: action.payload.id }
                    }
                });
            }
        }
    } catch (error) {
        console.error('Failed to create group:', error);
    }
}

function* handleGroupDeletion(action: PayloadAction<string>): SagaGenerator {
    try {
        const state: RootState = yield select();
        const group = state.groups.groups[action.payload];
        
        if (group) {
            // Remove group reference from all objects
            for (const id of group.objectIds) {
                const room = state.rooms.rooms[id];
                const door = state.doors.doors[id];
                
                if (room) {
                    yield put({
                        type: 'room/updateRoom',
                        payload: {
                            id,
                            room: { groupId: null }
                        }
                    });
                } else if (door) {
                    yield put({
                        type: 'door/updateDoor',
                        payload: {
                            id,
                            door: { groupId: null }
                        }
                    });
                }
            }
        }
    } catch (error) {
        console.error('Failed to delete group:', error);
    }
}

// UI sagas
function* handleThemeChange(action: PayloadAction<boolean>): SagaGenerator {
    try {
        // Update system theme preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches !== action.payload) {
            document.documentElement.classList.toggle('dark-mode', action.payload);
        }
    } catch (error) {
        console.error('Failed to update theme:', error);
    }
}

// Root saga
export function* rootSaga(): SagaGenerator {
    yield all([
        // Room sagas
        takeLatest('room/addRoom', handleRoomCreation),
        takeLatest('room/updateRoom', handleRoomUpdate),
        
        // Door sagas
        takeLatest('door/updatePlacementPreview', handleDoorPlacement),
        
        // Group sagas
        takeLatest('group/addGroup', handleGroupCreation),
        takeLatest('group/deleteGroup', handleGroupDeletion),
        
        // UI sagas
        takeLatest('ui/toggleDarkMode', handleThemeChange),
    ]);
}
