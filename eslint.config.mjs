import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["node_modules/**", "dist/**", "*.config.mjs", ".github/**"],
  },
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
  plugins: {
  prettier:eslintPluginPrettier,
  },
  rules: {
  "prettier/prettier": "error", // Reports Prettier issues as ESLint errors
  },
  },
  prettierConfig // Enables Prettier rules and disables conflicting ESLint rules
];
