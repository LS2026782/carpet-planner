import { Page, expect } from '@playwright/test';

/**
 * Helper functions for visual testing
 */
export class VisualHelpers {
    constructor(private page: Page) {}

    /**
     * Draw a room on the canvas
     */
    async drawRoom(startX: number, startY: number, endX: number, endY: number) {
        await this.page.click('button:has-text("Draw Room")');
        await this.page.mouse.click(startX, startY);
        await this.page.mouse.click(endX, endY);
    }

    /**
     * Add a door to a room
     */
    async addDoor(x: number, y: number) {
        await this.page.click('button:has-text("Add Door")');
        await this.page.mouse.click(x, y);
    }

    /**
     * Select an element on the canvas
     */
    async selectElement(x: number, y: number) {
        await this.page.click('button:has-text("Select")');
        await this.page.mouse.click(x, y);
    }

    /**
     * Take a screenshot of a specific component
     */
    async screenshotComponent(selector: string, name: string, config = {}) {
        await expect(this.page.locator(selector)).toHaveScreenshot(name, config);
    }

    /**
     * Take a full page screenshot
     */
    async screenshotFullPage(name: string) {
        await expect(this.page).toHaveScreenshot(name, { fullPage: true });
    }

    /**
     * Set the theme
     */
    async setTheme(theme: string) {
        await this.page.evaluate((themeName) => {
            localStorage.setItem('theme', themeName);
        }, theme);
        await this.page.reload();
    }

    /**
     * Set the viewport size
     */
    async setViewport(width: number, height: number) {
        await this.page.setViewportSize({ width, height });
    }

    /**
     * Create a complex room layout for testing
     */
    async createComplexLayout() {
        // Draw main room
        await this.drawRoom(200, 200, 600, 400);

        // Add doors
        await this.addDoor(300, 200); // North wall
        await this.addDoor(600, 300); // East wall
        await this.addDoor(300, 400); // South wall

        // Draw additional rooms
        await this.drawRoom(600, 200, 800, 400); // Connected room
        await this.drawRoom(200, 400, 400, 600); // Room below
    }

    /**
     * Test hover states for a component
     */
    async testHoverStates(selector: string, screenshotName: string) {
        await this.page.hover(selector);
        await this.screenshotComponent(selector, `hover-${screenshotName}`);
    }

    /**
     * Test focus states for a component
     */
    async testFocusStates(selector: string, screenshotName: string) {
        await this.page.focus(selector);
        await this.screenshotComponent(selector, `focus-${screenshotName}`);
    }

    /**
     * Test active states for a component
     */
    async testActiveStates(selector: string, screenshotName: string) {
        const element = this.page.locator(selector);
        await element.evaluate(el => {
            el.classList.add('active');
        });
        await this.screenshotComponent(selector, `active-${screenshotName}`);
    }

    /**
     * Test scroll behavior
     */
    async testScrollBehavior(screenshotPrefix: string) {
        // Initial position
        await this.screenshotFullPage(`${screenshotPrefix}-scroll-top.png`);

        // Middle position
        await this.page.evaluate(() => window.scrollTo(0, window.innerHeight));
        await this.screenshotFullPage(`${screenshotPrefix}-scroll-middle.png`);

        // Bottom position
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await this.screenshotFullPage(`${screenshotPrefix}-scroll-bottom.png`);
    }

    /**
     * Test responsive behavior
     */
    async testResponsiveBehavior(selector: string, screenshotPrefix: string) {
        const viewports = [
            { width: 1920, height: 1080, name: 'desktop' },
            { width: 1366, height: 768, name: 'laptop' },
            { width: 768, height: 1024, name: 'tablet' },
            { width: 375, height: 812, name: 'mobile' }
        ];

        for (const viewport of viewports) {
            await this.setViewport(viewport.width, viewport.height);
            await this.screenshotComponent(
                selector,
                `${screenshotPrefix}-${viewport.name}.png`
            );
        }
    }

    /**
     * Test theme transitions
     */
    async testThemeTransition(fromTheme: string, toTheme: string, screenshotPrefix: string) {
        await this.setTheme(fromTheme);
        await this.createComplexLayout();

        // Switch theme
        await this.setTheme(toTheme);

        // Capture transition frames
        for (let i = 0; i < 5; i++) {
            await this.page.waitForTimeout(100);
            await this.screenshotFullPage(
                `${screenshotPrefix}-${fromTheme}-to-${toTheme}-${i}.png`
            );
        }
    }

    /**
     * Test touch interactions
     */
    async testTouchInteractions(screenshotPrefix: string) {
        // Single tap
        await this.page.mouse.click(200, 200);
        await this.screenshotFullPage(`${screenshotPrefix}-tap.png`);

        // Double tap
        await this.page.mouse.dblclick(200, 200);
        await this.screenshotFullPage(`${screenshotPrefix}-double-tap.png`);

        // Tap and hold
        await this.page.mouse.down();
        await this.page.waitForTimeout(1000);
        await this.page.mouse.up();
        await this.screenshotFullPage(`${screenshotPrefix}-tap-hold.png`);
    }
}
