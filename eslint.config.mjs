import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  pluginJs.configs.recommended,
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { languageOptions: { globals: globals.node } },
  {
    ignores: [
      "*.config.js",
      "test/**/*.js",
      "models/**/*.js",
      "migrations/**/*.js",
      "seeders/**/*.js"
    ]
  },
  {
    rules: {
      "no-unused-vars": "error",
      "no-undef": "off",
      "prefer-const": "error"
    }
  }
];