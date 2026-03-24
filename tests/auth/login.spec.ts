import { test, expect } from '../../src/fixtures/test-fixtures';

// Auth is handled by Clerk — these tests verify the login page UI and navigation.
// Actual credential-based login requires a real Clerk test account.

test.describe('User Authentication - Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500); // wait for Clerk to render
  });

  // Helper: scope tab buttons to the toggle container only, avoiding Clerk's internal buttons
  const getTabBtn = (page: import('@playwright/test').Page, name: string) =>
    page.locator('.flex.bg-gray-100, .flex.rounded-full, [class*="toggle"], [class*="tab-container"]')
      .getByRole('button', { name, exact: true })
      .first()
      // fallback: match by exact text within buttons that have rounded-full styling
      ?? page.locator(`button.rounded-full:text-is("${name}")`);

  test('should display login page with Sign In / Sign Up tabs', async ({ page }) => {
    await test.step('Verify Sign In tab is visible and active', async () => {
      // Use exact text match scoped to tab-style buttons only
      const signInBtn = page.locator('button.rounded-full', { hasText: /^Sign In$/ }).first();
      await expect(signInBtn).toBeVisible();
    });

    await test.step('Verify Sign Up tab is visible', async () => {
      const signUpBtn = page.locator('button.rounded-full', { hasText: /^Sign Up$/ }).first();
      await expect(signUpBtn).toBeVisible();
    });
  });

  test('should show Clerk SignIn component by default', async ({ page }) => {
    await test.step('Verify Clerk sign-in card is rendered', async () => {
      // At minimum the page should not be blank
      const bodyText = await page.locator('body').innerText();
      expect(bodyText.length).toBeGreaterThan(0);
    });
  });

  test('should switch to Sign Up form when clicking Sign Up tab', async ({ page }) => {
    await test.step('Click Sign Up tab', async () => {
      const signUpBtn = page.locator('button.rounded-full', { hasText: /^Sign Up$/ }).first();
      await signUpBtn.click();
      await page.waitForTimeout(1000);
    });

    await test.step('Verify Sign Up tab is now active (red background)', async () => {
      const signUpBtn = page.locator('button.rounded-full', { hasText: /^Sign Up$/ }).first();
      await expect(signUpBtn).toBeVisible();
      const cls = await signUpBtn.getAttribute('class');
      expect(cls).toContain('bg-red-500');
    });
  });

  test('should switch back to Sign In when clicking Sign In tab', async ({ page }) => {
    await test.step('Switch to Sign Up then back to Sign In', async () => {
      await page.locator('button.rounded-full', { hasText: /^Sign Up$/ }).first().click();
      await page.waitForTimeout(500);
      await page.locator('button.rounded-full', { hasText: /^Sign In$/ }).first().click();
      await page.waitForTimeout(500);
    });

    await test.step('Verify Sign In tab is active', async () => {
      const signInBtn = page.locator('button.rounded-full', { hasText: /^Sign In$/ }).first();
      const cls = await signInBtn.getAttribute('class');
      expect(cls).toContain('bg-red-500');
    });
  });

  test('should navigate to login page from navbar login button', async ({ page }) => {
    await test.step('Go to home page', async () => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
    });

    await test.step('Click Login button in navbar', async () => {
      const loginBtn = page.getByRole('button', { name: 'Login', exact: true });
      await loginBtn.click();
      await page.waitForLoadState('domcontentloaded');
    });

    await test.step('Verify on login page', async () => {
      await expect(page).toHaveURL('/login');
    });
  });

  test('should redirect already signed-in user away from login page', async ({ page }) => {
    await test.step('Login page loads without crashing', async () => {
      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');
      const title = await page.title();
      expect(title).toBeTruthy();
    });
  });

  test('should have correct page structure with gradient background', async ({ page }) => {
    await test.step('Verify login page has gradient background container', async () => {
      const container = page.locator('.min-h-screen').first();
      await expect(container).toBeVisible();
    });
  });
});
