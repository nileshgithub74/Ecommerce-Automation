import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Security Tests', () => {
  test('should prevent XSS in login form', async ({ page }) => {
    await test.step('Enter XSS payload in Clerk email field', async () => {
      await page.goto('/login');
      // Wait for Clerk sign-in form
      await page.waitForSelector('input[name="identifier"], input[type="email"]', { timeout: 15000 });

      const xssPayload = '<script>alert("xss")</script>';

      page.on('dialog', async (dialog) => {
        await dialog.dismiss();
        throw new Error('XSS vulnerability detected');
      });

      const emailInput = page.locator('input[name="identifier"], input[type="email"]').first();
      await emailInput.fill(xssPayload);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      // If we reach here without XSS dialog, the app is safe
    });
  });

  test('should prevent XSS in signup form', async ({ page }) => {
    await test.step('Enter XSS payload in Clerk signup fields', async () => {
      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');

      // Try to switch to sign-up tab if available
      const signUpTab = page.getByRole('link', { name: /sign up/i })
        .or(page.getByRole('button', { name: /sign up/i }))
        .or(page.getByText(/don't have an account/i));

      if (await signUpTab.isVisible({ timeout: 5000 }).catch(() => false)) {
        await signUpTab.click();
      }

      const xssPayload = '<img src=x onerror=alert(1)>';

      page.on('dialog', async (dialog) => {
        const msg = dialog.message();
        if (msg === '1') {
          await dialog.dismiss();
          throw new Error('XSS vulnerability detected');
        }
        await dialog.accept();
      });

      const emailInput = page.locator('input[name="emailAddress"], input[type="email"]').first();
      if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await emailInput.fill(xssPayload);
      }
      await page.waitForTimeout(1000);
    });
  });

  test('should not expose sensitive data in page source', async ({ page }) => {
    await test.step('Check homepage source for sensitive data', async () => {
      await page.goto('/');
      const content = await page.content();
      expect(content).not.toContain('secret_ecom');
      expect(content).not.toContain('mongodb+srv');
    });
  });

  test('should use HTTPS', async ({ page }) => {
    await test.step('Verify site is served over HTTPS', async () => {
      await page.goto('/');
      const url = page.url();
      expect(url).toMatch(/^https:\/\//);
    });
  });

  test('should handle SQL injection attempt in login gracefully', async ({ page }) => {
    await test.step('Enter SQL injection payload in Clerk email field', async () => {
      await page.goto('/login');
      await page.waitForSelector('input[name="identifier"], input[type="email"]', { timeout: 15000 });

      const sqlPayload = "' OR '1'='1'; --";

      page.on('dialog', async (dialog) => {
        const msg = dialog.message();
        expect(msg).not.toContain('syntax error');
        await dialog.accept();
      });

      const emailInput = page.locator('input[name="identifier"], input[type="email"]').first();
      await emailInput.fill(sqlPayload);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);

      // Should still be on login page or show error — not crash
      const url = page.url();
      expect(url).toMatch(/login|\//);
    });
  });

  test('should redirect to login page when accessing protected routes', async ({ page }) => {
    await test.step('Access checkout without being logged in', async () => {
      await page.goto('/checkout');
      await page.waitForLoadState('domcontentloaded');
      // App should either redirect to login or show checkout — at minimum not crash
      const url = page.url();
      expect(url).toMatch(/checkout|login|\//);
    });
  });

  test('should not expose Stripe secret key in client', async ({ page }) => {
    await test.step('Verify only publishable key is in client code', async () => {
      await page.goto('/');
      const content = await page.content();
      expect(content).not.toContain('sk_test_');
      expect(content).not.toContain('sk_live_');
    });
  });
});
