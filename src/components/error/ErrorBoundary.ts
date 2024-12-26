import { EventEmitter } from '../../utils/EventEmitter';

interface ErrorBoundaryEvents {
    error: { error: Error; componentStack?: string };
    reset: void;
}

interface ErrorBoundaryOptions {
    container: HTMLElement;
    fallback: (error: Error, retry: () => void) => HTMLElement;
    onError?: (error: Error, componentStack?: string) => void;
}

/**
 * Error boundary component for handling component failures
 * @extends EventEmitter<ErrorBoundaryEvents>
 */
export class ErrorBoundary extends EventEmitter<ErrorBoundaryEvents> {
    private container: HTMLElement;
    private fallback: ErrorBoundaryOptions['fallback'];
    private onError?: ErrorBoundaryOptions['onError'];
    private hasError: boolean = false;
    private error: Error | null = null;
    private componentStack?: string;
    private content: HTMLElement | null = null;
    private fallbackElement: HTMLElement | null = null;

    constructor(options: ErrorBoundaryOptions) {
        super();

        if (!options.container) {
            throw new Error('Error boundary container element is required');
        }

        this.container = options.container;
        this.fallback = options.fallback;
        this.onError = options.onError;

        // Wrap container content in a div
        this.content = document.createElement('div');
        this.content.className = 'error-boundary-content';
        
        // Move existing content
        while (this.container.firstChild) {
            this.content.appendChild(this.container.firstChild);
        }
        
        this.container.appendChild(this.content);

        // Set up error event listener
        this.setupErrorListener();
    }

    /**
     * Sets up error event listeners
     * @private
     */
    private setupErrorListener(): void {
        // Listen for errors in child elements
        this.content?.addEventListener('error', this.handleError.bind(this), true);
        
        // Listen for unhandled rejections
        window.addEventListener('unhandledrejection', (event) => {
            // Only handle errors from child elements
            const target = event.target as any;
            if (this.content?.contains(target)) {
                this.handleError(new Error(event.reason));
            }
        });
    }

    /**
     * Handles errors caught by the boundary
     * @private
     */
    private handleError(error: Error | Event): void {
        if (!this.hasError) {
            const errorObj = error instanceof Error ? error : new Error('An unknown error occurred');
            const stack = error instanceof Error ? error.stack : undefined;

            this.hasError = true;
            this.error = errorObj;
            this.componentStack = stack;

            // Hide content and show fallback
            if (this.content) {
                this.content.style.display = 'none';
            }

            // Create and show fallback UI
            this.fallbackElement = this.fallback(errorObj, () => this.retry());
            this.fallbackElement.className = 'error-boundary-fallback';
            this.container.appendChild(this.fallbackElement);

            // Notify listeners
            this.emit('error', { error: errorObj, componentStack: stack });
            this.onError?.(errorObj, stack);
        }
    }

    /**
     * Retries the component by resetting the error state
     */
    retry(): void {
        if (this.hasError) {
            this.hasError = false;
            this.error = null;
            this.componentStack = undefined;

            // Remove fallback and show content
            this.fallbackElement?.remove();
            this.fallbackElement = null;

            if (this.content) {
                this.content.style.display = '';
            }

            // Notify listeners
            this.emit('reset', undefined);
        }
    }

    /**
     * Gets the current error state
     */
    getError(): { error: Error; componentStack?: string } | null {
        return this.hasError && this.error
            ? { error: this.error, componentStack: this.componentStack }
            : null;
    }

    /**
     * Checks if the boundary has an error
     */
    hasActiveError(): boolean {
        return this.hasError;
    }

    /**
     * Wraps a component with error boundary protection
     * @param component - The component to wrap
     * @returns The wrapped component
     */
    static wrap(component: HTMLElement, fallback: ErrorBoundaryOptions['fallback']): ErrorBoundary {
        const container = document.createElement('div');
        container.className = 'error-boundary-container';
        component.parentElement?.insertBefore(container, component);
        container.appendChild(component);

        return new ErrorBoundary({
            container,
            fallback
        });
    }

    /**
     * Creates a default fallback UI
     * @param error - The error that occurred
     * @param retry - Function to retry the component
     * @returns The fallback element
     */
    static createDefaultFallback(error: Error, retry: () => void): HTMLElement {
        const container = document.createElement('div');
        container.className = 'error-boundary-default-fallback';
        container.setAttribute('role', 'alert');

        const message = document.createElement('p');
        message.className = 'error-message';
        message.textContent = 'Something went wrong:';

        const errorText = document.createElement('pre');
        errorText.className = 'error-details';
        errorText.textContent = error.message;

        const retryButton = document.createElement('button');
        retryButton.className = 'retry-button';
        retryButton.textContent = 'Retry';
        retryButton.setAttribute('aria-label', 'Retry loading the component');
        retryButton.addEventListener('click', retry);

        container.appendChild(message);
        container.appendChild(errorText);
        container.appendChild(retryButton);

        return container;
    }

    /**
     * Cleans up the error boundary
     */
    destroy(): void {
        // Remove error listeners
        this.content?.removeEventListener('error', this.handleError.bind(this), true);
        
        // Move content back to container
        if (this.content) {
            while (this.content.firstChild) {
                this.container.appendChild(this.content.firstChild);
            }
            this.content.remove();
        }

        // Remove fallback if present
        this.fallbackElement?.remove();

        // Clean up event emitter
        this.removeAllListeners();
    }
}
