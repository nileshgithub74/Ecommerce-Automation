# E-Commerce QA Automation Framework

A comprehensive End-to-End QA Automation Framework for E-Commerce web applications using Playwright and TypeScript.

## 🚀 Features

- **Modern Tech Stack**: Built with Playwright and TypeScript
- **Page Object Model**: Clean, maintainable test architecture
- **Cross-Browser Testing**: Supports Chromium, Firefox, and WebKit
- **Parallel Execution**: Fast test execution with configurable workers
- **Visual Regression Testing**: Automated UI validation
- **Comprehensive Reporting**: HTML reports with screenshots and traces
- **CI/CD Integration**: GitHub Actions pipeline with artifact uploads
- **Code Quality**: ESLint, Prettier, and TypeScript integration
- **Test Data Management**: JSON fixtures and data generators
- **Retry Mechanism**: Automatic retry for flaky tests
- **Environment Configuration**: Support for dev/staging/prod environments

## 📁 Project Structure

```
├── .github/workflows/          # CI/CD pipelines
├── src/
│   ├── config/                # Environment configuration
│   ├── fixtures/              # Test fixtures and data
│   ├── pages/                 # Page Object Model classes
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions and helpers
├── tests/
│   ├── auth/                  # Authentication tests
│   ├── cart/                  # Shopping cart tests
│   ├── product/               # Product browsing and search tests
│   ├── visual/                # Visual regression tests
│   └── performance/           # Performance tests
├── test-results/              # Test execution results
├── playwright.config.ts       # Playwright configuration
└── package.json              # Dependencies and scripts
```

## 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-qa-automation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npm run install:browsers
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## 🧪 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in headed mode
npm run test:headed

# Run tests with UI mode
npm run test:ui

# Run specific browser tests
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Run tests in parallel
npm run test:parallel

# Run visual regression tests
npm run test:visual

# Debug tests
npm run test:debug
```

### Test Categories

```bash
# Authentication tests
npx playwright test tests/auth/

# Product tests
npx playwright test tests/product/

# Cart functionality tests
npx playwright test tests/cart/

# Visual regression tests
npx playwright test tests/visual/

# Performance tests
npx playwright test tests/performance/
```

## 📊 Test Coverage

The framework includes **150+ automated test cases** covering:

### Authentication (25+ tests)
- ✅ User login with valid/invalid credentials
- ✅ User registration with validation
- ✅ Password reset functionality
- ✅ Social login integration
- ✅ Session management
- ✅ Security validations (XSS, SQL injection)

### Product Browsing (40+ tests)
- ✅ Homepage product display
- ✅ Category navigation
- ✅ Product search functionality
- ✅ Product detail pages
- ✅ Product variants (size, color)
- ✅ Product images and galleries
- ✅ Related products
- ✅ Product reviews and ratings

### Shopping Cart (35+ tests)
- ✅ Add/remove products
- ✅ Update quantities
- ✅ Cart persistence
- ✅ Promo code application
- ✅ Cart calculations
- ✅ Save for later functionality
- ✅ Out of stock handling

### Search & Filtering (25+ tests)
- ✅ Product search with various terms
- ✅ Search suggestions/autocomplete
- ✅ Search result sorting
- ✅ Product filtering by price, category, brand
- ✅ Pagination
- ✅ No results handling

### Visual Regression (15+ tests)
- ✅ Homepage screenshots
- ✅ Product page layouts
- ✅ Cart page appearance
- ✅ Mobile responsiveness
- ✅ Cross-browser consistency

### Performance (10+ tests)
- ✅ Page load times
- ✅ Network optimization
- ✅ Memory usage
- ✅ Core Web Vitals
- ✅ Slow network handling

## 🎯 Advanced Features

### Page Object Model
```typescript
// Example usage
const homePage = new HomePage(page);
await homePage.searchForProduct('laptop');
await homePage.clickCart();
```

### Data Generation
```typescript
// Generate test data
const user = DataGenerator.generateUser();
const address = DataGenerator.generateShippingAddress();
const payment = DataGenerator.generatePaymentInfo();
```

### Custom Assertions
```typescript
// Custom matchers
expect(price).toContainPrice(99.99);
expect(rating).toBeInRange(1, 5);
```

### Environment Configuration
```typescript
// Multi-environment support
const config = getEnvironmentConfig();
// Automatically switches between dev/staging/prod
```

## 📈 Reporting

### HTML Reports
- Detailed test execution reports
- Screenshots on failure
- Video recordings
- Network logs and traces

### CI/CD Integration
- Automatic test execution on PR/push
- Parallel execution across multiple browsers
- Test result artifacts
- GitHub Pages deployment for reports

### Visual Regression
- Pixel-perfect UI comparisons
- Cross-browser visual validation
- Mobile and tablet screenshots
- Automatic baseline updates

## 🔧 Configuration

### Playwright Configuration
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 4,
  // ... more configuration
});
```

### Environment Variables
```bash
# .env
BASE_URL=https://your-ecommerce-site.com
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=SecurePassword123!
HEADLESS=true
```

## 🚀 CI/CD Pipeline

The framework includes a complete GitHub Actions pipeline:

- **Code Quality**: ESLint, Prettier, TypeScript checking
- **Security Scanning**: npm audit, Snyk integration
- **Cross-Browser Testing**: Parallel execution on multiple browsers
- **Visual Regression**: Automated screenshot comparisons
- **Report Generation**: HTML reports with artifacts
- **Deployment**: Automatic report deployment to GitHub Pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📝 Best Practices

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent and atomic

### Page Objects
- Use meaningful locator strategies
- Implement wait strategies
- Add proper error handling
- Document complex interactions

### Data Management
- Use fixtures for test data
- Generate dynamic data when needed
- Avoid hardcoded values
- Clean up test data after tests

## 🐛 Troubleshooting

### Common Issues

1. **Browser Installation**
   ```bash
   npx playwright install --with-deps
   ```

2. **Test Timeouts**
   - Increase timeout in playwright.config.ts
   - Add explicit waits for dynamic content

3. **Flaky Tests**
   - Use retry mechanism
   - Improve wait strategies
   - Check for race conditions

4. **Visual Test Failures**
   - Update baselines: `npx playwright test --update-snapshots`
   - Check for dynamic content
   - Disable animations

## 📚 Documentation

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Visual Testing Guide](https://playwright.dev/docs/test-screenshots)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

For questions and support:
- Create an issue in the repository
- Check the documentation
- Review existing test examples
- Contact the QA team

---

**Happy Testing! 🎉**