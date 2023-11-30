/* eslint-env node */
import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

import { SERVER_PORT } from "./tools/env.js";
import path, { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const buildScript = process?.env?.npm_lifecycle_event || "";
const appName = buildScript.split(":")[1] || "";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  base: `/${appName !== "public" ? appName : "" }`,
  build: {
    rollupOptions: {
      input: {
        app: path.join(__dirname, "src", appName, "index.html")
      }
    },
    outDir: `dist/${appName}`
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    }
  },
  server: {
    proxy: {
      "/api": {
        target: `http://localhost:${SERVER_PORT}`,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  }
});
