export class EventEmitter {
    constructor() {
        this.listeners = new Map();
    }

    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
                this.listeners.delete(event);
            }
        }
    }

    once(event, callback) {
        const onceCallback = (data) => {
            this.off(event, onceCallback);
            callback(data);
        };
        this.on(event, onceCallback);
    }

    removeAllListeners() {
        this.listeners.clear();
    }

    listenerCount(event) {
        const callbacks = this.listeners.get(event);
        return callbacks ? callbacks.size : 0;
    }

    hasListeners(event) {
        return this.listenerCount(event) > 0;
    }

    getListeners(event) {
        return this.listeners.get(event) || new Set();
    }
}
