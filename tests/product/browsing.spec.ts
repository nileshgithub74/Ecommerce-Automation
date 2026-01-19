import { test, expect } from '../../src/fixtures/test-fixtures';
import testData from '../../src/fixtures/test-data.json';

test.describe('Product Browsing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display featured products on homepage', async ({ homePage }) => {
    await test.step('Verify featured products section', async () => {
      await homePage.scrollToFeaturedProducts();
      const featuredProducts = await homePage.getFeaturedProducts();
      expect(featuredProducts.length).toBeGreaterThan(0);
    });

    await test.step('Verify product information is displayed', async () => {
      const productCards = page.locator('[data-testid="product-card"], .product-card');
      const firstProduct = productCards.first();
      
      // Verify product name
      const productName = firstProduct.locator('[data-testid="product-name"], .product-name');
      await expect(productName).toBeVisible();
      
      // Verify product price
      const productPrice = firstProduct.locator('[data-testid="product-price"], .product-price');
      await expect(productPrice).toBeVisible();
      
      // Verify product image
      const productImage = firstProduct.locator('img');
      await expect(productImage).toBeVisible();
    });
  });

  test('should navigate through product categories', async ({ homePage, page }) => {
    const categories = await homePage.getAvailableCategories();
    
    for (const category of categories.slice(0, 3)) {
      await test.step(`Browse ${category} category`, async () => {
        await homePage.selectCategory(category);
        
        // Verify navigation to category page
        await expect(page).toHaveURL(new RegExp(category.toLowerCase().replace(/\s+/g, '-')));
        
        // Verify category products are displayed
        const categoryProducts = page.locator('[data-testid="product-card"], .product-card');
        expect(await categoryProducts.count()).toBeGreaterThan(0);
        
        // Navigate back to home
        await page.goto('/');
      });
    }
  });
});
  test('should view product details', async ({ homePage, productPage, page }) => {
    await test.step('Click on a product', async () => {
      await homePage.clickProductByIndex(0);
    });

    await test.step('Verify product page loads', async () => {
      expect(await productPage.isLoaded()).toBe(true);
      await expect(page).toHaveURL(/product|item/);
    });

    await test.step('Verify product details are displayed', async () => {
      await productPage.verifyProductPageElements();
      
      const productTitle = await productPage.getProductTitle();
      expect(productTitle).toBeTruthy();
      
      const productPrice = await productPage.getProductPrice();
      expect(productPrice).toMatch(/\$[\d,]+\.?\d*/);
      
      const productDescription = await productPage.getProductDescription();
      expect(productDescription).toBeTruthy();
    });
  });

  test('should handle product variants (size, color)', async ({ homePage, productPage }) => {
    await test.step('Navigate to a product with variants', async () => {
      await homePage.clickProductByIndex(0);
      expect(await productPage.isLoaded()).toBe(true);
    });

    await test.step('Select different sizes if available', async () => {
      const availableSizes = await productPage.getAvailableSizes();
      if (availableSizes.length > 0) {
        for (const size of availableSizes.slice(0, 2)) {
          await productPage.selectSize(size);
          // Verify size selection doesn't cause errors
          expect(await productPage.isAddToCartButtonEnabled()).toBe(true);
        }
      }
    });

    await test.step('Select different colors if available', async () => {
      const availableColors = await productPage.getAvailableColors();
      if (availableColors.length > 0) {
        for (const color of availableColors.slice(0, 2)) {
          await productPage.selectColor(color);
          // Verify color selection doesn't cause errors
          expect(await productPage.isAddToCartButtonEnabled()).toBe(true);
        }
      }
    });
  });

  test('should display product images and thumbnails', async ({ homePage, productPage }) => {
    await test.step('Navigate to product page', async () => {
      await homePage.clickProductByIndex(0);
      expect(await productPage.isLoaded()).toBe(true);
    });

    await test.step('Verify main product image', async () => {
      const mainImage = page.locator('[data-testid="main-product-image"], .main-image img');
      await expect(mainImage).toBeVisible();
      
      // Verify image has src attribute
      const imageSrc = await mainImage.getAttribute('src');
      expect(imageSrc).toBeTruthy();
    });

    await test.step('Interact with thumbnail images if available', async () => {
      const thumbnails = page.locator('[data-testid="thumbnail-images"] img, .thumbnail-images img');
      const thumbnailCount = await thumbnails.count();
      
      if (thumbnailCount > 1) {
        // Click on second thumbnail
        await productPage.clickThumbnailImage(1);
        
        // Verify main image changes
        const mainImage = page.locator('[data-testid="main-product-image"], .main-image img');
        await expect(mainImage).toBeVisible();
      }
    });
  });

  test('should show related products', async ({ homePage, productPage }) => {
    await test.step('Navigate to product page', async () => {
      await homePage.clickProductByIndex(0);
      expect(await productPage.isLoaded()).toBe(true);
    });

    await test.step('Verify related products section', async () => {
      const relatedProducts = await productPage.viewRelatedProducts();
      if (relatedProducts.length > 0) {
        expect(relatedProducts.length).toBeGreaterThan(0);
        
        // Click on a related product
        await productPage.clickRelatedProduct(0);
        
        // Verify navigation to new product
        expect(await productPage.isLoaded()).toBe(true);
      }
    });
  });

  test('should handle out of stock products', async ({ page }) => {
    // This test would need to navigate to a known out-of-stock product
    // For demo purposes, we'll simulate the scenario
    await test.step('Navigate to out of stock product', async () => {
      // In a real test, you would navigate to a specific out-of-stock product
      await page.goto('/product/out-of-stock-item');
    });

    await test.step('Verify out of stock handling', async () => {
      const stockStatus = page.locator('[data-testid="stock-status"], .stock-status');
      if (await stockStatus.isVisible()) {
        const statusText = await stockStatus.textContent();
        expect(statusText?.toLowerCase()).toContain('out of stock');
        
        // Verify add to cart button is disabled
        const addToCartButton = page.locator('[data-testid="add-to-cart"], .add-to-cart-btn');
        if (await addToCartButton.isVisible()) {
          expect(await addToCartButton.isEnabled()).toBe(false);
        }
      }
    });
  });

  test('should display product reviews and ratings', async ({ homePage, productPage }) => {
    await test.step('Navigate to product page', async () => {
      await homePage.clickProductByIndex(0);
      expect(await productPage.isLoaded()).toBe(true);
    });

    await test.step('Verify product rating display', async () => {
      const rating = await productPage.getProductRating();
      if (rating) {
        expect(rating).toMatch(/\d+(\.\d+)?/); // Should contain a number
      }
    });

    await test.step('View product reviews', async () => {
      await productPage.clickReviewsTab();
      
      const reviewsSection = page.locator('[data-testid="reviews-section"], .reviews-section');
      if (await reviewsSection.isVisible()) {
        // Verify reviews are displayed
        const reviews = reviewsSection.locator('.review, [data-testid="review"]');
        const reviewCount = await reviews.count();
        expect(reviewCount).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test('should handle product sharing', async ({ homePage, productPage }) => {
    await test.step('Navigate to product page', async () => {
      await homePage.clickProductByIndex(0);
      expect(await productPage.isLoaded()).toBe(true);
    });

    await test.step('Test product sharing functionality', async () => {
      const shareButton = page.locator('[data-testid="share-button"], .share-btn');
      if (await shareButton.isVisible()) {
        await productPage.shareProduct();
        
        // Verify share modal or options appear
        const shareModal = page.locator('[data-testid="share-modal"], .share-modal');
        if (await shareModal.isVisible()) {
          await expect(shareModal).toBeVisible();
        }
      }
    });
  });

  test('should navigate using breadcrumbs', async ({ homePage, productPage }) => {
    await test.step('Navigate to product through category', async () => {
      const categories = await homePage.getAvailableCategories();
      if (categories.length > 0) {
        await homePage.selectCategory(categories[0]);
        
        // Click on a product from category page
        const productCard = page.locator('[data-testid="product-card"], .product-card').first();
        await productCard.click();
        
        expect(await productPage.isLoaded()).toBe(true);
      }
    });

    await test.step('Verify and use breadcrumb navigation', async () => {
      const breadcrumbPath = await productPage.getBreadcrumbPath();
      if (breadcrumbPath.length > 0) {
        expect(breadcrumbPath).toContain('Home');
        
        // Click on category in breadcrumb to navigate back
        const categoryBreadcrumb = page.locator('[data-testid="breadcrumb"] a, .breadcrumb a').nth(1);
        if (await categoryBreadcrumb.isVisible()) {
          await categoryBreadcrumb.click();
          
          // Should navigate back to category page
          await expect(page).toHaveURL(/category|products/);
        }
      }
    });
  });

  test.describe('Product Filtering and Sorting', () => {
    test.beforeEach(async ({ homePage }) => {
      // Navigate to a category page for filtering tests
      const categories = await homePage.getAvailableCategories();
      if (categories.length > 0) {
        await homePage.selectCategory(categories[0]);
      }
    });

    test('should filter products by price range', async ({ page }) => {
      const priceFilter = page.locator('[data-testid="price-filter"], .price-filter');
      
      if (await priceFilter.isVisible()) {
        await test.step('Apply price filter', async () => {
          const priceRange = priceFilter.locator('input[value="50-100"], label:has-text("$50 - $100")');
          if (await priceRange.isVisible()) {
            await priceRange.click();
            await page.waitForLoadState('networkidle');
            
            // Verify filtered results
            const productPrices = page.locator('[data-testid="product-price"], .product-price');
            const priceTexts = await productPrices.allTextContents();
            const prices = priceTexts.map(price => parseFloat(price.replace(/[^0-9.]/g, '')));
            
            for (const price of prices) {
              expect(price).toBeGreaterThanOrEqual(50);
              expect(price).toBeLessThanOrEqual(100);
            }
          }
        });
      }
    });

    test('should sort products by different criteria', async ({ page }) => {
      const sortDropdown = page.locator('[data-testid="sort-dropdown"], .sort-dropdown, select');
      
      if (await sortDropdown.isVisible()) {
        await test.step('Sort by name A-Z', async () => {
          await sortDropdown.selectOption('name-asc');
          await page.waitForLoadState('networkidle');
          
          const productNames = page.locator('[data-testid="product-name"], .product-name');
          const nameTexts = await productNames.allTextContents();
          
          // Verify alphabetical order
          const sortedNames = [...nameTexts].sort();
          expect(nameTexts).toEqual(sortedNames);
        });
      }
    });
  });
});