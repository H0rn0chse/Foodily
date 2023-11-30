import { ensureLoggedIn, ensureLoggedOut } from "connect-ensure-login";
import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const {
  NODE_ENV,
  SERVER_MODE
} = process.env;

const router = express.Router();
const ensureSession = ensureLoggedIn();
const preventSession = ensureLoggedOut({ redirectTo: "/app" });

// for ui development:
//     the server calls are forwarded by vite
// for server development:
//     mock html is used
// for production:
//     ui resources are built into a static folder
let publicPath;
let bDistUsage = false;
if (NODE_ENV === "production") {
  // src/server/dist/src/public
  publicPath = path.join(__dirname, "../../", "public"); // todo: fix path
} else if (SERVER_MODE === "local") {
  publicPath = path.join(__dirname, "../", "pages");
} else {
  publicPath = path.join(__dirname, "../../../", "client", "dist");
  bDistUsage = true;
}

console.log(`🔵 Using: public path ${publicPath}`);

if (bDistUsage) {
  router.use("/notFound", express.static(path.join(publicPath, "notFound"), { index: "src/index.html" }));
  router.use("/app", ensureSession, express.static(path.join(publicPath, "app"), { index: "src/index.html" }));
  router.use("/login", preventSession, express.static(path.join(publicPath, "login"), { index: "src/index.html" }));
  router.get("/", preventSession);
  router.use("/", express.static(path.join(publicPath, "public"), { index: "src/index.html" }));
} else if (publicPath) {
  router.use("/notFound", express.static(path.join(publicPath, "public"), { index: "NotFound.html" }));
  router.use("/app", ensureSession, express.static(path.join(publicPath, "app"), { index: "app.html" }));
  router.use("/login", preventSession, express.static(path.join(publicPath, "login"), { index: "login.html" }));
  router.get("/", preventSession);
  router.use("/", express.static(path.join(publicPath, "public")));
} else {
  console.log("🟡 server running w/o public assets");
}

export default router;
