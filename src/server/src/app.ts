// first apply env
import env from "./env.js";

import express from "express";
import session from "express-session";
import passport from "passport";
import bodyParser from "body-parser";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import indexRouter from "./routes/index.js";
import authRouter from "./routes/auth.js";

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const usedUnusedImports = {
  env
};

const app = express();

const {
  SERVER_PORT
} = process.env;

const port = SERVER_PORT || 3000;

app.set("view engine", "html");

app.use(morgan("dev"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: false,
  // store: new SQLiteStore({ db: "sessions.db", dir: "./var/db" })
}));
app.use(passport.authenticate("session"));

app.use("/", authRouter);
app.use("/", indexRouter);

app.get("/api", (req, res) => {
  res.send("api call-foo!");
});


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

app.listen(port, () => {
  console.log(`✅ Server listening on port ${port}`);
});
