import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Visual Regression Tests @visual', () => {
  test('should match homepage screenshot', async ({ page, homePage }) => {
    await test.step('Navigate to homepage', async () => {
      await page.goto('/');
      await homePage.waitForPageLoad();
    });

    await test.step('Take homepage screenshot', async () => {
      await expect(page).toHaveScreenshot('homepage.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test('should match product page screenshot', async ({ page, homePage, productPage }) => {
    await test.step('Navigate to product page', async () => {
      await page.goto('/');
      await homePage.clickProductByIndex(0);
      await productPage.waitForPageLoad();
    });

    await test.step('Take product page screenshot', async () => {
      await expect(page).toHaveScreenshot('product-page.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test('should match cart page screenshot', async ({ page, homePage, productPage, cartPage }) => {
    await test.step('Add item to cart and navigate to cart', async () => {
      await page.goto('/');
      await homePage.clickProductByIndex(0);
      await productPage.addToCart();
      await page.goto('/');
      await homePage.clickCart();
      await cartPage.waitForPageLoad();
    });

    await test.step('Take cart page screenshot', async () => {
      await expect(page).toHaveScreenshot('cart-page.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test('should match login page screenshot', async ({ page, homePage, loginPage }) => {
    await test.step('Navigate to login page', async () => {
      await page.goto('/');
      await homePage.clickLogin();
      await loginPage.waitForPageLoad();
    });

    await test.step('Take login page screenshot', async () => {
      await expect(page).toHaveScreenshot('login-page.png', {
        animations: 'disabled',
      });
    });
  });

  test('should match mobile homepage screenshot', async ({ page, homePage }) => {
    await test.step('Set mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    await test.step('Navigate to homepage', async () => {
      await page.goto('/');
      await homePage.waitForPageLoad();
    });

    await test.step('Take mobile homepage screenshot', async () => {
      await expect(page).toHaveScreenshot('homepage-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test('should match tablet homepage screenshot', async ({ page, homePage }) => {
    await test.step('Set tablet viewport', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
    });

    await test.step('Navigate to homepage', async () => {
      await page.goto('/');
      await homePage.waitForPageLoad();
    });

    await test.step('Take tablet homepage screenshot', async () => {
      await expect(page).toHaveScreenshot('homepage-tablet.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test('should match error page screenshot', async ({ page }) => {
    await test.step('Navigate to non-existent page', async () => {
      await page.goto('/non-existent-page');
    });

    await test.step('Take error page screenshot', async () => {
      await expect(page).toHaveScreenshot('error-page.png', {
        animations: 'disabled',
      });
    });
  });

  test('should match search results screenshot', async ({ page, homePage }) => {
    await test.step('Perform search', async () => {
      await page.goto('/');
      await homePage.searchForProduct('headphones');
    });

    await test.step('Take search results screenshot', async () => {
      await expect(page).toHaveScreenshot('search-results.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });
});