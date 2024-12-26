import { Page } from '@playwright/test';
import { ThemeName, ColorSchemePreference, ContrastPreference } from '../../utils/ThemeManager';

/**
 * Helper functions for testing theme-related functionality
 */

/**
 * Mock localStorage for theme testing
 */
export async function mockLocalStorage(page: Page): Promise<void> {
    await page.evaluate(() => {
        const storage: Record<string, string> = {};
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: (key: string) => storage[key],
                setItem: (key: string, value: string) => storage[key] = value,
                removeItem: (key: string) => delete storage[key],
                clear: () => Object.keys(storage).forEach(key => delete storage[key])
            }
        });
    });
}

/**
 * Mock system color scheme preference
 */
export async function mockColorScheme(page: Page, preference: ColorSchemePreference): Promise<void> {
    await page.emulateMedia({ colorScheme: preference === 'dark' ? 'dark' : 'light' });
}

/**
 * Mock system contrast preference
 */
export async function mockContrastPreference(page: Page, preference: ContrastPreference): Promise<void> {
    await page.evaluate((pref) => {
        window.matchMedia = (query: string) => ({
            matches: query === '(forced-colors: active)' ? pref === 'high' : false,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true
        });
    }, preference);
}

/**
 * Mock reduced motion preference
 */
export async function mockReducedMotion(page: Page, enabled: boolean): Promise<void> {
    await page.evaluate((isEnabled) => {
        window.matchMedia = (query: string) => ({
            matches: query === '(prefers-reduced-motion: reduce)' ? isEnabled : false,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true
        });
    }, enabled);
}

/**
 * Get current theme from document
 */
export async function getCurrentTheme(page: Page): Promise<ThemeName> {
    return await page.evaluate(() => 
        document.documentElement.getAttribute('data-theme') as ThemeName
    );
}

/**
 * Check if theme class is present
 */
export async function hasThemeClass(page: Page, theme: ThemeName): Promise<boolean> {
    return await page.evaluate((t) => 
        document.documentElement.classList.contains(`theme-${t}`)
    , theme);
}

/**
 * Get theme-color meta tag content
 */
export async function getThemeColor(page: Page): Promise<string | null> {
    return await page.evaluate(() => 
        document.querySelector('meta[name="theme-color"]')?.getAttribute('content') || null
    );
}

/**
 * Get screen reader announcement
 */
export async function getLastAnnouncement(page: Page): Promise<string | null> {
    return await page.evaluate(() => 
        document.querySelector('[aria-live="polite"]')?.textContent || null
    );
}

/**
 * Wait for theme change
 */
export async function waitForThemeChange(page: Page): Promise<void> {
    await page.waitForFunction(() => 
        document.querySelector('[aria-live="polite"]')?.textContent?.includes('Theme changed')
    );
}

/**
 * Mock theme change event
 */
export async function mockThemeChangeEvent(page: Page, theme: ThemeName): Promise<void> {
    await page.evaluate((t) => {
        const event = new CustomEvent('themechange', { detail: t });
        window.dispatchEvent(event);
    }, theme);
}

/**
 * Get computed styles for theme verification
 */
export async function getThemeStyles(page: Page): Promise<Record<string, string>> {
    return await page.evaluate(() => {
        const styles = getComputedStyle(document.documentElement);
        return {
            backgroundColor: styles.getPropertyValue('--background-color'),
            textColor: styles.getPropertyValue('--text-color'),
            primaryColor: styles.getPropertyValue('--primary-color'),
            borderColor: styles.getPropertyValue('--border-color'),
            focusColor: styles.getPropertyValue('--focus-ring-color')
        };
    });
}

/**
 * Verify theme accessibility
 */
export async function verifyThemeAccessibility(page: Page): Promise<void> {
    const styles = await getThemeStyles(page);
    
    // Verify contrast ratios
    await page.evaluate((s) => {
        function getContrastRatio(color1: string, color2: string): number {
            // Convert colors to luminance values
            function getLuminance(color: string): number {
                const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
                const [r, g, b] = rgb.map(c => {
                    c = c / 255;
                    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
                });
                return 0.2126 * r + 0.7152 * g + 0.0722 * b;
            }

            const l1 = getLuminance(color1);
            const l2 = getLuminance(color2);
            const lighter = Math.max(l1, l2);
            const darker = Math.min(l1, l2);
            return (lighter + 0.05) / (darker + 0.05);
        }

        // Check text contrast (WCAG Level AA requires 4.5:1 for normal text)
        const textContrast = getContrastRatio(s.backgroundColor, s.textColor);
        if (textContrast < 4.5) {
            throw new Error(`Text contrast ratio ${textContrast} is below WCAG AA requirement of 4.5:1`);
        }

        // Check focus indicator contrast
        const focusContrast = getContrastRatio(s.backgroundColor, s.focusColor);
        if (focusContrast < 3) {
            throw new Error(`Focus indicator contrast ratio ${focusContrast} is too low`);
        }
    }, styles);
}

/**
 * Clean up theme testing environment
 */
export async function cleanupThemeTest(page: Page): Promise<void> {
    await page.evaluate(() => {
        localStorage.clear();
        document.documentElement.className = '';
        document.documentElement.removeAttribute('data-theme');
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.remove();
    });
}
