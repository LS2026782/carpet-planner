/**
 * Available measurement units
 */
export type MeasurementUnit = 'feet' | 'meters';

/**
 * Available theme options
 */
export type ThemeOption = 'light' | 'dark';

/**
 * Settings configuration interface
 */
export interface Settings {
    gridSize: number;
    snapToGrid: boolean;
    showMeasurements: boolean;
    units: MeasurementUnit;
    scale: number;
    theme: ThemeOption;
}

/**
 * Settings panel initialization options
 */
export interface SettingsPanelOptions {
    container: HTMLElement;
    onSettingChange: (setting: keyof Settings, value: Settings[keyof Settings]) => void;
    initialSettings?: Partial<Settings>;
}

/**
 * Input control configuration for number inputs
 */
export interface NumberInputConfig {
    id: string;
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    ariaLabel?: string;
}

/**
 * Input control configuration for checkbox inputs
 */
export interface CheckboxConfig {
    id: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    ariaLabel?: string;
}

/**
 * Input control configuration for select inputs
 */
export interface SelectConfig<T extends string> {
    id: string;
    label: string;
    options: Array<{ value: T; label: string }>;
    value: T;
    onChange: (value: T) => void;
    ariaLabel?: string;
}
