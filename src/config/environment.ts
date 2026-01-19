import dotenv from 'dotenv';

dotenv.config();

export const config = {
  baseUrl: process.env.BASE_URL || 'https://demo-ecommerce.com',
  headless: process.env.HEADLESS !== 'false',
  timeout: parseInt(process.env.TIMEOUT || '30000'),
  retries: parseInt(process.env.RETRIES || '1'),
  
  users: {
    testUser: {
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
    },
    admin: {
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'AdminPassword123!',
    },
  },
  
  payment: {
    testCard: {
      number: process.env.TEST_CARD_NUMBER || '4242424242424242',
      expiry: process.env.TEST_CARD_EXPIRY || '12/25',
      cvc: process.env.TEST_CARD_CVC || '123',
    },
  },
  
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://api.demo-ecommerce.com',
    key: process.env.API_KEY || 'test_api_key',
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'ecommerce_test',
    user: process.env.DB_USER || 'test_user',
    password: process.env.DB_PASSWORD || 'test_password',
  },
};

export const getEnvironmentConfig = (): typeof config => {
  const env = process.env.NODE_ENV || 'test';
  
  switch (env) {
    case 'development':
      return {
        ...config,
        baseUrl: 'https://dev.demo-ecommerce.com',
      };
    case 'staging':
      return {
        ...config,
        baseUrl: 'https://staging.demo-ecommerce.com',
      };
    case 'production':
      return {
        ...config,
        baseUrl: 'https://demo-ecommerce.com',
      };
    default:
      return config;
  }
};