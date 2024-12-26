import { PlaywrightTestConfig, devices } from '@playwright/test';

/**
 * Custom test options for theme testing
 */
interface ThemeTestOptions {
    forcedColors?: 'active' | 'none';
    prefersReducedMotion?: 'reduce' | 'no-preference';
}

/**
 * Configuration for theme and accessibility testing
 */
const themeTestConfig: PlaywrightTestConfig<ThemeTestOptions> = {
    testDir: '../',
    testMatch: ['**/*.(theme|accessibility).test.ts'],
    timeout: 30000,
    retries: 2,
    workers: 1, // Run tests sequentially for theme testing
    reporter: [
        ['list'],
        ['html', { 
            open: 'never',
            outputFolder: 'test-results/theme-tests/html-report'
        }],
        ['junit', { 
            outputFile: 'test-results/theme-tests/junit.xml'
        }],
        ['json', { 
            outputFile: 'test-results/theme-tests/results.json'
        }]
    ],
    use: {
        baseURL: 'http://localhost:3000',
        trace: process.env.CI ? 'retain-on-failure' : 'on',
        screenshot: process.env.CI ? 'only-on-failure' : 'on',
        video: process.env.CI ? 'retain-on-failure' : 'on',
        viewport: { width: 1280, height: 720 },
        actionTimeout: 15000,
        navigationTimeout: 30000,
        ignoreHTTPSErrors: true,
        bypassCSP: true,
        launchOptions: {
            args: [
                '--enable-accessibility-service',
                '--force-renderer-accessibility',
            ],
            firefoxUserPrefs: {
                'ui.prefersReducedMotion': 0,
                'ui.systemUsesDarkTheme': 0,
            },
            chromiumSandbox: false,
            slowMo: process.env.CI ? 0 : 100,
        },
    },
    projects: [
        // Desktop Chrome with default preferences
        {
            name: 'chrome-default',
            use: {
                ...devices['Desktop Chrome'],
                colorScheme: 'no-preference',
                forcedColors: 'none',
                prefersReducedMotion: 'no-preference',
            },
        },
        // Desktop Chrome with dark mode
        {
            name: 'chrome-dark',
            use: {
                ...devices['Desktop Chrome'],
                colorScheme: 'dark',
                forcedColors: 'none',
                prefersReducedMotion: 'no-preference',
            },
        },
        // Desktop Chrome with high contrast
        {
            name: 'chrome-high-contrast',
            use: {
                ...devices['Desktop Chrome'],
                colorScheme: 'no-preference',
                forcedColors: 'active',
                prefersReducedMotion: 'no-preference',
            },
        },
        // Desktop Chrome with reduced motion
        {
            name: 'chrome-reduced-motion',
            use: {
                ...devices['Desktop Chrome'],
                colorScheme: 'no-preference',
                forcedColors: 'none',
                prefersReducedMotion: 'reduce',
            },
        },
        // Desktop Firefox with default preferences
        {
            name: 'firefox-default',
            use: {
                ...devices['Desktop Firefox'],
                colorScheme: 'no-preference',
                forcedColors: 'none',
                prefersReducedMotion: 'no-preference',
            },
        },
        // Desktop Safari with default preferences
        {
            name: 'safari-default',
            use: {
                ...devices['Desktop Safari'],
                colorScheme: 'no-preference',
                forcedColors: 'none',
                prefersReducedMotion: 'no-preference',
            },
        },
        // Mobile Chrome with default preferences
        {
            name: 'mobile-chrome',
            use: {
                ...devices['Pixel 5'],
                colorScheme: 'no-preference',
                forcedColors: 'none',
                prefersReducedMotion: 'no-preference',
            },
        },
        // Mobile Safari with default preferences
        {
            name: 'mobile-safari',
            use: {
                ...devices['iPhone 12'],
                colorScheme: 'no-preference',
                forcedColors: 'none',
                prefersReducedMotion: 'no-preference',
            },
        }
    ],
    webServer: {
        command: 'npm run dev',
        port: 3000,
        timeout: 120000,
        reuseExistingServer: !process.env.CI,
    },
    expect: {
        timeout: 10000,
        toHaveScreenshot: {
            maxDiffPixels: 100,
        },
    },
    outputDir: 'test-results/theme-tests',
    preserveOutput: 'always',
    globalSetup: require.resolve('./themeTestSetup.ts'),
    globalTeardown: require.resolve('./themeTestTeardown.ts'),
    snapshotDir: 'test-results/theme-tests/snapshots',
    metadata: {
        type: 'theme-accessibility',
        framework: {
            name: 'playwright',
            version: '1.39.0'
        },
        tags: ['theme', 'accessibility', 'visual', 'contrast']
    },
    forbidOnly: !!process.env.CI,
    fullyParallel: false,
    maxFailures: 1,
    reportSlowTests: {
        max: 5,
        threshold: 15000
    }
};

export default themeTestConfig;
