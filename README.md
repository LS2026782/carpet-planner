# Carpet Planner

A web application for planning carpet layouts with comprehensive accessibility features.

## Features

- Interactive carpet layout planning
- Room and door measurements
- Material calculations
- Accessibility support
  - Screen reader compatibility
  - Keyboard navigation
  - High contrast mode
  - Reduced motion support
- Theme customization
- Real-time validation
- Responsive design

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run test:install

# Start development server
npm run dev
```

## Development

### Project Structure

```
carpet-planner/
├── src/
│   ├── components/     # UI components
│   ├── managers/      # Business logic
│   ├── styles/        # CSS styles
│   ├── utils/         # Utilities
│   └── tests/         # Test files
├── docs/             # Documentation
└── scripts/          # Build/test scripts
```

### Available Scripts

```bash
# Development
npm run dev           # Start development server
npm run build         # Build for production
npm run lint          # Run linter
npm run format        # Format code

# Testing
npm test             # Run all tests
npm run test:ui      # Run tests with UI
npm run test:debug   # Run tests in debug mode
npm run test:headed  # Run tests with browser visible

# Theme Testing
npm run test:theme         # Run theme tests
npm run test:theme:debug   # Debug theme tests
npm run test:theme:matrix  # Run full test matrix

# Accessibility Testing
npm run test:accessibility  # Run accessibility tests

# Reports
npm run report        # Generate test report
npm run report:open   # Open test report
npm run report:all    # Generate and open report

# Cleanup
npm run clean         # Clean test artifacts
npm run clean:cache   # Clean cache
npm run clean:all     # Clean everything
npm run reset-env     # Reset test environment
```

## Testing Infrastructure

### Test Configuration

The project uses Playwright for end-to-end testing with a focus on accessibility and theme testing. Configuration files are located in:

- `src/tests/config/themeTestConfig.ts`: Theme test configuration
- `src/tests/config/themeTestSetup.ts`: Global test setup
- `src/tests/config/themeTestTeardown.ts`: Global test teardown

### Test Matrix

Tests run across multiple configurations:

- Browsers: Chrome, Firefox, Safari
- Themes: Default, Dark, High Contrast
- Preferences: Default, Reduced Motion
- Devices: Desktop, Mobile

### Reports

Test results are available in multiple formats:

- HTML Report: Interactive web interface
- Markdown Report: GitHub-compatible format
- JUnit XML: CI/CD integration
- JSON Report: Programmatic analysis

### Documentation

Detailed guides are available in the `docs` directory:

- [Test Configuration Guide](docs/test-configuration.md)
- [Report Formats Guide](docs/report-formats.md)
- [Performance Tuning Guide](docs/performance-tuning.md)
- [Troubleshooting Guide](docs/troubleshooting.md)
- [Accessibility Testing Guide](docs/accessibility-testing.md)
- [Screen Reader Guide](docs/screen-reader-guide.md)
- [Keyboard Shortcuts Guide](docs/keyboard-shortcuts.md)

## Accessibility

The application follows WCAG 2.1 Level AA guidelines and includes:

- ARIA landmarks and labels
- Keyboard navigation
- Screen reader support
- High contrast mode
- Reduced motion support
- Focus management
- Error announcements

### Testing Accessibility

```bash
# Run accessibility tests
npm run test:accessibility

# Run with specific configuration
npm run test:accessibility -- --browser=firefox

# Generate accessibility report
npm run report -- --format=html,markdown
```

## Theme Support

The application includes multiple themes and preferences:

- Light theme (default)
- Dark theme
- High contrast theme
- Reduced motion mode
- System preference detection

### Testing Themes

```bash
# Run theme tests
npm run test:theme

# Test specific theme
npm run test:theme -- --theme=dark

# Run full test matrix
npm run test:theme:matrix
```

## CI/CD Integration

The project uses GitHub Actions for continuous integration:

- Automated testing
- Accessibility checks
- Theme validation
- Performance monitoring
- Report generation
- Issue creation

### Local CI Testing

```bash
# Test CI workflow locally
act -j test

# Test specific configuration
act -j test -P ubuntu-latest=nektos/act-environments-ubuntu:18.04
```

## Performance

The project includes performance optimization features:

- Test parallelization
- Resource caching
- Memory management
- Network optimization
- Visual test optimization

### Monitoring Performance

```bash
# Run with performance monitoring
npm test -- --prof

# Generate performance report
npm run report -- --include-performance
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm test`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
