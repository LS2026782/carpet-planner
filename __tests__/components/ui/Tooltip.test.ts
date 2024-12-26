import { Tooltip } from '../../../src/components/ui/Tooltip';

describe('Tooltip', () => {
    let tooltip: Tooltip;
    let target: HTMLElement;

    beforeEach(() => {
        target = document.createElement('button');
        target.textContent = 'Test Button';
        document.body.appendChild(target);
    });

    afterEach(() => {
        if (tooltip) {
            tooltip.destroy();
        }
        document.body.removeChild(target);
    });

    describe('initialization', () => {
        it('should create tooltip with default options', () => {
            tooltip = new Tooltip(target, { content: 'Test tooltip' });
            const tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement).toBeTruthy();
            expect(tooltipElement?.classList.contains('hidden')).toBe(true);
        });

        it('should create tooltip with shortcut', () => {
            tooltip = new Tooltip(target, {
                content: 'Test tooltip',
                shortcut: 'Ctrl+S'
            });
            const shortcutElement = document.querySelector('.tooltip__shortcut');
            expect(shortcutElement).toBeTruthy();
            expect(shortcutElement?.textContent).toBe('Ctrl+S');
        });

        it('should set correct ARIA attributes', () => {
            tooltip = new Tooltip(target, { content: 'Test tooltip' });
            const tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement?.getAttribute('role')).toBe('tooltip');
        });
    });

    describe('visibility', () => {
        beforeEach(() => {
            tooltip = new Tooltip(target, { content: 'Test tooltip' });
        });

        it('should show on mouseenter', () => {
            target.dispatchEvent(new MouseEvent('mouseenter'));
            jest.advanceTimersByTime(200); // Default delay
            const tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement?.classList.contains('hidden')).toBe(false);
        });

        it('should hide on mouseleave', () => {
            // Show first
            target.dispatchEvent(new MouseEvent('mouseenter'));
            jest.advanceTimersByTime(200);

            // Then hide
            target.dispatchEvent(new MouseEvent('mouseleave'));
            jest.advanceTimersByTime(200);

            const tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement?.classList.contains('hidden')).toBe(true);
        });

        it('should show on focus', () => {
            target.dispatchEvent(new FocusEvent('focus'));
            const tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement?.classList.contains('hidden')).toBe(false);
        });

        it('should hide on blur', () => {
            // Show first
            target.dispatchEvent(new FocusEvent('focus'));

            // Then hide
            target.dispatchEvent(new FocusEvent('blur'));

            const tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement?.classList.contains('hidden')).toBe(true);
        });

        it('should respect custom delay', () => {
            const customDelay = 500;
            tooltip = new Tooltip(target, {
                content: 'Test tooltip',
                delay: customDelay
            });

            target.dispatchEvent(new MouseEvent('mouseenter'));
            jest.advanceTimersByTime(customDelay - 100);

            const tooltipElement = document.querySelector('.tooltip');
            expect(tooltipElement?.classList.contains('hidden')).toBe(true);

            jest.advanceTimersByTime(100);
            expect(tooltipElement?.classList.contains('hidden')).toBe(false);
        });
    });

    describe('positioning', () => {
        beforeEach(() => {
            // Mock getBoundingClientRect for target and tooltip
            target.getBoundingClientRect = () => ({
                top: 100,
                right: 200,
                bottom: 150,
                left: 100,
                width: 100,
                height: 50,
                x: 100,
                y: 100,
                toJSON: () => {}
            });
        });

        it('should position tooltip correctly for each position', () => {
            const positions: ('top' | 'right' | 'bottom' | 'left')[] = ['top', 'right', 'bottom', 'left'];

            positions.forEach(position => {
                tooltip = new Tooltip(target, {
                    content: 'Test tooltip',
                    position
                });

                target.dispatchEvent(new MouseEvent('mouseenter'));
                jest.advanceTimersByTime(200);

                const tooltipElement = document.querySelector('.tooltip');
                expect(tooltipElement?.getAttribute('data-position')).toBe(position);
            });
        });

        it('should update position when window is scrolled', () => {
            tooltip = new Tooltip(target, { content: 'Test tooltip' });
            target.dispatchEvent(new MouseEvent('mouseenter'));
            jest.advanceTimersByTime(200);

            // Simulate scroll
            Object.defineProperty(window, 'scrollY', { value: 100 });
            Object.defineProperty(window, 'scrollX', { value: 50 });

            window.dispatchEvent(new Event('scroll'));

            const tooltipElement = document.querySelector('.tooltip') as HTMLElement;
            const top = parseInt(tooltipElement?.style.top || '0', 10);
            const left = parseInt(tooltipElement?.style.left || '0', 10);

            expect(top).toBeGreaterThan(0);
            expect(left).toBeGreaterThan(0);
        });
    });

    describe('content updates', () => {
        beforeEach(() => {
            tooltip = new Tooltip(target, {
                content: 'Initial content',
                shortcut: 'Ctrl+S'
            });
        });

        it('should update content text', () => {
            tooltip.updateContent('New content');
            const contentElement = document.querySelector('.tooltip__content');
            expect(contentElement?.textContent).toContain('New content');
        });

        it('should update shortcut', () => {
            tooltip.updateContent('Content', 'Ctrl+N');
            const shortcutElement = document.querySelector('.tooltip__shortcut');
            expect(shortcutElement?.textContent).toBe('Ctrl+N');
        });

        it('should remove shortcut when not provided', () => {
            tooltip.updateContent('Content', null);
            const shortcutElement = document.querySelector('.tooltip__shortcut');
            expect(shortcutElement).toBeNull();
        });
    });

    describe('cleanup', () => {
        it('should remove tooltip element on destroy', () => {
            tooltip = new Tooltip(target, { content: 'Test tooltip' });
            tooltip.destroy();
            expect(document.querySelector('.tooltip')).toBeNull();
        });

        it('should clean up event listeners on destroy', () => {
            tooltip = new Tooltip(target, { content: 'Test tooltip' });
            tooltip.destroy();

            target.dispatchEvent(new MouseEvent('mouseenter'));
            jest.advanceTimersByTime(200);

            expect(document.querySelector('.tooltip')).toBeNull();
        });

        it('should handle target removal', () => {
            tooltip = new Tooltip(target, { content: 'Test tooltip' });
            target.remove();

            // Wait for MutationObserver
            jest.advanceTimersByTime(0);

            expect(document.querySelector('.tooltip')).toBeNull();
        });
    });
});
