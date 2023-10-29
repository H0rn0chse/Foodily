/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  extends: [
    "plugin:@typescript-eslint/recommended",
    "../../.eslintrc.cjs",
  ],
  parser: "@typescript-eslint/parser",
  env: {
    node: true,
    commonjs: true
  },
  plugins: ["@typescript-eslint"],
  ignorePatterns: ["dist"],
};
