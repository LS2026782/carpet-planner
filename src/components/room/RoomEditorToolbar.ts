import { EventEmitter } from '../../utils/EventEmitter';
import { Tooltip } from '../ui/Tooltip';
import { KeyBinding } from '../../types/keyboard';

interface ToolbarEvents {
    toggleEdit: boolean;
    toggleGrid: boolean;
    toggleSnap: boolean;
    undo: void;
    redo: void;
    delete: void;
    modeChange: 'edit' | 'view';
    addPoint: void;
    removePoint: void;
}

interface ToolbarOptions {
    showGrid?: boolean;
    snapToGrid?: boolean;
    isEditing?: boolean;
    canUndo?: boolean;
    canRedo?: boolean;
    canDelete?: boolean;
    pointManipulationEnabled?: boolean;
    keyBindings?: Record<string, KeyBinding>;
}

export class RoomEditorToolbar {
    private container: HTMLElement;
    private eventEmitter = new EventEmitter<ToolbarEvents>();
    private buttons: Record<string, HTMLButtonElement> = {};
    private tooltips: Tooltip[] = [];
    private options: Required<ToolbarOptions>;

    constructor(container: HTMLElement, options: ToolbarOptions = {}) {
        this.container = container;
        this.options = {
            showGrid: options.showGrid ?? false,
            snapToGrid: options.snapToGrid ?? false,
            isEditing: options.isEditing ?? false,
            canUndo: options.canUndo ?? false,
            canRedo: options.canRedo ?? false,
            canDelete: options.canDelete ?? false,
            pointManipulationEnabled: options.pointManipulationEnabled ?? false,
            keyBindings: options.keyBindings ?? {}
        };

        this.createToolbar();
        this.updateState();
    }

    private createToolbar(): void {
        const toolbar = document.createElement('div');
        toolbar.className = 'room-editor-toolbar';

        // Edit mode toggle
        this.buttons.edit = this.createButton('edit', 'Toggle edit mode', () => {
            this.options.isEditing = !this.options.isEditing;
            this.updateState();
            this.eventEmitter.emit('toggleEdit', this.options.isEditing);
            this.eventEmitter.emit('modeChange', this.options.isEditing ? 'edit' : 'view');
        });

        // Grid toggle
        this.buttons.grid = this.createButton('grid', 'Toggle grid', () => {
            this.options.showGrid = !this.options.showGrid;
            this.updateState();
            this.eventEmitter.emit('toggleGrid', this.options.showGrid);
        });

        // Snap toggle
        this.buttons.snap = this.createButton('snap', 'Toggle snap to grid', () => {
            this.options.snapToGrid = !this.options.snapToGrid;
            this.updateState();
            this.eventEmitter.emit('toggleSnap', this.options.snapToGrid);
        });

        // Add point button
        this.buttons.addPoint = this.createButton('add-point', 'Add point', () => {
            this.eventEmitter.emit('addPoint', undefined);
        });

        // Remove point button
        this.buttons.removePoint = this.createButton('remove-point', 'Remove point', () => {
            this.eventEmitter.emit('removePoint', undefined);
        });

        // Undo button
        this.buttons.undo = this.createButton('undo', 'Undo', () => {
            this.eventEmitter.emit('undo', undefined);
        });

        // Redo button
        this.buttons.redo = this.createButton('redo', 'Redo', () => {
            this.eventEmitter.emit('redo', undefined);
        });

        // Delete button
        this.buttons.delete = this.createButton('delete', 'Delete selected', () => {
            this.eventEmitter.emit('delete', undefined);
        });

        // Add buttons to toolbar
        Object.values(this.buttons).forEach(button => toolbar.appendChild(button));

        // Add tooltips with keyboard shortcuts
        this.addTooltips();

        this.container.appendChild(toolbar);
    }

