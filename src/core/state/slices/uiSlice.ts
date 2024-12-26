import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
    theme: {
        isDarkMode: boolean;
        highContrast: boolean;
        fontSize: number;
    };
    panels: {
        isCalculationsPanelOpen: boolean;
        isSettingsPanelOpen: boolean;
        isToolbarOpen: boolean;
        isKeyboardHelpOpen: boolean;
    };
    tooltips: {
        isEnabled: boolean;
        delay: number;
    };
    grid: {
        isVisible: boolean;
        size: number;
        snapToGrid: boolean;
    };
    measurements: {
        isVisible: boolean;
        unit: 'inches' | 'feet' | 'meters' | 'centimeters';
        precision: number;
    };
    zoom: {
        level: number;
        min: number;
        max: number;
    };
    errors: {
        messages: Array<{
            id: string;
            type: 'error' | 'warning' | 'info';
            message: string;
            timestamp: number;
        }>;
    };
}

const initialState: UIState = {
    theme: {
        isDarkMode: false,
        highContrast: false,
        fontSize: 14,
    },
    panels: {
        isCalculationsPanelOpen: true,
        isSettingsPanelOpen: false,
        isToolbarOpen: true,
        isKeyboardHelpOpen: false,
    },
    tooltips: {
        isEnabled: true,
        delay: 500,
    },
    grid: {
        isVisible: true,
        size: 20,
        snapToGrid: true,
    },
    measurements: {
        isVisible: true,
        unit: 'inches',
        precision: 1,
    },
    zoom: {
        level: 1,
        min: 0.1,
        max: 10,
    },
    errors: {
        messages: [],
    },
};

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        // Theme actions
        toggleDarkMode: (state) => {
            state.theme.isDarkMode = !state.theme.isDarkMode;
        },
        toggleHighContrast: (state) => {
            state.theme.highContrast = !state.theme.highContrast;
        },
        setFontSize: (state, action: PayloadAction<number>) => {
            state.theme.fontSize = action.payload;
        },

        // Panel actions
        toggleCalculationsPanel: (state) => {
            state.panels.isCalculationsPanelOpen = !state.panels.isCalculationsPanelOpen;
        },
        toggleSettingsPanel: (state) => {
            state.panels.isSettingsPanelOpen = !state.panels.isSettingsPanelOpen;
        },
        toggleToolbar: (state) => {
            state.panels.isToolbarOpen = !state.panels.isToolbarOpen;
        },
        toggleKeyboardHelp: (state) => {
            state.panels.isKeyboardHelpOpen = !state.panels.isKeyboardHelpOpen;
        },

        // Tooltip actions
        toggleTooltips: (state) => {
            state.tooltips.isEnabled = !state.tooltips.isEnabled;
        },
        setTooltipDelay: (state, action: PayloadAction<number>) => {
            state.tooltips.delay = action.payload;
        },

        // Grid actions
        toggleGrid: (state) => {
            state.grid.isVisible = !state.grid.isVisible;
        },
        setGridSize: (state, action: PayloadAction<number>) => {
            state.grid.size = action.payload;
        },
        toggleSnapToGrid: (state) => {
            state.grid.snapToGrid = !state.grid.snapToGrid;
        },

        // Measurement actions
        toggleMeasurements: (state) => {
            state.measurements.isVisible = !state.measurements.isVisible;
        },
        setMeasurementUnit: (state, action: PayloadAction<UIState['measurements']['unit']>) => {
            state.measurements.unit = action.payload;
        },
        setMeasurementPrecision: (state, action: PayloadAction<number>) => {
            state.measurements.precision = action.payload;
        },

        // Zoom actions
        setZoomLevel: (state, action: PayloadAction<number>) => {
            state.zoom.level = Math.min(Math.max(action.payload, state.zoom.min), state.zoom.max);
        },
        zoomIn: (state) => {
            state.zoom.level = Math.min(state.zoom.level * 1.2, state.zoom.max);
        },
        zoomOut: (state) => {
            state.zoom.level = Math.max(state.zoom.level / 1.2, state.zoom.min);
        },
        resetZoom: (state) => {
            state.zoom.level = 1;
        },

        // Error actions
        addError: (state, action: PayloadAction<{
            type: 'error' | 'warning' | 'info';
            message: string;
        }>) => {
            state.errors.messages.push({
                id: Math.random().toString(36).substr(2, 9),
                ...action.payload,
                timestamp: Date.now(),
            });
        },
        removeError: (state, action: PayloadAction<string>) => {
            state.errors.messages = state.errors.messages.filter(msg => msg.id !== action.payload);
        },
        clearErrors: (state) => {
            state.errors.messages = [];
        },

        // Reset all UI state
        resetUI: () => initialState,
    },
});

export const {
    toggleDarkMode,
    toggleHighContrast,
    setFontSize,
    toggleCalculationsPanel,
    toggleSettingsPanel,
    toggleToolbar,
    toggleKeyboardHelp,
    toggleTooltips,
    setTooltipDelay,
    toggleGrid,
    setGridSize,
    toggleSnapToGrid,
    toggleMeasurements,
    setMeasurementUnit,
    setMeasurementPrecision,
    setZoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    addError,
    removeError,
    clearErrors,
    resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
