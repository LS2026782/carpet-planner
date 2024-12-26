import { test, expect } from '@playwright/test';
import { ThemeManager, ThemeName } from '../utils/ThemeManager';
import {
    mockLocalStorage,
    mockColorScheme,
    mockContrastPreference,
    mockReducedMotion,
    getCurrentTheme,
    hasThemeClass,
    getThemeColor,
    getLastAnnouncement,
    waitForThemeChange,
    mockThemeChangeEvent,
    getThemeStyles,
    verifyThemeAccessibility,
    cleanupThemeTest
} from './helpers/themeTestHelpers';

test.describe('ThemeManager', () => {
    test.beforeEach(async ({ page }) => {
        await mockLocalStorage(page);
    });

    test.afterEach(async ({ page }) => {
        await cleanupThemeTest(page);
    });

    test('should initialize with default theme', async ({ page }) => {
        await page.evaluate(() => {
            const manager = new ThemeManager();
            return manager.getCurrentTheme();
        });

        const theme = await getCurrentTheme(page);
        expect(theme).toBe('default');
        expect(await hasThemeClass(page, 'default')).toBe(true);
    });

    test('should respect system dark mode preference', async ({ page }) => {
        await mockColorScheme(page, 'dark');
        
        await page.evaluate(() => {
            const manager = new ThemeManager({ respectSystemPreferences: true });
            return manager.getCurrentTheme();
        });

        const theme = await getCurrentTheme(page);
        expect(theme).toBe('dark');
        expect(await hasThemeClass(page, 'dark')).toBe(true);
    });

    test('should respect system high contrast preference', async ({ page }) => {
        await mockContrastPreference(page, 'high');
        
        await page.evaluate(() => {
            const manager = new ThemeManager({ respectSystemPreferences: true });
            return manager.getCurrentTheme();
        });

        const theme = await getCurrentTheme(page);
        expect(theme).toBe('high-contrast');
        expect(await hasThemeClass(page, 'high-contrast')).toBe(true);
    });

    test('should persist theme preference', async ({ page }) => {
        await page.evaluate(() => {
            const manager = new ThemeManager({ persistPreferences: true });
            manager.setTheme('dark');
        });

        // Create new instance to test persistence
        await page.evaluate(() => {
            const newManager = new ThemeManager({ persistPreferences: true });
            return newManager.getCurrentTheme();
        });

        const theme = await getCurrentTheme(page);
        expect(theme).toBe('dark');
    });

    test('should announce theme changes to screen readers', async ({ page }) => {
        await page.evaluate(() => {
            const manager = new ThemeManager();
            manager.setTheme('high-contrast');
        });

        await waitForThemeChange(page);
        const announcement = await getLastAnnouncement(page);
        expect(announcement).toContain('Theme changed to high contrast');
    });

    test('should handle theme switching', async ({ page }) => {
        const themes: ThemeName[] = ['default', 'dark', 'light', 'high-contrast'];

        for (const theme of themes) {
            await page.evaluate((t) => {
                const manager = new ThemeManager();
                manager.setTheme(t);
            }, theme);

            expect(await getCurrentTheme(page)).toBe(theme);
            expect(await hasThemeClass(page, theme)).toBe(true);
        }
    });

    test('should emit theme change events', async ({ page }) => {
        let emittedTheme: ThemeName | null = null;

        await page.exposeFunction('onThemeChange', (theme: ThemeName) => {
            emittedTheme = theme;
        });

        await page.evaluate(() => {
            const manager = new ThemeManager();
            manager.on('themeChange', (theme) => {
                // @ts-ignore
                window.onThemeChange(theme);
            });
            manager.setTheme('dark');
        });

        expect(emittedTheme).toBe('dark');
    });

    test('should handle system preference changes', async ({ page }) => {
        await page.evaluate(() => {
            const manager = new ThemeManager({ respectSystemPreferences: true });
            return manager;
        });

        await mockColorScheme(page, 'dark');
        await mockThemeChangeEvent(page, 'dark');

        const theme = await getCurrentTheme(page);
        expect(theme).toBe('dark');
    });

    test('should reset to default preferences', async ({ page }) => {
        await page.evaluate(() => {
            const manager = new ThemeManager({
                defaultTheme: 'light',
                persistPreferences: true
            });
            manager.setTheme('dark');
            manager.reset();
            return manager.getCurrentTheme();
        });

        const theme = await getCurrentTheme(page);
        expect(theme).toBe('light');
    });

    test('should handle invalid stored preferences', async ({ page }) => {
        await page.evaluate(() => {
            localStorage.setItem('theme-preferences', 'invalid json');
            const manager = new ThemeManager({
                defaultTheme: 'light',
                persistPreferences: true
            });
            return manager.getCurrentTheme();
        });

        const theme = await getCurrentTheme(page);
        expect(theme).toBe('light');
    });

    test('should update meta theme-color', async ({ page }) => {
        await page.evaluate(() => {
            const meta = document.createElement('meta');
            meta.setAttribute('name', 'theme-color');
            document.head.appendChild(meta);

            const manager = new ThemeManager();
            manager.setTheme('dark');
        });

        const themeColor = await getThemeColor(page);
        expect(themeColor).toBe('#1a1a1a');
    });

    test('should handle reduced motion preference', async ({ page }) => {
        await mockReducedMotion(page, true);

        const isReducedMotion = await page.evaluate(() => {
            const manager = new ThemeManager();
            return manager.isReducedMotionPreferred();
        });

        expect(isReducedMotion).toBe(true);
    });

    test('should maintain WCAG contrast requirements', async ({ page }) => {
        const themes: ThemeName[] = ['default', 'dark', 'light', 'high-contrast'];

        for (const theme of themes) {
            await page.evaluate((t) => {
                const manager = new ThemeManager();
                manager.setTheme(t);
            }, theme);

            await verifyThemeAccessibility(page);
        }
    });

    test('should clean up resources on destroy', async ({ page }) => {
        await page.evaluate(() => {
            const manager = new ThemeManager();
            const listenerCount = manager.listenerCount('themeChange');

            manager.on('themeChange', () => {});
            expect(manager.listenerCount('themeChange')).toBe(listenerCount + 1);

            manager.destroy();
            expect(manager.listenerCount('themeChange')).toBe(0);
        });
    });
});
