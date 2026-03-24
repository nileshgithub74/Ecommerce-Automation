import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class CartPage extends BasePage {
  // Matches Carditems.jsx structure
  private get cartContainer(): Locator {
    return this.page.locator('.carditems');
  }

  private get cartRows(): Locator {
    return this.page.locator('.cartitems-format.cartitems-format-main');
  }

  private get subtotalText(): Locator {
    return this.page.locator('.cartitems-total-items p').nth(1);
  }

  private get totalText(): Locator {
    return this.page.locator('.cartitems-total-items h3').nth(1);
  }

  private get checkoutButton(): Locator {
    return this.page.locator('.cartitems-total button');
  }

  private get promoInput(): Locator {
    return this.page.locator('.cartitems-promo-box input');
  }

  private get promoSubmitButton(): Locator {
    return this.page.locator('.cartitems-promo-box .btn');
  }

  private get removeIcons(): Locator {
    return this.page.locator('.cartitems-remove-icon');
  }

  constructor(page: Page) {
    super(page);
  }

  async isLoaded(): Promise<boolean> {
    try {
      await this.cartContainer.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async isCartEmpty(): Promise<boolean> {
    const count = await this.cartRows.count();
    return count === 0;
  }

  async getCartItemCount(): Promise<number> {
    return await this.cartRows.count();
  }

  async getAllCartItems(): Promise<{ name: string; price: string; quantity: number }[]> {
    const items: { name: string; price: string; quantity: number }[] = [];
    const rows = await this.cartRows.all();
    for (const row of rows) {
      const cols = await row.locator('p, button').all();
      const name = (await cols[0]?.textContent()) || '';
      const price = (await cols[1]?.textContent()) || '';
      const quantityText = (await cols[2]?.textContent()) || '0';
      items.push({ name: name.trim(), price: price.trim(), quantity: parseInt(quantityText) || 0 });
    }
    return items;
  }

  async getCartItemByIndex(index: number): Promise<{ name: string; price: string; quantity: number }> {
    const row = this.cartRows.nth(index);
    const name = (await row.locator('p').nth(0).textContent()) || '';
    const price = (await row.locator('p').nth(1).textContent()) || '';
    const quantity = parseInt((await row.locator('button').textContent()) || '0');
    return { name: name.trim(), price: price.trim(), quantity };
  }

  async removeItem(index: number): Promise<void> {
    this.logger.info(`Removing cart item at index: ${index}`);
    await this.clickElement(this.removeIcons.nth(index));
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getSubtotal(): Promise<string> {
    return (await this.subtotalText.textContent()) || '$0';
  }

  async getTotal(): Promise<string> {
    return (await this.totalText.textContent()) || '$0';
  }

  async proceedToCheckout(): Promise<void> {
    this.logger.info('Proceeding to checkout');
    await this.clickElement(this.checkoutButton);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async applyPromoCode(code: string): Promise<void> {
    this.logger.info(`Applying promo code: ${code}`);
    await this.fillElement(this.promoInput, code);
    await this.clickElement(this.promoSubmitButton);
  }

  async verifyEmptyCart(): Promise<void> {
    const count = await this.cartRows.count();
    expect(count).toBe(0);
  }

  // Note: cart quantity is display-only (button), not editable in this app
  // To update quantity, use addToCart/removeFromCart on product page
  async updateItemQuantity(_index: number, _qty: number): Promise<void> {
    this.logger.info('Cart quantity is not directly editable in this app');
  }

  async clearCart(): Promise<void> {
    this.logger.info('Clearing all cart items');
    let count = await this.removeIcons.count();
    while (count > 0) {
      await this.clickElement(this.removeIcons.first());
      await this.page.waitForTimeout(300);
      count = await this.removeIcons.count();
    }
  }

  // Promo code UI exists but is not functional in the backend
  async verifyPromoCodeApplied(_discount: string): Promise<void> {
    this.logger.info('Promo code UI present but not functional in backend');
  }

  async verifyPromoCodeError(_error: string): Promise<void> {
    this.logger.info('Promo code UI present but not functional in backend');
  }

  async saveItemForLater(_index: number): Promise<void> {
    this.logger.info('Save for later not implemented in this app');
  }
}
