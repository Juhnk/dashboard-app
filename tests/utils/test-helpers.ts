import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard');
  }

  async addWidget(type: 'line_chart' | 'bar_chart' | 'pie_chart' | 'metric_card') {
    const addButton = this.page.locator('button', { hasText: /add.*widget/i }).first();
    await addButton.click();
    
    const typeButton = this.page.locator('button', { hasText: new RegExp(type.replace('_', '.*'), 'i') });
    await typeButton.click();
    
    // Wait for widget to be created
    await this.page.waitForSelector('[data-testid="widget-card"]', { state: 'visible' });
  }

  async getWidgets(): Promise<Locator> {
    return this.page.locator('[data-testid="widget-card"]');
  }

  async editWidget(index: number = 0) {
    const widget = this.page.locator('[data-testid="widget-card"]').nth(index);
    await widget.hover();
    
    const editButton = widget.locator('button[title*="edit" i]');
    await editButton.click();
    
    return widget;
  }

  async deleteWidget(index: number = 0) {
    const widget = this.page.locator('[data-testid="widget-card"]').nth(index);
    await widget.hover();
    
    const deleteButton = widget.locator('button[title*="delete" i]');
    await deleteButton.click();
    
    // Handle confirmation if present
    const confirmButton = this.page.locator('button', { hasText: /confirm|delete|yes/i });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
  }

  async waitForChartToRender(widgetIndex: number = 0) {
    const widget = this.page.locator('[data-testid="widget-card"]').nth(widgetIndex);
    const chartSvg = widget.locator('svg');
    await expect(chartSvg).toBeVisible();
    
    // Wait for chart content to load
    await this.page.waitForTimeout(1000);
  }
}

export class WidgetEditor {
  constructor(private page: Page) {}

  async isVisible(): Promise<boolean> {
    const editor = this.page.locator('[data-testid="widget-editor"]');
    return await editor.isVisible();
  }

  async changeMetric(metric: string) {
    const metricsSelector = this.page.locator('[data-testid="metrics-selector"]');
    if (await metricsSelector.isVisible()) {
      await metricsSelector.click();
      await this.page.locator(`text=${metric}`).click();
    }
  }

  async changeDimension(dimension: string) {
    const dimensionSelector = this.page.locator('[data-testid="dimension-selector"]');
    if (await dimensionSelector.isVisible()) {
      await dimensionSelector.click();
      await this.page.locator(`text=${dimension}`).click();
    }
  }

  async save() {
    const saveButton = this.page.locator('button', { hasText: /save/i });
    if (await saveButton.isVisible()) {
      await saveButton.click();
    }
  }

  async close() {
    const closeButton = this.page.locator('button[aria-label*="close" i]');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }
}

export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
}

export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ 
    path: `test-results/${name}-${Date.now()}.png`,
    fullPage: true 
  });
}

export async function mockApiResponse(page: Page, endpoint: string, response: any) {
  await page.route(`**${endpoint}`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });
}

export async function assertChartHasData(page: Page, widgetSelector: string) {
  const widget = page.locator(widgetSelector);
  const chartSvg = widget.locator('svg');
  
  await expect(chartSvg).toBeVisible();
  
  // Check for chart elements indicating data is present
  const chartElements = chartSvg.locator('.recharts-line, .recharts-bar, .recharts-area');
  await expect(chartElements.first()).toBeVisible();
}