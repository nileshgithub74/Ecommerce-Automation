module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:playwright/playwright-test',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'playwright'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  env: {
    node: true,
    es6: true
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'playwright/missing-playwright-await': 'error',
    'playwright/no-networkidle': 'warn',
    'playwright/no-skipped-test': 'warn',
    'playwright/valid-expect': 'error',
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error'
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'test-results/',
    'playwright-report/'
  ]
};