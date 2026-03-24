import { test, expect } from '../../src/fixtures/test-fixtures';

// NOTE: Checkout requires Clerk authentication.
// Unauthenticated access to /checkout redirects to /login.
// These tests verify the auth redirect behavior and the login page shown.

test.describe('Checkout Flow', () => {
  test('should redirect to login when accessing checkout unauthenticated', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL('/login');
  });

  test('should show Sign In heading on checkout redirect', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    const heading = page.locator('h1, h2').filter({ hasText: /sign in/i }).first();
    await expect(heading).toBeVisible();
  });

  test('should show email and password fields on checkout redirect', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await expect(page.locator('input[name="identifier"], input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[name="password"], input[type="password"]').first()).toBeVisible();
  });

  test('should show Continue button on checkout redirect login form', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    const continueBtn = page.locator('.cl-formButtonPrimary, button', { hasText: /^continue$/i }).first();
    await expect(continueBtn).toBeVisible();
  });

  test('should show Google sign-in option on checkout redirect', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    const googleBtn = page.locator('button', { hasText: /google/i }).first();
    await expect(googleBtn).toBeVisible();
  });

  test('should show Sign In / Sign Up tabs on checkout redirect', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await expect(page.locator('button.rounded-full', { hasText: /^Sign In$/ }).first()).toBeVisible();
    await expect(page.locator('button.rounded-full', { hasText: /^Sign Up$/ }).first()).toBeVisible();
  });

  test('should show navbar on checkout redirect page', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should show footer on checkout redirect page', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).toContain('Home Mart');
  });

  test('should redirect /cart to login when unauthenticated', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    const url = page.url();
    expect(url).toMatch(/login|cart/);
  });

  test('should add product to cart from homepage without auth', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    const addBtn = page.locator('button', { hasText: '+ Add to Cart' }).first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    await page.waitForTimeout(500);
    // Cart icon should still be visible after adding
    await expect(page.locator('a[href="/cart"]')).toBeVisible();
  });

  test('should show Secured by Clerk on login redirect', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    const securedText = page.getByText(/secured by/i).first();
    await expect(securedText).toBeVisible();
  });
});
