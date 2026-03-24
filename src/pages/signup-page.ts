import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class SignupPage extends BasePage {
  // Signup is on the same /login page, toggled
  private get formContainer(): Locator {
    return this.page.locator('.form-container');
  }

  private get usernameInput(): Locator {
    return this.page.locator('#username');
  }

  private get emailInput(): Locator {
    return this.page.locator('#email');
  }

  private get passwordInput(): Locator {
    return this.page.locator('#password');
  }

  private get confirmPasswordInput(): Locator {
    return this.page.locator('#confirmPassword');
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

  async switchToSignup(): Promise<void> {
    const heading = await this.page.locator('.form-container h1').textContent();
    if (heading?.trim() !== 'Sign Up') {
      await this.clickElement(this.toggleFormLink);
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  async signupWithCredentials(username: string, email: string, password: string, confirmPassword: string): Promise<void> {
    this.logger.info(`Signing up: ${email}`);
    await this.switchToSignup();
    await this.fillElement(this.usernameInput, username);
    await this.fillElement(this.emailInput, email);
    await this.fillElement(this.passwordInput, password);
    await this.fillElement(this.confirmPasswordInput, confirmPassword);
    await this.clickElement(this.submitButton);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifySignupFormVisible(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.confirmPasswordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }
}
