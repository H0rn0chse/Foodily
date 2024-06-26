/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  extends: [
    "plugin:vue/vue3-essential",
    "@vue/eslint-config-typescript",
    "@vue/eslint-config-prettier/skip-formatting",
    "../../.eslintrc.cjs",
  ],
  ignorePatterns: ["dist"],
  rules: {
    "vue/valid-v-slot": ["error", {
      allowModifiers: true,
    }],
  },
};
