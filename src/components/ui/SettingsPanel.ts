import { EventEmitter } from '../../utils/EventEmitter';
import { Settings, SettingsPanelOptions, MeasurementUnit, ThemeOption } from '../../types/settings';
import { FocusManager, FocusTrap, KeyboardNavigation } from '../../utils/accessibility';

interface SettingsPanelEvents {
    settingChange: { setting: keyof Settings; value: Settings[keyof Settings] };
    visibilityChange: boolean;
}

type SettingConfig<K extends keyof Settings> = {
    id: K;
    label: string;
    ariaLabel: string;
} & (
    | { type: 'number'; value: number; min: number; max: number; step: number }
    | { type: 'boolean'; value: boolean }
    | { type: 'unit'; value: MeasurementUnit }
    | { type: 'theme'; value: ThemeOption }
);

/**
 * Panel for managing application settings with accessibility support
 * @extends EventEmitter<SettingsPanelEvents>
 */
export class SettingsPanel extends EventEmitter<SettingsPanelEvents> {
    private container: HTMLElement;
    private panel: HTMLElement;
    private isVisible: boolean = false;
    private focusTrap?: FocusTrap;
    private keyboardNav?: KeyboardNavigation;
    private onSettingChange: SettingsPanelOptions['onSettingChange'];
    private settings: Settings = {
        gridSize: 1,
        snapToGrid: true,
        showMeasurements: true,
        units: 'feet',
        scale: 1,
        theme: 'light'
    };

    constructor({ container, onSettingChange, initialSettings }: SettingsPanelOptions) {
        super();

        if (!container) {
            throw new Error('Settings panel container element is required');
        }

        this.container = container;
        this.onSettingChange = onSettingChange;
        this.panel = document.createElement('div');

        if (initialSettings) {
            this.settings = { ...this.settings, ...initialSettings };
        }

        try {
            this.createPanel();
            this.setupKeyboardNavigation();
        } catch (error) {
            console.error('Failed to initialize settings panel:', error);
            throw error;
        }
    }

    /**
     * Creates the settings panel interface
     * @private
     */
    private createPanel(): void {
        this.panel.className = 'settings-panel';
        this.panel.setAttribute('role', 'dialog');
        this.panel.setAttribute('aria-label', 'Settings');
        this.panel.setAttribute('aria-modal', 'true');
        this.panel.style.display = 'none';

        // Create header
        const header = document.createElement('div');
        header.className = 'settings-header';

        const title = document.createElement('h2');
        title.textContent = 'Settings';
        title.id = 'settings-title';
        this.panel.setAttribute('aria-labelledby', 'settings-title');

        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.innerHTML = '×';
        closeButton.setAttribute('aria-label', 'Close settings');
        closeButton.addEventListener('click', () => this.hide());

        header.appendChild(title);
        header.appendChild(closeButton);
        this.panel.appendChild(header);

        // Create settings sections
        this.createGridSettings();
        this.createDisplaySettings();
        this.createThemeSettings();

        this.container.appendChild(this.panel);
    }

