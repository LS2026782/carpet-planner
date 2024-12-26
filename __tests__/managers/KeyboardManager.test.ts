import { KeyboardManager } from '../../src/managers/KeyboardManager';
import { KeyBinding } from '../../src/types/keyboard';

describe('KeyboardManager', () => {
    let manager: KeyboardManager;

    beforeEach(() => {
        manager = new KeyboardManager();
    });

    afterEach(() => {
        manager.destroy();
    });

    describe('initialization', () => {
        it('should initialize with default bindings', () => {
            const bindings = manager.getBindings();
            expect(bindings.delete).toBeDefined();
            expect(bindings.undo).toBeDefined();
            expect(bindings.redo).toBeDefined();
        });

        it('should accept custom bindings', () => {
            const customBindings: Record<string, KeyBinding> = {
                'custom': {
                    key: 'x',
                    description: 'Custom action',
                    category: 'general'
                }
            };

            const customManager = new KeyboardManager({ bindings: customBindings });
            const bindings = customManager.getBindings();
            expect(bindings.custom).toBeDefined();
            expect(bindings.custom.key).toBe('x');
            customManager.destroy();
        });
    });

    describe('event handling', () => {
        it('should trigger shortcut events', () => {
            const callback = jest.fn();
            manager.on('shortcutTriggered', callback);

            // Simulate Delete key press
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));
            expect(callback).toHaveBeenCalledWith(expect.objectContaining({
                binding: expect.objectContaining({
                    key: 'Delete',
                    category: 'editing'
                })
            }));
        });

        it('should handle modifier keys', () => {
            const callback = jest.fn();
            manager.on('shortcutTriggered', callback);

            // Simulate Ctrl+Z
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true }));

            expect(callback).toHaveBeenCalledWith(expect.objectContaining({
                binding: expect.objectContaining({
                    key: 'z',
                    modifiers: ['ctrl']
                })
            }));
        });

        it('should clear modifiers on window blur', () => {
            // Set a modifier key
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
            expect(manager.getActiveModifiers().has('ctrl')).toBe(true);

            // Simulate window blur
            window.dispatchEvent(new Event('blur'));
            expect(manager.getActiveModifiers().size).toBe(0);
        });
    });

    describe('enable/disable', () => {
        it('should not trigger events when disabled', () => {
            const callback = jest.fn();
            manager.on('shortcutTriggered', callback);

            manager.disable();
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));
            expect(callback).not.toHaveBeenCalled();

            manager.enable();
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));
            expect(callback).toHaveBeenCalled();
        });
    });

    describe('binding management', () => {
        it('should allow adding new bindings', () => {
            const newBinding: KeyBinding = {
                key: 'x',
                description: 'Test binding',
                category: 'general'
            };

            manager.setBinding('test', newBinding);
            const bindings = manager.getBindings();
            expect(bindings.test).toEqual(newBinding);
        });

        it('should allow removing bindings', () => {
            manager.removeBinding('delete');
            const bindings = manager.getBindings();
            expect(bindings.delete).toBeUndefined();
        });
    });

    describe('help overlay', () => {
        it('should toggle help overlay visibility', () => {
            expect(manager.isHelpVisible()).toBe(false);

            // Simulate Shift+/ (show help shortcut)
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift' }));
            window.dispatchEvent(new KeyboardEvent('keydown', { key: '/', shiftKey: true }));

            expect(manager.isHelpVisible()).toBe(true);

            // Toggle again
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift' }));
            window.dispatchEvent(new KeyboardEvent('keydown', { key: '/', shiftKey: true }));

            expect(manager.isHelpVisible()).toBe(false);
        });
    });

    describe('cleanup', () => {
        it('should clean up event listeners on destroy', () => {
            const callback = jest.fn();
            manager.on('shortcutTriggered', callback);

            manager.destroy();

            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));
            expect(callback).not.toHaveBeenCalled();
        });

        it('should reset state on destroy', () => {
            // Set some state
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift' }));

            manager.destroy();

            expect(manager.getActiveModifiers().size).toBe(0);
            expect(manager.isEnabled()).toBe(false);
            expect(manager.isHelpVisible()).toBe(false);
        });
    });

    describe('event prevention', () => {
        it('should prevent default for specified shortcuts', () => {
            const event = new KeyboardEvent('keydown', {
                key: 'z',
                ctrlKey: true,
                cancelable: true
            });

            const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
            window.dispatchEvent(event);

            expect(preventDefaultSpy).toHaveBeenCalled();
        });

        it('should respect preventDefault option in bindings', () => {
            const customBinding: KeyBinding = {
                key: 'x',
                description: 'Test binding',
                category: 'general',
                preventDefault: true
            };

            manager.setBinding('test', customBinding);

            const event = new KeyboardEvent('keydown', {
                key: 'x',
                cancelable: true
            });

            const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
            window.dispatchEvent(event);

            expect(preventDefaultSpy).toHaveBeenCalled();
        });
    });
});
