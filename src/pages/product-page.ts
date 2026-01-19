import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class ProductPage extends BasePage {
  // Locators
  private get productTitle(): Locator {
    return this.page.locator('[data-testid="product-title"], .product-title, h1');
  }

  private get productPrice(): Locator {
    return this.page.locator('[data-testid="product-price"], .product-price, .price');
  }

  private get productDescription(): Locator {
    return this.page.locator('[data-testid="product-description"], .product-description');
  }

  private get productImages(): Locator {
    return this.page.locator('[data-testid="product-images"], .product-images');
  }

  private get mainProductImage(): Locator {
    return this.page.locator('[data-testid="main-product-image"], .main-image img');
  }

  private get thumbnailImages(): Locator {
    return this.page.locator('[data-testid="thumbnail-images"], .thumbnail-images img');
  }

  private get quantitySelector(): Locator {
    return this.page.locator('[data-testid="quantity-selector"], select[name="quantity"], .quantity-select');
  }

  private get sizeSelector(): Locator {
    return this.page.locator('[data-testid="size-selector"], select[name="size"], .size-select');
  }

  private get colorSelector(): Locator {
    return this.page.locator('[data-testid="color-selector"], select[name="color"], .color-select');
  }

  private get addToCartButton(): Locator {
    return this.page.locator('[data-testid="add-to-cart"], .add-to-cart-btn, button:has-text("Add to Cart")');
  }

  private get buyNowButton(): Locator {
    return this.page.locator('[data-testid="buy-now"], .buy-now-btn, button:has-text("Buy Now")');
  }

  private get wishlistButton(): Locator {
    return this.page.locator('[data-testid="add-to-wishlist"], .wishlist-btn');
  }

  private get stockStatus(): Locator {
    return this.page.locator('[data-testid="stock-status"], .stock-status');
  }

  private get productRating(): Locator {
    return this.page.locator('[data-testid="product-rating"], .product-rating, .rating');
  }

  private get reviewsSection(): Locator {
    return this.page.locator('[data-testid="reviews-section"], .reviews-section');
  }

  private get reviewsTab(): Locator {
    return this.page.locator('[data-testid="reviews-tab"], .reviews-tab, a:has-text("Reviews")');
  }

  private get specificationsTab(): Locator {
    return this.page.locator('[data-testid="specifications-tab"], .specifications-tab');
  }

  private get relatedProducts(): Locator {
    return this.page.locator('[data-testid="related-products"], .related-products');
  }

  private get breadcrumb(): Locator {
    return this.page.locator('[data-testid="breadcrumb"], .breadcrumb, nav');
  }

  private get shareButton(): Locator {
    return this.page.locator('[data-testid="share-button"], .share-btn');
  }

  private get zoomButton(): Locator {
    return this.page.locator('[data-testid="zoom-button"], .zoom-btn');
  }

  constructor(page: Page) {
    super(page);
  }

  async isLoaded(): Promise<boolean> {
    try {
      await this.productTitle.waitFor({ state: 'visible', timeout: 10000 });
      await this.productPrice.waitFor({ state: 'visible', timeout: 10000 });
      await this.addToCartButton.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async getProductTitle(): Promise<string> {
    this.logger.info('Getting product title');
    return await this.getText(this.productTitle);
  }

  async getProductPrice(): Promise<string> {
    this.logger.info('Getting product price');
    return await this.getText(this.productPrice);
  }

  async getProductDescription(): Promise<string> {
    this.logger.info('Getting product description');
    return await this.getText(this.productDescription);
  }

  async selectQuantity(quantity: number): Promise<void> {
    this.logger.info(`Selecting quantity: ${quantity}`);
    await this.selectOption(this.quantitySelector, quantity.toString());
  }

  async selectSize(size: string): Promise<void> {
    this.logger.info(`Selecting size: ${size}`);
    await this.selectOption(this.sizeSelector, size);
  }

  async selectColor(color: string): Promise<void> {
    this.logger.info(`Selecting color: ${color}`);
    await this.selectOption(this.colorSelector, color);
  }

  async addToCart(): Promise<void> {
    this.logger.info('Adding product to cart');
    await this.clickElement(this.addToCartButton);
    await this.waitForLoadingToComplete();
  }

  async buyNow(): Promise<void> {
    this.logger.info('Clicking buy now');
    await this.clickElement(this.buyNowButton);
    await this.waitForPageLoad();
  }

  async addToWishlist(): Promise<void> {
    this.logger.info('Adding product to wishlist');
    await this.clickElement(this.wishlistButton);
  }

  async getStockStatus(): Promise<string> {
    this.logger.info('Getting stock status');
    return await this.getText(this.stockStatus);
  }

  async isInStock(): Promise<boolean> {
    const status = await this.getStockStatus();
    return status.toLowerCase().includes('in stock');
  }

  async getProductRating(): Promise<string> {
    this.logger.info('Getting product rating');
    return await this.getText(this.productRating);
  }

  async clickReviewsTab(): Promise<void> {
    this.logger.info('Clicking reviews tab');
    await this.clickElement(this.reviewsTab);
  }

  async clickSpecificationsTab(): Promise<void> {
    this.logger.info('Clicking specifications tab');
    await this.clickElement(this.specificationsTab);
  }

  async viewRelatedProducts(): Promise<string[]> {
    this.logger.info('Getting related products');
    await this.relatedProducts.scrollIntoViewIfNeeded();
    
    const productNames: string[] = [];
    const products = this.relatedProducts.locator('.product-card, [data-testid="product-card"]');
    const count = await products.count();
    
    for (let i = 0; i < count; i++) {
      const nameElement = products.nth(i).locator('.product-name, [data-testid="product-name"]');
      const name = await this.getText(nameElement);
      if (name) {
        productNames.push(name);
      }
    }
    
    return productNames;
  }

  async clickRelatedProduct(index: number): Promise<void> {
    this.logger.info(`Clicking related product at index: ${index}`);
    const product = this.relatedProducts.locator('.product-card, [data-testid="product-card"]').nth(index);
    await this.clickElement(product);
    await this.waitForPageLoad();
  }

  async clickThumbnailImage(index: number): Promise<void> {
    this.logger.info(`Clicking thumbnail image at index: ${index}`);
    const thumbnail = this.thumbnailImages.nth(index);
    await this.clickElement(thumbnail);
  }

  async zoomMainImage(): Promise<void> {
    this.logger.info('Zooming main product image');
    await this.clickElement(this.zoomButton);
  }

  async shareProduct(): Promise<void> {
    this.logger.info('Sharing product');
    await this.clickElement(this.shareButton);
  }

  async verifyProductPageElements(): Promise<void> {
    this.logger.info('Verifying product page elements');
    await expect(this.productTitle).toBeVisible();
    await expect(this.productPrice).toBeVisible();
    await expect(this.addToCartButton).toBeVisible();
    await expect(this.mainProductImage).toBeVisible();
  }

  async verifyAddToCartSuccess(): Promise<void> {
    this.logger.info('Verifying add to cart success');
    const successMessage = this.page.locator('[data-testid="cart-success"], .cart-success-message');
    await expect(successMessage).toBeVisible();
  }

  async getAvailableSizes(): Promise<string[]> {
    this.logger.info('Getting available sizes');
    const sizes: string[] = [];
    const options = this.sizeSelector.locator('option');
    const count = await options.count();
    
    for (let i = 1; i < count; i++) { // Skip first option (usually "Select Size")
      const size = await options.nth(i).textContent();
      if (size) {
        sizes.push(size);
      }
    }
    
    return sizes;
  }

  async getAvailableColors(): Promise<string[]> {
    this.logger.info('Getting available colors');
    const colors: string[] = [];
    const options = this.colorSelector.locator('option');
    const count = await options.count();
    
    for (let i = 1; i < count; i++) { // Skip first option (usually "Select Color")
      const color = await options.nth(i).textContent();
      if (color) {
        colors.push(color);
      }
    }
    
    return colors;
  }

  async isAddToCartButtonEnabled(): Promise<boolean> {
    return await this.isEnabled(this.addToCartButton);
  }

  async getBreadcrumbPath(): Promise<string[]> {
    this.logger.info('Getting breadcrumb path');
    const breadcrumbItems: string[] = [];
    const items = this.breadcrumb.locator('a, span');
    const count = await items.count();
    
    for (let i = 0; i < count; i++) {
      const text = await this.getText(items.nth(i));
      if (text) {
        breadcrumbItems.push(text);
      }
    }
    
    return breadcrumbItems;
  }
}