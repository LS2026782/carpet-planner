import fs from 'fs';
import path from 'path';
import { FullConfig } from '@playwright/test';

/**
 * Global setup for visual tests
 */
async function globalSetup(config: FullConfig) {
    // Create output directories
    const outputDirs = [
        path.join(process.cwd(), 'test-results/visual-tests'),
        path.join(process.cwd(), 'test-results/visual-tests/snapshots'),
        path.join(process.cwd(), 'test-results/visual-tests/diffs'),
        path.join(process.cwd(), 'test-results/visual-tests/report')
    ];

    for (const dir of outputDirs) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    // Clean old test results if in CI
    if (process.env.CI) {
        const resultsDir = path.join(process.cwd(), 'test-results/visual-tests');
        const snapshotsDir = path.join(resultsDir, 'snapshots');
        const diffsDir = path.join(resultsDir, 'diffs');

        // Keep snapshots directory in CI for baseline comparison
        for (const dir of [resultsDir, diffsDir]) {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    if (file !== 'snapshots') {
                        const filePath = path.join(dir, file);
                        if (fs.lstatSync(filePath).isDirectory()) {
                            fs.rmSync(filePath, { recursive: true, force: true });
                        } else {
                            fs.unlinkSync(filePath);
                        }
                    }
                }
            }
        }
    }

    // Set up environment variables
    process.env.PWDEBUG = process.env.CI ? '0' : '1';
    process.env.PWTEST_SKIP_TEST_OUTPUT = process.env.CI ? '1' : '0';
    process.env.PWTEST_SKIP_BROWSER_LOGS = process.env.CI ? '1' : '0';

    // Log setup information
    console.log('\nVisual Test Setup:');
    console.log('- Environment:', process.env.CI ? 'CI' : 'Local');
    console.log('- Debug Mode:', process.env.PWDEBUG === '1' ? 'Enabled' : 'Disabled');
    console.log('- Test Output:', process.env.PWTEST_SKIP_TEST_OUTPUT === '0' ? 'Enabled' : 'Disabled');
    console.log('- Browser Logs:', process.env.PWTEST_SKIP_BROWSER_LOGS === '0' ? 'Enabled' : 'Disabled');
    console.log('- Output Directory:', path.join(process.cwd(), 'test-results/visual-tests'));
    console.log('- Snapshots Directory:', path.join(process.cwd(), 'test-results/visual-tests/snapshots'));
    console.log('- Report Directory:', path.join(process.cwd(), 'test-results/visual-tests/report'));
    console.log('');

    // Return any data needed in tests
    return {
        baseURL: 'http://localhost:3000',
        outputDir: path.join(process.cwd(), 'test-results/visual-tests'),
        snapshotDir: path.join(process.cwd(), 'test-results/visual-tests/snapshots'),
        diffDir: path.join(process.cwd(), 'test-results/visual-tests/diffs'),
        reportDir: path.join(process.cwd(), 'test-results/visual-tests/report')
    };
}

export default globalSetup;