    private createButton(id: string, title: string, onClick: () => void): HTMLButtonElement {
        const button = document.createElement('button');
        button.className = `room-editor-toolbar__button ${id}`;
        button.setAttribute('aria-label', title);
        button.innerHTML = `<i class="icon icon-${id}"></i>`;
        button.onclick = onClick;
        return button;
    }

    private addTooltips(): void {
        const tooltipConfigs: Record<string, { title: string, binding?: KeyBinding }> = {
            edit: { 
                title: 'Toggle edit mode',
                binding: this.options.keyBindings.toggleEdit
            },
            grid: { 
                title: 'Toggle grid',
                binding: this.options.keyBindings.toggleGrid
            },
            snap: { 
                title: 'Toggle snap to grid',
                binding: this.options.keyBindings.toggleSnap
            },
            'add-point': {
                title: 'Add point',
                binding: this.options.keyBindings.addPoint
            },
            'remove-point': {
                title: 'Remove point',
                binding: this.options.keyBindings.removePoint
            },
            undo: { 
                title: 'Undo',
                binding: this.options.keyBindings.undo
            },
            redo: { 
                title: 'Redo',
                binding: this.options.keyBindings.redo
            },
            delete: { 
                title: 'Delete selected',
                binding: this.options.keyBindings.delete
            }
        };

        Object.entries(this.buttons).forEach(([id, button]) => {
            const config = tooltipConfigs[id];
            if (config) {
                let shortcut: string | undefined = undefined;
                if (config.binding) {
                    shortcut = config.binding.modifiers ? 
                        `${config.binding.modifiers.join('+')}+${config.binding.key}` :
                        config.binding.key;
                }
                const tooltip = new Tooltip(button, {
                    content: config.title,
                    shortcut,
                    position: 'bottom',
                    delay: 500
                });
                this.tooltips.push(tooltip);
            }
        });
    }

    private updateState(): void {
        // Update button states
        this.buttons.edit.classList.toggle('active', this.options.isEditing);
        this.buttons.grid.classList.toggle('active', this.options.showGrid);
        this.buttons.snap.classList.toggle('active', this.options.snapToGrid);
        this.buttons.undo.disabled = !this.options.canUndo;
        this.buttons.redo.disabled = !this.options.canRedo;
        this.buttons.delete.disabled = !this.options.canDelete;

        // Update point manipulation buttons
        const pointButtons = [this.buttons.addPoint, this.buttons.removePoint];
        pointButtons.forEach(button => {
            button.disabled = !this.options.pointManipulationEnabled;
            button.classList.toggle('hidden', !this.options.isEditing);
        });

        // Update button visibility based on edit mode
        const editModeButtons = [this.buttons.snap, this.buttons.delete];
        editModeButtons.forEach(button => {
            button.classList.toggle('hidden', !this.options.isEditing);
        });
    }

    setOptions(options: Partial<ToolbarOptions>): void {
        Object.assign(this.options, options);
        this.updateState();
    }

    setUndoEnabled(enabled: boolean): void {
        this.options.canUndo = enabled;
        this.updateState();
    }

    setRedoEnabled(enabled: boolean): void {
        this.options.canRedo = enabled;
        this.updateState();
    }

    setPointManipulationEnabled(enabled: boolean): void {
        this.options.pointManipulationEnabled = enabled;
        this.updateState();
    }

    on<K extends keyof ToolbarEvents>(event: K, callback: (data: ToolbarEvents[K]) => void): void {
        this.eventEmitter.on(event, callback);
    }

    off<K extends keyof ToolbarEvents>(event: K, callback: (data: ToolbarEvents[K]) => void): void {
        this.eventEmitter.off(event, callback);
    }

    destroy(): void {
        // Clean up tooltips
        this.tooltips.forEach(tooltip => tooltip.destroy());
        this.tooltips = [];

        // Remove event listeners
        Object.values(this.buttons).forEach(button => {
            button.onclick = null;
        });

        // Clear container
        this.container.innerHTML = '';
    }
}
