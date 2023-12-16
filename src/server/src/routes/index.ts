import { ensureLoggedIn, ensureLoggedOut } from "connect-ensure-login";
import express, { RequestHandler } from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { MODES } from "@/routes/auth";

const __dirname = dirname(fileURLToPath(import.meta.url));

const {
  NODE_ENV,
  SERVER_MODE
} = process.env;

const router = express.Router();

function emptyMiddleware (): RequestHandler {
  return (req, res, next) => {
    next();
  };
}

export const ensureSession = SERVER_MODE === MODES.ApiOnly ? emptyMiddleware() : ensureLoggedIn();
export const preventSession = SERVER_MODE === MODES.ApiOnly ? emptyMiddleware() : ensureLoggedOut({ redirectTo: "/app" });

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
  router.use("/app", ensureSession, express.static(path.join(publicPath, "app"), { index: "index.html" }));
  router.use("/login", preventSession, express.static(path.join(publicPath, "login"), { index: "index.html" }));
  router.get("/", preventSession);
  router.use("/", express.static(path.join(publicPath)));

} else if (SERVER_MODE === "local") {
  // local server resources
  const publicPath = path.join(__dirname, "../", "pages");
  console.log(`🔵 Using: public path ${publicPath}`);

  router.use("/notFound", express.static(path.join(publicPath, "public"), { index: "NotFound.html" }));
  router.use("/app", ensureSession, express.static(path.join(publicPath, "app"), { index: "app.html" }));
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
  router.use("/app", ensureSession, express.static(appPath, { index: "index.html" }));
  router.use("/login", preventSession, express.static(path.join(publicAppPath, "login"), { index: "index.html" }));
  router.get("/", preventSession);
  router.use("/", express.static(publicAppPath));
}

export default router;
