import { faker } from '@faker-js/faker';
import { User, ShippingAddress, PaymentInfo, Product } from '../types';

export class DataGenerator {
  static generateUser(): User {
    return {
      email: faker.internet.email(),
      password: 'TestPassword123!',
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phone: faker.phone.number(),
    };
  }

  static generateShippingAddress(): ShippingAddress {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      address1: faker.location.streetAddress(),
      address2: faker.location.secondaryAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: 'United States',
      phone: faker.phone.number(),
    };
  }

  static generatePaymentInfo(): PaymentInfo {
    return {
      cardNumber: '4242424242424242', // Test card number
      expiryMonth: '12',
      expiryYear: '25',
      cvv: '123',
      cardholderName: faker.person.fullName(),
    };
  }

  static generateProduct(): Product {
    return {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
      description: faker.commerce.productDescription(),
      imageUrl: faker.image.url(),
      inStock: faker.datatype.boolean(),
    };
  }

  static generateProducts(count: number): Product[] {
    return Array.from({ length: count }, () => this.generateProduct());
  }

  static generateTestEmail(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `test.user.${timestamp}.${random}@example.com`;
  }

  static generateStrongPassword(): string {
    const lowercase = faker.string.alpha({ length: 3, casing: 'lower' });
    const uppercase = faker.string.alpha({ length: 3, casing: 'upper' });
    const numbers = faker.string.numeric(3);
    const symbols = '!@#$%';
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    
    return faker.helpers.shuffle([...lowercase, ...uppercase, ...numbers, symbol]).join('');
  }

  static generateSearchTerms(): string[] {
    return [
      faker.commerce.productName(),
      faker.commerce.productAdjective(),
      faker.commerce.productMaterial(),
      faker.commerce.department(),
    ];
  }

  static generateInvalidEmails(): string[] {
    return [
      'invalid-email',
      '@example.com',
      'test@',
      'test..test@example.com',
      'test@example',
      '',
    ];
  }

  static generateInvalidPasswords(): string[] {
    return [
      '123', // Too short
      'password', // No uppercase, numbers, symbols
      'PASSWORD', // No lowercase, numbers, symbols
      '12345678', // No letters, symbols
      'Password', // No numbers, symbols
      '', // Empty
    ];
  }

  static generateCreditCardNumbers(): { valid: string[]; invalid: string[] } {
    return {
      valid: [
        '4242424242424242', // Visa
        '4000056655665556', // Visa (debit)
        '5555555555554444', // Mastercard
        '2223003122003222', // Mastercard (2-series)
        '5200828282828210', // Mastercard (debit)
        '378282246310005',  // American Express
      ],
      invalid: [
        '4242424242424241', // Invalid Visa
        '1234567890123456', // Invalid format
        '4242', // Too short
        '', // Empty
        'abcd1234efgh5678', // Contains letters
      ],
    };
  }
}