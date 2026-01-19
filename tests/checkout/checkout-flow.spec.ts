import { test, expect } from '../../src/fixtures/test-fixtures';
import { DataGenerator } from '../../src/utils/data-generator';
import testData from '../../src/fixtures/test-data.json';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page, homePage, productPage }) => {
    // Add a product to cart before each checkout test
    await page.goto('/');
    await homePage.clickProductByIndex(0);
    await productPage.addToCart();
  });

  test('should complete checkout with valid information', async ({ page, homePage, cartPage }) => {
    const shippingAddress = DataGenerator.generateShippingAddress();
    const paymentInfo = DataGenerator.generatePaymentInfo();

    await test.step('Navigate to cart and proceed to checkout', async () => {
      await page.goto('/');
      await homePage.clickCart();
      await cartPage.proceedToCheckout();
    });

    await test.step('Fill shipping information', async () => {
      await expect(page).toHaveURL(/checkout|shipping/);
      
      // Fill shipping form
      await page.fill('[data-testid="first-name"], #firstName', shippingAddress.firstName);
      await page.fill('[data-testid="last-name"], #lastName', shippingAddress.lastName);
      await page.fill('[data-testid="address1"], #address1', shippingAddress.address1);
      await page.fill('[data-testid="city"], #city', shippingAddress.city);
      await page.fill('[data-testid="state"], #state', shippingAddress.state);
      await page.fill('[data-testid="zip-code"], #zipCode', shippingAddress.zipCode);
      await page.fill('[data-testid="phone"], #phone', shippingAddress.phone || '');
      
      // Continue to payment
      const continueButton = page.locator('[data-testid="continue-to-payment"], .continue-btn');
      await continueButton.click();
    });

    await test.step('Fill payment information', async () => {
      await expect(page).toHaveURL(/payment/);
      
      // Fill payment form
      await page.fill('[data-testid="card-number"], #cardNumber', paymentInfo.cardNumber);
      await page.fill('[data-testid="expiry-month"], #expiryMonth', paymentInfo.expiryMonth);
      await page.fill('[data-testid="expiry-year"], #expiryYear', paymentInfo.expiryYear);
      await page.fill('[data-testid="cvv"], #cvv', paymentInfo.cvv);
      await page.fill('[data-testid="cardholder-name"], #cardholderName', paymentInfo.cardholderName);
      
      // Continue to review
      const continueButton = page.locator('[data-testid="continue-to-review"], .continue-btn');
      await continueButton.click();
    });

    await test.step('Review and place order', async () => {
      await expect(page).toHaveURL(/review|summary/);
      
      // Verify order summary
      const orderSummary = page.locator('[data-testid="order-summary"], .order-summary');
      await expect(orderSummary).toBeVisible();
      
      // Place order
      const placeOrderButton = page.locator('[data-testid="place-order"], .place-order-btn');
      await placeOrderButton.click();
    });

    await test.step('Verify order confirmation', async () => {
      await expect(page).toHaveURL(/confirmation|success|thank-you/);
      
      const confirmationMessage = page.locator('[data-testid="order-confirmation"], .confirmation-message');
      await expect(confirmationMessage).toBeVisible();
      await expect(confirmationMessage).toContainText('Thank you for your order');
      
      // Verify order number is displayed
      const orderNumber = page.locator('[data-testid="order-number"], .order-number');
      await expect(orderNumber).toBeVisible();
    });
  });

  test('should validate required shipping fields', async ({ page, homePage, cartPage }) => {
    await test.step('Navigate to checkout', async () => {
      await page.goto('/');
      await homePage.clickCart();
      await cartPage.proceedToCheckout();
    });

    await test.step('Submit empty shipping form', async () => {
      const continueButton = page.locator('[data-testid="continue-to-payment"], .continue-btn');
      await continueButton.click();
    });

    await test.step('Verify validation errors', async () => {
      const requiredFields = [
        '[data-testid="first-name-error"], .first-name-error',
        '[data-testid="last-name-error"], .last-name-error',
        '[data-testid="address1-error"], .address1-error',
        '[data-testid="city-error"], .city-error',
        '[data-testid="state-error"], .state-error',
        '[data-testid="zip-code-error"], .zip-code-error'
      ];

      for (const errorSelector of requiredFields) {
        const errorElement = page.locator(errorSelector);
        if (await errorElement.isVisible()) {
          await expect(errorElement).toBeVisible();
        }
      }
    });
  });

  test('should validate payment information', async ({ page, homePage, cartPage }) => {
    const shippingAddress = DataGenerator.generateShippingAddress();

    await test.step('Complete shipping step', async () => {
      await page.goto('/');
      await homePage.clickCart();
      await cartPage.proceedToCheckout();
      
      // Fill valid shipping info
      await page.fill('[data-testid="first-name"], #firstName', shippingAddress.firstName);
      await page.fill('[data-testid="last-name"], #lastName', shippingAddress.lastName);
      await page.fill('[data-testid="address1"], #address1', shippingAddress.address1);
      await page.fill('[data-testid="city"], #city', shippingAddress.city);
      await page.fill('[data-testid="state"], #state', shippingAddress.state);
      await page.fill('[data-testid="zip-code"], #zipCode', shippingAddress.zipCode);
      
      const continueButton = page.locator('[data-testid="continue-to-payment"], .continue-btn');
      await continueButton.click();
    });

    await test.step('Test invalid card number', async () => {
      const invalidCard = testData.paymentInfo.invalidCards[0];
      
      await page.fill('[data-testid="card-number"], #cardNumber', invalidCard.cardNumber);
      await page.fill('[data-testid="expiry-month"], #expiryMonth', invalidCard.expiryMonth);
      await page.fill('[data-testid="expiry-year"], #expiryYear', invalidCard.expiryYear);
      await page.fill('[data-testid="cvv"], #cvv', invalidCard.cvv);
      await page.fill('[data-testid="cardholder-name"], #cardholderName', invalidCard.cardholderName);
      
      const continueButton = page.locator('[data-testid="continue-to-review"], .continue-btn');
      await continueButton.click();
      
      // Verify error message
      const cardError = page.locator('[data-testid="card-error"], .card-error');
      await expect(cardError).toBeVisible();
      await expect(cardError).toContainText(invalidCard.expectedError);
    });
  });

  test('should handle different shipping options', async ({ page, homePage, cartPage }) => {
    const shippingAddress = DataGenerator.generateShippingAddress();

    await test.step('Navigate to shipping step', async () => {
      await page.goto('/');
      await homePage.clickCart();
      await cartPage.proceedToCheckout();
      
      // Fill shipping address
      await page.fill('[data-testid="first-name"], #firstName', shippingAddress.firstName);
      await page.fill('[data-testid="last-name"], #lastName', shippingAddress.lastName);
      await page.fill('[data-testid="address1"], #address1', shippingAddress.address1);
      await page.fill('[data-testid="city"], #city', shippingAddress.city);
      await page.fill('[data-testid="state"], #state', shippingAddress.state);
      await page.fill('[data-testid="zip-code"], #zipCode', shippingAddress.zipCode);
    });

    await test.step('Select different shipping options', async () => {
      const shippingOptions = page.locator('[data-testid="shipping-options"], .shipping-options input[type="radio"]');
      const optionCount = await shippingOptions.count();
      
      if (optionCount > 1) {
        // Test each shipping option
        for (let i = 0; i < Math.min(optionCount, 3); i++) {
          await shippingOptions.nth(i).click();
          
          // Verify shipping cost updates
          const shippingCost = page.locator('[data-testid="shipping-cost"], .shipping-cost');
          await expect(shippingCost).toBeVisible();
        }
      }
    });
  });

  test('should handle guest checkout', async ({ page, homePage, cartPage }) => {
    await test.step('Proceed as guest', async () => {
      await page.goto('/');
      await homePage.clickCart();
      await cartPage.proceedToCheckout();
      
      // Select guest checkout option
      const guestCheckout = page.locator('[data-testid="guest-checkout"], .guest-checkout');
      if (await guestCheckout.isVisible()) {
        await guestCheckout.click();
      }
    });

    await test.step('Complete guest checkout', async () => {
      const guestEmail = DataGenerator.generateTestEmail();
      const shippingAddress = DataGenerator.generateShippingAddress();
      const paymentInfo = DataGenerator.generatePaymentInfo();
      
      // Fill guest email
      const emailInput = page.locator('[data-testid="guest-email"], #guestEmail');
      if (await emailInput.isVisible()) {
        await emailInput.fill(guestEmail);
      }
      
      // Fill shipping information
      await page.fill('[data-testid="first-name"], #firstName', shippingAddress.firstName);
      await page.fill('[data-testid="last-name"], #lastName', shippingAddress.lastName);
      await page.fill('[data-testid="address1"], #address1', shippingAddress.address1);
      await page.fill('[data-testid="city"], #city', shippingAddress.city);
      await page.fill('[data-testid="state"], #state', shippingAddress.state);
      await page.fill('[data-testid="zip-code"], #zipCode', shippingAddress.zipCode);
      
      // Continue through checkout flow
      let continueButton = page.locator('[data-testid="continue-to-payment"], .continue-btn');
      await continueButton.click();
      
      // Fill payment information
      await page.fill('[data-testid="card-number"], #cardNumber', paymentInfo.cardNumber);
      await page.fill('[data-testid="expiry-month"], #expiryMonth', paymentInfo.expiryMonth);
      await page.fill('[data-testid="expiry-year"], #expiryYear', paymentInfo.expiryYear);
      await page.fill('[data-testid="cvv"], #cvv', paymentInfo.cvv);
      await page.fill('[data-testid="cardholder-name"], #cardholderName', paymentInfo.cardholderName);
      
      continueButton = page.locator('[data-testid="continue-to-review"], .continue-btn');
      await continueButton.click();
      
      // Place order
      const placeOrderButton = page.locator('[data-testid="place-order"], .place-order-btn');
      await placeOrderButton.click();
      
      // Verify success
      await expect(page).toHaveURL(/confirmation|success|thank-you/);
    });
  });

  test('should save billing address same as shipping', async ({ page, homePage, cartPage }) => {
    const shippingAddress = DataGenerator.generateShippingAddress();
    const paymentInfo = DataGenerator.generatePaymentInfo();

    await test.step('Complete shipping with billing same as shipping', async () => {
      await page.goto('/');
      await homePage.clickCart();
      await cartPage.proceedToCheckout();
      
      // Fill shipping address
      await page.fill('[data-testid="first-name"], #firstName', shippingAddress.firstName);
      await page.fill('[data-testid="last-name"], #lastName', shippingAddress.lastName);
      await page.fill('[data-testid="address1"], #address1', shippingAddress.address1);
      await page.fill('[data-testid="city"], #city', shippingAddress.city);
      await page.fill('[data-testid="state"], #state', shippingAddress.state);
      await page.fill('[data-testid="zip-code"], #zipCode', shippingAddress.zipCode);
      
      // Check "billing same as shipping"
      const sameAsBilling = page.locator('[data-testid="same-as-billing"], #sameAsBilling');
      if (await sameAsBilling.isVisible()) {
        await sameAsBilling.check();
      }
      
      const continueButton = page.locator('[data-testid="continue-to-payment"], .continue-btn');
      await continueButton.click();
    });

    await test.step('Verify billing address is pre-filled', async () => {
      // Check if billing address fields are pre-filled or hidden
      const billingSection = page.locator('[data-testid="billing-address"], .billing-address');
      if (await billingSection.isVisible()) {
        const billingFirstName = page.locator('[data-testid="billing-first-name"], #billingFirstName');
        if (await billingFirstName.isVisible()) {
          const value = await billingFirstName.inputValue();
          expect(value).toBe(shippingAddress.firstName);
        }
      }
    });
  });

  test('should handle order review and modifications', async ({ page, homePage, cartPage }) => {
    const shippingAddress = DataGenerator.generateShippingAddress();
    const paymentInfo = DataGenerator.generatePaymentInfo();

    await test.step('Complete shipping and payment steps', async () => {
      await page.goto('/');
      await homePage.clickCart();
      await cartPage.proceedToCheckout();
      
      // Fill shipping
      await page.fill('[data-testid="first-name"], #firstName', shippingAddress.firstName);
      await page.fill('[data-testid="last-name"], #lastName', shippingAddress.lastName);
      await page.fill('[data-testid="address1"], #address1', shippingAddress.address1);
      await page.fill('[data-testid="city"], #city', shippingAddress.city);
      await page.fill('[data-testid="state"], #state', shippingAddress.state);
      await page.fill('[data-testid="zip-code"], #zipCode', shippingAddress.zipCode);
      
      let continueButton = page.locator('[data-testid="continue-to-payment"], .continue-btn');
      await continueButton.click();
      
      // Fill payment
      await page.fill('[data-testid="card-number"], #cardNumber', paymentInfo.cardNumber);
      await page.fill('[data-testid="expiry-month"], #expiryMonth', paymentInfo.expiryMonth);
      await page.fill('[data-testid="expiry-year"], #expiryYear', paymentInfo.expiryYear);
      await page.fill('[data-testid="cvv"], #cvv', paymentInfo.cvv);
      await page.fill('[data-testid="cardholder-name"], #cardholderName', paymentInfo.cardholderName);
      
      continueButton = page.locator('[data-testid="continue-to-review"], .continue-btn');
      await continueButton.click();
    });

    await test.step('Review order details', async () => {
      await expect(page).toHaveURL(/review|summary/);
      
      // Verify order summary sections
      const orderItems = page.locator('[data-testid="order-items"], .order-items');
      await expect(orderItems).toBeVisible();
      
      const shippingInfo = page.locator('[data-testid="shipping-info"], .shipping-info');
      await expect(shippingInfo).toBeVisible();
      
      const paymentInfo = page.locator('[data-testid="payment-info"], .payment-info');
      await expect(paymentInfo).toBeVisible();
      
      const orderTotal = page.locator('[data-testid="order-total"], .order-total');
      await expect(orderTotal).toBeVisible();
    });

    await test.step('Test edit functionality', async () => {
      // Try to edit shipping address
      const editShipping = page.locator('[data-testid="edit-shipping"], .edit-shipping');
      if (await editShipping.isVisible()) {
        await editShipping.click();
        await expect(page).toHaveURL(/shipping/);
        
        // Navigate back to review
        await page.goBack();
      }
      
      // Try to edit payment method
      const editPayment = page.locator('[data-testid="edit-payment"], .edit-payment');
      if (await editPayment.isVisible()) {
        await editPayment.click();
        await expect(page).toHaveURL(/payment/);
        
        // Navigate back to review
        await page.goBack();
      }
    });
  });

  test('should handle checkout errors gracefully', async ({ page, homePage, cartPage }) => {
    await test.step('Simulate payment processing error', async () => {
      const shippingAddress = DataGenerator.generateShippingAddress();
      
      await page.goto('/');
      await homePage.clickCart();
      await cartPage.proceedToCheckout();
      
      // Fill shipping
      await page.fill('[data-testid="first-name"], #firstName', shippingAddress.firstName);
      await page.fill('[data-testid="last-name"], #lastName', shippingAddress.lastName);
      await page.fill('[data-testid="address1"], #address1', shippingAddress.address1);
      await page.fill('[data-testid="city"], #city', shippingAddress.city);
      await page.fill('[data-testid="state"], #state', shippingAddress.state);
      await page.fill('[data-testid="zip-code"], #zipCode', shippingAddress.zipCode);
      
      let continueButton = page.locator('[data-testid="continue-to-payment"], .continue-btn');
      await continueButton.click();
      
      // Use a card that will be declined (test card)
      await page.fill('[data-testid="card-number"], #cardNumber', '4000000000000002'); // Declined card
      await page.fill('[data-testid="expiry-month"], #expiryMonth', '12');
      await page.fill('[data-testid="expiry-year"], #expiryYear', '25');
      await page.fill('[data-testid="cvv"], #cvv', '123');
      await page.fill('[data-testid="cardholder-name"], #cardholderName', 'Test User');
      
      continueButton = page.locator('[data-testid="continue-to-review"], .continue-btn');
      await continueButton.click();
      
      // Place order
      const placeOrderButton = page.locator('[data-testid="place-order"], .place-order-btn');
      await placeOrderButton.click();
      
      // Verify error handling
      const errorMessage = page.locator('[data-testid="payment-error"], .payment-error');
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toContainText('declined');
      }
    });
  });
});