import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    testDir: './src/tests',
    timeout: 60000, // Increased timeout for slower operations
    retries: 3, // Increased retries for flaky tests
    workers: 1, // Keep single worker for predictable execution
    globalTimeout: 600000, // 10 minutes total timeout
    reporter: [
        ['list'],
        ['html', { open: 'never' }],
        ['junit', { outputFile: 'test-results/junit.xml' }]
    ],
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: {
                browserName: 'chromium',
                viewport: { width: 1280, height: 720 },
                launchOptions: {
                    args: [
                        // Required for running tests with screen readers
                        '--enable-accessibility-service',
                        '--force-renderer-accessibility',
                    ],
                },
            },
        },
        {
            name: 'firefox',
            use: {
                browserName: 'firefox',
                viewport: { width: 1280, height: 720 },
            },
        },
        {
            name: 'webkit',
            use: {
                browserName: 'webkit',
                viewport: { width: 1280, height: 720 },
            },
        },
    ],
    webServer: {
        command: 'npm run dev',
        port: 3000,
        timeout: 120000,
        reuseExistingServer: !process.env.CI,
    },
    expect: {
        timeout: 30000, // Increased timeout for assertions and screenshots
        toHaveScreenshot: {
            maxDiffPixels: 100,
        },
    },
    outputDir: 'test-results',
    preserveOutput: 'always',
    globalSetup: require.resolve('./src/tests/global-setup.ts'),
    globalTeardown: require.resolve('./src/tests/global-teardown.ts'),
}

export default config;
