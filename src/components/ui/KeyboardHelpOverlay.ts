import { KeyBinding, KeyBindingCategory, categoryDescriptions } from '../../types/keyboard';

export class KeyboardHelpOverlay {
    private container: HTMLElement;
    private overlay: HTMLElement;
    private searchInput: HTMLInputElement;
    private categoryFilters: HTMLElement;
    private shortcutList: HTMLElement;
    private bindings: Record<string, KeyBinding>;
    private selectedCategory: KeyBindingCategory | 'all' = 'all';
    private searchQuery = '';

    constructor(container: HTMLElement, bindings: Record<string, KeyBinding>) {
        this.container = container;
        this.bindings = bindings;
        this.overlay = this.createOverlay();
        this.searchInput = this.createSearchInput();
        this.categoryFilters = this.createCategoryFilters();
        this.shortcutList = this.createShortcutList();

        this.overlay.appendChild(this.searchInput);
        this.overlay.appendChild(this.categoryFilters);
        this.overlay.appendChild(this.shortcutList);
        this.container.appendChild(this.overlay);

        this.hide();
    }

    private createOverlay(): HTMLElement {
        const overlay = document.createElement('div');
        overlay.className = 'keyboard-help-overlay';

        const header = document.createElement('div');
        header.className = 'keyboard-help-overlay__header';
        header.innerHTML = `
            <h2>Keyboard Shortcuts</h2>
            <button class="close-button" aria-label="Close help overlay">×</button>
        `;

        const closeButton = header.querySelector('.close-button') as HTMLButtonElement;
        closeButton.onclick = () => this.hide();

        overlay.appendChild(header);

        // Handle click outside to close
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                this.hide();
            }
        });

        return overlay;
    }

    private createSearchInput(): HTMLInputElement {
        const container = document.createElement('div');
        container.className = 'keyboard-help-overlay__search';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Search shortcuts...';
        input.className = 'search-input';

        input.addEventListener('input', () => {
            this.searchQuery = input.value.toLowerCase();
            this.updateShortcutList();
        });

        container.appendChild(input);
        return input;
    }

    private createCategoryFilters(): HTMLElement {
        const container = document.createElement('div');
        container.className = 'keyboard-help-overlay__categories';

        const categories: (KeyBindingCategory | 'all')[] = ['all', 'general', 'editing', 'view', 'tools', 'navigation'];

        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = `category-filter ${category === this.selectedCategory ? 'active' : ''}`;
            button.textContent = category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1);
            button.onclick = () => {
                this.selectedCategory = category;
                this.updateCategoryFilters();
                this.updateShortcutList();
            };
            container.appendChild(button);
        });

        return container;
    }

    private createShortcutList(): HTMLElement {
        const container = document.createElement('div');
        container.className = 'keyboard-help-overlay__shortcuts';
        this.updateShortcutList(container);
        return container;
    }

    private updateCategoryFilters(): void {
        const buttons = this.categoryFilters.querySelectorAll('.category-filter');
        buttons.forEach(button => {
            button.classList.toggle('active', button.textContent?.toLowerCase() === this.selectedCategory);
        });
    }

    private updateShortcutList(container: HTMLElement = this.shortcutList): void {
        container.innerHTML = '';

        const filteredBindings = Object.entries(this.bindings)
            .filter(([id, binding]) => {
                const matchesCategory = this.selectedCategory === 'all' || binding.category === this.selectedCategory;
                const matchesSearch = this.searchQuery === '' ||
                    binding.description.toLowerCase().includes(this.searchQuery) ||
                    id.toLowerCase().includes(this.searchQuery);
                return matchesCategory && matchesSearch;
            })
            .sort((a, b) => a[1].category.localeCompare(b[1].category));

        let currentCategory: KeyBindingCategory | null = null;

        filteredBindings.forEach(([id, binding]) => {
            if (binding.category !== currentCategory) {
                currentCategory = binding.category;
                const categoryHeader = document.createElement('div');
                categoryHeader.className = 'category-header';
                categoryHeader.innerHTML = `
                    <h3>${binding.category.charAt(0).toUpperCase() + binding.category.slice(1)}</h3>
                    <p>${categoryDescriptions[binding.category]}</p>
                `;
                container.appendChild(categoryHeader);
            }

            const shortcut = document.createElement('div');
            shortcut.className = 'shortcut-item';
            shortcut.innerHTML = `
                <div class="shortcut-keys">
                    ${this.formatKeyBinding(binding)}
                </div>
                <div class="shortcut-description">
                    ${binding.description}
                </div>
            `;
            container.appendChild(shortcut);
        });

        if (filteredBindings.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = 'No shortcuts found';
            container.appendChild(noResults);
        }
    }

    private formatKeyBinding(binding: KeyBinding): string {
        const keys: string[] = [];
        if (binding.modifiers) {
            keys.push(...binding.modifiers.map(mod => {
                switch (mod) {
                    case 'ctrl': return 'Ctrl';
                    case 'shift': return 'Shift';
                    case 'alt': return 'Alt';
                    case 'meta': return 'Cmd';
                    default: return mod;
                }
            }));
        }
        keys.push(binding.key);
        return keys.map(key => `<kbd>${key}</kbd>`).join(' + ');
    }

    show(): void {
        this.overlay.classList.remove('hidden');
        this.searchInput.focus();
    }

    hide(): void {
        this.overlay.classList.add('hidden');
        this.searchInput.value = '';
        this.searchQuery = '';
        this.selectedCategory = 'all';
        this.updateCategoryFilters();
        this.updateShortcutList();
    }

    isVisible(): boolean {
        return !this.overlay.classList.contains('hidden');
    }

    updateBindings(bindings: Record<string, KeyBinding>): void {
        this.bindings = bindings;
        this.updateShortcutList();
    }

    destroy(): void {
        this.container.removeChild(this.overlay);
    }
}
