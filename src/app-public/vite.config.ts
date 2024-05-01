/* eslint-env node */
import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

import { SERVER_PORT } from "./tools/env.js";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      autoImport: true,
    }),
  ],
  // base,
  build: {
    rollupOptions: {
      input: {
        app: join(__dirname, "index.html"),
        notFound: join(__dirname, "notFound/index.html"),
        login: join(__dirname, "login/index.html"),
      }
    },
    chunkSizeWarningLimit: 1000
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@project": fileURLToPath(new URL("../../", import.meta.url)),
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
