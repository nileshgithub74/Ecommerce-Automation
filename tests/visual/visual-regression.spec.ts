import { test, expect } from '../../src/fixtures/test-fixtures';

// Visual regression tests — update snapshots with: npx playwright test --update-snapshots
// networkidle replaced with domcontentloaded + timeout (site uses external APIs that never settle)

test.describe('Visual Regression Tests @visual', () => {
  test('should match homepage screenshot', async ({ page }) => {
    await test.step('Navigate to homepage', async () => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
    });

    await test.step('Take homepage screenshot', async () => {
      await expect(page).toHaveScreenshot('homepage.png', {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixelRatio: 0.05,
      });
    });
  });

  test('should match product page screenshot', async ({ page }) => {
    await test.step('Navigate to product page (redirects to login when unauthenticated)', async () => {
      await page.goto('/product/1');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
    });

    await test.step('Take product/login page screenshot', async () => {
      await expect(page).toHaveScreenshot('product-page.png', {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixelRatio: 0.05,
      });
    });
  });

  test('should match cart page screenshot', async ({ page }) => {
    await test.step('Add item to cart and navigate to cart', async () => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      await page.locator('button', { hasText: '+ Add to Cart' }).first().click();
      await page.waitForTimeout(500);
      await page.goto('/cart');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
    });

    await test.step('Take cart page screenshot', async () => {
      await expect(page).toHaveScreenshot('cart-page.png', {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixelRatio: 0.05,
      });
    });
  });

  test('should match login page screenshot', async ({ page }) => {
    await test.step('Navigate to login page', async () => {
      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
    });

    await test.step('Take login page screenshot', async () => {
      await expect(page).toHaveScreenshot('login-page.png', {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixelRatio: 0.05,
      });
    });
  });

  test('should match mens category page screenshot', async ({ page }) => {
    await test.step('Navigate to mens category', async () => {
      await page.goto('/mens');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
    });

    await test.step('Take mens page screenshot', async () => {
      await expect(page).toHaveScreenshot('mens-category.png', {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixelRatio: 0.05,
      });
    });
  });

  test('should match mobile homepage screenshot', async ({ page }) => {
    await test.step('Set mobile viewport and navigate', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
    });

    await test.step('Take mobile homepage screenshot', async () => {
      await expect(page).toHaveScreenshot('homepage-mobile.png', {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixelRatio: 0.05,
      });
    });
  });

  test('should match tablet homepage screenshot', async ({ page }) => {
    await test.step('Set tablet viewport and navigate', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
    });

    await test.step('Take tablet homepage screenshot', async () => {
      await expect(page).toHaveScreenshot('homepage-tablet.png', {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixelRatio: 0.05,
      });
    });
  });

  test('should match checkout page screenshot', async ({ page }) => {
    await test.step('Add item and navigate to checkout', async () => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      await page.locator('button', { hasText: '+ Add to Cart' }).first().click();
      await page.waitForTimeout(500);
      await page.goto('/checkout');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
    });

    await test.step('Take checkout page screenshot', async () => {
      await expect(page).toHaveScreenshot('checkout-page.png', {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixelRatio: 0.05,
      });
    });
  });
});
