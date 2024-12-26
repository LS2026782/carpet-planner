import fs from 'fs';
import path from 'path';
import { FullConfig } from '@playwright/test';

/**
 * Global teardown for visual tests
 */
async function globalTeardown(config: FullConfig) {
    // Clean up temporary files
    const tempDir = path.join(process.cwd(), 'test-results/visual-tests/temp');
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }

    // Generate test summary
    const resultsDir = path.join(process.cwd(), 'test-results/visual-tests');
    const reportDir = path.join(resultsDir, 'report');
    const reportFile = path.join(reportDir, 'results.json');

    if (fs.existsSync(reportFile)) {
        const results = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
        const summary = {
            total: results.stats?.total || 0,
            passed: results.stats?.passed || 0,
            failed: results.stats?.failed || 0,
            skipped: results.stats?.skipped || 0,
            duration: results.stats?.duration || 0,
            status: results.stats?.failed > 0 ? 'failed' : 'passed'
        };

        // Write summary to file
        fs.writeFileSync(
            path.join(reportDir, 'summary.json'),
            JSON.stringify(summary, null, 2)
        );

        // Log test summary
        console.log('\nVisual Test Summary:');
        console.log('- Total Tests:', summary.total);
        console.log('- Passed:', summary.passed);
        console.log('- Failed:', summary.failed);
        console.log('- Skipped:', summary.skipped);
        console.log('- Duration:', Math.round(summary.duration / 1000), 'seconds');
        console.log('- Status:', summary.status.toUpperCase());
        console.log('');

        // Log failed tests if any
        if (summary.failed > 0 && results.suites) {
            console.log('Failed Tests:');
            for (const suite of results.suites) {
                for (const test of suite.specs || []) {
                    if (test.tests.some((t: any) => t.status === 'failed')) {
                        console.log(`- ${suite.title} > ${test.title}`);
                        for (const t of test.tests) {
                            if (t.status === 'failed') {
                                console.log(`  • ${t.title}`);
                                if (t.error) {
                                    console.log(`    ${t.error.message}`);
                                }
                            }
                        }
                    }
                }
            }
            console.log('');
        }

        // Log report locations
        console.log('Reports:');
        console.log('- HTML:', path.join(reportDir, 'index.html'));
        console.log('- JSON:', reportFile);
        console.log('- Summary:', path.join(reportDir, 'summary.json'));
        console.log('');

        // Exit with error if tests failed
        if (summary.failed > 0) {
            process.exit(1);
        }
    }
}

export default globalTeardown;
