/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    semi: ["error", "always"],
    indent: ["error", 2],
    "eol-last": ["error", "always"],
    quotes: ["error", "double"],
    "linebreak-style": ["error", "windows"],
  },
};
