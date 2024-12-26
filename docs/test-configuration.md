# Test Configuration Guide

This guide explains how to configure and run the theme and accessibility tests.

## Configuration Files

### Main Configuration
- `src/tests/config/themeTestConfig.ts`: Main test configuration
- `src/tests/config/themeTestSetup.ts`: Global test setup
- `src/tests/config/themeTestTeardown.ts`: Global test teardown

### Test Matrix Configuration
```typescript
// src/tests/config/themeTestConfig.ts
const config: PlaywrightTestConfig<ThemeTestOptions> = {
  projects: [
    // Desktop Chrome with default preferences
    {
      name: 'chrome-default',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'no-preference',
        forcedColors: 'none',
        prefersReducedMotion: 'no-preference',
      },
    },
    // Add more browser/theme combinations...
  ],
};
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run theme tests
npm run test:theme

# Run accessibility tests
npm run test:accessibility

# Run with UI
npm run test:ui

# Run in debug mode
npm run test:debug

# Run with browser visible
npm run test:headed
```

### Theme Testing

```bash
# Run single theme test
npm run test:theme:single

# Run full test matrix
npm run test:theme:matrix

# Run in CI mode
npm run test:theme:ci

# Run specific browser/theme combination
npm run test:theme -- --browser chromium --theme dark
```

### Test Matrix Options

```bash
# Run specific browser
npm run test:theme -- --browser=firefox

# Run specific theme
npm run test:theme -- --theme=high-contrast

# Run with reduced motion
npm run test:theme -- --preferences=reduced-motion

# Combine options
npm run test:theme -- --browser=webkit --theme=dark --preferences=reduced-motion
```

## Environment Setup

### Required Dependencies

```bash
# Install all dependencies
npm install

# Install Playwright browsers
npm run test:install

# Reset test environment
npm run reset-env
```

### Environment Variables

```bash
# CI/CD settings
CI=true                  # Running in CI environment
CI_DEBUG=1              # Enable debug output in CI

# Test configuration
TEST_BROWSER=chromium   # Default browser
TEST_THEME=default      # Default theme
TEST_TIMEOUT=30000      # Test timeout (ms)
TEST_RETRIES=2         # Number of retries

# Report settings
REPORT_DIR=custom/path  # Custom report directory
REPORT_FORMAT=html,json # Report formats
```

## Test Organization

### Directory Structure

```
src/tests/
├── accessibility/       # Accessibility tests
├── config/             # Test configuration
├── helpers/            # Test helpers
├── theme/             # Theme tests
└── utils/             # Test utilities
```

### Test Files

```typescript
// Example theme test
import { test, expect } from '@playwright/test';

test('theme switching', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveCSS(
    'color-scheme',
    'light'
  );
});

// Example accessibility test
test('keyboard navigation', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toBeVisible();
});
```

## Test Helpers

### Theme Test Helpers

```typescript
// src/tests/helpers/themeTestHelpers.ts
export async function switchTheme(page, theme) {
  await page.evaluate((t) => {
    window.themeManager.setTheme(t);
  }, theme);
}

export async function verifyTheme(page, theme) {
  // Theme verification logic
}
```

### Accessibility Test Helpers

```typescript
// src/tests/helpers/accessibilityHelpers.ts
export async function checkA11y(page) {
  const violations = await page.evaluate(() => {
    return window.axe.run();
  });
  expect(violations).toEqual([]);
}
```

## Test Customization

### Custom Matchers

```typescript
// src/tests/matchers/themeMatchers.ts
expect.extend({
  toHaveTheme(received, theme) {
    // Custom theme matcher logic
  },
  toBeAccessible(received) {
    // Custom accessibility matcher logic
  }
});
```

### Custom Fixtures

```typescript
// src/tests/fixtures/themeFixtures.ts
const test = base.extend({
  themeManager: async ({ page }, use) => {
    // Theme manager fixture logic
    await use(themeManager);
  }
});
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
        theme: [default, dark, high-contrast]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:theme:ci
```

### Local CI Testing

```bash
# Test CI workflow locally
act -j test

# Test specific matrix combination
act -j test -P ubuntu-latest=nektos/act-environments-ubuntu:18.04

# Test with artifacts
act -j test --artifact-server-path ./artifacts
```

## Performance Optimization

### Parallel Execution

```typescript
// playwright.config.ts
export default {
  workers: 4,           // Number of parallel workers
  fullyParallel: true, // Run tests in parallel
  retries: 2,          // Number of retries
  timeout: 30000,      // Global timeout
};
```

### Resource Management

```typescript
// Global setup
async function globalSetup() {
  // Clean old test results
  await cleanOldResults();
  
  // Set up shared resources
  await setupSharedResources();
}

// Global teardown
async function globalTeardown() {
  // Clean up resources
  await cleanupResources();
  
  // Generate reports
  await generateReports();
}
```

## Troubleshooting

### Common Issues

1. **Tests Failing in CI**
   ```bash
   # Run with debug output
   npm run test:theme:ci -- --debug
   ```

2. **Browser Launch Issues**
   ```bash
   # Reinstall browsers
   npm run test:install -- --force
   ```

3. **Theme Switch Failures**
   ```bash
   # Run single test with tracing
   npm run test:theme -- --trace on
   ```

4. **Performance Issues**
   ```bash
   # Run with performance profiling
   npm run test:theme -- --prof
   ```

### Debug Tools

```bash
# Enable Playwright Inspector
PWDEBUG=1 npm run test:theme

# Enable verbose logging
DEBUG=pw:* npm run test:theme

# Save trace for failing tests
npm run test:theme -- --trace on-first-retry
```

## Best Practices

1. **Test Organization**
   - Group related tests
   - Use descriptive names
   - Keep tests focused
   - Follow AAA pattern

2. **Test Stability**
   - Add proper waits
   - Handle async properly
   - Add retry logic
   - Clean up resources

3. **Test Maintenance**
   - Use page objects
   - Share test helpers
   - Document fixtures
   - Keep tests independent

4. **Performance**
   - Run in parallel
   - Optimize resources
   - Cache when possible
   - Clean up regularly
