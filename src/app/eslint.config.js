import baseConfig from "../../eslint.config.js";
import eslintPluginVue from "eslint-plugin-vue";
import typescriptEslintParser from "@typescript-eslint/parser";
import typescriptEslint from "typescript-eslint";
import vueEslintParser from "vue-eslint-parser";

export default typescriptEslint.config({
  extends: [
    // typescriptEslint.configs.recommended,
    eslintPluginVue.configs["flat/recommended"],
    baseConfig,
  ],
  plugins: {
    // "@typescript-eslint": typescriptEslint.plugin,
    vue: eslintPluginVue,
  },
  files: ["**/*.js", "**/*.ts", "**/*.tsx", "**/*.vue"],
  ignores: ["**/dist/**", "*.svg"],
  languageOptions: {
    parser: vueEslintParser,
    parserOptions: {
      parser: typescriptEslintParser,
      extraFileExtensions: [".vue"],
    },
  },
  rules: {
    "vue/valid-v-slot": ["error", { allowModifiers: true }],
    "vue/html-self-closing": "off",
  },
});