    /**
     * Sets up keyboard navigation
     * @private
     */
    private setupKeyboardNavigation(): void {
        this.keyboardNav = new KeyboardNavigation(this.panel);

        // Handle arrow key navigation
        this.panel.addEventListener('keydown', (event: KeyboardEvent) => {
            if (!this.keyboardNav) return;

            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    this.keyboardNav.focusNext();
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    this.keyboardNav.focusPrevious();
                    break;
                case 'Home':
                    event.preventDefault();
                    this.keyboardNav.focusFirst();
                    break;
                case 'End':
                    event.preventDefault();
                    this.keyboardNav.focusLast();
                    break;
            }
        });
    }

    /**
     * Creates grid-related settings
     * @private
     */
    private createGridSettings(): void {
        const section = this.createSection('Grid Settings');

        // Grid size control
        const gridSizeControl = this.createNumberInput({
            id: 'gridSize',
            label: 'Grid Size',
            value: this.settings.gridSize,
            min: 0.1,
            max: 10,
            step: 0.1,
            ariaLabel: 'Set grid size in current units'
        });

        // Snap to grid control
        const snapControl = this.createCheckbox({
            id: 'snapToGrid',
            label: 'Snap to Grid',
            checked: this.settings.snapToGrid,
            ariaLabel: 'Toggle snap to grid'
        });

        section.appendChild(gridSizeControl);
        section.appendChild(snapControl);
    }

    /**
     * Creates display-related settings
     * @private
     */
    private createDisplaySettings(): void {
        const section = this.createSection('Display Settings');

        // Show measurements control
        const measurementsControl = this.createCheckbox({
            id: 'showMeasurements',
            label: 'Show Measurements',
            checked: this.settings.showMeasurements,
            ariaLabel: 'Toggle measurement display'
        });

        // Units control
        const unitsControl = this.createSelect<'units', MeasurementUnit>({
            id: 'units',
            label: 'Units',
            options: [
                { value: 'feet', label: 'Feet' },
                { value: 'meters', label: 'Meters' }
            ],
            value: this.settings.units,
            ariaLabel: 'Select measurement units'
        });

        section.appendChild(measurementsControl);
        section.appendChild(unitsControl);
    }

    /**
     * Creates theme-related settings
     * @private
     */
    private createThemeSettings(): void {
        const section = this.createSection('Theme Settings');

        // Theme control
        const themeControl = this.createSelect<'theme', ThemeOption>({
            id: 'theme',
            label: 'Theme',
            options: [
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' }
            ],
            value: this.settings.theme,
            ariaLabel: 'Select color theme'
        });

        section.appendChild(themeControl);
    }

    /**
     * Creates a settings section
     * @private
     */
    private createSection(title: string): HTMLElement {
        const section = document.createElement('div');
        section.className = 'settings-section';
        section.setAttribute('role', 'group');
        section.setAttribute('aria-label', title);

        const heading = document.createElement('h3');
        heading.textContent = title;
        section.appendChild(heading);

        this.panel.appendChild(section);
        return section;
    }

    /**
     * Creates a number input control
     * @private
     */
    private createNumberInput(config: {
        id: keyof Pick<Settings, 'gridSize' | 'scale'>;
        label: string;
        value: number;
        min: number;
        max: number;
        step: number;
        ariaLabel: string;
    }): HTMLElement {
        const container = document.createElement('div');
        container.className = 'setting-control';

        const labelElement = document.createElement('label');
        labelElement.htmlFor = config.id;
        labelElement.textContent = config.label;

        const input = document.createElement('input');
        input.type = 'number';
        input.id = config.id;
        input.value = config.value.toString();
        input.min = config.min.toString();
        input.max = config.max.toString();
        input.step = config.step.toString();
        input.setAttribute('aria-label', config.ariaLabel);

        input.addEventListener('change', () => {
            const value = parseFloat(input.value);
            if (!isNaN(value) && value >= config.min && value <= config.max) {
                this.settings[config.id] = value;
                this.onSettingChange?.(config.id, value);
                this.emit('settingChange', { setting: config.id, value });
            } else {
                input.value = config.value.toString();
            }
        });

        container.appendChild(labelElement);
        container.appendChild(input);
        return container;
    }

    /**
     * Creates a checkbox control
     * @private
     */
    private createCheckbox(config: {
        id: keyof Pick<Settings, 'snapToGrid' | 'showMeasurements'>;
        label: string;
        checked: boolean;
        ariaLabel: string;
    }): HTMLElement {
        const container = document.createElement('div');
        container.className = 'setting-control';

        const labelElement = document.createElement('label');
        labelElement.htmlFor = config.id;
        labelElement.textContent = config.label;

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = config.id;
        input.checked = config.checked;
        input.setAttribute('aria-label', config.ariaLabel);

        input.addEventListener('change', () => {
            this.settings[config.id] = input.checked;
            this.onSettingChange?.(config.id, input.checked);
            this.emit('settingChange', { setting: config.id, value: input.checked });
        });

        container.appendChild(labelElement);
        container.appendChild(input);
        return container;
    }

    /**
     * Creates a select control
     * @private
     */
    private createSelect<K extends keyof Settings, T extends Settings[K]>(config: {
        id: K;
        label: string;
        options: Array<{ value: T; label: string }>;
        value: T;
        ariaLabel: string;
    }): HTMLElement {
        const container = document.createElement('div');
        container.className = 'setting-control';

        const labelElement = document.createElement('label');
        labelElement.htmlFor = config.id;
        labelElement.textContent = config.label;

        const select = document.createElement('select');
        select.id = config.id;
        select.setAttribute('aria-label', config.ariaLabel);

        config.options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = String(option.value);
            optionElement.textContent = option.label;
            if (option.value === config.value) {
                optionElement.selected = true;
            }
            select.appendChild(optionElement);
        });

        select.addEventListener('change', () => {
            const value = select.value as T;
            this.settings[config.id] = value;
            this.onSettingChange?.(config.id, value);
            this.emit('settingChange', { setting: config.id, value });
        });

        container.appendChild(labelElement);
        container.appendChild(select);
        return container;
    }

    /**
     * Shows the settings panel
     */
    show(): void {
        if (this.isVisible) return;

        this.panel.style.display = 'block';
        this.isVisible = true;

        // Create focus trap
        this.focusTrap = FocusManager.createTrap({
            container: this.panel,
            onEscape: () => this.hide()
        });

        this.emit('visibilityChange', true);
    }

    /**
     * Hides the settings panel
     */
    hide(): void {
        if (!this.isVisible) return;

        this.panel.style.display = 'none';
        this.isVisible = false;

        // Remove focus trap
        if (this.focusTrap) {
            this.focusTrap.deactivate();
            this.focusTrap = undefined;
        }

        this.emit('visibilityChange', false);
    }

    /**
     * Toggles the visibility of the settings panel
     */
    toggle(): void {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Gets the visibility state of the panel
     */
    getVisibility(): boolean {
        return this.isVisible;
    }

    /**
     * Updates a setting value
     */
    updateSetting<K extends keyof Settings>(setting: K, value: Settings[K]): void {
        this.settings[setting] = value;
        const element = document.getElementById(setting);
        if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
            if (element.type === 'checkbox' && element instanceof HTMLInputElement) {
                element.checked = value as boolean;
            } else {
                element.value = String(value);
            }
        }
    }

    /**
     * Gets a setting value
     */
    getSetting<K extends keyof Settings>(setting: K): Settings[K] {
        return this.settings[setting];
    }

    /**
     * Gets all settings
     */
    getSettings(): Settings {
        return { ...this.settings };
    }

    /**
     * Cleans up the panel and removes event listeners
     */
    destroy(): void {
        if (this.focusTrap) {
            this.focusTrap.deactivate();
        }
        this.panel.remove();
        this.removeAllListeners();
    }
}
