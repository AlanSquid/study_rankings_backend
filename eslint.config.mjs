import globals from 'globals';
import pluginJs from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  pluginJs.configs.recommended,
  prettierConfig,
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  { languageOptions: { globals: globals.node } },
  {
    ignores: ['test/**/*.test.js', 'models/**/*.js', 'migrations/**/*.js', 'seeders/**/*.js']
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
