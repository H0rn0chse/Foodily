import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { ensureSessionAndRedirect, preventSession } from "./auth";

const __dirname = dirname(fileURLToPath(import.meta.url));

const {
  NODE_ENV,
  SERVER_MODE
} = process.env;

const router = express.Router();

if (NODE_ENV === "production") {
  /*
  * app
  * - public
  *   - app
  */
  // src/server/dist/public
  const publicPath = path.join(__dirname, "../", "public");
  console.log(`🔵 Using: public path ${publicPath}`);

  router.use("/notFound", express.static(path.join(publicPath, "notFound"), { index: "index.html" }));
  router.use("/app", ensureSessionAndRedirect, express.static(path.join(publicPath, "app"), { index: "index.html" }));
  router.use("/login", preventSession, express.static(path.join(publicPath, "login"), { index: "index.html" }));
  router.get("/", preventSession);
  router.use("/", express.static(path.join(publicPath)));

} else if (SERVER_MODE === "local") {
  // local server resources
  const publicPath = path.join(__dirname, "../", "pages");
  console.log(`🔵 Using: public path ${publicPath}`);

  router.use("/notFound", express.static(path.join(publicPath, "public"), { index: "NotFound.html" }));
  router.use("/app", ensureSessionAndRedirect, express.static(path.join(publicPath, "app"), { index: "app.html" }));
  router.use("/login", preventSession, express.static(path.join(publicPath, "login"), { index: "login.html" }));
  router.get("/", preventSession);
  router.use("/", express.static(path.join(publicPath, "public")));
  
} else {
  // client dist resources
  const publicAppPath = path.join(__dirname, "../../../", "app-public", "dist");
  const appPath = path.join(__dirname, "../../../", "app", "dist");
  console.log(`🔵 Using: public path ${publicAppPath}`);
  console.log(`🔵 Using: public path ${appPath}`);

  router.use("/notFound", express.static(path.join(publicAppPath, "notFound"), { index: "index.html" }));
  router.use("/app", ensureSessionAndRedirect, express.static(appPath, { index: "index.html" }));
  router.use("/login", preventSession, express.static(path.join(publicAppPath, "login"), { index: "index.html" }));
  router.get("/", preventSession);
  router.use("/", express.static(publicAppPath));
}

export default router;
