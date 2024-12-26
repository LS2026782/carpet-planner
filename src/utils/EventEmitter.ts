type EventCallback<T> = (data: T) => void;

export class EventEmitter<Events extends Record<string, any>> {
    private listeners: Map<keyof Events, Set<EventCallback<any>>> = new Map();

    public emit<K extends keyof Events>(event: K, data: Events[K]): void {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }

    public on<K extends keyof Events>(event: K, callback: EventCallback<Events[K]>): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
    }

    public off<K extends keyof Events>(event: K, callback: EventCallback<Events[K]>): void {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
                this.listeners.delete(event);
            }
        }
    }

    public once<K extends keyof Events>(event: K, callback: EventCallback<Events[K]>): void {
        const onceCallback = (data: Events[K]) => {
            this.off(event, onceCallback);
            callback(data);
        };
        this.on(event, onceCallback);
    }

    public removeAllListeners(): void {
        this.listeners.clear();
    }

    public listenerCount(event: keyof Events): number {
        const callbacks = this.listeners.get(event);
        return callbacks ? callbacks.size : 0;
    }

    public hasListeners(event: keyof Events): boolean {
        return this.listenerCount(event) > 0;
    }

    public getListeners<K extends keyof Events>(event: K): Set<EventCallback<Events[K]>> {
        return this.listeners.get(event) || new Set();
    }
}
