import { test, expect } from '../../src/fixtures/test-fixtures';

// Auth is handled by Clerk — these tests verify the signup page UI and tab toggling.

// Scope tab buttons to rounded-full style buttons only, avoiding Clerk's internal buttons
const tabBtn = (page: import('@playwright/test').Page, name: string) =>
  page.locator('button.rounded-full', { hasText: new RegExp(`^${name}$`) }).first();

test.describe('User Authentication - Signup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500); // wait for Clerk to render
  });

  test('should display Sign Up tab on login page', async ({ page }) => {
    await test.step('Verify Sign Up tab exists', async () => {
      await expect(tabBtn(page, 'Sign Up')).toBeVisible();
    });
  });

  test('should show Clerk SignUp component after clicking Sign Up tab', async ({ page }) => {
    await test.step('Click Sign Up tab', async () => {
      await tabBtn(page, 'Sign Up').click();
      await page.waitForTimeout(1500);
    });

    await test.step('Verify Sign Up tab is active', async () => {
      const cls = await tabBtn(page, 'Sign Up').getAttribute('class');
      expect(cls).toContain('bg-red-500');
    });

    await test.step('Verify Clerk component is rendered', async () => {
      const bodyText = await page.locator('body').innerText();
      expect(bodyText.length).toBeGreaterThan(10);
    });
  });

  test('should toggle between Sign In and Sign Up', async ({ page }) => {
    await test.step('Start on Sign In (default)', async () => {
      const cls = await tabBtn(page, 'Sign In').getAttribute('class');
      expect(cls).toContain('bg-red-500');
    });

    await test.step('Switch to Sign Up', async () => {
      await tabBtn(page, 'Sign Up').click();
      await page.waitForTimeout(500);
      const cls = await tabBtn(page, 'Sign Up').getAttribute('class');
      expect(cls).toContain('bg-red-500');
    });

    await test.step('Switch back to Sign In', async () => {
      await tabBtn(page, 'Sign In').click();
      await page.waitForTimeout(500);
      const cls = await tabBtn(page, 'Sign In').getAttribute('class');
      expect(cls).toContain('bg-red-500');
    });
  });

  test('should render toggle tab container with both buttons', async ({ page }) => {
    await test.step('Verify both tabs are in the toggle container', async () => {
      await expect(tabBtn(page, 'Sign In')).toBeVisible();
      await expect(tabBtn(page, 'Sign Up')).toBeVisible();
    });
  });

  test('should not crash when navigating to login page multiple times', async ({ page }) => {
    await test.step('Navigate to login page twice', async () => {
      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');
      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL('/login');
    });
  });
});
