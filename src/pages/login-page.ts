import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class LoginPage extends BasePage {
  // Real app uses a single toggled Login/Signup page
  private get formContainer(): Locator {
    return this.page.locator('.form-container');
  }

  private get emailInput(): Locator {
    return this.page.locator('#email');
  }

  private get passwordInput(): Locator {
    return this.page.locator('#password');
  }

  private get submitButton(): Locator {
    return this.page.locator('.submit-btn');
  }

  private get toggleFormLink(): Locator {
    return this.page.locator('.toggle-form p');
  }

  constructor(page: Page) {
    super(page);
  }

  async isLoaded(): Promise<boolean> {
    try {
      await this.formContainer.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async loginWithCredentials(email: string, password: string): Promise<void> {
    this.logger.info(`Logging in with: ${email}`);
    // Ensure we are on login mode (not signup)
    const heading = await this.page.locator('.form-container h1').textContent();
    if (heading?.trim() !== 'Login') {
      await this.clickElement(this.toggleFormLink);
    }
    await this.fillElement(this.emailInput, email);
    await this.fillElement(this.passwordInput, password);
    await this.clickElement(this.submitButton);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async switchToSignup(): Promise<void> {
    this.logger.info('Switching to signup form');
    const heading = await this.page.locator('.form-container h1').textContent();
    if (heading?.trim() !== 'Sign Up') {
      await this.clickElement(this.toggleFormLink);
    }
  }

  async switchToLogin(): Promise<void> {
    this.logger.info('Switching to login form');
    const heading = await this.page.locator('.form-container h1').textContent();
    if (heading?.trim() !== 'Login') {
      await this.clickElement(this.toggleFormLink);
    }
  }

  async getCurrentFormTitle(): Promise<string> {
    return (await this.page.locator('.form-container h1').textContent()) || '';
  }

  async verifyLoginFormVisible(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async clearEmailField(): Promise<void> {
    await this.emailInput.clear();
  }

  async clearPasswordField(): Promise<void> {
    await this.passwordInput.clear();
  }

  async submitForm(): Promise<void> {
    await this.clickElement(this.submitButton);
  }

  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.submitButton.isEnabled();
  }
}
