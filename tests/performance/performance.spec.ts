import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Performance Tests', () => {
  test('should load homepage within 5 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  test('should load mens category page within 5 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/mens', { waitUntil: 'domcontentloaded' });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  test('should load womens category page within 5 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/womens', { waitUntil: 'domcontentloaded' });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  test('should load kids category page within 5 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/kids', { waitUntil: 'domcontentloaded' });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  test('should load cart page within 5 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  test('should load login page within 5 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  test('should load product page within 5 seconds', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    // Get first product href directly
    const firstLink = page.locator('a[href*="/product/"]').first();
    const href = await firstLink.getAttribute('href');
    const start = Date.now();
    await page.goto(href || '/product/1', { waitUntil: 'domcontentloaded' });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  test('should load product images on homepage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const images = await page.locator('div.group img').all();
    let loadedCount = 0;
    for (const img of images.slice(0, 5)) {
      const naturalWidth = await img.evaluate((el) => (el as HTMLImageElement).naturalWidth).catch(() => 0);
      if (naturalWidth > 0) loadedCount++;
    }
    expect(loadedCount).toBeGreaterThan(0);
  });

  test('should not make excessive network requests on homepage', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (req) => requests.push(req.url()));
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    expect(requests.length).toBeLessThan(150);
  });

  test('should handle slow network gracefully', async ({ page }) => {
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 500 * 1024,
      uploadThroughput: 500 * 1024,
      latency: 400,
    });
    const start = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(15000);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });
  });
});
