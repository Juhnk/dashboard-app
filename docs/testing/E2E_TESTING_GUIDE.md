# End-to-End Testing Guide

This guide covers E2E testing with Playwright for the Mustache Cashstage dashboard application.

## 🎯 Overview

Our E2E tests ensure that critical user workflows function correctly across different browsers and devices. We use Playwright for its cross-browser support and reliable testing capabilities.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Development server running on `localhost:3000`
- Docker services for database (if testing data interactions)

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI mode (interactive)
npm run test:e2e:ui

# Run specific test file
npx playwright test dashboard.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium

# Debug tests
npx playwright test --debug
```

## 📁 Test Structure

```
tests/
├── e2e/
│   ├── dashboard.spec.ts        # Dashboard functionality
│   ├── chart-rendering.spec.ts  # Chart visualization tests
│   ├── widget-editing.spec.ts   # Widget configuration tests
│   └── auth.spec.ts             # Authentication flows
├── fixtures/
│   └── test-data.json           # Test data
├── utils/
│   └── test-helpers.ts          # Shared utilities
└── setup/
    └── global-setup.ts          # Global test setup
```

## 🧪 Writing E2E Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../utils/test-helpers';

test.describe('Dashboard Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should create new widget', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    
    await dashboard.addWidget('line_chart');
    
    const widgets = await dashboard.getWidgets();
    expect(await widgets.count()).toBe(1);
  });
});
```

### Using Page Object Models

```typescript
import { DashboardPage, WidgetEditor } from '../utils/test-helpers';

test('should edit widget configuration', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  const editor = new WidgetEditor(page);
  
  await dashboard.goto();
  await dashboard.addWidget('line_chart');
  await dashboard.editWidget(0);
  
  expect(await editor.isVisible()).toBe(true);
  
  await editor.changeMetric('revenue');
  await editor.save();
  
  expect(await editor.isVisible()).toBe(false);
});
```

## 🎭 Test Data Management

### Using Test Fixtures

```typescript
import testData from '../fixtures/test-data.json';

test('should display sample data correctly', async ({ page }) => {
  // Mock API responses with test data
  await page.route('/api/dashboards', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(testData.dashboards)
    });
  });
  
  await page.goto('/dashboard');
  // Test continues...
});
```

### Environment-Specific Testing

```typescript
test('should connect to staging database', async ({ page }) => {
  // Use environment-specific configuration
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
  await page.goto(baseURL + '/dashboard');
});
```

## 🔧 Configuration

### Browser Configuration

Our Playwright config tests across multiple browsers:
- Chrome/Chromium (desktop)
- Firefox (desktop)
- Safari/WebKit (desktop)
- Mobile Chrome (Android simulation)
- Mobile Safari (iOS simulation)

### Custom Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
```

## 🐛 Debugging Tests

### Visual Debugging

```bash
# Run with UI mode
npm run test:e2e:ui

# Run specific test with debug
npx playwright test dashboard.spec.ts --debug

# Run headed (see browser)
npx playwright test --headed
```

### Screenshots and Videos

```typescript
test('should capture failure state', async ({ page }) => {
  // Tests automatically capture screenshots on failure
  
  // Manual screenshot
  await page.screenshot({ path: 'dashboard-state.png' });
  
  // Full page screenshot
  await page.screenshot({ path: 'full-page.png', fullPage: true });
});
```

### Trace Viewer

```bash
# View traces after test failure
npx playwright show-trace test-results/trace.zip
```

## 📊 Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `test.beforeEach` for setup
- Clean up data between tests

### 2. Reliable Selectors
```typescript
// ✅ Good - use data-testid
await page.locator('[data-testid="widget-card"]')

// ✅ Good - semantic selectors
await page.locator('button', { hasText: 'Add Widget' })

// ❌ Avoid - fragile CSS selectors
await page.locator('.widget-card-123')
```

### 3. Wait Strategies
```typescript
// ✅ Wait for specific condition
await expect(page.locator('[data-testid="chart"]')).toBeVisible();

// ✅ Wait for network requests
await page.waitForResponse('/api/data');

// ❌ Avoid arbitrary timeouts
await page.waitForTimeout(5000);
```

### 4. Error Handling
```typescript
test('should handle API errors gracefully', async ({ page }) => {
  // Mock error response
  await page.route('/api/dashboards', route => 
    route.fulfill({ status: 500 })
  );
  
  await page.goto('/dashboard');
  
  // Verify error state is shown
  await expect(page.locator('text=Error loading data')).toBeVisible();
});
```

## 🔄 CI/CD Integration

E2E tests run automatically on:
- Pull requests (critical paths only)
- Main branch pushes (full suite)
- Nightly (full suite + performance tests)

### GitHub Actions Configuration

```yaml
- name: Run E2E tests
  run: npm run test:e2e
  env:
    PLAYWRIGHT_BASE_URL: http://localhost:3000
```

## 📈 Performance Testing

### Core Web Vitals

```typescript
test('should meet performance budgets', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Measure performance metrics
  const performanceEntries = await page.evaluate(() => {
    return JSON.stringify(performance.getEntriesByType('navigation'));
  });
  
  // Assert performance thresholds
  const metrics = JSON.parse(performanceEntries)[0];
  expect(metrics.loadEventEnd - metrics.loadEventStart).toBeLessThan(3000);
});
```

## 🆘 Troubleshooting

### Common Issues

1. **Flaky Tests**
   - Use proper wait strategies
   - Avoid hardcoded delays
   - Ensure test data isolation

2. **Slow Tests**
   - Run tests in parallel
   - Use efficient selectors
   - Mock external dependencies

3. **Browser Issues**
   - Update Playwright browsers: `npx playwright install`
   - Check browser compatibility
   - Use cross-browser testing

### Getting Help

- Check Playwright documentation: https://playwright.dev
- Review test logs in CI/CD pipeline
- Use trace viewer for detailed debugging
- Ask in team channels for test-specific issues