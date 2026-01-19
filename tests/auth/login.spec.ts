import { test, expect } from '../../src/fixtures/test-fixtures';
import { DataGenerator } from '../../src/utils/data-generator';

test.describe('User Authentication - Login', () => {
  test.beforeEach(async ({ page, homePage }) => {
    await page.goto('/');
    await homePage.clickLogin();
  });

  test('should login with valid credentials', async ({ loginPage, homePage, testUser }) => {
    await test.step('Login with valid credentials', async () => {
      await loginPage.loginWithCredentials(testUser.email, testUser.password);
    });

    await test.step('Verify successful login', async () => {
      await expect(page).toHaveURL(/dashboard|account|home/);
      // Verify user is logged in by checking for user menu or logout option
      const userMenu = page.locator('[data-testid="user-menu"], .user-menu');
      await expect(userMenu).toBeVisible();
    });
  });

  test('should show error for invalid email', async ({ loginPage }) => {
    const invalidEmails = DataGenerator.generateInvalidEmails();
    
    for (const email of invalidEmails.slice(0, 3)) { // Test first 3 invalid emails
      await test.step(`Test invalid email: ${email}`, async () => {
        await loginPage.clearEmailField();
        await loginPage.clearPasswordField();
        await loginPage.loginWithCredentials(email, 'ValidPassword123!');
        
        if (email === '') {
          await loginPage.verifyRequiredFieldErrors();
        } else {
          await loginPage.verifyEmailValidation('Please enter a valid email address');
        }
      });
    }
  });

  test('should show error for invalid password', async ({ loginPage }) => {
    await test.step('Login with empty password', async () => {
      await loginPage.loginWithCredentials('test@example.com', '');
      await loginPage.verifyPasswordValidation('Password is required');
    });

    await test.step('Login with wrong password', async () => {
      await loginPage.clearEmailField();
      await loginPage.clearPasswordField();
      await loginPage.loginWithCredentials('test@example.com', 'WrongPassword123!');
      await loginPage.verifyErrorMessage('Invalid email or password');
    });
  });

  test('should show error for non-existent user', async ({ loginPage }) => {
    const randomEmail = DataGenerator.generateTestEmail();
    
    await test.step('Login with non-existent user', async () => {
      await loginPage.loginWithCredentials(randomEmail, 'SomePassword123!');
      await loginPage.verifyErrorMessage('Invalid email or password');
    });
  });

  test('should toggle password visibility', async ({ loginPage }) => {
    await test.step('Fill password field', async () => {
      await loginPage.fillElement(loginPage['passwordInput'], 'TestPassword123!');
    });

    await test.step('Toggle password visibility', async () => {
      await loginPage.togglePasswordVisibility();
      // Verify password is visible (input type should change to text)
      const passwordInput = loginPage['passwordInput'];
      const inputType = await passwordInput.getAttribute('type');
      expect(inputType).toBe('text');
    });

    await test.step('Toggle password visibility back', async () => {
      await loginPage.togglePasswordVisibility();
      const passwordInput = loginPage['passwordInput'];
      const inputType = await passwordInput.getAttribute('type');
      expect(inputType).toBe('password');
    });
  });

  test('should handle remember me functionality', async ({ loginPage, testUser }) => {
    await test.step('Check remember me checkbox', async () => {
      await loginPage.toggleRememberMe();
      expect(await loginPage.isRememberMeChecked()).toBe(true);
    });

    await test.step('Login with remember me checked', async () => {
      await loginPage.loginWithCredentials(testUser.email, testUser.password);
    });

    // Note: In a real application, you would verify that the session persists
    // across browser restarts when remember me is checked
  });

  test('should navigate to forgot password page', async ({ loginPage, page }) => {
    await test.step('Click forgot password link', async () => {
      await loginPage.clickForgotPassword();
    });

    await test.step('Verify navigation to forgot password page', async () => {
      await expect(page).toHaveURL(/forgot-password|reset-password/);
    });
  });

  test('should navigate to signup page', async ({ loginPage, page }) => {
    await test.step('Click signup link', async () => {
      await loginPage.clickSignupLink();
    });

    await test.step('Verify navigation to signup page', async () => {
      await expect(page).toHaveURL(/signup|register/);
    });
  });

  test('should validate form submission with empty fields', async ({ loginPage }) => {
    await test.step('Submit empty form', async () => {
      await loginPage.submitEmptyForm();
    });

    await test.step('Verify required field errors', async () => {
      await loginPage.verifyRequiredFieldErrors();
    });
  });

  test('should prevent SQL injection attacks', async ({ loginPage }) => {
    await test.step('Attempt SQL injection', async () => {
      await loginPage.attemptSQLInjection();
    });

    await test.step('Verify SQL injection is prevented', async () => {
      // Should show invalid credentials error, not crash the application
      await loginPage.verifyErrorMessage('Invalid email or password');
    });
  });

  test('should handle special characters in credentials', async ({ loginPage }) => {
    const specialCharEmail = 'test+special@example.com';
    const specialCharPassword = 'P@ssw0rd!#$%';

    await test.step('Login with special characters', async () => {
      await loginPage.loginWithCredentials(specialCharEmail, specialCharPassword);
    });

    await test.step('Verify appropriate handling', async () => {
      // Should either login successfully (if user exists) or show invalid credentials
      // The important thing is that it doesn't crash or show unexpected errors
      const currentUrl = await page.url();
      expect(currentUrl).toMatch(/login|dashboard|account|home/);
    });
  });

  test.describe('Social Login', () => {
    test('should display social login options', async ({ loginPage }) => {
      await test.step('Verify social login buttons are visible', async () => {
        const googleButton = loginPage['googleLoginButton'];
        const facebookButton = loginPage['facebookLoginButton'];
        
        await expect(googleButton).toBeVisible();
        await expect(facebookButton).toBeVisible();
      });
    });

    test('should handle Google login attempt', async ({ loginPage, page }) => {
      await test.step('Click Google login', async () => {
        await loginPage.loginWithGoogle();
      });

      // Note: In a real test, you would mock the OAuth flow or use test credentials
      // For now, we just verify the button click doesn't cause errors
    });

    test('should handle Facebook login attempt', async ({ loginPage, page }) => {
      await test.step('Click Facebook login', async () => {
        await loginPage.loginWithFacebook();
      });

      // Note: In a real test, you would mock the OAuth flow or use test credentials
      // For now, we just verify the button click doesn't cause errors
    });
  });

  test.describe('Login Form Validation', () => {
    test('should disable login button when form is invalid', async ({ loginPage }) => {
      await test.step('Verify login button is disabled with empty form', async () => {
        expect(await loginPage.isLoginButtonEnabled()).toBe(false);
      });

      await test.step('Fill only email and verify button is still disabled', async () => {
        await loginPage.fillElement(loginPage['emailInput'], 'test@example.com');
        expect(await loginPage.isLoginButtonEnabled()).toBe(false);
      });

      await test.step('Fill both fields and verify button is enabled', async () => {
        await loginPage.fillElement(loginPage['passwordInput'], 'password123');
        expect(await loginPage.isLoginButtonEnabled()).toBe(true);
      });
    });

    test('should validate email format in real-time', async ({ loginPage }) => {
      await test.step('Enter invalid email format', async () => {
        await loginPage.fillElement(loginPage['emailInput'], 'invalid-email');
        await loginPage.fillElement(loginPage['passwordInput'], 'password123');
        await loginPage.submitEmptyForm();
      });

      await test.step('Verify email format error', async () => {
        await loginPage.verifyEmailValidation('Please enter a valid email address');
      });
    });
  });
});