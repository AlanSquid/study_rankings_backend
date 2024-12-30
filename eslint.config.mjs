import globals from 'globals';
import pluginJs from '@eslint/js';


/** @type {import('eslint').Linter.Config[]} */
export default [
  pluginJs.configs.recommended,
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  { languageOptions: { globals: globals.node } },
  {
    ignores: [
      'test/**/*.test.js',
      'models/**/*.js',
      'migrations/**/*.js',
      'seeders/**/*.js'
    ]
  },

  {
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'off',
      'no-var': 'error',
      'prefer-const': 'error',
      'quotes': ['error', 'single'],
      'eqeqeq': 'error',
      'camelcase': 'error',
      'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
    }
  }
];