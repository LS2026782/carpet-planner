export interface ThemeState {
    isDarkMode: boolean;
    highContrast: boolean;
    fontSize: number;
    customColors?: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        error: string;
        warning: string;
        success: string;
        text: string;
    };
}

export interface PanelState {
    isCalculationsPanelOpen: boolean;
    isSettingsPanelOpen: boolean;
    isToolbarOpen: boolean;
    isKeyboardHelpOpen: boolean;
    lastOpenPanel?: string;
    panelPositions?: {
        [key: string]: {
            x: number;
            y: number;
            width?: number;
            height?: number;
            isCollapsed?: boolean;
        };
    };
}

export interface TooltipState {
    isEnabled: boolean;
    delay: number;
    position?: 'top' | 'bottom' | 'left' | 'right';
    offset?: number;
    maxWidth?: number;
}

export interface GridState {
    isVisible: boolean;
    size: number;
    snapToGrid: boolean;
    color?: string;
    opacity?: number;
    subdivisions?: number;
}

export interface MeasurementState {
    isVisible: boolean;
    unit: 'inches' | 'feet' | 'meters' | 'centimeters';
    precision: number;
    showArea: boolean;
    showPerimeter: boolean;
    showDimensions: boolean;
    format?: 'decimal' | 'fractional';
    customLabels?: {
        [key: string]: string;
    };
}

export interface ZoomState {
    level: number;
    min: number;
    max: number;
    step: number;
    defaultLevel: number;
}

export interface ErrorMessage {
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
    details?: string;
    source?: string;
    isRead?: boolean;
    isDismissed?: boolean;
}

export interface ErrorState {
    messages: ErrorMessage[];
    maxMessages: number;
    showDismissed: boolean;
    filter?: 'error' | 'warning' | 'info' | 'all';
}

export interface DialogState {
    isOpen: boolean;
    type?: 'alert' | 'confirm' | 'prompt' | 'custom';
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    inputValue?: string;
    inputPlaceholder?: string;
    customContent?: any;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export interface ContextMenuState {
    isOpen: boolean;
    position: { x: number; y: number } | null;
    items: ContextMenuItem[];
    context?: any;
}

export interface ContextMenuItem {
    id: string;
    label: string;
    icon?: string;
    shortcut?: string;
    disabled?: boolean;
    hidden?: boolean;
    children?: ContextMenuItem[];
    onClick?: () => void;
}

export interface UIPreferences {
    theme: {
        prefersDarkMode: boolean;
        prefersHighContrast: boolean;
        preferredFontSize: number;
    };
    panels: {
        rememberPositions: boolean;
        rememberOpenState: boolean;
        defaultPositions?: PanelState['panelPositions'];
    };
    tooltips: {
        enabled: boolean;
        defaultDelay: number;
        defaultPosition: TooltipState['position'];
    };
    grid: {
        defaultVisible: boolean;
        defaultSize: number;
        defaultSnapToGrid: boolean;
    };
    measurements: {
        defaultVisible: boolean;
        defaultUnit: MeasurementState['unit'];
        defaultPrecision: number;
    };
    zoom: {
        defaultLevel: number;
        defaultStep: number;
    };
    errors: {
        maxMessages: number;
        autoDismissAfter?: number;
    };
}

export interface UIState {
    theme: ThemeState;
    panels: PanelState;
    tooltips: TooltipState;
    grid: GridState;
    measurements: MeasurementState;
    zoom: ZoomState;
    errors: ErrorState;
    dialog: DialogState;
    contextMenu: ContextMenuState;
    preferences: UIPreferences;
}

// Helper functions
export function createErrorMessage(
    type: ErrorMessage['type'],
    message: string,
    details?: string,
    source?: string
): ErrorMessage {
    return {
        id: Math.random().toString(36).substr(2, 9),
        type,
        message,
        details,
        source,
        timestamp: Date.now(),
        isRead: false,
        isDismissed: false,
    };
}

export function isValidTheme(theme: Partial<ThemeState>): boolean {
    if (theme.customColors) {
        const colors = theme.customColors;
        const isValidColor = (color: string) =>
            /^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$|^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$|^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/.test(color);

        return Object.values(colors).every(color => isValidColor(color));
    }
    return true;
}

export function isValidMeasurementUnit(unit: string): unit is MeasurementState['unit'] {
    return ['inches', 'feet', 'meters', 'centimeters'].includes(unit);
}

export function formatMeasurement(
    value: number,
    unit: MeasurementState['unit'],
    precision: number,
    format: 'decimal' | 'fractional' = 'decimal'
): string {
    if (format === 'fractional' && unit === 'inches') {
        // Convert decimal inches to fractional
        const fraction = decimalToFraction(value);
        return `${fraction} in`;
    }

    const formatted = value.toFixed(precision);
    const unitSymbol = {
        inches: 'in',
        feet: 'ft',
        meters: 'm',
        centimeters: 'cm',
    }[unit];

    return `${formatted} ${unitSymbol}`;
}

function decimalToFraction(decimal: number): string {
    if (Number.isInteger(decimal)) return decimal.toString();

    const tolerance = 1.0E-6;
    let h1 = 1;
    let h2 = 0;
    let k1 = 0;
    let k2 = 1;
    let b = decimal;

    do {
        const a = Math.floor(b);
        let aux = h1;
        h1 = a * h1 + h2;
        h2 = aux;
        aux = k1;
        k1 = a * k1 + k2;
        k2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);

    return `${h1}/${k1}`;
}
