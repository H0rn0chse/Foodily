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
import authRouter, { ensureSession } from "@/routes/auth";
import apiRouter, { apiDoc } from "@/routes/api";
import { serve as swaggerServe, setup as swaggerSetup, type SwaggerUiOptions } from "swagger-ui-express";
import { doubleCsrf } from "csrf-csrf";
import { authEnabled, uiEnabled } from "@/serverConfig";

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const usedUnusedImports = {
  env
};

const app = express();

const {
  SERVER_PORT,
  NODE_ENV,
  CSRF_SECRET
} = process.env;

const port = SERVER_PORT || 3000;

app.set("view engine", "html");

// sec headers
app.use(helmet({
  strictTransportSecurity: false,
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      scriptSrc: ["'self' 'unsafe-eval'"],
    }
  }
}));

if (NODE_ENV === "production") {
  app.use(helmet.strictTransportSecurity());
}
// logger
app.use(morgan("dev"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser("cookieSecret"));

// Authentication & CSRF
if (authEnabled) {
  console.log("Session enabled");
  const {
    generateCsrfToken,
    doubleCsrfProtection
  } = doubleCsrf({
    getSecret: () => CSRF_SECRET || "csrf-secret-change-in-production",
    cookieName: "x-csrf-token",
    cookieOptions: {
      sameSite: "lax",
      secure: NODE_ENV === "production",
      httpOnly: true
    },
    size: 64,
    ignoredMethods: ["GET", "HEAD", "OPTIONS"],
    getSessionIdentifier: (req) => req.session?.id || ""
  });

  app.use(session({
    secret: "sessionSecret",
    resave: false,
    saveUninitialized: false,
  // store: new SQLiteStore({ db: "sessions.db", dir: "./var/db" })
  }));

  app.use(passport.authenticate("session"));

  // CSRF token endpoint (must be before CSRF protection middleware)
  app.get("/csrf-token", (req, res) => {
    const csrfToken = generateCsrfToken(req, res);
    res.json({ csrfToken });
  });

  // Apply CSRF protection to all mutating requests
  app.use(doubleCsrfProtection);

  app.use("/", authRouter);
} else {
  // set static test user for authentication
  app.use((req, res, next) => {
    req.user = {
      id: "1",
      username: "admin"
    };
    next();
  });

  // No-op CSRF token endpoint when auth is disabled
  app.get("/csrf-token", (req, res) => {
    res.json({ csrfToken: "no-auth-no-csrf" });
  });
}

app.use("/api", ensureSession, apiRouter);

// docs
const swaggerUiOptions: SwaggerUiOptions = {
  swaggerOptions: {
    tryItOutEnabled: true,
    operationsSorter: "alpha",
    tagsSorter: "alpha"
  },
  customCss: `
    .scheme-container {display: none}
    .operation-servers {display: none}
  `
};

app.use("/docs", swaggerServe, swaggerSetup(apiDoc, swaggerUiOptions));

// UI assets
if (uiEnabled) {
  app.use("/", indexRouter);
}

// 404 handler
if (uiEnabled) {
  // catch 404 and forward to error handler
  app.use((req, res) => {
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
}

app.listen(port, () => {
  console.log(`🔊 Server listening on http://localhost:${port}`);
});
