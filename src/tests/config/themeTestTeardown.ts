import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
}

interface BrowserResults {
    [key: string]: TestResult;
}

interface ThemeResults {
    [key: string]: TestResult;
}

interface TestSummary {
    endTime: string;
    duration: number;
    totals: TestResult;
    browsers: BrowserResults;
    themes: ThemeResults;
    environment: {
        node: string;
        os: string;
        ci: boolean;
    };
}

/**
 * Global teardown for theme testing
 */
async function globalTeardown(config: FullConfig) {
    const testResultsDir = path.join(process.cwd(), 'test-results/theme-tests');

    // Clean up old test results (older than 7 days)
    const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const now = Date.now();

    function cleanDirectory(dirPath: string) {
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
    }

    cleanDirectory(testResultsDir);

    // Initialize test summary
    const summary: TestSummary = {
        endTime: new Date().toISOString(),
        duration: 0,
        totals: {
            passed: 0,
            failed: 0,
            skipped: 0,
            duration: 0
        },
        browsers: {},
        themes: {},
        environment: {
            node: process.version,
            os: process.platform,
            ci: !!process.env.CI
        }
    };

    // Read metadata for start time
    const metadataPath = path.join(testResultsDir, 'metadata.json');
    if (fs.existsSync(metadataPath)) {
        try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            const startTime = new Date(metadata.startTime);
            summary.duration = Date.now() - startTime.getTime();
        } catch (error) {
            console.warn('Failed to parse metadata:', error);
        }
    }

    // Parse test results
    const resultsPath = path.join(testResultsDir, 'results.json');
    if (fs.existsSync(resultsPath)) {
        try {
            const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
            
            // Process results by browser
            Object.entries(results.suites || {}).forEach(([browser, suiteResults]: [string, any]) => {
                const browserStats: TestResult = {
                    passed: 0,
                    failed: 0,
                    skipped: 0,
                    duration: 0
                };

                suiteResults.specs?.forEach((spec: any) => {
                    browserStats.duration += spec.duration || 0;
                    if (spec.status === 'passed') browserStats.passed++;
                    else if (spec.status === 'failed') browserStats.failed++;
                    else if (spec.status === 'skipped') browserStats.skipped++;

                    // Process theme-specific results
                    const theme = spec.metadata?.theme;
                    if (theme) {
                        if (!summary.themes[theme]) {
                            summary.themes[theme] = {
                                passed: 0,
                                failed: 0,
                                skipped: 0,
                                duration: 0
                            };
                        }
                        summary.themes[theme].duration += spec.duration || 0;
                        if (spec.status === 'passed') summary.themes[theme].passed++;
                        else if (spec.status === 'failed') summary.themes[theme].failed++;
                        else if (spec.status === 'skipped') summary.themes[theme].skipped++;
                    }
                });

                summary.browsers[browser] = browserStats;
                summary.totals.duration += browserStats.duration;
                summary.totals.passed += browserStats.passed;
                summary.totals.failed += browserStats.failed;
                summary.totals.skipped += browserStats.skipped;
            });
        } catch (error) {
            console.warn('Failed to parse test results:', error);
        }
    }

    // Save test summary
    const summaryPath = path.join(testResultsDir, 'summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    // Log summary to console
    console.log('\nTheme Test Summary');
    console.log('=================');
    console.log(`Duration: ${(summary.duration / 1000).toFixed(2)}s`);
    console.log(`Total Tests: ${summary.totals.passed + summary.totals.failed + summary.totals.skipped}`);
    console.log(`Passed: ${summary.totals.passed}`);
    console.log(`Failed: ${summary.totals.failed}`);
    console.log(`Skipped: ${summary.totals.skipped}`);

    if (Object.keys(summary.browsers).length > 0) {
        console.log('\nBrowser Results:');
        Object.entries(summary.browsers).forEach(([browser, stats]) => {
            console.log(`${browser}:`);
            console.log(`  Passed: ${stats.passed}`);
            console.log(`  Failed: ${stats.failed}`);
            console.log(`  Skipped: ${stats.skipped}`);
            console.log(`  Duration: ${(stats.duration / 1000).toFixed(2)}s`);
        });
    }

    if (Object.keys(summary.themes).length > 0) {
        console.log('\nTheme Results:');
        Object.entries(summary.themes).forEach(([theme, stats]) => {
            console.log(`${theme}:`);
            console.log(`  Passed: ${stats.passed}`);
            console.log(`  Failed: ${stats.failed}`);
            console.log(`  Skipped: ${stats.skipped}`);
            console.log(`  Duration: ${(stats.duration / 1000).toFixed(2)}s`);
        });
    }

    console.log('\nTest reports available in:');
    console.log(`HTML: ${path.join(testResultsDir, 'html-report')}`);
    console.log(`JSON: ${path.join(testResultsDir, 'results.json')}`);
    console.log(`Summary: ${summaryPath}`);
    console.log('=================\n');

    // Clean up environment
    delete process.env.THEME_TEST;
}

export default globalTeardown;
