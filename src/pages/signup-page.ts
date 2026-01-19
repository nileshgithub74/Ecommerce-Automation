import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { User } from '../types';

export class SignupPage extends BasePage {
  // Locators
  private get firstNameInput(): Locator {
    return this.page.locator('[data-testid="first-name"], input[name="firstName"], #firstName');
  }

  private get lastNameInput(): Locator {
    return this.page.locator('[data-testid="last-name"], input[name="lastName"], #lastName');
  }

  private get emailInput(): Locator {
    return this.page.locator('[data-testid="email-input"], input[type="email"], #email');
  }

  private get passwordInput(): Locator {
    return this.page.locator('[data-testid="password-input"], input[type="password"], #password');
  }

  private get confirmPasswordInput(): Locator {
    return this.page.locator('[data-testid="confirm-password"], input[name="confirmPassword"], #confirmPassword');
  }

  private get phoneInput(): Locator {
    return this.page.locator('[data-testid="phone-input"], input[type="tel"], #phone');
  }

  private get signupButton(): Locator {
    return this.page.locator('[data-testid="signup-button"], button[type="submit"], .signup-btn');
  }

  private get termsCheckbox(): Locator {
    return this.page.locator('[data-testid="terms-checkbox"], input[name="terms"]');
  }

  private get newsletterCheckbox(): Locator {
    return this.page.locator('[data-testid="newsletter-checkbox"], input[name="newsletter"]');
  }

  private get loginLink(): Locator {
    return this.page.locator('[data-testid="login-link"], a[href*="login"], .login-link');
  }

  private get signupForm(): Locator {
    return this.page.locator('[data-testid="signup-form"], form, .signup-form');
  }

  private get passwordStrengthIndicator(): Locator {
    return this.page.locator('[data-testid="password-strength"], .password-strength');
  }

  private get socialSignupButtons(): Locator {
    return this.page.locator('[data-testid="social-signup"], .social-signup');
  }

  private get googleSignupButton(): Locator {
    return this.page.locator('[data-testid="google-signup"], .google-signup');
  }

  private get facebookSignupButton(): Locator {
    return this.page.locator('[data-testid="facebook-signup"], .facebook-signup');
  }

  constructor(page: Page) {
    super(page);
  }

