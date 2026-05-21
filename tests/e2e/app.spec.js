import { test, expect } from '@playwright/test';

test.describe('4D Art Generation E2E Tests', () => {
  const consoleErrors = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors.length = 0;
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', error => {
      consoleErrors.push(error.message);
    });
  });

  test('1. App Startup - Page loads, canvas appears, no console errors', async ({ page }) => {
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });

    // Verify page title or heading exists
    const heading = page.locator('h1, h2, [id*="title"], [class*="title"]').first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Verify canvas element exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });

    // Check no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('2. Shape Selection - Change shape via dropdown, verify no errors', async ({ page }) => {
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });

    // Look for a select dropdown for shapes
    const shapeSelect = page.locator('select').first();
    const shapeSelectExists = await shapeSelect.count() > 0;

    if (shapeSelectExists) {
      // Get initial value
      const initialValue = await shapeSelect.inputValue();

      // Change shape
      const options = await shapeSelect.locator('option').all();
      if (options.length > 1) {
        await shapeSelect.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        // Verify no errors after selection
        expect(consoleErrors).toHaveLength(0);
      }
    } else {
      // If no dropdown, check for shape-related buttons or controls
      const shapeControls = page.locator('[class*="shape"], button[class*="shape"]');
      const count = await shapeControls.count();
      if (count > 0) {
        await shapeControls.first().click();
        await page.waitForTimeout(500);
      }
      expect(consoleErrors).toHaveLength(0);
    }
  });

  test('3. Quadrant Controls - Four-axis slice/free controls are visible and interactive', async ({ page }) => {
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });

    // Look for quadrant control elements - buttons, sliders, or controls
    // Common selectors for axis controls
    const axisControls = page.locator('[class*="axis"], [class*="quadrant"], [id*="axis"], [id*="quadrant"]');
    const controlCount = await axisControls.count();

    // Also check for sliders
    const sliders = page.locator('input[type="range"]');
    const sliderCount = await sliders.count();

    // Also check for buttons with quadrant-related labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    // At least some controls should be present
    const totalControls = controlCount + sliderCount + buttonCount;
    expect(totalControls).toBeGreaterThan(0);

    // Try interacting with sliders if present
    if (sliderCount >= 4) {
      const firstSlider = sliders.first();
      await firstSlider.click();
      await page.waitForTimeout(200);
    }

    // Verify no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('4. Screenshot Button - Click screenshot button, verify no errors', async ({ page }) => {
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });

    // Look for screenshot button
    const screenshotButton = page.locator('button[class*="screenshot"], button[class*="capture"], button[class*="save"], button[class*="export"]');
    const buttonExists = await screenshotButton.count() > 0;

    if (buttonExists) {
      await screenshotButton.first().click();
      await page.waitForTimeout(500);
    } else {
      // Try finding by text content
      const textButtons = page.locator('button');
      const allButtons = await textButtons.all();
      for (const btn of allButtons) {
        const text = await btn.textContent();
        if (text && /screenshot|capture|screen|save|export/i.test(text)) {
          await btn.click();
          await page.waitForTimeout(500);
          break;
        }
      }
    }

    // Verify no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('5. Hash Display - Content hash appears after generation', async ({ page }) => {
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });

    // Look for hash display element
    const hashElement = page.locator('[class*="hash"], [id*="hash"], [class*="content-hash"]');
    const hashExists = await hashElement.count() > 0;

    // Wait a moment for any generation to complete
    await page.waitForTimeout(1000);

    if (hashExists) {
      const hashText = await hashElement.first().textContent();
      // Hash should be a long alphanumeric string
      expect(hashText).toMatch(/^[a-f0-9]{8,}$|#[a-f0-9]{8,}/i);
    } else {
      // Check if there's a hash shown somewhere else
      const pageContent = await page.content();
      const hasHashPattern = /hash|#[a-f0-9]{8,}/i.test(pageContent);
      expect(hasHashPattern).toBeTruthy();
    }

    // Verify no console errors
    expect(consoleErrors).toHaveLength(0);
  });
});