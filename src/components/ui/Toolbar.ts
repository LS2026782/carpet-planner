import { RoomEditor } from '../room/RoomEditor';
import { DoorEditor } from '../door/DoorEditor';
import { EventEmitter } from '../../utils/EventEmitter';
import { InteractionManager } from '../../managers/InteractionManager';
import { InteractionMode } from '../../types/events';

export type ToolType = InteractionMode;

interface ToolbarEvents {
    toolChange: ToolType;
}

interface ToolbarButton {
    type: ToolType;
    label: string;
    ariaLabel: string;
    icon?: string;
}

/**
 * Toolbar component that handles tool selection and mode switching
 * @extends EventEmitter<ToolbarEvents>
 */
export class Toolbar extends EventEmitter<ToolbarEvents> {
    private container: HTMLElement;
    private buttons: Map<ToolType, HTMLButtonElement>;
    private activeTool: ToolType = 'select';
    private roomEditor: RoomEditor;
    private doorEditor: DoorEditor;
    private interactionManager: InteractionManager;

    private readonly toolButtons: ToolbarButton[] = [
        {
            type: 'select',
            label: 'Select',
            ariaLabel: 'Select tool - Use to select and modify existing elements'
        },
        {
            type: 'draw',
            label: 'Draw Room',
            ariaLabel: 'Draw Room tool - Click to start drawing a new room'
        },
        {
            type: 'door',
            label: 'Add Door',
            ariaLabel: 'Add Door tool - Click to add doors to rooms'
        }
    ];

    /**
     * Creates a new Toolbar instance
     * @param container - The HTML element to render the toolbar in
     * @param roomEditor - The RoomEditor instance
     * @param doorEditor - The DoorEditor instance
     * @param interactionManager - The InteractionManager instance
     * @throws {Error} If container is null or undefined
     */
    constructor(
        container: HTMLElement,
        roomEditor: RoomEditor,
        doorEditor: DoorEditor,
        interactionManager: InteractionManager
    ) {
        super();

        if (!container) {
            throw new Error('Toolbar container element is required');
        }

        this.container = container;
        this.roomEditor = roomEditor;
        this.doorEditor = doorEditor;
        this.interactionManager = interactionManager;
        this.buttons = new Map();

        try {
            this.createButtons();
            this.setupEventListeners();
            this.render();
        } catch (error) {
            console.error('Failed to initialize toolbar:', error);
            throw error;
        }
    }

    /**
     * Creates toolbar buttons based on toolButtons configuration
     * @private
     */
    private createButtons(): void {
        // Clear existing buttons
        this.container.innerHTML = '';
        this.buttons.clear();

        // Create toolbar container with ARIA role
        const toolbarGroup = document.createElement('div');
        toolbarGroup.setAttribute('role', 'toolbar');
        toolbarGroup.setAttribute('aria-label', 'Drawing tools');

        this.toolButtons.forEach(buttonConfig => {
            const button = this.createButton(buttonConfig);
            this.buttons.set(buttonConfig.type, button);
            toolbarGroup.appendChild(button);
        });

        this.container.appendChild(toolbarGroup);
    }

    /**
     * Creates a single toolbar button
     * @private
     * @param config - The button configuration
     * @returns HTMLButtonElement
     */
    private createButton(config: ToolbarButton): HTMLButtonElement {
        const button = document.createElement('button');
        button.textContent = config.label;
        button.className = 'toolbar-button';
        button.dataset.tool = config.type;
        
        // Accessibility attributes
        button.setAttribute('role', 'button');
        button.setAttribute('aria-label', config.ariaLabel);
        button.setAttribute('aria-pressed', (config.type === this.activeTool).toString());
        
        // Optional icon
        if (config.icon) {
            const icon = document.createElement('span');
            icon.className = `toolbar-icon ${config.icon}`;
            icon.setAttribute('aria-hidden', 'true');
            button.insertBefore(icon, button.firstChild);
        }

        return button;
    }

    /**
     * Sets up event listeners for toolbar interactions
     * @private
     */
    private setupEventListeners(): void {
        // Mouse click handler
        this.container.addEventListener('click', this.handleClick.bind(this));

        // Keyboard handler for accessibility
        this.container.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    /**
     * Handles click events on toolbar buttons
     * @private
     * @param event - The click event
     */
    private handleClick(event: MouseEvent): void {
        const button = (event.target as HTMLElement).closest('button');
        if (button?.dataset.tool) {
            this.setTool(button.dataset.tool as ToolType);
        }
    }

    /**
     * Handles keyboard events for accessibility
     * @private
     * @param event - The keyboard event
     */
    private handleKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' || event.key === ' ') {
            const button = (event.target as HTMLElement).closest('button');
            if (button?.dataset.tool) {
                event.preventDefault();
                this.setTool(button.dataset.tool as ToolType);
            }
        }
    }

    /**
     * Sets the active tool and updates the UI
     * @private
     * @param tool - The tool to activate
     */
    private setTool(tool: ToolType): void {
        if (this.activeTool === tool) return;

        try {
            this.activeTool = tool;
            this.interactionManager.setMode(tool);
            this.emit('toolChange', tool);
            this.render();
        } catch (error) {
            console.error(`Failed to set tool ${tool}:`, error);
            // Revert to select tool if there's an error
            if (tool !== 'select') {
                this.setTool('select');
            }
        }
    }

    /**
     * Updates the visual state of the toolbar
     * @private
     */
    private render(): void {
        this.buttons.forEach((button, tool) => {
            button.classList.toggle('active', tool === this.activeTool);
            button.setAttribute('aria-pressed', (tool === this.activeTool).toString());
        });
    }

    /**
     * Gets the currently active tool
     * @returns The active tool type
     */
    getActiveTool(): ToolType {
        return this.activeTool;
    }

    /**
     * Changes the active tool
     * @param tool - The tool to activate
     */
    changeTool(tool: ToolType): void {
        this.setTool(tool);
    }

    /**
     * Cleans up the toolbar and removes event listeners
     */
    destroy(): void {
        this.container.removeEventListener('click', this.handleClick);
        this.container.removeEventListener('keydown', this.handleKeyDown);
        this.container.innerHTML = '';
        this.buttons.clear();
    }
}
