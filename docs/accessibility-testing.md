# Accessibility Testing Guide

This document outlines the accessibility testing setup and procedures for the Carpet Planner application.

## Testing Infrastructure

### Tools Used
- **Playwright**: Browser automation
- **axe-core**: Accessibility testing engine
- **NVDA**: Screen reader testing (Windows)
- **VoiceOver**: Screen reader testing (macOS)
- **JAWS**: Screen reader testing (Windows)

### Test Types

1. **Automated Tests**
   - WCAG 2.1 Level AA compliance
   - Color contrast
   - ARIA attributes
   - Keyboard navigation
   - Focus management
   - Screen reader compatibility

2. **Manual Tests**
   - Screen reader user flows
   - Keyboard-only navigation
   - High contrast mode
   - Reduced motion
   - Browser zoom
   - Mobile accessibility

## Running Tests

### Automated Tests

```bash
# Run all accessibility tests
npm run test:accessibility

# Run tests with UI
npm run test:ui

# Run tests in debug mode
npm run test:debug

# Run tests in headed mode
npm run test:headed

# View test reports
npm run test:report
```

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Verify logical focus order
- [ ] Check focus visibility
- [ ] Test modal focus trapping
- [ ] Verify keyboard shortcuts
- [ ] Test canvas grid navigation
- [ ] Check escape key functionality

#### Screen Reader Testing
- [ ] Test with NVDA
- [ ] Test with VoiceOver
- [ ] Test with JAWS
- [ ] Verify announcements
- [ ] Check ARIA live regions
- [ ] Test dynamic content updates
- [ ] Verify error messages

#### Visual Testing
- [ ] Test high contrast mode
- [ ] Check color contrast
- [ ] Verify focus indicators
- [ ] Test responsive layout
- [ ] Check text scaling
- [ ] Verify hover states

#### Canvas Testing
- [ ] Test keyboard grid navigation
- [ ] Verify measurement announcements
- [ ] Check audio feedback
- [ ] Test mode changes
- [ ] Verify tool selection
- [ ] Check error handling

## Test Structure

### Component Tests
```typescript
test.describe('Component Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
        // Test implementation
    });

    test('should have proper ARIA attributes', async ({ page }) => {
        // Test implementation
    });

    test('should announce state changes', async ({ page }) => {
        // Test implementation
    });
});
```

### Integration Tests
```typescript
test.describe('User Flows', () => {
    test('should complete room creation with keyboard', async ({ page }) => {
        // Test implementation
    });

    test('should handle error states accessibly', async ({ page }) => {
        // Test implementation
    });
});
```

## Common Test Patterns

### Testing Focus Management
```typescript
async function testFocusManagement(page: Page) {
    // Focus the element
    await page.focus('#element');

    // Verify focus
    const focused = await page.evaluate(() => 
        document.activeElement?.id === 'element'
    );
    expect(focused).toBe(true);
}
```

### Testing Announcements
```typescript
async function testAnnouncements(page: Page) {
    // Trigger action
    await page.click('#action-button');

    // Verify announcement
    const announcement = await page.evaluate(() =>
        document.querySelector('[aria-live]')?.textContent
    );
    expect(announcement).toContain('Expected message');
}
```

### Testing Keyboard Navigation
```typescript
async function testKeyboardNavigation(page: Page) {
    // Start from a known state
    await page.focus('#start-element');

    // Press Tab
    await page.keyboard.press('Tab');

    // Verify next focused element
    const nextFocused = await page.evaluate(() =>
        document.activeElement?.id
    );
    expect(nextFocused).toBe('expected-next-element');
}
```

## CI/CD Integration

Accessibility tests are automatically run:
1. On push to main branch
2. On pull request to main branch
3. Via manual trigger in GitHub Actions

### GitHub Actions Workflow
```yaml
name: Accessibility Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm run test:accessibility
```

## Test Reports

Test reports are generated in multiple formats:
- HTML report
- JUnit XML
- JSON summary
- Screenshots of failures
- Test traces

Reports are available:
1. In the `test-results` directory
2. As GitHub Actions artifacts
3. Via the `npm run test:report` command

## Best Practices

1. **Test Organization**
   - Group tests by component/feature
   - Include both automated and manual tests
   - Document manual test procedures

2. **Test Coverage**
   - Test all user interactions
   - Include error states
   - Test with different input methods
   - Verify announcements

3. **Maintenance**
   - Update tests when adding features
   - Review failed tests promptly
   - Keep documentation current
   - Monitor accessibility standards

4. **Performance**
   - Run heavy tests in parallel
   - Use test retries judiciously
   - Clean up test artifacts

## Troubleshooting

### Common Issues

1. **Flaky Tests**
   - Add appropriate waits
   - Check for race conditions
   - Verify selectors
   - Add retry logic

2. **Screen Reader Issues**
   - Verify ARIA attributes
   - Check announcement timing
   - Test with multiple screen readers

3. **Focus Management**
   - Check focus order
   - Verify focus trapping
   - Test modal interactions

### Debug Tools

1. **Playwright Tools**
   - Trace Viewer
   - Debug Mode
   - Screenshots
   - Console Logs

2. **Accessibility Tools**
   - axe DevTools
   - WAVE Toolbar
   - Lighthouse
   - Color Contrast Analyzer
