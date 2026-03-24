import { test, expect } from '../../src/fixtures/test-fixtures';

// NOTE: Product detail pages require Clerk auth — unauthenticated access redirects to /login.
// Tests that need product page content verify the login redirect instead.

test.describe('Product Browsing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  test('should display products on homepage', async ({ page }) => {
    await test.step('Verify products are displayed', async () => {
      const productLinks = page.locator('a[href*="/product/"]');
      await expect(productLinks.first()).toBeVisible();
      const count = await productLinks.count();
      expect(count).toBeGreaterThan(0);
    });

    await test.step('Verify each product card has image, name and price', async () => {
      const firstCard = page.locator('div.group').filter({ has: page.locator('a[href*="/product/"]') }).first();
      await expect(firstCard.locator('img').first()).toBeVisible();
      // price like $50
      const price = firstCard.locator('span', { hasText: /^\$\d+/ }).first();
      await expect(price).toBeVisible();
    });
  });

  test('should redirect to login when navigating to product detail page', async ({ page }) => {
    await test.step('Click on first product link', async () => {
      const firstLink = page.locator('a[href*="/product/"]').first();
      const href = await firstLink.getAttribute('href');
      await page.goto(href!);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1500);
    });

    await test.step('Verify redirected to login', async () => {
      await expect(page).toHaveURL('/login');
    });
  });

  test('should navigate to mens category', async ({ page }) => {
    await test.step('Click Men nav link', async () => {
      await page.locator('a[href="/mens"]').first().click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1500);
    });

    await test.step('Verify mens category page has products', async () => {
      await expect(page).toHaveURL('/mens');
      const productLinks = page.locator('a[href*="/product/"]');
      expect(await productLinks.count()).toBeGreaterThan(0);
    });
  });

  test('should navigate to womens category', async ({ page }) => {
    await test.step('Click Women nav link', async () => {
      await page.locator('a[href="/womens"]').first().click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1500);
    });

    await test.step('Verify womens category page has products', async () => {
      await expect(page).toHaveURL('/womens');
      const productLinks = page.locator('a[href*="/product/"]');
      expect(await productLinks.count()).toBeGreaterThan(0);
    });
  });

  test('should navigate to kids category', async ({ page }) => {
    await test.step('Click Kids nav link', async () => {
      await page.locator('a[href="/kids"]').first().click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1500);
    });

    await test.step('Verify kids category page has products', async () => {
      await expect(page).toHaveURL('/kids');
      const productLinks = page.locator('a[href*="/product/"]');
      expect(await productLinks.count()).toBeGreaterThan(0);
    });
  });

  test('should display product cards with Add to Cart button', async ({ page }) => {
    const addBtn = page.locator('button', { hasText: '+ Add to Cart' }).first();
    await expect(addBtn).toBeVisible();
  });

  test('should display new collections heading on homepage', async ({ page }) => {
    await test.step('Verify new collections heading is visible', async () => {
      const heading = page.locator('h1, h2, h3').filter({ hasText: /new collections/i }).first();
      await expect(heading).toBeVisible();
    });
  });

  test('should display product images on homepage', async ({ page }) => {
    const firstCard = page.locator('div.group').filter({ has: page.locator('a[href*="/product/"]') }).first();
    const img = firstCard.locator('img').first();
    await expect(img).toBeVisible();
    const src = await img.getAttribute('src');
    expect(src).toBeTruthy();
  });

  test('should display product prices on homepage', async ({ page }) => {
    const priceSpan = page.locator('div.group span', { hasText: /^\$\d+/ }).first();
    await expect(priceSpan).toBeVisible();
  });

  test('should display navbar with category links', async ({ page }) => {
    await expect(page.locator('a[href="/mens"]').first()).toBeVisible();
    await expect(page.locator('a[href="/womens"]').first()).toBeVisible();
    await expect(page.locator('a[href="/kids"]').first()).toBeVisible();
  });

  test('should display cart icon in navbar', async ({ page }) => {
    const cartLink = page.locator('a[href="/cart"]');
    await expect(cartLink).toBeVisible();
  });

  test('should display Login button in navbar', async ({ page }) => {
    const loginBtn = page.locator('button', { hasText: 'Login' }).first();
    await expect(loginBtn).toBeVisible();
  });
});
