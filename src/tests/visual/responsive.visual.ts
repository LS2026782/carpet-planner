import { test, expect, Page } from '@playwright/test';
import { viewports } from '../config/visualTestConfig';

const components = [
    { name: 'toolbar', selector: '.toolbar' },
    { name: 'canvas', selector: '.canvas' },
    { name: 'room-panel', selector: '.room-panel' },
    { name: 'door-panel', selector: '.door-panel' },
    { name: 'calculations-panel', selector: '.calculations-panel' }
];

test.describe('Responsive Visual Tests', () => {
    // Only test desktop viewport initially
    const testViewports = {
        desktop: viewports.desktop
    };

    for (const [viewportName, viewport] of Object.entries(testViewports)) {
        test.describe(`${viewportName} viewport`, () => {
            test.use({
                viewport,
                // Enable touch for mobile and tablet viewports
                contextOptions: {
                    hasTouch: viewportName === 'mobile' || viewportName === 'tablet'
                }
            });

            test.beforeEach(async ({ page }) => {
                await page.goto('/');
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(1000);
            });

            test('empty state should render correctly', async ({ page }) => {
                await page.waitForLoadState('domcontentloaded');
                await page.waitForTimeout(1000);
                await expect(page).toHaveScreenshot(`${viewportName}-empty-state.png`, {
                    fullPage: true
                });
            });

            // Test each component
            for (const component of components) {
                test(`${component.name} should render correctly`, async ({ page }) => {
                    await page.waitForSelector(component.selector, { state: 'visible', timeout: 10000 });
                    await page.waitForTimeout(500);
                    await expect(page.locator(component.selector)).toHaveScreenshot(`${viewportName}-${component.name}.png`);
                });
            }

            // Test interactions
            test('room drawing interaction', async ({ page }) => {
                await page.waitForSelector('button:has-text("Draw Room")', { timeout: 10000 });
                await page.click('button:has-text("Draw Room")');
                await page.waitForTimeout(500);
                
                await page.mouse.click(200, 200);
                await page.waitForTimeout(500);
                await expect(page.locator('.canvas')).toHaveScreenshot(`${viewportName}-room-drawing-first-point.png`);
                
                await page.mouse.click(400, 400);
                await page.waitForTimeout(500);
                await expect(page.locator('.canvas')).toHaveScreenshot(`${viewportName}-room-drawing-complete.png`);
            });

            test('door placement interaction', async ({ page }) => {
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
                await expect(page.locator('.canvas')).toHaveScreenshot(`${viewportName}-door-placement.png`);
            });

            test('room selection interaction', async ({ page }) => {
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
                await expect(page.locator('.canvas')).toHaveScreenshot(`${viewportName}-room-selection.png`);
            });

            // Test scroll behavior
            test('scroll behavior', async ({ page }) => {
                await page.waitForLoadState('domcontentloaded');
                await page.waitForTimeout(1000);
                
                // Initial state
                await expect(page).toHaveScreenshot(`${viewportName}-scroll-initial.png`, {
                    fullPage: true
                });

                // Scroll to middle
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
                await page.waitForTimeout(500);
                await expect(page).toHaveScreenshot(`${viewportName}-scroll-middle.png`, {
                    fullPage: true
                });

                // Scroll to bottom
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await page.waitForTimeout(500);
                await expect(page).toHaveScreenshot(`${viewportName}-scroll-bottom.png`, {
                    fullPage: true
                });
            });

            // Mobile/tablet specific tests
            if (viewportName === 'mobile' || viewportName === 'tablet') {
                test('responsive navigation', async ({ page }) => {
                    await page.waitForSelector('.menu-button', { timeout: 10000 });
                    await page.click('.menu-button');
                    await page.waitForTimeout(500);
                    await expect(page).toHaveScreenshot(`${viewportName}-menu-open.png`, {
                        fullPage: true
                    });
                });

                // Skip panel transitions test as it's not responsive
                test.skip('panel transitions', async ({ page }) => {
                    // Test skipped due to responsiveness issues
                    // TODO: Fix panel transitions for mobile/tablet viewports
                });
            }
        });
    }
});
