import { Page, Locator, expect } from '@playwright/test';
import { Logger } from '../utils/logger';
import { TestHelpers } from '../utils/test-helpers';

export abstract class BasePage {
  protected page: Page;
  protected logger: Logger;

  constructor(page: Page) {
    this.page = page;
    this.logger = Logger.getInstance();
  }

  // Common locators
  protected get loadingSpinner(): Locator {
    return this.page.locator('[data-testid="loading-spinner"], .loading, .spinner');
  }

  protected get errorMessage(): Locator {
    return this.page.locator('[data-testid="error-message"], .error-message, .alert-error');
  }

  protected get successMessage(): Locator {
    return this.page.locator('[data-testid="success-message"], .success-message, .alert-success');
  }

  // Common methods
  async navigate(url: string): Promise<void> {
    this.logger.info(`Navigating to: ${url}`);
    await this.page.goto(url);
    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async takeScreenshot(name: string): Promise<void> {
    await TestHelpers.takeScreenshot(this.page, name);
  }

  async waitForLoadingToComplete(): Promise<void> {
    this.logger.info('Waiting for loading to complete');
    try {
      await this.loadingSpinner.waitFor({ state: 'visible', timeout: 2000 });
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 30000 });
    } catch (error) {
      // Loading spinner might not be present, which is fine
      this.logger.debug('No loading spinner found or already hidden');
    }
  }

  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    this.logger.info(`Verifying error message: ${expectedMessage}`);
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedMessage);
  }

  async verifySuccessMessage(expectedMessage: string): Promise<void> {
    this.logger.info(`Verifying success message: ${expectedMessage}`);
    await expect(this.successMessage).toBeVisible();
    await expect(this.successMessage).toContainText(expectedMessage);
  }

  async scrollToTop(): Promise<void> {
    this.logger.info('Scrolling to top of page');
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  async scrollToBottom(): Promise<void> {
    this.logger.info('Scrolling to bottom of page');
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async refreshPage(): Promise<void> {
    this.logger.info('Refreshing page');
    await this.page.reload();
    await this.waitForPageLoad();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async waitForUrl(urlPattern: string | RegExp, timeout = 30000): Promise<void> {
    this.logger.info(`Waiting for URL pattern: ${urlPattern}`);
    await this.page.waitForURL(urlPattern, { timeout });
  }

  async clickElement(locator: Locator, options?: { force?: boolean; timeout?: number }): Promise<void> {
    await locator.click(options);
  }

  async fillElement(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  async selectOption(locator: Locator, option: string): Promise<void> {
    await locator.selectOption(option);
  }

  async getText(locator: Locator): Promise<string> {
    return await locator.textContent() || '';
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  async isEnabled(locator: Locator): Promise<boolean> {
    return await locator.isEnabled();
  }

  async getAttribute(locator: Locator, attribute: string): Promise<string | null> {
    return await locator.getAttribute(attribute);
  }

  async hover(locator: Locator): Promise<void> {
    await locator.hover();
  }

  async doubleClick(locator: Locator): Promise<void> {
    await locator.dblclick();
  }

  async rightClick(locator: Locator): Promise<void> {
    await locator.click({ button: 'right' });
  }

  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  async typeText(text: string): Promise<void> {
    await this.page.keyboard.type(text);
  }

  // Abstract method that child classes must implement
  abstract isLoaded(): Promise<boolean>;
}