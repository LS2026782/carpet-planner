# Visual Testing Guide

This guide explains how to perform visual testing for theme and accessibility features.

## Overview

Visual testing ensures UI consistency across:
- Themes (light, dark, high contrast)
- Screen sizes (desktop, tablet, mobile)
- Accessibility modes (reduced motion, high contrast)
- Browser engines (Chromium, Firefox, WebKit)

## Configuration

### Visual Test Config

```typescript
// src/tests/config/visualTestConfig.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  // Screenshot settings
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.1,
      animations: 'disabled'
    }
  },

  // Screenshot storage
  snapshotDir: 'test-results/visual-tests/snapshots',
  outputDir: 'test-results/visual-tests',

  // Test matrix
  projects: [
    // Desktop browsers
    {
      name: 'chromium-desktop',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 }
      }
    },
    {
      name: 'firefox-desktop',
      use: {
        browserName: 'firefox',
        viewport: { width: 1280, height: 720 }
      }
    },
    // Mobile browsers
    {
      name: 'mobile-safari',
      use: {
        browserName: 'webkit',
        ...devices['iPhone 12']
      }
    }
  ]
};
```

## Writing Visual Tests

### Basic Screenshot Test

```typescript
// src/tests/visual/basic.visual.test.ts
import { test, expect } from '@playwright/test';

test('default theme appearance', async ({ page }) => {
  await page.goto('/');
  
  // Wait for animations to complete
  await page.waitForTimeout(1000);
  
  // Take screenshot
  await expect(page).toHaveScreenshot('default-theme.png');
});
```

### Theme Testing

```typescript
// src/tests/visual/themes.visual.test.ts
import { test, expect } from '@playwright/test';
import { switchTheme } from '../helpers/themeHelpers';

test.describe('theme screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('light theme', async ({ page }) => {
    await switchTheme(page, 'light');
    await expect(page).toHaveScreenshot('light-theme.png');
  });

  test('dark theme', async ({ page }) => {
    await switchTheme(page, 'dark');
    await expect(page).toHaveScreenshot('dark-theme.png');
  });

  test('high contrast theme', async ({ page }) => {
    await switchTheme(page, 'high-contrast');
    await expect(page).toHaveScreenshot('high-contrast-theme.png');
  });
});
```

### Component Testing

```typescript
// src/tests/visual/components.visual.test.ts
import { test, expect } from '@playwright/test';

test.describe('component screenshots', () => {
  test('toolbar component', async ({ page }) => {
    await page.goto('/');
    const toolbar = page.locator('.toolbar');
    await expect(toolbar).toHaveScreenshot('toolbar.png');
  });

  test('settings panel', async ({ page }) => {
    await page.goto('/');
    const panel = page.locator('.settings-panel');
    await expect(panel).toHaveScreenshot('settings-panel.png');
  });
});
```

### Responsive Testing

```typescript
// src/tests/visual/responsive.visual.test.ts
import { test, expect } from '@playwright/test';

const viewports = [
  { width: 1920, height: 1080, name: 'desktop' },
  { width: 1024, height: 768, name: 'tablet' },
  { width: 375, height: 812, name: 'mobile' }
];

test.describe('responsive screenshots', () => {
  for (const viewport of viewports) {
    test(`layout at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await expect(page).toHaveScreenshot(
        `layout-${viewport.name}.png`
      );
    });
  }
});
```

## Visual Test Helpers

### Screenshot Helpers

```typescript
// src/tests/helpers/screenshotHelpers.ts
import { Page } from '@playwright/test';

export async function takeScreenshot(
  page: Page,
  name: string,
  options = {}
) {
  const defaultOptions = {
    fullPage: false,
    animations: 'disabled',
    mask: ['.dynamic-content'],
    omitBackground: true,
    timeout: 5000
  };
  
  return await page.screenshot({
    ...defaultOptions,
    ...options,
    path: `test-results/screenshots/${name}.png`
  });
}

export async function compareScreenshots(
  actual: Buffer,
  expected: Buffer,
  options = {}
) {
  const defaultOptions = {
    threshold: 0.1,
    includeAA: false,
    alpha: 0.3
  };
  
  const result = await pixelmatch(
    actual,
    expected,
    null,
    actual.width,
    actual.height,
    { ...defaultOptions, ...options }
  );
  
  return {
    diffPixels: result,
    diffPercentage: (result / (actual.width * actual.height)) * 100
  };
}
```

### Theme Helpers

```typescript
// src/tests/helpers/themeHelpers.ts
import { Page } from '@playwright/test';

export async function setupThemeTest(page: Page, theme: string) {
  // Disable animations
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
      }
    `
  });
  
  // Set theme
  await page.evaluate((t) => {
    window.localStorage.setItem('theme', t);
  }, theme);
}

export async function cleanupThemeTest(page: Page) {
  await page.evaluate(() => {
    window.localStorage.clear();
  });
}
```

## Running Visual Tests

### Basic Commands

```bash
# Run all visual tests
npm run test:visual

# Update baseline screenshots
npm run test:visual -- --update-snapshots

# Run specific test file
npm run test:visual components.visual.test.ts

# Run with specific configuration
npm run test:visual -- --project=chromium-desktop
```

### CI/CD Integration

```yaml
# .github/workflows/visual-tests.yml
jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: Run visual tests
        run: npm run test:visual
        
      - name: Upload snapshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: visual-test-snapshots
          path: test-results/visual-tests
```

## Best Practices

1. **Screenshot Management**
   - Use descriptive names
   - Organize by feature
   - Version control baselines
   - Clean up old snapshots

2. **Test Stability**
   - Disable animations
   - Wait for content
   - Handle dynamic content
   - Set viewport size

3. **Visual Coverage**
   - Test all themes
   - Test responsive layouts
   - Test components
   - Test interactions

4. **Performance**
   - Optimize screenshot size
   - Reuse page context
   - Parallelize tests
   - Clean up resources

## Troubleshooting

### Common Issues

1. **Inconsistent Screenshots**
   ```bash
   # Update baseline with current state
   npm run test:visual -- -u
   ```

2. **Platform Differences**
   ```bash
   # Run with specific OS
   npm run test:visual -- --project=linux-chrome
   ```

3. **Dynamic Content**
   ```bash
   # Mask dynamic elements
   await expect(page).toHaveScreenshot({
     mask: ['.timestamp', '.random-data']
   });
   ```

4. **Animation Issues**
   ```bash
   # Disable animations globally
   await page.addStyleTag({
     content: '* { animation: none !important; }'
   });
   ```

### Debug Tools

```bash
# Show screenshot comparison
npm run test:visual -- --debug

# Save trace for failed tests
npm run test:visual -- --trace on

# Update specific snapshots
npm run test:visual -- -u -g "component name"
```

## Maintenance

### Regular Tasks

1. **Update Baselines**
   - After intentional UI changes
   - When adding new features
   - When changing themes
   - After major updates

2. **Clean Old Screenshots**
   ```bash
   # Remove old screenshots
   npm run clean:screenshots
   
   # Remove failed screenshots
   npm run clean:screenshots:failed
   ```

3. **Review Differences**
   ```bash
   # Generate diff report
   npm run test:visual:report
   
   # Open diff viewer
   npm run test:visual:review
   ```

4. **Monitor Storage**
   ```bash
   # Check snapshot size
   npm run test:visual:size
   
   # Compress screenshots
   npm run test:visual:compress
