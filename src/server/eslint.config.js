import baseConfig from "../../eslint.config.js";
import typescriptEslintParser from "@typescript-eslint/parser";
import typescriptEslint from "typescript-eslint";

export default typescriptEslint.config({
  extends: [
    // typescriptEslint.configs.recommended,
    baseConfig,
  ],
  plugins: {
    // "@typescript-eslint": typescriptEslint.plugin,
  },
  files: ["**/*.js", "**/*.ts", "**/*.tsx"],
  ignores: ["**/dist/**"],
  languageOptions: {
    parser: typescriptEslintParser,
  },
});
