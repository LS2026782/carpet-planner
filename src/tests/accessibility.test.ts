import { test, expect } from '@playwright/test';
import {
    testAccessibility,
    testKeyboardNavigation,
    testScreenReaderAnnouncements,
    testAriaLabels,
    testColorContrast,
    runAllAccessibilityTests
} from '../utils/testUtils/accessibilityTester';

test.describe('Accessibility Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the application
        await page.goto('http://localhost:3000');
        // Wait for the application to be fully loaded
        await page.waitForSelector('#app', { state: 'visible' });
    });

    test('should pass all accessibility tests', async ({ page }) => {
        await runAllAccessibilityTests(page);
    });

    test('should pass WCAG 2.1 Level AA guidelines', async ({ page }) => {
        await testAccessibility(page, {
            tags: ['wcag2aa', 'wcag21aa']
        });
    });

    test('should have proper keyboard navigation', async ({ page }) => {
        await testKeyboardNavigation(page);
    });

    test('should have proper screen reader announcements', async ({ page }) => {
        await testScreenReaderAnnouncements(page);
    });

    test('should have proper ARIA labels', async ({ page }) => {
        await testAriaLabels(page);
    });

    test('should have proper color contrast', async ({ page }) => {
        await testColorContrast(page);
    });

    test('should handle canvas operations accessibly', async ({ page }) => {
        // Test canvas-specific accessibility
        await testAccessibility(page, {
            selector: '#canvas-container',
            includeRules: [
                'aria-roles',
                'aria-valid-attr',
                'keyboard-navigable',
                'focusable-content'
            ]
        });

        // Test canvas keyboard controls
        await page.keyboard.press('Tab');
        const canvasFocused = await page.evaluate(() => 
            document.activeElement?.tagName === 'CANVAS'
        );
        expect(canvasFocused).toBe(true);

        // Test canvas mode announcements
        const liveRegion = await page.$('[aria-live="polite"]');
        expect(liveRegion).toBeTruthy();

        // Test canvas grid navigation
        await page.keyboard.press('ArrowRight');
        const announcement = await page.evaluate(() => 
            document.querySelector('[aria-live="polite"]')?.textContent
        );
        expect(announcement).toContain('moved');
    });

    test('should handle room operations accessibly', async ({ page }) => {
        // Test room creation accessibility
        await testAccessibility(page, {
            selector: '#room-editor',
            includeRules: [
                'aria-roles',
                'aria-valid-attr',
                'keyboard-navigable',
                'focusable-content'
            ]
        });

        // Test room editor keyboard controls
        await page.click('#room-editor');
        await page.keyboard.press('Enter');
        const editorActive = await page.evaluate(() => 
            document.activeElement?.closest('#room-editor') !== null
        );
        expect(editorActive).toBe(true);

        // Test room measurements announcements
        const measurementRegion = await page.$('[aria-live="polite"]');
        expect(measurementRegion).toBeTruthy();
    });

    test('should handle door operations accessibly', async ({ page }) => {
        // Test door creation accessibility
        await testAccessibility(page, {
            selector: '#door-editor',
            includeRules: [
                'aria-roles',
                'aria-valid-attr',
                'keyboard-navigable',
                'focusable-content'
            ]
        });

        // Test door editor keyboard controls
        await page.click('#door-editor');
        await page.keyboard.press('Enter');
        const editorActive = await page.evaluate(() => 
            document.activeElement?.closest('#door-editor') !== null
        );
        expect(editorActive).toBe(true);

        // Test door placement announcements
        const placementRegion = await page.$('[aria-live="polite"]');
        expect(placementRegion).toBeTruthy();
    });

    test('should handle settings panel accessibly', async ({ page }) => {
        // Test settings panel accessibility
        await testAccessibility(page, {
            selector: '#settings-panel',
            includeRules: [
                'aria-roles',
                'aria-valid-attr',
                'keyboard-navigable',
                'focusable-content'
            ]
        });

        // Test settings panel keyboard navigation
        await page.click('#settings-button');
        const firstInput = await page.$('#settings-panel input:first-child');
        const focused = await firstInput?.evaluate(el => 
            document.activeElement === el
        );
        expect(focused).toBe(true);

        // Test settings changes announcements
        const settingsRegion = await page.$('[aria-live="polite"]');
        expect(settingsRegion).toBeTruthy();
    });

    test('should handle calculations panel accessibly', async ({ page }) => {
        // Test calculations panel accessibility
        await testAccessibility(page, {
            selector: '#calculations-panel',
            includeRules: [
                'aria-roles',
                'aria-valid-attr',
                'keyboard-navigable',
                'focusable-content'
            ]
        });

        // Test calculations updates announcements
        const calculationsRegion = await page.$('[aria-live="polite"]');
        expect(calculationsRegion).toBeTruthy();

        // Test calculations keyboard navigation
        await page.click('#calculations-panel');
        const firstButton = await page.$('#calculations-panel button:first-child');
        const focused = await firstButton?.evaluate(el => 
            document.activeElement === el
        );
        expect(focused).toBe(true);
    });
});
