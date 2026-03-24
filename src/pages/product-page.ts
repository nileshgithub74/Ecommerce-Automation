import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class ProductPage extends BasePage {
  // Matches ProductDisplay.jsx structure
  private get productDisplay(): Locator {
    return this.page.locator('.productdisplay');
  }

  private get productName(): Locator {
    return this.page.locator('.productdisplay-right h1');
  }

  private get productNewPrice(): Locator {
    return this.page.locator('.productdisplay-right-price-new');
  }

  private get productOldPrice(): Locator {
    return this.page.locator('.productdisplay-right-price-old');
  }

  private get mainImage(): Locator {
    return this.page.locator('.productdisplay-main-img');
  }

  private get thumbnailImages(): Locator {
    return this.page.locator('.productdisplay-ing-list img');
  }

  private get sizeOptions(): Locator {
    return this.page.locator('.productdisplay-right-size div');
  }

  private get addToCartButton(): Locator {
    return this.page.locator('.productdisplay-right button');
  }

  private get starRating(): Locator {
    return this.page.locator('.productdisplay-right-star');
  }

  private get relatedProducts(): Locator {
    return this.page.locator('.relatedproducts-item .item');
  }

  private get breadcrumb(): Locator {
    return this.page.locator('.breadcrum');
  }

  constructor(page: Page) {
    super(page);
  }

  async isLoaded(): Promise<boolean> {
    try {
      await this.productDisplay.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async getProductTitle(): Promise<string> {
    return (await this.productName.textContent()) || '';
  }

  async getProductPrice(): Promise<string> {
    return (await this.productNewPrice.textContent()) || '';
  }

  async getProductOldPrice(): Promise<string> {
    return (await this.productOldPrice.textContent()) || '';
  }

  async addToCart(): Promise<void> {
    this.logger.info('Adding product to cart');
    await this.clickElement(this.addToCartButton);
  }

  async verifyAddToCartSuccess(): Promise<void> {
    // Cart count in navbar should increase
    const cartCount = this.page.locator('.nav-cart-count');
    await expect(cartCount).toBeVisible();
  }

  async getAvailableSizes(): Promise<string[]> {
    const sizes: string[] = [];
    const sizeEls = await this.sizeOptions.all();
    for (const el of sizeEls) {
      const text = await el.textContent();
      if (text?.trim()) sizes.push(text.trim());
    }
    return sizes;
  }

  async selectSize(size: string): Promise<void> {
    this.logger.info(`Selecting size: ${size}`);
    const sizeEl = this.page.locator(`.productdisplay-right-size div:has-text("${size}")`);
    await this.clickElement(sizeEl);
  }

  async isAddToCartButtonEnabled(): Promise<boolean> {
    return await this.addToCartButton.isEnabled();
  }

  async verifyProductPageElements(): Promise<void> {
    await expect(this.productName).toBeVisible();
    await expect(this.productNewPrice).toBeVisible();
    await expect(this.mainImage).toBeVisible();
    await expect(this.addToCartButton).toBeVisible();
  }

  async clickThumbnailImage(index: number): Promise<void> {
    await this.clickElement(this.thumbnailImages.nth(index));
  }

  async getProductRating(): Promise<string> {
    return (await this.starRating.textContent()) || '';
  }

  async viewRelatedProducts(): Promise<string[]> {
    const names: string[] = [];
    const items = await this.relatedProducts.all();
    for (const item of items) {
      const name = await item.locator('p').first().textContent();
      if (name) names.push(name.trim());
    }
    return names;
  }

  async clickRelatedProduct(index: number): Promise<void> {
    const link = this.relatedProducts.nth(index).locator('a').first();
    await this.clickElement(link);
    await this.waitForPageLoad();
  }

  async getBreadcrumbPath(): Promise<string[]> {
    const parts: string[] = [];
    const spans = await this.breadcrumb.locator('span').all();
    for (const span of spans) {
      const text = await span.textContent();
      if (text?.trim()) parts.push(text.trim());
    }
    return parts;
  }

  async getProductDescription(): Promise<string> {
    return (await this.page.locator('.productdisplay-rigth-description').textContent()) || '';
  }

  async selectQuantity(_qty: number): Promise<void> {
    // The app does not have a quantity selector on product page
    // quantity is managed via add/remove in cart
    this.logger.info('Quantity selection not available on product page - use addToCart multiple times');
    await this.addToCart();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }
}
