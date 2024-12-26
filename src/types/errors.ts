/**
 * Severity levels for errors and notifications
 */
export type ErrorSeverity = 'info' | 'warning' | 'error';

/**
 * Error message structure
 */
export interface ErrorMessage {
    id: string;
    message: string;
    severity: ErrorSeverity;
    details?: string;
    timestamp: number;
    autoHide?: boolean;
    duration?: number;
}

/**
 * Error display options
 */
export interface ErrorDisplayOptions {
    container: HTMLElement;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    maxMessages?: number;
    defaultDuration?: number;
}

/**
 * Error manager events
 */
export interface ErrorManagerEvents {
    messageAdded: ErrorMessage;
    messageRemoved: string;
    messageCleared: void;
}

/**
 * Toast notification options
 */
export interface ToastOptions {
    message: string;
    severity?: ErrorSeverity;
    details?: string;
    duration?: number;
    autoHide?: boolean;
}

/**
 * Validation error structure
 */
export interface ValidationError {
    field: string;
    message: string;
    code: string;
    severity: ErrorSeverity;
    details?: string;
}

/**
 * Error boundary options
 */
export interface ErrorBoundaryOptions {
    container: HTMLElement;
    fallback: (error: Error) => HTMLElement;
}

/**
 * Error context data
 */
export interface ErrorContextData {
    addError: (options: ToastOptions) => void;
    removeError: (id: string) => void;
    clearErrors: () => void;
    errors: ErrorMessage[];
}
