import js from '@eslint/js';
import babelParser from '@babel/eslint-parser';
import playwright from 'eslint-plugin-playwright';

export default [
  {
    ignores: [
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          plugins: ['@babel/plugin-syntax-typescript'],
        },
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['tests/**/*.{js,mjs,cjs,ts}'],
    ...playwright.configs['flat/recommended'],
    rules: {
      'playwright/expect-expect': ['warn', { assertFunctionNames: ['expectNoWcagViolations'] }],
    },
  },
];
