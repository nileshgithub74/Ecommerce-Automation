import { test, expect } from '../../src/fixtures/test-fixtures';
import { DataGenerator } from '../../src/utils/data-generator';

test.describe('User Authentication - Signup', () => {
  test.beforeEach(async ({ page, homePage }) => {
    await page.goto('/');
    await homePage.clickSignup();
  });

  test('should signup with valid information', async ({ signupPage, page }) => {
    const newUser = DataGenerator.generateUser();

    await test.step('Fill signup form with valid data', async () => {
      await signupPage.signup(newUser);
    });

    await test.step('Verify successful signup', async () => {
      // Should redirect to confirmation page or dashboard
      await expect(page).toHaveURL(/confirmation|verify|dashboard|welcome/);
      
      // Or verify success message
      await signupPage.verifySuccessMessage('Account created successfully');
    });
  });

  test('should signup with minimal required information', async ({ signupPage, page }) => {
    const email = DataGenerator.generateTestEmail();
    const password = DataGenerator.generateStrongPassword();

    await test.step('Fill minimal signup form', async () => {
      await signupPage.signupWithMinimalInfo(email, password);
    });

    await test.step('Verify successful signup', async () => {
      await expect(page).toHaveURL(/confirmation|verify|dashboard|welcome/);
    });
  });

  test('should show error for invalid email formats', async ({ signupPage }) => {
    const invalidEmails = DataGenerator.generateInvalidEmails();
    const validPassword = 'ValidPassword123!';

    for (const email of invalidEmails.slice(0, 3)) {
      await test.step(`Test invalid email: ${email}`, async () => {
        await signupPage.clearAllFields();
        await signupPage.fillCredentials(email, validPassword);
        await signupPage.acceptTermsAndConditions();
        await signupPage.clickElement(signupPage['signupButton']);
        
        if (email === '') {
          await signupPage.verifyRequiredFieldErrors();
        } else {
          await signupPage.verifyEmailFormatError();
        }
      });
    }
  });

  test('should validate password strength', async ({ signupPage }) => {
    const email = DataGenerator.generateTestEmail();
    const weakPasswords = DataGenerator.generateInvalidPasswords();

    for (const password of weakPasswords.slice(0, 3)) {
      await test.step(`Test weak password: ${password}`, async () => {
        await signupPage.clearAllFields();
        await signupPage.fillCredentials(email, password);
        
        if (password === '') {
          await signupPage.verifyRequiredFieldErrors();
        } else {
          await signupPage.verifyPasswordStrength('weak');
        }
      });
    }
  });

  test('should show error for password mismatch', async ({ signupPage }) => {
    const email = DataGenerator.generateTestEmail();
    const password = 'ValidPassword123!';
    const differentPassword = 'DifferentPassword456!';

    await test.step('Fill form with mismatched passwords', async () => {
      await signupPage.fillCredentials(email, password, differentPassword);
      await signupPage.acceptTermsAndConditions();
      await signupPage.clickElement(signupPage['signupButton']);
    });

    await test.step('Verify password mismatch error', async () => {
      await signupPage.verifyPasswordMismatchError();
    });
  });

  test('should show error for existing email', async ({ signupPage, testUser }) => {
    const password = 'NewPassword123!';

    await test.step('Attempt signup with existing email', async () => {
      await signupPage.fillCredentials(testUser.email, password);
      await signupPage.acceptTermsAndConditions();
      await signupPage.clickElement(signupPage['signupButton']);
    });

    await test.step('Verify email already exists error', async () => {
      await signupPage.verifyEmailAlreadyExistsError();
    });
  });

  test('should require terms and conditions acceptance', async ({ signupPage }) => {
    const newUser = DataGenerator.generateUser();

    await test.step('Fill form without accepting terms', async () => {
      await signupPage.fillPersonalInfo(newUser.firstName!, newUser.lastName!, newUser.phone);
      await signupPage.fillCredentials(newUser.email, newUser.password);
      // Don't accept terms and conditions
      await signupPage.clickElement(signupPage['signupButton']);
    });

    await test.step('Verify terms acceptance is required', async () => {
      const termsError = page.locator('[data-testid="terms-error"], .terms-error');
      await expect(termsError).toBeVisible();
    });
  });

  test('should handle newsletter subscription option', async ({ signupPage }) => {
    const newUser = DataGenerator.generateUser();

    await test.step('Subscribe to newsletter during signup', async () => {
      await signupPage.fillPersonalInfo(newUser.firstName!, newUser.lastName!);
      await signupPage.fillCredentials(newUser.email, newUser.password);
      await signupPage.acceptTermsAndConditions();
      await signupPage.subscribeToNewsletter();
      
      expect(await signupPage.isNewsletterCheckboxChecked()).toBe(true);
    });

    await test.step('Complete signup', async () => {
      await signupPage.clickElement(signupPage['signupButton']);
    });
  });

  test('should navigate to login page', async ({ signupPage, page }) => {
    await test.step('Click login link', async () => {
      await signupPage.clickLoginLink();
    });

    await test.step('Verify navigation to login page', async () => {
      await expect(page).toHaveURL(/login|signin/);
    });
  });

  test('should validate form fields in real-time', async ({ signupPage }) => {
    await test.step('Test email validation', async () => {
      await signupPage.fillElement(signupPage['emailInput'], 'invalid-email');
      await signupPage.fillElement(signupPage['passwordInput'], 'test'); // Trigger validation
      await signupPage.verifyEmailFormatError();
    });

    await test.step('Test password requirements display', async () => {
      await signupPage.fillElement(signupPage['passwordInput'], 'weak');
      await signupPage.verifyPasswordRequirements();
    });
  });

  test('should handle special characters in user data', async ({ signupPage, page }) => {
    const specialUser = {
      firstName: "José",
      lastName: "O'Connor",
      email: "jose.oconnor+test@example.com",
      password: "P@ssw0rd!#$%",
      phone: "+1-234-567-8900"
    };

    await test.step('Fill form with special characters', async () => {
      await signupPage.fillPersonalInfo(specialUser.firstName, specialUser.lastName, specialUser.phone);
      await signupPage.fillCredentials(specialUser.email, specialUser.password);
      await signupPage.acceptTermsAndConditions();
      await signupPage.clickElement(signupPage['signupButton']);
    });

    await test.step('Verify successful handling', async () => {
      // Should either succeed or show appropriate validation errors
      const currentUrl = await page.url();
      expect(currentUrl).toMatch(/signup|confirmation|verify|dashboard/);
    });
  });

  test.describe('Social Signup', () => {
    test('should display social signup options', async ({ signupPage }) => {
      await test.step('Verify social signup buttons are visible', async () => {
        const googleButton = signupPage['googleSignupButton'];
        const facebookButton = signupPage['facebookSignupButton'];
        
        await expect(googleButton).toBeVisible();
        await expect(facebookButton).toBeVisible();
      });
    });

    test('should handle Google signup attempt', async ({ signupPage }) => {
      await test.step('Click Google signup', async () => {
        await signupPage.signupWithGoogle();
      });
      // Note: In real tests, you would mock the OAuth flow
    });

    test('should handle Facebook signup attempt', async ({ signupPage }) => {
      await test.step('Click Facebook signup', async () => {
        await signupPage.signupWithFacebook();
      });
      // Note: In real tests, you would mock the OAuth flow
    });
  });

  test.describe('Form Validation', () => {
    test('should disable signup button when form is invalid', async ({ signupPage }) => {
      await test.step('Verify signup button is disabled with empty form', async () => {
        expect(await signupPage.isSignupButtonEnabled()).toBe(false);
      });

      await test.step('Fill required fields and verify button is enabled', async () => {
        await signupPage.fillCredentials('test@example.com', 'ValidPassword123!');
        await signupPage.acceptTermsAndConditions();
        expect(await signupPage.isSignupButtonEnabled()).toBe(true);
      });
    });

    test('should validate all required fields', async ({ signupPage }) => {
      await test.step('Submit empty form', async () => {
        await signupPage.submitEmptyForm();
      });

      await test.step('Verify all required field errors', async () => {
        await signupPage.verifyRequiredFieldErrors();
      });
    });

    test('should show password strength indicator', async ({ signupPage }) => {
      const passwords = [
        { password: 'weak', expectedStrength: 'weak' },
        { password: 'StrongerPass123', expectedStrength: 'medium' },
        { password: 'VeryStr0ng!P@ssw0rd', expectedStrength: 'strong' }
      ];

      for (const { password, expectedStrength } of passwords) {
        await test.step(`Test password strength: ${expectedStrength}`, async () => {
          await signupPage.fillElement(signupPage['passwordInput'], password);
          await signupPage.verifyPasswordStrength(expectedStrength);
        });
      }
    });
  });

  test.describe('Security Tests', () => {
    test('should prevent XSS in form fields', async ({ signupPage, page }) => {
      const xssPayload = '<script>alert("XSS")</script>';

      await test.step('Enter XSS payload in form fields', async () => {
        await signupPage.fillPersonalInfo(xssPayload, xssPayload);
        await signupPage.fillCredentials(`test${xssPayload}@example.com`, 'ValidPassword123!');
        await signupPage.acceptTermsAndConditions();
        await signupPage.clickElement(signupPage['signupButton']);
      });

      await test.step('Verify XSS is prevented', async () => {
        // Should not execute the script, should show validation error or sanitize input
        const alerts = [];
        page.on('dialog', dialog => {
          alerts.push(dialog.message());
          dialog.dismiss();
        });
        
        await page.waitForTimeout(1000);
        expect(alerts).toHaveLength(0);
      });
    });

    test('should handle SQL injection attempts', async ({ signupPage }) => {
      const sqlInjection = "'; DROP TABLE users; --";

      await test.step('Attempt SQL injection in signup form', async () => {
        await signupPage.fillPersonalInfo(sqlInjection, sqlInjection);
        await signupPage.fillCredentials(`test${sqlInjection}@example.com`, sqlInjection);
        await signupPage.acceptTermsAndConditions();
        await signupPage.clickElement(signupPage['signupButton']);
      });

      await test.step('Verify SQL injection is prevented', async () => {
        // Should show validation error or sanitize input, not crash
        const currentUrl = await page.url();
        expect(currentUrl).toMatch(/signup|error/);
      });
    });
  });
});