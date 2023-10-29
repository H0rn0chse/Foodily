import "dotenv/config";
import express from "express";
import path from "path";

const app = express();
const port = 3000;

const { NODE_ENV, PUBLIC_ASSETS } = process.env;

if (NODE_ENV === "production" && typeof PUBLIC_ASSETS === "string") {
  const publicPath = path.join(__dirname, "../../../", PUBLIC_ASSETS);
  console.log(publicPath);
  app.use(express.static(publicPath));
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api", (req, res) => {
  res.send("api call-foo!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
