import { test, expect } from '@playwright/test';

test.describe('Chart Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('line chart should render with demo data', async ({ page }) => {
    // Look for existing line chart widget or create one
    let lineChartWidget = page.locator('[data-testid="widget-card"]').filter({ hasText: /line.*chart/i });
    
    if (await lineChartWidget.count() === 0) {
      // Create a new line chart widget
      const addWidgetButton = page.locator('button', { hasText: /add.*widget/i }).first();
      await addWidgetButton.click();
      
      // Select line chart option
      await page.locator('button', { hasText: /line.*chart/i }).click();
      
      // Wait for widget to be created
      lineChartWidget = page.locator('[data-testid="widget-card"]').filter({ hasText: /line.*chart/i });
    }
    
    await expect(lineChartWidget).toBeVisible();
    
    // Check that chart content is rendered (not empty)
    const chartWrapper = lineChartWidget.locator('[data-testid="chart-wrapper"]');
    await expect(chartWrapper).toBeVisible();
    
    // Chart should have some height (not collapsed)
    const chartElement = chartWrapper.locator('.recharts-wrapper');
    await expect(chartElement).toBeVisible();
    
    // Check for chart elements (SVG content)
    const chartSvg = chartElement.locator('svg');
    await expect(chartSvg).toBeVisible();
    
    // Verify chart has actual content (lines, axes)
    const chartLines = chartSvg.locator('.recharts-line');
    await expect(chartLines.first()).toBeVisible();
    
    const xAxis = chartSvg.locator('.recharts-xAxis');
    await expect(xAxis).toBeVisible();
    
    const yAxis = chartSvg.locator('.recharts-yAxis');
    await expect(yAxis).toBeVisible();
  });

  test('bar chart should render correctly', async ({ page }) => {
    // Similar test for bar chart
    let barChartWidget = page.locator('[data-testid="widget-card"]').filter({ hasText: /bar.*chart/i });
    
    if (await barChartWidget.count() === 0) {
      const addWidgetButton = page.locator('button', { hasText: /add.*widget/i }).first();
      await addWidgetButton.click();
      
      await page.locator('button', { hasText: /bar.*chart/i }).click();
      barChartWidget = page.locator('[data-testid="widget-card"]').filter({ hasText: /bar.*chart/i });
    }
    
    await expect(barChartWidget).toBeVisible();
    
    const chartWrapper = barChartWidget.locator('[data-testid="chart-wrapper"]');
    await expect(chartWrapper).toBeVisible();
    
    const chartSvg = chartWrapper.locator('svg');
    await expect(chartSvg).toBeVisible();
    
    // Check for bar chart specific elements
    const bars = chartSvg.locator('.recharts-bar');
    await expect(bars.first()).toBeVisible();
  });

  test('metric card should display values', async ({ page }) => {
    let metricCardWidget = page.locator('[data-testid="widget-card"]').filter({ hasText: /metric.*card/i });
    
    if (await metricCardWidget.count() === 0) {
      const addWidgetButton = page.locator('button', { hasText: /add.*widget/i }).first();
      await addWidgetButton.click();
      
      await page.locator('button', { hasText: /metric.*card/i }).click();
      metricCardWidget = page.locator('[data-testid="widget-card"]').filter({ hasText: /metric.*card/i });
    }
    
    await expect(metricCardWidget).toBeVisible();
    
    // Metric card should display a number value
    const metricValue = metricCardWidget.locator('[data-testid="metric-value"]');
    await expect(metricValue).toBeVisible();
    await expect(metricValue).not.toHaveText('');
  });

  test('charts should be responsive', async ({ page }) => {
    // Create a line chart for responsive testing
    const addWidgetButton = page.locator('button', { hasText: /add.*widget/i }).first();
    await addWidgetButton.click();
    await page.locator('button', { hasText: /line.*chart/i }).click();
    
    const chartWidget = page.locator('[data-testid="widget-card"]').last();
    const chartWrapper = chartWidget.locator('[data-testid="chart-wrapper"]');
    
    // Test desktop size
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(chartWrapper).toBeVisible();
    
    // Test tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(chartWrapper).toBeVisible();
    
    // Test mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(chartWrapper).toBeVisible();
  });
});