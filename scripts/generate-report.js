#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Configuration for report generation
 */
const config = {
    // Report directories
    reportDirs: {
        accessibility: 'test-results/accessibility',
        theme: 'test-results/theme-tests',
        visual: 'test-results',  // Playwright's default output directory
        combined: 'test-results/combined-report'
    },
    
    // Report formats
    formats: ['html', 'json', 'junit'],
    
    // Playwright specific
    playwrightResults: {
        report: 'test-results/playwright-report',
        testResults: 'test-results/results.json'
    },
    
    // Report templates
    templates: {
        html: path.join(__dirname, '../templates/report.html'),
        markdown: path.join(__dirname, '../templates/report.md')
    }
};

/**
 * Generate HTML report
 */
function generateHtmlReport(results) {
    console.log('\nGenerating HTML report...');
    
    const template = fs.existsSync(config.templates.html)
        ? fs.readFileSync(config.templates.html, 'utf8')
        : `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Visual Test Report</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 2rem;
                    background: #f5f5f5;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .summary { 
                    margin-bottom: 2rem;
                    padding: 1rem;
                    background: #f8f9fa;
                    border-radius: 4px;
                }
                .failures { color: #dc3545; }
                .success { color: #28a745; }
                .skipped { color: #ffc107; }
                table { 
                    border-collapse: collapse; 
                    width: 100%;
                    margin-bottom: 2rem;
                }
                th, td { 
                    border: 1px solid #dee2e6; 
                    padding: 12px; 
                    text-align: left; 
                }
                th { 
                    background-color: #f8f9fa;
                    font-weight: 600;
                }
                tr:hover {
                    background-color: #f8f9fa;
                }
                .status-passed { color: #28a745; }
                .status-failed { color: #dc3545; }
                .status-skipped { color: #ffc107; }
                .error-message {
                    background: #fff3f3;
                    padding: 8px;
                    border-radius: 4px;
                    color: #dc3545;
                    font-family: monospace;
                    margin-top: 8px;
                }
                .screenshot-comparison {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1rem;
                    padding: 1rem;
                    background: #f8f9fa;
                    border-radius: 4px;
                }
                .screenshot-container {
                    flex: 1;
                }
                .screenshot-container img {
                    max-width: 100%;
                    border: 1px solid #dee2e6;
                }
                .screenshot-label {
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Visual Test Report</h1>
                <div class="summary">
                    <h2>Summary</h2>
                    <p>Total Tests: {{totalTests}}</p>
                    <p>Passed: <span class="success">{{passed}}</span></p>
                    <p>Failed: <span class="failures">{{failed}}</span></p>
                    <p>Skipped: <span class="skipped">{{skipped}}</span></p>
                    <p>Duration: {{duration}}s</p>
                </div>
                <div class="details">
                    <h2>Test Details</h2>
                    {{details}}
                </div>
            </div>
        </body>
        </html>
        `;

    const report = template
        .replace('{{totalTests}}', results.totals.total)
        .replace('{{passed}}', results.totals.passed)
        .replace('{{failed}}', results.totals.failed)
        .replace('{{skipped}}', results.totals.skipped)
        .replace('{{duration}}', (results.duration / 1000).toFixed(2))
        .replace('{{details}}', generateDetailsTable(results));

    const outputPath = path.join(config.reportDirs.combined, 'report.html');
    fs.writeFileSync(outputPath, report);
    console.log(`HTML report generated: ${outputPath}`);
}

/**
 * Get screenshot paths for a test
 */
function getScreenshotPaths(test) {
    if (test.type !== 'visual') return null;

    const testName = test.name.split(' > ').pop();
    const baseDir = path.join(process.cwd(), config.reportDirs.visual);
    
    const expected = path.join(baseDir, 'snapshots', `${testName}.png`);
    const actual = path.join(baseDir, 'actual', `${testName}.png`);
    const diff = path.join(baseDir, 'diffs', `${testName}-diff.png`);

    return {
        expected: fs.existsSync(expected) ? expected : null,
        actual: fs.existsSync(actual) ? actual : null,
        diff: fs.existsSync(diff) ? diff : null
    };
}

/**
 * Generate screenshot comparison HTML
 */
function generateScreenshotComparison(test) {
    const paths = getScreenshotPaths(test);
    if (!paths) return '';

    let html = '<div class="screenshot-comparison">';

    if (paths.expected) {
        html += `
            <div class="screenshot-container">
                <div class="screenshot-label">Expected</div>
                <img src="data:image/png;base64,${fs.readFileSync(paths.expected, 'base64')}" alt="Expected screenshot">
            </div>
        `;
    }

    if (paths.actual) {
        html += `
            <div class="screenshot-container">
                <div class="screenshot-label">Actual</div>
                <img src="data:image/png;base64,${fs.readFileSync(paths.actual, 'base64')}" alt="Actual screenshot">
            </div>
        `;
    }

    if (paths.diff && test.status === 'failed') {
        html += `
            <div class="screenshot-container">
                <div class="screenshot-label">Difference</div>
                <img src="data:image/png;base64,${fs.readFileSync(paths.diff, 'base64')}" alt="Screenshot difference">
            </div>
        `;
    }

    html += '</div>';
    return html;
}

/**
 * Generate details table
 */
