interface TooltipOptions {
    content: string;
    shortcut?: string;
    position?: 'top' | 'right' | 'bottom' | 'left';
    delay?: number;
    offset?: number;
}

interface RequiredTooltipOptions {
    content: string;
    shortcut: string | null;
    position: 'top' | 'right' | 'bottom' | 'left';
    delay: number;
    offset: number;
}

export class Tooltip {
    private element: HTMLElement;
    private target: HTMLElement;
    private options: RequiredTooltipOptions;
    private showTimeout: number | null = null;
    private hideTimeout: number | null = null;
    private isVisible = false;
    private boundHandleScroll: () => void;

    constructor(target: HTMLElement, options: TooltipOptions) {
        this.target = target;
        this.options = {
            content: options.content,
            shortcut: options.shortcut || null,
            position: options.position || 'top',
            delay: options.delay || 200,
            offset: options.offset || 8
        };

        this.element = this.createTooltipElement();
        this.boundHandleScroll = this.handleScroll.bind(this);
        document.body.appendChild(this.element);

        this.attachEventListeners();
    }

    private createTooltipElement(): HTMLElement {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip hidden';
        tooltip.setAttribute('role', 'tooltip');
        tooltip.setAttribute('data-position', this.options.position);

        const content = document.createElement('div');
        content.className = 'tooltip__content';
        content.textContent = this.options.content;

        if (this.options.shortcut) {
            const shortcut = document.createElement('kbd');
            shortcut.className = 'tooltip__shortcut';
            shortcut.textContent = this.options.shortcut;
            content.appendChild(shortcut);
        }

        tooltip.appendChild(content);
        return tooltip;
    }

    private attachEventListeners(): void {
        this.target.addEventListener('mouseenter', () => this.scheduleShow());
        this.target.addEventListener('mouseleave', () => this.scheduleHide());
        this.target.addEventListener('focus', () => this.show());
        this.target.addEventListener('blur', () => this.hide());
        window.addEventListener('scroll', this.boundHandleScroll, true);
        window.addEventListener('resize', this.boundHandleScroll);

        // Handle target removal
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.removedNodes.forEach((node) => {
                    if (node === this.target) {
                        this.destroy();
                    }
                });
            });
        });

        observer.observe(this.target.parentElement!, {
            childList: true,
            subtree: true
        });
    }

    private handleScroll(): void {
        if (this.isVisible) {
            this.positionTooltip();
        }
    }

    private scheduleShow(): void {
        if (this.hideTimeout) {
            window.clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }

        if (!this.isVisible) {
            this.showTimeout = window.setTimeout(() => this.show(), this.options.delay);
        }
    }

    private scheduleHide(): void {
        if (this.showTimeout) {
            window.clearTimeout(this.showTimeout);
            this.showTimeout = null;
        }

        if (this.isVisible) {
            this.hideTimeout = window.setTimeout(() => this.hide(), this.options.delay);
        }
    }

    private show(): void {
        if (this.isVisible) return;

        this.element.classList.remove('hidden');
        this.positionTooltip();
        this.isVisible = true;
    }

    private hide(): void {
        if (!this.isVisible) return;

        this.element.classList.add('hidden');
        this.isVisible = false;
    }

    private positionTooltip(): void {
        const targetRect = this.target.getBoundingClientRect();
        const tooltipRect = this.element.getBoundingClientRect();

        let top: number;
        let left: number;

        switch (this.options.position) {
            case 'top':
                top = targetRect.top - tooltipRect.height - this.options.offset;
                left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
                break;
            case 'right':
                top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
                left = targetRect.right + this.options.offset;
                break;
            case 'bottom':
                top = targetRect.bottom + this.options.offset;
                left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
                left = targetRect.left - tooltipRect.width - this.options.offset;
                break;
        }

        // Adjust for scroll position
        top += window.scrollY;
        left += window.scrollX;

        // Keep tooltip within viewport
        const margin = 8;
        top = Math.max(margin, Math.min(top, window.innerHeight - tooltipRect.height - margin));
        left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin));

        this.element.style.top = `${top}px`;
        this.element.style.left = `${left}px`;
    }

    updateContent(content: string, shortcut?: string | null): void {
        this.options.content = content;
        this.options.shortcut = shortcut || null;

        const contentElement = this.element.querySelector('.tooltip__content');
        if (contentElement) {
            contentElement.textContent = content;

            const shortcutElement = contentElement.querySelector('.tooltip__shortcut');
            if (shortcutElement) {
                shortcutElement.remove();
            }

            if (shortcut) {
                const newShortcut = document.createElement('kbd');
                newShortcut.className = 'tooltip__shortcut';
                newShortcut.textContent = shortcut;
                contentElement.appendChild(newShortcut);
            }
        }

        if (this.isVisible) {
            this.positionTooltip();
        }
    }

    setPosition(position: 'top' | 'right' | 'bottom' | 'left'): void {
        this.options.position = position;
        this.element.setAttribute('data-position', position);
        if (this.isVisible) {
            this.positionTooltip();
        }
    }

    destroy(): void {
        if (this.showTimeout) {
            window.clearTimeout(this.showTimeout);
        }
        if (this.hideTimeout) {
            window.clearTimeout(this.hideTimeout);
        }

        // Remove event listeners
        window.removeEventListener('scroll', this.boundHandleScroll, true);
        window.removeEventListener('resize', this.boundHandleScroll);

        this.element.remove();
    }
}