  async isLoaded(): Promise<boolean> {
    try {
      await this.signupForm.waitFor({ state: 'visible', timeout: 10000 });
      await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.passwordInput.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async signup(user: User): Promise<void> {
    this.logger.info(`Signing up user: ${user.email}`);
    
    if (user.firstName) {
      await this.fillElement(this.firstNameInput, user.firstName);
    }
    
    if (user.lastName) {
      await this.fillElement(this.lastNameInput, user.lastName);
    }
    
    await this.fillElement(this.emailInput, user.email);
    await this.fillElement(this.passwordInput, user.password);
    await this.fillElement(this.confirmPasswordInput, user.password);
    
    if (user.phone) {
      await this.fillElement(this.phoneInput, user.phone);
    }
    
    // Accept terms and conditions
    await this.clickElement(this.termsCheckbox);
    
    await this.clickElement(this.signupButton);
    await this.waitForLoadingToComplete();
  }

  async signupWithMinimalInfo(email: string, password: string): Promise<void> {
    this.logger.info(`Signing up with minimal info: ${email}`);
    
    await this.fillElement(this.emailInput, email);
    await this.fillElement(this.passwordInput, password);
    await this.fillElement(this.confirmPasswordInput, password);
    await this.clickElement(this.termsCheckbox);
    await this.clickElement(this.signupButton);
    
    await this.waitForLoadingToComplete();
  }

  async fillPersonalInfo(firstName: string, lastName: string, phone?: string): Promise<void> {
    this.logger.info('Filling personal information');
    
    await this.fillElement(this.firstNameInput, firstName);
    await this.fillElement(this.lastNameInput, lastName);
    
    if (phone) {
      await this.fillElement(this.phoneInput, phone);
    }
  }

  async fillCredentials(email: string, password: string, confirmPassword?: string): Promise<void> {
    this.logger.info('Filling credentials');
    
    await this.fillElement(this.emailInput, email);
    await this.fillElement(this.passwordInput, password);
    await this.fillElement(this.confirmPasswordInput, confirmPassword || password);
  }

  async acceptTermsAndConditions(): Promise<void> {
    this.logger.info('Accepting terms and conditions');
    await this.clickElement(this.termsCheckbox);
  }

  async subscribeToNewsletter(): Promise<void> {
    this.logger.info('Subscribing to newsletter');
    await this.clickElement(this.newsletterCheckbox);
  }

  async clickLoginLink(): Promise<void> {
    this.logger.info('Clicking login link');
    await this.clickElement(this.loginLink);
    await this.waitForPageLoad();
  }

  async signupWithGoogle(): Promise<void> {
    this.logger.info('Attempting Google signup');
    await this.clickElement(this.googleSignupButton);
    await this.waitForPageLoad();
  }

  async signupWithFacebook(): Promise<void> {
    this.logger.info('Attempting Facebook signup');
    await this.clickElement(this.facebookSignupButton);
    await this.waitForPageLoad();
  }

  async verifySignupFormElements(): Promise<void> {
    this.logger.info('Verifying signup form elements');
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.confirmPasswordInput).toBeVisible();
    await expect(this.signupButton).toBeVisible();
    await expect(this.termsCheckbox).toBeVisible();
  }

  async verifyPasswordMismatchError(): Promise<void> {
    this.logger.info('Verifying password mismatch error');
    const passwordError = this.page.locator('[data-testid="password-mismatch"], .password-mismatch-error');
    await expect(passwordError).toBeVisible();
  }

  async verifyEmailAlreadyExistsError(): Promise<void> {
    this.logger.info('Verifying email already exists error');
    const emailError = this.page.locator('[data-testid="email-exists"], .email-exists-error');
    await expect(emailError).toBeVisible();
  }

  async verifyPasswordStrength(expectedStrength: 'weak' | 'medium' | 'strong'): Promise<void> {
    this.logger.info(`Verifying password strength: ${expectedStrength}`);
    await expect(this.passwordStrengthIndicator).toBeVisible();
    await expect(this.passwordStrengthIndicator).toContainText(expectedStrength);
  }

  async getPasswordStrength(): Promise<string> {
    return await this.getText(this.passwordStrengthIndicator);
  }

  async isTermsCheckboxChecked(): Promise<boolean> {
    return await this.termsCheckbox.isChecked();
  }

  async isNewsletterCheckboxChecked(): Promise<boolean> {
    return await this.newsletterCheckbox.isChecked();
  }

  async isSignupButtonEnabled(): Promise<boolean> {
    return await this.isEnabled(this.signupButton);
  }

  async submitEmptyForm(): Promise<void> {
    this.logger.info('Submitting empty signup form');
    await this.clickElement(this.signupButton);
  }

  async verifyRequiredFieldErrors(): Promise<void> {
    this.logger.info('Verifying required field errors');
    const emailError = this.page.locator('[data-testid="email-error"], .email-error');
    const passwordError = this.page.locator('[data-testid="password-error"], .password-error');
    
    await expect(emailError).toBeVisible();
    await expect(passwordError).toBeVisible();
  }

  async verifyEmailFormatError(): Promise<void> {
    this.logger.info('Verifying email format error');
    const emailError = this.page.locator('[data-testid="email-format-error"], .email-format-error');
    await expect(emailError).toBeVisible();
  }

  async verifyPasswordRequirements(): Promise<void> {
    this.logger.info('Verifying password requirements');
    const passwordHelp = this.page.locator('[data-testid="password-help"], .password-requirements');
    await expect(passwordHelp).toBeVisible();
  }

  async clearAllFields(): Promise<void> {
    this.logger.info('Clearing all form fields');
    await this.firstNameInput.clear();
    await this.lastNameInput.clear();
    await this.emailInput.clear();
    await this.passwordInput.clear();
    await this.confirmPasswordInput.clear();
    await this.phoneInput.clear();
  }
}