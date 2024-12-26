import { Door, SwingDirection } from '../../models/Door';
import { DoorManager } from '../../managers/DoorManager';
import { EventEmitter } from '../../utils/EventEmitter';

export interface DoorControlsEvents {
    widthChange: number;
    heightChange: number;
    swingAngleChange: number;
    swingDirectionChange: SwingDirection;
}

export class DoorControls extends EventEmitter<DoorControlsEvents> {
    private doorManager: DoorManager;
    private container: HTMLElement;
    private widthInput: HTMLInputElement;
    private heightInput: HTMLInputElement;
    private swingAngleInput: HTMLInputElement;
    private swingDirectionSelect: HTMLSelectElement;

    constructor(container: HTMLElement, doorManager: DoorManager) {
        super();
        this.doorManager = doorManager;
        this.container = container;

        this.widthInput = this.createInput('width', 'Width (inches)', '32');
        this.heightInput = this.createInput('height', 'Height (inches)', '80');
        this.swingAngleInput = this.createInput('swing-angle', 'Swing Angle (degrees)', '0');
        this.swingDirectionSelect = this.createSelect('swing-direction', 'Swing Direction', [
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' }
        ]);

        this.setupEventListeners();
        this.render();
    }

    private createInput(id: string, label: string, defaultValue: string): HTMLInputElement {
        const container = document.createElement('div');
        container.className = 'control-group';

        const labelElement = document.createElement('label');
        labelElement.htmlFor = id;
        labelElement.textContent = label;

        const input = document.createElement('input');
        input.type = 'number';
        input.id = id;
        input.value = defaultValue;

        container.appendChild(labelElement);
        container.appendChild(input);
        this.container.appendChild(container);

        return input;
    }

    private createSelect(
        id: string,
        label: string,
        options: { value: string; label: string }[]
    ): HTMLSelectElement {
        const container = document.createElement('div');
        container.className = 'control-group';

        const labelElement = document.createElement('label');
        labelElement.htmlFor = id;
        labelElement.textContent = label;

        const select = document.createElement('select');
        select.id = id;

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            select.appendChild(optionElement);
        });

        container.appendChild(labelElement);
        container.appendChild(select);
        this.container.appendChild(container);

        return select;
    }

    private setupEventListeners(): void {
        this.widthInput.addEventListener('change', () => {
            const width = parseFloat(this.widthInput.value);
            if (!isNaN(width)) {
                this.emit('widthChange', width);
            }
        });

        this.heightInput.addEventListener('change', () => {
            const height = parseFloat(this.heightInput.value);
            if (!isNaN(height)) {
                this.emit('heightChange', height);
            }
        });

        this.swingAngleInput.addEventListener('change', () => {
            const angle = parseFloat(this.swingAngleInput.value);
            if (!isNaN(angle)) {
                this.emit('swingAngleChange', angle);
            }
        });

        this.swingDirectionSelect.addEventListener('change', () => {
            const direction = this.swingDirectionSelect.value as SwingDirection;
            this.emit('swingDirectionChange', direction);
        });

        this.doorManager.on('selectionChanged', this.handleDoorSelection);
    }

    private handleDoorSelection = (door: Door | null): void => {
        if (door) {
            const { width, height } = door.getDimensions();
            this.widthInput.value = width.toString();
            this.heightInput.value = height.toString();
            this.swingAngleInput.value = door.getSwingAngle().toString();
            this.swingDirectionSelect.value = door.getSwingDirection();
            this.container.classList.remove('disabled');
        } else {
            this.container.classList.add('disabled');
        }
    };

    private render(): void {
        this.container.classList.add('door-controls');
        if (!this.doorManager.getSelectedDoor()) {
            this.container.classList.add('disabled');
        }
    }

    destroy(): void {
        this.doorManager.off('selectionChanged', this.handleDoorSelection);
    }
}
