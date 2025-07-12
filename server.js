/*eslint-env node*/
import express from "express";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

const viteApp = await createViteServer({
  server: {
    middlewareMode: "html",
    hmr: {
      port: 8081,
    },
  },
  appType: "custom", // don't include Vite's default HTML handling middlewares,
  configFile: join(__dirname, "src/app/vite.config.ts"),
  root: join(__dirname, "src/app"),
});

const vitePublicApp = await createViteServer({
  base: "/",
  server: {
    middlewareMode: "html",
    hmr: {
      port: 8082,
    },
  },
  appType: "custom", // don't include Vite's default HTML handling middlewares,
  configFile: join(__dirname, "src/app-public/vite.config.ts"),
  root: join(__dirname, "src/app-public"),
});

app.use("/app", viteApp.middlewares);
app.use("/", vitePublicApp.middlewares);

// App route
app.use("/*rest", async (req, res, next) => {
  // console.log(`baseUrl: ${req.baseUrl}`);
  if (!req.baseUrl.startsWith("/app")) {
    next();
    return;
  }
  if (req.baseUrl.startsWith("/.well-known/")) {
    next();
    return;
  }
  console.log(`using app router: '${req.url}'`);

  try {
    const indexPath = join(__dirname, "src/app/index.html");
    const template = readFileSync(indexPath, "utf-8");

    const html = await viteApp.transformIndexHtml(req.originalUrl, template);
    // console.log(indexPath);
    // console.log(req.originalUrl);
    // console.log(html);

    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch (e) {
    console.log("unexpected error occurred in app router");
    console.error(e);
    next();
  }
});

// Public routes
app.use(["*rest", "/*rest"], async (req, res, next) => {
  if (req.baseUrl.startsWith("/.well-known/")) {
    next();
    return;
  }
  console.log(`using public router: '${req.url}'`);
  try {
    // search for corresponding html
    const indexPath = join(
      __dirname,
      "src/app-public",
      req.baseUrl,
      "index.html"
    );
    console.log(`indexPath: ${indexPath}`);
    const template = readFileSync(indexPath, "utf-8");

    // build html
    const html = await vitePublicApp.transformIndexHtml(
      req.originalUrl,
      template
    );
    // console.log(indexPath);
    // console.log(req.originalUrl);
    // console.log(html);

    // serve html
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch (e) {
    console.log("unexpected error occurred in public router");
    console.error(e);
    next();
  }
});

// catch 404 and forward to error handler
app.use((req, res) => {
  console.log(`using error handler: '${req.url}'`);
  // respond with html page
  if (req.accepts("html")) {
    // res.sendStatus(404);
    res.status(404).redirect("/notFound");
    // res.render("404", { url: req.url });
    return;
  }

  // respond with json
  if (req.accepts("json")) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  // default to plain-text. send()
  res.status(404).type("txt").send("Not found");
});

app.listen(port, () => {
  console.log(`🔊 Client Server listening on http://localhost:${port}`);
});
