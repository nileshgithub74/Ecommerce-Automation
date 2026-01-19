import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class HomePage extends BasePage {
  // Locators
  private get logo(): Locator {
    return this.page.locator('[data-testid="logo"], .logo, header img');
  }

  private get searchInput(): Locator {
    return this.page.locator('[data-testid="search-input"], input[type="search"], .search-input');
  }

  private get searchButton(): Locator {
    return this.page.locator('[data-testid="search-button"], .search-button, button[type="submit"]');
  }

  private get loginLink(): Locator {
    return this.page.locator('[data-testid="login-link"], a[href*="login"], .login-link');
  }

  private get signupLink(): Locator {
    return this.page.locator('[data-testid="signup-link"], a[href*="signup"], .signup-link');
  }

  private get cartIcon(): Locator {
    return this.page.locator('[data-testid="cart-icon"], .cart-icon, a[href*="cart"]');
  }

  private get cartCount(): Locator {
    return this.page.locator('[data-testid="cart-count"], .cart-count, .cart-badge');
  }

  private get userMenu(): Locator {
    return this.page.locator('[data-testid="user-menu"], .user-menu, .account-menu');
  }

  private get categoryMenu(): Locator {
    return this.page.locator('[data-testid="category-menu"], .category-menu, nav');
  }

  private get featuredProducts(): Locator {
    return this.page.locator('[data-testid="featured-products"], .featured-products, .product-grid');
  }

  private get productCards(): Locator {
    return this.page.locator('[data-testid="product-card"], .product-card, .product-item');
  }

  private get newsletterSignup(): Locator {
    return this.page.locator('[data-testid="newsletter-signup"], .newsletter-signup');
  }

  private get footer(): Locator {
    return this.page.locator('footer, [data-testid="footer"]');
  }

  constructor(page: Page) {
    super(page);
  }

  async isLoaded(): Promise<boolean> {
    try {
      await this.logo.waitFor({ state: 'visible', timeout: 10000 });
      await this.searchInput.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async searchForProduct(searchTerm: string): Promise<void> {
    this.logger.info(`Searching for product: ${searchTerm}`);
    await this.fillElement(this.searchInput, searchTerm);
    await this.clickElement(this.searchButton);
    await this.waitForPageLoad();
  }

  async clickLogin(): Promise<void> {
    this.logger.info('Clicking login link');
    await this.clickElement(this.loginLink);
    await this.waitForPageLoad();
  }

  async clickSignup(): Promise<void> {
    this.logger.info('Clicking signup link');
    await this.clickElement(this.signupLink);
    await this.waitForPageLoad();
  }

  async clickCart(): Promise<void> {
    this.logger.info('Clicking cart icon');
    await this.clickElement(this.cartIcon);
    await this.waitForPageLoad();
  }

  async getCartItemCount(): Promise<number> {
    try {
      const countText = await this.getText(this.cartCount);
      return parseInt(countText) || 0;
    } catch {
      return 0;
    }
  }

  async clickUserMenu(): Promise<void> {
    this.logger.info('Clicking user menu');
    await this.clickElement(this.userMenu);
  }

  async selectCategory(categoryName: string): Promise<void> {
    this.logger.info(`Selecting category: ${categoryName}`);
    const categoryLink = this.page.locator(`a:has-text("${categoryName}")`);
    await this.clickElement(categoryLink);
    await this.waitForPageLoad();
  }

  async getFeaturedProducts(): Promise<string[]> {
    this.logger.info('Getting featured products');
    await this.featuredProducts.waitFor({ state: 'visible' });
    const productNames: string[] = [];
    
    const products = await this.productCards.all();
    for (const product of products) {
      const nameElement = product.locator('.product-name, [data-testid="product-name"]');
      const name = await this.getText(nameElement);
      if (name) {
        productNames.push(name);
      }
    }
    
    return productNames;
  }

  async clickProductByName(productName: string): Promise<void> {
    this.logger.info(`Clicking product: ${productName}`);
    const productCard = this.page.locator(`[data-testid="product-card"]:has-text("${productName}")`);
    await this.clickElement(productCard);
    await this.waitForPageLoad();
  }

  async clickProductByIndex(index: number): Promise<void> {
    this.logger.info(`Clicking product at index: ${index}`);
    const productCard = this.productCards.nth(index);
    await this.clickElement(productCard);
    await this.waitForPageLoad();
  }

  async subscribeToNewsletter(email: string): Promise<void> {
    this.logger.info(`Subscribing to newsletter with email: ${email}`);
    const emailInput = this.newsletterSignup.locator('input[type="email"]');
    const subscribeButton = this.newsletterSignup.locator('button, input[type="submit"]');
    
    await this.fillElement(emailInput, email);
    await this.clickElement(subscribeButton);
  }

  async verifyHomePageElements(): Promise<void> {
    this.logger.info('Verifying home page elements');
    await this.logo.waitFor({ state: 'visible' });
    await this.searchInput.waitFor({ state: 'visible' });
    await this.loginLink.waitFor({ state: 'visible' });
    await this.cartIcon.waitFor({ state: 'visible' });
  }

  async getAvailableCategories(): Promise<string[]> {
    this.logger.info('Getting available categories');
    const categories: string[] = [];
    const categoryLinks = this.categoryMenu.locator('a');
    
    const count = await categoryLinks.count();
    for (let i = 0; i < count; i++) {
      const categoryText = await this.getText(categoryLinks.nth(i));
      if (categoryText) {
        categories.push(categoryText);
      }
    }
    
    return categories;
  }

  async scrollToFeaturedProducts(): Promise<void> {
    this.logger.info('Scrolling to featured products section');
    await this.featuredProducts.scrollIntoViewIfNeeded();
  }

  async scrollToFooter(): Promise<void> {
    this.logger.info('Scrolling to footer');
    await this.footer.scrollIntoViewIfNeeded();
  }
}