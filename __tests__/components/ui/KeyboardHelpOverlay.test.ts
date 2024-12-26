import { KeyboardHelpOverlay } from '../../../src/components/ui/KeyboardHelpOverlay';
import { KeyBinding } from '../../../src/types/keyboard';

describe('KeyboardHelpOverlay', () => {
    let overlay: KeyboardHelpOverlay;
    let container: HTMLElement;
    let testBindings: Record<string, KeyBinding>;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);

        testBindings = {
            'delete': {
                key: 'Delete',
                description: 'Delete selected point or room',
                category: 'editing'
            },
            'undo': {
                key: 'z',
                modifiers: ['ctrl'],
                description: 'Undo last action',
                category: 'editing'
            },
            'toggleGrid': {
                key: 'g',
                description: 'Toggle grid visibility',
                category: 'view'
            }
        };

        overlay = new KeyboardHelpOverlay(container, testBindings);
    });

    afterEach(() => {
        overlay.destroy();
        document.body.removeChild(container);
    });

    describe('initialization', () => {
        it('should create overlay with all sections', () => {
            const overlayElement = container.querySelector('.keyboard-help-overlay');
            expect(overlayElement).toBeTruthy();

            expect(overlayElement?.querySelector('.keyboard-help-overlay__header')).toBeTruthy();
            expect(overlayElement?.querySelector('.keyboard-help-overlay__search')).toBeTruthy();
            expect(overlayElement?.querySelector('.keyboard-help-overlay__categories')).toBeTruthy();
            expect(overlayElement?.querySelector('.keyboard-help-overlay__shortcuts')).toBeTruthy();
        });

        it('should start hidden', () => {
            const overlayElement = container.querySelector('.keyboard-help-overlay');
            expect(overlayElement?.classList.contains('hidden')).toBe(true);
        });

        it('should display all shortcuts initially', () => {
            overlay.show();
            const shortcutItems = container.querySelectorAll('.shortcut-item');
            expect(shortcutItems.length).toBe(Object.keys(testBindings).length);
        });
    });

    describe('visibility control', () => {
        it('should toggle visibility', () => {
            expect(overlay.isVisible()).toBe(false);

            overlay.show();
            expect(overlay.isVisible()).toBe(true);

            overlay.hide();
            expect(overlay.isVisible()).toBe(false);
        });

        it('should focus search input when shown', () => {
            overlay.show();
            const searchInput = container.querySelector('.search-input') as HTMLInputElement;
            expect(document.activeElement).toBe(searchInput);
        });

        it('should clear search when hidden', () => {
            overlay.show();
            const searchInput = container.querySelector('.search-input') as HTMLInputElement;
            searchInput.value = 'test';
            searchInput.dispatchEvent(new Event('input'));

            overlay.hide();
            expect(searchInput.value).toBe('');
        });
    });

    describe('search functionality', () => {
        beforeEach(() => {
            overlay.show();
        });

        it('should filter shortcuts by search query', () => {
            const searchInput = container.querySelector('.search-input') as HTMLInputElement;
            searchInput.value = 'grid';
            searchInput.dispatchEvent(new Event('input'));

            const shortcutItems = container.querySelectorAll('.shortcut-item');
            expect(shortcutItems.length).toBe(1);
            expect(shortcutItems[0].textContent).toContain('Toggle grid visibility');
        });

        it('should show no results message when no matches found', () => {
            const searchInput = container.querySelector('.search-input') as HTMLInputElement;
            searchInput.value = 'nonexistent';
            searchInput.dispatchEvent(new Event('input'));

            const noResults = container.querySelector('.no-results');
            expect(noResults).toBeTruthy();
            expect(noResults?.textContent).toContain('No shortcuts found');
        });

        it('should be case insensitive', () => {
            const searchInput = container.querySelector('.search-input') as HTMLInputElement;
            searchInput.value = 'GRID';
            searchInput.dispatchEvent(new Event('input'));

            const shortcutItems = container.querySelectorAll('.shortcut-item');
            expect(shortcutItems.length).toBe(1);
        });
    });

    describe('category filtering', () => {
        beforeEach(() => {
            overlay.show();
        });

        it('should filter shortcuts by category', () => {
            const editingFilter = container.querySelector('.category-filter:not(:first-child)') as HTMLButtonElement;
            editingFilter.click();

            const shortcutItems = container.querySelectorAll('.shortcut-item');
            expect(shortcutItems.length).toBe(2); // delete and undo
            expect(shortcutItems[0].textContent).toContain('Delete');
            expect(shortcutItems[1].textContent).toContain('Undo');
        });

        it('should show all shortcuts when "All" category selected', () => {
            // First select a specific category
            const editingFilter = container.querySelector('.category-filter:not(:first-child)') as HTMLButtonElement;
            editingFilter.click();

            // Then select "All"
            const allFilter = container.querySelector('.category-filter') as HTMLButtonElement;
            allFilter.click();

            const shortcutItems = container.querySelectorAll('.shortcut-item');
            expect(shortcutItems.length).toBe(Object.keys(testBindings).length);
        });

        it('should update active category button', () => {
            const editingFilter = container.querySelector('.category-filter:not(:first-child)') as HTMLButtonElement;
            editingFilter.click();

            expect(editingFilter.classList.contains('active')).toBe(true);
            expect(container.querySelectorAll('.category-filter.active').length).toBe(1);
        });
    });

    describe('shortcut display', () => {
        beforeEach(() => {
            overlay.show();
        });

        it('should format key combinations correctly', () => {
            const shortcutItems = container.querySelectorAll('.shortcut-item');
            const undoShortcut = Array.from(shortcutItems).find(item => 
                item.textContent?.includes('Undo')
            );

            const keys = undoShortcut?.querySelector('.shortcut-keys');
            expect(keys?.innerHTML).toContain('<kbd>Ctrl</kbd> + <kbd>z</kbd>');
        });

        it('should group shortcuts by category', () => {
            const categoryHeaders = container.querySelectorAll('.category-header');
            expect(categoryHeaders.length).toBeGreaterThan(0);

            const editingHeader = Array.from(categoryHeaders).find(header =>
                header.textContent?.toLowerCase().includes('editing')
            );
            expect(editingHeader?.nextElementSibling?.textContent).toContain('Delete');
        });
    });

    describe('binding updates', () => {
        it('should update displayed shortcuts when bindings change', () => {
            overlay.show();
            const newBindings: Record<string, KeyBinding> = {
                'newAction': {
                    key: 'x',
                    description: 'New action',
                    category: 'general'
                }
            };

            overlay.updateBindings(newBindings);

            const shortcutItems = container.querySelectorAll('.shortcut-item');
            expect(shortcutItems.length).toBe(1);
            expect(shortcutItems[0].textContent).toContain('New action');
        });
    });

    describe('cleanup', () => {
        it('should remove overlay from DOM on destroy', () => {
            const overlayElement = container.querySelector('.keyboard-help-overlay');
            expect(overlayElement).toBeTruthy();

            overlay.destroy();
            expect(container.querySelector('.keyboard-help-overlay')).toBeNull();
        });
    });
});
