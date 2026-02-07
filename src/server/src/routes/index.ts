import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { ensureSessionAndRedirect, preventSession } from "./auth";
import { uiMode, UI_MODES } from "@/serverConfig";

const __dirname = dirname(fileURLToPath(import.meta.url));

const { NODE_ENV } = process.env;

const router = express.Router();

if (uiMode === UI_MODES.ClientDist) {
  if (NODE_ENV === "production") {
    /*
    * Production: serve bundled files copied into server dist.
    */
    const publicPath = path.join(__dirname, "../", "public");
    console.log(`🔵 Using: public path ${publicPath}`);

    router.use("/notFound", express.static(path.join(publicPath, "notFound"), { index: "index.html" }));
    router.use("/app", ensureSessionAndRedirect, express.static(path.join(publicPath, "app"), { index: "index.html" }));
    router.use("/login", preventSession, express.static(path.join(publicPath, "login"), { index: "index.html" }));
    router.get("/", preventSession);
    router.use("/", express.static(path.join(publicPath)));
  } else {
    /*
    * Development: serve pre-built Vite client bundles from source dist.
    */
    const publicAppPath = path.join(__dirname, "../../../", "app-public", "dist");
    const appPath = path.join(__dirname, "../../../", "app", "dist");
    console.log(`🔵 Using: public path ${publicAppPath}`);
    console.log(`🔵 Using: app path ${appPath}`);

    router.use("/notFound", express.static(path.join(publicAppPath, "notFound"), { index: "index.html" }));
    router.use("/app", ensureSessionAndRedirect, express.static(appPath, { index: "index.html" }));
    router.use("/login", preventSession, express.static(path.join(publicAppPath, "login"), { index: "index.html" }));
    router.get("/", preventSession);
    router.use("/", express.static(publicAppPath));
  }
} else if (uiMode === UI_MODES.ServerPages) {
  /*
  * Serve static HTML pages from the server's pages/ folder.
  * Useful for testing server-side rendering or minimal UI.
  */
  const publicPath = path.join(__dirname, "../", "pages");
  console.log(`🔵 Using: pages path ${publicPath}`);

  router.use("/notFound", express.static(path.join(publicPath, "public"), { index: "NotFound.html" }));
  router.use("/app", ensureSessionAndRedirect, express.static(path.join(publicPath, "app"), { index: "app.html" }));
  router.use("/login", preventSession, express.static(path.join(publicPath, "login"), { index: "login.html" }));
  router.get("/", preventSession);
  router.use("/", express.static(path.join(publicPath, "public")));
}
// UI_MODES.None: no UI routes registered

export default router;
