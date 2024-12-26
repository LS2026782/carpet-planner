# Troubleshooting Guide

This guide covers common issues and solutions for theme and accessibility testing.

## Theme Testing Issues

### Test Matrix Failures

1. **Browser-specific failures**
   ```
   Error: Test failed in chromium but passed in firefox
   ```
   - Check browser-specific CSS properties
   - Verify vendor prefixes
   - Check feature support in different browsers
   - Use appropriate polyfills

2. **Theme switching issues**
   ```
   Error: Theme not applied immediately
   ```
   - Verify CSS variables are properly set
   - Check for race conditions in theme application
   - Ensure DOM updates are completed
   - Add appropriate transition delays

3. **System preference detection**
   ```
   Error: System preferences not detected
   ```
   - Check media query support
   - Verify preference detection timing
   - Ensure correct preference mapping
   - Add fallback preferences

### Test Performance Issues

1. **Slow test execution**
   ```
   Warning: Tests taking longer than 30s
   ```
   - Reduce unnecessary browser launches
   - Use test parallelization
   - Optimize resource loading
   - Cache theme changes

2. **Memory leaks**
   ```
   Error: Browser process using excessive memory
   ```
   - Clean up theme listeners
   - Remove unused style elements
   - Clear theme cache periodically
   - Dispose of unused resources

3. **Resource contention**
   ```
   Error: Tests timing out due to resource limits
   ```
   - Reduce concurrent browser instances
   - Optimize resource allocation
   - Use appropriate CI/CD resources
   - Add proper cleanup steps

## Accessibility Testing Issues

### Screen Reader Testing

1. **Announcement timing**
   ```
   Error: Screen reader announcement not detected
   ```
   - Add appropriate delays
   - Check aria-live region setup
   - Verify announcement priority
   - Test with multiple screen readers

2. **Focus management**
   ```
   Error: Focus not moving to expected element
   ```
   - Check focus trap implementation
   - Verify focus order logic
   - Test modal focus handling
   - Add focus debugging

3. **ARIA attribute issues**
   ```
   Error: Invalid ARIA attribute combination
   ```
   - Validate ARIA usage
   - Check attribute conflicts
   - Verify role requirements
   - Use appropriate ARIA patterns

### Keyboard Navigation

1. **Shortcut conflicts**
   ```
   Error: Keyboard shortcut not triggering
   ```
   - Check shortcut registration
   - Verify modifier key handling
   - Test for conflicts
   - Add platform-specific shortcuts

2. **Focus indicators**
   ```
   Error: Focus indicator not visible
   ```
   - Check focus styles
   - Verify contrast ratios
   - Test in high contrast mode
   - Add custom focus indicators

3. **Navigation order**
   ```
   Error: Unexpected tab order
   ```
   - Check tabindex values
   - Verify DOM structure
   - Test dynamic content
   - Add focus debugging

## CI/CD Issues

### GitHub Actions

1. **Workflow failures**
   ```
   Error: Workflow failed to complete
   ```
   - Check resource limits
   - Verify timeout settings
   - Test matrix configuration
   - Add proper error handling

2. **Artifact upload**
   ```
   Error: Failed to upload test artifacts
   ```
   - Check artifact size
   - Verify paths
   - Test compression
   - Add retry logic

3. **Issue creation**
   ```
   Error: Failed to create issue
   ```
   - Check permissions
   - Verify API access
   - Test issue template
   - Add error logging

### Test Reports

1. **Missing results**
   ```
   Error: Test results not found
   ```
   - Check file paths
   - Verify file generation
   - Test file permissions
   - Add file checks

2. **Invalid format**
   ```
   Error: Cannot parse test results
   ```
   - Check JSON format
   - Verify data structure
   - Test file encoding
   - Add validation

3. **Incomplete data**
   ```
   Error: Test summary missing required fields
   ```
   - Check data collection
   - Verify aggregation
   - Test all configurations
   - Add data validation

## Common Solutions

### Environment Setup

1. **Clean environment**
   ```bash
   # Remove test artifacts
   npm run clean
   
   # Clear browser cache
   npm run clear-cache
   
   # Reset test environment
   npm run reset-env
   ```

2. **Debug mode**
   ```bash
   # Run single test in debug mode
   npm run test:theme:debug
   
   # Run with browser visible
   npm run test:theme:headed
   
   # Run with verbose logging
   DEBUG=pw:* npm run test:theme
   ```

3. **CI/CD debug**
   ```bash
   # Run CI workflow locally
   act -j accessibility
   
   # Test matrix locally
   npm run test:theme:matrix
   
   # Generate test report
   npm run test:report
   ```

### Quick Fixes

1. **Theme issues**
   - Clear browser cache
   - Reset theme preferences
   - Reload test environment
   - Check system preferences

2. **Accessibility issues**
   - Reset focus state
   - Clear aria-live regions
   - Reset keyboard handlers
   - Check screen reader mode

3. **Test infrastructure**
   - Update dependencies
   - Clear test results
   - Reset configuration
   - Check resource limits

## Best Practices

1. **Theme Testing**
   - Test all supported themes
   - Verify system preferences
   - Check transition states
   - Test persistence

2. **Accessibility Testing**
   - Test with multiple screen readers
   - Verify keyboard navigation
   - Check color contrast
   - Test focus management

3. **Test Infrastructure**
   - Use appropriate timeouts
   - Add proper cleanup
   - Monitor resource usage
   - Add comprehensive logging

## Getting Help

1. **Documentation**
   - Check troubleshooting guide
   - Review test documentation
   - Check GitHub issues
   - Read error messages

2. **Support**
   - Open GitHub issue
   - Check error logs
   - Provide reproduction
   - Share test results

3. **Contributing**
   - Submit bug fixes
   - Improve documentation
   - Add test cases
   - Share solutions
