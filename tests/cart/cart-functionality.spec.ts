import { test, expect } from '../../src/fixtures/test-fixtures';
import testData from '../../src/fixtures/test-data.json';

test.describe('Cart Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should add product to cart', async ({ homePage, productPage, cartPage }) => {
    await test.step('Navigate to product page', async () => {
      await homePage.clickProductByIndex(0);
      expect(await productPage.isLoaded()).toBe(true);
    });

    await test.step('Add product to cart', async () => {
      const productTitle = await productPage.getProductTitle();
      await productPage.addToCart();
      
      // Verify success message
      await productPage.verifyAddToCartSuccess();
    });

    await test.step('Verify cart count updated', async () => {
      await page.goto('/');
      const cartCount = await homePage.getCartItemCount();
      expect(cartCount).toBeGreaterThan(0);
    });

    await test.step('Verify product in cart', async () => {
      await homePage.clickCart();
      expect(await cartPage.isLoaded()).toBe(true);
      expect(await cartPage.isCartEmpty()).toBe(false);
      
      const cartItems = await cartPage.getAllCartItems();
      expect(cartItems.length).toBeGreaterThan(0);
    });
  });

  test('should add multiple products to cart', async ({ homePage, productPage, cartPage }) => {
    const productsToAdd = 3;
    
    for (let i = 0; i < productsToAdd; i++) {
      await test.step(`Add product ${i + 1} to cart`, async () => {
        await page.goto('/');
        await homePage.clickProductByIndex(i);
        expect(await productPage.isLoaded()).toBe(true);
        
        await productPage.addToCart();
        await productPage.verifyAddToCartSuccess();
      });
    }

    await test.step('Verify all products in cart', async () => {
      await page.goto('/');
      await homePage.clickCart();
      
      const cartItemCount = await cartPage.getCartItemCount();
      expect(cartItemCount).toBe(productsToAdd);
    });
  });
});
  test('should update product quantity in cart', async ({ homePage, productPage, cartPage }) => {
    await test.step('Add product to cart', async () => {
      await homePage.clickProductByIndex(0);
      await productPage.addToCart();
    });

    await test.step('Navigate to cart', async () => {
      await page.goto('/');
      await homePage.clickCart();
      expect(await cartPage.isLoaded()).toBe(true);
    });

    await test.step('Update quantity', async () => {
      const originalItem = await cartPage.getCartItemByIndex(0);
      const newQuantity = originalItem.quantity + 2;
      
      await cartPage.updateItemQuantity(0, newQuantity);
      
      // Verify quantity updated
      const updatedItem = await cartPage.getCartItemByIndex(0);
      expect(updatedItem.quantity).toBe(newQuantity);
    });

    await test.step('Verify total price updated', async () => {
      const total = await cartPage.getTotal();
      expect(total).toMatch(/\$[\d,]+\.?\d*/);
    });
  });

  test('should remove product from cart', async ({ homePage, productPage, cartPage }) => {
    await test.step('Add product to cart', async () => {
      await homePage.clickProductByIndex(0);
      const productTitle = await productPage.getProductTitle();
      await productPage.addToCart();
    });

    await test.step('Navigate to cart and remove item', async () => {
      await page.goto('/');
      await homePage.clickCart();
      
      const initialCount = await cartPage.getCartItemCount();
      await cartPage.removeItem(0);
      
      const finalCount = await cartPage.getCartItemCount();
      expect(finalCount).toBe(initialCount - 1);
    });
  });

  test('should clear entire cart', async ({ homePage, productPage, cartPage }) => {
    await test.step('Add multiple products to cart', async () => {
      for (let i = 0; i < 2; i++) {
        await page.goto('/');
        await homePage.clickProductByIndex(i);
        await productPage.addToCart();
      }
    });

    await test.step('Clear cart', async () => {
      await page.goto('/');
      await homePage.clickCart();
      
      await cartPage.clearCart();
      
      // Verify cart is empty
      expect(await cartPage.isCartEmpty()).toBe(true);
      await cartPage.verifyEmptyCart();
    });
  });

  test('should apply valid promo code', async ({ homePage, productPage, cartPage }) => {
    await test.step('Add product to cart', async () => {
      await homePage.clickProductByIndex(0);
      await productPage.addToCart();
    });

    await test.step('Apply promo code', async () => {
      await page.goto('/');
      await homePage.clickCart();
      
      const validPromo = testData.promoCodes.valid[0];
      await cartPage.applyPromoCode(validPromo.code);
      
      // Verify discount applied
      await cartPage.verifyPromoCodeApplied(validPromo.discount);
    });
  });

  test('should show error for invalid promo code', async ({ homePage, productPage, cartPage }) => {
    await test.step('Add product to cart', async () => {
      await homePage.clickProductByIndex(0);
      await productPage.addToCart();
    });

    await test.step('Apply invalid promo code', async () => {
      await page.goto('/');
      await homePage.clickCart();
      
      const invalidPromo = testData.promoCodes.invalid[0];
      await cartPage.applyPromoCode(invalidPromo.code);
      
      // Verify error message
      await cartPage.verifyPromoCodeError(invalidPromo.error);
    });
  });

  test('should save item for later', async ({ homePage, productPage, cartPage }) => {
    await test.step('Add product to cart', async () => {
      await homePage.clickProductByIndex(0);
      await productPage.addToCart();
    });

    await test.step('Save item for later', async () => {
      await page.goto('/');
      await homePage.clickCart();
      
      const initialCount = await cartPage.getCartItemCount();
      await cartPage.saveItemForLater(0);
      
      // Verify item moved to saved items
      const finalCount = await cartPage.getCartItemCount();
      expect(finalCount).toBe(initialCount - 1);
    });
  });

  test('should calculate correct totals', async ({ homePage, productPage, cartPage }) => {
    await test.step('Add multiple products with different quantities', async () => {
      // Add first product
      await homePage.clickProductByIndex(0);
      await productPage.selectQuantity(2);
      await productPage.addToCart();
      
      // Add second product
      await page.goto('/');
      await homePage.clickProductByIndex(1);
      await productPage.selectQuantity(1);
      await productPage.addToCart();
    });

    await test.step('Verify cart calculations', async () => {
      await page.goto('/');
      await homePage.clickCart();
      
      // Get all cart items and calculate expected total
      const cartItems = await cartPage.getAllCartItems();
      let expectedSubtotal = 0;
      
      for (const item of cartItems) {
        const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
        expectedSubtotal += price * item.quantity;
      }
      
      // Verify subtotal
      const subtotalText = await cartPage.getSubtotal();
      const actualSubtotal = parseFloat(subtotalText.replace(/[^0-9.]/g, ''));
      expect(Math.abs(actualSubtotal - expectedSubtotal)).toBeLessThan(0.01);
      
      // Verify total includes tax and shipping
      const totalText = await cartPage.getTotal();
      const actualTotal = parseFloat(totalText.replace(/[^0-9.]/g, ''));
      expect(actualTotal).toBeGreaterThanOrEqual(actualSubtotal);
    });
  });

  test('should persist cart across sessions', async ({ homePage, productPage, cartPage, page }) => {
    await test.step('Add product to cart', async () => {
      await homePage.clickProductByIndex(0);
      const productTitle = await productPage.getProductTitle();
      await productPage.addToCart();
    });

    await test.step('Refresh page and verify cart persists', async () => {
      await page.reload();
      await page.goto('/');
      
      const cartCount = await homePage.getCartItemCount();
      expect(cartCount).toBeGreaterThan(0);
      
      await homePage.clickCart();
      expect(await cartPage.isCartEmpty()).toBe(false);
    });
  });

  test('should handle cart with out of stock items', async ({ cartPage, page }) => {
    // This test assumes there's a way to add an item that becomes out of stock
    await test.step('Navigate to cart with out of stock item', async () => {
      // In a real scenario, you would set up test data with out of stock items
      await page.goto('/cart');
    });

    await test.step('Verify out of stock item handling', async () => {
      const outOfStockItems = page.locator('[data-testid="out-of-stock-item"], .out-of-stock-item');
      const outOfStockCount = await outOfStockItems.count();
      
      if (outOfStockCount > 0) {
        // Verify out of stock items are clearly marked
        const firstOutOfStockItem = outOfStockItems.first();
        await expect(firstOutOfStockItem).toContainText('Out of Stock');
        
        // Verify checkout is disabled or shows warning
        const checkoutButton = page.locator('[data-testid="checkout-button"], .checkout-btn');
        if (await checkoutButton.isVisible()) {
          // Should either be disabled or show warning
          const isEnabled = await checkoutButton.isEnabled();
          if (isEnabled) {
            // If enabled, should show warning about out of stock items
            const warning = page.locator('[data-testid="stock-warning"], .stock-warning');
            await expect(warning).toBeVisible();
          }
        }
      }
    });
  });

  test('should handle maximum quantity limits', async ({ homePage, productPage, cartPage }) => {
    await test.step('Add product to cart', async () => {
      await homePage.clickProductByIndex(0);
      await productPage.addToCart();
    });

    await test.step('Try to exceed maximum quantity', async () => {
      await page.goto('/');
      await homePage.clickCart();
      
      // Try to set a very high quantity
      const maxQuantity = 999;
      await cartPage.updateItemQuantity(0, maxQuantity);
      
      // Verify quantity is limited or shows error
      const updatedItem = await cartPage.getCartItemByIndex(0);
      expect(updatedItem.quantity).toBeLessThan(maxQuantity);
    });
  });

  test.describe('Cart Performance', () => {
    test('should handle large number of items efficiently', async ({ homePage, productPage, cartPage }) => {
      const itemsToAdd = 10;
      
      await test.step('Add multiple items to cart', async () => {
        for (let i = 0; i < itemsToAdd; i++) {
          await page.goto('/');
          await homePage.clickProductByIndex(i % 3); // Cycle through first 3 products
          await productPage.addToCart();
        }
      });

      await test.step('Verify cart performance with many items', async () => {
        const startTime = Date.now();
        
        await page.goto('/');
        await homePage.clickCart();
        expect(await cartPage.isLoaded()).toBe(true);
        
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
        
        const cartItemCount = await cartPage.getCartItemCount();
        expect(cartItemCount).toBe(itemsToAdd);
      });
    });
  });

  test.describe('Cart Edge Cases', () => {
    test('should handle concurrent cart modifications', async ({ homePage, productPage, cartPage, page }) => {
      await test.step('Add product to cart', async () => {
        await homePage.clickProductByIndex(0);
        await productPage.addToCart();
      });

      await test.step('Simulate concurrent modifications', async () => {
        await page.goto('/');
        await homePage.clickCart();
        
        // Simulate rapid quantity changes
        await cartPage.updateItemQuantity(0, 3);
        await cartPage.updateItemQuantity(0, 5);
        await cartPage.updateItemQuantity(0, 2);
        
        // Verify final state is consistent
        const finalItem = await cartPage.getCartItemByIndex(0);
        expect(finalItem.quantity).toBe(2);
      });
    });

    test('should handle cart operations with network issues', async ({ cartPage, page }) => {
      // This test would require network simulation capabilities
      // For now, we'll test basic error handling
      
      await test.step('Navigate to cart', async () => {
        await page.goto('/cart');
      });

      await test.step('Verify graceful error handling', async () => {
        // In a real test, you would simulate network failures
        // and verify the application handles them gracefully
        expect(await cartPage.isLoaded()).toBe(true);
      });
    });
  });
});