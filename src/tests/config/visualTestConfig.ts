import { PlaywrightTestConfig, devices } from '@playwright/test';
import path from 'path';

// Define viewport sizes
export const viewports = {
    desktop: { width: 1920, height: 1080 },
    laptop: { width: 1366, height: 768 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 812 }
};

// Define themes - reduced for initial baseline generation
export const themes = ['default'];

// Custom test options
interface CustomTestOptions {
    theme?: string;
}

// Configuration for visual tests
const config: PlaywrightTestConfig<CustomTestOptions> = {
    // Test directory and files
    testDir: path.join(__dirname, '..', 'visual'),
    testMatch: '*.visual.ts',

    // Test execution settings - optimized for faster execution
    workers: 6,
    retries: 0,
    timeout: 60000,
    reportSlowTests: {
        max: 10,
        threshold: 30000
    },

    // Screenshot settings
    expect: {
        toHaveScreenshot: {
            maxDiffPixels: 100,
            threshold: 0.1,
            animations: 'disabled'
        }
    },

    // Output settings
    outputDir: path.join(process.cwd(), 'test-results/visual-tests'),
    snapshotDir: path.join(process.cwd(), 'test-results/visual-tests/snapshots'),

    // Use test matrix for different configurations - reduced for initial baseline
    projects: [
        // Desktop browsers with default theme
        {
            name: 'chromium',
            use: {
                browserName: 'chromium',
                viewport: viewports.desktop,
                screenshot: 'on',
                video: 'off',
                trace: 'off',
                theme: process.env.THEME || 'default'
            },
            testMatch: /.*\.visual\.ts$/
        },
        {
            name: 'firefox',
            use: {
                browserName: 'firefox',
                viewport: viewports.desktop,
                screenshot: 'on',
                video: 'off',
                trace: 'off',
                theme: process.env.THEME || 'default'
            },
            testMatch: /.*\.visual\.ts$/
        }
    ],

    // Global setup and teardown
    globalSetup: require.resolve('./visualTestSetup.ts'),
    globalTeardown: require.resolve('./visualTestTeardown.ts'),

    // Reporter configuration
    reporter: [
        ['list'],
        ['html', { outputFolder: 'test-results/visual-tests/report' }],
        ['json', { outputFile: 'test-results/visual-tests/report.json' }]
    ],

    // Use a single server instance - optimized timeouts
    webServer: {
        command: 'npm run dev',
        port: 3000,
        timeout: 60000,
        reuseExistingServer: true
    },

    // Global test settings - optimized for baseline generation
    use: {
        baseURL: 'http://localhost:3000',
        screenshot: 'only-on-failure',
        video: 'off',
        trace: 'off',
        
        // Browser settings
        actionTimeout: 15000,
        navigationTimeout: 30000,
        
        // Accessibility settings
        bypassCSP: true,
        ignoreHTTPSErrors: true,
        
        // Screenshot settings
        launchOptions: {
            args: [
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        }
    }
};

export default config;
