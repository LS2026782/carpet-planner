# Performance Tuning Guide

This guide covers strategies and best practices for optimizing test performance.

## Test Execution Optimization

### Parallel Execution

```typescript
// playwright.config.ts
export default {
  // Run tests in parallel
  workers: process.env.CI ? 4 : undefined,
  fullyParallel: true,

  // Optimize test retry strategy
  retries: process.env.CI ? 2 : 0,
  maxFailures: process.env.CI ? 10 : 1,

  // Adjust timeouts
  timeout: 30000,
  globalTimeout: process.env.CI ? 3600000 : undefined,
  expect: { timeout: 5000 },
};
```

### Test Sharding

```bash
# Run tests across multiple machines
npm run test -- --shard=1/3  # Machine 1
npm run test -- --shard=2/3  # Machine 2
npm run test -- --shard=3/3  # Machine 3
```

### Resource Management

```typescript
// Global setup for efficient resource usage
async function globalSetup() {
  // Clean old artifacts
  await cleanOldArtifacts();

  // Warm up browser cache
  await warmupBrowserCache();

  // Initialize shared resources
  await initializeSharedResources();
}

// Clean up resources efficiently
async function globalTeardown() {
  // Clean up in parallel
  await Promise.all([
    cleanupBrowserCache(),
    cleanupTestArtifacts(),
    shutdownSharedResources()
  ]);
}
```

## Browser Optimization

### Browser Context Reuse

```typescript
// src/tests/helpers/browserHelpers.ts
let browserContext: BrowserContext;

async function getSharedContext(browser: Browser) {
  if (!browserContext) {
    browserContext = await browser.newContext({
      // Optimize context settings
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
      bypassCSP: true,
      ignoreHTTPSErrors: true,
      
      // Cache optimization
      serviceWorkers: 'block',
      offline: false,
      
      // Resource optimization
      javaScriptEnabled: true,
      hasTouch: false,
    });
  }
  return browserContext;
}
```

### Resource Control

```typescript
// Optimize resource loading
const context = await browser.newContext({
  // Block unnecessary resources
  blockedResources: ['image', 'font', 'media'],
  
  // Intercept network requests
  routePatterns: ['**/*'],
  routeHandler: async (route) => {
    // Cache responses
    // Modify requests
    // Block analytics
  }
});
```

## Test Data Management

### Efficient Data Setup

```typescript
// src/tests/helpers/dataHelpers.ts
const dataCache = new Map();

async function getTestData(key: string) {
  if (!dataCache.has(key)) {
    // Load and cache data
    const data = await loadTestData(key);
    dataCache.set(key, data);
  }
  return dataCache.get(key);
}

// Clean up efficiently
afterAll(async () => {
  dataCache.clear();
});
```

### State Management

```typescript
// src/tests/helpers/stateHelpers.ts
class TestState {
  private static instance: TestState;
  private state = new Map();

  static getInstance() {
    if (!TestState.instance) {
      TestState.instance = new TestState();
    }
    return TestState.instance;
  }

  async getState(key: string) {
    if (!this.state.has(key)) {
      // Initialize state
      await this.initializeState(key);
    }
    return this.state.get(key);
  }
}
```

## Memory Management

### Memory Monitoring

```typescript
// src/tests/helpers/memoryHelpers.ts
async function monitorMemory(page: Page) {
  return await page.evaluate(() => {
    const memory = performance.memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    };
  });
}

// Monitor memory usage
test('memory intensive test', async ({ page }) => {
  const startMemory = await monitorMemory(page);
  // ... test code ...
  const endMemory = await monitorMemory(page);
  
  // Check memory growth
  expect(endMemory.usedJSHeapSize - startMemory.usedJSHeapSize)
    .toBeLessThan(50 * 1024 * 1024); // 50MB limit
});
```

### Memory Cleanup

```typescript
// Clean up after each test
afterEach(async () => {
  // Clear browser cache
  await context.clearCookies();
  
  // Clear localStorage
  await page.evaluate(() => localStorage.clear());
  
  // Clear sessionStorage
  await page.evaluate(() => sessionStorage.clear());
  
  // Run garbage collection
  await page.evaluate(() => {
    if (window.gc) window.gc();
  });
});
```

## Network Optimization

### Request Caching

