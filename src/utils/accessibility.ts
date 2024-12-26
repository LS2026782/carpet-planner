/**
 * Types of focusable elements
 */
export type FocusableElement = HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLAnchorElement;

/**
 * Focus trap options
 */
export interface FocusTrapOptions {
    container: HTMLElement;
    initialFocus?: HTMLElement;
    onEscape?: () => void;
    autoFocus?: boolean;
}

/**
 * Focus management class
 */
export class FocusManager {
    private static focusHistory: HTMLElement[] = [];
    private static activeTraps: FocusTrap[] = [];

    /**
     * Saves the current focus state
     */
    static saveFocus(): void {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement !== document.body) {
            this.focusHistory.push(activeElement);
        }
    }

    /**
     * Restores the last saved focus state
     */
    static restoreFocus(): void {
        const element = this.focusHistory.pop();
        if (element && element.focus) {
            element.focus();
        }
    }

    /**
     * Creates a focus trap
     */
    static createTrap(options: FocusTrapOptions): FocusTrap {
        const trap = new FocusTrap(options);
        this.activeTraps.push(trap);
        return trap;
    }

    /**
     * Removes a focus trap
     */
    static removeTrap(trap: FocusTrap): void {
        const index = this.activeTraps.indexOf(trap);
        if (index !== -1) {
            this.activeTraps.splice(index, 1);
        }
    }

    /**
     * Gets all focusable elements within a container
     */
    static getFocusableElements(container: HTMLElement): FocusableElement[] {
        const selector = [
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'a[href]',
            '[tabindex]:not([tabindex="-1"])'
        ].join(',');

        return Array.from(container.querySelectorAll(selector)) as FocusableElement[];
    }

    /**
     * Sets focus to the first focusable element in a container
     */
    static focusFirst(container: HTMLElement): void {
        const elements = this.getFocusableElements(container);
        if (elements.length > 0) {
            elements[0].focus();
        }
    }

    /**
     * Sets focus to the last focusable element in a container
     */
    static focusLast(container: HTMLElement): void {
        const elements = this.getFocusableElements(container);
        if (elements.length > 0) {
            elements[elements.length - 1].focus();
        }
    }
}

/**
 * Focus trap class for modal-like components
 */
export class FocusTrap {
    private container: HTMLElement;
    private initialFocus?: HTMLElement;
    private onEscape?: () => void;
    private previouslyFocused?: HTMLElement;

    constructor(options: FocusTrapOptions) {
        this.container = options.container;
        this.initialFocus = options.initialFocus;
        this.onEscape = options.onEscape;

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleFocus = this.handleFocus.bind(this);

        if (options.autoFocus !== false) {
            this.activate();
        }
    }

    /**
     * Activates the focus trap
     */
    activate(): void {
        this.previouslyFocused = document.activeElement as HTMLElement;

        // Set initial focus
        if (this.initialFocus) {
            this.initialFocus.focus();
        } else {
            FocusManager.focusFirst(this.container);
        }

        // Add event listeners
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('focus', this.handleFocus, true);
    }

    /**
     * Deactivates the focus trap
     */
    deactivate(): void {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('focus', this.handleFocus, true);

        // Restore previous focus
        if (this.previouslyFocused && this.previouslyFocused.focus) {
            this.previouslyFocused.focus();
        }

        FocusManager.removeTrap(this);
    }

    /**
     * Handles keydown events
     */
    private handleKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Tab') {
            const focusableElements = FocusManager.getFocusableElements(this.container);
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];

            if (!focusableElements.length) {
                event.preventDefault();
                return;
            }

            if (event.shiftKey && document.activeElement === firstFocusable) {
                event.preventDefault();
                lastFocusable.focus();
            } else if (!event.shiftKey && document.activeElement === lastFocusable) {
                event.preventDefault();
                firstFocusable.focus();
            }
        } else if (event.key === 'Escape' && this.onEscape) {
            this.onEscape();
        }
    }

    /**
     * Handles focus events
     */
    private handleFocus(event: FocusEvent): void {
        if (
            event.target instanceof HTMLElement &&
            !this.container.contains(event.target)
        ) {
            FocusManager.focusFirst(this.container);
        }
    }
}

/**
 * Keyboard navigation helper
 */
export class KeyboardNavigation {
    private container: HTMLElement;
    private currentIndex: number = -1;
    private elements: FocusableElement[] = [];

    constructor(container: HTMLElement) {
        this.container = container;
        this.updateElements();
    }

    /**
     * Updates the list of focusable elements
     */
    updateElements(): void {
        this.elements = FocusManager.getFocusableElements(this.container);
        this.currentIndex = this.elements.indexOf(document.activeElement as FocusableElement);
    }

    /**
     * Focuses the next element
     */
    focusNext(): void {
        if (this.elements.length === 0) return;
        this.currentIndex = (this.currentIndex + 1) % this.elements.length;
        this.elements[this.currentIndex].focus();
    }

    /**
     * Focuses the previous element
     */
    focusPrevious(): void {
        if (this.elements.length === 0) return;
        this.currentIndex = (this.currentIndex - 1 + this.elements.length) % this.elements.length;
        this.elements[this.currentIndex].focus();
    }

    /**
     * Focuses the first element
     */
    focusFirst(): void {
        if (this.elements.length === 0) return;
        this.currentIndex = 0;
        this.elements[this.currentIndex].focus();
    }

    /**
     * Focuses the last element
     */
    focusLast(): void {
        if (this.elements.length === 0) return;
        this.currentIndex = this.elements.length - 1;
        this.elements[this.currentIndex].focus();
    }

    /**
     * Focuses an element by index
     */
    focusIndex(index: number): void {
        if (index >= 0 && index < this.elements.length) {
            this.currentIndex = index;
            this.elements[this.currentIndex].focus();
        }
    }

    /**
     * Gets the currently focused element
     */
    getCurrentElement(): FocusableElement | null {
        return this.currentIndex >= 0 ? this.elements[this.currentIndex] : null;
    }

    /**
     * Gets all focusable elements
     */
    getElements(): FocusableElement[] {
        return [...this.elements];
    }
}
