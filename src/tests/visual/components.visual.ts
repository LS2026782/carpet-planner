import { test, expect } from '@playwright/test';

test.describe('Component Visual Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        
        // Wait for critical elements and app initialization
        await Promise.all([
            page.waitForLoadState('networkidle'),
            page.waitForLoadState('domcontentloaded'),
            page.waitForSelector('.toolbar', { state: 'visible' }),
            page.waitForSelector('.canvas', { state: 'visible' })
        ]);

        // Ensure app is fully initialized
        await page.evaluate(() => {
            return new Promise((resolve) => {
                // Check if app is already initialized
                if (document.querySelector('.toolbar') && document.querySelector('.canvas')) {
                    resolve(true);
                    return;
                }
                
                // Wait for initialization
                const observer = new MutationObserver((mutations, obs) => {
                    if (document.querySelector('.toolbar') && document.querySelector('.canvas')) {
                        obs.disconnect();
                        resolve(true);
                    }
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });

                // Timeout after 10 seconds
                setTimeout(() => {
                    observer.disconnect();
                    resolve(false);
                }, 10000);
            });
        });

        // Allow time for any initial animations/transitions
        await page.waitForTimeout(1500);
    });

    test('toolbar should render correctly', async ({ page }) => {
        await page.waitForSelector('.toolbar', { state: 'visible', timeout: 10000 });
        await expect(page.locator('.toolbar')).toHaveScreenshot('toolbar.png');
    });

    test('empty canvas should render correctly', async ({ page }) => {
        await page.waitForSelector('.canvas', { state: 'visible', timeout: 10000 });
        await expect(page.locator('.canvas')).toHaveScreenshot('empty-canvas.png');
    });

    test('room drawing interaction', async ({ page }) => {
        await page.waitForSelector('button:has-text("Draw Room")', { timeout: 10000 });
        await page.click('button:has-text("Draw Room")');
        await page.waitForTimeout(500); // Wait for any UI updates
        
        await page.mouse.click(200, 200);
        await page.waitForTimeout(500);
        await expect(page.locator('.canvas')).toHaveScreenshot('room-drawing-first-point.png');
        
        await page.mouse.click(400, 400);
        await page.waitForTimeout(500);
        await expect(page.locator('.canvas')).toHaveScreenshot('room-drawing-complete.png');
    });

    test('door placement interaction', async ({ page }) => {
        // Draw a room first
        await page.waitForSelector('button:has-text("Draw Room")', { timeout: 10000 });
        await page.click('button:has-text("Draw Room")');
        await page.waitForTimeout(500);
        await page.mouse.click(200, 200);
        await page.waitForTimeout(500);
        await page.mouse.click(400, 400);
        await page.waitForTimeout(500);
        
        // Add door
        await page.click('button:has-text("Add Door")');
        await page.waitForTimeout(500);
        await page.mouse.click(300, 200);
        await page.waitForTimeout(500);
        await expect(page.locator('.canvas')).toHaveScreenshot('door-placement.png');
    });

    test('room selection interaction', async ({ page }) => {
        // Draw a room
        await page.waitForSelector('button:has-text("Draw Room")', { timeout: 10000 });
        await page.click('button:has-text("Draw Room")');
        await page.waitForTimeout(500);
        await page.mouse.click(200, 200);
        await page.waitForTimeout(500);
        await page.mouse.click(400, 400);
        await page.waitForTimeout(500);
        
        // Select room
        await page.click('button:has-text("Select")');
        await page.waitForTimeout(500);
        await page.mouse.click(300, 300);
        await page.waitForTimeout(500);
        await expect(page.locator('.canvas')).toHaveScreenshot('room-selection.png');
    });

    test('measurements should display correctly', async ({ page }) => {
        // Draw a room
        await page.waitForSelector('button:has-text("Draw Room")', { timeout: 10000 });
        await page.click('button:has-text("Draw Room")');
        await page.waitForTimeout(500);
        await page.mouse.click(200, 200);
        await page.waitForTimeout(500);
        await page.mouse.click(400, 400);
        await page.waitForTimeout(500);
        
        await page.waitForSelector('.measurements', { state: 'visible', timeout: 10000 });
        await expect(page.locator('.measurements')).toHaveScreenshot('measurements.png');
    });

    test('grid should render correctly', async ({ page }) => {
        await page.waitForSelector('.grid', { state: 'visible', timeout: 10000 });
        await expect(page.locator('.grid')).toHaveScreenshot('grid.png');
    });

    test('room panel should render correctly', async ({ page }) => {
        // Draw and select a room
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
        
        await page.waitForSelector('.room-panel', { state: 'visible', timeout: 10000 });
        await expect(page.locator('.room-panel')).toHaveScreenshot('room-panel.png');
    });

    test('door panel should render correctly', async ({ page }) => {
        // Draw room and add door
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
        await page.click('button:has-text("Select")');
        await page.waitForTimeout(500);
        await page.mouse.click(300, 200);
        await page.waitForTimeout(500);
        
        await page.waitForSelector('.door-panel', { state: 'visible', timeout: 10000 });
        await expect(page.locator('.door-panel')).toHaveScreenshot('door-panel.png');
    });

    test('calculations panel should render correctly', async ({ page }) => {
        // Draw a room
        await page.waitForSelector('button:has-text("Draw Room")', { timeout: 10000 });
        await page.click('button:has-text("Draw Room")');
        await page.waitForTimeout(500);
        await page.mouse.click(200, 200);
        await page.waitForTimeout(500);
        await page.mouse.click(400, 400);
        await page.waitForTimeout(500);
        
        await page.waitForSelector('.calculations-panel', { state: 'visible', timeout: 10000 });
        await expect(page.locator('.calculations-panel')).toHaveScreenshot('calculations-panel.png');
    });
});
