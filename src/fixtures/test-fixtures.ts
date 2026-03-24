import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/home-page';
import { LoginPage } from '../pages/login-page';
import { SignupPage } from '../pages/signup-page';
import { ProductPage } from '../pages/product-page';
import { CartPage } from '../pages/cart-page';
import { DataGenerator } from '../utils/data-generator';
import { Logger } from '../utils/logger';
import { config } from '../config/environment';

// Extend the base test with our page objects and utilities
export const test = base.extend<{
  homePage: HomePage;
  loginPage: LoginPage;
  signupPage: SignupPage;
  productPage: ProductPage;
  cartPage: CartPage;
  dataGenerator: typeof DataGenerator;
  logger: Logger;
  testUser: { email: string; password: string };
}>({
  // Page Object fixtures
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  signupPage: async ({ page }, use) => {
    const signupPage = new SignupPage(page);
    await use(signupPage);
  },

  productPage: async ({ page }, use) => {
    const productPage = new ProductPage(page);
    await use(productPage);
  },

  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },

  // Utility fixtures
  dataGenerator: async ({}, use) => {
    await use(DataGenerator);
  },

  logger: async ({}, use) => {
    const logger = Logger.getInstance();
    await use(logger);
  },

  testUser: async ({}, use) => {
    const user = {
      email: config.users.testUser.email,
      password: config.users.testUser.password,
    };
    await use(user);
  },
});

// Custom expect extensions

expect.extend({
  async toBeInRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    if (pass) {
      return {
        message: () => `expected ${received} not to be in range ${min}-${max}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be in range ${min}-${max}`,
        pass: false,
      };
    }
  },

  async toContainPrice(received: string, expectedPrice: number) {
    const priceMatch = received.match(/[\d,]+\.?\d*/);
    const actualPrice = priceMatch ? parseFloat(priceMatch[0].replace(',', '')) : 0;
    const pass = Math.abs(actualPrice - expectedPrice) < 0.01;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to contain price ${expectedPrice}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to contain price ${expectedPrice}, but found ${actualPrice}`,
        pass: false,
      };
    }
  },
});

// Test data fixtures
export const testData = {
  validUsers: [
    {
      email: 'john.doe@example.com',
      password: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
    },
    {
      email: 'jane.smith@example.com',
      password: 'StrongPass456!',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+0987654321',
    },
  ],

  invalidUsers: [
    {
      email: 'invalid-email',
      password: 'weak',
      expectedError: 'Invalid email format',
    },
    {
      email: 'test@example.com',
      password: '',
      expectedError: 'Password is required',
    },
  ],

  products: [
    {
      name: 'Wireless Headphones',
      category: 'Electronics',
      price: 99.99,
    },
    {
      name: 'Running Shoes',
      category: 'Sports',
      price: 129.99,
    },
    {
      name: 'Coffee Mug',
      category: 'Home',
      price: 19.99,
    },
  ],

  promoCodes: {
    valid: [
      { code: 'SAVE10', discount: '10%' },
      { code: 'WELCOME20', discount: '20%' },
    ],
    invalid: [
      { code: 'EXPIRED', error: 'Promo code has expired' },
      { code: 'INVALID', error: 'Invalid promo code' },
    ],
  },

  searchTerms: {
    valid: ['headphones', 'shoes', 'laptop', 'phone'],
    invalid: ['xyz123', '!@#$%', ''],
    noResults: ['nonexistentproduct123'],
  },

  shippingAddresses: [
    {
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      phone: '+1234567890',
    },
  ],

  paymentInfo: {
    validCards: [
      {
        cardNumber: '4242424242424242',
        expiryMonth: '12',
        expiryYear: '25',
        cvv: '123',
        cardholderName: 'John Doe',
      },
    ],
    invalidCards: [
      {
        cardNumber: '4242424242424241',
        expiryMonth: '12',
        expiryYear: '25',
        cvv: '123',
        cardholderName: 'John Doe',
        expectedError: 'Invalid card number',
      },
    ],
  },
};

// Test hooks for setup and teardown
export const testHooks = {
  beforeEach: async (page: import('@playwright/test').Page) => {
    await page.goto('/');
  },

  afterEach: async (page: import('@playwright/test').Page, testInfo: import('@playwright/test').TestInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshot = await page.screenshot();
      await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
    }
  },
};

export { expect };