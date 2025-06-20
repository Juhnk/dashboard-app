import { test, expect } from '@playwright/test';

test.describe('Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should load dashboard page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Dashboard/);
    
    // Check for main dashboard elements
    await expect(page.locator('[data-testid="dashboard-builder"]')).toBeVisible();
  });

  test('should display add widget control', async ({ page }) => {
    // Look for add widget button or control
    const addWidgetButton = page.locator('button', { hasText: /add.*widget/i });
    await expect(addWidgetButton).toBeVisible();
  });

  test('should be able to create a new widget', async ({ page }) => {
    // Click add widget button
    const addWidgetButton = page.locator('button', { hasText: /add.*widget/i }).first();
    await addWidgetButton.click();
    
    // Expect widget configuration modal or panel to appear
    await expect(page.locator('[data-testid="widget-configuration"]')).toBeVisible();
  });

  test('should display existing widgets if any', async ({ page }) => {
    // Check if widgets are rendered
    const widgetCards = page.locator('[data-testid="widget-card"]');
    
    // Either no widgets (empty state) or some widgets should be present
    const widgetCount = await widgetCards.count();
    console.log(`Found ${widgetCount} widgets on dashboard`);
    
    if (widgetCount > 0) {
      // If widgets exist, they should be visible
      await expect(widgetCards.first()).toBeVisible();
    } else {
      // If no widgets, should show empty state
      const emptyState = page.locator('[data-testid="empty-dashboard"]');
      await expect(emptyState).toBeVisible();
    }
  });

  test('should have responsive grid layout', async ({ page }) => {
    // Check that dashboard grid exists
    const dashboardGrid = page.locator('[data-testid="dashboard-grid"]');
    await expect(dashboardGrid).toBeVisible();
    
    // Test different viewport sizes
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(dashboardGrid).toBeVisible();
    
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(dashboardGrid).toBeVisible();
  });
});