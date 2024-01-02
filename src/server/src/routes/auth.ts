import { ensureLoggedIn, ensureLoggedOut } from "connect-ensure-login";
import express, { RequestHandler } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import crypto from "crypto";
import { default as db } from "@/db";

const {
  SERVER_MODE
} = process.env;

export const MODES = {
  Local: "local", // use local resources
  ApiOnly: "api-only", // skip authentication
};

function emptyMiddleware (): RequestHandler {
  return (req, res, next) => {
    next();
  };
}

function ensureAuthentication (): RequestHandler {
  return (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.sendStatus(401);
    } else {
      next();
    }
  };
}

export const ensureSessionAndRedirect = SERVER_MODE === MODES.ApiOnly ? emptyMiddleware() : ensureLoggedIn();
export const ensureSession = SERVER_MODE === MODES.ApiOnly ? emptyMiddleware() : ensureAuthentication();
export const preventSession = SERVER_MODE === MODES.ApiOnly ? emptyMiddleware() : ensureLoggedOut({ redirectTo: "/app" });

const router = express.Router();

passport.use("local", new LocalStrategy(function verify(username, password, callback) {
  console.log(`🔎 Verifying ${username}`);

  type UserRow = {
    id: number,
    username: string,
    hashed_password: Buffer,
    salt: Buffer
  };

  db.query<UserRow>("SELECT * FROM users WHERE username = $1", [ username ], (err, result) => {
    const [row] = result.rows;
    if (err) { return callback(err); }
    if (!row) { return callback(null, false, { message: "Incorrect username or password." }); }

    console.log(`Found ${username}`);
    // todo: support virtual users and tokens

    crypto.pbkdf2(password, row.salt, 310000, 32, "sha256", function(err, hashedPassword) {
      if (err) { return callback(err); }
      if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
        return callback(null, false, { message: "Incorrect username or password." });
      }
      console.log(`✅ Verified ${username}`);
      return callback(null, row);
    });
  });
}));

export type AuthenticatedUser = {
  id: string,
  username: string
};

passport.serializeUser(function(user: unknown, callback) {
  process.nextTick(function() {
    callback(null, { id: (user as AuthenticatedUser).id, username: (user as AuthenticatedUser).username });
  });
});

passport.deserializeUser(function(user: AuthenticatedUser, callback) {
  process.nextTick(function() {
    return callback(null, user);
  });
});

router.post("/login/password", passport.authenticate("local", {
  successRedirect: "/app",
  failureMessage: true
}));

router.post("/logout", function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect("/");
  });
});

export default router;