function generateDetailsTable(results) {
    let html = '';
    
    results.tests.forEach(test => {
        html += `
            <div class="test-result">
                <table>
                    <tr>
                        <th>Test</th>
                        <td>${test.name}</td>
                    </tr>
                    <tr>
                        <th>Browser</th>
                        <td>${test.browser || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Theme</th>
                        <td>${test.theme || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Status</th>
                        <td class="status-${test.status}">${test.status}</td>
                    </tr>
                    <tr>
                        <th>Duration</th>
                        <td>${(test.duration / 1000).toFixed(2)}s</td>
                    </tr>
                </table>
        `;

        if (test.error) {
            html += `
                <div class="error-message">
                    ${test.error}
                </div>
            `;
        }

        if (test.type === 'visual') {
            html += generateScreenshotComparison(test);
        }

        html += '</div><hr>';
    });
    
    return html;
}

/**
 * Process Playwright results
 */
function processPlaywrightResults(playwrightResults) {
    const tests = [];
    
    playwrightResults.suites.forEach(suite => {
        suite.specs.forEach(spec => {
            spec.tests.forEach(test => {
                tests.push({
                    name: `${suite.title} > ${spec.title} > ${test.title}`,
                    browser: test.projectName,
                    status: test.status,
                    duration: test.duration,
                    error: test.error?.message || '',
                    type: 'visual',
                    retry: test.retry,
                    location: test.location
                });
            });
        });
    });
    
    return tests;
}

/**
 * Collect test results
 */
function collectResults() {
    console.log('\nCollecting test results...');
    
    const results = {
        timestamp: new Date().toISOString(),
        duration: 0,
        totals: {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0
        },
        tests: []
    };
    
    // Collect Playwright results
    const playwrightPath = path.join(process.cwd(), config.playwrightResults.testResults);
    if (fs.existsSync(playwrightPath)) {
        console.log('Processing Playwright results...');
        const playwrightResults = JSON.parse(fs.readFileSync(playwrightPath, 'utf8'));
        results.tests.push(...processPlaywrightResults(playwrightResults));
    } else {
        console.log('No Playwright results found at:', playwrightPath);
    }
    
    // Collect accessibility results (if they exist)
    const accessibilityPath = path.join(config.reportDirs.accessibility, 'results.json');
    if (fs.existsSync(accessibilityPath)) {
        console.log('Processing accessibility results...');
        const accessibilityResults = JSON.parse(fs.readFileSync(accessibilityPath, 'utf8'));
        results.tests.push(...processResults(accessibilityResults, 'accessibility'));
    }
    
    // Collect theme results (if they exist)
    const themePath = path.join(config.reportDirs.theme, 'results.json');
    if (fs.existsSync(themePath)) {
        console.log('Processing theme results...');
        const themeResults = JSON.parse(fs.readFileSync(themePath, 'utf8'));
        results.tests.push(...processResults(themeResults, 'theme'));
    }
    
    // Calculate totals
    results.tests.forEach(test => {
        results.duration += test.duration;
        results.totals.total++;
        if (test.status === 'passed') results.totals.passed++;
        else if (test.status === 'failed') results.totals.failed++;
        else if (test.status === 'skipped') results.totals.skipped++;
    });
    
    return results;
}

/**
 * Process test results
 */
function processResults(results, type) {
    const tests = [];
    
    if (results.suites) {
        Object.entries(results.suites).forEach(([browser, suite]) => {
            suite.specs?.forEach(spec => {
                tests.push({
                    name: spec.title,
                    browser,
                    theme: spec.metadata?.theme,
                    status: spec.status,
                    duration: spec.duration,
                    error: spec.error?.message,
                    type
                });
            });
        });
    }
    
    return tests;
}

/**
 * Generate combined report
 */
function generateCombinedReport() {
    console.log('\nGenerating combined report...');
    
    // Create output directory
    if (!fs.existsSync(config.reportDirs.combined)) {
        fs.mkdirSync(config.reportDirs.combined, { recursive: true });
    }
    
    // Collect results
    const results = collectResults();
    
    // Generate reports in different formats
    generateHtmlReport(results);
    
    // Save JSON report
    const jsonPath = path.join(config.reportDirs.combined, 'report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
    console.log(`JSON report generated: ${jsonPath}`);
    
    return results;
}

/**
 * Open report in browser
 */
function openReport() {
    const reportPath = path.join(config.reportDirs.combined, 'report.html');
    if (fs.existsSync(reportPath)) {
        const command = process.platform === 'win32' ? 'start' : 'open';
        execSync(`${command} ${reportPath}`);
    } else {
        console.error('Report not found. Generate it first with --generate');
    }
}

/**
 * Main execution
 */
async function main() {
    try {
        // Parse command line arguments
        const args = process.argv.slice(2);
        const generate = args.includes('--generate');
        const open = args.includes('--open');
        
        if (generate) {
            const results = generateCombinedReport();
            console.log('\nReport Summary:');
            console.log('--------------');
            console.log(`Total Tests: ${results.totals.total}`);
            console.log(`Passed: ${results.totals.passed}`);
            console.log(`Failed: ${results.totals.failed}`);
            console.log(`Skipped: ${results.totals.skipped}`);
            console.log(`Duration: ${(results.duration / 1000).toFixed(2)}s`);
        }
        
        if (open) {
            openReport();
        }
        
        if (!generate && !open) {
            console.log('Usage: node generate-report.js [--generate] [--open]');
        }
    } catch (error) {
        console.error('\nReport generation failed:', error);
        process.exit(1);
    }
}

// Execute main function
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    generateCombinedReport,
    openReport,
    config
};
