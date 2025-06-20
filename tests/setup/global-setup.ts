import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Wait for the development server to be ready
  try {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ Development server is ready');
  } catch (error) {
    console.error('❌ Failed to connect to development server:', error);
    throw error;
  }
  
  await browser.close();
}

export default globalSetup;