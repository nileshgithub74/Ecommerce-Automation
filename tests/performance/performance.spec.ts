import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Performance Tests', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    await test.step('Measure homepage load time', async () => {
      const startTime = Date.now();
      
      await page.goto('/', { waitUntil: 'networkidle' });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    await test.step('Check Core Web Vitals', async () => {
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const vitals = {};
            
            entries.forEach((entry) => {
              if (entry.name === 'first-contentful-paint') {
                vitals['FCP'] = entry.startTime;
              }
              if (entry.name === 'largest-contentful-paint') {
                vitals['LCP'] = entry.startTime;
              }
            });
            
            resolve(vitals);
          }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
          
          // Fallback timeout
          setTimeout(() => resolve({}), 5000);
        });
      });

      console.log('Performance metrics:', metrics);
    });
  });

  test('should handle concurrent user actions efficiently', async ({ page, homePage }) => {
    await test.step('Perform multiple rapid actions', async () => {
      await page.goto('/');
      
      const startTime = Date.now();
      
      // Simulate rapid user interactions
      await Promise.all([
        homePage.searchForProduct('laptop'),
        page.waitForTimeout(100),
        homePage.clickCart(),
        page.waitForTimeout(100),
        page.goBack(),
      ]);
      
      const totalTime = Date.now() - startTime;
      expect(totalTime).toBeLessThan(5000);
    });
  });

  test('should maintain performance with large product catalogs', async ({ page, homePage }) => {
    await test.step('Navigate to category with many products', async () => {
      await page.goto('/');
      
      const categories = await homePage.getAvailableCategories();
      if (categories.length > 0) {
        const startTime = Date.now();
        
        await homePage.selectCategory(categories[0]);
        
        // Wait for products to load
        const productCards = page.locator('[data-testid="product-card"], .product-card');
        await expect(productCards.first()).toBeVisible();
        
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(4000);
        
        // Verify reasonable number of products loaded
        const productCount = await productCards.count();
        expect(productCount).toBeGreaterThan(0);
        expect(productCount).toBeLessThan(100); // Pagination should limit results
      }
    });
  });

  test('should optimize image loading', async ({ page }) => {
    await test.step('Check image optimization', async () => {
      await page.goto('/');
      
      // Wait for images to load
      await page.waitForLoadState('networkidle');
      
      // Check if images are properly optimized
      const images = await page.locator('img').all();
      
      for (const image of images.slice(0, 5)) { // Check first 5 images
        const src = await image.getAttribute('src');
        const naturalWidth = await image.evaluate((img: HTMLImageElement) => img.naturalWidth);
        const naturalHeight = await image.evaluate((img: HTMLImageElement) => img.naturalHeight);
        
        // Images should have reasonable dimensions
        expect(naturalWidth).toBeGreaterThan(0);
        expect(naturalHeight).toBeGreaterThan(0);
        expect(naturalWidth).toBeLessThan(2000); // Not too large
        expect(naturalHeight).toBeLessThan(2000);
      }
    });
  });

  test('should handle memory usage efficiently', async ({ page }) => {
    await test.step('Monitor memory usage during navigation', async () => {
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      // Navigate through multiple pages
      await page.goto('/');
      await page.goto('/products');
      await page.goto('/about');
      await page.goto('/contact');
      await page.goto('/');

      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      // Memory usage shouldn't increase dramatically
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        const memoryIncreasePercent = (memoryIncrease / initialMemory) * 100;
        
        expect(memoryIncreasePercent).toBeLessThan(200); // Less than 200% increase
      }
    });
  });

  test('should optimize network requests', async ({ page }) => {
    const requests: string[] = [];
    
    page.on('request', (request) => {
      requests.push(request.url());
    });

    await test.step('Monitor network requests', async () => {
      await page.goto('/', { waitUntil: 'networkidle' });
      
      // Should not make excessive requests
      expect(requests.length).toBeLessThan(50);
      
      // Check for duplicate requests
      const uniqueRequests = new Set(requests);
      const duplicateCount = requests.length - uniqueRequests.size;
      expect(duplicateCount).toBeLessThan(5); // Minimal duplicates allowed
    });
  });

  test('should handle slow network conditions', async ({ page }) => {
    await test.step('Simulate slow network', async () => {
      // Simulate slow 3G connection
      const client = await page.context().newCDPSession(page);
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: 500 * 1024, // 500kb/s
        uploadThroughput: 500 * 1024,
        latency: 400, // 400ms latency
      });

      const startTime = Date.now();
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const loadTime = Date.now() - startTime;

      // Should still load within reasonable time on slow connection
      expect(loadTime).toBeLessThan(10000); // 10 seconds max
    });
  });
});