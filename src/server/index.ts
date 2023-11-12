import env from "./src/env.js";
import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const usedUnusedImports = {
  env
};

const app = express();

console.log("foo");

const {
  NODE_ENV,
  SERVER_PORT,
  SECRET
} = process.env;
console.log(SECRET);

console.log(`Configuration: SERVER_PORT ${SERVER_PORT}`);
console.log(`Configuration: NODE_ENV ${NODE_ENV}`);

const port = SERVER_PORT || 3000;
// todo
const publicPath = path.join(dirname(fileURLToPath(import.meta.url)), "public");

console.log(`Using: Port ${port}`);
console.log(`Using: public path ${publicPath}`);

if (NODE_ENV === "production") {
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
