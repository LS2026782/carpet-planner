#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Configuration for theme test runs
 */
const config = {
    // Test configurations
    modes: ['default', 'dark', 'high-contrast'],
    browsers: ['chromium', 'firefox', 'webkit'],
    devices: ['desktop', 'mobile'],
    preferences: ['default', 'reduced-motion'],
    
    // Test environment
    baseUrl: 'http://localhost:3000',
    outputDir: 'test-results/theme-tests',
    configPath: 'src/tests/config/themeTestConfig.ts',
    
    // CI settings
    maxRetries: process.env.CI ? 2 : 1,
    timeout: process.env.CI ? 30000 : 10000,
    workers: process.env.CI ? 1 : undefined,
};

/**
 * Run theme tests with specified configuration
 */
async function runThemeTests(options = {}) {
    const args = [
        'npx', 'playwright', 'test',
        '--config', config.configPath,
        '--output', path.join(config.outputDir, options.name || ''),
    ];

    // Add configuration options
    if (options.browser) args.push('--browser', options.browser);
    if (options.device) args.push('--device', options.device);
    if (options.mode) args.push('--mode', options.mode);
    if (options.preferences) args.push('--preferences', options.preferences);
    if (options.workers) args.push('--workers', options.workers);
    if (options.retries) args.push('--retries', options.retries);
    if (options.timeout) args.push('--timeout', options.timeout);
    if (options.reporter) args.push('--reporter', options.reporter);
    if (options.debug) args.push('--debug');
    if (options.headed) args.push('--headed');

    // Run tests
    return new Promise((resolve, reject) => {
        const process = spawn(args[0], args.slice(1), {
            stdio: 'inherit',
            shell: true
        });

        process.on('close', code => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Tests failed with exit code ${code}`));
            }
        });

        process.on('error', reject);
    });
}

/**
 * Generate test matrix from configuration
 */
function generateTestMatrix() {
    const matrix = [];

    for (const browser of config.browsers) {
        for (const device of config.devices) {
            for (const mode of config.modes) {
                for (const pref of config.preferences) {
                    matrix.push({
                        name: `${browser}-${device}-${mode}-${pref}`,
                        browser,
                        device,
                        mode,
                        preferences: pref,
                        retries: config.maxRetries,
                        timeout: config.timeout,
                        workers: config.workers
                    });
                }
            }
        }
    }

    return matrix;
}

/**
 * Main execution
 */
async function main() {
    try {
        // Create output directory
        if (!fs.existsSync(config.outputDir)) {
            fs.mkdirSync(config.outputDir, { recursive: true });
        }

        // Parse command line arguments
        const args = process.argv.slice(2);
        const debug = args.includes('--debug');
        const headed = args.includes('--headed');
        const ci = args.includes('--ci');
        const single = args.includes('--single');
        const matrix = args.includes('--matrix');

        if (debug) {
            // Run single test configuration in debug mode
            await runThemeTests({
                name: 'debug',
                browser: 'chromium',
                device: 'desktop',
                mode: 'default',
                preferences: 'default',
                debug: true,
                headed: true
            });
        } else if (headed) {
            // Run single test configuration in headed mode
            await runThemeTests({
                name: 'headed',
                browser: 'chromium',
                device: 'desktop',
                mode: 'default',
                preferences: 'default',
                headed: true
            });
        } else if (single) {
            // Run single test configuration
            await runThemeTests({
                name: 'single',
                browser: 'chromium',
                device: 'desktop',
                mode: 'default',
                preferences: 'default'
            });
        } else if (matrix || ci) {
            // Run full test matrix
            const testMatrix = generateTestMatrix();
            console.log(`Running ${testMatrix.length} test configurations...`);

            for (const config of testMatrix) {
                console.log(`\nRunning configuration: ${config.name}`);
                try {
                    await runThemeTests(config);
                } catch (error) {
                    if (ci) {
                        throw error; // Fail fast in CI
                    } else {
                        console.error(`Configuration ${config.name} failed:`, error);
                    }
                }
            }
        } else {
            // Default: run basic test suite
            await runThemeTests({
                name: 'default',
                browser: 'chromium',
                device: 'desktop',
                mode: 'default',
                preferences: 'default'
            });
        }

        console.log('\nAll tests completed successfully!');
    } catch (error) {
        console.error('\nTest execution failed:', error);
        process.exit(1);
    }
}

// Execute main function
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    runThemeTests,
    generateTestMatrix,
    config
};
