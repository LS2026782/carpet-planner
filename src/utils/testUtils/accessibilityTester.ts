import { AxeBuilder } from '@axe-core/playwright';
import type { ImpactValue, Result as AxeResult, NodeResult, Check } from 'axe-core';
import { Page, Locator } from '@playwright/test';

/**
 * Options for accessibility testing
 */
interface AccessibilityTestOptions {
    /**
     * Specific rules to include in the analysis
     */
    includeRules?: string[];
    /**
     * Rules to exclude from the analysis
     */
    excludeRules?: string[];
    /**
     * Specific element selector to test
     */
    selector?: string;
    /**
     * Context-specific tags to include (e.g., 'wcag2a', 'wcag2aa', 'wcag21a', 'best-practice')
     */
    tags?: string[];
}

/**
 * Formatted violation result
 */
interface FormattedViolation {
    id: string;
    impact: ImpactValue | undefined;
    description: string;
    help: string;
    helpUrl: string;
    nodes: Array<{
        html: string;
        failureSummary: string | undefined;
        target: string[];
    }>;
}

/**
 * Converts any target selector to a string array
 */
function getTargetStrings(target: any): string[] {
    if (Array.isArray(target)) {
        return target.map(item => String(item));
    }
    if (typeof target === 'object' && target !== null) {
        // Handle complex selectors by converting them to strings
        return [String(target)];
    }
    return [String(target)];
}

/**
 * Runs accessibility tests on a page or element
 */
export async function testAccessibility(
    page: Page,
    options: AccessibilityTestOptions = {}
): Promise<void> {
    const builder = new AxeBuilder({ page });

    if (options.includeRules) {
        builder.include(options.includeRules);
    }

    if (options.excludeRules) {
        builder.exclude(options.excludeRules);
    }

    if (options.selector) {
        builder.include([options.selector]);
    }

    if (options.tags) {
        builder.withTags(options.tags);
    }

    const results = await builder.analyze();

    // Format and throw error if violations are found
    if (results.violations.length > 0) {
        const violations: FormattedViolation[] = results.violations.map(violation => ({
            id: violation.id,
            impact: violation.impact,
            description: violation.description,
            help: violation.help,
            helpUrl: violation.helpUrl,
            nodes: violation.nodes.map(node => ({
                html: node.html,
                failureSummary: node.failureSummary,
                target: getTargetStrings(node.target)
            }))
        }));

        throw new Error(
            'Accessibility violations found:\n' +
            JSON.stringify(violations, null, 2)
        );
    }
}

/**
 * Tests keyboard navigation
 */
export async function testKeyboardNavigation(page: Page): Promise<void> {
    // Test Tab navigation
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    if (!firstFocused) {
        throw new Error('No element received focus on first Tab press');
    }

    // Test focus trap in modal dialogs
    const modalSelector = '[role="dialog"]';
    const hasModal = await page.$(modalSelector);
    if (hasModal) {
        // Press Tab multiple times and verify focus stays within modal
        for (let i = 0; i < 10; i++) {
            await page.keyboard.press('Tab');
            const isInModal = await page.evaluate(
                (selector: string) => document.activeElement?.closest(selector) !== null,
                modalSelector
            );
            if (!isInModal) {
                throw new Error('Focus escaped modal dialog');
            }
        }
    }

    // Test Escape key in modals
    if (hasModal) {
        await page.keyboard.press('Escape');
        const modalStillVisible = await page.$(modalSelector);
        if (modalStillVisible) {
            throw new Error('Modal did not close on Escape key press');
        }
    }
}

/**
 * Tests screen reader announcements
 */
export async function testScreenReaderAnnouncements(page: Page): Promise<void> {
    // Get all live regions
    const liveRegions = await page.$$('[aria-live]');
    
    if (liveRegions.length === 0) {
        throw new Error('No live regions found for screen reader announcements');
    }

    // Test that dynamic content updates are announced
    for (const region of liveRegions) {
        const polite = await region.getAttribute('aria-live');
        if (!['polite', 'assertive'].includes(polite || '')) {
            throw new Error('Live region has invalid aria-live value');
        }
    }
}

/**
 * Tests ARIA labels and descriptions
 */
export async function testAriaLabels(page: Page): Promise<void> {
    // Test interactive elements have accessible names
    const interactiveElements = await page.$$('button, a[href], input, select, textarea, [role="button"]');
    
    for (const element of interactiveElements) {
        const accessibleName = await element.evaluate((el: HTMLElement) => {
            const label = el.getAttribute('aria-label');
            const labelledBy = el.getAttribute('aria-labelledby');
            if (labelledBy) {
                const labelElement = document.getElementById(labelledBy);
                return labelElement?.textContent || '';
            }
            return label || el.textContent || '';
        });

        if (!accessibleName.trim()) {
            const html = await element.evaluate((el: HTMLElement) => el.outerHTML);
            throw new Error(`Interactive element missing accessible name: ${html}`);
        }
    }
}

/**
 * Tests color contrast
 */
export async function testColorContrast(page: Page): Promise<void> {
    const results = await new AxeBuilder({ page })
        .include(['color-contrast'])
        .analyze();

    if (results.violations.length > 0) {
        throw new Error(
            'Color contrast violations found:\n' +
            JSON.stringify(results.violations, null, 2)
        );
    }
}

/**
 * Runs all accessibility tests
 */
export async function runAllAccessibilityTests(
    page: Page,
    options: AccessibilityTestOptions = {}
): Promise<void> {
    await testAccessibility(page, options);
    await testKeyboardNavigation(page);
    await testScreenReaderAnnouncements(page);
    await testAriaLabels(page);
    await testColorContrast(page);
}
