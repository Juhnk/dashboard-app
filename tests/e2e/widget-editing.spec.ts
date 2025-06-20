import { test, expect } from '@playwright/test';

test.describe('Widget Editing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should open widget editor when edit button is clicked', async ({ page }) => {
    // Create a widget first if none exist
    const existingWidgets = page.locator('[data-testid="widget-card"]');
    if (await existingWidgets.count() === 0) {
      const addWidgetButton = page.locator('button', { hasText: /add.*widget/i }).first();
      await addWidgetButton.click();
      await page.locator('button', { hasText: /line.*chart/i }).click();
    }
    
    // Find and click edit button on a widget
    const widget = page.locator('[data-testid="widget-card"]').first();
    await widget.hover();
    
    const editButton = widget.locator('button[title*="edit" i]');
    await editButton.click();
    
    // Verify editor panel opens
    const editorPanel = page.locator('[data-testid="widget-editor"]');
    await expect(editorPanel).toBeVisible();
  });

  test('should show editing indicator when widget is selected', async ({ page }) => {
    // Create and select a widget
    const addWidgetButton = page.locator('button', { hasText: /add.*widget/i }).first();
    await addWidgetButton.click();
    await page.locator('button', { hasText: /line.*chart/i }).click();
    
    const widget = page.locator('[data-testid="widget-card"]').last();
    await widget.hover();
    
    const editButton = widget.locator('button[title*="edit" i]');
    await editButton.click();
    
    // Widget should show editing state
    await expect(widget).toHaveClass(/selected|editing/);
    
    // Look for editing indicator
    const editingIndicator = widget.locator('text=Editing');
    await expect(editingIndicator).toBeVisible();
  });

  test('should be able to change widget configuration', async ({ page }) => {
    // Create a line chart widget
    const addWidgetButton = page.locator('button', { hasText: /add.*widget/i }).first();
    await addWidgetButton.click();
    await page.locator('button', { hasText: /line.*chart/i }).click();
    
    const widget = page.locator('[data-testid="widget-card"]').last();
    await widget.hover();
    
    const editButton = widget.locator('button[title*="edit" i]');
    await editButton.click();
    
    // Editor panel should be visible
    const editorPanel = page.locator('[data-testid="widget-editor"]');
    await expect(editorPanel).toBeVisible();
    
    // Try to change metrics or dimensions if controls are available
    const metricsSelector = editorPanel.locator('[data-testid="metrics-selector"]');
    if (await metricsSelector.isVisible()) {
      await metricsSelector.click();
      
      // Select a different metric
      const metricOption = page.locator('text=revenue').first();
      if (await metricOption.isVisible()) {
        await metricOption.click();
      }
    }
    
    // Widget should show live preview of changes
    const chartWrapper = widget.locator('[data-testid="chart-wrapper"]');
    await expect(chartWrapper).toBeVisible();
  });

  test('should be able to delete widget', async ({ page }) => {
    // Create a widget
    const addWidgetButton = page.locator('button', { hasText: /add.*widget/i }).first();
    await addWidgetButton.click();
    await page.locator('button', { hasText: /line.*chart/i }).click();
    
    const initialWidgetCount = await page.locator('[data-testid="widget-card"]').count();
    
    const widget = page.locator('[data-testid="widget-card"]').last();
    await widget.hover();
    
    // Click delete button
    const deleteButton = widget.locator('button[title*="delete" i]');
    await deleteButton.click();
    
    // Confirm deletion if there's a confirmation dialog
    const confirmButton = page.locator('button', { hasText: /confirm|delete|yes/i });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
    
    // Widget should be removed
    const finalWidgetCount = await page.locator('[data-testid="widget-card"]').count();
    expect(finalWidgetCount).toBe(initialWidgetCount - 1);
  });

  test('should save widget changes', async ({ page }) => {
    // Create and edit a widget
    const addWidgetButton = page.locator('button', { hasText: /add.*widget/i }).first();
    await addWidgetButton.click();
    await page.locator('button', { hasText: /line.*chart/i }).click();
    
    const widget = page.locator('[data-testid="widget-card"]').last();
    await widget.hover();
    
    const editButton = widget.locator('button[title*="edit" i]');
    await editButton.click();
    
    // Make changes and save
    const saveButton = page.locator('button', { hasText: /save/i });
    if (await saveButton.isVisible()) {
      await saveButton.click();
      
      // Editor should close
      const editorPanel = page.locator('[data-testid="widget-editor"]');
      await expect(editorPanel).not.toBeVisible();
      
      // Widget should no longer show editing state
      await expect(widget).not.toHaveClass(/selected|editing/);
    }
  });
});