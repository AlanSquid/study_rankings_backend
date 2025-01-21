import globals from 'globals';
import pluginJs from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  pluginJs.configs.recommended,
  prettierConfig,
  { files: ['**/*.js'], languageOptions: { sourceType: 'module' } },
  { languageOptions: { globals: globals.node } },
  {
    ignores: [
      'test/**/*.test.{js,cjs}',
      'models/**/*.{js,cjs}',
      'migrations/**/*.{js,cjs}',
      'seeders/**/*.{js,cjs}'
    ]
  },

  {
    rules: {
      'no-unused-vars': ['error', { args: 'none' }],
      'no-undef': 'off',
      'no-var': 'error',
      'prefer-const': 'error',
      quotes: ['error', 'single'],
      eqeqeq: 'error',
      camelcase: 'error',
      'no-console': ['error', { allow: ['info', 'warn', 'error'] }]
    }
  }
];
