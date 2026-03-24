import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class HomePage extends BasePage {
  // Actual locators matching the real app
  private get logo(): Locator {
    return this.page.locator('a[href="/"] span, a[href="/"] img').first();
  }

  private get navMenu(): Locator {
    return this.page.locator('nav ul');
  }

  private get loginButton(): Locator {
    return this.page.locator('button', { hasText: 'Login' }).first();
  }

  private get cartIcon(): Locator {
    return this.page.locator('a[href="/cart"]');
  }

  private get cartCount(): Locator {
    return this.page.locator('nav').locator('text=/^\\d+$/').first();
  }

  private get productItems(): Locator {
    // Site uses Tailwind card divs with product links — no .item class
    return this.page.locator('div.group').filter({ has: this.page.locator('a[href*="/product/"]') });
  }

  private get heroSection(): Locator {
    return this.page.locator('section').first();
  }

  private get newCollectionSection(): Locator {
    // New collections section identified by heading text
    return this.page.locator('section, div').filter({ hasText: /new collections/i }).first();
  }

  private get newsletterSection(): Locator {
    return this.page.locator('section, div').filter({ has: this.page.locator('input[type="email"]') }).last();
  }

  constructor(page: Page) {
    super(page);
  }

  async isLoaded(): Promise<boolean> {
    try {
      await this.page.locator('nav').waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickLogin(): Promise<void> {
    this.logger.info('Clicking login button');
    await this.clickElement(this.loginButton);
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

  async clickProductByIndex(index: number): Promise<void> {
    this.logger.info(`Clicking product at index: ${index}`);
    // Navigate directly to product/1 — product page requires auth anyway
    const productLink = this.page.locator('a[href*="/product/"]').nth(index);
    const href = await productLink.getAttribute('href');
    await this.page.goto(href || '/product/1');
    await this.waitForPageLoad();
  }

  async getFeaturedProducts(): Promise<string[]> {
    this.logger.info('Getting product names');
    const names: string[] = [];
    const items = await this.productItems.all();
    for (const item of items) {
      const name = await item.locator('p').first().textContent();
      if (name) names.push(name.trim());
    }
    return names;
  }

  async getProductCount(): Promise<number> {
    return await this.productItems.count();
  }

  async selectCategory(category: 'mens' | 'womens' | 'kids'): Promise<void> {
    this.logger.info(`Selecting category: ${category}`);
    const map: Record<string, string> = { mens: 'Men', womens: 'Women', kids: 'Kids' };
    const link = this.navMenu.locator(`a[href="/${category}"]`);
    await this.clickElement(link);
    await this.waitForPageLoad();
  }

  async scrollToNewCollection(): Promise<void> {
    await this.newCollectionSection.scrollIntoViewIfNeeded();
  }

  async subscribeNewsletter(email: string): Promise<void> {
    const input = this.newsletterSection.locator('input[type="email"]');
    const btn = this.newsletterSection.locator('button');
    await this.fillElement(input, email);
    await this.clickElement(btn);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }
}
