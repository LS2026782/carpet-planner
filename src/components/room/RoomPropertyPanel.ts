import { EventEmitter } from '../../utils/EventEmitter';
import { EditableRoom, EditablePoint, ValidationError } from '../../types/editor';

interface RoomPropertyPanelEvents {
    pointSelect: EditablePoint;
    pointUpdate: EditablePoint;
}

export class RoomPropertyPanel {
    private eventEmitter = new EventEmitter<RoomPropertyPanelEvents>();
    private container: HTMLElement;
    private room: EditableRoom | null = null;
    private selectedPoint: EditablePoint | null = null;

    constructor(container: HTMLElement) {
        this.container = container;
        this.render();
    }

    private render(): void {
        this.container.innerHTML = `
            <div class="room-property-panel">
                <div class="measurements">
                    <div class="measurement">
                        <label>Width:</label>
                        <span data-testid="room-width">${this.room?.width || 0}</span>
                    </div>
                    <div class="measurement">
                        <label>Height:</label>
                        <span data-testid="room-height">${this.room?.height || 0}</span>
                    </div>
                    <div class="measurement">
                        <label>Area:</label>
                        <span data-testid="room-area">${this.room?.area || 0}</span>
                    </div>
                    <div class="measurement">
                        <label>Perimeter:</label>
                        <span data-testid="room-perimeter">${this.room?.perimeter || 0}</span>
                    </div>
                </div>
                ${this.renderValidationErrors()}
                ${this.renderPointList()}
                ${this.renderPointEditor()}
            </div>
        `;

        this.setupEventListeners();
    }

    private renderValidationErrors(): string {
        if (!this.room?.validationErrors?.length) return '';

        return `
            <div class="validation-errors">
                ${this.room.validationErrors.map(error => `
                    <div class="validation-error ${error.type}" data-testid="validation-error">
                        ${error.message}
                    </div>
                `).join('')}
            </div>
        `;
    }

    private renderPointList(): string {
        if (!this.room?.points.length) return '';

        return `
            <div class="point-list">
                ${this.room.points.map((point, index) => `
                    <div class="point ${point === this.selectedPoint ? 'selected' : ''}"
                         data-testid="point-${index}"
                         data-point-id="${point.id}">
                        Point ${index + 1}: (${point.x}, ${point.y})
                    </div>
                `).join('')}
            </div>
        `;
    }

    private renderPointEditor(): string {
        if (!this.selectedPoint) return '';

        return `
            <div class="point-editor">
                <div class="coordinate">
                    <label>X:</label>
                    <input type="number" 
                           data-testid="point-x-input"
                           value="${this.selectedPoint.x}">
                </div>
                <div class="coordinate">
                    <label>Y:</label>
                    <input type="number"
                           data-testid="point-y-input"
                           value="${this.selectedPoint.y}">
                </div>
            </div>
        `;
    }

    private setupEventListeners(): void {
        const pointElements = this.container.querySelectorAll('[data-point-id]');
        pointElements.forEach(element => {
            element.addEventListener('click', () => {
                const pointId = element.getAttribute('data-point-id');
                const point = this.room?.points.find(p => p.id === pointId);
                if (point) {
                    this.setSelectedPoint(point);
                    this.eventEmitter.emit('pointSelect', point);
                }
            });
        });

        const xInput = this.container.querySelector('[data-testid="point-x-input"]') as HTMLInputElement;
        const yInput = this.container.querySelector('[data-testid="point-y-input"]') as HTMLInputElement;

        if (xInput && yInput && this.selectedPoint) {
            xInput.addEventListener('change', () => {
                const x = parseFloat(xInput.value);
                if (!isNaN(x)) {
                    this.updatePoint({ ...this.selectedPoint!, x });
                }
            });

            yInput.addEventListener('change', () => {
                const y = parseFloat(yInput.value);
                if (!isNaN(y)) {
                    this.updatePoint({ ...this.selectedPoint!, y });
                }
            });
        }
    }

    private updatePoint(point: EditablePoint): void {
        this.eventEmitter.emit('pointUpdate', point);
    }

    public setRoom(room: EditableRoom | null): void {
        this.room = room;
        if (!room) {
            this.selectedPoint = null;
        }
        this.render();
    }

    public setSelectedPoint(point: EditablePoint | null): void {
        this.selectedPoint = point;
        this.render();
    }

    public on<K extends keyof RoomPropertyPanelEvents>(
        event: K,
        callback: (data: RoomPropertyPanelEvents[K]) => void
    ): void {
        this.eventEmitter.on(event, callback);
    }

    public off<K extends keyof RoomPropertyPanelEvents>(
        event: K,
        callback: (data: RoomPropertyPanelEvents[K]) => void
    ): void {
        this.eventEmitter.off(event, callback);
    }

    public destroy(): void {
        this.eventEmitter.removeAllListeners();
        this.container.innerHTML = '';
    }
}
