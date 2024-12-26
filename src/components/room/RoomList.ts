import { Room } from '../../models/Room';
import EventEmitter from 'eventemitter3';

interface RoomListOptions {
    container: HTMLElement;
}

interface RoomListEvents {
    'room:select': (room: Room | null) => void;
    'room:delete': (room: Room) => void;
}

// Define the interface for the class before the implementation
export interface RoomList {
    on<K extends keyof RoomListEvents>(event: K, listener: RoomListEvents[K]): this;
    off<K extends keyof RoomListEvents>(event: K, listener: RoomListEvents[K]): this;
    emit<K extends keyof RoomListEvents>(event: K, ...args: Parameters<RoomListEvents[K]>): boolean;
}

/**
 * Manages the list of rooms in the UI
 */
export class RoomList extends EventEmitter {
    private container: HTMLElement;
    private listElement: HTMLElement;
    private rooms: Room[] = [];
    private selectedRoom: Room | null = null;

    constructor({ container }: RoomListOptions) {
        super();
        this.container = container;
        this.listElement = document.createElement('div');
        this.listElement.className = 'room-list';
        this.container.appendChild(this.listElement);
    }

    /**
     * Updates the list of rooms
     */
    setRooms(rooms: Room[]): void {
        this.rooms = rooms;
        this.render();
    }

    /**
     * Updates the selected room
     */
    setSelectedRoom(room: Room | null): void {
        this.selectedRoom = room;
        this.render();
    }

    /**
     * Renders the room list
     */
    private render(): void {
        this.listElement.innerHTML = '';

        if (this.rooms.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'room-list-empty';
            emptyMessage.textContent = 'No rooms added yet';
            this.listElement.appendChild(emptyMessage);
            return;
        }

        const list = document.createElement('ul');
        list.className = 'room-list-items';

        this.rooms.forEach(room => {
            const item = document.createElement('li');
            item.className = 'room-list-item';
            if (room === this.selectedRoom) {
                item.classList.add('selected');
            }

            // Room info
            const info = document.createElement('div');
            info.className = 'room-info';
            info.textContent = `Room ${room.id}`;
            info.addEventListener('click', () => {
                this.emit('room:select', room);
            });

            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'room-delete';
            deleteButton.innerHTML = '×';
            deleteButton.title = 'Delete room';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.emit('room:delete', room);
            });

            // Room measurements
            const measurements = document.createElement('div');
            measurements.className = 'room-measurements';
            const area = room.calculateArea();
            const perimeter = room.calculatePerimeter();
            measurements.innerHTML = `
                Area: ${area.toFixed(2)} sq ft<br>
                Perimeter: ${perimeter.toFixed(2)} ft
            `;

            item.appendChild(info);
            item.appendChild(measurements);
            item.appendChild(deleteButton);
            list.appendChild(item);
        });

        this.listElement.appendChild(list);
    }

    /**
     * Gets the list of rooms
     */
    getRooms(): Room[] {
        return [...this.rooms];
    }

    /**
     * Gets the selected room
     */
    getSelectedRoom(): Room | null {
        return this.selectedRoom;
    }

    /**
     * Adds a room to the list
     */
    addRoom(room: Room): void {
        this.rooms.push(room);
        this.render();
    }

    /**
     * Removes a room from the list
     */
    removeRoom(room: Room): void {
        const index = this.rooms.indexOf(room);
        if (index !== -1) {
            this.rooms.splice(index, 1);
            if (this.selectedRoom === room) {
                this.selectedRoom = null;
            }
            this.render();
        }
    }

    /**
     * Updates a room in the list
     */
    updateRoom(room: Room): void {
        const index = this.rooms.findIndex(r => r.id === room.id);
        if (index !== -1) {
            this.rooms[index] = room;
            if (this.selectedRoom?.id === room.id) {
                this.selectedRoom = room;
            }
            this.render();
        }
    }

    /**
     * Clears the room list
     */
    clear(): void {
        this.rooms = [];
        this.selectedRoom = null;
        this.render();
    }

    /**
     * Destroys the room list
     */
    destroy(): void {
        this.container.removeChild(this.listElement);
    }
}
