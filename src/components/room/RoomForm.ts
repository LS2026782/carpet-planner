import { Room } from '../../models/Room';
import { Point } from '../canvas';
import EventEmitter from 'eventemitter3';

interface RoomFormOptions {
    container: HTMLElement;
}

interface RoomFormEvents {
    'room:update': (room: Room) => void;
}

// Define the interface for the class before the implementation
export interface RoomForm {
    on<K extends keyof RoomFormEvents>(event: K, listener: RoomFormEvents[K]): this;
    off<K extends keyof RoomFormEvents>(event: K, listener: RoomFormEvents[K]): this;
    emit<K extends keyof RoomFormEvents>(event: K, ...args: Parameters<RoomFormEvents[K]>): boolean;
}

/**
 * Form for editing room properties
 */
export class RoomForm extends EventEmitter {
    private container: HTMLElement;
    private formElement: HTMLFormElement;
    private room: Room | null = null;

    constructor({ container }: RoomFormOptions) {
        super();
        this.container = container;
        this.formElement = this.createForm();
        this.container.appendChild(this.formElement);
    }

    /**
     * Creates the form element
     */
    private createForm(): HTMLFormElement {
        const form = document.createElement('form');
        form.className = 'room-form';
        form.innerHTML = `
            <div class="form-group">
                <label for="roomName">Room Name</label>
                <input type="text" id="roomName" name="name" placeholder="Enter room name">
            </div>
            <div class="form-group">
                <label>Points</label>
                <div class="points-list"></div>
            </div>
            <div class="form-actions">
                <button type="submit">Save Changes</button>
            </div>
        `;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        return form;
    }

    /**
     * Sets the room to edit
     */
    setRoom(room: Room | null): void {
        this.room = room;
        this.render();
    }

    /**
     * Renders the form
     */
    private render(): void {
        if (!this.room) {
            this.formElement.style.display = 'none';
            return;
        }

        this.formElement.style.display = 'block';

        // Update name field
        const nameInput = this.formElement.querySelector('#roomName') as HTMLInputElement;
        nameInput.value = this.room.getName();

        // Update points list
        const pointsList = this.formElement.querySelector('.points-list') as HTMLElement;
        pointsList.innerHTML = '';

        this.room.getPoints().forEach((point, index) => {
            const pointElement = this.createPointElement(point, index);
            pointsList.appendChild(pointElement);
        });
    }

    /**
     * Creates a point editing element
     */
    private createPointElement(point: Point, index: number): HTMLElement {
        const element = document.createElement('div');
        element.className = 'point-item';
        element.innerHTML = `
            <span class="point-label">Point ${index + 1}</span>
            <div class="point-inputs">
                <input type="number" class="point-x" value="${point.x}" step="0.1">
                <input type="number" class="point-y" value="${point.y}" step="0.1">
            </div>
            <button type="button" class="point-delete" title="Delete point">×</button>
        `;

        // Handle point updates
        const xInput = element.querySelector('.point-x') as HTMLInputElement;
        const yInput = element.querySelector('.point-y') as HTMLInputElement;

        xInput.addEventListener('change', () => {
            if (this.room) {
                const points = this.room.getPoints();
                points[index] = { ...points[index], x: parseFloat(xInput.value) };
                this.updateRoomPoints(points);
            }
        });

        yInput.addEventListener('change', () => {
            if (this.room) {
                const points = this.room.getPoints();
                points[index] = { ...points[index], y: parseFloat(yInput.value) };
                this.updateRoomPoints(points);
            }
        });

        // Handle point deletion
        const deleteButton = element.querySelector('.point-delete') as HTMLButtonElement;
        deleteButton.addEventListener('click', () => {
            if (this.room) {
                const points = this.room.getPoints();
                if (points.length > 3) {
                    points.splice(index, 1);
                    this.updateRoomPoints(points);
                } else {
                    alert('Room must have at least 3 points');
                }
            }
        });

        return element;
    }

    /**
     * Updates room points
     */
    private updateRoomPoints(points: Point[]): void {
        if (this.room && points.length >= 3) {
            this.room.setPoints(points);
            this.emit('room:update', this.room);
            this.render();
        }
    }

    /**
     * Handles form submission
     */
    private handleSubmit(): void {
        if (!this.room) return;

        const nameInput = this.formElement.querySelector('#roomName') as HTMLInputElement;
        this.room.setName(nameInput.value);
        this.emit('room:update', this.room);
    }

    /**
     * Gets the current room
     */
    getRoom(): Room | null {
        return this.room;
    }

    /**
     * Destroys the form
     */
    destroy(): void {
        this.container.removeChild(this.formElement);
    }
}
