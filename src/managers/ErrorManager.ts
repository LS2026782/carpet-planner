import { EventEmitter } from '../utils/EventEmitter';
import {
    ErrorMessage,
    ErrorManagerEvents,
    ErrorDisplayOptions,
    ToastOptions,
    ErrorSeverity
} from '../types/errors';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_DURATION = 5000; // 5 seconds
const DEFAULT_MAX_MESSAGES = 5;

/**
 * Manages error messages and notifications
 * @extends EventEmitter<ErrorManagerEvents>
 */
export class ErrorManager extends EventEmitter<ErrorManagerEvents> {
    private container: HTMLElement;
    private messages: Map<string, ErrorMessage>;
    private position: ErrorDisplayOptions['position'];
    private maxMessages: number;
    private defaultDuration: number;
    private wrapper!: HTMLElement; // Using definite assignment assertion

    /**
     * Creates a new ErrorManager instance
     * @param options - Error display options
     */
    constructor(options: ErrorDisplayOptions) {
        super();

        if (!options.container) {
            throw new Error('Error manager container element is required');
        }

        this.container = options.container;
        this.messages = new Map();
        this.position = options.position || 'top-right';
        this.maxMessages = options.maxMessages || DEFAULT_MAX_MESSAGES;
        this.defaultDuration = options.defaultDuration || DEFAULT_DURATION;

        this.createWrapper();
        this.setupStyles();
    }

    /**
     * Creates the error message wrapper
     * @private
     */
    private createWrapper(): void {
        this.wrapper = document.createElement('div');
        this.wrapper.className = `error-wrapper ${this.position}`;
        this.wrapper.setAttribute('role', 'alert');
        this.wrapper.setAttribute('aria-live', 'polite');
        this.container.appendChild(this.wrapper);
    }

    /**
     * Sets up error display styles
     * @private
     */
    private setupStyles(): void {
        // Check if styles are already added
        if (document.getElementById('error-manager-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'error-manager-styles';
        style.textContent = `
            .error-wrapper {
                position: fixed;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 8px;
                max-width: 400px;
                padding: 16px;
                pointer-events: none;
            }
            
            .error-wrapper.top-right {
                top: 0;
                right: 0;
            }
            
            .error-wrapper.top-left {
                top: 0;
                left: 0;
            }
            
            .error-wrapper.bottom-right {
                bottom: 0;
                right: 0;
            }
            
            .error-wrapper.bottom-left {
                bottom: 0;
                left: 0;
            }
            
            .error-message {
                padding: 12px 16px;
                border-radius: 4px;
                background: white;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                pointer-events: auto;
                display: flex;
                align-items: flex-start;
                gap: 8px;
                animation: slideIn 0.3s ease-out;
            }
            
            .error-message.info {
                border-left: 4px solid #2196f3;
            }
            
            .error-message.warning {
                border-left: 4px solid #ff9800;
            }
            
            .error-message.error {
                border-left: 4px solid #f44336;
            }
            
            .error-content {
                flex: 1;
            }
            
            .error-title {
                margin: 0 0 4px;
                font-weight: bold;
            }
            
            .error-details {
                margin: 0;
                font-size: 0.9em;
                color: #666;
            }
            
            .error-close {
                background: none;
                border: none;
                padding: 4px;
                cursor: pointer;
                color: #666;
                font-size: 18px;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Shows an error message
     * @param options - Toast notification options
     * @returns The ID of the created message
     */
    show(options: ToastOptions): string {
        const id = uuidv4();
        const message: ErrorMessage = {
            id,
            message: options.message,
            severity: options.severity || 'info',
            details: options.details,
            timestamp: Date.now(),
            autoHide: options.autoHide ?? true,
            duration: options.duration || this.defaultDuration
        };

        // Remove oldest message if we're at max capacity
        if (this.messages.size >= this.maxMessages) {
            const oldest = Array.from(this.messages.values())
                .sort((a, b) => a.timestamp - b.timestamp)[0];
            if (oldest) {
                this.remove(oldest.id);
            }
        }

        this.messages.set(id, message);
        this.renderMessage(message);
        this.emit('messageAdded', message);

        if (message.autoHide) {
            setTimeout(() => this.remove(id), message.duration);
        }

        return id;
    }

    /**
     * Renders an error message
     * @private
     */
    private renderMessage(message: ErrorMessage): void {
        const element = document.createElement('div');
        element.className = `error-message ${message.severity}`;
        element.id = `error-${message.id}`;
        element.setAttribute('role', 'alert');

        const content = document.createElement('div');
        content.className = 'error-content';

        const title = document.createElement('p');
        title.className = 'error-title';
        title.textContent = message.message;
        content.appendChild(title);

        if (message.details) {
            const details = document.createElement('p');
            details.className = 'error-details';
            details.textContent = message.details;
            content.appendChild(details);
        }

        const closeButton = document.createElement('button');
        closeButton.className = 'error-close';
        closeButton.innerHTML = '×';
        closeButton.setAttribute('aria-label', 'Close notification');
        closeButton.addEventListener('click', () => this.remove(message.id));

        element.appendChild(content);
        element.appendChild(closeButton);
        this.wrapper.appendChild(element);
    }

    /**
     * Removes an error message
     * @param id - The ID of the message to remove
     */
    remove(id: string): void {
        const element = document.getElementById(`error-${id}`);
        if (element) {
            element.style.animation = 'slideOut 0.3s ease-out';
            element.addEventListener('animationend', () => {
                element.remove();
                this.messages.delete(id);
                this.emit('messageRemoved', id);
            });
        }
    }

    /**
     * Shows an info message
     * @param message - The message to show
     * @param options - Additional options
     */
    info(message: string, options: Partial<ToastOptions> = {}): string {
        return this.show({ message, severity: 'info', ...options });
    }

    /**
     * Shows a warning message
     * @param message - The message to show
     * @param options - Additional options
     */
    warning(message: string, options: Partial<ToastOptions> = {}): string {
        return this.show({ message, severity: 'warning', ...options });
    }

    /**
     * Shows an error message
     * @param message - The message to show
     * @param options - Additional options
     */
    error(message: string, options: Partial<ToastOptions> = {}): string {
        return this.show({ message, severity: 'error', ...options });
    }

    /**
     * Clears all error messages
     */
    clear(): void {
        this.messages.forEach((_, id) => this.remove(id));
        this.emit('messageCleared', undefined);
    }

    /**
     * Gets all current error messages
     */
    getMessages(): ErrorMessage[] {
        return Array.from(this.messages.values());
    }

    /**
     * Gets a specific error message
     * @param id - The ID of the message to get
     */
    getMessage(id: string): ErrorMessage | undefined {
        return this.messages.get(id);
    }

    /**
     * Updates the position of the error wrapper
     * @param position - The new position
     */
    setPosition(position: ErrorDisplayOptions['position']): void {
        this.position = position;
        this.wrapper.className = `error-wrapper ${position}`;
    }

    /**
     * Cleans up the error manager
     */
    destroy(): void {
        this.clear();
        this.wrapper.remove();
        const styles = document.getElementById('error-manager-styles');
        if (styles) {
            styles.remove();
        }
        this.removeAllListeners();
    }
}
