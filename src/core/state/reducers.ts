import { combineReducers } from '@reduxjs/toolkit';
import roomReducer from './slices/roomSlice';
import doorReducer from './slices/doorSlice';
import uiReducer from './slices/uiSlice';
import canvasReducer from './slices/canvasSlice';
import groupReducer from './slices/groupSlice';

const rootReducer = combineReducers({
    rooms: roomReducer,
    doors: doorReducer,
    groups: groupReducer,
    ui: uiReducer,
    canvas: canvasReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
