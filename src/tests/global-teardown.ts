import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function globalTeardown(config: FullConfig) {
    // Clean up test artifacts older than 7 days
    const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const now = Date.now();

    const cleanDirectory = (dirPath: string) => {
        if (!fs.existsSync(dirPath)) return;

        fs.readdirSync(dirPath).forEach(file => {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                cleanDirectory(filePath);
                // Remove empty directories
                if (fs.readdirSync(filePath).length === 0) {
                    fs.rmdirSync(filePath);
                }
            } else if (now - stats.mtime.getTime() > MAX_AGE) {
                fs.unlinkSync(filePath);
            }
        });
    };

    const testResultsDir = path.join(process.cwd(), 'test-results');
    cleanDirectory(testResultsDir);

    // Generate test summary
    const results = {
        timestamp: new Date().toISOString(),
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
        browsers: {} as Record<string, { passed: number; failed: number; skipped: number }>,
    };

    // Parse JUnit report
    const junitPath = path.join(testResultsDir, 'junit.xml');
    if (fs.existsSync(junitPath)) {
        const xml = fs.readFileSync(junitPath, 'utf-8');
        const match = xml.match(/tests="(\d+)" failures="(\d+)" skipped="(\d+)"/);
        if (match) {
            const [, total, failures, skipped] = match;
            results.passed = parseInt(total) - parseInt(failures) - parseInt(skipped);
            results.failed = parseInt(failures);
            results.skipped = parseInt(skipped);
        }

        // Extract browser-specific results
        const browserResults = xml.match(/browserName="([^"]+)"/g);
        if (browserResults) {
            browserResults.forEach(browser => {
                const browserName = browser.match(/browserName="([^"]+)"/)?.[1];
                if (browserName) {
                    results.browsers[browserName] = {
                        passed: 0,
                        failed: 0,
                        skipped: 0,
                    };
                }
            });
        }
    }

    // Save test summary
    const summaryPath = path.join(testResultsDir, 'summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));

    // Log summary to console
    console.log('\nTest Summary:');
    console.log('--------------');
    console.log(`Total Tests: ${results.passed + results.failed + results.skipped}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Skipped: ${results.skipped}`);
    console.log('\nBrowser Results:');
    Object.entries(results.browsers).forEach(([browser, stats]) => {
        console.log(`${browser}:`);
        console.log(`  Passed: ${stats.passed}`);
        console.log(`  Failed: ${stats.failed}`);
        console.log(`  Skipped: ${stats.skipped}`);
    });
}

export default globalTeardown;
