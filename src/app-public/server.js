import express from "express";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "custom", // don't include Vite's default HTML handling middlewares
});

app.use(vite.middlewares);

app.use("*rest", async (req, res, next) => {
  const url = req.originalUrl;

  try {
    // search for corresponding html
    let indexPath = join(__dirname, req.baseUrl, "index.html");
    if (!existsSync(indexPath)) {
      indexPath = join(__dirname, "notFound/index.html");
    }
    const template = readFileSync(indexPath, "utf-8");

    // build html
    const html = await vite.transformIndexHtml(url, template);

    // serve html
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch (e) {
    next(e);
  }
});

app.listen(port, () => {
  console.log(`client server listening on http://localhost:${port}`);
});
