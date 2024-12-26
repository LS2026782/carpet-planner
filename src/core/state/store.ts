import { configureStore, Middleware } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { rootSaga } from './sagas';
import rootReducer from './reducers';

const sagaMiddleware = createSagaMiddleware();

const middleware: Middleware[] = [sagaMiddleware];

// Add development middleware
if (process.env.NODE_ENV === 'development') {
    const { createLogger } = require('redux-logger');
    middleware.push(
        createLogger({
            collapsed: true,
            diff: true,
            colors: {
                title: () => '#8c61ff',
                prevState: () => '#ff9eb1',
                action: () => '#61dafb',
                nextState: () => '#69db7c',
                error: () => '#ff6b6b',
            },
        })
    );
}

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        thunk: false,
        serializableCheck: {
            // Ignore these action types
            ignoredActions: [
                'canvas/setViewportSize',
                'canvas/setViewportOffset',
                'canvas/setViewportScale',
                'canvas/setViewportRotation',
                'canvas/startDragging',
                'canvas/updateDragging',
                'canvas/startRotating',
                'canvas/startScaling',
                'canvas/updateCursorPosition',
                'canvas/startSelection',
                'canvas/updateSelection',
            ],
            // Ignore these field paths in all actions
            ignoredActionPaths: [
                'payload.geometry',
                'payload.transform',
                'payload.metadata',
                'payload.points',
                'payload.center',
                'payload.position',
            ],
            // Ignore these paths in the state
            ignoredPaths: [
                'rooms.rooms',
                'doors.doors',
                'groups.groups',
                'canvas.viewport',
                'canvas.interaction',
                'canvas.cursor',
                'canvas.selection',
            ],
        },
    }).concat(middleware),
    devTools: process.env.NODE_ENV !== 'production',
});

sagaMiddleware.run(rootSaga);

// Export store types
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
export type AppState = ReturnType<typeof store.getState>;

// Export store singleton
export default store;
