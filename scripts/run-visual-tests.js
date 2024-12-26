#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Configuration
 */
const config = {
    // Test configurations
    browsers: ['chromium', 'firefox', 'webkit'],
    themes: ['default', 'dark', 'high-contrast'],
    viewports: [
        { name: 'desktop', width: 1920, height: 1080 },
        { name: 'tablet', width: 1024, height: 768 },
        { name: 'mobile', width: 375, height: 812 }
    ],
    
    // Output settings
    outputDir: 'test-results/visual-tests',
    snapshotDir: 'test-results/visual-tests/snapshots',
    
    // Test files
    testFiles: [
        'components.visual.ts',
        'themes.visual.ts',
        'responsive.visual.ts'
    ]
};

/**
 * Run visual tests with specified configuration
 */
async function runVisualTests(options = {}) {
    const args = [
        'playwright',
        'test',
        '--config',
        'src/tests/config/visualTestConfig.ts',
        '--output',
        path.join(config.outputDir, options.name || '')
    ];

    // Add configuration options
    if (options.browser) args.push('--project', options.browser);
    if (options.updateSnapshots) args.push('--update-snapshots');
    if (options.debug) args.push('--debug');
    if (options.headed) args.push('--headed');
    if (options.testFile) args.push(options.testFile);

    // Set environment variables for theme and viewport
    const env = {
        ...process.env,
        THEME: options.theme || 'default',
        VIEWPORT_WIDTH: options.viewport?.split('x')[0] || '1920',
        VIEWPORT_HEIGHT: options.viewport?.split('x')[1] || '1080'
    };

    // Run tests
    return new Promise((resolve, reject) => {
        const process = spawn('npx', args, {
            stdio: 'inherit',
            shell: true,
            env
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
 * Clean old screenshots
 */
function cleanScreenshots() {
    console.log('\nCleaning old screenshots...');
    
    const dirs = [
        path.join(process.cwd(), config.outputDir),
        path.join(process.cwd(), config.snapshotDir)
    ];

    for (const dir of dirs) {
        if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true, force: true });
        }
        fs.mkdirSync(dir, { recursive: true });
    }
}

/**
 * Main execution
 */
async function main() {
    try {
        // Parse command line arguments
        const args = process.argv.slice(2);
        const debug = args.includes('--debug');
        const headed = args.includes('--headed');
        const ci = args.includes('--ci');
        const single = args.includes('--single');
        const matrix = args.includes('--matrix');
        const update = args.includes('--update-snapshots');
        const clean = args.includes('--clean');
        const browser = args.find(arg => arg.startsWith('--browser='))?.split('=')[1];
        const theme = args.find(arg => arg.startsWith('--theme='))?.split('=')[1];
        const viewport = args.find(arg => arg.startsWith('--viewport='))?.split('=')[1];
        const testFile = args.find(arg => !arg.startsWith('--'));

        // Clean if requested
        if (clean) {
            cleanScreenshots();
        }

        if (debug) {
            // Run single test configuration in debug mode
            await runVisualTests({
                name: 'debug',
                browser: browser || 'chromium',
                theme: theme || 'default',
                viewport: viewport || '1920x1080',
                debug: true,
                headed: true,
                testFile
            });
        } else if (headed) {
            // Run single test configuration in headed mode
            await runVisualTests({
                name: 'headed',
                browser: browser || 'chromium',
                theme: theme || 'default',
                viewport: viewport || '1920x1080',
                headed: true,
                testFile
            });
        } else if (single) {
            // Run single test configuration
            await runVisualTests({
                name: 'single',
                browser: browser || 'chromium',
                theme: theme || 'default',
                viewport: viewport || '1920x1080',
                updateSnapshots: update,
                testFile
            });
        } else if (matrix || ci) {
            // Generate matrix of configurations
            const matrix = [];
            for (const browser of config.browsers) {
                for (const theme of config.themes) {
                    for (const viewport of config.viewports) {
                        matrix.push({
                            browser,
                            theme,
                            viewport: `${viewport.width}x${viewport.height}`,
                            name: `${browser}-${theme}-${viewport.name}`
                        });
                    }
                }
            }

            console.log(`Running ${matrix.length} configurations...`);

            // Run each configuration
            for (const config of matrix) {
                console.log(`\nRunning configuration: ${config.name}`);
                try {
                    await runVisualTests({
                        ...config,
                        updateSnapshots: update,
                        testFile
                    });
                } catch (error) {
                    if (ci) {
                        throw error; // Fail fast in CI
                    } else {
                        console.error(`Configuration ${config.name} failed:`, error);
                    }
                }
            }
        } else {
            // Run with provided configuration or defaults
            await runVisualTests({
                name: 'default',
                browser: browser || 'chromium',
                theme: theme || 'default',
                viewport: viewport || '1920x1080',
                updateSnapshots: update,
                testFile
            });
        }

        console.log('\nVisual tests completed successfully!');
    } catch (error) {
        console.error('\nVisual tests failed:', error);
        process.exit(1);
    }
}

// Execute main function
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    runVisualTests,
    cleanScreenshots,
    config
};
