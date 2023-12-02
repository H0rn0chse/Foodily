/* eslint-env node */
import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

import { SERVER_PORT } from "./tools/env.js";
import path, { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const {
  BUILD_TARGET
} = process.env;

const buildTarget = BUILD_TARGET || "public";
const base = buildTarget === "public" ? "/" : `/${buildTarget}`;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  base,
  build: {
    rollupOptions: {
      input: {
        app: path.join(__dirname, "src", buildTarget, "index.html")
      }
    },
    outDir: `dist/${buildTarget}`,
    chunkSizeWarningLimit: 1000
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
