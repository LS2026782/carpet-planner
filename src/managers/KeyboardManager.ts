import { EventEmitter } from '../utils/EventEmitter';
import {
    KeyboardEvent,
    KeyboardOptions,
    KeyboardState,
    KeyBinding,
    ModifierKey,
    defaultKeyBindings,
    isModifierKey,
    getModifierKeyFromEvent,
    getKeyFromEvent,
    areModifiersActive,
    getModifiersFromSet,
    createInitialKeyboardState,
    KeyboardShortcuts
} from '../types/keyboard';

interface KeyboardManagerEvents {
    shortcutTriggered: { binding: KeyBinding; event: KeyboardEvent };
    bindingChanged: { key: string; binding: KeyBinding };
}

export class KeyboardManager {
    private eventEmitter = new EventEmitter<KeyboardManagerEvents>();
    private state: KeyboardState;
    private options: Required<KeyboardOptions>;
    private bindings: KeyboardShortcuts;

    constructor(options: KeyboardOptions = {}) {
        this.options = {
            bindings: defaultKeyBindings,
            enabled: true,
            preventDefault: true,
            enableHelp: true,
            preventDefaultForKeys: [],
            ...options
        };

        this.bindings = { ...defaultKeyBindings };
        if (options.bindings) {
            Object.entries(options.bindings).forEach(([key, binding]) => {
                if (binding) {
                    this.bindings[key] = binding;
                }
            });
        }

        this.state = createInitialKeyboardState(this.options.enabled);

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('blur', this.handleBlur);
    }

    private handleKeyDown = (event: globalThis.KeyboardEvent) => {
        if (!this.state.enabled) return;

        const key = getKeyFromEvent(event);
        const modifierKey = getModifierKeyFromEvent(event);

        if (modifierKey) {
            this.state.activeModifiers.add(modifierKey);
        } else {
            this.state.pressedKeys.add(key);
            this.handleShortcut(key, event);
        }
    };

    private handleKeyUp = (event: globalThis.KeyboardEvent) => {
        const key = getKeyFromEvent(event);
        const modifierKey = getModifierKeyFromEvent(event);

        if (modifierKey) {
            this.state.activeModifiers.delete(modifierKey);
        } else {
            this.state.pressedKeys.delete(key);
        }
    };

    private handleBlur = () => {
        this.state.activeModifiers.clear();
        this.state.pressedKeys.clear();
    };

    private handleShortcut(key: string, event: globalThis.KeyboardEvent) {
        for (const [action, binding] of Object.entries(this.bindings)) {
            if (
                binding.key === key &&
                areModifiersActive(binding.modifiers, this.state.activeModifiers)
            ) {
                if (binding.preventDefault || this.shouldPreventDefault(key)) {
                    event.preventDefault();
                }

                const mcpEvent: KeyboardEvent = {
                    key,
                    modifiers: getModifiersFromSet(this.state.activeModifiers),
                    preventDefault: () => event.preventDefault(),
                    stopPropagation: () => event.stopPropagation()
                };

                this.eventEmitter.emit('shortcutTriggered', {
                    binding,
                    event: mcpEvent
                });

                break;
            }
        }
    }

    private shouldPreventDefault(key: string): boolean {
        return this.options.preventDefault || this.options.preventDefaultForKeys.includes(key);
    }

    public on<K extends keyof KeyboardManagerEvents>(
        event: K,
        callback: (data: KeyboardManagerEvents[K]) => void
    ): void {
        this.eventEmitter.on(event, callback);
    }

    public off<K extends keyof KeyboardManagerEvents>(
        event: K,
        callback: (data: KeyboardManagerEvents[K]) => void
    ): void {
        this.eventEmitter.off(event, callback);
    }

    public enable(): void {
        this.setEnabled(true);
    }

    public disable(): void {
        this.setEnabled(false);
    }

    public setEnabled(enabled: boolean): void {
        this.state.enabled = enabled;
        this.state.isEnabled = enabled;
        if (!enabled) {
            this.handleBlur();
        }
    }

    public isEnabled(): boolean {
        return this.state.enabled;
    }

    public setHelpVisible(visible: boolean): void {
        this.state.isHelpVisible = visible;
    }

    public isHelpVisible(): boolean {
        return this.state.isHelpVisible;
    }

    public getActiveModifiers(): Set<ModifierKey> {
        return this.state.activeModifiers;
    }

    public getPressedKeys(): Set<string> {
        return this.state.pressedKeys;
    }

    public getBindings(): KeyboardShortcuts {
        return { ...this.bindings };
    }

    public getBinding(action: string): KeyBinding | undefined {
        return this.bindings[action];
    }

    public setBinding(action: string, binding: KeyBinding): void {
        this.bindings[action] = binding;
        this.eventEmitter.emit('bindingChanged', { key: action, binding });
    }

    public removeBinding(action: string): void {
        delete this.bindings[action];
    }

    public destroy(): void {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('blur', this.handleBlur);
        this.eventEmitter.removeAllListeners();
    }
}