```typescript
// src/tests/helpers/networkHelpers.ts
const responseCache = new Map();

async function setupNetworkCaching(page: Page) {
  await page.route('**/*', async route => {
    const request = route.request();
    const url = request.url();
    
    // Check cache
    if (responseCache.has(url)) {
      await route.fulfill(responseCache.get(url));
      return;
    }
    
    // Cache response
    const response = await route.fetch();
    responseCache.set(url, {
      status: response.status(),
      headers: response.headers(),
      body: await response.body()
    });
    
    await route.fulfill(responseCache.get(url));
  });
}
```

### Request Mocking

```typescript
// Mock expensive network requests
async function setupNetworkMocks(page: Page) {
  await page.route('**/api/**', async route => {
    const request = route.request();
    
    // Mock based on request
    switch (request.url()) {
      case '/api/expensive-data':
        await route.fulfill({
          status: 200,
          body: JSON.stringify(mockData)
        });
        break;
      default:
        await route.continue();
    }
  });
}
```

## Visual Testing Optimization

### Screenshot Optimization

```typescript
// Optimize screenshot capture
async function optimizedScreenshot(page: Page) {
  return await page.screenshot({
    // Reduce file size
    quality: 80,
    type: 'jpeg',
    
    // Capture only needed area
    clip: {
      x: 0,
      y: 0,
      width: 1280,
      height: 720
    },
    
    // Optimize for comparison
    omitBackground: true,
    animations: 'disabled',
  });
}
```

### Visual Comparison

```typescript
// Efficient visual comparison
async function compareScreenshots(
  actual: Buffer,
  expected: Buffer,
  threshold = 0.1
) {
  // Use pixelmatch for fast comparison
  const diff = await pixelmatch(
    actual,
    expected,
    null,
    1280,
    720,
    { threshold }
  );
  
  return diff / (1280 * 720) < threshold;
}
```

## CI/CD Optimization

### Caching Strategy

```yaml
# .github/workflows/test.yml
jobs:
  test:
    steps:
      - uses: actions/cache@v3
        with:
          path: |
            ~/.npm
            node_modules
            playwright-cache
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-
```

### Resource Allocation

```yaml
jobs:
  test:
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - run: npm test -- --shard=${{ matrix.shard }}/4
```

## Monitoring and Analysis

### Performance Metrics

```typescript
// src/tests/helpers/metricsHelpers.ts
interface TestMetrics {
  duration: number;
  memory: {
    before: MemoryInfo;
    after: MemoryInfo;
  };
  network: {
    requests: number;
    bytes: number;
  };
}

async function collectMetrics(
  page: Page,
  testFn: () => Promise<void>
): Promise<TestMetrics> {
  const start = Date.now();
  const startMemory = await monitorMemory(page);
  
  // Run test
  await testFn();
  
  const endMemory = await monitorMemory(page);
  const duration = Date.now() - start;
  
  return {
    duration,
    memory: {
      before: startMemory,
      after: endMemory
    },
    network: await getNetworkMetrics(page)
  };
}
```

### Performance Reports

```typescript
// Generate performance report
async function generatePerformanceReport(metrics: TestMetrics[]) {
  const report = {
    summary: {
      totalDuration: sum(metrics.map(m => m.duration)),
      averageDuration: average(metrics.map(m => m.duration)),
      totalMemory: sum(metrics.map(m => m.memory.after.usedJSHeapSize)),
      totalNetwork: sum(metrics.map(m => m.network.bytes))
    },
    tests: metrics.map(m => ({
      duration: m.duration,
      memoryGrowth: m.memory.after.usedJSHeapSize - m.memory.before.usedJSHeapSize,
      networkBytes: m.network.bytes
    }))
  };
  
  await writeReport(report);
}
```

## Best Practices

1. **Resource Management**
   - Reuse browser contexts
   - Cache test data
   - Clean up resources
   - Monitor memory usage

2. **Network Optimization**
   - Cache network requests
   - Mock expensive calls
   - Minimize payload size
   - Use request interception

3. **Test Organization**
   - Group related tests
   - Share setup code
   - Parallelize execution
   - Use test sharding

4. **CI/CD Optimization**
   - Implement caching
   - Use matrix builds
   - Optimize resource usage
   - Monitor performance
