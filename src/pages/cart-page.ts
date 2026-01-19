import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class CartPage extends BasePage {
  // Locators
  private get cartItems(): Locator {
    return this.page.locator('[data-testid="cart-item"], .cart-item');
  }

  private get emptyCartMessage(): Locator {
    return this.page.locator('[data-testid="empty-cart"], .empty-cart-message');
  }

  private get continueShoppingButton(): Locator {
    return this.page.locator('[data-testid="continue-shopping"], .continue-shopping-btn');
  }

  private get checkoutButton(): Locator {
    return this.page.locator('[data-testid="checkout-button"], .checkout-btn, button:has-text("Checkout")');
  }

  private get subtotalAmount(): Locator {
    return this.page.locator('[data-testid="subtotal"], .subtotal-amount');
  }

  private get taxAmount(): Locator {
    return this.page.locator('[data-testid="tax-amount"], .tax-amount');
  }

  private get shippingAmount(): Locator {
    return this.page.locator('[data-testid="shipping-amount"], .shipping-amount');
  }

  private get totalAmount(): Locator {
    return this.page.locator('[data-testid="total-amount"], .total-amount');
  }

  private get promoCodeInput(): Locator {
    return this.page.locator('[data-testid="promo-code"], input[name="promoCode"]');
  }

  private get applyPromoButton(): Locator {
    return this.page.locator('[data-testid="apply-promo"], .apply-promo-btn');
  }

  private get clearCartButton(): Locator {
    return this.page.locator('[data-testid="clear-cart"], .clear-cart-btn');
  }

  private get saveForLaterButtons(): Locator {
    return this.page.locator('[data-testid="save-for-later"], .save-for-later-btn');
  }

  private get cartSummary(): Locator {
    return this.page.locator('[data-testid="cart-summary"], .cart-summary');
  }

  constructor(page: Page) {
    super(page);
  }

  async isLoaded(): Promise<boolean> {
    try {
      // Cart page is loaded if either cart items or empty cart message is visible
      await Promise.race([
        this.cartItems.first().waitFor({ state: 'visible', timeout: 5000 }),
        this.emptyCartMessage.waitFor({ state: 'visible', timeout: 5000 })
      ]);
      return true;
    } catch {
      return false;
    }
  }

  async getCartItemCount(): Promise<number> {
    this.logger.info('Getting cart item count');
    return await this.cartItems.count();
  }

  async isCartEmpty(): Promise<boolean> {
    this.logger.info('Checking if cart is empty');
    return await this.isVisible(this.emptyCartMessage);
  }

  async getCartItemByIndex(index: number): Promise<{
    name: string;
    price: string;
    quantity: number;
  }> {
    this.logger.info(`Getting cart item at index: ${index}`);
    const item = this.cartItems.nth(index);
    
    const nameElement = item.locator('[data-testid="item-name"], .item-name');
    const priceElement = item.locator('[data-testid="item-price"], .item-price');
    const quantityElement = item.locator('[data-testid="item-quantity"], .quantity-input, input[type="number"]');
    
    const name = await this.getText(nameElement);
    const price = await this.getText(priceElement);
    const quantityValue = await quantityElement.inputValue();
    const quantity = parseInt(quantityValue) || 1;
    
    return { name, price, quantity };
  }

  async updateItemQuantity(itemIndex: number, quantity: number): Promise<void> {
    this.logger.info(`Updating item ${itemIndex} quantity to: ${quantity}`);
    const item = this.cartItems.nth(itemIndex);
    const quantityInput = item.locator('[data-testid="quantity-input"], .quantity-input, input[type="number"]');
    
    await quantityInput.clear();
    await this.fillElement(quantityInput, quantity.toString());
    
    // Trigger update (usually by pressing Enter or clicking update button)
    const updateButton = item.locator('[data-testid="update-quantity"], .update-btn');
    if (await updateButton.isVisible()) {
      await this.clickElement(updateButton);
    } else {
      await quantityInput.press('Enter');
    }
    
    await this.waitForLoadingToComplete();
  }

  async removeItem(itemIndex: number): Promise<void> {
    this.logger.info(`Removing item at index: ${itemIndex}`);
    const item = this.cartItems.nth(itemIndex);
    const removeButton = item.locator('[data-testid="remove-item"], .remove-btn, button:has-text("Remove")');
    
    await this.clickElement(removeButton);
    await this.waitForLoadingToComplete();
  }

  async removeItemByName(itemName: string): Promise<void> {
    this.logger.info(`Removing item by name: ${itemName}`);
    const item = this.page.locator(`[data-testid="cart-item"]:has-text("${itemName}")`);
    const removeButton = item.locator('[data-testid="remove-item"], .remove-btn');
    
    await this.clickElement(removeButton);
    await this.waitForLoadingToComplete();
  }

  async saveItemForLater(itemIndex: number): Promise<void> {
    this.logger.info(`Saving item ${itemIndex} for later`);
    const saveButton = this.saveForLaterButtons.nth(itemIndex);
    await this.clickElement(saveButton);
    await this.waitForLoadingToComplete();
  }

  async getSubtotal(): Promise<string> {
    this.logger.info('Getting subtotal amount');
    return await this.getText(this.subtotalAmount);
  }

  async getTax(): Promise<string> {
    this.logger.info('Getting tax amount');
    return await this.getText(this.taxAmount);
  }

  async getShipping(): Promise<string> {
    this.logger.info('Getting shipping amount');
    return await this.getText(this.shippingAmount);
  }

  async getTotal(): Promise<string> {
    this.logger.info('Getting total amount');
    return await this.getText(this.totalAmount);
  }

  async applyPromoCode(promoCode: string): Promise<void> {
    this.logger.info(`Applying promo code: ${promoCode}`);
    await this.fillElement(this.promoCodeInput, promoCode);
    await this.clickElement(this.applyPromoButton);
    await this.waitForLoadingToComplete();
  }

  async proceedToCheckout(): Promise<void> {
    this.logger.info('Proceeding to checkout');
    await this.clickElement(this.checkoutButton);
    await this.waitForPageLoad();
  }

  async continueShopping(): Promise<void> {
    this.logger.info('Continuing shopping');
    await this.clickElement(this.continueShoppingButton);
    await this.waitForPageLoad();
  }

  async clearCart(): Promise<void> {
    this.logger.info('Clearing cart');
    await this.clickElement(this.clearCartButton);
    
    // Handle confirmation dialog if present
    this.page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await this.waitForLoadingToComplete();
  }

  async verifyCartSummary(): Promise<void> {
    this.logger.info('Verifying cart summary elements');
    await expect(this.subtotalAmount).toBeVisible();
    await expect(this.totalAmount).toBeVisible();
    await expect(this.checkoutButton).toBeVisible();
  }

  async verifyEmptyCart(): Promise<void> {
    this.logger.info('Verifying empty cart state');
    await expect(this.emptyCartMessage).toBeVisible();
    await expect(this.continueShoppingButton).toBeVisible();
  }

  async verifyItemInCart(itemName: string): Promise<void> {
    this.logger.info(`Verifying item in cart: ${itemName}`);
    const item = this.page.locator(`[data-testid="cart-item"]:has-text("${itemName}")`);
    await expect(item).toBeVisible();
  }

  async verifyItemNotInCart(itemName: string): Promise<void> {
    this.logger.info(`Verifying item not in cart: ${itemName}`);
    const item = this.page.locator(`[data-testid="cart-item"]:has-text("${itemName}")`);
    await expect(item).not.toBeVisible();
  }

  async getAllCartItems(): Promise<Array<{
    name: string;
    price: string;
    quantity: number;
  }>> {
    this.logger.info('Getting all cart items');
    const items = [];
    const itemCount = await this.getCartItemCount();
    
    for (let i = 0; i < itemCount; i++) {
      const item = await this.getCartItemByIndex(i);
      items.push(item);
    }
    
    return items;
  }

  async verifyPromoCodeApplied(expectedDiscount: string): Promise<void> {
    this.logger.info(`Verifying promo code applied with discount: ${expectedDiscount}`);
    const discountElement = this.page.locator('[data-testid="discount-amount"], .discount-amount');
    await expect(discountElement).toBeVisible();
    await expect(discountElement).toContainText(expectedDiscount);
  }

  async verifyPromoCodeError(expectedError: string): Promise<void> {
    this.logger.info('Verifying promo code error');
    const errorElement = this.page.locator('[data-testid="promo-error"], .promo-error');
    await expect(errorElement).toBeVisible();
    await expect(errorElement).toContainText(expectedError);
  }

  async isCheckoutButtonEnabled(): Promise<boolean> {
    return await this.isEnabled(this.checkoutButton);
  }

  async calculateExpectedTotal(): Promise<number> {
    this.logger.info('Calculating expected total');
    const items = await this.getAllCartItems();
    let total = 0;
    
    for (const item of items) {
      const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      total += price * item.quantity;
    }
    
    return total;
  }
}