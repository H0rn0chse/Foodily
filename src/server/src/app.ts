// first apply env
import env from "@/env";

import express from "express";
import session from "express-session";
import passport from "passport";
import bodyParser from "body-parser";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import indexRouter from "@/routes/index";
import authRouter, { MODES, ensureSession } from "@/routes/auth";
import apiRouter from "@/routes/api";

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const usedUnusedImports = {
  env
};

const app = express();

const {
  SERVER_PORT,
  SERVER_MODE
} = process.env;

const port = SERVER_PORT || 3000;

app.set("view engine", "html");

// sec headers
app.use(helmet());
// logger
app.use(morgan("dev"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser("cookieSecret"));

// skip session management for local development
if (SERVER_MODE !== MODES.ApiOnly) {
  console.log("Session enabled");
  app.use(session({
    secret: "sessionSecret",
    resave: false,
    saveUninitialized: false,
  // store: new SQLiteStore({ db: "sessions.db", dir: "./var/db" })
  }));

  app.use(passport.authenticate("session"));
  app.use("/", authRouter);
}

app.use("/api", ensureSession, apiRouter);

// skip ui resources for local development
if (SERVER_MODE !== MODES.ApiOnly) {
  app.use("/", indexRouter);
}

// skip 404 for local development
if (SERVER_MODE !== MODES.ApiOnly) {
  // catch 404 and forward to error handler
  app.use((req, res) => {
    res.status(404);

    // respond with html page
    if (req.accepts("html")) {
      // res.sendStatus(404);
      res.redirect("/notFound");
      // res.render("404", { url: req.url });
      return;
    }

    // respond with json
    if (req.accepts("json")) {
      res.json({ error: "Not found" });
      return;
    }

    // default to plain-text. send()
    res.type("txt").send("Not found");
  });
}

app.listen(port, () => {
  console.log(`🔊 Server listening on http://localhost:${port}`);
});
