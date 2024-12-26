import { RoomEditorToolbar } from '../../../src/components/room/RoomEditorToolbar';
import { KeyBinding } from '../../../src/types/keyboard';

describe('RoomEditorToolbar', () => {
    let toolbar: RoomEditorToolbar;
    let container: HTMLElement;
    let mockKeyBindings: Record<string, KeyBinding>;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);

        mockKeyBindings = {
            toggleEdit: {
                key: 'e',
                description: 'Toggle edit mode',
                category: 'editing'
            },
            toggleGrid: {
                key: 'g',
                description: 'Toggle grid',
                category: 'view'
            }
        };

        toolbar = new RoomEditorToolbar(container, { keyBindings: mockKeyBindings });
    });

    afterEach(() => {
        toolbar.destroy();
        document.body.removeChild(container);
    });

    describe('initialization', () => {
        it('should create toolbar with all buttons', () => {
            const buttons = container.querySelectorAll('button');
            expect(buttons.length).toBeGreaterThan(0);
            expect(container.querySelector('.room-editor-toolbar')).toBeTruthy();
        });

        it('should initialize with default options', () => {
            const editButton = container.querySelector('.room-editor-toolbar__button.edit');
            expect(editButton?.classList.contains('active')).toBe(false);
        });

        it('should create tooltips with keyboard shortcuts', () => {
            const editButton = container.querySelector('.room-editor-toolbar__button.edit');
            editButton?.dispatchEvent(new MouseEvent('mouseenter'));
            jest.advanceTimersByTime(500);

            const tooltip = document.querySelector('.tooltip');
            expect(tooltip).toBeTruthy();
            expect(tooltip?.textContent).toContain('Toggle edit mode');
            expect(tooltip?.textContent).toContain('e');
        });
    });

    describe('event handling', () => {
        it('should emit toggleEdit event when edit button is clicked', () => {
            const callback = jest.fn();
            toolbar.on('toggleEdit', callback);

            const editButton = container.querySelector('.room-editor-toolbar__button.edit') as HTMLButtonElement;
            editButton?.click();

            expect(callback).toHaveBeenCalledWith(true);
        });

        it('should emit modeChange event when edit mode changes', () => {
            const callback = jest.fn();
            toolbar.on('modeChange', callback);

            const editButton = container.querySelector('.room-editor-toolbar__button.edit') as HTMLButtonElement;
            editButton?.click();

            expect(callback).toHaveBeenCalledWith('edit');
            editButton?.click();
            expect(callback).toHaveBeenCalledWith('view');
        });

        it('should emit toggleGrid event when grid button is clicked', () => {
            const callback = jest.fn();
            toolbar.on('toggleGrid', callback);

            const gridButton = container.querySelector('.room-editor-toolbar__button.grid') as HTMLButtonElement;
            gridButton?.click();

            expect(callback).toHaveBeenCalledWith(true);
        });

        it('should emit toggleSnap event when snap button is clicked', () => {
            const callback = jest.fn();
            toolbar.on('toggleSnap', callback);

            const snapButton = container.querySelector('.room-editor-toolbar__button.snap') as HTMLButtonElement;
            snapButton?.click();

            expect(callback).toHaveBeenCalledWith(true);
        });

        it('should emit point manipulation events', () => {
            const addCallback = jest.fn();
            const removeCallback = jest.fn();
            toolbar.on('addPoint', addCallback);
            toolbar.on('removePoint', removeCallback);

            const addButton = container.querySelector('.room-editor-toolbar__button.add-point') as HTMLButtonElement;
            const removeButton = container.querySelector('.room-editor-toolbar__button.remove-point') as HTMLButtonElement;

            addButton?.click();
            removeButton?.click();

            expect(addCallback).toHaveBeenCalled();
            expect(removeCallback).toHaveBeenCalled();
        });
    });

    describe('state management', () => {
        it('should update button states based on edit mode', () => {
            toolbar.setOptions({ isEditing: true });

            const editButton = container.querySelector('.room-editor-toolbar__button.edit');
            const snapButton = container.querySelector('.room-editor-toolbar__button.snap');
            const deleteButton = container.querySelector('.room-editor-toolbar__button.delete');

            expect(editButton?.classList.contains('active')).toBe(true);
            expect(snapButton?.classList.contains('hidden')).toBe(false);
            expect(deleteButton?.classList.contains('hidden')).toBe(false);
        });

        it('should update point manipulation buttons based on enabled state', () => {
            toolbar.setOptions({ isEditing: true });
            toolbar.setPointManipulationEnabled(true);

            const addButton = container.querySelector('.room-editor-toolbar__button.add-point') as HTMLButtonElement;
            const removeButton = container.querySelector('.room-editor-toolbar__button.remove-point') as HTMLButtonElement;

            expect(addButton?.disabled).toBe(false);
            expect(removeButton?.disabled).toBe(false);
        });

        it('should hide point manipulation buttons when not in edit mode', () => {
            toolbar.setOptions({ isEditing: false });

            const addButton = container.querySelector('.room-editor-toolbar__button.add-point');
            const removeButton = container.querySelector('.room-editor-toolbar__button.remove-point');

            expect(addButton?.classList.contains('hidden')).toBe(true);
            expect(removeButton?.classList.contains('hidden')).toBe(true);
        });
    });

    describe('undo/redo state', () => {
        it('should update undo/redo button states', () => {
            toolbar.setUndoEnabled(true);
            toolbar.setRedoEnabled(false);

            const undoButton = container.querySelector('.room-editor-toolbar__button.undo') as HTMLButtonElement;
            const redoButton = container.querySelector('.room-editor-toolbar__button.redo') as HTMLButtonElement;

            expect(undoButton?.disabled).toBe(false);
            expect(redoButton?.disabled).toBe(true);
        });

        it('should update states through setOptions', () => {
            toolbar.setOptions({ canUndo: true, canRedo: false });

            const undoButton = container.querySelector('.room-editor-toolbar__button.undo') as HTMLButtonElement;
            const redoButton = container.querySelector('.room-editor-toolbar__button.redo') as HTMLButtonElement;

            expect(undoButton?.disabled).toBe(false);
            expect(redoButton?.disabled).toBe(true);
        });
    });

    describe('cleanup', () => {
        it('should remove all event listeners on destroy', () => {
            const callback = jest.fn();
            toolbar.on('toggleEdit', callback);

            toolbar.destroy();

            const editButton = container.querySelector('.room-editor-toolbar__button.edit') as HTMLButtonElement;
            editButton?.click();

            expect(callback).not.toHaveBeenCalled();
        });

        it('should remove tooltips on destroy', () => {
            const editButton = container.querySelector('.room-editor-toolbar__button.edit');
            editButton?.dispatchEvent(new MouseEvent('mouseenter'));
            jest.advanceTimersByTime(500);

            expect(document.querySelector('.tooltip')).toBeTruthy();

            toolbar.destroy();

            expect(document.querySelector('.tooltip')).toBeNull();
        });

        it('should clear container on destroy', () => {
            toolbar.destroy();
            expect(container.children.length).toBe(0);
        });
    });
});
