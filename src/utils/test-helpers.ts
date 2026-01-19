import { Page, expect } from '@playwright/test';
import { Logger } from './logger';

const logger = Logger.getInstance();

export class TestHelpers {
  static async waitForPageLoad(page: Page, timeout = 30000): Promise<void> {
    logger.info('Waiting for page to load');
    await page.waitForLoadState('networkidle', { timeout });
    await page.waitForLoadState('domcontentloaded', { timeout });
  }

  static async takeScreenshot(page: Page, name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotName = `${name}-${timestamp}.png`;
    
    logger.info(`Taking screenshot: ${screenshotName}`);
    await page.screenshot({
      path: `test-results/screenshots/${screenshotName}`,
      fullPage: true,
    });
  }

  static async scrollToElement(page: Page, selector: string): Promise<void> {
    logger.info(`Scrolling to element: ${selector}`);
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(500); // Small delay for smooth scrolling
  }

  static async waitForElement(
    page: Page,
    selector: string,
    options: { timeout?: number; state?: 'visible' | 'hidden' | 'attached' | 'detached' } = {}
  ): Promise<void> {
    const { timeout = 10000, state = 'visible' } = options;
    logger.info(`Waiting for element: ${selector} to be ${state}`);
    await page.locator(selector).waitFor({ timeout, state });
  }

  static async clickWithRetry(page: Page, selector: string, maxRetries = 3): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        logger.info(`Attempting to click: ${selector} (attempt ${i + 1})`);
        await page.locator(selector).click({ timeout: 5000 });
        return;
      } catch (error) {
        if (i === maxRetries - 1) {
          logger.error(`Failed to click ${selector} after ${maxRetries} attempts`, error);
          throw error;
        }
        logger.warn(`Click attempt ${i + 1} failed, retrying...`);
        await page.waitForTimeout(1000);
      }
    }
  }

  static async fillWithRetry(
    page: Page,
    selector: string,
    value: string,
    maxRetries = 3
  ): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        logger.info(`Attempting to fill: ${selector} with value: ${value} (attempt ${i + 1})`);
        await page.locator(selector).fill(value, { timeout: 5000 });
        return;
      } catch (error) {
        if (i === maxRetries - 1) {
          logger.error(`Failed to fill ${selector} after ${maxRetries} attempts`, error);
          throw error;
        }
        logger.warn(`Fill attempt ${i + 1} failed, retrying...`);
        await page.waitForTimeout(1000);
      }
    }
  }

  static async selectDropdownOption(
    page: Page,
    selector: string,
    option: string
  ): Promise<void> {
    logger.info(`Selecting option: ${option} from dropdown: ${selector}`);
    await page.locator(selector).selectOption(option);
  }

  static async verifyElementText(
    page: Page,
    selector: string,
    expectedText: string
  ): Promise<void> {
    logger.info(`Verifying element text: ${selector} contains: ${expectedText}`);
    await expect(page.locator(selector)).toContainText(expectedText);
  }

  static async verifyElementVisible(page: Page, selector: string): Promise<void> {
    logger.info(`Verifying element is visible: ${selector}`);
    await expect(page.locator(selector)).toBeVisible();
  }

  static async verifyElementHidden(page: Page, selector: string): Promise<void> {
    logger.info(`Verifying element is hidden: ${selector}`);
    await expect(page.locator(selector)).toBeHidden();
  }

  static async verifyUrl(page: Page, expectedUrl: string): Promise<void> {
    logger.info(`Verifying URL contains: ${expectedUrl}`);
    await expect(page).toHaveURL(new RegExp(expectedUrl));
  }

  static async clearAndFill(page: Page, selector: string, value: string): Promise<void> {
    logger.info(`Clearing and filling: ${selector} with: ${value}`);
    await page.locator(selector).clear();
    await page.locator(selector).fill(value);
  }

  static generateRandomEmail(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `test.user.${timestamp}.${random}@example.com`;
  }

  static generateRandomString(length = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static async handleAlert(page: Page, action: 'accept' | 'dismiss' = 'accept'): Promise<void> {
    logger.info(`Handling alert with action: ${action}`);
    page.on('dialog', async dialog => {
      logger.info(`Alert message: ${dialog.message()}`);
      if (action === 'accept') {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }
}