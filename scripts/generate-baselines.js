#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Configuration - optimized for initial baseline generation
 */
const config = {
    // Test configurations - reduced for faster initial run
    browsers: ['chromium', 'firefox'],
    themes: ['default'],
    viewports: [
        { name: 'desktop', width: 1920, height: 1080 }
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
 * Generate baseline screenshots
 */
async function generateBaselines() {
    console.log('\nGenerating baseline screenshots...');

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
        console.log(`\nGenerating baselines for ${config.name}...`);
        
        try {
            // Run visual tests with update flag
            await new Promise((resolve, reject) => {
                const args = [
                    'run',
                    'test:visual',
                    '--',
                    '--update-snapshots',
                    `--browser=${config.browser}`,
                    `--theme=${config.theme}`,
                    `--viewport=${config.viewport}`
                ];

                const process = spawn('npm', args, {
                    stdio: 'inherit',
                    shell: true
                });

                process.on('close', code => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`Failed with exit code ${code}`));
                    }
                });

                process.on('error', reject);
            });

            console.log(`✓ Generated baselines for ${config.name}`);
        } catch (error) {
            console.error(`✗ Failed to generate baselines for ${config.name}:`, error);
            process.exit(1);
        }
    }
}

/**
 * Verify baselines
 */
async function verifyBaselines() {
    console.log('\nVerifying baselines...');

    try {
        // Run visual tests without update flag
        await new Promise((resolve, reject) => {
            const process = spawn('npm', ['run', 'test:visual:matrix'], {
                stdio: 'inherit',
                shell: true
            });

            process.on('close', code => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Failed with exit code ${code}`));
                }
            });

            process.on('error', reject);
        });

        console.log('✓ All baselines verified');
    } catch (error) {
        console.error('✗ Failed to verify baselines:', error);
        process.exit(1);
    }
}

/**
 * Main execution
 */
async function main() {
    try {
        // Parse command line arguments
        const args = process.argv.slice(2);
        const clean = args.includes('--clean');
        const verify = args.includes('--verify');
        const specific = args.find(arg => arg.startsWith('--test='));

        // Clean if requested
        if (clean) {
            cleanScreenshots();
        }

        if (specific) {
            // Generate baselines for specific test
            const testFile = specific.split('=')[1];
            console.log(`\nGenerating baselines for ${testFile}...`);
            
            await new Promise((resolve, reject) => {
                const process = spawn('npm', [
                    'run',
                    'test:visual',
                    '--',
                    '--update-snapshots',
                    testFile
                ], {
                    stdio: 'inherit',
                    shell: true
                });

                process.on('close', code => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`Failed with exit code ${code}`));
                    }
                });

                process.on('error', reject);
            });
        } else {
            // Generate all baselines
            await generateBaselines();
        }

        // Verify if requested
        if (verify) {
            await verifyBaselines();
        }

        console.log('\nBaseline generation complete!');
    } catch (error) {
        console.error('\nBaseline generation failed:', error);
        process.exit(1);
    }
}

// Execute main function
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    cleanScreenshots,
    generateBaselines,
    verifyBaselines,
    config
};
