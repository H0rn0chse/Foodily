import { ensureLoggedIn, ensureLoggedOut } from "connect-ensure-login";
import express, { RequestHandler } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import argon2 from "argon2";
import { default as db } from "@/db";
import { rateLimit } from "express-rate-limit";

const {
  SERVER_MODE
} = process.env;

export const MODES = {
  /**
   * Use local resources and authentication.
   * This is the default mode and should be used for production deployments.
   */
  Local: "local",
  /**
   * Use local resources but skip authentication.
   * This is useful for development and testing when you want to bypass login.
   */
  ApiOnly: "api-only",
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

// --- Login attempt tracking ---
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function getLoginAttemptKey(username: string): string {
  return username.toLowerCase().trim();
}

function isAccountLocked(username: string): boolean {
  const key = getLoginAttemptKey(username);
  const record = loginAttempts.get(key);
  if (!record) return false;
  if (record.lockedUntil > Date.now()) return true;
  // Lockout expired, reset
  loginAttempts.delete(key);
  return false;
}

function recordFailedAttempt(username: string): void {
  const key = getLoginAttemptKey(username);
  const record = loginAttempts.get(key) || { count: 0, lockedUntil: 0 };
  record.count += 1;
  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    console.log(`🔒 Account locked for ${username} due to ${record.count} failed attempts`);
  }
  loginAttempts.set(key, record);
}

function resetLoginAttempts(username: string): void {
  loginAttempts.delete(getLoginAttemptKey(username));
}

// --- Rate limiter for login route ---
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts from this IP, please try again later." }
});

passport.use("local", new LocalStrategy(function verify(username, password, callback) {
  console.log(`🔎 Verifying ${username}`);

  // Check if account is locked
  if (isAccountLocked(username)) {
    console.log(`🔒 Login attempt blocked for locked account: ${username}`);
    return callback(null, false, { message: "Account temporarily locked due to too many failed attempts. Try again later." });
  }

  type UserRow = {
    id: number,
    username: string,
    hashed_password: string,
    salt: Buffer
  };
  db.query<UserRow>(
    `SELECT *
    FROM users
    WHERE owner_id IS NULL
      AND username=$1`,
    [
      username
    ],
    (err, result) => {
      const [row] = result.rows;
      if (err) { return callback(err); }
      if (!row) {
        recordFailedAttempt(username);
        return callback(null, false, { message: "Incorrect username or password." });
      }

      console.log(`Found ${username}`);
      // todo: support virtual users and tokens

      argon2.verify(row.hashed_password, password)
        .then((match) => {
          if (!match) {
            recordFailedAttempt(username);
            return callback(null, false, { message: "Incorrect username or password." });
          }
          console.log(`✅ Verified ${username}`);
          resetLoginAttempts(username);
          return callback(null, row);
        })
        .catch((err) => callback(err));
    }
  );
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

router.post("/login/password", loginRateLimiter, passport.authenticate("local", {
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
