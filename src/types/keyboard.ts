/**
 * Keyboard event interface
 */
export interface KeyboardEvent {
    key: string;
    modifiers: ModifierKey[];
    preventDefault: () => void;
    stopPropagation: () => void;
}

/**
 * Keyboard options interface
 */
export interface KeyboardOptions {
    bindings?: Partial<KeyboardShortcuts>;
    enabled?: boolean;
    preventDefault?: boolean;
    enableHelp?: boolean;
    preventDefaultForKeys?: string[];
}

/**
 * Keyboard state interface
 */
export interface KeyboardState {
    enabled: boolean;
    isEnabled: boolean;
    isHelpVisible: boolean;
    activeModifiers: Set<ModifierKey>;
    pressedKeys: Set<string>;
}

/**
 * Modifier keys
 */
export type ModifierKey = 'ctrl' | 'alt' | 'shift' | 'meta';

/**
 * Key binding interface
 */
export interface KeyBinding {
    key: string;
    modifiers: ModifierKey[];
    preventDefault?: boolean;
    description?: string;
}

/**
 * Keyboard shortcuts mapping
 */
export interface KeyboardShortcuts {
    undo: KeyBinding;
    redo: KeyBinding;
    delete: KeyBinding;
    escape: KeyBinding;
    save: KeyBinding;
    [key: string]: KeyBinding;
}

/**
 * Default key bindings
 */
export const defaultKeyBindings: KeyboardShortcuts = {
    undo: {
        key: 'z',
        modifiers: ['ctrl'],
        description: 'Undo last action'
    },
    redo: {
        key: 'y',
        modifiers: ['ctrl'],
        description: 'Redo last action'
    },
    delete: {
        key: 'Delete',
        modifiers: [],
        description: 'Delete selected item'
    },
    escape: {
        key: 'Escape',
        modifiers: [],
        description: 'Cancel current action'
    },
    save: {
        key: 's',
        modifiers: ['ctrl'],
        description: 'Save changes'
    }
};

/**
 * Keyboard manager events
 */
export interface KeyboardManagerEvents {
    shortcutTriggered: { binding: KeyBinding; event: KeyboardEvent };
    bindingChanged: { key: string; binding: KeyBinding };
}

/**
 * Check if a key is a modifier key
 */
export function isModifierKey(key: string): key is ModifierKey {
    return ['ctrl', 'alt', 'shift', 'meta'].includes(key);
}

/**
 * Get modifier key from keyboard event
 */
export function getModifierKeyFromEvent(event: globalThis.KeyboardEvent): ModifierKey | null {
    if (event.key === 'Control') return 'ctrl';
    if (event.key === 'Alt') return 'alt';
    if (event.key === 'Shift') return 'shift';
    if (event.key === 'Meta') return 'meta';
    return null;
}

/**
 * Get key from keyboard event
 */
export function getKeyFromEvent(event: globalThis.KeyboardEvent): string {
    return event.key.toLowerCase();
}

/**
 * Check if modifiers are active
 */
export function areModifiersActive(required: ModifierKey[], active: Set<ModifierKey>): boolean {
    return required.every(mod => active.has(mod)) &&
           Array.from(active).every(mod => required.includes(mod));
}

/**
 * Get modifiers from set
 */
export function getModifiersFromSet(modifiers: Set<ModifierKey>): ModifierKey[] {
    return Array.from(modifiers);
}

/**
 * Create initial keyboard state
 */
export function createInitialKeyboardState(enabled: boolean): KeyboardState {
    return {
        enabled,
        isEnabled: enabled,
        isHelpVisible: false,
        activeModifiers: new Set(),
        pressedKeys: new Set()
    };
}
