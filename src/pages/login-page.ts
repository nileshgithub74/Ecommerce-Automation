import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { User } from '../types';

export class LoginPage extends BasePage {
  // Locators
  private get emailInput(): Locator {
    return this.page.locator('[data-testid="email-input"], input[type="email"], #email');
  }

  private get passwordInput(): Locator {
    return this.page.locator('[data-testid="password-input"], input[type="password"], #password');
  }

  private get loginButton(): Locator {
    return this.page.locator('[data-testid="login-button"], button[type="submit"], .login-btn');
  }

  private get forgotPasswordLink(): Locator {
    return this.page.locator('[data-testid="forgot-password"], a[href*="forgot"], .forgot-password');
  }

  private get signupLink(): Locator {
    return this.page.locator('[data-testid="signup-link"], a[href*="signup"], .signup-link');
  }

  private get rememberMeCheckbox(): Locator {
    return this.page.locator('[data-testid="remember-me"], input[type="checkbox"]');
  }

  private get showPasswordToggle(): Locator {
    return this.page.locator('[data-testid="show-password"], .show-password, .password-toggle');
  }

  private get loginForm(): Locator {
    return this.page.locator('[data-testid="login-form"], form, .login-form');
  }

  private get socialLoginButtons(): Locator {
    return this.page.locator('[data-testid="social-login"], .social-login');
  }

  private get googleLoginButton(): Locator {
    return this.page.locator('[data-testid="google-login"], .google-login');
  }

  private get facebookLoginButton(): Locator {
    return this.page.locator('[data-testid="facebook-login"], .facebook-login');
  }

  constructor(page: Page) {
    super(page);
  }

  async isLoaded(): Promise<boolean> {
    try {
      await this.loginForm.waitFor({ state: 'visible', timeout: 10000 });
      await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.passwordInput.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async login(user: User): Promise<void> {
    this.logger.info(`Logging in user: ${user.email}`);
    
    await this.fillElement(this.emailInput, user.email);
    await this.fillElement(this.passwordInput, user.password);
    await this.clickElement(this.loginButton);
    
    await this.waitForLoadingToComplete();
  }

  async loginWithCredentials(email: string, password: string): Promise<void> {
    this.logger.info(`Logging in with email: ${email}`);
    
    await this.fillElement(this.emailInput, email);
    await this.fillElement(this.passwordInput, password);
    await this.clickElement(this.loginButton);
    
    await this.waitForLoadingToComplete();
  }

  async clickForgotPassword(): Promise<void> {
    this.logger.info('Clicking forgot password link');
    await this.clickElement(this.forgotPasswordLink);
    await this.waitForPageLoad();
  }

  async clickSignupLink(): Promise<void> {
    this.logger.info('Clicking signup link');
    await this.clickElement(this.signupLink);
    await this.waitForPageLoad();
  }

  async toggleRememberMe(): Promise<void> {
    this.logger.info('Toggling remember me checkbox');
    await this.clickElement(this.rememberMeCheckbox);
  }

  async isRememberMeChecked(): Promise<boolean> {
    return await this.rememberMeCheckbox.isChecked();
  }

  async togglePasswordVisibility(): Promise<void> {
    this.logger.info('Toggling password visibility');
    await this.clickElement(this.showPasswordToggle);
  }

  async loginWithGoogle(): Promise<void> {
    this.logger.info('Attempting Google login');
    await this.clickElement(this.googleLoginButton);
    // Note: In real tests, you'd handle the OAuth flow
    await this.waitForPageLoad();
  }

  async loginWithFacebook(): Promise<void> {
    this.logger.info('Attempting Facebook login');
    await this.clickElement(this.facebookLoginButton);
    // Note: In real tests, you'd handle the OAuth flow
    await this.waitForPageLoad();
  }

  async verifyLoginFormElements(): Promise<void> {
    this.logger.info('Verifying login form elements');
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await expect(this.forgotPasswordLink).toBeVisible();
    await expect(this.signupLink).toBeVisible();
  }

  async verifyEmailValidation(expectedMessage: string): Promise<void> {
    this.logger.info('Verifying email validation message');
    const emailError = this.page.locator('[data-testid="email-error"], .email-error');
    await expect(emailError).toBeVisible();
    await expect(emailError).toContainText(expectedMessage);
  }

  async verifyPasswordValidation(expectedMessage: string): Promise<void> {
    this.logger.info('Verifying password validation message');
    const passwordError = this.page.locator('[data-testid="password-error"], .password-error');
    await expect(passwordError).toBeVisible();
    await expect(passwordError).toContainText(expectedMessage);
  }

  async clearEmailField(): Promise<void> {
    this.logger.info('Clearing email field');
    await this.emailInput.clear();
  }

  async clearPasswordField(): Promise<void> {
    this.logger.info('Clearing password field');
    await this.passwordInput.clear();
  }

  async getEmailValue(): Promise<string> {
    return await this.emailInput.inputValue();
  }

  async getPasswordValue(): Promise<string> {
    return await this.passwordInput.inputValue();
  }

  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.isEnabled(this.loginButton);
  }

  async submitEmptyForm(): Promise<void> {
    this.logger.info('Submitting empty login form');
    await this.clickElement(this.loginButton);
  }

  async verifyRequiredFieldErrors(): Promise<void> {
    this.logger.info('Verifying required field errors');
    const emailError = this.page.locator('[data-testid="email-error"], .email-error');
    const passwordError = this.page.locator('[data-testid="password-error"], .password-error');
    
    await expect(emailError).toBeVisible();
    await expect(passwordError).toBeVisible();
  }

  async attemptSQLInjection(): Promise<void> {
    this.logger.info('Attempting SQL injection in login form');
    const maliciousInput = "'; DROP TABLE users; --";
    
    await this.fillElement(this.emailInput, maliciousInput);
    await this.fillElement(this.passwordInput, maliciousInput);
    await this.clickElement(this.loginButton);
    
    await this.waitForLoadingToComplete();
  }
}