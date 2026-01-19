import { test, expect } from '../../src/fixtures/test-fixtures';
import testData from '../../src/fixtures/test-data.json';

test.describe('Product Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should search for products with valid terms', async ({ homePage, page }) => {
    for (const searchTerm of testData.searchTerms.valid.slice(0, 3)) {
      await test.step(`Search for: ${searchTerm}`, async () => {
        await homePage.searchForProduct(searchTerm);
        
        // Verify search results page
        await expect(page).toHaveURL(new RegExp(`search.*${searchTerm}`));
        
        // Verify search results are displayed
        const searchResults = page.locator('[data-testid="search-results"], .search-results');
        await expect(searchResults).toBeVisible();
        
        // Verify at least one product is found
        const productCards = page.locator('[data-testid="product-card"], .product-card');
        expect(await productCards.count()).toBeGreaterThan(0);
      });
    }
  });

  test('should handle partial search matches', async ({ homePage, page }) => {
    for (const partialTerm of testData.searchTerms.partialMatch) {
      await test.step(`Search for partial term: ${partialTerm}`, async () => {
        await homePage.searchForProduct(partialTerm);
        
        // Should still return relevant results
        const productCards = page.locator('[data-testid="product-card"], .product-card');
        expect(await productCards.count()).toBeGreaterThan(0);
        
        // Verify results contain the search term
        const firstProduct = productCards.first();
        const productText = await firstProduct.textContent();
        expect(productText?.toLowerCase()).toContain(partialTerm.toLowerCase());
      });
    }
  });

  test('should show no results message for invalid searches', async ({ homePage, page }) => {
    for (const noResultTerm of testData.searchTerms.noResults) {
      await test.step(`Search for non-existent term: ${noResultTerm}`, async () => {
        await homePage.searchForProduct(noResultTerm);
        
        // Verify no results message
        const noResultsMessage = page.locator('[data-testid="no-results"], .no-results-message');
        await expect(noResultsMessage).toBeVisible();
        await expect(noResultsMessage).toContainText('No products found');
        
        // Verify no product cards are shown
        const productCards = page.locator('[data-testid="product-card"], .product-card');
        expect(await productCards.count()).toBe(0);
      });
    }
  });

  test('should handle empty search', async ({ homePage, page }) => {
    await test.step('Perform empty search', async () => {
      await homePage.searchForProduct('');
    });

    await test.step('Verify appropriate handling', async () => {
      // Should either show all products or show validation message
      const currentUrl = await page.url();
      expect(currentUrl).toMatch(/search|products|home/);
    });
  });

  test('should handle special characters in search', async ({ homePage, page }) => {
    for (const specialTerm of testData.searchTerms.specialCharacters) {
      await test.step(`Search for special characters: ${specialTerm}`, async () => {
        await homePage.searchForProduct(specialTerm);
        
        // Should handle gracefully without errors
        const currentUrl = await page.url();
        expect(currentUrl).toMatch(/search|products|error/);
        
        // Should not crash the application
        const errorPage = page.locator('text=Application Error');
        await expect(errorPage).not.toBeVisible();
      });
    }
  });

  test('should preserve search term in search input', async ({ homePage, page }) => {
    const searchTerm = testData.searchTerms.valid[0];

    await test.step('Perform search', async () => {
      await homePage.searchForProduct(searchTerm);
    });

    await test.step('Verify search term is preserved', async () => {
      const searchInput = page.locator('[data-testid="search-input"], input[type="search"]');
      const inputValue = await searchInput.inputValue();
      expect(inputValue).toBe(searchTerm);
    });
  });

  test('should show search suggestions/autocomplete', async ({ homePage, page }) => {
    await test.step('Start typing in search input', async () => {
      const searchInput = page.locator('[data-testid="search-input"], input[type="search"]');
      await searchInput.fill('head');
    });

    await test.step('Verify search suggestions appear', async () => {
      const suggestions = page.locator('[data-testid="search-suggestions"], .search-suggestions');
      await expect(suggestions).toBeVisible({ timeout: 5000 });
      
      // Verify suggestions contain relevant items
      const suggestionItems = suggestions.locator('li, .suggestion-item');
      expect(await suggestionItems.count()).toBeGreaterThan(0);
    });

    await test.step('Click on a suggestion', async () => {
      const firstSuggestion = page.locator('[data-testid="search-suggestions"] li:first-child, .search-suggestions .suggestion-item:first-child');
      await firstSuggestion.click();
      
      // Should navigate to search results or product page
      await expect(page).toHaveURL(/search|product/);
    });
  });

  test('should support keyboard navigation in search', async ({ homePage, page }) => {
    await test.step('Focus on search input and type', async () => {
      const searchInput = page.locator('[data-testid="search-input"], input[type="search"]');
      await searchInput.focus();
      await searchInput.fill('laptop');
    });

    await test.step('Press Enter to search', async () => {
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/search.*laptop/);
    });
  });

  test.describe('Search Results Page', () => {
    test.beforeEach(async ({ homePage }) => {
      await homePage.searchForProduct('headphones');
    });

    test('should display search results with product information', async ({ page }) => {
      await test.step('Verify search results layout', async () => {
        const searchResults = page.locator('[data-testid="search-results"], .search-results');
        await expect(searchResults).toBeVisible();
        
        const productCards = page.locator('[data-testid="product-card"], .product-card');
        const productCount = await productCards.count();
        expect(productCount).toBeGreaterThan(0);
      });

      await test.step('Verify product card information', async () => {
        const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
        
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

    test('should allow sorting search results', async ({ page }) => {
      const sortDropdown = page.locator('[data-testid="sort-dropdown"], .sort-dropdown, select');
      
      if (await sortDropdown.isVisible()) {
        await test.step('Sort by price low to high', async () => {
          await sortDropdown.selectOption('price-asc');
          await page.waitForLoadState('networkidle');
          
          // Verify sorting is applied
          const productPrices = page.locator('[data-testid="product-price"], .product-price');
          const priceTexts = await productPrices.allTextContents();
          const prices = priceTexts.map(price => parseFloat(price.replace(/[^0-9.]/g, '')));
          
          // Verify prices are in ascending order
          for (let i = 1; i < prices.length; i++) {
            expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
          }
        });

        await test.step('Sort by price high to low', async () => {
          await sortDropdown.selectOption('price-desc');
          await page.waitForLoadState('networkidle');
          
          const productPrices = page.locator('[data-testid="product-price"], .product-price');
          const priceTexts = await productPrices.allTextContents();
          const prices = priceTexts.map(price => parseFloat(price.replace(/[^0-9.]/g, '')));
          
          // Verify prices are in descending order
          for (let i = 1; i < prices.length; i++) {
            expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
          }
        });
      }
    });

    test('should allow filtering search results', async ({ page }) => {
      const priceFilter = page.locator('[data-testid="price-filter"], .price-filter');
      
      if (await priceFilter.isVisible()) {
        await test.step('Apply price filter', async () => {
          const priceRange = priceFilter.locator('input[value="25-50"], label:has-text("$25 - $50")');
          if (await priceRange.isVisible()) {
            await priceRange.click();
            await page.waitForLoadState('networkidle');
            
            // Verify filtered results
            const productPrices = page.locator('[data-testid="product-price"], .product-price');
            const priceTexts = await productPrices.allTextContents();
            const prices = priceTexts.map(price => parseFloat(price.replace(/[^0-9.]/g, '')));
            
            // Verify all prices are within the selected range
            for (const price of prices) {
              expect(price).toBeGreaterThanOrEqual(25);
              expect(price).toBeLessThanOrEqual(50);
            }
          }
        });
      }
    });

    test('should support pagination', async ({ page }) => {
      const pagination = page.locator('[data-testid="pagination"], .pagination');
      
      if (await pagination.isVisible()) {
        await test.step('Navigate to next page', async () => {
          const nextButton = pagination.locator('[data-testid="next-page"], .next-page, button:has-text("Next")');
          if (await nextButton.isVisible() && await nextButton.isEnabled()) {
            await nextButton.click();
            await page.waitForLoadState('networkidle');
            
            // Verify page navigation
            await expect(page).toHaveURL(/page=2|p=2/);
            
            // Verify different products are shown
            const productCards = page.locator('[data-testid="product-card"], .product-card');
            expect(await productCards.count()).toBeGreaterThan(0);
          }
        });

        await test.step('Navigate back to previous page', async () => {
          const prevButton = pagination.locator('[data-testid="prev-page"], .prev-page, button:has-text("Previous")');
          if (await prevButton.isVisible() && await prevButton.isEnabled()) {
            await prevButton.click();
            await page.waitForLoadState('networkidle');
            
            // Verify back to first page
            await expect(page).toHaveURL(/page=1|p=1|^(?!.*page=)(?!.*p=)/);
          }
        });
      }
    });

    test('should allow clicking on products to view details', async ({ page, productPage }) => {
      await test.step('Click on first product', async () => {
        const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
        await firstProduct.click();
      });

      await test.step('Verify navigation to product page', async () => {
        await expect(page).toHaveURL(/product|item/);
        expect(await productPage.isLoaded()).toBe(true);
      });
    });
  });

  test.describe('Search Performance', () => {
    test('should perform search within acceptable time', async ({ homePage, page }) => {
      await test.step('Measure search performance', async () => {
        const startTime = Date.now();
        await homePage.searchForProduct('laptop');
        
        // Wait for search results to load
        const searchResults = page.locator('[data-testid="search-results"], .search-results');
        await expect(searchResults).toBeVisible();
        
        const endTime = Date.now();
        const searchTime = endTime - startTime;
        
        // Search should complete within 5 seconds
        expect(searchTime).toBeLessThan(5000);
      });
    });

    test('should handle concurrent searches', async ({ page }) => {
      await test.step('Perform multiple rapid searches', async () => {
        const searchInput = page.locator('[data-testid="search-input"], input[type="search"]');
        
        // Rapidly type different search terms
        await searchInput.fill('laptop');
        await page.waitForTimeout(100);
        await searchInput.fill('phone');
        await page.waitForTimeout(100);
        await searchInput.fill('headphones');
        await page.keyboard.press('Enter');
        
        // Should handle the final search correctly
        await expect(page).toHaveURL(/search.*headphones/);
      });
    });
  });
});