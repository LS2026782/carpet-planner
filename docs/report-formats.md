# Test Report Formats Guide

This guide explains the different report formats available for test results and how to use them.

## Available Formats

1. HTML Report
2. Markdown Report
3. JUnit XML Report
4. JSON Report

## HTML Report

The HTML report provides an interactive web interface for viewing test results.

### Features
- Interactive filtering by browser, theme, and status
- Visual status indicators
- Collapsible test details
- Dark mode support
- Responsive design
- Performance metrics visualization

### Usage
```bash
# Generate HTML report
npm run report

# Generate and open in browser
npm run report:all

# Open existing report
npm run report:open
```

### Structure
```
test-results/
└── combined-report/
    ├── report.html
    ├── screenshots/
    ├── traces/
    └── videos/
```

## Markdown Report

The Markdown report provides a text-based overview suitable for GitHub and documentation.

### Features
- GitHub-compatible formatting
- Summary statistics
- Browser-specific results
- Theme-specific results
- Performance metrics
- Resource usage statistics

### Usage
```bash
# Generate Markdown report
npm run report -- --format md

# Generate with custom output
npm run report -- --format md --output custom-report.md
```

### Structure
```markdown
# Test Report
Generated on: [timestamp]

## Summary
- Total Tests: X
- Passed: X
- Failed: X
- Skipped: X
...
```

## JUnit XML Report

The JUnit XML report follows the standard format for CI/CD integration.

### Features
- CI/CD compatible format
- Detailed test cases
- Error messages and stack traces
- Test properties and metadata
- System output capture

### Usage
```bash
# Generate JUnit report
npm run report -- --format junit

# Specify custom output
npm run report -- --format junit --output results.xml
```

### Structure
```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
    <testsuite name="..." tests="X" failures="Y">
        <testcase name="...">
            <failure message="...">
                Stack trace
            </failure>
        </testcase>
    </testsuite>
</testsuites>
```

## JSON Report

The JSON report provides structured data for programmatic analysis.

### Features
- Machine-readable format
- Complete test data
- Schema validation
- Nested results structure
- Detailed metrics

### Usage
```bash
# Generate JSON report
npm run report -- --format json

# Generate with schema validation
npm run report -- --format json --validate

# Custom output location
npm run report -- --format json --output custom.json
```

### Schema
The JSON report follows a defined schema located at `templates/report.schema.json`.

Key sections:
```json
{
  "metadata": {},    // Run information
  "summary": {},     // Overall results
  "environment": {}, // System details
  "configuration": {},// Test configuration
  "browserResults": {},// Browser-specific results
  "themeResults": {},  // Theme-specific results
  "metrics": {},      // Performance metrics
  "artifacts": {}     // Test artifacts
}
```

## Combining Reports

Generate multiple report formats simultaneously:

```bash
# Generate all formats
npm run report -- --format all

# Generate specific formats
npm run report -- --format html,json

# Generate with custom outputs
npm run report -- --format html,json --output-dir custom/path
```

## Report Customization

### Templates
Custom templates can be added in the `templates/` directory:
- HTML: `templates/report.html`
- Markdown: `templates/report.md`
- JUnit: `templates/junit.xml`
- JSON Schema: `templates/report.schema.json`

### Styling
The HTML report can be customized via CSS:
```css
/* templates/report.html */
:root {
    --primary-color: #007bff;
    --success-color: #28a745;
    /* ... */
}
```

### Data Processing
Add custom data processing in `scripts/generate-report.js`:
```javascript
function processResults(results, type) {
    // Custom processing logic
}
```

## CI/CD Integration

### GitHub Actions
```yaml
- name: Generate test reports
  run: npm run report -- --format all
  if: always()

- name: Upload reports
  uses: actions/upload-artifact@v3
  with:
    name: test-reports
    path: test-results/
```

### Jenkins
```groovy
post {
    always {
        junit 'test-results/junit.xml'
        archiveArtifacts 'test-results/**/*'
    }
}
```

## Best Practices

1. **Report Generation**
   - Generate reports after each test run
   - Include all relevant artifacts
   - Validate JSON against schema
   - Use descriptive filenames

2. **Version Control**
   - Store templates in version control
   - Exclude generated reports
   - Track schema changes
   - Document customizations

3. **CI/CD**
   - Generate reports in CI/CD
   - Upload as artifacts
   - Parse for test status
   - Create issues for failures

4. **Maintenance**
   - Clean old reports regularly
   - Update templates as needed
   - Validate schema changes
   - Monitor disk usage

## Troubleshooting

### Common Issues

1. **Missing Reports**
   ```bash
   # Check report generation
   npm run report -- --debug
   ```

2. **Invalid JSON**
   ```bash
   # Validate JSON
   npm run report -- --validate
   ```

3. **Template Errors**
   ```bash
   # Check template syntax
   npm run report -- --check-templates
   ```

4. **Artifact Collection**
   ```bash
   # Verify artifacts
   npm run report -- --list-artifacts
   ```

### Debug Mode

Enable debug mode for detailed logging:
```bash
DEBUG=report:* npm run report
```

### Support

For issues and feature requests:
1. Check troubleshooting guide
2. Review GitHub issues
3. Open new issue with:
   - Report command used
   - Error messages
   - Environment details
   - Reproduction steps
