import { test, expect, Page } from '@playwright/test';
import { themes as allThemes } from '../config/visualTestConfig';

// Get theme from environment or use default
const themes = process.env.THEME ? [process.env.THEME] : ['default'];

interface Component {
    name: string;
    selector: string;
}

const components: Component[] = [
    { name: 'toolbar', selector: '.toolbar' },
    { name: 'canvas', selector: '.canvas' },
    { name: 'room-panel', selector: '.room-panel' },
    { name: 'door-panel', selector: '.door-panel' },
    { name: 'calculations-panel', selector: '.calculations-panel' }
];

test.describe('Theme Visual Tests', () => {
    for (const theme of themes) {
        test.describe(`${theme} theme`, () => {
            test.beforeEach(async ({ page }: { page: Page }) => {
                await page.goto('/');
                // Set theme
                await page.evaluate((themeName: string) => {
                    localStorage.setItem('theme', themeName);
                }, theme);
                await page.reload();
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(1000); // Allow theme to apply
            });

            test('empty state should render correctly', async ({ page }: { page: Page }) => {
                await page.waitForLoadState('domcontentloaded');
                await page.waitForTimeout(1000);
                await expect(page).toHaveScreenshot(`${theme}-empty-state.png`, {
                    fullPage: true
                });
            });

            // Test each component
            for (const component of components) {
                test(`${component.name} should render correctly`, async ({ page }: { page: Page }) => {
                    await page.waitForSelector(component.selector, { state: 'visible', timeout: 10000 });
                    await page.waitForTimeout(500);
                    await expect(page.locator(component.selector)).toHaveScreenshot(`${theme}-${component.name}.png`);
                });
            }

            // Test interactions
            test('room drawing interaction', async ({ page }: { page: Page }) => {
                await page.waitForSelector('button:has-text("Draw Room")', { timeout: 10000 });
                await page.click('button:has-text("Draw Room")');
                await page.waitForTimeout(500);
                
                await page.mouse.click(200, 200);
                await page.waitForTimeout(500);
                await expect(page.locator('.canvas')).toHaveScreenshot(`${theme}-room-drawing-first-point.png`);
                
                await page.mouse.click(400, 400);
                await page.waitForTimeout(500);
                await expect(page.locator('.canvas')).toHaveScreenshot(`${theme}-room-drawing-complete.png`);
            });

            test('door placement interaction', async ({ page }: { page: Page }) => {
                await page.waitForSelector('button:has-text("Draw Room")', { timeout: 10000 });
                await page.click('button:has-text("Draw Room")');
                await page.waitForTimeout(500);
                await page.mouse.click(200, 200);
                await page.waitForTimeout(500);
                await page.mouse.click(400, 400);
                await page.waitForTimeout(500);
                
                await page.click('button:has-text("Add Door")');
                await page.waitForTimeout(500);
                await page.mouse.click(300, 200);
                await page.waitForTimeout(500);
                await expect(page.locator('.canvas')).toHaveScreenshot(`${theme}-door-placement.png`);
            });

            test('room selection interaction', async ({ page }: { page: Page }) => {
                await page.waitForSelector('button:has-text("Draw Room")', { timeout: 10000 });
                await page.click('button:has-text("Draw Room")');
                await page.waitForTimeout(500);
                await page.mouse.click(200, 200);
                await page.waitForTimeout(500);
                await page.mouse.click(400, 400);
                await page.waitForTimeout(500);
                
                await page.click('button:has-text("Select")');
                await page.waitForTimeout(500);
                await page.mouse.click(300, 300);
                await page.waitForTimeout(500);
                await expect(page.locator('.canvas')).toHaveScreenshot(`${theme}-room-selection.png`);
            });

            // Test button states
            test('button hover states', async ({ page }: { page: Page }) => {
                await page.waitForSelector('button:has-text("Draw Room")', { timeout: 10000 });
                await page.hover('button:has-text("Draw Room")');
                await page.waitForTimeout(500);
                await expect(page.locator('.toolbar')).toHaveScreenshot(`${theme}-button-hover.png`);
            });

            test('button focus states', async ({ page }: { page: Page }) => {
                await page.waitForSelector('button:has-text("Draw Room")', { timeout: 10000 });
                await page.keyboard.press('Tab');
                await page.waitForTimeout(500);
                await expect(page.locator('.toolbar')).toHaveScreenshot(`${theme}-button-focus.png`);
            });

            test('button active states', async ({ page }: { page: Page }) => {
                await page.waitForSelector('button:has-text("Draw Room")', { timeout: 10000 });
                await page.click('button:has-text("Draw Room")', { noWaitAfter: true });
                await page.waitForTimeout(500);
                await expect(page.locator('.toolbar')).toHaveScreenshot(`${theme}-button-active.png`);
            });
        });
    }
});
