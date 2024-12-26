import { EventEmitter } from './EventEmitter';
import { Point2D } from '../components/canvas/types';

interface CanvasAccessibilityEvents {
    move: Point2D;
    click: Point2D;
    modeChange: string;
    announcement: string;
}

interface CanvasAccessibilityOptions {
    canvas: HTMLCanvasElement;
    gridSize?: number;
    moveStep?: number;
    announceActions?: boolean;
    enableSound?: boolean;
}

/**
 * Utility class for managing canvas accessibility features
 * @extends EventEmitter<CanvasAccessibilityEvents>
 */
export class CanvasAccessibility extends EventEmitter<CanvasAccessibilityEvents> {
    private canvas: HTMLCanvasElement;
    private cursorPosition: Point2D = { x: 0, y: 0 };
    private gridSize: number;
    private moveStep: number;
    private announceActions: boolean;
    private enableSound: boolean;
    private currentMode: string = 'navigate';
    private audioContext?: AudioContext;

    constructor(options: CanvasAccessibilityOptions) {
        super();

        this.canvas = options.canvas;
        this.gridSize = options.gridSize || 20;
        this.moveStep = options.moveStep || this.gridSize;
        this.announceActions = options.announceActions ?? true;
        this.enableSound = options.enableSound ?? true;

        this.setupAccessibility();
        if (this.enableSound) {
            this.initializeAudio();
        }
    }

    /**
     * Sets up accessibility attributes and event listeners
     * @private
     */
    private setupAccessibility(): void {
        // Make canvas focusable
        this.canvas.setAttribute('tabindex', '0');
        this.canvas.setAttribute('role', 'application');
        this.canvas.setAttribute('aria-label', 'Drawing canvas');

        // Add keyboard event listeners
        this.canvas.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.canvas.addEventListener('focus', () => this.announce('Canvas focused. Use arrow keys to navigate.'));

        // Add description of controls
        const description = document.createElement('div');
        description.className = 'sr-only';
        description.textContent = `
            Use arrow keys to move cursor.
            Press Space or Enter to place points.
            Press Tab to cycle through modes.
            Press Escape to cancel current action.
        `;
        this.canvas.parentElement?.appendChild(description);
    }

    /**
     * Initializes audio context for sound feedback
     * @private
     */
    private initializeAudio(): void {
        try {
            this.audioContext = new AudioContext();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.enableSound = false;
        }
    }

    /**
     * Handles keyboard events
     * @private
     */
    private handleKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.moveCursor(0, -this.moveStep);
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.moveCursor(0, this.moveStep);
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.moveCursor(-this.moveStep, 0);
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.moveCursor(this.moveStep, 0);
                break;
            case ' ':
            case 'Enter':
                event.preventDefault();
                this.handleAction();
                break;
            case 'Tab':
                event.preventDefault();
                this.cycleMode();
                break;
            case 'Escape':
                event.preventDefault();
                this.cancelAction();
                break;
        }
    }

    /**
     * Moves the cursor by the specified delta
     * @private
     */
    private moveCursor(deltaX: number, deltaY: number): void {
        const newX = Math.max(0, Math.min(this.canvas.width, this.cursorPosition.x + deltaX));
        const newY = Math.max(0, Math.min(this.canvas.height, this.cursorPosition.y + deltaY));

        this.cursorPosition = { x: newX, y: newY };
        this.emit('move', this.cursorPosition);

        // Announce position if screen reader support is enabled
        if (this.announceActions) {
            this.announce(`Cursor at ${Math.round(newX)}, ${Math.round(newY)}`);
        }

        // Play movement sound
        this.playSound('move');
    }

    /**
     * Handles action (space/enter) key press
     * @private
     */
    private handleAction(): void {
        this.emit('click', this.cursorPosition);
        this.announce(`Point placed at ${Math.round(this.cursorPosition.x)}, ${Math.round(this.cursorPosition.y)}`);
        this.playSound('click');
    }

    /**
     * Cycles through available modes
     * @private
     */
    private cycleMode(): void {
        const modes = ['navigate', 'draw', 'select'];
        const currentIndex = modes.indexOf(this.currentMode);
        this.currentMode = modes[(currentIndex + 1) % modes.length];
        
        this.emit('modeChange', this.currentMode);
        this.announce(`Mode changed to ${this.currentMode}`);
        this.playSound('mode');
    }

    /**
     * Cancels the current action
     * @private
     */
    private cancelAction(): void {
        this.announce('Action cancelled');
        this.playSound('cancel');
    }

    /**
     * Announces a message to screen readers
     * @private
     */
    private announce(message: string): void {
        if (this.announceActions) {
            this.emit('announcement', message);

            // Create live region for announcement
            const liveRegion = document.createElement('div');
            liveRegion.setAttribute('role', 'status');
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.className = 'sr-only';
            liveRegion.textContent = message;

            document.body.appendChild(liveRegion);
            setTimeout(() => liveRegion.remove(), 1000);
        }
    }

    /**
     * Plays a sound effect
     * @private
     */
    private playSound(type: 'move' | 'click' | 'mode' | 'cancel'): void {
        if (!this.enableSound || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        // Configure sound based on type
        switch (type) {
            case 'move':
                oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                break;
            case 'click':
                oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                break;
            case 'mode':
                oscillator.frequency.setValueAtTime(660, this.audioContext.currentTime); // E5
                gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                break;
            case 'cancel':
                oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime); // A3
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                break;
        }

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    /**
     * Gets the current cursor position
     */
    getCursorPosition(): Point2D {
        return { ...this.cursorPosition };
    }

    /**
     * Sets the cursor position
     */
    setCursorPosition(position: Point2D): void {
        this.cursorPosition = { ...position };
        this.emit('move', this.cursorPosition);
    }

    /**
     * Gets the current mode
     */
    getCurrentMode(): string {
        return this.currentMode;
    }

    /**
     * Sets the current mode
     */
    setMode(mode: string): void {
        this.currentMode = mode;
        this.emit('modeChange', mode);
        this.announce(`Mode changed to ${mode}`);
    }

    /**
     * Sets the grid size
     */
    setGridSize(size: number): void {
        this.gridSize = size;
        this.moveStep = size;
    }

    /**
     * Enables or disables sound effects
     */
    setSoundEnabled(enabled: boolean): void {
        this.enableSound = enabled;
        if (enabled && !this.audioContext) {
            this.initializeAudio();
        }
    }

    /**
     * Enables or disables screen reader announcements
     */
    setAnnouncementsEnabled(enabled: boolean): void {
        this.announceActions = enabled;
    }

    /**
     * Cleans up resources
     */
    destroy(): void {
        this.canvas.removeEventListener('keydown', this.handleKeyDown);
        this.audioContext?.close();
        this.removeAllListeners();
    }
}
