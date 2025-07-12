// keep in mind that this ruleset will be reused in sub projects
import { globalIgnores } from "eslint/config";
import typescriptEslintParser from "@typescript-eslint/parser";
import typescriptEslint from "typescript-eslint";

export default [
  globalIgnores(["**/dist/**", "*.svg"]),
  ...typescriptEslint.config({
    extends: [typescriptEslint.configs.recommended],
    plugins: {
      "@typescript-eslint": typescriptEslint.plugin,
    },
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptEslintParser,
    },
    rules: {
      semi: ["error", "always"],
      indent: ["error", 2],
      "eol-last": ["error", "always"],
      quotes: ["error", "double"],
      "linebreak-style": ["error", "windows"],
      "no-unused-vars": ["error", { args: "none" }],
      "object-curly-spacing": ["error", "always"],
      "key-spacing": ["error", { beforeColon: false }],
      "no-warning-comments": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { args: "none" }],
    },
  }),
];
